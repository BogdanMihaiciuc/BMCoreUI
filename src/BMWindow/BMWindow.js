// @ts-check

import {YES, NO, BMExtend, BMCopyProperties} from '../Core/BMCoreUI'
import {BMPointMake} from '../Core/BMPoint'
import {BMRectMake, BMRectMakeWithNodeFrame} from '../Core/BMRect'
import {BMAnimateWithBlock, BMAnimationContextGetCurrent, BMAnimationContextEnableWebAnimations, __BMVelocityAnimate, BMHook} from '../Core/BMAnimationContext'
import {BMView} from '../BMView/BMView_v2.5'
import {BMLayoutOrientation} from '../BMView/BMLayoutSizeClass'
import { BMKeyboardShortcutModifier } from './BMKeyboardShortcut'
import { BMSizeMake } from '../Core/BMSize'

//@ts-check
// @type BMWindowOverlay extends BMView

/**
 * Window overlays are objects that are created by windows to mask the content below the window
 * and allow clicking outside a window to close it.
 */
class BMWindowOverlay extends BMView {

	/**
	 * Initializes this window overlay for the given window.
	 * @param window <BMWindow>			The window.
	 * {
	 * 	@param modal <Boolean, nullable>		Defaults to `YES`. If set to `YES`, the blocker will prevent events from reaching elements behind it.
	 * 											When set to `NO`, it will allow events to propagate to those elements.
	 * }
	 * @return <BMWindowOverlay>		This window overlay.
	 */
	initWithWindow(window, args) {
		this._window = window;

		let modal = (args && 'modal' in args) ? args.modal : YES;

		let node = document.createElement('div');
		node.className = 'BMWindowBlocker';
		// TODO: This isn't good for subclasses; consider using a class instead
		BMCopyProperties(node.style, {
			opacity: 0,
			display: 'none',
			backdropFilter: modal ? 'blur(15px)' : 'none',
			webkitBackdropFilter: modal ? 'blur(15px)' : 'none'
		});

		if (!modal) {
			node.style.pointerEvents = 'none';
			node.classList.add('BMWindowBlockerNonModal');
		}
		
		if (modal) node.addEventListener('click', event => {
			// Do not close if the click originated from inside the window.
			if (event.target != node) return;

			var shouldClose = YES;
			
			if (window.delegate && window.delegate.windowShouldClose) {
				shouldClose = window.delegate.windowShouldClose(window);
			}
			
			var targetRect = undefined;
			var targetNode = undefined;
			
			if (shouldClose) {
				// Don't ask the delegate for an anchor if it has been set via properties
				if (window._anchorPoint || window._anchorRect || window._anchorNode) {
					window.dismissAnimated(YES);
				}
				else {
					if (window.delegate && window.delegate.rectForDismissedWindow) {
						targetRect = window.delegate.rectForDismissedWindow(window);
					}
					
					if (window.delegate && window.delegate.DOMNodeForDismissedWindow) {
						targetNode = window.delegate.DOMNodeForDismissedWindow(window);
					}
					
					window.dismissAnimated(YES, {toRect: targetRect, toNode: targetNode});
				}
			}
		});

		return super.initWithDOMNode(node);
	}

	// @override - BMView
	frameForDescendant(descendant) {
		return this._window.frameForDescendant(descendant);
	}

	// @override - BMView
	_registerLayout() {
		if (this._window._visible) {
			super._registerLayout();
		}
		else {
			this._awaitsLayout = YES;
		}
	}

	/**
	 * Invoked when this overlay's window will become visible.
	 */
	_windowWillAppear() {
		if (this._awaitsLayout) {
			this._awaitsLayout = NO;
			super._registerLayout();
			this.layoutQueue.dequeue();
		}
	}


    // @override - BMView
    get _currentViewport() {
        if (this._requiredViewport) return this._requiredViewport;

        let viewport = new BMViewport;
        viewport.init();

        viewport._width = this._window._fullScreen ? window.innerWidth : this._window.frame.size.width;
        viewport._height = this._window._fullScreen ? window.innerHeight : this._window.frame.size.height;
        viewport._diagonal = Math.sqrt(Math.pow(viewport._width, 2) + Math.pow(viewport._height, 2));
        viewport._orientation = viewport._width >= viewport._height ? BMLayoutOrientation.Landscape : BMLayoutOrientation.Portrait;
        viewport._surfaceArea = viewport._width * viewport._height;

        return viewport;
    }

}

// @endtype

// @type BMWindow extends BMView

var _BMWindowAnimationDurationDefault = 400;
var _BMWindowAnimationEasingDefault = 'easeInOutQuart';
const _BMWindowAnimationEasingIncomingDefault = 'easeOutQuart';
const _BMWindowAnimationDurationIncomingDefault = 200;
const _BMWindowAnimationEasingOutgoingDefault = 'easeInQuart';
const _BMWindowAnimationDurationOutgoingDefault = 200;

const BM_WINDOW_SHOWCASE_MAX_ITERATIONS = 5000;
var BM_WINDOW_Z_INDEX_MAX = 2007;

/**
 * A window is an object that manages the display and lifecycle of a popup window.
 */
export function BMWindow() {}; // <constructor>

// Represents the current key window
BMWindow._keyWindow = undefined;

// An array containing all created non-modal windows
BMWindow._windows = [];

// An array containing all minimized non-modal window DOM nodes
BMWindow._minimizedWindows = [];

/**
 * Minimizes all non-minimized windows.
 * @param animated <Boolean, nullable>			Defaults to `YES`. If set to `YES`, this change will be animated.
 */
BMWindow.minimizeAllAnimated = function (animated) {
	for (let window of this._windows.slice()) {
		if (!window._minimizedWindow) {
			window.minimizeAnimated(animated);
		}
	}
}

/**
 * Restores all minimized windows.
 * @param animated <Boolean, nullable>			Defaults to `YES`. If set to `YES`, this change will be animated.
 */
BMWindow.restoreAllAnimated = function (animated) {
	for (let window of this._windows.slice()) {
		if (window._minimizedWindow) {
			window.restoreAnimated(animated);
		}
	}
}

/**
 * Reveals all hidden windows.
 */
BMWindow.revealAll = function () {
	for (let window of this._windows.slice()) {
		if (window._hidden) {
			window.reveal();
		}
	}
}

/**
 * Hides all windows.
 */
BMWindow.hideAll = function () {
	for (let window of this._windows.slice()) {
		if (!window._hidden) {
			window.hide();
		}
	}
}

/**
 * Set to `YES` while showcase mode is enabled.
 */
BMWindow._isShowcasing = NO;

// Adds a global handler that listens for cmd + alt + a to enter or exit showcase
document.addEventListener('keydown', event => {
	if (event.which == 69 && event.altKey && (navigator.userAgent.includes('Macintosh') ? event.metaKey : event.ctrlKey)) {
		if (BMWindow._isShowcasing) {
			BMWindow.exitShowcase();
		}
		else {
			BMWindow.enterShowcase();
		}
	}
}, YES);

BMWindow._showcaseElements = [];

/**
 * Registers an element that will participate in the window showcase.
 * @param element <AnyObject>		The showcase element.
 */
BMWindow.registerShowcaseElement = function (element) {
	BMWindow._showcaseElements.push(element);
}


/**
 * Unregisters a showcase element.
 * @param element <AnyObject>		The showcase element.
 */
BMWindow.unregisterShowcaseElement = function (element) {
	BMWindow._showcaseElements.splice(BMWindow._showcaseElements.indexOf(element), 1);
}

/**
 * Enters showcase mode, making it easy to select between open windows.
 */
BMWindow.enterShowcase = async function () {
	if (BMWindow._isShowcasing) return;

	document.body.style.backgroundColor = 'rgb(60, 60, 60)';

	BMWindow._isShowcasing = YES;

	document.body.addEventListener('click', BMWindow.exitShowcase);

	let openWindows = BMWindow._windows.filter(value => !value._minimizedWindow);

	let viewportFrame = BMRectMake(0, 0, window.innerWidth, window.innerHeight);

	for (let element of BMWindow._showcaseElements) {
		openWindows.unshift(element);
	}

	openWindows.forEach(window => {
		window.node.classList.add('BMWindowShowcaseWindow');

		let selector = document.createElement('div');
		selector.classList.add('BMWindowShowcaseWindowSelector');
		selector.addEventListener('click', event => {
			if (window.becomeKeyWindow) {
				window.becomeKeyWindow();
			}
			else {
				BMWindow.hideAll();
			}
			BMWindow.exitShowcase();
		});

		window.node.appendChild(selector);
	});

	let sourceRects = openWindows.map(window => window._fullScreen ? viewportFrame.copy() : window.frame.copy());
	let originalRects = sourceRects.map(rect => rect.copy());
	let overlap;

	let bounds = viewportFrame.copy();

	for (let i = 0; i < BM_WINDOW_SHOWCASE_MAX_ITERATIONS; i++) {

		for (let j = 0; j < sourceRects.length; j++) {
			for (let k = 0; k < sourceRects.length; k++) {
				if (j != k && sourceRects[j].intersectsRect(sourceRects[k])) {
					overlap = YES;
	
					let rect1 = sourceRects[j];
					let rect2 = sourceRects[k];

					let difference = rect2.center.pointBySubtractingPoint(rect1.center);

					if (!difference.x && !difference.y) {
						difference.x = Math.random() * 2 - 1;
						difference.y = Math.random() * 2 - 1;
					}

					if (bounds.height / bounds.width > viewportFrame.height / viewportFrame.width) {
						difference.x = difference.x * 2;
					}
					else {
						difference.y = difference.y * 2;
					}

					let length = Math.sqrt(difference.x * difference.x + difference.y * difference.y);
					difference.x = difference.x * 20 / length;
					difference.y = difference.y * 20 / length;

					rect1.offsetWithX(-difference.x, {y: -difference.y});
					rect2.offsetWithX(difference.x, {y: difference.y});

					bounds = bounds.rectByUnionWithRect(rect1).rectByUnionWithRect(rect2);

				}
			}
		}

		if (!overlap) break;
	}

	let scale = Math.min(1, viewportFrame.width / bounds.width, viewportFrame.height / bounds.height);

	for (let rect of sourceRects) {
		rect.offset(-bounds.left, -bounds.top);

		rect.origin.x = rect.origin.x * scale;
		rect.origin.y = rect.origin.y * scale;

		rect.size.width = rect.size.width * scale;
		rect.size.height = rect.size.height * scale;
	}

	// This method appears to be faster when used with web animations, so they are always enabled here when available
	BMAnimateWithBlock(() => {
		BMAnimationContextEnableWebAnimations();

		/*let header = document.getElementById('twStudioHeader');
		let headerController = BMAnimationContextGetCurrent().controllerForObject(header, {node: header});
		headerController.registerBuiltInProperty('translateY', {withValue: -header.offsetHeight + 'px'});*/

		for (let i = 0; i < sourceRects.length; i++) {
			let transformRect = originalRects[i].rectWithTransformToRect(sourceRects[i]);
	
			let controller = BMAnimationContextGetCurrent().controllerForObject(openWindows[i].node, {node: openWindows[i].node});
			controller.registerBuiltInPropertiesWithDictionary({
				translateX: transformRect.origin.x + 'px',
				translateY: transformRect.origin.y + 'px',
				scaleX: transformRect.size.width,
				scaleY: transformRect.size.height,
				translateZ: 0
			});
		}
	}, {duration: 300, easing: 'easeInOutQuad', complete: x => BMWindow.revealAll()});

	document.body.addEventListener('wheel', BMWindow._wheelHandler, YES);
	
}

/**
 * A mousewheel handler that is attached to the document during showcase mode.
 * @param event <WheelEvent>		The event.
 */
BMWindow._wheelHandler = function (event) {
	if (event.deltaY < 0) {
		BMWindow.exitShowcase();
	}
}

/**
 * Exits showcase mode.
 */
BMWindow.exitShowcase = function (event) {
	if (event && event.target != document.body) return;

	BMWindow._isShowcasing = NO;
	
	document.body.removeEventListener('click', BMWindow.exitShowcase);
	document.body.removeEventListener('wheel', BMWindow._wheelHandler, YES);

	let openWindows = BMWindow._windows.filter(value => !value._minimizedWindow);
	/*let twStudio = document.querySelector('#twStudioBody');
	let pageWindow = {node: twStudio};
	openWindows.unshift(pageWindow);*/

	for (let element of BMWindow._showcaseElements) {
		openWindows.unshift(element);
	}

	openWindows.forEach(window => {
		window.node.classList.remove('BMWindowShowcaseWindow');

		let selector = window.node.querySelector('.BMWindowShowcaseWindowSelector');
		if (selector) selector.remove();
	});

	BMAnimateWithBlock(() => {
		BMAnimationContextEnableWebAnimations();

		/*let header = document.getElementById('twStudioHeader');
		let headerController = BMAnimationContextGetCurrent().controllerForObject(header, {node: header});
		headerController.registerBuiltInProperty('translateY', {withValue: '0px'});*/

		for (let i = 0; i < openWindows.length; i++) {
			let controller = BMAnimationContextGetCurrent().controllerForObject(openWindows[i].node, {node: openWindows[i].node});
			controller.registerBuiltInPropertiesWithDictionary({
				translateX: '0px',
				translateY: '0px',
				scaleX: 1,
				scaleY: 1,
				translateZ: 0
			});
		}
	}, {duration: 300, easing: 'easeInOutQuad', complete: x => openWindows[0].node.style.transform = 'none'});
}

BMWindow.prototype = BMExtend(Object.create(BMView.prototype), {
	
	/**
	 * An optional delegate which this window may notify of key events.
	 */
	delegate: undefined, // <BMWindowDelegate, nullable>
	
	/**
	 * The window's frame, which represents its on-screen area.
	 */
	_frame: undefined, // <BMRect>

	// @override - BMView
	get contentNode() {
		return this.content;
	},

	/**
	 * The view to which subviews should be added.
	 */
	get contentView() { // <BMView>
		return this;
	},

	get frame() {
		return this._frame;
	},
	set frame(frame) {
		if (this._fullScreen) return;

		frame = frame.integralRect;

		this._frame = frame.copy();
		
		BMCopyProperties(this._window.style, {
			left: frame.origin.x + 'px',
			top: frame.origin.y + 'px',
			width: frame.size.width + 'px',
			height: frame.size.height + 'px'
		});

		this.leftConstraint.constant = frame.origin.x;
		this.topConstraint.constant = frame.origin.y;
		this.widthConstraint.constant = frame.size.width;
		this.heightConstraint.constant = frame.size.height;
	},
	
	/**
	 * The window DOM node.
	 */
	_window: undefined, // <DOMNode>
	
	/**
	 * The window toolbar DOM node.
	 */
	_toolbar: undefined, // <DOMNode>
	get toolbar() {
		return this._toolbar;
	},

	/**
	 * The window overlay.
	 */
	_overlay: undefined, // <BMWindowOverlay>
	
	/**
	 * The modal blocker DOM node.
	 */
	_blocker: undefined, // <DOMNode>
	
	/**
	 * The DOM node in which the window contents should be added.
	 */
	_content: undefined, // <DOMNode>
	get content() {
		return this._content;
	},

	/**
	 * A string that is used for when this window is minimized.
	 */
	_title: 'New Window', // <String>
	get title() {
		return this._title;
	},
	set title(title) {
		this._title = title;
	},

    /**
     * The point from which this popover should originate when open or dimissed with an animation.
	 * Setting this property causes the `anchorNode` and `anchorRect` properties to be set to `undefined`.
     */
    _anchorPoint: undefined, // <BMPoint, nullable>

    get anchorPoint() {
        return this._anchorPoint;
    },
    set anchorPoint(point) {
		this._anchorPoint = point && point.copy();
		this.anchorNode = undefined;
		this._anchorRect = undefined;
    },

    /**
     * The rect from which this popover should originate when open or dimissed with an animation.
	 * Setting this property causes the `anchorNode` and `anchorPoint` properties to be set to `undefined`.
     */
    _anchorRect: undefined, // <BMRect, nullable>

    get anchorRect() {
        return this._anchorRect;
    },
    set anchorRect(rect) {
		this._anchorRect = rect && rect.copy();
		this.anchorNode = undefined;
		this._anchorPoint = undefined;
    },


    /**
     * The node from which this popover should originate when open or dimissed with an animation.
	 * Setting this property causes the `anchorPoint` and `anchorRect` properties to be set to `undefined`.
     */
    _anchorNode: undefined, // <DOMNode, nullable>

    get anchorNode() {
        return this._anchorNode;
    },
    set anchorNode(node) {
		this._anchorNode = node;
		this._anchorPoint = undefined;
		this._anchorRect = undefined;
    },
	
	/**
	 * Set to `YES` while this window is visible.
	 */
	_visible: NO, // <Boolean>
	
	/**
	 * Set to `YES` while this window is visible.
	 */
	get isVisible() { // <Boolean>
		return this._visible;
	},
	
	/**
	 * Set to `YES` while this window is full screen.
	 */
	_fullScreen: NO, // <Boolean>
	
	/**
	 * Set to `YES` while this window is full screen.
	 */
	get isFullScreen() { // <Boolean>
		return this._fullScreen;
	},

	/**
	 * Set to `YES` if this window is modal.
	 */
	_modal: NO, // <Boolean>

	/**
	 * Set to `YES` if this window is modal.
	 */
	get isModal() {
		return this._modal;
	},

	/**
	 * Set to `YES` if this window is a tool window.
	 */
	_toolWindow: NO, // <Boolean>

	/**
	 * An array containing the tool windows associated with this window.
	 */
	_toolWindows: undefined, // <[BMToolWindow]>

	/**
	 * The keyboard shortcuts that have been registered to this window.
	 */
	_keyboardShortcuts: undefined, // <[BMKeyboardShortcut]>
	
	/**
	 * Initializes this window with the given screen area.
	 * @param frame <BMRect>					The frame.
	 * {
	 *	@param toolbar <Boolean, nullable>		Defaults to `YES`. If set to `YES`, the window will have a toolbar.
	 * 	@param modal <Boolean, nullable>		Defaults to `YES`. If set to `YES`, the window will be modal, blocking content behind it.
	 * 											When set to `NO`, it will be possible to interact with content that is not obstructed by this window.
	 * }
	 * @return <BMWindow>						This window.
	 */
	initWithFrame: function (frame, args) {
		frame = frame.integralRect;

		let modal = (args && 'modal' in args) ? args.modal : YES;

		this._toolWindows = [];
		this._keyboardShortcuts = [];

		this._overlay = (new BMWindowOverlay).initWithWindow(this, {modal});
		this._blocker = this._overlay.node;
		
		let node = document.createElement('div');
		this._window = node;
		node.className = 'BMWindow';

		BMCopyProperties(node.style, {
			opacity: 0,
			display: 'none'
		});

		this._modal = modal;

		if (!modal) {
			// BMCopyProperties(node.style, {
			// 	pointerEvents: 'none',
			// 	backdropFilter: modal ? 'none' : 'blur(15px)',
			// 	webkitBackdropFilter: modal ? 'none' : 'blur(15px)'
			// });

			// In non-modal mode, clicking the window should cause it to become the key window
			if (!this._toolWindow) {
				node.addEventListener('mousedown', event => {
					if (!this.isKeyWindow) this.becomeKeyWindow();
				}, YES);

				node.classList.add('BMWindowInactive');

				BMWindow._windows.push(this);
			}

			node.classList.add('BMNonModalWindow');
		}
		else {
			node.classList.add('BMModalWindow');
		}
		
		this._content = document.createElement('div');
		this._content.className = 'BMWindowContent';
		node.appendChild(this._content);
		
		var withToolbar = (!args || args.toolbar === undefined) ? YES : args.toolbar;
		
		if (withToolbar) {
			this._toolbar = document.createElement('div');
			this._toolbar.className = 'BMWindowToolbar';
			node.appendChild(this._toolbar);
		}
		else {
			this._content.className = 'BMWindowContent BMWindowFullContent';
		}
		
		document.body.appendChild(this._blocker);
		BMView.prototype.initWithDOMNode.call(this, node);
		this._overlay.addSubview(this);
		document.body.appendChild(node);

		this.leftConstraint = this.left.equalTo(this._overlay.left, {plus: frame.origin.x, priority: 500});
		this.topConstraint = this.top.equalTo(this._overlay.top, {plus: frame.origin.y, priority: 500});
		this.widthConstraint = this.width.equalTo(frame.size.width, {priority: 750});
		this.heightConstraint = this.height.equalTo(frame.size.height, {priority: 750});
		this.frame = frame;

		this.leftConstraint.isActive = YES;
		this.topConstraint.isActive = YES;
		this.widthConstraint.isActive = YES;
		this.heightConstraint.isActive = YES;

		if (!modal && withToolbar) {
			// In non-modal mode, allow the toolbar to move the window
			this.maxLeftConstraint = this.left.greaterThanOrEqualTo(0);
			this.maxTopConstraint = this.top.greaterThanOrEqualTo(0);

			this.maxRightConstraint = this.right.lessThanOrEqualTo(window.innerWidth);
			this.maxBottomConstraint = this.bottom.lessThanOrEqualTo(window.innerHeight);

			this.maxLeftConstraint.isActive = YES;
			this.maxTopConstraint.isActive = YES;

			this.maxRightConstraint.isActive = YES;
			this.maxBottomConstraint.isActive = YES;

			window.addEventListener('resize', this._boundViewportDidResize = this._viewportDidResize.bind(this));

			// Initialize dragging touch events for the toolbar
			this._toolbar.addEventListener('mousedown', event => {
				// Don't process events originating from children of the toolbar
				if (event.target != this._toolbar) return;

				// Full screen windows cannot be moved
				if (this._fullScreen) return;

				this._dragged = YES;
	
				this._position = BMPointMake(this.node.offsetLeft, this.node.offsetTop);
				let lastPosition = BMPointMake(event.clientX, event.clientY);
	
				let mouseMoveEventListener = event => {
					let position = BMPointMake(event.clientX, event.clientY);
					const newPosition = BMPointMake(this._position.x + position.x - lastPosition.x, this._position.y + position.y - lastPosition.y);

					// Check if the window can move
					let canMove = YES;
					if (this.delegate && this.delegate.windowShouldMove) {
						canMove = this.delegate.windowShouldMove(this, newPosition);
					}
					if (!canMove) return;

					this.leftConstraint.constant = this._position.x + position.x - lastPosition.x;
					this.topConstraint.constant = this._position.y + position.y - lastPosition.y;
					this._position = newPosition;
					lastPosition = position;
					this.layout();
					event.preventDefault();
				};
	
				let mouseUpEventListener = event => {
					window.removeEventListener('mousemove', mouseMoveEventListener, YES);
					window.removeEventListener('mouseup', mouseUpEventListener, YES);
				}
	
				window.addEventListener('mousemove', mouseMoveEventListener, YES);
				window.addEventListener('mouseup', mouseUpEventListener, YES);
	
				event.preventDefault();
			});
	
			let touchDragPoint;
	
			this._toolbar.addEventListener('touchstart', /** @type {TouchEvent} */ event => {
				// If there is already a drag in progress, don't process this new event
				if (typeof touchDragPoint !== 'undefined') {
					return;
				}

				// Don't process events originating from children of the toolbar
				if (event.target != this._toolbar) return;

				// Full screen windows cannot be moved
				if (this._fullScreen) return;
	
				// Only use the first touch point
				touchDragPoint = event.changedTouches[0].identifier;
				this._dragged = YES;
	
				this._position = BMPointMake(this.node.offsetLeft, this.node.offsetTop);
				let lastPosition = BMPointMake(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
	
				let mouseMoveEventListener = event => {
					// Look for the actively tracked touch point
					let touch;
					for (let changedTouch of event.changedTouches) {
						if (changedTouch.identifier == touchDragPoint) {
							touch = changedTouch;
							break;
						}
					}
	
					// If the actively tracked touch point did not move, do not process this event
					if (!touch) return;
	
					let position = BMPointMake(touch.clientX, touch.clientY);
					const newPosition = BMPointMake(this._position.x + position.x - lastPosition.x, this._position.y + position.y - lastPosition.y);

					// Check if the window can move
					let canMove = YES;
					if (this.delegate && this.delegate.windowShouldMove) {
						canMove = this.delegate.windowShouldMove(this, newPosition);
					}
					if (!canMove) return;

					this.leftConstraint.constant = this._position.x + position.x - lastPosition.x;
					this.topConstraint.constant = this._position.y + position.y - lastPosition.y;
					this._position = newPosition;
					lastPosition = position;
					this.layout();
					event.preventDefault();
				};
	
				let mouseUpEventListener = event => {
					touchDragPoint = undefined;
					window.removeEventListener('touchmove', mouseMoveEventListener);
					window.removeEventListener('touchend', mouseUpEventListener);
					window.removeEventListener('touchcancel', mouseUpEventListener);
				}
	
				window.addEventListener('touchmove', mouseMoveEventListener);
				window.addEventListener('touchend', mouseUpEventListener);
				window.removeEventListener('touchcancel', mouseUpEventListener);
	
				event.preventDefault();
			});

			this._toolbar.addEventListener('dbclick', event => {
				this.minimizeAnimated(YES);
			});

			this._toolbar.addEventListener('wheel', /** @param {WheelEvent} event */ event => {
				if (event.deltaY > 0) {
					BMWindow.enterShowcase();
				}
			});

			// Also create a drag handle to resize the window
			let dragHandle = this._dragHandle = document.createElement('div');
			dragHandle.className = 'material-icons BMWindowDragHandle';
			dragHandle.innerText = 'dehaze';
			dragHandle.style.cursor = 'nwse-resize';
			node.appendChild(dragHandle);
			
			
			// Initialize dragging touch events for the drag handler
			dragHandle.addEventListener('mousedown', event => {

				// Full screen windows cannot be resized
				if (this._fullScreen) return;

				this._dragged = YES;
	
				this._position = BMPointMake(this.widthConstraint.constant, this.heightConstraint.constant);
				let lastPosition = BMPointMake(event.clientX, event.clientY);
	
				let mouseMoveEventListener = event => {
					let position = BMPointMake(event.clientX, event.clientY);

					const newWidth = this._position.x + position.x - lastPosition.x;
					const newHeight = this._position.y + position.y - lastPosition.y;

					this._position = BMPointMake(newWidth, newHeight);
					lastPosition = position;

					let canResize = YES;
					if (this.delegate && this.delegate.windowShouldResize) {
						canResize = this.delegate.windowShouldResize(this, BMSizeMake(newWidth, newHeight));
					}
					if (!canResize) return;

					this.widthConstraint.constant = newWidth;
					this.heightConstraint.constant = newHeight;
					this.frame.size.width = this.widthConstraint.constant;
					this.frame.size.height = this.heightConstraint.constant;
					this.layout();
					if (this.delegate && this.delegate.windowDidResize) {
						this.delegate.windowDidResize(this, {toSize: this.frame.size});
					}
					event.preventDefault();
				};

				let mask = document.createElement('div');
				mask.className = 'BMLayoutGuideMask';
				mask.style.cursor = 'nwse-resize';
				document.body.appendChild(mask);
	
				let mouseUpEventListener = event => {
					window.removeEventListener('mousemove', mouseMoveEventListener, YES);
					window.removeEventListener('mouseup', mouseUpEventListener, YES);
					mask.remove();
				}
	
				window.addEventListener('mousemove', mouseMoveEventListener, YES);
				window.addEventListener('mouseup', mouseUpEventListener, YES);
	
				event.preventDefault();
			});
	
			let touchDragHandlePoint;
	
			dragHandle.addEventListener('touchstart', /** @type {TouchEvent} */ event => {
				// Full screen windows cannot be resized
				if (this._fullScreen) return;

				// If there is already a drag in progress, don't process this new event
				if (typeof touchDragPoint !== 'undefined') {
					return;
				}
	
				// Only use the first touch point
				touchDragHandlePoint = event.changedTouches[0].identifier;
				this._dragged = YES;
	
				this._position = BMPointMake(this.widthConstraint.constant, this.heightConstraint.constant);
				let lastPosition = BMPointMake(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
	
				let mouseMoveEventListener = event => {
					// Look for the actively tracked touch point
					let touch;
					for (let changedTouch of event.changedTouches) {
						if (changedTouch.identifier == touchDragHandlePoint) {
							touch = changedTouch;
							break;
						}
					}
	
					// If the actively tracked touch point did not move, do not process this event
					if (!touch) return;
	
					let position = BMPointMake(touch.clientX, touch.clientY);

					const newWidth = this._position.x + position.x - lastPosition.x;
					const newHeight = this._position.y + position.y - lastPosition.y;

					this._position = BMPointMake(newWidth, newHeight);
					lastPosition = position;

					let canResize = YES;
					if (this.delegate && this.delegate.windowShouldResize) {
						canResize = this.delegate.windowShouldResize(this, BMSizeMake(newWidth, newHeight));
					}
					if (!canResize) return;

					this.widthConstraint.constant = newWidth;
					this.heightConstraint.constant = newHeight;
					this.frame.size.width = this.widthConstraint.constant;
					this.frame.size.height = this.heightConstraint.constant;

					this.layout();
					if (this.delegate && this.delegate.windowDidResize) {
						this.delegate.windowDidResize(this, {toSize: this.frame.size});
					}
					event.preventDefault();
				};
	
				let mouseUpEventListener = event => {
					touchDragHandlePoint = undefined;
					window.removeEventListener('touchmove', mouseMoveEventListener);
					window.removeEventListener('touchend', mouseUpEventListener);
					window.removeEventListener('touchcancel', mouseUpEventListener);
				}
	
				window.addEventListener('touchmove', mouseMoveEventListener);
				window.addEventListener('touchend', mouseUpEventListener);
				window.removeEventListener('touchcancel', mouseUpEventListener);
	
				event.preventDefault();
			});
		}
		
		return this;
	},

	/**
	 * Invoked on non-modal windows when the viewport resizes.
	 * @param event <Event>			The event that triggered this action.
	 */
	_viewportDidResize(event) {
		this.maxRightConstraint.constant = window.innerWidth;
		this.maxBottomConstraint.constant = window.innerHeight;

		if (this._fullScreen) this.layout();
	},

	/**
	 * Registers a keyboard shortcut that can be activated when this window is the key window.
	 * @param shortcut <BMKeyboardShortcut>			The keyboard shortcut to register.
	 */
	registerKeyboardShortcut(shortcut) {
		if (!this._keyboardShortcuts.length) this._enableKeyboardShortcuts();

		this._keyboardShortcuts.push(shortcut);
	},

	/**
	 * Unregisters a keyboard shortcut. If this keyboard shortcut had not been previously registered, this method does nothing.
	 * @param shortcut <BMKeyboardShortcut>			The keyboard shortcut to unregister.
	 */
	unregisterKeyboardShortcut(shortcut) {
		for (let i = 0; i < this._keyboardShortcuts.length; i++) {
			if (this._keyboardShortcuts[i] == shortcut) {
				this._keyboardShortcuts.splice(i, 1);
				break;
			}
		}

		if (!this._keyboardShortcuts.length) this._disableKeyboardShortcuts();
	},

	/**
	 * If keyboard shortcuts have been registered on this window, this method will be invoked to identify
	 * and handle key presses. Subclasses that override this method should invoke the base implementation to allow
	 * keyboard shortcuts to be handled correctly.
	 * @param event <KeyboardEvent>			The event that triggered this action.
	 */
	keyPressedWithEvent(event) {
		// Check if a shortcut key has been pressed.
		for (const shortcut of this._keyboardShortcuts) {
			if (event.code != shortcut.keyCode) continue;

			// Build the modifier bitmap for this event
			let bitmap = 0;
			for (const modifier in BMKeyboardShortcutModifier) {
				if (event[BMKeyboardShortcutModifier[modifier].key]) {
					bitmap = bitmap | BMKeyboardShortcutModifier[modifier].value;
				}
			}

			if (bitmap == shortcut._modifierBitmap) {
				if (shortcut.preventsDefault) event.preventDefault();
				shortcut.target[shortcut.action](event);
			}
		}
	},

	/**
	 * Set to `YES` if keyboard shortcuts are enabled.
	 */
	_keyboardShortcutsEnabled: NO, // <Boolean>

	/**
	 * Enables keyboard shortcut handling. This makes the window's `node` focusable and attaches
	 * the relevant event handlers to it. If this window is the key window and the keyboard focus
	 * is outside of this window, this window will acquire keyboard focus.
	 */
	_enableKeyboardShortcuts() {
		this.node.tabIndex = -1;

		if (document.activeElement && !this.node.contains(document.activeElement)) {
			this.node.focus();
		}
		else if (!document.activeElement) {
			this.node.focus();
		}

		this._keypressHandler = (event) => {
			this.keyPressedWithEvent(event);
		};

		this.node.addEventListener('keydown', this._keypressHandler);
		this._keyboardShortcutsEnabled = YES;
	},

	/**
	 * Disables keyboard shortcut handling. This detaches the relevant event handlers from this window's `node`.
	 */
	_disableKeyboardShortcuts() {
		this.node.removeEventListener('keydown', this._keypressHandler);
		this._keyboardShortcutsEnabled = NO;
	},

	/**
	 * If this window is visible, this method dismisses it. Otherwise the window is made visible.
	 * @param animated <Boolean, nullable>				Defaults to `YES`. If set to `YES`, this change will be animated, otherwise it will be instant.
	 * {
	 * 	@param completionHandler <void ^ (), nullable>	If specified, this handler will be invoked when the operation completes.
	 * }
	 */
	toggleAnimated: function (animated, args) {
		if (this._visible) {
			this.dismissAnimated(animated, args);
		}
		else {
			this.bringToFrontAnimated(animated, args);
		}
	},

	/**
	 * @protected
	 * This method is invoked during `bringToFrontAnimated()` to run the animations that will make this window visible.
	 * Subclasses can override this method to perform custom animations.
	 * 
	 * This method is not invoked from within an animation context.
	 * @param completionHandler <void ^()>			A method that custom implementations must invoke when the animation completes.
	 */
	animateInWithCompletionHandler(completionHandler) {
		const self = this;
		if (this._anchorRect) {
			const rect = this._anchorRect;
			const frame = self._fullScreen ? BMRectMake(0, 0, window.innerWidth, window.innerHeight) : self.frame;
			const transformRect = frame.rectWithTransformToRect(rect);
			
			__BMVelocityAnimate(this._window, {opacity: 1, translateX: ['0px', transformRect.origin.x + 'px'], translateY: ['0px', transformRect.origin.y + 'px'], 
							scaleX: [1, transformRect.size.width], scaleY: [1, transformRect.size.height]}, {
								duration: _BMWindowAnimationDurationDefault,
								easing: _BMWindowAnimationEasingDefault,
								display: 'block'
							}, YES);
		}
		else if (this._anchorNode) {
			// Create a copy of the given node which will be used in the animation in place of the original node
			const node = this._anchorNode;
			const rect = BMRectMakeWithNodeFrame(node);
			const animationNode = node.cloneNode(YES);
			
			const nodeDisplay = node.style.display;
			
			animationNode.style.position = 'fixed';
			animationNode.style.zIndex = BM_WINDOW_Z_INDEX_MAX + 1;
			animationNode.style.transform = '';
			BMCopyProperties(animationNode.style, {left: rect.origin.x + 'px', top: rect.origin.y + 'px', width: rect.size.width + 'px', height: rect.size.height + 'px', margin: 0});
			
			// Disable pointer events on the new view so that hover states do not cause the layer to be redrawn mid-animation
			animationNode.style.pointerEvents = 'none';
			
			// Compute the transform and apply it first to the window
			// and then to the animation node, but inversed
			const frame = self._fullScreen ? BMRectMake(0, 0, window.innerWidth, window.innerHeight) : self.frame;
			const transformRect = frame.rectWithTransformToRect(rect);
			
			document.body.appendChild(animationNode);
			node.style.display = 'none';
			
			__BMVelocityAnimate(this._window, {opacity: 1, translateX: ['0px', transformRect.origin.x + 'px'], translateY: ['0px', transformRect.origin.y + 'px'], 
							scaleX: [1, transformRect.size.width], scaleY: [1, transformRect.size.height]}, {
								duration: _BMWindowAnimationDurationDefault,
								easing: _BMWindowAnimationEasingDefault,
								display: 'block',
								complete: completionHandler
							}, YES);
			
			// After finishing the animation, remove the temporary node and restore the original node's display
			__BMVelocityAnimate(animationNode, {opacity: [0, 1], translateX: -transformRect.origin.x + 'px', translateY: -transformRect.origin.y + 'px', 
							scaleX: 1 / transformRect.size.width, scaleY: 1 / transformRect.size.height}, {
								duration: _BMWindowAnimationDurationDefault,
								easing: _BMWindowAnimationEasingDefault,
								complete: function () { 
									animationNode.remove(); 
									var windowShouldKeepNodeHidden = NO;
									if (self.delegate && self.delegate.windowShouldKeepNodeHidden) {
										windowShouldKeepNodeHidden = self.delegate.windowShouldKeepNodeHidden(self, node);
									}
									if (windowShouldKeepNodeHidden) {
										self._nodeDisplay = nodeDisplay;
									}
									else {
										node.style.display = nodeDisplay;
									}

									completionHandler();
								}
							}, YES);
		}
		else {
		
			__BMVelocityAnimate(this._window, {opacity: 1, scaleX: [1, .9], scaleY: [1, .9], translateZ: 0}, {
				duration: _BMWindowAnimationDurationIncomingDefault,
				easing: _BMWindowAnimationEasingIncomingDefault, 
				display: 'block',
				complete: completionHandler
			}, YES);
			
		}
	},

	/**
	 * Should be invoked to make this window visible. Subclasses overriding this method should invoke the base method at some point in their implementation.
	 * @param animated <Boolean, nullable>				Defaults to YES. If set to YES, this change will be animated, otherwise it will be instant.
	 * {
	 *	@param fromRect <BMRect, nullable>				*Deprecated - Use the `anchorRect` property instead*. Ignored if either `anchorPoint`, `anchorRect` or `anchorNode` are set. 
	 *													Sets the value of the `anchorRect` property to the given value until this operation completes.
	 *  @param fromNode <DOMNode, nullable>				*Deprecated - Use the `anchorRect` property instead*. Ignored if either `anchorPoint`, `anchorRect` or `anchorNode` are set. 
	 *													Sets the value of the `anchorNode` property to the given value until this operation completes.
	 *	@param completionHandler <void ^ (), nullable>	A handler that will be invoked after this window has been made visible.
	 * }
	 */
	bringToFrontAnimated: function (animated, args = {}) {
		this._visible = YES;

		this.becomeKeyWindow();

		for (let window of this._toolWindows) {
			if (window.opensAutomatically) window.bringToFrontAnimated(animated);
		}
		
		animated = (animated === undefined ? YES : animated);
		
		//__BMVelocityAnimate(this._blocker, 'stop');
		//__BMVelocityAnimate(this._window, 'stop');
		
		var self = this;
		
		if (self.delegate && self.delegate.windowWillAppear) {
			self.delegate.windowWillAppear(self);
		}
		
		if (animated) {

			this._blocker.style.pointerEvents = 'none';
			this._window.style.pointerEvents = 'none';
		
			__BMVelocityAnimate(this._blocker, {opacity: 1, translateZ: 0}, {
				duration: 500,
				easing: 'easeInOutQuint',
				display: 'block',
				/*progress: function (elements, complete) {
					self._blocker.style.webkitBackdropFilter = 'blur(' + (complete * 15).toFixed(2) + 'px)';
					self._blocker.style.backdropFilter = 'blur(' + (complete * 15).toFixed(2) + 'px)';
				},*/
				complete: function () {
					self._blocker.style.pointerEvents = '';
					self._window.style.pointerEvents = '';

					if (self.delegate && self.delegate.windowDidAppear) {
						self.delegate.windowDidAppear(self);
					}
					if (args && args.completionHandler) args.completionHandler();
				}
			}, YES);
			
			// Included for compatibility with the anchor arguments,
			// due to be removed soon
			let completionHandler;
			if (this._anchorNode || this._anchorRect || this._anchorPoint) {
				completionHandler = () => {};
			}
			else {
				if (args.fromRect) {
					this.anchorRect = args.fromRect;
				}
				if (args.fromNode) {
					this.anchorNode = args.fromNode;
				}
				completionHandler = () => {
					this.anchorRect = undefined;
					this.anchorNode = undefined;
				}
			}

			this.animateInWithCompletionHandler(completionHandler);

			this._blocker.style.display = 'block';
			this._window.style.display = 'block';

			this._overlay._windowWillAppear();
		
		}
		else {
			this._blocker.style.opacity = 1;
			this._blocker.style.display = 'block';
			
			this._window.style.opacity = 1;
			BMHook(this._window, {scaleX: 1, scaleY: 1});
			this._window.style.display = 'block';

			this._overlay._windowWillAppear();

			this._blocker.style.pointerEvents = '';
			this._window.style.pointerEvents = '';
			
			if (self.delegate && self.delegate.windowDidAppear) self.delegate.windowDidAppear(self);
			
			if (args && args.completionHandler) args.completionHandler();
		}
	},
	


	/**
	 * @protected
	 * This method is invoked during `dismissAnimated()` to run the animations that will make this window hidden.
	 * Subclasses can override this method to perform custom animations.
	 * 
	 * This method is not invoked from within an animation context.
	 * @param completionHandler <void ^()>			A method that custom implementations must invoke when the animation completes.
	 */
	animateOutWithCompletionHandler(completionHandler) {
		const self = this;
			
		if (this._anchorRect) {
			const rect = this._anchorRect;
			const frame = self._fullScreen ? BMRectMake(0, 0, window.innerWidth, window.innerHeight) : self.frame;
			const transformRect = frame.rectWithTransformToRect(rect);
			
			__BMVelocityAnimate(this._window, {opacity: 0, translateX: transformRect.origin.x + 'px', translateY: transformRect.origin.y + 'px', 
							scaleX: transformRect.size.width, scaleY: transformRect.size.height}, {
								duration: _BMWindowAnimationDurationDefault,
								easing: _BMWindowAnimationEasingDefault,
								display: 'none',
								complete: completionHandler
							}, YES);
		}
		else if (this._anchorNode) {
			// Create a copy of the given node which will be used in the animation in place of the original node
			const node = this._anchorNode;
			
			if ('_nodeDisplay' in self) {
				node.style.display = self._nodeDisplay;
			}
			
			const rect = BMRectMakeWithNodeFrame(node);
			const animationNode = node.cloneNode(YES);
			
			const nodeDisplay = ('_nodeDisplay' in self) ? self._nodeDisplay : node.style.display;
			self._nodeDisplay = undefined;
			
			animationNode.style.position = 'fixed';
			animationNode.style.zIndex = BM_WINDOW_Z_INDEX_MAX + 1;
			animationNode.style.transform = '';
			BMCopyProperties(animationNode.style, {left: rect.origin.x + 'px', top: rect.origin.y + 'px', width: rect.size.width + 'px', height: rect.size.height + 'px', margin: 0});
			
			// Disable pointer events on the new view so that hover states do not cause the layer to be redrawn mid-animation
			animationNode.style.pointerEvents = 'none';
			
			// Compute the transform and apply it first to the window
			// and then to the animation node, but inversed
			const frame = self._fullScreen ? BMRectMake(0, 0, window.innerWidth, window.innerHeight) : self.frame;
			const transformRect = frame.rectWithTransformToRect(rect);
			
			BMHook(animationNode, {translateX:  -transformRect.origin.x + 'px', translateY: -transformRect.origin.y + 'px', 
							scaleX: 1 / transformRect.size.width, scaleY: 1 / transformRect.size.height, opacity: 0});
			
			document.body.appendChild(animationNode);
			node.style.display = 'none';
			
			__BMVelocityAnimate(this._window, {opacity: 0, translateX: transformRect.origin.x + 'px', translateY: transformRect.origin.y + 'px', 
							scaleX: transformRect.size.width, scaleY: transformRect.size.height}, {
								duration: _BMWindowAnimationDurationDefault,
								easing: _BMWindowAnimationEasingDefault,
								display: 'none',
								complete: completionHandler
							}, YES);
			
			// After finishing the animation, remove the temporary node and restore the original node's display
			__BMVelocityAnimate(animationNode, {opacity: [1, 0], translateX: ['0px', -transformRect.origin.x + 'px'], translateY: ['0px', -transformRect.origin.y + 'px'], 
							scaleX: [1, 1 / transformRect.size.width], scaleY: [1, 1 / transformRect.size.height]}, {
								duration: _BMWindowAnimationDurationDefault,
								easing: _BMWindowAnimationEasingDefault,
								complete: function () { node.style.display = nodeDisplay; animationNode.remove(); }
							}, YES);
		}
		else {
			__BMVelocityAnimate(this._window, {opacity: 0, scaleX: .9, scaleY: .9, translateZ: 0}, {
				duration: _BMWindowAnimationDurationOutgoingDefault,
				easing: _BMWindowAnimationEasingOutgoingDefault,
				display: 'none',
				complete: completionHandler
			}, YES);
		}
	},
	
	/**
	 * Should be invoked to dismiss this window. Subclasses overriding this method should invoke the base method at some point in their implementation.
	 * @param animated <Boolean, nullable>				Defaults to YES. If set to YES, this change will be animated, otherwise it will be instant.
	 * {
	 *	@param toRect <BMRect, nullable>				*Deprecated - Use the `anchorRect` property instead*. Ignored if either `anchorPoint`, `anchorRect` or `anchorNode` are set. 
	 *													Sets the value of the `anchorRect` property to the given value until this operation completes.
	 *  @param toNode <DOMNode, nullable>				*Deprecated - Use the `anchorRect` property instead*. Ignored if either `anchorPoint`, `anchorRect` or `anchorNode` are set. 
	 *													Sets the value of the `anchorNode` property to the given value until this operation completes.
	 *													If set to a DOM node, the window will compact to that element.
	 *	@param completionHandler <void ^ (), nullable>	A handler that will be invoked after this window has been hidden.
	 * }
	 */
	dismissAnimated: function (animated, args = {}) {
		
		animated = (animated === undefined ? YES : animated);
		
		//__BMVelocityAnimate(this._blocker, 'stop');
		//__BMVelocityAnimate(this._window, 'stop');
		
		var self = this;

		this._blocker.style.pointerEvents = 'none';
		this._window.style.pointerEvents = 'none';
		
		if (self.delegate && self.delegate.windowWillClose) {
			self.delegate.windowWillClose(self);
		}
		this._visible = NO;

		for (let window of this._toolWindows) {
			window.dismissAnimated(animated);
		}
		
		if (animated) {
			
			__BMVelocityAnimate(this._blocker, {opacity: 0, translateZ: 0}, {
				duration: _BMWindowAnimationDurationDefault,
				easing: _BMWindowAnimationEasingDefault,
				display: 'none',
				/*progress: function (elements, complete) {
					self._blocker.style.webkitBackdropFilter = 'blur(' + ((1 - complete) * 15).toFixed(2) + 'px)';
					self._blocker.style.backdropFilter = 'blur(' + ((1 - complete) * 15).toFixed(2) + 'px)';
				},*/
				complete: function () {
					if (self.delegate && self.delegate.windowDidClose) {
						self.delegate.windowDidClose(self);
					}
					if (args && args.completionHandler) args.completionHandler();
				}
			}, YES);
			
			// Included for compatibility with the anchor arguments,
			// due to be removed soon
			let completionHandler;
			if (this._anchorNode || this._anchorRect || this._anchorPoint) {
				completionHandler = () => {
					this._window.style.display = 'none';
					this._window.style.opacity = 0;
				};
			}
			else {
				if (args.fromRect) {
					this.anchorRect = args.fromRect;
				}
				if (args.fromNode) {
					this.anchorNode = args.fromNode;
				}
				completionHandler = () => {
					this.anchorRect = undefined;
					this.anchorNode = undefined;
					this._window.style.display = 'none';
					this._window.style.opacity = 0;
				}
			}

			this.animateOutWithCompletionHandler(completionHandler);
			
		}
		else {
			this._blocker.style.opacity = 0;
			this._blocker.style.display = 'none';
			
			this._window.style.opacity = 0;
			this._window.style.display = 'none';
			
			if (self.delegate && self.delegate.windowDidClose) {
				self.delegate.windowDidClose(self);
			}
			if (args && args.completionHandler) args.completionHandler();
		}
	},

	/**
	 * Minimizes this window. This method will raise an error if this window is modal.
	 * If this window is already minimized, this method will have no effect.
	 * @param animated <Boolean, nullable>				Defaults to `YES`. If set to `YES`, this change will be animated, otherwise it will be instant.
	 * 													Setting this value to `NO` is currently unsupported.
	 * {
	 * 	@param completionHandler <void ^ (), nullable>	A handler that will be invoked after this window has been minimized.
	 * }
	 */
	minimizeAnimated: function (animated, args) {
		if (this._modal) throw new Error('A modal window cannot be minimized.');
		if (this._minimizedWindow) return;

		if (this.delegate && this.delegate.windowWillMinimize) {
			this.delegate.windowWillMinimize(this);
		}

		let minimizedWindow = document.createElement('div');
		minimizedWindow.className = 'BMWindowMinimized';
		minimizedWindow.innerText = this.title;
		minimizedWindow.style.left = 2 + BMWindow._minimizedWindows.length * 258 + 'px';
		minimizedWindow.addEventListener('click', event => {
			if (event.altKey) {
				BMWindow.restoreAllAnimated(YES);
			}
			else {
				this.restoreAnimated(YES);
			}
		});

		BMWindow._minimizedWindows.push(minimizedWindow);

		document.body.appendChild(minimizedWindow);

		this._minimizedWindow = minimizedWindow;

		let self = this;

		if (animated) {
			// Create a copy of the given node which will be used in the animation in place of the original node
			var node = minimizedWindow;
			
			var rect = BMRectMakeWithNodeFrame(node);
			var animationNode = node.cloneNode(YES);
			
			animationNode.style.position = 'fixed';
			animationNode.style.zIndex = BM_WINDOW_Z_INDEX_MAX + 1;
			animationNode.style.transform = '';
			BMCopyProperties(animationNode.style, {left: rect.origin.x + 'px', top: rect.origin.y + 'px', width: rect.size.width + 'px', height: rect.size.height + 'px', margin: 0});
			
			// Disable pointer events on the new view so that hover states do not cause the layer to be redrawn mid-animation
			animationNode.style.pointerEvents = 'none';
			
			// Compute the transform and apply it first to the window
			// and then to the animation node, but inversed
			var frame = self._fullScreen ? BMRectMake(0, 0, window.innerWidth, window.innerHeight) : self.frame;
			var transformRect = frame.rectWithTransformToRect(rect);
			
			BMHook(animationNode, {translateX:  -transformRect.origin.x + 'px', translateY: -transformRect.origin.y + 'px', 
							scaleX: 1 / transformRect.size.width, scaleY: 1 / transformRect.size.height, opacity: 0});
			
			document.body.appendChild(animationNode);
			node.style.display = 'none';
			
			__BMVelocityAnimate(this._window, {opacity: 0, translateX: transformRect.origin.x + 'px', translateY: transformRect.origin.y + 'px', 
							scaleX: transformRect.size.width, scaleY: transformRect.size.height}, {
								duration: _BMWindowAnimationDurationDefault,
								easing: _BMWindowAnimationEasingDefault,
								display: 'none'
							}, YES);
			
			// After finishing the animation, remove the temporary node and restore the original node's display
			__BMVelocityAnimate(animationNode, {opacity: [1, 0], translateX: ['0px', -transformRect.origin.x + 'px'], translateY: ['0px', -transformRect.origin.y + 'px'], 
							scaleX: [1, 1 / transformRect.size.width], scaleY: [1, 1 / transformRect.size.height]}, {
								duration: _BMWindowAnimationDurationDefault,
								easing: _BMWindowAnimationEasingDefault,
								complete: function () { 
									node.style.display = 'block'; 
									animationNode.remove(); 

									if (self.delegate && self.delegate.windowDidMinimize) {
										self.delegate.windowDidMinimize(self);
									}

									if (args && args.completionHandler) args.completionHandler();
								}
							}, YES);
		}
	},

	/**
	 * Restores this window. This method will raise an error if this window is modal.
	 * If this window is not minimized, this method will have no effect.
	 * @param animated <Boolean, nullable>				Defaults to `YES`. If set to `YES`, this change will be animated, otherwise it will be instant.
	 * 													Setting this value to `NO` is currently unsupported.
	 * {
	 * 	@param completionHandler <void ^ (), nullable>	A handler that will be invoked after this window has been minimized.
	 * }
	 */
	restoreAnimated(animated, args) {
		if (this._modal) throw new Error('A modal window cannot be restored.');
		if (!this._minimizedWindow) return;

		if (this.delegate && this.delegate.windowWillRestore) {
			this.delegate.windowWillRestore(this);
		}

		let self = this;

		if (animated) {
				// Create a copy of the given node which will be used in the animation in place of the original node
				var node = this._minimizedWindow;
				var rect = BMRectMakeWithNodeFrame(node);
				var animationNode = node.cloneNode(YES);

				this._minimizedWindow = undefined;
				let removedWindow = NO;
				for (let i = 0, length = BMWindow._minimizedWindows.length, windows = BMWindow._minimizedWindows; i < length; i++) {
					if (windows[i] == node) {
						windows.splice(i, 1);
						i--;
						length--;
						removedWindow = YES;
						continue;
					}

					if (removedWindow) {
						windows[i].style.left = 2 + 258 * i + 'px';
					}
				}

				if (!this.isKeyWindow) this.becomeKeyWindow();
				
				animationNode.style.position = 'fixed';
				animationNode.style.zIndex = BM_WINDOW_Z_INDEX_MAX + 1;
				animationNode.style.transform = '';
				BMCopyProperties(animationNode.style, {left: rect.origin.x + 'px', top: rect.origin.y + 'px', width: rect.size.width + 'px', height: rect.size.height + 'px', margin: 0});
				
				// Disable pointer events on the new view so that hover states do not cause the layer to be redrawn mid-animation
				animationNode.style.pointerEvents = 'none';
				
				// Compute the transform and apply it first to the window
				// and then to the animation node, but inversed
				var frame = self._fullScreen ? BMRectMake(0, 0, window.innerWidth, window.innerHeight) : self.frame;
				var transformRect = frame.rectWithTransformToRect(rect);
				
				document.body.appendChild(animationNode);
				node.style.display = 'none';
				
				__BMVelocityAnimate(this._window, {opacity: 1, translateX: ['0px', transformRect.origin.x + 'px'], translateY: ['0px', transformRect.origin.y + 'px'], 
								scaleX: [1, transformRect.size.width], scaleY: [1, transformRect.size.height]}, {
									duration: _BMWindowAnimationDurationDefault,
									easing: _BMWindowAnimationEasingDefault,
									display: 'block'
								}, YES);
				
				// After finishing the animation, remove the temporary node and restore the original node's display
				__BMVelocityAnimate(animationNode, {opacity: [0, 1], translateX: -transformRect.origin.x + 'px', translateY: -transformRect.origin.y + 'px', 
								scaleX: 1 / transformRect.size.width, scaleY: 1 / transformRect.size.height}, {
									duration: _BMWindowAnimationDurationDefault,
									easing: _BMWindowAnimationEasingDefault,
									complete: function () { 
										animationNode.remove(); 
										node.remove();

										if (self.delegate && self.delegate.windowDidRestore) {
											self.delegate.windowDidRestore(self);
										}

										if (args && args.completionHandler) args.completionHandler();
									}
								}, YES);
		}
	},

	/**
	 * Should be invoked to make this window fullscreen.
	 * @param animated <Boolean, nullable>				Defaults to YES. If set to YES, this change will be animated, otherwise it will be instant.
	 * {
	 *	@param completionHandler <void ^ (), nullable>	A handler that will be invoked after this window has been hidden.
	 * }
	 */
	enterFullScreenAnimated: function (animated, args) {
		this._fullScreen = YES;

		if (!this.isKeyWindow) this.becomeKeyWindow();
		
		animated = (animated === undefined ? YES : animated);
		
		//__BMVelocityAnimate(this._blocker, 'stop');
		//__BMVelocityAnimate(this._window, 'stop');
		
		var self = this;

		this.widthConstraint.constant = window.innerWidth;
		this.heightConstraint.constant = window.innerHeight;
		this.leftConstraint.constant = 0;
		this.topConstraint.constant = 0;
		
		if (animated) {
			BMAnimateWithBlock(() => {
				let controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this.node});
				controller.registerBuiltInPropertiesWithDictionary({left: '0px', top: '0px', width: window.innerWidth + 'px', height: window.innerHeight + 'px'});

				const frame = this.frame.copy();
				this.layout();

				// When the window contains elements whose intrinsic size must be measured, upon finishing the layout, the window will continue to keep its
				// temporary frame used for measuring, so it has to be reset prior to the animation starting
				BMCopyProperties(this.node.style, {left: frame.origin.x + 'px', top: frame.origin.y + 'px', width: frame.size.width + 'px', height: frame.size.height + 'px'})
			}, {duration: 300, easing: 'easeInOutQuart',
				complete: function () {
					if (self.delegate && self.delegate.windowDidEnterFullScreen) self.delegate.windowDidEnterFullScreen(self);
					if (args && args.completionHandler) args.completionHandler();
					
					self._window.classList.add('BMFullScreenWindow');
				}
			});
		}
		else {
			self._window.classList.add('BMFullScreenWindow');
			if (self.delegate && self.delegate.windowDidEnterFullScreen) self.delegate.windowDidEnterFullScreen(self);
			if (args && args.completionHandler) args.completionHandler();
		}

		this._resizeHandler = event => {
			this.widthConstraint.constant = window.innerWidth;
			this.heightConstraint.constant = window.innerHeight;
		}

		window.addEventListener('resize', this._resizeHandler);
		
	},
	
	
	/**
	 * Should be invoked to exit full screen mode.
	 * @param animated <Boolean, nullable>				Defaults to YES. If set to YES, this change will be animated, otherwise it will be instant.
	 * {
	 *	@param completionHandler <void ^ (), nullable>	A handler that will be invoked after this window has been hidden.
	 * }
	 */
	exitFullScreenAnimated: function (animated, args) {
		if (!this._fullScreen) return;

		animated = (animated === undefined ? YES : animated);
		
		//__BMVelocityAnimate(this._blocker, 'stop');
		//__BMVelocityAnimate(this._window, 'stop');
		
		var self = this;

		this.widthConstraint.constant = this.frame.width;
		this.heightConstraint.constant = this.frame.height;
		this.leftConstraint.constant = this.frame.left;
		this.topConstraint.constant = this.frame.top;
		
		if (animated) {
			self._window.classList.remove('BMFullScreenWindow');
			var frame = self.frame;
			BMCopyProperties(self._window.style, {left: '0px', top: '0px', width: window.innerWidth + 'px', height: window.innerHeight + 'px'});
			/*__BMVelocityAnimate(this._window, {left: frame.origin.x + 'px', top: frame.origin.y + 'px', width: frame.size.width + 'px', height: frame.size.height + 'px'}, {
				duration: 300,
				easing: 'easeInOutQuart',
				complete: function () {
					if (self.delegate && self.delegate.windowDidExitFullScreen) self.delegate.windowDidExitFullScreen(self);
					if (args && args.completionHandler) args.completionHandler();
					
					self.frame = self.frame;
				}
			});*/

			BMAnimateWithBlock(() => {
				let controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this.node});
				controller.registerBuiltInProperty('left', {withValue: frame.origin.x + 'px'});
				controller.registerBuiltInProperty('top', {withValue: frame.origin.y + 'px'});
				controller.registerBuiltInProperty('width', {withValue: frame.size.width + 'px'});
				controller.registerBuiltInProperty('height', {withValue: frame.size.height + 'px'});
				this._fullScreen = NO;
				this.layout();
				BMCopyProperties(self._window.style, {left: '0px', top: '0px', width: window.innerWidth + 'px', height: window.innerHeight + 'px'});
			}, {
				duration: 300, easing: 'easeInOutQuart',
				complete: function () {
					if (self.delegate && self.delegate.windowDidExitFullScreen) self.delegate.windowDidExitFullScreen(self);
					if (args && args.completionHandler) args.completionHandler();
					
					self.frame = self.frame;
				}
			});
		}
		else {
			self._window.classList.remove('BMFullScreenWindow');
			this._fullScreen = NO;
			self.frame = self.frame;
			
			if (self.delegate && self.delegate.windowDidExitFullScreen) self.delegate.windowDidExitFullScreen(self);
			if (args && args.completionHandler) args.completionHandler();
		}

		window.removeEventListener('resize', this._resizeHandler);
	},

	/**
	 * Returns `YES` if this window is the key window, `NO` otherwise.
	 */
	get isKeyWindow() { // <Boolean>
		return BMWindow._keyWindow == this;
	},

	/**
	 * Causes this window to stop being the key window.
	 * If this window is not the key window, this method has no effect.
	 */
	resignKeyWindow() {
		if (BMWindow._keyWindow == this && !this._modal) {
			this.node.classList.remove('BMKeyWindow');
			this.node.classList.add('BMWindowInactive');
			if (this.delegate && this.delegate.windowDidResignKeyWindow) {
				this.delegate.windowDidResignKeyWindow(this);
			}
			BMWindow._keyWindow = undefined;

			for (let toolWindow of this._toolWindows) {
				toolWindow.hide();
			}
		}
	},

	/**
	 * Causes this window to become the key window.
	 * If this window is minimized when this method is invoked, it will be restored.
	 */
	becomeKeyWindow() {
		let minimized = !!this._minimizedWindow;
		if (this._minimizedWindow) {
			this.restoreAnimated(YES);
		}

		if (this._hidden) {
			this.reveal();
		}

		if (BMWindow._keyWindow != this) {
			if (BMWindow._keyWindow) {
				BMWindow._keyWindow.resignKeyWindow();
			}

			this.node.classList.add('BMKeyWindow');
			this.node.classList.remove('BMWindowInactive');
			BMWindow._keyWindow = this;

			if (!this._modal) {
				BMWindow._windows.splice(BMWindow._windows.indexOf(this), 1);
				BMWindow._windows.push(this);
				BMWindow._windows.slice().reverse().forEach((window, index) => window.node.style.zIndex = BM_WINDOW_Z_INDEX_MAX - index);
			}
			else {
				this._overlay.node.style.zIndex = BM_WINDOW_Z_INDEX_MAX + 1;
				this.node.style.zIndex = BM_WINDOW_Z_INDEX_MAX + 1;
			}

			if (this.delegate && this.delegate.windowDidBecomeKeyWindow) {
				this.delegate.windowDidBecomeKeyWindow(this);
			}

			for (let toolWindow of this._toolWindows) {
				toolWindow.reveal();
			}
		}
		else if (!minimized && !BMWindow._isShowcasing) {
			BMAnimateWithBlock(() => {
				BMAnimationContextEnableWebAnimations();
				let controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this.node});
				controller.registerBuiltInProperty('scaleX', {withValue: 1.05});
				controller.registerBuiltInProperty('scaleY', {withValue: 1.05});
			}, {duration: 100, easing: 'easeInQuad', complete: () => {
				BMAnimateWithBlock(() => {
					BMAnimationContextEnableWebAnimations();
					let controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this.node});
					controller.registerBuiltInProperty('scaleX', {withValue: 1});
					controller.registerBuiltInProperty('scaleY', {withValue: 1});
				}, {duration: 100, easing: 'easeOutQuad'});
			}});
		}
	},
	
	/**
	 * Destroys this window and removes all DOM nodes associated with it.
	 * This instance should not be reused after invoking this method.
	 */
	release() {
		if (BMWindow._keyWindow == this) BMWindow._keyWindow = undefined;

		if (this._boundViewportDidResize) {
			window.removeEventListener('resize', this._boundViewportDidResize);
		}

		if (!this._modal) {
			// Remove this window from the global list of windows
			for (let i = 0, length = BMWindow._windows.length; i < length; i++) {
				if (BMWindow._windows[i] == this) {
					BMWindow._windows.splice(i, 1);
					break;
				}
			}

			if (this._minimizedWindow) {
				for (let i = 0, length = BMWindow._minimizedWindows.length; i < length; i++) {
					if (BMWindow._minimizedWindows[i] == this._minimizedWindow) {
						BMWindow._minimizedWindows.splice(i, 1);
						break;
					}
				}
				this._minimizedWindow.remove();
			}
		}

		BMView.prototype.release.call(this);
		this._cancelLayout();
		this._overlay.release();
		this._overlay.node.remove();
		this.node.remove();
	},

	/**
	 * Hides this window.
	 */
	hide() {
		this._hidden = YES;
		this.node.classList.add('BMWindowHidden');
	},

	/**
	 * Reveals this window.
	 */
	reveal() {
		this._hidden = NO;
		this.node.classList.remove('BMWindowHidden');
	}
	
});

/**
 * Constructs and returns a window that will display in the given rect.
 * @param frame <BMRect>		The frame.
 * {
 *	@param toolbar <Boolean, nullable>		Defaults to `YES`. If set to `YES`, the window will have a toolbar.
 * 	@param modal <Boolean, nullable>		Defaults to `YES`. If set to `YES`, the window will be modal, blocking content behind it.
 * 											When set to `NO`, it will be possible to interact with content that is not obstructed by this window.
 * }
 * @return <BMWindow>			A window.
 */
export function BMWindowMakeWithFrame(frame, args) {
	return (new BMWindow()).initWithFrame(frame, args);
}

// @endtype
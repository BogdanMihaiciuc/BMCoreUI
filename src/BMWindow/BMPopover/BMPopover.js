// @ts-check

import { BMExtend, NO, YES, BMCopyProperties, BMNumberByConstrainingNumberToBounds, BMUUIDMake, BMNumberByInterpolatingNumbersWithFraction } from "../../Core/BMCoreUI";
import { BMWindow } from "../BMWindow";
import { BMRectMakeWithOrigin, BMRectMakeWithNodeFrame, BMRectMake } from "../../Core/BMRect";
import { BMPointMake } from "../../Core/BMPoint";
import { BMAnimateWithBlock, BMAnimationApplyBlocking, BMAnimationBeginWithDuration, BMAnimationContext, BMAnimationContextAddCompletionHandler, BMAnimationContextBeginStatic, BMAnimationContextGetCurrent, BMHook, __BMVelocityAnimate } from "../../Core/BMAnimationContext";
import { BMView, BMViewColorScheme } from "../../BMView/BMView_v2.5";
import { BMInsetMakeWithEqualInsets } from "../../Core/BMInset";


/**
 * The number of pixels a touch or clicked pointer can wander off before causing a popover to detach.
 */
const BMPopoverDragThreshold = 128; // <Number>

// @type _BMPopoverDisplayConfiguration implements BMAnimating

/**
 * A class that describes the display attributes of a popover and supports interpolation.
 */
function _BMPopoverDisplayConfiguration() {} // <constructor>

_BMPopoverDisplayConfiguration.prototype = {
    /**
     * The popover's frame, excluding the indicator's size.
     */
    _frame: undefined, // <BMRect>

    /**
     * The indicator's direction relative to the popover's anchor.
     */
    _direction: undefined, // <BMPopoverIndicatorDirection>

    /**
     * The indicator's position along the popover's edge.
     */
    _indicatorPosition: undefined, // <Number>

    /**
     * The size of the indicator.
     */
    _indicatorSize: undefined, // <Number>

    /**
     * The round radius of the popover's corners.
     */
    _borderRadius: undefined, // <Number>

    /**
     * The height of the visible portion of the indicator.
     */
    get _indicatorHeight() { // <Number>
        // The indicator height represents the edge size of the indicator square;
        // Therefore its total width/height represents the diagonal of that square
        // and its visible height is half of the square's diagonal
        const indicatorWidth = this._indicatorSize * Math.SQRT2;
        return indicatorWidth / 2 | 0;
    },

    /**
     * Initializes this popover popover display configuration object with the specified values.
     * @param frame <BMRect>                            The popover's frame.
     * {
     *  @param direction <BMPopoverIndicatorDirection>  The indicator's direction relative to the popover's anchor.
     *  @param indicatorPosition <Number>               The indicator's position relative to the popover's edge.
     *  @param indicatorSize <Number>                   The size of the indicator.
     *  @param borderRadius <Number>                    The size of the popover's corners.
     * }
     * @returns <_BMPopoverDisplayConfiguration>        This popover display configuration.
     */
    initWithFrame(frame, {direction, indicatorPosition, indicatorSize, borderRadius}) {
        this._frame = frame.copy();
        this._direction = direction;
        this._indicatorPosition = indicatorPosition;
        this._indicatorSize = indicatorSize;
        this._borderRadius = borderRadius;

        return this;
    },

    /**
     * Initializes this popover popover display configuration object by copying the values of
     * the specified popover display configuration.
     * @param config <_BMPopoverDisplayConfiguration>   The configuration whose values to copy.
     * @returns <_BMPopoverDisplayConfiguration>        This popover display configuration.
     */
    initWithPopoverDisplayConfiguration(config) {
        this._frame = config._frame.copy();
        this._direction = config._direction;
        this._indicatorPosition = config._indicatorPosition;
        this._indicatorSize = config._indicatorSize;
        this._borderRadius = config._borderRadius;

        return this;
    },

    /**
     * Creates and returns a copy of this popover display configuration.
     * @returns <_BMPopoverDisplayConfiguration>        A copy of this object.
     */
    copy() {
        return (new _BMPopoverDisplayConfiguration).initWithPopoverDisplayConfiguration(this);
    },

    /**
     * Invoked by the CoreUI animation engine to obtain an interpolated
     * value between this object and the target object.
     * @param fraction <Number>                         The animation fraction.
     * {
     *  @param toValue <_BMPopoverDisplayConfiguration> The object to which to interpolate.
     * }
	 * @return <_BMPopoverDisplayConfiguration>		    A popover display configuration.
     */
    interpolatedValueWithFraction(fraction, {toValue: target}) {
        const copy = this.copy();

        copy._frame = this._frame.interpolatedValueWithFraction(fraction, {toValue: target._frame});

        if (this._direction == target._direction) {
            // When the direction remains the same animate all other indicator properties smoothly
            copy._indicatorPosition = BMNumberByInterpolatingNumbersWithFraction(this._indicatorPosition, target._indicatorPosition, fraction);
            copy._indicatorSize = BMNumberByInterpolatingNumbersWithFraction(this._indicatorSize, target._indicatorSize, fraction);
        }
        else {
            // Otherwise hide then indicator from its source direction then reveal it at the target direction over the course of the animation
            if (fraction < 0.5) {
                // In the first half, hide the indicator, keeping it in the source direction
                copy._direction = this._direction;
                copy._indicatorPosition = this._indicatorPosition;
                copy._indicatorSize = BMNumberByInterpolatingNumbersWithFraction(this._indicatorSize, 0, fraction * 2);
            }
            else {
                // In the second half, show the indicator, keeping it in the target direction
                copy._direction = target._direction;
                copy._indicatorPosition = target._indicatorPosition;
                copy._indicatorSize = BMNumberByInterpolatingNumbersWithFraction(0, target._indicatorSize, (fraction - 0.5) * 2);
            }
        }

        copy._borderRadius = BMNumberByInterpolatingNumbersWithFraction(this._borderRadius, target._borderRadius, fraction);

        return copy;
    },
};

/**
 * Creates and returns a popover display configuration object initialized with the specified values.
 * @param frame <BMRect>                            The popover's frame.
 * {
 *  @param direction <BMPopoverIndicatorDirection>  The indicator's direction relative to the popover's anchor.
 *  @param indicatorPosition <Number>               The indicator's position relative to the popover's edge.
 *  @param indicatorSize <Number>                   The size of the indicator.
 *  @param borderRadius <Number>                    The size of the popover's corners.
 * }
 * @returns <_BMPopoverDisplayConfiguration>        A popover display configuration.
 */
_BMPopoverDisplayConfiguration.configurationWithFrame = function (frame, args) {
    return (new this).initWithFrame(frame, args);
};

// @endtype

// @type BMPopoverIndicatorDirection

/**
 * Constants describing the position where the indicator appears on its popover.
 */
export var BMPopoverIndicatorDirection = Object.freeze({ // <enum>
	/**
	 * Causes the popover indicator to appear on the top edge of the popover.
	 */
	Top: "Top", // <enum>
	
	/**
	 * Causes the popover indicator to appear on the bottom edge of the popover.
	 */
	Bottom: "Bottom", // <enum>
	
	/**
	 * Causes the popover indicator to appear on the left edge of the popover.
	 */
	Left: "Left", // <enum>
	
	/**
	 * Causes the popover indicator to appear on the right edge of the popover.
	 */
	Right: "Right" // <enum>
});

// @endtype

// @type BMPopover extends BMWindow

/**
 * The popover is a kind of window that is visually linked to a source element.
 * Unlike windows, popovers are always modal.
 * 
 * Additionally, unlike with windows, subviews should not be directly added to the popover.
 * Instead, they should be added to the popover's `contentView` property.
 */
export function BMPopover() {} // <constructor>

BMPopover.prototype = BMExtend(Object.create(BMWindow.prototype), {
	
	/**
	 * An optional delegate which this popover may notify of key events.
	 */
	delegate: undefined, // <BMPopoverDelegate, nullable>

    /**
     * Animatable. The point from which this popover should originate, relative to the document. Either this property
     * or `anchorNode` or `anchorRect` must be set before this popover is displayed.
     */
    _anchorPoint: undefined, // <BMPoint, nullable>

    get anchorPoint() {
        return this._anchorPoint;
    },
    set anchorPoint(point) {
        this._anchorRect = undefined;
        this._anchorNode = undefined;
        this._anchorPoint = point;

        this._updatePosition();
    },


    /**
     * Animatable. The rect from which this popover should originate, relative to the document. Either this property
     * or `anchorPoint` or `anchorNode` must be set before this popover is displayed.
     */
    _anchorRect: undefined, // <BMRect, nullable>

    get anchorRect() {
        return this._anchorRect;
    },
    set anchorRect(rect) {
        this._anchorPoint = undefined;
        this._anchorNode = undefined;
        this._anchorRect = rect;

        this._updatePosition();
    },


    /**
     * Animatable. The element from which this popover should originate. Either this property
     * or `anchorPoint` or `anchorRect` must be set before this popover is displayed.
     */
    _anchorNode: undefined, // <DOMNode, nullable>

    get anchorNode() {
        return this._anchorNode;
    },
    set anchorNode(node) {
        this._anchorRect = undefined;
        this._anchorPoint = undefined;
        this._anchorNode = node;

        this._updatePosition();
    },

    /**
     * This popover's size. This property must be set prior to the
     * popover being displayed.
     */
    _size: undefined, // <BMSize>
    get size() {
        return this._size;
    },
    set size(size) {
        this._size = size.copy();

        this._updatePosition();
    },

    /**
     * The size of the indicator. This property should be set prior to the
     * popover being displayed.
     */
    _indicatorSize: 16, // <Number>
    get indicatorSize() {
        return this._indicatorSize;
    },
    set indicatorSize(size) {
        this._indicatorSize = size;

        this._updatePosition();
    },

    /**
     * Controls how rounded the popover's borders should be. This property should be set prior to the
     * popover being displayed.
     */
    _borderRadius: 8, // <Number>
    get borderRadius() {
        return this._borderRadius;
    },
    set borderRadius(radius) {
        this._borderRadius = radius;

        this._updatePosition();
    },

    /**
     * Controls the spacing that this popover will maintain towards the edges of the viewport
     * in cases where the popover would move outside the visible area in order to maintain its
     * regular position.
     */
    _edgeInsets: undefined, // <BMInset>
    get edgeInsets() {
        return this._edgeInsets;
    },
    set edgeInsets(margin) {
        this._edgeInsets = margin || BMInsetMakeWithEqualInsets(8);

        this._updatePosition();
    },

    /**
     * The drop shadow container.
     */
    _dropShadowContainer: undefined, // <DOMNode>

    /**
     * The drop shadow content.
     */
    _dropShadowContent: undefined, // <DOMNode>

    /**
     * The background node.
     */
    _background: undefined, // <DOMNode>

    /**
     * The dark mode fill node.
     */
    _darkModeFill: undefined, // <DOMNode>

    /**
     * The view to which subviews should be added.
     */
    _contentView: undefined, // <BMView>
    get contentView() {
        return this._contentView;
    },
    set contentView(view) {
        this._contentView = view;
    },

    /**
     * A SVG object that defines the clip path that must be used on
     * browsers that don't suport the `clip-path: path(...)` CSS values.
     * This property will be `undefined` for all other browsers.
     */
    _clipPathSVG: undefined, // <DOMNode, nullable>

    /**
     * When `_clipPathSVG` is defined, this represents the background path element.
     */
    _clipPathBackgroundPath: undefined, // <DOMNode, nullable>

    /**
     * When `_clipPathSVG` is defined, this represents the outline path element.
     */
    _clipPathOutlinePath: undefined, // <DOMNode, nullable>

    /**
     * When `_clipPathSVG` is defined, this represents the box shadow path element.
     */
    _clipPathBoxShadowPath: undefined, // <DOMNode, nullable>

    /**
     * A string that forms part of the HTML IDs that will be assigned to the clip paths
     * to be used on browsers.
     * This property will be `undefined` for all other browsers.
     */
    _clipPathUUID: undefined, // <String, nullable>

    /**
     * The content view's top edge constraint.
     */
    _contentViewTopConstraint: undefined, // <BMLayoutConstraint>

    /**
     * The content view's bottom edge constraint.
     */
    _contentViewBottomConstraint: undefined, // <BMLayoutConstraint>

    /**
     * The content view's left edge constraint.
     */
    _contentViewLeftConstraint: undefined, // <BMLayoutConstraint>

    /**
     * The content view's right edge constraint.
     */
    _contentViewRightConstraint: undefined, // <BMLayoutConstraint>

    /**
     * The computed height of the indicator.
     */
    get _indicatorHeight() { // <Number>
        const indicatorWidth = this.indicatorSize * Math.SQRT2;
        return indicatorWidth / 2 | 0;
    },

    /**
     * An array that specifies the permitted indicator directions that this popover
     * may use and the priority in which they will be evaluated.
     */
    _permittedDirections: [BMPopoverIndicatorDirection.Bottom, BMPopoverIndicatorDirection.Top, BMPopoverIndicatorDirection.Right, BMPopoverIndicatorDirection.Left], // <[BMPopoverIndicatorDirection]>
    get permittedDirections() {
        return this._permittedDirections.slice();
    },
    set permittedDirections(directions) {
        this._permittedDirections = directions.slice();

        this._updatePosition();
    },

    /**
     * Designated initializer. Initializes this popover with the given size.
     * 
     * Note that the size will also contain the indicator size, so the actual usable size will be smaller,
     * depending on how large the indicator is.
     * @param size <BMSize>     The popover's size.
     * @return <BMPopover>      This popover.
     */
    initWithSize(size) {
        const preliminaryFrame = BMRectMakeWithOrigin(BMPointMake(), {size});
        BMWindow.prototype.initWithFrame.call(this, preliminaryFrame, {modal: YES, toolbar: NO});

        this._edgeInsets = BMInsetMakeWithEqualInsets(8);

        this._size = size.copy();

        // Set up the popover container
        this.node.className = 'BMDarkModeAuto BMPopover';
        this.contentNode.className = 'BMDarkModeAuto BMPopoverContainer BMPopoverContainerView';

        this._overlay.node.className = 'BMPopoverOverlay';

        // A second layer is used to draw the drop shadow, due to the unusual shape of the popover window
        const popoverDropShadowContainer = document.createElement('div');
        popoverDropShadowContainer.className = 'BMDarkModeAuto BMPopoverContainerLayer BMPopoverDropShadowContainer';
        const popoverDropShadowContent = document.createElement('div');
        popoverDropShadowContent.className = 'BMDarkModeAuto BMPopoverDropShadowContent';
        popoverDropShadowContainer.appendChild(popoverDropShadowContent);

        // A third layer is used to draw the background
        const popoverBackground = document.createElement('div');
        popoverBackground.className = 'BMDarkModeAuto BMPopoverBackground';

        // Two additional sublayers are used for dark mode and contain the outline and background color.
        popoverBackground.innerHTML = '<div class="BMDarkModeAuto BMPopoverBackgroundDarkModeContainer"><div class="BMDarkModeAuto BMPopoverBackgroundDarkModeOutline"></div><div class="BMDarkModeAuto BMPopoverBackgroundDarkModeFill"></div></div>';

        // Add the popover to the document
        this.node.appendChild(popoverBackground);
        this.node.appendChild(popoverDropShadowContainer);
        this.node.appendChild(this.contentNode);

        this._background = popoverBackground;
        this._dropShadowContainer = popoverDropShadowContainer;
        this._dropShadowContent = popoverDropShadowContent;
        this._popoverDarkModeFill = this._background.querySelector('.BMPopoverBackgroundDarkModeFill');

        const contentView = this._contentView = BMView.view();
        this.addSubview(this._contentView);

        this._contentViewLeftConstraint = contentView.left.equalTo(this.left);
        this._contentViewLeftConstraint.isActive = YES;

        this._contentViewRightConstraint = contentView.right.equalTo(this.right);
        this._contentViewRightConstraint.isActive = YES;

        this._contentViewTopConstraint = contentView.top.equalTo(this.top);
        this._contentViewTopConstraint.isActive = YES;

        this._contentViewBottomConstraint = contentView.bottom.equalTo(this.bottom);
        this._contentViewBottomConstraint.isActive = YES;

        return this;
    },

    // @override - BMWindow
    initWithFrame(frame) {
        return this.initWithSize(frame.size);
    },

	// @override - BMView
	colorSchemeDidChange(scheme) {
		BMWindow.prototype.colorSchemeDidChange.apply(this, arguments);

		switch (this.colorScheme) {
			case BMViewColorScheme.Light:
				// Handled by BMWindow
				break;
			case BMViewColorScheme.Auto:
				// For auto mode, add the BMDarkModeAuto class to the elements whose appearance should change
				this._dropShadowContainer.classList.add('BMDarkModeAuto');
				this._dropShadowContent.classList.add('BMDarkModeAuto');
				this._background.classList.add('BMDarkModeAuto');
				this._popoverDarkModeFill.classList.add('BMDarkModeAuto');
                this._background.querySelector('.BMPopoverBackgroundDarkModeOutline').classList.add('BMDarkModeAuto');
                this._background.querySelector('.BMPopoverBackgroundDarkModeContainer').classList.add('BMDarkModeAuto');
				break;
			case BMViewColorScheme.Dark:
				// Dark is not yet supported
			default:
				throw new Error(`The color scheme ${scheme} is not supported on this view.`);
		}
	},

    /**
     * Set to `YES` while this popover is detached. When set to `YES` the popover is detached from
     * its anchor and can be freely moved. When set to `NO`, the popover remains attached to its
     * anchor in a fixed position.
     */
    _isDetached: NO, // <Boolean>

    get isDetached() {
        return this._isDetached;
    },

    /**
     * The current detached position of this popover.
     */
    _position: undefined, // <BMPoint>

    /**
     * The popover's current direction. Set to `undefined` until this popover is first displayed.
     */
    _direction: undefined, // <BMPopoverIndicatorDirection, nullable>

    /**
     * Controls whether this popover retains the direction that was set to it when it was first
     * displayed. When set to `NO`, whenever the popover's size or attributes change it will try
     * to find a new direction around the anchor. When set to `YES`, the current direction or the
     * initial display direction will be kept regardless of how the popover changes.
     * 
     * When set to `undefined`, this popover will use the behaviour set on the `BMPopover` class.
     */
    _retainsDirection: undefined, // <Boolean, nullable>

    get retainsDirection() {
        return this._retainsDirection ?? BMPopover._retainsDirection;
    },

    set retainsDirection(retains) {
        this._retainsDirection = retains;
    },

    /**
     * The current display configuration. Set to `undefined` until this popover is first displayed.
     */
    _config: undefined, // <_BMPopoverDisplayConfiguration, nullable>

    /**
     * The current display configuration. Set to `undefined` until this popover is first displayed.
     */
    get _displayConfiguration() { // <_BMPopoverDisplayConfiguration, nullable>
        return this._config;
    },

    set _displayConfiguration(config) {
        this._config = config;
        this._applyDisplayConfiguration(config);
    },

    /**
     * Invoked by CoreUI to create a new display configuration for this popover based on the
     * current values of its properties.
     * @return <_BMPopoverDisplayConfiguration>         The configuration.
     */
    _createDisplayConfiguration() {
        const frame = BMRectMake();
        frame.size.height = this._size.height;
        frame.size.width = this._size.width;
        frame.origin.x = (this._position?.x ?? this._frame.origin.x) | 0;
        frame.origin.y = (this._position?.y ?? this._frame.origin.y) | 0;

        const nodeFrame = this.anchorRect || (this.anchorNode && BMRectMakeWithNodeFrame(this.anchorNode));
        const location = this.anchorPoint ? this.anchorPoint.copy() : nodeFrame.center;

        // Determine the appropriate direction to display this popover
        let direction;
        if (this._direction && this.retainsDirection) {
            direction = this._direction;
        }
        else if (this.anchorPoint) {
            direction = this._directionAroundPoint(location);
        }
        else {
            direction = this._directionAroundRect(nodeFrame);
        }

        if (!this._isDetached) {
            // If this popover is attached, update the frame's position based on the anchor
            // Move the frame to the appropriate position based on the selected direction
            switch (direction) {
                case BMPopoverIndicatorDirection.Top:
                    frame.size.height += this._indicatorHeight;
                    frame.origin.y = this.anchorPoint ? location.y : nodeFrame.bottom - 2;
    
                    frame.origin.x = location.x - frame.size.width / 2 | 0;
    
                    if (frame.origin.x < this._edgeInsets.left) {
                        frame.origin.x = this._edgeInsets.left;
                    }
                    if (frame.right > window.innerWidth - this._edgeInsets.right) {
                        frame.origin.x = window.innerWidth - frame.size.width - this._edgeInsets.right;
                    }
                    break;
                case BMPopoverIndicatorDirection.Bottom:
                    frame.size.height += this._indicatorHeight;
                    frame.origin.y = this.anchorPoint ? location.y - frame.size.height : nodeFrame.origin.y + 2 - frame.size.height;
    
                    frame.origin.x = location.x - frame.size.width / 2 | 0;
    
                    if (frame.origin.x < this._edgeInsets.left) {
                        frame.origin.x = this._edgeInsets.left;
                    }
                    if (frame.right > window.innerWidth - this._edgeInsets.right) {
                        frame.origin.x = window.innerWidth - frame.size.width - this._edgeInsets.right;
                    }
                    break;
                case BMPopoverIndicatorDirection.Right:
                    frame.size.width += this._indicatorHeight;
                    frame.origin.x = this.anchorPoint ? location.x - frame.size.width : nodeFrame.origin.x + 2 - frame.size.width;
    
                    frame.origin.y = location.y - frame.size.height / 2 | 0;
    
                    if (frame.origin.y < this._edgeInsets.top) {
                        frame.origin.y = this._edgeInsets.top;
                    }
                    if (frame.bottom > window.innerHeight - this._edgeInsets.bottom) {
                        frame.origin.y = window.innerHeight - frame.size.height - this._edgeInsets.bottom;
                    }
                    break;
                case BMPopoverIndicatorDirection.Left:
                    frame.size.width += this._indicatorHeight;
                    frame.origin.x = this.anchorPoint ? location.x : nodeFrame.right - 2;
    
                    frame.origin.y = location.y - frame.size.height / 2 | 0;
    
                    if (frame.origin.y < this._edgeInsets.top) {
                        frame.origin.y = this._edgeInsets.top;
                    }
                    if (frame.bottom > window.innerHeight - this._edgeInsets.bottom) {
                        frame.origin.y = window.innerHeight - frame.size.height - this._edgeInsets.bottom;
                    }
                    break;
            }
        }
        else {
            // If the popover is detached, prevent it from exceeding the screen's size
            frame.size.width = BMNumberByConstrainingNumberToBounds(frame.size.width, 0, window.innerWidth);
            frame.size.height = BMNumberByConstrainingNumberToBounds(frame.size.height, 0, window.innerHeight);
            frame.origin.x = BMNumberByConstrainingNumberToBounds(frame.origin.x, 0, window.innerWidth - frame.size.width);
            frame.origin.y = BMNumberByConstrainingNumberToBounds(frame.origin.y, 0, window.innerHeight - frame.size.height);
        }

        // Determine the indicator's position along its edge
        let indicatorPosition;
        switch (direction) {
            case BMPopoverIndicatorDirection.Bottom:
            case BMPopoverIndicatorDirection.Top:
                if (!this._isDetached) {
                    frame.size.height -= this._indicatorHeight;
                }
                indicatorPosition = BMNumberByConstrainingNumberToBounds(location.x - frame.origin.x, this._borderRadius * 1.5 + this._indicatorSize * Math.SQRT2 / 2, frame.size.width - this._borderRadius * 1.5 - this._indicatorSize * Math.SQRT2 / 2);
                break;
            case BMPopoverIndicatorDirection.Left:
            case BMPopoverIndicatorDirection.Right:
                if (!this._isDetached) {
                    frame.size.width -= this._indicatorHeight;
                }
                indicatorPosition = BMNumberByConstrainingNumberToBounds(location.y - frame.origin.y, this._borderRadius * 1.5 + this._indicatorSize * Math.SQRT2 / 2, frame.size.height - this._borderRadius * 1.5 - this._indicatorSize * Math.SQRT2 / 2);
                break;
        }

        const indicatorSize = this._isDetached ? 0 : this._indicatorSize;

        const configuration = _BMPopoverDisplayConfiguration.configurationWithFrame(frame, {direction, indicatorSize, indicatorPosition, borderRadius: this._borderRadius});
        return configuration;
    },

    /**
     * Invoked by CoreUI to apply the specified display configuration to this popover and its various SVG elements.
     * @param config <_BMPopoverDisplayConfiguration>   The configuration to apply.
     */
    _applyDisplayConfiguration(config) {
		if (this.__released) {
            // Prevent configuration applications from throwing an error if a popover was released while an
            // animation was playing
            return;
        }

        const frame = config._frame.copy();
        const indicatorHeight = config._indicatorHeight;
        const direction = config._direction;

        // Adjust the constraints based on the direction
        switch (direction) {
            case BMPopoverIndicatorDirection.Top:
                frame.size.height += indicatorHeight;
                this._contentViewTopConstraint.constant = indicatorHeight;
                this._contentViewBottomConstraint.constant = 0;
                this._contentViewLeftConstraint.constant = 0;
                this._contentViewRightConstraint.constant = 0;
                break;
            case BMPopoverIndicatorDirection.Bottom:
                frame.size.height += indicatorHeight;
                this._contentViewTopConstraint.constant = 0;
                this._contentViewBottomConstraint.constant = -indicatorHeight;
                this._contentViewLeftConstraint.constant = 0;
                this._contentViewRightConstraint.constant = 0;
                break;
            case BMPopoverIndicatorDirection.Right:
                frame.size.width += indicatorHeight;
                this._contentViewTopConstraint.constant = 0;
                this._contentViewBottomConstraint.constant = 0;
                this._contentViewLeftConstraint.constant = 0;
                this._contentViewRightConstraint.constant = -indicatorHeight;
                break;
            case BMPopoverIndicatorDirection.Left:
                frame.size.width += indicatorHeight;
                this._contentViewTopConstraint.constant = 0;
                this._contentViewBottomConstraint.constant = 0;
                this._contentViewLeftConstraint.constant = indicatorHeight;
                this._contentViewRightConstraint.constant = 0;
                break;
        }

        const indicatorPosition = config._indicatorPosition;
        const borderRadius = config._borderRadius;
        const indicatorSize = config._indicatorSize;

        // Create an inner frame to be used by the various paths
        const innerFrame = frame.copy();
        innerFrame.origin = BMPointMake();

        const pathContent = `${this._pathForPopoverWithFrame(innerFrame, {indicatorSize, position: indicatorPosition, direction, radius: borderRadius})}`;
        const outlinePathContent = `${this._pathForPopoverWithFrame(innerFrame, {indicatorSize, inset: 1, position: indicatorPosition, direction, radius: borderRadius - 1.5})}`;
        const boxShadowPathContent = `${this._pathForPopoverWithFrame(innerFrame, {indicatorSize, position: indicatorPosition, direction, radius: borderRadius + 1.5})}`;

        if (!this._clipPathUUID && !CSS.supports('clip-path', `path('${pathContent}')`)) {
            // If inline path definitions are not supported by the browsers, create an UUID for a SVG clip path and create it
            this._clipPathUUID = BMUUIDMake();

            this._clipPathSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this._clipPathSVG.style.width = '0';
            this._clipPathSVG.style.height = '0';

            // Create and attach the main clip path
            const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
            clipPath.setAttribute('id', 'popover-clip-path-' + this._clipPathUUID);
            clipPath.setAttribute('clipPathUnits', 'userSpaceOnUse');
            this._clipPathBackgroundPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            clipPath.appendChild(this._clipPathBackgroundPath);

            this._clipPathSVG.appendChild(clipPath);

            // Create and attach the outline clip path
            const outlineClipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
            outlineClipPath.setAttribute('id', 'popover-outline-clip-path-' + this._clipPathUUID);
            outlineClipPath.setAttribute('clipPathUnits', 'userSpaceOnUse');
            this._clipPathOutlinePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            outlineClipPath.appendChild(this._clipPathOutlinePath);

            this._clipPathSVG.appendChild(outlineClipPath);

            // Create and attach the shadow clip path
            const boxShadowClipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
            boxShadowClipPath.setAttribute('id', 'popover-box-shadow-clip-path-' + this._clipPathUUID);
            boxShadowClipPath.setAttribute('clipPathUnits', 'userSpaceOnUse');
            this._clipPathBoxShadowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            boxShadowClipPath.appendChild(this._clipPathBoxShadowPath);

            this._clipPathSVG.appendChild(boxShadowClipPath);

            document.body.appendChild(this._clipPathSVG);
            
        }

        // For Chrome, update the path nodes
        if (this._clipPathUUID) {
            this._clipPathBackgroundPath.setAttribute('d', pathContent);
            this._clipPathOutlinePath.setAttribute('d', outlinePathContent);
            this._clipPathBoxShadowPath.setAttribute('d', boxShadowPathContent);
        }

        // For Blink/Chrome-based browsers clip-path: path() is not supported, but clip-path: url() can be used instead for that browser
        const path = this._clipPathUUID ? `url(#popover-clip-path-${this._clipPathUUID})` : `path('${pathContent}')`;
        const outlinePath = this._clipPathUUID ? `url(#popover-outline-clip-path-${this._clipPathUUID})` : `path('${outlinePathContent}')`;
        const boxShadowPath = this._clipPathUUID ? `url(#popover-box-shadow-clip-path-${this._clipPathUUID})` : `path('${boxShadowPathContent}')`;

        // Assign the frame to the window, and to the drop shadow container
        const positionStyle = {
            left: innerFrame.origin.x + 'px',
            top: innerFrame.origin.y + 'px',
            width: innerFrame.size.width + 'px',
            height: innerFrame.size.height + 'px'
        };
        BMCopyProperties(this.contentNode.style, positionStyle);

        const popoverDarkModeFill = this._background.querySelector('.BMPopoverBackgroundDarkModeFill');

        // Safari requires a forced style recalculation for the drop shadow and dark mode fill during animations
        if (BMPopover._requiresClipPathReflow) {
            popoverDarkModeFill.style.clipPath = 'none';
            popoverDarkModeFill.style.webkitClipPath = 'none';
            this._dropShadowContent.style.clipPath = 'none';
            this._dropShadowContent.style.webkitClipPath = 'none';

            // These trigger a forced reflow
            popoverDarkModeFill.offsetWidth;
            this._dropShadowContainer.offsetWidth;
        }

        BMCopyProperties(this._background.style, positionStyle);
        this._background.style.clipPath = path;
        this._background.style.webkitClipPath = path;

        popoverDarkModeFill.style.clipPath = outlinePath;
        popoverDarkModeFill.style.webkitClipPath = outlinePath;

        BMCopyProperties(this._dropShadowContainer.style, positionStyle);
        this._dropShadowContent.style.clipPath = boxShadowPath;
        this._dropShadowContent.style.webkitClipPath = boxShadowPath;

        const popoverLayers = [this.contentNode, this._background, this._dropShadowContainer];

        let transformOriginX, transformOriginY;
        switch (direction) {
            case BMPopoverIndicatorDirection.Bottom:
                transformOriginX = ((indicatorPosition / frame.size.width) * 100) + '%';
                transformOriginY = '100%';
                break;
            case BMPopoverIndicatorDirection.Top:
                transformOriginX = ((indicatorPosition / frame.size.width) * 100) + '%';
                transformOriginY = '0%';
                break;
            case BMPopoverIndicatorDirection.Left:
                transformOriginX = '0%';
                transformOriginY = ((indicatorPosition / frame.size.height) * 100) + '%';
                break;
            case BMPopoverIndicatorDirection.Right:
                transformOriginX = '100%';
                transformOriginY = ((indicatorPosition / frame.size.height) * 100) + '%';
                break;
        }

        for (const layer of popoverLayers) {
            layer.style.transformOrigin = `${transformOriginX} ${transformOriginY}`;
        }

        this.frame = frame;
        this.layoutIfNeeded();
    },

    /**
     * The number of display configuration animations running currently against this popover's display configuration.
     */
    _displayConfigurationAnimations: 0, // <Number>

    /**
     * A display configuration that will be applied to this popover at the end of any current
     * animations affecting the display configuration.
     */
    _pendingDisplayConfiguration: undefined, // <_BMPopoverDisplayConfiguration>

    /**
     * Animatable. Invoked by CoreUI to update this popover's position and recalculate the various paths used by it.
     */
    _updatePosition() {
        // If the popover is not currently visible, there is not action to take
        if (!this.isVisible) {
            return;
        }

        const config = this._createDisplayConfiguration();

        const context = BMAnimationContextGetCurrent();
        if (context) {
            const controller = context.controllerForObject(this, {node: this.node});
            controller.registerAnimatableProperty('_displayConfiguration', {targetValue: config});

            this._displayConfigurationAnimations++;
            // When all animations finish on this popover, if there was any pending display configuration, apply it then
            BMAnimationContextAddCompletionHandler(() => {
                this._displayConfigurationAnimations--;

                if (!this.isVisible) {
                    return;
                }

                if (!this._displayConfigurationAnimations && this._pendingDisplayConfiguration) {
                    BMAnimationContextBeginStatic(); {
                        this._displayConfiguration = this._pendingDisplayConfiguration;
                        this._pendingDisplayConfiguration = undefined;
                    } BMAnimationApplyBlocking();
                }
            });
        }
        else {
            if (this._displayConfigurationAnimations) {
                // If an animation is in progress, wait for it to finish before applying the new configuration
                this._pendingDisplayConfiguration = config;
            }
            else {
                // Else apply the configuration directly
                this._displayConfiguration = config;
            }
        }
    },

    /**
     * Determines the direction that the popover should appear in order to fit best around the given point.
     * The popover will verify directions in the order specified by the `permittedDirections` property.
     * If none of the permitted indicator directions would fit the popover in the viewport, the first
     * specified direction is returned.
     * @param point <BMPoint>                   The anchor point to check against.
     * @return <BMPopoverIndicatorDirection>    The direction that best fits.
     */
    _directionAroundPoint(point) {
        for (const direction of this._permittedDirections) {
            switch (direction) {
                case BMPopoverIndicatorDirection.Top:
                    if (point.y < window.innerHeight - this.size.height - this._indicatorHeight) {
                        return BMPopoverIndicatorDirection.Top;
                    }
                    break;
                case BMPopoverIndicatorDirection.Bottom:
                    if (point.y > this.size.height + this._indicatorHeight) {
                        return BMPopoverIndicatorDirection.Bottom;
                    }
                    break;
                case BMPopoverIndicatorDirection.Right:
                    if (point.x > this.size.width + this._indicatorHeight) {
                        return BMPopoverIndicatorDirection.Right;
                    }
                    break;
                case BMPopoverIndicatorDirection.Left:
                    if (point.x < window.innerWidth - this.size.width - this._indicatorHeight) {
                        return BMPopoverIndicatorDirection.Left;
                    }
                    break;
            }
        }

        return this._permittedDirections[0];
    },

    /**
     * Determines the direction that the popover should appear in order to fit best around the given rect.
     * The popover will verify directions in the order specified by the `permittedDirections` property.
     * If none of the permitted indicator directions would fit the popover in the viewport, the first
     * specified direction is returned.
     * @param rect <BMRect>                     The anchor rect to check against.
     * @return <BMPopoverIndicatorDirection>    The direction that best fits.
     */
    _directionAroundRect(rect) {
        for (const direction of this._permittedDirections) {
            switch (direction) {
                case BMPopoverIndicatorDirection.Top:
                    if (rect.bottom < window.innerHeight - this.size.height - this._indicatorHeight) {
                        return BMPopoverIndicatorDirection.Top;
                    }
                    break;
                case BMPopoverIndicatorDirection.Bottom:
                    if (rect.top > this.size.height + this._indicatorHeight) {
                        return BMPopoverIndicatorDirection.Bottom;
                    }
                    break;
                case BMPopoverIndicatorDirection.Right:
                    if (rect.left > this.size.width + this._indicatorHeight) {
                        return BMPopoverIndicatorDirection.Right;
                    }
                    break;
                case BMPopoverIndicatorDirection.Left:
                    if (rect.right < window.innerWidth - this.size.width - this._indicatorHeight) {
                        return BMPopoverIndicatorDirection.Left;
                    }
                    break;
            }
        }

        return this._permittedDirections[0];
    },

    /**
     * Builds the SVG path definition for a popover with the given frame. Note that the indicator will be positioned inside the frame, which will push the usable
     * area of the frame downwards.
     * @param frame <BMRect>                                        The popover's frame.
     * {
     *  @param indicatorSize <Number, nullable>                     Defaults to `8`. The size of the popover's indicator.
     *  @param radius <Number, nullable>                            Defaults to `4`. Controls how rounded the corners are.
     *  @param inset <Number, nullable>                             Defaults to `0`. An optional inset to apply to the path.
     *  @param position <Number, nullable>                          Defaults to half of the frame's width. The position along the edge of the frame on which to place the indicator.
     *                                                              This coordinate is relative to the popover's frame and represents the center position of the indicator.
     *                                                              This position should not overlap the specified corner radius.
     *  @param direction <BMPopoverIndicatorDirection, nullable>    Defaults to `.Top`. Controls where the indicator will be placed relative to the popover.
     * }
     * @return <String>                                 The SVG path.
     */
    _pathForPopoverWithFrame(frame, {indicatorSize = 8, radius = 8, inset = 0, position = undefined, direction = BMPopoverIndicatorDirection.Top} = {indicatorSize: 8, radius: 4, inset: 0}) {
        // Adjust the appropriate edge's position depending on the indicator direction
        let top = direction === BMPopoverIndicatorDirection.Top ? indicatorSize * Math.SQRT2 / 2 | 0 : 0;
        let left = direction == BMPopoverIndicatorDirection.Left ? indicatorSize * Math.SQRT2 / 2 | 0 : 0;

        let bottom = direction === BMPopoverIndicatorDirection.Bottom ? frame.size.height - indicatorSize * Math.SQRT2 / 2 | 0 : frame.size.height;
        let right = direction == BMPopoverIndicatorDirection.Right ? frame.size.width - indicatorSize * Math.SQRT2 / 2 | 0 : frame.size.width;

        if (inset) {
            // If an inset is specified, adjust the values appropriately
            indicatorSize = indicatorSize - inset;
            frame = frame.copy();
            frame.insetWithInset(BMInsetMakeWithEqualInsets(inset));
            radius = radius + inset;

            top += inset;
            left += inset;

            bottom -= inset;
            right -= inset;
        }

        if (position === undefined) {
            position = frame.size.width / 2 | 0;
        }
        else {
            position = (position - inset) | 0;
        }

        const knobWidth = indicatorSize * Math.SQRT2;
        const knobHeight = knobWidth / 2 | 0;

        const pathTop = direction === BMPopoverIndicatorDirection.Top ?
            // Start at top left, then draw the indicator and move to the end of the edge
            `M${left + radius},${top} ` +
            `L${(position - knobWidth / 2 + left)},${top} l${(knobWidth / 2)},${-knobHeight} l${(knobWidth / 2)},${knobHeight} ` +
            `L${right - radius},${top} ` :
            // Start at top left, then move to the end of the edge
            `M${left + radius},${top} ` +
            `L${right - radius},${top} `;

        const pathRight = direction == BMPopoverIndicatorDirection.Right ? 
            // Draw the rounded corner, then the indicator and move to the end of the edge
            `Q${right},${top} ${right},${top + radius} ` +
            `L${right},${(position - knobWidth / 2 + top)} l${knobHeight},${(knobWidth / 2)} l${-knobHeight},${(knobWidth / 2)} ` +
            `L${right},${bottom - radius} ` :
            // Draw the rounded corner, then move to the end of the dge
            `Q${right},${top} ${right},${top + radius} ` +
            `L${right},${bottom - radius} `;

        const pathBottom = direction === BMPopoverIndicatorDirection.Bottom ?
            // Draw the rounded corner, then the indicator and move to the end of the edge
            `Q${right},${bottom} ${right - radius},${bottom} ` +
            `L${(position + knobWidth / 2 + left)},${bottom} l${(-knobWidth / 2)},${knobHeight} l${(-knobWidth / 2)},${-knobHeight} ` +
            `L${left + radius},${bottom} ` :
            // Draw the rounded corner, then move to the end of the edge
            `Q${right},${bottom} ${right - radius},${bottom} ` +
            `L${left + radius},${bottom} `;

        const pathLeft = direction === BMPopoverIndicatorDirection.Left ?
            // Draw the rounded corner coming from the bottom left, then the indicator
            // afterwards move to the end of the edge and finally draw the rounded corner coming from the left to top
            `Q${left},${bottom} ${left},${bottom - radius} ` +
            `L${left},${(position + knobWidth / 2 + top)} l${-knobHeight},${(-knobWidth / 2)} l${knobHeight},${(-knobWidth / 2)} ` +
            `L${left},${top + radius} ` +
            `Q${left},${top} ${left + radius},${top} Z` :
            // Draw the rounded corner coming from the bottom left, then move to
            // the end of the edge and finally draw the rounded corner coming from the left to top
            `Q${left},${bottom} ${left},${bottom - radius} ` +
            `L${left},${top + radius} ` +
            `Q${left},${top} ${left + radius},${top} Z`;


        let path =  pathTop;
        path +=     pathRight; //`Q${right},${top} ${right},${top + radius} L${right},${bottom - radius} `;
        path +=     pathBottom;
        path +=     pathLeft; //`Q${left},${bottom} ${left},${bottom - radius} L${left},${top + radius} Q${left},${top} ${radius},${top} Z`;

        return path;
    },

    /**
     * Controls whether an in-progress drag can detach this popover.
     */
    _canDetach: NO, // <Boolean>

    /**
     * @protected
     * Controls whether this popover is detachable. Defaults to the result provided
     * by the delegate.
     * @return <Boolean>    `YES` if the popover is detachable, `NO` otherwise.
     */
    isDetachable() {
        return this.delegate?.popoverCanDetach?.(this) ?? NO;
    },

    /**
     * During a drag operation set to the point where the drag began.
     */
    _initialDragPosition: undefined, // <BMPoint, nullable>

    // @override - BMWindow
    dragBeganAtPosition(position, {withEvent: event}) {
        this._canDetach = this.isDetachable();

        // If the popover is neither detached nor can it detach, drags cannot be performed
        if (!this._canDetach && !this._isDetached) {
            return;
        }

        this._initialDragPosition = position.copy();
        BMWindow.prototype.dragBeganAtPosition.apply(this, arguments);
    },

    // @override - BMWindow
    dragPositionDidChangeFromPosition(fromPosition, {toPosition, event}) {
        if (!this._canDetach && !this._isDetached) {
            return;
        }

        if (!this._isDetached) {
            const popoverLayers = [this.contentNode, this._background, this._dropShadowContainer];

            // If not detached, apply a displacement to this popover that is half of the regular
            // drag distance, until this popover is fully detached
            for (const node of popoverLayers) {
                BMHook(node, {
                    translateX: `${(toPosition.x - this._initialDragPosition.x) / 3 | 0}px`,
                    translateY: `${(toPosition.y - this._initialDragPosition.y) / 3 | 0}px`,
                });
            }

            const distance = toPosition.distanceToPoint(this._initialDragPosition);
            if (distance > BMPopoverDragThreshold) {
                // If the movement exceeds the detachment threshold, detach this popover
                this.detachAnimated(YES);
            }
        }
        else {
            // If this is detached, update the popover's position
            this._position = BMPointMake(
                BMNumberByConstrainingNumberToBounds(this._position.x + toPosition.x - fromPosition.x, 0, window.innerWidth - this.frame.size.width),
                BMNumberByConstrainingNumberToBounds(this._position.y + toPosition.y - fromPosition.y, 0, window.innerHeight - this.frame.size.height),
            );
            this._displayConfiguration = this._createDisplayConfiguration();
        }
    },

    // @override - BMWindow
	dragEndedAtPosition(position, {withEvent: event}) {
        BMWindow.prototype.dragEndedAtPosition.apply(this, arguments);

        if (!this._isDetached && this._canDetach) {
            // If the drag operation didn't cause this popover to detach, animate it back to its
            // regular position
            BMAnimateWithBlock(() => {
                const popoverLayers = [this.contentNode, this._background, this._dropShadowContainer];

                for (const node of popoverLayers) {
                    const controller = BMAnimationContextGetCurrent().controllerForObject(node, {node});
                    controller.registerBuiltInPropertiesWithDictionary({
                        translateX: '0px',
                        translateY: '0px',
                    });
                }
            }, {duration: 500, easing: 'easeInOutQuart'});
        }

        this._canDetach = NO;
	},

    /**
     * Detaches this popover from its anchor and allows it to be freely movable.
     * @param animated <Boolean, nullable>  Defaults to `YES`. When set to `YES`, this change will be animated,
     *                                      otherwise it will be instant.
     * @returns <Promise<void>>             A promise that resolves when the operation completes.
     */
    detachAnimated(animated) {
        // If this popover is already detached, this method has no effect
        if (this._isDetached) {
            return;
        }

        // If this change is animated and there isn't already an active animation context, start one
        let animationContextStarted = NO;
        if (animated && !BMAnimationContextGetCurrent()) {
            animationContextStarted = YES;
            BMAnimationBeginWithDuration(300, {easing: 'easeInOutQuart'});
        }

        this._isDetached = YES;
        this._displayConfiguration = this._createDisplayConfiguration();
        this._position = this.frame.origin.copy();

        let promise;

        const popoverLayers = [this.contentNode, this._background, this._dropShadowContainer];

        // If a temporary transform was applied to this node, clear it
        for (const node of popoverLayers) {
            if (BMAnimationContextGetCurrent()) {
                const controller = BMAnimationContextGetCurrent().controllerForObject(node, {node});
                controller.registerBuiltInPropertiesWithDictionary({
                    translateX: '0px',
                    translateY: '0px',
                });

                promise = new Promise(r => BMAnimationContextAddCompletionHandler(r));
            }
            else {
                BMHook(node, {translateX: '0px', translateY: '0px'});
            }
        }
        

        if (animationContextStarted) {
            BMAnimationApplyBlocking(YES);
        }

        if (!promise) {
            promise = Promise.resolve();
        }

        return promise;
    },

    // @override - BMWindow
    animateInWithCompletionHandler(completionHandler) {
        const popoverLayers = [this.contentNode, this._background, this._dropShadowContainer];

        this.node.style.opacity = 1;

        let first = YES;
        for (const layer of popoverLayers) {
            BMHook(layer, {scaleX: .75, scaleY: .75, opacity: 0});

            __BMVelocityAnimate(layer, {scaleX: 1, scaleY: 1, opacity: 1}, {duration: 300, easing: [0,1.59,.49,1], complete: first ? completionHandler : undefined}, YES)?.then(() => {
                BMHook(layer, {scaleX: 1, scaleY: 1, opacity: 1});
            });
            first = NO;
        }
    },

    // @override - BMWindow
    animateOutWithCompletionHandler(completionHandler) {
        const popoverLayers = [this.contentNode, this._background, this._dropShadowContainer];

        const self = this;

        let first = YES;
        for (const layer of popoverLayers) {
            layer.style.pointerEvents = 'none';

            const runCompletionHandler = first;
            __BMVelocityAnimate(layer, {scaleX: .9, scaleY: .9, opacity: 0}, {duration: 200, easing: 'easeInOutQuart', complete() {
                if (runCompletionHandler) {
                    self.node.style.opacity = 0;
                    completionHandler();
                }
            }}, YES);
            first = NO;
        }
    },

    // @override - BMWindow
    bringToFrontAnimated(animated, args) {
        if (!this.anchorNode && !this.anchorPoint && !this.anchorRect) throw new Error('The anchorPoint, anchorRect or anchorNode must be set prior to showing this popover.');

        this._displayConfiguration = this._createDisplayConfiguration();

        BMWindow.prototype.bringToFrontAnimated.apply(this, arguments);
    },

    // @override - BMWindow
    release() {
        if (this._clipPathUUID) {
            this._clipPathSVG.remove();
        }

        return BMWindow.prototype.release.apply(this, arguments);
    }

});

/**
 * Constructs and returns a popover with the specified size.
 * @param size <BMSize>         The popover's size.
 * @return <BMPopover>          A popover.
 */
BMPopover.popoverWithSize = function (size) {
    return (new BMPopover).initWithSize(size);
}

/**
 * Controls whether popovers retain the direction that was set to them when they were first
 * displayed, by default. When set to `NO`, whenever a popover's size or attributes change it will try
 * to find a new direction around the anchor. When set to `YES`, the current direction or the
 * initial display direction will be kept regardless of how the popover changes.
 */
BMPopover._retainsDirection = NO; // <Boolean>

/**
 * Controls whether popovers retain the direction that was set to them when they were first
 * displayed, by default. When set to `NO`, whenever a popover's size or attributes change it will try
 * to find a new direction around the anchor. When set to `YES`, the current direction or the
 * initial display direction will be kept regardless of how the popover changes.
 * @param retains <Boolean, nullable>       Defaults to `NO`. When set to `YES`, popovers will retain their
 *                                          initial direction, otherwise they will recalculate their direction
 *                                          whenever any update occurs.
 */
BMPopover.setRetainsDirection = function (retains) {
    BMPopover._retainsDirection = retains || NO;
}

// Set to YES for safari, which requires a reflow when the clip path is updated on some of the popover components
BMPopover._requiresClipPathReflow = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// @endtype
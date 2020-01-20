// @ts-check

import {YES, NO, BMExtend, BMCopyProperties, BMIsTouchDevice, BMNumberByConstrainingNumberToBounds, BMAddSmoothMousewheelInteractionToNode} from '../Core/BMCoreUI'
import {BMInsetMakeWithEqualInsets} from '../Core/BMInset'
import {BMPointMake} from '../Core/BMPoint'
import {BMSizeMake} from '../Core/BMSize'
import {BMRectMake, BMRectMakeWithNodeFrame} from '../Core/BMRect'
import {BMIndexPathMakeWithRow} from '../Core/BMIndexPath'
import {BMAnimateWithBlock, __BMVelocityAnimate, BMAnimationContextGetCurrent, BMHook, BM_USE_VELOCITY2, BMAnimationContextAddCompletionHandler} from '../Core/BMAnimationContext'
import {BMLayoutOrientation, BMLayoutSizeClass} from '../BMView/BMLayoutSizeClass'
import {BMViewport} from '../BMView/BMViewport'
import {BMLayoutConstraint, BMEqualAttributeLayoutConstraint, BMEqualSpacingLayoutConstraint, BMLayoutAttribute, BMLayoutConstraintKind, BMLayoutConstraintPriorityRequired, BMLayoutConstraintRelation} from '../BMView/BMLayoutConstraint_v2.5'
import {BMView} from '../BMView/BMView_v2.5'
import {BMMenuKind, BMMenuItem} from '../BMView/BMMenu'
import {BMWindow} from '../BMWindow/BMWindow'
import {BMCollectionViewCell} from '../BMCollectionView/BMCollectionViewCell'
import {BMCollectionViewFlowLayoutSupplementaryView, BMCollectionViewFlowLayoutGravity, BMCollectionViewFlowLayoutAlignment} from '../BMCollectionView/BMCollectionViewFlowLayout'
import {BMCollectionView} from '../BMCollectionView/BMCollectionView'
import { _BMLayoutEditorSettingsView } from './BMLayoutEditorSettings'
import { BMToolWindow } from '../BMWindow/BMToolWindow'
import { BMTextField } from '../BMView/BMTextField'
import {BMLayoutEditorVariableCell, BMLayoutEditorEmptyVariablesCell, BMLayoutEditorVariablesDataSet} from './BMLayoutEditorVariablesController'
import { BMKeyboardShortcut, BMKeyboardShortcutModifier } from '../BMWindow/BMKeyboardShortcut'


var _BMWindowAnimationDurationDefault = 400;
var _BMWindowAnimationEasingDefault = 'easeInOutQuart';

// Uses the new settings view when set to `YES`.
export let BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW = YES;

// The smallest distance allowed between two view edges to be considered
// when creating automatic constraint that link the same attributes (e.g. leading to leading)
const BM_LAYOUT_EDITOR_AUTO_CONSTRAINT_MARGIN = 16;

// The smallest ideal distance allowed between two view frames to be prioritised
// when creating automatic constraint that link spacing attributes (e.g. trailing to leading)
const BM_LAYOUT_EDITOR_AUTO_CONSTRAINT_SPACING = 64;

// The height to use for the toolbar
const _BMLayoutEditorToolbarHeight = 32;

// @type BMLayoutEditor extends BMWindow

/**
 * The layout editor is a popup window that helps users edit the constraints for that
 * view's layout.
 * 
 * Layout editor should be initialized with the root of the view hierarchy that should be edited.
 * The layout editor will automatically extract and update the constraints from the view hierarchy.
 */
export function BMLayoutEditor() {} // <constructor>

BMLayoutEditor.prototype = BMExtend(Object.create(BMWindow.prototype), {

    /**
     * The root of the view hierarchy managed by this layout editor.
     */
    _view: undefined, // <BMView>
    get view() {
        return this._view;
    },

    _settingsView: undefined, // <_BMLayoutEditorSettingsView>

    /**
     * Set to `YES` while constraints are being created using a touch interface.
     * This causes regular touch events to create constraints instead of triggering a
     * frame displacement.
     */
    isCreatingTouchConstraints: NO,

    // @override - BMWindow
    _dismissAnimated(animated, args) {
        args = args || {};

        var completionHandler;
        if (args.completionHandler) {
            completionHandler = args.completionHandler;
        }

        let copyNode = this._view.node.cloneNode(YES);
        let workspace = this._view.node.parentNode;

        this._view.layoutEditor = undefined;
        this._rootNode.appendChild(this._view.node);
        this._view.node.querySelectorAll('.BMLayoutEditorViewSelector, .BMLayoutEditorConstraint, .BMLayoutEditorVerticalLeadLine, .BMLayoutEditorHorizontalLeadLine')
            .forEach(node => node.remove());

        this._view.allSubviews.forEach(subview => subview.node.classList.remove('BMLayoutEditorManagedView'));

        this._view.layout();

        workspace.appendChild(copyNode);

        args.completionHandler = () => {

            if (completionHandler) completionHandler();

        }

        window.removeEventListener('resize', this.resizeListener);

        return BMWindow.prototype.dismissAnimated.call(this, animated, args);
    },

    // @override - BMView
    frameForDescendant(descendant) {
        let frame = BMView.prototype.frameForDescendant.apply(this, arguments);
        
        if (descendant == this.workspaceWrapperView) {
            if (this._staticWorkspaceSize) {
                this._staticWorkspaceWidth = this._staticWorkspaceSize.width;
                this._staticWorkspaceHeight = this._staticWorkspaceSize.height;
            }
            else {
                this._staticWorkspaceWidth = frame.size.width;
                this._staticWorkspaceHeight = frame.size.height;
            }
            this._view.layout();
        }
        return frame;
    },

    /**
     * Animatable. The current pan offset.
     */
    _panOffset: BMPointMake(), // <BMPoint>
    get panOffset() {
        return this._panOffset.copy();
    },
    set panOffset(offset) {
        offset = offset.copy();
        this._panOffset = offset;
        
        if (BMAnimationContextGetCurrent()) {
            const controller = BMAnimationContextGetCurrent().controllerForObject(this.workspace, {node: this.workspace.node});
            controller.registerBuiltInPropertiesWithDictionary({translateX: offset.x + 'px', translateY: offset.y + 'px'});
        }
        else {
            BMHook(this.workspace.node, {translateX: offset.x + 'px', translateY: offset.y + 'px'});
        }
    },


    /**
     * Designated initializer. Must be invoked after creating this layout editor, passing in the
     * root of the view hierarchy whose layout will be edited by this window.
     * The view's node will be temporarily detached from its parent and attached to the layout editor
     * while it is being edited.
     * @param view <BMView>                                                 The view.
     * {
     *  @param layoutVariableProvider <BMLayoutVariableProvider, nullable>  Defaults to the global layout variable provider. The layout variable provider to use with this view hierarchy.
     * }
     * @return <BMLayoutEditor>                                             This layout editor.
     */
    initWithView(view, args) {
        this._view = view;
        this._rootNode = view.node.parentNode;
        this._view.layoutEditor = this;

        this.layoutVariableProvider = (args && args.layoutVariableProvider) || BMView;
        this.layoutVariableProvider.prepareLayoutVariables();

        this.resizeListener = event => view.needsLayout = YES;
        window.addEventListener('resize', this.resizeListener);

        view.allSubviews.forEach(subview => {
            // Create and add the selector, that takes over interactions for the view
            let selector = document.createElement('div');
            selector.className = 'BMLayoutEditorViewSelector';

            subview._selector = selector;
            subview.node.classList.add('BMLayoutEditorManagedView');

            // Also add a resize drag handle that can be used to resize the view's frame
            const dragHandle = document.createElement('div');
            dragHandle.className = 'material-icons BMWindowDragHandle BMLayoutEditorViewDragHandle';
            dragHandle.innerText = 'dehaze';
			dragHandle.style.cursor = 'nwse-resize';

            selector.appendChild(dragHandle);

	
			let touchDragPoint;
            
			// Initialize dragging touch events for the drag handler
			dragHandle.addEventListener('mousedown', event => {
	
				let size = BMSizeMake(subview.frame.size.width, subview.frame.size.height);
                let lastPosition = BMPointMake(event.clientX, event.clientY);
                
                let didRemoveConstraints = NO;
	
				let mouseMoveEventListener = event => {
                    if (!didRemoveConstraints) {
                        this._view.node.querySelectorAll('.BMLayoutEditorConstraint, .BMLayoutEditorLeadLine').forEach(node => node.remove());
                        didRemoveConstraints = YES;
                    }

                    let position = BMPointMake(event.clientX, event.clientY);
                    const frame = subview.frame.copy();
					frame.size.width = size.width + (position.x - lastPosition.x) / this.scale;
					frame.size.height = size.height + (position.y - lastPosition.y) / this.scale;
					subview.frame = frame;
					size = BMSizeMake(size.width + (position.x - lastPosition.x) / this.scale, size.height + (position.y - lastPosition.y) / this.scale);
                    lastPosition = position;
                    
                    event.preventDefault();
                    event.stopPropagation();
				};

				let mask = document.createElement('div');
				mask.className = 'BMLayoutGuideMask';
				mask.style.cursor = 'nwse-resize';
				document.body.appendChild(mask);
	
				let mouseUpEventListener = event => {
					window.removeEventListener('mousemove', mouseMoveEventListener, YES);
					window.removeEventListener('mouseup', mouseUpEventListener, YES);
					mask.remove();
                    event.preventDefault();
                    event.stopPropagation();

                    this.selectView(subview);
				}
	
				window.addEventListener('mousemove', mouseMoveEventListener, YES);
				window.addEventListener('mouseup', mouseUpEventListener, YES);
	
                event.preventDefault();
                event.stopPropagation();
			});
	
			let touchDragHandlePoint;
	
			dragHandle.addEventListener('touchstart', /** @type {TouchEvent} */ event => {
				// If there is already a drag in progress, don't process this new event
				if (typeof touchDragPoint !== 'undefined') {
					return;
				}
	
				// Only use the first touch point
				touchDragHandlePoint = event.changedTouches[0].identifier;
	
				let size = BMSizeMake(subview.frame.size.width, subview.frame.size.height);
                let lastPosition = BMPointMake(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                
                let didRemoveConstraints = NO;
	
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
                    
                    if (!didRemoveConstraints) {
                        this._view.node.querySelectorAll('.BMLayoutEditorConstraint, .BMLayoutEditorLeadLine').forEach(node => node.remove());
                        didRemoveConstraints = YES;
                    }
	
					let position = BMPointMake(touch.clientX, touch.clientY);
                    const frame = subview.frame.copy();
					frame.size.width = size.width + (position.x - lastPosition.x) / this.scale;
					frame.size.height = size.height + (position.y - lastPosition.y) / this.scale;
					subview.frame = frame;
					size = BMSizeMake(size.width + (position.x - lastPosition.x) / this.scale, size.height + (position.y - lastPosition.y) / this.scale);
					lastPosition = position;
                    event.preventDefault();
                    event.stopPropagation();
				};
	
				let mouseUpEventListener = event => {
					touchDragHandlePoint = undefined;
					window.removeEventListener('touchmove', mouseMoveEventListener);
					window.removeEventListener('touchend', mouseUpEventListener);
                    window.removeEventListener('touchcancel', mouseUpEventListener);
                    
                    event.preventDefault();
                    event.stopPropagation();

                    this.selectView(subview);
				}
	
				window.addEventListener('touchmove', mouseMoveEventListener);
				window.addEventListener('touchend', mouseUpEventListener);
				window.removeEventListener('touchcancel', mouseUpEventListener);
	
				event.preventDefault();
                event.stopPropagation();
            });
            
            // Enable double click to select views
            let doubleClickTimeout;

            selector.addEventListener('click', event => {
                if (event.altKey) return;

                this.selectView(subview, {withEvent: event});
                if (!doubleClickTimeout) {
                    doubleClickTimeout = setTimeout(() => doubleClickTimeout = undefined, 250);
                }
                else {
                    doubleClickTimeout = undefined;
                    if (!this._detailsToolWindow._visible) {
                        this._detailsToolWindow.bringToFrontAnimated(YES, {fromRect: BMRectMakeWithNodeFrame(this._inspectorButton)});
                    }
                }

                event.stopPropagation();
                event.stopImmediatePropagation();
            });

            this.initDragEventListenerForNode(selector, {view: subview});

            // Disable all other non-right mouse button interactions
            selector.addEventListener('mousedown', event => (event.button != 2) && (event.stopPropagation(), event.stopImmediatePropagation()));
            selector.addEventListener('mousemove', event => (event.button != 2) && (event.stopPropagation(), event.stopImmediatePropagation()));
            selector.addEventListener('mouseup', event => (event.button != 2) && (event.stopPropagation(), event.stopImmediatePropagation()));


            if (subview.node.childNodes.length) {
                subview.node.insertBefore(selector, subview.node.childNodes[0]);
            }
            else {
                subview.node.appendChild(selector);
            }
        });

        var width = document.documentElement.clientWidth;
        var height = document.documentElement.clientHeight;
        let frame = BMRectMake(0, 0, width, height);
        BMWindow.prototype.initWithFrame.call(this, frame, {toolbar: NO});
        this._node.classList.add('BMLayoutEditor');
        this._overlay._node.classList.add('BMLayoutEditorBlocker');

        window.addEventListener('resize', event => {
            var width = document.documentElement.clientWidth;
            var height = document.documentElement.clientHeight;
            this.frame = BMRectMake(0, 0, width, height);
        });

        this.content.style.backgroundColor = 'rgba(255, 255, 255, .8)';

        var treeNode = document.createElement('div');
        treeNode.classList.add('BMLayoutEditorTree');
        this.treeNode = treeNode;

        if (!('backdropFilter' in document.body.style) && !('webkitBackdropFilter' in document.body.style)) {
            treeNode.style.backgroundColor = '#F8F8F8';
        }

        this.content.appendChild(treeNode);

        this.tree = _BMLayoutEditorTree.editorTreeWithView(view, {node: treeNode, editor: this});

        if (BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW) {
            const frame = BMRectMake(64, 56 + 64, 320, window.innerHeight - 56 - 280);
            const treeWindow = BMToolWindow.toolWindowWithFrame(frame, {forWindow: this});
            treeWindow.addSubview(this.tree);
            this._treeWindow = treeWindow;

            treeWindow.opensAutomatically = NO;

            this.tree.left.equalTo(treeWindow.left).isActive = YES;
            this.tree.right.equalTo(treeWindow.right).isActive = YES;
            this.tree.top.equalTo(treeWindow.top).isActive = YES;
            this.tree.bottom.equalTo(treeWindow.bottom).isActive = YES;

            const closeButton = document.createElement('div');
            closeButton.className = 'BMWindowToolbarButton BMLayoutEditorToolbarButton BMLayoutEditorCloseButton BMLayoutEditorFullscreen BMLayoutEditorDetailsCloseButton';
            closeButton.innerHTML = '<i class="material-icons">&#xE5CD;</i>';
    
            closeButton.style.opacity = '1';
            closeButton.style.pointerEvents = 'all';
    
            closeButton.addEventListener('click', e => treeWindow.dismissAnimated(YES));
            treeWindow.node.appendChild(closeButton);

            treeWindow.node.classList.add('BMLayoutEditorDetailsWindow');
            treeWindow.toolbar.style.height = '64px';
        }
        else {
            this.addSubview(this.tree);
        }

        if (!BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW) {
            let closeButton = document.createElement('div');
            closeButton.className = 'BMWindowToolbarButton BMLayoutEditorToolbarButton BMLayoutEditorCloseButton BMLayoutEditorFullscreen';
            closeButton.innerHTML = '<i class="material-icons">&#xE5CD;</i>';

            closeButton.style.opacity = 1;
            closeButton.style.pointerEvents = 'all';

            closeButton.addEventListener('click', event => this.dismissAnimated(YES, {toNode: this._returnNode}));
            
            this.content.appendChild(closeButton);
        }

        this._initKeyboardShortcuts();

        // The workspace area represents the center portion of the layout editor
        var workspaceArea = document.createElement('div');
        workspaceArea.className = 'BMLayoutEditorWorkspaceArea';
        this.content.appendChild(workspaceArea);
        this.workspaceArea = workspaceArea;
        this.workspaceView = BMView.viewForNode(workspaceArea);
        this.addSubview(this.workspaceView);


        var workspaceToolbar = document.createElement('div');
        workspaceToolbar.className = 'BMLayoutEditorWorkspaceToolbar BMWindowToolbarMini';
        workspaceArea.appendChild(workspaceToolbar);
        this._initToolbar(workspaceToolbar);
        this.workspaceToolbar = workspaceToolbar;
        this.workspaceToolbarView = BMView.viewForNode(workspaceToolbar);
        this.workspaceView.addSubview(this.workspaceToolbarView);

        var workspaceWrapper = document.createElement('div');
        workspaceWrapper.className = 'BMLayoutEditorWorkspaceWrapper';
        workspaceArea.appendChild(workspaceWrapper);
        this.workspaceWrapperView = BMView.viewForNode(workspaceWrapper);
        this.workspaceView.addSubview(this.workspaceWrapperView);

        var workspaceNode = document.createElement('div');
        workspaceNode.className = 'BMLayoutEditorWorkspace';
        workspaceWrapper.appendChild(workspaceNode);
        this.workspaceNode = workspaceNode;
        this.workspace = BMView.viewForNode(workspaceNode);
        this.workspaceWrapperView.addSubview(this.workspace);

        BMAddSmoothMousewheelInteractionToNode(workspaceWrapper);
        this._initWorkspaceGestures();

        this.panOffset = BMPointMake();

        // The details node represents the right portion of the window
        let detailsNode = document.createElement('div');
        detailsNode.className = 'BMLayoutEditorDetails';
        this.detailsNode = detailsNode;
        this.detailsView = BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW ? _BMLayoutEditorSettingsView.settingsViewWithNode(detailsNode, {forEditor: this}) : BMView.viewForNode(detailsNode);

        if (BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW) {
            detailsNode.classList.add('BMLayoutEditorDetailsView');

            const frame = BMRectMake(window.innerWidth - 64 - 384, 56 + 64, 320, Math.min(window.innerHeight - 56 - 128, 576));
            const detailsToolWindow = BMToolWindow.toolWindowWithFrame(frame, {forWindow: this});
            detailsToolWindow.addSubview(this.detailsView);
            this.detailsView.left.equalTo(detailsToolWindow.left).isActive = YES;
            this.detailsView.right.equalTo(detailsToolWindow.right).isActive = YES;
            this.detailsView.top.equalTo(detailsToolWindow.top).isActive = YES;
            this.detailsView.bottom.equalTo(detailsToolWindow.bottom).isActive = YES;

            this.detailsView._window = detailsToolWindow;
            detailsToolWindow.delegate = this.detailsView;

            detailsToolWindow.node.classList.add('BMLayoutEditorDetailsWindow');

            const closeButton = document.createElement('div');
            closeButton.className = 'BMWindowToolbarButton BMLayoutEditorToolbarButton BMLayoutEditorCloseButton BMLayoutEditorFullscreen BMLayoutEditorDetailsCloseButton';
            closeButton.innerHTML = '<i class="material-icons">&#xE5CD;</i>';
    
            closeButton.style.opacity = '1';
            closeButton.style.pointerEvents = 'all';
    
            closeButton.addEventListener('click', e => {
                this.detailsView._dismissedByUser = YES;
                detailsToolWindow.dismissAnimated(YES, {toRect: BMRectMakeWithNodeFrame(this._inspectorButton)});
            });
            detailsToolWindow.node.appendChild(closeButton);
            detailsToolWindow.toolbar.style.height = '64px';
            detailsToolWindow.opensAutomatically = NO;

            this._detailsToolWindow = detailsToolWindow;
        }
        else {
            this.content.appendChild(detailsNode);
            this.addSubview(this.detailsView);

            // With the legacy settings panel, these titles are managed by the layout editor
            let detailsNodeTitle = document.createElement('div');
            detailsNodeTitle.className = 'BMWindowTitle';
            detailsNode.appendChild(detailsNodeTitle);
            this.detailsNodeTitle = detailsNodeTitle;
    
            let detailsNodeContent = document.createElement('div');
            detailsNodeContent.className = 'BMLayoutEditorDetailsContent';
            detailsNode.appendChild(detailsNodeContent);
            this.detailsNodeContent = detailsNodeContent;
        }

        // Set up constraints for the main layout
        if (!BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW) {
            this.tree.top.equalTo(this.top).isActive = YES;
            this.tree.bottom.equalTo(this.bottom).isActive = YES;
        }
        const equalAttributeViews = BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW ? [this, this.workspaceView] : [this.tree, this.workspaceView, this.detailsView];
        BMEqualAttributeLayoutConstraint.constraintWithAttribute(BMLayoutAttribute.Top, {forViews: equalAttributeViews}).isActive = YES;
        BMEqualAttributeLayoutConstraint.constraintWithAttribute(BMLayoutAttribute.Bottom, {forViews: equalAttributeViews}).isActive = YES;
        
        if (!BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW) {
            this.tree.leading.equalTo(this.leading).isActive = YES;
            this.tree.trailing.equalTo(this.workspaceView.leading).isActive = YES;
        }
        else {
            this.workspaceView.leading.equalTo(this.leading).isActive = YES;
        }
        this.workspaceView.trailing.equalTo(BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW ? this.trailing : this.detailsView.leading).isActive = YES;
        if (BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW) this.detailsView.trailing.equalTo(this.trailing).isActive = YES;

        //BMEqualSpacingLayoutConstraint.constraintOfKind(BMLayoutConstraintKind.Horizontal, {forViews: [this.tree, this.workspaceView, this.detailsView], withSuperview: YES}).isActive = YES;
        this.treeWidthConstraint = this.tree.width.equalTo(256);
        if (!BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW) this.treeWidthConstraint.isActive = YES;

        this.detailsWidthConstraint = this.detailsView.width.equalTo(344, {priority: 1});
        if (!BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW) this.detailsWidthConstraint.isActive = YES;

        // Set up constraints for the workspace layout
        this.workspaceToolbarView.top.equalTo(this.workspaceView.top).isActive = YES;
        this.workspaceToolbarView.bottom.equalTo(this.workspaceWrapperView.top).isActive = YES;
        this.workspaceWrapperView.bottom.equalTo(this.workspaceView.bottom).isActive = YES;

        this.workspaceToolbarView.leading.equalTo(this.workspaceView.leading).isActive = YES;
        this.workspaceToolbarView.trailing.equalTo(this.workspaceView.trailing).isActive = YES;
        this.workspaceWrapperView.leading.equalTo(this.workspaceView.leading).isActive = YES;
        this.workspaceWrapperView.trailing.equalTo(this.workspaceView.trailing).isActive = YES;

        this.workspaceToolbarHeightConstraint = this.workspaceToolbarView.height.equalTo(_BMLayoutEditorToolbarHeight);
        this.workspaceToolbarHeightConstraint.isActive = YES;

        // Set up constraints for the workspace
        this.workspaceWidth = this.workspace.width.equalTo(this.workspaceWrapperView.width);
        this.workspaceWidth.isActive = YES;

        this.workspaceHeight = this.workspace.height.equalTo(this.workspaceWrapperView.height);
        this.workspaceHeight.isActive = YES;

        this.workspaceLeft = this.workspace.left.equalTo(this.workspaceWrapperView.left);
        this.workspaceLeft.isActive = YES;

        this.workspaceTop = this.workspace.top.equalTo(this.workspaceWrapperView.top);
        this.workspaceTop.isActive = YES;

        this.workspace.left.greaterThanOrEqualTo(this.workspaceWrapperView.left).isActive = YES;
        this.workspace.top.greaterThanOrEqualTo(this.workspaceWrapperView.top).isActive = YES;


        if (BMIsTouchDevice) {
            let touchHandler = document.createElement('div');
            touchHandler.className = 'BMWindowButton BMLayoutEditorTouchHandler';

            touchHandler.innerText = 'Create Constraint';
            touchHandler.addEventListener('touchstart', event => {
                touchHandler.classList.add('BMLayoutEditorTouchHandlerActive');
                this.isCreatingTouchConstraints = YES;
                event.preventDefault();
            });

            touchHandler.addEventListener('touchend', event => {
                touchHandler.classList.remove('BMLayoutEditorTouchHandlerActive');
                this.isCreatingTouchConstraints = NO;
                event.preventDefault();
            });
            touchHandler.addEventListener('touchcancel', event => {
                touchHandler.classList.remove('BMLayoutEditorTouchHandlerActive');
                this.isCreatingTouchConstraints = NO;
            })

            this.content.appendChild(touchHandler);
        }

        return this;
    },

    /**
     * Is set to <code>YES</code> while this layout editor is full screen.
     */
    _isFullScreen: NO, // <Boolean>

    /**
     * @deprecated Unused when using the settings view.
     * 
     * Invoked to toggle the visibility of the view hierarchy tree.
     * @param event <Event>         The event that triggered this action.
     */
    toggleFullscreenWithEvent(event) {
        if (BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW) return;

        if (this._isFullScreen) {
            this.treeWidthConstraint.constant = 256;
            BMAnimateWithBlock(() => this.layout(), {duration: 300, easing: 'easeInOutQuad'});
            this._fullScreenButton.style.marginLeft = '0px';
            this._isFullScreen = false;
        }
        else {
            this.treeWidthConstraint.constant = 0;
            BMAnimateWithBlock(() => this.layout(), {duration: 300, easing: 'easeInOutQuad'});
            this._fullScreenButton.style.marginLeft = '72px';
            this._isFullScreen = true;
        }
    },

    /**
     * Is set to <code>YES</code> while this settings pane is hidden.
     */
    _isSettingsPaneHidden: NO, // <Boolean>

    /**
     * @deprecated Unused when using the settings view.
     * 
     * Should be invoked to toggle the visibility of the settings pane.
     * @param event <Event>         The event that triggered this action.
     */
    toggleSettingsPaneWithEvent(event) {
        if (BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW) return;

        if (this._isSettingsPaneHidden) {
            this.detailsWidthConstraint.constant = 344;
            BMAnimateWithBlock(() => this.layout(), {duration: 300, easing: 'easeInOutQuad'});
            this._isSettingsPaneHidden = false;
        }
        else {
            this.detailsWidthConstraint.constant = 0;
            BMAnimateWithBlock(() => this.layout(), {duration: 300, easing: 'easeInOutQuad'});
            this._isSettingsPaneHidden = true;
        }
    },

    /**
     * Animatable. The current zoom level.
     */
    _scale: 1, // <Number>
    get scale() {
        return this._scale;
    },
    set scale(scale) {
        if (isNaN(scale)) return;
        scale = BMNumberByConstrainingNumberToBounds(scale, .25, 2);

        if (this._scale != scale) {
            this._scale = scale;
            if (BMAnimationContextGetCurrent()) {
                const controller = BMAnimationContextGetCurrent().controllerForObject(this.workspace, {node: this.workspace.node});
                controller.registerBuiltInPropertiesWithDictionary({scaleX: scale, scaleY: scale});
            }
            else {
                BMHook(this.workspace.node, {scaleX: scale, scaleY: scale});
            }
        }
    },

    /**
     * Controls the currently selected size class.
     */
    _activeSizeClass: undefined, // <BMLayoutSizeClass, nullable>
    get activeSizeClass() {
        return this._activeSizeClass;
    },
    set activeSizeClass(sizeClass) {
        let hadSizeClass = !!this._activeSizeClass;
        this._activeSizeClass = sizeClass;

        // Update the toolbar dispay to match the selected size class.
        if (sizeClass) {
            if (!hadSizeClass) this.workspaceToolbar.classList.add('BMLayoutEditorWorkspaceToolbarSizeClass');
            if (!hadSizeClass) this.workspaceToolbar.classList.add('BMWindowToolbarDark');
        }
        else {
            if (hadSizeClass) this.workspaceToolbar.classList.remove('BMLayoutEditorWorkspaceToolbarSizeClass');
            if (hadSizeClass) this.workspaceToolbar.classList.remove('BMWindowToolbarDark');
        }

        // Force the view to use the given size class
        let viewport = sizeClass ? BMViewport.currentViewport() : undefined;

        if (sizeClass) {
            if (sizeClass._maximumWidth) viewport._width = sizeClass._maximumWidth;
            if (sizeClass._maximumHeight) viewport._height = sizeClass._maximumHeight;
            if (sizeClass._maximumDiagonal) viewport._diagonal = sizeClass._maximumDiagonal;
            if (sizeClass._orientation != BMLayoutOrientation.Any) viewport._orientation = sizeClass._orientation;
            if (sizeClass._maximumSurfaceArea) viewport._maximumSurfaceArea = sizeClass._maximumSurfaceArea;
        }

        this.view._requiredViewport = viewport;
        this.view._invalidatedSizeClasses = YES;
        this.view.needsLayout = YES;
        if (!this.awaitLayout) {
            BMAnimateWithBlock(() => {
                this.view.layout();
            }, {duration: 300, easing: 'easeInOutQuart', complete: () => {
                if (this.selectedView) this.selectView(this.selectedView);
                if (this.selectedConstraint) this.selectConstraint(this.selectedConstraint, {withReferenceView: this.selectedConstraintReferenceView});
            }});
        }
        else {
            this.layoutQueue._views.delete(this.view);
        }
    },

    /**
     * An object that implements the `BMLayoutVariableProvider` interface, used to control the layout variables that
     * the layout editor can use. The provider is also notified whenever the layout editor modifies the layout variables.
     * 
     * If this property is not set, the layout editor will manipulate the globally available layout variables.
     */
    layoutVariableProvider: BMView, // <BMLayoutVariableProvider>

    /**
     * Brings up the size class menu at the specified point.
     * @param point <BMPoint>                                       The point at which to show the menu.
     * {
     *  @param action <void ^(BMLayoutSizeClass), nullable>         The action that will occur upon selecting an item from the menu.
     *                                                              This handler will receive the selected size class as an argument.
     *                                                              If not specified, the default action of activating the selected size
     *                                                              class will occur.
     *  @param kind <BMMenuKind, nullable>                          The kind of menu to show. Defaults to `.PullDownMenu`.
     * }
     */
    _showSizeClassMenuAtPoint(point, {action, kind} = {}) {
        let options = [];
        options.push(this._sizeClassMenuItemMakeWithName('All Size Classes', {ofType: 'Desktop', preview: 'Fill', action}));
        options.push(this.settingsDivider());
        options.push(this._sizeClassMenuItemMakeWithName('Phone', {ofType: 'Phone', sizeClass: BMLayoutSizeClass.phoneSizeClass(), preview: 'Phone Portrait', action}));
        options.push(this._sizeClassMenuItemMakeWithName('Phone Portrait', {ofType: 'PhonePortrait', sizeClass: BMLayoutSizeClass.phoneSizeClassWithOrientation(BMLayoutOrientation.Portrait), preview: 'Phone Portrait', action}));
        options.push(this._sizeClassMenuItemMakeWithName('Phone Landscape', {ofType: 'PhoneLandscape', sizeClass: BMLayoutSizeClass.phoneSizeClassWithOrientation(BMLayoutOrientation.Landscape), preview: 'Phone Landscape', action}));
        options.push(this.settingsDivider());
        options.push(this._sizeClassMenuItemMakeWithName('Tablet', {ofType: 'Tablet', sizeClass: BMLayoutSizeClass.tabletSizeClass(), preview: 'Tablet Landscape', action}));
        options.push(this._sizeClassMenuItemMakeWithName('Tablet Portrait', {ofType: 'TabletPortrait', sizeClass: BMLayoutSizeClass.tabletSizeClassWithOrientation(BMLayoutOrientation.Portrait), preview: 'Tablet Portrait', action}));
        options.push(this._sizeClassMenuItemMakeWithName('Tablet Landscape', {ofType: 'TabletLandscape', sizeClass: BMLayoutSizeClass.tabletSizeClassWithOrientation(BMLayoutOrientation.Landscape), preview: 'Tablet Landscape', action}));

        this.showMenuAtPoint(point, {withOptions: options, kind: kind || BMMenuKind.PullDownMenu});
    },

    /**
     * Constructs and returns a size class option.
     * @param name <String>                                 The name to display for this size class option. 
     * {
     *  @param ofType <String>                              The type of the icon to display alongside this option.
     *  @param sizeClass <BMLayoutSizeClass, nullable>      The size class associated with this option.
     *  @param action <void ^(), nullable>                  An additional action to execute in addition to the default action.
     * }
     */
    _sizeClassMenuItemMakeWithName(name, args) {
        let option = document.createElement('div');
        option.className = 'BMLayoutEditorConstraintPopupOption BMLayoutEditorSizeClassPopupOption';

        let icon = document.createElement('div');
        icon.className = 'BMLayoutEditorSizeClassImage BMLayoutEditorImage' + args.ofType + 'Mini';
        option.appendChild(icon);

        let text = document.createElement('span');
        text.innerText = name;
        option.appendChild(text);

        option.addEventListener('click', event => {
            if (args.action) {
                args.action(args.sizeClass);
                return;
            }

            if (args.preview) {
                this.awaitLayout = YES;
            }

            this.activeSizeClass = args.sizeClass;
            this._sizeClassImage.className = 'BMLayoutEditorSizeClassImage BMLayoutEditorImage' + args.ofType + 'Mini';
            this._sizeClassText.innerText = name;

            if (args.preview) {
                this.deviceSelector.value = args.preview;
                var event = new Event('change');
                this.deviceSelector.dispatchEvent(event);
            }

            this.awaitLayout = NO;

            if (BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW) {
                this.detailsView.layoutEditorDidSelectSizeClass(args.sizeClass);
            }
        });

        return option;
    },

    /**
     * The toggle inspector button.
     */
    _inspectorButton: undefined, // <DOMNode>

    /**
     * Initializes the keyboard shortcuts that the editor responds to.
     */
    _initKeyboardShortcuts() {
        if (!BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW) return;

        // Constraint selectors
        this.registerKeyboardShortcut(BMKeyboardShortcut.keyboardShortcutWithKeyCode('ArrowLeft', {modifiers: [BMKeyboardShortcutModifier.System], target: this, action: 'selectLeftConstraintWithEvent'}));
        this.registerKeyboardShortcut(BMKeyboardShortcut.keyboardShortcutWithKeyCode('ArrowUp', {modifiers: [BMKeyboardShortcutModifier.System], target: this, action: 'selectTopConstraintWithEvent'}));
        this.registerKeyboardShortcut(BMKeyboardShortcut.keyboardShortcutWithKeyCode('ArrowRight', {modifiers: [BMKeyboardShortcutModifier.System], target: this, action: 'selectRightConstraintWithEvent'}));
        this.registerKeyboardShortcut(BMKeyboardShortcut.keyboardShortcutWithKeyCode('ArrowDown', {modifiers: [BMKeyboardShortcutModifier.System], target: this, action: 'selectBottomConstraintWithEvent'}));

        // Tool window toggle
        this.registerKeyboardShortcut(BMKeyboardShortcut.keyboardShortcutWithKeyCode('KeyI', {modifiers: [BMKeyboardShortcutModifier.System], target: this, action: 'toggleDetailsToolWindow', preventsDefault: YES}));
        this.registerKeyboardShortcut(BMKeyboardShortcut.keyboardShortcutWithKeyCode('KeyI', {modifiers: [BMKeyboardShortcutModifier.System, BMKeyboardShortcutModifier.Shift], target: this, action: 'toggleNavigationToolWindow', preventsDefault: YES}));

        // Backspace actions
        this.registerKeyboardShortcut(BMKeyboardShortcut.keyboardShortcutWithKeyCode('Backspace', {modifiers: [BMKeyboardShortcutModifier.System], target: this, action: 'commandBackspacePressedWithEvent'}));
        this.registerKeyboardShortcut(BMKeyboardShortcut.keyboardShortcutWithKeyCode('Backspace', {modifiers: [], target: this, action: 'backspacePressedWithEvent'}));

        // Equality actions
        this.registerKeyboardShortcut(BMKeyboardShortcut.keyboardShortcutWithKeyCode('Digit0', {modifiers: [BMKeyboardShortcutModifier.System, BMKeyboardShortcutModifier.Option], target: this, action: 'setConstraintToEqualWithEvent', preventsDefault: YES}));
        this.registerKeyboardShortcut(BMKeyboardShortcut.keyboardShortcutWithKeyCode('Minus', {modifiers: [BMKeyboardShortcutModifier.System, BMKeyboardShortcutModifier.Option], target: this, action: 'setConstraintToLessThanWithEvent', preventsDefault: YES}));
        this.registerKeyboardShortcut(BMKeyboardShortcut.keyboardShortcutWithKeyCode('Equal', {modifiers: [BMKeyboardShortcutModifier.System, BMKeyboardShortcutModifier.Option], target: this, action: 'setConstraintToGreaterThanWithEvent', preventsDefault: YES}));
    },

    /**
     * Initializes the toolbar.
     * @param toolbar <DOMNode>     The toolbar DOM node.
     */
    _initToolbar(toolbar) {
        // TODO Split up
        if (BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW) {
            const closeButton = document.createElement('div');
            closeButton.className = 'BMWindowToolbarButton BMLayoutEditorToolbarButton';
            closeButton.innerHTML = '<i class="material-icons">&#xE5CD;</i>';
            closeButton.style.opacity = 1;

            closeButton.addEventListener('click', event => this.dismissAnimated(YES, {toNode: this._returnNode}));
            
            toolbar.appendChild(closeButton);
        }

        const fullscreenButton = document.createElement('div');
        fullscreenButton.className = 'BMWindowToolbarButton BMLayoutEditorToolbarButton';
        fullscreenButton.style.transition = 'margin-left .3s ease';
        fullscreenButton.innerHTML = `<i class="material-icons" style="pointer-events: none;">${BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW ? 'layers' : '&#xE5DC;'}</i>`;
        this._fullScreenButton = fullscreenButton;

        fullscreenButton.style.opacity = 1;
        fullscreenButton.style.pointerEvents = 'all';

        fullscreenButton.addEventListener('click', BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW ? event => this._treeWindow.toggleAnimated(YES) : event => this.toggleFullscreenWithEvent(event));
        toolbar.appendChild(fullscreenButton);

        let deviceSelectorLabel = document.createElement('div');
        deviceSelectorLabel.className = 'BMWindowToolbarLabel';
        deviceSelectorLabel.innerText = 'View:';
        toolbar.appendChild(deviceSelectorLabel);

        let deviceSelector = document.createElement('select');
        deviceSelector.className = 'BMWindowInput BMWindowToolbarInput';
        this.deviceSelector = deviceSelector;

        deviceSelector.appendChild(this.optionNamed('Fill'));
        deviceSelector.appendChild(this.optionNamed('Full HD'));
        deviceSelector.appendChild(this.optionNamed('15" Laptop'));
        deviceSelector.appendChild(this.optionNamed('13" Laptop'));
        deviceSelector.appendChild(this.optionNamed('Tablet Landscape'));
        deviceSelector.appendChild(this.optionNamed('Tablet Portrait'));
        deviceSelector.appendChild(this.optionNamed('Phone Portrait'));
        deviceSelector.appendChild(this.optionNamed('Phone Landscape'));
        deviceSelector.appendChild(this.optionNamed('Custom'));

        toolbar.appendChild(deviceSelector);


        let widthInput = document.createElement('input');
        widthInput.type = 'number';
        widthInput.style.cssText = 'width: 64px !important; margin-left: 32px !important; text-align: center;';
        widthInput.className = 'BMWindowInput BMWindowToolbarInput';
        widthInput.disabled = true;
        toolbar.appendChild(widthInput);

        const debounceInterval = 400;

        let widthDebouncing;

        widthInput.addEventListener('input', event => {
            if (widthDebouncing) window.clearTimeout(widthDebouncing);
            widthDebouncing = window.setTimeout(() => {
                widthDebouncing = undefined;
                if (widthInput.disabled) return;

                let width = parseInt(widthInput.value, 10);
                if (!isNaN(width)) {
                    this._staticWorkspaceSize.width = width;
                    this._setStaticWorkspaceSize(this._staticWorkspaceSize);
                }
            }, debounceInterval);
        });

        let sizeXLabel = document.createElement('div');
        sizeXLabel.className = 'BMWindowToolbarLabel';
        sizeXLabel.innerText = '\u2A2F';
        toolbar.appendChild(sizeXLabel);

        let heightInput = document.createElement('input');
        heightInput.type = 'number';
        heightInput.style.cssText = 'width: 64px !important; text-align: center;'
        heightInput.className = 'BMWindowInput BMWindowToolbarInput';
        heightInput.disabled = true;
        toolbar.appendChild(heightInput);
        
        let heightDebouncing;

        heightInput.addEventListener('input', event => {
            if (heightDebouncing) window.clearTimeout(heightDebouncing);
            heightDebouncing = window.setTimeout(() => {
                heightDebouncing = undefined;
                if (heightInput.disabled) return;

                let height = parseInt(heightInput.value, 10);
                if (!isNaN(height)) {
                    this._staticWorkspaceSize.height = height;
                    this._setStaticWorkspaceSize(this._staticWorkspaceSize);
                }
            }, debounceInterval);
        });

        deviceSelector.addEventListener('change', event => {
            let device = deviceSelector.value;

            if (device == 'Fill') {
                this._staticWorkspaceSize = undefined;
        
                this.workspaceLeft.remove();
                this.workspaceTop.remove();
                this.workspaceWidth.remove();
                this.workspaceHeight.remove();
        
                (this.workspaceLeft = this.workspace.left.equalTo(this.workspaceWrapperView.left)).isActive = YES;
                (this.workspaceTop = this.workspace.top.equalTo(this.workspaceWrapperView.top)).isActive = YES;
                (this.workspaceWidth = this.workspace.width.equalTo(this.workspaceWrapperView.width)).isActive = YES;
                (this.workspaceHeight = this.workspace.height.equalTo(this.workspaceWrapperView.height)).isActive = YES;
        
                BMAnimateWithBlock(() => {
                    this.layout();
                }, {duration: 300, easing: 'easeInOutQuart', complete: () => {
                    if (this.selectedView) this.selectView(this.selectedView);
                    if (this.selectedConstraint) this.selectConstraint(this.selectedConstraint, {withReferenceView: this.selectedConstraintReferenceView});
                }});

                widthInput.value = '';
                heightInput.value = '';
                widthInput.disabled = true;
                heightInput.disabled = true;
            }
            else {
                if (device == 'Full HD') {
                    this._setStaticWorkspaceSize(BMSizeMake(1920, 1080), {animated: YES});
                    widthInput.value = 1920;
                    heightInput.value = 1080;
                }
                if (device == '15" Laptop') {
                    this._setStaticWorkspaceSize(BMSizeMake(1680, 1050), {animated: YES});
                    widthInput.value = 1680;
                    heightInput.value = 1050;
                }
                if (device == '13" Laptop') {
                    this._setStaticWorkspaceSize(BMSizeMake(1400, 900), {animated: YES});
                    widthInput.value = 1400;
                    heightInput.value = 900;
                }
                if (device == 'Tablet Portrait') {
                    this._setStaticWorkspaceSize(BMSizeMake(768, 1024), {animated: YES});
                    widthInput.value = 768;
                    heightInput.value = 1024;
                }
                if (device == 'Tablet Landscape') {
                    this._setStaticWorkspaceSize(BMSizeMake(1024, 768), {animated: YES});
                    widthInput.value = 1024;
                    heightInput.value = 768;
                }
                if (device == 'Phone Portrait') {
                    this._setStaticWorkspaceSize(BMSizeMake(375, 667), {animated: YES});
                    widthInput.value = 375;
                    heightInput.value = 667;
                }
                if (device == 'Phone Landscape') {
                    this._setStaticWorkspaceSize(BMSizeMake(667, 375), {animated: YES});
                    widthInput.value = 667;
                    heightInput.value = 375;
                }
                if (device == 'Custom') {
                    this._setStaticWorkspaceSize(BMSizeMake(parseInt(widthInput.value, 10) || 800, parseInt(heightInput.value, 10) || 600));
                    widthInput.value = widthInput.value || 800;
                    heightInput.value = heightInput.value || 600;
                    widthInput.disabled = false;
                    heightInput.disabled = false;
                }
                else {
                    widthInput.disabled = true;
                    heightInput.disabled = true;
                }
            }
        });

        let flexibleSpace = document.createElement('div');
        flexibleSpace.className = 'BMWindowFlexibleSpace';
        toolbar.appendChild(flexibleSpace);

        let zoomLabel = document.createElement('div');
        zoomLabel.className = 'BMWindowToolbarLabel';
        zoomLabel.innerText = 'Zoom:';
        toolbar.appendChild(zoomLabel);

        const zoomSlider = document.createElement('input');
        zoomSlider.type = 'range';
        zoomSlider.min = '25';
        zoomSlider.max = '200';
        zoomSlider.value = '100';
        zoomSlider.style.cssText = 'width: 100px; height: 24px';
        toolbar.appendChild(zoomSlider);

        const zoomBox = document.createElement('input');
        zoomBox.type = 'number';
        zoomBox.value = '100';
        zoomBox.style.cssText = 'width: 64px !important; text-align: center;'
        zoomBox.className = 'BMWindowInput BMWindowToolbarInput';
        toolbar.appendChild(zoomBox);

        zoomSlider.addEventListener('input', event => {
            const value = parseFloat(zoomSlider.value);
            if (isNaN(value)) return;

            zoomBox.value = value;
            const scale = value / 100;
            this.scale = scale;
        });

        zoomBox.addEventListener('input', event => {
            let value = parseFloat(zoomBox.value);
            if (isNaN(value)) return;

            value = BMNumberByConstrainingNumberToBounds(value, 25, 200);
            zoomSlider.value = value;
            const scale = value / 100;
            this.scale = scale;
        });
        this.zoomBox = zoomBox;
        this.zoomSlider = zoomSlider;

        const zoomResetButton = document.createElement('div');
        zoomResetButton.className = 'BMWindowToolbarButton BMLayoutEditorToolbarButton';
        zoomResetButton.innerHTML = `<i class="material-icons" style="pointer-events: none;">center_focus_strong</i>`;

        zoomResetButton.style.opacity = 1;
        zoomResetButton.style.pointerEvents = 'all';

        zoomResetButton.addEventListener('click', event => {
            BMAnimateWithBlock(() => {
                this.zoomSlider.value = 100;
                this.zoomBox.value = 100;
                this.panOffset = BMPointMake(0, 0);
                this.scale = 1;
            }, {duration: 200, easing: 'easeInOutQuad'});
        });
        toolbar.appendChild(zoomResetButton);

        let zoomFlexibleSpace = document.createElement('div');
        zoomFlexibleSpace.className = 'BMWindowFlexibleSpace';
        toolbar.appendChild(zoomFlexibleSpace);

        let sizeClassSelector = document.createElement('div');
        sizeClassSelector.className = 'BMWindowInput BMWindowToolbarInput BMLayoutEditorSizeClassSelector';

        let sizeClassImage = document.createElement('div');
        sizeClassImage.className = 'BMLayoutEditorSizeClassImage BMLayoutEditorImageDesktop';
        sizeClassSelector.appendChild(sizeClassImage);
        this._sizeClassImage = sizeClassImage;

        let sizeClassText = document.createElement('span');
        sizeClassText.innerText = 'All Size Classes';
        sizeClassSelector.appendChild(sizeClassText);
        this._sizeClassText = sizeClassText;

        toolbar.appendChild(sizeClassSelector);

        sizeClassSelector.addEventListener('click', event => {
            let rect = BMRectMakeWithNodeFrame(sizeClassSelector);
            let point = BMPointMake(rect.left, rect.bottom);

            this._showSizeClassMenuAtPoint(point);
        });

        const layoutVariablesButton = document.createElement('div');
        layoutVariablesButton.className = 'BMWindowToolbarButton BMLayoutEditorToolbarButton';
        layoutVariablesButton.innerHTML = '<i class="material-icons BMScriptFont" style="pointer-events: none;">{X}</i>';
        toolbar.appendChild(layoutVariablesButton);
        this.layoutVariablesButton = layoutVariablesButton;

        layoutVariablesButton.addEventListener('click', event => this.showLayoutVariablesPopupWithEvent(event));

        const toggleSettingsButton = document.createElement('div');
        toggleSettingsButton.className = 'BMWindowToolbarButton BMLayoutEditorToolbarButton';
        toggleSettingsButton.innerHTML = `<i class="material-icons" style="pointer-events: none;">${BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW ? 'toggle_on' : '&#xE5DD;'}</i>`;

        toggleSettingsButton.style.opacity = 1;
        toggleSettingsButton.style.pointerEvents = 'all';

        this._inspectorButton = toggleSettingsButton;

        toggleSettingsButton.addEventListener('click', BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW ? event => this.detailsView._window.toggleAnimated(YES, {fromRect: BMRectMakeWithNodeFrame(this._inspectorButton)}) : event => this.toggleSettingsPaneWithEvent(event));
        toolbar.appendChild(toggleSettingsButton);

    },

    toggleDetailsToolWindow() {
        this.detailsView._window.toggleAnimated(YES, {fromRect: BMRectMakeWithNodeFrame(this._inspectorButton)});
    },

    toggleNavigationToolWindow() {
        this._treeWindow.toggleAnimated(YES);
    },

    /**
     * Sets up the various gesture recognizers for the workspace wrapper.
     */
    _initWorkspaceGestures() {
        const workspaceWrapper = this.workspaceWrapperView.node;

        // Set up the touch zoom and pan gestures
        let lastFirstTouch;
        let lastSecondTouch;
        let lastCenterPoint;
        let lastDistance;
        workspaceWrapper.addEventListener('touchstart', event => {
            // prevent panning while creating touch constraints
            if (this.isCreatingTouchConstraints) return;

            if (event.touches.length == 2) {
                lastFirstTouch = BMPointMake(event.touches[0].pageX, event.touches[0].pageY);
                lastSecondTouch = BMPointMake(event.touches[1].pageX, event.touches[1].pageY);
                lastCenterPoint = BMPointMake((lastFirstTouch.x + lastSecondTouch.x) / 2, (lastFirstTouch.y + lastSecondTouch.y) / 2);
                lastDistance = lastFirstTouch.distanceToPoint(lastSecondTouch);

                event.stopPropagation();
                event.preventDefault();
            }
        }, YES);

        workspaceWrapper.addEventListener('touchmove', event => {
            // prevent panning while creating touch constraints
            if (this.isCreatingTouchConstraints) return;

            if (event.touches.length == 2) {
                event.stopPropagation();
                event.preventDefault();

                const firstTouch = BMPointMake(event.touches[0].pageX, event.touches[0].pageY);
                const secondTouch = BMPointMake(event.touches[1].pageX, event.touches[1].pageY);
                const centerPoint = BMPointMake((firstTouch.x + secondTouch.x) / 2, (firstTouch.y + secondTouch.y) / 2);

                const displacement = BMPointMake(centerPoint.x - lastCenterPoint.x, centerPoint.y - lastCenterPoint.y);
                const offset = BMPointMake(this.panOffset.x + displacement.x, this.panOffset.y + displacement.y);
                this.panOffset = offset;

                const distance = firstTouch.distanceToPoint(secondTouch);
                const distanceOffset = distance / lastDistance - 1;
                this.scale += distanceOffset / 1.25;

                lastFirstTouch = firstTouch;
                lastSecondTouch = secondTouch;
                lastCenterPoint = centerPoint;
                lastDistance = distance;
            }
        }, YES);

        // Set up the mousewheel zoom and pan gestures
        workspaceWrapper.addEventListener('wheel', event => {
            event.preventDefault();

            if (event.altKey) {
                // When scrolling with the option key pressed, perform a zoom
                const zoomAmount = ((event.deltaMode == 0 ? event.deltaY : (10 * event.deltaY)) / 25 | 0) / 100;
                this.scale += zoomAmount;
                this.zoomBox.value = this.scale * 100 | 0;
                this.zoomSlider.value = this.scale * 100 | 0;
            }
            else {
                // Otherwise pan
                let distanceX, distanceY;
                if (event.deltaMode == 0) {
                    distanceX = event.deltaX | 0;
                    distanceY = event.deltaY | 0;
                }
                else {
                    distanceX = 10 * event.deltaX | 0;
                    distanceY = 10 * event.deltaY | 0;
                }

                const offset = this.panOffset;
                offset.x -= distanceX;
                offset.y -= distanceY;

                this.panOffset = offset;
            }
        });

        let lastOffset;
        const downListener = event => {
            if (event.button != 0) return;

            if (event.altKey) {
                event.preventDefault();
                event.stopPropagation();

                lastOffset = BMPointMake(event.screenX, event.screenY);

                const moveListener = event => {
                    const offset = this.panOffset;
                    offset.x += event.screenX - lastOffset.x;
                    offset.y += event.screenY - lastOffset.y;

                    lastOffset = BMPointMake(event.screenX, event.screenY);
                    this.panOffset = offset;

                    event.stopPropagation();
                    event.preventDefault();
                }

                const upListener = event => {
                    event.stopPropagation();
                    event.preventDefault();

                    window.removeEventListener('click', clickListener, YES);
                    window.removeEventListener('mousemove', moveListener, YES);
                    window.removeEventListener('mouseup', upListener, YES);
                }

                const clickListener = event => {
                    event.preventDefault();
                    event.stopPropagation();
                }

                window.addEventListener('click', clickListener, YES);
                window.addEventListener('mousemove', moveListener, YES);
                window.addEventListener('mouseup', upListener, YES);
            }
        };

        // Set up the mouse drag pan gesture; this is a capturing listener that only has effect if the option key is pressed
        workspaceWrapper.addEventListener('mousedown', downListener, YES);
    },

    /**
     * Builds the SVG path definition for a popover with the given frame. Note that the indicator will be positioned inside the frame, which will push the usable
     * area of the frame downwards.
     * @param frame <BMRect>                            The popover's frame.
     * {
     *  @param widthIndicatorSize <Number, nullable>    Defaults to `8`. The size of the popover's indicator.
     *  @param radius <Number, nullable>                Defaults to `4`. Controls how rounded the corners are.
     *  @param inset <Number, nullable>                 Defaults to `0`. An optional inset to apply to the path.
     *  @param knobPosition <Number, nullable>          Defaults to half of the frame's width. The position along the top frame on which to place the knob.
     *                                                  This coordinate is relative to the popover's frame and represents the center position of the knob.
     *                                                  This position should not overlap the specified corner radius.
     *  @param gravity <String, nullable>               Defaults to `"Top"`. If set to `"Bottom"`, the popover knob will be placed at the bottom of the popover.
     * }
     * @return <String>                                 The SVG path.
     */
    _pathForPopoverWithFrame(frame, {widthIndicatorSize: size = 8, radius = 4, inset = 0, knobPosition = undefined, gravity = 'Top'} = {widthIndicatorSize: 8, radius: 4, inset: 0}) {
        let top = gravity === 'Bottom' ? 0 : size * Math.SQRT2 / 2 | 0;
        let bottom = gravity === 'Bottom' ? frame.size.height - size * Math.SQRT2 / 2 | 0 : frame.size.height;
        const left = inset;

        if (inset) {
            size = size - inset;
            frame = frame.copy();
            frame.insetWithInset(BMInsetMakeWithEqualInsets(inset));
            radius = radius + inset;
            top += inset;
            bottom -= inset;
        }

        if (knobPosition === undefined) {
            knobPosition = frame.size.width / 2 | 0;
        }
        else {
            knobPosition = (knobPosition - inset) | 0;
        }

        const knobWidth = size * Math.SQRT2;
        const knobHeight = knobWidth / 2 | 0;

        // bottom should be equivalent to frame.size.height + inset
        const pathTop = gravity === 'Bottom' ?
            `M${left + radius},${top} L${frame.size.width + left - radius},${top} ` :
            `M${left + radius},${top} L${(knobPosition - knobWidth / 2 + left)},${top} l${(knobWidth / 2)},${-knobHeight} l${(knobWidth / 2)},${knobHeight} L${frame.size.width + left - radius},${top} `;

        const pathBottom = gravity === 'Bottom' ?
            `Q${frame.size.width + left},${bottom} ${frame.size.width + left - radius},${bottom} L${(knobPosition + knobWidth / 2 + left)},${bottom} l${(-knobWidth / 2)},${knobHeight} l${(-knobWidth / 2)},${-knobHeight} L${radius},${bottom} ` :
            `Q${frame.size.width + left},${bottom} ${frame.size.width + left - radius},${bottom} L${radius},${bottom} `;


        let path =  pathTop;
        path +=     `Q${frame.size.width + left},${top} ${frame.size.width + left},${top + radius} L${frame.size.width + left},${bottom - radius} `;
        path +=     pathBottom;
        path +=     `Q${left},${bottom} ${left},${bottom - radius} L${left},${top + radius} Q${left},${top} ${radius},${top} Z`;

        return path;
    },

    /**
     * Brings up the layout variables popover window.
     * @param event <Event, nullable>         The event that triggered this action. 
     */
    showLayoutVariablesPopupWithEvent(event) {
        const popoverParentElement = document.body;

        // Create the popover container
        const popoverContainer = document.createElement('div');
        popoverContainer.className = 'BMPopoverContainer';

        // A second layer is used to draw the drop shadow, due to the unusual shape of the popover window
        const popoverDropShadowContainer = document.createElement('div');
        popoverDropShadowContainer.className = 'BMPopoverContainerLayer BMPopoverDropShadowContainer';
        const popoverDropShadowContent = document.createElement('div');
        popoverDropShadowContent.className = 'BMPopoverDropShadowContent';
        popoverDropShadowContainer.appendChild(popoverDropShadowContent);

        // A third layer is used to draw the background
        const popoverBackground = document.createElement('div');
        popoverBackground.className = 'BMPopoverBackground';

        popoverBackground.innerHTML = '<div class="BMPopoverBackgroundDarkModeContainer"><div class="BMPopoverBackgroundDarkModeOutline"></div><div class="BMPopoverBackgroundDarkModeFill"></div></div>';

        // Find out the location where the popover should be
        const location = BMRectMakeWithNodeFrame(this.layoutVariablesButton).center;

        // Create the frame for the popover container and move it accordingly
        const frame = BMRectMake(window.innerWidth - 320 - 16, location.y + 16, 320, 380 + 8);
        const knobPosition = location.x - frame.origin.x;

        const path = `path('${this._pathForPopoverWithFrame(frame, {widthIndicatorSize: 16, knobPosition})}')`;
        const outlinePath = `path('${this._pathForPopoverWithFrame(frame, {widthIndicatorSize: 16, inset: 1, knobPosition})}')`;

        // Assign the frame to the window, and to the drop shadow container
        const positionStyle = {
            left: frame.origin.x + 'px',
            top: frame.origin.y + 'px',
            width: frame.size.width + 'px',
            height: frame.size.height + 'px'
        };
        BMCopyProperties(popoverContainer.style, positionStyle);

        BMCopyProperties(popoverBackground.style, positionStyle);
        popoverBackground.style.clipPath = path;
        popoverBackground.style.webkitClipPath = path;

        const popoverDarkModeFill = popoverBackground.querySelector('.BMPopoverBackgroundDarkModeFill');
        popoverDarkModeFill.style.clipPath = outlinePath;
        popoverDarkModeFill.style.webkitClipPath = outlinePath;

        BMCopyProperties(popoverDropShadowContainer.style, positionStyle);
        popoverDropShadowContent.style.clipPath = path;
        popoverDropShadowContent.style.webkitClipPath = path;

        // Create the click blocker behind the popover
        const blocker = document.createElement('div');
        blocker.className = 'BMPopoverOverlay';
        popoverParentElement.appendChild(blocker);

        // Create the popover's content
        const title = document.createElement('div');
        title.innerText = 'Layout Variables';
        title.className = 'BMWindowTitle';
        popoverContainer.appendChild(title);

        const container = document.createElement('div');
        container.className = 'BMLayoutEditorVariablesContainer';
        popoverContainer.appendChild(container);

        const addVariableButton = document.createElement('button');
        addVariableButton.className = 'BMWindowButton';
        addVariableButton.innerText = 'Add Variable';
        addVariableButton.style.boxSizing = 'border-box';
        if (this.layoutVariableProvider.canUseLayoutVariables()) {
            // If layout variables cannot be used, don't display an add button
            popoverContainer.appendChild(addVariableButton);
        }

        // Set up the variables collection view
        const variablesCollection = BMCollectionView.collectionViewForNode(container);
        const dataSet = (new BMLayoutEditorVariablesDataSet).initWithLayoutVariableProvider(this.layoutVariableProvider, {collectionView: variablesCollection, editor: this});
        variablesCollection.cellClass = BMLayoutEditorVariableCell;
        variablesCollection.registerSupplementaryViewClass(BMLayoutEditorEmptyVariablesCell, {forReuseIdentifier: BMCollectionViewFlowLayoutSupplementaryView.Empty});

        variablesCollection.layout.maximumCellsPerRow = 1;
        variablesCollection.layout.gravity = BMCollectionViewFlowLayoutGravity.Expand;
        variablesCollection.layout.rowSpacing = 0;
        variablesCollection.layout.topPadding = 0;
        variablesCollection.layout.bottomPadding = 0;
        variablesCollection.layout.contentGravity = BMCollectionViewFlowLayoutAlignment.Start;

        // Add the popover to the document
        popoverParentElement.appendChild(popoverBackground);
        popoverParentElement.appendChild(popoverDropShadowContainer);
        popoverParentElement.appendChild(popoverContainer);

        let popoverVisible = YES;

        variablesCollection.delegate = dataSet;
        (async () => {
            // Give the data provider a chance to prepare its layout variables
            await this.layoutVariableProvider.prepareLayoutVariables();
            if (popoverVisible) {
                variablesCollection.dataSet = dataSet;
            }
        })();

        addVariableButton.addEventListener('click', event => {
            dataSet.addVariable();
        });

        const popoverLayers = [popoverContainer, popoverBackground, popoverDropShadowContainer];

        for (const layer of popoverLayers) {
            layer.style.transformOrigin = ((knobPosition / frame.size.width) * 100) + '% 0%';
            BMHook(layer, {scaleX: .75, scaleY: .75, opacity: 0});

            __BMVelocityAnimate(layer, {scaleX: 1, scaleY: 1, opacity: 1}, {duration: 300, easing: [0,1.59,.49,1]});
        }

        // Add the click action to the overlay, which is to dismiss the popover and persist the layout variables
        blocker.addEventListener('click', event => {
            popoverVisible = NO;
            if (variablesCollection.dataSet) {
                this.layoutVariableProvider.persistLayoutVariables();
            }
            variablesCollection.release();
            blocker.remove();
            for (const layer of popoverLayers) {
                layer.style.pointerEvents = 'none';
    
                __BMVelocityAnimate(layer, {scaleX: .9, scaleY: .9, opacity: 0}, {duration: 200, easing: 'easeInOutQuart', complete() {layer.remove(); }});
            }

            this.node.focus();
        });
    },

    /**
     * Brings up a popover to edit a constraint's constant.
     * @param event <Event>                             The event that triggered this action.
     * {
     *  @param forConstraint <BMLayoutConstraint>       The constraint whose constant should be edited.
     *  @param withReferenceView <BMView>               The reference view.
     * }
     */
    _showConstantPopupWithEvent(event, {forConstraint: constraint, withReferenceView: referenceView}) {
        // TODO Extract the popover code into a common method
        const popoverParentElement = document.body;

        // Find out the location where the popover should be
        const location = BMPointMake(event.clientX | 0, event.clientY | 0);

        const appearsBelow = location.y < 160;

        // Create the popover container
        const popoverContainer = document.createElement('div');
        popoverContainer.className = 'BMPopoverContainer BMPopoverContainerConstant' + (appearsBelow ? ' BMPopoverContainerConstantBelow' : '');

        // A second layer is used to draw the drop shadow, due to the unusual shape of the popover window
        const popoverDropShadowContainer = document.createElement('div');
        popoverDropShadowContainer.className = 'BMPopoverContainerLayer BMPopoverDropShadowContainer';
        const popoverDropShadowContent = document.createElement('div');
        popoverDropShadowContent.className = 'BMPopoverDropShadowContent';
        popoverDropShadowContainer.appendChild(popoverDropShadowContent);

        // A third layer is used to draw the background
        const popoverBackground = document.createElement('div');
        popoverBackground.className = 'BMPopoverBackground';

        popoverBackground.innerHTML = '<div class="BMPopoverBackgroundDarkModeContainer"><div class="BMPopoverBackgroundDarkModeOutline"></div><div class="BMPopoverBackgroundDarkModeFill"></div></div>';

        const height = this.activeSizeClass ? 96 : 64;

        // Create the frame for the popover container and move it accordingly
        const frame = BMRectMake(location.x - 120, appearsBelow ? location.y : location.y - height - 8, 240, height + 8);
        if (frame.origin.x < -4) {
            frame.origin.x = -4;
        }
        if (frame.right > window.innerWidth + 4) {
            frame.origin.x = window.innerWidth - frame.size.width + 4;
        }

        const knobPosition = BMNumberByConstrainingNumberToBounds(location.x - frame.origin.x, 12, frame.size.width - 12);

        const path = `path('${this._pathForPopoverWithFrame(frame, {widthIndicatorSize: 16, knobPosition, gravity: appearsBelow ? 'Top' : 'Bottom'})}')`;
        const outlinePath = `path('${this._pathForPopoverWithFrame(frame, {widthIndicatorSize: 16, inset: 1, knobPosition, gravity: appearsBelow ? 'Top' : 'Bottom'})}')`;

        // Assign the frame to the window, and to the drop shadow container
        const positionStyle = {
            left: frame.origin.x + 'px',
            top: frame.origin.y + 'px',
            width: frame.size.width + 'px',
            height: frame.size.height + 'px'
        };
        BMCopyProperties(popoverContainer.style, positionStyle);

        BMCopyProperties(popoverBackground.style, positionStyle);
        popoverBackground.style.clipPath = path;
        popoverBackground.style.webkitClipPath = path;

        const popoverDarkModeFill = popoverBackground.querySelector('.BMPopoverBackgroundDarkModeFill');
        popoverDarkModeFill.style.clipPath = outlinePath;
        popoverDarkModeFill.style.webkitClipPath = outlinePath;

        BMCopyProperties(popoverDropShadowContainer.style, positionStyle);
        popoverDropShadowContent.style.clipPath = path;
        popoverDropShadowContent.style.webkitClipPath = path;

        // Create the click blocker behind the popover
        const blocker = document.createElement('div');
        blocker.className = 'BMPopoverOverlay';
        popoverParentElement.appendChild(blocker);

        // Add the popover to the document
        popoverParentElement.appendChild(popoverBackground);
        popoverParentElement.appendChild(popoverDropShadowContainer);
        popoverParentElement.appendChild(popoverContainer);

        const editor = this;

        if (this.activeSizeClass) {
            const blankIcon = document.createElement('div');
            blankIcon.className = 'BMLayoutEditorDetailsItemBadgeIcon';
            blankIcon.style.flexShrink = '0';
            blankIcon.style.top = '1px';
            popoverContainer.appendChild(blankIcon);

            const label = document.createElement('div');
            label.className = 'BMLayoutEditorDetailsTitleCell';
            label.innerText = 'Constant:';
            label.style.paddingRight = '8px';
            popoverContainer.appendChild(label);

            const box = document.createElement('input');
            box.type = 'text';
            box.style.width = '50px';
            box.className = 'BMWindowInput BMLayoutEditorDetailsCellInput BMLayoutEditorDetailsItemTextValue';
            box.value = constraint.constant;
            popoverContainer.appendChild(box);

            const textField = BMTextField.textFieldForInputNode(box);
            textField.delegate = {
                textFieldSuggestionsForText() {
                    const suggestions = [];
                    // Load up the variable names
                    const variables = Object.keys(editor.layoutVariableProvider.layoutVariables);
                    const uniqueNames = new Set;
                    variables.forEach(variable => uniqueNames.add(variable));
        
                    // Create a pair of regular and minus-prefixed variable names
                    for (const variable of uniqueNames) {
                        suggestions.unshift(variable);
                        suggestions.push('-' + variable);
                    }

                    return suggestions;
                },

                textFieldShouldShowSuggestions() {
                    return NO;
                },

                textFieldContentsDidChange() {
                    const number = parseFloat(box.value);
                    const constantValue = isNaN(number) ? box.value : number;
    
                    if (!box.value) {
                        constraint.constant = 0;
                        return;
                    }
                    
                    constraint.constant = constantValue;
                        
                    constraint._updateConfiguration();
                    constraint._constraint = undefined;
                    constraint._constituentConstraints = undefined;
                    if (constraint._sourceView) {
                        constraint._sourceView.needsLayout = YES;
                    }
                    else {
                        constraint._views[0].needsLayout = YES;
                    }
                },

                textFieldShouldReturn() {
                    blocker.dispatchEvent(new Event('click'));
                    editor.selectView(referenceView);
                    return YES;
                }
            };

            const flexDivider = document.createElement('div');
            flexDivider.style.flexBasis = '100%';
            flexDivider.className = 'BMLayoutEditorDetailsDivider';
            flexDivider.style.marginTop = '0px';
            flexDivider.style.marginBottom = '0px';
            popoverContainer.appendChild(flexDivider);

            const icon = this.settingsBadgeForSizeClass(this.activeSizeClass);
            icon.style.flexShrink = '0';
            icon.style.top = '1px';
            popoverContainer.appendChild(icon);
        }

        const label = document.createElement('div');
        label.className = 'BMLayoutEditorDetailsTitleCell';
        label.innerText = 'Constant:';
        label.style.paddingRight = '8px';

        popoverContainer.appendChild(label);

        const box = document.createElement('input');
        box.type = 'text';
        box.style.width = '50px';
        box.className = 'BMWindowInput BMLayoutEditorDetailsCellInput BMLayoutEditorDetailsItemTextValue';
        if (this.activeSizeClass) {
            if (constraint._variations[this.activeSizeClass]) {
                box.value = constraint._variations[this.activeSizeClass].constant;
            }
            else {
                box.value = '';
            }
        }
        else {
            box.value = constraint.constant;
        }
        popoverContainer.appendChild(box);

        const textField = BMTextField.textFieldForInputNode(box);
        textField.delegate = {
            textFieldSuggestionsForText() {
                const suggestions = [];
                // Load up the variable names
                const variables = Object.keys(editor.layoutVariableProvider.layoutVariables);
                const uniqueNames = new Set;
                variables.forEach(variable => uniqueNames.add(variable));
    
                // Create a pair of regular and minus-prefixed variable names
                for (const variable of uniqueNames) {
                    suggestions.unshift(variable);
                    suggestions.push('-' + variable);
                }

                return suggestions;
            },

            textFieldShouldShowSuggestions() {
                return NO;
            },

            textFieldContentsDidChange() {
                const number = parseFloat(box.value);
                const constantValue = isNaN(number) ? box.value : number;

                if (!box.value) {
                    if (editor.activeSizeClass) {
                        constraint.removeConstantVariationForSizeClass(editor.activeSizeClass);
                        constraint._updateConfiguration();
                    }
                    else {
                        constraint.constant = 0;
                    }
                    return;
                }
                
                if (editor.activeSizeClass) {
                    constraint.setConstant(constantValue, {forSizeClass: editor.activeSizeClass});
                }
                else {
                    constraint.constant = constantValue;
                }
                    
                constraint._updateConfiguration();
                constraint._constraint = undefined;
                constraint._constituentConstraints = undefined;
                if (constraint._sourceView) {
                    constraint._sourceView.needsLayout = YES;
                }
                else {
                    constraint._views[0].needsLayout = YES;
                }
            },

            textFieldShouldReturn() {
                blocker.dispatchEvent(new Event('click'));
                editor.selectView(referenceView);
                return YES;
            }
        };

        box.focus();

        let popoverVisible = YES;
        const popoverLayers = [popoverContainer, popoverBackground, popoverDropShadowContainer];

        for (const layer of popoverLayers) {
            layer.style.transformOrigin = ((knobPosition / frame.size.width) * 100) + '% ' + (appearsBelow ? '100%' : '0%');
            BMHook(layer, {scaleX: .75, scaleY: .75, opacity: 0});

            __BMVelocityAnimate(layer, {scaleX: 1, scaleY: 1, opacity: 1}, {duration: 300, easing: [0,1.59,.49,1]});
        }

        // Add the click action to the overlay, which is to dismiss the popover and persist the layout variables
        blocker.addEventListener('click', event => {
            popoverVisible = NO;
            
            blocker.remove();
            for (const layer of popoverLayers) {
                layer.style.pointerEvents = 'none';
    
                __BMVelocityAnimate(layer, {scaleX: .9, scaleY: .9, opacity: 0}, {duration: 200, easing: 'easeInOutQuart', complete() {layer.remove(); }});
            }

            this.node.focus();
        });
    },

    /**
     * Resizes the workspace to the given static size. Optionally, this change may be animated.
     * @param size <BMSize>                     The new size.
     */
    _setStaticWorkspaceSize(size, args) {
        this._staticWorkspaceSize = size;

        this.workspaceLeft.remove();
        this.workspaceTop.remove();
        this.workspaceWidth.remove();
        this.workspaceHeight.remove();

        (this.workspaceLeft = this.workspace.centerX.equalTo(this.workspaceWrapperView.centerX, {priority: 750})).isActive = YES;
        (this.workspaceTop = this.workspace.centerY.equalTo(this.workspaceWrapperView.centerY, {priority: 750})).isActive = YES;
        (this.workspaceWidth = this.workspace.width.equalTo(size.width)).isActive = YES;
        (this.workspaceHeight = this.workspace.height.equalTo(size.height)).isActive = YES;

        BMAnimateWithBlock(() => {
            this.layout();
        }, {duration: 300, easing: 'easeInOutQuart', complete: () => {
            if (this.selectedView) this.selectView(this.selectedView);
            if (this.selectedConstraint) this.selectConstraint(this.selectedConstraint, {withReferenceView: this.selectedConstraintReferenceView});
        }});

        /*BMCopyProperties(this.workspaceNode.style, {left: 'auto', top: 'auto', right: 'auto', bottom: 'auto', width: size.width + 'px', height: size.height + 'px', position: 'relative', margin: 'auto'});
        this._view.layout();*/
    },

    // @override - BMWindow
    _bringToFrontAnimated(animated, args) {
        args = args || {};

        var completionHandler;
        if (args.completionHandler) {
            completionHandler = args.completionHandler;
        }
        args.completionHandler = _ => {
            if (completionHandler) completionHandler();
            this._view.needsLayout = YES;
        };

        BMWindow.prototype.bringToFrontAnimated.apply(this, arguments);

        this._view.node.style.display = 'block';
        this.workspaceNode.appendChild(this._view.node);

        requestAnimationFrame(_ => this._view.needsLayout = YES);
    },

    /**
     * Draws the constraints affecting the given view.
     * @param view <BMView>                                         The view.
     * {
     *  @param includesSubviewConstraints <Boolean, nullable>       Maintained for compatibility. The value of this parameter is ignored.
     *  @param includesInactiveConstraints <Boolean, nullable>      Defaults to `NO`. Controls whether inactive constraints are drawn.
     * }
     */
    _drawConstraintsForView(view, args) {
        args = args || {};
        this._clearOffsets();
        this._view.node.querySelectorAll('.BMLayoutEditorConstraint, .BMLayoutEditorLeadLine').forEach(node => node.remove());

        let drawnConstraints = [];

        view.localConstraints.forEach(constraint => {
            if (!constraint.affectsLayout && !args.includesInactiveConstraints) return;

            if (!constraint._isConstraintCollection) {
                // Push subview constraints into their own categories
                /*if (constraint._sourceView == view && constraint._targetView && constraint._targetView.isDescendantOfView(view)) {
                    if (!args.includesSubviewConstraints) return;
                }
                if (constraint._targetView == view && constraint._sourceView.isDescendantOfView(view)) {
                    if (!args.includesSubviewConstraints) return;
                }*/
            }

            const drawnConstraint = this._drawConstraint(constraint, {withReferenceView: view});
            if (Array.isArray(drawnConstraint)) {
                for (const constraint of drawnConstraint) {
                    drawnConstraints.push(constraint);
                }
            }
            else {
                drawnConstraints.push(drawnConstraint);
            }
        });

        // Filter out constraints which aren't drawn with definitions
        drawnConstraints = drawnConstraints.filter(constraint => constraint);

        // Adjust the constraints that overlap
        let hasOverlaps = NO;
        for (let k = 0; k < 500; k++) {
            for (const sourceConstraint of drawnConstraints) {
                for (const targetConstraint of drawnConstraints) {
                    if (targetConstraint == sourceConstraint || targetConstraint.kind != sourceConstraint.kind) continue;

                    let mainAxisAttribute = 'x';
                    let secondaryAxisAttribute = 'y';
                    if (sourceConstraint.kind !== BMLayoutConstraintKind.Horizontal) {
                        mainAxisAttribute = 'y';
                        secondaryAxisAttribute = 'x';
                    }

                    if (sourceConstraint.sourcePoint[mainAxisAttribute] == targetConstraint.sourcePoint[mainAxisAttribute]) {

                        // Two horizontal constraints overlap if they originate on the same size and their Y positions are within 5 pixels of eachother
                        // A similar reasoning is used for vertical constraints, but with the coordinates swapped
                        if (Math.abs(sourceConstraint.sourcePoint[secondaryAxisAttribute] - targetConstraint.sourcePoint[secondaryAxisAttribute]) < 5) {
                            // If the constraints overlap directly, the first constraint will move up and the second will move down
                            // Otherwise the topmost constraint will move up and the second will move down
                            const sourceDisplacement = 3 * (Math.sign(sourceConstraint.sourcePoint[secondaryAxisAttribute] - targetConstraint.sourcePoint[secondaryAxisAttribute]) || -1);
                            const targetDisplacement = 3 * (Math.sign(targetConstraint.sourcePoint[secondaryAxisAttribute] - sourceConstraint.sourcePoint[secondaryAxisAttribute]) || 1);

                            // Also modify the target points in the cases where they are on the same axis as the source points
                            if (sourceConstraint.sourcePoint[secondaryAxisAttribute] == sourceConstraint.targetPoint[secondaryAxisAttribute]) {
                                sourceConstraint.targetPoint[secondaryAxisAttribute] += sourceDisplacement;
                            }

                            if (targetConstraint.sourcePoint[secondaryAxisAttribute] == targetConstraint.targetPoint[secondaryAxisAttribute]) {
                                targetConstraint.targetPoint[secondaryAxisAttribute] += targetDisplacement;
                            }

                            sourceConstraint.sourcePoint[secondaryAxisAttribute] += sourceDisplacement;
                            targetConstraint.sourcePoint[secondaryAxisAttribute] += targetDisplacement;

                            sourceConstraint.displaced = YES;
                            targetConstraint.displaced = YES;
                            hasOverlaps = YES;
                        }

                    }
                }
            }

            if (!hasOverlaps) break;
        }

        // Update the adjusted constraints
        for (const constraint of drawnConstraints.filter(constraint => constraint.displaced)) {

            // TODO This portion is copy-pased from the draw methods; extract this piece into its own method
            if (constraint.kind == BMLayoutConstraintKind.Horizontal) {
                BMCopyProperties(constraint.node.style, {
                    left: Math.min(constraint.sourcePoint.x, constraint.targetPoint.x) + 'px',
                    top: constraint.sourcePoint.y + 'px'
                });
        
                BMCopyProperties(constraint.leadLine.style, {
                    height: Math.abs(constraint.sourcePoint.y - constraint.targetPoint.y) + 'px',
                    left: (constraint.targetPoint.x < constraint.sourcePoint.x ? (constraint.targetPoint.x) : (constraint.targetPoint.x - 1)) + 'px',
                    top: Math.min(constraint.targetPoint.y, constraint.sourcePoint.y) + 'px'
                });
            }
            else {
                BMCopyProperties(constraint.node.style, {
                    left: constraint.sourcePoint.x + 'px',
                    top: Math.min(constraint.sourcePoint.y, constraint.targetPoint.y) + 'px'
                });
        
                BMCopyProperties(constraint.leadLine.style, {
                    width: Math.abs(constraint.sourcePoint.x - constraint.targetPoint.x) + 'px',
                    top: (constraint.targetPoint.y < constraint.sourcePoint.y ? (constraint.targetPoint.y) : (constraint.targetPoint.y - 1)) + 'px',
                    left: Math.min(constraint.targetPoint.x, constraint.sourcePoint.x) + 'px'
                });
            }
        }
    },

    /**
     * Should be invoked to make the given view selected.
     * This will deselect the currently selected item.
     * @param view <BMView, nullable>         The view to select, or undefined to clear the selection.
     * {
     *  @param withEvent <Event, nullable>    The event that triggered this action, if available.
     * }
     */
    selectView(view, args) {

        let event = args && args.withEvent;

        // If this view was selected with the ctrl/cmd key held down, start a multi-selection
        if (event && (event.metaKey || event.ctrlKey)) {
            return this.toggleSelectionForView(view);
        }

        if (BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW && this.selectedView === view) {
            // When using the new settings view, if the view is already selected, just redraw the constraints
            // This is currently done because select view is invoked in place of a more specialized redraw constraints method
            // which should be fixed in the future
            this._view.node.querySelectorAll('.BMLayoutEditorConstraint, .BMLayoutEditorLeadLine').forEach(node => node.remove());

            this._clearOffsets();
            this._drawConstraintsForView(view);

            return;
        }

        this.tree.selectView(view);

        view._checkConstraints();

        if (!view._hasDeterministicConstraints) {
            this.workspaceNode.classList.add('BMLayoutEditorWorkspaceInvalidLayout');
        }
        else {
            this.workspaceNode.classList.remove('BMLayoutEditorWorkspaceInvalidLayout');
        }

        if (!BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW) this.detailsNodeTitle.innerText = view.debuggingName || view.node.id;

        // Clear the previous selection and set of constraints
        this._view.node.querySelectorAll('.BMLayoutEditorViewSelectorSelected, .BMLayoutEditorViewSelectorConstrained').forEach(node => {
            node.classList.remove('BMLayoutEditorViewSelectorSelected');
            node.classList.remove('BMLayoutEditorViewSelectorConstrained');
        });

        this._view.node.querySelectorAll('.BMLayoutEditorConstraint, .BMLayoutEditorLeadLine').forEach(node => node.remove());

        this.selectedView = view;
        this.selectedConstraint = undefined;
        this.selectedViews = undefined;

        if (view) {
            view._selector.classList.add('BMLayoutEditorViewSelectorSelected');

            this._clearOffsets();
            view.localConstraints.forEach(constraint => {
                if (constraint.isConstraintCollection) {
                    constraint._views.forEach(subview => subview != view && subview._selector.classList.add('BMLayoutEditorViewSelectorConstrained'));
                }
                else {
                    if (constraint._sourceView != view) { 
                        constraint._sourceView._selector.classList.add('BMLayoutEditorViewSelectorConstrained');
                    }
                    if (constraint._targetView && constraint._targetView != view) {
                        constraint._targetView._selector.classList.add('BMLayoutEditorViewSelectorConstrained');
                    }
                }

                //this._drawConstraint(constraint, {withReferenceView: view});

            });

            this._drawConstraintsForView(view);

            if (!BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW) {
                this.detailsNodeContent.innerHTML = '';
                this.createSettingsForView(view);
            }
            else {
                this.detailsView.layoutEditorDidSelectView(view);
            }
        }
    },

    /**
     * Invoked during a multiple selection to toggle the selection state for the given view.
     * @param view <BMView>     The view.
     */
    toggleSelectionForView(view) {
        this.selectedViews = this.selectedViews || [];

        // If there is a view alredy selected, add it to the selected views, then clear the previous selection
        if (this.selectedView) this.selectedViews.push(this.selectedView);
        this.selectedView = undefined;
        this.selectedConstraint = undefined;

        // Don't show invalid layouts during multiple selections
        this.workspaceNode.classList.remove('BMLayoutEditorWorkspaceInvalidLayout');

        // Clear the previous set of constrained views and constraints
        this._view.node.querySelectorAll('.BMLayoutEditorViewSelectorConstrained').forEach(node => {
            node.classList.remove('BMLayoutEditorViewSelectorConstrained');
        });
        this._view.node.querySelectorAll('.BMLayoutEditorConstraint, .BMLayoutEditorLeadLine').forEach(node => node.remove());

        // If this would deselect the last selected view, do nothing
        if (this.selectedViews.length == 1 && this.selectedViews[0] == view) return;

        let index;
        if ((index = this.selectedViews.indexOf(view)) == -1) {
            // Otherwise if the view wasn't already selected add it to the selection
            this.selectedViews.push(view);
            view._selector.classList.add('BMLayoutEditorViewSelectorSelected');
            this.tree.selectView(view, {continuous: YES});
        }
        else {
            // If it was then remove it
            this.selectedViews.splice(index, 1);
            view._selector.classList.remove('BMLayoutEditorViewSelectorSelected');
            this.tree.deselectView(view);
        }

        if (this.selectedViews.length == 1) {
            return this.selectView(this.selectedViews[0]);
        }
        else if (BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW) {
            return this.detailsView.layoutEditorDidSelectViews(this.selectedViews);
        }

        // Create the settings screen for multi-selection
        this.createSettingsForMultipleViews();
    },

    viewDidLayoutSubviews() {
        if (this.selectedConstraint) {
            requestAnimationFrame(_ => {
                this._clearOffsets();
                this._view.node.querySelectorAll('.BMLayoutEditorConstraint, .BMLayoutEditorLeadLine').forEach(node => node.remove());
                this._drawConstraint(this.selectedConstraint, {withReferenceView: this.selectedConstraintReferenceView});
            });
        }

        if (this.selectedView) {
            requestAnimationFrame(_ => {
                this._clearOffsets();
                this._view.node.querySelectorAll('.BMLayoutEditorConstraint, .BMLayoutEditorLeadLine').forEach(node => node.remove());
                this.selectedView.localConstraints.forEach(viewConstraint => this._drawConstraint(viewConstraint, {withReferenceView: this.selectedView}));
            });
        }
    },

    /**
     * 
     * @param node <DOMNode>
     * {
     *  @param view <BMView>
     * }
     */
    initDragEventListenerForNode(node, args) {
        let view = args.view;

        node.addEventListener('contextmenu', event => event.preventDefault());
        // Create the event handler for right-click drags which creates constraints
        let touchIdentifier;
        let mousedownEventListener = event => {
            if (event.button != 2 && !this.isCreatingTouchConstraints) return;

            if (event.type == 'touchstart') {
                touchIdentifier = event.changedTouches[0].identifier;
            }

            this.isCreatingConstraint = YES;
            this.constraintSource = view;
            this.constraintTarget = view;

            node.classList.add('BMLayoutEditorDragSource');

            var chromeContextMenuBlocker = e => e.preventDefault();
            
            // Chrome needs this on window
            window.addEventListener("contextmenu", chromeContextMenuBlocker);
            let touchmoveHandler;

            let mouseupEventListener = event => {
                if (event.type == 'touchend' || event.type == 'touchstart') {
                    var hasTouch = NO;
                    for (let touch of event.changedTouches) {
                        if (touch.identifier == touchIdentifier) {
                            hasTouch = YES;
                            break;
                        }
                    }
                    if (!hasTouch) return;
                }

                window.removeEventListener('mouseup', mouseupEventListener);
                window.removeEventListener('touchchancel', mouseupEventListener);
                window.removeEventListener('touchend', mouseupEventListener);
                if (touchmoveHandler) window.removeEventListener('touchmove', touchmoveHandler);

                requestAnimationFrame(_ => window.removeEventListener("contextmenu", chromeContextMenuBlocker));

                this.isCreatingConstraint = NO;

                this.content.querySelectorAll('.BMLayoutEditorDragTarget').forEach(target => target.classList.remove('BMLayoutEditorDragTarget'));
                this.content.querySelectorAll('.BMLayoutEditorDragSource').forEach(target => target.classList.remove('BMLayoutEditorDragSource'));

                let point = event.type == 'mouseup' ? BMPointMake(event.clientX, event.clientY) : BMPointMake(event.changedTouches[0].clientX, event.changedTouches[0].clientY);

                this.showConstraintOptionsFromView(this.constraintSource, {toView: this.constraintTarget, atPoint: point});
                event.preventDefault();

            };
            window.addEventListener('mouseup', mouseupEventListener);
            window.addEventListener('touchchancel', mouseupEventListener);
            window.addEventListener('touchend', mouseupEventListener);

            // For touch devices, mouseover and mouseout cannot be used as there are no pointer events;
            // Instead, throughout the drag operation, the pointer's position is converted into the topmost node and if that node
            // is a child of any view, that view becomes the constraint target
            // This handler is installed globally and will affect all possible drop targets
            if (BMIsTouchDevice) {
                let touchmoveHandler = event => {
                    for (let touch of event.changedTouches) {
                        if (touch.identifier == touchIdentifier) {
                            this.content.querySelectorAll('.BMLayoutEditorDragTarget').forEach(target => target.classList.remove('BMLayoutEditorDragTarget'));
                
                            let node = document.elementFromPoint(touch.clientX, touch.clientY);
                            let selector = node.closest('.BMLayoutEditorViewSelector')
                            if (selector) {
                                node.classList.add('BMLayoutEditorDragTarget');
                                this.constraintTarget = BMView.viewForNode(selector.parentNode);
                            }
                            event.preventDefault();
                        }
                    }
                };
                window.addEventListener('touchmove', touchmoveHandler);
            }
        


            event.preventDefault();
        };
        node.addEventListener('mousedown', mousedownEventListener);
        node.addEventListener('touchstart', mousedownEventListener);

        
        // Create the handler for tap drags, which temporarily displaces the view's frame
        node.addEventListener('touchstart', event => {
            const touchIdentifier = event.changedTouches[0].identifier;
            const touch = event.changedTouches[0];

            // Save a reference to the current frame of the view
            let frame = view.frame || BMRectMakeWithNodeFrame(view.node);

            let frameDidMove = false;

            // Retain a reference to the current position
            let position = BMPointMake(touch.pageX, touch.pageY);

            let didRemoveConstraints = NO;

            let mousemoveEventListener = event => {
                let touch;
                for (let i = 0; i < event.changedTouches.length; i++) {
                    const changedTouch = event.changedTouches;
                    if (changedTouch.identifier == touchIdentifier) {
                        touch = changedTouch;
                        break;
                    }
                }

                if (!touch) return;
                frameDidMove = true;
                
                if (!didRemoveConstraints) {
                    this._view.node.querySelectorAll('.BMLayoutEditorConstraint, .BMLayoutEditorLeadLine').forEach(node => node.remove());
                    didRemoveConstraints = YES;
                }

                let displacement = BMPointMake(touch.pageX - position.x, touch.pageY - position.y);
                if (this.scale != 1) {
                    // Because the elements can be scaled, the displacement needs to have the inverse scaling applied 
                    // to avoid the element moving out of sync with the pointer
                    displacement.multiplyWithScalar(1 / this.scale);
                }
                let displacedFrame = frame.copy();
                displacedFrame.offsetWithX(displacement.x, {y: displacement.y});
                view.frame = displacedFrame;

                event.preventDefault();
                event.stopImmediatePropagation();
                event.stopPropagation();
            };

            let mouseupEventListener = event => {
                let touch;
                for (let i = 0; i < event.changedTouches.length; i++) {
                    const changedTouch = event.changedTouches;
                    if (changedTouch.identifier == touchIdentifier) {
                        touch = changedTouch;
                        break;
                    }
                }

                if (!touch) return;

                node.removeEventListener('touchend', mouseupEventListener, {capture: YES});
                node.removeEventListener('touchcancel', mouseupEventListener, {capture: YES});
                node.removeEventListener('touchmove', mousemoveEventListener, {capture: YES});
                
                if (frameDidMove) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    event.stopPropagation();

                    this.selectView(view);
                }

            };

            node.addEventListener('touchend', mouseupEventListener, {capture: YES});
            node.addEventListener('touchcancel', mouseupEventListener, {capture: YES});
            node.addEventListener('touchmove', mousemoveEventListener, {capture: YES});
        });

        

        // Create the handler for left-click drags, which temporarily displaces the view's frame.
        node.addEventListener('mousedown', event => {
            if (event.button != 0) return;

            // Save a reference to the current frame of the view
            let frame = view.frame || BMRectMakeWithNodeFrame(view.node);

            let frameDidMove = false;

            // Retain a reference to the current position
            let position = BMPointMake(event.pageX, event.pageY);
            let didRemoveConstraints = NO;

            let mousemoveEventListener = event => {
                frameDidMove = true;

                if (!didRemoveConstraints) {
                    this._view.node.querySelectorAll('.BMLayoutEditorConstraint, .BMLayoutEditorLeadLine').forEach(node => node.remove());
                    didRemoveConstraints = YES;
                }

                let displacement = BMPointMake(event.pageX - position.x, event.pageY - position.y);
                if (this.scale != 1) {
                    // Because the elements can be scaled, the displacement needs to have the inverse scaling applied 
                    // to avoid the element moving out of sync with the pointer
                    displacement.multiplyWithScalar(1 / this.scale);
                }
                let displacedFrame = frame.copy();
                displacedFrame.offsetWithX(displacement.x, {y: displacement.y});
                view.frame = displacedFrame;

                event.preventDefault();
                event.stopImmediatePropagation();
                event.stopPropagation();
            };

            let mouseupEventListener = event => {
                window.removeEventListener('mouseup', mouseupEventListener, {capture: YES});
                window.removeEventListener('mousemove', mousemoveEventListener, {capture: YES});
                
                if (frameDidMove) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    event.stopPropagation();

                    this.selectView(view);
                }

            };

            window.addEventListener('mouseup', mouseupEventListener, {capture: YES});
            window.addEventListener('mousemove', mousemoveEventListener, {capture: YES});
        });

        node.addEventListener('mouseenter', event => {
            if (!this.isCreatingConstraint) return;

            this.content.querySelectorAll('.BMLayoutEditorDragTarget').forEach(target => target.classList.remove('BMLayoutEditorDragTarget'));

            node.classList.add('BMLayoutEditorDragTarget');
            this.constraintTarget = view;
            event.preventDefault();
        });
    },

    /**
     * 
     * @param label <String>
     * {
     *  @param action <void ^(Event)>
     * }
     * @return <DOMNode>
     */
    constraintOptionWithLabel(label, args) {
        let option = document.createElement('div');
        option.className = 'BMLayoutEditorConstraintPopupOption';
        option.innerText = label;

        option.addEventListener('click', args.action);

        return option;
    },

    /**
     * Adds the given constraint to the view model, then selects it.
     * @param constraint <BMLayoutConstraint>   The constraint to add.
     */
    addConstraint(constraint) {
        constraint.isActive = YES;
        this.tree.addConstraint(constraint);

        // If the constraint was created in a size class context, mark it as inactive, except for the selected
        // size class
        if (this._activeSizeClass) {
            constraint.isActive = NO;
            constraint.setIsActive(YES, {forSizeClass: this._activeSizeClass});
        }

        this.selectConstraint(constraint, {withReferenceView: constraint._sourceView});
    },

    /**
     * Creates and brings up a context menu at the given coordinates, relative to the viewport.
     * @param point <BMPoint>               The point at which to show the menu.
     * {
     *  @param withOptions <[DOMNode]>      The options that the menu should display.
     *  @param kind <BMMenuKind, nullable>  Defaults to .Menu. The kind of menu to show.
     * }
     * @return <DOMNode>                    The menu element.
     */
    showMenuAtPoint(point, args) {
        let constraintPopup = document.createElement('div');
        constraintPopup.className = 'BMLayoutEditorConstraintPopup';

        let constraintPopupContainer = document.createElement('div');
        constraintPopupContainer.className = 'BMLayoutEditorConstraintPopupContainer';
        if (!('backdropFilter' in document.body.style) && !('webkitBackdropFilter' in document.body.style)) {
            constraintPopup.style.backgroundColor = 'white';
        }
        constraintPopupContainer.appendChild(constraintPopup);

        args.withOptions.forEach(item => constraintPopup.appendChild(item));

        BMHook(constraintPopup, {scaleX: args.kind == BMMenuKind.PullDownMenu ? 1 : .75, scaleY: .75, opacity: 0});

        document.body.appendChild(constraintPopupContainer);

        let height = constraintPopup.offsetHeight;

        constraintPopup.style.transformOrigin = '0% 0%';
        if (args.kind == BMMenuKind.PullDownMenu) {
            constraintPopup.style.transformOrigin = '50% 0%';
        }
        if (height + point.y > document.documentElement.clientHeight) {
            constraintPopup.style.transformOrigin = '0% 100%';
            if (args.kind == BMMenuKind.PullDownMenu) {
                constraintPopup.style.transformOrigin = '50% 100%';
            }
            point.y -= height;
        }

        constraintPopup.style.left = point.x + 'px';
        constraintPopup.style.top = point.y + 'px';

        constraintPopup.addEventListener('click', event => event.preventDefault());

        (window.Velocity || $.Velocity).animate(constraintPopup, {scaleX: 1, scaleY: 1, opacity: 1, translateZ: 0}, {
            duration: 200,
            easing: 'easeOutQuad',
            complete: _ => ((constraintPopup.style.pointerEvents = 'all'), constraintPopupContainer.style.pointerEvents = 'all')
        });

        let delay = 0;
        for (let child of constraintPopup.childNodes) {
            BMHook(child, {translateY: '16px', translateZ: 0, opacity: 0});
            (window.Velocity || $.Velocity).animate(child, {translateY: '0px', translateZ: 0, opacity: 1}, {
                duration: 100,
                easing: 'easeOutQuad',
                delay: delay
            });
            delay += 16;
        }

        constraintPopupContainer.addEventListener('click', event => {
            constraintPopup.style.pointerEvents = 'none'; 
            constraintPopupContainer.style.pointerEvents = 'none';
            let delay = constraintPopup.childNodes.length * 16 + 100 - 200;
            delay = (delay < 0 ? 0 : delay);

            (window.Velocity || $.Velocity).animate(constraintPopup, {scaleX: args.kind == BMMenuKind.PullDownMenu ? 1 : .75, scaleY: .75, opacity: 0, translateZ: 0}, {
                duration: 200,
                easing: 'easeInQuad',
                delay: delay,
                complete: _ => constraintPopupContainer.remove()
            });

            delay = 0;
            for (let i = constraintPopup.childNodes.length - 1; i >= 0; i--) {
                let child = constraintPopup.childNodes[i];
                (window.Velocity || $.Velocity).animate(child, {translateY: '16px', translateZ: 0, opacity: 0}, {
                    duration: 100,
                    easing: 'easeInQuad',
                    delay: delay
                });
                delay += 16;
            }

            this.node.focus();
        });

        return constraintPopup;
    },

    /**
     * Brings up a menu allowing the user to select, from a list, the type of constraint
     * that they want to add.
     * Once the user selects a constraint, it will be added and selected in the editor.
     * @param view <BMView>                 The source view.
     * {
     *  @param toView <BMView, nullable>    The target view.
     *  @param atPoint <BMPoint>            The point at which to bring up the menu.
     * }
     */
    showConstraintOptionsFromView(view, args) {
        let toView = args.toView;
        let constraintPopup = document.createElement('div');
        constraintPopup.className = 'BMLayoutEditorConstraintPopup';

        if (toView && toView !== view) {
            this.horizontalConstraintOptionsFromView(view, {toView: toView}).forEach(constraintOption => constraintPopup.appendChild(constraintOption));
            constraintPopup.appendChild(this.settingsDivider());
            this.verticalConstraintOptionsFromView(view, {toView: toView}).forEach(constraintOption => constraintPopup.appendChild(constraintOption));
            constraintPopup.appendChild(this.settingsDivider());
            constraintPopup.appendChild(this.constraintOptionWithLabel('Equal Width', {action:_ => {
                this.addConstraint(BMLayoutConstraint.constraintWithView(view, {
                    attribute: BMLayoutAttribute.Width,
                    toView: toView,
                    secondAttribute: BMLayoutAttribute.Width
                }));
            }}));
            constraintPopup.appendChild(this.constraintOptionWithLabel('Equal Height', {action:_ => {
                this.addConstraint(BMLayoutConstraint.constraintWithView(view, {
                    attribute: BMLayoutAttribute.Height,
                    toView: toView,
                    secondAttribute: BMLayoutAttribute.Height
                }));
            }}));
        }
        else {
            constraintPopup.appendChild(this.constraintOptionWithLabel('Width', {action:_ => {
                this.addConstraint(BMLayoutConstraint.constraintWithView(view, {attribute: BMLayoutAttribute.Width, constant: view.node.offsetWidth}));
            }}));
            constraintPopup.appendChild(this.constraintOptionWithLabel('Height', {action:_ => {
                this.addConstraint(BMLayoutConstraint.constraintWithView(view, {attribute: BMLayoutAttribute.Height, constant: view.node.offsetHeight}));
            }}));
        }

        let constraintPopupContainer = document.createElement('div');
        constraintPopupContainer.className = 'BMLayoutEditorConstraintPopupContainer';
        if (!('backdropFilter' in document.body.style) && !('webkitBackdropFilter' in document.body.style)) {
            constraintPopup.style.backgroundColor = 'white';
        }
        constraintPopupContainer.appendChild(constraintPopup);

        BMHook(constraintPopup, {scaleX: .75, scaleY: .75, opacity: 0});

        document.body.appendChild(constraintPopupContainer);

        let height = constraintPopup.offsetHeight;

        constraintPopup.style.transformOrigin = '0% 0%';
        if (height + args.atPoint.y > document.documentElement.clientHeight) {
            constraintPopup.style.transformOrigin = '0% 100%';
            args.atPoint.y -= height;
        }

        constraintPopup.style.left = args.atPoint.x + 'px';
        constraintPopup.style.top = args.atPoint.y + 'px';

        constraintPopup.addEventListener('click', event => event.preventDefault());

        (window.Velocity || $.Velocity).animate(constraintPopup, {scaleX: 1, scaleY: 1, opacity: 1, translateZ: 0}, {
            duration: 200,
            easing: 'easeOutQuad',
            complete: _ => ((constraintPopup.style.pointerEvents = 'all'), constraintPopupContainer.style.pointerEvents = 'all')
        });

        let delay = 0;
        for (let child of constraintPopup.childNodes) {
            BMHook(child, {translateY: '16px', translateZ: 0, opacity: 0});
            (window.Velocity || $.Velocity).animate(child, {translateY: '0px', translateZ: 0, opacity: 1}, {
                duration: 100,
                easing: 'easeOutQuad',
                delay: delay
            });
            delay += 16;
        }

        constraintPopupContainer.addEventListener('click', event => {
            constraintPopup.style.pointerEvents = 'none'; 
            constraintPopupContainer.style.pointerEvents = 'none';
            let delay = constraintPopup.childNodes.length * 16 + 100 - 200;
            delay = (delay < 0 ? 0 : delay);

            (window.Velocity || $.Velocity).animate(constraintPopup, {scaleX: .75, scaleY: .75, opacity: 0, translateZ: 0}, {
                duration: 200,
                easing: 'easeInQuad',
                delay: delay,
                complete: _ => constraintPopupContainer.remove()
            });

            delay = 0;
            for (let i = constraintPopup.childNodes.length - 1; i >= 0; i--) {
                let child = constraintPopup.childNodes[i];
                (window.Velocity || $.Velocity).animate(child, {translateY: '16px', translateZ: 0, opacity: 0}, {
                    duration: 100,
                    easing: 'easeInQuad',
                    delay: delay
                });
                delay += 16;
            }
        });
    },


    /**
     * Returns an array of DOM nodes representing the possible default choices for horizontal constraints.
     * @param view <BMView>                 The source view.
     * {
     *  @param toView <BMView, nullable>    The target view.
     * }
     * @return <[DOMNode]>                  The options.
     */
    horizontalConstraintOptionsFromView(view, args) {
        var toView = args.toView;
        return [
           this.constraintOptionWithLabel('Align Leading', {action:_ => {
                this.addConstraint(BMLayoutConstraint.constraintWithView(view, {
                    attribute: BMLayoutAttribute.Leading,
                    toView: toView,
                    secondAttribute: BMLayoutAttribute.Leading, 
                    constant: BMRectMakeWithNodeFrame(view.node).left - BMRectMakeWithNodeFrame(toView.node).left
                }));
            }}),
            this.constraintOptionWithLabel('Align Horizontal Center', {action:_ => {
                this.addConstraint(BMLayoutConstraint.constraintWithView(view, {
                    attribute: BMLayoutAttribute.CenterX,
                    toView: toView,
                    secondAttribute: BMLayoutAttribute.CenterX, 
                    constant: BMRectMakeWithNodeFrame(view.node).center.x - BMRectMakeWithNodeFrame(toView.node).center.x
                }));
            }}),
            this.constraintOptionWithLabel('Align Trailing', {action:_ => {
                this.addConstraint(BMLayoutConstraint.constraintWithView(view, {
                    attribute: BMLayoutAttribute.Trailing,
                    toView: toView,
                    secondAttribute: BMLayoutAttribute.Trailing, 
                    constant: BMRectMakeWithNodeFrame(view.node).right - BMRectMakeWithNodeFrame(toView.node).right
                }));
            }}),
            this.constraintOptionWithLabel('Horizontal Spacing', {action:_ => {
                // For horizontal spacing the final constraints depends on how the views currently appear in the layout
                let sourceFrame = BMRectMakeWithNodeFrame(view.node);
                let targetFrame = BMRectMakeWithNodeFrame(toView.node);

                if (sourceFrame.origin.x >= targetFrame.right) {
                    this.addConstraint(BMLayoutConstraint.constraintWithView(view, {
                        attribute: BMLayoutAttribute.Leading,
                        toView: toView,
                        secondAttribute: BMLayoutAttribute.Trailing, 
                        constant: - BMRectMakeWithNodeFrame(view.node).right + BMRectMakeWithNodeFrame(toView.node).origin.x
                    }));
                }
                else {
                    this.addConstraint(BMLayoutConstraint.constraintWithView(view, {
                        attribute: BMLayoutAttribute.Trailing,
                        toView: toView,
                        secondAttribute: BMLayoutAttribute.Leading, 
                        constant: BMRectMakeWithNodeFrame(view.node).origin.x - BMRectMakeWithNodeFrame(toView.node).right
                    }));
                }
            }})
        ];
    },


    /**
     * Returns an array of DOM nodes representing the possible default choices for vertical constraints.
     * @param view <BMView>                 The source view.
     * {
     *  @param toView <BMView, nullable>    The target view.
     * }
     * @return <[DOMNode]>                  The options.
     */
    verticalConstraintOptionsFromView(view, args) {
        var toView = args.toView;
        return [
           this.constraintOptionWithLabel('Align Top', {action:_ => {
                this.addConstraint(BMLayoutConstraint.constraintWithView(view, {
                    attribute: BMLayoutAttribute.Top,
                    toView: toView,
                    secondAttribute: BMLayoutAttribute.Top, 
                    constant: BMRectMakeWithNodeFrame(view.node).top - BMRectMakeWithNodeFrame(toView.node).top
                }));
            }}),
            this.constraintOptionWithLabel('Align Vertical Center', {action:_ => {
                this.addConstraint(BMLayoutConstraint.constraintWithView(view, {
                    attribute: BMLayoutAttribute.CenterY,
                    toView: toView,
                    secondAttribute: BMLayoutAttribute.CenterY, 
                    constant: BMRectMakeWithNodeFrame(view.node).center.y - BMRectMakeWithNodeFrame(toView.node).center.y
                }));
            }}),
            this.constraintOptionWithLabel('Align Bottom', {action:_ => {
                this.addConstraint(BMLayoutConstraint.constraintWithView(view, {
                    attribute: BMLayoutAttribute.Bottom,
                    toView: toView,
                    secondAttribute: BMLayoutAttribute.Bottom, 
                    constant: BMRectMakeWithNodeFrame(view.node).bottom - BMRectMakeWithNodeFrame(toView.node).bottom
                }));
            }}),
            this.constraintOptionWithLabel('Vertical Spacing', {action:_ => {
                // For horizontal spacing the final constraints depends on how the views currently appear in the layout
                let sourceFrame = BMRectMakeWithNodeFrame(view.node);
                let targetFrame = BMRectMakeWithNodeFrame(toView.node);

                if (sourceFrame.origin.y >= targetFrame.bottom) {
                    this.addConstraint(BMLayoutConstraint.constraintWithView(view, {
                        attribute: BMLayoutAttribute.Top,
                        toView: toView,
                        secondAttribute: BMLayoutAttribute.Bottom, 
                        constant: - BMRectMakeWithNodeFrame(view.node).bottom + BMRectMakeWithNodeFrame(toView.node).origin.y
                    }));
                }
                else {
                    this.addConstraint(BMLayoutConstraint.constraintWithView(view, {
                        attribute: BMLayoutAttribute.Top,
                        toView: toView,
                        secondAttribute: BMLayoutAttribute.Bottom, 
                        constant: BMRectMakeWithNodeFrame(view.node).origin.y - BMRectMakeWithNodeFrame(toView.node).bottom
                    }));
                }
            }})
        ];
    },

    /**
     * Should be invoked to make the given constraint selected.
     * This will deselect the currently selected item.
     * @param constraint <BMLayoutConstraint, nullable>         The constraint to select, or undefined to clear the selection.
     * {
     *  @param withReferenceView <BMView, nullable>             Must be specified if `constraint` is non-null. The reference view to which the constraint refers.
     * }
     */
    selectConstraint(constraint, args) {
        if (this.selectedConstraint == constraint && this.selectedConstraintReferenceView == args.withReferenceView) return;

        this.selectedView = undefined;
        this.selectedViews = undefined;
        this.selectedConstraint = constraint;
        this.selectedConstraintReferenceView = args.withReferenceView;

        this.tree.selectConstraint(constraint);

        this.workspaceNode.classList.remove('BMLayoutEditorWorkspaceInvalidLayout');

        if (!BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW) this.detailsNodeTitle.innerText = 'Constraint';

        // Clear the previous selection and set of constraints
        this._view.node.querySelectorAll('.BMLayoutEditorViewSelectorSelected, .BMLayoutEditorViewSelectorConstrained').forEach(node => {
            node.classList.remove('BMLayoutEditorViewSelectorSelected');
            node.classList.remove('BMLayoutEditorViewSelectorConstrained');
        });

        this._view.node.querySelectorAll('.BMLayoutEditorConstraint, .BMLayoutEditorLeadLine').forEach(node => node.remove());

        if (constraint) {
            this._clearOffsets();

            // Draw the given constraint
            this._drawConstraint(constraint, {withReferenceView: args.withReferenceView});

            if (constraint.isConstraintCollection) {
                constraint._views.forEach(view => view._selector.classList.add('BMLayoutEditorViewSelectorConstrained'));
            }
            else {
                if (constraint._sourceView) {
                    constraint._sourceView._selector.classList.add('BMLayoutEditorViewSelectorConstrained');
                }
                if (constraint._targetView) {
                    constraint._targetView._selector.classList.add('BMLayoutEditorViewSelectorConstrained');
                }
            }

            if (BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW) {
                this.detailsView.layoutEditorDidSelectConstraint(constraint, {withReferenceView: args.withReferenceView});
            }
            else {
                this.detailsNodeContent.innerHTML = '';
                this.createSettingsForConstraint(constraint, {withReferenceView: args.withReferenceView});
            }
        }
    },

    /**
     * Returns the first active constraint that affects any attribute in the given list for this view.
     * Priority will be given to the constraint affecting the first attributes in the given list.
     * @param list <[BMLayoutAttribute]>        The attributes to match against.
     * {
     *  @param forView <BMView>                 The view whose constraints to search.
     * }
     * @return <BMLayoutConsstraint, nullable>  The first matching layout constraint, if it was found, `undefined` otherwise.
     */
    _constraintAffectingAttributeInList(list, {forView: view}) {
        const constraints = view.localConstraints;

        // This will be a map of arrays where the keys are the layout attributes
        // and the values are the matching constraints for that attribute
        const potentialConstraintsPerAttribute = {};
        for (const attribute of list) {
            potentialConstraintsPerAttribute[attribute] = [];
        }

        for (const constraint of constraints) {
            // Skip inactive constraints
            if (!constraint._configuration.isActive) continue;

            // Retrieve an intersection between the attributes that the constraint affects and the allowed attributes
            let matchingAttributes = constraint.affectedAttributesForView(view).filter(attribute => list.includes(attribute));
            // Push the constraint to all matching attributes
            if (matchingAttributes.length) for (const attribute of matchingAttributes) {
                potentialConstraintsPerAttribute[attribute].push(constraint);
            }
        }

        for (const attribute in potentialConstraintsPerAttribute) {
            if (potentialConstraintsPerAttribute[attribute].length) return potentialConstraintsPerAttribute[attribute][0];
        }
    },

    /**
     * Invoked upon the backspace key being pressed.
     * @param event <KeyboardEvent>     The event that triggered this action.
     */
    backspacePressedWithEvent(event) {
        // Don't process this keyboard shortcut if it originates from an input element
        if (event.target.tagName == 'INPUT') return;
        event.preventDefault();

        if (this.selectedConstraint) {
            if (this._activeSizeClass) {
                const isActive = this.selectedConstraint._variations[this._activeSizeClass].isActive;
                if (typeof isActive === 'undefined') {
                    this.selectedConstraint.setIsActive(NO, {forSizeClass: this._activeSizeClass});
                }
                else if (isActive === NO) {
                    this.selectedConstraint.setIsActive(YES, {forSizeClass: this._activeSizeClass});
                }
                else {
                    this.selectedConstraint.removeIsActiveVariationForSizeClass(this._activeSizeClass);
                }
            }
            else {
                this.selectedConstraint.isActive = !this.selectedConstraint.isActive;
            }
        }
    },

    /**
     * Invoked upon the command+backspace keys being pressed.
     * @param event <KeyboardEvent>     The event that triggered this action.
     */
    commandBackspacePressedWithEvent(event) {
        // Don't process this keyboard shortcut if it originates from an input element
        if (event.target.tagName == 'INPUT') return;
        event.preventDefault();
        
        if (this.selectedConstraint) {
            this.selectedConstraint.remove();
            this.selectView(this.selectedConstraintReferenceView);
        }
    },

    /**
     * Sets the selected constraint's equality sign to equal. If no constraint is selected, this method does nothing.
     * @param event <KeyboardEvent>     The event that triggered this action.
     */
    setConstraintToEqualWithEvent(event) {
        if (this.selectedConstraint) {
            this.selectedConstraint._relation = BMLayoutConstraintRelation.Equals;
        }
    },

    /**
     * Sets the selected constraint's equality sign to less than or equal to. If no constraint is selected, this method does nothing.
     * @param event <KeyboardEvent>     The event that triggered this action.
     */
    setConstraintToLessThanWithEvent(event) {
        if (this.selectedConstraint) {
            this.selectedConstraint._relation = BMLayoutConstraintRelation.LessThanOrEquals;
        }
    },

    /**
     * Sets the selected constraint's equality sign to greater than or equal to. If no constraint is selected, this method does nothing.
     * @param event <KeyboardEvent>     The event that triggered this action.
     */
    setConstraintToGreaterThanWithEvent(event) {
        if (this.selectedConstraint) {
            this.selectedConstraint._relation = BMLayoutConstraintRelation.GreaterThanOrEquals;
        }
    },

    /**
     * If a view or constraint is selected, this method will select the view's first active leading, left, centerX, or width constraint,
     * depending on which is available. The width constraint will only be selected if this view has a trailing or right constraint. 
     * 
     * If no such constraint is available, a leading constraint will be created between this view and the closest sibling or superview.
     * The constraint will be created depending on the position of this view relative to other views in the hierarchy.
     * 
     * If no view or constraint is selected, this method will have no effect.
     * @param event <KeyboardEvent>             The event that triggered this action.
     */
    selectLeftConstraintWithEvent(event) {
        const view = this.selectedView || this.selectedConstraintReferenceView;

        if (!view) return;

        if (view == this._view) return;

        // Don't process this keyboard shortcuts if it originates from an input element
        if (event.target.tagName == 'INPUT') return;
        // Prevent the default action (typically to go back)
        event.preventDefault();

        let constraint = this._constraintAffectingAttributeInList([BMLayoutAttribute.Leading, BMLayoutAttribute.Left, BMLayoutAttribute.CenterX], {forView: view});

        if (constraint) {
            this.selectConstraint(constraint, {withReferenceView: view});
            return;
        }
        else {
            // If a leading or center constraint was not found, select the width constraint if this view has at least one trailing constraint
            const rightConstraint = this._constraintAffectingAttributeInList([BMLayoutAttribute.Trailing, BMLayoutAttribute.Right], {forView: view});
            if (rightConstraint) {
                constraint = this._constraintAffectingAttributeInList([BMLayoutAttribute.Width], {forView: view});
            }

            if (constraint) {
                this.selectConstraint(constraint, {withReferenceView: view});
                return;
            }
        }

        // NOTE: This section of code is duplicated between the four similar selection methods with small changes. Consider looking into consolidating them into a single separate method

        // Otherwise find an appropriate view to create a leading constraint to. 
        let closestHorizontalView;
        let closestVerticalView;
        for (const subview of this._view.allSubviews) {
            if (subview == view) continue;

            // Ignore ancestors of this view
            if (view.isDescendantOfView(subview)) continue;

            // In a first instance, find a view that is relatively close to this view horizontally
            // and attempt to create a horizontal spacing constraint to it. The views must "intersect" vertically in order to be considered
            if (!(subview.frame.top > view.frame.bottom || subview.frame.bottom < view.frame.top)) {
                const distance = view.frame.origin.x - subview.frame.right;

                if (distance >= 0) {
                    if (!closestHorizontalView) {
                        closestHorizontalView = subview;
                    }
                    else if (distance < (view.frame.origin.x - closestHorizontalView.frame.right)) {
                        closestHorizontalView = subview;
                    }
                }
            }

            // Then find views that have approximately the same leading position as this view
            {
                const distance = Math.abs(view.frame.origin.x - subview.frame.origin.x);

                if (distance < BM_LAYOUT_EDITOR_AUTO_CONSTRAINT_MARGIN) {
                    if (!closestVerticalView) {
                        closestVerticalView = subview;
                    }
                    else {
                        const minDistance = Math.min(Math.abs(view.frame.origin.y - subview.frame.bottom), Math.abs(view.frame.bottom - subview.frame.origin.y));
                        const currentMinDistance = Math.min(Math.abs(view.frame.origin.y - closestVerticalView.frame.bottom), Math.abs(view.frame.bottom - closestVerticalView.frame.origin.y));
    
                        if (minDistance < currentMinDistance) {
                            closestVerticalView = subview;
                        }
                    }
                }
            }
        }

        // Determine which type of constraint to select. Prioritize the horizontal spacing whenever possible.
        if (closestHorizontalView) {
            const distance = view.frame.origin.x - closestHorizontalView.frame.right;

            if (distance <= BM_LAYOUT_EDITOR_AUTO_CONSTRAINT_SPACING && closestHorizontalView.superview == view.superview) {
                return this.addConstraint(BMLayoutConstraint.constraintWithView(view, {attribute: BMLayoutAttribute.Leading, toView: closestHorizontalView, secondAttribute: BMLayoutAttribute.Trailing, constant: distance}));
            }
        }

        // Otherwise find the closest view and create a constraint to it.
        const distanceToSuperview = view.frame.origin.x - view.superview.frame.origin.x;
        const distanceToHorizontalView = closestHorizontalView ? view.frame.origin.x - closestHorizontalView.frame.right : Number.MAX_SAFE_INTEGER;
        const distanceToVerticalView = closestVerticalView ? Math.min(Math.abs(view.frame.origin.y - closestVerticalView.frame.bottom), Math.abs(view.frame.bottom - closestVerticalView.frame.origin.y)) : Number.MAX_SAFE_INTEGER;

        if (distanceToHorizontalView < distanceToSuperview && distanceToHorizontalView < distanceToVerticalView) {
            return this.addConstraint(BMLayoutConstraint.constraintWithView(view, {attribute: BMLayoutAttribute.Leading, toView: closestHorizontalView, secondAttribute: BMLayoutAttribute.Trailing, constant: distanceToHorizontalView}));
        }
        if (distanceToVerticalView < distanceToHorizontalView && distanceToVerticalView < distanceToSuperview) {
            return this.addConstraint(BMLayoutConstraint.constraintWithView(view, {attribute: BMLayoutAttribute.Leading, toView: closestVerticalView, secondAttribute: BMLayoutAttribute.Leading, constant: view.frame.origin.x - closestVerticalView.frame.origin.x}));
        }
        else {
            return this.addConstraint(BMLayoutConstraint.constraintWithView(view, {attribute: BMLayoutAttribute.Leading, toView: view.superview, secondAttribute: BMLayoutAttribute.Leading, constant: distanceToSuperview}));
        }

    },

    /**
     * If a view or constraint is selected, this method will select the view's first active top, centerY, or height constraint,
     * depending on which is available.
     * 
     * If no view or constraint is selected, this method will have no effect.
     * @param event <KeyboardEvent>             The event that triggered this action.
     */
    selectTopConstraintWithEvent(event) {
        const view = this.selectedView || this.selectedConstraintReferenceView;

        if (!view) return;

        // Don't process this keyboard shortcuts if it originates from an input element
        if (event.target.tagName == 'INPUT') return;
        event.preventDefault();

        let constraint = this._constraintAffectingAttributeInList([BMLayoutAttribute.Top, BMLayoutAttribute.CenterY], {forView: view});

        if (constraint) {
            this.selectConstraint(constraint, {withReferenceView: view});
            return;
        }
        else {
            // If a leading or center constraint was not found, select the width constraint if this view has at least one trailing constraint
            const bottomConstraint = this._constraintAffectingAttributeInList([BMLayoutAttribute.Bottom], {forView: view});
            if (bottomConstraint) {
                constraint = this._constraintAffectingAttributeInList([BMLayoutAttribute.Height], {forView: view});
            }

            if (constraint) {
                this.selectConstraint(constraint, {withReferenceView: view});
                return;
            }
        }


        // Otherwise find an appropriate view to create a leading constraint to. 
        let closestVerticalView;
        let closestHorizontalView;
        for (const subview of this._view.allSubviews) {
            if (subview == view) continue;

            // Ignore ancestors of this view
            if (view.isDescendantOfView(subview)) continue;

            // In a first instance, find a view that is relatively close to this view horizontally
            // and attempt to create a horizontal spacing constraint to it. The views must "intersect" vertically in order to be considered
            if (!(subview.frame.left > view.frame.right || subview.frame.right < view.frame.left)) {
                const distance = view.frame.origin.y - subview.frame.bottom;

                if (distance >= 0) {
                    if (!closestVerticalView) {
                        closestVerticalView = subview;
                    }
                    else if (distance < (view.frame.origin.y - closestVerticalView.frame.bottom)) {
                        closestVerticalView = subview;
                    }
                }
            }

            // Then find views that have approximately the same leading position as this view
            {
                const distance = Math.abs(view.frame.origin.y - subview.frame.origin.y);

                if (distance < BM_LAYOUT_EDITOR_AUTO_CONSTRAINT_MARGIN) {
                    if (!closestHorizontalView) {
                        closestHorizontalView = subview;
                    }
                    else {
                        const minDistance = Math.min(Math.abs(view.frame.origin.x - subview.frame.right), Math.abs(view.frame.right - subview.frame.origin.x));
                        const currentMinDistance = Math.min(Math.abs(view.frame.origin.x - closestHorizontalView.frame.right), Math.abs(view.frame.right - closestHorizontalView.frame.origin.x));
    
                        if (minDistance < currentMinDistance) {
                            closestHorizontalView = subview;
                        }
                    }
                }
            }
        }

        // Determine which type of constraint to select. Prioritize the horizontal spacing whenever possible.
        if (closestVerticalView) {
            const distance = view.frame.origin.y - closestVerticalView.frame.bottom;

            if (distance <= BM_LAYOUT_EDITOR_AUTO_CONSTRAINT_SPACING && closestVerticalView.superview == view.superview) {
                return this.addConstraint(BMLayoutConstraint.constraintWithView(view, {attribute: BMLayoutAttribute.Top, toView: closestVerticalView, secondAttribute: BMLayoutAttribute.Bottom, constant: distance}));
            }
        }

        // Otherwise find the closest view and create a constraint to it.
        const distanceToSuperview = view.frame.origin.y - view.superview.frame.origin.y;
        const distanceToHorizontalView = closestVerticalView ? view.frame.origin.y - closestVerticalView.frame.bottom : Number.MAX_SAFE_INTEGER;
        const distanceToVerticalView = closestHorizontalView ? Math.min(Math.abs(view.frame.origin.x - closestHorizontalView.frame.right), Math.abs(view.frame.right - closestHorizontalView.frame.origin.x)) : Number.MAX_SAFE_INTEGER;

        if (distanceToHorizontalView < distanceToSuperview && distanceToHorizontalView < distanceToVerticalView) {
            return this.addConstraint(BMLayoutConstraint.constraintWithView(view, {attribute: BMLayoutAttribute.Top, toView: closestVerticalView, secondAttribute: BMLayoutAttribute.Bottom, constant: distanceToHorizontalView}));
        }
        if (distanceToVerticalView < distanceToHorizontalView && distanceToVerticalView < distanceToSuperview) {
            return this.addConstraint(BMLayoutConstraint.constraintWithView(view, {attribute: BMLayoutAttribute.Top, toView: closestHorizontalView, secondAttribute: BMLayoutAttribute.Top, constant: view.frame.origin.y - closestHorizontalView.frame.origin.y}));
        }
        else {
            return this.addConstraint(BMLayoutConstraint.constraintWithView(view, {attribute: BMLayoutAttribute.Top, toView: view.superview, secondAttribute: BMLayoutAttribute.Top, constant: distanceToSuperview}));
        }
    },

    /**
     * If a view or constraint is selected, this method will select the view's first active trailing, right, width or centerX constraint,
     * depending on which is available.
     * 
     * If no view or constraint is selected, this method will have no effect.
     * @param event <KeyboardEvent>             The event that triggered this action.
     */
    selectRightConstraintWithEvent(event) {
        const view = this.selectedView || this.selectedConstraintReferenceView;

        if (!view) return;

        // Don't process this keyboard shortcuts if it originates from an input element
        if (event.target.tagName == 'INPUT') return;
        // Prevent the default action (typically to go forward)
        event.preventDefault();

        const constraint = this._constraintAffectingAttributeInList([BMLayoutAttribute.Trailing, BMLayoutAttribute.Right, BMLayoutAttribute.Width, BMLayoutAttribute.CenterX], {forView: view});

        if (constraint) {
            this.selectConstraint(constraint, {withReferenceView: view});
            return;
        }
        

        // Otherwise find an appropriate view to create a leading constraint to. 
        let closestHorizontalView;
        let closestVerticalView;
        for (const subview of this._view.allSubviews) {
            if (subview == view) continue;

            // Ignore ancestors of this view
            if (view.isDescendantOfView(subview)) continue;

            // In a first instance, find a view that is relatively close to this view horizontally
            // and attempt to create a horizontal spacing constraint to it. The views must "intersect" vertically in order to be considered
            if (!(subview.frame.top > view.frame.bottom || subview.frame.bottom < view.frame.top)) {
                const distance = subview.frame.origin.x - view.frame.right;

                if (distance >= 0) {
                    if (!closestHorizontalView) {
                        closestHorizontalView = subview;
                    }
                    else if (distance < (closestVerticalView.frame.origin.x - view.frame.right)) {
                        closestHorizontalView = subview;
                    }
                }
            }

            // Then find views that have approximately the same leading position as this view
            {
                const distance = Math.abs(view.frame.right - subview.frame.right);

                if (distance < BM_LAYOUT_EDITOR_AUTO_CONSTRAINT_MARGIN) {
                    if (!closestVerticalView) {
                        closestVerticalView = subview;
                    }
                    else {
                        const minDistance = Math.min(Math.abs(view.frame.origin.y - subview.frame.bottom), Math.abs(view.frame.bottom - subview.frame.origin.y));
                        const currentMinDistance = Math.min(Math.abs(view.frame.origin.y - closestVerticalView.frame.bottom), Math.abs(view.frame.bottom - closestVerticalView.frame.origin.y));
    
                        if (minDistance < currentMinDistance) {
                            closestVerticalView = subview;
                        }
                    }
                }
            }
        }

        // Determine which type of constraint to select. Prioritize the horizontal spacing whenever possible.
        if (closestHorizontalView) {
            const distance = closestHorizontalView.frame.origin.x - view.frame.right;

            if (distance <= BM_LAYOUT_EDITOR_AUTO_CONSTRAINT_SPACING && closestHorizontalView.superview == view.superview) {
                return this.addConstraint(BMLayoutConstraint.constraintWithView(view, {attribute: BMLayoutAttribute.Trailing, toView: closestHorizontalView, secondAttribute: BMLayoutAttribute.Trailing, constant: -distance}));
            }
        }

        // Otherwise find the closest view and create a constraint to it.
        const distanceToSuperview = view.superview.frame.right - view.frame.right;
        const distanceToHorizontalView = closestHorizontalView ? closestHorizontalView.frame.origin.x - view.frame.right : Number.MAX_SAFE_INTEGER;
        const distanceToVerticalView = closestVerticalView ? Math.min(Math.abs(view.frame.origin.y - closestVerticalView.frame.bottom), Math.abs(view.frame.bottom - closestVerticalView.frame.origin.y)) : Number.MAX_SAFE_INTEGER;

        if (distanceToHorizontalView < distanceToSuperview && distanceToHorizontalView < distanceToVerticalView) {
            return this.addConstraint(BMLayoutConstraint.constraintWithView(view, {attribute: BMLayoutAttribute.Trailing, toView: closestHorizontalView, secondAttribute: BMLayoutAttribute.Leading, constant: -distanceToHorizontalView}));
        }
        if (distanceToVerticalView < distanceToHorizontalView && distanceToVerticalView < distanceToSuperview) {
            return this.addConstraint(BMLayoutConstraint.constraintWithView(view, {attribute: BMLayoutAttribute.Trailing, toView: closestVerticalView, secondAttribute: BMLayoutAttribute.Trailing, constant: view.frame.right - closestVerticalView.frame.right}));
        }
        else {
            return this.addConstraint(BMLayoutConstraint.constraintWithView(view, {attribute: BMLayoutAttribute.Trailing, toView: view.superview, secondAttribute: BMLayoutAttribute.Trailing, constant: -distanceToSuperview}));
        }
    },

    /**
     * If a view or constraint is selected, this method will select the view's first active bottom, height or centerY constraint,
     * depending on which is available.
     * 
     * If no view or constraint is selected, this method will have no effect.
     * @param event <KeyboardEvent>             The event that triggered this action.
     */
    selectBottomConstraintWithEvent(event) {
        const view = this.selectedView || this.selectedConstraintReferenceView;

        if (!view) return;

        // Don't process this keyboard shortcuts if it originates from an input element
        if (event.target.tagName == 'INPUT') return;
        event.preventDefault();

        const constraint = this._constraintAffectingAttributeInList([BMLayoutAttribute.Bottom, BMLayoutAttribute.Height, BMLayoutAttribute.CenterY], {forView: view});

        if (constraint) {
            this.selectConstraint(constraint, {withReferenceView: view});
            return;
        }

        // Otherwise find an appropriate view to create a leading constraint to. 
        let closestVerticalView;
        let closestHorizontalView;
        for (const subview of this._view.allSubviews) {
            if (subview == view) continue;

            // Ignore ancestors of this view
            if (view.isDescendantOfView(subview)) continue;

            // In a first instance, find a view that is relatively close to this view horizontally
            // and attempt to create a horizontal spacing constraint to it. The views must "intersect" vertically in order to be considered
            if (!(subview.frame.left > view.frame.right || subview.frame.right < view.frame.left)) {
                const distance = subview.frame.origin.y - view.frame.bottom;

                if (distance >= 0) {
                    if (!closestVerticalView) {
                        closestVerticalView = subview;
                    }
                    else if (distance < (closestVerticalView.frame.origin.y - view.frame.bottom)) {
                        closestVerticalView = subview;
                    }
                }
            }

            // Then find views that have approximately the same leading position as this view
            {
                const distance = Math.abs(view.frame.bottom - subview.frame.bottom);

                if (distance < BM_LAYOUT_EDITOR_AUTO_CONSTRAINT_MARGIN) {
                    if (!closestHorizontalView) {
                        closestHorizontalView = subview;
                    }
                    else {
                        const minDistance = Math.min(Math.abs(view.frame.origin.x - subview.frame.right), Math.abs(view.frame.right - subview.frame.origin.x));
                        const currentMinDistance = Math.min(Math.abs(view.frame.origin.x - closestHorizontalView.frame.right), Math.abs(view.frame.right - closestHorizontalView.frame.origin.x));
    
                        if (minDistance < currentMinDistance) {
                            closestHorizontalView = subview;
                        }
                    }
                }
            }
        }

        // Determine which type of constraint to select. Prioritize the horizontal spacing whenever possible.
        if (closestVerticalView) {
            const distance = closestVerticalView.frame.origin.y - view.frame.bottom;

            if (distance <= BM_LAYOUT_EDITOR_AUTO_CONSTRAINT_SPACING && closestVerticalView.superview == view.superview) {
                return this.addConstraint(BMLayoutConstraint.constraintWithView(view, {attribute: BMLayoutAttribute.Bottom, toView: closestVerticalView, secondAttribute: BMLayoutAttribute.Top, constant: -distance}));
            }
        }

        // Otherwise find the closest view and create a constraint to it.
        const distanceToSuperview = view.superview.frame.bottom - view.frame.bottom;
        const distanceToHorizontalView = closestVerticalView ? closestVerticalView.frame.origin.y - view.frame.bottom : Number.MAX_SAFE_INTEGER;
        const distanceToVerticalView = closestHorizontalView ? Math.min(Math.abs(view.frame.origin.x - closestHorizontalView.frame.right), Math.abs(view.frame.right - closestHorizontalView.frame.origin.x)) : Number.MAX_SAFE_INTEGER;

        if (distanceToHorizontalView < distanceToSuperview && distanceToHorizontalView < distanceToVerticalView) {
            return this.addConstraint(BMLayoutConstraint.constraintWithView(view, {attribute: BMLayoutAttribute.Bottom, toView: closestVerticalView, secondAttribute: BMLayoutAttribute.Top, constant: -distanceToHorizontalView}));
        }
        if (distanceToVerticalView < distanceToHorizontalView && distanceToVerticalView < distanceToSuperview) {
            return this.addConstraint(BMLayoutConstraint.constraintWithView(view, {attribute: BMLayoutAttribute.Bottom, toView: closestHorizontalView, secondAttribute: BMLayoutAttribute.Bottom, constant: closestHorizontalView.frame.bottom - view.frame.bottom}));
        }
        else {
            return this.addConstraint(BMLayoutConstraint.constraintWithView(view, {attribute: BMLayoutAttribute.Bottom, toView: view.superview, secondAttribute: BMLayoutAttribute.Bottom, constant: -distanceToSuperview}));
        }
    },

    /**
     * Invoked internally to clear the offset states.
     */
    _clearOffsets() {
        this._leftOffset = -1;
        this._rightOffset = -1;
        this._centerXOffset = -1;
        this._widthOffset = -1;
        this._heightOffset = -1;
        this._topOffset = -1;
        this._bottomOffset = -1;
        this._centerYOffset = -1;
    },

    /**
     * Draws the given constraint.
     * @param constraint <BMLayoutConstraint>                   The constraint to draw.
     * {
     *  @param withReferenceView <BMView>                       The view to which the constraint refers.
     *  @param sourceConstraint <BMLayoutConstraint, nullable>  Should be set if this constraint is a subsection
     *                                                          of a constraint collection. Represents the constraint
     *                                                          collection that generated this constraint.
     * } 
     */
    _drawConstraint(constraint, args) {

        let sourceConstraint = args.sourceConstraint;

        if (constraint.isConstraintCollection) {
            return constraint.constituentConstraints.map(subConstraint => this._drawConstraint(subConstraint, {withReferenceView: subConstraint._sourceView, sourceConstraint: constraint}));
        }

        // Do not draw static constraints
        if (!constraint._targetView) return;

        // Do not draw hidden constraints
        if (!constraint._configuration.isActive) return;

        var offset;

        // The reference coordinates are the coordinates of the root view
        let referenceCoordinates = BMRectMakeWithNodeFrame(this._view.node);
        if (this.scale != 1) {
            // Because BMRectMakeWithNodeFrame takes transforms into account, it is necessary to apply the inverse scale when a scale is used
            referenceCoordinates = referenceCoordinates.rectByMultiplyingWithScalar(1 / this.scale);
        }
        let referenceView = args.withReferenceView;

        // Determine which of the constraint's view members is the reference view
        let targetView;
        let referenceViewAttribute;
        let targetViewAttribute;
        if (constraint._sourceView == referenceView) {
            targetView = constraint._targetView;
            referenceViewAttribute = '_sourceViewAttribute';
            targetViewAttribute = '_targetViewAttribute';
        }
        else {
            targetView = constraint._sourceView;
            referenceViewAttribute = '_targetViewAttribute';
            targetViewAttribute = '_sourceViewAttribute';
        }

        if (constraint._kind == BMLayoutConstraintKind.Horizontal) {

            let sourceCoordinates = BMRectMakeWithNodeFrame(referenceView.node);
            let targetCoordinates = BMRectMakeWithNodeFrame(targetView.node);
            if (this.scale != 1) {
                // Because BMRectMakeWithNodeFrame takes transforms into account, it is necessary to apply the inverse scale when a scale is used
                sourceCoordinates = sourceCoordinates.rectByMultiplyingWithScalar(1 / this.scale);
                targetCoordinates = targetCoordinates.rectByMultiplyingWithScalar(1 / this.scale);
            }

            let sourcePoint = BMPointMake(0, 0);
            let targetPoint = BMPointMake(0, targetCoordinates.center.y - referenceCoordinates.origin.y);

            switch (constraint[referenceViewAttribute]) {
                case BMLayoutAttribute.Left:
                case BMLayoutAttribute.Leading:
                    sourcePoint.x = (sourceCoordinates.origin.x - referenceCoordinates.origin.x);
                    offset = ++this._leftOffset;
                    break;
                case BMLayoutAttribute.CenterX:
                    sourcePoint.x = (sourceCoordinates.center.x - referenceCoordinates.origin.x);
                    offset = ++this._centerXOffset;
                    break;
                case BMLayoutAttribute.Right:
                case BMLayoutAttribute.Trailing:
                    sourcePoint.x = (sourceCoordinates.right - referenceCoordinates.origin.x);
                    offset = ++this._rightOffset;
                    break;
                case BMLayoutAttribute.Width:
                    offset = ++this._widthOffset;
                    sourcePoint.y = sourceCoordinates.bottom - 12 - offset * 8 - referenceCoordinates.origin.y;
                    targetPoint.y = sourcePoint.y;
                    sourcePoint.x = (sourceCoordinates.origin.x - referenceCoordinates.origin.x);
                    targetPoint.x = (sourceCoordinates.right - referenceCoordinates.origin.x);
                    this._drawHorizontalConstraint(constraint, {fromSourcePoint: sourcePoint, toPoint: targetPoint, withReferenceView: referenceView, sourceConstraint: sourceConstraint});
            }

            const sourcePointOrigin = Math.max(sourceCoordinates.origin.y, targetCoordinates.origin.y);
            sourcePoint.y = BMNumberByConstrainingNumberToBounds(sourcePointOrigin + (Math.min(sourceCoordinates.bottom, targetCoordinates.bottom) - sourcePointOrigin) / 2 | 0, sourceCoordinates.origin.y + 2, sourceCoordinates.bottom - 2) - referenceCoordinates.origin.y;//sourceCoordinates.center.y + offset * 8 - referenceCoordinates.origin.y;

            switch (constraint[targetViewAttribute]) {
                case BMLayoutAttribute.Left:
                case BMLayoutAttribute.Leading:
                    targetPoint.x = (targetCoordinates.origin.x - referenceCoordinates.origin.x);
                    break;
                case BMLayoutAttribute.CenterX:
                    targetPoint.x = (targetCoordinates.center.x - referenceCoordinates.origin.x);
                    break;
                case BMLayoutAttribute.Right:
                case BMLayoutAttribute.Trailing:
                    targetPoint.x = (targetCoordinates.right - referenceCoordinates.origin.x);
                    break;
                case BMLayoutAttribute.Width:
                    sourcePoint.y = targetCoordinates.bottom - 12 - offset * 8 - referenceCoordinates.origin.y;
                    targetPoint.y = sourcePoint.y;
                    sourcePoint.x = (targetCoordinates.origin.x - referenceCoordinates.origin.x);
                    targetPoint.x = (targetCoordinates.right - referenceCoordinates.origin.x);
                    this._drawHorizontalConstraint(constraint, {fromSourcePoint: sourcePoint, toPoint: targetPoint, withReferenceView: referenceView, sourceConstraint: sourceConstraint});
                    return;
            }

            targetPoint.y = BMNumberByConstrainingNumberToBounds(sourcePointOrigin + (Math.min(sourceCoordinates.bottom, targetCoordinates.bottom) - sourcePointOrigin) / 2 | 0, targetCoordinates.origin.y + 2, targetCoordinates.bottom - 2) - referenceCoordinates.origin.y;

            return this._drawHorizontalConstraint(constraint, {fromSourcePoint: sourcePoint, toPoint: targetPoint, withReferenceView: referenceView, sourceConstraint: sourceConstraint});

        }
        else {
            let sourceCoordinates = BMRectMakeWithNodeFrame(referenceView.node);
            let targetCoordinates = BMRectMakeWithNodeFrame(targetView.node);
            if (this.scale != 1) {
                // Because BMRectMakeWithNodeFrame takes transforms into account, it is necessary to apply the inverse scale when a scale is used
                sourceCoordinates = sourceCoordinates.rectByMultiplyingWithScalar(1 / this.scale);
                targetCoordinates = targetCoordinates.rectByMultiplyingWithScalar(1 / this.scale);
            }

            let sourcePoint = BMPointMake(0, 0);
            let targetPoint = BMPointMake(targetCoordinates.center.x - referenceCoordinates.origin.x, 0);

            switch (constraint[referenceViewAttribute]) {
                case BMLayoutAttribute.Top:
                    sourcePoint.y = (sourceCoordinates.origin.y - referenceCoordinates.origin.y);
                    offset = ++this._topOffset;
                    break;
                case BMLayoutAttribute.CenterY:
                    sourcePoint.y = (sourceCoordinates.center.y - referenceCoordinates.origin.y);
                    offset = ++this._centerYOffset;
                    break;
                case BMLayoutAttribute.Bottom:
                    sourcePoint.y = (sourceCoordinates.bottom - referenceCoordinates.origin.y);
                    offset = ++this._bottomOffset;
                    break;
                case BMLayoutAttribute.Height:
                    offset = ++this._heightOffset;
                    sourcePoint.x = sourceCoordinates.right - 12 - offset * 8 - referenceCoordinates.origin.x;
                    targetPoint.x = sourcePoint.x;
                    sourcePoint.y = (sourceCoordinates.origin.y - referenceCoordinates.origin.y);
                    targetPoint.y = (sourceCoordinates.bottom - referenceCoordinates.origin.y);
                    this._drawVerticalConstraint(constraint, {fromSourcePoint: sourcePoint, toPoint: targetPoint, withReferenceView: referenceView, sourceConstraint: sourceConstraint});
            }

            //sourcePoint.x = sourceCoordinates.center.x - referenceCoordinates.origin.x + offset * 8;

            const sourcePointOrigin = Math.max(sourceCoordinates.origin.x, targetCoordinates.origin.x);
            sourcePoint.x = BMNumberByConstrainingNumberToBounds(sourcePointOrigin + (Math.min(sourceCoordinates.right, targetCoordinates.right) - sourcePointOrigin) / 2 | 0, sourceCoordinates.origin.x + 2, sourceCoordinates.right - 2) - referenceCoordinates.origin.x;//sourceCoordinates.center.y + offset * 8 - referenceCoordinates.origin.y;


            switch (constraint[targetViewAttribute]) {
                case BMLayoutAttribute.Top:
                    targetPoint.y = (targetCoordinates.origin.y - referenceCoordinates.origin.y);
                    break;
                case BMLayoutAttribute.CenterY:
                    targetPoint.y = (targetCoordinates.center.y - referenceCoordinates.origin.y);
                    break;
                case BMLayoutAttribute.Bottom:
                    targetPoint.y = (targetCoordinates.bottom - referenceCoordinates.origin.y);
                    break;
                case BMLayoutAttribute.Height:
                    sourcePoint.x = targetCoordinates.right - 12 - offset * 8 - referenceCoordinates.origin.x;
                    targetPoint.x = sourcePoint.x;
                    sourcePoint.y = (targetCoordinates.origin.y - referenceCoordinates.origin.y);
                    targetPoint.y = (targetCoordinates.bottom - referenceCoordinates.origin.y);
                    this._drawVerticalConstraint(constraint, {fromSourcePoint: sourcePoint, toPoint: targetPoint, withReferenceView: referenceView, sourceConstraint: sourceConstraint});
                    return;
            }

            targetPoint.x = BMNumberByConstrainingNumberToBounds(sourcePointOrigin + (Math.min(sourceCoordinates.right, targetCoordinates.right) - sourcePointOrigin) / 2 | 0, targetCoordinates.origin.x + 2, targetCoordinates.right - 2) - referenceCoordinates.origin.x;

            return this._drawVerticalConstraint(constraint, {fromSourcePoint: sourcePoint, toPoint: targetPoint, withReferenceView: referenceView, sourceConstraint: sourceConstraint});
        }
    },

    /**
     * Invoked internally to draw the given horizontal constraint.
     * @param constraint <BMLayoutConstraint>                       The constraint.
     * {
     *  @param fromSourcePoint <BMPoint>                            The source point.
     *  @param toPoint <BMPoint>                                    The target point.
     *  @param withReferenceView <BMView>                           The reference view to which the constraint refers.
     *  @param sourceConstraint <BMLayoutConstraint, nullable>      The source constraint that created this constraint, if there is one.
     * }
     */
    _drawHorizontalConstraint(constraint, args) {
        let sourceConstraint = args.sourceConstraint;
        let sourcePoint = args.fromSourcePoint;
        let targetPoint = args.toPoint;

        let width = Math.abs(sourcePoint.x - targetPoint.x);
        let origin = Math.min(sourcePoint.x, targetPoint.x);

        let constraintView = document.createElement('div');
        constraintView.className = 'BMLayoutEditorConstraint BMLayoutEditorHorizontalConstraint';
        BMCopyProperties(constraintView.style, {
            width: width + 'px',
            height: '5px',
            left: origin + 'px',
            top: sourcePoint.y + 'px'
        });

        if (constraint._relation == BMLayoutConstraintRelation.GreaterThanOrEquals) {
            constraintView.classList.add('BMLayoutEditorConstraintGreater');
        }
        else if (constraint._relation == BMLayoutConstraintRelation.LessThanOrEquals) {
            constraintView.classList.add('BMLayoutEditorConstraintLess');
        }

        let constraintLine = document.createElement('div');
        constraintLine.className = 'BMLayoutEditorHorizontalConstraintLine';
        constraintView.appendChild(constraintLine);

        if (constraint._priority < BMLayoutConstraintPriorityRequired) {
            constraintLine.classList.add('BMLayoutEditorConstraintLineOptional');
        }

        let leadLine = document.createElement('div');
        leadLine.className = 'BMLayoutEditorLeadLine BMLayoutEditorVerticalLeadLine';
        BMCopyProperties(leadLine.style, {
            width: '1px',
            height: Math.abs(sourcePoint.y - targetPoint.y) + 'px',
            left: (targetPoint.x < sourcePoint.x ? (targetPoint.x) : (targetPoint.x - 1)) + 'px',
            top: Math.min(targetPoint.y, sourcePoint.y) + 'px'
        });
        this._view.node.appendChild(leadLine);

        this._view.node.appendChild(constraintView);

        constraintView.addEventListener('click', event => {
            this.selectConstraint(sourceConstraint || constraint, {withReferenceView: args.withReferenceView}); 

            if (BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW && !this._detailsToolWindow._visible) {
                this._showConstantPopupWithEvent(event, {forConstraint: sourceConstraint || constraint, withReferenceView: args.withReferenceView});
            }

            event.stopPropagation();
        });

        return {sourcePoint, targetPoint, kind: BMLayoutConstraintKind.Horizontal, node: constraintView, leadLine, displaced: NO};

    },

    /**
     * Invoked internally to draw the given vertical constraint.
     * @param constraint <BMLayoutConstraint>       The constraint.
     * {
     *  @param fromSourcePoint <BMPoint>                            The source point.
     *  @param toPoint <BMPoint>                                    The target point.
     *  @param withReferenceView <BMView>                           The reference view to which the constraint refers.
     *  @param sourceConstraint <BMLayoutConstraint, nullable>      The source constraint that created this constraint, if there is one.
     * }
     */
    _drawVerticalConstraint(constraint, args) {
        let sourceConstraint = args.sourceConstraint;
        let sourcePoint = args.fromSourcePoint;
        let targetPoint = args.toPoint;

        let height = Math.abs(sourcePoint.y - targetPoint.y);
        let origin = Math.min(sourcePoint.y, targetPoint.y);

        let constraintView = document.createElement('div');
        constraintView.className = 'BMLayoutEditorConstraint BMLayoutEditorVerticalConstraint';
        BMCopyProperties(constraintView.style, {
            width: '5px',
            height: height + 'px',
            left: sourcePoint.x + 'px',
            top: origin + 'px'
        });

        if (constraint._relation == BMLayoutConstraintRelation.GreaterThanOrEquals) {
            constraintView.classList.add('BMLayoutEditorConstraintGreater');
        }
        else if (constraint._relation == BMLayoutConstraintRelation.LessThanOrEquals) {
            constraintView.classList.add('BMLayoutEditorConstraintLess');
        }

        let constraintLine = document.createElement('div');
        constraintLine.className = 'BMLayoutEditorVerticalConstraintLine';
        constraintView.appendChild(constraintLine);

        if (constraint._priority < BMLayoutConstraintPriorityRequired) {
            constraintLine.classList.add('BMLayoutEditorConstraintLineOptional');
        }

        let leadLine = document.createElement('div');
        leadLine.className = 'BMLayoutEditorLeadLine BMLayoutEditorHorizontalLeadLine';
        BMCopyProperties(leadLine.style, {
            width: Math.abs(sourcePoint.x - targetPoint.x) + 'px',
            height: '1px',
            top: (targetPoint.y < sourcePoint.y ? (targetPoint.y) : (targetPoint.y - 1)) + 'px',
            left: Math.min(targetPoint.x, sourcePoint.x) + 'px'
        });
        this._view.node.appendChild(leadLine);

        this._view.node.appendChild(constraintView);

        constraintView.addEventListener('click', event => {
            this.selectConstraint(sourceConstraint || constraint, {withReferenceView: args.withReferenceView});  

            if (BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW && !this._detailsToolWindow._visible) {
                this._showConstantPopupWithEvent(event, {forConstraint: sourceConstraint || constraint, withReferenceView: args.withReferenceView});
            }

            event.stopPropagation();
        });

        return {sourcePoint, targetPoint, kind: BMLayoutConstraintKind.Vertical, node: constraintView, leadLine, displaced: NO};

    },

    // #region Deprecated settings

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Returns a badge that will be displayed next to settings that have variations
     * for the given size class.
     * @param sizeClass <BMLayoutSizeClass>         A size class.
     * @return <DOMNode>                            A `DOMNode` that represents the badge.
     */
    settingsBadgeForSizeClass(sizeClass) {
        let badge = document.createElement('div');
        switch (sizeClass) {
            case BMLayoutSizeClass.phoneSizeClass():
                badge.className = 'BMLayoutEditorDetailsItemBadgeIcon BMLayoutEditorImagePhoneMini';
                break;
            case BMLayoutSizeClass.phoneSizeClassWithOrientation(BMLayoutOrientation.Portrait):
                badge.className = 'BMLayoutEditorDetailsItemBadgeIcon BMLayoutEditorImagePhonePortraitMini';
                break;
            case BMLayoutSizeClass.phoneSizeClassWithOrientation(BMLayoutOrientation.Landscape):
                badge.className = 'BMLayoutEditorDetailsItemBadgeIcon BMLayoutEditorImagePhoneLandscapeMini';
                break;
            case BMLayoutSizeClass.tabletSizeClass():
                badge.className = 'BMLayoutEditorDetailsItemBadgeIcon BMLayoutEditorImageTabletMini';
                break;
            case BMLayoutSizeClass.tabletSizeClassWithOrientation(BMLayoutOrientation.Portrait):
                badge.className = 'BMLayoutEditorDetailsItemBadgeIcon BMLayoutEditorImageTabletPortraitMini';
                break;
            case BMLayoutSizeClass.tabletSizeClassWithOrientation(BMLayoutOrientation.Landscape):
                badge.className = 'BMLayoutEditorDetailsItemBadgeIcon BMLayoutEditorImageTabletLandscapeMini';
                break;
            default:
                badge.className = 'BMLayoutEditorDetailsItemBadge';
                badge.innerText = sizeClass._hashString;
        }

        return badge;
    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Constructs and returns the DOM node for a readonly setting.
     * @param name <String>                         The name of the setting.
     * {
     *  @param value <String>                       The readonly value to display.
     *  @param action <void ^(Event), nullable>     An optional action that will take place
     *                                              when the value is clicked.
     * }
     * @return <DOMNode>                            A DOM node.
     */
    readonlySettingWithName(name, args) {
        let item = document.createElement('div');
        item.className = 'BMLayoutEditorDetailsItem';

        let title = document.createElement('div');
        title.className = 'BMLayoutEditorDetailsItemTitle';
        title.innerText = name;
        item.appendChild(title);

        let value;
        if (args.value) {
            value = document.createElement('div');
            value.className = 'BMLayoutEditorDetailsItemReadonlyValue';
            value.innerText = args.value;
            item.appendChild(value);
        }
        else {
            title.style.width = '240px';
        }

        if (args.action) {
            value.classList.add('BMLayoutEditorDetailsItemReadonlyValueClickable');
            value.addEventListener('click', args.action);
        }

        return item;
    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Creates a list of boolean settings for the given property, depending on its active variations
     * and the currently selected size class.
     * @param name <String>                                     The name of the setting.
     * {
     *  @param forConstraint <BMLayoutConstraint, nullable>     The constraint to which the setting applies. If this is not specified,
     *                                                          the setting is assumed to apply to a property of the given view.
     *  @param withReferenceView <BMView>                       If a constraint is specified, this represents the view through which
     *                                                          the constraint's settings page was accessed. Otherwise, this represents
     *                                                          the view to which the setting applies.
     *  @param propertyName <String>                            The internal name of the property affected by this setting.
     *  @param container <DOMNode, nullable>                    Defaults to the settings pane. The DOM node into which the settings
     *                                                          will be added.
     * }
     */
    createVariableBooleanSettingWithName(name, {forConstraint: constraint, withReferenceView: view, propertyName: property, container}) {
        let content = container || this.detailsNodeContent;
        let capitalizedPropertyName = property[0].toUpperCase() + property.substring(1);

        if (constraint) {
            this.booleanSettingWithName(name, {value: constraint[property], indeterminate: NO, container: content, changeHandler: value => constraint[property] = value});
            // Create settings for the available variations
            for (let key in constraint._variations) {
                if (this._activeSizeClass && key == this._activeSizeClass._hashString) continue;
                if (property in constraint._variations[key]) {
                    this.booleanSettingWithName(name, {value: constraint._variations[key][property], indeterminate: YES, container: content, sizeClass: constraint._variations[key].sizeClass, changeHandler: (value, sizeClass) => {
                        if (value !== undefined) {
                            constraint['set' + capitalizedPropertyName](value, {forSizeClass: sizeClass});
                        }
                        else {
                            constraint['remove' + capitalizedPropertyName + 'VariationForSizeClass'](sizeClass);
                        }
                    }});
                }
            }
            // Create a setting for the currently active size class, allowing users to define new variations
            if (this._activeSizeClass) {
                let value = undefined;
                if (constraint._variations[this._activeSizeClass._hashString]) {
                    if (property in constraint._variations[this._activeSizeClass._hashString]) {
                        value = constraint._variations[this._activeSizeClass._hashString][property];
                    }
                }
                this.booleanSettingWithName(name, {value: value, indeterminate: YES, container: content, sizeClass: this._activeSizeClass, changeHandler: (value, sizeClass) => {
                    if (value !== undefined) {
                        constraint['set' + capitalizedPropertyName](value, {forSizeClass: sizeClass});
                    }
                    else {
                        constraint['remove' + capitalizedPropertyName + 'VariationForSizeClass'](sizeClass);
                    }
                }});
            }
        }
        else {
            this.booleanSettingWithName(name, {value: view[property], indeterminate: NO, container: content, changeHandler: value => view[property] = value});
            // Create settings for the available variations
            for (let key in view._variations) {
                if (this._activeSizeClass && key == this._activeSizeClass._hashString) continue;
                if (property in view._variations[key]) {
                    this.booleanSettingWithName(name, {value: view._variations[key][property], indeterminate: YES, container: content, sizeClass: view._variations[key].sizeClass, changeHandler: (value, sizeClass) => {
                        if (value !== undefined) {
                            view['set' + capitalizedPropertyName](value, {forSizeClass: sizeClass});
                        }
                        else {
                            view['remove' + capitalizedPropertyName + 'VariationForSizeClass'](sizeClass);
                        }
                    }});
                }
            }
            // Create a setting for the currently active size class, allowing users to define new variations
            if (this._activeSizeClass) {
                let value = undefined;
                if (view._variations[this._activeSizeClass._hashString]) {
                    if (property in view._variations[this._activeSizeClass._hashString]) {
                        value = view._variations[this._activeSizeClass._hashString][property];
                    }
                }
                this.booleanSettingWithName(name, {value: value, indeterminate: YES, container: content, sizeClass: this._activeSizeClass, changeHandler: (value, sizeClass) => {
                    if (value !== undefined) {
                        view['set' + capitalizedPropertyName](value, {forSizeClass: sizeClass});
                    }
                    else {
                        view['remove' + capitalizedPropertyName + 'VariationForSizeClass'](sizeClass);
                    }
                }});
            }
        }
    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Constructs and returns the DOM node for a boolean setting. This method should be used by custom settings providers
     * when creating additional settings.
     * @param name <String>                                                     The name of the setting as it will appear at runtime.
     * {
     *  @param value <Boolean>                                                  The current value.
     *  @param indeterminate <Boolean, nullable>                                Defaults to `NO`. If set to `YES`, this boolean setting is allowed to have
     *                                                                          an ideterminate state. An indeterminate state is passed to change handler
     *                                                                          as an `undefined` value.
     *  @param container <DOMNode, nullable>                                    If specified, this setting will be added to the given container.
     *  @param sizeClass <BMLayoutSizeClass, nullable>                          The size class to which this setting applies. If specified, this will be passed as a
     *                                                                          parameter to the change handler.
     *  @param changeHandler <void ^(Boolean, nullable BMLayoutSizeClass)>      A handler that is invoked when the value of the setting changes.
     * }
     * @return <DOMNode>                                                        A DOM node.
     */
    booleanSettingWithName(name, args) {
        // Create the item
        let item = document.createElement('div');
        item.className = 'BMLayoutEditorDetailsItem';

        // Create the title
        let title = document.createElement('div');
        title.className = 'BMLayoutEditorDetailsItemTitle';
        title.innerText = name;

        // Create the size class badge if one is specified
        if (args.sizeClass) {
            let badge = this.settingsBadgeForSizeClass(args.sizeClass);
            title.insertBefore(badge, title.lastChild);
        }
        
        item.appendChild(title);

        // Create the toggle
        let value = document.createElement('label');
        value.className = 'BMWindowSwitch';
        
        value.innerHTML = `<input type="checkbox" data-toggle="YES"> OFF
        <div class="BMWindowSwitchGutter">
            <div class="BMWindowSwitchKnob"></div>
        </div>
        ON`;

        item.appendChild(value);

        // Set the value
        let input = value.getElementsByTagName('input')[0];
        input.checked = args.value;

        // If the setting supports an ideterminate state, set it up
        if (args.indeterminate) {
            value.addEventListener('click', event => {
                if (event.target === input) return;
                if (input.checked) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (input.indeterminate) {
                        input.indeterminate = false;
                        input.checked = false;
                        args.changeHandler(false, args.sizeClass);
                    }
                    else {
                        input.indeterminate = true;
                        args.changeHandler(undefined, args.sizeClass);
                    }
                }
            });

            if (args.value === undefined) {
                input.indeterminate = true;
                input.checked = true;
            }
        }

        input.addEventListener('change', event => {
            let value = Boolean(event.target.checked);

            // Read-only indicates an indeterminate state, if supported
            if (args.indeterminate && input.indeterminate) {
                value = undefined;
            }

            args.changeHandler(value, args.sizeClass);
        });

        // Add the item to the container
        if (args.container) args.container.appendChild(item);

        return item;
    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Constructs and returns the DOM node for a string setting. This method should be used by custom settings providers
     * when creating additional settings.
     * @param name <String>                         The name of the setting as it will appear at runtime.
     * {
     *  @param value <String>                       The current value.
     *  @param changeHandler <Boolean ^(String)>    A handler that is invoked when the value of the setting changes.
     *                                              This handler should return `NO` to cause the value to be marked as incorrect or `YES`
     *                                              to mark the value as correct.
     * }
     * @return <DOMNode>                            A DOM node.
     */
    textSettingWithName(name, args) {
        let item = document.createElement('div');
        item.className = 'BMLayoutEditorDetailsItem';

        let title = document.createElement('div');
        title.className = 'BMLayoutEditorDetailsItemTitle';
        title.innerText = name;

        if (args.sizeClass) {
            let badge = this.settingsBadgeForSizeClass(args.sizeClass);
            title.insertBefore(badge, title.lastChild);
        }

        item.appendChild(title);

        let value = document.createElement('input');
        value.type = 'text';
        value.className = 'BMWindowInput BMLayoutEditorDetailsItemTextValue';
        value.value = args.value;
        item.appendChild(value);

        let isValidValue = true;

        value.addEventListener('input', event => {
            let text = value.value;

            let isValid = args.changeHandler(text);

            if (isValid != isValidValue) {
                isValidValue = isValid;

                if (isValid) {
                    value.classList.remove('BMWindowInputInvalid');
                }
                else {
                    value.classList.add('BMWindowInputInvalid');
                }
            }
        });

        return item;
    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Constructs and returns the DOM node for a string setting.
     * @param name <String>                                 The name of the setting.
     * {
     *  @param forConstraint <BMLayoutConstraint>           The constraint being edited.
     *  @param propertyName <String>                        The name of the constraint property being edited.
     *  @param value <String>                               The current value.
     *  @param withReferenceView <BMView>                   The reference view.
     *  @param sizeClass <BMLayoutSizeClass, nullable>      The size class to which this setting applies, if any.
     * }
     * @return <DOMNode>                                    A DOM node.
     */
    stringSettingWithName(name, args) {
        let constraint = args.forConstraint;
        let property = args.propertyName;
        let view = args.withReferenceView;
        let capitalizedPropertyName = property[0].toUpperCase() + property.substring(1);

        let item = document.createElement('div');
        item.className = 'BMLayoutEditorDetailsItem';

        let title = document.createElement('div');
        title.className = 'BMLayoutEditorDetailsItemTitle';
        title.innerText = name;

        if (args.sizeClass) {
            let badge = this.settingsBadgeForSizeClass(args.sizeClass);
            title.insertBefore(badge, title.lastChild);
        }

        item.appendChild(title);

        let value = document.createElement('input');
        value.type = 'text';
        value.className = 'BMWindowInput BMLayoutEditorDetailsItemTextValue';
        value.value = args.value;
        item.appendChild(value);

        value.addEventListener('input', event => {
            let string = value.value;

            if (!string) {
                if (args.sizeClass) {
                    if (constraint) {
                        constraint[`remove${capitalizedPropertyName}VariationForSizeClass`](args.sizeClass);
                        constraint._updateConfiguration();
                    }
                    else {
                        view[`remove${capitalizedPropertyName}VariationForSizeClass`](args.sizeClass);
                        view._updateConfiguration();
                    }
                }
                return;
            }

            if (constraint) {

                if (args.sizeClass) {
                    constraint[`set${capitalizedPropertyName}`](string, {forSizeClass: args.sizeClass});
                }
                else {
                    constraint[property] = string;
                }
                constraint._updateConfiguration();
                constraint._constraint = undefined;
                constraint._constituentConstraints = undefined;
                if (constraint._sourceView) {
                    constraint._sourceView.needsLayout = YES;
                }
                else {
                    constraint._views[0].needsLayout = YES;
                }
            }
            else {
                if (args.sizeClass) {
                    view[`set${capitalizedPropertyName}`](string, {forSizeClass: args.sizeClass});
                }
                else {
                    view[property] = string;
                }
                view.needsLayout = YES;
            }
        });

        return item;
    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Creates a list of string settings for the given property, depending on its active variations
     * and the currently selected size class.
     * @param name <String>                                     The name of the setting.
     * {
     *  @param forConstraint <BMLayoutConstraint, nullable>     The constraint to which the setting applies. If this is not specified,
     *                                                          the setting is assumed to apply to a property of the given view.
     *  @param withReferenceView <BMView>                       If a constraint is specified, this represents the view through which
     *                                                          the constraint's settings page was accessed. Otherwise, this represents
     *                                                          the view to which the setting applies.
     *  @param propertyName <String>                            The internal name of the property affected by this setting.
     *  @param container <DOMNode, nullable>                    Defaults to the settings pane. The DOM node into which the settings
     *                                                          will be added.
     * }
     */
    createVariableStringSettingWithName(name, {forConstraint: constraint, withReferenceView: view, propertyName: property, container}) {
        let content = container || this.detailsNodeContent;

        if (constraint) {
            content.appendChild(this.stringSettingWithName(name, {value: constraint[property], forConstraint: constraint, propertyName: property, withReferenceView: view}));
            // Create settings for the available variations
            for (let key in constraint._variations) {
                if (this._activeSizeClass && key == this._activeSizeClass._hashString) continue;
                if (property in constraint._variations[key]) {
                    content.appendChild(this.stringSettingWithName(name, {value: constraint._variations[key][property], forConstraint: constraint, propertyName: property, withReferenceView: view, sizeClass: constraint._variations[key].sizeClass}));
                }
            }
            // Create a setting for the currently active size class, allowing users to define new variations
            if (this._activeSizeClass) {
                let value = '';
                if (constraint._variations[this._activeSizeClass._hashString]) {
                    if (property in constraint._variations[this._activeSizeClass._hashString]) {
                        value = constraint._variations[this._activeSizeClass._hashString][property];
                    }
                }
                content.appendChild(this.stringSettingWithName(name, {value: value, forConstraint: constraint, propertyName: property, withReferenceView: view, sizeClass: this._activeSizeClass}));
            }
        }
        else {
            content.appendChild(this.stringSettingWithName(name, {value: view[property], propertyName: property, withReferenceView: view}));
            // Create settings for the available variations
            for (let key in view._variations) {
                if (this._activeSizeClass && key == this._activeSizeClass._hashString) continue;
                if (property in view._variations[key]) {
                    content.appendChild(this.stringSettingWithName(name, {value: view._variations[key][property], propertyName: property, withReferenceView: view, sizeClass: view._variations[key].sizeClass}));
                }
            }
            // Create a setting for the currently active size class, allowing users to define new variations
            if (this._activeSizeClass) {
                let value = '';
                if (view._variations[this._activeSizeClass._hashString]) {
                    if (property in view._variations[this._activeSizeClass._hashString]) {
                        value = view._variations[this._activeSizeClass._hashString][property];
                    }
                }
                content.appendChild(this.stringSettingWithName(name, {value: value, propertyName: property, withReferenceView: view, sizeClass: this._activeSizeClass}));
            }
        }
    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Creates a list of numeric settings for the given property, depending on its active variations
     * and the currently selected size class.
     * @param name <String>                                     The name of the setting.
     * {
     *  @param forConstraint <BMLayoutConstraint, nullable>     The constraint to which the setting applies. If this is not specified,
     *                                                          the setting is assumed to apply to a property of the given view.
     *  @param withReferenceView <BMView>                       If a constraint is specified, this represents the view through which
     *                                                          the constraint's settings page was accessed. Otherwise, this represents
     *                                                          the view to which the setting applies.
     *  @param propertyName <String>                            The internal name of the property affected by this setting.
     *  @param container <DOMNode, nullable>                    Defaults to the settings pane. The DOM node into which the settings
     *                                                          will be added.
     * }
     */
    createVariableNumericSettingWithName(name, {forConstraint: constraint, withReferenceView: view, propertyName: property, container}) {
        let content = container || this.detailsNodeContent;

        if (constraint) {
            content.appendChild(this.numericSettingWithName(name, {value: constraint[property], forConstraint: constraint, propertyName: property, withReferenceView: view}));
            // Create settings for the available variations
            for (let key in constraint._variations) {
                if (this._activeSizeClass && key == this._activeSizeClass._hashString) continue;
                if (property in constraint._variations[key]) {
                    content.appendChild(this.numericSettingWithName(name, {value: constraint._variations[key][property], forConstraint: constraint, propertyName: property, withReferenceView: view, sizeClass: constraint._variations[key].sizeClass}));
                }
            }
            // Create a setting for the currently active size class, allowing users to define new variations
            if (this._activeSizeClass) {
                let value = '';
                if (constraint._variations[this._activeSizeClass._hashString]) {
                    if (property in constraint._variations[this._activeSizeClass._hashString]) {
                        value = constraint._variations[this._activeSizeClass._hashString][property];
                    }
                }
                content.appendChild(this.numericSettingWithName(name, {value: value, forConstraint: constraint, propertyName: property, withReferenceView: view, sizeClass: this._activeSizeClass}));
            }
        }
        else {
            content.appendChild(this.numericSettingWithName(name, {value: view[property], propertyName: property, withReferenceView: view}));
            // Create settings for the available variations
            for (let key in view._variations) {
                if (this._activeSizeClass && key == this._activeSizeClass._hashString) continue;
                if (property in view._variations[key]) {
                    content.appendChild(this.numericSettingWithName(name, {value: view._variations[key][property], propertyName: property, withReferenceView: view, sizeClass: view._variations[key].sizeClass}));
                }
            }
            // Create a setting for the currently active size class, allowing users to define new variations
            if (this._activeSizeClass) {
                let value = '';
                if (view._variations[this._activeSizeClass._hashString]) {
                    if (property in view._variations[this._activeSizeClass._hashString]) {
                        value = view._variations[this._activeSizeClass._hashString][property];
                    }
                }
                content.appendChild(this.numericSettingWithName(name, {value: value, propertyName: property, withReferenceView: view, sizeClass: this._activeSizeClass}));
            }
        }
    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Constructs and returns the DOM node for a constant setting.
     * @param name <String>                                 The name of the setting.
     * {
     *  @param forConstraint <BMLayoutConstraint>           The constraint being edited.
     *  @param propertyName <String>                        The name of the constraint property being edited.
     *  @param value <String>                               The current value.
     *  @param withReferenceView <BMView>                   The reference view.
     *  @param sizeClass <BMLayoutSizeClass, nullable>      The size class to which this setting applies, if any.
     * }
     * @return <DOMNode>                                    A DOM node.
     */
    constantSettingWithName(name, args) {
        let constraint = args.forConstraint;
        let property = args.propertyName;
        let view = args.withReferenceView;
        let capitalizedPropertyName = property[0].toUpperCase() + property.substring(1);

        let item = document.createElement('div');
        item.className = 'BMLayoutEditorDetailsItem';

        let title = document.createElement('div');
        title.className = 'BMLayoutEditorDetailsItemTitle';
        title.innerText = name;

        if (args.sizeClass) {
            let badge = this.settingsBadgeForSizeClass(args.sizeClass);
            title.insertBefore(badge, title.lastChild);
        }

        item.appendChild(title);

        let value = document.createElement('input');
        value.type = 'text';
        value.className = 'BMWindowInput BMLayoutEditorDetailsItemNumericValue';
        value.value = args.value;
        item.appendChild(value);

        let suggestions = [];
        let filteredSuggestions = [];
        let menu;
        let highlightedItemIndex;

        // TODO: Consider encapsulating this functionality into a separate auto-complete text box class
        value.addEventListener('focus', async event => {
            // Select all content upon receiving focus
            value.select();

            suggestions = [];
            // Load up the variable names
            const variables = Object.keys(this.layoutVariableProvider.layoutVariables);
            const uniqueNames = new Set;
            variables.forEach(variable => uniqueNames.add(variable));

            let options = [];

            // Create a pair of regular and minus-prefixed variable names
            for (const variable of uniqueNames) {
                suggestions.unshift(variable);
                suggestions.push('-' + variable);
            }

            filteredSuggestions = suggestions;
            highlightedItemIndex = -1;

            for (const option of suggestions) {
                options.push(this.constraintOptionWithLabel(option, {action: () => {
                    menu = undefined;
                    value.value = option;
                    value.dispatchEvent(new Event('input'));

                    // Remove focus from the text box upon selecting a value
                    value.blur();
                }}));
            }

            // Create and show a pulldown menu below the constant textbox, if there are any suggestions
            if (suggestions.length) {
                let frame = BMRectMakeWithNodeFrame(value);
                let point = BMPointMake(frame.origin.x, frame.bottom);
                menu = this.showMenuAtPoint(point, {withOptions: options, kind: BMMenuKind.PullDownMenu});
                menu.classList.add('BMLayoutEditorConstantSuggestions');

                menu.parentNode.classList.add('BMLayoutEditorConstantSuggestionsOverlay');

                // Prevent the menu from stealing focus, which would dismiss it before an option is selected
                menu.addEventListener('mousedown', e => e.preventDefault(), YES);
            }

            const fn = event => event.preventDefault();
            value.addEventListener('mouseup', fn);
            await new Promise(resolve => setTimeout(resolve, 200));
            value.removeEventListener('mouseup', fn);
            
        });

        value.addEventListener('keydown', event => {
            if (event.code == 'ArrowDown' || event.code == 'ArrowUp') {
                event.preventDefault();
                if (filteredSuggestions.length == 0) return;

                // Move the selection accordingly
                if (event.code == 'ArrowUp') {
                    highlightedItemIndex = Math.max((highlightedItemIndex || 0) - 1, 0);
                }
                else {
                    highlightedItemIndex = Math.min((isNaN(highlightedItemIndex) ? -1 : highlightedItemIndex) + 1, filteredSuggestions.length - 1);
                }

                // Remove the highlighted class from the previously selected item
                for (const element of menu.querySelectorAll('.BMLayoutEditorConstraintPopupOptionHighlighted')) {
                    element.classList.remove('BMLayoutEditorConstraintPopupOptionHighlighted');
                }

                // Highlight the current item
                menu.childNodes[highlightedItemIndex].classList.add('BMLayoutEditorConstraintPopupOptionHighlighted');
            }

            if (event.code == 'Enter') {
                // Upon pressing the enter key, select the currently highlighted item, if available
                // then remove focus from the constant box
                if (!isNaN(highlightedItemIndex) && filteredSuggestions.length) {
                    value.value = filteredSuggestions[highlightedItemIndex];
                    value.dispatchEvent(new Event('input'));
                }

                value.blur();
            }
        });

        value.addEventListener('input', event => {
            const number = parseFloat(value.value);
            const constantValue = isNaN(number) ? value.value : number;

            if (menu) {
                // If the menu is visible, filter it accordingly
                filteredSuggestions = suggestions.filter(e => e.toLowerCase().startsWith(value.value.toLowerCase()));
                
                // Empty the menu
                menu.innerHTML = '';

                // Reset the highlighted item index
                highlightedItemIndex = 0;

                // Then add the filtered options
                for (const option of filteredSuggestions) {
                    menu.appendChild(this.constraintOptionWithLabel(option, {action: () => {
                        menu = undefined;
                        value.value = option;
                        value.dispatchEvent(new Event('input'));
                    }}));
                }

                // Highlight the first item
                if (filteredSuggestions.length) {
                    menu.childNodes[0].classList.add('BMLayoutEditorConstraintPopupOptionHighlighted');
                    menu.style.display = 'block';
                }
                else {
                    menu.style.display = 'none';
                }
            }

            if (!value.value) {
                if (args.sizeClass) {
                    if (constraint) {
                        constraint[`remove${capitalizedPropertyName}VariationForSizeClass`](args.sizeClass);
                        constraint._updateConfiguration();
                    }
                    else {
                        view[`remove${capitalizedPropertyName}VariationForSizeClass`](args.sizeClass);
                        view._updateConfiguration();
                    }
                }
                return;
            }

            if (constraint) {

                if (args.sizeClass) {
                    constraint[`set${capitalizedPropertyName}`](constantValue, {forSizeClass: args.sizeClass});
                }
                else {
                    constraint[property] = constantValue;
                }
                constraint._updateConfiguration();
                constraint._constraint = undefined;
                constraint._constituentConstraints = undefined;
                if (constraint._sourceView) {
                    constraint._sourceView.needsLayout = YES;
                }
                else {
                    constraint._views[0].needsLayout = YES;
                }
            }
            else {
                if (args.sizeClass) {
                    view[`set${capitalizedPropertyName}`](number, {forSizeClass: args.sizeClass});
                }
                else {
                    view[property] = number;
                }
                view.needsLayout = YES;
            }
        });

        // Upon the value box losing focus, dismiss the menu, if it was open
        // unless the newly focused item is a descendant of the menu
        value.addEventListener('blur', event => {
            if (menu) {
                menu.parentNode.dispatchEvent(new Event('click'));
            }
        });

        return item;
    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Constructs and returns the DOM node for a numeric setting.
     * @param name <String>                                 The name of the setting.
     * {
     *  @param forConstraint <BMLayoutConstraint>           The constraint being edited.
     *  @param propertyName <String>                        The name of the constraint property being edited.
     *  @param value <String>                               The current value.
     *  @param withReferenceView <BMView>                   The reference view.
     *  @param sizeClass <BMLayoutSizeClass, nullable>      The size class to which this setting applies, if any.
     * }
     * @return <DOMNode>                                    A DOM node.
     */
    numericSettingWithName(name, args) {
        let constraint = args.forConstraint;
        let property = args.propertyName;
        let view = args.withReferenceView;
        let capitalizedPropertyName = property[0].toUpperCase() + property.substring(1);

        let item = document.createElement('div');
        item.className = 'BMLayoutEditorDetailsItem';

        let title = document.createElement('div');
        title.className = 'BMLayoutEditorDetailsItemTitle';
        title.innerText = name;

        if (args.sizeClass) {
            let badge = this.settingsBadgeForSizeClass(args.sizeClass);
            title.insertBefore(badge, title.lastChild);
        }

        item.appendChild(title);

        let value = document.createElement('input');
        value.type = 'number';
        value.className = 'BMWindowInput BMLayoutEditorDetailsItemNumericValue';
        value.value = args.value;
        item.appendChild(value);

        value.addEventListener('input', event => {
            let number = parseFloat(value.value);

            if (isNaN(number)) {
                if (args.sizeClass) {
                    if (constraint) {
                        constraint[`remove${capitalizedPropertyName}VariationForSizeClass`](args.sizeClass);
                        constraint._updateConfiguration();
                    }
                    else {
                        view[`remove${capitalizedPropertyName}VariationForSizeClass`](args.sizeClass);
                        view._updateConfiguration();
                    }
                }
                return;
            }

            if (constraint) {

                if (args.sizeClass) {
                    constraint[`set${capitalizedPropertyName}`](number, {forSizeClass: args.sizeClass});
                }
                else {
                    constraint[property] = number;
                }
                constraint._updateConfiguration();
                constraint._constraint = undefined;
                constraint._constituentConstraints = undefined;
                if (constraint._sourceView) {
                    constraint._sourceView.needsLayout = YES;
                }
                else {
                    constraint._views[0].needsLayout = YES;
                }
            }
            else {
                if (args.sizeClass) {
                    view[`set${capitalizedPropertyName}`](number, {forSizeClass: args.sizeClass});
                }
                else {
                    view[property] = number;
                }
                view.needsLayout = YES;
            }
        });

        return item;
    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Constructs and returns the DOM node for an `<option>` element with the given attributes.
     * @param named <String>                    The display name of this option.
     * {
     *  @param value <AnyObject>                An arbitrary value associated with this option.
     *  @param selected <Boolean, nullable>     Controls whether this option is selected by default.
     * }
     */
    optionNamed(named, args) {
        let option = document.createElement('option');

        option.value = args ? args.value : named;
        option.innerText = named;

        if (args && args.selected) {
            option.selected = YES;
        }

        return option;
    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Constructs and returns the DOM node for a numeric setting.
     * @param name <String>                         The name of the setting.
     * {
     *  @param forConstraint <BMLayoutConstraint>   The constraint being edited.
     *  @param propertyName <String>                The name of the constraint property being edited.
     *  @param value <String>                       The current value.
     *  @param withReferenceView <BMView>
     * }
     * @return <DOMNode>                            A DOM node.
     */
    dropdownSettingWithName(name, args) {
        let constraint = args.forConstraint;
        let property = args.propertyName;

        let item = document.createElement('div');
        item.className = 'BMLayoutEditorDetailsItem';

        let title = document.createElement('div');
        title.className = 'BMLayoutEditorDetailsItemTitle';
        title.innerText = name;
        item.appendChild(title);

        let value = document.createElement('select');
        value.className = 'BMWindowInput BMLayoutEditorDetailsItemNumericValue';

        if (constraint._kind == BMLayoutConstraintKind.Horizontal) {
            if (constraint._sourceViewAttribute === BMLayoutAttribute.Width) {
                value.appendChild(this.optionNamed(constraint._sourceViewAttribute));
            }
            else {
                value.appendChild(this.optionNamed(BMLayoutAttribute.Leading));
                value.appendChild(this.optionNamed(BMLayoutAttribute.CenterX));
                value.appendChild(this.optionNamed(BMLayoutAttribute.Trailing));
                value.appendChild(this.optionNamed(BMLayoutAttribute.Left));
                value.appendChild(this.optionNamed(BMLayoutAttribute.Right));
            }
        }
        else {
            if (constraint._sourceViewAttribute === BMLayoutAttribute.Height) {
                value.appendChild(this.optionNamed(constraint._sourceViewAttribute));
            }
            else {
                value.appendChild(this.optionNamed(BMLayoutAttribute.Top));
                value.appendChild(this.optionNamed(BMLayoutAttribute.CenterY));
                value.appendChild(this.optionNamed(BMLayoutAttribute.Bottom));
            }
        }

        value.value = args.value;
        item.appendChild(value);

        value.addEventListener('change', event => {
            constraint[property] = value.value;
            constraint._cassowaryConstraint = undefined;
            constraint._constituentConstraints = undefined;
            constraint._sourceView.needsLayout = YES;

            // redraw the constraint
            /*requestAnimationFrame(_ => {
                this._clearOffsets();
                this._view.node.querySelectorAll('.BMLayoutEditorConstraint, .BMLayoutEditorLeadLine').forEach(node => node.remove());
                this._drawConstraint(constraint, {withReferenceView: args.withReferenceView});
            });*/
        });

        return item;
    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Constructs and returns the DOM node for a numeric setting.
     * @param name <String>                         The name of the setting.
     * {
     *  @param forConstraint <BMLayoutConstraint>   The constraint being edited.
     *  @param value <String>                       The current value.
     *  @param withReferenceView <BMView>
     * }
     * @return <DOMNode>                            A DOM node.
     */
    equalitySettingWithName(name, args) {
        let constraint = args.forConstraint;

        let item = document.createElement('div');
        item.className = 'BMLayoutEditorDetailsItem';

        let title = document.createElement('div');
        title.className = 'BMLayoutEditorDetailsItemTitle';
        title.innerText = name;
        item.appendChild(title);

        let value = document.createElement('select');
        value.className = 'BMWindowInput BMLayoutEditorDetailsItemNumericValue';


        value.appendChild(this.optionNamed('=', {value: BMLayoutConstraintRelation.Equals, selected: constraint._relation == BMLayoutConstraintRelation.Equals}));
        value.appendChild(this.optionNamed('\u2265', {value: BMLayoutConstraintRelation.GreaterThanOrEquals, selected: constraint._relation == BMLayoutConstraintRelation.GreaterThanOrEquals}));
        value.appendChild(this.optionNamed('\u2264', {value: BMLayoutConstraintRelation.LessThanOrEquals, selected: constraint._relation == BMLayoutConstraintRelation.LessThanOrEquals}));

        value.value = '' + args.value;
        item.appendChild(value);

        value.addEventListener('change', event => {
            constraint._relation = parseInt(value.value, 10);
            constraint._sourceView.needsLayout = YES;

            // redraw the constraint
            /*requestAnimationFrame(_ => {
                this._clearOffsets();
                this._view.node.querySelectorAll('.BMLayoutEditorConstraint, .BMLayoutEditorLeadLine').forEach(node => node.remove());
                this._drawConstraint(constraint, {withReferenceView: args.withReferenceView});
            });*/
        });

        return item;
    },


    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Constructs and returns a settings button.
     * @return <DOMNode>                A DOM node.
     * @param name <String>
     * {
     *  @param action <void ^(Event)>
     * }
     */
    buttonSettingWithName(name, args) {
        if (args.class) {
            var button = document.createElement('div');
            button.className = 'BMLayoutEditorImageButton ' + args.class;
        }
        else {
            var button = document.createElement('button');
            button.className = 'BMWindowButton';
            button.innerText = name;
        }

        button.addEventListener('click', args.action);

        return button;
    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Constructs and returns a settings divier.
     * @return <DOMNode>        A DOM node.
     */
    settingsDivider() {
        let divider = document.createElement('div');
        divider.className = 'BMLayoutEditorDetailsDivider';
        return divider;
    },


    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Creates a setting item that represents a view.
     * Clicking on it will select the view in the layout editor.
     * @param view <BMView>     The view.
     * @return <DOMNode>        The setting.
     */
    viewSettingWithView(view) {
        let constraintNode = document.createElement('div');
        constraintNode.classList.add('BMLayoutEditorDetailsConstraintItem');
        constraintNode.innerText = view.debuggingName || view.node.id;

        constraintNode.addEventListener('click', event => this.selectView(view));

        return constraintNode;
    },


    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Invoked by layout editor to create any non-standard settings for the given constraint. This method may be overriden by
     * subclasses to include additional settings to configure for constraints. The new settings should be included in the supplied
     * container.
     * 
     * Subclasses that provide customized settings are expected to manage the initial state of the settings node as well as what happens
     * when it is interacted with.
     * 
     * Subclasses should invoke the superclass implementation at some point during their implementation.
     * @param constraint <BMLayoutConstraint>           The constraint for which to create settings.
     * {
     *  @param withReferenceView <BMView>               The reference view through which the constraint's settings were accessed.
     *  @param inContainer <DOMNode>                    The node to which the new settings should be added.
     * }
     */
    createAdditionalSettingsForConstraint(constraint, args) {

    },


    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Creates the `constant` settings for the given constraint.
     * @param constraint <BMLayoutConstraint>           The constraint for which to show settings.
     * {
     *  @param withReferenceView <BMView>               The reference view through which the constraint's settings were accessed.
     * }
     * @return <DOMNode>                                The contents of the settings page.
     */
    _createConstantSettingsForConstraint(constraint, args) {
        let content = this.detailsNodeContent;
        let constant;
        content.appendChild(constant = this.constantSettingWithName('Constant:', {value: constraint._constant, forConstraint: constraint, propertyName: '_constant', withReferenceView: args.withReferenceView}));
        // Create settings for the available constant variations
        for (let key in constraint._variations) {
            if (this._activeSizeClass && key == this._activeSizeClass._hashString) continue;
            if ('constant' in constraint._variations[key]) {
                content.appendChild(this.constantSettingWithName('Constant:', {value: constraint._variations[key].constant, forConstraint: constraint, propertyName: 'constant', withReferenceView: args.withReferenceView, sizeClass: constraint._variations[key].sizeClass}));
            }
        }
        // Create a setting for the currently active size class, allowing users to define new variations
        if (this._activeSizeClass) {
            let value = '';
            if (constraint._variations[this._activeSizeClass._hashString]) {
                if ('constant' in constraint._variations[this._activeSizeClass._hashString]) {
                    value = constraint._variations[this._activeSizeClass._hashString].constant;
                }
            }
            content.appendChild(constant = this.constantSettingWithName('Constant:', {value: value, forConstraint: constraint, propertyName: 'constant', withReferenceView: args.withReferenceView, sizeClass: this._activeSizeClass}));
        }
        requestAnimationFrame(_ => constant.querySelectorAll('input')[0].focus(), constant.querySelectorAll('input')[0].select());
    },


    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Creates the `priority` settings for the given constraint.
     * @param constraint <BMLayoutConstraint>           The constraint for which to show settings.
     * {
     *  @param withReferenceView <BMView>               The reference view through which the constraint's settings were accessed.
     * }
     * @return <DOMNode>                                The contents of the settings page.
     */
    _createPrioritySettingsForConstraint(constraint, args) {
        let content = this.detailsNodeContent;

        content.appendChild(this.numericSettingWithName('Priority:', {value: constraint._priority, forConstraint: constraint, propertyName: '_priority', withReferenceView: args.withReferenceView}));// Create settings for the available constant variations
        // Create settings for the available priority variations
        for (let key in constraint._variations) {
            if (this._activeSizeClass && key == this._activeSizeClass._hashString) continue;
            if ('priority' in constraint._variations[key]) {
                content.appendChild(this.numericSettingWithName('Priority:', {value: constraint._variations[key].priority, forConstraint: constraint, propertyName: 'priority', withReferenceView: args.withReferenceView, sizeClass: constraint._variations[key].sizeClass}));
            }
        }
        // Create a setting for the currently active size class, allowing users to define new variations
        if (this._activeSizeClass) {
            let value = '';
            if (constraint._variations[this._activeSizeClass._hashString]) {
                if ('priority' in constraint._variations[this._activeSizeClass._hashString]) {
                    value = constraint._variations[this._activeSizeClass._hashString].priority;
                }
            }
            content.appendChild(this.numericSettingWithName('Priority:', {value: value, forConstraint: constraint, propertyName: 'priority', withReferenceView: args.withReferenceView, sizeClass: this._activeSizeClass}));
        }
    },


    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Creates the `isActive` settings for the given constraint.
     * @param constraint <BMLayoutConstraint>           The constraint for which to show settings.
     * {
     *  @param withReferenceView <BMView>               The reference view through which the constraint's settings were accessed.
     * }
     * @return <DOMNode>                                The contents of the settings page.
     */
    _createIsActiveSettingsForConstraint(constraint, args) {
        let content = this.detailsNodeContent;

        this.booleanSettingWithName('Active:', {value: constraint._isActive, container: content, changeHandler: value => {
            constraint.isActive = value;
            constraint._updateConfiguration();
        }});
        // Create settings for the available constant variations
        for (let key in constraint._variations) {
            if (this._activeSizeClass && key == this._activeSizeClass._hashString) continue;
            if ('isActive' in constraint._variations[key]) {
                this.booleanSettingWithName('Active:', {value: constraint._variations[key].isActive, indeterminate: YES, container: content, sizeClass: constraint._variations[key].sizeClass, changeHandler: (value, sizeClass) => {
                    if (value === undefined) {
                        constraint.removeIsActiveVariationForSizeClass(sizeClass);
                    }
                    else {
                        constraint.setIsActive(value, {forSizeClass: sizeClass});
                    }
                    constraint._updateConfiguration();
                }});
            }
        }
        // Create a setting for the currently active size class, allowing users to define new variations
        if (this._activeSizeClass) {
            let value = undefined;
            if (constraint._variations[this._activeSizeClass._hashString]) {
                if ('isActive' in constraint._variations[this._activeSizeClass._hashString]) {
                    value = constraint._variations[this._activeSizeClass._hashString].isActive;
                }
            }
            this.booleanSettingWithName('Active:', {value: value, indeterminate: YES, container: content, sizeClass: this._activeSizeClass, changeHandler: (value, sizeClass) => {
                if (value === undefined) {
                    constraint.removeIsActiveVariationForSizeClass(sizeClass);
                }
                else {
                    constraint.setIsActive(value, {forSizeClass: sizeClass});
                }
                constraint._updateConfiguration();
            }});
        }
    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Creates the settings pane for the given constraint.
     * @param constraint <BMLayoutConstraint>           The constraint for which to show settings.
     * {
     *  @param withReferenceView <BMView>               The reference view through which the constraint's settings were accessed.
     * }
     * @return <DOMNode>                                The contents of the settings page.
     */
    createSettingsForConstraint(constraint, args) {
        this._disableSettingsKeyboardShortcuts();

        if (constraint.isConstraintCollection) return this.createSettingsForConstraintCollection(constraint, args);

        var content = this.detailsNodeContent;
        content.classList.remove('BMLayoutEditorViewDetails');

		let operatorMap = {
			[BMLayoutConstraintRelation.Equals]: '=',
			[BMLayoutConstraintRelation.GreaterThanOrEquals]: '\u2265',
			[BMLayoutConstraintRelation.LessThanOrEquals]: '\u2264'
		}

        content.appendChild(this.readonlySettingWithName('First View:', {value: constraint._sourceView.debuggingName || constraint._sourceView.node.id, action: _ => this.selectView(constraint._sourceView)}));
        content.appendChild(this.dropdownSettingWithName('Attribute:', {value: constraint._sourceViewAttribute, forConstraint: constraint, propertyName: '_sourceViewAttribute', withReferenceView: args.withReferenceView}));
        //---------------------------------------------------------------------------------------------------------
        content.appendChild(this.settingsDivider());
        content.appendChild(this.equalitySettingWithName('Relation:', {value: constraint._relation, forConstraint: constraint, withReferenceView: args.withReferenceView}));
        //---------------------------------------------------------------------------------------------------------
        content.appendChild(this.settingsDivider());
        if (constraint._targetView) {
            content.appendChild(this.numericSettingWithName('Multiplier:', {value: constraint._multiplier, forConstraint: constraint, propertyName: '_multiplier', withReferenceView: args.withReferenceView}));
            content.appendChild(this.readonlySettingWithName('Second View:', {value: constraint._targetView.debuggingName || constraint._targetView.node.id, action: _ => this.selectView(constraint._targetView)}));
            content.appendChild(this.dropdownSettingWithName('Attribute:', {value: constraint._targetViewAttribute, forConstraint: constraint, propertyName: '_targetViewAttribute', withReferenceView: args.withReferenceView}));
        }

        // Create the constant setting
        this._createConstantSettingsForConstraint(constraint, args);
        //---------------------------------------------------------------------------------------------------------
        content.appendChild(this.settingsDivider());
        this._createPrioritySettingsForConstraint(constraint, args);
        this._createIsActiveSettingsForConstraint(constraint, args);

        
        //---------------------------------------------------------------------------------------------------------
        content.appendChild(this.settingsDivider());
        this.createAdditionalSettingsForConstraint(constraint, {withReferenceView: args.withReferenceView, inContainer: content});

        content.appendChild(this.buttonSettingWithName('Remove Constraint', {action: event => {
            this.tree.removeConstraint(constraint);
            constraint.remove();
            this.selectView(args.withReferenceView);
            //requestAnimationFrame(_ => this.selectView(args.withReferenceView));
        }}));

    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Creates the settings pane for the given constraint collection.
     * @param constraint <BMLayoutConstraint>       The constraint.
     */
    createSettingsForConstraintCollection(constraint, args) {

        var content = this.detailsNodeContent;
        content.classList.remove('BMLayoutEditorViewDetails');

        let constant;

        if (constraint._hasEditableConstant) {
            this._createConstantSettingsForConstraint(constraint, args);
            //---------------------------------------------------------------------------------------------------------
            content.appendChild(this.settingsDivider());
        }

        let constraintsTitle = this.readonlySettingWithName('Affected Views', {value: ''});
        constraintsTitle.childNodes[0].style.textAlign = 'left';
        constraintsTitle.childNodes[0].style.paddingLeft = '16px';
        content.appendChild(constraintsTitle);

        constraint._views.forEach(view => content.appendChild(this.viewSettingWithView(view)));
        //---------------------------------------------------------------------------------------------------------
        content.appendChild(this.settingsDivider());
        this._createPrioritySettingsForConstraint(constraint, args)
        this._createIsActiveSettingsForConstraint(constraint, args);
        //---------------------------------------------------------------------------------------------------------
        content.appendChild(this.settingsDivider());
        this.createAdditionalSettingsForConstraint(constraint, {withReferenceView: args.withReferenceView, inContainer: content});
        
        content.appendChild(this.buttonSettingWithName('Remove Constraint', {action: event => {
            this.tree.removeConstraint(constraint);
            let view = constraint._views[0];
            //requestAnimationFrame(_ => this.selectView(constraint._views[0]));
            constraint.remove();
            this.selectView(view);
        }}));

    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * 
     * @param constraint <BMLayoutConstraint>
     * {
     *  @param referenceView <BMView>
     *  @param internal <Boolean, nullable>         Defaults to NO.
     * }
     */
    constraintSettingWithConstraint(constraint, args) {
        let constraintNode = document.createElement('div');
        constraintNode.classList.add('BMLayoutEditorDetailsConstraintItem');
        constraintNode.innerText = constraint.toString();

        if (constraint._priority > 500 && constraint._priority < 1000) {
            constraintNode.classList.add('BMLayoutEditorDetailsConstraintItemStrong');
        }
        else if (constraint._priority <= 500) {
            constraintNode.classList.add('BMLayoutEditorDetailsConstraintItemWeak');
        }

        if (args.internal) {
            constraintNode.classList.add('BMLayoutEditorDetailsConstraintItemReadonly');
        }
        else {
            constraintNode.addEventListener('click', event => this.selectConstraint(constraint, {withReferenceView: args.referenceView}));
        }

        return constraintNode;
    },

    /**
     * An array of temporary event handlers for settings pane keyboard shortcuts
     * or modifiers.
     */
    _settingsKeyboardShortcuts: undefined, // <[void ^(Event)]>

    /**
     * Removes any temporary event handlers created for settings panes.
     */
    _disableSettingsKeyboardShortcuts() {
        if (this._settingsKeyboardShortcuts) {
            this._settingsKeyboardShortcuts.forEach(handler => {
                window.removeEventListener('keydown', handler, YES);
                window.removeEventListener('keyup', handler, YES);
                window.removeEventListener('keypress', handler, YES);
            });
        }

        this._settingsKeyboardShortcuts = [];
    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Creates the settings pane for the given view.
     * @param view <BMView>
     */
    createSettingsForView(view) {
        this._disableSettingsKeyboardShortcuts();

        var content = this.detailsNodeContent;
        content.classList.add('BMLayoutEditorViewDetails');

        /*let tabs = document.createElement('div');
        tabs.className = 'BMLayoutEditorDetailsTabStrip';

        let tab = document.createElement('div');
        tab.className = 'BMLayoutEditorDetailsTab BMLayoutEditorDetailsTabLayout';
        tabs.appendChild(tab);

        tab = document.createElement('div');
        tab.className = 'BMLayoutEditorDetailsTab BMLayoutEditorDetailsTabProperties';
        tabs.appendChild(tab);

        tab = document.createElement('div');
        tab.className = 'BMLayoutEditorDetailsTab BMLayoutEditorDetailsTabLayoutVariables';
        tabs.appendChild(tab);

        content.appendChild(tabs);*/

        let tabContent = document.createElement('div');
        tabContent.className = 'BMLayoutEditorViewTabDetails';
        content.appendChild(tabContent);
        content = tabContent;

        this.createVariableNumericSettingWithName('Opacity:', {withReferenceView: view, propertyName: 'opacity', container: content});
        this.createVariableBooleanSettingWithName('Visible:', {withReferenceView: view, propertyName: 'isVisible', container: content});
        this.createVariableStringSettingWithName('CSS Class:', {withReferenceView: view, propertyName: 'CSSClass', container: content});
        //---------------------------------------------------------------------------------------------------------
        content.appendChild(this.settingsDivider());

        content.appendChild(this.numericSettingWithName('Compression Resistance:', {value: view.compressionResistance, propertyName: 'compressionResistance', withReferenceView: view}));
        content.appendChild(this.numericSettingWithName('Expansion Resistance:', {value: view.expansionResistance, propertyName: 'expansionResistance', withReferenceView: view}));
        //---------------------------------------------------------------------------------------------------------
        content.appendChild(this.settingsDivider());
        content.appendChild(this.readonlySettingWithName('Intrinsic Size:', {value: view.supportsIntrinsicSize ? 'Supported' : 'Unsupported'}));
        //---------------------------------------------------------------------------------------------------------

        // View constraints will be split into four groups:
        //
        // 1. Visible by default and non-collapsible will be the constraints that directly affect the view,
        // or link the view to its siblings or ancestors
        //
        // 2. A second, collapsed by default group, will show the constraints that link the view to its descendants
        //
        // 3. A third, collapsed by defaylt group, will show the inactive constraints
        //
        // 4. A final group shows the view's internal constraints in a read-only mode
        let constraintCategoryMap = {};
        let subviewConstraintCategoryMap = {};
        let inactiveConstraintsMap = {};
        let hasSubviewConstraints = NO;
        let hasInactiveConstraints = NO;

        view.localConstraints.forEach(constraint => {
            let category = constraint.categoryKind;

            if (!constraint._configuration.isActive) {
                hasInactiveConstraints = YES;
                inactiveConstraintsMap[category] = inactiveConstraintsMap[category] || [];
                inactiveConstraintsMap[category].push(constraint);
                return;
            }

            if (!constraint._isConstraintCollection) {
                // Push subview constraints into their own categories
                if (constraint._sourceView == view && constraint._targetView && constraint._targetView.isDescendantOfView(view)) {
                    subviewConstraintCategoryMap[category] = subviewConstraintCategoryMap[category] || [];
                    subviewConstraintCategoryMap[category].push(constraint);
                    hasSubviewConstraints = YES;
                    return;
                }
                if (constraint._targetView == view && constraint._sourceView.isDescendantOfView(view)) {
                    subviewConstraintCategoryMap[category] = subviewConstraintCategoryMap[category] || [];
                    subviewConstraintCategoryMap[category].push(constraint);
                    hasSubviewConstraints = YES;
                    return;
                }
            }

            constraintCategoryMap[category] = constraintCategoryMap[category] || [];
            constraintCategoryMap[category].push(constraint);
        });

        

        Object.keys(constraintCategoryMap).sort().forEach(category => {
            content.appendChild(this.settingsDivider());
            let constraintsTitle = this.readonlySettingWithName(category + ' Constraints', {value: ''});
            constraintsTitle.childNodes[0].style.textAlign = 'left';
            constraintsTitle.childNodes[0].style.paddingLeft = '16px';
            content.appendChild(constraintsTitle);
    
            constraintCategoryMap[category].forEach(constraint => content.appendChild(this.constraintSettingWithConstraint(constraint, {referenceView: view})));
        });

        let includesSubviewConstraints = NO;
        let includesInactiveConstraints = NO;

        //---------------------------------------------------------------------------------------------------------
        if (hasSubviewConstraints) {
            let subviewConstraintsContainer = document.createElement('div');
            subviewConstraintsContainer.classList.add('BMLayoutEditorViewDetails'); 
            subviewConstraintsContainer.classList.add('BMLayoutEditorSubviewDetails');
            subviewConstraintsContainer.classList.add('BMLayoutEditorSubviewDetailsCollapsed');
            subviewConstraintsContainer.style.height = '0px';
            content.appendChild(this.settingsDivider());

            // Create a separate title for the subview constraints container
            let constraintsTitle = this.readonlySettingWithName('Subview Constraints', {value: ''});
            constraintsTitle.childNodes[0].style.textAlign = 'left';
            constraintsTitle.childNodes[0].style.paddingLeft = '16px';


            // Add a disclosure triangle to the subview constraints container
            let constraintsDisclosureTriangle = document.createElement('div');
            constraintsDisclosureTriangle.classList.add('BMDisclosureTriangle');
            constraintsTitle.insertBefore(constraintsDisclosureTriangle, constraintsTitle.childNodes[0]);

            constraintsDisclosureTriangle.addEventListener('click', event => {
                if (subviewConstraintsContainer.classList.contains('BMLayoutEditorSubviewDetailsCollapsed')) {
                    includesSubviewConstraints = YES;
                    constraintsDisclosureTriangle.classList.add('BMDisclosureTriangleExpanded');

                    (window.Velocity || $.Velocity).animate(subviewConstraintsContainer, {
                        height: subviewConstraintsContainer.scrollHeight + 'px'
                    }, {duration: 200, easing: 'easeInOutQuad', complete: () => subviewConstraintsContainer.classList.remove('BMLayoutEditorSubviewDetailsCollapsed')});
                } 
                else {
                    includesSubviewConstraints = NO;
                    subviewConstraintsContainer.classList.add('BMLayoutEditorSubviewDetailsCollapsed');
                    constraintsDisclosureTriangle.classList.remove('BMDisclosureTriangleExpanded');

                    (window.Velocity || $.Velocity).animate(subviewConstraintsContainer, {
                        height: '0px'
                    }, {duration: 200, easing: 'easeInOutQuad'});
                }
                this._drawConstraintsForView(view, {includesInactiveConstraints, includesSubviewConstraints});
                event.stopPropagation();
            });

            content.appendChild(constraintsTitle);

            Object.keys(subviewConstraintCategoryMap).sort().forEach(category => {
                subviewConstraintsContainer.appendChild(this.settingsDivider());
                let constraintsTitle = this.readonlySettingWithName('Subview ' + category + ' Constraints', {value: ''});
                constraintsTitle.childNodes[0].style.textAlign = 'left';
                constraintsTitle.childNodes[0].style.paddingLeft = '16px';
                subviewConstraintsContainer.appendChild(constraintsTitle);
        
                subviewConstraintCategoryMap[category].forEach(constraint => subviewConstraintsContainer.appendChild(this.constraintSettingWithConstraint(constraint, {referenceView: view})));
            });

            content.appendChild(subviewConstraintsContainer);
        }

        //---------------------------------------------------------------------------------------------------------
        if (hasInactiveConstraints) {
            let inactiveConstraintsContainer = document.createElement('div');
            inactiveConstraintsContainer.classList.add('BMLayoutEditorViewDetails'); 
            inactiveConstraintsContainer.classList.add('BMLayoutEditorSubviewDetails');
            inactiveConstraintsContainer.classList.add('BMLayoutEditorSubviewDetailsCollapsed');
            inactiveConstraintsContainer.style.height = '0px';
            content.appendChild(this.settingsDivider());

            // Create a separate title for the subview constraints container
            let constraintsTitle = this.readonlySettingWithName('Inactive Constraints', {value: ''});
            constraintsTitle.childNodes[0].style.textAlign = 'left';
            constraintsTitle.childNodes[0].style.paddingLeft = '16px';


            // Add a disclosure triangle to the subview constraints container
            let constraintsDisclosureTriangle = document.createElement('div');
            constraintsDisclosureTriangle.classList.add('BMDisclosureTriangle');
            constraintsTitle.insertBefore(constraintsDisclosureTriangle, constraintsTitle.childNodes[0]);

            constraintsDisclosureTriangle.addEventListener('click', event => {
                if (inactiveConstraintsContainer.classList.contains('BMLayoutEditorSubviewDetailsCollapsed')) {
                    includesInactiveConstraints = YES;
                    constraintsDisclosureTriangle.classList.add('BMDisclosureTriangleExpanded');

                    (window.Velocity || $.Velocity).animate(inactiveConstraintsContainer, {
                        height: inactiveConstraintsContainer.scrollHeight + 'px'
                    }, {duration: 200, easing: 'easeInOutQuad', complete: () => inactiveConstraintsContainer.classList.remove('BMLayoutEditorSubviewDetailsCollapsed')});
                } 
                else {
                    includesInactiveConstraints = NO;
                    inactiveConstraintsContainer.classList.add('BMLayoutEditorSubviewDetailsCollapsed');
                    constraintsDisclosureTriangle.classList.remove('BMDisclosureTriangleExpanded');

                    (window.Velocity || $.Velocity).animate(inactiveConstraintsContainer, {
                        height: '0px'
                    }, {duration: 200, easing: 'easeInOutQuad'});
                }
                this._drawConstraintsForView(view, {includesInactiveConstraints, includesSubviewConstraints});
                event.stopPropagation();
            });

            content.appendChild(constraintsTitle);

            Object.keys(inactiveConstraintsMap).sort().forEach(category => {
                inactiveConstraintsContainer.appendChild(this.settingsDivider());
                let constraintsTitle = this.readonlySettingWithName('Inactive ' + category + ' Constraints', {value: ''});
                constraintsTitle.childNodes[0].style.textAlign = 'left';
                constraintsTitle.childNodes[0].style.paddingLeft = '16px';
                inactiveConstraintsContainer.appendChild(constraintsTitle);
        
                inactiveConstraintsMap[category].forEach(constraint => inactiveConstraintsContainer.appendChild(this.constraintSettingWithConstraint(constraint, {referenceView: view})));
            });

            content.appendChild(inactiveConstraintsContainer);
        }

        //---------------------------------------------------------------------------------------------------------
        let internalConstraints = view.internalConstraints();
        if (internalConstraints.length) {
            content.appendChild(this.settingsDivider());
            let internalConstraintsTitle = this.readonlySettingWithName('Internal Constraints', {value: ''});
            internalConstraintsTitle.childNodes[0].style.textAlign = 'left';
            internalConstraintsTitle.childNodes[0].style.paddingLeft = '16px';
            content.appendChild(internalConstraintsTitle);
    
            internalConstraints.forEach(constraint => content.appendChild(this.constraintSettingWithConstraint(constraint, {referenceView: view, internal: YES})));    
        }

        let hasOption = NO;
        let hasShift = NO;
        let hasCtrl = NO;

        content.appendChild(this.settingsDivider());
        let buttonSetting = this.buttonSettingWithName('Deactivate Constraints', {action: event => {
            if (hasOption && hasShift && hasCtrl) {
                new Set(view.rootView.allConstraints).forEach(constraint => constraint.remove());
            }
            else if (hasOption) {
                for (let constraint of view.localConstraints) {
                    if (hasShift) {
                        constraint.remove();
                    }
                    else {
                        if (this._activeSizeClass) {
                            constraint.setIsActive(NO, {forSizeClass: this._activeSizeClass});
                        }
                        else {
                            constraint.isActive = NO;
                        }
                    }
                }
            }
            else {
                Object.keys(constraintCategoryMap).forEach(key => {
                    for (let constraint of constraintCategoryMap[key]) {
                        if (hasShift) {
                            constraint.remove();
                        }
                        else {
                            if (this._activeSizeClass) {
                                constraint.setIsActive(NO, {forSizeClass: this._activeSizeClass});
                            }
                            else {
                                constraint.isActive = NO;
                            }
                        }
                    }
                });
            }
            this.selectView(view);
        }});
        content.appendChild(buttonSetting);

        buttonSetting.addEventListener('contextmenu', event => event.preventDefault());

        let keyboardModifier = event => {
            switch (event.key) {
                case 'Alt':
                    hasOption = (event.type == 'keydown');
                    break;
                case 'Shift':
                    hasShift = (event.type == 'keydown');
                    break;
                case 'Control':
                    hasCtrl = (event.type == 'keydown');
                    break;
            }

            if (hasOption) {
                if (hasShift) {
                    if (hasCtrl) {
                        buttonSetting.innerText = 'Reset Layout';
                    }
                    else {
                        buttonSetting.innerText = 'Remove All Constraints';
                    }
                }
                else {
                    buttonSetting.innerText = 'Deactivate All Constraints';
                }
            }
            else if (hasShift) {
                buttonSetting.innerText = 'Remove Constraints';
            }
            else {
                buttonSetting.innerText = 'Deactivate Constraints';
            }
        };

        window.addEventListener('keydown', keyboardModifier, YES);
        window.addEventListener('keyup', keyboardModifier, YES);

        this._settingsKeyboardShortcuts.push(keyboardModifier);
    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Constructs and returns a settings button that creates an equal attribute constraint
     * over a set of views.
     * @param name <String>                     The name of the button.
     * {
     *  @param icon <String, nullable>          Overrides name if specified. The icon to use for the button.
     *  @param attribute <BMLayoutAttribute>    The layout attribute with which the constraint will be created.
     * }
     */
    equalConstraintSettingWithName(name, args) {
        let setting = this.buttonSettingWithName(name, {class: args.class, action: event => {
            let constraint = BMEqualAttributeLayoutConstraint.constraintWithAttribute(args.attribute, {
                forViews: this.selectedViews,
                _internal: event.shiftKey
            });

            if (event.shiftKey) {
                constraint.constituentConstraints.forEach(constraint => {
                    constraint._install();
                    this.addConstraint(constraint)
                });
            }
            else {
                this.addConstraint(constraint);
            }
        }});
        return setting;
    },

    /**
     * @deprecated Unused when the new settings view is enabled.
     * 
     * Creates the settings pane for multiple selected views.
     */
    createSettingsForMultipleViews() {
        this._disableSettingsKeyboardShortcuts();

        this.detailsNodeTitle.innerText = this.selectedViews.length + ' selected';
        this.detailsNodeContent.innerHTML = '';
        
        let content = this.detailsNodeContent;

        let constraintsTitle = this.readonlySettingWithName('Align Horizontal', {value: ''});
        constraintsTitle.childNodes[0].style.textAlign = 'center';
        constraintsTitle.childNodes[0].style.width = '100%';
        content.appendChild(constraintsTitle);

        let flexContainer = document.createElement('div');
        flexContainer.style = 'display: flex; flex-direction: row; align-self: center; padding-top: 8px; padding-bottom: 8px';
        content.appendChild(flexContainer);

        flexContainer.appendChild(this.equalConstraintSettingWithName('Align Top', {class: 'BMLayoutEditorImageButtonAlignAlignTop', attribute: BMLayoutAttribute.Top}));
        flexContainer.appendChild(this.equalConstraintSettingWithName('Align Center', {class: 'BMLayoutEditorImageButtonAlignCenterY', attribute: BMLayoutAttribute.CenterY}));
        flexContainer.appendChild(this.equalConstraintSettingWithName('Align Bottom', {class: 'BMLayoutEditorImageButtonAlignBottom', attribute: BMLayoutAttribute.Bottom}));
        

        //---------------------------------------------------------------------------------------------------------
        content.appendChild(this.settingsDivider());
        let internalConstraintsTitle = this.readonlySettingWithName('Distribute Horizontal', {value: ''});
        constraintsTitle.childNodes[0].style.textAlign = 'center';
        constraintsTitle.childNodes[0].style.width = '100%';
        content.appendChild(internalConstraintsTitle);

        flexContainer = document.createElement('div');
        flexContainer.style = 'display: flex; flex-direction: row; align-self: center; padding-top: 8px; padding-bottom: 8px';
        content.appendChild(flexContainer);

        flexContainer.appendChild(this.buttonSettingWithName('Equal Spacing', {class: 'BMLayoutEditorImageButtonEqualHorizontalSpacing', action: event => {
            let constraint = BMEqualSpacingLayoutConstraint.constraintOfKind(BMLayoutConstraintKind.Horizontal, {
                forViews: this.selectedViews.slice().sort((a, b) => a.node.getBoundingClientRect().left - b.node.getBoundingClientRect().left),
                withSuperview: NO,
                _internal: event.shiftKey
            });

            if (event.shiftKey) {
                constraint.constituentConstraints.forEach(constraint => {
                    constraint._install();
                    this.addConstraint(constraint)
                });
            }
            else {
                this.addConstraint(constraint);
            }
        }}));
        flexContainer.appendChild(this.buttonSettingWithName('Equal Spacing In Superview', {class: 'BMLayoutEditorImageButtonEqualHorizontalSpacingInSuperview', action: event => {
            let constraint = BMEqualSpacingLayoutConstraint.constraintOfKind(BMLayoutConstraintKind.Horizontal, {
                forViews: this.selectedViews.slice().sort((a, b) => a.node.getBoundingClientRect().left - b.node.getBoundingClientRect().left),
                withSuperview: YES,
                _internal: event.shiftKey
            });

            if (event.shiftKey) {
                constraint.constituentConstraints.forEach(constraint => {
                    constraint._install();
                    this.addConstraint(constraint)
                });
            }
            else {
                this.addConstraint(constraint);
            }
        }}));
        flexContainer.appendChild(this.equalConstraintSettingWithName('Equal Width', {class: 'BMLayoutEditorImageButtonEqualWidth', attribute: BMLayoutAttribute.Width}));

        //---------------------------------------------------------------------------------------------------------
        content.appendChild(this.settingsDivider());
        internalConstraintsTitle = this.readonlySettingWithName('Align Vertical', {value: ''});
        constraintsTitle.childNodes[0].style.textAlign = 'center';
        constraintsTitle.childNodes[0].style.width = '100%';
        content.appendChild(internalConstraintsTitle);

        flexContainer = document.createElement('div');
        flexContainer.style = 'display: flex; flex-direction: row; align-self: center; padding-top: 8px; padding-bottom: 8px';
        content.appendChild(flexContainer);

        flexContainer.appendChild(this.equalConstraintSettingWithName('Align Leading', {class: 'BMLayoutEditorImageButtonAlignLeading', attribute: BMLayoutAttribute.Leading}));
        flexContainer.appendChild(this.equalConstraintSettingWithName('Align Center', {class: 'BMLayoutEditorImageButtonAlignCenterX', attribute: BMLayoutAttribute.CenterX}));
        flexContainer.appendChild(this.equalConstraintSettingWithName('Align Trailing', {class: 'BMLayoutEditorImageButtonAlignTrailing', attribute: BMLayoutAttribute.Trailing}));

        //---------------------------------------------------------------------------------------------------------
        content.appendChild(this.settingsDivider());
        internalConstraintsTitle = this.readonlySettingWithName('Distribute Vertical', {value: ''});
        constraintsTitle.childNodes[0].style.textAlign = 'center';
        constraintsTitle.childNodes[0].style.width = '100%';
        content.appendChild(internalConstraintsTitle);

        flexContainer = document.createElement('div');
        flexContainer.style = 'display: flex; flex-direction: row; align-self: center; padding-top: 8px; padding-bottom: 8px';
        content.appendChild(flexContainer);

        flexContainer.appendChild(this.buttonSettingWithName('Equal Spacing', {class: 'BMLayoutEditorImageButtonEqualVerticalSpacing', action: event => {
            let constraint = BMEqualSpacingLayoutConstraint.constraintOfKind(BMLayoutConstraintKind.Vertical, {
                forViews: this.selectedViews.slice().sort((a, b) => a.node.getBoundingClientRect().top - b.node.getBoundingClientRect().top),
                withSuperview: NO,
                _internal: event.shiftKey
            });

            if (event.shiftKey) {
                constraint.constituentConstraints(constraint => {
                    constraint._install();
                    this.addConstraint(constraint)
                });
            }
            else {
                this.addConstraint(constraint);
            }
        }}));
        flexContainer.appendChild(this.buttonSettingWithName('Equal Spacing In Superview', {class: 'BMLayoutEditorImageButtonEqualVerticalSpacingInSuperview', action: event => {
            let constraint = BMEqualSpacingLayoutConstraint.constraintOfKind(BMLayoutConstraintKind.Vertical, {
                forViews: this.selectedViews.slice().sort((a, b) => a.node.getBoundingClientRect().top - b.node.getBoundingClientRect().top),
                withSuperview: YES,
                _internal: event.shiftKey
            });

            if (event.shiftKey) {
                constraint.constituentConstraints(constraint => {
                    constraint._install();
                    this.addConstraint(constraint)
                });
            }
            else {
                this.addConstraint(constraint);
            }
        }}));
        flexContainer.appendChild(this.equalConstraintSettingWithName('Equal Height', {class: 'BMLayoutEditorImageButtonEqualHeight', attribute: BMLayoutAttribute.Height}));

    },

    // #endregion

	// @override - BMWindow
	bringToFrontAnimated: function (animated, args) {
		this._visible = YES;
		
		animated = (animated === undefined ? YES : animated);
		
		(window.Velocity || $.Velocity)(this._blocker, 'stop');
		(window.Velocity || $.Velocity)(this._window, 'stop');
		
		var self = this;
		
		if (self.delegate && self.delegate.windowWillAppear) {
			self.delegate.windowWillAppear(self);
		}
		
		if (animated) {

			this._blocker.style.pointerEvents = 'none';
			this._window.style.pointerEvents = 'none';
        
            if (BM_USE_VELOCITY2) {
                this._blocker.velocity({opacity: 1, translateZ: 0, display: 'block'}, {
                    duration: 500,
                    easing: 'easeInOutQuint',
                    complete: function () {
                        self._blocker.style.pointerEvents = '';
                        self._window.style.pointerEvents = '';
    
                        if (self.delegate && self.delegate.windowDidAppear) {
                            self.delegate.windowDidAppear(self);
                        }
                        if (args && args.completionHandler) args.completionHandler();
                    }
                })
            }
            else {
                (window.Velocity || $.Velocity)(this._blocker, {opacity: 1, translateZ: 0}, {
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
                });
            }
            
            let frame = this.frame.copy();
            let sourceFrame = BMRectMakeWithNodeFrame(this._rootNode);
            this.frame = sourceFrame;
            this.treeWidthConstraint.constant = 0;
            this.detailsWidthConstraint.constant = 0;
            this.workspaceToolbarHeightConstraint.constant = 0;
            this.node.style.opacity = 1;
            this.node.style.display = 'block';
            this._view.node.style.display = 'block';
            this.workspaceNode.appendChild(this._view.node);
            this.layout();

            BMAnimateWithBlock(() => {
                this.leftConstraint.constant = frame.origin.x;
                this.topConstraint.constant = frame.origin.y;
                this.widthConstraint.constant = frame.size.width;
                this.heightConstraint.constant = frame.size.height;

                this.treeWidthConstraint.constant = 256;
                this.detailsWidthConstraint.constant = 344;
                this.workspaceToolbarHeightConstraint.constant = _BMLayoutEditorToolbarHeight;
                this.layout();

                BMCopyProperties(this.node.style, {
                    left: sourceFrame.origin.x + 'px',
                    top: sourceFrame.origin.y + 'px',
                    width: sourceFrame.size.width + 'px',
                    height: sourceFrame.size.height + 'px'
                })

                let controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this.node});
                controller.registerBuiltInProperty('left', {withValue: frame.origin.x + 'px'});
                controller.registerBuiltInProperty('top', {withValue: frame.origin.y + 'px'});
                controller.registerBuiltInProperty('width', {withValue: frame.size.width + 'px'});
                controller.registerBuiltInProperty('height', {withValue: frame.size.height + 'px'});
                this._frame = frame;

            }, {duration: _BMWindowAnimationDurationDefault, easing: _BMWindowAnimationEasingDefault, complete: () => {

                for (const window of self._toolWindows) {
                    if (window.opensAutomatically) window.bringToFrontAnimated(animated);
                }
            }});
		
		}
		else {
			this._blocker.style.opacity = 1;
			this._blocker.style.display = 'block';
			this._blocker.style.webkitBackdropFilter = 'blur(15px)';
			this._blocker.style.backdropFilter = 'blur(15px)';
			
			this._window.style.opacity = 1;
			BMHook(this._window, {scaleX: 1, scaleY: 1});
			this._window.style.display = 'block';

			this._blocker.style.pointerEvents = '';
			this._window.style.pointerEvents = '';
			
			if (self.delegate && self.delegate.windowDidAppear) self.delegate.windowDidAppear(self);

            for (const window of this._toolWindows) {
                window.bringToFrontAnimated(animated);
            }
			
			if (args && args.completionHandler) args.completionHandler();
		}
	},
	
	
	// @override - BMWindow
	dismissAnimated: async function (animated, args) {
        args = args || {};

        this._disableSettingsKeyboardShortcuts();

        var completionHandler;
        if (args.completionHandler) {
            completionHandler = args.completionHandler;
        }

        args.completionHandler = () => {

            if (completionHandler) completionHandler();

        }

        window.removeEventListener('resize', this.resizeListener);
		
		animated = (animated === undefined ? YES : animated);
		
		(window.Velocity || $.Velocity)(this._blocker, 'stop');
		(window.Velocity || $.Velocity)(this._window, 'stop');
		
		var self = this;

		this._blocker.style.pointerEvents = 'none';
		this._window.style.pointerEvents = 'none';
		
		if (self.delegate && self.delegate.windowWillClose) {
			self.delegate.windowWillClose(self);
		}

		for (const window of this._toolWindows) {
			window.dismissAnimated(animated);
		}
		
		if (animated) {
			
			(window.Velocity || $.Velocity)(this._blocker, {opacity: 0, translateZ: 0}, {
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
            });
            
            let frame = this.frame.copy();
            let sourceFrame = BMRectMakeWithNodeFrame(this._rootNode).integralRect;
            this.node.classList.add('BMLayoutEditorNoShadow');
                
            this._view.node.querySelectorAll('.BMLayoutEditorViewSelector, .BMLayoutEditorConstraint, .BMLayoutEditorVerticalLeadLine, .BMLayoutEditorHorizontalLeadLine')
                .forEach(node => node.remove());

            await 0;

            BMAnimateWithBlock(() => {
                this.leftConstraint.constant = sourceFrame.origin.x;
                this.topConstraint.constant = sourceFrame.origin.y;
                this.widthConstraint.constant = sourceFrame.size.width;
                this.heightConstraint.constant = sourceFrame.size.height;

                this.treeWidthConstraint.constant = 0;
                this.detailsWidthConstraint.constant = 0;
                this.workspaceToolbarHeightConstraint.constant = 0;

                this._staticWorkspaceSize = undefined;
                this.view._requiredViewport = undefined;
        
                this.workspaceLeft.remove();
                this.workspaceTop.remove();
                this.workspaceWidth.remove();
                this.workspaceHeight.remove();
        
                (this.workspaceLeft = this.workspace.left.equalTo(this.workspaceWrapperView.left)).isActive = YES;
                (this.workspaceTop = this.workspace.top.equalTo(this.workspaceWrapperView.top)).isActive = YES;
                (this.workspaceWidth = this.workspace.width.equalTo(this.workspaceWrapperView.width)).isActive = YES;
                (this.workspaceHeight = this.workspace.height.equalTo(this.workspaceWrapperView.height)).isActive = YES;

                this.layout();
                this.panOffset = BMPointMake(0, 0);
                this.scale = 1;

                BMCopyProperties(this.node.style, {
                    left: frame.origin.x + 'px',
                    top: frame.origin.y + 'px',
                    width: frame.size.width + 'px',
                    height: frame.size.height + 'px'
                });

                let controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this.node});
                controller.registerBuiltInProperty('left', {withValue: sourceFrame.origin.x + 'px'});
                controller.registerBuiltInProperty('top', {withValue: sourceFrame.origin.y + 'px'});
                controller.registerBuiltInProperty('width', {withValue: sourceFrame.size.width + 'px'});
                controller.registerBuiltInProperty('height', {withValue: sourceFrame.size.height + 'px'});
                this._frame = frame;
            }, {duration: _BMWindowAnimationDurationDefault, easing: _BMWindowAnimationEasingDefault, complete: () => {

                this._view.layoutEditor = undefined;
                this._rootNode.appendChild(this._view.node);

                this._view.allSubviews.forEach(subview => subview.node.classList.remove('BMLayoutEditorManagedView'));
                
                // TODO Inspect why this is also needed here in new composer
                this._view.node.querySelectorAll('.BMLayoutEditorViewSelector, .BMLayoutEditorConstraint, .BMLayoutEditorVerticalLeadLine, .BMLayoutEditorHorizontalLeadLine')
                    .forEach(node => node.remove());

                //this._view.layout();

            }});


            this._visible = NO;
			
		}
		else {
			this._blocker.style.opacity = 0;
			this._blocker.style.display = 'none';
			
			this._window.style.opacity = 0;
			this._window.style.display = 'none';

            this._visible = NO;

            this._view.layoutEditor = undefined;
            this._rootNode.appendChild(this._view.node);
            
            this._view.node.querySelectorAll('.BMLayoutEditorViewSelector, .BMLayoutEditorConstraint, .BMLayoutEditorVerticalLeadLine, .BMLayoutEditorHorizontalLeadLine')
                .forEach(node => node.remove());

            this._view.allSubviews.forEach(subview => subview.node.classList.remove('BMLayoutEditorManagedView'));
			
			if (self.delegate && self.delegate.windowDidClose) {
				self.delegate.windowDidClose(self);
			}
			if (args && args.completionHandler) args.completionHandler();
		}
	},
	

});

/**
 * Constructs and returns a layout editor that manages the layout constraints of the given view.
 * @param view <BMView>             The view to manage. This view must represent the root of its layout hierarchy.
 * @return <BMLayoutEditor>         A layout editor.
 */
BMLayoutEditor.editorForView = function (view) {
    return (new BMLayoutEditor).initWithView(view);
}

// @endtype

// @type _BMLayoutEditorTree

/**
 * The layout editor tree manages the tree-view sidebar of a layout editor.
 */
function _BMLayoutEditorTree () {} // <constructor>

_BMLayoutEditorTree.prototype = BMExtend(Object.create(BMView.prototype), {
    constructor: _BMLayoutEditorTree,

    /**
     * The DOM node into which this tree will render itself.
     */
    _node: undefined, // <DOMNode>

    /**
     * The root of the view hierarchy displayed by this tree.
     */
    _view: undefined, // <BMView>
    
    /**
     * The editor using this navigation tree.
     */
    _editor: undefined, // <BMLayoutEditor>

    /**
     * A map that maintains the reference between views and their associated DOM nodes
     * in the tree.
     */
    _viewNodeMap: undefined, // <Map<BMView, DOMNode>>

    /**
     * A map that maintains the reference between constraints and their associated DOM nodes
     * in the tree.
     * Unlike views, layout constraints may have multiple associated DOM nodes, one for each
     * view they affect.
     */
    _constraintNodeMap: undefined, // <Map<BMLayoutConstraint, [DOMNode]>>

    /**
     * 
     */
    initWithView(view, args) {
        BMView.prototype.initWithDOMNode.call(this, args.node);
        
        this._view = view;
        this._editor = args.editor;

        this._viewNodeMap = new Map;
        this._constraintNodeMap = new Map;

        this._buildTree();

        return this;
    },

    /**
     * Invoked during initialization to build the tree.
     */
    _buildTree() {
        // Empty the node
        this._node.innerHTML = '';

        // Then re-build the tree
        this._node.appendChild(this.treeNodeForView(this._view));
    },

    /**
     * Constructs and returns the DOM structure for the given view.
     * @param view <BMView>
     * @return <DOMNode>
     */
    treeNodeForView(view) {
        let viewNode = document.createElement('div');
        viewNode.classList.add('BMLayoutTreeView');

        let viewTitle = document.createElement('div');
        viewTitle.classList.add('BMLayoutTreeViewTitle');
        viewTitle.classList.add('BMLayoutTreeViewEntity');
        viewNode.appendChild(viewTitle);

        this._editor.initDragEventListenerForNode(viewTitle, {view: view});

        this._viewNodeMap.set(view, viewTitle);

        let viewDisclosureTriangle = document.createElement('div');
        viewDisclosureTriangle.classList.add('BMDisclosureTriangle');
        viewDisclosureTriangle.classList.add('BMDisclosureTriangleExpanded');
        viewTitle.appendChild(viewDisclosureTriangle);

        viewTitle.appendChild(document.createTextNode(view.debuggingName || view.node.id));

        let viewContainer = document.createElement('div');
        viewContainer.classList.add('BMLayoutTreeViewContainer');
        viewContainer.classList.add('BMLayoutTreeViewContainerExpanded');
        viewNode.appendChild(viewContainer);

        view.subviews.forEach(subview => viewContainer.appendChild(this.treeNodeForView(subview)));

        if (!view.subviews.length) viewDisclosureTriangle.style.visibility = 'hidden';

        let constraintsTitle = document.createElement('div');
        constraintsTitle.classList.add('BMLayoutTreeViewConstraintsTitle');
        constraintsTitle.classList.add('BMLayoutTreeViewEntity');
        constraintsTitle.style.display = 'none';

        let constraintsDisclosureTriangle = document.createElement('div');
        constraintsDisclosureTriangle.classList.add('BMDisclosureTriangle');
        constraintsTitle.appendChild(constraintsDisclosureTriangle);

        constraintsTitle.appendChild(document.createTextNode('Constraints'));
        viewContainer.appendChild(constraintsTitle);


        let constraintsContainer = document.createElement('div');
        constraintsContainer.classList.add('BMLayoutTreeViewConstraintsContainer');
        constraintsContainer.classList.add('BMLayoutTreeViewContainer');
        constraintsContainer.style.display = 'none';
        viewContainer.appendChild(constraintsContainer);

        constraintsDisclosureTriangle.addEventListener('click', event => {
            if (constraintsContainer.classList.contains('BMLayoutTreeViewContainerExpanded')) {
                constraintsContainer.classList.remove('BMLayoutTreeViewContainerExpanded');
                constraintsDisclosureTriangle.classList.remove('BMDisclosureTriangleExpanded');
            } 
            else {
                constraintsContainer.classList.add('BMLayoutTreeViewContainerExpanded');
                constraintsDisclosureTriangle.classList.add('BMDisclosureTriangleExpanded');
            }
            event.stopPropagation();
        });

        viewTitle.addEventListener('click', event => this._editor.selectView(view, {withEvent: event}));

        viewDisclosureTriangle.addEventListener('click', event => {
            if (viewContainer.classList.contains('BMLayoutTreeViewContainerExpanded')) {
                viewContainer.classList.remove('BMLayoutTreeViewContainerExpanded');
                viewDisclosureTriangle.classList.remove('BMDisclosureTriangleExpanded');
            } 
            else {
                viewContainer.classList.add('BMLayoutTreeViewContainerExpanded');
                viewDisclosureTriangle.classList.add('BMDisclosureTriangleExpanded');
            }

            // Prevent this event from selecting the view
            event.stopPropagation();
        });

        view.localConstraints.forEach(constraint => constraintsContainer.appendChild(this.treeNodeForConstraint(constraint, {withReferenceView: view})));

        return viewNode;
    },


    /**
     * Constructs and returns the DOM structure for the given constraint.
     * @param constraint <BMLayoutConstraint>
     * {
     *  @param withReferenceView <BMView>
     * }
     * @return <DOMNode>
     */
    treeNodeForConstraint(constraint, args) {
        let constraintsTitle = document.createElement('div');
        constraintsTitle.classList.add('BMLayoutTreeViewConstraintsTitle');
        constraintsTitle.classList.add('BMLayoutTreeViewEntity');
        constraintsTitle.innerText = constraint.toCompactString();

        constraintsTitle.addEventListener('click', event => this._editor.selectConstraint(constraint, {withReferenceView: args.withReferenceView}));

        let constraintNodes = this._constraintNodeMap.get(constraint);
        if (!constraintNodes) {
            constraintNodes = [];
            this._constraintNodeMap.set(constraint, constraintNodes);
        }
        constraintNodes.push(constraintsTitle);

        return constraintsTitle;
    },

    /**
     * Invoked by the layout editor to mark the given view as selected.
     * This will first cause the currently selected item to be deselected.
     * This only affects the view's display - the actual selection is stored by the layout editor
     * itself.
     * If the given view does not exist in this tree, this method will not select anything.
     * @param view <BMView, nullable>           Defaults to no view. The view to select.
     * {
     *  @param continuous <Boolean, nullable>   Defaults to NO. If set to YES, the view will be added to the current selection.
     * }
     */
    selectView(view, args) {
        !(args && args.continuous) && this._node.querySelectorAll('.BMLayoutTreeViewEntitySelected').forEach(node => node.classList.remove('BMLayoutTreeViewEntitySelected'));

        var node = this._viewNodeMap.get(view);
        if (node) {
            node.classList.add('BMLayoutTreeViewEntitySelected');
        }
    },

    /**
     * Invoked by the layout editor to mark the given view as deselected.
     * This only affects the view's display - the actual selection is stored by the layout editor
     * itself.
     * If the given view does not exist in this tree, this method will not select anything.
     * @param view <BMView, nullable>           Defaults to no view. The view to select.
     */
    deselectView(view, args) {
        var node = this._viewNodeMap.get(view);
        if (node) {
            node.classList.remove('BMLayoutTreeViewEntitySelected');
        }
    },

    /**
     * Invoked by the layout editor to mark the given constraint as selected.
     * This will first cause the currently selected item to be deselected.
     * This only affects the constraint's display - the actual selection is stored by the layout editor
     * itself.
     * If the given constraint does not exist in this tree, this method will not select anything.
     * @param view <BMLayoutConstraint, nullable>           Defaults to no constraint. The constraint to select.
     */
    selectConstraint(constraint) {
        this._node.querySelectorAll('.BMLayoutTreeViewEntitySelected').forEach(node => node.classList.remove('BMLayoutTreeViewEntitySelected'));

        var nodes = this._constraintNodeMap.get(constraint);
        if (nodes) {
            nodes.forEach(node => node.classList.add('BMLayoutTreeViewEntitySelected'));
        }
    },

    /**
     * Invoked by the layout editor to remove the given constraint.
     * @param constraint <BMLayoutConstraint>       The constraint to remove.
     */
    removeConstraint(constraint) {
        var nodes = this._constraintNodeMap.get(constraint);
        if (nodes) {
            nodes.forEach(node => node.remove());
        }
        this._constraintNodeMap.delete(constraint);
    },

    /**
     * Invoked by the layout editor to add the given constraint.
     * @param constraint <BMLayoutConstraint>       The constraint to add.
     */
    addConstraint(constraint) {
        var nodes = [];

        // Get the node for the first view
        var firstView = this._viewNodeMap.get(constraint._firstView);
        if (firstView) {
            let node = this.treeNodeForConstraint(constraint);
            // The constraints container for a view is always the last sibling
            var constraintsNode = firstView.parentNode.childNodes;
            constraintsNode = constraintsNode[constraintsNode.length - 1];

            // Add the constraint node to the document and the nodes map
            constraintsNode.appendChild(node);
            nodes.push(node);
        }

        // Do the same for the second view if it exists
        var secondView = this._viewNodeMap.get(constraint._secondView);
        if (secondView) {
            let node = this.treeNodeForConstraint(constraint);
            var constraintsNode = firstView.parentNode.childNodes;
            constraintsNode = constraintsNode[constraintsNode.length - 1];
            constraintsNode.appendChild(node);
            nodes.push(node);
        }

        // Associate the constraint to the newly added nodes
        this._constraintNodeMap.set(constraint, nodes);
    }

});

/**
 * 
 * @param view <BMView>
 * {
 *  @param node <DOMNode>
 * } 
 * @return <_BMLayoutEditorTree>
 */
_BMLayoutEditorTree.editorTreeWithView = function _BMLayoutEditorTreeMakeWithView(view, args) {
    return (new _BMLayoutEditorTree()).initWithView(view, args);
}

// @endtype


// Indicates that this file and the layout editor are available. Only used when CoreUI is imported globally.
const BMLayoutEditorAvailable = YES;
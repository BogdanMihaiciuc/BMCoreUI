import { YES, NO, BMExtend } from '../Core/BMCoreUI';
import { BMPointMake } from '../Core/BMPoint';
import { BMRectMakeWithNodeFrame } from '../Core/BMRect';
import { BMDropSessionActionKind, BMDragSessionActionKind, _BMDragSessionIconMap, _BMDragSessionDropActionMap, _BMDragDropSessionAction } from './BMDragSessionActions';
import { _BMDragPreviewSet, BMDropPreview } from './BMDragSessionPreview';

// @type BMDragTransferKind

/**
 * A list of constants describing what happens to source objects when they are transferred
 * as part of drag session a different target than the one they were dragged from.
 */
export var BMDragTransferKind = Object.freeze({ // <enum>
	/**
	 * Indicates that the items should be moved from the source to the target. This must
     * be specified by both the source and the target for the movement to take place.
	 */
	Move: 'Move', // <enum>

	/**
	 * Indicates that a copy of the items will be transferred to the target. If either the
     * target or the source of the transfer specifies this transfer kind, a copy is performed
     * regardless of the transfer kind specified by the other.
	 */
	Copy: 'Copy', // <enum>
});

// @endtype

// @type BMDragSessionAction

/**
 * An object that describes the action that should be performed for a drag session when it ends.
 */
export function BMDragSessionAction() {} // <constructor>

BMDragSessionAction.prototype = BMExtend(Object.create(_BMDragDropSessionAction.prototype), {

    /**
     * The action to perform at the end of the drag session.
     */
    get action() { // <BMDragSessionActionKind>
        return this._action;
    },

    /**
     * The message to display on the drag indicator describing the action.
     */
    get message() {
        return this._message;
    },

    /**
     * The HTML message to display on the drag indicator describing the action.
     */
    get messageHTML() {
        return this._messageHTML;
    },

    /**
     * Initializes this drag action with the specified drop action kind. Optionally,
     * a message and an item count override may be provided.
     * @param action <BMDragSessionActionKind>      The action to perform at the end of the drag session.
     * {
     *  @param message <String, nullable>           If specified, an optional message to display on the
     *                                              drag indicator describing the drop action.
     *  @param messageHTML <String, nullable>       If specified, an optional HTML message to display on the
     *                                              drag indicator describing the drop action. If `message` is
     *                                              also specified, this parameter is not used.
     * }
     * @return <BMDragAction>                       This drag action.
     */
    initWithAction(action, args) {
        this._action = action;
        this._message = args?.message;
        if (!args?.message) {
            this._messageHTML = args?.messageHTML;
        }

        return this;
    },
});



/**
 * Creates and initializes a drag action with the specified drag action kind. Optionally,
 * a message and an item override may be provided.
 * @param action <BMDragSessionDropActionKind>  The action to perform at the end of the drag session.
 * {
 *  @param message <String, nullable>           If specified, an optional message to display on the
 *                                              drag indicator describing the drop action.
 *  @param messageHTML <String, nullable>       If specified, an optional HTML message to display on the
 *                                              drag indicator describing the drop action. If `message` is
 *                                              also specified, this parameter is not used.
 * }
 * @return <BMDragSessionAction>                A drag action.
 */
BMDragSessionAction.actionWithKind = function (action, args) {
    return new this().initWithAction(action, args);
};

// @endtype

// @type BMDropSessionAction

/**
 * An object that describes the action that should be performed for a drop session when it ends.
 */
export function BMDropSessionAction() {} // <constructor>

BMDropSessionAction.prototype = BMExtend(Object.create(_BMDragDropSessionAction.prototype), {

    /**
     * The action to perform at the end of the drag session.
     */
    get action() { // <BMDragSessionActionKind>
        return this._action;
    },

    /**
     * The message to display on the drag indicator describing the action.
     */
    get message() {
        return this._message;
    },

    /**
     * The HTML message to display on the drag indicator describing the action.
     */
    get messageHTML() {
        return this._messageHTML;
    },

    /**
     * If specified when the action is `.AcceptPartially`, the drag items that are actually acceptable.
     */
    get acceptableItems() {
        return this._acceptableItems;
    },

    /**
     * Initializes this drop action with the specified drop action kind. Optionally,
     * a message and an item count override may be provided.
     * @param action <BMDropSessionActionKind>      The action to perform at the end of the drop session.
     * {
     *  @param message <String, nullable>           If specified, an optional message to display on the
     *                                              drag indicator describing the drop action.
     *  @param messageHTML <String, nullable>       If specified, an optional HTML message to display on the
     *                                              drag indicator describing the drop action. If `message` is
     *                                              also specified, this parameter is not used.
     *  @param items <[BMDragItem], nullable>       If specified, the items that are acceptable for the current drop target.
     *                                              Requires the `action` to be set to `.AcceptPartially` to take effect.
     *                                              These items must be part of the drag or drop session.
     * }
     * @return <BMDragAction>                       This drop action.
     */
    initWithAction(action, args) {
        this._action = action;
        this._message = args?.message;
        if (!args?.message) {
            this._messageHTML = args?.messageHTML;
        }
        if (action == BMDropSessionActionKind.AcceptPartially) {
            this._acceptableItems = args?.items;
        }

        return this;
    },
});



/**
 * Creates and initializes a drop action with the specified drop action kind. Optionally,
 * a message and an item override may be provided.
 * @param action <BMDragSessionDropActionKind>  The action to perform at the end of the drop session.
 * {
 *  @param message <String, nullable>           If specified, an optional message to display on the
 *                                              drag indicator describing the drop action.
 *  @param messageHTML <String, nullable>       If specified, an optional HTML message to display on the
 *                                              drag indicator describing the drop action. If `message` is
 *                                              also specified, this parameter is not used.
 *  @param items <[BMDragItem], nullable>       If specified, the items that are acceptable for the current drop target.
 *                                              Requires the `action` to be set to `.AcceptPartially` to take effect.
 *                                              These items must be part of the drop session.
 * }
 * @return <BMDropSessionAction>                A drop action.
 */
BMDropSessionAction.actionWithKind = function (action, args) {
    return new this().initWithAction(action, args);
};

// @endtype

// @type BMDragSession implements EventHandlerObject

/**
 * An object that describes an in-progress drag session. Drag sessions are automatically created by
 * views that begin drag operations and supplied to potential drop targets when the drag gesture
 * intersects their frame.
 * 
 * To start a drag session, use the static `beginDragWithEvent` method, passing in the starting
 * event and a delegate object providing the contents of the drag session.
 * 
 * The session can be used to obtain the items that participate in the drag gesture and to update
 * the state and messaging presented to the user.
 */
export function BMDragSession() {} // <constructor>

BMDragSession.prototype = {

    /**
     * The drag delegate of hte object that initiated this drag session.
     */
    _dragDelegate: undefined, // <BMDragDelegate>

    /**
     * The view that initiated this drag session.
     */
    _sourceView: undefined, // <BMView>

    /**
     * The items participating in this drag session.
     */
    _items: undefined, // [BMDragItem]

    get items() {
        return this._items;
    },

    /**
     * An array of nodes corresponding to the previews of the items being dragged.
     * There may be fewer previews than items, and the preview positions in this array
     * correspond 
     */
    _itemPreviews: undefined, // [DOMNode]

    /**
     * The node displaying the items in this drag session.
     */
    _itemCountNode: undefined, // <DOMNode>

    /**
     * The current drop action as specified by the source view.
     */
    _sourceDropAction: undefined, // <BMDragSessionAction>

    /**
     * The current drop action as specified by the target view.
     */
    _targetDropAction: undefined, // <BMDropSessionAction, nullable>

    /**
     * The outcome of ending the drag session at the current position.
     */
    _dropAction: BMDragSessionAction.actionWithKind(BMDragSessionActionKind.Reject), // <_BMDragDropSessionAction>

    /**
     * The final drop action at the end of the session. This property is only accessible since the
     * `dragSessionWillFinish` delegate method is invoked.
     */
    _action: undefined, // <BMDragSessionAction | BMDropSessionAction | undefined>

    get action() {
        return this._action;
    },

    /**
     * The event that started this drag session.
     */
    _startEvent: undefined, // <MouseEvent or TouchEvent>

    /**
     * The touch identifier tracked for this drag session if the session
     * was started via a touch event.
     */
    _touchIdentifier: undefined, // <Number, nullable>

    /**
     * The drag delegate object.
     */
    _delegate: undefined, // <BMDragDelegate>

    /**
     * Initializes this drag session with the specified initial mouse or touch event
     * and drag delegate object.
     * @param event <MouseEvent or TouchEvent>      The initial event that starts this drag session.
     * {
     *  @param dragDelegate <BMDragDelegate>        The drag delegate object providing information about
     *                                              the items in this drag session.
     *  @param view <BMView>                        The view initiating this drag session.
     *  @param touchIdentifier <Number, nullable>   If the event is a touch event, the identifier of the
     *                                              touch that should be tracked for the drag session.
     *                                              If not specified, the first touch will be used instead.
     * }
     * @return <BMDragSession>                      This drag session.
     */
    _initWithEvent(event, {dragDelegate, view, touchIdentifier}) {
        this._dropSessions = new Map();

        this._startEvent = event;
        this._delegate = dragDelegate;
        this._sourceView = view;

        if ('TouchEvent' in window && event instanceof TouchEvent) {
            this._touchIdentifier = touchIdentifier ?? event.changedTouches[0].identifier;
        }

        return this;
    },

    /**
     * The current position of the drag session, relative to the viewport.
     */
    _position: BMPointMake(), // <BMPoint>

    get position() {
        return this._position;
    },

    /**
     * The drag indicator displaying information about the drag and drop session.
     */
    _dragIndicator: undefined, // <_BMDragIndicator, nullable>

    /**
     * The current drop target view, if any.
     */
    _dropTarget: undefined, // <BMView, nullable>

    /**
     * A map containing the views that represent valid drop targets for this session as keys
     * and the drop sessions that were created for each as the associated values.
     */
    _dropSessions: undefined, // <Map<BMView, BMDropSession | BMDragSession>>

    /**
     * For touch drag sessions, an event handler used to determine when a new drop target
     * has been reached as the touch pointer moves over a new drop target.
     */
    _touchDropTargetHandler: undefined, // <void ^(TouchEvent), nullable>

    /**
     * A dictionary of event handlers that have been attached to the source view for which this
     * drag session was created.
     */
    _eventHandlers: undefined, // <Dictionary<unknown>>

    /**
     * The preview set managing the drag previews.
     */
    _previewSet: undefined, // <_BMDragPreviewSet>

    /**
     * An array of drop previews that can be used to customize the drop animation. This property is only
     * initialized at the end of the drag session if the delegate object implemented the
     * `dragSessionRequiresCustomDropAnimationForItems` method and returned `YES` from it when it was
     * invoked.
     */
    _dropPreviews: undefined, // <[BMDropPreview], nullable>

    get dropPreviews() {
        return this._dropPreviews;
    },

    /**
     * The kind of transfer that will be performed. Only set after the `dragSessionWillFinish` delegate
     * method returns if the outcome of the drag and drop gesture is transfer to a different view.
     * `undefined` in all other cases.
     */
    _transferKind: undefined, // <BMDragTransferKind, nullable>

    get transferKind() {
        return this._transferKind;
    },

    /**
     * Sets up the drag previews and indicator and appropriate event handlers and starts tracking
     * a drag originating from the event with which this drag session was initialized.
     */
    _beginDrag() {
        // Notify the delegate that this drag session started
        this._delegate.dragSessionWillBegin?.(this);

        const touchIdentifier = this._touchIdentifier;

		// Create an indicator that shows how many items are being dragged

        // Determine where the drag started from
        const event = this._startEvent;
		if (touchIdentifier !== undefined) {
			for (var i = 0; i < event.changedTouches.length; i++) { 
				if (event.changedTouches[i].identifier == touchIdentifier) {
                    this._position = BMPointMake(
                        event.changedTouches[i].clientX,
                        event.changedTouches[i].clientY,
                    );
					break;
				}
			}
		}
		else {
            this._position = BMPointMake(event.clientX, event.clientY);
		}

        // Request the items that participate in this drag session
        this._items = this._delegate.dragSessionInitialItems(this);

        this._dropSessions.set(this._sourceView, this);

        // Determine the valid drop targets for these items and create the associated
        // drop session for each view that can accept them
        if (this._delegate.dragSessionCanTransferItems?.(this) ?? YES) {
            for (const [view, dropDelegate] of BMDragSession._dropTargets.entries()) {
                // Skip over the source view if it is also a drop target
                if (view == this._sourceView) {
                    continue;
                }

                const dropSession = BMDropSession._sessionForDragSession(this, {delegate: dropDelegate});
                if (dropDelegate.dropSessionCanBegin(dropSession)) {
                    this._dropSessions.set(view, dropSession);
                }
            }
        }

        
        this._initDropTargetHandlers();

        // Determine the offset from the center, if the initial item provides a preview source,
        // otherwise default to centering the drag preview on the pointer
        const firstItemPreview = this._delegate.dragSessionPreviewForItem(this, this._items[0]);
        let pointerOffset = BMPointMake();
        if (firstItemPreview._sourceNode) {
            const sourceNodeFrame = BMRectMakeWithNodeFrame(firstItemPreview._sourceNode);
            const center = sourceNodeFrame.center;
            pointerOffset = BMPointMake(
                (center.x - this._position.x) / sourceNodeFrame.size.width,
                (center.y - this._position.y) / sourceNodeFrame.size.height,
            );
        }

        // Obtain the drag previews for the remaining items
        const previews = [firstItemPreview];
        for (let i = 1; i < this._items.length && previews.length <= BMDragSession._maximumAdditionalDragPreviews; i++) {
            previews.push(this._delegate.dragSessionPreviewForItem(this, this._items[i]));
        }

        // Create the preview set that will manage the drag previews and play the lifting animation
        const previewSet = new _BMDragPreviewSet().initWithPreviews(previews, {pointerOffset});
        previewSet.beginLiftAtPosition(this._position);
        this._previewSet = previewSet;
        this._dragIndicator = previewSet._dragIndicator;
        this._dragIndicator.setAcceptableItemCount(this._items.length);

        // Assume that the drag starts out within the source view and notify the delegate accordingly
        this._dropTarget = this._sourceView;
        this._delegate.dragSessionDidEnter?.(this);
        const action = this._delegate.dragSessionDidUpdate?.(this);
        if (action) {
            this._sourceDropAction = action;
            this._updateDropAction();
        }

        // Register the event that will track the movement of the pointer for this drag session
        window.addEventListener(this._touchIdentifier !== undefined ? 'touchmove' : 'mousemove', this, {capture: YES, passive: NO});

        // Register the event that will track the end of the gesture
        window.addEventListener(this._touchIdentifier !== undefined ? 'touchend' : 'mouseup', this, {capture: YES, passive: NO});
        if (this._touchIdentifier !== undefined) {
            window.addEventListener('touchcancel', this, {capture: YES, passive: NO});
        }

        // Register a key press event that will cancel the drag when escape is pressed
        window.addEventListener('keydown', this, {capture: YES, passive: NO});
    },

    handleEvent(/** @type {MouseEvent | TouchEvent | KeyboardEvent} */ event) {
        if (event.type == 'keydown') {
            this._keyPressedWithEvent(event);
        }
        else if (event.type == 'mousemove' || event.type == 'touchmove') {
            this._dragDidMoveWithEvent(event);
        }
        else {
            this._dragDidFinishWithEvent(event);
        }
    },

    /**
     * Invoked when a key is pressed while this drag session is in progress.
     * @param event <KeyboardEvent>         The event.
     */
    _keyPressedWithEvent(event) {
        // Cancel the drag session when pressing escape or command + .
        if (event.code != 'Escape' && (event.code != 'Period' || !event.metaKey)) {
            return;
        }

        // Clear any drop target, set the drop action to ignore and immediately finish the session
        event.stopPropagation();
        event.preventDefault();
        this._setDropTarget(undefined);
        this._sourceDropAction = BMDragSessionAction.actionWithKind(BMDragSessionActionKind.Ignore);
        this._updateDropAction();

        this._dragDidFinishWithEvent(event);
    },

    /** 
     * Invoked whenever the pointer moves while this drag session is in progress.
     * @param event <MouseEvent or TouchEvent>       The event.
     */
    _dragDidMoveWithEvent(event) {
        event.preventDefault();
        
        let position;
        const touchIdentifier = this._touchIdentifier;
        if (touchIdentifier !== undefined) {
            // Verify, when handling touch events, that the pointer assigned to the drag event did change
            event.preventDefault();
            for (var i = 0; i < event.changedTouches.length; i++) { 
                if (event.changedTouches[i].identifier == touchIdentifier) {
                    position = BMPointMake(
                        event.changedTouches[i].clientX,
                        event.changedTouches[i].clientY,
                    );
                    break;
                }
            } 
            
            // If the tracked touch did not change, ignore this touchmove event
            if (i == event.changedTouches.length) {
                return;
            }
        }
        else {
            position = BMPointMake(event.clientX, event.clientY);
        }

        this._position = position;

        // Update the positions of the dragging preview
        this._previewSet.setPosition(position);

        // Dispatch an update to the source view, and to the current drop target, if any
        // then update the drop action accordingly
        const sourceAction = this._delegate.dragSessionDidUpdate?.(this);
        let targetAction;

        if (this._dropTarget && this._dropTarget != this._sourceView) {
            const session = this._dropSessions.get(this._dropTarget);
            targetAction = session._delegate.dropSessionDidUpdate?.(session);
            if (targetAction) {
                // If the target action is delete, the source delegate must be able to specify
                // a transfer of kind move
                if (targetAction._action == BMDropSessionActionKind.Delete) {
                    const transferKind = this._delegate.dragSessionTransferKind(this);
                    if (transferKind != BMDragTransferKind.Move) {
                        targetAction = BMDropSessionAction.actionWithKind(BMDropSessionActionKind.Ignore);
                    }
                }

                session._dropAction = targetAction;
            }
        }

        if (sourceAction) {
            this._sourceDropAction = sourceAction;
        }
        if (targetAction) {
            this._targetDropAction = targetAction;
        }

        if (sourceAction || targetAction) {
            this._updateDropAction();
        }
    },

    /**
     * Invoked when the pointer is released or cancelled while this drag session is in progress.
     * @param event <MouseEvent or TouchEvent or KeyboardEvent> The event.
     * @return <Promise<void>>                                  A promise that resolves when all associated animations finish.
     */
    async _dragDidFinishWithEvent(event) {
        event.preventDefault();

        this._action = this._dropAction;

        // Instruct the delegates that the session is about to end
        this._delegate.dragSessionWillFinish?.(this);

        for (const [view, session] of this._dropSessions.entries()) {
            if (view == this._sourceView) {
                continue;
            }
            session._delegate.dropSessionWillFinish?.(this);
        }

        // Clear out the event listeners
        window.removeEventListener(this._touchIdentifier !== undefined ? 'touchmove' : 'mousemove', this, {capture: YES, passive: NO});
        window.removeEventListener(this._touchIdentifier !== undefined ? 'touchend' : 'mouseup', this, {capture: YES, passive: NO});
        if (this._touchIdentifier !== undefined) {
            window.removeEventListener('touchcancel', this, {capture: YES, passive: NO});
        }
        window.removeEventListener('keydown', this, {capture: YES, passive: NO});
        this._releaseDropTargetHandlers();

        // If there is a drop target and its action is not ignore, instruct the delegate to perform the action
        if (this._dropTarget && this._dropTarget != this._sourceView) {
            const session = this._dropSessions.get(this._dropTarget);
            if ((session._dropAction?._action ?? BMDropSessionActionKind.Ignore) != BMDropSessionActionKind.Ignore) {
                // Determine whether the delegate wants to handle the drop animation for the acceptable items
                let acceptableItems = this._items;
                if (session._dropAction._action == BMDropSessionActionKind.AcceptPartially) {
                    acceptableItems = session._dropAction._acceptableItems ?? acceptableItems;
                }
                else if (session._dropAction._action == BMDropSessionActionKind.Reject) {
                    acceptableItems = [];
                }

                // A transfer only occurs if the action is to accept or accept partially
                const isTransfer = [BMDropSessionActionKind.Accept, BMDropSessionActionKind.AcceptPartially].includes(session._dropAction?._action);

                // Request the transfer kind from both delegates and set it to move if both of the specify a transfer kind of move,
                // defaulting to copy if either of them provides a different response
                let transferKind = BMDragTransferKind.Copy;
                if (isTransfer) {
                    const sourceTransferKind = this._delegate.dragSessionTransferKind?.(this) ?? BMDragTransferKind.Copy;
                    const targetTransferKind = session._delegate.dropSessionTransferKind?.(session) ?? BMDragTransferKind.Copy;

                    if (sourceTransferKind == BMDragTransferKind.Move && targetTransferKind == BMDragTransferKind.Move) {
                        transferKind = BMDragTransferKind.Move;
                    }
                }

                this._transferKind = transferKind;
                session._transferKind = transferKind;

                const transferItems = acceptableItems;

                acceptableItems = acceptableItems.filter(i => this._previewSet._dragPreviews.get(i));
                let requiresTargetDropPreviews = NO;
                
                // Custom animations are only supported for accepted items
                if (isTransfer) {
                    requiresTargetDropPreviews = session._delegate.dropSessionRequiresCustomDropAnimationForItems?.(session, acceptableItems.slice());
                }

                let requiresSourceDropPreviews = NO;
                const unacceptableItems = [...this._previewSet._dragPreviews.keys()].filter(i => !acceptableItems.includes(i));
                // If there are still items that are not accepted, ask the drag delegate if it performs a custom animation
                if (transferItems.length != this._items.length && unacceptableItems.length) {
                    requiresSourceDropPreviews = this._delegate.dragSessionRequiresCustomDropAnimationForItems?.(this, unacceptableItems.slice());
                }

                session._dropItems = transferItems;

                // If a custom animation is required, create the drop previews
                if (requiresTargetDropPreviews) {
                    session._dropPreviews = acceptableItems.map(i => {
                        const dragPreview = this._previewSet._dragPreviews.get(i);
                        dragPreview._dropHandled = YES;
                        return new BMDropPreview()._initWithDragPreview(dragPreview, {forItem: i});
                    });
                }

                // If the source requires a custom animation, create the drop previews
                if (requiresSourceDropPreviews) {
                    this._dropPreviews = unacceptableItems.map(i => {
                        const dragPreview = this._previewSet._dragPreviews.get(i);
                        dragPreview._dropHandled = YES;
                        return new BMDropPreview()._initWithDragPreview(dragPreview, {forItem: i});
                    });

                    this._delegate.dragSessionAnimateDropWithPreviews?.(this, this._dropPreviews);
                }

                // If both delegates request a move, instruct the source delegate to remove the items that will be transferred
                if (transferKind == BMDragTransferKind.Move && transferItems.length) {
                    this._delegate.dragSessionPerformMoveForItems(this, transferItems);
                }

                session._delegate.dropSessionPerformDrop(session);
            }
        }
        else {
            if (this._dropAction._action == BMDragSessionActionKind.Delete) {
                // If the source view has specified an action to delete, instruct it to delete the items now
                this._delegate.dragSessionPerformDelete(this);
            }
            else {
                // Otherwise ask the delegate if it wants to handle the drop animation
                const items = [...this._previewSet._dragPreviews.keys()];
                const requiresDropPreviews = this._delegate.dragSessionRequiresCustomDropAnimationForItems?.(this, items.slice());

                if (requiresDropPreviews) {
                    this._dropPreviews = this._previewSet._dragPreviews.entries().map(([i, dragPreview]) => {
                        dragPreview._dropHandled = YES;
                        return new BMDropPreview()._initWithDragPreview(dragPreview, {forItem: i});
                    });

                    this._delegate.dragSessionAnimateDropWithPreviews?.(this, this._dropPreviews);
                }
            }
        }

        // Perform the drop animation and detach the previews
        this._previewSet.performDrop().then(() => {
            // At the end of the associated animations, let the delegates know that the session
            // has completely finished
            this._delegate.dragSessionDidFinish?.(this);

            for (const [view, session] of this._dropSessions.entries()) {
                if (view == this._sourceView) {
                    continue;
                }
                session._delegate.dropSessionDidFinish?.(this);
            }
        });
    },

    /**
     * Sets up the event handlers that are used to determine when the drag moves over one
     * of the valid drop targets.
     */
    _initDropTargetHandlers() {
        if (this._touchIdentifier) {
            // For touch drag session, mouseover and mouseout cannot be used as there are no mouse events or equivalents for touch events
            // Instead, throughout the drag operation, the pointer's position is converted into the topmost node and if that node
            // is a child of any collection view, that collection view becomes the drop target
            // This handler is installed globally and will affect all possible drop targets
            this._touchDropTargetHandler = event => {
                let clientX, clientY;
                for (var i = 0; i < event.changedTouches.length; i++) { 
                    if (event.changedTouches[i].identifier == this._touchIdentifier) {
                        clientX = event.changedTouches[i].clientX;
                        clientY = event.changedTouches[i].clientY;
                        break;
                    }
                } 
                
                // If the tracked touch did not change, ignore this touchmove event
                if (i == event.changedTouches.length) return NO;

                // Get the node corresponding to the current point
                let node = document.elementFromPoint(clientX, clientY);

                // Check if that node belongs to one of the drop targets
                let target;
                if (node) {
                    for (const view of this._dropSessions.keys()) {
                        if (view.node.contains(node)) {
                            target = view;
                            break;
                        }
                    }
                }

                // Update the drop target based on what was discovered
                if (target != this._dropTarget) {
                    this._setDropTarget(target);
                }
            };

            window.addEventListener('touchmove', this._touchDropTargetHandler, {capture: YES, passive: NO});
        }
        else {
            // For mouse drag sessions, use "mouseenter" and "mouseleave" to determine when the drop target changes
            for (const [view, session] of this._dropSessions.entries()) {
                session._eventHandlers = {
                    mouseenter: event => {
                        this._setDropTarget(view);

                        event.preventDefault();
                        event.stopPropagation();
                        return NO;
                    },

                    mouseleave: event => {
                        this._setDropTarget(undefined);
                        
                        event.preventDefault();
                        event.stopPropagation();
                        return NO;
                    }
                };

                for (const key in session._eventHandlers) {
                    view.node.addEventListener(key, session._eventHandlers[key]);
                }
            }
        }
    },

    /**
     * Removes the event handlers used to determine the drop target that have been set up for this drag session.
     */
    _releaseDropTargetHandlers() {
        if (this._touchIdentifier) {
            window.removeEventListener('touchmove', this._touchDropTargetHandler, {capture: YES, passive: NO});
        }
        else {
            for (const [view, session] of this._dropSessions.entries()) {
                for (const key in session._eventHandlers) {
                    view.node.removeEventListener(key, session._eventHandlers[key]);
                }
            }
        }
    },

    /**
     * An identifier for the timeout registered to update the item previews after the
     * drag gesture moves over a new drop target.
     */
    _itemPreviewsUpdateIdentifier: undefined, // <Number, nullable>

    /**
     * Updates the drop target, invoking the appropriate method on the delegate objects.
     * @param target <BMView, nullable>     The current drop target, or `undefined` if the drag gesture
     *                                      is not currently over any drop target.
     */
    _setDropTarget(target) {
        if (target == this._dropTarget) {
            // Don't take any action if the target doesn't actually change
            return;
        }

        // Let the delegate of the current drop target know that the drag exited its bounds
        if (this._dropTarget) {
            if (this._dropTarget == this._sourceView) {
                this._delegate.dragSessionDidExit?.(this);
                this._targetDropAction = undefined;
            }
            else {
                const session = this._dropSessions.get(this._dropTarget);
                session._delegate.dropSessionDidExit?.(session);
            }
        }

        // Let the delegate of the new drop target know that the drag entered its bounds
        // Also dispatch a movement update to the delegate and obtain the drop outcome
        this._dropTarget = target;
        if (target) {
            if (target == this._sourceView) {
                this._delegate.dragSessionDidEnter?.(this);

                const action = this._delegate.dragSessionDidUpdate?.(this);
                if (action) {
                    this._sourceDropAction = action;
                }
            }
            else {
                const session = this._dropSessions.get(target);
                session._delegate.dropSessionDidEnter?.(session);

                let action = session._delegate.dropSessionDidUpdate?.(session) ?? BMDropSessionAction.actionWithKind(BMDropSessionActionKind.Ignore);

                // If the target action is delete, the source delegate must be able to specify
                // a transfer of kind move
                if (action._action == BMDropSessionActionKind.Delete) {
                    const transferKind = this._delegate.dragSessionTransferKind(this);
                    if (transferKind != BMDragTransferKind.Move) {
                        action = BMDropSessionAction.actionWithKind(BMDropSessionActionKind.Ignore);
                    }
                }

                this._targetDropAction = action;
                session._dropAction = action;

                const sourceAction = this._delegate.dragSessionDidUpdate?.(this);
                if (action) {
                    this._sourceDropAction = sourceAction;
                }

                this._updateDropAction();
            }
        }
        else {
            this._targetDropAction = undefined;
            this._updateDropAction();
        }

        // If an item preview update was already registered, don't take any further action
        if (this._itemPreviewsUpdateIdentifier) {
            return;
        }

        // Else register an item preview update after a short delay to account for situations where
        // the gesture immediately exits and enters a new drop target
        this._itemPreviewsUpdateIdentifier = setTimeout(() => {
            this._itemPreviewsUpdateIdentifier = undefined;

            const newPreviews = new Map();
            if (this._dropTarget && this._dropTarget != this._sourceView) {
                // If there is a valid drop target, request item previews and apply them
                const session = this._dropSessions.get(this._dropTarget);
                for (const item of this._previewSet._baseDragPreviews.keys()) {
                    const preview = session._delegate.dropSessionPreviewForItem?.(session, item);
                    newPreviews.set(item, preview);
                }
            }
            else {
                // Otherwise reset the previews
                for (const item of this._previewSet._baseDragPreviews.keys()) {
                    newPreviews.set(item, undefined);
                }
            }

            this._previewSet.updatePreviewsWithMap(newPreviews);
        }, 16);
    },

    /**
     * Updates the drop action displayed by this drag session, based on the current
     * source and target drop actions.
     */
    _updateDropAction() {
        let action;
        // If the target specifies a drop action that is not ignore, display it
        if (this._targetDropAction && this._targetDropAction._action != BMDropSessionActionKind.Ignore) {
            action = this._targetDropAction;
        }
        else {
            action = this._sourceDropAction ?? BMDragSessionAction.actionWithKind(BMDragSessionActionKind.Ignore);
        }

        if (action == this._dropAction) {
            return;
        }

        this._dropAction = action;

        if (action._action == BMDropSessionActionKind.AcceptPartially && action._acceptableItems) {
            if (action._acceptableItems.length == 0) {
                // If the action is specified as accept partially but all items are rejected, interpret
                // the action as rejecting the drop
                action = BMDropSessionAction.actionWithKind(BMDropSessionActionKind.Reject, {
                    message: action._message,
                    messageHTML: action._messageHTML,    
                });
                this._dropAction = action;

                this._dragIndicator.setAcceptableItemCount(this._items.length);
                this._previewSet.setRejectedItems(undefined);
            }
            else if (action._acceptableItems.length == this._items.length) {
                // If the action is specified as accept partially but all items are accepted, interpret
                // the action as accepting the drop
                action = BMDropSessionAction.actionWithKind(BMDropSessionActionKind.Accept, {
                    message: action._message,
                    messageHTML: action._messageHTML,    
                });
                this._dropAction = action;

                this._dragIndicator.setAcceptableItemCount(this._items.length);
                this._previewSet.setRejectedItems(undefined);
            }
            else {
                this._dragIndicator.setAcceptableItemCount(action._acceptableItems.length);
                
                // If all items with previews are rejected, request and display an additional preview for
                // the first acceptable item
                let requiresAdditionalPreview = YES;
                const rejectedItems = this._items.filter((item, index) => {
                    const rejected = !action._acceptableItems.includes(item);

                    if (!rejected && index < BMDragSession._maximumAdditionalDragPreviews + 1) {
                        requiresAdditionalPreview = NO;
                    }

                    return rejected;
                });

                // If an additional preview is required, obtain and display it, otherwise clear any current additional preview
                if (requiresAdditionalPreview) {
                    const item = action._acceptableItems[0];

                    if (this._previewSet._additionalPreview?._dragItem != item) {
                        // If the preview set is not already displaying an additional preview for this item, update it
                        if (!this._dropTarget || this._dropTarget == this._sourceView) {
                            const preview = this._delegate.dragSessionPreviewForItem(this, item);
                            this._previewSet.setAdditionalPreview(preview);
                        }
                        else {
                            const session = this._dropSessions.get(this._dropTarget);
                            let preview = session._delegate.dropSessionPreviewForItem?.(session, item);
                            preview ??= this._delegate.dragSessionPreviewForItem(this, item);
                            this._previewSet.setAdditionalPreview(preview);
                        }
                    }
                }
                else {
                    this._previewSet.setAdditionalPreview(undefined);
                }

                this._previewSet.setRejectedItems(rejectedItems);
            }
        }
        else {
            this._dragIndicator.setAcceptableItemCount(this._items.length);
            this._previewSet.setRejectedItems(undefined);
            this._previewSet.setAdditionalPreview(undefined);
        }

        this._dragIndicator.setAction(action);
    },

}

/**
 * Starts a drag and drop session from the specified mouse or touch event.
 * using a delegate to supply information about the items that are being transferred.
 * @param event <MouseEvent or TouchEvent>      The event starting the drag.
 * {
 *  @param dragDelegate <BMDragDelegate>        The delegate object providing information about the
 *                                              items being dragged.
 *  @param view <BMView>                        The view initiating this drag session.
 *  @param touchIdentifier <Number, nullable>   If the event is a touch event, the identifier of the
 *                                              touch that should be tracked for the drag session.
 *                                              If not specified, the first touch will be used instead.
 * }
 */
BMDragSession._beginDragWithEvent = function (event, args) {
    // Create and initialize a drag session for the specified event
    // The drag session object will handle the events after creation
    const session = new BMDragSession()._initWithEvent(event, args);
    session._beginDrag();
};

// The maximum number of additional drag previews for multi-item drag sessions that can be displayed
// in addition to the drag preview of the first item.
BMDragSession._maximumAdditionalDragPreviews = 10; // <Number>

/**
 * Sets the maximum number of additional drag previews for multi-item drag sessions that can be displayed
 * in addition to the drag preview of the first item. Updating this value only affects drag sessions
 * started after this method returns.
 * @param max <Number>          The new maximum number of previews to display.
 */
BMDragSession.setMaximumAdditionalDragPreviews = function (max) {
    BMDragSession._maximumAdditionalDragPreviews = max;
};

/**
 * A map containing views that are drop targets as keys and their associated drop delegate objects as values.
 */
BMDragSession._dropTargets = new Map();

/**
 * Registers a view as a potential drop target for future drag sessions, using the specified delegate
 * to handle updates to the associated drop sessions and the drop actions.
 * 
 * If the view is already registered as a drop target, this will replace the delegate handling future
 * drop sessions for the view with the specified object.
 * @param target <BMView>               The view that will act as a drop target.
 * {
 *  @param delegate <BMDropDelegate>    The delegate that will handle actions and events from the drop
 *                                      session on behalf of the target view.
 * }
 */
BMDragSession.registerDropTarget = function (target, args) {
    this._dropTargets.set(target, args.delegate);
};

/**
 * Unregisters a view as a potential drop target for future drag sessions. This has no effect on any
 * in-progress drop sessions which will continue using the previously registered delegate to handle
 * events and actions.
 * 
 * This method has no effect if the view is not registered as a drop target.
 * @param target <BMView>               The view that was previously registered as a drop target.
 */
BMDragSession.unregisterDropTarget = function (target) {
    this._dropTargets.delete(target);
};

// @endtype

// @type BMDropSession

function BMDropSession() {} // <constructor>

BMDropSession.prototype = {

    /**
     * The drag session managing the drag gesture for which this drop session was created.
     */
    _dragSession: undefined, // <BMDragSession>

    /**
     * The drop delegate specifying the behaviour of the drop over this drop target.
     */
    _delegate: undefined, // <BMDropDelegate>

    /**
     * A dictionary of event handlers that have been attached to the drop target view for which this
     * drop session was created.
     */
    _eventHandlers: undefined, // <Dictionary<unknown>>

    /**
     * The current drop action.
     */
    _dropAction: BMDropSessionAction.actionWithKind(BMDropSessionActionKind.Ignore), // <BMDropSessionAction>

    get dropAction() {
        return this._dropAction;
    },

    /**
     * An array of drop previews that can be used to customize the drop animation. This property is only
     * initialized at the end of accepted drop sessions if the delegate object implemented the
     * `dropSessionRequiresCustomDropAnimationForItems` method and returned `YES` from it.
     */
    _dropPreviews: undefined, // <[BMDropPreview], nullable>

    get dropPreviews() {
        return this._dropPreviews;
    },

    /**
     * The kind of transfer that will be performed. Only set before the `dropSessionPerformDrop` delegate
     * method is invoked if the outcome of this drop session is a transfer of items into the target view.
     */
    _transferKind: undefined, // <BMDragTransferKind, nullable>

    get transferKind() {
        return this._transferKind;
    },

    /**
     * Initializes this drop session with the specified drag session and the drop delegate.
     * @param session <BMDragSession>           The drag session associated with this drop session
     * {
     *  @param delegate <BMDropDelegate>        The drop delegate used to determine the outcome of the drop.
     * }
     * @returns <BMDropSession>                 This drop session.
     */
    _initWithDragSession(session, {delegate}) {
        this._dragSession = session;
        this._delegate = delegate;
        return this;
    },

    /**
     * The current position of the drag and drop gesture.
     */
    get position() { // <BMPoint>
        return this._dragSession.position;
    },

    /**
     * The items being transferred in the drag and drop gesture.
     */
    get items() { // <[BMDragItem]>
        return this._dragSession.items;
    },

    /**
     * The items that have been accepted through this drop session. This property is only initialized
     * before the `dropSessionPerformDrop` delegate method is invoked.
     */
    _dropItems: undefined, // <[BMDragItem], nullable>

    get dropItems() {
        return this._dropItems;
    },

};

/**
 * Creates and returns a drop session initialized with the specified drag session and the drop delegate.
 * @param session <BMDragSession>           The drag session associated with the drop session
 * {
 *  @param delegate <BMDropDelegate>        The drop delegate used to determine the outcome of the drop.
 * }
 * @returns <BMDropSession>                 A drop session.
 */
BMDropSession._sessionForDragSession = function (session, args) {
    return new BMDropSession()._initWithDragSession(session, args);
};

// @endtype
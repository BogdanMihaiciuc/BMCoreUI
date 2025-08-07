// @type interface BMDragDelegate

/**
 * The specification of a `BMDragDelegate` object which is used to obtain information about a dragging session
 * from the object that starts it and customize its behaviour depending on its position in the viewport.
 */
function BMDragDelegate() {} // <constructor>

BMDragDelegate.prototype = {
    
    /**
     * Invoked at the beginning of a drag session to obtain the initial items that will be
     * part of the drag session.
     * 
     * The delegate object implementing this method must provide an array of drag items that
     * will be transferred as part of the drag session. The array must contain at least one item.
     * @param session <BMDragSession>       The drag session that is starting.
     * @returns <[BMDragItem]>              An array of drag items that will be part of the drag session.
     */
    /*required*/ dragSessionInitialItems: function (session) {},

    /**
     * Invoked by a drag session to obtain a preview for the specified drag item at the beginning
     * of a drag session. The drag session will invoke this method only for the first few items
     * that will be visible while the drag session is in progress.
     * 
     * Delegate objects implementing this method must provide an appropriate preview for the
     * specified item by returning a {@link BMDragPreview} object initialized for the specified
     * drag item.
     * @param session <BMDragSession>       The drag session for which to supply an item preview.
     * @param item <BMDragItem>             An item that is part of the drag session whose preview
     *                                      should be provided.
     * @returns <BMDragPreview>             The preview that will be displayed for the item.
     */
    /*required*/ dragSessionPreviewForItem: function (session, item) {},

    /**
     * Invoked when a drag session is about to end and there items that will not be transferred to determine if
     * the drag delegate wants to play a customized drop animation for the specified items which for
     * which drag previews are currently displayed. This method is only invoked if there is at least one item
     * with a preview that will not be transferred or deleted as part of the drag session.
     * 
     * Implementing and returning `YES` from this method will cause the drag session to not play the
     * standard drop animation for the specified items. Instead, in the `dragSessionAnimateDropWithPreviews`,
     * `dragSessionPerformMoveForItems` and `dragSessionPerformDelete` methods,
     * the drag session's `dropPreviews` property will contain an array of drag previews that can be
     * used to obtain a reference to the preview elements and use them to play an appropriate drop animation.
     * @param session <BMDragSession>       The drag session.
     * @param items <[BMDragItem]>          The items that have not been accepted for transferring or deleted.
     * @returns <Boolean>                   `NO` to play the standard drop animation, or `YES` to play
     *                                      a customized drop animation.
     */
    dragSessionRequiresCustomDropAnimationForItems(session, items) {},

    /**
     * Invoked after returning `YES` from `dragSessionRequiresCustomDropAnimationForItems` to play a drop animation
     * for the specified drop previews. Delegate objects implementing this method should play an appropriate drop animation
     * for the specified drop previews, then detach them from the document.
     * @param session <BMDragSession>       The drag session for which to play the drop animation.
     * @param previews <[BMDropPreview]>    The drop previews that should be animated.
     */
    dragSessionAnimateDropWithPreviews(session, previews) {},

    /**
     * Invoked by a drag session after a drop target accepts or partially accepts the items in the session
     * and both this delegate and the associated drop delegate have specified that the transfer should
     * be a transfer of kind `.Move`.
     * 
     * Delegate objects that support moving items must implement this method and remove the specified
     * items that have been moved into the drop target.
     * @param session <BMDragSession>           The drag session through which items have been moved.
     * @param items <[BMDragItem]>              The items that have been moved into the drop target. These
     *                                          may be a subset of the session's items if the drop target
     *                                          has specified a drop action of `.AcceptPartially`.
     */
    dragSessionPerformMoveForItems(session, items) {},

    /**
     * Invoked by a drag session if a drop occurs in a location where this delegate has specified that
     * the action should be to delete the items.
     * 
     * Delegate objects that support deleting items must implement this method and remove all items in
     * the drag session.
     * @param session <BMDragSession>       The drag session through which the items have been removed.
     */
    dragSessionPerformDelete(session) {},

    /**
     * Invoked by a drag session to determine if items can be transferred to other drop targets.
     * 
     * Delegate objects implementing this method should return a boolean indicating whether
     * transfers can be performed or not. A return value of `YES` is assumed when this method
     * is not implemented by the delegate object.
     * @param session <BMDragSession>       The drag session that will be transferring items.
     * @return <Boolean>                    `YES` if item transfer is supported, `NO` otherwise.
     */
    dragSessionCanTransferItems(session) {},

    /**
     * Invoked by a drag session that is about to begin from this delegate.
     * @param session <BMDragSession>       The drag session that is about to begin.
     */
    dragSessionWillBegin(session) {},

    /**
     * Invoked when a drag session enters the frame of the source view.
     * @param session <BMDragSession>       The drag session that entered the view's frame.
     */
    dragSessionDidEnter(session) {},

    /**
     * Invoked by a drag session whenever its position is updated. This method is continually
     * invoked as the drag position changes, even while the gesture moves outside of the
     * source view's frame.
     * Delegates implementing this method should return a drop action indicating the outcome of
     * dropping the items at the session's current position.
     * @param session <BMDragSession>           The drag session. Its position may be retrieved via
     *                                          the `position` property.
     * @return <BMDragSessionAction, nullable>  The new action the source view would like to perform if the
     *                                          drop session ended at the current position, or `undefined`
     *                                          if the current action should be retained.
     */
    dragSessionDidUpdate(session) {},

    /**
     * Invoked when a drag session exits the frame of the source view.
     * @param session <BMDragSession>           The drag session that exited the view's frame.
     */
    dragSessionDidExit(session) {},

    /**
     * Invoked by a drag session to obtain the kind of transfer to perform for the items being dragged.
     * This method is invoked when the drop occurs on a drop target that accepted the transfer or whenever
     * a drop requests a drop action that requires a specific transfer kind.
     * 
     * Delegate objects implementing this method should return an appropriate transfer kind for
     * the items. When this method is not implemented, the transfer defaults to a `.Copy` transfer.
     * @param session <BMDragSession>       The drag session through which the item transfer was performed.
     * @return <BMDragTransferKind>         The kind of transfer to perform.
     */
    dragSessionTransferKind(session) {},

    /**
     * Invoked by a drag session that is about to finish.
     * 
     * Delegate objects may optionally implement this method to perform any necessary cleanup
     * before the drag session ends.
     * @param session <BMDragSession>                           The drag session.
     */
    dragSessionWillFinish(session) {},

    /**
     * Invoked by a drag session that has finished and all associated animations have concluded.
     * 
     * Delegate objects may optionally implement this method to perform any necessary cleanup
     * before the drag session ends.
     * @param session <BMDragSession>                           The drag session.
     */
    dragSessionDidFinish(session) {},

}

// @endtype

// @type interface BMDropDelegate

/**
 * The specification of a `BMDropDelegate` object which is used to obtain information about
 * whether a drag session can be accepted by potential drop targets and to customize the information
 * presented to users as the drag moves over the drop area.
 */
function BMDropDelegate() {} // <constructor>

BMDropDelegate.prototype = {

    /**
     * Invoked when a drag session starts to verify if the target view can accept the items
     * in the specified drop session. When returning `YES` from this method, the view will
     * be considered a valid drop target for the session and will receive updates when the
     * drag will enter the view's frame.
     * @param session <BMDropSession>       The drop session containing the items to be verified.
     * @returns <Boolean>                   `YES` if at least one item is acceptable for dropping,
     *                                      `NO` otherwise.
     */
    /*required*/ dropSessionCanBegin: function (session) {},

    /**
     * Invoked when a drop session ends while in the target view's frame. Delegate objects implementing
     * this method should perform the appropriate changes based on the session's drop action.
     * @param session <BMDropSession>       The drop session for which to perform the drop action.
     */
    /*required*/ dropSessionPerformDrop: function (session) {},

    /**
     * Invoked when a drop session is about to end while in the target view's frame to determine if
     * the drop delegate wants to play a customized drop animation for the specified items which for
     * which drag previews are currently displayed. This method is only invoked if the specified drop
     * action is `.Accept` or `.AcceptPartially`.
     * 
     * Implementing and returning `YES` from this method will cause the drop session to not play the
     * standard drop animation for the specified items. Instead, in the `dropSessionPerformDrop` method,
     * the drop session's `dropPreviews` property will contain an array of drop previews that can be
     * used to obtain a reference to the preview elements and use them to play an appropriate drop animation.
     * @param session <BMDropSession>       The drop session.
     * @param items <[BMDragItem]>          The items that have been accepted by the drop target and which
     *                                      have drag previews associated with them.
     * @returns <Boolean>                   `NO` to play the standard drop animation, or `YES` to play
     *                                      a customized drop animation.
     */
    dropSessionRequiresCustomDropAnimationForItems(session, items) {},

    /**
     * Invoked by a drop session to obtain the kind of transfer to perform for the items being dragged.
     * This method is invoked when the drop occurs on a drop target that accepted the transfer.
     * Delegate objects implementing this method should return an appropriate transfer kind for
     * the items. When this method is not implemented, the transfer defaults to a `.Copy` transfer.
     * @param session <BMDropSession>       The drop session through which the item transfer was performed.
     * @return <BMDragTransferKind>         The kind of transfer to perform.
     */
    dropSessionTransferKind(session) {},

    /**
     * Invoked when a drop session enters the frame of the target view.
     * @param session <BMDropSession>       The drop session that entered the view's frame.
     */
    dropSessionDidEnter(session) {},

    /**
     * Invoked by a drop session whenever it updates while over the target view's frame. This method
     * is invoked when the session enters the frame and whenever it moves.
     * Delegates implementing this method should return a drop action indicating the outcome of
     * dropping the items at the session's current position.
     * @param session <BMDropSession>           The drop session that updated.
     * @return <BMDropSessionAction, nullable>  The new action the target view would like to perform if the
     *                                          drop session ended at the current position, or `undefined`
     *                                          if the current action should be retained.
     */
    dropSessionDidUpdate(session) {},

    /**
     * Invoked when a drop session exits the frame of the target view. Subsequent updates for this drop
     * session will no longer be provided until the drop session moves into the target view again.
     * @param session <BMDropSession>           The drop session that exited the view's frame.
     */
    dropSessionDidExit(session) {},

    /**
     * Invoked to notify the delegate that the specified drop session is about to finish. This is invoked for a drop
     * delegate that has returned `YES` from `dropSessionCanBegin` regardless of whether the drop finished
     * in the target view's frame or not.
     * @param session <BMDropSession>           The drop session that ended.
     */
    dropSessionWillFinish(session) {},

    /**
     * Invoked to notify the delegate that the specified drop session has finished. This is invoked for a drop
     * delegate that has returned `YES` from `dropSessionCanBegin` regardless of whether the drop finished
     * in the target view's frame or not.
     * @param session <BMDropSession>           The drop session that ended.
     */
    dropSessionDidFinish(session) {},

    /**
     * Invoked by a drop session to obtain a preview for the specified drag item while the session is in
     * the target view's frame.
     * 
     * Delegate objects implementing this method may provide an appropriate preview for the
     * specified item by returning a {@link BMDragPreview} object initialized for the specified
     * drag item. When this method is not implemented, or when returning `undefined`, the preview
     * already in use for the item will continue to be used while the session is the target view's frame.
     * @param session <BMDropSession>       The drop session for which to supply an item preview.
     * @param item <BMDragItem>             An item that is part of the drop session whose preview
     *                                      should be provided.
     * @returns <BMDragPreview, nullable>   If specified, the preview that will be displayed for the item.
     *                                      If omitted, the current preview will continue to be used.
     */
    dropSessionPreviewForItem(session, item) {},

};

// @endtype

// @type interface BMDragItem

/**
 * A provider that can supply the contents of an item that is part of a drag and drop gesture
 * in various representations.
 */
export function BMDragItem() {} // <constructor>

BMDragItem.prototype = {

    /**
     * Invoked to determine whether the contents of this drag item supports being represented
     * as the specified developer-defined type.
     * @param type <String>             The type being checked.
     * @returns <Boolean>               `YES` if the content can be represented as the specified
     *                                  type, `NO` otherwise.
     */
    /*required*/ canConformToType: function (type) {},

    /**
     * Invoked to obtain the representation of the contents in this drag item converted to the specified
     * developer-defined type. If `canConformToType` returns `YES` for that type, this method must be able
     * to return an object of that type.
     * 
     * Core UI may invoke this method supplying a type of `default` to obtain a representation to use for
     * legacy APIs. In this case, this method can return any representation, but multiple invocations of
     * this method with the `default` type must return the same representation.
     * @param type <String>             The type of object to return.
     * @returns <unknown>               An object if the specified type representing this drag item's contents.
     */
    /*required*/ itemOfType: function (type) {},

}

// @endtype
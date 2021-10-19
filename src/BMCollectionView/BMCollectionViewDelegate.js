// @type interface BMCollectionViewDelegate

/**
 * The specification for a <code>BMCollectionViewDelegate</code> object.
 *
 * There is no default prototype for such an object; all objects implementing this protocol should define their own methods.
 * The delegate object and all its methods are optional. A collection view will function normally without any delegate and with any of the delegate methods missing.
 * Note however that some configurations or layout objects might require specific delegate methods to be implemented.
 */
function BMCollectionViewDelegate() {}; // <constructor>

BMCollectionViewDelegate.prototype = {

	/**
	 * Invoked by the collection view to determine whether or not it should run the intro animation when the data set first loads.
	 * If this method is not implemented, the collection view will not run the intro animation.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @return <Boolean>							YES if the collection view should run the intro animation, NO otherwise.
	 */
	collectionViewShouldRunIntroAnimation: function (collectionView) {},	

	/**
	 * Invoked by the collection view whenever the bounds change.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param newBounds <BMRect>					The new bounds.
	 */
	collectionViewBoundsDidChange: function (collectionView, bounds) {},	

	/**
	 * Invoked by the collection view whenever any cell will be rendered.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param cell <BMCollectionViewCell>			The cell that will be rendered.
	 */
	collectionViewWillRenderCell: function (collectionView, cell) {},	


	/**
	 * Invoked by the collection view whenever any cell has been rendered.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param cell <BMCollectionViewCell>			The cell that will be rendered.
	 */
	collectionViewDidRenderCell: function (collectionView, cell) {},	

	/**
	 * Invoked by the collection view whenever any cell will be recycled.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param cell <BMCollectionViewCell>			The cell that will be rendered.
	 */
	collectionViewWillRecycleCell: function (collectionView, cell) {},	


	/**
	 * Invoked by the collection view whenever any cell has been recycled.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param cell <BMCollectionViewCell>			The cell that will be rendered.
	 */
	collectionViewDidRecycleCell: function (collectionView, cell) {},

	/**
	 * Invoked by the collection view whenever any cell that can no longer be used will be discarded.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param cell <BMCollectionViewCell>			The cell that will be rendered.
	 */
	collectionViewWillDestroyCell: function (collectionView, cell) {},

	/**
	 * Invoked by the collection view whenever any cell that can no longer be used has been discarded.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param cell <BMCollectionViewCell>			The cell that will be rendered.
	 */
	collectionViewDidDestroyCell: function (collectionView, cell) {},

	/**
	 * Invoked by the collection view whenever any cell should be selected to determine whether that selection is allowed. 
	 * The actuall cell may not be visible on screen and as such it may not have a BMCollectionViewCell object associated with it.
	 * You may invoke the cellAtIndexPath(indexPath) method to obtain a reference to the cell if it is visible.
	 * If this method is not implemented by the delegate object, the collection view will assume that the cell may be selected.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param indexPath <BMIndexPath>				The cell's index path.
	 * @return <Boolean>							YES if the cell can be selected, NO otherwise.
	 */
	collectionViewCanSelectCellAtIndexPath: function (collectionView, indexPath) {},

	/**
	 * Invoked by the collection view whenever any cell was selected. The actual cell may not be visible on screen and as such
	 * it may not have a BMCollectionViewCell object associated with it.
	 * You may invoke the cellAtIndexPath(indexPath) method to obtain a reference to the cell if it is visible.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param indexPath <BMIndexPath>				The cell's index path.
	 */
	collectionViewDidSelectCellAtIndexPath: function (collectionView, indexPath) {},

	/**
	 * Invoked by the collection view whenever any cell should be deselected to determine whether that selection is allowed. 
	 * The actuall cell may not be visible on screen and as such it may not have a BMCollectionViewCell object associated with it.
	 * You may invoke the cellAtIndexPath(indexPath) method to obtain a reference to the cell if it is visible.
	 * If this method is not implemented by the delegate object, the collection view will assume that the cell may be deselected.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param indexPath <BMIndexPath>				The cell's index path.
	 * @return <Boolean>							YES if the cell can be deselected, NO otherwise.
	 */
	collectionViewCanDeselectCellAtIndexPath: function (collectionView, indexPath) {},

	/**
	 * Invoked by the collection view whenever any cell was deselected. The actual cell may not be visible on screen and as such
	 * it may not have a BMCollectionViewCell object associated with it.
	 * You may invoke the cellAtIndexPath(indexPath) method to obtain a reference to the cell if it is visible.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param indexPath <BMIndexPath>				The cell's index path.
	 */
	collectionViewDidDeselectCellAtIndexPath: function (collectionView, indexPath) {},

	/**
	 * Invoked by the collection view to verify if a cell can be highlighted.
	 * 
	 * If this method is not implemented by the delegate object, the collection view will assume that any cell may be highlighted.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param indexPath <BMIndexPath, nullable>		The cell's index path or `undefined` if the highlighted index path should be cleared.
	 * {
	 * 	@param withEvent <Event, nullable>			If the cell should be highlighted because of an event, this represents the event
	 * 												for which the cell should be highlighted.
	 * }
	 * @return <Boolean>							`YES` if the cell can be highlighted, `NO` otherwise.
	 */
	collectionViewCanHighlightCellAtIndexPath: function (collectionView, indexPath, args) {},

	/**
	 * Invoked by the collection view whenever any cell was highlighted.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param indexPath <BMIndexPath>				The cell's index path or `undefined` if the highlighted index path was cleared.
	 * {
	 * 	@param widthEvent <Event, nullable>			If the cell was highlighted because of an event, this represents the event
	 * 												for which the cell was highlighted.
	 * }
	 */
	collectionViewDidHighlightCellAtIndexPath: function (collectionView, indexPath, args) {},

	/**
	 * Invoked by the collection view whenever any cell is no longer highlighted.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param indexPath <BMIndexPath>				The cell's index path.
	 * {
	 * 	@param widthEvent <Event, nullable>			If the cell was dehighlighted because of an event, this represents the event
	 * 												for which the cell was dehighlighted.
	 * }
	 */
	collectionViewDidDehighlightCellAtIndexPath: function (collectionView, indexPath, args) {},

	/**
	 * Invoked by a collection view after highlighting a cell that it is not visible on screen to determine
	 * if it should scroll to reveal that cell.
	 * 
	 * When this method is not implemented, the default behaviour is to scroll to off-screen cells that are highlighted.
	 * @param collectionView <BMCollectionView> 		The calling collection view.
	 * @param indexPath <BMIndexPath>			        The index path that was just highlighted.
	 */
	collectionViewShouldScrollToHighlightedCellAtIndexPath: function (collectionView, indexPath) {},

	/**
	 * Invoked by the collection view before running the initial presentation animation. Delegate objects can implement this method
	 * to customize the animation's parameters.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @return <Object>								The Velocity.js animation options object to use.
	 */
	collectionViewAnimationOptionsForIntroAnimation: function (collectionView) {},

	/**
	 * Invoked by the collection view before running the update animation. Delegate objects can implement this method
	 * to customize the animation's parameters.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @return <Object>								The Velocity.js animation options object to use.
	 */
	collectionViewAnimationOptionsForUpdateAnimation: function (collectionView) {},

	/**
	 * Invoked by the collection view before running the update animation. Delegate objects can implement this method
	 * to customize the animation's parameters.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param fromLayout <BMCollectionViewLayout>	The collection view's current layout.
	 * {
	 *	@param toLayout <BMCollectionViewLayout>	The collection view's new layout.
	 * }
	 * @return <Object>								The Velocity.js animation options object to use.
	 */
	collectionViewAnimationOptionsForLayoutChangeFromLayout: function (collectionView, fromLayout, {toLayout: toLayout}) {},

	/**
	 * Invoked by the collection view before any click event is processed on any cell.
	 * Delegate objects can implement this method to tell the collection view whether or not it should check for double click events on the given cell for this event.
	 * By default, when returning NO or nothing from this method, the collection view not track double clicks for this event.
	 * When returning YES from this method, the collection view will track double clicks, which will delay the firing of the click event
	 * until the collection view is certain that a second click will not follow fast enough to trigger a double click.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param cell <BMCollectionViewCell>			The cell that triggered this event.
	 * {
	 *	@param withEvent <$event>					The jQuery event that triggered this action.
	 * }
	 * @return <Boolean, nullable>					Defaults to NO. If set to YES the collection view will track double clicks for this event.
	 */
	collectionViewCanDoubleClickCell: function (collectionView, cell, {withEvent: event}) {},

	/**
	 * Invoked by the collection view whenever any cell is clicked or tapped. Delegate objects can implement this method to react
	 * to cell click or tap events.
	 * Delegate objects can optionally return YES from this method to signal to the collection view that they wish to handle this event
	 * and prevent the default actions from occuring.
	 * By default, when returning NO or nothing from this method, the collection view will togle the selection state of the clicked cell.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param cell <BMCollectionViewCell>			The cell that triggered this event.
	 * {
	 *	@param withEvent <$event>					The jQuery event that triggered this action.
	 * }
	 * @return <Boolean, nullable>					Defaults to NO. If set to YES the default actions will be suppressed for this event.
	 */
	collectionViewCellWasClicked: function (collectionView, cell, {withEvent: event}) {},

	/**
	 * Invoked by the collection view whenever any cell is double clicked or double tapped. Delegate objects can implement this method to react
	 * to cell click or tap events.
	 * Delegate objects can optionally return YES from this method to signal to the collection view that they wish to handle this event
	 * and prevent the default actions from occuring.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param cell <BMCollectionViewCell>			The cell that triggered this event.
	 * {
	 *	@param withEvent <$event>					The jQuery event that triggered this action.
	 * }
	 * @return <Boolean, nullable>					Defaults to NO. If set to YES the default actions will be suppressed for this event.
	 */
	collectionViewCellWasDoubleClicked: function (collectionView, cell, {withEvent: event}) {},

	/**
	 * Invoked by the collection view whenever any cell is long clicked or long tapped. Delegate objects can implement this method to react
	 * to cell click or tap events.
	 * Delegate objects can optionally return YES from this method to signal to the collection view that they wish to handle this event
	 * and prevent the default actions from occuring.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param cell <BMCollectionViewCell>			The cell that triggered this event.
	 * {
	 *	@param withEvent <$event>					The jQuery event that triggered this action.
	 * }
	 * @return <Boolean, nullable>					Defaults to NO. If set to YES the default actions will be suppressed for this event.
	 */
	collectionViewCellWasLongClicked: function (collectionView, cell, {withEvent: event}) {},

	/**
	 * Invoked by the collection view whenever any cell is right clicked. Delegate objects can implement this method to react
	 * to cell click events.
	 * Delegate objects can optionally return YES from this method to signal to the collection view that they wish to handle this event
	 * and prevent the default actions from occuring.
	 * By default, when returning NO or nothing from this method, the browser's default context menu will appear.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param cell <BMCollectionViewCell>			The cell that triggered this event.
	 * {
	 *	@param withEvent <$event>					The jQuery event that triggered this action.
	 * }
	 * @return <Boolean, nullable>					Defaults to NO. If set to YES the default actions will be suppressed for this event.
	 */
	collectionViewCellWasRightClicked: function (collectionView, cell, {withEvent: event}) {},

	/**
	 * Invoked by the collection view prior to any cell being resized. When this method is invoked, the new size will not have been
	 * assigned to the actual cell. If the size change will be animated, this method is invoked before any associated animation begins.
	 * Delegate object can implement this method to respond to the size change.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param cell <BMCollectionViewCell>			The cell that is about to be resized.
	 * {
	 * 	@param toSize <BMSize>						The new size that will be assigned to the cell.
	 * }
	 */
	collectionViewWillResizeCell: function (collectionView, cell, {toSize: size}) {},
	
	/**
	 * Invoked by the collection view after any cell was resized. When this method is invoked, the new size will have been
	 * assigned to the actual cell. If the size change was be animated, this method is invoked after any associated animation ends.
	 * Delegate object can implement this method to respond to the size change.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param cell <BMCollectionViewCell>			The cell that was resized.
	 * {
	 * 	@param toSize <BMSize>						The new size that was assigned to the cell.
	 * }
	 */
	collectionViewDidResizeCell: function (collectionView, cell, {toSize: size}) {},

	
	/**
	 * Invoked by the collection view whenever the user begins begins to click or touch a cell to determine if it can treat the event sequence
	 * as the beginning of a drag & drop operation.
	 * Delegate objects can implement this method to let collection view know whether it should go ahead
	 * with the interactive drag gesture or not. If this method is not implemented, collection view will not start
	 * any drag gestures.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param cell <BMCollectionViewCell>			The cell that is about to be dragged.
	 * {
	 * 	@param atIndexPath <BMIndexPath>			The cell's index path.
	 * }
	 */
	collectionViewCanMoveCell: function (collectionView, cell, {atIndexPath: indexPath}) {},


	
	/**
	 * Invoked by the collection view immediately before starting an interactive drag gesture for a cell.
	 * Delegate objects can implement this method to perform any changes that might be needed to accomodate this gesture.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param cell <BMCollectionViewCell>			The cell that is about to be dragged.
	 * {
	 * 	@param atIndexPath <BMIndexPath>			The cell's current index path.
	 * }
	 */
	collectionViewWillBeginInteractiveMovementForCell: function (collectionView, cell, {atIndexPath: indexPath}) {},

	/**
	 * Invoked by collection view to determine if the items at the specified index paths may be copied or moved into another
	 * collection view.
	 * Delegate object can implement this method to let collection view know whether or not it can transfer the items.
	 * If this method is not implemented, collection view will assume that items cannot be transferred.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param indexPaths <[BMIndexPath]>			The index paths that may be transferred by the drag gesture.
	 * @return <Boolean>							`YES` if the index paths can be removed, `NO` otherwise.
	 */
	collectionViewCanTransferItemsAtIndexPaths: function (collectionView, indexPaths) {},

	/**
	 * Invoked by collection view to determine how to handle the transfer of the given items to a different
	 * collection view.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param indexPaths <[BMIndexPath]>			The index paths that will be transferred by the drag gesture.
	 * @return <BMCollectionViewTransferPolicy>		The desired accept policy.
	 */
	collectionViewTransferPolicyForItemsAtIndexPaths: function (collectionView, items) {},

	/**
	 * Invoked by collection view to determine if the given items may be imported from another collection view.
	 * Delegate object can implement this method to let collection view know whether or not it can import the items.
	 * If this method is not implemented, collection view will assume that items cannot be imported.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param items <[AnyObject]>					The items that might be imported.
	 * @return <Boolean>							`YES` if the items can be imported, `NO` otherwise.
	 */
	collectionViewCanAcceptItems: function (collectionView, items) {},

	/**
	 * Invoked by collection view to determine how to handle the import of the given items from a different
	 * collection view.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param items <[AnyObject]>					The items that might be imported.
	 * @return <BMCollectionViewAcceptPolicy>		The desired accept policy.
	 */
	collectionViewAcceptPolicyForItems: function (collectionView, items) {},

	/**
	 * Invoked by collection view to determine if the items at the specified index paths may be removed by an interactive
	 * drag gesture.
	 * Delegate object can implement this method to let collection view know whether or not it can remove the items.
	 * If this method is not implemented, collection view will assume that items cannot be removed.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param indexPaths <[BMIndexPath]>			The index paths that may be removed by the drag gesture.
	 * @return <Boolean>							`YES` if the index paths can be removed, `NO` otherwise.
	 */
	collectionViewCanRemoveItemsAtIndexPaths: function (collectionView, indexPaths) {},
	
	/**
	 * Invoked by the collection view immediately before a drag gesture is about to end for a cell. This is invoked before any
	 * associated animations begin.
	 * Delegate objects can implement this method to perform any changes that might be needed to accomodate this gesture.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param cell <BMCollectionViewCell>			The cell that is about to be dragged.
	 * {
	 * 	@param atIndexPath <BMIndexPath>			The cell's new index path.
	 * }
	 */
	collectionViewWillFinishInteractiveMovementForCell: function (collectionView, cell, {atIndexPath: indexPath}) {},
	
	/**
	 * Invoked by the collection view immediately after a drag gesture has ended for a cell. This is invoked after any
	 * associated animations end.
	 * Delegate objects can implement this method to perform any changes that might be needed to accomodate this gesture.
	 * @param collectionView <BMCollectionView>		The calling collection view.
	 * @param cell <BMCollectionViewCell>			The cell that is about to be dragged.
	 * {
	 * 	@param atIndexPath <BMIndexPath>			The cell's new index path.
	 * }
	 */
	collectionViewDidFinishInteractiveMovementForCell: function (collectionView, cell, {atIndexPath: indexPath}) {}

};	

// @endtype

// @type interface BMCollectionViewLayoutAnimationDelegate extends BMCollectionViewDelegate

/**
 * When using the <code>BMCollectionViewTableLayout</code>, the <code>BMCollectionViewFlowLayout</code> or the <code>BMCollectionViewMasonryLayout</code>, 
 * the collection view's delegate object can optionally implement the following methods:
 */
function BMCollectionViewLayoutAnimationDelegate() {}; // <constructor>

BMCollectionViewLayoutAnimationDelegate.prototype = {

	 /**
	 * Invoked by the layout to allow the delegate object to customize the intro animation.
	 * The collection view will animate from the returned attributes to the supplied target attributes.
	 * @param collectionView <BMCollectionView>								The calling collection view.
	 * @param indexPath <BMIndexPath>										The cell's index path.
	 * {
	 *	@param withTargetAttributes <BMCollectionViewLayoutAttributes>		The suggested attributes supplied by the layout
	 * }
	 * @return <BMCollectionViewLayoutAttributes>							The cell attributes to use.
	 */
	collectionViewInitialAttributesForPresentedCellAtIndexPath: function (indexPath, {withTargetAttributes}) {},

	 /**
	 * Invoked by the layout to allow the delegate object to customize the intro animation.
	 * The collection view will animate from the returned attributes to the supplied target attributes.
	 * @param collectionView <BMCollectionView>								The calling collection view.
	 * @param identifier <String>											The supplementary view's type identifier.
	 * {
	 *  @param atIndexPath <BMIndexPath>									The supplementary view's index path.
	 *	@param withTargetAttributes <BMCollectionViewLayoutAttributes>		The suggested attributes supplied by the layout
	 * }
	 * @return <BMCollectionViewLayoutAttributes>							The cell attributes to use.
	 */
	collectionViewInitialAttributesForPresentedSupplementaryViewWithIdentifier: function (identifier, {atIndexPath, withTargetAttributes}) {},

	 /**
	 * Invoked by the layout to allow the delegate object to customize the update animation.
	 * The collection view will animate from the returned attributes to the supplied target attributes.
	 * @param collectionView <BMCollectionView>								The calling collection view.
	 * @param indexPath <BMIndexPath>										The cell's index path.
	 * {
	 *	@param withTargetAttributes <BMCollectionViewLayoutAttributes>		The suggested attributes supplied by the layout
	 * }
	 * @return <BMCollectionViewLayoutAttributes>							The cell attributes to use.
	 */
	collectionViewInitialAttributesForAppearingCellAtIndexPath: function (indexPath, {withTargetAttributes}) {},

	 /**
	 * Invoked by the layout to allow the delegate object to customize the update animation.
	 * The collection view will animate from the returned attributes to the supplied target attributes.
	 * @param collectionView <BMCollectionView>								The calling collection view.
	 * @param identifier <String>											The supplementary view's type identifier.
	 * {
	 *  @param atIndexPath <BMIndexPath>									The supplementary view's index path.
	 *	@param withTargetAttributes <BMCollectionViewLayoutAttributes>		The suggested attributes supplied by the layout
	 * }
	 * @return <BMCollectionViewLayoutAttributes>							The cell attributes to use.
	 */
	collectionViewInitialAttributesForAppearingSupplementaryViewWithIdentifier: function (identifier, {atIndexPath, withTargetAttributes}) {},

	 /**
	 * Invoked by the layout to allow the delegate object to customize the update animation.
	 * The collection view will animate from the supplied target attributes to the returned attributes.
	 * @param collectionView <BMCollectionView>								The calling collection view.
	 * @param indexPath <BMIndexPath>										The cell's index path.
	 * {
	 *	@param withTargetAttributes <BMCollectionViewLayoutAttributes>		The suggested attributes supplied by the layout
	 * }
	 * @return <BMCollectionViewLayoutAttributes>							The cell attributes to use.
	 */
	collectionViewFinalAttributesForDisappearingCellAtIndexPath: function (indexPath, {withTargetAttributes}) {},

	 /**
	 * Invoked by the layout to allow the delegate object to customize the update animation.
	 * The collection view will animate from the supplied target attributes to the returned attributes.
	 * @param collectionView <BMCollectionView>								The calling collection view.
	 * @param identifier <String>											The supplementary view's type identifier.
	 * {
	 *  @param atIndexPath <BMIndexPath>									The supplementary view's index path.
	 *	@param withTargetAttributes <BMCollectionViewLayoutAttributes>		The suggested attributes supplied by the layout
	 * }
	 * @return <BMCollectionViewLayoutAttributes>							The cell attributes to use.
	 */
	collectionViewFinalAttributesForDisappearingSupplementaryViewWithIdentifier: function (identifier, {atIndexPath, withTargetAttributes}) {},

 
};

// @endtype

// @type interface BMCollectionViewDelegateTableLayout extends BMCollectionViewDelegate

/**
 * When using the table layout with variable row heights, the delegate must implement all of the methods in the
 * BMCollectionViewDelegateTableLayout protocol.
 *
 * They will be invoked by the table layout to determine the height of each row.
 */
function BMCollectionViewDelegateTableLayout () {}; // <constructor>

BMCollectionViewDelegateTableLayout.prototype = {
	
	/**
	 * Invoked by the table layout to obtain the height to use for the row representing the item at the specified index path.
	 * @param collectionView <BMCollectionView>			The collection view of the calling table layout.
	 * @param indexPath <BMIndexPath>					The index path for which to obtain the row height.
	 * @return <Number>									The row's height.
	 */
	/*required*/ collectionViewRowHeightForCellAtIndexPath: function (collectionView, indexPath) {}
	
};

// @endtype

// @type interface BMCollectionViewDelegateFlowLayout extends BMCollectionViewDelegate

/**
 * When using the flow layout with variable cell sizes, the delegate must implement all of the methods in the
 * BMCollectionViewDelegateFlowLayout protocol.
 *
 * They will be invoked by the flow layout to determine the size of each cell.
 */
function BMCollectionViewDelegateFlowLayout () {}; // <constructor>

BMCollectionViewDelegateFlowLayout.prototype = {
	
	/**
	 * Invoked by the flow layout to obtain the height to use for the cell representing the item at the specified index path.
	 * @param collectionView <BMCollectionView>			The collection view of the calling flow layout.
	 * @param indexPath <BMIndexPath>					The index path for which to obtain the cell size.
	 * @return <BMSize>									The cell's size.
	 */
	/*required*/ collectionViewSizeForCellAtIndexPath: function (BMCollectionView, BMIndexPath) {}
	
};

// @endtype

// @type interface BMCollectionViewDelegateMasonryLayout extends BMCollectionViewDelegate

/**
 * When using the masonry layout, the delegate must implement all of the methods in the
 * BMCollectionViewDelegateMasonryLayout protocol.
 *
 * They will be invoked by the masonry layout to determine the height of each cell.
 */
function BMCollectionViewDelegateMasonryLayout () {}; // <constructor>

BMCollectionViewDelegateMasonryLayout.prototype = {
	
	/**
	 * Invoked by the masonry layout to obtain the height to use for the cell representing the item at the specified index path.
	 * @param collectionView <BMCollectionView>			The collection view of the calling masonry layout.
	 * @param indexPath <BMIndexPath>					The index path for which to obtain the cell height.
	 * {
	 *	@param forColumnWidth <Number>					The width that will be used for the cell.
	 * }
	 * @return <Number>									The cell's height.
	 */
	/*required*/ collectionViewHeightForCellAtIndexPath: function (collectionView, indexPath, args) {}
	
};

// @endtype

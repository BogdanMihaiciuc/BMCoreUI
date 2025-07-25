// @type interface BMCollectionViewDataSource<T = any>

/**
 * Describes a `BMCollectionViewDataSource` object, which is used to provide information to the collection view regarding the number
 * of sections and objects that it should display, as well as their contents and the contents of any supplementary views defined by the current layout.
 *
 * There is no built-in concrete implementation for this interface; all objects implementing this interface must define their own methods.
 */
function BMCollectionViewDataSet() {} // <constructor>

BMCollectionViewDataSet.prototype = {

	/**
	 * Returns the number of sections in the data set.
     * @param collectionView <BMCollectionView>         The collection view for which the number of sections should be returned.
	 * @return <Int>			                        The number of sections.
	 */
	/*required*/ collectionViewNumberOfSections: function (collectionView) {},
	
	/**	
	 * Returns the number of cells in the given section.
     * @param collectionView <BMCollectionView>         The collection view for which the number of objects should be returned.
	 * @param index <Int>		                        The section's index.
	 * @return <Int>			                        The number of cells.
	 */
	/*required*/ collectionViewNumberOfObjectsInSectionAtIndex: function (collectionView, index) {},
	
	/**
	 * Returns the index path for the object with the specified section and row indexes.
     * @param collectionView <BMCollectionView>         The collection view for which the number of objects should be returned.
	 * @param row <Int>						            The object's index within the section.
	 * {
	 * 	@param inSectionAtIndex <Int>		            The section's index.
	 * }
	 * @return <BMIndexPath<T>, nullable>	            The index path if these indexes are part of the data set,
	 * 										            `undefined` otherwise. `undefined` may only be returned during
	 * 										            animated data updates while `isUsingOldData` returns `YES`.
	 */
	 /*required*/ collectionViewIndexPathForObjectAtRow: function (collectionView, row, {inSectionAtIndex: section}) {},
	 
	/**
	 * Returns the index path for the specified object.
     * @param collectionView <BMCollectionView>         The collection view for which the index path should be returned.
	 * @param object <Object>				            The object.
	 * @return <BMIndexPath<T>, nullable>	            The index path, if the object is part of the data set,
	 * 										            `undefined` otherwise. `undefined` may only be returned during
	 * 										            animated data updates while `isUsingOldData` returns `YES`.
	 */
	 /*required*/ collectionViewIndexPathForObject: function (collectionView, object) {},
	 
	/**
	 * Returns the cell for the object at the specified index path.
	 * To retrieve a cell, use the collection view's `dequeueCellForReuseIdentifier` method,
	 * passing in the appropriate identifier for your cell depending on the item at the specified index path.
	 * The data source object defines the reuse identifiers that the cells have.
     * @param collectionView <BMCollectionView>         The collection view for which the cell should be returned.
	 * @param indexPath <BMIndexPath<T>>		        The index path.
	 * @return <BMCollectionViewCell>			        The cell.
	 */
	 /*required*/ collectionViewCellForItemAtIndexPath: function (collectionView, indexPath) {},
	 
	/**
	 * Returns the cell for the supplementary view of the specified type at the specified index path.
	 * To retrieve a cell, use the collection view's `dequeueCellForSupplementaryViewWithIdentifier`,
	 * passing in the supplementary view's type as the parameter.
	 * Both the supplementary's view kind and its index path are defined entirely by the layout object
     * and the data source must not return a supplementary view of a different kind from this method.
     * @param collectionView <BMCollectionView>         The collection view for which the cell should be returned.
	 * @param identifier <String>				        The supplementary view's type identifier.
	 * {
	 *	@param atIndexPath <BMIndexPath<T>>		        The supplementary view's index path.
	 * }
	 * @return <BMCollectionViewCell>			        The cell.
	 */
	 /*required*/ collectionViewCellForSupplementaryViewWithIdentifier: function (collectionView, identifier, {atIndexPath: indexPath}) {},
	 
	/**
	 * If this data set performs full data updates, this function is required. For data sets that never update, or those that
     * can perform delta updates, this method is optional.
	 * This function may be invoked by the collection view during a full data update to access the old data set.
	 * When this function is invoked with the parameter set to `YES`, the data set object should return values from the old data set
	 * for all data and index path queries.
	 * When this function is invoked with the parameter set to `NO`, the data set object should return values from the new data set.
	 * Before the update is finished, the collection view will always invoke this method with the parameter set to `NO`.
     * @param collectionView <BMCollectionView>         The collection view that is switching the data set.
	 * @param use <Boolean>			                    `YES` if the data set should switch to the old data, `NO` if it should switch to the new data.
	 */
	collectionViewUseOldData: function (collectionView, use) {},
	 
	/**
	 * If this data set performs full data updates, this function is required. For data sets that never update, or those that
     * can perform delta updates, this method is optional.
	 * This function may be invoked by the collection view during a full data update to determine if this data set is currently serving the previous data.
	 * The data set must return YES if it is serving up the old data, NO otherwise.
     * @param collectionView <BMCollectionView>         The collection view whose old data set should be retrieved.
	 * @return <Boolean>			                    YES if this data source is currently serving the old data, NO otherwise.
	 */
	 /*required*/ collectionViewIsUsingOldData: function (collectionView) {},
	 
	/**
	 * This method must be implemented by data set objects that support moving items for interactive drag gestures.
	 * Data set objects implementing this method are expected to update their internal data structures to match
	 * the item's new position, then trigger a data update to run on the collection view.
	 * Optionally, data sets may reject the change and not perform any action.
     * 
	 * ---
	 * For collection views that support moving items, this method must be implemented by the data sets these collection views
	 * use. In this case, data sets that don't support moving items may simply return `NO` from this method.
     * @param collectionView <BMCollectionView>         The collection view that is moving the item.
	 * @param indexPath <BMIndexPath<T>>			    The item's current index path.
	 * {
	 * 	@param toIndexPath <BMIndexPath<T>>		        The index path to which the item should move.
	 * 	@param session <BMDragSession>					The drag session through which this change was performed.
	 * }
	 * @return <Boolean>						        `YES` if the data set has performed the requested change, `NO` otherwise.
	 */
    collectionViewMoveItemFromIndexPath: function (collectionView, indexPath, {toIndexPath: toIndexPath}) {},
	 
	/**
	 * This method may be implemented by data set objects that support moving items for interactive drag gestures.
	 * Data set objects implementing this method are expected to update their internal data structures to match
	 * the items' new positions, then trigger a data update to run on the collection view.
	 * Optionally, data sets may reject the change and not perform any action or only partially accept the update
	 * and move just some of the items.
	 * The order of the items in the array is guaranteed to be such that the target index paths are in ascending order.
	 * Implementing this method is optional and if it is not implemented, collection view will repeatedly invoke
	 * `moveItemFromIndexPath(_, {toIndexPath})` passing in each of the items that need to be moved.
     * @param collectionView <BMCollectionView>     The collection view that is moving the items.
	 * @param indexPaths <[BMIndexPath<T>]>		    An array of index paths identifying which items have to be moved.
	 * {
     *  @param toIndexPath <BMIndexPath<T>>		    The starting index path to which the items should move. This represents the index path of the current layout
	 * 											    before any items may have moved. It is the data source's responsibility to adjust this index path as the items shift
	 * 											    within its data structure.
	 * 	@param session <BMDragSession>				The drag session through which this change was performed.
	 * }
	 * @return <[BMIndexPath<T>]>					An array of index paths specifying the positions of the items after they have been moved.
	 * 											    The index paths in this array are not required to match either of the lists supplied by
	 *												collection view.
	 */
    collectionViewMoveItemsFromIndexPaths: function (collectionView, indexPaths, {toIndexPath: toIndexPath, session}) {},

	 
    /**
     * This method may be implemented by data source objects that support removing items for interactive drag gestures.
     * Data source objects implementing this method are expected to update their internal data structures to remove
     * the items, then trigger a data update to run on the collection view.
     * Optionally, data sources may reject the change and not perform any action or only partially accept the update
     * and remove just some of the items, by changing their internal data structures appropriately.
     * The order of the items in the array is guaranteed to be such that the target index paths are in ascending order.
     * @param collectionView <BMCollectionView>     The collection view that is removing the items.
     * @param indexPaths <[BMIndexPath<T>]>		    An array of index paths identifying which items have to be removed.
	 * {
	 * 	@param session <BMDragSession, nullable>	If this change occurred via a drag session, the session through which
	 * 												the items were removed.
	 * }
     */
    collectionViewRemoveItemsAtIndexPaths: function (collectionView, indexPaths, {session}) {},
	 
    /**
     * This method may be implemented by data source objects that support transferring items from another collection view.
     * Data source objects implementing this method are expected to update their internal data structures to add
     * the items, then trigger a data update to run on the collection view. This data update must be triggered before
     * this method returns for the appropriate animation to play on the items being transferred.
     * Optionally, data sources may reject the change and not perform any action or only partially accept the update
     * and add just some of the items, by changing their internal data structures appropriately.
     * @param collectionView <BMCollectionView>     			The collection view into which items are being inserted.
     * @param items <[AnyObject]>								An array of objects to add to the collection view. If this change
	 * 															occurred trough a drop session, this represents the default representation
	 * 															of the drag items.
     * {
     *  @param toIndexPath <BMIndexPath<T>>		    			The starting index path to which the items should be inserted.
	 * 	@param session <BMDropSession, nullable>				The drop session through which this change was performed, if this
	 * 															occurred via a drag and drop gesture.
	 * 	@param indexPaths <Map<BMDragItem, BMIndexPath<T>>, nullable>		
	 * 															If the data set inserted a different representation of the items than the default,
	 * 															this map must be filled out with the new index paths associated with each item in
	 * 															the drop session that was actually inserted.
     * }
	 * @return <Promise<void> or void>							An optional promise that resolves when data has updated, if it cannot be updated synchronously.
     */
    collectionViewInsertItems: function (collectionView, items, {toIndexPath: toIndexPath, session, indexPaths}) {},

	/**
	 * This method should be implemented by data source objects that support transferring items via drag and drop
	 * to create the drag items that will be part of a drag session.
	 * 
	 * Data source objects implementing this method should return a drag item for the specified index path with
	 * the appropriate representations that potential drop targets can verify to determine if they can accept
	 * the items being transferred through the session.
     * @param collectionView <BMCollectionView>     The collection view that started the dragging session.
	 * @param indexPath <BMIndexPath<T>>			The index path for which to create a drag item.
	 * {
	 * 	@param session <BMDragSession>				The drag session that will be used to transfer the items.
	 * }
	 * @return <BMDragItem>							The drag item.
	 */
	collectionViewDragItemForIndexPath: function (collectionView, indexPath, {session}) {},

	/**
	 * Invoked by collection after a successful transfer via a drop session to determine the index path associated
	 * with the specified drag item during the associated data update. Data source objects which implement this method
	 * should return the index path associated with the appropriate representation of the specified drag item that
	 * was accepted through the drop session.
	 * @param collectionView <BMCollectionView>		The collection view that accepted items from a drop session.
	 * @param item <BMDragItem>						The drag item for which to obtain the associated index path.
	 * @return <BMIndexPath<T>, nullable>			The associated index path if it could be determined, `undefined` otherwise.
	 */
	collectionViewIndexPathForDragItem: function (collectionView, item) {},

	/**
	 * @deprecated Not used if `dragItemForIndexPath` is implemented.
	 * 
	 * ------
	 * This method may be implemented by data source objects that support transferring items to another collection view.
	 * Data source objects implementing this method are expected to create a copy of the specified item and return it.
	 * The item is guaranteed to be an object that was returned at some point by the data set when it provided an index path.
	 * If this method is not implemented, collection view will create a copy of the item by stringifying it and parsing it back
	 * into an object.
     * @param collectionView <BMCollectionView>     The collection view from which items are being transferred.
     * @param item <AnyObject>						The item whose copy should be created for the transfer.
	 * @returns <AnyObject>							A copy of the specified item.
	 */
	collectionViewCopyOfItem: function (collectionView, item) {},

};

// @endtype
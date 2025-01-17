// @type interface BMCollectionViewDataSet<T = any>

/**
 * @deprecated Use `BMCollectionViewDataSource` instead.
 * 
 * ------
 * The specification for a BMCollectionViewDataSet object, which is used to provide information to the collection view regarding the number
 * of sections and objects that it should display, as well as their contents and the contents of any supplementary views defined by the current layout.
 *
 * There is no default prototype for such an object; all objects implementing this protocol must define their own methods.
 * All of the methods defined in this protocol are required; omitting any method will lead to a runtime error when the collection view
 * attempts to invoke it on the data set object.
 */
function BMCollectionViewDataSet() {} // <constructor>

BMCollectionViewDataSet.prototype = {

	/**
	 * Returns the number of sections in the data set.
	 * @return <Int>			The number of sections.
	 */
	/*required*/ numberOfSections: function () {},
	
	/**	
	 * Returns the number of cells in the given section.
	 * @param index <Int>		The section's index.
	 * @return <Int>			The number of cells.
	 */
	/*required*/ numberOfObjectsInSectionAtIndex: function (index) {},
	
	/**
	 * Returns the index path for the object with the specified section and row indexes.
	 * @param row <Int>						The object's index within the section.
	 * {
	 * 	@param inSectionAtIndex <Int>		The section's index.
	 * }
	 * @return <BMIndexPath<T>, nullable>	The index path if these indexes are part of the data set,
	 * 										`undefined` otherwise. `undefined` may only be returned during
	 * 										animated data updates while `isUsingOldData` returns `YES`.
	 */
	 /*required*/ indexPathForObjectAtRow: function (row, {inSectionAtIndex: section}) {},
	 
	/**
	 * Returns the index path for the specified object.
	 * @param object <Object>				The object.
	 * @return <BMIndexPath<T>, nullable>	The index path, if the object is part of the data set,
	 * 										`undefined` otherwise. `undefined` may only be returned during
	 * 										animated data updates while `isUsingOldData` returns `YES`.
	 */
	 /*required*/ indexPathForObject: function (object) {},
	 
	/**
	 * @deprecated Deprecated. Consider using custom cell classes instead. Only invoked when using the default cell class.
	 * ---
	 * Returns the jQuery element that represents the contents of a cell with the given reuse identifier.
	 * The collection view will invoke this method whenever a new cell has to be created.
	 * @param identifier <String>		The cell's identifier.
	 * @return <$ or String>			The cell's contents.
	 */
	contentsForCellWithReuseIdentifier: function (identifier) {},
	 
	/**
	 * Returns the cell for the object at the given index path.
	 * To retrieve a cell, use the collection view's dequeueCellForReuseIdentifier(),
	 * passing in the appropriate identifier for your cell depending on the item at the specified index path.
	 * The data set object itself defines the reuse identifiers that the cells have.
	 * @param indexPath <BMIndexPath<T>>		The index path.
	 * @return <BMCollectionViewCell>			The cell.
	 */
	 /*required*/ cellForItemAtIndexPath: function (indexPath) {},
	 
	/**
	 * @deprecated Deprecated. Consider using custom cell classes instead. Only invoked when using the default cell class.
	 * ---
	 * Returns the jQuery element that represents the contents of a supplementary view of the given type.
	 * The supplementary view's type is defined entirely by the layout object.
	 * @param identifier <String>			The supplementary view's type identifier.
	 * @return <$ or String>				The supplementary view's contents.
	 */
	contentsForSupplementaryViewWithIdentifier: function (identifier) {},
	 
	/**
	 * Returns the cell for the supplementary view of the given type at the given index path.
	 * To retrieve a cell, use the collection view's dequeueCellForSupplementaryViewWithIdentifier(),
	 * passing in the supplementary view's type as the parameter.
	 * Both the supplementary's view type and its index path are defined entirely by the layout object.
	 * @param identifier <String>				The supplementary view's type identifier.
	 * {
	 *	@param atIndexPath <BMIndexPath<T>>		The supplementary view's index path.
	 * }
	 * @return <BMCollectionViewCell>			The cell.
	 */
	 /*required*/ cellForSupplementaryViewWithIdentifier: function (identifier, {atIndexPath: indexPath}) {},
	 
	/**
	 * @deprecated 		Deprecated. This method is optional, but is still invoked by the collection view when implemented. Consider using cell
	 * 					enumeration and manually updating cells as needed during data updates.
	 * ---
	 * This method will be invoked by the collection view when it is needed to update the contents of an already rendered cell.
	 * The data set object should always use the supplied indexPath parameter as the binding to the model object rather than the cell's
	 * own indexPath property as this method may be invoked during an update when the cell's old indexPath no longer matches the new data set.
	 * @param cell <BMCollectionViewCell>	The cell to update.
	 * {
	 *	@param atIndexPath <BMIndexPath<T>>		The indexPath to the model object this cell represents.
	 * }
	 */
	updateCell: function (cell, {atIndexPath: indexPath}) {},
	 
	/**
	 * @deprecated 		Deprecated. This method is optional, but is still invoked by the collection view when implemented. Consider using cell
	 * 					enumeration and manually updating cells as needed during data updates.
	 * ---
	 * This method will be invoked by the collection view when it is needed to update the contents of an already rendered supplementary view.
	 * The data set object should always use the supplied indexPath parameter as the binding to the model object rather than the cell's
	 * own indexPath property as this method may be invoked during an update when the cell's old indexPath no longer matches the new data set.
	 * @param view <BMCollectionViewCell>		The supplementary view to update.
	 * {
	 * 	@param withIdentifier <String>			The supplementary view's type identifier.
	 *	@param atIndexPath <BMIndexPath<T>>		The indexPath to the model object this supplementary view represents.
	 * }
	 */
	updateSupplementaryView: function (view, {withIdentifier: identifier, atIndexPath: indexPath}) {},
	 
	/**
	 * If this data set performs full data updates, this function is required.
	 * This function may be invoked by the collection view during a full data update to access the old data set.
	 * When this function is invoked with the parameter set to YES, the data set object should return values from the old data set
	 * for all data and index path queries.
	 * When this function is invoked with the parameter set to NO, the data set object should return values from the new data set.
	 * Before the update is finished, the collection view will always invoke this method with the parameter set to NO.
	 * @param use <Boolean>			YES if the data set should switch to the old data, NO if it should switch to the new data.
	 */
	/*required*/ useOldData: function (use) {},
	 
	/**
	 * If this data set performs full data updates, this function is required.
	 * This function may be invoked by the collection view during a full data update to determine if this data set is currently serving the previous data.
	 * The data set must return YES if it is serving up the old data, NO otherwise.
	 * @return <Boolean>			YES if this data set is currently serving up the old data, NO otherwise.
	 */
	/*required*/ isUsingOldData: function () {},
	 
	/**
	 * This method may be implemented by data set objects that support moving items for interactive drag gestures.
	 * Data set objects implementing this method are expected to update their internal data structures to match
	 * the item's new position, then trigger a data update to run on the collection view.
	 * Optionally, data sets may reject the change and not perform any action.
	 * ---
	 * For collection views that support moving items, this method must be implemented by the data sets these collection views
	 * use. In this case, data sets that don't support moving items may simply return `NO` from this method.
	 * @param indexPath <BMIndexPath<T>>			The item's current index path.
	 * {
	 * 	@param toIndexPath <BMIndexPath<T>>		The index path to which the item should move.
	 * }
	 * @return <Boolean>						`YES` if the data set has performed the requested change, `NO` otherwise.
	 */
	moveItemFromIndexPath: function (indexPath, {toIndexPath: toIndexPath}) {},
	 
	/**
	 * This method may be implemented by data set objects that support moving items for interactive drag gestures.
	 * Data set objects implementing this method are expected to update their internal data structures to match
	 * the items' new positions, then trigger a data update to run on the collection view.
	 * Optionally, data sets may reject the change and not perform any action or only partially accept the update
	 * and move just some of the items.
	 * The order of the items in the array is guaranteed to be such that the target index paths are in ascending order.
	 * Implementing this method is optional and if it is not implemented, collection view will repeatedly invoke
	 * `moveItemFromIndexPath(_, {toIndexPath})` passing in each of the items that need to be moved.
	 * @param indexPaths <[BMIndexPath<T>]>		An array of index paths identifying which items have to be moved.
	 * {
	 *  @param toIndexPath <BMIndexPath<T>>		The starting index path to which the items should move. This represents the index path of the current layout
	 * 											before any items may have moved. It is the data set's responsability to adjust this index path as the items shift
	 * 											within its data structure.
	 * }
	 * @return <[BMIndexPath<T>]>					An array of index paths specifying the positions of the items after they have been moved.
	 * 											The index paths in this array are not required to match either of the lists supplied by
	 *												collection view.
	 */
	moveItemsFromIndexPaths: function (indexPaths, {toIndexPath: toIndexPath}) {},

	
	/**
	 * This method may be implemented by data set objects that support removing items for interactive drag gestures.
	 * Data set objects implementing this method are expected to update their internal data structures to remove
	 * the items, then trigger a data update to run on the collection view.
	 * Optionally, data sets may reject the change and not perform any action or only partially accept the update
	 * and remove just some of the items, by changing their internal data structures appropriately.
	 * The order of the items in the array is guaranteed to be such that the target index paths are in ascending order.
	 * @param indexPaths <[BMIndexPath<T>]>		An array of index paths identifying which items have to be removed.
	 */
	removeItemsAtIndexPaths: function (indexPaths) {},
	 
	/**
	 * This method may be implemented by data set objects that support transferring items from another collection view.
	 * Data set objects implementing this method are expected to update their internal data structures to add
	 * the items, then trigger a data update to run on the collection view.
	 * Optionally, data sets may reject the change and not perform any action or only partially accept the update
	 * and add just some of the items, by changing their internal data structures appropriately.
	 * @param items <[AnyObject]>					An array of objects to add to the collection view.
	 * {
	 *  @param toIndexPath <BMIndexPath<T>>		The starting index path to which the items should be inserted.
	 * }
	 */
	insertItems: function (items, {toIndexPath: toIndexPath}) {},

	/**
	 * This method may be implemented by data set objects that support transferring items to another collection view.
	 * Data set objects implementing this method are expected to create a copy of the specified item and return it.
	 * The item is guaranteed to be an object that was returned at some point by the data set when it provided an index path.
	 * If this method is not implemented, collection view will create a copy of the item by stringifying it and parsing it back
	 * into an object.
	 * @param item <AnyObject>						The item whose copy should be created for the transfer.
	 * @returns <AnyObject>							A copy of the specified item.
	 */
	copyOfItem: function (item) {},

};

// @endtype
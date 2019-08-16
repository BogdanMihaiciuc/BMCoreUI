// @ts-check
/// <reference path="_0BMCoreUI.js"/>
/// <reference path="_1BMCell.js"/>
/// <reference path="_3BMCollectionView.js"/>
/// <reference path="BMView_v2.5.js"/>

// @type BMCollectionViewLayout extends Function

/**
 * The collection view layout is an object that the collection view uses to determine where each element should appear on screen.
 * Additionally, layout object can define supplementary views which help to enrich the display of the elements in the data set;
 * however, supplementary views themselves are not directly part of the data set, though they may be derived from the contents of the data set.
 *
 * The <code>BMCollectionViewLayout</code> is an abstract type and cannot be used directly. It is meant to serve as a base type for concrete implementations.
 * Concrete layout implementations are required to implement at least 3 of this type's abstract methods:
 *	<ul><li><b><code>attributesForCellAtIndexPath</code></b>: 	used to retrieve the attributes for a single cell</li>
 *	<li><b><code>attributesForElementsInRect</code></b>: 		used to retrieve the attributes of all cells and supplementary views in a given rect</li>
 *	<li><b><code>contentSize</code></b>:						used to obtain the size of all the content in the collection view</li></ul>
 *
 * Addtionally, layouts that define supplementary views, must additionally implement the following method:
 *	<ul><li><b><code>attributesForSupplementaryViewWithIdentifier</code></b>:		used to retrieve the attributes for a single supplementary view</li></ul>
 *
 * By default, the collection view defines 4 concrete layout types:
 *	<ul><li>BMCollectionViewFlowLayout</li>
 *	<li>BMCollectionViewMasonryLayout</li>
 *	<li>BMCollectionViewStackLayout</li>
 *	<li>BMCollectionViewTileLayout</li></ul>
 *
 * Creating a subtype of the <code>BMCollectionViewLayout</code> type can be achieved in several ways:
 * <ol>
 * <li> Create a type whose prototype inherits the <code>BMCollectionViewLayout</code> prototype, e.g.:
 *	<pre>
 *		MyCollectionViewLayout.prototype = Object.create(BMCollectionViewLayout.prototype, {
 *			// MyCollectionViewLayout prototype methods and properties here
 *		});
 *	</pre>
 * </li>
 * <li> Create a type whose prototype copies the properties of <code>BMCollectionViewLayout</code>'s prototype, e.g.:
 * <pre>
 *		BMExtend(MyCollectionViewLayout.prototype, BMCollectionViewLayout.prototype, {
 *			// MyCollectionViewLayout prototype methods and properties here
 *		});
 * </pre>
 * </li>
 * </ol>
 *
 * All layout objects should inherit from the `BMCollectionViewLayout` prototype.
 * 
 * When called, a layout object triggers layout for its associated collection view.
 */
function BMCollectionViewLayout() { // <constructor>
	
}

BMCollectionViewLayout.prototype = {

    /**
     * The collection view that derives its layout information from this object.
     */
    _collectionView: undefined, // <BMCollectionView>

    get collectionView() { return this._collectionView; },

    set collectionView(view) {
        this._collectionView = view;
    },

    /**
     * Will be invoked by the collection view to retrieve the layout attributes for the cell at the specified index path.
     * This method must return a valid BMCollectionViewLayoutAttributes object, which will be used to determine the position of the cell in the collection view.
     * @param indexPath <BMIndexPath>                   The cell's index path.
     * @return <BMCollectionViewLayoutAttributes>       The cell attributes.
     */
    /*required*/ attributesForCellAtIndexPath: function (indexPath) { throw new Error('attributesForCellAtIndexPath() must be implemented by layout objects.'); },

    /**
     * Will be invoked by the collection view to retrieve the layout attributes for all cells and supplementary views that intersect the given rect.
     * This method must return an array of valid BMCollectionViewLayoutAttributes objects, which will be used to determine the position of the cells and supplementary views in the collection view.
     * The collection view will use the indexPath attribute of the BMCollectionViewLayoutAttributes objects to match the attributes to the cells and type property to determine whether each
     * BMCollectionViewLayoutAttributes object applies to an item in the data set or to a supplementary view.
     * @param rect <BMRect>                             The rect containing the cells.
     * @return <[BMCollectionViewLayoutAttributes]>     An array of cell attributes.
     */
    /*required*/ attributesForElementsInRect: function (rect) { throw new Error('attributesForCellsInRect() must be implemented by layout objects.'); },

    /**
     * Will be invoked by the collection view to determine the size of the collection view's contents.
     * This method must return a valid BMSize object that represents the collection view's size.
     * @return <BMSize>                                 The size.
     */
    /*required*/ contentSize: function() { throw new Error('contentSize() must be implemented by layout objects.'); },

    /**
     * Will be invoked by the collection view to determine the layout attributes for a particular supplementary view.
     * This method must be implemented if the layout object defines supplementary views.
     * This method will also invoked during an update; during that time this method may return undefined, which indicates that
     * the requested supplementary should no longer exist; otherwise this method must return valid cell attributes.
     * @param identifier <String>           			The supplementary view's identifier which identifies the type of view.
     * {
     *  @param atIndexPath <BMIndexPath>    			The view's index path.
     * }
     * @return <BMCollectionViewLayoutAttributes>		The supplementary view attributes.
     */
    attributesForSupplementaryViewWithIdentifier: function (identifier, options) {
        throw new Error('attributesForSupplementaryViewWithIdentifier(_, {atIndexPath}) must be implemented by layout objects that define supplementary views.');
    },

    /**
     * Will be invoked by the collection the first time it presents its contents or whenever the layout is invalidated.
     * Layout objects can use this method to perform any necessary calculations before the layout will be displayed.
     */
    prepareLayout: function () {},
    
    /**
	 * For layout objects that support invalidation contexts, this property should be overriden to return the correct type to use
	 * when creating new invalidation contexts.
	 * This property should return the constructor function for the invalidation context type.
	 */
    get invalidationContextType() { // <Function>
	    return BMCollectionViewLayoutInvalidationContext;
	},

	/**
	 * Should be overriden by layout objects that support copying and return `YES` to let collection view know
	 * that it can perform animated layout changes in certain cases.
	 * Layout objects that return `YES` from this getter must also implement the `copy()` method.
	 * 
	 * The default implementation returns NO.
	 */
	get supportsCopying() { // <Boolean>
		return NO;
	},
	
	/**
	 * This method should be invoked when a series of properties are about to be changed on this layout object to prevent
	 * unnecessary layout invalidations. After this method is invoked, layout invalidations are temporarily suspended while
	 * the properties are being updated.
	 * 
	 * `applyUpdates()` must be invoked to commit the changes and re-enable layout invalidations.
	 * If this layout object does not support copying, this method will throw an error.
	 */
	beginUpdates() {
		this._copy = this.copy();
	},

	/**
	 * This method must be invoked after `beginUpdates()` has been invoked to apply the changes to property and trigger a layout invalidation.
	 * If this method is invoked within an animation context, those changes will be animated.
	 */
	applyUpdates() {
        if (this._collectionView) this._collectionView.invalidateLayout();
		this._copy = undefined;
	},

    /****************************************** UPDATES ***********************************************/

    /**
     * Will be invoked by the collection before it updates to a new data set.
     * Until collectionViewDidStartUpdates() is invoked, it is recommended that the layout object should be able to produce both the
     * current and the old layout attributes as the collection view may request both of them to be able to animate these changes.
     * @param updates <[BMCollectionViewUpdate], nullable>    	An array of update objects describing how each item was changed; this array will either contain 
     *															an update object for each changed element. For bulk updates, this parameter will be undefined.
     *															Instead, the old data set will be accessible from callbacks passed to the collectionView.usingOldDataSet() method.
     */
    collectionViewWillStartUpdates: function (updates) {},

    /**
     * Will be invoked by the collection view as a final step during updates.
     * This method is called from within an animation block, so this method may be used to perform additional animations.
     */
    collectionViewDidStartUpdates: function () {},

    /**
     * Will be invoked by the collection view during an update to determine where the collection view should scroll to when applying the update.
     * This method can be overriden by layout objects to control the scroll offset after the update, for example to keep the first element visible after the update.
     * The default implementation returns the supplied offset point.
     * @param offset <BMPoint>      The current scroll offset.
     * @return <BMPoint>            The preferred scroll offset.
     */
    preferredScrollOffsetWithOffset: function (offset) {
        return offset;
    },

    /**
     * Will be invoked by the collection view during a layout change to determine where the collection view should scroll to when applying this layout.
     * This method can be overriden by layout objects to control the scroll offset after the update, for example to keep the first element visible after the update.
     * The default implementation returns the supplied offset point.
	 * @param fromLayout <BMCollectionViewLayout>		The previous layout.
	 * {
     * 	@param withOffset <BMPoint>      				The current scroll offset.
	 * }
     * @return <BMPoint>            					The preferred scroll offset.
     */
    preferredScrollOffsetForTransitionFromLayout: function (fromLayout, args) {
        return this.preferredScrollOffsetWithOffset(args.withOffset);
    },
    
    /**
	 * Will be invoked by the collection view to determine the initial attributes for a cell whose position has changed.
	 * It should be implemented by layout objects to supply the old position of a moving cell.
	 * This function recieves both the old and the new index paths as parameters.
	 * The two index paths may be identical, which implies that this cell moved because cells in other sections have been removed or added
	 * and this cell moves as a result.
	 * The default implementation will simply return the attributes for the new index path with the opacity set to 0.
	 * @param indexPath <BMIndexPath>										The old index path.
	 * {
	 *	@param toIndexPath <BMIndexPath>									The new index path.
	 *	@param withTargetAttributes <BMCollectionViewLayoutAttributes>		The cell's current attributes.
	 * }
	 * @return <BMCollectionViewLayoutAttributes>							The attributes.
	 */
	initialAttributesForMovingCellFromIndexPath: function (indexPath, options) {
		var attributes = options.withTargetAttributes.copy(); //this.attributesForCellAtIndexPath(options.toIndexPath);
		attributes.style = {opacity: 0};
		return attributes;
	},
    
    /**
	 * Will be invoked by the collection view to determine the initial attributes for a supplementary view whose position has changed.
	 * It should be implemented by layout objects to supply the old position of a moving supplementary view.
	 * This function only receives the new index path as a parameter. Since the layout object itself controls the index paths of
	 * supplementary views, it should determine on its own how the supplementary view was changed.
	 * The default implementation will simply return the attributes for the new index path with the opacity set to 0.
	 * @param identifier <String>											The supplementary view's reuse identifier.
	 * {
	 *	@param atIndexPath <BMIndexPath>									The index path.
	 *	@param withTargetAttributes <BMCollectionViewLayoutAttributes>		The cell's current attributes.
	 * }
	 * @return <BMCollectionViewLayoutAttributes>							The attributes.
	 */
	initialAttributesForMovingSupplementaryViewWithIdentifier: function (identifier, options) {
		var attributes = options.withTargetAttributes.copy(); //this.attributesForSupplementaryViewWithIdentifier(identifier, {atIndexPath: options.atIndexPath});
		attributes.style = {opacity: 0};
		return attributes;
	},

    /**
     * Will be invoked by the collection view to determine the initial attributes for a cell that was added to the collection.
     * It may be implemented by layout objects to customize the appearance of newly added cells.
     * The default implementation will return the default layout attributes with the scale and opacity set to 0.
     * This method will be invoked after collectionViewWillStartUpdates() and before collectionViewDidStartUpdates().
     * @param indexPath <BMIndexPath>       								The index path.
	 * {
	 *	@param withTargetAttributes <BMCollectionViewLayoutAttributes>		The cell's current attributes.
	 * }
     * @return <BMCollectionViewLayoutAttributes>           				The attributes.
     */
    initialAttributesForAppearingCellAtIndexPath: function (indexPath, args) {
        var attributes = args.withTargetAttributes.copy(); //this.attributesForCellAtIndexPath(indexPath);
        attributes.style = {
            scaleX: 0,
            scaleY: 0,
            opacity: 0
        };
        return attributes;
    },

    /**
     * Will be invoked by the collection view to determine the initial attributes for a supplementary view that was added to the collection.
     * It may be implemented by layout objects to customize the appearance of newly added supplementary views.
     * The default implementation will return the default layout attributes with the scale and opacity set to 0.
     * This method will be invoked after collectionViewWillStartUpdates() and before collectionViewDidStartUpdates().
     * @param identifier <String>           								The supplementary view's identifier.
     * {
     *  @param atIndexPath <BMIndexPath>      								The index path.
	 *	@param withTargetAttributes <BMCollectionViewLayoutAttributes>		The cell's current attributes.
     * }
     * @return <BMCollectionViewLayoutAttributes>           				The attributes.
     */
    initialAttributesForAppearingSupplementaryViewWithIdentifier: function (identifier, options) {
        var attributes = options.withTargetAttributes.copy();//this.attributesForSupplementaryViewWithIdentifier(identifier, {atIndexPath: options.atIndexPath});
        attributes.style = {
            scaleX: 0,
            scaleY: 0,
            opacity: 0
        };
        return attributes;
    },
	
	/**
	 * Will be invoked by the collection view to determine the initial attributes for a cell that was previously hidden but has become visible.
	 * It may be implemented by layout objects to customize the appearance of cells that become visible.
	 * The default implementation will return the result of invoking initialAttributesForAppearingCellAtIndexPath().
	 * This method will be invoked after collectionViewWillStartUpdates() and before collectionViewDidStartUpdates().
	 * @param indexPath <BMIndexPath>       								The index path.
	 * {
	 *	@param withTargetAttributes <BMCollectionViewLayoutAttributes>		The cell's current attributes.
	 * }
	 * @return <BMCollectionViewLayoutAttributes>           				The attributes.
	 */
	initialAttributesForRevealingCellAtIndexPath: function (indexPath, args) {
		return this.initialAttributesForAppearingCellAtIndexPath(indexPath, args);
	},

	/**
	 * Will be invoked by the collection view to determine the initial attributes for a supplementary view that was previously hidden but has become visible.
	 * It may be implemented by layout objects to customize the appearance of supplementary views that become visible.
	 * The default implementation will return the result of invoking initialAttributesForAppearingSupplementaryViewWithIdentifier().
	 * This method will be invoked after collectionViewWillStartUpdates() and before collectionViewDidStartUpdates().
	 * @param identifier <String>           								The supplementary view's identifier.
	 * {
	 *  @param atIndexPath <BMIndexPath>      								The index path.
	 *	@param withTargetAttributes <BMCollectionViewLayoutAttributes>		The cell's current attributes.
	 * }
	 * @return <BMCollectionViewLayoutAttributes>           				The attributes.
	 */
	initialAttributesForRevealingSupplementaryViewWithIdentifier: function (identifier, options) {
		return this.initialAttributesForAppearingSupplementaryViewWithIdentifier(identifier, options);
	},

    /**
     * Will be invoked by the collection view to determine the initial attributes for a cell that is presented for the first time.
     * It may be implemented by layout objects to customize the appearance of the introduction animation.
     * The default implementation will return the default layout attributes with the scale and opacity set to 0.
     * This method will only be invoked once for each visible cell after the collection first receives data.
     * @param indexPath <BMIndexPath>       								The index path.
	 * {
	 *	@param withTargetAttributes <BMCollectionViewLayoutAttributes>		The cell's current attributes.
	 * }
     * @return <BMCollectionViewLayoutAttributes>           				The attributes.
     */
    initialAttributesForPresentedCellAtIndexPath: function (indexPath, args) {
        var attributes = args.withTargetAttributes.copy();//this.attributesForCellAtIndexPath(indexPath);
        attributes.style = {
            scaleX: 0,
            scaleY: 0,
            opacity: 0
        };
        return attributes;
    },

    /**
     * Will be invoked by the collection view to determine the initial attributes for a supplementary view that is presented for the first time.
     * It may be implemented by layout objects to customize the appearance of the introduction animation.
     * The default implementation will return the default layout attributes with the scale and opacity set to 0.
     * This method will only be invoked once for each visible supplementary view after the collection first receives data.
     * @param identifier <String>           								The supplementary view's identifier.
     * {
     *  @param atIndexPath <BMIndexPath>      								The index path.
	 *	@param withTargetAttributes <BMCollectionViewLayoutAttributes>		The cell's current attributes.
     * }
     * @return <BMCollectionViewLayoutAttributes>           				The attributes.
     */
    initialAttributesForPresentedSupplementaryViewWithIdentifier: function (identifier, options) {
        var attributes = options.withTargetAttributes.copy(); //this.attributesForSupplementaryViewWithIdentifier(identifier, {atIndexPath: options.atIndexPath});
        attributes.style = {
            scaleX: 0,
            scaleY: 0,
            opacity: 0
        };
        return attributes;
    },

    /**
     * Will be invoked by the collection view to determine which supplementary views should be added to the collection during an update.
     * This method will be invoked after collectionViewWillStartUpdates() and before collectionViewDidStartUpdates().
     * The default implementation returns an empty array.
     * @return <[BMCollectionViewLayoutAttributes]>     	An array of cell attributes that contain the supplementary view index paths and their identifiers, 
     *														or an empty array if no supplementary views should be added.
     *														The cell attributes returned by this method are not required to have valid frames.
     */
    supplementaryViewsToInsert: function () {
        return [];
    },

    /**
     * Will be invoked by the collection view to determine the final attributes for a cell that was removed from the collection.
     * It may be implemented by layout objects to customize the appearance of removed cells.
     * The default implementation will return the default layout attributes with the scale and opacity set to 0.
     * This method will be invoked after collectionViewWillStartUpdates() and before collectionViewDidStartUpdates().
     * @param indexPath <BMIndexPath>       								The index path.
	 * {
	 *	@param withTargetAttributes <BMCollectionViewLayoutAttributes>		The cell's current attributes.
	 * }
     * @return <BMCollectionViewLayoutAttributes>           				The attributes.
     */
    finalAttributesForDisappearingCellAtIndexPath: function (indexPath, args) {
        var attributes = args.withTargetAttributes.copy(); //this.attributesForCellAtIndexPath(indexPath);
        attributes.style = {
            scaleX: 0,
            scaleY: 0,
            opacity: 0
        };
        return attributes;
    },

    /**
     * Will be invoked by the collection view to determine the final attributes for a supplementary view that was removed from the collection.
     * It may be implemented by layout objects to customize the appearance of removed supplementary views.
     * The default implementation will return the default layout attributes with the scale and opacity set to 0.
     * This method will be invoked after collectionViewWillStartUpdates() and before collectionViewDidStartUpdates().
     * @param identifier <String>           								The supplementary view's identifier.
     * {
     *  @param atIndexPath <BMIndexPath>       								The index path.
	 *	@param withTargetAttributes <BMCollectionViewLayoutAttributes>		The cell's current attributes.
     * }
     * @return <BMCollectionViewLayoutAttributes>           				The attributes.
     */
    finalAttributesForDisappearingSupplementaryViewWithIdentifier: function (identifier, options) {
        var attributes = options.withTargetAttributes.copy(); //this.attributesForSupplementaryViewWithIdentifier(identifier, {atIndexPath: options.atIndexPath});
        attributes.style = {
            scaleX: 0,
            scaleY: 0,
            opacity: 0
        };
        return attributes;
    },
	
	/**
	 * Will be invoked by the collection view to determine the final attributes for a cell that has become hidden.
	 * It may be implemented by layout objects to customize the appearance of hidden cells.
	 * The default implementation will return the result of invoking finalAttributesForDisappearingCellAtIndexPath().
	 * This method will be invoked after collectionViewWillStartUpdates() and before collectionViewDidStartUpdates().
	 * @param indexPath <BMIndexPath>       								The index path.
	 * {
	 *	@param withTargetAttributes <BMCollectionViewLayoutAttributes>		The cell's current attributes.
	 * }
	 * @return <BMCollectionViewLayoutAttributes>           				The attributes.
	 */
	finalAttributesForHidingCellAtIndexPath: function (indexPath, args) {
		return this.finalAttributesForDisappearingCellAtIndexPath(indexPath, args);
	},

	/**
	 * Will be invoked by the collection view to determine the final attributes for a supplementary view that has become hidden.
	 * It may be implemented by layout objects to customize the appearance of hidden supplementary views.
	 * The default implementation will return the result of invoking finalAttributesForDisappearingSupplementaryViewWithIdentifier().
	 * This method will be invoked after collectionViewWillStartUpdates() and before collectionViewDidStartUpdates().
	 * @param identifier <String>           								The supplementary view's identifier.
	 * {
	 *  @param atIndexPath <BMIndexPath>       								The index path.
	 *	@param withTargetAttributes <BMCollectionViewLayoutAttributes>		The cell's current attributes.
	 * }
	 * @return <BMCollectionViewLayoutAttributes>           				The attributes.
	 */
	finalAttributesForHidingSupplementaryViewWithIdentifier: function (identifier, options) {
		return this.finalAttributesForDisappearingSupplementaryViewWithIdentifier(identifier, options);
	},

    /**
     * Will be invoked by the collection view to determine which supplementary views should be deleted from the collection during an update.
     * This method will be invoked after collectionViewWillStartUpdates() and before collectionViewDidStartUpdates().
     * The default implementation returns an empty array.
     * @return <[BMCollectionViewLayoutAttributes]>     	An array of cell attributes that contain the supplementary view index paths and their identifiers, 
     *														or an empty array if no supplementary views should be removed.
     *														The cell attributes returned by this method are not required to have valid frames.
     */
    supplementaryViewsToDelete: function () {
        return [];
    },

    /**
     * Invalidates the layout and causes it to be recalculated.
     * This will invoke invalidateLayout() on the collection view.
     * If this layout object is not associated with any collection view, invoking this method will have no effect.
     */
    invalidateLayout: function () {
		// If a batch update is in progress, suppress this invalidation
		if (this._copy) return;

        if (this._collectionView) this._collectionView.invalidateLayout();
    },

    /**
     * Invalidates the content size and causes it to be reapplied.
     * This will invoke invalidateContentSize() on the collection view.
     * If this layout object is not associated with any collection view, invoking this method will have no effect.
     */
    invalidateContentSize: function () {
		// If a batch update is in progress, suppress this invalidation
		if (this._copy) return;

        if (this._collectionView) this._collectionView.invalidateContentSize();
    },
    
    /**
	 * Invalidates the parts of the layout that have changed and need to be recalculated.
	 * This will invoke invalidateLayoutWithContext() on the collection view.
	 * If this layout object is not associated with any collection view, invoking this method will have no effect.
	 */
    invalidateLayoutWithContext: function (context, args) {
	    if (this._collectionView) this._collectionView.invalidateLayoutWithContext(context, args);
    },

    /**
     * Will be invoked by the collection view whenever the frame changes, for example when the window is resized.
     * Layout objects should return YES from this method if the new frame requires a new layout.
     * The default implementation returns YES in all cases.
     * @param frame <BMRect>        The new frame.
     * @return <Boolean>            True if the new frame requires a new layout, false otherwise.
     */
    shouldInvalidateLayoutForFrameChange: function (frame) {
        return YES;
    },

    /**
     * Will be invoked by the collection view whenever the bounds change, for example when the user is scrolling.
     * Layout objects should return YES from this method if the new bounds require a new layout.
     * The default implementation returns NO in all cases.
     * @param bounds <BMRect>       The new bounds.
     * @return <Boolean>            True if the new frame requires a new layout, false otherwise.
     */
    shouldInvalidateLayoutForBoundsChange: function (bounds) {
        return NO;
    },

    /**
     * Will be invoked by the collection view whenever the layout has finished invalidating after a bounds change.
     * Layout objects can implement this method to perform any final changes after a bounds change invalidation.
     * The default implementation does nothing.
     */
    didInvalidateLayoutForBoundsChange: function () {
	    
	},
	
	/**
	 * Invoked by the collection to determine the rect that it should scroll to in order to focus on 
	 * the cell at the given index path.
	 * By default, this method retrieves the attributes for the cell at the given index path, then returns
	 * the frame property of those attributes.
	 * Layout subtypes may override this method to provide custom bounding boxes. For example, when
	 * cell positions change depending on the current scroll position, subtypes may override this method
	 * to return the correct position that the collection view should scroll to in order to reveal the given index path.
	 * If the attributes cannot be determined, the method will return a rect that causes the collection view to scroll back to the top.
	 * @param indexPath <BMIndexPath>			The index path.
	 * @return <BMRect>							A rect.
	 */
	rectWithScrollingPositionOfCellAtIndexPath: function (indexPath) {
		var attributes = this.attributesForCellAtIndexPath(indexPath);

		if (attributes) return attributes.frame;

		return BMRectMake();
	},
	
	/**
	 * Invoked by the collection to determine the rect that it should scroll to in order to focus on 
	 * the supplementary view of the given type at the given index path.
	 * By default, this method retrieves the attributes for the supplementary view at the given index path, then returns
	 * the frame property of those attributes.
	 * Layout subtypes may override this method to provide custom bounding boxes. For example, when
	 * cell positions change depending on the current scroll position, subtypes may override this method
	 * to return the correct position that the collection view should scroll to in order to reveal the given index path.
	 * If the attributes cannot be determined, the method will return a rect that causes the collection view to scroll back to the top.
	 * @param indexPath <BMIndexPath>			The index path.
	 * @return <BMRect>							A rect.
	 */
	rectWithScrollingPositionOfSupplementaryViewWithIdentifier: function (identifier, args) {
		var attributes = this.attributesForSupplementaryViewWithIdentifier(identifier, args);

		if (attributes) return attributes.frame;

		return BMRectMake();
	},

	/**
	 * May be set to `YES` by layout objects in order to snap the scroll position to certain breakpoints.
	 * When layout objects return `YES` from this method, the collection view will invoke the
	 * `snappingScrollOffsetForScrollOffset(_, {withVerticalDirection, horizontalDirection})` method to determine what point it should snap its scroll to.
	 */
	get snapsScrollPosition() { // <Boolean>
		return NO;
	},

	/**
	 * Invoked by the collection view when this layout supports snapping scroll positions to determine the snapping scroll offset
	 * for the given scroll offset.
	 * Layout object must return a valid scroll offset from this method.
	 * @param offset <BMPoint>											The current scroll offset.
	 * {
	 *	@param withVerticalDirection <BMScrollingDirectionVertical>		The terminal vertical scrolling direction.
	 *	@param horizontalDirection <BMScrollingDirectionHorizontal>		The terminal horizontal scrolling direction.
	 * }
	 * @return <BMPoint>												The scroll offset to which the collection view should snap.
	 */
	snappingScrollOffsetForScrollOffset: function (offset, args) {
		return offset;
	},

	/**
	 * Invoked by collection view when a dragging operation is about to begin and the index paths of the items
	 * is about to shift. Layout subclasses may override this method to prepare for this change.
	 * 
	 * If the user drops the item in an invalid position, collection view will invoke the `dragOperationWillRollback()` method
	 * and immediately follow with an animated data update to move the item back.
	 * 
	 * When the operation completes, collection view will invoke the `dragOperationDidFinish()` method and finalize updating
	 * the item's new position in the data set.
	 * 
	 * The default implementation does nothing.
	 */
	prepareForDragOperation() {

	},

	/**
	 * Invoked by collection view when a drag and drop operation finishes in a point where there is no index path
	 * and the operation should be rolled back.
	 * Subclasses should override this method to undo any changes they may have made when preparing for that drag
	 * operation.
	 * The default implementation does nothing.
	 */
	dragOperationWillRollback() {

	},

	/**
	 * Invoked by collection view when a drag and drop operation finishes in a point where there is an index path
	 * and the dragged item is about to be moved to the new index path.
	 * Subclasses should override this method to prepare for the changes.
	 * The default implementation does nothing.
	 */
	dragOperationDidFinish() {

	},

	/**
	 * Invoked by collection view when measuring a cell to obtain additional constraints to apply to the cell during the measurement.
	 * Layout subclasses can override this method and return an array of constraints that they would like the cell to use, for example
	 * to specify maximum or minimum sizes.
	 * The constraints returned by this method should not be marked as active; collection view will activate these constraints as needed.
	 * The default implementation returns an empty array.
	 * @param cell <BMCollectionViewCell>			The cell that is being measured.
	 * {
	 * 	@param atIndexPath <BMIndexPath>			The index path of the measured cell.
	 * }
	 * @return <[BMLayoutConstraint]>				An array of layout constraints.
	 */
	constraintsForMeasuringCell(cell, {atIndexPath}) {
		return [];
	},
    
    /**
	 * Should be implemented by layout objects that support copying.
	 * @return <BMCollectionViewLayout>		A copy of this layout object. The copy should not be bound to any collection view.
	 */
    copy: function () {
	    throw new Error('Layout objects that support copying should implement the copy() method.');
	},

	/**
	 * Should be overriden by layout objects that support sateful copying and return `YES` to let collection view know
	 * that it can perform animated layout changes using a stateful copy.
	 * Layout objects that return `YES` from this getter must also implement the `statefulCopy()` method.
	 * 
	 * The default implementation returns `NO`.
	 */
	get supportsStatefulCopying() {
		return NO;
	},

	/**
	 * Should be implemented by layout objects that support stateful copying.
	 * Unlike a regular copy, a stateful copy is expected to also retain the internal state of the layout.
	 * When this method is implemented by a layout subclass, it should also override its `supportsStatefulCopying` property
	 * to return `YES`.
	 * 
	 * Stateful copies, when implemented, are used by collection view during animated layout changes to
	 * avoid having to prepare the layout on the copy layout. When a stateful copy is created, collection view will
	 * assume that it can directly use the layout copy to request attributes without any additional preparation.
	 * 
	 * When creating a stateful copy, the state should not be shared between the new copy and the original layout object.
	 * 
	 * The default implementation returns the result of copying this layout.
	 * @return <BMCollectionViewLayout>		A stateful copy of this layout.
	 */
	statefulCopy() {
		return this.copy();
	}

}

// @endtype

// @type BMCollectionViewLayoutInvalidationContext

/**
 * An invalidation context is an object that describes which parts of the layout should be changed during an invalidation.
 * Layout objects that support invalidation contexts can use these objects to optimize their invalidation process and
 * only update the parts of the layout that have actually changed.
 *
 * To use invalidation contexts, create a subtype of the base invalidation context type and define the properties that
 * represent the parts of the layout that can be updated independently. Then, when the layout should be invalidated, create an invalidation context and invoke the
 * invalidateLayoutWithContext method on the collection view, passing in the newly created invalidation context.
 *
 * Invalidation context subtypes must invoke the base initializer at some point during initialization.
 *
 * The collection view itself will create its own invalidation contexts as part of certain changes. Layout objects that support invalidation
 * contexts should override the <code>invalidationContextType</code> property to return the correct type. The collection view will use that type when creating
 * new invalidation contexts.
 *
 * During a layout update, the current invalidation context can be retrieved through the collection view's <code>invalidationContext</code> property.
 */
function BMCollectionViewLayoutInvalidationContext() {} // <constructor>

BMCollectionViewLayoutInvalidationContext.prototype = {
	
	/**
	 * Indicates whether the entire layout should be invalidated or not.
	 */
	invalidateEverything: NO, // <Boolean>
	
	/**
	 * Indicates whether or not the data set counts have changed.
	 */
	invalidateDataSetCounts: NO, // <Boolean>
	
	/**
	 * If set to a size, this represents the amounts by which the content size should change.
	 * When this attribute is supplied, the collection view will not query the layout for the new content size.
	 */
	contentSizeAdjustment: undefined, // <BMSize>
	
	/**
	 * An array of index paths that represent the cells that were invalidated.
	 */
	invalidatedCellIndexPaths: undefined, // <[BMIndexPath], nullable>
	
	/**
	 * A dictionary whose keys represent the identifiers and values the index paths of supplementary views that were invalidated.
	 */
	invalidatedSupplementaryViewIndexPaths: undefined, // <Object<String, [BMIndexPath]>, nullable>
	
};

// @endtype

// @type BMCollectionViewTransitionLayout extends BMCollectionViewLayout

/**
 * A specialized layout object that manages the transition between two different layout objects.
 * A transition layout is temporarily installed on a collection view when its setLayout() method is invoked with the animated parameter set to YES.
 * The transition layout should not be created and used directly. A collection view will automatically create, manage and destroy a transition layout
 * as part of an animated layout change.
 * @param attributes <[_BMCollectionViewTransitionCellAttributes]>		The transition cell attributes.
 * @param initialSize <BMSize>											The content size supplied by the source layout.
 * @param targetSize <BMSize>											The content size supplied by the target layout.
 * @param targetLayout <BMCollectionViewLayout>							The layout to which this transition layout transitions.
 */
var _BMCollectionViewTransitionLayout = function (attributes, initialSize, targetSize, targetLayout) { // <constructor>
	this.transitionAttributes = attributes;
	
	this.initialSize = initialSize;
	this.targetSize = targetSize;
	this.targetLayout = targetLayout;
};

_BMCollectionViewTransitionLayout.prototype = BMExtend({}, BMCollectionViewLayout.prototype, {
	
	/**
	 * Controls how close to completion the transition is.
	 */
	_fraction: 0, // <Number>
	get fraction() { return this._fraction; },
	set fraction(fraction) {
		// If this is no longer attached to a collection view, don't perform any changes
		if (!this.collectionView) return;

		this._fraction = fraction;
		
		var attributesLength = this.transitionAttributes.length;
		for (var i = 0; i < attributesLength; i++) {
			this.transitionAttributes[i].fraction = fraction;
		}
		
		//this.collectionView.invalidateLayoutForBoundsChange();
	},
	
	// @override - BMCollectionViewLayout
    attributesForElementsInRect: function (rect) {
	    return this.transitionAttributes;
    },
	
	// @override - BMCollectionViewLayout
    contentSize: function () {
	    return BMSizeMake(
		    BMNumberByInterpolatingNumbersWithFraction(this.initialSize.width, this.targetSize.width, this._fraction),
		    BMNumberByInterpolatingNumbersWithFraction(this.initialSize.height, this.targetSize.height, this._fraction)
	    );
    },
	
	// @override - BMCollectionViewLayout
	attributesForCellAtIndexPath: function (indexPath, args) {
		// First try to return the transition attributes, if they are available
		for (let attribute of this.transitionAttributes) {
			if (attribute.indexPath.isEqualToIndexPath(indexPath, {usingComparator: this.collectionView.identityComparator})) {
				return attribute;
			}
		}
		return this.targetLayout.attributesForCellAtIndexPath(indexPath, args);
	},
	
	// @override - BMCollectionViewLayout
	attributesForSupplementaryViewWithIdentifier: function (identifier, args) {
		return this.targetLayout.attributesForSupplementaryViewWithIdentifier(identifier, args);
	}, 

	/**
	 * Invoked by the collection view at the end of a layout transition.
	 * Causes the transition layout to apply the final attributes to all animated cells.
	 */
	_applyFinalAttributes: function () {
		
		var attributesLength = this.transitionAttributes.length;
		for (var i = 0; i < attributesLength; i++) {
			this.transitionAttributes[i]._applyFinalAttributes();
		}

	},

	/**
	 * Invoked by the collection view at the beginning of a layout transition.
	 * Causes the transition layout to run an animated layout pass on all animated cells.
	 */
	_layout() {
		
		var attributesLength = this.transitionAttributes.length;
		for (var i = 0; i < attributesLength; i++) {
			this.transitionAttributes[i]._layout();
		}

		this.collectionView._cellLayoutQueue.dequeue();
	}
	
});

// @endtype

// @type BMCollectionViewTableLayoutSupplementaryView

/**
 * Constants representing the types of supplementary views that table layouts support.
 */
var BMCollectionViewTableLayoutSupplementaryView = Object.freeze({
	/**
	 * Indicates that this supplementary view is a footer.
	 */
	Footer: "Footer", // <enum>
	
	/**
	 * Indicates that this supplementary view is a header.
	 */
	Header: "Header", // <enum>
	
	/**
	 * Indicates that this supplementary is an empty content view.
	 */
	Empty: "Empty" // <enum>
});

// @type

// @type BMCollectionViewTableLayout extends BMCollectionViewLayout

/**
 * @deprecated Use `BMCollectionViewFlowLayout` with the `maximumCellsPerRow` property set to `1`.
 * 
 * A basic layout implementation, the BMCollectionViewTableLayout will lay out its elements as a list where each row can have
 * either a fixed height or a variable height.
 *
 * If the row heights are variable, the collection must have a delegate that implements the 
 * Number collectionViewRowHeightForCellAtIndexPath(BMCollectionView, BMIndexPath) method.
 *
 * Optionally, the table layout may also generate supplementary views for section headers and section footers.
 */
var BMCollectionViewTableLayout = function () {}; // <constructor>

/**
 * A value which may be assigned to the rowHeight property to indicate that the row heights vary by row.
 */
var BMCollectionViewTableLayoutRowHeightVariable = -1; // <Number>

BMExtend(BMCollectionViewTableLayout.prototype, BMCollectionViewLayout.prototype, {

	// @override - BMCollectionViewLayout
	get supportsCopying() {
		return YES;
	},
	
	/**
	 * The row height to use for each row.
	 * This can either be a specific size in pixels or BMCollectionViewTableLayoutRowHeightVariable if each row can have a different height.
	 * If the row heights are variable, the collection must have a delegate that implements the Number collectionViewRowHeightForCellAtIndexPath(BMCollectionView, BMIndexPath) method.
	 */
	_rowHeight: 44, // <Number>
	
	get rowHeight() { return this._rowHeight; },
	set rowHeight(rowHeight) {
		this._rowHeight = rowHeight;
		this.invalidateLayout();
	},

	/**
	 * The minimum width to use for each row.
	 * If this value is greater than the collection view's frame width, the rows will have this width applied to them.
	 */
	_minimumWidth: 0, // <Number>

	get minimumWidth() { return this._minimumWidth; },
	set minimumWidth(width) {
		this._minimumWidth = width;
		this.invalidateLayout();
	},
	
	/**
	 * Determines whether or not the table layout should generate header supplementary views or not.
	 */
	_showsHeaders: NO, // <Boolean>
	
	get showsHeaders() { return this._showsHeaders; },
	set showsHeaders(showsHeaders) {
		this._showsHeaders = showsHeaders;
		this.invalidateLayout();
	},
	
	/**
	 * The height to use for headers. Does not have any effect if showsHeaders is set to NO.
	 * This attribute is always 0 if showsHeader is set to NO.
	 */
	_headerHeight: 22, // <Number>
	
	get headerHeight() { 
		return this._showsHeaders ? this._headerHeight : 0; 
	},
	
	set headerHeight(headerHeight) {
		this._headerHeight = headerHeight;
		if (this._showsHeader) this.invalidateLayout();
	},
	
	/**
	 * Determines whether or not the table layout should generate footer supplementary views or not.
	 */
	_showsFooters: NO, // <Boolean>
	
	get showsFooters() { return this._showsFooters; },
	set showsFooters(showsFooters) {
		this._showsFooters = showsFooters;
		this.invalidateLayout();
	},
	
	/**
	 * The height to use for footers. Does not have any effect if showsFooters is set to NO.
	 * This attribute is always 0 if showsFooters is set to NO.
	 */
	_footerHeight: 22, // <Number>
	
	get footerHeight() { 
		return this._showsFooters? this._footerHeight : 0; 
	},
	
	set footerHeight(footerHeight) {
		this._footerHeight = footerHeight;
		if (this._showsFooters) this.invalidateLayout();
	},
	
	/**
	 * The insets to apply to each section which control their distance from the collection view edges and from other sections.
	 */
	_sectionInsets: BMInsetMake(), // <BMInset, nullResettable>
	
	get sectionInsets() { return this._sectionInsets; },
	set sectionInsets(insets) {
		this._sectionInsets = insets || BMInsetMake();
		this.invalidateLayout();
	},
	
	/**
	 * When set to YES, the table layout will stick the header supplementary views to the top edge of the collection view while scrolling.
	 * Otherwise, the header supplementary views will scroll with the rest of the content.
	 */
	_pinsHeadersToContentEdge: NO, // <Boolean>
	
	get pinsHeadersToContentEdge() { return this._pinsHeadersToContentEdge; },
	set pinsHeadersToContentEdge(pins) {
		this._pinsHeadersToContentEdge = pins;
		this.invalidateLayout();
	},
	
	/**
	 * When set to YES, the table layout will stick the footer supplementary views to the bottom edge of the collection view while scrolling.
	 * Otherwise, the footer supplementary views will scroll with the rest of the content.
	 */
	_pinsFootersToContentEdge: NO, // <Boolean>
	
	get pinsFootersToContentEdge() { return this._pinsFootersToContentEdge; },
	set pinsFootersToContentEdge(pins) {
		this._pinsFootersToContentEdge = pins;
		this.invalidateLayout();
	},

	// The cached content size.
	_cachedContentSize: undefined, // <BMSize>

	// @override - BMCollectionViewLayout
	constraintsForMeasuringCell(cell, {atIndexPath}) {
		// In table layout, cells are required to be as wide as the collection view's frame
		return [BMLayoutConstraint.constraintWithView(cell, {attribute: BMLayoutAttribute.Width, constant: this.collectionView.frame.size.width})]
	},

	prepareLayout() {
		return this.contentSize();
	},
	
	// @override
	contentSize: function () {
		
		// Each section adds height for its insets and headers and footers
		var insetTop = this._sectionInsets.top;
		var insetBottom = this._sectionInsets.bottom;
		
		var headerHeight = this.headerHeight;
		var footerHeight = this.footerHeight;
		
		var height = 0;
		
		//var sections = this.collectionView.sections;
		var sectionCount = this.collectionView.numberOfSections();
		height += sectionCount * (headerHeight + footerHeight + insetTop + insetBottom);
		
		if (this._rowHeight >= 0) {
			
			for (var i = 0; i < sectionCount; i++) {
				height += this._rowHeight * this.collectionView.numberOfObjectsInSectionAtIndex(i);
			}
			
		}
		else {
			
			// If the rows have variable heights, the layout must query the delegate for each item's size
			for (var i = 0; i < sectionCount; i++) {
				var itemCount = this.collectionView.numberOfObjectsInSectionAtIndex(i);
				for (var j = 0; j < itemCount; j++) {
					height += this.collectionView.delegate.collectionViewRowHeightForCellAtIndexPath(
							this.collectionView, 
							this.collectionView.indexPathForObjectAtRow(j, {inSectionAtIndex: i})
						);
				}
			}
			
		}
			
		this._cachedContentSize = BMSizeMake(
			Math.max(this.collectionView.frame.size.width, this.minimumWidth + this.collectionView.scrollBarSize), 
			Math.max(this.collectionView.frame.size.height, height)
		);
		return this._cachedContentSize;
			
	},
	
	// @override - BMCollectionViewLayout
	shouldInvalidateLayoutForBoundsChange: function (bounds) {
		return this._pinsHeadersToContentEdge || this._pinsFootersToContentEdge;
	},

	// @override - BMCollectionViewTableLayout
	shouldInvalidateLayoutForFrameChange() {
		// Because the measured size of the cells is dependent upon the size of collection view's frame, in addition
		// to invalidating the layout, the measured size of cells should also be invalidated.
		this.collectionView.invalidateMeasuredSizeOfCells();
		return YES;
	},
    
    // @override
    attributesForCellAtIndexPath: function (indexPath) { 
		var row = indexPath.row;
		var section = indexPath.section;
		
		var sectionPaddingTop = this._sectionInsets.top + this.headerHeight;
		var sectionPaddingBottom = this._sectionInsets.bottom + this.footerHeight;
		
		var top = (section + 1) * sectionPaddingTop + section * sectionPaddingBottom;

		var useOffset = this._cachedContentSize.height > this.collectionView.frame.size.height;
		
		if (this._rowHeight >= 0) {
			// The count has to include the current section, so it includes objects that may be in the same section before the current object
			for (var i = 0; i <= section; i++) {
				// If the count has reached the current section, it will stop at the current object rather than the end of the section
				var itemCount = i == section ? row : this.collectionView.numberOfObjectsInSectionAtIndex(i);
				
				top += this._rowHeight * itemCount;
			}
		}
		else {
			
			// If the rows have variable heights, the layout must query the delegate for each item's size
			
			// The count has to include the current section, so it includes objects that may be in the same section before the current object
			for (var i = 0; i <= section; i++) {
				
				// If the count has reached the current section, it will stop at the current object rather than the end of the section
				var itemCount = i == section ? row : this.collectionView.numberOfObjectsInSectionAtIndex(i);
				
				for (var j = 0; j < itemCount; j++) {
					top += this.collectionView.delegate.collectionViewRowHeightForCellAtIndexPath(
							this.collectionView, 
							this.collectionView.indexPathForObjectAtRow(j, {inSectionAtIndex: i})
						);
				}
			}
		}
		
		var frame = BMRectMake(this._sectionInsets.left, 
							top, 
							Math.max(this.collectionView.frame.size.width, this.minimumWidth + this.collectionView.scrollBarSize) - this._sectionInsets.left - this._sectionInsets.right - (useOffset ? this.collectionView.scrollBarSize : 0), 
							this._rowHeight >= 0 ? this._rowHeight : this.collectionView.delegate.collectionViewRowHeightForCellAtIndexPath(
								this.collectionView,
								indexPath
							)
						);
						
		var attributes = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(indexPath);
		attributes.frame = frame;
		
		return attributes;
		
	},
	
	/**
	 * Retrieves the base attributes for the given supplementary view, before adjusting for pinned headers or footers.
	 * @param identifier <String>					The supplementary view's type identifier.
	 * {
	 *	@param atIndexPath <BMIndexPath>			The supplementary view's index path.
	 * }
	 * @return <BMCollectionViewLayoutAttributes>	The index path with additional information.
	 */
	attributesForSupplementaryViewWithIdentifier: function (identifier, options) {
		
		var useOffset = this._cachedContentSize.height > this.collectionView.frame.size.height;
		
		// The empty supplementary view will always ever have one instance with a preset index path
		if (identifier === BMCollectionViewTableLayoutSupplementaryView.Empty) {
			var attribute = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
								BMCollectionViewTableLayoutSupplementaryView.Empty, 
								{atIndexPath: BMIndexPathMakeWithIndexes([0])}
							);
							
			attribute.frame = BMRectMake(0, 0, this.collectionView.frame.size.width, this.collectionView.frame.size.height);
			return attribute;
		}
		
		var section = options.atIndexPath.section;
		
		if (section >= this.collectionView.numberOfSections()) return undefined;
		
		// The caret moves through the index paths until it reaches the target section
		var caret = this.sectionInsets.top;
		
		var hasVariableRowHeights = this._rowHeight < 0;
		var sectionSpacing = this.sectionInsets.top + this.sectionInsets.bottom;
		
		var cellPositionX = this.sectionInsets.left;
		var cellWidth = Math.max(this.collectionView.frame.size.width, this.minimumWidth + this.collectionView.scrollBarSize) - this.sectionInsets.left - this.sectionInsets.right - (useOffset ? this.collectionView.scrollBarSize : 0);
		
		// These variables are used to verify if the target section is the topmost or bottommost one, 
		// to pin their header and footers to collection view edges if needed
		var isTopmostSection = NO;
		var isBottommostSection = NO;
		
		var scrollOffset = this.collectionView.scrollOffset;
		var frame = this.collectionView.frame;
		
		var topEdge;
		
		// Skip all index paths until the target section
		for (var i = 0; i < section; i++) {
		
			topEdge = caret + sectionSpacing;
			
			// Skip headers, footers and insets
			caret += this.headerHeight + this.footerHeight + sectionSpacing;
			
			var objectCount = this.collectionView.numberOfObjectsInSectionAtIndex(i);
			
			// Skip the contents
			if (hasVariableRowHeights) {
				for (var j = 0; j < objectCount; j++) {
					caret += this.collectionView.delegate.collectionViewRowHeightForCellAtIndexPath(this.collectionView, this.collectionView.indexPathForObjectAtRow(j, {inSectionAtIndex: i}));
				}
			}
			else {
				caret += objectCount * this._rowHeight;
			}
		}
			
		// Verify if this section is the topmost or bottommost section
		if (topEdge < scrollOffset.y && caret > scrollOffset.y) {
			isTopmostSection = YES;
		}
		else {
			isTopmostSection = NO;
		}
		
		if (topEdge > scrollOffset.y && caret > scrollOffset.y + frame.size.height) {
			isBottommostSection = YES;
		}
		else {
			isBottommostSection = NO;
		}
		
		if (identifier === BMCollectionViewTableLayoutSupplementaryView.Header) {
			// For headers, the caret will stop directly at the specified header
			var attributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(BMCollectionViewTableLayoutSupplementaryView.Header, {atIndexPath: options.atIndexPath});
			attributes.frame = BMRectMake(cellPositionX, caret, cellWidth, this.headerHeight);
			
			// If this header is in the topmost section and the layout pins headers to content edges, adjust the position of the frame
			if (this._pinsHeadersToContentEdge && isTopmostSection) {
				attributes.frame.origin.y = Math.max(attributes.frame.origin.y, scrollOffset.y);
				// Float the header above the content
				attributes.style.zIndex = 1;
			}
			
			return attributes;
		}
		else if (identifier === BMCollectionViewTableLayoutSupplementaryView.Footer) {
			// For footers, the caret will stop at the end of the section
			
			// Skip the contents
			var objectCount = this.collectionView.numberOfObjectsInSectionAtIndex(i);
			if (hasVariableRowHeights) {
				for (var j = 0; j < objectCount; j++) {
					caret += this.collectionView.delegate.collectionViewRowHeightForCellAtIndexPath(this.collectionView, this.collectionView.indexPathForObjectAtRow(j, {inSectionAtIndex: i}));
				}
			}
			else {
				caret += objectCount * this._rowHeight;
			}
			
			// And skip the header as well
			caret += this.headerHeight;
			
			var attributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(BMCollectionViewTableLayoutSupplementaryView.Footer, {atIndexPath: options.atIndexPath});
			attributes.frame = BMRectMake(cellPositionX, caret, cellWidth, this.footerHeight);
			
			// If this footer is in the bottommost section and the layout pins footers to content edges, adjust the position of the frame
			if (this._pinsHeadersToContentEdge && isBottommostSection) {
				attributes.frame.origin.y = Math.min(attributes.frame.origin.y, scrollOffset.y + this.collectionView.frame.size.height - attributes.frame.size.height);
				// Float the header above the content
				attributes.style.zIndex = 1;
			}
			
			return attributes;
		}
		
		// Other types of supplementary views are not supported.
		return undefined;
		
	},
	
	/**
	 * @deprecated Currently unused.
	 * Retrieves the index path of the cell that intersects the given point.
	 * The x position of the point is ignored; this method assumes that all rows have infinite width.
	 * If no cell intersects the point, this method will either return the previous 
	 * or the next closest index path, depending on its direction parameter.
	 * @param point <BMPoint>						The point.
	 * {
	 *	@param directionNext <Boolean, nullable>	Defaults to NO. If set to YES, this method will return 
	 *												the next closest index path to the given point if no cell intersects it;
	 *												otherwise the previous closest index path is returned.
	 * }
	 * @return <BMIndexPath, nullable>				The intersecting index path or undefined if the collection view contains no data.
	 */
	indexPathAtPoint: function (point, args) {
		args = args || {};
		var returnNext = args.directionNext;
		
		var y = point.y;
		
		// To determine the index path, the caret will continue to move through the index paths until it stops at the requested point.
		var caret = 0;
		
		var sectionPaddingTop = this._sectionInsets.top + this.headerHeight;
		var sectionPaddingBottom = this._sectionInsets.bottom + this.footerHeight;
		
		if (y <= sectionPaddingTop) return this.collectionView.indexPathForObjectAtRow(0, {inSectionAtIndex: 0});
		
		caret = sectionPaddingTop;
		
		var sectionCount = this.collectionView.numberOfSections();
		
		if (this._rowHeight >= 0) {
			for (var i = 0; i < sectionCount; i++) {
				var objectCount = this.collectionView.numberOfObjectsInSectionAtIndex(i);
				
				
				// Check if the requested point is less than the point obtained by adding the heights of the rows in the current section
				// If it is, the requested point will be on one of these rows
				if (y <= caret + objectCount * this._rowHeight) {
					// The caret intersects one of the rows
					var distance = y - caret;
					var row = Math.floor(distance / this._rowHeight) | 0;
					
					return this.collectionView.indexPathForObjectAtRow(row, {inSectionAtIndex: i});
				}
				
				// Otherwise advance the caret past these rows
				caret += objectCount * this._rowHeight;
				
				// If the requested point is less than the point obtained by adding the paddings between sections, the point falls between the current section
				// and the next one
				if (y <= caret + sectionPaddingBottom + sectionPaddingTop) {
					// The caret doesn't intersect any row
					
					if (returnNext) {
						if (i < sectionCount - 1) {
							// TODO: Handle empty sections
							return this.collectionView.indexPathForObjectAtRow(0, {inSectionAtIndex: i + 1});
						}
						else {
							// TODO: Handle empty sections
							// If this is the last section, there is no next item to return
							return this.collectionView.indexPathForObjectAtRow(objectCount - 1, {inSectionAtIndex: i});
						}
					}
					else {
						// TODO: Handle empty sections
						// If the previous item should be returned, it is the last item in the current section
						return this.collectionView.indexPathForObjectAtRow(objectCount - 1, {inSectionAtIndex: i});
					}
				}
				
				// Otherwise advance the caret to the next section
				caret += sectionPaddingBottom + sectionPaddingTop;
			}
			
			// TODO: Handle empty sections
			// If none of the previous cases has returned any index path, the target point falls below all the content and the only closest item is the last one
			return this.collectionView.indexPathForObjectAtRow(this.collectionView.numberOfObjectsInSectionAtIndex(sectionCount - 1), {inSectionAtIndex: sectionCount - 1});
		}
		else {
			for (var i = 0; i < sectionCount; i++) {
				var objectCount = this.collectionView.numberOfObjectsInSectionAtIndex(i);
				
				// When dealing with variable height rows, each row must be treated separately
				for (var j = 0; j < objectCount; j++) {
					var rowHeight = this.collectionView.delegate.collectionViewRowHeightForCellAtIndexPath(
							this.collectionView, 
							this.collectionView.indexPathForObjectAtRow(j, {inSectionAtIndex: i})
						);
					
					// The logic is similar to the one used for fixed-height rows, except that each row
					// must be verified separately rather than in bulk.
					if (y <= caret + rowHeight) {
						// The point intesects this row
						return this.collectionView.indexPathForObjectAtRow(j, {inSectionAtIndex: i});
					}
					
					// Otherwise advance to the next one
					caret += rowHeight;
				}
				
				// If the requested point is less than the point obtained by adding the paddings between sections, the point falls between the current section
				// and the next one
				if (y <= caret + sectionPaddingBottom + sectionPaddingTop) {
					// The caret doesn't intersect any row
					
					if (returnNext) {
						if (i < sectionCount - 1) {
							return this.collectionView.indexPathForObjectAtRow(0, {inSectionAtIndex: i + 1});
						}
						else {
							// If this is the last section, there is no next item to return
							return this.collectionView.indexPathForObjectAtRow(objectCount - 1, {inSectionAtIndex: i});
						}
					}
					else {
						// If the previous item should be returned, it is the last item in the current section
						return this.collectionView.indexPathForObjectAtRow(objectCount - 1, {inSectionAtIndex: i});
					}
				}
				
				// Otherwise advance the caret to the next section
				caret += sectionPaddingBottom + sectionPaddingTop;
			}
			
			// If none of the previous cases has returned any index path, the target point falls below all the content and the only closest item is the last one
			return this.collectionView.indexPathForObjectAtRow(this.collectionView.numberOfObjectsInSectionAtIndex(sectionCount - 1), {inSectionAtIndex: sectionCount - 1});
		}
		
	},

    // @override
    attributesForElementsInRect: function (rect) { 
		
		var useOffset = this._cachedContentSize.height > this.collectionView.frame.size.height;
	    
	    // When there are no sections in the collection view, this method will always return a single instance of attributes
	    // for the empty supplementary view
	    if (this.collectionView.numberOfSections() == 0) {
			var attribute = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
								BMCollectionViewTableLayoutSupplementaryView.Empty, 
								{atIndexPath: BMIndexPathMakeWithIndexes([0])}
							);
							
			attribute.frame = BMRectMake(0, 0, this.collectionView.frame.size.width, this.collectionView.frame.size.height);
			return [attribute];
	    }
	    
	    // The caret moves through the index paths until it reaches the end of the target rect
	    var caret = this._sectionInsets.top;
	    
		var hasVariableRowHeights = this._rowHeight < 0;
	    
		var sectionPaddingTop = this._sectionInsets.top + this.headerHeight;
		var sectionPaddingBottom = this._sectionInsets.bottom + this.footerHeight;
		
		var cellPositionX = this.sectionInsets.left;
		var cellWidth = Math.max(this.collectionView.frame.size.width, this.minimumWidth + this.collectionView.scrollBarSize) - this.sectionInsets.left - this.sectionInsets.right - (useOffset ? this.collectionView.scrollBarSize : 0);
		
		var topLimit = rect.origin.y;
		var bottomLimit = rect.bottom;
		
		var section = 0;
		var row = -1;
		
		// Skip the index paths that do not intersect this rect
		while (true) {
			// Check if the header intersects the rect
			if (caret + this.headerHeight > topLimit) {
				break;
			}

			// Otherwise move the caret below the header				
			caret += this.headerHeight;
			row = 0;
				
			if (hasVariableRowHeights) {
				var sectionObjectCount = this.collectionView.numberOfObjectsInSectionAtIndex(section);
				
				for (var i = 0; i < sectionObjectCount; i++) {
					var indexPath = this.collectionView.indexPathForObjectAtRow(i, {inSectionAtIndex: section});
					var rowHeight = this.collectionView.delegate.collectionViewRowHeightForCellAtIndexPath(this.collectionView, indexPath);
					if (caret + rowHeight > topLimit) {
						row = i;
						break;
					}
					
					caret += rowHeight;
				}
				
				row = i;
			}
			else {
				var sectionHeight = this.collectionView.numberOfObjectsInSectionAtIndex(section) * this._rowHeight;
				
				// Check if the contents intersect this rect
				if (caret + sectionHeight > topLimit) {
					var targetIndex = Math.floor((topLimit - caret) / this._rowHeight);
					row = targetIndex;
					
					caret += targetIndex * this._rowHeight;
					break;
				}
			
				// Otherwise move the caret to the footer
				row = this.collectionView.numberOfObjectsInSectionAtIndex(section);
				caret += sectionHeight;
			}
			
			// Check if the footer intersects the rect
			if (caret + this.footerHeight > topLimit) {
				break;
			}
			
			// Otherwise move on to the next section
			caret += this.footerHeight + this.sectionInsets.top + this.sectionInsets.bottom;
			section++;
			row = -1;
			
			// If the section index is out of bounds; there are no elements in the target rect
			if (section >= this.collectionView.numberOfSections()) return [];
			
		}
		
		// When the while loop exits, the caret is positioned at the first visible index path and attributes may be added
		var attributes = [];
		
		var topmostSection = section;
		
		// If this layout pins headers to the content edge and the first index path is not this section's header, create its attributes
		// now and add it to the attributes array
		if (this._pinsHeadersToContentEdge && row > -1) {
			var attribute = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
								BMCollectionViewTableLayoutSupplementaryView.Header, 
								{atIndexPath: BMIndexPathMakeWithIndexes([section])}
							);
							
			attribute.frame = BMRectMake(cellPositionX, this.collectionView.scrollOffset.y, cellWidth, this.headerHeight);
			
			// Float the header above the content
			attribute.style.zIndex = 1;
			
			attributes.push(attribute);
		}
		
		var bottommostSection = section;
		var lastFooterAttributes, lastFooterAttributesSection;
		
		// Continue adding attributes until the bottom of the rect is reached
		while (caret < bottomLimit) {
			
			// If the section index is out of bounds; there are no more elements in the target rect
			if (section >= this.collectionView.numberOfSections()) break;
			
			// Otherwise this might be the bottommost section
			bottommostSection = section;
			
			// The caret is at a header
			if (row == -1) {
				if (!this.showsHeaders) {
					row = 0;
					continue;
				}
				
				var attribute = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
									BMCollectionViewTableLayoutSupplementaryView.Header, 
									{atIndexPath: BMIndexPathMakeWithIndexes([section])}
								);
								
				attribute.frame = BMRectMake(cellPositionX, caret, cellWidth, this.headerHeight);
				
				// If the layout pins headers to content edges and this is the topmost section, adjust the header's attributes
				if (this._pinsHeadersToContentEdge && section === topmostSection) {
													
					// If the header's Y origin is lower than the content edge, the topmost section is an incoming section
					// and the previous section's header should be rendered as outgoing
					if (attribute.frame.origin.y > this.collectionView.scrollOffset.y) {
						var previousSection = section - 1;
						if (previousSection > -1) {
							var previousHeaderAttributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
								BMCollectionViewTableLayoutSupplementaryView.Header,
								{atIndexPath: BMIndexPathMakeWithIndexes([section - 1])}
							);
							previousHeaderAttributes.frame = BMRectMake(
								cellPositionX, 
								Math.min(this.collectionView.scrollOffset.y, attribute.frame.origin.y - this.headerHeight),
								cellWidth,
								this.headerHeight	
							);
							previousHeaderAttributes.style.zIndex = 1;
							attributes.push(previousHeaderAttributes);
						}
					}
					
					
					// Header attributes can only be pinned downwards - this is to resolve the case where the first section has additional padding to the top edge.
					// In that case, the header should remain visible at its regular position, rather than being shifted upwards.
					attribute.frame.origin.y = Math.max(this.collectionView.scrollOffset.y, attribute.frame.origin.y);
					
					// Float the header above the content
					attribute.style.zIndex = 1;
				}
				
				attributes.push(attribute);
				
				caret += this.headerHeight;
				row = 0;
				
				continue;
			}
			
			// The caret is at a footer
			if (row == this.collectionView.numberOfObjectsInSectionAtIndex(section)) {
				if (!this.showsFooters) {
					row = -1;
					section++;
					caret += this.footerHeight + this.sectionInsets.top + this.sectionInsets.bottom;
					continue;
				}
				
				var attribute = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
									BMCollectionViewTableLayoutSupplementaryView.Footer, 
									{atIndexPath: BMIndexPathMakeWithIndexes([section])}
								);
								
				attribute.frame = BMRectMake(cellPositionX, caret, cellWidth, this.footerHeight);
				attributes.push(attribute);
				
				// Retain these attributes in case they have to be adjust for edge pinning
				lastFooterAttributes = attribute;
				lastFooterAttributesSection = section;
				
				caret += this.footerHeight + this.sectionInsets.top + this.sectionInsets.bottom;
				
				row = -1;
				section++;
				
				continue;
			}
			
			// If the section index is out of bounds; there are no more elements left to add
			if (section >= this.collectionView.numberOfSections()) return attributes;
			
			// If the row doesn't match any of the other conditions, it is inside the section
			var indexPath = this.collectionView.indexPathForObjectAtRow(row, {inSectionAtIndex: section});
			var attribute = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(indexPath);
			attribute.frame = BMRectMake(cellPositionX, 
											caret, 
											cellWidth,
											hasVariableRowHeights ? this.collectionView.delegate.collectionViewRowHeightForCellAtIndexPath(this.collectionView, indexPath) : this._rowHeight
							);
							
			attributes.push(attribute);
			caret += attribute.frame.size.height;
			
			row++;
		}
		
		// If the footers are pinned to the content edge, create or retrieve the correct footer attributes for the bottommost section
		// And adjust their position to the bottom edge of the collection view
		if (this._pinsFootersToContentEdge) {
			// Header attributes can only be pinned upwards - this is to resolve the case where the last section has additional padding to the bottom edge.
			// In that case, the footer should remain visible at its regular position, rather than being shifted downwards.
			if (bottommostSection === lastFooterAttributesSection) {
												
				// If the footer's Y origin is higher than the content edge, the bottommost section is an outgoing section
				// and the next section's footer should be rendered as incoming
				if (lastFooterAttributes.frame.origin.y < this.collectionView.scrollOffset.y + this.collectionView.frame.size.height - this.footerHeight) {
					var nextSection = lastFooterAttributesSection + 1;
					if (nextSection < this.collectionView.numberOfSections()) {
						var nextFooterAttributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
							BMCollectionViewTableLayoutSupplementaryView.Footer,
							{atIndexPath: BMIndexPathMakeWithIndexes([lastFooterAttributesSection + 1])}
						);
						
						nextFooterAttributes.frame = BMRectMake(
							cellPositionX, 
							Math.max(this.collectionView.scrollOffset.y + this.collectionView.frame.size.height - this.footerHeight, lastFooterAttributes.frame.bottom),
							cellWidth,
							this.footerHeight	
						);
						
						attributes.push(nextFooterAttributes);
					}
				}
				
				// If the footer attributes were already created, they just have to be adjusted
				lastFooterAttributes.frame.origin.y = Math.min(lastFooterAttributes.frame.origin.y, this.collectionView.scrollOffset.y + this.collectionView.frame.size.height - lastFooterAttributes.frame.size.height);
					
				// Float the header above the content
				lastFooterAttributes.style.zIndex = 1;
			}
			else {
				// If the attributes were not already created, they should be created now
				var attribute = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
									BMCollectionViewTableLayoutSupplementaryView.Footer, 
									{atIndexPath: BMIndexPathMakeWithIndexes([bottommostSection])}
								);
								
				// If the attributes were not already created, then there is no chance they would appear above the bottom content edge, as they would normally
				// appear below the currently visible area
				attribute.frame = BMRectMake(cellPositionX, this.collectionView.scrollOffset.y + this.collectionView.frame.size.height - this.footerHeight, cellWidth, this.footerHeight);
					
				// Float the header above the content
				attribute.style.zIndex = 1;
					
				attributes.push(attribute);
			}
		}
		
		return attributes;
		
	},

    // @override - BMCollectionViewLayout
    initialAttributesForPresentedCellAtIndexPath: function (indexPath) {
        var attributes = this.attributesForCellAtIndexPath(indexPath).copy();
        
        if (this.collectionView.delegate && this.collectionView.delegate.collectionViewInitialAttributesForPresentedCellAtIndexPath) {
	        return this.collectionView.delegate.collectionViewInitialAttributesForPresentedCellAtIndexPath(this.collectionView, indexPath, {withTargetAttributes: attributes});
        }
        
        attributes.frame.origin.x += attributes.frame.size.width / 2;
        
        attributes.style = {
            opacity: 0,
            translateZ: 0
        };
        
        return attributes;
    },

    // @override - BMCollectionViewLayout
    initialAttributesForPresentedSupplementaryViewWithIdentifier: function (identifier, options) {
        var attributes = this.attributesForSupplementaryViewWithIdentifier(identifier, {atIndexPath: options.atIndexPath}).copy();
        
        if (this.collectionView.delegate && this.collectionView.delegate.collectionViewInitialAttributesForPresentedSupplementaryViewWithIdentifier) {
	        return this.collectionView.delegate.collectionViewInitialAttributesForPresentedSupplementaryViewWithIdentifier(this.collectionView, identifier, {atIndexPath: options.atIndexPath, withTargetAttributes: attributes});
        }
        
        attributes.frame.origin.x += attributes.frame.size.width / 2;
        
        attributes.style = {
            opacity: 0,
            translateZ: 0
        };
        
        return attributes;
    },
	
	// @override
	initialAttributesForAppearingCellAtIndexPath: function (indexPath) {
		var attributes = this.attributesForCellAtIndexPath(indexPath).copy();
        
        if (this.collectionView.delegate && this.collectionView.delegate.collectionViewInitialAttributesForAppearingCellAtIndexPath) {
	        return this.collectionView.delegate.collectionViewInitialAttributesForAppearingCellAtIndexPath(this.collectionView, indexPath, {withTargetAttributes: attributes});
        }
		
		attributes.frame.origin.x += attributes.frame.size.width / 2;
		attributes.style = {opacity: 0, translateZ: 0};
		
		return attributes;
		
	},
	
	// @override
	initialAttributesForAppearingSupplementaryViewWithIdentifier: function (identifier, options) {
		var attributes = this.attributesForSupplementaryViewWithIdentifier(identifier, {atIndexPath: options.atIndexPath}).copy();
        
        if (this.collectionView.delegate && this.collectionView.delegate.collectionViewInitialAttributesForAppearingSupplementaryViewWithIdentifier) {
	        return this.collectionView.delegate.collectionViewInitialAttributesForAppearingSupplementaryViewWithIdentifier(this.collectionView, identifier, {atIndexPath: options.atIndexPath, withTargetAttributes: attributes});
        }
		
		attributes.frame.origin.x += attributes.frame.size.width / 2;
		attributes.style = {opacity: 0, translateZ: 0};
		
		return attributes;
		
	},
	
	// @override
	initialAttributesForMovingCellFromIndexPath: function (indexPath, options) {
		var attributes;
		var self = this;
		this.collectionView.usingOldDataSet(function () {
			attributes = self.attributesForCellAtIndexPath(indexPath);
		});
		
		return attributes;
	},
    
    // @override
	initialAttributesForMovingSupplementaryViewWithIdentifier: function (identifier, options) {
		var attributes;
		var self = this;
		this.collectionView.usingOldDataSet(function () {
			attributes = self.attributesForSupplementaryViewWithIdentifier(identifier, {atIndexPath: options.atIndexPath});
		});
		
		return attributes;
	},

    // @override
    supplementaryViewsToInsert: function () {
	    var count = this.collectionView.numberOfSections();
	    var oldCount;
	    var self = this;
	    this.collectionView.usingOldDataSet(function () {
		    oldCount = self.collectionView.numberOfSections();
	    });
	    
	    var views = [];
	    
	    for (var i = oldCount; i < count; i++) {
		    if (this.showsHeaders) {
			    views.push(BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
										BMCollectionViewTableLayoutSupplementaryView.Header, 
										{atIndexPath: BMIndexPathMakeWithIndexes([i])}
									));
		    }
		    
		    if (this.showsFooters) {
			    views.push(BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
										BMCollectionViewTableLayoutSupplementaryView.Footer, 
										{atIndexPath: BMIndexPathMakeWithIndexes([i])}
									));
		    }
	    }
	    
	    if (oldCount > 0 && count == 0) {
		    views.push(BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
									BMCollectionViewTableLayoutSupplementaryView.Empty, 
									{atIndexPath: BMIndexPathMakeWithIndexes([0])}
								));
	    }
	    
        return views;
    },

    // @override
    supplementaryViewsToDelete: function () {
	    var count = this.collectionView.numberOfSections();
	    var oldCount;
	    var self = this;
	    this.collectionView.usingOldDataSet(function () {
		    oldCount = self.collectionView.numberOfSections();
	    });
	    
	    var views = [];
	    
	    for (var i = count; i < oldCount; i++) {
		    if (this.showsHeaders) {
			    views.push(BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
										BMCollectionViewTableLayoutSupplementaryView.Header, 
										{atIndexPath: BMIndexPathMakeWithIndexes([i])}
									));
		    }
		    
		    if (this.showsFooters) {
			    views.push(BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
										BMCollectionViewTableLayoutSupplementaryView.Footer, 
										{atIndexPath: BMIndexPathMakeWithIndexes([i])}
									));
		    }
	    }
	    
	    if (oldCount == 0 && count > 0) {
		    views.push(BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
									BMCollectionViewTableLayoutSupplementaryView.Empty, 
									{atIndexPath: BMIndexPathMakeWithIndexes([0])}
								));
	    }
	    
        return views;
    },

    // @override
    finalAttributesForDisappearingCellAtIndexPath: function (indexPath) {
        var attributes;
        var self = this;
        
        this.collectionView.usingOldDataSet(function () {
	        attributes = self.attributesForCellAtIndexPath(indexPath).copy();
        
	        if (self.collectionView.delegate && self.collectionView.delegate.collectionViewFinalAttributesForDisappearingCellAtIndexPath) {
		        attributes = self.collectionView.delegate.collectionViewFinalAttributesForDisappearingCellAtIndexPath(self.collectionView, indexPath, {withTargetAttributes: attributes});
	        }
	        else {
				attributes.frame.origin.x -= attributes.frame.size.width / 2;
		        attributes.style = {opacity: 0, translateZ: 0};
	        }
	        
        });
        
        return attributes;
    },

    // @override
    finalAttributesForDisappearingSupplementaryViewWithIdentifier: function (identifier, options) {
        var attributes;
        var self = this;
        
        this.collectionView.usingOldDataSet(function () {
	        attributes = self.attributesForSupplementaryViewWithIdentifier(identifier, {atIndexPath: options.atIndexPath}).copy();
        
	        if (self.collectionView.delegate && self.collectionView.delegate.collectionViewFinalAttributesForDisappearingSupplementaryViewWithIdentifier) {
		        attributes = self.collectionView.delegate.collectionViewFinalAttributesForDisappearingSupplementaryViewWithIdentifier(self.collectionView, identifier, {atIndexPath: options.atIndexPath, withTargetAttributes: attributes});
	        }
	        else {
				attributes.frame.origin.x -= attributes.frame.size.width / 2;
		        attributes.style = {opacity: 0, translateZ: 0};
	        }
	        
        });
        
        return attributes;
    },
	
	// @override - BMCollectionViewLayout
	copy: function () {
		var copy = new BMCollectionViewTableLayout();
		
		copy.rowHeight = this.rowHeight;
		
		copy.showsHeaders = this.showsHeaders;
		copy.headerHeight = this.headerHeight;
		
		copy.showsFooters = this.showsFooters;
		copy.footerHeight = this.footerHeight;
		
		copy.sectionInsets = this.sectionInsets;
		
		copy.pinsHeadersToContentEdge = this.pinsHeadersToContentEdge;
		copy.pinsFootersToContentEdge = this.pinsFootersToContentEdge;
		
		return copy;
	}
	
});

// @endtype

// @type BMCollectionViewTreeLayout extends BMCollectionViewLayout


/**
 * The BMCollectionViewTreeLayout will lay out its elements as a list where each row can have
 * either a fixed height or a variable height. Additionally, the elements may be nested, creating a tree-like view.
 *
 * The tree layout supports collapsible sections and it also supports collapsing the tree elements themselves.
 * Collection views that use the tree layout are required to have a delegate that implements the following methods:
 * String collectionViewLayoutTreeIdentifierForItemAtIndexPath(BMCollectionView, BMCollectionViewTreeLayout, BMIndexPath) - returns a unique identifier for each item in the collection view
 * nullable String collectionViewLayoutTreeParentIdentifierForItemAtIndexPath(BMCollectionView, BMCollectionViewTreeLayout, BMIndexPath) - returns the identifier of each item's parent, if it has one
 *
 * If the row heights are variable, the collection must have a delegate that implements the 
 * Number collectionViewRowHeightForCellAtIndexPath(BMCollectionView, BMIndexPath) method.
 *
 * Optionally, the tree layout may also generate supplementary views for section headers, section footers and empty views.
 */
function BMCollectionViewTreeLayout() {} // <constructor>

BMExtend(BMCollectionViewTreeLayout.prototype, BMCollectionViewLayout.prototype, {

	// @override - BMCollectionViewLayout
	get supportsCopying() {
		return YES;
	},

	/**
	 * The row height to use for each row.
	 * This can either be a specific size in pixels or BMCollectionViewTreeLayoutRowHeightVariable if each row can have a different height.
	 * If the row heights are variable, the collection must have a delegate that implements the Number collectionViewRowHeightForCellAtIndexPath(BMCollectionView, BMIndexPath) method.
	 */
	_rowHeight: 44, // <Number>
	
	get rowHeight() { return this._rowHeight; },
	set rowHeight(rowHeight) {
		this._rowHeight = rowHeight;
		this.invalidateLayout();
	},
	
	/**
	 * Determines whether or not the tree layout should generate header supplementary views or not.
	 */
	_showsHeaders: NO, // <Boolean>
	
	get showsHeaders() { return this._showsHeaders; },
	set showsHeaders(showsHeaders) {
		this._showsHeaders = showsHeaders;
		this.invalidateLayout();
	},
	
	/**
	 * The height to use for headers. Does not have any effect if showsHeaders is set to NO.
	 * This attribute is always 0 if showsHeader is set to NO.
	 */
	_headerHeight: 22, // <Number>
	
	get headerHeight() { 
		return this._showsHeaders ? this._headerHeight : 0; 
	},
	
	set headerHeight(headerHeight) {
		this._headerHeight = headerHeight;
		if (this._showsHeader) this.invalidateLayout();
	},
	
	/**
	 * Determines whether or not the tree layout should generate footer supplementary views or not.
	 */
	_showsFooters: NO, // <Boolean>
	
	get showsFooters() { return this._showsFooters; },
	set showsFooters(showsFooters) {
		this._showsFooters = showsFooters;
		this.invalidateLayout();
	},
	
	/**
	 * The height to use for footers. Does not have any effect if showsFooters is set to NO.
	 * This attribute is always 0 if showsFooters is set to NO.
	 */
	_footerHeight: 22, // <Number>
	
	get footerHeight() { 
		return this._showsFooters? this._footerHeight : 0; 
	},
	
	set footerHeight(footerHeight) {
		this._footerHeight = footerHeight;
		if (this._showsFooters) this.invalidateLayout();
	},
	
	/**
	 * The amount by which child views will be indented.
	 */
	_indentWidth: 22, // <Number>
	
	get indentWidth() {
		return this._indentWidth;
	},
	
	set indentWidth(indentWidth) {
		this._indentWidth = indentWidth;
		this.invalidateLayout();
	},
	
	/**
	 * The insets to apply to each section which control their distance from the collection view edges and from other sections.
	 */
	_sectionInsets: BMInsetMake(), // <BMInset, nullResettable>
	
	get sectionInsets() { return this._sectionInsets; },
	set sectionInsets(insets) {
		this._sectionInsets = insets || BMInsetMake();
		this.invalidateLayout();
	},
	
	/**
	 * When set to YES, the tree layout will stick the header supplementary views to the top edge of the collection view while scrolling.
	 * Otherwise, the header supplementary views will scroll with the rest of the content.
	 */
	_pinsHeadersToContentEdge: NO, // <Boolean>
	
	get pinsHeadersToContentEdge() { return this._pinsHeadersToContentEdge; },
	set pinsHeadersToContentEdge(pins) {
		this._pinsHeadersToContentEdge = pins;
		this.invalidateLayout();
	},
	
	/**
	 * When set to YES, the tree layout will stick the footer supplementary views to the bottom edge of the collection view while scrolling.
	 * Otherwise, the footer supplementary views will scroll with the rest of the content.
	 */
	_pinsFootersToContentEdge: NO, // <Boolean>
	
	get pinsFootersToContentEdge() { return this._pinsFootersToContentEdge; },
	set pinsFootersToContentEdge(pins) {
		this._pinsFootersToContentEdge = pins;
		this.invalidateLayout();
	},


	/**
	 * Contains various cached layout attributes.
	 */
	_layoutCache: undefined, // <Object>
	
	
	// @override - BMCollectionViewLayout
	prepareLayout: function () {
		// Tree layout supports invalidating with context, which allows for more efficient layout updates
		// by only the updating the actually changed content, rather than the entire layout cache
		var context = this.collectionView.invalidationContext;
		
		// If there is no invalidation context, the entire layout cache has to be reconstructed
		if (!context) return this.rebuildLayout();
	},
	
	// @override - BMCollectionViewLayout
	contentSize: function () {
		return this._layoutCache.contentSize;
	},
	
	// @override - BMCollectionViewLayout
	shouldInvalidateLayoutForBoundsChange: function (bounds) {
		return this._pinsHeadersToContentEdge || this._pinsFootersToContentEdge;
	},

	/**
	 * Creates and returns a copy of this tree layout.
	 * @return <BMCollectionViewTreeLayout>		A tree layout.
	 */
	copy() {
		let layout = new BMCollectionViewTreeLayout();

		layout._rowHeight = this._rowHeight;

		layout._showsHeaders = this._showsHeaders;
		layout._headerHeight = this._headerHeight;
		layout._pinsHeadersToContentEdge = this._pinsHeadersToContentEdge;

		layout._showsFooters = this._showsFooters;
		layout._footerHeight = this._footerHeight;
		layout._pinsFootersToContentEdge = this._pinsFootersToContentEdge;

		layout._indentWidth = this._indentWidth;

		layout._sectionInsets = this.sectionInsets.copy();

		return layout;
	}
});

// @endtype

// @type BMCollectionViewFlowLayoutGravity

/**
 * Controls how cells are distributed within their row.
 */
var BMCollectionViewFlowLayoutGravity = Object.freeze({
	
	/**
	 * The cells will flow to the center of the row with no spacing between them.
	 */
	Center: {},
	
	/**
	 * The cells will be aligned to the start of the row.
	 */
	Start: {},
	
	/**
	 * The cells will be aligned to the end of the row.
	 */
	End: {},
	
	/**
	 * The cells will flow to the edges of the row with equal spacing between them.
	 */
	Edge: {},
	
	/**
	 * The cells will flow such that they have equal spacing between them and the row edges.
	 */
	Spaced: {},
	
	/**
	 * The cells will flow such that they will have no spacing between them.
	 * If the cells in a row do not occupy the entire horizontal alrea of that row, they will be expanded proportionally until they do.
	 */
	Expand: {}
	
});

// @endtype

// @type BMCollectionViewFlowLayoutAlignment

var BMCollectionViewFlowLayoutAlignment = (function () {
	const start = {};
	const end = {};

	/**
	 * Controls how cells will be aligned within their row.
	 */
	var BMCollectionViewFlowLayoutAlignment = Object.freeze({
		
		/**
		 * @deprecated Use `Start`
		 * The cells will be aligned to the starting edge of the row.
		 */
		Top: start,
		
		/**
		 * The cells will be aligned to the start of the row.
		 */
		Start: start,
		
		/**
		 * The cells will be aligned to the center of the row.
		 */
		Center: {},
		
		/**
		 * @deprecated Use `End`
		 * The cells will be aligned to the end of the row.
		 */
		Bottom: end,
		
		/**
		 * The cells will be aligned to the end of the row.
		 */
		End: end,
		
		/**
		 * The cells will expand to fit the entire height of the row.
		 */
		Expand: {}
		
	});

	return BMCollectionViewFlowLayoutAlignment;
})();

// @endtype

// @type BMCollectionViewFlowLayoutOrientation

/**
 * An enum containing the possible orientations that the flow layout can use.
 */
var BMCollectionViewFlowLayoutOrientation = Object.freeze({
	/**
	 * Indicates that the flow layout will arrange cells primarily along the horizontal axis.
	 * When the orientation is set to this value the flow layout will scroll horizontally.
	 */
	Horizontal: {},

	/**
	 * Indicates that the flow layout will arrange cells primarily along the vertical axis.
	 * When the orientation is set to this value the tile flow will scroll vertically.
	 */
	Vertical: {}
});

// @endtype

// @type BMCollectionViewFlowLayout extends BMCollectionViewLayout

/**
 * The identifiers for flow layout supplementary views.
 * As the flow layout only provides supplementary views for section headers and footers and empty data sets just like the table layout,
 * the identifiers used by the table layout are reused in this case.
 */
var BMCollectionViewFlowLayoutSupplementaryView = BMCollectionViewTableLayoutSupplementaryView;

/**
 * The flow layout arranges cells in a horiztonally (TO DO) or vertically scrolling container.
 * The cells will each flow on a row until they no longer fit. After they extend past the horizontal margin, they will move on to the next row.
 */
var BMCollectionViewFlowLayout = function () {}; // <constructor>

BMCollectionViewFlowLayout.prototype = BMExtend({}, BMCollectionViewLayout.prototype, {

	// @override - BMCollectionViewLayout
	get supportsCopying() {
		return YES;
	},

	/**
	 * The size of the cells, or undefined if the cells should be sized dynamically.
	 * If the cells are sized dynamically, the collection view must have a delegate that implements the
	 * BMSize collectionViewSizeForCellAtIndexPath(BMCollectionView, BMIndexPath) method, 
	 * otherwise the collection view will not be able to render any cells.
	 */
	_cellSize: undefined, // <BMSize, nullable>
	
	get cellSize() { return this._cellSize; },
	set cellSize(size) {
		this._cellSize = size;
		
		this.invalidateLayout();
	},

	/**
	 * When this property is set to a size, flow layout will use automatic cell sizing to measure and lay out
	 * cells in its collection view. 
	 * 
	 * Because this will cause flow layout to continuously resize the collection view contents, the value of this property 
	 * should represent the size that most cells are expected to be in order to minimize the visual changes to the
	 * scroll bar when cells are measured.
	 */
	_expectedCellSize: undefined, // <BMSize, nullable>

	get expectedCellSize() {
		return this._expectedCellSize;
	},
	set expectedCellSize(cellSize) {
		this._expectedCellSize = cellSize;

		this.invalidateLayout();
	},
	
	/**
	 * The spacing between each row. This is also used between the header and the first row and between the last row and the footer.
	 */
	_rowSpacing: 44, // <Number>
	get rowSpacing() { return this._rowSpacing; },
	set rowSpacing(spacing) {
		this._rowSpacing = spacing;
		
		this.invalidateLayout();
	},
	
	/**
	 * Determines whether or not the table layout should generate header supplementary views or not.
	 */
	_showsHeaders: NO, // <Boolean>
	
	get showsHeaders() { return this._showsHeaders; },
	set showsHeaders(showsHeaders) {
		this._showsHeaders = showsHeaders;
		this.invalidateLayout();
	},
	
	/**
	 * The height to use for headers. Does not have any effect if showsHeaders is set to NO.
	 * This attribute is always 0 if showsHeader is set to NO.
	 */
	_headerHeight: 22, // <Number>
	
	get headerHeight() { 
		return this._showsHeaders ? this._headerHeight : 0; 
	},
	
	set headerHeight(headerHeight) {
		this._headerHeight = headerHeight;
		if (this._showsHeader) this.invalidateLayout();
	},
	
	/**
	 * Determines whether or not the table layout should generate footer supplementary views or not.
	 */
	_showsFooters: NO, // <Boolean>
	
	get showsFooters() { return this._showsFooters; },
	set showsFooters(showsFooters) {
		this._showsFooters = showsFooters;
		this.invalidateLayout();
	},
	
	/**
	 * The height to use for footers. Does not have any effect if showsFooters is set to NO.
	 * This attribute is always 0 if showsFooters is set to NO.
	 */
	_footerHeight: 22, // <Number>
	
	get footerHeight() { 
		return this._showsFooters? this._footerHeight : 0; 
	},
	
	set footerHeight(footerHeight) {
		this._footerHeight = footerHeight;
		if (this._showsFooters) this.invalidateLayout();
	},
	
	/**
	 * The insets to apply to each section which control their distance from the collection view edges and from other sections.
	 */
	_sectionInsets: BMInsetMake(), // <BMInset, nullResettable>
	
	get sectionInsets() { return this._sectionInsets; },
	set sectionInsets(insets) {
		this._sectionInsets = insets || BMInsetMake();
		this.invalidateLayout();
	},
	
	/**
	 * Controls how items are spaced in each row horizontally.
	 */
	_gravity: BMCollectionViewFlowLayoutGravity.Spaced, // <BMCollectionViewFlowLayoutGravity>
	get gravity() { return this._gravity; },
	set gravity(gravity) {
		this._gravity = gravity;
		
		this.invalidateLayout();
	},

	/**
	 * Controls the minimum horizontal spacing between cells. This spacing is guaranteed to be applied between the cells
	 * irrespective of the selected gravity.
	 */
	_minimumSpacing: 0, // <Number>
	get minimumSpacing() { return this._minimumSpacing; },
	set minimumSpacing(spacing) {
		this._minimumSpacing = spacing;

		this.invalidateLayout();
	},

	/**
	 * When set to a positive number, this controls the maximum cells that are allowed to fit in each row.
	 */
	_maximumCellsPerRow: 0, // <Number>
	get maximumCellsPerRow() {
		return this._maximumCellsPerRow;
	},
	set maximumCellsPerRow(max) {
		if (max < 0) max = 0;
		this._maximumCellsPerRow = max;

		this.invalidateLayout();
	},
	
	/**
	 * Only used with fixed cell sizes. If set to YES, the final row in each section will be left-aligned.
	 */
	_leftAlignFinalRow: NO, // <Boolean>
	get leftAlignFinalRow() { return this._leftAlignFinalRow; },
	set leftAlignFinalRow(align) {
		this._leftAlignFinalRow = align;
		
		this.invalidateLayout();
	},
	
	/**
	 * Controls how items are aligned in each row vertically.
	 */
	_alignment: BMCollectionViewFlowLayoutAlignment.Center, // <BMCollectionViewFlowLayoutAlignment>
	get alignment() { return this._alignment; },
	set alignment(alignment) {
		this._alignment = alignment;
		
		this.invalidateLayout();
	},

	/**
	 * Controls the axis along which cells will be laid out primarily.
	 */
	_orientation: BMCollectionViewFlowLayoutOrientation.Vertical, // <BMCollectionViewFlowLayoutOrientation>
	get orientation() { return this._orientation; },
	set orientation(orientation) {
		this._orientation = orientation;
		
		this.invalidateLayout();
	},
	
	/**
	 * The padding from the top edge to the first item.
	 */
	_topPadding: 0, // <Number>
	get topPadding() { return this._topPadding; },
	set topPadding(padding) {
		this._topPadding = padding;
		
		this.invalidateLayout();
	},
	
	/**
	 * The padding from the bottom edge to the last item.
	 */
	_bottomPadding: 0, // <Number>
	get bottomPadding() { return this._bottomPadding; },
	set bottomPadding(padding) {
		this._bottomPadding = padding;
		
		this.invalidateLayout();
	},
	
	/**
	 * Controls how the content is aligned when it is smaller than the collection view's frame.
	 */
	_contentGravity: BMCollectionViewFlowLayoutAlignment.Center, // <BMCollectionViewFlowLayoutAlignment>
	get contentGravity() { return this._contentGravity; },
	set contentGravity(gravity) {
		this._contentGravity = gravity;
		
		this.invalidateLayout();
	},
	
	/**
	 * When set to YES, the flow layout will stick the header supplementary views to the top edge of the collection view while scrolling.
	 * Otherwise, the header supplementary views will scroll with the rest of the content.
	 */
	_pinsHeadersToContentEdge: NO, // <Boolean>
	
	get pinsHeadersToContentEdge() { return this._pinsHeadersToContentEdge; },
	set pinsHeadersToContentEdge(pins) {
		this._pinsHeadersToContentEdge = pins;
		this.invalidateLayout();
	},
	
	/**
	 * When set to YES, the flow layout will stick the footer supplementary views to the bottom edge of the collection view while scrolling.
	 * Otherwise, the footer supplementary views will scroll with the rest of the content.
	 */
	_pinsFootersToContentEdge: NO, // <Boolean>
	
	get pinsFootersToContentEdge() { return this._pinsFootersToContentEdge; },
	set pinsFootersToContentEdge(pins) {
		this._pinsFootersToContentEdge = pins;
		this.invalidateLayout();
	},
	
	
	cachedLayout: undefined, // <Object>
	
	// @override
	collectionViewWillStartUpdates: function (updates) {
		this.prepareLayout();

		// When using automatic cell sizes, this layout preparation will only build a rough outline of the layout,
		// but because of how animated updates work in collection view, it is required to also complete the layout process
		// at least up to the current collection view bounds
		if (this._expectedCellSize) {
			this.cachedLayout.iterator.next({rect: this.collectionView.bounds});
		}
	},
	
	// @override
	collectionViewDidStartUpdates: function () {
		this.previousLayout = undefined;
	},
	
	// @override
	prepareLayout: function () {
		return this._prepareLayoutWithScrollbarOffset(NO);
	},

	/**
	 * Prepares the layout, optionally taking the scrollbar size into account.
	 * @param useOffset <Boolean>			When set to `YES` the layout will take the scrollbar size into account.
	 */
	_prepareLayoutWithScrollbarOffset: function (useOffset) {
		if (this.isChangingBounds) {
			// If the layout is invalidated because of scrolling, it is not required to recalculate the caches, so this request should be ignored.
			return;
		}

		let iterator = this._prepareLayoutWithScrollbarOffsetGenerator(useOffset);

		// When not using automatic cell sizes, the generator function will run to finish from the first
		// invocation of next
		// When using automatic cell sizes, the first iteration will only build a rough outline of the expected layout
		// and must be retained so different portions of the layout can subsequently be computed
		let result = iterator.next();
		if (!result.done) {
			this._layoutIterator = iterator;
			this.cachedLayout.iterator = iterator;
		}
	},

	/**
	 * A generator that iterates through creating the layout. With the exception of using automatic cell sizes,
	 * this generator will execute as a single contiguous function.
	 * 
	 * When using automatic cell sizes, the generator will yield execution and only calculate portions of the layout on demand.
	 * With the exeption of the first invocation, it is required to pass an index path to the iterator's `next` method. The layout process
	 * will continue until it fully lays out the cell for that index path, at which point it will yield again.
	 * @param useOffset <Boolean>			When set to `YES` the layout will take the scrollbar size into account.
	 */
	*_prepareLayoutWithScrollbarOffsetGenerator(useOffset) {
		
		// To standardize naming in order to support the orientation setting, the following terms are used:
		// Length - refers to the dimension across the axis on which collection view scrolls: height for vertical and width for horizontal
		// Breadth - refers to the dimension across the secondary axis: width for vertical and height for horizontal
		// Size - refers to the dimension of cells across the axis on which collection view scrolls: height for vertical and width for horizontal
		// Secondary Size - refers to the dimension of cells across the secondary axis: width for vertical and height for horizontal

		if (this.isChangingBounds) {
			// If the layout is invalidated because of scrolling, it is not required to recalculate the caches, so this request should be ignored.
			return;
		}
		
		// If useOffset is set to YES, this the second layout pass and the previous layout should no longer be changed
		this.previousLayout = useOffset ? this.previousLayout : this.cachedLayout;

		var frameHeight = this.collectionView.frame.size.height;
		var frameWidth = this.collectionView.frame.size.width;
		let frameSize = this._orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? frameHeight : frameWidth;
		
		if (!this._cellSize || this._expectedCellSize) {
			// When using custom cell sizes, the layout will pre-compute the entire layout attributes
			this.cachedLayout = { sections: [] };

			/*
			declare interface BMCollectionViewFlowLayoutCache {
				availableWidth: number;
				availableHeight: number;
				resolvedWidth?: number;
				resolvedHeight?: number;
				resolvedIndexPath?: BMIndexPath;
				sections: {
					top: number;
					bottom: number;
					rows: {
						top: number;
						bottom: number;
						startIndex: number;
						endIndex: number;
						attributes: BMCollectionViewLayoutAttributes[];
					}[];
				}[];
				size: BMSize;
			}
			*/
			
			var cachedLayout = this.cachedLayout;
			
			cachedLayout.pinsHeadersToContentEdge = this._pinsHeadersToContentEdge;
			cachedLayout.pinsFootersToContentEdge = this._pinsFootersToContentEdge;

			let orientation = this._orientation;
			cachedLayout.orientation = orientation;
		
			// Each section adds height for its insets and headers and footers
			var insetTop = this._sectionInsets.top;
			var insetBottom = this._sectionInsets.bottom;
			var insetLeft = this._sectionInsets.left;
			var insetRight = this._sectionInsets.right;
			
			var topPadding = this._topPadding;
			var bottomPadding = this._bottomPadding;
			
			var headerHeight = this.headerHeight;
			var footerHeight = this.footerHeight;

			var left = this._sectionInsets.left;
			let right = this._sectionInsets.right;
			
			// The available height is the collection view frame height minus the vertical insets and the scrollbar width
			// When headers, footers are used their size and the row spacing is included as well
			var height = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? topPadding :
						this.collectionView.frame.size.height - this._sectionInsets.top - this._sectionInsets.bottom - (useOffset ? this.collectionView.scrollBarSize : 0) - topPadding - bottomPadding;
			cachedLayout.availableHeight = height;

			// The available width is the collection view frame width minus the horizontal insets and the scrollbar width
			var width = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? 
						this.collectionView.frame.size.width - this._sectionInsets.left - this._sectionInsets.right - (useOffset ? this.collectionView.scrollBarSize : 0) :
						left;
			cachedLayout.availableWidth = width;
			
			var showsHeaders = this.showsHeaders;
			var showsFooters = this.showsFooters;
			
			var headerHeight = this.headerHeight;
			var footerHeight = this.footerHeight;
			
			var sectionCount = this.collectionView.numberOfSections();
			
			var rowSpacing = this._rowSpacing;

			var minimumSpacing = this._minimumSpacing;

			// When using automatic cell sizes, first compute a preliminary size for the layout then yield,
			// awaiting for collection view to request attributes for cells at which point execution should
			// resume to compute the layout for those attributes
			/*
			declare interface BMCollectionViewAutomaticCellSizeTarget {
				targetIndexPath?: BMIndexPath;
				targetRect?: BMRect;
			}
			*/
			let target;

			if (this._expectedCellSize) {
				cachedLayout.resolvedHeight = 0;
				cachedLayout.resolvedWidth = 0;
				cachedLayout.resolvedIndexPath = BMIndexPathMakeWithRow(-1, {inSectionAtIndex: -1});
				cachedLayout.sectionCount = this.collectionView.numberOfSections();

				let numberOfColumns = this._maximumCellsPerRow;
				let expectedWidth = this._expectedCellSize.width;
				let expectedHeight = this._expectedCellSize.height;
				let expectedSize = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? expectedWidth : expectedHeight;
				let expectedSecondarySize = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? expectedHeight : expectedWidth;
				let maximumLength = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? width : height;
				if (!numberOfColumns) {
					if (cachedLayout.minimumSpacing) {
						// Otherwise it has to be computed
						numberOfColumns = 0;
						let usedLength = 0;
		
						// For spaced gravity, the used width starts with at least two minimum spacings
						if (this._gravity === BMCollectionViewFlowLayoutGravity.Spaced) {
							usedLength = 2 * minimumSpacing;
						}
		
						do {
							// If this cell no longer fits within the row then the column limit has been reached
							if (usedLength && usedLength + expectedSize + minimumSpacing > maximumLength) {
								break;
							}
		
							// For every cell other than the first, also include the required minimum spacing
							if (numberOfColumns) {
								usedLength += minimumSpacing;
							}
		
							usedLength += expectedSize;
							
							numberOfColumns++;
						} while (usedLength < maximumLength && expectedSize);
					}
					else {
						// If there is no minimum spacing required, then the number of columns is simply the available space divided
						// by the cell width
						numberOfColumns = ((maximumLength / expectedSize) | 0) || 1;
					}
				}

				for (let i = 0; i < sectionCount; i++) {
					let numberOfObjects = this.collectionView.numberOfObjectsInSectionAtIndex(i);
					
					let numberOfRows = Math.ceil(numberOfObjects / numberOfColumns) | 0;
					
					let spacingBreadth = (numberOfRows - 1) * rowSpacing;
					if (headerHeight) spacingBreadth += rowSpacing;
					if (footerHeight) spacingBreadth += rowSpacing;
					
					if (orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
						let section = {
							top: height,
							bottom: height + footerHeight + headerHeight + (expectedSecondarySize * numberOfRows) + spacingBreadth,
							numberOfObjects: numberOfObjects
						};
						
						height = section.bottom + insetTop + insetBottom;
						
						// If the total height exceeds the collection view frame height, perform a second layout pass to account for the scrollbars
						if (height > frameHeight) {
							if (this.collectionView.scrollBarSize && !useOffset) return this._prepareLayoutWithScrollbarOffset(YES);
						}
					}
					else {
						let section = {
							left: width,
							right: width + (expectedSecondarySize * numberOfRows) + spacingBreadth,
							numberOfObjects: numberOfObjects
						};
						
						width = section.right + insetLeft + insetRight;
						
						// If the total height exceeds the collection view frame height, perform a second layout pass to account for the scrollbars
						if (width > frameWidth) {
							if (this.collectionView.scrollBarSize && !useOffset) return this._prepareLayoutWithScrollbarOffset(YES);
						}
					}
				}
				
				if (orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
					height += this._bottomPadding;
				
					// If the total height exceeds the collection view frame height, perform a second layout pass to account for the scrollbars
					if (height > frameHeight) {
						if (this.collectionView.scrollBarSize && !useOffset) return this._prepareLayoutWithScrollbarOffset(YES);
					}

					cachedLayout.size = BMSizeMake(this.collectionView.frame.size.width, height);
	
					target = yield;
	
					height = topPadding;
				}
				else {
					if (width > frameWidth) {
						if (this.collectionView.scrollBarSize && !useOffset) return this._prepareLayoutWithScrollbarOffset(YES);
					}

					cachedLayout.size = BMSizeMake(width, this.collectionView.frame.size.height);
	
					target = yield;
	
					width = 0;
				}
			}
			
			// Go through the sections and create the layout attributes for all objects
			for (var i = 0; i < sectionCount; i++) {
				
				// The section is plain old javascript object containing various cached attributes
				// And a rows array. Each item in a rows array is another object that contains
				// cached properties for that row and all the attributes of items in that row.
				var section = {
					rows: []
				};
				
				// Save the cached section
				cachedLayout.sections.push(section);
				
				if (orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
					height += insetTop;
					// Cache the top origin
					section.top = height;
				}
				else {
					width += insetLeft;
					// Cache the top origin
					section.left = width;
				}
				
				if (showsHeaders) {
					if (orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
						// Cache the header attributes if they are enabled
						var headerAttributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
													BMCollectionViewFlowLayoutSupplementaryView.Header, 
													{atIndexPath: BMIndexPathMakeWithIndexes([i])}
												);
										
						headerAttributes.frame = BMRectMake(left, height, width, headerHeight);
						if (this.pinsHeadersToContentEdge) headerAttributes.style = {zIndex: 1};
						
						section.headerAttributes = headerAttributes;
						
						height += headerHeight + rowSpacing;
					}
					else {
						// Cache the header attributes if they are enabled
						var headerAttributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
													BMCollectionViewFlowLayoutSupplementaryView.Header, 
													{atIndexPath: BMIndexPathMakeWithIndexes([i])}
												);
										
						headerAttributes.frame = BMRectMake(width, topPadding + insetTop, headerHeight, height);
						if (this.pinsHeadersToContentEdge) headerAttributes.style = {zIndex: 1};
						
						section.headerAttributes = headerAttributes;
						
						width += headerHeight + rowSpacing;
					}
				}
				
				var sectionItems = this.collectionView.numberOfObjectsInSectionAtIndex(i);
				var sectionIndex = 0;

				let maximumRowLength = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? width : height;
				let lengthAttribute = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? 'width' : 'height';
				let breadthAttribute = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? 'height' : 'width';
				let rowStartAttribute = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? 'top' : 'left';
				
				// Cache the cells in this sections
				while (sectionIndex < sectionItems) {
					
					// Construct new rows until there are no more items in this sections
					var row = {
						top: height,
						left: width,
						attributes: [],
						startIndex: sectionIndex
					};
					
					var rowLength = 0;
					var rowBreadth = 0;

					// For spaced gravity, the used width starts with at least two minimum spacings
					if (this._gravity === BMCollectionViewFlowLayoutGravity.Spaced) {
						rowLength = 2 * minimumSpacing;
					}
					
					while (rowLength < maximumRowLength || maximumRowLength <= 0) {
						// Add items to this row until no more items fit horizontally
						var indexPath = this.collectionView.indexPathForObjectAtRow(sectionIndex, {inSectionAtIndex: i});

						// When using automatic cell sizes, use the measured cell size
						var cellSize = (this._expectedCellSize && this.collectionView.measuredSizeOfCellAtIndexPath(indexPath)) || 
										this.collectionView.delegate.collectionViewSizeForCellAtIndexPath(this.collectionView, indexPath);
						
						// If the item no longer fits in the row, leave it for the next one
						// while making sure that there is at least one object in the row, even if doesn't fit, 
						// otherwise this will lead to an infinite loop
						if (cellSize[lengthAttribute] + rowLength + minimumSpacing > maximumRowLength && row.attributes.length) break;
						
						var cellAttributes = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(indexPath);

						// When using automatic cell sizes, mark these attributes as requiring a measurement
						cellAttributes._requireMeasurement = YES;
						
						// Construct the frame
						if (orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
							cellAttributes.frame = BMRectMake(rowLength, height, cellSize.width, cellSize.height);
						}
						else {
							cellAttributes.frame = BMRectMake(width, rowLength, cellSize.width, cellSize.height);
						}
						
						if (rowBreadth < cellSize[breadthAttribute]) rowBreadth = cellSize[breadthAttribute];
						
						// And add the attributes to the row
						row.attributes.push(cellAttributes);
						
						rowLength += cellSize[lengthAttribute];

						// For all cells other than the first also add the minimum spacing
						if (row.attributes.length > 1) {
							rowLength += minimumSpacing;
						}
						
						// Advance to the next item
						sectionIndex++;

						// If the row height exceeds the collection view frame height, perform a second layout pass to account for the scrollbars
						if (row[rowStartAttribute] + rowBreadth > frameSize) {
							if (this.collectionView.scrollBarSize && !useOffset) return this._prepareLayoutWithScrollbarOffset(YES);
						}
						
						// if there is one
						if (orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
							if (sectionIndex >= sectionItems || width == 0) break;
						}
						else {
							if (sectionIndex >= sectionItems || height == 0) break;
						}

						// Also continue if the number of items added to this row matches the limit of cells
						if (this._maximumCellsPerRow && row.attributes.length == this._maximumCellsPerRow) break;
					}
					
					// Skip empty rows
					if (row.attributes.length) {
						// Flow the items in this row based on the gravity and alignment
						// TODO: Consider lazily reflowing rows to shave the prepareLayout execution time
						if (orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
							this._reflowRow(row, {forLength: width, breadth: rowBreadth, withOccupiedLength: rowLength, spacing: minimumSpacing});
							
							height += rowBreadth;
							
							row.bottom = height;
							row.endIndex = sectionIndex - 1;
							section.rows.push(row);
							
							height += rowSpacing;
						}
						else {
							this._reflowRow(row, {forLength: height, breadth: rowBreadth, withOccupiedLength: rowLength, spacing: minimumSpacing});
							
							width += rowBreadth;
							
							row.right = width;
							row.endIndex = sectionIndex - 1;
							section.rows.push(row);
							
							width += rowSpacing;
						}
					}

					// After having reached the requested target, yield execution when using automatic cell sizes
					if (target) {
						// When using automatic cell size and pinned footers, preliminary footer attributes must be created
						if (showsFooters && this.pinsFootersToContentEdge) {
							if (orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
								let footerAttributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
															BMCollectionViewFlowLayoutSupplementaryView.Footer, 
															{atIndexPath: BMIndexPathMakeWithIndexes([i])}
														);
												
								footerAttributes.frame = BMRectMake(left, height, width, footerHeight);
								footerAttributes.style = {zIndex: 1};
								
								section.footerAttributes = footerAttributes;
							}
							else {
								let footerAttributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
															BMCollectionViewFlowLayoutSupplementaryView.Footer, 
															{atIndexPath: BMIndexPathMakeWithIndexes([i])}
														);
												
								footerAttributes.frame = BMRectMake(width, topPadding + insetTop, footerHeight, height);
								if (this.pinsFootersToContentEdge) footerAttributes.style = {zIndex: 1};
								
								section.footerAttributes = footerAttributes;
							}
						}

						if (target.indexPath) {
							let targetIndexPath = target.indexPath;
							if (targetIndexPath.section < i || (targetIndexPath.section == i && targetIndexPath.row < row.endIndex)) {
								// Retain how much of the layout was resolved
								cachedLayout.resolvedHeight = height;
								cachedLayout.resolvedWidth = width;
								cachedLayout.resolvedIndexPath = row.attributes[row.attributes.length - 1].indexPath;
								if (orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
									if (height > cachedLayout.size.height) {
										cachedLayout.size.height = height + rowSpacing + insetBottom + 1;
										console.log('Layout height has changed to ' + height);
									}
								}
								else {
									if (width > cachedLayout.size.width) {
										cachedLayout.size.width = width + rowSpacing + insetRight + 1;
										console.log('Layout width has changed to ' + width);
									}
								}
								section.bottom = height;
								section.right = width;
								target = yield;
							}
						}
						if (target.rect) {
							let targetRect = target.rect;
							if (height > targetRect.bottom) {
								// Retain how much of the layout was resolved
								cachedLayout.resolvedHeight = height;
								cachedLayout.resolvedWidth = width;
								cachedLayout.resolvedIndexPath = row.attributes[row.attributes.length - 1].indexPath;
								if (orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
									if (height > cachedLayout.size.height) {
										cachedLayout.size.height = height + rowSpacing + insetBottom + 1;
										console.log('Layout height has changed to ' + height);
									}
								}
								else {
									if (width > cachedLayout.size.width) {
										cachedLayout.size.width = width + rowSpacing + insetRight + 1;
										console.log('Layout width has changed to ' + width);
									}
								}
								section.bottom = height;
								section.right = width;
								target = yield;
							}
						}
					}
					
				}

				// Remove the row spacing from the last row
				if (orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
					height -= rowSpacing;
				}
				else {
					width -= rowSpacing;
				}
				
				
				if (showsFooters) {
					if (orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
						height += rowSpacing;
						
						// Cache the footer attributes if they are enabled
						var footerAttributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
													BMCollectionViewFlowLayoutSupplementaryView.Footer, 
													{atIndexPath: BMIndexPathMakeWithIndexes([i])}
												);
										
						footerAttributes.frame = BMRectMake(left, height, width, footerHeight);
						if (this.pinsFootersToContentEdge) footerAttributes.style = {zIndex: 1};
						
						section.footerAttributes = footerAttributes;
						
						height += footerHeight;
						
						// If the total height exceeds the collection view frame height, perform a second layout pass to account for the scrollbars
						if (height > frameHeight) {
							if (this.collectionView.scrollBarSize && !useOffset) return this._prepareLayoutWithScrollbarOffset(YES);
						}
					}
					else {
						width += rowSpacing;
						
						// Cache the footer attributes if they are enabled
						var footerAttributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
													BMCollectionViewFlowLayoutSupplementaryView.Footer, 
													{atIndexPath: BMIndexPathMakeWithIndexes([i])}
												);
										
						footerAttributes.frame = BMRectMake(width, topPadding + insetTop, footerHeight, height);
						if (this.pinsFootersToContentEdge) footerAttributes.style = {zIndex: 1};
						
						section.footerAttributes = footerAttributes;
						
						width += footerHeight;
						
						// If the total height exceeds the collection view frame height, perform a second layout pass to account for the scrollbars
						if (width > frameWidth) {
							if (this.collectionView.scrollBarSize && !useOffset) return this._prepareLayoutWithScrollbarOffset(YES);
						}
					}
				}
				
				
				if (orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
					// Cache the bottom origin
					section.bottom = height;
					
					height += insetBottom;
					
					// If the total height exceeds the collection view frame height, perform a second layout pass to account for the scrollbars
					if (height > frameHeight) {
						if (this.collectionView.scrollBarSize && !useOffset) return this._prepareLayoutWithScrollbarOffset(YES);
					}
				}
				else {
					// Cache the bottom origin
					section.right = width;
					
					width += insetRight;
					
					// If the total height exceeds the collection view frame height, perform a second layout pass to account for the scrollbars
					if (width > frameWidth) {
						if (this.collectionView.scrollBarSize && !useOffset) return this._prepareLayoutWithScrollbarOffset(YES);
					}
				}
				
			}
			
			if (orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
				height += bottomPadding;
				
				// If the total height exceeds the collection view frame height, perform a second layout pass to account for the scrollbars
				if (height > frameHeight) {
					if (this.collectionView.scrollBarSize && !useOffset) return this._prepareLayoutWithScrollbarOffset(YES);
				}
			
				// If the height is lower than the collection view's height, the content gravity must be applied to all cached attributes
				if (height < this.collectionView.frame.size.height) {
					let topAdjustment = 0;
					if (this._contentGravity === BMCollectionViewFlowLayoutAlignment.Center) {
						topAdjustment = ((this.collectionView.frame.size.height - height) / 2) | 0;
					}
					else if (this._contentGravity === BMCollectionViewFlowLayoutAlignment.Bottom) {
						topAdjustment = this.collectionView.frame.size.height - height;
					}
					
					if (topAdjustment != 0) {
						var sectionsLength = cachedLayout.sections.length;
						
						// Displace the sections
						for (var i = 0; i < sectionsLength; i++) {
							var section = cachedLayout.sections[i];
							
							section.top += topAdjustment;
							section.bottom += topAdjustment;
							
							// Displace all the rows in this sections
							var rowsLength = section.rows.length;
							for (var j = 0; j < rowsLength; j++) {
								var row = section.rows[j];
								
								row.top += topAdjustment;
								row.bottom += topAdjustment;
								
								// Displace all the cells in the row
								for (var k = 0; k < row.attributes.length; k++) {
									row.attributes[k].frame.origin.y += topAdjustment;
								}
							}
							
							// Displace the header and footer in this section
							if (section.headerAttributes) section.headerAttributes.frame.origin.y += topAdjustment;
							if (section.footerAttributes) section.footerAttributes.frame.origin.y += topAdjustment;
							
						}
					}
				}
				
				cachedLayout.size = BMSizeMake(this.collectionView.frame.size.width, Math.max(height, this.collectionView.frame.size.height));
			}
			else {
				// If the total height exceeds the collection view frame height, perform a second layout pass to account for the scrollbars
				if (width > frameWidth) {
					if (this.collectionView.scrollBarSize && !useOffset) return this._prepareLayoutWithScrollbarOffset(YES);
				}
			
				// If the height is lower than the collection view's height, the content gravity must be applied to all cached attributes
				if (width < this.collectionView.frame.size.width) {
					let leftAdjustment = 0;
					if (this._contentGravity === BMCollectionViewFlowLayoutAlignment.Center) {
						leftAdjustment = ((this.collectionView.frame.size.width - width) / 2) | 0;
					}
					else if (this._contentGravity === BMCollectionViewFlowLayoutAlignment.Bottom) {
						leftAdjustment = this.collectionView.frame.size.width - width;
					}
					
					if (leftAdjustment != 0) {
						var sectionsLength = cachedLayout.sections.length;
						
						// Displace the sections
						for (var i = 0; i < sectionsLength; i++) {
							var section = cachedLayout.sections[i];
							
							section.left += leftAdjustment;
							section.right += leftAdjustment;
							
							// Displace all the rows in this sections
							var rowsLength = section.rows.length;
							for (var j = 0; j < rowsLength; j++) {
								var row = section.rows[j];
								
								row.left += leftAdjustment;
								row.right += leftAdjustment;
								
								// Displace all the cells in the row
								for (var k = 0; k < row.attributes.length; k++) {
									row.attributes[k].frame.origin.x += leftAdjustment;
								}
							}
							
							// Displace the header and footer in this section
							if (section.headerAttributes) section.headerAttributes.frame.origin.x += leftAdjustment;
							if (section.footerAttributes) section.footerAttributes.frame.origin.x += leftAdjustment;
							
						}
					}
				}
				
				cachedLayout.size = BMSizeMake(Math.max(width, this.collectionView.frame.size.width), this.collectionView.frame.size.height);
			}

			if (this._expectedCellSize && target) this.invalidateContentSize();
			
			
		}
		else {
			// When using fixed cell sizes, the layout will pre-compute the section start and end points
			// and generate prototype row frames for each column count
			// The attributes in these prototype rows will be displaced and reused for all data set rows
			this.cachedLayout = { sections: [], prototypeRows: [] };
			var cachedLayout = this.cachedLayout;

			let orientation = this._orientation;
			cachedLayout.orientation = orientation;
			
			// Cache all layout properties
			cachedLayout.sectionInsets = this.sectionInsets;
			cachedLayout.rowSpacing = this.rowSpacing;
			cachedLayout.showsHeaders = this.showsHeaders;
			cachedLayout.showsFooters = this.showsFooters;
			cachedLayout.headerHeight = this.headerHeight;
			cachedLayout.footerHeight = this.footerHeight;
			cachedLayout.minimumSpacing = this.minimumSpacing;
			cachedLayout.topPadding = this.topPadding;
			cachedLayout.bottomPadding = this.bottomPadding;

			let topPadding = this.topPadding;
			let bottomPadding = this.bottomPadding;
			
			cachedLayout.pinsHeadersToContentEdge = this._pinsHeadersToContentEdge;
			cachedLayout.pinsFootersToContentEdge = this._pinsFootersToContentEdge;
			
			let cellWidth = this.cellSize.width;
			let rowHeight = this.cellSize.height;
			let cellSize = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? cellWidth : rowHeight;
			let breadth = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? rowHeight : cellWidth;
			let rowBreadth = breadth;
			
			cachedLayout.cellWidth = cellWidth;
			cachedLayout.rowHeight = rowHeight;
			cachedLayout.rowBreadth = breadth;
			
			var rowSpacing = this.rowSpacing;
			var minimumSpacing = this.minimumSpacing;
			
			// The available height is the collection view frame height minus the vertical insets and the scrollbar width
			// When headers, footers are used their size and the row spacing is included as well
			var height = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? topPadding :
						this.collectionView.frame.size.height - this._sectionInsets.top - this._sectionInsets.bottom - (useOffset ? this.collectionView.scrollBarSize : 0) - topPadding - bottomPadding;
			cachedLayout.availableHeight = height;

			// The available width is the collection view frame width minus the horizontal insets and the scrollbar width
			var width = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? 
						this.collectionView.frame.size.width - this._sectionInsets.left - this._sectionInsets.right - (useOffset ? this.collectionView.scrollBarSize : 0) :
						left;
			cachedLayout.availableWidth = width;

			var length = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? width : height;

			var numberOfColumns = this._maximumCellsPerRow;
			if (!numberOfColumns) {
				if (cachedLayout.minimumSpacing) {
					// Otherwise it has to be computed
					numberOfColumns = 0;
					var usedLength = 0;
	
					// For spaced gravity, the used width starts with at least two minimum spacings
					if (this._gravity === BMCollectionViewFlowLayoutGravity.Spaced) {
						usedLength = 2 * minimumSpacing;
					}
	
					do {
						// If this cell no longer fits within the row then the column limit has been reached
						if (usedLength && usedLength + cellSize + minimumSpacing > length) {
							break;
						}
	
						// For every cell other than the first, also include the required minimum spacing
						if (numberOfColumns) {
							usedLength += minimumSpacing;
						}
	
						usedLength += cellSize;
						
						numberOfColumns++;
					} while (usedLength < length && cellSize);
				}
				else {
					// If there is no minimum spacing required, then the number of columns is simply the available space divided
					// by the cell width
					numberOfColumns = ((length / cellSize) | 0) || 1;
				}
			}
			cachedLayout.numberOfColumns = numberOfColumns;
			
			// Generate prototype rows for each column count up to the maximum
			for (var i = 0; i < numberOfColumns; i++) {
				var prototypeRow = {attributes: []};
				
				// When the final row is left-aligned all prototype rows have the maximum amount of columns
				var columns = this.leftAlignFinalRow ? numberOfColumns - 1 : i;
				
				var occupiedLength = cellSize * (columns + 1) + minimumSpacing * columns;
				
				// Push the prototype frames
				for (var j = 0; j <= columns; j++) {
					prototypeRow.attributes.push({frame: BMRectMake(0, 0, cellWidth, rowHeight)});
				}
				
				// And reflow the row
				this._reflowRow(prototypeRow, {forLength: length, breadth: breadth, withOccupiedLength: occupiedLength, spacing: minimumSpacing});
				
				cachedLayout.prototypeRows.push(prototypeRow);
				
			}
			
			// Save the section start and end points
			var numberOfSections = this.collectionView.numberOfSections();
		
			// Each section adds height for its insets and headers and footers
			var insetTop = this._sectionInsets.top;
			var insetBottom = this._sectionInsets.bottom;
			let insetLeft = this._sectionInsets.left;
			let insetRight = this._sectionInsets.right;
			
			var headerHeight = this.headerHeight;
			var footerHeight = this.footerHeight;

			if (orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
				let height = insetTop + this._topPadding;
				
				for (var i = 0; i < numberOfSections; i++) {
					var numberOfObjects = this.collectionView.numberOfObjectsInSectionAtIndex(i);
					
					var numberOfRows = Math.ceil(numberOfObjects / numberOfColumns) | 0;
					
					var spacingHeight = (numberOfRows - 1) * rowSpacing;
					if (headerHeight) spacingHeight += rowSpacing;
					if (footerHeight) spacingHeight += rowSpacing;
					
					let section = {
						top: height,
						bottom: height + footerHeight + headerHeight + (rowBreadth * numberOfRows) + spacingHeight,
						numberOfObjects: numberOfObjects
					};
					cachedLayout.sections.push(section);
					
					height = section.bottom + insetTop + insetBottom;
					
					// If the total height exceeds the collection view frame height, perform a second layout pass to account for the scrollbars
					if (height > frameHeight) {
						if (this.collectionView.scrollBarSize && !useOffset) return this._prepareLayoutWithScrollbarOffset(YES);
					}
				}
				
				height += this._bottomPadding;
				
				// If the total height exceeds the collection view frame height, perform a second layout pass to account for the scrollbars
				if (height > frameHeight) {
					if (this.collectionView.scrollBarSize && !useOffset) return this._prepareLayoutWithScrollbarOffset(YES);
				}
				
				// If the height is lower than the collection view's height, the content gravity must be applied to all cached attributes
				if (height < this.collectionView.frame.size.height) {
					var topAdjustment = 0;
					if (this._contentGravity === BMCollectionViewFlowLayoutAlignment.Center) {
						topAdjustment = ((this.collectionView.frame.size.height - height) / 2) | 0;
					}
					else if (this._contentGravity === BMCollectionViewFlowLayoutAlignment.Bottom) {
						topAdjustment = this.collectionView.frame.size.height - height;
					}
					
					if (topAdjustment != 0) {
						var sectionsLength = cachedLayout.sections.length;
						
						// Displace the sections
						for (var i = 0; i < sectionsLength; i++) {
							var section = cachedLayout.sections[i];
							
							section.top += topAdjustment;
							section.bottom += topAdjustment;
							
						}
					}
				}
			}
			else {
				let width = insetLeft;
				
				for (var i = 0; i < numberOfSections; i++) {
					var numberOfObjects = this.collectionView.numberOfObjectsInSectionAtIndex(i);
					
					var numberOfRows = Math.ceil(numberOfObjects / numberOfColumns) | 0;
					
					var spacingWidth = (numberOfRows - 1) * rowSpacing;
					if (headerHeight) spacingWidth += rowSpacing;
					if (footerHeight) spacingWidth += rowSpacing;
					
					let section = {
						left: width,
						right: width + (breadth * numberOfRows) + spacingWidth,
						numberOfObjects: numberOfObjects
					};
					cachedLayout.sections.push(section);
					
					width = section.right + insetLeft + insetRight;
					
					// If the total height exceeds the collection view frame height, perform a second layout pass to account for the scrollbars
					if (width > frameWidth) {
						if (this.collectionView.scrollBarSize && !useOffset) return this._prepareLayoutWithScrollbarOffset(YES);
					}
				}
				
				// If the total height exceeds the collection view frame height, perform a second layout pass to account for the scrollbars
				if (width > frameWidth) {
					if (this.collectionView.scrollBarSize && !useOffset) return this._prepareLayoutWithScrollbarOffset(YES);
				}
				
				// If the height is lower than the collection view's height, the content gravity must be applied to all cached attributes
				if (width < this.collectionView.frame.size.width) {
					var leftAdjustment = 0;
					if (this._contentGravity === BMCollectionViewFlowLayoutAlignment.Center) {
						leftAdjustment = ((this.collectionView.frame.size.width - width) / 2) | 0;
					}
					else if (this._contentGravity === BMCollectionViewFlowLayoutAlignment.Bottom) {
						leftAdjustment = this.collectionView.frame.size.width - width;
					}
					
					if (leftAdjustment != 0) {
						var sectionsLength = cachedLayout.sections.length;
						
						// Displace the sections
						for (var i = 0; i < sectionsLength; i++) {
							var section = cachedLayout.sections[i];
							
							section.left += leftAdjustment;
							section.right += leftAdjustment;
							
						}
					}
				}
			}
			
		}
		
	},

	// @override - BMCollectionViewLayout
	constraintsForMeasuringCell(cell, {atIndexPath}) {
		// In flow layout, a cells's width cannot exceed the collection view's frame
		return [BMLayoutConstraint.constraintWithView(cell, {
			attribute: BMLayoutAttribute.Width, 
			relatedBy: BMLayoutConstraintRelation.LessThanOrEquals, 
			constant: this.collectionView.frame.size.width - this.sectionInsets.left - this.sectionInsets.right
		})]
	},
	
	/**
	 * @deprecated Not used anymore
	 * Reflows a cached row object based on the current alignment and gravity.
	 * @param row <Object>					The cached row object.
	 * {
	 *	@param forWidth <Number>			The row's width.
	 *	@param height <Number>				The row's height.
	 *	@param withOccupiedWidth <Number>	The width occupied by the cells.
	 *	@param spacing <Number>				The minimum spacing to use between the cells.
	 * }
	 */
	reflowRow: function (row, options) {
		var width = options.forWidth;
		var rowWidth = options.withOccupiedWidth;
		
		var rowHeight = options.height;

		var spacing = options.spacing;
		
		// Compute the width occupied by the spacing
		var spacingSize = spacing * (row.attributes.length - 1);
		//rowWidth += spacingSize;

		// Compute the width occupied by the actual cells, without the spacing
		var cellOccupiedWidth = rowWidth - spacingSize;
		
		var remainingSpace = width - rowWidth;
		
		var gravity = this._gravity;
		var alignment = this._alignment;
		
		var cellCount = row.attributes.length;
		
		// When the items flow horizontally they start out at left margin
		// Their width is multiplied by the widthMultiplier
		// Then the next item is placed after spacing pixels from the previous one
		var widthMultiplier = gravity == BMCollectionViewFlowLayoutGravity.Expand ? (width - spacingSize) / cellOccupiedWidth : 1;
		// Because the width multiplier may lead to fractional values for the widths
		// which are then truncated to integer sizes, the additional pixels are accounted for
		// by adding 1 pixel to the width of cells until the entire space is used
		var extraPixels = 0;
		if (gravity == BMCollectionViewFlowLayoutGravity.Expand) {
			var expandedOccupiedWidth = 0;
			for (var i = 0; i < cellCount; i++) {
				expandedOccupiedWidth += (row.attributes[i].frame.size.width * widthMultiplier) | 0;
			}
			extraPixels = ((width - spacingSize) | 0) % (expandedOccupiedWidth | 0);
		}

		// The spacing extra pixels is similar to the extraPixels variable, except that it is used for the other gravities
		// and is added to spacing other than the cell sizes
		var spacingExtraPixels = 0;
		
		var leftMargin = this._sectionInsets.left;
		
		// Implicitly, for left gravity, the leftMargin does not change
		if (gravity === BMCollectionViewFlowLayoutGravity.Center) {
			leftMargin = (leftMargin + (width - rowWidth) / 2) | 0;
		}
		else if (gravity === BMCollectionViewFlowLayoutGravity.End) {
			leftMargin = (leftMargin + width - rowWidth) | 0;
		}
		else if (gravity === BMCollectionViewFlowLayoutGravity.Edge) {
			spacing = ((width - cellOccupiedWidth) / (cellCount - 1)) | 0;

			// Compute the extra spacing pixels as the remainder between the row width and the total occupied integer width
			spacingExtraPixels = width - (spacing * (cellCount - 1) + cellOccupiedWidth);
		}
		else if (gravity === BMCollectionViewFlowLayoutGravity.Spaced) {
			spacing = ((width - cellOccupiedWidth) / (cellCount + 1)) | 0;

			// Compute the extra spacing pixels as the remainder between the row width and the total occupied integer width
			spacingExtraPixels = width - (spacing * (cellCount + 1) + cellOccupiedWidth);

			leftMargin = leftMargin + spacing;
		}
		
		// Flow the items horizontally and align them vertially
		for (var i = 0; i < cellCount; i++) {
			var cellAttributes = row.attributes[i];
			
			// Flow the item horizontally
			cellAttributes.frame.origin.x = leftMargin;
			cellAttributes.frame.size.width *= widthMultiplier;
			// Constrain the width to an integer size
			cellAttributes.frame.size.width = cellAttributes.frame.size.width | 0;

			// Add the additional extra pixel if needed, then subtract from the remaining pixels
			if (extraPixels) {
				cellAttributes.frame.size.width += 1;
				extraPixels--;
			}
			
			leftMargin += spacing + cellAttributes.frame.size.width;
			// Add the additional spacing extra pixel if needed, then subtract from the remaining pixels
			if (spacingExtraPixels) {
				leftMargin += 1;
				spacingExtraPixels--;
			}
			
			// Align it vertically
			if (alignment === BMCollectionViewFlowLayoutAlignment.Center) {
				cellAttributes.frame.origin.y += ((rowHeight - cellAttributes.frame.size.height) / 2) | 0;
			}
			else if (alignment === BMCollectionViewFlowLayoutAlignment.Bottom) {
				cellAttributes.frame.origin.y += rowHeight - cellAttributes.frame.size.height;
			}
			else if (alignment === BMCollectionViewFlowLayoutAlignment.Expand) {
				cellAttributes.frame.size.height = rowHeight;
			}
			
		}
		
	},

	
	/**
	 * Reflows a cached row object based on the current alignment, axis and gravity.
	 * @param row <Object>					The cached row object.
	 * {
	 *	@param forLength <Number>			The row's size along the secondary axis.
	 *	@param breadth <Number>				The row's size along the primary axis.
	 *	@param withOccupiedLength <Number>	The size occupied by the cells along the secondary axis.
	 *	@param spacing <Number>				The minimum spacing to use between the cells.
	 * }
	 */
	_reflowRow: function (row, {forLength: length, breadth, withOccupiedLength: occupiedLength, spacing}) {
		//var length = options.forWidth;
		//var occupiedLength = options.withOccupiedWidth;
		
		//var breadth = options.height;

		//var spacing = options.spacing;
		
		// Compute the width occupied by the spacing
		var spacingSize = spacing * (row.attributes.length - 1);
		//rowWidth += spacingSize;

		// Compute the width occupied by the actual cells, without the spacing
		var cellOccupiedLength = occupiedLength - spacingSize;
		
		var remainingSpace = length - occupiedLength;
		
		var gravity = this._gravity;
		var alignment = this._alignment;
		let orientation = this._orientation;
		let lengthAttribute = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? 'width' : 'height';
		let secondaryLengthAttribute = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? 'height' : 'width';
		let positionAttribute = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? 'x' : 'y';
		let secondaryPositionAttribute = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? 'y' : 'x';
		
		var cellCount = row.attributes.length;
		
		// When the items flow horizontally they start out at left margin
		// Their width is multiplied by the widthMultiplier
		// Then the next item is placed after spacing pixels from the previous one
		var lengthMultiplier = gravity == BMCollectionViewFlowLayoutGravity.Expand ? (length - spacingSize) / cellOccupiedLength : 1;
		// Because the width multiplier may lead to fractional values for the widths
		// which are then truncated to integer sizes, the additional pixels are accounted for
		// by adding 1 pixel to the width of cells until the entire space is used
		var extraPixels = 0;
		if (gravity == BMCollectionViewFlowLayoutGravity.Expand) {
			var expandedOccupiedLength = 0;
			for (var i = 0; i < cellCount; i++) {
				expandedOccupiedLength += (row.attributes[i].frame.size[lengthAttribute] * lengthMultiplier) | 0;
			}
			extraPixels = ((length - spacingSize) | 0) % (expandedOccupiedLength | 0);
		}

		// The spacing extra pixels is similar to the extraPixels variable, except that it is used for the other gravities
		// and is added to spacing other than the cell sizes
		var spacingExtraPixels = 0;
		
		var startMargin = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? this._sectionInsets.left : this._sectionInsets.top + this.topPadding;
		
		// Implicitly, for left gravity, the leftMargin does not change
		if (gravity === BMCollectionViewFlowLayoutGravity.Center) {
			startMargin = (startMargin + (length - occupiedLength) / 2) | 0;
		}
		else if (gravity === BMCollectionViewFlowLayoutGravity.Right) {
			startMargin = (startMargin + length - occupiedLength) | 0;
		}
		else if (gravity === BMCollectionViewFlowLayoutGravity.Edge) {
			spacing = ((length - cellOccupiedLength) / (cellCount - 1)) | 0;

			// Compute the extra spacing pixels as the remainder between the row width and the total occupied integer width
			spacingExtraPixels = length - (spacing * (cellCount - 1) + cellOccupiedLength);
		}
		else if (gravity === BMCollectionViewFlowLayoutGravity.Spaced) {
			spacing = ((length - cellOccupiedLength) / (cellCount + 1)) | 0;

			// Compute the extra spacing pixels as the remainder between the row width and the total occupied integer width
			spacingExtraPixels = length - (spacing * (cellCount + 1) + cellOccupiedLength);

			startMargin = startMargin + spacing;
		}
		
		// Flow the items horizontally and align them vertially
		for (var i = 0; i < cellCount; i++) {
			var cellAttributes = row.attributes[i];
			
			// Flow the item horizontally
			cellAttributes.frame.origin[positionAttribute] = startMargin;
			cellAttributes.frame.size[lengthAttribute] *= lengthMultiplier;
			// Constrain the width to an integer size
			cellAttributes.frame.size[lengthAttribute] = cellAttributes.frame.size[lengthAttribute] | 0;

			// Add the additional extra pixel if needed, then subtract from the remaining pixels
			if (extraPixels) {
				cellAttributes.frame.size[lengthAttribute] += 1;
				extraPixels--;
			}
			
			startMargin += spacing + cellAttributes.frame.size[lengthAttribute];
			// Add the additional spacing extra pixel if needed, then subtract from the remaining pixels
			if (spacingExtraPixels) {
				startMargin += 1;
				spacingExtraPixels--;
			}
			
			// Align it vertically
			if (alignment === BMCollectionViewFlowLayoutAlignment.Center) {
				cellAttributes.frame.origin[secondaryPositionAttribute] += ((breadth - cellAttributes.frame.size[secondaryLengthAttribute]) / 2) | 0;
			}
			else if (alignment === BMCollectionViewFlowLayoutAlignment.Bottom) {
				cellAttributes.frame.origin[secondaryPositionAttribute] += breadth - cellAttributes.frame.size[secondaryLengthAttribute];
			}
			else if (alignment === BMCollectionViewFlowLayoutAlignment.Expand) {
				cellAttributes.frame.size[secondaryLengthAttribute] = breadth;
			}
			
		}
	},
	
	// @override
	contentSize: function () {
		
		if (!this._cellSize || this._expectedCellSize) return this.cachedLayout.size;
		
		// The size should never be smaller than the collection view frame	
		if (this._orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
			return this.cachedLayout.sections.length ? 
				BMSizeMake(this.collectionView.frame.size.width, 
							Math.max(this.cachedLayout.sections[this.cachedLayout.sections.length - 1].bottom + this._bottomPadding + this.sectionInsets.bottom, 
									this.collectionView.frame.size.height)) : 
				this.collectionView.frame.size.copy();
		}
		else {
			return this.cachedLayout.sections.length ? 
				BMSizeMake(Math.max(this.cachedLayout.sections[this.cachedLayout.sections.length - 1].right + this._bottomPadding + this.sectionInsets.right, 
							this.collectionView.frame.size.width), 
							this.collectionView.frame.size.height) : 
				this.collectionView.frame.size.copy();
		}

			
	},

	// @override - BMCollectionViewTableLayout
	shouldInvalidateLayoutForFrameChange() {
		// Because the measured size of the cells can depend upon the size of collection view's frame, in addition
		// to invalidating the layout, flow layout also invalidates the size of cells that are as wide as collection view's previous frame.
		this.collectionView.invalidateMeasuredSizeOfCellsWithBlock(size => {
			return size.width >= this.cachedLayout.availableWidth;
		});
		return YES;
	},
	
	// @override - BMCollectionViewLayout
	shouldInvalidateLayoutForBoundsChange: function (bounds) {
		var shouldInvalidate = this._pinsHeadersToContentEdge || this._pinsFootersToContentEdge;

		// When using automatic cell sizes, calculate the rest of the layout up to the given bounds, if needed
		// and invalidate the layout appropriately
		if (this._orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
			if (this._expectedCellSize && bounds.bottom > this.cachedLayout.resolvedHeight) {
				this._layoutIterator.next({rect: bounds});
				shouldInvalidate = YES;
			}
		}
		else {
			if (this._expectedCellSize && bounds.right > this.cachedLayout.resolvedWidth) {
				this._layoutIterator.next({rect: bounds});
				shouldInvalidate = YES;
			}
		}

		if (shouldInvalidate) {
			// While scrolling, it is not needed to recalculate the layout caches.
			this.isChangingBounds = YES;
		}

		return shouldInvalidate;
	},
	
	// @override - BMCollectionViewLayout
	didInvalidateLayoutForBoundsChange: function () {
		this.isChangingBounds = NO;
	},

    
    // @override
    attributesForCellAtIndexPath: function (indexPath) { 
		// When using automatic cell sizes, it is important to ensure that the sizing information has been computed
		// for the requested index path
		if (this._expectedCellSize) {
			if (this.cachedLayout.resolvedIndexPath.section < indexPath.section ||
				(this.cachedLayout.resolvedIndexPath.section == indexPath.section && this.cachedLayout.resolvedIndexPath.row < indexPath.row)) {
					// If the layout has not been resolved up to this index path, continue computing it until it has
					this._layoutIterator.next({indexPath: indexPath});
				}
		}
	    
	    // Return the cached attributes when using dynamic sizes
	    if (!this._cellSize || this._expectedCellSize) return this.cachedAttributesForCellAtIndexPath(indexPath);
	    
	    // Otherwise compute the attributes
		return this.computedAttributesForCellAtIndexPath(indexPath);
		
	},
	
	/**
	 * Returns the cached cell attributes for the cell at the given index path.
	 * This method should only be used when using variable cell sizes.
	 * @param indexPath <BMIndexPath>					The cell's index path.
	 * {
	 *	@param usingCache <Object, nullable>			Defaults to this layout's current cache. The layout cache.
	 * }
	 * @return <BMCollectionViewLayoutAttributes>		The corresponding cell attributes.
	 * @throw											If there are no cached attributes for the specified index path.
	 */
	cachedAttributesForCellAtIndexPath: function (indexPath, options) {
		var cache = (options && options.usingCache) || this.cachedLayout;
		
		// Get the cached section corresponding to the index path
		var sectionRows = cache.sections[indexPath.section].rows;
		var index = indexPath.row;
		
		// Find the row in which the index path is located
		var sectionRowsLength = sectionRows.length;
		for (var i = 0; i < sectionRowsLength; i++) {
			var row = sectionRows[i];
			
			if (index >= row.startIndex && index <= row.endIndex) {
				return row.attributes[index - row.startIndex];
			}
			
		}
		
		throw 'Unable to find the cached attributes for the cell at the given index path';
	},
	
	/**
	 * Computes and returns the attributes for the cell at the given index path.
	 * This method should only be used when using fixed cell sizes.
	 * @param indexPath <BMIndexPath>				The cell's index path.
	 * {
	 *	@param usingCache <Object, nullable>		Defaults to this layout's current cache. The layout cache.
	 * }
	 * @return <BMCollectionViewLayoutAttributes>	The corresponding cell attributes.
	 * @throws										If the index path is out of bounds.
	 */
	computedAttributesForCellAtIndexPath: function (indexPath, options) {
		var cache = (options && options.usingCache) || this.cachedLayout;
		
		var sectionIndex = indexPath.section;
		var section = cache.sections[sectionIndex];
		
		var numberOfColumns = cache.numberOfColumns;
		var numberOfObjects = section.numberOfObjects;
		
		var objectIndex = indexPath.row;
		
		// Find the row and column index within the section
		var cellRow = (objectIndex / numberOfColumns) | 0;
		var cellColumn = objectIndex % numberOfColumns;
		
		// Find this cell's row prototype. In most cases this will be the prototype for the numberOfColumns columns,
		// unless this cell is in the last row - in those cases it is possible that there may be fewer columns
		if (cellRow == ((numberOfObjects / numberOfColumns) | 0)) {
			var numberOfColumnsInLastRow = (numberOfObjects % numberOfColumns) || numberOfColumns;
			
			var prototypeRow = cache.prototypeRows[numberOfColumnsInLastRow - 1];
		}
		else {
			var prototypeRow = cache.prototypeRows[numberOfColumns - 1];
		}

		var attributes;
		
		// Find out where the row starts
		if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
			let rowTop = section.top;
			if (cache.showsHeaders) {
				rowTop += cache.headerHeight + cache.rowSpacing;
			} 
			
			rowTop += cellRow * (cache.rowHeight + cache.rowSpacing);
			
			// Construct the attributes
			attributes = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(indexPath);
			attributes.frame = prototypeRow.attributes[cellColumn].frame.copy();
			attributes.frame.origin.y = rowTop;
		}
		else {
			let rowLeft = section.left;
			if (cache.showsHeaders) {
				rowLeft += cache.headerHeight + cache.rowSpacing;
			} 
			
			rowLeft += cellRow * (cache.rowBreadth + cache.rowSpacing);
			
			// Construct the attributes
			attributes = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(indexPath);
			attributes.frame = prototypeRow.attributes[cellColumn].frame.copy();
			attributes.frame.origin.x = rowLeft;
		}
		
		return attributes;
		
	},
	
	// @override
	attributesForSupplementaryViewWithIdentifier: function (identifier, options) {
		
		// The empty supplementary view will always ever have one instance with a preset index path regardless of whether the layout is cached or computed
		if (identifier === BMCollectionViewTableLayoutSupplementaryView.Empty) {
			var attribute = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
								BMCollectionViewTableLayoutSupplementaryView.Empty, 
								{atIndexPath: BMIndexPathMakeWithIndexes([0])}
							);
							
			attribute.frame = BMRectMake(0, 0, this.collectionView.frame.size.width, this.collectionView.frame.size.height);
			return attribute;
		}

		if (this._expectedCellSize) {
			if (this.cachedLayout.resolvedIndexPath.section < options.atIndexPath.section ||
				(this.cachedLayout.resolvedIndexPath.section == options.atIndexPath.section && identifier == BMCollectionViewFlowLayoutSupplementaryView.Footer)) {
					// If the layout has not been resolved up to this index path, continue computing it until it has
					this._layoutIterator.next({indexPath: this.collectionView.indexPathForObjectAtRow(0, {inSectionAtIndex: options.atIndexPath.section + 1})});
				}
		}
	    
	    // Return the cached attributes when using dynamic sizes
	    if (!this._cellSize || this._expectedCellSize) return this.cachedAttributesForSupplementaryViewWithIdentifier(identifier, options);
	    
	    // Otherwise compute the attributes
		return this.computedAttributesForSupplementaryViewWithIdentifier(identifier, options);
		
	},
	
	
	/**
	 * Returns the cached cell attributes for the supplementary view with the given identifier at the given index path.
	 * This method should only be used when using variable cell sizes.
	 * @param identifier <String>								The supplementary view's type.
	 * {
	 *	@param atIndexPath <BMIndexPath>						The supplementary view's index path.
	 *	@param usingCache <Object, nullable>					Defaults to this layout's current cache. The layout cache.
	 * }
	 * @return <BMCollectionViewLayoutAttributes, nullable>		The corresponding cell attributes, or undefined if there are no cached attributes for the specified index path
	 *															or the requested supplementary view type is unsupported.
	 */
	cachedAttributesForSupplementaryViewWithIdentifier: function (identifier, options) {
		var cache = (options && options.usingCache) || this.cachedLayout;
		var section = options.atIndexPath.section;
		
		if (section >= cache.sections.length) return undefined;
		
		if (identifier === BMCollectionViewFlowLayoutSupplementaryView.Header) {
			return cache.sections[section].headerAttributes;
		}
		else if (identifier === BMCollectionViewFlowLayoutSupplementaryView.Footer) {
			return cache.sections[section].footerAttributes;
		}
		
		// Other types of supplementary views are not supported.
		return undefined;
	},
	
	
	/**
	 * Computes and returns the cell attributes for the supplementary view with the given identifier at the given index path.
	 * This method should only be used when using fixed cell sizes.
	 * @param identifier <String>								The supplementary view's type.
	 * {
	 *	@param atIndexPath <BMIndexPath>						The supplementary view's index path.
	 *	@param usingCache <Object, nullable>					Defaults to this layout's current cache. The layout cache.
	 * }
	 * @return <BMCollectionViewLayoutAttributes, nullable>		The corresponding cell attributes, or undefined if the section index is out of bounds 
	 *															or the requested supplementary view type is unsupported.
	 */
	computedAttributesForSupplementaryViewWithIdentifier: function (identifier, options) {
		var cache = (options && options.usingCache) || this.cachedLayout;
		var sectionIndex = options.atIndexPath.section;
		
		if (sectionIndex >= cache.sections.length) return undefined;
		
		var section = cache.sections[sectionIndex];
		var attributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(identifier, {atIndexPath: options.atIndexPath});
		
		if (identifier === BMCollectionViewFlowLayoutSupplementaryView.Header) {
			if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
				attributes.frame = BMRectMake(	cache.sectionInsets.left, 
												section.top, 
												this.collectionView.frame.size.width - cache.sectionInsets.left - cache.sectionInsets.right,
												cache.headerHeight);
			}
			else {
				attributes.frame = BMRectMake(	section.left, 
												cache.sectionInsets.top + cache.topPadding, 
												cache.headderHeight,
												this.collectionView.frame.size.height - cache.sectionInsets.top - cache.sectionInsets.bottom - cache.topPadding - cache.bottomPadding);
			}
			
			return attributes;
		}
		else if (identifier === BMCollectionViewFlowLayoutSupplementaryView.Footer) {
			if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
				attributes.frame = BMRectMake(	cache.sectionInsets.left, 
												section.bottom - cache.footerHeight, 
												this.collectionView.frame.size.width - cache.sectionInsets.left - cache.sectionInsets.right,
												cache.footerHeight);
			}
			else {
				attributes.frame = BMRectMake(	section.right - cache.footerHeight, 
												cache.sectionInsets.top + cache.topPadding,
												cache.footerHeight,
												this.collectionView.frame.size.height - cache.sectionInsets.top - cache.sectionInsets.bottom - cache.topPadding - cache.bottomPadding);
			}
											
			return attributes;
		}
		
		// Other types of supplementary views are not supported.
		return undefined;
	},
	

    // @override
    attributesForElementsInRect: function (rect) {
		// When using automatic cell sizes, it is important to ensure that the sizing information has been computed
		// for the entire requested rexct
		if (this._expectedCellSize) {
			if (this._orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
				if (this.cachedLayout.resolvedHeight < rect.bottom) {
					// If the layout has not been resolved for this rect, continue computing it until it has
					this._layoutIterator.next({rect: rect});
	
					// Invalidate the layout size
					this.invalidateContentSize();
				}
			}
			else {
				if (this.cachedLayout.resolvedWidth < rect.right) {
					// If the layout has not been resolved for this rect, continue computing it until it has
					this._layoutIterator.next({rect: rect});
	
					// Invalidate the layout size
					this.invalidateContentSize();
				}
			}
		}
	    
	    // When there are no sections in the collection view, this method will always return a single instance of attributes
	    // for the empty supplementary view
	    if (this.collectionView.numberOfSections() == 0) {
			var attribute = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
								BMCollectionViewTableLayoutSupplementaryView.Empty, 
								{atIndexPath: BMIndexPathMakeWithIndexes([0])}
							);
							
			attribute.frame = BMRectMake(0, 0, this.collectionView.frame.size.width, this.collectionView.frame.size.height);
			return [attribute];
	    }
	    
	    if (!this._cellSize || this._expectedCellSize) return this.cachedAttributesForElementsInRect(rect);
	    
	    return this.computedAttributesForElementsInRect(rect);
		
	},	
	
	
	/**
	 * Returns the cached cell attributes for all elements in the given rect. This method should only be used when using variable cell sizes.
	 * @param rect <BMRect>										The rect.
	 * {
	 *	@param usingCache <Object, nullable>					Defaults to this layout's current cache. The layout cache.
	 * }
	 * @return <[BMCollectionViewLayoutAttributes]>				An array of cell attributes.
	 */
	cachedAttributesForElementsInRect: function (rect, options) {
		var cache = (options && options.usingCache) || this.cachedLayout;
		var attributes = [];
		
		var rectTop = rect.origin.y;
		var rectBottom = rect.bottom;
		var rectLeft = rect.origin.x;
		var rectRight = rect.right;
		
		var sectionIndex = 0;
		var sectionCount = this._expectedCellSize ? cache.sectionCount : cache.sections.length;
		var section;
		
		// Find the section that intersects this rect's top origin
		for (; sectionIndex < sectionCount; sectionIndex++) {
			section = cache.sections[sectionIndex];
			
			if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
				if (section.bottom > rectTop) break;
			}
			else {
				if (section.right > rectLeft) break;
			}
		}
		
		// If there were no sections return nothing
		if (sectionIndex == sectionCount) return attributes;
		
		// Find the first row index that intersects the rect's top.
		var rowIndex = -1;
		
		// Check the header first
		if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
			if (!section.headerAttributes || section.headerAttributes.frame.bottom < rectTop) {
				
				// If the header doesn't intersect the point, check each row
				rowIndex = 0;
				
				var rows = section.rows;
				var rowsLength = rows.length;
				
				for (var i = 0; i < rowsLength; i++) {
					if (rows[i].bottom > rectTop) {
						rowIndex = i;
						break;
					}
				}
				
				// And finally, if no row intersects the point, the footer must intersect it
				rowIndex = i;
			}
		}
		else {
			if (!section.headerAttributes || section.headerAttributes.frame.right < rectLeft) {
				
				// If the header doesn't intersect the point, check each row
				rowIndex = 0;
				
				var rows = section.rows;
				var rowsLength = rows.length;
				
				for (var i = 0; i < rowsLength; i++) {
					if (rows[i].right > rectLeft) {
						rowIndex = i;
						break;
					}
				}
				
				// And finally, if no row intersects the point, the footer must intersect it
				rowIndex = i;
			}
		}
		
		var topmostSection = section;
		var bottommostSection = section;
		var lastFooterAttributes, lastFooterAttributesSection;
		
		// If there are no header attributes but this layout pins headers to content edges, add them now
		if (cache.pinsHeadersToContentEdge && rowIndex != -1) {
			var headerAttributes = section.headerAttributes.copy();
			if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
				headerAttributes.frame.origin.y = this.collectionView.scrollOffset.y;
			}
			else {
				headerAttributes.frame.origin.x = this.collectionView.scrollOffset.x;
			}
			attributes.push(headerAttributes);
		}
		
		// Start adding attributes until the current supplementary view or row's top origin is below the rect
		try {
			for (; sectionIndex < sectionCount; sectionIndex++) {
				var section = cache.sections[sectionIndex];
				var rows = section.rows;
				var rowsLength = rows.length;
				
				for (; rowIndex <= rowsLength; rowIndex++) {
					
					if (rowIndex == -1) {
						// Headers
						if (section.headerAttributes) {
							var headerAttributes = section.headerAttributes;
							
							// Pin the headers to the content edge if needed
							if (cache.pinsHeadersToContentEdge && section === topmostSection) {
								headerAttributes = headerAttributes.copy();
								if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
									headerAttributes.frame.origin.y = Math.max(this.collectionView.scrollOffset.y, headerAttributes.frame.origin.y);
								}
								else {
									headerAttributes.frame.origin.x = Math.max(this.collectionView.scrollOffset.x, headerAttributes.frame.origin.x);
								}
							}
							
							if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
								var origin = headerAttributes.frame.origin.y;
								if (origin > rectBottom) return attributes;
							}
							else {
								var origin = headerAttributes.frame.origin.x;
								if (origin > rectRight) return attributes;
							}
							
							attributes.push(headerAttributes);
						}
							
						bottommostSection = section;
					}
					else if (rowIndex == rowsLength) {
						// Footers
						if (section.footerAttributes) {
							if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
								var origin = section.footerAttributes.frame.origin.y;
								if (origin > rectBottom) return attributes;
							}
							else {
								var origin = section.footerAttributes.frame.origin.x;
								if (origin > rectRight) return attributes;
							}
								
							var footerAttributes = section.footerAttributes;
							// When the footers are pinned, work on copies of the original attributes to not alter the cached layout
							// The actual pinning is performend in the final block
							if (this.collectionView._pinsFootersToContentEdge) {
								footerAttributes = footerAttributes.copy();
								lastFooterAttributes = footerAttributes;
								lastFooterAttributesSection = section;
							}
							
							attributes.push(footerAttributes);
						}
					}
					else {
						// Rows
						var row = rows[rowIndex];
						if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
							var origin = row.top;
							if (origin > rectBottom) return attributes;
						}
						else {
							var origin = row.left;
							if (origin > rectRight) return attributes;
						}
						
						for (var i = 0; i < row.attributes.length; i++) {
							attributes.push(row.attributes[i]);
						}
					}
					
				}
				
				rowIndex = -1;
				
			}
		}
		finally {
			// Defer adjusting the bottommost section's footer attributes until after all the other attributes have been processed
			if (cache.pinsFootersToContentEdge && this._showsFooters) {
				var footerAttributes;
				
				if (lastFooterAttributesSection === bottommostSection) {
					footerAttributes = lastFooterAttributes;
				}
				else {
					footerAttributes = bottommostSection.footerAttributes.copy();
					attributes.push(footerAttributes);
				}
				
				if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
					footerAttributes.frame.origin.y = Math.min(footerAttributes.frame.origin.y, this.collectionView.scrollOffset.y + this.collectionView.frame.size.height - footerAttributes.frame.size.height);
				}
				else {
					footerAttributes.frame.origin.x = Math.min(footerAttributes.frame.origin.x, this.collectionView.scrollOffset.x + this.collectionView.frame.size.width - footerAttributes.frame.size.width);
				}
			}
		}
		
		return attributes;	
	},	
	
	
	/**
	 * Computes and returns the cell attributes for all elements in the given rect. This method should only be invoked when using fixed cell sizes.
	 * @param rect <BMRect>										The rect.
	 * {
	 *	@param usingCache <Object, nullable>					Defaults to this layout's current cache. The layout cache.
	 * }
	 * @return <[BMCollectionViewLayoutAttributes]>				An array of cell attributes.
	 */
	computedAttributesForElementsInRect: function (rect, options) {
		var cache = (options && options.usingCache) || this.cachedLayout;
		var attributes = [];

		/*attributes.push = item => {
			let frame = document.createElement('div');
			frame.style.cssText = `left: ${item.frame.origin.x}px; top: ${item.frame.origin.y}px; width: ${item.frame.size.width}px; height: ${item.frame.size.height}px; outline: 1px solid red;`;
			this.collectionView._contentWrapper[0].appendChild(frame);

			return Array.prototype.push.apply(attributes, arguments);
		}*/
		
		var rectTop = rect.origin.y;
		var rectBottom = rect.bottom;
		var rectLeft = rect.origin.x;
		var rectRight = rect.right;
		var rectEnd = cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? rectBottom : rectRight;
		
		var sectionIndex = 0;
		var sectionCount = cache.sections.length;
		var section;
		
		// Find the section that intersects this rect's top origin
		for (; sectionIndex < sectionCount; sectionIndex++) {
			section = cache.sections[sectionIndex];
			
			if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
				if (section.bottom > rectTop) break;
			}
			else {
				if (section.right > rectLeft) break;
			}
		}
		
		// If there were no sections return nothing
		if (sectionIndex == sectionCount) return attributes;
		
		// Find the first row index that intersects the rect's top.
		var rowIndex = -1;
		
		// The top is used as a caret that caches the previously rendered row or supplementary view's bottom position
		// and represents the top position at which the current row or supplementary view should be rendered
		var top = section.top;
		var left = section.left;
		var start = cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? top : left;
		
		// These control variables keep track of the topmost and bottommost sections in case it is required to pin headers or footers to the content edges
		var topmostSection = section;
		var bottommostSection = section;
		var lastFooterAttributes, lastFooterAttributesSection;

		let sectionStartAttribute = cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? 'top' : 'left';
		let originAttribute = cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? 'y' : 'x';
		let supplementaryViewSizeAttribute = cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? 'height' : 'width';
		let rectStart = cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? rectTop : rectLeft;

		// Check the header first
		if (!cache.showsHeaders || section[sectionStartAttribute] + cache.headerHeight < rectStart) {
			
			// If the header doesn't intersect the point, check each row
			rowIndex = 0;
			
			var rowsLength = Math.ceil(section.numberOfObjects / cache.numberOfColumns) | 0;
			
			start = cache.showsHeaders ? section[sectionStartAttribute] + cache.headerHeight + cache.rowSpacing : section[sectionStartAttribute];
			
			// If no row advances past the rectTop, then rendering should begin at the first footer
			// In that case i will be equals to rowsLength, but the for condition will fail, which will not appropriately increase the rowIndex
			let caretIsAtRow = NO;
			for (var i = 0; i < rowsLength; i++) {
				rowIndex = i;
				
				if (start + cache.rowBreadth > rectStart) {
					caretIsAtRow = YES;
					break;
				}
				else {
					start += cache.rowBreadth + cache.rowSpacing;
				}
				
			}
			
			if (!caretIsAtRow) {
				rowIndex = i;
			}
			
			// And finally, if no row intersects the point, the footer must intersect it
		}
		
		// If this layout pins headers to the content edge and the first index path is not this section's header, create its attributes
		// now and add it to the attributes array
		if (cache.pinsHeadersToContentEdge && rowIndex > -1 && cache.showsHeaders) {
			// Construct the attributes
			var headerAttributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
				BMCollectionViewFlowLayoutSupplementaryView.Header,
				{atIndexPath: BMIndexPathMakeWithIndexes([sectionIndex])}
			);
			
			// The frame
			if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
				headerAttributes.frame = BMRectMake(
					cache.sectionInsets.left, this.collectionView.scrollOffset.y,
					this.collectionView.frame.size.width - cache.sectionInsets.left - cache.sectionInsets.right,
					cache.headerHeight
				);
			}
			else {
				headerAttributes.frame = BMRectMake(
					this.collectionView.scrollOffset.x, cache.sectionInsets.top + cache.topPadding,
					cache.headerHeight,
					this.collectionView.frame.size.height - cache.sectionInsets.top - cache.sectionInsets.bottom - cache.topPadding - cache.bottomPadding
				);
			}
			
			// Float the header above the content
			headerAttributes.style.zIndex = 1;
			
			attributes.push(headerAttributes);
		}
		
		
		var numberOfColumns = cache.numberOfColumns;
		
		// Start adding attributes until the current supplementary view or row's top origin is below the rect
		try {
			for (; sectionIndex < sectionCount; sectionIndex++) {
				var section = cache.sections[sectionIndex];
				var rowsLength = Math.ceil(section.numberOfObjects / numberOfColumns) | 0;
				
				for (; rowIndex <= rowsLength; rowIndex++) {
					
					if (rowIndex == -1) {
						// Headers
						if (cache.showsHeaders) {
							if (start > rectEnd) return attributes;
							
							// Construct the attributes
							var headerAttributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
								BMCollectionViewFlowLayoutSupplementaryView.Header,
								{atIndexPath: BMIndexPathMakeWithIndexes([sectionIndex])}
							);
							
							// The frame
							if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
								headerAttributes.frame = BMRectMake(
									cache.sectionInsets.left, start,
									this.collectionView.frame.size.width - cache.sectionInsets.left - cache.sectionInsets.right,
									cache.headerHeight
								);
							}
							else {
								headerAttributes.frame = BMRectMake(
									start, cache.sectionInsets.top + cache.topPadding,
									cache.headerHeight,
									this.collectionView.frame.size.height - cache.sectionInsets.top - cache.sectionInsets.bottom - cache.topPadding - cache.bottomPadding
								);
							}
							
							// Adjust the attributes for pinning if needed
							if (section === topmostSection && cache.pinsHeadersToContentEdge) {
								
								// If the header's Y origin is lower than the content edge, the topmost section is an incoming section
								// and the previous section's header should be rendered as outgoing
								if (headerAttributes.frame.origin[originAttribute] > this.collectionView.scrollOffset[originAttribute]) {
									var previousSection = cache.sections[sectionIndex - 1];
									if (previousSection) {
										var previousHeaderAttributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
											BMCollectionViewFlowLayoutSupplementaryView.Header,
											{atIndexPath: BMIndexPathMakeWithIndexes([sectionIndex - 1])}
										);
										if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
											previousHeaderAttributes.frame = BMRectMake(
												cache.sectionInsets.left, 
												Math.min(this.collectionView.scrollOffset.y, headerAttributes.frame.origin.y - cache.headerHeight),
												this.collectionView.frame.size.width - cache.sectionInsets.left - cache.sectionInsets.right,
												cache.headerHeight	
											);
										}
										else {
											previousHeaderAttributes.frame = BMRectMake(
												Math.min(this.collectionView.scrollOffset[originAttribute], headerAttributes.frame.origin[originAttribute] - cache.headerHeight), 
												cache.sectionInsets.top + cache.topPadding,
												cache.headerHeight,
												this.collectionView.frame.size.height - cache.sectionInsets.top - cache.sectionInsets.bottom - cache.topPadding - cache.bottomPadding
											);
										}
										attributes.push(previousHeaderAttributes);
									}
								}
								
								headerAttributes.frame.origin[originAttribute] = Math.max(headerAttributes.frame.origin[originAttribute], this.collectionView.scrollOffset[originAttribute]);
			
								// Float the header above the content
								headerAttributes.style.zIndex = 1;
							}
							
							// Advance the caret
							start += cache.headerHeight + cache.rowSpacing;
							
							attributes.push(headerAttributes);
						}
						
						bottommostSection = section;
					}
					else if (rowIndex == rowsLength) {
						// Footers
						if (cache.showsFooters) {
							if (start > rectEnd) return attributes;
							
							var footerAttributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
								BMCollectionViewFlowLayoutSupplementaryView.Footer,
								{atIndexPath: BMIndexPathMakeWithIndexes([sectionIndex])}
							);
							
							if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
								footerAttributes.frame = BMRectMake(
									cache.sectionInsets.left, start,
									this.collectionView.frame.size.width - cache.sectionInsets.left - cache.sectionInsets.right,
									cache.footerHeight
								);
							}
							else {
								footerAttributes.frame = BMRectMake(
									start, cache.sectionInsets.top + cache.topPadding,
									cache.footerHeight,
									this.collectionView.frame.size.height - cache.sectionInsets.top - cache.sectionInsets.bottom - cache.topPadding - cache.bottomPadding
								);
							}
							
							// Retain these attributes and their corresponding section in case they need to be adjusted for pinning afterwards
							lastFooterAttributes = footerAttributes;
							lastFooterAttributesSection = section;
							
							// Because the section ends after the footer, the caret must move past the section insets to the next section
							if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
								start += cache.footerHeight + cache.sectionInsets.top + cache.sectionInsets.bottom;
							}
							else {
								start += cache.footerHeight + cache.sectionInsets.left + cache.sectionInsets.right;
							}
							
							attributes.push(footerAttributes);
						}
						else {
							// If there is no footer, the caret must move past the section insets to the next section
							if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
								start += cache.sectionInsets.top + cache.sectionInsets.bottom;
							}
							else {
								start += cache.sectionInsets.left + cache.sectionInsets.right;
							}
							
							if (start > rectEnd) return attributes;
						}
					}
					else {
						// Rows
						if (start > rectEnd) return attributes;
						
						var startingObjectIndex = rowIndex * numberOfColumns;
						var prototypeRow;
						var numberOfColumnsInThisRow = numberOfColumns;
						
						if (rowIndex == rowsLength - 1) {
							// For the last row determine the prototype row. When there is an exact match between the last row's column count and
							// other row's column count, the remainder will be 0. In that case the full number of columns should be assumed.
							numberOfColumnsInThisRow = (section.numberOfObjects % numberOfColumns) || numberOfColumns;
							prototypeRow = cache.prototypeRows[numberOfColumnsInThisRow - 1];
						}
						else {
							// All other rows use the prototype for the maximum column count
							prototypeRow = cache.prototypeRows[numberOfColumns - 1];
						}
						
						// Construct the attributes for each cell in this row, using the prototype row as a starting point
						for (var i = 0; i < numberOfColumnsInThisRow; i++) {
							var objectIndex = startingObjectIndex + i;
							
							var cellAttributes = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(this.collectionView.indexPathForObjectAtRow(objectIndex, {inSectionAtIndex: sectionIndex}));
							
							cellAttributes.frame = prototypeRow.attributes[i].frame.copy();
							cellAttributes.frame.origin[originAttribute] = start;
							
							attributes.push(cellAttributes);
							
						}
						
						// Advance the caret
						start += cache.rowBreadth;
						
						// Add the spacing between the rows
						// If this is the last row and the layout doesn't use footers, don't add the spacing as this row is the bottom edge of the section
						if (cache.showsFooters || rowIndex < rowsLength - 1) {
							start += cache.rowSpacing;
						}
						
					}
					
				}
				
				rowIndex = -1;
				
			}
		}
		finally {
			// Defer adjusting the footer attributes until after all other attributes have been processed
			if (cache.pinsFootersToContentEdge && cache.showsFooters && cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
				var footerAttributes;
				
				if (lastFooterAttributesSection === bottommostSection) {
					footerAttributes = lastFooterAttributes;
								
					// If the footer's Y origin is higher than the content edge, the bottommost section is an outgoing section
					// and the next section's footer should be rendered as incoming
					if (footerAttributes.frame.origin[originAttribute] < this.collectionView.scrollOffset[originAttribute] + this.collectionView.frame.size[supplementaryViewSizeAttribute] - cache.footerHeight) {
						var nextSection = cache.sections[footerAttributes.indexPath.section + 1];
						if (nextSection) {
							var nextFooterAttributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
								BMCollectionViewFlowLayoutSupplementaryView.Footer,
								{atIndexPath: BMIndexPathMakeWithIndexes([footerAttributes.indexPath.section + 1])}
							);
							
							if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
								nextFooterAttributes.frame = BMRectMake(
									cache.sectionInsets.left, 
									Math.max(this.collectionView.scrollOffset.y + this.collectionView.frame.size.height - cache.footerHeight, footerAttributes.frame.bottom),
									this.collectionView.frame.size.width - cache.sectionInsets.left - cache.sectionInsets.right,
									cache.footerHeight	
								);
							}
							else {
								nextFooterAttributes.frame = BMRectMake(
									Math.max(this.collectionView.scrollOffset.x + this.collectionView.frame.size.width - cache.footerHeight, footerAttributes.frame.right), 
									cache.sectionInsets.top + cache.topPadding,
									cache.footerHeight,
									this.collectionView.frame.size.height - cache.sectionInsets.top - cache.sectionInsets.bottom - cache.topPadding - cache.bottomPadding
								);
							}
							
							attributes.push(nextFooterAttributes);
						}
					}
					
					footerAttributes.frame.origin[originAttribute] = Math.min(footerAttributes.frame.origin[originAttribute], this.collectionView.scrollOffset[originAttribute] + this.collectionView.frame.size[supplementaryViewSizeAttribute] - footerAttributes.frame.size[supplementaryViewSizeAttribute]);
					
					// Float this footer above all other content
					footerAttributes.style.zIndex = 1;
				}
				else {
					// Construct the footer attributes if they weren't already constructed
					footerAttributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
						BMCollectionViewFlowLayoutSupplementaryView.Footer,
						{atIndexPath: BMIndexPathMakeWithIndexes([sectionIndex])}
					);
					
					if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
						footerAttributes.frame = BMRectMake(
							cache.sectionInsets.left, this.collectionView.scrollOffset.y + this.collectionView.frame.size.height - cache.footerHeight,
							this.collectionView.frame.size.width - cache.sectionInsets.left - cache.sectionInsets.right,
							cache.footerHeight
						);
					}
					else {
						footerAttributes.frame = BMRectMake(
							this.collectionView.scrollOffset.x + this.collectionView.frame.size.width - cache.footerHeight,
							cache.sectionInsets.top + cache.topPadding,
							cache.footerHeight,
							this.collectionView.frame.size.height - cache.sectionInsets.top - cache.sectionInsets.bottom - cache.topPadding - cache.bottomPadding
						);
					}
					
					// Float this footer above all other content
					footerAttributes.style.zIndex = 1;
					
					attributes.push(footerAttributes);
				}
				
			}
		}
		
		return attributes;	
	},
	
	// NOTE: All initialAttributes... methods will simply return a copy of the regular attributes with an additional style added

    // @override - BMCollectionViewLayout
    initialAttributesForPresentedCellAtIndexPath: function (indexPath) {
		// Because cached layouts reuse the attributes, they must be copied before being modified
        var attributes = this.attributesForCellAtIndexPath(indexPath).copy();
        
        if (this.collectionView.delegate && this.collectionView.delegate.collectionViewInitialAttributesForPresentedCellAtIndexPath) {
	        return this.collectionView.delegate.collectionViewInitialAttributesForPresentedCellAtIndexPath(this.collectionView, indexPath, {withTargetAttributes: attributes});
        }
        
        attributes.frame.origin.y += this.collectionView.frame.size.height / 2;
        
        attributes.style = {
            rotateZ: '15deg',
            opacity: 0,
            translateZ: 0
        };
        
        return attributes;
    },

    // @override - BMCollectionViewLayout
    initialAttributesForPresentedSupplementaryViewWithIdentifier: function (identifier, options) {
		// Because cached layouts reuse the attributes, they must be copied before being modified
        var attributes = this.attributesForSupplementaryViewWithIdentifier(identifier, {atIndexPath: options.atIndexPath}).copy();
        
        if (this.collectionView.delegate && this.collectionView.delegate.collectionViewInitialAttributesForPresentedSupplementaryViewWithIdentifier) {
	        return this.collectionView.delegate.collectionViewInitialAttributesForPresentedSupplementaryViewWithIdentifier(this.collectionView, identifier, {atIndexPath: options.atIndexPath, withTargetAttributes: attributes});
        }
        
        attributes.frame.origin.x += attributes.frame.size.width / 2;
        
        attributes.style = {
            opacity: 0,
            translateZ: 0
        };
        
        return attributes;
    },

    // @override - BMCollectionViewLayout
	initialAttributesForAppearingCellAtIndexPath: function (indexPath) {
		// Because cached layouts reuse the attributes, they must be copied before being modified
		var attributes = this.attributesForCellAtIndexPath(indexPath).copy();
        
        if (this.collectionView.delegate && this.collectionView.delegate.collectionViewInitialAttributesForAppearingCellAtIndexPath) {
	        return this.collectionView.delegate.collectionViewInitialAttributesForAppearingCellAtIndexPath(this.collectionView, indexPath, {withTargetAttributes: attributes});
        }
		
		attributes.style = {opacity: 0, translateZ: 0, scaleX: 0.5, scaleY: 0.5};
		
		return attributes;
		
	},

    // @override - BMCollectionViewLayout
	initialAttributesForAppearingSupplementaryViewWithIdentifier: function (identifier, options) {
		// Because cached layouts reuse the attributes, they must be copied before being modified
		var attributes = this.attributesForSupplementaryViewWithIdentifier(identifier, {atIndexPath: options.atIndexPath}).copy();
        
        if (this.collectionView.delegate && this.collectionView.delegate.collectionViewInitialAttributesForAppearingSupplementaryViewWithIdentifier) {
	        return this.collectionView.delegate.collectionViewInitialAttributesForAppearingSupplementaryViewWithIdentifier(this.collectionView, identifier, {atIndexPath: options.atIndexPath, withTargetAttributes: attributes});
        }
		
		attributes.style = {opacity: 0, translateZ: 0, scaleX: 0.5, scaleY: 0.5};
		
		return attributes;
		
	},

    // @override - BMCollectionViewLayout
	initialAttributesForMovingCellFromIndexPath: function (indexPath, options) {
		var attributes;
		var self = this;
		
		this.collectionView.usingOldDataSet(function () {
			// When using automatic cell sizes, it is important to ensure that the sizing information has been computed
			// for the requested index path
			if (self._expectedCellSize) {
				if (self.previousLayout.resolvedIndexPath.section < indexPath.section ||
					(self.previousLayout.resolvedIndexPath.section == indexPath.section && self.previousLayout.resolvedIndexPath.row < indexPath.row)) {
						// If the layout has not been resolved up to this index path, continue computing it until it has
						self.previousLayout.iterator.next({indexPath: indexPath});
					}
			}

			if (self._cellSize && !self._expectedCellSize) {
				attributes = self.computedAttributesForCellAtIndexPath(indexPath, {usingCache: self.previousLayout});
			}
			else {
				attributes = self.cachedAttributesForCellAtIndexPath(indexPath, {usingCache: self.previousLayout});
			}
		});
		
		return attributes;
	},

    // @override - BMCollectionViewLayout
	initialAttributesForMovingSupplementaryViewWithIdentifier: function (identifier, options) {
		var attributes;
		var self = this;
		
		this.collectionView.usingOldDataSet(function () {
			if (identifier === BMCollectionViewTableLayoutSupplementaryView.Empty) {
				attributes = self.attributesForSupplementaryViewWithIdentifier(identifier, {atIndexPath: options.atIndexPath});
			}
			else if (self._cellSize && !self._expectedCellSize) {
				attributes = self.computedAttributesForSupplementaryViewWithIdentifier(identifier, {atIndexPath: options.atIndexPath, usingCache: self.previousLayout});
			}
			else {
				attributes = self.cachedAttributesForSupplementaryViewWithIdentifier(identifier, {atIndexPath: options.atIndexPath, usingCache: self.previousLayout});
			}
		});
		
		return attributes;
	},

    // @override - BMCollectionViewLayout
    supplementaryViewsToInsert: function () {
	    var count = this.collectionView.numberOfSections();
	    var oldCount;
	    var self = this;
		
	    this.collectionView.usingOldDataSet(function () {
		    oldCount = self.collectionView.numberOfSections();
	    });
	    
	    var views = [];
	    
	    for (var i = oldCount; i < count; i++) {
		    if (this.showsHeaders) {
			    views.push(BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
										BMCollectionViewFlowLayoutSupplementaryView.Header, 
										{atIndexPath: BMIndexPathMakeWithIndexes([i])}
									));
		    }
		    
		    if (this.showsFooters) {
			    views.push(BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
										BMCollectionViewFlowLayoutSupplementaryView.Footer, 
										{atIndexPath: BMIndexPathMakeWithIndexes([i])}
									));
		    }
	    }
	    
	    if (oldCount > 0 && count == 0) {
		    views.push(BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
									BMCollectionViewTableLayoutSupplementaryView.Empty, 
									{atIndexPath: BMIndexPathMakeWithIndexes([0])}
								));
	    }
	    
        return views;
    },

    // @override - BMCollectionViewLayout
    supplementaryViewsToDelete: function () {
	    var count = this.collectionView.numberOfSections();
	    var oldCount;
	    var self = this;
		
	    this.collectionView.usingOldDataSet(function () {
		    oldCount = self.collectionView.numberOfSections();
	    });
	    
	    var views = [];
	    
	    for (var i = count; i < oldCount; i++) {
		    if (this.showsHeaders) {
			    views.push(BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
										BMCollectionViewFlowLayoutSupplementaryView.Header, 
										{atIndexPath: BMIndexPathMakeWithIndexes([i])}
									));
		    }
		    
		    if (this.showsFooters) {
			    views.push(BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
										BMCollectionViewFlowLayoutSupplementaryView.Footer, 
										{atIndexPath: BMIndexPathMakeWithIndexes([i])}
									));
		    }
	    }
	    
	    if (oldCount == 0 && count > 0) {
		    views.push(BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
									BMCollectionViewFlowLayoutSupplementaryView.Empty, 
									{atIndexPath: BMIndexPathMakeWithIndexes([0])}
								));
	    }
	    
        return views;
    },
	
	// NOTE: All finalAttributes... methods will simply return a copy of the regular attributes from the previous layout with an additional style added

    // @override - BMCollectionViewLayout
    finalAttributesForDisappearingCellAtIndexPath: function (indexPath) {
        var attributes;
        var self = this;
        
        this.collectionView.usingOldDataSet(function () {
			if (self._cellSize && !self._expectedCellSize) {
				attributes = self.computedAttributesForCellAtIndexPath(indexPath, {usingCache: self.previousLayout});
			}
			else {
				attributes = self.cachedAttributesForCellAtIndexPath(indexPath, {usingCache: self.previousLayout}).copy();
			}
		
        
	        if (self.collectionView.delegate && self.collectionView.delegate.collectionViewFinalAttributesForDisappearingCellAtIndexPath) {
		        attributes = self.collectionView.delegate.collectionViewFinalAttributesForDisappearingCellAtIndexPath(self.collectionView, indexPath, {withTargetAttributes: attributes});
	        }
	        else {
				attributes.style = {opacity: 0, translateZ: 0, scaleX: 0.5, scaleY: 0.5};
			}
	        
        });
        
        return attributes;
    },

    // @override - BMCollectionViewLayout
    finalAttributesForDisappearingSupplementaryViewWithIdentifier: function (identifier, options) {
        var attributes;
        var self = this;
        
        this.collectionView.usingOldDataSet(function () {
			if (identifier === BMCollectionViewTableLayoutSupplementaryView.Empty) {
				attributes = self.attributesForSupplementaryViewWithIdentifier(identifier, {atIndexPath: options.atIndexPath});
			}
			else if (self._cellSize && !self._expectedCellSize) {
				attributes = self.computedAttributesForSupplementaryViewWithIdentifier(identifier, {atIndexPath: options.atIndexPath, usingCache: self.previousLayout});
			}
			else {
				attributes = self.cachedAttributesForSupplementaryViewWithIdentifier(identifier, {atIndexPath: options.atIndexPath, usingCache: self.previousLayout});
			}
        
	        if (self.collectionView.delegate && self.collectionView.delegate.collectionViewFinalAttributesForDisappearingSupplementaryViewWithIdentifier) {
		        attributes = self.collectionView.delegate.collectionViewFinalAttributesForDisappearingSupplementaryViewWithIdentifier(self.collectionView, identifier, {atIndexPath: options.atIndexPath, withTargetAttributes: attributes});
	        }
	        else {
				attributes.style = {opacity: 0, translateZ: 0, scaleX: 0.5, scaleY: 0.5};
			}
	        
        });
        
        return attributes;
    },
	
	// @override - BMCollectionViewLayout
	copy: function () {
		var copy = new BMCollectionViewFlowLayout();
		
		copy.cellSize = this.cellSize && this.cellSize.copy();
		copy.rowSpacing = this.rowSpacing;
		
		copy.showsHeaders = this.showsHeaders;
		copy.headerHeight = this.headerHeight;
		
		copy.showsFooters = this.showsFooters;
		copy.footerHeight = this.footerHeight;
		
		copy.sectionInsets = this.sectionInsets;
		
		copy.gravity = this.gravity;
		copy.leftAlignFinalRow = this.leftAlignFinalRow;
		copy.alignment = this.alignment;
		copy.orientation = this.orientation;
		
		copy.topPadding = this.topPadding;
		copy.bottomPadding = this.bottomPadding;
		copy.contentGravity = this.contentGravity;
		
		copy.pinsHeadersToContentEdge = this.pinsHeadersToContentEdge;
		copy.pinsFootersToContentEdge = this.pinsFootersToContentEdge;
		
		return copy;
	}
	
	
	
});

// @endtype


// @type BMCollectionViewMasonryLayout extends BMCollectionViewLayout

/**
 * The masonry layout arranges cells in a vertically scrolling container. Cells will be laid out in equally wide columns and each new cell will be positioned
 * in the column with the topmost space available, starting from the leftmost cell.
 * Additionally, columns in the masonry layout may have a speed assigned to them which affects the scrolling for that column alone. When a column has a higher scrolling speed,
 * it may contain more items for the same container height. Note that while layout order is deterministic, it does not always respect the order the items appear in the data set.
 * When using the masonry layout, the collection view must have a delegate that implements the method
 * Number collectionViewHeightForCellAtIndexPath(BMCollectionView BMIndexPath, {forColumnWidth: Number}) which returns the height to use for the cell at the given index path.
 * Because the masonry layout is a cached layout, it is not suitable for excessively large data sets.
 * The masonry layout does not support supplementary view and will ignore sections.
 */
var BMCollectionViewMasonryLayout = function () {}; // <constructor>

BMCollectionViewMasonryLayout.prototype = BMExtend({}, BMCollectionViewLayout.prototype, {

	// @override - BMCollectionViewLayout
	get supportsCopying() {
		return YES;
	},
	
	/**
	 * Mutually exclusive with numberOfColumns. If set, controls the minimum size a column may have. 
	 * Columns' width may be larger than this value, but this a the breakpoint based on which it is decided when to add or remove columns.
	 */
	_minimumColumnWidth: 128, // <Number, nullable>
	get minimumColumnWidth() { return this._minimumColumnWidth; },
	set minimumColumnWidth(width) {
		this._minimumColumnWidth = width;
		
		this.invalidateLayout();
	},
	
	/**
	 * Mutually exclusive with minimumColumns. If set, has priority over minimumColumnWidth and controls how many columns the masonry layout should use. 
	 * Columns will be resized so they fit.
	 */
	_numberOfColumns: undefined, // <Number, nullable>
	get numberOfColumns() { return this._numberOfColumns; },
	set numberOfColumns(number) {
		this._numberOfColumns = number;
		
		this.invalidateLayout();
	},
	
	/**
	 * Controls the horizontal spacing between columns.
	 */
	_columnSpacing: 22, // <Number>
	get columnSpacing() { return this._columnSpacing; },
	set columnSpacing(spacing) {
		this._columnSpacing = spacing;
		
		this.invalidateLayout();
	},
	
	/**
	 * Controls the vertical spacing between the cells in a column.
	 */
	_cellSpacing: 22, // <Number>
	get cellSpacing() { return this._cellSpacing; },
	set cellSpacing(spacing) {
		this._cellSpacing = spacing;
		
		this.invalidateLayout();
	},
	
	/**
	 * Controls how fast each column scrolls.
	 */
	_columnSpeeds: [], // <[Number]>
	get columnSpeeds() { return this._columnSpeeds; },
	set columnSpeeds(speeds) {
		this._columnSpeeds = speeds;
		
		this.invalidateLayout();
	},
	
	/**
	 * The padding from the top edge to the first item.
	 */
	_topPadding: 22, // <Number>
	get topPadding() { return this._topPadding; },
	set topPadding(padding) {
		this._topPadding = padding;
		
		this.invalidateLayout();
	},
	
	/**
	 * The padding from the bottom edge to the last item.
	 */
	_bottomPadding: 22, // <Number>
	get bottomPadding() { return this._bottomPadding; },
	set bottomPadding(padding) {
		this._bottomPadding = padding;
		
		this.invalidateLayout();
	},
	
	/**
	 * Contains the cached layout attributes for all objects in the collection view.
	 */
	cachedLayout: undefined, // <Object>
	
	// @override - BMCollectionViewLayout
	prepareLayout: function () {
		if (this.isChangingBounds) return;
		
		this.previousLayout = this.cachedLayout;
		this.cachedLayout = {};
		
		var cachedLayout = this.cachedLayout;
		
		var width = this.collectionView.frame.size.width;
		var columnSpacing = this.columnSpacing;
		var cellSpacing = this.cellSpacing;
		
		var numberOfColumns = this.numberOfColumns;
		var columnWidth;
		
		var columnSpeeds = this.columnSpeeds;
		
		if (!numberOfColumns) {
			// If the number of columns isn't specifically set, determine it based on the minimum column width
			// The actual column width should also be determined as the minimum column width is just a guideline
			columnWidth = this.minimumColumnWidth;
			
			numberOfColumns = (width / columnWidth) | 0;
			
			// If adding the spacing causes the total width to go over the collection view frame's width, then just decrease the count by 1
			// This can technically fail if the columns are narrower than the spacing, but in most cases it should work fine
			if (numberOfColumns * columnWidth + (numberOfColumns + 1) * columnSpacing > width) {
				numberOfColumns -= 1;
			}
			
			// Determine the actual column width
			var usableSpace = width - (numberOfColumns + 1) * columnSpacing;
			columnWidth = (usableSpace / numberOfColumns) | 0;
			
		}
		else {
			// Otherwise determine the width of the columns only
			var usableSpace = width - (numberOfColumns + 1) * columnSpacing;
			columnWidth = (usableSpace / numberOfColumns) | 0;
		}
		
		// Create the columns
		cachedLayout.columns = [];
		for (var i = 0; i < numberOfColumns; i++) {
			cachedLayout.columns.push({
				height: this._topPadding,
				speedHeight: this._topPadding / (columnSpeeds[i] || 1),
				speed: columnSpeeds[i] || 1,
				attributes: [],
				x: columnSpacing + i * (columnSpacing + columnWidth)
			});
		}
		
		// Enumerate all of the objects, ignoring their sections
		var numberOfSections = this.collectionView.numberOfSections();
		
		for (var i = 0; i < numberOfSections; i++) {
			var numberOfObjects = this.collectionView.numberOfObjectsInSectionAtIndex(i);
			
			for (var j = 0; j < numberOfObjects; j++) {
				
				var indexPath = this.collectionView.indexPathForObjectAtRow(j, {inSectionAtIndex: i});
				
				var cellHeight = this.collectionView.delegate.collectionViewHeightForCellAtIndexPath(this.collectionView, indexPath, {forColumnWidth: columnWidth});
				
				var targetColumnTop = cachedLayout.columns[0].speedHeight;
				var targetColumnIndex = 0;
				
				// Find the column in which this cell should go
				for (var columnIndex = 1; columnIndex < numberOfColumns; columnIndex++) {
					var column = cachedLayout.columns[columnIndex];
					
					if (column.speedHeight < targetColumnTop) {
						targetColumnTop = column.speedHeight;
						targetColumnIndex = columnIndex;
					}
				}
				
				var column = cachedLayout.columns[targetColumnIndex];
				
				// Then construct and add the object's attributes
				var attributes = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(indexPath);
				
				attributes.frame = BMRectMake(column.x, column.height, columnWidth, cellHeight);
				attributes.style = {translateZ: 0};
				
				column.attributes.push(attributes);
				
				// Adjust the column's height and speed height
				column.height += cellHeight + cellSpacing;
				column.speedHeight += (cellHeight + cellSpacing) / column.speed;
				
			}
			
		}
		
		// Add the bottom padding to the column heights
		for (var columnIndex = 0; columnIndex < numberOfColumns; columnIndex++) {
			var column = cachedLayout.columns[columnIndex];
			
			column.height += this._bottomPadding;
			column.speedHeight += this._bottomPadding / column.speed;
		}
		
		
	},
	
	// @override - BMCollectionViewLayout
	contentSize: function () {
		var height = 0;
		
		for (var i = 0; i < this.cachedLayout.columns.length; i++) {
			if (height < this.cachedLayout.columns[i].speedHeight) {
				height = this.cachedLayout.columns[i].speedHeight;
			}
		}
		
		return BMSizeMake(this.collectionView.frame.size.width, Math.max(height, this.collectionView.frame.size.height));
		
	},
	
	// @override - BMCollectionViewLayout
	collectionViewWillStartUpdates: function () {
		this.prepareLayout();
	},
	
	// @override - BMCollectionViewLayout
	collectionViewDidStartUpdates: function () {
		this.previousLayout = undefined;
	},
	
	// The masonry layout always invalidates the layout during scrolling to apply the speed to each column.
	// @override - BMCollectionViewLayout
	shouldInvalidateLayoutForBoundsChange: function (bounds) {
		this.isChangingBounds = YES;
		//this.collectionView.attributeCache = [];
		return YES;
	},
	
	// @override - BMCollectionViewLayout
	didInvalidateLayoutForBoundsChange: function () {
		this.isChangingBounds = NO;
	},
	
	// @override - BMCollectionViewLayout
	attributesForElementsInRect: function (rect) {
		return this.cachedAttributesForElementsInRect(rect);
	},
	
	/**
	 * Retrieves the cached attributes for all cells in the given rect.
	 * @param rect <BMRect>						The rect.
	 * {
	 *	@param usingCache <Object, nullable>	Defaults to this layout's current cache. The cache object to use.
	 * }
	 */
	cachedAttributesForElementsInRect: function (rect, options) {
		var cache = (options && options.usingCache) || this.cachedLayout;
		var offset = this.collectionView.scrollOffset;
		
		var rectTop = rect.origin.y;
		var rectBottom = rect.bottom;
		var resultingAttributes = [];
		
		// Find the attributes in each column
		var columns = cache.columns;
		var numberOfColumns = columns.length;
		
		for (var i = 0; i < numberOfColumns; i++) {
			
			var column = columns[i];
			
			// The speedTop is the unscaled top position at which to start retrieving cells.
			var speedTop = offset.y * column.speed;
			var speedBottom = speedTop + rect.size.height;
			
			// The speedAdjustment is the amount by which to displace each attribute's Y origin.
			var speedAdjustment = offset.y - speedTop;
			
			// Find the first attribute
			var numberOfAttributes = column.attributes.length;
			var attributes = column.attributes;
			var attributeIndex = 0;
			for (; attributeIndex < numberOfAttributes; attributeIndex++) {
				var attribute = attributes[attributeIndex];
				
				if (attribute.frame.bottom + speedAdjustment > rectTop) break;
			}
			
			// Add attributes until they go off-screen
			while (true) {
				
				if (attributeIndex == numberOfAttributes) break;
				
				var attribute = attributes[attributeIndex];
				
				if (attribute.frame.top + speedAdjustment > rectBottom) break;
				
				attribute = attribute.copy();
				attribute.frame.origin.y = (attribute.frame.origin.y + speedAdjustment) | 0;
				
				resultingAttributes.push(attribute);
				
				attributeIndex++;
			}
			
		}
		
		return resultingAttributes;
		
	},
	
	// @override - BMCollectionViewLayout
	attributesForCellAtIndexPath: function (indexPath) {
		return this.cachedAttributesForCellAtIndexPath(indexPath);
	},
	
	/**
	 * Retrieves the cached attributes for the cell at the given index path.
	 * @param indexPath <BMIndexPath>			The cell's index path.
	 * {
	 *	@param usingCache <Object, nullable>	Defaults to this layout's current cache. The cache object to use.
	 * }
	 */
	cachedAttributesForCellAtIndexPath: function (indexPath, options) {
		var offset = this.collectionView.scrollOffset;
		
		var cache = (options && options.usingCache) || this.cachedLayout;
		
		// Find the attributes in each column
		var columns = cache.columns;
		var numberOfColumns = columns.length;
		
		for (var i = 0; i < numberOfColumns; i++) {
			var column = columns[i];
			
			// The speedTop is the unscaled top position at which to start retrieving cells.
			var speedTop = offset.y * column.speed;
			
			// The speedAdjustment is the amount by which to displace each attribute's Y origin.
			var speedAdjustment = offset.y - speedTop;
			
			// Find the attribute
			var numberOfAttributes = column.attributes.length;
			var attributes = column.attributes;
			var attributeIndex = 0;
			for (; attributeIndex < numberOfAttributes; attributeIndex++) {
				var attribute = attributes[attributeIndex];
				
				if (attribute.indexPath.section == indexPath.section && attribute.indexPath.row == indexPath.row) {
					attribute = attribute.copy();
					
					attribute.frame.origin.y = (attribute.frame.origin.y + speedAdjustment) | 0;
					attribute.speed = column.speed;
					
					return attribute;
				}
			}
			
		}
		
	},
	
	
	// NOTE: All initialAttributes... methods will simply return a copy of the regular attributes with an additional style added

    // @override - BMCollectionViewLayout
    initialAttributesForPresentedCellAtIndexPath: function (indexPath) {
		// attributesForCellAtIndexPath always returns copies, so it's not needed to copy it again here
        var attributes = this.attributesForCellAtIndexPath(indexPath);
        
        if (this.collectionView.delegate && this.collectionView.delegate.collectionViewInitialAttributesForPresentedCellAtIndexPath) {
	        return this.collectionView.delegate.collectionViewInitialAttributesForPresentedCellAtIndexPath(this.collectionView, indexPath, {withTargetAttributes: attributes, layout: this});
        }
        
        attributes.frame.origin.y += (this.collectionView.frame.size.height / 3) * attributes.speed;
        
        attributes.style = {
            opacity: 0,
            translateZ: 0,
            rotateZ: '15deg'
        };
        
        return attributes;
    },

    // @override - BMCollectionViewLayout
	initialAttributesForAppearingCellAtIndexPath: function (indexPath) {
		// attributesForCellAtIndexPath always returns copies, so it's not needed to copy it again here
		var attributes = this.attributesForCellAtIndexPath(indexPath);
        
        if (this.collectionView.delegate && this.collectionView.delegate.collectionViewInitialAttributesForAppearingCellAtIndexPath) {
	        return this.collectionView.delegate.collectionViewInitialAttributesForAppearingCellAtIndexPath(this.collectionView, indexPath, {withTargetAttributes: attributes, layout: this});
        }
		
		attributes.frame.origin.y += (this.collectionView.frame.size.height / 3) * attributes.speed;
        
        attributes.style = {
            opacity: 0,
            translateZ: 0,
            rotateZ: '15deg'
        };
		
		return attributes;
		
	},

    // @override - BMCollectionViewLayout
	initialAttributesForMovingCellFromIndexPath: function (indexPath, options) {
		var attributes;
		var self = this;
		
		this.collectionView.usingOldDataSet(function () {
			attributes = self.cachedAttributesForCellAtIndexPath(indexPath, {usingCache: self.previousLayout});
		});
		
		return attributes;
	},
	
	// NOTE: All finalAttributes... methods will simply return a copy of the regular attributes from the previous layout with an additional style added

    // @override - BMCollectionViewLayout
    finalAttributesForDisappearingCellAtIndexPath: function (indexPath) {
        var attributes;
        var self = this;
        
        this.collectionView.usingOldDataSet(function () {
			attributes = self.cachedAttributesForCellAtIndexPath(indexPath, {usingCache: self.previousLayout});
		
			
        
	        if (self.collectionView.delegate && self.collectionView.delegate.collectionViewFinalAttributesForDisappearingCellAtIndexPath) {
		        attributes = self.collectionView.delegate.collectionViewFinalAttributesForDisappearingCellAtIndexPath(self.collectionView, indexPath, {withTargetAttributes: attributes});
	        }
	        else {
				attributes.frame.origin.y += (self.collectionView.frame.size.height / 3) * attributes.speed;
		        
		        attributes.style = {
		            opacity: 0,
		            translateZ: 0,
		            rotateZ: '15deg'
		        };
	        }
	        
        });
        
        return attributes;
    },
	
	// @override - BMCollectionViewLayout
	copy: function () {
		var copy = new BMCollectionViewMasonryLayout();
		
		copy.minimumColumnWidth = this.minimumColumnWidth;
		copy.numberOfColumns = this.numberOfColumns;
		copy.columnSpacing = this.columnSpacing;
		copy.cellSpacing = this.cellSpacing;
		
		copy.columnSpeeds = this.columnSpeeds && this.columnSpeeds.slice();
		
		copy.topPadding = this.topPadding;
		copy.bottom = this.bottomPadding;
		
		return copy;
	}
	
});

// @endtype

// @type BMCollectionViewStackLayout extends BMCollectionViewLayout

/**
 * The stack layout is a vertically scrolling layout that presents cells as a stack, where the current cell appears above the other cells.
 * In the stack layout, previous cells appear behind the current cell, while upcoming cells are hidden.
 * 
 * When scrolling in the stack layout, the scroll position will always snap back to fully show a single cell.
 * 
 * The stack layout does not support sections or supplementary views.
 */
var BMCollectionViewStackLayout = function () {}; // <constructor>

BMCollectionViewStackLayout.prototype = BMExtend({}, BMCollectionViewLayout.prototype, {

	// @override - BMCollectionViewLayout
	get supportsCopying() {
		return YES;
	},

	/**
	 * Controls how the stack layout will appear when there is a single cell in the data set.
	 * When this property is set to YES, insets are ignored when there is a single cell and that cell will occupy
	 * the collection view's entire area.
	 * If it is set to NO, the single cell will have the usual insets applied to it.
	 */
	_showsSingleCellFullScreen: NO, // <Boolean>

	get showsSingleCellFullScreen() { return this._showsSingleCellFullScreen; },
	set showsSingleCellFullScreen(shows) {
		this._showsSingleCellFullScreen = shows;
		this.invalidateLayout();
	},

	/**
	 * When enabled, stack layout will only show the first cell in the data set, without any padding.
	 */
	_showsSingleCell: NO, // <Boolean>

	get showsSingleCell() { return this._showsSingleCell; },
	set showsSingleCell(shows) {
		this._showsSingleCell = shows;
		this.invalidateLayout();
	},

	/**
	 * Controls the edges between the content and the collection view.
	 */
	_insets: BMInsetMake(88, 88, 88, 88), // <BMInset>

	get insets() { return this._insets.copy(); },
	set insets(insets) {
		this._insets = insets.copy();
		this.invalidateLayout();
	},

	/**
	 * Controls the spread between background cells.
	 */
	_spread: 22, // <Number>

	get spread() { return this._spread; },
	set spread(spread) {
		this._spread = spread;
		this.invalidateLayout();
	},

	/**
	 * Controls how many background cells will be shown.
	 */
	_numberOfBackgroundCells: 3, // <Number>

	get numberOfBackgroundCells() { return this._numberOfBackgroundCells; },
	set numberOfBackgroundCells(number) {
		this._numberOfBackgroundCells = number;
		this.invalidateLayout();
	},

	/**
	 * Controls the minimum scale for background cells.
	 */
	_minimumScale: .9, // <Number>

	get minimumScale() { return this._minimumScale; },
	set minimumScale(scale) {
		this._minimumScale = scale;
		this.invalidateLayout();
	},

	/**
	 * Controls whether cells behind the topmost cell are blurred.
	 */
	_blursBackgroundCells: NO, // <Boolean>

	get blursBackgroundCells() { return this._blursBackgroundCells; },
	set blursBackgroundCells(blurs) {
		this._blursBackgroundCells = blurs;
		this.invalidateLayout();
	},

	/**
	 * Controls the maximum blur of background cells.
	 */
	_maximumBlur: 15, // <Number>

	get maximumBlur() { return this._maximumBlur; },
	set maximumBlur(blur) {
		this._maximumBlur = blur;
		this.invalidateLayout();
	},

	/**
	 * Controls whether new cells scroll in with a rotation effect.
	 */
	_rotatesCells: NO, // <Boolean>

	get rotatesCells() { return this._rotatesCells; },
	set rotatesCells(rotates) {
		this._rotatesCells = rotates;
		this.invalidateLayout();
	},

	/**
	 * Controls the maximum rotation of cells, in degrees.
	 */
	_rotation: -90, // <Number>

	get rotation() { return this._rotation; },
	set rotation(rotation) {
		this._rotation = rotation;
		this.invalidateLayout();
	},

	/**
	 * Cached number of items in the current data set.
	 */
	_numberOfObjects: 0, // <Number>

	// @override - BMCollectionViewLayout
	shouldInvalidateLayoutForFrameChange: function () {
		return YES;
	},

	// @override - BMCollectionViewLayout
	shouldInvalidateLayoutForBoundsChange: function () {
		return YES;
	},
	
	// @override - BMCollectionViewLayout
	collectionViewWillStartUpdates: function () {
		this.prepareLayout();
	},

	prepareLayout: function () {
		var numberOfObjects = 0;
		var numberOfSections = this.collectionView.numberOfSections();

		for (var i = 0; i < numberOfSections; i++) {
			numberOfObjects += this.collectionView.numberOfObjectsInSectionAtIndex(i);
		}

		this._numberOfObjects = numberOfObjects;

	},

	contentSize: function () {
		if (this._showsSingleCell) {
			return this.collectionView.frame.size.copy();
		}
		return BMSizeMake(this.collectionView.frame.size.width, this.collectionView.frame.size.height * this._numberOfObjects);
	},

	/**
	 * Returns the index path that appears before the given index path in the data set.
	 * If the given index path is the first index path in the data set, the result will be undefined.
	 * @param indexPath <BMIndexPath>		The current index path.
	 * @return <BMIndexPath>				The previous index path if it could be found, undefiend otherwise.
	 */
	previousIndexPathWithIndexPath: function (indexPath) {
		if (indexPath.row) {
			return this.collectionView.indexPathForObjectAtRow(indexPath.row - 1, {inSectionAtIndex: indexPath.section});
		}

		var section = indexPath.section - 1;
		while (section >= 0) {
			var numberOfObjects = this.collectionView.numberOfObjectsInSectionAtIndex(section);

			if (numberOfObjects) {
				return this.collectionView.indexPathForObjectAtRow(numberOfObjects - 1, {inSectionAtIndex: section});
			}

			section--;
		}
	},
	
	/**
	 * Returns the index path that appears after the given index path in the data set.
	 * If the given index path is the last index path in the data set, the result will be undefined.
	 * @param indexPath <BMIndexPath>		The current index path.
	 * @return <BMIndexPath>				The next index path if it could be found, undefiend otherwise.
	 */
	nextIndexPathWithIndexPath: function (indexPath) {
		var numberOfObjects = this.collectionView.numberOfObjectsInSectionAtIndex(indexPath.section);
		if (indexPath.row < numberOfObjects - 1) {
			return this.collectionView.indexPathForObjectAtRow(indexPath.row + 1, {inSectionAtIndex: indexPath.section});
		}

		var numberOfSections = this.collectionView.numberOfSections();
		var section = indexPath.section + 1;
		while (section < numberOfSections) {
			var numberOfObjects = this.collectionView.numberOfObjectsInSectionAtIndex(section);

			if (numberOfObjects) {
				return this.collectionView.indexPathForObjectAtRow(0, {inSectionAtIndex: section});
			}

			section++;
		}
	},

	// @override - BMCollectionViewLayout
	attributesForElementsInRect: function (rect) {
		if (this._showsSingleCell) {
			var attributes = [];

			if (this.collectionView.numberOfSections() && this.collectionView.numberOfObjectsInSectionAtIndex(0)) {
				var attribute = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(
					this.collectionView.indexPathForObjectAtRow(0, {inSectionAtIndex: 0})
				);

				attribute.frame = this.collectionView.frame.copy();
				attribute.frame.origin = BMPointMake();

				attributes.push(attribute);
			}

			return attributes;
		}

		var scrollOffset = this.collectionView.scrollOffset;
		var collectionViewHeight = this.collectionView.frame.size.height;
		var collectionViewWidth = this.collectionView.frame.size.width;

		var topVisibleMargin = scrollOffset.y;
		var bottomVisibleMargin = scrollOffset.y + collectionViewHeight;

		var cellWidth = collectionViewWidth - this.insets.left - this.insets.right;
		var cellHeight = collectionViewHeight - this.insets.top - this.insets.bottom;

		var attributes = [];

		var currentOffset = 0;

		// Find the current topmost cell. This will be the first cell whose bottom edge is within the visible area
		var indexPath;
		var numberOfSections = this.collectionView.numberOfSections();
		for (var i = 0; i < numberOfSections; i++) {
			var numberOfObjects = this.collectionView.numberOfObjectsInSectionAtIndex(i);

			for (var j = 0; j < numberOfObjects; j++) {
				currentOffset += collectionViewHeight;

				if (currentOffset >= topVisibleMargin && currentOffset <= bottomVisibleMargin) {
					indexPath = this.collectionView.indexPathForObjectAtRow(j, {inSectionAtIndex: i});
					break;
				}
			}

			// If the index path was found, stop looking
			if (indexPath) break;

		}

		// If no index path was found, return an empty array.
		if (!indexPath) return attributes;

		var spread = this._spread;

		// The displacement percentage represents how far away the topmost cell is from the scroll offset.
		var displacementPercentage = (collectionViewHeight - currentOffset + topVisibleMargin) / collectionViewHeight;

		var displacementPixels = (this._spread * displacementPercentage) | 0;
		
		var scalePerCell = (1 - this._minimumScale) / (this._numberOfBackgroundCells + 1);
		var opacityPerCell = 1 / (this._numberOfBackgroundCells + 1);
		var blurPerCell = this._maximumBlur / (this._numberOfBackgroundCells + 1);

		// Create the attributes for the topmost cell.
		var currentCellAttributes = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(indexPath);
		currentCellAttributes.frame = BMRectMakeWithX(this.insets.left, {
			// The topmost cell's position is adjusted so it appears in the center of the view
			y: topVisibleMargin + this.insets.top - displacementPixels, 
			width: cellWidth,
			height: cellHeight
		});

		currentCellAttributes.style.zIndex = 2 * this._numberOfBackgroundCells + 4;
		currentCellAttributes.style.scaleX = 1 - scalePerCell * displacementPercentage;
		currentCellAttributes.style.scaleY = 1 - scalePerCell * displacementPercentage;
		currentCellAttributes.style.opacity = 1 - opacityPerCell * displacementPercentage;
		if (this._blursBackgroundCells) currentCellAttributes.style.blur = (displacementPercentage * blurPerCell) + 'px';

		if (this._rotatesCells) {
			currentCellAttributes.style.rotateX = (this.numberOfBackgroundCells - 1) / 10000 + 'deg';
			currentCellAttributes.style.transformOriginX = '50%';
			currentCellAttributes.style.transformOriginY = '100%';
			currentCellAttributes.style.translateZ = 2 * this._numberOfBackgroundCells + 4 + 'px';
		}

		attributes.push(currentCellAttributes);

		// Create the attributes for the next cell
		var nextIndexPath = this.nextIndexPathWithIndexPath(indexPath);
		if (nextIndexPath) {
			let baseY = currentOffset - this.insets.bottom + this.insets.top / 3;
			let expectedY = currentOffset + this.insets.top;

			// Adjust the Y so the next cell is visible when the current cell is on screen
			var nextCellAttributes = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(nextIndexPath);
			nextCellAttributes.frame = BMRectMakeWithX(this.insets.left, {
				y: BMNumberByInterpolatingNumbersWithFraction(baseY, expectedY, displacementPercentage),
				width: cellWidth,
				height: cellHeight
			});

			nextCellAttributes.style.zIndex = this._numberOfBackgroundCells * 2 + 6;

			if (this._rotatesCells) {
				nextCellAttributes.style.rotateX = BMNumberByInterpolatingNumbersWithFraction(this._rotation, 0, displacementPercentage) + 'deg';
				nextCellAttributes.style.transformOriginX = '50%';
				nextCellAttributes.style.transformOriginY = '100%';
				nextCellAttributes.style.translateZ = this._numberOfBackgroundCells * 2 + 6 + 'px';
			}

			attributes.push(nextCellAttributes);


			// Create the attributes for the upcoming cell
			let upcomingIndexPath = this.nextIndexPathWithIndexPath(nextIndexPath);
			if (upcomingIndexPath) {
				//let upcomingDisplacement = displacementPercentage >= 1 ? displacementPercentage - 1 : displacementPercentage;
				let upcomingOffset = currentOffset + this.collectionView.frame.size.height;

				let baseY = upcomingOffset - this.insets.bottom + this.insets.top / 3;
				let expectedY = upcomingOffset + this.insets.top;

				// Adjust the Y so the next cell is visible when the current cell is on screen
				var nextCellAttributes = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(upcomingIndexPath);
				nextCellAttributes.frame = BMRectMakeWithX(this.insets.left, {
					y: baseY, //BMNumberByInterpolatingNumbersWithFraction(baseY, expectedY, 1 - displacementPercentage),
					width: cellWidth,
					height: cellHeight
				});

				nextCellAttributes.style.zIndex = this._numberOfBackgroundCells * 2 + 8;

				if (this._rotatesCells) {
					nextCellAttributes.style.rotateX = this._rotation + 'deg';
					nextCellAttributes.style.transformOriginX = '50%';
					nextCellAttributes.style.transformOriginY = '100%';
					nextCellAttributes.style.translateZ = this._numberOfBackgroundCells * 2 + 8 + 'px';
				}

				attributes.push(nextCellAttributes);
			}
		}

		// Create the attributes for the previous cells
		for (var i = 0; i < this._numberOfBackgroundCells; i++) {
			var previousIndexPath = this.previousIndexPathWithIndexPath(indexPath);

			if (!previousIndexPath) return attributes;
			
			var previousCellAttributes = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(previousIndexPath);
			previousCellAttributes.frame = BMRectMakeWithX(this.insets.left, {
				y: topVisibleMargin + this.insets.top - displacementPixels - (i + 1) * this._spread,
				width: cellWidth,
				height: cellHeight
			});
			
			previousCellAttributes.style.zIndex = 2 * (this._numberOfBackgroundCells + 1 - i);
			previousCellAttributes.style.scaleX = 1 - scalePerCell * displacementPercentage - scalePerCell * (i + 1);
			previousCellAttributes.style.scaleY = 1 - scalePerCell * displacementPercentage - scalePerCell * (i + 1);
			previousCellAttributes.style.opacity = 1 - opacityPerCell * displacementPercentage - opacityPerCell * (i + 1);
			if (this._blursBackgroundCells) previousCellAttributes.style.blur = ((displacementPercentage + i + 1) * blurPerCell) + 'px';

			if (this._rotatesCells) {
				previousCellAttributes.style.rotateX = (this.numberOfBackgroundCells + i) / 10000 + 'deg';
				previousCellAttributes.style.transformOriginX = '50%';
				previousCellAttributes.style.transformOriginY = '100%';
				previousCellAttributes.style.translateZ = 2 * (this._numberOfBackgroundCells + 1 - i) + 'px';
			}

			attributes.push(previousCellAttributes);
			
			indexPath = previousIndexPath;
		}

		return attributes;
	},
	
	// @override - BMCollectionViewLayout
	attributesForCellAtIndexPath: function (indexPath) {
		if (this._showsSingleCell) {
			var attribute = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(indexPath);

			attribute.frame = this.collectionView.frame.copy();
			attribute.frame.origin = BMPointMake();

			if (indexPath.row != 0 || indexPath.section != 0) {
				attribute.isHidden = YES;
				attribute.style.opacity = 0;
			}

			return attribute;
		}

		var scrollOffset = this.collectionView.scrollOffset;
		var collectionViewHeight = this.collectionView.frame.size.height;
		var collectionViewWidth = this.collectionView.frame.size.width;

		var topVisibleMargin = scrollOffset.y;
		var bottomVisibleMargin = scrollOffset.y + collectionViewHeight;

		var cellWidth = collectionViewWidth - this.insets.left - this.insets.right;
		var cellHeight = collectionViewHeight - this.insets.top - this.insets.bottom;

		var attributes = [];

		var currentOffset = 0;

		// Find the current topmost cell. This will be the first cell whose bottom edge is within the visible area
		var topmostIndexPath;
		var numberOfSections = this.collectionView.numberOfSections();
		for (var i = 0; i < numberOfSections; i++) {
			var numberOfObjects = this.collectionView.numberOfObjectsInSectionAtIndex(i);

			for (var j = 0; j < numberOfObjects; j++) {
				currentOffset += collectionViewHeight;

				if (currentOffset >= topVisibleMargin && currentOffset <= bottomVisibleMargin) {
					topmostIndexPath = this.collectionView.indexPathForObjectAtRow(j, {inSectionAtIndex: i});
					break;
				}
			}

			// If the index path was found, stop looking
			if (topmostIndexPath) break;

		}

		var spread = this._spread;

		// The displacement percentage represents how far away the topmost cell is from the scroll offset.
		var displacementPercentage = (collectionViewHeight - currentOffset + topVisibleMargin) / collectionViewHeight;

		var displacementPixels = (this._spread * displacementPercentage) | 0;
		
		var scalePerCell = (1 - this._minimumScale) / (this._numberOfBackgroundCells + 1);
		var opacityPerCell = 1 / (this._numberOfBackgroundCells + 1);
		var blurPerCell = this._maximumBlur / (this._numberOfBackgroundCells + 1);

		if (indexPath.isEqualToIndexPath(topmostIndexPath, {usingComparator: this.collectionView.identityComparator})) {

			var currentCellAttributes = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(indexPath);
			currentCellAttributes.frame = BMRectMakeWithX(this.insets.left, {
				// The topmost cell's position is adjusted so it appears in the center of the view
				y: topVisibleMargin + this.insets.top - displacementPixels, 
				width: cellWidth,
				height: cellHeight
			});

			currentCellAttributes.style.zIndex = this._numberOfBackgroundCells + 2;
			currentCellAttributes.style.scaleX = 1 - scalePerCell * displacementPercentage;
			currentCellAttributes.style.scaleY = 1 - scalePerCell * displacementPercentage;
			currentCellAttributes.style.opacity = 1 - opacityPerCell * displacementPercentage;
			if (this._blursBackgroundCells) currentCellAttributes.style.blur = (displacementPercentage * blurPerCell) + 'px';
	
			return currentCellAttributes;
		}
		
		// Create the attributes for the next cell
		var nextIndexPath = this.nextIndexPathWithIndexPath(topmostIndexPath);
		if (nextIndexPath && indexPath.isEqualToIndexPath(nextIndexPath, {usingComparator: this.collectionView.identityComparator})) {
			var nextCellAttributes = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(nextIndexPath);
			nextCellAttributes.frame = BMRectMakeWithX(this.insets.left, {
				y: currentOffset + this.insets.top,
				width: cellWidth,
				height: cellHeight
			});

			nextCellAttributes.style.zIndex = this._numberOfBackgroundCells + 3;

			return nextCellAttributes;
		}

		if (indexPath.section > nextIndexPath.section || (indexPath.section == nextIndexPath.section && indexPath.row > nextIndexPath.row)) {
			var y = 0;
			for (var i = 0; i < indexPath.section; i++) {
				var numberOfObjects = this.collectionView.numberOfObjectsInSectionAtIndex(i);
	
				y += collectionViewHeight * numberOfObjects;
	
			}

			y += collectionViewHeight * indexPath.row;

			var attributes = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(indexPath);
			attributes.frame = BMRectMakeWithX(this.insets.left, {
				y: y,
				width: cellWidth,
				height: cellHeight
			});
			attributes.isHidden = YES;
			attributes.opacity = 0;
			return attributes;
		}

		// Create the attributes for the previous cells
		for (var i = 0; i < this._numberOfBackgroundCells; i++) {
			var previousIndexPath = this.previousIndexPathWithIndexPath(topmostIndexPath);

			if (!previousIndexPath) break;

			if (!indexPath.isEqualToIndexPath(previousIndexPath, {usingComparator: this.collectionView.identityComparator})) {
				
				topmostIndexPath = previousIndexPath;
				continue;
			}
			
			var previousCellAttributes = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(previousIndexPath);
			previousCellAttributes.frame = BMRectMakeWithX(this.insets.left, {
				y: topVisibleMargin + this.insets.top - displacementPixels - (i + 1) * this._spread,
				width: cellWidth,
				height: cellHeight
			});
			
			previousCellAttributes.style.zIndex = this._numberOfBackgroundCells + 1 - i;
			previousCellAttributes.style.scaleX = 1 - scalePerCell * displacementPercentage - scalePerCell * (i + 1);
			previousCellAttributes.style.scaleY = 1 - scalePerCell * displacementPercentage - scalePerCell * (i + 1);
			previousCellAttributes.style.opacity = 1 - opacityPerCell * displacementPercentage - opacityPerCell * (i + 1);
			if (this._blursBackgroundCells) previousCellAttributes.style.blur = ((displacementPercentage + i + 1) * blurPerCell) + 'px';

			return previousCellAttributes;
		}
		
		var previousCellAttributes = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(indexPath);
		previousCellAttributes.frame = BMRectMakeWithX(this.insets.left, {
			y: topVisibleMargin + this.insets.top - (this._numberOfBackgroundCells + 1) * this._spread,
			width: cellWidth,
			height: cellHeight
		});
		
		previousCellAttributes.style.zIndex = 0;
		previousCellAttributes.style.scaleX = this._minimumScale;
		previousCellAttributes.style.scaleY = this._minimumScale;
		previousCellAttributes.style.opacity = 0;
		if (this._blursBackgroundCells) previousCellAttributes.style.blur = (this._maximumBlur) + 'px';

		return previousCellAttributes;

	},

	// @override - BMCollectionViewLayout
	rectWithScrollingPositionOfCellAtIndexPath: function (indexPath) {
		var collectionViewHeight = this.collectionView.frame.size.height;

		var y = 0;
		for (var i = 0; i < indexPath.section; i++) {
			var numberOfObjects = this.collectionView.numberOfObjectsInSectionAtIndex(i);

			y += collectionViewHeight * numberOfObjects;

		}

		y += collectionViewHeight * indexPath.row;

		return BMRectMakeWithX(0, {y: y, width: this.collectionView.frame.size.width, height: this.collectionView.frame.size.height});
	},

	// @override - BMCollectionViewLayout
	snapsScrollPosition() {
		return YES;
	},

	// @override - BMCollectionViewLayout
	snappingScrollOffsetForScrollOffset(offset, args) {
		var offset = offset.copy();

		var additionalOffset = (args.withVerticalDirection == BMScrollingDirectionVertical.Bottom ? this.collectionView.frame.size.height : 0);

		offset.y = ((offset.y / this.collectionView.frame.size.height) | 0) * this.collectionView.frame.size.height + additionalOffset;

		offset.y = Math.max(0, Math.min(this.collectionView.size.height - this.collectionView.frame.size.height, offset.y));

		return offset;
	},

	// @override - BMCollectionViewLayout
	copy() {
		var layout = new BMCollectionViewStackLayout();

		layout._showsSingleCellFullScreen = this._showsSingleCellFullScreen;
		layout._showsSingleCell = this._showsSingleCell;
		layout._insets = this._insets.copy();
		layout._spread = this._spread;
		layout._numberOfBackgroundCells = this._numberOfBackgroundCells;
		layout._minimumScale = this._minimumScale;
		layout._blursBackgroundCells = this._blursBackgroundCells;
		layout._maximumBlur = this._maximumBlur;

		return layout;
	}

});

// @endtype

// @type BMCollectionViewTileLayoutOrientation

/**
 * An enum containing the possible orientations that the tile layout can use.
 */
var BMCollectionViewTileLayoutOrientation = Object.freeze({
	/**
	 * Indicates that the tile layout will arrange cells primarily along the horizontal axis.
	 * When the orientation is set to this value the tile layout will scroll horizontally and cells
	 * will be primarily placed into the leftmost available positions.
	 */
	Horizontal: {},

	/**
	 * Indicates that the tile layout will arrange cells primarily along the vertical axis.
	 * When the orientation is set to this value the tile layout will scroll vertically and cells
	 * will be primarily placed into the topmost available positions.
	 */
	Vertical: {}
});

// @endtype

// @type BMCollectionViewTileLayout extends BMCollectionViewLayout

/**
 * TBD.
 * 
 * Collection views using the tile layout must have a delegate object that conforms to the <code>BMCollectionViewDelegateTileLayout</code> protocol.
 */
var BMCollectionViewTileLayout = function () {}; // <constructor>

BMCollectionViewTileLayout.prototype = BMExtend({}, BMCollectionViewLayout.prototype, {

	// @override - BMCollectionViewLayout
	get supportsCopying() {
		return YES;
	},

	/**
	 * An optional number which represents the grid size to which all sizes will be constrained.
	 * If this property is set to a positive number, all size dimensions will be constrained to the closest number
	 * that is a multiple of this property.
	 */
	_gridSize: 0, // <Number>
	get gridSize() {
		return this._gridSize;
	},
	set gridSize(gridSize) {
		this._gridSize = gridSize || 0;
		this.invalidateLayout();
	},

	/**
	 * When set to a positive number, this represents the spacing to use between cells.
	 */
	_spacing: 0, // <Number>
	get spacing() {
		return this._spacing;
	},
	set spacing(spacing) {
		this._spacing = spacing || 0;
		this.invalidateLayout();
	},
	
	/**
	 * Determines whether or not the tile layout should generate header supplementary views or not.
	 */
	_showsHeaders: NO, // <Boolean>
	
	get showsHeaders() { return this._showsHeaders; },
	set showsHeaders(showsHeaders) {
		this._showsHeaders = showsHeaders;
		this.invalidateLayout();
	},
	
	/**
	 * The height to use for headers. Does not have any effect if showsHeaders is set to NO.
	 * This attribute is always 0 if showsHeader is set to NO.
	 */
	_headerHeight: 22, // <Number>
	
	get headerHeight() { 
		return this._showsHeaders ? this._headerHeight : 0; 
	},
	
	set headerHeight(headerHeight) {
		this._headerHeight = headerHeight;
		if (this._showsHeader) this.invalidateLayout();
	},
	
	/**
	 * Determines whether or not the tile layout should generate footer supplementary views or not.
	 */
	_showsFooters: NO, // <Boolean>
	
	get showsFooters() { return this._showsFooters; },
	set showsFooters(showsFooters) {
		this._showsFooters = showsFooters;
		this.invalidateLayout();
	},
	
	/**
	 * The height to use for footers. Does not have any effect if showsFooters is set to NO.
	 * This attribute is always 0 if showsFooters is set to NO.
	 */
	_footerHeight: 22, // <Number>
	
	get footerHeight() { 
		return this._showsFooters? this._footerHeight : 0; 
	},
	
	set footerHeight(footerHeight) {
		this._footerHeight = footerHeight;
		if (this._showsFooters) this.invalidateLayout();
	},
	
	/**
	 * The insets to apply to each section which control their distance from the collection view edges and from other sections.
	 */
	_sectionInsets: BMInsetMake(), // <BMInset, nullResettable>
	
	get sectionInsets() { return this._sectionInsets; },
	set sectionInsets(insets) {
		this._sectionInsets = insets || BMInsetMake();
		this.invalidateLayout();
	},
	
	/**
	 * The padding from the top edge to the first item.
	 */
	_topPadding: 0, // <Number>
	get topPadding() { return this._topPadding; },
	set topPadding(padding) {
		this._topPadding = padding;
		
		this.invalidateLayout();
	},
	
	/**
	 * The padding from the bottom edge to the last item.
	 */
	_bottomPadding: 0, // <Number>
	get bottomPadding() { return this._bottomPadding; },
	set bottomPadding(padding) {
		this._bottomPadding = padding;
		
		this.invalidateLayout();
	},
	
	/**
	 * When set to YES, the tile layout will stick the header supplementary views to the top edge of the collection view while scrolling.
	 * Otherwise, the header supplementary views will scroll with the rest of the content.
	 */
	_pinsHeadersToContentEdge: NO, // <Boolean>
	
	get pinsHeadersToContentEdge() { return this._pinsHeadersToContentEdge; },
	set pinsHeadersToContentEdge(pins) {
		this._pinsHeadersToContentEdge = pins;
		this.invalidateLayout();
	},
	
	/**
	 * When set to YES, the tile layout will stick the footer supplementary views to the bottom edge of the collection view while scrolling.
	 * Otherwise, the footer supplementary views will scroll with the rest of the content.
	 */
	_pinsFootersToContentEdge: NO, // <Boolean>
	
	get pinsFootersToContentEdge() { return this._pinsFootersToContentEdge; },
	set pinsFootersToContentEdge(pins) {
		this._pinsFootersToContentEdge = pins;
		this.invalidateLayout();
	},

	/**
	 * The tile layout's orientation.
	 * For more information about the possible values, refer to the
	 * documentation for the <code>BMCollectionViewTileLayoutOrientation</code> enum.
	 */
	_orientation: BMCollectionViewTileLayoutOrientation.Vertical, // <BMCollectionViewTileLayoutOrientation>
	get orientation() { return this._orientation; },
	set orientation(orientation) {
		this._orientation = orientation;
		this.invalidateLayout();
	},

	// @override - BMCollectionViewLayout
	copy() {
		let copy = new BMCollectionViewTileLayout();

		copy._gridSize = this._gridSize;
		copy._spacing = this._spacing;
		copy._showsHeaders = this._showsHeaders;
		copy._headerHeight = this._headerHeight;
		copy._showsFooters = this._showsFooters;
		copy._footerHeight = this._footerHeight;
		copy._sectionInsets = this._sectionInsets.copy();
		copy._topPadding = this._topPadding;
		copy._bottomPadding = this._bottomPadding;
		copy._pinsFootersToContentEdge = this._pinsFootersToContentEdge;
		copy._pinsHeadersToContentEdge = this._pinsHeadersToContentEdge;
		copy._orientation = this._orientation;

		return copy;
	},

	/**
	 * Set to YES while the collection view is performing a layout invalidation
	 * in response to a bounds change.
	 */
	_isChangingBounds: NO, // <Boolean>

	/**
	 * Returns a size that represents the given size, constrained to this layout's grid size and maximum available space.
	 * This does not modify the original size.
	 * @param size <BMSize>		A size.
	 * @return <BMSize>			The constrained size.
	 */
	constrainedSizeWithSize: function (size) {
		return BMSizeMake(
			Math.min(this.constrainedValueWithValue(size.width), this.collectionView.frame.size.width - this._sectionInsets.left - this._sectionInsets.right), 
			this.constrainedValueWithValue(size.height)
		);
	},
	
	/**
	 * Returns a value that represents the multiple of this layout's grid size that is closest to the given value.
	 * @param value <Number>		A value.
	 * @return <Number>				The constrained value.
	 */
	constrainedValueWithValue: function (value) {
		if (this._gridSize > 1) {
			var gridSize = this._gridSize;
			var spacing = this._spacing;
			var multiple = (value / (gridSize + spacing)) | 0;
			if (multiple == 0) multiple = 1;
			var constrainedValue = multiple * gridSize + (multiple - 1) * spacing;
			if (value - constrainedValue > constrainedValue + gridSize + spacing - value) {
				return constrainedValue + gridSize + spacing;
			}
			return constrainedValue;
		}
		return value;
	},
	
	// @override
	collectionViewWillStartUpdates: function (updates) {
		this.previousLayoutCache = this.layoutCache;
		this.prepareLayout();
	},
	
	// @override
	collectionViewDidStartUpdates: function (updates) {
		this.previousLayoutCache = undefined;
	},

	// @override - BMCollectionViewLayout
	prepareLayout: function () {
		return this._prepareLayoutWithScrollbarOffset(NO);
	},

	/**
	 * Prepares the layout, optionally taking the scrollbar size into account.
	 */
	_prepareLayoutWithScrollbarOffset: function (useOffset) {
		
		if (this._isChangingBounds) {
			// If the layout is invalidated because of scrolling, it is not required to recalculate the caches, so this request should be ignored.
			return;
		}

		var availableWidth = this.collectionView.frame.size.width - this._sectionInsets.left - this._sectionInsets.right;
		
		// TODO: headers, footers
		var layoutCache = {};
		var sectionCount = this.collectionView.numberOfSections();

		this.layoutCache = layoutCache;

		layoutCache.sections = new Array(sectionCount);
		layoutCache.size = BMSizeMake(this.collectionView.frame.size.width, 0);

		var top = this._topPadding;

		for (var i = 0; i < sectionCount; i++) {
			var sectionCache = {attributes: []};
			layoutCache.sections[i] = sectionCache;

			top += this._sectionInsets.top;

			sectionCache.outerFrame = BMRectMake(this._sectionInsets.left, top, availableWidth, 0);

			if (this._showsHeaders) {
				sectionCache.outerFrame.size.height += this._headerHeight + this._spacing;
				top += this._headerHeight + this._spacing;
				var headerAttributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(BMCollectionViewFlowLayoutSupplementaryView.Header, {atIndexPath: BMIndexPathMakeWithIndexes([i])});
				headerAttributes.frame = sectionCache.outerFrame.copy();
				headerAttributes.frame.size.height = this._headerHeight;
				sectionCache.headerAttributes = headerAttributes;
			}

			sectionCache.frame = BMRectMake(this._sectionInsets.left, top, availableWidth, 0);

			this._prepareLayoutForSection(i, {intoCache: sectionCache});
			sectionCache.outerFrame.size.height += sectionCache.frame.size.height;
			top = sectionCache.outerFrame.bottom;
			
			if (this._showsFooters) {
				var footerAttributes = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(BMCollectionViewFlowLayoutSupplementaryView.Footer, {atIndexPath: BMIndexPathMakeWithIndexes([i])});
				footerAttributes.frame = sectionCache.outerFrame.copy();
				footerAttributes.frame.size.height = this._footerHeight;
				footerAttributes.frame.origin.y = top + this._spacing;

				sectionCache.footerAttributes = footerAttributes;

				sectionCache.outerFrame.size.height += this._footerHeight + this._spacing;
				top += this._footerHeight + this._spacing;
			}

			sectionCache.outerFrame.size.height += this._sectionInsets.bottom;

			top = sectionCache.outerFrame.bottom;
		}

		layoutCache.size.height = top + this._bottomPadding;

	},

	/**
	 * Prepares the layout for a single section, optionally taking the scrollbar size into account.
	 * @param section <Number>								The index of the section for which to prepare the layout.
	 * {
	 * 	@param intoCache <Object>							The layout cache into which the layout will be prepared.
	 * }
	 */
	_prepareLayoutForSection: function (section, args) {
		var count = this.collectionView.numberOfObjectsInSectionAtIndex(section);
		var cache = args.intoCache;

		// Represents the bottommost extent of this section's content
		var bottom = cache.frame.origin.y;
		// Represents the rightmost extent of this section's content
		var right = cache.frame.origin.x;

		// The extents are the zones in which content may be placed
		// The extents start out with a single rect encompassing the entire available collection view area
		// This rect then gets split up into several rects as content is added into the collection view.
		var extents = [BMRectMakeWithX(cache.frame.origin.x, {y: cache.frame.origin.y, width: cache.frame.size.width, height: Number.MAX_SAFE_INTEGER})];

		for (var i = 0; i < count; i++) {
			if (this.DEBUG) debugger;
			var indexPath = this.collectionView.indexPathForObjectAtRow(i, {inSectionAtIndex: section});
			var size = this.collectionView.delegate.collectionViewSizeForCellAtIndexPath(this.collectionView, indexPath);
			size = this.constrainedSizeWithSize(size);

			// After obtaining the size for each element, enumerate the available extents, selecting the topmost one
			// If there are several extents with the same y origin, the leftmost one will be used
			var topLeftMostExtent = undefined;

			for (var j = 0; j < extents.length; j++) {
				var extent = extents[j];

				// Exclude extents that cannot accomodate the size of this cell
				// NOTE: because the extents have 'infinite' height/width and the sizes are always constrained
				// there will always be at least one extent that will fit this size
				if (extent.size.width < size.width || extent.size.height < size.height) {
					continue;
				}

				// Because the extents are always sorted so that the top-leftmost ones are the first,
				// finding the first extent is sufficient and the iteration can stop
				if (!topLeftMostExtent) {
					topLeftMostExtent = extent;
					break;
				}
			}

			// Once the extent has been found, create the attributes and slice up the extents intersecting the newly created frame
			var frame = BMRectMakeWithOrigin(BMPointMakeWithX(topLeftMostExtent.origin.x, {y: topLeftMostExtent.origin.y}), {size: size});

			var attributes = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(indexPath);
			attributes.frame = frame;

			cache.attributes.push(attributes);

			if (this.DEBUG) {
				var aDiv = document.createElement('div');
				BMCopyProperties(aDiv.style, {position: 'absolute', boxSizing: 'border-box', 
					top: frame.origin.y + 'px',
					left: frame.origin.x + 'px',
					width: frame.size.width + 'px',
					height: frame.size.height + 'px',
					boxShadow: '0px 0px 1px 1px blue'
				});
				((this.collectionView._contentWrapper && this.collectionView._contentWrapper[0]) || this.collectionView._container[0]).appendChild(aDiv);
			}

			// Adjust the section extents as needed
			if (bottom < frame.bottom) bottom = frame.bottom;
			if (right < frame.right) right = frame.right;

			if (this.DEBUG) debugger;

			// The trimming frame is the cell's frame, expanded in all dimensions by the spacing.
			// This rect is then used to trim all available extents
			var trimmingFrame = frame.rectWithInset(BMInset.insetWithEqualInsets(-this._spacing));

			// Slice up the extents that intersect this frame
			for (var j = 0; j < extents.length; j++) {
				var extent = extents[j];

				// For frames that are identical to their extents, or extents that are fully contained within the rect, remove the extents entirely
				if (extent.isEqualToRect(trimmingFrame) || trimmingFrame.containsRect(extent)) {
					extents.splice(j, 1);
					if (extent.div) extent.div.remove();
					j--;
					continue;
				}

				// For all others, slice the extents up
				if (trimmingFrame.intersectsContentOfRect(extent)) {
					var extentSlices = this.rectsWithDifferenceOfExtent(extent, {fromRect: trimmingFrame, spacing: this._spacing});

					// Remove the extent that was just sliced up
					extents.splice(j, 1);
					// In debugging-mode also remove the slice's outline
					if (extent.div) extent.div.remove();

					var currentExtentSliceIndex = 0;
					var currentExtentSlice = extentSlices[0];
					// Remove duplicate extents to prevent an exponentially growing list of possible extents
					// and add the extent slices to the appropriate positions
					if (currentExtentSlice) for (var k = j; k < extents.length; k++) {
						var currentExtent = extents[k];

						// Remove the slice if it is a duplicate of an already existing slice
						if (currentExtent.isEqualToRect(currentExtentSlice)) {
							currentExtentSliceIndex++;
							currentExtentSlice.isInvalid = YES;
							currentExtentSlice = extentSlices[currentExtentSliceIndex];
							if (!currentExtentSlice) break;
						}

						// When the current extent in the iteration is in a lower position than the
						// current sliced extent, insert the sliced extent in the place of the current iteration extent
						if (currentExtent.origin.y > currentExtentSlice.origin.y) {
							extents.splice(k, 0, currentExtentSlice);
							k++;

							currentExtentSliceIndex++;
							currentExtentSlice = extentSlices[currentExtentSliceIndex];
							if (!currentExtentSlice) break;
						}

						// If the current iteration extent is in the same top position as the current sliced extent
						// but its horizontal position is more towards the right than the sliced extent, insert the
						// sliced extent in place of the current iteration extent
						if (currentExtent.origin.y == currentExtentSlice.origin.y && currentExtent.origin.x > currentExtentSlice.origin.x) {
							extents.splice(k, 0, currentExtentSlice);
							k++;

							currentExtentSliceIndex++;
							currentExtentSlice = extentSlices[currentExtentSliceIndex];
							if (!currentExtentSlice) break;
						}
					}

					// Add the remaining extents to the end of the extents array, if there are still any extent slices after the iteration,
					// then they are lower and more to the right than any of the other extents
					if (currentExtentSlice) {
						for (; currentExtentSliceIndex < extentSlices.length; currentExtentSliceIndex++) {
							extents.push(extentSlices[currentExtentSliceIndex]);
						}
					}

					// Restart the iteration from the beginning
					j = -1;

					if (this.DEBUG) for (var k = 0; k < extentSlices.length; k++) {
						var div = document.createElement('div');
						var dExtent = extentSlices[k];
						if (dExtent.isInvalid) continue;
						BMCopyProperties(div.style, {position: 'absolute', boxSizing: 'border-box', 
							top: dExtent.origin.y + 'px',
							left: dExtent.origin.x + 'px',
							width: dExtent.size.width + 'px',
							height: dExtent.size.height + 'px',
							boxShadow: '0px 0px 1px 1px red'
						});
						dExtent.div = div;

						((this.collectionView._contentWrapper && this.collectionView._contentWrapper[0]) || this.collectionView._container[0]).appendChild(div);
					}
				}
			}

		}

		bottom += this._spacing + this._sectionInsets.bottom;

		var offset = (cache.frame.right - right) / 2 | 0;
		if (offset) {
			cache.attributes = cache.attributes.map(function (attribute) { attribute.frame.origin.x += offset; return attribute });
		}

		// Update the section's frame according to the extents
		cache.frame.size.width = right - cache.frame.origin.x;
		cache.frame.size.height = bottom - cache.frame.origin.y;

	},

	// @override - BMCollectionViewLayout
	attributesForElementsInRect: function (rect) {
	    
	    // When there are no sections in the collection view, this method will always return a single instance of attributes
	    // for the empty supplementary view
	    if (this.collectionView.numberOfSections() == 0) {
			var attribute = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
								BMCollectionViewTableLayoutSupplementaryView.Empty, 
								{atIndexPath: BMIndexPathMakeWithIndexes([0])}
							);
							
			attribute.frame = BMRectMake(0, 0, this.collectionView.frame.size.width, this.collectionView.frame.size.height);
			return [attribute];
		}
		

		var sectionCount = this.layoutCache.sections.length;

		var attributes = [];

		// foundSections is set to NO until the first section whose outer frame intersects the visible rect is found
		var foundSections = NO;
		var lastSection, lastFooterAttributes;

		var pinnedHeaderAttributes, lastCreatedFooterAttributes;

		for (var i = 0; i < sectionCount; i++) {
			var section = this.layoutCache.sections[i];

			if (rect.intersectsRect(section.outerFrame)) {

				var lastSection = section;

				var headerAttributes;
				// If the section's header frame intersects the visible rect, add it to the attributes array and retain a reference to it
				// This reference will be used later if the tile layout pins headers to content edges where its position will be adjusted to fit the content edges
				if (section.headerAttributes && rect.intersectsRect(section.headerAttributes.frame)) {
					attributes.push(headerAttributes = section.headerAttributes.copy());

					// If an incoming header intersects the pinned header attributes, displace pinned header so it doesn't cover the incoming header
					if (pinnedHeaderAttributes && headerAttributes.frame.intersectsRect(pinnedHeaderAttributes.frame)) {
						if (this.orientation == BMCollectionViewTileLayoutOrientation.Horizontal) {
							pinnedHeaderAttributes.frame.origin.x = headerAttributes.frame.origin.x - pinnedHeaderAttributes.frame.size.width;
						}
						if (this.orientation == BMCollectionViewTileLayoutOrientation.Vertical) {
							pinnedHeaderAttributes.frame.origin.y = headerAttributes.frame.origin.y - pinnedHeaderAttributes.frame.size.height;
						}
					}
				}

				if (!foundSections) {
					foundSections = YES;
					if (this.pinsHeadersToContentEdge && section.headerAttributes) {
						// If the header attributes did not intersect the visible rect, add them to the attributes array now
						if (!headerAttributes) {
							attributes.push(headerAttributes = section.headerAttributes.copy());
						}

						pinnedHeaderAttributes = headerAttributes;
						pinnedHeaderAttributes.style.zIndex = 1;

						// Adjust the position so it appears at the edge of the collection view
						headerAttributes.frame.origin.y = Math.max(this.collectionView.scrollOffset.y, headerAttributes.frame.origin.y);
						headerAttributes.frame.origin.x = Math.max(this.collectionView.scrollOffset.x, headerAttributes.frame.origin.x);
					}
				}

				var attributesLength = section.attributes.length;
				for (var j = 0; j < attributesLength; j++) {
					if (rect.intersectsRect(section.attributes[j].frame)) {
						attributes.push(section.attributes[j]);
					}
				}
				
				if (section.footerAttributes && rect.intersectsRect(section.footerAttributes.frame)) {
					attributes.push(lastFooterAttributes = section.footerAttributes.copy());
					lastCreatedFooterAttributes = lastFooterAttributes;
				}
				else {
					// If this section's footer attributes do not intersect the visible rect, reset the
					// lastFooterAttributes reference so that tile layout will know to add the footer attributes for this section if it is the last one
					lastFooterAttributes = undefined;
				}

			}
			else if (foundSections) {
				// Break after sections no longer intersect the visible rect because sections are ordered by position in the cache
				break;
			}
		}

		if (lastSection && this.pinsFootersToContentEdge && lastSection.footerAttributes) {
			// If the footer attributes did not intersect the visible rect, add them to the attributes array now
			if (!lastFooterAttributes) {
				attributes.push(lastFooterAttributes = lastSection.footerAttributes.copy());
			}

			lastFooterAttributes.style.zIndex = 1;

			// Adjust the position so it appears at the edge of the collection view
			lastFooterAttributes.frame.origin.y = Math.min(this.collectionView.scrollOffset.y + this.collectionView.frame.size.height - lastFooterAttributes.frame.size.height, lastFooterAttributes.frame.origin.y);
			lastFooterAttributes.frame.origin.x = Math.min(this.collectionView.scrollOffset.x + this.collectionView.frame.size.width - lastFooterAttributes.frame.size.width, lastFooterAttributes.frame.origin.x);

			// If an outgoing footer intersects the pinned footer's frame, adjust the pinned footer's position so it appears below the outgoing footer
			if (lastCreatedFooterAttributes && lastFooterAttributes.frame.intersectsRect(lastCreatedFooterAttributes.frame)) {
				if (this.orientation == BMCollectionViewTileLayoutOrientation.Horizontal) {
					lastFooterAttributes.frame.origin.x = lastCreatedFooterAttributes.frame.origin.x - lastFooterAttributes.frame.size.width;
				}
				if (this.orientation == BMCollectionViewTileLayoutOrientation.Vertical) {
					lastFooterAttributes.frame.origin.y = lastCreatedFooterAttributes.frame.origin.y - lastFooterAttributes.frame.size.height;
				}
			}
		}

		return attributes;
	},

	// @override - BMCollectionViewLayout
	shouldInvalidateLayoutForBoundsChange: function () {
		var shouldInvalidate = this._pinsHeadersToContentEdge || this._pinsFootersToContentEdge;
		if (shouldInvalidate) {
			this._isChangingBounds = YES;
		}
		return shouldInvalidate;
	},

	// @override - BMCollectionViewLayout
	didInvalidateLayoutForBoundsChange: function () {
		this._isChangingBounds = NO;
	},

	// @override - BMCollectionViewLayout
	attributesForCellAtIndexPath: function (indexPath) {
		return this.cachedAttributesForCellAtIndexPath(indexPath, {withCache: this.layoutCache});
	},

	cachedAttributesForCellAtIndexPath: function (indexPath, args) {
		return args.withCache.sections[indexPath.section].attributes[indexPath.row];
	},

	initialAttributesForMovingCellFromIndexPath: function (indexPath) {
		return this.cachedAttributesForCellAtIndexPath(indexPath, {withCache: this.previousLayoutCache});
	},

	// @override - BMCollectionViewLayout
	attributesForSupplementaryViewWithIdentifier: function (identifier, args) {
		
		// The empty supplementary view will always ever have one instance with a preset index path
		if (identifier === BMCollectionViewTableLayoutSupplementaryView.Empty) {
			var attribute = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
								BMCollectionViewTableLayoutSupplementaryView.Empty, 
								{atIndexPath: BMIndexPathMakeWithIndexes([0])}
							);
							
			attribute.frame = BMRectMake(0, 0, this.collectionView.frame.size.width, this.collectionView.frame.size.height);
			return attribute;
		}

		var indexPath = args.atIndexPath;
		if (identifier == BMCollectionViewFlowLayoutSupplementaryView.Footer) {
			return this.layoutCache.sections[indexPath.section].footerAttributes;
		}
		else if (identifier == BMCollectionViewFlowLayoutSupplementaryView.Header) {
			return this.layoutCache.sections[indexPath.section].headerAttributes;
		}
	},

	// @override - BMCollectionViewLayout
	contentSize: function () {
		let size = this.layoutCache.size;

		size.height = Math.max(size.height, this.collectionView.frame.size.height);

		return size;
	},

	initialAttributesForPresentedCellAtIndexPath: function (indexPath, args) {
		var attributes = args.withTargetAttributes.copy();

		var frame = attributes.frame;

		var slope = this.collectionView.bounds.center.slopeAngleToPoint(frame.center);
		var distance = this.collectionView.bounds.center.distanceToPoint(frame.center);

		frame.offset(distance * 4 * Math.cos(slope), distance * 4 * Math.sin(slope));
		attributes.style.scaleX = 2;
		attributes.style.scaleY = 2;
		attributes.style.opacity = 0;

		return attributes;
	},
	
	// @override - BMCollectionViewLayout
	supplementaryViewsToInsert: function () {
		var count = this.collectionView.numberOfSections();
		var oldCount;
		var self = this;
		
		this.collectionView.usingOldDataSet(function () {
			oldCount = self.collectionView.numberOfSections();
		});
		
		var views = [];
		
		for (var i = oldCount; i < count; i++) {
			if (this.showsHeaders) {
				views.push(BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
										BMCollectionViewFlowLayoutSupplementaryView.Header, 
										{atIndexPath: BMIndexPathMakeWithIndexes([i])}
									));
			}
			
			if (this.showsFooters) {
				views.push(BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
										BMCollectionViewFlowLayoutSupplementaryView.Footer, 
										{atIndexPath: BMIndexPathMakeWithIndexes([i])}
									));
			}
		}
		
		if (oldCount > 0 && count == 0) {
			views.push(BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
									BMCollectionViewTableLayoutSupplementaryView.Empty, 
									{atIndexPath: BMIndexPathMakeWithIndexes([0])}
								));
		}
		
		return views;
	},

	// @override - BMCollectionViewLayout
	supplementaryViewsToDelete: function () {
		var count = this.collectionView.numberOfSections();
		var oldCount;
		var self = this;
		
		this.collectionView.usingOldDataSet(function () {
			oldCount = self.collectionView.numberOfSections();
		});
		
		var views = [];
		
		for (var i = count; i < oldCount; i++) {
			if (this.showsHeaders) {
				views.push(BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
										BMCollectionViewFlowLayoutSupplementaryView.Header, 
										{atIndexPath: BMIndexPathMakeWithIndexes([i])}
									));
			}
			
			if (this.showsFooters) {
				views.push(BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
										BMCollectionViewFlowLayoutSupplementaryView.Footer, 
										{atIndexPath: BMIndexPathMakeWithIndexes([i])}
									));
			}
		}
		
		if (oldCount == 0 && count > 0) {
			views.push(BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(
									BMCollectionViewTableLayoutSupplementaryView.Empty, 
									{atIndexPath: BMIndexPathMakeWithIndexes([0])}
								));
		}
		
		return views;
	},

	/**
	 * Returns the extent resulting by trimming the entire left side of the given extent
	 * by the given rect.
	 * The given rect must intersect the extent from the top, left or bottom, otherwise the resulting
	 * extent will not be valid.
	 * @param extent <BMRect>					The extent to trim.
	 * {
	 * 	@param withIntersectingRect <BMRect>	The rect intersecting the extent.
	 * }
	 * @return <BMRect>							The resulting extent.
	 */
	rightExtentByTrimmingLeftSideOfExtent: function (extent, args) {
		var rect = args.withIntersectingRect;

		// The right trim of the extent will start at the rect's right side,
		// run up to the extent's right edge and retain its vertical size and position
		return BMRectMakeWithX(rect.right, {y: extent.origin.y, width: extent.right - rect.right, height: extent.height});
	},
	
	/**
	 * Returns the extent resulting by trimming the entire right side of the given extent
	 * by the given rect.
	 * The given rect must intersect the extent from the top, right or bottom, otherwise the resulting
	 * extent will not be valid.
	 * @param extent <BMRect>					The extent to trim.
	 * {
	 * 	@param withIntersectingRect <BMRect>	The rect intersecting the extent.
	 * }
	 * @return <BMRect>							The resulting extent.
	 */
	leftExtentByTrimmingRightSideOfExtent: function (extent, args) {
		var rect = args.withIntersectingRect;

		// The left trim of the extent will start at the extent's left side,
		// run up to the extent's left edge and retain its vertical size and position
		return BMRectMakeWithX(extent.origin.x, {y: extent.origin.y, width: rect.origin.x - extent.origin.x, height: extent.height});
	},
	
	/**
	 * Returns the extent resulting by trimming the entire bottom side of the given extent
	 * by the given rect.
	 * The given rect must intersect the extent from the top, right or left, otherwise the resulting
	 * extent will not be valid.
	 * @param extent <BMRect>					The extent to trim.
	 * {
	 * 	@param withIntersectingRect <BMRect>	The rect intersecting the extent.
	 * }
	 * @return <BMRect>							The resulting extent.
	 */
	topExtentByTrimmingBottomSideOfExtent: function (extent, args) {
		var rect = args.withIntersectingRect;

		// The top trim of the extent will start at the extent's top edge,
		// run up to the rect's top edge and retain its horizontal size and position
		return BMRectMakeWithX(extent.origin.x, {y: extent.origin.y, width: extent.size.width, height: rect.origin.y - extent.origin.y});
	},
	
	/**
	 * Returns the extent resulting by trimming the entire top side of the given extent
	 * by the given rect.
	 * The given rect must intersect the extent from the bottom, right or left, otherwise the resulting
	 * extent will not be valid.
	 * @param extent <BMRect>					The extent to trim.
	 * {
	 * 	@param withIntersectingRect <BMRect>	The rect intersecting the extent.
	 * }
	 * @return <BMRect>							The resulting extent.
	 */
	bottomExtentByTrimmingTopSideOfExtent: function (extent, args) {
		var rect = args.withIntersectingRect;

		// The top trim of the extent will start at the extent's top edge,
		// run up to the rect's top edge and retain its horizontal size and position
		return BMRectMakeWithX(extent.origin.x, {y: rect.bottom, width: extent.size.width, height: extent.bottom - rect.bottom});
	},

	/**
	 * Returns an array of extent rects that represent the possible extents created after the given rect is placed within an extent.
	 * This will slice up the given extent and return the remaining extents. These extents will contain intersecting regions.
	 * The given rect must intersect the extent from the top, otherwise this function's result will not be well-defined.
	 * @param extent <BMRect>				The extent intersected by the rect.
	 * {
	 * 	@param fromRect <BMRect>			The rect interescting the extent.
	 * 	@param spacing <Number, nullable>	Defaults to 0. Additional spacing to maintain between the rect and the extents.
	 * }
	 * @return <[BMRect]>					The resulting extents.
	 */
	rectsWithDifferenceOfExtent: function (extent, args) {
		var spacing = args.spacing || 0;
		var gridSize = this._gridSize;
		
		var rect = args.fromRect;

		// The are several cases handled by this method
		// In all cases, it is assumed that the rect lies partially on the left, top, bottom or right edge of the extent
		// or any combination of at most three edges

		// Up to three extents will be generated in each case by trimming the base extent with the given rect
		// If the rect intersects more than one edge of the extent, some of the resulting trimmed
		// extents will be invalid, in which case they will not be included in the result

		// Additionally, the resulting extents will be ordered so that the topmost and leftmost extents appear before other extents

		// The case where the rect intersects the top edge of the extent
		if (rect.bottom >= extent.origin.y && rect.top <= extent.origin.y) {
			var resultingExtents = [];

			var leftExtent = this.leftExtentByTrimmingRightSideOfExtent(extent, {withIntersectingRect: rect});
			(leftExtent.width >= gridSize) && resultingExtents.push(leftExtent);

			var rightExtent = this.rightExtentByTrimmingLeftSideOfExtent(extent, {withIntersectingRect: rect});
			(rightExtent.width >= gridSize) && resultingExtents.push(rightExtent);
			
			var bottomExtent = this.bottomExtentByTrimmingTopSideOfExtent(extent, {withIntersectingRect: rect});
			(bottomExtent.height >= gridSize) && resultingExtents.push(bottomExtent);
	
			return resultingExtents;
		}
		
		// The final case where the rect intersects the left edge of the extent
		if (rect.right >= extent.origin.x && rect.origin.x <= extent.origin.x) {
			var resultingExtents = [];

			var topExtent = this.topExtentByTrimmingBottomSideOfExtent(extent, {withIntersectingRect: rect});
			(topExtent.height >= gridSize) && resultingExtents.push(topExtent);

			var rightExtent = this.rightExtentByTrimmingLeftSideOfExtent(extent, {withIntersectingRect: rect});
			(rightExtent.width >= gridSize) && resultingExtents.push(rightExtent);
			
			var bottomExtent = this.bottomExtentByTrimmingTopSideOfExtent(extent, {withIntersectingRect: rect});
			(bottomExtent.height >= gridSize) && resultingExtents.push(bottomExtent);
	
			return resultingExtents;
		}
		
		// The final case where the rect intersects the right edge of the extent
		if (rect.origin.x <= extent.right && rect.right >= extent.right) {
			var resultingExtents = [];

			var topExtent = this.topExtentByTrimmingBottomSideOfExtent(extent, {withIntersectingRect: rect});
			(topExtent.height >= gridSize) && resultingExtents.push(topExtent);

			var leftExtent = this.leftExtentByTrimmingRightSideOfExtent(extent, {withIntersectingRect: rect});
			(leftExtent.width >= gridSize) && resultingExtents.push(leftExtent);
			
			var bottomExtent = this.bottomExtentByTrimmingTopSideOfExtent(extent, {withIntersectingRect: rect});
			(bottomExtent.height >= gridSize) && resultingExtents.push(bottomExtent);
	
			return resultingExtents;
		}
		
		// The case where the rect intersects the bottom edge of the extent
		if (rect.origin.y <= extent.bottom && rect.bottom >= extent.bottom) {
			var resultingExtents = [];

			var leftExtent = this.leftExtentByTrimmingRightSideOfExtent(extent, {withIntersectingRect: rect});
			(leftExtent.width >= gridSize) && resultingExtents.push(leftExtent);
			
			var topExtent = this.topExtentByTrimmingBottomSideOfExtent(extent, {withIntersectingRect: rect});
			(bottomExtent.height >= gridSize) && resultingExtents.push(bottomExtent);

			var rightExtent = this.rightExtentByTrimmingLeftSideOfExtent(extent, {withIntersectingRect: rect});
			(rightExtent.width >= gridSize) && resultingExtents.push(rightExtent);
	
			return resultingExtents;
		}

		// Code below this point is deprecated
		// Control shouldn't reach this point
		debugger;

		// First case is when the rect intersects the top-left corner of the extent
		if (rect.intersectsPoint(extent.origin)) {
			var resultingExtents = [];

			// In this case there are two extents
			// The first one runs alongside the rect's right edge
			var rightExtent = BMRectMakeWithX(rect.right, {y: extent.origin.y, width: extent.right - rect.right, height: extent.height});
			// This extent will have negative or zero width if the rect is as wide or wider than the extent, in that case it will be discarded
			(rightExtent.width >= gridSize) && resultingExtents.push(rightExtent);

			// The second one runs below the rect's bottom edge
			var bottomExtent = BMRectMakeWithX(extent.origin.x, {y: rect.bottom, width: extent.width, height: extent.bottom - rect.bottom});
			// This extent will have negative or zero height if the rect is as tall or taller than the extent, in that case it will be discarded
			(bottomExtent.height >= gridSize) && resultingExtents.push(bottomExtent);

			return resultingExtents;
		}
		else {
			// The other cases handle intersection with a single edge and none of the corners
			// Rarely, however, in certain configurations it is possible that the rect will intersect the top-right edge of the extent
			if (rect.intersectsPoint({x: extent.right, y: extent.origin.y})) {
				// This case is similar to the first one, except that the first extent will run alongside the rect's left edge instead of the right
				var resultingExtents = [];
			
				// In this case there are two extents
				// The first one runs alongside the rect's left edge
				var leftExtent = BMRectMakeWithX(extent.origin.x, {y: extent.origin.y, width: rect.origin.x - extent.origin.x, height: extent.height});
				// This extent will have negative or zero width if the rect is as wide or wider than the extent, in that case it will be discarded
				(leftExtent.width >= gridSize) && resultingExtents.push(leftExtent);
		
				// The second one runs below the rect's bottom edge
				var bottomExtent = BMRectMakeWithX(extent.origin.x, {y: rect.bottom, width: extent.width, height: extent.bottom - rect.bottom});
				// This extent will have negative or zero height if the rect is as tall or taller than the extent, in that case it will be discarded
				(bottomExtent.height >= gridSize) && resultingExtents.push(bottomExtent);
		
				return resultingExtents;
			}

			if (rect.intersectsPoint({x: extent.left, y: extent.bottom})) {
				// This case is similar to the first one, except that the first extent will run alongside the rect's left edge instead of the right
				var resultingExtents = [];
				
				// The first one will run above the rect's top edge
				var topExtent = BMRectMakeWithX(extent.origin.x, {y: extent.origin.y, width: extent.size.width, height: rect.origin.y - extent.origin.y});
				// This extent will have negative or zero height if the rect is as tall or taller than the extent, in that case it will be discarded
				(topExtent.height >= gridSize) && resultingExtents.push(topExtent);
				
				// In this case there are two extents
				// The first one runs alongside the rect's right edge
				var rightExtent = BMRectMakeWithX(rect.right, {y: extent.origin.y, width: extent.right - rect.right, height: extent.height});
				// This extent will have negative or zero width if the rect is as wide or wider than the extent, in that case it will be discarded
				(rightExtent.width >= gridSize) && resultingExtents.push(rightExtent);
		
				return resultingExtents;
			}

			if (rect.intersectsPoint({x: extent.right, y: extent.bottom})) {
				// This case is similar to the first one, except that the first extent will run alongside the rect's left edge instead of the right
				var resultingExtents = [];
				
				// The first one will run above the rect's top edge
				var topExtent = BMRectMakeWithX(extent.origin.x, {y: extent.origin.y, width: extent.size.width, height: rect.origin.y - extent.origin.y});
				// This extent will have negative or zero height if the rect is as tall or taller than the extent, in that case it will be discarded
				(topExtent.height >= gridSize) && resultingExtents.push(topExtent);
			
				// In this case there are two extents
				// The first one runs alongside the rect's left edge
				var leftExtent = BMRectMakeWithX(extent.origin.x, {y: extent.origin.y, width: rect.origin.x - extent.origin.x, height: extent.height});
				// This extent will have negative or zero width if the rect is as wide or wider than the extent, in that case it will be discarded
				(leftExtent.width >= gridSize) && resultingExtents.push(leftExtent);
		
				return resultingExtents;
			}

			// The case where the rect intersects the top edge of the extent
			if (rect.bottom >= extent.origin.y && rect.top <= extent.origin.y) {
				// Three extents will be generated in this case
				var resultingExtents = [];

				// The first one will run up to the rect's left edge
				var leftExtent = BMRectMakeWithX(extent.origin.x, {y: extent.origin.y, width: rect.origin.x - extent.origin.x, height: extent.height});
				// This extent will have negative or zero width if the rect is as wide or wider than the extent, in that case it will be discarded
				(leftExtent.width >= gridSize) && resultingExtents.push(leftExtent);

				// The second one will start at the rect's right edge
				var rightExtent = BMRectMakeWithX(rect.right, {y: extent.origin.y, width: extent.right - rect.right, height: extent.height});
				// This extent will have negative or zero width if the rect is as wide or wider than the extent, in that case it will be discarded
				(rightExtent.width >= gridSize) && resultingExtents.push(rightExtent);
				
				// The last one runs below the rect's bottom edge
				var bottomExtent = BMRectMakeWithX(extent.origin.x, {y: rect.bottom, width: extent.width, height: extent.bottom - rect.bottom});
				// This extent will have negative or zero height if the rect is as tall or taller than the extent, in that case it will be discarded
				(bottomExtent.height >= gridSize) && resultingExtents.push(bottomExtent);
		
				return resultingExtents;
			}
			
			// The final case where the rect intersects the left edge of the extent
			if (rect.right >= extent.origin.x && rect.origin.x <= extent.origin.x) {
				// Three extents will be generated in this case
				var resultingExtents = [];

				// The first one will run above the rect's top edge
				var topExtent = BMRectMakeWithX(extent.origin.x, {y: extent.origin.y, width: extent.size.width, height: rect.origin.y - extent.origin.y});
				// This extent will have negative or zero height if the rect is as tall or taller than the extent, in that case it will be discarded
				(topExtent.height >= gridSize) && resultingExtents.push(topExtent);

				// The second one will start at the rect's right edge
				var rightExtent = BMRectMakeWithX(rect.right, {y: extent.origin.y, width: extent.right - rect.right, height: extent.height});
				// This extent will have negative or zero width if the rect is as wide or wider than the extent, in that case it will be discarded
				(rightExtent.width >= gridSize) && resultingExtents.push(rightExtent);
				
				// The last one runs below the rect's bottom edge
				var bottomExtent = BMRectMakeWithX(extent.origin.x, {y: rect.bottom, width: extent.width, height: extent.bottom - rect.bottom});
				// This extent will have negative or zero height if the rect is as tall or taller than the extent, in that case it will be discarded
				(bottomExtent.height >= gridSize) && resultingExtents.push(bottomExtent);
		
				return resultingExtents;
			}
			
			// The final case where the rect intersects the right edge of the extent
			if (rect.origin.x <= extent.right && rect.right >= extent.right) {
				// Three extents will be generated in this case
				var resultingExtents = [];

				// The first one will run above the rect's top edge
				var topExtent = BMRectMakeWithX(extent.origin.x, {y: extent.origin.y, width: extent.size.width, height: rect.origin.y - extent.origin.y});
				// This extent will have negative or zero height if the rect is as tall or taller than the extent, in that case it will be discarded
				(topExtent.height >= gridSize) && resultingExtents.push(topExtent);

				// The second one will start at the rect's left edge
				var leftExtent = BMRectMakeWithX(extent.right, {y: extent.origin.y, width: rect.right - extent.right, height: extent.height});
				// This extent will have negative or zero width if the rect is as wide or wider than the extent, in that case it will be discarded
				(leftExtent.width >= gridSize) && resultingExtents.push(leftExtent);
				
				// The last one runs below the rect's bottom edge
				var bottomExtent = BMRectMakeWithX(extent.origin.x, {y: rect.bottom, width: extent.width, height: extent.bottom - rect.bottom});
				// This extent will have negative or zero height if the rect is as tall or taller than the extent, in that case it will be discarded
				(bottomExtent.height >= gridSize) && resultingExtents.push(bottomExtent);
		
				return resultingExtents;
			}
		}

		// Control shouldn't reach this point
		debugger;
	}

});



// @endtype
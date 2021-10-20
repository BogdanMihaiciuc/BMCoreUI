// @ts-check

import {YES, NO, BMExtend, BMNumberByInterpolatingNumbersWithFraction} from '../Core/BMCoreUI'
import {BMSizeMake} from '../Core/BMSize'
import {BMRectMake} from '../Core/BMRect'

// @type BMCollectionViewLayout

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
export function BMCollectionViewLayout() { // <constructor>
	
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


	/************************************* CELL HIGHLIGHTING ********************************/

	/**
	 * Invoked by the collection view to obtain the first index path in the layout.
	 * The default implementation returns the first index path in the data set.
	 * @returns <BMIndexPath, nullable>		The first index path, or `undefined` if no index path exists.
	 */
	firstIndexPath() {
		const sectionCount = this.collectionView.numberOfSections();

		for (let i = 0; i < sectionCount; i++) {
			const rowCount = this.collectionView.numberOfObjectsInSectionAtIndex(i);

			if (rowCount) return this.collectionView.indexPathForObjectAtRow(0, {inSectionAtIndex: i});
		}
	},

	/**
	 * Invoked by the collection to obtain the index path that is visually to the left of the given index path.
	 * 
	 * Subclasses may override this method to return an appropriate index path.
	 * If the given index path is at the left edge of the content area, the same index path should be returned.
	 * 
	 * The default implementation returns the previous index path in the data set.
	 * @param indexPath <BMIndexPath>		The starting index path.
	 * @returns <BMIndexPath>				The index path to the left of the starting index path.
	 */
	indexPathToTheLeftOfIndexPath(indexPath) {
		if (indexPath.row > 0) {
			return this.collectionView.indexPathForObjectAtRow(indexPath.row - 1, {inSectionAtIndex: indexPath.section});
		}

		if (indexPath.section > 0) {
			let previousSection = indexPath.section - 1;
			do {
				const rowCount = this.collectionView.numberOfObjectsInSectionAtIndex(previousSection);
				if (rowCount) {
					return this.collectionView.indexPathForObjectAtRow(rowCount - 1, {inSectionAtIndex: previousSection});
				}
				else {
					previousSection = previousSection - 1;
				}
			} while (previousSection >= 0);
		}

		return indexPath;
	},

	/**
	 * Invoked by the collection to obtain the index path that is visually on top of the given index path.
	 * 
	 * Subclasses may override this method to return an appropriate index path.
	 * If the given index path is at the top edge of the content area, the same index path should be returned.
	 * 
	 * The default implementation returns the result of calling `indexPathToTheLeftOfIndexPath`.
	 * @param indexPath <BMIndexPath>		The starting index path.
	 * @returns <BMIndexPath>				The index path above the starting index path.
	 */
	indexPathAboveIndexPath(indexPath) {
		return this.indexPathToTheLeftOfIndexPath(indexPath);
	},

	/**
	 * Invoked by the collection to obtain the index path that is visually to the right of the given index path.
	 * 
	 * Subclasses may override this method to return an appropriate index path.
	 * If the given index path is at the right edge of the content area, the same index path should be returned.
	 * 
	 * The default implementation returns the next index path in the data set.
	 * @param indexPath <BMIndexPath>		The starting index path.
	 * @returns <BMIndexPath>				The index path to the right of the starting index path.
	 */
	indexPathToTheRightOfIndexPath(indexPath) {
		const rowCount = this.collectionView.numberOfObjectsInSectionAtIndex(indexPath.section);
		if (indexPath.row < rowCount - 1) {
			return this.collectionView.indexPathForObjectAtRow(indexPath.row + 1, {inSectionAtIndex: indexPath.section});
		}

		const sectionCount = this.collectionView.numberOfSections();
		if (indexPath.section < sectionCount - 1) {
			let nextSection = indexPath.section + 1;
			do {
				const rowCount = this.collectionView.numberOfObjectsInSectionAtIndex(nextSection);
				if (rowCount) {
					return this.collectionView.indexPathForObjectAtRow(0, {inSectionAtIndex: nextSection});
				}
				else {
					nextSection = nextSection + 1;
				}
			} while (nextSection < sectionCount);
		}

		return indexPath;
	},

	/**
	 * Invoked by the collection view to obtain the index path that is visually below the given index path.
	 * 
	 * Subclasses may override this method to return an appropriate index path.
	 * If the given index path is at the bottom edge of the content area, the same index path should be returned.
	 * 
	 * The default implementation returns the result of calling `indexPathToTheRightOfIndexPath`.
	 * @param indexPath <BMIndexPath>		The starting index path.
	 * @returns <BMIndexPath>				The index path below the starting index path.
	 */
	indexPathBelowIndexPath(indexPath) {
		return this.indexPathToTheRightOfIndexPath(indexPath);
	},

	/**
	 * Invoked by the collection view to obtain a list of index paths that are visually between
	 * the two given index paths.
	 * 
	 * The default implementation returns a list containing the index paths from the data set that
	 * start at the given index path, stopping at the target index path.
	 * 
	 * The starting and ending index paths should be included in the result.
	 * @param indexPath <BMIndexPath>		The starting index path.
	 * {
	 * 	@param toIndexPath <BMIndexPath>	The ending index path.
	 * }
	 * @return <[BMIndexPath]>				An array of index paths.
	 */
	indexPathsFromIndexPath(indexPath, {toIndexPath}) {
		const indexPaths = [];

		// Swap the index paths if the target index path is before the source index path
		if (toIndexPath.section < indexPath.section) {
			const swapIndexPath = toIndexPath;
			toIndexPath = indexPath;
			indexPath = swapIndexPath;
		}
		else if (indexPath.section == toIndexPath.section && toIndexPath.row < indexPath.row) {
			const swapIndexPath = toIndexPath;
			toIndexPath = indexPath;
			indexPath = swapIndexPath;
		}

		let i = indexPath.row;
		const targetSection = toIndexPath.section;

		for (let j = indexPath.section; j < targetSection; j++) {
			const rowCount = this.collectionView.numberOfRowsInSectionAtIndex(j);
			for (; i < rowCount; i++) {
				indexPaths.push(this.collectionView.indexPathForObjectAtRow(i, {inSectionAtIndex: j}));
			}

			i = 0;
		}

		return indexPaths;
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
     * @param frame <BMRect>        			The new frame.
	 * {
	 *  @param fromFrame <BMRect, nullable>		The previous frame, if one existed.
	 * }
     * @return <Boolean>            			True if the new frame requires a new layout, false otherwise.
     */
    shouldInvalidateLayoutForFrameChange: function (frame, args) {
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
export var _BMCollectionViewTransitionLayout = function (attributes, initialSize, targetSize, targetLayout) { // <constructor>
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

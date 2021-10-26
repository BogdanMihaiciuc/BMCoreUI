// @ts-check

import {YES, NO, BMExtend} from '../Core/BMCoreUI'
import {BMSizeMake} from '../Core/BMSize'
import {BMRectMake} from '../Core/BMRect'
import {BMCollectionViewLayoutAttributesMakeForCellAtIndexPath, BMCollectionViewLayoutAttributesType} from './BMCollectionViewLayoutAttributes'
import {BMCollectionViewLayout} from './BMCollectionViewLayout'

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
export function BMCollectionViewMasonryLayout() {}; // <constructor>

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
	 * @param indexPath <BMIndexPath>							The cell's index path.
	 * {
	 *	@param usingCache <Object, nullable>					Defaults to this layout's current cache. The cache object to use.
	 * }
	 * @return <BMCollectionViewLayoutAttributes, nullable>		The layout attributes if the index path exists in the data set, `undefined` otherwise.
	 */
	cachedAttributesForCellAtIndexPath: function (indexPath, options) {
		return this._extendedCachedAttributesForCellAtIndexPath(indexPath, options).attribute;
	},
	
	/**
	 * Retrieves the cached attributes for the cell at the given index path and information about
	 * the column it is on.
	 * @param indexPath <BMIndexPath>			The cell's index path.
	 * {
	 *	@param usingCache <Object, nullable>	Defaults to this layout's current cache. The cache object to use.
	 * }
	 * @return <Object, nullable>				An object that describes the requested attributes and its position in the layout.
	 */
	_extendedCachedAttributesForCellAtIndexPath: function(indexPath, args) {
		var offset = this.collectionView.scrollOffset;
		
		var cache = (args && args.usingCache) || this.cachedLayout;
		
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
					
					return {
						attribute,
						columnIndex: i,
						rowIndex: attributeIndex
					};
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

	/************************************* CELL HIGHLIGHTING ********************************/

	// @override - BMCollectionViewLayout
	indexPathToTheLeftOfIndexPath(indexPath) {
		// Create a rect starting at the left edge of the given index path and request attributes in it
		const extendedAttributes = this._extendedCachedAttributesForCellAtIndexPath(indexPath);

		if (extendedAttributes.columnIndex == 0) return indexPath;

		const startingAttributes = extendedAttributes.attribute;
		const center = startingAttributes.frame.center.y;
		
		const offset = this.collectionView.scrollOffset;
		
		const cache = this.cachedLayout;
		
		// Find the attributes in previous column with the smallest vertical distance from the starting attributes
		const column = cache.columns[extendedAttributes.columnIndex - 1];

		// The speedTop is the unscaled top position at which to start retrieving cells.
		var speedTop = offset.y * column.speed;
		
		// The speedAdjustment is the amount by which to displace each attribute's Y origin.
		var speedAdjustment = offset.y - speedTop;

		let minIndex = -1;
		let minDistance = Number.MAX_SAFE_INTEGER;
		for (let i = 0; i < column.attributes.length; i++) {
			const attribute = column.attributes[i];
			const position = attribute.frame.center.y + speedAdjustment | 0;

			const distance = Math.abs(position - center);
			if (distance < minDistance) {
				minIndex = i;
				minDistance = distance;
			}
		}

		if (minIndex != -1) {
			return column.attributes[minIndex].indexPath;
		}

		return indexPath;
	},

	// @override - BMCollectionViewLayout
	indexPathAboveIndexPath(indexPath) {
		// Return the row above the given index path in the same column
		const extendedAttributes = this._extendedCachedAttributesForCellAtIndexPath(indexPath);

		if (extendedAttributes.rowIndex > 0) {
			return this.cachedLayout.columns[extendedAttributes.columnIndex].attributes[extendedAttributes.rowIndex - 1].indexPath;
		}

		return indexPath;
	},
	
	// @override - BMCollectionViewLayout
	indexPathToTheRightOfIndexPath(indexPath) {
		// Create a rect starting at the left edge of the given index path and request attributes in it
		const extendedAttributes = this._extendedCachedAttributesForCellAtIndexPath(indexPath);
		
		const cache = this.cachedLayout;

		if (extendedAttributes.columnIndex >= this.cachedLayout.columns.length - 1) return indexPath;

		const startingAttributes = extendedAttributes.attribute;
		const center = startingAttributes.frame.center.y;
		
		const offset = this.collectionView.scrollOffset;
		
		// Find the attributes in next column with the smallest vertical distance from the starting attributes
		const column = cache.columns[extendedAttributes.columnIndex + 1];

		// The speedTop is the unscaled top position at which to start retrieving cells.
		var speedTop = offset.y * column.speed;
		
		// The speedAdjustment is the amount by which to displace each attribute's Y origin.
		var speedAdjustment = offset.y - speedTop;

		let minIndex = -1;
		let minDistance = Number.MAX_SAFE_INTEGER;
		for (let i = 0; i < column.attributes.length; i++) {
			const attribute = column.attributes[i];
			const position = attribute.frame.center.y + speedAdjustment | 0;

			const distance = Math.abs(position - center);
			if (distance < minDistance) {
				minIndex = i;
				minDistance = distance;
			}
		}

		if (minIndex != -1) {
			return column.attributes[minIndex].indexPath;
		}

		return indexPath;
	},
	
	// @override - BMCollectionViewLayout
	indexPathBelowIndexPath(indexPath) {
		// Return the row below the given index path in the same column
		const extendedAttributes = this._extendedCachedAttributesForCellAtIndexPath(indexPath);

		if (extendedAttributes.rowIndex < this.cachedLayout.columns[extendedAttributes.columnIndex].attributes.length - 1) {
			return this.cachedLayout.columns[extendedAttributes.columnIndex].attributes[extendedAttributes.rowIndex + 1].indexPath;
		}

		return indexPath;
	},
	
	// @override - BMCollectionViewLayout
	indexPathsFromIndexPath(indexPath, {toIndexPath}) {
		// Create and return the index paths available in the union of the two index paths' frames.
		const startingAttributes = this.attributesForCellAtIndexPath(indexPath);
		const targetAttributes = this.attributesForCellAtIndexPath(toIndexPath);

		const attributes = this.attributesForElementsInRect(startingAttributes.frame.rectByUnionWithRect(targetAttributes.frame));
		
		return attributes.filter(a => a.itemType == BMCollectionViewLayoutAttributesType.Cell).map(a => a.indexPath);
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

/**
 * Constructs and returns a new masonry layout.
 * @returns <BMCollectionViewMasonryLayout>		A masonry layout.
 */
BMCollectionViewMasonryLayout.masonryLayout = function () {
	return new BMCollectionViewMasonryLayout();
};

// @endtype

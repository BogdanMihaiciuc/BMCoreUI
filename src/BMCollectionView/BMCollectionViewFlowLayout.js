// @ts-check

import {YES, NO, BMExtend} from '../Core/BMCoreUI'
import {BMInsetMake} from '../Core/BMInset'
import {BMSizeMake} from '../Core/BMSize'
import {BMRectMake} from '../Core/BMRect'
import {BMIndexPathMakeWithIndexes, BMIndexPathMakeWithRow} from '../Core/BMIndexPath'
import {BMCollectionViewLayoutAttributesMakeForCellAtIndexPath, BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier} from './BMCollectionViewLayoutAttributes'
import {BMLayoutConstraint, BMLayoutAttribute, BMLayoutConstraintRelation} from '../BMView/BMLayoutConstraint_v2.5'
import {BMCollectionViewLayout} from './BMCollectionViewLayout'

// When set to YES, this will cause flow layout to log messages to the console when the layout size changes as a
// result of performing cell measurements
const BM_AUTOMATIC_CELL_SIZE_MESSAGES = NO;

// @type BMCollectionViewTableLayoutSupplementaryView

/**
 * Constants representing the types of supplementary views that table layouts support.
 */
export var BMCollectionViewTableLayoutSupplementaryView = Object.freeze({ // <enum>
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
 * --------------------------------------
 * A basic layout implementation, the BMCollectionViewTableLayout will lay out its elements as a list where each row can have
 * either a fixed height or a variable height.
 *
 * If the row heights are variable, the collection must have a delegate that implements the 
 * `collectionViewRowHeightForCellAtIndexPath(_, _)` method.
 *
 * Optionally, the table layout may also generate supplementary views for section headers and section footers.
 */
export function BMCollectionViewTableLayout() {}; // <constructor>

/**
 * A value which may be assigned to the rowHeight property to indicate that the row heights vary by row.
 */
export var BMCollectionViewTableLayoutRowHeightVariable = -1; // <Number>

BMCollectionViewTableLayout.prototype = BMExtend(Object.create(BMCollectionViewLayout.prototype), {
	constructor: BMCollectionViewTableLayout,

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
export var BMCollectionViewFlowLayoutGravity = Object.freeze({ // <enum>
	
	/**
	 * The cells will flow to the center of the row with no spacing between them.
	 */
	Center: {}, // <enum>
	
	/**
	 * The cells will be aligned to the start of the row.
	 */
	Start: {}, // <enum>
	
	/**
	 * The cells will be aligned to the end of the row.
	 */
	End: {}, // <enum>
	
	/**
	 * The cells will flow to the edges of the row with equal spacing between them.
	 */
	Edge: {}, // <enum>
	
	/**
	 * The cells will flow such that they have equal spacing between them and the row edges.
	 */
	Spaced: {}, // <enum>
	
	/**
	 * The cells will flow such that they will have no spacing between them.
	 * If the cells in a row do not occupy the entire horizontal alrea of that row, they will be expanded proportionally until they do.
	 */
	Expand: {} // <enum>
	
});

// @endtype

// @type BMCollectionViewFlowLayoutAlignment

export var BMCollectionViewFlowLayoutAlignment = (function () {
	const start = {};
	const end = {};

	/**
	 * Controls how cells will be aligned within their row.
	 */
	var BMCollectionViewFlowLayoutAlignment = Object.freeze({ // <enum>
		
		/**
		 * @deprecated Use `Start`
		 * The cells will be aligned to the starting edge of the row.
		 */
		Top: start, // <enum>
		
		/**
		 * The cells will be aligned to the start of the row.
		 */
		Start: start, // <enum>
		
		/**
		 * The cells will be aligned to the center of the row.
		 */
		Center: {}, // <enum>
		
		/**
		 * @deprecated Use `End`
		 * The cells will be aligned to the end of the row.
		 */
		Bottom: end, // <enum>
		
		/**
		 * The cells will be aligned to the end of the row.
		 */
		End: end, // <enum>
		
		/**
		 * The cells will expand to fit the entire height of the row.
		 */
		Expand: {} // <enum>
		
	});

	return BMCollectionViewFlowLayoutAlignment;
})();

// @endtype

// @type BMCollectionViewFlowLayoutOrientation

/**
 * An enum containing the possible orientations that the flow layout can use.
 */
export var BMCollectionViewFlowLayoutOrientation = Object.freeze({ // <enum>
	/**
	 * Indicates that the flow layout will arrange cells primarily along the horizontal axis.
	 * When the orientation is set to this value the flow layout will scroll horizontally.
	 */
	Horizontal: {}, // <enum>

	/**
	 * Indicates that the flow layout will arrange cells primarily along the vertical axis.
	 * When the orientation is set to this value the tile flow will scroll vertically.
	 */
	Vertical: {} // <enum>
});

// @endtype

// @type BMCollectionViewFlowLayout extends BMCollectionViewLayout

/**
 * The identifiers for flow layout supplementary views.
 * As the flow layout only provides supplementary views for section headers and footers and empty data sets just like the table layout,
 * the identifiers used by the table layout are reused in this case.
 */
export var BMCollectionViewFlowLayoutSupplementaryView = BMCollectionViewTableLayoutSupplementaryView;

/**
 * The flow layout arranges cells in a horiztonally (TO DO) or vertically scrolling container.
 * The cells will each flow on a row until they no longer fit. After they extend past the horizontal margin, they will move on to the next row.
 */
export function BMCollectionViewFlowLayout() {}; // <constructor>

BMCollectionViewFlowLayout.prototype = BMExtend(Object.create(BMCollectionViewLayout.prototype), {

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

			// The sections that contain the preliminary layout
			const preliminarySections = [];

			const self = this;

			// This function measures a series of cells that exist in the preliminary layout and interect the given rect
			function measureCellsInRect(rect) {
				// Adjust the rows to account for the resolved layout
				if (cachedLayout.resolvedIndexPath) {
					let targetSection = cachedLayout.resolvedIndexPath.section;
					if (cachedLayout.resolvedIndexPath.row == -1) targetSection--;
					let adjustment;
					for (let i = 0; i <= targetSection; i++) {
						let preliminarySection = preliminarySections[i];
						let section = cachedLayout.sections[i];

						if (i < targetSection || section.resolved) {
							// Completely resolved sections can just be replaced entirely
							preliminarySection.start = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? section.top : section.left;
							preliminarySection.preliminaryEnd = preliminarySection.end;
							preliminarySection.end = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? section.bottom : section.right;

							preliminarySection.preliminaryRows = preliminarySection.rows;
							preliminarySection.rows = section.rows.map(r => orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? 
								{start: r.top, end: r.bottom, indexStart: r.startIndex, indexEnd: r.endIndex} : 
								{start: r.left, end: r.right, indexStart: r.startIndex, indexEnd: r.endIndex});
						}
						else {
							preliminarySection.preliminaryRows = preliminarySection.rows;
							preliminarySection.rows = [];
							preliminarySection.start = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? section.top : section.left;
							// For in-progress sections, it is necessary to figure out the adjustment between the
							// preliminary locations and the resolved ones
							let end = preliminarySection.start;
							let indexEnd = 0;
							for (const r of section.rows) {
								let row = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? 
									{start: r.top, end: r.bottom, indexStart: r.startIndex, indexEnd: r.endIndex} : 
									{start: r.left, end: r.right, indexStart: r.startIndex, indexEnd: r.endIndex};

								preliminarySection.rows.push(row);
								end = row.end;
								indexEnd = row.indexEnd;
							}

							end += rowSpacing;

							// After inspecting the resolved rows, it is possible to calculate the adjustment
							for (const row of preliminarySection.preliminaryRows) {
								if (row.indexEnd > indexEnd) {
									adjustment = end - row.start;
									break;
								}
							}

							// The adjustment can then be applied to all subsequent rows
							for (const row of preliminarySection.preliminaryRows) {
								if (row.indexEnd > indexEnd) {
									row.start += adjustment;
									row.end += adjustment;
								}
							}
						}
					}

					// The remaining sections also need to be adjusted
					for (let i = targetSection + 1; i < sectionCount; i++) {
						// If the adjustment is still undefined, the target section was fully defined; in this case
						// the adjustment can be calculated directly from the section ends
						if (adjustment === undefined) {
							adjustment = (orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? cachedLayout.sections[targetSection].bottom : cachedLayout.sections[targetSection].right) - preliminarySections[targetSection].end;
						}

						const preliminarySection = preliminarySections[i];
						preliminarySection.start += adjustment;
						preliminarySection.end += adjustment;

						for (const row of preliminarySection.row) {
							row.start += adjustment;
							row.end += adjustment;
						}
					}
				}

				let indexPaths = [];
				
				var rectTop = rect.origin.y;
				var rectBottom = rect.bottom;
				var rectLeft = rect.origin.x;
				var rectRight = rect.right;
				var rectEnd = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? rectBottom : rectRight;
				const rectStart = orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? rectTop : rectLeft;
				
				var sectionIndex = 0;
				var sectionCount = preliminarySections.length;
				var section;
				
				// Find the section that intersects this rect's top origin
				for (; sectionIndex < sectionCount; sectionIndex++) {
					section = preliminarySections[sectionIndex];
					if (section.end > rectStart) break;
				}
				
				// If there were no sections return nothing
				if (sectionIndex == sectionCount) return;
				
				// Find the first row index that intersects the rect's top.
				var rowIndex = 0;
				
				for (const row of section.rows) {
					if (row.end > rectStart) break;
					rowIndex++;
				}

				// Then continue adding rows until reaching the end of the rect or the end of the data set
				while (YES) {
					section = preliminarySections[sectionIndex];
					if (!section) return self.collectionView.measureSizesOfCellsAtIndexPaths(indexPaths);
					const rowCount = section.rows.length;
					for (let i = rowIndex; i < rowCount; i++) {
						const row = section.rows[i];
						// When encountering a row outside of the rect's bounds, perform the measurement and return
						if (row.start > rectEnd) return self.collectionView.measureSizesOfCellsAtIndexPaths(indexPaths);
						const indexEnd = Math.min(row.indexEnd + 1, self.collectionView.numberOfObjectsInSectionAtIndex(sectionIndex));
						for (let rowIndex = row.indexStart; rowIndex < indexEnd; rowIndex++) {
							indexPaths.push(self.collectionView.indexPathForObjectAtRow(rowIndex, {inSectionAtIndex: sectionIndex}));
						}
					}

					sectionIndex++;
					rowIndex = 0;
				}
			};

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
						numberOfColumns = (maximumLength / expectedSize) | 0;
					}

					// Ensure that there is at least one column
					numberOfColumns = Math.max(numberOfColumns, 1);
				}

				// Create the preliminary sections
				for (let i = 0; i < sectionCount; i++) {
					let numberOfObjects = this.collectionView.numberOfObjectsInSectionAtIndex(i);
					
					let numberOfRows = Math.ceil(numberOfObjects / numberOfColumns) | 0;
					
					let spacingBreadth = (numberOfRows - 1) * rowSpacing;
					if (headerHeight) spacingBreadth += rowSpacing;
					if (footerHeight) spacingBreadth += rowSpacing;
					
					if (orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
						// Section objects retain the overall bounds as well as the preliminary rows
						let section = {
							top: height,
							start: height,
							bottom: height + footerHeight + headerHeight + (expectedSecondarySize * numberOfRows) + spacingBreadth,
							end: height + footerHeight + headerHeight + (expectedSecondarySize * numberOfRows) + spacingBreadth,
							numberOfObjects: numberOfObjects,
							numberOfRows: numberOfRows,
							rows: []
						};

						let rowStart = headerHeight ? height + headerHeight + rowSpacing : height;
						let indexStart = 0;
						for (let i = 0; i < numberOfRows; i++) {
							// Preliminary rows contain the overall bounds and starting and ending index paths
							section.rows.push({start: rowStart, end: rowStart + expectedSecondarySize, indexStart: indexStart, indexEnd: indexStart + numberOfColumns - 1});
							rowStart += expectedSecondarySize + rowSpacing;
							indexStart += numberOfColumns;
						}
						
						height = section.bottom + insetTop + insetBottom;
						
						// If the total height exceeds the collection view frame height, perform a second layout pass to account for the scrollbars
						if (height > frameHeight) {
							if (this.collectionView.scrollBarSize && !useOffset) return this._prepareLayoutWithScrollbarOffset(YES);
						}

						preliminarySections.push(section);
					}
					else {
						let section = {
							left: width,
							start: width,
							right: width + (expectedSecondarySize * numberOfRows) + spacingBreadth,
							end: width + (expectedSecondarySize * numberOfRows) + spacingBreadth,
							numberOfObjects: numberOfObjects,
							numberOfRows: numberOfRows,
							rows: []
						};

						let rowStart = width;
						let indexStart = 0;
						for (let i = 0; i < numberOfRows; i++) {
							// Preliminary rows contain the overall bounds and starting and ending index paths
							section.rows.push({start: rowStart, end: rowStart + expectedSecondarySize, indexStart: indexStart, indexEnd: indexStart + numberOfColumns - 1});
							rowStart += expectedSecondarySize + rowSpacing;
							indexStart += numberOfColumns;
						}
						
						width = section.right + insetLeft + insetRight;
						
						// If the total height exceeds the collection view frame height, perform a second layout pass to account for the scrollbars
						if (width > frameWidth) {
							if (this.collectionView.scrollBarSize && !useOffset) return this._prepareLayoutWithScrollbarOffset(YES);
						}

						preliminarySections.push(section);
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

					// When requesting a rect initially, pre-measure the cells up to that rect
					if (target.rect) {
						measureCellsInRect(target.rect);
					}
	
					height = topPadding;
				}
				else {
					if (width > frameWidth) {
						if (this.collectionView.scrollBarSize && !useOffset) return this._prepareLayoutWithScrollbarOffset(YES);
					}

					cachedLayout.size = BMSizeMake(width, this.collectionView.frame.size.height);
	
					target = yield;
					// When requesting a rect initially, pre-measure the cells up to that rect
					if (target.rect) {
						measureCellsInRect(target.rect);
					}
	
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
										if (BM_AUTOMATIC_CELL_SIZE_MESSAGES) console.log('Layout height has changed to ' + height);
									}
								}
								else {
									if (width > cachedLayout.size.width) {
										cachedLayout.size.width = width + rowSpacing + insetRight + 1;
										if (BM_AUTOMATIC_CELL_SIZE_MESSAGES) console.log('Layout width has changed to ' + width);
									}
								}
								section.bottom = height;
								section.right = width;
								target = yield;
								
								// When requesting a rect initially, pre-measure the cells up to that rect
								if (target.rect) {
									measureCellsInRect(target.rect);
								}
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
										if (BM_AUTOMATIC_CELL_SIZE_MESSAGES) console.log('Layout height has changed to ' + height);
									}
								}
								else {
									if (width > cachedLayout.size.width) {
										cachedLayout.size.width = width + rowSpacing + insetRight + 1;
										if (BM_AUTOMATIC_CELL_SIZE_MESSAGES) console.log('Layout width has changed to ' + width);
									}
								}
								section.bottom = height;
								section.right = width;
								target = yield;

								// When requesting a rect initially, pre-measure the cells up to that rect
								if (target.rect) {
									measureCellsInRect(target.rect);
								}
							}
						}
					}
					
				}

				section.resolved == YES;

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

					// This represents the height that is actually used by rows, excluding spaces and supplementary views
					let usedHeight = 0;
					
					if (topAdjustment != 0 || this._contentGravity === BMCollectionViewFlowLayoutAlignment.Expand) {
						let sectionsLength = cachedLayout.sections.length;
						
						// Displace the sections
						for (let i = 0; i < sectionsLength; i++) {
							let section = cachedLayout.sections[i];
							
							section.top += topAdjustment;
							section.bottom += topAdjustment;
							
							// Displace all the rows in this sections
							let rowsLength = section.rows.length;
							for (let j = 0; j < rowsLength; j++) {
								let row = section.rows[j];
								
								row.top += topAdjustment;
								row.bottom += topAdjustment;

								usedHeight += row.bottom - row.top;
								
								// Displace all the cells in the row
								for (let k = 0; k < row.attributes.length; k++) {
									row.attributes[k].frame.origin.y += topAdjustment;
								}
							}
							
							// Displace the header and footer in this section
							if (section.headerAttributes) section.headerAttributes.frame.origin.y += topAdjustment;
							if (section.footerAttributes) section.footerAttributes.frame.origin.y += topAdjustment;
							
						}
					}

					// When using the expand gravity, a factor is used to multiply the heights of all rows
					if (this._contentGravity === BMCollectionViewFlowLayoutAlignment.Expand) {
						const spacingSize = height - usedHeight;
						const usableHeight = this.collectionView.frame.size.height - spacingSize;

						const scaleFactor = usableHeight / usedHeight;

						let displacement = 0;

						// Scale and displace the rows as needed
						for (const section of this.cachedLayout.sections) {
							// Displace the header and section origin
							section.top += displacement;
							if (section.headerAttributes) section.headerAttributes.frame.origin.y += displacement;

							for (const row of section.rows) {
								// Displace the row origin
								const rowHeight = row.bottom - row.top;
								row.top += displacement;

								// Scale and display each attribute's frame
								const scaledRowHeight = rowHeight * scaleFactor | 0;
								for (const attribute of row.attributes) {
									attribute.frame.origin.y += displacement;
									attribute.frame.size.height = attribute.frame.size.height * scaleFactor | 0;
								}

								// Advance the displacement based on the row's new height then displace the row end
								displacement += scaledRowHeight - rowHeight;
								row.bottom += displacement;
							}

							// Displace the section end and the footer
							section.bottom += displacement;
							if (section.footerAttributes) section.footerAttributes.frame.origin.y += displacement;
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

					// This represents the width that is actually used by rows, excluding spaces and supplementary views
					let usedWidth = 0;
					
					if (leftAdjustment != 0 || this._contentGravity === BMCollectionViewFlowLayoutAlignment.Expand) {
						let sectionsLength = cachedLayout.sections.length;
						
						// Displace the sections
						for (let i = 0; i < sectionsLength; i++) {
							let section = cachedLayout.sections[i];
							
							section.left += leftAdjustment;
							section.right += leftAdjustment;
							
							// Displace all the rows in this sections
							let rowsLength = section.rows.length;
							for (let j = 0; j < rowsLength; j++) {
								let row = section.rows[j];
								
								row.left += leftAdjustment;
								row.right += leftAdjustment;

								usedWidth += row.right - row.left;
								
								// Displace all the cells in the row
								for (let k = 0; k < row.attributes.length; k++) {
									row.attributes[k].frame.origin.x += leftAdjustment;
								}
							}
							
							// Displace the header and footer in this section
							if (section.headerAttributes) section.headerAttributes.frame.origin.x += leftAdjustment;
							if (section.footerAttributes) section.footerAttributes.frame.origin.x += leftAdjustment;
							
						}
					}

					// When using the expand gravity, a factor is used to multiply the heights of all rows
					if (this._contentGravity === BMCollectionViewFlowLayoutAlignment.Expand) {
						const spacingSize = width - usedWidth;
						const usableWidth = this.collectionView.frame.size.width - spacingSize;

						const scaleFactor = usableWidth / usedWidth;

						let displacement = 0;

						// Scale and displace the rows as needed
						for (const section of this.cachedLayout.sections) {
							// Displace the header and section origin
							section.left += displacement;
							if (section.headerAttributes) section.headerAttributes.frame.origin.x += displacement;

							for (const row of section.rows) {
								// Displace the row origin
								const rowWidth = row.right - row.left;
								row.left += displacement;

								// Scale and display each attribute's frame
								const scaledRowHeight = rowWidth * scaleFactor | 0;
								for (const attribute of row.attributes) {
									attribute.frame.origin.x += displacement;
									attribute.frame.size.height = attribute.frame.size.height * scaleFactor | 0;
								}

								// Advance the displacement based on the row's new width then displace the row end
								displacement += scaledRowHeight - rowWidth;
								row.right += displacement;
							}

							// Displace the section end and the footer
							section.right += displacement;
							if (section.footerAttributes) section.footerAttributes.frame.origin.x += displacement;
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
					numberOfColumns = (length / cellSize) | 0;
				}
			}
			cachedLayout.numberOfColumns = Math.max(numberOfColumns, 1);
			
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
						numberOfObjects,
						numberOfRows
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

					if (this._contentGravity === BMCollectionViewFlowLayoutAlignment.Expand) {
						// With static sizes, all rows and attributes have the same height, so the adjustment can just be directly applied to each row
						let usedHeight = 0;
						for (const section of cachedLayout.sections) {
							usedHeight += section.numberOfRows * rowBreadth;
						}

						const spacingSize = height - usedHeight;
						const scaleFactor = (this.collectionView.frame.size.height - spacingSize) / usedHeight;

						// Multiply the height of the prototype rows by the scale factor
						for (const row of cachedLayout.prototypeRows) {
							for (const attribute of row.attributes) {
								attribute.frame.size.height = attribute.frame.size.height * scaleFactor | 0;
							}
						}

						// Adjust the bounds of each section as needed
						let displacement = 0;
						for (const section of cachedLayout.sections) {
							section.top += displacement;

							const sectionHeight = section.numberOfRows * rowBreadth;
							displacement += (sectionHeight * scaleFactor | 0) - sectionHeight;

							section.bottom += displacement;
						}

						cachedLayout.rowHeight = cachedLayout.rowHeight * scaleFactor | 0;
						cachedLayout.rowBreadth = cachedLayout.rowBreadth * scaleFactor | 0;
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
						numberOfObjects,
						numberOfRows
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

					if (this._contentGravity === BMCollectionViewFlowLayoutAlignment.Expand) {
						// With static sizes, all rows and attributes have the same width, so the adjustment can just be directly applied to each row
						let usedWidth = 0;
						for (const section of cachedLayout.sections) {
							usedWidth += section.numberOfRows * rowBreadth;
						}

						const spacingSize = width - usedWidth;
						const scaleFactor = (this.collectionView.frame.size.width - spacingSize) / usedWidth;

						// Multiply the width of the prototype rows by the scale factor
						for (const row of cachedLayout.prototypeRows) {
							for (const attribute of row.attributes) {
								attribute.frame.size.width = attribute.frame.size.width * scaleFactor | 0;
							}
						}

						// Adjust the bounds of each section as needed
						let displacement = 0;
						for (const section of cachedLayout.sections) {
							section.left += displacement;

							const sectionWidth = section.numberOfRows * rowBreadth;
							displacement += (sectionWidth * scaleFactor | 0) - sectionWidth;

							section.right += displacement;
						}
						cachedLayout.cellWidth = cachedLayout.cellWidth * scaleFactor | 0;
						cachedLayout.rowBreadth = cachedLayout.rowBreadth * scaleFactor | 0;
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
		else if (gravity === BMCollectionViewFlowLayoutGravity.End) {
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
				BMSizeMake(Math.max(this.cachedLayout.sections[this.cachedLayout.sections.length - 1].right + this.sectionInsets.right, 
							this.collectionView.frame.size.width), 
							this.collectionView.frame.size.height) : 
				this.collectionView.frame.size.copy();
		}

			
	},

	// @override - BMCollectionViewTableLayout
	shouldInvalidateLayoutForFrameChange(frame, {fromFrame}) {
		if (fromFrame && fromFrame.size.width < frame.size.width) {
			// If the size increases, invalidate all existing measured cells as their measured size can be less than the
			// collection view's frame size as a result of how text wraps
			this.collectionView.invalidateMeasuredSizeOfCells();
		}
		else {
			// Because the measured size of the cells can depend upon the size of collection view's frame, in addition
			// to invalidating the layout, flow layout also invalidates the size of cells that are as wide as collection view's previous frame.
			this.collectionView.invalidateMeasuredSizeOfCellsWithBlock(size => {
				return size.width >= this.cachedLayout.availableWidth;
			});
		}

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
					if (options.atIndexPath.section == this.collectionView.numberOfSections() - 1) {
						// If there is no following section, compute until the last index path
						this._layoutIterator.next({indexPath: this.collectionView.indexPathForObjectAtRow(this.collectionView.numberOfObjectsInSectionAtIndex(options.atIndexPath.section) - 1, {inSectionAtIndex: options.atIndexPath.section})});
					}
					else {
						// If the layout has not been resolved up to this index path, continue computing up to the beginning of the next section
						this._layoutIterator.next({indexPath: this.collectionView.indexPathForObjectAtRow(0, {inSectionAtIndex: options.atIndexPath.section + 1})});
					}
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
		
		// Start adding attributes until the current supplementary view or row's bottom edge is below the rect
		try {
			for (; sectionIndex < sectionCount; sectionIndex++) {
				var section = cache.sections[sectionIndex];
				// This can happen if the last added element is at the end of the section and the first unresolved element
				// is in the next section
				if (!section && this._expectedCellSize) return attributes;
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
							
							if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
								var end = headerAttributes.frame.bottom;
								if (end > rectBottom) return attributes;
							}
							else {
								var end = headerAttributes.frame.right;
								if (end > rectRight) return attributes;
							}
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

							if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
								var end = section.footerAttributes.frame.origin.y;
								if (end > rectBottom) return attributes;
							}
							else {
								var end = section.footerAttributes.frame.origin.x;
								if (end > rectRight) return attributes;
							}
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

						if (cache.orientation == BMCollectionViewFlowLayoutOrientation.Vertical) {
							var end = row.bottom;
							if (end > rectBottom) return attributes;
						}
						else {
							var end = row.right;
							if (end > rectRight) return attributes;
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
	indexPathToTheLeftOfIndexPath(indexPath) {
		// In a horizontal layout this function the same as above for vertical,
		// shifting to the previous row to a column with similar positioning
		if (this._orientation == BMCollectionViewFlowLayoutOrientation.Horizontal) {
			if (!this._cellSize || this._expectedCellSize) return this._cachedIndexPathAboveIndexPath(indexPath);
	
			return this._computedIndexPathAboveIndexPath(indexPath);
		}

		// Otherwise the base implementation is sufficient
		return BMCollectionViewLayout.prototype.indexPathToTheLeftOfIndexPath.apply(this, arguments);
	},

	// @override - BMCollectionViewLayout
	indexPathAboveIndexPath(indexPath) {
		// In a horizontal layout the base implementation is sufficient
		if (this._orientation == BMCollectionViewFlowLayoutOrientation.Horizontal) {
			return BMCollectionViewLayout.prototype.indexPathToTheLeftOfIndexPath.apply(this, arguments);
		}

		if (!this._cellSize || this._expectedCellSize) return this._cachedIndexPathAboveIndexPath(indexPath);

		return this._computedIndexPathAboveIndexPath(indexPath);
	},

	// @override - BMCollectionViewLayout
	indexPathToTheRightOfIndexPath(indexPath) {
		// In a horizontal layout this function the same as below for vertical,
		// shifting to the next row to a column with similar positioning
		if (this._orientation == BMCollectionViewFlowLayoutOrientation.Horizontal) {
			if (!this._cellSize || this._expectedCellSize) return this._cachedIndexPathBelowIndexPath(indexPath);
	
			return this._computedIndexPathBelowIndexPath(indexPath);
		}

		// Otherwise the base implementation is sufficient
		return BMCollectionViewLayout.prototype.indexPathToTheRightOfIndexPath.apply(this, arguments);
	},

	// @override - BMCollectionViewLayout
	indexPathBelowIndexPath(indexPath) {
		// In a horizontal layout the base implementation is sufficient
		if (this._orientation == BMCollectionViewFlowLayoutOrientation.Horizontal) {
			return BMCollectionViewLayout.prototype.indexPathToTheRightOfIndexPath.apply(this, arguments);
		}

		if (!this._cellSize || this._expectedCellSize) return this._cachedIndexPathBelowIndexPath(indexPath);

		return this._computedIndexPathBelowIndexPath(indexPath);
	},

	/**
	 * Returns the index path that is above the given index path in a cached layout.
	 * In a horizontal layout this returns the index path that is to the left of the given index path.
	 * @param indexPath <BMIndexPath>		The index path to start from.
	 * @returns <BMIndexPath>				The index path above the given one.
	 */
	_cachedIndexPathAboveIndexPath(indexPath) {
		const section = indexPath.section;
		const row = indexPath.row;

		// Find the row where the current index path is
		const cachedSection = this.cachedLayout.sections[section];

		if (!cachedSection) return indexPath;

		const sectionRows = cachedSection.rows;
		
		let rowIndex = 0;
		const rowCount = sectionRows.length;
		for (rowIndex; rowIndex < rowCount; rowIndex++) {
			const sectionRow = sectionRows[rowIndex];
			if (sectionRow.startIndex <= row && sectionRow.endIndex >= row) {
				break;
			}
		}

		const attributes = sectionRows[rowIndex].attributes.find(a => a.indexPath.row == row);
		const positionProperty = this._orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? 'x' : 'y';
		const position = attributes.frame.center[positionProperty];

		let previousRow;

		// Find the next row, if any
		if (rowIndex >= 0) {
			const previousRowIndex = rowIndex - 1;
			previousRow = sectionRows[previousRowIndex];
		}
		else {
			// If the current row is the first one in its section, find the next section that has at least one row
			let sectionIndex = section - 1;
			while (sectionIndex >= 0) {
				if (this.collectionView.numberOfObjectsInSectionAtIndex(sectionIndex)) {
					previousRow = this.cachedLayout.sections[sectionIndex].sectionRows[this.cachedLayout.sections[sectionIndex].sectionRows.length - 1];
					break;
				}
				sectionIndex--;
			}
		}


		// If no viable row is found, the current row is the first one
		if (previousRow) {
			// In this row, return the index path for the attributes with
			// the closest horizontal distance from the source index path
			let minDistance = Number.MAX_SAFE_INTEGER;
			let minDistanceIndex = -1;
			for (let i = 0; i < previousRow.attributes.length; i++) {
				const attributes = previousRow.attributes[i];
				const distance = Math.abs(attributes.frame.center[positionProperty] - position);

				if (distance < minDistance) {
					minDistance = distance;
					minDistanceIndex = i;
				}
			}

			return previousRow.attributes[minDistanceIndex].indexPath;
		}

		return indexPath;
	},

	/**
	 * Returns the index path that is above the given index path in a computed layout.
	 * In a horizontal layout this returns the index path that is to the left of the given index path.
	 * @param indexPath <BMIndexPath>		The index path to start from.
	 * @returns <BMIndexPath>				The index path above the given one.
	 */
	_computedIndexPathAboveIndexPath(indexPath) {
		const cache = this.cachedLayout;
		
		var sectionIndex = indexPath.section;
		
		const numberOfColumns = cache.numberOfColumns;
		
		var objectIndex = indexPath.row;
		
		// Find the row and column index within the section
		const cellRow = (objectIndex / numberOfColumns) | 0;
		const cellColumn = objectIndex % numberOfColumns;

		let previousRow;

		if (cellRow > 0) {
			previousRow = cellRow - 1;
		}
		else {
			// If the current row is the last one in its section, find the next section that has at least one row
			let previousSectionIndex = sectionIndex - 1;
			while (previousSectionIndex >= 0) {
				if (this.collectionView.numberOfObjectsInSectionAtIndex(previousSectionIndex)) {
					previousRow = cache.sections[previousSectionIndex].numberOfRows - 1;
					sectionIndex = previousSectionIndex;
					break;
				}
				previousSectionIndex--;
			}
		}

		if (typeof previousRow != 'number') return indexPath;

		const nextRowIndexStart = numberOfColumns * previousRow;
		const nextSectionNumberOfObjects = this.collectionView.numberOfObjectsInSectionAtIndex(sectionIndex);
		
		
		// Find this cell's row prototype. In most cases this will be the prototype for the numberOfColumns columns,
		// unless this cell is in the last row - in those cases it is possible that there may be fewer columns
		if (previousRow == ((nextSectionNumberOfObjects / numberOfColumns) | 0)) {
			var numberOfColumnsInLastRow = (nextSectionNumberOfObjects % numberOfColumns) || numberOfColumns;
			
			return this.collectionView.indexPathForObjectAtRow(nextRowIndexStart + Math.min(numberOfColumnsInLastRow, cellColumn), {inSectionAtIndex: sectionIndex})
		}
		else {
			return this.collectionView.indexPathForObjectAtRow(nextRowIndexStart + cellColumn, {inSectionAtIndex: sectionIndex});
		}
		
	},

	/**
	 * Returns the index path that is below the given index path in a cached layout.
	 * In a horizontal layout this returns the index path that is to the right of the given index path.
	 * @param indexPath <BMIndexPath>		The index path to start from.
	 * @returns <BMIndexPath>				The index path below the given one.
	 */
	_cachedIndexPathBelowIndexPath(indexPath) {
		const sectionCount = this.collectionView.numberOfSections();

		const section = indexPath.section;
		const row = indexPath.row;

		// Find the row where the current index path is
		const cachedSection = this.cachedLayout.sections[section];

		if (!cachedSection) return indexPath;

		const sectionRows = cachedSection.rows;
		
		let rowIndex = 0;
		const rowCount = sectionRows.length;
		for (rowIndex; rowIndex < rowCount; rowIndex++) {
			const sectionRow = sectionRows[rowIndex];
			if (sectionRow.startIndex <= row && sectionRow.endIndex >= row) {
				break;
			}
		}

		const attributes = sectionRows[rowIndex].attributes.find(a => a.indexPath.row == row);
		const positionProperty = this._orientation == BMCollectionViewFlowLayoutOrientation.Vertical ? 'x' : 'y';
		const position = attributes.frame.center[positionProperty];

		let nextRow;

		// Find the next row, if any
		if (rowIndex < rowCount - 1) {
			const nextRowIndex = rowIndex + 1;
			nextRow = sectionRows[nextRowIndex];
		}
		else {
			// If the current row is the last one in its section, find the next section that has at least one row
			let sectionIndex = section + 1;
			while (sectionIndex < sectionCount) {
				if (this.collectionView.numberOfObjectsInSectionAtIndex(sectionIndex)) {
					nextRow = this.cachedLayout.sections[sectionIndex].sectionRows[0];
					break;
				}
				sectionIndex++;
			}
		}


		// If no viable row is found, the current row is the last one
		if (nextRow) {
			// In this row, return the index path for the attributes with
			// the closest horizontal distance from the source index path
			let minDistance = Number.MAX_SAFE_INTEGER;
			let minDistanceIndex = -1;
			for (let i = 0; i < nextRow.attributes.length; i++) {
				const attributes = nextRow.attributes[i];
				const distance = Math.abs(attributes.frame.center[positionProperty] - position);

				if (distance < minDistance) {
					minDistance = distance;
					minDistanceIndex = i;
				}
			}

			return nextRow.attributes[minDistanceIndex].indexPath;
		}

		return indexPath;
	},

	/**
	 * Returns the index path that is below the given index path in a computed layout.
	 * In a horizontal layout this returns the index path that is to the left of the given index path.
	 * @param indexPath <BMIndexPath>		The index path to start from.
	 * @returns <BMIndexPath>				The index path below the given one.
	 */
	_computedIndexPathBelowIndexPath(indexPath) {
		const sectionCount = this.collectionView.numberOfSections();

		const cache = this.cachedLayout;
		
		var sectionIndex = indexPath.section;
		var section = cache.sections[sectionIndex];
		
		const numberOfColumns = cache.numberOfColumns;
		
		var objectIndex = indexPath.row;
		
		// Find the row and column index within the section
		const cellRow = (objectIndex / numberOfColumns) | 0;
		const cellColumn = objectIndex % numberOfColumns;

		let nextRow;

		if (cellRow < section.numberOfRows - 1) {
			nextRow = cellRow + 1;
		}
		else {
			// If the current row is the last one in its section, find the next section that has at least one row
			let nextSectionIndex = sectionIndex + 1;
			while (nextSectionIndex < sectionCount) {
				if (this.collectionView.numberOfObjectsInSectionAtIndex(nextSectionIndex)) {
					nextRow = 0;
					sectionIndex = nextSectionIndex;
					break;
				}
				nextSectionIndex++;
			}
		}

		if (typeof nextRow != 'number') return indexPath;

		const nextRowIndexStart = numberOfColumns * nextRow;
		const nextSectionNumberOfObjects = this.collectionView.numberOfObjectsInSectionAtIndex(sectionIndex);
		
		
		// Find this cell's row prototype. In most cases this will be the prototype for the numberOfColumns columns,
		// unless this cell is in the last row - in those cases it is possible that there may be fewer columns
		if (nextRow == ((nextSectionNumberOfObjects / numberOfColumns) | 0)) {
			var numberOfColumnsInLastRow = (nextSectionNumberOfObjects % numberOfColumns) || numberOfColumns;
			
			return this.collectionView.indexPathForObjectAtRow(nextRowIndexStart + Math.min(numberOfColumnsInLastRow, cellColumn), {inSectionAtIndex: sectionIndex})
		}
		else {
			return this.collectionView.indexPathForObjectAtRow(nextRowIndexStart + cellColumn, {inSectionAtIndex: sectionIndex});
		}
		
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

/**
 * Constructs and returns a new flow layout.
 * @return <BMCollectionViewFlowLayout>		A flow layout.	 
 */
BMCollectionViewFlowLayout.flowLayout = function () {
	return new BMCollectionViewFlowLayout();
}

// @endtype


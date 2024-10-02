// @ts-check

import {YES, NO, BMExtend, BMCopyProperties} from '../Core/BMCoreUI'
import {BMInsetMake, BMInset} from '../Core/BMInset'
import {BMPointMakeWithX} from '../Core/BMPoint'
import {BMSizeMake} from '../Core/BMSize'
import {BMRectMake, BMRectMakeWithX, BMRectMakeWithOrigin} from '../Core/BMRect'
import {BMIndexPathMakeWithIndexes} from '../Core/BMIndexPath'
import {BMCollectionViewLayoutAttributesMakeForCellAtIndexPath, BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier, BMCollectionViewLayoutAttributesType} from './BMCollectionViewLayoutAttributes'
import {BMCollectionViewFlowLayoutSupplementaryView, BMCollectionViewTableLayoutSupplementaryView} from './BMCollectionViewFlowLayout'
import {BMCollectionViewLayout} from './BMCollectionViewLayout'

// @type BMCollectionViewTileLayoutOrientation

/**
 * An enum containing the possible orientations that the tile layout can use.
 */
export var BMCollectionViewTileLayoutOrientation = Object.freeze({
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
export function BMCollectionViewTileLayout() {}; // <constructor>

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
	},

	/************************************* CELL HIGHLIGHTING ********************************/

	// @override - BMCollectionViewLayout
	 indexPathToTheLeftOfIndexPath(indexPath) {
		// Create a rect starting at the left edge of the given index path and request attributes in it
		const startingAttributes = this.attributesForCellAtIndexPath(indexPath);

		const extent = BMRectMake(
			startingAttributes.frame.origin.x - this.collectionView.bounds.size.width - 1,
			startingAttributes.frame.origin.y,
			this.collectionView.bounds.size.width,
			startingAttributes.frame.size.height
		);

		// Filter to only include cell attributes
		const attributes = this.attributesForElementsInRect(extent).filter(a => a.itemType == BMCollectionViewLayoutAttributesType.Cell);

		// return the rightmost attributes, if any
		let maxAttributesX = extent.left;
		let maxAttributesIndex = -1;

		for (let i = 0; i < attributes.length; i++) {
			if (attributes[i].frame.origin.x > maxAttributesX) {
				maxAttributesX = attributes[i].frame.origin.x;
				maxAttributesIndex = i;
			}
		}

		if (maxAttributesIndex != -1) {
			return attributes[maxAttributesIndex].indexPath;
		}

		return indexPath;
	},

	// @override - BMCollectionViewLayout
	indexPathAboveIndexPath(indexPath) {
		// Create a rect starting at the top edge of the given index path and request attributes in it
		const startingAttributes = this.attributesForCellAtIndexPath(indexPath);

		const extent = BMRectMake(
			startingAttributes.frame.origin.x,
			startingAttributes.frame.origin.y - this.collectionView.bounds.size.height - 1,
			startingAttributes.frame.size.width,
			this.collectionView.bounds.size.height
		);

		// Filter to only include cell attributes
		const attributes = this.attributesForElementsInRect(extent).filter(a => a.itemType == BMCollectionViewLayoutAttributesType.Cell);

		// return the bottommost attributes, if any
		let maxAttributesY = extent.origin.y;
		let maxAttributesIndex = -1;

		for (let i = 0; i < attributes.length; i++) {
			if (attributes[i].frame.origin.y > maxAttributesY) {
				maxAttributesY = attributes[i].frame.origin.y;
				maxAttributesIndex = i;
			}
		}

		if (maxAttributesIndex != -1) {
			return attributes[maxAttributesIndex].indexPath;
		}

		return indexPath;
	},
	
	// @override - BMCollectionViewLayout
	indexPathToTheRightOfIndexPath(indexPath) {
		// Create a rect starting at the right edge of the given index path and request attributes in it
		const startingAttributes = this.attributesForCellAtIndexPath(indexPath);

		const extent = BMRectMake(
			startingAttributes.frame.right + 1,
			startingAttributes.frame.origin.y,
			this.collectionView.bounds.size.width,
			startingAttributes.frame.size.height
		);

		// Filter to only include cell attributes
		const attributes = this.attributesForElementsInRect(extent).filter(a => a.itemType == BMCollectionViewLayoutAttributesType.Cell);

		// return the leftmost attributes, if any
		let minAttributesX = extent.right;
		let minAttributesIndex = -1;

		for (let i = 0; i < attributes.length; i++) {
			if (attributes[i].frame.origin.x < minAttributesX) {
				minAttributesX = attributes[i].frame.origin.x;
				minAttributesIndex = i;
			}
		}

		if (minAttributesIndex != -1) {
			return attributes[minAttributesIndex].indexPath;
		}

		return indexPath;
	},
	
	// @override - BMCollectionViewLayout
	indexPathBelowIndexPath(indexPath) {
		// Create a rect starting at the bottom edge of the given index path and request attributes in it
		const startingAttributes = this.attributesForCellAtIndexPath(indexPath);

		const extent = BMRectMake(
			startingAttributes.frame.origin.x,
			startingAttributes.frame.bottom + 1,
			startingAttributes.frame.size.width,
			this.collectionView.bounds.size.height
		);

		// Filter to only include cell attributes
		const attributes = this.attributesForElementsInRect(extent).filter(a => a.itemType == BMCollectionViewLayoutAttributesType.Cell);

		// return the topmost attributes, if any
		let minAttributesY = extent.bottom;
		let minAttributesIndex = -1;

		for (let i = 0; i < attributes.length; i++) {
			if (attributes[i].frame.origin.y < minAttributesY) {
				minAttributesY = attributes[i].frame.origin.y;
				minAttributesIndex = i;
			}
		}

		if (minAttributesIndex != -1) {
			return attributes[minAttributesIndex].indexPath;
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

});

/**
 * Constructs and returns a new tile layout.
 * @return <BMCollectionViewTileLayout>		A tile layout.
 */
BMCollectionViewTileLayout.tileLayout = function () {
	return new this();
};

// @endtype
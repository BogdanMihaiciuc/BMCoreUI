// @ts-check

import {YES, NO, BMExtend, BMNumberByInterpolatingNumbersWithFraction, BMScrollingDirectionVertical} from '../Core/BMCoreUI'
import {BMInsetMake} from '../Core/BMInset'
import {BMPointMake} from '../Core/BMPoint'
import {BMSizeMake} from '../Core/BMSize'
import {BMRectMakeWithX} from '../Core/BMRect'
import {BMCollectionViewLayoutAttributesMakeForCellAtIndexPath} from './BMCollectionViewLayoutAttributes'
import {BMCollectionViewLayout} from './BMCollectionViewLayout'

// @type BMCollectionViewStackLayout extends BMCollectionViewLayout

/**
 * The stack layout is a vertically scrolling layout that presents cells as a stack, where the current cell appears above the other cells.
 * In the stack layout, previous cells appear behind the current cell, while upcoming cells are hidden.
 * 
 * When scrolling in the stack layout, the scroll position will always snap back to fully show a single cell.
 * 
 * The stack layout does not support sections or supplementary views.
 */
export function BMCollectionViewStackLayout() {}; // <constructor>

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

/**
 * Constructs and returns a new stack layout.
 * @returns <BMCollectionViewStackLayout>	A stack layout.
 */
BMCollectionViewStackLayout.stackLayout = function () {
	return new BMCollectionViewStackLayout();
}

// @endtype
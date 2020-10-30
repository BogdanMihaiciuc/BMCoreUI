// @ts-check

import {YES, NO, BMExtend, BMScrollBarGetSize, BMAddSmoothMousewheelInteractionToNode, BMIsTouchDevice, BMNumberByInterpolatingNumbersWithFraction, BMUUIDMake} from '../Core/BMCoreUI'
import {BMInset} from '../Core/BMInset'
import {BMPointMake} from '../Core/BMPoint'
import {BMSizeMake} from '../Core/BMSize'
import {BMRect, BMRectMake, BMRectMakeWithNodeFrame, BMRectByInterpolatingRect} from '../Core/BMRect'
import {BMIndexPathNone} from '../Core/BMIndexPath'
import {BMAnimateWithBlock, BMAnimationContextBeginStatic, BMAnimationContextGetCurrent, BMAnimationContextAddCompletionHandler, BMAnimationApply, __BMVelocityAnimate, BMHook} from '../Core/BMAnimationContext'
import {BMView, BMViewLayoutQueue} from '../BMView/BMView_v2.5'
import {BMCollectionViewLayoutAttributesMakeForCellAtIndexPath, BMCollectionViewLayoutAttributesType, BMCollectionViewLayoutAttributesStyleDefaults, _BMCollectionViewTransitionLayoutAttributesMakeWithSourceAttributes} from './BMCollectionViewLayoutAttributes'
import {BMJQueryShim, BMCollectionViewCell} from './BMCollectionViewCell'
import {BMCollectionViewFlowLayout} from './BMCollectionViewFlowLayout'
import {_BMCollectionViewTransitionLayout} from './BMCollectionViewLayout'
import {IScroll} from '../iScroll/iscroll-probe'

// When set to YES, this will cause collection view to use static animation contexts when setting up animations
const BM_COLLECTION_VIEW_USE_STATIC_CONTEXT = YES;
// When set to YES, this will cause collection view to extend view; setting this flag to NO is no longer supported
const BM_COLLECTION_VIEW_USE_BMVIEW_SUBCLASS = YES;
// When set to YES, this will cause collection view to flash red when it measures a cell
const BM_COLLECTION_VIEW_DEBUG_MEASURE = NO;
// When set to YES, this will cause cells to flash red when they are measured
const BM_COLLECTION_VIEW_DEBUG_MEASURE_CELL = NO;
// When set to YES, this will cause collection view to never use iScroll
const BM_COLLECTION_VIEW_DISABLE_ISCROLL = NO;
// When set to YES, this will cause certain deprecated properties or methods to trigger warning messages in the console.
const BM_DEPRECATION_WARN = NO;
// When set to YES, this will cause deprecation warnings to also incude the call stack.
const BM_DEPRECATION_TRACE = YES;
// Causes an alert to appear when collection view first loads its data containing the total time the `reloadLayout()` method took.
const BM_SIMPLE_BENCH = NO;

// @type BMCollectionViewTransferPolicy

/**
 * An list of constants describing what happens to source objects when they are transferred
 * from a source collection view.
 */
export var BMCollectionViewTransferPolicy = Object.freeze({ // <enum>
	/**
	 * Indicates that the source collection view will allow the target collection view
	 * to move the items. The move only happens if the target collection view also
	 * specifies a move accept policy.
	 */
	Move: 'Move', // <enum>

	/**
	 * Indicates that the source collection view will retain the items regardless of the
	 * accepting collection view's accept policy.
	 */
	Copy: 'Copy', // <enum>
});

// @endtype

// @type BMCollectionViewAcceptPolicy

/**
 * An list of constants describing what happens to source objects when they are transferred
 * to a destination collection view.
 */
export var BMCollectionViewAcceptPolicy = Object.freeze({ // <enum>
	/**
	 * Indicates that the target collection view would like the transferred items to be
	 * removed from the source collection view.
	 */
	Move: 'Move', // <enum>

	/**
	 * Indicates that the items will not be removed from the source collection view.
	 */
	Copy: 'Copy', // <enum>
});

// @endtype

// @type BMCollectionView Global Symbols

// Set to YES during a drag & drop operation
var _BMCoreUIIsDragging = NO; // <Boolean>

/**
 * The default animation duration.
 */
var _BMCollectionViewAnimationDurationDefault = 500; // <Number>

/**
 * The default animation easing.
 */
var _BMCollectionViewAnimationEasingDefault = 'easeInOutQuart'; // <String>

/**
 * The default animation stride.
 */
var _BMCollectionViewAnimationStrideDefault = 50; // <String>

/**
 * The delay in miliseconds before two successive clicks or taps are considered a double click.
 */
var _BMCollectionViewDoubleClickDelay = 250; // <Number>

/**
 * The delay in miliseconds before a click or tap is considered a long click.
 */
var _BMCollectionViewLongClickDelay = 400; // <Number>

/**
 * The number of pixels a touch or clicked pointer can wander off before being considered a drag rather than a tap or click.
 */
var _BMCollectionViewClickSlopeThreshold = 10; // <Number>

/**
 * The time in milliseconds to wait before considering that a scroll operation was finished.
 * When this time expires, the collection view will request snapping offsets from layout objects
 * that support snapping.
 */
var _BMCollectionViewSnappingScrollThreshold = 200; // <Number>

/**
 * The default identity comparator that uses the == operator to test for equality.
 * @param o1 <AnyObject, nullable>		The first object.
 * @param o2 <AnyObject, nullable>		The second object.
 * @return <Boolean>					YES if the objects are equal, NO otherwise.
 */
var _BMCollectionViewIdentityComparator = function (o1, o2) { return o1 == o2; }; // <Boolean ^ (AnyObject, AnyObject)>

// @endtype

// @type BMCollectionViewScrollingDirection

/**
 * The type of scrolling that the collection view supports.
 */
export var BMCollectionViewScrollingDirection = Object.freeze({ // <enum>
    /**
     * Indicates that the collection view will only scroll vertically.
     */
    Vertical: {}, // <enum>

    /**
     * Indicates that the collection view will only scroll horizontally.
     */
    Horizontal: {}, // <enum>

    /**
     * Indicates that the collection view will scroll both vertically and horizontally.
     */
    Both: {} // <enum>
});

// @endtype

// @type BMCollectionViewScrollingGravityHorizontal

/**
 * Controls the final horizontal scrolling position of a programatic scroll.
 */
export var BMCollectionViewScrollingGravityHorizontal = Object.freeze({ // <enum>
	/**
	 * Indicates that the target view will appear on the left edge of the collection view after the scroll.
	 */
	Left: {}, // <enum>
	
	/**
	 * Indicates that the target view will appear centered horizontally in the collection view after the scroll.
	 */
	Center: {}, // <enum>
	
	/**
	 * Indicates that the target view will appear on the right edge of the collection view after the scroll.
	 */
	Right: {} // <enum>
});

// @endtype

// @type BMCollectionViewScrollingGravityVertical

/**
 * Controls the final vertical scrolling position of a programatic scroll.
 */
export var BMCollectionViewScrollingGravityVertical = Object.freeze({ // <enum>
	/**
	 * Indicates that the target view will appear on the top edge of the collection view after the scroll.
	 */
	Top: {}, // <enum>
	
	/**
	 * Indicates that the target view will appear centered vertically in the collection view after the scroll.
	 */
	Center: {}, // <enum>
	
	/**
	 * Indicates that the target view will appear on the bottom edge of the collection view after the scroll.
	 */
	Bottom: {} // <enum>
});

// @endtype

// @type BMCollectionView<T = any> extends BMView

// Contains all active collection view instances
var _BMCollectionViews = new Map;

/**
 * The BMCollectionView manages a horizontally or vertically scrolling list of elements created from a template.
 * The collection view will only render the elements that are actually visible on screen and will recycle and reuse
 * elements as they go off screen when the user scrolls the container.
 *
 * The position and size of the elements is determined by a layout object. The layout object is responsible for
 * calculating how large the collection should be and where each element should pe placed. Additionally, the layout
 * object may define its own supplementary views that are not explicitly part of the data set but will be rendered by the collection view.
 * It may interact with the data set to determine where to place these elements and how many of them there should be.
 * By default, the collection view will create and use an instance of BMCollectionViewFLowLayout.
 *
 * The contents and order of the elements is determined by a data set object. The elements can optionally be grouped into sections.
 * The data set object is responsible for managing the model objects that correspond to the collection elements and letting the
 * collection view know the number and order of sections and elements that will be displayed. It also provides the actual contents
 * of the collection view elements.
 * The data set object must be defined and set in order to use the collection view.
 *
 * Finally, the delegate object may be provided to respond to various collection view events. The delegate may also be used to configure the collection view's
 * behaviour. For example, the collection view may ask its delegate if it can select or deselect elements.
 * The delegate object and all of its methods are optional.
 *
 * BMCollectionView objects should not be created using the constructor. Instead the BMCollectionViewMakeWithContainer function should be used to obtain new instances
 * of collection views.
 *
 */
export function BMCollectionView() { // <constructor>
	
}

BMCollectionView.prototype = BMExtend(BM_COLLECTION_VIEW_USE_BMVIEW_SUBCLASS ? Object.create(BMView.prototype) : {}, {
	constructor: BMCollectionView,

	// MARK: BMView overrides
	//#region BMView overrides

	// @override - BMView
	get supportsAutomaticIntrinsicSize() {
		return NO;
	},

	/**
	 * The last measured intrinsic size for this collection view.
	 */
	_lastMeasuredIntrinsicSize: undefined, // <BMSize, nullable>

	// @override - BMView
	get intrinsicSize() {
		return undefined;
		if (!this.dataSet) return BMSizeMake();
		if (this.requiredWidth) {
			return this._lastMeasuredIntrinsicSize = this.layout.contentSize();
		}
		return this._lastMeasuredIntrinsicSize;
	},

	// #endregion


	// MARK: Delegate objects
	
	/**
	 * An optional delegate object that can receive various callbacks from the collection view.
	 */
	delegate: undefined, // <BMCollectionViewDelegate, nullable>
    
    /**
	 * A required data set object that specifies how many objects are in this collection view and configures their contents.
	 */
    _dataSet: undefined, // <BMCollectionViewDataSet>
    get dataSet() { return this._dataSet; },
    set dataSet(dataSet) {
	    //this.dataSetWillChangeToDataSet(dataSet);
	    
	    var oldDataSet = this._dataSet;
	    this._dataSet = dataSet;
	    
	    this.dataSetDidChangeFromDataSet(oldDataSet);
    },
    
    /**
	 * The collection view's container element.
	 */
    _container: undefined, // <BMJQueryShim>
    get container() { return this._container; },
    
    /**
	 * A callback that the collection view will invoke to test objects for identity.
	 * Two objects may refer to the same object even if they are not strictly equal.
	 * When performing full data set changes, this callback will be used by the collection view
	 * to compare objects between the current and the old data set to determine how the contents have changed.
	 * The callback takes two parameters that represent the two objects to compare and must return a truthy or falsy value
	 * indicating whether the objects are equal or not.
	 * This method may be redefined to customize the equality test.
	 * The default implementation tests for identity using the == operator.
	 */
    identityComparator: _BMCollectionViewIdentityComparator, // <Boolean ^ (nullable T, nullable T)>
    
    /**
	 * May be invoked to get the index path of an object at the given row within the given section.
	 * @param row <Int>						The object's index within the section.
	 * {
	 *	@param inSectionAtIndex <Int>		The section's index.
	 * }
	 * @return <BMIndexPath<T>, nullable>	The index path, or undefined if there is no object with the specified indexes.
	 */
    indexPathForObjectAtRow: function (row, options) {
	    return this._dataSet ? this._dataSet.indexPathForObjectAtRow(row, {inSectionAtIndex: options.inSectionAtIndex}) : undefined;
    },
    
    /**
	 * May be invoked to get the index path of an object within the data set.
	 * The object should be tested against the data set using the collection's view identity comparator,
	 * but the actual implementaion is delegated to the data set object.
	 * @param object <Object>				The object.
	 * @return <BMIndexPath<T>, nullable>	The index path, or undefined if the object is not part of the data set.
	 */
    indexPathForObject: function (object) {
	    return this._dataSet ? this._dataSet.indexPathForObject(object) : undefined;
    },
    
    /**
	 * May be invoked to get the number of sections in the data set.
	 * If there is no data set attached to this collection view, this method returns 0.
	 * @return <Int>					The object count.
	 */
    numberOfSections: function () {
	    return this._dataSet ? this._dataSet.numberOfSections() : 0;
    },
    
    /**
	 * May be invoked to get the number of objects in the specified section.
	 * If there is no data set attached to this collection view, this method returns 0.
	 * @param i <Int>					The section's index.
	 * @return <Int>					The object count.
	 */
	numberOfObjectsInSectionAtIndex: function (i) {
		return this._dataSet ? this._dataSet.numberOfObjectsInSectionAtIndex(i) : 0;	
	},
    
    /**
	 * The layout object managing this collection view's layout.
	 */
    _layout: undefined, // <BMCollectionViewLayout>
    get layout() { return this._layout; },
    set layout(layout) { 
		if (this.isUpdatingData) {
			var self = this;
			this.registerDataCompletionCallback(function () {
				self.layout = layout;
			});
			return;
		}

		if (BMAnimationContextGetCurrent()) {
			if (!this.initialized) {
				this._layout = layout || new BMCollectionViewFlowLayout(); 
				this._layout.collectionView = this; 
				return;
			}

			this.setLayout(layout || new BMCollectionViewFlowLayout);
		}
		else {
			this._layout = layout || new BMCollectionViewFlowLayout(); 
			this._layout.collectionView = this; 
			
			if (!this.initialized) return;
			
			this.invalidateLayout();
		}
	},
	
    // MARK: Managed attributes
    
    /**
	 * Animatable. The collection view's size and its position relative to its parent element.
	 */
    _frame: undefined, // <BMRect>
	get frame() { return this._frame; },
	set frame(frame) {
		// If this frame is assigned as part of a layout animation, don't perform any changes
		if (this._layoutAnimator) return Object.getOwnPropertyDescriptor(BMView.prototype, 'frame').set.call(this, frame);

		let requiresInit = false;

		// If this change causes collection view's size to change, ask the layout object if the the layout should be invalidated
		if (this._frame && !frame.size.isEqualToSize(this._frame.size) && this.initialized) {
			let needsInvalidation = this._layout.shouldInvalidateLayoutForFrameChange(frame);

			// If the frame is changed during an animated layout pass, run a layout update animation in sync
			if (BMAnimationContextGetCurrent()) {
				let oldFrame = this._frame;
				this._pendingFrame = frame;
				if (needsInvalidation) {
					if (this.layout.supportsCopying) {
						this.layout.beginUpdates();
						this.layout.applyUpdates();
					}
					else {
						this._frame = frame;
						this.invalidateLayout();
					}
				}
				this._frame = oldFrame;

				if (this.iScroll) BMAnimationContextAddCompletionHandler(() => {
					this.iScroll.refresh();
				})
			}
			else {
				this._frame = frame;
	    
				// Resize the bounds
				this._bounds.size.width = this._frame.size.width + 2 * this._offscreenBufferSize;
				this._bounds.size.height = this._frame.size.height + 2 * this._offscreenBufferSize;
				
				// Make sure the new bounds fit in the content, otherwise move them
				this._constrainBounds();
				
				if (needsInvalidation) {
					this.invalidateLayout();
				}
			}
		}
		else if (!this._frame) {

			this._frame = frame;

			if (this.initialized) {
				let needsInvalidation = this._layout.shouldInvalidateLayoutForFrameChange(frame);
			
				// Resize the bounds
				this._bounds.size.width = this._frame.size.width + 2 * this._offscreenBufferSize;
				this._bounds.size.height = this._frame.size.height + 2 * this._offscreenBufferSize;
				
				// Make sure the new bounds fit in the content, otherwise move them
				this._constrainBounds();
				
				if (needsInvalidation) {
					this.invalidateLayout();
				}
			}
		}

		if (this.__awaitsInit && this._frame.size.width > 0 && this._frame.size.height > 0) {
			requiresInit = true;
		}

		// Invoke view's setter to trigger the actual frame update
		Object.getOwnPropertyDescriptor(BMView.prototype, 'frame').set.call(this, frame);
		this._pendingFrame = undefined;

		if (!BMAnimationContextGetCurrent()) {
			if (this.iScroll) this.iScroll.refresh();
		}

		this._frame = frame;

		if (requiresInit) {
			this._init();
		}
	},
    
    /**
	 * The size of the content in the collection view.
	 */
	_size: undefined, // <BMRect>
	get size() { return this._size; },

	/**
	 * The node that contains all the collection view cells.
	 */
	_contentNode: undefined, // <DOMNode>
	get contentNode() {
		return this._contentNode;
	},

	__contentWrapper: undefined, // <BMJQueryShim>
	
	/**
	 * @deprecated Use `contentNode` instead.
	 * A jQuery wrapper around the container that contains all the collection view cells.
	 * Attempting to access this property will cause a warning message to appear in the console.
	 */
	get _contentWrapper() { // <BMJQueryShim>
		if (BM_DEPRECATION_WARN) {
			console.warn('Attempting to acess the _contentWrapper property which was deprecated. Consider using _contentNode instead and wrapping it using jQuery');
			if (BM_DEPRECATION_TRACE) console.trace();
		}
		return this.__contentWrapper;
	},
	set _contentWrapper(wrapper) {
		if (BM_DEPRECATION_WARN) {
			console.warn('Attempting to acess the _contentWrapper property which was deprecated. Consider using _contentNode instead and wrapping it using jQuery');
			if (BM_DEPRECATION_TRACE) console.trace();
		}
		this.__contentWrapper = wrapper;
		this._contentNode = wrapper[0];
	},
	get contentWrapper() { return this._contentWrapper; },
    
    /**
	 * The collection view's bounds, which represent the rect that is currently rendered on screen.
	 * The bounds's size usually depend on the frame's size and the off-screen buffer factor, and its coordinates are relative to the collection view's frame.
	 */
    _bounds: undefined, // <BMRect>
    get bounds() { return this._bounds; },
    
    /**
	 * The number of pixels by which to extend the bounds to preload layout attributes and render off-screen elements.
	 * Higher values will create more cells and reduce the flickering at high scroll speeds, but will use more memory and processing time.
	 */
    _offscreenBufferSize: 100, // <Int>
    
    /**
	 * The percentage of frame size to use when computing a new off-screen buffer size.
	 * Higher values will cause more off-screen elements to be rendered which decreases the flicker at high scrolling speeds.
	 * Lower values decrease the number of off-screen elements and should be used to reduce the jitter on iOS when complex layouts
	 * that reflow often are used as cell contents.
	 */
    offscreenBufferFactor: 0.5, // <Number>
    
    /**
	 * @deprecated Currently unused.
	 * The scrolling direction supported by this collection view.
	 */
	_scrollingDirection: BMCollectionViewScrollingDirection.Vertical, // <BMCollectionViewScrollingDirection>
	get scrollingDirection() {
		return this._scrollingDirection;
	},
	
	/**
	 * The cell cache contains unused cells, grouped by their reuse identifiers.
	 */
	cellCache: {}, // <Object<String, [BMCollectionViewCell]>>
	
	/**
	 * The supplementary view cache contains unused supplemetnary views, grouped by their reuse identifiers.
	 */
	supplementaryViewCache: {}, // <Object<String, [BMCollectionViewCell]>>
	
	/**
	 * The attributes cache contains cached attributes for all cells and supplementary views as they are requested.
	 * The attribute cache map keys are the containing rects. Whenever the layout is invalidated for any reason, the old pages are discarded.
	 */
	attributeCache: {}, // <Object<String, [BMCollectionViewLayoutAttributes]>>
	
	/**
	 * The list of retained cells. This only includes cells managed by the collection view.
	 */
	retainedCells: [], // <[BMCollectionViewCell]>
	
	/**
	 * The list of all retained cells, including those retained by the developer, outside the collection view's visible area.
	 */
	allCells: [], // <[BMCollectionViewCell]>
	
	/**
	 * Set to NO until this collection view first receives a valid data set and renders its first set of cells.
	 */
	initialized: NO, // <Boolean>
	
	/**
	 * If set to YES, this collection view will collect and create cells when scrolling.
	 * This property is only set to NO during animated updates while interactive scrolling is disabled.
	 */
	_collectionEnabled: YES, // <Boolean>
	
	/**
	 * Animatable. The exact scroll offset.
	 */
	get scrollOffset() { // <BMPoint>
		var offset = this._bounds.origin.copy();
		
		offset.x += this._offscreenBufferSize;
		offset.y += this._offscreenBufferSize;
		
		return offset;
	},
	set scrollOffset(offset) {
		this._scrollToOffset(offset);
	},

	/**
	 * The scrollbar size as used by the collection view.
	 * In most cases this value is platform dependent, but when using iScroll this value is always 0.
	 */
	get scrollBarSize() { // <Number>
		return this._usesIScroll ? 0 : BMScrollBarGetSize();
	},
	
	/**
	 * When auto-resize is enabled, this property is set to a unique identifier used for the window resize listener.
	 * Otherwise this property will be undefined.
	 */
	_autoResizeToken: undefined, // <void (^)(Event)>
	
	/**
	 * Controls whether this collection view handles resize events on its own automatically.
	 * When set to YES, the collection view will recalculate its frame whenever the window resizes.
	 * Otherwise you must invoke the resized() method whenever anything modifies the collection view's size.
	 * Note that even when this property is set to YES, you must also invoke the resized() method whenever
	 * this collection view's size changes for any reason other than the window resizing.
	 */
	get autoResizes() { // <Boolean>
		return this._autoResizeToken !== undefined;
	}, // <Boolean>
	set autoResizes(autoResizes) {
		if (this.autoResizes == autoResizes) return;
		
		if (autoResizes) {
			// If auto resize should be enabled, generate a new auto resize token
			var self = this;
			this._autoResizeToken = function (event) {
				self.resized();
			};
			
			// Then assign that token to the resize event
			window.addEventListener('resize', this._autoResizeToken);
		}
		else {
			// If auto resize should be disabled, clear the resize listener from window using the previous auto resize token then clear the auto resize token
			window.removeEventListener('resize', this._autoResizeToken);
			
			this._autoResizeToken = undefined;
		}
		
	},

	/**
	 * The default cell class that will be instantiated when new cells or supplementary views are created.
	 * Changing this property will not affect already created cells, but cells created afterwards
	 * will be instantiated from this class.
	 */
	_cellClass: BMCollectionViewCell, // <Class extends BMCollectionViewCell, nullResettable>
	get cellClass() { return this._cellClass; },
	set cellClass(cellClass) {
		this._cellClass = cellClass || BMCollectionViewCell;
	},

	/**
	 * A dictionary containing the classes to use when instantiating cells with different reuse identifiers.
	 */
	_cellClasses: undefined, // <Object<String, Class extends BMCollectionViewCell>>

	/**
	 * A layout queue that is shared by this collection view's cells.
	 */
	_cellLayoutQueue: undefined, // <BMViewLayoutQueue>
	
	get cellLayoutQueue() {
		return this._cellLayoutQueue;
	},
	set cellLayoutQueue(queue) {
		if (!queue) queue = BMViewLayoutQueue.layoutQueue();
		this._cellLayoutQueue = queue;

		this.enumerateAllCellsWithBlock(cell => {
			cell.layoutQueue = queue;
		});
	},

	/**
	 * Registers a class to be used when creating cells with the given reuse identifier.
	 * This does not affect already existing cells, but newly created cells with the given identifier will be created
	 * as instances of the given class.
	 * @param cellClass <Class extends BMCollectionViewCell, nullable>		The class to use. If this is set to <code>undefined</code>, the cells with this reuse identifier
	 * 																		will use the default class.
	 * {
	 * 	@param forReuseIdentifier <String>									The reuse identifier.
	 * }
	 */
	registerCellClass(cellClass, args) {
		this._cellClasses[args.forReuseIdentifier] = cellClass;
	},

	/**
	 * A dictionary containing the classes to use when instantiating supplementary views with different reuse identifiers.
	 */
	_supplementaryViewClasses: undefined, // <Object<String, Class extends BMCollectionViewCell>>

	/**
	 * Registers a class to be used when creating supplementary views with the given reuse identifier.
	 * This does not affect already existing supplementary views, but newly created supplementary views with the given identifier will be created
	 * as instances of the given class.
	 * @param supplementaryViewClass <Class extends BMCollectionViewCell, nullable>		The class to use. If this is set to <code>undefined</code>, 
	 * 																					the supplementary views with this reuse identifier will use the default class.
	 * {
	 * 	@param forReuseIdentifier <String>												The reuse identifier.
	 * }
	 */
	registerSupplementaryViewClass(supplementaryViewClass, args) {
		this._supplementaryViewClasses[args.forReuseIdentifier] = supplementaryViewClass;
	},

	// @override - BMView
	initWithDOMNode(node) {
		return BMView.prototype.initWithDOMNode.apply(this, arguments);
	},

	// @override - BMView
	set _activeVisibility(visibility) {
		// If initialization was delayed, perform it now if this collection view has a valid frame or is not
		// part of a view hierarchy
		if (visibility && this.__activeVisibility != visibility) {
			Object.getOwnPropertyDescriptor(BMView.prototype, '_activeVisibility').set.call(this, visibility);
			if (this.__awaitsInit) {
				if (this.superview) {
					if (this.frame && this.frame.size.width > 0 && this.frame.size.height > 0) {
						// Perform init upon becoming visible and acquiring a valid frame
						this._init();
					}
				}
				else {
					// Perform init upon becoming visible if not part of a view hierarchy
					this._init();
				}
			}
		}
		else {
			Object.getOwnPropertyDescriptor(BMView.prototype, '_activeVisibility').set.call(this, visibility);
		}
	},

    /**
	 * Should not be invoked manually. It is invoked by collection view to create the initial layout and cells.
	 */
    _init: function () {
		// If currently invisible, delay the init
		if (!this.__activeVisibility) {
			this.__awaitsInit = YES;
			return;
		}

		// If part of a view hierarchy and the frame is 0 size, delay the init until this collection is assigned a valid frame
		if (this.superview) {
			if (!this.frame || (this.frame.size.width == 0 || this.frame.size.height == 0)) {
				this.__awaitsInit = YES;
				return;
			}
		}

		this.__awaitsInit = NO;
		
		// TODO
		var useCustomScroll = (window.navigator.standalone && this.customScrollRequired === undefined) || this.customScrollRequired;

		// Android is weird about handling touch events, so iScroll is required for it
		if (/android/i.test(window.navigator.userAgent)) useCustomScroll = YES;

		//var useCustomScroll = (false && this.customScrollRequired === undefined) || this.customScrollRequired;
	    
	    this._prepareFrame();
	    
		this._createBounds();
		
		// TODO: Determine why iScroll is initialized later; this would cause the `scrollBarSize` property to return an incorrect value during the initial layout pass
		// Also check if creating iScroll early has a negative impact on other parts of the initialization
		if (useCustomScroll && !BM_COLLECTION_VIEW_DISABLE_ISCROLL) {
			this._usesIScroll = YES;
		}
		
		if (BM_SIMPLE_BENCH) {
			const date = Date.now();
			this._reloadLayout();
			alert(`[BMCollectionView] Initial layout took ${Date.now() - date}ms.`);
		}
		else {
			this._reloadLayout();
		}
	    
	    // Use custom scrolling only if specifically requested or if not specifically disabled and this collection view is running in iOS standalone web-app mode
	    if (useCustomScroll && !BM_COLLECTION_VIEW_DISABLE_ISCROLL) {
			this._container.css({'overflow-x': 'hidden', 'overflow-y': 'hidden'});
			this.customScroll = YES;
			
			this.offscreenBufferFactor = 0;

			BMAddSmoothMousewheelInteractionToNode(this._container[0]);
		    
		    this.iScroll = new IScroll(this._container[0], {
				mouseWheel: YES, scrollbars: YES, probeType: 3, click: NO, deceleration: 0.001, resizePolling: 999999999999, scrollX: YES, freeScroll: YES, interactiveScrollbars: !BMIsTouchDevice,
				disableMouse: YES, disablePointer: YES, fadeScrollbars: BMIsTouchDevice, HWCompositing: YES, bindToWrapper: YES, stopPropagation: YES, disableTouch: NO
			});
			
			var self = this;
			this.iScroll.on('scroll', function () {
				self._handleNewScrollFromEvent({x: -this.x, y: -this.y});
			});
	    }
	    else {
			// Attach the scroll listener to the container
			this._boundContainerDidScrollWithEvent = this.containerDidScrollWithEvent.bind(this);
			var useCapture = this._highFrequencyScrollingEnabled;
			this.container[0].addEventListener('scroll', this._boundContainerDidScrollWithEvent, {capture: useCapture, passive: YES});
		}

		let canScroll = NO;
		
		// This event handler prevents wheel events from propagating up to non-capturing listeners on parent elements
		// to avoid situations such as double-scrolling in nested scroll views
		this._container[0].addEventListener('wheel', event => {
			if (this._size.width > this._frame.size.width || this._size.height > this._frame.size.height) {
				event.stopPropagation();
			}
		});

		let trackedTouchIdentifier, initialPosition;
		let isScrolling = NO;
		
		// These event handlers prevent touch pan events from propagating up to non-capturing listeners on parent elements
		// to avoid situations such as double-scrolling in nested scroll views
		this._container[0].addEventListener('touchstart', event => {
			// Only track a single touch source
			if (trackedTouchIdentifier) return;

			canScroll = (this._size.width > this._frame.size.width || this._size.height > this._frame.size.height);

			// Only prevent propagating events like this if scrolling is possible
			if (canScroll) {
				trackedTouchIdentifier = event.changedTouches[0].identifier;
				initialPosition = BMPointMake(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
			}
		});

		this._container[0].addEventListener('touchmove', event => {
			// Only track a single touch source
			if (!trackedTouchIdentifier) return;

			// Look for the tracked touch
			let length = event.changedTouches.length;
			for (let i = 0; i < length; i++) {
				let trackedTouchIdentifier = event.changedTouches[i];
				if (trackedTouchIdentifier.identifier == trackedTouchIdentifier) {
					if (isScrolling) {
						event.stopPropagation();
					}
					else {
						// Check to see if touch begins a pan gesture, i f it does, stop propagation for the remainder of the gesture
						let touch = trackedTouchIdentifier;
						let currentPosition = BMPointMake(touch.clientX, touch.clientY);
						if (currentPosition.distanceToPoint(initialPosition) > _BMCollectionViewClickSlopeThreshold) {
							isScrolling = YES;
							event.stopPropagation();
						}
					}

					return;
				}
			}
		});

		let touchcancelHandler = event => {
			// Only track a single touch source
			if (!trackedTouchIdentifier) return;

			// Look for the tracked touch
			let length = event.changedTouches.length;
			for (let i = 0; i < length; i++) {
				let trackedTouchIdentifier = event.changedTouches[i];
				if (trackedTouchIdentifier.identifier == trackedTouchIdentifier) {
					// Reset the parameters as this signals the end of the pan event
					trackedTouchIdentifier = undefined;

					if (isScrolling) event.stopPropagation();
					isScrolling = NO;
					initialPosition = undefined;

					return;
				}
			}
		};

		this._container[0].addEventListener('touchcancel', touchcancelHandler);
		this._container[0].addEventListener('touchend', touchcancelHandler);
	    
	    // Run the intro animation if the delegate requests it
	    var shouldRunIntroAnimation = NO;
	    if (this.delegate && typeof this.delegate.collectionViewShouldRunIntroAnimation == 'function') {
		    shouldRunIntroAnimation = this.delegate.collectionViewShouldRunIntroAnimation(this);
	    }
	    
	    if (shouldRunIntroAnimation) {
			var visibleBounds = this._bounds.rectWithInset(BMInset.insetWithEqualInsets(this._offscreenBufferSize));

		    var animatedCells = this.retainedCells.slice();
		    var self = this;
		    
		    for (var i = 0; i < animatedCells.length; i++) {
				var cell = animatedCells[i];
				
				// Skip cells that do not intersect the actual visible bounds
				if (!visibleBounds.intersectsRect(cell.attributes.frame)) {
					animatedCells.splice(i, 1);
					i--;
				}
			    
			    var initialAttributes;
			    if (cell.attributes.itemType == BMCollectionViewLayoutAttributesType.Cell) {
				    initialAttributes = this.layout.initialAttributesForPresentedCellAtIndexPath(cell.indexPath, {withTargetAttributes: cell.attributes});
			    }
			    else if (cell.attributes.itemType == BMCollectionViewLayoutAttributesType.SupplementaryView) {
				    initialAttributes = this.layout.initialAttributesForPresentedSupplementaryViewWithIdentifier(cell.reuseIdentifier, {atIndexPath: cell.indexPath, withTargetAttributes: cell.attributes});
			    }
			    
			    initialAttributes.targetAttributes = cell.attributes;
			    cell.attributes = initialAttributes;
			    
		    }
		    
		    // Request the animation options from the delegate if it can provide them
		    var delegateOptions = {};
		    if (this.delegate && this.delegate.collectionViewAnimationOptionsForIntroAnimation) {
			    delegateOptions = this.delegate.collectionViewAnimationOptionsForIntroAnimation(this);
		    }
		    
		    BMAnimateWithBlock(function () {
			    for (var i = 0; i < animatedCells.length; i++) {
				    var cell = animatedCells[i];
				    cell.attributes = cell.attributes.targetAttributes;
			    }
		    }, BMExtend({
			    duration: _BMCollectionViewAnimationDurationDefault,
			    easing: _BMCollectionViewAnimationEasingDefault,
			    stride: _BMCollectionViewAnimationStrideDefault,
			    delay: 0
		    }, delegateOptions));
	    }
	    
	    this.initialized = YES;
	    
    },
    
    /**
	 * Should be invoked whenever anything in the layout has changed and no longer matches what collection view is displaying.
	 * This will cause the collection to reconstruct its layout.
	 * The layout may not be invalidated during an animated data change. If the collection view is currently running an animated data change,
	 * the layout will only be invalidated after that update completes.
	 * 
	 * If this method is invoked from within an animation context, this change will be animated. Note that if collection view is currently
	 * running a different animated update, this method will be applied after the animation context has finished and may be instant. If the layout
	 * invalidation is required to be animated, the current animation should be awaited prior to invoking this method.
	 */
    invalidateLayout: function () {
		if (!this.initialized) return;
		
		// Ignore this operation if the layout is in the process of being invalidated already
		if (this._blocksLayoutInvalidation) return;

		this._blocksLayoutInvalidation = YES;
	    
	    // Do not invalidate the layout during an animated data update
	    if (this.isUpdatingData) {
		    var self = this;
		    this.registerDataCompletionCallback(function () { self.invalidateLayout(); });
		    return;
		}
		
		// If the layout supports animated changes and an animation context is active, make this change animated
		let animation;
		if ((animation = BMAnimationContextGetCurrent()) && this.layout._copy) {
			let layout = this._layout;

			// Temporarily set a copy of the layout as the layout for this collection view
			this._layout = this._layout._copy;
			this._layout._collectionView = this;
			this._layout.prepareLayout();

			// Then transition back to the current layout with the updated properties
			return this.setLayout(layout, {animated: YES});
		}
	    
	    // Discard the cached attribute pages
	    this.attributeCache = {};
	    
		// Collect all the cells
		// This is no longer necessary as the render is now performed in exclusive mode
		// This should marginally improve performance as cells are no longer shuffled around during the invalidation
	    /*var retainedCellsLength = this.retainedCells.length;
	    for (var i = 0; i < retainedCellsLength; i++) {
		    // The retained cells array resizes itself when cells are removed
		    this.retainedCells[0]._unmanage();
	    }*/
	    
	    this.retainedCells = [];
	    
	    // Reload the layout
		this._reloadLayout();
		
		// Allow the layout to be invalidated
		this._blocksLayoutInvalidation = NO;
    },
    
    /**
	 * Should be invoked whenever parts of the layout have changed and no longer match what the collection view is displaying.
	 * This will cause the collection to reconstruct its layout.
	 * The layout may not be invalidated during an animated data change. If the collection view is currently running an animated data change,
	 * the layout will only be invalidated after that update completes.
	 * Currently this method is not implemented and simply calls `invalidateLayout()`.
	 * @param context <BMCollectionViewLayoutInvalidationContext>	The invalidation context describing what parts of the layout should be invalidated.
	 * {
	 *	@param animated <Boolean, nullable>							Defaults to NO. If set to YES, this change will be animated, otherwise it will be instant.
	 * }
	 */
    invalidateLayoutWithContext: function (context, args) {
	    this.invalidateLayout();
    },
    
    /**
	 * If this collection view is not part of a view hierarchy, this method must be invoked 
	 * whenever the DOM node managed by this collection view is resized.
	 */
    resized: function () {
	    // Ignore resize events until initialized as the frame and bounds are not prepared at this time
	    if (!this.initialized) return;
	    
	    // Do not perform any additional changes if this collection view's size doesn't actually change
	    if (this._frame.size.height == this._container.height() && this._frame.size.width == this._container.width()) return;
	    
	    // Do not invalidate the layout during an animated data update
	    if (this.isUpdatingData) {
		    var self = this;
		    this.registerDataCompletionCallback(function () { self.resized(); });
		    return;
	    }
	    
	    // Recalculate the frame
	    this._prepareFrame();
	    
	    // Resize the bounds
	    this._bounds.size.width = this._frame.size.width + 2 * this._offscreenBufferSize;
	    this._bounds.size.height = this._frame.size.height + 2 * this._offscreenBufferSize;
	    
		// Make sure the new bounds fit in the content, otherwise move them
		this._constrainBounds();
	    
	    // Check to see if the layout has to be invalidated for the new frame
	    var shouldInvalidateLayout = this._layout.shouldInvalidateLayoutForFrameChange(this._frame);
	    
	    if (shouldInvalidateLayout) {
		    this.invalidateLayout();
	    }
    },
    
    /**
	 * Invoked by collection view when it needs to recalculate its frame.
	 */
    _prepareFrame: function () {
	    
	    var offset = this._container.offset();
	    
	    // Compute the internal frame
	    this._frame = BMRectMake(offset.left, offset.top, this._container.width(), this._container.height());
	    
	    // When using custom scrolling, due to the way scrolling works, off-screen rendering is useless
	    // because scrolling and collection always happen in the same animation frame
	    this._offscreenBufferSize = this.customScroll ? 0 : Math.max(this._frame.size.width * this.offscreenBufferFactor, this._frame.size.height * this.offscreenBufferFactor);
	    
	    // When using the custom scroll view, it must be informed of the new frame size
	    // so it can correctly compute the scroll bounds
	    if (this.scrollView) this.scrollView.frame = this._frame;
	    
    },
    
    /**
	 * Invoked by collection view during initialization to create the initial bounds.
	 */
    _createBounds: function () {
	    // And the bounds; to keep objects from blinking while scrolling, the bounds should be larger than the frame
	    this._bounds = this._frame.copy();
	    this._bounds.size.width += 2 * this._offscreenBufferSize;
	    this._bounds.size.height += 2 * this._offscreenBufferSize;
	    this._bounds.origin.x = -this._offscreenBufferSize;
	    this._bounds.origin.y = -this._offscreenBufferSize;
	},
	
	/**
	 * Invoked by collection view to ensure that the bounds do not move off-screen.
	 */
	_constrainBounds: function () {
		var bounds = this._bounds;
		// Ensure that the bounds do not move too far to the right
	    if (bounds.right > this._size.width + this._offscreenBufferSize) {
		    bounds.origin.x = this._size.width - this._frame.size.width - this._offscreenBufferSize;
		    bounds.origin.x = Math.max(bounds.origin.x, -this._offscreenBufferSize);
		}
		// Ensure that the bounds do not move too far to the left
		if (bounds.origin.x < -this._offscreenBufferSize) {
			bounds.origin.x = -this._offscreenBufferSize;
		}
	    
		// Ensure that the bounds do not move too far to the top
	    if (bounds.bottom > this._size.height + this._offscreenBufferSize) {
		    bounds.origin.y = this._size.height - this._frame.size.height - this._offscreenBufferSize;
		    bounds.origin.y = Math.max(bounds.origin.y, -this._offscreenBufferSize);
	    }
		// Ensure that the bounds do not move too far to the bottom
		if (bounds.origin.y < -this._offscreenBufferSize) {
			bounds.origin.y = -this._offscreenBufferSize;
		}
	},

	/**
	 * Should be invoked by layout objects when the content size changes, but no other aspect of the layout does.
	 */
	invalidateContentSize() {
		// If an update is in progress, ignore this
		if (!this._collectionEnabled) return;

	    var size = this._layout.contentSize();
	    
	    // Avoid size changes if the size doesn't actually change
	    if (!size.isEqualToSize(this._size)) {
		    this._size = size.copy();
		    // Resize the content wrapper
		    BMHook(this._contentWrapper[0], {width: this._size.width + 'px', height: this._size.height + 'px'});
	    
			// Make sure the new bounds fit in the content, otherwise move them
			this._constrainBounds();
	    
		    // Force the scrollbars to appear or disappear depending on how the content size is relative to frame's size
		    this._applyOverflows();
	    
	    }
	},
    
    /**
	 * Do not invoke manually. Invoked by collection view itself in response to a bounds change invalidation request.
	 */
    invalidateLayoutForBoundsChange: function () {
	    if (!this.initialized) return;
		
		// Ignore this operation if the layout is in the process of being invalidated already
		if (this._blocksLayoutInvalidation) return;

		this._blocksLayoutInvalidation = YES;
	    
	    // Discard the cached attribute pages
	    this.attributeCache = {};
	    
	    this._layout.prepareLayout();
	    
	    this.invalidateContentSize();
	    
	    // Request the layout page
	    var attributes = this._requestAttributesInRect(this._bounds.copy());
	    
	    // Create and render the layout elements
		this._renderCellsWithAttributes(attributes, {exclusive: YES});
		
		this._blocksLayoutInvalidation = NO;
		
    },
    
    /**
	 * Invoked by the collection view during a layout invalidation to recreate its layout.
	 */
    _reloadLayout: function () {

		let needsContentWrapper = !this._contentWrapper;

		if (needsContentWrapper) {
			const contentWrapperNode = document.createElement('div');
			contentWrapperNode.style.cssText = "width: 900px; height: 900px; overflow: hidden; position: absolute; left: 0px; top: 0px;";
	    	this._contentWrapper = BMJQueryShim.shimWithDOMNode(contentWrapperNode);
			this._container.append(this._contentWrapper);
		}
	    
	    this._layout.prepareLayout();
	    
	    // Create the content wrapper which has all the cells, if it doesn't already exist
	    this._size = this._layout.contentSize().copy();
	    
	    if (this.scrollView) this.scrollView.size = this._size;
	    
	    if (needsContentWrapper) {
		    BMHook(this._contentWrapper[0], {width: this._size.width + 'px', height: this._size.height + 'px'});
	    }
	    else {
		    // Otherwise just resize it
		    BMHook(this._contentWrapper[0], {width: this._size.width + 'px', height: this._size.height + 'px'});
	    }
	    
		// Make sure the new bounds fit in the content, otherwise move them
		this._constrainBounds();
	    
	    // TODO handle the origin becoming negative
	    
	    // Force the scrollbars to appear or disappear depending on how the content size is relative to frame's size
	    this._applyOverflows();
	    
	    // Request the initial layout page
	    var attributes = this._requestAttributesInRect(this._bounds.copy());
	    
	    // Create and render the layout elements
		this._renderCellsWithAttributes(attributes, {exclusive: YES});

		// Dequeue the cell layout queue to prevent delayed layouts and minimize visual artifacts
		this._cellLayoutQueue.dequeue();
		
	},
    
    /**
	 * Invoked by the collection view to apply the correct overflow values to the container.
	 */
    _applyOverflows: function () {
	    if (this.customScroll) {
		    
		    if (this.iScroll) {
			    this.iScroll.refresh();
		    	return;
		    }
		    
		    this.scrollView.canScrollHorizontally = this._size.width > this._frame.size.width;
		    this.scrollView.canScrollVertically = this._size.height > this._frame.size.height;
		    
		    if (this.initialized) return;
		    this._container.css({'overflow-x': 'hidden', 'overflow-y': 'hidden'});
		    return;
	    }
	    
	    if (this._size.width <= this._frame.size.width) {
		    this._container.css('overflow-x', 'hidden');
	    }
	    else {
		    this._container.css('overflow-x', 'scroll');
	    }
	    
	    if (this._size.height <= this._frame.size.height) {
		    this._container.css('overflow-y', 'hidden');
	    }
	    else {
		    this._container.css('overflow-y', 'scroll');
	    }
    },
    
    /**
	 * Constructs and returns a correctly aligned and sized request rect that includes the given rect's origin point.
	 * If this rect has its origins outside the content bounds, this method returns nothing.
	 * @param rect <BMRect>			The rect.
	 * @return <BMRect, nullable>	A rect.
	 */
    _alignedRequestRectWithRect: function (rect) {
	    return this._alignedRequestRectWithPoint(rect.origin);
    },
    
    
    /**
	 * Constructs and returns a correctly aligned and sized request point that represents the origin of the request rect that includes the given point.
	 * @param point <BMPoint>			The point.
	 * @return <BMPoint>								A point.
	 */
    _alignedRequestOriginWithPoint: function (point) {
	    // The points are aligned to integer multiples of the bounds size
	    // Because the origin point of the first aligned request point is not (0, 0), the points are first shifted by the offscreen buffer size,
	    // then aligned and finally shifted back
	    var x = (((point.x + this._offscreenBufferSize) / this._bounds.size.width) | 0) * this._bounds.size.width - this._offscreenBufferSize;
	    var y = (((point.y + this._offscreenBufferSize) / this._bounds.size.height) | 0) * this._bounds.size.height - this._offscreenBufferSize;
	    
	    return BMPointMake(x, y);
    },
    
    /**
	 * Constructs and returns a correctly aligned and sized request rect that includes the given point.
	 * If this point is outside the content bounds, this method returns undefined.
	 * @param point <BMPoint>			The point.
	 * @return <BMRect, nullable>						A rect.
	 */
    _alignedRequestRectWithPoint: function (point) {
	    if (point.x < -this._offscreenBufferSize || point.y < -this._offscreenBufferSize || point.x > this._size.width || point.y > this._size.height) return undefined;
	    
	    return new BMRect(this._alignedRequestOriginWithPoint(point), this._bounds.size);
    },
    
    /**
	 * Requests and returns attributes from the given rect from the layout object.
	 * @param rect <BMRect>								The rect.
	 * @return <[BMCollectionViewLayoutAttributes]>		The cell attributes.
	 */
    _requestAttributesInRect: function (rect) {
	    var attributes = this._layout.attributesForElementsInRect(rect);
	    
	    // Cache the attribute pages
	    this.attributeCache[rect.origin.integerStringValue] = {key: rect, value: attributes};
	    
	    return attributes;
    },
    
    /**
	 * Defaults to NO. When set to YES, the collection view will handle scroll events during the capture phase and process them as soon as they appear.
	 * This property should be enabled for layouts that modify their contents based on the scroll position.
	 * When this property is disabled, the collection view will batch scroll events and handle them once for each animation frame.
	 */
    _highFrequencyScrollingEnabled: NO, // <Boolean>
    
    get highFrequencyScrollingEnabled() {
	    return this._highFrequencyScrollingEnabled;
	},
	
	set highFrequencyScrollingEnabled(highFrequencyScrollingEnabled) {
		// Don't perform any changes if the value doesn't actually change
		var currentValue = this._highFrequencyScrollingEnabled;
		if (currentValue == highFrequencyScrollingEnabled);
		
		this._highFrequencyScrollingEnabled = highFrequencyScrollingEnabled;
		
		// Also don't perform any changes if the collection view isn't initialized yet
		if (!this.initialized || this.iScroll) return;
		
		// Unregister the event listener, then register it again using capture as needed
		this.container[0].removeEventListener('scroll', this._boundContainerDidScrollWithEvent, {capture: currentValue, passive: YES});
		this.container[0].addEventListener('scroll', this._boundContainerDidScrollWithEvent, {capture: highFrequencyScrollingEnabled, passive: YES});
		
	},
    
    /**
	 * Should not be invoked manually. Invoked whenever the container scrolls.
	 * This method schedules collection on the next animation frame if it wasn't already scheduled.
	 * @param event <$event>		The jQuery event that triggered this scroll.
	 * @return <Boolean, nullable>	If set to NO, the event will not propagate or trigger the default actions.
	 */
    containerDidScrollWithEvent: function (event) {
	    if (!this._collectionEnabled) return;
	    
	    // If high frequency scrolling is enabled, immediately fire the scroll event handler
	    if (this._highFrequencyScrollingEnabled) return this._handleNewScrollFromEvent(event);
	    
	    // Otherwise schedule it for the next animation frame
	    if (!this.didRequestScrollAnimationFrame) {
		    this.didRequestScrollAnimationFrame = YES;
		    window.requestAnimationFrame(this._handleNewScrollFromEvent.bind(this, event));
	    }
    },
    
    /**
	 * Should not be invoked manually. Invoked on every animation frame while the container is scrolling.
	 * This method collects all off-screen cells and renders new cells for items that appear on screen as the bounds change.
	 * @param event <$event>		The jQuery event that triggered this scroll.
	 */
    _handleNewScrollFromEvent: function (event) {
		this.didRequestScrollAnimationFrame = NO;
		
		if (!this._collectionEnabled) return;
		    
	    // Compute the new bounds
		var containerNode = this._container[0];
		
		// When snapping, retain the previous scoll position so that the scroll direction can be computed
		var snapsScrollPosition = (!this._isPerformingAnimatedScrolling) && this._layout.snapsScrollPosition;
		var previousBoundsOffset;
		previousBoundsOffset = this._bounds.origin.copy();
		    
		if (this.customScroll) {
		    this._bounds.origin.x = event.x - this._offscreenBufferSize;
		    this._bounds.origin.y = event.y - this._offscreenBufferSize;
		}
		else {
		    this._bounds.origin.x = Math.max(-this._offscreenBufferSize, containerNode.scrollLeft - this._offscreenBufferSize);
		    this._bounds.origin.y = Math.max(-this._offscreenBufferSize, containerNode.scrollTop - this._offscreenBufferSize);
		}
		
		// Don't process this event if the scrolling position didn't actually change
		if (previousBoundsOffset.x == this._bounds.origin.x && previousBoundsOffset.y == this._bounds.origin.y) {
			return;
		}

		// Dequeue the layout queue after a minimal delay to minimize visual artifacts
		(async () => {
			await 0;
			this._cellLayoutQueue.dequeue();
		})();
		
		
		// Invalidate the layout if the layout object requires invalidation when the bounds change
		if (this._layout.shouldInvalidateLayoutForBoundsChange(this._bounds)) {
			this.invalidateLayoutForBoundsChange();
		
			// Let the delegate know that the bounds were updated
			if (this.delegate && typeof this.delegate.collectionViewBoundsDidChange == 'function') {
				this.delegate.collectionViewBoundsDidChange(this, this._bounds);
			}
			
			// Let the layout know that the invalidation was successful.
			this._layout.didInvalidateLayoutForBoundsChange();

			// Prepare to request and apply the snapping offset from the layout
			snapsScrollPosition && this._prepareForSnappingScrollOffsetWithPreviousOffset(previousBoundsOffset);

			return;
		}
	    
	    // Release the cells that no longer intersect the visible area
	    for (var i = 0; i < this.retainedCells.length; i++) {
		    var cell = this.retainedCells[i];
		    if (!cell.attributes.frame.intersectsRect(this._bounds)) {
			    cell._unmanage();
			    i--;
		    }
	    }
	    
	    // Find out if it is required to request new pages for this scrolling position
	    
	    	    
	    // Find the cached pages that intersect the new bounds
	    var pages = [];
	    
	    var TLPageOrigin = this._alignedRequestOriginWithPoint(this._bounds.origin);
	    var TLPage = this.attributeCache[TLPageOrigin.integerStringValue];
	    if (TLPage) pages.push(TLPage);
	    
	    // If the top-left page has the same origin as the bounds, no other pages are needed to render the bounds' content
	    if (!TLPageOrigin.isEqualToPoint(this._bounds.origin)) {
		    // Otherwise, one or three additional pages are needed, depending on whether the top-left page's origin intersects any edge of the bounds
		    
		    if (TLPageOrigin.x == this._bounds.origin.x) {
			    // If the left positions are identical, only the bottom-left page is needed
			    var BLPageOrigin = TLPageOrigin;
			    BLPageOrigin.y += this._bounds.size.height;
			    var BLPage = this.attributeCache[BLPageOrigin.integerStringValue];
			    if (BLPage) pages.push(BLPage);
		    }
		    else if (TLPageOrigin.y == this._bounds.origin.y) {
			    // If the top positions are identical, only the top-right page is needed
			    var TRPageOrigin = TLPageOrigin;
			    TRPageOrigin.x += this._bounds.size.width;
			    var TRPage = this.attributeCache[TRPageOrigin.integerStringValue];
			    if (TRPage) pages.push(TRPage);
		    }
		    else {
			    // Otherwise the top-right, bottom-left and bottom-right pages are all needed
			    // Bottom-left page
			    BLPageOrigin = TLPageOrigin.copy();
			    BLPageOrigin.y += this._bounds.size.height;
			    BLPage = this.attributeCache[BLPageOrigin.integerStringValue];
			    if (BLPage) pages.push(BLPage);
			    
			    // Top-right page
			    TRPageOrigin = TLPageOrigin;
			    TRPageOrigin.x += this._bounds.size.width;
			    TRPage = this.attributeCache[TRPageOrigin.integerStringValue];
			    if (TRPage) pages.push(TRPage);
			    
			    // Bottom-right page
			    var BRPageOrigin = BLPageOrigin;
			    BRPageOrigin.x += this._bounds.size.width;
			    var BRPage = this.attributeCache[BRPageOrigin.integerStringValue];
			    if (BRPage) pages.push(BRPage);
		    }
		    
	    }
	    
	    var pagesLength = pages.length;
	    
	    // Each page will be subtracted from the remaining rects
	    // If there are no rects left after the loop, the cached attribute pages are sufficient for the entire bounds
	    // Otherwise, more pages have to be requested.
	    var remainingRects = [this._bounds];
	    
	    for (var j = 0; j < pagesLength; j++) {
		    var attributes = pages[j].value;
		    var rect = pages[j].key;
		    
		    this._renderCellsWithAttributes(attributes);
		    
		    // Slice the remaining rects with this rect to find out the remaining area not covered by cached attribute rects
		    var rects = [];
		    for (var i = 0; i < remainingRects.length; i++) {
			    var slicedRects = remainingRects[i].rectsWithDifferenceFromRect(rect);
			    if (slicedRects) {
				    rects = rects.concat(slicedRects);
			    }
		    }
		    
		    remainingRects = rects;
	    }
	    
	    // If there were no pages, this has to be treated separately because in most cases, up to four new pages have to be requested
	    // and there is nothing to slice the bounds rect with.
	    if (!pagesLength) {
		    remainingRects = [];
		    var TLRect = this._alignedRequestRectWithPoint(this._bounds.origin);
		    
		    // If the bounds are exactly an aligned request rect, no other rects are needed
		    if (TLRect.isEqualToRect(this._bounds)) {
				var attributes = this._requestAttributesInRect(TLRect);
				this._renderCellsWithAttributes(attributes);
		    }
		    else {
			    // If the bounds are aligned vertically or horiztonally, only two rects are needed
			    if (TLRect.origin.x == this._bounds.origin.x) {
				    var BLRect = this._alignedRequestRectWithPoint({x: TLRect.origin.x, y: TLRect.bottom + 1});
				    
					var attributes = this._requestAttributesInRect(TLRect);
					this._renderCellsWithAttributes(attributes);
					
					if (BLRect) {
						attributes = this._requestAttributesInRect(BLRect);
						this._renderCellsWithAttributes(attributes);
					}
			    }
			    else if (TLRect.origin.y == this._bounds.origin.y) {
				    var TRRect = this._alignedRequestRectWithPoint({x: TLRect.right + 1, y: TLRect.origin.y});
				    
					var attributes = this._requestAttributesInRect(TLRect);
					this._renderCellsWithAttributes(attributes);
					
					if (TRRect) {
						attributes = this._requestAttributesInRect(TRRect);
						this._renderCellsWithAttributes(attributes);
					}
			    }
			    // Otherwise, all four rects are needed
			    else {
					remainingRects.push(TLRect);
					
					var BLRect = this._alignedRequestRectWithPoint({x: TLRect.origin.x, y: TLRect.bottom + 1});
					if (BLRect) remainingRects.push(BLRect);
					
					var TRRect = this._alignedRequestRectWithPoint({x: TLRect.right + 1, y: TLRect.origin.y});
					if (TRRect) remainingRects.push(TRRect);
					
					var BRRect = this._alignedRequestRectWithPoint({x: TLRect.right + 1, y: TLRect.bottom + 1});
					if (BRRect) remainingRects.push(BRRect);
					
					for (var i = 0; i < remainingRects.length; i++) {
						var attributes = this._requestAttributesInRect(remainingRects[i]);
						this._renderCellsWithAttributes(attributes);
					}
			
			    }
		    }
		
			// Let the delegate know that the bounds were updated
			if (this.delegate && typeof this.delegate.collectionViewBoundsDidChange == 'function') {
				this.delegate.collectionViewBoundsDidChange(this, this._bounds);
			}
		    

			// Prepare to request and apply the snapping offset from the layout
			snapsScrollPosition && this._prepareForSnappingScrollOffsetWithPreviousOffset(previousBoundsOffset);

		    return;
	    }

		// Request attributes for the remaining pages and render them
		if (remainingRects) {
			for (var i = 0; i < remainingRects.length; i++) {
				var requestRect = this._alignedRequestRectWithRect(remainingRects[i]);
				
				if (!requestRect) continue;
				
				var attributes = this._requestAttributesInRect(requestRect);
				this._renderCellsWithAttributes(attributes);
			}
		}
		
		
		// Let the delegate know that the bounds were updated
		if (this.delegate && typeof this.delegate.collectionViewBoundsDidChange == 'function') {
			this.delegate.collectionViewBoundsDidChange(this, this._bounds);
		}

		// Prepare to request and apply the snapping offset from the layout, unless the collection view is performing an
		// automated scrolling animation
		if (!this._isPerformingAnimatedScrolling) {
			snapsScrollPosition && this._prepareForSnappingScrollOffsetWithPreviousOffset(previousBoundsOffset);
		}

	    
	},

	/**
	 * The token for the current timeout monitoring scroll events.
	 * When the timeout fires, the collection view will request and apply the snapping scroll offset from the layout object.
	 */
	_snappingScrollToken: undefined, // <TimeoutToken, nullable>
	
	/**
	 * Invoked internally to prepare to snap the scroll position to a layout-defined snapping offset.
	 * @param previousOffset <BMPoint>			The previous bounds offset, used to determine the terminal scrolling direction.
	 */
	_prepareForSnappingScrollOffsetWithPreviousOffset: function (previousOffset) {
		if (this._snappingScrollToken) window.clearTimeout(this._snappingScrollToken);

		var self = this;
		this._snappingScrollToken = window.setTimeout(function () {
			var horizontalScrollDirection = Math.max(-1, Math.min(1, previousOffset.x - self._bounds.origin.x));
			var verticalScrollingDirection = Math.max(-1, Math.min(1, previousOffset.y - self._bounds.origin.y));

			var snappingOffset = self.layout.snappingScrollOffsetForScrollOffset(self.scrollOffset, {withVerticalDirection: verticalScrollingDirection, horizontalDirection: horizontalScrollDirection});

			// Disable interaction while performing the automated scroll
			BMAnimateWithBlock(_ => {
				self.scrollOffset = snappingOffset;
			}, {duration: 200});
		}, _BMCollectionViewSnappingScrollThreshold);
	},
    
    /**
	 * Renders the cells corresponding to the attributes in the given array.
	 * @param attributes <[BMCollectionViewLayoutAttributes]>		The array of attributes.
	 * {
	 *	@param exclusive <Boolean, nullable>						Defaults to NO. If set to YES, all other cells not in the attributes array will be unmanaged.
	 * }
	 */
    _renderCellsWithAttributes: function (attributes, options) {
		var attributesLength = attributes.length;
		
		options = options || {};
		var exclusive = options.exclusive || NO;
		    
    	// Iterate through the attributes and render the cells that are missing
	    for (var i = 0; i < attributesLength; i++) {
		    var attribute = attributes[i];
		    var cell;
		    
		    // Skip those elements that are outside the bounds
		    if (!attribute.frame.intersectsRect(this._bounds)) continue;
		    
		    // Skip creating those elements that are already rendered and managed
		    if (cell = this.cellAtIndexPath(attribute.indexPath, {ofType: attribute.itemType, withIdentifier: attribute.identifier})) {
			    if (!cell.isManaged) {
					// If the cell exists but is unmanaged, apply the new attributes to it and take ownership of it
					// unless the attributes mark the cell as hidden, in which case the collection view will not acquire ownership
					// but will still apply the attributes to the cell, which will hide it from the layout while maintaining its current ownership
					if (!attribute.isHidden) {
						cell._manage();
					}
					cell.attributes = attribute;
				}
				else {
					// Otherwise just apply the attributes if they are different
					if (cell.attributes !== attribute) {
						if (attribute.isHidden) {
							// If the attributes mark the cell as hidden, release ownership of the cell
							cell._unmanage();

							// If the cell is still retained, apply the attributes, which will hide the cell
							if (cell.isRetained) {
								cell.attributes = attribute;
							}
						}
						else {
							// If the current cell attributes were hidden, the cell wouldn't be managed
							cell.attributes = attribute;
						}
					}
				}
				
				// If this render is exclusive, mark this cell as rendered
				if (exclusive) cell._exclusivelyRendered = YES;
				
				continue;
			}

			// If the attributes are hidden and the cell isn't already in the layout, skip creating the cell
			if (attribute.isHidden) continue;
		    
		    // Request the content from the data set
		    if (attribute.itemType === BMCollectionViewLayoutAttributesType.Cell) {
			    // Update the index path prior to requesting the new cell to ensure that it points to the correct object
			    var indexPath = this.indexPathForObjectAtRow(attribute.indexPath.row, {inSectionAtIndex: attribute.indexPath.section});
			    attribute.indexPath = indexPath;
			    
			    cell = this._dataSet.cellForItemAtIndexPath(indexPath);
		    }
		    else if (attribute.itemType === BMCollectionViewLayoutAttributesType.SupplementaryView) {
			    cell = this._dataSet.cellForSupplementaryViewWithIdentifier(attribute.identifier, {atIndexPath: attribute.indexPath});
		    }
		    
		    // The attributes should silently apply themselves to the cell
		    cell.attributes = attribute;
		    
		    // Retain the cell; it should ask the collection view to render itself
		    cell._manage();
				
			// If this render is exclusive, mark this cell as rendered
			if (exclusive) cell._exclusivelyRendered = YES;
		    
	    }
	    
	    if (!exclusive) return;
	    
	    // If this render is exclusive, unmanage all other cells
		var allCellsLength = this.allCells.length;
		for (var i = 0; i < allCellsLength; i++) {
			var cell = this.allCells[i];
			
			if (cell._exclusivelyRendered) {
				// If the cell was exclusively rendered, it should left alone
				cell._exclusivelyRendered = undefined;
				continue;
			}
			
			// Otherwise it should be unmanaged
			if (cell.isManaged) cell._unmanage();
			
			// If the cell was retained, the new attributes should be requested and applied
			if (cell.retainCount > 0) {
				if (cell.itemType === BMCollectionViewLayoutAttributesType.Cell) {
					// Request and apply the new attributes for this cell
					var attributes = this._layout.attributesForCellAtIndexPath(cell.indexPath);
					cell.attributes = attributes;
				}
				else if (cell.itemType === BMCollectionViewLayoutAttributesType.SupplementaryView) {
					// Request and apply the new attributes for this supplementary view
					var attributes = this._layout.attributesForSupplementaryViewWithIdentifier(cell.reuseIdentifier, {atIndexPath: cell.indexPath});
					cell.attributes = attributes;
				}
			}
			else {
				// Otherwise the size of the all cells array changes and the index should be modified to account for this change
				i--;
				allCellsLength--;
			}
		}
		    
	},
	

	
	
	//#region Cell Measurement
	/************************************* CELL MEASUREMENT ********************************/

	/**
	 * An array that temporarily holds cells that are being measured.
	 */
	_measuringCells: undefined, // <[BMCollectionViewCell], nullable>

	/**
	 * Invoked internally by collection view prior to executing operations which are likely to cause cells to be measured 
	 * and then be displayed in the layout. Temporarily retains cells that are being measured to prepare them for being managed by the layout.
	 */
	_retainMeasuringCells() {
		this._measuringCells = [];
	},

	/**
	 * Invoked internally by collection view after executing operations which are likely to cause cells to be measured
	 * and then be displayed in the layout. Releases all cells that have been measured by not subsequently displayed in the layout.
	 */
	_releaseMeasuringCells() {
		if (this._measuringCells) {
			this._measuringCells.forEach(cell => cell.release());
		}

		this._measuringCells = undefined;
	},
	
	/**
	 * A dictionary containing the cached measured sizes of cells.
	 */
	_measures: undefined, // <Dictionary<BMSize>>


	/**
	 * An array that contains the cached measured sizes of cells when the data set does not implement the
	 * `identifierForIndexPath(_)` method.
	 */
	_measuredIndexPaths: undefined, // <[{indexPath: BMIndexPath, size: BMSize}]>

	
	/**
	 * Invoked by collection view during an update to refresh the index paths of the measured cells.
	 * This method is only invoked if the data set object does not implement the `identifierForIndexPath(_)` method.
	 * Index paths that are no longer in the data set will be removed and all other index paths will be updated
	 * to the correct section and row indexes.
	 */
	_updateMeasuredCellsIndexPaths: function () {
		var oldMeasures = this._measuredIndexPaths;
		this._measuredIndexPaths = [];
		
		var oldMeasuresLength = oldMeasures.length;
		for (var i = 0; i < oldMeasuresLength; i++) {
			var indexPath = this.dataSet.indexPathForObject(oldMeasures[i].indexPath.object);
			
			if (indexPath) {
				oldMeasures[i].indexPath = indexPath;
				this._measuredIndexPaths.push(oldMeasures[i]);
			}
		}
	},

	/**
	 * When invoked, this causes collection view to clear out the cached measurement for all previously measured cells. 
	 * Subsequent requests to retrieve any cell's size will cause collection view to run a synchronous layout pass.
	 */
	invalidateMeasuredSizeOfCells() {
		this._measuers = {};
		this._measuredIndexPaths = [];
	},

	/**
	 * When invoked, this causes collection view to clear out the cached measurement for cells that match a given condition. 
	 * The condition is evaluated using the specified block which will be invoked once for each previously measured cell.
	 * Subsequent requests to retrieve those cells' sizes will cause collection view to run a synchronous layout pass.
	 * @param block <Boolean ^(BMSize, nullable BMIndexPath<T>, nullable String)>			
	 * 										The block to execute for each previously measured cell.
	 * 										The block should return `YES` to invalidate the measurement or `NO` to retain it.
	 * 										It takes the following parameters:
	 * 										 * size: BMSize					The measured size.
	 * 										 * indexPath: BMIndexPath		The index path of the measured cell, if available.
	 * 																		When the data set object supports identifiers, this parameter will be undefined.
	 * 										 * identifier: String			The identifier of the measured cell, if available.
	 * 																		If the data set object does not support identifiers, 
	 * 																		this parameter will be undefined.
	 */
	invalidateMeasuredSizeOfCellsWithBlock(block) {
		if (this._dataSet.identifierForIndexPath) {
			let identifiersToInvalidate = [];

			for (let key in this._measures) {
				if (block(this._measures[key], undefined, key)) {
					identifiersToInvalidate.push(key);
				}
			}

			for (let key of identifiersToInvalidate) {
				delete this._measures[key];
			}
		}
		else {
			let length = this._measuredIndexPaths.length;
			for (let i = 0; i < length; i++) {
				if (block(this._measuredIndexPaths[i].size, this._measuredIndexPaths[i].indexPath)) {
					this._measuredIndexPaths.splice(i, 1);
					length--;
					i--;
				}
			}
		}
	},

	/**
	 * When invoked, this causes collection view to clear out the cached measurement for the cell at the given
	 * index path. Subsequent requests to retrieve the cell's size will cause collection view to run a synchronous layout pass.
	 * @param indexPath <BMIndexPath<T>>			The index path of the cell whose cached measurement shuold be cleared.
	 */
	invalidateMeasuredSizeOfCellAtIndexPath(indexPath) {
		let identifier;
		if (this._dataSet.identifierForIndexPath) {
			identifier = this._dataSet.identifierForIndexPath(indexPath);

			if (this._measures[identifier]) delete this._measures[identifier];
		}
		else {
			let length = this._measuredIndexPaths.length;
			for (let i = 0; i < length; i++) {
				let measure = this._measuredIndexPaths[i];
				if (measure.indexPath.isEqualToIndexPath(indexPath, {usingComparator: this.identityComparator})) {
					this._measuredIndexPaths.splice(i, 1);
					break;
				}
			}
		}
	},

	/**
	 * Computes and caches the measured sizes of the cells at the given index paths. This may cause collection view to bind multiple cells
	 * to the given index paths and run a synchronous layout pass on its root view.
	 * After this measurement, collection view will cache this size and return it directly when invoking `measuredSizeOfCellAtIndexPath(_)`. 
	 * To obtain new measurements, it is required to invoke `invalidateMeasuredSizeOfCellAtIndexPath(_)` on each cell prior to invoking this method.
	 * This operation will raise an error if any cell at one of the specified index paths has no subviews that can be measured.
	 * @param indexPaths <[BMIndexPath<T>]>			The index paths of the cell whose size should be measured.
	 */
	measureSizesOfCellsAtIndexPaths(indexPaths) {
		const queue = BMViewLayoutQueue.layoutQueue();
		const iterators = indexPaths.map(p => this._measuredSizeOfCellAtIndexPathGenerator(p, {layoutQueue: queue, dequeue: NO}));

		iterators.forEach(i => i.next());
		queue.dequeue();
		iterators.forEach(i => i.next());
	},

	/**
	 * Computes and returns the measured size of the cell at the given index path. This may cause collection view to bind a cell
	 * to the given index path and run a synchronous layout pass on its root view.
	 * After the initial measurement, collection view will cache this size and return it directly for subsequent requests. To obtain a new
	 * measurement, it is required to invoke `invalidateMeasuredSizeOfCellAtIndexPath(_)` prior to invoking this method.
	 * This operation will raise an error if the cell at the specified index path has no subviews that can be measured.
	 * @param indexPath <BMIndexPath<T>>			The index path of the cell whose size should be measured.
	 * @return <BMSize>								The measured size.
	 */
	measuredSizeOfCellAtIndexPath(indexPath) {
		const iterator = this._measuredSizeOfCellAtIndexPathGenerator(indexPath, {layoutQueue: BMViewLayoutQueue.layoutQueue(), dequeue: YES});
		while (YES) {
			const result = iterator.next();
			if (result.done) return result.value;
		}

		// Return the cached size if it is available.
		let identifier;
		if (this._dataSet.identifierForIndexPath) {
			identifier = this._dataSet.identifierForIndexPath(indexPath);

			if (this._measures[identifier]) return this._measures[identifier];
		}
		else {
			let length = this._measuredIndexPaths.length;
			for (let i = 0; i < length; i++) {
				let measure = this._measuredIndexPaths[i];
				if (measure.indexPath.isEqualToIndexPath(indexPath, {usingComparator: this.identityComparator})) {
					return this._measuredIndexPaths[i].size;
				}
			}
		}

		if (BM_COLLECTION_VIEW_DEBUG_MEASURE) {
			if (!this.__debug__measuring) {
				this.__debug__measuring = YES;
				let flash = document.createElement('div');
				flash.style.cssText = 'position: fixed; z-index: 999999999; top: 0px; left: 0px; width: 100%; height: 100%; background-color: red; pointer-events: none;';
				document.body.appendChild(flash);
				requestAnimationFrame(() => (flash.remove(), (this.__debug__measuring = NO)));
			}
		}

		// Retrieve the cell if it is already managed
		let cell = this.cellAtIndexPath(indexPath);

		let previousAttributes;

		// Current attributes are likely to not be available, so a placeholder set is created
		let attributes = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(indexPath);
		// TODO: Change these magic numbers to real limits
		attributes.frame = BMRectMake(0, 0, 10000, 10000);

		if (!cell) {
			// If the cell didn't already exist, request it from the data set
			cell = this._dataSet.cellForItemAtIndexPath(indexPath);
		}
		else {
			previousAttributes = cell.attributes;
		}

		if (BM_COLLECTION_VIEW_DEBUG_MEASURE_CELL) {
			let flash = document.createElement('div');
			flash.style.cssText = 'position: absolute; z-index: 999999999; top: 0px; left: 0px; width: 100%; height: 100%; background-color: red; pointer-events: none;';
			cell.node.appendChild(flash);
			requestAnimationFrame(() => flash.remove());
		}

		cell._isMeasuring = YES;
		cell._invalidatedConstraints = YES;

		// Move this measurement into a separate layout queue
		const layoutQueue = cell.layoutQueue;
		cell.layoutQueue = BMViewLayoutQueue.layoutQueue();

		// Apply the placeholder attributes
		cell.attributes = attributes;

		// Retain and render the cell
		cell.retain();

		// Set up constraints for the root view's descendant to measure it
		let constraints = [];
		// Set the top-left position to 0
		let constraint = cell.left.equalTo(0);//BMLayoutConstraint.constraintWithView(cell, {attribute: BMLayoutAttribute.Left});
		constraint.isActive = YES;
		constraints.push(constraint);

		constraint = cell.top.equalTo(0);//BMLayoutConstraint.constraintWithView(cell, {attribute: BMLayoutAttribute.Top});
		constraint.isActive = YES;
		constraints.push(constraint);

		// Express a weak intent to have the size as small as possible
		constraint = cell.width.equalTo(0, {priority: 1});//BMLayoutConstraint.constraintWithView(cell, {attribute: BMLayoutAttribute.Width, priority: 1});
		constraint.isActive = YES;
		constraints.push(constraint);

		constraint = cell.height.equalTo(0, {priority: 1});//BMLayoutConstraint.constraintWithView(cell, {attribute: BMLayoutAttribute.Height, priority: 1});
		constraint.isActive = YES;
		constraints.push(constraint);

		// Request and apply additional constraints that the layout object may specify
		for (let constraint of this.layout.constraintsForMeasuringCell(cell, {atIndexPath: indexPath})) {
			constraint.isActive = YES;
			constraints.push(constraint);
		}

		// Run a layout pass to measure the cell's subview
		cell.layout();

		cell.layoutQueue = layoutQueue;

		// If needed, temporarily retain the cell in case it will be reused
		if (this._measuringCells) {
			this._measuringCells.push(cell.retain());
		}

		// Retrieve the cell's measured size
		let size = cell.subviews[0].frame.size;

		// Release the temporary cell
		cell.release();

		// Remove the temporary constraints
		for (let constraint of constraints) {
			constraint.remove();
		}

		// If the cell is still retained, reapply the previous attibutes
		if (cell.retainCount > 0 && previousAttributes) {
			cell.attributes = previousAttributes;
		}
		else {
			cell._attributes = undefined;
			attributes._cell = undefined;
		}

		// Invalidate the cell's constraints to allow the next layout pass to correctly update the cells
		cell._invalidatedConstraints = YES;
		cell._isMeasuring = NO;

		// Retain this measured state
		if (identifier) {
			this._measures[identifier] = size.copy();
		}
		else {
			this._measuredIndexPaths.push({indexPath: indexPath, size: size});
		}

		return size;
	},

	/**
	 * Prepares the cell at the given index path for measurement, yielding prior to measuring it, then returning the measured size.
	 * If the cell was already measured, this will immediately return the cached measured size.
	 * @param indexPath <BMIndexPath<T>>				The index path of the cell whose size should be measured.
	 * {
	 * 	@param layoutQueue <BMLayoutQueue>				The layout queue to use for this measurement.
	 * 	@param dequeue <Boolean>						Whether the layout queue should be drained automatically or not. If set to `NO`,
	 *													the layout queue must be drained after the first time this generator yields.
	 * }
	 * @return <Iterator<BMSize or undefiend>>			The iterator.
	 */
	*_measuredSizeOfCellAtIndexPathGenerator(indexPath, {layoutQueue: queue, dequeue}) {
		// Return the cached size if it is available.
		let identifier;
		if (this._dataSet.identifierForIndexPath) {
			identifier = this._dataSet.identifierForIndexPath(indexPath);

			if (this._measures[identifier]) return this._measures[identifier];
		}
		else {
			let length = this._measuredIndexPaths.length;
			for (let i = 0; i < length; i++) {
				let measure = this._measuredIndexPaths[i];
				if (measure.indexPath.isEqualToIndexPath(indexPath, {usingComparator: this.identityComparator})) {
					return this._measuredIndexPaths[i].size;
				}
			}
		}

		if (BM_COLLECTION_VIEW_DEBUG_MEASURE) {
			if (!this.__debug__measuring) {
				this.__debug__measuring = YES;
				let flash = document.createElement('div');
				flash.style.cssText = 'position: fixed; z-index: 999999999; top: 0px; left: 0px; width: 100%; height: 100%; background-color: red; pointer-events: none;';
				document.body.appendChild(flash);
				requestAnimationFrame(() => (flash.remove(), (this.__debug__measuring = NO)));
			}
		}

		// Retrieve the cell if it is already managed
		let cell = this.cellAtIndexPath(indexPath);

		let previousAttributes;

		// Current attributes are likely to not be available, so a placeholder set is created
		let attributes = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(indexPath);
		// TODO: Change these magic numbers to real limits
		attributes.frame = BMRectMake(0, 0, 10000, 10000);

		if (!cell) {
			// If the cell didn't already exist, request it from the data set
			cell = this._dataSet.cellForItemAtIndexPath(indexPath);
		}
		else {
			previousAttributes = cell.attributes;
		}

		if (BM_COLLECTION_VIEW_DEBUG_MEASURE_CELL) {
			let flash = document.createElement('div');
			flash.style.cssText = 'position: absolute; z-index: 999999999; top: 0px; left: 0px; width: 100%; height: 100%; background-color: red; pointer-events: none;';
			cell.node.appendChild(flash);
			requestAnimationFrame(() => flash.remove());
		}

		cell._isMeasuring = YES;
		cell._invalidatedConstraints = YES;

		// Move this measurement into a separate layout queue
		const layoutQueue = cell.layoutQueue;
		cell._cancelLayout();
		cell.layoutQueue = queue;

		// Apply the placeholder attributes
		cell.attributes = attributes;

		// Retain and render the cell
		cell.retain();

		// Set up constraints for the root view's descendant to measure it
		let constraints = [];
		// Set the top-left position to 0
		let constraint = cell.left.equalTo(0);//BMLayoutConstraint.constraintWithView(cell, {attribute: BMLayoutAttribute.Left});
		constraint.isActive = YES;
		constraints.push(constraint);

		constraint = cell.top.equalTo(0);//BMLayoutConstraint.constraintWithView(cell, {attribute: BMLayoutAttribute.Top});
		constraint.isActive = YES;
		constraints.push(constraint);

		// Express a weak intent to have the size as small as possible
		constraint = cell.width.equalTo(0, {priority: 1});//BMLayoutConstraint.constraintWithView(cell, {attribute: BMLayoutAttribute.Width, priority: 1});
		constraint.isActive = YES;
		constraints.push(constraint);

		constraint = cell.height.equalTo(0, {priority: 1});//BMLayoutConstraint.constraintWithView(cell, {attribute: BMLayoutAttribute.Height, priority: 1});
		constraint.isActive = YES;
		constraints.push(constraint);

		// Request and apply additional constraints that the layout object may specify
		for (let constraint of this.layout.constraintsForMeasuringCell(cell, {atIndexPath: indexPath})) {
			constraint.isActive = YES;
			constraints.push(constraint);
		}

		yield;

		// Run a layout pass to measure the cell's subview
		if (dequeue) cell.layout();

		cell.layoutQueue = layoutQueue;

		// If needed, temporarily retain the cell in case it will be reused
		if (this._measuringCells) {
			this._measuringCells.push(cell.retain());
		}

		// Retrieve the cell's measured size
		let size = cell.subviews[0].frame.size;

		// Release the temporary cell
		cell.release();

		// Remove the temporary constraints
		for (let constraint of constraints) {
			constraint.remove();
		}

		// If the cell is still retained, reapply the previous attibutes
		if (cell.retainCount > 0 && previousAttributes) {
			cell.attributes = previousAttributes;
		}
		else {
			cell._attributes = undefined;
			attributes._cell = undefined;
		}

		// Invalidate the cell's constraints to allow the next layout pass to correctly update the cells
		cell._invalidatedConstraints = YES;
		cell._isMeasuring = NO;

		// Retain this measured state
		if (identifier) {
			this._measures[identifier] = size.copy();
		}
		else {
			this._measuredIndexPaths.push({indexPath: indexPath, size: size});
		}

		return size;
	},

	//#endregion
	
	
	/************************************* DEPRECATED CELL REFRESH ********************************/
    
    /**
	 * @deprecated Consider publishing a data change and replacing the cell's object completely.
	 * 
	 * Recreates the cell at the specified index path.
	 * Unlike when updating cells, the newly reconstructed may have a different reuse identifier after the refresh.
	 * If the cell at the specified indexPath is not currently visible or retained, this function has no effect.
	 * Note that if the old cell was retained, its retain count will not carry over to the new cell. You should only invoke
	 * this method on cells that are not retained or manually release the old cell and retain the new one.
	 * If the new cell is hidden this method may return an undefined cell.
	 * @param indexPath <BMIndexPath<T>>			The index path.
	 * {
	 *	@param animated <Boolean, nullable>			Defaults to NO. If set to YES, the refresh will be animated.
	 * }
	 * @return <BMCollectionViewCell, nullable>		The new cell, if could be bound, undefined otherwise.
	 */
    refreshCellAtIndexPath: function (indexPath, options) {
	    var animated = options && options.animated;
	    var currentCell = this.cellAtIndexPath(indexPath, {ofType: BMCollectionViewLayoutAttributesType.Cell});
	    
	    if (!currentCell) return;
	    
		var newAttributes = currentCell.attributes.copy();
		currentCell._attributes = currentCell.attributes.copy();
		currentCell._attributes.indexPath = BMIndexPathNone;
		currentCell._attributes._cell = currentCell;
	    
	    if (!animated) {
		    // For instant changes, just destroy the current cell and recreate the new one
			currentCell.recycle();
			
			if (!newAttributes.isHidden) {
				var newCell = this.dataSet.cellForItemAtIndexPath(indexPath);
				newCell.attributes = newAttributes;
				newCell._manage();
				
				return newCell;
			}
		    
	    }
	    else {
		    
		    // For animated changes, both cells have to be visible during the animation
		    var newCell = this.dataSet.cellForItemAtIndexPath(indexPath);
		    
		    var opacity = newAttributes.style.opacity;
		    if (opacity === undefined) opacity = 1;
		    newAttributes.style.opacity = 0;
		    
		    var currentOpacity = currentCell.attributes.style.opacity;
		    if (currentOpacity === undefined) currentOpacity = 1;
		    
		    newCell.attributes = newAttributes;
			
			// Don't manage hidden cells
		    if (!newAttributes.isHidden) newCell._manage();
		    
		    // Both the new and the old cells should be retained during the animation
		    currentCell.retain();
		    newCell.retain();
		    
		    // The old cell should no longer be managed by the collection view at this point
		    currentCell._unmanage();
		    BMAnimateWithBlock(function () {
			    newCell.attributes.style.opacity = opacity;
			    currentCell.attributes.style.opacity = 0;
			    
			    newCell.attributes.style = newCell.attributes.style;
			    currentCell.attributes.style = currentCell.attributes.style;
			    
		    }, { duration: 100, easing: 'easeInOutQuad', queue: NO, complete: function () {
			    newCell.release();
			    currentCell.releaseRecycledCell();
			    
			    currentCell.attributes.style.opacity = currentOpacity;
		    }});
		    
		    return newCell;
		    
	    }
	    
    },
	
	
	
	/************************************* DRAG & DROP ********************************/
    
    /**
	 * Should be invoked by the data set object to have the collection view generate and return a cell for the given reuse identifier.
	 * The created cell is not implicitly retained and it should not be retained until its layout attributes have been created and applied.
	 * @param identifier <String>					The cell's reuse identifier.
	 * @return <BMCollectionViewCell>				A cell.
	 */
    dequeueCellForReuseIdentifier: function (identifier) {
	    // Try to retrieve a cached cell if available
	    var cache = this.cellCache[identifier];
	    
	    if (cache && cache.length) {
		    var cell = cache.pop();
		    
		    cell.node.style.opacity = cell._backingOpacity;
		    
		    return cell;
	    }
	    
		// Otherwise construct a new one
		var cellClass = this._cellClasses[identifier] || this._cellClass;

		var node = document.createElement('div');
		node.style.cssText = "position: absolute; left: 0px; top: 0px; visibility: hidden; overflow: visible;";

		var cell = Object.create(cellClass.prototype).initWithCollectionView(this, {reuseIdentifier: identifier, node: node});
		cell._layoutQueue = this._cellLayoutQueue;
		//BMCollectionViewCellMakeForCollectionView(this, {withReuseIdentifier: identifier});
		

	    //cell.element = $('<div style="position: absolute; left: 0px; top: 0px; visibility: hidden; overflow: visible;">');
		//if (this.customScroll) cell.element.css({'will-change': 'transform'});
		// When using custom classes, it is no longer the data set object's responsibility to provide the contents for the cell
	    if (cellClass == BMCollectionViewCell) cell.element.append(this._dataSet.contentsForCellWithReuseIdentifier(identifier));

	    
	    this._contentWrapper.append(cell.element);
	    
	    // Attach event handlers to the cells
	    var self = this;
	    
	    var cellEventClicks = 0;
	    var cellEventWasLongClicked = NO;
	    
	    var cellEventBasePosition = BMPointMake();
	    
	    var cellEventLongClickTimeout;
	    var cellEventDoubleClickTimeout;
	    
	    var cellEventIsMouseDown = NO;
	    
	    var cellEventCanDoubleClick = NO;
	    
	    // Represents the unique identifier of the tracked touch
		var cellEventTrackedTouch;

		// Set to YES when a touch event becomes a potential candidate for a touch-based
		// drag & drop operation
		var cellEventCanTouchDrag = NO;
		
		var useCapture = NO;

		var canDrag = NO;
	    
	    // Click, double click, long click, tap, double tap and long tap handlers
	    cell.mousedownHandler = function (event) {
			if (_BMCoreUIIsDragging) return void (event.preventDefault(), event.stopPropagation());
			event.originalEvent = event;
			const which = event.which || event.button;

		    // Don't handle non-left clicks here
		    if (!BMIsTouchDevice && which != 1) return;
		    
		    // Don't handle events originating from buttons and input elements or their direct descendants as well as several whitelisted class names
		    if (event.target.nodeName == 'BUTTON' || event.target.nodeName == 'INPUT' || event.target.nodeName == 'LABEL' || event.target.nodeName == 'A' ||
				event.target.parentNode.nodeName == 'BUTTON' || event.target.parentNode.nodeName == 'INPUT' || event.target.parentNode.nodeName == 'LABEL' ||
				event.target.classList.contains('BMCollectionViewCellEventHandler') || event.target.parentNode.classList.contains('BMCollectionViewCellEventHandler') ||
				event.target.classList.contains('widget-foldingpanel-header') ||
				// This a specific Thingworx workaround that depends on jQuery
				(window.$ ? window.$(event.target).parents('.widget-dhxdropdown').length : false)) {
			    return;
			}
		    
		    if (event.originalEvent.type == 'touchstart') {
			    // if there is already a tracked touch, ignore this touchstart event
			    if (cellEventTrackedTouch !== undefined) return;
			    cellEventTrackedTouch = event.originalEvent.touches[0].identifier;
			}
			else {
				// Attach the mousemove and mouseup handlers here, to continue processing this event
				// even if the pointer exits the cell's node
				window.addEventListener('mousemove', cell.mousemoveHandler, YES);
				window.addEventListener('mouseup', cell.mouseupHandler, YES);
			}
			
			// Ask the delegate if this event sequence may be converted to a drag & drop operation, defaulting to NO if it can't provide this information
			canDrag = NO;
			if (self.delegate && self.delegate.collectionViewCanMoveCell) {
				canDrag = self.delegate.collectionViewCanMoveCell(self, cell, {atIndexPath: cell.indexPath});
			}

			if (canDrag) {
				event.preventDefault();
			}
		    
		    cellEventBasePosition.x = event.pageX || (event.originalEvent.touches && event.originalEvent.touches[0].pageX) || 0;
		    cellEventBasePosition.y = event.pageY || (event.originalEvent.touches && event.originalEvent.touches[0].pageY) || 0;
		    
			cellEventWasLongClicked = NO;
			cellEventCanTouchDrag = NO;
		    
		    cellEventLongClickTimeout = window.setTimeout(function () {
			    cellEventLongClickTimeout = undefined;
			    cellEventWasLongClicked = YES;
			    
				let handled = self.cellWasLongClicked(cell, {withEvent: event});
				
				// If long click is not handled by the delegate, attempt to begin a drag operation
				if (!handled) {
					// TODO: Consider if mouse events should also trigger drag & drop in this case

					if (canDrag) {
						// These events will be processed by the interactive movement handlers for this point on
						// So the global mousemove and mouseup handlers should be unregistered
						window.removeEventListener('mousemove', cell.mousemoveHandler, YES);
						window.removeEventListener('mouseup', cell.mouseupHandler, YES);
					
						cellEventIsMouseDown = NO;

						if (self.delegate && self.delegate.collectionViewWillBeginInteractiveMovementForCell) {
							self.delegate.collectionViewWillBeginInteractiveMovementForCell(self, cell, {atIndexPath: cell.indexPath});
						}

						// Begin tracking this as a drag event
						self.beginDragWithEvent(event, {forCell: cell, touchIdentifier: cellEventTrackedTouch});

						cellEventTrackedTouch = undefined;
					}
				}
			    
		    }, _BMCollectionViewLongClickDelay);
		    
		    
		    cellEventCanDoubleClick = NO;
		    if (self.delegate && self.delegate.collectionViewCanDoubleClickCell) {
			    cellEventCanDoubleClick = self.delegate.collectionViewCanDoubleClickCell(self, cell);
		    }
		    
		    if (cellEventCanDoubleClick) cellEventDoubleClickTimeout = window.setTimeout(function () {
			    cellEventDoubleClickTimeout = undefined;
			    
			    if (cellEventClicks) {
				    // If there was a click during this timeout, trigger it now
				    self.cellWasClicked(cell, {withEvent: event});
				    cellEventClicks = 0;
			    }
			    
			}, _BMCollectionViewDoubleClickDelay);
		    
		    cellEventIsMouseDown = YES;
		    
		};
		cell.element[0].addEventListener('mousedown', cell.mousedownHandler, useCapture);
		cell.element[0].addEventListener('touchstart', cell.mousedownHandler, useCapture);
		
		// With pointing devices, the mousemove event stops being sent to the element during a click
		// if the pointer moves outside the element, whereas with touch events, the touchmove event continues
		// to fire even after the touch point has moved outside of the element
		// Because of this, mousemove is attached to window for the duration of a click and then released at the end
		cell.mousemoveHandler = function (event) {
			if (_BMCoreUIIsDragging) return void (event.preventDefault(), event.stopPropagation());
			if (canDrag) event.preventDefault();
			event.originalEvent = event;
			const which = event.which || event.button;

		    // Only handle move events here while the mouse is pressed
		    if (!cellEventIsMouseDown) return;
		    
		    if (event.type == 'touchmove') {
			    // if there is no tracked touch, ignore this touchmove event
			    if (cellEventTrackedTouch === undefined) return;
			    
			    for (var i = 0; i < event.originalEvent.changedTouches.length; i++) { 
				    if (event.originalEvent.changedTouches[i].identifier == cellEventTrackedTouch) {
					    var x = event.originalEvent.changedTouches[i].pageX;
					    var y = event.originalEvent.changedTouches[i].pageY;
					    break;
				    }
				} 
				
			    // If the tracked touch did not change, ignore this touchmove event
			    if (i == event.originalEvent.changedTouches.length) return;
		    }
		    else {
			    var x = event.pageX;
			    var y = event.pageY;
		    }
			
			// When the pointer moves beyond the click slope threshold, cancel this click event
		    if (Math.abs(x - cellEventBasePosition.x) > _BMCollectionViewClickSlopeThreshold ||
		    	Math.abs(y - cellEventBasePosition.y) > _BMCollectionViewClickSlopeThreshold) {
			
				window.clearTimeout(cellEventLongClickTimeout);
				window.clearTimeout(cellEventDoubleClickTimeout);
				
				cellEventIsMouseDown = NO;
				
				// If there was a previous click, trigger the click event now
				if (cellEventClicks) {
					self.cellWasClicked(cell, {withEvent: event});
			    	cellEventClicks = 0;
				}    	

				// Mousemove drag events begin here, touch drag events need an additional flag
				if (event.type == 'mousemove') {
					/*// Ask delegate if dragging is allowed, defaulting to NO if it can't provide this information
					let canDrag = NO;
					if (self.delegate && self.delegate.collectionViewCanMoveCell) {
						canDrag = self.delegate.collectionViewCanMoveCell(self, cell, {atIndexPath: cell.indexPath});
					}*/

					if (canDrag) {
						if (self.delegate && self.delegate.collectionViewWillBeginInteractiveMovementForCell) {
							self.delegate.collectionViewWillBeginInteractiveMovementForCell(self, cell, {atIndexPath: cell.indexPath});
						}

						// These events will be processed by the interactive movement handlers for this point on
						// So the global mousemove and mouseup handlers should be unregistered
						window.removeEventListener('mousemove', cell.mousemoveHandler, YES);
						window.removeEventListener('mouseup', cell.mouseupHandler, YES);

						// Begin tracking this as a drag event
						self.beginDragWithEvent(event, {forCell: cell, touchIdentifier: cellEventTrackedTouch});
					}
				}
		    }
		    
	    };
		//cell.element[0].addEventListener('mousemove', cell.mousemoveHandler, useCapture);
		cell.element[0].addEventListener('touchmove', cell.mousemoveHandler, useCapture);

	    
	    // On touch devices, the touch may be cancelled, for example by a descendant or the system claiming the touch event for its own use
		cell.touchcancelHandler = function (event) {
			if (_BMCoreUIIsDragging) return;

			event.originalEvent = event;
			const which = event.which || event.button;

		    // Don't handle other touches than the tracked touch
		    // If there is no tracked touch, ignore this touchcancel event
		    if (cellEventTrackedTouch === undefined) return;
		    
		    for (var i = 0; i < event.originalEvent.changedTouches.length; i++) { 
			    if (event.originalEvent.changedTouches[i].identifier == cellEventTrackedTouch) {
				    // Regardless of how this event if processed afterwards, the cellEventTrackedTouch variable must be cleared now
				    // to allow new touches to be tracked
				    cellEventTrackedTouch = undefined;
	    
				    // Prevent touch event from simulating mouse events
				    event.preventDefault();
	    
				    break;
				}
			} 
			
		    // If the tracked touch did not change, ignore this touchend event
		    if (i == event.originalEvent.changedTouches.length) return;
		    
		    // If there was a double click event queued, cancel it
			window.clearTimeout(cellEventDoubleClickTimeout);
		    
	    };
		cell.element[0].addEventListener('touchcancel', cell.touchcancelHandler, useCapture);
		
		// Mouseup follows a similar logic to mousemove
		cell.mouseupHandler = function (event) {
			if (_BMCoreUIIsDragging) return;

			event.originalEvent = event;
			const which = event.which || event.button;

		    // Don't handle non-left clicks here
		    if (!BMIsTouchDevice && which != 1) return;
		    
		    if (event.originalEvent.type == 'touchend') {
			    // Don't handle other touches than the tracked touch
			    // If there is no tracked touch, ignore this touchend event
			    if (cellEventTrackedTouch === undefined) return;
			    
			    for (var i = 0; i < event.originalEvent.changedTouches.length; i++) { 
				    if (event.originalEvent.changedTouches[i].identifier == cellEventTrackedTouch) {
					    // Regardless of how this event if processed afterwards, the cellEventTrackedTouch variable must be cleared now
					    // to allow new touches to be tracked
					    cellEventTrackedTouch = undefined;
		    
					    // Prevent touch event from simulating mouse events
					    event.preventDefault();
		    
					    break;
					}
				} 
				
			    // If the tracked touch did not change, ignore this touchend event
			    if (i == event.originalEvent.changedTouches.length) return;
			}
			else {
				// Unregister the global event handlers
				window.removeEventListener('mousemove', cell.mousemoveHandler, YES);
				window.removeEventListener('mouseup', cell.mouseupHandler, YES);
			}
		    
		    // If the mouse moved too much during this event, ignore it
		    if (!cellEventIsMouseDown) return;
		    
		    cellEventIsMouseDown = NO;
		    
		    // If the cell was long clicked, do not handle it further here
			if (cellEventWasLongClicked) return;
			
			// Otherwise prevent the long click from triggering
			window.clearTimeout(cellEventLongClickTimeout);
		    
		    // If double click is not supported, fire the click event immediately and stop further propagation
		    if (!cellEventCanDoubleClick) {
				//event.stopPropagation();
			    self.cellWasClicked(cell, {withEvent: event});
			    return;
		    }
		    
		    // If this event can still be interpreted as a double click
		    if (cellEventDoubleClickTimeout) {
		    	cellEventClicks++;
		    	
		    	// If there were two clicks, trigger the double click and stop further propagation
		    	if (cellEventClicks >= 2) {
			    	cellEventClicks = 0;
					//event.stopPropagation();
			    	self.cellWasDoubleClicked(cell, {withEvent: event});
			    	
			    	window.clearTimeout(cellEventDoubleClickTimeout);
		    	}
		    }
	    };
		//cell.element[0].addEventListener('mouseup', cell.mouseupHandler, useCapture);
		cell.element[0].addEventListener('touchend', cell.mouseupHandler, useCapture);
		
		cell.contextMenuHandler = function (event) {
		    var handled = self.cellWasRightClicked(cell, {withEvent: event});
		    if (handled) {
			    event.preventDefault();
			    event.stopPropagation();
		    }
	    };
	    // Right click handler
	    cell.element[0].addEventListener('contextmenu', cell.contextMenuHandler);
	    
	    return cell;
	    
	},
	
	isDragging: NO,

	/**
	 * A promise that is pending while there is an interactive move operation in progress.
	 * The promise is undefined or resolved whenever there is no interactive move operation.
	 */
	interactiveMovement: undefined, // <Promise<void>, nullable>

	/**
	 * An array containing the index paths being manipulated by a drag & drop event.
	 */
	_draggingIndexPaths: undefined, // <[BMIndexPath<T>], nullable>

	/**
	 * Should be invoked when the data set changes during a drag & drop operation and the index paths
	 * corresponding to the items currently being dragged are no longer valid.
	 * This will cause the collection view to request new index paths from the data set object.
	 */
	invalidateDraggingIndexPaths() {
		if (!this._draggingIndexPaths) return;

		this._draggingIndexPaths = this._draggingIndexPaths.map(indexPath => this._dataSet.indexPathForObject(indexPath.object));
	},


	/**
	 * Invoked by CoreUI to determine if this collection view is a valid drop target for a set of items.
	 * @param items <[AnyObject]>		An array of items.
	 * @return <Boolean>				`YES` if this collection view can accept the items, `NO` otherwise.
	 */
	_canAcceptItems(items) {
		if (this.delegate && this.delegate.collectionViewCanAcceptItems) {
			return this.delegate.collectionViewCanAcceptItems(this, items);
		}
		return NO;
	},

	/**
	 * Invoked by CoreUI to insert a set of items into this collection view as a result of a drag & drop operation.
	 * @param items <[AnyObject]>							An array of items.
	 * {
	 * 	@param toIndexPath <BMIndexPath<T>>					The suggested index path at which to add the items.
	 * 	@param withDropShadows <Map<AnyObject, DOMNode>>	A map containing the link between drop shadows and the items.
	 * }
	 */
	_insertItems: async function (items, args) {
		this._droppedShadows = args.withDropShadows;
		this.dataSet.insertItems(items, args);
		await new Promise((resolve, reject) => {
			this.registerDataCompletionCallback(() => {
				resolve();
			})
		});
	},

	/**
	 * Begins a drag gesture from the given event. The drag event will move the cell from which
	 * the event originates.
	 * @param event <Event>						The event triggering this action.
	 * {
	 * 	@param forCell <BMCollectionViewCell>	The cell from which this event originates.
	 * 	@param touchIdentifier <AnyObject>		If this event is a TouchEvent, this represents the identifier
	 * 											of the touch point that will control this drag & drop operation.
	 * }
	 */
	beginDragWithEvent(event, args) {
		if (this.isDragging) return;
		// TODO Consider splitting up this giant method

		let resolveIsDragging;
		let touchIdentifier = args.touchIdentifier;

		this.interactiveMovement = new Promise(function (resolve, reject) { resolveIsDragging = resolve; });

		this.isDragging = YES;
		_BMCoreUIIsDragging = YES;

		let cell = args.forCell;

		let draggingShadowsToAdd = [];

		// Create a copy of the cell that will be dragged
		let draggingShadow = cell.node.cloneNode(YES);
		draggingShadow.classList.add('BMDragShadow');
		draggingShadowsToAdd.push(draggingShadow);
		//document.body.appendChild(draggingShadow);

		// Retain the cells for the duration of the drag operation, if the cell is selected, retain and drag all of the selected cells
		let cells;
		if (this.isCellAtIndexPathSelected(cell.indexPath)) {
			cells = [];
			// Sort the index paths in ascending order
			this._selectedIndexPaths.sort((i1, i2) => i2.section == i1.section ? i1.row - i2.row : i1.section - i2.section).forEach(indexPath => {
				let retainedCell = this.retainCellForIndexPath(indexPath);
				cells.push(retainedCell);
				retainedCell.isDragging = YES;

				retainedCell.node.classList.add('BMCollectionViewCellDragging');
			});
		}
		else {
			cells = [cell];
			cell.isDraggging = YES;
			cell.retain();

			cell.node.classList.add('BMCollectionViewCellDragging');
		}

		// Create an indicator that shows how many items are being dragged
		let draggingIndicator = document.createElement('div');
		draggingIndicator.classList.add('BMDragIndicator');
		draggingIndicator.innerText = cells.length;
		draggingIndicator.style.zIndex = 99999999;

		let clientX, clientY;
		if (touchIdentifier !== undefined) {
			for (var i = 0; i < event.changedTouches.length; i++) { 
				if (event.changedTouches[i].identifier == touchIdentifier) {
					clientX = event.changedTouches[i].clientX;
					clientY = event.changedTouches[i].clientY;
					break;
				}
			}
		}
		else {
			clientX = event.clientX;
			clientY = event.clientY;
		}

		// This represents the offset between the pointer position at the beginning of the drag event
		// and the top-left position of the cell
		let frame = BMRectMakeWithNodeFrame(cell.node);
		let offset = BMPointMake(clientX - frame.origin.x, clientY - frame.origin.y);

		let draggingShadowTargetPoint = BMPointMake(clientX - offset.x, clientY - offset.y);

		// Create up to 10 additional shadows for other items
		let draggingShadows = [];
		let draggingShadowsMap = new Map;
		let areDraggingShadowsAnimating = YES;

		// The last created dragging shadow
		let lastShadow = null;
		cells.forEach(otherCell => {
			if (otherCell == cell || draggingShadows.length >= 10) return;

			let otherDraggingShadow = otherCell.node.cloneNode(YES);
			otherDraggingShadow.classList.add('BMDragShadow');
			otherDraggingShadow.classList.remove('BMCollectionViewCellDragging');
			//document.body.insertBefore(otherDraggingShadow, lastShadow);
			draggingShadowsToAdd.splice(1, 0, otherDraggingShadow);
			lastShadow = otherDraggingShadow;

			let sourceRect = BMRectMakeWithNodeFrame(otherCell.node);

			draggingShadowsMap.set(otherDraggingShadow, otherCell);

			otherDraggingShadow.style.pointerEvents = 'none';
			otherDraggingShadow.style.position = 'fixed';
			otherDraggingShadow.style.left = (sourceRect.origin.x) + 'px';
			otherDraggingShadow.style.top = (sourceRect.origin.y) + 'px';
			BMHook(otherDraggingShadow, {translateX: 0, translateY: 0});
			otherDraggingShadow.style.zIndex = 99999997;

			draggingShadows.push(otherDraggingShadow);
			let index = draggingShadows.length;

			// __BMVelocityAnimate(otherDraggingShadow, {
			// 	rotateZ: ((index) * 60 / cells.length) + 'deg',
			// 	left: [draggingShadowTargetPoint.x + 'px', sourceRect.origin.x + 'px'],
			// 	top: [draggingShadowTargetPoint.y + 'py', sourceRect.origin.x + 'px']
			// }, {
			// 	easing: 'easeInOutQuad',
			// 	duration: 300,
			// 	complete() {
			// 		areDraggingShadowsAnimating = NO;
			// 	}
			// });
			(window.Velocity || $.Velocity).animate(otherDraggingShadow, {tween: 1}, {
				easing: 'easeInOutQuad',
				duration: 300,
				progress: (elements, complete, remaining, start, f) => {
					BMHook(otherDraggingShadow, {rotateZ: f * ((index) * 60 / cells.length) + 'deg'});
					otherDraggingShadow.style.left = BMNumberByInterpolatingNumbersWithFraction(sourceRect.origin.x, draggingShadowTargetPoint.x, f) + 'px';
					otherDraggingShadow.style.top = BMNumberByInterpolatingNumbersWithFraction(sourceRect.origin.y, draggingShadowTargetPoint.y, f) + 'px';
				},
				complete() {
					areDraggingShadowsAnimating = NO;
				}
			})
		});

		// Move the dragging shadow to the pointer
		draggingShadow.style.transform = '';
		draggingShadow.style.pointerEvents = 'none';
		draggingShadow.style.position = 'fixed';
		draggingShadow.style.left = (clientX - offset.x) + 'px';
		draggingShadow.style.top = (clientY - offset.y) + 'px';
		// Ugly, but needed in certain environments sadly
		draggingShadow.style.zIndex = 99999998;

		draggingIndicator.style.left = (clientX - offset.x - 12) + 'px';
		draggingIndicator.style.top = (clientY - offset.y - 12) + 'px';
		BMHook(draggingIndicator, {scaleX: 0, scaleY: 0});
		draggingShadowsToAdd.forEach(shadow => document.body.appendChild(shadow));
		document.body.appendChild(draggingIndicator);

		// (window.Velocity || $.Velocity).animate(draggingIndicator, {
		// 	opacity: [1, 0],
		// 	scaleX: [1, 0],
		// 	scaleY: [1, 0]
		// }, {
		// 	duration: 300,
		// 	easing: 'easeOutQuad'
		// });

		__BMVelocityAnimate(draggingIndicator, {
			opacity: [1, 0],
			scaleX: [1, 0],
			scaleY: [1, 0]
		}, {
			duration: 300,
			easing: 'easeOutQuad'
		});

		// Let the layout object prepare for the dragging gesture
		this.layout.prepareForDragOperation();

		let collectionViewViewportFrame = BMRectMakeWithNodeFrame(this.container[0]);

		let scrollDirectionY = 0;
		let scrollDirectionX = 0;

		// Whenever the pointer moves to the edges of this collection view, this callback function will periodically
		// scroll the collection view's contents appropriately
		var scrollCallback = () => {

			// This callback runs continuously during the drag & drop operation - it is removed upon the operation finishing
			scrollFrame = window.requestAnimationFrame(scrollCallback);

			if (scrollDirectionX || scrollDirectionY) {
				let offset = this.scrollOffset;
				offset.x = offset.x + scrollDirectionX;
				offset.y = offset.y + scrollDirectionY;

				offset.x = Math.max(0, Math.min(offset.x, this.size.width - this.frame.size.width));
				offset.y = Math.max(0, Math.min(offset.y, this.size.height - this.frame.size.height));

				this.scrollOffset = offset;
			}
		}

		var scrollFrame = window.requestAnimationFrame(scrollCallback);

		let isOutOfCollectionViewBounds = NO;
		let canRemoveItems = NO;
		let canTransferItems = NO;

		// Add a capturing mousemove event listener to window to update the 
		// dragging shadow's position so it follows the mouse pointer
		let sourceIndexPath = cell.indexPath;
		this._draggingIndexPaths = cells.map(cell => cell.indexPath);

		// An array of compatible collection view drop targets
		let collectionViewDropTargets = [];
		// A map containing the handlers attached to collection view drop targets
		let collectionViewHandlers = new Map;
		// The currently active frame into which items will be transferred
		let currentDropTargetFrame;
		// The currently active drop target collection view into which items will be transferred
		let currentDropTargetCollectionView;
		// The currently active index path to which items will be imported
		let currentTargetIndexPath;

		// A handler used to discover drop targets for devices that don't support mouseover and mouseout events
		let dropTargetHandler;

		// Check if the items can be transferred onto another collection view, defaulting to NO if the delegate cannot provide a response
		if (this.delegate && this.delegate.collectionViewCanTransferItemsAtIndexPaths) {
			canTransferItems = this.delegate.collectionViewCanTransferItemsAtIndexPaths(this, this._draggingIndexPaths);

			if (canTransferItems) {
				_BMCollectionViews.forEach((value, collectionView) => {
					// Skip this collection view
					if (collectionView == this) return;

					// Skip collection views that can't accept the current items
					if (!collectionView._canAcceptItems(this._draggingIndexPaths.map(indexPath => indexPath.object))) return;

					// For all others, attach mouseover and mouseout events
					// The mouseover event turns this drag operation into a valid transfer
					// The mouseout event reverts this drag operation to is previous semantics
					collectionViewDropTargets.push(collectionView);

					let handlers;
					if (!touchIdentifier) {
						handlers = {
							mouseover: event => {
								currentDropTargetCollectionView = collectionView;
								currentDropTargetFrame = BMRectMakeWithNodeFrame(collectionView._container[0]);
								draggingIndicator.classList.add('BMDragIndicatorBlue');
								event.preventDefault(), event.stopPropagation();
								return NO;
							},
							mouseout: event => {
								currentDropTargetCollectionView = undefined;
								currentDropTargetFrame = undefined;
								draggingIndicator.classList.remove('BMDragIndicatorBlue');
								event.preventDefault(), event.stopPropagation();
								return NO;
							}
						};
	
						collectionView._container[0].addEventListener('mouseover', handlers.mouseover);
						collectionView._container[0].addEventListener('mouseout', handlers.mouseout);
					}

					// Add a helper class to allow the developer to customize the appearance of this collection view
					// when it becomes a valid drop target
					collectionView._container[0].classList.add('BMDropTarget');

					// Retain these handlers so they can be removed when this operation ends
					collectionViewHandlers.set(collectionView, handlers);
				});

				// For touch devices, mouseover and mouseout cannot be used as there are no pointer events;
				// Instead, throughout the drag operation, the pointer's position is converted into the topmost node and if that node
				// is a child of any collection view, that collection view becomes the drop target
				// This handler is installed globally and will affect all possible drop targets
				if (touchIdentifier !== undefined) {
					dropTargetHandler = event => {
						let clientX, clientY;
						for (var i = 0; i < event.changedTouches.length; i++) { 
							if (event.changedTouches[i].identifier == touchIdentifier) {
								clientX = event.changedTouches[i].clientX;
								clientY = event.changedTouches[i].clientY;
								break;
							}
						} 
						
						// If the tracked touch did not change, ignore this touchmove event
						if (i == event.changedTouches.length) return NO;

						// Get the node corresponding to the current point
						let node = document.elementFromPoint(clientX, clientY);

						// Check if that node belongs to one of the drop targets
						let target;
						if (node) for (let collectionView of collectionViewDropTargets) {
							if (collectionView._container[0].contains(node)) {
								target = collectionView;
								break;
							}
						}

						// Update the drop target based on what was discovered
						if (target != currentDropTargetCollectionView) {
							currentDropTargetCollectionView = target;
							if (target) {
								currentDropTargetFrame = BMRectMakeWithNodeFrame(currentDropTargetCollectionView._container[0]);
								draggingIndicator.classList.add('BMDragIndicatorBlue');
							}
							else {
								currentDropTargetFrame = undefined;
								draggingIndicator.classList.remove('BMDragIndicatorBlue');
							}
						}
					}
				}
			}
		}

		// The mousemove handler performs several actions; despite its name it handles both mouse and touch events
		//  1. For touch event, it verifies that the dragging pointer was moved before continuing
		//  2. It updates the position of the dragging shadows so they match the pointer's position
		//  3. It triggers the scrolling of the collection view when the drag pointer moves close to the edges of this collection view
		//  4. It verifies, if the pointer moves outside of collection view's frame, if the items can be removed
		//  5. It turns the drag into a transfer operation whenever another view becomes a valid drop target
		//  6. If the pointer is still within collection view's bounds, it moves the dragged items within the data set
		let mousemoveHandler = event => {
			// 1. Verify, when handling touch events, that the pointer assigned to the drag event did change
			event.preventDefault();
			let clientX, clientY;
			if (touchIdentifier !== undefined) {
				event.preventDefault();
			    for (var i = 0; i < event.changedTouches.length; i++) { 
				    if (event.changedTouches[i].identifier == touchIdentifier) {
					    clientX = event.changedTouches[i].clientX;
						clientY = event.changedTouches[i].clientY;
					    break;
				    }
				} 
				
			    // If the tracked touch did not change, ignore this touchmove event
			    if (i == event.changedTouches.length) {
					return event.preventDefault();
				}
			}
			else {
				clientX = event.clientX;
				clientY = event.clientY;
			}

			// 2. Update the positions of the dragging shadows
			draggingShadow.style.left = (clientX - offset.x) + 'px';
			draggingShadow.style.top = (clientY - offset.y) + 'px';

			draggingIndicator.style.left = (clientX - offset.x - 12) + 'px';
			draggingIndicator.style.top = (clientY - offset.y - 12) + 'px';

			if (!areDraggingShadowsAnimating) {
				draggingShadows.forEach((shadow, index) => {
					shadow.style.left = (clientX - offset.x) + 'px';
					shadow.style.top = (clientY - offset.y) + 'px';
				});
			}
			else {
				draggingShadowTargetPoint = BMPointMake(clientX - offset.x, clientY - offset.y);
			}

			// Temporarily suspend these updates while a data update is in progress
			if (this.isUpdatingData) return event.preventDefault(), event.stopPropagation();


			// 3. Enabling scrolling while close to the collection view's edges.
			if (clientX - collectionViewViewportFrame.origin.x < 32) {
				scrollDirectionX = (clientX - collectionViewViewportFrame.origin.x - 32) / 32 * 20;
			}
			else if (collectionViewViewportFrame.right - clientX < 32) {
				scrollDirectionX = (32 - collectionViewViewportFrame.right + clientX) / 32 * 20;
			}
			else {
				scrollDirectionX = 0;
			}

			if (clientY - collectionViewViewportFrame.origin.y < 32) {
				scrollDirectionY = (clientY - collectionViewViewportFrame.origin.y - 32) / 32 * 20;
			}
			else if (collectionViewViewportFrame.bottom - clientY < 32) {
				scrollDirectionY = (32 - collectionViewViewportFrame.bottom + clientY) / 32 * 20;
			}
			else {
				scrollDirectionY = 0;
			}
			
			// 4. Check if the pointer moves outside of the collection view's frame
			//    if it does, ask the delegate if the items can be removed, preparing to remove them upon them being dropped
			if (clientY < collectionViewViewportFrame.top || clientY > collectionViewViewportFrame.bottom ||
				clientX < collectionViewViewportFrame.left || clientX > collectionViewViewportFrame.right) {
				if (!isOutOfCollectionViewBounds) {
					isOutOfCollectionViewBounds = YES;
					scrollDirectionX = 0;
					scrollDirectionY = 0;

					if (this.delegate && this.delegate.collectionViewCanRemoveItemsAtIndexPaths) {
						canRemoveItems = this.delegate.collectionViewCanRemoveItemsAtIndexPaths(this, this._draggingIndexPaths);
					}

					if (canRemoveItems) {
						draggingIndicator.classList.add('BMDragIndicatorRed');
					}
				}
			}
			else {
				if (isOutOfCollectionViewBounds) {
					isOutOfCollectionViewBounds = NO;
					canRemoveItems = NO;
					draggingIndicator.classList.remove('BMDragIndicatorRed');
				}
			}

			// 5. If the mouse is over another collection view, look for the index path to add to the next info table
			if (currentDropTargetCollectionView) {
				scrollDirectionX = 0;
				scrollDirectionY = 0;
				let remotePoint = BMPointMake(clientX - currentDropTargetFrame.origin.x, clientY - currentDropTargetFrame.origin.y);
				remotePoint.x += currentDropTargetCollectionView.scrollOffset.x;
				remotePoint.y += currentDropTargetCollectionView.scrollOffset.y;

				let rect = BMRectMake(0, 0, 128, 128);
				rect.center = remotePoint;

				// Request the attributes within the given rect
				let attributes = currentDropTargetCollectionView.layout.attributesForElementsInRect(rect);

				// Find the index path to which the items should be imported
				let targetIndexPath;
				let minimumDistance = Number.MAX_SAFE_INTEGER;
				let minimumDistanceIndex = 0;
				attributes.forEach((attribute, index) => {
					if (attribute.itemType != BMCollectionViewLayoutAttributesType.Cell) return;

					// First look for a direct hit, if the pointer intersects any attribute
					if (attribute.frame.containsPoint(remotePoint)) {
						targetIndexPath = attribute.indexPath.copy();
					}

					// Otherwise find the index path whose center is closest to the mouse pointer
					let distance = remotePoint.distanceToPoint(attribute.frame.center);
					if (distance < minimumDistance) {
						minimumDistance = distance;
						minimumDistanceIndex = index;
					}
				});

				// Retain this index path so collection view knows where to drop the items
				if (targetIndexPath) {
					currentTargetIndexPath = targetIndexPath;
				}
				else if (attributes.length) {
					currentTargetIndexPath = attributes[minimumDistanceIndex].indexPath.copy();
				}

				// While the event is a possible transfer, additional actions are suspended
				return event.preventDefault(), event.stopPropagation();
			}

			// Stop looking for positions while scrolling
			if (scrollDirectionX || scrollDirectionY) return event.preventDefault(), event.stopPropagation();

			// 6. Find out the target positions of the dragged items

			// Discover the coordinates of the point that are relative to the collection view's bounds
			let localPoint = BMPointMake(clientX - collectionViewViewportFrame.origin.x, clientY - collectionViewViewportFrame.origin.y);
			localPoint.x += this.scrollOffset.x;
			localPoint.y += this.scrollOffset.y;

			// Create a rect around this point with a size of 64 by 64 pixels.
			let rect = BMRectMake(0, 0, 64, 64);
			rect.center = localPoint;

			// Request the attributes within the given rect
			let attributes = this.layout.attributesForElementsInRect(rect);

			// Find the index path to which the cell should move
			let targetIndexPath;
			let hasMovedItem = NO;
			attributes.forEach(attribute => {
				if (attribute.itemType != BMCollectionViewLayoutAttributesType.Cell) return;
				if (hasMovedItem) return;

				if (attribute.frame.containsPoint(localPoint)) {
					targetIndexPath = attribute.indexPath.copy();
					//targetIndexPath.object = sourceIndexPath.object;
				}

				// Instruct the data set to move the item, if the new index path does not match the index path of any dragging item
				let canMoveItem = YES;
				if (!targetIndexPath) return;
				this._draggingIndexPaths.forEach(indexPath => {
					if (targetIndexPath.row == indexPath.row && targetIndexPath.section == indexPath.section) canMoveItem = NO;
				});
				// If an item can be moved, build the index paths
				if (canMoveItem) {
					hasMovedItem = YES;
					// Instruct the data set to move the items in bulk if possible
					if (this.dataSet.moveItemsFromIndexPaths && cells.length != 1) {
						this._draggingIndexPaths = this.dataSet.moveItemsFromIndexPaths(this._draggingIndexPaths, {toIndexPath: targetIndexPath}).sort((i1, i2) => i1.section == i2.section ? i1.row - i2.row : i1.section - i2.section);
					}
					else {
						// Otherwise move them one by one
						this._draggingIndexPaths.forEach((indexPath, index) => {
							let destinationIndexPath = targetIndexPath.copy();
							destinationIndexPath.object = indexPath.object;
							destinationIndexPath.row += index;
							if (this.dataSet.moveItemFromIndexPath(indexPath, {toIndexPath: destinationIndexPath})) {
								this._draggingIndexPaths[index] = destinationIndexPath;
							}
						});
					}
				}
					
			});

			// Prevent the default action, which is to select things on the page
			event.preventDefault(), event.stopPropagation();
		};
		window.addEventListener(touchIdentifier !== undefined ? 'touchmove' : 'mousemove', mousemoveHandler, {capture: YES});

		// For touch devices, add the drop target handler which discovers when the touch point reaches inside valid drop targets
		if (touchIdentifier !== undefined) window.addEventListener('touchmove', dropTargetHandler, {capture: YES});

		// Add a capturing mouseup event listener to the window to release the cell and
		// the dragging shadow
		// This handler commits or rolls back the drag operation depending on the semantics decided during initialization and during the move phase
		// as well as additional negociation between this collection view and any possible drop target
		// It also cleans up all other event handlers and temporary resources created for this drag operation
		let mouseupHandler = async event => {
			if (touchIdentifier !== undefined) {
			    for (var i = 0; i < event.changedTouches.length; i++) { 
				    if (event.changedTouches[i].identifier == touchIdentifier) {
					    break;
				    }
				} 
				
			    // If the tracked touch did not change, ignore this touchend event
			    if (i == event.changedTouches.length) return;
			}

			// Remove the previously added handlers from window
			window.removeEventListener(touchIdentifier !== undefined ? 'touchmove' : 'mousemove', mousemoveHandler, {capture: YES});
			window.removeEventListener(touchIdentifier !== undefined ? 'touchend' : 'mouseup', mouseupHandler, {capture: YES});
			if (touchIdentifier !== undefined) window.removeEventListener('touchcancel', mouseupHandler, {capture: YES});

			// Remove the handlers added to the collection view drop targets
			if (!touchIdentifier) collectionViewHandlers.forEach((handlers, collectionView) => {
				collectionView._container[0].removeEventListener('mouseover', handlers.mouseover);
				collectionView._container[0].removeEventListener('mouseout', handlers.mouseout);
				collectionView._container[0].classList.remove('BMDropTarget');
			});
			else {
				collectionViewDropTargets.forEach(collectionView => collectionView._container[0].classList.remove('BMDropTarget'));
				window.removeEventListener('touchmove', dropTargetHandler, {capture: YES});
			}

			//document.querySelectorAll('.BMTest').forEach(node => node.classList.remove('BMTest'));

			window.cancelAnimationFrame(scrollFrame);

			let sourceRect = BMRectMakeWithNodeFrame(draggingShadow);
			let targetRect = BMRectMakeWithNodeFrame(cell.node);

			if (this.delegate && this.delegate.collectionViewWillFinishInteractiveMovementForCell) {
				this.delegate.collectionViewWillFinishInteractiveMovementForCell(this, cell, {atIndexPath: cell.indexPath});
			}

			// Resolve the current dragging operation
			resolveIsDragging();
			
			// (window.Velocity || $.Velocity).animate(draggingIndicator, {
			// 	scaleX: 0,
			// 	scaleY: 0,
			// 	opacity: 0
			// }, {
			// 	duration: 300, 
			// 	easing: 'easeInOutQuad'
			// });
			
			__BMVelocityAnimate(draggingIndicator, {
				scaleX: 0,
				scaleY: 0,
				opacity: 0
			}, {
				duration: 300, 
				easing: 'easeInOutQuad'
			});

			// If there is a drop target, drop the items into the drop target
			if (currentDropTargetCollectionView) {
				let dropIndexPath = currentTargetIndexPath;
				if (!dropIndexPath) {
					let sectionCount = currentDropTargetCollectionView.numberOfSections();
					dropIndexPath = currentDropTargetCollectionView.indexPathForObjectAtRow(currentDropTargetCollectionView.numberOfObjectsInSectionAtIndex(sectionCount - 1) - 1, {inSectionAtIndex: sectionCount - 1});
				}

				// Prepare the map of shadows and list of objects to send over
				// The list of objects will be a copy of the actual objects
				let dropShadowMap = new Map;
				let dropItems = this._draggingIndexPaths.map(indexPath => {
					const newObject = JSON.parse(JSON.stringify(indexPath.object));

					// stringify + parse strips out undefined values, but this can lead to issues
					// in Thingworx when testing the new object against the data shape
					for (const key in indexPath.object) {
						if (typeof indexPath.object[key] === 'undefined') {
							newObject[key] = undefined;
						}
					}

					return newObject;
				});
				let index = 0;

				// Add one for the primary cell
				(() => {
					let dropItem;
					for (let i = 0; i < dropItems.length; i++) {
						if (this._draggingIndexPaths[i].row == cell.indexPath.row && this._draggingIndexPaths[i].section == cell.indexPath.section) {
							dropItem = dropItems[i];
						}
					}
					dropShadowMap.set(dropItem, {node: draggingShadow, rotation: 0});	
				})();

				// And for the remaining extra dragging shadows
				draggingShadowsMap.forEach((cell, shadow) => {
					let dropItem;
					for (let i = 0; i < dropItems.length; i++) {
						if (this._draggingIndexPaths[i].row == cell.indexPath.row && this._draggingIndexPaths[i].section == cell.indexPath.section) {
							dropItem = dropItems[i];
						}
					}
					dropShadowMap.set(dropItem, {node: shadow, rotation: (index + 1) * 60 / cells.length});
					index++;
				});

				// Determine the final transfer policy of this operation
				let localPolicy = BMCollectionViewTransferPolicy.Copy;
				if (this.delegate && this.delegate.collectionViewTransferPolicyForItemsAtIndexPaths) {
					localPolicy = this.delegate.collectionViewTransferPolicyForItemsAtIndexPaths(this, this._draggingIndexPaths);
				}

				let remotePolicy = BMCollectionViewTransferPolicy.Copy;
				if (currentDropTargetCollectionView.delegate && currentDropTargetCollectionView.delegate.collectionViewAcceptPolicyForItems) {
					remotePolicy = currentDropTargetCollectionView.delegate.collectionViewAcceptPolicyForItems(currentDropTargetCollectionView, dropItems);
				}

				// A move policy is used only if both collection views agree on moving, otherwise the final policy will be to copy
				if (localPolicy == BMCollectionViewTransferPolicy.Move && remotePolicy == BMCollectionViewAcceptPolicy.Move) {
					canRemoveItems = YES;
				}
				else {
					canRemoveItems = NO;
				}

				this.isDragging = NO;

				// If the items were removed, instruct the data set to remove them as well
				if (canRemoveItems) this.dataSet.removeItemsAtIndexPaths(this._draggingIndexPaths);

				cells.forEach(cell => {
					cell.node.classList.remove('BMCollectionViewCellDragging');
				});


				await currentDropTargetCollectionView._insertItems(dropItems, {toIndexPath: dropIndexPath, withDropShadows: dropShadowMap});
				this.isDragging = YES;

			}
			// Play a different animation depending on whether the items were removed or moved
			else if (canRemoveItems) {
				// If the items were removed, instruct the data set to remove them as well
				this.dataSet.removeItemsAtIndexPaths(this._draggingIndexPaths);

				cells.forEach(cell => {
					cell.node.classList.remove('BMCollectionViewCellDragging');
				});

				const delayPerCell = 200 / draggingShadows.length;

				draggingShadows.forEach((otherDraggingShadow, index) => {
					BMHook(otherDraggingShadow, {rotateZ: ((index + 1) * 60 / cells.length) + 'deg'});
					// (window.Velocity || $.Velocity).animate(otherDraggingShadow, {
					// 	translateY: '-256px',
					// 	scaleX: .66,
					// 	scaleY: .66,
					// 	opacity: 0
					// }, {
					// 	easing: 'easeInQuad',
					// 	duration: 200,
					// 	delay: (draggingShadows.length - index) * 50
					// });
					__BMVelocityAnimate(otherDraggingShadow, {
						rotateZ: ((index + 1) * 60 / cells.length) + 'deg',
						blur: '20px',
						opacity: 0
					}, {
						easing: 'easeInQuad',
						duration: 200,
						delay: (draggingShadows.length - index) * delayPerCell
					});
				});
	
				// Destroy the dragging shadow
				// await (window.Velocity || $.Velocity).animate(draggingShadow, {
				// 	translateY: '-256px',
				// 	scaleX: .66,
				// 	scaleY: .66,
				// 	opacity: 0
				// }, {
				// 	duration: 200, 
				// 	easing: 'easeInQuad',
				// 	delay: draggingShadows.length * 50
				// });
				await __BMVelocityAnimate(draggingShadow, {
					blur: '20px',
					opacity: 0
				}, {
					duration: 200, 
					easing: 'easeInQuad',
					delay: draggingShadows.length * delayPerCell
				});
			}
			else {
				// Otherwise move the drag shadows to the cell's positions
				draggingShadows.forEach((otherDraggingShadow, index) => {
					let otherCell = draggingShadowsMap.get(otherDraggingShadow);
					let rect = BMRectMakeWithNodeFrame(otherCell.node);
	
					// TODO: Web animation compatibility
					(window.Velocity || $.Velocity).animate(otherDraggingShadow, {
						tween: 1,
						left: rect.origin.x + 'px',
						top: rect.origin.y + 'px'
					}, {
						easing: 'easeInOutQuad',
						duration: 300,
						progress: (elements, complete, remaining, start, f) => {
							otherDraggingShadow.style.transform = 'rotate(' + (1 - f) * ((index + 1) * 60 / cells.length) + 'deg) translateZ(0)';
						},
						complete() {
							areDraggingShadowsAnimating = NO;
						}
					});
	
					// __BMVelocityAnimate(otherDraggingShadow, {
					// 	left: rect.origin.x + 'px',
					// 	top: rect.origin.y + 'px',
					// 	rotate: '0deg',
					// 	translateZ: 0
					// }, {
					// 	easing: 'easeInOutQuad',
					// 	duration: 300,
					// 	complete() {
					// 		areDraggingShadowsAnimating = NO;
					// 	}
					// });
				});
	
				// Destroy the dragging shadow
				// await (window.Velocity || $.Velocity).animate(draggingShadow, {
				// 	translateX: (-sourceRect.origin.x + targetRect.origin.x) + 'px', 
				// 	translateY: (-sourceRect.origin.y + targetRect.origin.y) + 'px'
				// }, {
				// 	duration: 300, 
				// 	easing: 'easeInOutQuad'
				// });
				await __BMVelocityAnimate(draggingShadow, {
					translateX: (-sourceRect.origin.x + targetRect.origin.x) + 'px', 
					translateY: (-sourceRect.origin.y + targetRect.origin.y) + 'px'
				}, {
					duration: 300, 
					easing: 'easeInOutQuad'
				});
			}

			draggingShadow.remove();
			draggingIndicator.remove();
			draggingShadows.forEach(shadow => shadow.remove());

			// Reset the dragging status
			this.isDragging = NO;
			_BMCoreUIIsDragging = NO;

			// Remove the dragging class from the cell
			cells.forEach(cell => {
				cell.node.classList.remove('BMCollectionViewCellDragging');
				cell.isDraggging = NO;

				// Release the cell
				cell.release();
			});

			if (this.delegate && this.delegate.collectionViewDidFinishInteractiveMovementForCell) {
				this.delegate.collectionViewDidFinishInteractiveMovementForCell(this, cell, {atIndexPath: cell.indexPath});
			}

			this._draggingIndexPaths = undefined;
		};
		window.addEventListener(touchIdentifier !== undefined ? 'touchend' : 'mouseup', mouseupHandler, {capture: YES});
		if (touchIdentifier !== undefined) window.addEventListener('touchcancel', mouseupHandler, {capture: YES});


	},
	
	
	
	/************************************* CELL LIFECYCLE ********************************/
    
    
    /**
	 * Should be invoked by the data set object to have the collection view generate and return a cell for a supplementary view with the given reuse identifier.
	 * The created cell is not implicitly retained and it should not be retained until its layout attributes have been created and applied.
	 * @param identifier <String>					The supplementary view's reuse identifier.
	 * @return <BMCollectionViewCell>				A cell.
	 */
    dequeueCellForSupplementaryViewWithIdentifier: function (identifier) {
	    // Try to retrieve a cached cell if available
	    var cache = this.supplementaryViewCache[identifier];
	    
	    if (cache && cache.length) {
		    var cell = cache.pop();
		    
		    cell.element[0].style.opacity = cell._backingOpacity;
		    
		    return cell;
		}
		
		var node = document.createElement('div');
		node.style = 'position: absolute; left: 0px; top: 0px; visibility: hidden; overflow: visible;';
		
	    // Otherwise construct a new one
		var cellClass = this._supplementaryViewClasses[identifier] || this._cellClass;
		var cell = Object.create(cellClass.prototype).initWithCollectionView(this, {reuseIdentifier: identifier, node: node});
		cell._layoutQueue = this._cellLayoutQueue;
	    cell.itemType = BMCollectionViewLayoutAttributesType.SupplementaryView;
		
		// When using custom classes, it is no longer the data set object's responsibility to provide the contents for the cell
	    if (cellClass == BMCollectionViewCell) cell.element.append(this._dataSet.contentsForSupplementaryViewWithIdentifier(identifier));
	    this._contentWrapper.append(cell.element);
	    
	    return cell;
    },
    
    /**
	 * Invoked by cells when they decide they should be rendered.
	 * @param cell <BMCollectionViewCell>		The calling cell.
	 */
    cellShouldRender: function (cell) {
	    
	    if (this.delegate && typeof this.delegate.collectionViewWillRenderCell == 'function') {
		    this.delegate.collectionViewWillRenderCell(this, cell);
	    }
	    
	    //this._contentWrapper.append(cell.element);
	    cell.element[0].style.visibility = 'inherit';
	    this.allCells.push(cell);
	    cell.rendered = YES;
	    
	    if (this.delegate && typeof this.delegate.collectionViewDidRenderCell == 'function') {
		    this.delegate.collectionViewDidRenderCell(this, cell);
	    }
	    
    },
    
    /**
	 * Invoked by cells when they are managed.
	 * @param cell <BMCollectionViewCell>		The calling cell.
	 */
    cellWasManaged: function (cell) {
	    this.retainedCells.push(cell);
    },
    
    /**
	 * Invoked by cells when they decide they should be recycled.
	 * Detaches the element from the collection view container and adds the cell to its cache.
	 * @param cell <BMCollectionViewCell>		The calling cell.
	 */
    cellWasReleased: function (cell) {
	    
	    if (this.delegate && typeof this.delegate.collectionViewWillRecycleCell == 'function') {
		    this.delegate.collectionViewWillRecycleCell(this, cell);
	    }
	    
	    //cell.element.detach();
	    // Opacity is set to 0 to handle a display bug with safari where collected cells will briefly flash at the top-left corner
	    // of the collection view
	    cell.element[0].style.visibility = 'hidden';
	    cell._backingOpacity = cell.attributes.style.opacity 
	    if (cell._backingOpacity === undefined) cell._backingOpacity = BMCollectionViewLayoutAttributesStyleDefaults.opacity;
		cell.element[0].style.opacity = 0;
		
		cell._previousFrame = undefined;
	    
	    // Move the cell back to the top to prevent it from generating additional scrollbars
	    BMHook(cell.element[0], {translateX: '0px', translateY: '0px'});
	    
	    var allCellsLength = this.allCells.length;
	    for (var i = 0; i < allCellsLength; i++) {
		    if (this.allCells[i] === cell) {
			    this.allCells.splice(i, 1);
			    break;
		    }
	    }
	    //this.retainedCells.remove(this.retainedCells.indexOf(cell));
	    
	    var cache = cell.itemType == BMCollectionViewLayoutAttributesType.Cell ? this.cellCache : this.supplementaryViewCache;
	    
	    if (!cache[cell.reuseIdentifier]) cache[cell.reuseIdentifier] = [];
	    cache[cell.reuseIdentifier].push(cell);
	    
	    cell.rendered = NO;
	    
	    if (this.delegate && typeof this.delegate.collectionViewDidRecycleCell == 'function') {
		    this.delegate.collectionViewDidRecycleCell(this, cell);
	    }
	    
    },
    
    
    /**
	 * Invoked by cells when they are unmanaged.
	 * @param cell <BMCollectionViewCell>		The calling cell.
	 */
    cellWasUnmanaged: function (cell) {
	    var retainedCellsLength = this.retainedCells.length;
	    for (var i = 0; i < retainedCellsLength; i++) {
		    if (this.retainedCells[i] === cell) {
			    this.retainedCells.splice(i, 1);
			    break;
		    }
	    }  
    },
    
    /**
	 * Invoked by cells when they are no longer valid and should be discarded.
	 * Removes the element from the collection view container.
	 * @param cell <BMCollectionViewCell>		The calling cell.
	 */
	cellWasInvalidated: function (cell) {
	    // Allow the delegate to perform any final cleanup
	    if (this.delegate && typeof this.delegate.collectionViewWillDestroyCell == 'function') {
		    this.delegate.collectionViewWillDestroyCell(this, cell);
		}
		
		// Turn off all event listeners for the cell
		cell.element[0].removeEventListener('mousedown', cell.mousedownHandler);
		cell.element[0].removeEventListener('touchstart', cell.mousedownHandler);
		cell.element[0].removeEventListener('mousemove', cell.mousemoveHandler);
		cell.element[0].removeEventListener('touchmove', cell.mousemoveHandler);
		cell.element[0].removeEventListener('mouseup', cell.mouseupHandler);
		cell.element[0].removeEventListener('touchend', cell.mouseupHandler);
		cell.element[0].removeEventListener('touchcancel', cell.touchcancelHandler);
		cell.element[0].removeEventListener('contextmenu', cell.contextMenuHandler);
		
		// Remove the cell from the document
		cell.rendered = NO;
		cell.element.remove();
		
		// Remove it from the retained and all cells arrays
	    var retainedCellsLength = this.retainedCells.length;
	    for (var i = 0; i < retainedCellsLength; i++) {
		    if (this.retainedCells[i] === cell) {
			    this.retainedCells.splice(i, 1);
			    break;
		    }
	    }  
	    
	    var allCellsLength = this.allCells.length;
	    for (var i = 0; i < allCellsLength; i++) {
		    if (this.allCells[i] === cell) {
			    this.allCells.splice(i, 1);
			    break;
		    }
	    }
	    
	    // Remove the cell from the cell cache
		
	    
	    if (this.delegate && typeof this.delegate.collectionViewDidDestroyCell == 'function') {
		    this.delegate.collectionViewDidDestroyCell(this, cell);
	    }
	},
	
	
	
	/************************************* CELL LOOKUP ********************************/
	
	/**
	 * Finds and returns the cell for the specified index path, if it exists.
	 * @param indexPath <BMIndexPath<T>>									The index path.
	 * {
	 *	@param ofType <BMCollectionViewLayoutAttributesType, nullable>		Defaults to .Cell. The cell type. Must be .Cell, .SupplementaryView or .DecorationView
	 *	@param withIdentifier <String, nullable>							For supplementary views and decoration views, this is the type of view. Should be omitted for cells.
	 * }
	 * @return <BMCollectionViewCell, nullable>								The cell if it exists, or undefined if it does not.
	 */
	cellAtIndexPath: function (indexPath, options) {
		// Set the default value of the ofType parameter if it is not set.
		if (!options) {
			options = {ofType: BMCollectionViewLayoutAttributesType.Cell};
		}
		options.ofType = options.ofType || BMCollectionViewLayoutAttributesType.Cell;
		
		if (options.ofType == BMCollectionViewLayoutAttributesType.SupplementaryView) {
			return this.supplementaryViewWithIdentifier(options.withIdentifier, {atIndexPath: indexPath});
		}
		
		for (var i = 0; i < this.allCells.length; i++) {
			var cell = this.allCells[i];
			
			if (cell.itemType != options.ofType) continue;
			if (cell.indexPath.isLooselyEqualToIndexPath(indexPath, {usingComparator: this.identityComparator})) {
				return cell;
			}
		}
	},
	
	
	/**
	 * Finds and returns the cell for the supplementary view at specified index path, if it exists.
	 * @param identifier <String>					The type of supplementary view.
	 * {
	 *	@param atIndexPath <BMIndexPath<T>>			The index path.
	 * }
	 * @return <BMCollectionViewCell, nullable>		The cell if it exists, or undefined if it does not.
	 */
	supplementaryViewWithIdentifier: function (identifier, options) {
		for (var i = 0; i < this.allCells.length; i++) {
			var cell = this.allCells[i];
			
			if (cell.itemType != BMCollectionViewLayoutAttributesType.SupplementaryView) continue;
			if (cell.reuseIdentifier != identifier) continue;
			if (cell.indexPath.isEqualToIndexPath(options.atIndexPath, {usingComparator: this.identityComparator})) {
				return cell;
			}
		}
	},
	
	
	/**
	 * Finds, retains and returns the cell for the specified index path, if it exists.
	 * If the specified index path is out of view and it doesn't have a cell associated with it, the cell will be created, retained and returned.
	 * When the cell is no longer needed, it must be released so the collection view can recycle and reuse it.
	 * @param indexPath <BMIndexPath<T>>			The index path.
	 * @return <BMCollectionViewCell, nullable>		The cell if it exists, or undefined if the index path is out of bounds.
	 */
	retainCellForIndexPath: function (indexPath) {
		if (indexPath.section > this.numberOfSections() || indexPath.row > this.numberOfObjectsInSectionAtIndex(indexPath.section)) return undefined;
		
		// First check to see if the requested cell already exists
		var cell = this.cellAtIndexPath(indexPath, {ofType: BMCollectionViewLayoutAttributesType.Cell});
		
		if (cell) {
			// If it does, retain it and return it
			cell.retain();
			return cell;
		}
		
		// Otherwise construct it now
		cell = this._dataSet.cellForItemAtIndexPath(indexPath);
		
		// Request and apply the correct attributes
		cell.attributes = this.layout.attributesForCellAtIndexPath(indexPath);
		
		// Retain the cell, which will also cause it to be rendered then return it
		cell.retain();
		return cell;
	},
	
	
	/**
	 * Finds, retains and returns the cell for the supplementary view at the specified index path, if it exists.
	 * If the specified index path is out of view and it doesn't have a cell associated with it, the cell will be created and returned.
	 * When the cell is no longer needed, it must be released so the collection view can recycle and reuse it.
	 * @param identifier <String>					The type of supplementary view.
	 * {
	 * 	@param forIndexPath <BMIndexPath<T>>		The index path.
	 * }
	 * @return <BMCollectionViewCell, nullable>		The cell if it exists, or undefined if the index path is out of bounds.
	 */
	retainSupplementaryViewWithIdentifier: function (identifier, args) {
		// First check to see if the requested cell already exists
		var cell = this.supplementaryViewWithIdentifier(identifier, {atIndexPath: args.forIndexPath});
		
		if (cell) {
			// If it does, retain it and return it
			cell.retain();
			return cell;
		}
		
		// Request this supplementary view's attributes from the layout. If it cannot provide them, it is considered that the requested
		// identifier or index path is not handled by the layout and no cell can be returned.
		var attributes = this.layout.attributesForSupplementaryViewWithIdentifier(identifier, {atIndexPath: args.forIndexPath});
		
		if (!attributes) return;
		
		// Otherwise construct it now
		cell = this._dataSet.cellForSupplementaryViewWithIdentifier(identifier, {atIndexPath: args.forIndexPath});
		
		// Apply the correct attributes
		cell.attributes = attributes;
		
		// Retain the cell, which will also cause it to be rendered then return it
		cell.retain();
		return cell;
	},
	
	
	
	/************************************* EVENT RECEIVERS ********************************/
	
	
	/**
	 * Will be invoked whenever any cell is clicked or tapped.
	 * @param cell <BMCollectionViewCell>			The cell that was clicked.
	 * {
	 *	@param withEvent <Event>					The event that triggered this method.
	 * }
	 */
	cellWasClicked: function (cell, options) {
		if (options && options.withEvent) options.withEvent._BMOriginalTarget = cell.node;

		// Forward this event to the delegate, giving it a chance to handle the event
		var eventHandled = NO;
		if (this.delegate && this.delegate.collectionViewCellWasClicked) {
			eventHandled = this.delegate.collectionViewCellWasClicked(this, cell, {withEvent: options.withEvent});
		}
		
		// If the delegate did handle this event, do not invoke the default behavior
		if (eventHandled) return;
		
		// The default click behavior is to toggle cells' selection state
		// Ask the delegate if the cell is selectable or deselectable, 
		// depending on whether the cell is currently selected or not.
		var selectable = YES;
		var selected;
		
		
		if (selected = this.isCellAtIndexPathSelected(cell.indexPath)) {
			if (this.delegate && typeof this.delegate.collectionViewCanDeselectCellAtIndexPath === 'function') {
				selectable = this.delegate.collectionViewCanDeselectCellAtIndexPath(this, cell.indexPath);
			}
		}
		else {
			if (this.delegate && typeof this.delegate.collectionViewCanSelectCellAtIndexPath === 'function') {
				selectable = this.delegate.collectionViewCanSelectCellAtIndexPath(this, cell.indexPath);
			}
		}
		
		if (!selectable) return;
		
		// If the cell is selectable, flip its selected state
		if (selected) {
			this.deselectCellAtIndexPath(cell.indexPath);
		}
		else {
			this.selectCellAtIndexPath(cell.indexPath);
		}
		
	},
	
	/**
	 * Will be invoked whenever any cell is double clicked or double tapped.
	 * @param cell <BMCollectionViewCell>		The cell that was clicked.
	 * {
	 *	@param withEvent <Event>				The event that triggered this method.
	 * }
	 */
	cellWasDoubleClicked: function (cell, options) {
		if (options && options.withEvent) options.withEvent._BMOriginalTarget = cell.node;

		// Forward this event to the delegate, giving it a chance to handle the event
		var eventHandled = NO;
		if (this.delegate && this.delegate.collectionViewCellWasDoubleClicked) {
			eventHandled = this.delegate.collectionViewCellWasDoubleClicked(this, cell, {withEvent: options.withEvent});
		}
	},
	
	/**
	 * Will be invoked whenever any cell is long clicked or long tapped.
	 * @param cell <BMCollectionViewCell>		The cell that was clicked.
	 * {
	 *	@param withEvent <Event>				The event that triggered this method.
	 * }
	 */
	cellWasLongClicked: function (cell, options) {
		if (options && options.withEvent) options.withEvent._BMOriginalTarget = cell.node;
		
		// Forward this event to the delegate, giving it a chance to handle the event
		var eventHandled = NO;
		if (this.delegate && this.delegate.collectionViewCellWasLongClicked) {
			eventHandled = this.delegate.collectionViewCellWasLongClicked(this, cell, {withEvent: options.withEvent});
		}
	},
	
	/**
	 * Will be invoked whenever any cell is right clicked.
	 * @param cell <BMCollectionViewCell>			The cell that was clicked.
	 * {
	 *	@param withEvent <Event>					The event that triggered this method.
	 * }
	 * @return <Boolean, nullable>					Defaults to NO. This should be YES if the default behaviour should be supressed, NO otherwise.
	 */
	cellWasRightClicked: function (cell, options) {
		if (options && options.withEvent) options.withEvent._BMOriginalTarget = cell.node;
		
		// Forward this event to the delegate, giving it a chance to handle the event
		var eventHandled = NO;
		if (this.delegate && this.delegate.collectionViewCellWasRightClicked) {
			eventHandled = this.delegate.collectionViewCellWasRightClicked(this, cell, {withEvent: options.withEvent});
		}
		
		return eventHandled;
	},
	
	
	
	/************************************* SELECTION HANDLERS ********************************/
	
	/**
	 * The list of selected index paths.
	 * The index paths in the selection are all strictly compared to the index paths in the data set.
	 * Whenever an update occurs, the selection index paths will also be updated to the new data.
	 */
	_selectedIndexPaths: undefined, // <[BMIndexPath<T>]>
	
	get selectedIndexPaths() { return this._selectedIndexPaths; },
	
	set selectedIndexPaths(indexPaths) {
		var newSelectionLength = indexPaths.length;
		var oldSelection = this._selectedIndexPaths;
		
		this._selectedIndexPaths = indexPaths;
		
		// Look for each index path to determine if it was already selected before
		for (var i = 0; i < newSelectionLength; i++) {
			var indexPath = indexPaths[i];
			
			var isOldIndexPath = NO;
			for (var j = 0; j < oldSelection.length; j++) {
				if (oldSelection[j].isLooselyEqualToIndexPath(indexPath, {usingComparator: this.identityComparator})) {
					isOldIndexPath = YES;
					// If it was already selected, remove it from the old selection list
					// so at the end, the old selection list will only contain the index paths that should be deselected
					oldSelection.splice(j, 1);
					break;
				}
			}
			
			// If it was already selected, there is nothing else to do
			if (isOldIndexPath) continue;
			
			// Otherwise, the index path must be selected
			if (this.delegate && typeof this.delegate.collectionViewDidSelectCellAtIndexPath === 'function') {
				this.delegate.collectionViewDidSelectCellAtIndexPath(this, indexPath);
			}
			
		}
		
		// Then remove selection from old index paths that are no longer selected
		for (var i = 0; i < oldSelection.length; i++) {
		
			// Notify the delegate
			if (this.delegate && typeof this.delegate.collectionViewDidDeselectCellAtIndexPath === 'function') {
				this.delegate.collectionViewDidDeselectCellAtIndexPath(this, oldSelection[i]);
			}
		}
		
	},
	
	/**
	 * Invoked by the collection view during an update to refresh the index paths of the selected cells.
	 * Index paths that are no longer in the data set will be removed and all other index paths will be updated
	 * to the correct section and row indexes.
	 */
	_updateSelectionIndexPaths: function () {
		var oldSelection = this._selectedIndexPaths;
		this._selectedIndexPaths = [];
		
		var oldSelectionLength = oldSelection.length;
		for (var i = 0; i < oldSelectionLength; i++) {
			var indexPath = this.dataSet.indexPathForObject(oldSelection[i].object);
			
			if (indexPath) this._selectedIndexPaths.push(indexPath);
		}
	},
	
	/**
	 * Checks if the cell at the specified index path is selected.
	 * @param indexPath <BMIndexPath<T>>	The index path. This will be loosely compared to the selected index paths.
	 * @return <Boolean>					YES if the cell is selected, NO otherwise.
	 */
	isCellAtIndexPathSelected: function (indexPath) {
		var selectionLength = this._selectedIndexPaths.length;
		for (var i = 0; i < selectionLength; i++) {
			if (indexPath.isLooselyEqualToIndexPath(this._selectedIndexPaths[i], {usingComparator: this.identityComparator})) return YES;
		}
		
		return NO;
	},
	
	/**
	 * Should be invoked to select the cell at the specified index path.
	 * @param indexPath <BMIndexPath<T>>	The index path.
	 */
	selectCellAtIndexPath: function (indexPath) {
		this._selectedIndexPaths.push(indexPath);
		
		// Notify the delegate
		if (this.delegate && typeof this.delegate.collectionViewDidSelectCellAtIndexPath === 'function') {
			this.delegate.collectionViewDidSelectCellAtIndexPath(this, indexPath);
		}
	},
	
	/**
	 * Should be invoked to deselect the cell at the specified index path.
	 * @param indexPath <BMIndexPath<T>>	The index path.
	 */
	deselectCellAtIndexPath: function (indexPath) {
		var selectionLength = this._selectedIndexPaths.length;
		for (var i = 0; i < selectionLength; i++) {
			if (this._selectedIndexPaths[i].isLooselyEqualToIndexPath(indexPath, {usingComparator: this.identityComparator})) {
				this._selectedIndexPaths.splice(i, 1);
				break;
			}
		}
		
		// Notify the delegate
		if (this.delegate && typeof this.delegate.collectionViewDidDeselectCellAtIndexPath === 'function') {
			this.delegate.collectionViewDidDeselectCellAtIndexPath(this, indexPath);
		}
	},
	
	
	
	/************************************* LAYOUT UPDATE *************************************/
	
	
    
    /**
	 * Should be invoked to change this collection view's layout. Optionally, this change may be animated.
	 * Invoking this method with the animated parameter set to `NO` is equivalent to asigning the layout property outside
	 * of an animation context.
	 * 
	 * If an animation context is active when this method is invoked, the value of the `animated` parameter will be ignored
	 * and the animation context's options will override collection view's default options and any overrides supplied by the delegate,
	 * except for its completion handler.
	 * @param layout <BMCollectionViewLayout>				The new layout object to use.
	 * {
	 *	@param animated <Boolean, nullable>					Defaults to NO. If set to YES, this change will be animated.
	 *	@param completionHandler <void ^ (), nullable>		An optional handler to execute when the animated layout change completes.
	 * }
	 */
    setLayout: function (layout, options) {
		// If there is an in-progress animated update, schedule this call for later
		if (this.isUpdatingData) {
			var self = this;
			this.registerDataCompletionCallback(function () {
				self.setLayout(layout, options);
			});
			return;
		}

	    var animated = options && options.animated;
	    
	    if ((!animated && !BMAnimationContextGetCurrent()) || !this.initialized) {
		    // For non-animated changes, just assign the layout property
		    // Additionally, the change should be instant if there is no data set associated with this collection view
		    this.layout = layout;
			
			this._executeDataCompletionCallbacks();
		    
		    // Run the completion handler if it was specified
			if (options && options.completionHandler) options.completionHandler();
			
			// Re-enable layout invalidation
			this._blocksLayoutInvalidation = NO;
		    
		    return;
		}

		// Create a static animation context to prevent unwanted animations during the setup phase
		BMAnimationContextBeginStatic();

		let resolveLayoutUpdate;
		this._dataUpdatePromise = new Promise($1 => resolveLayoutUpdate = $1);

	    // Discard the cached attribute pages
	    this.attributeCache = {};
		
		// Mark this operation as an animated change
		this.isUpdatingData = YES;
		this._collectionEnabled = NO;
	    
	    // Otherwise create and initialize a transition layout and use it to manage the transition
	    
	    // To do that, it is first necessary to obtain the layout information from both the current and previous layout from the layout objects
	    var currentAttributes = [];
		var retainedCellsLength = this.allCells.length;
		
		// Retain all current cells
		var animationCells = [];
	    
	    for (var i = 0; i < retainedCellsLength; i++) {
			currentAttributes.push(this.allCells[i].attributes);
			animationCells.push(this.allCells[i]);
		}
	    
	    var oldOffset = this.scrollOffset;
	    var oldBounds = this._bounds.copy();
		
		// If this change occurs because of an animated frame change, prepare the new layout
		// using the new size
		let pendingFrame = this._pendingFrame;
		let oldFrame = this._frame;
		if (pendingFrame) {
			this._frame = pendingFrame;

			// When using custom scrolling, due to the way scrolling works, off-screen rendering is useless
			// because scrolling is handled by javascript and browser optimizations are suppressed
			this._offscreenBufferSize = this.customScroll ? 0 : Math.max(this._frame.size.width * this.offscreenBufferFactor, this._frame.size.height * this.offscreenBufferFactor);
			
			// Resize the bounds
			this._bounds.size.width = this._frame.size.width + 2 * this._offscreenBufferSize;
			this._bounds.size.height = this._frame.size.height + 2 * this._offscreenBufferSize;
		}
	    
	    // Ask the new layout to prepare its layout
	    layout.collectionView = this;
	    layout.prepareLayout();
	    
		var newSize = layout.contentSize();

		// Resize content wrapper to the largest dimensions; this is no longer needed as the
		// content wrapper is now resized as part of the animation
		// if (newSize.width > this._size.width) {
		// 	this._contentWrapper.css({width: this._size.width + 'px'});
		// }
		// if (newSize.height > this._size.height) {
		// 	this._contentWrapper.css({height: this._size.height + 'px'});
		// }
	    
	    // Check to see if an offset is required
	    var newOffset = layout.preferredScrollOffsetForTransitionFromLayout(this._layout, {withOffset: this.scrollOffset.copy()});
	    
	    // Then ensure that the new offset is constrained to the visible area
	    newOffset.x = Math.max(0, Math.min(newOffset.x, newSize.width - this.frame.size.width));
	    newOffset.y = Math.max(0, Math.min(newOffset.y, newSize.height - this.frame.size.height));
	    
	    // Construct the new bounds with the new scroll offset
	    var newBounds = BMRectMake(newOffset.x - this._offscreenBufferSize, newOffset.y - this._offscreenBufferSize, this._bounds.size.width, this._bounds.size.height);
	    
	    // Request the new attributes from the new layout
	    this._bounds = newBounds;
	    var newAttributes = layout.attributesForElementsInRect(newBounds.copy());
	    
	    // Compare the attribute sets and fill in the missing attributes from both the old and the new layout
	    // For all matching pairs, a transition attributes object will be created that will manage the transition for that cell
	    var transitionAttributes = [];
	    
	    // Supplementary views are decided by the layout and as such, supplementary views may disappear or appear when the layout changes
	    var outgoingSupplementaryViewAttributes = [];
	    
	    while (currentAttributes.length) {
		    var attribute = currentAttributes[currentAttributes.length - 1];
		    
		    var hasAttribute = NO;
			    
			// Cells and supplementary views are treated differently:
			// For two cell attributes to refer to the same item, it is sufficient for their index paths to be equal
			// For supplementary views, it is additionally required for their identifiers to be equal
			// Additionally, with supplementary views, whenever an identical supplementary view is not found in the new layout, 
			// that supplementary view is considered to have been removed because it is not known if the new layout can create
			// supplementary views with the old layout's identifiers or similar index paths
		    if (attribute.itemType === BMCollectionViewLayoutAttributesType.Cell) {
			    var newAttribute;
			    
			    for (var j = 0; j < newAttributes.length; j++) {
				    newAttribute = newAttributes[j];
				    
				    if (newAttribute.itemType !== BMCollectionViewLayoutAttributesType.Cell) continue;
				    
				    if (newAttribute.indexPath.isEqualToIndexPath(attribute.indexPath, {usingComparator: this.identityComparator})) {
					    hasAttribute = YES;
					    // Remove this attribute from the list of new attributes so it will reduce the lookup time for other attributes
					    newAttributes.splice(j, 1);
					    break;
				    }
			    }
			    
			    // If the cell wasn't found, request its attributes from the new layout
			    if (!hasAttribute) {
			    	newAttribute = layout.attributesForCellAtIndexPath(attribute.indexPath);
			    }
			    
			    // Create the transition attributes for this cell
			    var transitionAttribute = _BMCollectionViewTransitionLayoutAttributesMakeWithSourceAttributes(attribute, {targetAttributes: newAttribute});
			    transitionAttributes.push(transitionAttribute);
		    }
		    else {
			    var newAttribute;
			    
			    for (var j = 0; j < newAttributes.length; j++) {
				    newAttribute = newAttributes[j];
				    
				    if (newAttribute.itemType !== BMCollectionViewLayoutAttributesType.SupplementaryView || newAttribute.identifier !== attribute.identifier) continue;
				    
				    if (newAttribute.indexPath.isEqualToIndexPath(attribute.indexPath, {usingComparator: this.identityComparator})) {
					    hasAttribute = YES;
					    // Remove this attribute from the list of new attributes so it will reduce the lookup time for other attributes
					    newAttributes.splice(j, 1);
					    break;
				    }
				    
			    }
			    
			    // If the cell wasn't found, it should be removed
			    if (!hasAttribute) {
				    outgoingSupplementaryViewAttributes.push(attribute);
				    newAttribute = attribute.copy();
				    if (!newAttribute._style) newAttributes._style = {};
				    newAttribute.style.opacity = 0;
				    
				    if (isNaN(attribute.style.opacity)) attribute.style.opacity = 1;
				    
				    var transitionAttribute = _BMCollectionViewTransitionLayoutAttributesMakeWithSourceAttributes(attribute, {targetAttributes: newAttribute});
				    transitionAttributes.push(transitionAttribute);
			    }
			    else {
				    // Otherwise create the transition attributes for this cell
				    var transitionAttribute = _BMCollectionViewTransitionLayoutAttributesMakeWithSourceAttributes(attribute, {targetAttributes: newAttribute});
				    transitionAttributes.push(transitionAttribute);
			    }
			    
		    }
		    
		    // Remove the current attribute from the old attributes
		    currentAttributes.splice(currentAttributes.length - 1, 1);
		    
	    }
	    
	    this._bounds = oldBounds;
	    
	    // Request the old attributes for the remaining new attributes
	    while (newAttributes.length) {
		    var attribute = newAttributes[newAttributes.length - 1];
		    
		    if (attribute.itemType === BMCollectionViewLayoutAttributesType.Cell) {
			    var oldAttribute = this._layout.attributesForCellAtIndexPath(attribute.indexPath);
			    
			    // Create the transition attributes for this cell
			    var transitionAttribute = _BMCollectionViewTransitionLayoutAttributesMakeWithSourceAttributes(oldAttribute, {targetAttributes: attribute});
			    transitionAttributes.push(transitionAttribute);
		    }
		    else {
			    // Supplementary views that didn't have a match should be inserted
			    var oldAttribute = attribute.copy();
			    oldAttribute.style.opacity = 0;
			    
			    if (isNaN(attribute.style.opacity)) attribute.style.opacity = 1;
 			    
			    var transitionAttribute = _BMCollectionViewTransitionLayoutAttributesMakeWithSourceAttributes(oldAttribute, {targetAttributes: attribute});
			    transitionAttributes.push(transitionAttribute);
		    }
		    
		    // Remove the current attribute from the old attributes
		    newAttributes.splice(newAttributes.length - 1, 1);
		    
	    }
	    
	    this._bounds = newBounds;
	    
	    // Construct the transition layout and use it to manage the animated transition
	    var transitionLayout = new _BMCollectionViewTransitionLayout(transitionAttributes, this._size, newSize, layout);
		transitionLayout.collectionView = this;
	    
	    var oldLayout = this._layout;
	    
	    // Unbind the old layout
	    this._layout.collectionView = undefined;
	    
	    // Temporarily make the transition layout the current layout
	    this._layout = transitionLayout;
		
		// Retain all transitioning cells during this change
		let retainedCells = [];
		transitionAttributes.forEach(attribute => {
			if (attribute._itemType == BMCollectionViewLayoutAttributesType.SupplementaryView) {
				retainedCells.push(this.retainSupplementaryViewWithIdentifier(attribute.identifier, {forIndexPath: attribute.indexPath}));
			}
			else {
				retainedCells.push(this.retainCellForIndexPath(attribute.indexPath));
			}
		})
	    		    
	    // Request the animation options from the delegate if it can provide them
	    var delegateOptions = {};
	    if (this.delegate && this.delegate.collectionViewAnimationOptionsForLayoutChangeFromLayout) {
		    delegateOptions = this.delegate.collectionViewAnimationOptionsForLayoutChangeFromLayout(this, oldLayout, {toLayout: layout});
	    }
	    
	    var animationOptions = BMExtend({
		    duration: _BMCollectionViewAnimationDurationDefault,
			easing: _BMCollectionViewAnimationEasingDefault,
			queue: '_BMCollectionViewTransitionLayoutQueue'
	    }, delegateOptions);
	    
	    /*animationOptions.progress = function (elements, complete, remaining, start, tween) {
		    //transitionLayout.fraction = tween;
		    
		    if (delegateOptions.progress) delegateOptions.progress(elements, complete, remaining, start, tween);
		};*/
		
		animationCells.forEach(cell => cell.retain());

		// During the animation, set the size to the union between the previous size and the new size
		// This is to ensure that rendering bounds can be obtain successfully throughout the animation
		// regardless of where the new or old positions of cells might be
		let size = layout.contentSize();
		this._size = BMSizeMake(Math.max(this._size.width, size.width), Math.max(this._size.height, size.height));
	    
	    animationOptions.complete = function () {
			// Request the layout page
			var attributes = transitionLayout.attributesForElementsInRect();
			
			// Create and render the layout elements
			self._renderCellsWithAttributes(attributes, {exclusive: YES});

			self._size = size.copy();

			if (self.iScroll) {
				// Apply the new scroll offset internally to iScroll, if it changed
				if (oldBounds.origin.x != newBounds.origin.x || oldBounds.origin.y != newBounds.origin.y) {
					var targetOffset = newBounds.origin.copy();
					
					targetOffset.x += self._offscreenBufferSize;
					targetOffset.y += self._offscreenBufferSize;
					
					self.iScroll._translate(-targetOffset.x, -targetOffset.y);
				}
			}

			animationCells.forEach(cell => cell.release());
			retainedCells.forEach(cell => cell.release());

			// Let the transition layout apply the final attributes to cells
			transitionLayout._applyFinalAttributes();

			// Unmanage all hidden cells
			self.retainedCells.slice().forEach(function (cell) {
				if (cell.attributes.isHidden) cell._unmanage();
			});

			self._layout = layout;
			
			if (self.iScroll) self.iScroll.refresh();
		    
		    // Unmanage all outgoing supplementary views
		    for (var i = 0; i < outgoingSupplementaryViewAttributes.length; i++) {
			    var attribute = outgoingSupplementaryViewAttributes[i];
			    var cell = self.supplementaryViewWithIdentifier(attribute.identifier, {atIndexPath: attribute.indexPath});
			    
			    if (cell && cell.isManaged) {
				    cell._unmanage();
			    }
			}

			self._collectionEnabled = YES;
			self.isUpdatingData = NO;
			
			self._executeDataCompletionCallbacks();
		    
		    // If the delegate animation options contains a complete handler, invoke it here
		    if (delegateOptions.complete) delegateOptions.complete();
		    
		    // Run the completion handler if it was specified
		    if (options && options.completionHandler) options.completionHandler();

			resolveLayoutUpdate();
	    };
	    
		animationOptions.queue = NO;
		
		this._bounds = oldBounds;
	    
		// Apply the transition attributes to cells
		var attributes = transitionLayout.attributesForElementsInRect();
		this._renderCellsWithAttributes(attributes, {exclusive: YES});

		this._bounds = newBounds;

		// Resolve the static animation context
		BMAnimationApply();
	    
	    // Start the animation
		var self = this;
		let block = () => {

			let controller = BMAnimationContextGetCurrent().controllerForObject(self, {node: self._container[0]});
			transitionLayout.fraction = 1;

			controller.registerCustomProperty('tween', {withHandler: fraction => {
				//transitionLayout.fraction = fraction;
				this._bounds = BMRectByInterpolatingRect(oldBounds, {toRect: newBounds, withFraction: fraction});
				/*let size = transitionLayout.contentSize();

				if (!this._size.isEqualToSize(size)) {
					this._size = size;
					// Resize the content wrapper
					this._contentWrapper.css({width: this._size.width + 'px', height: this._size.height + 'px'});
				}
	    
				// Request the layout page
				var attributes = transitionLayout.attributesForElementsInRect();
				
				// Create and render the layout elements
				this._renderCellsWithAttributes(attributes, {exclusive: YES});*/
			}});

			let wrapperController = BMAnimationContextGetCurrent().controllerForObject(transitionLayout, {node: self._contentWrapper[0]});
			wrapperController.registerBuiltInProperty('width', {withValue: size.width + 'px'});
			wrapperController.registerBuiltInProperty('height', {withValue: size.height + 'px'});

			// Layout the cells
			transitionLayout._layout();

			// Apply the new scroll offset, if it changed
			if (oldBounds.origin.x != self._bounds.origin.x || oldBounds.origin.y != self._bounds.origin.y) {
				var currentOffset = oldOffset;
				var targetOffset = self._bounds.origin.copy();
				
				targetOffset.x += self._offscreenBufferSize;
				targetOffset.y += self._offscreenBufferSize;

				let controller = BMAnimationContextGetCurrent().controllerForObject(self, {node: self._contentWrapper[0]});
				if (self.iScroll) {
					//controller.registerCustomProperty('scrollOffset', {withHandler: fraction => {
						//var offsetX = currentOffset.x + fraction * (targetOffset.x - currentOffset.x);
						//var offsetY = currentOffset.y + fraction * (targetOffset.y - currentOffset.y);
						
						//self.iScroll._translate(-offsetX, -offsetY);
					//}});

					BMHook(self._contentWrapper[0], {translateX: -currentOffset.x + 'px', translateY: -currentOffset.y + 'px'});
					wrapperController.registerBuiltInProperty('translateX', {withValue: -targetOffset.x + 'px'});
					wrapperController.registerBuiltInProperty('translateY', {withValue: -targetOffset.y + 'px'});
				}
				else {
					controller.registerCustomProperty('scrollOffset', {withHandler: fraction => {
						var offsetX = currentOffset.x + fraction * (targetOffset.x - currentOffset.x);
						var offsetY = currentOffset.y + fraction * (targetOffset.y - currentOffset.y);
						
						self._container[0].scrollTo(offsetX, offsetY);
					}});
				}
			}

		};

		let animation = BMAnimationContextGetCurrent();
		if (animation) {
			BMAnimationContextAddCompletionHandler(animationOptions.complete);
			block();
		}
		else {
			BMAnimateWithBlock(block, animationOptions);
		}
	    /*this._container.velocity({
		    tween: [1, 0]
		}, animationOptions);*/
		
		// Re-enable layout invalidation
		this._blocksLayoutInvalidation = NO;
	    
    },
    
    
	
	
	
	/************************************* DATA SET UPDATE ************************************/

	/**
	 * Invoked internally by CoreUI to perform a batched update of layout properties.
	 * Using this method requires the layout object used by this collection view to support copying.
	 * If this method is invoked from within an animation context, this change will be animated.
	 * @param block <void ^ ()>			A block that is executed synchronously in which the relevant layout properties shoudl be modified.
	 * 									Layout updates caused by property updates from within this block will be animated.
	 */
	_updateLayoutWithBlock(block) {
		throw new Error('This method is unavailable');
	},
	
	/**
	 * Contains all registered data update callbacks.
	 */
	_dataUpdateCallbacks: undefined, // <[void ^ ()]>
	
	/**
	 * Schedules a callback that will be invoked when the current or next data update completes.
	 * This callback will only be fired once.
	 * @param callback <void ^ ()>		The callback to invoke.
	 */
	registerDataCompletionCallback: function (callback) {
		this._dataUpdateCallbacks = this._dataUpdateCallbacks || [];
		this._dataUpdateCallbacks.push(callback);
	},
	
	/**
	 * Will be invoked by the collection view as the last step during data updates.
	 * This method fires all registered data update callbacks.
	 */
	_executeDataCompletionCallbacks: function () {
		if (!this._dataUpdateCallbacks) return;
		var length = this._dataUpdateCallbacks.length;
		
		for (var i = 0; i < length; i++) {
			// Fire each callback
			this._dataUpdateCallbacks[i]();
		}
		
		// Then clear the list of callbacks.
		this._dataUpdateCallbacks = [];
	},
	
	/**
	 * Will be invoked after the data set changes.
	 * @param oldDataSet <BMCollectionViewDataSet>	The previous data set.
	 */
	dataSetDidChangeFromDataSet: function (oldDataSet) {
		if (this.initialized) {
			this.invalidateLayout();
		}
		else {
			this._init();
		}
	},
	
	/**
	 * Should be invoked during an update to execute a block of code that will have access to the old data set.
	 * @param block <void ^ ()>		The block to execute;
	 */
	usingOldDataSet: function (block) {
		var useOldData = this.dataSet.isUsingOldData();
		this.dataSet.useOldData(YES);
		this._bounds = this.oldBounds;
		block();
		this._bounds = this.newBounds;
		this.dataSet.useOldData(useOldData);
	},
	
	/**
	 * Should be invoked during an update to execute a block of code that will have access to the new data set.
	 * @param block <void ^ ()>		The block to execute;
	 */
	usingNewDataSet: function (block) {
		var useOldData = this.dataSet.isUsingOldData();
		this.dataSet.useOldData(NO);
		block();
		this.dataSet.useOldData(useOldData);
	},

	/**
	 * A promise initialized during data updates or similar operations such as animated layout updates. 
	 * This promise resolves resolves when the operation and its associated animations complete.
	 */
	_dataUpdatePromise: undefined, // <Promise<void>, nullable>
	
	/**
	 * Should be invoked when the entire data set is updated in bulk.
	 * This method should be invoked when the data set object has access to the new data;
	 * All data set access methods should return the new data, but if this change is animated then until this method returns
	 * the data set object must be able to return information from the old data as well.
	 * @param animated <Boolean, nullable>				Defaults to YES. If set to YES, the data update will be animated, otherwise it will be instant.
	 * {
	 *	@param updateLayout <Boolean, nullable>			Defaults to YES. If set to YES, the collection view will refresh its layout. When set to NO, it will assume
	 *													that the layout does not have to change. Note that if you pass in a value of NO but the structure of your data
	 *													changes in such a way that the layout should be invalidated the collection view may behave in an undefined manner
	 *													until its layout is invalidated. This value must be explicitly set to NO or false to disable the layout refresh.
	 *  @param completionHandler <void ^(), nullable>	If set to a function, this function will be invoked when the update finishes.
	 * }
	 * @return <Promise<void>>							A promise that resolves when this update completes, after any associated animation finishes.
	 */
	updateEntireDataAnimated: function (animated, options) {
		if (!this.initialized) return;

		// Set up a static animation context to supress unintented animations during the set-up phase of the
		// data update
		if (BM_COLLECTION_VIEW_USE_STATIC_CONTEXT) BMAnimationContextBeginStatic();
		
		if (animated === undefined) animated = YES;

		let resolveUpdateData;
		this._dataUpdatePromise = new Promise(function (resolve, reject) {resolveUpdateData = resolve});
		
		// Update the selection index paths
		this._updateSelectionIndexPaths();
		
		if (!animated) {
			// Instant data set changes are identical to layout invalidations.
			this.invalidateLayout();
			
			// Have the data set refresh the contents of each cell
			for (var i = 0; i < this.allCells.length; i++) {
				var cell = this.allCells[i];
				
				if (cell.itemType === BMCollectionViewLayoutAttributesType.Cell) {
					if (this.dataSet.updateCell) this.dataSet.updateCell(cell, {atIndexPath: cell.indexPath});
				}
				else if (cell.itemType === BMCollectionViewLayoutAttributesType.SupplementaryView) {
					if (this.dataSet.updateSupplementaryView) this.dataSet.updateSupplementaryView(cell, {withIdentifier: cell.reuseIdentifier, atIndexPath: cell.indexPath});
				}
			}
			
			this._executeDataCompletionCallbacks();
			resolveUpdateData();
			// Resolve the static animation context prior to returning
			if (BM_COLLECTION_VIEW_USE_STATIC_CONTEXT) BMAnimationApply();
			return this._dataUpdatePromise;
		}
		
		if (options && options.updateLayout === NO) {
			// If the layout doesn't have to update, just have the data set refresh the contents of each cell
			for (var i = 0; i < this.allCells.length; i++) {
				var cell = this.allCells[i];
				
				if (cell.itemType === BMCollectionViewLayoutAttributesType.Cell) {
					// Update the index paths for the cells
					cell.attributes.indexPath = this.dataSet.indexPathForObjectAtRow(cell.indexPath.row, {inSectionAtIndex: cell.indexPath.section});
				
					if (this.dataSet.updateCell) this.dataSet.updateCell(cell, {atIndexPath: cell.indexPath});
				}
				else if (cell.itemType === BMCollectionViewLayoutAttributesType.SupplementaryView) {
					if (this.dataSet.updateSupplementaryView) this.dataSet.updateSupplementaryView(cell, {withIdentifier: cell.reuseIdentifier, atIndexPath: cell.indexPath});
				}
			}
			
			if (options && options.completionHandler) {
				options.completionHandler();
			}
			
			this._executeDataCompletionCallbacks();
			resolveUpdateData();
			// Resolve the static animation context prior to returning
			if (BM_COLLECTION_VIEW_USE_STATIC_CONTEXT) BMAnimationApply();
			return this._dataUpdatePromise;
		}
		
		// Disable collection to prevent the regular layout process from interfering with the animation
		this._collectionEnabled = NO;
		
		// Set the updating flag to YES
		this.isUpdatingData = YES;
		
		// Inform the layout that a full data update will start
		this.layout.collectionViewWillStartUpdates(undefined);
		
		var oldBounds = this._bounds.copy();
		
		this.oldBounds = oldBounds;
		
		// Get the new content size
		var contentSize = this.layout.contentSize().copy();

		// Temporarily swap to the new content size to constrain the bounds appropriately
		let currentSize = this._size;
		this._size = contentSize;
		
		// Ask the layout object for the preferred scroll offset
		var scrollOffset = BMPointMake(this._bounds.origin.x + this._offscreenBufferSize, this._bounds.origin.y + this._offscreenBufferSize);
		var preferredScrollOffset = this.layout.preferredScrollOffsetWithOffset(scrollOffset);
		
		// Displace the bounds by the new scroll offset
		this._bounds.origin.x += preferredScrollOffset.x - scrollOffset.x;
		this._bounds.origin.y += preferredScrollOffset.y - scrollOffset.y;
		
		// Move the bounds if they move outside the content size
		this._constrainBounds();
		
		this.newBounds = this._bounds;

		// Swap back to the old size for the animated change
		this._size = currentSize;
		
		// Disable scrolling and interaction during update
		this._container[0].style.pointerEvents = 'none'; //css({/*overflow: 'hidden', */'pointer-events': 'none'});
		var containerScrollOffset = this.scrollOffset;
		if (!this.iScroll) this._container[0].scrollTo(containerScrollOffset.x, containerScrollOffset.y);
		if (this.scrollView) this.scrollView.scrollingEnabled = NO;
		
		// Get the new content
		var attributes = this.layout.attributesForElementsInRect(this._bounds);
		
		// Discard the old cached layout
		this.attributeCache = {};
		
		var deletedCells = [];
		var insertedCells = [];
		var movingCells = [];
		
		var supplementaryViewsToInsert = this.layout.supplementaryViewsToInsert();
		var supplementaryViewsToDelete = this.layout.supplementaryViewsToDelete();
		
		var oldCells = this.allCells.slice();
		
		// During layout updates, the collection view will be more strict about which cells should be affected by animations
		// As such, only cells that are strictly visible or will be visible in the collection view will be animated
		// Cells that are part of the extended bounds but not actually visible will have their changes applied to them instantly
		// Cells that are animated will have their animatable property set to YES while the update is being prepared
		var visibleRect = new BMRect(BMPointMake(this._bounds.origin.x + this._offscreenBufferSize, this._bounds.origin.y + this._offscreenBufferSize), this._frame.size.copy());
		var currentVisibleRect = new BMRect(BMPointMake(oldBounds.origin.x + this._offscreenBufferSize, oldBounds.origin.y + this._offscreenBufferSize), this._frame.size.copy());
		
		// Compare the current content to the new content and data set
		for (var i = 0; i < oldCells.length; i++) {
			var cell = oldCells[i];
			
			var foundCell = NO;
			
			// Check to see if the cell can be found in the new layout
			for (var j = 0; j < attributes.length; j++) {
				var attribute = attributes[j];
				
				// Skip cells with different item types
				if (cell.itemType !== attribute.itemType) continue;
				
				// Two cells refer to the same object if they are the same type and their index paths are loosely equal
				if (cell.indexPath.isLooselyEqualToIndexPath(attribute.indexPath, {usingComparator: this.identityComparator})) {
					
					// For supplementary views, it is also required that they have the same type identifier
					if (cell.itemType === BMCollectionViewLayoutAttributesType.SupplementaryView && cell.reuseIdentifier !== attribute.identifier) continue;
					
					// If they are equal, mark the cell as moving and continue
					cell.targetAttributes = attribute;
					attribute.initialAttributes = cell.attributes;
					foundCell = YES;
					attributes.splice(j, 1);
					
					// Instruct the data set to update this cell's content
					if (cell.itemType === BMCollectionViewLayoutAttributesType.Cell) {
						if (this.dataSet.updateCell) this.dataSet.updateCell(cell, {atIndexPath: attribute.indexPath});
					}
					else if (cell.itemType === BMCollectionViewLayoutAttributesType.SupplementaryView) {
						if (this.dataSet.updateSupplementaryView) this.dataSet.updateSupplementaryView(cell, {withIdentifier: cell.reuseIdentifier, atIndexPath: attribute.indexPath});
					}
					
					break;
				}
			}
			
			if (foundCell)  continue;
			
			// If the cell wasn't found in the new layout, check to see if its object still exists in the data set
			if (cell.itemType === BMCollectionViewLayoutAttributesType.Cell) {
				var indexPath = this.indexPathForObject(cell.indexPath.object);
				
				// If it still exists, ask for its new position in the layout
				if (indexPath) {
					var attribute = this.layout.attributesForCellAtIndexPath(indexPath);
					cell.targetAttributes = attribute;
					movingCells.push(cell);
					
					// Instruct the data set to update this cell's content
					if (this.dataSet.updateCell) this.dataSet.updateCell(cell, {atIndexPath: attribute.indexPath});
				}
				else {
					// Otherwise the cell was removed from the data set
					var attribute = this.layout.finalAttributesForDisappearingCellAtIndexPath(cell.indexPath, {withTargetAttributes: cell.attributes});
					
					cell.targetAttributes = attribute;
					
					deletedCells.push(cell);
				}
			}
			else if (cell.itemType === BMCollectionViewLayoutAttributesType.SupplementaryView) {
				// For supplementary views, the layout decides if the supplementary view should still exist
				var supplementaryViewDeleted = NO;
				for (var j = 0; j < supplementaryViewsToDelete.length; j++) {
					if (cell.indexPath.isLooselyEqualToIndexPath(supplementaryViewsToDelete[j].indexPath, {usingComparator: this.identityComparator}) && cell.reuseIdentifier == supplementaryViewsToDelete[j].identifier) {
						supplementaryViewDeleted = YES;
						break;
					}
				}
				
				if (!supplementaryViewDeleted) {
					// If the supplementary still exists, find its new attributes
					var attribute = this.layout.attributesForSupplementaryViewWithIdentifier(cell.reuseIdentifier, {atIndexPath: cell.indexPath});
					cell.targetAttributes = attribute;
					movingCells.push(cell);
					
					// Instruct the data set to update this supplementary view's content
					if (this.dataSet.updateSupplementaryView) this.dataSet.updateSupplementaryView(cell, {withIdentifier: cell.reuseIdentifier, atIndexPath: attribute.indexPath});
				}
				else {
					// Otherwise find its final attributes
					cell.targetAttributes = this.layout.finalAttributesForDisappearingSupplementaryViewWithIdentifier(cell.reuseIdentifier, {atIndexPath: cell.indexPath, withTargetAttributes: cell.attributes});
					deletedCells.push(cell);
				}
			}
			
		}
		
		this.dataSet.useOldData(YES);
		
		// Construct the cells for the new attributes
		var newCells = [];

		// If this update occurs because of a drag & drop operation, the collection view's viewport frame will be needed
		var viewportFrame;
		if (this._droppedShadows) {
			viewportFrame = BMRectMakeWithNodeFrame(this._container[0]);
		}
		
		// Compare the remaining new content to the old data set
		for (var i = 0; i < attributes.length; i++) {
			var attribute = attributes[i];
			
			// Skip the attributes that were already resolved
			if (attribute.initialAttributes) continue;
			
			// Find the target attributes in the old data set if it is a cell
			if (attribute.itemType === BMCollectionViewLayoutAttributesType.Cell) {
				var oldIndexPath = this.indexPathForObject(attribute.indexPath.object);
				
				this.dataSet.useOldData(NO);
			
				// Construct the cell for this appearing item
				var newCell = this.dataSet.cellForItemAtIndexPath(attribute.indexPath);
				
				if (oldIndexPath) {
					// If it existed, request the old attributes from the layout
					var oldAttribute = this.layout.initialAttributesForMovingCellFromIndexPath(oldIndexPath, {toIndexPath: attribute.indexPath, withTargetAttributes: attribute});
					attribute.initialAttributes = oldAttribute;
					//oldAttribute.indexPath = attribute.indexPath;
				}
				else {
					// Otherwise this is a new element

					// Check if there is a drop shadow associated with this element and transition from that shadow
					let droppedShadow;
					if (this._droppedShadows && (droppedShadow = this._droppedShadows.get(attribute.indexPath.object))) {
						var initialAttributes = attribute.copy();

						// Figure out the viewport coordinates of the frame
						let frame = attribute.frame.copy();
						frame.offset(-this.scrollOffset.x, -this.scrollOffset.y);
						frame.offset(viewportFrame.left, viewportFrame.top);

						// Figure out the frame of the drop shadow
						// Because BMRectMakeWithNodeFrame takes transforms (including rotation) into account,
						// the rotation is temporarily removed to improve the fidelity of the animation
						BMHook(droppedShadow.node, {rotateZ: '0deg'});
						let dropFrame = BMRectMakeWithNodeFrame(droppedShadow.node);
						BMHook(droppedShadow.node, {rotateZ: droppedShadow.rotation + 'deg'});

						// Find the transform to be applied to the cell
						let cellTransform = frame.rectWithTransformToRect(dropFrame);
						// Find the reverse transform to be applied to the drop shadow and save it for the frame
						let shadowTransform = dropFrame.rectWithTransformToRect(frame);
						droppedShadow.transform = shadowTransform;

						// Offset the frame back into collection view coordinates
						frame.offset(this.scrollOffset.x, this.scrollOffset.y);
						frame.offset(-viewportFrame.left, -viewportFrame.top);

						// Apply the transform to the initial attributes
						frame.origin.x += cellTransform.origin.x;
						frame.origin.y += cellTransform.origin.y;

						initialAttributes.frame = frame;
						initialAttributes.style.rotateZ = droppedShadow.rotation + 'deg';
						initialAttributes.style.scaleX = cellTransform.size.width;
						initialAttributes.style.scaleY = cellTransform.size.height;
						initialAttributes.style.opacity = 0;
					}
					else {
						var initialAttributes = this.layout.initialAttributesForAppearingCellAtIndexPath(attribute.indexPath, {withTargetAttributes: attribute});
					}
					
					attribute.initialAttributes = initialAttributes;
					//initialAttributes.indexPath = attribute.indexPath;
				}
				
				newCell.attributes = attribute.initialAttributes;
					
				newCell.targetAttributes = attribute;
				newCell._manage();
				newCells.push(newCell);
				
				this.dataSet.useOldData(YES);
			}
			else if (attribute.itemType === BMCollectionViewLayoutAttributesType.SupplementaryView) {
				this.dataSet.useOldData(NO);
					
				// For supplementary views, check if this supplementary view is a new one
				var supplementaryViewInserted = NO;
				for (var j = 0; j < supplementaryViewsToInsert.length; j++) {
					if (attribute.indexPath.isLooselyEqualToIndexPath(supplementaryViewsToInsert[j].indexPath, {usingComparator: this.identityComparator}) && attribute.identifier == supplementaryViewsToInsert[j].identifier) {
						supplementaryViewInserted = YES;
						break;
					}
				}
				
				if (supplementaryViewInserted) {
					// If this is a new supplementary view, request its initial attributes
					var initialAttributes = this.layout.initialAttributesForAppearingSupplementaryViewWithIdentifier(attribute.identifier, {atIndexPath: attribute.indexPath, withTargetAttributes: attribute});
					attribute.initialAttributes = initialAttributes;
					//initialAttributes.indexPath = attribute.indexPath;
				}
				else {
					// Otherwise find its old attributes
					var initialAttributes = this.layout.initialAttributesForMovingSupplementaryViewWithIdentifier(attribute.identifier, {atIndexPath: attribute.indexPath, withTargetAttributes: attribute});
					attribute.initialAttributes = initialAttributes;
					//initialAttributes.indexPath = attribute.indexPath;
				}
			
				// Construct the cell for this appearing supplementary view
				var newCell = this.dataSet.cellForSupplementaryViewWithIdentifier(attribute.identifier, {atIndexPath: attribute.indexPath});
				
				newCell.attributes = attribute.initialAttributes;
				newCell.targetAttributes = attribute;
				newCell._manage();
				newCells.push(newCell);
				
				this.dataSet.useOldData(YES);
			}
			
		}
		
		this.dataSet.useOldData(NO);
		
		var self = this;
		
		var contentSizeWidthApplied = NO;
		var contentSizeHeightApplied = NO;
		
		// Instantly apply changes to non-animatable cells
		for (var i = 0; i < oldCells.length; i++) {
			var cell = oldCells[i];
					
			if (visibleRect.intersectsRect(cell.targetAttributes.frame) || visibleRect.intersectsRect(cell.attributes.frame) ||
				currentVisibleRect.intersectsRect(cell.targetAttributes.frame) || currentVisibleRect.intersectsRect(cell.attributes.frame)) {
				cell.animatable = YES;

				// Manage cells that move from an invisible location to a visible location
				if (cell.targetAttributes.frame.intersectsRect(visibleRect)) {
					cell._manage();
				}
			}
			else {
				cell.animatable = NO;
				cell.attributes = cell.targetAttributes;
			}
		}
		
		for (var i = 0; i < newCells.length; i++) {
			var cell = newCells[i];
					
			if (visibleRect.intersectsRect(cell.targetAttributes.frame) || visibleRect.intersectsRect(cell.attributes.frame) ||
				currentVisibleRect.intersectsRect(cell.targetAttributes.frame) || currentVisibleRect.intersectsRect(cell.attributes.frame)) {
				cell.animatable = YES;
			}
			else {
				cell.animatable = NO;
				cell.attributes = cell.targetAttributes;
			}
		}

		// Resolve the static animation context
		if (BM_COLLECTION_VIEW_USE_STATIC_CONTEXT) BMAnimationApply();
		    
	    // Request the animation options from the delegate if it can provide them
	    var delegateOptions = {};
	    if (this.delegate && this.delegate.collectionViewAnimationOptionsForUpdateAnimation) {
		    delegateOptions = this.delegate.collectionViewAnimationOptionsForUpdateAnimation(this);
	    }
	    
	    var animationOptions = BMExtend({
		    duration: this.isDragging ? 200 : _BMCollectionViewAnimationDurationDefault, 
		    easing: _BMCollectionViewAnimationEasingDefault, 
		    queue: NO
	    }, delegateOptions);
	    
	    animationOptions.complete = function () {
			if (animationComplete) {
				return;
			}
			animationComplete = YES;
			
			// Apply the new size now if it wasn't already applied earlier
			if (!contentSizeWidthApplied) {
				self._contentWrapper.css({width: contentSize.width + 'px'});
			} 
			if (!contentSizeHeightApplied) {
				self._contentWrapper.css({height: contentSize.height + 'px'});
			}
			
			// Release the moved cells
			for (var i = 0; i < movingCells.length; i++) {
				movingCells[i].animatable = YES;
				movingCells[i]._unmanage();
			}
			
			// Release all animation-retained cells
			for (var i = 0; i < animationCells.length; i++) {
				animationCells[i].animatable = YES;
				animationCells[i].release();

				// Additionally, unmanage hidden cells
				if (animationCells[i].attributes.isHidden) animationCells[i]._unmanage();
			}
			
			// Destroy the deleted cells
			for (var i = 0; i < deletedCells.length; i++) {
				deletedCells[i].animatable = YES;
				deletedCells[i].recycle();
			}
			
			self._applyOverflows();
			self._container[0].style.pointerEvents = 'inherit';//.css({'pointer-events': 'inherit'});
			
			if (self.scrollView) self.scrollView.scrollingEnabled = YES;
		
			self._collectionEnabled = YES;
		
			// Set the updating flag back to NO
			self.isUpdatingData = NO;
			
			self._executeDataCompletionCallbacks();
			
			if (options && options.completionHandler) options.completionHandler();
			if (delegateOptions.complete) delegateOptions.complete.apply(this, arguments);

			// Resolve the promise
			resolveUpdateData();
			
		};
		
		
					
		// Apply the new scroll offset, if it changed
		/*if (oldBounds.origin.x != self._bounds.origin.x || oldBounds.origin.y != self._bounds.origin.y) {
			
			if (self.scrollView) {
				var currentOffset = self.scrollView.offset.copy();
				var targetOffset = self._bounds.origin.copy();
				
				targetOffset.x += self._offscreenBufferSize;
				targetOffset.y += self._offscreenBufferSize;

				animationOptions.progress = function (elements, fraction) {
					var offsetX = currentOffset.x + fraction * (targetOffset.x - currentOffset.x);
					var offsetY = currentOffset.y + fraction * (targetOffset.y - currentOffset.y);
					
					self.scrollView.offset = BMPointMake(offsetX, offsetY);
				}
			}
			else if (self.iScroll) {
				var currentOffset = scrollOffset;
				var targetOffset = self._bounds.origin.copy();
				
				targetOffset.x += self._offscreenBufferSize;
				targetOffset.y += self._offscreenBufferSize;

				animationOptions.progress = function (elements, fraction) {
					var offsetX = currentOffset.x + fraction * (targetOffset.x - currentOffset.x);
					var offsetY = currentOffset.y + fraction * (targetOffset.y - currentOffset.y);
					
					self.iScroll._translate(-offsetX, -offsetY);
				}
			}
			else {
				var currentOffset = scrollOffset;
				var targetOffset = self._bounds.origin.copy();
				
				targetOffset.x += self._offscreenBufferSize;
				targetOffset.y += self._offscreenBufferSize;

				animationOptions.progress = function (elements, fraction) {
					var offsetX = currentOffset.x + fraction * (targetOffset.x - currentOffset.x);
					var offsetY = currentOffset.y + fraction * (targetOffset.y - currentOffset.y);
					
					self._container[0].scrollTo(offsetX, offsetY);
				}
			}
		
		}*/
		
		// All cells involved in the animation will be retained for the duration of the animation
		// And then released at the end
		var animationCells = [];
		
		var animationComplete = NO;

		let animationBlock = function () {
			
			// Apply the animations

			// Apply the drop shadow animations if needed
			if (self._droppedShadows) {
				self._droppedShadows.forEach(shadow => {
					if (shadow.transform) {
						BMHook(shadow.node, {rotateZ: shadow.rotation});
						let controller = BMAnimationContextGetCurrent().controllerForObject(shadow, {node: shadow.node});
						controller.registerBuiltInProperty('translateX', {withValue: shadow.transform.origin.x + 'px'});
						controller.registerBuiltInProperty('translateY', {withValue: shadow.transform.origin.y + 'px'});
						controller.registerBuiltInProperty('scaleX', {withValue: shadow.transform.size.width});
						controller.registerBuiltInProperty('scaleY', {withValue: shadow.transform.size.height});
						controller.registerBuiltInProperty('rotateZ', {withValue: '0deg'});
						controller.registerBuiltInProperty('opacity', {withValue: 0});
					}
					else {
						BMHook(shadow.node, {rotateZ: shadow.rotation});
						let controller = BMAnimationContextGetCurrent().controllerForObject(shadow, {node: shadow.node});
						controller.registerBuiltInProperty('scaleX', {withValue: .33});
						controller.registerBuiltInProperty('scaleY', {withValue: .33});
						controller.registerBuiltInProperty('opacity', {withValue: 0});
					}
				});
			}

			// Apply the new scroll offset, if it changed
			if (oldBounds.origin.x != self._bounds.origin.x || oldBounds.origin.y != self._bounds.origin.y) {
				var currentOffset = scrollOffset;
				var targetOffset = self._bounds.origin.copy();
				
				targetOffset.x += self._offscreenBufferSize;
				targetOffset.y += self._offscreenBufferSize;

				let controller = BMAnimationContextGetCurrent().controllerForObject(self, {node: self._container[0]});
				if (self.iScroll) {
					controller.registerCustomProperty('scrollOffset', {withHandler: fraction => {
						var offsetX = currentOffset.x + fraction * (targetOffset.x - currentOffset.x);
						var offsetY = currentOffset.y + fraction * (targetOffset.y - currentOffset.y);
						
						self.iScroll._translate(-offsetX, -offsetY);
					}});
				}
				else {
					controller.registerCustomProperty('scrollOffset', {withHandler: fraction => {
						var offsetX = currentOffset.x + fraction * (targetOffset.x - currentOffset.x);
						var offsetY = currentOffset.y + fraction * (targetOffset.y - currentOffset.y);
						
						self._container[0].scrollTo({left: offsetX, top: offsetY, behavior: 'auto'});
					}});
				}
			}

			// Inform the cells that an animated update is about to be run
			for (let cell of oldCells.concat(newCells)) {
				cell.prepareForAnimatedUpdate();
			}
			
			// Add the new attributes to the old cells
			for (var i = 0; i < oldCells.length; i++) {
				var cell = oldCells[i];
				if (!cell.animatable) continue;
				
				cell.attributes = cell.targetAttributes;
				cell.animatable = NO;
				
				animationCells.push(cell.retain());
			}
			
			// Add the target attributes to the new cells
			for (var i = 0; i < newCells.length; i++) {
				var cell = newCells[i];
				if (!cell.animatable) continue;
				
				cell.attributes = cell.targetAttributes;
				cell.animatable = NO;
				
				animationCells.push(cell.retain());
			}


			// Dequeue the layout queue if the change will cause any cell to be resized
			// This will cause the layout to animate as well
			self._cellLayoutQueue.dequeue();
			
			// Resize the content wrapper now if any of the new sizes is larger
			if (self._size.width < contentSize.width) {
				self._contentWrapper.css({width: contentSize.width + 'px'}); 
				contentSizeWidthApplied = YES;
			} 
			if (self._size.height < contentSize.height) {
				self._contentWrapper.css({height: contentSize.height + 'px'});
				contentSizeHeightApplied = YES;
			}
			
			self._size = contentSize;
			
			// Inform the layout that the full data update has finished preparing and all animations were started
			self.layout.collectionViewDidStartUpdates();
			
		};

		// Dequeue the cell layout queue to layout newly created cells prior to the animation starting. This will prevent unnecessary animations
		// from running if the new attributes do not modify the size for those cells. For other cells, it will improve the fidelity of the animation
		// as the cell will have a chance to lay out using the previous layout attributes
		this._cellLayoutQueue.dequeue();

		// Commit all prepared animations, using either a new animation context or the existing one, if there is one
		if (BMAnimationContextGetCurrent()) {
			animationBlock();
			BMAnimationContextAddCompletionHandler(animationOptions.complete);
		}
		else {
			BMAnimateWithBlock(animationBlock, animationOptions);
		}
		
		this.newBounds = undefined;
		this.oldBounds = undefined;
		
		// If no cells should be changed, immediately run the completion handler
		if (newCells.length == 0 && oldCells.length == 0) {
			animationOptions.complete();
		}

		// Return the promise that may be awaited upon
		return this._dataUpdatePromise;
		
	},
    
	
	
	
	/************************************* DATA SET DELTA UPDATES ************************************/
	
	beginUpdatesWithBlock: function (block) {
		throw new Error('This method is unavailable.')
	},
	
	
	/************************************* MANAGING SCROLL POSITION *************************************/
	
	/**
	 * Should be invoked to cause the collection view to scroll to the cell at the specified index path.
	 * Optionally, this scrolling may be animated.
	 * @param indexPath <BMIndexPath<T>>												The index path of the cell to scroll to.
	 * {
	 *	@param withVerticalGravity <BMCollectionViewScrollingGravityVertical, nullable>	Defaults to `BMCollectionViewScrollingGravityVertical.Top`. The scroll gravity to use, 
	 *																					which controls where on the screen the cell should appear after the scrolling operation
	 *																					completes.
	 *	@param horizontalGravity <BMCollectionViewScrollingGravityHorizontal, nullable>	Defaults to `BMCollectionViewScrollingGravityHorizontal.Left`. The scroll gravity to use, 
	 *																					which controls where on the screen the cell should appear after the scrolling operation
	 *																					completes.
	 *	@param animated <Boolean, nullable>												Defaults to `NO`. If set to `YES`, the scroll will be animated, otherwise it will be 
	 *																					instant.
	 * }
	 * @return <Promise<undefined>>														A promise that resolves when this operation completes.
	 */
	scrollToCellAtIndexPath: function (indexPath, options) {
		var rect = this._layout.rectWithScrollingPositionOfCellAtIndexPath(indexPath);
		
		if (rect) {
			var verticalGravity = (options && options.withVerticalGravity) || BMCollectionViewScrollingGravityVertical.Top;
			var horizontalGravity = (options && options.horizontalGravity) || BMCollectionViewScrollingGravityHorizontal.Left;
			var animated = options && options.animated;
			return this.scrollToRect(rect, {withVerticalGravity: verticalGravity, horizontalGravity: horizontalGravity, animated: animated});
		}

		return Promise.resolve();
	},
	
	/**
	 * Should be invoked to cause the collection view to scroll to the supplementary view of the given type at the specified index path.
	 * Optionally, this scrolling may be animated.
	 * @param identifier <String>														The supplementary view's type identifier.
	 * {
	 *	@param atIndexPath <BMIndexPath<T>>												The index path of the supplementary view to scroll to.
	 *	@param verticalGravity <BMCollectionViewScrollingGravityVertical, nullable>		Defaults to BMCollectionViewScrollingGravityVertical.Top. The scroll gravity to use, 
	 *																					which controls where on the screen the cell should appear after the scrolling operation
	 *																					completes.
	 *	@param horizontalGravity <BMCollectionViewScrollingGravityHorizontal, nullable>	Defaults to BMCollectionViewScrollingGravityHorizontal.Left. The scroll gravity to use, 
	 *																					which controls where on the screen the cell should appear after the scrolling operation
	 *																					completes.
	 *	@param animated <Boolean, nullable>												Defaults to NO. If set to YES, the scroll will be animated, otherwise it will be 
	 *																					instant.
	 * }
	 * @return <Promise<undefined>>														A promise that resolves when this operation completes.
	 */
	scrollToSupplementaryViewWithIdentifier: function (identifier, options) {
		var rect = this._layout.rectWithScrollingPositionOfSupplementaryViewWithIdentifier(identifier, {atIndexPath: options.atIndexPath});
		
		if (rect) {
			var verticalGravity = options.verticalGravity || BMCollectionViewScrollingGravityHorizontal.Top;
			var horizontalGravity = options.horizontalGravity || BMCollectionViewScrollingGravityHorizontal.Left;
			var animated = options.animated;
			return this.scrollToRect(rect, {withVerticalGravity: verticalGravity, horizontalGravity: horizontalGravity, animated: animated});
		}

		return Promise.resolve();
	},
	
	/**
	 * Will be invoked by the collection view to scroll to a rect. The rect's coordinates are relative to the collection view's content.
	 * @param rect <BMRect>															The rect to scroll to
	 * {
	 *	@param withVerticalGravity <BMCollectionViewScrollingGravityVertical>		The vertical scroll gravity to use, which controls where on the screen the cell should 
	 *																				appear after the scrolling operation completes.
	 *	@param horizontalGravity <BMCollectionViewScrollingGravityHorizontal>		The horizontal scroll gravity to use, which controls where on the screen the cell should 
	 *																				appear after the scrolling operation completes.
	 *	@param animated <Boolean, nullable>											Defaults to NO. If set to YES, the scroll will be animated, otherwise it will be instant.
	 * }
	 * @return <Promise<undefined>>													A promise that resolves when this operation completes.
	 */
	scrollToRect: function (rect, options) {
		// Find the scroll offset depending on the gravity
		var offset = BMPointMake();
		
		// First the vertical Y offset
		if (options.withVerticalGravity == BMCollectionViewScrollingGravityVertical.Top) {
			offset.y = rect.origin.y;
		}
		else if (options.withVerticalGravity == BMCollectionViewScrollingGravityVertical.Center) {
			offset.y = rect.origin.y + rect.size.height / 2 - this.frame.size.height / 2;
		}
		else if (options.withVerticalGravity == BMCollectionViewScrollingGravityVertical.Bottom) {
			offset.y = rect.origin.y + rect.size.height - this.frame.size.height / 2;
		}
		
		// Then the horizontal X offset
		if (options.withVerticalGravity == BMCollectionViewScrollingGravityHorizontal.Left) {
			offset.x = rect.origin.x;
		}
		else if (options.withVerticalGravity == BMCollectionViewScrollingGravityHorizontal.Center) {
			offset.x = rect.origin.x + rect.size.width / 2 - this.frame.size.width / 2;
		}
		else if (options.withVerticalGravity == BMCollectionViewScrollingGravityHorizontal.Right) {
			offset.x = rect.origin.x + rect.size.width - this.frame.size.width / 2;
		}
		
		// Scroll to the offset point
		if (options.animated) {
			var self = this;
			return BMAnimateWithBlock(_ => {
				self.scrollOffset = offset;
			}, {duration: 300});

			/*
			// Scrolling is performed differently based on whether iScroll is used or not
			if (this.iScroll) {
				this.iScroll.scrollTo(-(offset.x | 0), -(offset.y | 0), 300, IScroll.utils.ease.quadratic);
				
				// For iScroll, the layout should be refreshed after the animation
				var self = this;
				window.setTimeout(function () {
					self._handleNewScrollFromEvent({x: offset.x, y: offset.y});
				}, 316);
			}
			else {
				// For native scrolling, jQuery animations are used instead
				var startingPoint = this.scrollOffset.copy();
				var targetPoint = offset;
				var self = this;
				this._container.velocity({
					tween: 1
				}, {
					duration: 300,
					queue: NO,
					progress: function (elements, completion) {
						self._container[0].scrollLeft = ((targetPoint.x - startingPoint.x) * completion + startingPoint.x) | 0;
						self._container[0].scrollTop = ((targetPoint.y - startingPoint.y) * completion + startingPoint.y) | 0;

						self._handleNewScrollFromEvent(null);
					},
					complete: function () {

						self._handleNewScrollFromEvent(null);
					}
				});
			}
			*/
		}
		else {
			// Scrolling is performed differently based on whether iScroll is used or not
			if (this.iScroll) {
				this.iScroll.scrollTo(-(offset.x | 0), -(offset.y | 0));
			}
			else {
				this._container[0].scrollLeft = offset.x;
				this._container[0].scrollTop = offset.y;
			}

			return Promise.resolve();
		}
		
	},

	/**
	 * A unique identifier associated with this collection view.
	 */
	__UUID: undefined, // <String>
	get _UUID() {
		return this.__UUID || (this.__UUID = BMUUIDMake());
	},

	/**
	 * A property that is set to YES while the collection view is performing an animated scrolling operation.
	 */
	_isPerformingAnimatedScrolling: NO, // <Boolean>

	/**
	 * Causes the collection view to scroll to the given offset.
	 * If this method is invoked from within an animation context, this change will be animated.
	 * @param offset <BMPoint>			The scrolling offset to scroll to.
	 */
	_scrollToOffset: function (offset) {
        if (BMAnimationContextGetCurrent()) {
            var animation = BMAnimationContextGetCurrent();

			var subscriber = animation.subscribers.get(this);
			var self = this;

			if (!subscriber) {
				// Scrolling is performed by registering a dummy animation on the 'container' element and handled during the animation progress function
				let progress;
				if (self.iScroll) {
					// For iScroll, the internal `_translate` function is invoked for scrolling, manually triggering the _handleNewScrollFromEvent method
					progress = (elements, _2, _3, _4, completion) => {
						let targetPoint = subscriber.targetOffset;
						let startingPoint = subscriber.startingOffset;
						var offset = BMPointMake(
							((targetPoint.x - startingPoint.x) * completion + startingPoint.x) | 0,
							((targetPoint.y - startingPoint.y) * completion + startingPoint.y) | 0
						);
						self.iScroll._translate(-offset.x, -offset.y);

						self._handleNewScrollFromEvent({x: offset.x, y: offset.y});
					}
				}
				else {
					// For DOM scrolling, the usual scrollLeft and scrollTop properties are used, manually triggering the _handleNewScrollFromEvent method
					progress = (elements, _2, _3, _4, completion) => {
						let targetPoint = subscriber.targetOffset;
						let startingPoint = subscriber.startingOffset;
						self._container[0].scrollLeft = ((targetPoint.x - startingPoint.x) * completion + startingPoint.x) | 0;
						self._container[0].scrollTop = ((targetPoint.y - startingPoint.y) * completion + startingPoint.y) | 0;

						self._handleNewScrollFromEvent(null);
					}
				}

                subscriber = {
                    //
                    // The apply method is invoked by the animation engine when the animation is applied.
                    // The subscribers should use this method to finish preparing their target and properties attributes for the animation.
                    // @param animation <BMAnimation>       The animation object.
                    //
                    apply: function (animation) {
						if (self._isPerformingAnimatedScrolling) self._stopAnimatedScrolling();

						self._container[0].style.pointerEvents = 'none';
						self._isPerformingAnimatedScrolling = YES;
                        animation.targets.push({element: self._container[0], properties: {tween: 1}, complete: _ => {
							self._container[0].style.pointerEvents = 'inherit';
							self._isPerformingAnimatedScrolling = NO;
                        }, options: {progress: progress, queue: self._UUID}});
                    },
					targetOffset: offset.copy(),
					startingOffset: self.scrollOffset.copy()
                };

                animation.subscribers.set(this, subscriber);
			}
			else {
				subscriber.targetOffset = offset.copy();
				subscriber.startingOffset = self.scrollOffset.copy();
			}
		}
		else {
			var self = this;
			if (self._isPerformingAnimatedScrolling) self._stopAnimatedScrolling();
			// Scrolling is performed differently based on whether iScroll is used or not
			if (this.iScroll) {
				this.iScroll.scrollTo(-(offset.x | 0), -(offset.y | 0));
				this._handleNewScrollFromEvent({x: offset.x, y: offset.y});
			}
			else {
				this._container[0].scrollLeft = offset.x;
				this._container[0].scrollTop = offset.y;
			}

			/*this._bounds = this._bounds.copy();
			this._bounds.origin.x = offset.x - this._offscreenBufferSize;
			this._bounds.origin.y = offset.y - this._offscreenBufferSize;*/
		}
	},

	/**
	 * Invoked internally to stop an animated scrolling operation.
	 * The animation will be stopped in its tracks and will not snap to its final coordinates. 
	 */
	_stopAnimatedScrolling() {
		if (this._isPerformingAnimatedScrolling) {
			(window.Velocity || $.Velocity)(this._container[0], 'stop', this.__UUID);
			this._container[0].style.pointerEvents = 'inherit';
			this._isPerformingAnimatedScrolling = NO;
		}
	},
	
	
	/************************************* CELL ENUMERATION *************************************/
	
	/**
	 * Invokes the specified block once for every cell regardless of whether it is a visible cell,
	 * a retained off-screen cell or a cached unbound cell.
	 * The order in which the cells are enumerated is not defined. You should not rely on any particular ordering for these cells.
	 * @param block <Boolean ^ (BMCollectionViewCell, BMCollectionViewLayoutAttributesType, String, Boolean)>		The block to invoke for every cell. This block takes the following parameters:
	 *				<ul><li> <b>cell</b>: BMCollectionViewCell -					The cell.</li>
	 *				<li> <b>type</b>: BMCollectionViewLayoutAttributesType -		The type of view this cell represents. Can be .Cell or .SupplementaryView.</li>
	 *				<li> <b>identifier</b>: String, nullable -						For supplementary views, this is the identifier of the supplementary view's type. For cells
	 *																				in the data set, this parameter will be undefined.</li>
	 *				<li> <b>isBound</b>: Boolean -									YES if this cell is bound to a data set object, NO if this cell is a cached unbound cell.</li></ul>
	 *			The block may optionally return a boolean value. If that value is NO, the enumeration will stop at the current step, otherwise the enumeration
	 *			will continue until the block has been invoked for each cell.
	 */
	enumerateAllCellsWithBlock: function (block) {
		var allCellsLength = this.allCells.length;
		
		for (var i = 0; i < allCellsLength; i++) {
			var cell = this.allCells[i];
			
			var result = block(cell, cell.itemType, cell.itemType === BMCollectionViewLayoutAttributesType.SupplementaryView ? cell.reuseIdentifier : undefined, YES);
			
			if (result === NO) break;
		}
		
		// Enumerate the cached cells
		for (var key in this.cellCache) {
			var cache = this.cellCache[key];
			
			if (cache && cache.length) {
				var cacheLength = cache.length;
				for (var i = 0; i < cacheLength; i++) {
					var cell = cache[i];
					
					var result = block(cell, cell.itemType, undefined, NO);
					
					if (result === NO) break;
				}
			}
		}
		
		// Enumerate the cached supplementary view
		for (var key in this.supplementaryViewCache) {
			var cache = this.cellCache[key];
			var reuseIdentifier = key;
			
			if (cache && cache.length) {
				var cacheLength = cache.length;
				for (var i = 0; i < cacheLength; i++) {
					var cell = cache[i];
					
					var result = block(cell, cell.itemType, reuseIdentifier, NO);
					
					if (result === NO) break;
				}
			}
		}
	},
	
	
	/**
	 * Invokes the specified block once for every cell that is visible or off-screen but retained and bound to a data set object.
	 * The order in which the cells are enumerated is not defined. You should not rely on any particular ordering for these cells.
	 * @param block <Boolean ^ (BMCollectionViewCell, BMCollectionViewLayoutAttributesType, String)>		The block to invoke for every cell. This block takes the following parameters:
	 *				<ul><li> <b>cell</b>: BMCollectionViewCell -				The cell.</li>
	 *				<li> <b>type</b>: BMCollectionViewLayoutAttributesType -	The type of view this cell represents. Can be .Cell or .SupplementaryView.</li>
	 *				<li> <b>identifier</b>: String, nullable -					For supplementary views, this is the identifier of the supplementary view's type. For cells
	 *																			in the data set, this parameter will be undefined.</li></ul>
	 *			The block may optionally return a boolean value. If that value is NO, the enumeration will stop at the current step, otherwise the enumeration
	 *			will continue until the block has been invoked for each cell.
	 */
	enumerateRetainedCellsWithBlock: function (block) {
		var allCellsLength = this.allCells.length;
		
		for (var i = 0; i < allCellsLength; i++) {
			var cell = this.allCells[i];
			
			var result = block(cell, cell.itemType, cell.itemType === BMCollectionViewLayoutAttributesType.SupplementaryView ? cell.reuseIdentifier : undefined);
			
			if (result === NO) break;
		}
	},
	
	
	
	/**
	 * Invokes the specified block once for every cell that is visible on screen.
	 * The order in which the cells are enumerated is not defined. You should not rely on any particular ordering for these cells.
	 * @param block <Boolean ^ (BMCollectionViewCell, BMCollectionViewLayoutAttributesType, String)>		The block to invoke for every cell. This block takes the following parameters:
	 *				<ul><li> <b>cell</b>: BMCollectionViewCell -				The cell.</li>
	 *				<li><b>type</b>: BMCollectionViewLayoutAttributesType -		The type of view this cell represents. Can be .Cell or .SupplementaryView.</li>
	 *				<li><b>identifier</b>: String, nullable -					For supplementary views, this is the identifier of the supplementary view's type. For cells
	 *													 						in the data set, this parameter will be undefined.</li></ul>
	 *			The block may optionally return a boolean value. If that value is NO, the enumeration will stop at the current step, otherwise the enumeration
	 *			will continue until the block has been invoked for each cell.
	 */
	enumerateVisibleCellsWithBlock: function (block) {
		var retainedCellsLength = this.retainedCells.length;
		
		for (var i = 0; i < retainedCellsLength; i++) {
			var cell = this.retainedCells[i];
			
			var result = block(cell, cell.itemType, cell.itemType === BMCollectionViewLayoutAttributesType.SupplementaryView ? cell.reuseIdentifier : undefined);
			
			if (result === NO) break;
		}
	},
	
	
	/************************************* DESTRUCTION *************************************/
	
	/**
	 * This method should only be invoked prior to invoking release, if this collection view will be animated entirely prior to being released.
	 * This will remove any effects that prevent the cell elements or the collection view itself from being included in the container's layer,
	 * which may affect performance if the collection view is displaying a large number of cells.
	 * This will cause any transform or opacity styles to be removed from all cells, which may affect the fidelity
	 * of the resulting layer.
	 * This will also disable interaction with collection view.
	 * At some point after invoking this method, release should be invoked. This collection view should not be reused in the meantime.
	 */
	flatten: function () {
		if (!this.initialized) return;
		
		var self = this;
		this.enumerateAllCellsWithBlock(function (cell, _, __, isBound) {
			// Bound cells should be flattened
			if (isBound) {
				cell.attributes._flatten();
			}
			else {
				// Unbound cells should be removed from the layout
				cell.element[0].style.display = 'none';
			}
		});
		
		// Disable collection, interaction and scrolling
		this._collectionEnabled = NO;
		this._container[0].style.overflow = 'hidden';
		this._container[0].style.pointerEvents = 'none';
	},
	
	/**
	 * Should be invoked when the collection view is no longer needed.
	 * Removes all cells, custom scrollbars and content wrappers and relinquishes control of the container element.
	 * This collection view instance should not be reused after invoking this method.
     * Additionally, all references to this collection view should be cleared to allow the garbage collector
     * to reclaim its memory.
	 */
	release: function () {
		var self = this;

		_BMCollectionViews.delete(this);
		
		// Unbind the scroll event listener
		if (this.initialized && !this.iScroll) {
			this.container[0].removeEventListener('scroll', this._boundContainerDidScrollWithEvent, this._highFrequencyScrollingEnabled);
		}
		
		// Destroy all cells
		this.enumerateAllCellsWithBlock(function (cell, type, identifier, isBound) {
			// Allow the delegate to perform its own destruction for each cell
			if (self.delegate && self.delegate.collectionViewWillDestroyCell) {
				self.delegate.collectionViewWillDestroyCell(self, cell);
			}
			
			// The cell's element will be removed together with all the content in one call to remove()
			cell.invalidate();
			
			// Let the delegate know that this cell was destroyed
			if (self.delegate && self.delegate.collectionViewDidDestroyCell) {
				self.delegate.collectionViewDidDestroyCell(self, cell);
			}
		});
		
		// Destroy iScroll if it was used
		if (this.iScroll) this.iScroll.destroy();
		
		// Empty the container, removing the cells, custom scrollbars and all other content
		this._container.empty();
		
		// Unbind the layout
		this._layout._collectionView = undefined;

		// Release the underlying view
		BMView.prototype.release.call(this);
	}
    
});

/**
 * Creates and returns a new collection view with the default properties.
 * The collection view will use a `BMCollectionViewFlowLayout` layout object.
 * You must assign a valid object to the `dataSet` property to fully initialize and use this collection view.
 * @param node <DOMNode>					The container that the collection view will manage. 
 *											This container should be an empty div element, otherwise the behaviour of the collection view will be undefined.
 * {
 *	@param customScroll <Boolean, nullable> By default, this parameter is only set to `YES` on iOS standalone web-apps running in iOS 10 or earlier. 
 *											If set to `YES`, the collection view will use custom scrolling in place of regular scrolling. 
 *											Otherwise, it will use native scrolling.
 * }
 * @return <BMCollectionView>				A collection view.
 */
BMCollectionView.collectionViewForNode = function (node, args) {
	let collectionView = BMCollectionViewMakeWithContainer(BMJQueryShim.shimWithDOMNode(node), args);

	return collectionView;
}

/**
 * Constructs and returns a collection view, creating a new `<div>` DOMNode for it.
 * The node for this collection should be added to the document prior to using it.
 * @return <BMCollectionView>			A collection view.
 */
BMCollectionView.collectionView = function () {
	const node = document.createElement('div');

	return this.collectionViewForNode(node);
}

/**
 * @deprecated - Use the static `collectionViewForNode` factory method.
 * 
 * Creates and returns a new collection view with the default properties.
 * The collection view will use a BMCollectionViewTableLayout layout object.
 * You must assign a valid object to the dataSet property to use this collection view.
 * @param container <BMJQueryShim>			The container that the collection view will manage. 
 *											This container should be an empty div element, otherwise the behaviour of the collection view will be undefined.
 * {
 *	@param customScroll <Boolean, nullable> By default, this parameter is only set to YES on iOS standalone web-apps. If set to YES, the collection view will use
 *											custom scrolling in place of regular scrolling. Otherwise, it will use native scrolling.
 * }
 * @return <BMCollectionView>				A collection view.
 */
export function BMCollectionViewMakeWithContainer(container, options) {
	var customScrollRequired = options && options.customScroll;
	var collectionView = new BMCollectionView();

	_BMCollectionViews.set(collectionView, true);
	
	collectionView._container = container;
	collectionView.layout = new BMCollectionViewFlowLayout();
	collectionView.cellCache = {};
	collectionView.retainedCells = [];
	collectionView.allCells = [];
	collectionView.supplementaryViewCache = {};
	
	collectionView.attributeCache = {};
	
	collectionView._selectedIndexPaths = [];
	
	collectionView.customScrollRequired = customScrollRequired;

	collectionView._cellClasses = {};
	collectionView._supplementaryViewClasses = {};

	collectionView._measures = {};
	collectionView._measuredIndexPaths = [];

	collectionView._cellLayoutQueue = BMViewLayoutQueue.layoutQueue();

	collectionView.initWithDOMNode(container[0]);
	
	return collectionView;
}

// @endtype
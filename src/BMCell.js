// @ts-check
/// <reference path="_0BMCoreUI.js"/>
/// <reference path="_2BMCollectionViewLayout.js"/>
/// <reference path="_3BMCollectionView.js"/>
/// <reference path="BMView_v2.5.js"/>

// When set to YES, this will cause collection view cells to extend view
const BM_USE_BMVIEW_SUBCLASS = YES;

// @type BMCollectionViewLayoutAttributesType

/**
 * The type of view an attributes object applies to.
 * This enumeration is also used by cell objects to make it possible to identify their type.
 */
var BMCollectionViewLayoutAttributesType = Object.freeze({ // <enum>
    /**
     * Indicates that these attributes apply to cells.
     */
    Cell: {}, // <enum>

    /**
     * Indicates that these attributes apply to supplementary views.
     */
    SupplementaryView: {}, // <enum>

    /**
     * Indicates that these attributes apply to decoration views.
     * Decoration views are a planned feature - currently this value should not be used.
     */
    DecorationView: {} // <enum>
});

/**
 * @deprecated Deprecated. Use BMCollectionViewCellAttributesType instead.
 */
var BMCellAttributesType = BMCollectionViewLayoutAttributesType; // <enum>

// @endtype

// These default values are used when applying a new style that doesn't contain all of the properties of the previous style.
// In that case, each missing property will be added to the new style with the value from this list.
/* @private */ var BMCollectionViewLayoutAttributesStyleDefaults = Object.freeze({
	opacity: 1,
	scaleX: 1,
	scaleY: 1,
	rotate: 0,
	rotateX: 0,
	rotateY: 0,
	rotateZ: 0,
	skewX: 0,
	skewY: 0,
	skewZ: 0,
	transformOriginX: '50%',
	transformOriginY: '50%',
    translateZ: 0,
    blur: '0px'
});

// @deprecated
var BMCellAttributesStyleDefaults = BMCollectionViewLayoutAttributesStyleDefaults;

// @type BMCollectionViewLayoutAttributes

/**
 * Manages the layout attributes for a cell or supplementary view. The cell attributes will automatically apply themselves to a cell's
 * DOM element whenever they are assigned to a cell. Additionally, the attributes are also animatable. Applying attributes, frames or styles while there
 * is an active animation context will cause that change to be animated.
 *
 * Cell attributes should not be created using the constructor; instead one of the BMCollectionViewCellAttributesMake... functions should be used to obtain new instances.
 */
var BMCollectionViewLayoutAttributes = function () {}; // <constructor>

/**
 * @deprecated Deprecated. Use BMCollectionViewCellAttributes instead.
 */
var BMCellAttributes = BMCollectionViewLayoutAttributes; // <Class extends BMCollectionViewLayoutAttributes>

BMCollectionViewLayoutAttributes.prototype = {
	/**
	 * The cell whose layout is managed by these attributes.
	 */
	_cell: undefined, // <BMCollectionViewCell, nullable>

    get cell() {
        return this._cell;
    },

    set cell(cell) {
        this._cell = cell;

        if (cell && cell.element) {
            // Only apply the new frame if it is different or if the cell is transitioning from being collected, to avoid having to set up unnecessary animations.
            if (!cell._previousFrame || !cell._previousFrame.isEqualToRect(this.frame) || !cell.retainCount) {
                this._hookFrame();
            }
            // Same for the style
            if (this._style && Object.keys(this._style).length) {
                // TODO Separate frame attributes
                this._style.translateX = this.frame.origin.x + 'px';
                this._style.translateY = this.frame.origin.y + 'px';
                this.hook(this._style);
            }
        }
    },

    /**
     * The type of item these attributes apply to.
     */
    _itemType: BMCollectionViewLayoutAttributesType.Cell, // <BMCollectionViewLayoutAttributesType>

    get itemType() { return this._itemType; },

    /**
     * The item kind for supplementary and decoration views.
     */
    identifier: undefined, // <String>

	/**
	 * The position of the cell in the layout.
	 */
	_frame: undefined, // <BMRect>

    get frame() {
        return this._frame;
    },

    set frame(frame) {
        this._frame = frame.copy();
        this._hookFrame();
    },

    /**
     * Generates and applies the hook properties for the frame.
     */
    _hookFrame: function () {
	    var frame = this.frame;
	    
	    if (this._cell && this._cell.element) {
		    var hookProperties = {
	            translateX: frame.origin.x + 'px',
	            translateY: frame.origin.y + 'px'
		    }
		    
		    if (this._cell._lastAssignedWidth != frame.size.width) {
			    hookProperties.width = frame.size.width + 'px';
			}
		    if (this._cell._lastAssignedHeight != frame.size.height) {
			    hookProperties.height = frame.size.height + 'px';
			}
            
            // If applying the frame causes a size change, notify the delegate.
            if (hookProperties.width || hookProperties.height) {
                if (this._cell.collectionView.delegate && this._cell.collectionView.delegate.collectionViewWillResizeCell) {
                    this._cell.collectionView.delegate.collectionViewWillResizeCell(this._cell.collectionView, this._cell, {toSize: frame.size.copy()});
                }
            }
	    
	        this.hook(hookProperties);
        
		}
    },
    
    /**
	 * Invoked by the collection view to flatten the cell using these attributes prior to an animated release.
	 * This will cause any transform or opacity styles to be removed from the cell, which may affect the fidelity
	 * of the resulting layer.
	 */
    _flatten: function () {
	    // Unassigned attributes cannot be flattened
	    if (!this._cell) return;
	    
	    // Destroy any transform styles
	    this.style = {};
	    this._cell.element[0].style.transform = '';
	    
	    // Hook the frame, using left/right instead of translations
	    // The correct sizing should already be applied, so there is no need to reapply it here
	    BMCopyProperties(this._cell.element[0].style, {left: this._frame.origin.x + 'px', top: this._frame.origin.y + 'px'});
    },

    /**
     * The cell's style and transform attributes
     */
     _style: undefined, // <Object, nullResettable>

     get style() {
	    if (!this._style) this._style = {};
        return this._style;
     },

     set style(style) {
        style = style || {};
        
        // Remove the forbidden values
        delete style.width;
        delete style.height;
        delete style.left;
        delete style.right;
        delete style.translateX;
        delete style.translateY;

        
        var oldStyle = this._style;

		// Always copy style objects, never assign directly
        // TODO Separate frame attributes
        this._style = {
            translateX: this.frame.origin.x + 'px',
            translateY: this.frame.origin.y + 'px'
        };
        for (key in style) {
	        this._style[key] = style[key];
        }
        
        // Clear the old attributes
        if (oldStyle) for (var key in oldStyle) {
	        if (style[key] === undefined) style[key] = BMCollectionViewLayoutAttributesStyleDefaults[key];
        }
        
        this.hook(style);
     },

     /**
      * Applies the specified style on top of the current style properties.
      * @param style <Object>           The list of properties to apply to the UI element.
      */
     addStyle: function(style) {
        
        // Remove the forbidden values

        delete style.width;
        delete style.height;
        delete style.left;
        delete style.right;
        delete style.translateX;
        delete style.translateY;

        
        for (var key in style) {
            this._style[key] = style[key];
        }

        this.hook(style);
     },

     /**
      * Determines whether the cell using these attributes is hidden.
      * When cells are marked as hidden, the collection view may skip rendering them entirely.
      */
     _isHidden: NO, // <Boolean>

     get isHidden() { return this._isHidden; },
     set isHidden(hidden) {
         this._isHidden = hidden;
     },

    /**
     * Applies the given hook properties to the backing UI element, if it is available.
     * If the UI element is not available, these properties will be applied when it becomes available.
     * @param properties <Object>       The list of properties to apply to the UI element.
     *                                  This object should not contain position or size attributes; these should be controlled through the frame property instead.
     */
    hook: function (properties) {
        if (!this._cell || !this._cell.element) return;

        var self = this;

        if (BMAnimationContextGetCurrent()) {
            var animation = BMAnimationContextGetCurrent();

            var subscriber = animation.subscribers.get(this);

            // If the cell's hidden state doesn't match the attributes and the attributes are visible, make the cell visible
            if (this._cell._isHidden != this._isHidden && !this._isHidden) {
                this._cell.isHidden = NO;
            }

            if (!subscriber) {
                subscriber = {
                    prepare() {
                        if (!self._cell) return;

                        // merge the property maps
                        var propertyMap = {};

                        for (var i = 0; i < this.properties.length; i++) {
                            var map = this.properties[i];
                            for (var key in map) {
	                            
                                propertyMap[key] = map[key];
	                            
                            }
                        }

                        this._propertyMap = propertyMap;

                        // If applying the properties will cause a size change, allow the cell to react.
                        if (properties.width || properties.height) {
                            var bounds = BMRectMakeWithOrigin(BMPointMake(), {size: self.frame.size.copy()});
                            self._cell.boundsWillChangeToBounds(bounds);
                        }
                    },

                    //
                    // The apply method is invoked by the animation engine when the animation is applied.
                    // The subscribers should use this method to finish preparing their target and properties attributes for the animation.
                    // @param animation <BMAnimation>       The animation object.
                    //
                    apply: function (animation) {
                        if (!self._cell) return;
                        var propertyMap = this._propertyMap;
                        
                        var cell = self._cell;
                        let resolveAnimation;
                        cell._layoutAnimator = new Promise($0 => resolveAnimation = $0);

                        var oldBounds = self._cell._bounds;
                        var boundsWillChange = NO;
                        var newBounds;

                        // If applying the properties will cause a size change, allow the cell to react.
                        if (properties.width || properties.height) {
                            var bounds = BMRectMakeWithOrigin(BMPointMake(), {size: self.frame.size.copy()});
                            boundsWillChange = YES;
                            //propertyMap.tween = 1;
                            newBounds = bounds.copy();
                        }
						
						var complete = NO;
						var targetWidth = self.frame.size.width;
                        var targetHeight = self.frame.size.height;
                        
                        let progressCallback = boundsWillChange && oldBounds ? ($0, $1, $2, $3, fraction) => {
                            let intermediateBounds = oldBounds.interpolatedValueWithFraction(fraction, {toValue: newBounds});
                            cell.boundsDidTransitionToBounds(intermediateBounds);
                        } : undefined;

                        animation.targets.push({element: self._cell.element, properties: propertyMap, complete: function () {
	                        if (complete) return;
	                        complete = YES;
	                        
                            if (propertyMap.width) {
	                            cell._lastAssignedWidth = targetWidth;
	                        }
                            if (propertyMap.height) {
	                            cell._lastAssignedHeight = targetHeight;
	                        }
                            
                            // If the cell's hidden state doesn't match the attributes and the attributes are hidden, make the cell hidden
                            if (cell._isHidden != self._isHidden && self._isHidden) {
                                cell.isHidden = YES;
                            }

                            resolveAnimation();
                            cell._layoutAnimator = undefined;
                            
                            // If applying the properties caused a size change, notify the delegate.
                            if (properties.width || properties.height) {

                                // Compute and apply the new bounds
                                var bounds = BMRectMakeWithOrigin(BMPointMake(), {size: self.frame.size.copy()});
                                var oldBounds = cell._bounds;
                                cell._bounds = bounds;
                                cell.boundsDidChangeFromBounds(oldBounds);

                                // Notify the delegate
                                if (cell.collectionView.delegate && cell.collectionView.delegate.collectionViewDidResizeCell) {
                                    cell.collectionView.delegate.collectionViewDidResizeCell(cell.collectionView, cell, {toSize: self.frame.size.copy()});
                                }
                            }
                        }});

                    },
                    properties: []
                };

                animation.subscribers.set(this, subscriber);
            }

            subscriber.properties.push(properties);

            // Invalidate the cell's layout if this change would cause the size to change
            if (properties.width || properties.height) {
                self._cell.needsLayout = YES;
            }

        }
        else {
				
            BMHook(this._cell.element, properties);
	        
			if (properties.width) this._cell._lastAssignedWidth = this.frame.size.width;
			if (properties.height) this._cell._lastAssignedHeight = this.frame.size.height;
            
            // If applying the properties caused a size change, notify the delegate.
            if (properties.width || properties.height) {
                // Don't request additional layout passes for transition attributes
                if (!this._fraction) self._cell.needsLayout = YES;

                // Compute and apply the new bounds
                var bounds = BMRectMakeWithOrigin(BMPointMake(), {size: this.frame.size.copy()});
                this._cell.boundsWillChangeToBounds(bounds);
                var oldBounds = this._cell._bounds;
                this._cell._bounds = bounds;
                this._cell.boundsDidChangeFromBounds(oldBounds);

                // Notify the delegate
                if (this._cell.collectionView.delegate && this._cell.collectionView.delegate.collectionViewDidResizeCell) {
                    this._cell.collectionView.delegate.collectionViewDidResizeCell(this._cell.collectionView, this._cell, {toSize: this.frame.size.copy()});
                }
            }

            // Change the cell's visibility to match the attributes
            if (this._isHidden != this._cell._isHidden) {
                this._cell.isHidden = this._isHidden;
            }
			
        }
    },

	/**
	* The index path of the model object backing this cell.
	*/
	indexPath: undefined, // <BMIndexPath>

	/**
	* Creates a new instance of this attributes collection with the same properties as this instance.
    * The new <code>BMCollectionViewLayoutAttributes</code> instance will not be bound to any cell.
	* @return <BMCollectionViewLayoutAttributes>   A properties collection instance.
	*/
	copy: function () {
		var attributes = new BMCollectionViewLayoutAttributes();
		attributes._frame = this._frame.copy();
		attributes.indexPath = this.indexPath.copy();
        attributes._style = $.extend({}, this._style);
        attributes._itemType = this._itemType;
        attributes.identifier = this.identifier;
		return attributes;
	}
}

/**
 * Creates and returns a new instance of <code>BMCollectionViewLayoutAttributes</code> for the object at the specified index path.
 * @param indexPath <BMIndexPath>                   The index path.
 * @return <BMCollectionViewLayoutAttributes>       The layout attributes.
 */
function BMCollectionViewLayoutAttributesMakeForCellAtIndexPath(indexPath) {
    var attributes = new BMCollectionViewLayoutAttributes();
    attributes.indexPath = indexPath;
    attributes._itemType = BMCollectionViewLayoutAttributesType.Cell;
    attributes._style = {};
    return attributes;
}

/**
 * @deprecated Deprecated. Use <code>BMCollectionViewLayoutAttributesMakeForCellAtIndexPath</code> instead.
 */
var BMCellAttributesMakeForCellAtIndexPath = BMCollectionViewLayoutAttributesMakeForCellAtIndexPath; // <Function>

/**
 * Creates and returns a new instance of <code>BMCollectionViewLayoutAttributes</code> for the object at the specified index path.
 * @param identifier <String>           The kind of supplementary view.
 * {
 *  @param atIndexPath <BMIndexPath>    The index path.
 * }
 * @return <BMCollectionViewLayoutAttributes>           The cell attributes.
 */
function BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier(identifier, options) {
    var attributes = new BMCollectionViewLayoutAttributes();
    attributes.indexPath = options.atIndexPath;
    attributes._itemType = BMCollectionViewLayoutAttributesType.SupplementaryView;
    attributes.identifier = identifier;
    attributes._style = {};
    return attributes;
}

/**
 * @deprecated Deprecated. Use <code>BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier</code> instead.
 */
var BMCellAttributesMakeForSupplementaryViewWithIdentifier = BMCollectionViewLayoutAttributesMakeForSupplementaryViewWithIdentifier;

// @endtype

// @type BMCollectionViewCell extends BMView

/**
 * A controller object that manages a cell view instance and its associated retain count.
 * The cell is used as a controller for both regular cells, supplementary views and decoration views.
 * The represented item type is not strongly associated with the actual cell, but it may be inferred from its reuse identifier
 * and associated attributes.
 *
 * Cells should not be instantiated manually; they will be constructed and provided by the collection view when requested using one of the <code>dequeueCell...</code> methods.
 */
var BMCollectionViewCell = function () { // <constructor>
}

var BMCell = BMCollectionViewCell; // <Class>

// #FLAG
BMCollectionViewCell.prototype = BMExtend(BM_USE_BMVIEW_SUBCLASS ? Object.create(BMView.prototype) : {}, {
    
    /**
     * The number of times the cell was retained.
     * Subclasses should not override this getter.
     */
	get retainCount() { // <Number>
		return this._retainCount + this._manageCount;	
	},
    
    /**
     * Returns YES if the cell is managed by the collection view, NO otherwise.
     * Subclasses should not override this getter.
     */
	get isManaged() {
		return this._manageCount > 0;
    },
    
    /**
     * Returns YES if the cell is retained or managed by the collection view, NO otherwise.
     * Subclasses should not override this getter.
     */
    get isRetained() {
        return this.retainCount > 0;
    },

    // #FLAG BM_USE_BMVIEW_SUBCLASS
    get _frame() {
        return this._attributes && this._attributes.frame;
    },

    // #FLAG BM_USE_BMVIEW_SUBCLASS
    get frame() {
        return this._attributes && this._attributes.frame;
    },
    // #FLAG BM_USE_BMVIEW_SUBCLASS
    set frame(frame) {
        // NOTE: A cell's frame is controlled by its layout attributes, therefore this operation is a no-op
    },

    /**
     * The collection view that created this cell.
     * Subclasses should not override this property.
     */
    collectionView: undefined, // <BMCollectionView>

	/**
     * @deprecated Deprecated. Use the <code>node</code> property instead.
	 * The jQuery element managed by this cell.
     * Subclasses should not override this property.
	 */
    _element: undefined, // <$>
    get element() { return this._element || (this._element = $(this.node)); },
    
    // #FLAG BM_USE_BMVIEW_SUBCLASS
    /**
     * The DOM node managed by this cell.
     */
    //node: undefined, // <DOMNode>

    /**
     * The type of item this cell represents.
     * Subclasses should not override this property.
     */
    itemType: BMCollectionViewLayoutAttributesType.Cell, // <BMCollectionViewLayoutAttributesType>

    /**
     * The cell's reuse identifier which corresponds to the template's reuse identifier.
     */
    reuseIdentifier: undefined, // <String>

    /**
     * The cell's size and position relative to its own frame.
     */
    _bounds: BMRectMake(), // <BMRect>

    get bounds() { return this._bounds; },

    /**
     * Invoked just before this cell's bounds are about to change to the given bounds.
     * This method is invoked before the bounds have actually been changed and before any associated animation has run.
     * Subclasses can override this method to react to bound updates.
     * The default implementation does nothing.
     * @param bounds <BMRect>       The new bounds.
     */
    boundsWillChangeToBounds(bounds) {

    },

    /**
     * Invoked repeatedly during animations while this cell's bounds are changing.
     * Subclasses can override this method to react to bound updates. Note that as this method is invoked once per animation frame
     * any update within this method should be as fast as possible to avoid framerate drops.
     * The default implementation does nothing.
     * @param bounds <BMRect>       The new bounds.
     */
    boundsDidTransitionToBounds(bounds) {

    },

    /**
     * Invoked after this cell's bounds have been updated and any associated animation has finished running.
     * Subclasses can override this method to react to bound updates.
     * The default implementation does nothing.
     * @param bounds <BMRect>       The previous bounds.
     */
    boundsDidChangeFromBounds(bounds) {

    },

    /**
     * Animatable. The cell attributes used to render this cell.
     * Subclasses should not override this property.
     */
    _attributes: undefined, // <BMCollectionViewLayoutAttributes>

    get attributes() {
        return this._attributes;
    },
    
    set attributes(attributes) {
	    
	    var oldAttributes = this._attributes;
        if (this._attributes) {
            this._attributes.cell = undefined;
            this._previousFrame = oldAttributes.frame.copy();
        }
        else {
            this._previousFrame = undefined;
        }

        this._attributes = attributes;
        if (!attributes) {
            return;
        }
        attributes.cell = undefined;
        
        // Clear the old styles
        if (oldAttributes) {
	        if (oldAttributes.style) {
		        attributes.style = attributes.style || {};
		        
		        for (var key in oldAttributes.style) {
			        if (attributes.style[key] === undefined) attributes.style[key] = BMCollectionViewLayoutAttributesStyleDefaults[key];
		        }
	        }
        }
        
        // Setting the cell property of the attributes will cause the attributes to automatically apply themselves to this cell
        if (attributes) {
	        attributes.cell = this;
	    }
    },
    
    /**
	 * The index path that this cell is currently bound to.
     * Subclasses should not override this getter.
	 */
    get indexPath() { // <BMIndexPath>
	    return this._attributes ? this._attributes.indexPath : undefined;
    },
    
    /**
	 * A special version of retain used only by the collection view.
     * Subclasses should not override this method.
	 * @return <BMCollectionViewCell>		This cell.
	 */
    _manage: function () {
        if (this._manageCount) return this;

	    this._manageCount++;
        
        this.collectionView.cellWasManaged(this);
        if (this.retainCount === 1) {
            this.prepareForDisplay();
            this.collectionView.cellShouldRender(this);
        }
        
        return this;
    },
    
    /**
	 * A special version of release used only by the collection view.
     * Subclasses should not override this method.
	 */
    _unmanage: function () {
        if (!this._manageCount) return;

	    this._manageCount--;

        this.collectionView.cellWasUnmanaged(this);
        if (this.retainCount === 0) {
            this.prepareForReuse();
            this.collectionView.cellWasReleased(this);
        }
    },

    /**
     * Retains ownership of this cell, preventing the collection view from recycling it, until it is released.
     * If the object backing this cell is removed from the data set while it's still retained, the cell may be destroyed,
     * guaranteeing that it won't be reused later.
     * Subclasses that override this method should invoke the superclass method at some point in their implementation.
     * @return <BMCollectionViewCell> 	This cell.
     */
    retain: function () {
        this._retainCount++;
        
        if (this.retainCount == 1) {
            this.prepareForDisplay();
	        this.collectionView.cellShouldRender(this);
        }
        
        return this;
    },

    /**
     * Relinquishes ownership of this cell. If the retain count reaches 0, the cell may be recycled.
     * You should only release cells that you previously retained, otherwise the collection view may behave
     * in an undefined manner.
     * Subclasses that override this method should invoke the superclass method at some point in their implementation.
     */
    release: function () {
        this._retainCount--;

        if (this.retainCount == 0) {
            this.prepareForReuse();
            this.collectionView.cellWasReleased(this);
        }
    },

    /**
     * Invoked by the collection view to recycle this cell, preparing it for reuse later. This implicitly invokes _unmanage().
     * If this cell is not fully released after invoking this method, it will notify the collection view to destroy it.
     * Subclasses that override this method should invoke the superclass method at some point in their implementation.
     * Note that after the superclass implementation is invoked, the cell will have been either collected or invalidated.
     */
    recycle: function () {
        this._unmanage();

        //this.collectionView.cellWasUnmanaged(this);
        if (this.retainCount > 0) {
            this.collectionView.cellWasInvalidated(this);
            this.destroy();
            
            // A cell that was invalidated can no longer be retained or released, otherwise there is a risk of resurrecting it
            this._manage = function () {};
            this._unmanage = this._manage;
            this.retain = this._manage;
            this.release = this.retain;
            this.recycle = this.retain;
            this.releaseRecycledCell = this.retain;
        }
    },

    /**
     * Invoked by the collection view to recycle this cell, preparing it for reuse later. This implicitly invokes release().
     * If this cell is not fully released after invoking this method, it will notify the collection view to destroy it.
     * Subclasses that override this method should invoke the superclass method at some point in their implementation.
     * Note that after the superclass implementation is invoked, the cell will have been either collected or invalidated.
     */
    releaseRecycledCell: function () {
        this.release();

        if (this.retainCount > 0) {
            this.collectionView.cellWasInvalidated(this);
            this.destroy();
            
            // A cell that was invalidated can no longer be retained or released, otherwise there is a risk of resurrecting it
            this._manage = function () {};
            this._unmanage = this._manage;
            this.retain = this._manage;
            this.release = this.retain;
            this.recycle = this.retain;
            this.releaseRecycledCell = this.retain;
        }
    },

    /**
     * Should be set to YES to hide the cell, or NO to reveal it.
     */
    _isHidden: NO, // <Boolean>

    get isHidden() {
        return this._isHidden;
    },
    set isHidden(hidden) {
        if (this._isHidden != hidden) {
            if (hidden) {
                this._hide();
            }
            else {
                this._show();
            }
        }
    },

    /**
     * Hides this cell from the layout without recycling it.
     * If the cell is already hidden, this method does nothing.
     */
    _hide: function () {
        this._isHidden = YES;
        this.node.classList.add('BMCollectionViewCellHidden');
    },

    /**
     * Reveals a previously hidden cell.
     * If the cell is already visible, this method does nothing.
     */
    _show: function () {
        this._isHidden = NO;
        this.node.classList.remove('BMCollectionViewCellHidden');
    },

    // #FLAG BM_USE_BMVIEW_SUBCLASS
    _prepareForAutomaticIntrinsicSize() {
        for (let subview of this._subviews) {
            subview._prepareForAutomaticIntrinsicSize();
        }

        if (this._isMeasuring) {
            BMCopyProperties(this._node.style, {width: '100%', height: '100%'});
        }
    },

    // #FLAG BM_USE_BMVIEW_SUBCLASS
    _supportsAutomaticIntrinsicSize: NO,

    // #FLAG BM_USE_BMVIEW_SUBCLASS
    /**
     * Temporarily set to `YES` while this cell is being measured.
     */
    _isMeasuring: NO,

    // #FLAG BM_USE_BMVIEW_SUBCLASS
    internalConstraints() {
        var constraints = [];

        if (this._isMeasuring) return constraints;

        if (this._rootViewLeftConstraint) {
            if (this.attributes) {
                this._rootViewWidthConstraint.constant = this.attributes.frame.size.width;
                this._rootViewHeightConstraint.constant = this.attributes.frame.size.height;
            }
            constraints.push(this._rootViewLeftConstraint, this._rootViewTopConstraint, this._rootViewWidthConstraint, this._rootViewHeightConstraint);
        }
        else {
            constraints.push(
                this._rootViewLeftConstraint = BMLayoutConstraint.internalConstraintWithView(this, {attribute: BMLayoutAttribute.Left, relatedBy: BMLayoutConstraintRelation.Equals, constant: 0}),
                this._rootViewTopConstraint = BMLayoutConstraint.internalConstraintWithView(this, {attribute: BMLayoutAttribute.Top, relatedBy: BMLayoutConstraintRelation.Equals, constant: 0}),
                this._rootViewWidthConstraint = BMLayoutConstraint.internalConstraintWithView(this, {attribute: BMLayoutAttribute.Width, relatedBy: BMLayoutConstraintRelation.Equals, constant: this.attributes ? this.attributes.frame.size.width : 0}),
                this._rootViewHeightConstraint = BMLayoutConstraint.internalConstraintWithView(this, {attribute: BMLayoutAttribute.Height, relatedBy: BMLayoutConstraintRelation.Equals, constant: this.attributes ? this.attributes.frame.size.height : 0})
            );
        }

        return constraints;

    },


    /**
     * Invoked prior to this cell being updated as part of an animated data update.
     * Subclasses can override this method to perform any changes necessary for this update or add additional
     * animations to run as part of the update.
     * Note this method will always be invoked with an active animation context.
     * The default implementation does nothing.
     */
    prepareForAnimatedUpdate() {

    },

    /**
     * Invoked prior to this cell being collected for reuse by the collection view.
     * Subclasses can override this method to perform any changes necessary for reusing this cell.
     * Subclasses should invoke the superclass method at some point in their implementation.
     */
    prepareForReuse() {

    },

    /**
     * Invoked prior to this cell being shown on the screen either after being initialized or after having been previously collected.
     * Subclasses can override this method to perform any changes necesarry for displaying this cell.
     * Subclasses should invoke the superclass method at some point in their implementaiton.
     */
    prepareForDisplay() {

    },

    /**
     * Invoked by the collection view when this cell can no longer be recycled and should be destroyed.
     * Subclasses that require any additional cleanup before being destroyed should override this method
     * and perform any necessary cleanup here.
     * After this method returns, the collection view will remove this cell's node from the DOM and will no
     * longer reuse this cell.
     * Subclasses overriding this method should invoke the superclass method at the end of their implementation.
     * After this method is invoked, all references to this cell should be cleared to allow the garbage collector
     * to reclaim its memory.
     */
    destroy() {
        BMView.prototype.release.call(this);
    },

    /**
     * @deprecated Currently unused.
     * 
     * A property instructing the collection view whether the cell contains asynchronous components used when initializing and the collection view
     * should await for those asynchronous components to complete before actually rendering the cell.
     * When this getter returns <code>NO</code>, the collection view will invoke <code>initNonatomic</code> on this cell after the base initializer
     * has returned and await for the promise returned by that method to resolve before continuing its operation.
     * Note that collection view will only await for nonatomic code only during the initial loading and during data updates, in other cases, <code>initNonatomic</code>
     * will be invoked as normally, but the collection will not block awaiting for it to resolve - therefore cell subclasses that use asynchronous should be
     * prepared to handle the cases where they are used before their nonatomic resources have finished loading.
     */
    get initializesAtomically() { // <Boolean>
        return YES;
    },

    /**
     * Designated initializer. Invoked immediately after creation to initialize this cell.
     * Subclasses that need custom initialization should invoke the superclass method early on in their implementation to ensure
     * that the superclass components are correctly initialized.
     * @param collectionView <BMCollectionView>             The calling collection view.
     * {
     *	@param reuseIdentifier <String>	                    The reuse identifier of this cell. The collection view will use this property to return a cell
     *														with the correct contents when reusing elements.
     *  @param node <DOMNode>                               The DOM node managed by this cell.
     * }
     * @return <BMCollectionViewCell>                       This cell.
     */
    initWithCollectionView(collectionView, args) {
        this._retainCount = 0;
        this._manageCount = 0;
        
        this.collectionView = collectionView;
        this.reuseIdentifier = args.reuseIdentifier;

        // #FLAG BM_USE_BMVIEW_SUBCLASS
        if (BM_USE_BMVIEW_SUBCLASS) {
            BMView.prototype.initWithDOMNode.call(this, args.node);
        }
        else {
            this.node = args.node;
        }

        return this;
    },

    /**
     * @deprecated Currently unused.
     * 
     * Invoked when cell subtypes return <code>NO</code> from <code>initializesAtomically</code>.
     * Subtypes should asynchronously perform any work they need, returning a promise that resolves when that work is finished.
     * When this method is invoked during data updates and the initial loading, collection view will await for the promise returned
     * by this method to resolve before displaying any changes to the user.
     */
    initNonatomic: async function () {

    }
});

/**
 * Creates and returns a new <code>BMCollectionViewCell</code> that will be managed by the given collection view.
 * This constructor should not be invoked manually; the collection view itself should decide when it is appropriate to construct new cells.
 * @param collectionView <BMCollectionView>             The calling collection view.
 * {
 *	@param withReuseIdentifier <String>	                The reuse identifier of this cell. The collection view will use this property to return a cell
 *														with the correct contents when reusing elements.
 *  @param node <DOMNode>                               The DOM node managed by this cell.
 * }
 * @return <BMCollectionViewCell>                       A cell.
 */
function BMCollectionViewCellMakeForCollectionView(collectionView, options) {
    return (new BMCollectionViewCell).initWithCollectionView(collectionView, options);
}

/**
 * @deprecated Deprecated. Use <code>BMCollectionViewCellMakeForCollectionView</code> instead.
 */
var BMCellMakeForCollectionView = BMCollectionViewCellMakeForCollectionView;

// @endtype

// @type _BMCollectionViewTransitionLayoutAttributes

/**
 * The regex used to extract the units from style CSS values.
 */
var _BMCollectionViewTransitionLayoutAttributesUnitRegex = /\-?\+?\d*\.?\d*(\D*)/; // <RegExp>

var _BMCollectionViewTransitionCellAttributesUnitRegex = _BMCollectionViewTransitionLayoutAttributesUnitRegex;

/**
 * A specialized version of cell attributes that manages the transition of a cell from one set of attributes to another.
 * The source and target attributes should have the same index path and item type.
 * Transition attributes should not be created and used directly. A collection view will automatically create, manage and destroy transition attributes
 * to perform various animations such as animated layout changes.
 *
 * Transition attributes are created automatically by the collection view when changing layouts with an animation.
 */
var _BMCollectionViewTransitionLayoutAttributes = function () {}; // <constructor>

_BMCollectionViewTransitionLayoutAttributes.prototype = BMExtend({}, BMCollectionViewLayoutAttributes.prototype, {
	
	/**
	 * The attributes from which the transition starts.
	 */
	_sourceAttributes: undefined, //<BMCollectionViewLayoutAttributes>
	get sourceAttributes() { return this._sourceAttributes; },
	
	/**
	 * The attributes to which the transition moves.
	 */
	_targetAttributes: undefined, //<BMCollectionViewLayoutAttributes>
	get targetAttributes() { return this._targetAttributes; },
	
	/**
	 * Controls how close the transition is to completion.
	 * A value of 0 should correspond to the source attributes while a value of 1 should correspond to the target attributes.
	 * Assigning this value will update the target cell.
	 */
	_fraction: 0, // <Number>
	get fraction() { return this._fraction; },
	set fraction(fraction) {
        // set the isHidden property based on the values of the source and target attributes
        if (!this._sourceAttributes.isHidden || !this._targetAttributes.isHidden) {
            this.isHidden = NO;
        }
        else {
            this.isHidden = YES;
        }
        // let isHidden = this._sourceAttributes.isHidden;
        // if (this._targetAttributes != isHidden) {
        //     if (fraction != 0 && fraction != 1) {
        //         isHidden = NO;
        //     }
        //     else if (fraction == 0) {
        //         isHidden = this._sourceAttributes.isHidden;
        //     }
        //     else {
        //         isHidden = this._targetAttributes.isHidden;
        //     }
        // }

        // this.isHidden = isHidden;

		this._fraction = fraction;
		
		// Update the frame
		this._frame = BMRectByInterpolatingRect(this._sourceAttributes._frame, {toRect: this._targetAttributes._frame, withFraction: fraction});
		this._hookFrame();
		
		// Update the style
		var sourceStyle = BMCopyProperties(this._sourceAttributes.style, {translateX: this._sourceAttributes._frame.origin.x + 'px', translateY: this._sourceAttributes._frame.origin.y + 'px'});
		var targetStyle = BMCopyProperties(this._targetAttributes.style, {translateX: this._targetAttributes._frame.origin.x + 'px', translateY: this._targetAttributes._frame.origin.y + 'px'});
		
		if (!this._style) this._style = {};
		
		// Create the intermediate representation of each style; this only needs to happen once
		// The intermediate transition style holds the transition numerical values and the unit of measurement separately
		if (!this._intermediateTransitionStyle) {
			this._intermediateTransitionStyle = {};
			
			for (var key in sourceStyle) {
				// Extract the numeric values
				this._intermediateTransitionStyle[key] = {
					source: parseFloat(sourceStyle[key])
				};
				
				var target = parseFloat(targetStyle[key]);
				if (isNaN(target)) target = parseFloat(BMCollectionViewLayoutAttributesStyleDefaults[key]);
				this._intermediateTransitionStyle[key].target = target;
				
				// Extract the unit from the source style
				// At this point, having different units for the same property in the source and target styles is unsupported
				var unit = _BMCollectionViewTransitionLayoutAttributesUnitRegex.exec(sourceStyle[key])[1] || '';
				this._intermediateTransitionStyle[key].unit = unit;
			}
			
			// Get the remaining attributes from the target style 
			for (var key in targetStyle) {
				// Skip previously added style attributes
				if (this._intermediateTransitionStyle[key]) continue;
				
				// Extract the numeric values
				this._intermediateTransitionStyle[key] = {
					target: parseFloat(targetStyle[key])
				};
				
				var source = parseFloat(sourceStyle[key]);
				if (isNaN(source)) source = parseFloat(BMCollectionViewLayoutAttributesStyleDefaults[key]);
				this._intermediateTransitionStyle[key].source = source;
				
				// Extract the unit from the source style
				// At this point, having different units for the same property in the source and target styles is unsupported
				var unit = _BMCollectionViewTransitionCellAttributesUnitRegex.exec(targetStyle[key])[1] || '';
				this._intermediateTransitionStyle[key].unit = unit;
			}
			
		}
		
		var transitionStyle = this._intermediateTransitionStyle;
		
		// Compute the interpolated style
		for (var key in transitionStyle) {
			var style = transitionStyle[key];
			this._style[key] = BMNumberByInterpolatingNumbersWithFraction(style.source, style.target, fraction) + style.unit;
		}
		
		// Apply the interpolated style
		this.hook(this._style);
    },
    

	/**
	 * Invoked by transition layouts at the end of a layout transition.
	 * Causes the transition attributes to apply the final target attributes to its associated cells.
	 */
    _applyFinalAttributes: function () {
        if (this._cell) {
            this._cell.attributes = this._targetAttributes;
        }
    },
    

	/**
	 * Invoked by transition layouts at the beginning of a layout transition.
	 * Causes the transition attributes to trigger an animated layout pass on its associated cell.
	 */
    _layout() {
        if (this._cell) {
            this._frame = this._targetAttributes.frame;
            this._cell.needsLayout = YES;
        }
    }
	
});

/**
 * Constructs and returns a new set of transition attributes object that will transition from the given source attributes to 
 * the given target attributes.
 * @param sourceAttributes <BMCollectionViewLayoutAttributes>			The source attributes.
 * {
 *	@param targetAttributes <BMCollectionViewLayoutAttributes>			The target attributes.
 * }
 * @return <_BMCollectionViewTransitionLayoutAttributes>	            The new transition attributes.
 */
function _BMCollectionViewTransitionLayoutAttributesMakeWithSourceAttributes(sourceAttributes, options) {
	var attributes = new _BMCollectionViewTransitionLayoutAttributes();
	
	attributes.indexPath = sourceAttributes.indexPath.copy();
    attributes._itemType = sourceAttributes._itemType;
    attributes.identifier = sourceAttributes.identifier;
	
	attributes._sourceAttributes = sourceAttributes;
    attributes._targetAttributes = options.targetAttributes;
	
    attributes.fraction = 0;
    attributes._frame = sourceAttributes._frame;
	
	return attributes;
	
}

/**
 * @deprecated Deprecated. Use <code>_BMCollectionViewTransitionLayoutAttributesMakeWithSourceAttributes</code> instead.
 */
var _BMCollectionViewTransitionCellAttributesMakeWithSourceAttributes = _BMCollectionViewTransitionLayoutAttributesMakeWithSourceAttributes;

// @endtype




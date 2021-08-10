// @ts-check

import {YES, NO, BMExtend, BMCopyProperties} from '../Core/BMCoreUI'
import {BMRectMake} from '../Core/BMRect'
import {BMLayoutConstraint, BMLayoutAttribute, BMLayoutConstraintRelation} from '../BMView/BMLayoutConstraint_v2.5'
import {BMView} from '../BMView/BMView_v2.5'
import {BMCollectionViewLayoutAttributesType, BMCollectionViewLayoutAttributesStyleDefaults} from './BMCollectionViewLayoutAttributes'


// @type BMJQueryShim

/**
 * The JQuery shim is an object that is compatible with the few jQuery methods used by CoreUI.
 * All of the functions map directly to standard DOM methods.
 */
export function BMJQueryShim() {} // <constructor>

BMJQueryShim.prototype = {
	/**
	 * The DOM node managed by this shim.
	 */
	0: document.body, // <DOMNode>

	/**
	 * Applies the given CSS properties to the DOM node managed by this shim.
	 * @param key <String>			The CSS key.
	 * @param value <AnyObject>		The CSS value.
	 */
	css(key, value) {
		if (typeof key === 'string') {
			this[0].style[key] = value;
		}
		else {
			for (const cssKey in key) {
				this[0].style[cssKey] = key[cssKey];
			}
		}
	},

	/**
	 * Applies the given CSS properties to the DOM node managed by this shim.
	 * @param props <Dictionary<AnyObject>>		The key-value map of CSS properties to apply.
	 */
//	css(props) {

	/**
	 * Returns the `offsetWidth` property of this shim's node.
	 * @return <Number>			The `offsetWidth`.
	 */
	width() {
		return this[0].offsetWidth;
	},

	/**
	 * Returns the `offsetHeight` property of this shim's node.
	 * @return <Number>			The `offsetHeight`.
	 */
	height() {
		return this[0].offsetHeight;
	},

	/**
	 * Returns an object containing the `offsetLeft` and `offsetTop` properties of this shim's node.
	 * @return <Object>			The requested properties.
	 */
	offset() {
		return {left: this[0].offsetLeft, top: this[0].offsetTop};
	},

	/**
	 * Appends the DOM node managed by the given jQuery shim to this shim's DOM node.
	 * @param shim <BMJQueryShim>		The shim containing the node to add.
	 */
	append(shim) {
        if (typeof shim === 'string') {
            this[0].insertAdjacentHTML('beforeend', shim);
            return;
        }
		this[0].append(shim[0]);
	},

	/**
	 * Removes the contents of this shim's DOM node.
	 */
	empty() {
		this[0].innerHTML = '';
	},

	/**
	 * Removes this shim's DOM node.
	 */
	remove() {
		this[0].remove();
	}

}

/**
 * Constructs and returns a jQuery shim for the given DOM node.
 * @param node <DOMNode>		The node for which to construct a shim.
 * @return <BMJQueryShim>		A jQuery shim.
 */
BMJQueryShim.shimWithDOMNode = function (node) {
    if ('$' in window) {
        return $(node);
    }
	const shim = new BMJQueryShim();
	shim[0] = node;
	return shim;
}

// @endtype

// When set to YES, this will cause collection view cells to extend view
const BM_USE_BMVIEW_SUBCLASS = YES;

// @type BMCollectionViewCell extends BMView

/**
 * A controller object that manages a cell view instance and its associated retain count.
 * The cell is used as a controller for both regular cells, supplementary views and decoration views.
 * The represented item type is not strongly associated with the actual cell, but it may be inferred from its reuse identifier
 * and associated attributes.
 *
 * Cells should not be instantiated manually; they will be constructed and provided by the collection view when requested using one of the <code>dequeueCell...</code> methods.
 */
export function BMCollectionViewCell() { // <constructor>
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

    get supportsAutomaticIntrinsicSize() {
        // Use automatic intrinsic size when measuring this cell if it has no subviews
        if (this._isMeasuring && !this._subviews.length) {
            return YES;
        }

        return NO;
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
    _element: undefined, // <BMJQueryShim>
    get element() { return this._element || (this._element = BMJQueryShim.shimWithDOMNode(this.node)); },
    
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
    _reuseIdentifier: undefined, // <String>

    get reuseIdentifier() {
        return this._reuseIdentifier;
    },
    set reuseIdentifier(identifier) {
        if (identifier != this._reuseIdentifier && this.collectionView.assignsReuseIdentifierAsClass) {
            if (this._reuseIdentifier) {
                this.node.classList.remove(`BMCollectionViewCell-${this._reuseIdentifier}`);
            }

            if (identifier) {
                this.node.classList.add(`BMCollectionViewCell-${identifier}`);
            }

            this._reuseIdentifier = identifier;
        }

    },

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

        this.invalidate();

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

        this.invalidate();

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
            if (this._subviews.length) {
                // If this cell's size can be determined via its subview's constraints, use the size of
                // the cell's subview as its measurement
                BMCopyProperties(this._node.style, {width: '100%', height: '100%'});
            }
            else {
                if (this._requiredWidth) {
                    // Otherwise derive the measured size using the instrinsic CSS size
                    BMCopyProperties(this._node.style, {width: this._requiredWidth + 'px', height: 'auto'});
                }
                else {
                    // Otherwise derive the measured size using the instrinsic CSS size
                    BMCopyProperties(this._node.style, {width: 'auto', height: 'auto'});
                }
            }
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
     * Invoked prior to this cell being destroyed either because its data set object has been removed while this cell was still
     * being retained or because its owning collection view was released.
     * Subclasses can override this method to perform any changes necessary for cleanup, such as removing global event listeners/
     * The default implementation currently does nothing, but subclasses should nevertheless invoke the superclass method at some
     * point in their implementation.
     * After this method returns, the cell's node will be removed from the document and this cell will no longer be reused.
     */
    invalidate() {

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
     * @param collectionView <BMCollectionView>                         The calling collection view.
     * {
     *	@param reuseIdentifier <String>	                                The reuse identifier of this cell. The collection view will use this property to return a cell
     *														            with the correct contents when reusing elements.
     *  @param node <DOMNode>                                           The DOM node managed by this cell.
     *  @param kind <BMCollectionViewLayoutAttributesType, nullable>    Defaults to `.Cell`. The kind of cell.
     * }
     * @return <BMCollectionViewCell>                                   This cell.
     */
    initWithCollectionView(collectionView, args) {
        this._retainCount = 0;
        this._manageCount = 0;
        
        this.collectionView = collectionView;

        // #FLAG BM_USE_BMVIEW_SUBCLASS
        if (BM_USE_BMVIEW_SUBCLASS) {
            BMView.prototype.initWithDOMNode.call(this, args.node);
        }
        else {
            this.node = args.node;
        }

        this.reuseIdentifier = args.reuseIdentifier;

        if (args.kind) this.itemType = args.kind;

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
export function BMCollectionViewCellMakeForCollectionView(collectionView, options) {
    return (new BMCollectionViewCell).initWithCollectionView(collectionView, options);
}

/**
 * @deprecated Deprecated. Use <code>BMCollectionViewCellMakeForCollectionView</code> instead.
 */
var BMCellMakeForCollectionView = BMCollectionViewCellMakeForCollectionView;

// @endtype

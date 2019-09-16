// @ts-check

import {YES, NO, BMExtend, BMAddSmoothMousewheelInteractionToNode, BMIsTouchDevice} from '../Core/BMCoreUI'
import {BMPointMake} from '../Core/BMPoint'
import {BMRectMakeWithNodeFrame} from '../Core/BMRect'
import {BMAnimationContextGetCurrent, BMAnimationContext, BMAnimationContextAddCompletionHandler} from '../Core/BMAnimationContext'
import {BMLayoutAttribute, BMLayoutConstraintRelation, BMLayoutConstraint} from './BMLayoutConstraint_v2.5'
import {BMView} from './BMView_v2.5'
import {IScroll} from '../iScroll/iscroll-probe'

// @type BMScrollView extends BMView

/**
 * The scroll view manages a DOM node whose content may overflow beyond its bounds.
 * Unlike regular scrolling DOM nodes, constraints may be attached to a scroll view's content area.
 * When views are constrained to its content areas, whenever the scroll view scrolls, those views' layouts
 * will update accordingly.
 */
export function BMScrollView() {} // <constructor>

/**
 * Constructs and returns a scroll view.
 * @return <BMScrollView>   A scroll view.
 */
BMScrollView.scrollView = function () {
    return BMView.view.call(this);
}


/**
 * Constructs and returns a scroll view for the given node.
 * @param node <DOMNode>            The scroll view node.
 * {
 *  @param contentNode <DOMNode>     The scroll view content node.
 * }
 * @return <BMScrollView>           A scroll view.
 */
BMScrollView.scrollViewForNode = function (node, args) {
    return Object.create(BMScrollView.prototype).initWithWrapperDOMNode(node, args);
}

BMScrollView.prototype = BMExtend({}, BMView.prototype, {

    get contentNode() { return this._node },
    set contentNode(node) {},

    /**
     * The content view having all of the views managed by this view.
     */
    _contentView: undefined, // <BMView>
    get contentView() {
        return this._contentView;
    },

    /**
     * The iScroll instance used for scrolling.
     */
    _iScroll: undefined, // <iScroll>

    /**
     * A point representing this scroll view's current scroll offset.
     */
    _scrollOffset: undefined, // <BMPoint>

    // @override - BMView
    get supportsAutomaticIntrinsicSize() {
        return NO;
    },

    // @override - BMView
    initWithDOMNode(node) {
        let contentNode = document.createElement('div');
        return this.initWithWrapperDOMNode(node, {contentNode: contentNode});
    },

    /**
     * Initializes this scroll view with the given wrapper DOM node and the given content DOM node.
     * @param node <DOMNode>            The wrapper DOM node.
     * {
     *  @param contentNode <DOMNode>    The content view DOM node.
     * }
     */
    initWithWrapperDOMNode(node, args) {
        BMView.prototype.initWithDOMNode.call(this, node);

        this._contentView = BMView.viewForNode.call(BMScrollContentView, args.contentNode);
        BMView.prototype.addSubview.call(this, this._contentView);

        node.style.overflow = 'hidden';
        node.className = 'BMScrollView';

        BMAddSmoothMousewheelInteractionToNode(node);

        this._iScroll = new IScroll(node, {
            mouseWheel: YES, scrollbars: YES, probeType: 3, click: NO, deceleration: 0.001, resizePolling: 999999999999, scrollX: YES, freeScroll: YES, interactiveScrollbars: !BMIsTouchDevice,
            disableMouse: YES, disablePointer: YES, fadeScrollbars: BMIsTouchDevice
        });

        this._iScroll.on('scroll', () => this._iScrollDidScroll());
        this._scrollOffset = BMPointMake();

        return this;
    },

    /**
     * Invoked whenever the iScroll instance managing this scroll view's scrolling scrolls.
     */
    _iScrollDidScroll() {
        this._scrollOffset = BMPointMake(this._iScroll.x, this._iScroll.y);

        this.layout();
    },

    // @override - BMView
    get bounds() { // <BMRect>
        let bounds = this._frame.copy();
        bounds.origin = this._scrollOffset;

        return bounds;
    },


    /**
     * Should be invoked to add a subview to the content view's <code>contentNode</code>. If that subview
     * already has a superview, it will first be removed from its current superview.
     * Note that the view will not be added as a direct descendant of this scroll view
     * @param subview <BMView>                  The subview to add.
     * {
     *  @param toPosition <Number, nullable>    Defaults to the last available position within this view. The position
     *                                          in which to add the given subview. If this is specified
     *                                          CoreUI will add the subview's node before the node of the
     *                                          view currently occupying that position.
     * }
     */
    addSubview(subview, args) {
        this._contentView.addSubview(subview, args);
    },

    // @override - BMView
    release() {
        this._contentView.release();
        if (this._iScroll) this._iScroll.destroy();

        BMView.prototype.release.call(this);
    }

});

// @endtype

// @type BMScrollContentView extends BMView

/**
 * The scroll content view manages the content of a scroll view.
 */
export function BMScrollContentView () {} // <constructor>

BMScrollContentView.prototype = BMExtend({}, BMView.prototype, {

    get contentNode() { return this._node },
    set contentNode(node) {},

    // Scroll content view always has deterministic constraints.
    _hasDeterministicConstraints: YES, // <Boolean>

    /**
     * Is set to `"Scroll View Content"` by default for scroll content views.
     */
    debuggingName: 'Scroll View Content', // <String>

    // @override - BMView
    get supportsAutomaticIntrinsicSize() {
        return NO;
    },

    // @override - BMView
    // Scroll content views are always fixed to the top-left of their parents, regardless of the positioning
    // reported by its constraint variables
    _frame: undefined, // <BMRect>
    get frame() {
        return this._frame || BMRectMakeWithNodeFrame(this._node);
    },

    set frame(frame) {

        frame.origin = BMPointMake();

        Object.getOwnPropertyDescriptor(BMView.prototype, 'frame').set.call(this, frame);

        if (BMAnimationContextGetCurrent()) {
            BMAnimationContextAddCompletionHandler(() => {
                this.superview._iScroll.refresh();
            });
        }
        else {
            (this.superview._iScroll) && this.superview._iScroll.refresh();
        }

    },

    // @override - BMView
    internalConstraints() {
        let constraints = BMView.prototype.internalConstraints.call(this);

        if (this._superviewLeftConstraint) {
            this._superviewLeftConstraint.constant = this.superview._scrollOffset.x;
            this._superviewTopConstraint.constant = this.superview._scrollOffset.y;

            constraints.push(this._superviewWidthConstraint, this._superviewHeightConstraint, this._superviewLeftConstraint, this._superviewTopConstraint);
        }
        else {
            // Scroll content views are always constrained to have their size at least equal to that of their containing scroll view
            constraints.push(this._superviewWidthConstraint = BMLayoutConstraint.internalConstraintWithView(this, {
                attribute: BMLayoutAttribute.Width,
                relatedBy: BMLayoutConstraintRelation.GreaterThanOrEquals,
                toView: this.superview,
                secondAttribute: BMLayoutAttribute.Width
            }));
            constraints.push(this._superviewHeightConstraint = BMLayoutConstraint.internalConstraintWithView(this, {
                attribute: BMLayoutAttribute.Height,
                relatedBy: BMLayoutConstraintRelation.GreaterThanOrEquals,
                toView: this.superview,
                secondAttribute: BMLayoutAttribute.Height
            }));
    
            // Their reported positioning is always the parent scroll view's scroll offset
            constraints.push(this._superviewLeftConstraint = BMLayoutConstraint.internalConstraintWithView(this, {
                attribute: BMLayoutAttribute.Leading,
                relatedBy: BMLayoutConstraintRelation.Equals,
                toView: this.superview,
                secondAttribute: BMLayoutAttribute.Leading,
                constant: this.superview._scrollOffset.x
            }));
            constraints.push(this._superviewTopConstraint = BMLayoutConstraint.internalConstraintWithView(this, {
                attribute: BMLayoutAttribute.Top,
                relatedBy: BMLayoutConstraintRelation.Equals,
                toView: this.superview,
                secondAttribute: BMLayoutAttribute.Top,
                constant: this.superview._scrollOffset.y
            }));
        }

        return constraints;
    }
});

// @endtype
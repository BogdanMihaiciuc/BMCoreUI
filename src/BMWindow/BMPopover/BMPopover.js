// @ts-check

import { BMExtend, NO, YES, BMCopyProperties, BMNumberByConstrainingNumberToBounds } from "../../Core/BMCoreUI";
import { BMWindow } from "../BMWindow";
import { BMRectMakeWithOrigin, BMRectMakeWithNodeFrame, BMRectMake } from "../../Core/BMRect";
import { BMPointMake } from "../../Core/BMPoint";
import { BMHook, __BMVelocityAnimate } from "../../Core/BMAnimationContext";
import { BMView } from "../../BMView/BMView_v2.5";

// @type BMPopover extends BMWindow

/**
 * The popover is a kind of window that is visually linked to a source element.
 * Unlike windows, popovers are always modal.
 * 
 * Additionally, unlike with windows, subviews should not be directly added to the popover.
 * Instead, they should be added to the popover's `contentView` property.
 */
function BMPopover() {} // <constructor>

BMPopover.prototype = BMExtend(Object.create(BMWindow.prototype), {

    /**
     * Animatable. The point from which this popover should originate, relative to the document. Either this property
     * or `anchorNode` or `anchorRect` must be set before this popover is displayed.
     */
    _anchorPoint: undefined, // <BMPoint, nullable>

    get anchorPoint() {
        return this._anchorPoint;
    },
    set anchorPoint(point) {
        this._anchorPoint = point;
    },


    /**
     * Animatable. The rect from which this popover should originate, relative to the document. Either this property
     * or `anchorPoint` or `anchorNode` must be set before this popover is displayed.
     */
    _anchorRect: undefined, // <BMRect, nullable>

    get anchorRect() {
        return this._anchorRect;
    },
    set anchorRect(rect) {
        this._anchorRect = rect;
    },


    /**
     * Animatable. The element from which this popover should originate. Either this property
     * or `anchorPoint` or `anchorRect` must be set before this popover is displayed.
     */
    _anchorNode: undefined, // <DOMNode, nullable>

    get anchorNode() {
        return this._anchorNode;
    },
    set anchorNode(node) {
        this._anchorNode = node;
    },

    /**
     * Animatable. This popover's size.
     */
    _size: undefined, // <BMSize>
    get size() {
        return this._size;
    },
    set size(size) {
        this._size = size.copy();
    },

    /**
     * Animatable. The size of the indicator.
     */
    _indicatorSize: 16, // <Number>
    get indicatorSize() {
        return this._indicatorSize;
    },
    set indicatorSize(size) {
        this._indicatorSize = size;
    },

    /**
     * Animatable. Controls how rounded the popover's borders should be.
     */
    _borderRadius: 4, // <Number>
    get borderRadius() {
        return this._borderRadius;
    },
    set borderRadius(radius) {
        this._borderRadius = radius;
    },

    /**
     * The drop shadow container.
     */
    _dropShadowContainer: undefined, // <DOMNode>

    /**
     * The drop shadow content.
     */
    _dropShadowContent: undefined, // <DOMNode>

    /**
     * The background node.
     */
    _background: undefined, // <DOMNode>

    /**
     * The dark mode fill node.
     */
    _darkModeFill: undefined, // <DOMNode>

    /**
     * The view to which subviews should be added.
     */
    _contentView: undefined, // <BMView>
    get contentView() {
        return this._contentView;
    },
    set contentView(view) {
        this._contentView = view;
    },

    /**
     * The content view's top edge constraint.
     */
    _contentViewTopConstraint: undefined, // <BMLayoutConstraint>

    /**
     * The content view's bottom edge constraint.
     */
    _contentViewBottomConstraint: undefined, // <BMLayoutConstsraint>

    /**
     * The computed height of the indicator.
     */
    get _indicatorHeight() { // <Number>
        const indicatorWidth = this.indicatorSize * Math.SQRT2;
        return indicatorWidth / 2 | 0;
    },

    /**
     * Designated initializer. Initializes this popover with the given size.
     * 
     * Note that the size will also contain the indicator size, so the actual usable size will be smaller,
     * depending on how large the indicator is.
     * @param size <BMSize>     The popover's size.
     * @return <BMPopover>      This popover.
     */
    initWithSize(size) {
        const preliminaryFrame = BMRectMakeWithOrigin(BMPointMake(), {size});
        BMWindow.prototype.initWithFrame.call(this, preliminaryFrame, {modal: YES, toolbar: NO});

        this._size = size.copy();

        // Set up the popover container
        this.node.className = 'BMPopover';
        this.contentNode.className = 'BMPopoverContainer BMPopoverContainerView';

        this._overlay.node.className = 'BMPopoverOverlay';

        // A second layer is used to draw the drop shadow, due to the unusual shape of the popover window
        const popoverDropShadowContainer = document.createElement('div');
        popoverDropShadowContainer.className = 'BMPopoverContainerLayer BMPopoverDropShadowContainer';
        const popoverDropShadowContent = document.createElement('div');
        popoverDropShadowContent.className = 'BMPopoverDropShadowContent';
        popoverDropShadowContainer.appendChild(popoverDropShadowContent);

        // A third layer is used to draw the background
        const popoverBackground = document.createElement('div');
        popoverBackground.className = 'BMPopoverBackground';

        // Two additional sublayers are used for dark mode and contain the outline and background color.
        popoverBackground.innerHTML = '<div class="BMPopoverBackgroundDarkModeContainer"><div class="BMPopoverBackgroundDarkModeOutline"></div><div class="BMPopoverBackgroundDarkModeFill"></div></div>';

        // Add the popover to the document
        this.node.appendChild(popoverBackground);
        this.node.appendChild(popoverDropShadowContainer);
        this.node.appendChild(this.contentNode);

        this._background = popoverBackground;
        this._dropShadowContainer = popoverDropShadowContainer;
        this._dropShadowContent = popoverDropShadowContent;
        this._popoverDarkModeFill = this._background.querySelector('.BMPopoverBackgroundDarkModeFill');

        const contentView = this._contentView = BMView.view();
        this.addSubview(this._contentView);

        contentView.leading.equalTo(this.leading).isActive = YES;
        contentView.trailing.equalTo(this.trailing).isActive = YES;
        this._contentViewTopConstraint = contentView.top.equalTo(this.top);
        this._contentViewTopConstraint.isActive = YES;

        this._contentViewBottomConstraint = contentView.bottom.equalTo(this.bottom);
        this._contentViewBottomConstraint.isActive = YES;

        return this;
    },

    // @override - BMWindow
    initWithFrame(frame) {
        return this.initWithSize(frame.size);
    },

    /**
     * Invoked by CoreUI to update this popover's position and recalculate the various paths used by it.
     */
    _updatePosition() {
        const frame = BMRectMake();
        frame.size.height = this._size.height + this._indicatorHeight;
        frame.size.width = this._size.width;

        const nodeFrame = this.anchorRect && this.anchorNode && BMRectMakeWithNodeFrame(this.anchorNode);
        const location = this.anchorPoint ? this.anchorPoint.copy() : nodeFrame.center;

        frame.origin.x = location.x - frame.size.width / 2 | 0;

        if (frame.origin.x < -4) {
            frame.origin.x = -4;
        }
        if (frame.right > window.innerWidth + 4) {
            frame.origin.x = window.innerWidth - frame.size.width + 4;
        }

        const appearsBelow = location.y < window.innerHeight - this.size.height - this._indicatorHeight;

        if (appearsBelow) {
            frame.origin.y = this.anchorPoint ? location.y : nodeFrame.bottom - 2;
            this._contentViewTopConstraint.constant = this._indicatorHeight;
            this._contentViewBottomConstraint.constant = 0;
        }
        else {
            frame.origin.y = this.anchorPoint ? location.y - frame.size.height : nodeFrame.origin.y + 2 - frame.size.height;
            this._contentViewTopConstraint.constant = 0;
            this._contentViewBottomConstraint.constant = -this._indicatorHeight;
        }

        this.frame = frame;

        const innerFrame = frame.copy();
        innerFrame.origin = BMPointMake();

        const knobPosition = BMNumberByConstrainingNumberToBounds(location.x - frame.origin.x, 12, frame.size.width - 12);

        const path = `path('${this._pathForPopoverWithFrame(innerFrame, {widthIndicatorSize: this._indicatorSize, knobPosition, gravity: appearsBelow ? 'Top' : 'Bottom'})}')`;
        const outlinePath = `path('${this._pathForPopoverWithFrame(innerFrame, {widthIndicatorSize: this._indicatorSize, inset: 1, knobPosition, gravity: appearsBelow ? 'Top' : 'Bottom'})}')`;
        // Assign the frame to the window, and to the drop shadow container
        const positionStyle = {
            left: innerFrame.origin.x + 'px',
            top: innerFrame.origin.y + 'px',
            width: innerFrame.size.width + 'px',
            height: innerFrame.size.height + 'px'
        };
        BMCopyProperties(this.contentNode.style, positionStyle);

        BMCopyProperties(this._background.style, positionStyle);
        this._background.style.clipPath = path;
        this._background.style.webkitClipPath = path;

        const popoverDarkModeFill = this._background.querySelector('.BMPopoverBackgroundDarkModeFill');
        popoverDarkModeFill.style.clipPath = outlinePath;
        popoverDarkModeFill.style.webkitClipPath = outlinePath;

        BMCopyProperties(this._dropShadowContainer.style, positionStyle);
        this._dropShadowContent.style.clipPath = path;
        this._dropShadowContent.style.webkitClipPath = path;

        const popoverLayers = [this.contentNode, this._background, this._dropShadowContainer];

        for (const layer of popoverLayers) {
            layer.style.transformOrigin = ((knobPosition / this.frame.size.width) * 100) + '% ' + (appearsBelow ? '0%' : '100%');
        }
    },

    /**
     * Builds the SVG path definition for a popover with the given frame. Note that the indicator will be positioned inside the frame, which will push the usable
     * area of the frame downwards.
     * @param frame <BMRect>                            The popover's frame.
     * {
     *  @param widthIndicatorSize <Number, nullable>    Defaults to `8`. The size of the popover's indicator.
     *  @param radius <Number, nullable>                Defaults to `4`. Controls how rounded the corners are.
     *  @param inset <Number, nullable>                 Defaults to `0`. An optional inset to apply to the path.
     *  @param knobPosition <Number, nullable>          Defaults to half of the frame's width. The position along the top frame on which to place the knob.
     *                                                  This coordinate is relative to the popover's frame and represents the center position of the knob.
     *                                                  This position should not overlap the specified corner radius.
     *  @param gravity <String, nullable>               Defaults to `"Top"`. If set to `"Bottom"`, the popover knob will be placed at the bottom of the popover.
     * }
     * @return <String>                                 The SVG path.
     */
    _pathForPopoverWithFrame(frame, {widthIndicatorSize: size = 8, radius = 8, inset = 0, knobPosition = undefined, gravity = 'Top'} = {widthIndicatorSize: 8, radius: 4, inset: 0}) {
        let top = gravity === 'Bottom' ? 0 : size * Math.SQRT2 / 2 | 0;
        let bottom = gravity === 'Bottom' ? frame.size.height - size * Math.SQRT2 / 2 | 0 : frame.size.height;
        const left = inset;

        if (inset) {
            size = size - inset;
            frame = frame.copy();
            frame.insetWithInset(BMInsetMakeWithEqualInsets(inset));
            radius = radius + inset;
            top += inset;
            bottom -= inset;
        }

        if (knobPosition === undefined) {
            knobPosition = frame.size.width / 2 | 0;
        }
        else {
            knobPosition = (knobPosition - inset) | 0;
        }

        const knobWidth = size * Math.SQRT2;
        const knobHeight = knobWidth / 2 | 0;

        // bottom should be equivalent to frame.size.height + inset
        const pathTop = gravity === 'Bottom' ?
            `M${left + radius},${top} L${frame.size.width + left - radius},${top} ` :
            `M${left + radius},${top} L${(knobPosition - knobWidth / 2 + left)},${top} l${(knobWidth / 2)},${-knobHeight} l${(knobWidth / 2)},${knobHeight} L${frame.size.width + left - radius},${top} `;

        const pathBottom = gravity === 'Bottom' ?
            `Q${frame.size.width + left},${bottom} ${frame.size.width + left - radius},${bottom} L${(knobPosition + knobWidth / 2 + left)},${bottom} l${(-knobWidth / 2)},${knobHeight} l${(-knobWidth / 2)},${-knobHeight} L${radius},${bottom} ` :
            `Q${frame.size.width + left},${bottom} ${frame.size.width + left - radius},${bottom} L${radius},${bottom} `;


        let path =  pathTop;
        path +=     `Q${frame.size.width + left},${top} ${frame.size.width + left},${top + radius} L${frame.size.width + left},${bottom - radius} `;
        path +=     pathBottom;
        path +=     `Q${left},${bottom} ${left},${bottom - radius} L${left},${top + radius} Q${left},${top} ${radius},${top} Z`;

        return path;
    },

    // @override - BMWindow
    animateInWithCompletionHandler(completionHandler) {
        const popoverLayers = [this.contentNode, this._background, this._dropShadowContainer];

        this.node.style.opacity = 1;

        let first = YES;
        for (const layer of popoverLayers) {
            BMHook(layer, {scaleX: .75, scaleY: .75, opacity: 0});

            __BMVelocityAnimate(layer, {scaleX: 1, scaleY: 1, opacity: 1}, {duration: 300, easing: [0,1.59,.49,1], complete: first ? completionHandler : undefined}, YES);
            first = NO;
        }
    },

    // @override - BMWindow
    animateOutWithCompletionHandler(completionHandler) {
        const popoverLayers = [this.contentNode, this._background, this._dropShadowContainer];

        const self = this;

        let first = YES;
        for (const layer of popoverLayers) {
            layer.style.pointerEvents = 'none';

            const runCompletionHandler = first;
            __BMVelocityAnimate(layer, {scaleX: .9, scaleY: .9, opacity: 0}, {duration: 200, easing: 'easeInOutQuart', complete() {
                if (runCompletionHandler) {
                    self.node.style.opacity = 0;
                    completionHandler();
                }
            }}, YES);
            first = NO;
        }
    },

    // @override - BMWindow
    bringToFrontAnimated(animated, args) {
        if (!this.anchorNode && !this.anchorPoint && !this.anchorRect) throw new Error('The anchorPoint, anchorRect or anchorNode must be set prior to showing this popover.');

        this._updatePosition();

        BMWindow.prototype.bringToFrontAnimated.apply(this, arguments);
    }

});

/**
 * Constructs and returns a popover with the given size.
 * @param size <BMSize>         The popover's size.
 * @return <BMPopover>          A popover.
 */
BMPopover.popoverWithSize = function (size) {
    return (new BMPopover).initWithSize(size);
}

// @endtype
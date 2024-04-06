// @ts-check

import { BMExtend, NO, YES, BMCopyProperties, BMNumberByConstrainingNumberToBounds, BMUUIDMake } from "../../Core/BMCoreUI";
import { BMWindow } from "../BMWindow";
import { BMRectMakeWithOrigin, BMRectMakeWithNodeFrame, BMRectMake } from "../../Core/BMRect";
import { BMPointMake } from "../../Core/BMPoint";
import { BMHook, __BMVelocityAnimate } from "../../Core/BMAnimationContext";
import { BMView, BMViewColorScheme } from "../../BMView/BMView_v2.5";
import { BMInsetMakeWithEqualInsets } from "../../Core/BMInset";

// @type BMPopoverIndicatorDirection

// @endtype

/**
 * Constants describing the position where the indicator appears on its popover.
 */
 export var BMPopoverIndicatorDirection = Object.freeze({ // <enum>
	/**
	 * Causes the popover indicator to appear on the top edge of the popover.
	 */
	Top: "Top", // <enum>
	
	/**
	 * Causes the popover indicator to appear on the bottom edge of the popover.
	 */
	Bottom: "Bottom", // <enum>
	
	/**
	 * Causes the popover indicator to appear on the left edge of the popover.
	 */
	Left: "Left", // <enum>
	
	/**
	 * Causes the popover indicator to appear on the right edge of the popover.
	 */
	Right: "Right" // <enum>
});

// @type BMPopover extends BMWindow

/**
 * The popover is a kind of window that is visually linked to a source element.
 * Unlike windows, popovers are always modal.
 * 
 * Additionally, unlike with windows, subviews should not be directly added to the popover.
 * Instead, they should be added to the popover's `contentView` property.
 */
export function BMPopover() {} // <constructor>

BMPopover.prototype = BMExtend(Object.create(BMWindow.prototype), {

    /**
     * The point from which this popover should originate, relative to the document. Either this property
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
     * The rect from which this popover should originate, relative to the document. Either this property
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
     * The element from which this popover should originate. Either this property
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
     * This popover's size. This property must be set prior to the
     * popover being displayed.
     */
    _size: undefined, // <BMSize>
    get size() {
        return this._size;
    },
    set size(size) {
        this._size = size.copy();
    },

    /**
     * The size of the indicator. This property should be set prior to the
     * popover being displayed.
     */
    _indicatorSize: 16, // <Number>
    get indicatorSize() {
        return this._indicatorSize;
    },
    set indicatorSize(size) {
        this._indicatorSize = size;
    },

    /**
     * Controls how rounded the popover's borders should be. This property should be set prior to the
     * popover being displayed.
     */
    _borderRadius: 8, // <Number>
    get borderRadius() {
        return this._borderRadius;
    },
    set borderRadius(radius) {
        this._borderRadius = radius;
    },

    /**
     * Controls the spacing that this popover will maintain towards the edges of the viewport
     * in cases where the popover would move outside the visible area in order to maintain its
     * regular position.
     */
    _edgeInsets: undefined, // <BMInset>
    get edgeInsets() {
        return this._edgeInsets;
    },
    set edgeInsets(margin) {
        this._edgeInsets = margin || BMInsetMakeWithEqualInsets(8);

        if (this.isVisible) {
            // If this is updated while the popover is visible, update its position accordingly
            // TODO: Only update when this would actually change the position
            this._updatePosition();
        }
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
     * A SVG object that defines the clip path that must be used on
     * browsers that don't suport the `clip-path: path(...)` CSS values.
     * This property will be `undefined` for all other browsers.
     */
    _clipPathSVG: undefined, // <DOMNode, nullable>

    /**
     * When `_clipPathSVG` is defined, this represents the background path element.
     */
    _clipPathBackgroundPath: undefined, // <DOMNode, nullable>

    /**
     * When `_clipPathSVG` is defined, this represents the outline path element.
     */
    _clipPathOutlinePath: undefined, // <DOMNode, nullable>

    /**
     * When `_clipPathSVG` is defined, this represents the box shadow path element.
     */
    _clipPathBoxShadowPath: undefined, // <DOMNode, nullable>

    /**
     * A string that forms part of the HTML IDs that will be assigned to the clip paths
     * to be used on browsers.
     * This property will be `undefined` for all other browsers.
     */
    _clipPathUUID: undefined, // <String, nullable>

    /**
     * The content view's top edge constraint.
     */
    _contentViewTopConstraint: undefined, // <BMLayoutConstraint>

    /**
     * The content view's bottom edge constraint.
     */
    _contentViewBottomConstraint: undefined, // <BMLayoutConstraint>

    /**
     * The content view's left edge constraint.
     */
    _contentViewLeftConstraint: undefined, // <BMLayoutConstraint>

    /**
     * The content view's right edge constraint.
     */
    _contentViewRightConstraint: undefined, // <BMLayoutConstraint>

    /**
     * The computed height of the indicator.
     */
    get _indicatorHeight() { // <Number>
        const indicatorWidth = this.indicatorSize * Math.SQRT2;
        return indicatorWidth / 2 | 0;
    },

    /**
     * An array that specifies the permitted indicator directions that this popover
     * may use and the priority in which they will be evaluated.
     */
    _permittedDirections: [BMPopoverIndicatorDirection.Bottom, BMPopoverIndicatorDirection.Top, BMPopoverIndicatorDirection.Right, BMPopoverIndicatorDirection.Left], // <[BMPopoverIndicatorDirection]>
    get permittedDirections() {
        return this._permittedDirections.slice();
    },
    set permittedDirections(directions) {
        this._permittedDirections = directions.slice();
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

        this._edgeInsets = BMInsetMakeWithEqualInsets(8);

        this._size = size.copy();

        // Set up the popover container
        this.node.className = 'BMDarkModeAuto BMPopover';
        this.contentNode.className = 'BMDarkModeAuto BMPopoverContainer BMPopoverContainerView';

        this._overlay.node.className = 'BMPopoverOverlay';

        // A second layer is used to draw the drop shadow, due to the unusual shape of the popover window
        const popoverDropShadowContainer = document.createElement('div');
        popoverDropShadowContainer.className = 'BMDarkModeAuto BMPopoverContainerLayer BMPopoverDropShadowContainer';
        const popoverDropShadowContent = document.createElement('div');
        popoverDropShadowContent.className = 'BMDarkModeAuto BMPopoverDropShadowContent';
        popoverDropShadowContainer.appendChild(popoverDropShadowContent);

        // A third layer is used to draw the background
        const popoverBackground = document.createElement('div');
        popoverBackground.className = 'BMDarkModeAuto BMPopoverBackground';

        // Two additional sublayers are used for dark mode and contain the outline and background color.
        popoverBackground.innerHTML = '<div class="BMDarkModeAuto BMPopoverBackgroundDarkModeContainer"><div class="BMDarkModeAuto BMPopoverBackgroundDarkModeOutline"></div><div class="BMDarkModeAuto BMPopoverBackgroundDarkModeFill"></div></div>';

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

        this._contentViewLeftConstraint = contentView.left.equalTo(this.left);
        this._contentViewLeftConstraint.isActive = YES;

        this._contentViewRightConstraint = contentView.right.equalTo(this.right);
        this._contentViewRightConstraint.isActive = YES;

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

	// @override - BMView
	colorSchemeDidChange(scheme) {
		BMWindow.prototype.colorSchemeDidChange.apply(this, arguments);

		switch (this.colorScheme) {
			case BMViewColorScheme.Light:
				// Handled by BMWindow
				break;
			case BMViewColorScheme.Auto:
				// For auto mode, add the BMDarkModeAuto class to the elements whose appearance should change
				this._dropShadowContainer.classList.add('BMDarkModeAuto');
				this._dropShadowContent.classList.add('BMDarkModeAuto');
				this._background.classList.add('BMDarkModeAuto');
				this._popoverDarkModeFill.classList.add('BMDarkModeAuto');
                this._background.querySelector('.BMPopoverBackgroundDarkModeOutline').classList.add('BMDarkModeAuto');
                this._background.querySelector('.BMPopoverBackgroundDarkModeContainer').classList.add('BMDarkModeAuto');
				break;
			case BMViewColorScheme.Dark:
				// Dark is not yet supported
			default:
				throw new Error(`The color scheme ${scheme} is not supported on this view.`);
		}
	},

    /**
     * Invoked by CoreUI to update this popover's position and recalculate the various paths used by it.
     */
    _updatePosition() {
        const frame = BMRectMake();
        frame.size.height = this._size.height + this._indicatorHeight;
        frame.size.width = this._size.width;

        const nodeFrame = this.anchorRect || (this.anchorNode && BMRectMakeWithNodeFrame(this.anchorNode));
        const location = this.anchorPoint ? this.anchorPoint.copy() : nodeFrame.center;

        // Determine the appropriate direction to display this popover
        let direction;
        if (this.anchorPoint) {
            direction = this._directionAroundPoint(location);
        }
        else {
            direction = this._directionAroundRect(nodeFrame);
        }

        // Adjust the constraints based on the direction
        switch (direction) {
            case BMPopoverIndicatorDirection.Top:
                frame.origin.y = this.anchorPoint ? location.y : nodeFrame.bottom - 2;

                frame.origin.x = location.x - frame.size.width / 2 | 0;

                if (frame.origin.x < this._edgeInsets.left) {
                    frame.origin.x = this._edgeInsets.left;
                }
                if (frame.right > window.innerWidth - this._edgeInsets.right) {
                    frame.origin.x = window.innerWidth - frame.size.width - this._edgeInsets.right;
                }
                
                this._contentViewTopConstraint.constant = this._indicatorHeight;
                this._contentViewBottomConstraint.constant = 0;
                this._contentViewLeftConstraint.constant = 0;
                this._contentViewRightConstraint.constant = 0;
                break;
            case BMPopoverIndicatorDirection.Bottom:
                frame.origin.y = this.anchorPoint ? location.y - frame.size.height : nodeFrame.origin.y + 2 - frame.size.height;

                frame.origin.x = location.x - frame.size.width / 2 | 0;

                if (frame.origin.x < this._edgeInsets.left) {
                    frame.origin.x = this._edgeInsets.left;
                }
                if (frame.right > window.innerWidth - this._edgeInsets.right) {
                    frame.origin.x = window.innerWidth - frame.size.width - this._edgeInsets.right;
                }
                
                this._contentViewTopConstraint.constant = 0;
                this._contentViewBottomConstraint.constant = -this._indicatorHeight;
                this._contentViewLeftConstraint.constant = 0;
                this._contentViewRightConstraint.constant = 0;
                break;
            case BMPopoverIndicatorDirection.Right:
                frame.origin.x = this.anchorPoint ? location.x - frame.size.width : nodeFrame.origin.x + 2 - frame.size.width;

                frame.origin.y = location.y - frame.size.height / 2 | 0;

                if (frame.origin.y < this._edgeInsets.top) {
                    frame.origin.y = this._edgeInsets.top;
                }
                if (frame.bottom > window.innerHeight - this._edgeInsets.bottom) {
                    frame.origin.y = window.innerHeight - frame.size.height - this._edgeInsets.bottom;
                }
                
                this._contentViewTopConstraint.constant = 0;
                this._contentViewBottomConstraint.constant = 0;
                this._contentViewLeftConstraint.constant = 0;
                this._contentViewRightConstraint.constant = -this._indicatorHeight;
                break;
            case BMPopoverIndicatorDirection.Left:
                frame.origin.x = this.anchorPoint ? location.x : nodeFrame.right - 2;

                frame.origin.y = location.y - frame.size.height / 2 | 0;

                if (frame.origin.y < this._edgeInsets.top) {
                    frame.origin.y = this._edgeInsets.top;
                }
                if (frame.bottom > window.innerHeight - this._edgeInsets.bottom) {
                    frame.origin.y = window.innerHeight - frame.size.height - this._edgeInsets.bottom;
                }
                
                this._contentViewTopConstraint.constant = 0;
                this._contentViewBottomConstraint.constant = 0;
                this._contentViewLeftConstraint.constant = this._indicatorHeight;
                this._contentViewRightConstraint.constant = 0;
                break;
        }

        this.frame = frame;

        // Determine the indicator's position along its edge
        let indicatorPosition;
        switch (direction) {
            case BMPopoverIndicatorDirection.Bottom:
            case BMPopoverIndicatorDirection.Top:
                indicatorPosition = BMNumberByConstrainingNumberToBounds(location.x - frame.origin.x, 12, frame.size.width - 12);
                break;
            case BMPopoverIndicatorDirection.Left:
            case BMPopoverIndicatorDirection.Right:
                indicatorPosition = BMNumberByConstrainingNumberToBounds(location.y - frame.origin.y, 12, frame.size.height - 12);
                break;
        }

        // Create an inner frame to be used by the various paths
        const innerFrame = frame.copy();
        innerFrame.origin = BMPointMake();

        const pathContent = `${this._pathForPopoverWithFrame(innerFrame, {indicatorSize: this._indicatorSize, position: indicatorPosition, direction, radius: this._borderRadius})}`;
        const outlinePathContent = `${this._pathForPopoverWithFrame(innerFrame, {indicatorSize: this._indicatorSize, inset: 1, position: indicatorPosition, direction, radius: this._borderRadius - 1.5})}`;
        const boxShadowPathContent = `${this._pathForPopoverWithFrame(innerFrame, {indicatorSize: this._indicatorSize, position: indicatorPosition, direction, radius: this._borderRadius + 1.5})}`;

        if (!this._clipPathUUID && !CSS.supports('clip-path', `path('${pathContent}')`)) {
            // If inline path definitions are not supported by the browsers, create an UUID for a SVG clip path and create it
            this._clipPathUUID = BMUUIDMake();

            this._clipPathSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this._clipPathSVG.style.width = '0';
            this._clipPathSVG.style.height = '0';

            // Create and attach the main clip path
            const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
            clipPath.setAttribute('id', 'popover-clip-path-' + this._clipPathUUID);
            clipPath.setAttribute('clipPathUnits', 'userSpaceOnUse');
            this._clipPathBackgroundPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            clipPath.appendChild(this._clipPathBackgroundPath);

            this._clipPathSVG.appendChild(clipPath);

            // Create and attach the outline clip path
            const outlineClipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
            outlineClipPath.setAttribute('id', 'popover-outline-clip-path-' + this._clipPathUUID);
            outlineClipPath.setAttribute('clipPathUnits', 'userSpaceOnUse');
            this._clipPathOutlinePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            outlineClipPath.appendChild(this._clipPathOutlinePath);

            this._clipPathSVG.appendChild(outlineClipPath);

            // Create and attach the shadow clip path
            const boxShadowClipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
            boxShadowClipPath.setAttribute('id', 'popover-box-shadow-clip-path-' + this._clipPathUUID);
            boxShadowClipPath.setAttribute('clipPathUnits', 'userSpaceOnUse');
            this._clipPathBoxShadowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            boxShadowClipPath.appendChild(this._clipPathBoxShadowPath);

            this._clipPathSVG.appendChild(boxShadowClipPath);

            document.body.appendChild(this._clipPathSVG);
            
        }

        // For Chrome, update the path nodes
        if (this._clipPathUUID) {
            this._clipPathBackgroundPath.setAttribute('d', pathContent);
            this._clipPathOutlinePath.setAttribute('d', outlinePathContent);
            this._clipPathBoxShadowPath.setAttribute('d', boxShadowPathContent);
        }

        // For Blink/Chrome-based browsers clip-path: path() is not supported, but clip-path: url() can be used instead for that browser
        const path = this._clipPathUUID ? `url(#popover-clip-path-${this._clipPathUUID})` : `path('${pathContent}')`;
        const outlinePath = this._clipPathUUID ? `url(#popover-outline-clip-path-${this._clipPathUUID})` : `path('${outlinePathContent}')`;
        const boxShadowPath = this._clipPathUUID ? `url(#popover-box-shadow-clip-path-${this._clipPathUUID})` : `path('${boxShadowPathContent}')`;

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
        this._dropShadowContent.style.clipPath = boxShadowPath;
        this._dropShadowContent.style.webkitClipPath = boxShadowPath;

        const popoverLayers = [this.contentNode, this._background, this._dropShadowContainer];

        let transformOriginX, transformOriginY;
        switch (direction) {
            case BMPopoverIndicatorDirection.Bottom:
                transformOriginX = ((indicatorPosition / this.frame.size.width) * 100) + '%';
                transformOriginY = '100%';
                break;
            case BMPopoverIndicatorDirection.Top:
                transformOriginX = ((indicatorPosition / this.frame.size.width) * 100) + '%';
                transformOriginY = '0%';
                break;
            case BMPopoverIndicatorDirection.Left:
                transformOriginX = '0%';
                transformOriginY = ((indicatorPosition / this.frame.size.height) * 100) + '%';
                break;
            case BMPopoverIndicatorDirection.Right:
                transformOriginX = '100%';
                transformOriginY = ((indicatorPosition / this.frame.size.height) * 100) + '%';
                break;
        }

        for (const layer of popoverLayers) {
            layer.style.transformOrigin = `${transformOriginX} ${transformOriginY}`;
        }
    },

    /**
     * Determines the direction that the popover should appear in order to fit best around the given point.
     * The popover will verify directions in the order specified by the `permittedDirections` property.
     * If none of the permitted indicator directions would fit the popover in the viewport, the first
     * specified direction is returned.
     * @param point <BMPoint>                   The anchor point to check against.
     * @return <BMPopoverIndicatorDirection>    The direction that best fits.
     */
    _directionAroundPoint(point) {
        for (const direction of this._permittedDirections) {
            switch (direction) {
                case BMPopoverIndicatorDirection.Top:
                    if (point.y < window.innerHeight - this.size.height - this._indicatorHeight) {
                        return BMPopoverIndicatorDirection.Top;
                    }
                    break;
                case BMPopoverIndicatorDirection.Bottom:
                    if (point.y > this.size.height + this._indicatorHeight) {
                        return BMPopoverIndicatorDirection.Bottom;
                    }
                    break;
                case BMPopoverIndicatorDirection.Right:
                    if (point.x > this.size.width + this._indicatorHeight) {
                        return BMPopoverIndicatorDirection.Right;
                    }
                    break;
                case BMPopoverIndicatorDirection.Left:
                    if (point.x < window.innerWidth - this.size.width - this._indicatorHeight) {
                        return BMPopoverIndicatorDirection.Left;
                    }
                    break;
            }
        }

        return this._permittedDirections[0];
    },

    /**
     * Determines the direction that the popover should appear in order to fit best around the given rect.
     * The popover will verify directions in the order specified by the `permittedDirections` property.
     * If none of the permitted indicator directions would fit the popover in the viewport, the first
     * specified direction is returned.
     * @param rect <BMRect>                     The anchor rect to check against.
     * @return <BMPopoverIndicatorDirection>    The direction that best fits.
     */
    _directionAroundRect(rect) {
        for (const direction of this._permittedDirections) {
            switch (direction) {
                case BMPopoverIndicatorDirection.Top:
                    if (rect.bottom < window.innerHeight - this.size.height - this._indicatorHeight) {
                        return BMPopoverIndicatorDirection.Top;
                    }
                    break;
                case BMPopoverIndicatorDirection.Bottom:
                    if (rect.top > this.size.height + this._indicatorHeight) {
                        return BMPopoverIndicatorDirection.Bottom;
                    }
                    break;
                case BMPopoverIndicatorDirection.Right:
                    if (rect.left > this.size.width + this._indicatorHeight) {
                        return BMPopoverIndicatorDirection.Right;
                    }
                    break;
                case BMPopoverIndicatorDirection.Left:
                    if (rect.right < window.innerWidth - this.size.width - this._indicatorHeight) {
                        return BMPopoverIndicatorDirection.Left;
                    }
                    break;
            }
        }

        return this._permittedDirections[0];
    },

    /**
     * Builds the SVG path definition for a popover with the given frame. Note that the indicator will be positioned inside the frame, which will push the usable
     * area of the frame downwards.
     * @param frame <BMRect>                                        The popover's frame.
     * {
     *  @param indicatorSize <Number, nullable>                     Defaults to `8`. The size of the popover's indicator.
     *  @param radius <Number, nullable>                            Defaults to `4`. Controls how rounded the corners are.
     *  @param inset <Number, nullable>                             Defaults to `0`. An optional inset to apply to the path.
     *  @param position <Number, nullable>                          Defaults to half of the frame's width. The position along the edge of the frame on which to place the indicator.
     *                                                              This coordinate is relative to the popover's frame and represents the center position of the indicator.
     *                                                              This position should not overlap the specified corner radius.
     *  @param direction <BMPopoverIndicatorDirection, nullable>    Defaults to `.Top`. Controls where the indicator will be placed relative to the popover.
     * }
     * @return <String>                                 The SVG path.
     */
    _pathForPopoverWithFrame(frame, {indicatorSize = 8, radius = 8, inset = 0, position = undefined, direction = BMPopoverIndicatorDirection.Top} = {indicatorSize: 8, radius: 4, inset: 0}) {
        // Adjust the appropriate edge's position depending on the indicator direction
        let top = direction === BMPopoverIndicatorDirection.Top ? indicatorSize * Math.SQRT2 / 2 | 0 : 0;
        let left = direction == BMPopoverIndicatorDirection.Left ? indicatorSize * Math.SQRT2 / 2 | 0 : 0;

        let bottom = direction === BMPopoverIndicatorDirection.Bottom ? frame.size.height - indicatorSize * Math.SQRT2 / 2 | 0 : frame.size.height;
        let right = direction == BMPopoverIndicatorDirection.Right ? frame.size.width - indicatorSize * Math.SQRT2 / 2 | 0 : frame.size.width;

        if (inset) {
            // If an inset is specified, adjust the values appropriately
            indicatorSize = indicatorSize - inset;
            frame = frame.copy();
            frame.insetWithInset(BMInsetMakeWithEqualInsets(inset));
            radius = radius + inset;

            top += inset;
            left += inset;

            bottom -= inset;
            right -= inset;
        }

        if (position === undefined) {
            position = frame.size.width / 2 | 0;
        }
        else {
            position = (position - inset) | 0;
        }

        const knobWidth = indicatorSize * Math.SQRT2;
        const knobHeight = knobWidth / 2 | 0;

        const pathTop = direction === BMPopoverIndicatorDirection.Top ?
            // Start at top left, then draw the indicator and move to the end of the edge
            `M${left + radius},${top} ` +
            `L${(position - knobWidth / 2 + left)},${top} l${(knobWidth / 2)},${-knobHeight} l${(knobWidth / 2)},${knobHeight} ` +
            `L${right - radius},${top} ` :
            // Start at top left, then move to the end of the edge
            `M${left + radius},${top} ` +
            `L${right - radius},${top} `;

        const pathRight = direction == BMPopoverIndicatorDirection.Right ? 
            // Draw the rounded corner, then the indicator and move to the end of the edge
            `Q${right},${top} ${right},${top + radius} ` +
            `L${right},${(position - knobWidth / 2 + top)} l${knobHeight},${(knobWidth / 2)} l${-knobHeight},${(knobWidth / 2)} ` +
            `L${right},${bottom - radius} ` :
            // Draw the rounded corner, then move to the end of the dge
            `Q${right},${top} ${right},${top + radius} ` +
            `L${right},${bottom - radius} `;

        const pathBottom = direction === BMPopoverIndicatorDirection.Bottom ?
            // Draw the rounded corner, then the indicator and move to the end of the edge
            `Q${right},${bottom} ${right - radius},${bottom} ` +
            `L${(position + knobWidth / 2 + left)},${bottom} l${(-knobWidth / 2)},${knobHeight} l${(-knobWidth / 2)},${-knobHeight} ` +
            `L${left + radius},${bottom} ` :
            // Draw the rounded corner, then move to the end of the edge
            `Q${right},${bottom} ${right - radius},${bottom} ` +
            `L${left + radius},${bottom} `;

        const pathLeft = direction === BMPopoverIndicatorDirection.Left ?
            // Draw the rounded corner coming from the bottom left, then the indicator
            // afterwards move to the end of the edge and finally draw the rounded corner coming from the left to top
            `Q${left},${bottom} ${left},${bottom - radius} ` +
            `L${left},${(position + knobWidth / 2 + top)} l${-knobHeight},${(-knobWidth / 2)} l${knobHeight},${(-knobWidth / 2)} ` +
            `L${left},${top + radius} ` +
            `Q${left},${top} ${left + radius},${top} Z` :
            // Draw the rounded corner coming from the bottom left, then move to
            // the end of the edge and finally draw the rounded corner coming from the left to top
            `Q${left},${bottom} ${left},${bottom - radius} ` +
            `L${left},${top + radius} ` +
            `Q${left},${top} ${left + radius},${top} Z`;


        let path =  pathTop;
        path +=     pathRight; //`Q${right},${top} ${right},${top + radius} L${right},${bottom - radius} `;
        path +=     pathBottom;
        path +=     pathLeft; //`Q${left},${bottom} ${left},${bottom - radius} L${left},${top + radius} Q${left},${top} ${radius},${top} Z`;

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
    },

    // @override - BMWindow
    release() {
        if (this._clipPathUUID) {
            this._clipPathSVG.remove();
        }

        return BMWindow.prototype.release.apply(this, arguments);
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
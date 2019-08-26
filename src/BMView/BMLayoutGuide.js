// @ts-check

import {YES, NO, BMExtend} from '../Core/BMCoreUI'
import {BMPointMake} from '../Core/BMPoint'
import {BMLayoutAttribute, BMLayoutConstraintRelation, BMLayoutConstraint} from './BMLayoutConstraint_v2.5'
import {BMView} from './BMView_v2.5'

// @type BMLayoutGuide extends BMView

/**
 * The layout guide view is a view that can be dragged and translates its dragged position into constraints related to its superview.
 * This makes it possible to use it to implement behaviours such as resizable or movable panels.
 */
export function BMLayoutGuide () {} // <constructor>

BMLayoutGuide.prototype = BMExtend({}, BMView.prototype, {
    // @override - BMView
    get supportsAutomaticIntrinsicSize() {
        return NO;
    },

    /**
     * This layout guide's position.
     */
    _position: BMPointMake(), // <BMPoint>

    /**
     * Set to `YES` after this layout guide has been dragged once.
     */
    _dragged: NO, // <Boolean>

    /**
     * The horizontal layout attribute that will be used when building this layout guide's horizontal constraint.
     */
    _horizontalConstraintAnchor: BMLayoutAttribute.Leading, // <BMLayoutAttribute>

    /**
     * The vertical layout attribute that will be used when building this layout guide's vertical constraint.
     */
    _verticalConstraintAnchor: BMLayoutAttribute.Top, // <BMLayoutAttribute>

    // @override - BMView
    initWithDOMNode(node) {
        BMView.prototype.initWithDOMNode.call(this, node);

        node.addEventListener('mousedown', event => {
            this._dragged = YES;

            let lastPosition;
            if (this._horizontalConstraintAnchor == BMLayoutAttribute.Trailing) {
                this._position = BMPointMake(this.node.offsetLeft + this.node.offsetWidth - this.node.parentNode.offsetWidth, this.node.offsetTop + this.node.offsetHeight - this.node.parentNode.offsetHeight);
                lastPosition = BMPointMake(event.clientX, event.clientY);
            }
            else {
                this._position = BMPointMake(this.node.offsetLeft, this.node.offsetTop);
                lastPosition = BMPointMake(event.clientX, event.clientY);
            }

            let mouseMoveEventListener = event => {
                let position = BMPointMake(event.clientX, event.clientY);
                this._position = BMPointMake(this._position.x + position.x - lastPosition.x, this._position.y + position.y - lastPosition.y);
                lastPosition = position;
                if (this.superview) this.layout();
                event.preventDefault();
            };

            // Upon starting a drag event, add a mask over the entire viewport that uses the layout guide's cursor
            let cursor = window.getComputedStyle(this.node).cursor;

            let mask = document.createElement('div');
            mask.className = 'BMLayoutGuideMask';
            mask.style.cursor = cursor;
            document.body.appendChild(mask);

            let mouseUpEventListener = event => {
                window.removeEventListener('mousemove', mouseMoveEventListener, YES);
                window.removeEventListener('mouseup', mouseUpEventListener, YES);
                mask.remove();
            }

            window.addEventListener('mousemove', mouseMoveEventListener, YES);
            window.addEventListener('mouseup', mouseUpEventListener, YES);

            event.preventDefault();
        });

        let touchDragPoint;

        node.addEventListener('touchstart', /** @type {TouchEvent} */ event => {
            // If there is already a drag in progress, don't process this new event
            if (typeof touchDragPoint !== 'undefined') {
                return;
            }

            // Only use the first touch point
            touchDragPoint = event.changedTouches[0].identifier;
            this._dragged = YES;

            let lastPosition;
            if (this._horizontalConstraintAnchor == BMLayoutAttribute.Trailing) {
                this._position = BMPointMake(this.node.offsetLeft + this.node.offsetWidth - this.node.parentNode.offsetWidth, this.node.offsetTop + this.node.offsetHeight - this.node.parentNode.offsetHeight);
                lastPosition = BMPointMake(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
            }
            else {
                this._position = BMPointMake(this.node.offsetLeft, this.node.offsetTop);
                lastPosition = BMPointMake(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
            }

            let mouseMoveEventListener = event => {
                // Look for the actively tracked touch point
                let touch;
                for (let changedTouch of event.changedTouches) {
                    if (changedTouch.identifier == touchDragPoint) {
                        touch = changedTouch;
                        break;
                    }
                }

                // If the actively tracked touch point did not move, do not process this event
                if (!touch) return;

                let position = BMPointMake(touch.clientX, touch.clientY);
                this._position = BMPointMake(this._position.x + position.x - lastPosition.x, this._position.y + position.y - lastPosition.y);
                lastPosition = position;
                if (this.superview) this.layout();
                event.preventDefault();
            };

            let mouseUpEventListener = event => {
                touchDragPoint = undefined;
                window.removeEventListener('touchmove', mouseMoveEventListener);
                window.removeEventListener('touchend', mouseUpEventListener);
                window.removeEventListener('touchcancel', mouseUpEventListener);
            }

            window.addEventListener('touchmove', mouseMoveEventListener);
            window.addEventListener('touchend', mouseUpEventListener);
            window.removeEventListener('touchcancel', mouseUpEventListener);

            event.preventDefault();
        });

        return this;

    },

    /**
     * Sets this layout guide's position. If this guide has been
     * dragged, setting this values does nothing.
     */
    set initialPosition(position) { // <BMPoint>
        if (!this._dragged) {
            this._position = position.copy();
            if (this.superview) this.layout();
        }
    },

    // @override - BMView
    internalConstraints() {
        let constraints = BMView.prototype.internalConstraints.call(this);

        if (this._superviewLeftConstraint) {
            this._superviewLeftConstraint.constant = this._position.x;
            this._superviewTopConstraint.constant = this._position.y;

            constraints.push(this._superviewLeftConstraint, this._superviewTopConstraint);
        }
        else {
            // Their reported positioning is always the parent scroll view's scroll offset
            constraints.push(this._superviewLeftConstraint = BMLayoutConstraint.internalConstraintWithView(this, {
                attribute: this._horizontalConstraintAnchor,
                relatedBy: BMLayoutConstraintRelation.Equals,
                toView: this.superview,
                secondAttribute: this._horizontalConstraintAnchor,
                constant: this._position.x,
                priority: 500
            }));
            constraints.push(this._superviewTopConstraint = BMLayoutConstraint.internalConstraintWithView(this, {
                attribute: this._verticalConstraintAnchor,
                relatedBy: BMLayoutConstraintRelation.Equals,
                toView: this.superview,
                secondAttribute: this._verticalConstraintAnchor,
                constant: this._position.y,
                priority: 500
            }));
        }

        return constraints;
    }
});

// @endtype
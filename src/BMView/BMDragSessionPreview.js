import { NO, YES } from "../Core/BMCoreUI";
import { BMPointMake } from "../Core/BMPoint";
import { BMRectMake, BMRectMakeWithNodeFrame, BMRectMakeWithOrigin } from "../Core/BMRect";
import { BMAnimateWithBlock, BMAnimationApply, BMAnimationBeginWithDuration, BMAnimationContextAddCompletionHandler, BMAnimationContextGetCurrent, BMHook } from "../Core/BMAnimationContext";
import { BMSizeMake } from "../Core/BMSize";
import { _BMDragSessionDropActionMap, _BMDragSessionIconMap, BMDragSessionActionKind, BMDropSessionActionKind } from "./BMDragSessionActions";

// @type BMDragPreview

/**
 * The maximum rotation to apply to drag previews, in degrees.
 */
const _BMDragPreviewMaxRotation = 15;

/**
 * The distance between the acceptable and unacceptable items, in pixels.
 */
const _BMDragPreviewRejectDistance = 64;

/**
 * The amount by which to multiply the largest size to determine the distance between
 * acceptable and unacceptable items.
 */
const _BMDragPreviewRejectMultiplier = 1.2;

/**
 * The distance to the right edge of the viewport after which the indicator should move to the
 * left corner of the drag previews.
 */
const _BMDragIndicatorMaxEdgeDistance = 128;

/**
 * An object that represents a preview of a drag item and is displayed during a drag session.
 */
export function BMDragPreview() {} // <constructor>

BMDragPreview.prototype = {

    /**
     * The drag item represented by this drag preview.
     */
    _dragItem: undefined, // <BMDragItem>

    /**
     * Initializes this drag preview by creating a copy of the specified source node.
     * @param node <DOMNode>        The source node.
     * {
     *  @param forItem <BMDragItem> The drag item for which a preview is created.
     * }
     * @returns <BMDragPreview>     This drag preview.
     */
    initWithCopyOfSourceNode(node, {forItem}) {
        const previewNode = node.cloneNode(YES);
        const result = this.initWithPreviewNode(previewNode, {sourceNode: node, forItem});
        result._isCopyOfSourceNode = YES;
        return result;
    },

    /**
     * Designated initializer. Initializes this drag preview with the specified preview node
     * and optionally a source node.
     * @param node <DOMNode>                        The node representing the preview.
     * {
     *  @param forItem <BMDragItem>                 The drag item for which a preview is created.
     *  @param sourceNode <DOMNode, nullable>       If specified, the node that the drag item represents.
     * }
     * @returns <BMDragPreview>                     This drag preview.
     */
    initWithPreviewNode(node, {forItem, sourceNode}) {
        this._previewNode = node;
        this._sourceNode = sourceNode;
        this._dragItem = forItem;
        this._transform = {translateX: 0, translateY: 0};
        return this;
    },

    /**
     * The source node for which a preview is generated. This is used to run an appropriate animation
     * from the node corresponding to the drag item when the drag session starts or finishes.
     * 
     * If the source node is not provided, a generic animation will typically play instead for the preview node.
     */
    _sourceNode: undefined, // <DOMNode, nullable>

    /**
     * The node representing the preview. This node should not be modified while a drag
     * session is in progress.
     */
    _previewNode: undefined, // <DOMNode>

    get previewNode() {
        return this._previewNode;
    },

    /**
     * When set to `YES`, this indicates that the preview node is an exact copy of the source node
     * and a transition between the preview and source node is not required.
     */
    _isCopyOfSourceNode: NO, // <Boolean>

    /**
     * The current frame of the drag preview, before any transforms are applied.
     */
    _frame: BMRectMake(), // <BMRect>

    get frame() {
        return this._frame.copy();
    },

    /**
     * Updates this preview's position on screen.
     * @param position <BMPoint>        The new position, relative to the center of this preview's frame.
     */
    _setPosition(position) {
        if (this._animationSourceNode) {
            // If this is changed in the middle of the lift animation that plays from a non-copy source node,
            // the displacement must be applied to the source node as well
            const center = this._frame.center;
            const dX = position.x - center.x;
            const dY = position.y - center.y;

            this._animationSourceNode.style.left = this._animationSourceNode.offsetLeft + dX + 'px';
            this._animationSourceNode.style.top = this._animationSourceNode.offsetTop + dY + 'px';
        }

        this._frame.center = position;

        if (!this._animatingFrame) {
            this._applyFrame(this._frame);
        }

        if (this._transitionPreview) {
            this._transitionPreview._setPosition(position);
        }
    },

    /**
     * Applies the specified frame to the preview node.
     * @param frame <BMRect>        The frame to apply.
     */
    _applyFrame(frame) {
        Object.assign(this._previewNode.style, {
            left: `${frame.origin.x}px`,
            top: `${frame.origin.y}px`,
            width: `${frame.size.width}px`,
            height: `${frame.size.height}px`,
        });
    },

    /**
     * A dictionary containing transform property names as keys and their applied values, expressed
     * in pixels as the value. The contents of object should not be modified while the drag session
     * is in progress.
     */
    _transform: undefined, // <Dictionary<number>>

    get transform() {
        return this._transform;
    },

    /**
     * Applies the transform to the preview node.
     * @param transform <Dictionary<number>>        The transform dictionary. See {@link BMDragPreview.transform}.
     */
    _applyTransform() {
        // Add the appropriate units to the transform values
        const transform = {};
        for (const key in this._transform) {
            switch (key) {
                case 'translateX':
                case 'translateY':
                    transform[key] = (this._transform[key] ?? 0) + 'px';
                    break;
                case 'rotateZ':
                case 'rotate':
                    transform[key] = (this._transform[key] ?? 0) + 'deg';
                    break;
                default:
                    transform[key] = this._transform[key];
            }
        }

        BMHook(this._previewNode, transform);
    },

    /**
     * The total amount of displacement to apply for this preview when rejected.
     */
    _rejectionDistance: 0, // <Number>

    /**
     * Set to YES when this preview is displaced to indicate that it is rejected.
     */
    _rejected: NO, // <Boolean>

    /**
     * Updates the rejection distance to the specified number of pixels. If this preview is
     * currently rejected, its position will be animated to the new distance.
     * @param distance <Number>         The number of pixels to displace this preview by when rejected.
     */
    _setRejectionDistance(distance) {
        if (this._rejectionDistance == distance) {
            return;
        }

        this._rejectionDistance = distance;

        if (this._rejected) {
            // If this preview's item is reject, update the transform accordingly
            this._transform.translateX = distance;

            // Further, if this preview is attached, animate this change
            if (this._attached) {
                BMAnimateWithBlock(() => {
                    const context = BMAnimationContextGetCurrent();
                    const controller = context.controllerForObject(this, {node: this._previewNode});
                    controller.registerBuiltInPropertiesWithDictionary({
                        translateX: this._transform.translateX + 'px',
                    });

                    // If additionally this is playing a transition from another preview, update that preview as well
                    if (this._transitionPreview) {
                        const controller = context.controllerForObject(this._transitionPreview, {node: this._transitionPreview._previewNode});
                        this._transitionPreview._transform.translateX = this._transform.translateX;
                        controller.registerBuiltInPropertiesWithDictionary({
                            translateX: this._transform.translateX + 'px',
                        });
                    }
                }, {duration: 300, easing: 'easeInOutQuart'});
            }
        }
    },

    /**
     * Set to `YES` while this preview is playing the rejection animation.
     */
    _rejecting: NO, // <Boolean>

    /**
     * Updates the rejection state of this drag preview.
     * @param rejected <Boolean>        `YES` if this preview's item is rejected, `NO` otherwise.
     */
    _setRejected(rejected) {
        if (this._rejected == rejected) {
            return;
        }

        this._rejected = rejected;

        // Update the transform accordingly
        if (rejected) {
            this._transform.translateX = this._rejectionDistance;
        }
        else {
            this._transform.translateX = 0;
        }

        // Animate this change if attached
        if (this._attached) {
            this._rejecting = YES;
            BMAnimateWithBlock(() => {
                const controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this._previewNode});
                controller.registerBuiltInPropertiesWithDictionary({
                    translateX: this._transform.translateX + 'px',
                });
            }, {duration: 300, easing: 'easeInOutQuart'}).then(() => {
                this._rejecting = NO;
            });
        }
    },

    /**
     * Set to `YES` while this preview's frame is animating.
     */
    _animatingFrame: NO, // <Boolean>

    /**
     * Set to `YES` after the preview node has been measured.
     */
    _measured: NO, // <Boolean>

    /**
     * Measures the preview node and updates the frame to the measured size.
     */
    _measure() {
        const size = BMSizeMake(this._previewNode.offsetWidth, this._previewNode.offsetHeight);
        this._frame = BMRectMakeWithOrigin(this._frame.origin.copy(), {size});

        this._measured = YES;
    },

    /**
     * Attaches this drag session preview to the document and applies its frame and transform properties.
     * @param position <BMPoint, nullable>  If specified, the point at which the preview will be attached,
     *                                      relative to the viewport.
     * {
     *  @param before <DOMNode, nullable>   If specified, a node before which the preview node will be attached.
     * }
     * @return <Iterator<void>>             An iterator that must be iterated to sync DOM reads and writes
     *                                      when multiple previews are attached at the same time.
     */
    *_attachAtPosition(position, args) {
        this._attached = YES;

        // If a before node is specified and is the same as the preview node, don't take any further action
        if (args?.before == this._previewNode) {
            yield;
            return;
        }

        this._previewNode.classList.add('BMAnimationNode');

        // If the preview node was never measured, measure it now
        let attached = NO;
        if (!this._measured) {
            attached = YES;

            if (args?.before) {
                document.body.insertBefore(this._previewNode, args.before)
            }
            else {
                document.body.appendChild(this._previewNode);
            }
            this._measure();
        }

        yield;

        // If a position was specified, move the frame accordingly
        if (position) {
            this._frame.center = position;
        }

        this._applyTransform();
        this._applyFrame(this._frame);

        // If the preview node was not measured and attached previously, attach it now
        if (!attached) {
            if (args?.before) {
                document.body.insertBefore(this._previewNode, args.before)
            }
            else {
                document.body.appendChild(this._previewNode);
            }
        }
    },

    /**
     * Set to the source animation during the lift animation.
     */
    _animationSourceNode: undefined, // <DOMNode, nullable>

    /**
     * Plays the lift animation for this drag preview at the beginning of a drag session or when the associated
     * item is added to an in-progress drag session.
     * @return <Promise<void>>      A promise that resolves when the associated animation completes.
     */
    _performLift() {
        if (!this._sourceNode) {
            this._applyFrame(this._frame);

            BMHook(this._previewNode, this._transform);

            // Play a generic animation if the source node is not provided
            return BMAnimateWithBlock(() => {
                BMAnimationContextGetCurrent().controllerForObject(this, {node: this._previewNode}).registerBuiltInPropertiesWithDictionary({
                    scaleX: [this._transform.scaleX ?? 1, (this._transform.scaleX ?? 1) * 0.5],
                    scaleY: [this._transform.scaleY ?? 1, (this._transform.scaleY ?? 1) * 0.5],
                    opacity: [1, 0],
                });
            }, {duration: 300, easing: 'easeInOutQuad'});
        }
        else {
            if (this._isCopyOfSourceNode) {
                // If the preview is a direct copy of the source node, only animate from the position of the
                // source view, to the target frame
                const sourceFrame = BMRectMakeWithNodeFrame(this._sourceNode);

                this._applyFrame(sourceFrame);

                this._animatingFrame = YES;
                return BMAnimateWithBlock(() => {
                    const controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this._previewNode});
                    BMHook(this._previewNode, {rotateZ: '0deg'});
                    controller.registerBuiltInPropertiesWithDictionary({
                        scaleX: [this._transform.scaleX ?? 1, 1],
                        scaleY: [this._transform.scaleY ?? 1, 1],
                        rotateZ: `${this._transform.rotateZ ?? 0}deg`,
                    });

                    controller.registerCustomProperty('frame', {
                        withHandler: (fraction) => {
                            const newFrame = sourceFrame.interpolatedValueWithFraction(fraction, {toValue: this._frame});
                            this._applyFrame(newFrame);
                        },
                    });
                }, {duration: 300, easing: 'easeInOutQuad'}).then(() => {
                    this._animatingFrame = NO;
                });
            }
            else {
                // If the preview node is different from the source node, create a transition between the source
                // node and the preview node
                const sourceNodeCopy = this._sourceNode.cloneNode(YES);
                const sourceFrame = BMRectMakeWithNodeFrame(this._sourceNode);

                sourceNodeCopy.classList.add('BMAnimationNode');
                Object.assign(sourceNodeCopy.style, {
                    left: `${sourceFrame.origin.x}px`,
                    top: `${sourceFrame.origin.y}px`,
                    width: `${sourceFrame.size.width}px`,
                    height: `${sourceFrame.size.height}px`,
                });
                document.body.insertBefore(sourceNodeCopy, this._previewNode);

                this._animationSourceNode = sourceNodeCopy;

                const transformRect = this._frame.rectWithTransformToRect(sourceFrame);

                return BMAnimateWithBlock(() => {
                    const controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this._previewNode});
                    BMHook(this._previewNode, {
                        rotateZ: '0deg',
                        translateX: `${transformRect.origin.x}px`,
                        translateY: `${transformRect.origin.y}px`,
                    });

                    controller.registerBuiltInPropertiesWithDictionary({
                        scaleX: [this._transform.scaleX ?? 1, transformRect.size.width],
                        scaleY: [this._transform.scaleY ?? 1, transformRect.size.height],
                        translateX: '0px',
                        translateY: '0px',
                        rotateZ: `${this._transform.rotateZ ?? 0}deg`,
                        opacity: [1, 0],
                    });

                    const targetController = BMAnimationContextGetCurrent().controllerForObject(sourceNodeCopy, {node: sourceNodeCopy});
                    BMHook(sourceNodeCopy, {
                        translateX: '0px',
                        translateY: '0px',
                        rotateZ: '0deg',
                    });
                    targetController.registerBuiltInPropertiesWithDictionary({
                        scaleX: [1 / transformRect.size.width, 1],
                        scaleY: [1 / transformRect.size.height, 1],
                        translateX: `${-transformRect.origin.x}px`,
                        translateY: `${-transformRect.origin.y}px`,
                        rotateZ: `${this._transform.rotateZ ?? 0}deg`,
                        opacity: [0, 1],
                    });

                }, {duration: 300, easing: 'easeInOutQuad'}).then(() => {
                    sourceNodeCopy.remove();
                    this._animationSourceNode = sourceNodeCopy;
                });
            }
        }
    },

    /**
     * Set to `YES` if this preview's drop animation is handled by the drop delegate.
     */
    _dropHandled: NO, // <Boolean>

    /**
     * Plays the drop animation for this drag preview at the end of the drag session, if the current
     * drop target did not handle the drop animation on its own.
     * @return <Promise<void>>      A promise that resolves when the associated animation completes.
     */
    _performDrop() {
        if (!this._sourceNode) {
            // Play a generic animation if the source node is not provided
            return BMAnimateWithBlock(() => {
                BMAnimationContextGetCurrent().controllerForObject(this, {node: this._previewNode}).registerBuiltInPropertiesWithDictionary({
                    scaleX: [this._transform.scaleX ?? 1 * 0.5, (this._transform.scaleX ?? 1)],
                    scaleY: [this._transform.scaleY ?? 1 * 0.5, (this._transform.scaleY ?? 1)],
                    opacity: [0, 1],
                });
            }, {duration: 300, easing: 'easeInOutQuad'});
        }
        else {
            if (this._isCopyOfSourceNode) {
                // If the preview is a direct copy of the source node, only animate from the position of the
                // preview, to the source view
                const sourceFrame = BMRectMakeWithNodeFrame(this._sourceNode);

                return BMAnimateWithBlock(() => {
                    const controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this._previewNode});
                    BMHook(this._previewNode, {rotateZ: `${this._transform.rotateZ ?? 0}deg`});
                    controller.registerBuiltInPropertiesWithDictionary({
                        scaleX: [1, this._transform.scaleX ?? 1, 1],
                        scaleY: [1, this._transform.scaleY ?? 1, 1],
                        rotateZ: '0deg',
                    });

                    controller.registerCustomProperty('frame', {
                        withHandler: (fraction) => {
                            const newFrame = this._frame.interpolatedValueWithFraction(fraction, {toValue: sourceFrame});
                            this._applyFrame(newFrame);
                        },
                    });
                }, {duration: 300, easing: 'easeInOutQuad'});
            }
            else {
                // If the preview node is different from the source node, create a transition between the source
                // node and the preview node
                const sourceNodeCopy = this._sourceNode.cloneNode(YES);
                const sourceFrame = BMRectMakeWithNodeFrame(this._sourceNode);

                sourceNodeCopy.classList.add('BMAnimationNode');
                Object.assign(sourceNodeCopy.style, {
                    left: `${sourceFrame.origin.x}px`,
                    top: `${sourceFrame.origin.y}px`,
                    width: `${sourceFrame.size.width}px`,
                    height: `${sourceFrame.size.height}px`,
                });
                document.body.insertBefore(sourceNodeCopy, this._previewNode);

                const transformRect = this._frame.rectWithTransformToRect(sourceFrame);

                return BMAnimateWithBlock(() => {
                    const controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this._previewNode});
                    BMHook(this._previewNode, {
                        rotateZ: `${this._transform.rotateZ ?? 0}deg`,
                    });
                    controller.registerBuiltInPropertiesWithDictionary({
                        scaleX: [transformRect.size.width, this._transform.scaleX ?? 1],
                        scaleY: [transformRect.size.height, this._transform.scaleY ?? 1],
                        translateX: `${transformRect.origin.x}px`,
                        translateY: `${transformRect.origin.y}px`,
                        rotateZ: `0deg`,
                        opacity: [0, 1],
                    });

                    const targetController = BMAnimationContextGetCurrent().controllerForObject(sourceNodeCopy, {node: sourceNodeCopy});
                    BMHook(sourceNodeCopy, {
                        translateX: `${-transformRect.origin.x + (this._transform.translateX ?? 0)}px`,
                        translateY: `${-transformRect.origin.y + (this._transform.translateY ?? 0)}px`,
                        rotateZ: `${this._transform.rotateZ ?? 0}deg`,
                    });
                    targetController.registerBuiltInPropertiesWithDictionary({
                        scaleX: [1, 1 / transformRect.size.width],
                        scaleY: [1, 1 / transformRect.size.height],
                        translateX: '0px',
                        translateY: '0px',
                        rotateZ: '0deg',
                        opacity: [1, 0],
                    });

                }, {duration: 300, easing: 'easeInOutQuad'}).then(() => {
                    sourceNodeCopy.remove();
                });
            }
        }
    },

    /**
     * Plays the delete animation for this drag preview at the end of the drag session, if the drop
     * action was set to `.Delete`.
     * @return <Promise<void>>      A promise that resolves when the associated animation completes.
     */
    _performDelete() {
        // If an animation context isn't already started, start it now
        let hasAnimationContext = YES;
        if (!BMAnimationContextGetCurrent()) {
            hasAnimationContext = NO;
            BMAnimationBeginWithDuration(300, {easing: 'easeInQuart'});
        }

        BMAnimationContextGetCurrent().controllerForObject(this, {node: this._previewNode}).registerBuiltInPropertiesWithDictionary({
            scaleX: [this._transform.scaleX ?? 1 * 1.5, (this._transform.scaleX ?? 1)],
            scaleY: [this._transform.scaleY ?? 1 * 1.5, (this._transform.scaleY ?? 1)],
            opacity: [0, 1],
        });

        if (!hasAnimationContext) {
            return BMAnimationApply();
        }
        else {
            return new Promise(r => BMAnimationContextAddCompletionHandler(r));
        }
    },

    /**
     * If specified, the preview this preview is transitioning from, while the transition
     * is in progress. `undefined` in all other cases.
     */
    _transitionPreview: undefined, // <BMDragPreview>

    /**
     * A unique identifier for transitions, used to perform the appropriate cleanup at the end
     * of the transition only when needed.
     */
    _transitionUID: 0, // <Number>

    /**
     * Plays a transition animation from the specified drag preview to this drag preview, when the drag
     * session transitions to a new drop target. Detaches the specified drag preview from the document
     * if different from the current one.
     * @param preview <BMDragPreview>           The drag preview from which to play a transition.
     * {
     *  @param fromRejectionDistance <Number>   The reject distance prior to this transition taking place.
     * }
     * @return <Promise<void>>                  A promise that resolves when the associated animation completes.
     */
    _performTransitionFromDragPreview(preview, args) {
        // If the preview node is the same between the two views, don't take any further action
        if (this._previewNode == preview._previewNode) {
            preview._attached = NO;
            return Promise.resolve();
        }

        const transitionUID = this._transitionUID + 1;
        this._transitionUID = transitionUID;

        // If the target preview was already performing a transition, finish it immediately
        if (preview._transitionPreview) {
            preview._transitionPreview._detach();
            preview._transitionPreview = undefined;
        }

        const transformRect = this._frame.rectWithTransformToRect(preview._frame);

        this._transitionPreview = preview;

        return BMAnimateWithBlock(() => {
            const controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this._previewNode});
            const properties = {
                scaleX: [this._transform.scaleX ?? 1, transformRect.size.width * (preview._transform.scaleX ?? 1)],
                scaleY: [this._transform.scaleY ?? 1, transformRect.size.height * (preview._transform.scaleY ?? 1)],
                opacity: [1, 0],
            };

            // If the source controller is performing the rejecting animation, also play it for this preview
            if (preview._rejecting) {
                Object.assign(properties, {
                    translateX: this._transform.translateX ? [this._transform.translateX, 0] : [0, args.fromRejectionDistance],
                });
            }

            controller.registerBuiltInPropertiesWithDictionary(properties);

            const targetController = BMAnimationContextGetCurrent().controllerForObject(preview, {node: preview._previewNode});
            const targetProperties = {
                scaleX: [(1 / transformRect.size.width) * (this._transform.scaleX ?? 1), preview._transform.scaleX ?? 1],
                scaleY: [(1 / transformRect.size.height) * (this._transform.scaleY ?? 1), preview._transform.scaleY ?? 1],
                opacity: [0, 1],
            };
            targetController.registerBuiltInPropertiesWithDictionary(targetProperties);

        }, {duration: 300, easing: 'easeInOutQuart'}).then(() => {
            if (preview == this._transitionPreview && this._transitionUID == transitionUID) {
                preview._detach();
            }

            this._transitionPreview = undefined;
        });
    },

    /**
     * Controls whether this drag preview is detachable. Active drag previews are not detachable.
     */
    _detachable: YES, // <Boolean>

    /**
     * Detaches this drag preview from the document and resets its transform to the values of the `_transform` property.
     * The preview should be reattached to the document using {@link BMDragPreview._attach} before being reused.
     */
    _detach() {
        if (!this._detachable) {
            return;
        }

        this._attached = NO;
        this._previewNode.remove();
    },

}


/**
 * Creates and returns a drag preview initialized by creating a copy of the specified source node.
 * @param node <DOMNode>        The source node.
 * {
 *  @param forItem <BMDragItem> The drag item for which a preview is created.
 * }
 * @returns <BMDragPreview>     A drag preview.
 */
BMDragPreview.dragPreviewWithCopyOfSourceNode = function (node, args) {
    return new this().initWithCopyOfSourceNode(node, args);
};

/**
 * Creates and returns a drag preview initialized with the specified preview node and optionally a source node.
 * @param node <DOMNode>                        The node representing the preview.
 * {
 *  @param forItem <BMDragItem>                 The drag item for which a preview is created.
 *  @param sourceNode <DOMNode, nullable>       If specified, the node that the drag item represents.
 * }
 * @returns <BMDragPreview>                     A drag preview.
 */
BMDragPreview.dragPreviewWithPreviewNode = function (node, args) {
    return new this().initWithPreviewNode(node, args)
};

// @endtype

// @type BMDropPreview

/**
 * An object that represents a preview of a drag item at the end of a drop session that can be used
 * by the drop delegate to play an appropriate drop animation for the item. When using the drop preview
 * to customize the drop animation, it is the responsibility of the drop delegate object to detach
 * the drop preview at the end of the animation, unless using one of the built-in animations provided
 * by the drop preview.
 * 
 * Drop previews should not be created manually. Core UI will automatically create drop previews for
 * the appropriate items at the end of a drop session if there are items that have been accepted
 * by the drop target.
 */
export function BMDropPreview() {} // <constructor>

BMDropPreview.prototype = {

    /**
     * The original drag preview from which this drop preview was created.
     */
    _preview: undefined, // <BMDragPreview>

    /**
     * The drag item represented by this drop preview.
     */
    _item: undefined, // <BMDragItem>

    get item() {
        return this._item;
    },

    /**
     * Initializes this drop preview with the specified drag preview and drag item.
     * @param preview <BMDragPreview>       The original drag preview.
     * {
     *  @param forItem <BMDragItem>         The item represented by this preview.
     * }
     * @returns <BMDropPreview>             This drop preview.
     */
    _initWithDragPreview(preview, {forItem: item}) {
        this._preview = preview;
        this._item = item;

        return this;
    },

    /**
     * The HTML element representing this preview.
     */
    get previewNode() {
        return this._preview._previewNode;
    },

    /**
     * A rect that describes the current position and size of the preview node relative to the viewport.
     */
    get frame() {
        return this._preview._frame.copy();
    },

    /**
     * An object that describes the transform currently applied to the preview node. Its keys are transform
     * function names and its values are numbers representing the associated values. The units for the values are:
     *  - `deg` for rotation properties
     *  - `px` for translation properties
     *  - untyped for scale properties
     * 
     * The rotation transforms are always applied after all other transforms.
     */
    get transform() {
        return {...this._preview._transform};
    },

    /**
     * Plays a generic drop animation for this drop preview. This method must be invoked while an animation context is active.
     * When the animation finishes this drag preview is detached from the document.
     */
    performDrop() {
        BMAnimationContextGetCurrent().controllerForObject(this, {node: this.previewNode}).registerBuiltInPropertiesWithDictionary({
            scaleX: [this.transform.scaleX ?? 1 * 0.5, (this.transform.scaleX ?? 1)],
            scaleY: [this.transform.scaleY ?? 1 * 0.5, (this.transform.scaleY ?? 1)],
            opacity: [0, 1],
        });

        BMAnimationContextAddCompletionHandler(() => this.previewNode.remove());
    },

    /**
     * Plays a drop animation that visually transforms this drop preview into the specified node. This method must be invoked
     * while an animation context is active. When the animation finishes this drag preview is detached from the document.
     * @param node <DOMNode>        The node towards which to play the drop animation.
     */
    performDropToNode(node) {
        const nodeCopy = node.cloneNode(YES);
        const sourceFrame = BMRectMakeWithNodeFrame(node);

        nodeCopy.classList.add('BMAnimationNode');
        Object.assign(nodeCopy.style, {
            left: `${sourceFrame.origin.x}px`,
            top: `${sourceFrame.origin.y}px`,
            width: `${sourceFrame.size.width}px`,
            height: `${sourceFrame.size.height}px`,
        });
        document.body.insertBefore(nodeCopy, this.previewNode);

        const transformRect = this.frame.rectWithTransformToRect(sourceFrame);

        const controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this.previewNode});
        BMHook(this.previewNode, {
            rotateZ: `${this.transform.rotateZ ?? 0}deg`,
        });
        controller.registerBuiltInPropertiesWithDictionary({
            scaleX: [transformRect.size.width, this.transform.scaleX ?? 1],
            scaleY: [transformRect.size.height, this.transform.scaleY ?? 1],
            translateX: `${transformRect.origin.x}px`,
            translateY: `${transformRect.origin.y}px`,
            rotateZ: `0deg`,
            opacity: [0, 1],
        });

        const targetController = BMAnimationContextGetCurrent().controllerForObject(nodeCopy, {node: nodeCopy});
        BMHook(nodeCopy, {
            translateX: `${-transformRect.origin.x + (this.transform.translateX ?? 0)}px`,
            translateY: `${-transformRect.origin.y + (this.transform.translateY ?? 0)}px`,
            rotateZ: `${this.transform.rotateZ ?? 0}deg`,
            opacity: 0,
        });
        targetController.registerBuiltInPropertiesWithDictionary({
            scaleX: [1, 1 / transformRect.size.width],
            scaleY: [1, 1 / transformRect.size.height],
            translateX: '0px',
            translateY: '0px',
            rotateZ: '0deg',
            opacity: [1, 0],
        });

        BMAnimationContextAddCompletionHandler(() => {
            nodeCopy.remove();
            this.previewNode.remove();
        });
    },

};

// @endtype

// @type _BMDragIndicatorOrientation

/**
 * Constants describing the position of the drag indicator relative to the
 * top edge of the drag previews.
 */
export const _BMDragIndicatorOrientation = Object.freeze({ // <enum>

    /**
     * Indicates that the drag indicator should appear on the top left corner.
     */
    Left: 'Left', // <enum>

    /**
     * Indicates that the drag indicator should appear on the top right corner.
     */
    Right: 'Right', // <enum>

});

// @endtype

// @type _BMDragIndicator

/**
 * An object that manages the indicator that appears during a drag and drop gesture.
 */
export function _BMDragIndicator() {} // <constructor>

_BMDragIndicator.prototype = {

    /**
     * The number of items that are acceptable for the current drop target. This should be equal to
     * or lower than the total number of items in this drag session.
     */
    _acceptableItemCount: 0, // <Number>

    /**
     * The node containing the indicator.
     */
    _containerNode: undefined, // <DOMNode>

    /**
     * The node displaying the item count, drop outcome and message.
     */
    _indicatorNode: undefined, // <DOMNode>

    /**
     * The node displaying the icon associated with the current drop icon.
     */
    _iconNode: undefined, // <DOMNode>

    /**
     * The HTML element representing the message displayed to the user.
     */
    _messageNode: undefined, // <DOMNode>

    /**
     * The HTML element used to measure the message text.
     */
    _messageMeasurementNode: undefined, // <DOMNode>

    /**
     * The message text currently displayed on the drag indicator.
     */
    _message: undefined, // <String, nullable>

    /**
     * The message HTML markup currently displayed on the drag indicator.
     */
    _message: undefined, // <String, nullable>

    /**
     * The kind of action displayed on the indicator.
     */
    _dropActionKind: BMDragSessionActionKind.Ignore, // <BMDragSessionActionKind or BMDropSessionActionKind>

    /**
     * Initializes this drag indicator and attaches it to the document.
     * @return <_BMDragIndicator>           This drag indicator.
     */
    init() {
        const container = document.createElement('div');
        container.classList.add('BMDragSessionIndicatorContainer');
        container.inert = YES;

        this._containerNode = container;
        container.innerHTML = /*HTML*/ `
            <div class="BMDragSessionIndicator">
                <img class="BMDragSessionIndicatorIcon BMDragSessionIndicatorIconHidden" />
                <div class="BMDragSessionIndicatorItemCount"></div>
                <div class="BMDragSessionIndicatorMessage BMDragSessionIndicatorMessageHidden"></div>
            </div>
            <div class="BMDragSessionIndicatorMessage BMDragSessionIndicatorMessageMeasurement"></div>
        `;

        this._indicatorNode = container.querySelector('.BMDragSessionIndicator');
        this._iconNode = container.querySelector('.BMDragSessionIndicatorIcon');
        this._itemCountNode = container.querySelector('.BMDragSessionIndicatorItemCount');
        this._messageNode = this._indicatorNode.querySelector('.BMDragSessionIndicatorMessage');
        this._messageMeasurementNode = container.querySelector('.BMDragSessionIndicatorMessageMeasurement');

        document.body.appendChild(container);

        return this;
    },

    /**
     * Updates the contents of this drag indicator using the details of the specified
     * drag or drop action.
     * @param action <BMDragSessionAction or BMDropSessionAction>       The action.
     */
    setAction(action) {
        // Update the color and icon of the indicator
        this._setDropActionKind(action._action);

        // Update the message
        if (action._message) {
            this._setMessage(action._message);
        }
        else {
            this._setMessageHTML(action._messageHTML);
        }
    },

    /**
     * The offset between the drag pointer and the center of this drag indicator.
     */
    _offset: BMPointMake(), // <BMPoint>

    /**
     * The unique sequence identifier of the current offset animation.
     */
    _offsetAnimationID: 0, // <Number>

    /**
     * Updates the offset of the indicator from the pointer's position.
     * @param offset <BMPoint>              The new offset to use.
     * {
     *  @param animated <Boolean, nullable> Defaults to `NO`. When set to `YES` this change will be
     *                                      animated, otherwise it will be instant.
     * }
     */
    setOffset(offset, args) {
        offset = offset.copy();

        if (!args?.animated) {
            this._offset = offset;
            this.setPosition(this._position);
            return;
        }

        const animationID = this._offsetAnimationID + 1;
        this._offsetAnimationID = animationID;

        // Animate the offset change using a top/left displacement, then
        // reset to using transforms and clear out the displacement
        const distance = BMPointMake(offset.x - this._offset.x, offset.y - this._offset.y);

        BMAnimateWithBlock(() => {
            const controller = BMAnimationContextGetCurrent().controllerForObject(this._indicatorNode, {node: this._indicatorNode});
            controller.registerBuiltInPropertiesWithDictionary({
                left: distance.x + 'px',
                top: distance.y + 'px',
            });
        }, {duration: 300, easing: 'easeInOutQuart'}).then(() => {
            if (animationID == this._offsetAnimationID) {
                Object.assign(this._indicatorNode.style, {left: '0', top: '0'});
                this._offset = offset;
                this.setPosition(this._position);
            }
        });
    },

    /**
     * The current position of the drag session, relative to the viewport.
     */
    _position: BMPointMake(), // <BMPoint>

    /**
     * Updates the position of the drag gesture and all the drag previews.
     * @param position <BMPoint>        The new position.
     */
    setPosition(position) {
        this._position = position.copy();

        const indicatorPosition = this._position.copy();
        indicatorPosition.x += this._offset.x;
        indicatorPosition.y += this._offset.y;

        // The indicator is normally located in the center of the viewport, so an
        // appropriate displacement must be applied for it to appear at the correct
        // position on screen
        const displacement = BMPointMake(
            indicatorPosition.x - window.innerWidth / 2,
            indicatorPosition.y - window.innerHeight / 2,
        );

        BMHook(this._indicatorNode, {
            translateX: displacement.x + 'px',
            translateY: displacement.y + 'px',
        });
    },

    /**
     * Updates the drop action displayed on the drag indicator.
     * @param action <_BMDragDropSessionAction>     The new drop action to display.
     */
    _setDropActionKind(action) {
        if (action == this._dropActionKind) {
            return;
        }

        // Apply the appropriate class to the indicator element
        this._indicatorNode.classList.remove(_BMDragSessionDropActionMap[this._dropActionKind]);
        this._indicatorNode.classList.add(_BMDragSessionDropActionMap[action]);
        this._dropActionKind = action;

        // Set the appropriate icon on the indicator, hiding or showing it based on whether
        // an icon exists for the action kind
        const icon = _BMDragSessionIconMap[action];
        if (icon) {
            this._iconNode.src = icon;
            this._iconNode.style.width = '16px';
            this._iconNode.style.height = '16px';
            this._iconNode.classList.remove('BMDragSessionIndicatorIconHidden');
        }
        else {
            this._iconNode.classList.add('BMDragSessionIndicatorIconHidden');
            this._iconNode.style.width = '0';
            this._iconNode.style.height = '0';
        }
    },

    /**
     * Updates the item count displayed on the drag indicator.
     * @param count <Number>        The new item count to display.
     */
    setAcceptableItemCount(count) {
        if (count == this._acceptableItemCount) {
            return;
        }

        this._acceptableItemCount = count;
        this._itemCountNode.innerText = count.toFixed();
        this._itemCountNode.style.width = this._itemCountNode.scrollWidth;
    },
    
    /**
     * Updates the message currently displayed on the drag indicator.
     * @param message <String, nullable>    The message to display, or `undefined` to not show any message.
     */
    _setMessage(message) {
        if (message == this._message && !this._messageHTML) {
            return;
        }

        this._messageHTML = undefined;
        this._message = message;

        this._messageMeasurementNode.innerText = message ?? '';

        if (!message) {
            this._messageNode.classList.add('BMDragSessionIndicatorMessageHidden');
            this._messageNode.style.width = '0px';
        }
        else {
            this._messageNode.innerText = message ?? '';
            this._messageNode.classList.remove('BMDragSessionIndicatorMessageHidden');
            this._messageNode.style.width = this._messageMeasurementNode.scrollWidth + 'px';
        }
    },
    
    /**
     * Updates the message currently displayed on the drag indicator using the specified HTML text.
     * @param message <String, nullable>    The message HTML to display, or `undefined` to not show any message.
     */
    _setMessageHTML(message) {
        if (message == this._messageHTML && !this._message) {
            return;
        }

        this._message = undefined;
        this._messageHTML = this.messageHTML;
        this._messageMeasurementNode.innerHTML = message ?? '';

        if (!message) {
            this._messageNode.classList.add('BMDragSessionIndicatorMessageHidden');
            this._messageNode.style.width = '0px';
        }
        else {
            this._messageNode.innerHTML = message ?? '';
            this._messageNode.classList.remove('BMDragSessionIndicatorMessageHidden');
            this._messageNode.style.width = this._messageMeasurementNode.scrollWidth + 'px';
        }
    },

    /**
     * Plays the lift animation for this drag indicator.
     * @return <Promise<void>>          A promise that resolves when the animation completes.
     */
    performLift() {
        return BMAnimateWithBlock(() => {
            const controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this._indicatorNode});
            controller.registerBuiltInPropertiesWithDictionary({
                scaleX: [1, 0],
                scaleY: [1, 0],
                opacity: [1, 0],
            });
        }, {duration: 300, easing: 'easeInOutQuad'});
    },

    /**
     * Plays the drop animation for this drag indicator.
     * @return <Promise<void>>      A promise that resolves when the animation completes.
     */
    performDrop() {
        return BMAnimateWithBlock(() => {
            const controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this._indicatorNode});
            controller.registerBuiltInPropertiesWithDictionary({
                scaleX: [0, 1],
                scaleY: [0, 1],
                opacity: [0, 1],
            });
        }, {duration: 300, easing: 'easeInOutQuad'});
    },

    /**
     * Detaches this drag indicator from the document.
     * The drag indicator should not be reused after this method returns.
     */
    release() {
        this._containerNode.remove();
    }
};

// @endtype

// @type _BMDragPreviewSet

/**
 * An object that manages the appearance, position and animations of the preview elements
 * for items included in a drag session and the drag indicator.
 */
export function _BMDragPreviewSet() {} // <constructor>

_BMDragPreviewSet.prototype = {

    /**
     * The offset between the drag pointer and the center the from of the view from which the drag session
     * started, expressed in percentages relative to the view's frame.
     */
    _offsetPercent: BMPointMake(), // <BMPoint>

    /**
     * The offset between the drag pointer and the center of the frames of the preview elements.
     */
    _offset: BMPointMake(), // <BMPoint>

    /**
     * The current position of the drag session.
     */
    _position: BMPointMake(), // <BMPoint>

    /**
     * The indicator displaying information about the associated drag session.
     */
    _dragIndicator: undefined, // <_BMDragIndicator>

    /**
     * A mapping between drag items and their associated drag previews.
     */
    _dragPreviews: undefined, // <Map<BMDragItem, BMDragPreview>>

    /**
     * A mapping between drag items and the drag previews provided initially for each.
     */
    _baseDragPreviews: undefined, // <Map<BMDragItem, BMDragPreview>>

    /**
     * A set that controls which items appear as rejected.
     */
    _rejectedItems: undefined, // <Set<BMDragItem>>

    /**
     * The total displacement to apply to rejected previews.
     */
    _rejectionDistance: 0, // <Number>

    /**
     * Initializes this drag preview set with the specified item previews and offset position.
     * @param previews <[BMDragPreview]>            The previews for items in the drag session.
     * {
     *  @param pointerOffset <BMPoint>              The offset between the drag pointer and the
     *                                              center of the frames of the view from which the
     *                                              drag session started.
     * }
     * @return <_BMDragPreviewSet>                  This preview set.
     */
    initWithPreviews(previews, {pointerOffset}) {
        // Create the association between drag items and their previews
        this._dragPreviews = new Map();
        this._baseDragPreviews = new Map();
        this._rejectedItems = new Set();

        for (const preview of previews) {
            this._dragPreviews.set(preview._dragItem, preview);
            this._baseDragPreviews.set(preview._dragItem, preview);
        }

        this._offsetPercent = pointerOffset.copy();

        this._dragIndicator = new _BMDragIndicator().init();

        return this;
    },

    /**
     * An additional preview to display when all items are rejected.
     */
    _additionalPreview: undefined, // <BMDragPreview, nullable>

    /**
     * Displays the specified additional preview, or clears it.
     * @param preview <BMDragPreview, nullable>     The additional preview to display, or `undefined` to
     *                                              clear the additional preview.
     */
    setAdditionalPreview(preview) {
        if (preview == this._additionalPreview) {
            return;
        }

        if (this._additionalPreview) {
            // If a different additional preview was already being displayed, remove it
            const currentPreview = this._additionalPreview;
            const sourceNode = currentPreview._sourceNode;
            currentPreview._performDrop().then(() => currentPreview._detach());
            currentPreview._sourceNode = sourceNode;
        }

        this._additionalPreview = preview;

        if (preview) {
            // If a new additional preview should be displayed, attach and display it
            const previewPosition = this._position.copy();
            previewPosition.x += this._offset.x;
            previewPosition.y += this._offset.y;

            preview.transform.scaleX = 1;
            preview.transform.scaleY = 1;
            preview.transform.translateX = 0;
            preview.transform.translateY = 0;
            preview.transform.rotateZ = Math.random() * _BMDragPreviewMaxRotation * 2 - _BMDragPreviewMaxRotation;

            const iterator = preview._attachAtPosition(previewPosition, {before: this._dragPreviews.values().next().value._previewNode});
            iterator.next();
            iterator.next();


            const sourceNode = preview._sourceNode;
            preview._performLift();
            preview._sourceNode = sourceNode;
        }
    },

    /**
     * Updates the position of the drag gesture and all the drag previews.
     * @param position <BMPoint>        The new position.
     */
    setPosition(position) {
        this._position = position.copy();

        if (position.x + this._indicatorOffsetRight > window.innerWidth - _BMDragIndicatorMaxEdgeDistance) {
            this._setIndicatorOrientation(_BMDragIndicatorOrientation.Left);
        }
        else {
            this._setIndicatorOrientation(_BMDragIndicatorOrientation.Right);
        }

        const previewPosition = this._position.copy();
        previewPosition.x += this._offset.x;
        previewPosition.y += this._offset.y;

        for (const preview of this._dragPreviews.values()) {
            preview._setPosition(previewPosition);
        }

        this._additionalPreview?._setPosition(previewPosition);

        this._dragIndicator.setPosition(this._position);
    },

    /**
     * Causes the previews for the specified items to appear as rejected. All other items will
     * appear as acceptable even if they had been previously set as rejected using this method.
     * @param items <[BMDragItem], nullable>        The items that should appear as rejected,
     *                                              or `undefined` to clear the rejected items. 
     */
    setRejectedItems(items) {
        if (!items?.length && !this._rejectedItems.size) {
            return;
        }

        this._rejectedItems.clear();

        if (items) {
            for (const item of items) {
                this._rejectedItems.add(item);
            }
        }

        for (const [item, preview] of this._dragPreviews.entries()) {
            preview._setRejected(this._rejectedItems.has(item));
        }
    },

    /**
     * Attaches the drag previews and plays their lift animations.
     * @param position <BMPoint>        The position of the drag session.
     */
    beginLiftAtPosition(position) {
        const firstPreview = this._dragPreviews.entries().next().value?.[1];
        const measureIterator = firstPreview?._attachAtPosition(BMPointMake());
        let measureIteratorResult = measureIterator.next();
        while (!measureIteratorResult.done) {
            measureIteratorResult = measureIterator.next();
        }

        this._offset = BMPointMake(
            this._offsetPercent.x * (firstPreview?._frame.size.width ?? 0),
            this._offsetPercent.y * (firstPreview?._frame.size.height ?? 0),
        );

        firstPreview._detach();
        firstPreview._measured = NO;

        this._position = position.copy();
        const previewPosition = position.copy();
        previewPosition.x += this._offset.x;
        previewPosition.y += this._offset.y;

        // Attach and measure the previews
        let attachIterators = [];
        let previousPreview;
        for (const [item, preview] of this._dragPreviews.entries()) {

            // For each preview other than the first, apply a random rotation between 15 and -15 degrees
            if (previousPreview) {
                preview._transform.rotateZ = Math.random() * _BMDragPreviewMaxRotation * 2 - _BMDragPreviewMaxRotation;
            }

            const attachIterator = preview._attachAtPosition(previewPosition, {before: previousPreview?._previewNode});
            attachIterators.push(attachIterator);
            attachIterator.next();

            previousPreview = preview;
        }

        for (const iterator of attachIterators) {
            iterator.next();
        }

        this._updateRejectionDistance();
   
        // Run the lift animation
        for (const [item, preview] of this._dragPreviews.entries()) {
            preview._performLift();
        }

        // Determine the offset for the drag indicator and play its lift animation as well
        this._updateDragIndicatorOffsetAnimated(NO);
        this._dragIndicator.performLift();
    },

    /**
     * Updates or resets the previews for the specified items using a map.
     * @param previews <Map<BMDragItem, BMDragPreview | undefined>>    The drag previews to use, or `undefined` to reset it for each item.
     */
    updatePreviewsWithMap(previews) {
        let attachIterators = [];
        let previewTransitions = new Map();

        const rejectDistance = this._rejectionDistance;

        const previewPosition = this._position.copy();
        previewPosition.x += this._offset.x;
        previewPosition.y += this._offset.y;

        for (const [item, preview] of previews.entries()) {
            if (!preview) {
                // If a preview is not specified, reset to the default preview
                const defaultPreview = this._baseDragPreviews.get(item);
                const currentPreview = this._dragPreviews.get(item);

                // If the specified item does not have a drag preview, don't take any further action
                if (!defaultPreview) {
                    continue;
                }

                if (defaultPreview == currentPreview) {
                    // If the item is already using the default preview, don't take any further action
                    continue;
                }
                else {
                    defaultPreview._rejectionDistance = this._rejectionDistance;
                    defaultPreview._setRejected(this._rejectedItems.has(item));

                    defaultPreview._transform.rotateZ = currentPreview._transform.rotateZ;
                    defaultPreview._transform.translateX = currentPreview._transform.translateX;
                    
                    // Otherwise attach the default preview and transition to it
                    const attachIterator = defaultPreview._attachAtPosition(previewPosition, {before: currentPreview._previewNode});
                    attachIterator.next();
                    attachIterators.push(attachIterator);

                    previewTransitions.set(currentPreview, defaultPreview);
                    this._dragPreviews.set(item, defaultPreview);
                }
            }
            else {
                // If a preview is specified, attach it and transition to it
                const currentPreview = this._dragPreviews.get(item);

                if (!currentPreview) {
                    continue;
                }

                preview._transform.rotateZ = currentPreview._transform.rotateZ;
                preview._transform.translateX = currentPreview._transform.translateX;
                preview._rejectionDistance = this._rejectionDistance;
                preview._setRejected(this._rejectedItems.has(item));

                const attachIterator = preview._attachAtPosition(previewPosition, {before: currentPreview._previewNode});
                attachIterator.next();
                attachIterators.push(attachIterator);

                previewTransitions.set(currentPreview, preview);
                this._dragPreviews.set(item, preview);
            }
        }

        // Finish attaching the previews
        for (const iterator of attachIterators) {
            iterator.next();
        }

        // Update the rejection distance
        this._updateRejectionDistance();

        // Perform the transitions
        for (const [fromPreview, toPreview] of previewTransitions.entries()) {
            toPreview._detachable = NO;
            fromPreview._detachable = YES;
            toPreview._performTransitionFromDragPreview(fromPreview, {fromRejectionDistance: rejectDistance});
            fromPreview._setRejectionDistance(this._rejectionDistance);
        }

        // Update the indicator offset
        this._updateDragIndicatorOffsetAnimated(YES);
    },

    /**
     * Determines the rejection distance based on the size of all current previews.
     */
    _updateRejectionDistance() {
        const widths = Array.from(this._dragPreviews.values()).map(p => p._frame.size.width * (p._transform.scaleX ?? 1));
        const maxWidth = Math.max.apply(Math, widths);
        let distance = maxWidth * _BMDragPreviewRejectMultiplier + _BMDragPreviewRejectDistance;

        if (this._position.x > window.innerWidth / 2) {
            distance = -distance;
        }

        if (distance != this._rejectionDistance) {
            this._rejectionDistance = distance;

            for (const preview of this._dragPreviews.values()) {
                preview._setRejectionDistance(this._rejectionDistance);
            }
        }
    },

    /**
     * The orientation of the drag indicator relative to the top edge of the drag previews.
     */
    _indicatorOrientation: _BMDragIndicatorOrientation.Right,

    /**
     * Updates the orientation of the drag indicator. If the orientation changes as a result
     * of this method, the change will be animated.
     * @param orientation <_BMDragIndicatorOrientation>     The new orientation to use.
     */
    _setIndicatorOrientation(orientation) {
        if (orientation == this._indicatorOrientation) {
            return;
        }

        this._indicatorOrientation = orientation;
        this._updateDragIndicatorOffsetAnimated(YES);
    },

    /**
     * The offset the indicator would use if the orientation was set to `.Right`.
     */
    _indicatorOffsetRight: 0, // <Number>

    /**
     * Updates the drag indicator offset from the drag session's position based on the size
     * and scale of the first displayed item preview.
     * The offset for the indicator is set such that it will appear to the top left of
     * the first preview.
     * @param animated <Boolean, nullable>          Defaults to `YES`. Whether this change is animated.
     */
    _updateDragIndicatorOffsetAnimated(animated = YES) {
        const firstPreview = this._dragPreviews.values().next().value;
        const origin = firstPreview._frame.origin;
        const size = firstPreview._frame.size;
        const transform = firstPreview._transform;

        const position = this._position;

        this._indicatorOffsetRight = firstPreview._frame.right - ((size.width - (size.width * (transform.scaleX ?? 1)))) - position.x;

        // Place the indicator in the top-right or top-left corner of the preview depending on the orientation,
        // accounting for the scale transform that may be applied to it
        const indicatorOffset = BMPointMake(
            this._indicatorOrientation == _BMDragIndicatorOrientation.Right ?
                this._indicatorOffsetRight :
                origin.x + ((size.width - (size.width * (transform.scaleX ?? 1)))) - position.x,
            origin.y + (size.height - (size.height * (transform.scaleY ?? 1))) - position.y,
        );

        this._dragIndicator.setOffset(indicatorOffset, {animated});
    },

    /**
     * Plays the drop animation for the current drag previews, then detaches them.
     */
    performDrop() {

        if (this._dragIndicator._dropActionKind == BMDropSessionActionKind.Delete) {
            BMAnimationBeginWithDuration(300, {easing: 'easeInQuart', stride: 100 / this._dragPreviews.size});
        }

        for (const [item, preview] of this._dragPreviews.entries()) {
            preview._detachable = YES;

            if (this._dragIndicator._dropActionKind == BMDropSessionActionKind.Delete) {
                preview._performDelete().then(() => preview._previewNode.remove());
                continue;
            }

            // If the drop is handled by the delegate, don't play any animation
            if (preview._dropHandled) {
                continue;
            }

            // Always animate rejected items back to the original node if possible, or all
            // items for drop actions of type reject
            let sourceNode, isCopyOfSourceNode;
            let rejected = 
                preview._rejected ||
                this._dragIndicator._dropActionKind == BMDropSessionActionKind.Reject || 
                this._dragIndicator._dropActionKind == BMDropSessionActionKind.Ignore;

            if (rejected) {
                sourceNode = preview._sourceNode;
                isCopyOfSourceNode = preview._isCopyOfSourceNode;

                const basePreview = this._baseDragPreviews.get(item);
                preview._sourceNode = basePreview._sourceNode;

                if (preview != basePreview) {
                    preview._isCopyOfSourceNode = NO;
                }
            }
            preview._performDrop().then(() => preview._previewNode.remove());
            if (rejected) {
                preview._sourceNode = sourceNode;
                preview._isCopyOfSourceNode = isCopyOfSourceNode;
            }
        }

        if (this._dragIndicator._dropActionKind == BMDropSessionActionKind.Delete) {
            BMAnimationApply();
        }

        if (this._additionalPreview) {
            this._additionalPreview._performDrop().then(() => this._additionalPreview._previewNode.remove());
        }

        return this._dragIndicator.performDrop().then(() => this._dragIndicator.release());
    },

};

// @endtype
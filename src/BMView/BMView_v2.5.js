// @ts-check

import {YES, NO, BMCopyProperties, BMExtend, BMAddSmoothMousewheelInteractionToNode, BMUUIDMake, BMIsTouchDevice} from '../Core/BMCoreUI'
import {BMInsetMake} from '../Core/BMInset'
import {BMPointMake} from '../Core/BMPoint'
import {BMSizeMake} from '../Core/BMSize'
import {BMRectMake, BMRectMakeWithNodeFrame} from '../Core/BMRect'
import {BMAnimationContextGetCurrent, BMHook} from '../Core/BMAnimationContext'
import {BMLayoutSizeClass, BMLayoutOrientation} from './BMLayoutSizeClass'
import {BMViewport} from './BMViewport'
import {BMLayoutAttribute, BMLayoutConstraintRelation, BMLayoutConstraint, BMLayoutConstraintPriorityRequired, BMLayoutConstraintKind} from './BMLayoutConstraint_v2.5'
import * as kiwi from 'kiwi.js'
import { BMKeyboardShortcutModifier } from '../BMWindow/BMKeyboardShortcut'


// When set to YES, this will cause view to use transforms instead of left/right for positioning
const BM_VIEW_USE_TRANSFORM = NO;
// When set to YES, this will cause views to flash red when their intrinsic size is measured
const BM_VIEW_DEBUG_AUTOMATIC_INTRINSIC_SIZE = NO;
// When set to YES, this will cause messages to appear in the console whenever a layout queue is dequeued or a view hierarchy is enqueued
// The associated views will also flash yellow upon being enqueued and blue upon being dequeued
const BM_VIEW_DEBUG_LAYOUT_QUEUE = NO;

// @type BMViewConstraintAttribute

/**
 * A view constraint attribute represents an object that can be used to simplify the creation of layout constraints.
 * Each view has one property for each available layout attribute. The view constraint attribute has methods that can link
 * it to the attributes of other views, creating a constraint.
 * 
 * For example, a constraint is typically created by setting all of its attributes using the factory method `constraintWithView`:
 * ```js
let constraint = BMLayoutConstraint.constraintWithView(sourceView, {attribute: BMLayoutAttribute.Left, toView: targetView, secondAttribute: BMLayoutAttribute.Left, relatedBy: BMLayoutConstraintRelation.LessThanOrEquals, constant: 8, multiplier: 2});
```
 *
 * That syntax is quite verbose, so constraint attributes can be used to simplify it:
 * ```js
let constraint = sourceView.left.lessThanOrEqualTo(targetView.left, {times: 2, plus: 8});
```
 * 
 * Note that the second expression ends up calling the constraint factory method with the same parameters as in the first expression.
 * 
 * View constraint attributes cannot be instantiated manually; they are automatically created for each view during initialization.
 */
export function BMViewConstraintAttribute() {} // <constructor>

BMViewConstraintAttribute.prototype = {

    /**
     * The layout attribute that this constraint attribute represents.
     */
    _attribute: undefined, // <BMLayoutAttribute>

    /**
     * The view affected by this view constraint attribute.
     */
    _view: undefined, // <BMView>

    /**
     * Constructs and returns a layout constraint that links this view constraint attribute to constant value.
     * The constraint will be created with an equality sign.
     * @param constant <Number>                             The constraint's constant.
     * {
     *  @param priority <Number, nullable>                  Defaults to `BMLayoutConstraintPriorityRequired`. The constraint's priority.
     * }
     * @return <BMLayoutConstraint>                         A layout constraint.
     */
//  equalTo(constant, {priority}) {

    /**
     * Constructs and returns a layout constraint that links this view constraint attribute to the given attribute.
     * The constraint will be created with an equality sign.
     * @param attribute <BMViewConstraintAttribute>         The attribute to which this attribute should be linked.
     * {
     *  @param times <Number, nullable>                     Defaults to `1`. The constraint's multiplier.
     *  @param plus <Number, nullable>                      Defaults to `0`. The constraint's constant.
     *  @param priority <Number, nullable>                  Defaults to `BMLayoutConstraintPriorityRequired`. The constraint's priority.
     * }
     * @return <BMLayoutConstraint>                         A layout constraint.
     */
    equalTo(attribute, {times = 1, plus = 0, priority = BMLayoutConstraintPriorityRequired} = {}) {
        if (typeof attribute == 'number') {
            return BMLayoutConstraint.constraintWithView(this._view, {
                attribute: this._attribute, 
                relatedBy: BMLayoutConstraintRelation.Equals,
                constant: attribute,
                priority: priority
            });
        }
        return BMLayoutConstraint.constraintWithView(this._view, {
            attribute: this._attribute, 
            relatedBy: BMLayoutConstraintRelation.Equals,
            toView: attribute._view,
            secondAttribute: attribute._attribute,
            constant: plus,
            multiplier: times,
            priority: priority
        });
    },

    /**
     * Constructs and returns a layout constraint that links this view constraint attribute to constant value.
     * The constraint will be created with a less than or equals sign.
     * @param constant <Number>                             The constraint's constant.
     * {
     *  @param priority <Number, nullable>                  Defaults to `BMLayoutConstraintPriorityRequired`. The constraint's priority.
     * }
     * @return <BMLayoutConstraint>                         A layout constraint.
     */
//  lessThanOrEqualTo(constant, {priority}) {

    /**
     * Constructs and returns a layout constraint that links this view constraint attribute to the given attribute.
     * The constraint will be created with a less than or equals sign.
     * @param attribute <BMViewConstraintAttribute>         The attribute to which this attribute should be linked.
     * {
     *  @param times <Number, nullable>                     Defaults to `1`. The constraint's multiplier.
     *  @param plus <Number, nullable>                      Defaults to `0`. The constraint's constant.
     *  @param priority <Number, nullable>                  Defaults to `BMLayoutConstraintPriorityRequired`. The constraint's priority.
     * }
     * @return <BMLayoutConstraint>                         A layout constraint.
     */
    lessThanOrEqualTo(attribute, {times = 1, plus = 0, priority = BMLayoutConstraintPriorityRequired} = {}) {
        if (typeof attribute == 'number') {
            return BMLayoutConstraint.constraintWithView(this._view, {
                attribute: this._attribute, 
                relatedBy: BMLayoutConstraintRelation.LessThanOrEquals,
                constant: attribute,
                priority: priority
            });
        }
        return BMLayoutConstraint.constraintWithView(this._view, {
            attribute: this._attribute, 
            relatedBy: BMLayoutConstraintRelation.LessThanOrEquals,
            toView: attribute._view,
            secondAttribute: attribute._attribute,
            constant: plus,
            multiplier: times,
            priority: priority
        });
    },

    /**
     * Constructs and returns a layout constraint that links this view constraint attribute to constant value.
     * The constraint will be created with a greather than or equals sign.
     * @param constant <Number>                             The constraint's constant.
     * {
     *  @param priority <Number, nullable>                  Defaults to `BMLayoutConstraintPriorityRequired`. The constraint's priority.
     * }
     * @return <BMLayoutConstraint>                         A layout constraint.
     */
//  greaterThanOrEqualTo(constant, {priority}) {

    /**
     * Constructs and returns a layout constraint that links this view constraint attribute to the given attribute.
     * The constraint will be created with a greater than or equals sign.
     * @param attribute <BMViewConstraintAttribute>         The attribute to which this attribute should be linked.
     * {
     *  @param times <Number, nullable>                     Defaults to `1`. The constraint's multiplier.
     *  @param plus <Number, nullable>                      Defaults to `0`. The constraint's constant.
     *  @param priority <Number, nullable>                  Defaults to `BMLayoutConstraintPriorityRequired`. The constraint's priority.
     * }
     * @return <BMLayoutConstraint>                         A layout constraint.
     */
    greaterThanOrEqualTo(attribute, {times = 1, plus = 0, priority = BMLayoutConstraintPriorityRequired} = {}) {
        if (typeof attribute == 'number') {
            return BMLayoutConstraint.constraintWithView(this._view, {
                attribute: this._attribute, 
                relatedBy: BMLayoutConstraintRelation.GreaterThanOrEquals,
                constant: attribute,
                priority: priority
            });
        }
        return BMLayoutConstraint.constraintWithView(this._view, {
            attribute: this._attribute, 
            relatedBy: BMLayoutConstraintRelation.GreaterThanOrEquals,
            toView: attribute._view,
            secondAttribute: attribute._attribute,
            constant: plus,
            multiplier: times,
            priority: priority
        });
    }

}

// @endtype

// @type BMViewLayoutQueue

/**
 * A layout queue is an object used to coordinate layout passes across different view hierarchies to minimize DOM thrashing due to automatic
 * intrinsic size calculation. CoreUI, by default, creates a global layout queue that is shared by all new view instances.
 * 
 * Views that are bound to the same layout queue will run their scheduled layout passes in sync. As such, whenever a view's layout process
 * invalidates the DOM, it will wait for all other views in the same queue to reach the same point in the process before starting to read
 * the updated DOM.
 * 
 * To create a layout queue, use the static `layoutQueue()` factory method.
 */
export function BMViewLayoutQueue() {} // <constructor>

BMViewLayoutQueue.prototype = {
    /**
     * A set that contains views bound to this layout queue that have pending layout passes.
     */
    _views: undefined, // <Set<BMView>>

    /**
     * Adds a view to this queue.
     * @param view <BMView>         The view to add to the queue.
     */
    _enqueueView(view) {
        if (BM_VIEW_DEBUG_LAYOUT_QUEUE && this._views.has(view)) {
            console.error('[BMViewLayoutQueue] Enqueueing view ' + view.debuggingName + ' into queue ' + this._identifier + '.');
            let flash = document.createElement('div');
            flash.style.cssText = 'position: absolute; z-index: 999999999; top: 0px; left: 0px; width: 100%; height: 100%; background-color: yellow; pointer-events: none;';
            view.node.appendChild(flash);
            requestAnimationFrame(() => flash.remove());
        }
        this._views.add(view);
    },

    /**
     * Removes a view from this queue.
     * @param view <BMView>         The view to remove.
     */
    _removeView(view) {
        this._views.delete(view);
    },

    /**
     * Runs a synchronized layout pass on the views in this queue and drains the queue.
     */
    dequeue() {
        if (BM_VIEW_DEBUG_LAYOUT_QUEUE && this._views.size) {
            console.error('[BMViewLayoutQueue] Dequeueing queue ' + this._identifier + ' with ' + this._views.size + ' view hierarchies.');
            for (let view of this._views) {
                let flash = document.createElement('div');
                flash.style.cssText = 'position: absolute; z-index: 999999999; top: 0px; left: 0px; width: 100%; height: 100%; background-color: blue; pointer-events: none;';
                view.node.appendChild(flash);
                requestAnimationFrame(() => flash.remove());
            }
        }
        _BMViewDequeueLayoutQueue(this);
    }
}

/**
 * Constructs and returns a new layout queue.
 * @return <BMViewLayoutQueue>          The layout queue.
 */
BMViewLayoutQueue.layoutQueue = function () {
    let queue = new BMViewLayoutQueue();

    queue._views = new Set;
    queue._identifier = BMUUIDMake();

    return queue;
}

// @endtype

// @type BMViewColorScheme

/**
 * Constants that describe the color scheme that a view should use when drawing itself.
 */
export var BMViewColorScheme = Object.freeze({ // <enum>

	/**
	 * Indicates that the view's color scheme should be based on the system color scheme.
	 */
	Auto: 'auto', // <enum>

	/**
	 * Indicates that the view should always use a dark color scheme regardless of the system color scheme setting.
	 */
	Dark: 'dark', // <enum>

	/**
	 * Indicates that the view should always use a light color scheme regardless of the system color scheme setting.
	 */
	Light: 'light', // <enum>

});

// @endtype

// @type BMView

const BMViewDebug = NO;

// An array holding views that have pending layout passes so that they can be processed together in a single event,
// batching together the various DOM reads and writes that the views perform
const _BMViewLayoutQueue = BMViewLayoutQueue.layoutQueue();

// Invoked by CoreUI to dequeue and layout views which have pending layout passes
// @param queue <BMViewLayoutQueue, nullable>           Defaults to the global queue. The queue to dequeue.
const _BMViewDequeueLayoutQueue = function (layoutQueue) {
    // Create a separate layout queue which will process future layout passes, in case any view invalidates its layout
    // during the layout pass (e.g. through overriden methods invoked on subclasses), which would cause the process to desynchronize
    let queue;
    if (layoutQueue) {
        queue = [...layoutQueue._views];
        layoutQueue._views = new Set;
    }
    else {
        queue = [..._BMViewLayoutQueue._views];
        _BMViewLayoutQueue._views = new Set;
    }

    // Transform the queue from an array of views into an array of associated layout iterators
    queue = queue.map(view => view._layoutSubviewsGenerator());

    // Run the iterations together, one step at a time for each view
    let hasIterations = YES;
    while (hasIterations) {
        hasIterations = !queue.reduce((accumulator, iterator) => {
            return iterator.next().done && accumulator;
        }, YES);
    }
}

/**
 * A view is a wrapper around a DOM node enabling various CoreUI-related functionality.
 * Views typically do not duplicate existing DOM capabilities, but instead are used to
 * attach additional information and functionality to those nodes.
 * 
 * Views are usually not constructed using any constructor function. Instead, their lifecycle is managed by CoreUI.
 * You obtain views by invoking the static <code>viewForNode(_)</code> method on the <code>BMView</code> type.
 * 
 * To extend from BMView and create a view subtype, extend from the BMView prototype, then, when requesting views use
 * <code>BMView.viewForNode.call(MyCustomViewType, node)</code>. Note that if the node already had
 * a view associated with it, the method above will return the original view reference of whatever type
 * it was created with. Subclasses may also provide their own construction methods built atop of <code>viewForNode</code>.
 * For view subclasses that create and manage their own DOM content, it is sufficient to invoke <code>BMView</code>'s
 * designated initializer after construction.
 */
export function BMView() {} // <constructor>

(function () {
    // A private map maintaining the link between DOM nodes and their associated view objects.
    var _BMViewMap = new WeakMap; // <WeakMap<DOMNode, BMView>>

    // #region Factory methods

    /**
     * Returns the view object associated with the given DOM node.
     * @param node <DOMNode>            The DOM node for which to retrieve the view.
     * @return <BMView>                 A view.
     */
    BMView.viewForNode = function (node) {
        let view = _BMViewMap.get(node);

        if (!view) {
            view = Object.create(this.prototype);
            
            return view.initWithDOMNode(node);
        }

        return view;
    }

    /**
     * Constructs a div node and returns the view object associated with it.
     * The newly created node will not be attached to any parent - it must be manually
     * added to the document's node hierarchy in order to be used.
     * @return <BMView>             A view.
     */
    BMView.view = function () {
        const node = document.createElement('div');
        const view = Object.create(this.prototype).initWithDOMNode(node);
        //_BMViewMap.set(node, view);
        return view;
    }

    // #endregion

    // #region Layout variables

    // A set that contains the views that are root views.
    // These are the view that will handle updates to layout variables.
    const rootViews = new Set;

    /**
     * Used internally by CoreUI to mark a given view as a root view and allow it to be 
     * notified of updates to layout variables.
     * 
     * For the purposes of receiving layout variable updates, a view is considered to be a root view
     * if it has no superview and has at least one subview.
     * @param view <BMView>         The view to become a root view.
     */
    BMView._markAsRootView = function (view) {
        rootViews.add(view);
    }

    /**
     * Used internally by CoreUI to mark a given view that was previously considered
     * to be a root view as a non-root view. The view will no longer be notified of
     * updates to layout variables.
     * 
     * A view is considered to be a non-root view if it has a superview or if it contains no subviews.
     * @param view <BMView>         The view to become a root view.
     */
    BMView._markAsNonRootView = function (view) {
        rootViews.delete(view);
    }

    // An object containing the registered layout variables and their variations
    const layoutVariables = {};
    const layoutVariableVariations = {};

    Object.defineProperty(BMView, 'layoutVariables', {get() {
        const variables = {};
        return BMCopyProperties(variables, layoutVariables);
    }});

    /**
     * Included for compatibility with layout editors. This method does nothing.
     */
    BMView.prepareLayoutVariables = function () {

    }

    /**
     * This method returns `YES` to indicate that global layout variables are available for use and editing.
     * @return <Boolean>        `YES`.
     */
    BMView.canUseLayoutVariables = function () {
        return YES;
    }

    /**
     * Returns an array describing the variations of the given layout variable.
     * @param named <String>                    The name of the layout variable.
     * @return <[BMLayoutVariableVariation]>    An array of variations for the given layout variable.
     *                                          If no variations have been defined, the array will be empty.
     */
    BMView.variationsForLayoutVariableNamed = function (named) {
        const variations = [];
        let variation;

        for (let key in layoutVariableVariations) {
            if (named in layoutVariableVariations[key]) {
                variation = layoutVariableVariations[key][named];
                variations.push({name: named, sizeClass: layoutVariableVariations[key].sizeClass, value: variation});
            }
        }

        return variations;
    }

    /**
     * Registers a layout variable that can be used by layout constraints in this environment
     * as values for the constant property. CoreUI will resolve the actual numeric value of the constant
     * based on the size class variations introduced for that layout variable.
     * If a layout variable with the given name already exists, its default value will be replaced
     * by the given value.
     * @param named <String>            The name to use for this layout variable.
     * {
     *  @param withValue <Number>       The default value to use for this layout variable, when there are no
     *                                  active size classes variations.
     * }
     */
    BMView.registerLayoutVariableNamed = function (named, {withValue: value}) {
        layoutVariables[named] = value;

        // Notify the root views of this update
        for (const view of rootViews) {
            view._layoutVariablesDidUpdate();
        }
    }

    /**
     * Renames an existing layout variable. If another layout variable already has the new name
     * this method will raise an error.
     * 
     * Note that this will not update existing references to the layout variable. The variable being renamed
     * should not be referenced by any layout constraint otherwise this might cause the layout process 
     * to fail in subsequent layout passes if the references are not updated.
     * 
     * If a variable with the current name does not exist, this method does nothing.
     * @param named <String>        The layout variable's current name.
     * {
     *  @param toName <String>      The new name to use for the layout variable.
     * } 
     */
    BMView.renameLayoutVariableNamed = function (named, {toName: newName}) {
        if (named in layoutVariables) {
            if (newName in layoutVariables) {
                throw new Error('A layout variable with the given name already exists.');
            }

            // Update the variable
            layoutVariables[newName] = layoutVariables[named];
            delete layoutVariables[named];

            // And also all of its variations
            let variation;
            for (let key in layoutVariableVariations) {
                if (named in layoutVariableVariations[key]) {
                    layoutVariableVariations[key][newName] = layoutVariableVariations[key][named];
                    delete layoutVariableVariations[key][named];
                }
            }

            // Notify the root views of this update
            for (const view of rootViews) {
                view._layoutVariablesDidUpdate();
            }
        }
    }

    /**
     * Unregisters the given layout variable if it had been previously registered.
     * If a layout variable with the given name has not been previously registered, 
     * this method does nothing.
     * 
     * This layout variable should not be referenced by any constraints when unregistered,
     * otherwise this might cause the layout process to fail in subsequent layout passes.
     * @param named <String>            The name of the layout variable to remove.
     */
    BMView.unregisterLayoutVariableNamed = function (named) {
        delete layoutVariables[named];

        // Notify the root views of this update
        for (const view of rootViews) {
            view._layoutVariablesDidUpdate();
        }
    }

    /**
     * Sets a variation for the given layout variable when the given size class is active.
     * If a variation for the given layout variable already exists for the given size class,
     * its value is updated to the specified value.
     * @param value <Number>                        The value for the given layout variable when the given size class is active.
     * {
     *  @param named <String>                       The name of the layout variable.
     *  @param inSizeClass <BMLayoutSizeClass>      The size class for which this variation will be active.
     * }
     */
    BMView.setLayoutVariableValue = function (value, {named: name, inSizeClass: sizeClass}) {
        // Create the variations entry for the size class if it doesn't already exist
        layoutVariableVariations[sizeClass._hashString] = layoutVariableVariations[sizeClass._hashString] || {sizeClass: sizeClass};

        // Then register the variation
        layoutVariableVariations[sizeClass._hashString][name] = value;

        // Notify the root views of this update
        for (const view of rootViews) {
            view._layoutVariablesDidUpdate();
        }
    }

    /**
     * Removes a variation for the given layout variable for the given size class.
     * If such a variation doesn't exist, this method does nothing.
     * @param name <String>                         The name of the layout variable.
     * {
     *  @param inSizeClass <BMLayoutSizeClass>      The size class from which to remove this variation.
     * }
     */
    BMView.removeVariationForLayoutVariableNamed = function (name, {inSizeClass: sizeClass}) {
        if (layoutVariableVariations[sizeClass._hashString]) {
            delete layoutVariableVariations[sizeClass._hashString][name];

            // If there are no more variations for the given size class, remove the variation entirely
            if (Object.keys(layoutVariableVariations[sizeClass._hashString]).length == 1) {
                delete layoutVariableVariations[sizeClass._hashString];
            }

            // Notify the root views of this update
            for (const view of rootViews) {
                view._layoutVariablesDidUpdate();
            }
        }
    }

    /**
     * Removes all variations for the given layout variable for all given size class.
     * If no such  variations exist, this method does nothing.
     * @param name <String>                         The name of the layout variable.
     */
    BMView.removeVariationsForLayoutVariableNamed = function (name) {
        for (let sizeClass in layoutVariableVariations) {
            delete layoutVariableVariations[sizeClass][name];

            // If there are no more variations for the given size class, remove the variation entirely
            if (Object.keys(layoutVariableVariations[sizeClass]).length == 1) {
                delete layoutVariableVariations[sizeClass];
            }
        }

        // Notify the root views of this update
        for (const view of rootViews) {
            view._layoutVariablesDidUpdate();
        }
    }

    /**
     * Included for compatibility with layout editors. This method does nothing.
     */
    BMView.persistLayoutVariables = function () {

    }

    /**
     * Returns and caches an object that describes the current values of the registered layout variables for the given viewport.
     * @return <Dictionary<Number>>     The current layout variable values.
     */
    BMView.prototype._layoutVariableValuesForViewport = function (viewport) {
        let values = {};

        for (let key of Object.keys(layoutVariables)) {
            values[key] = layoutVariables[key];
        }
		
		// Check which variations should be active and in which order
		for (let key in layoutVariableVariations) {
			layoutVariableVariations[key]._matchPriority = viewport.matchPriorityForSizeClass(layoutVariableVariations[key].sizeClass);
		}

		Object.keys(layoutVariableVariations).map(key => layoutVariableVariations[key]).sort((a, b) => b._matchPriority - a._matchPriority).forEach(variation => {
			if (!variation._matchPriority) return;

            // Registered properties
            for (let key in layoutVariables) {
                if (key in variation) {
                    values[key] = variation[key];
                }
            }
        });
        
        this._layoutVariables = values;

        return values;
    }

    // #endregion

    // #region Keyboard shortcuts

    // A private map containing a mapping between DOM nodes and view stubs that are used for implementing
    // keyboard shortcuts
    const _NodeKeyboardShortcutsMap = new WeakMap; // <WeakMap<DOMNode, Object>

    // A class that is a subset of `BMView` and contains only the keyboard shortcuts related functionality.
    const _BMViewKeyboardShortcutsStub = function (node) {
        this.node = node;
        this._keyboardShortcuts = {};
    };

    _BMViewKeyboardShortcutsStub.prototype = {

        node: undefined, // <DOMNode>

        _keyboardShortcuts: undefined, // <Dictionary<string, [BMKeyboardShortcut]>>

        registerKeyboardShortcut(shortcut) {
            return BMView.prototype.registerKeyboardShortcut.apply(this, arguments);
        },
        
        unregisterKeyboardShortcut(shortcut) {
            return BMView.prototype.unregisterKeyboardShortcut.apply(this, arguments);
        },
        
        keyPressedWithEvent(event) {
            return BMView.prototype.keyPressedWithEvent.apply(this, arguments);
        },
        
        _keyboardShortcutsEnabled: NO,
        
        _enableKeyboardShortcuts() {
            return BMView.prototype._enableKeyboardShortcuts.apply(this, arguments);
        },
        
        _disableKeyboardShortcuts() {
            return BMView.prototype._disableKeyboardShortcuts.apply(this, arguments);
        },
    }

    /**
     * Registers a keyboard shortcut that can be activated when the given node has keyboard focus.
     * @param shortcut <BMKeyboardShortcut>     The shortcut to register.
     * {
     *  @param forNode <DOMNode>                The DOM node for which the shortcut should be registered.
     * }
     */
    BMView.registerKeyboardShortcut = function (shortcut, {forNode: node}) {
        let viewStub = _NodeKeyboardShortcutsMap.get(node);
        if (!viewStub) {
            viewStub = new _BMViewKeyboardShortcutsStub(node);
            _NodeKeyboardShortcutsMap.set(node, viewStub);
        }

        viewStub.registerKeyboardShortcut(shortcut);
    },

	/**
	 * Unregisters a keyboard shortcut. If this keyboard shortcut had not been previously registered, this method does nothing.
	 * @param shortcut <BMKeyboardShortcut>			The keyboard shortcut to unregister.
     * {
     *  @param forNode <DOMNode>                    The DOM node for which the shortcut should be unregistered.
     * }
	 */
    BMView.unregisterKeyboardShortcut = function (shortcut, {forNode: node}) {
        const viewStub = _NodeKeyboardShortcutsMap.get(node);

        if (viewStub) {
            viewStub.unregisterKeyboardShortcut(shortcut);
        }
    },


    // #endregion

    // #region Destructors

    /**
     * Used when releasing an entire view hierarchy.
     * Releases this view without affecting constraints or the DOM.
     * 
     * The final operations will be performed by the view that initiated this release
     * operation.
     */
    BMView.prototype._releaseRecursive = function () {
        if (this.__released) {
            // This needs to be handled because of the way Thingworx DOM nodes are removed and recreated in the composer
            return;
        }
        this.__released = YES;

        for (const view of this._subviews) {
            view._releaseRecursive();
        }
        _BMViewMap.delete(this._node);
        rootViews.delete(this);
    }

    /**
     * Invoked when this view is no longer needed.
     * Removes the view from its superview and removes all event listeners
     * created by this view but otherwise leaves its DOM node intact.
     * 
     * This view should not be reused after invoking this method. Instead, if needed,
     * a new view should be obtained for that node and used.
     */
    BMView.prototype.release = function () {
        if (this.__released) {
            // This needs to be handled because of the way Thingworx DOM nodes are removed and recreated in the composer
            return;
        }
        this.__released = YES;

        this.layoutQueue._removeView(this);

        for (const view of this._subviews.slice()) {
            view._releaseRecursive();
        }
        _BMViewMap.delete(this._node);
        if (this._superview) {
            this.removeFromSuperview();
        }

        rootViews.delete(this);
    }

    // #endregion

    // #region Initializer

    /**
     * Designated initializer, invoked immediately after any view is created.
     * Subclasses must invoke this base initializer at some point during their initialization.
     * @param node <DOMNode>            The DOM node that will be managed by this view.
     * @return <BMView>                 This view.
     */
    BMView.prototype.initWithDOMNode = function (node) {
        this._node = node;
        this._constraints = [];
        this._subviews = [];

        var currentView;
        if (currentView = _BMViewMap.get(node)) {
            if (currentView != this) {
                throw new Error('There is already a view associated with the given node.');
            }
        }
        else {
            _BMViewMap.set(node, this);
        }

        // As they are ultimately used to determine the view's frame,
        // left, width, top and height variables are the only ones actually used in
        // layout calculations
        // Right, Center and Bottom constraints are expressed through equalities
        // between these four attributes
        this._variables = {
            [BMLayoutAttribute.Left]: new kiwi.Variable(this.node.id + '.' + BMLayoutAttribute.Left),
            [BMLayoutAttribute.Width]: new kiwi.Variable(this.node.id + '.' + BMLayoutAttribute.Width),

            [BMLayoutAttribute.Top]: new kiwi.Variable(this.node.id + '.' + BMLayoutAttribute.Top),
            [BMLayoutAttribute.Height]: new kiwi.Variable(this.node.id + '.' + BMLayoutAttribute.Height)
        };

        // Create a view constraint attribute for each available layout attribute
        for (let key in BMLayoutAttribute) {
            let propertyName = key.substring(0, 1).toLowerCase() + key.substring(1, key.length);
            let attribute = Object.create(BMViewConstraintAttribute.prototype);

            attribute._view = this;
            attribute._attribute = BMLayoutAttribute[key];

            this[propertyName] = attribute;
        }

        // Initialize collections
        this._sizeClasses = new Set;
        this._variations = {};
        this._configuration = {opacity: this._opacity, isVisible: this._isVisible, contentInsets: this.__activeInsets};
        this._variableProperties = {};

		this._keyboardShortcuts = {};

        return this;
    }

    // #endregion

})();

BMView.prototype = BMExtend(BMView.prototype, {

    // #region Base Properties

    /**
     * The DOM node managed by this view.
     */
    _node: undefined, // <DOMNode>
    get node() {
        return this._node;
    },

    /**
     * The DOM node to which subviews will be added.
     * This should be a descendant of the node returned by the <code>node</code> property.
     * 
     * Subclasses which manage a bigger node hierarchy should override this getter
     * and return the appropriate node within their hierarchy to let CoreUI know
     * where to insert subviews.
     * 
     * The default implementation returns the same value as the <code>node</code> property.
     */
    get contentNode() { // <DOMNode>
        return this._node;
    },

    /**
     * An optional name used to identify this view when printing out debug messages.
     * This name is also used by the layout editor when displaying this view.
     */
    debuggingName: '', // <String, nullable>

	
	/**
	 * The attribute corresponding to a view's leading edge.
	 * This is the same as the left edge in a left-to-right layout and
	 * the same as the right edge in a right-to-left layout.
	 */
	leading: undefined, // <BMViewConstraintAttribute>
	
	
	/**
	 * The attribute corresponding to a view's trailing edge.
	 * This is the same as the right edge in a left-to-right layout and
	 * the same as the left edge in a right-to-left layout.
	 */
	trailing: undefined, // <BMViewConstraintAttribute>
	
	
	/**
	 * The attribute corresponding to a view's left edge.
	 */
	left: undefined, // <BMViewConstraintAttribute>
	
	
	/**
	 * The attribute corresponding to a view's right edge.
	 */
	right: undefined, // <BMViewConstraintAttribute>
	
	
	/**
	 * The attribute corresponding to a view's top edge.
	 */
	top: undefined, // <BMViewConstraintAttribute>
	
	
	/**
	 * The attribute corresponding to a view's bottom edge.
	 */
	bottom: undefined, // <BMViewConstraintAttribute>
	
	
	/**
	 * The attribute corresponding to a view's horizontal center.
	 */
	centerX: undefined, // <BMViewConstraintAttribute>
	
	
	/**
	 * The attribute corresponding to a view's vertical center.
	 */
	centerY: undefined, // <BMViewConstraintAttribute>
	
	
	/**
	 * The attribute corresponding to a view's width.
	 */
	width: undefined, // <BMViewConstraintAttribute>
	
	
	/**
	 * The attribute corresponding to a view's height.
	 */
	height: undefined, // <BMViewConstraintAttribute>

    /**
     * The layout editor currently editing this view's layout.
     */
    _layoutEditor: undefined, // <BMLayoutEditor, nullable>
    get layoutEditor() {
        return this._layoutEditor;
    },
    set layoutEditor(editor) {
        this._layoutEditor = editor;
    },

    /**
     * The layout queue on which this view processes its layout passes.
     */
    _layoutQueue: _BMViewLayoutQueue, // <BMViewLayoutQueue, nullResettable>
    get layoutQueue() {
        return this._layoutQueue;
    },
    set layoutQueue(queue) {
        const hasView = this._layoutQueue._views.has(this);
        this._layoutQueue._removeView(this);
        this._layoutQueue = queue || _BMViewLayoutQueue;

        if (hasView) {
            this._layoutQueue._enqueueView(this);
        }
    },

    // #endregion

    // #region Frame and Bounds

    /**
     * A promise that it is initialized upon this view starting a layout animation and resolved when
     * the animation is finished.
     */
    _layoutAnimator: undefined, // <Promise<Void>, nullable>

    /**
     * Animatable.
     * A rectangle describing this view's size and position relative to its superview.
     * If the view hierarchy that this view belongs to does not match the DOM node hierarchy, the coordinates
     * of this view's frame are not guaranteed to match its position within the document.
     * 
     * For views whose layout is managed by CoreUI, this will return the view's frame as it is obtained by
     * resolving the layout constraints. This value should not be set manually in those cases.
     * 
     * Setting this value will cause the node managed by this view to have its position set to absolute and
     * its size and position styles set to match the new frame's values.
     * 
     * After setting this property, the position and size of the node managed by this view will be managed 
     * by CoreUI and should not be modified by outside means (e.g. through CSS).
     */
    _frame: undefined, // <BMRect>
    get frame() {
        return this._frame || BMRectMakeWithNodeFrame(this._node);
    },

    set frame(frame) {

        // When the frame is assigned for the first time, make the node have an absolute positioning
        if (!this._frame) {
            this._node.style.position = 'absolute';
            this._node.style.contain = 'layout';
            this._node.style.right = 'auto';
            this._node.style.bottom = 'auto';
            this._node.style.left = '0px';
            this._node.style.top = '0px';
        }

        // If this new frame will cause the bounds to change, allow the view to react to the pending change
        let boundsWillChange = NO;
        let newBounds;
        if (!this._frame || !this._frame.size.isEqualToSize(frame.size)) {
            // Compute the new bounds
            newBounds = frame.copy();
            newBounds.origin = BMPointMake();

            this.boundsWillChangeToBounds(newBounds);
            boundsWillChange = YES;
        }

        if (this.isRootView) {
            if (!this._frame) {
                // Root view has static positioning and size regardless of the frame
                if (BM_VIEW_USE_TRANSFORM) {
                    BMHook(this._node, {translateX: '0px', translateY: '0px'});
                }
                else {
                    this._node.style.top = '0px';
                    this._node.style.left = '0px';
                }
                this._node.style.width = '100%';
                this._node.style.height = '100%';
            }
            else {
                // The width and height need to be re-set each time because they may be modified
                // by automatic intrinsic size calculations
                this._node.style.width = '100%';
                this._node.style.height = '100%';
            }
            this._frame = frame.copy();

            if (this._layoutEditor) {
                this._layoutEditor.viewDidLayoutSubviews(this);
            }
        }
        // Make this change animated if there is an animation currently running
        else if (BMAnimationContextGetCurrent()) {
            if (!this._frame) {
                this._frame = BMRectMakeWithNodeFrame(this.node);
            }

            // Assign back the coordinates of the previous frame
            if (BM_VIEW_USE_TRANSFORM) {
                BMHook(this._node, {translateX: this._frame.origin.x + 'px', translateY: this._frame.origin.y + 'px'});
            }
            else {
                BMHook(this._node, {left: this._frame.origin.x + 'px', top: this._frame.origin.y + 'px'});
            }
            this._node.style.width = this._frame.size.width + 'px';
            this._node.style.height = this._frame.size.height + 'px';

            let controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this._node});
            //controller.registerAnimatableProperty('_frame', {targetValue: frame.copy(), startingValue: this._frame.copy()});
            if (BM_VIEW_USE_TRANSFORM) {
                controller.registerBuiltInProperty('translateX', {withValue: frame.origin.x + 'px'});
                controller.registerBuiltInProperty('translateY', {withValue: frame.origin.y + 'px'});
            }
            else {
                controller.registerBuiltInProperty('left', {withValue: frame.origin.x + 'px'});
                controller.registerBuiltInProperty('top', {withValue: frame.origin.y + 'px'});
            }
            controller.registerBuiltInProperty('width', {withValue: frame.size.width + 'px'});
            controller.registerBuiltInProperty('height', {withValue: frame.size.height + 'px'});
            this._layoutAnimator = controller.promise;

            controller.promise.then(_ => {
                this._layoutAnimator = undefined;
                this.didSetFrame(frame);

                if (boundsWillChange) {
                    this.boundsDidChangeToBounds(newBounds);
                }
            });

            this._frame = frame.copy();
        }
        else {

            // Assign the frame's coordinates to the node's positioning styles
            this._frame = frame.copy();
            if (BM_VIEW_USE_TRANSFORM) {
                BMHook(this._node, {translateX: frame.origin.x + 'px', translateY: frame.origin.y + 'px'});
            }
            else {
                BMHook(this._node, {left: frame.origin.x + 'px', top: frame.origin.y + 'px'});
            }
            this._node.style.width = frame.size.width + 'px';
            this._node.style.height = frame.size.height + 'px';

            if (boundsWillChange) {
                this.boundsDidChangeToBounds(newBounds);
            }
        }

        this.didSetFrame(frame);

    },
    

    /**
     * Animatable.
     * A rectangle describing this view's size and position relative to its layout root view.
     * 
     * Setting this value will cause the node managed by this view to have its position set to absolute and
     * its size and position styles set to match the new frame's values. This will update the view's `frame` property
     * accordingly.
     * 
     * After setting this property, the position and size of the node managed by this view will be managed 
     * by CoreUI and should not be modified by outside means (e.g. through CSS).
     */
    get frameRelativeToRootView() { // <BMRect>
        let offsetPoint = BMPointMake();
        let superview = this.superview;
        while (superview) {
            // The root view is by default set to the origin point
            if (!superview.superview) break;

            offsetPoint.x += superview.frame.origin.x;
            offsetPoint.y += superview.frame.origin.y;
            superview = superview.superview;
        }

        let rootFrame = this.frame.copy();
        rootFrame.origin.x += offsetPoint.x;
        rootFrame.origin.y += offsetPoint.y;

        return rootFrame;
    },
    set frameRelativeToRootView(frame) {
        let offsetPoint = BMPointMake();
        let superview = this.superview;
        while (superview) {
            // The root view is by default set to the origin point
            if (!superview.superview) break;

            offsetPoint.x += superview.frame.origin.x;
            offsetPoint.y += superview.frame.origin.y;
            superview = superview.superview;
        }

        let localFrame = frame.copy();
        localFrame.origin.x -= offsetPoint.x;
        localFrame.origin.y -= offsetPoint.y;

        this.frame = localFrame;
    },

    /**
     * Invoked by CoreUI after a frame was assigned to this view.
     * 
     * Subclasses can override this method to perform any additional changes needed
     * for their content to fit the given frame.
     * 
     * The default implementation does nothing.
     * @param frame <BMRect>        The new frame.
     */
    didSetFrame(frame) {

    },

    /**
     * A rectangle describing this view's size and position relative to its frame.
     * 
     * The default value for this property is a rect with the origin set to (0, 0)
     * and the same size as this view's frame rectangle.
     * 
     * Modifying this rectangle will typically cause the view's frame to change accordingly.
     */
    get bounds() { // <BMRect>
        let bounds = this._frame.copy();
        bounds.origin = BMPointMake();

        return bounds;
    },
    set bounds(bounds) {
        let oldBounds = this.bounds;

        if (oldBounds.size.width != bounds.size.width || oldBounds.size.height != bounds.size.height) {
            let frame = this.frame.copy();
            frame.size = bounds.size.copy();

            this.frame = frame;
        }
    },

    /**
     * Invoked by CoreUI whenever this view's frame changes and its bounds are about to be updated as a result.
     * Subclasses can override this method to prepare for the new size.
     * The default implementation does nothing.
     * @param bounds <BMRect>           The new bounds.
     */
    boundsWillChangeToBounds(bounds) {

    },

    /**
     * Invoked by CoreUI whenever this view's frame has changed and its bounds have been updated as a result.
     * Subclasses can override this method to adjust their content to the new size.
     * The default implementation does nothing.
     * @param bounds <BMRect>           The new bounds.
     */
    boundsDidChangeToBounds(bounds) {

    },

    /**
     * Controls whether the layout managed by this view is in the left-to-right order.
     * The default implementation returns the global CoreUI left-to-right status.
     */
    LTRLayout: YES, // <Boolean>

    // #endregion

    // #region Size Class Configuration

	/**
	 * Returns a variations object that can be serialized.
	 */
	get _serializedVariations() {
		let variations = {};

		if (this._variations) {
			Object.keys(this._variations).forEach(key => {
				variations[key] = {};
				Object.keys(this._variations[key]).forEach(key2 => {
					if (key2 == 'sizeClass') return;
					variations[key][key2] = this._variations[key][key2];
				})
			});
		}

		return variations;
    },
    
    set _serializedVariations(variations) {
        if (variations) {
            this._variations = variations;

            for (let key in this._variations) {
                this._variations[key].sizeClass = BMLayoutSizeClass._layoutSizeClassForHashString(key);
            }
        }
    },

    /**
     * An array containing all of the properties supporting variations that have been registered for this view.
     */
    _variableProperties: undefined, // <Dictionary<AnyObject>>

    /**
     * An object containing the active configuration of this view for the currently active size classes.
     */
    _configuration: undefined, // <Object>

    /**
     * Registers a property that supports variation on this view. Upon invoking this method, this view
     * object will gain several methods and properties depending on the name of the property.
     * If the name of the property duplicates an existing property of this view, this operation will raise
     * an error.
     * 
     * For example, for a property named `color`, view will gain the following properties and methods:
     * * `color` represents the default value of the property, if no size class variation applies. The initial value of this property will be set to the current value of the property as it exists on the target object.
     * * `setColor(_, {forSizeClass})` can be used to register a variation of the property for the given size class.
     * * `removeColorVariationForSizeClass(_)` can be used to remove a variation of the property for the given size class.
     * * `hasColorVariationForSizeClass(_)` can be used to test whether the property has a variation for the given size class.
     * 
     * Whenever the value of the property changes because of a size class variation, view will update the value of the
     * property on the object specified as the target.
     * 
     * Note that variations for the property are retained if this property is unregistered. If the property is registered
     * again later, it will regain its previous variations.
     * @param name <String>             The name of the property to register.
     * {
     *  @param forTarget <AnyObject>    The target object upon which the updated value will be set.
     * }
     */
    registerVariablePropertyNamed(name, args) {
        if (this[name]) throw new Error('Unable to register the property ' + name + ' as a variable property. This property duplicates an existing property of this view.');

        // Compute the capitalized name of the property, which is used in the various methods
        let capitalizedName = name[0].toUpperCase() + name.substring(1);
        let target = args.forTarget;

        // Retain the name of this variable property
        this._variableProperties[name] = target;

        // Create the methods and properties as required
        this[name] = target[name];
        this[`set${capitalizedName}`] = (value, args) => this._setVariation(value, {forProperty: name, inSizeClass: args.forSizeClass});
        this[`remove${capitalizedName}VariationForSizeClass`] = (sizeClass) => this._removeVariationForProperty(name, {inSizeClass: sizeClass});
        this[`has${capitalizedName}VariationForSizeClass`] = (sizeClass) => this._hasVariationForProperty(name, {inSizeClass: sizeClass});

    },

    /**
     * Unregisters a previously registered variable property.
     * If a property with the given name had not been previously registered as variable,
     * this method does nothing.
     * @param name <String>             The name of the property to unregister.
     */
    unregisterVariablePropertyNamed(name) {
        if (this._variableProperties[name]) {
            delete this._variableProperties[name];
        }
    },

	/**
	 * Invoked by CoreUI when the active size classes change for the view hierarchy
	 * to which this view belongs. This causes the view to update its configuration
	 * to match the new size classes, based on its variations.
	 * @param sizeClasses <[BMLayoutSizeClass]> 	The active size classes.
	 */
    activeSizeClassesDidChange(sizeClasses) {
        this._updateConfiguration();
    },

	/**
	 * Invoked by CoreUI whenever size classes are invalidated or variations are introduced for this
	 * view to cause the configuration used by this view to be updated.
	 */
    _updateConfiguration() {
		let baseConfiguration = {opacity: this._opacity, isVisible: this._isVisible, contentInsets: this._contentInsets, CSSClass: this._CSSClass};
		let viewport = this.viewport;
		
		// Check which variations should be active and in which order
		for (let key in this._variations) {
			this._variations[key]._matchPriority = viewport.matchPriorityForSizeClass(this._variations[key].sizeClass);
		}

		Object.keys(this._variations).map(key => this._variations[key]).sort((a, b) => b._matchPriority - a._matchPriority).forEach(variation => {
			if (!variation._matchPriority) return;

            // Standard properties
			if ('opacity' in variation) baseConfiguration.opacity = variation.opacity;
            if ('isVisible' in variation) baseConfiguration.isVisible = variation.isVisible;
            if ('contentInsets' in variation) baseConfiguration.contentInsets = variation.contentInsets;
            if ('CSSClass' in variation) baseConfiguration.CSSClass = variation.CSSClass;

            // Registered properties
            for (let key in this._variableProperties) {
                if (key in variation) {
                    baseConfiguration[key] = variation[key];
                }
            }
		});

		// Update the configuration to the newly computed configuration
		let oldConfiguration = this._configuration || baseConfiguration;
		this._configuration = baseConfiguration;

		// Check how the configuration has changed and invalidate the layout accordingly
		if (oldConfiguration.opacity != baseConfiguration.opacity) {
			this._activeOpacity = baseConfiguration.opacity;
		}

		if (oldConfiguration.isVisible != baseConfiguration.isVisible) {
			this._activeVisibility = baseConfiguration.isVisible;
        }

		if (oldConfiguration.CSSClass != baseConfiguration.CSSClass) {
			this._activeCSSClass = baseConfiguration.CSSClass;
        }
        
        if (!oldConfiguration.contentInsets.isEqualToInset(baseConfiguration.contentInsets)) {
            this._activeInsets = baseConfiguration.contentInsets;
        }

    },

	/**
	 * Sets a generic variation for the given property in the given size class.
	 * @param variation <AnyObject>                 The value to use.
	 * {
     *  @param forProperty <String>                 The name of the property that supports this variation.
	 * 	@param inSizeClass <BMLayoutSizeClass>		The layout size class to which the variation should apply.
	 * }
	 */
	_setVariation(variation, args) {
		if (!this._variations[args.inSizeClass._hashString]) {
			this._variations[args.inSizeClass._hashString] =  {sizeClass: args.inSizeClass};
			this.rootView._invalidatedSizeClasses = YES;
		}

		this._variations[args.inSizeClass._hashString][args.forProperty] = variation;

		// Update the configuration if this change affects the current size class
		if (this.viewport.matchesSizeClass(args.inSizeClass)) {
			this._updateConfiguration();
		}
	},

	/**
	 * Removes a generic property variation for the given size class.
	 * If this view doesn't have a variation for the given property in this size class, this method does nothing.
     * @param property <String>                     The name of the property whose variation should be removed.
     * {
	 * 	@param inSizeClass <BMLayoutSizeClass>		The layout size class to which the variation should apply.
     * }
	 */
	_removeVariationForProperty(property, args) {
		if (this._variations[args.inSizeClass._hashString]) {
			// Delete the constant variation
			delete this._variations[args.inSizeClass._hashString][property];

			// Remove the variations object for this size class if there are no other variations left
			if (Object.keys(this._variations[args.inSizeClass._hashString]).length == 1) {
				delete this._variations[args.inSizeClass._hashString];
				this.rootView._invalidatedSizeClasses = YES;
			}

			// Update the configuration if this change affects the current size classes
			if (this.viewport.matchesSizeClass(args.inSizeClass)) {
				this._updateConfiguration();
			}
		}
	},

	/**
	 * Used to verify if this view has a variation for the given property in the given size class.
     * @param property <String>                     The name of the property whose variation should be checked.
     * {
	 * 	@param inSizeClass <BMLayoutSizeClass>		The layout size class to which the variation applies.
     * }
	 * @return <Boolean>							`YES` if this view has a variation for the property in the given size class, `NO` otherwise.
	 */
	_hasVariationForProperty(property, args) {
		if (this._variations[args.inSizeClass._hashString]) {
			return property in this._variations[args.inSizeClass._hashString];
		}
		return NO;
	},


    /**
     * Controls the edges between the content box and this view's bounds.
     * The value of this property is managed by CoreUI and matches the current configuration.
     */
    __activeInsets: BMInsetMake(),

    set _activeInsets(insets) {
        if (!insets) {
            this.__activeInsets = BMInsetMake();
        }
        else {
            this.__activeInsets = insets.copy();
        }

        insets = this.__activeInsets;
        /** @type {HTMLElement} */ const contentNode = this.contentNode;
        contentNode.style.paddingLeft = insets.left + 'px';
        contentNode.style.paddingTop = insets.top + 'px';
        contentNode.style.paddingRight = insets.right + 'px';
        contentNode.style.paddingBottom = insets.bottom + 'px';

        // Modifying the padding will change the node's content size
        if (this.supportsIntrinsicSize) this.invalidateIntrinsicSize();
    },

    /**
     * Controls the edges between the content box and this view's bounds.
     */
    _contentInsets: BMInsetMake(), // <BMInset>

    get contentInsets() {
        return this._contentInsets.copy();
    },

    set contentInsets(insets) {
        if (!insets) {
            this._contentInsets = BMInsetMake();
        }
        else {
            this._contentInsets = insets.copy();
        }
        
        this._updateConfiguration();
    },

	/**
	 * Sets this view's `contentInsets` value for the given size class.
	 * @param contentInsets <BMInset>				`YES` if the view should be visible, `NO` otherwise.
	 * {
	 * 	@param forSizeClass <BMLayoutSizeClass>		The layout size class to which the opacity should apply.
	 * }
	 */
    setContentInsets(contentInsets, args) {
        return this._setVariation(contentInsets || BMInsetMake(), {forProperty: 'contentInsets', inSizeClass: args.forSizeClass});
    },

	/**
	 * Removes this views's `contentInsets` variation for the given size class.
	 * If this view doesn't have an `contentInsets` variation for this size class, this method does nothing.
	 * @param sizeClass <BMLayoutSizeClass>			The layout size class.
	 */
    removeContentInsetsVariationForSizeClass(sizeClass) {
        return this._removeVariationForProperty('contentInsets', {inSizeClass: sizeClass});
    },

	/**
	 * Used to verify if this view has an `contentInsets` variation for the given size class.
	 * @param sizeClass <BMLayoutSizeClass>			The size class.
	 * @return <Boolean>							`YES` if this constraint has an `contentInsets` variation for the size class, `NO` otherwise.
	 */
	hasContentInsetsVariationForSizeClass(sizeClass) {
		return this._hasVariationForProperty('contentInsets', {inSizeClass: sizeClass});
    },
    
    /**
     * Additional CSS classes to apply to this view's node. The classes specified in this property will be added
     * in addition to any other classes this view's node already defines.
     * The value of this property is managed by CoreUI and matches the current configuration.
     */
    __activeCSSClass: '', // <string>
    set _activeCSSClass(CSSClass) {
        CSSClass = CSSClass || '';

        const currentClasses = this.__activeCSSClass.split(' ');
        const newClasses = CSSClass.split(' ');

        // Find the old classes that were removed and remove them
        for (const CSSClass of currentClasses) {
            // Skip empty class names (e.g. double spaces)
            if (!CSSClass) continue;
            if (!newClasses.includes(CSSClass)) {
                this.node.classList.remove(CSSClass);
            }
        }

        // Add the new classes
        for (const CSSClass of newClasses) {
            if (!CSSClass) continue;
            if (!currentClasses.includes(CSSClass)) {
                this.node.classList.add(CSSClass);
            }
        }

        this.__activeCSSClass = CSSClass;

        // Changing the class may lead to changes that invalidate the node's intrinsic size
        if (this.supportsIntrinsicSize) this.invalidateIntrinsicSize();
    },

    /**
     * Additional CSS classes to apply to this view's node. The classes specified in this property will be added
     * in addition to any other classes this view's node already has.
     */
    _CSSClass: '', // <String>

    get CSSClass() {
        return this._CSSClass;
    },
    set CSSClass(CSSClass) {
        this._CSSClass = CSSClass;
        this._updateConfiguration();
    },

	/**
	 * Sets this view's `CSSClass` value for the given size class.
	 * @param CSSClass <String>						The CSS class.
	 * {
	 * 	@param forSizeClass <BMLayoutSizeClass>		The layout size class to which the CSS class should apply.
	 * }
	 */
    setCSSClass(CSSClass, args) {
        return this._setVariation(CSSClass, {forProperty: 'CSSClass', inSizeClass: args.forSizeClass});
    },

	/**
	 * Removes this views's `CSSClass` variation for the given size class.
	 * If this view doesn't have an `CSSClass` variation for this size class, this method does nothing.
	 * @param sizeClass <BMLayoutSizeClass>			The layout size class.
	 */
    removeCSSClassVariationForSizeClass(sizeClass) {
        return this._removeVariationForProperty('CSSClass', {inSizeClass: sizeClass});
    },

	/**
	 * Used to verify if this view has an `CSSClass` variation for the given size class.
	 * @param sizeClass <BMLayoutSizeClass>			The size class.
	 * @return <Boolean>							`YES` if this constraint has a `CSSClass` variation for the size class, `NO` otherwise.
	 */
	hasCSSClassVariationForSizeClass(sizeClass) {
		return this._hasVariationForProperty('CSSClass', {inSizeClass: sizeClass});
	},



    /**
     * Animatable.
     * Controls the opacity of this view's node, regardless of configuration.
     * The value of this property is managed by CoreUI and always matches the currently active configuration.
     */
    __activeOpacity: 1, // <Number>
    set _activeOpacity(opacity) {
        if (BMAnimationContextGetCurrent()) {
            let controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this._node});
            controller.registerBuiltInProperty('opacity', {withValue: this._opacity});
        }
        else {
            this.__activeOpacity = opacity;
            this.node.style.opacity = opacity;
        }
    },

    /**
     * Returns the current opacity used by this view.
     */
    get currentOpacity() { // <Number>
        return this.__activeOpacity;
    },

    /**
     * Animatable.
     * Controls the opacity of this view's node.
     */
    _opacity: 1, // <Number>

    get opacity() {
        return this._opacity;
    },
    set opacity(opacity) {
        this._opacity = opacity;
        this._updateConfiguration();
    },

	/**
	 * Sets this view's `opacity` value for the given size class.
	 * @param opacity <Number>						The opacity.
	 * {
	 * 	@param forSizeClass <BMLayoutSizeClass>		The layout size class to which the opacity should apply.
	 * }
	 */
    setOpacity(opacity, args) {
        return this._setVariation(opacity, {forProperty: 'opacity', inSizeClass: args.forSizeClass});
    },

	/**
	 * Removes this views's `opacity` variation for the given size class.
	 * If this view doesn't have an `opacity` variation for this size class, this method does nothing.
	 * @param sizeClass <BMLayoutSizeClass>			The layout size class.
	 */
    removeOpacityVariationForSizeClass(sizeClass) {
        return this._removeVariationForProperty('opacity', {inSizeClass: sizeClass});
    },

	/**
	 * Used to verify if this view has an `opacity` variation for the given size class.
	 * @param sizeClass <BMLayoutSizeClass>			The size class.
	 * @return <Boolean>							`YES` if this constraint has an `opacity` variation for the size class, `NO` otherwise.
	 */
	hasOpacityVariationForSizeClass(sizeClass) {
		return this._hasVariationForProperty('opacity', {inSizeClass: sizeClass});
	},

    /**
     * Controls the visibility of this view's node, regardless of configuration.
     * The value of this property is managed by CoreUI and always matches the currently active configuration.
     */
    __activeVisibility: YES, // <Boolean>

    set _activeVisibility(visibility) {
        if (visibility != this.__activeVisibility) {
            const isVisible = this.isCurrentlyVisible;

            this.__activeVisibility = visibility;
            if (visibility) {
                if (this.rootView._layoutEditor) {
                    this.node.classList.remove('BMLayoutEditorInvisibleView');
                }
                else {
                    this.node.style.display = 'block';
                }

                if (!isVisible) {
                    this.viewDidBecomeVisible();
                }
            }
            else {
                if (this.rootView._layoutEditor) {
                    this.node.classList.add('BMLayoutEditorInvisibleView');
                }
                else {
                    this.node.style.display = 'none';
                }

                if (!isVisible) {
                    this.viewDidBecomeInvisible();
                }
            }

            // Propagate the visibility status down to the subviews
            for (const subview of this._subviews) {
                subview._parentVisible = visibility;
            }

            // Changing visibility invalidates the node's intrinsic size
            this.invalidateIntrinsicSize();
        }
    },

    get _activeVisibility() {
        return this.__activeVisibility;
    },

    /**
     * Set to `NO` when any ancestor of this view is hidden.
     */
    __parentVisible: YES, // <Boolean>

    get _parentVisible() {
        return this.__parentVisible;
    },

    set _parentVisible(visible) {
        const isVisible = visible && this.__activeVisibility;
        const isCurrentlyVisible = this.isCurrentlyVisible;

        // If the visibility status changes, propagate it down to the subviews
        if (isVisible != this.__parentVisible) {
            for (const subview of this._subviews) {
                subview._parentVisible = visible;
            }
        }

        this.__parentVisible = isVisible;

        if (this.isCurrentlyVisible != isCurrentlyVisible) {
            if (this.isCurrentlyVisible) {
                this.viewDidBecomeVisible();
            }
            else {
                this.viewDidBecomeInvisible();
            }
        }
    },
    
    /**
     * Returns `YES` if this view is visible in the current configuration, `NO` otherwise.
     * This will also return `NO` if any ancestors are hidden.
     */
    get isCurrentlyVisible() { // <Boolean>
        return this.__activeVisibility && this.__parentVisible;
    },

    /**
     * @protected
     * Invoked when this view becomes visible. Subclasses overriding this method should
     * invoke the superclass method at some point in their implementation.
     */
    viewDidBecomeVisible() {
        // If this view supports an intrinsic size, invalidate it upon becoming visible
        if (this.supportsIntrinsicSize) {
            this.invalidateIntrinsicSize();
        }
    },

    /**
     * @protected
     * Invoked when this view becomes invisible. Subclasses overriding this method should
     * invoke the superclass method at some point in their implementation.
     */
    viewDidBecomeInvisible() {

    },

    /**
     * Controls the visibility of this view. Invisible views still participate in layout operations as usual,
     * but views that support automatic intrinsic size may report an intrinsic size of `[0, 0]` while they are invisible.
     * 
     * Additionally, views that are not visible cannot be interacted with.
     */
    _isVisible: YES, // <Boolean>

    get isVisible() {
        return this._isVisible;
    },
    set isVisible(isVisible) {
        this._isVisible = isVisible
        this._updateConfiguration();
    },

	/**
	 * Sets this view's `isVisible` value for the given size class.
	 * @param isVisible <Boolean>					`YES` if the view should be visible, `NO` otherwise.
	 * {
	 * 	@param forSizeClass <BMLayoutSizeClass>		The layout size class to which the opacity should apply.
	 * }
	 */
    setIsVisible(isVisible, args) {
        return this._setVariation(isVisible, {forProperty: 'isVisible', inSizeClass: args.forSizeClass});
    },

	/**
	 * Removes this views's `isVisible` variation for the given size class.
	 * If this view doesn't have an `isVisible` variation for this size class, this method does nothing.
	 * @param sizeClass <BMLayoutSizeClass>			The layout size class.
	 */
    removeIsVisibleVariationForSizeClass(sizeClass) {
        return this._removeVariationForProperty('isVisible', {inSizeClass: sizeClass});
    },

	/**
	 * Used to verify if this view has an `isVisible` variation for the given size class.
	 * @param sizeClass <BMLayoutSizeClass>			The size class.
	 * @return <Boolean>							`YES` if this constraint has an `isVisible` variation for the size class, `NO` otherwise.
	 */
	hasIsVisibleVariationForSizeClass(sizeClass) {
		return this._hasVariationForProperty('isVisible', {inSizeClass: sizeClass});
    },
    
    // #endregion

    // #region Color Scheme

    /**
     * The color scheme that this view should use.
     */
    _colorScheme: BMViewColorScheme.Auto, // <BMViewColorScheme>

    get colorScheme() {
        return this._colorScheme;
    },

    set colorScheme(scheme) {
        const oldColorScheme = this._colorScheme;
        this._colorScheme = scheme;

        this.colorSchemeDidChange(oldColorScheme);
    },

    /**
     * @protected
     * Invoked by CoreUI whenever the color scheme that the view should use changes.
     * 
     * Subclasses may use this method to perform any changes needed to support the requested color scheme.
     * Subclasses that override this method must invoke the superclass method at some point in their implementation.
     * 
     * @param scheme <BMViewColorScheme>        The previous color scheme.
     */
    colorSchemeDidChange(scheme) {

    },

    // #endregion

    // #region Intrinsic Size

    /**
     * Used by CoreUI to determine if this view's intrinsic size should match the intrinsic size reported by its node element.
     * When this getter returns <code>YES</code>, CoreUI will measure the view's node to determine its intrinsic size.
     * Subclasses that can make use of automatic intrinsic size do not need to override the getter for <code>intrinsicSize</code>
     * to support intrinsic sizes.
     * 
     * Subclasses that do not support intrinsic sizes or need to perform their own calculations to supply an intrinsic size
     * should override this getter and return <code>NO</code>.
     * 
     * The default implementation returns <code>NO</code>.
     */
    _supportsAutomaticIntrinsicSize: NO, // <Boolean>
    get supportsAutomaticIntrinsicSize() {
        return this._supportsAutomaticIntrinsicSize;
    },
    set supportsAutomaticIntrinsicSize(supports) {
        this._supportsAutomaticIntrinsicSize = supports;
    },

    /**
     * Used by CoreUI to determine if this view can provide an intrinsic size.
     * 
     * Subclasses that explicitly support or do not support intrinsic sizes should override this value and
     * return the appropriate. This is used by CoreUI to determine whether the constraints affecting this view
     * can fully define its layout attributes.
     * 
     * The default implementation returns the same value as <code>supportsAutomaticIntrinsicSize</code>.
     */
    get supportsIntrinsicSize() { // <Boolean>
        return this.supportsAutomaticIntrinsicSize;
    },

    /**
     * Will be set to a number that represents the width that will be assigned to this view
     * after the current layout pass.
     * Outside of a layout pass or before this view has been assigned a width, this property
     * will be set to <code>undefined</code>. Subclasses that override <code>intrinsicSize</code> should
     * check the value of this property when computing their intrinsic size and adjust it appropriately
     * if this value is not <code>undefined</code>.
     */
    _requiredWidth: undefined, // <Number>
    get requiredWidth() {
        return this._requiredWidth;
    },

    /**
     * Set to `YES` when views invalidate their intrinsic size and the layout engine must
     * measure it again.
     */
    _needsIntrinsicSizeMeasurement: YES, // <Boolean>

    /**
     * Returns `YES` if this view or any of its descendants have had their intrinsic size invalidated.
     */
    get needsIntrinsicSizeMeasurement() { // <Boolean>
        if (this._needsIntrinsicSizeMeasurement && this.supportsAutomaticIntrinsicSize) return YES;

        if (!this._hasDeterministicSize && this._preferredIntrinsicSize && this._intrinsicSize && !this._preferredIntrinsicSize.isEqualToSize(this._instrinsicSize)) return YES;

        let subviewsLength = this._subviews.length;
        for (let i = 0; i < subviewsLength; i++) {
            if (this._subviews[i].needsIntrinsicSizeMeasurement) return YES;
        }

        return NO;
    },

    /**
     * Should be invoked when this view's intrinsic size is no longer valid and should be measured again
     * by the layout engine during the next layout pass. This implicitly invalidates this view's layout as well,
     * causing a layout pass to run before the next animation frame.
     * 
     * To prevent visual artifacts that might be caused by the content updating without the view's bounds, CoreUI
     * will attempt to perform the next layout pass before the next animation frame renders.
     */
    invalidateIntrinsicSize() {
        this._preferredIntrinsicSize = undefined;
        this._needsIntrinsicSizeMeasurement = YES;

        const rootView = this.rootView;
        rootView._needsLayout = YES;
        rootView._scheduleImmediateLayout();
    },

    /**
     * The last measured intrinsic size for this view, if available.
     */
    _intrinsicSize: undefined, // <BMSize, nullable>

    /**
     * A size that represents this view's preferred intrinsic size. This is the intrinsic size returned by the view
     * during the first layout pass, before having been assigned a width. It is used to determine if a new intrinsic size should
     * be requested for this view during subsequent layout passes so this view has a chance to adjust to its new size restrictions.
     * 
     * This value is automatically managed by CoreUI.
     */
    _preferredIntrinsicSize: undefined, // <BMSize, nullable>

    /**
     * Invoked internally by CoreUI to obtain and cache the intrinsic size for this view.
     */
    _getIntrinsicSize() {
        let result;
        if (this._needsIntrinsicSizeMeasurement) {
            if (this.requiredWidth) {
                result = this._instrinsicSize = this.intrinsicSize;
            }
            else {
                result = this._instrinsicSize = this._preferredIntrinsicSize = this.intrinsicSize;
            }
        }
        else if (this.requiredWidth) {
            if (this._intrinsicSize && !this._intrinsicSize.isEqualToSize(this._preferredIntrinsicSize)) {
                result = this._instrinsicSize = this.intrinsicSize;
            }
        }

        if (!result) result = this._instrinsicSize;

        return result;
    },

    /**
     * This view's intrinsic size. If this view does not have an intrinsic size, this property's value will be
     * undefined.
     * The default implementation returns undefined, unless `supportsAutomaticIntrinsicSize` is set to YES.
     * Whenever a view's intrinsic size changes, for example if the content from which it is derived changes,
     * the view should invoke `invalidateIntrinsicSize()` to cause the layout engine to measure the view when
     * performing the next layout pass.
     *  
     * Subclasses that support intrinsic sizes should override this getter to return the correct intrinsic 
     * size corresponding to the view's contents.
     * 
     * The CoreUI layout engine will invoke this getter twice during a layout pass. The first time it will do so
     * to obtain the overall size that this view would like to have. Afterwards it will compute the horizontal
     * layout and assign a width to this view. It will then invoke this getter again to verify if the intrinsic
     * size may have changed in response to the new width requirement.
     * Subclasses should check the value of the `requiredWidth` property to check if they have been assigned a width when computing
     * their intrisic sizes.
     */
    get intrinsicSize() { // <BMSize, nullable>
        if (this.supportsAutomaticIntrinsicSize) {
            if (this._needsIntrinsicSizeMeasurement) {
                let node = this._node;

                // +1 is used because text nodes often have fractional values, but scrollWidth truncates the
                // decimal part so the text ends up overflowing into a second line.
                // getBoundingClientRect normally returns these fractional values, but it is affected
                // by transforms which makes it unreliable for intrinsic size calculations
                this._intrinsicSize = BMSizeMake((node.offsetWidth - node.clientWidth) + node.scrollWidth + 1, 
                                                    (node.offsetHeight - node.clientHeight) + node.offsetHeight);


                if (BM_VIEW_DEBUG_AUTOMATIC_INTRINSIC_SIZE) {
                    let flash = document.createElement('div');
                    flash.style.cssText = 'position: absolute; z-index: 999999999; top: 0px; left: 0px; width: 100%; height: 100%; background-color: red; pointer-events: none;';
                    node.appendChild(flash);
                    requestAnimationFrame(() => flash.remove());
                }
            }
            return this._intrinsicSize;
        }
        return undefined;
    },

    /**
     * Controls how much this view will resist being compressed below its intrinsic size in a layout
     * managed by CoreUI. This generates two implicit constraints, one for width and one for height,
     * that specify that this view's size should be greater than or equal to its intrinsic size.
     * That constraint will have its priority set to this value.
     * A value of <code>BMLayoutConstraintPriorityRequired</code> will ensure that this view's content
     * will never become compressed in a valid layout.
     * This value has no effect if this view does not provide an intrinsic size.
     */
    _compressionResistance: 750, // <Number>
    get compressionResistance() {
        return this._compressionResistance;
    },
    set compressionResistance(resistance) {
        this._compressionResistance = resistance;
        this._widthCompressionConstraint = undefined;
        this._heightCompressionConstraint = undefined;
        this.needsLayout = YES;
        this.rootView._invalidatedConstraints = YES;
    },
    
    /**
     * Controls how much this view will resist being expanded beyond its intrinsic size in a layout
     * managed by CoreUI. This generates two implicit constraints, one for width and one for height,
     * that specify that this view's size should be less than or equal to its intrinsic size.
     * That constraint will have its priority set to this value.
     * A value of <code>BMLayoutConstraintPriorityRequired</code> will ensure that this view's size will never
     * be larger than its intrinsic size in a valid layout.
     * This value has no effect if this view does not provide an intrinsic size.
     */
    _expansionResistance: 250, // <Number>
    get expansionResistance() {
        return this._expansionResistance;
    },
    set expansionResistance(resistance) {
        this._expansionResistance = resistance;
        this._widthExpansionConstraint = undefined;
        this._heightExpansionConstraint = undefined;
        this.needsLayout = YES;
        this.rootView._invalidatedConstraints = YES;
    },

    // #endregion

    // #region Size Classes

    /**
     * Set to `YES` if this view should update its internal size classes structure
     * during the next layout pass.
     */
    _invalidatedSizeClasses: NO, // <Boolean>

    /**
     * Contains the size classes that affect the layout or properties of this view hierarchy.
     */
    _sizeClasses: undefined, // <Set<BMLayoutSizeClass>>

    /**
     * Contains the size classes that match the view's current viewport.
     */
    _matchingSizeClasses: undefined, // <Set<BMLayoutSizeClass>>

    /**
     * Invoked internally by CoreUI when the size classes that affect this view hierarchy have changed.
     * This causes the root view to check how size classes have changed and may, depending on what changes, trigger
     * a complete layout pass.
     */
    _updateSizeClasses() {
        this._sizeClasses = new Set;

        // Retrieve and enumerate all of the subviews within this view hierarchy
        this.allSubviews.forEach(subview => {
            // Enumerate the variations supported by this view
            for (let sizeClassHashString in subview._variations) {
                // For each variation, create an entry in the size classes map if there isn't one - as identical size classes are
                // also guaranteed to be the same instance, using the hash string is not required
                let sizeClass = subview._variations[sizeClassHashString].sizeClass;
                if (!this._sizeClasses.has(sizeClass)) {
                    this._sizeClasses.add(sizeClass);
                }
            }
        });
        
        // Retrieve and enumerate all of the constraints within this view hierarchy
        this.allConstraints.forEach(constraint => {
            // Enumerate the variations supported by this constraint
            for (let sizeClassHashString in constraint._variations) {
                // For each variation, create an entry in the size classes map if there isn't one - as identical size classes are
                // also guaranteed to be the same instance, using the hash string is not required
                let sizeClass = constraint._variations[sizeClassHashString].sizeClass;
                if (!this._sizeClasses.has(sizeClass)) {
                    this._sizeClasses.add(sizeClass);
                }
            }
        });
    },

    /**
     * The viewport used by this view hierarchy. In most cases, the value of this property is identical across
     * view hierarchies and matches the actual viewport.
     */
    _viewport: undefined, // <BMViewport>
    get viewport() {
        if (this.isRootView) {
            !this._viewport && this._updateViewport();
            return this._requiredViewport || this._viewport;
        }

        return this.rootView.viewport;
    },

    /**
     * Used by the layout editor to force this view to appear as if the given viewport had been active.
     */
    _requiredViewport: undefined, // <BMViewport>

    /**
     * Used internally by CoreUI. Computes and returns the current viewport.
     */
    get _currentViewport() {
        if (this._requiredViewport) return this._requiredViewport;

        let viewport = new BMViewport;
        viewport.init();

        viewport._width = window.innerWidth;
        viewport._height = window.innerHeight;
        viewport._diagonal = Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2));
        viewport._orientation = viewport._width >= viewport._height ? BMLayoutOrientation.Landscape : BMLayoutOrientation.Portrait;
        viewport._surfaceArea = viewport._width * viewport._height;

        return viewport;
    },

    /**
     * Invoked by CoreUI whenever the global layout variables have been modified.
     * This causes the view to invalidate its layout if this change affects the current configuration.
     */
    _layoutVariablesDidUpdate() {
        // If this view has not had a chance to compute its first layout, there is no
        // need to perform any additional action as it will udpate its layout variable
        // values during the first layout passs
        if (!this._viewport) return;

        const currentLayoutVariables = this._layoutVariables || {};

        // Update the values of the layout variables
        this._layoutVariableValuesForViewport(this._viewport);

        // Verify if any layout variables have changed
        let layoutVariablesDidChange = NO;
        for (let key in this._layoutVariables) {
            if (currentLayoutVariables[key] != this._layoutVariables[key]) {
                layoutVariablesDidChange = YES;
                break;
            }
        }

        if (layoutVariablesDidChange) {
            // If the layout variable values did change the constraints
            // have to be notified in case they use layout variables and should update their configuration accordingly
            this.allConstraints.forEach(constraint => constraint.layoutVariablesDidChange());
        }
    },

    /**
     * Invoked internally to update the viewport characteristics used by this view hierarchy.
     */
    _updateViewport() {
        let viewport = this._currentViewport;

        this._viewport = viewport;

        let currentLayoutVariables = this._layoutVariables || {};

        // Update the values of the layout variables
        this._layoutVariableValuesForViewport(viewport);

        // Verify if any layout variables have changed
        let layoutVariablesDidChange = NO;
        for (let key in this._layoutVariables) {
            if (currentLayoutVariables[key] != this._layoutVariables[key]) {
                layoutVariablesDidChange = YES;
                break;
            }
        }

        // Create a list of the size classes that match this viewport
        let matchingSizeClasses = new Set;
        for (let sizeClass of this._sizeClasses.keys()) {
            if (viewport.matchesSizeClass(sizeClass)) {
                matchingSizeClasses.add(sizeClass);
            }
        }

        if (this._matchingSizeClasses) {
            // Compare this new list to the previously matching size classes
            let sizeClassesDidUpdate = NO;
            if (this._matchingSizeClasses.size != matchingSizeClasses.size) {
                sizeClassesDidUpdate = YES;
            }
            else for (let sizeClass of this._matchingSizeClasses) {
                if (!matchingSizeClasses.has(sizeClass)) {
                    sizeClassesDidUpdate = YES;
                }
            }

            // If the size classes did change, notify all of the observers that the new set of
            // size classes has become active
            if (sizeClassesDidUpdate) {
                this._matchingSizeClasses = matchingSizeClasses;
                let matchingSizeClassesArray = Array.from(matchingSizeClasses);
    
                // Notify the constraints and subviews that the size classes have been updated
                this.allConstraints.forEach(constraint => constraint.activeSizeClassesDidChange(matchingSizeClassesArray));
                this.allSubviews.forEach(subview => subview.activeSizeClassesDidChange(matchingSizeClassesArray));
            }
            else if (layoutVariablesDidChange) {
                // If the size classes did not change, but the layout variables did, the constraints
                // have to be notified nevertheless in case they use layout variables
                this.allConstraints.forEach(constraint => constraint.layoutVariablesDidChange());
            }
        }
        else {
            // If there were no previously matching size classes, notify all of the observers that the
            // size classes have become active
            this._matchingSizeClasses = matchingSizeClasses;
            let matchingSizeClassesArray = Array.from(matchingSizeClasses);

            // Notify the constraints that the size classes have been updated
            this.allConstraints.forEach(constraint => constraint.activeSizeClassesDidChange(matchingSizeClassesArray));
            this.allSubviews.forEach(subview => subview.activeSizeClassesDidChange(matchingSizeClassesArray));
        }
    },

    /**
     * Returns the current value of the given layout variable, if it exists.
     * @param variable <String>         The name of the layout variable. Optionally, the name of the layout variable may be prefixed with a minus sign,
     *                                  which will cause this method to return the negated value of the layout variable.
     * @return <Number, nullable>       The current value of that layout variable, or `0` if no such layout variable had been defined.
     */
    valueForLayoutVariable(variable) {
        const rootView = this.rootView;
        if (rootView != this) return rootView.valueForLayoutVariable(variable);

        if (variable.charAt(0) == '-') {
            return -(this._layoutVariables[variable.substring(1)] || 0);
        }

        return this._layoutVariables[variable] || 0;
    },

    // #endregion

    // #region Keyboard shortcuts

	/**
	 * The keyboard shortcuts that have been registered to this view.
	 */
	_keyboardShortcuts: undefined, // <Dictionary<string, [BMKeyboardShortcut]>>

	/**
	 * Registers a keyboard shortcut that can be activated when this view has keyboard focus.
	 * @param shortcut <BMKeyboardShortcut>			The keyboard shortcut to register.
	 */
	registerKeyboardShortcut(shortcut) {
		if (!Object.keys(this._keyboardShortcuts).length) this._enableKeyboardShortcuts();

        if (!this._keyboardShortcuts[shortcut.keyCode]) {
            this._keyboardShortcuts[shortcut.keyCode] = [];
        }

		this._keyboardShortcuts[shortcut.keyCode].push(shortcut);
	},

	/**
	 * Unregisters a keyboard shortcut. If this keyboard shortcut had not been previously registered, this method does nothing.
	 * @param shortcut <BMKeyboardShortcut>			The keyboard shortcut to unregister.
	 */
	unregisterKeyboardShortcut(shortcut) {
        const shortcuts = this._keyboardShortcuts[shortcut.keyCode];

        if (shortcuts) {
            for (let i = 0; i < shortcuts.length; i++) {
                if (shortcuts[i] == shortcut) {
                    shortcuts.splice(i, 1);
                    break;
                }
            }

            // If this removes the last shortcut for this key code, remove the entry
            if (!shortcuts.length) {
                delete this._keyboardShortcuts[shortcut.keyCode];
            }
        }

		if (!Object.keys(this._keyboardShortcuts).length) this._disableKeyboardShortcuts();
	},

	/**
	 * If keyboard shortcuts have been registered on this view, this method will be invoked to identify
	 * and handle key presses. Subclasses that override this method should invoke the base implementation to allow
	 * keyboard shortcuts to be handled correctly.
	 * @param event <KeyboardEvent>			The event that triggered this action.
	 */
	keyPressedWithEvent(event) {
        if (!this._keyboardShortcuts[event.code]) return;

		// Check if a shortcut key has been pressed.
		for (const shortcut of this._keyboardShortcuts[event.code]) {
			// Build the modifier bitmap for this event
			let bitmap = 0;
			for (const modifier in BMKeyboardShortcutModifier) {
				if (event[BMKeyboardShortcutModifier[modifier].key]) {
					bitmap = bitmap | BMKeyboardShortcutModifier[modifier].value;
				}
			}

			if (bitmap == shortcut._modifierBitmap) {
				if (shortcut.preventsDefault) event.preventDefault();
				shortcut.target[shortcut.action](event, {forKeyboardShortcut: shortcut});
			}
		}
	},

	/**
	 * Set to `YES` if keyboard shortcuts are enabled.
	 */
	_keyboardShortcutsEnabled: NO, // <Boolean>

	/**
	 * Enables keyboard shortcut handling. This makes the view's `node` focusable and attaches
	 * the relevant event handlers to it.
	 */
	_enableKeyboardShortcuts() {
        // Make this view focusable if it is not already
        if (!this.node.hasAttribute('tabIndex')) {
            this.node.tabIndex = -1;
        }

		this._keypressHandler = (event) => {
			this.keyPressedWithEvent(event);
		};

		this.node.addEventListener('keydown', this._keypressHandler);
		this._keyboardShortcutsEnabled = YES;
	},

	/**
	 * Disables keyboard shortcut handling. This detaches the relevant event handlers from this view's `node`.
     * The node's `tabIndex` property will not be cleared by this method.
	 */
	_disableKeyboardShortcuts() {
		this.node.removeEventListener('keydown', this._keypressHandler);
		this._keyboardShortcutsEnabled = NO;
	},

    // #endregion

    // #region Constraints and Cassowary Variables


    /**
     * An internal list of layout constraints that affect this view. This array will contain both constraints having
     * this view as the source view and constraints having this view as the target view. It also contains constraints
     * that have been registered for this view but are marked inactive.
     */
    _constraints: undefined, // <[BMLayoutConstraint]>

    /**
     * An internal list of Cassowary variables used by the constraints affecting this view.
     * These are automatically generated based upon the active constraints affecting this view.
     */
    _variables: undefined, // <Object<String, kiwi.Variable>>

    /**
     * Finds and returns the constraint with the given identifier within this view or any of its descendants.
     * @param identifier <String>               The identifier of the constraint to find.
     * @return <BMLayoutConstraint, nullable>   The requested constraint if it was found, or `undefined` otherwise.
     */
    constraintWithIdentifier(identifier) {
        for (let constraint of this._constraints) {
            if (constraint.identifier == identifier) return constraint;
        }

        for (let subview of this._subviews) {
            let constraint = subview.constraintWithIdentifier(identifier);
            if (constraint) return constraint;
        }
    },

    /**
     * An array containing all of the layout constraints that affect this view or any of its descendants, regardless of
     * whether they are active or not or whether the views they affect have deterministic constraints or not.
     */
    get allConstraints() { // <[BMLayoutConstraint]>
        let constraints = this._constraints.slice();

        this._subviews.forEach(subview => {
            constraints = constraints.concat(subview.allConstraints);
        });

        return constraints;
    },

    /**
     * A list of layout constraints that currently affect this view or its descendants that have deterministic constraints. 
     * The array returned by this getter will only return the constraints that are marked as active. This array will contain 
     * both constraints having this view as the source view and constraints having this view as the target view.
     */
    get activeConstraints() { // <[BMLayoutConstraint]>
        let constraints = [];
        // If this view doesn't have deterministic constraints, skip them
        if (this._hasDeterministicConstraints) {
            constraints = this._constraints.filter(constraint => constraint.affectsLayout);
        }

        this._subviews.forEach(subview => {
            constraints = constraints.concat(subview.activeConstraints);
        });

        return constraints;
    },


    /**
     * A list of layout constraints that have been registered for this view.
     */
    get localConstraints() { // <[BMLayoutConstraint]>
        return this._constraints.slice();
    },

    /**
     * Used internally.
     */
    _invalidatedConstraints: NO, // <Boolean>

    /**
     * Invoked internally when a constraint that affects this view is created.
     * @param constraint <BMLayoutConstraint>   The constraint.
     */
    _addConstraint(constraint) {
        this._constraints.push(constraint);
        this.rootView._invalidatedConstraints = YES;

        this._checkConstraints();
    },

    /**
     * Invoked internally to remove a constraint that is no longer needed.
     * @param constraint <BMLayoutConstraint>   The constraint.
     */
    _removeConstraint(constraint) {
        var index = this._constraints.indexOf(constraint);
        this.rootView._invalidatedConstraints = YES;

        if (index != -1) {
            this._constraints.splice(index, 1);
        }

        this._checkConstraints();
    },

    /**
     * A property that controls if this view has deterministic constraints.
     */
    _hasDeterministicConstraints: NO, // <Boolean>

    /**
     * Invoked by CoreUI to determine if this view's size and positioning can be derived from its constraints.
     * A view has deterministic constraints if it has at least two horizontal constraints affecting different attributes,
     * and two vertical constraints affecting different attributes.
     */
    _checkConstraints() {
        let hasDeterministicHorizontalConstraints = NO;
        let hasDeterministicVerticalConstraints = NO;

        let horizontalAttributes = new Set;
        let verticalAttributes = new Set;

        // A view has deterministic size if it has constant equality constraints for width and height
        // whose priority is strictly greater than the view's own compression and expansion resistance
        let hasDeterministicSize = NO;
        let hasDeterministicWidth = NO;
        let hasDeterministicHeight = NO;

        // Width and height are implicit when this view has an intrinsic size.
        if (this.supportsIntrinsicSize) {
            horizontalAttributes.add(BMLayoutAttribute.Width);
            verticalAttributes.add(BMLayoutAttribute.Height);
        }

        // Then run through this view's constraints and add the attributes they affect into the appropriate sets
        let constraints = this._constraints;
        for (var i = 0; i < constraints.length; i++) {
            let constraint = constraints[i];

            // Skip inactive constraints
            if (!constraint.affectsLayout) continue;

            switch (constraint._kind) {
                case BMLayoutConstraintKind.Horizontal:
                    constraint.affectedAttributesForView(this).forEach(attribute => horizontalAttributes.add(attribute));
                    // If the set has two values or more, the axis is deterministic
                    if (horizontalAttributes.size > 1) hasDeterministicHorizontalConstraints = YES;

                    if (constraint._sourceViewAttribute == BMLayoutAttribute.Width && 
                        !constraint._targetView && 
                        !constraint.isConstraintCollection && 
                        constraint._relation == BMLayoutConstraintRelation.Equals &&
                        constraint.activePriority > this._compressionResistance &&
                        constraint.activePriority > this._expansionResistance) {
                            hasDeterministicWidth = YES;
                    }
                    break;
                case BMLayoutConstraintKind.Vertical:
                    constraint.affectedAttributesForView(this).forEach(attribute => verticalAttributes.add(attribute));
                    // If the set has two values or more, the axis is deterministic
                    if (verticalAttributes.size > 1) hasDeterministicVerticalConstraints = YES;

                    if (constraint._sourceViewAttribute == BMLayoutAttribute.Height && 
                        !constraint._targetView && 
                        !constraint.isConstraintCollection && 
                        constraint._relation == BMLayoutConstraintRelation.Equals &&
                        constraint.activePriority > this._compressionResistance &&
                        constraint.activePriority > this._expansionResistance) {
                            hasDeterministicHeight = YES;
                    }
                    break;
                default:
                    break;
            }

            if (hasDeterministicHeight && hasDeterministicWidth) hasDeterministicSize = YES;

            // If both axes and the size are already determistic, stop looking
            if (hasDeterministicHorizontalConstraints && hasDeterministicVerticalConstraints && hasDeterministicSize) break;
        }

        if (hasDeterministicSize) this._hasDeterministicSize = YES;

        // If the view's layout is deterministic, cache the result
        if (hasDeterministicHorizontalConstraints && hasDeterministicVerticalConstraints) return this._hasDeterministicConstraints = YES;

        // If the external constraints are not deterministic, also check the internal constraints, using the same logic as above
        constraints = this.internalConstraints();
        for (var i = 0; i < constraints.length; i++) {
            let constraint = constraints[i];

            switch (constraint._kind) {
                case BMLayoutConstraintKind.Horizontal:
                    constraint.affectedAttributesForView(this).forEach(attribute => horizontalAttributes.add(attribute));
                    // If the set has two values or more, the axis is deterministic
                    if (horizontalAttributes.size > 1) hasDeterministicHorizontalConstraints = YES;
                    break;
                case BMLayoutConstraintKind.Vertical:
                    constraint.affectedAttributesForView(this).forEach(attribute => verticalAttributes.add(attribute));
                    // If the set has two values or more, the axis is deterministic
                    if (verticalAttributes.size > 1) hasDeterministicVerticalConstraints = YES;
                    break;
                default:
                    break;
            }
            // If both axes are already determistic, stop looking
            if (hasDeterministicHorizontalConstraints && hasDeterministicVerticalConstraints) break;
        }

        // Finally cache the result into the `_hasDeterministicConstraints` property.
        this._hasDeterministicConstraints = hasDeterministicHorizontalConstraints && hasDeterministicVerticalConstraints;
    },

    /**
     * Invoked internally to remove all the constraints from this view and all of its subviews.
     */
    _clearConstraints() {
        // localConstraints operates on a copy of the constraints array, therefore the structure of the array
        // does not change as constraints are removed
        this.localConstraints.forEach(constraint => constraint.remove());
        this._subviews.forEach(subview => subview._clearConstraints());
    },

    /**
     * Returns the Cassowary expression corresponding to this view's left variable.
     * This expressed as the sum between this view's left variable and its superview's left expression
     * and represents the horizontal distance from the rootView's origin point.
     * This makes it possible to create constraints that affect two views that are not direct descendants of 
     * the same view but share at least an ancestor within their hierarchy.
     * @param multiplier <Number, nullable>         Defaults to 1. An optional multiplier to apply to the final
     *                                              term of this expression.
     */
    _leftExpressionWithMultiplier(multiplier) { // <kiwi.Expression>
        multiplier = (multiplier || 1);
        if (this.isRootView) {
            return new kiwi.Expression([multiplier, this._variables[BMLayoutAttribute.Left]]);
        }

        return new kiwi.Expression(this.superview._leftExpressionWithMultiplier(), [multiplier, this._variables[BMLayoutAttribute.Left]]);
    },

    /**
     * Returns the Cassowary expression corresponding to this view's top variable.
     * This expressed as the sum between this view's top variable and its superview's top expression
     * and represents the vertical distance from the rootView's origin point.
     * This makes it possible to create constraints that affect two views that are not direct descendants of 
     * the same view but share at least an ancestor within their hierarchy.
     * @param multiplier <Number, nullable>         Defaults to 1. An optional multiplier to apply to the final
     *                                              term of this expression.
     */
    _topExpressionWithMultiplier(multiplier) { // <kiwi.Expression>
        multiplier = (multiplier || 1);
        if (this.isRootView) {
            return new kiwi.Expression([multiplier, this._variables[BMLayoutAttribute.Top]]);
        }

        return new kiwi.Expression(this.superview._topExpressionWithMultiplier(), [multiplier, this._variables[BMLayoutAttribute.Top]]);
    },

    /**
     * Invoked internally to obtain the Cassowary expression corresponding to the given layout attribute.
     * The Left, Width, Top and Height are simple variables, but all other layout attributes are actually
     * treated as expressions between those four variables.
     * 
     * Additionally, the Left and Top variables returned by this method are expressed in terms of the layout's 
     * `rootView` coordinate space, unless otherwise requested, whereas locally they are epxressed in terms of the superview's coordinate space.
     * 
     * Optionally, the attribute may be multiplied by the given multiplier.
     * @param attribute <BMLayoutAttribute>             The layout attribute.
     * {
     *  @param withMultiplier <Number, nullable>        Defaults to <code>1</code>. An arbitrary multiplier for the attribute.
     *                                                  If this attribute is expressed as an expression, it will be
     *                                                  added to each of its terms. This value should not be <code>0</code>
     * }
     * @return <kiwi.Expression>                        The Cassowary expression for the variable.
     */
    _cassowaryExpressionForLayoutAttribute(attribute, args) {
        var multiplier = (args && args.withMultiplier) || 1;

        if (attribute in this._variables) {
            if (attribute == BMLayoutAttribute.Left) {
                return this._leftExpressionWithMultiplier(multiplier);
            }
            else if (attribute == BMLayoutAttribute.Top) {
                return this._topExpressionWithMultiplier(multiplier);
            }
            return new kiwi.Expression(multiplier != 1 ? [multiplier, this._variables[attribute]] : this._variables[attribute]);
        }
        else switch (attribute) {
            // The leading attribute is identical to Left for LTR layouts and to Right for RTL layouts
            case BMLayoutAttribute.Leading:
                return this.LTRLayout ? 
                    this._cassowaryExpressionForLayoutAttribute(BMLayoutAttribute.Left, args) :
                    this._cassowaryExpressionForLayoutAttribute(BMLayoutAttribute.Right, args)

            // The trailing attribute is identical to Right for LTR layouts and to Left for RTL layouts
            case BMLayoutAttribute.Trailing:
                return this.LTRLayout ? 
                    this._cassowaryExpressionForLayoutAttribute(BMLayoutAttribute.Right, args) :
                    this._cassowaryExpressionForLayoutAttribute(BMLayoutAttribute.Left, args)

            // Right layout attribute is expressed as Width + Left
            case BMLayoutAttribute.Right:
                return multiplier != 1 ? 
                    new kiwi.Expression(
                        [multiplier, this._variables[BMLayoutAttribute.Width]],
                        this._leftExpressionWithMultiplier(multiplier)
                    ) : new kiwi.Expression(
                        this._variables[BMLayoutAttribute.Width],
                        this._leftExpressionWithMultiplier(multiplier)
                    );
                
            // Center X layout attribute is expressed as Width/2 + Left
            case BMLayoutAttribute.CenterX:
                return multiplier != 1 ? 
                    new kiwi.Expression(
                        [multiplier / 2, this._variables[BMLayoutAttribute.Width]],
                        this._leftExpressionWithMultiplier(multiplier)
                    ) : new kiwi.Expression(
                        [.5, this._variables[BMLayoutAttribute.Width]],
                        this._leftExpressionWithMultiplier(multiplier)
                    );
                    
            // Bottom layout attribute is expressed as Height + Top
            case BMLayoutAttribute.Bottom:
                return multiplier != 1 ? 
                    new kiwi.Expression(
                        [multiplier, this._variables[BMLayoutAttribute.Height]],
                        this._topExpressionWithMultiplier(multiplier)
                    ) : new kiwi.Expression(
                        this._variables[BMLayoutAttribute.Height],
                        this._topExpressionWithMultiplier(multiplier)
                    );
                    
            // Center Y layout attribute is expressed as Height/2 + Top
            case BMLayoutAttribute.CenterY:
                return multiplier != 1 ? 
                    new kiwi.Expression(
                        [multiplier / 2, this._variables[BMLayoutAttribute.Height]],
                        this._topExpressionWithMultiplier(multiplier)
                    ) : new kiwi.Expression(
                        [.5, this._variables[BMLayoutAttribute.Height]],
                        this._topExpressionWithMultiplier(multiplier)
                    );
                    
            // Aspect ratio attributes should not be retrieved through this method
            case BMLayoutAttribute.AspectRatio:
                throw new Error('Aspect ratio constraints are currently unsupported!');
        }
    },


    /**
     * Invoked by CoreUI prior to a layout pass to obtain internal constraints required by this view or is subviews,
     * as well as the constraints representing the intrinsic size for these views, if available.
     * The default implementation returns an empty array for a view without an intrinsic size and
     * various constraints for views that declare an intrinsic size.
     * 
     * This will also return the internal constraints provided by this view and its subviews. Subclasses that need to
     * provide internal constraints should not override this getter. The `internalConstraints()` method serves as
     * an extension point for subclasses to override and include their own internal constraints.
     */
    get builtInConstraints() { // <[BMLayoutConstraint]>
        var intrinsicSize = this._getIntrinsicSize();

        var constraints = [];

        if (intrinsicSize || this.supportsAutomaticIntrinsicSize) {
            if (this._widthCompressionConstraint) {
                this._widthCompressionConstraint.constant = intrinsicSize.width;
                this._heightCompressionConstraint.constant = intrinsicSize.height;
                constraints.push(this._widthCompressionConstraint, this._heightCompressionConstraint);
            }
            else {
                // If an intrinsic size is defined, create constraints to implement the compression resistance and expansion resistance
                constraints.push(
                    this._widthCompressionConstraint = BMLayoutConstraint.internalConstraintWithView(this, {attribute: BMLayoutAttribute.Width, relatedBy: BMLayoutConstraintRelation.GreaterThanOrEquals, constant: intrinsicSize.width, priority: this.compressionResistance}),
                    this._heightCompressionConstraint = BMLayoutConstraint.internalConstraintWithView(this, {attribute: BMLayoutAttribute.Height, relatedBy: BMLayoutConstraintRelation.GreaterThanOrEquals, constant: intrinsicSize.height, priority: this.compressionResistance})
                );
            }

            if (this._widthExpansionConstraint) {
                this._widthExpansionConstraint.constant = intrinsicSize.width;
                this._heightExpansionConstraint.constant = intrinsicSize.height;
                constraints.push(this._widthExpansionConstraint, this._heightExpansionConstraint);
            }
            else {
                // If an intrinsic size is defined, create constraints to implement the compression resistance and expansion resistance
                constraints.push(
                    this._widthExpansionConstraint = BMLayoutConstraint.internalConstraintWithView(this, {attribute: BMLayoutAttribute.Width, relatedBy: BMLayoutConstraintRelation.LessThanOrEquals, constant: intrinsicSize.width, priority: this.expansionResistance}),
                    this._heightExpansionConstraint = BMLayoutConstraint.internalConstraintWithView(this, {attribute: BMLayoutAttribute.Height, relatedBy: BMLayoutConstraintRelation.LessThanOrEquals, constant: intrinsicSize.height, priority: this.expansionResistance})
                );
            }
        }
        else {
            // TODO: Moved to _resizeForAutomaticIntrinsicSize
        }

        // Add this view's own internal constraints
        constraints = constraints.concat(this.internalConstraints());

        this._internalConstraints = constraints;

        // Append the internal constraints for subviews
        this._subviews.forEach(subview => {
            constraints = constraints.concat(subview.builtInConstraints);
        });

        return constraints;
    },

    /**
     * Invoked by CoreUI prior to a layout pass to obtain internal constraints required by this view.
     * The default implementation returns an empty array for all views except the layout root view.
     * 
     * Subclasses overriding this method should invoke the superclass implementation and include
     * any constraints returned by it into their result. Views are expected to return the same set of constraints from
     * this method unless they invalidate their constraint set. During all other layout passes, views should just
     * modify and return their previously returned set of constraints.
     * 
     * Constraints created from within this method must be marked internal.
     * @return <[BMLayoutConstraint]>       An array of layout constraints needed by this view.
     */
    internalConstraints() {
        var constraints = [];

        // If this view is the root of the view hierarchy, add the constraints fixing it to the top-left corner of its container
        // and sizing constraints making it as large as its container
        if (this.isRootView) {
            // Root constraints cannot be created if the view's node is not attached to the document
            if (!this.node.parentNode) return constraints;

            if (this._rootViewLeftConstraint) {
                if (this._layoutEditor) {
                    this._rootViewHeightConstraint.constant = this._layoutEditor._staticWorkspaceHeight;
                    this._rootViewWidthConstraint.constant = this._layoutEditor._staticWorkspaceWidth;
                }
                else {
                    this._rootViewHeightConstraint.constant = this._node.parentNode.offsetHeight;
                    this._rootViewWidthConstraint.constant = this._node.parentNode.offsetWidth;
                }
                constraints.push(this._rootViewLeftConstraint, this._rootViewTopConstraint, this._rootViewWidthConstraint, this._rootViewHeightConstraint);
            }
            else {
                constraints.push(
                    this._rootViewLeftConstraint = BMLayoutConstraint.internalConstraintWithView(this, {attribute: BMLayoutAttribute.Left, relatedBy: BMLayoutConstraintRelation.Equals, constant: 0}),
                    this._rootViewTopConstraint = BMLayoutConstraint.internalConstraintWithView(this, {attribute: BMLayoutAttribute.Top, relatedBy: BMLayoutConstraintRelation.Equals, constant: 0}),
                    this._rootViewWidthConstraint = BMLayoutConstraint.internalConstraintWithView(this, {attribute: BMLayoutAttribute.Width, relatedBy: BMLayoutConstraintRelation.Equals, constant: this._node.parentNode.offsetWidth}),
                    this._rootViewHeightConstraint = BMLayoutConstraint.internalConstraintWithView(this, {attribute: BMLayoutAttribute.Height, relatedBy: BMLayoutConstraintRelation.Equals, constant: this._node.parentNode.offsetHeight})
                );
            }
        }

        return constraints;

    },

    /**
     * Invoked internally by CoreUI to assign the layout width to this view.
     */
    _assignWidth() {
        this._requiredWidth = this._variables[BMLayoutAttribute.Width].value();

        // If the preferred intrinsic size is different from the assigned intrinsic size, mark this view as requiring an intrinsic size measurement
        if (!this._hasDeterministicSize && this._intrinsicSize && this._preferredIntrinsicSize && !this._instrinsicSize.isEqualToSize(this._preferredIntrinsicSize) && this._intrinsicSize.width != this._requiredWidth) {
            this._needsIntrinsicSizeMeasurement = YES;
        }

        this._subviews.forEach(subview => subview._assignWidth());
    },

    /**
     * Invoked by CoreUI prior to measuring intrinsic sizes to give the views a chance to acquire their reference frames.
     * The reference is computed based on the node's position and size within the DOM.
     * 
     * If this view does not have deterministic constraints or its layout cannot be computed by CoreUI, this reference frame will
     * be assigned back to this view at the end of the layout operation.
     */
    _acquireReferenceFrames() {
        // If this view has already had a frame applied, the reference frame no longer needs to be measured, which should avoid triggering any forced layout
        if (this._frame) {
            this._referenceFrame = this._frame.copy();
        }
        else {
            let referenceFrame = BMRectMake(this.node.offsetLeft, this.node.offsetTop, this.node.offsetWidth, this.node.offsetHeight);
    
            // Only set this reference frame if the view doesn't already have a reference frame
            // and if this reference frame has non-zero sizes
            if ((referenceFrame.width && referenceFrame.height) || !this._referenceFrame) {
                this._referenceFrame = referenceFrame;
            }
        }

        //if (this._intrinsicSize && this._preferredIntrinsicSize && !this._instrinsicSize.isEqualToSize(this._preferredIntrinsicSize)) {
        // Invalidate the intrinsic size for this view if its assigned size is less than its preferred size
        // and the view does not have a deterministic size
        if (!this._hasDeterministicSize && this._intrinsicSize && this._preferredIntrinsicSize && !this._instrinsicSize.isGreaterThanSize(this._preferredIntrinsicSize)) {
            this._needsIntrinsicSizeMeasurement = YES;
        }

        this._subviews.forEach(subview => subview._acquireReferenceFrames());
    },

    /**
     * Invoked by CoreUI to resize this view's node for automatic intrinsic size measurement.
     */
    _resizeForAutomaticInstricSize() {

        // If the subview supports automatic intrinsic size
        // make its maximum size infinite prior to requesting the intrinsic size
        // This is done in its own loop to prevent excessive thrashing
        if (this.supportsAutomaticIntrinsicSize && this.needsIntrinsicSizeMeasurement) {
            if (this._requiredWidth) {
                this._node.style.width = this._requiredWidth + 'px';
            }
            else {
                BMCopyProperties(this._node.style, {width: 'auto', height: 'auto', left: '0px', top: '0px', position: 'absolute'});
            }
        }
        else {
            // TODO: Moved from builtInConstraints

            // If an intrinsic size is not specified or automatically determined, set this view to maximum width & height
            // temporarily to allow its subviews to measure their own intrinsic sizes correctly
            // but only if there are subviews to measure
            if (this.needsIntrinsicSizeMeasurement) {
                BMCopyProperties(this._node.style, {width: '100%', height: '100%'});
            }
        }

        this._subviews.forEach(subview => subview._resizeForAutomaticInstricSize());
    },

    /**
     * Invoked internally by CoreUI to prepare the view's node to be measured by CoreUI, if it supports
     * automatic intrinsic sizes.
     */
    _prepareForAutomaticIntrinsicSize() {
        // Save the reference frame before attempting to modify this view's attributes
        if (this._requiredWidth === undefined) {
            this._acquireReferenceFrames();
        }

        this._resizeForAutomaticInstricSize();
    },

    /**
     * Invoked internally by CoreUI during the second phase of the layout process, after assigning
     * a width to each view.
     * Updates the internal height constraints of this view and all of its subviews to match the new intrinsic size.
     */
    _updateInternalHeightConstraints() {
        var size = this._getIntrinsicSize();

        if (size && this._heightCompressionConstraint) {
            this._heightCompressionConstraint.constant = size.height;
            this._heightExpansionConstraint.constant = size.height;
        }

        this._subviews.forEach(subview => subview._updateInternalHeightConstraints());
    },

    /**
     * Returns all the horizontal layout variables used by this view hierarchy.
     */
    get _horizontalLayoutVariables() { // <[kiwi.Variable]>
        var variables = [this._variables[BMLayoutAttribute.Left], this._variables[BMLayoutAttribute.Width]];

        this._subviews.forEach(subview => variables = variables.concat(subview._horizontalLayoutVariables));

        return variables;
    },


    /**
     * Returns all the vertical layout variables used by this view hierarchy.
     */
    get _verticalLayoutVariables() { // <[kiwi.Variable]>
        var variables = [this._variables[BMLayoutAttribute.Top], this._variables[BMLayoutAttribute.Height]];

        this._subviews.forEach(subview => variables = variables.concat(subview._verticalLayoutVariables));

        return variables;
    },

    // #endregion

    // #region Layout pass

    /**
     * Used internally.
     */
    _isPerformingLayoutPass: NO, // <Boolean>

    /**
     * Used internally.
     */
    _layoutAnimationFrameIdentifier: undefined, // <Number>

    /**
     * Cancels any pending layout passes and removes this view from its layout queue.
     */
    _cancelLayout() {
        this._layoutQueue._removeView(this);
        if (this._layoutAnimationFrameIdentifier) {
            window.cancelAnimationFrame(this._layoutAnimationFrameIdentifier);
        }
        this._layoutAnimationFrameIdentifier = undefined;
        this._layoutIntrisicSizeInvalidationIdentifier = undefined;
    },

    /**
     * Enqueues this view in its layout queue.
     */
    _registerLayout() {
        this._layoutQueue._enqueueView(this);
    },

    /**
     * Schedules a layout pass before the next animation frame.
     */
    async _scheduleLayout() {
        if (this != this.rootView) return this.rootView._scheduleLayout();
        if (this._layoutAnimator) {
            await this._layoutAnimator;
        }

        // If an immediate or regular layout pass was already pending, do nothing
        if (this._layoutAnimationFrameIdentifier || this._layoutIntrisicSizeInvalidationIdentifier) return;

        this._registerLayout();
        //_BMViewLayoutQueue.add(this);
        this._layoutAnimationFrameIdentifier = window.requestAnimationFrame(_ => {
            this._layoutAnimationFrameIdentifier = undefined;
            this._layoutQueue.dequeue();
            //_BMViewDequeueLayoutQueue();
            //this.layoutSubviews();
        });
    },

    /**
     * Used internally.
     */
    _layoutIntrisicSizeInvalidationIdentifier: undefined, // <Number>

    /**
     * Schedules a layout pass in response to an intrinsic size invalidation by this view or one of its subviews.
     * 
     * Unlike the regular layout invalidation performed by `_scheduleLayout`, CoreUI will attempt to process this
     * request before the next animation frame has a chance to render in order to avoid potential visual artifacts
     * that may occur when views' content change independent of their frames.
     */
    async _scheduleImmediateLayout() {
        if (this != this.rootView) return this.rootView._scheduleImmediateLayout();

        if (this._layoutAnimator) {
            await this._layoutAnimator;
        }

        // If a regular layout pass was pending, cancel it as the immediate layout will run faster
        if (this._layoutAnimationFrameIdentifier) {
            window.cancelAnimationFrame(this._layoutAnimationFrameIdentifier);
            this._layoutAnimationFrameIdentifier = undefined;
        }

        // If an immediate layout pass is already pending, do nothing
        if (this._layoutIntrisicSizeInvalidationIdentifier) return;
        this._layoutIntrisicSizeInvalidationIdentifier = BMUUIDMake();
        var identifier = this._layoutIntrisicSizeInvalidationIdentifier;

        this._registerLayout();

        // Await 0 will move this into the next event tick and should be faster than `window.postMessage` or `window.setTimeout`
        await 0;
        if (this._layoutIntrisicSizeInvalidationIdentifier && identifier == this._layoutIntrisicSizeInvalidationIdentifier) {
            this._layoutIntrisicSizeInvalidationIdentifier = undefined;
            this._layoutQueue.dequeue();
        }

        return;
        /*
        //_BMViewLayoutQueue.add(this);

        // A message is posted to this window to handle the invalidation immediately
        // The message is added to the end of the current event queue, so it performs faster than
        // setTimeout and similar to setImmediate
        let self = this;
        function handler(event) {
            // Don't handle messages that come from different view hierarchies
            if (event.data != self._layoutIntrisicSizeInvalidationIdentifier) return;

            self._layoutIntrisicSizeInvalidationIdentifier = undefined;
            self._layoutQueue.dequeue();
            //_BMViewDequeueLayoutQueue();
            //self.layoutSubviews();

            // Once the request is honored, the event handler is removed
            window.removeEventListener('message', handler);
            this._layoutIntrisicSizeInvalidationHandler = undefined;
        }
        this._layoutIntrisicSizeInvalidationHandler = handler;

        window.addEventListener('message', handler);
        window.postMessage(this._layoutIntrisicSizeInvalidationIdentifier, '*');
        */
    },

    layout: function() {
        return this.layoutIfNeeded();
    },

    /**
     * Should be invoked to perform an immediate layout pass on the view hierarchy to
     * which this view belongs, if this hierarchy's layout had been invalidated.
     * 
     * If this view's layout has not been invalidated, this method does nothing.
     */
    layoutIfNeeded: async function() {
        // Only the root view will handle the layout
        if (this != this.rootView) return this.rootView.layout();

        if (!this._needsLayout) return;

        if (this._layoutAnimator) {
            await this._layoutAnimator;
        }

        this._registerLayout();
        this._layoutQueue.dequeue();
        //_BMViewLayoutQueue.add(this);
        //_BMViewDequeueLayoutQueue();
        //this.layoutSubviews();
    },

    /**
     * @deprecated - Use `layoutIfNeeded()`
     * 
     * Should be invoked to perform an immediate layout pass on the view hierarchy to
     * which this view belongs.
     */
//  layout: undefined, // <Object>

    /**
     * @deprecated - Superseeded by `_layoutSubviewsGenerator`
     * 
     * Invoked by the layout engine to cause this view to layout its subviews.
     * This method should not be invoked manually to cause a layout pass, instead set the
     * <code>needsLayout</code> property to <code>YES</code> which will schedule a layout pass on the next run loop.
     * If an immediate layout pass is required, the <code>layout()</code> method should be invoked instead.
     * CoreUI will then invoke this method as needed.
     * 
     * The default implementation lays out subviews based on the constraints that have been added to the view hierarchy.
     */
    layoutSubviews() {
        // When run synchronously, the entire generator is run in one step
        let generator = this._layoutSubviewsGenerator();

        let done = NO;
        while (!done) {
            done = generator.next().done;
        }
    },


    /**
     * A generator that is used internally by CoreUI to layout subviews.
     */
    *_layoutSubviewsGenerator() {

        // Upon starting the layout pass, cancel all other pending layout passes
        // This is needed here because as of CoreUI 2.2 a layout pass request by one view hierarchy
        // can trigger a layout pass in a separate view hierarchy
        if (this._layoutAnimationFrameIdentifier) {
            window.cancelAnimationFrame(this._layoutAnimationFrameIdentifier);
            this._layoutAnimationFrameIdentifier = undefined;
        }

        if (this._layoutIntrisicSizeInvalidationIdentifier) {
            window.removeEventListener('message', this._layoutIntrisicSizeInvalidationHandler);
            this._layoutIntrisicSizeInvalidationHandler = undefined;
            this._layoutIntrisicSizeInvalidationIdentifier = undefined;
        }

        // If this view has been released or detached from the DOM while it had a pending layout pass request
        // cancel this layout operation
        if (!this._node || !this._node.parentNode) return;

        // Cancel this operation if this view has moved from the root of its hierarchy
        if (this.superview) return;

        if (BMViewDebug) console.log(`
        ***********************************************************************************************************
                                            [BMCoreUI] Layout pass began
        ***********************************************************************************************************
        `);

        // The layout process happens in two passes:

        // For the first pass, CoreUI asks views for their intrinsic sizes then uses that information
        // to compute the horizontal position and size for them
        // After assigning those, the views are asked for their intrinsic sizes again and a second
        // layout computation begins to compute vertical positions and sizes
        var activeConstraints = new Set();

        // If the size classes were invalidated, recompute them - this may potentially cause constraints to become invalidated
        if (this._invalidatedSizeClasses) {
            this._updateSizeClasses();
        }

        this._updateViewport();

        // Create a solver for the horizontal equations
        // Solvers are re-used unless the constraints have changed or this view is in edit mode
        var solver;
        let needsUpdatingConstraints = NO;
        if (!this._solver || this._layoutEditor || this._invalidatedConstraints) {
            solver = new kiwi.Solver();
            this._solver = solver;
            needsUpdatingConstraints = YES;

            // If the layout is currently being edited, discard all intrinsic sizes
            if (this._layoutEditor) {
                this.allSubviews.forEach(subview => subview._needsIntrinsicSizeMeasurement = YES);
            }

            this._invalidatedConstraints = NO;
        }
        else {
            solver = this._solver;
            needsUpdatingConstraints = NO;
        }

        this._prepareForAutomaticIntrinsicSize();
        // this._subviews.forEach(subview => {
        //     subview._prepareForAutomaticIntrinsicSize();
        // });

        // Suspend execution at this point to allow other views to update the DOM
        yield;

        // If a new solver has been created, initialize the active constraints and variables
        if (needsUpdatingConstraints) {
            this.activeConstraints.forEach(constraint => {
                activeConstraints.add(constraint);
            });

            // Also the internal and active constraints, temporarily suspending automatically attaching
            // constraints to view for this
            this.builtInConstraints.forEach(constraint => {
                activeConstraints.add(constraint);
            });

            // Add the horizontal variables to the solver
            this._horizontalLayoutVariables.forEach(variable => solver.addEditVariable(variable, kiwi.Strength.strong));

            // If the solver fails, this variable will contain the constraints that must be ignored for the layout pass to succeed
            /** @type {Object[]} */let constraintsToIgnore;
        
            // Feed it with the horizontal constraints
            while (YES) {
                // Create a list of attempted constraints to let the user know which constraints failed
                let lastConstraint;
                let attemptedConstraints = [];
                let attemptedCassowaryConstraints = [];
                try {
                    activeConstraints.forEach(constraint => {
                        // Skip constraints that have cause the equations to be unsolvable
                        if (constraintsToIgnore && constraintsToIgnore.includes(constraint)) return;

                        // Add each constraint's complete set of constituent constraints to the solver
                        if (constraint._kind === BMLayoutConstraintKind.Horizontal) {
                            lastConstraint = constraint;
                            attemptedConstraints.push(constraint);
                            if (BMViewDebug) console.log(`[BMCoreUI] Horizontal constraint: ${constraint}`);
                            constraint.constituentConstraints.forEach(constraint => {
                                constraint._constraint = undefined;
                                let cassowaryConstraint = constraint._cassowaryConstraint;
                                attemptedCassowaryConstraints.push(cassowaryConstraint);
                                solver.addConstraint(cassowaryConstraint);
                                constraint._solver = solver;
                            });
                        }
                    });
                    break;
                }
                catch (e) {

                    // If an error is thrown, attempt to re-do the layout by removing the offending constraint
                    console.error(`[BMCoreUI] Unsatisfiable constraints. The following constraints are not satisfiable and the
                                layout operation cannot be completed. Will attempt to solve the layout by breaking constraint 
                                ${lastConstraint}. Please check the following constraints at design-time to resolve the problem:\n`);

                    attemptedConstraints.forEach(constraint => {
                        console.error(`${constraint}`);
                    });

                    // At design-time, the process should stop in its tracks
                    if (this._layoutEditor) return;

                    constraintsToIgnore = constraintsToIgnore || [];
                    constraintsToIgnore.push(lastConstraint);
                    //lastConstraint.isActive = NO;

                    // Remove all previously attempted constraints and re-try
                    attemptedCassowaryConstraints.forEach(constraint => {
                        if (solver.hasConstraint(constraint)) solver.removeConstraint(constraint);
                    });

                    // TODO - verify

                    //return this.layoutSubviews();
                }
            }
        }
        else {
            // Otherwise just update the intrinsic sizing constraints as needed
            this.builtInConstraints || console.log();
        }

        // Suggest the origin point for the root view's position
        try {
            solver.suggestValue(this._variables[BMLayoutAttribute.Left], 0);
        }
        catch (e) {
            // If dual optimize fails, the intrinsic sizes lead to an unsolvable layout
            console.log(e);
        }

        let allSubviews = this.allSubviews;

        // Suggest values for the intrinsic sizes
        allSubviews.forEach(subview => {
            if (subview._widthCompressionConstraint) try {
                solver.suggestValue(subview._variables[BMLayoutAttribute.Width], subview._widthCompressionConstraint._constant);
            }
            catch (e) {
                // If dual optimize fails, the intrinsic sizes lead to an unsolvable layout
                console.log(e);
            }
        });

        // The solver is now prepared to update the variables
        solver.updateVariables();

        // Suspend at this point to allow other views to read the updated DOM
        yield;

        // When there are no subviews, assign the width and prepare the root view for automatic intrinsic size
        if (this.supportsAutomaticIntrinsicSize && !this._subviews.length) {
            this._assignWidth();
            this._prepareForAutomaticIntrinsicSize();
            this._updateInternalHeightConstraints();
        } else {
            this._subviews.forEach(subview => {
                // With the horizontal positions resolved, the assigned width should be set as required
                // for the subviews to update their intrinsic positions
                subview._assignWidth();
                // Because the width have been assigned, the reference frames will not be captured from within this method, therefore
                // layout thrashing should not occur when invoking this method separately on each subview
                subview._prepareForAutomaticIntrinsicSize();
                subview._updateInternalHeightConstraints();
            });
        }

        // Suspend at this point to allow other views to update the DOM
        yield;


        if (needsUpdatingConstraints) {
            // Add the horizontal variables to the solver
            this._verticalLayoutVariables.forEach(variable => solver.addEditVariable(variable, kiwi.Strength.strong));

            // If the solver fails, this variable will contain the constraints that must be ignored for the layout pass to succeed
            /** @type {Object[]} */let constraintsToIgnore;
        
            // Feed new solver with the vertical constraints
            while (YES) {
                // Create a list of attempted constraints to let the user know which constraints failed
                let lastConstraint;
                let attemptedCassowaryConstraints = [];
                let attemptedConstraints = [];
                try {
                    activeConstraints.forEach(constraint => {
                        // Skip constraints that have cause the equations to be unsolvable
                        if (constraintsToIgnore && constraintsToIgnore.includes(constraint)) return;

                        // Add each constraint's complete set of constituent constraints to the solver
                        lastConstraint = constraint;
                        attemptedConstraints.push(constraint);
                        if (constraint._kind === BMLayoutConstraintKind.Vertical) {
                            constraint.constituentConstraints.forEach(constraint => {
                                constraint._constraint = undefined;
                                let cassowaryConstraint = constraint._cassowaryConstraint;
                                attemptedCassowaryConstraints.push(cassowaryConstraint);
                                solver.addConstraint(cassowaryConstraint);
                                constraint._solver = solver;
                            });
                        }
                    });
                    break;
                }
                catch (e) {

                    // If an error is thrown, attempt to re-do the layout by removing the offending constraint
                    console.error(`[BMCoreUI] Unsatisfiable constraints. The following constraints are not satisfiable and the
                                layout operation cannot be completed. Will attempt to solve the layout by breaking constraint 
                                ${lastConstraint}. Please check the following constraints at design-time to resolve the problem:\n`);

                    attemptedConstraints.forEach(constraint => {
                        console.error(`${constraint}`);
                    });

                    // At design-time, the process should stop in its tracks
                    if (this._layoutEditor) return;

                    constraintsToIgnore = constraintsToIgnore || [];
                    constraintsToIgnore.push(lastConstraint);

                    // Remove all previously attempted constraints and re-try
                    attemptedCassowaryConstraints.forEach(constraint => {
                        if (solver.hasConstraint(constraint)) solver.removeConstraint(constraint);
                    });

                    // TODO - verify

                    //return this.layoutSubviews();
                }
            }
        }

        // Suggest the origin point for the root view's position
        try {
            solver.suggestValue(this._variables[BMLayoutAttribute.Top], 0);
        }
        catch (e) {
            // If dual optimize fails, the intrinsic sizes lead to an unsolable layout
            console.log(e);
        }

        // Suggest values for the intrinsic sizes
        allSubviews.forEach(subview => {
            if (subview._heightCompressionConstraint) try {
                solver.suggestValue(subview._variables[BMLayoutAttribute.Height], subview._heightCompressionConstraint._constant);
            }
            catch (e) {
                console.log(e);
            }
        });

        // The solver is now prepared to update the variables
        solver.updateVariables();

        // All variables should now be set. New frames can be created and applied to all views
        this.frame = BMRectMake(0, 0, this._variables[BMLayoutAttribute.Width].value() | 0, this._variables[BMLayoutAttribute.Height].value() | 0);
        this._needsIntrinsicSizeMeasurement = NO;

        if (this.supportsAutomaticIntrinsicSize && !this._subviews.length) {
            this._requiredWidth = undefined;
            this._needsLayout = NO;
            this._needsIntrinsicSizeMeasurement = NO;
        }
        else {
            this._subviews.forEach(subview => subview._updateFrames());
        }
        
        if (BMViewDebug) console.log(`
        ***********************************************************************************************************
                                            [BMCoreUI] Layout pass finished
        ***********************************************************************************************************
        `);

    },

    /**
     * Invoked by CoreUI at the end of the layout pass on the root view of a hierarchy to obtain the frame it should assign
     * to a descendant view.
     * 
     * The root view must provide a valid frame to assign to the view. The default implementation returns a frame that is the result
     * of the resolved layout equations.
     * 
     * Subclasses can override this method to provide different frames for descendants.
     * 
     * @param descendant <BMView>       The subview.
     * @return <BMRect>                 The frame to assign.
     */
    frameForDescendant(descendant) {
        // Only assign the frame if this view has opted into CoreUI layout and has a deterministic layout
        if ((descendant._constraints.length || descendant._internalConstraints.length) && descendant._hasDeterministicConstraints) {
            return BMRectMake(
                descendant._variables[BMLayoutAttribute.Left].value() | 0, 
                descendant._variables[BMLayoutAttribute.Top].value() | 0, 
                descendant._variables[BMLayoutAttribute.Width].value() | 0, 
                descendant._variables[BMLayoutAttribute.Height].value() | 0
            );
        }
        else {
            // Otherwise return to the reference frame
            return descendant._referenceFrame;
        }
    },

    /**
     * Invoked as the final step of the layout process. Extracts the result from the
     * Cassowary equation and creates the final frames for this view and all of its subviews.
     */
    _updateFrames() {
        // When the frame is assigned, the assigned width is cleared
        // to allow future intrinsic size calculations to work correctly
        this._requiredWidth = undefined;
        this._needsLayout = NO;
        this._needsIntrinsicSizeMeasurement = NO;

        this.frame = this.rootView.frameForDescendant(this);

        // Update the frames of subviews recursively as well
        this._subviews.forEach(subview => subview._updateFrames());
    },

    /**
     * A property indicating whether this view's layout is stale and the view should be laid out again.
     * 
     * Setting this property to <code>YES</code> will cause the superview managing this view's layout to recalculate the layout
     * during the next animation frame. Afterwards, this property will be reset to NO.
     * 
     * Setting this property to <code>NO</code> has no effect, however the value of this property may be used to determine whether
     * this view's layout needs to be recalculated.
     */
    _needsLayout: NO, // <Boolean>
    get needsLayout() {
        return this._needsLayout;
    },
    set needsLayout(needs) {
        this._needsLayout = needs;
        if (needs) {
            this.rootView._needsLayout = YES;
            this.rootView._scheduleLayout();
        }
    },

    // #endregion

    // #region Subview Management

    /**
     * The topmost superview managing the layout for this hierarchy. This may be this view itself.
     * Note that a view hierarchy may have several root views each managing their own local layouts.
     * A view may be both a root view for its own layout and a child view of another layout.
     */
    _rootView: undefined, // <BMView>
    get rootView() {
        var superview = this;
        while (superview) {
            if (!superview.superview) return superview;
            superview = superview.superview;
        }
    },

    /**
     * Returns <code>YES</code> if this view is a root view that manages the layout of its descendants.
     */
    get isRootView() { // <Boolean>
        return this.superview === undefined;
    },

    /**
     * The superview containing this view, if available.
     */
    _superview: undefined, // <BMView, nullable>
    get superview() {
        return this._superview;
    },

    /**
     * An array of views contained by this view.
     * You must not modify the array returned by this property.
     */
    _subviews: undefined, // <[BMView]>
    get subviews() {
        return this._subviews.slice();
    },

    /**
     * Makes this view a child of the given superview. The DOM node managed by this view will be moved to
     * the superview's <code>contentNode</code>.
     * If this view already has a superview, it will first be removed from its current superview.
     * @param superview <BMView>            The view which will become this view's superview.
     * {
     *  @param toPosition <Number, nullable>    Defaults to the last available position within the superview. The position
     *                                          in which to add this view to the superview. If this is specified
     *                                          CoreUI will add the view's node before the node of the
     *                                          view currently occupying that position.
     * }
     */
    addToSuperview(superview, args) {
        return superview.addSubview(this, args);
    },

    /**
     * Should be invoked to add a subview to this view's <code>contentNode</code>. If that subview
     * already has a superview, it will first be removed from its current superview.
     * @param subview <BMView>                  The subview to add.
     * {
     *  @param toPosition <Number, nullable>    Defaults to the last available position within this view. The position
     *                                          in which to add the given subview. If this is specified
     *                                          CoreUI will add the subview's node before the node of the
     *                                          view currently occupying that position.
     * }
     */
    addSubview(subview, args) {
        // If that subview is already added to this view, don't do anything else
        if (subview.superview == this) return;

        // Mark this view as a root view if it has no superview
        if (!this.superview) BMView._markAsRootView(this);

        // Mark the newly added view as a subview
        BMView._markAsNonRootView(subview);

        // Add the subview to the subviews array
        var position = args && args.toPosition;
        if (position === undefined) position = this._subviews.length;

        // The target view represents the view whose position the new subview
        // will occupy instead
        var targetView = this._subviews[position];

        this._subviews.splice(position, 0, subview);

        // Detach the subview from its superview if available
        if (subview.superview) subview.superview._detachSubview(subview);
        subview._superview = this;

        // Atach the subview's node to this view's content node
        if (targetView) {
            // If the target view is no longer part of the content node, insert the subview at the
            // target position with the DOM structure, if possible, otherwise default to inserting it
            // at the end of the content node's DOM structure
            if (targetView.node.parentNode != this.contentNode) {
                let targetNode = this.contentNode.children[position];
                if (targetNode) {
                    this.contentNode.insertBefore(subview.node, targetNode);
                }
                else {
                    this.contentNode.appendChild(subview.node);
                }
            }
            else {
                this.contentNode.insertBefore(subview.node, targetView.node);
            }
        }
        else {
            if (subview.node.parentNode != this.contentNode) {
                this.contentNode.appendChild(subview.node);
            }
        }

        // Invalidate the root view's constraints
        const rootView = this.rootView;
        rootView._invalidatedConstraints = YES;
        rootView._invalidatedSizeClasses = YES;
        rootView.needsLayout = YES;
    },

    /**
     * Removes the given subview from this view. Invoking this method has no effect
     * if the given view is not a subview of this view.
     * The view's DOM node will also be detached from the document if it is a direct descendant of this view's `contentNode`.
     * @param subview <BMView>          The view to remove.
     */
    removeSubview(subview) {
        var index = this._subviews.indexOf(subview);
        if (index != -1) {
            this._subviews.splice(index, 1);
            if (subview._node.parentNode == this.contentNode) {
                subview._node.remove();
            }
            subview._superview = undefined;

            // Because constraints are duplicated for both the target and source views, this method only needs to be invoked once
            // to clear out constraints for both view hierarchies
            this._removeInvalidConstraints();

            // If this view no longer contains any subviews, remove it from the superview map
            if (!this._subviews.length) BMView._markAsNonRootView(this);

            // Make the newly detached subview a root view if it has subviews
            if (subview._subviews.length) BMView._markAsRootView(subview);

            // Invalidate the root view's constraints
            const rootView = this.rootView;
            rootView._invalidatedConstraints = YES;
            rootView._invalidatedSizeClasses = YES;
            rootView.needsLayout = YES;
        }

    },

    /**
     * Removes this given subview from its superview. Invoking this method has no effect
     * if the given view does not have a superview.
     * The view's DOM node will also be detached from the document if it is a direct descendant of the superview's `contentNode`.
     */
    removeFromSuperview() {
        if (this._superview) {
            this._superview.removeSubview(this);
        }
    },

    /**
     * Returns `YES` if this view is a descendant of the given view, `NO` otherwise.
     * @param view <BMView>             The parent view.
     * @return <Boolean>                `YES` if this view is a descendant of the given view, `NO` otherwise.
     */
    isDescendantOfView(view) {
        let superview = this.superview;
        while (superview) {
            if (superview == view) return YES;
            superview = superview.superview;
        }

        return NO;
    },

    /**
     * Invoked by CoreUI after a view is removed from its superview to remove constraints affecting views that are no longer part of the
     * same view hierarchy.
     */
    _removeInvalidConstraints() {
        let constraints = new Set;

        // Filter out the constraints to remove duplicates
        this.activeConstraints.forEach(constraint => {
            constraints.add(constraint);
        });

        constraints.forEach(constraint => {
            if (constraint.isConstraintCollection) {
                // For constraint collections, remove them whenever any of their constituent constraints affect two views
                // that are no longer part of the same view hierarchy
                for (let constituentConstraint of constraint.constituentConstraints) {
                    if (constituentConstraint._targetView && constituentConstraint._sourceView.rootView != constituentConstraint._targetView.rootView) {
                        constraint.remove();
                        break;
                    }
                }
            }
            else {
                // Remove those constraints that affect two views that are now part of different view hierarchies
                if (constraint._targetView && constraint._sourceView.rootView != constraint._targetView.rootView) {
                    constraint.remove();
                }
            }
        });
    },

    /**
     * Invoked internally by CoreUI when the given subview is about to move to a different superview.
     * Removes the subview from this view, but does not detach its DOM node from the document.
     * @param subview <BMView>              The subview to detach.
     */
    _detachSubview(subview) {
        var index = this._subviews.indexOf(subview);
        if (index != -1) {
            this._subviews.splice(index, 1);
        }
    },

    /**
     * Returns a flat array containg all of the views within this view hierarchy.
     */
    get allSubviews() { // <[BMView]>
        let result = [this];

        this._subviews.forEach(subview => result = result.concat(subview.allSubviews));

        return result;
    },

    // #endregion

    // #region Cloning

    /**
     * Prepares this view hierarchy for cloning.
     */
    _prepareForCloning() {
        this._BMTempID = BMUUIDMake();
        this._BMOriginalID = this.node.id;

        this.node.id = this._BMTempID;

        this._subviews.each(subview => subview._prepareForCloning());
    },

    /**
     * Returns a clone of this view hierarchy and its constraints.
     * @return <BMView>     A clone of this view.
     */
    _clone() {
        this._prepareForCloning();

        let clonedNode = this.node.cloneNode(YES);

        let clone = this._cloneForNode(clonedNode);
    },

    /**
     * Returns a clone of this view initialized to the given
     * node.
     * @param node <DOMNode>                        The cloned node corresponding to this view.
     * {
     *  @param superview <BMView, nullable>         The clone of this view's superview, if there is one.
     * }
     * @return <BMView>                             A view.
     */
    _cloneForNode(clonedNode, args) {
        let clone = BMView.viewForNode.call(this.constructor, clonedNode);
        clone._BMOriginalView = this;

        // Restore the node's original ID
        this.node.id = this._BMOriginalID;
    },

    // #endregion

    // #region Layout Editor

    /**
     * When this view is edited by a layout editor, this method will be invoked when constructing the settings panel for this view.
     * View subclasses can override this method to provide additional tabs to add to this view's settings panel.
     * 
     * Subclasses should not add setting sections through this method. After this method returns, the layout editor will subsequently
     * invoke `additionalSettingSectionsForTab(_, {layoutEditor})` for each standard tab as well as each tab that has been returned by this method.
     * 
     * The default implementation returns an empty array.
     * @param editor <BMLayoutEditor>           The caller.
     * @return <[BMLayoutEditorSettingsTab]>    An array of settings tabs to add.
     */
    additionalSettingTabsForLayoutEditor(editor) {
        return [];
    },

    /**
     * When this view is edited by a layout editor, this method will be invoked when constructing the settings panel for this view.
     * This method will also be invoked whenever the settings for the given tab have been invalidated.
     * View subclasses can override this method to provide additional settings to specific tabs.
     * 
     * The default implementation returns an empty array for all tabs.
     * @param tab <BMLayoutEditorSettingsTab>       The tab for which to supply additional settings.
     * {
     *  @param layoutEditor <BMLayoutEditor>         The caller.
     * }
     * @return <[BMLayoutEditorSettingsSection]>    An array of settings tabs to add.
     */
    additionalSettingSectionsForTab(tab, {layoutEditor}) {
        return [];
    }

    // #endregion

});

// @endtype
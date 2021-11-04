// @ts-check

import {YES, NO,  BMNumberByInterpolatingNumbersWithFraction, BMCopyProperties} from './BMCoreUI'
import {BMFunctionCollectionMake} from './BMFunctionCollection'
import 'velocity-animate'


// When set to YES, this will cause animation contexts to use Velocity.js 2 as their animation engine
export const BM_USE_VELOCITY2 = NO;
// When set to YES, this will cause animation contexts to use the web animations api as their animation engine whenever possible
export var BM_USE_WEB_ANIMATIONS = NO;

/*
****************************************************************************************************************************************************************
																		Animations
****************************************************************************************************************************************************************
*/



// @type BMAnimationSubscriber

/**
 * An animation subscriber is used with animation contexts when multiple animation properties should be batched for the same animation target.<br/><br/>
 * There is no constructor or prototype for animation subscribers. Instead, they may be any object that conforms to the subscriber specification.
 */
//function BMAnimationSubscriber() {} // <constructor>

// BMAnimationSubscriber.prototype = {
	
	/**
	 * This method is invoked by animation context
	 */
	// applyForContext: function(context) {
	
// }

// @endtype

// @type BMAnimationController

/**
 * A decorator that may be applied to properties to make them animatable using CoreUI.
 * This decorator should be applied to properties whose type is a class that implements <code>BMAnimating</code>.
 * When a property marked animatable is changed while an animation context is active, an animation will
 * be registered to run for that property. Classes using this decorator must have a <code>node</code> property that
 * returns the DOM node on which animations run.
 * 
 * The property extended by this decorator must have a setter defined for it.
 * 
 * Using this decorator will cause your class to gain a private underscore-prefixed version
 * of the target property that will be used by CoreUI for storage, unless you also define
 * a getter for the property.
 * @param target <Object>			The target object.
 * @param key <String>				The property to which this decorator will apply.
 * @param descriptor <Object>		The property descriptor of the target property.
 */
export function BMAnimatable(target, key, descriptor) {

	if (!descriptor.set) throw new Error('[BMCoreUI] Incorrectly applied BMAnimatable to property ' + key + ' that doesn\'t have a setter');

	if (!descriptor.get) {
		descriptor.get = function () { return this['_' + key]; };

		var oldSet = descriptor.set;
		descriptor.set = function (value) {
			if (BMAnimationContextGetCurrent()) {
				let controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this.node || document.body});
				controller.registerAnimatableProperty(key, {targetValue: value.copy(), startingValue: this[key].copy()});
			}
			else {
				oldSet.call(this, value);
				this['_' + key] = value.copy();
			}
		}
	}
	else {
		var oldSet = descriptor.set;
		descriptor.set = function (value) {
			if (BMAnimationContextGetCurrent()) {
				let controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this.node || document.body});
				controller.registerAnimatableProperty(key, {targetValue: value.copy(), startingValue: this[key].copy()});
			}
			else {
				oldSet.call(this, value);
			}
		}
	}

}

/**
 * A decorator that may be applied to properties to make them animatable using CoreUI.
 * This decorator should be applied to properties whose type is a number.
 * When a property marked animatable is changed while an animation context is active, an animation will
 * be registered to run for that property. Classes using this decorator must have a <code>node</code> property that
 * returns the DOM node on which animations run.
 * 
 * The property extended by this decorator must have a setter defined for it.
 * 
 * Using this decorator will cause your class to gain a private underscore-prefixed version
 * of the target property that will be used by CoreUI for storage, unless you also define
 * a getter for the property.
 * @param target <Object>			The target object.
 * @param key <String>				The property to which this decorator will apply.
 * @param descriptor <Object>		The property descriptor of the target property.
 */
export function BMAnimatableNumber(target, key, descriptor) {

	if (!descriptor.set) throw new Error('[BMCoreUI] Incorrectly applied BMAnimatable to property ' + key + ' that doesn\'t have a setter');

	if (!descriptor.get) {
		descriptor.get = function () { return this['_' + key]; };

		var oldSet = descriptor.set;
		descriptor.set = function (value) {
			if (BMAnimationContextGetCurrent()) {
				let controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this.node || document.body});
				controller.registerOwnProperty(key, {targetValue: value, startingValue: this[key] || 0});
			}
			else {
				oldSet.call(this, value);
				this['_' + key] = value;
			}
		}
	}
	else {
		var oldSet = descriptor.set;
		descriptor.set = function (value) {
			if (BMAnimationContextGetCurrent()) {
				let controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this.node || document.body});
				controller.registerOwnProperty(key, {targetValue: value, startingValue: this[key] || 0});
			}
			else {
				oldSet.call(this, value);
			}
		}
	}

}

/**
 * An animation controller is an object that makes it easier to integrate custom properties with the animation engine.
 * 
 * Animation controllers are never created explicitly, instead all animation contexts provide a method that creates
 * an animation controller for an object. After retrieving an animation controller, you may use it to register either regular
 * CSS/transform properties or custom properties with an update handler.
 * To retrieve an animation controller for an object, invoke the `controllerForObject(_)` method on the active animation context,
 * passing in the caller object as the parameter. If a previous animation controller was already retrieved for that object, the
 * method will return that existing instance already.
 * 
 * Besides the animation controller, in supported environments you may annotate your properties with the
 * <code>@BMAnimatable</code> or <code>@BMAnimatableNumber</code> decorators. For properties annotated in this way,
 * CoreUI automatically handles checking for animation conexts, retrieving animation controllers and setting up
 * progress handlers.
 */
export function BMAnimationController() {} // <constructor>

BMAnimationController.prototype = {

	/**
	 * The animation context to which this animation controller applies.
	 */
	_animation: undefined, // <BMAnimationContext>

	/**
	 * The object for which this animation controller was created.
	 */
	_owner: undefined, // <AnyObject>

	/**
	 * The DOM node on which the animation will run.
	 */
	_node: undefined, // <DOMNode>

	/**
	 * A promise that resolves when the animation initiated by this controller finishes.
	 */
	_promise: undefined, // <Promise<Void>>

	get promise() {
		return this._promise;
	},

	/**
	 * Used internally to resolve the promise used by this controller.
	 */
	_resolve: undefined, // <Function>

	/**
	 * An object containing the properties that are registered to this animation controller.
	 * For standard properties, the key name is the property name and its value is the usual
	 * `Velocity.js` value.
	 * For custom properties, a single `tween` property is created whose value is another object where
	 * its keys are the names of the custom properties and their values are functions that control what
	 * happens when the property value is updated.
	 */
	_properties: undefined, // <Object<String, AnyObject>>

	/**
	 * Initializes this animation controller with the given owner and animation context.
	 * @param animation <BMAnimationContext>			The animation context to which this controller will apply.
	 * {
	 * 	@param owner <AnyObject>						The object to which this animation controller is associated.
	 * 	@param node <DOMNode>							The DOM node upon which the animation will run.
	 * }
	 * @return <BMAnimationController>					This animation controller.
	 */
	initWithAnimation(animation, args) {
		this._animation = animation;
		this._owner = args.owner;
		this._node = args.node;
		this._properties = {};
		this._promise = new Promise(resolve => this._resolve = resolve);
		return this;
	},

	/**
	 * Registers an animation that will run on the given standard CSS or transform property.
	 * @param property <String>				The name of the property.
	 * {
	 * 	@param withValue <AnyObject>		The value to which the property's value will animate or any of Velocity's animation syntaxes.
	 * }
	 */
	registerBuiltInProperty(property, args) {
		this._properties[property] = args.withValue;
	},

	/**
	 * Registers an animation that will run on the given standard CSS or transform properties.
	 * @param properties <Dictionary<AnyObject>>		A dictionary whose keys are property names and their values
	 * 													are the values to which each property will animate.
	 */
	registerBuiltInPropertiesWithDictionary(properties) {
		for (let key in properties) this.registerBuiltInProperty(key, {withValue: properties[key]});
	},

	/**
	 * Registers an animation that will run on the given custom property.
	 * @param property <String>				The name of the custom property.
	 * {
	 * 	@param withHandler <void ^(number, number)>		
	 * 										A handler that is invoked on each animation frame, where the developer should perform their changes.
	 * 										This handler is passed the following parameters:
	 * 										* __fraction__: <Number> 		- The animation completion percentage. This will typically be a number between 0 and 1,
	 * 																			however for animations that overshoot or undershoot their values, this completion
	 * 																			fraction may surpass those values as well.
	 * 										* __value__: <Number, nullable> - Supplied if the property was registered with a starting and ending value.
	 * 																			Represents the current interpolated value.
	 * 	@param startingValue <Number, nullable>		An optional starting value from which the property will animate.
	 * 												If this argument is specified, `targetValue` should also be specified.
	 * 	@param targetValue <Number, nullable>		An optional ending value to which the property will animate.
	 * 												If this argument is specified, `startingValue` should also be specified.
	 * }
	 */
	registerCustomProperty(property, args) {
		if (!this._properties.tween) this._properties.tween = {};

		if (BM_USE_WEB_ANIMATIONS) console.warn(`[BMAnimationController] Registering custom property ${property} with handler ${args.withHandler} which will run in legacy mode.`);

		this._properties.tween[property] = {
			handler: args.withHandler,
			startingValue: args.startingValue,
			targetValue: args.targetValue,
			BMAnimatable: NO
		}
	},

	/**
	 * Registers an animation that will run on one of the target object's own properties.
	 * @param property <String>						The name of the custom property.
	 * {
	 * 	@param targetValue <Number>					The value to which this property will animate.
	 * 	@param startingValue <Number, nullable>		Defaults to the property's value at the time when the animation begins.
	 * 												An optional starting value from which the property will animate.
	 * }
	 */
	registerOwnProperty(property, args) {
		if (!this._properties.tween) this._properties.tween = {};

		if (BM_USE_WEB_ANIMATIONS) console.warn(`[BMAnimationController] Registering own property ${property} which will run in legacy mode.`);

		var self = this;

		this._properties.tween[property] = {
			handler: (fraction, value) => {
				self._owner[property] = value;
			},
			startingValue: args.startingValue,
			targetValue: args.targetValue,
			name: property,
			BMAnimatable: NO
		}
	},

	/**
	 * Registers an animation that will run on one of the target object's own properties.
	 * @param property <String>						The name of the custom property.
	 * {
	 * 	@param targetValue <BMAnimating>					The value to which this property will animate.
	 * 	@param startingValue <BMAnimating, nullable>		Defaults to the property's value at the time when the animation begins.
	 * 														An optional starting value from which the property will animate.
	 * }
	 */
	registerAnimatableProperty(property, args) {
		if (!this._properties.tween) this._properties.tween = {};

		if (BM_USE_WEB_ANIMATIONS) console.warn(`[BMAnimationController] Registering animatable property ${property} which will run in legacy mode.`);

		var self = this;

		this._properties.tween[property] = {
			// For types that implement BMAnimating, CoreUI will handle the interpolation
			handler: (fraction, value) => {
				self._owner[property] = value;
			},
			startingValue: args.startingValue,
			targetValue: args.targetValue,
			name: property,
			BMAnimatable: YES
		}
	},

	// @override - BMAnimationSubscriber
	apply(animation) {
		// All properties other than tween use the default Velocity.js value types
		this._options = {
			complete: () => {
				this._resolve();
			}
		};

		if ('tween' in this._properties) {

			// Tween is converted into a single property, with the progress handler taking care of
			// actually applying the properties
			var value = this._properties.tween;
			this._properties.tween = [1, 0];

			var self = this;
			var progressHandler = BMFunctionCollectionMake();
			Object.getOwnPropertyNames(value).forEach((key) => {
				var property = value[key];
				if (!property.name) {
					if (typeof property.startingValue == 'number' && typeof property.targetValue == 'number') {
						progressHandler.push((elements, complete, remaining, start, fraction) => {
							property.handler(fraction, BMNumberByInterpolatingNumbersWithFraction(property.startingValue, property.targetValue, fraction));
						});
					}
					else {
						progressHandler.push((elements, complete, remaining, start, fraction) => {
							property.handler(fraction);
						});
					}
				}
				else if (property.BMAnimatable) {
					var startingValue = property.startingValue;
					if (!startingValue) {
						startingValue = self._owner[property.name].copy();
					}
					progressHandler.push((elements, complete, remaining, start, fraction) => {
						property.handler(fraction, startingValue.interpolatedValueWithFraction(fraction, {toValue: property.targetValue}));
					});
				}
				else {
					var startingValue = property.startingValue;
					if (startingValue === undefined) {
						startingValue = self._owner[property.name];
					}
					progressHandler.push((elements, complete, remaining, start, fraction) => {
						property.handler(fraction, BMNumberByInterpolatingNumbersWithFraction(startingValue, property.targetValue, fraction));
					});
				}
			});

			this._options.progress = progressHandler;
		}

		animation.targets.push({element: this._node, properties: this._properties, options: this._options});
	}

};

// @endtype

// @type interface BMAnimationTarget

/**
 * This interface represents an object that specifies a portion of an animation.
 */
// function BMAnimationTarget() {} // <constructor>

// {

	/**
	 * The jQuery element that will be affected by this animation.
	 */
// element: undefined, // <$>

	/**
	 * A dictionary of properties that will be changed by the animation.
	 */
// properties: undefined, // <Dictionary<any>>

	/**
	 * An optional map of options that will override the animation context's options.
	 */
// options: undefined, // <Dictionary<any>, nullable>

// }

// @endtype


// @type BMAnimationEasing extends String

/**
 * An enum containing predefined easings. These all resolve to bezier curves that are compatible
 * with the Web Animations API.
 */
const BMAnimationEasing = Object.freeze({ // <enum>
	ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
	easeIn: "cubic-bezier(0.42, 0, 1, 1)",
	easeOut: "cubic-bezier(0, 0, 0.58, 1)",
	easeInOut: "cubic-bezier(0.42, 0, 0.58, 1)",
	easeInSine: "cubic-bezier(0.47, 0, 0.745, 0.715)",
	easeOutSine: "cubic-bezier(0.39, 0.575, 0.565, 1)",
	easeInOutSine: "cubic-bezier(0.445, 0.05, 0.55, 0.95)",
	easeInQuad: "cubic-bezier(0.55, 0.085, 0.68, 0.53)",
	easeOutQuad: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
	easeInOutQuad: "cubic-bezier(0.455, 0.03, 0.515, 0.955)",
	easeInCubic: "cubic-bezier(0.55, 0.055, 0.675, 0.19)",
	easeOutCubic: "cubic-bezier(0.215, 0.61, 0.355, 1)",
	easeInOutCubic: "cubic-bezier(0.645, 0.045, 0.355, 1)",
	easeInQuart: "cubic-bezier(0.895, 0.03, 0.685, 0.22)",
	easeOutQuart: "cubic-bezier(0.165, 0.84, 0.44, 1)",
	easeInOutQuart: "cubic-bezier(0.77, 0, 0.175, 1)",
	easeInQuint: "cubic-bezier(0.755, 0.05, 0.855, 0.06)",
	easeOutQuint: "cubic-bezier(0.23, 1, 0.32, 1)",
	easeInOutQuint: "cubic-bezier(0.86, 0, 0.07, 1)",
	easeInExpo: "cubic-bezier(0.95, 0.05, 0.795, 0.035)",
	easeOutExpo: "cubic-bezier(0.19, 1, 0.22, 1)",
	easeInOutExpo: "cubic-bezier(1, 0, 0, 1)",
	easeInCirc: "cubic-bezier(0.6, 0.04, 0.98, 0.335)",
	easeOutCirc: "cubic-bezier(0.075, 0.82, 0.165, 1)",
	easeInOutCirc: "cubic-bezier(0.785, 0.135, 0.15, 0.86)"
});

// @endtype

// These values are used to combine transform properties into a single transform string
/* @private */ const BMAnimationTransformPropertyDefaults = Object.freeze({
	scaleX: 1,
	scaleY: 1,
	scaleZ: 1,
	rotate: 0,
	rotateX: 0,
	rotateY: 0,
	rotateZ: 0,
	skewX: 0,
	skewY: 0,
	skewZ: 0,
	translateZ: 0,
	translateX: 0,
	translateY: 0
});

// These values are used to combine filter properties into a single filter string
/* @private */ const BMAnimationFilterPropertyDefaults = Object.freeze({
	blur: 1,
	brightness: 1,
	contrast: 1,
	'drop-shadow': 0,
	grayscale: 0,
	'hue-rotate': 0,
	invert: 0,
	saturate: 0,
	sepia: 0
});

// Convenience method used in converting from velocity calls to BMAnimationContext - only used internally.
// This uses almost the same syntax as velocity js but supports some of the features of BMAnimationContext, such as using web animations.
export function __BMVelocityAnimate(node, properties, options, useWebAnimations) {
	return BMAnimateWithBlock(() => {
		let controller = BMAnimationContextGetCurrent().controllerForObject(node, {node: node});
		controller.registerBuiltInPropertiesWithDictionary(properties);

		if (useWebAnimations) BMAnimationContextEnableWebAnimations();
	}, options);
}

// @type BMAnimationContext

/**
 * Allows using <code>$.Velocity.hook</code> by passing in a key-value object similar to `$.fn.css`.
 * @param element <$ or DOMNode>        The jQuery element or DOM node on which to apply the properties.
 * @param properties <Object>   		The properties map.
 */
export function BMHook(element, properties) {
	if (BM_USE_VELOCITY2) {
		let node = element;
		if (element instanceof window.$) {
			node = element[0];
		}

		// In Velocity 2.0 mode, transforms are no longer supported as individual properties and old .hook() function is gone
		// In this case, use the same principle as web animations, combining transform and filter properties and applying them
		// as standard CSS properties
		let webAnimationProperties = {};

		let transformProperty = '';
		for (let key in properties) {
			if (key in BMAnimationTransformPropertyDefaults) {
				transformProperty += `${key}(${properties[key]}) `;
			}
			else {
				webAnimationProperties[key] = properties[key];
			}
		}
		if (transformProperty) webAnimationProperties.transform = transformProperty;

		let filterProperty = '';
		for (let key in properties) {
			if (key in BMAnimationFilterPropertyDefaults) {
				filterProperty += `${key}(${properties[key]}) `;
			}
		}
		if (filterProperty) webAnimationProperties.filter = filterProperty;

		BMCopyProperties(node.style, webAnimationProperties);
	}
	else {
		for (var key in properties) {
			(window.Velocity || $.Velocity).hook(element, key, properties[key]);
		}
	}
}

/**
 * An animation context manages the options and animated elements for an animation.
 * Animation contexts are never created explicitly, instead they are created and activated in the background by
 * <code>BMAnimationBeginWithDuration()</code> or <code>BMAnimateWithBlock()</code>.
 * 
 * While there is an active animation context, changing compatible properties will be done through an animation, using
 * that context's animation options.
 * 
 * To support animating with animation contexts, the current animation context may be retrieved by invoking the global <code>BMAnimationContextGetCurrent()</code>
 * function. This will return the current animation context if one is active. That context may be used to register animations in response to property changes.
 */
export function BMAnimationContext() { // <constructor>
	throw new Error("Animation contexts may not be created manually. To create an animation context, invoke the BMAnimationBeginWithDuration() function.");
}

BMAnimationContext.prototype = {
	
	/**
	 * @private
	 * The animation options for this context.
	 */
	options: {}, // <Object>
	
	/**
	 * @private
	 * A map containing the callbacks for animations that are registered and should be applied when this animation begins.
	 * The keys in this map may be any type of object and their values must be objects that contain the <code>apply</code> method which will
	 * be invoked when this animation is about to begin.
	 */
	subscribers: undefined, // <Map<AnyObject, BMAnimationSubscriber>>

	/**
	 * Returns an animation controller for the given object. If an animation controller was previously requested
	 * for this object for this animation, this method will return that previously created controller.
	 * @param object <AnyObject>		The object which will make use of the animation controller.
	 * {
	 * 	@param node <DOMNode>			The node upon which the animation will run.
	 * }
	 * @return <BMAnimationController>	An animation controller.
	 */
	controllerForObject(object, args) {
		// Get the current subscriber for this object
		let subscriber = this.subscribers.get(object);

		if (!subscriber) {
			// If one isn't available, create it and associate it to this object
			subscriber = Object.create(BMAnimationController.prototype).initWithAnimation(this, {owner: object, node: args.node});
			this.subscribers.set(object, subscriber);
		}

		return subscriber;
	},
	
	/**
	 * @private
	 * An array containing the animation targets for the current context.
	 * An animation target is an object with the following three properties:
	 * <ul>
	 * <li>element &lt;$&gt;: 					The jQuery node to which the animation should be applied.</li>
	 * <li>properties &lt;Object&gt;: 			An object containing the node properties which will be animated.</li>
	 * <li>options &lt;Object&gt;: 				An optional object containing animation property overrides.</li>
	 * </ul>
	 */
	targets: undefined, // <[BMAnimationTarget]>
	
	/**
	 * Should be invoked to register an animation that will run when this animation context is started.
	 * @param target <$ or DOMNode>							The DOM node or jQuery wrapper on which this animation will run.
	 * {
	 *	@param properties <Object<String, AnyObject>>		An object describing the properties that will be changed by this animation.
	 *														This object has the same format as the Velocity.js property object.
	 *	@param options <nullable Object<String, AnyObject>>	An optional object describing the animation options that this particular animation should use.
	 *														Specifying this parameter will cause the animation context's animation options to be overriden for this animation.
	 * }
	 */
	registerAnimationForTarget: function(target, args) {
		this.targets.push({
			element: target,
			properties: args.properties,
			options: args.options
		});
	},
	
	registerSubscriber: function(subscriber, args) {
		
	}
	
}

/**
 * The animation stack holds all animations with their attributes.
 * Whenever an attribute property is changed while there is an active animation, that property
 * will smoothly interpolate to the new value using the top-most animation's attributes.
 */
var _BMAnimationStack = []; // <[BMAnimationContext]>

/**
 * Retrieves the currently active animation context, if there is one.
 * @return <BMAnimationContext, nullable>		The current animation context if there is one, `undefined` otherwise or if the current animation context
 * 												is static.
 */
export function BMAnimationContextGetCurrent() {
	let context = _BMAnimationStack[_BMAnimationStack.length - 1];

	if (context && context._isDisabled) {
		return;
	}
	else {
		return context;
	}
}

/**
 * Causes the current animation context to run in web animations mode, if available.
 * If no animation context is currently active, this method does nothing.
 */
export function BMAnimationContextEnableWebAnimations() {
	let context = BMAnimationContextGetCurrent();
	if (context) context._useWebAnimations = YES;
}

/**
 * Should be invoked to start a new static attribute animation.
 * A static animation context supresses any existing animation context, causing property updates while it is active to not be animated.
 * While a static animation context is active, `BMAnimationContextGetCurrent()` returns `undefined`.
 * 
 * Like with regular animation contexts, static contexts must be applied via `BMAnimationApply()` or `BMAnimationApplyBlocking(_)`.
 */
export function BMAnimationContextBeginStatic() {

	var animationContext = Object.create(BMAnimationContext.prototype);
    
    animationContext.options = {duration: 0, easing: 'linear'};
	animationContext.targets = [];
	animationContext._isDisabled = YES;
    // The subscribers property is used internally by cells and views that need to interact with the animation before it is applied
    // It is a map of objects where cells and views add themselves as keys with arbitrary values.
    // The subscriber value objects however must contain an 'apply()' method; this method will be invoked by the animation when it is about to be applied.
    animationContext.subscribers = new Map();

    _BMAnimationStack.push(animationContext);
    
	return animationContext;
	
}


// @param easing <Multiple Types>      The animation's easing, using any of Velocity.js supported easing formats.
// @param ... <>						Additional Velocity.js parameters

/**
 * Should be invoked to start a new attribute animation.
 * After this call, you should assign the new values to the attributes you want to animate
 * and finally call <code>BMAnimationApply()</code> to start the animations.
 * You may call <code>BMAnimationBeginWithDuration()</code> multiple times in a row to set up multiple animations, but each call must be balanced
 * by calling <code>BMAnimationApply()</code>.
 * @param duration <Int>                The animation's duration, in milliseconds.
 * @param options <Object, nullable>    An object of animation attributes. This object is optional and contains the same keys and values as Velocity.js's animation options object.
 *                                      This object should not be modified afterwards until this animation is applied.
 * @return <BMAnimationContext>			The animation context associated with the new animation.
 */
export function BMAnimationBeginWithDuration(duration, options) {
    options = options || {};
    options.duration = duration;

	var animationContext = Object.create(BMAnimationContext.prototype);
    
	animationContext.options = options;
    animationContext.targets = [];
    // The subscribers property is used internally by cells and views that need to interact with the animation before it is applied
    // It is a map of objects where cells and views add themselves as keys with arbitrary values.
    // The subscriber value objects however must contain an 'apply()' method; this method will be invoked by the animation when it is about to be applied.
    animationContext.subscribers = new Map();

	_BMAnimationStack.push(animationContext);
    
    return animationContext;
}

/**
 * Registers a completion handler that will fire when the current animation context has finished running its animation.
 * If there is no current animation context or if the current animation context is static, the provided completion handler will
 * execute synchronously before this method returns.
 * @param handler <void ^()>			The handler to invoke.
 */
export function BMAnimationContextAddCompletionHandler(handler) {
	let context;
	if (context = BMAnimationContextGetCurrent()) {
		if (context.options.complete) {
			if (context.options.complete._isFunctionCollection) {
				context.options.complete.push(handler);
			}
			else {
				let functionCollection = BMFunctionCollectionMake();
				functionCollection.push(context.options.complete);
				functionCollection.push(handler);
				context.options.complete = functionCollection;
			}
		}
		else {
			context.options.complete = BMFunctionCollectionMake();
			context.options.complete.push(handler);
		}
	}
	else {
		handler();
	}
}

/**
 * Must be invoked after a <code>BMAnimationBeginWithDuration()</code> call to apply the pending animation.
 * @return <Promise<void>>					A promise that resolves when the animation completes.
 */
export function BMAnimationApply() {
	return BMAnimationApplyBlocking(NO);
}

// Set to `YES` if the environment does not fully support web animations
var BM_WEB_ANIMATIONS_DISABLED = NO;

/**
 * Must be invoked after a <code>BMAnimationBeginWithDuration()</code> call to apply the pending animation.
 * Applying the animation in this way will stop all other running animations on the animation targets.
 * @param blocking <Boolean, nullable>	Defaults to `YES`. If set to `YES`, the animation will be blocking, otherwise it will be scheduled.
 *										A blocking animation will cancel all other animations currently running on any of the target elements.
 * @return <Promise<void>>				A promise that resolves when the animation completes.
 */
export function BMAnimationApplyBlocking(blocking) {
	// If the current context is static, pop it allowing other animation contexts to run
	let context = _BMAnimationStack[_BMAnimationStack.length - 1];
	if (!context) {
		console.error('Attempted to apply an animation while there was no animation context active. This method call will be ignored.');
		return Promise.resolve(void 0);
	}
	if (context._isDisabled) {
		_BMAnimationStack.pop();
		return Promise.resolve(void 0);
	}

	if (blocking === undefined) blocking = YES;
	
	// Give the subscribers a chance to modify the animation prior to it actually being applied
    new Map(BMAnimationContextGetCurrent().subscribers).forEach(function (value, key, map) {
        value.prepare && value.prepare(animation);
    });
    
    var animation = _BMAnimationStack.pop();
    var animationTargets = animation.targets;

    // Notify the subscribers that the animation is about to be applied
    var animationSubscribers = animation.subscribers;
    animationSubscribers.forEach(function (value, key, map) {
        value.apply(animation);
    });
    
    // The complete callback should only be invoked once
    // when the last element finishes animating
    var completeCallback;
    var completeAnimations = NO;
    if (animation.options.complete) {
	    var optionsCompleteCallback = animation.options.complete;
	    completeCallback = async function (elements) {
		    if (completeAnimations) return;
		    completeAnimations = YES;
		    
			// Set timeout is used to schedule the callback to after all animations in the set have finished
			await 0;
			optionsCompleteCallback(elements);
			
			for (var i = 0; i < animationTargetsLength; i++) {
				if (animationTargets[i].options && animationTargets[i].options.complete) {
					animationTargets[i].options.complete(elements);
				}
				else if (animationTargets[i].complete) {
					animationTargets[i].complete(elements);
				}
			}
	    }
    }
    else {
	    completeCallback = async function (elements) {
		    if (completeAnimations) return;
		    completeAnimations = YES;
		    
			// Set timeout is used to schedule the callback to after all animations in the set have finished
			await 0;
			for (var i = 0; i < animationTargetsLength; i++) {
				if (animationTargets[i].options && animationTargets[i].options.complete) {
					animationTargets[i].options.complete(elements);
				}
				else if (animationTargets[i].complete) {
					animationTargets[i].complete(elements);
				}
			}
	    }
    }
	animation.options.complete = completeCallback;
	
    
    var stride = animation.options.stride;
	var delay = animation.options.delay || 0;
	
	var velocity = window.Velocity || $.Velocity;
	var promises = [];

	// An array to which web animations are added to set their start time to the same value
	let webAnimations = [];

	// Fire all the animations
    var animationTargetsLength = animation.targets.length;
    for (var i = 0; i < animationTargetsLength; i++) {
        var element = animationTargets[i].element;
        
        if (blocking) velocity(element, 'stop', true);
        
        // Allow each target to set its own options
        var options = animationTargets[i].options ? BMCopyProperties({}, animation.options, animationTargets[i].options) : BMCopyProperties({}, animation.options);
        
        if (stride) {
	        options = BMCopyProperties({}, options);
	        
	        if (i < animationTargetsLength - 1) {
		        delete options.complete;
	        }
	        
	        options.delay = delay;
	        delay += stride;
		}

		delete options.complete;
		
		if ((context._useWebAnimations || BM_USE_WEB_ANIMATIONS) && document.body.animate && !BM_WEB_ANIMATIONS_DISABLED) {
			if (options.queue) {
				console.warn('[BMCoreUI] Using the queue animation option with web animations which is not supported. This argument will be ignored.');
			}

			// For web animations, extract all non-tween properties and use web animations api on them
			// also unify all transform and filter properties into a single transform property
			let webAnimationProperties = {};

			// Extract and unify the transform properties
			let sourceTransformProperty = '';
			let transformProperty = '';
			for (let key in animationTargets[i].properties) {
				if (key in BMAnimationTransformPropertyDefaults) {
					// Specify an initial value if the property value is forcefed
					if (Array.isArray(animationTargets[i].properties[key])) {
						transformProperty += `${key}(${animationTargets[i].properties[key][0]}) `;
						sourceTransformProperty += `${key}(${animationTargets[i].properties[key][1]}) `;
					}
					else {
						transformProperty += `${key}(${animationTargets[i].properties[key]}) `;
					}
				}
			}

			// If a transform property was created, prepare it for web animations
			if (transformProperty) {
				// Specify the initial forcefed value if it existed
				if (sourceTransformProperty) {
					webAnimationProperties.transform = [transformProperty, sourceTransformProperty];
				}
				else {
					webAnimationProperties.transform = transformProperty;
				}
			}

			// Perform the same for filter properties
			let filterProperty = '';
			for (let key in animationTargets[i].properties) {
				if (key in BMAnimationFilterPropertyDefaults) {
					filterProperty += `${key}(${animationTargets[i].properties[key]}) `;
				}
			}
			if (filterProperty) webAnimationProperties.filter = filterProperty;

			// Add all the other properties
			for (let key in animationTargets[i].properties) {
				if ((key in BMAnimationTransformPropertyDefaults) || (key in BMAnimationFilterPropertyDefaults)) continue;
				if (key == 'tween') continue;
				webAnimationProperties[key] = animationTargets[i].properties[key];
			}

			// Set up the animation
			let node = element;
			if (element instanceof window.$) {
				node = element[0];
			}

			if (options.display == 'block') {
				node.style.display = 'block';
			}

			let sourceAnimationProperties = {};

			for (let key in webAnimationProperties) {
				if (Array.isArray(webAnimationProperties[key])) {
					// When the parameter is an array, this is interpreted as forcefeeding an initial value in velocity js
					sourceAnimationProperties[key] = webAnimationProperties[key][1];
					webAnimationProperties[key] = webAnimationProperties[key][0];
					// Apply the forcefed value to the node initially, if there is any delay
					if (options.delay) {
						node.style[key] = webAnimationProperties[key][1];
					}
				}
				else {
					sourceAnimationProperties[key] = node.style[key];
				}
			}

			const easing = Array.isArray(options.easing) ? `cubic-bezier(${options.easing.join(',')})` : BMAnimationEasing[options.easing];

			let nodeAnimation;
			try {
				nodeAnimation = node.animate([sourceAnimationProperties, webAnimationProperties], {
				//nodeAnimation = node.animate([{perspective: 1000}, {perspective: 1000}], {
					duration: options.duration * (window.BMAnimationMultiplier || 1), 
					easing: easing || 'linear', 
					//fill: 'none',
					delay: options.delay && (options.delay * (window.BMAnimationMultiplier || 1)),
					composite: 'replace',
					iterationComposite: 'replace'
				});
			}
			catch (e) {
				console.error('[BMCoreUI] This environment does not fully support web animations and use of this API will be disabled.');
				// If the current browser doesn't properly support animations, web animations will be
				// permanently disabled for this page and the sequence rerun with Velocity.js
				BM_WEB_ANIMATIONS_DISABLED = YES;
				i--;
				continue;
			}

			// Some implementations do not have promise support for web animations
			let hasPromiseSupport = NO;
			if (nodeAnimation.finished) {
				hasPromiseSupport = YES;
				nodeAnimation.finished.then(async () => {
					// Set up the final values when the animation finishes
					// Animation fill mode is not used because it breaks all other CSS
					for (let key in webAnimationProperties) {
						node.style[key] = webAnimationProperties[key];
					}
				});
			}

			// Store a reference to this animation; the start times of all of the animations will be synchronized at the end of the loop
			webAnimations.push(nodeAnimation);

			// Set up a promise and add it to the animation to maintain compatibility with the Velocity.js promise
			let promise = new Promise((resolve, reject) => {
				let finished = NO;
				nodeAnimation.onfinish = function () {
					if (finished) return;
					finished = YES;

					// If the engine does not have promise support, then the final values will be applied in onFinish
					if (!hasPromiseSupport) {
						for (let key in webAnimationProperties) {
							node.style[key] = webAnimationProperties[key];
						}
					}

					if (options.display == 'none') {
						node.style.display = 'none';
					}

					//nodeAnimation.cancel();

					resolve();
				};
				nodeAnimation.oncancel = function () {
					resolve();
				};

				// On Safari, onfinish and oncancel are bugged currently do not fire at times, so they are manually resolved as a workaround
				//setTimeout(nodeAnimation.onfinish, ((options.delay || 0) + options.duration) * (window.BMAnimationMultiplier || 1));
			});
			promises.push(promise);

			// If a progress handler is specified for the options, set up an accompanying Velocity.js animation to handle it
			if (options.progress) {
				promises.push(velocity.animate(element, {tween: 1}, options));
			}

		}
		else if (BM_USE_VELOCITY2) {
			if (element instanceof window.$) {
				promises.push(element[0].velocity(animationTargets[i].properties, options));
			}
			else {
				promises.push(element.velocity(animationTargets[i].properties, options));
			}
		}
		else {
			promises.push(velocity.animate(element, animationTargets[i].properties, options));
		
			if (options.queue) {
				velocity.Utilities.dequeue(element, options.queue);
			}
		}
	}
	
	if (window.Promise) {
		let promise = Promise.all(promises);
		promise.then(function () {
			if (animation.options.complete) {
				animation.options.complete();
			}
		});
		return promise;
	}
}


//@param blocking <Boolean, nullable> 	Defaults to NO. If set to YES, this animation will be blocking and stop all other animations, otherwise it will be scheduled.
//@param stride <Number, nullable>		Defaults to 0. If set to a number, this will add stride millisecond delay between each animation. The animation delays will
//										be added to the elements in the order that their animations were scheduled.
//@param duration <Int>           		The animation's duration in milliseconds.
//@param ... <>							Additional Velocity.js parameters

/**
 * Animates the properties modified in the given callback using the supplied options.
 * @param block <void (^)()>     			The callback in which you can modify the properties which will smoothly animate to their new values.
 * @param options <Object>          		An object of animation attributes. This object contains the same keys and values as Velocity.js's animation options object.
 *                                  		This object should not be modified afterwards until this animation is applied.
 *                                  		This object must contain a valid duration property.
 * @return <Promise<void>>						A promise that resolves when this animation completes or is cancelled.
 */
export function BMAnimateWithBlock(block, options) {
    var context = BMAnimationBeginWithDuration(options.duration, options);

    block();

    if (options.blocking) {
	    return BMAnimationApplyBlocking(YES);
	}
	else {
		return BMAnimationApply();
	}
}



/**
 * Converts the given element to a material design-like ripple that activates on mouse/touch down and up events on the given target element.
 * Though this is not required, it is recommended that the ripple element be an absolutely positioned direct descendant of the target element.
 * For best results, the ripple should also have its border radius set to 50% and its pointer-events set to none.
 * @param ripple <$>					The jQuery element that will act as the ripple.
 * {
 *	@param forTarget <$>				The jQuery element.
 * }
 */
export function BMRippleMakeWithElement(ripple, options) {
	// TODO: get rid of jQuery
	var target = options.forTarget;

	ripple[0].classList.add('BMRipple');
	
	var startEvent = BMIsTouchDevice ? 'touchstart.ripple' : 'mousedown.ripple';
	var endEvent = BMIsTouchDevice ? 'touchend.ripple' : 'mouseup.ripple';
	
	target.on(startEvent, function (event) {
		var width = target.outerWidth();
		var height = target.outerHeight();
		
		var highestDimension = Math.max(width, height);
		var diagonal = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
		var box = target[0].getBoundingClientRect();
		var targetOffset = {
			left: box.left,
			top: box.top
		};
		
		event.pageX = BMIsTouchDevice ? event.originalEvent.touches[0].screenX : event.originalEvent.clientX;
		event.pageY = BMIsTouchDevice ? event.originalEvent.touches[0].screenY : event.originalEvent.clientY;
		
		ripple.velocity("stop", true).css({
			width: '0px',
			height: '0px',
			opacity: 0
		});
		BMHook(ripple, {
			translateX: (event.pageX - targetOffset.left) + 'px',
			translateY: (event.pageY - targetOffset.top) + 'px'
		});
		ripple.velocity({
			translateX: ((width - diagonal) / 2) + 'px',
			translateY: ((height - diagonal) / 2) + 'px',
			width: diagonal + 'px',
			height: diagonal + 'px',
			opacity: 1
		}, {
			duration: 400, 
			easing: 'ease-out',
			display: 'block',
			queue: NO
		});

		let UUID = BMUUIDMake();

		$(window).on(endEvent + UUID, function (event) {
			$(window).off(endEvent + UUID);
			ripple.velocity({
				opacity: 0
			}, {
				duration: 300, 
				easing: 'ease-in-out',
				display: 'none',
				queue: NO
			});
		});
	});
}

/**
 * Creates a material design-like ripple that activates on mouse/touch down and up events on the given target element.
 * @param target <$>								The jQuery element.
 * {
 *	@param withColor <BMColor or String, nullable>	Defaults to rgba(0, 0, 0, .1). The color to use for the ripple.
 * }
 * @return <$>										The newly created ripple element.
 */
export function BMRippleMakeForTarget(target, args) {
	// TODO: get rid of jQuery
	var color = (args && args.withColor) || 'rgba(0, 0, 0, .1)';
	
	color = color.RGBAString || color;
	
	var ripple = $('<div style="position: absolute; display: block; top: 0px; left: 0px; border-radius: 50%;"></div>');
	ripple.css({backgroundColor: color});
	
	BMRippleMakeWithElement(ripple, {forTarget: target});
	
	return ripple;
}


// @endtype
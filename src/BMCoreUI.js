// @ts-check



// @type CoreUI

/**
 * The CoreUI package contains reusable generic functions and structures, usable as basic building blocks in different types of projects.
 * It includes basic objects such as point, size, rect, indexPath and color, as well as several globally defined functions.
 *
 * Most objects defined here are copyable through the copy() method. The copy method will return a functionally identical object,
 * with the same property values as the source object, however only the properties defined in the source prototype are copied.
 * Other developer-added properties will not exist in the copied object.
 */
var BMCoreUI = '2.1.0'; // <String>

var YES = true;
var NO = false;

// When set to YES, this will cause animation contexts to use Velocity.js 2 as their animation engine
const BM_USE_VELOCITY2 = NO;
// When set to YES, this will cause animation contexts to use the web animations api as their animation engine whenever possible
var BM_USE_WEB_ANIMATIONS = NO;
// When set to YES, this will cause certain deprecated properties or methods to trigger warning messages in the console.
const BM_DEPRECATION_WARN = NO;
// When set to YES, this will cause deprecation warnings to also incude the call stack.
const BM_DEPRECATION_TRACE = YES;

// This resolves an incompatbility with MS Edge
if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

/**
 * Is set to YES if the current device is a touch device, otherwise it is set to NO.
 */
var BMIsTouchDevice = !!('ontouchstart' in window || navigator.maxTouchPoints); // <Boolean>

// The cached scrollbar size.
var _BMScrollBarSize; // <Number>

/**
 * Returns the scrollbar size for the current platform.
 * @return <Number>			The scrollbar size.
 */
function BMScrollBarGetSize() {
	// Return the cached size if it is available
	if (_BMScrollBarSize !== undefined) return _BMScrollBarSize;

	// Otherwise create a helper element to measure the scrollbar
	var helper = document.createElement('div');
	helper.style = 'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;';
	document.body.appendChild(helper);

	_BMScrollBarSize = helper.offsetWidth - helper.clientWidth;

	// Remove the helper after measuring the scrollbar
	helper.remove ? helper.remove() : helper.removeNode(YES);

	return _BMScrollBarSize;
}

/**
 * Returns a CSS rule string from the given object.
 * @param selector <String>					The rule's selector.
 * {
 * 	@param important <Boolean, nullable>	Defaults to `NO`. If set to `YES`, the rules will be made important.
 * 	@param properties <AnyObject>			The object containing the CSS rules.
 * }
 * @return <String>							A string.
 */
function BMCSSRuleWithSelector(selector, args) {
	let properties = args.properties;
	let CSSRule = selector + ' {\n';
	Object.keys(properties).forEach(rule => {
		CSSRule += rule + ': ' + properties[rule] + (args.important ? ' !important' : '') + ';\n';
	});
	CSSRule += '\n}\n';

	return CSSRule;
}

/**
 * Adds an interaction to the target node that smoothly animates wheel events.
 * @param node <DOMNode>							The node for which to add the interaction.
 * {
 * 	@param withDeceleration <Number, nullable>		Defaults to 3. Measured in pixels/frame (or pixels/16ms). 
 * 													The speed with which the scroll speed decreases over time.
 * 	@param baseAcceleration <Number, nullable>		Defaults to 6. Measured in pixels/frame (or pixels/16ms). 
 * 													The acceleration with which the scrolling begins. This decreases
 * 													over time after the first scroll event fires.
 * 	@param speedIncrement <Number, nullable>		Defaults to 20. Measured in pixels/frame (or pixels/16ms).
 * 													The speed to add for successive scroll events.
 * }
 */
function BMAddSmoothMousewheelInteractionToNode(node, args) {
	// Set to yes if the current sequence of wheel events is considered to be
	// a smooth trackpad gesture
	let isTrackpadEvent = NO;
	let trackpadTimeout;

	args = args || {};

	let speedX = 0; // In pixels per frame
	let speedY = 0; // In pixels per frame
	let deceleration = args.withDeceleration || 3; // In pixels/frame
	let accelerationX = 0;
	let accelerationY = 0;
	let lastEvent;

	let baseAcceleration = args.baseAcceleration || 6;
	let speedIncrement = args.speedIncrement || 20;

	// A listener attached to the mouse down event.
	// This stops the scrolling in its tracks by resetting the speeds to 0
	function mouseDownListener() {
		speedX = 0;
		speedY = 0;
	}

	// The wheel event generator generates wheel events that slowly decelerate over time
	function wheelEventGenerator() {
		let initialXSign = Math.sign(speedX);
		let initialYSign = Math.sign(speedY);

		// The speed is first decreased by its deceleration rate
		if (speedX) speedX -= initialXSign * deceleration;
		if (speedY) speedY -= initialYSign * deceleration;

		// Then increased by its acceleration rate
		if (speedX) speedX += initialXSign * accelerationX;
		if (speedY) speedY += initialYSign * accelerationY;

		// Acceleration decreases at every step
		if (accelerationX) accelerationX -= .5;
		if (accelerationY) accelerationY -= .5;

		// If either speeds overshoots 0, scrolling for that axis stops
		if (Math.sign(speedX) != initialXSign) {
			speedX = 0;
		}

		if (Math.sign(speedY) != initialYSign) {
			speedY = 0;
		}

		// Otherwise, a new event is scheduled
		if (speedY || speedX) {
			requestAnimationFrame(wheelEventGenerator);
		}

		if (!speedX && !speedY) return;

		let event = new WheelEvent('wheel', {
			deltaX: speedX,
			deltaY: speedY,
			deltaZ: 0,
			deltaMode: 0,
			clientX: lastEvent.clientX,
			cientY: lastEvent.clientY,
			offsetX: lastEvent.offsetX,
			offsetY: lastEvent.offsetY,
			layerX: lastEvent.layerX,
			layerY: lastEvent.layerY,
			target: lastEvent.target
		});

		event._BMIsCustomScrollEvent = YES;

		node.dispatchEvent(event);
	}

	node.addEventListener('mousedown', mouseDownListener);

	node.addEventListener('wheel', function (event) {
		if (trackpadTimeout) window.clearTimeout(trackpadTimeout);
		trackpadTimeout = window.setTimeout(_ => { trackpadTimeout = undefined, isTrackpadEvent = NO }, 200);

		// If this is already a smooth trackpad event, don't do anything
		if (event._BMIsCustomScrollEvent || isTrackpadEvent) return;

		// On Safari, mouse wheel events are differentiated by having fractional values; on other browsers, wheel events have higher deltas
		if (event.deltaMode == 0 && ((Math.abs(event.deltaX) < 50 && Math.abs(event.deltaY) < 50) && (Math.floor(event.deltaY) - event.deltaY == 0))) {
			isTrackpadEvent = YES;
			return;
		}

		lastEvent = event;

		// Prevent the original event from going through
		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation();

		// When starting from a stopped state, reset the deceleration to 0
		if (speedX == 0 && speedY == 0) {
			deceleration = 0;
			requestAnimationFrame(wheelEventGenerator);
		}

		// Add to the speed of the current event if there is one
		if (Math.sign(event.deltaX) != Math.sign(speedX) || speedX == 0) {
			speedX = baseAcceleration * Math.sign(event.deltaX);
			accelerationX = baseAcceleration;
		}
		else {
			//accelerationX += 6;
			speedX += event.deltaX ? Math.sign(event.deltaX) * speedIncrement : 0;
		}

		if (Math.sign(event.deltaY) != Math.sign(speedY) || speedY == 0) {
			speedY = baseAcceleration * Math.sign(event.deltaY);
			accelerationY = baseAcceleration;
		}
		else {
			//accelerationY += 6;
			speedY += event.deltaY ? Math.sign(event.deltaY) * speedIncrement : 0;
		}

		// Add to the deceleration to prevent the scroll from taking too long to finish
		if (deceleration) {
			deceleration += (args.withDeceleration || 3) / 3;
		}
		else {
			deceleration += args.withDeceleration || 3;
		}

		// Generate the initial event
	});
}

/**
 * Allows using <code>$.Velocity.hook</code> by passing in a key-value object similar to $.fn.css
 * @param element <$ or DOMNode>        The jQuery element or DOM node on which to apply the properties.
 * @param properties <Object>   		The properties map.
 */
function BMHook(element, properties) {
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
 * Copies the properties and their definitions from all objects given as paramters to the first object given as a parameter.
 * Unlike jQuery's <code>$.extend</code> or <code>Object.assign</code>, this function will also copy getters and setters.
 * The property descriptors will be copied in the order in which the parameters are specified. For example, if the third parameter has a property
 * with the same name as the second parameter, the target object will have the third parameter's definition of that property.
 * @param target <AnyObject, nullable>		The object to which properties will be copied. May be set to undefined, in which case a new object will be created.
 * @param ... <[AnyObject], nullable>		Additional objects may be specified. The property descriptors will be copied over to the target object.
 * @return <AnyObject>						The target object.
 */
function BMExtend(target) {
	if (target === undefined) target = {};
	
	// Iterate through the sources and copy their property descriptors.
	var sources = arguments.length;
	
	if (typeof Object.getOwnPropertyDescriptors == 'function') {
		// If getOwnPropertyDescriptors is available, use it to copy all of the property descriptors in bulk
		for (var i = 1; i < sources; i++) {
		
			var properties = Object.getOwnPropertyDescriptors(arguments[i]);
			Object.defineProperties(target, properties);
		
		}
	}
	else {
		// Otherwise fall back to iterating through each property descriptor
		for (var i = 1; i < sources; i++) {
			var propertyNames = Object.getOwnPropertyNames(arguments[i]);
			for (var j = 0; j < propertyNames.length; j++) {
				var descriptor = Object.getOwnPropertyDescriptor(arguments[i], propertyNames[j]);
				if (descriptor) {
					Object.defineProperty(target, propertyNames[j], descriptor);
				}
			}
		}
	}
	
	return target;
}


/**
 * Copies the property values from all objects given as paramters to the first object given as a parameter. Only own properties will be copied.
 * The property values will be copied in the order in which the parameters are specified. For example, if the third parameter has a property
 * with the same name as the second parameter, the target object will have the third parameter's value for that property.
 * This will not redefine or reconfigure existing properties on the target object. For example, if any readonly property on the target object also exists on any of the
 * other objects, the target object's value for that property will not change.
 * @param target <AnyObject, nullable>		The object to which properties will be copied. May be set to undefined, in which case a new object will be created.
 * @param ... <[AnyObject], nullable>		Additional objects may be specified. The property values will be copied over to the target object.
 * @return <AnyObject>						The target object.
 */
function BMCopyProperties(target) {
	var numberOfSources = arguments.length;
	var sources = arguments;

	// Initialize target to an empty object if it is not specified.
	if (target === undefined) target = {};
	
	for (var i = 1; i < numberOfSources; i++) {
		Object.getOwnPropertyNames(arguments[i]).forEach(function (property) {
			target[property] = sources[i][property];
		});
		
	}

	return target;
}

/**
 * Creates and returns a string that represents the box-shadow to apply to an item to obtain
 * a material design-like box shadow for the given elevation.
 * Optionally, the shadow may also include a 1-pixel outline.
 * @param elevation <Number>				The elevation for which to generate the box-shadow.
 * {
 *	@param drawOutline <Boolean, nullable>	Defaults to NO. If set to YES, the box shadow will include an outline.
 *	@param opacity <Number, nullable>		Defaults to 0.1. The opacity with which to draw the box-shadow.
 * }
 * @return <String>							The box-shadow string.
 */
function BMShadowForElevation(elevation, options) {
	options = options || {};
	var opacity = options.opacity === undefined ? .1 : options.opacity;
	var outline = options.drawOutline || NO;
			
	var accentShadowSize = '0px ' + (4 * elevation) + 'px ' + (6 * elevation) + 'px';
	var diffShadowSize = '0px ' + (8 * elevation) + 'px ' + (12 * elevation) + 'px';
	var outlineBoxShadow = outline ? ', 0px 0px 1px 1px rgba(0, 0, 0, ' + opacity + ')' : '';
	
	return accentShadowSize + ' rgba(0, 0, 0, ' + opacity + '), ' + diffShadowSize + ' rgba(0, 0, 0, ' + opacity + ')' + outlineBoxShadow;
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
function BMRippleMakeWithElement(ripple, options) {
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
function BMRippleMakeForTarget(target, args) {
	var color = (args && args.withColor) || 'rgba(0, 0, 0, .1)';
	
	color = color.RGBAString || color;
	
	var ripple = $('<div style="position: absolute; display: block; top: 0px; left: 0px; border-radius: 50%;"></div>');
	ripple.css({backgroundColor: color});
	
	BMRippleMakeWithElement(ripple, {forTarget: target});
	
	return ripple;
}


/**
 * Returns a number that represents the linear interpolation of two numbers using a fraction.
 * @param source <Number>		The source number.
 * @param target <Number>		The target number.
 * @param fraction <Number>		The amount by which to interpolate. The fraction should be a number between 0 and 1, but going past these values is supported.
 *								Negative values will overshoot the source number and values greater than 1 will overshoot the target number.
 * @return <Number>				The interpolated number.
 */
function BMNumberByInterpolatingNumbersWithFraction(source, target, fraction) {
	return (target - source) * fraction + source;
}


/**
 * Returns the target value or either of the specified interval bounds if the value overshoots any bound.
 * If the value is greater than the low bound and less than the high bound, the value is returned.
 * If the value is less than the low bound, the low bound is returned.
 * Otherwise, if the value is greater than the high bound, the high bound is returned.
 * @param value <Number>		The target value.
 * @param low <Number>			The low bound.
 * @param high <Number>			The high bound.
 * @return <Number>				A number.
 */
function BMNumberByConstrainingNumberToBounds(value, low, high) {
	return Math.max(low, Math.min(value, high));
}

/**
 * Returns an array that contains all of the given object's keys that contain the given value.
 * If no key contains the given value, an empty array will be returned.
 * The object must not be null or undefined.
 * @param value <AnyObject, nullable>			The value to look for.
 * {
 *	@param inObject <Object>					The object in which to find keys.
 * }
 * @return <[String]>							An array of keys that match the given value.
 */
function BMKeysForValue(value, args) {
	var keys = [];
	Object.getOwnPropertyNames(args.inObject).forEach(function (key) {
		if (args.inObject[key] == value) keys.push(key);
	});
	return keys;
}

/**
 * Creates and returns an UUID string.
 * @return <String>     An UUID.
 */
function BMUUIDMake() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// @endtype

// @type BMHTMLEntity

/**
 * A dictionary containing HTML entities for various commonly used symbols.
 */
var BMHTMLEntity = Object.freeze({ // <enum>
	/**
	 * The HTML entity representing the bowen knot Command symbol.
	 */
	Command: '&#8984;', // <enum>
	/**
	 * The HTML entity representing the Option symbol.
	 */
	Option: '&#8997;', // <enum>
	/**
	 * The HTML entity representing the Shift symbol.
	 */
	Shift: '&#8679;', // <enum>
	/**
	 * The HTML entity representing the Caps-Lock symbol.
	 */
	CapsLock: '&#8682;', // <enum>
	/**
	 * The HTML entity representing the Backspace delete symbol.
	 */
	Delete: '&#9003;', // <enum>
	/**
	 * The HTML entity representing the Return symbol.
	 */
	Return: '&#9166;' // <enum>
});

// @endtype

// @type BMInset

/*
****************************************************************************************************************************************************************
																		BMInset
****************************************************************************************************************************************************************
*/

/**
 * A struct which represents the insets which may be applied to a rect such a view's frame.
 * An inset is represented by four numbers, each representing the amount by which each rect's edge should be inset.
 * If an inset is positive, the rect edge will be inset (move towards the center) by that amount,
 * if it is negative, the rect edge will be outset (move away from the center) by that amount.
 */
function BMInset(left, top, right, bottom) { // <constructor>
	this.left = left || 0;
	this.top = top || 0;
	this.right = right || 0;
	this.bottom = bottom || 0;
}

BMInset.prototype = {
	
	/**
	 * The left edge inset.
	 */
	left: 0, // <Number>
	
	/**
	 * The top edge inset.
	 */
	top: 0, // <Number>
	
	/**
	 * The right edge inset.
	 */
	right: 0, // <Number>
	
	/**
	 * The bottom edge inset.
	 */
	bottom: 0, // <Number>

	/**
	 * Initializes this inset with the values of the given inset object.
	 * @param inset <BMInset>	The inset to copy.
	 * @return <BMInset>		This inset.
	 */
	initWithInset(inset) {
		this.left = inset.left;
		this.top = inset.top;
		this.right = inset.right;
		this.bottom = inset.bottom;

		return this;
	},

	/**
	 * Tests whether this inset is equal to the given inset.
	 * The two insets are equal if their components are all equal.
	 * @param inset <BMInset>		The inset to test against.
	 * @return <Boolean>			`YES` if the two insets are equal, `NO` otherwise.
	 */
	isEqualToInset(inset) {
		return (this.left === inset.left && this.top === inset.top && this.right === inset.right && this.bottom === inset.bottom);
	},

	/**
	 * Creates and returns a copy of this BMInset object.
	 * @return <BMInset>	An inset object.
	 */
	copy: function () {
		return new BMInset(this.left, this.top, this.right, this.bottom);
	}

}

/**
 * Constructs and returns a new inset with all four edges having the same value.
 * @param insets <Number, nullable>		Defaults to 0. The inset value to use for all four edges.
 * @return <BMInset>					An inset.
 */
function BMInsetMakeWithEqualInsets(insets) {
	insets = insets || 0;
	return BMInsetMake(insets, insets, insets, insets);
};


/**
 * Constructs and returns a new inset with all four edges having the same value.
 * @param insets <Number, nullable>		Defaults to 0. The inset value to use for all four edges.
 * @return <BMInset>					An inset.
 */
BMInset.insetWithEqualInsets = BMInsetMakeWithEqualInsets;

/**
 * Creates and returns an inset object.
 * @param left <Number, nullable>		Defaults to 0. The left inset.
 * @param top <Number, nullable>		Defaults to 0. The top inset.
 * @param right <Number, nullable>		Defaults to 0. The right inset.
 * @param bottom <Number, nullable>		Defaults to 0. The bottom inset.
 * @return <BMInset>					An insets object.
 */
function BMInsetMake(left, top, right, bottom) {
	return new BMInset(left, top, right, bottom);
}

/**
 * Creates and returns an inset object.
 * @param left <Number, nullable>		Defaults to 0. The left inset.
 * {
 *	@param top <Number, nullable>		Defaults to 0. The top inset.
 *	@param right <Number, nullable>		Defaults to 0. The right inset.
 *	@param bottom <Number, nullable>	Defaults to 0. The bottom inset.
 * }
 * @return <BMInset>					An insets object.
 */
function BMInsetMakeWithLeft(left, args) {
	args = args || {};
	return new BMInset(left || 0, args.top || 0, args.right || 0, args.bottom || 0);
}


/**
 * Creates and returns an inset object.
 * @param left <Number, nullable>		Defaults to 0. The left inset.
 * {
 *	@param top <Number, nullable>		Defaults to 0. The top inset.
 *	@param right <Number, nullable>		Defaults to 0. The right inset.
 *	@param bottom <Number, nullable>	Defaults to 0. The bottom inset.
 * }
 * @return <BMInset>					An insets object.
 */
BMInset.insetWithLeft = BMInsetMakeWithLeft;

// @endtype

// @type BMPoint implements BMAnimating

/*
****************************************************************************************************************************************************************
																		BMPoint
****************************************************************************************************************************************************************
*/

/**
 * A struct which represents a point in two dimensions.
 * @param x <Number, nullable>     Defaults to 0. The x coordinate.
 * @param y <Number, nullable>     Defaults to 0. The y coordinate.
 */
var BMPoint = function (x, y) { // <constructor>
	x = x || 0;
	y = y || 0;

	this.x = x;
	this.y = y;
};

BMExtend(BMPoint.prototype, {
	
	/**
	 * The point's X coordinate.
	 */
	x: 0, // <Number>
	
	/**
	 * The point's Y coordinate.
	 */
	y: 0, // <Number>

	/**
	 * The point's polar radius coordinate.
	 */
	get r() { // <Number>
		return BMDistanceBetweenPoints(this, BMOirginPoint);
	},

	set r(r) {
		const t = this.t;

		this.x = r * Math.cos(t);
		this.y = r * Math.sin(t);
	},

	/**
	 * The point's polar angle coordinate.
	 */
	get t() { // <Number>
		return BMSlopeAngleBetweenPoints(BMOirginPoint, this);
	},

	set t(t) {
		const r = this.r;

		this.x = r * Math.cos(t);
		this.y = r * Math.sin(t);
	},

	/**
	 * Initializes this point by copying the values of the given point.
	 * @param point <BMPoint> 	The point to copy.
	 * @return <BMPoint>		This point.
	 */
	initWithPoint(point) {
		this.x = point.x;
		this.y = point.y;
		return this;
	},

	/**
	 * Returns a string representation of this point.
	 */
	get stringValue() {
		return this.x + ',' + this.y;
	},

	/**
	 * Returns a string representation of this point.
	 * This property removes the fractional part of the components in the serialized representation.
	 */
	get integerStringValue() {
		return (this.x | 0) + ',' + (this.y | 0);
	},
	
	/**
	 * Returns a point with the same coordinates as this point, but without their fractional parts.
	 */
	get integerPointValue() {
		return BMPointMake(this.x | 0, this.y | 0);
	},
	
	/**
	 * Returns a point with the same coordinates as this point, but without their fractional parts.
	 */
	get integralPoint() {
		return this.integerPointValue;
	},
	
	/**
	 * Tests whether this point is equal to the given point.
	 * @param point <BMPoint>						The point.
	 * @return <Boolean>							YES if the points are equal, NO otherwise.
	 */
	isEqualToPoint: function (point) {
		return this.x == point.x && this.y == point.y;
	},
	
	/**
	 * Returns a copy of this point.
	 * @return <BMPoint>	A point.
	 */
	copy: function () {
		return BMPointMake(this.x, this.y);
	},

	/**
	 * Constructs and returns a point that represents the sum of the components of this point and the given point.
	 * @param point <BMPoint>		The point.
	 * @return <BMPoint>			A point.
	 */
	pointByAddingPoint(point) {
		return BMPointMake(this.x + point.x, this.y + point.y);
	},

	/**
	 * Constructs and returns a point that represents the difference of the components of this point and the given point.
	 * @param point <BMPoint>		The point.
	 * @return <BMPoint>			A point.
	 */
	pointBySubtractingPoint(point) {
		return BMPointMake(this.x - point.x, this.y - point.y);
	},
	
	/**
	 * Computes and returns the distance from this point to the given point.
	 * @param point <BMPoint>				A point.
	 * @return <Number>						The distance.
	 */
	distanceToPoint: function (point) {
		return BMDistanceBetweenPoints(this, point);
	},
	
	/**
	 * Computes and returns the slope angle, in radians, of the line between this point and the given point.
	 * @param point <BMPoint>				A point.
	 * @return <Number>						The angle in radians.
	 */
	slopeAngleToPoint: function (point) {
		return BMSlopeAngleBetweenPoints(this, point);
	},

    /**
     * Invoked by the CoreUI animation engine to obtain an interpolated
     * value between this object and the target object.
     * @param fraction <Number>         The animation fraction.
     * {
     *  @param toValue <BMPoint>        The object to which to interpolate.
     * }
	 * @return <BMPoint>				A point.
     */
	interpolatedValueWithFraction(fraction, args) {
		var target = args.toValue;
		return BMPointMake(
			BMNumberByInterpolatingNumbersWithFraction(this.x, target.x, fraction),
			BMNumberByInterpolatingNumbersWithFraction(this.y, target.y, fraction)
		);
	},

	/**
	 * Returns a string representation of this point.
	 * @return <String>		A string.
	 */
	toString() {
		return `(${this.x}:${this.y})`;
	}
	
});

/**
 * Constructs and returns a new point with the given coordinates.
 * @param x <Number, nullable>     	Defaults to 0. The x coordinate.
 * @param y <Number, nullable>     	Defaults to 0. The y coordinate.
 * @return <BMPoint>				A Point.
 */
var BMPointMake = function (x, y) {
	return new BMPoint(x, y);
};

/**
 * Constructs and returns a new point with the given coordinates.
 * @param x <Number, nullable>     	Defaults to 0. The x coordinate.
 * {
 * 	@param y <Number, nullable>     	Defaults to 0. The y coordinate.
 * }
 * @return <BMPoint>				A Point.
 */
var BMPointMakeWithX = function (x, args) {
	return new BMPoint(x || 0, (args && args.y) || 0);
};

/**
 * Computes and returns the absolute distance between the two given points.
 * @param fromPoint <BMPoint>		The first point.
 * @param toPoint <BMPoint>			The second point.
 * @return <Number>					The distance between the two points.
 */
var BMDistanceBetweenPoints = function (fromPoint, toPoint) {
	return Math.sqrt(Math.pow(toPoint.x - fromPoint.x, 2) + Math.pow(toPoint.y - fromPoint.y, 2));
}

/**
 * Computes and returns the slope angle, in radians, between the two given points.
 * @param fromPoint <BMPoint>		The first point.
 * @param toPoint <BMPoint>			The second point.
 * @return <Number>					The angle in radians.
 */
var BMSlopeAngleBetweenPoints = function (fromPoint, toPoint) {
	return Math.atan2(toPoint.y - fromPoint.y, toPoint.x - fromPoint.x);
}

/**
 * Represents the origin point.
 */
const BMOirginPoint = BMPointMake(0, 0);

// @endtype

// @type BMSize implements BMAnimating

/*
****************************************************************************************************************************************************************
																		BMSize
****************************************************************************************************************************************************************
*/

/**
 * A struct which represents a size in two dimensions
 * @param width <Number, nullable>     Defaults to 0. The width.
 * @param height <Number, nullable>    Defaults to 0. The height.
 */
function BMSize(width, height) { // <constructor>
	width = width || 0;
	height = height || 0;

	this.width = width;
	this.height = height;
};

BMSize.prototype = {

	/**
	 * The size's width component.
	 */
	width: 0, // <Number>

	/**
	 * The size's height component.
	 */
	height: 0, // <Number>

	/**
	 * Initializes this size by copying the values of the specified size.
	 * @param size <BMSize>			The size to copy.
	 * @return <BMSize>				This size.
	 */
	initWithSize(size) {
		this.width = size.width;
		this.height = size.height;
		return this;
	},

	/**
	 * Creates a new rect with its origin at (0, 0) with this size.
	 * @return <BMRect> A rect.
	 */
	newRectWithSize: function () {
		return new BMRect(new BMPoint(), this);
	},
	
	/**
	 * Creates and returns a new size with the same attributes as this size.
	 * @return <BMSize>		A size.
	 */
	copy: function () {
		return new BMSize(this.width, this.height);
	},
	
	/**
	 * Tests whether this size is identical to the given size.
	 * @param size <BMSize>		A size.
	 * @return <Boolean>		YES if the sizes are identical, NO otherwise.
	 */
	isEqualToSize: function (size) {
		return size.width === this.width && size.height === this.height;
	},

	/**
	 * Tests whether this size is greater than or equal to the given size. The size
	 * is considered to be greater than or equal if both of its dimensions are each greater than or equal
	 * to the given size.
	 * @param size <BMSize>			The size to test against.
	 * @return <Boolean>			`YES` if this size is greater than or equal than the given size, `NO` otherwise.
	 */
	isGreaterThanSize: function (size) {
		return this.width >= size.width && this.height >= size.height;
	},

	/**
	 * Tests whether this size is less than or equal to the given size. The size
	 * is considered to be less than or equal if both of its dimensions are each less than or equal
	 * to the given size.
	 * @param size <BMSize>			The size to test against.
	 * @return <Boolean>			`YES` if this size is less than or equal than the given size, `NO` otherwise.
	 */
	isLessThanSize: function (size) {
		return this.width <= size.width && this.height <= size.height;
	},

    /**
     * Invoked by the CoreUI animation engine to obtain an interpolated
     * value between this object and the target object.
     * @param fraction <Number>         The animation fraction.
     * {
     *  @param toValue <BMSize>         The object to which to interpolate.
     * }
	 * @return <BMSize>					A size.
     */
	interpolatedValueWithFraction(fraction, args) {
		var target = args.toValue;
		return BMSizeMake(
			BMNumberByInterpolatingNumbersWithFraction(this.width, target.width, fraction),
			BMNumberByInterpolatingNumbersWithFraction(this.height, target.height, fraction)
		);
	},


	/**
	 * Returns a string representation of this size.
	 * @return <String>		A string.
	 */
	toString() {
		return `[${this.width}:${this.height}]`;
	}

}


/**
 * Creates and returns a new size.
 * @param width <Number, nullable>     	Defaults to 0. The width.
 * @param height <Number, nullable>    	Defaults to 0. The height.
 * @return <BMSize>						A size.
 */
function BMSizeMake(width, height) {
	return new BMSize(width, height);
}

// @endtype

// @type BMRect implements BMAnimating

/*
****************************************************************************************************************************************************************
																		BMRect
****************************************************************************************************************************************************************
*/

/**
 * A struct which represents a rectangle in two dimensions.
 * It is defined by the origin of the rectangle and its size.
 * @param origin <BMPoint, nullable>  Defaults to (0, 0). The origin point.
 * @param size <BMSize, nullable>     Defaults to (0:0). The rect's size.
 */
var BMRect = function (origin, size) { // <constructor>
	origin = origin || new BMPoint();
	size = size || new BMSize();

	this.origin = origin;
	this.size = size;
};

BMRect.prototype = {
	
	/**
	 * The rect's origin point.
	 */
	origin: undefined, // <BMPoint>
	
	/**
	 * The rect's size.
	 */
	size: undefined, // <BMSize>
	
	/**
	 * The X coordinate of this rect's right edge.
	 */
	get right() { // <Number>
		return this.origin.x + this.size.width 
	},
	
	/**
	 * The Y coordinate of this rect's bottom edge.
	 */
	get bottom() { // <Number>
		return this.origin.y + this.size.height 
	},
	
	/**
	 * The X coordinate of this rect's origin point.
	 */
	get left() { // <Number>
		return this.origin.x 
	},
	
	/**
	 * The Y coordinate of this rect's origin point.
	 */
	get top() { // <Number>
		return this.origin.y 
	},

	/**
	 * The rect's width.
	 */
	get width() { // <Number>
		return this.size.width;
	},

	/**
	 * The rect's height.
	 */
	get height() { // <Number>
		return this.size.height;
	},

	/**
	 * The rect's center point.
	 */
	get center() { // <BMPoint>
		return new BMPoint(this.origin.x + this.size.width / 2, this.origin.y + this.size.height / 2);
	},
	set center(center) {
		var currentCenter = this.center;
		
		this.offset(center.x - currentCenter.x, center.y - currentCenter.y);
	},

	/**
	 * Returns a rect that represents a copy of this rect by removing decimal values from both the origin point and the size components.
	 */
	get integralRect() { // <BMRect>
		return BMRectMake(this.origin.x | 0, this.origin.y | 0, this.size.width | 0, this.size.height | 0);
	},

	/**
	 * Initializes this rect by copying the values of the specified rect.
	 * @param rect <BMRect>			The rect to copy.
	 * @return <BMRect>				This rect.
	 */
	initWithRect(rect) {
		this.origin = rect.origin.copy();
		this.size = rect.size.copy();
		return this;
	},


	/**
	 * Determines whether this rect is equal to the target rect.
	 * @param rect <BMRect>     The rect to check for equality.
	 * @return <Boolean>        True if the rects are equal, false otherwise.
	 */
	isEqualToRect: function (rect) {
		return (rect.origin.x == this.origin.x && rect.origin.y == this.origin.y && this.size.width == rect.size.width && this.size.height == rect.size.height);
	},

	/**
	 * Determines whether this rect intersects the target rect in any point.
	 * @param rect <BMRect>     The rect to check for intersection.
	 * @return <Boolean>        YES if the rects intersect, NO otherwise.
	 */
	intersectsRect: function (rect) {
		if (this.isEqualToRect(rect)) return YES;

		return !(rect.left > this.right ||
		           rect.right < this.left ||
		           rect.top > this.bottom ||
		           rect.bottom < this.top);
	},
	
	/**
	 * Determines whether this rect intersects the target rect in any point except the edges.
	 * @param rect <BMRect>     The rect to check for intersection.
	 * @return <Boolean>        YES if the rects intersect, NO otherwise.
	 */
	intersectsContentOfRect: function (rect) {
		if (this.isEqualToRect(rect)) return YES;

		return !(rect.left >= this.right ||
					rect.right <= this.left ||
					rect.top >= this.bottom ||
					rect.bottom <= this.top);
	},

	/**
	 * Creates and returns a new rect that represents the intersection between this rect and the target rect.
	 * If the rects do not intersect, the resulting rect will be undefiend.
	 * @param rect <BMRect>			The rect.
	 * @return <BMRect, nullable>   	A rect.
	 */
	rectByIntersectingWithRect: function (rect) {
		var origin = new BMPoint(Math.max(this.left, rect.left), Math.max(this.top, rect.top));
		
		var size = new BMSize(
			Math.min(this.right, rect.right) - origin.x,
			Math.min(this.bottom, rect.bottom) - origin.y
		);

		// If any of the sizes are negative, the rects do not intersect
		if (size.width <= 0 || size.height <= 0) return undefined;

		return new BMRect(origin, size);
	},

	/**
	 * Creates and returns a new rect that represents the union between this rect and the target rect.
	 * @param rect <BMRect>			The rect.
	 * @return <BMRect>				A rect.
	 */
	rectByUnionWithRect(rect) {
		let x = Math.min(this.origin.x, rect.origin.x);
		let y = Math.min(this.origin.y, rect.origin.y);
		let right = Math.max(this.right, rect.right);
		let bottom = Math.max(this.bottom, rect.bottom);

		return BMRectMake(x, y, right - x, bottom - y);
	},

	/**
	 * Creates and returns up to 4 rects which reprent the areas of this rect and the target rect that do not intersect.
	 * The resulting rects will first cover any horionztal area and then the vertical area.
	 * @return <AnyObject> 	The list of rects. Some of these rects may be missing, indicating that the two rects fit either vertically or horizontally.
	*/
	rectsByExclusiveOrWithRect: function (rect) {
        // TODO
	},
	
	/**
	 * Returns up to two rects that together make up the difference between this rect and the supplied rect.
	 * If the rects are identical or the target rect contains this rect, this function will return nothing.
	 * If the rects do not intersect, this function will return this rect.
	 * @param rect <BMRect>				The rect.
	 * @return <[BMRect], nullable>		A list of rects or undefined if the intersection is identical to either rect.
	 */
	rectsWithDifferenceFromRect: function (rect) {
		if (this.isEqualToRect(rect)) return undefined;
		
		var intersection = this.rectByIntersectingWithRect(rect);
		
		if (!intersection) return [this];
		
		if (intersection.isEqualToRect(this)) return undefined;
		
		// If the intersection rect has the same width or height as this rect, only one rect is the difference
		if (intersection.size.height == this.size.height) {
			return [BMRectMake(intersection.origin.x == this.origin.x ? intersection.right : this.origin.x, 
								this.origin.y, 
								this.size.width - intersection.size.width, this.size.height)];
		}
		
		if (intersection.size.width == this.size.width) {
			return [BMRectMake(this.origin.x, 
								intersection.origin.y == this.origin.y ? intersection.bottom : this.origin.y, 
								this.size.width, this.size.height - intersection.size.height)];
		}
		
		// Otherwise two rects should be returned
		var result = [];
		
		// The first rect is a tall horizontal strip from one horizontal edge of this rect to the opposite horiztonal edge of the intersection
		var firstRect = BMRectMake(intersection.origin.x == this.origin.x ? intersection.right : this.origin.x, 
								this.origin.y, 
								this.size.width - intersection.size.width, this.size.height)
		
		// The second is the remaining shorter horiztonal strip						
		var secondRect = BMRectMake(firstRect.origin.x == this.origin.x ? firstRect.right : this.origin.x,
									intersection.origin.y == this.origin.y ? intersection.bottom : this.origin.y,
									this.size.width - firstRect.size.width, this.size.height - intersection.size.height);
		
		return [firstRect, secondRect];
		
	},

	/**
	 * Determines if the target rect is completely included in this rect.
	 * The given rect will be considered to be contained within this rect even if they have equal positionining and sizing.
	 * @param rect <BMRect>     The rect to check.
	 * @return <Boolean>        YES if the rect is contained, NO otherwise. If the target rect is not valid, the result is undefined.
	 */
	containsRect: function (rect) {
		return (rect.left >= this.left &&
				rect.top >= this.top &&
				rect.right <= this.right &&
				rect.bottom <= this.bottom);
	},

	/**
	 * Determines if the target point is strictly contained in this rect.
	 * @param point <BMPoint>     					The point to check.
	 * @return <Boolean>                            YES if the point is contained within this rect, NO if it is outside or on the edge of this rect.
	 */
	containsPoint: function (point) {
		return (point.x > this.left && point.x < this.right && point.y > this.top && point.y < this.bottom);
	},
	
	/**
	 * Determines if the target point is strictly contained in this rect or any of its edges.
	 * @param point <BMPoint>     					The point to check.
	 * @return <Boolean>                            YES if the point is contained within this rect or its edges, NO otherwise.
	 */
	intersectsPoint: function (point) {
		return (point.x >= this.left && point.x <= this.right && point.y >= this.top && point.y <= this.bottom);
	},

	/**
	 * Moves this rect in place by the specified positions.
	 * @param x <Number> The x amount.
	 * @param y <Number> The y amount.
	 */
	offset: function (x, y) {
		this.origin.x += x;
		this.origin.y += y;
	},

	/**
	 * Moves this rect in place by the specified positions.
	 * @param x <Number, nullable> 		Defaults to 0. The x amount.
	 * {
	 *	@param y <Number, nullable> 	Defaults to 0. The y amount.
	 * }
	 */
	offsetWithX: function (x, args) {
		this.origin.x += x || 0;
		this.origin.y += (args && args.y) || 0;
	},

	/**
	 * Contracts or expands this rect in place by the specified sizes. If the sizes are positive, the rect is inset, otherwise it is expanded.
	 * This method may be invoked in two ways:
	 * --------------------------------------------------
	 * @param width <Number>    	The horizontal amount.
	 * @param height <Number>   	The vertical amount.
	 * --------------------------------------------------
	 * @param insets <BMInset>	The insets.
	 */
	inset: function (width, height) {
		if (height === undefined) {
			this.origin.x += width.left;
			this.origin.y += width.top;
			
			this.size.width -= width.left + width.right;
			this.size.height -= width.top + width.bottom;
		}
		else {		
			this.origin.x += width;
			this.origin.y += height;
	
			this.size.width -= 2 * width;
			this.size.height -= 2 * height;
		}
	},

	/**
	 * Contracts or expands this rect in place by the specified sizes. If the sizes are positive, the rect is inset, otherwise it is expanded.
	 * @param width <Number>		The horizontal amount.
	 * {
	 *	@param height <Number>		The vertical amount.
	 * }
	 */
	insetWithWidth: function (width, args) {
		var height = args.height;	
		this.origin.x += width;
		this.origin.y += height;

		this.size.width -= 2 * width;
		this.size.height -= 2 * height;
	},

	/**
	 * Contracts or expands this rect in place by the specified sizes. If the sizes are positive, the rect is inset, otherwise it is expanded.
	 * @param inset <BMInset>		The inset to apply.
	 */
	insetWithInset: function (inset) {
		this.origin.x += inset.left;
		this.origin.y += inset.top;
		
		this.size.width -= inset.left + inset.right;
		this.size.height -= inset.top + inset.bottom;
	},

	/**
	 * Constructs and returns a new rect that represents the rect that would be obtained by applying the given insets to this rect.
	 * @param inset <BMInset>		The inset to apply.
	 * @return <BMRect>				A new rect after applying the insets.
	 */
	rectWithInset: function (inset) {
		var rect = this.copy();
		rect.insetWithInset(inset);
		return rect;
	},
	
	/**
	 * Constructs and returns a new rect that represents the transform that should be applied to this rect
	 * for it to be identical to the given rect.
	 * The new rect's size represents the X and Y scales that should be applied to this rect, while the origin represents the translation.
	 * To achieve the correct results, the translation should be applied first and the scaling the second.
	 * @param rect <BMRect>			The rect towards which to transform.
	 * @return <BMRect>				The transformation rect.
	 */
	rectWithTransformToRect: function (rect) {
		var transformRect = BMRectMake();
		
		transformRect.size.width = rect.size.width / this.size.width;
		transformRect.size.height = rect.size.height / this.size.height;
		
		var deltaX = rect.center.x - this.center.x;
		var deltaY = rect.center.y - this.center.y;
		
		transformRect.origin.x = deltaX;
		transformRect.origin.y = deltaY;
		
		return transformRect;
	},

	/**
	* Creates a deep copy of this rect.
	* @return <BMRect> A rect.
	*/
	copy: function () {
		var rect = new BMRect();
		rect.origin.x = this.origin.x;
		rect.origin.y = this.origin.y;

		rect.size.width = this.size.width;
		rect.size.height = this.size.height;
		return rect;
	},

    /**
     * Invoked by the CoreUI animation engine to obtain an interpolated
     * value between this object and the target object.
     * @param fraction <Number>         The animation fraction.
     * {
     *  @param toValue <BMRect>         The object to which to interpolate.
     * }
	 * @return <BMRect>					A rect.
     */
	interpolatedValueWithFraction(fraction, args) {
		var target = args.toValue;
		return BMRectByInterpolatingRect(this, {toRect: target, withFraction: fraction});
	},

	toString() {
		return `(${this.origin.x}:${this.origin.y})=>[${this.size.width}:${this.size.height}]`;
	}

};

/**
 * Creates and returns a rectangle that represents the interpolation between two rects with a given fraction.
 * @param sourceRect <BMRect>			The source rect.
 * {
 *	@param toRect <BMRect>				The target rect.
 *	@param withFraction <Number>		The amount by which to interpolate. The fraction should be a number between 0 and 1, but going past these values is supported.
 *										Negative values will overshoot the source rect and values greater than 1 will overshoot the target rect.
 * }
 * @return <BMRect>						A rect.
 */
function BMRectByInterpolatingRect(sourceRect, options) {
	var targetRect = options.toRect;
	var fraction = options.withFraction;
	
	return BMRectMake(
		BMNumberByInterpolatingNumbersWithFraction(sourceRect.origin.x, targetRect.origin.x, fraction),
		BMNumberByInterpolatingNumbersWithFraction(sourceRect.origin.y, targetRect.origin.y, fraction),
		BMNumberByInterpolatingNumbersWithFraction(sourceRect.size.width, targetRect.size.width, fraction),
		BMNumberByInterpolatingNumbersWithFraction(sourceRect.size.height, targetRect.size.height, fraction)
	);
}

/**
 * Creates and returns a rectangle with the specified properties.
 * @param x <Number, nullable>			Defaults to 0. The rect's left origin.
 * @param y <Number, nullable>			Defaults to 0. The rect's top origin.
 * @param width <Number, nullable>		Defaults to 0. The rect's width.
 * @param height <Number, nullable>		Defaults to 0. The rect's height.
 * @return <BMRect>						A rect.
 */
function BMRectMake(x, y, width, height) {
	return new BMRect(new BMPoint(x, y), new BMSize(width, height));
}


/**
 * Creates and returns a rectangle with the specified properties.
 * @param x <Number, nullable>			Defaults to 0. The rect's left origin.
 * {
 * 	@param y <Number, nullable>			Defaults to 0. The rect's top origin.
 * 	@param width <Number, nullable>		Defaults to 0. The rect's width.
 * 	@param height <Number, nullable>		Defaults to 0. The rect's height.
 * }
 * @return <BMRect>						A rect.
 */
function BMRectMakeWithX(x, args) {
	return new BMRect(new BMPoint(x, args && args.y), new BMSize(args && args.width, args && args.height));
}

/**
 * Creates and returns a rectangle with the specified properties.
 * @param origin <BMPoint, nullable>		Defaults to (0, 0). The rect's origin point.
 * {
 *	@param size <BMSize, nullable>			Defaults to [0, 0]. The rect's size.
 * }
 * @return <BMRect>						A rect.
 */
function BMRectMakeWithOrigin(origin, args) {
	return new BMRect(origin || new BMPoint(), (args && args.size) || new BMSize());
}

/**
 * Creates and returns a rectangle that represents the area of the document currently occupied by the given DOM node.
 * The coordinates will be relative to the viewport and will take into account the current document scroll position.
 * @param DOMNode <DOMNode>				The node whose frame to get.
 * @return <BMRect>						A rect.
 */
function BMRectMakeWithNodeFrame(DOMNode) {
	var boundingClientRect = DOMNode.getBoundingClientRect();
	
	return new BMRect(new BMPoint(boundingClientRect.left, boundingClientRect.top), new BMSize(boundingClientRect.width, boundingClientRect.height));
}

// @endtype

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
function BMAnimatable(target, key, descriptor) {

	if (!descriptor.set) throw new Error('[BMCoreUI] Incorrectly applied BMAnimatable to property ' + key + ' that doesn\'t have a setter');

	if (!descriptor.get) {
		descriptor.get = function () { return this['_' + key]; };

		var oldSet = descriptor.set;
		descriptor.set = function (value) {
			if (BMAnimationContextGetCurrent()) {
				let controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this.node});
				controller.registerAnimatableProperty(key, {targetValue: value.copy(), startingValue: this[key].copy()});
				this['_' + key] = value.copy();
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
				let controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this.node});
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
function BMAnimatableNumber(target, key, descriptor) {

	if (!descriptor.set) throw new Error('[BMCoreUI] Incorrectly applied BMAnimatable to property ' + key + ' that doesn\'t have a setter');

	if (!descriptor.get) {
		descriptor.get = function () { return this['_' + key]; };

		var oldSet = descriptor.set;
		descriptor.set = function (value) {
			if (BMAnimationContextGetCurrent()) {
				let controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this.node});
				controller.registerOwnProperty(key, {targetValue: value, startingValue: this[key]});
				this['_' + key] = value;
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
				let controller = BMAnimationContextGetCurrent().controllerForObject(this, {node: this.node});
				controller.registerOwnProperty(key, {targetValue: value, startingValue: this[key]});
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
function BMAnimationController() {} // <constructor>

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
						startingValue = self._owner[property.name].copy();
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
function __BMVelocityAnimate(node, properties, options, useWebAnimations) {
	return BMAnimateWithBlock(() => {
		let controller = BMAnimationContextGetCurrent().controllerForObject(node, {node: node});
		controller.registerBuiltInPropertiesWithDictionary(properties);

		if (useWebAnimations) BMAnimationContextEnableWebAnimations();
	}, options);
}

// @type BMAnimationContext

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
function BMAnimationContext() { // <constructor>
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
function BMAnimationContextGetCurrent() {
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
function BMAnimationContextEnableWebAnimations() {
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
function BMAnimationContextBeginStatic() {

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
function BMAnimationBeginWithDuration(duration, options) {
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
function BMAnimationContextAddCompletionHandler(handler) {
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
function BMAnimationApply() {
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
function BMAnimationApplyBlocking(blocking) {
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
	
	if (window.event && window.event.shiftKey) {
		animation.options.duration = animation.options.duration * 5;
		window.event.preventDefault();
	}
    
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
		
		// For the last element in the set, also run the animation-wide completion handler
		// if (i == animationTargetsLength - 1 && animation.options.complete) {
		// 	options.complete = function () {
		// 		animation.options.complete.apply(this, arguments);
		// 	}
		// }
        
        // The properties need to be sorted such that translation is the first, scale is the second and rotation is the last
        // Otherwise the positioning will be undefined
        
        // When dealing with attributes, this handled automatically as the frame is applied first and the style second
		
		if ((context._useWebAnimations || BM_USE_WEB_ANIMATIONS) && document.body.animate && !BM_WEB_ANIMATIONS_DISABLED) {
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

			let nodeAnimation;
			try {
				nodeAnimation = node.animate([sourceAnimationProperties, webAnimationProperties], {
				//nodeAnimation = node.animate([{perspective: 1000}, {perspective: 1000}], {
					duration: options.duration * (window.BMAnimationMultiplier || 1), 
					easing: BMAnimationEasing[options.easing] || 'linear', 
					//fill: 'none',
					delay: options.delay,
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
			if (nodeAnimation.ready) {
				hasPromiseSupport = YES;
				nodeAnimation.ready.then(async () => {
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

					nodeAnimation.cancel();

					resolve();
				};
				nodeAnimation.oncancel = function () {
					resolve();
				};

				// On Safari, onfinish and oncancel are bugged currently do not fire at times, so they are manually resolved as a workaround
				setTimeout(nodeAnimation.onfinish, (options.delay || 0) + options.duration);
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
		}
		
		if (options.queue) {
			element.dequeue(options.queue);
		}
	}

	// if (webAnimations.length) {
	// 	animationStartTime = document.timeline.currentTime + 16;
	// 	for (let animation of webAnimations) animation.startTime = animationStartTime;
	// }
	
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
function BMAnimateWithBlock(block, options) {
    var context = BMAnimationBeginWithDuration(options.duration, options);

    block();

    if (options.blocking) {
	    return BMAnimationApplyBlocking(YES);
	}
	else {
		return BMAnimationApply();
	}
}

// @endtype

// @type BMIndexPath<T = any>

/*
****************************************************************************************************************************************************************
																		BMIndexPath
****************************************************************************************************************************************************************
*/

/**
 * A BMIndexPath object manages the mapping between an object and its position within a data set.
 * It represents an ordered list of indexes that should be traversed within a data set to reach a given object.
 * 
 * Optionally, and index path may also contain a reference to the object to which its indexes point.
 * 
 * Index paths should be created using one of the `BMIndexPathMake` functions rather than using the constructor.
 */
function BMIndexPath() {} // <constructor>

BMIndexPath.prototype = {
    /**
     * The object.
     */
    object: undefined, // <T, nullable>

    /**
     * The ordered list of indexes.
     */
	indexes: undefined, // <[Int]>
	
	/**
	 * Initializes this index path by copying the values of the given index path.
	 * @param indexPath <BMIndexPath<T>>			The index path to copy.
	 * @return <BMIndexPath<T>>						This index path.
	 */
	initWithIndexPath(indexPath) {
		this.object = indexPath.object;
		this.indexes = indexPath.indexes.slice();
		return this;
	},

    /**
     * The object's row. This corresponds to the second index.
     */
    get row() { // <Int>
        return this.indexes[1];
    },
    set row(row) {
        this.indexes[1] = row;
    },

    /**
     * The object's section. This corresponds to the first index.
     */
    get section() { // <Int>
        return this.indexes[0];
    },
    set section(section) {
        this.indexes[0] = section;
    },

    /**
     * Creates and returns a new <code>BMIndexPath</code> instance with the same property values
     * as this index path.
     * @return <BMIndexPath<T>>    An index path.
     */
    copy: function () {
        var result = new BMIndexPath();
        result.object = this.object;
        result.indexes = this.indexes.slice();
        return result;
    },
    
    /**
	 * Used to test if two index paths are strictly equal.
	 * Two index paths are strictly equal if the contain the same indexes and point to the same object.
	 * @param indexPath <BMIndexPath, nullable>					The index path. If undefined, this method returns NO.
	 * {
	 *	@param usingComparator <Boolean ^ (Object, Object)>		The comparator used to compare the pointed object.
	 * }
	 * @return <Boolean>										YES if the index paths are strictly equal, NO otherwise.
	 */
    isEqualToIndexPath: function (indexPath, options) {
	    if (!indexPath || indexPath == BMIndexPathNone) return NO;
	    
	    if (indexPath.indexes.length != this.indexes.length) return NO;
	    for (var i = 0; i < this.indexes.length; i++) {
		    if (this.indexes[i] != indexPath.indexes[i]) return NO;
	    }
	    
	    return options.usingComparator(this.object, indexPath.object);
	    
    },
    
    /**
	 * Used to test if two index paths represent the same element, even if they have a different position in the data set.
	 * Two index paths are loosely equal if they refer to the same object or if they both refer to no object but have equal indexes.
	 * @param indexPath <BMIndexPath, nullable>					The index path. If undefined, this method returns NO.
	 * {
	 *	@param usingComparator <Boolean ^ (Object, Object)>		The comparator used to compare the pointed object.
	 * }
	 * @return <Boolean>										YES if the index paths are loosely equal, NO otherwise.
	 */
    isLooselyEqualToIndexPath: function (indexPath, options) {
	    if (!indexPath || indexPath == BMIndexPathNone) return NO;
	    
	    if (indexPath.object === undefined && this.object === undefined) {
		    if (indexPath.indexes.length != this.indexes.length) return NO;
		    for (var i = 0; i < this.indexes.length; i++) {
			    if (this.indexes[i] != indexPath.indexes[i]) return NO;
		    }
		    return YES;
	    }
	    else {
	    	return options.usingComparator(this.object, indexPath.object);
	    }
    }

};

/**
 * An index path that points to no object.
 * This index path will return NO when tested for equality, even against itself.
 */
var BMIndexPathNone = BMIndexPathMakeWithRow(NaN, {section: NaN, forObject: NaN}); // <BMIndexPath<any>>
BMIndexPathNone.section = NaN;
BMIndexPathNone.isEqualToIndexPath = function () { return NO; };
BMIndexPathNone.isLooselyEqualToIndexPath = function () { return NO; };

/**
 * Constructs and returns a new BMIndexPath object initialized to the given row and section.
 * @param row <Int>                     	The row number.
 * {
 *  @param section <Int, nullable>      	Defaults to 0. The section number.
 *  @param forObject <Object, nullable>		The object.
 * }
 * @return <BMIndexPath>					An index path.
 */
function BMIndexPathMakeWithRow(row, options) {
    var indexPath = new BMIndexPath();
    indexPath.indexes = [(options && options.section) || 0, row];
    indexPath.object = (options && options.forObject);
    return indexPath;
}


/**
 * Constructs and returns a new BMIndexPath object initialized to the given indexes.
 * @param indexes <[Int]>               		The indexes.
 * {
 *  @param forObject <Object, nullable>         Optional. The object.
 * }
 * @return <BMIndexPath>						An index path.
 */
function BMIndexPathMakeWithIndexes(indexes, options) {
	var indexPath = new BMIndexPath();
	indexPath.indexes = indexes;
	indexPath.object = options ? options.forObject : undefined;
	return indexPath;
}

// @endtype

// @type BMKeyPath

/*
****************************************************************************************************************************************************************
																		BMKeyPath
****************************************************************************************************************************************************************
*/


/**
 * A BMKeyPath object represents an ordered list of key names that should be traversed within a data set to reach a given object.
 * Key paths should be created using one of the `BMKeyPathMake` functions rather than using the constructor.
 */
function BMKeyPath() {}; // <constructor>

BMKeyPath.prototype = {
	
	/**
	 * The list of keys which should be traversed by this key path.
	 */
	_components: undefined, // <[String]>
	
	get components() {
		return this._components.slice();
	},
	
	/**
	 * Initializes this key path by parsing the given string.
	 * The key path components should be separated by periods. If a key contains a period in its name
	 * that period should be escaped using the '\' character.
	 * @param string <String>		The string which represents the key path.
	 */
	initWithString: function (string) {
		// TODO escaped periods
		this._components = string.split('.');
	},
	
	/**
	 * Initializes this key path using the specified list of ordered key names.
	 * @param components <[String]>		The array of keys.
 	 */
	initWithComponents: function (components) {
		this._components = components.slice();
	},
	
	/**
	 * Traverses this key path on the given object, returning the value for the last key.
	 * If any of the intermediary objects are undefined, this method will return undefined.
	 * @param object <AnyObject>				The object which should be traversed.
	 * {
	 *	@param withLimit <Number, nullable>		Defaults to this key path's length. The number of keys to use when traversing.
	 * }
	 * @return <AnyObject, nullable>			The value at the end of this key path, or undefined if the object could not be traversed
	 *											for the entire key path.
	 */
	valueForObject: function (object, args) {
		var value = object;
		var length = Math.min(this._components.length, (args && args.withLimit) || this._components.length);
		
		for (var i = 0; i < length; i++) {
			value = value[this._components[i]];
			
			if (typeof value === 'undefined') return undefined;
		}
		
		return value;
		
	}
	
};


/**
 * Constructs and returns a new key path by parsing the given string.
 * The key path components should be separated by periods. If a key contains a period in its name
 * that period should be escaped using the '\' character.
 * @param string <String>		The string which represents the key path.
 * @return <BMKeyPath>			A key path.
 */
function BMKeyPathMakeWithString(string) {
	
	return (new BMKeyPath()).initWithString(string);
	
}


/**
 * Constructs and returns a new key path using the specified list of ordered key names.
 * @param components <[String]>		The array of keys.
 * @return <BMKeyPath>				A key path.
 */
function BMKeyPathMakeWithComponents(components) {
	
	return (new BMKeyPath()).initWithComponents(components);
	
}

// @endtype

// @type BMScrollingDirectionVertical

/**
 * Contains constants representing the terminal vertical direction of a scrolling operation.
 */
var BMScrollingDirectionVertical = Object.freeze({
	
	/**
	 * Indicates that the scroll operation was stationary on the vertical axis.
	 */
	Stationary: 0, // <enum>
	
	/**
	 * Indicates that the scroll operation was moving towards the beginning of the content.
	 */
	Top: 1, // <enum>
	
	/**
	 * Indicates that the scroll operation was moving towards the end of the content.
	 */
	Bottom: -1 // <enum>
});

// @endtype

// @type BMScrollingDirectionHorizontal

/**
 * Contains constants representing the terminal horizontal direction of a scrolling operation.
 */
var BMScrollingDirectionHorizontal = Object.freeze({
	
	/**
	 * Indicates that the scroll operation was stationary on the horizontal axis.
	 */
	Stationary: 0, // <enum>
	
	/**
	 * Indicates that the scroll operation was moving towards the beginning of the content.
	 */
	Left: 1, // <enum>
	
	/**
	 * Indicates that the scroll operation was moving towards the end of the content.
	 */
	Right: -1 // <enum>
});

// @endtype

// @type interface BMFunctionCollection extends Function, Array<Function>


/*
****************************************************************************************************************************************************************
																		BMFunctionCollection
****************************************************************************************************************************************************************
*/

/**
 * Constructs and returns a function collection.
 * 
 * A function collection is an array-like object that can only contain functions.
 * It also behaves as a function that, when invoked, will invoke all other functions it contains, passing in
 * its context and argument.
 * 
 * It is intended to be an easy way to add multiple callbacks in cases where a single callback is expected.
 * 
 * Note that while it supports all of Array's methods, it does not support numbered properties.
 * To access or set values at specific indexes, use the <code>functionAtIndex(_)</code> and
 * <code>setFunction(_, {atIndex})</code> methods.
 * 
 * When invoked, the function collection will return the value returned by the last function it contains.
 * 
 * @return <BMFunctionCollection>		A function collection.
 */
function BMFunctionCollectionMake() {
	var array = [];

	/**
	 * A function collection is an array-like object that can only contain functions.
	 * It also behaves as a function that, when invoked, will invoke all other functions it contains, passing in
	 * its context and argument.
	 * 
	 * Note that while it supports all of Array's methods, it does not support numbered properties.
	 * To access or set values at specific indexes, use the <code>functionAtIndex(_)</code> and
	 * <code>setFunction(_, {atIndex})</code> methods.
	 * 
	 * When invoked, the function collection will return the value returned by the last function it contains.
	 * 
	 * Function collections cannot be instantiated using the constructor, they can only be created using the
	 * `BMFunctionCOllectionMake()` function.
	 */
//	function BMFunctionCollection() {} // <constructor>

	/**
	 * Represents the number of functions within this function collection.
	 */
// length: undefined, // <Number>

	/**
	 * Puts the given function at the specified index within this function collection.
	 * If the given index is out of bounds, the function collection will be resized to accomodate
	 * the given index.
	 * @param f <Function, nullable>			The function to set.
	 * {
	 * 	@param atIndex <Number>					The index.
	 * }
	 */
// setFunction: function (f, args) {


	/**
	 * Retrieves the function at the given index.
	 * @param index <Number>			The index.
	 * @return <Function, nullable>		A function, or `undefined` if there is no function at the specified index.
	 */
// functionAtIndex: function (index) {

	var collection = function () {
		var self = this;
		var returnValue;
		array.forEach((func) => (returnValue = func.apply(self, arguments)))
		return returnValue;
	}

	// Copy over array methods
	Object.getOwnPropertyNames(Array.prototype).forEach(function (key) {
		collection[key] = function () {
			return array[key].apply(array, arguments);
		}
	});

	// Add own methods
	BMExtend(collection, {
		get length() {
			return array.length;
		},
		set length(length) {
			array.length = length;
		},

		functionAtIndex(index) {
			return array[index];
		},

		setfunction(func, args) {
			return (array[args.atIndex] = func);
		},

		_isFunctionCollection: YES
	});

	return collection;
}

// @endtype

// @type _BMColorStorage

	/**
	 * Used internally by CoreUI.
	 */
// function _BMColorStorage() {} // <constructor>

// @endtype

// @type BMColor implements BMAnimating

/*
****************************************************************************************************************************************************************
																		BMColor
****************************************************************************************************************************************************************
*/

/**
 * A BMColor object is an opaque representation of a CSS color.
 * It handles the conversion between the different CSS color representations such as hex strings and rgba strings.
 * The BMColor is an abstract object - a different implementation of BMColor may be used depending on how it was constructed.
 * Additionally, changing certain properties of this object might cause its underlying implementation to change at runtime;
 * when this happens, the color might change slightly if the target implementation cannot accurately represent the source one.
 */
function BMColor() {} // <constructor>

BMColor.prototype = {
	
	/**
	 * The underlying storage object to which this color object delegates its functionality.
	 */
	_storage: undefined, // <_BMColorStorage>
	
	/** 
	 * The color's red component in a RGBA representation.
	 * Changing this value will cause this color's underlying representation to switch to RGBA.
	 */
	get red() { // <Short>
		return this._storage.red;
	},
	set red(red) {
		this._storage.red = red;
	},
	
	/** 
	 * The color's green component in a RGBA representation.
	 * Changing this value will cause this color's underlying representation to switch to RGBA.
	 */
	get green() { // <Short>
		return this._storage.green;
	},
	set green(green) {
		this._storage.green = green;
	},
	
	/** 
	 * The color's blue component in a RGBA representation.
	 * Changing this value will cause this color's underlying representation to switch to RGBA.
	 */
	get blue() { // <Short>
		return this._storage.blue;
	},
	set blue(blue) {
		this._storage.blue = blue;
	},
	
	
	/** 
	 * The color's alpha component.
	 */
	get alpha() { // <Short>
		return this._storage.alpha;
	},
	set alpha(alpha) {
		this._storage.alpha = alpha;
	},
	
	
	/** 
	 * The color's hue component in a HSLA representation.
	 * Changing this value will cause this color's underlying representation to switch to HSLA.
	 */
	get hue() { // <Short>
		return this._storage.hue;
	},
	set hue(hue) {
		this._storage.hue = hue;
	},
	
	/** 
	 * The color's saturation component in a HSLA representation.
	 * Changing this value will cause this color's underlying representation to switch to HSLA.
	 */
	get saturation() { // <Short>
		return this._storage.saturation;
	},
	set saturation(saturation) {
		this._storage.saturation = saturation;
	},
	
	/** 
	 * The color's luminosity component in a HSLA representation.
	 * Changing this value will cause this color's underlying representation to switch to HSLA.
	 */
	get luminosity() { // <Short>
		return this._storage.luminosity;
	},
	set luminosity(luminosity) {
		this._storage.luminosity = luminosity;
	},
	
	/**
	 * The RGBA representation of this color.
	 */
	get RGBAString() { // <String>
		return this._storage.RGBAString;
	},
	
	/**
	 * The RGB representation of this color. The alpha component of this color is ignored in this representation.
	 */
	get RGBString() { // <String>
		return this._storage.RGBString;
	},
	
	/**
	 * The hex representation of this color. The alpha component of this color is ignored in this representation.
	 */
	get hexString() { // <String>
		return this._storage.hexString;
	},
	
	/**
	 * The HSLA representation of this color.
	 */
	get HSLAString() { // <String>
		return this._storage.HSLAString;
	},
	
	/**
	 * The HSL representation of this color. The alpha component of this color is ignored in this representation.
	 */
	get HSLString() { // <String>
		return this._storage.HSLString;
	},
	
	/**
	 * Creates and returns a copy of this color.
	 * @return <BMColor> A color.
	 */
	copy: function () {
		var color = new BMColor();
		
		color._storage = this._storage.copy();
		
		return color;
	},

    /**
     * Invoked by the CoreUI animation engine to obtain an interpolated
     * value between this object and the target object.
	 * The resulting color will always be in the RGBA space when created
	 * by this method.
     * @param fraction <Number>         The animation fraction.
     * {
     *  @param toValue <BMColor>        The object to which to interpolate.
     * }
	 * @return <BMColor>				A color.
     */
	interpolatedValueWithFraction(fraction, args) {
		var target = args.toValue;
		return BMColorByInterpolatingRGBAColor(this, {toColor: target, withFraction: fraction});
	}
};

/**
 * Constructs and returns a fully transparent black color.
 * @return <BMColor>	A color.
 */
function BMColorMake() {
	return BMColorMakeWithRed(0, {green: 0, blue: 0, alpha: 0});
}


/**
 * Constructs and returns a BMColor object by parsing the given CSS color string.
 * The string can be a hex, rgba, rgb, hsla or hsl color or any of the CSS 3 color keywords.
 * If the string is not a valid color string, the resulting BMColor object is not defined.
 * @param string <String, nullable>		Defaults to 'rgba(0, 0, 0, 0)'. The color string.
 * @return <BMColor, nullable>			The new BMColor object or undefined if the color string cannot be parsed.
 */
function BMColorMakeWithString(string) {

	if (!string) return BMColorMakeWithRed(0, {green: 0, blue: 0, alpha: 0});
	
	if (_BMColorKeywords[string]) return BMColorMakeWithHexString(_BMColorKeywords[string]);
	
	if (string.indexOf('#') == 0) return BMColorMakeWithHexString(string);
	
	if (string.indexOf('rgba') == 0) return BMColorMakeWithRGBAString(string);
	
	if (string.indexOf('rgb') == 0) return BMColorMakeWithRGBString(string);
	
	if (string.indexOf('hsla') == 0) return BMColorMakeWithHSLAString(string);
	
	if (string.indexOf('hsl') == 0) return BMColorMakeWithHSLString(string);
	
}

/**
 * Constructs and returns a BMColor by specifying its RGBA components.
 * @param red <Short>					The red component.
 * {
 *	@param green <Short>				The green component.
 *	@param blue <Short>					The blue component.
 *	@param alpha <Short, nullable>		Defaults to 1. The alpha component.
 * }
 */
function BMColorMakeWithRed(red, options) {
	var color = new BMColor();
	
	color._storage = new _BMRGBAColor();
	color._storage._color = color;
	
	color._storage._red = BMNumberByConstrainingNumberToBounds(red | 0, 0, 255);
	color._storage._green = BMNumberByConstrainingNumberToBounds(options.green | 0, 0, 255);
	color._storage._blue = BMNumberByConstrainingNumberToBounds(options.blue | 0, 0, 255);
	
	color._storage._alpha = BMNumberByConstrainingNumberToBounds('alpha' in options ? options.alpha : 1, 0, 1);
	
	return color;
}

/**
 * Constructs and returns a BMColor by specifying its HSLA components.
 * @param hue <Int>						The hue component.
 * {
 *	@param saturation <Short>			The saturation component.
 *	@param luminosity <Short>			The luminosity component.
 *	@param alpha <Short, nullable>		Defaults to 1. The alpha component.
 * }
 */
function BMColorMakeWithHue(hue, options) {
	var color = new BMColor();
	
	color._storage = new _BMHSLAColor();
	color._storage._color = color;
	
	color._storage._hue = BMNumberByConstrainingNumberToBounds(hue | 0, 0, 360);
	color._storage._saturation = BMNumberByConstrainingNumberToBounds(options.saturation | 0, 0, 100);
	color._storage._lightness = BMNumberByConstrainingNumberToBounds(options.lightness | 0, 0, 100);
	
	color._storage._alpha = BMNumberByConstrainingNumberToBounds('alpha' in options ? options.alpha : 1, 0, 1);
	
	return color;
}


/**
 * Constructs and returns a new BMColor by parsing the specified hex string.
 * @param string <String>	The hex string.
 * @return <BMColor>		A color.
 */
function BMColorMakeWithHexString(string) {
	var color = new BMColor();
	
	color._storage = new _BMRGBAColor();
	color._storage._color = color;
	
	if (string.charAt(0) == '#') {
		color._storage._red = parseInt(string.substring(1, 3), 16);
		color._storage._green = parseInt(string.substring(3, 5), 16);
		color._storage._blue = parseInt(string.substring(5, 7), 16);
	}
	else {
		color._storage._red = parseInt(string.substring(0, 2), 16);
		color._storage._green = parseInt(string.substring(2, 4), 16);
		color._storage._blue = parseInt(string.substring(4, 6), 16);
	}
	
	return color;
}


/**
 * Constructs and returns a new BMColor by parsing the specified RGBA string.
 * @param string <String>	The RGBA string.
 * @return <BMColor>		A color.
 */
function BMColorMakeWithRGBAString(string) {
	var color = new BMColor();
	
	color._storage = new _BMRGBAColor();
	color._storage._color = color;

	var components = string.split(',');
	
	color._storage.red = parseInt(components[0].substring(5), 10);
	color._storage.green = parseInt(components[1], 10);
	color._storage.blue = parseInt(components[2], 10);
	color._storage.alpha = parseFloat(components[3], 10);
	
	return color;
}


/**
 * Constructs and returns a new BMColor by parsing the specified RGB string.
 * @param string <String>	The RGB string.
 * @return <BMColor>		A color.
 */
function BMColorMakeWithRGBString(string) {
	var color = new BMColor();
	
	color._storage = new _BMRGBAColor();
	color._storage._color = color;

	var components = string.split(',');
	
	color._storage.red = parseInt(components[0].substring(4), 10);
	color._storage.green = parseInt(components[1], 10);
	color._storage.blue = parseInt(components[2], 10);
	
	return color;
}


/**
 * Constructs and returns a new BMColor by parsing the specified RGBA string.
 * @param string <String>	The RGBA string.
 * @return <BMColor>		A color.
 */
function BMColorMakeWithHSLAString(string) {
	var color = new BMColor();
	
	color._storage = new _BMHSLAColor();
	color._storage._color = color;

	var components = string.split(',');
	
	color._storage.hue = parseInt(components[0].substring(5), 10);
	color._storage.saturation = parseInt(components[1], 10);
	color._storage.luminosity = parseInt(components[2], 10);
	color._storage.alpha = parseFloat(components[3], 10);
	
	return color;
}


/**
 * Constructs and returns a new BMColor by parsing the specified RGB string.
 * @param string <String>	The RGB string.
 * @return <BMColor>		A color.
 */
function BMColorMakeWithHSLString(string) {
	var color = new BMColor();
	
	color._storage = new _BMHSLAColor();
	color._storage._color = color;

	var components = string.split(',');
	
	color._storage.hue = parseInt(components[0].substring(4), 10);
	color._storage.saturation = parseInt(components[1], 10);
	color._storage.luminosity = parseInt(components[2], 10);
	
	return color;
}


/**
 * Creates and returns a color that represents the interpolation between two colors with a given fraction.
 * The resulting color will always be a RGBA color.
 * @param sourceColor <BMColor>			The source color.
 * {
 *	@param toColor <BMColor>			The target color.
 *	@param withFraction <Number>		The amount by which to interpolate. The fraction should be a number between 0 and 1, but going past these values is supported.
 *										Negative values will overshoot the source color and values greater than 1 will overshoot the target color, however each color
 *										component will be clamped between each component's minimum and maximum values.
 * }
 * @return <BMColor>					A color.
 */
function BMColorByInterpolatingRGBAColor(sourceColor, options) {
	var targetColor = options.toColor;
	var fraction = options.withFraction;
	
	return BMColorMakeWithRed(BMNumberByInterpolatingNumbersWithFraction(sourceColor.red, targetColor.red, fraction), {
		green: BMNumberByInterpolatingNumbersWithFraction(sourceColor.green, targetColor.green, fraction),
		blue: BMNumberByInterpolatingNumbersWithFraction(sourceColor.blue, targetColor.blue, fraction),
		alpha: BMNumberByInterpolatingNumbersWithFraction(sourceColor.alpha, targetColor.alpha, fraction)
	});
}


/**
 * Creates and returns a color that represents the interpolation between two colors with a given fraction.
 * The resulting color will always be a HSLA color.
 * @param sourceColor <BMColor>			The source color.
 * {
 *	@param toColor <BMColor>			The target color.
 *	@param withFraction <Number>		The amount by which to interpolate. The fraction should be a number between 0 and 1, but going past these values is supported.
 *										Negative values will overshoot the source color and values greater than 1 will overshoot the target color, however each color
 *										component will be clamped between each component's minimum and maximum values.
 * }
 * @return <BMColor>					A color.
 */
function BMColorByInterpolatingHSLAColor(sourceColor, options) {
	var targetColor = options.toColor;
	var fraction = options.withFraction;
	
	return BMColorMakeWithHue(BMNumberByInterpolatingNumbersWithFraction(sourceColor.hue, targetColor.hue, fraction), {
		saturation: BMNumberByInterpolatingNumbersWithFraction(sourceColor.saturation, targetColor.saturation, fraction),
		luminosity: BMNumberByInterpolatingNumbersWithFraction(sourceColor.luminosity, targetColor.luminosity, fraction),
		alpha: BMNumberByInterpolatingNumbersWithFraction(sourceColor.alpha, targetColor.alpha, fraction)
	});
}


/**
 * Converts the given number to a hex string that is guaranteed to have at least two digits.
 * @param number <Int>					The number to convert.
 * {
 *	@param minDigits <Int, nullable>	Defaults to 0. When set to a positive number, the resulting hex string will be padded with 0 if
 *										its length is lower than this parameter.
 * }
 * @return <String>						A hex string.
 */
function BMHexStringWithNumber(number, options) {
	var result = number.toString(16);
	var minDigits = (options && options.minDigits) || 0;
	
	// If the resulting string has fewer digits than the minDigits paramter, 0 will be added to the beginning of the string until
	// it matches the required digit count.
	while (result.length < minDigits) {
		result = '0' + result;
	}
	
	return result;
}

// @endtype

// @type _BMRGBAColor implements _BMColorStorage

/**
 * A _BMRGBAColor object is a color storage model where colors are represented by four 8 bit values representing the
 * red, green, blue and alpha components.
 */
function _BMRGBAColor() {}; // <constructor>

_BMRGBAColor.prototype = {
	
	/**
	 * The color object that manages this RGBAColor
	 */
	_color: undefined, // <BMColor>

	/**
	 * The color's red component.
	 */
	_red: 0, // <Short>
	get red() { return this._red; },
	set red(red) {
		this._red = BMNumberByConstrainingNumberToBounds(red | 0, 0, 255);
	},

	/**
	 * The color's green component.
	 */
	_green: 0, // <Short>
	get green() { return this._green; },
	set green(green) {
		this._green = BMNumberByConstrainingNumberToBounds(green | 0, 0, 255);
	},

	/**
	 * The color's blue component.
	 */
	_blue: 0, // <Short>
	
	get blue() { return this._blue; },
	set blue(blue) {
		this._blue = BMNumberByConstrainingNumberToBounds(blue | 0, 0, 255);
	},

	/**
	 * The color's alpha component.
	 */
	_alpha: 1, // <Short>
	get alpha() { return this._alpha; },
	set alpha(alpha) {
		this._alpha = BMNumberByConstrainingNumberToBounds(alpha, 0, 1);
	},
	
	
	/** 
	 * The color's hue component in a HSLA representation.
	 * Changing this value will cause this color's underlying representation to switch to HSLA.
	 */
	get hue() { // <Short>
		return this.BMHSLAColor.hue;
	},
	set hue(hue) {
		var storage = this.BMHSLAColor;
		this._color._storage = storage;
		storage.hue = hue;
	},
	
	/** 
	 * The color's saturation component in a HSLA representation.
	 * Changing this value will cause this color's underlying representation to switch to HSLA.
	 */
	get saturation() { // <Short>
		return this.BMHSLAColor.saturation;
	},
	set saturation(saturation) {
		var storage = this.BMHSLAColor;
		this._color._storage = storage;
		storage.saturation = saturation;
	},
	
	/** 
	 * The color's luminosity component in a HSLA representation.
	 * Changing this value will cause this color's underlying representation to switch to HSLA.
	 */
	get luminosity() { // <Short>
		return this.BMHSLAColor.luminosity;
	},
	set luminosity(luminosity) {
		var storage = this.BMHSLAColor;
		this._color._storage = storage;
		storage.luminosity = luminosity;
	},
	
	/**
	 * Returns the equivalent HSLA color.
	 */
	get BMHSLAColor() { // <_BMHSLAColor>
		var HSLAColor = new _BMHSLAColor();
		
		// NOTE: code from http://en.wikipedia.org/wiki/HSL_color_space
		
		var r = this._red / 255;
		var g = this._green / 255;
		var b = this._blue / 255;
		
		var max = Math.max(r, g, b);
		var min = Math.min(r, g, b);
		
		var l = (max + min) / 2;
		HSLAColor._luminosity = (l * 100) | 0;
		
		if (max == min) {
			HSLAColor._saturation = 0;
			HSLAColor._hue = 0;
		}
		else {
			var d = max - min;
			var s = l > .5 ? (d / (2 - max - min)) : d / (max + min);
			var h;
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h = h / 6;
			
			HSLAColor._saturation = (s * 100) | 0;
			HSLAColor._hue = (h * 360) | 0;
		}
		
		HSLAColor._alpha = this._alpha;
		
		return HSLAColor;
	},
	
	/**
	 * The RGBA representation of this color.
	 */
	get RGBAString() { // <String>
		return 'rgba(' + this._red + ',' + this._green + ',' + this._blue + ',' + this._alpha + ')';
	},
	
	/**
	 * The RGB representation of this color. The alpha component of this color is ignored in this representation.
	 */
	get RGBString() { // <String>
		return 'rgb(' + this._red + ',' + this._green + ',' + this._blue + ')';
	},
	
	/**
	 * The hex representation of this color. The alpha component of this color is ignored in this representation.
	 */
	get hexString() { // <String>
		return '#' + BMHexStringWithNumber(this._red, {minDigits: 2}) + BMHexStringWithNumber(this._green, {minDigits: 2}) + BMHexStringWithNumber(this._blue, {minDigits: 2});
	},
	
	/**
	 * The HSLA representation of this color.
	 */
	get HSLAString() { // <String>
		return this.BMHSLAColor.HSLAString;
	},
	
	/**
	 * The HSL representation of this color. The alpha component of this color is ignored in this representation.
	 */
	get HSLString() { // <String>
		return this.BMHSLAColor.HSLString;
	},
	
	/**
	 * Creates and returns a copy of this RGBA color.
	 * @return <BMColor> A color.
	 */
	copy: function () {
		var color = new _BMRGBAColor();
		
		color._red = this._red;
		color._green = this._green;
		color._blue = this._blue;
		color._alpha = this._alpha;
		
		return color;
		
	}
	
};

// @endtype

// @type _BMHSLAColor implements _BMColorStorage

/**
 * A _BMHSLAColor object is a color storage model where colors are represented by four 8 bit values representing the
 * hue, saturation, luminosity and alpha components.
 */
function _BMHSLAColor() {}; // <constructor>

_BMHSLAColor.prototype = {
	
	/**
	 * The color object that manages this HSLAColor
	 */
	_color: undefined, // <BMColor>

	/**
	 * The color's red component.
	 * Changing this value will cause this color's underlying representation to switch to RGBA.
	 */
	get red() {
		return this.BMRGBAColor.red;
	},
	set red(red) {
		var storage = this.BMRGBAColor;
		this._color._storage = storage;
		storage.red = red;
	},

	/**
	 * The color's green component.
	 * Changing this value will cause this color's underlying representation to switch to RGBA.
	 */
	get green() {
		return this.BMRGBAColor.green;
	},
	set green(green) {
		var storage = this.BMRGBAColor;
		this._color._storage = storage;
		storage.green = green;
	},

	/**
	 * The color's blue component.
	 * Changing this value will cause this color's underlying representation to switch to RGBA.
	 */
	get blue() {
		return this.BMRGBAColor.blue;
	},
	set blue(blue) {
		var storage = this.BMRGBAColor;
		this._color._storage = storage;
		storage.blue = blue;
	},

	/**
	 * The color's alpha component.
	 */
	_alpha: 1, // <Short>
	get alpha() { return this._alpha; },
	set alpha(alpha) {
		this._alpha = BMNumberByConstrainingNumberToBounds(alpha, 0, 1);
	},
	
	
	/** 
	 * The color's hue component in a HSLA representation.
	 */
	_hue: 0, // <Int>
	
	get hue() {
		return this._hue;
	},
	set hue(hue) {
		this._hue = BMNumberByConstrainingNumberToBounds(hue | 0, 0, 360);
	},
	
	/** 
	 * The color's saturation component in a HSLA representation.
	 */
	_saturation: 0, // <Short>
	
	get saturation() {
		return this._saturation;
	},
	set saturation(saturation) {
		this._saturation = BMNumberByConstrainingNumberToBounds(saturation | 0, 0, 100);
	},
	
	/** 
	 * The color's luminosity component in a HSLA representation.
	 */
	_luminosity: 0, // <Short>
	
	get luminosity() {
		return this._luminosity;
	},
	set luminosity(luminosity) {
		this._luminosity = BMNumberByConstrainingNumberToBounds(luminosity | 0, 0, 100);
	},
	
	/**
	 * Returns the equivalent HSLA color.
	 */
	get BMRGBAColor() { // <_BMRGBAColor>
		var RGBAColor = new _BMRGBAColor();
		
		// NOTE: code from http://en.wikipedia.org/wiki/HSL_color_space
		if (this._saturation == 0) {
			RGBAColor._red = RGBAColor._green = RGBAColor._blue = (((this._luminosity / 100) * 255) | 0);
		}
		else {
			var h = this._hue / 360;
			var l = this._luminosity / 100;
			var s = this._saturation / 100;
			
			var q = l < .5 ?  l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			
			RGBAColor._red = (_BMHueToRGB(p, q, h + 1 / 3) * 255) | 0;
			RGBAColor._green = (_BMHueToRGB(p, q, h) * 255) | 0;
			RGBAColor._blue = (_BMHueToRGB(p, q, h - 1 / 3) * 255) | 0;
		}
		
		RGBAColor._alpha = this._alpha;
		
		return RGBAColor;
	},
	
	/**
	 * The RGBA representation of this color.
	 */
	get RGBAString() { // <String>
		return this.BMRGBAColor.RGBAString;
	},
	
	/**
	 * The RGB representation of this color. The alpha component of this color is ignored in this representation.
	 */
	get RGBString() { // <String>
		return this.BMRGBAColor.RGBString;
	},
	
	/**
	 * The hex representation of this color. The alpha component of this color is ignored in this representation.
	 */
	get hexString() { // <String>
		return this.BMRGBAColor.hexString;
	},
	
	/**
	 * The HSLA representation of this color.
	 */
	get HSLAString() { // <String>
		return 'hsl(' + this._hue + ',' + this._saturation + '%,' + this._luminosity + '%,' + this._alpha + ')';
	},
	
	/**
	 * The HSL representation of this color. The alpha component of this color is ignored in this representation.
	 */
	get HSLString() { // <String>
		return 'hsl(' + this._hue + ',' + this._saturation + '%,' + this._luminosity + '%)';
	},
	
	/**
	 * Creates and returns a copy of this RGBA color.
	 * @return <BMColor> A color.
	 */
	copy: function () {
		var color = new _BMRGBAColor();
		
		color._hue = this._hue;
		color._saturation = this._saturation;
		color._luminosity = this._luminosity;
		color._alpha = this._alpha;
		
		return color;
		
	}
	
};

function _BMHueToRGB(p, q, t) {
	if (t < 0) {
		t += 1;
	}
	if (t > 1) {
		t -= 1;
	}
	if (t < 1/6) {
		return p + (q - p) * 6 * t;
	}
	if (t < 1/2) {
		return q;
	}
	if (t < 2/3) {
		return p + (q - p) * (2/3 - t) * 6;
	}
	
	return p;
}



// A JSON object containing all the color keywords with their hex values.
var _BMColorKeywords = { // <Object<String, String>>
  "aliceblue": "#f0f8ff",
  "antiquewhite": "#faebd7",
  "aqua": "#00ffff",
  "aquamarine": "#7fffd4",
  "azure": "#f0ffff",
  "beige": "#f5f5dc",
  "bisque": "#ffe4c4",
  "black": "#000000",
  "blanchedalmond": "#ffebcd",
  "blue": "#0000ff",
  "blueviolet": "#8a2be2",
  "brown": "#a52a2a",
  "burlywood": "#deb887",
  "cadetblue": "#5f9ea0",
  "chartreuse": "#7fff00",
  "chocolate": "#d2691e",
  "coral": "#ff7f50",
  "cornflowerblue": "#6495ed",
  "cornsilk": "#fff8dc",
  "crimson": "#dc143c",
  "cyan": "#00ffff",
  "darkblue": "#00008b",
  "darkcyan": "#008b8b",
  "darkgoldenrod": "#b8860b",
  "darkgray": "#a9a9a9",
  "darkgreen": "#006400",
  "darkgrey": "#a9a9a9",
  "darkkhaki": "#bdb76b",
  "darkmagenta": "#8b008b",
  "darkolivegreen": "#556b2f",
  "darkorange": "#ff8c00",
  "darkorchid": "#9932cc",
  "darkred": "#8b0000",
  "darksalmon": "#e9967a",
  "darkseagreen": "#8fbc8f",
  "darkslateblue": "#483d8b",
  "darkslategray": "#2f4f4f",
  "darkslategrey": "#2f4f4f",
  "darkturquoise": "#00ced1",
  "darkviolet": "#9400d3",
  "deeppink": "#ff1493",
  "deepskyblue": "#00bfff",
  "dimgray": "#696969",
  "dimgrey": "#696969",
  "dodgerblue": "#1e90ff",
  "firebrick": "#b22222",
  "floralwhite": "#fffaf0",
  "forestgreen": "#228b22",
  "fuchsia": "#ff00ff",
  "gainsboro": "#dcdcdc",
  "ghostwhite": "#f8f8ff",
  "gold": "#ffd700",
  "goldenrod": "#daa520",
  "gray": "#808080",
  "green": "#008000",
  "greenyellow": "#adff2f",
  "grey": "#808080",
  "honeydew": "#f0fff0",
  "hotpink": "#ff69b4",
  "indianred": "#cd5c5c",
  "indigo": "#4b0082",
  "ivory": "#fffff0",
  "khaki": "#f0e68c",
  "lavender": "#e6e6fa",
  "lavenderblush": "#fff0f5",
  "lawngreen": "#7cfc00",
  "lemonchiffon": "#fffacd",
  "lightblue": "#add8e6",
  "lightcoral": "#f08080",
  "lightcyan": "#e0ffff",
  "lightgoldenrodyellow": "#fafad2",
  "lightgray": "#d3d3d3",
  "lightgreen": "#90ee90",
  "lightgrey": "#d3d3d3",
  "lightpink": "#ffb6c1",
  "lightsalmon": "#ffa07a",
  "lightseagreen": "#20b2aa",
  "lightskyblue": "#87cefa",
  "lightslategray": "#778899",
  "lightslategrey": "#778899",
  "lightsteelblue": "#b0c4de",
  "lightyellow": "#ffffe0",
  "lime": "#00ff00",
  "limegreen": "#32cd32",
  "linen": "#faf0e6",
  "magenta": "#ff00ff",
  "maroon": "#800000",
  "mediumaquamarine": "#66cdaa",
  "mediumblue": "#0000cd",
  "mediumorchid": "#ba55d3",
  "mediumpurple": "#9370db",
  "mediumseagreen": "#3cb371",
  "mediumslateblue": "#7b68ee",
  "mediumspringgreen": "#00fa9a",
  "mediumturquoise": "#48d1cc",
  "mediumvioletred": "#c71585",
  "midnightblue": "#191970",
  "mintcream": "#f5fffa",
  "mistyrose": "#ffe4e1",
  "moccasin": "#ffe4b5",
  "navajowhite": "#ffdead",
  "navy": "#000080",
  "oldlace": "#fdf5e6",
  "olive": "#808000",
  "olivedrab": "#6b8e23",
  "orange": "#ffa500",
  "orangered": "#ff4500",
  "orchid": "#da70d6",
  "palegoldenrod": "#eee8aa",
  "palegreen": "#98fb98",
  "paleturquoise": "#afeeee",
  "palevioletred": "#db7093",
  "papayawhip": "#ffefd5",
  "peachpuff": "#ffdab9",
  "peru": "#cd853f",
  "pink": "#ffc0cb",
  "plum": "#dda0dd",
  "powderblue": "#b0e0e6",
  "purple": "#800080",
  "rebeccapurple": "#663399",
  "red": "#ff0000",
  "rosybrown": "#bc8f8f",
  "royalblue": "#4169e1",
  "saddlebrown": "#8b4513",
  "salmon": "#fa8072",
  "sandybrown": "#f4a460",
  "seagreen": "#2e8b57",
  "seashell": "#fff5ee",
  "sienna": "#a0522d",
  "silver": "#c0c0c0",
  "skyblue": "#87ceeb",
  "slateblue": "#6a5acd",
  "slategray": "#708090",
  "slategrey": "#708090",
  "snow": "#fffafa",
  "springgreen": "#00ff7f",
  "steelblue": "#4682b4",
  "tan": "#d2b48c",
  "teal": "#008080",
  "thistle": "#d8bfd8",
  "tomato": "#ff6347",
  "turquoise": "#40e0d0",
  "violet": "#ee82ee",
  "wheat": "#f5deb3",
  "white": "#ffffff",
  "whitesmoke": "#f5f5f5",
  "yellow": "#ffff00",
  "yellowgreen": "#9acd32"
};

// @endtype

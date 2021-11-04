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
export var BMCoreUI = '2.5.0'; // <String>

export var YES = true;
export var NO = false;

// This resolves an incompatbility with MS Edge
if (!('remove' in Element.prototype)) {
	/** @type {Object} */ const proto = Element.prototype;
    proto.remove = function() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

/**
 * Is set to YES if the current device is a touch device, otherwise it is set to NO.
 */
export var BMIsTouchDevice = !!('ontouchstart' in window || navigator.maxTouchPoints); // <Boolean>

// The cached scrollbar size.
var _BMScrollBarSize; // <Number>

/**
 * Returns the scrollbar size for the current platform.
 * @return <Number>			The scrollbar size.
 */
export function BMScrollBarGetSize() {
	// Return the cached size if it is available
	if (_BMScrollBarSize !== undefined) return _BMScrollBarSize;

	// Otherwise create a helper element to measure the scrollbar
	var helper = document.createElement('div');
	helper.style.cssText = 'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;';
	document.body.appendChild(helper);

	_BMScrollBarSize = helper.offsetWidth - helper.clientWidth;

	// Remove the helper after measuring the scrollbar
	helper.remove();

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
export function BMCSSRuleWithSelector(selector, args) {
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
export function BMAddSmoothMousewheelInteractionToNode(node, args) {
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
			target: lastEvent.target,
			altKey: lastEvent.altKey,
			ctrlKey: lastEvent.ctrlKey,
			metaKey: lastEvent.metaKey,
			shiftKey: lastEvent.shiftKey
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
 * Copies the properties and their definitions from all objects given as paramters to the first object given as a parameter.
 * Unlike jQuery's <code>$.extend</code> or <code>Object.assign</code>, this function will also copy getters and setters.
 * The property descriptors will be copied in the order in which the parameters are specified. For example, if the third parameter has a property
 * with the same name as the second parameter, the target object will have the third parameter's definition of that property.
 * @param target <AnyObject, nullable>		The object to which properties will be copied. May be set to undefined, in which case a new object will be created.
 * @param ... <[AnyObject], nullable>		Additional objects may be specified. The property descriptors will be copied over to the target object.
 * @return <AnyObject>						The target object.
 */
export function BMExtend(target) {
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
export function BMCopyProperties(target) {
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
export function BMShadowForElevation(elevation, options) {
	options = options || {};
	var opacity = options.opacity === undefined ? .1 : options.opacity;
	var outline = options.drawOutline || NO;
			
	var accentShadowSize = '0px ' + (4 * elevation) + 'px ' + (6 * elevation) + 'px';
	var diffShadowSize = '0px ' + (8 * elevation) + 'px ' + (12 * elevation) + 'px';
	var outlineBoxShadow = outline ? ', 0px 0px 1px 1px rgba(0, 0, 0, ' + opacity + ')' : '';
	
	return accentShadowSize + ' rgba(0, 0, 0, ' + opacity + '), ' + diffShadowSize + ' rgba(0, 0, 0, ' + opacity + ')' + outlineBoxShadow;
}

/**
 * Returns a number that represents the linear interpolation of two numbers using a fraction.
 * @param source <Number>		The source number.
 * @param target <Number>		The target number.
 * @param fraction <Number>		The amount by which to interpolate. The fraction should be a number between 0 and 1, but going past these values is supported.
 *								Negative values will overshoot the source number and values greater than 1 will overshoot the target number.
 * @return <Number>				The interpolated number.
 */
export function BMNumberByInterpolatingNumbersWithFraction(source, target, fraction) {
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
export function BMNumberByConstrainingNumberToBounds(value, low, high) {
	return Math.max(low, Math.min(value, high));
}

/**
 * Returns a copy of the given string that has the first letter uppercased.
 * @param string <String>		The string to capitalize.
 * @return <String>				The capitalized string.
 */
export function BMStringByCapitalizingString(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
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
export function BMKeysForValue(value, args) {
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
export function BMUUIDMake() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// @endtype

// @type BMHTMLEntity

/**
 * An enum containing HTML entities for various commonly used symbols.
 */
export var BMHTMLEntity = Object.freeze({ // <enum>
	/**
	 * The HTML entity representing the control key.
	 */
	Control: '&#8963;', // <enum>
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
	Return: '&#9166;', // <enum>
	/**
	 * The HTML entity representing the Escape symbol.
	 */
	Escape: '&#9099;', // <enum>
});

// @endtype

// @type BMScrollingDirectionVertical

/**
 * Contains constants representing the terminal vertical direction of a scrolling operation.
 */
export var BMScrollingDirectionVertical = Object.freeze({
	
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
export var BMScrollingDirectionHorizontal = Object.freeze({
	
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

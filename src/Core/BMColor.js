// @ts-check

import {BMNumberByConstrainingNumberToBounds, BMNumberByInterpolatingNumbersWithFraction} from './BMCoreUI'

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
export function BMColor() {} // <constructor>

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
export function BMColorMake() {
	return BMColorMakeWithRed(0, {green: 0, blue: 0, alpha: 0});
}


/**
 * Constructs and returns a BMColor object by parsing the given CSS color string.
 * The string can be a hex, rgba, rgb, hsla or hsl color or any of the CSS 3 color keywords.
 * If the string is not a valid color string, the resulting BMColor object is not defined.
 * @param string <String, nullable>		Defaults to 'rgba(0, 0, 0, 0)'. The color string.
 * @return <BMColor, nullable>			The new BMColor object or undefined if the color string cannot be parsed.
 */
export function BMColorMakeWithString(string) {

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
export function BMColorMakeWithRed(red, options) {
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
export function BMColorMakeWithHue(hue, options) {
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
export function BMColorMakeWithHexString(string) {
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
export function BMColorMakeWithRGBAString(string) {
	var color = new BMColor();
	
	color._storage = new _BMRGBAColor();
	color._storage._color = color;

	var components = string.split(',');
	
	color._storage.red = parseInt(components[0].substring(5), 10);
	color._storage.green = parseInt(components[1], 10);
	color._storage.blue = parseInt(components[2], 10);
	color._storage.alpha = parseFloat(components[3]);
	
	return color;
}


/**
 * Constructs and returns a new BMColor by parsing the specified RGB string.
 * @param string <String>	The RGB string.
 * @return <BMColor>		A color.
 */
export function BMColorMakeWithRGBString(string) {
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
export function BMColorMakeWithHSLAString(string) {
	var color = new BMColor();
	
	color._storage = new _BMHSLAColor();
	color._storage._color = color;

	var components = string.split(',');
	
	color._storage.hue = parseInt(components[0].substring(5), 10);
	color._storage.saturation = parseInt(components[1], 10);
	color._storage.luminosity = parseInt(components[2], 10);
	color._storage.alpha = parseFloat(components[3]);
	
	return color;
}


/**
 * Constructs and returns a new BMColor by parsing the specified RGB string.
 * @param string <String>	The RGB string.
 * @return <BMColor>		A color.
 */
export function BMColorMakeWithHSLString(string) {
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
export function BMColorByInterpolatingRGBAColor(sourceColor, options) {
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
export function BMColorByInterpolatingHSLAColor(sourceColor, options) {
	var targetColor = options.toColor;
	var fraction = options.withFraction;
	
	return BMColorMakeWithHue(BMNumberByInterpolatingNumbersWithFraction(sourceColor.hue, targetColor.hue, fraction), {
		saturation: BMNumberByInterpolatingNumbersWithFraction(sourceColor.saturation, targetColor.saturation, fraction),
		luminosity: BMNumberByInterpolatingNumbersWithFraction(sourceColor.luminosity, targetColor.luminosity, fraction),
		alpha: BMNumberByInterpolatingNumbersWithFraction(sourceColor.alpha, targetColor.alpha, fraction)
	});
}


/**
 * Converts the given number to a hex string that is guaranteed to have at least the specified number of digits.
 * @param number <Int>					The number to convert.
 * {
 *	@param minDigits <Int, nullable>	Defaults to 0. When set to a positive number, the resulting hex string will be padded with 0 if
 *										its length is lower than this parameter.
 * }
 * @return <String>						A hex string.
 */
export function BMHexStringWithNumber(number, options) {
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

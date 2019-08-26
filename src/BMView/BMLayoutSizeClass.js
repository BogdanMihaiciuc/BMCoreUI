// @type BMLayoutDimensionClass

import {NO} from '../Core/BMCoreUI'

/**
 * Constants that describe the size class of a dimension of the screen or an area of the screen.
 * The exact relationship between these constants and the size breakpoints to which they apply
 * is managed internally by CoreUI and is not exposed within this enum.
 */
export var BMLayoutDimensionClass = Object.freeze({ // <enum>

	/**
	 * Indicates that this dimension is compact, best suited for phone layouts.
	 */
	Compact: 'C', // <enum>

	/**
	 * Indicates that this dimension is regular, best suited for tablets and small laptops.
	 */
	Regular: 'R', // <enum>

	/**
	 * Indicates that this dimension is extended, best suited for desktop monitors, laptops and larger tablets.
	 */
	Extended: 'E', // <enum>

	/**
	 * Indicates that this dimension is unspecified. For configurations that depend upon a specific size class, this specifies
	 * that the configuration will apply to all dimensions.
	 */
	Any: '_', // <enum>

});

/**
 * Returns the appropriate layout dimension class for the given size.
 * @param size <Number>					The size.
 * @return <BMLayoutDimensionClass>		The dimension class.
 */
export function BMLayoutDimensionClassForSize(size) {
	if (!size) {
		return BMLayoutDimensionClass.Extended;
	}
	else if (size < 600) {
		return BMLayoutDimensionClass.Compact;
	}
	else if (size <= 1024) {
		return BMLayoutDimensionClass.Regular;
	}
	else {
		return BMLayoutDimensionClass.Extended;
	}
}

/**
 * Returns the appropriate maximal size for the given layout dimension class.
 * @param dimensionClass <BMLayoutDimensionClass>		The layout dimension class.
 * @return <Number>										The size.
 */
export function BMSizeForLayoutDimensionClass(dimensionClass) {
	if (dimensionClass == BMLayoutDimensionClass.Compact) {
		return 600;
	}
	else if (dimensionClass == BMLayoutDimensionClass.Regular) {
		return 1024;
	}
	else {
		return 0;
	}
}

// @endtype

// @type BMLayoutSizeClassDeviceKind

/**
 * Constants that describe the simplified device kind based on the screen's diagonal.
 */
export var BMLayoutSizeClassDeviceKind = Object.freeze({ // <enum>

	/**
	 * Indicates that the device is a phone based on the size of its screen.
	 */
	Phone: 'S', // <enum>

	/**
	 * Indicates that the device is a tablet based on the size of its screen.
	 */
	Tablet: 'T', // <enum>

	/**
	 * Indicates that the device is larger than a tablet based on the size of its screen.
	 */
	Extended: '_', // <enum>

});

// @endtype

// @type BMLayoutOrientation

/**
 * Constants that describe the orientation of the screen or an area of the screen.
 */
export var BMLayoutOrientation = Object.freeze({ // <enum>

	/**
	 * Indicates a portrait orientation, where the width is smaller than the height.
	 */
	Portrait: 'P', // <enum>

	/**
	 * Indicates a landscape orientation, where the width is greater than or equal to the height.
	 */
	Landscape: 'L', // <enum>

	/**
	 * Indicates that this orientation is unspecified. For configurations that depend upon a specific orientation, this specifies
	 * that the configuration will apply to all orientations.
	 */
	Any: '_', // <enum>

});

// @endtype

// @type BMLayoutSizeClass

/**
 * A layout size class describes the approximate size of the viewport or a portion of the viewport.
 * It is used to vary view and layout attributes to ensure an appropriate display on various
 * types of displays.
 *
 * In a view hierarchy, the size class refers to the entire hierarchy's size class - individual views
 * cannot declare their own specific size class - however the root of the view hierarchy may decide whether the
 * size class it uses depends on the size of the view hierarchy or the entire viewport.
 *
 * Layout classes are created by invoking the `layoutSizeClassWithWidthClass(_, {heightClass, orientation})` static method
 * and not through the constructor.
 * Some common size classes are available via specialized static methods:
 * * `phoneSizeClass()`
 * * `phoneSizeClassWithOrientation(_)`
 * * `tabletSizeClass()`
 * * `tabletSizeClassWithOrientation(_)`
 */
export function BMLayoutSizeClass() {} // <constructor>

BMLayoutSizeClass.prototype = {

	/**
	 * The simplified width dimension size class.
	 */
	_widthSizeClass: BMLayoutSizeClass.Extended, // <BMLayoutSizeClass>

	get widthSizeClass() {
		return this._widthSizeClass;
	},

	/**
	 * The maximum width to which this size class applies.
	 */
	_maximumWidth: 0, // <Number>

	get maximumWidth() {
		return this._maximumWidth;
	},

	/**
	 * The simplified height dimension size class.
	 */
	_heightSizeClass: BMLayoutSizeClass.Extended, // <BMLayoutSizeClass>

	get heightSizeClass() {
		return this._heightSizeClass;
	},

	/**
	 * The maximum height to which this size class applies.
	 */
	_maximumHeight: 0, // <Number>

	get maximumHeight() {
		return this._maximumHeight;
	},

	/**
	 * The orientation.
	 */
	_orientation: BMLayoutOrientation.Any, // <BMLayoutOrientation>

	get orientation() {
		return this._orientation;
	},

	/**
	 * The simplified device type.
	 */
	_deviceKind: BMLayoutSizeClassDeviceKind.Extended, // <BMLayoutSizeClassDeviceKind>

	get deviceType() {
		return this._deviceKind;
	},

	/**
	 * The maximum diagonal to which this size class applies.
	 */
	_maximumDiagonal: 0, // <Number>

	get maximumDiagonal() {
		return this._maximumDiagonal;
	},

	/**
	 * A number specifying the priority this size class has over other compatible size classes.
	 */
	_priority: 0, // <Number>

	get priority() {
		return this._priority;
	},

	/**
	 * Used internally by CoreUI for storage and identification.
	 */
	_hashString: undefined, // <String>

	/**
	 * Invoked by CoreUI during creation to create the hash string associated
	 * with this size class.
	 */
	_createHashString() {
		let hashTokens = [];
	
		// Compute the hash string to be able to store this size class efficiently
		if (this._maximumWidth) {
			hashTokens.push('w' + this._maximumWidth.toFixed());
		}
	
		if (this._maximumHeight) {
			hashTokens.push('h' + this._maximumWidth.toFixed());
		}
	
		if (this._maximumDiagonal) {
			hashTokens.push('d' + this._maximumDiagonal.toFixed());
		}
	
		if (this._orientation != BMLayoutOrientation.Any) {
			hashTokens.push(this._orientation);
		}
	
		this._hashString = hashTokens.join(' ');
	},

	/**
	 * Compares this size class to the given size class, returning `YES` if they are identical and
	 * `NO` otherwise. Note that in most cases, size class objects are reused across CoreUI, so identical
	 * size classes should have identical references as well.
	 * @param sizeClass <BMLayoutSizeClass, nullable>		The size class against which to compare this size class.
	 * @return <Boolean>									`YES` if the size classes are identical or `NO` otherwise. 
	 */
	isEqualToSizeClass(sizeClass) {
		if (!sizeClass) return NO;

		return this._hashString == sizeClass._hashString;
	},

	/**
	 * Returns a string representation of this size class.
	 * @return <String>			A string.
	 */
	toString() {
		return this._hashString;
	}
}

// A map that is used internally by CoreUI and contains all of the layout size classes that are currently active.
var _BMActiveLayoutSizeClasses = new Map;

/**
 * Constructs and returns a layout size class initialized with the given requirements.
 * @param maximumWidth <Number, nullable>				An optional maximum width that a viewport may have to match this size class.
 * {
 * 	@param maximumHeight <Number, nullable>				An optional maximum height that a viewport may have to match this size class.
 * 	@param maximumDiagonal <Number, nullable>			An optional maximum diagonal that a viewport may have to match this size class.
 * 	@param orientation <BMLayoutOrientation, nullable>	Defaults to .Any. An optional orientation that a viewport is required to have in
 * 														order to match this size class.
 * }
 */
BMLayoutSizeClass.layoutSizeClassWithMaximumWidth = function (width, args) {
	let sizeClass = new BMLayoutSizeClass();

	sizeClass._widthSizeClass = BMLayoutDimensionClassForSize(width);
	sizeClass._maximumWidth = width;
	sizeClass._heightSizeClass = BMLayoutDimensionClassForSize(args.maximumHeight);
	sizeClass._maximumHeight = args.maximumHeight;
	sizeClass._orientation = args.orientation || BMLayoutOrientation.Any;
	sizeClass._maximumDiagonal = args.maximumDiagonal || 0;

	// TODO: Assign a priority, exact semantics TBD
	let priority = 0;
	if (sizeClass._maximumWidth) priority += 10;
	if (sizeClass._maximumHeight) priority += 10;
	if (args.orientation !== BMLayoutOrientation.Any) priority += 1;

	sizeClass._priority = priority;

	sizeClass._createHashString();

	// If there is already a global reference to this size class, return it
	if (_BMActiveLayoutSizeClasses[sizeClass._hashString]) {
		return _BMActiveLayoutSizeClasses[sizeClass._hashString];
	}

	// Otherwise store a global reference and return the newly created size class
	_BMActiveLayoutSizeClasses[sizeClass._hashString] = sizeClass;
	return sizeClass;
}

/**
 * Constructs and returns a layout size class object initialized with the given requirements.
 * @param widthSizeClass <BMLayoutDimensionClass>		The simplified width size class.
 * {
 * 	@param heightSizeClass <BMLayoutDimensionClass>		The simplified height size class.
 * 	@param orientation <BMLayoutOrientation, nullable>		Defaults to .Any. The orientation.
 * }
 * @return <BMLayoutSizeClass>								A size class.
 */
BMLayoutSizeClass.layoutSizeClassWithWidthClass = function (widthSizeClass, args) {
	let sizeClass = new BMLayoutSizeClass();

	sizeClass._widthSizeClass = widthSizeClass;
	sizeClass._maximumWidth = BMSizeForLayoutDimensionClass(widthSizeClass);
	sizeClass._heightSizeClass = args.heightSizeClass;
	sizeClass._maximumHeight = BMSizeForLayoutDimensionClass(args.heightSizeClass);
	sizeClass._orientation = args.orientation || BMLayoutOrientation.Any;
	sizeClass._maximumDiagonal = 0;

	// TODO: Assign a priority, exact semantics TBD
	let priority = 0;
	if (sizeClass._maximumWidth) priority += 10;
	if (sizeClass._maximumHeight) priority += 10;
	if (args.orientation !== BMLayoutOrientation.Any) priority += 1;

	sizeClass._priority = priority;

	sizeClass._createHashString();

	// If there is already a global reference to this size class, return it
	if (_BMActiveLayoutSizeClasses[sizeClass._hashString]) {
		return _BMActiveLayoutSizeClasses[sizeClass._hashString];
	}

	// Otherwise store a global reference and return the newly created size class
	_BMActiveLayoutSizeClasses[sizeClass._hashString] = sizeClass;
	return sizeClass;
}

/**
 * Returns a size class that matches phones.
 * @return <BMLayoutSizeClass>				A size class.
 */
BMLayoutSizeClass.phoneSizeClass = function () {
	return this.phoneSizeClassWithOrientation(BMLayoutOrientation.Any);
}

/**
 * Returns a size class that matches phones whose screen is in the given orientation.
 * @param orientation <BMLayoutOrientation, nullable>		Defaults to .Any. The orientation.
 * @return <BMLayoutSizeClass>								A size class.
 */
BMLayoutSizeClass.phoneSizeClassWithOrientation = function (orientation) {
	let sizeClass = new BMLayoutSizeClass();
	
	sizeClass._maximumDiagonal = 1000;
	sizeClass._orientation = orientation || BMLayoutOrientation.Any;

	sizeClass._createHashString();

	// If there is already a global reference to this size class, return it
	if (_BMActiveLayoutSizeClasses[sizeClass._hashString]) {
		return _BMActiveLayoutSizeClasses[sizeClass._hashString];
	}

	// Otherwise store a global reference and return the newly created size class
	_BMActiveLayoutSizeClasses[sizeClass._hashString] = sizeClass;
	return sizeClass;
}

/**
 * Returns a size class that matches tablets.
 * @return <BMLayoutSizeClass>				A size class.
 */
BMLayoutSizeClass.tabletSizeClass = function () {
	return this.tabletSizeClassWithOrientation(BMLayoutOrientation.Any);
}

/**
 * Returns a size class that matches tablets whose screen is in the given orientation.
 * @param orientation <BMLayoutOrientation, nullable>		Defaults to .Any. The orientation.
 * @return <BMLayoutSizeClass>								A size class.
 */
BMLayoutSizeClass.tabletSizeClassWithOrientation = function (orientation) {
	let sizeClass = new BMLayoutSizeClass();
	
	sizeClass._maximumDiagonal = 1450;
	sizeClass._orientation = orientation || BMLayoutOrientation.Any;

	sizeClass._createHashString();

	// If there is already a global reference to this size class, return it
	if (_BMActiveLayoutSizeClasses[sizeClass._hashString]) {
		return _BMActiveLayoutSizeClasses[sizeClass._hashString];
	}

	// Otherwise store a global reference and return the newly created size class
	_BMActiveLayoutSizeClasses[sizeClass._hashString] = sizeClass;
	return sizeClass;
}

/**
 * Used internally to create a size class from a hash string.
 * @param hashString <String>			The hash string.
 * @return <BMLayoutSizeClass>			A size class.
 */
BMLayoutSizeClass._layoutSizeClassForHashString = function (hashString) {
	// If there is already a global reference to this size class, return it
	if (_BMActiveLayoutSizeClasses[hashString]) {
		return _BMActiveLayoutSizeClasses[hashString];
	}

	// Otherwise parse the hash string and store the newly created reference for future use
	let tokens = hashString.split(' ');
	let sizeClass = new BMLayoutSizeClass();
	sizeClass._hashString = hashString;

	for (let token of tokens) {
		let type = token.charAt(0);
		switch (type) {
			case 'w':
				sizeClass._maximumWidth = parseInt(token.substring(1, token.length));
				sizeClass._widthSizeClass = BMLayoutDimensionClassForSize(sizeClass._maximumWidth);
				break;
			case 'h':
				sizeClass._maximumHeight = parseInt(token.substring(1, token.length));
				sizeClass._heightSizeClass = BMLayoutDimensionClassForSize(sizeClass._maximumHeight);
				break;
			case 'd':
				sizeClass._maximumDiagonal = parseInt(token.substring(1, token.length));
				break;
			case 'P':
				sizeClass._orientation = BMLayoutOrientation.Portrait;
				break;
			case 'L':
				sizeClass._orientation = BMLayoutOrientation.Landscape;
				break;
			case 'p':
				sizeClass._priority = parseInt(token.substring(1, token.length));
				break;
		}
	}

	_BMActiveLayoutSizeClasses[sizeClass._hashString] = sizeClass;
	return sizeClass;
}

// @endtype
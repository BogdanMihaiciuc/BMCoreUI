// @ts-check

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
export function BMKeyPath() {}; // <constructor>

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
export function BMKeyPathMakeWithString(string) {
	
	return (new BMKeyPath).initWithString(string);
	
}


/**
 * Constructs and returns a new key path using the specified list of ordered key names.
 * @param components <[String]>		The array of keys.
 * @return <BMKeyPath>				A key path.
 */
export function BMKeyPathMakeWithComponents(components) {
	
	return (new BMKeyPath).initWithComponents(components);
	
}

// @endtype

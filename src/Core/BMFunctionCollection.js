// @ts-check

import {YES, BMExtend} from './BMCoreUI'

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
export function BMFunctionCollectionMake() {
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
		if (!(key in collection)) collection[key] = function () {
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

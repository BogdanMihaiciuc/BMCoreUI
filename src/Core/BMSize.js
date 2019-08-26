// @ts-check

import {BMNumberByInterpolatingNumbersWithFraction} from './BMCoreUI'
import {BMPoint} from './BMPoint'
import {BMRect} from './BMRect'

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
export function BMSize(width, height) { // <constructor>
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
export function BMSizeMake(width, height) {
	return new BMSize(width, height);
}

// @endtype

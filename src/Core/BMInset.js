// @ts-check

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
export function BMInset(left, top, right, bottom) { // <constructor>
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
export function BMInsetMakeWithEqualInsets(insets) {
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
export function BMInsetMake(left, top, right, bottom) {
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
export function BMInsetMakeWithLeft(left, args) {
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
// @ts-check

import {BMNumberByInterpolatingNumbersWithFraction, BMExtend} from './BMCoreUI'

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
export function BMPoint(x, y) { // <constructor>
	x = x || 0;
	y = y || 0;

	this.x = x;
	this.y = y;
};

BMPoint.prototype = {
	
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
		return BMDistanceBetweenPoints(this, BMOriginPoint);
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
		return BMSlopeAngleBetweenPoints(BMOriginPoint, this);
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
	 * Multiplies all of this point's components by the given scalar.
	 * @param scalar <Number> 		The scalar by which to multiply this point's components.
	 */
	multiplyWithScalar(scalar) {
		this.x *= scalar;
		this.y *= scalar;
	},

	/**
	 * Returns a copy of this point whose components are multiplied by the given scalar.
	 * @param scalar <Number>		The scalar by which to multiply the point's components.
	 * @return <BMPoint>			A point.
	 */
	pointByMultiplyingWithScalar(scalar) {
		const point = this.copy();
		point.multiplyWithScalar(scalar);
		return point;
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
	
};

/**
 * Constructs and returns a new point with the given coordinates.
 * @param x <Number, nullable>     	Defaults to 0. The x coordinate.
 * @param y <Number, nullable>     	Defaults to 0. The y coordinate.
 * @return <BMPoint>				A Point.
 */
export function BMPointMake(x, y) {
	return new BMPoint(x, y);
};

/**
 * Constructs and returns a new point with the given cartesian coordinates.
 * @param x <Number, nullable>     	Defaults to 0. The x coordinate.
 * {
 * 	@param y <Number, nullable>     Defaults to 0. The y coordinate.
 * }
 * @return <BMPoint>				A Point.
 */
export function BMPointMakeWithX(x, args) {
	return new BMPoint(x || 0, (args && args.y) || 0);
};


/**
 * Constructs and returns a new point with the given cartesian coordinates.
 * @param x <Number, nullable>     	Defaults to 0. The x coordinate.
 * {
 * 	@param y <Number, nullable>     Defaults to 0. The y coordinate.
 * }
 * @return <BMPoint>				A Point.
 */
BMPoint.pointWithX = BMPointMakeWithX;


/**
 * Constructs and returns a new point with the given polar coordinates.
 * @param radius <Number, nullable>     	Defaults to 0. The polar radius coordinate.
 * {
 * 	@param angle <Number, nullable>     	Defaults to 0. The polar angle coordinate in radians.
 * }
 * @return <BMPoint>				A Point.
 */
export function BMPointMakeWithRadius(radius = 0, {angle = 0} = {angle: 0}) {
	return BMPointMake(
		radius * Math.cos(angle),
		radius * Math.sin(angle)
	);
};


/**
 * Constructs and returns a new point with the given polar coordinates.
 * @param radius <Number, nullable>     	Defaults to 0. The polar radius coordinate.
 * {
 * 	@param angle <Number, nullable>     	Defaults to 0. The polar angle coordinate in radians.
 * }
 * @return <BMPoint>						A Point.
 */
BMPoint.pointWithRadius = BMPointMakeWithRadius;

/**
 * Computes and returns the absolute distance between the two given points.
 * @param fromPoint <BMPoint>		The first point.
 * @param toPoint <BMPoint>			The second point.
 * @return <Number>					The distance between the two points.
 */
export function BMDistanceBetweenPoints(fromPoint, toPoint) {
	return Math.sqrt(Math.pow(toPoint.x - fromPoint.x, 2) + Math.pow(toPoint.y - fromPoint.y, 2));
}

/**
 * Computes and returns the slope angle, in radians, between the two given points.
 * @param fromPoint <BMPoint>		The first point.
 * @param toPoint <BMPoint>			The second point.
 * @return <Number>					The angle in radians.
 */
export function BMSlopeAngleBetweenPoints(fromPoint, toPoint) {
	return Math.atan2(toPoint.y - fromPoint.y, toPoint.x - fromPoint.x);
}

/**
 * Represents the origin point.
 */
export const BMOriginPoint = BMPointMake(0, 0);

// @endtype
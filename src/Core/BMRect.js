// @ts-check

import {YES, NO, BMNumberByInterpolatingNumbersWithFraction} from './BMCoreUI'
import {BMSize} from './BMSize'
import {BMPoint} from './BMPoint'

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
export function BMRect(origin, size) { // <constructor>
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
        throw new Error('This method is not available.')
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
	 * Multiplies all of this rect's components by the given scalar.
	 * @param scalar <Number>		The scalar by which to multiply this rect's components.
	 */
	multiplyWithScalar(scalar) {
		this.origin.x *= scalar;
		this.origin.y *= scalar;
		this.size.width *= scalar;
		this.size.height *= scalar;
	},

	/**
	 * Returns a copy of this rect whose components are multiplied by the given scalar.
	 * @param scalar <Number>		The scalar by which to multiply the rect's components.
	 * @return <BMRect>				A rect.
	 */
	rectByMultiplyingWithScalar(scalar) {
		const rect = this.copy();
		rect.multiplyWithScalar(scalar);
		return rect;
	},

	/**
	 * Scales this rect by the given factor. The scale will be centered around the given
	 * point.
	 * @param factor <Number>						The amount by which to scale the rect. 
	 * {
	 * 	@param aroundPoint <BMPoint, nullable>		Defaults to the rect's center point. The point around which to perform the scaling.
	 * }
	 */
	scaleWithFactor(factor, args) {
		const point = args && args.aroundPoint || this.center;

		// The scaling is performed in such a way that the given point, expressed in terms
		// of percentages of the rect's width and height remains constant after the scaling operation

		// The percentage point is obtained by first converting the given point's coordinates to be relative to the
		// rect's origin, then obtaining the percentage values
		const percentagePoint = BMPointMake((point.x - this.origin.x) / this.size.width, (point.y - this.origin.y) / this.size.height);

		// Scale the dimensions
		this.size.width *= factor;
		this.size.height *= factor;

		// Move the origin point so that the ratio to the given point remains constant; this is essentially solving the equation at the
		// beginning of this method for the origin point components
		this.origin.x = point.x - percentagePoint.x * this.size.width;
		this.origin.y = point.y - percentagePoint.y * this.size.height;
	},

	/**
	 * Returns a copy of this rect that is scaled by the given factor. The scale will be centered around the given
	 * point.
	 * @param factor <Number>						The amount by which to scale the rect. 
	 * {
	 * 	@param aroundPoint <BMPoint, nullable>		Defaults to the rect's center point. The point around which to perform the scaling.
	 * }
	 * @return <BMRect>				A rect.
	 */
	rectByScalingWithFactor(factor, args) {
		const rect = this.copy();
		rect.scaleWithFactor(factor, args);
		return rect;
	},

	/**
	 * @deprecated Use either `insetWithWidth(_, {height})` or `insetWithInset(_)`.
	 * --------------------------------------------------
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
export function BMRectByInterpolatingRect(sourceRect, options) {
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
export function BMRectMake(x, y, width, height) {
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
export function BMRectMakeWithX(x, args) {
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
export function BMRectMakeWithOrigin(origin, args) {
	return new BMRect(origin || new BMPoint(), (args && args.size) || new BMSize());
}

/**
 * Creates and returns a rectangle that represents the area of the document currently occupied by the given DOM node.
 * The coordinates will be relative to the viewport and will take into account the current document scroll position.
 * @param DOMNode <DOMNode>				The node whose frame to get.
 * @return <BMRect>						A rect.
 */
export function BMRectMakeWithNodeFrame(DOMNode) {
	var boundingClientRect = DOMNode.getBoundingClientRect();
	
	return new BMRect(new BMPoint(boundingClientRect.left, boundingClientRect.top), new BMSize(boundingClientRect.width, boundingClientRect.height));
}

// @endtype
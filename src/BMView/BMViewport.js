// @ts-check

import {YES, NO} from '../Core/BMCoreUI'
import {BMLayoutOrientation} from './BMLayoutSizeClass'

// @type BMViewport

/**
 * A `BMViewport` is an object that describes the characteristics of a viewport, screen or portion of the viewport.
 * They are used by CoreUI to apply specific variations to constraints and view properties based on the current device and
 * browser configuration.
 * 
 * Typically you don't create viewport objects manually; instead, the root of the view hierarchy will provide an appropriate
 * viewport specification via its `viewport` property. It is also typically not required to actually access the `viewport` property
 * directly; view will automatically check the viewport dimensions against the active size classes and activate or deactivate them as needed.
 * 
 * The current viewport specification can be obtained by invoking the static `currentVewport()` method.
 */
export function BMViewport() {} // <constructor>

BMViewport.prototype = {

	/**
	 * The width of the viewport.
	 */
	_width: undefined, // <Number>
	get width() {
		return this._width;
	},

	/**
	 * The width of the viewport.
	 */
	_height: undefined, // <Number>
	get height() {
		return this._height;
	},

	/**
	 * The orientation of the viewport.
	 */
	_orientation: undefined, // <BMLayoutOrientation>
	get orientation() {
		return this._orientation;
	},

	/**
	 * The width of the viewport.
	 */
	_diagonal: undefined, // <Number>
	get diagonal() {
		return this._diagonal;
	},

	/**
	 * The minimum between the width and the height.
	 */
	_smallestDimension: undefined, // <Number>
	get smallestDimension() {
		return this._smallestDimension;
	},

	/**
	 * The surface area, in square pixels.
	 */
	_surfaceArea: undefined, // <Number>
	get surfaceArea() {
		return this._surfaceArea;
	},

	_measurements: undefined, // <Dictionary<AnyObject>>

	/**
	 * Designated initializer, invoked immediately after any viewport
	 * is constructed.
	 */
	init() {
		this._measurements = {};
	},

	/**
	 * This method is automatically invoked by CoreUI when this viewport is tested against a
	 * size class and there is no cached result.
	 * Tests whether this viewport matches the given size class and computes its match
	 * priority, then caches the result for easier retrieval in subsequent comparations.
	 * @param sizeClass <BMLayoutSizeClass>		The size class to test against.
	 */
	_measureCompatibilityWithSizeClass(sizeClass) {
		let measurement = {};

		let matches = YES;
		
		// Check that the width matches
		if (sizeClass._maximumWidth && this._width > sizeClass._maximumWidth) {
			matches = NO;
		}
		
		// The height
		if (sizeClass._maximumHeight && this._height > sizeClass._maximumHeight) {
			matches = NO;
		}
		
		// The diagonal
		if (sizeClass._maximumDiagonal && this._diagonal > sizeClass._maximumDiagonal) {
			matches = NO;
		}

		if (sizeClass._maximumSurfaceArea && this._surfaceArea > sizeClass._maximumSurfaceArea) {
			matches = NO;
		}
		
		// And the orientation
		if (sizeClass._orientation != BMLayoutOrientation.Any && this._orientation != sizeClass._orientation) {
			matches = NO;
		}

		measurement.matches = matches;

		if (!matches) {
			measurement.matchPriority = 0;
		}
		else {

			let priorities = [];
			
			
			// Compute the individual priorities of width, height and diagonal
			if (sizeClass._maximumWidth) {
				priorities.push(sizeClass._maximumWidth / this._width);
			}
			
			if (sizeClass._maximumHeight) {
				priorities.push(sizeClass._maximumHeight / this._height);
			}
			
			if (sizeClass._maximumDiagonal) {
				priorities.push(sizeClass._maximumDiagonal / this._diagonal);
			}
			
			if (sizeClass._maximumSurfaceArea) {
				priorities.push(sizeClass._maximumSurfaceArea / this._surfaceArea);
			}
	
			// If no numeric priorities have been computed, the size class is an orientation constraint
			// which currently defaults to a priority of 2
			if (!priorities.length) {
				measurement.matchPriority = 2;
			}
			else {
				// The final priority is the average of the individual priorities
				measurement.matchPriority = priorities.reduce((sum, value) => sum + value) / priorities.length;
			}
		}

		this._measurements[sizeClass._hashString] = measurement;

	},

	/**
	 * Tests whether this viewport matches the given size class.
	 * @param sizeClass <BMLayoutSizeClass>		The size class to check against.
	 * @return <Boolean>						`YES` if the viewport matches the given size class, `NO` otherwise.
	 */
	matchesSizeClass(sizeClass) {
		// Retrieve the cached comparation if it exists, otherwise perform and cache
		// the comparation then return its result
		if (!this._measurements[sizeClass._hashString]) {
			this._measureCompatibilityWithSizeClass(sizeClass);
		}

		return this._measurements[sizeClass._hashString].matches;
	},

	/**
	 * Returns a number that represents how closely this viewport matches the given size class.
	 * Lower numbers indicate a greater priority, with `1` being an exact match, 
	 * while `0` indicates that this viewport does not match the size class.
	 * 
	 * This value is used by CoreUI to determine the order in which to apply constraint variations
	 * when multiple size classes match the current viewport. If several size classes have the same
	 * priority, the order in which the variations are applied is not defined.
	 * @param sizeClass <BMLayoutSizeClass>		The size class to check against.
	 * @return <Number>							The matching priority.
	 */
	matchPriorityForSizeClass(sizeClass) {
		// Retrieve the cached priority if it exists, otherwise compute and cache
		// the priority then return its result
		if (!this._measurements[sizeClass._hashString]) {
			this._measureCompatibilityWithSizeClass(sizeClass);
		}

		return this._measurements[sizeClass._hashString].matchPriority;
	},

	/**
	 * Tests whether this viewport is identical to the given viewport.
	 * @param viewport <BMViewport>			The viewport to check against.
	 * @return <Boolean>					`YES` if the viewports are identical, `NO` otherwise.
	 */
	isEqualToViewport(viewport) {
		// It is sufficient to just check the width and height; the other properties are derived from these two values.
		return (this._width == viewport._width) && (this._height == viewport._height);
	}

}

/**
 * Returns a viewport object that matches the current viewport.
 */
BMViewport.currentViewport = function () {
	let viewport = new BMViewport;
	viewport.init();
	viewport._width = window.innerWidth;
	viewport._height = window.innerHeight;
	viewport._diagonal = Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2));
	viewport._orientation = viewport._width >= viewport._height ? BMLayoutOrientation.Landscape : BMLayoutOrientation.Portrait;
	viewport._surfaceArea = window.innerWidth * window.innerHeight;
	return viewport;
}

// @endtype
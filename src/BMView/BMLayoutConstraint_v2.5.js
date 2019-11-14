// @ts-check

import {YES, NO, BMExtend, BMCopyProperties, BMUUIDMake} from '../Core/BMCoreUI'
import {BMLayoutSizeClass} from './BMLayoutSizeClass'
import * as kiwi from 'kiwi.js'

// @type BMLayoutAttribute

/**
 * Constants representing the layout attributes used by the CoreUI layout engine.
 */
export var BMLayoutAttribute = Object.freeze({ // <enum>
	
	/**
	 * The attribute corresponding to a view's leading edge.
	 * This is the same as the left edge in a left-to-right layout and
	 * the same as the right edge in a right-to-left layout.
	 */
	Leading: 'Leading', // <enum>
	
	
	/**
	 * The attribute corresponding to a view's trailing edge.
	 * This is the same as the right edge in a left-to-right layout and
	 * the same as the left edge in a right-to-left layout.
	 */
	Trailing: 'Trailing', // <enum>
	
	
	/**
	 * The attribute corresponding to a view's left edge.
	 */
	Left: 'Left', // <enum>
	
	
	/**
	 * The attribute corresponding to a view's right edge.
	 */
	Right: 'Right', // <enum>
	
	
	/**
	 * The attribute corresponding to a view's top edge.
	 */
	Top: 'Top', // <enum>
	
	
	/**
	 * The attribute corresponding to a view's bottom edge.
	 */
	Bottom: 'Bottom', // <enum>
	
	
	/**
	 * The attribute corresponding to a view's horizontal center.
	 */
	CenterX: 'CenterX', // <enum>
	
	
	/**
	 * The attribute corresponding to a view's vertical center.
	 */
	CenterY: 'CenterY', // <enum>
	
	
	/**
	 * The attribute corresponding to a view's width.
	 */
	Width: 'Width', // <enum>
	
	
	/**
	 * The attribute corresponding to a view's height.
	 */
	Height: 'Height', // <enum>
	
	
	/**
	 * The attribute corresponding to a view's aspect ratio.
	 */
	AspectRatio: 'AspectRatio' // <enum>
	
});

// @endtype

// @type BMLayoutConstraintRelation

/**
 * Constants that describe the equality or inequality relation between the two sides of a constraint.
 */
export var BMLayoutConstraintRelation = Object.freeze({ // <enum>
	
	
	/**
	 * Indicates that the two sides of the constraint's equation should be equal.
	 */
	Equals: kiwi.Operator.Eq, // <enum>
	
	
	/**
	 * Indicates that the source view's attribute's value should be less than the right-hand side expression's value.
	 */
	LessThanOrEquals: kiwi.Operator.Le, // <enum>
	
	
	/**
	 * Indicates that the source view's attribute's value should be greater than the right-hand side expression's value.
	 */
	GreaterThanOrEquals: kiwi.Operator.Ge, // <enum>

});

// @endtype

// @type BMLayoutConstraintKind

/**
 * Constants that describe what type of view attribute a layout constraint affects.
 */
export var BMLayoutConstraintKind = Object.freeze({ // <enum>
	
	
	/**
	 * Indicates that this constraint affects a horizontal attribute.
	 */
	Horizontal: 'BMLayoutConstraintKindHorizontal', // <enum>
	
	
	/**
	 * Indicates that this constraint affects a vertical attribute.
	 */
	Vertical: 'BMLayoutConstraintKindVertical', // <enum>
	
	
	/**
	 * Indicates that this constraint affects the aspect ratio.
	 */
	AspectRatio: 'BMLayoutConstraintKindAspectRatio', // <enum>

});

// @endtype

const _BMLayoutConstraintClasses = {BMLayoutConstraint, BMEqualAttributeLayoutConstraint, BMEqualSpacingLayoutConstraint}

// @type BMLayoutConstraint

/**
 * A layout constraint is a mathematical equality or inequality between two layout attributes on a view.
 *
 * They are used as rules by the CoreUI layout engine to lay out views.
 *
 * A constraint is a linear equation that takes the form of 
 * ```js
view1.attribute1 = multiplier * view2.attribute2 + constant
```
 * where the equals sign can be replaced with an inequality sign as needed.
 * Note that despite looking like an assignment statement, the constraint expression is a mathematical equation and the layout
 * system may choose to modify either side (or even both) of the equation to fulfill the constraint's requirements.
 *
 * There are four types of layout constraints: vertical position, horizontal position, width and height. 
 * Each of them controls a specific aspect of a view's layout. A view must have constraints which clearly define all four of those
 * attributes for the layout system to be able to size it and position it correctly.
 * Additionally, constraints having an attribute of a type on the left hand side of the equation can only have an attribute of the same type on the right hand side.
 * In other words, for example, a view's vertical positioning can only depend on the vertical positioning of another view and not on its horizontal positioning or its size.
 * For views that have intrinsic sizes, the sizing constraints are optional as the intrinsic sizes of the views will be used by default as size constraint inequalities.
 * In addition, it is also possible to specify a constraint for a view's aspect ratio by linking its width to its own height.
 * Similarly, it is also possible to specify a constraint that makes a view's aspect ratio depend upon the aspect ratio of another view.
 * When creating an aspect ratio constraint, this may only be to another view's aspect ratio.
 *
 * Constraints may also have a priority value assigned to them. All constraints with a priority value lower than <code>BMLayoutConstraintPriorityRequired</code> are considered
 * optional. The layout system will try to fulfill them, but it does not guarantee that it will do so and optional constraints may be ignored if it is needed to do so to fulfill
 * the required constraints. When an optional constraint cannot be fulfilled, the layout system may nevertheless attempt to change the values of the attributes so that they are
 * as close as possible to fulfill the optional constraint without breaking the required constraints.
 */
export function BMLayoutConstraint() {} // <constructor>

/**
 * The priority value indicating that the constraint is required to be fulfilled.
 */
export var BMLayoutConstraintPriorityRequired = 1000; // <Number>

/**
 * Constructs and returns an internal layout constraint initialized with the given values.
 * The constraint will be marked inactive by default. Internal constraints are marked automatically as active
 * by CoreUI when needed.
 * @param view <BMView>										The source view.
 * {
 * 	@param attribute <BMLayoutAttribute>					The source view's attribute.
 * 	@param relatedBy <BMLayoutConstraintRelation, nullable>	Defaults to .Equals. The equation's equality or inequality sign.
 * 	@param toView <BMView, nullable>						The view to which the source view's attribute is related.
 * 															If omitted, the constraint will cause the view's attribute to be 
 * 															solely related to the equation's constant component.
 * 	@param secondAttribute <BMLayoutAttribute, nullable>	The second view's attribute. May only be omitted if the second view is also omitted.
 * 	@param multiplier <Number, nullable>					Defaults to 1. The equation's multiplier.
 * 	@param constant <Number, nullable>						Defaults to 0. The equation's constant component.
 * 	@param priority <Number, nullable>						Defaults to </code>BMLayoutConstraintPriorityRequired</code>. 
 * 															The constraint's priority.
 * }
 */
BMLayoutConstraint.internalConstraintWithView = function (view, args) {
	args._internal = YES;
	let constraint = BMLayoutConstraint.constraintWithView(view, args);
	return constraint;
}

/**
 * Constructs and returns a layout constraint initialized with the given values.
 * The constraint will be marked inactive by default. You must set the constraint's
 * <code>isActive</code> property to <code>YES</code> to make this constraint take part in layout calculations.
 * @param view <BMView>										The source view.
 * {
 * 	@param attribute <BMLayoutAttribute>					The source view's attribute.
 * 	@param relatedBy <BMLayoutConstraintRelation, nullable>	Defaults to .Equals. The equation's equality or inequality sign.
 * 	@param toView <BMView, nullable>						The view to which the source view's attribute is related.
 * 															If omitted, the constraint will cause the view's attribute to be 
 * 															solely related to the equation's constant component.
 * 	@param secondAttribute <BMLayoutAttribute, nullable>	The second view's attribute. May only be omitted if the second view is also omitted.
 * 	@param multiplier <Number, nullable>					Defaults to 1. The equation's multiplier.
 * 	@param constant <Number or String, nullable>			Defaults to 0. The equation's constant component.
 * 	@param priority <Number, nullable>						Defaults to </code>BMLayoutConstraintPriorityRequired</code>. 
 * 															The constraint's priority.
 * }
 * @return <BMLayoutConstraint>								A layout constraint.
 */
BMLayoutConstraint.constraintWithView = function (view, args) {
	var constraint = new BMLayoutConstraint();

	constraint._identifier = BMUUIDMake();

	constraint._sourceView = view;
	constraint._sourceViewAttribute = args.attribute;

	constraint._relation = args.relatedBy === undefined ? BMLayoutConstraintRelation.Equals : args.relatedBy;

	constraint._targetView = args.toView;
	constraint._targetViewAttribute = args.secondAttribute;

	constraint._multiplier = isNaN(args.multiplier) ? 1 : args.multiplier;
	constraint._constant = args.constant || 0;

	if (args.priority) {
		constraint._priority = args.priority;
	}
	else {
		constraint._priority = BMLayoutConstraintPriorityRequired;
	}

	if (args.attribute === BMLayoutAttribute.AspectRatio) {
		constraint._kind = BMLayoutConstraintKind.AspectRatio;
	}
	else if (args.attribute === BMLayoutAttribute.Top || args.attribute == BMLayoutAttribute.Bottom || args.attribute === BMLayoutAttribute.Height || args.attribute === BMLayoutAttribute.CenterY) {
		constraint._kind = BMLayoutConstraintKind.Vertical;
	}
	else {
		constraint._kind = BMLayoutConstraintKind.Horizontal;
	}

	constraint._variations = {};
	constraint._configuration = {constant: constraint._constant, priority: constraint._priority, isActive: constraint._isActive};
	if (typeof constraint._constant == 'string') {
		constraint._configuration.constantValue = view.rootView.valueForLayoutVariable(constraint._constant);
	}
	else {
		constraint._configuration.constantValue = constraint._constant;
	}


	// When creating temporary internal constraints, they should not be added to the views
	if (!args._internal) {
		constraint._install();
	}
	else {
		constraint._internal = YES;
	}

	return constraint;

};


/**
 * Creates and returns a constraint with the values of the given serialized constraint.
 * @param constraint <AnyObject>				The serialized constraint.
 * {
 * 	@param viewIDs <BMView ^(String)>			A block that is invoked for each view ID affected by the constraint.
 * 												The block is given a String ID and is expected to return the corresponding
 * 												view instance.
 * }
 * @return <BMLayoutConstraint, nullable>		The constraint, or `undefined` if the constraint could not be deserialized.
 */
BMLayoutConstraint.constraintWithSerializedConstraint = function (constraint, args) {
	return Object.create(_BMLayoutConstraintClasses[constraint._class || 'BMLayoutConstraint'].prototype).initWithSerializedConstraint(constraint, args);
}

BMLayoutConstraint.prototype = {

	/**
	 * A unique identifier assigned to this constraint. A random identifier is generated by CoreUI whenever a constraint
	 * is created, but the value of this property is not currently not used by CoreUI and can be freely modified after
	 * the constraint has been created.
	 * 
	 * The identifier can be used to quickly obtain a reference to a specific constraint from its view hierarchy via the
	 * `constraintWithIdentifier(_)` method on views.
	 */
	_identifier: undefined, // <String>
	get identifier() { return this._identifier },
	set identifier(identifier) {
		this._identifier = identifier;
	},

	/**
	 * The Cassowary solver to which this layout constraint has been attached.
	 */
	_solver: undefined, // <kiwi.Solver>

	/**
	 * The Cassowary constraint represented by this layout constraint.
	 */
	_constraint: undefined, // <kiwi.Constraint>

	/**
	 * Initializes this constraint with the values of the given serialized constraint.
	 * @param constraint <AnyObject>				The serialized constraint.
	 * {
	 * 	@param viewIDs <BMView ^(String)>			A block that is invoked for each view ID affected by the constraint.
	 * 												The block is given a String ID and is expected to return the corresponding
	 * 												view instance.
	 * }
	 * @return <BMLayoutConstraint, nullable>		This constraint, or `undefined` if the constraint could not be deserialized.
	 */
	initWithSerializedConstraint(constraint, args) {
		this._sourceViewAttribute = constraint._sourceViewAttribute;
		this._relation = constraint._relation;
		this._targetViewAttribute = constraint._targetViewAttribute;
		this._multiplier = constraint._multiplier;
		this._constant = constraint._constant;
		this._kind = constraint._kind;
		this._priority = constraint._priority;
		this._sourceView = args.viewIDs(constraint._sourceView);
		this._identifier = constraint._identifier || BMUUIDMake();

		this._isActive = (constraint._isActive === undefined) ? YES : constraint._isActive;

		if (!this._sourceView) return undefined;
		if (constraint._targetView) {
			this._targetView = args.viewIDs(constraint._targetView);
			if (!this._targetView) return undefined;
		}

		// For variations, it is required to re-create the size class object references from their hash strings
		this._variations = constraint._variations || {};
		for (let key in this._variations) {
			this._variations[key].sizeClass = BMLayoutSizeClass._layoutSizeClassForHashString(key);
		}

		// Create the configuration
		this._configuration = {constant: constraint._constant, priority: constraint._priority, isActive: constraint._isActive};
		this._updateConfiguration();

		this._install();

		return this;
	},

	/**
	 * Returns an array containing the attributes that this constraint affects
	 * for the given view. If this constraint does not affect that view, an empty
	 * array will be returned.
	 * @param view <BMView>				The view.
	 * @return <[BMLayoutAttribute]>	The list off affected attributes.
	 */
	affectedAttributesForView(view) {
		let attributes = [];

		if (view == this._sourceView) return [this._sourceViewAttribute];
		if (view == this._targetView) return [this._targetViewAttribute];

		return attributes;
	},

	/**
	 * Returns <code>YES</code> if this constraint represents a constraint collection.
	 */
	get isConstraintCollection() {
		return NO;
	},

	/**
	 * Returns an array of primitive constraints that make up this constraint.
	 * For primitive constraints, this will return an array containing only this constraint.
	 */
	get constituentConstraints() {
		return [this];
	},

	/**
	 * Used by the CoreUI layout editor to determine if the constant for this constraint may be modified.
	 * For primitive constraints this is always `YES`.
	 */
	get _hasEditableConstant() {
		return YES;
	},
	
	/**
	 * The source view, on the left hand side of the equation.
	 */
	_sourceView: undefined, // <BMView>
	
	/**
	 * The source view's attribute involved in the equation.
	 */
	_sourceViewAttribute: undefined, // <BMLayoutAttribute>
	
	/**
	 * The target view, on the right hand side of the equation.
	 * If this property is not specified, this will be interpreted as a constant constraint.
	 */
	_targetView: undefined, // <BMView, nullable>
	
	/**
	 * The target view's attribute involved in the equation.
	 * This property must be specified if <code>targetView</code> is also specified.
	 */
	_targetViewAttribute: undefined, // <BMLayoutAttribute, nullable>
	
	/**
	 * The equation's multiplier component.
	 */
	_multiplier: 1, // <Number>

	/**
	 * An object that describes the active configuration for the properties that can vary
	 * based on size classes for this layout constraint.
	 */
	_configuration: undefined, // <Object>

	/**
	 * Invoked by CoreUI when the active size classes change for the view hierarchy
	 * to which this constraint belongs. This causes the constraint to update its configuration
	 * to match the new size classes, based on its variations.
	 * @param sizeClasses <[BMLayoutSizeClass]> 	The active size classes.
	 */
	activeSizeClassesDidChange(sizeClasses) {
		this._updateConfiguration();
	},

	/**
	 * Invoked by CoreUI when the value of any layout variable changes for the view hierarchy to which this contraint
	 * belongs. If this constraint uses a layout variable as its constant value, it will update the value of its constant accordingly.
	 */
	layoutVariablesDidChange() {
		if (typeof this._configuration.constant == 'string') {
			this._updateConfiguration();
		}
	},

	/**
	 * Invoked by CoreUI whenever size classes are invalidated or variations are introduced for this
	 * layout constraint to cause the configuration used by this layout constraint to be updated.
	 */
	_updateConfiguration() {
		return this._updateConfigurationSilently(NO);
	},

	/**
	 * Invoked by CoreUI whenever size classes are invalidated or variations are introduced for this
	 * layout constraint to cause the configuration used by this layout constraint to be updated.
	 * @param silently <Boolean>			`YES` if this change should be silent, `NO` otherwise. If this change
	 * 										is silent, the internal configuration of this constraint will be updated, but this will
	 * 										not trigger any layout invalidations.
	 */
	_updateConfigurationSilently(silently) {
		let baseConfiguration = {constant: this._constant, priority: this._priority, isActive: this._isActive};
		let viewport = (this._sourceView || this._views[0]).viewport;
		
		// Check which variations should be active and in which order
		for (let key in this._variations) {
			this._variations[key]._matchPriority = viewport.matchPriorityForSizeClass(this._variations[key].sizeClass);
		}

		Object.keys(this._variations).map(key => this._variations[key]).sort((a, b) => b._matchPriority - a._matchPriority).forEach(variation => {
			if (!variation._matchPriority) return;

			if ('constant' in variation) baseConfiguration.constant = variation.constant;
			if ('priority' in variation) baseConfiguration.priority = variation.priority;
			if ('isActive' in variation) baseConfiguration.isActive = variation.isActive;
		});

		// Set to YES if the new configuration is different from the current configuration
		let hasChanges = NO;

		// Update the constant value accordingly
		if (typeof baseConfiguration.constant == 'string') {
			baseConfiguration.constantValue = this._sourceView.valueForLayoutVariable(baseConfiguration.constant);
		}
		else {
			baseConfiguration.constantValue = baseConfiguration.constant;
		}

		// Update the configuration to the newly computed configuration
		let oldConfiguration = this._configuration || baseConfiguration;
		this._configuration = baseConfiguration;
		if (this._reversesConstant) {
			baseConfiguration.constantValue = -baseConfiguration.constantValue;
		}

		if (this.isConstraintCollection) {
			for (let constraint of this.constituentConstraints) {
				constraint._updateConfiguration();
			}
			return;
		}

		if (silently) return;

		// Check how the configuration has changed and invalidate the layout accordingly
		if (oldConfiguration.isActive != baseConfiguration.isActive) {
			this._sourceView.needsLayout = YES;
			this._sourceView.rootView._invalidatedConstraints = YES;
			this._sourceView._checkConstraints();
			if (this._targetView) {
				this._targetView._checkConstraints();
			}
			hasChanges = YES;
		}

		if (oldConfiguration.priority != baseConfiguration.priority) {
			this._sourceView.needsLayout = YES;
			this._sourceView.rootView._invalidatedConstraints = YES;
			hasChanges = YES;
		}

		if (oldConfiguration.constantValue != baseConfiguration.constantValue) {
			if (!hasChanges) {
				// Only modify the constant directly if there are no other changes; otherwise the next layout pass will handle this
				hasChanges = YES;
				
				// When changing the constant, update the attached solver, if there is one
				if (this._solver) {
					if (this._constraint) {
						// Removing a constraint should never cause a layout that was previously solvable to become unsolvable;
						// it may at most lead to an ambiguous layout
						if (this._solver.hasConstraint(this._constraint)) this._solver.removeConstraint(this._constraint);
						this._constraint = undefined;
					}
					// If this constant change causes the layout to be unsolvable, catch the error
					// and trigger a full layout pass afterwards to invalidate this constraint
					try {
						this._solver.addConstraint(this._cassowaryConstraint);
					}
					catch (layoutError) {
						this._cassowaryConstraint = undefined;
						this._sourceView.rootView._invalidatedConstraints = YES;
						this._sourceView.layout();
					}
				}

				if (baseConfiguration.isActive) {
					this._sourceView.needsLayout = YES;
				}
			}
		}
	},

	/**
	 * @deprecated - Unused
	 * Returns an object containing the configuration for the current size class.
	 */
	get _activeConfiguration() { // <Object>
		let baseConfiguration = {constant: this._constant, priority: this._priority, isActive: this._isActive};

		let sizeClass = this._sourceView.sizeClass;

		// Find the list of size classes compatible with the view's size class
		let compatibleVariations = [];
		for (let key in this._variations) {
			let variationSizeClass = this._variations[key].sizeClass;

			if (variationSizeClass.matchesSizeClass(sizeClass)) {
				compatibleVariations.push(this._variations[key]);
			}
		}

		// Sort the size classes by priority, then copy over the variations in ascending priority order
		compatibleVariations.sort((a, b) => b.sizeClass._priority - a.sizeClass._priority).forEach(variation => {
			BMCopyProperties(baseConfiguration, variation);
		});

		// Return the composed configuration object
		return baseConfiguration;
	},

	/**
	 * The equation's constant component.
	 */
	_constant: 0, // <Number or String>
	get constant() {
		return this._constant;
	},
	set constant(constant) {
		if (constant == this._constant) return;
		this._constant = constant;
		return this._updateConfiguration();

		// When changing the constant, update the attached solver, if there is one
		if (this._solver) {
			if (this._constraint) {
				this._solver.removeConstraint(this._constraint);
				this._constraint = undefined;
			}
			this._solver.addConstraint(this._cassowaryConstraint);
		}

		if (this.isActive) {
		    this._sourceView.needsLayout = YES;
		}
	},

	/**
	 * Sets this constraint's constant value for the given size class.
	 * @param constant <Number or String>			The constant.
	 * {
	 * 	@param forSizeClass <BMLayoutSizeClass>		The layout size class to which the constant should apply.
	 * }
	 */
	setConstant(constant, args) {
		if (!this._variations[args.forSizeClass._hashString]) {
			this._variations[args.forSizeClass._hashString] = {sizeClass: args.forSizeClass};
			if (this.isConstraintCollection) {
				this._views[0].rootView._invalidatedSizeClasses = YES;
			}
			else {
				this._sourceView.rootView._invalidatedSizeClasses = YES;
			}
		}

		this._variations[args.forSizeClass._hashString].constant = constant;

		// Update the configuration if this change affects the current size classes
		if ((this._sourceView || this._views[0]).viewport.matchesSizeClass(args.forSizeClass)) {
			this._updateConfiguration();
		}
	},

	/**
	 * Removes this constraint's constant variation for the given size class.
	 * If this constraint doesn't have a constant variation for this size class, this method does nothing.
	 * @param sizeClass <BMLayoutSizeClass>			The layout size class.
	 */
	removeConstantVariationForSizeClass(sizeClass) {
		if (this._variations[sizeClass._hashString]) {
			// Delete the constant variation
			delete this._variations[sizeClass._hashString].constant;

			// Remove the variations object for this size class if there are no other variations left
			if (Object.keys(this._variations[sizeClass._hashString]).length == 1) {
				delete this._variations[sizeClass._hashString];
				if (this.isConstraintCollection) {
					this._views[0].rootView._invalidatedSizeClasses = YES;
				}
				else {
					this._sourceView.rootView._invalidatedSizeClasses = YES;
				}
			}

			// Update the configuration if this change affects the current size classes
			if ((this._sourceView || this._views[0]).viewport.matchesSizeClass(sizeClass)) {
				this._updateConfiguration();
			}
		}
	},

	/**
	 * Used to verify if this layout constraint has a constant variation for the given size class.
	 * @param sizeClass <BMLayoutSizeClass>			The size class.
	 * @return <Boolean>							`YES` if this constraint has a constant variation for the size class, `NO` otherwise.
	 */
	hasConstantVariationForSizeClass(sizeClass) {
		if (this._variations[sizeClass._hashString]) {
			return 'constant' in this._variations[sizeClass._hashString];
		}
		return NO;
	},

	/**
	 * @deprecated - Unused
	 * Returns this constraint's constant for the currently active size class.
	 */
	get activeConstant() { // <Number or String>
		// TODO:
		return this._configuration.constant;
		let sizeClassHash = this._sourceView.sizeClass._hashString;

		if ('constant' in this._variations[sizeClassHash]) {
			return this._variations[sizeClassHash].constant;
		}

		return this._constant;
	},

	/**
	 * The constraint's priority.
	 */
	_priority: BMLayoutConstraintPriorityRequired, // <Number>

	get priority() {
		return this._priority;
	},
	set priority(priority) {
		if (this._priority != priority) {
			this.priority = priority;
			return this._updateConfiguration();
			
			this._sourceView.needsLayout = YES;

			if (this._targetView) this._targetView.needsLayout = YES;
			this._sourceView.rootView._invalidatedConstraints = YES;
		}
	},

	/**
	 * Sets this constraint's priority value for the given size class.
	 * @param priority <Number>						The priority.
	 * {
	 * 	@param forSizeClass <BMLayoutSizeClass>		The layout size class to which the priority should apply.
	 * }
	 */
	setPriority(priority, args) {
		if (!this._variations[args.forSizeClass._hashString]) {
			this._variations[args.forSizeClass._hashString] = {sizeClass: args.forSizeClass};
			if (this.isConstraintCollection) {
				this._views[0].rootView._invalidatedSizeClasses = YES;
			}
			else {
				this._sourceView.rootView._invalidatedSizeClasses = YES;
			}
		}

		this._variations[args.forSizeClass._hashString].priority = priority;

		// Update the configuration if this change affects the current size classes
		if ((this._sourceView || this._views[0]).viewport.matchesSizeClass(args.forSizeClass)) {
			this._updateConfiguration();
		}
	},

	/**
	 * Removes this constraint's priority variation for the given size class.
	 * If this constraint doesn't have a priority variation for this size class, this method does nothing.
	 * @param sizeClass <BMLayoutSizeClass>			The layout size class.
	 */
	removePriorityVariationForSizeClass(sizeClass) {
		if (this._variations[sizeClass._hashString]) {
			// Delete the constant variation
			delete this._variations[sizeClass._hashString].priority;

			// Remove the variations object for this size class if there are no other variations left
			if (Object.keys(this._variations[sizeClass._hashString]).length == 1) {
				delete this._variations[sizeClass._hashString];
				if (this.isConstraintCollection) {
					this._views[0].rootView._invalidatedSizeClasses = YES;
				}
				else {
					this._sourceView.rootView._invalidatedSizeClasses = YES;
				}
			}

			// Update the configuration if this change affects the current size classes
			if ((this._sourceView || this._views[0]).viewport.matchesSizeClass(sizeClass)) {
				this._updateConfiguration();
			}
		}
	},

	/**
	 * Used to verify if this layout constraint has a priority variation for the given size class.
	 * @param sizeClass <BMLayoutSizeClass>			The size class.
	 * @return <Boolean>							`YES` if this constraint has a priority variation for the size class, `NO` otherwise.
	 */
	hasPriorityVariationForSizeClass(sizeClass) {
		if (this._variations[sizeClass._hashString]) {
			return 'priority' in this._variations[sizeClass._hashString];
		}
		return NO;
	},

	/**
	 * @deprecated - Unused
	 * Returns this constraint's priority for the currently active size class.
	 */
	get activePriority() { // <Number>
		// TODO:
		return this._configuration.priority;
		let sizeClassHash = this._sourceView.sizeClass._hashString;

		if ('priority' in this._variations[sizeClassHash]) {
			return this._variations[sizeClassHash].priority;
		}

		return this._priority;
	},

	/**
	 * The equation sign.
	 */
	_relation: BMLayoutConstraintRelation.Equals, // <BMLayoutConstraintRelation>

	/**
	 * The kind of layout constraint.
	 */
	_kind: undefined, // <BMLayoutConstraintKind>

	/**
	 * Returns a string representing this constraint's category, for debugging purposes.
	 */
	get categoryKind() { // <String>
		if (this._kind == BMLayoutConstraintKind.Vertical) {
			if (this._sourceViewAttribute == BMLayoutAttribute.Height) {
				return 'Height';
			}
			else {
				return 'Vertical Position';
			}
		}
		else {
			if (this._sourceViewAttribute == BMLayoutAttribute.Width) {
				return 'Width';
			}
			else {
				return 'Horizontal Position';
			}
		}
	},

	/**
	 * Defaults to NO. Should be set to YES to cause this constraint to become active and affect the layout.
	 * 
	 * For newly created constraints, it is up to the developer to mark the constraint as active, however in most cases
	 * where constraints are created automatically, the view that manages the layout hierarchy will typically
	 * manage the active state of constraints it owns, based on the current set of size traits.
	 * 
	 * This operation will throw an exception if the views to which the constraint is related are not part of the same view hierarchy.
	 */
	_isActive: NO, // <Boolean>
	get isActive() {
		return this._isActive;
	},
	set isActive(active) {
		if (active != this._isActive) {
			this._isActive = active;
			return this._updateConfiguration();
			this._sourceView._checkConstraints();
			this._sourceView.needsLayout = YES;
			this._sourceView.rootView._invalidatedConstraints = YES;

			if (this._targetView) {
				if (this._targetView.rootView != this._sourceView.rootView) {
					throw new Error('[BMCoreUI] Incorrectly attempting to activate a layout constraint that affects two views that do not share a common ancestor.');
				}

				this._targetView._checkConstraints();
				this._targetView.needsLayout = YES;
			}
		}
	},

	/**
	 * Sets this constraint's active state for the given size class.
	 * @param isActive <Number>						The active state.
	 * {
	 * 	@param forSizeClass <BMLayoutSizeClass>		The layout size class to which the active state should apply.
	 * }
	 */
	setIsActive(isActive, args) {
		if (!this._variations[args.forSizeClass._hashString]) {
			this._variations[args.forSizeClass._hashString] =  {sizeClass: args.forSizeClass};
			if (this.isConstraintCollection) {
				this._views[0].rootView._invalidatedSizeClasses = YES;
			}
			else {
				this._sourceView.rootView._invalidatedSizeClasses = YES;
			}
		}

		this._variations[args.forSizeClass._hashString].isActive = isActive;

		// Update the configuration if this change affects the current size classes
		if ((this._sourceView || this._views[0]).viewport.matchesSizeClass(args.forSizeClass)) {
			this._updateConfiguration();
		}
	},

	/**
	 * Removes this constraint's active variation for the given size class.
	 * If this constraint doesn't have a active variation for this size class, this method does nothing.
	 * @param sizeClass <BMLayoutSizeClass>			The layout size class.
	 */
	removeIsActiveVariationForSizeClass(sizeClass) {
		if (this._variations[sizeClass._hashString]) {
			// Delete the constant variation
			delete this._variations[sizeClass._hashString].isActive;

			// Remove the variations object for this size class if there are no other variations left
			if (Object.keys(this._variations[sizeClass._hashString]).length == 1) {
				delete this._variations[sizeClass._hashString];
				if (this.isConstraintCollection) {
					this._views[0].rootView._invalidatedSizeClasses = YES;
				}
				else {
					this._sourceView.rootView._invalidatedSizeClasses = YES;
				}
			}

			// Update the configuration if this change affects the current size classes
			if ((this._sourceView || this._views[0]).viewport.matchesSizeClass(sizeClass)) {
				this._updateConfiguration();
			}
		}
	},

	/**
	 * Used to verify if this layout constraint has an isActive variation for the given size class.
	 * @param sizeClass <BMLayoutSizeClass>			The size class.
	 * @return <Boolean>							`YES` if this constraint has an isActive variation for the size class, `NO` otherwise.
	 */
	hasIsActiveVariationForSizeClass(sizeClass) {
		if (this._variations[sizeClass._hashString]) {
			return 'isActive' in this._variations[sizeClass._hashString];
		}
		return NO;
	},

	/**
	 * Returns `YES` if this constraint can affect the layout depending on the view hierarchy's current size class.
	 */
	get affectsLayout() { // <Boolean>
		return this._configuration.isActive;
		let sizeClassHash = this._sourceView.sizeClass._hashString;

		if ('isActive' in this._variations[sizeClassHash]) {
			return this._variations[sizeClassHash].isActive;
		}

		return this._isActive;
	},

	/**
	 * Invoked internally to install this constraint onto the views it affects.
	 */
	_install() {	
		this._sourceView._addConstraint(this);

		if (this._targetView) {
			this._targetView._addConstraint(this);
		}

		this._sourceView.rootView._invalidatedConstraints = YES;
	},

	/**
	 * Should be invoked when this constraint is no longer needed and should be removed from the views it affects.
	 * This constraint cannot be marked active after invoking this method.
	 */
	remove() {
		if (this._isActive) {
			this._sourceView.needsLayout = YES;
		}

		this._isActive = NO;
		this._sourceView._removeConstraint(this);
		this._sourceView.rootView._invalidatedConstraints = YES;
		if (this._targetView) {
			this._targetView.needsLayout = YES;
			this._targetView._removeConstraint(this);
			this._sourceView.rootView._invalidatedConstraints = YES;
		}

		this._sourceView = undefined;
		this._targetView = undefined;
	},

	/**
	 * Invoked internally by CoreUI to retrieve the Cassowary expression that will be
	 * generated by this layout constraint. This expression will be used as the basis of
	 * the Cassowary constraint that will finally be used in the layout calculations.
	 */
	get _cassowaryExpression() { // <[kiwi.Expression]>
		// Resolve the constant if it is a layout variable
		let constant = this._configuration.constantValue || 0;
		//if (typeof constant === 'string') constant = this._sourceView._layoutVariables[constant] || 0;

		if (!this._targetView) {
			if (this._sourceViewAttribute == BMLayoutAttribute.AspectRatio) {
				// The aspect ratio is treated differently
				// It expressed as Ratio * Height - Width = 0
				return new kiwi.Expression(
					[constant, this._sourceView._variables[BMLayoutAttribute.Height]],
					[-1, this._sourceView._variables[BMLayoutAttribute.Width]]
				);
			}
			else {
				// All other attributes use expression provided by the view itself
				return constant ? 
					this._sourceView._cassowaryExpressionForLayoutAttribute(this._sourceViewAttribute).plus(-constant) :
					this._sourceView._cassowaryExpressionForLayoutAttribute(this._sourceViewAttribute);
			}
		}
		else {
			if (this._sourceViewAttribute == BMLayoutAttribute.AspectRatio) {
				if (this._targetViewAttribute != BMLayoutAttribute.AspectRatio) {
					throw new Error('[BMCoreUI] Aspect ratio constraints must affect both views\' aspect ratio.');
				}

				throw new Error('[BMCoreUI] Non-constant aspect ratio constraint are currently not supported.');
			}

			// All two-view constraints are treated as the following epxression
			// View1.Attribute - Multiplier * View2.Attribute - Constant = 0
			var baseExpression = new kiwi.Expression(
				this._sourceView._cassowaryExpressionForLayoutAttribute(this._sourceViewAttribute)
			).minus(
				this._targetView._cassowaryExpressionForLayoutAttribute(this._targetViewAttribute, {withMultiplier: this._multiplier})
			);

			if (constant) {
				if (!this._sourceView.LTRLayout && this._kind == BMLayoutConstraintKind.Horizontal && this._sourceViewAttribute != BMLayoutAttribute.Width) {
					// Horizontal position RTL layouts need to have the constant's sign swapped
					baseExpression = baseExpression.plus(constant);
				}
				else {
					baseExpression = baseExpression.minus(constant);
				}
			}

			return baseExpression;
		}
	},

	/**
	 * Invoked internally by CoreUI to retrieve the Cassowary constraint that will be
	 * generated by this layout constraint.
	 */
	get _cassowaryConstraint() {
		if (this._constraint) return this._constraint;

		var expression = this._cassowaryExpression;

		// CoreUI priorities go up to 1000 (Required)
		// which is mapped to the cassowary required strength value
		var priority = (this._configuration.priority == BMLayoutConstraintPriorityRequired ? 
			kiwi.Strength.required :
			this._configuration.priority / 1000 * kiwi.Strength.required);

		// Horizontal position RTL layouts need to have the inequality sign swapped
		let relation = this._relation;
		if (!this._sourceView.LTRLayout && this._kind == BMLayoutConstraintKind.Horizontal && this._sourceViewAttribute != BMLayoutAttribute.Width) {
			if (this._relation == BMLayoutConstraintRelation.GreaterThanOrEquals) {
				relation = BMLayoutConstraintRelation.LessThanOrEquals;
			}
			else if (this._relation == BMLayoutConstraintRelation.LessThanOrEquals) {
				relation = BMLayoutConstraintRelation.GreaterThanOrEquals;
			}
		}

		// CoreUI expressions always use 0 on the right-hand side
		this._constraint = new kiwi.Constraint(expression, relation, undefined, priority);
		return this._constraint;
	},

	/**
	 * An object that specifies the variations supported by this layout constraint across
	 * the size classes supported by its view hierarchy.
	 */
	_variations: undefined, // <Dictionary<BMLayoutConstraintVariation>>

	/**
	 * Returns a variations object that can be serialized.
	 */
	get _serializedVariations() {
		let variations = {};

		if (this._variations) {
			Object.keys(this._variations).forEach(key => {
				variations[key] = {};
				Object.keys(this._variations[key]).forEach(key2 => {
					if (key2 == 'sizeClass') return;
					variations[key][key2] = this._variations[key][key2];
				})
			});
		}

		return variations;
	},

	/**
	 * Returns a string representation of this constraint. This is
	 * often used when generating layout-related debug messages.
	 * The contents of the string depend on the currently active size classes.
	 * @return <String>			A string.
	 */
	toString() {
		let operatorMap = {
			[BMLayoutConstraintRelation.Equals]: '=',
			[BMLayoutConstraintRelation.GreaterThanOrEquals]: '\u2265',
			[BMLayoutConstraintRelation.LessThanOrEquals]: '\u2264'
		}
		
		if (this._targetView) {

			let constant = this._configuration.constant ? `${this._configuration.constant < 0 ? '-' : '+'} ${this._configuration.constant < 0 ? -this._configuration.constant : this._configuration.constant}` : '';

			return `${this._sourceView.debuggingName || this._sourceView.node.id}.${this._sourceViewAttribute} ${operatorMap[this._relation]} \
			${(this._multiplier != 1 ? this._multiplier + '* ' : '')}${this._targetView.debuggingName || this._targetView.node.id}.${this._targetViewAttribute} \
			${constant}`;
		}
		return `${this._sourceView.debuggingName || this._sourceView.node.id}.${this._sourceViewAttribute} ${operatorMap[this._relation]} ${this._configuration.constant} (${this._configuration.priority})`;
	},

	/**
	 * Returns a string representation of this constraint. This is
	 * often used when generating layout-related debug messages.
	 * The contents of the string depend on the currently active size classes.
	 * @return <String>			A string.
	 */
	toCompactString() {
		let operatorMap = {
			[BMLayoutConstraintRelation.Equals]: '=',
			[BMLayoutConstraintRelation.GreaterThanOrEquals]: '\u2265',
			[BMLayoutConstraintRelation.LessThanOrEquals]: '\u2264'
		}

		let sourceAttribute = this._sourceViewAttribute.charAt(0);
		if (this._sourceViewAttribute == BMLayoutAttribute.Left) sourceAttribute = 'Lf';
		
		if (this._targetView) {
			let targetAttribute = this._targetViewAttribute.charAt(0);
			if (this._targetViewAttribute == BMLayoutAttribute.Left) targetAttribute = 'Lf';

			let constant = this._configuration.constant ? `${this._configuration.constant < 0 ? '-' : '+'} ${this._configuration.constant < 0 ? -this._configuration.constant : this._configuration.constant}` : '';

			return `${this._sourceView.debuggingName || this._sourceView.node.id}.${sourceAttribute} ${operatorMap[this._relation]} \
			${(this._multiplier != 1 ? this._multiplier + '* ' : '')}${this._targetView.debuggingName || this._targetView.node.id}.${targetAttribute} \
			${constant}`;
		}
		return `${this._sourceView.debuggingName || this._sourceView.node.id}.${sourceAttribute} ${operatorMap[this._relation]} ${this._configuration.constant}`;
	},

	/**
	 * Returns a string representation of this constraint that is relative to the given view. This is
	 * often used when generating layout-related debug messages.
	 * The contents of the string depend on the currently active size classes.
	 * @param view <BMView>		The view for which to return the description.
	 * @return <String>			A string.
	 */
	descriptionRelativeToView(view) {
		let operatorMap = {
			[BMLayoutConstraintRelation.Equals]: '=',
			[BMLayoutConstraintRelation.GreaterThanOrEquals]: '\u2265',
			[BMLayoutConstraintRelation.LessThanOrEquals]: '\u2264'
		}

		if (this._sourceView !== view && this._targetView!== view) return this.toString();
		
		if (this._targetView) {
			const constant = this._configuration.constant ? `${this._configuration.constant < 0 ? '-' : '+'} ${this._configuration.constant < 0 ? -this._configuration.constant : this._configuration.constant}` : '';

			if (this._sourceView === view) {
				const constant = this._configuration.constant ? `${this._configuration.constant < 0 ? '-' : '+'} ${this._configuration.constant < 0 ? -this._configuration.constant : this._configuration.constant}` : '';
				return `${this._sourceViewAttribute} ${operatorMap[this._relation]} \
						${(this._multiplier != 1 ? this._multiplier + '* ' : '')}${this._targetView.debuggingName || this._targetView.node.id}.${this._targetViewAttribute} \
						${constant}`;
			}
			else {
				const constant = this._configuration.constant ? `${this._configuration.constant > 0 ? '-' : '+'} ${this._configuration.constant < 0 ? -this._configuration.constant : this._configuration.constant}` : '';
				const operatorMap = {
					[BMLayoutConstraintRelation.Equals]: '=',
					[BMLayoutConstraintRelation.GreaterThanOrEquals]: '\u2264',
					[BMLayoutConstraintRelation.LessThanOrEquals]: '\u2265'
				}

				return `${this._targetViewAttribute}  ${operatorMap[this._relation]} \
						${(this._multiplier != 1 ? '(' : '')}${this._sourceView.debuggingName || this._sourceView.node.id}.${this._sourceViewAttribute} \
						${constant}${(this._multiplier != 1 ? ') / ' + this._multiplier : '')}`

				return `${this._sourceView.debuggingName || this._sourceView.node.id}.${this._sourceViewAttribute} ${operatorMap[this._relation]} \
				${(this._multiplier != 1 ? this._multiplier + '* ' : '')}${this._targetView.debuggingName || this._targetView.node.id}.${this._targetViewAttribute} \
				${constant}`;
			}

			return `${this._sourceView.debuggingName || this._sourceView.node.id}.${this._sourceViewAttribute} ${operatorMap[this._relation]} \
			${(this._multiplier != 1 ? this._multiplier + '* ' : '')}${this._targetView.debuggingName || this._targetView.node.id}.${this._targetViewAttribute} \
			${constant}`;
		}

		return `${this._sourceViewAttribute} ${operatorMap[this._relation]} ${this._configuration.constant}`;
	},

	/**
	 * Returns an object representing this constraint that may be serialized to a string.
	 * @param block <String ^(BMView)> 		A block that will be invoked for each view that this constraint affects.
	 * 										The block is given the view instance and should return a string from which
	 * 										a view reference may be obtained when this serialized representation is converted
	 * 										back into a constraint.
	 * @return <AnyObject>					A serializable representation of this constraint.
	 */
	serializedConstraintWithViewIDs(block) {
		return {
			_class: 'BMLayoutConstraint',
			_sourceViewAttribute: this._sourceViewAttribute,
			_relation: this._relation,
			_targetViewAttribute: this._targetViewAttribute,
			_constant: this._constant,
			_multiplier: this._multiplier,
			_priority: this._priority,
			_sourceView: block(this._sourceView),
			_targetView: this._targetView ? block(this._targetView) : undefined,
			_kind: this._kind,
			_identifier: this._identifier,
			_variations: this._serializedVariations,
			_isActive: this._isActive
		};
	}
	
};

// @endtype

// @type BMEqualAttributeLayoutConstraint extends BMLayoutConstraint

/**
 * An equal attribute layout constraint is a constraint collection that makes a given attribute
 * of a set of views have the same value.
 */
export function BMEqualAttributeLayoutConstraint() {} // <constructor>

/**
 * Constructs and returns a constraint that makes all of the views given to it have the same value
 * for a given attribute.
 * @param attribute <BMLayoutAttribute>			The attribute.
 * {
 * 	@param forViews <[BMView]>					An array of views that this constraint affects. This array should contain at least
 * 												two views.
 * 	@param priority <Number, nullable>			Defaults to <code>BMLayoutConstraintPriorityRequired</code>. The constraint's priority.
 * }
 * @return <BMEqualAttributeLayoutConstraint> 	A constraint.
 */
BMEqualAttributeLayoutConstraint.constraintWithAttribute = function (attribute, args) {
	let constraint = new BMEqualAttributeLayoutConstraint();

	constraint._identifier = BMUUIDMake();

	constraint._views = args.forViews.slice();
	constraint._attribute = attribute;
	constraint._priority = args.priority || BMLayoutConstraintPriorityRequired;

	if (attribute === BMLayoutAttribute.Top || attribute == BMLayoutAttribute.Bottom || attribute === BMLayoutAttribute.Height || attribute === BMLayoutAttribute.CenterY) {
		constraint._kind = BMLayoutConstraintKind.Vertical;
	}
	else {
		constraint._kind = BMLayoutConstraintKind.Horizontal;
	}

	constraint._variations = {};
	constraint._configuration = {constant: constraint._constant, priority: constraint._priority, isActive: constraint._isActive};

	if (!args._internal) {
		constraint._install();
	}
	else {
		constraint._internal = YES;
	}

	return constraint;
}

BMEqualAttributeLayoutConstraint.prototype = BMExtend({}, BMLayoutConstraint.prototype, {

	// @override - BMLayoutConstraint
	initWithSerializedConstraint(constraint, args) {
		this._views = constraint._views.map(viewID => args.viewIDs(viewID));
		for (var i = 0; i < this._views.length; i++) {
			if (!this._views[i]) return undefined;
		}
		this._attribute = constraint._attribute;
		this._kind = constraint._kind;
		this._priority = constraint._priority;
		this._identifier = constraint._identifier || BMUUIDMake();
		this._isActive = (constraint._isActive === undefined) ? YES : constraint._isActive;

		// For variations, it is required to re-create the size class object references from their hash strings
		this._variations = constraint._variations || {};
		for (let key in this._variations) {
			this._variations[key].sizeClass = BMLayoutSizeClass._layoutSizeClassForHashString(key);
		}

		// Create the configuration
		this._updateConfiguration();

		this._install();

		return this;
	},
	
	/**
	 * The views that this constraint affects.
	 */
	_views: undefined, // <[BMView]>

	/**
	 * The attribute affected by this constraint.
	 */
	_attribute: undefined, // <BMLayoutAttribute>
	
	// @override - BMLayoutConstraint
	affectedAttributesForView(view) {
		let attributes = [];

		if (this._views.indexOf(view) != -1) return [this._attribute];

		return attributes;
	},
	
	
	// @override - BMLayoutConstraint
	get isConstraintCollection() {
		return YES;
	},
	
	
	_constituentConstraints: undefined, // <[BMLayoutConstraints]>

	// @override - BMLayoutConstraint
	get constituentConstraints() {
		if (this._constituentConstraints) return this._constituentConstraints;

		let constraints = [];
		let constituentConstraint;

		for (let i = 1; i < this._views.length; i++) {
			constraints.push(constituentConstraint = BMLayoutConstraint.internalConstraintWithView(this._views[i - 1], {
				attribute: this._attribute,
				relatedBy: BMLayoutConstraintRelation.Equals,
				toView: this._views[i],
				secondAttribute: this._attribute,
				constant: 0,
				multiplier: 1,
				priority: this._priority
			}));
			constituentConstraint._variations = this._variations;
			constituentConstraint._isActive = this._isActive;
			constituentConstraint._updateConfigurationSilently(YES);
		}

		this._constituentConstraints = constraints;
		return constraints;
	},

	// @override - BMLayoutConstraint
	get constant() {
		return this._constant;
	},
	set constant(constant) {
		if (constant == this._constant) return;
		this._constant = constant;
		return this._updateConfiguration();

		this.constituentConstraints.forEach(constraint => constraint.constant = constant);
	},
	
	
	// @override - BMLayoutConstraint
	get _hasEditableConstant() {
		return NO;
	},

	// @override - BMLayoutConstraint
	get categoryKind() { // <String>
		if (this._kind == BMLayoutConstraintKind.Vertical) {
			if (this._attribute == BMLayoutAttribute.Height) {
				return 'Height';
			}
			else {
				return 'Vertical Position';
			}
		}
		else {
			if (this._attribute == BMLayoutAttribute.Width) {
				return 'Width';
			}
			else {
				return 'Horizontal Position';
			}
		}
	},
	
	
	// @override - BMLayoutConstraint
	_isActive: NO,

	get isActive() {
		return this._isActive;
	},
	set isActive(active) {
		if (active != this._isActive) {
			this._isActive = active;
			return this._updateConfiguration();
			this._views[0].rootView._invalidatedConstraints = YES;

			this._views.forEach(view => {
				view._checkConstraints();
				view.needsLayout = YES;
			});
		}
	},

	// @override - BMLayoutConstraint
	_install() {
		this._views.forEach(view => view._addConstraint(this));
		this._views[0].rootView._invalidatedConstraints = YES;
	},
	
	
	// @override - BMLayoutConstraint
	remove() {
		if (this._isActive) {
			this._isActive = NO;
		}

		this._views.forEach(view => {
			view._removeConstraint(this);
			view._checkConstraints();
			view.needsLayout = YES;
		});
		this._views[0].rootView._invalidatedConstraints = YES;

		this._views = undefined;
	},

	
	// @override - BMLayoutConstraint
	toString() {
		return 'Equal ' + this._attribute;
	},

	
	// @override - BMLayoutConstraint
	toCompactString() {
		return 'Equal ' + this._attribute;
	},

	// @override - BMLayoutConstraint
	serializedConstraintWithViewIDs(block) {
		return {
			_class: 'BMEqualAttributeLayoutConstraint',
			_attribute: this._attribute,
			_priority: this._priority,
			_views: this._views.map(view => block(view)),
			_kind: this._kind,
			_identifier: this._identifier,
			_variations: this._serializedVariations,
			_isActive: this._isActive
		};
	}
});

// @endtype

// @type BMEqualSpacingLayoutConstraint extends BMLayoutConstraint


/**
 * An equal attribute layout constraint is a constraint collection that makes a set of views
 * have the same spacing between them, and optionally between the first and last view and the superview.
 */
export function BMEqualSpacingLayoutConstraint () {} // <constructor>


/**
 * Constructs and returns a constraint that makes all of the views given to it have the same value
 * for a given attribute.
 * @param kind <BMLayoutConstraintKind>						The kind of spacing. Should be .Horizontal or .Vertical
 * {
 * 	@param forViews <[BMView]>								An array of views that this constraint affects. This array should contain at least
 * 															two views. If <code>withSuperview</code> is set to <code>YES</code>, this views in this
 * 															array must be siblings.
 *	@param withSuperview <Boolean, nullable>				Defaults to <code>NO</code>. If set to <code>YES</code>, the first and last views in 
 *															the array will have leading and trailing constraints bound to their superview. This method will raise an exception
 *															if this parameter is set to `YES` and the views do not have the same superview.
 *	@param constant <Number or String, nullable>			Defaults to <code>0</code>. The spacing to apply between the views.
 * 	@param priority <Number, nullable>						Defaults to <code>BMLayoutConstraintPriorityRequired</code>. The constraint's priority.
 * }
 * @return <BMEqualAttributeLayoutConstraint> 	A constraint.
 */
BMEqualSpacingLayoutConstraint.constraintOfKind = function (kind, args) {
	let constraint = new BMEqualSpacingLayoutConstraint();

	constraint._views = args.forViews.slice();
	constraint._kind = kind;
	constraint._priority = args.priority || BMLayoutConstraintPriorityRequired;
	constraint._constant = args.constant || 0;

	constraint._identifier = BMUUIDMake();

	if (args.withSuperview) {
		// Ensure that if the superview is specified the views are siblings
		constraint._withSuperview = args.withSuperview;
		let parent = args.forViews[0].superview;
		args.forViews.forEach(view => {
			if (view.superview != parent) throw new Error("The views must have the same superview.");
		});
	
		constraint._superview = parent;
	}

	if (kind == BMLayoutConstraintKind.Horizontal) {
		constraint._firstAttribute = BMLayoutAttribute.Leading;
		constraint._secondAttribute = BMLayoutAttribute.Trailing;
	}
	else {
		constraint._firstAttribute = BMLayoutAttribute.Top;
		constraint._secondAttribute = BMLayoutAttribute.Bottom;
	}

	constraint._variations = {};
	constraint._configuration = {constant: constraint._constant, priority: constraint._priority, isActive: constraint._isActive};
	if (typeof constraint._constant == 'string') {
		constraint._configuration.constantValue = args.forViews[0].rootView.valueForLayoutVariable(constraint._constant);
	}
	else {
		constraint._configuration.constantValue = constraint._constant;
	}

	if (!args._internal) {
		constraint._install();
	}
	else {
		constraint._internal = YES;
	}

	return constraint;
}


BMEqualSpacingLayoutConstraint.prototype = BMExtend({}, BMLayoutConstraint.prototype, {

	// @override - BMLayoutConstraint
	initWithSerializedConstraint(constraint, args) {
		this._views = constraint._views.map(viewID => args.viewIDs(viewID));
		for (var i = 0; i < this._views.length; i++) {
			if (!this._views[i]) return undefined;
		}
		if (constraint._superview) {
			this._superview = args.viewIDs(constraint._superview);
			if (!this._superview) return undefined;
		}
		this._firstAttribute = constraint._firstAttribute;
		this._secondAttribute = constraint._secondAttribute;
		this._constant = constraint._constant;
		this._kind = constraint._kind;
		this._priority = constraint._priority;
		this._identifier = constraint._identifier || BMUUIDMake();
		this._isActive = (constraint._isActive === undefined) ? YES : constraint._isActive;

		// For variations, it is required to re-create the size class object references from their hash strings
		this._variations = constraint._variations || {};
		for (let key in this._variations) {
			this._variations[key].sizeClass = BMLayoutSizeClass._layoutSizeClassForHashString(key);
		}

		// Create the configuration
		this._updateConfiguration();

		this._install();

		return this;
	},
	
	/**
	 * The views that this constraint affects.
	 */
	_views: undefined, // <[BMView]>

	/**
	 * The superview affected by this constraint, if any.
	 */
	_superview: undefined, // <BMView, nullable>

	/**
	 * The first attribute for this constraint. This is <code>.Leading</code> for horizontal spacing
	 * and <code>.Top</code> for vertical spacing.
	 */
	_firstAttribute: undefined, // <BMLayoutAttribute>

	/**
	 * The first attribute for this constraint. This is <code>.Leading</code> for horizontal spacing
	 * and <code>.Top</code> for vertical spacing.
	 */
	_secondAttribute: undefined, // <BMLayoutAttribute>

	//
	// The type of spacing to apply.
	//
	_kind: undefined, // <BMLayoutConstraintKind>
	
	// @override - BMLayoutConstraint
	affectedAttributesForView(view) {
		let attributes = [];
		let index = 0;

		if (view == this._superview) return [this._firstAttribute, this._secondAttribute];

		if ((index = this._views.indexOf(view)) != -1) {
			if (this._superview) {
				if (index == 0) return [this._secondAttribute];
				if (index == this._views.length - 1) return [this._firstAttribute];
				return [this._firstAttribute, this._secondAttribute];
			}
			else {
				return [this._firstAttribute, this._secondAttribute];
			}
		}

		return attributes;
	},
	
	
	// @override - BMLayoutConstraint
	get isConstraintCollection() {
		return YES;
	},
	
	_constituentConstraints: undefined, // <[BMLayoutConstraint]>
	
	// @override - BMLayoutConstraint
	get constituentConstraints() {
		if (this._constituentConstraints) return this._constituentConstraints;

		let constraints = [];

		let constituentConstraint;

		for (let i = 1; i < this._views.length; i++) {
			constraints.push(constituentConstraint = BMLayoutConstraint.internalConstraintWithView(this._views[i - 1], {
				attribute: this._secondAttribute,
				relatedBy: BMLayoutConstraintRelation.Equals,
				toView: this._views[i],
				secondAttribute: this._firstAttribute,
				constant: this._constant,
				multiplier: 1,
				priority: this._priority
			}));

			constituentConstraint._reversesConstant = YES;
			constituentConstraint._variations = this._variations;
			constituentConstraint._isActive = this._isActive;
			constituentConstraint._updateConfigurationSilently(YES);
		}

		if (this._superview) {
			constraints.push(constituentConstraint = BMLayoutConstraint.internalConstraintWithView(this._views[0], {
				attribute: this._firstAttribute,
				relatedBy: BMLayoutConstraintRelation.Equals,
				toView: this._superview,
				secondAttribute: this._firstAttribute,
				constant: this._constant,
				multiplier: 1,
				priority: this._priority
			}));
			constituentConstraint._variations = this._variations;
			constituentConstraint._isActive = this._isActive;
			constituentConstraint._updateConfigurationSilently(YES);

			constraints.push(constituentConstraint = BMLayoutConstraint.internalConstraintWithView(this._views[this._views.length - 1], {
				attribute: this._secondAttribute,
				relatedBy: BMLayoutConstraintRelation.Equals,
				toView: this._superview,
				secondAttribute: this._secondAttribute,
				constant: this._constant,
				multiplier: 1,
				priority: this._priority
			}));
			constituentConstraint._reversesConstant = YES;
			constituentConstraint._variations = this._variations;
			constituentConstraint._isActive = this._isActive;
			constituentConstraint._updateConfigurationSilently(YES);
		}

		this._constituentConstraints = constraints;
		return constraints;
	},

	// @override - BMLayoutConstraint
	get constant() {
		return this._constant;
	},
	set constant(constant) {
		if (constant == this._constant) return;
		this._constant = constant;
		return this._updateConfiguration();

		this.constituentConstraints.forEach(constraint => constraint.constant = constant);
	},
	
	
	// @override - BMLayoutConstraint
	get _hasEditableConstant() {
		return YES;
	},

	// @override - BMLayoutConstraint
	get categoryKind() { // <String>
		if (this._kind == BMLayoutConstraintKind.Vertical) {
			return 'Vertical Position';
		}
		else {
			return 'Horizontal Position';
		}
	},
	
	
	// @override - BMLayoutConstraint
	_isActive: NO,

	get isActive() {
		return this._isActive;
	},
	set isActive(active) {
		if (active != this._isActive) {
			this._isActive = active;
			return this._updateConfiguration();
			this._views[0].rootView._invalidatedConstraints = YES;

			this._views.forEach(view => {
				view._checkConstraints();
				view.needsLayout = YES;
			});

			if (this._superview) {
				this._superview._checkConstraints();
				this._superview.needsLayout = YES;
			}
		}
	},

	// @override - BMLayoutConstraint
	_install() {
		this._views.forEach(view => view._addConstraint(this));
		this._views[0].rootView._invalidatedConstraints = YES;

		if (this._superview) this._superview._addConstraint(this);
	},
	
	
	// @override - BMLayoutConstraint
	remove() {
		if (this._isActive) {
			this._isActive = NO;
		}

		this._views.forEach(view => {
			view._removeConstraint(this);
			view._checkConstraints();
			view.needsLayout = YES;
		});
		this._views[0].rootView._invalidatedConstraints = YES;

		if (this._superview) {
			this._superview._removeConstraint(this);
			this._superview._checkConstraints();
			this._superview.needsLayout = YES;
		}

		this._views = undefined;
	},

	
	// @override - BMLayoutConstraint
	toString() {
		return 'Equal Spacing';
	},

	
	// @override - BMLayoutConstraint
	toCompactString() {
		return 'Equal Spacing';
	},

	// @override - BMLayoutConstraint
	serializedConstraintWithViewIDs(block) {
		return {
			_class: 'BMEqualSpacingLayoutConstraint',
			_priority: this._priority,
			_views: this._views.map(view => block(view)),
			_superview: this._superview ? block(this._superview) : undefined,
			_constant: this._constant,
			_firstAttribute: this._firstAttribute,
			_secondAttribute: this._secondAttribute,
			_kind: this._kind,
			_identifier: this._identifier,
			_variations: this._serializedVariations,
			_isActive: this._isActive
		};
	}
});

// @endtype
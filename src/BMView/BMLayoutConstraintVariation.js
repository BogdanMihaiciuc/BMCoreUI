// @type interface BMLayoutConstraintVariation

function BMLayoutConstraintVariation() {} // <constructor>

BMLayoutConstraintVariation.prototype = {
    /**
     * The size class to which this variation applies.
     */
    sizeClass: undefined, // <BMLayoutSizeClass>

    /**
     * The constant for this variation, if defined.
     */
    constant: 0, // <Number, nullable>

    /**
     * The active state for this variation, if defined.
     */
    isActive: false, // <Boolean, nullable>

    /**
     * The constraint priority for this variation, if defined.
     */
    priority: 0, // <Number, nullable>
};

// @endtype
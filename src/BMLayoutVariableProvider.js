// @type interface BMLayoutVariation

/**
 * The specification of an object that represents a variation of a value within a CoreUI layout.
 */
function BMLayoutVariation() {} // <constructor>

BMLayoutVariation.prototype = {

    /**
     * The name of the item to which this variation applies.
     */
    get name() {  // <String>

    },

    /**
     * The size class for which this variation is active.
     */
    get sizeClass() { // <BMLayoutSizeClass>

    },

    /**
     * The value of this variation.
     */
    get value() { // <any>

    },
}

// @endtype

// @type interface BMLayoutVariableVariation extends BMLayoutVariation

/**
 * The specification of an object that represents a variation of a layout variable within a CoreUI layout.
 */
function BMLayoutVariableVariation() {} // <constructor>

BMLayoutVariableVariation.prototype = {

    /**
     * The value of this variation.
     */
    get value() { // <Number>

    },
}

// @endtype

// @type interface BMLayoutVariableProvider

/**
 * The specification for a `BMLayoutVariableProvider` object, which is used to provide information to the layout editor regarding which
 * of the currently defined layout variables are applicable to the current context.
 *
 * The `BMView` class itself implements this interface and can be used whenever any specific behaviour is not required for adding, modifying
 * or removing layout variables.
 * 
 * All of the methods defined in this protocol are required; omitting any method will lead to a runtime error when the layout editor
 * attempts to invoke it on the provider object.
 */
function BMLayoutVariableProvider() {} // <constructor>

BMLayoutVariableProvider.prototype = {

    /**
     * Invoked by the layout editor to determine if layout variables are available.
     * If layout variables are unavailable, the layout editor will not allow the creation of layout variables
     * and display a message to the user indicating this.
     * @return <Boolean>        `YES` if layout variables are available, `NO` otherwise.
     */
    canUseLayoutVariables() {

    },

    /**
     * Invoked by the layout editor if layout variables are unavailable.
     * This method should return a string that represents the error message that will be displayed
     * to the use if layout variables are unavailable.
     * @return <String>         A message to display to the user.
     */
    unavailableLayoutVariablesUserLabel() {

    },

    /**
     * Invoked by the layout editor during its initialization to cause this layout variable provider
     * to prepare the layout variables that should be available in the current context.
     * 
     * The layout editor will invoke this method only once during initialization and before any other method is
     * invoked on this layout variable provider.
     */
    prepareLayoutVariables() {

    },

    /**
     * This getter must return an object that represent the currently defined layout variables.
     * The property names represent the layout variable names and their values represent each variable's value.
     * The layout editor will not modify the object returned by this getter and it must also not be modified by any
     * external source throughout its lifetime.
     * 
     * The layout editor may invoke this method several times throughout its lifecycle, typically whenever
     * the layout variables popup is opened or whenever autocomplete suggestions should be displayed while
     * the user is editing a constraint's constant.
     * 
     * The layout variables returned by this method must also be registered with CoreUI.
     */
    get layoutVariables() { // <Object<String, Number>>

    },
    
    /**
     * Invoked by the layout editor to obtain the variations defined for the given layout variables.
     * Layout variable providers should typically obtain the variations from CoreUI as layout variables with
     * the same name must have the same variations in all contexts in which they apply.
     * @param named <String>                    The name of the layout variable.
     * @return <[BMLayoutVariableVariation]>    An array of variations for the given layout variable.
     */
    variationsForLayoutVariableNamed(named) {

    },

    /**
     * This method will be invoked by the layout editor when the user creates a new layout variable 
     * with the given value.
     * This method will also be invoked whenever the default value of a layout variable changes.
     * 
     * The layout variable provider must register this layout variable with CoreUI.
     * @param named <String>            The name to use for this layout variable.
     * {
     *  @param withValue <Number>       The default value to use for this layout variable, when there are no
     *                                  active size classes variations.
     * }
     */
    registerLayoutVariableNamed(named, {withValue: value}) {

    },

    /**
     * This method will be invoked to rename an existing layout variable.
     * @param named <String>        The layout variable's current name.
     * {
     *  @param toName <String>      The new name to use for the layout variable.
     * } 
     */
    renameLayoutVariableNamed(named, {toName: newName}) {
    },
    
    /**
     * This method will be invoked by the layout editor when the user deletes a previously created layout variable.
     * 
     * The layout variable provider must also unregister this layout variable from CoreUI.
     * @param named <String>            The name of the layout variable to remove.
     */
    unregisterLayoutVariableNamed(named) {
    },

    /**
     * Invoked by the layout editor when the user sets a variation for the given layout variable 
     * when the given size class is active.
     * If a variation for the given layout variable already exists for the given size class,
     * its value should be updated to the specified value.
     * 
     * The layout variable provider must also register this variation with CoreUI.
     * @param value <Number>                        The value for the given layout variable when the given size class is active.
     * {
     *  @param named <String>                       The name of the layout variable.
     *  @param inSizeClass <BMLayoutSizeClass>      The size class for which this variation will be active.
     * }
     */
    setLayoutVariableValue(value, {named: name, inSizeClass: sizeClass}) {
    },

    /**
     * Invoked by the layout editor when the user removes a variation for the given 
     * layout variable for the given size class.
     * 
     * The layout variable provider must also unregister this variation from CoreUI.
     * @param name <String>                         The name of the layout variable.
     * {
     *  @param inSizeClass <BMLayoutSizeClass>      The size class from which to remove this variation.
     * }
     */
    removeVariationForLayoutVariableNamed(name, {inSizeClass: sizeClass}) {
    },

    /**
     * Invoked by the layout editor when editing finishes and this layout variable provider should persist
     * any changes that have occurred to the layout variables. This method may be invoked several times while
     * the layout editor is open.
     */
    persistLayoutVariables() {

    },

};

// @endtype
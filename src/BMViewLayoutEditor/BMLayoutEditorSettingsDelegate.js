// @type interface BMLayoutEditorSettingsDelegate

/**
 * The specification for a `BMLayoutEditorSettingsDelegate` object, which is used to provide information to the layout editor regarding the variation status of
 * settings and implements the behvaiour for when settings are changed.
 *
 * The `BMView` and `BMLayoutConstraint` classes implement this interface for standard settings. View subclasses can override these methods and provide
 * additional settings and behaviours for them. Whenever these methods are overridden, the subclasses should invoke the superclass implementation to allow
 * the correct handling of standard settings.
 * 
 * All of the methods defined in this protocol are required; omitting any method will lead to a runtime error when the layout editor
 * attempts to invoke it on the delegate object.
 */
function BMLayoutEditorSettingsDelegate() {} // <constructor>

BMLayoutEditorSettingsDelegate.prototype = {

    /**
     * Invoked by the layout editor to determine which variations are currently active for the
     * setting given as a parameter.
     * @param editor <BMLayoutEditor>           The layout editor invoking this method.
     * @param setting <BMLayoutEditorSetting>   The setting for which to retrieve variations.
     * @return <[BMLayoutVariation]>            An array of active variations.
     */
    layoutEditorActiveVariationsForSetting(editor, setting) {

    },

    /**
     * Invoked by the layout editor when the value for a setting changes. If the value that changed
     * is specific to a size class, that size class will be given as a parameter.
     * @param editor <BMLayoutEditor>           The layout editor invoking this method.
     * @param value <AnyObject>                                 The new value of the setting.
     * {
     *  @param setting <BMLayoutEditorSetting>                  The setting that was changed.
     *  @param forSizeClass <BMLayoutSizeClass, nullable>       If specified, this indicates that the new value applies to a certain size class.
     *                                                          In this case, the value of this parameter indicates the size class to which the new value applies.
     * }
     */
    layoutEditorSettingValueDidChange(value, {setting, forSizeClass}) {

    }

};

// @endtype
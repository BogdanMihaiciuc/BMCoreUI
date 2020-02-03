// @type interface BMLayoutEditorDelegate extends BMWindowDelegate

/**
 * The specification for a `BMLayoutEditorDelegate` object, which is used to provide information to the layout editor regarding additional settings and can
 * receive various lifecycle callbacks from it.
 */
function BMLayoutEditorDelegate() {} // <constructor>

BMLayoutEditorDelegate.prototype = {

    /**
     * Invoked by the layout editor to obtain an optional list of additional tabs to use when creating the settings
     * panel for a view.
     * 
     * Delegates that implement this method should return an array of additional tabs that will be added to the panel.
     * 
     * It is not required to add the actual settings to the tabs from this method. Instead, the layout editor will invoke
     * the `layoutEditorAdditionalSettingSectionsForTab(_, _)` method to obtain the settings to add after this method returns.
     * @param editor <BMLayoutEditor>           The layout editor invoking this method.
     * @param view <BMView>                     The view for which to add additional tabs.
     * @return <[BMLayoutEditorSettingsTab]>    An array of settings tabs.
     */
    layoutEditorAdditionalSettingTabsForView(editor, view) {

    },

    /**
     * Invoked by the layout editor to obtain an optional list of additional tabs to use when creating the settings
     * panel for a constraint.
     * 
     * Delegates that implement this method should return an array of additional tabs that will be added to the panel.
     * 
     * It is not required to add the actual settings to the tabs from this method. Instead, the layout editor will invoke
     * the `layoutEditorAdditionalSettingSectionsForTab(_, _)` method to obtain the settings to add after this method returns.
     * @param editor <BMLayoutEditor>           The layout editor invoking this method.
     * @param constraint <BMLayoutConstraint>   The view for which to add additional tabs.
     * @return <[BMLayoutEditorSettingsTab]>    An array of settings tabs.
     */
    layoutEditorAdditionalSettingTabsForConstraint(editor, constraint) {

    },

    /**
     * Invoked by the layout editor to obtain an optional list of additional setting sections to add to the given tab when
     * creating the settings panel for a selected object. This method will also be invoked whenever the settings for the given
     * tab have been invalidated.
     * 
     * Delegates that implement this method should return an array of additional sesctions that will be added to the panel.
     * @param editor <BMLayoutEditor>               The layout editor invoking this method.
     * @param tab <BMLayoutEditorSettingsTab>       The tab for which to add additional settings.
     * @return <[BMLayoutEditorSettingsSection]>    An array of settings ssections.
     */
    layoutEditorAdditionalSettingSectionsForTab(editor, tab) {

    }

};

// @endtype
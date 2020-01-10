// @ts-check
import {YES, NO, BMExtend} from '../Core/BMCoreUI'
import {BMAnimateWithBlock, __BMVelocityAnimate, BMAnimationContextGetCurrent, BMHook, BM_USE_VELOCITY2, BMAnimationBeginWithDuration, BMAnimationApply, BMAnimationApplyBlocking, BMAnimationContextBeginStatic} from '../Core/BMAnimationContext'
import { _BMLayoutEditorCollectionSettingsPanel, BMLayoutEditorSettingsTab, _BMLayoutEditorSettingsPanel, _BMURLOfImageAtPath, BMLayoutEditorSettingKind, BMLayoutEditorSettingsSection, BMLayoutEditorSetting, BMLayoutEditorEnumSetting } from './BMLayoutEditorSettings'

// @type _BMLayoutEditorViewGroupSettingsPanel

/**
 * A class that controls the settings for a view.
 */
export function _BMLayoutEditorViewGroupSettingsPanel() {} // <constructor>

_BMLayoutEditorViewGroupSettingsPanel.prototype = BMExtend(Object.create(_BMLayoutEditorCollectionSettingsPanel.prototype), {
    constructor: _BMLayoutEditorViewGroupSettingsPanel,

    /**
     * The views whose settings are displayed.
     */
    _views: undefined, // <[BMView]>

    /**
     * The layout tab.
     */
    _layoutTab: undefined, // <BMLayoutEditorSettingsTab>

    /**
     * Designated initializer. Initializes this settings panel with the given settings view.
     * @param view <_BMLayoutSettingsView>          The settings view.
     * @return <_BMLayoutEditorSettingsPanel>       This setttings panel.
     */
    initWithSettingsView(settingsView, {forView: view}) {
        _BMLayoutEditorSettingsPanel.prototype.initWithSettingsView.call(this, settingsView);

        this._displayedView = view;

        this._layoutTab = _BMLayoutEditorViewLayoutSettingsTab.viewLayoutTabForView(view);
        this._layoutTab._settingsPanel = this;

        this._currentTab = this._layoutTab;

        this._tabs = [this._layoutTab];

        this.title = 'Selected views';

        return this;
    },

    // @override - BMLayoutEditorSettingsPanel
    settingsPanelWillAppear(animated) {

    },

    // @override - BMLayoutEditorSettingsPanel
    settingsPanelDidAppear(animated) {

    },

    // @override - BMLayoutEditorSettingsPanel
    settingsPanelWillDisappear(animated) {

    },

    // @override - BMLayoutEditorSettingsPanel
    settingsPanelDidDisappear(animated) {

    },
});

// @endtype
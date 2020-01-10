// @ts-check
import {YES, NO, BMExtend, BMCopyProperties, BMIsTouchDevice} from '../Core/BMCoreUI'
import {BMInsetMakeWithEqualInsets, BMInsetMake} from '../Core/BMInset'
import {BMPointMake} from '../Core/BMPoint'
import {BMSizeMake} from '../Core/BMSize'
import {BMRectMake, BMRectMakeWithNodeFrame} from '../Core/BMRect'
import {BMIndexPathMakeWithRow} from '../Core/BMIndexPath'
import {BMAnimateWithBlock, __BMVelocityAnimate, BMAnimationContextGetCurrent, BMHook, BM_USE_VELOCITY2, BMAnimationBeginWithDuration, BMAnimationApply, BMAnimationApplyBlocking, BMAnimationContextBeginStatic} from '../Core/BMAnimationContext'
import {BMLayoutOrientation, BMLayoutSizeClass} from '../BMView/BMLayoutSizeClass'
import {BMViewport} from '../BMView/BMViewport'
import {BMLayoutConstraint, BMEqualAttributeLayoutConstraint, BMEqualSpacingLayoutConstraint, BMLayoutAttribute, BMLayoutConstraintKind, BMLayoutConstraintPriorityRequired, BMLayoutConstraintRelation} from '../BMView/BMLayoutConstraint_v2.5'
import {BMView} from '../BMView/BMView_v2.5'
import {BMMenuKind, BMMenuItem} from '../BMView/BMMenu'
import {BMWindow} from '../BMWindow/BMWindow'
import {BMCollectionViewCell} from '../BMCollectionView/BMCollectionViewCell'
import {BMCollectionViewFlowLayoutSupplementaryView, BMCollectionViewFlowLayoutGravity, BMCollectionViewFlowLayoutAlignment} from '../BMCollectionView/BMCollectionViewFlowLayout'
import {BMCollectionView} from '../BMCollectionView/BMCollectionView'
import { BMLayoutEditorSettingsCell, BMLayoutEditorSettingsConstraintCell, BMLayoutEditorSettingsFooter, BMLayoutEditorSettingsTitleCell, BMLayoutEditorSettingsIntegerCell, BMLayoutEditorSettingsReadonlyCell, BMLayoutEditorSettingsDeactivateConstraintsCell, BMLayoutEditorSettingsSegmentCell, BMLayoutEditorSettingsBooleanCell, BMLayoutEditorSettingsStringCell, BMLayoutEditorSettingsNumberCell, BMLayoutEditorSettingsViewCell, BMLayoutEditorSettingsDropdownCell, BMLayoutEditorSettingsConstantCell, BMLayoutEditorSettingsDeleteConstraintCell } from './BMLayoutEditorSettingCells'
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
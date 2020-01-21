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

// @type _BMLayoutEditorViewSettingsPanel

/**
 * A class that controls the settings for a view.
 */
export function _BMLayoutEditorViewSettingsPanel() {} // <constructor>

_BMLayoutEditorViewSettingsPanel.prototype = BMExtend(Object.create(_BMLayoutEditorCollectionSettingsPanel.prototype), {
    constructor: _BMLayoutEditorViewSettingsPanel,

    /**
     * The view whose settings are displayed.
     */
    _displayedView: undefined, // <BMView>

    /**
     * The visual attributes tab.
     */
    _attributesTab: undefined, // <BMLayoutEditorSettingsTab>

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

        // Create the default tabs
        this._attributesTab = BMLayoutEditorSettingsTab.tabWithName('Attributes', {icon: _BMURLOfImageAtPath('images/Properties.png')});
        this._attributesTab._settingsPanel = this;

        // Add the attribute settings
        const attributesSection = BMLayoutEditorSettingsSection.section();
        attributesSection._settings[0] = BMLayoutEditorSetting.settingWithName('Opacity', {kind: BMLayoutEditorSettingKind.Number, target: view, variations: YES, property: 'opacity'});
        attributesSection._settings[1] = BMLayoutEditorSetting.settingWithName('Visible', {kind: BMLayoutEditorSettingKind.Boolean, target: view, variations: YES, property: 'isVisible'});
        attributesSection._settings[2] = BMLayoutEditorSetting.settingWithName('CSS Class', {kind: BMLayoutEditorSettingKind.String, target: view, variations: YES, property: 'CSSClass'});
        this._attributesTab._settingSections.push(attributesSection);

        const edgeInsetsSection = BMLayoutEditorSettingsSection.section();
        edgeInsetsSection._settings[0] = BMLayoutEditorSetting.settingWithName('Content Insets', {kind: BMLayoutEditorSettingKind.Insets, target: view, variations: YES, nullable: YES, property: 'contentInsets'});

        this._layoutTab = _BMLayoutEditorViewLayoutSettingsTab.viewLayoutTabForView(view);
        this._layoutTab._settingsPanel = this;

        this._currentTab = this._layoutTab;

        this._tabs = [this._attributesTab, this._layoutTab];

        this.title = view.debuggingName;

        // TODO: Custom tabs

        return this;
    },

    // @override - BMLayoutEditorSettingsPanel
    settingsPanelWillAppear(animated) {
        this.layoutEditor.selectView(this._displayedView);
        //this.layoutEditor._drawConstraintsForView(this._displayedView, {includesInactiveConstraints: this._layoutTab._showsInactiveConstraints, includesSubviewConstraints: this._layoutTab._showsSubviewConstraints});
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

// @type _BMLayoutEditorViewLayoutSettingsTab

/**
 * A specialized settings tab used for displaying view layout settings.
 */
export function _BMLayoutEditorViewLayoutSettingsTab() {} // <constructor>

_BMLayoutEditorViewLayoutSettingsTab.prototype = BMExtend(Object.create(BMLayoutEditorSettingsTab.prototype), {
    constructor: _BMLayoutEditorViewLayoutSettingsTab,

    /**
     * The view whose constraints are displayed.
     */
    _displayedView: undefined, // <BMView>

    /**
     * Controls whether subview constraints are displayed.
     */
    _showsSubviewConstraints: YES, // <Boolean>

    /**
     * The categories of the view's own constraints.
     */
    _constraintCategories: undefined, // <Object<String, [BMLayoutConstraint]>

    get showsSubviewConstraints() {
        return this._showsSubviewConstraints;
    },
    set showsSubviewConstraints(shows) {
        this._showsSubviewConstraints = shows;
        this._updateSettings();
    },

    /**
     * Controls whether inactive constraints are displayed.
     */
    _showsInactiveConstraints: NO, // <Boolean>

    get showsInactiveConstraints() {
        return this._showsInactiveConstraints;
    },
    set showsInactiveConstraints(shows) {
        this._showsInactiveConstraints = shows;
        this._updateSettings();
    },

    /**
     * Controls which types of constraints are displayed by this tab.
     */
    get _displayMode() { // <String>
        if (this._showsInactiveConstraints && this._showsSubviewConstraints) return 'all';
        if (this._showsInactiveConstraints) return 'inactive';
        if (this._showsSubviewConstraints) return 'subview';
        return 'own';
    },
    set _displayMode(mode) {
        if (mode == 'all') {
            this._showsSubviewConstraints = YES;
            this.showsInactiveConstraints = YES;
        }
        else if (mode == 'subview') {
            this._showsInactiveConstraints = NO;
            this.showsSubviewConstraints = YES;
        }
        else if (mode == 'inactive') {
            this._showsInactiveConstraints = YES;
            this.showsSubviewConstraints = YES;
        }
        else {
            this._showsSubviewConstraints = YES;
            this.showsInactiveConstraints = NO;
        }
    },

    /**
     * Initializes this view layout tab for the specified view.
     * @param view <BMView>     The view whose constraints will be displayed.
     */
    initWithView(view) {
        BMLayoutEditorSettingsTab.prototype.initWithName.call(this, 'Layout', {icon: _BMURLOfImageAtPath('images/Layout.png')});
        this._displayedView = view;

        this._updateSettings();

        return this;
    },

    updateSettings() {
        this._updateSettings();
    },

    /**
     * Updates the visible constraints.
     * If this tab is visible, it also updates the displayed constraints.
     */
    _updateSettings() {
        const view = this._displayedView;

        this.beginUpdates();

        this._settingSections.length = 0;

        if (this._intrinsicResistanceSection) {
            if (view.supportsIntrinsicSize) this._settingSections.push(this._intrinsicResistanceSection);
        }
        else {
            const intrinsicResistanceSection = BMLayoutEditorSettingsSection.section();
            this._intrinsicResistanceSection = intrinsicResistanceSection;
            intrinsicResistanceSection.name = 'Intrinsic Size Resistance';
            intrinsicResistanceSection._settings[0] = BMLayoutEditorSetting.settingWithName('Compression', {kind: BMLayoutEditorSettingKind.Integer, target: view, property: 'compressionResistance'});
            intrinsicResistanceSection._settings[1] = BMLayoutEditorSetting.settingWithName('Expansion', {kind: BMLayoutEditorSettingKind.Integer, target: view, property: 'expansionResistance'});
            if (view.supportsIntrinsicSize) this._settingSections.push(intrinsicResistanceSection);
        }

        /*
        if (this._intrinsicSizeSection) {
            if (view.supportsIntrinsicSize) this._settingSections.push(this._intrinsicSizeSection);
        }
        else {
            const intrinsicSizeSection = BMLayoutEditorSettingsSection.section();
            this._intrinsicSizeSection = intrinsicSizeSection;
            intrinsicSizeSection._settings[0] = BMLayoutEditorSetting.settingWithName('Intrinsic Size', {kind: BMLayoutEditorSettingKind.Info, target: view, property: 'supportsIntrinsicSize'});
            if (view.supportsIntrinsicSize) this._settingSections.push(intrinsicSizeSection);
        }
        */

        const constraintViewPicker = this._constraintViewPickerSection || BMLayoutEditorSettingsSection.section();
        this._constraintViewPickerSection = constraintViewPicker;
        constraintViewPicker.name = 'Show';
        constraintViewPicker._settings[0] = BMLayoutEditorEnumSetting.settingWithName('Show', {kind: BMLayoutEditorSettingKind.Segment, target: this, property: '_displayMode'});
        constraintViewPicker._settings[0].options = [
            BMMenuItem.menuItemWithName('This Size Class', {icon: _BMURLOfImageAtPath('images/OwnConstraints.png'), userInfo: 'subview'}),
            //BMMenuItem.menuItemWithName('Subview Constraints', {icon: _BMURLOfImageAtPath('images/SubviewConstraints.png'), userInfo: 'subview'}),
            BMMenuItem.menuItemWithName('All Size Classes', {icon: _BMURLOfImageAtPath('images/InactiveConstraints.png'), userInfo: 'inactive'}),
            //BMMenuItem.menuItemWithName('All Constraints', {icon: _BMURLOfImageAtPath('images/AllConstraints.png'), userInfo: 'all'})
        ];
        this._settingSections.push(constraintViewPicker);


        // View constraints will be split into four groups:
        //
        // 1. Visible by default and non-collapsible will be the constraints that directly affect the view,
        // or link the view to its siblings or ancestors
        //
        // 2. A second, collapsed by default group, will show the constraints that link the view to its descendants - This is currently no longer active
        //
        // 3. A third, collapsed by default group, will show the inactive constraints
        //
        // 4. A final group shows the view's internal constraints in a read-only mode
        let constraintCategoryMap = {};
        let subviewConstraintCategoryMap = {};
        let inactiveConstraintsMap = {};
        let hasSubviewConstraints = NO;
        let hasInactiveConstraints = NO;

        // Split up the constraints into the various categories
        view.localConstraints.forEach(constraint => {
            let category = constraint.categoryKind;

            if (!constraint._configuration.isActive) {
                hasInactiveConstraints = YES;
                inactiveConstraintsMap[category] = inactiveConstraintsMap[category] || [];
                inactiveConstraintsMap[category].push(constraint);
                return;
            }

            /*if (!constraint._isConstraintCollection) {
                // Push subview constraints into their own categories
                if (constraint._sourceView == view && constraint._targetView && constraint._targetView.isDescendantOfView(view)) {
                    subviewConstraintCategoryMap[category] = subviewConstraintCategoryMap[category] || [];
                    subviewConstraintCategoryMap[category].push(constraint);
                    hasSubviewConstraints = YES;
                    return;
                }
                if (constraint._targetView == view && constraint._sourceView.isDescendantOfView(view)) {
                    subviewConstraintCategoryMap[category] = subviewConstraintCategoryMap[category] || [];
                    subviewConstraintCategoryMap[category].push(constraint);
                    hasSubviewConstraints = YES;
                    return;
                }
            }*/

            constraintCategoryMap[category] = constraintCategoryMap[category] || [];
            constraintCategoryMap[category].push(constraint);
        });

        for (const category of Object.keys(constraintCategoryMap).sort()) {
            const section = this[`_${category}`] || BMLayoutEditorSettingsSection.section();
            this[`_${category}`] = section;
            section.length = 0;
            section.name = category + ' Constraints';
            section._settings = constraintCategoryMap[category].map(constraint => BMLayoutEditorSetting.settingWithName(constraint.toString(), {kind: BMLayoutEditorSettingKind.Constraint, target: constraint}));

            this._settingSections.push(section);
        }

        this._constraintCategories = constraintCategoryMap;

        //---------------------------------------------------------------------------------------------------------
        if (hasSubviewConstraints && this._showsSubviewConstraints) {
            for (const category of Object.keys(subviewConstraintCategoryMap).sort()) {
                const categoryName = '_subview' + category;
                const section = this[categoryName] || BMLayoutEditorSettingsSection.section();
                this[categoryName] = section;
                section.length = 0;
                section.name = 'Subview ' + category + ' Constraints';
                section._settings = subviewConstraintCategoryMap[category].map(constraint => BMLayoutEditorSetting.settingWithName(constraint.toString(), {kind: BMLayoutEditorSettingKind.Constraint, target: constraint}));
    
                this._settingSections.push(section);
            }
        }

        //---------------------------------------------------------------------------------------------------------
        if (hasInactiveConstraints && this._showsInactiveConstraints) {
            for (const category of Object.keys(inactiveConstraintsMap).sort()) {
                const categoryName = '_inactive' + category;
                const section = this[category] || BMLayoutEditorSettingsSection.section();
                this[category] = section;
                section.length = 0;
                section.name = 'Inactive ' + category + ' Constraints';
                section._settings = inactiveConstraintsMap[category].map(constraint => BMLayoutEditorSetting.settingWithName(constraint.toString(), {kind: BMLayoutEditorSettingKind.Constraint, target: constraint}));
    
                this._settingSections.push(section);
            }
        }

        //---------------------------------------------------------------------------------------------------------
        let internalConstraints = view.internalConstraints();
        if (internalConstraints.length) {
            const section = this._internalConstraintsSection || BMLayoutEditorSettingsSection.section();
            this._internalConstraintsSection = section;
            section.length = 0;
            section.name = 'Internal Constraints';
            section._settings = internalConstraints.map(constraint => BMLayoutEditorSetting.settingWithName(constraint.toString(), {kind: BMLayoutEditorSettingKind.Constraint, target: constraint}));

            this._settingSections.push(section);
        }

        if (this.layoutEditor) this.layoutEditor._drawConstraintsForView(this._displayedView, {includesInactiveConstraints: this._showsInactiveConstraints, includesSubviewConstraints: this._showsSubviewConstraints});

        const deactivateConstraintsSection = BMLayoutEditorSettingsSection.section();
        deactivateConstraintsSection._settings[0] = BMLayoutEditorSetting.settingWithName('Deactivate Constraints', {kind: BMLayoutEditorSettingKind.DeactivateConstraintsButton, target: this});
        this._settingSections.push(deactivateConstraintsSection);

        this.commitUpdates();
    }
});

/**
 * Constructs and returns a view layout settings tab for the given view.
 * @param view <BMView>                                 The view whose constraints will be displayed.
 * @return <_BMLayoutEditorViewLayoutSettingsTab>       A view layout settings tab.
 */
_BMLayoutEditorViewLayoutSettingsTab.viewLayoutTabForView = function (view) {
    return (new _BMLayoutEditorViewLayoutSettingsTab).initWithView(view);
}

// @endtype
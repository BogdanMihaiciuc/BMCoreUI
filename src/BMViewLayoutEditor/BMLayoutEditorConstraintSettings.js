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


// @type _BMLayoutEditorConstraintSettingsPanel

/**
 * A class that controls the settings for a view.
 */
export function _BMLayoutEditorConstraintSettingsPanel() {} // <constructor>

_BMLayoutEditorConstraintSettingsPanel.prototype = BMExtend(Object.create(_BMLayoutEditorCollectionSettingsPanel.prototype), {
    constructor: _BMLayoutEditorConstraintSettingsPanel,

    /**
     * The view whose settings are displayed.
     */
    _displayedConstraint: undefined, // <BMLayoutConstraint>

    /**
     * The view from which this constraint settings panel was opened.
     */
    _referenceView: undefined, // <BMView>

    /**
     * The visual attributes tab.
     */
    _attributesTab: undefined, // <BMLayoutEditorSettingsTab>

    /**
     * Designated initializer. Initializes this settings panel with the given settings view.
     * @param view <_BMLayoutSettingsView>          The settings view.
     * @return <_BMLayoutEditorSettingsPanel>       This setttings panel.
     */
    initWithSettingsView(settingsView, {forConstraint: constraint, withReferenceView: view}) {
        _BMLayoutEditorSettingsPanel.prototype.initWithSettingsView.call(this, settingsView);

        this._displayedConstraint = constraint;
        this._referenceView = view;

        // Create the default tabs
        this._attributesTab = BMLayoutEditorSettingsTab.tabWithName('Attributes', {icon: _BMURLOfImageAtPath('images/Properties.png')});
        this._attributesTab._settingsPanel = this;

        // Prepare the menu options
        const attributeOptions = [];
        if (constraint._kind == BMLayoutConstraintKind.Horizontal) {
            if (constraint._sourceViewAttribute === BMLayoutAttribute.Width) {
                attributeOptions.push(BMMenuItem.menuItemWithName(constraint._sourceViewAttribute, {userInfo: constraint._sourceViewAttribute}));
            }
            else {
                attributeOptions.push(BMMenuItem.menuItemWithName(BMLayoutAttribute.Leading, {userInfo: BMLayoutAttribute.Leading}));
                attributeOptions.push(BMMenuItem.menuItemWithName(BMLayoutAttribute.CenterX, {userInfo: BMLayoutAttribute.CenterX}));
                attributeOptions.push(BMMenuItem.menuItemWithName(BMLayoutAttribute.Trailing, {userInfo: BMLayoutAttribute.Trailing}));
                attributeOptions.push(BMMenuItem.menuItemWithName(BMLayoutAttribute.Left, {userInfo: BMLayoutAttribute.Left}));
                attributeOptions.push(BMMenuItem.menuItemWithName(BMLayoutAttribute.Right, {userInfo: BMLayoutAttribute.Right}));
            }
        }
        else {
            if (constraint._sourceViewAttribute === BMLayoutAttribute.Height) {
                attributeOptions.push(BMMenuItem.menuItemWithName(constraint._sourceViewAttribute, {userInfo: constraint._sourceViewAttribute}));
            }
            else {
                attributeOptions.push(BMMenuItem.menuItemWithName(BMLayoutAttribute.Top, {userInfo: BMLayoutAttribute.Top}));
                attributeOptions.push(BMMenuItem.menuItemWithName(BMLayoutAttribute.CenterY, {userInfo: BMLayoutAttribute.CenterY}));
                attributeOptions.push(BMMenuItem.menuItemWithName(BMLayoutAttribute.Bottom, {userInfo: BMLayoutAttribute.Bottom}));
            }
        }

        const firstView = BMLayoutEditorSettingsSection.section();
        firstView._settings[0] = BMLayoutEditorSetting.settingWithName('First View', {kind: BMLayoutEditorSettingKind.View, target: constraint, property: '_sourceView'});
        firstView._settings[1] = BMLayoutEditorEnumSetting.settingWithName('Attribute', {kind: BMLayoutEditorSettingKind.Enum, target: constraint, property: '_sourceViewAttribute'});
        firstView._settings[1].options = attributeOptions;
        this._attributesTab._settingSections.push(firstView);

        const relation = BMLayoutEditorSettingsSection.section();
        relation._settings[0] = BMLayoutEditorEnumSetting.settingWithName('Relation', {kind: BMLayoutEditorSettingKind.Enum, target: constraint, property: '_relation'});
        relation._settings[0].options = [
            BMMenuItem.menuItemWithName('=', {userInfo: BMLayoutConstraintRelation.Equals}),
            BMMenuItem.menuItemWithName('\u2265', {userInfo: BMLayoutConstraintRelation.GreaterThanOrEquals}),
            BMMenuItem.menuItemWithName('\u2264', {userInfo: BMLayoutConstraintRelation.LessThanOrEquals})
        ];
        this._attributesTab._settingSections.push(relation);

        const secondView = BMLayoutEditorSettingsSection.section();
        if (constraint._targetView) {
            secondView._settings[0] = BMLayoutEditorSetting.settingWithName('Multiplier', {kind: BMLayoutEditorSettingKind.Number, target: constraint, property: '_multiplier'});
            secondView._settings[1] = BMLayoutEditorSetting.settingWithName('Second View', {kind: BMLayoutEditorSettingKind.View, target: constraint, property: '_targetView'});
            secondView._settings[2] = BMLayoutEditorEnumSetting.settingWithName('Attribute', {kind: BMLayoutEditorSettingKind.Enum, target: constraint, property: '_targetViewAttribute'});
            secondView._settings[2].options = attributeOptions;
        }
        let constantSetting;
        secondView._settings[secondView._settings.length] = constantSetting = BMLayoutEditorSetting.settingWithName('Constant', {kind: BMLayoutEditorSettingKind.Constant, target: constraint, variations: YES, property: 'constant'});
        constantSetting.automaticallyExpandsVariations = YES;
        this._attributesTab._settingSections.push(secondView);

        const priority = BMLayoutEditorSettingsSection.section();
        priority._settings[0] = BMLayoutEditorSetting.settingWithName('Priority', {kind: BMLayoutEditorSettingKind.Number, target: constraint, variations: YES, property: 'priority'});
        priority._settings[1] = BMLayoutEditorSetting.settingWithName('Active', {kind: BMLayoutEditorSettingKind.Boolean, target: constraint, variations: YES, property: 'isActive'});
        priority._settings[1].automaticallyExpandsVariations = YES;
        this._attributesTab._settingSections.push(priority);

        const deleteSection = BMLayoutEditorSettingsSection.section();
        deleteSection._settings[0] = BMLayoutEditorSetting.settingWithName('Delete', {kind: BMLayoutEditorSettingKind.DeleteConstraintButton, target: constraint, variations: NO});
        this._attributesTab._settingSections.push(deleteSection);

        this._currentTab = this._attributesTab;

        this._tabs = [this._attributesTab];

        this.title = 'Constraint';

        // TODO: Custom tabs

        return this;
    },

    // @override - BMLayoutEditorSettingsPanel
    settingsPanelWillAppear(animated) {
        this.layoutEditor.selectConstraint(this._displayedConstraint, {withReferenceView: this._referenceView});
        //this.layoutEditor._drawConstraint(this._displayedConstraint, {withReferenceView: this._referenceView});
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

// @type _BMLayoutEditorConstraintSettingsTab

/**
 * A specialized settings tab used for displaying view layout settings.
 */
function _BMLayoutEditorConstraintSettingsTab() {} // <constructor>

_BMLayoutEditorConstraintSettingsTab.prototype = BMExtend(Object.create(BMLayoutEditorSettingsTab.prototype), {
    constructor: _BMLayoutEditorConstraintSettingsTab,

    /**
     * The view whose constraints are displayed.
     */
    _displayedView: undefined, // <BMView>

    /**
     * Controls whether subview constraints are displayed.
     */
    _showsSubviewConstraints: NO, // <Boolean>

    /**
     * The categories of the view's own constraints.
     */
    _constraintCategories: undefined, // <Object<String, [BMLayoutConstraint]>

    /**
     * Initializes this view layout tab for the specified view.
     * @param view <BMView>     The view whose constraints will be displayed.
     */
    initWithView(view) {
        BMLayoutEditorSettingsTab.prototype.initWithName.call(this, 'Layout', {icon: _BMURLOfImageAtPath('images/Layout.png')});

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
            this._settingSections.push(this._intrinsicResistanceSection);
        }
        else {
            const intrinsicResistanceSection = BMLayoutEditorSettingsSection.section();
            this._intrinsicResistanceSection = intrinsicResistanceSection;
            intrinsicResistanceSection._settings[0] = BMLayoutEditorSetting.settingWithName('Compression Resistance', {kind: BMLayoutEditorSettingKind.Integer, target: view, property: 'compressionResistance'});
            intrinsicResistanceSection._settings[1] = BMLayoutEditorSetting.settingWithName('Expansion Resistance', {kind: BMLayoutEditorSettingKind.Integer, target: view, property: 'expansionResistance'});
            this._settingSections.push(intrinsicResistanceSection);
        }

        if (this._intrinsicSizeSection) {
            this._settingSections.push(this._intrinsicSizeSection);
        }
        else {
            const intrinsicSizeSection = BMLayoutEditorSettingsSection.section();
            this._intrinsicSizeSection = intrinsicSizeSection;
            intrinsicSizeSection._settings[0] = BMLayoutEditorSetting.settingWithName('Intrinsic Size', {kind: BMLayoutEditorSettingKind.Info, target: view, property: 'supportsIntrinsicSize'});
            this._settingSections.push(intrinsicSizeSection);
        }

        const constraintViewPicker = this._constraintViewPickerSection || BMLayoutEditorSettingsSection.section();
        this._constraintViewPickerSection = constraintViewPicker;
        constraintViewPicker.name = 'Show';
        constraintViewPicker._settings[0] = BMLayoutEditorEnumSetting.settingWithName('Show', {kind: BMLayoutEditorSettingKind.Segment, target: this, property: '_displayMode'});
        constraintViewPicker._settings[0].options = [
            BMMenuItem.menuItemWithName('Own Constraints', {icon: _BMURLOfImageAtPath('images/OwnConstraints.png'), userInfo: 'own'}),
            BMMenuItem.menuItemWithName('Subview Constraints', {icon: _BMURLOfImageAtPath('images/SubviewConstraints.png'), userInfo: 'subview'}),
            BMMenuItem.menuItemWithName('Inactive Constraints', {icon: _BMURLOfImageAtPath('images/InactiveConstraints.png'), userInfo: 'inactive'}),
            BMMenuItem.menuItemWithName('All Constraints', {icon: _BMURLOfImageAtPath('images/AllConstraints.png'), userInfo: 'all'})
        ];
        this._settingSections.push(constraintViewPicker);


        // View constraints will be split into four groups:
        //
        // 1. Visible by default and non-collapsible will be the constraints that directly affect the view,
        // or link the view to its siblings or ancestors
        //
        // 2. A second, collapsed by default group, will show the constraints that link the view to its descendants
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

            if (!constraint._isConstraintCollection) {
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
            }

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
 * @return <_BMLayoutEditorConstraintSettingsTab>       A view layout settings tab.
 */
_BMLayoutEditorConstraintSettingsTab.viewLayoutTabForView = function (view) {
    return (new _BMLayoutEditorConstraintSettingsTab).initWithView(view);
}

// @endtype
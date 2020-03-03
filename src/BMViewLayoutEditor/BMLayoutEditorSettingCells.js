//@ts-check

import { BMExtend, BMStringByCapitalizingString, YES, NO } from "../Core/BMCoreUI";
import { BMCollectionViewCell } from "../BMCollectionView/BMCollectionViewCell";
import { BMLayoutAttribute } from "../BMView/BMLayoutConstraint_v2.5";
import { _BMURLOfImageAtPath } from "./BMLayoutEditorSettings";
import { BMView } from "../BMView/BMView_v2.5";
import { BMLayoutSizeClass, BMLayoutOrientation } from "../BMView/BMLayoutSizeClass";
import { BMPointMake } from "../Core/BMPoint";
import { BMMenuKind } from "../BMView/BMMenu";
import { BMRectMakeWithNodeFrame } from "../Core/BMRect";


const BMLayoutEdittorSettingCellRowSpacing = 2;

// @type BMLayoutEditorSettingsTitleView extends BMView

/**
 * A view subclass used by layout editor setting cells as the setting title.
 * In addition to displaying the cell's title, it also manages adding and removing variations
 * for the setting.
 */
function BMLayoutEditorSettingsTitleView() {} // <constructor>

BMLayoutEditorSettingsTitleView.prototype = BMExtend(Object.create(BMView.prototype), {
    constructor: BMLayoutEditorSettingsTitleView,

    /**
     * The view displaying the title text.
     */
    _titleLabel: undefined, // <BMView>

    /**
     * The view displaying the size class badge, if there is one.
     */
    _badge: undefined, // <BMView>

    /**
     * The view displaying the variations button, if there is one.
     */
    _button: undefined, // <BMView>

    /**
     * The string to display as a title.
     */
    _title: undefined, // <String>
    get title() {
        return this._title;
    },
    set title(title) {
        this._title = title;
        this._titleLabel.node.innerText = title;
        this._titleLabel.invalidateIntrinsicSize();
    },

    /**
     * The setting displayed by this title view.
     */
    _setting: undefined, // <BMLayoutEditorSetting, nullable>
    get setting() {
        return this._setting;
    },
    set setting(setting) {
        this._setting = setting;

        if (setting.sizeClass) {
            switch (setting.sizeClass) {
                case BMLayoutSizeClass.phoneSizeClass():
                    this._badge.node.className = 'BMLayoutEditorDetailsItemBadgeIcon BMLayoutEditorImagePhoneMini';
                    break;
                case BMLayoutSizeClass.phoneSizeClassWithOrientation(BMLayoutOrientation.Portrait):
                    this._badge.node.className = 'BMLayoutEditorDetailsItemBadgeIcon BMLayoutEditorImagePhonePortraitMini';
                    break;
                case BMLayoutSizeClass.phoneSizeClassWithOrientation(BMLayoutOrientation.Landscape):
                    this._badge.node.className = 'BMLayoutEditorDetailsItemBadgeIcon BMLayoutEditorImagePhoneLandscapeMini';
                    break;
                case BMLayoutSizeClass.tabletSizeClass():
                    this._badge.node.className = 'BMLayoutEditorDetailsItemBadgeIcon BMLayoutEditorImageTabletMini';
                    break;
                case BMLayoutSizeClass.tabletSizeClassWithOrientation(BMLayoutOrientation.Portrait):
                    this._badge.node.className = 'BMLayoutEditorDetailsItemBadgeIcon BMLayoutEditorImageTabletPortraitMini';
                    break;
                case BMLayoutSizeClass.tabletSizeClassWithOrientation(BMLayoutOrientation.Landscape):
                    this._badge.node.className = 'BMLayoutEditorDetailsItemBadgeIcon BMLayoutEditorImageTabletLandscapeMini';
                    break;
                default:
                    this._badge.node.className = 'BMLayoutEditorDetailsItemBadge';
                    this._badge.node.innerText = setting.sizeClass._hashString;
            }
            this._button.node.innerHTML = '<i class="material-icons">remove_circle</i>';
            this._button.isVisible = YES;

            this._badgeWidthConstraint.constant = 16;
            this._buttonWidthConstraint.constant = 24;
        }
        else {
            this._badge.node.className = '';
            if (setting.variations) {
                this._button.node.innerHTML = '<i class="material-icons">add_circle</i>';
                this._button.isVisible = YES;
                this._buttonWidthConstraint.constant = 24;
            }
            else {
                this._button.node.innerHTML = '';
                this._button.isVisible = NO;
                this._buttonWidthConstraint.constant = 0;
            }

            this._badgeWidthConstraint.constant = 0;
        }

        this._badge.invalidateIntrinsicSize();
        this.title = setting.name + ':';
    },

    initWithDOMNode() {
        BMView.prototype.initWithDOMNode.apply(this, arguments);

        // Create and configure the label text.
        const label = this._titleLabel = BMView.view();
        label.supportsAutomaticIntrinsicSize = YES;
        label.node.className = 'BMLayoutEditorDetailsTitleCell';
        this.addSubview(label);
        label.trailing.equalTo(this.trailing).isActive = YES;
        label.top.equalTo(this.top).isActive = YES;
        label.bottom.equalTo(this.bottom).isActive = YES;

        label.compressionResistance = 700;

        // Create and configure the size class badge
        const badge = this._badge = BMView.view();
        badge.supportsAutomaticIntrinsicSize = YES;
        this.addSubview(badge);
        label.leading.equalTo(badge.trailing, {plus: 4}).isActive = YES;
        badge.centerY.equalTo(label.centerY).isActive = YES;
        this._badgeWidthConstraint = badge.width.greaterThanOrEqualTo(16);
        this._badgeWidthConstraint.isActive = YES;
        badge.height.greaterThanOrEqualTo(16).isActive = YES;

        // Create and configure the variations button
        const button = this._button = BMView.view();
        button.node.className = 'BMLayoutEditorDetailsItemVariationsButton';
        this.addSubview(button);
        button.leading.equalTo(this.leading).isActive = YES;
        badge.leading.greaterThanOrEqualTo(button.trailing, {plus: 4}).isActive = YES;
        button.centerY.equalTo(label.centerY).isActive = YES;
        this._buttonWidthConstraint = button.width.equalTo(24);
        this._buttonWidthConstraint.isActive = YES;
        button.height.equalTo(24).isActive = YES;

        button.node.addEventListener('click', e => this.variationsButtonClickedWithEvent(e));

        return this;
    },

    /**
     * Invoked when the user clicks on the variations button.
     * @param event <Event>             The event that triggered this action.
     */
    variationsButtonClickedWithEvent(event) {
        if (this.setting.sizeClass) {
            this.setting.target[`remove${BMStringByCapitalizingString(this.setting.property)}VariationForSizeClass`](this.setting.sizeClass);
            // This is necessary in the case of removing variations for constant or isActive in the case of selected constraint for the currently selected size class
            this.rootView.setting = this.rootView.setting;
            this.rootView.tab.updateSettings();
        }
        else {
            // TODO check if a variation already exists for this size class; ideally filter the menu
            this.rootView.layoutEditor._showSizeClassMenuAtPoint(BMPointMake(event.clientX, event.clientY), {kind: BMMenuKind.Menu, action: sizeClass => {
                // Skip adding a new variation for a size class when it has already been defined
                if (this.setting.target._variations && this.setting.target._variations[sizeClass] && this.setting.property in this.setting.target._variations[sizeClass]) return;

                // Create the variation, then reload the tab contents
                this.setting.target[`set${BMStringByCapitalizingString(this.setting.property)}`](this.setting.target[this.setting.property], {forSizeClass: sizeClass});
                this.rootView.tab.updateSettings();
            }});
        }
    }
});

/**
 * Constructs and returns a title view.
 * @return <BMLayoutEditorSettingsTitleView>    A title view.
 */
BMLayoutEditorSettingsTitleView.titleView = function () {
    return (new BMLayoutEditorSettingsTitleView).initWithDOMNode(document.createElement('div'));
};

// @endtype

// @type BMLayoutEditorSettingsFooter extends BMCollectionViewCell

/**
 * The settings footer is a specialized subclass of collection view cell that is used by the layout editor
 * to display section separators.
 */
export function BMLayoutEditorSettingsFooter() {} // <constructor>

BMLayoutEditorSettingsFooter.prototype = BMExtend(Object.create(BMCollectionViewCell.prototype), {
    constructor: BMLayoutEditorSettingsFooter,

    initWithCollectionView() {
        BMCollectionViewCell.prototype.initWithCollectionView.apply(this, arguments);

        const contentView = BMView.view();
        this.addSubview(contentView);
    
        contentView.leading.equalTo(this.leading).isActive = YES;
        contentView.trailing.equalTo(this.trailing).isActive = YES;
        contentView.top.equalTo(this.top).isActive = YES;
        contentView.bottom.equalTo(this.bottom).isActive = YES;

        const dividerView = BMView.view();
        contentView.addSubview(dividerView);
        dividerView.node.className = 'BMLayoutEditorDetailsDividerCell';

        dividerView.leading.equalTo(contentView.leading).isActive = YES;
        dividerView.trailing.equalTo(contentView.trailing).isActive = YES;
        dividerView.height.equalTo(1).isActive = YES;
        dividerView.centerY.equalTo(contentView.centerY).isActive = YES;

        return this;
    }
});

// @endtype

// @type BMLayoutEditorSettingsCell extends BMCollectionViewCell

/**
 * The settings cell is a specialized subclass of collection view cell that is used by the layout editor
 * to display view and constraint settings.
 * 
 * The settings cell class itself is never used directly; instead, dependending on the type of the setting 
 * an appropriate subclass is used.
 * 
 * For settings where the built in cell types are not sufficient, this class serves as the base setting class
 * that can be subclassed to provide custom settings interfaces.
 */
export function BMLayoutEditorSettingsCell() {} // <constructor>

BMLayoutEditorSettingsCell.prototype = BMExtend(Object.create(BMCollectionViewCell.prototype), {
    constructor: BMLayoutEditorSettingsCell,

    /**
     * The view to which this cell's contents should be added.
     */
    _contentView: undefined, // <BMView>

    get contentView() {
        return this._contentView;
    },

    initWithCollectionView() {
        BMCollectionViewCell.prototype.initWithCollectionView.apply(this, arguments);

        const contentView = BMView.view();
        this._contentView = contentView;
        this.addSubview(contentView);

        if (this.constructor === BMLayoutEditorSettingsCell) {
            contentView.node.innerText = 'This is a test!';
    
            contentView.node.style.color = 'white';
        }
    
        contentView.leading.equalTo(this.leading).isActive = YES;
        contentView.trailing.equalTo(this.trailing).isActive = YES;
        contentView.top.equalTo(this.top).isActive = YES;
        contentView.bottom.equalTo(this.bottom).isActive = YES;

        return this;
    },

    /**
     * The setting displayed by this cell.
     */
    _setting: undefined, // <BMLayoutEditorSetting>

    get setting() {
        return this._setting;
    },
    set setting(setting) {
        this._setting = setting;
        this.cellDidBindToSetting(setting);
    },

    /**
     * The settings tab displaying this cell.
     * This property is typically not available during construction, but will
     * become available after this cell has been bound to a setting.
     */
    _tab: undefined, // <BMLayoutEditorSettingsTab, nullable>

    get tab() {
        return this._tab;
    },

    /**
     * The settings view displaying this cell.
     * This property is typically not available during construction, but will
     * become available after this cell has been bound to a setting.
     */
    get settingsView() { // <_BMLayoutEditorSettingsView, nullable>
        return this.tab._settingsPanel._settingsView;
    },

    /**
     * The layout editor displaying this cell.
     * This property is typically not available during construction, but will
     * become available after this cell has been bound to a setting.
     */
    get layoutEditor() { // <BMLayoutEditor, nullable>
        return this.tab.layoutEditor;
    },

    /**
     * Invoked when the setting displayed by this cell changes.
     * Subclasses can use this method to update their display to match the new setting.
     * The default implementation does nothing.
     * @param setting <BMLayoutEditorSetting>       The new setting.
     */
    cellDidBindToSetting(setting) {

    }
});

// @endtype

// @type BMLayoutEditorSettingsConstraintCell extends BMLayoutEditorSettingsCell

/**
 * A cell type specialized for displaying constraints.
 */
export function BMLayoutEditorSettingsConstraintCell() {} // <constructor>

BMLayoutEditorSettingsConstraintCell.prototype = BMExtend(Object.create(BMLayoutEditorSettingsCell.prototype), {
    constructor: BMLayoutEditorSettingsConstraintCell,

    _constraintView: undefined,

    /**
     * The constraint view leading layout constraint.
     */
    _constraintViewLeading: undefined, // <BMLayoutConstraint>

    initWithCollectionView() {
        BMLayoutEditorSettingsCell.prototype.initWithCollectionView.apply(this, arguments);

        const constraintView = BMView.view();
        this._constraintView = constraintView;
        this.contentView.addSubview(constraintView);
        constraintView.supportsAutomaticIntrinsicSize = YES;

        this._constraintViewLeading = constraintView.leading.equalTo(this.leading, {plus: 8});
        this._constraintViewLeading.isActive = YES;
        constraintView.trailing.equalTo(this.trailing, {plus: -8}).isActive = YES;
        constraintView.top.equalTo(this.top, {plus: 8}).isActive = YES;
        constraintView.bottom.equalTo(this.bottom).isActive = YES;

        constraintView.node.className = 'BMLayoutEditorDetailsConstraintItem BMLayoutEditorDetailsConstraintItemCell BMCollectionViewCellEventHandler';

        constraintView.node.addEventListener('click', event => {
            const constraint = this.setting.target;
            if (!constraint._internal) this.settingsView.selectConstraint(constraint, {withReferenceView: this.tab._displayedView})
        });

        return this;
    },

    // @override - BMCollectionViewCell
    cellDidBindToSetting(setting) {
        const constraintNode = this._constraintView.node;
        const constraint = setting.target;

        constraintNode.innerText = constraint.descriptionRelativeToView(this.tab._displayedView);

        const icon = document.createElement('img');
        icon.className = 'BMLayoutEditorDetailsConstraintIcon';

        if (constraint.isConstraintCollection) {
            icon.src = _BMURLOfImageAtPath('images/OwnConstraints.png');
        }
        else {
            const attribute = constraint._sourceView == this.tab._displayedView ? '_sourceViewAttribute' : '_targetViewAttribute';
            switch (constraint[attribute]) {
                case BMLayoutAttribute.Left:
                case BMLayoutAttribute.Leading:
                    icon.src = _BMURLOfImageAtPath('images/LeftConstraint.png');
                    break;
                case BMLayoutAttribute.Right:
                case BMLayoutAttribute.Trailing:
                    icon.src = _BMURLOfImageAtPath('images/RightConstraint.png');
                    break;
                case BMLayoutAttribute.Top:
                    icon.src = _BMURLOfImageAtPath('images/TopConstraint.png');
                    break;
                case BMLayoutAttribute.Bottom:
                    icon.src = _BMURLOfImageAtPath('images/BottomConstraint.png');
                    break;
                case BMLayoutAttribute.Width:
                    icon.src = _BMURLOfImageAtPath('images/WidthConstraint.png');
                    break;
                case BMLayoutAttribute.Height:
                    icon.src = _BMURLOfImageAtPath('images/HeightConstraint.png');
                    break;
            }
        }

        constraintNode.insertBefore(icon, constraintNode.firstChild);

        if (constraint._priority > 500 && constraint._priority < 1000) {
            constraintNode.classList.add('BMLayoutEditorDetailsConstraintItemStrong');
            constraintNode.classList.remove('BMLayoutEditorDetailsConstraintItemWeak');
        }
        else if (constraint._priority <= 500) {
            constraintNode.classList.remove('BMLayoutEditorDetailsConstraintItemStrong');
            constraintNode.classList.add('BMLayoutEditorDetailsConstraintItemWeak');
        }
        else {
            constraintNode.classList.remove('BMLayoutEditorDetailsConstraintItemStrong');
            constraintNode.classList.remove('BMLayoutEditorDetailsConstraintItemWeak');
        }

        if (constraint._internal) {
            constraintNode.classList.add('BMLayoutEditorDetailsConstraintItemReadonly');
        }
        else {
            constraintNode.classList.remove('BMLayoutEditorDetailsConstraintItemReadonly');
        }

        if (!constraint._configuration.isActive) {
            constraintNode.classList.add('BMLayoutEditorDetailsConstraintItemInactive');
        }
        else {
            constraintNode.classList.remove('BMLayoutEditorDetailsConstraintItemInactive');
        }

        this._constraintView.invalidateIntrinsicSize();

        return constraintNode;
    }
})

// @endtype

// @type BMLayoutEditorSettingsDeactivateConstraintsCell extends BMLayoutEditorSettingsCell

/**
 * A cell type specialized for displaying constraints.
 */
export function BMLayoutEditorSettingsDeactivateConstraintsCell() {} // <constructor>

BMLayoutEditorSettingsDeactivateConstraintsCell.prototype = BMExtend(Object.create(BMLayoutEditorSettingsCell.prototype), {
    constructor: BMLayoutEditorSettingsDeactivateConstraintsCell,

    _buttonView: undefined,

    prepareForDisplay() {
        window.addEventListener('keydown', this._keyboardModifier, YES);
        window.addEventListener('keyup', this._keyboardModifier, YES);
    },

    prepareForReuse() {
        window.removeEventListener('keydown', this._keyboardModifier, YES);
        window.removeEventListener('keyup', this._keyboardModifier, YES);
    },

    invalidate() {
        window.removeEventListener('keydown', this._keyboardModifier, YES);
        window.removeEventListener('keyup', this._keyboardModifier, YES);
    },

    initWithCollectionView() {
        BMLayoutEditorSettingsCell.prototype.initWithCollectionView.apply(this, arguments);

        const buttonView = BMView.view();
        this._buttonView = buttonView;
        this.contentView.addSubview(buttonView);
        buttonView.supportsAutomaticIntrinsicSize = YES;

        buttonView.leading.equalTo(this.contentView.leading, {plus: 32}).isActive = YES;
        buttonView.trailing.equalTo(this.contentView.trailing, {plus: -32}).isActive = YES;
        buttonView.top.equalTo(this.contentView.top, {plus: 8}).isActive = YES;
        buttonView.bottom.equalTo(this.contentView.bottom, {plus: -8}).isActive = YES;

        buttonView.node.className = 'BMWindowButton BMCollectionViewCellEventHandler';
        buttonView.node.style.boxSizing = 'border-box';
        buttonView.node.style.textAlign = 'center';
        buttonView.node.style.pointer = 'default';
        buttonView.node.style.margin = 0;
        buttonView.node.innerText = 'Deactivate Constraints';

        let hasOption = NO;
        let hasShift = NO;
        let hasCtrl = NO;

        buttonView.node.addEventListener('click', event => {
            if (hasOption && hasShift && hasCtrl) {
                new Set(this.setting.target.rootView.allConstraints).forEach(constraint => constraint.remove());
            }
            else if (hasOption) {
                for (let constraint of this.setting.target.localConstraints) {
                    if (hasShift) {
                        constraint.remove();
                    }
                    else {
                        if (this._activeSizeClass) {
                            constraint.setIsActive(NO, {forSizeClass: this._activeSizeClass});
                        }
                        else {
                            constraint.isActive = NO;
                        }
                    }
                }
            }
            else {
                const constraintCategoryMap = this.tab._constraintCategories;
                Object.keys(constraintCategoryMap).forEach(key => {
                    for (let constraint of constraintCategoryMap[key]) {
                        if (hasShift) {
                            constraint.remove();
                        }
                        else {
                            if (this.layoutEditor._activeSizeClass) {
                                constraint.setIsActive(NO, {forSizeClass: this.layoutEditor._activeSizeClass});
                            }
                            else {
                                constraint.isActive = NO;
                            }
                        }
                    }
                });
            }

            this.tab._updateSettings();
        });

        buttonView.node.addEventListener('contextmenu', event => event.preventDefault());

        this._keyboardModifier = event => {
            switch (event.key) {
                case 'Alt':
                    hasOption = (event.type == 'keydown');
                    break;
                case 'Shift':
                    hasShift = (event.type == 'keydown');
                    break;
                case 'Control':
                    hasCtrl = (event.type == 'keydown');
                    break;
            }

            if (hasOption) {
                if (hasShift) {
                    if (hasCtrl) {
                        buttonView.node.innerText = 'Reset Layout';
                    }
                    else {
                        buttonView.node.innerText = 'Remove All Constraints';
                    }
                }
                else {
                    buttonView.node.innerText = 'Deactivate All Constraints';
                }
            }
            else if (hasShift) {
                buttonView.node.innerText = 'Remove Constraints';
            }
            else {
                buttonView.node.innerText = 'Deactivate Constraints';
            }
        };

        return this;
    },

    // @override - BMCollectionViewCell
    cellDidBindToSetting(setting) {
    }
})

// @endtype

// @type BMLayoutEditorSettingsDeleteConstraintCell extends BMLayoutEditorSettingsCell

/**
 * A cell type specialized for displaying constraints.
 */
export function BMLayoutEditorSettingsDeleteConstraintCell() {} // <constructor>

BMLayoutEditorSettingsDeleteConstraintCell.prototype = BMExtend(Object.create(BMLayoutEditorSettingsCell.prototype), {
    constructor: BMLayoutEditorSettingsDeleteConstraintCell,

    _buttonView: undefined,

    initWithCollectionView() {
        BMLayoutEditorSettingsCell.prototype.initWithCollectionView.apply(this, arguments);

        const buttonView = BMView.view();
        this._buttonView = buttonView;
        this.contentView.addSubview(buttonView);
        buttonView.supportsAutomaticIntrinsicSize = YES;

        buttonView.leading.equalTo(this.contentView.leading, {plus: 32}).isActive = YES;
        buttonView.trailing.equalTo(this.contentView.trailing, {plus: -32}).isActive = YES;
        buttonView.top.equalTo(this.contentView.top, {plus: 8}).isActive = YES;
        buttonView.bottom.equalTo(this.contentView.bottom, {plus: -8}).isActive = YES;

        buttonView.node.className = 'BMWindowButton BMCollectionViewCellEventHandler';
        buttonView.node.style.boxSizing = 'border-box';
        buttonView.node.style.textAlign = 'center';
        buttonView.node.style.pointer = 'default';
        buttonView.node.style.margin = 0;
        buttonView.node.innerText = 'Delete Constraint';

        buttonView.node.addEventListener('click', event => {
            this.setting.target.remove();
            this.layoutEditor.selectView(this.tab._settingsPanel._referenceView);
        });

        buttonView.node.addEventListener('contextmenu', event => event.preventDefault());

        return this;
    },

    // @override - BMCollectionViewCell
    cellDidBindToSetting(setting) {
    }
})

// @endtype

// @type BMLayoutEditorSettingsConstraintCell extends BMLayoutEditorSettingsCell

/**
 * A cell type specialized for displaying section titles.
 */
export function BMLayoutEditorSettingsTitleCell() {} // <constructor>

BMLayoutEditorSettingsTitleCell.prototype = BMExtend(Object.create(BMLayoutEditorSettingsCell.prototype), {
    constructor: BMLayoutEditorSettingsTitleCell,

    _titleView: undefined,

    initWithCollectionView() {
        BMLayoutEditorSettingsCell.prototype.initWithCollectionView.apply(this, arguments);

        const titleView = BMView.view();
        this._titleView = titleView;
        this.contentView.addSubview(titleView);
        titleView.supportsAutomaticIntrinsicSize = YES;

        titleView.leading.equalTo(this.leading, {plus: 8}).isActive = YES;
        titleView.trailing.equalTo(this.trailing, {plus: -8}).isActive = YES;
        titleView.top.equalTo(this.top).isActive = YES;
        titleView.bottom.equalTo(this.bottom).isActive = YES;

        titleView.node.className = 'BMLayoutEditorDetailsTitleCell';

        return this;
    },

    // @override - BMCollectionViewCell
    cellDidBindToSetting(setting) {
        const titleNode = this._titleView.node;
        titleNode.innerText = setting.name;
        this._titleView.invalidateIntrinsicSize();
    }
})

// @endtype


// @type BMLayoutEditorSettingsReadonlyCell extends BMLayoutEditorSettingsCell

/**
 * A cell type specialized for displaying readonly settings.
 */
export function BMLayoutEditorSettingsReadonlyCell() {} // <constructor>

BMLayoutEditorSettingsReadonlyCell.prototype = BMExtend(Object.create(BMLayoutEditorSettingsCell.prototype), {
    constructor: BMLayoutEditorSettingsReadonlyCell,

    /**
     * The view that displays this setting's title.
     */
    _titleView: undefined,
    get titleView() {
        return this._titleView;
    },

    /**
     * The view that displays this setting's input node.
     */
    _inputView: undefined,
    get inputView() {
        return this._inputView;
    },

    initWithCollectionView(collectionView, args) {
        BMLayoutEditorSettingsCell.prototype.initWithCollectionView.apply(this, arguments);

        const titleView = BMView.view();
        this._titleView = titleView;
        this.contentView.addSubview(titleView);
        titleView.supportsAutomaticIntrinsicSize = YES;

        titleView.leading.equalTo(this.leading, {plus: 8}).isActive = YES;
        titleView.top.equalTo(this.top, {plus: BMLayoutEdittorSettingCellRowSpacing}).isActive = YES;
        titleView.node.className = 'BMLayoutEditorDetailsTitleCell';
        titleView.node.style.textAlign = 'right';
        titleView.height.equalTo(24).isActive = YES;
        titleView.node.style.cssText = 'vertical-align: middle; line-height: 24px; text-align: right;';

        const inputNode = document.createElement('div');
        inputNode.className = 'BMLayoutEditorDetailsItemReadonlyValue BMLayoutEditorDetailsItemReadonlyValueCell';
        inputNode.style.cssText = 'padding-left: 8px !important';
        const inputView = BMView.viewForNode(inputNode);
        this._inputView = inputView;
        inputView.supportsAutomaticIntrinsicSize = YES;

        this.contentView.addSubview(inputView);
        inputView.leading.equalTo(titleView.trailing, {plus: 8}).isActive = YES;
        inputView.width.greaterThanOrEqualTo(200).isActive = YES;
        inputView.width.equalTo(titleView.width, {times: 1.5, priority: 600}).isActive = YES;
        inputView.trailing.equalTo(this.trailing, {plus: -8}).isActive = YES;
        inputView.top.equalTo(this.top, {plus: BMLayoutEdittorSettingCellRowSpacing}).isActive = YES;
        inputView.height.greaterThanOrEqualTo(24).isActive = YES;
        inputView.bottom.equalTo(this.bottom, {plus: -BMLayoutEdittorSettingCellRowSpacing}).isActive = YES;

        return this;
    },

    // @override - BMCollectionViewCell
    cellDidBindToSetting(setting) {
        this._titleView.node.innerText = setting.name + ':';
        this._titleView.invalidateIntrinsicSize();

        this._inputView.node.innerText = setting.target[setting.property];
        this._inputView.invalidateIntrinsicSize();
    }
})

// @endtype


// @type BMLayoutEditorSettingsViewCell extends BMLayoutEditorSettingsReadonlyCell

/**
 * A cell type specialized for displaying readonly settings.
 */
export function BMLayoutEditorSettingsViewCell() {} // <constructor>

BMLayoutEditorSettingsViewCell.prototype = BMExtend(Object.create(BMLayoutEditorSettingsReadonlyCell.prototype), {
    constructor: BMLayoutEditorSettingsViewCell,

    initWithCollectionView(collectionView, args) {
        BMLayoutEditorSettingsReadonlyCell.prototype.initWithCollectionView.apply(this, arguments);

        this._inputView.node.classList.add('BMLayoutEditorDetailsItemReadonlyValueClickable');
        this._inputView.node.addEventListener('click', e => {
            this.settingsView.selectView(this.setting.target[this.setting.property]);
        });
        this._inputView.node.style.cssText += 'margin: 0px !important';

        return this;
    },

    // @override - BMCollectionViewCell
    cellDidBindToSetting(setting) {
        this._titleView.node.innerText = setting.name + ':';
        this._titleView.invalidateIntrinsicSize();

        const view = setting.target[setting.property];
        const arrowSpan = document.createElement('span');
        arrowSpan.innerText = '›';
        arrowSpan.className = 'BMLayoutEditorDetailsItemViewLink BMCollectionViewCellEventHandler';
        const viewSpan = document.createElement('span');
        viewSpan.innerText = ' ' + (view.debuggingName || view.node.id);
        this._inputView.node.innerHTML = '';
        this._inputView.node.appendChild(arrowSpan);
        this._inputView.node.appendChild(viewSpan);
    }
});

// @endtype

// @type BMLayoutEditorSettingsSegmentCell extends BMLayoutEditorSettingsCell

/**
 * A cell type specialized for displaying segment settings.
 */
export function BMLayoutEditorSettingsSegmentCell() {} // <constructor>

BMLayoutEditorSettingsSegmentCell.prototype = BMExtend(Object.create(BMLayoutEditorSettingsCell.prototype), {
    constructor: BMLayoutEditorSettingsSegmentCell,

    /**
     * The selected menu item, if there is one.
     */
    _currentMenuItem: undefined, // <BMMenuItem, nullable>

    initWithCollectionView(collectionView, args) {
        BMLayoutEditorSettingsCell.prototype.initWithCollectionView.apply(this, arguments);
        
        this.contentView.CSSClass = 'BMLayoutEditorDetailsTabView BMLayoutEditorDetailsSegmentControl';

        // Set up the constraints for the tab view
        this.contentView.height.equalTo(48).isActive = YES;
        this.contentView.width.equalTo(1024, {priority: 750}).isActive = YES;
        

        return this;
    },

    // @override - BMCollectionViewCell
    cellDidBindToSetting(setting) {
        this.contentView.contentNode.innerHTML = '';
        for (const menuItem of setting.options) {
            // Create the clickable tabs
            const tabNode = document.createElement('img');
            tabNode.className = 'BMLayoutEditorDetailsTab BMCollectionViewCellEventHandler';
            tabNode.src = menuItem.icon;
            this.contentView.contentNode.appendChild(tabNode);

            tabNode.title = menuItem.name;

            // Default to showing the current tab
            if (menuItem.userInfo == setting.target[setting.property]) {
                this._currentMenuItem = menuItem;
                tabNode.classList.add('BMLayoutEditorDetailsTabSelected');
            }

            menuItem._tabNode = tabNode;

            // Switch between the tabs on click
            tabNode.addEventListener('click', event => {
                if (menuItem == this._currentMenuItem) return;
                // Deselect the current tab
                this._currentMenuItem._tabNode.classList.remove('BMLayoutEditorDetailsTabSelected');
                // Then select the new one
                this._currentMenuItem = menuItem;
                tabNode.classList.add('BMLayoutEditorDetailsTabSelected');

                setting.target[setting.property] = menuItem.userInfo;
            });
        }
    }
});

// @endtype

// @type BMLayoutEditorSettingsBooleanCell extends BMLayoutEditorSettingsCell

/**
 * A cell type specialized for displaying input settings.
 */
export function BMLayoutEditorSettingsBooleanCell() {} // <constructor>

BMLayoutEditorSettingsBooleanCell.prototype = BMExtend(Object.create(BMLayoutEditorSettingsCell.prototype), {
    constructor: BMLayoutEditorSettingsBooleanCell,

    /**
     * The view that displays this setting's title.
     */
    _titleView: undefined, // <BMView>
    get titleView() {
        return this._titleView;
    },

    /**
     * The view that displays this setting's label node.
     */
    _labelView: undefined, // <BMView>
    get labelView() {
        return this._labelView;
    },

    _inputNode: undefined, // <DOMNode>

    initWithCollectionView(collectionView, args) {
        BMLayoutEditorSettingsCell.prototype.initWithCollectionView.apply(this, arguments);

        const titleView = BMLayoutEditorSettingsTitleView.titleView();
        this._titleView = titleView;
        this.contentView.addSubview(titleView);
        /*titleView.supportsAutomaticIntrinsicSize = YES;*/

        titleView.leading.equalTo(this.leading, {plus: 8}).isActive = YES;
        titleView.centerY.equalTo(this.centerY).isActive = YES;
        /*titleView.node.className = 'BMLayoutEditorDetailsTitleCell';
        titleView.node.style.textAlign = 'right';*/

        const toggleContainer = BMView.view();
        this.contentView.addSubview(toggleContainer);
        toggleContainer.leading.equalTo(titleView.trailing, {plus: 8}).isActive = YES;
        toggleContainer.trailing.equalTo(this.contentView.trailing, {plus: -8}).isActive = YES;
        toggleContainer.top.equalTo(this.contentView.top, {plus: BMLayoutEdittorSettingCellRowSpacing}).isActive = YES;
        toggleContainer.bottom.equalTo(this.contentView.bottom, {plus: -BMLayoutEdittorSettingCellRowSpacing}).isActive = YES;
        toggleContainer.width.greaterThanOrEqualTo(200).isActive = YES;
        toggleContainer.width.equalTo(titleView.width, {times: 1.5, priority: 600}).isActive = YES;

        // Create the toggle
        let value = document.createElement('label');
        value.className = 'BMWindowSwitch';
        value.style.margin = '0';
        
        value.innerHTML = `<input type="checkbox" data-toggle="YES"> OFF
        <div class="BMWindowSwitchGutter">
            <div class="BMWindowSwitchKnob"></div>
        </div>
        ON`;

        this._labelView = BMView.viewForNode(value);
        toggleContainer.addSubview(this._labelView);
        this._labelView.supportsAutomaticIntrinsicSize = YES;

        this._labelView.top.equalTo(toggleContainer.top).isActive = YES;
        this._labelView.leading.equalTo(toggleContainer.leading).isActive = YES;
        this._labelView.bottom.equalTo(toggleContainer.bottom).isActive = YES;
        this._labelView.width.equalTo(104).isActive = YES;
        this._labelView.height.equalTo(20).isActive = YES;

        // Set the value
        let input = value.getElementsByTagName('input')[0];
        this._inputNode = input;

        // If the setting supports an ideterminate state, set it up
        value.addEventListener('click', event => {
            if (!this.setting.nullable) return;
            if (event.target === input) return;
            if (input.checked) {
                event.preventDefault();
                event.stopPropagation();
                if (input.indeterminate) {
                    input.indeterminate = NO;
                    input.checked = NO;
                    this.inputValueDidChangeWithEvent(event, {toValue: NO});
                }
                else {
                    input.indeterminate = YES;
                    this.inputValueDidChangeWithEvent(event, {toValue: undefined});
                }
            }
        });

        input.addEventListener('change', event => {
            let value = Boolean(event.target.checked);

            // Read-only indicates an indeterminate state, if supported
            if (this.setting.nullable && input.indeterminate) {
                value = undefined;
            }

            this.inputValueDidChangeWithEvent(event, {toValue: value});
        });

        return this;
    },

    /**
     * Invoked whenever the value of this cell's input element changes as a result of user action.
     * This can either be due to the user typing content into the input element or pasting.
     * 
     * The default implementation does nothing.
     * @param event <Event>                     The event that triggered this action.
     * @param toValue <Boolean, nullable>       The new value.
     */
    inputValueDidChangeWithEvent(event, {toValue: value}) {
        const setting = this.setting;
        if (setting.sizeClass) {
            if (value === undefined) {
                setting.target[`remove${BMStringByCapitalizingString(setting.property)}VariationForSizeClass`](setting.sizeClass);
            }
            else {
                setting.target[`set${BMStringByCapitalizingString(setting.property)}`](value, {forSizeClass: setting.sizeClass});
            }
        }
        else {
            setting.target[setting.property] = value;
        }
    },

    // @override - BMCollectionViewCell
    cellDidBindToSetting(setting) {
        let value;
        if (setting.sizeClass) {
            if (setting.target._variations[setting.sizeClass]) {
                value = setting.target._variations[setting.sizeClass][setting.property];
            }
            else {
                value = undefined;
            }
        }
        else {
            value = setting.target[setting.property];
        }

        if (value === undefined && setting.nullable) {
            this._inputNode.indeterminate = YES;
            this._inputNode.checked = YES;
        }
        else {
            this._inputNode.indeterminate = NO;
            this._inputNode.checked = value;
        }

        this._titleView.setting = setting;

        // this._titleView.node.innerText = setting.name + ':';
        // this._titleView.invalidateIntrinsicSize();
    }
})

// @endtype

// @type BMLayoutEditorSettingsDropdownCell extends BMLayoutEditorSettingsCell

/**
 * A cell type specialized for displaying enum settings using drop down boxes.
 */
export function BMLayoutEditorSettingsDropdownCell() {} // <constructor>

BMLayoutEditorSettingsDropdownCell.prototype = BMExtend(Object.create(BMLayoutEditorSettingsCell.prototype), {
    constructor: BMLayoutEditorSettingsDropdownCell,

    /**
     * The view that displays this setting's title.
     */
    _titleView: undefined,
    get titleView() {
        return this._titleView;
    },

    /**
     * The view that displays this setting's input node.
     */
    _select: undefined,
    get inputView() {
        return this._select;
    },

    /**
     * Set to `YES` while this cell is bound.
     */
    _bound: NO,

    // @override - BMCollectionViewCell
    prepareForReuse() {
        this._bound = NO;
    },

    // @override - BMCollectionViewCell
    prepareForDisplay() {
        this._bound = YES;
    },

    initWithCollectionView(collectionView, args) {
        BMLayoutEditorSettingsCell.prototype.initWithCollectionView.apply(this, arguments);

        const titleView = BMLayoutEditorSettingsTitleView.titleView();
        this._titleView = titleView;
        this.contentView.addSubview(titleView);

        titleView.leading.equalTo(this.leading, {plus: 8}).isActive = YES;
        titleView.centerY.equalTo(this.centerY).isActive = YES;

        const inputNode = document.createElement('select');
        inputNode.className = 'BMWindowInput BMLayoutEditorDetailsCellInput BMLayoutEditorDetailsItemNumericValue';
        const inputView = BMView.viewForNode(inputNode);
        this._inputView = inputView;

        this.contentView.addSubview(inputView);
        inputView.leading.equalTo(titleView.trailing, {plus: 8}).isActive = YES;
        inputView.width.greaterThanOrEqualTo(200).isActive = YES;
        inputView.trailing.equalTo(this.trailing, {plus: -8}).isActive = YES;
        inputView.top.equalTo(this.top, {plus: BMLayoutEdittorSettingCellRowSpacing}).isActive = YES;
        inputView.height.equalTo(24).isActive = YES;
        inputView.bottom.equalTo(this.bottom, {plus: -BMLayoutEdittorSettingCellRowSpacing}).isActive = YES;
        inputView.width.equalTo(titleView.width, {times: 1.5, priority: 600}).isActive = YES;

        inputNode.addEventListener('change', event => {
            if (!this._bound) return;

            this.inputValueDidChangeWithEvent(event);
        });

        inputNode.addEventListener('focus', e => this.retain());
        inputNode.addEventListener('blur', e => this.release());

        return this;
    },

    /**
     * Invoked whenever the value of this cell's input element changes as a result of user action.
     * This can either be due to the user typing content into the input element or pasting.
     * 
     * The default implementation does nothing.
     * @param event <Event>     The event that triggered this action.
     */
    inputValueDidChangeWithEvent(event) {
        const setting = this.setting;
        const value = JSON.parse(this._inputView.node.value);
        if (setting.sizeClass) {
            setting.target[`set${BMStringByCapitalizingString(setting.property)}`](value, {forSizeClass: setting.sizeClass});
        }
        else {
            setting.target[setting.property] = value;
        }
    },

    // @override - BMCollectionViewCell
    cellDidBindToSetting(setting) {
        this._inputView.node.innerHTML = '';
        for (const item of setting.options) {
            const option = document.createElement('option');

            option.value = JSON.stringify(item.userInfo);
            option.innerText = item.name;

            this._inputView.node.appendChild(option);
            /*if (args && args.selected) {
                option.selected = YES;
            }*/
        }
        this._inputView.node.value = setting.sizeClass ? JSON.stringify(setting.target._variations[setting.sizeClass][setting.property]) : JSON.stringify(setting.target[setting.property]);
        this._titleView.setting = setting;
    }
})

// @endtype

// @type BMLayoutEditorSettingsInputCell extends BMLayoutEditorSettingsCell

/**
 * A cell type specialized for displaying input settings.
 */
export function BMLayoutEditorSettingsInputCell() {} // <constructor>

BMLayoutEditorSettingsInputCell.prototype = BMExtend(Object.create(BMLayoutEditorSettingsCell.prototype), {
    constructor: BMLayoutEditorSettingsInputCell,

    /**
     * The view that displays this setting's title.
     */
    _titleView: undefined,
    get titleView() {
        return this._titleView;
    },

    /**
     * The view that displays this setting's input node.
     */
    _inputView: undefined,
    get inputView() {
        return this._inputView;
    },

    /**
     * Set to `YES` while this cell is bound.
     */
    _bound: NO,

    // @override - BMCollectionViewCell
    prepareForReuse() {
        this._bound = NO;
    },

    // @override - BMCollectionViewCell
    prepareForDisplay() {
        this._bound = YES;
    },

    /**
     * Returns the value that indicates that the property should be "unset".
     * 
     * The default implementation returns an empty string.
     */
    get nullValue() {
        return '';
    },

    initWithCollectionView(collectionView, args) {
        BMLayoutEditorSettingsCell.prototype.initWithCollectionView.apply(this, arguments);

        const titleView = BMLayoutEditorSettingsTitleView.titleView();
        this._titleView = titleView;
        this.contentView.addSubview(titleView);
        // titleView.supportsAutomaticIntrinsicSize = YES;

        titleView.leading.equalTo(this.leading, {plus: 8}).isActive = YES;
        titleView.centerY.equalTo(this.centerY).isActive = YES;
        // titleView.node.className = 'BMLayoutEditorDetailsTitleCell';
        // titleView.node.style.textAlign = 'right';

        const inputNode = document.createElement('input');
        inputNode.className = 'BMWindowInput BMLayoutEditorDetailsCellInput ' + args.inputClasses;
        inputNode.type = args.inputKind;
        const inputView = BMView.viewForNode(inputNode);
        this._inputView = inputView;

        this.contentView.addSubview(inputView);
        inputView.leading.equalTo(titleView.trailing, {plus: 8}).isActive = YES;
        inputView.width.greaterThanOrEqualTo(200).isActive = YES;
        inputView.trailing.equalTo(this.trailing, {plus: -8}).isActive = YES;
        inputView.top.equalTo(this.top, {plus: BMLayoutEdittorSettingCellRowSpacing}).isActive = YES;
        inputView.height.equalTo(24).isActive = YES;
        inputView.bottom.equalTo(this.bottom, {plus: -BMLayoutEdittorSettingCellRowSpacing}).isActive = YES;
        inputView.width.equalTo(titleView.width, {times: 1.5, priority: 600}).isActive = YES;

        inputNode.addEventListener('input', event => {
            if (!this._bound) return;

            this.inputValueDidChangeWithEvent(event);
        });

        inputNode.addEventListener('paste', event => {
            if (!this._bound) return;

            this.inputValueDidChangeWithEvent(event);
        });

        inputNode.addEventListener('focus', e => this.retain());
        inputNode.addEventListener('blur', e => this.release());

        return this;
    },

    /**
     * Returns the value that should be applied to the setting.
     * Subclasses can override this getter to perform any necessary transforms
     * on the filter value if needed.
     * 
     * The default implementation returns the `value` property of this cell's input node.
     */
    get value() {
        return this._inputView.node.value;
    },

    /**
     * Invoked whenever the value of this cell's input element changes as a result of user action.
     * This can either be due to the user typing content into the input element or pasting.
     * 
     * The default implementation does nothing.
     * @param event <Event>     The event that triggered this action.
     */
    inputValueDidChangeWithEvent(event) {
        const setting = this.setting;
        if (setting.sizeClass) {
            const value = this.value;
            if (value === undefined || value === '' || value === this.nullValue) {
                setting.target[`remove${BMStringByCapitalizingString(setting.property)}VariationForSizeClass`](setting.sizeClass);
            }
            else {
                setting.target[`set${BMStringByCapitalizingString(setting.property)}`](value, {forSizeClass: setting.sizeClass});
            }
        }
        else {
            setting.target[setting.property] = this.value;
        }
    },

    // @override - BMCollectionViewCell
    cellDidBindToSetting(setting) {
        if (setting.sizeClass) {
            if (setting.target._variations[setting.sizeClass]) {
                if (!(setting.property in setting.target._variations)) {
                    this._inputView.node.value = this.nullValue;
                }
                else {
                    this._inputView.node.value = setting.target._variations[setting.sizeClass][setting.property];
                }
            }
            else {
                this._inputView.node.value = this.nullValue;
            }
        }
        else {
            this._inputView.node.value = setting.target[setting.property];
        }
        
        this._titleView.setting = setting;
    }
})

// @endtype

// @type BMLayoutEditorSettingsIntegerCell extends BMLayoutEditorSettingsInputCell

/**
 * A cell type specialized for displaying integer settings.
 */
export function BMLayoutEditorSettingsIntegerCell() {} // <constructor>

BMLayoutEditorSettingsIntegerCell.prototype = BMExtend(Object.create(BMLayoutEditorSettingsInputCell.prototype), {
    constructor: BMLayoutEditorSettingsIntegerCell,

    initWithCollectionView(collectionView, args) {
        args.inputKind = 'number';
        args.inputClasses = 'BMLayoutEditorDetailsItemNumericValue';
        BMLayoutEditorSettingsInputCell.prototype.initWithCollectionView.apply(this, arguments);
        this._inputView.node.step = 1;
        return this;
    },


    get value() {
        const value = parseInt(this._inputView.node.value, 10);

        if (isNaN(value)) {
            return 0;
        }

        return value;
    },

    // @override - BMCollectionViewCell
    cellDidBindToSetting(setting) {
        BMLayoutEditorSettingsInputCell.prototype.cellDidBindToSetting.apply(this, arguments);
    }
});

// @endtype

// @type BMLayoutEditorSettingsNumberCell extends BMLayoutEditorSettingsInputCell

/**
 * A cell type specialized for displaying number settings.
 */
export function BMLayoutEditorSettingsNumberCell() {} // <constructor>

BMLayoutEditorSettingsNumberCell.prototype = BMExtend(Object.create(BMLayoutEditorSettingsInputCell.prototype), {
    constructor: BMLayoutEditorSettingsNumberCell,

    initWithCollectionView(collectionView, args) {
        args.inputKind = 'number';
        args.inputClasses = 'BMLayoutEditorDetailsItemNumericValue';
        return BMLayoutEditorSettingsInputCell.prototype.initWithCollectionView.apply(this, arguments);
    },

    get value() {
        const value = parseFloat(this._inputView.node.value);

        if (isNaN(value)) {
            return 0;
        }

        return value;
    },

    // @override - BMCollectionViewCell
    cellDidBindToSetting(setting) {
        BMLayoutEditorSettingsInputCell.prototype.cellDidBindToSetting.apply(this, arguments);
    }
});

// @endtype

// @type BMLayoutEditorSettingsStringCell extends BMLayoutEditorSettingsInputCell

/**
 * A cell type specialized for displaying string settings.
 */
export function BMLayoutEditorSettingsStringCell() {} // <constructor>

BMLayoutEditorSettingsStringCell.prototype = BMExtend(Object.create(BMLayoutEditorSettingsInputCell.prototype), {
    constructor: BMLayoutEditorSettingsStringCell,

    initWithCollectionView(collectionView, args) {
        args.inputKind = 'text';
        args.inputClasses = 'BMLayoutEditorDetailsItemTextValue';
        return BMLayoutEditorSettingsInputCell.prototype.initWithCollectionView.apply(this, arguments);
    },

    // @override - BMCollectionViewCell
    cellDidBindToSetting(setting) {
        BMLayoutEditorSettingsInputCell.prototype.cellDidBindToSetting.apply(this, arguments);
    }
})

// @endtype

// @type BMLayoutEditorSettingsConstantCell extends BMLayoutEditorSettingsInputCell

/**
 * A cell type specialized for displaying constraint constant settings.
 */
export function BMLayoutEditorSettingsConstantCell() {} // <constructor>

BMLayoutEditorSettingsConstantCell.prototype = BMExtend(Object.create(BMLayoutEditorSettingsInputCell.prototype), {
    constructor: BMLayoutEditorSettingsConstantCell,

    get nullValue() {
        return '';
    },

    initWithCollectionView(collectionView, args) {
        args.inputKind = 'text';
        args.inputClasses = 'BMLayoutEditorDetailsItemTextValue';
        BMLayoutEditorSettingsInputCell.prototype.initWithCollectionView.apply(this, arguments);

        const inputNode = this._inputView.node;
        // This array contains all the available layout variables and is initialized upon the input
        // element acquiring keyboard focus
        let suggestions = [];
        // This array contains the layout variables that match the text contained within the input element
        let filteredSuggestions = [];
        // The popup menu displaying the filtered suggestions
        let menu;
        // The index of the top hit suggestion. And index of -1 represents no top hit.
        let highlightedItemIndex;

        // TODO: Consider encapsulating this functionality into a separate auto-complete text box class
        inputNode.addEventListener('focus', async event => {
            // Select all content upon receiving focus
            inputNode.select();

            suggestions = [];
            // Load up the variable names
            const variables = Object.keys(this.layoutEditor.layoutVariableProvider.layoutVariables);
            const uniqueNames = new Set;
            variables.forEach(variable => uniqueNames.add(variable));

            let options = [];

            // Create a pair of regular and minus-prefixed variable names
            for (const variable of uniqueNames) {
                suggestions.unshift(variable);
                suggestions.push('-' + variable);
            }

            filteredSuggestions = suggestions;
            highlightedItemIndex = -1;

            for (const option of suggestions) {
                options.push(this.layoutEditor.constraintOptionWithLabel(option, {action: () => {
                    menu = undefined;
                    inputNode.value = option;
                    inputNode.dispatchEvent(new Event('input'));

                    // Remove focus from the text box upon selecting a value
                    inputNode.blur();
                }}));
            }

            // Create and show a pulldown menu below the constant textbox, if there are any suggestions
            if (suggestions.length) {
                let frame = BMRectMakeWithNodeFrame(inputNode);
                let point = BMPointMake(frame.origin.x, frame.bottom);
                menu = this.layoutEditor.showMenuAtPoint(point, {withOptions: options, kind: BMMenuKind.PullDownMenu});
                menu.classList.add('BMLayoutEditorConstantSuggestions');

                menu.parentNode.classList.add('BMLayoutEditorConstantSuggestionsOverlay');

                // Prevent the menu from stealing focus, which would dismiss it before an option is selected
                menu.addEventListener('mousedown', e => e.preventDefault(), YES);
            }

            const fn = event => event.preventDefault();
            inputNode.addEventListener('mouseup', fn);
            // This timeout is necessary because otherwise regular clicks would instantly dismiss the menu
            await new Promise(resolve => setTimeout(resolve, 200));
            inputNode.removeEventListener('mouseup', fn);
            
        });

        inputNode.addEventListener('keydown', event => {
            if (event.code == 'ArrowDown' || event.code == 'ArrowUp') {
                event.preventDefault();
                if (filteredSuggestions.length == 0) return;

                // Move the selection accordingly
                if (event.code == 'ArrowUp') {
                    highlightedItemIndex = Math.max((highlightedItemIndex || 0) - 1, 0);
                }
                else {
                    highlightedItemIndex = Math.min((isNaN(highlightedItemIndex) ? -1 : highlightedItemIndex) + 1, filteredSuggestions.length - 1);
                }

                // Remove the highlighted class from the previously selected item
                for (const element of menu.querySelectorAll('.BMLayoutEditorConstraintPopupOptionHighlighted')) {
                    element.classList.remove('BMLayoutEditorConstraintPopupOptionHighlighted');
                }

                // Highlight the current item
                menu.childNodes[highlightedItemIndex].classList.add('BMLayoutEditorConstraintPopupOptionHighlighted');
            }

            if (event.code == 'Enter') {
                // Upon pressing the enter key, select the currently highlighted item, if available
                // then remove focus from the constant box
                if (!isNaN(highlightedItemIndex) && filteredSuggestions.length) {
                    inputNode.value = filteredSuggestions[highlightedItemIndex];
                    inputNode.dispatchEvent(new Event('input'));
                }

                inputNode.blur();
            }
        });

        inputNode.addEventListener('input', event => {
            const view = this.tab._settingsPanel._referenceView;
            const constraint = this._setting.target;

            // Note that these are currently static, but this may be used in the future for custom constraint or view properties as well at which point they may become
            // editable
            const property = 'constant';
            const capitalizedPropertyName = 'Constant';

            if (!view || !constraint) return;

            const number = parseFloat(inputNode.value);
            const constantValue = isNaN(number) ? inputNode.value : number;

            if (menu) {
                // If the menu is visible, filter it accordingly
                filteredSuggestions = suggestions.filter(e => e.toLowerCase().startsWith(inputNode.value.toLowerCase()));
                
                // Empty the menu
                menu.innerHTML = '';

                // Reset the highlighted item index
                highlightedItemIndex = 0;

                // Then add the filtered options
                for (const option of filteredSuggestions) {
                    menu.appendChild(this.layoutEditor.constraintOptionWithLabel(option, {action: () => {
                        menu = undefined;
                        inputNode.value = option;
                        inputNode.dispatchEvent(new Event('input'));
                    }}));
                }

                // Highlight the first item
                if (filteredSuggestions.length) {
                    menu.childNodes[0].classList.add('BMLayoutEditorConstraintPopupOptionHighlighted');
                    menu.style.display = 'block';
                }
                else {
                    menu.style.display = 'none';
                }
            }

            if (!inputNode.value) {
                if (args.sizeClass) {
                    if (constraint) {
                        constraint[`remove${capitalizedPropertyName}VariationForSizeClass`](args.sizeClass);
                        constraint._updateConfiguration();
                    }
                    else {
                        view[`remove${capitalizedPropertyName}VariationForSizeClass`](args.sizeClass);
                        view._updateConfiguration();
                    }
                }
                return;
            }

            if (constraint) {

                if (this.setting.sizeClass) {
                    constraint[`set${capitalizedPropertyName}`](constantValue, {forSizeClass: this.setting.sizeClass});
                }
                else {
                    constraint[property] = constantValue;
                }
                constraint._updateConfiguration();
                constraint._constraint = undefined;
                constraint._constituentConstraints = undefined;
                if (constraint._sourceView) {
                    constraint._sourceView.needsLayout = YES;
                }
                else {
                    constraint._views[0].needsLayout = YES;
                }
            }
            else {
                if (this.setting.sizeClass) {
                    view[`set${capitalizedPropertyName}`](number, {forSizeClass: this.setting.sizeClass});
                }
                else {
                    view[property] = number;
                }
                view.needsLayout = YES;
            }
        });

        // Upon the value box losing focus, dismiss the menu, if it was open
        // unless the newly focused item is a descendant of the menu
        inputNode.addEventListener('blur', event => {
            if (menu) {
                menu.parentNode.dispatchEvent(new Event('click'));
            }
        });

        return this;
    },

    // @override - BMCollectionViewCell
    cellDidBindToSetting(setting) {
        BMLayoutEditorSettingsInputCell.prototype.cellDidBindToSetting.apply(this, arguments);
    },

    // @override - BMLayoutEditorSettingCell
    inputValueDidChangeWithEvent(event) {
        // This cell has a custom implementation, therefore this method is a no op
    }
})

// @endtype
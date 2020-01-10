// @ts-check
import {YES, NO, BMExtend} from '../Core/BMCoreUI'
import {BMAnimateWithBlock, __BMVelocityAnimate, BMAnimationContextGetCurrent, BMHook, BM_USE_VELOCITY2, BMAnimationBeginWithDuration, BMAnimationApply, BMAnimationApplyBlocking, BMAnimationContextBeginStatic} from '../Core/BMAnimationContext'
import { _BMLayoutEditorCollectionSettingsPanel, BMLayoutEditorSettingsTab, _BMLayoutEditorSettingsPanel, _BMURLOfImageAtPath, BMLayoutEditorSettingKind, BMLayoutEditorSettingsSection, BMLayoutEditorSetting, BMLayoutEditorEnumSetting } from './BMLayoutEditorSettings'
import { BMEqualSpacingLayoutConstraint, BMLayoutConstraintKind, BMLayoutAttribute, BMEqualAttributeLayoutConstraint } from '../BMView/BMLayoutConstraint_v2.5';

// @type _BMLayoutEditorViewGroupSettingsPanel

/**
 * A class that controls the settings for a view.
 */
export function _BMLayoutEditorViewGroupSettingsPanel() {} // <constructor>

_BMLayoutEditorViewGroupSettingsPanel.prototype = BMExtend(Object.create(_BMLayoutEditorSettingsPanel.prototype), {
    constructor: _BMLayoutEditorViewGroupSettingsPanel,

    /**
     * The views whose settings are displayed.
     */
    _views: undefined, // <[BMView]>
    get views() {
        return this._views;
    },
    set views(views) {
        this._views = views;
        this.title = views.length + ' Selected';
    },

    /**
     * Designated initializer. Initializes this settings panel with the given settings view.
     * @param view <_BMLayoutSettingsView>          The settings view.
     * @return <_BMLayoutEditorSettingsPanel>       This setttings panel.
     */
    initWithSettingsView(settingsView, {forViews: views}) {
        _BMLayoutEditorSettingsPanel.prototype.initWithSettingsView.call(this, settingsView);

        this._views = views;

        this.title = views.length + ' Selected';

        return this;
    },

    /**
     * Constructs and returns a button with a handler that will be invoked when the button is pressed.
     * @param name <String>                 The text that will appear on this button.
     * {
     *  @param class <String, nullable>     If specified, this class will be added to the button.
     *  @param action <void ^(Event)>       A callback that will be invoked when this button is pressed.
     * }
     * @return <DOMNode>                    A button.
     */
    buttonSettingWithName(name, args) {
        if (args.class) {
            var button = document.createElement('div');
            button.className = 'BMLayoutEditorImageButton ' + args.class;
        }
        else {
            var button = document.createElement('button');
            button.className = 'BMWindowButton';
            button.innerText = name;
        }

        button.addEventListener('click', args.action);

        return button;
    },

    /**
     * Constructs and returns a divier.
     * @return <DOMNode>        A divider.
     */
    settingsDivider() {
        let divider = document.createElement('div');
        divider.className = 'BMLayoutEditorDetailsDivider';
        return divider;
    },

    /**
     * Constructs and returns a settings button that creates an equal attribute constraint
     * over a set of views.
     * @param name <String>                     The name of the button.
     * {
     *  @param icon <String, nullable>          Overrides name if specified. The icon to use for the button.
     *  @param attribute <BMLayoutAttribute>    The layout attribute with which the constraint will be created.
     * }
     */
    equalConstraintSettingWithName(name, args) {
        let setting = this.buttonSettingWithName(name, {class: args.class, action: event => {
            let constraint = BMEqualAttributeLayoutConstraint.constraintWithAttribute(args.attribute, {
                forViews: this.views,
                _internal: event.shiftKey
            });

            if (event.shiftKey) {
                constraint.constituentConstraints.forEach(constraint => {
                    constraint._install();
                    this.layoutEditor.addConstraint(constraint)
                });
            }
            else {
                this.layoutEditor.addConstraint(constraint);
            }
        }});
        return setting;
    },

    // @override - BMLayoutEditorSettingsPanel
    settingsPanelDidLoad() {
        const content = this.view.node;

        let constraintsTitle = this.readonlySettingWithName('Align Horizontal', {value: ''});
        constraintsTitle.childNodes[0].style.textAlign = 'center';
        constraintsTitle.childNodes[0].style.width = '100%';
        content.appendChild(constraintsTitle);

        let flexContainer = document.createElement('div');
        flexContainer.style.cssText = 'display: flex; flex-direction: row; align-self: center; padding-top: 8px; padding-bottom: 8px';
        content.appendChild(flexContainer);

        flexContainer.appendChild(this.equalConstraintSettingWithName('Align Top', {class: 'BMLayoutEditorImageButtonAlignAlignTop', attribute: BMLayoutAttribute.Top}));
        flexContainer.appendChild(this.equalConstraintSettingWithName('Align Center', {class: 'BMLayoutEditorImageButtonAlignCenterY', attribute: BMLayoutAttribute.CenterY}));
        flexContainer.appendChild(this.equalConstraintSettingWithName('Align Bottom', {class: 'BMLayoutEditorImageButtonAlignBottom', attribute: BMLayoutAttribute.Bottom}));
        

        //---------------------------------------------------------------------------------------------------------
        content.appendChild(this.settingsDivider());
        let internalConstraintsTitle = this.readonlySettingWithName('Distribute Horizontal', {value: ''});
        constraintsTitle.childNodes[0].style.textAlign = 'center';
        constraintsTitle.childNodes[0].style.width = '100%';
        content.appendChild(internalConstraintsTitle);

        flexContainer = document.createElement('div');
        flexContainer.style.cssText = 'display: flex; flex-direction: row; align-self: center; padding-top: 8px; padding-bottom: 8px';
        content.appendChild(flexContainer);

        flexContainer.appendChild(this.buttonSettingWithName('Equal Spacing', {class: 'BMLayoutEditorImageButtonEqualHorizontalSpacing', action: event => {
            let constraint = BMEqualSpacingLayoutConstraint.constraintOfKind(BMLayoutConstraintKind.Horizontal, {
                forViews: this.views.slice().sort((a, b) => a.node.getBoundingClientRect().left - b.node.getBoundingClientRect().left),
                withSuperview: NO,
                _internal: event.shiftKey
            });

            if (event.shiftKey) {
                constraint.constituentConstraints.forEach(constraint => {
                    constraint._install();
                    this.layoutEditor.addConstraint(constraint)
                });
            }
            else {
                this.layoutEditor.addConstraint(constraint);
            }
        }}));
        flexContainer.appendChild(this.buttonSettingWithName('Equal Spacing In Superview', {class: 'BMLayoutEditorImageButtonEqualHorizontalSpacingInSuperview', action: event => {
            let constraint = BMEqualSpacingLayoutConstraint.constraintOfKind(BMLayoutConstraintKind.Horizontal, {
                forViews: this.views.slice().sort((a, b) => a.node.getBoundingClientRect().left - b.node.getBoundingClientRect().left),
                withSuperview: YES,
                _internal: event.shiftKey
            });

            if (event.shiftKey) {
                constraint.constituentConstraints.forEach(constraint => {
                    constraint._install();
                    this.layoutEditor.addConstraint(constraint)
                });
            }
            else {
                this.layoutEditor.addConstraint(constraint);
            }
        }}));
        flexContainer.appendChild(this.equalConstraintSettingWithName('Equal Width', {class: 'BMLayoutEditorImageButtonEqualWidth', attribute: BMLayoutAttribute.Width}));

        //---------------------------------------------------------------------------------------------------------
        content.appendChild(this.settingsDivider());
        internalConstraintsTitle = this.readonlySettingWithName('Align Vertical', {value: ''});
        constraintsTitle.childNodes[0].style.textAlign = 'center';
        constraintsTitle.childNodes[0].style.width = '100%';
        content.appendChild(internalConstraintsTitle);

        flexContainer = document.createElement('div');
        flexContainer.style.cssText = 'display: flex; flex-direction: row; align-self: center; padding-top: 8px; padding-bottom: 8px';
        content.appendChild(flexContainer);

        flexContainer.appendChild(this.equalConstraintSettingWithName('Align Leading', {class: 'BMLayoutEditorImageButtonAlignLeading', attribute: BMLayoutAttribute.Leading}));
        flexContainer.appendChild(this.equalConstraintSettingWithName('Align Center', {class: 'BMLayoutEditorImageButtonAlignCenterX', attribute: BMLayoutAttribute.CenterX}));
        flexContainer.appendChild(this.equalConstraintSettingWithName('Align Trailing', {class: 'BMLayoutEditorImageButtonAlignTrailing', attribute: BMLayoutAttribute.Trailing}));

        //---------------------------------------------------------------------------------------------------------
        content.appendChild(this.settingsDivider());
        internalConstraintsTitle = this.readonlySettingWithName('Distribute Vertical', {value: ''});
        constraintsTitle.childNodes[0].style.textAlign = 'center';
        constraintsTitle.childNodes[0].style.width = '100%';
        content.appendChild(internalConstraintsTitle);

        flexContainer = document.createElement('div');
        flexContainer.style.cssText = 'display: flex; flex-direction: row; align-self: center; padding-top: 8px; padding-bottom: 8px';
        content.appendChild(flexContainer);

        flexContainer.appendChild(this.buttonSettingWithName('Equal Spacing', {class: 'BMLayoutEditorImageButtonEqualVerticalSpacing', action: event => {
            let constraint = BMEqualSpacingLayoutConstraint.constraintOfKind(BMLayoutConstraintKind.Vertical, {
                forViews: this.views.slice().sort((a, b) => a.node.getBoundingClientRect().top - b.node.getBoundingClientRect().top),
                withSuperview: NO,
                _internal: event.shiftKey
            });

            if (event.shiftKey) {
                constraint.constituentConstraints(constraint => {
                    constraint._install();
                    this.layoutEditor.addConstraint(constraint)
                });
            }
            else {
                this.layoutEditor.addConstraint(constraint);
            }
        }}));
        flexContainer.appendChild(this.buttonSettingWithName('Equal Spacing In Superview', {class: 'BMLayoutEditorImageButtonEqualVerticalSpacingInSuperview', action: event => {
            let constraint = BMEqualSpacingLayoutConstraint.constraintOfKind(BMLayoutConstraintKind.Vertical, {
                forViews: this.views.slice().sort((a, b) => a.node.getBoundingClientRect().top - b.node.getBoundingClientRect().top),
                withSuperview: YES,
                _internal: event.shiftKey
            });

            if (event.shiftKey) {
                constraint.constituentConstraints(constraint => {
                    constraint._install();
                    this.layoutEditor.addConstraint(constraint)
                });
            }
            else {
                this.layoutEditor.addConstraint(constraint);
            }
        }}));
        flexContainer.appendChild(this.equalConstraintSettingWithName('Equal Height', {class: 'BMLayoutEditorImageButtonEqualHeight', attribute: BMLayoutAttribute.Height}));
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
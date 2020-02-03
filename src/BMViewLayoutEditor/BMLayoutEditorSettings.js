// @ts-check

import {YES, NO, BMExtend} from '../Core/BMCoreUI'
import {BMPointMake} from '../Core/BMPoint'
import {BMSizeMake} from '../Core/BMSize'
import {BMIndexPathMakeWithRow} from '../Core/BMIndexPath'
import {__BMVelocityAnimate, BMAnimationContextGetCurrent, BMHook, BMAnimationBeginWithDuration, BMAnimationApply, BMAnimationContextBeginStatic} from '../Core/BMAnimationContext'
import {BMView} from '../BMView/BMView_v2.5'
import {BMCollectionViewFlowLayoutSupplementaryView, BMCollectionViewFlowLayoutGravity, BMCollectionViewFlowLayoutAlignment} from '../BMCollectionView/BMCollectionViewFlowLayout'
import {BMCollectionView} from '../BMCollectionView/BMCollectionView'
import { BMLayoutEditorSettingsCell, BMLayoutEditorSettingsConstraintCell, BMLayoutEditorSettingsFooter, BMLayoutEditorSettingsTitleCell, BMLayoutEditorSettingsIntegerCell, BMLayoutEditorSettingsReadonlyCell, BMLayoutEditorSettingsDeactivateConstraintsCell, BMLayoutEditorSettingsSegmentCell, BMLayoutEditorSettingsBooleanCell, BMLayoutEditorSettingsStringCell, BMLayoutEditorSettingsNumberCell, BMLayoutEditorSettingsViewCell, BMLayoutEditorSettingsDropdownCell, BMLayoutEditorSettingsConstantCell, BMLayoutEditorSettingsDeleteConstraintCell } from './BMLayoutEditorSettingCells'
import { _BMLayoutEditorViewSettingsPanel } from './BMLayoutEditorViewSettings'
import { _BMLayoutEditorConstraintSettingsPanel } from './BMLayoutEditorConstraintSettings'
import { _BMLayoutEditorViewGroupSettingsPanel } from './BMLayoutEditorViewGroupSettings'

/**
 * Returns the URL to the given image based on whether CoreUI is running within thingworx or standalone.
 * @path <String>           The image path.
 * @return <String>         The appropriate URL.
 */
export function _BMURLOfImageAtPath(path) {
    return (('TW' in window) ? '/Thingworx/Common/extensions/BMCoreUI/ui/BMCoreUI/' : '') + path;
}

// @type _BMLayoutEditorSettingsView

/**
 * The layout editor settings view manages the settings sidebar of the layout editor. It is responsible for creating the various
 * settings panels that display the actual settings and maintaining a back stack used for navigation when selecting between the
 * various options displayed by those panels.
 */
export function _BMLayoutEditorSettingsView() {} // <constructor>

_BMLayoutEditorSettingsView.prototype = BMExtend(Object.create(BMView.prototype), {
    constructor: _BMLayoutEditorSettingsView,

    /**
     * The layout editor managing this view.
     */
    _editor: undefined, // <BMLayoutEditor>

    /**
     * An array of settings panels that are currently in the setting pane's backstack.
     */
    _panels: undefined, // <[_BMLayoutEditorSettingsPanel]>

    /**
     * When this settings view is displayed in a tool window, this property contains a reference
     * to that window.
     */
    _window: undefined, // <BMWindow, nullable>

    /**
     * Set to `YES` after the user dismisses the settings window via the close button.
     * After it is set to `YES`, the window will no longer open after selecting a view.
     */
    _dismissedByUser: NO, // <Boolean>

    get window() {
        return this._window;
    },

    /**
     * The currently displayed settings panel.
     */
    get currentPanel() { // <_BMLayoutEditorSettingsPanel, nullable>
        return this._panels[this._panels.length - 1];
    },

    /**
     * Initializes this settings view with the given DOM node.
     * @param node <DOMNode>                    The DOM node to be used by the settings view.
     * {
     *  @param editor <BMLayoutEditor>          The layout editor managing this view.
     * }
     * @return <_BMLayoutEditorSettingsView>    This settings view.
     */
    initWithDOMNode(node, {forEditor: editor}) {
        BMView.prototype.initWithDOMNode.call(this, node);

        this.node.style.overflow = 'hidden';
        this._editor = editor;
        this._panels = [];

        return this;
    },

    // @override - BMWindowDelegate
    async windowWillAppear(window) {
        if (this._panels.length && this._panels[this._panels.length - 1]._awaitsLayout) {
            await 0;
            const panel = this._panels[this._panels.length - 1];
            panel.view.needsLayout = YES;
            panel.view.layoutIfNeeded();
            panel.settingsPanelDidLayoutView();
            panel._awaitsLayout = NO;
        }
    },

    /**
     * Prepares the given settings panel for display.
     * @param panel <_BMLayoutEditorSettingsPanel>      The panel to display.
     * {
     *  @param withBackButton <Boolean, nullable>       Controls whether this panel will contain a back button.
     * }
     */
    _provisionPanel(panel, {withBackButton: backButton} = {withBackButton: NO}) {
        panel._settingsView = this;

        // Create a container that will contain both the panel's content and its title view
        const container = BMView.view();
        this.addSubview(container);
        container.leading.equalTo(this.leading).isActive = YES;
        container.trailing.equalTo(this.trailing).isActive = YES;
        container.top.equalTo(this.top).isActive = YES;
        container.bottom.equalTo(this.bottom).isActive = YES;
        panel._container = container;
        container.node.classList.add('BMLayoutEditorDetails');
        container.node.style.cssText = 'border: none !important;'
        container.node.style.overflow = 'hidden';

        // Create a view that will contain the panel's content
        const view = BMView.view();
        container.addSubview(view);

        view.leading.equalTo(container.leading).isActive = YES;
        view.trailing.equalTo(container.trailing).isActive = YES;
        view.bottom.equalTo(container.bottom).isActive = YES;

        panel._view = view;

        // Create a title view for the panel
        const titleView = BMView.view();
        titleView.node.innerText = (backButton ? '‹ ' : '') + panel.title || '';
        titleView.node.className = 'BMWindowTitle BMLayoutEditorDetailsTitle';
        titleView.node.style.zIndex = 1;
        titleView.supportsAutomaticIntrinsicSize = YES;
        container.addSubview(titleView);

        titleView.leading.equalTo(container.leading, {plus: 64}).isActive = YES;
        titleView.trailing.lessThanOrEqualTo(container.trailing, {plus: -16}).isActive = YES;
        titleView.height.greaterThanOrEqualTo(48).isActive = YES;
        titleView.top.equalTo(container.top).isActive = YES;
        panel._titleView = titleView;

        view.top.equalTo(titleView.bottom).isActive = YES;

        if (backButton) {
            titleView.node.addEventListener('click', e => this.popPanel());
        }

        // Instruct the panel to set up its contents
        panel.settingsPanelDidLoad();

        if (this._window && !this._window._visible) {
            panel._awaitsLayout = YES;
        }
        else {
            // Perform layout
            this.layoutIfNeeded();
            panel.settingsPanelDidLayoutView();
        }
    },

    /**
     * Selects the given view, creating a settings panel for it and pushing it onto the settings stack.
     * @param view <BMView>         The view to select. This must be part of the layout hierarchy managed by this
     *                              settings view's layout editor.
     */
    selectView(view) {
        // Prevent the settings view from reacting to this selection
        this._ignoresSelection = YES;
        this._editor.selectView(view);

        // Create and push a panel for this view
        const panel = (new _BMLayoutEditorViewSettingsPanel).initWithSettingsView(this, {forView: view});
        this._provisionPanel(panel, {withBackButton: YES});
        this.pushPanel(panel);

        // Restore the usual selection behaviour
        this._ignoresSelection = NO;
    },

    /**
     * Invoked upon the layout editor selecting a view. Clears the current settings stack, then creates a settings
     * panel for the selected view and pushes it onto the stack.
     * @param view <BMView>         The view that was selected.
     */
    layoutEditorDidSelectView(view) {
        if (this._ignoresSelection) return;

        let animated = YES;

        if (this._window && !this._window._visible) {
            animated = NO;
        }

        const panel = (new _BMLayoutEditorViewSettingsPanel).initWithSettingsView(this, {forView: view});
        this._provisionPanel(panel);

        this.resetToPanel(panel, {animated});
    },

    /**
     * Invoked upon the layout editor selecting a goup views. Clears the current settings stack, then creates a settings
     * panel for multiple views and pushes it onto the stack.
     * @param views <[BMView]>          The views that were selected.
     */
    layoutEditorDidSelectViews(views) {
        if (this._panels[0] instanceof _BMLayoutEditorViewGroupSettingsPanel) {
            this._panels[0].views = views;
            return;
        }
        if (this._ignoresSelection) return;

        let animated = YES;

        if (this._window && !this._window._visible) {
            animated = NO;
        }

        const panel = (new _BMLayoutEditorViewGroupSettingsPanel).initWithSettingsView(this, {forViews: views});
        this._provisionPanel(panel);

        this.resetToPanel(panel, {animated});
    },

    /**
     * Selects the given constraint with the given view as a reference, creating a settings panel for it and pushing it
     * onto the settings stack.
     * @param constraint <BMLayoutConstraint>       The constraint to select. This must be part of the layout hierarchy managed by
     *                                              this setting view's layout editor.
     * {
     *  @param withReferenceView <BMView>           The view from which the constraint was selected.
     * }
     */
    selectConstraint(constraint, {withReferenceView: view}) {
        // Prevent the settings view from reacting to this selection
        this._ignoresSelection = YES;
        this._editor.selectConstraint(constraint, {withReferenceView: view});

        // Create and push a panel for this view
        const panel = (new _BMLayoutEditorConstraintSettingsPanel).initWithSettingsView(this, {forConstraint: constraint, withReferenceView: view});
        this._provisionPanel(panel, {withBackButton: YES});
        this.pushPanel(panel);

        // Restore the usual selection behaviour
        this._ignoresSelection = NO;
    },

    /**
     * Invoked upon the layout editor selecting a constraint. Clears the current settings stack, then creates a settings
     * panel for the selected constraint and pushes it onto the stack.
     * @param constrant <BMLayoutConstraint>        The constraint that was selected.
     * {
     *  @param withReferenceView <BMView>           The view from which the constraint was selected.
     * }
     */
    layoutEditorDidSelectConstraint(constraint, {withReferenceView: view}) {
        if (this._ignoresSelection) return;

        let animated = YES;

        if (this._window && !this._window._visible) {
            animated = NO;
        }

        const panel = (new _BMLayoutEditorConstraintSettingsPanel).initWithSettingsView(this, {forConstraint: constraint, withReferenceView: view});
        this._provisionPanel(panel, {withBackButton: YES});

        this.pushPanel(panel, {animated});
    },

    /**
     * Invoked upon the layout editor changing the currently selected layout size class.
     * This method in turns forwards this message to the settings panels currently in the back stack,
     * allowing them to customize their options for this size class change.
     * @param sizeClass <BMLayoutSizeClass>     The size class that was selected by the layout editor.
     */
    layoutEditorDidSelectSizeClass(sizeClass) {
        for (const panel of this._panels) {
            panel.layoutEditorDidSelectSizeClass(sizeClass);
        }
    },

    /**
     * Clears the back stack, then pushes the given panel onto the stack, making it visible. This change will be animated.
     * @param panel <_BMLayoutEditorSettingsPanel, nullable>        The panel to display. If `undefined`, the settings view will be cleared.
     * {
     *  @param animated <Boolean, nullable>                         Defaults to `YES`. If set to `YES`, this change will be animated.
     * }
     * @return <Promise<void>>                                      A promise that resolves when this operation completes.
     */
    async resetToPanel(panel, {animated = YES} = {animated: YES}) {
        // Unload everything except the current panel
        const currentPanel = this.currentPanel;

        for (const panel of this._panels) {
            if (panel != currentPanel) {
                panel.settingsPanelWillUnload();
                panel._container.release();
            }
        }

        // If there is no current panel, just display the given panel immediately
        if (!currentPanel) {
            if (panel) {
                this._panels.push(panel);
                this._ignoresSelection = YES;
                panel.settingsPanelWillAppear(NO);
                this._ignoresSelection = NO;
                panel.settingsPanelDidAppear(NO);
            }
            return;
        }

        this._panels = panel ? [panel] : [];

        if (currentPanel) {
            // Animate the outgoing panel, if it exists
            currentPanel.settingsPanelWillDisappear(YES);
            if (animated) BMAnimationBeginWithDuration(200, {easing: 'easeInOutQuad'});
            
            //const frame = currentPanel._container.frame.copy();
            //frame.offsetWithX(0, {y: 128});
            //currentPanel._container.frame = frame;
            currentPanel._container.opacity = 0;
            if (animated) {
                const controller = BMAnimationContextGetCurrent().controllerForObject(currentPanel._container, {node: currentPanel._container.node});
                controller.registerBuiltInPropertiesWithDictionary({scaleX: .85, scaleY: .85});
            }
            else {
                BMHook(currentPanel._container.node, {scaleX: .85, scaleY: .85});
            }
        }
        else {
            if (panel && animated) BMAnimationBeginWithDuration(200, {easing: 'easeInOutQuad'});
        }

        if (panel) {
            // Prepare the incoming panel for the animation
            BMAnimationContextBeginStatic();
            this._ignoresSelection = YES;
            panel.settingsPanelWillAppear(YES);
            this._ignoresSelection = NO;
            /*const initialFrame = panel._container.frame.copy();
            const animationFrame = initialFrame.copy();
            animationFrame.offsetWithX(0, {y: 256});
            panel._container.frame = animationFrame;*/
            panel._container.opacity = 0;

            BMHook(panel._container.node, {scaleX: 1.23, scaleY: 1.23});
            if (animated) BMAnimationApply();
    
            // Animate the incoming panel
            if (animated) {
                const controller = BMAnimationContextGetCurrent().controllerForObject(panel._container, {node: panel._container.node});
                controller.registerBuiltInPropertiesWithDictionary({scaleX: 1, scaleY: 1});
            }
            else {
                BMHook(panel._container.node, {scaleX: 1, scaleY: 1});
            }
            //panel._container.frame = initialFrame;
            panel._container.opacity = 1;
        }

        if ((panel || currentPanel) && animated) await BMAnimationApply();

        if (currentPanel) {
            // Perform any cleanup needed after the animation
            currentPanel.settingsPanelDidDisappear(YES);
            currentPanel.settingsPanelWillUnload();
            currentPanel._container.release();
        }

        if (panel) panel.settingsPanelDidAppear(YES);
    },

    /**
     * Pushes the given panel onto the back stack, making it visible. This change will be animated.
     * @param panel <_BMLayoutEditorSettingsPanel>          The panel to push.
     * {
     *  @param animated <Boolean, nullable>                         Defaults to `YES`. If set to `YES`, this change will be animated.
     * }
     * @return <Promise<void>>                              A promise that resolves when this operation completes.
     */
    async pushPanel(panel, {animated = YES} = {animated: YES}) {
        const currentPanel = this.currentPanel;
        this._panels.push(panel);

        if (currentPanel) {
            // Animate the outgoing panel, if it exists
            if (animated) BMAnimationBeginWithDuration(200, {easing: 'easeInOutQuad'});
            currentPanel.settingsPanelWillDisappear(YES);
            
            const frame = currentPanel._container.frame.copy();
            frame.offsetWithX(-frame.width / 2 | 0, {y: 0});
            currentPanel._container.frame = frame;
            currentPanel._container.opacity = 0;
        }
        else {
            if (animated) BMAnimationBeginWithDuration(200, {easing: 'easeInOutQuad'});
        }

        // Prepare the incoming panel for the animation
        BMAnimationContextBeginStatic();
        const initialFrame = panel._container.frame.copy();
        const animationFrame = initialFrame.copy();
        animationFrame.offsetWithX(initialFrame.width, {y: 0});
        panel._container.frame = animationFrame;
        BMAnimationApply();
        this._ignoresSelection = YES;
        panel.settingsPanelWillAppear(YES);
        this._ignoresSelection = NO;

        // Animate the incoming panel
        panel._container.frame = initialFrame;

        if (animated) await BMAnimationApply();

        // Perform any cleanup needed after the animation
        currentPanel.settingsPanelDidDisappear(YES);
        currentPanel._container.isVisible = NO;

        panel.settingsPanelDidAppear(YES);
    },

    /**
     * Pops the topmost settings panel from the back stack, revealing the previous one. This change will be animated.
     * @return <Promise<void>>                              A promise that resolves when this operation completes.
     */
    async popPanel() {
        const currentPanel = this.currentPanel;
        currentPanel._container.node.style.pointerEvents = 'none';
        this._panels.pop();

        // Animate the outgoing panel
        BMAnimationBeginWithDuration(200, {easing: 'easeInOutQuad'});
        currentPanel.settingsPanelWillDisappear(YES);
        
        const frame = this.frame.copy();
        frame.origin = BMPointMake();
        frame.offsetWithX(frame.width , {y: 0});
        currentPanel._container.frame = frame;

        const previousPanel = this.currentPanel;

        if (previousPanel) {
            // Prepare the incoming panel for the animationƒ
            BMAnimationContextBeginStatic();
            const initialFrame = this.frame.copy();
            initialFrame.origin = BMPointMake();
            const animationFrame = initialFrame.copy();
            animationFrame.offsetWithX(-frame.width / 2 | 0, {y: 0});
            previousPanel._container.frame = animationFrame;
            previousPanel._container.opacity = 0;
            previousPanel._container.isVisible = YES;
            BMAnimationApply();
            this._ignoresSelection = YES;
            previousPanel.settingsPanelWillAppear(YES);
            this._ignoresSelection = NO;
    
            // Animate the incoming panel
            previousPanel._container.frame = initialFrame;
            previousPanel._container.opacity = 1;

            if (previousPanel._awaitsLayout) {
                BMAnimationContextBeginStatic();
                previousPanel._titleView.invalidateIntrinsicSize();
                previousPanel.view.needsLayout = YES;
                previousPanel.view.layoutIfNeeded();
                previousPanel.settingsPanelDidLayoutView();
                previousPanel._awaitsLayout = NO;
                BMAnimationApply();
            }
        }

        await BMAnimationApply();

        // Perform any cleanup needed after the animation
        currentPanel.settingsPanelDidDisappear(YES);
        currentPanel.settingsPanelWillUnload();
        currentPanel._container.release();

        if (previousPanel) previousPanel.settingsPanelDidAppear(YES);
    }
});

/**
 * Constructs and initializes a settings view for the given node.
 * @param node <DOMNode>                    The DOM node to be used by the settings view.
 * {
 *  @param editor <BMLayoutEditor>          The layout editor managing this view.
 * }
 * @return <_BMLayoutEditorSettingsView>    A settings view.
 */
_BMLayoutEditorSettingsView.settingsViewWithNode = function (node, {forEditor: editor}) {
    return (new _BMLayoutEditorSettingsView).initWithDOMNode(node, {forEditor: editor});
}

// @endtype

// @type _BMLayoutEditorSettingsPanel

/**
 * A settings panel controls the settings that are available on the settings view.
 * A different subclass of the settings panel is typically used depending on the selected item.
 */
export function _BMLayoutEditorSettingsPanel() {} // <constructor>

_BMLayoutEditorSettingsPanel.prototype = {
    constructor: _BMLayoutEditorSettingsPanel,

    /**
     * The settings view to which this panel belongs.
     */
    _settingsView: undefined, // <_BMLayoutEditorSettingsView>

    /**
     * This panel's title.
     */
    _title: undefined, // <String>

    get title() {
        return this._title;
    },
    set title(title) {
        this._title = title;
        if (this._titleView) {
            this._titleView.node.innerText = title;
            this._titleView.invalidateIntrinsicSize();
        }
    },

    /**
     * The view representing this panel.
     */
    _container: undefined, // <BMView, nullable>

    /**
     * The title view associated to this panel.
     */
    _titleView: undefined, // <BMView, nullable>

    /**
     * The view to which this panel's content should be added.
     */
    _view: undefined, // <BMView, nullable>

    get view() {
        return this._view;
    },

    /**
     * The layout editor to which this panel belongs.
     */
    get layoutEditor() { // <BMLayoutEditor>
        return this._settingsView._editor;
    },

    /**
     * Designated initializer. Initializes this settings panel with the given settings view.
     * @param view <_BMLayoutEditorSettingsView>    The settings view.
     * @return <_BMLayoutEditorSettingsPanel>       This setttings panel.
     */
    initWithSettingsView(view) {
        this._settingsView = view;

        return this;
    },

    /**
     * Invoked whenever this panel is about to be added to the DOM.
     * When this method is invoked, a new view has been created from this panel
     * and should be used to add new subviews to it.
     * The default implementation does nothing.
     */
    settingsPanelDidLoad() {
        
    },

    /**
     * Invoked after the view for settings panel has finished a layout operation.
     */
    settingsPanelDidLayoutView() {

    },

    /**
     * Invoked prior to this settings panel becoming visible, before any animation begins.
     * At this point, the `view` property will return a view to which this panel's subviews can be added.
     * The default implementation does nothing.
     * @param animated <Boolean>        Set to `YES` if this change is animated. If this parameter is `YES`, this
     *                                  method will be invoked from within an animation block.
     */
    settingsPanelWillAppear(animated) {

    },

    /**
     * Invoked after this settings panel has become visible, after any animation has finished running.
     * The default implementation does nothing.
     * @param animated <Boolean>        Set to `YES` if this change was animated.
     */
    settingsPanelDidAppear(animated) {

    },

    /**
     * Invoked before this settings panel will disappear, before any associated animation starts.
     * The default implementation does nothing.
     * @param animated <Boolean>        Set to `YES` if this change is animated. If this parameter is `YES`, this
     *                                  method will be invoked from within an animation block.
     */
    settingsPanelWillDisappear(animated) {

    },

    /**
     * Invoked after this settings panel has disappeared, after any associated animation has finished running.
     * After this method returns, this panel's `view` may be removed from its hierarchy.
     * The default implementation does nothing.
     * @param animated <Boolean>        Set to `YES` if this change was animated.
     */
    settingsPanelDidDisappear(animated) {

    },

    /**
     * Invoked when the content managed by this settings panel is about to be removed from the DOM.
     * After this method returns, this panel's `view` will be removed from its view hierarchy.
     * The default implementation does nothing.
     */
    settingsPanelWillUnload() {

    }
}

// @endtype

// @type _BMLayoutEditorCollectionSettingsPanel

export function _BMLayoutEditorCollectionSettingsPanel() {} // <constructor>

/**
 * A subclass of settings panel that manages a list of settings tabs, associating a collection
 * view of settings with each of the tabs.
 */
_BMLayoutEditorCollectionSettingsPanel.prototype = BMExtend(Object.create(_BMLayoutEditorSettingsPanel.prototype), {


    /**
     * An array of settings tab controlling the settings
     * available for this panel.
     */
    _tabs: undefined, // <[BMLayoutEditorSettingsTab]>

    /**
     * The currently visible tab.
     */
    _currentTab: undefined, // <BMLayoutEditorSettingsTab>

    /**
     * Configures the layout settings of the given collection view.
     * @param collectionView <BMCollectionView>     The collection view.
     */
    _configureCollectionViewLayout(collectionView) {
        collectionView.node.style.position = 'absolute';

        // Configure the layout
        collectionView.layout.expectedCellSize = BMSizeMake(384, 48);
        collectionView.layout.maximumCellsPerRow = 1;
        collectionView.layout.gravity = BMCollectionViewFlowLayoutGravity.Expand;
        collectionView.layout.rowSpacing = 0;
        collectionView.layout.contentGravity = BMCollectionViewFlowLayoutAlignment.Start;
        collectionView.layout.showsFooters = YES;
        collectionView.layout.footerHeight = 17;
        collectionView.layout.topPadding = 8;

        collectionView.identityComparator = (setting1, setting2) => {
            if (!setting1 && !setting2) return YES;
            if (!setting1 || !setting2) return NO;
            return setting1.isEqualToSetting(setting2);
        }

        // Register the classes for the default cell types
        for (const key in BMLayoutEditorSettingKind) {
            collectionView.registerCellClass(BMLayoutEditorSettingsCell, {forReuseIdentifier: BMLayoutEditorSettingKind[key]});
        }
        collectionView.registerCellClass(BMLayoutEditorSettingsConstraintCell, {forReuseIdentifier: BMLayoutEditorSettingKind.Constraint});
        collectionView.registerCellClass(BMLayoutEditorSettingsTitleCell, {forReuseIdentifier: BMLayoutEditorSettingKind.Title});
        collectionView.registerCellClass(BMLayoutEditorSettingsIntegerCell, {forReuseIdentifier: BMLayoutEditorSettingKind.Integer});
        collectionView.registerCellClass(BMLayoutEditorSettingsNumberCell, {forReuseIdentifier: BMLayoutEditorSettingKind.Number});
        collectionView.registerCellClass(BMLayoutEditorSettingsConstantCell, {forReuseIdentifier: BMLayoutEditorSettingKind.Constant});
        collectionView.registerCellClass(BMLayoutEditorSettingsStringCell, {forReuseIdentifier: BMLayoutEditorSettingKind.String});
        collectionView.registerCellClass(BMLayoutEditorSettingsBooleanCell, {forReuseIdentifier: BMLayoutEditorSettingKind.Boolean});
        collectionView.registerCellClass(BMLayoutEditorSettingsReadonlyCell, {forReuseIdentifier: BMLayoutEditorSettingKind.Info});
        collectionView.registerCellClass(BMLayoutEditorSettingsDeleteConstraintCell, {forReuseIdentifier: BMLayoutEditorSettingKind.DeleteConstraintButton})
        collectionView.registerCellClass(BMLayoutEditorSettingsDeactivateConstraintsCell, {forReuseIdentifier: BMLayoutEditorSettingKind.DeactivateConstraintsButton});
        collectionView.registerCellClass(BMLayoutEditorSettingsSegmentCell, {forReuseIdentifier: BMLayoutEditorSettingKind.Segment});
        collectionView.registerCellClass(BMLayoutEditorSettingsViewCell, {forReuseIdentifier: BMLayoutEditorSettingKind.View});
        collectionView.registerCellClass(BMLayoutEditorSettingsDropdownCell, {forReuseIdentifier: BMLayoutEditorSettingKind.Enum});
        collectionView.registerSupplementaryViewClass(BMLayoutEditorSettingsFooter, {forReuseIdentifier: BMCollectionViewFlowLayoutSupplementaryView.Footer});

        // Register the custom cell classes
        for (const key in this.layoutEditor._settingCellClasses) {
            collectionView.registerCellClass(this.layoutEditor._settingCellClasses[key], {forReuseIdentifier: key});
        }
    },

    // @override - BMLayoutEditorSettingsPanel
    settingsPanelDidLoad() {
        // Create the topmost tab selector
        const tabView = BMView.view();
        tabView.CSSClass = 'BMLayoutEditorDetailsTabView';
        this.view.addSubview(tabView);

        // Set up the constraints for the tab view
        tabView.height.equalTo(48).isActive = YES;
        tabView.leading.equalTo(this.view.leading).isActive = YES;
        tabView.trailing.equalTo(this.view.trailing).isActive = YES;
        tabView.top.equalTo(this.view.top).isActive = YES;

        // Create the tab host, to which individual tabs will be added
        const tabHost = BMView.view();
        this.view.addSubview(tabHost);

        // Set up the constraints for the tab host
        tabHost.top.equalTo(tabView.bottom).isActive = YES;
        tabHost.leading.equalTo(this.view.leading).isActive = YES;
        tabHost.trailing.equalTo(this.view.trailing).isActive = YES;
        tabHost.bottom.equalTo(this.view.bottom).isActive = YES;

        for (const tab of this._tabs) {
            // Create a collection view for each tab that will display its contents
            const collectionView = BMCollectionView.collectionView();
            tabHost.addSubview(collectionView);

            this._configureCollectionViewLayout(collectionView);

            collectionView.leading.equalTo(tabHost.leading).isActive = true;
            collectionView.trailing.equalTo(tabHost.trailing).isActive = true;
            collectionView.top.equalTo(tabHost.top).isActive = true;
            collectionView.bottom.equalTo(tabHost.bottom).isActive = true;

            tab._collectionView = collectionView;
            collectionView._settingsTab = tab;

            // Default to showing the current tab, hiding all other content
            if (tab != this._currentTab) {
                collectionView.isVisible = NO;
            }

            // Create the clickable tabs
            const tabNode = document.createElement('img');
            tabNode.className = 'BMLayoutEditorDetailsTab';
            tabNode.src = tab.icon;
            tabView.contentNode.appendChild(tabNode);

            // Default to showing the current tab
            if (tab == this._currentTab) {
                tabNode.classList.add('BMLayoutEditorDetailsTabSelected');
            }

            tab._tabNode = tabNode;

            // Switch between the tabs on click
            tabNode.addEventListener('click', event => {
                if (tabNode == this._currentTab) return;
                // Deselect the current tab
                this._currentTab._collectionView.isVisible = NO;
                this._currentTab._tabNode.classList.remove('BMLayoutEditorDetailsTabSelected');
                // Then select the new one
                this._currentTab = tab;
                collectionView.isVisible = YES;
                tabNode.classList.add('BMLayoutEditorDetailsTabSelected');
            });
        }
    },

    // @override - BMLayoutEditorSettingsPanel
    settingsPanelDidLayoutView() {
        for (const tab of this._tabs) {
            tab.collectionView = tab._collectionView;
        }
    },

    // @override - BMLayoutEditorSettingsPanel
    settingsPanelWillUnload() {
        for (const tab of this._tabs) {
            tab._collectionView.release();
            tab._collectionView = undefined;
        }
    },

    // @override - BMLayoutEditorSettingsPanel
    layoutEditorDidSelectSizeClass(sizeClass) {
        for (const tab of this._tabs) {
            tab.layoutEditorDidSelectSizeClass(sizeClass);
        }
    }
});

// @endtype

// @type BMLayoutEditorSettingsTab implements BMCollectionViewDataSet, BMCollectionViewDelegate

/**
 * A settings tab represents a page of settings for the layout editor.
 */
export function BMLayoutEditorSettingsTab() {} // <constructor>

BMLayoutEditorSettingsTab.prototype = {

    /**
     * The name of the tab.
     */
    name: undefined, // <String>

    /**
     * The URL pointing to an icon that represents this tab.
     */
    icon: undefined, // <String>

    /**
     * The constraint to which this tab applies.
     */
    _constraint: undefined, // <BMLayoutConstraint, nullable>
    get constraint() {
        return this._constraint;
    },

    /**
     * The view to which this tab applies.
     */
    _view: undefined, // <BMView, nullable>
    get view() {
        return this._view;
    },

    /**
     * An array of sections making up this settings tab.
     */
    _settingSections: undefined, // <[BMLayoutEditorSettingsSection]>

    /**
     * The array of setting sections making up this settings tab.
     * This also includes settings created for variations.
     */
    _compiledSettingSections: undefined, // <[BMLayoutEditorSettingsSection]>

    /**
     * The collection view managed by this settings tab, which displays
     * the actual content.
     */
    _collectionView: undefined, // <BMCollectionView, nullable>

    get collectionView() {
        return this._collectionView;
    },
    set collectionView(view) {
        this._compiledSettingSections.length = 0;

        // Compile the settings when first being assigned a collection view, as the layout editor
        // will not have been available the first time `commitUpdates` was invoked
        for (const section of this._settingSections) {
            this._compiledSettingSections.push(section._compiledSectionForSizeClass(this.layoutEditor.activeSizeClass));
        }

        this._collectionView = view;
        view.dataSet = this;
        view.delegate = this;
    },

    /**
     * The settings panel to which this tab was added.
     */
    _settingsPanel: undefined, // <_BMLayoutEditorSettingsPanel, nullable>

    /**
     * The layout editor to which this tab was added.
     */
    get layoutEditor() { // <BMLayoutEditor, nullable>
        if (this._settingsPanel) {
            return this._settingsPanel.layoutEditor;
        }
    },

    /**
     * Initializes this tab with the given name and icon.
     * @param name <String>                     The name of the tab.
     * {
     *  @param icon <String>                    The URL of the icon representing this tab.
     * }
     * @return <BMLayoutEditorSettingsTab>      This settings tab.
     */
    initWithName(name, {icon}) {
        this.name = name;
        this.icon = icon;
        this._settingSections = [];
        this._compiledSettingSections = [];

        return this;
    },

    /**
     * Should be invoked to cause this tab to reload its settings whenever a setting is added or removed.
     */
    updateSettings() {
        this.beginUpdates();
        this._settingsPanel._updateSettingsForTab(this);
        this.commitUpdates();
    },

    // @override - BMCollectionViewDataSet
    numberOfSections() {
        return this._compiledSettingSections.length;
    },

    // @override - BMCollectionViewDataSet
    numberOfObjectsInSectionAtIndex(index) {
        return this._compiledSettingSections[index]._settings.length + (this._compiledSettingSections[index].name ? 1 : 0);
    },

    // @override - BMCollectionViewDataSet
    indexPathForObjectAtRow(row, {inSectionAtIndex: section}) {
        if (this._compiledSettingSections[section].name) {
            if (row == 0) {
                return BMIndexPathMakeWithRow(row, {section, forObject: this._compiledSettingSections[section]._nameSetting});
            }
            return BMIndexPathMakeWithRow(row, {section, forObject: this._compiledSettingSections[section]._settings[row - 1]});
        }
        return BMIndexPathMakeWithRow(row, {section, forObject: this._compiledSettingSections[section]._settings[row]});
    },

    // @override - BMCollectionViewDataSet
    indexPathForObject(object) {
        for (const [sectionIndex, section] of this._compiledSettingSections.entries()) {
            for (const [settingIndex, setting] of section._settings.entries()) {
                if (setting == section._nameSetting) {
                    return BMIndexPathMakeWithRow(0, {section: sectionIndex, forObject: object});
                }
                if (setting.isEqualToSetting(object)) {
                    if (section.name) {
                        return BMIndexPathMakeWithRow(settingIndex + 1, {section: sectionIndex, forObject: object});
                    }
                    return BMIndexPathMakeWithRow(settingIndex, {section: sectionIndex, forObject: object});
                }
            }
        }
    },

    // @override - BMCollectionViewDataSet
    cellForItemAtIndexPath(indexPath) {
        const cell = this._collectionView.dequeueCellForReuseIdentifier(indexPath.object.kind);
        cell.node.classList.add('BMLayoutEditorDetailsCell');
        cell._tab = this;
        cell.setting = indexPath.object;
        return cell;
    },

    // @override - BMCollectionViewDataSet
    cellForSupplementaryViewWithIdentifier(identifier, {atIndexPath: indexPath}) {
        const cell = this._collectionView.dequeueCellForSupplementaryViewWithIdentifier(identifier);
        cell._tab = this;
        cell.section = this._compiledSettingSections[indexPath.section];
        return cell;
    },

    // @override - BMCollectionViewDataSet
    useOldData(use) {
        if (!this._oldData) {
            throw new Error('[BMLayoutEditorSettingsTab] Illegal state - Data update performed outside of a transaction.');
        }

        this._compiledSettingSections = use ? this._oldData : this._newData;
    },

    // @override - BMCollectionViewDataSet
    isUsingOldData() {
        if (!this._oldData) {
            throw new Error('[BMLayoutEditorSettingsTab] Illegal state - Data update performed outside of a transaction.');
        }
        return this._compiledSettingSections === this._oldData;
    },

    /**
     * This method must be invoked whenever the settings available in this tab are modified.
     * After this method is invoked, the settings sections and their contents can be modified freely.
     * 
     * After the changes have been performed, it is required to invoke the `commitUpdates()` method to
     * actually update the display.
     */
    beginUpdates() {
        if (!this._collectionView) return;

        this._oldData = this._compiledSettingSections.map(s => BMLayoutEditorSettingsSection.sectionWithSection(s));
        this._compiledSettingSections = [];
        this._newData = this._compiledSettingSections;
    },

    /**
     * This method must be invoked after every call to `beginUpdates()` to commit the changes that were pending.
     * @return <Promise<void>>      A promise that resolves when this operation completes.
     */
    async commitUpdates() {
        if (!this.layoutEditor) return;

        if (!this._collectionView) return;

        for (const section of this._settingSections) {
            this._compiledSettingSections.push(section._compiledSectionForSizeClass(this.layoutEditor.activeSizeClass));
        }

        // Await for any current data update
        while (this._collectionView.isUpdatingData) {
            await this._collectionView._dataUpdatePromise;
        }

        const promise = this._collectionView.updateEntireDataAnimated(YES);
        this._oldData = undefined;
        this._compiledSettingSections = this._newData;
        this._newData = undefined;
        await promise;
    },

    /**
     * Invoked upon the layout editor selecting a different size class.
     * Causes this tab to create additional settings for those settings that support variations
     * and have their `automaticallyExpandsVariations` property set to `YES`.
     * @param sizeClass <BMLayoutSizeClass, nullable>       The newly selected size class, or `undefined` if `All Size Classes` was selected.
     */
    layoutEditorDidSelectSizeClass(sizeClass) {
        for (const section of this._settingSections) {
            for (const setting of section._settings) {
                if (setting.variations && setting.automaticallyExpandsVariations) {
                    this.beginUpdates();
                    this.commitUpdates();
                    return;
                }
            }
        }
    }
}

/**
 * Constructs and returns a settings tab with the given name and icon.
 * @param name <String>                     The name of the tab.
 * {
 *  @param icon <String>                    The URL of the icon representing this tab.
 * }
 * @return <BMLayoutEditorSettingsTab>      A settings tab.
 */
BMLayoutEditorSettingsTab.tabWithName = function (name, {icon}) {
    return (new BMLayoutEditorSettingsTab).initWithName(name, {icon});
}

// @endtype

// @type BMLayoutEditorSettingsSection

export function BMLayoutEditorSettingsSection() {} // <constructor>

BMLayoutEditorSettingsSection.prototype = {
    /**
     * The name of this settings section. If omitted, this section
     * will not show a name in the UI.
     */
    _name: undefined, // <String, nullable>

    get name() {
        return this._name;
    },
    set name(name) {
        this._name = name;
        if (name) {
            this._nameSetting = BMLayoutEditorSetting.settingWithName(name, {kind: BMLayoutEditorSettingKind.Title, target: this});
            this._nameSetting._section = this;
        }
        else {

        }
    },

    /**
     * Controls whether this section can be collapsed and expanded.
     */
    collapsible: NO, // <Boolean>

    /**
     * Controls whether this section is collapsed.
     */
    _collapsed: NO, // <Boolean>
    
    get isCollapsed() {
        return this._collapsed;
    },
    set isCollapsed(collapsed) {
        if (this._tab) {
            if (collapsed) {
                this.collapse();
            }
            else {
                this.expand();
            }
        }
        this._collapsed = collapsed;
    },

    /**
     * An array of settings belonging to this section.
     */
    _settings: undefined, // <[BMLayoutEditorSetting]>
    get settings() {
        return this._settings.slice();
    },
    set settings(settings) {
        this._settings = settings.slice();
    },

    /**
     * Returns a copy of this section that contains additional settings for all defined and
     * automatically expanding variations.
     * @param sizeClass <BMLayoutSizeClass>         The size class for which this section should be compiled.
     * @return <BMLayoutEditorSettingsSection>      A settings section.
     */
    _compiledSectionForSizeClass(sizeClass) {
        const section = BMLayoutEditorSettingsSection.section();

        section._name = this._name;
        section._nameSetting = this._nameSetting;
        section.collapsible = section.collapsible;
        section._settings = [];

        for (const setting of this._settings) {
            section._settings.push(setting);
            // If the setting supports variations, create additional associated settings for each defined variation
            if (setting.variations) {
                for (const key in setting.target._variations) {
                    const variation = setting.target._variations[key];
                    // When the setting supports automatically expanding variations, skip the current variation as a setting will be created for it regardless of whether
                    // it had been previously defined or not
                    if (variation.sizeClass == sizeClass && setting.automaticallyExpandsVariations) continue;
                    
                    // If this variation contains the target property, create a setting for it
                    if (setting.property in variation) {
                        const variationSetting = BMLayoutEditorSetting.settingWithName(setting.name, {kind: setting.kind, target: setting.target, variations: NO, nullable: setting.nullable, property: setting.property});
                        variationSetting._sizeClass = variation.sizeClass;
                        variationSetting._associatedSetting = setting;
                        section._settings.push(variationSetting);
                    }
                }

                // If the setting automatically expands variations, create setting for the current size class
                if (setting.automaticallyExpandsVariations && sizeClass) {
                    const variationSetting = BMLayoutEditorSetting.settingWithName(setting.name, {kind: setting.kind, target: setting.target, variations: NO, nullable: YES, property: setting.property});
                    variationSetting._sizeClass = sizeClass;
                    variationSetting._associatedSetting = setting;
                    section._settings.push(variationSetting);
                }
            }
        }

        return section;
    }
}

/**
 * Constructs and returns a settings section.
 * @return <BMLayoutEditorSettingsSection>      A section.
 */
BMLayoutEditorSettingsSection.section = function () {
    const section = new BMLayoutEditorSettingsSection;

    section._settings = [];

    return section;
}

/**
 * Constructs and returns a section by copying the contents of the given section.
 */
BMLayoutEditorSettingsSection.sectionWithSection = function (section) {
    const newSection = new BMLayoutEditorSettingsSection;

    newSection.name = section.name;
    newSection.collapsible = section.collapsible;
    newSection._settings = section._settings.slice();

    return newSection;
}

// @endtype


// @type BMLayoutEditorSettingKind

/**
 * Constants representing the various kinds of settings that can be used by layout editor settings. These constants refer to the setting
 * kinds available, but custom setting kinds can be used by specifying a custom identifier string when creating a setting and registering 
 * a setting cell class with the same name. Note that underscore prefixed identifiers are reserved by CoreUI.
 */
export var BMLayoutEditorSettingKind = Object.freeze({ // <enum>
	
	/**
	 * A string setting kind.
	 */
	String: '_String', // <enum>
	
	/**
	 * An integer setting kind.
	 */
	Integer: '_Integer', // <enum>
	
	/**
	 * A number setting kind.
	 */
	Number: '_Number', // <enum>
	
	/**
	 * A boolean setting kind.
	 */
	Boolean: '_Boolean', // <enum>
	
	/**
	 * A setting kind representing the possible values for a constraint constant.
	 */
	Constant: '_Constant', // <enum>
	
	/**
	 * A setting kind representing a constraint.
	 */
	Constraint: '_Constraint', // <enum>
	
	/**
	 * A setting kind representing a clickable link to a view.
	 */
	View: '_View', // <enum>
	
	/**
	 * A setting kind representing a list of possible options that is a presented as a dropdown menu.
	 */
    Enum: '_Enum', // <enum>
    
    /**
     * A setting kind representing a list of possible options that is presented as a segmented control.
     */
    Segment: '_Segment', // <enum>
    
    /**
     * A setting kind that represents a non-editable string.
     */
    Info: '_Info', // <enum>

    /**
     * A setting kind that represents a non-editable section title.
     */
    Title: '_Title', // <enum>

    /**
     * A setting kind that represents an insets object.
     */
    Insets: '_Insets', // <enum>
    
    /**
     * A setting kind that represents the deactivate constraint button.
     */
    DeactivateConstraintsButton: '_DeactivateConstraintsButton', // <enum>
    
    /**
     * A setting kind that represents the delete constraint button.
     */
    DeleteConstraintButton: '_DeleteConstraintButton', // <enum>

});

// @endtype

// @type BMLayoutEditorSetting

/**
 * Represents a setting that can be displayed and modified in the layout editor.
 */
export function BMLayoutEditorSetting() {} // <constructor>

BMLayoutEditorSetting.prototype = {

    /**
     * The name of this setting.
     */
    name: undefined, // <String>

    /**
     * The data kind.
     */
    kind: BMLayoutEditorSettingKind.String, // <BMLayoutEditorSettingKind or String>

    /**
     * Should be set to `YES` for settings that support null values.
     * Note that some data kinds such as `String` cannot be set to null through the editor.
     */
    nullable: NO, // <Boolean>

    /**
     * Should be set to `YES` for settings that support variations.
     */
    variations: NO, // <Boolean>

    /**
     * When set to `YES`, selecting a size class within the layout editor will cause a variation setting to be 
     * automatically generated for this setting.
     */
    automaticallyExpandsVariations: NO, // <Boolean>

    /**
     * When the base setting supports variations and this setting represents a variation of it,
     * this property indicates the size class to which the variation applies.
     */
    _sizeClass: undefined, // <BMLayoutSizeClass, nullable>

    get sizeClass() {
        return this._sizeClass;
    },

    /**
     * When the base setting supports variations and this setting represents a variation of it,
     * this property indicates the base setting from which this setting was generated.
     */
    _associatedProperty: undefined, // <BMLayoutEditorSetting, nullable>

    get associatedProperty() {
        return this._associatedProperty;
    },

    /**
     * The object that represents the target of this setting.
     */
    target: undefined, // <AnyObject>

    /**
     * The property that this setting manages. The value of this property
     * will be passed to the target object whenever the value of this setting changes.
     */
    property: undefined, // <String, nullable>

    /**
     * Initializes this setting with the given name, data kind and target object.
     * @param name <String>                                 The name of the setting.
     * {
     *  @param kind <BMLayoutEditorSettingKind or String>   The data kind.
     *  @param target <AnyObject>                           The target object of the setting.
     *  @param variations <Boolean, nullable>               Defaults to `NO`. Controls whether this setting supports variations.
     *  @param nullable <Boolean, nullable>                 Defaults to `NO`. Controls whether this setting supports null value.
     *  @param property <String, nullable>                  If specified, this represents the property on the target object which is controlled by this
     *                                                      setting. This value is not directly by the layout editor but can be used by the target object.
     * }
     * @return <BMLayoutEditorSetting>          This setting.
     */
    initWithName(name, {kind, target, variations = NO, nullable = NO, property = undefined}) {
        this.name = name;
        this.kind = kind;
        this.target = target;

        this.variations = variations;
        this.nullable = nullable;
        if (property !== undefined) this.property = property;

        return this;
    },

    /**
     * Tests whether this setting and the given setting are equivalent.
     * Two settings are equivalent if they have the same name, target object, target property and size class.
     * @param setting <BMLayoutEditorSetting>       The setting to test against.
     * @return <Boolean>                            `YES` if the settings are equivalent, `NO` otherwise.
     */
    isEqualToSetting(setting) {
        const result = setting.name == this.name && setting.target == this.target && setting._sizeClass == this._sizeClass && setting.property == this.property;
        return result;
    }
}

/**
 * Constructs and returns a setting with the given name, data kind and target object.
 * @param name <String>                     The name of the setting.
 * {
 *  @param kind <BMLayoutEditorSettingKind>    The data kind.
 *  @param target <AnyObject>               The target object of the setting.
 *  @param variations <Boolean, nullable>   Defaults to `NO`. Controls whether this setting supports variations.
 *  @param nullable <Boolean, nullable>     Defaults to `NO`. Controls whether this setting supports null value.
 *  @param property <String, nullable>      If specified, this represents the property on the target object which is controlled by this
 *                                          setting. This value is not directly by the layout editor but can be used by the target object.
 * }
 * @return <BMLayoutEditorSetting>          A setting.
 */
BMLayoutEditorSetting.settingWithName = function (name, {kind, target, variations = NO, nullable = NO, property = undefined}) {
    return (new this).initWithName(name, {kind, target, variations, nullable, property});
}

// @endtype

// @type BMLayoutEditorEnumSetting

/**
 * Represents a setting that can be displayed and modified in the layout editor.
 * This setting also specifies a number of possible options via the `options` property.
 * 
 * Settings created with this class must have their `kind` property set to `.Enum` or `.Segment`.
 */
export function BMLayoutEditorEnumSetting() {} // <constructor>

BMLayoutEditorEnumSetting.prototype = BMExtend(Object.create(BMLayoutEditorSetting.prototype), {
    
    /**
     * An array of menu items that define which options are available for this setting.
     * 
     * The `userInfo` property of these menu items must be set to the value of the property that each item
     * represents.
     * 
     * The `action` property of these objects will be ignored.
     */
    options: undefined, // <[BMMenuItem]>

    initWithName(name, args) {
        BMLayoutEditorSetting.prototype.initWithName.apply(this, arguments);

        this.options = [];

        return this;
    }
});

BMLayoutEditorEnumSetting.settingWithName = BMLayoutEditorSetting.settingWithName;

// @endtype BMLayoutEditorEnumSetting
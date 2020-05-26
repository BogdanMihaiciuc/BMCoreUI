# 2.6 Beta 6

## BMAnimationContext

Resolved an issue that caused certain animations to immediately skip to the end when using web animations.

## BMMenu

A new `CSSClass` property can be set on menu objects and can be used to add additional CSS classes to the menu DOM node.

Menu items beginning with at least 3 dashes will now be added as separators. Previous betas required items to have exactly 3 dashes.

## BMWindow

Resolved an issue with the blur effect on windows being cut off in recent versions of Safari.

## BMViewLayoutEditor

Added the missing icons for center x and center y constraint types.

# 2.6 Beta 5

## BMLayoutEditor

The new editor layout is no longer accessible by setting the global `BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW` flag. Instead, a new `BMViewLayoutEditor` subclass of `BMLayoutEditor` should be created and used instead. This allows both the old layout and the new one to coexist in the same project.

# 2.6 Beta 4

## BMWindow

Modal windows will now use a z index based on the value of `BM_WINDOW_Z_INDEX_MAX`.

## BMLayoutEditor

Whenever the constraint inspector panel appears, the appropriate constant field will now be focused by default.

Resolved an issue that could allow the editor inspector to be shrunk below an acceptable size.

## BMMonacoCodeEditor

The monaco code editor will now set the tsc `alwaysStrict` flag to `false`.

# 2.6 Beta 3

## BMCollectionView

Resolves an issue when transferring items that caused transferred items to lose their properties that had undefined values.

## BMLayoutEditor

Creating a new constraint or selecting one via a keyboard shortcut while the inspector is hidden will now correctly bring up the constant editor for that constraint.

# 2.6 Beta 2

## BMAnimationContext

Resolved an issue that caused custom bezier easings to not work when using web animations.

## BMLayoutConstraint

Resolved an issue that could trigger an unsolvable layout error to occur when changing the constant of a constraint.

## BMView

When a view is removed while it had a pending layout pass, it is now removed from its layout queue.

When adding or removing subviews in a hierarchy, the size classes are now correctly invalidated on the root view.

## BMWindow

When a window is released, its node is now removed from the document.

View hierarchies whose root view is a `BMWindow` will now use the window's size as the viewport.

Resolved an issue that caused some windows in full screen mode to be able to move or resize.

Resolved an issue that caused full screen windows to not adapt to browser size changes.

## BMWindowDelegate

The following methods can now be implemented by window delegates:
 * `windowShouldResize(_, _)`: Invoked to determine if a window can be resized.
 * `windowShouldMove(_, _)`: Invoked to determine if a window can be moved.
 * `windowDidMove(_, _)`: Invoked whenever a window is moved.

## BMPopover

A new `BMPopover` subclass of `BMWindow` is now available for use. It represents a modal window that is visually linked to an element or point on the document. The anchor element or point can be set on it via the `anchorNode` or `anchorPoint` properties.

## BMLayoutEditor

Resolved an issue that caused entries in the view hierarchy window to be cut off.

Resolved an issue with numeric setting cells that caused values to be assigned as strings instead of numbers.

## BMTextField

Resolved a display issue when the text field had a very large number of items. Additionaly, the suggestions dropdown will now only display the first 10 entries.

# 2.6

## General Changes

A new `BMStringByCapitalizingString(_)` function is now available that returns a copy of the given string with the first character uppercased.

The `BMAddSmoothMousewheelInteractionToNode()` method will now forward the modifier key properties from the original event when generating smooth scroll events.

## BMKeyboardShortcutModifier

A new `BMKeyboardShortcutModifier` enum contains the modifier keys that can be used when registering keyboard shortcuts.

## BMPoint

Two new `multiplyWithScalar(_)` and `pointByMultiplyingWithScalar(_)` methods can be used to multiply all of a point's components with a given scalar.

## BMRect

Two new `multiplyWithScalar(_)` and `rectByMultiplyingWithScalar(_)` methods can be used to multiply all of a rect's components with a given scalar.

## BMJQueryShim

When **jQuery** is available, the factory method for this class will now return an equivalent jQuery object. In Thingworx, this change will allow the built-in `Collection` widget to work with this version of CoreUI.

## BMView

The `release` method can now be safely invoked on views that have superviews; it will now recursively invoke the `release` method on all of the view's descendants.

## BMTextField

`BMTextField` is a new subclass of view that encapsulates some of the functionality that was previously used by the layout editor in relation to input elements. The layout editor now uses this class for such cases and it is now available for use in other situations as well. The primary objective of the text field class in this release is to add support for suggestions and autocompleting text to input elements. This works in conjunction with a `BMTextFieldDelegate` object that supplies the suggestions to be used and can further customize the situations in which those suggestions are used or displayed.

## BMLayoutConstraint

A new `descriptionRelativeToView(_)` method can now be invoked to obtain a string description of the constraint that is relative to the given view.

## BMMenu

When opened towards the right side of the page, if the menu doesn't fit to the right of the event source point, it will now open towards the left.

## BMCollectionViewFlowLayout

Resolved a crash that could occur in certain situations when using footers and automatic cell sizes.

Resolved a crash that could occur in certain situations when using automatic cell sizes.

Resolved an issue that would cause the `End` gravity to behave the same as `Start`.

The `Expand` constant can now be used for the `contentGravity` property and will expand the rows along the primary scrolling axis to take up the entire available space. The sizes of supplementary views and spacing will be kept constant.

Resolved an issue that could cause the content width to add the size of the `bottomSpacing` property to the right of the content when using horizontal orientation.

## BMCollectionView

A new static `collectionView()` method can be used to create a new collection view and a `DOMNode` for it.

A new `measureSizesOfCellsAtIndexPaths(_)` method can be used to measure several cells in bulk. When measuring multiple cells, this can be faster than individually measuring each cell, as the measurements will happen on the same layout queue to reduce the amount of layout thrashing. Note that in order to be measured, new cells have to be created, so this method should not be used with a very large amount of cells.

When assigned a data set while invisible or while part of a view hierarchy but before obtaining a valid frame, collection view will now delay initialization until becoming visible and having been assigned a valid frame.

When measuring cells, the measurement operation will now run in a separate layout queue.

Resolved an issue that would cause cells to improperly lose their layout attributes during measurement if they had an exact retain count of 1.

Resolved an issue that would cause the `scrollBarSize` property to return an incorrect value during the initial layout pass when `iScroll` was used.

## BMCollectionViewCell

A new `invalidate` method can now be overriden on collection view cells. This method is invoked prior to the cell being permanently removed and can be used by subclasses to perform any final cleanup they might need.

## BMWindow

A new `toggleAnimated(_, {completionHandler})` method is now available. If the window is visible, it will invoke `dismissAnimated`; otherwise it will invoke `bringToFrontAnimated`.

Preliminary support for keyboard shortcuts. The `registerKeyboardShortcut(_)` method can now be invoked by passing in a `BMKeyboardShortcut` object to set up a keyboard shortcut for the window. The `unregisterKeyboardShortcut(_)` method can be used to remove a previously registered keyboard shortcut.

Window will no longer perform layout operations while it is invisible. All pending layout passes will be condensed into a single layout pass that occurs as soon as the window becomes visible.

## BMKeyboardShortcut

This new class can be used to define keyboard shortcuts and the actions that should be taken when the shortcut is triggered. An instance of this class can be obtained by invoking the static `keyboardShortcutWithKey` method.

## BMToolWindow

This class is now exported.

A new `opensAutomatically` property can be now set on tool windows, with a default value of `YES`. When this property is set to `NO` the tool window will no longer open automatically when its owning window is opened.

## BMMenuItem

A new `userInfo` property can now be set on menu items. It can be used to add additional information to the item. This object has no specific type and is not directly used by CoreUI, but can be used by custom implementations to attach arbitrary data to the item.

## BMLayoutEditor

It is now possible to freely pan the edited view hierarchy using the touchpad, mousewheel, clicking and dragging while holding the ⌥ key or by dragging with two fingers on touch devices.

It is now possible to zoom the edited view hierarchy by using the mousewheel or touchpad scrolling while holding the ⌥ key or by pinch zooming on touch devices. 
There is also a slider control and precise zoom input box available in the toolbar to control the zoom level.

Constraints are now drawn in such a way that whenever possible they will touch the edges of the affected views instead of defaulting to originate from the center of the selected view.

A new **Reset** button is now available in the toolbar that can be used to reset the zoom level and pan position.

The height of the toolbar and the various settings controls has been reduced.

The following keyboard shortcuts are now available when a view is selected:
 * `⌘←`: Selects the first active constraint that affects the view's `Leading` or `Left` attribute. If such a constraint isn't available but the view has a constraints that affect its `Width` and `Trailing` or `Right` attributes, the `Width` constraint will be selected. If no such constraints are available, an appropriate `Leading` or `Width` constraint is created and selected.
 * `⌘↑`: Selects the first active constraint that affects the view's `Top` attribute. If such a constraint isn't available but the view has a constraints that affect its `Height` and `Bottom` attributes, the `Height` constraint will be selected. If no such constraints are available, an appropriate `Top` constraint is created and selected.
 * `⌘→`: Selects the first active constraint that affects the view's `Trailing`, `Right` or `Width` attribute. If no such constraint is available, an appropriate `Trailing` or `Width` constraint is created.
 * `⌘↓`: Selects the first active constraint that affects the view's `Bottom` or `Height` attribute. If no such constraint is available, an appropriate `Bottom` or `Height` constraint is created.
 * `⌘⌥C`: Creates missing constraints for the selected view.
In all of the above cases, if a size class is selected, the newly created constraints will only be activated for the given size class.

The following keyboard shortcuts are now available when a constraint is selected:
 * `⌫`: Toggles activation of the constraint for the current size class.
 * `⌘⌫`: Deletes the constraint.
 * `⌘⌥-`: Sets the constraint equality sign to less than or equal to.
 * `⌘⌥=`: Sets the constraint equality sign to greater than or equal to.
 * `⌘⌥0`: Sets the constraint equality sign to equal to.

The manner in which custom settings can be added and the structure and organization of the settings panel has changed. In this release, the change is opt-in and the previous method is still available and enabled by default.
The new method can be enabled by setting the global `BM_LAYOUT_EDITOR_USE_SETTINGS_VIEW` flag to `YES`. In addition to the changes above, when enabling the settings view, the layout editor will also have the following changes:
 * The navigation tree is now hidden by default and no longer appears as a sidebar. It now appears as an inspector window that can be moved and resized.
 * The settings sidebar is now hidden by default and no longer appears as a sidebar. It now appears as an inspector window that can be moved and resied. Whenever the settings inspector is dismissed, double clicking a view will cause it to reappear.

When a view doesn't expose an intrinsic size, the compression and expansion resistance settings will no longer be displayed by the layout editor.

When using the settings view, it is no longer required to subclass the layout editor to enable custom settings. The settings are now organized in:
 * The settings view is the root of the settings inspector and contains one or several *settings panels*. Only one settings panel can be visible at any time and CoreUI manages creating and destroying these panels.
 * A settings panel can contain one or more tabs. Tabs are represented by `BMLayoutEditorSettingsTab` objects.
 * Each tab contains one or more *sections*, represented by the `BMLayoutEditorSettingsSection` class, each containing several *setting* objects, represented by the `BMLayoutEditorSetting` class.

When setting panels are created, during initialization and at several points throughout their lifecycle, CoreUI will invoke one of the following methods on the editor's delegate, depending on what kind of item is selected:
 * `layoutEditorAdditionalSettingTabsForView(_, _)` can be used to add additional setting tabs that are visible when views are selected.
 * `layoutEditorAdditionalSettingTabsForConstraint(_, _)` can be used to add additional setting tabs that are visible when constraints are selected.

View subclasses can also implement the `additionalSettingTabsForLayoutEditor(_)` method to supply their own specific settings regardless of the delegate object.

After the tabs are created and whenever they are updated, for each tab, CoreUI will invoke the following method on the editor's delegate:
 * `layoutEditorAdditionalSettingSectionsForTab(_, _)` can be used to add additional settings to a tab. This includes the custom tabs created previously, which normally have no settings of their own.

Similarly, view subclasses can implement the `additionalSettingSectionsForTab(_, {layoutEditor})` to add their own specific settings.

## BMMenu

Resolved an issue that caused the backdrop filter used by this element to not be applied properly.

# 2.5.3

Resolved an incompatibility issue with Thingworx 8.5.

# 2.5.2

## General Changes

Resolved an issue with the Thingworx extension that could cause CoreUI to crash upon loading. This issue would occur when the environment had a module loader available. This would cause `kiwi` to expose itself as a module in one of those systems instead of globally as the CoreUI extension expected. CoreUI will now explicitly disable modules for kiwi in such environments.

Resolved an issue that caused certain async methods to be excluded from the TypeScript definitions.

## BMAnimationContext

When web animations are enabled, array easings are now converted into cubic bezier easings.

## BMMenu

A new `openFromNode` method is now available. It opens the menu from the given DOM node and visually highlights it.

A new `iconSize` property can be set on the menu. It controls the size of the menu item icons.

When specified on menu items, the menu will now also display icons.

# 2.5.1

## BMView

Changes to `contentInsets`, `visibility` and `CSSClass` will now correctly automatically invalidate the view's intrinsic size, if the view supports intrinsic sizes.

## BMScrollContentView

This class no longer uses its own implementation for the `frame` setter.

## BMCollectionView

Resolved an issue that caused interactive movement to only start the first time per cell instance on touch devices.

# 2.5

CoreUI 2.5 focuses on improving on the foundation laid out by CoreUI 2.0 and expanding the role of View while also fixing many of its issues and quirks from the previous version. In 2.0, the `BMView` class was introduced as a new API that was completely separate from everything else. In this release, `BMWindow`, `BMCollectionView` and `BMCollectionViewCell` now all inherit from `BMView` and make use of its functionality in different ways - for example Collection View can now use layout constraints to automatically determine appropriate sizes for cells and windows can now be opened in non-modal mode where they can be dragged around and resized.

## General Changes

Core UI is now built using a gulp script instead of the previous gradle build script, allowing modern javascript tools to be integrated with the build system.

The various parts of CoreUI can now be imported as modules in Javascript or TypeScript projects. When used outside of Thingworx, CoreUI can now also be added to a project via npm:
```sh
npm install bm-core-ui
```

Whenever using smooth wheel scrolling, additional scrolls will now also introduce additional friction.

The timing of various implicit animations has changed slightly, which should make the affected animations feel more responsive.

On macOS Mojave, various CoreUI elements, including `BMLayoutEditor` support dark mode.

Upgraded the version of `kiwi.js` used to `1.1.0`.

Most classes that support copying now also include a copy initializer to make it easy for subclasses to implement their copy methods on top of the base class method.

## TypeScript

Improved the formatting of the definitions file and resolved several issues including:
 - empty parameters for callback types
 - missing return types for various functions
 - optional first parameters but required parameters object

Added the missing interface definitions for `BMWindowDelegate` and `BMCodeEditorDelegate`.

`BMHook()` is now correctly marked as working with `DOMNode` objects in addition to jQuery elements.

The generation of the definitions file is now part of the build system to ensure it is always up to date.

Classes that CoreUI depends upon are now declared as empty interfaces instead of classes to prevent conflicts when the correct definitions are included for those classes.

`BMIndexPath`, `BMCollectionViewDataSet` and `BMCollectionView` are now generic types.

## BMSize

The `toString` method of `BMPoint` and `BMSize` now returns a customized string.

Two new `isGreaterThanSize(_)` and `isLessThanSize(_)` methods can now be used to compare two sizes.

This type now includes a copy initializer.

## BMPoint

The `toString` method of `BMPoint` and `BMSize` now returns a customized string.

Two new `r` and `t` number properties allow working with points in polar coordinates. Note that internally, points are still represented in cartesian coordinates and accessing or setting the polar coordinates will always trigger a calculation based on the point's cartesian coordinates.

The new `BMPointMakeWithRadius(_, {angle})` function and the static `pointWithRadius(_, {angle})` method can be used to construct points from polar coordinates.

This type now includes a copy initializer.

## BMRect

A new `rectByUnionWithRect(_)` method is now available and returns a new rect that represents the union between two rects.

A new `initWithRect(_)` copy initializer is now available.

## BMIndexPath

A new `initWithIndexPath(_)` copy initializer is now available.

## BMAnimationContext

If an animation context is started by an event handler while the shift key is pressed, the resulting animation will run in slow-motion.

A new `BMAnimationContextBeginStatic()` function can be invoked to create an animation context in which animatable properties will not be animated. While a static animation context is active, `BMAnimationContextGetCurrent()` returns `undefined`. To clear the static animation context, `BMAnimationApply()` or `BMAnimationApplyBlocking(_)` must be invoked. Static animation contexts can be used to temporarily disable implicit animations while an animation context is already active.

A new `BMAnimationContextAddCompletionHandler(_)` function can now be used to attach a handler that will be executed when the current animation context finshes its animation. If there is no current animation context or if the current animation context is static, the handler will be executed synchronously before the function returns.

When using the `@BMAnimatable` and `@BMAnimatableNumber` decorators on a class that doesn't have the `node` property, the animation will be registered on the body element as a fallback.

When using `@BMAnimatableNumber` to animate a numeric property whose initial value is `undefined` or `NaN`, the animation will use `0` as an initial value.

Resolved an issue with `@BMAnimatableNumber` that would incorrectly attempt to use the `copy()` method on the initial value, leading to a crash.

### Web Animations

This release includes preliminary support for the Web Animations API. In this version, web animations are disabled by default but can be enabled by setting the global flag `BM_USE_WEB_ANIMATIONS` to `true`. When this flag is enabled, whenever possible, animation contexts will now use the Web Animations API in place of Velocity.js; depending on how the animation is set up, CoreUI may split the animation into web animations-compatible animations and animations that require Velocity.js. In those cases, the two types of animations may have slightly different timings as each type of animation is handled independently by its engine. Regardless of whether web animations are enabled or not, the syntax for using animations in CoreUI remains the same.

A new `BMAnimationContextEnableWebAnimations()` global method is now available to selectively activate the web animation engine for specific animations. When this function is invoked while an animation context is active, the animation created by that context will attempt to use web animations. In general, animations that modify hardware accelerated properties such as `transform` and `opacity` tend to run better with web animations than with Velocity. By contrast, animations that modify other properties, especially those affect flow such as `left`, `top`, `width` and `height` tend to run better with Velocity. The animation will nevertheless still fall back to Velocity if the environment does not support web animations. Whenever the environment fails to start the requested animation, it will be set up as a legacy Velocity.js call and all subsequent animations will run in legacy mode regardless of whether `BM_USE_WEB_ANIMATIONS` is set to `true` or `BMAnimationContextEnableWebAnimations()` has been used.

To support web animations, the manner in which some animations are set up has changed. For many property-based animations, the value of the property will no longer be repeatedly updated during the animation. Instead, the value will be instantly set to the final value and only the CSS properties of the affected node will be animated. This is relevant for implementations that previously relied on this behaviour, such as handling view animations in the `boundsWillChangeToBounds(_)` method; in this release, those implementations will have to set up their own animations.

Several built-in CoreUI animations now use web animations by default where supported.

## BMAnimationSubscriber

Animation subscribers can optionally implement a new `prepare()` method that is invoked prior to the animation being applied. Animation subscribers can further modify the animation from within this method by adding new animation subscribers to the pending animation. Note that the `prepare()` method will not be invoked on those new subscribers. `BMAnimationContextGetCurrent()` will return the current animation when invoked from within this method, unlike with `apply()`.

## BMAnimationController

A new `registerBuiltInPropertiesWithDictionary(_)` method is now available for animation controllers and can be used to register multiple animation properties at the same time.

## BMAttributedLabelView

`BMAttributedLabelView` is a new subclass of `BMView`.

An attributed label view is a view that displays a text that can have various arguments which may be changed at runtime.
The attributed label view automatically generates DOM nodes for each argument.

Creating a label view with a template can be done using the factory method:
```js
BMAttributedView.labelViewWithTemplate('Template with ${firstPlaceholder} and ${secondPlaceholder}');
```
which creates an attributed label with two arguments named `firstPlaceholder` and `secondPlaceholder`.

The arguments themselves are accessed and updated via the `arguments` property of the attributed label view. Each argument appears a property of that object. Their value can be read or written through the `value` property of that object e.g.: 
```js
// This sets the value of the firstPlaceholder argument
myLabelView.arguments.firstPlaceholder.value = 3;
```

Additionally, the arguments objects allow specifying CSS styles for each argument. The attributed label view will reapply these styles whenever the underlying DOM structure changes, for example when changing the template string. This is accessible via the `style` property of each argument object. This takes a regular CSS rule object, such as `{color: 'red', borderWidth: '2px'}`.

Finally, the underlying DOM nodes themselves are accessible via the `node` property of these arguments objects. Note that there is no guarantee of the lifetime of these DOM nodes. The attribute label can remove and re-create these nodes at any time as needed.

## BMViewport

`BMViewport` is a new class introduced in this release. Its purpose is to describe the metrics of the current viewport, or in certain cases various parts of the viewport. Viewports are not typically created manually, but instead each view has a new `viewport` property that will return such an object describing the viewport used by that view's hierarchy.

If needed, a viewport object describing the current viewport can be obtained by invoking the `currentViewport()` static method.

## BMLayoutSizeClass

A new `BMLayoutSizeClass` class is now available and can be used to specify various requirements that a viewport should match. The requirements supported by size classes are in this release are:
* maximum width
* maximum height
* maximum diagonal
* orientation

A size class can contain one or more of these requirements.

Size classes are used by views and layout constraints to specify variations to their properties. The root of a view hierarchy will monitor its viewport for changes and activate and deactivate size classes in response to these changes. Whenever the active size classes change, the root of the view hierarchy will send a notification to all of its descendants and layout constraints and update their configuration accordingly.

It is not required to tell the view hierarchy which size classes it should check against viewport changes; instead view will automatically discover which size classes it should use whenever variations are created or removed within its hierarchy.

## BMView

### **General changes**

By default, views created with the default `BMView` class no longer support automatic intrinsic size; it is now required to manually enable this functionality for these views.

### **Bug fixes**

Resolved an issue that caused the expansion resistance to use the compression value instead for height measurement.

Resolved an issue that caused unsolvable layouts to trigger an infinite loop. View will now correctly remove unsatisfiable constraints and retry the layout operation. View will still try to use the unsatisfiable constraint during subsequent layout passes.

When computing the automatic intrinsic size of an element, View will now take the width of the border into account.


### **New properties and methods**

A new `opacity` property may be used to control the opacity of the view's node. This property corresponds to the CSS `opacity` property and is animatable.

A new `isVisible` property may be used to control the visibility of a view. Internally, this will control the node's CSS `display` property, switching between `none` and `block`.

A new `CSSClass` property may be used to add additional CSS classes to the view's node.

Two new methods, `boundsWillChangeToBounds(_)` and `boundsDidChangeToBounds(_)` can be overriden on subclasses of `BMView`. These methods are invoked whenever applying a new frame causes the view's size to change. Note that view subclasses may change their bounds independently of their layout; in those cases these methods should be invoked whenever the `bounds` property is updated.

A new `frameRelativeToRootView` property can be used to retrieve or update a view's `frame` in coordinates that are relative to the root view of its view hierarchy instead of using coordinates relative to the view's superview. If the root view is the first element in the page, this effectively controls the view's position and size relative to the viewport. Note that for views that are within scroll view content views, the resulting frame will depend on the scroll view's scroll position.

A new `viewport` readonly property can be used to obtain the viewport associated with a view hierarchy.

A new `frameForDescendant(_)` method is invoked on the root view of a view hierarchy at the end of a layout operation to obtain the frames to assign to all of its descendant views. Subclasses can override this method to customize the frames that will be assigned to views after a layout operation. Subclasses that override this method must return a `BMRect` object that will represent the frame to be assigned to the descendant given as a parameter. To obtain the frame resulting from solving the layout constraint equations, subclasses should invoke the superclass implementation.

A new `removeFromSuperview()` method is now available to remove a view from its superview, if it has one.

A new `isDescendantOfView(_)` method may be used to verify if a view is a descendant of a given view.

A new `constraintWithIdentifier(_)` method may be used to obtain a reference to a layout constraint using the identifier that has been assigned to it.

A new `allConstraints` readonly property will return all constraints used by a view and all of its descendants, regardless of whether they are active or not.

The `layout()` method is now deprecated. The new `layoutIfNeeded()` method should be used instead. In addition to the previous functionality, this method will not perform any changes if no pending layout update had been registered.

### **Subview management improvements**

When adding a subview to a view whose node is already a direct descendant of the new superview's content node, the subview's node will no longer be temporarily detached from the DOM.

When removing a subview from its superview while its node is no longer a direct descendant of the superview's content node, the subview's node will no longer be detached from the DOM.

When removing a subview from its superview, all constraints that are no longer valid (that reference views that are no longer part of the same view hierarchy) will now be removed.



### **Layout process improvements**

Improved layout performance by eliminating several sources of layout thrashing.

When a view is assigned a size that is different from its preferred instrinsic size during a layout pass, its intrinsic size will be recalculated during the next layout pass.

When a view is assigned a size that is greater than its preferred intrinsic size during a layout pass, its preferred intrinsic size will not be recalculated until its intrinsic size is invalidated or the view is assigned a smaller size.

If the assigned width of a view does not change and its intrinsic size does not become invalidated, neither the view's preferred intrinsic size nor its constrained intrinsic size will be recalculated, which can avoid having to modify the DOM at all during layout passes.

If a view's constraints specify a static size, with a greater priority than the view's intrinsic size resistances, the intrinsic size of that view will no longer be measured.

When an immediate layout pass is scheduled while there is already a pending layout pass, the pending layout pass is cancelled as the immediate pass will occur faster. This also reduces the number of unnecessary layout passes.

Immediate layout passes now use `async/await` instead of `window.postMessage(_)` to move the layout processing into the next event loop which should decrease the chances of the layout pass occurring after invalidated content has had a chance to draw itself using the old layout.

When the `layout()` method is invoked, all scheduled layout passes are cancelled.

Whenever a layout animation is set up for a view hierarchy, subsequent layout invalidations will be delayed until after that animation finishes. Because of how layout invalidations are now queued, regardless of how many times a view's layout has been invalidated during this time, only a single layout pass will occur at the end of the animation.

View will now correctly re-evaluate constraints when changing the compression or expansion resistance after the initial layout pass.

The unused `isManagingLayout` property has been removed.

The unused `layoutSubviews()` method has been deprecated.


### **`BMViewLayoutQueue`**

Whenever several view hierarchies register pending layout passes independently, the first view to start a layout pass will now cause all other pending views to run a layout pass as well, cancelling their scheduled layout passes. Additionally, whenever layout for several views occurs in this way, for each view, the layout pass is split into several phases and all views will await for all other views to reach the same phase before starting it. The result is that DOM reads and writes are now batched together across all views instead of each view independently modifying and reading the DOM, which is especially important for layout passes that would otherwise quickly occur one after another, such as in a scrolling collection view.

A new `BMViewLayoutQueue` class is now available to allow a limited control over this behaviour. Layout queues can be created via the static `layoutQueue()` method.

A new `layoutQueue` property may be set on views. By default, the value of this property is a global queue shared by most views. This property controls which views perform layout passes in sync.



### **Responsive design**

View now supports responsive design in a manner similar to media queries in CSS. The newly added `BMViewport` and `BMSizeClass` classes are used to facilitate this behavior. 

For view itself, the only variable aspects with regards to responsive design are visibility, opacity and CSS classes. To support this, view has several new methods:
* `setIsVisible(_, {forSizeClass})`, `removeIsVisibleVariationForSizeClass(_)` and `hasVisibilityVariationForSizeClass(_)` are used to control the visibility variation.
* `setOpacity(_, {forSizeClass})`, `removeOpacityVariationForSizeClass(_)` and `hasOpacityVariationForSizeClass(_)` are used to control the opacity variation.
* `setCSSClass(_, {forSizeClass})`, `removeCSSClassVariationForSizeClass(_)` and `hasCSSVariationForSizelass(_)` are used to control the CSS class variation.


### **`BMViewConstraintAttribute`**

A new `BMViewConstraintAttribute` class is now available. It cannot be created manually, but each view object now has a property of this type for each available layout attribute. This class makes it easier to create layout constraints, with a much more succint syntax than the usual layout constraint factory methods.
For example, a constraint is typically created by setting all of its attributes using the factory method `constraintWithView`:
```js
let constraint = BMLayoutConstraint.constraintWithView(sourceView, {attribute: BMLayoutAttribute.Left, toView: targetView, secondAttribute: BMLayoutAttribute.Left, relatedBy: BMLayoutConstraintRelation.LessThanOrEquals, constant: 8, multiplier: 2});
```

That syntax is quite verbose and can be difficult to read due to the large number of arguments, so constraint attributes can be used to simplify it:
```js
let constraint = sourceView.left.lessThanOrEqualTo(targetView.left, {times: 2, plus: 8});
```

## BMLayoutConstraint

Resolved an issue where changing a constant of a required constraint would crash the layout solver, if the new constant caused the layout to become unsatisfiable. View will now correctly discard unsatisfiable constraints that result from changing a constraint's constant.

The `constraintWithSerializedConstraint(_)` static method will now default to the `BMLayoutConstraint` class when a serialized constraint does not specify which class should be used.

A new `identifier` property is created and assigned to constraints upon creation. It can be used to uniquely identify constraint objects after being serialized and deserialized. When deserializing a constraint that didn't have an `identifier`, a new random one will be created and assigned to it.

Several new methods have been added to control the variations supported by constraints depending on size classes. Whenever any of these methods is invoked, if the new variation affects the layout in the current configuration, CoreUI will accordingly invalidate the layout. These methods are:
* `setConstant(_, {forSizeClass})`, `removeConstantVariationForSizeClass(_)` and `hasConstantVariationForSizeClass(_)` can be used to control the value of the `constant` property across configurations.
* `setPriority(_, {forSizeClass})`, `removePriorityVariationForSizeClass(_)` and `hasPriorityVariationForSizeClass(_)` can be used to control the value of the `priority` property across configurations.
* `setisActive(_, {forSizeClass})`, `removeIsActiveVariationForSizeClass(_)` and `hasIsActiveVariationForSizeClass(_)` can be used to control the value of the `isActive` property across configurations.

The new `affectsLayout` property is set to `YES` only when the constraint is included in layout operations for the current configuration. It is similar to how the `isActive` property behaves when there are no variations based on size classes, but is readonly.

## Layout Variables

It is now possible to define global layout variables for layout constraints to use as their constant values. Layout variables are values that are often reused in layouts such as a standard spacing to use between elements or the height of toolbars. Layout variables also support variations based on size classes making it easier to adapt layouts for various screen sizes.

The `BMView` class has several new static methods to manage these layout variables:
* `registerLayoutVariableNamed(_, {withValue})` is used to create a layout variable and define a value for it.
* `setLayoutVariableValue(_, {named, inSizeClass})` can be used to create a variation for a layout variable.
* `removeVariationForLayoutVariableNamed(_, {inSizeClass})` can be used to remove a previously created variation for a layout variable.
* `unregisterLayoutVariableNamed(_)` can be used to remove a previously registered layout variable.

To use a layout variable as a constraint constant value, the name of the layout variable can be assigned to the `constant` property of the layout constraint. It is also possible prefix the name of the layout variable with a `-` sign to cause the constraint to use the negated value of the layout variable. Layout variables can be used as both the default value of the `constant` property or in any variation definition.

## BMLayoutGuide

Layout guide now supports touch events.

## BMLayoutEditor

Layout editor now supports touch interfaces.

Resolved an issue in which the layout editor would not show the correct relation sign for a selected constraint.

Improved the performance of the animation that runs when toggling the visibility of the view hierarchy tree and the settings sidebar.

Improved the fidelity of the animation that runs when opening or closing the layout editor.

The layout editor now includes support for defining, using and removing layout variables and their variations.

Simplified the appearance of constraints by hiding subview constraints under a disclosure control; views that are more likely to affect a superview's
size and position are now more likely to appear by default. Inactive constraints are also placed under a disclosure control. When these disclosure controls are opened, the associated constraints are also drawn in the preview area.

Layout editor now supports constraint and view variations for several built-in size classes.

The `Remove Constraints` button now deactivates constraints instead and only those constraints that affect a view and its superviews. Holding control, option/alt and/or shift switches this button between affecting all constraints affecting the view, removing instead of deactivating constraints or entirely resetting the layout.

A new `createAdditionalSettingsForConstraint(constraint, {withReferenceView, inContainer})` method can now be overriden by subclasses to create additional custom settings for a selected constraint.

A new `layoutVariableProvider` property may now be set on layout editors. This represents the source of layout variables that may be used within the current view hierarchy.

## BMMenu

A new `BMMenu` class is available that can be used to create and display popup menus.

## BMJQueryShim

A new `BMJQueryShim` class is now available. Its purpose is to allow CoreUI to work without jQuery.

Initially, CoreUI assumed jQuery was always available because it was only meant to run with Thingworx. Because of that, jQuery wrappers were used in a few places instead of regular DOM nodes, however, only a few methods of jQuery were actually used (such as `css`, `width` and `height`) but those methods could easily map directly to standard DOM methods with no change in functionality. 

In essence, CoreUI used jQuery without actually taking advantage of it and this lead to a requirement of including jQuery in order to use CoreUI for no benefit.

Now, the `BMJQueryShim` class is used in place of jQuery wrappers wherever they existed previously and simply map the jQuery calls to standard DOM calls. **This change is breaking** for implementations that previously relied on the jQuery objects used by CoreUI as the shim object is not compatible with jQuery wrappers beyond the few methods used by CoreUI.

## BMCollectionViewCell

`BMCollectionViewCell` is now a subclass of `BMView`.

A new `boundsDidTransitionToBounds(_)` method that may be overriden on subclasses of cell is repeatedly invoked by CoreUI during animated size changes. Subclasses can override this method to improve the fidelity of the animation. Note that if the content of the cell is a view hierarchy, animated size changes will trigger an accompanying animated layout update by default without repeatedly triggering layout passes. `boundsDidTransitionToBounds(_)` should instead be used for non-view contents that CoreUI does not handle automatically.

## BMCollectionView

Collection View is now a subclass of `BMView`.

Resolved an issue that caused collection view to retain stale attribute caches after an animated layout change.

Resolved an issue that sometimes caused cells to quickly flash in incorrect positions at the beginning of a drag operation.

Improved the fidelity of the animation that runs when transferring cells from one collection view to another.

Collection View now creates a specialized layout queue for its cells and assigns it to them upon creation. To improve scrolling performance while minimizing visual artifacts, collection view may drain its layout queue at various key moments.

A new `updateEntireDataWithCompletionHandler()` method is now available. It behaves the same as `updateEntireDataAnimated(_, {updateLayout, completionHandler})`, but the value of the `animated` parameter is implicitly set to `NO`, unless an animation context is active, in which case the data update will use the animation context's options to perform the update. The value of the `updateLayout` parameter will be set to `YES`.

`updateEntireDataAnimated(_, {updateLayout, completionHandler})` will use the current animation context's options if the `animated` parameter is set to `YES` and an animation context is active. This will also override any animation options provided by the delegate.

`setLayout(_, {animated, completionHandler})` and the `layout` property are now animatable when an animation context is active while they are invoked. If one is active, its options will be used instead of the default set or the ones returned by the delegate.

When a collection view's `frame` property is changed from within an animation context, a matching layout update animation will run in parallel if this change causes a layout invalidation. Addionally, collection view will now only compute the new layout once at the beginning of the animation instead of repeatedly as before.

Resolved a bug that would crash the collection view when using hidden cell attributes on a cell that was retained.

Resolved a bug with `scrollToCellAtIndexPath(_, {withVerticalGravity, horizontalGravity, animated})` that would cause collection view to scroll to an unexpected position if the `withVerticalGravity` parameter was not specified.

Resolved an issue that would permanently disable layout updates following an initial animated layout update.

Resolved an issue that caused collection view to behave unexpectedly when web animations were enabled.

Resolved an issue that caused drag & drop to fail to trigger if the mouse pointer left the cell's node before moving the distance required to trigger this behaviour.

Resolved an issue that could cause drag & drop to trigger without clicking on a cell, if a drag & drop was previously attempted but did not trigger because the mouse pointer had left the cell's node.

### **Automatic cell sizes**

Collection view now has preliminary support for automatic cell sizes through several methods that may be leveraged by layout objects. These rely on the intrinsic size of the content that is displayed by the cell and require the use of layout constraints. Currently only flow layout supports this feature (in beta) and support from other layout types may roll out in the future.

`measuredSizeOfCellAtIndexPath(_)` can now be invoked to determine the preferred size that should be assigned to a cell so that its content fits without any clipping. When this method is invoked, collection view will retain the size, so that subsequent requests to obtain the measured size of the same cell will return the cached size instead of going through the whole process of rendering, laying out and measuring the cell.

`invalidateMeasuredSizeOfCellAtIndexPath(_)` can be invoked to clear out the measured size of a cell, forcing subsequent measurements to go through the process of laying out and measuring the cell.

`invalidateMeasuredSizeOfCells()` can be invoked to clear out all previous measurements.

`invalidateMeasuredSizeOfCellsWithBlock(_)` can be used to selectively clear out previous measurements.

## BMCollectionViewLayout

A new method `constraintsForMeasuringCell(_, {atIndexPath})` may be overriden by layout objects to provide additional constraints that the cell should conform to during measurements. Layout subclasses can, for example, use this to define size limits that the measurement should not exceed or size preferrences through optional constraints. The default implementation returns an empty array.
The constraints returned by this method should not be activated by the layout object. Collection View will handle activating, adding, inactivating and removing the constraints that are returned by this method.

Layout objects that support copying can now have their properties animated when an animation context is active. If the copy is guaranteed to behave the same as the source layout object, no additional implementation is required by layout objects to support this functionality.

A new `supportsCopying` property should overriden and set to `YES` for layout objects that support copying. The default value of this property is `NO`. Collection View will use the value of this property to determine if it can perform animated layout changes in certain cases.

A new `supportsStatefulCopying` property should be override and set to `YES` for layout objects that support stateful copying. The default value of this property is `NO`. Collection View will use the value of this property to determine if it can perform animated layout changes using a stateful copy instead of a regular copy, in order to avoid having to request a rebuild of the layout from the temporary copy.

A new `statefulCopy()` method can now be overriden by layout subclasses and should return a stateful copy of the layout object when implemented. Unlike a regular copy, a stateful copy is expected to also retain the internal state of the layout. When a stateful copy is created, collection view will assume that it can directly use the layout copy to request attributes without any additional preparation.

A new `beginUpdates()` method is now available on layout objects that support copying. This method should be used when a series of changes are expected to be applied to a layout object that each invalidate the layout. After this method is invoked, layout invalidations are temporarily suspended. The `applyUpdates()` method must be invoked to apply the changes and trigger the final layout invalidation. 
When animating layout properties, using this method pair is required to have the properties animate. In this case, `beginUpdates()` can be invoked at any point, but `applyUpdates()` must be invoked from within an animation context.

## BMCollectionViewTransitionLayout

When requesting attributes from the transition layout, it will now first try to return the transition attributes for the requested cell, if available, otherwise it will default to returning the attributes from the new layout.

## BMCollectionViewTableLayout

Table Layout has been deprecated in this release as all of its functionality and more can be achieved by using the flow layout. It will be removed in a future version of CoreUI.

## BMCollectionViewFlowLayoutGravity

Two new gravities are now available for flow layout:
 * `Start`: Aligns cells to the start of the row. This represents the left of the row in a vertical orientation and the top of the row in a horizontal one.
 * `End`: Aligns cells to the end of the row. This represents the right of the row in a vertical orientation and the bottom of the row in a horizontal one.

## BMCollectionViewFlowLayoutAlignment

The `Top` and `Bottom` alignment options have deprecated and replaced with `Start` and `End` respectively to support horizontal orientation as well.

## BMCollectionViewFlowLayoutOrientation

A new enum is now available to specify the orientation for flow layout:
 * `Vertical`: Aligns cells left to right in rows, and each row below the previous one
 * `Horizontal`: Aligns cells top to bottom in rows, and each row to the right of the previous one

## BMCollectionViewFlowLayout

Flow layout will no longer generate non-integer positions when the gravity is set to `.Center`.

Resolved an issue that caused flow layout to not correctly center its contents when the content gravity was set to `.Center` and a non-zero `rowSpacing` was used.

A new `maximumCellsPerRow` property can now be set on flow layout. When this property is set to a strictly positive number, flow layout will ensure that each row will contain no more than that number of cells.

A new `orientation` property can now be set on flow layout and takes values from the `BMCollectionViewFlowLayoutOrientation` enum.

### **Automatic Cell Sizes**

**`[BETA]`** A new `expectedCellSize` property can now be set on flow layout. When set to a size, this will cause flow layout to use the automatic cell sizing information provided by collection view to lay out the cells. To maintain performance, flow layout will only measure the cells that are initially visible on-screen and then subsequently measure new cells as they become visible. For cells that have never been on-screen and for the initial layout pass, the value of the `expectedCellSize` will be used to build an approximate initial layout.

Note that whenever the data set is updated, flow layout will still have to recompute the layout up to the current scroll position. While collection view caches the measured sizes of cells which should speed up this process, if collection view is scrolled to the end of the data set and a large number of new items are inserted at the beginning of the data set, flow layout will have to individually measure each new cell and this can lead to long delays on the UI thread during which the page will appear to have frozen.

## BMCollectionViewDataSet

Data sets can now optionally implement a new `identifierForIndexPath(_)` method that returns a string identifier that uniquely identifies the object to which the given index path points. This is used to optimize certain calculations performed by collection view, including automatic cell sizes.

## BMWindow

`BMWindow` is now a subclass of `BMView`.

When creating a window, it is now possible to mark it as non-modal by specifying the `modal` parameter. When a window is non-modal, it will be possible to interact with content that is not obstructed by the window. Note that the default action of clicking outside to close the window will also be disabled in this case, requiring a custom close mechanism to be provided.

Windows that are not modal can now be moved and resized.

A new `becomeKeyWindow()` method can be invoked on windows to bring them to front in a multi-window environment. A new `resignKeyWindow()` method can be used to cause the key window to become inactive.

Two new `minimizeAnimated(_)` and `restoreAnimated(_)` methods can now be invoked on non-modal windows to minimize or restore them.

Two new `minimizeAllAnimated(_)` and `restoreAllAnimated(_)` static methods can be used to minimize or restore all non-modal windows.

Two new `hide()` and `show()` methods are now available and can be used to hide or a non-modal window.

Two new `hideAll()` and `showAll()` static methods can be invoked to hide or show all non-modal windows.

A new `enterShowcase()` static method can now be invoked to make it easier to select between non-modal windows. A new `exitShowcase()` static method can be invoked to exit showcase mode.

## BMMonacoCodeEditor

The monaco code editor will no longer emit `"use strict";` when transpiling TypeScript code.

# 2.1.1

## BMCoreUI

Resolved a build issue that caused some of the third-party license comments to be removed in minified release builds.

## BMCollectionView

Resolved an issue where collection view would disable selection on cell contents when drag & drop was disabled. To combat this, collection view will now ask the delegate if it can start a drag and drop operation prior to actually being ready to start it. As such it is no longer guaranteed that returning `YES` from the delegate method `collectionViewCanMoveCell(_, _, {atIndexPath})` will cause collection view to begin a drag & drop operation.

Collection View will no longer start drag & drop operations while a current drag & drop operation is in progress.

# 2.1

CoreUI now requires a browser with support for `async/await`, `Promise` and other modern features.

## BMCodeEditor

A new `requiresTranspilation` getter should be overriden by subclasses and return `YES` when the current language requires transpilation in order to be used by the browser.

A new `transpiledCode()` async method should be overriden by subclasses and return the transpiled code when `requiresTranspilation` returns `YES`. Note that it is required for the overriden method to be async as well.

A new `setImports(_)` method should be overriden by subclasses that support autocompletion is used to set a flat file of external imports that are referenced by the
code editor.

A set of similar new functions are available for specific library files as well:
 * `addExternalLibraryNamed(_, {code})` is used to import an external library file.
 * `removeExternalLibraryNamed(_)` is used to remove a previously added external library file.
 * `hasExternalLibraryNamed(_)` is used to check for the existence of an external library file.

## BMMonacoCodeEditor

Enabled support for TypeScript.

## BMLayoutEditor

Layout editor will no longer show disclosure triangles for views without subviews.

Resolved an issue in which labels would be cut-off and leak into other elements.

Dragging a view with the left mouse button will now temporarily displace its frame. This makes it easier to move views out of the way when creating contraints.
Note that the frame is only displaced until the next layout pass occurs. If that view has a well defined layout then creating, modifying or deleting contraints and resizing the window will cause the view to move back to its correct location.

# BMCoreUI 2

![BMCoreUI2](http://roicentersvn.ptcnet.ptc.com/BogdanMihaiciuc/BMCoreUI/raw/branch/master/ui/BMCoreUI/CoreUI2@2x.png =128x128)

Release versions of CoreUI are now transpiled from ES7 down to ES5. As a result, development builds will no longer work on legacy browsers that lack ES6/7 support.
**In the future, CoreUI may drop support for legacy browsers.**

CoreUI now supports automatic updates via http://roicentersvn.ptcnet.ptc.com/BogdanMihaiciuc/BMUpdater

CoreUI 2 is a major release including a large number of fixes and improvements for `BMCollectionView`, `BMCodeEditor` and many of the primitive classes. It also adds interoperability with TypeScript through a definitions file that lets TypeScript projects use CoreUI features without having to opt-out of type safety. Finally it adds a new module that allows developers to lay out their pages using layout constraints that specify positioning and sizing relationships between elements on the page.

## TypeScript

CoreUI now provides a definitions file allowing CoreUI classes to be used as first-party TypeScript types. All CoreUI types are available for use in TypeScript. The definitions file also supports strict-null checking.

Two new `@BMAnimatable` and `@BMAnimatableNumber` decorators are now available in TypeScript projects. These may be applied to properties to easily make them animatable as long as they are numbers or types that implement the `BMAnimating` interface. For animatable properties, classes need only specify what happens when the property is updated; CoreUI handles storage, detecting animation contexts and setting up value interpolation.

**Example:**
```ts
class MyClass {
    // The annotation marks the backgroundColor property as animatable with CoreUI.
    // Setting this property while an animation context is active will cause this
    // change to be animated without any other code required
    @BMAnimatable
    set backgroundColor(value: BMColor) {
        document.body.style.backgroundColor = value.RGBAString;
    }

    setBackgroundColorAnimated(color: BMColor): void {
        BMAnimateWithBlock(_ => this.backgroundColor = color, {duration: 300});
    }
}
```

## BMAnimationController

The new animation controller class makes it easier to integrate with the CoreUI animation engine. Whereas the previously animation subscribers made this possible, they required a lot of boilerplate and provided very little functionality of their own. Note that CoreUI still uses *Velocity.js* as its animation backend.

Animation subscribers continue to exist in this release; the new animation controllers implement the `BMAnimationSubscriber` interface and take their place, so instances cannot use both for the same animation.

Animation subscribers provide methods to automatically interpolate values or even update their target's properties. They work with standard CSS/Velocity.js properties, numeric properties, `BMAnimating` properties or even arbitrary properties.

While decorators are the easiest way to integrate with CoreUI animations, animation controllers provide an easy to use alternative, with relatively little boilerplate code required.

The new animatable decorators make use of animation controllers behind the scenes.

**Example:**
```ts
class MyClass {
    let _myProperty: number;
    get myProperty(): number {
        return this._myProperty;
    }
    set myProperty(value: number) {
        if (let animation = BMAnimationContextGetCurrent()) {
            // If animation context is active obtain the animation controller for this object
            let controller = animation.controllerForObject(this, {node: document.body});
            // Then use it to register an animation for the myProperty property
            controller.registerOwnProperty('myProperty', {targetValue: value});
        }
        else {
            // Otherwise just set the value
            this._myProperty = value;
        }
    }
}
```

Additionally, `BMAnimateWithBlock()`, `BMAnimationApply()` and `BMAnimationApplyBlocking()` will now each return a promise that resolves when the animation finishes. 

Animation controllers also provide a promise that may be awaited on by the objects for which they have been created. These resolve when the portion of the animation that the controller has set up finishes, but not necessarily when the entire animation has finished.

## BMView

`BMView` is a new class available in `CoreUI 2`. It acts as a CoreUI extension point for regular DOM nodes. Views are strongly linked to the DOM node they are created with and manage various aspects of its lifecycle, depending on which view features are enabled. Views are created by invoking the `BMView.viewForNode(_)` or `BMView.view()` static methods. The first one creates a view from an existing node whereas the second method creates both a new node and view for it.

In this release, the main functionality of views is the ability to perform layout operations by specifying constraints between themselves. This is primarily done by solving the layout constraints using *kiwi.js*.

An important feature of views is their ability to specify an intrinsic size that represents the minimal size a view should have so that all of its content is visible. For views whose intrinsic size can be directly measured based on its DOM node, CoreUI can automatically determine the intrinsic size, but subclasses with more complex contents may provide custom values for the intrinsic size. These intrinsic sizes act as inputs for the CoreUI layout engine, allowing it to output a layout that is optimized for the contents of all of its views.

As with most CoreUI types, the layout performed by `BMView` is easily animatable from within an animation context.

**Example:**
```ts
function changeLayout(): void {
    let myView = BMView.viewForNode(document.body.firstChild);
    BMAnimateWithBlock(_ => {
        // Set the intrinsic size for myView. This normally causes a layout
        // update to be scheduled before the next frame is drawn.
        myView.intrinsicSize = BMSizeMake(500, 300);
        // But since we want this change to be animated, we tell
        // the view hierarchy to perform an out-of-order layout pass.
        // Since this happens in an animation block, the views will smoothly
        // transition to their new layout attributes.
        myView.layout();
    }, {duration: 300});
}
```

// TODO: `BMCollectionViewCell` and `BMCollectionView` are now subclasses of `BMView`. If collection view is now part of a view hierarchy whose layout is managed by CoreUI, invoking the `resized()` is no longer required.

## BMScrollView

`BMScrollView` is a subclass of view that translates its scroll position into constraints that other views can use. It makes it possible to use constraints to create effects such as parallax scrolling or even letting views outside of the scroll view position themselves relative to the scrolled position of views within the scroll view.

## BMLayoutGuide

`BMLayoutGuide` is a subclass of view that can be dragged and translates its dragged position into constraints relative to its superview. This makes it possible to use constraints to create expandable panels, movable content or other kinds of interactive behaviour.

## BMLayoutConstraint

A new `BMLayoutConstraint` class is now available that makes it possible to specify a layout constraint between two views or a view and a constant value. These are then used by the CoreUI layout engine to compute a layout that satisfies all of the constaints affect the views within a view hierarchy.

A layout constraint is a mathematical equality or inequality between two layout attributes on a view that takes the form of :
```
view1.attribute1 = multiplier * view2.attribute2 + constant
```
where the equals sign can be replaced with an inequality sign as needed.
Note that despite looking like an assignment statement, the constraint expression is a mathematical equation and the layout
system may choose to modify either side (or even both) of the equation to fulfill the constraint's requirements.

There are four types of layout constraints: vertical position, horizontal position, width and height. 
Each of them controls a specific aspect of a view's layout. A view must have constraints which clearly define all four of those
attributes for the layout system to be able to size it and position it correctly.
Additionally, constraints having an attribute of a type on the left hand side of the equation can only have an attribute of the same type on the right hand side.
In other words, for example, a view's vertical positioning can only depend on the vertical positioning of another view and not on its horizontal positioning or its size.
For views that have intrinsic sizes, the sizing constraints are optional as the intrinsic sizes of the views will be used by default as size constraint inequalities.
In addition, it is also possible to specify a constraint for a view's aspect ratio by linking its width to its own height.
Similarly, it is also possible to specify a constraint that makes a view's aspect ratio depend upon the aspect ratio of another view.
When creating an aspect ratio constraint, this may only be to another view's aspect ratio.

Constraints may also have a priority value assigned to them. All constraints with a priority value lower than `BMLayoutConstraintPriorityRequired` are considered
optional. The layout system will try to fulfill them, but it does not guarantee that it will do so and optional constraints may be ignored if it is needed to do so to fulfill
the required constraints. When an optional constraint cannot be fulfilled, the layout system may nevertheless attempt to change the values of the attributes so that they are
as close as possible to fulfill the optional constraint without breaking the required constraints.

## BMLayoutEditor

To make defining constraints easier, a `BMLayoutEditor` class has been added in CoreUI 2. This subclass of `BMWindow` is initialized with the root of a view hierarchy and opens a full-screen editor that allows developers to codelessly define layout constraints using only drag-and-drop.

While the layout editor modifies constraints on the view hierarchy directly, the constraints created by this editor can also be exported as a definitions JSON.



## BMCoreUI

`BMCopyProperties` now correctly handles the target object being set to undefined.

`BMRect` has a new `rectWithInset` method that returns a copy of the rect that is inset with a given inset object.

`BMInset` has the new static method `insetWithEqualInsets` and global constructor `BMInsetMakeWithEqualInsets` that constructs a new inset with the same value for all four edges.

`BMColorMakeWithString(_)` will now accept an undefined or empty string. In this case it will return a black transparent color.

Custom scrollbars used by CoreUI will no longer shrink below 32 pixels.

Whenever using custom scrollbars, CoreUI will now smoothly animate scroll events. It will also enable momentum scrolling for mouse wheels.

Ripple effects will now disappear correctly when the pointer moves outside of the element.

## BMAnimation

Resolved an issue that would cause the animation to not run if a custom queue was specified.

`BMAnimationApply`, `BMAnimationApplyBlocking` and `BMAnimateWithBlock` will now each return a promise that resolves when the animation finishes. For animations that affect multiple elements with varying delays, durations or strides, the returned promise will resolve when all sub-animations are finished.

## BMCell

`BMCell` has been renamed to `BMCollectionViewCell` to better match is functionality. The old `BMCell` symbol temporarily exists as an alias to `BMCollectionViewCell` but is deprecated. Related global symbols have also been renamed appropriatedly and similarly still have the old symbol names as aliases.

`BMCollectionViewCell` can now be subclassed. For more information, refer to the documentation for `BMCollectionViewCell` and its methods. To help with subclassing, the cell class now includes several additional methods that do nothing in the base class but may be overriden by subclasses to customize the cell's behaviour.

## BMCellAttributes

`BMCellAttributes` has been renamed to `BMCollectionViewLayoutAttributes` to better match its functionality. The old `BMCellAttributes` symbol temporarily exists as an alias to `BMCollectionViewLayoutAttributes` but is deprecated. Related global symbols have also been renamed appropriatedly and similarly still have the old symbol names as aliases.

The `hidden` property has been renamed to `isHidden`.

When attributes with `isHidden` set to YES are applied to a cell, the cell will be hidden from the layout.

## BMCollectionViewLayout

Collection view layouts may now return hidden attributes by setting the `isHidden` property of the attributes to `YES`.

It is recommended to only return hidden attributes from `attributesForCellAtIndexPath(_)` and `attributesForSupplementaryViewWithIdentifier(_, {atIndexPath})`, skipping them when returning attributes from `attributesForElementsInRect(_)`. Nevertheless, collection view will appropriately handle hidden attributes returned from `attributesForElementsInRect(_)`.

The layout type has a new method `rectWithScrollingPositionOfCellAtIndexPath(_)` that is invoked by the collection view to determine the position it should scroll to in order to reveal the cell at a specific index path. Layout subclasses may optionally override this method in order to provide custom locations for cells instead of relying on the current attributes returned by `attributesForCellAtIndexPath(_)`.

The new `rectWithScrollPositionOfSupplementaryViewWithIdentifier(_, {atIndexPath})` is used in a similar manner for supplementary views.

Layouts may now specify snapping offsets for the collection view. When a layout returns `YES` from the `snapsScrollPosition` getter, the collection view will periodically request snapping offsets from the layout by invoking the `snappingScrollOffsetForScrollOffset(_, {withVerticalDirection, horizontalDirection})` method, passing in the terminal scrolling offset and scrolling directions. Layout objects that support snapping should override that method and return the appropriate offset to which the collection view should snap.

A new `preferredScrollOffsetForTransitionFromLayout(_, {withOffset})` may optionally be overriden by layout subclasses and allows the layout to customize the scroll offset when collection view transitions from its current layout to that layout. The default implementation returns the result of invoking `preferredScrollOffsetWithOffset(_)`.

## BMCollectionViewMasonryLayout

// TODO: The masonry layout will now supply the correct coordinates when `scrollToCellAtIndexPath(_)` is used on the collection view.

## BMCollectionViewStackLayout

A new stack layout type is available for use.
The stack layout is a vertically scrolling layout that presents cells a stack, where the current cell appears above the other cells.
In the stack layout, previous cells appear behind the current cell, while upcoming cells are hidden.

When scrolling in the stack layout, the scroll position will always snap back to fully show a single cell.

The stack layout does not support sections or supplementary views.

## BMCollectionViewTileLayout

A new tile layout type is available for use.

The tile layout tries to position cells wherever there is space for them within their section's area, favoring spaces that are closer to the top and left sides of their respective sections. Because cells can have arbitrary sizes and this might cause the final layout to appear dissonant, it offers several options to help with the positioning:
 - `spacing` is a numeric property that controls the minimum spacing between cells.
 - `gridSize` is a numeric property that acts as a quantum size unit for the cells, also taking the value of the `spacing` property into account. It guarantees that regardless of the cell size reported by the collection view's delegate, the layout will use the closest multiple of the `gridSize` for the final layout, adding in values of `spacing` for multipliers greater than one. For example, with the `gridSize` set to `32` and the spacing set to `16`, a cell with a reported width of `64` will end up with a final width of `80`, because the closest multiple of the `gridSize` is 2 and there would be one space fitting between two sizes.

As the tile layout can be computationally intensive, it is not recommended for data sets where sections contain a large amount of items. Additionally, using sufficiently large values for `spacing` and `gridSize` may also help with performance as the tile layout is then able to eliminate certain gaps in the resulting layout which would be too small for any cells to be placed there.

The tile layout can optionally generate supplementary views for headers, footers and an empty view when there is no content in the collection view.

## BMCollectionView

The `scrollOffset` property is now read/write and animatable.

Collection view will now take the `isHidden` property of attributes into account when laying out cells. Hidden cells behave different from regular cells in the following ways:
 - Cells that are hidden by the layout and not retained by any external source are removed from the layout and not rendered.
 - Cells that are hidden but retained by an external source will continue to appear in the layout, but will be visually hidden. In this case, the cell's position in the DOM is not guaranteed to match the position of its layout attributes.
 - When assigning hidden cell attributes to a visible cell during an animation, the cell will animate to the target attributes and will be made hidden when the animation ends.
 - When assigning visible cell attributes to a hidden cell during an animation, the cell will be made visible, then transition from the source attributes to the given attributes.

 When the layout object provides a new scroll offset for animated data updates, the scrolling animation will now use the same animation options as the data update.

 Fixed an issue that would cause layout assignment to fail when using the property syntax instead of the `setLayout(_, {animated})` method.

 Collection view will no longer run the intro animation on bound cells that are not strictly in the visible bounds.

 A new `cellClass` property can now be modified on the collection view. This controls the class from which new cells are instantiated. This property should be set to a class that extends `BMCollectionViewCell`. When any class other than the default is used for a cell, collection view will no longer request the contents of the cell from the data set object, instead the custom subclass is expected to create and manage its own contents.

 The new `registerCellClass(_, {forReuseIdentifier})` and `registerSupplementaryViewClass(_, {forReuseIdentifier})` may be used to register different subclasses for each specific reuse identifier. When `dequeueCellForReuseIdentifier(_)` and `dequeueCellForSupplementaryViewWithIdentifier(_)` are used, collection view will return a cell of the appropriate class. When there is no class registered for that specific reuse identifier, collection view will return a cell of the default `cellClass` class.

 `updateEntireDataAnimated(_), {refreshLayout, completionHandler})` and `setLayout(_, {animated})` will now both return a promise that resolves when the operation completes. This makes it possible to await on these operations from async functions.

 Resolved an issue that caused scrolling to not be animated during an animated data update when not using custom scrolling.

 Resolved an issue that would cause scrolling in nested collection views to scroll both collection views at the same time.

 Resolved an issue with animated layout updates that caused the scrolling offset to reset to the beginning of the content.

 Resolved an issue with animated layout updates that caused cells to not be released properly.

## Drag & Drop

Collection View now supports drag & drop as an alternative way to manipulate the data it displays. This feature requires that the collection view data set is able to respond to requests to add, move and remove items. This feature can enable several behaviours:
 * Dragging items from the collection view in order to change their positions
 * Dragging items outside the collection view to remove them
 * Dragging items from a collection view onto another collection view which will move or copy the items into that collection view.

On devices with a mouse, a drag & drop interaction is initiated by clicking and dragging on a collection view cell. On touch-based devices, this interaction is initiated by long pressing on a cell until a badge appears on the top-left corner of the cell. At that point, the user can move their finger to continue dragging the cell. Whenever the user begins dragging a selected cell, all of the other selected cells will be included in the drag operation as well.

 Most of the implementation details are handled by Collection View, however the behaviour of this interaction can be controlled by the delegate.

## BMCollectionViewDataSet

`contentsForCellWithReuseIdentifier(_)` and `contentsForSupplementaryViewWithIdentifier(_)` have been deprecated in favor of using custom cell classes. The current version of collection view will still invoke these methods when using the default cell class.

`updateCell(_, {atIndexPath})` and `updateSupplementaryView(_, {withIdentifier, atIndexPath})` have been deprecated and are now optional. The current version of collection view will continue to invoke these methods when implemented during data updates, but it is recommended to update visible cells manually when their contents change instead.

For data sets that support manipulating contents via drag & drop, the following methods must now be implemented:
 * `moveItemFromIndexPath(_, {toIndexPath})` is invoked when an item should move.
 * `moveItemsFromIndexPaths(_, {toIndexPath})` is invoked when several items should move.
 * `removeItemsAtIndexPaths(_)` is invoked when one or more items should be removed.
 * `insertItems(_, {toIndexPath})` is invoked when the data set should accept the items from a different collection view.

In all of these cases, the data set is required to implement the methods but not necesarrily to actually perform the requested actions. For example, the data set is free to only import part of the items provided to `insertItems` or not move items at all from the `moveItemsFromIndexPath` method. 

## BMCollectionViewDelegate

Delegate objects may now implement any of the following methods:
 - `collectionViewDidResizeCell(_, _, {toSize})` is invoked after any cell is resized. The method will be invoked after any associated animations have finished running.
 - `collectionViewWillResizeCell(_, _, {toSize})` is invoked prior to any cell being resized. This method will be invoked before any associated animation begins.
 - `collectionViewCanMoveCell(_, _, {atIndexPath})` is invoked by Collection View prior to a drag & drop operation beginning. The delegate object is expected to return `YES` to let collection view initiate the operation or `NO` otherwise. Collection view will not initiate drag & drop operations if this method is not implemented.
  - `collectionViewWillBeginInteractiveMovementForCell(_, _, {atIndexPath})` is invoked by Collection View prior to starting a drag & drop operation.
  - `collectionViewCanTransferItemsAtIndexPaths(_, _)` is invoked by CoreUI to determine if the items at the given index paths can be transferred to another collection view.
  - `collectionViewTransferPolicyForItemsAtIndexPaths(_, _)` invoked to determine how to handle the transfer of the given items.
  - `collectionViewCanAcceptItems(_, _)` is invoked by CoreUI to determine if the collection view may accept items from another source.
  - `collectionViewAcceptPolicyForItems(_, _)` is invoked to determine how to handle the transfer of the given items.
  - `collectionViewCanRemoveItemsAtIndexPaths(_, _)` is invoked by collection view to determine if the items at the given index path can be removed by the drag & drop operation.
  - `collectionViewWillFinishInteractiveMovementForCell(_, _, {atIndexPath})` and `collectionViewDidFinishInteractiveMovementForCell(_, _, {atIndexPath})` are invoked at the end of the drag & drop operation.

# 1.0.55

## BMCoreUI

A new `BMHTMLEntity` enum is available for use. It contains a list of commonly used HTML entities.

## BMCollectionView

Fixed an issue which caused the `scrollToRect`, `scrollToCellAtIndexPath` and `scrollToSupplementaryViewWithIdentifier` methods to not correctly update the collection view's contents.

# 1.0.53

## BMCellAttributes

Preliminary support for hidden cell attributes. This feature isn't functional yet.
The cell attributes type now has a new property called `hidden` with a default value of `NO`. When this property is set to `YES` it marks the cell using those attributes as hidden. Hidden cells do not appear in the layout. As a further optimization, the collection may choose to not render hidden cells at all.

## BMCollectionViewLayout

The layout type now supports four additional methods:
 - `finalAttributesForHidingCellAtIndexPath(_)` is invoked during layout or data updates for cells that become hidden. The default implementation returns the same attributes that layout normally returns for newly added cells.
 - `finalAttributesForHidingSupplementaryViewWithIdentifier(_, {atIndexPath})` is invoked during layout or data updates for supplementary views that become hidden. The default implementation returns the same attributes that layout normally returns for newly added supplementary views.
 - `initialAttributesForRevealingCellAtIndexPath(_)` is invoked during layout or data updates for cells that become visible. The default implementation returns the same attributes that layout normally returns for deleted cells.
 - `initialAttributesForRevealingSupplementaryViewWithIdentifier(_, {atIndexPath})` is invoked during layout or data updates for supplementary views that become visible. The default implementation returns the same attributes that layout normally returns for deleted supplementary views.

## BMCollectionViewFlowLayout

Fixed an issue where the flow layout would assign non-integer sizes to cell attributes.

The `BMFlowLayoutAlignment` enum has an additional field called `Expand`. When this value is used for the flow layout alignment, all items will have their heights resized to fill the entire row height.

When using the `Expand` gravity, the flow layout will now add one additional pixel to the leftmost cells as needed to ensure that the entire row width is used.

When using the other gravities, the flow layout will now add additional pixels to the leftmost spacing areas to ensure that the entire row width is used.

## BMCollectionView

The collection view will now use passive event listeners for scroll events.

Fixed an issue that caused the collection view bounds to move off-screen during updates and frame changes.

Fixed an issue that caused the collection view to invoke `collectionViewCellWasLongClicked(_, _, {withEvent})` for cells that were short clicked or tapped.

The new `scrollBarSize` property may be used to get the scrollbar size from the collection view. Unlike the global `BMScrollBarGetSize()` function, the collection view will return 0 from this property when using iScroll.

When using iScroll on touch devices, the scrollbars will now fade away when not in use.

# 1.0.38

## BMCollectionView

The collection view will now allow events originating from `<label>` and `<a>` elements to reach their intended target.

## BMCollectionViewFlowLayout

Fixed an issue in which the flow layout would not properly respond to frame changes.

# 1.0.36

## BMCollectionViewFlowLayout and BMCollectionViewTableLayout

When the layout height exceeds the collection view's height, the table flow layouts will now take the scrollbar's size into account when laying out items when not using iScroll on the platforms where the scrollbar affects the collection view's usable size.

# 1.0.34

## BMCollectionViewFlowLayout

The flow layout has a new property called `minimumSpacing`. When this is set to a positive number, the flow layout will guarantee that cells will have at least that spacing between them regardless of the selected gravity.

# 1.0.31

## BMCollectionView

When performing a layout change while there is already an in-progress animated change, the collection view delay applying that layout until after the change is finished.

## BMCollectionViewTransitionLayout

Fixed an issue which caused the transition layout to invoke methods on the collection view reference after it was cleared.

Fixed an issue which caused the transition layout to crash with an exception when requesting attributes from the target layout.

# 1.0.16

## BMCollectionView

When requesting initial or final attributes for cells during animations, the collection view will now supply the cell's current attributes to the layout object as the `withTargetAttributes` argument.

## BMCollectionViewLayout

The default implementation for initial and final attributes will now use the attributes supplied by the collection view rather than requesting the current attributes from the layout.

## BMCollectionViewTransitionLayout

The transition layout will now supply the attributes generated by the target layout when `attributesForCellAtIndexPath(_)` or `attributesForSupplementaryViewWithIdentifier(_, {atIndexPath})` are invoked.

# 1.0.15

## BMColor

The `BMColorMakeWithString(_)` function now works with internet explorer.

## BMCollectionViewFlowLayout

Fixed an issue that caused the flow layout to repeatedly invalidate the layout when it was not needed.

## BMCollectionView

Event handlers now fire correctly for hybrid touch and pointer based devices.

# 1.0.9

## BMCodeHostCore

`BMMonacoCodeEditor` now has its own set of defaults instead of relying on the Thingworx extension defaults.

# 1.0.7

## CoreUI

Added the `BMKeysForValue(_, {inObject})` global function that, when given a value, returns all keys within an object whose value is equal to the given value.

## BMColor

Fixed the `RGBString` and `RGBAString` properties that were previously returning incorrect colors.

## BMCollectionView

Added the `highFrequencyScrollingEnabled` property that, when set to `YES`, causes the collection view to handle scroll events during the capture phase and as often as they are triggered.

For the `cellAtIndexPath(_, {ofType, withIdentifier})`, the ofType parameter is now nullable and defaults to `BMCellAttributesType.Cell`.

The `refreshCellAtIndexPath(_)` method will now correctly destroy retained cells.

The collection view will now request the correct index paths from the data set prior to invoking `cellForItemAtIndexPath(_)` and `updateCell(_, {atIndexPath})` methods, if `updateEntireDataAnimated(_, {updateLayout, completionHandler})` has been invoked with `updateLayout` set to NO.

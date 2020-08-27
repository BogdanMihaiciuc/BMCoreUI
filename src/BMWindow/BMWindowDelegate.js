// @type interface BMWindowDelegate

/**
 * The specification for a `BMWindowDelegate` object, which can optionally be used in conjunction with `BMWindow` objects and will receive various
 * callbacks related to the window's lifecycle.
 */
function BMWindowDelegate() {} // <constructor>

BMWindowDelegate.prototype = {
	
	/**
	 * Invoked when the window is about to become visible. This method is invoked before the window actually
	 * becomes visible and before any associated animation runs.
	 * @param window <BMWindow>		The calling window.
	 */
	windowWillAppear(window) {},

	/**
	 * Invoked after the window has become visible. This method is invoked after any associated animation has finished running.
	 * @param window <BMWindow>		The calling window.
	 */
	windowDidAppear(window) {},


	/**
	 * Invoked whenever the window is about to be resized. 
	 * 
	 * Delegates can implement this method to control when this window can be resized.
	 * 
	 * This method is invoked repeatedly while the user is resizing.
	 * @param window <BMWindow>		The calling window.
	 * @param toSize <BMSize>		The window's new size.
	 * @return <Boolean>			`YES` if the window can be resized, `NO` otherwise.
	 */
	windowShouldResize(window, toSize) {},

	/**
	 * Invoked after the window has been resized. This method is invoked repeatedly while the user is resizing.
	 * @param window <BMWindow>		The calling window.
	 * @param toSize <BMSize>		The window's new size.
	 */
	windowDidResize(window, toSize) {},


	/**
	 * Invoked whenever the window is about to be moved. 
	 * 
	 * Delegates can implement this method to control when this window can be moved.
	 * 
	 * This method is invoked repeatedly while the user is moving the window.
	 * @param window <BMWindow>		The calling window.
	 * @param toPosition <BMPoint>	The window's new position.
	 * @return <Boolean>			`YES` if the window can be moved, `NO` otherwise.
	 */
	windowShouldMove(window, toPosition) {},

	/**
	 * Invoked after the window has been moved. This method is invoked repeatedly while the user is moving the window.
	 * @param window <BMWindow>		The calling window.
	 * @param toPosition <BMPoint>	The window's new position.
	 */
	windowDidMove(window, toPosition) {},

	/**
	 * Invoked after the window becomes the key window.
	 * @param window <BMWindow>		The calling window.
	 */
	windowDidBecomeKeyWindow(window) {},

	/**
	 * Invoked after the window is no longer the key window.
	 * @param window <BMWindow>		The calling window.
	 */
	windowDidResignKeyWindow(window) {},

	/**
	 * When a window is made visible from a given DOM node, this method is invoked on the delegate object so the window knows whether the node
	 * from which it is shown should remain hidden while the window is visible.
	 * 
	 * The default behaviour when this method is not implemented is that the node is made hidden during the visibility animation and then made
	 * visible when the animation completes. When this method is implemented and returns `YES`, the node is kept hidden until the window is dismissed.
	 * @param window <BMWindow>		The calling window.
	 * @return <Boolean>			`YES` if the node should remain hidden, `NO` otherwise.
	 */
	windowShouldKeepNodeHidden(window) {},
	
	/**
	 * Invoked when the user takes an action that would normally cause the window to close.
	 * Delegates can implement this method to control this behaviour.
	 * @param window <BMWindow>		The calling window.
	 * @return <Boolean>			`YES` if the window should close, `NO` otherwise.
	 */
	windowShouldClose(window) {},

	/**
	 * Invoked when the window is about to close. This method is invoked before the window actually
	 * becomes hidden and before any associated animation runs.
	 * @param window <BMWindow>		The calling window.
	 */
	windowWillClose(window) {},

	/**
	 * @deprecated - Set the `anchorRect` property on the window object instead.
	 * 
	 * This method is invoked when the window is about to be dismissed as a result of standard user interaction.
	 * Delegate objects can optionally implement this method and return a `BMRect` object to which this window will transition when closing.
	 * 
	 * This method is invoked before the window begins closing and before `windowWillClose()`.
	 * @param window <BMWindow>		The calling window.
	 * @return <BMRect, nullable>	An optional rect to which the window will transition.
	 */
	rectForDismissedWindow(window) {},

	/**
	 * @deprecated - Set the `anchorNode` property on the window object instead.
	 * 
	 * This method is invoked when the window is about to be dismissed as a result of standard user interaction.
	 * Delegate objects can optionally implement this method and return a DOM node to which this window will transition when closing.
	 * 
	 * This method is invoked before the window begins closing and before `windowWillClose()`.
	 * @param window <BMWindow>		The calling window.
	 * @return <DOMNode, nullable>	An optional DOM node to which the window will transition.
	 */
	DOMNodeForDismissedWindow(window) {},

	/**
	 * Invoked after the window has closed. This method is invoked after any associated animation has finished running.
	 * @param window <BMWindow>		The calling window.
	 */
	windowDidClose(window) {},

	/**
	 * Invoked after the window transitioned to full-screen mode. This method is invoked after any associated animation has finished running.
	 * @param window <BMWindow>		The calling window.
	 */
	windowDidEnterFullScreen(window) {},

	/**
	 * Invoked after the window transitioned from full-screen mode to regular mode. This method is invoked after any associated animation has finished running.
	 * @param window <BMWindow>		The calling window.
	 */
	windowDidExitFullScreen(window) {},

	
	/**
	 * Invoked when the window is about to be minimized. This method is invoked before the window actually
	 * becomes hidden and before any associated animation runs.
	 * @param window <BMWindow>		The calling window.
	 */
	windowWillMinimize(window) {},

	
	/**
	 * Invoked when the window is about to be restored. This method is invoked before the window actually
	 * becomes visible and before any associated animation runs.
	 * @param window <BMWindow>		The calling window.
	 */
	windowWillRestore(window) {},


	/**
	 * Invoked after the window has been minimized. This method is invoked after any associated animation has finished running.
	 * @param window <BMWindow>		The calling window.
	 */
	windowDidMinimize(window) {},


	/**
	 * Invoked after the window has been restored. This method is invoked after any associated animation has finished running.
	 * @param window <BMWindow>		The calling window.
	 */
	windowDidRestore(window) {}

};

// @endtype


// @type interface BMCodeEditorDelegate


/**
 * The specification for a `BMCodeEditorDelegate` object, which can optionally be used in conjunction with `BMCodeEditor` objects and will receive various
 * callbacks related to the editor's lifecycle.
 */
function BMCodeEditorDelegate() {} // <constructor>

BMCodeEditorDelegate.prototype = {
	
	/**
	 * Invoked after the contents of the given code editor have changed. Note that neither the new contents nor the old ones are given as
	 * parameters to this method; instead, the new content should be retrieved directly from the given editor instance.
	 * @param editor <BMCodeEditor>		The calling editor.
	 */
	codeEditorContentsDidChange(editor) {},

};


// @endtype
// @ts-check

import {YES, NO, BMExtend} from '../Core/BMCoreUI'
import {BMWindow} from './BMWindow'

// @type BMToolWindow extends BMWindow

/**
 * A tool window is a subclass of `BMWindow` that manages the display and lifecycle of a tool window.
 * Tool windows are utility windows that are associated with a window and are only visible when their
 * associated window is the key window.
 * Tool windows always float above their key window and cannot be minimized.
 * Whenever their associated window becomes the key window, its tool windows are considered to be key windows.
 * Whenever their associated window resigns its key window status, its tool windows are hidden.
 */
function BMToolWindow() {} // <constructor>

BMToolWindow.prototype = BMExtend(Object.create(BMWindow.prototype), {

	/**
	 * Initializes this tool window with the given frame and associates it with the given window.
	 * @param frame <BMRect>		The window's frame.
	 * {
	 * 	@param forWindow <BMWindow>	The window to which this tool window will be associated.
	 * }
	 * @return <BMToolWindow>		This tool window.
	 */
	initWithFrame(frame, {forWindow: window}) {
		this._toolWindow = YES;

		BMWindow.prototype.initWithFrame.call(this, frame, {toolbar: YES, modal: NO});

		this.node.classList.add('BMToolWindow');
		window._toolWindows.push(this);

		// If the window is the key window, make this tool window visible
		if (BMWindow._keyWindow == window) this.bringToFrontAnimated(YES);

		return this;
	},

	becomeKeyWindow() {
		// This operation is a no-op for tool windows
	},

	resignKeyWindow() {
		// This operation is a no-op for tool windows
	}
});

/**
 * Creates and returns a tool window with the given frame and associates it with the given window.
 * @param frame <BMRect>		The window's frame.
 * {
 * 	@param forWindow <BMWindow>	The window to which this tool window will be associated.
 * }
 * @return <BMToolWindow>		This tool window.
 */
BMToolWindow.toolWindowWithFrame = function (frame, {forWindow}) {
	return (new BMToolWindow).initWithFrame(frame, {forWindow});
}

// @endtype
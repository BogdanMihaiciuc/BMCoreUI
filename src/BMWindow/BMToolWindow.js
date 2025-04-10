// @ts-check

import { BMView } from '../BMView/BMView_v2.5';
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
export function BMToolWindow() {} // <constructor>

BMToolWindow.prototype = BMExtend(Object.create(BMWindow.prototype), {

	/**
	 * Controls whether this tool window opens automatically whenever its owning window is opened.
	 * When this property is set to `YES`, whever the parent window is opened, this tool window will also open.
	 * 
	 * Otherwise this tool window will remain hidden until its `bringToFrontAnimated` method is invoked.
	 */
	opensAutomatically: YES, // <Boolean>

	/**
	 * The window to which this tool window is associated.
	 */
	_parentWindow: undefined, // <BMWindow>

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

		this._parentWindow = window;

		// If the window is the key window, make this tool window visible
		if (BMWindow._keyWindow == window) {
			this.bringToFrontAnimated(YES);
		}

		this._enableKeyboardShortcuts();

		return this;
	},

	becomeKeyWindow() {
		// This operation is a no-op for tool windows
	},

	resignKeyWindow() {
		// This operation is a no-op for tool windows
	},

	keyPressedWithEvent(event, args) {
		const handled = BMView.prototype.keyPressedWithEvent.apply(this, [event, args]);

		if (!handled) {
			this._parentWindow?.keyPressedWithEvent(event, args);
		}
	},

	release() {
		const index = this._parentWindow._toolWindows.indexOf(this);
		if (index != -1) {
			this._parentWindow._toolWindows.splice(index, -1);
		}
		BMWindow.prototype.release.call(this);
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
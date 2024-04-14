// @ts-check

import { BMHTMLEntity, NO } from "../Core/BMCoreUI";

/**
 * A dictionary that contains the mapping between key codes and the character
 * symbols that represent them.
 */
const _BMKeyboardShortcutCharacterMap = {
    Backquote: '`',
    Minus: '-',
    Equal: '=',
    BracketLeft: '[',
    BracketRight: ']',
    Backslash: '\\',
    Semicolon: ';',
    Quote: '\'',
    Comma: ',',
    Period: '.',
    Slash: '/',
    Enter: BMHTMLEntity.Return,
    Escape: BMHTMLEntity.Escape,
    Backspace: BMHTMLEntity.Delete,
};

// @type BMKeyboardShortcutModifier

/**
 * Contains constants representing the modifier keys that can be used when registering keyboard shortcuts
 * for views and windows.
 */
export const BMKeyboardShortcutModifier = Object.freeze({ // <enum>

    /**
     * Represents the command key on macOS and iOS, windows key on Windows and meta key on Linux.
     */
    Command: {key: 'metaKey', value: 1}, // <enum>

    /**
     * Represents the option key on macOS and alt on other systems.
     */
    Option: {key: 'altKey', value: 2}, // <enum>

    /**
     * Represents the shit key.
     */
    Shift: {key: 'shiftKey', value: 4}, // <enum>

    /**
     * Represents the control key.
     */
    Control: {key: 'ctrlKey', value: 8}, // <enum>

    /**
     * Represents the command key on macOS and iOS and control key on other systems.
     */
    System: {key: 'systemKey', value: (navigator.platform.startsWith('Mac') || /iPhone|iPad|iPod/.test(navigator.platform)) ? 1 : 8}, // <enum>

});

// @endtype

// @type BMKeySequence

/**
 * A class whose instances describe sequences of keys on a keyboard that must be
 * pressed for an action to take place.
 */
export function BMKeySequence() {} // <constructor>

BMKeySequence.prototype = {

    /**
     * The key that should be pressed for this keyboard shortcut.
     */
    _keyCode: undefined, // <String>
    get keyCode() {
        return this._key;
    },

    /**
     * An array of keyboard modifiers that must be pressed
     * together with the key in order to trigger the shortcut.
     */
    _modifiers: undefined, // <[BMKeyboardShortcutModifier]>
    get modifiers() {
        if (this._modifiers) return this._modifiers.slice();
    },

    /**
     * Designated initializer. Initializes this key sequence with the specified key and optional modifiers.
     * @param key <String>                                              The key that should be pressed for this key sequence.
     *                                                                  This maps to the `code` property of keyboard events.
     * {
     * 	@param modifiers <[BMKeyboardShortcutModifier], nullable>		Defaults to an empty array. An optional array of modifiers
     *                                                                  that must be pressed together with the target key.
     * }
     * @return <BMKeySequence>                                          This key sequence.
     */
    initWithKeyCode(key, {modifiers} = {modifiers: []}) {
        this._key = key;
        this._modifiers = modifiers?.slice() ?? [];

        for (const modifier of this._modifiers) {
            this._modifierBitmap = this._modifierBitmap | modifier.value;
        }

        return this;
    },

    /**
     * Initializes this key sequence with the specified keyboard event, using the event's key code
     * and any active modifier keys. If the event includes the control or command keys, these may be converted
     * into a system key modifier based on the current platform.
     * @param event <KeyboardEvent>         The keyboard event from which this key sequence should be initialized.
     * @return <BMKeySequence>              This key sequence.
     */
    initWithKeyboardEvent(event) {
        const modifiers = [];
        if (event.shiftKey) {
            modifiers.push(BMKeyboardShortcutModifier.Shift);
        }
        if (event.altKey) {
            modifiers.push(BMKeyboardShortcutModifier.Option);
        }
        if (event.metaKey) {
            if (BMKeyboardShortcutModifier.System.value == BMKeyboardShortcutModifier.Command.value) {
                modifiers.push(BMKeyboardShortcutModifier.System);
            }
            else {
                modifiers.push(BMKeyboardShortcutModifier.Command);
            }
        }
        if (event.ctrlKey) {
            if (BMKeyboardShortcutModifier.System.value == BMKeyboardShortcutModifier.Control.value) {
                modifiers.push(BMKeyboardShortcutModifier.System);
            }
            else {
                modifiers.push(BMKeyboardShortcutModifier.Control);
            }
        }

        return this.initWithKeyCode(event.code, {modifiers});
    },

    /**
     * A string description of this key sequence, intended to be displayed to end-users.
     * Its format depends on the current platform.
     */
    get HTMLDescription() { // <String>
        let representation = '';
        const code = this.keyCode || '';

        if (code.startsWith('Key')) {
            // Alphanumeric keys can be extracted from the key code
            representation = code.substring(3);
        }
        else if (code.startsWith('Digit')) {
            // Digit keys can also be extracted from the key code
            representation = code.substring(5);
        }
        else {
            // Otherwise use the character code map, defaulting to showing the code otherwise
            representation = _BMKeyboardShortcutCharacterMap[code] || code;
        }

        const isAppleSystem = (navigator.platform.startsWith('Mac') || /iPhone|iPad|iPod/.test(navigator.platform));

        // Add the modifier keys
        if (this.modifiers.includes(BMKeyboardShortcutModifier.System)) {
            if (isAppleSystem) {
                representation = BMHTMLEntity.Command + representation;
            }
            else {
                representation = 'Ctrl + ' + representation;
            }
        }

        if (this.modifiers.includes(BMKeyboardShortcutModifier.Command)) {
            if (isAppleSystem) {
                representation = BMHTMLEntity.Command + representation;
            }
            else {
                representation = 'Win + ' + representation;
            }
        }

        if (this.modifiers.includes(BMKeyboardShortcutModifier.Shift)) {
            if (isAppleSystem) {
                representation = BMHTMLEntity.Shift + representation;
            }
            else {
                representation = 'Shift + ' + representation;
            }
        }
        
        if (this.modifiers.includes(BMKeyboardShortcutModifier.Option)) {
            if (isAppleSystem) {
                representation = BMHTMLEntity.Option + representation;
            }
            else {
                representation = 'Alt + ' + representation;
            }
        }

        if (this.modifiers.includes(BMKeyboardShortcutModifier.Control)) {
            if (isAppleSystem) {
                representation = BMHTMLEntity.Control + representation;
            }
            else {
                representation = 'Ctrl + ' + representation;
            }
        }

        return representation;
    }
};

/**
 * Creates and returns a key sequence initialized with the specified key and optional modifiers.
 * @param key <String>                                              The key that should be pressed for this key sequence.
 *                                                                  This maps to the `code` property of keyboard events.
 * {
 * 	@param modifiers <[BMKeyboardShortcutModifier], nullable>		Defaults to an empty array. An optional array of modifiers
 *                                                                  that must be pressed together with the target key.
 * }
 * @return <BMKeySequence>                                          This key sequence.
 */
BMKeySequence.keySequenceWithKeyCode = function (key, args) {
    return new this().initWithKeyCode(key, args);
};

/**
 * Creates and returns a key sequence initialized with the specified keyboard event, using the event's key code
 * and any active modifier keys. If the event includes the control or command keys, these may be converted
 * into a system key modifier based on the current platform.
 * @param event <KeyboardEvent>         The keyboard event from which this key sequence should be initialized.
 * @return <BMKeySequence>              This key sequence.
 */
BMKeySequence.keySequenceWithKeyboardEvent = function (event) {
    return new this().initWithKeyboardEvent(event);
}

// @endtype

// @type BMKeyboardShortcut

/**
 * A keyboard shortcut object describes the keys that must be pressed for a keyboard shortcut to trigger as
 * well as what should happen when that shortcut is triggered.
 */
export function BMKeyboardShortcut() {} // <constructor>

BMKeyboardShortcut.prototype = {

    /**
     * The key sequence that should be pressed to trigger this keyboard shortcut.
     */
    _keySequence: undefined, // <BMKeySequence>
    get keySequence() {
        return this._keySequence;
    },

    /**
     * The key that should be pressed for this keyboard shortcut.
     */
    get keyCode() { // <String>
        return this._keySequence._key;
    },

    /**
     * An array of keyboard modifiers that must be pressed
     * together with the key in order to trigger the shortcut.
     */
    get modifiers() { // <[BMKeyboardShortcutModifier]>
        if (this._keySequence._modifiers) return this._keySequence._modifiers.slice();
        return [];
    },

    /**
     * A bitmap describing the modifiers that should be active.
     */
    _modifierBitmap: 0, // <Number>

    /**
     * The object which will handle this keyboard shortcut.
     */
    _target: undefined, // <AnyObject>
    get target() {
        return this._target;
    },
    set target(target) {
        this._target = target;
    },

    /**
     * The name of the method that will be invoked on the target object when this keyboard
     * shortcut is triggered. This method will receive the keyboard event that triggered
     * this action as its single parameter.
     */
    _action: undefined, // <String>
    get action() {
        return this._action;
    },
    set action(action) {
        this._action = action;
    },

    /**
     * When set to `YES`, the default action of the event that triggers this keyboard shortcut will be prevented.
     */
    preventsDefault: NO, // <Boolean>

    /**
     * Designated Initializer. Initializes this keyboard shortcut with the specified key sequence and the action that the
     * keyboard shortcut should trigger.
     * @param keySequence <BMKeySequence>               The key sequence describing the keyboard buttons that
     *                                                  should be pressed to trigger this keyboard shortcut.
     * {
     * 	@param target <AnyObject>						The object that will handle this keyboard shortcut action.
     * 	@param action <String>							The name of a method on the target object that will be invoked when this 
     * 													keyboard shortcut is triggered. That method will receive the following arguments:
     * 
     *  - `event`: {@link KeyboardEvent} The keyboard event that triggered the keyboard shortcut
     *  - `{forKeyboardShortcut}`: {@link BMKeyboardShortcut} The associated keyboard shortcut
     *  @param preventsDefault <Boolean, nullable>      Defaults to `NO`. When set to `YES`, the default action of the event that triggers
     *                                                  normally as a result of the key sequence will be prevented.
     * }
     * @return <BMKeyboardShortcut>                     This keyboard shortcut.
     */
    initWithKeySequence(keySequence, {target, action, preventsDefault} = {}) {
        this._keySequence = keySequence;

        this._target = target;
        this._action = action;
        this.preventsDefault = preventsDefault || NO;

        for (const modifier of this.modifiers) {
            this._modifierBitmap = this._modifierBitmap | modifier.value;
        }

        return this;
    },

    /**
     * Initializes this keyboard shortcut with the given key and optional modifiers, as well as
     * the target and action that will handle it.
     * 
     * In order to be triggered, this keyboard shortcut must be registered with an event handler such as a window
     * that can receive keyboard focus and keypress events.
     * @param key <String>                                              The key that should be pressed for this keyboard shortcut. This maps to the `code` property of keyboard events.
     * {
     * 	@param modifiers <[BMKeyboardShortcutModifier], nullable>		Defaults to an empty array. An optional array of keyboard modifiers that must be active.
     * 																	for the keyboard shortcut to fire.
     * 	@param target <AnyObject>						                The object that will handle this keyboard shortcut action.
     * 	@param action <String>							                The name of a method on the target object that will be invoked when this 
     * 													                keyboard shortcut is triggered. That method will receive the following arguments:
     * 
     *  - `event`: {@link KeyboardEvent} The keyboard event that triggered the keyboard shortcut
     *  - `{forKeyboardShortcut}`: {@link BMKeyboardShortcut} The associated keyboard shortcut
     *  @param preventsDefault <Boolean, nullable>                      Defaults to `NO`. When set to `YES`, the default action of the event that triggers
     *                                                                  normally as a result of the key sequence will be prevented.
     * }
     * @return <BMKeyboardShortcut>                                     This keyboard shortcut.
     */
    initWithKeyCode(key, {modifiers, target, action, preventsDefault} = {modifiers: []}) {
        const keySequence = new BMKeySequence().initWithKeyCode(key, {modifiers});
        this._keySequence = keySequence;

        return this.initWithKeySequence(keySequence, {target, action, preventsDefault});
    },

    /**
     * Initializes this keyboard shortcut with the given keyboard event. If the event includes the control or command keys, these may be converted
     * into a system key modifier based on the current platform.
     * @param event <KeyboardEvent>                     The keyboard event from which this keyboard shortcut should be initialized.
     * {
     * 	@param target <AnyObject>						The object that will handle this keyboard shortcut action.
     * 	@param action <String>							The name of a method on the target object that will be invoked when this 
     * 													keyboard shortcut is triggered. That method will receive the following arguments:
     * 
     *  - `event`: {@link KeyboardEvent} The keyboard event that triggered the keyboard shortcut
     *  - `{forKeyboardShortcut}`: {@link BMKeyboardShortcut} The associated keyboard shortcut
     *  @param preventsDefault <Boolean, nullable>      Defaults to `NO`. When set to `YES`, the default action of the event that triggers
     *                                                  normally as a result of the key sequence will be prevented.
     * }
     * @return <BMKeyboardShortcut>                                     This keyboard shortcut.
     */
    initWithKeyboardEvent(event, {target, action, preventsDefault} = {}) {
        const keySequence = new BMKeySequence().initWithKeyboardEvent(event);

        return this.initWithKeySequence(keySequence, {target, action, preventsDefault});
    },

    /**
     * Initializes this keyboard shortcut with the given serialized object representation. A callback is used to
     * convert from the target object ID to an actual target object.
     * @param shortcut <Object>                 A serialized keyboard shortcut.
     * {
     *  @param targetID <Object ^(String)>      A callback that is invoked with the target ID and should return
     *                                          the target object which will handle the keyboard shortcut.
     * }
     * @returns <BMKeyboardShortcut>            This keyboard shortcut.
     */
    initWithSerializedKeyboardShortcut(shortcut, {targetID: resolver}) {
        if (shortcut._class != 'BMKeyboardShortcut') {
            throw new Error(`Unknown keyboard shortcut class - "${shortcut._class}"`);
        }

        const target = resolver(shortcut._targetID);

        const modifierValues = Object.values(BMKeyboardShortcutModifier);
        const modifiers = shortcut._modifiers.map(modifier => {
            return modifierValues.find(m => m.key == modifier)
        });

        return this.initWithKeyCode(shortcut._key, {modifiers, target, action: shortcut._action, preventsDefault: shortcut._preventsDefault});
    },

    /**
     * Returns an object representation of this keyboard shortcut that can be used with `JSON.stringify` to 
     * serialize this keyboard shortcut.
     * @param ID <String>           A string that identifies the target object and can be used when recreating
     *                              the keyboard shortcut instance.
     * @returns <Object>            An object that can be used with `JSON.stringify`.
     */
    serializedKeyboardShortcutWithTargetID(ID) {
        return {
            _class: `BMKeyboardShortcut`,
            _key: this.keyCode,
            _modifiers: this.modifiers.map(m => m.key),
            _targetID: ID,
            _action: this._action,
            _preventsDefault: this.preventsDefault,
        };
    }

};

/**
 * Constructs and returns a keyboard shortcut with the specified key sequence and action that will be triggered
 * by the keyboard shortcut.
 * @param keySequence <BMKeySequence>                   The key sequence describing the keys that should be pressed to
 *                                                      trigger this shortcut.s
 * {
 * 	@param target <AnyObject>						    The object that will handle this keyboard shortcut action.
 * 	@param action <String>							    The name of a method on the target object that will be invoked when this 
 * 													    keyboard shortcut is triggered. That method will receive the following arguments:
 * 
 *  - `event`: {@link KeyboardEvent} The keyboard event that triggered the keyboard shortcut
 *  - `{forKeyboardShortcut}`: {@link BMKeyboardShortcut} The associated keyboard shortcut
 *  @param preventsDefault <Boolean, nullable>          Defaults to `NO`. When set to `YES`, the default action of the event that triggers
 *                                                      normally as a result of the key sequence will be prevented.
 * }
 * @return <BMKeyboardShortcut>                         A keyboard shortcut.
 */
BMKeyboardShortcut.keyboardShortcutWithKeySequence = function (event, args) {
    return (new BMKeyboardShortcut).initWithKeySequence(event, args);
};

/**
 * Constructs and returns a keyboard shortcut with the given key and optional modifiers, as well as
 * the target and action that will handle it.
 * 
 * In order to be triggered, this keyboard shortcut must be registered with an event handler such as a window
 * that can receive keyboard focus and keypress events.
 * @param key <String>                                              The key that should be pressed for this keyboard shortcut. This maps to the `code` property of keyboard events.
 * {
 * 	@param modifiers <[BMKeyboardShortcutModifier], nullable>		Defaults to an empty array. An optional array of keyboard modifiers that must be active.
 * 																	for the keyboard shortcut to fire.
 * 	@param target <AnyObject>						                The object that will handle this keyboard shortcut action.
 * 	@param action <String>							                The name of a method on the target object that will be invoked when this 
 * 													                keyboard shortcut is triggered. That method will receive the following arguments:
 * 
 *  - `event`: {@link KeyboardEvent} The keyboard event that triggered the keyboard shortcut
 *  - `{forKeyboardShortcut}`: {@link BMKeyboardShortcut} The associated keyboard shortcut
 *  @param preventsDefault <Boolean, nullable>                      Defaults to `NO`. When set to `YES`, the default action of the event that triggers
 *                                                                  normally as a result of the key sequence will be prevented.
 * }
 * @return <BMKeyboardShortcut>                                     A keyboard shortcut.
 */
BMKeyboardShortcut.keyboardShortcutWithKeyCode = function (key, args) {
    return (new BMKeyboardShortcut).initWithKeyCode(key, args);
};

/**
 * Constructs and returns a keyboard shortcut with the given keyboard event. If the event includes the control or command keys, these may be converted
 * into a system key modifier based on the current platform.
 * @param event <KeyboardEvent>                         The keyboard event from which this keyboard shortcut should be initialized.
 * {
 * 	@param target <AnyObject>						    The object that will handle this keyboard shortcut action.
 * 	@param action <String>							    The name of a method on the target object that will be invoked when this 
 * 													    keyboard shortcut is triggered. That method will receive the following arguments:
 * 
 *  - `event`: {@link KeyboardEvent} The keyboard event that triggered the keyboard shortcut
 *  - `{forKeyboardShortcut}`: {@link BMKeyboardShortcut} The associated keyboard shortcut
 *  @param preventsDefault <Boolean, nullable>          Defaults to `NO`. When set to `YES`, the default action of the event that triggers
 *                                                      normally as a result of the key sequence will be prevented.
 * }
 * @return <BMKeyboardShortcut>                         A keyboard shortcut.
 */
BMKeyboardShortcut.keyboardShortcutWithKeyboardEvent = function (event, args) {
    return (new BMKeyboardShortcut).initWithKeyboardEvent(event, args);
};

/**
 * Constructs and returns keyboard shortcut with the given serialized object representation. A callback is used to
 * convert from the target object ID to an actual target object.
 * @param shortcut <Object>                 A serialized keyboard shortcut.
 * {
 *  @param targetID <Object ^(String)>      A callback that is invoked with the target ID and should return
 *                                          the target object which will handle the keyboard shortcut.
 * }
 * @returns <BMKeyboardShortcut, nullable>  A keyboard shortcut.
 */
BMKeyboardShortcut.keyboardShortcutWithSerializedKeyboardShortcut = function (shortcut, args) {
    return (new BMKeyboardShortcut).initWithSerializedKeyboardShortcut(shortcut, args);
};

// @endtype
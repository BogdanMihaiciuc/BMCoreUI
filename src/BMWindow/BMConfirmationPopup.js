// @ts-check

import { BMRectMake } from "../Core/BMRect";
import { BMExtend, NO, YES } from "../Core/BMCoreUI";
import { BMWindow } from "./BMWindow";
import { BMView } from "../BMView/BMView_v2.5";
import { BMLayoutAttribute } from "../BMView/BMLayoutConstraint_v2.5";
import { BMKeyboardShortcut } from "./BMKeyboardShortcut";



// @type BMConfirmationPopupResult

/**
 * A series of constants describing which action the user has taken in reponse
 * to a confirmation popup.
 */
export const BMConfirmationPopupResult = Object.freeze({ // <enum>

    /**
     * Indicates that the user hasn't yet taken a decision.
     */
    Undecided: {}, // <enum>

    /**
     * Indicates that the user has selected the "Cancel" button or closed the confirmation popup.
     */
    Cancelled: {}, // <enum>

    /**
     * Indicates that the user has selected the negative action.
     */
    Declined: {}, // <enum>

    /**
     * Indicates that the user has selected the positive action.
     */
    Confirmed: {} // <enum>


});

// @endtype

// @type BMAlertPopup extends BMWindow

/**
 * A sublcass of `BMAlertPopup` that is specialized for displaying an alert popup with a title, a text message and
 * a confirmation button.
 * 
 * To create a alert popup, use the static `alertPopupWithTitle(_, {})` method.
 * 
 * You can display your confirmation popup using the usual `bringToFrontAnimated(_)` method, but for convenience you can also
 * use the `confirm()` method that returns a promise which resolves when the user dismisses the alert.
 */
export function BMAlertPopup() {} // <constructor>


BMAlertPopup.prototype = BMExtend(Object.create(BMWindow.prototype), {

    /**
     * Represents the action that the user has taken.
     */
    _result: BMConfirmationPopupResult.Undecided, // <BMConfirmationPopupResult>

    get result() {
        return this._result;
    },

    /**
     * A promise that resolves when the user takes a decision in response to this
     * popup. The value returned when the promise resolves will never be `.Undecided`.
     */
    _resolution: undefined, // <Promise<BMConfirmationPopupResult>>

    get resolution() {
        return this._resolution;
    },

    /**
     * Used to resolve the `resolution` promise.
     */
    _resolve: undefined, // <void ^ (BMConfirmationPopupResult)>

    /**
     * The popup's title. Ideally this should be used to provide a succint description
     * of what the user confirms.
     */
    _title: undefined, // <String>

    get title() {
        return this._title;
    },

    set title(title) {
        if (title == this._title) return;

        this._title = title;

        if (this._titleView) {
            this._titleView.node.innerText = title;
            this._titleView.invalidateIntrinsicSize();
        }
    },

    /**
     * The popup's body text. Ideally this should be used to provide additional information about
     * the action that is about to occur.
     */
    _text: undefined, // <String>

    get text() {
        return this._text;
    },

    set text(text) {
        if (text == this._text) return;

        this._text = text;

        if (this._textView) {
            this._textView.node.innerText = text;
            this._textView.invalidateIntrinsicSize();
        }
    },


    /**
     * The popup's body text. Ideally this should be used to provide additional information about
     * the action that is about to occur. Unlike `text`, setting this property will not convert HTML tags to text.
     */
    get HTML() { // <String>
        return this._text;
    },

    set HTML(text) {
        if (text == this._text) return;

        this._text = text;

        if (this._textView) {
            this._textView.node.innerHTML = text;
            this._textView.invalidateIntrinsicSize();
        }
    },

    /**
     * The text to use for the alert's button.
     */
    _positiveActionText: undefined, // <String>

    get positiveActionText() {
        return this._positiveActionText;
    },

    set positiveActionText(text) {
        if (text == this._positiveActionText) return;

        this._positiveActionText = text;

        if (this._positiveActionButton) {
            this._positiveActionButton.node.innerText = text;
            this._positiveActionButton.invalidateIntrinsicSize();
        }
    },

    // @override - BMWindow
    get frameSizePriority() {
        return 1;
    },

    // @override - BMWindow
    get frameHorizontalPositionLayoutAttribute() {
        return BMLayoutAttribute.CenterX;
    },

    // @override - BMWindow
    get frameVerticalPositionLayoutAttribute() {
        return BMLayoutAttribute.CenterY;
    },

    /**
     * The DOM node that was focused when this alert was opened.
     */
    _previouslyActiveNode: undefined, // <DOMNode>

    /**
     * A handler that is invoked when the window resizes, used to reposition this window.
     */
    _centerHandler: undefined, // <void ^()>

    /**
     * Designated initializer. Initializes this alert popup with the given labels.
     * @param title <String>                    The popup's title.
     * {
     *  @param text <String>                    The popup's body text.
     *  @param actionText <String, nullable>    Defaults to `OK`. The text to display on the action button.
     * }
     * @return <BMAlertPopup>                   This alert popup.
     */
    initWithTitle(title, {text, actionText = 'OK'}) {
        const frame = BMRectMake(0, 0, 0, 0);

        BMWindow.prototype.initWithFrame.call(this, frame);

        this.contentView.contentNode.classList.add('BMWindowBackground');

        this._resolution = new Promise(resolve => {
            this._resolve = resolve;
        });

        this._title = title;
        this._text = text;
        this._positiveActionText = actionText;

        // Title View

        this._titleView = BMView.view();
        this._titleView.supportsAutomaticIntrinsicSize = YES;
        this._titleView.node.classList.add('BMTitle');
        this._titleView.node.innerText = title;

        this.contentView.addSubview(this._titleView);
        this._titleView.leading.equalTo(this.contentView.leading, {plus: 32}).isActive = YES;
        this._titleView.top.equalTo(this.contentView.top, {plus: 32}).isActive = YES;
        this._titleView.trailing.lessThanOrEqualTo(this.contentView.trailing, {plus: -32}).isActive = YES;


        // Body

        this._textView = BMView.view();
        this._textView.supportsAutomaticIntrinsicSize = YES;
        this._textView.node.classList.add('BMLabel');
        this._textView.node.innerText = text;

        this.contentView.addSubview(this._textView);
        this._textView.leading.equalTo(this._titleView.leading).isActive = YES;
        this._textView.top.equalTo(this._titleView.bottom, {plus: 32}).isActive = YES;
        this._textView.trailing.lessThanOrEqualTo(this.contentView.trailing, {plus: -32}).isActive = YES;


        // Positive button

        this._positiveActionButton = BMView.view();
        this._positiveActionButton.supportsAutomaticIntrinsicSize = YES;
        this._positiveActionButton.node.classList.add('BMButton');
        this._positiveActionButton.node.innerText = actionText;

        this.contentView.addSubview(this._positiveActionButton);
        this._positiveActionButton.trailing.equalTo(this.contentView.trailing, {plus: -32}).isActive = YES;
        this._positiveActionButton.bottom.equalTo(this.contentView.bottom, {plus: -32}).isActive = YES;
        this._positiveActionButton.top.equalTo(this._textView.bottom, {plus: 64}).isActive = YES;

        this._positiveActionButton.node.addEventListener('click', event => this._confirm());

        this.registerKeyboardShortcut(BMKeyboardShortcut.keyboardShortcutWithKeyCode('Enter', {target: this, action: '_confirm'}));

        const escapeKeyboardShortcut = BMKeyboardShortcut.keyboardShortcutWithKeyCode('Escape', {target: this, action: '_escape'});
        escapeKeyboardShortcut.preventsDefault = YES;
        this.registerKeyboardShortcut(escapeKeyboardShortcut);

        this._previouslyActiveNode = document.activeElement;

        return this;
    },
    /**
     * Confirms the action, then dismisses this confirmation popup.
     * If the result is already settled, this method will have no effect.
     */
    _escape() {
        this._confirm();
    },

    /**
     * Confirms the action, then dismisses this confirmation popup.
     * If the result is already settled, this method will have no effect.
     */
    _confirm() {
        if (this._result == BMConfirmationPopupResult.Undecided) {
            this._result = BMConfirmationPopupResult.Confirmed;
            this._resolve(BMConfirmationPopupResult.Confirmed);

            this.dismissAnimated(YES);
        }
    },

    /**
     * Shows this confirmation window on screen, then returns a promise that resolves when the user takes an
     * action in response.
     * @return <Promise<BMConfirmationPopupResult>>     A promise that resolves with the user's action.
     */
    confirm() {
        this.bringToFrontAnimated(YES);

        return this._resolution;
    },

    // @override - BMWindow
    bringToFrontAnimated() {
        this._resizeHandler = () => this.needsLayout = YES;

        window.addEventListener('resize', this._resizeHandler);

        return BMWindow.prototype.bringToFrontAnimated.apply(this, arguments);
    },

    // @override - BMWindow
    dismissAnimated() {
        // Since the window can be dismissed by clicking outside in certain cases, this would be equivalent to pressing "OK".
        if (this._result == BMConfirmationPopupResult.Undecided) {
            this._result = BMConfirmationPopupResult.Confirmed;
            this._resolve(BMConfirmationPopupResult.Confirmed);
        }

        if (this._previouslyActiveNode) {
            this._previouslyActiveNode.focus();
        }

        window.removeEventListener('resize', this._resizeHandler);

        return BMWindow.prototype.dismissAnimated.apply(this, arguments);
    },

    windowDidClose() {
        this.release();
    }

});

/**
 * Constructs and returns an alert popup that is initialized with the given title, text and button labels.
 * @param title <String>                    The popup's title.
 * {
 *  @param text <String>                    The popup's body text.
 *  @param actionText <String, nullable>    Defaults to `"OK"`. The text to display on the positive action button.
 * }
 * @return <BMAlertPopup>                   An alert popup.
 */
BMAlertPopup.alertPopupWithTitle = function (title, {text, actionText = 'OK'}) {
    return (new BMAlertPopup).initWithTitle(title, {text, actionText});
}

// @endtype

// @type BMConfirmationPopup extends BMAlertPopup

/**
 * A sublcass of `BMAlertPopup` that is specialized for displaying a confirmation popup with a title, a text message and
 * a series of buttons that can be used to easily request and handle confirmation for potentially dangerous actions.
 * 
 * To create a confirmation popup, use the static `confirmationPopupWithTitle(_, {})` method.
 * 
 * You can display your confirmation popup using the usual `bringToFrontAnimated(_)` method, but for convenience you can also
 * use the `confirm()` method that returns a promise which resolves when the user takes a decision.
 */
export function BMConfirmationPopup() {} // <constructor>

BMConfirmationPopup.prototype = BMExtend(Object.create(BMAlertPopup.prototype), {

    /**
     * The text to use for the positive button.
     */
    _negativeActionText: undefined, // <String>

    get negativeActionText() {
        return this._negativeActionText;
    },

    set negativeActionText(text) {
        if (text == this._negativeActionText) return;

        this._negativeActionText = text;

        if (this._negativeActionButton) {
            this._negativeActionButton.node.innerText = text;
            this._negativeActionButton.invalidateIntrinsicSize();
        }
    },

    /**
     * Controls whether a "Cancel" button will be available on this confirmation popup.
     */
    _showsCancelButton: NO, // <Boolean>

    get showsCancelButton() {
        return this._showsCancelButton;
    },

    set showsCancelButton(shows) {
        this._showsCancelButton = shows;

        if (this._cancelButton) {
            this._cancelButton.isVisible = shows;
        }
    },

    /**
     * Designated initializer. Initializes this confirmation popup with the given labels.
     * @param title <String>                    The popup's title.
     * {
     *  @param text <String>                    The popup's body text.
     *  @param positiveActionText <String>      The text to display on the positive action button.
     *  @param negativeActionText <String>      The text to display on the negative action button.
     * }
     * @return <BMConfirmationPopup>            This confirmation popup.
     */
    initWithTitle(title, {text, positiveActionText, negativeActionText}) {
        BMAlertPopup.prototype.initWithTitle.call(this, title, {text, actionText: positiveActionText});

        this._negativeActionText = negativeActionText;

        // Negative button

        this._negativeActionButton = BMView.view();
        this._negativeActionButton.supportsAutomaticIntrinsicSize = YES;
        this._negativeActionButton.node.classList.add('BMButton', 'BMButtonWeak');
        this._negativeActionButton.node.innerText = negativeActionText;

        this.contentView.addSubview(this._negativeActionButton);
        this._negativeActionButton.leading.equalTo(this.contentView.leading, {plus: 32}).isActive = YES;
        this._negativeActionButton.bottom.equalTo(this.contentView.bottom, {plus: -32}).isActive = YES;
        this._negativeActionButton.top.equalTo(this._textView.bottom, {plus: 64}).isActive = YES;

        this._negativeActionButton.node.addEventListener('click', event => this._decline());


        // Cancel button

        this._cancelButton = BMView.view();
        this._cancelButton.supportsAutomaticIntrinsicSize = YES;
        this._cancelButton.node.classList.add('BMButton', 'BMButtonWeak');
        this._cancelButton.node.innerText = 'Cancel';
        this._cancelButton.isVisible = NO;

        this.contentView.addSubview(this._cancelButton);
        this._cancelButton.trailing.equalTo(this._positiveActionButton.leading, {plus: -32}).isActive = YES;
        this._cancelButton.bottom.equalTo(this.contentView.bottom, {plus: -32}).isActive = YES;
        this._cancelButton.top.equalTo(this._textView.bottom, {plus: 64}).isActive = YES;
        this._cancelButton.leading.greaterThanOrEqualTo(this._negativeActionButton.trailing, {plus: 64}).isActive = YES;

        this._cancelButton.node.addEventListener('click', event => this._cancel());

        return this;
    },

    _escape() {
        if (this._showsCancelButton) {
            this._cancel();
        }
        else {
            this._decline();
        }
    },

    /**
     * Declines the action, then dismisses this confirmation popup.
     * If the result is already settled, this method will have no effect.
     */
    _decline() {
        if (this._result == BMConfirmationPopupResult.Undecided) {
            this._result = BMConfirmationPopupResult.Declined;
            this._resolve(BMConfirmationPopupResult.Declined);

            this.dismissAnimated(YES);
        }
    },

    /**
     * Cancels the action, then dismisses this confirmation popup.
     * If the result is already settled, this method will have no effect.
     */
    _cancel() {
        if (this._result == BMConfirmationPopupResult.Undecided) {
            this._result = BMConfirmationPopupResult.Cancelled;
            this._resolve(BMConfirmationPopupResult.Cancelled);

            this.dismissAnimated(YES);
        }
    },

    // @override - BMWindow
    dismissAnimated() {
        // Since the window can be dismissed by clicking outside in certain cases, this would be equivalent to pressing "Cancel".
        if (this._result == BMConfirmationPopupResult.Undecided) {
            this._result = BMConfirmationPopupResult.Cancelled;
            this._resolve(BMConfirmationPopupResult.Cancelled);
        }

        if (this._previouslyActiveNode) {
            this._previouslyActiveNode.focus();
        }

        return BMWindow.prototype.dismissAnimated.apply(this, arguments);
    }

});

/**
 * Constructs and returns a confirmation popup that is initialized with the given title, text and button labels.
 * @param title <String>                    The popup's title.
 * {
 *  @param text <String>                    The popup's body text.
 *  @param positiveActionText <String>      The text to display on the positive action button.
 *  @param negativeActionText <String>      The text to display on the negative action button.
 * }
 * @return <BMConfirmationPopup>            A confirmation popup.
 */
BMConfirmationPopup.confirmationPopupWithTitle = function (title, {text, positiveActionText, negativeActionText}) {
    return (new BMConfirmationPopup).initWithTitle(title, {text, positiveActionText, negativeActionText});
}

// @endtype
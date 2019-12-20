import { BMExtend, NO } from "../Core/BMCoreUI";
import { BMView } from "./BMView_v2.5";
import { BMMenuKind } from "./BMMenu";

// @ts-check

// @type BMTextField

/**
 * A text field is a vew wrapper around an `input` type `"text"` element that adds additional
 * functionalities such as a drop-down with suggestions and auto completion.
 */
export function BMTextField() {} // <constructor>

BMTextField.prototype = BMExtend(Object.create(BMView.prototype), {
    constructor: BMTextField,

    // @override - BMView
    supportsAutomaticIntrinsicSize: NO,

    // @override - BMView
    supportsIntrinsicSize: NO,

    /**
     * Used to control whether this text field autocompletes based on suggestions obtained from its delegate object.
     * When this property is set to `YES`, whenever the text that the user is typing matches one of the suggestions
     * the rest of the text will be automatically filled in and selected.
     * 
     * When this property is set to `NO`, suggestions will still appear as a drop down menu, but the text will not be automatically completed.
     */
    _autoCompletes: YES, // <Boolean>
    get autoCompletes() {
        return this._autoCompletes;
    },
    set autoCompletes(completes) {
        this._autoCompletes = completes;
    },

    /**
     * Used to control whether this text field supports suggestions that appear for the user as they are typing in this text field.
     * When this property is set to `YES`, if there are any suggestions obtained from the delegate object, the matching ones will appear
     * as a drop down below the text field. The text field will automatically select the first matching suggestion and fill it in if the user
     * presses the `return` key.
     * 
     * When this property is set to `NO`, suggestions will be unavailable. This will also disable auto completion.
     */
    _usesSuggestions: YES, // <Boolean>
    get usesSuggestions() {
        return this._usesSuggestions;
    },
    set usesSuggestions(uses) {
        if (uses != this._usesSuggestions) {
            this._usesSuggestions = uses;

            if (uses) {
                this._setUpEventHandlers();
            }
            else {
                this._clearEventHandlers();
            }
        }
    },

    /**
     * An optional delegate that can be used to respond to various callbacks from the text field.
     */
    delegate: undefined, // <BMTextFieldDelegate, nullable>

    // @override - BMView
    initWithDOMNode(node) {
        BMView.prototype.initWithDOMNode.apply(this, arguments);

        if (this._usesSuggestions) this._setUpEventHandlers();

        return this;
    },

    /**
     * The focus event listener.
     */
    _focusHandler: undefined, // <Promise<void> ^(Event)>

    /**
     * The focus event listener.
     */
    _blurHandler: undefined, // <void ^(Event)>

    /**
     * The focus event listener.
     */
    _keydownHandler: undefined, // <void ^(Event)>

    /**
     * The focus event listener.
     */
    _inputHandler: undefined, // <void ^(Event)>

    /**
     * Sets up the event handlers for this text field to handle suggestions.
     */
    _setUpEventHandlers() {
        /** @type {HTMLInputElement} */ const inputNode = this.node;

        // This array contains all the available layout variables and is initialized upon the input
        // element acquiring keyboard focus
        let suggestions = [];
        // This array contains the layout variables that match the text contained within the input element
        let filteredSuggestions = [];
        // The popup menu displaying the filtered suggestions
        let menu;
        // The index of the top hit suggestion. An index of -1 represents no top hit.
        let highlightedItemIndex;

        // TODO: Consider encapsulating this functionality into a separate auto-complete text box class
        inputNode.addEventListener('focus', this._focusHandler = async event => {
            // If suggestions are not enabled, no additional action is required
            if (!this._usesSuggestions) return;

            // TODO: Consider whether this is appropriate for this class
            // Select all content upon receiving focus
            // inputNode.select();

            let options = [];

            if (this.delegate && this.delegate.textFieldSuggestionsForText) {
                suggestions = this.delegate.textFieldSuggestionsForText(this, this.value);
            }
            else return;

            filteredSuggestions = suggestions;
            highlightedItemIndex = -1;

            for (const option of suggestions) {
                options.push(this._menuItemWithLabel(option, {action: () => {
                    menu = undefined;
                    inputNode.value = option;
                    inputNode.dispatchEvent(new Event('input'));

                    // Remove focus from the text box upon selecting a value
                    inputNode.blur();
                }}));
            }

            // Create and show a pulldown menu below the constant textbox, if there are any suggestions
            let menuShouldDisplay = YES;
            if (this.delegate.textFieldShouldShowSuggestions) {
                menuShouldDisplay = this.delegate.textFieldShouldShowSuggestions(this);
            }

            if (menuShouldDisplay && suggestions.length) {
                let frame = BMRectMakeWithNodeFrame(inputNode);
                let point = BMPointMake(frame.origin.x, frame.bottom);
                menu = this._showMenuAtPoint(point, {withOptions: options, kind: BMMenuKind.PullDownMenu});
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

        // The backspace and delete keys are not identifiable in input events
        // So they are detected on keydown prior to the input event occurring
        let isBackspaceInput = NO;

        inputNode.addEventListener('keydown', this._keydownHandler = event => {
            // If suggestions are not enabled, no additional action is required
            if (!this._usesSuggestions) return;

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

                // Move the menu highlight
                if (menu) {
                    // Remove the highlighted class from the previously selected item
                    for (const element of menu.querySelectorAll('.BMLayoutEditorConstraintPopupOptionHighlighted')) {
                        element.classList.remove('BMLayoutEditorConstraintPopupOptionHighlighted');
                    }

                    // Highlight the current item
                    menu.childNodes[highlightedItemIndex].classList.add('BMLayoutEditorConstraintPopupOptionHighlighted');
                }

            }

            if (event.code == 'Enter') {
                // Upon pressing the enter key, select the currently highlighted item, if available
                // then remove focus from the constant box
                let performAutocomplete = NO;
                if (!isNaN(highlightedItemIndex) && filteredSuggestions.length && filteredSuggestions[highlightedItemIndex]) {
                    if (this.delegate && this.delegate.textFieldShouldAutocompleteText) {
                        performAutocomplete = this.delegate.textFieldShouldAutocompleteText(this, inputNode.value, {withSuggestion: filteredSuggestions[highlightedItemIndex]});
                    }

                    if (performAutocomplete) {
                        inputNode.value = filteredSuggestions[highlightedItemIndex];
                        inputNode.dispatchEvent(new Event('input'));
                    }
                }

                inputNode.blur();
            }

            if (event.code == 'Backspace' || event.code == 'Delete') {
                isBackspaceInput = YES;
            }
            
        });

        inputNode.addEventListener('input', this._inputHandler = event => {
            // If suggestions are not enabled, no additional action is required
            if (!this._usesSuggestions) return;

            // Request new suggestions from the delegate for the new text
            if (this.delegate && this.delegate.textFieldSuggestionsForText) {
                suggestions = this.delegate.textFieldSuggestionsForText(this, this.value);
            }

            // If the menu is visible, filter it accordingly
            filteredSuggestions = suggestions.filter(e => e.toLowerCase().startsWith(inputNode.value.toLowerCase()));
            
            // Empty the menu
            if (menu) menu.innerHTML = '';

            // Reset the highlighted item index
            highlightedItemIndex = 0;

            // Then add the filtered options
            if (menu) for (const option of filteredSuggestions) {
                menu.appendChild(this.layoutEditor.constraintOptionWithLabel(option, {action: () => {
                    menu = undefined;
                    inputNode.value = option;
                    inputNode.dispatchEvent(new Event('input'));
                }}));
            }

            // Highlight the first item
            if (filteredSuggestions.length) {
                if (menu) {
                    menu.childNodes[0].classList.add('BMLayoutEditorConstraintPopupOptionHighlighted');
                    menu.style.display = 'block';
                }

                // Autocomplete the suggestion, if the caret is at the end of the text field
                // and if this input isn't the result of pressing backspace or delete
                if (this._autoCompletes && !isBackspaceInput) {
                    const selectionStart = inputNode.selectionStart;
                    if (selectionStart == inputNode.value.length) {
                        inputNode.value = filteredSuggestions[0];
                        // Select the remainder of the suggestion
                        inputNode.setSelectionRange(selectionStart, inputNode.value.length, "backward");
                    }
                }

                // Clear the backspace flag upon processing it once
                if (isBackspaceInput) {
                    isBackspaceInput = NO;
                }
            }
            else {
                if (menu) menu.style.display = 'none';
            }
        });

        // Upon the value box losing focus, dismiss the menu, if it was open
        // unless the newly focused item is a descendant of the menu
        inputNode.addEventListener('blur', this._blurHandler = event => {
            if (menu) {
                menu.parentNode.dispatchEvent(new Event('click'));
            }
        });
    },

    /**
     * Clears the event handlers for this text field when suggestions are disabled.
     */
    _clearEventHandlers() {
        this.node.removeEventListener('focus', this._focusHandler);
        this.node.removeEventListener('blur', this._blurHandler);
        this.node.removeEventListener('keydown', this._keydownHandler);
        this.node.removeEventListener('input', this._inputHandler);
    },

    /**
     * Constructs and returns a DOM node for a menu item with the given label.
     * @param label <String>                The text to display in the menu item.
     * {
     *  @param action <void ^(Event)>       An action that occurs when the menu item is selected.
     * }
     * @return <DOMNode>                    A DOM node to be added to a menu.
     */
    _menuItemWithLabel(label, args) {
        // TODO: Roll up into BMMenu
        let option = document.createElement('div');
        option.className = 'BMLayoutEditorConstraintPopupOption';
        option.innerText = label;

        option.addEventListener('click', args.action);

        return option;
    },



    /**
     * Creates and brings up a context menu at the given coordinates, relative to the viewport.
     * @param point <BMPoint>               The point at which to show the menu.
     * {
     *  @param withOptions <[DOMNode]>      The options that the menu should display.
     *  @param kind <BMMenuKind, nullable>  Defaults to .Menu. The kind of menu to show.
     * }
     * @return <DOMNode>                    The menu element.
     */
    _showMenuAtPoint(point, args) {
        // TODO: Roll up into BMMenu
        let constraintPopup = document.createElement('div');
        constraintPopup.className = 'BMLayoutEditorConstraintPopup';

        let constraintPopupContainer = document.createElement('div');
        constraintPopupContainer.className = 'BMLayoutEditorConstraintPopupContainer';
        if (!('backdropFilter' in document.body.style) && !('webkitBackdropFilter' in document.body.style)) {
            constraintPopup.style.backgroundColor = 'white';
        }
        constraintPopupContainer.appendChild(constraintPopup);

        args.withOptions.forEach(item => constraintPopup.appendChild(item));

        BMHook(constraintPopup, {scaleX: args.kind == BMMenuKind.PullDownMenu ? 1 : .75, scaleY: .75, opacity: 0});

        document.body.appendChild(constraintPopupContainer);

        let height = constraintPopup.offsetHeight;

        constraintPopup.style.transformOrigin = '0% 0%';
        if (args.kind == BMMenuKind.PullDownMenu) {
            constraintPopup.style.transformOrigin = '50% 0%';
        }
        if (height + point.y > document.documentElement.clientHeight) {
            constraintPopup.style.transformOrigin = '0% 100%';
            if (args.kind == BMMenuKind.PullDownMenu) {
                constraintPopup.style.transformOrigin = '50% 100%';
            }
            point.y -= height;
        }

        constraintPopup.style.left = point.x + 'px';
        constraintPopup.style.top = point.y + 'px';

        constraintPopup.addEventListener('click', event => event.preventDefault());

        (window.Velocity || $.Velocity).animate(constraintPopup, {scaleX: 1, scaleY: 1, opacity: 1, translateZ: 0}, {
            duration: 200,
            easing: 'easeOutQuad',
            complete: _ => ((constraintPopup.style.pointerEvents = 'all'), constraintPopupContainer.style.pointerEvents = 'all')
        });

        let delay = 0;
        for (let child of constraintPopup.childNodes) {
            BMHook(child, {translateY: '16px', translateZ: 0, opacity: 0});
            (window.Velocity || $.Velocity).animate(child, {translateY: '0px', translateZ: 0, opacity: 1}, {
                duration: 100,
                easing: 'easeOutQuad',
                delay: delay
            });
            delay += 16;
        }

        constraintPopupContainer.addEventListener('click', event => {
            constraintPopup.style.pointerEvents = 'none'; 
            constraintPopupContainer.style.pointerEvents = 'none';
            let delay = constraintPopup.childNodes.length * 16 + 100 - 200;
            delay = (delay < 0 ? 0 : delay);

            (window.Velocity || $.Velocity).animate(constraintPopup, {scaleX: args.kind == BMMenuKind.PullDownMenu ? 1 : .75, scaleY: .75, opacity: 0, translateZ: 0}, {
                duration: 200,
                easing: 'easeInQuad',
                delay: delay,
                complete: _ => constraintPopupContainer.remove()
            });

            delay = 0;
            for (let i = constraintPopup.childNodes.length - 1; i >= 0; i--) {
                let child = constraintPopup.childNodes[i];
                (window.Velocity || $.Velocity).animate(child, {translateY: '16px', translateZ: 0, opacity: 0}, {
                    duration: 100,
                    easing: 'easeInQuad',
                    delay: delay
                });
                delay += 16;
            }
        });

        return constraintPopup;
    }

});

/**
 * Constructs and returns a text field with a new DOM node.
 * @return <BMTextField>        A text field.
 */
BMTextField.textField = function () {
    const node = document.createElement('input');
    node.type = 'text';

    const textField = Object.create(BMTextField.prototype).initWithDOMNode(node);

    return textField;
}

/**
 * Constructs and returns a text field for the given input DOM node.
 * @param <DOMNode> node        An input DOM node.
 * @return <BMTextField>        A text field.
 */
BMTextField.textFieldForInputNode = function (node) {
    return Object.create(BMTextField.prototype).initWithDOMNode(node);
}

// @endtype
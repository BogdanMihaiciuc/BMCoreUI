// @type interface BMTextFieldDelegate

/**
 * The specification for a `BMTextField` object, which can optionally be used in conjunction with `BMTextField` objects and will receive various
 * callbacks related to the text field's lifecycle.
 */
function BMTextFieldDelegate() {} // <constructor>

BMTextFieldDelegate.prototype = {
	
	/**
	 * Invoked by text fields to retrieve the available suggestions for autocomplete for the given text.
     * This method should return the full list of suggestions available for the given text. The text field will further filter out the suggestions 
     * based on the text that the user has typed.
     * 
     * If this method is not implemented, suggestions and autocomplete will not be available.
	 * @param textField <BMTextField>		The calling text field.
     * @param text <String>                 
     * @return <[String]>                   An array of string suggestions.
	 */
    textFieldSuggestionsForText(textField, text) {},
    
    /**
     * Invoked whenever the text field is about to show the suggestions drop down, if suggestions are available.
     * Delegate objects can implement this method to control whether the drop down should be displayed.
     * 
     * If this method is not implemented, the suggestions drop down will be displayed whenever appropriate.
	 * @param textField <BMTextField>		The calling text field.
     * @return <Boolean>                    `YES` if the suggestions drop down should appear, `NO` otherwise.
     */
    textFieldShouldShowSuggestions(textField) {},

    /**
     * Invoked whenever the text field is about to autocomplete the text with the given suggestion. This occurs when the
     * user presses the return key.
     * Delegate objects can implement this method to control whether the autocomplete should be performed.
     * 
     * If autocomplete is enabled and this method is not implemented, the autocomplete will not be performed.
     * @param textField <BMTextField>       The calling text field.
     * @param text <String>                 The text that has been typed in this text field.
     * {
     *  @param withSuggestion <String>      The suggestion 
     * }
     */
    textFieldShouldAutocompleteText(textField, text, {withSuggestion}) {},

    /**
     * Invoked whenever the contents in this text field change for any reason. This can be because of an input event,
     * the user pasting text or a suggestion being selected.
     * 
     * Delegate objects can implement this method in place of standard event listeners to handle changes to this text field.
     * @param textField 
     */
    textFieldContentsDidChange(textField) {},

};

// @endtype
// @type interface BMMenuDelegate

/**
 * The specification for a `BMMenuDelegate` object, which can optionally be used in conjunction with `BMTextField` objects and will receive various
 * callbacks related to the text field's lifecycle.
 */
function BMMenuDelegate() {} // <constructor>

BMMenuDelegate.prototype = {

    /**
     * Invoked by menus when they are about to be opened. This method is invoked before
     * any associated animation runs and before the actual content is rendered.
     * @param menu <BMMenu>     The calling menu.
     */
    menuWillOpen(menu) {},

    /**
     * Invoked by menus when they are about to be closed. This method is invoked before
     * any associated animation runs.
     * @param menu <BMMenu>     The calling menu.
     */
    menuWillClose(menu) {},

    /**
     * Invoked by menus after they are closed. This method is invoked after
     * any associated animation runs and after their contents are removed from the document.
     * @param menu <BMMenu>     The calling menu.
     */
    menuDidClose(menu) {},

    /**
     * Invoked by menus whenever a menu item is about to be selected.
     * Delegates can implement this method to control whether the manu item may be selected or not.
     * 
     * Returning `YES` from this method will cause the item to be selected and the menu to close.
     * Returning `NO` from this method will prevent the menu item from being selected and the menu will not close.
     * 
     * If this method is not implemented, all menu items may be selected.
     * 
     * @param menu <BMMenu>         The menu on which the item is about to be selected.
     * @param item <BMMenuItem>     The menu item that is about to be selected.
     * @returns <Boolean>           `YES` if the menu item should be selected, `NO` otherwise.
     */
    menuShouldSelectItem(menu, item) {},

    /**
     * Invoked by menus whenever a menu item has been selected.
     * @param menu <BMMenu>         The menu on which the item was selected.
     * @param item <BMMenuItem>     The menu item that was selected.
     */
    menuDidSelectItem(menu, item) {},
}

// @endtype
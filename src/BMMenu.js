// @type BMMenuItem

/**
 * A menu item is an object that represents an entry in a menu.
 */
function BMMenuItem() {} // <constructor>

BMMenuItem.prototype = {

    /**
     * The name of this menu item.
     */
    _name: undefined, // <String>
    get name() {
        return this._name;
    },

    /**
     * An optional icon associated with this menu item.
     */
    _icon: undefined, // <String, nullable>
    get icon() {
        return this._icon;
    },

    /**
     * An optional function that will be invoked when this menu item is selected.
     * This function will receive this menu item as a parameter when it is invoked in this way.
     */
    _action: undefined, // <void ^ (BMMenuItem), nullable>
    get action() {
        return this._action;
    },


    /**
     * Constructs and returns a menu item with the given name.
     * Optionally, the menu item may have an icon associated with it as well as an
     * action that is invoked when the item is selected.
     * @param name <String>                             The name of the menu item.
     * {
     *  @param icon <String, nullable>                  If specified, this represents the URL to an icon associated with this menu item.
     *                                                  For most menus, icons will only be displayed if all of its menu items have icons defined.
     * 
     *  @param action <void ^ (BMMenuItem), nullable>   If specified, this is a function that will be invoked when this menu item is selected.
     *                                                  This function will receive the selected menu item as a parameter.
     * }
     * @return <BMMenuItem>                             This menu item.
     */
    initWithName(name, {icon, action} = {}) {
        this._name = name;
        this._icon = icon;
        this._action = action;

        return this;
    }

};

/**
 * Constructs and returns a menu item with the given name.
 * Optionally, the menu item may have an icon associated with it as well as an
 * action that is invoked when the item is selected.
 * @param name <String>                             The name of the menu item.
 * {
 *  @param icon <String, nullable>                  If specified, this represents the URL to an icon associated with this menu item.
 *                                                  For most menus, icons will only be displayed if all of its menu items have icons defined.
 * 
 *  @param action <void ^ (BMMenuItem), nullable>   If specified, this is a function that will be invoked when this menu item is selected.
 *                                                  This function will receive the selected menu item as a parameter.
 * }
 * @return <BMMenuItem>                             A menu item.
 */
BMMenuItem.menuItemWithName = function (name, args) {
    return (new BMMenuItem).initWithName(name, args);
}

// @endtype

// @type BMMenu

/**
 * A menu object manages the display and lifecycle of a popup menu.
 */
function BMMenu() {} // <constructor>

BMMenu.prototype = {

    /**
     * The menu items displayed by this menu.
     */
    _items: undefined, // <[BMMenuItem]>
    get items() {
        return this._items.slice();
    },

    /**
     * An optional delegate object that will receive callbacks events from this menu.
     */
    _delegate: undefined, // <BMMenuDelegate, nullable>
    get delegate() {
        return this._delegate;
    },
    set delegate(delegate) {
        this._delegate = delegate;
    },

    /**
     * The point at which the menu is visible.
     */
    _point: new BMPoint(), // <BMPoint>

    /**
     * The DOM node currently used by this menu.
     */
    _node: undefined, // <DOMNode, nullable>

    /**
     * The container DOM node currently used by this menu
     */
    _containerNode: undefined, // <DOMNode, nullable>

    /**
     * Initializes this menu with the specified items.
     * The menu will be hidden by default; the method showAtPoint(_) should be used to make the menu visible.
     * 
     * @param items <[BMMenuItem]>      An array of menu items that will be displayed by this menu.
     * 
     * @return <BMMenu>                 A menu.
     */
    initWithItems(items) {
        this._items = [...items];

        return this;
    },

    /**
     * Invoked by CoreUI to render the menu items displayed by this menu.
     */
    _renderMenuItems() {
        for (const item of this._items) {
        }

    },

    /**
     * The kind of menu currently displayed.
     */
    _kind: BMMenuKind.Menu,

    /**
     * Animatable. Shows this menu at the specified point. The coordinates of this point are relative to the viewport.
     * @param point <BMPoint>                   The point at which to show this menu.
     * {
     *  @param animated <Boolean, nullable>     Defaults to `NO`. If set to `YES`, this change will be animated.
     *                                          If this method is invoked from within an animation context, the value of this parameter is ignored
     *                                          and the values of the current animation context are used.
     * 
     *  @param kind <BMMenuKind, nullable>      Defaults to `Menu`. The kind of menu.
     * }
     */
    openAtPoint(point, {animated = NO, kind = BMMenuKind.Menu} = {}) {
        // If the menu is already open, do nothing
        if (this._node) return;

        if (this.delegate && this.delegate.menuWillOpen) {
            this.delegate.menuWillOpen(this);
        }

        // The actual menu node
        const menuNode = document.createElement('div');
        menuNode.className = 'BMMenu';
        this._node = menuNode;

        // The overlay which intercepts clicks outside of the menu
        const menuContainer = document.createElement('div');
        menuContainer.className = 'BMMenuContainer';
        if (!('backdropFilter' in document.body.style) && !('webkitBackdropFilter' in document.body.style)) {
            menuNode.style.backgroundColor = 'white';
        }
        menuContainer.appendChild(menuNode);
        this._containerNode = menuContainer;

        // Create and append the items for this menu
        for (const item of this._items) {
            let itemNode = document.createElement('div');
            itemNode.className = 'BMMenuItem';
            itemNode.innerText = item.name;
    
            itemNode.addEventListener('click', event => {
                if (item.action) item.action(item);

                if (this.delegate && this.delegate.menuDidSelectItem) {
                    this.delegate.menuDidSelectItem(this, item);
                }
            });

            menuNode.appendChild(itemNode);
        }

        BMHook(menuNode, {scaleX: kind == BMMenuKind.PullDownMenu ? 1 : .75, scaleY: .75, opacity: 0});

        document.body.appendChild(menuContainer);

        let height = menuNode.offsetHeight;

        menuNode.style.transformOrigin = '0% 0%';
        if (kind == BMMenuKind.PullDownMenu) {
            menuNode.style.transformOrigin = '50% 0%';
        }
        if (height + point.y > document.documentElement.clientHeight) {
            menuNode.style.transformOrigin = '0% 100%';
            if (kind == BMMenuKind.PullDownMenu) {
                menuNode.style.transformOrigin = '50% 100%';
            }
            point.y -= height;
        }

        menuNode.style.left = point.x + 'px';
        menuNode.style.top = point.y + 'px';

        menuNode.addEventListener('click', event => event.preventDefault());

        (window.Velocity || $.Velocity).animate(menuNode, {scaleX: 1, scaleY: 1, opacity: 1, translateZ: 0}, {
            duration: 200,
            easing: 'easeOutQuad',
            complete: _ => ((menuNode.style.pointerEvents = 'all'), menuContainer.style.pointerEvents = 'all')
        });

        let delay = 0;
        for (let child of menuNode.childNodes) {
            BMHook(child, {translateY: '16px', translateZ: 0, opacity: 0});
            (window.Velocity || $.Velocity).animate(child, {translateY: '0px', translateZ: 0, opacity: 1}, {
                duration: 100,
                easing: 'easeOutQuad',
                delay: delay
            });
            delay += 16;
        }

        menuContainer.addEventListener('click', event => {
            this.closeAnimated(YES);
            event.preventDefault();
        });

        menuContainer.addEventListener('contextmenu', event => {
            this.closeAnimated(YES);
            event.preventDefault();
        });

        return menuNode;
    },

    /**
     * Animatable. Dismisses this menu, if it is visible.
     * @param animated <Boolean, nullable>      Defaults to `NO`. If set to `YES`, this change will be animated.
     *                                          If this method is invoked from within an animation context, the value of this parameter is ignored
     *                                          and the values of the current animation context are used.
     */
    closeAnimated(animated = YES) {
        if (!this._node) return;

        this._node.style.pointerEvents = 'none'; 
        this._containerNode.style.pointerEvents = 'none';
        let delay = this._node.childNodes.length * 16 + 100 - 200;
        delay = (delay < 0 ? 0 : delay);

        const containerNode = this._containerNode;

        (window.Velocity || $.Velocity).animate(this._node, {scaleX: this._kind == BMMenuKind.PullDownMenu ? 1 : .75, scaleY: .75, opacity: 0, translateZ: 0}, {
            duration: 200,
            easing: 'easeInQuad',
            delay: delay,
            complete: _ => {
                containerNode.remove();
                if (this.delegate && this.delegate.menuDidClose) {
                    this.delegate.menuDidClose(this);
                }
            }
        });

        delay = 0;
        for (let i = this._node.childNodes.length - 1; i >= 0; i--) {
            let child = this._node.childNodes[i];
            (window.Velocity || $.Velocity).animate(child, {translateY: '16px', translateZ: 0, opacity: 0}, {
                duration: 100,
                easing: 'easeInQuad',
                delay: delay
            });
            delay += 16;
        }

        this._node = undefined;
        this._containerNode = undefined;
    }
};

/**
 * Constructs and returns a menu with the specified items.
 * The menu will be hidden by default; the method `openAtPoint(_)` should be used to make the menu visible.
 * 
 * @param items <[BMMenuItem]>      An array of menu items that will be displayed by this menu.
 * 
 * @return <BMMenu>                 A menu.
 */
BMMenu.menuWithItems = function (items) {
    return (new BMMenu).initWithItems(items);
};

// @endtype
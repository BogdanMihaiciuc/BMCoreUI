// @ts-check

import {YES, NO, BMCopyProperties} from '../Core/BMCoreUI'
import {BMPoint, BMPointMake} from '../Core/BMPoint'
import {BMHook, __BMVelocityAnimate} from '../Core/BMAnimationContext'
import 'velocity-animate'
import { BMRectMakeWithNodeFrame } from '../Core/BMRect';

/**
 * The standard spacing between the menu and the node it is created from.
 */
const _BMMenuSpacingToNode = 8;

// @type BMMenuKind

export var BMMenuKind = Object.freeze({ // <enum>

    /**
     * Indicates that the menu should be a context menu.
     */
    Menu: {}, // <enum>

    /**
     * Indicates that the menu should be a pull down menu.
     */
    PullDownMenu: {} // <enum>

});

// @endtype

// @type BMMenuItem

/**
 * A menu item is an object that represents an entry in a menu.
 */
export function BMMenuItem() {} // <constructor>

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
     * Additional, arbitrary information associated with this menu item.
     */
    userInfo: undefined, // <AnyObject, nullable>

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
     *  @param userInfo <AnyObject, nullable>           Optional. If specified, this represents additional arbitrary data attached to this menu item.
     * }
     * @return <BMMenuItem>                             This menu item.
     */
    initWithName(name, {icon, action, userInfo} = {}) {
        this._name = name;
        this._icon = icon;
        this._action = action;
        this.userInfo = userInfo;

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

/**
 * Constructs and returns a menu separator.
 * @return <BMMenuItem>                             A menu item.
 */
BMMenuItem.menuSeparator = function () {
    return (new BMMenuItem).initWithName('---');
}

// @endtype

// @type BMMenu

/**
 * A menu object manages the display and lifecycle of a popup menu.
 */
export function BMMenu() {} // <constructor>

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
     * Defaults to 24. The size to use for this menu's icons.
     */
    _iconSize: 24, // <Number>

    get iconSize() {
        return this._iconSize;
    },
    set iconSize(size) {
        this._iconSize = size;

        if (this._node) for (const icon of this._node.querySelectorAll()) {
            BMCopyProperties(icon.style, {
                width: size + 'px',
                height: size + 'px'
            });
        }
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
     * The DOM node from which this menu was opened, if it was opened from a node.
     */
    _sourceNode: undefined, // <DOMNode, nullable>

    /**
     * A copy of the source node, used while the menu is visible.
     */
    _sourceNodeShadow: undefined, // <DOMNode, nullable>

    /**
     * The source node displacement, used while the menu is visible.
     */
    _sourceNodeDisplacement: undefined, // <Number, nullable>

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
     * Invoked by CoreUI to build the menu node.
     */
    _renderMenu() {
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

        this._renderMenuItems();

        menuNode.addEventListener('click', event => event.preventDefault());

        menuContainer.addEventListener('click', event => {
            this.closeAnimated(YES);
            event.preventDefault();
        });

        menuContainer.addEventListener('contextmenu', event => {
            this.closeAnimated(YES);
            event.preventDefault();
        });
    },

    /**
     * Invoked by CoreUI to build the menu item nodes displayed by this menu.
     */
    _renderMenuItems() {
        // Create and append the items for this menu
        const iconSize = this._iconSize;
        for (const item of this._items) {
            if (item.name == '---') {
                const itemNode = document.createElement('div');
                itemNode.className = 'BMMenuDivider';
                this._node.appendChild(itemNode);
                continue;
            }

            let itemNode = document.createElement('div');
            itemNode.className = 'BMMenuItem';

            if (item.icon) {
                const icon = document.createElement('img');
                icon.className = 'BMMenuIcon';
                icon.src = item.icon;
                BMCopyProperties(icon.style, {
                    width: iconSize + 'px',
                    height: iconSize + 'px'
                });
                itemNode.appendChild(icon);
            }

            const itemText = document.createElement('span');
            itemText.innerText = item.name;
            itemNode.appendChild(itemText);
    
            itemNode.addEventListener('click', event => {
                if (item.action) item.action(item);

                if (this.delegate && this.delegate.menuDidSelectItem) {
                    this.delegate.menuDidSelectItem(this, item);
                }
            });

            this._node.appendChild(itemNode);
        }
    },

    /**
     * The kind of menu currently displayed.
     */
    _kind: BMMenuKind.Menu,

    /**
     * Animatable. Shows this menu from the given DOM node.
     * @param node <DOMNode>                    The node from which to show this menu.
     * {
     *  @param animated <Boolean, nullable>     Defaults to `NO`. If set to `YES`, this change will be animated.
     *                                          If this method is invoked from within an animation context, the value of this parameter is ignored
     *                                          and the values of the current animation context are used.
     * 
     *  @param kind <BMMenuKind, nullable>      Defaults to `Menu`. The kind of menu.
     * }
     * @return <Promise<void>>                  A promise that resolves when the operation completes.
     */
    async openFromNode(node, {animated = NO, kind = BMMenuKind.Menu} = {}) {
        this._sourceNode = node;

        const sourceRect = BMRectMakeWithNodeFrame(node);
        sourceRect.size.height = node.offsetHeight;
        const viewportHeight = window.innerHeight;

        this._sourceNodeShadow = node.cloneNode(YES);

        this._renderMenu();

        const menuNode = this._node;
        const menuContainer = this._containerNode;
        document.body.appendChild(menuContainer);
        document.body.appendChild(this._sourceNodeShadow);

        // When open from a node, the menu container will darken the content behind it
        menuContainer.classList.add('BMMenuContainerFullScreen');
        this._sourceNodeShadow.classList.add('BMMenuSourceNodeShadow');
        menuNode.classList.add('BMMenuTouch');

        this._sourceNode.classList.add('BMMenuSourceNode');

        // When applicable, this interaction will perform a short tap
        if ('vibrate' in window.navigator) window.navigator.vibrate(10);

        const remainingHeight = viewportHeight - sourceRect.bottom;
        const menuHeight = menuNode.offsetHeight;

        let displacement = 0;

        const scale = .33;
        const duration = 400;
        const easing = [.17,1.46,.84,.93];

        // Displace the element, if needed
        if (menuHeight + _BMMenuSpacingToNode * 2 > remainingHeight) {
            displacement = remainingHeight - (menuHeight + _BMMenuSpacingToNode * 2);
        }

        this._sourceNodeDisplacement = displacement;

        BMCopyProperties(this._sourceNodeShadow.style, {left: sourceRect.origin.x + 'px', top: sourceRect.origin.y + 'px', width: sourceRect.size.width + 'px', height: sourceRect.size.height + 'px', transform: 'none'});

        menuNode.style.transformOrigin = '0% 0%';
        if (kind == BMMenuKind.PullDownMenu) {
            menuNode.style.transformOrigin = '50% 0%';
        }

        const point = BMPointMake(sourceRect.origin.x, sourceRect.bottom + _BMMenuSpacingToNode + displacement);
        BMCopyProperties(menuNode.style, {left: point.x + 'px', top: point.y + 'px'});
        
        BMHook(menuContainer, {opacity: 0});
        BMHook(menuNode, {scaleX: kind == BMMenuKind.PullDownMenu ? 1 : scale, scaleY: scale, translateY: -displacement + 'px'});

        // Make the container visible
        __BMVelocityAnimate(menuContainer, {opacity: 1}, {duration: duration, easing: easing});

        // Make the menu expand
        __BMVelocityAnimate(menuNode, {scaleX: 1, scaleY: 1, opacity: 1, translateZ: 0, translateY: 0}, {
            duration: duration,
            easing: easing,
            complete: _ => ((menuNode.style.pointerEvents = 'all'), menuContainer.style.pointerEvents = 'all')
        });

        // Animate each child node in
        let delay = 50;
        for (let child of menuNode.childNodes) {
            BMHook(child, {translateY: '16px', translateZ: 0, opacity: 0});
            __BMVelocityAnimate(child, {translateY: '0px', translateZ: 0, opacity: 1}, {
                duration: 100,
                easing: 'easeOutQuad',
                delay: delay
            });
            delay += 16;
        }

        // Animate the source node shadow
        await __BMVelocityAnimate(this._sourceNodeShadow, {translateY: displacement + 'px'}, {duration: duration, easing: easing});

    },

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

        this._renderMenu();

        const menuNode = this._node;
        const menuContainer = this._containerNode;

        BMHook(menuNode, {scaleX: kind == BMMenuKind.PullDownMenu ? 1 : .75, scaleY: .75, opacity: 0});

        document.body.appendChild(menuContainer);

        const height = menuNode.offsetHeight;
        const width = menuNode.offsetWidth;

        let transformOriginX = '0%';
        let transformOriginY = ' 0%';

        if (kind == BMMenuKind.PullDownMenu) {
            transformOriginX = '50%';
        }
        else if (width + point.x > document.documentElement.clientWidth) {
            transformOriginX = '100%';
            point.x -= width;
        }
        if (height + point.y > document.documentElement.clientHeight) {
            transformOriginY = ' 100%';
            point.y -= height;
        }
        menuNode.style.transformOrigin = transformOriginX + transformOriginY;

        menuNode.style.left = point.x + 'px';
        menuNode.style.top = point.y + 'px';

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

        const sourceNodeShadow = this._sourceNodeShadow;
        const containerNode = this._containerNode;
        const sourceNode = this._sourceNode;

        this._sourceNode = undefined;
        this._sourceNodeShadow = undefined;

        const scale = sourceNodeShadow ? .33 : .75;
        const duration = sourceNodeShadow ? 200 : 400;
        const easing = sourceNodeShadow ? 'easeInOutQuad' : 'easeInQuad';

        if (sourceNodeShadow) {
            __BMVelocityAnimate(sourceNodeShadow, {translateY: '0px'}, {duration: duration, easing: easing});
            __BMVelocityAnimate(containerNode, {opacity: 0}, {duration: duration, easing: easing});
        }

        __BMVelocityAnimate(this._node, {
            scaleX: this._kind == BMMenuKind.PullDownMenu ? 1 : scale, 
            scaleY: scale, 
            opacity: sourceNodeShadow ? 1 : 0, 
            translateY: sourceNodeShadow ? -this._sourceNodeDisplacement + 'px' : '0px',
            translateZ: 0
        }, {
            duration: 200,
            easing: easing,
            delay: delay,
            complete: _ => {
                containerNode.remove();
                if (sourceNodeShadow) {
                    sourceNodeShadow.remove();
                    sourceNode.classList.remove('BMMenuSourceNode');
                }
                if (this.delegate && this.delegate.menuDidClose) {
                    this.delegate.menuDidClose(this);
                }
            }
        });

        delay = 0;
        for (let i = this._node.childNodes.length - 1; i >= 0; i--) {
            let child = this._node.childNodes[i];
            __BMVelocityAnimate(child, {translateY: '16px', translateZ: 0, opacity: 0}, {
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
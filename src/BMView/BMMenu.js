// @ts-check

import {YES, NO, BMCopyProperties, BMNumberByConstrainingNumberToBounds} from '../Core/BMCoreUI'
import {BMPoint, BMPointMake} from '../Core/BMPoint'
import {BMHook, __BMVelocityAnimate} from '../Core/BMAnimationContext'
import 'velocity-animate'
import { BMRect, BMRectMake, BMRectMakeWithNodeFrame, BMRectMakeWithOrigin } from '../Core/BMRect';
import { BMView } from './BMView_v2.5';
import { BMKeyboardShortcut } from '../BMWindow/BMKeyboardShortcut';
import { BMSizeMake } from '../Core/BMSize';

/**
 * A flag that, if enabled, causes web animations to be used for menu animations.
 */
const BMMENU_USE_WEB_ANIMATIONS = NO;

/**
 * The standard spacing between the menu and the node it is created from.
 */
const _BMMenuSpacingToNode = 8;

/**
 * The amount of time, in milliseconds, to block interaction with menu items to
 * allow the user to navigate to a submenu.
 */
const _BMMenuSubmenuTimeout = 300;

/**
 * The name of the CSS class that is added to nodes that have a popup menu.
 */
export const BMMenuSourceNodeCSSClass = 'BMMenuSourceNode';

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
     * An optional submenu that opens from this menu item.
     */
    _submenu: undefined, // <BMMenu, nullable>
    get submenu() {
        return this._submenu;
    },

    /**
     * Whether this menu item is a separator.
     */
    _isSeparator: NO, // <Boolean>
    get isSeparator() {
        return this._isSeparator;
    },

    /**
     * Additional, arbitrary information associated with this menu item.
     */
    userInfo: undefined, // <AnyObject, nullable>

    /**
     * Additional CSS classes to apply to this item's node.
     */
    _CSSClass: '', // <String, nullable>
    get CSSClass() {
        return this._CSSClass;
    },
    set CSSClass(cls) {
        // If this menu item is rendered, apply the class to its node
        let node = this._node;
        if (node) {
            // First remove the previous classes, if they exist
            if (this._CSSClass) {
                this._CSSClass.split(' ').forEach(cls => node.classList.remove(cls));
            }

            // Then add the new classes, if they exist
            if (cls) {
                cls.split(' ').forEach(cls => node.classList.add(cls));
            }
        }

        this._CSSClass = cls || '';
    },

    /**
     * The node that represents this menu item, available while its menu
     * is open.
     */
    _node: undefined, // <DOMNode, nullable>

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
     *  @param submenu <BMMenu, nullable>               Optional. If specified, this represents a menu that opens from this menu item.
     *  @param userInfo <AnyObject, nullable>           Optional. If specified, this represents additional arbitrary data attached to this menu item.
     * }
     * @return <BMMenuItem>                             This menu item.
     */
    initWithName(name, {icon, action, submenu, userInfo} = {}) {
        this._name = name;
        this._icon = icon;
        this._action = action;
        this._submenu = submenu;
        this.userInfo = userInfo;

        if (name.startsWith('---')) {
            this._isSeparator = YES;
        }

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
 *  @param submenu <BMMenu, nullable>               Optional. If specified, this represents a menu that opens from this menu item.
 *  @param userInfo <AnyObject, nullable>           Optional. If specified, this represents additional arbitrary data attached to this menu item.
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

        if (this._node) {
            // When the icon size is changed while the menu is active
            // apply it to all menu items
            for (const icon of this._node.querySelectorAll()) {
                BMCopyProperties(icon.style, {
                    width: size + 'px',
                    height: size + 'px'
                });
            }
        }
    },

    /**
     * A custom list of CSS classes to add to the menu DOM node.
     */
    _CSSClass: '', // <String>
    get CSSClass() {
        return this._CSSClass;
    },
    set CSSClass(CSSClass) {
        // If this menu item is rendered, apply the class to its node
        let node = this._node;
        if (node) {
            // First remove the previous classes, if they exist
            if (this._CSSClass) {
                this._CSSClass.split(' ').forEach(cls => node.classList.remove(cls));
            }

            // Then add the new classes, if they exist
            if (CSSClass) {
                CSSClass.split(' ').forEach(cls => node.classList.add(cls));
            }
        }

        this._CSSClass = CSSClass || '';
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
    _sourceNodeDisplacement: 0, // <Number, nullable>

    /**
     * The source node horizontal displacement, used while the menu is visible.
     */
    _sourceNodeHorizontalDisplacement: 0, // <Number, nullable>

    /**
     * The DOM node that was focused when this alert was opened.
     */
    _previouslyActiveNode: undefined, // <DOMNode>

    /**
     * The submenu currently displayed, if any.
     */
    _submenu: undefined, // <BMMenu, nullable>

    /**
     * The menu that opened this menu, if any.
     */
    _supermenu: undefined, // <BMMenu, nullable>

    /**
     * The menu's frame, relative to the viewport, available while this menu is visible.
     */
    _frame: undefined, // <BMRect, nullable>
    get frame() {
        return this._frame && this._frame.copy();
    },

    /**
     * The index of the currently highlighted menu item.
     */
    _highlightedIndex: -1, // <Number>
    get highlightedIndex() {
        return this._highlightedIndex;
    },
    set highlightedIndex(index) {
        if (index != this._highlightedIndex) {
            this._highlightedIndex = index;

            if (this._node) {
                // Remove the currently highlighted item's style
                const highlightedItem = this._node.querySelector('.BMMenuItemHighlighted');
                if (highlightedItem) {
                    highlightedItem.classList.remove('BMMenuItemHighlighted');
                }

                // And add it to the newly highlighted item
                const nextHighlightedItem = this._node.children[index];
                if (nextHighlightedItem) {
                    nextHighlightedItem.classList.add('BMMenuItemHighlighted');
                }
            }

            // If the highlight index changes while a submenu is open
            // dismiss the submenu
            if (index != -1 && this._submenu) {
                this._submenu.closeAnimated(YES);
            }
        }
    },

    /**
     * Set to `YES` while delaying events due to a submenu having
     * been recently activated.
     */
    _delaysEvents: NO, // <Boolean>

    /**
     * Controls whether the closing animation should be delayed to allow time
     * for the selection animation to play on the selected menu item.
     */
    __delaysClosing: NO, // <Boolean>
    get _delaysClosing() {
        return this.__delaysClosing;
    },
    set _delaysClosing(delays) {
        // When set to YES, this should propagate up to the supermenu
        if (this._supermenu) {
            this._supermenu._delaysClosing = delays;
        }
        this.__delaysClosing = delays;
    },

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
        if (this._supermenu) {
            // If this menu opens as a submenu, share the parent menu's container node
            return this._renderMenuWithContainer(this._supermenu._containerNode);
        }
        else {
            return this._renderMenuWithContainer();
        }
    },

    /**
     * Invoked by CoreUI to build the menu node, in the specified container.
     * @param container <DOMNode, nullable>     The container node in which to render the menu.
     *                                          If not specified, a new container will be created
     *                                          for this menu.
     */
    _renderMenuWithContainer(container) {
        // The actual menu node
        const menuNode = document.createElement('div');
        menuNode.className = this._CSSClass ? `BMMenu ${this._CSSClass}` : 'BMMenu';
        this._node = menuNode;

        // When opening the menu, reset the highlight index
        this._highlightedIndex = -1;

        menuNode.tabIndex = -1;

        // Register the keyboard shortcuts to be used while the menu is visible
        const upArrow = BMKeyboardShortcut.keyboardShortcutWithKeyCode('ArrowUp', {modifiers: [], target: this, action: 'arrowUpPressedWithEvent'});
        upArrow.preventsDefault = YES;
        BMView.registerKeyboardShortcut(upArrow, {forNode: menuNode});

        const downArrow = BMKeyboardShortcut.keyboardShortcutWithKeyCode('ArrowDown', {modifiers: [], target: this, action: 'arrowDownPressedWithEvent'});
        downArrow.preventsDefault = YES;
        BMView.registerKeyboardShortcut(downArrow, {forNode: menuNode});

        const rightArrow = BMKeyboardShortcut.keyboardShortcutWithKeyCode('ArrowRight', {modifiers: [], target: this, action: 'arrowRightPressedWithEvent'});
        rightArrow.preventsDefault = YES;
        BMView.registerKeyboardShortcut(rightArrow, {forNode: menuNode});

        const leftArrow = BMKeyboardShortcut.keyboardShortcutWithKeyCode('ArrowLeft', {modifiers: [], target: this, action: 'arrowLeftPressedWithEvent'});
        leftArrow.preventsDefault = YES;
        BMView.registerKeyboardShortcut(leftArrow, {forNode: menuNode});

        const returnShortcut = BMKeyboardShortcut.keyboardShortcutWithKeyCode('Enter', {modifiers: [], target: this, action: 'returnPressedWithEvent'});
        returnShortcut.preventsDefault = YES;
        BMView.registerKeyboardShortcut(returnShortcut, {forNode: menuNode});

        const spacebar = BMKeyboardShortcut.keyboardShortcutWithKeyCode('Space', {modifiers: [], target: this, action: 'returnPressedWithEvent'});
        spacebar.preventsDefault = YES;
        BMView.registerKeyboardShortcut(spacebar, {forNode: menuNode});

        const tab = BMKeyboardShortcut.keyboardShortcutWithKeyCode('Tab', {modifiers: [], target: this, action: 'tabPressedWithEvent'});
        tab.preventsDefault = YES;
        BMView.registerKeyboardShortcut(tab, {forNode: menuNode});

        const escape = BMKeyboardShortcut.keyboardShortcutWithKeyCode('Escape', {modifiers: [], target: this, action: 'escapePressedWithEvent'});
        escape.preventsDefault = YES;
        BMView.registerKeyboardShortcut(escape, {forNode: menuNode});

        // The overlay which intercepts clicks outside of the menu
        const menuContainer = container || document.createElement('div');
        if (!container) {
            menuContainer.className = 'BMMenuContainer';
        }

        if (!('backdropFilter' in document.body.style) && !('webkitBackdropFilter' in document.body.style)) {
            menuNode.style.backgroundColor = 'white';
        }
        menuContainer.appendChild(menuNode);
        this._containerNode = menuContainer;

        this._renderMenuItems();

        // When clicking an empty area of the menu don't do anything
        menuNode.addEventListener('click', event => {
            if (event.target == menuNode) {
                // But close any open submenus
                if (this._submenu) {
                    this._submenu.closeAnimated(YES);
                }
                event.stopPropagation();
            }

            event.preventDefault();
        });

        // When the mouse exits the menu area, reset the highlight position to the first element
        // unless the menu is not focused
        menuNode.addEventListener('mouseleave', event => {
            // If events should be delayed, don't process this mouseleave event
            if (this._delaysEvents) return;

            if (document.activeElement == menuNode) {
                this.highlightedIndex = -1;
            }
        });

        // Close the menu when clicking outside of it
        menuContainer.addEventListener('click', event => {
            // If the click occurs inside the container while events are being suppressed
            // do not close the menu
            if (this._delaysEvents) {
                if (this._frame && this._frame.intersectsPoint(BMPointMake(event.clientX, event.clientY))) {
                    return;
                }
            }

            this.closeAnimated(YES);
            event.preventDefault();
        });

        // Also close the menu when right-clicking outside of it
        // and prevent the browser's regular context menu from appearing
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

        this._items.forEach((item, index) => {
            // Items starting with at least three minus signs are interpreted as separators
            // TODO: In the future, there should be a better documented way to do this
            if (item.name.startsWith('---')) {
                const itemNode = document.createElement('div');
                itemNode.className = 'BMMenuDivider';
                this._node.appendChild(itemNode);
                return;
            }

            // Create the item node
            let itemNode = document.createElement('div');
            itemNode.className = 'BMMenuItem';
            item._node = itemNode;

            if (item.icon) {
                // Create the icon, if the menu item has one
                const icon = document.createElement('img');
                icon.className = 'BMMenuIcon';
                icon.src = item.icon;
                BMCopyProperties(icon.style, {
                    width: iconSize + 'px',
                    height: iconSize + 'px'
                });
                itemNode.appendChild(icon);
            }

            // Create the label
            const itemText = document.createElement('span');
            itemText.innerText = item.name;
            itemNode.appendChild(itemText);

            // Create the disclosure container
            const submenuIcon = document.createElement('div');
            submenuIcon.classList.add('BMMenuItemDisclosure');
            // If the item has a submenu, draw an icon indicating it
            if (item.submenu) {
                submenuIcon.classList.add('BMMenuItemDisclosureSubmenu');
            }
            itemNode.appendChild(submenuIcon);
    
            // TWhen clicking an item, trigger its action, if it has one
            itemNode.addEventListener('click', event => {
                if (item.submenu && this._sourceNodeShadow) {
                    // For touch menus, if the item has a submenu, open it
                    this._openSubmenuForMenuItem(item, {animated: YES, delayEvents: NO, acquireFocus: YES});

                    // Don't activate the item or close the menu
                    event.stopPropagation();
                    return;
                }

                // Ask the delegate if this menu item should be selected
                let shouldSelect = YES;
                if (this.delegate && this.delegate.menuShouldSelectItem) {
                    shouldSelect = this.delegate.menuShouldSelectItem(this, item);
                }

                if (!shouldSelect) {
                    // If the item shouldn't be selected, also prevent closing the menu
                    event.stopPropagation();
                    return;
                }

                // For desktop menus, delay closing slightly to allow the selection
                // animation to play out
                this._delaysClosing = YES;

                if (item.action) {
                    // Invoke the menu's action if configured
                    item.action(item);
                }

                itemNode.classList.add('BMMenuItemActive');

                if (this.delegate && this.delegate.menuDidSelectItem) {
                    this.delegate.menuDidSelectItem(this, item);
                }
            });

            // When moving the mouse over an item, set the highlight index to it,
            // allowing further keyboard navigation to continute from this item
            itemNode.addEventListener('mouseover', event => {
                if (this._highlightedIndex == index) return;

                // If events should be delayed, don't process this mouseover event
                if (this._delaysEvents) return;

                this.highlightedIndex = index;

                if (item.submenu) {
                    // If the item has a submenu, open it after a short delay as long as the highlighted
                    // element doesn't change
                    setTimeout(() => {
                        // For touch menus, require a click to bring up the submenu
                        if (this._sourceNodeShadow) return;

                        if (this._highlightedIndex == index) {
                            this._openSubmenuForMenuItem(item, {animated: YES, delayEvents: YES});
                        }
                    }, 100);
                }
            });

            this._node.appendChild(itemNode);
        });
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
        // Signal the delegate that this menu is about to open
        if (this.delegate && this.delegate.menuWillOpen) {
            this.delegate.menuWillOpen(this);
        }

        this._sourceNode = node;

        // Get the source node's position to position its shadow appropriately
        const sourceRect = BMRectMakeWithNodeFrame(node);

        // The source node may be partially hidden because of the scroll position, so use
        // its actual height for the rect
        sourceRect.size.height = node.offsetHeight;

        const viewportHeight = window.innerHeight;

        // Create a copy of the source node, to be displayed next to the menu
        this._sourceNodeShadow = node.cloneNode(YES);

        this._renderMenu();

        const menuNode = this._node;
        const menuContainer = this._containerNode;
        if (!this._supermenu) {
            document.body.appendChild(menuContainer);
        }
        document.body.appendChild(this._sourceNodeShadow);

        // Apply a slight scale to the source node
        const sourceRectScaled = sourceRect.copy();
        sourceRectScaled.scaleWithFactor(1.1);

        // When open from a node, the menu container will darken the content behind it
        menuContainer.classList.add('BMMenuContainerFullScreen');
        this._sourceNodeShadow.classList.add('BMMenuSourceNodeShadow');
        menuNode.classList.add('BMMenuTouch');

        if (this._supermenu) {
            // If this opens as a submenu, it must be at least as wide as the supermenu
            menuNode.style.minWidth = `${this._supermenu.frame.size.width + 8}px`;

            // Additionally, the supermenu should stop recieving pointer input until this
            // submenu is closed
            this._supermenu._node.classList.add('BMMenuTouchSubmenu');
        }

        // Hide the source node while the menu is visible
        this._sourceNode.classList.add(BMMenuSourceNodeCSSClass);

        // When applicable, this interaction will perform a short tap
        if ('vibrate' in window.navigator) window.navigator.vibrate(10);

        const menuHeight = menuNode.offsetHeight;
        const menuWidth = menuNode.offsetWidth;

        const viewportWidth = window.innerWidth;

        // The scale to apply to the source node shadow
        let sourceNodeScale = 1.1;

        // When the source node is wider or taller than the viewport, scale it down to fit
        if (sourceRectScaled.width > viewportWidth - _BMMenuSpacingToNode * 2) {
            const widthScale = (viewportWidth - _BMMenuSpacingToNode * 2) / sourceRectScaled.width;
            sourceRectScaled.scaleWithFactor(widthScale);

            sourceNodeScale *= widthScale;
        }

        if (sourceRectScaled.height > viewportHeight - menuHeight - _BMMenuSpacingToNode * 2) {
            const heightScale = (viewportHeight - menuHeight - _BMMenuSpacingToNode * 2) / sourceRectScaled.height;
            sourceRectScaled.scaleWithFactor(heightScale);

            sourceNodeScale *= heightScale;
        }

        const remainingHeight = viewportHeight - sourceRectScaled.bottom;

        let displacement = 0;
        let horizontalDisplacement = 0;

        const scale = .33;
        const pullDownScale = .5;
        const duration = 400;
        const easing = [.17,1.46,.84,.93];

        // Displace the element if it is above the visible area
        if (sourceRectScaled.origin.y < 0) {
            displacement = -sourceRectScaled.origin.y + 16;
        }

        // Displace the element, if needed because there's no space on the bottom
        if (menuHeight + _BMMenuSpacingToNode * 2 > remainingHeight) {
            displacement = remainingHeight - (menuHeight + _BMMenuSpacingToNode * 2);
        }

        // Displace the element, if needed because there's no space on the right
        if (menuWidth + sourceRectScaled.origin.x + _BMMenuSpacingToNode > viewportWidth) {
            horizontalDisplacement = viewportWidth - (menuWidth + sourceRectScaled.origin.x + _BMMenuSpacingToNode);
        }

        this._sourceNodeDisplacement = displacement;
        this._sourceNodeHorizontalDisplacement = horizontalDisplacement;

        BMCopyProperties(this._sourceNodeShadow.style, {left: sourceRect.origin.x + 'px', top: sourceRect.origin.y + 'px', width: sourceRect.size.width + 'px', height: sourceRect.size.height + 'px', transform: 'none'});

        menuNode.style.transformOrigin = '0% 0%';
        if (kind == BMMenuKind.PullDownMenu) {
            menuNode.style.transformOrigin = '50% 0%';
        }

        const point = BMPointMake(Math.max(sourceRectScaled.origin.x + horizontalDisplacement, 8), sourceRectScaled.bottom + _BMMenuSpacingToNode + displacement);
        BMCopyProperties(menuNode.style, {left: point.x + 'px', top: point.y + 'px'});

        this._frame = BMRectMakeWithOrigin(point, {size: BMSizeMake(menuWidth, menuHeight)});
        
        // Prepare the initial state of the animation
        if (!this._supermenu) {
            BMHook(menuContainer, {opacity: 0});
        }
        else {
            BMHook(menuNode, {opacity: 0});
        }
        BMHook(menuNode, {
            scaleX: kind == BMMenuKind.PullDownMenu ? pullDownScale : scale, 
            scaleY: kind == BMMenuKind.PullDownMenu ? pullDownScale : scale, 
            translateY: -displacement + 'px',
            translateX: -horizontalDisplacement + 'px',
        });

        if (!this._supermenu) {
            // Make the container visible
            __BMVelocityAnimate(menuContainer, {opacity: 1}, {duration, easing}, BMMENU_USE_WEB_ANIMATIONS);
        }
        else {
            this._supermenu._node.classList.add('BMMenuInactive');
            __BMVelocityAnimate(this._supermenu._node, {scaleX: .95, scaleY: .95}, {duration, easing: 'easeOutQuad'}, BMMENU_USE_WEB_ANIMATIONS);
        }

        // Make the menu expand
        __BMVelocityAnimate(menuNode, {scaleX: 1, scaleY: 1, opacity: 1, translateZ: 0, translateY: 0, translateX: 0}, {
            duration,
            easing,
            complete: _ => ((menuNode.style.pointerEvents = 'all'), menuContainer.style.pointerEvents = 'all')
        }, BMMENU_USE_WEB_ANIMATIONS);

        // Animate each child node in
        let delay = 50;
        for (let child of menuNode.childNodes) {
            BMHook(child, {translateY: '16px', translateZ: 0, opacity: 0});
            __BMVelocityAnimate(child, {translateY: '0px', translateZ: 0, opacity: 1}, {
                duration: 100,
                easing: 'easeOutQuad',
                delay: delay
            }, BMMENU_USE_WEB_ANIMATIONS);
            delay += 16;
        }

        // Retain the preivously focused node, to restore its focus when the menu closes
        this._previouslyActiveNode = document.activeElement;
        menuNode.focus();

        // Animate the source node shadow
        await __BMVelocityAnimate(
            this._sourceNodeShadow, 
            {translateY: displacement + 'px', translateX: horizontalDisplacement + 'px', scaleX: sourceNodeScale, scaleY: sourceNodeScale}, 
            {duration, easing},
            BMMENU_USE_WEB_ANIMATIONS
        );

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
        // Create a 0-by-0 rect at the given point and open the menu around it
        const rect = BMRectMakeWithOrigin(point, {size: BMSizeMake()});

        return this._openAroundRect(rect, arguments[1]);
    },

    /**
     * Shows this menu at an appropriate position around the given rect. The coordinates of this rect
     * are relative to the viewport.
     * @param rect <BMRect>                     The rect around which to show this menu.
     * {
     *  @param animated <Boolean, nullable>     Defaults to `NO`. If set to `YES`, this change will be animated.
     *                                          If this method is invoked from within an animation context, the value of this parameter is ignored
     *                                          and the values of the current animation context are used.
     * 
     *  @param kind <BMMenuKind, nullable>      Defaults to `Menu`. The kind of menu.
     */
    _openAroundRect(rect, {animated = NO, kind = BMMenuKind.Menu} = {}) {
        // If the menu is already open, do nothing
        if (this._node) return;

        // Signal the delegate that this menu is about to open
        if (this.delegate && this.delegate.menuWillOpen) {
            this.delegate.menuWillOpen(this);
        }

        // Build the DOM structure
        this._renderMenu();

        const menuNode = this._node;
        const menuContainer = this._containerNode;

        // Prepare the initial state of the animation
        BMHook(menuNode, {
            scaleX: kind == BMMenuKind.PullDownMenu ? .5 : .75, 
            scaleY: kind == BMMenuKind.PullDownMenu ? .5 : .75, 
            opacity: 0
        });

        if (!this._supermenu) {
            document.body.appendChild(menuContainer);
        }

        // Get the menu's metrics to determine where it fits best
        const height = menuNode.offsetHeight;
        const width = menuNode.offsetWidth;
        const metrics = window.getComputedStyle(menuNode);

        // The paddings are used to adjust the menu's position so that the first
        // or last menu item appears directly on the pointer's position
        const paddingTop = parseInt(metrics.paddingTop, 10) || 0;
        const paddingBottom = parseInt(metrics.paddingBottom, 10) || 0;

        // The transform origins will be adjusted based on which direction the menu opens in
        let transformOriginX = '0%';
        let transformOriginY = ' 0%';

        // Attempt to open the menu towards the bottom right, starting at the
        // top-right corner of the rect, subtracting the menu's padding so
        // that the first menu item appears directly on the pointer's position
        const point = BMPointMake(rect.right, rect.origin.y - paddingTop);

        // Determine where to place the menu based on where it fits best, preferring towards
        // the bottom-right of the origin point
        if (kind == BMMenuKind.PullDownMenu) {
            transformOriginX = '50%';
        }
        else if (width + point.x > document.documentElement.clientWidth) {
            // If the menu doesn't fit towards the right, open it towards the left
            transformOriginX = '100%';
            point.x = rect.origin.x - width;
        }
        if (height + point.y > document.documentElement.clientHeight) {
            // If the menu doesn't fit towards the bottom, open it towards the top
            transformOriginY = ' 100%';
            point.y = rect.bottom + paddingBottom - height;
        }
        menuNode.style.transformOrigin = transformOriginX + transformOriginY;

        // Set menu's the position
        this._frame = BMRectMakeWithOrigin(point, {size: BMSizeMake(width, height)});
        menuNode.style.left = point.x + 'px';
        menuNode.style.top = point.y + 'px';

        // Animate the menu in
        (window.Velocity || $.Velocity).animate(menuNode, {scaleX: 1, scaleY: 1, opacity: 1, translateZ: 0}, {
            duration: 200,
            easing: 'easeOutQuad',
            complete: _ => ((menuNode.style.pointerEvents = 'all'), menuContainer.style.pointerEvents = 'all')
        });

        // Animate each menu item in
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

        // Retain the preivously focused node, to restore its focus when the menu closes
        this._previouslyActiveNode = document.activeElement;

        // Focus this menu, unless it opens as a submenu, in which case the parent menu
        // is responsible for granting focus
        if (!this._supermenu) {
            menuNode.focus();
        }
    },

    /**
     * Opens the submenu for the given menu item.
     * @param item <BMMenuItem>                     The item whose submenu should be opened.
     * {
     *  @param animated <Boolean, nullable>         Defaults to `YES`. If set to `YES` this change will be animated.
     *  @param delaysEvents <Boolean, nullable>     Defaults to `NO`. If set to `YES`, mouse events on the current menu will be
     *                                              temporarily suspended, allowing the pointer to move over other menu items
     *                                              without closing the submenu.
     *  @param acquireFocus <Boolean, nullable>     Defaults to `NO`. If set to `YES`, the submenu will acquire keyboard focus upon
     *                                              opening. Otherwise, this menu will retain keyboard focus.
     * }
     */
    _openSubmenuForMenuItem(item, {animated = YES, delayEvents, acquireFocus} = {animated: YES}) {
        const submenu = item._submenu;

        // If the item doesn't have a submenu, there's no action to take
        if (!submenu) return;

        const itemFrame = BMRectMakeWithNodeFrame(item._node);

        if (delayEvents) {
            this._delayEventsForSubmenu(submenu, {item});
        }

        // Render the submenu and set its delegate to this menu's delegate
        submenu._supermenu = this;
        this._submenu = submenu;

        // Open an appropriate menu kind based on this menu's kind
        if (this._sourceNodeShadow) {
            submenu.openFromNode(item._node, {animated, kind: BMMenuKind.PullDownMenu});
        }
        else {
            submenu._openAroundRect(itemFrame, {animated});
        }

        if (acquireFocus) {
            // If focus should be acquired, grant it immediately when opening
            submenu._node.focus();
        }
    },

    /**
     * Temporarily prevents menu items from being highlighted, while the mouse
     * pointer moves towards the specified submenu.
     * @param submenu <BMMenu>          The submenu for which to delay events.
     * {
     *  @param item <BMMenuItem>        The item from which the submenu opened.
     * }
     */
    _delayEventsForSubmenu(submenu, {item}) {
        /** @type {BMRect} */
        let submenuFrame = submenu.frame;

        const itemFrame = BMRectMakeWithNodeFrame(item._node);

        // The position of the previous event, used to determine the direction in which the mouse
        // pointer moves
        let lastPosition;// = BMPointMake(event.clientX, event.clientY);

        // Determine the top and bottom corners on the edge closest to the pointer's current position
        // These will be used to verify if the mouse pointer does move towards the submenu or away from it
        let topPoint;
        let bottomPoint;

        // Determines whether the slope needs to be between the min and max slopes or outside their range
        let flipSlopes = false;

        const eventTarget = this._containerNode;
        // Immediately block interactions with menu elements
        this._delaysEvents = YES;
        eventTarget.classList.add('BMMenuContainerSubmenuActive');
        const mouseMoveEvent = 'mousemove';

        let timeout;

        // Set to `YES` after pointer leaves the menu item's frame
        let active = NO;

        // Causes regular event processing to resume.
        const resumeEvents = () => {
            // Stops ignoring events
            this._delaysEvents = NO;

            // Remove the mousemove event handler
            eventTarget.removeEventListener(mouseMoveEvent, handler, {capture: YES});

            // Allow pointer interaction with the menu nodes
            eventTarget.classList.remove('BMMenuContainerSubmenuActive');

            if (timeout) {
                // Clear the timeout if it still exists
                window.clearTimeout(timeout);
                timeout = undefined;
            }
        }

        const handler = (/** @type {MouseEvent} */ event) => {
            const currentPosition = BMPointMake(event.clientX, event.clientY);

            if (!submenuFrame) {
                // The handler is set up before the submenu actually renders
                // so get its frame when it becomes available
                submenuFrame = submenu.frame;
                return;
            }

            if (!lastPosition) {
                // On the first movement initialize the previous position
                // and top and bottom points relative to the pointer's position
                lastPosition = currentPosition;
                topPoint = submenuFrame.origin.x > lastPosition.x ? 
                                    submenuFrame.origin : 
                                    BMPointMake(submenuFrame.right, submenuFrame.origin.y);
                bottomPoint = submenuFrame.origin.x > lastPosition.x ? 
                                    BMPointMake(submenuFrame.origin.x, submenuFrame.bottom) : 
                                    BMPointMake(submenuFrame.right, submenuFrame.bottom);

                if (submenuFrame.origin.x < lastPosition.x) {
                    // When the menu appears to the left, the min and max slopes need to be
                    // flipped, because the "interior" of the slopes is counted clockwise
                    // from the bottom slope to the top one, but on the left side
                    // the interior needs to be counted counter-clockwise
                    flipSlopes = true;
                }

                return;
            }

            // If the menu stops delaying events, remove the handler and restore regular event processing
            if (!this._delaysEvents) {
                resumeEvents();
                return;
            }

            if (!active) {
                if (!itemFrame.intersectsPoint(currentPosition)) {
                    // Upon leaving the menu item's frame, activate further processing
                    active = YES;

                    // After a delay, if the submenu isn't focused, resume events
                    timeout = window.setTimeout(resumeEvents, _BMMenuSubmenuTimeout);
                }
                else {
                    return;
                }
            }

            // If the mouse pointer enters the submenu's frame, cause it to acquire focus
            // and resume events
            if (submenuFrame.intersectsPoint(currentPosition)) {
                submenu._node.focus();
                resumeEvents();
                return;
            }

            // Stop these events from propagating anywhere else
            event.preventDefault();
            event.stopPropagation();

            // If the pointer doesn't actually move, ignore this event
            if (currentPosition.isEqualToPoint(lastPosition)) return;

            // Get the slope angles to the top and bottom corners on the edge
            // closest to the current pointer's position
            const topSlope = currentPosition.slopeAngleToPoint(topPoint);
            const bottomSlope = currentPosition.slopeAngleToPoint(bottomPoint);

            // Get the slope angle for the current movement, which indicates the direction
            // in which the pointer moves
            const currentSlope = lastPosition.slopeAngleToPoint(currentPosition);

            const minSlope = Math.min(topSlope, bottomSlope);
            const maxSlope = Math.max(topSlope, bottomSlope);

            // If the mouse moves away from the submenu, resume events
            // The pointer is considered to be moving towards the menu if the slope angle
            // of the line formed between the current and previous mouse positions
            // is between these two slope angles
            let isOutsideSlopeRange = flipSlopes ?
                currentSlope > minSlope && currentSlope < maxSlope :
                currentSlope < minSlope || currentSlope > maxSlope;
            
            if (isOutsideSlopeRange) {
                resumeEvents();
                return;
            }

            // Otherwise continue monitoring the pointer's position
            lastPosition = currentPosition;
        };

        eventTarget.addEventListener(mouseMoveEvent, handler, {capture: YES});
    },

    /**
     * Dismisses this menu, if it is visible.
     * @param animated <Boolean, nullable>          Defaults to `YES`. If set to `YES`, this change will be animated.
     *                                              If this method is invoked from within an animation context, the value of this parameter is ignored
     *                                              and the values of the current animation context are used.
     * {
     *  @param withSupermenu <Boolean, nullable>    Defaults to `NO`. If set to `YES` and this menu is displayed as a submenu, its supermenus
     *                                              will also close.
     * }
     */
    closeAnimated(animated = YES, {withSupermenu = NO} = {}) {
        // If the menu isn't visible this action has no effect.
        if (!this._node) return;

        // If any submenu is displayed, dismiss it as well
        if (this._submenu) {
            this._submenu._isSupermenuClosing = YES;
            this._submenu.closeAnimated(animated);
        }

        // Signal the delegate that this menu is about to close
        if (this.delegate && this.delegate.menuWillClose) {
            this.delegate.menuWillClose(this);
        }

        if (withSupermenu && this._supermenu) {
            this._supermenu.closeAnimated(animated, {withSupermenu});
        }

        // If the menu was delaying events, restore event processing for
        // when it reopens
        this._delaysEvents = NO;

        // Restore focus to whichever node had it prior to this menu opening
        if (this._previouslyActiveNode) {
            this._previouslyActiveNode.focus();
        }

        const supermenu = this._supermenu;
        // If this is a submenu, clear the parent menu's submenu
        if (supermenu) {
            supermenu._submenu = undefined;
            this._supermenu = undefined;

            // Allow the supermenu items to receive input again
            if (supermenu._node && !this._isSupermenuClosing) {
                __BMVelocityAnimate(supermenu._node, {scaleX: 1, scaleY: 1}, {duration: 200, easing: 'easeInOutQuad'}, BMMENU_USE_WEB_ANIMATIONS);

                supermenu._node.classList.remove('BMMenuTouchSubmenu');
                supermenu._node.classList.remove('BMMenuInactive');
            }
        }

        // Prevent interaction with the menu while its close animation is running
        this._node.style.pointerEvents = 'none'; 
        // this._node.inert = true;

        if (!supermenu) {
            this._containerNode.style.pointerEvents = 'none';
            // this._containerNode.inert = true;
        }

        this._frame = undefined;

        // Delay the actual menu node closing animation to allow time
        // for the menu items to run their animations
        let delay = this._node.childNodes.length * 16;
        delay = (delay < 0 ? 0 : delay);

        // If an item was clicked, further delay closing to allow the selection animation to play
        const delaysClosing = this._delaysClosing;
        this._delaysClosing = NO;
        if (delaysClosing && !this._sourceNodeShadow) {
            delay += 200;
        }

        const sourceNodeShadow = this._sourceNodeShadow;
        const containerNode = this._containerNode;
        const node = this._node;
        const sourceNode = this._sourceNode;

        this._sourceNode = undefined;
        this._sourceNodeShadow = undefined;

        // Clear the references to the items' nodes
        this._items.forEach(item => item._node = undefined);

        // Adjust the animation parameters depending on whether there is a node shadow displaying
        // alongside the menu
        const scale = sourceNodeShadow ? .33 : .75;
        const duration = sourceNodeShadow ? 200 : 400;
        const easing = sourceNodeShadow ? 'easeInOutQuad' : 'easeInQuad';

        if (sourceNodeShadow) {
            // If a node shadow is shown, animate it back towards its original node
            const sourceNodeProperties = {translateY: 0, translateX: 0, scaleX: 1, scaleY: 1};
            if (this._isSupermenuClosing) {
                sourceNodeProperties.opacity = 0;
            }

            __BMVelocityAnimate(sourceNodeShadow, sourceNodeProperties, {duration: duration, easing: easing, delay}, BMMENU_USE_WEB_ANIMATIONS);
            if (!supermenu) {
                // Do not modify the container node if this is a submenu as it is owned by the parent menu
                __BMVelocityAnimate(containerNode, {opacity: 0}, {duration: duration, easing: easing, delay}, BMMENU_USE_WEB_ANIMATIONS);
            }
        }

        this._isSupermenuClosing = NO;

        __BMVelocityAnimate(this._node, {
            scaleX: this._kind == BMMenuKind.PullDownMenu ? 1 : scale, 
            scaleY: scale, 
            opacity: (sourceNodeShadow && !supermenu) ? 1 : 0, 
            translateY: sourceNodeShadow ? -this._sourceNodeDisplacement + 'px' : '0px',
            translateX: sourceNodeShadow ? -this._sourceNodeHorizontalDisplacement + 'px' : '0px',
            translateZ: 0
        }, {
            duration: 200,
            easing: easing,
            delay: delay,
            complete: _ => {
                if (!supermenu) {
                    // Do not modify the container node if this is a submenu as it is owned by the parent menu
                    containerNode.remove();
                }
                else {
                    node.remove();
                }
                if (sourceNodeShadow) {
                    sourceNodeShadow.remove();
                    sourceNode.classList.remove(BMMenuSourceNodeCSSClass);
                }
                if (this.delegate && this.delegate.menuDidClose) {
                    this.delegate.menuDidClose(this);
                }
            }
        }, BMMENU_USE_WEB_ANIMATIONS);

        // Run the item animation in reverse order
        delay = 0;
        if (delaysClosing && !sourceNodeShadow) {
            // Delay this animation to allow the selection animation to run
            // if an item was selected
            delay = 200;
        }
        for (let i = this._node.childNodes.length - 1; i >= 0; i--) {
            let child = this._node.childNodes[i];
            __BMVelocityAnimate(child, {translateY: '16px', translateZ: 0, opacity: 0}, {
                duration: 100,
                easing: 'easeInQuad',
                delay: delay
            }, BMMENU_USE_WEB_ANIMATIONS);
            delay += 16;
        }

        this._node = undefined;
        this._containerNode = undefined;
    },

    /**
     * Invoked when the up arrow is pressed.
     * @param event <KeyboardEvent>     The event that triggered this action.
     */
    arrowUpPressedWithEvent(event) {
        if (this._highlightedIndex != 0) {
            // Find the previous index that may be highlighted
            let previousIndex = this._highlightedIndex;
            while (YES) {
                previousIndex = BMNumberByConstrainingNumberToBounds(previousIndex - 1, 0, this._items.length - 1);

                // If item at the previous index isn't a separator, highlight it
                if (!this._items[previousIndex]._isSeparator) break;

                // If the start of the items array has been reached and a viable highlightable item hasn't
                // been found, don't take any action
                if (previousIndex == 0) return;
            }
            this.highlightedIndex = previousIndex;
        }
    },

    /**
     * Invoked when the down arrow is pressed.
     * @param event <KeyboardEvent>     The event that triggered this action.
     */
    arrowDownPressedWithEvent(event) {
        if (this._highlightedIndex != this._items.length - 1) {
            // Find the next index that may be highlighted
            let nextIndex = this._highlightedIndex;
            while (YES) {
                nextIndex = BMNumberByConstrainingNumberToBounds(nextIndex + 1, 0, this._items.length - 1);

                // If item at the next index isn't a separator, highlight it
                if (!this._items[nextIndex]._isSeparator) break;

                // If the end of the items array has been reached and a viable highlightable item hasn't
                // been found, don't take any action
                if (nextIndex == this._items.length - 1) return;
            }
            this.highlightedIndex = nextIndex;
        }
    },

    /**
     * Invoked when the right arrow is pressed.
     * @param event <KeyboardEvent>     The event that triggered this action.
     */
    arrowRightPressedWithEvent(event) {
        const item = this._items[this._highlightedIndex];
        if (!item) return;

        // If the currently focused item has a submenu, open it and cause it
        // to acquire keyboard focus
        if (item._submenu) {
            this._openSubmenuForMenuItem(item, {delayEvents: NO, acquireFocus: YES});
        }
    },

    /**
     * Invoked when the left arrow is pressed.
     * @param event <KeyboardEvent>     The event that triggered this action.
     */
    arrowLeftPressedWithEvent(event) {
        // If this menu is displayed as a submenu, close it and restore focus
        // back to the supermenu
        if (this._supermenu) {
            this.closeAnimated(YES);
        }
    },

    /**
     * Invoked when the return or spacebar key is pressed.
     * @param event <KeyboardEvent>     The event that triggered this action.
     */
    returnPressedWithEvent(event) {
        if (this._highlightedIndex >= 0 && this._highlightedIndex < this._items.length) {
            const item = this._items[this._highlightedIndex];

            // Ask the delegate if this menu item should be selected
            let shouldSelect = YES;
            if (this.delegate && this.delegate.menuShouldSelectItem) {
                shouldSelect = this.delegate.menuShouldSelectItem(this, item);
            }

            if (!shouldSelect) return;

            // For desktop menus, delay closing slightly to allow the selection
            // animation to play out
            this._delaysClosing = YES;

            if (item.action) item.action(item);

            if (this.delegate && this.delegate.menuDidSelectItem) {
                this.delegate.menuDidSelectItem(this, item);
            }

            const highlightedNode = item._node;
            if (highlightedNode) {
                highlightedNode.classList.add('BMMenuItemActive');
            }

            this.closeAnimated(YES, {withSupermenu: YES});
        }
    },

    /**
     * Invoked when the tab key is pressed.
     * @param event <KeyboardEvent>     The event that triggered this action.
     */
    tabPressedWithEvent(event) {
        // No action, this just prevents the keyboard focus from moving to another element
    },

    /**
     * Invoked when the escape key is pressed.
     * @param event <KeyboardEvent>     The event that triggered this action.
     */
    escapePressedWithEvent(event) {
        if (this._node) {
            this.closeAnimated(YES);
        }
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
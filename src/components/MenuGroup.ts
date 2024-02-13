import * as shadyCss from '@webcomponents/shadycss';
import menuGroupCss from './MenuGroup.css';
import { Attribute } from '../util/Attribute';
import { arrayFind, arrayFindIndex, fromArrayLike, isElement, isHTMLElement, noOp, upgradeCustomElementIfNeeded } from '../util/CommonUtils';
import { CLOSE_MENU_EVENT, type CloseMenuEvent } from '../events/CloseMenuEvent';
import { TOGGLE_MENU_EVENT, type ToggleMenuEvent } from '../events/ToggleMenuEvent';
import { isBackKey } from '../util/KeyCode';
import { createCustomEvent } from '../util/EventUtils';
import type { MenuChangeEvent } from '../events/MenuChangeEvent';
import { MENU_CHANGE_EVENT } from '../events/MenuChangeEvent';
import { Menu } from './Menu';

export interface MenuGroupOptions {
    template?: HTMLTemplateElement;
}

export function menuGroupTemplate(content: string, extraCss: string = ''): string {
    return `<style>${menuGroupCss}${extraCss}</style>${content}`;
}

const defaultTemplate = document.createElement('template');
defaultTemplate.innerHTML = menuGroupTemplate(`<slot></slot>`);
shadyCss.prepareTemplate(defaultTemplate, 'theoplayer-menu-group');

interface OpenMenuEntry {
    menu: Menu | MenuGroup;
    opener: HTMLElement | undefined;
}

/**
 * `<theoplayer-menu-group>` - A group of {@link Menu}s.
 *
 * This can contain multiple other menus, which can be opened with {@link MenuGroup.openMenu}.
 * When a {@link MenuButton} in one menu opens another menu in this group, it is opened as a "submenu".
 * When a submenu is closed, the menu that originally opened it is shown again.
 *
 * @attribute `menu-opened` (readonly) - Whether any menu in the group is currently open.
 * @group Components
 */
export class MenuGroup extends HTMLElement {
    static get observedAttributes() {
        return [Attribute.MENU_OPENED];
    }

    private readonly _menuSlot: HTMLSlotElement | null;
    private _menus: Array<Menu | MenuGroup> = [];
    private readonly _openMenuStack: OpenMenuEntry[] = [];

    constructor(options?: MenuGroupOptions) {
        super();
        const template = options?.template ?? defaultTemplate;
        const shadowRoot = this.attachShadow({ mode: 'open', delegatesFocus: true });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._menuSlot = shadowRoot.querySelector('slot');
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        if (!this.hasAttribute(Attribute.MENU_OPENED)) {
            this.setAttribute('hidden', '');
        }

        this._onMenuListChange();

        this.shadowRoot!.addEventListener(TOGGLE_MENU_EVENT, this._onToggleMenu);
        this.shadowRoot!.addEventListener(CLOSE_MENU_EVENT, this._onCloseMenu);
        this.shadowRoot!.addEventListener(MENU_CHANGE_EVENT, this._onMenuChange);
        this._menuSlot?.addEventListener('slotchange', this._onMenuListChange);
    }

    disconnectedCallback(): void {
        this.shadowRoot!.removeEventListener(TOGGLE_MENU_EVENT, this._onToggleMenu);
        this.shadowRoot!.removeEventListener(CLOSE_MENU_EVENT, this._onCloseMenu);
        this.shadowRoot!.removeEventListener(MENU_CHANGE_EVENT, this._onMenuChange);
        this._menuSlot?.removeEventListener('slotchange', this._onMenuListChange);
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (newValue === oldValue) {
            return;
        }
        if (attrName === Attribute.MENU_OPENED) {
            const hasValue = newValue != null;
            if (hasValue) {
                this.removeAttribute('hidden');
                this.removeEventListener('keydown', this._onKeyDown);
                this.addEventListener('keydown', this._onKeyDown);
            } else {
                this.setAttribute('hidden', '');
                this.removeEventListener('keydown', this._onKeyDown);
            }
            const changeEvent: MenuChangeEvent = createCustomEvent(MENU_CHANGE_EVENT, { bubbles: true });
            this.dispatchEvent(changeEvent);
        }
        if (MenuGroup.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }

    /**
     * Get the menu with the given ID.
     *
     * @param [menuId] - The ID of the menu. If unset, returns this menu group.
     */
    getMenuById(menuId?: string): Menu | MenuGroup | undefined {
        if (!menuId || menuId === this.id) {
            return this;
        }
        return arrayFind(this._menus, (menu) => menu.id === menuId);
    }

    /**
     * Open the menu with the given ID.
     *
     * If no ID is given, the first menu in the group is opened.
     *
     * If there's already an open menu, then the new menu is opened as a "submenu".
     * When it closed, the previous menu is opened.
     *
     * @param [menuId] - The ID of the menu to open.
     * @param [opener] - The control that opened the menu. When the menu is closed, focus is moved back to this control.
     * @returns True if the given menu was found.
     */
    openMenu(menuId?: string, opener?: HTMLElement): boolean {
        let menuToOpen = this.getMenuById(menuId);
        if (menuToOpen === this) {
            menuToOpen = this._menus[0];
        }
        if (!menuToOpen) {
            return false;
        }

        const previousEntry = this.getCurrentMenu_();
        const index = arrayFindIndex(this._openMenuStack, (entry) => entry.menu === menuToOpen);
        if (index >= 0) {
            // Already open.
            // Close subsequent menus to move menu back to top of the stack.
            this.closeMenusFromIndex_(index + 1);
        } else {
            // Not yet open, add to top of the stack.
            this._openMenuStack.push({ menu: menuToOpen, opener });
        }

        if (previousEntry) {
            previousEntry.menu.closeMenu();
        }
        menuToOpen.openMenu();
        this.setAttribute(Attribute.MENU_OPENED, '');

        menuToOpen.focus();
        return true;
    }

    /**
     * Closes the menu with the given ID.
     *
     * If no ID is given, then the entire menu group is closed.
     *
     * If the given menu has opened one or more submenus, then those are also closed.
     * If the last open menu is closed, then the menu group also becomes closed.
     *
     * @param [menuId] - The ID of the menu to close.
     * @returns True if the given menu was found and closed.
     */
    closeMenu(menuId?: string): boolean {
        let menuToClose = this.getMenuById(menuId);
        if (menuToClose === this) {
            menuToClose = this._openMenuStack[0]?.menu;
        }
        if (!menuToClose) {
            return false;
        }
        const index = arrayFindIndex(this._openMenuStack, (entry) => entry.menu === menuToClose);
        if (index < 0) {
            return false;
        }

        const oldEntry = this._openMenuStack[index];
        // Close this menu and all subsequent menus
        this.closeMenusFromIndex_(index);

        const nextEntry = this.getCurrentMenu_();
        if (nextEntry !== undefined) {
            nextEntry.menu.openMenu();
            this.setAttribute(Attribute.MENU_OPENED, '');
            if (oldEntry.opener && nextEntry.menu.contains(oldEntry.opener)) {
                oldEntry.opener.focus();
            } else {
                nextEntry.menu.focus();
            }
            return true;
        }

        this.removeAttribute(Attribute.MENU_OPENED);
        oldEntry.opener?.focus();
        return true;
    }

    private closeMenusFromIndex_(index: number): void {
        const menusToClose = this._openMenuStack.length - index;
        for (let i = this._openMenuStack.length - 1; i >= index; i--) {
            this._openMenuStack[i].menu.closeMenu();
        }
        this._openMenuStack.splice(index, menusToClose);
    }

    /**
     * Whether this menu group has a currently open menu.
     */
    hasCurrentMenu(): boolean {
        return this._openMenuStack.length > 0;
    }

    private getCurrentMenu_(): OpenMenuEntry | undefined {
        return this._openMenuStack.length > 0 ? this._openMenuStack[this._openMenuStack.length - 1] : undefined;
    }

    /**
     * Close the current menu.
     */
    closeCurrentMenu(): boolean {
        const currentMenu = this.getCurrentMenu_();
        if (currentMenu !== undefined) {
            this.closeMenu(currentMenu.menu.id);
            return true;
        }
        return false;
    }

    /**
     * Whether the menu with the given ID is currently open.
     *
     * @param [menuId] - The ID of the menu.
     */
    isMenuOpen(menuId?: string): boolean {
        const menu = this.getMenuById(menuId);
        if (!menu) {
            return false;
        }
        return this._openMenuStack.some((entry) => entry.menu === menu);
    }

    /**
     * Update the list of menus whenever the `<slot>` contents change.
     * Note: the `slotchange` event bubbles up, so we don't have to manually attach
     * this listener to each nested `<slot>`.
     */
    private readonly _onMenuListChange = () => {
        const children: Element[] = [
            ...fromArrayLike(this.shadowRoot!.children),
            ...(this._menuSlot ? this._menuSlot.assignedNodes({ flatten: true }).filter(isElement) : [])
        ];
        const upgradePromises: Array<Promise<unknown>> = [];
        for (const child of children) {
            if (!isMenuElement(child)) {
                const promise = upgradeCustomElementIfNeeded(child);
                if (promise) {
                    upgradePromises.push(promise);
                }
            }
        }
        if (upgradePromises.length > 0) {
            Promise.all(upgradePromises).then(this._onMenuListChange, noOp);
        }
        const newMenus = children.filter(isMenuElement);
        // Close all removed menus
        for (const oldMenu of this._menus) {
            if (newMenus.indexOf(oldMenu) < 0) {
                this.closeMenu(oldMenu.id);
            }
        }
        // Ensure newly added menus start as closed
        for (const newMenu of newMenus) {
            if (this._menus.indexOf(newMenu) < 0) {
                newMenu.closeMenu();
            }
        }
        this._menus = newMenus;
    };

    private readonly _onToggleMenu = (rawEvent: Event): void => {
        const event = rawEvent as ToggleMenuEvent;
        const menuId = event.detail.menu;
        if (!this.getMenuById(menuId)) {
            // Not our menu, allow event to bubble further up.
            return;
        }
        event.stopPropagation();
        const opener = isHTMLElement(event.target) ? event.target : undefined;
        if (this.isMenuOpen(menuId)) {
            this.closeMenu(menuId);
        } else {
            this.openMenu(menuId, opener);
        }
    };

    private readonly _onCloseMenu = (rawEvent: Event): void => {
        const event = rawEvent as CloseMenuEvent;
        if (this.closeCurrentMenu()) {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    private readonly _onMenuChange = (rawEvent: Event): void => {
        const event = rawEvent as MenuChangeEvent;
        const currentMenu = this.getCurrentMenu_();
        // If the current menu is another menu container which no longer has an open menu, close it
        if (currentMenu && currentMenu.menu === event.target && currentMenu.menu instanceof MenuGroup && !currentMenu.menu.hasCurrentMenu()) {
            this.closeCurrentMenu();
        }
    };

    private readonly _onKeyDown = (event: KeyboardEvent) => {
        // Don't handle modifier shortcuts typically used by assistive technology.
        if (event.altKey) return;

        if (isBackKey(event.keyCode)) {
            if (this.closeCurrentMenu()) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    };
}

customElements.define('theoplayer-menu-group', MenuGroup);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-menu-group': MenuGroup;
    }
}

function isMenuElement(element: Node): element is Menu | MenuGroup {
    if (!isHTMLElement(element)) {
        return false;
    }
    return element instanceof Menu || element instanceof MenuGroup;
}

import * as shadyCss from '@webcomponents/shadycss';
import menuContainerCss from './MenuContainer.css';
import { Attribute } from '../util/Attribute';
import { arrayFind, arrayFindIndex, isHTMLElement } from '../util/CommonUtils';
import { CLOSE_MENU_EVENT, CloseMenuEvent } from '../events/CloseMenuEvent';
import { TOGGLE_MENU_EVENT, ToggleMenuEvent } from '../events/ToggleMenuEvent';
import { KeyCode } from '../util/KeyCode';

const template = document.createElement('template');
template.innerHTML = `<style>${menuContainerCss}</style><slot></slot>`;
shadyCss.prepareTemplate(template, 'theoplayer-menu-container');

interface OpenMenuEntry {
    menu: HTMLElement;
    opener: HTMLElement | undefined;
}

export class MenuContainer extends HTMLElement {
    static get observedAttributes() {
        return [Attribute.MENU_IS_ROOT, Attribute.MENU_OPENED];
    }

    private readonly _menuSlot: HTMLSlotElement;
    private _menus: HTMLElement[] = [];
    private readonly _openMenuStack: OpenMenuEntry[] = [];

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open', delegatesFocus: true });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._menuSlot = shadowRoot.querySelector('slot')!;
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        this._onMenuSlotChange();

        this.shadowRoot!.addEventListener(TOGGLE_MENU_EVENT, this._onToggleMenu);
        this.shadowRoot!.addEventListener(CLOSE_MENU_EVENT, this._onCloseMenu);
        this._menuSlot.addEventListener('slotchange', this._onMenuSlotChange);
    }

    disconnectedCallback(): void {
        this.shadowRoot!.removeEventListener(TOGGLE_MENU_EVENT, this._onToggleMenu);
        this.shadowRoot!.removeEventListener(CLOSE_MENU_EVENT, this._onCloseMenu);
        this._menuSlot.removeEventListener('slotchange', this._onMenuSlotChange);
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (MenuContainer.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }

    getMenuById(menuId?: string): HTMLElement | undefined {
        if (!menuId || menuId === this.id) {
            return this;
        }
        return arrayFind(this._menus, (menu) => menu.id === menuId);
    }

    openMenu(menuId?: string, opener?: HTMLElement): boolean {
        let menuToOpen = this.getMenuById(menuId);
        if (menuToOpen === this) {
            menuToOpen = this._menus[0];
        }
        if (!menuToOpen) {
            return false;
        }

        if (menuToOpen.hasAttribute(Attribute.MENU_IS_ROOT)) {
            // Close all menus before opening a root menu.
            this.closeMenusFromIndex_(0);
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
            if (previousEntry.menu instanceof MenuContainer) {
                previousEntry.menu.closeMenu();
            }
            previousEntry.menu.setAttribute('hidden', '');
        }

        menuToOpen.removeAttribute('hidden');
        if (menuToOpen instanceof MenuContainer) {
            menuToOpen.openMenu();
        }

        this.removeEventListener('keydown', this._onKeyDown);
        this.addEventListener('keydown', this._onKeyDown);
        this.setAttribute(Attribute.MENU_OPENED, '');

        menuToOpen.focus();
        return true;
    }

    closeMenu(menuId?: string): boolean {
        let menuToClose = this.getMenuById(menuId);
        if (menuToClose === this) {
            menuToClose = this._openMenuStack[0]?.menu;
        }
        if (!menuToClose) {
            return false;
        }

        const index = arrayFindIndex(this._openMenuStack, (entry) => entry.menu === menuToClose);
        let oldEntry: OpenMenuEntry | undefined;
        if (index >= 0) {
            oldEntry = this._openMenuStack[index];
            // Close this menu and all subsequent menus
            this.closeMenusFromIndex_(index);
        }

        const nextEntry = this.getCurrentMenu_();
        if (nextEntry !== undefined) {
            nextEntry.menu.removeAttribute('hidden');
            this.setAttribute(Attribute.MENU_OPENED, '');
            if (oldEntry && oldEntry.opener && nextEntry.menu.contains(oldEntry.opener)) {
                oldEntry.opener.focus();
            } else {
                nextEntry.menu.focus();
            }
            return true;
        }

        this.removeEventListener('keydown', this._onKeyDown);
        this.removeAttribute(Attribute.MENU_OPENED);

        oldEntry?.opener?.focus();
        return true;
    }

    private closeMenusFromIndex_(index: number): void {
        const menusToClose = this._openMenuStack.length - index;
        for (let i = index; i < this._openMenuStack.length; i++) {
            this._openMenuStack[i].menu.setAttribute('hidden', '');
        }
        this._openMenuStack.splice(index, menusToClose);
    }

    hasCurrentMenu(): boolean {
        return this._openMenuStack.length > 0;
    }

    private getCurrentMenu_(): OpenMenuEntry | undefined {
        return this._openMenuStack.length > 0 ? this._openMenuStack[this._openMenuStack.length - 1] : undefined;
    }

    closeCurrentMenu(): boolean {
        const currentMenu = this.getCurrentMenu_();
        if (currentMenu !== undefined) {
            this.closeMenu(currentMenu.menu.id);
            return true;
        }
        return false;
    }

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
    private _onMenuSlotChange = () => {
        const newMenus = this._menuSlot.assignedNodes({ flatten: true }).filter(isHTMLElement);
        for (const oldMenu of this._menus) {
            if (newMenus.indexOf(oldMenu) < 0) {
                this.closeMenu(oldMenu.id);
            }
        }
        for (const newMenu of newMenus) {
            if (this._menus.indexOf(newMenu) < 0) {
                newMenu.setAttribute('hidden', '');
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

    private readonly _onKeyDown = (event: KeyboardEvent) => {
        // Don't handle modifier shortcuts typically used by assistive technology.
        if (event.altKey) return;

        switch (event.keyCode) {
            case KeyCode.ESCAPE:
                if (this.closeCurrentMenu()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            // Any other key press is ignored and passed back to the browser.
            default:
                return;
        }
    };
}

customElements.define('theoplayer-menu-container', MenuContainer);

import * as shadyCss from '@webcomponents/shadycss';
import menuCss from './Menu.css';
import { CLOSE_MENU_EVENT, CloseMenuEvent } from '../events/CloseMenuEvent';
import { MENU_CHANGE_EVENT, MenuChangeEvent } from '../events/MenuChangeEvent';
import { createCustomEvent } from '../util/EventUtils';
import { Attribute } from '../util/Attribute';

export interface MenuOptions {
    template?: HTMLTemplateElement;
}

export function menuTemplate(heading: string, content: string, extraCss: string = ''): string {
    return (
        `<style>${menuCss}${extraCss}</style>` +
        `<div part="heading"><theoplayer-menu-close-button></theoplayer-menu-close-button><span>${heading}</span></div>` +
        `<div part="content">${content}</div>`
    );
}

const defaultTemplate = document.createElement('template');
defaultTemplate.innerHTML = menuTemplate('<slot name="heading"></slot>', '<slot></slot>');
shadyCss.prepareTemplate(defaultTemplate, 'theoplayer-menu');

export class Menu extends HTMLElement {
    static get observedAttributes() {
        return [Attribute.MENU_OPENED, Attribute.MENU_CLOSE_ON_INPUT];
    }

    private readonly _contentEl: HTMLElement;

    constructor(options?: MenuOptions) {
        super();
        const template = options?.template ?? defaultTemplate;
        const shadowRoot = this.attachShadow({ mode: 'open', delegatesFocus: true });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._contentEl = shadowRoot.querySelector('[part="content"]')!;
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        if (!this.hasAttribute(Attribute.MENU_OPENED)) {
            this.setAttribute('hidden', '');
        }

        this._contentEl.addEventListener('input', this._onContentInput);
    }

    disconnectedCallback(): void {
        this._contentEl.removeEventListener('input', this._onContentInput);
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    openMenu(): void {
        this.setAttribute(Attribute.MENU_OPENED, '');
    }

    closeMenu(): void {
        this.removeAttribute(Attribute.MENU_OPENED);
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (newValue === oldValue) {
            return;
        }
        if (attrName === Attribute.MENU_OPENED) {
            const hasValue = newValue != null;
            if (hasValue) {
                this.removeAttribute('hidden');
            } else {
                this.setAttribute('hidden', '');
            }
            const changeEvent: MenuChangeEvent = createCustomEvent(MENU_CHANGE_EVENT, { bubbles: true });
            this.dispatchEvent(changeEvent);
        }
        if (Menu.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }

    private readonly _onContentInput = (): void => {
        // Close menu when clicking any button
        if (this.hasAttribute(Attribute.MENU_CLOSE_ON_INPUT)) {
            const event: CloseMenuEvent = createCustomEvent(CLOSE_MENU_EVENT, {
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        }
    };
}

customElements.define('theoplayer-menu', Menu);

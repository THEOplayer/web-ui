import * as shadyCss from '@webcomponents/shadycss';
import menuCss from './Menu.css';
import { CLOSE_MENU_EVENT, CloseMenuEvent } from '../events/CloseMenuEvent';
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
        return [Attribute.MENU_IS_ROOT];
    }

    constructor(options?: MenuOptions) {
        super();
        const template = options?.template ?? defaultTemplate;
        const shadowRoot = this.attachShadow({ mode: 'open', delegatesFocus: true });
        shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    get isRootMenu(): boolean {
        return this.hasAttribute(Attribute.MENU_IS_ROOT);
    }

    set isRootMenu(value: boolean) {
        if (value) {
            this.setAttribute(Attribute.MENU_IS_ROOT, '');
        } else {
            this.removeAttribute(Attribute.MENU_IS_ROOT);
        }
    }

    close(): void {
        const event: CloseMenuEvent = createCustomEvent(CLOSE_MENU_EVENT, {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (Menu.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-menu', Menu);

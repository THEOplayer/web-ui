import * as shadyCss from '@webcomponents/shadycss';
import menuCss from './Menu.css';
import { CLOSE_MENU_EVENT, CloseMenuEvent } from '../events/CloseMenuEvent';
import { createCustomEvent } from '../util/EventUtils';

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

    close(): void {
        const event: CloseMenuEvent = createCustomEvent(CLOSE_MENU_EVENT, {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
    }
}

customElements.define('theoplayer-menu', Menu);

import * as shadyCss from '@webcomponents/shadycss';
import menuCss from './Menu.css';

export interface MenuOptions {
    template?: HTMLTemplateElement;
}

export function menuTemplate(heading: string, content: string, extraCss: string = ''): string {
    return (
        `<style>${menuCss}${extraCss}</style>` +
        `<div part="heading"><h1>${heading}</h1><theoplayer-menu-close-button></theoplayer-menu-close-button></div>` +
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
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);
    }
}

customElements.define('theoplayer-menu', Menu);

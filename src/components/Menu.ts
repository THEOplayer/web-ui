import * as shadyCss from '@webcomponents/shadycss';
import menuCss from './Menu.css';

const template = document.createElement('template');
template.innerHTML = `<style>${menuCss}</style><slot></slot>`;
shadyCss.prepareTemplate(template, 'theoplayer-menu');

export class Menu extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define('theoplayer-menu', Menu);

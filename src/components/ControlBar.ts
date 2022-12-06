import * as shadyCss from '@webcomponents/shadycss';
import controlBarCss from './ControlBar.css';

const template = document.createElement('template');
template.innerHTML = `<style>${controlBarCss}</style><slot></slot>`;
shadyCss.prepareTemplate(template, 'theoplayer-control-bar');

export class ControlBar extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);
    }
}

customElements.define('theoplayer-control-bar', ControlBar);

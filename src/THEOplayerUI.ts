import * as shadyCss from '@webcomponents/shadycss';
import css from './THEOplayerUI.css';
import html from './THEOplayerUI.html';

const template = document.createElement('template');
template.innerHTML = `<style>${css}</style>${html}`;
shadyCss.prepareTemplate(template, 'theoplayer-ui');

export class THEOplayerUI extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        shadyCss.styleElement(this);
        if (!this.shadowRoot) {
            this.attachShadow({ mode: 'open' });
            this.shadowRoot!.appendChild(template.content.cloneNode(true));
        }
    }
}

customElements.define('theoplayer-ui', THEOplayerUI);

import * as shadyCss from '@webcomponents/shadycss';
import css from './THEOplayerUI.css';

const template = document.createElement('template');
// language=HTML
template.innerHTML = `
    <style>${css}</style>
    <div part="layer media-layer">
        <slot name="media"></slot>
    </div>
    <div part="layer poster-layer">
        <slot name="poster"></slot>
    </div>
    <div part="layer vertical-layer">
        <div part="top chrome">
            <slot name="top-chrome"></slot>
        </div>
        <div part="middle chrome">
            <slot name="middle-chrome"></slot>
        </div>
        <div part="layer centered-layer center centered chrome">
            <slot name="centered-chrome"></slot>
        </div>
        <div part="bottom chrome">
            <slot>${/* default, effectively "bottom-chrome" */ ''}</slot>
        </div>
    </div>
`;
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

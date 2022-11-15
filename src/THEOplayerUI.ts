import * as shadyCss from '@webcomponents/shadycss';

const template = document.createElement('template');
// language=HTML
template.innerHTML = `
    <style>
        :host {
            box-sizing: border-box;
            position: relative;
            width: 600px;
            height: 400px;
            display: inline-block;
            line-height: 0;
            background-color: var(--media-background-color, #000);
        }

        [part~=layer]:not([part~=media-layer]) {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            display: flex;
            flex-flow: column nowrap;
            align-items: start;
            pointer-events: none;
            background: none;
        }

        [part~=middle] {
            display: inline;
            flex-grow: 1;
            pointer-events: none;
            background: none;
        }
    </style>
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

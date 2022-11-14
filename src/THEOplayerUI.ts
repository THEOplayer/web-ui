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

        .layer:not(.media-layer) {
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

        .middle.chrome {
            display: inline;
            flex-grow: 1;
            pointer-events: none;
            background: none;
        }
    </style>

    <slot name="media" class="layer media-layer"></slot>
    <slot name="poster" class="layer poster-layer"></slot>
    <div class="layer vertical-layer">
        <slot name="top-chrome" class="top chrome"></slot>
        <slot name="middle-chrome" class="middle chrome"></slot>
        <slot name="centered-chrome" class="layer centered-layer center centered chrome"></slot>
    ${/* default, effectively "bottom-chrome" */ ''}
        <slot class="bottom chrome"></slot>
    </div>
`;

export class THEOplayerUI extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.appendChild(template.content.cloneNode(true));
    }
}

customElements.define('theoplayer-ui', THEOplayerUI);

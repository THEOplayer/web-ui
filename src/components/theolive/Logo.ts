import {createTemplate} from "../../util/TemplateUtils";
import {Attribute} from "../../util/Attribute";

const template = createTemplate('theolive-logo', `
    <style>
        :host {
            position: absolute;
            left: 1rem;
            top: 1rem;
            min-height: 50px;
            max-height: 150px;
            height: 50%;
        }
        img {
            height: 100%;
        }
    </style>
`);

export class Logo extends HTMLElement {

    static get observedAttributes() {
        return [Attribute.VALUE];
    }

    private readonly _shadowRoot: ShadowRoot;
    private readonly _img: HTMLImageElement;

    constructor() {
        super();
        this._shadowRoot = this.attachShadow({mode: 'open', delegatesFocus: true});
        this._shadowRoot.appendChild(template().content.cloneNode(true));

        this._img = new Image();
        this._img.alt = 'logo';
    }

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        if (name === Attribute.VALUE) {
            if (oldValue == newValue) {
                return;
            }
            if (!newValue) {
                this._shadowRoot.removeChild(this._img);
            } else {
                this._img.src = newValue;
                this._shadowRoot.appendChild(this._img);
            }
        }
    }
}

customElements.define('theolive-logo', Logo);

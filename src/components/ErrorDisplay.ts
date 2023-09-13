import * as shadyCss from '@webcomponents/shadycss';
import errorDisplayCss from './ErrorDisplay.css';
import errorIcon from '../icons/error.svg';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { THEOplayerError } from 'theoplayer/chromeless';
import { setTextContent } from '../util/CommonUtils';
import { Attribute } from '../util/Attribute';

const template = document.createElement('template');
template.innerHTML =
    `<style>${errorDisplayCss}</style>` +
    `<div part="icon"><slot name="icon">${errorIcon}</slot></div>` +
    `<div part="text">` +
    `<h1 part="heading"><slot name="heading">An error occurred</slot></h1>` +
    `<p part="message"><slot name="message"></slot></p>` +
    `</div>` +
    `<div part="fullscreen-controls">` +
    `<slot name="fullscreen-controls"><theoplayer-fullscreen-button></theoplayer-fullscreen-button></slot>` +
    `</div>`;
shadyCss.prepareTemplate(template, 'theoplayer-error-display');

/**
 * A screen that shows the details of a fatal player error.
 *
 * @group Components
 */
export class ErrorDisplay extends StateReceiverMixin(HTMLElement, ['error', 'fullscreen']) {
    private readonly _messageSlot: HTMLSlotElement;
    private _error: THEOplayerError | undefined;

    static get observedAttributes() {
        return [Attribute.FULLSCREEN];
    }

    constructor() {
        super();

        const shadowRoot = this.attachShadow({ mode: 'open', delegatesFocus: true });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._messageSlot = shadowRoot.querySelector('slot[name="message"]')!;

        this._upgradeProperty('error');
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);
    }

    /**
     * The error.
     */
    get error(): THEOplayerError | undefined {
        return this._error;
    }

    set error(error: THEOplayerError | undefined) {
        this._error = error;
        setTextContent(this._messageSlot, error ? error.message : '');
    }

    get fullscreen(): boolean {
        return this.hasAttribute(Attribute.FULLSCREEN);
    }

    set fullscreen(fullscreen: boolean) {
        if (fullscreen) {
            this.setAttribute(Attribute.FULLSCREEN, '');
        } else {
            this.removeAttribute(Attribute.FULLSCREEN);
        }
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (ErrorDisplay.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-error-display', ErrorDisplay);

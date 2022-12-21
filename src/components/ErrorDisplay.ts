import * as shadyCss from '@webcomponents/shadycss';
import errorDisplayCss from './ErrorDisplay.css';
import errorIcon from '../icons/error.svg';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { THEOplayerError } from 'theoplayer';
import { setTextContent } from '../util/CommonUtils';

const template = document.createElement('template');
template.innerHTML =
    `<style>${errorDisplayCss}</style>` +
    `<div part="icon"><slot name="icon">${errorIcon}</slot></div>` +
    `<div part="text">` +
    `<h1 part="heading"><slot name="heading">An error occurred</slot></h1>` +
    `<p part="message"><slot name="message"></slot></p>` +
    `</div>`;
shadyCss.prepareTemplate(template, 'theoplayer-error-display');

export class ErrorDisplay extends StateReceiverMixin(HTMLElement, ['error']) {
    private readonly _messageSlot: HTMLSlotElement;
    private _error: THEOplayerError | undefined;

    constructor() {
        super();

        const shadowRoot = this.attachShadow({ mode: 'open', delegatesFocus: true });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._messageSlot = shadowRoot.querySelector('slot[name="message"]')!;
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);
    }

    setError(error: THEOplayerError | undefined): void {
        this._error = error;
        setTextContent(this._messageSlot, error ? error.message : '');
    }
}

customElements.define('theoplayer-error-display', ErrorDisplay);

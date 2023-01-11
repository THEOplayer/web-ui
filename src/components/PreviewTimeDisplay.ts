import * as shadyCss from '@webcomponents/shadycss';
import textDisplayCss from './TextDisplay.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import { setTextContent } from '../util/CommonUtils';
import { formatTime } from '../util/TimeUtils';

const template = document.createElement('template');
template.innerHTML = `<style>${textDisplayCss}</style><span></span>`;
shadyCss.prepareTemplate(template, 'theoplayer-preview-time-display');

export class PreviewTimeDisplay extends StateReceiverMixin(HTMLElement, ['previewTime']) {
    private readonly _spanEl: HTMLElement;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        this._spanEl = shadowRoot.querySelector('span')!;
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);
    }

    setPreviewTime(previewTime: number): void {
        setTextContent(this._spanEl, formatTime(previewTime));
    }
}

customElements.define('theoplayer-preview-time-display', PreviewTimeDisplay);

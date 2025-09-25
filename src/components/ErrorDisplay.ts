import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import errorDisplayCss from './ErrorDisplay.css';
import errorIcon from '../icons/error.svg';
import { stateReceiver } from './StateReceiverMixin';
import type { THEOplayerError } from 'theoplayer/chromeless';
import { Attribute } from '../util/Attribute';

/**
 * A screen that shows the details of a fatal player error.
 *
 * @group Components
 */
@customElement('theoplayer-error-display')
@stateReceiver(['error', 'fullscreen'])
export class ErrorDisplay extends LitElement {
    static override styles = [errorDisplayCss];
    static override shadowRootOptions: ShadowRootInit = {
        ...LitElement.shadowRootOptions,
        delegatesFocus: true
    };

    /**
     * The error.
     */
    @property({ reflect: false, attribute: false })
    accessor error: THEOplayerError | undefined;

    @property({ reflect: true, type: Boolean, attribute: Attribute.FULLSCREEN })
    accessor fullscreen: boolean = false;

    protected override render() {
        return html`<div part="icon"><slot name="icon">${unsafeSVG(errorIcon)}</slot></div>
            <div part="text">
                <h1 part="heading"><slot name="heading">An error occurred</slot></h1>
                <p part="message"><slot name="message">${this.error?.message ?? ''}</slot></p>
            </div>
            <div part="fullscreen-controls">
                <slot name="fullscreen-controls"><theoplayer-fullscreen-button></theoplayer-fullscreen-button></slot>
            </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-error-display': ErrorDisplay;
    }
}

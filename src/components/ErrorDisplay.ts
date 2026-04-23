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
 * @cssproperty `--theoplayer-error-icon-color` - The color of the error icon. Defaults to `--theoplayer-icon-color`.
 * @cssproperty `--theoplayer-error-icon-width` - The width of the error icon. Defaults to `48px`.
 * @cssproperty `--theoplayer-error-icon-height` - The height of the error icon. Defaults to `48px`.
 * @cssproperty `--theoplayer-error-icon-gap` - The gap between the error icon and the text. Defaults to `10px`.
 * @cssproperty `--theoplayer-error-heading-color` - The text color of the error heading. Defaults to `#fff`.
 * @cssproperty `--theoplayer-error-heading-margin` - The margin around the error heading. Defaults to `0 0 10px`.
 * @cssproperty `--theoplayer-error-message-color` - The text color of the error message. Defaults to `#fff`.
 * @cssproperty `--theoplayer-error-message-margin` - The margin around the error message. Defaults to `0`.
 * @cssproperty `--theoplayer-error-min-width` - The minimum width of the error display. Defaults to `0`.
 * @cssproperty `--theoplayer-error-max-width` - The maximum width of the error display. Defaults to `80%`.
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

import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { stateReceiver } from './StateReceiverMixin';
import { customElement, state } from 'lit/decorators.js';

/**
 * A control that displays the current playback rate of the player.
 *
 * @group Components
 */
@customElement('theoplayer-playback-rate-display')
@stateReceiver(['playbackRate'])
export class PlaybackRateDisplay extends LitElement {
    /**
     * The current playback rate.
     */
    @state()
    accessor playbackRate: number = 1;

    protected override render(): HTMLTemplateResult {
        return html`<span>${this.playbackRate === 1 ? 'Normal' : `${this.playbackRate}x`}</span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-playback-rate-display': PlaybackRateDisplay;
    }
}

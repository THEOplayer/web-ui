import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { stateReceiver } from './StateReceiverMixin';
import { customElement, property, state } from 'lit/decorators.js';
import { getLocale, languageContext } from '../i18n';
import { Attribute } from '../util/Attribute';
import { consume } from '@lit/context';

/**
 * A control that displays the current playback rate of the player.
 */
@customElement('theoplayer-playback-rate-display')
@stateReceiver(['playbackRate'])
export class PlaybackRateDisplay extends LitElement {
    @property({ reflect: true, type: String, attribute: Attribute.LANG })
    @consume({ context: languageContext, subscribe: true })
    accessor lang: string = '';

    /**
     * The current playback rate.
     */
    @state()
    accessor playbackRate: number = 1;

    protected override render(): HTMLTemplateResult {
        const locale = getLocale(this.lang);
        return html`<span>${locale.formatPlaybackRate(this.playbackRate)}</span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-playback-rate-display': PlaybackRateDisplay;
    }
}

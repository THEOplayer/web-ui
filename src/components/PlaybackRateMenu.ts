import { html, type HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Menu } from './Menu';
import { getLocale } from '../i18n';
import { stateReceiver } from './StateReceiverMixin';
import { Attribute } from '../util/Attribute';

// Load components used in template
import './PlaybackRateRadioGroup';

const PLAYBACK_RATES = [0.25, 0.5, 1, 1.25, 1.5, 2];

/**
 * A menu to change the playback rate of the player.
 *
 * @slot `heading` - A slot for the menu's heading.
 */
@customElement('theoplayer-playback-rate-menu')
@stateReceiver(['lang'])
export class PlaybackRateMenu extends Menu {
    @property({ reflect: true, type: String, attribute: Attribute.LANG })
    accessor lang: string = '';

    protected override renderMenuHeading(): HTMLTemplateResult {
        const locale = getLocale(this.lang);
        return html`<span slot="heading"><slot name="heading">${locale.playbackRateMenuHeading}</slot></span>`;
    }

    protected override renderMenuContent(): HTMLTemplateResult {
        const locale = getLocale(this.lang);
        return html`<theoplayer-playback-rate-radio-group>
            ${PLAYBACK_RATES.map((rate) => html`<theoplayer-radio-button value=${rate}>${locale.formatPlaybackRate(rate)}</theoplayer-radio-button>`)}
        </theoplayer-playback-rate-radio-group>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-playback-rate-menu': PlaybackRateMenu;
    }
}

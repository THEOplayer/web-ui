import { html, type HTMLTemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Menu } from './Menu';

// Load components used in template
import './PlaybackRateRadioGroup';

const PLAYBACK_RATES = [0.25, 0.5, 1, 1.25, 1.5, 2];

/**
 * `<theoplayer-playback-rate-menu>` - A menu to change the playback rate of the player.
 *
 * @slot `heading` - A slot for the menu's heading.
 *
 * @group Components
 */
@customElement('theoplayer-playback-rate-menu')
export class PlaybackRateMenu extends Menu {
    protected override renderMenuHeading(): HTMLTemplateResult {
        return html`<span slot="heading"><slot name="heading">Playback speed</slot></span>`;
    }

    protected override renderMenuContent(): HTMLTemplateResult {
        return html`<theoplayer-playback-rate-radio-group>
            ${PLAYBACK_RATES.map(
                (rate) => html`<theoplayer-radio-button value=${rate}>${rate === 1 ? 'Normal' : `${rate}x`}</theoplayer-radio-button>`
            )}
        </theoplayer-playback-rate-radio-group>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-playback-rate-menu': PlaybackRateMenu;
    }
}

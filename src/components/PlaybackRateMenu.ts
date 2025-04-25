import { html, type HTMLTemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Menu } from './Menu';
import playbackRateMenuHtml from './PlaybackRateMenu.html';

// Load components used in template
import './PlaybackRateRadioGroup';

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
        return playbackRateMenuHtml;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-playback-rate-menu': PlaybackRateMenu;
    }
}

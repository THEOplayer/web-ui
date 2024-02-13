import { Menu, menuTemplate } from './Menu';
import playbackRateMenuHtml from './PlaybackRateMenu.html';
import { createTemplate } from '../util/TemplateUtils';

// Load components used in template
import './PlaybackRateRadioGroup';

const template = createTemplate(
    'theoplayer-playback-rate-menu',
    menuTemplate(`<span slot="heading"><slot name="heading">Playback speed</slot></span>`, playbackRateMenuHtml)
);

/**
 * `<theoplayer-playback-rate-menu>` - A menu to change the playback rate of the player.
 *
 * @slot `heading` - A slot for the menu's heading.
 *
 * @group Components
 */
export class PlaybackRateMenu extends Menu {
    constructor() {
        super({ template: template() });
    }
}

customElements.define('theoplayer-playback-rate-menu', PlaybackRateMenu);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-playback-rate-menu': PlaybackRateMenu;
    }
}

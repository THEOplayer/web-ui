import * as shadyCss from '@webcomponents/shadycss';
import { Menu, menuTemplate } from './Menu';
import playbackRateMenuHtml from './PlaybackRateMenu.html';
import './PlaybackRateRadioGroup';

const template = document.createElement('template');
template.innerHTML = menuTemplate(`<span slot="heading"><slot name="heading">Playback speed</slot></span>`, playbackRateMenuHtml);
shadyCss.prepareTemplate(template, 'theoplayer-playback-rate-menu');

/**
 * A menu to change the playback rate of the player.
 *
 * @group Components
 */
export class PlaybackRateMenu extends Menu {
    constructor() {
        super({ template });
    }
}

customElements.define('theoplayer-playback-rate-menu', PlaybackRateMenu);

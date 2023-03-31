import * as shadyCss from '@webcomponents/shadycss';
import { buttonTemplate } from './Button';
import { MenuButton } from './MenuButton';
import speedIcon from '../icons/speed.svg';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<span part="icon"><slot>${speedIcon}</slot></span>`);
shadyCss.prepareTemplate(template, 'theoplayer-playback-rate-button');

/**
 * A menu button that opens a [playback rate menu]{@link PlaybackRateMenu}.
 *
 * @attribute menu - The ID of the playback rate menu.
 * @group Components
 */
export class PlaybackRateMenuButton extends MenuButton {
    constructor() {
        super({ template });
    }
}

customElements.define('theoplayer-playback-rate-menu-button', PlaybackRateMenuButton);

import * as shadyCss from '@webcomponents/shadycss';
import { buttonTemplate } from './Button';
import { MenuButton } from './MenuButton';
import speedIcon from '../icons/speed.svg';
import { Attribute } from '../util/Attribute';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<span part="icon"><slot>${speedIcon}</slot></span>`);
shadyCss.prepareTemplate(template, 'theoplayer-playback-rate-button');

/**
 * `<theoplayer-playback-rate-menu-button>` - A menu button that opens a [playback rate menu]{@link PlaybackRateMenu}.
 *
 * @attribute menu - The ID of the playback rate menu.
 * @group Components
 */
export class PlaybackRateMenuButton extends MenuButton {
    constructor() {
        super({ template });
    }

    override connectedCallback() {
        super.connectedCallback();

        if (!this.hasAttribute(Attribute.ARIA_LABEL)) {
            this.setAttribute(Attribute.ARIA_LABEL, 'open playback speed menu');
        }
    }
}

customElements.define('theoplayer-playback-rate-menu-button', PlaybackRateMenuButton);

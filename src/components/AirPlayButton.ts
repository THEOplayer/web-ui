import * as shadyCss from '@webcomponents/shadycss';
import type { ChromelessPlayer } from 'theoplayer';
import { StateReceiverMixin } from './StateReceiverMixin';
import { CastButton } from './CastButton';
import airPlayButtonHtml from './AirPlayButton.html';
import airPlayButtonCss from './AirPlayButton.css';
import { buttonTemplate } from './Button';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(airPlayButtonHtml, airPlayButtonCss);
shadyCss.prepareTemplate(template, 'theoplayer-airplay-button');

/**
 * A button to start and stop casting using AirPlay.
 */
export class AirPlayButton extends StateReceiverMixin(CastButton, ['player']) {
    private _player: ChromelessPlayer | undefined;

    constructor() {
        super({ template });
        this._upgradeProperty('player');
    }

    get player() {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        this._player = player;
        this.castApi = player?.cast?.airplay;
    }
}

customElements.define('theoplayer-airplay-button', AirPlayButton);

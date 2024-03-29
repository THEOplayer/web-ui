import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { StateReceiverMixin } from './StateReceiverMixin';
import { CastButton } from './CastButton';
import airPlayButtonHtml from './AirPlayButton.html';
import airPlayButtonCss from './AirPlayButton.css';
import { buttonTemplate } from './Button';
import { Attribute } from '../util/Attribute';
import { createTemplate } from '../util/TemplateUtils';

const template = createTemplate('theoplayer-airplay-button', buttonTemplate(airPlayButtonHtml, airPlayButtonCss));

/**
 * `<theoplayer-airplay-button>` - A button to start and stop casting using AirPlay.
 *
 * @group Components
 */
export class AirPlayButton extends StateReceiverMixin(CastButton, ['player']) {
    private _player: ChromelessPlayer | undefined;

    constructor() {
        super({ template: template() });
        this._upgradeProperty('player');
    }

    override connectedCallback() {
        super.connectedCallback();
        this._updateAriaLabel();
    }

    get player() {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        this._player = player;
        this.castApi = player?.cast?.airplay;
    }

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (AirPlayButton.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            this._updateAriaLabel();
        }
    }

    private _updateAriaLabel(): void {
        const label = this.castState === 'connecting' || this.castState === 'connected' ? 'stop playing on AirPlay' : 'start playing on AirPlay';
        this.setAttribute(Attribute.ARIA_LABEL, label);
    }
}

customElements.define('theoplayer-airplay-button', AirPlayButton);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-airplay-button': AirPlayButton;
    }
}

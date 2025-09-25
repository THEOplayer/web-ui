import { customElement } from 'lit/decorators.js';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { stateReceiver } from './StateReceiverMixin';
import { CastButton } from './CastButton';
import airPlayButtonHtml from './AirPlayButton.html';
import airPlayButtonCss from './AirPlayButton.css';
import { Attribute } from '../util/Attribute';

/**
 * A button to start and stop casting using AirPlay.
 */
@customElement('theoplayer-airplay-button')
@stateReceiver(['player'])
export class AirPlayButton extends CastButton {
    static styles = [...CastButton.styles, airPlayButtonCss];

    private _player: ChromelessPlayer | undefined;

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

    protected override render() {
        return airPlayButtonHtml;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-airplay-button': AirPlayButton;
    }
}

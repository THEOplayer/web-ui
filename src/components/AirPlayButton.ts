import { type PropertyValues } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { stateReceiver } from './StateReceiverMixin';
import { CastButton } from './CastButton';
import airPlayButtonHtml from './AirPlayButton.html';
import airPlayButtonCss from './AirPlayButton.css';

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

    override willUpdate(changedProperties: PropertyValues) {
        super.willUpdate(changedProperties);
        this._updateAriaLabel();
    }

    private _updateAriaLabel(): void {
        this.ariaLabel = this.castState === 'connecting' || this.castState === 'connected' ? 'stop playing on AirPlay' : 'start playing on AirPlay';
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

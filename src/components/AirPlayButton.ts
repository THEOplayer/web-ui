import { type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { stateReceiver } from './StateReceiverMixin';
import { CastButton } from './CastButton';
import airPlayButtonHtml from './AirPlayButton.html';
import airPlayButtonCss from './AirPlayButton.css';
import { getLocale, languageContext } from '../i18n';
import { consume } from '@lit/context';
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

    @property({ reflect: true, type: String, attribute: Attribute.LANG })
    @consume({ context: languageContext, subscribe: true })
    accessor lang: string = '';

    override willUpdate(changedProperties: PropertyValues) {
        super.willUpdate(changedProperties);
        this._updateAriaLabel();
    }

    private _updateAriaLabel(): void {
        const locale = getLocale(this.lang);
        this.ariaLabel = this.castState === 'connecting' || this.castState === 'connected' ? locale.airplayConnectedAria : locale.airplayAria;
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

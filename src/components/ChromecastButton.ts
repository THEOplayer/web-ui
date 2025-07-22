import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { stateReceiver } from './StateReceiverMixin';
import { CastButton } from './CastButton';
import chromecastButtonHtml from './ChromecastButton.html';
import chromecastButtonCss from './ChromecastButton.css';
import { Attribute } from '../util/Attribute';
import { customElement } from 'lit/decorators.js';

let chromecastButtonId = 0;

/**
 * `<theoplayer-chromecast-button>` - A button to start and stop casting using Chromecast.
 *
 * @group Components
 */
@customElement('theoplayer-chromecast-button')
@stateReceiver(['player'])
export class ChromecastButton extends CastButton {
    static styles = [...CastButton.styles, chromecastButtonCss];

    private _player: ChromelessPlayer | undefined;
    private readonly _buttonId = ++chromecastButtonId;

    constructor() {
        super();
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
        this.castApi = player?.cast?.chromecast;
    }

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (ChromecastButton.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            this._updateAriaLabel();
        }
    }

    private _updateAriaLabel(): void {
        const label =
            this.castState === 'connecting' || this.castState === 'connected' ? 'stop casting to Chromecast' : 'start casting to Chromecast';
        this.setAttribute(Attribute.ARIA_LABEL, label);
    }

    protected override render() {
        return chromecastButtonHtml(this._buttonId);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-chromecast-button': ChromecastButton;
    }
}

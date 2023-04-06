import * as shadyCss from '@webcomponents/shadycss';
import type { ChromelessPlayer } from 'theoplayer';
import { StateReceiverMixin } from './StateReceiverMixin';
import { CastButton } from './CastButton';
import chromecastButtonHtml from './ChromecastButton.html';
import chromecastButtonCss from './ChromecastButton.css';
import { buttonTemplate } from './Button';
import { Attribute } from '../util/Attribute';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(chromecastButtonHtml, chromecastButtonCss);
shadyCss.prepareTemplate(template, 'theoplayer-chromecast-button');

const maskId = 'theoplayer-chromecast-rings-mask';
let chromecastButtonId = 0;

/**
 * A button to start and stop casting using Chromecast.
 *
 * @group Components
 */
export class ChromecastButton extends StateReceiverMixin(CastButton, ['player']) {
    private _player: ChromelessPlayer | undefined;

    constructor() {
        super({ template });

        // Make ID attributes unique
        const id = ++chromecastButtonId;
        const mask = this.shadowRoot!.querySelector<SVGClipPathElement>(`svg clipPath#${maskId}`)!;
        const rings = this.shadowRoot!.querySelector<SVGGElement>(`svg .theoplayer-chromecast-rings`)!;
        const uniqueMaskId = `${maskId}-${id}`;
        mask.setAttribute('id', uniqueMaskId);
        rings.setAttribute('clip-path', uniqueMaskId);

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
}

customElements.define('theoplayer-chromecast-button', ChromecastButton);

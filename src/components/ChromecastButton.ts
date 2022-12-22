import * as shadyCss from '@webcomponents/shadycss';
import type { ChromelessPlayer } from 'theoplayer';
import { StateReceiverMixin } from './StateReceiverMixin';
import { CastButton } from './CastButton';
import chromecastButtonHtml from './ChromecastButton.html';
import chromecastButtonCss from './ChromecastButton.css';
import { buttonTemplate } from './Button';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(chromecastButtonHtml, chromecastButtonCss);
shadyCss.prepareTemplate(template, 'theoplayer-chromecast-button');

const maskId = 'theoplayer-chromecast-rings-mask';
let chromecastButtonId = 0;

export class ChromecastButton extends StateReceiverMixin(CastButton, ['player']) {
    constructor() {
        super({ template });

        // Make ID attributes unique
        const id = ++chromecastButtonId;
        const mask = this.shadowRoot!.querySelector<SVGClipPathElement>(`svg clipPath#${maskId}`)!;
        const rings = this.shadowRoot!.querySelector<SVGGElement>(`svg .theoplayer-chromecast-rings`)!;
        const uniqueMaskId = `${maskId}-${id}`;
        mask.setAttribute('id', uniqueMaskId);
        rings.setAttribute('clip-path', uniqueMaskId);
    }

    setPlayer(player: ChromelessPlayer | undefined): void {
        this.castApi = player?.cast?.chromecast;
    }
}

customElements.define('theoplayer-chromecast-button', ChromecastButton);

import { Menu, menuTemplate } from './Menu';
import * as shadyCss from '@webcomponents/shadycss';
import type { PlaybackRateRadioGroup } from './PlaybackRateRadioGroup';
import './PlaybackRateRadioGroup';

const template = document.createElement('template');
template.innerHTML = menuTemplate(
    `<slot name="heading">Playback speed</slot>`,
    `<theoplayer-playback-rate-radio-group></theoplayer-playback-rate-radio-group>`
);
shadyCss.prepareTemplate(template, 'theoplayer-playback-rate-menu');

export class PlaybackRateMenu extends Menu {
    private readonly _radioGroup!: PlaybackRateRadioGroup;

    constructor() {
        super({ template });
        this._radioGroup = this.shadowRoot!.querySelector('theoplayer-playback-rate-radio-group')!;
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this._radioGroup.addEventListener('change', this._onChange);
    }

    disconnectedCallback(): void {
        this._radioGroup.removeEventListener('change', this._onChange);
    }

    private readonly _onChange = (): void => {
        // Close menu when playback rate selection changes
        this.close();
    };
}

customElements.define('theoplayer-playback-rate-menu', PlaybackRateMenu);

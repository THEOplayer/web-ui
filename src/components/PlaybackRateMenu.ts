import { Menu, menuTemplate } from './Menu';
import * as shadyCss from '@webcomponents/shadycss';
import './PlaybackRateRadioGroup';

const template = document.createElement('template');
template.innerHTML = menuTemplate(
    `<slot name="heading">Playback speed</slot>`,
    `<theoplayer-playback-rate-radio-group></theoplayer-playback-rate-radio-group>`
);
shadyCss.prepareTemplate(template, 'theoplayer-playback-rate-menu');

export class PlaybackRateMenu extends Menu {
    constructor() {
        super({ template });
    }
}

customElements.define('theoplayer-playback-rate-menu', PlaybackRateMenu);

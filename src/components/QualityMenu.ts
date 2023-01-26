import { Menu, menuTemplate } from './Menu';
import * as shadyCss from '@webcomponents/shadycss';
import './QualityRadioGroup';

const template = document.createElement('template');
template.innerHTML = menuTemplate(`<slot name="heading">Quality</slot>`, `<theoplayer-quality-radio-group></theoplayer-quality-radio-group>`);
shadyCss.prepareTemplate(template, 'theoplayer-quality-menu');

export class QualityMenu extends Menu {
    constructor() {
        super({ template });
    }
}

customElements.define('theoplayer-quality-menu', QualityMenu);

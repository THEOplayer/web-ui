import { MenuButton } from './MenuButton';
import { buttonTemplate } from './Button';
import languageIcon from '../icons/language.svg';
import * as shadyCss from '@webcomponents/shadycss';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<span part="icon"><slot>${languageIcon}</slot></span>`);
shadyCss.prepareTemplate(template, 'theoplayer-language-menu-button');

export class LanguageMenuButton extends MenuButton {
    constructor() {
        super({ template });
    }
}

customElements.define('theoplayer-language-menu-button', LanguageMenuButton);

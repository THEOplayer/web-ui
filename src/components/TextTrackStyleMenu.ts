import * as shadyCss from '@webcomponents/shadycss';
import { MenuGroup, menuGroupTemplate } from './MenuGroup';
import textTrackStyleMenuHtml from './TextTrackStyleMenu.html';
import textTrackStyleMenuCss from './TextTrackStyleMenu.css';
import menuTableCss from './MenuTable.css';
import type { TextTrackStyle } from 'theoplayer';
import './TextTrackStyleRadioGroup';

const template = document.createElement('template');
template.innerHTML = menuGroupTemplate(textTrackStyleMenuHtml, `${menuTableCss}\n${textTrackStyleMenuCss}`);
shadyCss.prepareTemplate(template, 'theoplayer-text-track-style-menu');

/**
 * A menu to change the [text track style]{@link TextTrackStyle} of the player.
 */
export class TextTrackStyleMenu extends MenuGroup {
    constructor() {
        super({ template });
    }
}

customElements.define('theoplayer-text-track-style-menu', TextTrackStyleMenu);

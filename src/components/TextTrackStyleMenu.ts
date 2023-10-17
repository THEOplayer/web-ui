import { MenuGroup, menuGroupTemplate } from './MenuGroup';
import textTrackStyleMenuHtml from './TextTrackStyleMenu.html';
import textTrackStyleMenuCss from './TextTrackStyleMenu.css';
import menuTableCss from './MenuTable.css';
import './TextTrackStyleDisplay';
import './TextTrackStyleRadioGroup';

const template = menuGroupTemplate(textTrackStyleMenuHtml, `${menuTableCss}\n${textTrackStyleMenuCss}`);

/**
 * A menu to change the {@link theoplayer!TextTrackStyle | text track style} of the player.
 *
 * @group Components
 */
export class TextTrackStyleMenu extends MenuGroup {
    constructor() {
        super({ template });
    }
}

customElements.define('theoplayer-text-track-style-menu', TextTrackStyleMenu);

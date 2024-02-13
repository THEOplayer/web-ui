import { MenuGroup, menuGroupTemplate } from './MenuGroup';
import textTrackStyleMenuHtml from './TextTrackStyleMenu.html';
import textTrackStyleMenuCss from './TextTrackStyleMenu.css';
import menuTableCss from './MenuTable.css';
import { createTemplate } from '../util/TemplateUtils';

// Load components used in template
import './TextTrackStyleDisplay';
import './TextTrackStyleRadioGroup';

const template = createTemplate(
    'theoplayer-text-track-style-menu',
    menuGroupTemplate(textTrackStyleMenuHtml, `${menuTableCss}\n${textTrackStyleMenuCss}`)
);

/**
 * `<theoplayer-text-track-style-menu>` - A menu to change the {@link theoplayer!TextTrackStyle | text track style} of the player.
 *
 * @slot `heading` - A slot for the menu's heading.
 *
 * @group Components
 */
export class TextTrackStyleMenu extends MenuGroup {
    constructor() {
        super({ template: template() });
    }
}

customElements.define('theoplayer-text-track-style-menu', TextTrackStyleMenu);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-text-track-style-menu': TextTrackStyleMenu;
    }
}

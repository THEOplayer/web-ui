import { MenuButton } from './MenuButton';
import { buttonTemplate } from './Button';
import languageIcon from '../icons/language.svg';
import * as shadyCss from '@webcomponents/shadycss';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer';
import { isSubtitleTrack } from '../util/TrackUtils';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<span part="icon"><slot>${languageIcon}</slot></span>`);
shadyCss.prepareTemplate(template, 'theoplayer-language-menu-button');

const TRACK_EVENTS = ['addtrack', 'removetrack'] as const;

/**
 * A menu button that opens a {@link LanguageMenu}.
 *
 * When there are no alternative audio languages or subtitles, this button automatically hides itself.
 *
 * @attribute menu - The ID of the language menu.
 */
export class LanguageMenuButton extends StateReceiverMixin(MenuButton, ['player']) {
    private _player: ChromelessPlayer | undefined;

    constructor() {
        super({ template });
        this._upgradeProperty('player');
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._player.audioTracks.removeEventListener(TRACK_EVENTS, this._updateTracks);
            this._player.textTracks.removeEventListener(TRACK_EVENTS, this._updateTracks);
        }
        this._player = player;
        this._updateTracks();
        if (this._player !== undefined) {
            this._player.audioTracks.addEventListener(TRACK_EVENTS, this._updateTracks);
            this._player.textTracks.addEventListener(TRACK_EVENTS, this._updateTracks);
        }
    }

    private readonly _updateTracks = (): void => {
        const hasTracks = this._player !== undefined && (this._player.audioTracks.length >= 2 || this._player.textTracks.some(isSubtitleTrack));
        if (hasTracks) {
            this.removeAttribute('hidden');
        } else {
            this.setAttribute('hidden', '');
        }
    };
}

customElements.define('theoplayer-language-menu-button', LanguageMenuButton);

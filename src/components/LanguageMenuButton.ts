import { MenuButton } from './MenuButton';
import { buttonTemplate } from './Button';
import languageIcon from '../icons/language.svg';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer, MediaTrackList, TextTracksList } from 'theoplayer/chromeless';
import { isNonForcedSubtitleTrack } from '../util/TrackUtils';
import { Attribute } from '../util/Attribute';
import { toggleAttribute } from '../util/CommonUtils';
import { createTemplate } from '../util/TemplateUtils';

const template = createTemplate('theoplayer-language-menu-button', buttonTemplate(`<span part="icon"><slot>${languageIcon}</slot></span>`));

const TRACK_EVENTS = ['addtrack', 'removetrack'] as const;

/**
 * `<theoplayer-language-menu-button>` - A menu button that opens a {@link LanguageMenu}.
 *
 * When there are no alternative audio languages or subtitles, this button automatically hides itself.
 *
 * @attribute `menu` - The ID of the language menu.
 * @group Components
 */
export class LanguageMenuButton extends StateReceiverMixin(MenuButton, ['player']) {
    private _player: ChromelessPlayer | undefined;
    private _audioTrackList: MediaTrackList | undefined;
    private _textTrackList: TextTracksList | undefined;

    constructor() {
        super({ template: template() });
        this._upgradeProperty('player');
    }

    override connectedCallback() {
        super.connectedCallback();

        if (!this.hasAttribute(Attribute.ARIA_LABEL)) {
            this.setAttribute(Attribute.ARIA_LABEL, 'open language menu');
        }
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        this._audioTrackList?.removeEventListener(TRACK_EVENTS, this._updateTracks);
        this._textTrackList?.removeEventListener(TRACK_EVENTS, this._updateTracks);
        this._player = player;
        this._audioTrackList = player?.audioTracks;
        this._textTrackList = player?.textTracks;
        this._updateTracks();
        this._audioTrackList?.addEventListener(TRACK_EVENTS, this._updateTracks);
        this._textTrackList?.addEventListener(TRACK_EVENTS, this._updateTracks);
    }

    private readonly _updateTracks = (): void => {
        const hasTracks =
            this._player !== undefined && (this._player.audioTracks.length >= 2 || this._player.textTracks.some(isNonForcedSubtitleTrack));
        toggleAttribute(this, Attribute.HIDDEN, !hasTracks);
    };
}

customElements.define('theoplayer-language-menu-button', LanguageMenuButton);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-language-menu-button': LanguageMenuButton;
    }
}

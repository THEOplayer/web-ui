import { MenuGroup, menuGroupTemplate } from './MenuGroup';
import * as shadyCss from '@webcomponents/shadycss';
import languageMenuHtml from './LanguageMenu.html';
import languageMenuCss from './LanguageMenu.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer, MediaTrack, TextTrack } from 'theoplayer/chromeless';
import { isSubtitleTrack } from '../util/TrackUtils';
import { Attribute } from '../util/Attribute';
import { toggleAttribute } from '../util/CommonUtils';
import { createTemplate } from '../util/TemplateUtils';

// Load components used in template
import './TrackRadioGroup';
import './TextTrackStyleMenu';

const template = createTemplate('theoplayer-language-menu', menuGroupTemplate(languageMenuHtml, languageMenuCss));

const TRACK_EVENTS = ['addtrack', 'removetrack'] as const;

/**
 * `<theoplayer-language-menu>` - A menu to change the spoken language and subtitles of the stream.
 *
 * @slot `heading` - A slot for the menu's heading.
 *
 * @group Components
 */
export class LanguageMenu extends StateReceiverMixin(MenuGroup, ['player']) {
    private _player: ChromelessPlayer | undefined;

    static get observedAttributes() {
        return [...MenuGroup.observedAttributes, Attribute.HAS_AUDIO, Attribute.HAS_SUBTITLES];
    }

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
            this._player.audioTracks.removeEventListener(TRACK_EVENTS, this._updateAudioTracks);
            this._player.textTracks.removeEventListener(TRACK_EVENTS, this._updateTextTracks);
        }
        this._player = player;
        this._updateAudioTracks();
        this._updateTextTracks();
        if (this._player !== undefined) {
            this._player.audioTracks.addEventListener(TRACK_EVENTS, this._updateAudioTracks);
            this._player.textTracks.addEventListener(TRACK_EVENTS, this._updateTextTracks);
        }
    }

    private readonly _updateAudioTracks = (): void => {
        const newAudioTracks: readonly MediaTrack[] = this._player?.audioTracks ?? [];
        // Hide audio track selection if there's only one track.
        toggleAttribute(this, Attribute.HAS_AUDIO, newAudioTracks.length > 1);
    };

    private readonly _updateTextTracks = (): void => {
        const newSubtitleTracks: readonly TextTrack[] = this._player?.textTracks.filter(isSubtitleTrack) ?? [];
        // Hide subtitle track selection if there are no tracks. If there's one, we still show an "off" option.
        toggleAttribute(this, Attribute.HAS_SUBTITLES, newSubtitleTracks.length > 0);
    };

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (LanguageMenu.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-language-menu', LanguageMenu);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-language-menu': LanguageMenu;
    }
}

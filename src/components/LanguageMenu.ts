import { Menu, menuTemplate } from './Menu';
import * as shadyCss from '@webcomponents/shadycss';
import languageMenuHtml from './LanguageMenu.html';
import languageMenuCss from './LanguageMenu.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer, MediaTrack, TextTrack } from 'theoplayer';
import { isSubtitleTrack } from '../util/TrackUtils';
import { Attribute } from '../util/Attribute';
import './MediaTrackRadioGroup';

const template = document.createElement('template');
template.innerHTML = menuTemplate(`<slot name="heading">Language</slot>`, languageMenuHtml, languageMenuCss);
shadyCss.prepareTemplate(template, 'theoplayer-language-menu');

const TRACK_EVENTS = ['addtrack', 'removetrack'] as const;

export class LanguageMenu extends StateReceiverMixin(Menu, ['player']) {
    private readonly _contentEl: HTMLElement;
    private _player: ChromelessPlayer | undefined;

    constructor() {
        super({ template });

        this._contentEl = this.shadowRoot!.querySelector('[part="content"]')!;
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

    setPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
    }

    private readonly _updateAudioTracks = (): void => {
        const newAudioTracks: readonly MediaTrack[] = this._player?.audioTracks ?? [];
        if (newAudioTracks.length === 0) {
            this._contentEl.removeAttribute(Attribute.HAS_AUDIO);
        } else {
            this._contentEl.setAttribute(Attribute.HAS_AUDIO, '');
        }
    };

    private readonly _updateTextTracks = (): void => {
        const newSubtitleTracks: readonly TextTrack[] = this._player?.textTracks.filter(isSubtitleTrack) ?? [];
        if (newSubtitleTracks.length === 0) {
            this._contentEl.removeAttribute(Attribute.HAS_SUBTITLES);
        } else {
            this._contentEl.setAttribute(Attribute.HAS_SUBTITLES, '');
        }
    };
}

customElements.define('theoplayer-language-menu', LanguageMenu);

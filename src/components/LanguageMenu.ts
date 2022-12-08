import { Menu, menuTemplate } from './Menu';
import * as shadyCss from '@webcomponents/shadycss';
import languageMenuHtml from './LanguageMenu.html';
import languageMenuCss from './LanguageMenu.css';
import { RadioGroup } from './RadioGroup';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer, MediaTrack, TextTrack } from 'theoplayer';
import { MediaTrackMenuButton } from './MediaTrackMenuButton';
import { TextTrackMenuButton } from './TextTrackMenuButton';
import { TextTrackOffMenuButton } from './TextTrackOffMenuButton';
import { isSubtitleTrack } from '../util/TrackUtils';

const template = document.createElement('template');
template.innerHTML = menuTemplate(`<slot name="heading">Language</slot>`, languageMenuHtml, languageMenuCss);
shadyCss.prepareTemplate(template, 'theoplayer-language-menu');

const TRACK_EVENTS = ['addtrack', 'removetrack'] as const;

export class LanguageMenu extends StateReceiverMixin(Menu, ['player']) {
    private readonly _contentEl: HTMLElement;
    private readonly _audioGroup: RadioGroup;
    private readonly _subtitleGroup: RadioGroup;
    private readonly _subtitleOffButton: TextTrackOffMenuButton;

    private _player: ChromelessPlayer | undefined;

    constructor() {
        super({ template });

        this._contentEl = this.shadowRoot!.querySelector('[part="content"]')!;
        this._audioGroup = this.shadowRoot!.querySelector('[part="audio"] theoplayer-radio-group')!;
        this._subtitleGroup = this.shadowRoot!.querySelector('[part="subtitles"] theoplayer-radio-group')!;

        this._subtitleOffButton = new TextTrackOffMenuButton();
        this._subtitleGroup.appendChild(this._subtitleOffButton);
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
        this._subtitleOffButton.trackList = player?.textTracks;
        if (this._player !== undefined) {
            this._player.audioTracks.addEventListener(TRACK_EVENTS, this._updateAudioTracks);
            this._player.textTracks.addEventListener(TRACK_EVENTS, this._updateTextTracks);
        }
    }

    setPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
    }

    private readonly _updateAudioTracks = (): void => {
        const oldAudioButtons = this._audioGroup.children as HTMLCollectionOf<MediaTrackMenuButton>;
        const newAudioTracks: readonly MediaTrack[] = this._player?.audioTracks ?? [];
        if (newAudioTracks.length === 0) {
            this._contentEl.removeAttribute('has-audio');
        } else {
            this._contentEl.setAttribute('has-audio', '');
        }
        for (let i = 0; i < oldAudioButtons.length; i++) {
            const oldButton = oldAudioButtons[i];
            if (!oldButton.track || newAudioTracks.indexOf(oldButton.track) < 0) {
                this._audioGroup.removeChild(oldButton);
            }
        }
        for (const newTrack of newAudioTracks) {
            if (!hasButtonForTrack(oldAudioButtons, newTrack)) {
                const newButton = new MediaTrackMenuButton();
                newButton.track = newTrack;
                this._audioGroup.appendChild(newButton);
            }
        }
    };

    private readonly _updateTextTracks = (): void => {
        const oldSubtitleButtons = this._subtitleGroup.children as HTMLCollectionOf<TextTrackMenuButton>;
        const newSubtitleTracks: readonly TextTrack[] = this._player?.textTracks.filter(isSubtitleTrack) ?? [];
        if (newSubtitleTracks.length === 0) {
            this._contentEl.removeAttribute('has-subtitles');
        } else {
            this._contentEl.setAttribute('has-subtitles', '');
        }
        // Start at index 1, since the first child is the "off" button
        for (let i = 1; i < oldSubtitleButtons.length; i++) {
            const oldButton = oldSubtitleButtons[i];
            if (!oldButton.track || newSubtitleTracks.indexOf(oldButton.track) < 0) {
                this._subtitleGroup.removeChild(oldButton);
            }
        }
        for (const newTrack of newSubtitleTracks) {
            if (!hasButtonForTrack(oldSubtitleButtons, newTrack)) {
                const newButton = new TextTrackMenuButton();
                newButton.track = newTrack;
                this._subtitleGroup.appendChild(newButton);
            }
        }
    };
}

customElements.define('theoplayer-language-menu', LanguageMenu);

function hasButtonForTrack(buttons: HTMLCollectionOf<MediaTrackMenuButton | TextTrackMenuButton>, track: MediaTrack | TextTrack): boolean {
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].track === track) {
            return true;
        }
    }
    return false;
}

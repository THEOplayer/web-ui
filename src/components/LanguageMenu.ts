import { Menu, menuTemplate } from './Menu';
import * as shadyCss from '@webcomponents/shadycss';
import languageMenuHtml from './LanguageMenu.html';
import { RadioGroup } from './RadioGroup';
import { PlayerReceiverMixin } from './PlayerReceiverMixin';
import type { ChromelessPlayer, MediaTrack, TextTrack } from 'theoplayer';
import { MediaTrackMenuButton } from './MediaTrackMenuButton';
import { TextTrackMenuButton } from './TextTrackMenuButton';

const template = document.createElement('template');
template.innerHTML = menuTemplate(`<slot name="heading"><h1>Language</h1></slot>`, languageMenuHtml);
shadyCss.prepareTemplate(template, 'theoplayer-language-menu');

const TRACK_EVENTS = ['addtrack', 'removetrack'] as const;

export class LanguageMenu extends PlayerReceiverMixin(Menu) {
    private readonly _audioGroup: RadioGroup;
    private readonly _subtitleGroup: RadioGroup;

    private _player: ChromelessPlayer | undefined;

    constructor() {
        super({ template });

        this._audioGroup = this.shadowRoot!.querySelector('[part="audio"] theoplayer-radio-group')!;
        this._subtitleGroup = this.shadowRoot!.querySelector('[part="subtitles"] theoplayer-radio-group')!;
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

    attachPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
    }

    private readonly _updateAudioTracks = (): void => {
        const oldAudioButtons = this._audioGroup.children as HTMLCollectionOf<MediaTrackMenuButton>;
        const newAudioTracks: readonly MediaTrack[] = this._player?.audioTracks ?? [];
        for (let i = 0; i < oldAudioButtons.length; i++) {
            const oldButton = oldAudioButtons[i];
            if (!oldButton.track || newAudioTracks.indexOf(oldButton.track) < 0) {
                this._audioGroup.removeChild(oldButton);
            }
        }
        for (const newTrack of newAudioTracks) {
            if (!hasButtonForTrack(oldAudioButtons, newTrack)) {
                const newButton = document.createElement('theoplayer-media-track-menu-button') as MediaTrackMenuButton;
                newButton.track = newTrack;
                this._audioGroup.appendChild(newButton);
            }
        }
    };

    private readonly _updateTextTracks = (): void => {
        const oldSubtitleButtons = this._subtitleGroup.children as HTMLCollectionOf<TextTrackMenuButton>;
        const newSubtitleTracks: readonly TextTrack[] = this._player?.textTracks.filter(isSubtitleTrack) ?? [];
        for (let i = 0; i < oldSubtitleButtons.length; i++) {
            const oldButton = oldSubtitleButtons[i];
            if (!oldButton.track || newSubtitleTracks.indexOf(oldButton.track) < 0) {
                this._subtitleGroup.removeChild(oldButton);
            }
        }
        for (const newTrack of newSubtitleTracks) {
            if (!hasButtonForTrack(oldSubtitleButtons, newTrack)) {
                const newButton = document.createElement('theoplayer-text-track-menu-button') as TextTrackMenuButton;
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

function isSubtitleTrack(track: TextTrack): boolean {
    return track.kind === 'subtitles' || track.kind === 'captions';
}

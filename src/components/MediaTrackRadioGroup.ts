import * as shadyCss from '@webcomponents/shadycss';
import type { RadioGroup } from './RadioGroup';
import trackRadioGroupCss from './TrackRadioGroup.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer, MediaTrack, MediaTrackList, TextTrack, TextTracksList } from 'theoplayer';
import { Attribute } from '../util/Attribute';
import { MediaTrackMenuButton } from './MediaTrackMenuButton';
import './RadioGroup';
import { TextTrackMenuButton } from './TextTrackMenuButton';
import { isSubtitleTrack } from '../util/TrackUtils';

const template = document.createElement('template');
template.innerHTML = `<style>${trackRadioGroupCss}</style><theoplayer-radio-group></theoplayer-radio-group>`;
shadyCss.prepareTemplate(template, 'theoplayer-media-track-radio-group');

const TRACK_EVENTS = ['addtrack', 'removetrack'] as const;

export type TrackType = 'audio' | 'video' | 'subtitles';

export class MediaTrackRadioGroup extends StateReceiverMixin(HTMLElement, ['player']) {
    static get observedAttributes() {
        return [Attribute.TRACK_TYPE];
    }

    private readonly _radioGroup: RadioGroup;
    private _player: ChromelessPlayer | undefined;
    private _tracksList: MediaTrackList | TextTracksList | undefined;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._radioGroup = shadowRoot.querySelector('theoplayer-radio-group')!;
    }

    get trackType(): TrackType {
        return (this.getAttribute(Attribute.TRACK_TYPE) || 'audio') as TrackType;
    }

    set trackType(value: TrackType) {
        this.setAttribute(Attribute.TRACK_TYPE, value || 'audio');
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._getTracksList()?.removeEventListener(TRACK_EVENTS, this._updateTracks);
        }
        this._player = player;
        this._updateTracks();
        if (this._player !== undefined) {
            this._getTracksList()?.addEventListener(TRACK_EVENTS, this._updateTracks);
        }
    }

    setPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
    }

    private _getTracksList(): MediaTrackList | TextTracksList | undefined {
        if (this._player === undefined) {
            return undefined;
        }
        const trackType = this.trackType;
        if (trackType === 'audio') {
            return this._player.audioTracks;
        } else if (trackType === 'video') {
            return this._player.videoTracks;
        } else if (trackType === 'subtitles') {
            return this._player.textTracks;
        } else {
            return undefined;
        }
    }

    private _updateTracksList(): void {
        const oldList = this._tracksList;
        const newList = this._getTracksList();
        if (oldList !== newList) {
            oldList?.removeEventListener(TRACK_EVENTS, this._updateTracks);
            newList?.addEventListener(TRACK_EVENTS, this._updateTracks);
            this._updateTracks();
        }
    }

    private _getTracks(): readonly (MediaTrack | TextTrack)[] {
        if (this._player === undefined) {
            return [];
        }
        const trackType = this.trackType;
        if (trackType === 'audio') {
            return this._player.audioTracks;
        } else if (trackType === 'video') {
            return this._player.videoTracks;
        } else if (trackType === 'subtitles') {
            return this._player.textTracks.filter(isSubtitleTrack);
        } else {
            return [];
        }
    }

    private readonly _updateTracks = (): void => {
        const oldButtons = this._radioGroup.children as HTMLCollectionOf<MediaTrackMenuButton | TextTrackMenuButton>;
        const newTracks = this._getTracks();
        for (let i = oldButtons.length - 1; i >= 0; i--) {
            const oldButton = oldButtons[i];
            if (!oldButton.track || newTracks.indexOf(oldButton.track) < 0) {
                this._radioGroup.removeChild(oldButton);
            }
        }
        for (const newTrack of newTracks) {
            if (!hasButtonForTrack(oldButtons, newTrack)) {
                let newButton = this._createTrackButton(newTrack);
                this._radioGroup.appendChild(newButton);
            }
        }
    };

    private _createTrackButton(track: MediaTrack | TextTrack): MediaTrackMenuButton | TextTrackMenuButton {
        if (this.trackType === 'subtitles') {
            let button = new TextTrackMenuButton();
            button.track = track as TextTrack;
            return button;
        } else {
            let button = new MediaTrackMenuButton();
            button.track = track as MediaTrack;
            return button;
        }
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (attrName === Attribute.TRACK_TYPE && newValue !== oldValue) {
            this._updateTracksList();
        }
    }
}

customElements.define('theoplayer-media-track-radio-group', MediaTrackRadioGroup);

function hasButtonForTrack(buttons: HTMLCollectionOf<MediaTrackMenuButton | TextTrackMenuButton>, track: MediaTrack | TextTrack): boolean {
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].track === track) {
            return true;
        }
    }
    return false;
}
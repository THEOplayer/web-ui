import * as shadyCss from '@webcomponents/shadycss';
import type { RadioGroup } from './RadioGroup';
import trackRadioGroupCss from './TrackRadioGroup.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer, MediaTrack } from 'theoplayer';
import { Attribute } from '../util/Attribute';
import { MediaTrackMenuButton } from './MediaTrackMenuButton';
import './RadioGroup';

const template = document.createElement('template');
template.innerHTML = `<style>${trackRadioGroupCss}</style><theoplayer-radio-group></theoplayer-radio-group>`;
shadyCss.prepareTemplate(template, 'theoplayer-media-track-radio-group');

const TRACK_EVENTS = ['addtrack', 'removetrack'] as const;

export type MediaTrackType = 'audio' | 'video';

export class MediaTrackRadioGroup extends StateReceiverMixin(HTMLElement, ['player']) {
    static get observedAttributes() {
        return [Attribute.TRACK_TYPE];
    }

    private readonly _radioGroup: RadioGroup;
    private _player: ChromelessPlayer | undefined;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._radioGroup = shadowRoot.querySelector('theoplayer-radio-group')!;
    }

    get trackType(): MediaTrackType {
        return (this.getAttribute(Attribute.TRACK_TYPE) || 'audio') as MediaTrackType;
    }

    set trackType(value: MediaTrackType) {
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
            this._player.audioTracks.removeEventListener(TRACK_EVENTS, this._updateTracks);
        }
        this._player = player;
        this._updateTracks();
        if (this._player !== undefined) {
            this._player.audioTracks.addEventListener(TRACK_EVENTS, this._updateTracks);
        }
    }

    setPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
    }

    private _getTracks(): readonly MediaTrack[] {
        if (this._player === undefined) {
            return [];
        }
        if (this.trackType === 'video') {
            return this._player.videoTracks;
        } else {
            return this._player.audioTracks;
        }
    }

    private readonly _updateTracks = (): void => {
        const oldButtons = this._radioGroup.children as HTMLCollectionOf<MediaTrackMenuButton>;
        const newTracks = this._getTracks();
        for (let i = oldButtons.length - 1; i >= 0; i--) {
            const oldButton = oldButtons[i];
            if (!oldButton.track || newTracks.indexOf(oldButton.track) < 0) {
                this._radioGroup.removeChild(oldButton);
            }
        }
        for (const newTrack of newTracks) {
            if (!hasButtonForTrack(oldButtons, newTrack)) {
                const newButton = new MediaTrackMenuButton();
                newButton.track = newTrack;
                this._radioGroup.appendChild(newButton);
            }
        }
    };

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (attrName === Attribute.TRACK_TYPE && newValue !== oldValue) {
            this._updateTracks();
        }
    }
}

customElements.define('theoplayer-media-track-radio-group', MediaTrackRadioGroup);

function hasButtonForTrack(buttons: HTMLCollectionOf<MediaTrackMenuButton>, track: MediaTrack): boolean {
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].track === track) {
            return true;
        }
    }
    return false;
}

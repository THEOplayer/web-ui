import * as shadyCss from '@webcomponents/shadycss';
import type { RadioGroup } from './RadioGroup';
import verticalRadioGroupCss from './VerticalRadioGroup.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer, MediaTrack, MediaTrackList, TextTrack, TextTracksList } from 'theoplayer';
import { Attribute } from '../util/Attribute';
import { MediaTrackRadioButton } from './MediaTrackRadioButton';
import { TextTrackRadioButton } from './TextTrackRadioButton';
import { isSubtitleTrack } from '../util/TrackUtils';
import { TextTrackOffRadioButton } from './TextTrackOffRadioButton';
import { fromArrayLike } from '../util/CommonUtils';
import './RadioGroup';
import { createEvent } from '../util/EventUtils';

const template = document.createElement('template');
template.innerHTML = `<style>${verticalRadioGroupCss}</style><theoplayer-radio-group></theoplayer-radio-group>`;
shadyCss.prepareTemplate(template, 'theoplayer-track-radio-group');

const TRACK_EVENTS = ['addtrack', 'removetrack'] as const;

export type TrackType = 'audio' | 'video' | 'subtitles';

/**
 * A radio group that shows a list of media or text tracks, from which the user can choose an active track.
 *
 * @attribute track-type - The track type of the available tracks. Can be "audio", "video" or "subtitles".
 * @attribute show-off - If set, shows an "off" button to disable all tracks.
 *   Can only be used with the "subtitles" track type.
 */
export class TrackRadioGroup extends StateReceiverMixin(HTMLElement, ['player']) {
    static get observedAttributes() {
        return [Attribute.TRACK_TYPE, Attribute.SHOW_OFF];
    }

    private readonly _radioGroup: RadioGroup;
    private _offButton: TextTrackOffRadioButton | undefined;
    private _player: ChromelessPlayer | undefined;
    private _tracksList: MediaTrackList | TextTracksList | undefined;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._radioGroup = shadowRoot.querySelector('theoplayer-radio-group')!;
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        this._upgradeProperty('trackType');
        this._upgradeProperty('showOffButton');
        this._upgradeProperty('player');

        this._updateOffButton();
        this._updateTracks();

        this.shadowRoot!.addEventListener('change', this._onChange);
    }

    disconnectedCallback(): void {
        this.shadowRoot!.removeEventListener('change', this._onChange);
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    /**
     * The track type of the available tracks.
     */
    get trackType(): TrackType {
        return (this.getAttribute(Attribute.TRACK_TYPE) || 'audio') as TrackType;
    }

    set trackType(value: TrackType) {
        this.setAttribute(Attribute.TRACK_TYPE, value || 'audio');
    }

    /**
     * If set, shows an "off" button to disable all tracks.
     *
     * Can only be used with the `"subtitles"` track type.
     */
    get showOffButton(): boolean {
        return this.hasAttribute(Attribute.SHOW_OFF);
    }

    set showOffButton(value: boolean) {
        if (value) {
            this.setAttribute(Attribute.SHOW_OFF, '');
        } else {
            this.removeAttribute(Attribute.SHOW_OFF);
        }
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        this._player = player;
        this._updateTracksList();
        this._updateTracks();
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
            this._tracksList = newList;
            this._updateOffButton();
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
        let oldButtons = fromArrayLike(this._radioGroup.children) as (MediaTrackRadioButton | TextTrackRadioButton)[];
        const newTracks = this._getTracks();
        if (this._offButton !== undefined) {
            // First child is the "off" button, skip it.
            oldButtons = oldButtons.slice(1);
        }
        for (const oldButton of oldButtons) {
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

    private _createTrackButton(track: MediaTrack | TextTrack): MediaTrackRadioButton | TextTrackRadioButton {
        if (this.trackType === 'subtitles') {
            let button = new TextTrackRadioButton();
            button.track = track as TextTrack;
            return button;
        } else {
            let button = new MediaTrackRadioButton();
            button.track = track as MediaTrack;
            return button;
        }
    }

    private _updateOffButton(): void {
        if (this.trackType === 'subtitles' && this.showOffButton) {
            if (this._offButton === undefined) {
                this._offButton = new TextTrackOffRadioButton();
                this._radioGroup.insertBefore(this._offButton, this._radioGroup.firstChild);
            }
            this._offButton.trackList = this._tracksList! as TextTracksList;
        } else if (this._offButton !== undefined) {
            this._radioGroup.removeChild(this._offButton);
            this._offButton = undefined;
        }
    }

    private readonly _onChange = () => {
        this.dispatchEvent(createEvent('change', { bubbles: true }));
    };

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (newValue === oldValue) {
            return;
        }
        if (attrName === Attribute.TRACK_TYPE) {
            this._updateTracksList();
            this._updateTracks();
        } else if (attrName === Attribute.SHOW_OFF) {
            this._updateOffButton();
            this._updateTracks();
        }
        if (TrackRadioGroup.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-track-radio-group', TrackRadioGroup);

function hasButtonForTrack(buttons: readonly (MediaTrackRadioButton | TextTrackRadioButton)[], track: MediaTrack | TextTrack): boolean {
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].track === track) {
            return true;
        }
    }
    return false;
}

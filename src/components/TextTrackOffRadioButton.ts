import { html, type HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RadioButton } from './RadioButton';
import type { TextTracksList } from 'theoplayer/chromeless';
import { isNonForcedSubtitleTrack, isSubtitleTrack } from '../util/TrackUtils';

const TRACK_EVENTS = ['change'] as const;

/**
 * A radio button that disables the active subtitle track when clicked.
 *
 * @group Components
 */
@customElement('theoplayer-text-track-off-radio-button')
export class TextTrackOffRadioButton extends RadioButton {
    private _trackList: TextTracksList | undefined = undefined;

    get trackList(): TextTracksList | undefined {
        return this._trackList;
    }

    @property({ reflect: false, attribute: false })
    set trackList(trackList: TextTracksList | undefined) {
        if (this._trackList) {
            this._trackList.removeEventListener(TRACK_EVENTS, this._onTrackChange);
        }
        this._trackList = trackList;
        this._updateFromTrackList();
        if (trackList) {
            trackList.addEventListener(TRACK_EVENTS, this._onTrackChange);
        }
    }

    private _updateFromTrackList(): void {
        this.checked = this._trackList ? !hasShowingSubtitleTrack(this._trackList) : true;
    }

    private _updateTrackList(): void {
        if (this._trackList && this.checked) {
            disableSubtitleTracks(this._trackList);
        }
    }

    private readonly _onTrackChange = () => {
        this._updateFromTrackList();
    };

    protected override handleChange() {
        this._updateTrackList();
    }

    protected override render(): HTMLTemplateResult {
        return html`<slot>Off</slot>`;
    }
}

function hasShowingSubtitleTrack(trackList: TextTracksList): boolean {
    return trackList.some((track) => isNonForcedSubtitleTrack(track) && track.mode === 'showing');
}

function disableSubtitleTracks(trackList: TextTracksList): void {
    for (const track of trackList) {
        if (isSubtitleTrack(track) && track.mode === 'showing') {
            track.mode = 'disabled';
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-text-track-off-radio-button': TextTrackOffRadioButton;
    }
}

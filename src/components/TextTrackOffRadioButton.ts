import { RadioButton } from './RadioButton';
import { buttonTemplate } from './Button';
import type { TextTracksList } from 'theoplayer/chromeless';
import { isNonForcedSubtitleTrack, isSubtitleTrack } from '../util/TrackUtils';
import { Attribute } from '../util/Attribute';
import { createTemplate } from '../util/TemplateUtils';

const template = createTemplate('theoplayer-text-track-off-radio-button', buttonTemplate(`<slot>Off</slot>`));

const TRACK_EVENTS = ['change'] as const;

/**
 * `<theoplayer-text-track-off-radio-button>` - A radio button that disables the active subtitle track when clicked.
 *
 * @group Components
 */
export class TextTrackOffRadioButton extends RadioButton {
    private _trackList: TextTracksList | undefined = undefined;

    constructor() {
        super({ template: template() });
        this._upgradeProperty('trackList');
    }

    get trackList(): TextTracksList | undefined {
        return this._trackList;
    }

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

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (attrName === Attribute.ARIA_CHECKED && oldValue !== newValue) {
            this._updateTrackList();
        }
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

customElements.define('theoplayer-text-track-off-radio-button', TextTrackOffRadioButton);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-text-track-off-radio-button': TextTrackOffRadioButton;
    }
}

import * as shadyCss from '@webcomponents/shadycss';
import { ATTR_CHECKED, RadioButton } from './RadioButton';
import { buttonTemplate } from './Button';
import trackMenuButtonCss from './TrackMenuButton.css';
import type { TextTracksList } from 'theoplayer';
import { isSubtitleTrack } from '../util/TrackUtils';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<slot>Off</slot>`, trackMenuButtonCss);
shadyCss.prepareTemplate(template, 'theoplayer-text-track-off-menu-button');

const TRACK_EVENTS = ['change'] as const;

export class TextTrackOffMenuButton extends RadioButton {
    private _trackList: TextTracksList | undefined = undefined;

    constructor() {
        super({ template });
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

    protected handleClick(): void {
        this.checked = true;
    }

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (attrName === ATTR_CHECKED && oldValue !== newValue) {
            this._updateTrackList();
        }
    }
}

function hasShowingSubtitleTrack(trackList: TextTracksList): boolean {
    return trackList.filter(isSubtitleTrack).some((x) => x.mode === 'showing');
}

function disableSubtitleTracks(trackList: TextTracksList): void {
    for (const track of trackList) {
        if (isSubtitleTrack(track) && track.mode === 'showing') {
            track.mode = 'disabled';
        }
    }
}

customElements.define('theoplayer-text-track-off-menu-button', TextTrackOffMenuButton);
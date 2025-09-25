import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import verticalRadioGroupCss from './VerticalRadioGroup.css';
import { stateReceiver } from './StateReceiverMixin';
import type { ChromelessPlayer, MediaTrack, MediaTrackList, TextTrack, TextTracksList } from 'theoplayer/chromeless';
import { Attribute } from '../util/Attribute';
import { isNonForcedSubtitleTrack } from '../util/TrackUtils';
import { createEvent } from '../util/EventUtils';
import { repeat } from 'lit/directives/repeat.js';

const TRACK_EVENTS = ['addtrack', 'removetrack'] as const;

export type TrackType = 'audio' | 'video' | 'subtitles';

/**
 * A radio group that shows a list of media or text tracks,
 * from which the user can choose an active track.
 *
 * @attribute `track-type` - The track type of the available tracks. Can be "audio", "video" or "subtitles".
 * @attribute `show-off` - If set, shows an "off" button to disable all tracks.
 *   Can only be used with the "subtitles" track type.
 * @group Components
 */
@customElement('theoplayer-track-radio-group')
@stateReceiver(['player'])
export class TrackRadioGroup extends LitElement {
    static override styles = [verticalRadioGroupCss];

    private _player: ChromelessPlayer | undefined;
    private _trackType: TrackType = 'audio';

    @state()
    private accessor _tracksList: MediaTrackList | TextTracksList | undefined;

    /**
     * The track type of the available tracks.
     */
    get trackType(): TrackType {
        return this._trackType;
    }

    @property({ reflect: true, type: String, attribute: Attribute.TRACK_TYPE })
    set trackType(trackType: TrackType) {
        this._trackType = trackType;
        this._updateTracksList();
    }

    /**
     * If set, shows an "off" button to disable all tracks.
     *
     * Can only be used with the `"subtitles"` track type.
     */
    @property({ reflect: true, type: Boolean, attribute: Attribute.SHOW_OFF })
    accessor showOffButton: boolean = false;

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
            return this._player.textTracks.filter(isNonForcedSubtitleTrack);
        } else {
            return [];
        }
    }

    private readonly _updateTracks = (): void => this.requestUpdate();

    private readonly _onChange = () => {
        this.dispatchEvent(createEvent('change', { bubbles: true }));
    };

    protected override render(): HTMLTemplateResult {
        const tracks = this._getTracks();
        const isSubtitles = this.trackType === 'subtitles';
        return html`<theoplayer-radio-group @change=${this._onChange}>
            ${
                /* "Off" button */
                this.showOffButton && isSubtitles
                    ? html`<theoplayer-text-track-off-radio-button .trackList=${this._tracksList}></theoplayer-text-track-off-radio-button>`
                    : undefined
            }
            ${
                /* Track buttons */
                repeat(
                    tracks as ReadonlyArray<MediaTrack | TextTrack>,
                    (track) => track.uid,
                    (track) =>
                        isSubtitles
                            ? html`<theoplayer-text-track-radio-button .track=${track}></theoplayer-text-track-radio-button>`
                            : html`<theoplayer-media-track-radio-button .track=${track}></theoplayer-media-track-radio-button>`
                )
            }
        </theoplayer-radio-group>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-track-radio-group': TrackRadioGroup;
    }
}

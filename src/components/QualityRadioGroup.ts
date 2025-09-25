import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import verticalRadioGroupCss from './VerticalRadioGroup.css';
import { stateReceiver } from './StateReceiverMixin';
import type { ChromelessPlayer, MediaTrack, MediaTrackList, Quality, VideoQuality } from 'theoplayer/chromeless';
import { arrayFind } from '../util/CommonUtils';
import { createEvent } from '../util/EventUtils';
import { repeat } from 'lit/directives/repeat.js';

const TRACK_EVENTS = ['addtrack', 'removetrack', 'change'] as const;

/**
 * A radio group that shows a list of available video qualities,
 * from which the user can choose a desired target quality.
 *
 * @group Components
 */
@customElement('theoplayer-quality-radio-group')
@stateReceiver(['player'])
export class QualityRadioGroup extends LitElement {
    static override styles = [verticalRadioGroupCss];

    private _player: ChromelessPlayer | undefined;
    private _videoTracks: MediaTrackList | undefined;

    @state()
    private accessor _track: MediaTrack | undefined;

    protected override firstUpdated(): void {
        this._updateTrack();
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @state()
    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        this._videoTracks?.removeEventListener(TRACK_EVENTS, this._updateTrack);
        this._player = player;
        this._videoTracks = player?.videoTracks;
        this._updateTrack();
        this._videoTracks?.addEventListener(TRACK_EVENTS, this._updateTrack);
    }

    private readonly _onChange = () => {
        this.dispatchEvent(createEvent('change', { bubbles: true }));
    };

    private readonly _updateTrack = (): void => {
        const track = this._player ? arrayFind(this._player.videoTracks, (track) => track.enabled) : undefined;
        if (this._track === track) {
            return;
        }
        this._track?.removeEventListener('update', this._update);
        this._track = track;
        this._track?.addEventListener('update', this._update);
        this._update();
    };

    private _update = () => this.requestUpdate();

    protected override render(): HTMLTemplateResult {
        const qualities: VideoQuality[] = this._track ? (this._track.qualities as Quality[] as VideoQuality[]) : [];
        return html`
            <theoplayer-radio-group @change=${this._onChange}>
                <theoplayer-quality-radio-button .track=${this._track} .quality=${undefined}></theoplayer-quality-radio-button>
                ${
                    /* If there is only one available quality, *only* show the "Automatic" option (without the single quality). */
                    qualities.length !== 1 &&
                    repeat(
                        qualities,
                        (quality) => quality.uid,
                        (quality) =>
                            html`<theoplayer-quality-radio-button .track=${this._track} .quality=${quality}></theoplayer-quality-radio-button>`
                    )
                }
            </theoplayer-radio-group>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-quality-radio-group': QualityRadioGroup;
    }
}

import { html, type HTMLTemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { RadioButton } from './RadioButton';
import type { MediaTrack, VideoQuality } from 'theoplayer/chromeless';
import { formatQualityLabel } from '../util/TrackUtils';

const TRACK_EVENTS = ['activequalitychanged', 'targetqualitychanged'] as const;
const QUALITY_EVENTS = ['update'] as const;

/**
 * `<theoplayer-quality-radio-button>` - A radio button that shows the label of a given video quality,
 * and switches the video track's {@link theoplayer!MediaTrack.targetQuality | target quality} to that quality when clicked.
 *
 * @group Components
 */
@customElement('theoplayer-quality-radio-button')
export class QualityRadioButton extends RadioButton {
    private _track: MediaTrack | undefined = undefined;
    private _quality: VideoQuality | undefined = undefined;

    @state()
    private accessor _qualityLabel = '';

    /**
     * The video track containing the quality being controlled.
     */
    get track(): MediaTrack | undefined {
        return this._track;
    }

    @property({ reflect: false, attribute: false })
    set track(track: MediaTrack | undefined) {
        if (this._track === track) {
            return;
        }
        if (this._track) {
            this._track.removeEventListener(TRACK_EVENTS, this._updateFromTrack);
        }
        this._track = track;
        this._updateFromTrack();
        if (track) {
            track.addEventListener(TRACK_EVENTS, this._updateFromTrack);
        }
    }

    /**
     * The video quality being controlled.
     */
    get quality(): VideoQuality | undefined {
        return this._quality;
    }

    @property({ reflect: false, attribute: false })
    set quality(quality: VideoQuality | undefined) {
        if (this._quality === quality) {
            return;
        }
        if (this._quality) {
            this._quality.removeEventListener(QUALITY_EVENTS, this._updateFromQuality);
        }
        this._quality = quality;
        this._updateFromTrack();
        if (quality) {
            quality.addEventListener(QUALITY_EVENTS, this._updateFromQuality);
        }
    }

    private readonly _updateFromTrack = () => {
        if (this._track !== undefined) {
            let targetQualities = this._track.targetQuality;
            if (Array.isArray(targetQualities)) {
                if (targetQualities.length === 1) {
                    targetQualities = targetQualities[0];
                } else {
                    targetQualities = undefined;
                }
            }
            if (this._quality === undefined) {
                this.checked = targetQualities === undefined;
            } else {
                this.checked = targetQualities === this._quality;
            }
        }
        this._updateFromQuality();
    };

    private readonly _updateFromQuality = () => {
        this._qualityLabel = formatQualityLabel(this._quality) ?? 'Automatic';
    };

    protected override handleChange(): void {
        this._updateTargetQuality();
    }

    private _updateTargetQuality(): void {
        if (this._track && this.checked) {
            this._track.targetQuality = this._quality;
        }
    }

    protected override render(): HTMLTemplateResult {
        return html`<slot>${this._qualityLabel}</slot>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-quality-radio-button': QualityRadioButton;
    }
}

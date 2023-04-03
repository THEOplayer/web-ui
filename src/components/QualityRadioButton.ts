import * as shadyCss from '@webcomponents/shadycss';
import { RadioButton } from './RadioButton';
import { buttonTemplate } from './Button';
import type { MediaTrack, VideoQuality } from 'theoplayer';
import { setTextContent } from '../util/CommonUtils';
import { Attribute } from '../util/Attribute';
import { formatQualityLabel } from '../util/TrackUtils';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<slot></slot>`);
shadyCss.prepareTemplate(template, 'theoplayer-quality-radio-button');

const TRACK_EVENTS = ['activequalitychanged', 'targetqualitychanged'] as const;
const QUALITY_EVENTS = ['update'] as const;

/**
 * A radio button that shows the label of a given video quality, and switches the video track's
 * {@link theoplayer!MediaTrack.targetQuality | target quality} to that quality when clicked.
 */
export class QualityRadioButton extends RadioButton {
    private _slotEl: HTMLSlotElement;
    private _track: MediaTrack | undefined = undefined;
    private _quality: VideoQuality | undefined = undefined;

    constructor() {
        super({ template });
        this._slotEl = this.shadowRoot!.querySelector('slot')!;

        this._upgradeProperty('track');
        this._upgradeProperty('quality');
    }

    /**
     * The video track containing the quality being controlled.
     */
    get track(): MediaTrack | undefined {
        return this._track;
    }

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
            const targetQualities = this._track.targetQuality;
            if (this._quality === undefined) {
                this.checked = targetQualities === undefined;
            } else {
                this.checked = Array.isArray(targetQualities) ? targetQualities.indexOf(this._quality) >= 0 : targetQualities === this._quality;
            }
        }
        this._updateFromQuality();
    };

    private readonly _updateFromQuality = () => {
        setTextContent(this._slotEl, formatQualityLabel(this._quality) ?? 'Automatic');
    };

    private _updateTargetQuality(): void {
        if (this._track && this.checked) {
            this._track.targetQuality = this._quality;
        }
    }

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (newValue === oldValue) {
            return;
        }
        if (attrName === Attribute.ARIA_CHECKED) {
            this._updateTargetQuality();
        }
        if (QualityRadioButton.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-quality-radio-button', QualityRadioButton);

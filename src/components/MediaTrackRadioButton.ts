import { html, type HTMLTemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { RadioButton } from './RadioButton';
import type { MediaTrack } from 'theoplayer/chromeless';
import { localizeLanguageName } from '../util/CommonUtils';
import { Attribute } from '../util/Attribute';

const TRACK_EVENTS = ['change', 'update'] as const;

/**
 * `<theoplayer-media-track-radio-button>` - A radio button that shows the label of a given media track,
 * and switches to that track when clicked.
 *
 * @group Components
 */
@customElement('theoplayer-media-track-radio-button')
export class MediaTrackRadioButton extends RadioButton {
    private _track: MediaTrack | undefined = undefined;

    @state()
    private accessor _trackLabel = '';

    /**
     * The media track that is controlled by this radio button.
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
            this._track.removeEventListener(TRACK_EVENTS, this._onTrackChange);
        }
        this._track = track;
        this._updateFromTrack();
        if (track) {
            track.addEventListener(TRACK_EVENTS, this._onTrackChange);
        }
    }

    private _updateFromTrack(): void {
        this._trackLabel = this._track ? getTrackLabel(this._track) : '';
        this.checked = this._track ? this._track.enabled : false;
    }

    private _updateTrack(): void {
        if (this._track) {
            this._track.enabled = this.checked;
        }
    }

    private readonly _onTrackChange = () => {
        this._updateFromTrack();
    };

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (attrName === Attribute.ARIA_CHECKED && oldValue !== newValue) {
            this._updateTrack();
        }
    }

    protected override render(): HTMLTemplateResult {
        return html`<slot>${this._trackLabel}</slot>`;
    }
}

function getTrackLabel(track: MediaTrack): string {
    let label = track.label;
    if (label) {
        return label;
    }
    let languageCode = track.language;
    if (!languageCode) {
        return '';
    }
    return localizeLanguageName(languageCode) || languageCode || '';
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-media-track-radio-button': MediaTrackRadioButton;
    }
}

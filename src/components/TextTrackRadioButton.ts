import { RadioButton } from './RadioButton';
import type { TextTrack } from 'theoplayer/chromeless';
import { localizeLanguageName } from '../util/CommonUtils';
import { customElement, property, state } from 'lit/decorators.js';
import { html, type HTMLTemplateResult } from 'lit';

const TRACK_EVENTS = ['change', 'update'] as const;

/**
 * `<theoplayer-text-track-radio-button>` -A radio button that shows the label of a given text track, and switches to that track when clicked.
 */
@customElement('theoplayer-text-track-radio-button')
export class TextTrackRadioButton extends RadioButton {
    private _track: TextTrack | undefined = undefined;

    @state()
    private accessor _trackLabel = '';

    /**
     * The text track that is controlled by this radio button.
     */
    get track(): TextTrack | undefined {
        return this._track;
    }

    @property({ reflect: false, attribute: false })
    set track(track: TextTrack | undefined) {
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
        this.checked = this._track ? this._track.mode === 'showing' : false;
    }

    private _updateTrack(): void {
        if (this._track) {
            this._track.mode = this.checked ? 'showing' : 'disabled';
        }
    }

    private readonly _onTrackChange = () => {
        this._updateFromTrack();
    };

    protected override handleChange(): void {
        this._updateTrack();
    }

    protected override render(): HTMLTemplateResult {
        return html`<slot>${this._trackLabel}</slot>`;
    }
}

function getTrackLabel(track: TextTrack): string {
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
        'theoplayer-text-track-radio-button': TextTrackRadioButton;
    }
}

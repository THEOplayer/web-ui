import { html, type HTMLTemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { RadioButton } from './RadioButton';
import type { MediaTrack } from 'theoplayer/chromeless';
import { Attribute } from '../util/Attribute';
import { stateReceiver } from './StateReceiverMixin';
import { defaultLocale, getLocale, type Locale } from '../i18n';

const TRACK_EVENTS = ['change', 'update'] as const;

/**
 * A radio button that shows the label of a given media track,
 * and switches to that track when clicked.
 */
@customElement('theoplayer-media-track-radio-button')
@stateReceiver(['lang'])
export class MediaTrackRadioButton extends RadioButton {
    @state()
    private accessor _track: MediaTrack | undefined = undefined;

    @property({ reflect: true, type: String, attribute: Attribute.LANG })
    accessor lang: string = '';

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
        this.checked = this._track ? this._track.enabled : false;
        this.requestUpdate();
    }

    private _updateTrack(): void {
        if (this._track) {
            this._track.enabled = this.checked;
        }
    }

    private readonly _onTrackChange = () => {
        this._updateFromTrack();
    };

    protected override handleChange(): void {
        this._updateTrack();
    }

    protected override render(): HTMLTemplateResult {
        const locale = getLocale(this.lang);
        const label = this._track ? formatMediaTrackLabel(locale, this._track) : '';
        return html`<slot>${label}</slot>`;
    }
}

function formatMediaTrackLabel(locale: Locale, track: MediaTrack): string {
    let label = track.label;
    let languageCode = track.language;
    if (label) {
        if (languageCode && (label === languageCode || label === defaultLocale.formatLanguage(languageCode))) {
            // Ignore default label with just the language code or non-localized language name.
        } else {
            return label;
        }
    }
    let localizedLanguageName = languageCode && locale.formatLanguage(languageCode);
    if (localizedLanguageName) {
        return localizedLanguageName;
    }
    return label || languageCode || '';
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-media-track-radio-button': MediaTrackRadioButton;
    }
}

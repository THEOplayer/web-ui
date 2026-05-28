import { RadioButton } from './RadioButton';
import type { TextTrack } from 'theoplayer/chromeless';
import { customElement, property, state } from 'lit/decorators.js';
import { html, type HTMLTemplateResult } from 'lit';
import { Attribute } from '../util/Attribute';
import { stateReceiver } from './StateReceiverMixin';
import { defaultLocale, getLocale, type Locale } from '../i18n';

const TRACK_EVENTS = ['change', 'update'] as const;

/**
 * `<theoplayer-text-track-radio-button>` -A radio button that shows the label of a given text track, and switches to that track when clicked.
 */
@customElement('theoplayer-text-track-radio-button')
@stateReceiver(['lang'])
export class TextTrackRadioButton extends RadioButton {
    @state()
    private accessor _track: TextTrack | undefined = undefined;

    @property({ reflect: true, type: String, attribute: Attribute.LANG })
    accessor lang: string = '';

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
        this.checked = this._track ? this._track.mode === 'showing' : false;
        this.requestUpdate();
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
        const locale = getLocale(this.lang);
        const label = this._track ? formatTextTrackLabel(locale, this._track) : '';
        return html`<slot>${label}</slot>`;
    }
}

function formatTextTrackLabel(locale: Locale, track: TextTrack): string {
    let label = track.label;
    let languageCode = track.language;
    if (label) {
        if (label === languageCode || label === defaultLocale.formatLanguage(languageCode)) {
            // Ignore default label with just the language code or non-localized language name.
        } else if (track.type === 'cea608' && /^CC\d+$/.test(track.label)) {
            // Ignore default label with just the caption channel.
        } else {
            return label;
        }
    }
    let localizedLanguageName = languageCode && locale.formatLanguage(languageCode);
    if (localizedLanguageName) {
        return localizedLanguageName;
    }
    if (track.type === 'cea608' && typeof track.captionChannel === 'number') {
        return `CC${track.captionChannel}`;
    }
    return languageCode || label || '';
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-text-track-radio-button': TextTrackRadioButton;
    }
}

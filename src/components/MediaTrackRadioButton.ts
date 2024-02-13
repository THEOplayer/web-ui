import { RadioButton } from './RadioButton';
import { buttonTemplate } from './Button';
import type { MediaTrack } from 'theoplayer/chromeless';
import { localizeLanguageName, setTextContent } from '../util/CommonUtils';
import { Attribute } from '../util/Attribute';
import { createTemplate } from '../util/TemplateUtils';

const template = createTemplate('theoplayer-media-track-radio-button', buttonTemplate(`<slot></slot>`));

const TRACK_EVENTS = ['change', 'update'] as const;

/**
 * `<theoplayer-media-track-radio-button>` - A radio button that shows the label of a given media track,
 * and switches to that track when clicked.
 *
 * @group Components
 */
export class MediaTrackRadioButton extends RadioButton {
    private _slotEl: HTMLSlotElement;
    private _track: MediaTrack | undefined = undefined;

    constructor() {
        super({ template });
        this._slotEl = this.shadowRoot!.querySelector('slot')!;

        this._upgradeProperty('track');
    }

    /**
     * The media track that is controlled by this radio button.
     */
    get track(): MediaTrack | undefined {
        return this._track;
    }

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
        setTextContent(this._slotEl, this._track ? getTrackLabel(this._track) : '');
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

customElements.define('theoplayer-media-track-radio-button', MediaTrackRadioButton);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-media-track-radio-button': MediaTrackRadioButton;
    }
}

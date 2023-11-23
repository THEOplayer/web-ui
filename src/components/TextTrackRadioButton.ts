import * as shadyCss from '@webcomponents/shadycss';
import { RadioButton } from './RadioButton';
import { buttonTemplate } from './Button';
import type { TextTrack } from 'theoplayer/chromeless';
import { localizeLanguageName, setTextContent } from '../util/CommonUtils';
import { Attribute } from '../util/Attribute';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<slot></slot>`);
shadyCss.prepareTemplate(template, 'theoplayer-text-track-radio-button');

const TRACK_EVENTS = ['change', 'update'] as const;

/**
 * `<theoplayer-text-track-radio-button>` -A radio button that shows the label of a given text track, and switches to that track when clicked.
 *
 * @group Components
 */
export class TextTrackRadioButton extends RadioButton {
    private _slotEl: HTMLSlotElement;
    private _track: TextTrack | undefined = undefined;

    constructor() {
        super({ template });
        this._slotEl = this.shadowRoot!.querySelector('slot')!;
        this._upgradeProperty('track');
    }

    /**
     * The text track that is controlled by this radio button.
     */
    get track(): TextTrack | undefined {
        return this._track;
    }

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
        setTextContent(this._slotEl, this._track ? getTrackLabel(this._track) : '');
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

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (attrName === Attribute.ARIA_CHECKED && oldValue !== newValue) {
            this._updateTrack();
        }
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

customElements.define('theoplayer-text-track-radio-button', TextTrackRadioButton);

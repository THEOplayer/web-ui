import * as shadyCss from '@webcomponents/shadycss';
import { RadioButton } from './RadioButton';
import { buttonTemplate } from './Button';
import type { MediaTrack } from 'theoplayer';
import { localizeLanguageName, setTextContent } from '../util/CommonUtils';
import { Attribute } from '../util/Attribute';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<slot></slot>`);
shadyCss.prepareTemplate(template, 'theoplayer-media-track-radio-button');

const TRACK_EVENTS = ['change', 'update'] as const;

export class MediaTrackRadioButton extends RadioButton {
    private _slotEl: HTMLSlotElement;
    private _track: MediaTrack | undefined = undefined;

    constructor() {
        super({ template });
        this._slotEl = this.shadowRoot!.querySelector('slot')!;
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this._upgradeProperty('track');
    }

    get track(): MediaTrack | undefined {
        return this._track;
    }

    set track(track: MediaTrack | undefined) {
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

import * as shadyCss from '@webcomponents/shadycss';
import { RadioButton } from './RadioButton';
import { buttonTemplate } from './Button';
import trackMenuButtonCss from './TrackMenuButton.css';
import type { MediaTrack } from 'theoplayer';
import { localizeLanguageName } from '../util/CommonUtils';
import { Attribute } from '../util/Attribute';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<span></span>`, trackMenuButtonCss);
shadyCss.prepareTemplate(template, 'theoplayer-media-track-radio-button');

const TRACK_EVENTS = ['change', 'update'] as const;

export class MediaTrackRadioButton extends RadioButton {
    private _labelEl: HTMLElement;
    private _track: MediaTrack | undefined = undefined;

    constructor() {
        super({ template });
        this._labelEl = this.shadowRoot!.querySelector('span')!;
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
        this._labelEl.textContent = this._track ? getTrackLabel(this._track) : '';
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

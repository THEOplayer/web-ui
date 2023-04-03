import * as shadyCss from '@webcomponents/shadycss';
import { RadioGroup } from './RadioGroup';
import verticalRadioGroupCss from './VerticalRadioGroup.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer, MediaTrack, Quality, VideoQuality } from 'theoplayer';
import { arrayFind, fromArrayLike } from '../util/CommonUtils';
import { QualityRadioButton } from './QualityRadioButton';
import { createEvent } from '../util/EventUtils';

const template = document.createElement('template');
template.innerHTML = `<style>${verticalRadioGroupCss}</style><theoplayer-radio-group></theoplayer-radio-group>`;
shadyCss.prepareTemplate(template, 'theoplayer-quality-radio-group');

const TRACK_EVENTS = ['addtrack', 'removetrack', 'change'] as const;

/**
 * A radio group that shows a list of available video qualities, from which the user can choose a desired target quality.
 *
 * @group Components
 */
export class QualityRadioGroup extends StateReceiverMixin(HTMLElement, ['player']) {
    private readonly _radioGroup: RadioGroup;
    private _player: ChromelessPlayer | undefined;
    private _track: MediaTrack | undefined;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._radioGroup = shadowRoot.querySelector('theoplayer-radio-group')!;

        this._upgradeProperty('player');
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        if (!(this._radioGroup instanceof RadioGroup)) {
            customElements.upgrade(this._radioGroup);
        }

        this._updateTrack();
        this.shadowRoot!.addEventListener('change', this._onChange);
    }

    disconnectedCallback(): void {
        this.shadowRoot!.removeEventListener('change', this._onChange);
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._player.videoTracks.removeEventListener(TRACK_EVENTS, this._updateTrack);
        }
        this._player = player;
        this._updateTrack();
        if (this._player !== undefined) {
            this._player.videoTracks.addEventListener(TRACK_EVENTS, this._updateTrack);
        }
    }

    private readonly _onChange = () => {
        this.dispatchEvent(createEvent('change', { bubbles: true }));
    };

    private readonly _updateTrack = (): void => {
        const track = this._player ? arrayFind(this._player.videoTracks, (track) => track.enabled) : undefined;
        if (this._track === track) {
            return;
        }
        this._track = track;
        this._update();
    };

    private readonly _update = (): void => {
        const buttons = fromArrayLike(this._radioGroup.children) as QualityRadioButton[];
        const availableQualities: VideoQuality[] = this._track ? (this._track.qualities as Quality[] as VideoQuality[]) : [];
        // If there is only one available quality, *only* show the "Automatic" option (without the single quality).
        // Otherwise, add an "Automatic" option at the front.
        let qualities: (VideoQuality | undefined)[] = availableQualities.length === 1 ? [undefined] : [undefined, ...availableQualities];
        let i = 0;
        // Add buttons for each quality
        while (i < buttons.length && i < qualities.length) {
            const button = buttons[i];
            button.track = this._track;
            button.quality = qualities[i];
            i++;
        }
        while (i < buttons.length) {
            this._radioGroup.removeChild(buttons[i]);
            i++;
        }
        while (i < qualities.length) {
            const button = new QualityRadioButton();
            button.track = this._track;
            button.quality = qualities[i];
            this._radioGroup.appendChild(button);
            i++;
        }
    };
}

customElements.define('theoplayer-quality-radio-group', QualityRadioGroup);

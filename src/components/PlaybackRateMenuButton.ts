import * as shadyCss from '@webcomponents/shadycss';
import { buttonTemplate } from './Button';
import { MenuButton } from './MenuButton';
import { StateReceiverMixin } from './StateReceiverMixin';
import { setTextContent } from '../util/CommonUtils';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<slot>1x</slot>`);
shadyCss.prepareTemplate(template, 'theoplayer-playback-rate-menu-button');

/**
 * A menu button that shows the current playback rate, and is intended to open a playback rate menu.
 */
export class PlaybackRateMenuButton extends StateReceiverMixin(MenuButton, ['playbackRate']) {
    private readonly _slotEl: HTMLSlotElement;
    private _playbackRate: number = 1;

    constructor() {
        super({ template });
        this._slotEl = this.shadowRoot!.querySelector('slot')!;
    }

    /**
     * The current playback rate.
     */
    get playbackRate(): number {
        return this._playbackRate;
    }

    set playbackRate(value: number) {
        this._playbackRate = value;
        setTextContent(this._slotEl, value === 1 ? 'Normal' : `${value}x`);
    }

    setPlaybackRate(value: number): void {
        this.playbackRate = value;
    }
}

customElements.define('theoplayer-playback-rate-menu-button', PlaybackRateMenuButton);

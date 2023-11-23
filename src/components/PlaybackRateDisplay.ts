import { StateReceiverMixin } from './StateReceiverMixin';
import { setTextContent } from '../util/CommonUtils';
import * as shadyCss from '@webcomponents/shadycss';

/**
 * `<theoplayer-playback-rate-display>` - A control that displays the current playback rate of the player.
 *
 * @group Components
 */
export class PlaybackRateDisplay extends StateReceiverMixin(HTMLElement, ['playbackRate']) {
    private readonly _spanEl: HTMLSpanElement;
    private _playbackRate: number = 1;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        this._spanEl = document.createElement('span');
        shadowRoot.appendChild(this._spanEl);

        this._upgradeProperty('playbackRate');
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    get playbackRate(): number {
        return this._playbackRate;
    }

    set playbackRate(value: number) {
        this._playbackRate = value;
        setTextContent(this._spanEl, value === 1 ? 'Normal' : `${value}x`);
    }
}

customElements.define('theoplayer-playback-rate-display', PlaybackRateDisplay);

import { html, type HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { Button } from './Button';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import liveButtonCss from './LiveButton.css';
import liveIcon from '../icons/live.svg';
import { stateReceiver } from './StateReceiverMixin';
import { Attribute } from '../util/Attribute';
import type { StreamType } from '../util/StreamType';

const PAUSED_EVENTS = ['play', 'pause', 'playing', 'emptied'] as const;
const LIVE_EVENTS = ['seeking', 'seeked', 'timeupdate', 'durationchange', 'emptied'] as const;

const DEFAULT_LIVE_THRESHOLD = 10;

/**
 * A button that shows whether the player is currently playing at the live point,
 * and seeks to the live point when clicked.
 *
 * @attribute `live-threshold` - The maximum distance (in seconds) from the live point that the player's current time
 *   can be for it to still be considered "at the live point". If unset, defaults to 10 seconds.
 * @attribute `live` (readonly) - Whether the player is considered to be playing at the live point.
 * @group Components
 */
@customElement('theoplayer-live-button')
@stateReceiver(['player', 'streamType'])
export class LiveButton extends Button {
    static styles = [...Button.styles, liveButtonCss];

    private _player: ChromelessPlayer | undefined;
    private _liveThreshold: number = DEFAULT_LIVE_THRESHOLD;

    connectedCallback() {
        super.connectedCallback();

        if (!this.hasAttribute(Attribute.ARIA_LABEL)) {
            this.setAttribute(Attribute.ARIA_LABEL, 'seek to live');
        }
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.PAUSED })
    accessor paused: boolean = false;

    @property({ reflect: true, type: String, attribute: Attribute.STREAM_TYPE })
    accessor streamType: StreamType = 'vod';

    get liveThreshold(): number {
        return this._liveThreshold;
    }

    @property({ reflect: true, type: Number, attribute: Attribute.LIVE_THRESHOLD, useDefault: true })
    set liveThreshold(value: number) {
        this._liveThreshold = isNaN(value) ? 0 : value;
        this._updateLive();
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.LIVE })
    accessor live: boolean = false;

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._player.removeEventListener(PAUSED_EVENTS, this._updatePaused);
            this._player.removeEventListener(LIVE_EVENTS, this._updateLive);
        }
        this._player = player;
        this._updatePaused();
        this._updateLive();
        if (this._player !== undefined) {
            this._player.addEventListener(PAUSED_EVENTS, this._updatePaused);
            this._player.addEventListener(LIVE_EVENTS, this._updateLive);
        }
    }

    private readonly _updatePaused = () => {
        this.paused = this._player !== undefined ? this._player.paused : true;
    };

    private readonly _updateLive = () => {
        this.live = this._player !== undefined ? isLive(this._player, this.liveThreshold) : false;
    };

    protected override handleClick() {
        if (this._player === undefined) {
            return;
        }
        if (this._player.hesp && this._player.hesp.manifest !== undefined) {
            this._player.hesp.goLive();
        } else {
            this._player.currentTime = Infinity;
            this._player.play();
        }
    }

    protected override render(): HTMLTemplateResult {
        return html`<span part="icon"><slot name="icon">${unsafeSVG(liveIcon)}</slot></span
            ><slot name="spacer"> </slot><span part="text"><slot name="text">LIVE</slot></span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-live-button': LiveButton;
    }
}

function isLive(player: ChromelessPlayer, threshold: number): boolean {
    if (player.duration === Infinity) {
        const seekable = player.seekable;
        if (seekable.length > 0) {
            return seekable.end(seekable.length - 1) - player.currentTime <= threshold;
        } else {
            return true;
        }
    }
    return false;
}

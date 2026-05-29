import { html, type HTMLTemplateResult, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { Button } from './Button';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import liveButtonCss from './LiveButton.css';
import liveIcon from '../icons/live.svg';
import { stateReceiver } from './StateReceiverMixin';
import { Attribute } from '../util/Attribute';
import type { StreamType } from '../util/StreamType';
import { getLocale, languageContext } from '../i18n';
import { consume } from '@lit/context';

const PAUSED_EVENTS = ['play', 'pause', 'playing', 'emptied'] as const;
const LIVE_EVENTS = ['seeking', 'seeked', 'timeupdate', 'durationchange', 'emptied'] as const;

const DEFAULT_LIVE_THRESHOLD = 10;

/**
 * A button that shows whether the player is currently playing at the live point,
 * and seeks to the live point when clicked.
 *
 * @cssproperty `--theoplayer-live-button-color` - The color of the live indicator when not at the live point. Defaults to `rgb(140, 140, 140)`.
 * @cssproperty `--theoplayer-live-button-active-color` - The color of the live indicator when playing at the live point. Defaults to `red`.
 */
@customElement('theoplayer-live-button')
@stateReceiver(['player', 'streamType'])
export class LiveButton extends Button {
    static styles = [...Button.styles, liveButtonCss];

    private _player: ChromelessPlayer | undefined;
    private _liveThreshold: number = DEFAULT_LIVE_THRESHOLD;

    /**
     * Whether the player is paused.
     */
    @property({ reflect: true, type: Boolean, attribute: Attribute.PAUSED })
    accessor paused: boolean = false;

    /**
     * The stream type, either "vod", "live" or "dvr".
     */
    @property({ reflect: true, type: String, attribute: Attribute.STREAM_TYPE })
    accessor streamType: StreamType = 'vod';

    /**
     * The maximum distance (in seconds) from the live point that the player's current time
     * can be for it to still be considered "at the live point".
     *
     * If unset, defaults to 10 seconds.
     */
    get liveThreshold(): number {
        return this._liveThreshold;
    }

    @property({ reflect: true, type: Number, attribute: Attribute.LIVE_THRESHOLD, useDefault: true })
    set liveThreshold(value: number) {
        this._liveThreshold = isNaN(value) ? 0 : value;
        this._updateLive();
    }

    /**
     * Whether the player is considered to be playing at the live point.
     */
    @property({ reflect: true, type: Boolean, attribute: Attribute.LIVE })
    accessor live: boolean = false;

    @property({ reflect: true, type: String, attribute: Attribute.LANG })
    @consume({ context: languageContext, subscribe: true })
    accessor lang: string = '';

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

    override willUpdate(changedProperties: PropertyValues) {
        super.willUpdate(changedProperties);
        this._updateAriaLabel();
    }

    private _updateAriaLabel(): void {
        const locale = getLocale(this.lang);
        this.ariaLabel = locale.seekToLiveAria;
    }

    protected override render(): HTMLTemplateResult {
        const locale = getLocale(this.lang);
        return html`<span part="icon"><slot name="icon">${unsafeSVG(liveIcon)}</slot></span
            ><slot name="spacer"> </slot><span part="text"><slot name="text">${locale.live}</slot></span>`;
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

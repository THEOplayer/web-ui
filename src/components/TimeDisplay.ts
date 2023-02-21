import * as shadyCss from '@webcomponents/shadycss';
import textDisplayCss from './TextDisplay.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer';
import { setTextContent } from '../util/CommonUtils';
import { formatAsTimePhrase, formatTime } from '../util/TimeUtils';
import { Attribute } from '../util/Attribute';
import type { StreamType } from '../util/StreamType';

const template = document.createElement('template');
template.innerHTML = `<style>${textDisplayCss}</style><span></span>`;
shadyCss.prepareTemplate(template, 'theoplayer-time-display');

const PLAYER_EVENTS = ['timeupdate', 'seeking', 'seeked', 'durationchange'] as const;

const DEFAULT_MISSING_TIME_PHRASE = 'video not loaded, unknown time';

/**
 * A control that displays the current time of the stream.
 *
 * @attribute show-duration - If set, also shows the duration of the stream.
 * @attribute remaining - If set, shows the remaining time of the stream. Not compatible with `show-duration`.
 * @attribute remaining-when-live - If set, and the stream is a livestream, shows the remaining time
 *   (until the live point) of the stream.
 */
export class TimeDisplay extends StateReceiverMixin(HTMLElement, ['player', 'streamType']) {
    private readonly _spanEl: HTMLElement;
    private _player: ChromelessPlayer | undefined;

    static get observedAttributes() {
        return [Attribute.REMAINING, Attribute.REMAINING_WHEN_LIVE, Attribute.SHOW_DURATION, Attribute.STREAM_TYPE];
    }

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        this._spanEl = shadowRoot.querySelector('span')!;
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);
        this._upgradeProperty('player');
        this._updateFromPlayer();
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._player.removeEventListener(PLAYER_EVENTS, this._updateFromPlayer);
        }
        this._player = player;
        this._updateFromPlayer();
        if (this._player !== undefined) {
            this._player.addEventListener(PLAYER_EVENTS, this._updateFromPlayer);
        }
    }

    get streamType(): StreamType {
        return (this.getAttribute(Attribute.STREAM_TYPE) || 'vod') as StreamType;
    }

    set streamType(streamType: StreamType) {
        this.setAttribute(Attribute.STREAM_TYPE, streamType);
    }

    private readonly _updateFromPlayer = () => {
        const currentTime = this._player ? this._player.currentTime : 0;
        const duration = this._player ? this._player.duration : NaN;
        const seekable = this._player?.seekable;
        const endTime = isFinite(duration) ? duration : seekable && seekable.length > 0 ? seekable.end(0) : NaN;
        const remaining = this.hasAttribute(Attribute.REMAINING) || (this.hasAttribute(Attribute.REMAINING_WHEN_LIVE) && this.streamType !== 'vod');
        let time = currentTime;
        if (remaining) {
            time = -((endTime || 0) - currentTime);
        }
        const showDuration = this.hasAttribute(Attribute.SHOW_DURATION);
        let text: string;
        if (showDuration && !remaining) {
            text = `${formatTime(time, endTime, remaining)} / ${formatTime(endTime)}`;
        } else {
            text = formatTime(time, endTime, remaining);
        }
        let ariaValueText: string;
        if (isNaN(duration)) {
            ariaValueText = DEFAULT_MISSING_TIME_PHRASE;
        } else if (showDuration) {
            ariaValueText = `${formatAsTimePhrase(time, remaining)} of ${formatAsTimePhrase(endTime)}`;
        } else {
            ariaValueText = formatAsTimePhrase(time, remaining);
        }
        setTextContent(this._spanEl, text);
        this.setAttribute('aria-valuetext', ariaValueText);
    };

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (newValue === oldValue) {
            return;
        }
        if (TimeDisplay.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            this._updateFromPlayer();
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-time-display', TimeDisplay);

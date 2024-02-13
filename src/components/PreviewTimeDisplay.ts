import * as shadyCss from '@webcomponents/shadycss';
import textDisplayCss from './TextDisplay.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import { setTextContent } from '../util/CommonUtils';
import { formatTime } from '../util/TimeUtils';
import { Attribute } from '../util/Attribute';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import type { StreamType } from '../util/StreamType';
import { createTemplate } from '../util/TemplateUtils';

const template = createTemplate('theoplayer-preview-time-display', `<style>${textDisplayCss}</style><span></span>`);

const PLAYER_EVENTS = ['timeupdate', 'seeking', 'seeked', 'durationchange'] as const;

/**
 * `<theoplayer-preview-time-display>` - A display that shows the current preview time of a {@link TimeRange | `<theoplayer-time-range>`}.
 *
 * @attribute `remaining` - If set, shows the remaining time of the stream.
 * @attribute `remaining-when-live` - If set, and the stream is a livestream, shows the remaining time
 *   (until the live point) of the stream.
 * @group Components
 */
export class PreviewTimeDisplay extends StateReceiverMixin(HTMLElement, ['player', 'previewTime', 'streamType']) {
    private readonly _spanEl: HTMLElement;
    private _previewTime: number = NaN;
    private _player: ChromelessPlayer | undefined;

    static get observedAttributes() {
        return [Attribute.REMAINING, Attribute.REMAINING_WHEN_LIVE, Attribute.STREAM_TYPE];
    }

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template().content.cloneNode(true));
        this._spanEl = shadowRoot.querySelector('span')!;

        this._upgradeProperty('previewTime');
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
        this._update();
    }

    get previewTime(): number {
        return this._previewTime;
    }

    set previewTime(previewTime: number) {
        this._previewTime = previewTime;
        this._update();
    }

    get streamType(): StreamType {
        return (this.getAttribute(Attribute.STREAM_TYPE) || 'vod') as StreamType;
    }

    set streamType(streamType: StreamType) {
        this.setAttribute(Attribute.STREAM_TYPE, streamType);
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._player.removeEventListener(PLAYER_EVENTS, this._update);
        }
        this._player = player;
        this._update();
        if (this._player !== undefined) {
            this._player.addEventListener(PLAYER_EVENTS, this._update);
        }
    }

    private readonly _update = (): void => {
        let previewTime = this._previewTime;
        const duration = this._player ? this._player.duration : NaN;
        const seekable = this._player?.seekable;
        const endTime = isFinite(duration) ? duration : seekable && seekable.length > 0 ? seekable.end(0) : NaN;
        const remaining = this.hasAttribute(Attribute.REMAINING) || (this.hasAttribute(Attribute.REMAINING_WHEN_LIVE) && this.streamType !== 'vod');
        if (remaining) {
            previewTime = -((endTime || 0) - previewTime);
        }
        setTextContent(this._spanEl, formatTime(previewTime, endTime, remaining));
    };

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (newValue === oldValue) {
            return;
        }
        if (PreviewTimeDisplay.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            this._update();
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-preview-time-display', PreviewTimeDisplay);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-preview-time-display': PreviewTimeDisplay;
    }
}

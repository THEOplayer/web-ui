import * as shadyCss from '@webcomponents/shadycss';
import { Button, buttonTemplate } from './Button';
import type { ChromelessPlayer } from 'theoplayer';
import liveButtonCss from './LiveButton.css';
import liveIcon from '../icons/live.svg';
import { StateReceiverMixin } from './StateReceiverMixin';
import { Attribute } from '../util/Attribute';
import type { StreamType } from '../util/StreamType';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(
    `<span part="icon"><slot name="icon">${liveIcon}</slot></span>` +
        `<slot name="spacer"> </slot>` +
        `<span part="text"><slot name="text">LIVE</slot></span>`,
    liveButtonCss
);
shadyCss.prepareTemplate(template, 'theoplayer-live-button');

const PAUSED_EVENTS = ['play', 'pause', 'playing', 'emptied'] as const;
const LIVE_EVENTS = ['seeking', 'seeked', 'timeupdate', 'durationchange', 'emptied'] as const;

const DEFAULT_LIVE_THRESHOLD = 10;

export class LiveButton extends StateReceiverMixin(Button, ['player', 'streamType']) {
    static get observedAttributes() {
        return [...Button.observedAttributes, Attribute.STREAM_TYPE, Attribute.LIVE, Attribute.PAUSED, Attribute.LIVE_THRESHOLD];
    }

    private _player: ChromelessPlayer | undefined;

    constructor() {
        super({ template });
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this._upgradeProperty('paused');
        this._upgradeProperty('streamType');
        this._upgradeProperty('liveThreshold');
        this._upgradeProperty('live');
        this._upgradeProperty('player');
    }

    get paused(): boolean {
        return this.hasAttribute(Attribute.PAUSED);
    }

    set paused(paused: boolean) {
        if (paused) {
            this.setAttribute(Attribute.PAUSED, '');
        } else {
            this.removeAttribute(Attribute.PAUSED);
        }
    }

    get streamType(): StreamType {
        return (this.getAttribute(Attribute.STREAM_TYPE) || 'vod') as StreamType;
    }

    set streamType(streamType: StreamType) {
        this.setAttribute(Attribute.STREAM_TYPE, streamType);
    }

    setStreamType(streamType: StreamType): void {
        this.streamType = streamType;
    }

    get liveThreshold(): number {
        return Number(this.getAttribute(Attribute.LIVE_THRESHOLD) ?? DEFAULT_LIVE_THRESHOLD);
    }

    set liveThreshold(value: number) {
        value = Number(value);
        this.setAttribute(Attribute.LIVE_THRESHOLD, String(isNaN(value) ? 0 : value));
    }

    get live(): boolean {
        return this.hasAttribute(Attribute.LIVE);
    }

    set live(live: boolean) {
        if (live) {
            this.setAttribute(Attribute.LIVE, '');
        } else {
            this.removeAttribute(Attribute.LIVE);
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

    setPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
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

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (newValue === oldValue) {
            return;
        }
        if (attrName === Attribute.LIVE_THRESHOLD) {
            this._updateLive();
        }
        if (LiveButton.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-live-button', LiveButton);

function isLive(player: ChromelessPlayer, threshold: number): boolean {
    if (player.duration === Infinity) {
        const seekable = player.seekable;
        if (seekable.length > 0) {
            return seekable.end(seekable.length - 1) - player.currentTime <= threshold;
        }
    }
    return false;
}

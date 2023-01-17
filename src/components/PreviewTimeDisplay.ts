import * as shadyCss from '@webcomponents/shadycss';
import textDisplayCss from './TextDisplay.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import { setTextContent } from '../util/CommonUtils';
import { formatTime } from '../util/TimeUtils';
import { Attribute } from '../util/Attribute';
import type { ChromelessPlayer } from 'theoplayer';

const template = document.createElement('template');
template.innerHTML = `<style>${textDisplayCss}</style><span></span>`;
shadyCss.prepareTemplate(template, 'theoplayer-preview-time-display');

const PLAYER_EVENTS = ['timeupdate', 'seeking', 'seeked', 'durationchange'] as const;

export class PreviewTimeDisplay extends StateReceiverMixin(HTMLElement, ['player', 'previewTime']) {
    private readonly _spanEl: HTMLElement;
    private _previewTime: number = NaN;
    private _player: ChromelessPlayer | undefined;

    static get observedAttributes() {
        return [Attribute.REMAINING];
    }

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        this._spanEl = shadowRoot.querySelector('span')!;
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

    setPreviewTime(previewTime: number): void {
        this.previewTime = previewTime;
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

    setPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
    }

    private readonly _update = (): void => {
        let previewTime = this._previewTime;
        const duration = this._player ? this._player.duration : NaN;
        const seekable = this._player?.seekable;
        const endTime = isFinite(duration) ? duration : seekable && seekable.length > 0 ? seekable.end(0) : NaN;
        const remaining = this.hasAttribute(Attribute.REMAINING);
        if (remaining) {
            previewTime = -((endTime || 0) - previewTime);
        }
        setTextContent(this._spanEl, formatTime(previewTime, endTime, remaining));
    };
}

customElements.define('theoplayer-preview-time-display', PreviewTimeDisplay);

import * as shadyCss from '@webcomponents/shadycss';
import previewThumbnailCss from './PreviewThumbnail.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer, TextTrack, TextTrackCue, TextTrackCueList } from 'theoplayer';
import { arrayFind, noOp } from '../util/CommonUtils';

const template = document.createElement('template');
template.innerHTML = `<style>${previewThumbnailCss}</style><canvas></canvas>`;
shadyCss.prepareTemplate(template, 'theoplayer-preview-thumbnail');

const TRACK_EVENTS = ['addtrack', 'removetrack'] as const;

/**
 * A display that shows the thumbnail image at the current preview time of a [`<theoplayer-time-range>`]{@link TimeRange}.
 *
 * The first `metadata` text track whose label equals `"thumbnails"` is used as source for the thumbnails.
 * This track is expected to contain cues whose content is the URL for the thumbnail image.
 * If the thumbnail image URL ends with a [spatial fragment]{@link https://www.w3.org/TR/media-frags/#naming-space}
 * (e.g. `#xywh=180,80,60,40`), then the thumbnail is clipped to the rectangle defined by that fragment.
 *
 * If the stream does not contain thumbnails, then this display shows nothing.
 */
export class PreviewThumbnail extends StateReceiverMixin(HTMLElement, ['player', 'previewTime']) {
    private readonly _canvasEl: HTMLCanvasElement;
    private readonly _canvasContext: CanvasRenderingContext2D;
    private readonly _thumbnailImageSource: HTMLImageElement;

    private _player: ChromelessPlayer | undefined;
    private _previewTime: number = NaN;
    private _thumbnailTextTrack: TextTrack | undefined;
    private _lastLoadedThumbnailUrl: string | undefined;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._canvasEl = shadowRoot.querySelector('canvas')!;
        this._canvasContext = this._canvasEl.getContext('2d')!;

        this._thumbnailImageSource = document.createElement('img');
        this._thumbnailImageSource.decoding = 'async';

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
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._player.textTracks.removeEventListener(TRACK_EVENTS, this._updateThumbnailTextTrack);
        }
        this._player = player;
        this._updateThumbnailTextTrack();
        if (this._player !== undefined) {
            this._player.textTracks.addEventListener(TRACK_EVENTS, this._updateThumbnailTextTrack);
        }
    }

    get previewTime(): number {
        return this._previewTime;
    }

    set previewTime(previewTime: number) {
        this._previewTime = previewTime;
        this.updateThumbnail_();
    }

    private readonly _updateThumbnailTextTrack = (): void => {
        const oldTrack = this._thumbnailTextTrack;
        const newTrack = this._player ? arrayFind(this._player.textTracks, isThumbnailTextTrack) : undefined;
        if (oldTrack === newTrack) {
            return;
        }
        this._thumbnailTextTrack = newTrack;
        this.updateThumbnail_();
    };

    private updateThumbnail_(): void {
        const track = this._thumbnailTextTrack;
        if (track === undefined) {
            this.hideThumbnail_();
            return;
        }
        if (track.mode === 'disabled') {
            track.mode = 'hidden';
        }
        const cue = getCueAtTime(track.cues!, this._previewTime);
        if (cue === undefined) {
            this.hideThumbnail_();
            return;
        }
        const content = (cue.content as string).trim();
        const sprite = parseSpriteUrl(content);
        // Resolve relative URLs against track's URL (or page URL)
        let thumbnailUrl = sprite ? sprite.url : content;
        thumbnailUrl = new URL(thumbnailUrl, track.src || location.href).href;
        // Load thumbnail image, if not yet loaded
        if (this._lastLoadedThumbnailUrl !== thumbnailUrl) {
            this.loadThumbnailImage_(thumbnailUrl);
            return;
        }
        this.showThumbnail_(sprite);
    }

    private loadThumbnailImage_(url: string): void {
        if (this._thumbnailImageSource.src === url) {
            // Already loading this URL, wait for the current load to complete.
            return;
        }
        const onLoad = () => {
            this._lastLoadedThumbnailUrl = url;
            this.updateThumbnail_();
        };
        if (typeof this._thumbnailImageSource.decode === 'function') {
            // Load and decode in parallel
            this._thumbnailImageSource.src = url;
            this._thumbnailImageSource.decode().then(onLoad, noOp);
        } else {
            // Load in parallel, decode synchronously
            this._thumbnailImageSource.onload = onLoad;
            // Reset `src` to ensure `onload` will be triggered.
            this._thumbnailImageSource.src = '';
            this._thumbnailImageSource.src = url;
        }
    }

    private showThumbnail_(sprite: Sprite | undefined): void {
        if (sprite) {
            // Draw part of image
            this._canvasEl.width = sprite.w;
            this._canvasEl.height = sprite.h;
            this._canvasContext.drawImage(this._thumbnailImageSource, sprite.x, sprite.y, sprite.w, sprite.h, 0, 0, sprite.w, sprite.h);
        } else {
            // Draw entire image
            this._canvasEl.width = this._thumbnailImageSource.naturalWidth;
            this._canvasEl.height = this._thumbnailImageSource.naturalHeight;
            this._canvasContext.drawImage(this._thumbnailImageSource, 0, 0);
        }
        this._canvasEl.style.display = 'block';
    }

    private hideThumbnail_(): void {
        this._canvasEl.style.display = 'none';
    }
}

customElements.define('theoplayer-preview-thumbnail', PreviewThumbnail);

function isThumbnailTextTrack(track: TextTrack): boolean {
    return track.kind === 'metadata' && track.label === 'thumbnails';
}

function getCueAtTime(cues: TextTrackCueList, time: number): TextTrackCue | undefined {
    if (cues.length === 0) {
        return undefined;
    }
    let result = cues[0];
    for (let cue of cues) {
        if (cue.startTime <= time) {
            result = cue;
        } else if (time >= cue.endTime) {
            return result;
        }
    }
    return result;
}

interface Sprite {
    url: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

function parseSpriteUrl(spriteUrl: string): Sprite | undefined {
    const match = spriteUrl.match(/^(.+)#xywh=(\d+),(\d+),(\d+),(\d+)$/);
    if (!match) {
        return undefined;
    }
    const [, url, x, y, w, h] = match;
    return {
        url,
        x: +x,
        y: +y,
        w: +w,
        h: +h
    };
}

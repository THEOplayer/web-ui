import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import previewThumbnailCss from './PreviewThumbnail.css';
import { stateReceiver } from './StateReceiverMixin';
import type { ChromelessPlayer, TextTrack, TextTrackCue, TextTrackCueList, TextTracksList } from 'theoplayer/chromeless';
import { arrayFind, noOp } from '../util/CommonUtils';

const TRACK_EVENTS = ['addtrack', 'removetrack'] as const;

/**
 * `<theoplayer-preview-thumbnail>` - A display that shows the thumbnail image at the current preview time
 * of a {@link TimeRange | `<theoplayer-time-range>`}.
 *
 * The first `metadata` text track whose label equals `"thumbnails"` is used as source for the thumbnails.
 * This track is expected to contain cues whose content is the URL for the thumbnail image.
 * If the thumbnail image URL ends with a [spatial fragment](https://www.w3.org/TR/media-frags/#naming-space)
 * (e.g. `#xywh=180,80,60,40`), then the thumbnail is clipped to the rectangle defined by that fragment.
 *
 * If the stream does not contain thumbnails, then this display shows nothing.
 * @group Components
 */
@customElement('theoplayer-preview-thumbnail')
@stateReceiver(['player', 'previewTime'])
export class PreviewThumbnail extends LitElement {
    static override styles = [previewThumbnailCss];

    private readonly _canvasRef: Ref<HTMLCanvasElement> = createRef<HTMLCanvasElement>();
    private _canvasContext: CanvasRenderingContext2D | undefined;
    private readonly _thumbnailImageSource: HTMLImageElement;

    private _player: ChromelessPlayer | undefined;
    private _textTrackList: TextTracksList | undefined;
    private _previewTime: number = NaN;
    private _thumbnailTextTrack: TextTrack | undefined;
    private _lastLoadedThumbnailUrl: string | undefined;

    @state()
    private accessor _thumbnailVisible: boolean = false;

    constructor() {
        super();

        this._thumbnailImageSource = document.createElement('img');
        this._thumbnailImageSource.decoding = 'async';
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        this._textTrackList?.removeEventListener(TRACK_EVENTS, this._updateThumbnailTextTrack);
        this._player = player;
        this._textTrackList = player?.textTracks;
        this._updateThumbnailTextTrack();
        this._textTrackList?.addEventListener(TRACK_EVENTS, this._updateThumbnailTextTrack);
    }

    get previewTime(): number {
        return this._previewTime;
    }

    @state()
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
        const canvas = this._canvasRef.value;
        if (!canvas) return;
        this._canvasContext ??= canvas.getContext('2d') ?? undefined;
        if (!this._canvasContext) return;
        if (sprite) {
            // Draw part of image
            canvas.width = sprite.w;
            canvas.height = sprite.h;
            this._canvasContext.drawImage(this._thumbnailImageSource, sprite.x, sprite.y, sprite.w, sprite.h, 0, 0, sprite.w, sprite.h);
        } else {
            // Draw entire image
            canvas.width = this._thumbnailImageSource.naturalWidth;
            canvas.height = this._thumbnailImageSource.naturalHeight;
            this._canvasContext.drawImage(this._thumbnailImageSource, 0, 0);
        }
        this._thumbnailVisible = true;
    }

    private hideThumbnail_(): void {
        this._thumbnailVisible = false;
    }

    protected override render(): HTMLTemplateResult {
        const canvasStyle = { display: this._thumbnailVisible ? 'block' : 'none' };
        return html`<canvas ${ref(this._canvasRef)} style=${styleMap(canvasStyle)}></canvas>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-preview-thumbnail': PreviewThumbnail;
    }
}

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

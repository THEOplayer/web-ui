import type { ChromelessPlayer, TextTrackCue } from 'theoplayer/chromeless';
import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { ChapterTrackObserver, findChapterAt } from '../util/ChapterUtils';
import chapterMarkersCss from './TimeRangeChapterMarkers.css';

interface ChapterMarkerSegment {
    left: string;
    right: string;
    parts: string;
    atStart: boolean;
    atEnd: boolean;
}

function thumbPosition(fraction: number): string {
    return `calc(var(--theoplayer-range-thumb-width, 10px) / 2 + ${fraction} * (100% - var(--theoplayer-range-thumb-width, 10px)))`;
}

/**
 * Renders chapter markers for a time range.
 *
 * @group Components
 */
@customElement('theoplayer-time-range-chapter-markers')
export class TimeRangeChapterMarkers extends LitElement {
    static override styles = [chapterMarkersCss];

    private _chapterTrackObserver: ChapterTrackObserver | undefined;
    private _player: ChromelessPlayer | undefined;

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) return;
        this._player = player;
        this._chapterTrackObserver?.setPlayer(player);
    }

    @property({ attribute: false })
    accessor min: number = 0;

    @property({ attribute: false })
    accessor max: number = 0;

    @property({ attribute: false })
    accessor hoverTime: number = NaN;

    override connectedCallback(): void {
        super.connectedCallback();
        this._chapterTrackObserver = new ChapterTrackObserver(() => this.requestUpdate());
        this._chapterTrackObserver.setPlayer(this.player);
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        this._chapterTrackObserver?.destroy();
        this._chapterTrackObserver = undefined;
    }

    protected override render(): HTMLTemplateResult {
        const track = this._chapterTrackObserver?.track;
        const { min, max } = this;
        const span = max - min;
        const cues = Array.from(track?.cues ?? []);
        const activeCue = track?.activeCues?.[0];
        const hoveredCue = Number.isFinite(this.hoverTime) && track ? findChapterAt(track, this.hoverTime) : undefined;
        const segments: ChapterMarkerSegment[] = [];

        if (Number.isFinite(min) && Number.isFinite(max) && span > 0) {
            for (let index = 0; index < cues.length; index++) {
                const cue = cues[index];
                if (cue.endTime < min || cue.startTime > max) {
                    continue;
                }
                const atStart = cue.startTime <= min;
                const atEnd = cue.endTime >= max;
                const startTime = Math.max(min, cue.startTime);
                const endTime = Math.min(max, cue.endTime);
                // Boundaries use the same inset as the slider thumb; the outer edges stay flush with the track.
                const left = atStart ? '0' : thumbPosition((startTime - min) / span);
                const right = atEnd ? '0' : `calc(100% - ${thumbPosition((endTime - min) / span)})`;
                const nextCue: TextTrackCue | undefined = cues[index + 1];
                let parts = 'chapter';
                if (cue === activeCue) {
                    parts += ' active';
                }
                if (cue === hoveredCue) {
                    parts += ' hover';
                }
                // Draw a closing boundary when the next chapter does not start where this one ends, and after the last chapter.
                if (nextCue === undefined || nextCue.startTime !== cue.endTime) {
                    parts += ' discontinuous';
                }
                segments.push({ left, right, parts, atStart, atEnd });
            }
        }

        return html`${segments.map(
            (segment) =>
                html`<div
                    part=${segment.parts}
                    style=${styleMap({
                        left: segment.left,
                        right: segment.right,
                        borderLeftWidth: segment.atStart ? '0' : undefined,
                        borderRightWidth: segment.atEnd ? '0' : undefined
                    })}
                ></div>`
        )}`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-time-range-chapter-markers': TimeRangeChapterMarkers;
    }
}

import { html, type PropertyValues, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { ChapterTrackObserver, findChapterAt } from '../util/ChapterUtils';
import { stateReceiver } from './StateReceiverMixin';
import chapterDisplayCss from './ChapterDisplay.css';

const PLAYER_EVENTS = ['timeupdate', 'seeking', 'seeked'] as const;

/**
 * Displays the current chapter title.
 *
 * @cssproperty `--theoplayer-chapter-display-font-size` - The font size of the chapter title. Defaults to `16px`.
 */
@customElement('theoplayer-chapter-display')
@stateReceiver(['player', 'previewTime', 'previewActive'])
export class ChapterDisplay extends LitElement {
    static override styles = [chapterDisplayCss];

    private _player: ChromelessPlayer | undefined;
    private _chapterTrackObserver: ChapterTrackObserver | undefined;

    @state()
    private accessor _title: string = '';

    @state()
    accessor previewTime: number = NaN;

    @state()
    accessor previewActive: boolean = false;

    override connectedCallback(): void {
        super.connectedCallback();
        this.hidden = true;
        this._chapterTrackObserver = new ChapterTrackObserver(this._updateTitle);
        this._chapterTrackObserver.setPlayer(this._player);
        this._player?.addEventListener(PLAYER_EVENTS, this._updateTitle);
        this._updateTitle();
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        this._player?.removeEventListener(PLAYER_EVENTS, this._updateTitle);
        this._chapterTrackObserver?.destroy();
        this._chapterTrackObserver = undefined;
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        this._player?.removeEventListener(PLAYER_EVENTS, this._updateTitle);
        this._player = player;
        this._chapterTrackObserver?.setPlayer(player);
        if (this.isConnected) {
            this._player?.addEventListener(PLAYER_EVENTS, this._updateTitle);
        }
        this._updateTitle();
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties);
        if (changedProperties.has('previewTime') || changedProperties.has('previewActive')) {
            this._updateTitle();
        }
    }

    private readonly _updateTitle = (): void => {
        const track = this._chapterTrackObserver?.track;
        // A finite preview time, including 0, wins during preview; otherwise follow playback.
        const time = this.previewActive && Number.isFinite(this.previewTime) ? this.previewTime : this._player?.currentTime;
        const content = this._player && track && time !== undefined ? findChapterAt(track, time)?.content : undefined;
        const title = typeof content === 'string' ? content : '';
        this._title = title;
        this.hidden = title.length === 0;
    };

    protected override render() {
        return html`${this._title}`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-chapter-display': ChapterDisplay;
    }
}

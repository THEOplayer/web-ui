import type { ChromelessPlayer, TextTrack, TextTrackCue, TextTrackReadyState } from 'theoplayer/chromeless';

const HAVE_METADATA = 1;
const TEXT_TRACK_READY_STATE_ERROR: TextTrackReadyState = 3;

const PLAYER_EVENTS = ['sourcechange', 'loadedmetadata', 'loadeddata'] as const;
const TEXT_TRACK_LIST_EVENTS = ['addtrack', 'removetrack', 'change'] as const;
const CHAPTER_TRACK_EVENTS = ['addcue', 'removecue', 'readystatechange'] as const;

export function getChaptersTrack(player: ChromelessPlayer): TextTrack | undefined {
    if (player.readyState < HAVE_METADATA) {
        return undefined;
    }

    for (const track of player.textTracks) {
        if (
            track.kind === 'chapters' &&
            track.mode === 'showing' &&
            track.cues !== null &&
            track.cues.length > 0 &&
            track.readyState !== TEXT_TRACK_READY_STATE_ERROR
        ) {
            return track;
        }
    }
    return undefined;
}

export function findChapterAt(track: TextTrack, time: number): TextTrackCue | undefined {
    for (const cue of track.cues ?? []) {
        if (cue.startTime <= time && time < cue.endTime) {
            return cue;
        }
    }
    return undefined;
}

export class ChapterTrackObserver {
    private _player: ChromelessPlayer | undefined;
    private _track: TextTrack | undefined;
    private _observedTracks: TextTrack[] = [];
    private _destroyed = false;

    constructor(private readonly _onChange: () => void) {}

    get track(): TextTrack | undefined {
        return this._track;
    }

    setPlayer(player: ChromelessPlayer | undefined): void {
        if (this._destroyed || this._player === player) {
            return;
        }

        this.detachPlayer_();
        this._player = player;
        if (player !== undefined) {
            player.addEventListener(PLAYER_EVENTS, this._onPlayerChange);
            player.textTracks.addEventListener(TEXT_TRACK_LIST_EVENTS, this._onTextTrackListChange);
        }
        this.updateTrack_();
    }

    destroy(): void {
        if (this._destroyed) {
            return;
        }
        this.detachPlayer_();
        this._player = undefined;
        this._track = undefined;
        this._destroyed = true;
    }

    private readonly _onPlayerChange = (): void => {
        this.updateTrack_();
    };

    private readonly _onTextTrackListChange = (): void => {
        this.updateTrack_();
    };

    private readonly _onChapterTrackChange = (): void => {
        this.updateTrack_();
    };

    private detachPlayer_(): void {
        const player = this._player;
        if (player !== undefined) {
            player.removeEventListener(PLAYER_EVENTS, this._onPlayerChange);
            player.textTracks.removeEventListener(TEXT_TRACK_LIST_EVENTS, this._onTextTrackListChange);
        }
        for (const track of this._observedTracks) {
            track.removeEventListener(CHAPTER_TRACK_EVENTS, this._onChapterTrackChange);
        }
        this._observedTracks = [];
        this._track?.removeEventListener('cuechange', this._onChapterTrackChange);
        this._track = undefined;
    }

    private updateTrack_(): void {
        if (this._destroyed) {
            return;
        }

        const chapterTracks = this._player ? Array.from(this._player.textTracks).filter((track) => track.kind === 'chapters') : [];
        for (const track of this._observedTracks) {
            if (chapterTracks.indexOf(track) < 0) {
                track.removeEventListener(CHAPTER_TRACK_EVENTS, this._onChapterTrackChange);
            }
        }
        for (const track of chapterTracks) {
            if (this._observedTracks.indexOf(track) < 0) {
                track.addEventListener(CHAPTER_TRACK_EVENTS, this._onChapterTrackChange);
            }
        }
        this._observedTracks = chapterTracks;

        const track = this._player ? getChaptersTrack(this._player) : undefined;
        if (this._track !== track) {
            this._track?.removeEventListener('cuechange', this._onChapterTrackChange);
            this._track = track;
            this._track?.addEventListener('cuechange', this._onChapterTrackChange);
        }
        this._onChange();
    }
}

import type { ChromelessPlayer, TextTrack, TextTrackCue, TextTrackReadyState } from 'theoplayer/chromeless';

// These checks use SDK ready-state numbers; TextTrackReadyState has no runtime enum member.
const HAVE_METADATA = 1;
const TEXT_TRACK_READY_STATE_ERROR: TextTrackReadyState = 3;

const PLAYER_EVENTS = ['sourcechange', 'loadedmetadata', 'loadeddata'] as const;
const TEXT_TRACK_LIST_EVENTS = ['addtrack', 'removetrack', 'change'] as const;
const CHAPTER_TRACK_EVENTS = ['addcue', 'removecue', 'readystatechange'] as const;

// Returns the first showing chapters track that has cues and has not failed to load.
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

    constructor(private readonly _onTrackChange: () => void) {}

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
            player.addEventListener(PLAYER_EVENTS, this._onChange);
            player.textTracks.addEventListener(TEXT_TRACK_LIST_EVENTS, this._onChange);
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

    private readonly _onChange = (): void => {
        this.updateTrack_();
    };

    private detachPlayer_(): void {
        const player = this._player;
        if (player !== undefined) {
            player.removeEventListener(PLAYER_EVENTS, this._onChange);
            player.textTracks.removeEventListener(TEXT_TRACK_LIST_EVENTS, this._onChange);
        }
        for (const track of this._observedTracks) {
            track.removeEventListener(CHAPTER_TRACK_EVENTS, this._onChange);
        }
        this._observedTracks = [];
        this._track?.removeEventListener('cuechange', this._onChange);
        this._track = undefined;
    }

    private updateTrack_(): void {
        if (this._destroyed) {
            return;
        }

        // A non-selected chapter track can become eligible after a mode, cue, or ready-state change.
        const chapterTracks = this._player ? Array.from(this._player.textTracks).filter((track) => track.kind === 'chapters') : [];
        for (const track of this._observedTracks) {
            if (chapterTracks.indexOf(track) < 0) {
                track.removeEventListener(CHAPTER_TRACK_EVENTS, this._onChange);
            }
        }
        for (const track of chapterTracks) {
            if (this._observedTracks.indexOf(track) < 0) {
                track.addEventListener(CHAPTER_TRACK_EVENTS, this._onChange);
            }
        }
        this._observedTracks = chapterTracks;

        const track = this._player ? getChaptersTrack(this._player) : undefined;
        if (this._track !== track) {
            this._track?.removeEventListener('cuechange', this._onChange);
            this._track = track;
            this._track?.addEventListener('cuechange', this._onChange);
        }
        this._onTrackChange();
    }
}

import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { join } from 'lit/directives/join.js';
import closeIcon from '../icons/close.svg';
import debugDisplayCss from './DebugDisplay.css';
import type { AudioQuality, ChromelessPlayer, CurrentSourceChangeEvent, MediaTrack, TextTrack, VideoQuality } from 'theoplayer/chromeless';
import type { RollingChart } from './RollingChart';
import { Attribute, stateReceiver, version } from '../index';
import { bandwidthFormatterForLocale } from '../i18n/BandwidthFormatter';
import { isSubtitleTrack } from '../util/TrackUtils';
import type { StreamType } from '../util/StreamType';

const formatBandwidth = bandwidthFormatterForLocale('en-US');

interface PercentRange {
    left: number;
    width: number;
}

interface BufferTimeline {
    seekable: PercentRange[];
    buffered: PercentRange[];
    playhead: number;
}

/**
 * Format a local wall-clock timestamp with milliseconds.
 */
function formatWallClockTime(date: Date): string {
    const pad = (value: number, length = 2): string =>
        (String(value) as string & { padStart(targetLength: number, padString?: string): string }).padStart(length, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

/**
 * Read the MIME type of the source currently selected by the player.
 */
function getCurrentSourceType(player: ChromelessPlayer): string {
    const sources = player.source?.sources;
    if (sources === undefined) {
        return '';
    }
    const list = Array.isArray(sources) ? sources : [sources];
    for (const source of list) {
        if (typeof source !== 'string' && 'src' in source && source.src === player.src && 'type' in source) {
            return typeof source.type === 'string' ? source.type : '';
        }
    }
    return '';
}

/**
 * Shorten a long URL without losing its beginning or end.
 */
function shortenURL(url: string, maxLength = 64): string {
    if (url.length <= maxLength) {
        return url;
    }
    const sideLength = Math.floor((maxLength - 1) / 2);
    return `${url.slice(0, sideLength)}…${url.slice(-sideLength)}`;
}

/**
 * Return the playback state for display and snapshots.
 */
function getPlaybackState(player: ChromelessPlayer): string {
    if (player.ended) return 'ended';
    if (player.seeking) return 'seeking';
    return player.paused ? 'paused' : 'playing';
}

/**
 * Convert a time range into its percentage position on the timeline.
 */
function toPercentRange(start: number, end: number, rangeStart: number, rangeEnd: number): PercentRange {
    const duration = rangeEnd - rangeStart;
    const left = Math.max(0, Math.min(100, ((start - rangeStart) / duration) * 100));
    const right = Math.max(0, Math.min(100, ((end - rangeStart) / duration) * 100));
    return { left, width: Math.max(0, right - left) };
}

/**
 * Read all ranges from a TimeRanges instance.
 */
function readTimeRanges(ranges: TimeRanges): Array<{ start: number; end: number }> {
    const result: Array<{ start: number; end: number }> = [];
    for (let index = 0; index < ranges.length; index++) {
        result.push({ start: ranges.start(index), end: ranges.end(index) });
    }
    return result;
}

/**
 * Format an active video quality, omitting unavailable resolution and rate data.
 */
function formatVideoQuality(quality: VideoQuality): string {
    const hasResolution = quality.width > 0 && quality.height > 0;
    const resolution = hasResolution ? `${quality.width}×${quality.height}${quality.frameRate > 0 ? `@${quality.frameRate.toFixed(0)}fps` : ''}` : '';
    const bandwidth = quality.bandwidth > 0 ? formatBandwidth(quality.bandwidth) : '';
    return [resolution, bandwidth].filter(Boolean).join(' · ');
}

/**
 * Format an active audio quality when its bandwidth is available.
 */
function formatAudioQuality(quality: AudioQuality): string {
    return quality.bandwidth > 0 ? formatBandwidth(quality.bandwidth) : '';
}

@customElement('theoplayer-debug-display')
@stateReceiver(['player', 'streamType'])
export class DebugDisplay extends LitElement {
    static override styles = [debugDisplayCss];

    private _player: ChromelessPlayer | undefined;
    private _hidden: boolean = false;
    private _sampleTimer: number = 0;
    private _copyTimeout: number = 0;
    private _lastDroppedFrames: number | undefined;
    private _downloadSpeedRef: Ref<RollingChart> = createRef();
    private _bufferHealthRef: Ref<RollingChart> = createRef();
    private _latencyRef: Ref<RollingChart> = createRef();
    private _droppedFramesRef: Ref<RollingChart> = createRef();

    @state()
    private accessor _currentSrc: string = '';

    @state()
    private accessor _currentSourceType: string = '';

    @state()
    private accessor _streamType: StreamType | undefined = undefined;

    @state()
    private accessor _currentBandwidthEstimate: number | undefined = undefined;

    @state()
    private accessor _currentBufferHealth: number | undefined = undefined;

    @state()
    private accessor _currentLatency: number | undefined = undefined;

    @state()
    private accessor _droppedFrames: number | undefined = undefined;

    @state()
    private accessor _totalFrames: number | undefined = undefined;

    @state()
    private accessor _corruptedFrames: number | undefined = undefined;

    @state()
    private accessor _sampleTime: string = '';

    @state()
    private accessor _copyLabel: string = 'Copy';

    @state()
    private accessor _activeVideoQuality: VideoQuality | undefined = undefined;

    @state()
    private accessor _activeAudioQuality: AudioQuality | undefined = undefined;

    @state()
    private accessor _activeSubtitleTrack: TextTrack | undefined = undefined;

    private _activeVideoTrack: MediaTrack | undefined = undefined;
    private _activeAudioTrack: MediaTrack | undefined = undefined;
    private _activeTextTrack: TextTrack | undefined = undefined;

    /**
     * Start and stop sampling with the element's visibility lifecycle.
     */
    override connectedCallback(): void {
        super.connectedCallback();
        document.addEventListener('visibilitychange', this._onVisibilityChange);
        this.startOrStopSampling_();
    }

    /**
     * Stop sampling and remove document listeners.
     */
    override disconnectedCallback(): void {
        document.removeEventListener('visibilitychange', this._onVisibilityChange);
        window.clearTimeout(this._copyTimeout);
        super.disconnectedCallback();
        this.startOrStopSampling_();
    }

    get hidden(): boolean {
        return this._hidden;
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.HIDDEN })
    set hidden(hidden: boolean) {
        this._hidden = hidden;
        this.startOrStopSampling_();
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        this.removePlayerListeners_();
        this._player = player;
        this._currentSrc = player?.src ?? '';
        this._currentSourceType = player ? getCurrentSourceType(player) : '';
        this._lastDroppedFrames = undefined;
        if (!player) {
            this._liveState = false;
            this._currentBandwidthEstimate = undefined;
            this._currentBufferHealth = undefined;
            this._currentLatency = undefined;
            this._droppedFrames = undefined;
            this._totalFrames = undefined;
            this._corruptedFrames = undefined;
            this._sampleTime = '';
        }
        if (player) {
            this.addPlayerListeners_(player);
            this._onVideoTrackChange();
            this._onAudioTrackChange();
            this._onTextTrackChange();
        }
        this.requestUpdate();
    }

    get streamType(): StreamType | undefined {
        return this._streamType;
    }

    @property({ reflect: false, attribute: false })
    set streamType(streamType: StreamType | undefined) {
        this._streamType = streamType;
    }

    @state()
    private accessor _liveState: boolean = false;

    private readonly _onVisibilityChange = (): void => {
        this.startOrStopSampling_();
    };

    private readonly _onCurrentSourceChange = (event: CurrentSourceChangeEvent): void => {
        this._currentSrc = event.currentSource?.src ?? this._player?.src ?? '';
        this._currentSourceType = event.currentSource?.type ?? '';
        this._lastDroppedFrames = undefined;
        this._droppedFramesRef.value?.clearSamples();
    };

    private readonly _onDurationChange = (): void => {
        this._liveState = this._player?.duration === Infinity;
    };

    private readonly _updateVideoQuality = (): void => {
        const quality = this._activeVideoTrack?.activeQuality as VideoQuality | undefined;
        if (this._activeVideoQuality !== quality) {
            this._activeVideoQuality?.removeEventListener('update', this._update);
            this._activeVideoQuality = quality;
            this._activeVideoQuality?.addEventListener('update', this._update);
        }
        this._update();
    };

    private readonly _updateAudioQuality = (): void => {
        const quality = this._activeAudioTrack?.activeQuality as AudioQuality | undefined;
        if (this._activeAudioQuality !== quality) {
            this._activeAudioQuality?.removeEventListener('update', this._update);
            this._activeAudioQuality = quality;
            this._activeAudioQuality?.addEventListener('update', this._update);
        }
        this._update();
    };

    private readonly _onVideoTrackChange = (): void => {
        const track = this._player?.videoTracks.find((candidate) => candidate.enabled);
        if (this._activeVideoTrack !== track) {
            this._activeVideoTrack?.removeEventListener(['activequalitychanged', 'update'], this._updateVideoQuality);
            this._activeVideoTrack = track;
            this._activeVideoTrack?.addEventListener(['activequalitychanged', 'update'], this._updateVideoQuality);
        }
        this._updateVideoQuality();
    };

    private readonly _onAudioTrackChange = (): void => {
        const track = this._player?.audioTracks.find((candidate) => candidate.enabled);
        if (this._activeAudioTrack !== track) {
            this._activeAudioTrack?.removeEventListener(['activequalitychanged', 'update'], this._updateAudioQuality);
            this._activeAudioTrack = track;
            this._activeAudioTrack?.addEventListener(['activequalitychanged', 'update'], this._updateAudioQuality);
        }
        this._updateAudioQuality();
    };

    private readonly _onTextTrackChange = (): void => {
        const track = this._player?.textTracks.find((candidate) => candidate.mode === 'showing' && isSubtitleTrack(candidate));
        if (this._activeTextTrack !== track) {
            this._activeTextTrack?.removeEventListener(['change', 'typechange', 'update'], this._onTextTrackChange);
            this._activeTextTrack = track;
            this._activeTextTrack?.addEventListener(['change', 'typechange', 'update'], this._onTextTrackChange);
        }
        this._activeSubtitleTrack = track;
        this._update();
    };

    /**
     * Bind the player events used by the panel.
     */
    private addPlayerListeners_(player: ChromelessPlayer): void {
        player.addEventListener('currentsourcechange', this._onCurrentSourceChange);
        player.addEventListener('durationchange', this._onDurationChange);
        player.audioTracks.addEventListener(['change', 'removetrack'], this._onAudioTrackChange);
        player.videoTracks.addEventListener(['change', 'removetrack'], this._onVideoTrackChange);
        player.textTracks.addEventListener(['change', 'removetrack'], this._onTextTrackChange);
        this._onDurationChange();
    }

    /**
     * Unbind player and track events before switching players.
     */
    private removePlayerListeners_(): void {
        if (!this._player) {
            return;
        }
        this._player.removeEventListener('currentsourcechange', this._onCurrentSourceChange);
        this._player.removeEventListener('durationchange', this._onDurationChange);
        this._player.audioTracks.removeEventListener(['change', 'removetrack'], this._onAudioTrackChange);
        this._player.videoTracks.removeEventListener(['change', 'removetrack'], this._onVideoTrackChange);
        this._player.textTracks.removeEventListener(['change', 'removetrack'], this._onTextTrackChange);
        this._activeVideoTrack?.removeEventListener(['activequalitychanged', 'update'], this._updateVideoQuality);
        this._activeAudioTrack?.removeEventListener(['activequalitychanged', 'update'], this._updateAudioQuality);
        this._activeTextTrack?.removeEventListener(['change', 'typechange', 'update'], this._onTextTrackChange);
        this._activeVideoQuality?.removeEventListener('update', this._update);
        this._activeAudioQuality?.removeEventListener('update', this._update);
        this._activeVideoTrack = undefined;
        this._activeAudioTrack = undefined;
        this._activeTextTrack = undefined;
        this._activeVideoQuality = undefined;
        this._activeAudioQuality = undefined;
        this._activeSubtitleTrack = undefined;
    }

    /**
     * Start sampling only while the panel is visible.
     */
    private startOrStopSampling_(): void {
        const canSample = this.isConnected && !this.hidden && document.visibilityState !== 'hidden';
        if (!canSample) {
            window.clearInterval(this._sampleTimer);
            this._sampleTimer = 0;
            this.clearSamples_();
            return;
        }
        if (this._sampleTimer === 0) {
            this.sample_();
            this._sampleTimer = window.setInterval(() => this.sample_(), 100);
        }
    }

    /**
     * Sample playback metrics and update the displayed wall-clock time.
     */
    private sample_(): void {
        const player = this._player;
        if (!player) {
            return;
        }
        this._sampleTime = formatWallClockTime(new Date());
        const metrics = player.metrics;
        const droppedFrames = metrics.droppedVideoFrames;
        this._droppedFrames = droppedFrames;
        this._totalFrames = metrics.totalVideoFrames;
        this._corruptedFrames = metrics.corruptedVideoFrames;
        this._currentBandwidthEstimate = metrics.currentBandwidthEstimate;
        this._currentBufferHealth = this.getBufferHealth_(player);
        this._currentLatency = player.latency.currentLatency;
        this.addDroppedFrameSample_(droppedFrames);
        this._downloadSpeedRef.value?.addSample(metrics.currentBandwidthEstimate);
        this._bufferHealthRef.value?.addSample(this._currentBufferHealth);
        if (this._currentLatency !== undefined) {
            this._latencyRef.value?.addSample(this._currentLatency);
        }
    }

    /**
     * Add the difference from the previous dropped-frame count.
     */
    private addDroppedFrameSample_(droppedFrames: number): void {
        if (this._lastDroppedFrames !== undefined) {
            const delta = Math.max(0, droppedFrames - this._lastDroppedFrames);
            this._droppedFramesRef.value?.addSample(delta);
        }
        this._lastDroppedFrames = droppedFrames;
    }

    /**
     * Return buffered seconds ahead of the current playback position.
     */
    private getBufferHealth_(player: ChromelessPlayer): number {
        const buffered = player.buffered;
        for (let index = buffered.length - 1; index >= 0; index--) {
            if (buffered.start(index) <= player.currentTime && player.currentTime <= buffered.end(index)) {
                return buffered.end(index) - player.currentTime;
            }
        }
        return 0;
    }

    /**
     * Clear chart history when sampling pauses.
     */
    private clearSamples_(): void {
        this._downloadSpeedRef.value?.clearSamples();
        this._bufferHealthRef.value?.clearSamples();
        this._latencyRef.value?.clearSamples();
        this._droppedFramesRef.value?.clearSamples();
        this._lastDroppedFrames = undefined;
    }

    /**
     * Return true for both live and DVR presentations.
     */
    private isLive_(): boolean {
        return this._streamType ? this._streamType !== 'vod' : this._liveState;
    }

    /**
     * Return the panel's buffer timeline as percentages.
     */
    private getBufferTimeline_(): BufferTimeline | undefined {
        const player = this._player;
        if (!player) {
            return undefined;
        }
        const seekable = readTimeRanges(player.seekable);
        if (seekable.length === 0) {
            return undefined;
        }
        const start = Math.min(...seekable.map((range) => range.start));
        const end = Math.max(...seekable.map((range) => range.end));
        if (end <= start) {
            return undefined;
        }
        return {
            seekable: seekable.map((range) => toPercentRange(range.start, range.end, start, end)),
            buffered: readTimeRanges(player.buffered).map((range) => toPercentRange(range.start, range.end, start, end)),
            playhead: Math.max(0, Math.min(100, ((player.currentTime - start) / (end - start)) * 100))
        };
    }

    /**
     * Format the viewport and active content resolution.
     */
    private getViewportText_(): string | undefined {
        const player = this._player;
        const quality = this._activeVideoQuality;
        if (!player || !quality || quality.width <= 0 || quality.height <= 0) {
            return undefined;
        }
        const { width, height } = player.element.getBoundingClientRect();
        if (width <= 0 || height <= 0) {
            return undefined;
        }
        const ratio = window.devicePixelRatio || 1;
        return `${Math.round(width)}×${Math.round(height)} @${ratio}x / ${quality.width}×${quality.height}`;
    }

    /**
     * Return active video and audio quality details.
     */
    private getQualityContent_(): unknown {
        const video = this._activeVideoQuality ? formatVideoQuality(this._activeVideoQuality) : '';
        const audio = this._activeAudioQuality ? formatAudioQuality(this._activeAudioQuality) : '';
        const values = [video && html`<span>Video ${video}</span>`, audio && html`<span>Audio ${audio}</span>`].filter(Boolean);
        return values.length > 0 ? join(values, html`<span class="separator"> / </span>`) : undefined;
    }

    /**
     * Return available active codecs.
     */
    private getCodecs_(): string[] {
        return [this._activeVideoQuality?.codecs, this._activeAudioQuality?.codecs, this._activeSubtitleTrack?.type].filter(
            (codec): codec is string => Boolean(codec)
        );
    }

    /**
     * Create a JSON-safe snapshot of the displayed player values.
     */
    private createSnapshot_(): Record<string, unknown> {
        const player = this._player;
        return {
            player: {
                version: player?.version,
                uiVersion: version,
                state: player ? getPlaybackState(player) : undefined,
                readyState: player?.readyState,
                playbackRate: player?.playbackRate
            },
            source: {
                url: this._currentSrc || undefined,
                streamType: this._streamType,
                mimeType: this._currentSourceType || undefined
            },
            viewport: this.getViewportText_(),
            quality: {
                video: this._activeVideoQuality
                    ? {
                          width: this._activeVideoQuality.width,
                          height: this._activeVideoQuality.height,
                          frameRate: this._activeVideoQuality.frameRate,
                          bandwidth: this._activeVideoQuality.bandwidth
                      }
                    : undefined,
                audioBandwidth: this._activeAudioQuality?.bandwidth
            },
            codecs: this.getCodecs_(),
            frames: {
                dropped: this._droppedFrames,
                total: this._totalFrames,
                corrupted: this._corruptedFrames
            },
            downloadSpeed: this._currentBandwidthEstimate,
            bufferHealth: this._currentBufferHealth,
            latency: this._currentLatency,
            bufferTimeline: this.getBufferTimeline_(),
            time: this._sampleTime || undefined
        };
    }

    /**
     * Copy a JSON snapshot and briefly update the button label.
     */
    private readonly _copySnapshot = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(this.createSnapshot_(), null, 2));
            this._copyLabel = 'Copied';
            window.clearTimeout(this._copyTimeout);
            this._copyTimeout = window.setTimeout(() => {
                this._copyLabel = 'Copy';
            }, 1500);
        } catch {
            this._copyLabel = 'Copy';
        }
    };

    /**
     * Hide the panel when its close button is pressed.
     */
    private readonly _closePanel = (): void => {
        this.hidden = true;
    };

    /**
     * Refresh template values after track changes.
     */
    private readonly _update = (): void => {
        this.requestUpdate();
    };

    /**
     * Render a label/value pair only when its value is available.
     */
    private renderRow_(label: string, value: unknown): unknown {
        if (value === undefined || value === null || value === '') {
            return nothing;
        }
        return html`<div class="label">${label}</div>
            <div class="value">${value}</div>`;
    }

    /**
     * Render a chart row with its value aligned in a fixed-width cell.
     */
    private renderMetricRow_(
        label: string,
        chartRef: Ref<RollingChart>,
        value: string | undefined,
        chartOptions: { min: number; max: number; color: string; bandMin?: number; bandMax?: number }
    ): unknown {
        if (value === undefined) {
            return nothing;
        }
        return html`
            <div class="label">${label}</div>
            <div class="value value-chart">
                <theoplayer-rolling-chart
                    ${ref(chartRef)}
                    width="120"
                    height="20"
                    max-samples="200"
                    min-resolution=${chartOptions.min}
                    max-resolution=${chartOptions.max}
                    sample-color=${chartOptions.color}
                    band-min=${chartOptions.bandMin ?? nothing}
                    band-max=${chartOptions.bandMax ?? nothing}
                ></theoplayer-rolling-chart>
                <span class="metric-value">${value}</span>
            </div>
        `;
    }

    /**
     * Render the title and panel controls.
     */
    private renderHeader_(): unknown {
        return html`
            <header class="header">
                <h2>Debug info</h2>
                <button class="copy-button" type="button" @click=${this._copySnapshot}>${this._copyLabel}</button>
                <button class="close-button" type="button" aria-label="Close debug info" @click=${this._closePanel}>${unsafeSVG(closeIcon)}</button>
            </header>
        `;
    }

    /**
     * Render player version and playback state.
     */
    private renderPlayerRows_(): unknown {
        const player = this._player;
        const playerInfo = player?.version ? `THEOplayer ${player.version} / UI ${version}` : `UI ${version}`;
        const playbackState = player ? `${getPlaybackState(player)} · readyState ${player.readyState}` : undefined;
        const playbackRate = player && player.playbackRate !== 1 ? `${player.playbackRate}×` : undefined;
        return html`
            ${this.renderRow_('Player', playerInfo)} ${this.renderRow_('State', playbackState)} ${this.renderRow_('Playback rate', playbackRate)}
        `;
    }

    /**
     * Render source URL and type details.
     */
    private renderSourceRows_(): unknown {
        return html`
            ${this.renderRow_('Source', this._currentSrc ? html`<span title=${this._currentSrc}>${shortenURL(this._currentSrc)}</span>` : undefined)}
            ${this.renderRow_('Stream type', this._streamType)} ${this.renderRow_('MIME type', this._currentSourceType)}
        `;
    }

    /**
     * Render viewport size, active quality, and codecs.
     */
    private renderQualityRows_(): unknown {
        const codecs = this.getCodecs_();
        return html`
            ${this.renderRow_('Viewport', this.getViewportText_())} ${this.renderRow_('Quality', this.getQualityContent_())}
            ${this.renderRow_('Codecs', codecs.length > 0 ? join(codecs, html`<span class="separator"> / </span>`) : undefined)}
        `;
    }

    /**
     * Render total, dropped, and corrupted frame counts.
     */
    private renderFramesRow_(): unknown {
        const hasFrameCount = this._droppedFrames !== undefined && this._totalFrames !== undefined;
        if (!hasFrameCount) {
            return nothing;
        }
        return html`
            <div class="label">Frames</div>
            <div class="value value-chart">
                <span>
                    ${this._droppedFrames} dropped / ${this._totalFrames} total
                    ${this._corruptedFrames && this._corruptedFrames > 0 ? html` · ${this._corruptedFrames} corrupted` : nothing}
                </span>
                <theoplayer-rolling-chart
                    ${ref(this._droppedFramesRef)}
                    width="80"
                    height="20"
                    max-samples="200"
                    min-resolution="1"
                    max-resolution="10"
                    sample-color="#ff7474"
                ></theoplayer-rolling-chart>
            </div>
        `;
    }

    /**
     * Render download, buffer-health, and live-latency charts.
     */
    private renderMetricRows_(): unknown {
        const player = this._player;
        const videoBandwidth =
            this._currentBandwidthEstimate && this._currentBandwidthEstimate > 0 ? formatBandwidth(this._currentBandwidthEstimate) : undefined;
        const bufferHealth = this._currentBufferHealth !== undefined ? `${this._currentBufferHealth.toFixed(3)}s` : undefined;
        const latency = this._currentLatency !== undefined ? `${this._currentLatency.toFixed(3)}s` : undefined;
        const latencyConfiguration = player?.latency.currentConfiguration;
        return html`
            ${this.renderMetricRow_('Download speed', this._downloadSpeedRef, videoBandwidth, {
                min: 10e6,
                max: 1e9,
                color: '#52a5ff'
            })}
            ${this.renderMetricRow_('Buffer health', this._bufferHealthRef, bufferHealth, {
                min: 5,
                max: 60,
                color: '#6fda91'
            })}
            ${this.isLive_()
                ? this.renderMetricRow_('Latency', this._latencyRef, latency, {
                      min: 1,
                      max: Math.max(10, latencyConfiguration?.maximumOffset ?? 10),
                      color: '#ffac52',
                      bandMin: latencyConfiguration?.minimumOffset,
                      bandMax: latencyConfiguration?.maximumOffset
                  })
                : nothing}
        `;
    }

    /**
     * Render buffered ranges and the playhead on the seekable timeline.
     */
    private renderTimelineRow_(): unknown {
        const timeline = this.getBufferTimeline_();
        return timeline
            ? html`
                  <div class="label">Buffer</div>
                  <div class="value">
                      <div class="timeline" role="img" aria-label="Seekable and buffered timeline">
                          ${timeline.seekable.map(
                              ({ left, width }) => html`<div class="timeline-seekable" style="left:${left}%;width:${width}%"></div>`
                          )}
                          ${timeline.buffered.map(
                              ({ left, width }) => html`<div class="timeline-buffered" style="left:${left}%;width:${width}%"></div>`
                          )}
                          <div class="timeline-playhead" style="left:${timeline.playhead}%"></div>
                      </div>
                  </div>
              `
            : nothing;
    }

    protected override render(): unknown {
        return html`
            ${this.renderHeader_()} ${this.renderPlayerRows_()} ${this.renderSourceRows_()} ${this.renderQualityRows_()} ${this.renderFramesRow_()}
            ${this.renderMetricRows_()} ${this.renderTimelineRow_()} ${this.renderRow_('Time', this._sampleTime)}
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-debug-display': DebugDisplay;
    }
}

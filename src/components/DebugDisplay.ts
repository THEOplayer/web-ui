import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { join } from 'lit/directives/join.js';
import debugDisplayCss from './DebugDisplay.css';
import { stateReceiver } from './StateReceiverMixin';
import type {
    AudioQuality,
    ChromelessPlayer,
    CurrentSourceChangeEvent,
    MediaTrack,
    TextTrack,
    TrackChangeEvent,
    VideoQuality
} from 'theoplayer/chromeless';
import type { RollingChart } from './RollingChart';
import { formatBandwidth, isSubtitleTrack } from '../util/TrackUtils';

@customElement('theoplayer-debug-display')
@stateReceiver(['player'])
export class DebugDisplay extends LitElement {
    static override styles = [debugDisplayCss];

    private _player: ChromelessPlayer | undefined;

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._player.removeEventListener('currentsourcechange', this._onCurrentSourceChange);
            this._player.audioTracks.removeEventListener('change', this._onAudioTrackChange);
            this._player.videoTracks.removeEventListener('change', this._onVideoTrackChange);
            this._player.textTracks.removeEventListener('change', this._onTextTrackChange);
        }
        this._player = player;
        if (this._player !== undefined) {
            this._player.addEventListener('currentsourcechange', this._onCurrentSourceChange);
            this._player.audioTracks.addEventListener('change', this._onAudioTrackChange);
            this._player.videoTracks.addEventListener('change', this._onVideoTrackChange);
            this._player.textTracks.addEventListener('change', this._onTextTrackChange);
        }
    }

    @state()
    accessor currentSrc: string = '';

    private _activeVideoTrack: MediaTrack | undefined = undefined;
    private _activeVideoQuality: VideoQuality | undefined = undefined;
    private _activeAudioTrack: MediaTrack | undefined = undefined;
    private _activeAudioQuality: AudioQuality | undefined = undefined;
    private _activeSubtitleTrack: TextTrack | undefined = undefined;

    private readonly _onCurrentSourceChange = (event: CurrentSourceChangeEvent): void => {
        this.currentSrc = event.currentSource?.src ?? '';
    };

    private readonly _update = () => {
        this.requestUpdate();
    };

    private readonly _updateVideoQuality = (): void => {
        const activeVideoQuality = this._activeVideoTrack?.activeQuality as VideoQuality | undefined;
        if (this._activeVideoQuality !== activeVideoQuality) {
            this._activeVideoQuality?.removeEventListener('update', this._update);
            this._activeVideoQuality = activeVideoQuality;
            this._activeVideoQuality?.addEventListener('update', this._update);
        }
        this._update();
    };

    private readonly _updateAudioQuality = (): void => {
        const activeAudioQuality = this._activeAudioTrack?.activeQuality as AudioQuality | undefined;
        if (this._activeAudioQuality !== activeAudioQuality) {
            this._activeAudioQuality?.removeEventListener('update', this._update);
            this._activeAudioQuality = activeAudioQuality;
            this._activeAudioQuality?.addEventListener('update', this._update);
        }
        this._update();
    };

    private readonly _onVideoTrackChange = (event: TrackChangeEvent): void => {
        const activeVideoTrack = event.track as MediaTrack;
        if (this._activeVideoTrack !== activeVideoTrack) {
            this._activeVideoTrack?.removeEventListener(['activequalitychanged', 'update'], this._updateVideoQuality);
            this._activeVideoTrack = activeVideoTrack;
            this._activeVideoTrack.addEventListener(['activequalitychanged', 'update'], this._updateVideoQuality);
        }
        this._updateVideoQuality();
    };

    private readonly _onAudioTrackChange = (event: TrackChangeEvent): void => {
        const activeAudioTrack = event.track as MediaTrack;
        if (this._activeAudioTrack !== activeAudioTrack) {
            this._activeAudioTrack?.removeEventListener(['activequalitychanged', 'update'], this._updateAudioQuality);
            this._activeAudioTrack = activeAudioTrack;
            this._activeAudioTrack.addEventListener(['activequalitychanged', 'update'], this._updateAudioQuality);
        }
        this._updateAudioQuality();
    };

    private readonly _onTextTrackChange = (): void => {
        const activeSubtitleTrack = this._player?.textTracks.find((track) => isSubtitleTrack(track) && track.mode === 'showing');
        if (this._activeSubtitleTrack !== activeSubtitleTrack) {
            this._activeSubtitleTrack?.removeEventListener(['change', 'typechange', 'update'], this._onTextTrackChange);
            this._activeSubtitleTrack = activeSubtitleTrack;
            this._activeSubtitleTrack?.addEventListener(['change', 'typechange', 'update'], this._onTextTrackChange);
        }
        this._update();
    };

    private _graphTimer: number = 0;
    private _downloadSpeedRef: Ref<RollingChart> = createRef();
    private _bufferHealthRef: Ref<RollingChart> = createRef();
    private _latencyRef: Ref<RollingChart> = createRef();

    override connectedCallback() {
        super.connectedCallback();
        this._graphTimer = setInterval(this._addSample.bind(this), 100);
    }

    override disconnectedCallback() {
        super.disconnectedCallback();
        clearInterval(this._graphTimer);
    }

    @state()
    private accessor currentBandwidthEstimate: number = 0;

    @state()
    private accessor currentBufferHealth: number = 0;

    @state()
    private accessor currentLatency: number = 0;

    private _addSample(): void {
        if (!this._player) return;
        const currentTime = this._player.currentTime;
        const buffered = this._player.buffered;
        const { currentBandwidthEstimate } = this._player.metrics;
        this.currentBandwidthEstimate = currentBandwidthEstimate;
        if (this._downloadSpeedRef.value) {
            const sample = Math.floor(Math.min(Math.log10(currentBandwidthEstimate) / 8, 1) * 20);
            this._downloadSpeedRef.value.addSample(sample);
        }
        let currentBufferHealth = 0;
        if (buffered.length > 0) {
            let activeBufferIndex = -1;
            for (let i = buffered.length - 1; i >= 0; i--) {
                if (buffered.start(i) <= currentTime && currentTime <= buffered.end(i)) {
                    activeBufferIndex = i;
                    break;
                }
            }
            if (activeBufferIndex >= 0) {
                currentBufferHealth = buffered.end(activeBufferIndex) - currentTime;
            }
        }
        this.currentBufferHealth = currentBufferHealth;
        if (this._bufferHealthRef.value) {
            const sample = Math.floor(Math.min(currentBufferHealth / 30, 1) * 20);
            this._bufferHealthRef.value.addSample(sample);
        }
        const { currentLatency } = this._player.latency;
        this.currentLatency = currentLatency ?? 0;
        if (this._latencyRef.value) {
            const sample = Math.floor(Math.min((currentLatency ?? 0) / 30, 1) * 20);
            this._latencyRef.value.addSample(sample);
        }
    }

    protected override render(): unknown {
        return html`
            <div class="label">Selected source</div>
            <div class="value"><a href=${this.currentSrc}>${this.currentSrc}</a></div>
            <div class="label">Active quality</div>
            <div class="value">
                ${this._activeVideoQuality
                    ? html`<span title="video quality"
                          >${this._activeVideoQuality.width}&times;${this._activeVideoQuality.height}${this._activeVideoQuality.frameRate
                              ? html`@${this._activeVideoQuality.frameRate.toFixed(0)}fps`
                              : ''}
                          (${formatBandwidth(this._activeVideoQuality.bandwidth)})</span
                      >`
                    : this._activeAudioQuality
                      ? html`<span title="audio quality">${formatBandwidth(this._activeAudioQuality.bandwidth)}</span>`
                      : ''}
            </div>
            <div class="label">Codecs</div>
            <div class="value">
                ${join(
                    [
                        this._activeVideoQuality?.codecs && html`<span title="video codec">${this._activeVideoQuality?.codecs}</span>`,
                        this._activeAudioQuality?.codecs && html`<span title="audio codec">${this._activeAudioQuality?.codecs}</span>`,
                        this._activeSubtitleTrack?.type && html`<span title="subtitle codec">${this._activeSubtitleTrack?.type}</span>`
                    ].filter(Boolean),
                    html` / `
                )}
            </div>
            <div class="label">Download speed</div>
            <div class="value">
                <theoplayer-rolling-chart
                    ${ref(this._downloadSpeedRef)}
                    max-samples="200"
                    height="20"
                    sample-color="#0080ff"
                ></theoplayer-rolling-chart>
                <span>${formatBandwidth(this.currentBandwidthEstimate)}</span>
            </div>
            <div class="label">Buffer health</div>
            <div class="value">
                <theoplayer-rolling-chart
                    ${ref(this._bufferHealthRef)}
                    max-samples="200"
                    height="20"
                    sample-color="#00ff00"
                ></theoplayer-rolling-chart>
                <span>${this.currentBufferHealth.toFixed(3)}s</span>
            </div>
            <div class="label">Latency</div>
            <div class="value">
                <theoplayer-rolling-chart ${ref(this._latencyRef)} max-samples="200" height="20" sample-color="#ff8000"></theoplayer-rolling-chart>
                <span>${this.currentLatency.toFixed(3)}s</span>
            </div>
            <div class="label">Date</div>
            <div class="value">${new Date().toISOString()}</div>
        `;
    }
}

import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import debugDisplayCss from './DebugDisplay.css';
import { stateReceiver } from './StateReceiverMixin';
import type { ChromelessPlayer, CurrentSourceChangeEvent } from 'theoplayer/chromeless';
import type { RollingChart } from './RollingChart';
import { formatBandwidth } from '../util/TrackUtils';

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
        }
        this._player = player;
        if (this._player !== undefined) {
            this._player.addEventListener('currentsourcechange', this._onCurrentSourceChange);
        }
    }

    @state()
    accessor currentSrc: string = '';

    private readonly _onCurrentSourceChange = (event: CurrentSourceChangeEvent): void => {
        this.currentSrc = event.currentSource?.src ?? '';
    };

    private _graphTimer: number = 0;
    private _downloadSpeedRef: Ref<RollingChart> = createRef();

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

    private _addSample(): void {
        if (!this._player) return;
        if (this._downloadSpeedRef.value) {
            const { currentBandwidthEstimate } = this._player.metrics;
            const sample = Math.floor(Math.min(Math.log10(currentBandwidthEstimate) / 8, 1) * 20);
            this._downloadSpeedRef.value.addSample(sample);
            this.currentBandwidthEstimate = currentBandwidthEstimate;
        }
    }

    protected override render(): unknown {
        return html`
            <div class="label">Selected source</div>
            <div class="value"><a href=${this.currentSrc}>${this.currentSrc}</a></div>
            <div class="label">Download speed</div>
            <div class="value">
                <theoplayer-rolling-chart
                    ${ref(this._downloadSpeedRef)}
                    max-samples="100"
                    height="20"
                    sample-color="#ff0000"
                ></theoplayer-rolling-chart>
                <span>${formatBandwidth(this.currentBandwidthEstimate)}</span>
            </div>
        `;
    }
}

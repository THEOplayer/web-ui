import { html, LitElement, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';

@customElement('theoplayer-rolling-chart')
export class RollingChart extends LitElement {
    private _canvasRef: Ref<HTMLCanvasElement> = createRef();
    private _context: CanvasRenderingContext2D | undefined = undefined;
    private readonly _samples: number[] = [];
    private _sampleHead: number = 0;

    @property({ reflect: true, type: Number, attribute: 'max-samples' })
    accessor maxSamples: number = 10;

    @property({ reflect: true, type: Number, attribute: 'min-resolution' })
    accessor minResolution: number = 10;

    @property({ reflect: true, type: Number, attribute: 'max-resolution' })
    accessor maxResolution: number = 100;

    @property({ reflect: true, type: Number, attribute: 'height' })
    accessor height: number = 100;

    @property({ reflect: true, type: String, attribute: 'sample-color' })
    accessor sampleColor: string = '#000000';

    @property({ reflect: true, type: String, attribute: 'head-color' })
    accessor headColor: string = '#ffffff';

    addSample(sample: number) {
        this._samples[this._sampleHead] = sample;
        this._sampleHead = (this._sampleHead + 1) % this.maxSamples;
        this.requestUpdate();
    }

    clearSamples(): void {
        this._samples.length = 0;
        this._sampleHead = 0;
        this.requestUpdate();
    }

    protected override firstUpdated(changedProperties: PropertyValues) {
        super.firstUpdated(changedProperties);
        this.renderSamples();
    }

    private renderSamples() {
        const context = (this._context ??= this._canvasRef.value?.getContext('2d') ?? undefined);
        if (!context) return;
        context.clearRect(0, 0, this.maxSamples, this.height);
        if (this._samples.length === 0) return;
        const maxSample = Math.max(...this._samples);
        const resolution = Math.min(Math.max(maxSample, this.minResolution), this.maxResolution);
        const scale = this.height / resolution;
        // Draw samples
        context.strokeStyle = this.sampleColor;
        for (let x = 0; x < this._samples.length; x++) {
            const sample = this._samples[x] * scale;
            if (sample > 0) {
                context.beginPath();
                context.moveTo(x, Math.max(0, this.height - sample));
                context.lineTo(x, this.height - 1);
                context.stroke();
            }
        }
        // Draw head
        context.strokeStyle = this.headColor;
        context.beginPath();
        context.moveTo(this._sampleHead, 0);
        context.lineTo(this._sampleHead, this.height - 1);
        context.stroke();
    }

    protected override render(): unknown {
        this.renderSamples();
        return html`<canvas ${ref(this._canvasRef)} width=${this.maxSamples} height=${this.height}></canvas>`;
    }
}

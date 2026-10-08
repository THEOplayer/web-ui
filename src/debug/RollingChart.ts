import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import rollingChartCss from './RollingChart.css';

@customElement('theoplayer-rolling-chart')
export class RollingChart extends LitElement {
    static override styles = [rollingChartCss];

    private _canvasRef: Ref<HTMLCanvasElement> = createRef();
    private readonly _samples: number[] = [];
    private _sampleHead: number = 0;

    @property({ reflect: true, type: Number, attribute: 'max-samples' })
    accessor maxSamples: number = 120;

    @property({ reflect: true, type: Number, attribute: 'min-resolution' })
    accessor minResolution: number = 10;

    @property({ reflect: true, type: Number, attribute: 'max-resolution' })
    accessor maxResolution: number = 100;

    @property({ reflect: true, type: Number, attribute: 'width' })
    accessor width: number = 120;

    @property({ reflect: true, type: Number, attribute: 'height' })
    accessor height: number = 20;

    @property({ reflect: true, type: Number, attribute: 'band-min' })
    accessor bandMin: number | undefined = undefined;

    @property({ reflect: true, type: Number, attribute: 'band-max' })
    accessor bandMax: number | undefined = undefined;

    @property({ reflect: true, type: String, attribute: 'sample-color' })
    accessor sampleColor: string = '#000000';

    @property({ reflect: true, type: String, attribute: 'head-color' })
    accessor headColor: string = '#ffffff';

    @property({ reflect: true, type: String, attribute: 'band-color' })
    accessor bandColor: string = 'rgba(255, 255, 255, 0.16)';

    /**
     * Append a sample while retaining only the configured history.
     */
    addSample(sample: number): void {
        if (!Number.isFinite(sample)) {
            return;
        }
        const maxSamples = Math.max(1, Math.floor(this.maxSamples));
        if (this._samples.length < maxSamples) {
            this._samples.push(sample);
            this._sampleHead = this._samples.length % maxSamples;
        } else {
            this._samples[this._sampleHead] = sample;
            this._sampleHead = (this._sampleHead + 1) % maxSamples;
        }
        this.requestUpdate();
    }

    /**
     * Remove all samples from the chart.
     */
    clearSamples(): void {
        this._samples.length = 0;
        this._sampleHead = 0;
        this.requestUpdate();
    }

    protected override updated(): void {
        this.renderSamples_();
    }

    /**
     * Draw the filled chart and its rolling head marker.
     */
    private renderSamples_(): void {
        const canvas = this._canvasRef.value;
        if (!canvas) {
            return;
        }
        const width = Math.max(1, this.width);
        const height = Math.max(1, this.height);
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        context.clearRect(0, 0, width, height);
        const samples = this.getOrderedSamples_();
        const maxSample = samples.length > 0 ? Math.max(...samples) : 0;
        const top = Math.min(Math.max(maxSample, this.minResolution), this.maxResolution);
        this.drawBand_(context, width, height, top);
        if (samples.length === 0) {
            return;
        }
        const points = samples.map((sample, index) => ({
            x: samples.length === 1 ? width : (index / (samples.length - 1)) * width,
            y: height - 1 - (Math.max(0, Math.min(top, sample)) / top) * (height - 1)
        }));
        this.drawArea_(context, points, width, height);
        this.drawLine_(context, points);
        this.drawHead_(context, points[points.length - 1]);
    }

    /**
     * Draw an optional min/max target band.
     */
    private drawBand_(context: CanvasRenderingContext2D, width: number, height: number, top: number): void {
        if (this.bandMin === undefined || this.bandMax === undefined || top <= 0) {
            return;
        }
        const lower = Math.max(0, Math.min(top, this.bandMin));
        const upper = Math.max(0, Math.min(top, this.bandMax));
        const bandTop = height - 1 - (Math.max(lower, upper) / top) * (height - 1);
        const bottom = height - 1 - (Math.min(lower, upper) / top) * (height - 1);
        context.fillStyle = this.bandColor;
        context.fillRect(0, bandTop, width, bottom - bandTop);
    }

    /**
     * Draw the sample area below the plotted line.
     */
    private drawArea_(context: CanvasRenderingContext2D, points: Array<{ x: number; y: number }>, width: number, height: number): void {
        context.beginPath();
        context.moveTo(points[0].x, height - 1);
        for (const point of points) {
            context.lineTo(point.x, point.y);
        }
        context.lineTo(width, height - 1);
        context.closePath();
        context.globalAlpha = 0.2;
        context.fillStyle = this.sampleColor;
        context.fill();
        context.globalAlpha = 1;
    }

    /**
     * Draw a smooth line through all samples.
     */
    private drawLine_(context: CanvasRenderingContext2D, points: Array<{ x: number; y: number }>): void {
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (let index = 1; index < points.length; index++) {
            context.lineTo(points[index].x, points[index].y);
        }
        context.strokeStyle = this.sampleColor;
        context.lineWidth = 1.5;
        context.lineJoin = 'round';
        context.lineCap = 'round';
        context.stroke();
    }

    /**
     * Mark the newest sample with a subtle dot.
     */
    private drawHead_(context: CanvasRenderingContext2D, point: { x: number; y: number }): void {
        context.beginPath();
        context.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
        context.fillStyle = this.headColor;
        context.fill();
    }

    /**
     * Return the samples from oldest to newest.
     */
    private getOrderedSamples_(): number[] {
        if (this._samples.length < this.maxSamples || this._sampleHead === 0) {
            return [...this._samples];
        }
        return [...this._samples.slice(this._sampleHead), ...this._samples.slice(0, this._sampleHead)];
    }

    protected override render(): unknown {
        return html`<canvas ${ref(this._canvasRef)} style=${styleMap({ width: `${this.width}px`, height: `${this.height}px` })}></canvas>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-rolling-chart': RollingChart;
    }
}

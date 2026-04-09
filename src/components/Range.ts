import * as shadyCss from '@webcomponents/shadycss';
import rangeCss from './Range.css';
import { Attribute } from '../util/Attribute';
import { ColorStops } from '../util/ColorStops';
import { stateReceiver } from './StateReceiverMixin';
import type { DeviceType } from '../util/DeviceType';
import { isArrowKey, KeyCode } from '../util/KeyCode';
import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

/**
 * A slider to select a value from a range.
 *
 * @attribute `disabled` - Whether the range is disabled.
 *   When disabled, the slider value cannot be changed, and the slider thumb is hidden.
 * @attribute `inert` - Whether the range is inert.
 *   When inert, the slider value cannot be changed, but the slider thumb is still visible.
 *
 * @group Components
 */
@stateReceiver(['deviceType'])
export abstract class Range extends LitElement {
    static override styles = [rangeCss];

    protected readonly _rangeRef: Ref<HTMLInputElement> = createRef<HTMLInputElement>();

    private _min: number = 0;
    private _max: number = 100;
    private _value: number = 0;
    private _disabled: boolean = false;
    private _hidden: boolean = false;
    private _inert: boolean = false;

    private _rangeWidth: number = 0;
    private _thumbWidth: number = 10;

    @state()
    private accessor _pointerWidth: number = 0;

    connectedCallback(): void {
        super.connectedCallback();

        this._updateRange();
        this.addEventListener('pointermove', this._updatePointerBar);
    }

    disconnectedCallback(): void {
        this.removeEventListener('pointermove', this._updatePointerBar);
    }

    /**
     * Whether the range is disabled.
     *
     * When disabled, the slider value cannot be changed, and the slider thumb is hidden.
     */
    get disabled(): boolean {
        return this._disabled;
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.DISABLED })
    set disabled(disabled: boolean) {
        if (this._disabled === disabled) return;
        this._disabled = disabled;
        this.setAttribute('aria-disabled', this._disabled ? 'true' : 'false');
    }

    /**
     * Whether the range is hidden.
     */
    get hidden(): boolean {
        return this._hidden;
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.HIDDEN })
    set hidden(hidden: boolean) {
        if (this._hidden === hidden) return;
        this._hidden = hidden;
        this._updateRange();
    }

    /**
     * Whether the range is inert.
     *
     * When inert, the slider value cannot be changed, but the slider thumb is still visible.
     */
    get inert() {
        return this._inert;
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.INERT })
    set inert(inert: boolean) {
        this._inert = inert;
    }

    /**
     * The current value.
     */
    get value(): number {
        return this._value;
    }

    @property({ reflect: false, attribute: false })
    set value(value: number) {
        let newValue = value;
        if (!isNaN(this.min)) {
            newValue = Math.max(this.min, newValue);
        }
        if (!isNaN(this.max)) {
            newValue = Math.min(this.max, newValue);
        }
        if (this._value === newValue) return;
        this._value = newValue;
        this.handleInput();
    }

    /**
     * The minimum allowed value.
     */
    get min(): number {
        return this._min;
    }

    @property({ reflect: true, type: Number, attribute: 'min' })
    set min(min: number) {
        this._min = min;
        this._updateRange();
    }

    /**
     * The maximum allowed value.
     */
    get max(): number {
        return this._max;
    }

    @property({ reflect: true, type: Number, attribute: 'max' })
    set max(max: number) {
        this._max = max;
        this._updateRange();
    }

    /**
     * The granularity at which the value can change.
     *
     * If set to `"any"`, the value can change with arbitrary precision.
     */
    @property({
        reflect: true,
        attribute: 'step',
        converter: {
            fromAttribute: (value): number | 'any' => (value == null || value === 'any' ? 'any' : Number(value))
        }
    })
    accessor step: number | 'any' = 'any';

    @property({ reflect: true, type: String, attribute: Attribute.DEVICE_TYPE })
    accessor deviceType: DeviceType = 'desktop';

    @property({ reflect: true, type: String, attribute: 'aria-live' })
    accessor ariaLive: string | null = null;

    private readonly _onInput = (event: Event) => {
        this.value = (event.target as HTMLInputElement).valueAsNumber;
    };

    protected handleInput(): void {
        this._updateRange();
    }

    protected _updateRange(useCachedWidth?: boolean): void {
        if (this.hidden) {
            return;
        }
        if (!useCachedWidth) {
            this.updateCachedWidths_();
        }
        this.updateBar_();
    }

    /**
     * The value for the `aria-label` attribute of the `<input type="range">` element.
     */
    protected abstract getAriaLabel(): string;

    /**
     * The value for the `aria-valuetext` attribute of the `<input type="range">` element.
     */
    protected abstract getAriaValueText(): string;

    /**
     * Native ranges have a single color for the whole track, which is different
     * from most video players that have a colored "bar" to the left of the handle
     * showing playback progress or volume level. Here we're building that bar
     * by using a background gradient that moves with the range value.
     */
    private updateBar_() {
        const gradientStops = this.getBarColors().toGradientStops();
        shadyCss.styleSubtree(this, {
            '--theoplayer-range-track-progress-internal': `linear-gradient(to right, ${gradientStops})`
        });
    }

    /**
     * Build the color gradient for the range bar.
     * Creating an array so progress-bar can insert the buffered bar.
     */
    protected getBarColors(): ColorStops {
        const { value, min, max } = this;
        const relativeValue = value - min;
        const relativeMax = max - min;
        let rangePercent = (relativeValue / relativeMax) * 100;
        if (isNaN(rangePercent)) {
            rangePercent = 0;
        }

        let thumbPercent = 0;
        // If the range thumb is at min or max don't correct the time range.
        // Ideally the thumb center would go all the way to min and max values
        // but input[type=range] doesn't play like that.
        if (min < value && value < max) {
            const thumbOffset = this._thumbWidth * (0.5 - rangePercent / 100);
            thumbPercent = (thumbOffset / this._rangeWidth) * 100;
        }

        const stops = new ColorStops();
        stops.add('var(--theoplayer-range-bar-color, #fff)', 0, rangePercent + thumbPercent);
        return stops;
    }

    private updateCachedWidths_(): void {
        // Use the last non-zero range width, in case the range is temporarily hidden.
        const rangeWidth = this._rangeRef.value?.offsetWidth ?? 0;
        if (rangeWidth > 0) {
            this._rangeWidth = rangeWidth;
        }
        const thumbWidth = parseInt(getComputedStyle(this).getPropertyValue('--theoplayer-range-thumb-width') || '10px');
        if (thumbWidth > 0) {
            this._thumbWidth = thumbWidth;
        }
    }

    protected getMinimumStepForVisibleChange_(): number {
        // The smallest visible change is 1 pixel.
        // Compute how much the value needs to change for that.
        const { min, max } = this;
        const relativeMax = max - min;
        if (relativeMax <= 0) {
            return NaN;
        }
        return relativeMax / this._rangeWidth;
    }

    private readonly _updatePointerBar = (e: PointerEvent): void => {
        const rangeEl = this._rangeRef.value;
        if (this.disabled || this.inert || !rangeEl) {
            return;
        }
        // Get mouse position percent
        const rangeRect = rangeEl.getBoundingClientRect();
        let mousePercent = (e.clientX - rangeRect.left) / rangeRect.width;
        // Lock between 0 and 1
        mousePercent = Math.max(0, Math.min(1, mousePercent));
        this.updatePointer_(mousePercent, rangeRect);
    };

    protected updatePointer_(mousePercent: number, rangeRect: DOMRectReadOnly): void {
        this._pointerWidth = mousePercent * rangeRect.width;
    }

    private readonly _onKeyDown = (e: KeyboardEvent): void => {
        this.handleKeyDown_(e);
    };

    protected handleKeyDown_(e: KeyboardEvent) {
        if (this.deviceType === 'tv' && isArrowKey(e.keyCode)) {
            // On TV devices, only allow left/right arrow keys to move the slider.
            if (e.keyCode === KeyCode.LEFT || e.keyCode === KeyCode.RIGHT) {
                // Stop propagation, to prevent <theoplayer-ui> from navigating to a different control
                // while we're moving the slider.
                e.stopPropagation();
            } else if (e.keyCode === KeyCode.UP || e.keyCode === KeyCode.DOWN) {
                // Prevent default, to stop the browser from moving the slider.
                e.preventDefault();
            }
        }
    }

    protected override render(): HTMLTemplateResult {
        return html`<div part="container">
            <div part="background"></div>
            <div part="pointer" style=${styleMap({ width: `${this._pointerWidth}px` })}></div>
            <input
                type="range"
                ${ref(this._rangeRef)}
                .min=${this.min}
                .max=${this.max}
                .step=${this.step}
                .value=${this.value}
                .disabled=${this.disabled || this.inert}
                aria-label="${this.getAriaLabel()}"
                aria-valuetext=${this.getAriaValueText()}
                aria-live=${this.ariaLive}
                @input=${this._onInput}
                @change=${
                    /* Internet Explorer does not fire 'input' events for <input> elements... use 'change' instead. */
                    this._onInput
                }
                @keydown=${this._onKeyDown}
            />
            ${this.renderRangeExtras()}
        </div>`;
    }

    protected renderRangeExtras(): HTMLTemplateResult {
        return html``;
    }
}

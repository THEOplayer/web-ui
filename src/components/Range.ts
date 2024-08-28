import * as shadyCss from '@webcomponents/shadycss';
import rangeCss from './Range.css';
import { Attribute } from '../util/Attribute';
import { ColorStops } from '../util/ColorStops';
import { toggleAttribute } from '../util/CommonUtils';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { DeviceType } from '../util/DeviceType';
import { isArrowKey, KeyCode } from '../util/KeyCode';

export interface RangeOptions {
    template: HTMLTemplateElement;
}

export function rangeTemplate(range: string, extraCss: string = ''): string {
    return `<style>${rangeCss}\n${extraCss}</style><div part="container"><div part="background"></div><div part="pointer"></div>${range}</div>`;
}

/**
 * A slider to select a value from a range.
 *
 * @attribute `disabled` - Whether the range is disabled.
 *   When disabled, the slider value cannot be changed, and the slider thumb is hidden.
 *
 * @group Components
 */
export abstract class Range extends StateReceiverMixin(HTMLElement, ['deviceType']) {
    static get observedAttributes() {
        return [Attribute.DISABLED, Attribute.HIDDEN];
    }

    protected readonly _rangeEl: HTMLInputElement;
    protected readonly _pointerEl: HTMLElement;
    private _rangeWidth: number = 0;
    private _thumbWidth: number = 10;

    constructor(options: RangeOptions) {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(options.template.content.cloneNode(true));

        this._rangeEl = shadowRoot.querySelector('input[type="range"]')!;
        this._rangeEl.addEventListener('input', this._onInput);
        // Internet Explorer does not fire 'input' events for <input> elements... use 'change' instead.
        this._rangeEl.addEventListener('change', this._onInput);
        this._rangeEl.addEventListener('keydown', this._onKeyDown);

        this._pointerEl = shadowRoot.querySelector('[part="pointer"]')!;

        this._upgradeProperty('disabled');
        this._upgradeProperty('value');
        this._upgradeProperty('min');
        this._upgradeProperty('max');
        this._upgradeProperty('step');
        this._upgradeProperty('deviceType');
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        this._rangeEl.setAttribute(Attribute.ARIA_LABEL, this.getAriaLabel());
        this.update();

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
    get disabled() {
        return this.hasAttribute(Attribute.DISABLED);
    }

    set disabled(disabled: boolean) {
        toggleAttribute(this, Attribute.DISABLED, disabled);
    }

    /**
     * The current value.
     */
    get value(): number {
        return this._rangeEl.valueAsNumber;
    }

    set value(value: number) {
        this._rangeEl.valueAsNumber = value;
        this.handleInput();
    }

    /**
     * The minimum allowed value.
     */
    get min(): number {
        return Number(this._rangeEl.min);
    }

    set min(min: number) {
        this._rangeEl.min = String(min);
        this.update();
    }

    /**
     * The maximum allowed value.
     */
    get max(): number {
        return Number(this._rangeEl.max);
    }

    set max(max: number) {
        this._rangeEl.max = String(max);
        this.update();
    }

    /**
     * The granularity at which the value can change.
     *
     * If set to `"any"`, the value can change with arbitrary precision.
     */
    get step(): number | 'any' {
        const raw = this._rangeEl.step;
        return raw === 'any' ? raw : Number(raw);
    }

    set step(step: number | 'any') {
        this._rangeEl.step = String(step);
    }

    get deviceType(): DeviceType {
        return (this.getAttribute(Attribute.DEVICE_TYPE) || 'desktop') as DeviceType;
    }

    set deviceType(deviceType: DeviceType) {
        this.setAttribute(Attribute.DEVICE_TYPE, deviceType);
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (newValue === oldValue) {
            return;
        }
        const hasValue = newValue != null;
        if (attrName === Attribute.DISABLED) {
            this.setAttribute('aria-disabled', hasValue ? 'true' : 'false');
            toggleAttribute(this._rangeEl, Attribute.DISABLED, hasValue);
        } else if (attrName === Attribute.HIDDEN) {
            if (!hasValue) {
                this.update();
            }
        }
        if (Range.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }

    private readonly _onInput = () => {
        this.handleInput();
    };

    protected handleInput(): void {
        this.update();
    }

    protected update(useCachedWidth?: boolean): void {
        if (this.hasAttribute(Attribute.HIDDEN)) {
            return;
        }
        this._rangeEl.setAttribute('aria-valuetext', this.getAriaValueText());
        this.updateBar_(useCachedWidth);
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
    private updateBar_(useCachedWidth?: boolean) {
        const gradientStops = this.getBarColors(useCachedWidth).toGradientStops();
        shadyCss.styleSubtree(this, {
            '--theoplayer-range-track-progress-internal': `linear-gradient(to right, ${gradientStops})`
        });
    }

    /**
     * Build the color gradient for the range bar.
     * Creating an array so progress-bar can insert the buffered bar.
     */
    protected getBarColors(useCachedWidth?: boolean): ColorStops {
        const relativeValue = this.value - this.min;
        const relativeMax = this.max - this.min;
        let rangePercent = (relativeValue / relativeMax) * 100;
        if (isNaN(rangePercent)) {
            rangePercent = 0;
        }

        if (!useCachedWidth) {
            this.updateCachedWidths_();
        }

        let thumbPercent = 0;
        // If the range thumb is at min or max don't correct the time range.
        // Ideally the thumb center would go all the way to min and max values
        // but input[type=range] doesn't play like that.
        if (this.min < this.value && this.value < this.max) {
            const thumbOffset = this._thumbWidth * (0.5 - rangePercent / 100);
            thumbPercent = (thumbOffset / this._rangeWidth) * 100;
        }

        const stops = new ColorStops();
        stops.add('var(--theoplayer-range-bar-color, #fff)', 0, rangePercent + thumbPercent);
        return stops;
    }

    private updateCachedWidths_(): void {
        // Use the last non-zero range width, in case the range is temporarily hidden.
        const rangeWidth = this._rangeEl.offsetWidth;
        if (rangeWidth > 0) {
            this._rangeWidth = rangeWidth;
        }
        const thumbWidth = parseInt(getComputedStyle(this).getPropertyValue('--theoplayer-range-thumb-width') || '10px');
        if (thumbWidth > 0) {
            this._thumbWidth = thumbWidth;
        }
    }

    private readonly _updatePointerBar = (e: PointerEvent): void => {
        if (this.disabled) {
            return;
        }
        // Get mouse position percent
        const rangeRect = this._rangeEl.getBoundingClientRect();
        let mousePercent = (e.clientX - rangeRect.left) / rangeRect.width;
        // Lock between 0 and 1
        mousePercent = Math.max(0, Math.min(1, mousePercent));
        this.updatePointer_(mousePercent, rangeRect);
    };

    protected updatePointer_(mousePercent: number, rangeRect: DOMRectReadOnly): void {
        this._pointerEl.style.width = `${mousePercent * rangeRect.width}px`;
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
}

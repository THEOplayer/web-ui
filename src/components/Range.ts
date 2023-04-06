import * as shadyCss from '@webcomponents/shadycss';
import rangeCss from './Range.css';
import { Attribute } from '../util/Attribute';

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
export abstract class Range extends HTMLElement {
    static get observedAttributes() {
        return [Attribute.DISABLED, Attribute.HIDDEN];
    }

    protected readonly _rangeEl: HTMLInputElement;
    protected readonly _pointerEl: HTMLElement;
    private _lastRangeWidth: number = 0;

    constructor(options: RangeOptions) {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(options.template.content.cloneNode(true));

        this._rangeEl = shadowRoot.querySelector('input[type="range"]')!;
        this._rangeEl.addEventListener('input', this._onInput);
        // Internet Explorer does not fire 'input' events for <input> elements... use 'change' instead.
        this._rangeEl.addEventListener('change', this._onInput);

        this._pointerEl = shadowRoot.querySelector('[part="pointer"]')!;

        this._upgradeProperty('disabled');
        this._upgradeProperty('value');
        this._upgradeProperty('min');
        this._upgradeProperty('max');
        this._upgradeProperty('step');
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
        if (disabled) {
            this.setAttribute(Attribute.DISABLED, '');
        } else {
            this.removeAttribute(Attribute.DISABLED);
        }
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

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (newValue === oldValue) {
            return;
        }
        const hasValue = newValue != null;
        if (attrName === Attribute.DISABLED) {
            this.setAttribute('aria-disabled', hasValue ? 'true' : 'false');
            if (hasValue) {
                this._rangeEl.setAttribute(attrName, newValue);
            } else {
                this._rangeEl.removeAttribute(attrName);
            }
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

    protected update(): void {
        if (this.hasAttribute(Attribute.HIDDEN)) {
            return;
        }
        this._rangeEl.setAttribute('aria-valuetext', this.getAriaValueText());
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
        const colorArray = this.getBarColors();

        const gradientStops: string[] = [];
        let prevPercent = 0;
        for (const [color, percent] of colorArray) {
            if (percent < prevPercent) continue;
            gradientStops.push(`${color} ${prevPercent}%`);
            gradientStops.push(`${color} ${percent}%`);
            prevPercent = percent;
        }

        shadyCss.styleSubtree(this, {
            '--theoplayer-range-track-progress-internal': `linear-gradient(to right, ${gradientStops.join(', ')})`
        });
    }

    /**
     * Build the color gradient for the range bar.
     * Creating an array so progress-bar can insert the buffered bar.
     */
    protected getBarColors(): Array<[string, number]> {
        const relativeValue = this.value - this.min;
        const relativeMax = this.max - this.min;
        const rangePercent = (relativeValue / relativeMax) * 100;

        // Use the last non-zero range width, in case the range is temporarily hidden.
        const rangeWidth = this._rangeEl.offsetWidth;
        if (rangeWidth > 0) {
            this._lastRangeWidth = rangeWidth;
        }

        let thumbPercent = 0;
        // If the range thumb is at min or max don't correct the time range.
        // Ideally the thumb center would go all the way to min and max values
        // but input[type=range] doesn't play like that.
        if (this.min < this.value && this.value < this.max) {
            const thumbWidth = getComputedStyle(this).getPropertyValue('--theoplayer-range-thumb-width') || '10px';
            const thumbOffset = parseInt(thumbWidth) * (0.5 - rangePercent / 100);
            thumbPercent = (thumbOffset / this._lastRangeWidth) * 100;
        }

        return [
            ['var(--theoplayer-range-bar-color, #fff)', rangePercent + thumbPercent],
            ['transparent', 100]
        ];
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
}

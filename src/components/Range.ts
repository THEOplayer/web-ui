import * as shadyCss from '@webcomponents/shadycss';

export interface RangeOptions {
    template: HTMLTemplateElement;
}

const ATTR_DISABLED = 'disabled';

export abstract class Range extends HTMLElement {
    static get observedAttributes() {
        return [ATTR_DISABLED];
    }

    protected readonly _rangeEl: HTMLInputElement;

    constructor(options: RangeOptions) {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(options.template.content.cloneNode(true));

        this._rangeEl = shadowRoot.querySelector('input[type="range"]')!;
        this._rangeEl.addEventListener('input', this._onInput);
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        this._upgradeProperty('disabled');

        this._rangeEl.setAttribute('aria-label', this.getAriaLabel());
        this.update();
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    get disabled() {
        return this.hasAttribute(ATTR_DISABLED);
    }

    set disabled(disabled: boolean) {
        if (disabled) {
            this.setAttribute(ATTR_DISABLED, '');
        } else {
            this.removeAttribute(ATTR_DISABLED);
        }
    }

    get value(): number {
        return this._rangeEl.valueAsNumber;
    }

    set value(value: number) {
        this._rangeEl.valueAsNumber = value;
        this.handleInput();
    }

    get min(): number {
        return Number(this._rangeEl.min);
    }

    set min(min: number) {
        this._rangeEl.min = String(min);
        this.update();
    }

    get max(): number {
        return Number(this._rangeEl.max);
    }

    set max(max: number) {
        this._rangeEl.max = String(max);
        this.update();
    }

    get step(): number | 'any' {
        const raw = this._rangeEl.step;
        return raw === 'any' ? raw : Number(raw);
    }

    set step(step: number | 'any') {
        this._rangeEl.step = String(step);
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (attrName === ATTR_DISABLED && newValue !== oldValue) {
            const hasValue = newValue != null;
            this.setAttribute('aria-disabled', hasValue ? 'true' : 'false');
            if (hasValue) {
                this._rangeEl.setAttribute(attrName, newValue);
            } else {
                this._rangeEl.removeAttribute(attrName);
            }
        }
    }

    private readonly _onInput = () => {
        this.handleInput();
    };

    protected handleInput(): void {
        this.update();
    }

    protected update(): void {
        this._rangeEl.setAttribute('aria-valuetext', this.getAriaValueText());
        this.updateBar_();
    }

    protected abstract getAriaLabel(): string;

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

        let thumbPercent = 0;
        // If the range thumb is at min or max don't correct the time range.
        // Ideally the thumb center would go all the way to min and max values
        // but input[type=range] doesn't play like that.
        if (this.min < this.value && this.value < this.max) {
            const thumbWidth = getComputedStyle(this).getPropertyValue('--media-range-thumb-width') || '10px';
            const thumbOffset = parseInt(thumbWidth) * (0.5 - rangePercent / 100);
            thumbPercent = (thumbOffset / this._rangeEl.offsetWidth) * 100;
        }

        return [
            ['var(--theoplayer-range-bar-color, #fff)', rangePercent + thumbPercent],
            ['transparent', 100]
        ];
    }
}

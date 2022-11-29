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
        this.update();
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
        this.update();
    };

    protected update(): void {
        this._rangeEl.setAttribute('aria-valuetext', this.getAriaValueText());
    }

    protected abstract getAriaLabel(): string;

    protected abstract getAriaValueText(): string;
}

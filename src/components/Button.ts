import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { templateContent } from 'lit/directives/template-content.js';
import buttonCss from './Button.css';
import { Attribute } from '../util/Attribute';
import { isActivationKey } from '../util/KeyCode';

/** @deprecated */
export interface ButtonOptions {
    /**
     * @deprecated Override {@link Button.render} instead.
     */
    template?: HTMLTemplateElement;
}

/**
 * @deprecated Override {@link Button.render} instead.
 */
export function buttonTemplate(button: string, extraCss: string = ''): string {
    return `<style>${extraCss}</style>${button}`;
}

/**
 * `<theoplayer-button>` - A basic button.
 *
 * @attribute `disabled` - Whether the button is disabled. When disabled, the button cannot be clicked.
 * @group Components
 */
// Based on howto-toggle-button
// https://github.com/GoogleChromeLabs/howto-components/blob/079d0fa34ff9038b26ea8883b1db5dd6b677d7ba/elements/howto-toggle-button/howto-toggle-button.js
@customElement('theoplayer-button')
export class Button extends LitElement {
    static styles = [buttonCss];

    private readonly _template: HTMLTemplateElement | undefined;
    private _disabled: boolean = false;

    /**
     * Creates a basic button.
     *
     * By default, the button renders the contents of its direct children (i.e. it has a single unnamed `<slot>`).
     * Subclasses can override this by overriding {@link render}.
     */
    constructor(options?: ButtonOptions) {
        super();
        this._template = options?.template;
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    connectedCallback(): void {
        super.connectedCallback();

        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'button');
        }
        if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', '0');
        }
        if (!this.hasAttribute(Attribute.ARIA_LIVE)) {
            // Let the screen reader user know that the text of the button may change
            this.setAttribute(Attribute.ARIA_LIVE, 'polite');
        }
        if (!this._disabled) {
            this._enable();
        }
    }

    disconnectedCallback(): void {
        this.removeEventListener('click', this._onClick);
        this.removeEventListener('keydown', this._onKeyDown);
        this.removeEventListener('keyup', this._onKeyUp);
    }

    /**
     * Whether the button is disabled.
     *
     * When disabled, the button cannot be clicked.
     */
    get disabled(): boolean {
        return this._disabled;
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.DISABLED })
    set disabled(value: boolean) {
        this._disabled = value;
        if (value) {
            this._disable();
        } else {
            this._enable();
        }
    }

    private _enable(): void {
        this.removeEventListener('click', this._onClick);
        this.removeEventListener('keydown', this._onKeyDown);
        this.removeEventListener('keyup', this._onKeyUp);
        this.addEventListener('click', this._onClick);
        this.addEventListener('keydown', this._onKeyDown);

        this.setAttribute('aria-disabled', 'false');
        this.setAttribute('tabindex', '0');
    }

    private _disable(): void {
        this.removeEventListener('click', this._onClick);
        this.removeEventListener('keydown', this._onKeyDown);
        this.removeEventListener('keyup', this._onKeyUp);

        this.setAttribute('aria-disabled', 'true');

        // The `tabindex` attribute does not provide a way to fully remove focusability from an element.
        // Elements with `tabindex=-1` can still be focused with a mouse or by calling `focus()`.
        // To make sure an element is disabled and not focusable, remove the `tabindex` attribute.
        this.removeAttribute('tabindex');

        // If the focus is currently on this element, unfocus it by calling the `HTMLElement.blur()` method.
        this.blur();
    }

    private readonly _onClick = () => {
        this.handleClick();
    };

    protected readonly _onKeyDown = (e: KeyboardEvent) => {
        if (isActivationKey(e.keyCode) && !e.metaKey && !e.altKey) {
            this.addEventListener('keyup', this._onKeyUp);
        } else {
            this.removeEventListener('keyup', this._onKeyUp);
        }
    };

    protected readonly _onKeyUp = (e: KeyboardEvent) => {
        this.removeEventListener('keyup', this._onKeyUp);
        if (isActivationKey(e.keyCode)) {
            this.handleClick();
        }
    };

    protected render(): HTMLTemplateResult {
        if (this._template) {
            return html`${templateContent(this._template)}`;
        }
        return html`<slot></slot>`;
    }

    /**
     * Handle a button click.
     *
     * By default, this does nothing. Subclasses can override this method to add behavior to the button.
     */
    protected handleClick(): void {}
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-button': Button;
    }
}

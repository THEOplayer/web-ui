import * as shadyCss from '@webcomponents/shadycss';
import buttonCss from './Button.css';
import { Attribute } from '../util/Attribute';
import { toggleAttribute } from '../util/CommonUtils';
import { createTemplate } from '../util/TemplateUtils';
import { isActivationKey } from '../util/KeyCode';

export interface ButtonOptions {
    template: HTMLTemplateElement;
}

export function buttonTemplate(button: string, extraCss: string = ''): string {
    return `<style>${buttonCss}\n${extraCss}</style>${button}`;
}

const defaultTemplate = createTemplate('theoplayer-button', buttonTemplate('<slot></slot>'));

/**
 * `<theoplayer-button>` - A basic button.
 *
 * @attribute `disabled` - Whether the button is disabled. When disabled, the button cannot be clicked.
 * @group Components
 */
// Based on howto-toggle-button
// https://github.com/GoogleChromeLabs/howto-components/blob/079d0fa34ff9038b26ea8883b1db5dd6b677d7ba/elements/howto-toggle-button/howto-toggle-button.js
export class Button extends HTMLElement {
    static get observedAttributes() {
        return [Attribute.DISABLED];
    }

    /**
     * Creates a basic button.
     *
     * By default, the button renders the contents of its direct children (i.e. it has a single unnamed `<slot>`).
     * Subclasses can override this by passing a different {@link ButtonOptions.template} in the options,
     * using {@link buttonTemplate} to correctly style the custom template.
     *
     * @param options - The options for this button.
     */
    constructor(options?: ButtonOptions) {
        super();
        const template = options?.template ?? defaultTemplate();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._upgradeProperty('disabled');
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
        if (!this.hasAttribute(Attribute.DISABLED)) {
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
    get disabled() {
        return this.hasAttribute(Attribute.DISABLED);
    }

    set disabled(disabled: boolean) {
        toggleAttribute(this, Attribute.DISABLED, disabled);
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (attrName === Attribute.DISABLED && newValue !== oldValue) {
            const hasValue = newValue != null;
            if (hasValue) {
                this._disable();
            } else {
                this._enable();
            }
        }
        if (Button.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
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

    /**
     * Handle a button click.
     *
     * By default, this does nothing. Subclasses can override this method to add behavior to the button.
     */
    protected handleClick(): void {}
}

customElements.define('theoplayer-button', Button);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-button': Button;
    }
}

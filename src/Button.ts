import * as shadyCss from '@webcomponents/shadycss';

export interface ButtonOptions {
    template: HTMLTemplateElement;
}

const enum KeyCode {
    SPACE = 32,
    ENTER = 13
}

/**
 * Based on howto-toggle-button
 * https://github.com/GoogleChromeLabs/howto-components/blob/079d0fa34ff9038b26ea8883b1db5dd6b677d7ba/elements/howto-toggle-button/howto-toggle-button.js
 */
export abstract class Button extends HTMLElement {
    static get observedAttributes() {
        return ['disabled'];
    }

    protected constructor(options: ButtonOptions) {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(options.template.content.cloneNode(true));
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'button');
        }
        if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', '0');
        }

        this._upgradeProperty('disabled');

        this.addEventListener('keydown', this._onKeyDown);
        this.addEventListener('click', this._onClick);
    }

    private _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    get disabled() {
        return this.hasAttribute('disabled');
    }

    set disabled(disabled: boolean) {
        if (disabled) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (attrName === 'disabled' && newValue !== oldValue) {
            const hasValue = newValue != null;
            this.setAttribute('aria-disabled', hasValue ? 'true' : 'false');
            // The `tabindex` attribute does not provide a way to fully remove focusability from an element.
            // Elements with `tabindex=-1` can still be focused with a mouse or by calling `focus()`.
            // To make sure an element is disabled and not focusable, remove the `tabindex` attribute.
            if (hasValue) {
                this.removeAttribute('tabindex');
                // If the focus is currently on this element, unfocus it by calling the `HTMLElement.blur()` method.
                this.blur();
            } else {
                this.setAttribute('tabindex', '0');
            }
        }
    }

    private readonly _onKeyDown = (event: KeyboardEvent) => {
        // Don't handle modifier shortcuts typically used by assistive technology.
        if (event.altKey) return;

        switch (event.keyCode) {
            case KeyCode.SPACE:
            case KeyCode.ENTER:
                event.preventDefault();
                this.handleClick();
                break;
            // Any other key press is ignored and passed back to the browser.
            default:
                return;
        }
    };

    private readonly _onClick = () => {
        this.handleClick();
    };

    protected abstract handleClick(): void;
}
import * as shadyCss from '@webcomponents/shadycss';
import linkButtonCss from './LinkButton.css';
import { Attribute } from '../util/Attribute';
import type { ButtonOptions } from './Button';
import { Button, buttonTemplate } from './Button';
import { KeyCode } from '../util/KeyCode';
import { toggleAttribute } from '../util/CommonUtils';
import { createTemplate } from '../util/TemplateUtils';

export function linkButtonTemplate(button: string, extraCss: string = ''): string {
    return buttonTemplate(`<a>${button}</a>`, `${linkButtonCss}\n${extraCss}`);
}

const defaultTemplate = createTemplate('theoplayer-link-button', linkButtonTemplate('<slot></slot>'));

/**
 * `<theoplayer-link-button>` - A {@link Button | button} that opens a hyperlink.
 *
 * @attribute `disabled` - Whether the button is disabled. When disabled, the button cannot be clicked.
 * @group Components
 */
export class LinkButton extends HTMLElement {
    private readonly _linkEl: HTMLAnchorElement;

    static get observedAttributes() {
        return [Attribute.DISABLED];
    }

    constructor(options?: ButtonOptions) {
        super();

        const template = options?.template ?? defaultTemplate();
        const shadowRoot = this.attachShadow({ mode: 'open', delegatesFocus: true });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._linkEl = shadowRoot.querySelector('a')!;

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

        this._linkEl.addEventListener('keydown', this._onKeyDown);
        this._linkEl.addEventListener('click', this._onClick);
    }

    disconnectedCallback(): void {
        this._linkEl.removeEventListener('keydown', this._onKeyDown);
        this._linkEl.removeEventListener('click', this._onClick);
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

    protected setLink(href: string, target: string): void {
        this._linkEl.href = href;
        this._linkEl.target = target;
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
        this.setAttribute('aria-disabled', 'false');
        this.setAttribute('tabindex', '0');
    }

    private _disable(): void {
        this.setAttribute('aria-disabled', 'true');

        // The `tabindex` attribute does not provide a way to fully remove focusability from an element.
        // Elements with `tabindex=-1` can still be focused with a mouse or by calling `focus()`.
        // To make sure an element is disabled and not focusable, remove the `tabindex` attribute.
        this.removeAttribute('tabindex');

        // If the focus is currently on this element, unfocus it by calling the `HTMLElement.blur()` method.
        this.blur();
    }

    private readonly _onKeyDown = (event: KeyboardEvent) => {
        // Don't handle modifier shortcuts typically used by assistive technology.
        if (event.altKey) return;

        switch (event.keyCode) {
            // Enter is already handled by the browser.
            // case KeyCode.ENTER:
            case KeyCode.SPACE:
                event.preventDefault();
                this._linkEl.click();
                break;
            // Any other key press is ignored and passed back to the browser.
            default:
                return;
        }
    };

    private readonly _onClick = () => {
        if (this.disabled) {
            return;
        }
        this.handleClick();
    };

    protected handleClick(): void {}
}

customElements.define('theoplayer-link-button', LinkButton);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-link-button': LinkButton;
    }
}

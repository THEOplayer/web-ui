import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { templateContent } from 'lit/directives/template-content.js';
import linkButtonCss from './LinkButton.css';
import { Attribute } from '../util/Attribute';
import { KeyCode } from '../util/KeyCode';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { type ButtonOptions, buttonTemplate } from './Button';

/**
 * @deprecated Override {@link LinkButton.render} instead.
 */
export function linkButtonTemplate(button: string, extraCss: string = ''): string {
    return buttonTemplate(`<a>${button}</a>`, extraCss);
}

/**
 * `<theoplayer-link-button>` - A {@link Button | button} that opens a hyperlink.
 *
 * @attribute `disabled` - Whether the button is disabled. When disabled, the button cannot be clicked.
 * @group Components
 */
@customElement('theoplayer-link-button')
export class LinkButton extends LitElement {
    static styles = [linkButtonCss];

    private readonly _template: HTMLTemplateElement | undefined;
    private _disabled: boolean = false;

    private readonly _linkRef: Ref<HTMLAnchorElement> = createRef<HTMLAnchorElement>();

    constructor(options?: ButtonOptions) {
        super();
        this._template = options?.template;
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
        if (!this.hasAttribute(Attribute.DISABLED)) {
            this._enable();
        }
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

    @state()
    protected accessor href: string = '';

    @state()
    protected accessor target: string = '';

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
        if (event.metaKey || event.altKey) return;

        switch (event.keyCode) {
            // Enter is already handled by the browser.
            // case KeyCode.ENTER:
            case KeyCode.SPACE:
                event.preventDefault();
                this._linkRef.value?.click();
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

    protected override render(): HTMLTemplateResult {
        if (this._template) {
            return html`${templateContent(this._template)}`;
        }
        return html`<a ${ref(this._linkRef)} href=${this.href} target=${this.target} @keydown=${this._onKeyDown} @click=${this._onClick}
            >${this.renderLinkContent()}</a
        >`;
    }

    protected renderLinkContent(): HTMLTemplateResult {
        return html`<slot></slot>`;
    }

    protected handleClick(): void {}
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-link-button': LinkButton;
    }
}

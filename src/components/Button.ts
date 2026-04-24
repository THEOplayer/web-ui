import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { templateContent } from 'lit/directives/template-content.js';
import buttonCss from './Button.css';
import { Attribute } from '../util/Attribute';
import { isActivationKey } from '../util/KeyCode';

/** @deprecated */
export interface ButtonOptions {
    /**
     * @deprecated Override `Button.render` instead.
     */
    template?: HTMLTemplateElement;
}

/**
 * @deprecated Override `Button.render` instead.
 */
export function buttonTemplate(button: string, extraCss: string = ''): string {
    return `<style>${extraCss}</style>${button}`;
}

/**
 * A basic button.
 *
 * @cssproperty `--theoplayer-control-height` - The height of the button's control area (and default icon size). Defaults to `24px`.
 * @cssproperty `--theoplayer-control-padding` - The padding around the button's content. Defaults to `10px`.
 * @cssproperty `--theoplayer-control-background` - The background of the button. Defaults to `transparent`.
 * @cssproperty `--theoplayer-control-hover-background` - The background of the button when hovered.
 *   Defaults to `--theoplayer-control-background`.
 * @cssproperty `--theoplayer-text-color` - The text color of the button. Defaults to `#fff`.
 * @cssproperty `--theoplayer-text-font-size` - The font size of the button's text. Defaults to `14px`.
 * @cssproperty `--theoplayer-text-content-height` - The line-height of the button's text. Defaults to `--theoplayer-control-height`.
 * @cssproperty `--theoplayer-icon-color` - The color of the button's icon. Defaults to `#fff`.
 * @cssproperty `--theoplayer-focus-ring-color` - The color of the focus ring around focused buttons. Defaults to `rgba(27, 127, 204, 0.9)`.
 * @cssproperty `--theoplayer-button-text-color` - The text color of the button. Defaults to `--theoplayer-text-color`.
 * @cssproperty `--theoplayer-button-icon-width` - The width of the button's icon. Defaults to `--theoplayer-control-height`.
 * @cssproperty `--theoplayer-button-icon-height` - The height of the button's icon. Defaults to `--theoplayer-control-height`.
 * @cssproperty `--theoplayer-button-icon-transition` - The CSS transition applied to the button's icon. Defaults to `none`.
 * @cssproperty `--theoplayer-button-icon-shadow` - A drop-shadow applied to the icon. Defaults to `none`.
 * @cssproperty `--theoplayer-button-hover-icon-shadow` - A drop-shadow applied to the icon on hover. Defaults to `0 0 4px rgba(255, 255, 255, 0.5)`.
 * @cssproperty `--theoplayer-button-checked-background` - The background of a toggled-on button (e.g. mute, fullscreen). Defaults to `#fff`.
 * @cssproperty `--theoplayer-button-checked-color` - The color of a toggled-on button. Defaults to `#000`.
 * @cssproperty `--theoplayer-button-disabled-text-color` - The text color of a disabled button. Defaults to `#ccc`.
 * @cssproperty `--theoplayer-before-first-play-display` - The CSS `display` of the button before first play.
 *   The {@link UIContainer | `<theoplayer-ui>`} will set this to `none` to hide all buttons until playback begins,
 *   after which this becomes `unset` and the button reverts back to its initial CSS `display`.
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
        if (this._template) {
            // Render immediately to populate the shadow DOM.
            this.performUpdate();
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

import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { templateContent } from 'lit/directives/template-content.js';
import buttonCss from './Button.css';
import { Attribute } from '../util/Attribute';
import { isActivationKey } from '../util/KeyCode';
import { createCustomEvent } from '../util/EventUtils';

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
 * A basic button.
 *
 * @attribute `disabled` - Whether the button is disabled. When disabled, the button cannot be clicked.
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

    /**
     * Specifies the action to be performed on an element being controlled via the `commandfor` attribute.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button#command
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLButtonElement/command
     */
    @property({ reflect: true, type: String, attribute: Attribute.COMMAND })
    accessor command: string | null = null;

    private _commandForAttribute: string | null = null;
    private _explicitCommandForElement: HTMLElement | null = null;

    @property({ reflect: true, state: true, type: String, attribute: Attribute.COMMAND_FOR })
    private set commandFor_(commandFor: string | null) {
        this._commandForAttribute = commandFor;
        this._explicitCommandForElement = null;
    }

    /**
     * Turns the `<theoplayer-button>` element into a command button, controlling a given interactive element
     * by issuing the command specified in the button's {@link command |`command`} attribute.
     *
     * The `commandfor` attribute takes the ID of the element to control as its value.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button#commandfor
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLButtonElement/commandForElement
     */
    get commandForElement(): HTMLElement | null {
        // https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#attr-associated-element
        if (this._explicitCommandForElement) return this._explicitCommandForElement;
        const commandFor = this._commandForAttribute;
        if (!commandFor) return null;
        const root = this.getRootNode() as Document | ShadowRoot | null;
        return root?.getElementById?.(commandFor) ?? null;
    }

    set commandForElement(element: HTMLElement | null) {
        if (!element) {
            this.commandFor_ = null;
            this._explicitCommandForElement = null;
        } else {
            this.commandFor_ = '';
            this._explicitCommandForElement = element;
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

    private readonly _onClick = (e: Event) => {
        this.handleClick(e);
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
            this.handleClick(e);
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
    protected handleClick(event: Event): void {
        // https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element:activation-behaviour
        if (event.defaultPrevented || this.disabled) return;
        const command = this.command;
        if (!command) return;
        const target = this.commandForElement;
        if (!target) return;
        const commandEvent =
            typeof CommandEvent === 'function'
                ? new CommandEvent('command', { source: this, command, cancelable: true })
                : createCustomEvent('command', {
                      detail: { source: this, command } satisfies CommandEventInit,
                      cancelable: true
                  });
        const continueCommand = target.dispatchEvent(commandEvent);
        if (!continueCommand) return;
        switch (command) {
            case 'toggle-popover':
                target.togglePopover?.();
                break;
            case 'show-popover':
                target.showPopover?.();
                break;
            case 'hide-popover':
                target.hidePopover?.();
                break;
            case 'close': {
                const dialog = target as HTMLDialogElement;
                dialog.close?.();
                break;
            }
            case 'request-close': {
                const dialog = target as HTMLDialogElement;
                dialog.requestClose?.();
                break;
            }
            case 'show-modal': {
                const dialog = target as HTMLDialogElement;
                dialog.showModal?.();
                break;
            }
            case 'show': {
                const dialog = target as HTMLDialogElement;
                dialog.show?.();
                break;
            }
            case 'toggle-modal': {
                const dialog = target as HTMLDialogElement;
                dialog.open ? dialog.close?.() : dialog.showModal?.();
                break;
            }
            case 'toggle': {
                const targetDialog = target as HTMLDialogElement;
                targetDialog.open ? targetDialog.close?.() : targetDialog.show?.();
                break;
            }
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-button': Button;
    }
}

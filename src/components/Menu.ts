import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import menuCss from './Menu.css';
import { CLOSE_MENU_EVENT, type CloseMenuEvent } from '../events/CloseMenuEvent';
import { MENU_CHANGE_EVENT, type MenuChangeEvent } from '../events/MenuChangeEvent';
import { createCustomEvent } from '../util/EventUtils';
import { Attribute } from '../util/Attribute';
import { toggleAttribute } from '../util/CommonUtils';
import { templateContent } from 'lit/directives/template-content.js';

/** @deprecated */
export interface MenuOptions {
    /**
     * @deprecated Override {@link Menu.render} instead.
     */
    template?: HTMLTemplateElement;
}

/**
 * @deprecated Override {@link Menu.render} instead.
 */
export function menuTemplate(heading: string, content: string, extraCss: string = ''): string {
    return (
        `<style>${extraCss}</style>` +
        `<div part="heading"><theoplayer-menu-close-button></theoplayer-menu-close-button>${heading}</div>` +
        `<div part="content">${content}</div>`
    );
}

/**
 * `<theoplayer-menu>` - A menu that can be opened on top of the player.
 *
 * The menu has a heading at the top, with a {@link CloseMenuButton | close button} and a heading text.
 *
 * @attribute `menu-close-on-input` - Whether to automatically close the menu whenever one of its controls
 *   receives an input (e.g. when a radio button is clicked).
 * @attribute `menu-opened` (readonly) - Whether the menu is currently open.
 *
 * @slot `heading` - A slot for the menu's heading.
 *
 * @group Components
 */
@customElement('theoplayer-menu')
export class Menu extends LitElement {
    static override styles = [menuCss];
    static override shadowRootOptions: ShadowRootInit = {
        ...LitElement.shadowRootOptions,
        delegatesFocus: true
    };

    private readonly _template: HTMLTemplateElement | undefined;
    private _menuOpened: boolean = false;

    /**
     * Creates a menu.
     *
     * By default, the button has an unnamed `<slot>` for its contents, and a named `"heading"` `<slot>` for its heading text.
     * Subclasses can override this by overriding {@link renderMenuHeading} and/or {@link renderMenuContent}.
     */
    constructor(options?: MenuOptions) {
        super();
        this._template = options?.template;
        if (this._template) {
            // Render immediately to populate the shadow DOM.
            this.performUpdate();
        }
    }

    connectedCallback(): void {
        super.connectedCallback();

        if (!this.menuOpened_) {
            this.setAttribute(Attribute.HIDDEN, '');
        }
    }

    /**
     * Whether to automatically close the menu whenever one of its controls
     * receives an input (e.g. when a radio button is clicked).
     */
    @property({ reflect: true, type: Boolean, attribute: Attribute.MENU_CLOSE_ON_INPUT })
    accessor closeOnInput: boolean = false;

    private get menuOpened_(): boolean {
        return this._menuOpened;
    }

    @property({ reflect: true, state: true, type: Boolean, attribute: Attribute.MENU_OPENED })
    private set menuOpened_(menuOpened: boolean) {
        if (this._menuOpened === menuOpened) return;
        this._menuOpened = menuOpened;
        toggleAttribute(this, Attribute.HIDDEN, !menuOpened);
        const changeEvent: MenuChangeEvent = createCustomEvent(MENU_CHANGE_EVENT, { bubbles: true });
        this.dispatchEvent(changeEvent);
    }

    /**
     * Open the menu.
     */
    openMenu(): void {
        this.menuOpened_ = true;
    }

    /**
     * Close the menu.
     */
    closeMenu(): void {
        this.menuOpened_ = false;
    }

    private readonly _onContentInput = (): void => {
        // Close menu when clicking any button
        if (this.closeOnInput) {
            const event: CloseMenuEvent = createCustomEvent(CLOSE_MENU_EVENT, {
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        }
    };

    protected override render(): HTMLTemplateResult {
        if (this._template) {
            return html`${templateContent(this._template)}`;
        }
        return html`<div part="heading">
                <theoplayer-menu-close-button></theoplayer-menu-close-button>
                ${this.renderMenuHeading()}
            </div>
            <div part="content" @input=${this._onContentInput}>${this.renderMenuContent()}</div>`;
    }

    protected renderMenuHeading(): HTMLTemplateResult {
        return html`<slot name="heading"></slot>`;
    }

    protected renderMenuContent(): HTMLTemplateResult {
        return html`<slot></slot>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-menu': Menu;
    }
}

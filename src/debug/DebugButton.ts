import { html, type HTMLTemplateResult } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { Button } from '../index';
import { closestRecursive } from '../util/CommonUtils';
import bugReportIcon from './bug.svg';
import { defineElementOnce } from './defineElementOnce';

export class DebugButton extends Button {
    private _displayObserver: MutationObserver | undefined;

    override connectedCallback(): void {
        super.connectedCallback();
        this.setAttribute('aria-label', 'Toggle debug info');
        const display = this.findDebugDisplay_();
        if (display) {
            this._displayObserver = new MutationObserver(() => this.updateAriaPressed_());
            this._displayObserver.observe(display, { attributes: true, attributeFilter: ['hidden'] });
        }
        this.updateAriaPressed_();
    }

    override disconnectedCallback(): void {
        this._displayObserver?.disconnect();
        this._displayObserver = undefined;
        super.disconnectedCallback();
    }

    /**
     * Toggle the nearest debug display.
     */
    protected override handleClick(): void {
        const display = this.findDebugDisplay_();
        if (!display) {
            return;
        }
        display.hidden = !display.hidden;
        this.updateAriaPressed_();
    }

    /**
     * Find the debug panel under the nearest UI component.
     */
    private findDebugDisplay_(): HTMLElement | null {
        const ui = closestRecursive<HTMLElement>(this, 'theoplayer-default-ui, theolive-default-ui, theoplayer-ui');
        return ui?.querySelector<HTMLElement>('theoplayer-debug-display') ?? null;
    }

    /**
     * Keep the pressed state synchronized with the panel's visibility.
     */
    private updateAriaPressed_(): void {
        const display = this.findDebugDisplay_();
        this.setAttribute('aria-pressed', String(display ? !display.hidden : false));
    }

    protected override render(): HTMLTemplateResult {
        return html`<span part="icon"><slot name="icon">${unsafeSVG(bugReportIcon)}</slot></span>`;
    }
}

defineElementOnce('theoplayer-debug-button', DebugButton);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-debug-button': DebugButton;
    }
}

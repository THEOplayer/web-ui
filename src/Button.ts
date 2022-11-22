import { html, LitElement, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import elementCss from './Button.css';

export abstract class Button extends LitElement {
    @property({ type: Boolean, reflect: true })
    disabled: boolean = false;

    protected handleClick(): void {}

    static styles = elementCss;

    override render() {
        return html` <button ?disabled=${this.disabled} @click=${this.handleClick}>${this.buttonTemplate()}</button>`;
    }

    protected abstract buttonTemplate(): TemplateResult;
}

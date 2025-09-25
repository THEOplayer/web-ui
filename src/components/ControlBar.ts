import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import controlBarCss from './ControlBar.css';

/**
 * `<theoplayer-control-bar>` - A horizontal control bar that can contain other controls.
 *
 * @group Components
 */
@customElement('theoplayer-control-bar')
export class ControlBar extends LitElement {
    static override styles = [controlBarCss];
    static override shadowRootOptions: ShadowRootInit = {
        ...LitElement.shadowRootOptions,
        delegatesFocus: true
    };

    protected override render(): HTMLTemplateResult {
        return html`<slot></slot>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-control-bar': ControlBar;
    }
}

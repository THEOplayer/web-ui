import { html, type HTMLTemplateResult, LitElement, type PropertyValues } from 'lit';
import { customElement } from 'lit/decorators.js';
import { createRef, type Ref } from 'lit/directives/ref.js';
import verticalRadioGroupCss from '../../VerticalRadioGroup.css';
import './AutomaticQualitySelector';
import './BadNetworkModeSelector';
import { RadioGroup } from '../../RadioGroup';

@customElement('theolive-bad-network-menu')
export class BadNetworkModeMenu extends LitElement {
    static styles = [verticalRadioGroupCss];

    private readonly _radioGroup: Ref<RadioGroup> = createRef<RadioGroup>();

    protected firstUpdated(_changedProperties: PropertyValues) {
        if (this._radioGroup.value && !(this._radioGroup.value instanceof RadioGroup)) {
            customElements.upgrade(this._radioGroup.value);
        }
    }

    private readonly _onChange = () => {
        this.dispatchEvent(new Event('change', { bubbles: true }));
    };

    protected override render(): HTMLTemplateResult {
        return html`<theoplayer-radio-group @change=${this._onChange}>
            <theolive-automatic-quality-selector></theolive-automatic-quality-selector>
            <theolive-bad-network-quality-selector></theolive-bad-network-quality-selector>
        </theoplayer-radio-group>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theolive-bad-network-menu': BadNetworkModeMenu;
    }
}

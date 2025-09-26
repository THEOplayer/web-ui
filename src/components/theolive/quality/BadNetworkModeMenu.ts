import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import verticalRadioGroupCss from '../../VerticalRadioGroup.css';
import './AutomaticQualitySelector';
import './BadNetworkModeSelector';
import { RadioGroup } from '../../RadioGroup';

@customElement('theolive-bad-network-menu')
export class BadNetworkModeMenu extends LitElement {
    static styles = [verticalRadioGroupCss];

    private readonly _radioGroupRef: Ref<RadioGroup> = createRef<RadioGroup>();

    protected firstUpdated() {
        if (this._radioGroupRef.value && !(this._radioGroupRef.value instanceof RadioGroup)) {
            customElements.upgrade(this._radioGroupRef.value);
        }
    }

    private readonly _onChange = () => {
        this.dispatchEvent(new Event('change', { bubbles: true }));
    };

    protected override render(): HTMLTemplateResult {
        return html`<theoplayer-radio-group ${ref(this._radioGroupRef)} @change=${this._onChange}>
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

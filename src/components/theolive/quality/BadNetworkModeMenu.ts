import * as shadyCss from '@webcomponents/shadycss';
import verticalRadioGroupCss from './BadNetworkModeMenu.css';
import './AutomaticQualitySelector';
import './BadNetworkModeSelector';
import { RadioGroup } from '../../RadioGroup';
import { createTemplate } from '../../../util/TemplateUtils';

const html = `<style>${verticalRadioGroupCss}</style>
<theoplayer-radio-group>
    <theolive-automatic-quality-selector></theolive-automatic-quality-selector>
    <theolive-bad-network-quality-selector></theolive-bad-network-quality-selector>
</theoplayer-radio-group>
`;
const template = createTemplate('theolive-bad-network-menu', html);

export class BadNetworkModeMenu extends HTMLElement {
    private readonly _radioGroup: RadioGroup;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template().content.cloneNode(true));
        this._radioGroup = shadowRoot.querySelector('theoplayer-radio-group')!;
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

        if (!(this._radioGroup instanceof RadioGroup)) {
            customElements.upgrade(this._radioGroup);
        }
        this.shadowRoot!.addEventListener('change', this._onChange);
    }

    disconnectedCallback(): void {
        this.shadowRoot!.removeEventListener('change', this._onChange);
    }

    private readonly _onChange = () => {
        this.dispatchEvent(new Event('change', { bubbles: true }));
    };
}

customElements.define('theolive-bad-network-menu', BadNetworkModeMenu);

declare global {
    interface HTMLElementTagNameMap {
        'theolive-bad-network-menu': BadNetworkModeMenu;
    }
}

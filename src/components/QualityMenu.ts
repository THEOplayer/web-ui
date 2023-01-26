import { Menu, menuTemplate } from './Menu';
import * as shadyCss from '@webcomponents/shadycss';
import type { QualityRadioGroup } from './QualityRadioGroup';
import './QualityRadioGroup';

const template = document.createElement('template');
template.innerHTML = menuTemplate(`<slot name="heading">Quality</slot>`, `<theoplayer-quality-radio-group></theoplayer-quality-radio-group>`);
shadyCss.prepareTemplate(template, 'theoplayer-quality-menu');

export class QualityMenu extends Menu {
    private readonly _radioGroup!: QualityRadioGroup;

    constructor() {
        super({ template });
        this._radioGroup = this.shadowRoot!.querySelector('theoplayer-quality-radio-group')!;
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this._radioGroup.addEventListener('change', this._onChange);
    }

    disconnectedCallback(): void {
        this._radioGroup.removeEventListener('change', this._onChange);
    }

    private readonly _onChange = (): void => {
        // Close menu when quality selection changes
        this.close();
    };
}

customElements.define('theoplayer-quality-menu', QualityMenu);

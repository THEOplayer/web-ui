import { Button, ButtonOptions, buttonTemplate } from './Button';
import { Attribute } from '../util/Attribute';
import * as shadyCss from '@webcomponents/shadycss';

const defaultTemplate = document.createElement('template');
defaultTemplate.innerHTML = buttonTemplate('<slot></slot>');
shadyCss.prepareTemplate(defaultTemplate, 'theoplayer-radio-button');

export class RadioButton extends Button {
    static get observedAttributes() {
        return [...Button.observedAttributes, Attribute.ARIA_CHECKED];
    }

    constructor(options?: ButtonOptions) {
        super({ template: defaultTemplate, ...options });
    }

    override connectedCallback() {
        this._upgradeProperty('checked');

        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'radio');
        }
        if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', '-1');
        }

        super.connectedCallback();
    }

    get checked(): boolean {
        return this.getAttribute(Attribute.ARIA_CHECKED) === 'true';
    }

    set checked(checked: boolean) {
        this.setAttribute(Attribute.ARIA_CHECKED, checked ? 'true' : 'false');
    }

    protected handleClick(): void {
        this.checked = true;
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (RadioButton.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-radio-button', RadioButton);

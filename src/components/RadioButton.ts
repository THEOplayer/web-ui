import { Button } from './Button';
import { Attribute } from '../util/Attribute';

export abstract class RadioButton extends Button {
    static get observedAttributes() {
        return [...Button.observedAttributes, Attribute.ARIA_CHECKED];
    }

    override connectedCallback() {
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
}

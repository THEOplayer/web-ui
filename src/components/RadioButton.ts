import { Button } from './Button';

export const ATTR_CHECKED = 'aria-checked';

export abstract class RadioButton extends Button {
    static get observedAttributes() {
        return [...Button.observedAttributes, ATTR_CHECKED];
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
        return this.getAttribute(ATTR_CHECKED) === 'true';
    }

    set checked(checked: boolean) {
        this.setAttribute(ATTR_CHECKED, checked ? 'true' : 'false');
    }
}
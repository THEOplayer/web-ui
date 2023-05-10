import { Button, type ButtonOptions, buttonTemplate } from './Button';
import { Attribute } from '../util/Attribute';
import * as shadyCss from '@webcomponents/shadycss';
import { createEvent } from '../util/EventUtils';
import type { RadioGroup } from './RadioGroup';

const defaultTemplate = document.createElement('template');
defaultTemplate.innerHTML = buttonTemplate('<slot></slot>');
shadyCss.prepareTemplate(defaultTemplate, 'theoplayer-radio-button');

/**
 * A button that can be checked.
 *
 * When part of a {@link RadioGroup}, at most one button in the group can be checked.
 *
 * @group Components
 */
export class RadioButton extends Button {
    static get observedAttributes() {
        return [...Button.observedAttributes, Attribute.ARIA_CHECKED, Attribute.VALUE];
    }

    private _value: any = undefined;

    constructor(options?: ButtonOptions) {
        super({ template: defaultTemplate, ...options });
        this._upgradeProperty('checked');
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

    /**
     * Whether this radio button is checked.
     */
    get checked(): boolean {
        return this.getAttribute(Attribute.ARIA_CHECKED) === 'true';
    }

    set checked(checked: boolean) {
        this.setAttribute(Attribute.ARIA_CHECKED, checked ? 'true' : 'false');
    }

    /**
     * The value associated with this radio button.
     */
    get value(): any {
        return this._value;
    }

    set value(value: any) {
        this._value = value;
    }

    protected handleClick(): void {
        this.checked = true;
        this.dispatchEvent(createEvent('input', { bubbles: true, composed: true }));
    }

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (newValue === oldValue) {
            return;
        }
        if (attrName === Attribute.ARIA_CHECKED) {
            this.dispatchEvent(createEvent('change', { bubbles: true }));
        } else if (attrName === Attribute.VALUE) {
            this.value = newValue;
        }
        if (RadioButton.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-radio-button', RadioButton);

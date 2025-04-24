import { customElement, property } from 'lit/decorators.js';
import { Button } from './Button';
import { Attribute } from '../util/Attribute';
import { createEvent } from '../util/EventUtils';
import type { RadioGroup } from './RadioGroup';

/**
 * `<theoplayer-radio-button>` - A button that can be checked.
 *
 * When part of a {@link RadioGroup}, at most one button in the group can be checked.
 *
 * @group Components
 */
@customElement('theoplayer-radio-button')
export class RadioButton extends Button {
    private _checked: boolean = false;

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
        return this._checked;
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.ARIA_CHECKED })
    set checked(checked: boolean) {
        if (this._checked !== checked) {
            this._checked = checked;
            this.handleChange();
            this.dispatchEvent(createEvent('change', { bubbles: true }));
        }
    }

    /**
     * The value associated with this radio button.
     */
    @property({ attribute: Attribute.VALUE })
    accessor value: any = undefined;

    protected handleClick(): void {
        this.checked = true;
        this.dispatchEvent(createEvent('input', { bubbles: true, composed: true }));
    }

    protected handleChange(): void {}
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-radio-button': RadioButton;
    }
}

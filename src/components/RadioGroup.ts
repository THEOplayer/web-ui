import * as shadyCss from '@webcomponents/shadycss';
import { KeyCode } from '../util/KeyCode';
import { Attribute } from '../util/Attribute';
import { RadioButton } from './RadioButton';
import { createEvent } from '../util/EventUtils';
import { arrayFind } from '../util/CommonUtils';

const radioGroupTemplate = document.createElement('template');
radioGroupTemplate.innerHTML = `<slot></slot>`;
shadyCss.prepareTemplate(radioGroupTemplate, 'theoplayer-radio-group');

/**
 * A group of [radio buttons]{@link RadioButton}. At most one button in the group can be checked.
 *
 * ## Behavior
 * This radio group implements the [roving tabindex]{@link https://www.w3.org/WAI/ARIA/apg/example-index/radio/radio.html} pattern.
 *  - `Tab` moves focus in or out of the radio group.
 *  - `Up`/`Left` arrow moves focus to the previous radio button.
 *  - `Down`/`Right` arrow moves focus to the next radio button.
 *  - `Home` moves focus to the first radio button.
 *  - `End` moves focus to the last radio button.
 */
// Based on howto-radio-group
// https://github.com/GoogleChromeLabs/howto-components/blob/079d0fa34ff9038b26ea8883b1db5dd6b677d7ba/elements/howto-radio-group/howto-radio-group.js
export class RadioGroup extends HTMLElement {
    private _slot: HTMLSlotElement;
    private _lastCheckedRadioButton: RadioButton | null = null;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(radioGroupTemplate.content.cloneNode(true));

        this._slot = shadowRoot.querySelector('slot')!;
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'radiogroup');
        }

        this.addEventListener('keydown', this._onKeyDown);
        this.shadowRoot!.addEventListener('change', this._onButtonChange);
        this._slot.addEventListener('slotchange', this._onSlotChange);
        this._onSlotChange();
    }

    disconnectedCallback(): void {
        this.removeEventListener('keydown', this._onKeyDown);
        this.shadowRoot!.removeEventListener('change', this._onButtonChange);
        this._slot.removeEventListener('slotchange', this._onSlotChange);
    }

    private readonly _onSlotChange = () => {
        let firstFocusedButton = this.focusedRadioButton;
        if (!firstFocusedButton) {
            this.firstRadioButton?.setAttribute('tabindex', '0');
        }
    };

    private readonly _onKeyDown = (e: KeyboardEvent) => {
        switch (e.keyCode) {
            case KeyCode.UP:
            case KeyCode.LEFT: {
                e.preventDefault();
                this._focusPrevButton();
                break;
            }
            case KeyCode.DOWN:
            case KeyCode.RIGHT: {
                e.preventDefault();
                this._focusNextButton();
                break;
            }
            case KeyCode.HOME: {
                e.preventDefault();
                this.setFocusedRadioButton(this.firstRadioButton);
                break;
            }
            case KeyCode.END: {
                e.preventDefault();
                this.setFocusedRadioButton(this.lastRadioButton);
                break;
            }
            default: {
                break;
            }
        }
    };

    get focusedRadioButton(): RadioButton | null {
        return arrayFind(this.allRadioButtons(), (button) => button.tabIndex === 0) ?? null;
    }

    get checkedRadioButton(): RadioButton | null {
        return arrayFind(this.allRadioButtons(), (button) => button.checked) ?? null;
    }

    get firstRadioButton(): RadioButton | null {
        return this.allRadioButtons()[0];
    }

    get lastRadioButton(): RadioButton | null {
        const radioButtons = this.allRadioButtons();
        return radioButtons.length > 0 ? radioButtons[radioButtons.length - 1] : null;
    }

    allRadioButtons(): RadioButton[] {
        return this._slot.assignedNodes({ flatten: true }).filter(isRadioButton);
    }

    private _prevRadioButton(node: RadioButton): RadioButton | null {
        let prev = node.previousElementSibling;
        while (prev) {
            if (isRadioButton(prev)) {
                return prev;
            }
            prev = prev.previousElementSibling;
        }
        return null;
    }

    private _nextRadioButton(node: RadioButton): RadioButton | null {
        let next = node.nextElementSibling;
        while (next) {
            if (isRadioButton(next)) {
                return next;
            }
            next = next.nextElementSibling;
        }
        return null;
    }

    private _focusPrevButton(): void {
        let focusedButton = this.focusedRadioButton || this.firstRadioButton;
        if (!focusedButton) {
            return;
        }
        if (focusedButton === this.firstRadioButton) {
            this.setFocusedRadioButton(this.lastRadioButton);
        } else {
            this.setFocusedRadioButton(this._prevRadioButton(focusedButton));
        }
    }

    private _focusNextButton(): void {
        let focusedButton = this.focusedRadioButton || this.firstRadioButton;
        if (!focusedButton) {
            return;
        }
        if (focusedButton === this.lastRadioButton) {
            this.setFocusedRadioButton(this.firstRadioButton);
        } else {
            this.setFocusedRadioButton(this._nextRadioButton(focusedButton));
        }
    }

    setFocusedRadioButton(button: RadioButton | null): void {
        this._unfocusAll();
        if (button) {
            button.tabIndex = 0;
            button.focus();
        }
    }

    private _unfocusAll(): void {
        const radioButtons = this.allRadioButtons();
        for (let i = 0; i < radioButtons.length; i++) {
            const btn = radioButtons[i];
            btn.tabIndex = -1;
        }
    }

    setCheckedRadioButton(checkedButton: RadioButton | null): void {
        const radioButtons = this.allRadioButtons();
        for (let i = 0; i < radioButtons.length; i++) {
            const button = radioButtons[i];
            button.checked = button === checkedButton;
        }
        this.dispatchEvent(createEvent('change', { bubbles: true }));
    }

    private readonly _onButtonChange = (event: Event) => {
        const button = event.target as RadioButton | null;
        if (button !== null && button.checked) {
            this.setCheckedRadioButton(event.target as RadioButton);
        }
    };
}

customElements.define('theoplayer-radio-group', RadioGroup);

function isRadioButton(node: Node): node is RadioButton {
    return node instanceof RadioButton;
}

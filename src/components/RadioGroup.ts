import * as shadyCss from '@webcomponents/shadycss';
import { isArrowKey, KeyCode } from '../util/KeyCode';
import { RadioButton } from './RadioButton';
import { createEvent } from '../util/EventUtils';
import { arrayFind, isElement, noOp } from '../util/CommonUtils';
import './RadioButton';
import { StateReceiverMixin } from './StateReceiverMixin';
import { Attribute } from '../util/Attribute';
import type { DeviceType } from '../util/DeviceType';
import { navigateByArrowKey } from '../util/KeyboardNavigation';

const radioGroupTemplate = document.createElement('template');
radioGroupTemplate.innerHTML = `<slot></slot>`;
shadyCss.prepareTemplate(radioGroupTemplate, 'theoplayer-radio-group');

/**
 * `<theoplayer-radio-group>` - A group of {@link RadioButton}s. At most one button in the group can be checked.
 *
 * ## Behavior
 * This radio group implements the [roving tabindex](https://www.w3.org/WAI/ARIA/apg/example-index/radio/radio.html) pattern.
 *  - `Tab` moves focus in or out of the radio group.
 *  - `Up`/`Left` arrow moves focus to the previous radio button.
 *  - `Down`/`Right` arrow moves focus to the next radio button.
 *  - `Home` moves focus to the first radio button.
 *  - `End` moves focus to the last radio button.
 *
 * @group Components
 */
// Based on howto-radio-group
// https://github.com/GoogleChromeLabs/howto-components/blob/079d0fa34ff9038b26ea8883b1db5dd6b677d7ba/elements/howto-radio-group/howto-radio-group.js
export class RadioGroup extends StateReceiverMixin(HTMLElement, ['deviceType']) {
    private _slot: HTMLSlotElement;
    private _radioButtons: RadioButton[] = [];

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(radioGroupTemplate.content.cloneNode(true));

        this._slot = shadowRoot.querySelector('slot')!;
        this._upgradeProperty('deviceType');
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

    get deviceType(): DeviceType {
        return (this.getAttribute(Attribute.DEVICE_TYPE) || 'desktop') as DeviceType;
    }

    set deviceType(deviceType: DeviceType) {
        this.setAttribute(Attribute.DEVICE_TYPE, deviceType);
    }

    private readonly _onSlotChange = () => {
        const children = this._slot.assignedNodes({ flatten: true }).filter(isElement);
        for (const child of children) {
            if (!isRadioButton(child)) {
                // Upgrade custom elements if needed
                const childName = child.nodeName.toLowerCase();
                if (childName.indexOf('-') >= 0) {
                    if (customElements.get(childName)) {
                        customElements.upgrade(child);
                    } else {
                        customElements.whenDefined(childName).then(this._onSlotChange, noOp);
                    }
                }
            }
        }
        this._radioButtons = children.filter(isRadioButton);

        let firstFocusedButton = this.focusedRadioButton;
        if (!firstFocusedButton) {
            this.firstRadioButton?.setAttribute('tabindex', '0');
        }
    };

    private readonly _onKeyDown = (event: KeyboardEvent) => {
        if (this.deviceType === 'tv' && isArrowKey(event.keyCode)) {
            if (navigateByArrowKey(this, this._radioButtons, event.keyCode)) {
                event.preventDefault();
                event.stopPropagation();
            }
            return;
        }
        switch (event.keyCode) {
            case KeyCode.UP:
            case KeyCode.LEFT: {
                if (this._focusPrevButton()) {
                    event.preventDefault();
                }
                break;
            }
            case KeyCode.DOWN:
            case KeyCode.RIGHT: {
                if (this._focusNextButton()) {
                    event.preventDefault();
                }
                break;
            }
            case KeyCode.HOME: {
                event.preventDefault();
                this.setFocusedRadioButton(this.firstRadioButton);
                break;
            }
            case KeyCode.END: {
                event.preventDefault();
                this.setFocusedRadioButton(this.lastRadioButton);
                break;
            }
            default: {
                break;
            }
        }
    };

    get focusedRadioButton(): RadioButton | null {
        return arrayFind(this._radioButtons, (button) => button.tabIndex === 0) ?? null;
    }

    get checkedRadioButton(): RadioButton | null {
        return arrayFind(this._radioButtons, (button) => button.checked) ?? null;
    }

    get firstRadioButton(): RadioButton | null {
        return this._radioButtons[0] ?? null;
    }

    get lastRadioButton(): RadioButton | null {
        const radioButtons = this._radioButtons;
        return radioButtons.length > 0 ? radioButtons[radioButtons.length - 1] : null;
    }

    allRadioButtons(): readonly RadioButton[] {
        return this._radioButtons;
    }

    private _prevRadioButton(node: RadioButton): RadioButton | null {
        const index = this._radioButtons.indexOf(node);
        if (index > 0) {
            return this._radioButtons[index - 1];
        }
        return null;
    }

    private _nextRadioButton(node: RadioButton): RadioButton | null {
        const index = this._radioButtons.indexOf(node);
        if (index >= 0 && index < this._radioButtons.length - 1) {
            return this._radioButtons[index + 1];
        }
        return null;
    }

    private _focusPrevButton(): boolean {
        let focusedButton = this.focusedRadioButton || this.firstRadioButton;
        if (!focusedButton) {
            return false;
        }
        if (focusedButton === this.firstRadioButton) {
            this.setFocusedRadioButton(this.lastRadioButton);
        } else {
            this.setFocusedRadioButton(this._prevRadioButton(focusedButton));
        }
        return true;
    }

    private _focusNextButton(): boolean {
        let focusedButton = this.focusedRadioButton || this.firstRadioButton;
        if (!focusedButton) {
            return false;
        }
        if (focusedButton === this.lastRadioButton) {
            this.setFocusedRadioButton(this.firstRadioButton);
        } else {
            this.setFocusedRadioButton(this._nextRadioButton(focusedButton));
        }
        return true;
    }

    setFocusedRadioButton(button: RadioButton | null): void {
        this._unfocusAll();
        if (button) {
            button.tabIndex = 0;
            button.focus();
        }
    }

    private _unfocusAll(): void {
        for (const button of this.allRadioButtons()) {
            button.tabIndex = -1;
        }
    }

    setCheckedRadioButton(checkedButton: RadioButton | null): void {
        for (const button of this.allRadioButtons()) {
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

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-radio-group': RadioGroup;
    }
}

function isRadioButton(node: Node): node is RadioButton {
    return node instanceof RadioButton;
}

import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { isArrowKey, KeyCode } from '../util/KeyCode';
import { RadioButton } from './RadioButton';
import { createEvent } from '../util/EventUtils';
import { arrayFind, getSlottedElements, noOp, upgradeCustomElementIfNeeded } from '../util/CommonUtils';
import { stateReceiver } from './StateReceiverMixin';
import { Attribute } from '../util/Attribute';
import type { DeviceType } from '../util/DeviceType';
import { navigateByArrowKey } from '../util/KeyboardNavigation';

/**
 * A group of {@link RadioButton}s. At most one button in the group can be checked.
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
@customElement('theoplayer-radio-group')
@stateReceiver(['deviceType'])
export class RadioGroup extends LitElement {
    private readonly _slotRef: Ref<HTMLSlotElement> = createRef<HTMLSlotElement>();
    private _radioButtons: RadioButton[] = [];
    private _value: any = undefined;

    constructor() {
        super();
    }

    connectedCallback(): void {
        super.connectedCallback();

        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'radiogroup');
        }

        this.addEventListener('keydown', this._onKeyDown);
        this._onSlotChange();
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.removeEventListener('keydown', this._onKeyDown);
    }

    protected override firstUpdated(): void {
        this._onSlotChange();
    }

    protected override createRenderRoot(): HTMLElement | DocumentFragment {
        const root = super.createRenderRoot();
        root.addEventListener('change', this._onButtonChange);
        return root;
    }

    @property({ reflect: true, type: String, attribute: Attribute.DEVICE_TYPE })
    accessor deviceType: DeviceType = 'desktop';

    /**
     * The selected value.
     */
    get value(): any {
        return this._value;
    }

    @property({ attribute: Attribute.VALUE })
    set value(value: any) {
        if (this._value === value) {
            return;
        }
        this._value = value;
        this.updateCheckedButton();
        this.dispatchEvent(createEvent('change', { bubbles: true }));
    }

    private readonly _onSlotChange = () => {
        const slot = this._slotRef.value;
        if (!slot) return;
        const children = getSlottedElements(slot);
        const upgradePromises: Array<Promise<unknown>> = [];
        for (const child of children) {
            if (!isRadioButton(child)) {
                const promise = upgradeCustomElementIfNeeded(child);
                if (promise) {
                    upgradePromises.push(promise);
                }
            }
        }
        if (upgradePromises.length > 0) {
            Promise.all(upgradePromises).then(this._onSlotChange, noOp);
        }

        this._radioButtons = children.filter(isRadioButton);

        let firstFocusedButton = this.focusedRadioButton;
        if (!firstFocusedButton) {
            this.firstRadioButton?.setAttribute('tabindex', '0');
        }

        this.updateCheckedButton();
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

    private setFocusedRadioButton(button: RadioButton | null): void {
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

    private setCheckedRadioButton(checkedButton: RadioButton | null): void {
        for (const button of this.allRadioButtons()) {
            button.checked = button === checkedButton;
        }
    }

    private updateCheckedButton(): void {
        const button = this.allRadioButtons().find((button) => {
            // Allow '1' == 1
            return button.value == this.value;
        });
        this.setCheckedRadioButton(button ?? null);
    }

    private readonly _onButtonChange = (event: Event) => {
        const button = event.target as RadioButton | null;
        if (button !== null && button.checked) {
            this.value = button.value;
        }
    };

    protected override render(): HTMLTemplateResult {
        return html`<slot ${ref(this._slotRef)} @slotchange=${this._onSlotChange}></slot>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-radio-group': RadioGroup;
    }
}

function isRadioButton(node: Node): node is RadioButton {
    return node instanceof RadioButton;
}

import * as shadyCss from '@webcomponents/shadycss';
import { KeyCode } from '../util/KeyCode';

const radioGroupTemplate = document.createElement('template');
radioGroupTemplate.innerHTML = `<slot></slot>`;
shadyCss.prepareTemplate(radioGroupTemplate, 'theoplayer-radio-group');

/**
 * A radio group with roving tabindex.
 * - Tab moves focus in or out of the radio group.
 * - Up/Left arrow moves focus to the previous radio button.
 * - Down/Right arrow moves focus to the next radio button.
 * - Home moves focus to the first radio button.
 * - End moves focus to the last radio button.
 * See: https://www.w3.org/WAI/ARIA/apg/example-index/radio/radio.html
 *
 * Based on howto-radio-group
 * https://github.com/GoogleChromeLabs/howto-components/blob/079d0fa34ff9038b26ea8883b1db5dd6b677d7ba/elements/howto-radio-group/howto-radio-group.js
 */
export class RadioGroup extends HTMLElement {
    private _slot: HTMLSlotElement;

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
        this._slot.addEventListener('slotchange', this._onSlotChange);
        this._onSlotChange();
    }

    disconnectedCallback(): void {
        this.removeEventListener('keydown', this._onKeyDown);
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

    get focusedRadioButton(): HTMLElement | null {
        return this.querySelector('[role="radio"][tabindex="0"]');
    }

    get firstRadioButton(): HTMLElement | null {
        return this.querySelector('[role="radio"]');
    }

    get lastRadioButton(): HTMLElement | null {
        const radioButtons = this.allRadioButtons();
        return radioButtons.length > 0 ? radioButtons[radioButtons.length - 1] : null;
    }

    allRadioButtons(): NodeListOf<HTMLElement> {
        return this.querySelectorAll('[role="radio"]');
    }

    private _prevRadioButton(node: HTMLElement): HTMLElement | null {
        let prev = node.previousElementSibling as HTMLElement | null;
        while (prev) {
            if (isRadioButton(prev)) {
                return prev;
            }
            prev = prev.previousElementSibling as HTMLElement | null;
        }
        return null;
    }

    private _nextRadioButton(node: HTMLElement): HTMLElement | null {
        let next = node.nextElementSibling as HTMLElement | null;
        while (next) {
            if (isRadioButton(next)) {
                return next;
            }
            next = next.nextElementSibling as HTMLElement | null;
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

    setFocusedRadioButton(node: HTMLElement | null): void {
        this._uncheckAll();
        if (node) {
            node.tabIndex = 0;
            node.focus();
        }
    }

    private _uncheckAll(): void {
        const radioButtons = this.allRadioButtons();
        for (let i = 0; i < radioButtons.length; i++) {
            const btn = radioButtons[i];
            btn.tabIndex = -1;
        }
    }
}

customElements.define('theoplayer-radio-group', RadioGroup);

function isRadioButton(node: Element): boolean {
    return node.getAttribute('role') === 'radio';
}

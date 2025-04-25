import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { RadioGroup } from './RadioGroup';
import verticalRadioGroupCss from './VerticalRadioGroup.css';
import { stateReceiver } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import type { RadioButton } from './RadioButton';
import { createEvent } from '../util/EventUtils';

/**
 * `<theoplayer-playback-rate-radio-group>` - A radio group that shows a list of playback rates,
 * from which the user can choose a desired playback rate.
 *
 * @slot {@link RadioButton} - The possible options for the playback rate.
 *   The value of each radio button must be a valid number.
 *   For example: `<theoplayer-radio-button value="2">2x</theoplayer-radio-button>`
 * @group Components
 */
@customElement('theoplayer-playback-rate-radio-group')
@stateReceiver(['player'])
export class PlaybackRateRadioGroup extends LitElement {
    static override styles = [verticalRadioGroupCss];

    private readonly _radioGroupRef: Ref<RadioGroup> = createRef<RadioGroup>();
    private _player: ChromelessPlayer | undefined;
    private _value: number = 1;

    protected override firstUpdated(): void {
        this._updateChecked();
    }

    /**
     * The currently chosen playback rate.
     */
    get value(): number {
        return this._value;
    }

    @state()
    set value(value: number) {
        value = Number(value);
        if (this._value === value) {
            return;
        }
        this._value = value;
        if (this._player !== undefined) {
            this._player.playbackRate = value;
        }
        this._updateChecked();
        this.dispatchEvent(createEvent('change', { bubbles: true }));
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @state()
    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._player.removeEventListener('ratechange', this._updateFromPlayer);
        }
        this._player = player;
        this._updateFromPlayer();
        if (this._player !== undefined) {
            this._player.addEventListener('ratechange', this._updateFromPlayer);
        }
    }

    private get radioGroup_(): RadioGroup | undefined {
        const radioGroup = this._radioGroupRef.value;
        if (radioGroup && !(radioGroup instanceof RadioGroup)) {
            customElements.upgrade(radioGroup);
        }
        return radioGroup;
    }

    private readonly _updateChecked = (): void => {
        const buttons = this.radioGroup_?.allRadioButtons() ?? [];
        for (const button of buttons) {
            button.checked = Number(button.value) === this.value;
        }
    };

    private readonly _onChange = (): void => {
        const button = this.radioGroup_?.checkedRadioButton;
        if (button && this.value !== Number(button.value)) {
            this.value = button.value;
        }
    };

    private readonly _updateFromPlayer = (): void => {
        if (this._player !== undefined) {
            this.value = this._player.playbackRate;
        }
    };

    protected override render(): HTMLTemplateResult {
        return html`<theoplayer-radio-group ${ref(this._radioGroupRef)} @change=${this._onChange}
            ><slot @slotchange=${this._updateChecked}></slot
        ></theoplayer-radio-group>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-playback-rate-radio-group': PlaybackRateRadioGroup;
    }
}

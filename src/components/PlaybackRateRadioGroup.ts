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
 * A radio group that shows a list of playback rates,
 * from which the user can choose a desired playback rate.
 *
 * @slot {@link RadioButton} - The possible options for the playback rate.
 *   The value of each radio button must be a valid number.
 *   For example: `<theoplayer-radio-button value="2">2x</theoplayer-radio-button>`
 */
@customElement('theoplayer-playback-rate-radio-group')
@stateReceiver(['player'])
export class PlaybackRateRadioGroup extends LitElement {
    static override styles = [verticalRadioGroupCss];

    private readonly _radioGroupRef: Ref<RadioGroup> = createRef<RadioGroup>();
    private _player: ChromelessPlayer | undefined;
    private _value: number = 1;

    protected override firstUpdated(): void {
        const radioGroup = this._radioGroupRef.value!;
        if (!(radioGroup instanceof RadioGroup)) {
            customElements.upgrade(radioGroup);
        }
        radioGroup.value = String(this.value);
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
        const radioGroup = this._radioGroupRef.value;
        if (radioGroup) {
            radioGroup.value = String(value);
        }
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

    private readonly _onChange = (): void => {
        const radioGroup = this._radioGroupRef.value;
        if (!radioGroup) return;
        this.value = Number(radioGroup.value);
    };

    private readonly _updateFromPlayer = (): void => {
        if (this._player !== undefined) {
            this.value = this._player.playbackRate;
        }
    };

    protected override render(): HTMLTemplateResult {
        return html`<theoplayer-radio-group ${ref(this._radioGroupRef)} @change=${this._onChange}><slot></slot></theoplayer-radio-group>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-playback-rate-radio-group': PlaybackRateRadioGroup;
    }
}

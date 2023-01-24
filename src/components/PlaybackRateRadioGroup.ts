import * as shadyCss from '@webcomponents/shadycss';
import type { RadioGroup } from './RadioGroup';
import verticalRadioGroupCss from './VerticalRadioGroup.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer';
import { Attribute } from '../util/Attribute';
import { fromArrayLike } from '../util/CommonUtils';
import { PlaybackRateRadioButton } from './PlaybackRateRadioButton';
import './RadioGroup';

const template = document.createElement('template');
template.innerHTML = `<style>${verticalRadioGroupCss}</style><theoplayer-radio-group></theoplayer-radio-group>`;
shadyCss.prepareTemplate(template, 'theoplayer-playback-rate-radio-group');

const DEFAULT_PLAYBACK_RATES: readonly number[] = [0.25, 0.5, 1, 1.25, 1.5, 2];

export class PlaybackRateRadioGroup extends StateReceiverMixin(HTMLElement, ['player']) {
    static get observedAttributes() {
        return [Attribute.VALUES];
    }

    private readonly _radioGroup: RadioGroup;
    private _player: ChromelessPlayer | undefined;
    private _values: number[] = [...DEFAULT_PLAYBACK_RATES];

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._radioGroup = shadowRoot.querySelector('theoplayer-radio-group')!;
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        this._upgradeProperty('values');
        this._upgradeProperty('player');

        this._update();
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    get values(): number[] {
        return this._values;
    }

    set values(value: number[]) {
        this.setAttribute(Attribute.VALUES, value.join(','));
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._player.removeEventListener('ratechange', this._update);
        }
        this._player = player;
        this._update();
        if (this._player !== undefined) {
            this._player.addEventListener('ratechange', this._update);
        }
    }

    setPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
    }

    private readonly _update = (): void => {
        const buttons = fromArrayLike(this._radioGroup.children) as PlaybackRateRadioButton[];
        const values = this._values;
        let i = 0;
        while (i < buttons.length && i < values.length) {
            buttons[i].value = values[i];
            i++;
        }
        while (i < buttons.length) {
            this._radioGroup.removeChild(buttons[i]);
            i++;
        }
        while (i < values.length) {
            const newButton = new PlaybackRateRadioButton();
            newButton.value = values[i];
            this._radioGroup.appendChild(newButton);
            i++;
        }
    };

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (newValue === oldValue) {
            return;
        }
        if (attrName === Attribute.VALUES) {
            this._values = newValue
                ? String(newValue)
                      .split(',')
                      .map((x) => Number(x))
                : [...DEFAULT_PLAYBACK_RATES];
            this._update();
        }
        if (PlaybackRateRadioGroup.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-playback-rate-radio-group', PlaybackRateRadioGroup);

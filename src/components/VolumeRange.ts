import * as shadyCss from '@webcomponents/shadycss';
import { Range, rangeTemplate } from './Range';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer';

const template = document.createElement('template');
template.innerHTML = rangeTemplate(`<input type="range" min="0" max="1" step="any" value="0">`);
shadyCss.prepareTemplate(template, 'theoplayer-volume-range');

function formatAsPercentString(value: number, max: number) {
    return `${Math.round((value / max) * 100)}%`;
}

/**
 * A volume slider, showing the current audio volume of the player, and which changes the volume when clicked or dragged.
 */
export class VolumeRange extends StateReceiverMixin(Range, ['player']) {
    private _player: ChromelessPlayer | undefined;

    constructor() {
        super({ template });
    }

    override connectedCallback() {
        super.connectedCallback();
        this._upgradeProperty('player');
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._player.removeEventListener('volumechange', this._updateFromPlayer);
        }
        this._player = player;
        this._updateFromPlayer();
        if (this._player !== undefined) {
            this._player.addEventListener('volumechange', this._updateFromPlayer);
        }
    }

    private readonly _updateFromPlayer = () => {
        if (this._player !== undefined) {
            this.value = this._player.volume;
        }
    };

    protected override getAriaLabel(): string {
        return 'volume';
    }

    protected override getAriaValueText(): string {
        return formatAsPercentString(this.value, this.max);
    }

    protected override handleInput(): void {
        if (this._player !== undefined && this._player.volume !== this.value) {
            this._player.volume = this.value;
        }
        super.handleInput();
    }
}

customElements.define('theoplayer-volume-range', VolumeRange);

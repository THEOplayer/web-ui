import { Range } from './Range';
import { customElement, property } from 'lit/decorators.js';
import { stateReceiver } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer/chromeless';

function formatAsPercentString(value: number, max: number) {
    return `${Math.round((value / max) * 100)}%`;
}

/**
 * `<theoplayer-volume-range>` - A volume slider, showing the current audio volume of the player,
 * and which changes the volume when clicked or dragged.
 *
 * @group Components
 */
@customElement('theoplayer-volume-range')
@stateReceiver(['player', 'deviceType'])
export class VolumeRange extends Range {
    private _player: ChromelessPlayer | undefined;

    constructor() {
        super();
        this.min = 0;
        this.max = 1;
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
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

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-volume-range': VolumeRange;
    }
}

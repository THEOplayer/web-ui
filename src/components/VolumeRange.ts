import * as shadyCss from '@webcomponents/shadycss';
import { Range } from './Range';
import { PlayerReceiverMixin } from './PlayerReceiverMixin';
import { ChromelessPlayer } from 'theoplayer';
import rangeCss from './Range.css';

const template = document.createElement('template');
template.innerHTML = `<style>${rangeCss}</style>
<input type="range" min="0" max="1" step="any" value="0">`;
shadyCss.prepareTemplate(template, 'theoplayer-volume-range');

function formatAsPercentString(value: number, max: number) {
    return `${Math.round((value / max) * 100)}%`;
}

export class VolumeRange extends PlayerReceiverMixin(Range) {
    private _player: ChromelessPlayer | undefined;

    constructor() {
        super({ template });
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

    attachPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
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
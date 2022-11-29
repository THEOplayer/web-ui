import * as shadyCss from '@webcomponents/shadycss';
import { Range } from './Range';
import { PlayerReceiverMixin } from './PlayerReceiverMixin';
import { ChromelessPlayer } from 'theoplayer';
import rangeCss from './Range.css';
import { formatAsTimePhrase } from '../util/TimeUtils';

const template = document.createElement('template');
template.innerHTML = `<style>${rangeCss}</style>
<input type="range" min="0" max="1000" step="any" value="0">`;
shadyCss.prepareTemplate(template, 'theoplayer-time-range');

const PLAYER_EVENTS = ['timeupdate', 'durationchange', 'seeking', 'seeked'] as const;
const DEFAULT_MISSING_TIME_PHRASE = 'video not loaded, unknown time';

export class TimeRange extends PlayerReceiverMixin(Range) {
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
            this._player.removeEventListener(PLAYER_EVENTS, this._updateFromPlayer);
        }
        this._player = player;
        this._updateFromPlayer();
        if (this._player !== undefined) {
            this._player.addEventListener(PLAYER_EVENTS, this._updateFromPlayer);
        }
    }

    attachPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
    }

    private readonly _updateFromPlayer = () => {
        if (this._player !== undefined) {
            this.value = this._player.currentTime;
        }
    };

    protected override getAriaLabel(): string {
        return 'seek';
    }

    protected override getAriaValueText(): string {
        const currentTimePhrase = formatAsTimePhrase(this.value);
        const totalTimePhrase = formatAsTimePhrase(this.max);
        if (currentTimePhrase && totalTimePhrase) {
            return `${currentTimePhrase} of ${totalTimePhrase}`;
        }
        return DEFAULT_MISSING_TIME_PHRASE;
    }

    protected override update(): void {
        if (this._player !== undefined && this._player.currentTime !== this.value) {
            this._player.currentTime = this.value;
        }
        super.update();
    }
}

customElements.define('theoplayer-time-range', TimeRange);

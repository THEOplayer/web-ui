import * as shadyCss from '@webcomponents/shadycss';
import { Button, buttonTemplate } from './Button';
import type { ChromelessPlayer } from 'theoplayer';
import playButtonCss from './PlayButton.css';
import playIcon from '../icons/play.svg';
import pauseIcon from '../icons/pause.svg';
import replayIcon from '../icons/replay.svg';
import { StateReceiverMixin } from './StateReceiverMixin';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(
    `<span part="play-icon"><slot name="play-icon">${playIcon}</slot></span>` +
        `<span part="pause-icon"><slot name="pause-icon">${pauseIcon}</slot></span>` +
        `<span part="replay-icon"><slot name="replay-icon">${replayIcon}</slot></span>`,
    playButtonCss
);
shadyCss.prepareTemplate(template, 'theoplayer-play-button');

const ATTR_PAUSED = 'paused';
const ATTR_ENDED = 'ended';

const PLAYER_EVENTS = ['play', 'pause', 'ended'] as const;

export class PlayButton extends StateReceiverMixin(Button, ['player']) {
    static get observedAttributes() {
        return [...Button.observedAttributes, ATTR_PAUSED];
    }

    private _player: ChromelessPlayer | undefined;

    constructor() {
        super({ template });
    }

    connectedCallback(): void {
        super.connectedCallback();
        this._upgradeProperty('paused');
        this._upgradeProperty('ended');
        this._upgradeProperty('player');
        this._updateFromPlayer();
    }

    get paused(): boolean {
        return this.hasAttribute(ATTR_PAUSED);
    }

    set paused(paused: boolean) {
        if (paused) {
            this.setAttribute(ATTR_PAUSED, '');
        } else {
            this.removeAttribute(ATTR_PAUSED);
        }
    }

    get ended(): boolean {
        return this.hasAttribute(ATTR_ENDED);
    }

    set ended(ended: boolean) {
        if (ended) {
            this.setAttribute(ATTR_ENDED, '');
        } else {
            this.removeAttribute(ATTR_ENDED);
        }
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

    setPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
    }

    private readonly _updateFromPlayer = () => {
        if (this._player !== undefined) {
            this.paused = this._player.paused;
            this.ended = this._player.ended;
        } else {
            this.paused = true;
            this.ended = false;
        }
    };

    protected override handleClick() {
        if (this._player !== undefined) {
            if (this._player.paused) {
                this._player.play();
            } else {
                this._player.pause();
            }
        }
    }
}

customElements.define('theoplayer-play-button', PlayButton);

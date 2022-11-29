import * as shadyCss from '@webcomponents/shadycss';
import { Button } from './Button';
import { ChromelessPlayer } from 'theoplayer';
import buttonCss from './Button.css';
import playButtonCss from './PlayButton.css';
import playIcon from '../icons/play.svg';
import pauseIcon from '../icons/pause.svg';
import replayIcon from '../icons/replay.svg';
import { PlayerReceiverMixin } from './PlayerReceiverMixin';

const template = document.createElement('template');
template.innerHTML = `<style>${buttonCss}\n${playButtonCss}</style>
<div part="play-icon"><slot name="play-icon">${playIcon}</slot></div>
<div part="pause-icon"><slot name="pause-icon">${pauseIcon}</slot></div>
<div part="replay-icon"><slot name="replay-icon">${replayIcon}</slot></div>`;
shadyCss.prepareTemplate(template, 'theoplayer-play-button');

const ATTR_PAUSED = 'paused';
const ATTR_ENDED = 'ended';

export class PlayButton extends PlayerReceiverMixin(Button) {
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
            this._player.removeEventListener('play', this._updateFromPlayer);
            this._player.removeEventListener('pause', this._updateFromPlayer);
            this._player.removeEventListener('ended', this._updateFromPlayer);
        }
        this._player = player;
        this._updateFromPlayer();
        if (this._player !== undefined) {
            this._player.addEventListener('play', this._updateFromPlayer);
            this._player.addEventListener('pause', this._updateFromPlayer);
            this._player.addEventListener('ended', this._updateFromPlayer);
        }
    }

    attachPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
    }

    private readonly _updateFromPlayer = () => {
        if (this._player !== undefined) {
            this.paused = this._player.paused;
            this.ended = this._player.ended;
        }
    };

    protected override handleClick() {
        this.paused = !this.paused;
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any): void {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (attrName === ATTR_PAUSED && newValue !== oldValue) {
            const hasValue = newValue != null;
            if (this._player !== undefined && hasValue !== this._player.paused) {
                if (hasValue) {
                    this._player.pause();
                } else {
                    this._player.play();
                }
            }
        }
    }
}

customElements.define('theoplayer-play-button', PlayButton);

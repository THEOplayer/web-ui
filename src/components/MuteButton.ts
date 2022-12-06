import * as shadyCss from '@webcomponents/shadycss';
import { Button, buttonTemplate } from './Button';
import { ChromelessPlayer } from 'theoplayer';
import muteButtonCss from './MuteButton.css';
import offIcon from '../icons/volume-off.svg';
import highIcon from '../icons/volume-high.svg';
import { PlayerReceiverMixin } from './PlayerReceiverMixin';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(
    `<span part="off-icon"><slot name="off-icon">${offIcon}</slot></span>` +
        `<span part="volume-icon"><slot name="volume-icon">${highIcon}</slot></span>`,
    muteButtonCss
);
shadyCss.prepareTemplate(template, 'theoplayer-mute-button');

const ATTR_MUTED = 'muted';

const PLAYER_EVENTS = ['volumechange'] as const;

export class MuteButton extends PlayerReceiverMixin(Button) {
    static get observedAttributes() {
        return [...Button.observedAttributes, ATTR_MUTED];
    }

    private _player: ChromelessPlayer | undefined;

    constructor() {
        super({ template });
    }

    connectedCallback(): void {
        super.connectedCallback();
        this._upgradeProperty('muted');
    }

    get muted(): boolean {
        return this.hasAttribute(ATTR_MUTED);
    }

    set muted(paused: boolean) {
        if (paused) {
            this.setAttribute(ATTR_MUTED, '');
        } else {
            this.removeAttribute(ATTR_MUTED);
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

    attachPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
    }

    private readonly _updateFromPlayer = () => {
        if (this._player !== undefined) {
            this.muted = this._player.muted;
        }
    };

    protected override handleClick() {
        this.muted = !this.muted;
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any): void {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (attrName === ATTR_MUTED && newValue !== oldValue) {
            const hasValue = newValue != null;
            if (this._player !== undefined && hasValue !== this._player.muted) {
                this._player.muted = hasValue;
            }
        }
    }
}

customElements.define('theoplayer-mute-button', MuteButton);

import * as shadyCss from '@webcomponents/shadycss';
import { Button, buttonTemplate } from './Button';
import type { ChromelessPlayer } from 'theoplayer';
import muteButtonCss from './MuteButton.css';
import offIcon from '../icons/volume-off.svg';
import lowIcon from '../icons/volume-low.svg';
import highIcon from '../icons/volume-high.svg';
import { StateReceiverMixin } from './StateReceiverMixin';
import { Attribute } from '../util/Attribute';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(
    `<span part="off-icon"><slot name="off-icon">${offIcon}</slot></span>` +
        `<span part="low-icon"><slot name="low-icon">${lowIcon}</slot></span>` +
        `<span part="high-icon"><slot name="high-icon">${highIcon}</slot></span>`,
    muteButtonCss
);
shadyCss.prepareTemplate(template, 'theoplayer-mute-button');

export type VolumeLevel = 'off' | 'low' | 'high';

const PLAYER_EVENTS = ['volumechange'] as const;

export class MuteButton extends StateReceiverMixin(Button, ['player']) {
    static get observedAttributes() {
        return [...Button.observedAttributes, Attribute.VOLUME_LEVEL];
    }

    private _player: ChromelessPlayer | undefined;

    constructor() {
        super({ template });
    }

    connectedCallback(): void {
        super.connectedCallback();
        this._upgradeProperty('volumeLevel');
        this._upgradeProperty('player');
        this._updateFromPlayer();
    }

    get volumeLevel(): VolumeLevel {
        return (this.getAttribute(Attribute.VOLUME_LEVEL) as VolumeLevel | null) || 'off';
    }

    set volumeLevel(level: VolumeLevel) {
        if (level) {
            this.setAttribute(Attribute.VOLUME_LEVEL, level);
        } else {
            this.removeAttribute(Attribute.VOLUME_LEVEL);
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
            const volume = this._player.volume;
            const muted = this._player.muted;
            if (muted) {
                this.volumeLevel = 'off';
            } else if (volume < 0.5) {
                this.volumeLevel = 'low';
            } else {
                this.volumeLevel = 'high';
            }
        } else {
            this.volumeLevel = 'off';
        }
    };

    protected override handleClick() {
        if (this._player !== undefined) {
            this._player.muted = !this._player.muted;
            this._updateFromPlayer();
        }
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (MuteButton.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-mute-button', MuteButton);

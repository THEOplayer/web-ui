import * as shadyCss from '@webcomponents/shadycss';
import { Button, buttonTemplate } from './Button';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import muteButtonCss from './MuteButton.css';
import offIcon from '../icons/volume-off.svg';
import lowIcon from '../icons/volume-low.svg';
import highIcon from '../icons/volume-high.svg';
import { StateReceiverMixin } from './StateReceiverMixin';
import { Attribute } from '../util/Attribute';
import { createTemplate } from '../util/TemplateUtils';

const template = createTemplate(
    'theoplayer-mute-button',
    buttonTemplate(
        `<span part="off-icon"><slot name="off-icon">${offIcon}</slot></span>` +
            `<span part="low-icon"><slot name="low-icon">${lowIcon}</slot></span>` +
            `<span part="high-icon"><slot name="high-icon">${highIcon}</slot></span>`,
        muteButtonCss
    )
);

export type VolumeLevel = 'off' | 'low' | 'high';

const PLAYER_EVENTS = ['volumechange'] as const;

/**
 * `<theoplayer-mute-button>` - A button that toggles whether audio is muted or not.
 *
 * @attribute `volume-level` (readonly) - The volume level of the player.
 *   Can be "off" (muted), "low" (volume < 50%) or "high" (volume >= 50%).
 * @group Components
 */
export class MuteButton extends StateReceiverMixin(Button, ['player']) {
    static get observedAttributes() {
        return [...Button.observedAttributes, Attribute.VOLUME_LEVEL];
    }

    private _player: ChromelessPlayer | undefined;

    constructor() {
        super({ template });
        this._upgradeProperty('player');
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this._updateFromPlayer();
        this._updateAriaLabel();
    }

    /**
     * The volume level of the player.
     */
    get volumeLevel(): VolumeLevel {
        return (this.getAttribute(Attribute.VOLUME_LEVEL) as VolumeLevel | null) || 'off';
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

    private readonly _updateFromPlayer = () => {
        let volumeLevel: VolumeLevel = 'off';
        if (this._player !== undefined) {
            const volume = this._player.volume;
            const muted = this._player.muted;
            if (muted) {
                volumeLevel = 'off';
            } else if (volume < 0.5) {
                volumeLevel = 'low';
            } else {
                volumeLevel = 'high';
            }
        }
        this.setAttribute(Attribute.VOLUME_LEVEL, volumeLevel);
    };

    protected override handleClick() {
        if (this._player !== undefined) {
            this._player.muted = !this._player.muted;
            this._updateFromPlayer();
        }
    }

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (MuteButton.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
            this._updateAriaLabel();
        }
    }

    private _updateAriaLabel(): void {
        const label = this.getAttribute(Attribute.VOLUME_LEVEL) === 'off' ? 'unmute' : 'mute';
        this.setAttribute(Attribute.ARIA_LABEL, label);
    }
}

customElements.define('theoplayer-mute-button', MuteButton);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-mute-button': MuteButton;
    }
}

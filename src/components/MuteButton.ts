import { html, type HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { Button } from './Button';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import muteButtonCss from './MuteButton.css';
import offIcon from '../icons/volume-off.svg';
import lowIcon from '../icons/volume-low.svg';
import highIcon from '../icons/volume-high.svg';
import { stateReceiver } from './StateReceiverMixin';
import { Attribute } from '../util/Attribute';

export type VolumeLevel = 'off' | 'low' | 'high';

const PLAYER_EVENTS = ['volumechange'] as const;

/**
 * A button that toggles whether audio is muted or not.
 *
 * @attribute `volume-level` (readonly) - The volume level of the player.
 *   Can be "off" (muted), "low" (volume < 50%) or "high" (volume >= 50%).
 * @group Components
 */
@customElement('theoplayer-mute-button')
@stateReceiver(['player'])
export class MuteButton extends Button {
    static styles = [...Button.styles, muteButtonCss];

    private _player: ChromelessPlayer | undefined;

    override connectedCallback(): void {
        super.connectedCallback();
        this._updateFromPlayer();
        this._updateAriaLabel();
    }

    /**
     * The volume level of the player.
     */
    @property({ reflect: true, state: true, type: String, attribute: Attribute.VOLUME_LEVEL })
    accessor volumeLevel: VolumeLevel = 'off';

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
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

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (MuteButton.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            this._updateAriaLabel();
        }
    }

    private _updateAriaLabel(): void {
        const label = this.volumeLevel === 'off' ? 'unmute' : 'mute';
        this.setAttribute(Attribute.ARIA_LABEL, label);
    }

    protected override render(): HTMLTemplateResult {
        return html`<span part="off-icon"><slot name="off-icon">${unsafeSVG(offIcon)}</slot></span
            ><span part="low-icon"><slot name="low-icon">${unsafeSVG(lowIcon)}</slot></span
            ><span part="high-icon"><slot name="high-icon">${unsafeSVG(highIcon)}</slot></span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-mute-button': MuteButton;
    }
}

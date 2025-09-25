import { html, type HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { Button } from './Button';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import playButtonCss from './PlayButton.css';
import playIcon from '../icons/play.svg';
import pauseIcon from '../icons/pause.svg';
import replayIcon from '../icons/replay.svg';
import { stateReceiver } from './StateReceiverMixin';
import { Attribute } from '../util/Attribute';

const PLAYER_EVENTS = ['seeking', 'seeked', 'ended', 'emptied', 'sourcechange'] as const;

/**
 * A button that toggles whether the player is playing or paused.
 *
 * @attribute `paused` (readonly) - Whether the player is paused. Reflects `ui.player.paused`.
 * @attribute `ended` (readonly) - Whether the player is ended. Reflects `ui.player.ended`.
 * @group Components
 */
@customElement('theoplayer-play-button')
@stateReceiver(['player'])
export class PlayButton extends Button {
    static styles = [...Button.styles, playButtonCss];

    private _player: ChromelessPlayer | undefined;

    override connectedCallback(): void {
        super.connectedCallback();
        this._updateFromPlayer();
        this._updateAriaLabel();
    }

    @property({ reflect: true, state: true, type: Boolean, attribute: Attribute.PAUSED })
    accessor paused: boolean = false;

    @property({ reflect: true, state: true, type: Boolean, attribute: Attribute.ENDED })
    accessor ended: boolean = false;

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._player.removeEventListener('play', this._onPlay);
            this._player.removeEventListener('pause', this._onPause);
            this._player.removeEventListener(PLAYER_EVENTS, this._updateFromPlayer);
        }
        this._player = player;
        this._updateFromPlayer();
        if (this._player !== undefined) {
            this._player.addEventListener('play', this._onPlay);
            this._player.addEventListener('pause', this._onPause);
            this._player.addEventListener(PLAYER_EVENTS, this._updateFromPlayer);
        }
    }

    private readonly _onPlay = (): void => {
        this.paused = false;
        this._updateEnded();
    };

    private readonly _onPause = (): void => {
        this.paused = true;
        this._updateEnded();
    };

    private readonly _updateFromPlayer = (): void => {
        this.paused = this._player?.paused ?? true;
        this._updateEnded();
        this._updateDisabled();
    };

    private _updateEnded(): void {
        this.ended = this._player?.ended ?? false;
    }

    private readonly _updateDisabled = () => {
        this.disabled = this._player?.source === undefined;
    };

    protected override handleClick() {
        if (this._player !== undefined) {
            if (this._player.source === undefined) {
                // Do nothing if the player has no source.
                return;
            }
            if (this._player.paused) {
                this._player.play();
            } else {
                this._player.pause();
            }
        }
    }

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (PlayButton.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            this._updateAriaLabel();
        }
    }

    private _updateAriaLabel(): void {
        const label = this.ended ? 'replay' : this.paused ? 'play' : 'pause';
        this.setAttribute(Attribute.ARIA_LABEL, label);
    }

    protected override render(): HTMLTemplateResult {
        return html`
            <span part="play-icon"><slot name="play-icon">${unsafeSVG(playIcon)}</slot></span>
            <span part="pause-icon"><slot name="pause-icon">${unsafeSVG(pauseIcon)}</slot></span>
            <span part="replay-icon"><slot name="replay-icon">${unsafeSVG(replayIcon)}</slot></span>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-play-button': PlayButton;
    }
}

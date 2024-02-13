import * as shadyCss from '@webcomponents/shadycss';
import { Button, buttonTemplate } from './Button';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import playButtonCss from './PlayButton.css';
import playIcon from '../icons/play.svg';
import pauseIcon from '../icons/pause.svg';
import replayIcon from '../icons/replay.svg';
import { StateReceiverMixin } from './StateReceiverMixin';
import { Attribute } from '../util/Attribute';
import { toggleAttribute } from '../util/CommonUtils';
import { createTemplate } from '../util/TemplateUtils';

const template = createTemplate(
    'theoplayer-play-button',
    buttonTemplate(
        `<span part="play-icon"><slot name="play-icon">${playIcon}</slot></span>` +
            `<span part="pause-icon"><slot name="pause-icon">${pauseIcon}</slot></span>` +
            `<span part="replay-icon"><slot name="replay-icon">${replayIcon}</slot></span>`,
        playButtonCss
    )
);

const PLAYER_EVENTS = ['seeking', 'seeked', 'ended', 'emptied', 'sourcechange'] as const;

/**
 * `<theoplayer-play-button>` - A button that toggles whether the player is playing or paused.
 *
 * @attribute `paused` (readonly) - Whether the player is paused. Reflects `ui.player.paused`.
 * @attribute `ended` (readonly) - Whether the player is ended. Reflects `ui.player.ended`.
 * @group Components
 */
export class PlayButton extends StateReceiverMixin(Button, ['player']) {
    static get observedAttributes() {
        return [...Button.observedAttributes, Attribute.PAUSED, Attribute.ENDED];
    }

    private _player: ChromelessPlayer | undefined;

    constructor() {
        super({ template });
        this._upgradeProperty('paused');
        this._upgradeProperty('ended');
        this._upgradeProperty('player');
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this._updateFromPlayer();
        this._updateAriaLabel();
    }

    get paused(): boolean {
        return this.hasAttribute(Attribute.PAUSED);
    }

    set paused(paused: boolean) {
        toggleAttribute(this, Attribute.PAUSED, paused);
    }

    get ended(): boolean {
        return this.hasAttribute(Attribute.ENDED);
    }

    set ended(ended: boolean) {
        toggleAttribute(this, Attribute.ENDED, ended);
    }

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
            shadyCss.styleSubtree(this);
            this._updateAriaLabel();
        }
    }

    private _updateAriaLabel(): void {
        const label = this.ended ? 'replay' : this.paused ? 'play' : 'pause';
        this.setAttribute(Attribute.ARIA_LABEL, label);
    }
}

customElements.define('theoplayer-play-button', PlayButton);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-play-button': PlayButton;
    }
}

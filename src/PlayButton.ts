import * as shadyCss from '@webcomponents/shadycss';
import { Button } from './Button';
import { ChromelessPlayer } from 'theoplayer';
import buttonCss from './Button.css';
import playButtonCss from './PlayButton.css';
import playButtonHtml from './PlayButton.html';
import { PlayerReceiverMixin } from './PlayerReceiverMixin';

const template = document.createElement('template');
template.innerHTML = `<style>${buttonCss}\n${playButtonCss}</style>${playButtonHtml}`;
shadyCss.prepareTemplate(template, 'theoplayer-play-button');

const ATTR_PAUSED = 'paused';

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

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player !== undefined) {
            this._player.removeEventListener('play', this.handlePlayPause);
            this._player.removeEventListener('pause', this.handlePlayPause);
        }
        this._player = player;
        if (this._player !== undefined) {
            this.paused = this._player.paused;
            this._player.addEventListener('play', this.handlePlayPause);
            this._player.addEventListener('pause', this.handlePlayPause);
        }
    }

    attachPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
    }

    private readonly handlePlayPause = () => {
        if (this._player !== undefined) {
            this.paused = this._player.paused;
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

import * as shadyCss from '@webcomponents/shadycss';
import { Button } from './Button';
import { ChromelessPlayer } from 'theoplayer';
import buttonCss from './Button.css';
import playButtonCss from './PlayButton.css';
import playButtonHtml from './PlayButton.html';

const template = document.createElement('template');
template.innerHTML = `<style>${buttonCss}\n${playButtonCss}</style>${playButtonHtml}`;
shadyCss.prepareTemplate(template, 'theoplayer-play-button');

export class PlayButton extends Button {
    static get observedAttributes() {
        return [...Button.observedAttributes, 'paused'];
    }

    private _player: ChromelessPlayer | undefined;

    constructor() {
        super({ template });
    }

    get paused(): boolean {
        return this.hasAttribute('paused');
    }

    set paused(paused: boolean) {
        if (paused) {
            this.setAttribute('paused', '');
        } else {
            this.removeAttribute('paused');
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
            this._player.addEventListener('play', this.handlePlayPause);
            this._player.addEventListener('pause', this.handlePlayPause);
        }
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
        if (attrName === 'paused' && newValue !== oldValue) {
            const newPaused = Boolean(newValue);
            if (this._player !== undefined && newPaused !== this._player.paused) {
                if (newPaused) {
                    this._player.pause();
                } else {
                    this._player.play();
                }
            }
        }
    }
}

customElements.define('theoplayer-play-button', PlayButton);

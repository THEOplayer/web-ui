import { css, html, PropertyValues, TemplateResult } from 'lit';
import { Button } from './Button';
import { customElement, property } from 'lit/decorators.js';
import { ChromelessPlayer } from 'theoplayer';
import elementCss from './PlayButton.css';

@customElement('theoplayer-play-button')
export class PlayButton extends Button {
    @property()
    player: ChromelessPlayer | undefined;

    @property({ type: Boolean, reflect: true })
    paused: boolean = true;

    static styles = css`
        ${super.styles}
        ${elementCss}
    `;

    protected override handleClick() {
        this.paused = !this.paused;
        if (this.player !== undefined) {
            if (this.paused) {
                this.player.play();
            } else {
                this.player.pause();
            }
        }
    }

    private readonly handlePlayPause = () => {
        if (this.player !== undefined) {
            this.paused = this.player.paused;
        }
    };

    protected override buttonTemplate(): TemplateResult {
        return html`
            <div part="play-icon">
                <slot name="play-icon">Play</slot>
            </div>
            <div part="pause-icon">
                <slot name="pause-icon">Pause</slot>
            </div>
        `;
    }

    protected override updated(changedProperties: PropertyValues): void {
        super.updated(changedProperties);
        if (changedProperties.has('player')) {
            const oldPlayer = changedProperties.get('player');
            if (oldPlayer !== undefined) {
                oldPlayer.removeEventListener('play', this.handlePlayPause);
                oldPlayer.removeEventListener('pause', this.handlePlayPause);
            }
            if (this.player !== undefined) {
                this.player.addEventListener('play', this.handlePlayPause);
                this.player.addEventListener('pause', this.handlePlayPause);
            }
        }
    }
}

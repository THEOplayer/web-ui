import { Button, buttonTemplate, StateReceiverMixin } from '@theoplayer/web-ui';

const template = document.createElement('template');
// Wrap the "Play" text in a <span>, so we can query and modify it later.
template.innerHTML = buttonTemplate('<span>Play</span>');

export class MyPlayButton extends StateReceiverMixin(Button, ['player']) {
    constructor() {
        super({ template });
        this._buttonSpan = this.shadowRoot.querySelector('span');
    }

    get player() {
        return this._player;
    }
    set player(player) {
        this._player = player;
        console.log('My play button received a player!');
    }

    // highlight-start
    handleClick() {
        if (!this._player) {
            // Not (yet) attached to a player.
            return;
        }
        // Toggle the player's playing state,
        // and update the text inside the <span>.
        if (this._player.paused) {
            this._player.play();
            this._buttonSpan.textContent = 'Pause';
        } else {
            this._player.pause();
            this._buttonSpan.textContent = 'Play';
        }
    }
    // highlight-end
}

customElements.define('my-play-button', MyPlayButton);

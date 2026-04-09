import { Button, StateReceiverMixin } from '@theoplayer/web-ui';
import { html } from 'lit';

export class MyPlayButton extends StateReceiverMixin(Button, ['player']) {
    constructor() {
        super();
        this._player = undefined;
    }

    get player() {
        return this._player;
    }
    set player(player) {
        this._player = player;
        console.log('My play button received a player!');
    }

    render() {
        return html`Play`;
    }

    // highlight-start
    handleClick() {
        if (!this._player) {
            // Not (yet) attached to a player.
            return;
        }
        // Toggle the player's playing state.
        if (this._player.paused) {
            this._player.play();
        } else {
            this._player.pause();
        }
    }
    // highlight-end
}

customElements.define('my-play-button', MyPlayButton);

import { Button, StateReceiverMixin } from '@theoplayer/web-ui';
import { html } from 'lit';

export class MyPlayButton extends StateReceiverMixin(Button, ['player']) {
    // highlight-start
    // Define our reactive properties.
    // See: https://lit.dev/docs/components/properties/
    static properties = {
        _paused: { state: true }
    };

    constructor() {
        super();
        this._player = undefined;
        this._paused = true;
    }
    // highlight-end

    get player() {
        return this._player;
    }
    set player(player) {
        this._player = player;
        console.log('My play button received a player!');
    }

    // highlight-start
    render() {
        // Show a different label depending on the paused state.
        return html`${this._paused ? 'Play' : 'Pause'}`;
    }
    // highlight-end

    handleClick() {
        if (!this._player) {
            // Not (yet) attached to a player.
            return;
        }
        // Toggle the player's playing state,
        // and update our paused state to trigger a re-render.
        if (this._player.paused) {
            this._player.play();
            // highlight-start
            this._paused = false;
            // highlight-end
        } else {
            this._player.pause();
            // highlight-start
            this._paused = true;
            // highlight-end
        }
    }
}

customElements.define('my-play-button', MyPlayButton);

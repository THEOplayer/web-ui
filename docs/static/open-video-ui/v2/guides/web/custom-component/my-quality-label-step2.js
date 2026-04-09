import { StateReceiverMixin } from '@theoplayer/web-ui';
import { css, html, LitElement } from 'lit';

const myQualityLabelStyle = css`
    :host {
        color: var(--theoplayer-text-color, #fff);
        background: var(--theoplayer-control-background, transparent);
        padding: var(--theoplayer-control-padding, 10px);
    }
`;

export class MyQualityLabel extends StateReceiverMixin(LitElement, ['player']) {
    static styles = [myQualityLabelStyle];
    // highlight-start
    static properties = {
        _activeVideoQuality: { state: true }
    };
    // highlight-end

    constructor() {
        super();
        this._player = undefined;
        this._activeVideoTrack = undefined;
        this._activeVideoQuality = undefined;
    }

    get player() {
        return this._player;
    }
    set player(player) {
        if (this._player) {
            // Clean up
            this._player.videoTracks.removeEventListener('addtrack', this.handleAddTrack);
            this.updateActiveTrack(undefined);
        }
        this._player = player;
        if (this._player) {
            // highlight-start
            // Listen for the 'addtrack' event
            this._player.videoTracks.addEventListener('addtrack', this.handleAddTrack);
            // If the player already has an active video track,
            // start using it right away!
            if (this._player.videoTracks.length > 0) {
                this.updateActiveTrack(this._player.videoTracks[0]);
            }
            // highlight-end
        }
    }

    handleAddTrack = (event) => {
        this.updateActiveTrack(event.track);
    };
    updateActiveTrack(track) {
        if (this._activeVideoTrack) {
            // Clean up
            this._activeVideoTrack.removeEventListener('activequalitychanged', this.handleActiveQualityChanged);
        }
        this._activeVideoTrack = track;
        if (this._activeVideoTrack) {
            // highlight-start
            // Listen for the 'activequalitychanged' event
            this._activeVideoTrack.addEventListener('activequalitychanged', this.handleActiveQualityChanged);
            // If the track already has an active quality,
            // start using it right away!
            if (this._activeVideoTrack.activeQuality) {
                this.updateActiveQuality(this._activeVideoTrack.activeQuality);
            }
            // highlight-end
        }
    }

    handleActiveQualityChanged = (event) => {
        this.updateActiveQuality(event.quality);
    };
    updateActiveQuality(quality) {
        // highlight-start
        // Update our (reactive) internal state, which will trigger a re-render.
        this._activeVideoQuality = quality;
        // highlight-end
    }

    render() {
        // highlight-start
        if (this._activeVideoQuality) {
            // Show the quality's height in our <span>
            return html`${this._activeVideoQuality.height}p`;
        } else {
            // No active quality yet...
            return html``;
        }
        // highlight-end
    }
}

customElements.define('my-quality-label', MyQualityLabel);

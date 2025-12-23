import { StateReceiverMixin } from '@theoplayer/web-ui';

const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
    color: var(--theoplayer-text-color, #fff);
    background: var(--theoplayer-control-background, transparent);
    padding: var(--theoplayer-control-padding, 10px);
}
</style>
<span></span>
`;

export class MyQualityLabel extends StateReceiverMixin(HTMLElement, ['player']) {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        this._labelSpan = shadowRoot.querySelector('span');
        this._labelSpan.textContent = '';
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
                this.updateActiveTrack(this._activeVideoTrack.activeQuality);
            }
            // highlight-end
        }
    }

    handleActiveQualityChanged = (event) => {
        this.updateActiveQuality(event.quality);
    };
    updateActiveQuality(quality) {
        // highlight-start
        if (quality) {
            // Show the quality's height in our <span>
            this._labelSpan.textContent = `${quality.height}p`;
        } else {
            // No active quality yet...
            this._labelSpan.textContent = '';
        }
        // highlight-end
    }
}

customElements.define('my-quality-label', MyQualityLabel);

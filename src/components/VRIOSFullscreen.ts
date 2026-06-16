import { css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { stateReceiver } from './StateReceiverMixin';
import { createCustomEvent } from '../util/EventUtils';
import { ENTER_FULLSCREEN_EVENT } from '../events/EnterFullscreenEvent';
import { EXIT_FULLSCREEN_EVENT } from '../events/ExitFullscreenEvent';

function isIOS(): boolean {
    if (typeof navigator === 'undefined') {
        return false;
    }
    const ua = navigator.userAgent || '';
    // iPadOS 13+ reports as Mac, so also check for touch-capable "Macintosh".
    return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

/**
 * A helper component for iOS that forces the player into fullscreen while VR (stereo)
 * content is being presented, and restores the previous state when it stops.
 *
 * This component renders nothing visible.
 */
@customElement('theoplayer-vr-ios-fullscreen')
@stateReceiver(['player'])
export class VRIOSFullscreen extends LitElement {
    static override styles = css`
        :host {
            display: none;
        }
    `;

    private _player: ChromelessPlayer | undefined;
    private _active: boolean = false;

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        this._player?.vr?.removeEventListener('statechange', this._onStateChange);
        this._player = player;
        this._player?.vr?.addEventListener('statechange', this._onStateChange);
        this._onStateChange();
    }

    private readonly _onStateChange = (): void => {
        if (!isIOS()) {
            return;
        }
        const presenting = this._player?.vr?.state === 'presenting';
        if (presenting && !this._active) {
            this._active = true;
            this.dispatchEvent(createCustomEvent(ENTER_FULLSCREEN_EVENT, { bubbles: true, composed: true }));
        } else if (!presenting && this._active) {
            this._active = false;
            this.dispatchEvent(createCustomEvent(EXIT_FULLSCREEN_EVENT, { bubbles: true, composed: true }));
        }
    };

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        this._player?.vr?.removeEventListener('statechange', this._onStateChange);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-vr-ios-fullscreen': VRIOSFullscreen;
    }
}

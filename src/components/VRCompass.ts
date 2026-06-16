import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { stateReceiver } from './StateReceiverMixin';
import vrCompassCss from './VRCompass.css';

const VR_EVENTS = ['statechange', 'directionchange'] as const;
const FOV_SLICE_ANGLE = 80; // degrees

/**
 * A compass that indicates the current viewing direction of a 360° (VR) video.
 *
 * @cssproperty `--theoplayer-vr-compass-size` - The size (diameter) of the compass. Defaults to `26px`.
 * @cssproperty `--theoplayer-vr-compass-color` - The color of the compass border, center dot and pointer.
 *   Defaults to `#fff`.
 * @cssproperty `--theoplayer-vr-compass-fov-color` - The color of the field-of-view indicator.
 *   Defaults to `rgba(255, 255, 255, 0.75)`.
 */
@customElement('theoplayer-vr-compass')
@stateReceiver(['player'])
export class VRCompass extends LitElement {
    static override styles = [vrCompassCss];

    private _player: ChromelessPlayer | undefined;

    @state()
    private accessor _yaw: number = 0;

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._player.vr?.removeEventListener(VR_EVENTS, this._updateFromPlayer);
            this._player.removeEventListener('sourcechange', this._updateFromPlayer);
        }
        this._player = player;
        if (this._player !== undefined) {
            this._player.vr?.addEventListener(VR_EVENTS, this._updateFromPlayer);
            this._player.addEventListener('sourcechange', this._updateFromPlayer);
        }
        this._updateFromPlayer();
    }

    private readonly _updateFromPlayer = (): void => {
        const vr = this._player?.vr;
        // Like the classic UI, only show the compass for non-native 360° VR sources.
        // Native VR sources are rendered by the platform, so there's no JS viewing direction.
        if (!vr || vr.state === 'unavailable' || this._player?.source?.vr?.nativeVR) {
            this.hidden = true;
            return;
        }
        this.hidden = false;
        this._yaw = vr.direction.yaw;
    };

    protected override render(): HTMLTemplateResult {
        const transformAngle = -this._yaw + FOV_SLICE_ANGLE / 2;
        const transformSkew = FOV_SLICE_ANGLE - 90;
        const transform = `scale(0.875) rotate(${transformAngle}deg) skew(${transformSkew}deg)`;
        return html`<div part="dial"><div part="fov" style="transform: ${transform};"></div></div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-vr-compass': VRCompass;
    }
}

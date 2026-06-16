import { html, type HTMLTemplateResult, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { Button } from './Button';
import vrButtonCss from './VRButton.css';
import vrIcon from '../icons/vr.svg';
import { stateReceiver } from './StateReceiverMixin';
import { Attribute } from '../util/Attribute';
import { getLocale } from '../i18n';

const VR_EVENTS = ['statechange', 'stereochange'] as const;

/**
 * A button that toggles stereoscopic VR mode.
 *
 * The button is only shown when the current source supports VR (e.g. a 360° video),
 * and is disabled when the device cannot present VR content.
 */
@customElement('theoplayer-vr-button')
@stateReceiver(['player', 'lang'])
export class VRButton extends Button {
    static styles = [...Button.styles, vrButtonCss];

    private _player: ChromelessPlayer | undefined;

    override connectedCallback() {
        super.connectedCallback();
        this._updateFromPlayer();
        this._updateAriaLabel();
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        this._player?.vr?.removeEventListener(VR_EVENTS, this._updateFromPlayer);
        this._player = player;
        this._player?.vr?.addEventListener(VR_EVENTS, this._updateFromPlayer);
        this._updateFromPlayer();
    }

    /**
     * Whether stereoscopic VR mode is currently active.
     */
    @property({ reflect: true, type: Boolean, attribute: Attribute.STEREO })
    accessor stereo: boolean = false;

    @property({ reflect: true, type: String, attribute: Attribute.LANG })
    accessor lang: string = '';

    private readonly _updateFromPlayer = (): void => {
        const vr = this._player?.vr;
        if (!vr || vr.state === 'unavailable') {
            this.stereo = false;
            this.hidden = true;
            return;
        }
        this.hidden = false;
        this.disabled = !vr.canPresentVR;
        this.stereo = vr.stereo;
    };

    protected override handleClick(): void {
        const vr = this._player?.vr;
        if (!vr || !vr.canPresentVR) {
            return;
        }
        vr.stereo = !vr.stereo;
        this.stereo = vr.stereo;
    }

    override willUpdate(changedProperties: PropertyValues) {
        super.willUpdate(changedProperties);
        this._updateAriaLabel();
    }

    private _updateAriaLabel(): void {
        const locale = getLocale(this.lang);
        if (this.stereo) {
            this.ariaLabel = locale.vrExitAria;
        } else if (this.disabled) {
            this.ariaLabel = locale.vrUnavailableAria;
        } else {
            this.ariaLabel = locale.vrAria;
        }
    }

    protected override render(): HTMLTemplateResult {
        return html`<span part="icon"><slot>${unsafeSVG(vrIcon)}</slot></span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-vr-button': VRButton;
    }
}

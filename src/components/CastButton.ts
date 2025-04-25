import { Button, type ButtonOptions } from './Button';
import { property } from 'lit/decorators.js';
import { Attribute } from '../util/Attribute';
import type { CastState, VendorCast } from 'theoplayer/chromeless';

/**
 * A generic button to start and stop casting.
 *
 * For a concrete implementation, see {@link ChromecastButton} and {@link AirPlayButton}.
 * @group Components
 */
export class CastButton extends Button {
    private _castApi: VendorCast | undefined;
    private _castState: CastState = 'unavailable';

    constructor(options?: ButtonOptions) {
        super(options);
        this._upgradeProperty('castState');
        this._upgradeProperty('castApi');
    }

    override connectedCallback() {
        super.connectedCallback();
        this._updateCastState();
    }

    /**
     * The cast API for this cast button.
     */
    get castApi(): VendorCast | undefined {
        return this._castApi;
    }

    set castApi(castApi: VendorCast | undefined) {
        if (this._castApi !== undefined) {
            this._castApi.removeEventListener('statechange', this._updateCastState);
        }
        this._castApi = castApi;
        this._updateCastState();
        if (this._castApi !== undefined) {
            this._castApi.addEventListener('statechange', this._updateCastState);
        }
    }

    /**
     * The current cast state.
     */
    get castState(): CastState {
        return this._castState;
    }

    @property({ reflect: true, state: true, type: String, attribute: Attribute.CAST_STATE })
    private set castState(castState: CastState) {
        this._castState = castState;
    }

    protected override handleClick(): void {
        if (this._castApi) {
            this._updateCastState();
            const state = this.castState;
            if (state === 'available') {
                this._castApi.start();
            } else if (state === 'connecting' || state === 'connected') {
                this._castApi.stop();
            }
        }
    }

    private readonly _updateCastState = (): void => {
        this.castState = this._castApi ? this._castApi.state : 'unavailable';
    };
}

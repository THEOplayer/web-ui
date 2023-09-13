import { Button, type ButtonOptions } from './Button';
import { Attribute } from '../util/Attribute';
import type { CastState, VendorCast } from 'theoplayer/chromeless';
import * as shadyCss from '@webcomponents/shadycss';

/**
 * A generic button to start and stop casting.
 *
 * For a concrete implementation, see {@link ChromecastButton}.
 * @group Components
 */
export class CastButton extends Button {
    private _castApi: VendorCast | undefined;

    static get observedAttributes() {
        return [...Button.observedAttributes, Attribute.CAST_STATE];
    }

    constructor(options?: ButtonOptions) {
        super(options);
        this._upgradeProperty('castState');
        this._upgradeProperty('castApi');
    }

    override connectedCallback() {
        super.connectedCallback();
        if (!this.hasAttribute(Attribute.CAST_STATE)) {
            this.setAttribute(Attribute.CAST_STATE, 'unavailable');
        }
        this._updateCastState();
    }

    /**
     * The cast API for which this cast button.
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
        return this.getAttribute(Attribute.CAST_STATE) as CastState;
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
        const castState = this._castApi ? this._castApi.state : 'unavailable';
        this.setAttribute(Attribute.CAST_STATE, castState);
    };

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (CastButton.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

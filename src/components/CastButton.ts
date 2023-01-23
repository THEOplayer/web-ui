import { Button } from './Button';
import { Attribute } from '../util/Attribute';
import type { CastState, VendorCast } from 'theoplayer';
import * as shadyCss from '@webcomponents/shadycss';

export class CastButton extends Button {
    private _castApi: VendorCast | undefined;

    static get observedAttributes() {
        return [...Button.observedAttributes, Attribute.CAST_STATE];
    }

    override connectedCallback() {
        super.connectedCallback();
        this._upgradeProperty('castState');
        this._upgradeProperty('castApi');
        if (!this.hasAttribute(Attribute.CAST_STATE)) {
            this.setAttribute(Attribute.CAST_STATE, 'unavailable');
        }
        this._updateCastState();
    }

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

    get castState(): CastState {
        return this.getAttribute(Attribute.CAST_STATE) as CastState;
    }

    set castState(castState: CastState) {
        this.setAttribute(Attribute.CAST_STATE, castState);
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

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (CastButton.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

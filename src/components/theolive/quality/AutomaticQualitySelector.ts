import { AbstractQualitySelector } from './AbstractQualitySelector';
import { setTextContent } from '../../../util/CommonUtils';

export class AutomaticQualitySelector extends AbstractQualitySelector {
    constructor() {
        super();
        setTextContent(this._slotEl, 'High Quality');
    }

    handleEnterBadNetworkMode() {
        this.#update();
    }

    handleExitBadNetworkMode() {
        this.#update();
    }

    protected handlePlayer() {
        this.#update();
    }

    #update() {
        const newChecked = this.player?.theoLive?.badNetworkMode !== true;
        if (this.checked !== newChecked) {
            this.checked = newChecked;
        }
    }

    protected handleChecked(checked: boolean) {
        if (checked && this.player && this.player.theoLive) {
            this.player.theoLive.badNetworkMode = false;
        }
    }
}

customElements.define('theolive-automatic-quality-selector', AutomaticQualitySelector);

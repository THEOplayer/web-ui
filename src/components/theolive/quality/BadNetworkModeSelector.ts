import {AbstractQualitySelector} from "./AbstractQualitySelector";
import {setTextContent} from "../../../util/CommonUtils";

export class BadNetworkModeSelector extends AbstractQualitySelector {

    constructor() {
        super();
        setTextContent(this._slotEl, 'Low Quality');
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
        const newChecked = this.player?.theoLive?.badNetworkMode === true;
        if (this.checked !== newChecked) {
            this.checked = newChecked;
        }
    }

    protected handleChecked(checked: boolean) {
        if (checked && this.player && this.player.theoLive) {
            this.player.theoLive.badNetworkMode = true;
        }
    }
}

customElements.define('theolive-bad-network-quality-selector', BadNetworkModeSelector);

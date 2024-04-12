import { AbstractQualitySelector } from './AbstractQualitySelector';
import { setTextContent } from '../../../util/CommonUtils';
import { createTemplate } from '../../../util/TemplateUtils';
import { buttonTemplate } from '../../Button';

const template = createTemplate('theolive-automatic-quality-selector', buttonTemplate('<slot></slot>'));

export class AutomaticQualitySelector extends AbstractQualitySelector {
    constructor() {
        super({ template: template() });
        setTextContent(this._slotEl, 'High Quality');
    }

    handleEnterBadNetworkMode() {
        this.update_();
    }

    handleExitBadNetworkMode() {
        this.update_();
    }

    protected handlePlayer() {
        this.update_();
    }

    private update_() {
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

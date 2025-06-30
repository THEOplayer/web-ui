import { AbstractQualitySelector } from './AbstractQualitySelector';
import { html, type HTMLTemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('theolive-automatic-quality-selector')
export class AutomaticQualitySelector extends AbstractQualitySelector {
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

    protected handleChange() {
        if (this.checked && this.player && this.player.theoLive) {
            this.player.theoLive.badNetworkMode = false;
        }
    }

    protected override render(): HTMLTemplateResult {
        return html`<slot>High Quality</slot>`;
    }
}

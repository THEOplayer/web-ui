import { AbstractQualitySelector } from './AbstractQualitySelector';
import { html, type HTMLTemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('theolive-bad-network-quality-selector')
export class BadNetworkModeSelector extends AbstractQualitySelector {
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
        const newChecked = this.player?.theoLive?.badNetworkMode === true;
        if (this.checked !== newChecked) {
            this.checked = newChecked;
        }
    }

    protected handleChange(): void {
        if (this.checked && this.player && this.player.theoLive) {
            this.player.theoLive.badNetworkMode = true;
        }
    }

    protected override render(): HTMLTemplateResult {
        return html`<slot>Low Quality</slot>`;
    }
}

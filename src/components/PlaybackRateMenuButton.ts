import { html, type HTMLTemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { MenuButton } from './MenuButton';
import speedIcon from '../icons/speed.svg';

/**
 * A menu button that opens a [playback rate menu]{@link PlaybackRateMenu}.
 *
 * @attribute menu - The ID of the playback rate menu.
 */
@customElement('theoplayer-playback-rate-menu-button')
export class PlaybackRateMenuButton extends MenuButton {
    override connectedCallback() {
        super.connectedCallback();

        if (this.ariaLabel == null) {
            this.ariaLabel = 'open playback speed menu';
        }
    }

    protected override render(): HTMLTemplateResult {
        return html`<span part="icon"><slot>${unsafeSVG(speedIcon)}</slot></span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-playback-rate-menu-button': PlaybackRateMenuButton;
    }
}

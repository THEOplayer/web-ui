import { html, type HTMLTemplateResult, type PropertyValues } from 'lit';
import { customElement } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { MenuButton } from './MenuButton';
import speedIcon from '../icons/speed.svg';
import { getLocale } from '../i18n';

/**
 * A menu button that opens a [playback rate menu]{@link PlaybackRateMenu}.
 *
 * @attribute menu - The ID of the playback rate menu.
 */
@customElement('theoplayer-playback-rate-menu-button')
export class PlaybackRateMenuButton extends MenuButton {
    override willUpdate(changedProperties: PropertyValues) {
        super.willUpdate(changedProperties);
        this._updateAriaLabel();
    }

    private _updateAriaLabel(): void {
        const locale = getLocale(this.lang);
        this.ariaLabel = locale.openPlaybackRateMenuAria;
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

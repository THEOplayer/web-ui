import { html, type HTMLTemplateResult, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { MenuButton } from './MenuButton';
import speedIcon from '../icons/speed.svg';
import { getLocale } from '../i18n';
import { stateReceiver } from './StateReceiverMixin';
import { Attribute } from '../util/Attribute';

/**
 * A menu button that opens a [playback rate menu]{@link PlaybackRateMenu}.
 *
 * @attribute menu - The ID of the playback rate menu.
 */
@customElement('theoplayer-playback-rate-menu-button')
@stateReceiver(['lang'])
export class PlaybackRateMenuButton extends MenuButton {
    @property({ reflect: true, type: String, attribute: Attribute.LANG })
    accessor lang: string = '';

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

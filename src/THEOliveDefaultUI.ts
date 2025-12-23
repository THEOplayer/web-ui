import { html, type HTMLTemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import './components/theolive/quality/BadNetworkModeButton';
import './components/theolive/quality/BadNetworkModeMenu';
import css from './THEOliveDefaultUI.css';
import type { ErrorEvent, UIPlayerConfiguration } from 'theoplayer/chromeless';
import { DefaultUI } from './DefaultUI';
import { Attribute } from './util/Attribute';

/**
 * `<theolive-default-ui>` - A default UI for THEOlive.
 */
@customElement('theolive-default-ui')
export class THEOliveDefaultUI extends DefaultUI {
    static override styles = [css];

    @state()
    private accessor _announcementType: 'loading' | 'offline' | 'announcement' | '' = '';
    @state()
    private accessor _announcementMessage: string = '';
    @state()
    private accessor _hidePlayButton: boolean = false;
    @state()
    private accessor _hideErrorDisplay: boolean = false;

    constructor(configuration: UIPlayerConfiguration = {}) {
        super(configuration);
    }

    protected override _onUiReady() {
        super._onUiReady();
        const player = this.player;
        if (player) {
            player.theoLive?.addEventListener(['distributionloadstart', 'publicationloadstart' as never], this.onLoadChannelStart);
            player.theoLive?.addEventListener(['distributionoffline', 'publicationoffline' as never], this.onChannelOffline);
            player.theoLive?.addEventListener(['endpointloaded', 'publicationloaded' as never], this.onChannelLoaded);
            player.addEventListener('error', this.onError);
        }
    }

    private onLoadChannelStart = () => {
        this.showMessage_('loading', undefined);
    };

    private onChannelOffline = () => {
        this.showMessage_('offline', undefined);
    };

    private onChannelLoaded = () => {
        this.hidePlayerError();
        this.hideMessage_();
    };

    private onError = (e: ErrorEvent) => {
        const errorCode = e.errorObject.code;
        if (errorCode < 13_000 || errorCode >= 14_000) {
            this.showMessage_('offline', undefined);
            return;
        }
        this.stopHidingPlayerError();
        this.hideMessage_();
    };

    private hidePlayerError(): void {
        this._uiRef.value?.removeAttribute(Attribute.HAS_ERROR);
        this._hideErrorDisplay = true;
    }

    private stopHidingPlayerError(): void {
        this._uiRef.value?.setAttribute(Attribute.HAS_ERROR, '');
        this._hideErrorDisplay = false;
    }

    private showMessage_(type: 'offline' | 'loading' | 'announcement', text: string | undefined): void {
        this.hidePlayerError();
        this._announcementType = type;
        this._announcementMessage = text ?? '';
        this._hidePlayButton = true;
    }

    private hideMessage_(): void {
        this._announcementType = '';
        this._announcementMessage = '';
        this._hidePlayButton = false;
    }

    protected override renderUiContent(): HTMLTemplateResult {
        const loadingStyles = { display: this._announcementType === 'loading' ? '' : 'none' };
        const offlineStyles = { display: this._announcementType === 'offline' ? '' : 'none' };
        const announcementStyles = { display: this._announcementType === 'announcement' ? '' : 'none' };
        const playButtonStyles = { display: this._hidePlayButton ? 'none' : '' };
        const errorDisplayStyles = { display: this._hideErrorDisplay ? 'none' : '' };
        return html`
            <p id="loading-announcement" no-auto-hide slot="centered-chrome" style=${styleMap(loadingStyles)}>
                <slot name="loading-announcement">Loading...</slot>
            </p>
            <p id="offline-announcement" no-auto-hide slot="centered-chrome" style=${styleMap(offlineStyles)}>
                <slot name="offline-announcement">The live stream hasn't started yet</slot>
            </p>
            <p id="announcement" no-auto-hide slot="centered-chrome" style=${styleMap(announcementStyles)}>${this._announcementMessage}</p>
            <theoplayer-loading-indicator slot="centered-loading" no-auto-hide part="loading-indicator"></theoplayer-loading-indicator>
            <div slot="centered-chrome" part="centered-chrome">
                <theoplayer-play-button
                    part="center-play-button play-button center-button"
                    style=${styleMap(playButtonStyles)}
                ></theoplayer-play-button>
            </div>
            <div part="bottom-chrome">
                <theoplayer-control-bar>
                    <theoplayer-play-button mobile-hidden part="play-button" style=${styleMap(playButtonStyles)}></theoplayer-play-button>
                    <theoplayer-mute-button part="mute-button"></theoplayer-mute-button>
                    <theoplayer-volume-range mobile-hidden part="volume-range"></theoplayer-volume-range>
                    <theoplayer-live-button ad-hidden live-only part="live-button"></theoplayer-live-button>
                    <span class="theoplayer-spacer"></span>
                    <theoplayer-settings-menu-button ad-hidden menu="all-quality-menu" part="quality-button"></theoplayer-settings-menu-button>
                    <theolive-bad-network-button ad-hidden menu="quality-menu" part="theolive-bad-network-button"></theolive-bad-network-button>
                    <theoplayer-fullscreen-button part="fullscreen-button"></theoplayer-fullscreen-button>
                </theoplayer-control-bar>
            </div>
            <theoplayer-menu id="quality-menu" slot="menu" menu-close-on-input hidden>
                <theolive-bad-network-menu></theolive-bad-network-menu>
            </theoplayer-menu>
            <theoplayer-menu id="all-quality-menu" slot="menu" menu-close-on-input hidden>
                <theoplayer-quality-radio-group></theoplayer-quality-radio-group>
            </theoplayer-menu>
            <theoplayer-error-display slot="error" part="error-display" style=${styleMap(errorDisplayStyles)}></theoplayer-error-display>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theolive-default-ui': THEOliveDefaultUI;
    }
}

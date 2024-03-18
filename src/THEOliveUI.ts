import "./components/theolive/Logo";
import "./components/theolive/quality/BadNetworkModeButton";
import "./components/theolive/quality/BadNetworkModeMenu";
import css from './THEOliveUI.css'
import html from './THEOliveUI.html';
import type {ErrorEvent, PlayerConfiguration} from "theoplayer/chromeless";
import {DefaultUI} from "./DefaultUI";
import {READY_EVENT} from "./events/ReadyEvent";
import {ErrorDisplay, PlayButton} from "./components";

const template = document.createElement('template');
template.innerHTML = `<style>${css}</style>${html}`;

export class THEOLiveUI extends DefaultUI {
    private readonly _loading: HTMLParagraphElement;
    private readonly _offline: HTMLParagraphElement;
    private readonly _announcement: HTMLParagraphElement;
    private readonly _errorDisplay: ErrorDisplay;
    private readonly _playButton: PlayButton;
    private readonly _root: HTMLElement;

    constructor(configuration: PlayerConfiguration = {}) {
        super(configuration);
        this._loading = this._shadowRoot.querySelector<HTMLParagraphElement>("#loading-announcement")!;
        this._offline = this._shadowRoot.querySelector<HTMLParagraphElement>("#offline-announcement")!;
        this._announcement = this._shadowRoot.querySelector<HTMLParagraphElement>("#announcement")!;
        this._errorDisplay = this._shadowRoot.querySelector<ErrorDisplay>("theoplayer-error-display")!;
        this._playButton = this._shadowRoot.querySelector<PlayButton>("theoplayer-play-button")!;
        this._root = this._shadowRoot.querySelector<HTMLElement>('theoplayer-ui')!

        this._ui.addEventListener(READY_EVENT, this.onReady);
    }

    protected initShadowRoot(): ShadowRoot {
        const shadowRoot = this.attachShadow({mode: 'open', delegatesFocus: true});
        shadowRoot.appendChild(template.content.cloneNode(true));
        return shadowRoot;
    }

    private readonly onReady = () => {
        this._ui.removeEventListener(READY_EVENT, this.onReady);
        const player = this.player;
        if (player) {
            player.theoLive?.addEventListener('publicationloadstart', this.onLoadChannelStart);
            player.theoLive?.addEventListener('publicationoffline', this.onChannelOffline);
            player.theoLive?.addEventListener('publicationloaded', this.onChannelLoaded);
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
    }

    private onError = (e: ErrorEvent) => {
        const errorCode = e.errorObject.code
        if (errorCode < 13_000 || errorCode >= 14_000) {
            this.showMessage_('offline', undefined);
            return;
        }
        this.stopHidingPlayerError();
        this.hideMessage_();
    };

    private hidePlayerError(): void {
        this._root.removeAttribute('has-error');
        this._errorDisplay.style.display = "none";
    }

    private stopHidingPlayerError(): void {
        this._root.setAttribute('has-error', '');
        this._errorDisplay.style.display = "flex";
    }

    private hidePlayerPlayButton_(): void {
        this._playButton.style.display = "none";
    }

    private stopHidingPlayerPlayButton(): void {
        this._playButton.style.display = "inline-flex";
    }

    private showMessage_(type: 'offline' | 'loading' | 'announcement', text: string | undefined): void {
        this.hidePlayerError();
        this._loading.style.display = 'none';
        this._offline.style.display = 'none';
        this._announcement.style.display = 'none';
        if (type === 'loading') {
            this._loading.style.display = 'block';
        } else if (type === 'offline') {
            this._offline.style.display = 'block';
        } else {
            this._announcement.textContent = text ?? '';
            this._announcement.style.display = 'block';
        }
        this.hidePlayerPlayButton_();
    }

    private hideMessage_(): void {
        this._loading.style.display = 'none';
        this._offline.style.display = 'none';
        this._announcement.style.display = 'none';
        this.stopHidingPlayerPlayButton();
    }
}

customElements.define('theo-live-default-ui', THEOLiveUI);

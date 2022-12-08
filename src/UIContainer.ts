import * as shadyCss from '@webcomponents/shadycss';
import { ChromelessPlayer, type PlayerConfiguration, type SourceDescription } from 'theoplayer';
import elementCss from './UIContainer.css';
import elementHtml from './UIContainer.html';
import { arrayFind, arrayRemove, containsComposedNode, isElement, noOp } from './util/CommonUtils';
import { forEachStateReceiverElement, StateReceiverElement, StateReceiverProps } from './components/StateReceiverMixin';
import { OPEN_MENU_EVENT, type OpenMenuEvent } from './events/OpenMenuEvent';
import { CLOSE_MENU_EVENT, type CloseMenuEvent } from './events/CloseMenuEvent';
import { ENTER_FULLSCREEN_EVENT, EnterFullscreenEvent } from './events/EnterFullscreenEvent';
import { EXIT_FULLSCREEN_EVENT, ExitFullscreenEvent } from './events/ExitFullscreenEvent';
import { fullscreenAPI } from './util/FullscreenUtils';

const template = document.createElement('template');
template.innerHTML = `<style>${elementCss}</style>${elementHtml}`;
shadyCss.prepareTemplate(template, 'theoplayer-ui');

const ATTR_LIBRARY_LOCATION = 'library-location';
const ATTR_LICENSE = 'license';
const ATTR_LICENSE_URL = 'license-url';
const ATTR_SOURCE = 'source';
const ATTR_AUTOPLAY = 'autoplay';
const ATTR_FULLSCREEN = 'fullscreen';
const ATTR_MENU_OPENED = 'menu-opened';

export class UIContainer extends HTMLElement {
    static get observedAttributes() {
        return [ATTR_LIBRARY_LOCATION, ATTR_LICENSE, ATTR_LICENSE_URL, ATTR_SOURCE, ATTR_AUTOPLAY, ATTR_FULLSCREEN];
    }

    private _playerConfiguration: PlayerConfiguration = {};
    private readonly _playerEl: HTMLElement;
    private readonly _menuEl: HTMLElement;
    private _menus: Element[] = [];
    private readonly _menuSlot: HTMLSlotElement;
    private readonly _mutationObserver: MutationObserver;
    private readonly _stateReceivers: StateReceiverElement[] = [];
    private _player: ChromelessPlayer | undefined = undefined;
    private _source: SourceDescription | undefined = undefined;

    constructor(playerConfiguration: PlayerConfiguration = {}) {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this.playerConfiguration = playerConfiguration;

        this._playerEl = shadowRoot.querySelector('[part~="media-layer"]')!;
        this._menuEl = shadowRoot.querySelector('[part~="menu-layer"]')!;
        this._menuSlot = shadowRoot.querySelector('slot[name="menu"]')!;

        this._mutationObserver = new MutationObserver(this._onMutation);

        shadowRoot.addEventListener(OPEN_MENU_EVENT, this._onOpenMenu);
        shadowRoot.addEventListener(ENTER_FULLSCREEN_EVENT, this._onEnterFullscreen);
        shadowRoot.addEventListener(EXIT_FULLSCREEN_EVENT, this._onExitFullscreen);
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    get playerConfiguration(): PlayerConfiguration {
        return this._playerConfiguration;
    }

    set playerConfiguration(playerConfiguration: PlayerConfiguration) {
        this._playerConfiguration = { ...playerConfiguration };
        this.libraryLocation = playerConfiguration.libraryLocation;
        this.license = playerConfiguration.license;
        this.licenseUrl = playerConfiguration.licenseUrl;
    }

    get libraryLocation(): string | undefined {
        return this.getAttribute(ATTR_LIBRARY_LOCATION) ?? undefined;
    }

    set libraryLocation(value: string | undefined) {
        if (value) {
            this.setAttribute(ATTR_LIBRARY_LOCATION, value);
        } else {
            this.removeAttribute(ATTR_LIBRARY_LOCATION);
        }
    }

    get license(): string | undefined {
        return this.getAttribute('license') ?? undefined;
    }

    set license(value: string | undefined) {
        if (value) {
            this.setAttribute(ATTR_LICENSE, value);
        } else {
            this.removeAttribute(ATTR_LICENSE);
        }
    }

    get licenseUrl(): string | undefined {
        return this.getAttribute(ATTR_LICENSE_URL) ?? undefined;
    }

    set licenseUrl(value: string | undefined) {
        if (value) {
            this.setAttribute(ATTR_LICENSE_URL, value);
        } else {
            this.removeAttribute(ATTR_LICENSE_URL);
        }
    }

    get source(): SourceDescription | undefined {
        return this._player ? this._player.source : this._source;
    }

    set source(value: SourceDescription | undefined) {
        if (this._player) {
            this._player.source = value;
        } else {
            this._source = value;
        }
    }

    get autoplay(): boolean {
        return this.hasAttribute(ATTR_AUTOPLAY);
    }

    set autoplay(value: boolean) {
        if (value) {
            this.setAttribute(ATTR_AUTOPLAY, '');
        } else {
            this.removeAttribute(ATTR_AUTOPLAY);
        }
    }

    get fullscreen(): boolean {
        return this.hasAttribute(ATTR_FULLSCREEN);
    }

    set fullscreen(value: boolean) {
        if (value) {
            this.setAttribute(ATTR_FULLSCREEN, '');
        } else {
            this.removeAttribute(ATTR_FULLSCREEN);
        }
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        this._upgradeProperty('playerConfiguration');
        this._upgradeProperty('libraryLocation');
        this._upgradeProperty('license');
        this._upgradeProperty('licenseUrl');
        this._upgradeProperty('source');
        this._upgradeProperty('autoplay');

        this.tryInitializePlayer_();

        for (const receiver of this._stateReceivers) {
            this.propagateStateToReceiver_(receiver);
        }
        void forEachStateReceiverElement(this, this._playerEl, this.registerStateReceiver_);
        this._mutationObserver.observe(this, { childList: true, subtree: true });

        this._onMenuSlotChange();
        this._menuSlot.addEventListener('slotchange', this._onMenuSlotChange);

        if (fullscreenAPI !== undefined) {
            document.addEventListener(fullscreenAPI.fullscreenchange_, this._onFullscreenChange);
            document.addEventListener(fullscreenAPI.fullscreenerror_, this._onFullscreenChange);
            this._onFullscreenChange();
        }
    }

    private _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    private tryInitializePlayer_(): void {
        if (this._player !== undefined) {
            return;
        }
        if (this.libraryLocation === undefined) {
            return;
        }
        if (this.license === undefined && this.licenseUrl === undefined) {
            return;
        }

        this._player = new ChromelessPlayer(this._playerEl, this._playerConfiguration);
        if (this._source) {
            this._player.source = this._source;
            this._source = undefined;
        }
        this._player.autoplay = this.autoplay;

        for (const receiver of this._stateReceivers) {
            if (receiver[StateReceiverProps].indexOf('player') >= 0) {
                receiver.setPlayer!(this._player);
            }
        }
    }

    disconnectedCallback(): void {
        this._mutationObserver.disconnect();
        for (const receiver of this._stateReceivers) {
            this.removeStateFromReceiver_(receiver);
        }
        this._stateReceivers.length = 0;

        this._menuSlot.removeEventListener('slotchange', this._onMenuSlotChange);

        if (fullscreenAPI !== undefined) {
            document.removeEventListener(fullscreenAPI.fullscreenchange_, this._onFullscreenChange);
            document.removeEventListener(fullscreenAPI.fullscreenerror_, this._onFullscreenChange);
        }

        if (this._player) {
            this._player.destroy();
            this._player = undefined;
        }
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any): void {
        if (newValue === oldValue) {
            return;
        }
        const hasValue = newValue != null;
        if (attrName === ATTR_LIBRARY_LOCATION) {
            this._playerConfiguration.libraryLocation = newValue;
            this.tryInitializePlayer_();
        } else if (attrName === ATTR_LICENSE) {
            this._playerConfiguration.license = newValue;
            this.tryInitializePlayer_();
        } else if (attrName === ATTR_LICENSE_URL) {
            this._playerConfiguration.licenseUrl = newValue;
            this.tryInitializePlayer_();
        } else if (attrName === ATTR_SOURCE) {
            this.source = newValue ? (JSON.parse(newValue) as SourceDescription) : undefined;
        } else if (attrName === ATTR_AUTOPLAY) {
            if (this._player) {
                this._player.autoplay = hasValue;
            }
        } else if (attrName === ATTR_FULLSCREEN) {
            for (const receiver of this._stateReceivers) {
                if (receiver[StateReceiverProps].indexOf('fullscreen') >= 0) {
                    receiver.setFullscreen!(hasValue);
                }
            }
        }
    }

    private readonly _onMutation = (mutations: MutationRecord[]): void => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                const { addedNodes, removedNodes } = mutation;
                for (let i = 0; i < addedNodes.length; i++) {
                    const node = addedNodes[i];
                    if (isElement(node)) {
                        void forEachStateReceiverElement(node, this._playerEl, this.registerStateReceiver_);
                    }
                }
                for (let i = 0; i < removedNodes.length; i++) {
                    const node = removedNodes[i];
                    if (isElement(node)) {
                        void forEachStateReceiverElement(node, this._playerEl, this.unregisterStateReceiver_);
                    }
                }
            }
        }
    };

    private readonly registerStateReceiver_ = (receiver: StateReceiverElement): void => {
        if (this._stateReceivers.indexOf(receiver) >= 0) {
            return;
        }
        this._stateReceivers.push(receiver);
        this.propagateStateToReceiver_(receiver);
    };

    private readonly unregisterStateReceiver_ = (receiver: StateReceiverElement): void => {
        if (!arrayRemove(this._stateReceivers, receiver)) {
            return;
        }
        this.removeStateFromReceiver_(receiver);
    };

    private propagateStateToReceiver_(receiver: StateReceiverElement): void {
        const receiverProps = receiver[StateReceiverProps];
        if (receiverProps.indexOf('player') >= 0) {
            receiver.setPlayer!(this._player);
        }
        if (receiverProps.indexOf('fullscreen') >= 0) {
            receiver.setFullscreen!(this.fullscreen);
        }
    }

    private removeStateFromReceiver_(receiver: StateReceiverElement): void {
        const receiverProps = receiver[StateReceiverProps];
        if (receiverProps.indexOf('player') >= 0) {
            receiver.setPlayer!(undefined);
        }
    }

    private _onMenuSlotChange = () => {
        const newMenus = this._menuSlot.assignedNodes().filter(isElement);
        for (const oldMenu of this._menus) {
            if (newMenus.indexOf(oldMenu) < 0) {
                oldMenu.removeEventListener(CLOSE_MENU_EVENT, this._onCloseMenu);
            }
        }
        for (const newMenu of newMenus) {
            if (this._menus.indexOf(newMenu) < 0) {
                newMenu.addEventListener(CLOSE_MENU_EVENT, this._onCloseMenu);
            }
        }
        this._menus = newMenus;
    };

    private readonly _onOpenMenu = (rawEvent: Event): void => {
        const event = rawEvent as OpenMenuEvent;
        event.stopPropagation();
        const menuId = event.detail.menu;
        const menuToOpen = arrayFind(this._menus, (element) => element.id === menuId);
        if (menuToOpen === undefined) {
            console.error(`<theoplayer-ui>: cannot find menu with ID "${event.detail.menu}"`);
            return;
        }
        for (const menu of this._menus) {
            menu.setAttribute('hidden', '');
        }
        menuToOpen.removeAttribute('hidden');
        this.setAttribute(ATTR_MENU_OPENED, '');
    };

    private readonly _onCloseMenu = (rawEvent: Event): void => {
        const event = rawEvent as CloseMenuEvent;
        event.stopPropagation();
        const menuToClose = event.currentTarget as HTMLElement;
        menuToClose.setAttribute('hidden', '');
        this.removeAttribute(ATTR_MENU_OPENED);
    };

    private readonly _onEnterFullscreen = (rawEvent: Event): void => {
        const event = rawEvent as EnterFullscreenEvent;
        event.stopPropagation();
        if (fullscreenAPI && document[fullscreenAPI.fullscreenEnabled_] && this[fullscreenAPI.requestFullscreen_]) {
            const promise = this[fullscreenAPI.requestFullscreen_]();
            if (promise && promise.then) {
                promise.then(noOp, noOp);
            }
        } else if (this._player && this._player.presentation.supportsMode('fullscreen')) {
            this._player.presentation.requestMode('fullscreen');
        }
    };

    private readonly _onExitFullscreen = (rawEvent: Event): void => {
        const event = rawEvent as ExitFullscreenEvent;
        event.stopPropagation();
        if (fullscreenAPI) {
            const promise = document[fullscreenAPI.exitFullscreen_]();
            if (promise && promise.then) {
                promise.then(noOp, noOp);
            }
        }
        if (this._player && this._player.presentation.currentMode === 'fullscreen') {
            this._player.presentation.requestMode('inline');
        }
    };

    private readonly _onFullscreenChange = (): void => {
        let isFullscreen: boolean = false;
        if (fullscreenAPI !== undefined) {
            const fullscreenElement = document[fullscreenAPI.fullscreenElement_];
            if (fullscreenElement) {
                // If <theoplayer-ui> is nested within another custom element,
                // then document.fullscreenElement will equal that other custom element.
                // Look for the nearest shadow host that is contained in the fullscreen element.
                isFullscreen = containsComposedNode(fullscreenElement, this);
            }
        }
        if (!isFullscreen && this._player !== undefined && this._player.presentation.currentMode === 'fullscreen') {
            isFullscreen = true;
        }
        this.fullscreen = isFullscreen;
    };
}

customElements.define('theoplayer-ui', UIContainer);

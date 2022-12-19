import * as shadyCss from '@webcomponents/shadycss';
import { ChromelessPlayer, type PlayerConfiguration, type SourceDescription } from 'theoplayer';
import elementCss from './UIContainer.css';
import elementHtml from './UIContainer.html';
import { arrayFind, arrayRemove, containsComposedNode, isElement, isHTMLElement, noOp } from './util/CommonUtils';
import { forEachStateReceiverElement, StateReceiverElement, StateReceiverProps } from './components/StateReceiverMixin';
import { OPEN_MENU_EVENT, type OpenMenuEvent } from './events/OpenMenuEvent';
import { CLOSE_MENU_EVENT, type CloseMenuEvent } from './events/CloseMenuEvent';
import { ENTER_FULLSCREEN_EVENT, EnterFullscreenEvent } from './events/EnterFullscreenEvent';
import { EXIT_FULLSCREEN_EVENT, ExitFullscreenEvent } from './events/ExitFullscreenEvent';
import { fullscreenAPI } from './util/FullscreenUtils';
import { Attribute } from './util/Attribute';
import { KeyCode } from './util/KeyCode';

const template = document.createElement('template');
template.innerHTML = `<style>${elementCss}</style>${elementHtml}`;
shadyCss.prepareTemplate(template, 'theoplayer-ui');

export class UIContainer extends HTMLElement {
    static get observedAttributes() {
        return [Attribute.CONFIGURATION, Attribute.SOURCE, Attribute.AUTOPLAY, Attribute.FULLSCREEN];
    }

    private _configuration: PlayerConfiguration = {};
    private readonly _playerEl: HTMLElement;
    private readonly _menuEl: HTMLElement;
    private _menus: HTMLElement[] = [];
    private readonly _menuSlot: HTMLSlotElement;
    private readonly _openMenuStack: HTMLElement[] = [];
    private readonly _mutationObserver: MutationObserver;
    private readonly _stateReceivers: StateReceiverElement[] = [];
    private _player: ChromelessPlayer | undefined = undefined;
    private _source: SourceDescription | undefined = undefined;

    constructor(configuration: PlayerConfiguration = {}) {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._configuration = configuration;

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

    get configuration(): PlayerConfiguration {
        return this._configuration;
    }

    set configuration(playerConfiguration: PlayerConfiguration) {
        this._configuration = playerConfiguration ?? {};
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
        return this.hasAttribute(Attribute.AUTOPLAY);
    }

    set autoplay(value: boolean) {
        if (value) {
            this.setAttribute(Attribute.AUTOPLAY, '');
        } else {
            this.removeAttribute(Attribute.AUTOPLAY);
        }
    }

    get fullscreen(): boolean {
        return this.hasAttribute(Attribute.FULLSCREEN);
    }

    set fullscreen(value: boolean) {
        if (value) {
            this.setAttribute(Attribute.FULLSCREEN, '');
        } else {
            this.removeAttribute(Attribute.FULLSCREEN);
        }
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        this._upgradeProperty('configuration');
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
        if (this._configuration.libraryLocation === undefined) {
            return;
        }
        if (this._configuration.license === undefined && this._configuration.licenseUrl === undefined) {
            return;
        }

        this._player = new ChromelessPlayer(this._playerEl, this._configuration);
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
        if (attrName === Attribute.CONFIGURATION) {
            this.configuration = newValue ? (JSON.parse(newValue) as PlayerConfiguration) : {};
            this.tryInitializePlayer_();
        } else if (attrName === Attribute.SOURCE) {
            this.source = newValue ? (JSON.parse(newValue) as SourceDescription) : undefined;
        } else if (attrName === Attribute.AUTOPLAY) {
            if (this._player) {
                this._player.autoplay = hasValue;
            }
        } else if (attrName === Attribute.FULLSCREEN) {
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

    private openMenu_(menuToOpen: HTMLElement): void {
        arrayRemove(this._openMenuStack, menuToOpen);
        this._openMenuStack.push(menuToOpen);

        for (const menu of this._menus) {
            menu.setAttribute('hidden', '');
        }
        menuToOpen.removeAttribute('hidden');
        menuToOpen.focus();

        if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', '-1');
        }
        this.removeEventListener('keydown', this._onMenuKeyDown);
        this.addEventListener('keydown', this._onMenuKeyDown);

        this.setAttribute(Attribute.MENU_OPENED, '');
    }

    private closeMenu_(menuToClose: HTMLElement): void {
        arrayRemove(this._openMenuStack, menuToClose);
        menuToClose.setAttribute('hidden', '');
        menuToClose.blur();

        if (this._openMenuStack.length > 0) {
            const nextMenu = this._openMenuStack[this._openMenuStack.length - 1];
            nextMenu.removeAttribute('hidden');
            nextMenu.focus();
            this.setAttribute(Attribute.MENU_OPENED, '');
            return;
        }

        this.removeEventListener('keydown', this._onMenuKeyDown);
        this.removeAttribute(Attribute.MENU_OPENED);
    }

    private closeCurrentMenu_(): void {
        if (this._openMenuStack.length > 0) {
            this.closeMenu_(this._openMenuStack[this._openMenuStack.length - 1]);
        }
    }

    private _onMenuSlotChange = () => {
        const newMenus = this._menuSlot.assignedNodes().filter(isHTMLElement);
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
        this.openMenu_(menuToOpen);
    };

    private readonly _onCloseMenu = (rawEvent: Event): void => {
        const event = rawEvent as CloseMenuEvent;
        event.stopPropagation();
        const menuToClose = event.currentTarget as HTMLElement;
        this.closeMenu_(menuToClose);
    };

    private readonly _onMenuKeyDown = (event: KeyboardEvent) => {
        // Don't handle modifier shortcuts typically used by assistive technology.
        if (event.altKey) return;

        switch (event.keyCode) {
            case KeyCode.ESCAPE:
                event.preventDefault();
                this.closeCurrentMenu_();
                break;
            // Any other key press is ignored and passed back to the browser.
            default:
                return;
        }
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

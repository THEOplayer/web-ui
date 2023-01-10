import * as shadyCss from '@webcomponents/shadycss';
import { ChromelessPlayer, type PlayerConfiguration, type SourceDescription } from 'theoplayer';
import elementCss from './UIContainer.css';
import elementHtml from './UIContainer.html';
import { arrayFind, arrayFindIndex, arrayRemove, arrayRemoveAt, containsComposedNode, isElement, isHTMLElement, noOp } from './util/CommonUtils';
import { forEachStateReceiverElement, StateReceiverElement, StateReceiverProps } from './components/StateReceiverMixin';
import { OPEN_MENU_EVENT, type OpenMenuEvent } from './events/OpenMenuEvent';
import { CLOSE_MENU_EVENT, type CloseMenuEvent } from './events/CloseMenuEvent';
import { ENTER_FULLSCREEN_EVENT, EnterFullscreenEvent } from './events/EnterFullscreenEvent';
import { EXIT_FULLSCREEN_EVENT, ExitFullscreenEvent } from './events/ExitFullscreenEvent';
import { fullscreenAPI } from './util/FullscreenUtils';
import { Attribute } from './util/Attribute';
import { KeyCode } from './util/KeyCode';
import { isMobile } from './util/Environment';
import { Rectangle } from './util/GeometryUtils';
import './components/GestureReceiver';

const template = document.createElement('template');
template.innerHTML = `<style>${elementCss}</style>${elementHtml}`;
shadyCss.prepareTemplate(template, 'theoplayer-ui');

interface OpenMenuEntry {
    menu: HTMLElement;
    opener: HTMLElement | undefined;
}

export class UIContainer extends HTMLElement {
    static get observedAttributes() {
        return [
            Attribute.CONFIGURATION,
            Attribute.SOURCE,
            Attribute.AUTOPLAY,
            Attribute.FULLSCREEN,
            Attribute.FLUID,
            Attribute.MOBILE,
            Attribute.PAUSED,
            Attribute.ENDED,
            Attribute.CASTING,
            Attribute.HAS_ERROR,
            Attribute.USER_IDLE,
            Attribute.USER_IDLE_TIMEOUT
        ];
    }

    private _configuration: PlayerConfiguration = {};
    private readonly _playerEl: HTMLElement;
    private readonly _menuEl: HTMLElement;
    private readonly _menuSlot: HTMLSlotElement;
    private readonly _topChromeSlot: HTMLSlotElement;
    private readonly _bottomChromeSlot: HTMLSlotElement;

    private _menus: HTMLElement[] = [];
    private readonly _openMenuStack: OpenMenuEntry[] = [];
    private _pointerType: string = '';
    private readonly _mutationObserver: MutationObserver;
    private readonly _resizeObserver: ResizeObserver | undefined;
    private readonly _stateReceivers: StateReceiverElement[] = [];
    private _player: ChromelessPlayer | undefined = undefined;
    private _source: SourceDescription | undefined = undefined;

    private _userIdleTimeout: number = 2;
    private _userIdleTimer: number = 0;

    constructor(configuration: PlayerConfiguration = {}) {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open', delegatesFocus: true });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._configuration = configuration;

        this._playerEl = shadowRoot.querySelector('[part~="media-layer"]')!;
        this._menuEl = shadowRoot.querySelector('[part~="menu-layer"]')!;
        this._menuSlot = shadowRoot.querySelector('slot[name="menu"]')!;
        this._topChromeSlot = shadowRoot.querySelector('slot[name="top-chrome"]')!;
        this._bottomChromeSlot = shadowRoot.querySelector('slot:not([name])')!;

        this._mutationObserver = new MutationObserver(this._onMutation);
        if (typeof ResizeObserver !== 'undefined') {
            this._resizeObserver = new ResizeObserver(this._updateTextTrackMargins);
        }

        shadowRoot.addEventListener(OPEN_MENU_EVENT, this._onOpenMenu);
        shadowRoot.addEventListener(ENTER_FULLSCREEN_EVENT, this._onEnterFullscreen);
        shadowRoot.addEventListener(EXIT_FULLSCREEN_EVENT, this._onExitFullscreen);

        this._topChromeSlot.addEventListener('transitionstart', this._onChromeSlotTransition);
        this._topChromeSlot.addEventListener('transitionend', this._onChromeSlotTransition);
        this._bottomChromeSlot.addEventListener('transitionstart', this._onChromeSlotTransition);
        this._bottomChromeSlot.addEventListener('transitionend', this._onChromeSlotTransition);
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    get configuration(): PlayerConfiguration {
        return this._configuration;
    }

    set configuration(playerConfiguration: PlayerConfiguration) {
        this._configuration = playerConfiguration ?? {};
        this.tryInitializePlayer_();
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

    get paused(): boolean {
        return this.hasAttribute(Attribute.PAUSED);
    }

    get ended(): boolean {
        return this.hasAttribute(Attribute.ENDED);
    }

    get userIdleTimeout(): number {
        return this._userIdleTimeout;
    }

    set userIdleTimeout(value: number) {
        value = Number(value);
        this._userIdleTimeout = isNaN(value) ? 0 : value;
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        this._upgradeProperty('configuration');
        this._upgradeProperty('source');
        this._upgradeProperty('autoplay');

        if (!this.hasAttribute(Attribute.MOBILE) && isMobile()) {
            this.setAttribute(Attribute.MOBILE, '');
        }

        this.tryInitializePlayer_();

        for (const receiver of this._stateReceivers) {
            this.propagateStateToReceiver_(receiver);
        }
        void forEachStateReceiverElement(this, this._playerEl, this.registerStateReceiver_);
        this._mutationObserver.observe(this, { childList: true, subtree: true });

        this._resizeObserver?.observe(this);
        this._updateTextTrackMargins();

        this._onMenuSlotChange();
        this._menuSlot.addEventListener('slotchange', this._onMenuSlotChange);

        if (fullscreenAPI !== undefined) {
            document.addEventListener(fullscreenAPI.fullscreenchange_, this._onFullscreenChange);
            document.addEventListener(fullscreenAPI.fullscreenerror_, this._onFullscreenChange);
            this._onFullscreenChange();
        }

        this.setUserIdle_();
        this.addEventListener('keyup', this._onKeyUp);
        this.addEventListener('pointerup', this._onPointerUp);
        this.addEventListener('pointermove', this._onPointerMove);
        this.addEventListener('mouseleave', this._onMouseLeave);
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

        this._updateAspectRatio();
        this._updateError();
        this._updatePaused();
        this._updateCasting();
        this._player.addEventListener('resize', this._updateAspectRatio);
        this._player.addEventListener(['error', 'emptied'], this._updateError);
        this._player.addEventListener(['play', 'pause', 'ended', 'emptied'], this._updatePaused);
        this._player.cast?.addEventListener('castingchange', this._updateCasting);
    }

    disconnectedCallback(): void {
        this._resizeObserver?.disconnect();
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

        this.removeEventListener('keyup', this._onKeyUp);
        this.removeEventListener('pointerup', this._onPointerUp);
        this.removeEventListener('pointermove', this._onPointerMove);
        this.removeEventListener('mouseleave', this._onMouseLeave);

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
        } else if (attrName === Attribute.FLUID) {
            this._updateAspectRatio();
        } else if (attrName === Attribute.USER_IDLE || attrName === Attribute.PAUSED || attrName === Attribute.CASTING) {
            this._updateTextTrackMargins();
        } else if (attrName === Attribute.USER_IDLE_TIMEOUT) {
            this.userIdleTimeout = newValue;
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
        if (receiverProps.indexOf('error') >= 0) {
            receiver.setError!(this._player?.errorObject);
        }
    }

    private removeStateFromReceiver_(receiver: StateReceiverElement): void {
        const receiverProps = receiver[StateReceiverProps];
        if (receiverProps.indexOf('player') >= 0) {
            receiver.setPlayer!(undefined);
        }
    }

    private openMenu_(menuToOpen: HTMLElement, opener: HTMLElement | undefined): void {
        const index = arrayFindIndex(this._openMenuStack, (entry) => entry.menu === menuToOpen);
        if (index >= 0) {
            arrayRemoveAt(this._openMenuStack, index);
        }
        this._openMenuStack.push({ menu: menuToOpen, opener });

        for (const menu of this._menus) {
            menu.setAttribute('hidden', '');
        }
        menuToOpen.removeAttribute('hidden');
        this.setAttribute(Attribute.MENU_OPENED, '');

        if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', '-1');
        }
        this.removeEventListener('keydown', this._onMenuKeyDown);
        this.addEventListener('keydown', this._onMenuKeyDown);
        this._menuEl.removeEventListener('pointerdown', this._onMenuPointerDown);
        this._menuEl.removeEventListener('click', this._onMenuClick);
        this._menuEl.addEventListener('pointerdown', this._onMenuPointerDown);
        this._menuEl.addEventListener('click', this._onMenuClick);

        menuToOpen.focus();
    }

    private closeMenu_(menuToClose: HTMLElement): void {
        const index = arrayFindIndex(this._openMenuStack, (entry) => entry.menu === menuToClose);
        let oldEntry: OpenMenuEntry | undefined;
        if (index >= 0) {
            oldEntry = this._openMenuStack[index];
            arrayRemoveAt(this._openMenuStack, index);
        }

        menuToClose.setAttribute('hidden', '');

        if (this._openMenuStack.length > 0) {
            const nextEntry = this._openMenuStack[this._openMenuStack.length - 1];
            nextEntry.menu.removeAttribute('hidden');
            this.setAttribute(Attribute.MENU_OPENED, '');
            if (oldEntry && oldEntry.opener && nextEntry.menu.contains(oldEntry.opener)) {
                oldEntry.opener.focus();
            } else {
                nextEntry.menu.focus();
            }
            return;
        }

        this.removeEventListener('keydown', this._onMenuKeyDown);
        this._menuEl.removeEventListener('pointerdown', this._onMenuPointerDown);
        this._menuEl.removeEventListener('click', this._onMenuClick);
        this.removeAttribute(Attribute.MENU_OPENED);

        oldEntry?.opener?.focus();
    }

    private closeCurrentMenu_(): void {
        if (this._openMenuStack.length > 0) {
            this.closeMenu_(this._openMenuStack[this._openMenuStack.length - 1].menu);
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
        const opener = isHTMLElement(event.target) ? event.target : undefined;
        this.openMenu_(menuToOpen, opener);
    };

    private readonly _onCloseMenu = (rawEvent: Event): void => {
        const event = rawEvent as CloseMenuEvent;
        event.stopPropagation();
        const menuToClose = event.currentTarget as HTMLElement;
        this.closeMenu_(menuToClose);
    };

    private readonly _onMenuPointerDown = (event: PointerEvent) => {
        this._pointerType = event.pointerType;
    };

    private readonly _onMenuClick = (event: MouseEvent) => {
        // If the browser doesn't support yet `pointerType` on `click` events,
        // we use the type from the previous `pointerdown` event.
        const pointerType = (event as PointerEvent).pointerType ?? this._pointerType;
        if (event.target === this._menuEl && pointerType === 'mouse') {
            // Close menu when clicking (with mouse) on menu backdrop
            event.preventDefault();
            this.closeCurrentMenu_();
        }
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
        if (isFullscreen) {
            this.setAttribute(Attribute.FULLSCREEN, '');
        } else {
            this.removeAttribute(Attribute.FULLSCREEN);
        }
    };

    private readonly _updateAspectRatio = (): void => {
        if (!this.hasAttribute(Attribute.FLUID) || this._player === undefined) {
            return;
        }
        const { videoWidth, videoHeight } = this._player;
        if (videoWidth > 0 && videoHeight > 0) {
            this.style.paddingBottom = `${((videoHeight / videoWidth) * 100).toFixed(3)}%`;
        } else {
            this.style.paddingBottom = '';
        }
    };

    private readonly _updateError = (): void => {
        const error = this._player?.errorObject;
        if (error) {
            this.setAttribute(Attribute.HAS_ERROR, '');
        } else {
            this.removeAttribute(Attribute.HAS_ERROR);
        }
        for (const receiver of this._stateReceivers) {
            if (receiver[StateReceiverProps].indexOf('error') >= 0) {
                receiver.setError!(error);
            }
        }
    };

    private readonly _updatePaused = (): void => {
        const paused = this._player ? this._player.paused : true;
        const ended = this._player ? this._player.ended : false;
        if (paused) {
            this.setAttribute(Attribute.PAUSED, '');
        } else {
            this.removeAttribute(Attribute.PAUSED);
        }
        if (ended) {
            this.setAttribute(Attribute.ENDED, '');
        } else {
            this.removeAttribute(Attribute.ENDED);
        }
    };

    private readonly _updateCasting = (): void => {
        const casting = this._player?.cast?.casting ?? false;
        if (casting) {
            this.setAttribute(Attribute.CASTING, '');
        } else {
            this.removeAttribute(Attribute.CASTING);
        }
    };

    private setUserActive_(): void {
        clearTimeout(this._userIdleTimer);
        this.removeAttribute(Attribute.USER_IDLE);
    }

    private readonly setUserIdle_ = (): void => {
        clearTimeout(this._userIdleTimer);
        this._userIdleTimer = 0;

        if (this.userIdleTimeout < 0) {
            return;
        }

        this.setAttribute(Attribute.USER_IDLE, '');
    };

    private readonly scheduleUserIdle_ = (): void => {
        this.setUserActive_();

        clearTimeout(this._userIdleTimer);

        // Setting the timeout to -1 turns off idle detection.
        if (this.userIdleTimeout < 0) {
            this._userIdleTimer = 0;
            return;
        }

        this._userIdleTimer = setTimeout(this.setUserIdle_, this.userIdleTimeout * 1000);
    };

    private isPlayerOrMedia_(node: Node): boolean {
        return node === this || this._playerEl.contains(node);
    }

    private readonly _onKeyUp = (): void => {
        // Show the controls while navigating with the keyboard.
        this.scheduleUserIdle_();
    };

    private readonly _onPointerUp = (event: PointerEvent): void => {
        if (event.pointerType === 'touch') {
            // On mobile, when you tap the media while the controls are showing, immediately hide the controls.
            // Otherwise, show the controls (and schedule a timer to hide them again later on).
            if (this.isPlayerOrMedia_(event.target! as Node) && !this.hasAttribute(Attribute.USER_IDLE)) {
                this.setUserIdle_();
            } else {
                this.scheduleUserIdle_();
            }
        }
    };

    private readonly _onPointerMove = (event: PointerEvent): void => {
        // "pointermove" doesn't happen with touch on taps on iOS, but does on Android. Therefore, only run for mouse.
        if (event.pointerType !== 'mouse') return;

        this.setUserActive_();

        // If hovering a control, keep the user active even when they stop moving.
        // Otherwise, when hovering the media, we can consider the user to be idle.
        if (this.isPlayerOrMedia_(event.target! as Node)) {
            this.scheduleUserIdle_();
        }
    };

    private readonly _onMouseLeave = (): void => {
        // Immediately hide the controls when mouse leaves the player.
        this.setUserIdle_();
    };

    private readonly _onChromeSlotTransition = (event: TransitionEvent): void => {
        // When the control bars become visible, move the text tracks out of the way.
        // When they become invisible, move the text tracks back.
        if (event.propertyName === 'opacity') {
            this._updateTextTrackMargins();
        }
    };

    private readonly _updateTextTrackMargins = (): void => {
        const player = this._player;
        if (player === undefined) {
            return;
        }
        const topChromeRect = getVisibleRect(this._topChromeSlot);
        const bottomChromeRect = getVisibleRect(this._bottomChromeSlot);
        player.textTrackStyle.marginTop = topChromeRect?.height;
        player.textTrackStyle.marginBottom = bottomChromeRect?.height;
    };
}

customElements.define('theoplayer-ui', UIContainer);

function getVisibleRect(slot: HTMLSlotElement): Rectangle | undefined {
    let result: Rectangle | undefined;
    const children = slot.assignedNodes().filter(isHTMLElement);
    for (const child of children) {
        if (getComputedStyle(child).opacity !== '0') {
            const childRect = Rectangle.fromRect(child.getBoundingClientRect());
            if (childRect.width > 0 && childRect.height > 0) {
                result = result ? result.union(childRect) : childRect;
            }
        }
    }
    return result;
}

import * as shadyCss from '@webcomponents/shadycss';
import { ChromelessPlayer, type MediaTrack, type PlayerConfiguration, type SourceDescription, type VideoQuality } from 'theoplayer/chromeless';
import elementCss from './UIContainer.css';
import elementHtml from './UIContainer.html';
import {
    arrayFind,
    arrayRemove,
    containsComposedNode,
    getFocusableChildren,
    getSlottedElements,
    getTvFocusChildren,
    isElement,
    isHTMLElement,
    noOp,
    toggleAttribute
} from './util/CommonUtils';
import { forEachStateReceiverElement, type StateReceiverElement, StateReceiverProps } from './components/StateReceiverMixin';
import { TOGGLE_MENU_EVENT, type ToggleMenuEvent } from './events/ToggleMenuEvent';
import { CLOSE_MENU_EVENT } from './events/CloseMenuEvent';
import { ENTER_FULLSCREEN_EVENT, type EnterFullscreenEvent } from './events/EnterFullscreenEvent';
import { EXIT_FULLSCREEN_EVENT, type ExitFullscreenEvent } from './events/ExitFullscreenEvent';
import { fullscreenAPI } from './util/FullscreenUtils';
import { Attribute } from './util/Attribute';
import { isMobile, isTv } from './util/Environment';
import { Rectangle } from './util/GeometryUtils';
import { PREVIEW_TIME_CHANGE_EVENT, type PreviewTimeChangeEvent } from './events/PreviewTimeChangeEvent';
import type { StreamType } from './util/StreamType';
import type { StreamTypeChangeEvent } from './events/StreamTypeChangeEvent';
import { STREAM_TYPE_CHANGE_EVENT } from './events/StreamTypeChangeEvent';
import { createCustomEvent } from './util/EventUtils';
import { getTargetQualities } from './util/TrackUtils';
import { MenuGroup } from './components/MenuGroup';
import { MENU_CHANGE_EVENT } from './events/MenuChangeEvent';
import type { DeviceType } from './util/DeviceType';
import { getFocusedChild, navigateByArrowKey } from './util/KeyboardNavigation';
import { isArrowKey, isBackKey, KeyCode } from './util/KeyCode';
import { READY_EVENT } from './events/ReadyEvent';
import { createTemplate } from './util/TemplateUtils';

// Load components used in template
import './components/GestureReceiver';

const template = createTemplate('theoplayer-ui', `<style>${elementCss}</style>${elementHtml}`);

const DEFAULT_USER_IDLE_TIMEOUT = 2;
const DEFAULT_TV_USER_IDLE_TIMEOUT = 5;
const DEFAULT_DVR_THRESHOLD = 60;

/**
 * `<theoplayer-ui>` - The container element for a THEOplayer UI.
 *
 * This element provides a basic layout structure for a general player UI, and handles the creation and management
 * of a {@link theoplayer!ChromelessPlayer | THEOplayer player instance} for this UI.
 *
 * ## Usage
 *
 * 1. Create a `<theoplayer-ui>` element.
 * 2. Place your UI elements as children of the `<theoplayer-ui>`.
 *    Set their `slot` attribute to one of the defined slots (see below) to place them in the layout.
 * 3. Set its `configuration` attribute or property to a valid player configuration.
 * 4. Set its `source` attribute or property to a valid stream source.
 *
 * ## Customization
 *
 * This element does not provide any UI elements by default, you need to add all elements as children of
 * the `<theoplayer-ui>` element. If you're looking for a simple out-of-the-box player experience instead,
 * see {@link DefaultUI | `<theoplayer-default-ui>`}.
 *
 * The styling can be controlled using CSS custom properties (see below).
 *
 * @attribute `configuration` - The THEOplayer {@link theoplayer!PlayerConfiguration | PlayerConfiguration}, as a JSON string.
 * @attribute `source` - The THEOplayer {@link theoplayer!SourceDescription | SourceDescription}, as a JSON string.
 * @attribute `fluid` - If set, the player automatically adjusts its height to fit the video's aspect ratio.
 * @attribute `muted` - If set, the player starts out as muted. Reflects `ui.player.muted`.
 * @attribute `autoplay` - If set, the player attempts to automatically start playing (if allowed).
 * @attribute `device-type` - The device type, either "desktop", "mobile" or "tv".
 *   Can be used in CSS to show/hide certain device-specific UI controls.
 * @attribute `mobile` - Whether the user is on a mobile device. Equivalent to `device-type == "mobile"`.
 * @attribute `tv` - Whether the user is on a TV device. Equivalent to `device-type == "tv"`.
 * @attribute `stream-type` - The stream type, either "vod", "live" or "dvr".
 *   Can be used to show/hide certain UI controls specific for livestreams, such as
 *   a {@link LiveButton | `<theoplayer-live-button>`}.
 *   If you know in advance that the source will be a livestream, you can set this attribute to avoid a screen flicker
 *   when the player switches between its VOD-specific and live-only controls.
 * @attribute `user-idle` (readonly) - Whether the user is considered to be "idle".
 *   When the user is idle and the video is playing, all slotted UI elements will be hidden
 *   (unless they have the `no-auto-hide` attribute).
 * @attribute `user-idle-timeout` - The timeout (in seconds) between when the user stops interacting with the UI,
 *   and when the user is considered to be "idle".
 * @attribute `dvr-threshold` - The minimum length (in seconds) of a livestream's sliding window for the stream to be DVR
 *   and its stream type to be set to "dvr".
 * @attribute `paused` (readonly) - Whether the player is paused. Reflects `ui.player.paused`.
 * @attribute `ended` (readonly) - Whether the player is ended. Reflects `ui.player.ended`.
 * @attribute `casting` (readonly) - Whether the player is casting. Reflects `ui.player.cast.casting`.
 * @attribute `playing-ad` (readonly) - Whether the player is playing a linear ad. Reflects `ui.player.ads.playing`.
 * @attribute `has-error` (readonly) - Whether the player has encountered a fatal error.
 * @attribute `has-first-play` (readonly) - Whether the player has (previously) started playback for this stream.
 *   Can be used in CSS to show/hide certain initial controls, such as a poster image or a centered play button.
 *
 * @slot `(no` name, default slot) - A slot for controls at the bottom of the player.
 *   Can be used for controls such as a play button ({@link PlayButton | `<theoplayer-play-button>`}) or a seek bar
 *   ({@link TimeRange | `<theoplayer-time-range>`}).
 * @slot `top-chrome` - A slot for controls at the top of the player.
 *   Can be used to display the stream's title, or for a cast button ({@link ChromecastButton | `<theoplayer-chromecast-button>`}).
 * @slot `middle-chrome` - A slot for controls in the middle of the player (between the top and bottom chrome).
 * @slot `centered-chrome` - A slot for controls centered on the player, on top of other controls.
 * @slot `centered-loading` - A slot for a loading indicator centered on the player, on top of other controls
 *   but behind the centered chrome.
 * @slot `menu` - A slot for extra menus (see {@link Menu | `<theoplayer-menu>`}).
 * @slot `error` - A slot for an error display, to show when the player encounters a fatal error
 *   (see {@link ErrorDisplay | `<theoplayer-error-display>`}).
 * @group Components
 */
export class UIContainer extends HTMLElement {
    /**
     * Fired when the backing player is created, and the {@link UIContainer.player} property is set.
     *
     * @group Events
     */
    static READY_EVENT: typeof READY_EVENT = READY_EVENT;

    static get observedAttributes() {
        return [
            Attribute.CONFIGURATION,
            Attribute.SOURCE,
            Attribute.MUTED,
            Attribute.AUTOPLAY,
            Attribute.FULLSCREEN,
            Attribute.FLUID,
            Attribute.DEVICE_TYPE,
            Attribute.PAUSED,
            Attribute.ENDED,
            Attribute.CASTING,
            Attribute.PLAYING_AD,
            Attribute.HAS_ERROR,
            Attribute.HAS_FIRST_PLAY,
            Attribute.STREAM_TYPE,
            Attribute.DVR_THRESHOLD,
            Attribute.USER_IDLE,
            Attribute.USER_IDLE_TIMEOUT
        ];
    }

    private _configuration: PlayerConfiguration = {};
    private readonly _playerEl: HTMLElement;
    private readonly _menuEl: HTMLElement;
    private readonly _menuGroup: MenuGroup;
    private _menuOpener: HTMLElement | undefined;
    private readonly _topChromeEl: HTMLElement;
    private readonly _topChromeSlot: HTMLSlotElement;
    private readonly _bottomChromeEl: HTMLElement;
    private readonly _bottomChromeSlot: HTMLSlotElement;

    private _pointerType: string = '';
    private _lastPointerUpTime: number = 0;
    private readonly _mutationObserver: MutationObserver;
    private readonly _resizeObserver: ResizeObserver | undefined;
    private readonly _stateReceivers: StateReceiverElement[] = [];
    private _player: ChromelessPlayer | undefined = undefined;
    private _source: SourceDescription | undefined = undefined;
    private _userIdleTimer: number = 0;
    private _previewTime: number = NaN;
    private _activeVideoTrack: MediaTrack | undefined = undefined;

    /**
     * Creates a new THEOplayer UI container element.
     *
     * @param configuration - The player configuration.
     *   Will be passed to the {@link theoplayer!ChromelessPlayer | ChromelessPlayer} constructor to create
     *   the underlying THEOplayer instance.
     *   Can also be set later on through the {@link configuration} property.
     */
    constructor(configuration: PlayerConfiguration = {}) {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open', delegatesFocus: true });
        shadowRoot.appendChild(template().content.cloneNode(true));

        this._configuration = configuration;

        this._playerEl = shadowRoot.querySelector('[part~="media-layer"]')!;
        this._menuEl = shadowRoot.querySelector('[part~="menu-layer"]')!;
        this._menuGroup = shadowRoot.querySelector('theoplayer-menu-group')!;
        this._topChromeEl = shadowRoot.querySelector('[part~="top"]')!;
        this._topChromeSlot = shadowRoot.querySelector('slot[name="top-chrome"]')!;
        this._bottomChromeEl = shadowRoot.querySelector('[part~="bottom"]')!;
        this._bottomChromeSlot = shadowRoot.querySelector('slot:not([name])')!;

        this._mutationObserver = new MutationObserver(this._onMutation);
        if (typeof ResizeObserver !== 'undefined') {
            this._resizeObserver = new ResizeObserver(this._updateTextTrackMargins);
        }

        shadowRoot.addEventListener(TOGGLE_MENU_EVENT, this._onToggleMenu);
        shadowRoot.addEventListener(ENTER_FULLSCREEN_EVENT, this._onEnterFullscreen);
        shadowRoot.addEventListener(EXIT_FULLSCREEN_EVENT, this._onExitFullscreen);
        shadowRoot.addEventListener(PREVIEW_TIME_CHANGE_EVENT, this._onPreviewTimeChange);

        this._topChromeSlot.addEventListener('transitionstart', this._onChromeSlotTransition);
        this._topChromeSlot.addEventListener('transitionend', this._onChromeSlotTransition);
        this._bottomChromeSlot.addEventListener('transitionstart', this._onChromeSlotTransition);
        this._bottomChromeSlot.addEventListener('transitionend', this._onChromeSlotTransition);

        this._upgradeProperty('configuration');
        this._upgradeProperty('source');
        this._upgradeProperty('fluid');
        this._upgradeProperty('muted');
        this._upgradeProperty('autoplay');
        this._upgradeProperty('userIdleTimeout');
        this._upgradeProperty('streamType');

        this.tryInitializePlayer_();
    }

    private _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    /**
     * The underlying THEOplayer player instance.
     *
     * This is constructed automatically as soon as a valid {@link configuration} is set.
     */
    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    /**
     * The player configuration.
     *
     * Used to create the underlying THEOplayer instance.
     */
    get configuration(): PlayerConfiguration {
        return this._configuration;
    }

    set configuration(playerConfiguration: PlayerConfiguration) {
        this.removeAttribute(Attribute.CONFIGURATION);
        this._setConfiguration(playerConfiguration);
    }

    private _setConfiguration(playerConfiguration: PlayerConfiguration): void {
        this._configuration = playerConfiguration ?? {};
        this.tryInitializePlayer_();
    }

    /**
     * The player's current source.
     */
    get source(): SourceDescription | undefined {
        return this._player ? this._player.source : this._source;
    }

    set source(value: SourceDescription | undefined) {
        this.removeAttribute(Attribute.SOURCE);
        this._setSource(value);
    }

    private _setSource(value: SourceDescription | undefined): void {
        if (this._player) {
            this._player.source = value;
        } else {
            this._source = value;
        }
    }

    /**
     * Whether to automatically adjusts the player's height to fit the video's aspect ratio.
     */
    get fluid(): boolean {
        return this.hasAttribute(Attribute.FLUID);
    }

    set fluid(value: boolean) {
        toggleAttribute(this, Attribute.FLUID, value);
    }

    /**
     * Whether the player's audio is muted.
     */
    get muted(): boolean {
        return this.hasAttribute(Attribute.MUTED);
    }

    set muted(value: boolean) {
        toggleAttribute(this, Attribute.MUTED, value);
    }

    /**
     * Whether the player should attempt to automatically start playback.
     */
    get autoplay(): boolean {
        return this.hasAttribute(Attribute.AUTOPLAY);
    }

    set autoplay(value: boolean) {
        toggleAttribute(this, Attribute.AUTOPLAY, value);
    }

    /**
     * Whether the UI is in fullscreen mode.
     */
    get fullscreen(): boolean {
        return this.hasAttribute(Attribute.FULLSCREEN);
    }

    /**
     * Whether the player is paused.
     */
    get paused(): boolean {
        return this.hasAttribute(Attribute.PAUSED);
    }

    /**
     * Whether the player is ended.
     */
    get ended(): boolean {
        return this.hasAttribute(Attribute.ENDED);
    }

    /**
     * Whether the player is casting to a remote receiver.
     */
    get casting(): boolean {
        return this.hasAttribute(Attribute.CASTING);
    }

    /**
     * The timeout (in seconds) between when the user stops interacting with the UI,
     * and when the user is considered to be "idle".
     */
    get userIdleTimeout(): number {
        const defaultTimeout = this.deviceType === 'tv' ? DEFAULT_TV_USER_IDLE_TIMEOUT : DEFAULT_USER_IDLE_TIMEOUT;
        return Number(this.getAttribute(Attribute.USER_IDLE_TIMEOUT) ?? defaultTimeout);
    }

    set userIdleTimeout(value: number) {
        value = Number(value);
        this.setAttribute(Attribute.USER_IDLE_TIMEOUT, String(isNaN(value) ? 0 : value));
    }

    /**
     * The device type, either "desktop", "mobile" or "tv".
     */
    get deviceType(): DeviceType {
        return (this.getAttribute(Attribute.DEVICE_TYPE) as DeviceType) || 'desktop';
    }

    /**
     * The stream type, either "vod", "live" or "dvr".
     *
     * If you know in advance that the source will be a livestream, you can set this property to avoid a screen flicker
     * when the player switches between its VOD-specific and live-only controls.
     */
    get streamType(): StreamType {
        return (this.getAttribute(Attribute.STREAM_TYPE) as StreamType) || 'vod';
    }

    set streamType(streamType: StreamType) {
        this.setAttribute(Attribute.STREAM_TYPE, streamType);
    }

    /**
     * The minimum length (in seconds) of a livestream's sliding window for the stream to be DVR
     * and its stream type to be set to "dvr".
     */
    get dvrThreshold(): number {
        return Number(this.getAttribute(Attribute.DVR_THRESHOLD) ?? DEFAULT_DVR_THRESHOLD);
    }

    set dvrThreshold(value: number) {
        value = Number(value);
        this.setAttribute(Attribute.DVR_THRESHOLD, String(isNaN(value) ? 0 : value));
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        if (!(this._menuGroup instanceof MenuGroup)) {
            customElements.upgrade(this._menuGroup);
        }

        if (!this.hasAttribute(Attribute.DEVICE_TYPE)) {
            const deviceType: DeviceType = isMobile() ? 'mobile' : isTv() ? 'tv' : 'desktop';
            this.setAttribute(Attribute.DEVICE_TYPE, deviceType);
        }
        if (!this.hasAttribute(Attribute.PAUSED)) {
            this.setAttribute(Attribute.PAUSED, '');
        }

        this.tryInitializePlayer_();

        for (const receiver of this._stateReceivers) {
            this.propagateStateToReceiver_(receiver);
        }
        void forEachStateReceiverElement(this, this._playerEl, this.registerStateReceiver_);
        this._mutationObserver.observe(this, { childList: true, subtree: true });
        this.shadowRoot!.addEventListener('slotchange', this._onSlotChange);

        this._resizeObserver?.observe(this);
        this._updateTextTrackMargins();

        this._menuGroup.addEventListener(CLOSE_MENU_EVENT, this._onCloseMenu);
        this._menuGroup.addEventListener(MENU_CHANGE_EVENT, this._onMenuChange);

        if (fullscreenAPI !== undefined) {
            document.addEventListener(fullscreenAPI.fullscreenchange_, this._onFullscreenChange);
            document.addEventListener(fullscreenAPI.fullscreenerror_, this._onFullscreenChange);
            this._onFullscreenChange();
        }

        this.setUserIdle_();
        if (this.deviceType === 'tv') {
            window.addEventListener('keydown', this._onTvKeyDown);
        }
        this.addEventListener('keyup', this._onKeyUp);
        this.addEventListener('pointerup', this._onPointerUp);
        this.addEventListener('pointermove', this._onPointerMove);
        this.addEventListener('mouseleave', this._onMouseLeave);
    }

    private tryInitializePlayer_(): void {
        if (this._player !== undefined) {
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
        this._player.muted = this.muted;
        this._player.autoplay = this.autoplay;

        for (const receiver of this._stateReceivers) {
            if (receiver[StateReceiverProps].indexOf('player') >= 0) {
                receiver.player = this._player;
            }
        }

        this._updateAspectRatio();
        this._updateError();
        this._updatePausedAndEnded();
        this._updateCasting();
        this._addPlayerListeners(this._player);

        this.dispatchEvent(createCustomEvent(READY_EVENT));
    }

    disconnectedCallback(): void {
        this._resizeObserver?.disconnect();
        this._mutationObserver.disconnect();
        this.shadowRoot!.removeEventListener('slotchange', this._onSlotChange);
        for (const receiver of this._stateReceivers) {
            this.removeStateFromReceiver_(receiver);
        }
        this._stateReceivers.length = 0;

        this._menuGroup.removeEventListener(CLOSE_MENU_EVENT, this._onCloseMenu);
        this._menuGroup.removeEventListener(MENU_CHANGE_EVENT, this._onMenuChange);

        if (fullscreenAPI !== undefined) {
            document.removeEventListener(fullscreenAPI.fullscreenchange_, this._onFullscreenChange);
            document.removeEventListener(fullscreenAPI.fullscreenerror_, this._onFullscreenChange);
        }

        window.removeEventListener('keydown', this._onTvKeyDown);
        this.removeEventListener('keyup', this._onKeyUp);
        this.removeEventListener('pointerup', this._onPointerUp);
        this.removeEventListener('click', this._onClickAfterPointerUp, true);
        this.removeEventListener('pointermove', this._onPointerMove);
        this.removeEventListener('mouseleave', this._onMouseLeave);

        if (this._player) {
            this._removePlayerListeners(this._player);
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
            this._setConfiguration(newValue ? (JSON.parse(newValue) as PlayerConfiguration) : {});
        } else if (attrName === Attribute.SOURCE) {
            this._setSource(newValue ? (JSON.parse(newValue) as SourceDescription) : undefined);
        } else if (attrName === Attribute.MUTED) {
            if (this._player) {
                this._player.muted = hasValue;
            }
        } else if (attrName === Attribute.AUTOPLAY) {
            if (this._player) {
                this._player.autoplay = hasValue;
            }
        } else if (attrName === Attribute.FULLSCREEN) {
            for (const receiver of this._stateReceivers) {
                if (receiver[StateReceiverProps].indexOf('fullscreen') >= 0) {
                    receiver.fullscreen = hasValue;
                }
            }
        } else if (attrName === Attribute.DEVICE_TYPE) {
            toggleAttribute(this, Attribute.MOBILE, newValue === 'mobile');
            toggleAttribute(this, Attribute.TV, newValue === 'tv');
            window.removeEventListener('keydown', this._onTvKeyDown);
            if (newValue === 'tv') {
                window.addEventListener('keydown', this._onTvKeyDown);
            }
            for (const receiver of this._stateReceivers) {
                if (receiver[StateReceiverProps].indexOf('deviceType') >= 0) {
                    receiver.deviceType = newValue;
                }
            }
        } else if (attrName === Attribute.STREAM_TYPE) {
            for (const receiver of this._stateReceivers) {
                if (receiver[StateReceiverProps].indexOf('streamType') >= 0) {
                    receiver.streamType = newValue;
                }
            }
            const streamTypeChangeEvent: StreamTypeChangeEvent = createCustomEvent(STREAM_TYPE_CHANGE_EVENT, {
                bubbles: true,
                composed: true,
                detail: { streamType: newValue }
            });
            this.dispatchEvent(streamTypeChangeEvent);
        } else if (attrName === Attribute.FLUID) {
            this._updateAspectRatio();
        } else if (attrName === Attribute.USER_IDLE || attrName === Attribute.PAUSED || attrName === Attribute.CASTING) {
            this._updateTextTrackMargins();
        } else if (attrName === Attribute.DVR_THRESHOLD) {
            this._updateStreamType();
        }
        if (UIContainer.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
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

    private readonly _onSlotChange = (): void => {
        void forEachStateReceiverElement(this, this._playerEl, this.registerStateReceiver_);
        this._updateTextTrackMargins();
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
            receiver.player = this._player;
        }
        if (receiverProps.indexOf('fullscreen') >= 0) {
            receiver.fullscreen = this.fullscreen;
        }
        if (receiverProps.indexOf('deviceType') >= 0) {
            receiver.deviceType = this.deviceType;
        }
        if (receiverProps.indexOf('streamType') >= 0) {
            receiver.streamType = this.streamType;
        }
        if (this._player !== undefined) {
            if (receiverProps.indexOf('playbackRate') >= 0) {
                receiver.playbackRate = this._player.playbackRate;
            }
            if (receiverProps.indexOf('error') >= 0) {
                receiver.error = this._player.errorObject;
            }
            if (receiverProps.indexOf('activeVideoQuality') >= 0) {
                receiver.activeVideoQuality = this._activeVideoTrack?.activeQuality as VideoQuality | undefined;
            }
            if (receiverProps.indexOf('targetVideoQualities') >= 0) {
                receiver.targetVideoQualities = getTargetQualities(this._activeVideoTrack) as VideoQuality[] | undefined;
            }
        }
        if (receiverProps.indexOf('previewTime') >= 0) {
            receiver.previewTime = this._previewTime;
        }
    }

    private removeStateFromReceiver_(receiver: StateReceiverElement): void {
        const receiverProps = receiver[StateReceiverProps];
        if (receiverProps.indexOf('player') >= 0) {
            receiver.player = undefined;
        }
    }

    private openMenu_(menuToOpen: string, opener: HTMLElement | undefined): void {
        const topChromeRect = Rectangle.fromRect(this._topChromeEl.getBoundingClientRect());
        const bottomChromeRect = Rectangle.fromRect(this._bottomChromeEl.getBoundingClientRect());

        // Open menu in same quadrant as its opener
        // If there's no opener, open in bottom right corner by default
        let alignBottom: boolean = true;
        let alignRight: boolean = true;
        if (opener !== undefined) {
            const playerRect = Rectangle.fromRect(this.getBoundingClientRect());
            const openerRect = Rectangle.fromRect(opener.getBoundingClientRect());
            if (playerRect.width > 0 && playerRect.height > 0) {
                alignBottom = openerRect.top >= playerRect.top + playerRect.height / 2;
                alignRight = openerRect.left >= playerRect.left + playerRect.width / 2;
            }
        }

        this._menuGroup.openMenu(menuToOpen, opener);
        this._menuOpener = opener;

        const props = {
            '--theoplayer-menu-offset-top': `${Math.round(topChromeRect.height)}px`,
            '--theoplayer-menu-offset-bottom': `${Math.round(bottomChromeRect.height)}px`,
            '--theoplayer-menu-margin-top': alignBottom ? 'auto' : '0',
            '--theoplayer-menu-margin-bottom': alignBottom ? '0' : 'auto',
            '--theoplayer-menu-margin-left': alignRight ? 'auto' : '0',
            '--theoplayer-menu-margin-right': alignRight ? '0' : 'auto'
        };
        shadyCss.styleSubtree(this, props);
    }

    private closeMenu_(): void {
        // Menu group might not be upgraded yet
        this._menuGroup.closeMenu?.();
        this._menuOpener?.focus();
        this._menuOpener = undefined;
    }

    private readonly _onToggleMenu = (rawEvent: Event): void => {
        const event = rawEvent as ToggleMenuEvent;
        event.stopPropagation();
        const menuId = event.detail.menu;
        if (!this._menuGroup.getMenuById(menuId)) {
            console.error(`<theoplayer-ui>: cannot find menu with ID "${menuId}"`);
            return;
        }
        const opener = isHTMLElement(event.target) ? event.target : undefined;
        if (this._menuGroup.isMenuOpen(menuId)) {
            this.closeMenu_();
        } else {
            // Always close the previous menu first
            this.closeMenu_();
            this.openMenu_(menuId, opener);
        }
    };

    private readonly _onCloseMenu = (event: Event): void => {
        event.stopPropagation();
        this.closeMenu_();
    };

    private readonly _onMenuChange = (): void => {
        this._menuEl.removeEventListener('pointerdown', this._onMenuPointerDown);
        this._menuEl.removeEventListener('click', this._onMenuClick);
        if (this._menuGroup.hasCurrentMenu()) {
            this._menuEl.addEventListener('pointerdown', this._onMenuPointerDown);
            this._menuEl.addEventListener('click', this._onMenuClick);
            this.setAttribute(Attribute.MENU_OPENED, '');
        } else {
            this.removeAttribute(Attribute.MENU_OPENED);
        }
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
            if (this._menuGroup.closeCurrentMenu()) {
                event.preventDefault();
            }
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
        toggleAttribute(this, Attribute.FULLSCREEN, isFullscreen);
    };

    private readonly _updateAspectRatio = (): void => {
        if (this._player === undefined) {
            return;
        }
        const { videoWidth, videoHeight } = this._player;
        if (videoWidth > 0 && videoHeight > 0) {
            shadyCss.styleSubtree(this, {
                '--theoplayer-video-width': `${videoWidth}`,
                '--theoplayer-video-height': `${videoHeight}`
            });
        } else {
            shadyCss.styleSubtree(this, {
                '--theoplayer-video-width': '',
                '--theoplayer-video-height': ''
            });
        }
    };

    private readonly _updateError = (): void => {
        const error = this._player?.errorObject;
        toggleAttribute(this, Attribute.HAS_ERROR, error !== undefined);
        for (const receiver of this._stateReceivers) {
            if (receiver[StateReceiverProps].indexOf('error') >= 0) {
                receiver.error = error;
            }
        }
    };

    private readonly _onPlay = (): void => {
        this.setAttribute(Attribute.HAS_FIRST_PLAY, '');
        this.removeAttribute(Attribute.PAUSED);
        this._updateEnded();
    };

    private readonly _onPause = (): void => {
        this.setAttribute(Attribute.PAUSED, '');
        this._updateEnded();
    };

    private readonly _updatePausedAndEnded = (): void => {
        const paused = this._player ? this._player.paused : true;
        toggleAttribute(this, Attribute.PAUSED, paused);
        this._updateEnded();
    };

    private readonly _updateEnded = (): void => {
        const ended = this._player ? this._player.ended : false;
        toggleAttribute(this, Attribute.ENDED, ended);
    };

    private readonly _updateStreamType = (): void => {
        if (this._player === undefined) {
            return;
        }
        const duration = this._player.duration;
        if (isNaN(duration)) {
            return;
        }
        let streamType: StreamType;
        if (duration === Infinity) {
            streamType = 'live';
            const dvrThreshold = this.dvrThreshold;
            const seekable = this._player.seekable;
            if (dvrThreshold <= 0 || (seekable.length > 0 && seekable.end(seekable.length - 1) - seekable.start(0) >= dvrThreshold)) {
                streamType = 'dvr';
            }
        } else {
            streamType = 'vod';
        }
        this.streamType = streamType;
    };

    private readonly _updatePlaybackRate = (): void => {
        if (this._player === undefined) {
            return;
        }
        const playbackRate = this._player.playbackRate;
        for (const receiver of this._stateReceivers) {
            if (receiver[StateReceiverProps].indexOf('playbackRate') >= 0) {
                receiver.playbackRate = playbackRate;
            }
        }
    };

    private readonly _updateMuted = (): void => {
        if (this._player === undefined) {
            return;
        }
        this.muted = this._player.muted;
    };

    private readonly _updateActiveVideoTrack = (): void => {
        if (this._player === undefined) {
            return;
        }
        const activeVideoTrack = arrayFind(this._player.videoTracks, (track) => track.enabled);
        if (this._activeVideoTrack !== activeVideoTrack) {
            this._activeVideoTrack?.removeEventListener('activequalitychanged', this._updateActiveVideoQuality);
            this._activeVideoTrack?.removeEventListener('targetqualitychanged', this._updateTargetVideoQualities);
            this._activeVideoTrack = activeVideoTrack;
            this._updateActiveVideoQuality();
            this._updateTargetVideoQualities();
            this._activeVideoTrack?.addEventListener('activequalitychanged', this._updateActiveVideoQuality);
            this._activeVideoTrack?.addEventListener('targetqualitychanged', this._updateTargetVideoQualities);
        }
    };

    private readonly _updateActiveVideoQuality = (): void => {
        const activeVideoQuality = this._activeVideoTrack?.activeQuality as VideoQuality | undefined;
        for (const receiver of this._stateReceivers) {
            if (receiver[StateReceiverProps].indexOf('activeVideoQuality') >= 0) {
                receiver.activeVideoQuality = activeVideoQuality;
            }
        }
    };

    private readonly _updateTargetVideoQualities = (): void => {
        const targetVideoQualities = getTargetQualities(this._activeVideoTrack) as VideoQuality[] | undefined;
        for (const receiver of this._stateReceivers) {
            if (receiver[StateReceiverProps].indexOf('targetVideoQualities') >= 0) {
                receiver.targetVideoQualities = targetVideoQualities;
            }
        }
    };

    private readonly _updateCasting = (): void => {
        const casting = this._player?.cast?.casting ?? false;
        toggleAttribute(this, Attribute.CASTING, casting);
    };

    private readonly _updatePlayingAd = (): void => {
        const playingAd = this._player?.ads?.playing ?? false;
        toggleAttribute(this, Attribute.PLAYING_AD, playingAd);
    };

    private readonly _onSourceChange = (): void => {
        this.closeMenu_();
        const isPlaying = this._player !== undefined && !this._player.paused;
        toggleAttribute(this, Attribute.HAS_FIRST_PLAY, isPlaying);
    };

    private isUserIdle_(): boolean {
        // Must match the auto-hide rule from the CSS
        return this.hasAttribute(Attribute.USER_IDLE) && !this.paused && !this.casting && !this._menuGroup.hasCurrentMenu();
    }

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

        if (this.deviceType == 'tv' && this.isUserIdle_()) {
            // Blur active element so that first key press on TV doesn't result in an action.
            const focusedChild = getFocusedChild();
            if (focusedChild !== null) {
                focusedChild.blur();
            }
        }
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

    private readonly _onTvKeyDown = (event: KeyboardEvent): void => {
        if (isBackKey(event.keyCode)) {
            this.setUserIdle_();
            return;
        }
        const tvFocusChildren = getTvFocusChildren(this);
        const focusableChildren = getFocusableChildren(this);
        let focusedChild = getFocusedChild();
        if (!focusedChild) {
            const children = tvFocusChildren ?? focusableChildren;
            if (children.length > 0) {
                children[0].focus();
                focusedChild = children[0];
            }
        }

        if (this.isUserIdle_()) {
            // First button press should only make the UI visible
            return;
        }
        if (event.keyCode === KeyCode.ENTER) {
            if (this._player !== undefined && focusedChild !== null) {
                focusedChild.click();
            }
        } else if (isArrowKey(event.keyCode) && navigateByArrowKey(this, focusableChildren, event.keyCode)) {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    private readonly _onKeyUp = (event: KeyboardEvent): void => {
        // Show the controls while navigating with the keyboard.
        if (!isBackKey(event.keyCode)) {
            this.scheduleUserIdle_();
        }
    };

    private readonly _onPointerUp = (event: PointerEvent): void => {
        if (event.pointerType === 'touch') {
            // On mobile, when you tap the media while the controls are showing, immediately hide the controls.
            // Otherwise, show the controls (and schedule a timer to hide them again later on).
            if (this.isPlayerOrMedia_(event.target! as Node) && !this.hasAttribute(Attribute.USER_IDLE)) {
                this.setUserIdle_();
            } else {
                if (this.isUserIdle_()) {
                    // Ignore the next "click" event, to prevent accidental button clicks
                    // when the user only intended to show the controls.
                    this._lastPointerUpTime = performance.now();
                    this.addEventListener('click', this._onClickAfterPointerUp, true);
                }
                this.scheduleUserIdle_();
            }
        }
    };

    private readonly _onClickAfterPointerUp = (event: MouseEvent): void => {
        this.removeEventListener('click', this._onClickAfterPointerUp, true);
        if (performance.now() - this._lastPointerUpTime < 10) {
            event.preventDefault();
            event.stopPropagation();
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

    private readonly _onPreviewTimeChange = (rawEvent: Event): void => {
        const event = rawEvent as PreviewTimeChangeEvent;
        this._previewTime = event.detail.previewTime;

        for (const receiver of this._stateReceivers) {
            if (receiver[StateReceiverProps].indexOf('previewTime') >= 0) {
                receiver.previewTime = this._previewTime;
            }
        }
    };

    private _addPlayerListeners(player: ChromelessPlayer): void {
        player.addEventListener('destroy', this._onDestroy);
        player.addEventListener('resize', this._updateAspectRatio);
        player.addEventListener(['error', 'sourcechange', 'emptied'], this._updateError);
        player.addEventListener('volumechange', this._updateMuted);
        player.addEventListener('play', this._onPlay);
        player.addEventListener('pause', this._onPause);
        player.addEventListener(['ended', 'emptied'], this._updatePausedAndEnded);
        player.addEventListener(['durationchange', 'sourcechange', 'emptied'], this._updateStreamType);
        player.addEventListener('ratechange', this._updatePlaybackRate);
        player.addEventListener('sourcechange', this._onSourceChange);
        player.theoLive?.addEventListener('publicationloadstart', this._onSourceChange);
        player.videoTracks.addEventListener(['addtrack', 'removetrack', 'change'], this._updateActiveVideoTrack);
        player.cast?.addEventListener('castingchange', this._updateCasting);
        player.addEventListener(['durationchange', 'sourcechange', 'emptied'], this._updatePlayingAd);
        player.ads?.addEventListener(['adbreakbegin', 'adbreakend', 'adbegin', 'adend', 'adskip'], this._updatePlayingAd);
    }

    private _removePlayerListeners(player: ChromelessPlayer): void {
        player.removeEventListener('destroy', this._onDestroy);
        player.removeEventListener('resize', this._updateAspectRatio);
        player.removeEventListener(['error', 'sourcechange', 'emptied'], this._updateError);
        player.removeEventListener('volumechange', this._updateMuted);
        player.removeEventListener('play', this._onPlay);
        player.removeEventListener('pause', this._onPause);
        player.removeEventListener(['ended', 'emptied'], this._updatePausedAndEnded);
        player.removeEventListener(['durationchange', 'sourcechange', 'emptied'], this._updateStreamType);
        player.removeEventListener('ratechange', this._updatePlaybackRate);
        player.removeEventListener('sourcechange', this._onSourceChange);
        player.theoLive?.removeEventListener('publicationloadstart', this._onSourceChange);
        player.videoTracks.removeEventListener(['addtrack', 'removetrack', 'change'], this._updateActiveVideoTrack);
        player.cast?.removeEventListener('castingchange', this._updateCasting);
        player.removeEventListener(['durationchange', 'sourcechange', 'emptied'], this._updatePlayingAd);
        player.ads?.removeEventListener(['adbreakbegin', 'adbreakend', 'adbegin', 'adend', 'adskip'], this._updatePlayingAd);
    }

    private readonly _onDestroy = (): void => {
        if (this._player) {
            this._removePlayerListeners(this._player);
            this._player = undefined;
        }
    };
}

customElements.define('theoplayer-ui', UIContainer);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-ui': UIContainer;
    }
}

function getVisibleRect(slot: HTMLSlotElement): Rectangle | undefined {
    let result: Rectangle | undefined;
    const children = getSlottedElements(slot).filter(isHTMLElement);
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

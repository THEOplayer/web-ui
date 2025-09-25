import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import * as shadyCss from '@webcomponents/shadycss';
import { ChromelessPlayer, type MediaTrack, type SourceDescription, type UIPlayerConfiguration, type VideoQuality } from 'theoplayer/chromeless';
import elementCss from './UIContainer.css';
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
import { USER_IDLE_CHANGE_EVENT } from './events/UserIdleChangeEvent';
import { createCustomEvent } from './util/EventUtils';
import { getTargetQualities } from './util/TrackUtils';
import { MenuGroup } from './components/MenuGroup';
import type { DeviceType } from './util/DeviceType';
import { getFocusedChild, navigateByArrowKey } from './util/KeyboardNavigation';
import { isArrowKey, isBackKey, KeyCode } from './util/KeyCode';
import { READY_EVENT } from './events/ReadyEvent';
import { addGlobalStyles } from './Global';
import { ACCIDENTAL_CLICK_DELAY } from './util/Constants';

// Load components used in template
import './components/GestureReceiver';

export const DEFAULT_USER_IDLE_TIMEOUT = 2;
export const DEFAULT_TV_USER_IDLE_TIMEOUT = 5;
export const DEFAULT_DVR_THRESHOLD = 60;
export const FULL_WINDOW_ROOT_CLASS = 'theoplayer-ui-full-window';

/**
 * The container element for a THEOplayer UI.
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
 * @attribute `configuration` - The THEOplayer {@link theoplayer!UIPlayerConfiguration | UIPlayerConfiguration}, as a JSON string.
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
 * @slot `centered-chrome` - A slot for controls in the center of the player, layered on top of other controls.
 * @slot `centered-loading` - A slot for a loading indicator in the center of the player, layered on top of other controls
 *   but behind the centered chrome.
 * @slot `menu` - A slot for extra menus (see {@link Menu | `<theoplayer-menu>`}).
 * @slot `error` - A slot for an error display, to show when the player encounters a fatal error
 *   (see {@link ErrorDisplay | `<theoplayer-error-display>`}).
 * @group Components
 */
@customElement('theoplayer-ui')
export class UIContainer extends LitElement {
    static override styles = [elementCss];
    static override shadowRootOptions: ShadowRootInit = {
        ...LitElement.shadowRootOptions,
        delegatesFocus: true
    };

    /**
     * Fired when the backing player is created, and the {@link UIContainer.player} property is set.
     *
     * @group Events
     */
    static READY_EVENT: typeof READY_EVENT = READY_EVENT;

    private _configuration: UIPlayerConfiguration = {};
    private readonly _playerRef: Ref<HTMLElement> = createRef<HTMLElement>();
    private readonly _menuRef: Ref<HTMLElement> = createRef<HTMLElement>();
    private readonly _menuGroupRef: Ref<MenuGroup> = createRef<MenuGroup>();
    private _menuOpened: boolean = false;
    private _menuOpener: HTMLElement | undefined;
    private readonly _topChromeRef: Ref<HTMLElement> = createRef<HTMLElement>();
    private readonly _topChromeSlotRef: Ref<HTMLSlotElement> = createRef<HTMLSlotElement>();
    private readonly _bottomChromeRef: Ref<HTMLElement> = createRef<HTMLElement>();
    private readonly _bottomChromeSlotRef: Ref<HTMLSlotElement> = createRef<HTMLSlotElement>();

    private _pointerType: string = '';
    private _lastPointerUpTime: number = 0;
    private readonly _mutationObserver: MutationObserver;
    private readonly _resizeObserver: ResizeObserver | undefined;
    private readonly _stateReceivers: StateReceiverElement[] = [];
    private _player: ChromelessPlayer | undefined = undefined;
    private _source: SourceDescription | undefined = undefined;
    private _muted: boolean = false;
    private _autoplay: boolean = false;
    private _fullscreen: boolean = false;
    private _deviceType: DeviceType = 'desktop';
    private _streamType: StreamType = 'vod';
    private _fluid: boolean = false;
    private _userIdle: boolean = false;
    private _userIdleTimeout: number | undefined = undefined;
    private _isUserActive: boolean = false;
    private _userIdleTimer: number = 0;
    private _paused: boolean = false;
    private _ended: boolean = false;
    private _casting: boolean = false;
    private _dvrThreshold: number = DEFAULT_DVR_THRESHOLD;
    private _previewTime: number = NaN;
    private _activeVideoTrack: MediaTrack | undefined = undefined;

    /**
     * Creates a new THEOplayer UI container element.
     *
     * @param configuration - The player configuration.
     *   Will be passed to the {@link theoplayer!ChromelessPlayer | ChromelessPlayer} constructor to create
     *   the underlying THEOplayer instance.
     *   Can also be set later on through the {@link UIContainer.configuration} property.
     */
    constructor(configuration: UIPlayerConfiguration = {}) {
        super();
        this._configuration = configuration;

        this._mutationObserver = new MutationObserver(this._onMutation);
        if (typeof ResizeObserver !== 'undefined') {
            this._resizeObserver = new ResizeObserver(this._updateTextTrackMargins);
        }

        this.tryInitializePlayer_();
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
    get configuration(): UIPlayerConfiguration {
        return this._configuration;
    }

    @property({
        reflect: false,
        attribute: Attribute.CONFIGURATION,
        converter: {
            fromAttribute: (value: string | null) => (value ? (JSON.parse(value) as UIPlayerConfiguration) : {})
        }
    })
    set configuration(playerConfiguration: UIPlayerConfiguration) {
        this._setConfiguration(playerConfiguration);
    }

    private _setConfiguration(playerConfiguration: UIPlayerConfiguration): void {
        this._configuration = playerConfiguration ?? {};
        this.tryInitializePlayer_();
    }

    /**
     * The player's current source.
     */
    get source(): SourceDescription | undefined {
        return this._player ? this._player.source : this._source;
    }

    @property({
        reflect: false,
        attribute: Attribute.SOURCE,
        converter: {
            fromAttribute: (value: string | null) => (value ? (JSON.parse(value) as SourceDescription) : undefined)
        }
    })
    set source(value: SourceDescription | undefined) {
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
        return this._fluid;
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.FLUID })
    set fluid(value: boolean) {
        this._fluid = value;
        this._updateAspectRatio();
    }

    /**
     * Whether the player's audio is muted.
     */
    get muted(): boolean {
        return this._muted;
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.MUTED })
    set muted(value: boolean) {
        this._muted = value;
        if (this._player) {
            this._player.muted = value;
        }
    }

    /**
     * Whether the player should attempt to automatically start playback.
     */
    get autoplay(): boolean {
        return this._autoplay;
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.AUTOPLAY })
    set autoplay(value: boolean) {
        this._autoplay = value;
        if (this._player) {
            this._player.autoplay = value;
        }
    }

    /**
     * Whether the UI is in fullscreen mode.
     */
    get fullscreen(): boolean {
        return this._fullscreen;
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.FULLSCREEN })
    private set fullscreen(value: boolean) {
        if (this._fullscreen === value) return;
        this._fullscreen = value;
        for (const receiver of this._stateReceivers) {
            if (receiver[StateReceiverProps].indexOf('fullscreen') >= 0) {
                receiver.fullscreen = value;
            }
        }
    }

    /**
     * Whether the player is paused.
     */
    get paused(): boolean {
        return this._paused;
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.PAUSED })
    private set paused(value: boolean) {
        this._paused = value;
        this._updateTextTrackMargins();
        this.updateUserIdle_();
    }

    /**
     * Whether the player is ended.
     */
    get ended(): boolean {
        return this._ended;
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.ENDED })
    private set ended(value: boolean) {
        this._ended = value;
    }

    /**
     * Whether the player is casting to a remote receiver.
     */
    get casting(): boolean {
        return this._casting;
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.CASTING })
    private set casting(value: boolean) {
        this._casting = value;
        this._updateTextTrackMargins();
        this.updateUserIdle_();
    }

    /**
     * Whether the user has stopped interacting with the UI and is considered to be "idle".
     */
    get userIdle(): boolean {
        return this._userIdle;
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.USER_IDLE })
    private set userIdle(value: boolean) {
        if (this._userIdle === value) return;
        this._userIdle = value;
        this._updateTextTrackMargins();
        this.dispatchEvent(createCustomEvent(USER_IDLE_CHANGE_EVENT));
    }

    /**
     * The timeout (in seconds) between when the user stops interacting with the UI,
     * and when the user is considered to be "idle".
     */
    get userIdleTimeout(): number {
        return this._userIdleTimeout ?? (this.deviceType === 'tv' ? DEFAULT_TV_USER_IDLE_TIMEOUT : DEFAULT_USER_IDLE_TIMEOUT);
    }

    @property({ reflect: true, type: Number, attribute: Attribute.USER_IDLE_TIMEOUT, useDefault: true })
    set userIdleTimeout(value: number | undefined) {
        this._userIdleTimeout = value === undefined || isNaN(value) ? undefined : value;
    }

    /**
     * The device type, either "desktop", "mobile" or "tv".
     */
    get deviceType(): DeviceType {
        return this._deviceType;
    }

    @property({ reflect: true, type: String, attribute: Attribute.DEVICE_TYPE })
    set deviceType(value: DeviceType) {
        if (this._deviceType === value) return;
        this._deviceType = value;

        toggleAttribute(this, Attribute.MOBILE, value === 'mobile');
        toggleAttribute(this, Attribute.TV, value === 'tv');

        window.removeEventListener('keydown', this._onTvKeyDown);
        if (value === 'tv') {
            window.addEventListener('keydown', this._onTvKeyDown);
        }

        for (const receiver of this._stateReceivers) {
            if (receiver[StateReceiverProps].indexOf('deviceType') >= 0) {
                receiver.deviceType = value;
            }
        }
    }

    /**
     * The stream type, either "vod", "live" or "dvr".
     *
     * If you know in advance that the source will be a livestream, you can set this property to avoid a screen flicker
     * when the player switches between its VOD-specific and live-only controls.
     */
    get streamType(): StreamType {
        return this._streamType;
    }

    /**
     * @deprecated use {@link SourceDescription.streamType} instead.
     */
    @property({ reflect: true, type: String, attribute: Attribute.STREAM_TYPE })
    set streamType(streamType: StreamType) {
        if (this._streamType === streamType) return;
        this._streamType = streamType;
        for (const receiver of this._stateReceivers) {
            if (receiver[StateReceiverProps].indexOf('streamType') >= 0) {
                receiver.streamType = streamType;
            }
        }
        const streamTypeChangeEvent: StreamTypeChangeEvent = createCustomEvent(STREAM_TYPE_CHANGE_EVENT, {
            bubbles: true,
            composed: true,
            detail: { streamType: streamType }
        });
        this.dispatchEvent(streamTypeChangeEvent);
    }

    /**
     * The minimum length (in seconds) of a livestream's sliding window for the stream to be DVR
     * and its stream type to be set to "dvr".
     */
    get dvrThreshold(): number {
        return this._dvrThreshold;
    }

    @property({ reflect: true, type: Number, attribute: Attribute.DVR_THRESHOLD, useDefault: true })
    set dvrThreshold(value: number) {
        this._dvrThreshold = isNaN(value) ? 0 : value;
        this._updateStreamType();
    }

    @property({ reflect: true, state: true, type: Boolean, attribute: Attribute.HAS_FIRST_PLAY })
    private accessor _hasFirstPlay: boolean = false;

    @property({ reflect: true, state: true, type: Boolean, attribute: Attribute.PLAYING_AD })
    private accessor _isPlayingAd: boolean = false;

    @property({ reflect: true, state: true, type: Boolean, attribute: Attribute.HAS_ERROR })
    private accessor _hasError: boolean = false;

    @property({ reflect: true, state: true, type: Boolean, attribute: Attribute.FULLWINDOW })
    private accessor _isFullWindow: boolean = false;

    connectedCallback(): void {
        super.connectedCallback();
        addGlobalStyles();

        if (!this.hasAttribute(Attribute.DEVICE_TYPE)) {
            this.deviceType = isMobile() ? 'mobile' : isTv() ? 'tv' : 'desktop';
        }
        if (!this.hasAttribute(Attribute.PAUSED)) {
            this.paused = true;
        }

        this.tryInitializePlayer_();

        for (const receiver of this._stateReceivers) {
            this.propagateStateToReceiver_(receiver);
        }
        this._mutationObserver.observe(this, { childList: true, subtree: true });
        this.shadowRoot!.addEventListener('slotchange', this._onSlotChange);

        this._resizeObserver?.observe(this);
        this._updateTextTrackMargins();

        if (fullscreenAPI !== undefined) {
            document.addEventListener(fullscreenAPI.fullscreenchange_, this._onFullscreenChange);
            document.addEventListener(fullscreenAPI.fullscreenerror_, this._onFullscreenChange);
            this._onFullscreenChange();
        }

        this.setUserIdle_();
        if (this.deviceType === 'tv') {
            window.addEventListener('keydown', this._onTvKeyDown);
        }
        if (this._isFullWindow) {
            window.addEventListener('keydown', this._exitFullscreenOnEsc);
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
        if (this._playerRef.value === undefined) {
            return;
        }
        if (this._configuration.license === undefined && this._configuration.licenseUrl === undefined) {
            return;
        }

        this._player = new ChromelessPlayer(this._playerRef.value, this._configuration);
        if (this._source) {
            this._player.source = this._source;
            this._source = undefined;
        }
        this._player.muted = this.muted;
        this._player.autoplay = this.autoplay;

        this._updateAspectRatio();
        this._updateError();
        this._updatePausedAndEnded();
        this._updateCasting();
        this.addPlayerListeners_(this._player);
        this.propagatePlayerToAllReceivers_();

        this.dispatchEvent(createCustomEvent(READY_EVENT));
    }

    protected override createRenderRoot(): HTMLElement | DocumentFragment {
        const root = super.createRenderRoot();
        root.addEventListener(TOGGLE_MENU_EVENT, this._onToggleMenu);
        root.addEventListener(ENTER_FULLSCREEN_EVENT, this._onEnterFullscreen);
        root.addEventListener(EXIT_FULLSCREEN_EVENT, this._onExitFullscreen);
        root.addEventListener(PREVIEW_TIME_CHANGE_EVENT, this._onPreviewTimeChange);
        return root;
    }

    protected override firstUpdated() {
        if (this._menuGroupRef.value && !(this._menuGroupRef instanceof MenuGroup)) {
            customElements.upgrade(this._menuGroupRef.value);
        }

        this.tryInitializePlayer_();

        if (this._playerRef.value) {
            void forEachStateReceiverElement(this, this._playerRef.value, this.registerStateReceiver_);
        }
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();

        this._resizeObserver?.disconnect();
        this._mutationObserver.disconnect();
        this.shadowRoot!.removeEventListener('slotchange', this._onSlotChange);

        if (fullscreenAPI !== undefined) {
            document.removeEventListener(fullscreenAPI.fullscreenchange_, this._onFullscreenChange);
            document.removeEventListener(fullscreenAPI.fullscreenerror_, this._onFullscreenChange);
        }

        window.removeEventListener('keydown', this._onTvKeyDown);
        window.removeEventListener('keydown', this._exitFullscreenOnEsc);
        this.removeEventListener('keyup', this._onKeyUp);
        this.removeEventListener('pointerup', this._onPointerUp);
        this.removeEventListener('click', this._onClickAfterPointerUp, true);
        this.removeEventListener('pointermove', this._onPointerMove);
        this.removeEventListener('mouseleave', this._onMouseLeave);

        if (this._player) {
            this.removePlayerListeners_(this._player);
            this._player.destroy();
            this._player = undefined;
            this.propagatePlayerToAllReceivers_();
        }

        this._stateReceivers.length = 0;
    }

    private readonly _onMutation = (mutations: MutationRecord[]): void => {
        const playerElement = this._playerRef.value;
        if (!playerElement) return;
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                const { addedNodes, removedNodes } = mutation;
                for (let i = 0; i < addedNodes.length; i++) {
                    const node = addedNodes[i];
                    if (isElement(node)) {
                        void forEachStateReceiverElement(node, playerElement, this.registerStateReceiver_);
                    }
                }
                for (let i = 0; i < removedNodes.length; i++) {
                    const node = removedNodes[i];
                    if (isElement(node)) {
                        void forEachStateReceiverElement(node, playerElement, this.unregisterStateReceiver_);
                    }
                }
            }
        }
    };

    private readonly _onSlotChange = (): void => {
        if (this._playerRef.value) {
            void forEachStateReceiverElement(this, this._playerRef.value, this.registerStateReceiver_);
        }
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

    private propagatePlayerToAllReceivers_(): void {
        for (const receiver of this._stateReceivers) {
            const receiverProps = receiver[StateReceiverProps];
            if (receiverProps.indexOf('player') >= 0) {
                receiver.player = this._player;
            }
        }
    }

    private removeStateFromReceiver_(receiver: StateReceiverElement): void {
        const receiverProps = receiver[StateReceiverProps];
        if (receiverProps.indexOf('player') >= 0) {
            receiver.player = undefined;
        }
    }

    private get menuOpened_(): boolean {
        return this._menuOpened;
    }

    @property({ reflect: true, state: true, type: Boolean, attribute: Attribute.MENU_OPENED })
    private set menuOpened_(menuOpened: boolean) {
        if (this._menuOpened === menuOpened) return;
        this._menuOpened = menuOpened;
        // Toggle manually, so the menu layer immediately becomes visible and can receive focus.
        toggleAttribute(this, Attribute.MENU_OPENED, menuOpened);
    }

    private openMenu_(menuToOpen: string, opener: HTMLElement | undefined): void {
        const topChromeRect = Rectangle.fromRect(this._topChromeRef.value!.getBoundingClientRect());
        const bottomChromeRect = Rectangle.fromRect(this._bottomChromeRef.value!.getBoundingClientRect());

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

        this._menuGroupRef.value!.openMenu(menuToOpen, opener);
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
        this._menuGroupRef.value?.closeMenu?.();
        this._menuOpener?.focus();
        this._menuOpener = undefined;
    }

    private readonly _onToggleMenu = (rawEvent: Event): void => {
        const event = rawEvent as ToggleMenuEvent;
        event.stopPropagation();
        const menuId = event.detail.menu;
        const menuGroup = this._menuGroupRef.value;
        if (!menuGroup) return;
        if (!menuGroup.getMenuById(menuId)) {
            console.error(`<theoplayer-ui>: cannot find menu with ID "${menuId}"`);
            return;
        }
        const opener = isHTMLElement(event.target) ? event.target : undefined;
        if (menuGroup.isMenuOpen(menuId)) {
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
        const menuEl = this._menuRef.value!;
        menuEl.removeEventListener('pointerdown', this._onMenuPointerDown);
        menuEl.removeEventListener('click', this._onMenuClick);
        if (this._menuGroupRef.value!.hasCurrentMenu()) {
            menuEl.addEventListener('pointerdown', this._onMenuPointerDown);
            menuEl.addEventListener('click', this._onMenuClick);
            this.menuOpened_ = true;
        } else {
            this.menuOpened_ = false;
        }
        this.updateUserIdle_();
    };

    private readonly _onMenuPointerDown = (event: PointerEvent) => {
        this._pointerType = event.pointerType;
    };

    private readonly _onMenuClick = (event: MouseEvent) => {
        // If the browser doesn't support yet `pointerType` on `click` events,
        // we use the type from the previous `pointerdown` event.
        const pointerType = (event as PointerEvent).pointerType ?? this._pointerType;
        if (event.target === this._menuRef.value && pointerType === 'mouse') {
            // Close menu when clicking (with mouse) on menu backdrop
            if (this._menuGroupRef.value!.closeCurrentMenu()) {
                event.preventDefault();
            }
        }
    };

    private readonly _onEnterFullscreen = (rawEvent: Event): void => {
        const event = rawEvent as EnterFullscreenEvent;
        event.stopPropagation();
        if (fullscreenAPI && document[fullscreenAPI.fullscreenEnabled_] && this[fullscreenAPI.requestFullscreen_]) {
            const promise = this[fullscreenAPI.requestFullscreen_]({
                navigationUI: 'hide',
                ...this._configuration?.ui?.fullscreenOptions
            });
            if (promise && promise.then) {
                promise.then(noOp, noOp);
            }
        } else if (this._player && this._player.presentation.supportsMode('fullscreen')) {
            this._player.presentation.requestMode('fullscreen');
        } else if (!this._isFullWindow) {
            this._isFullWindow = true;
            document.documentElement.classList.add(FULL_WINDOW_ROOT_CLASS);
            window.addEventListener('keydown', this._exitFullscreenOnEsc);
            this._onFullscreenChange();
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
        if (this._isFullWindow) {
            this._isFullWindow = false;
            document.documentElement.classList.remove(FULL_WINDOW_ROOT_CLASS);
            window.removeEventListener('keydown', this._exitFullscreenOnEsc);
            this._onFullscreenChange();
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
        if (this._isFullWindow) {
            isFullscreen = true;
        }
        this.fullscreen = isFullscreen;
    };

    private readonly _exitFullscreenOnEsc = (event: KeyboardEvent): void => {
        if (event.keyCode == KeyCode.ESCAPE) {
            this._onExitFullscreen(event);
        }
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
        this._hasError = error !== undefined;
        for (const receiver of this._stateReceivers) {
            if (receiver[StateReceiverProps].indexOf('error') >= 0) {
                receiver.error = error;
            }
        }
    };

    private readonly _onPlay = (): void => {
        this._hasFirstPlay = true;
        this.paused = false;
        this._updateEnded();
    };

    private readonly _onPause = (): void => {
        this.paused = true;
        this._updateEnded();
    };

    private readonly _updatePausedAndEnded = (): void => {
        this.paused = this._player ? this._player.paused : true;
        this._updateEnded();
    };

    private readonly _updateEnded = (): void => {
        this.ended = this._player ? this._player.ended : false;
    };

    private readonly _updateStreamType = (): void => {
        if (this._player === undefined) {
            return;
        }
        this.streamType = this.computeStreamType_();
    };

    private computeStreamType_(): StreamType {
        const source = this.source;
        const streamType = source?.streamType ?? (this.getAttribute(Attribute.STREAM_TYPE) as StreamType | null);
        const duration = this._player?.duration;
        if (duration === undefined || isNaN(duration)) {
            // No duration yet...
            // Use hinted stream type if available.
            if (streamType) {
                return streamType;
            }
            if (source?.dvr) {
                return 'dvr';
            }
            // Assume VOD.
            return 'vod';
        } else if (duration === Infinity) {
            // It's a live stream.
            if (streamType === 'live' || streamType === 'dvr') {
                // Follow the hinted stream type.
                return streamType;
            } else {
                const dvrThreshold = this.dvrThreshold;
                if (dvrThreshold <= 0) {
                    return 'dvr';
                }
                const seekable = this._player?.seekable;
                if (seekable && seekable.length > 0) {
                    // Check if the DVR window is large enough.
                    const dvrWindow = seekable.end(seekable.length - 1) - seekable.start(0);
                    if (dvrWindow >= dvrThreshold) {
                        return 'dvr';
                    }
                }
            }
            // Otherwise, it's a regular live stream.
            return 'live';
        } else {
            // It's a VOD.
            return 'vod';
        }
    }

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
        this.casting = this._player?.cast?.casting ?? false;
    };

    private readonly _updatePlayingAd = (): void => {
        this._isPlayingAd = this._player?.ads?.playing ?? false;
    };

    private readonly _onSourceChange = (): void => {
        this.closeMenu_();
        this._hasFirstPlay = this._player !== undefined && !this._player.paused;
    };

    private isUserIdle_(): boolean {
        return (
            !this._isUserActive && !this.paused && !this.casting && (this._menuGroupRef.value ? !this._menuGroupRef.value.hasCurrentMenu() : false)
        );
    }

    private setUserActive_(): void {
        clearTimeout(this._userIdleTimer);
        this._isUserActive = true;
        this.updateUserIdle_();
    }

    private readonly setUserIdle_ = (): void => {
        clearTimeout(this._userIdleTimer);
        this._userIdleTimer = 0;

        if (this.userIdleTimeout < 0) {
            return;
        }
        this._isUserActive = false;
        this.updateUserIdle_();

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

    private updateUserIdle_(): void {
        this.userIdle = this.isUserIdle_();
    }

    private isPlayerOrMedia_(node: Node): boolean {
        return node === this || this._playerRef.value!.contains(node);
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
            if (focusedChild !== null) {
                event.preventDefault();
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
        if (event.pointerType === 'mouse') {
            this.scheduleUserIdle_();
        } else if (event.pointerType === 'touch') {
            // On mobile, when you tap the media while the controls are showing, immediately hide the controls.
            // Otherwise, show the controls (and schedule a timer to hide them again later on).
            if (this.isPlayerOrMedia_(event.target! as Node) && this._isUserActive) {
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
        if (performance.now() - this._lastPointerUpTime < ACCIDENTAL_CLICK_DELAY) {
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
        const topChromeRect = this._topChromeSlotRef.value && getVisibleRect(this._topChromeSlotRef.value);
        const bottomChromeRect = this._bottomChromeSlotRef.value && getVisibleRect(this._bottomChromeSlotRef.value);
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

    private addPlayerListeners_(player: ChromelessPlayer): void {
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
        player.addEventListener(['durationchange', 'sourcechange', 'emptied'], this._updatePlayingAd);

        player.theoLive?.addEventListener(['distributionloadstart', 'publicationloadstart' as never], this._onSourceChange);
        player.videoTracks.addEventListener(['addtrack', 'removetrack', 'change'], this._updateActiveVideoTrack);
        player.cast?.addEventListener('castingchange', this._updateCasting);
        player.ads?.addEventListener(['adbreakbegin', 'adbreakend', 'adbegin', 'adend', 'adskip'], this._updatePlayingAd);
    }

    private removePlayerListeners_(player: ChromelessPlayer): void {
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
        player.removeEventListener(['durationchange', 'sourcechange', 'emptied'], this._updatePlayingAd);

        try {
            player.theoLive?.removeEventListener(['distributionloadstart', 'publicationloadstart' as never], this._onSourceChange);
            player.videoTracks.removeEventListener(['addtrack', 'removetrack', 'change'], this._updateActiveVideoTrack);
            player.cast?.removeEventListener('castingchange', this._updateCasting);
            player.ads?.removeEventListener(['adbreakbegin', 'adbreakend', 'adbegin', 'adend', 'adskip'], this._updatePlayingAd);
        } catch {
            // Ignore errors from accessing player.ads when the player is already destroyed.
        }
    }

    private readonly _onDestroy = (): void => {
        if (this._player) {
            this.removePlayerListeners_(this._player);
            this._player = undefined;
            this.propagatePlayerToAllReceivers_();
        }
    };

    protected override render(): HTMLTemplateResult {
        return html`
            <div part="layer media-layer" ${ref(this._playerRef)}></div>
            <div part="layer gesture-layer">
                <theoplayer-gesture-receiver></theoplayer-gesture-receiver>
            </div>
            <div part="layer vertical-layer">
                <div part="top chrome" ${ref(this._topChromeRef)}>
                    <slot
                        name="top-chrome"
                        ${ref(this._topChromeSlotRef)}
                        @transitionstart=${this._onChromeSlotTransition}
                        @transitionend=${this._onChromeSlotTransition}
                    ></slot>
                </div>
                <div part="middle chrome">
                    <slot name="middle-chrome"></slot>
                </div>
                <div part="layer centered-layer centered loading">
                    <slot name="centered-loading"></slot>
                </div>
                <div part="layer centered-layer centered chrome">
                    <slot name="centered-chrome"></slot>
                </div>
                <div part="bottom chrome" ${ref(this._bottomChromeRef)}>
                    <slot
                        ${ref(this._bottomChromeSlotRef)}
                        @transitionstart=${this._onChromeSlotTransition}
                        @transitionend=${this._onChromeSlotTransition}
                        ><!-- default, effectively "bottom-chrome" --></slot
                    >
                </div>
            </div>
            <div part="layer menu-layer" ${ref(this._menuRef)}>
                <theoplayer-menu-group
                    ${ref(this._menuGroupRef)}
                    part="menu"
                    @theoplayermenuclose=${this._onCloseMenu}
                    @theoplayermenuchange=${this._onMenuChange}
                >
                    <slot name="menu"></slot>
                </theoplayer-menu-group>
            </div>
            <div part="layer error-layer">
                <slot name="error"></slot>
            </div>
        `;
    }
}

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

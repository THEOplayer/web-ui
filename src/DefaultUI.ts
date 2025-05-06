import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property, queryAssignedNodes, state } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { ChromelessPlayer, SourceDescription, UIPlayerConfiguration } from 'theoplayer/chromeless';
import { DEFAULT_DVR_THRESHOLD, DEFAULT_TV_USER_IDLE_TIMEOUT, DEFAULT_USER_IDLE_TIMEOUT, type UIContainer } from './UIContainer';
import defaultUiCss from './DefaultUI.css';
import { Attribute } from './util/Attribute';
import { applyExtensions } from './extensions/ExtensionRegistry';
import { isMobile, isTv } from './util/Environment';
import type { DeviceType } from './util/DeviceType';
import type { StreamType } from './util/StreamType';
import { USER_IDLE_CHANGE_EVENT } from './events/UserIdleChangeEvent';
import { READY_EVENT } from './events/ReadyEvent';
import { ACCIDENTAL_CLICK_DELAY } from './util/Constants';
import { toggleAttribute } from './util/CommonUtils';
import { createCustomEvent } from './util/EventUtils';

/**
 * `<theoplayer-default-ui>` - A default UI for THEOplayer.
 *
 * This default UI provides a great player experience out-of-the-box, that works well on all types of devices
 * and for all types of streams. It provides all the common playback controls for playing, seeking,
 * changing languages and qualities. It also supports advertisements and casting.
 *
 * ## Usage
 *
 * 1. Create a `<theoplayer-default-ui>` element.
 * 2. Set its `configuration` attribute or property to a valid player configuration.
 * 3. Set its `source` attribute or property to a valid stream source.
 * 4. Optionally, customize the player using CSS custom properties and/or extra controls.
 *
 * ## Customization
 *
 * The styling can be controlled using CSS custom properties (see {@link UIContainer | `<theoplayer-ui>`}).
 * Additional controls can be added to the `top-control-bar` and `bottom-control-bar` slots.
 * For more extensive customizations, we recommend defining your own custom UI using
 * a {@link UIContainer | `<theoplayer-ui>`}.
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
 * @attribute `user-idle-timeout` - The timeout (in seconds) between when the user stops interacting with the UI,
 *   and when the user is considered to be "idle".
 * @attribute `dvr-threshold` - The minimum length (in seconds) of a livestream's sliding window for the stream to be DVR
 *   and its stream type to be set to "dvr".
 *
 * @slot `title` - A slot for the stream's title in the top control bar.
 * @slot `top-control-bar` - A slot for extra UI controls in the top control bar.
 * @slot `centered-chrome` - A slot to replace the controls in the center of the player,
 *   layered on top of other controls.
 * @slot `bottom-control-bar` - A slot for extra UI controls in the bottom control bar.
 * @slot `menu` - A slot for extra menus (see {@link Menu | `<theoplayer-menu>`}).
 * @slot `error` - A slot for an error display, to show when the player encounters a fatal error.
 *   By default, this shows an {@link ErrorDisplay | `<theoplayer-error-display>`}.
 * @group Components
 */
@customElement('theoplayer-default-ui')
export class DefaultUI extends LitElement {
    static override styles = [defaultUiCss];
    static override shadowRootOptions = {
        ...LitElement.shadowRootOptions,
        delegatesFocus: true
    };

    /**
     * Fired when the backing player is created, and the {@link DefaultUI.player} property is set.
     *
     * @group Events
     */
    static READY_EVENT: typeof READY_EVENT = READY_EVENT;

    protected readonly _uiRef: Ref<UIContainer> = createRef<UIContainer>();
    @state()
    private accessor _timeRangeInert: boolean = false;
    private _timeRangeInertTimeout: number = 0;
    private _appliedExtensions: boolean = false;

    private _configuration: UIPlayerConfiguration = {};
    private _source: SourceDescription | undefined = undefined;
    private _userIdleTimeout: number | undefined = undefined;
    private _deviceType: DeviceType = 'desktop';
    private _dvrThreshold: number = DEFAULT_DVR_THRESHOLD;

    @queryAssignedNodes({ slot: 'title', flatten: true })
    private accessor titleSlotNodes!: Array<Node>;

    /**
     * Creates a new THEOplayer default UI.
     *
     * @param configuration - The player configuration.
     *   Will be passed to the {@link theoplayer!ChromelessPlayer | ChromelessPlayer} constructor to create
     *   the underlying THEOplayer instance.
     *   Can also be set later on through the {@link DefaultUI.configuration} property.
     */
    constructor(configuration: UIPlayerConfiguration = {}) {
        super();
        this.configuration = configuration;
    }

    /**
     * The underlying THEOplayer player instance.
     *
     * This is constructed automatically as soon as a valid {@link configuration} is set.
     */
    get player(): ChromelessPlayer | undefined {
        return this._uiRef.value?.player;
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
    set configuration(configuration: UIPlayerConfiguration) {
        this._configuration = {
            ...configuration,
            ads: {
                ...(configuration.ads ?? {}),
                // Always disable Google IMA's own ad countdown,
                // since we show our own countdown in the default UI.
                showCountdown: false
            }
        };
    }

    /**
     * The player's current source.
     */
    get source() {
        return this._uiRef.value ? this._uiRef.value.source : this._source;
    }

    @property({
        reflect: false,
        attribute: Attribute.SOURCE,
        converter: {
            fromAttribute: (value: string | null) => (value ? (JSON.parse(value) as SourceDescription) : undefined)
        }
    })
    set source(source: SourceDescription | undefined) {
        if (this._uiRef.value) {
            this._source = undefined;
            this._uiRef.value.source = source;
        } else {
            this._source = source;
        }
    }

    /**
     * Whether to automatically adjust the player's height to fit the video's aspect ratio.
     */
    @property({ reflect: true, type: Boolean, attribute: Attribute.FLUID })
    accessor fluid: boolean = false;

    /**
     * Whether the player's audio is muted.
     */
    @property({ reflect: true, type: Boolean, attribute: Attribute.MUTED })
    accessor muted: boolean = false;

    /**
     * Whether the player should attempt to automatically start playback.
     */
    @property({ reflect: true, type: Boolean, attribute: Attribute.AUTOPLAY })
    accessor autoplay: boolean = false;

    /**
     * The stream type, either "vod", "live" or "dvr".
     *
     * If you know in advance that the source will be a livestream, you can set this property to avoid a screen flicker
     * when the player switches between its VOD-specific and live-only controls.
     */
    @property({ reflect: true, type: String, attribute: Attribute.STREAM_TYPE })
    accessor streamType: StreamType = 'vod';

    /**
     * Whether the user has stopped interacting with the UI and is considered to be "idle".
     */
    get userIdle(): boolean {
        return this._uiRef.value ? this._uiRef.value.userIdle : false;
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
    }

    @state()
    private accessor _hasTitle: boolean = false;

    connectedCallback(): void {
        super.connectedCallback();

        if (!this.hasAttribute(Attribute.DEVICE_TYPE)) {
            this.deviceType = isMobile() ? 'mobile' : isTv() ? 'tv' : 'desktop';
        }

        if (!this._appliedExtensions) {
            this._appliedExtensions = true;
            applyExtensions(this);
        }

        this._onTitleSlotChange();
    }

    disconnectedCallback(): void {
        clearTimeout(this._timeRangeInertTimeout);
    }

    protected override firstUpdated() {
        if (this._source) {
            this._uiRef.value!.source = this._source;
            this._source = undefined;
        }
    }

    protected _onUiReady(): void {
        this.dispatchEvent(createCustomEvent(READY_EVENT));
    }

    private readonly _updateStreamType = () => {
        if (this._uiRef.value) {
            this.streamType = this._uiRef.value.streamType;
        }
    };

    private readonly _updateUserIdle = () => {
        clearTimeout(this._timeRangeInertTimeout);
        if (this.userIdle) {
            // Disable seekbar when user is idle
            this._timeRangeInert = true;
        } else {
            // Re-enable seekbar when user is active,
            // but wait a little bit to prevent accidentally clicking the seekbar.
            this._timeRangeInertTimeout = setTimeout(() => {
                this._timeRangeInert = false;
            }, ACCIDENTAL_CLICK_DELAY);
        }
        this.dispatchEvent(createCustomEvent(USER_IDLE_CHANGE_EVENT));
    };

    private readonly _onTitleSlotChange = () => {
        this._hasTitle = this.titleSlotNodes.length > 0;
    };

    protected override render(): HTMLTemplateResult {
        return html`<theoplayer-ui
            ${ref(this._uiRef)}
            .configuration=${this.configuration}
            .fluid=${this.fluid}
            .muted=${this.muted}
            .autoplay=${this.autoplay}
            .deviceType=${this.deviceType}
            .streamType=${this.streamType}
            .userIdleTimeout=${this.userIdleTimeout}
            .dvrThreshold=${this.dvrThreshold}
            @theoplayerready=${this._onUiReady}
            @theoplayeruseridlechange=${this._updateUserIdle}
            @theoplayerstreamtypechange=${this._updateStreamType}
            >${this.renderUiContent()}
        </theoplayer-ui>`;
    }

    protected renderUiContent(): HTMLTemplateResult {
        return html`
            <theoplayer-control-bar slot="top-chrome" part="top-chrome">
                <div part="title" ad-hidden style=${styleMap({ display: this._hasTitle ? '' : 'none' })}>
                    <slot name="title" @slotchange=${this._onTitleSlotChange}></slot>
                </div>
                <span class="theoplayer-spacer"></span>
                <theoplayer-language-menu-button menu="language-menu" mobile-only ad-hidden></theoplayer-language-menu-button>
                <theoplayer-airplay-button mobile-only ad-hidden></theoplayer-airplay-button>
                <theoplayer-chromecast-button mobile-only ad-hidden></theoplayer-chromecast-button>
                <slot name="top-control-bar"></slot>
                <theoplayer-settings-menu-button menu="settings-menu" mobile-only ad-hidden></theoplayer-settings-menu-button>
                <theoplayer-ad-clickthrough-button ad-only></theoplayer-ad-clickthrough-button>
            </theoplayer-control-bar>
            <theoplayer-loading-indicator slot="centered-loading" no-auto-hide></theoplayer-loading-indicator>
            <div slot="centered-chrome" part="centered-chrome">
                <slot name="centered-chrome">
                    <theoplayer-seek-button
                        part="seek-back-button seek-button center-button"
                        seek-offset="-10"
                        mobile-only
                        ad-hidden
                    ></theoplayer-seek-button>
                    <theoplayer-play-button part="center-play-button play-button center-button"></theoplayer-play-button>
                    <theoplayer-seek-button
                        part="seek-forward-button seek-button center-button"
                        seek-offset="10"
                        mobile-only
                        ad-hidden
                    ></theoplayer-seek-button>
                </slot>
            </div>
            <div slot="middle-chrome" part="middle-chrome">
                <theoplayer-chromecast-display></theoplayer-chromecast-display>
            </div>
            <div part="bottom-chrome">
                <theoplayer-control-bar part="ad-chrome" ad-only>
                    <theoplayer-ad-display></theoplayer-ad-display>
                    <theoplayer-ad-countdown></theoplayer-ad-countdown>
                    <span class="theoplayer-spacer"></span>
                    <theoplayer-ad-skip-button></theoplayer-ad-skip-button>
                </theoplayer-control-bar>
                <theoplayer-control-bar>
                    <theoplayer-play-button part="play-button" mobile-hidden ad-only class="theoplayer-ad-control"></theoplayer-play-button>
                    <theoplayer-mute-button part="mute-button" ad-only class="theoplayer-ad-control"></theoplayer-mute-button>
                    <theoplayer-time-range
                        part="time-range"
                        show-ad-markers
                        tv-focus
                        .inert=${this._timeRangeInert}
                        class="theoplayer-ad-control"
                        style=${styleMap({
                            // Hide seekbar when stream is live with no DVR
                            display: this.streamType === 'live' ? 'none' : ''
                        })}
                    ></theoplayer-time-range>
                    <theoplayer-chromecast-button tv-hidden ad-only class="theoplayer-ad-control"></theoplayer-chromecast-button>
                    <theoplayer-fullscreen-button ad-only class="theoplayer-ad-control"></theoplayer-fullscreen-button>
                </theoplayer-control-bar>
                <theoplayer-control-bar ad-hidden>
                    <theoplayer-play-button part="play-button" mobile-hidden></theoplayer-play-button>
                    <theoplayer-mute-button part="mute-button" tv-hidden></theoplayer-mute-button>
                    <theoplayer-volume-range part="volume-range" mobile-hidden tv-hidden></theoplayer-volume-range>
                    <theoplayer-live-button part="live-button" live-only ad-hidden></theoplayer-live-button>
                    <theoplayer-time-display show-duration remaining-when-live></theoplayer-time-display>
                    <span class="theoplayer-spacer" style="pointer-events: auto"></span>
                    <theoplayer-language-menu-button menu="language-menu" mobile-hidden ad-hidden></theoplayer-language-menu-button>
                    <theoplayer-airplay-button tv-hidden mobile-hidden ad-hidden></theoplayer-airplay-button>
                    <theoplayer-chromecast-button tv-hidden mobile-hidden ad-hidden></theoplayer-chromecast-button>
                    <slot name="bottom-control-bar"></slot>
                    <theoplayer-settings-menu-button menu="settings-menu" mobile-hidden ad-hidden></theoplayer-settings-menu-button>
                    <theoplayer-fullscreen-button part="fullscreen-button" tv-hidden></theoplayer-fullscreen-button>
                </theoplayer-control-bar>
            </div>
            <theoplayer-language-menu id="language-menu" slot="menu" hidden></theoplayer-language-menu>
            <theoplayer-settings-menu id="settings-menu" slot="menu" hidden></theoplayer-settings-menu>
            <slot name="error" slot="error"><theoplayer-error-display></theoplayer-error-display></slot>
            <slot name="menu" slot="menu"></slot>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-default-ui': DefaultUI;
    }
}

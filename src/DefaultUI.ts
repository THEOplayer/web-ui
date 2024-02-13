import * as shadyCss from '@webcomponents/shadycss';
import type { ChromelessPlayer, PlayerConfiguration, SourceDescription } from 'theoplayer/chromeless';
import type { UIContainer } from './UIContainer';
import defaultUiCss from './DefaultUI.css';
import defaultUiHtml from './DefaultUI.html';
import { Attribute } from './util/Attribute';
import { applyExtensions } from './extensions/ExtensionRegistry';
import { isMobile, isTv } from './util/Environment';
import type { DeviceType } from './util/DeviceType';
import type { StreamType } from './util/StreamType';
import type { TimeRange } from './components/TimeRange';
import { STREAM_TYPE_CHANGE_EVENT } from './events/StreamTypeChangeEvent';
import { READY_EVENT } from './events/ReadyEvent';
import { toggleAttribute } from './util/CommonUtils';
import { createCustomEvent } from './util/EventUtils';
import { createTemplate } from './util/TemplateUtils';

const template = createTemplate('theoplayer-default-ui', `<style>${defaultUiCss}</style>${defaultUiHtml}`);

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
 * 1. Set its `configuration` attribute or property to a valid player configuration.
 * 1. Set its `source` attribute or property to a valid stream source.
 * 1. Optionally, customize the player using CSS custom properties and/or extra controls.
 *
 * ## Customization
 *
 * The styling can be controlled using CSS custom properties (see {@link UIContainer | `<theoplayer-ui>`}).
 * Additional controls can be added to the `top-control-bar` and `bottom-control-bar` slots.
 * For more extensive customizations, we recommend defining your own custom UI using
 * a {@link UIContainer | `<theoplayer-ui>`}.
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
 * @attribute `user-idle-timeout` - The timeout (in seconds) between when the user stops interacting with the UI,
 *   and when the user is considered to be "idle".
 * @attribute `dvr-threshold` - The minimum length (in seconds) of a livestream's sliding window for the stream to be DVR
 *   and its stream type to be set to "dvr".
 *
 * @slot `title` - A slot for the stream's title in the top control bar.
 * @slot `top-control-bar` - A slot for extra UI controls in the top control bar.
 * @slot `bottom-control-bar` - A slot for extra UI controls in the bottom control bar.
 * @slot `menu` - A slot for extra menus (see {@link Menu | `<theoplayer-menu>`}).
 * @group Components
 */
export class DefaultUI extends HTMLElement {
    /**
     * Fired when the backing player is created, and the {@link DefaultUI.player} property is set.
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
            Attribute.FLUID,
            Attribute.DEVICE_TYPE,
            Attribute.STREAM_TYPE,
            Attribute.USER_IDLE_TIMEOUT,
            Attribute.DVR_THRESHOLD,
            Attribute.HAS_TITLE
        ];
    }

    private readonly _ui: UIContainer;
    private readonly _titleSlot: HTMLSlotElement;
    private readonly _timeRange: TimeRange;
    private _appliedExtensions: boolean = false;

    /**
     * Creates a new THEOplayer default UI.
     *
     * @param configuration - The player configuration.
     *   Will be passed to the {@link theoplayer!ChromelessPlayer | ChromelessPlayer} constructor to create
     *   the underlying THEOplayer instance.
     *   Can also be set later on through the {@link configuration} property.
     */
    constructor(configuration: PlayerConfiguration = {}) {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open', delegatesFocus: true });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._ui = shadowRoot.querySelector('theoplayer-ui')!;
        this._ui.addEventListener(READY_EVENT, this._dispatchReadyEvent);
        this._ui.addEventListener(STREAM_TYPE_CHANGE_EVENT, this._updateStreamType);
        this.setConfiguration_(configuration);

        this._titleSlot = shadowRoot.querySelector('slot[name="title"]')!;
        this._titleSlot.addEventListener('slotchange', this._onTitleSlotChange);

        this._timeRange = shadowRoot.querySelector('theoplayer-time-range')!;

        this._upgradeProperty('configuration');
        this._upgradeProperty('source');
        this._upgradeProperty('fluid');
        this._upgradeProperty('muted');
        this._upgradeProperty('autoplay');
        this._upgradeProperty('streamType');
        this._upgradeProperty('userIdleTimeout');
        this._upgradeProperty('dvrThreshold');
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
        return this._ui.player;
    }

    /**
     * The player configuration.
     *
     * Used to create the underlying THEOplayer instance.
     */
    get configuration(): PlayerConfiguration {
        return this._ui.configuration;
    }

    set configuration(configuration: PlayerConfiguration) {
        this.removeAttribute(Attribute.CONFIGURATION);
        this.setConfiguration_(configuration);
    }

    private setConfiguration_(configuration: PlayerConfiguration) {
        this._ui.configuration = {
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
    get source(): SourceDescription | undefined {
        return this._ui.source;
    }

    set source(value: SourceDescription | undefined) {
        this.removeAttribute(Attribute.SOURCE);
        this._ui.source = value;
    }

    /**
     * Whether to automatically adjusts the player's height to fit the video's aspect ratio.
     */
    get fluid(): boolean {
        return this._ui.fluid;
    }

    set fluid(value: boolean) {
        this._ui.fluid = value;
    }

    /**
     * Whether the player's audio is muted.
     */
    get muted(): boolean {
        return this._ui.muted;
    }

    set muted(value: boolean) {
        this._ui.muted = value;
    }

    /**
     * Whether the player should attempt to automatically start playback.
     */
    get autoplay(): boolean {
        return this._ui.autoplay;
    }

    set autoplay(value: boolean) {
        this._ui.autoplay = value;
    }

    /**
     * The stream type, either "vod", "live" or "dvr".
     *
     * If you know in advance that the source will be a livestream, you can set this property to avoid a screen flicker
     * when the player switches between its VOD-specific and live-only controls.
     */
    get streamType(): StreamType {
        return this._ui.streamType;
    }

    set streamType(value: StreamType) {
        this._ui.streamType = value;
    }

    /**
     * The timeout (in seconds) between when the user stops interacting with the UI,
     * and when the user is considered to be "idle".
     */
    get userIdleTimeout(): number {
        return this._ui.userIdleTimeout;
    }

    set userIdleTimeout(value: number) {
        this._ui.userIdleTimeout = value;
    }

    /**
     * The minimum length (in seconds) of a livestream's sliding window for the stream to be DVR
     * and its stream type to be set to "dvr".
     */
    get dvrThreshold(): number {
        return this._ui.dvrThreshold;
    }

    set dvrThreshold(value: number) {
        this._ui.dvrThreshold = value;
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        if (!this.hasAttribute(Attribute.DEVICE_TYPE)) {
            const deviceType: DeviceType = isMobile() ? 'mobile' : isTv() ? 'tv' : 'desktop';
            this.setAttribute(Attribute.DEVICE_TYPE, deviceType);
        }

        if (!this._appliedExtensions) {
            this._appliedExtensions = true;
            applyExtensions(this);
            shadyCss.styleSubtree(this);
        }

        this._onTitleSlotChange();
    }

    disconnectedCallback(): void {
        return;
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any): void {
        if (newValue === oldValue) {
            return;
        }
        const hasValue = newValue != null;
        if (attrName === Attribute.SOURCE) {
            this._ui.source = newValue ? (JSON.parse(newValue) as SourceDescription) : undefined;
        } else if (attrName === Attribute.CONFIGURATION) {
            this.setConfiguration_(newValue ? (JSON.parse(newValue) as PlayerConfiguration) : {});
        } else if (attrName === Attribute.MUTED) {
            this.muted = hasValue;
        } else if (attrName === Attribute.AUTOPLAY) {
            this.autoplay = hasValue;
        } else if (attrName === Attribute.FLUID) {
            this.fluid = hasValue;
        } else if (attrName === Attribute.DEVICE_TYPE) {
            toggleAttribute(this, Attribute.MOBILE, newValue === 'mobile');
            toggleAttribute(this, Attribute.TV, newValue === 'tv');
            this._ui.setAttribute(Attribute.DEVICE_TYPE, newValue);
        } else if (attrName === Attribute.STREAM_TYPE) {
            this.streamType = newValue;
        } else if (attrName === Attribute.USER_IDLE_TIMEOUT) {
            this.userIdleTimeout = Number(newValue);
        } else if (attrName === Attribute.DVR_THRESHOLD) {
            this.dvrThreshold = Number(newValue);
        }
        if (DefaultUI.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }

    private readonly _updateStreamType = () => {
        this.setAttribute(Attribute.STREAM_TYPE, this.streamType);
        // Hide seekbar when stream is live with no DVR
        toggleAttribute(this._timeRange, Attribute.HIDDEN, this.streamType === 'live');
    };

    private readonly _dispatchReadyEvent = () => {
        this.dispatchEvent(createCustomEvent(READY_EVENT));
    };

    private readonly _onTitleSlotChange = () => {
        toggleAttribute(this, Attribute.HAS_TITLE, this._titleSlot.assignedNodes().length > 0);
    };
}

customElements.define('theoplayer-default-ui', DefaultUI);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-default-ui': DefaultUI;
    }
}

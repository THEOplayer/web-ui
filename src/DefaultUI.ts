import * as shadyCss from '@webcomponents/shadycss';
import type { ChromelessPlayer, PlayerConfiguration, SourceDescription } from 'theoplayer';
import type { UIContainer } from './UIContainer';
import defaultUiCss from './DefaultUI.css';
import defaultUiHtml from './DefaultUI.html';
import { Attribute } from './util/Attribute';
import { applyExtensions } from './extensions/ExtensionRegistry';
import { isMobile } from './util/Environment';
import type { StreamType } from './util/StreamType';
import type { TimeRange } from './components/TimeRange';
import { STREAM_TYPE_CHANGE_EVENT } from './events/StreamTypeChangeEvent';

const template = document.createElement('template');
template.innerHTML = `<style>${defaultUiCss}</style>${defaultUiHtml}`;
shadyCss.prepareTemplate(template, 'theoplayer-default-ui');

/**
 * A default UI for THEOplayer.
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
 * The styling can be controlled using CSS custom properties (see [`<theoplayer-ui>`]{@link UIContainer}).
 * Additional controls can be added to the `top-control-bar` and `bottom-control-bar` slots.
 * For more extensive customizations, we recommend defining your own custom UI using
 * a [`<theoplayer-ui>`]{@link UIContainer}.
 *
 * @attribute configuration - The THEOplayer {@link PlayerConfiguration}, as a JSON string.
 * @attribute source - The THEOplayer {@link SourceDescription}, as a JSON string.
 * @attribute fluid - If set, the player automatically adjusts its height to fit the video's aspect ratio.
 * @attribute muted - If set, the player starts out as muted. Reflects `ui.player.muted`.
 * @attribute autoplay - If set, the player attempts to automatically start playing (if allowed).
 * @attribute mobile - Whether to use a mobile-optimized UI layout instead.
 *   Can be used in CSS to show/hide certain desktop-specific or mobile-specific UI controls.
 * @attribute stream-type - The stream type, either "vod", "live" or "dvr".
 *   Can be used to show/hide certain UI controls specific for livestreams, such as
 *   a [`<theoplayer-live-button>`]{@link LiveButton}.
 *   If you know in advance that the source will be a livestream, you can set this attribute to avoid a screen flicker
 *   when the player switches between its VOD-specific and live-only controls.
 * @attribute user-idle-timeout - The timeout (in seconds) between when the user stops interacting with the UI,
 *   and when the user is considered to be "idle".
 * @attribute dvr-threshold - The minimum length (in seconds) of a livestream's sliding window for the stream to be DVR
 *   and its stream type to be set to "dvr".
 *
 * @slot top-control-bar - A slot for extra UI controls in the top control bar.
 * @slot bottom-control-bar - A slot for extra UI controls in the bottom control bar.
 * @slot menu - A slot for extra menus (see [`<theoplayer-menu>`]{@link Menu}).
 */
export class DefaultUI extends HTMLElement {
    static get observedAttributes() {
        return [
            Attribute.CONFIGURATION,
            Attribute.SOURCE,
            Attribute.MUTED,
            Attribute.AUTOPLAY,
            Attribute.FLUID,
            Attribute.MOBILE,
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
     *   Will be passed to the {@link ChromelessPlayer} constructor to create the underlying THEOplayer instance.
     *   Can also be set later on through the {@link configuration} property.
     */
    constructor(configuration: PlayerConfiguration = {}) {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open', delegatesFocus: true });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._ui = shadowRoot.querySelector('theoplayer-ui')!;
        this._ui.configuration = configuration;
        this._ui.addEventListener(STREAM_TYPE_CHANGE_EVENT, this._updateStreamType);

        this._titleSlot = shadowRoot.querySelector('slot[name="title"]')!;
        this._titleSlot.addEventListener('slotchange', this._onTitleSlotChange);

        this._timeRange = shadowRoot.querySelector('theoplayer-time-range')!;
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
        this._ui.configuration = configuration;
    }

    /**
     * The player's current source.
     */
    get source(): SourceDescription | undefined {
        return this._ui.source;
    }

    set source(value: SourceDescription | undefined) {
        this._ui.source = value;
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

        this._upgradeProperty('configuration');
        this._upgradeProperty('source');
        this._upgradeProperty('muted');
        this._upgradeProperty('autoplay');
        this._upgradeProperty('streamType');
        this._upgradeProperty('userIdleTimeout');
        this._upgradeProperty('dvrThreshold');

        if (!this.hasAttribute(Attribute.MOBILE) && isMobile()) {
            this.setAttribute(Attribute.MOBILE, '');
        }

        if (!this._appliedExtensions) {
            this._appliedExtensions = true;
            applyExtensions(this);
            shadyCss.styleSubtree(this);
        }

        this._onTitleSlotChange();
    }

    private _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
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
            this.source = newValue ? (JSON.parse(newValue) as SourceDescription) : undefined;
        } else if (attrName === Attribute.CONFIGURATION) {
            this.configuration = newValue ? (JSON.parse(newValue) as PlayerConfiguration) : {};
        } else if (attrName === Attribute.MUTED) {
            this.muted = hasValue;
        } else if (attrName === Attribute.AUTOPLAY) {
            this.autoplay = hasValue;
        } else if (attrName === Attribute.FLUID) {
            if (hasValue) {
                this._ui.setAttribute(Attribute.FLUID, newValue);
            } else {
                this._ui.removeAttribute(Attribute.FLUID);
            }
        } else if (attrName === Attribute.MOBILE) {
            if (hasValue) {
                this._ui.setAttribute(Attribute.MOBILE, newValue);
            } else {
                this._ui.removeAttribute(Attribute.MOBILE);
            }
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
        if (this.streamType === 'live') {
            this._timeRange.setAttribute(Attribute.HIDDEN, '');
        } else {
            this._timeRange.removeAttribute(Attribute.HIDDEN);
        }
    };

    private readonly _onTitleSlotChange = () => {
        if (this._titleSlot.assignedNodes().length > 0) {
            this.setAttribute(Attribute.HAS_TITLE, '');
        } else {
            this.removeAttribute(Attribute.HAS_TITLE);
        }
    };
}

customElements.define('theoplayer-default-ui', DefaultUI);

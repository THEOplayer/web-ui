import * as shadyCss from '@webcomponents/shadycss';
import type { ChromelessPlayer, PlayerConfiguration, SourceDescription } from 'theoplayer';
import type { UIContainer } from './UIContainer';
import defaultUiCss from './DefaultUI.css';
import defaultUiHtml from './DefaultUI.html';
import { Attribute } from './util/Attribute';
import { applyExtensions } from './extensions/ExtensionRegistry';
import { isMobile } from './util/Environment';
import type { StreamType } from './util/StreamType';
import { STREAM_TYPE_CHANGE_EVENT } from './events/StreamTypeChangeEvent';

const template = document.createElement('template');
template.innerHTML = `<style>${defaultUiCss}</style>${defaultUiHtml}`;
shadyCss.prepareTemplate(template, 'theoplayer-default-ui');

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
            Attribute.HAS_TITLE
        ];
    }

    private readonly _ui: UIContainer;
    private readonly _titleSlot: HTMLSlotElement;
    private _appliedExtensions: boolean = false;

    constructor(configuration: PlayerConfiguration = {}) {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open', delegatesFocus: true });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._ui = shadowRoot.querySelector('theoplayer-ui')!;
        this._ui.configuration = configuration;
        this._ui.addEventListener(STREAM_TYPE_CHANGE_EVENT, this._updateStreamType);

        this._titleSlot = shadowRoot.querySelector('slot[name="title"]')!;
        this._titleSlot.addEventListener('slotchange', this._onTitleSlotChange);
    }

    get player(): ChromelessPlayer | undefined {
        return this._ui.player;
    }

    get configuration(): PlayerConfiguration {
        return this._ui.configuration;
    }

    set configuration(configuration: PlayerConfiguration) {
        this._ui.configuration = configuration;
    }

    get source(): SourceDescription | undefined {
        return this._ui.source;
    }

    set source(value: SourceDescription | undefined) {
        this._ui.source = value;
    }

    get muted(): boolean {
        return this._ui.muted;
    }

    set muted(value: boolean) {
        this._ui.muted = value;
    }

    get autoplay(): boolean {
        return this._ui.autoplay;
    }

    set autoplay(value: boolean) {
        this._ui.autoplay = value;
    }

    get streamType(): StreamType {
        return this._ui.streamType;
    }

    set streamType(value: StreamType) {
        this._ui.streamType = value;
    }

    get userIdleTimeout(): number {
        return this._ui.userIdleTimeout;
    }

    set userIdleTimeout(value: number) {
        this._ui.userIdleTimeout = value;
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        this._upgradeProperty('configuration');
        this._upgradeProperty('source');
        this._upgradeProperty('muted');
        this._upgradeProperty('autoplay');
        this._upgradeProperty('streamType');
        this._upgradeProperty('userIdleTimeout');

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
        } else if (attrName === Attribute.STREAM_TYPE) {
            this.streamType = newValue;
        } else if (attrName === Attribute.USER_IDLE_TIMEOUT) {
            this.userIdleTimeout = Number(newValue);
        }
        if (DefaultUI.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }

    private readonly _updateStreamType = () => {
        this.setAttribute(Attribute.STREAM_TYPE, this.streamType);
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

import * as shadyCss from '@webcomponents/shadycss';
import { ChromelessPlayer, SourceDescription } from 'theoplayer';
import { THEOplayerUI } from './THEOplayerUI';
import defaultUiCss from './DefaultUI.css';
import defaultUiHtml from './DefaultUI.html';

const template = document.createElement('template');
template.innerHTML = `<style>${defaultUiCss}</style>${defaultUiHtml}`;
shadyCss.prepareTemplate(template, 'theoplayer-default-ui');

const ATTR_LIBRARY_LOCATION = 'library-location';
const ATTR_LICENSE = 'license';
const ATTR_LICENSE_URL = 'license-url';
const ATTR_SOURCE = 'source';
const ATTR_AUTOPLAY = 'autoplay';

export class DefaultUI extends HTMLElement {
    static get observedAttributes() {
        return [ATTR_LIBRARY_LOCATION, ATTR_LICENSE, ATTR_LICENSE_URL, ATTR_SOURCE, ATTR_AUTOPLAY];
    }

    private readonly _ui: THEOplayerUI;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._ui = shadowRoot.querySelector('theoplayer-ui')!;
    }

    get player(): ChromelessPlayer | undefined {
        return this._ui.player;
    }

    get libraryLocation(): string | undefined {
        return this._ui.libraryLocation;
    }

    set libraryLocation(value: string | undefined) {
        this._ui.libraryLocation = value;
    }

    get license(): string | undefined {
        return this._ui.license;
    }

    set license(value: string | undefined) {
        this._ui.license = value;
    }

    get licenseUrl(): string | undefined {
        return this._ui.licenseUrl;
    }

    set licenseUrl(value: string | undefined) {
        this._ui.licenseUrl = value;
    }

    get source(): SourceDescription | undefined {
        return this._ui.source;
    }

    set source(value: SourceDescription | undefined) {
        this._ui.source = value;
    }

    get autoplay(): boolean {
        return this._ui.autoplay;
    }

    set autoplay(value: boolean) {
        this._ui.autoplay = value;
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        this._upgradeProperty('libraryLocation');
        this._upgradeProperty('license');
        this._upgradeProperty('licenseUrl');
        this._upgradeProperty('source');
        this._upgradeProperty('autoplay');
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
        if (attrName === ATTR_SOURCE) {
            this.source = newValue ? (JSON.parse(newValue) as SourceDescription) : undefined;
        } else if (attrName === ATTR_LIBRARY_LOCATION) {
            this.libraryLocation = newValue;
        } else if (attrName === ATTR_LICENSE) {
            this.license = newValue;
        } else if (attrName === ATTR_LICENSE_URL) {
            this.licenseUrl = newValue;
        } else if (attrName === ATTR_AUTOPLAY) {
            this.autoplay = hasValue;
        }
    }
}

customElements.define('theoplayer-default-ui', DefaultUI);

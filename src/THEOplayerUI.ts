import * as shadyCss from '@webcomponents/shadycss';
import { ChromelessPlayer, SourceDescription } from 'theoplayer';
import elementCss from './THEOplayerUI.css';
import elementHtml from './THEOplayerUI.html';

const template = document.createElement('template');
template.innerHTML = `<style>${elementCss}</style>${elementHtml}`;
shadyCss.prepareTemplate(template, 'theoplayer-ui');

export class THEOplayerUI extends HTMLElement {
    private readonly _playerEl: HTMLElement;
    private _player: ChromelessPlayer | undefined = undefined;
    private _source: SourceDescription | undefined = undefined;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._playerEl = shadowRoot.querySelector('[part~="media-layer"]')!;
    }

    get libraryLocation(): string | undefined {
        return this.getAttribute('library-location') ?? undefined;
    }

    set libraryLocation(value: string | undefined) {
        if (value) {
            this.setAttribute('library-location', value);
        } else {
            this.removeAttribute('library-location');
        }
    }

    get license(): string | undefined {
        return this.getAttribute('license') ?? undefined;
    }

    set license(value: string | undefined) {
        if (value) {
            this.setAttribute('license', value);
        } else {
            this.removeAttribute('license');
        }
    }

    get licenseUrl(): string | undefined {
        return this.getAttribute('license-url') ?? undefined;
    }

    set licenseUrl(value: string | undefined) {
        if (value) {
            this.setAttribute('license-url', value);
        } else {
            this.removeAttribute('license-url');
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

    connectedCallback(): void {
        shadyCss.styleElement(this);

        this._upgradeProperty('libraryLocation');
        this._upgradeProperty('license');
        this._upgradeProperty('licenseUrl');
        this._upgradeProperty('source');

        if (!this._player) {
            this._player = new ChromelessPlayer(this._playerEl, {
                libraryLocation: this.libraryLocation,
                license: this.license,
                licenseUrl: this.licenseUrl
            });
            if (this._source) {
                this._player.source = this._source;
                this._source = undefined;
            }
        }
    }

    private _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    disconnectedCallback(): void {
        if (this._player) {
            this._player.destroy();
            this._player = undefined;
        }
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any): void {
        if (attrName === 'source' && newValue !== oldValue) {
            this.source = newValue ? (JSON.parse(newValue) as SourceDescription) : undefined;
        }
    }
}

customElements.define('theoplayer-ui', THEOplayerUI);

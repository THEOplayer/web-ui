import * as shadyCss from '@webcomponents/shadycss';
import { ChromelessPlayer, SourceDescription } from 'theoplayer';
import elementCss from './THEOplayerUI.css';
import elementHtml from './THEOplayerUI.html';
import { isElement } from './utils';
import { forEachPlayerReceiverElement } from './PlayerReceiverMixin';

const template = document.createElement('template');
template.innerHTML = `<style>${elementCss}</style>${elementHtml}`;
shadyCss.prepareTemplate(template, 'theoplayer-ui');

const ATTR_LIBRARY_LOCATION = 'library-location';
const ATTR_LICENSE = 'license';
const ATTR_LICENSE_URL = 'license-url';
const ATTR_SOURCE = 'source';
const ATTR_AUTOPLAY = 'autoplay';

export class THEOplayerUI extends HTMLElement {
    static get observedAttributes() {
        return [ATTR_LIBRARY_LOCATION, ATTR_LICENSE, ATTR_LICENSE_URL, ATTR_SOURCE, ATTR_AUTOPLAY];
    }

    private readonly _playerEl: HTMLElement;
    private readonly _mutationObserver: MutationObserver;
    private _player: ChromelessPlayer | undefined = undefined;
    private _source: SourceDescription | undefined = undefined;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._playerEl = shadowRoot.querySelector('[part~="media-layer"]')!;

        this._mutationObserver = new MutationObserver(this._onMutation);
    }

    get libraryLocation(): string | undefined {
        return this.getAttribute(ATTR_LIBRARY_LOCATION) ?? undefined;
    }

    set libraryLocation(value: string | undefined) {
        if (value) {
            this.setAttribute(ATTR_LIBRARY_LOCATION, value);
        } else {
            this.removeAttribute(ATTR_LIBRARY_LOCATION);
        }
    }

    get license(): string | undefined {
        return this.getAttribute('license') ?? undefined;
    }

    set license(value: string | undefined) {
        if (value) {
            this.setAttribute(ATTR_LICENSE, value);
        } else {
            this.removeAttribute(ATTR_LICENSE);
        }
    }

    get licenseUrl(): string | undefined {
        return this.getAttribute(ATTR_LICENSE_URL) ?? undefined;
    }

    set licenseUrl(value: string | undefined) {
        if (value) {
            this.setAttribute(ATTR_LICENSE_URL, value);
        } else {
            this.removeAttribute(ATTR_LICENSE_URL);
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

    get autoplay(): boolean {
        return this.hasAttribute(ATTR_AUTOPLAY);
    }

    set autoplay(value: boolean) {
        if (value) {
            this.setAttribute(ATTR_AUTOPLAY, '');
        } else {
            this.removeAttribute(ATTR_AUTOPLAY);
        }
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        this._upgradeProperty('libraryLocation');
        this._upgradeProperty('license');
        this._upgradeProperty('licenseUrl');
        this._upgradeProperty('source');
        this._upgradeProperty('autoplay');

        if (!this._player) {
            this._player = new ChromelessPlayer(this._playerEl, {
                libraryLocation: this.libraryLocation,
                license: this.license,
                licenseUrl: this.licenseUrl
            });
        }
        if (this._source) {
            this._player.source = this._source;
            this._source = undefined;
        }
        this._player.autoplay = this.autoplay;

        attachPlayerToReceivers(this, this._player);
        this._mutationObserver.observe(this, { childList: true, subtree: true });
    }

    private _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    disconnectedCallback(): void {
        this._mutationObserver.disconnect();
        attachPlayerToReceivers(this, undefined);

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
        if (attrName === ATTR_SOURCE) {
            this.source = newValue ? (JSON.parse(newValue) as SourceDescription) : undefined;
        }
        if (attrName === ATTR_AUTOPLAY && newValue !== oldValue) {
            if (this._player) {
                this._player.autoplay = hasValue;
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
                        attachPlayerToReceivers(node, this._player);
                    }
                }
                for (let i = 0; i < removedNodes.length; i++) {
                    const node = removedNodes[i];
                    if (isElement(node)) {
                        attachPlayerToReceivers(node, undefined);
                    }
                }
            }
        }
    };
}

function attachPlayerToReceivers(element: Element, player: ChromelessPlayer | undefined): void {
    void forEachPlayerReceiverElement(element, (receiver) => {
        receiver.attachPlayer(player);
    });
}

customElements.define('theoplayer-ui', THEOplayerUI);

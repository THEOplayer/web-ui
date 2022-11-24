import * as shadyCss from '@webcomponents/shadycss';
import { ChromelessPlayer, SourceDescription } from 'theoplayer';
import elementCss from './THEOplayerUI.css';
import elementHtml from './THEOplayerUI.html';
import { isElement } from './utils';
import { findPlayerReceiverElements } from './PlayerReceiverMixin';

const template = document.createElement('template');
template.innerHTML = `<style>${elementCss}</style>${elementHtml}`;
shadyCss.prepareTemplate(template, 'theoplayer-ui');

export class THEOplayerUI extends HTMLElement {
    static get observedAttributes() {
        return ['library-location', 'license', 'license-url', 'source'];
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
        }
        if (this._source) {
            this._player.source = this._source;
            this._source = undefined;
        }

        void this._registerPlayerReceivers(this);
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
        void this._unregisterPlayerReceivers(this);

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

    private readonly _onMutation = (mutations: MutationRecord[]): void => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                const { addedNodes, removedNodes } = mutation;
                for (let i = 0; i < addedNodes.length; i++) {
                    const node = addedNodes[i];
                    if (isElement(node)) {
                        void this._registerPlayerReceivers(node);
                    }
                }
                for (let i = 0; i < removedNodes.length; i++) {
                    const node = removedNodes[i];
                    if (isElement(node)) {
                        void this._unregisterPlayerReceivers(node);
                    }
                }
            }
        }
    };

    private async _registerPlayerReceivers(element: Element): Promise<void> {
        for (const receiver of await findPlayerReceiverElements(element)) {
            receiver.attachPlayer(this._player);
        }
    }

    private async _unregisterPlayerReceivers(element: Element): Promise<void> {
        for (const receiver of await findPlayerReceiverElements(element)) {
            receiver.attachPlayer(undefined);
        }
    }
}

customElements.define('theoplayer-ui', THEOplayerUI);

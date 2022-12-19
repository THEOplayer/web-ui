import * as shadyCss from '@webcomponents/shadycss';
import type { ChromelessPlayer, PlayerConfiguration, SourceDescription } from 'theoplayer';
import type { UIContainer } from './UIContainer';
import defaultUiCss from './DefaultUI.css';
import defaultUiHtml from './DefaultUI.html';

const template = document.createElement('template');
template.innerHTML = `<style>${defaultUiCss}</style>${defaultUiHtml}`;
shadyCss.prepareTemplate(template, 'theoplayer-default-ui');

const ATTR_PLAYER_CONFIGURATION = 'player-configuration';
const ATTR_SOURCE = 'source';
const ATTR_AUTOPLAY = 'autoplay';

export class DefaultUI extends HTMLElement {
    static get observedAttributes() {
        return [ATTR_PLAYER_CONFIGURATION, ATTR_SOURCE, ATTR_AUTOPLAY];
    }

    private readonly _ui: UIContainer;

    constructor(playerConfiguration: PlayerConfiguration = {}) {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._ui = shadowRoot.querySelector('theoplayer-ui')!;
        this._ui.playerConfiguration = playerConfiguration;
    }

    get player(): ChromelessPlayer | undefined {
        return this._ui.player;
    }

    get playerConfiguration(): PlayerConfiguration {
        return this._ui.playerConfiguration;
    }

    set playerConfiguration(playerConfiguration: PlayerConfiguration) {
        this._ui.playerConfiguration = playerConfiguration;
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

        this._upgradeProperty('playerConfiguration');
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
        } else if (attrName === ATTR_PLAYER_CONFIGURATION) {
            this.playerConfiguration = newValue ? (JSON.parse(newValue) as PlayerConfiguration) : {};
        } else if (attrName === ATTR_AUTOPLAY) {
            this.autoplay = hasValue;
        }
    }
}

customElements.define('theoplayer-default-ui', DefaultUI);

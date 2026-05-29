import { html, type HTMLTemplateResult, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { ChromelessPlayer as TheoPlayer, type TheoLiveApi } from 'theoplayer/chromeless';
import badNetworkModeButtonCss from './BadNetworkModeButton.css';
import settingsIcon from '../../../icons/settings.svg';
import warningIcon from '../../../icons/warning.svg';
import { stateReceiver } from '../../StateReceiverMixin';
import { MenuButton } from '../../MenuButton';
import type { BadNetworkModeMenu } from './BadNetworkModeMenu';
import { getLocale, languageContext } from '../../../i18n';
import { consume } from '@lit/context';
import { Attribute } from '../../../util/Attribute';

/**
 * A menu button that opens a {@link BadNetworkModeMenu}.
 *
 * @attribute `menu` - The ID of the bad network menu.
 */
@customElement('theolive-bad-network-button')
@stateReceiver(['player'])
export class BadNetworkModeButton extends MenuButton {
    static styles = [...MenuButton.styles, badNetworkModeButtonCss];

    private _player: TheoPlayer | undefined;
    private _theoLive: TheoLiveApi | undefined;

    @state()
    private accessor _inBadNetworkMode = false;

    private readonly handleEnterBadNetworkMode_ = () => {
        this._inBadNetworkMode = true;
    };

    private readonly handleExitBadNetworkMode_ = () => {
        this._inBadNetworkMode = false;
    };

    @property({ reflect: true, type: String, attribute: Attribute.LANG })
    @consume({ context: languageContext, subscribe: true })
    accessor lang: string = '';

    get player(): TheoPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
    set player(player: TheoPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._theoLive) {
            this._theoLive.removeEventListener('enterbadnetworkmode', this.handleEnterBadNetworkMode_);
            this._theoLive.removeEventListener('exitbadnetworkmode', this.handleExitBadNetworkMode_);
        }
        this._player = player;
        this._theoLive = player?.theoLive;
        if (this._theoLive) {
            this._theoLive.addEventListener('enterbadnetworkmode', this.handleEnterBadNetworkMode_);
            this._theoLive.addEventListener('exitbadnetworkmode', this.handleExitBadNetworkMode_);
        }
    }

    override willUpdate(changedProperties: PropertyValues) {
        super.willUpdate(changedProperties);
        this._updateAriaLabel();
    }

    private _updateAriaLabel(): void {
        const locale = getLocale(this.lang);
        this.ariaLabel = locale.openBadNetworkModeMenuAria;
    }

    protected override render(): HTMLTemplateResult {
        const warningStyles = {
            display: this._inBadNetworkMode ? '' : 'none'
        };
        return html`<span part="icon"
            >${unsafeSVG(settingsIcon)}<span part="warning-icon" style=${styleMap(warningStyles)}>${unsafeSVG(warningIcon)}</span></span
        >`;
    }
}

import { ChromelessPlayer as TheoPlayer, type TheoLiveApi } from 'theoplayer/chromeless';
import settingsCss from './BadNetworkModeButton.css';
import { buttonTemplate } from '../../Button';
import settingsIcon from '../../../icons/settings.svg';
import warningIcon from '../../../icons/warning.svg';
import { StateReceiverMixin } from '../../StateReceiverMixin';
import { MenuButton } from '../../MenuButton';
import { Attribute } from '../../../util/Attribute';
import { createTemplate } from '../../../util/TemplateUtils';

const html = `<span part="icon">${settingsIcon}<span part="warning-icon">${warningIcon}</span></span>`;
const template = createTemplate('theolive-bad-network-button', buttonTemplate(html, settingsCss));

/**
 * A menu button that opens a settings menu.
 *
 * @attribute `menu` - The ID of the settings menu.
 * @group Components
 */
export class BadNetworkModeButton extends StateReceiverMixin(MenuButton, ['player']) {
    private _player: TheoPlayer | undefined;
    private _theoLive: TheoLiveApi | undefined;
    private _warningIcon: HTMLElement | undefined;

    constructor() {
        super({ template: template() });
    }

    override connectedCallback() {
        super.connectedCallback();

        if (!this.hasAttribute(Attribute.ARIA_LABEL)) {
            this.setAttribute(Attribute.ARIA_LABEL, 'open settings menu');
        }

        this._warningIcon = this.shadowRoot!.querySelector<HTMLElement>('[part="warning-icon"]') ?? undefined;
    }

    private readonly handleEnterBadNetworkMode_ = () => {
        if (this._warningIcon) {
            this._warningIcon.style.display = 'block';
        }
    };

    private readonly handleExitBadNetworkMode_ = () => {
        if (this._warningIcon) {
            this._warningIcon.style.display = 'none';
        }
    };

    get player(): TheoPlayer | undefined {
        return this._player;
    }

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
}

customElements.define('theolive-bad-network-button', BadNetworkModeButton);

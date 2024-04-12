import { ChromelessPlayer as TheoPlayer } from 'theoplayer/chromeless';
import settingsCss from './BadNetworkModeButton.css';
import { buttonTemplate } from '../../Button';
import settingsIcon from '../../../icons/settings.svg';
import warningIcon from '../../../icons/warning.svg';
import { StateReceiverMixin } from '../../StateReceiverMixin';
import { MenuButton } from '../../MenuButton';
import { Attribute } from '../../../util/Attribute';
import { createTemplate } from '../../../util/TemplateUtils';

const html = `<style>${settingsCss}</style>
<div id="container">
<span id="settings-icon">${settingsIcon}</span>
<span id="warning-icon">${warningIcon}</span>
</div>`;
const template = createTemplate('theolive-bad-network-button', buttonTemplate(html));

/**
 * A menu button that opens a settings menu.
 *
 * @attribute `menu` - The ID of the settings menu.
 * @group Components
 */
export class BadNetworkModeButton extends StateReceiverMixin(MenuButton, ['player']) {
    private _player: TheoPlayer | undefined;
    private _warningIcon: HTMLElement | undefined;

    constructor() {
        super({ template: template() });
    }

    override connectedCallback() {
        super.connectedCallback();

        if (!this.hasAttribute(Attribute.ARIA_LABEL)) {
            this.setAttribute(Attribute.ARIA_LABEL, 'open settings menu');
        }

        this._warningIcon = this.shadowRoot!.getElementById('warning-icon') ?? undefined;
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
        if (this._player) {
            this._player.theoLive?.removeEventListener('enterbadnetworkmode', this.handleEnterBadNetworkMode_);
            this._player.theoLive?.removeEventListener('exitbadnetworkmode', this.handleExitBadNetworkMode_);
        }
        this._player = player;
        if (this._player) {
            this._player.theoLive?.addEventListener('enterbadnetworkmode', this.handleEnterBadNetworkMode_);
            this._player.theoLive?.addEventListener('exitbadnetworkmode', this.handleExitBadNetworkMode_);
        }
    }
}

customElements.define('theolive-bad-network-button', BadNetworkModeButton);

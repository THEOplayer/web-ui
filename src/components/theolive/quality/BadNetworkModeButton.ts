import { ChromelessPlayer as TheoPlayer } from 'theoplayer/chromeless';
import * as shadyCss from '@webcomponents/shadycss';
import settingsCss from './BadNetworkModeButton.css';
import { buttonTemplate } from '../../Button';
import settingsIcon from '../../../icons/settings.svg';
import warningIcon from '../../../icons/warning.svg';
import { StateReceiverMixin } from '../../StateReceiverMixin';
import { MenuButton } from '../../MenuButton';
import { Attribute } from '../../../util/Attribute';

const template = document.createElement('template');

template.innerHTML = buttonTemplate(`
<style>${settingsCss}</style>
<div id="container">
    ${settingsIcon}
    ${warningIcon}
</div>
`);
shadyCss.prepareTemplate(template, 'theolive-bad-network-button');

/**
 * A menu button that opens a settings menu.
 *
 * @attribute `menu` - The ID of the settings menu.
 * @group Components
 */
export class BadNetworkModeButton extends StateReceiverMixin(MenuButton, ['player']) {
    private _player: TheoPlayer | undefined;
    #warningIcon: HTMLElement | undefined;

    constructor() {
        super({ template });
    }

    override connectedCallback() {
        super.connectedCallback();

        if (!this.hasAttribute(Attribute.ARIA_LABEL)) {
            this.setAttribute(Attribute.ARIA_LABEL, 'open settings menu');
        }

        this.#warningIcon = this.shadowRoot!.getElementById('warning-icon') ?? undefined;
    }

    readonly #handleEnterBadNetworkMode = () => {
        if (this.#warningIcon) {
            this.#warningIcon.style.display = 'block';
        }
    };

    readonly #handleExitBadNetworkMode = () => {
        if (this.#warningIcon) {
            this.#warningIcon.style.display = 'none';
        }
    };

    readonly #handleTrackUpdate = () => {
        // const player = uiPlayers.get(this._player!)!;
        // const videoTrack = player.videoTracks.item(0);
        // if (player.sourceType === 'theolive' && videoTrack && videoTrack.qualities.some((q) => q.isBadNetworkOnly)) {
        //     this.style.display = 'flex';
        // } else {
        //     this.style.display = 'none';
        // }
    };

    get player(): TheoPlayer | undefined {
        return this._player;
    }

    set player(player: TheoPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player) {
            this._player.theoLive?.removeEventListener('enterbadnetworkmode', this.#handleEnterBadNetworkMode);
            this._player.theoLive?.removeEventListener('exitbadnetworkmode', this.#handleExitBadNetworkMode);
            this._player.videoTracks.removeEventListener('addtrack', this.#handleTrackUpdate);
            this._player.videoTracks.removeEventListener('removetrack', this.#handleTrackUpdate);
        }
        this._player = player;
        if (this._player) {
            this._player.theoLive?.addEventListener('enterbadnetworkmode', this.#handleEnterBadNetworkMode);
            this._player.theoLive?.addEventListener('exitbadnetworkmode', this.#handleExitBadNetworkMode);
            this._player.videoTracks.addEventListener('addtrack', this.#handleTrackUpdate);
            this._player.videoTracks.addEventListener('removetrack', this.#handleTrackUpdate);
        }
    }
}

customElements.define('theolive-bad-network-button', BadNetworkModeButton);

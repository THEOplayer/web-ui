import type { ChromelessPlayer, TheoLiveApi } from 'theoplayer/chromeless';
import { type ButtonOptions } from '../../Button';
import { StateReceiverMixin } from '../../StateReceiverMixin';
import { RadioButton } from '../../RadioButton';
import { Attribute } from '../../../util/Attribute';

/**
 * A radio button that shows the label of a given video quality, and switches the video track's
 * {@link theoplayer!MediaTrack.targetQuality | target quality} to that quality when clicked.
 *
 * @group Components
 */
export abstract class AbstractQualitySelector extends StateReceiverMixin(RadioButton, ['player']) {
    private _player: ChromelessPlayer | undefined;
    private _theoLive: TheoLiveApi | undefined;
    protected _slotEl: HTMLSlotElement;
    protected _badNetworkMode: boolean = false;

    protected constructor(options: ButtonOptions) {
        super(options);
        this._slotEl = this.shadowRoot!.querySelector('slot')!;
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._theoLive) {
            this._theoLive.removeEventListener('enterbadnetworkmode', this.handleEnterBadNetworkMode_);
            this._theoLive.removeEventListener('exitbadnetworkmode', this.handleExitBadNetworkMode_);
        }
        this._player = player;
        this._theoLive = player?.theoLive;
        this._badNetworkMode = this._theoLive?.badNetworkMode ?? false;
        if (this._theoLive) {
            this._theoLive.addEventListener('enterbadnetworkmode', this.handleEnterBadNetworkMode_);
            this._theoLive.addEventListener('exitbadnetworkmode', this.handleExitBadNetworkMode_);
        }
        this.handlePlayer();
    }

    private readonly handleEnterBadNetworkMode_ = () => {
        this._badNetworkMode = true;
        this.handleEnterBadNetworkMode();
    };

    private readonly handleExitBadNetworkMode_ = () => {
        this._badNetworkMode = false;
        this.handleExitBadNetworkMode();
    };

    handleEnterBadNetworkMode(): void {
        // do nothing
    }

    handleExitBadNetworkMode(): void {
        // do nothing
    }

    protected abstract handlePlayer(): void;

    protected abstract handleChecked(checked: boolean): void;

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        if (newValue === oldValue) {
            return;
        }
        if (attrName === Attribute.ARIA_CHECKED && oldValue !== newValue) {
            this.handleChecked(this.checked);
        }
    }
}

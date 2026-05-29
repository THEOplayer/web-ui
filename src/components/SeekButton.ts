import { html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Button } from './Button';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import seekButtonCss from './SeekButton.css';
import seekForwardIcon from '../icons/seek-forward.svg';
import { stateReceiver } from './StateReceiverMixin';
import { Attribute } from '../util/Attribute';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { getLocale, languageContext } from '../i18n';
import { consume } from '@lit/context';
import { toDuration } from '../util/TimeUtils';

const DEFAULT_SEEK_OFFSET = 10;

/**
 * A button that seeks forward or backward by a fixed offset.
 *
 * @cssproperty `--theoplayer-seek-button-font-size` - The font size of the offset number rendered inside the seek icon. Defaults to `calc(0.3 * --theoplayer-button-icon-height)`.
 */
@customElement('theoplayer-seek-button')
@stateReceiver(['player'])
export class SeekButton extends Button {
    static styles = [...Button.styles, seekButtonCss];

    private _player: ChromelessPlayer | undefined;

    /**
     * The offset (in seconds) by which to seek forward (if positive) or backward (if negative).
     */
    @property({ reflect: true, type: Number, attribute: Attribute.SEEK_OFFSET })
    accessor seekOffset: number = DEFAULT_SEEK_OFFSET;

    @property({ reflect: true, type: String, attribute: Attribute.LANG })
    @consume({ context: languageContext, subscribe: true })
    accessor lang: string = '';

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
    set player(player: ChromelessPlayer | undefined) {
        this._player = player;
    }

    protected override handleClick() {
        if (this._player === undefined) {
            return;
        }
        const duration = this._player.duration;
        if (isNaN(duration)) {
            return;
        }
        this._player.currentTime = Math.max(0, Math.min(duration, this._player.currentTime + this.seekOffset));
    }

    override willUpdate(changedProperties: PropertyValues) {
        super.willUpdate(changedProperties);
        this._updateAriaLabel();
    }

    private _updateAriaLabel(): void {
        const locale = getLocale(this.lang);
        const seekOffset = this.seekOffset;
        const duration = locale.formatDuration(toDuration(Math.abs(seekOffset)));
        this.ariaLabel = seekOffset >= 0 ? locale.seekForwardAria(duration) : locale.seekBackwardAria(duration);
    }

    protected override render() {
        return html`<span part="icon"><slot name="icon">${unsafeSVG(seekForwardIcon)}</slot></span
            ><span part="offset">${String(Math.abs(this.seekOffset))}</span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-seek-button': SeekButton;
    }
}

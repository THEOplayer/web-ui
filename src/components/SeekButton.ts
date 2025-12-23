import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Button } from './Button';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import seekButtonCss from './SeekButton.css';
import seekForwardIcon from '../icons/seek-forward.svg';
import { stateReceiver } from './StateReceiverMixin';
import { Attribute } from '../util/Attribute';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

const DEFAULT_SEEK_OFFSET = 10;

/**
 * A button that seeks forward or backward by a fixed offset.
 *
 * @attribute `seek-offset` - The offset (in seconds) by which to seek forward (if positive) or backward (if negative).
 */
@customElement('theoplayer-seek-button')
@stateReceiver(['player'])
export class SeekButton extends Button {
    static styles = [...Button.styles, seekButtonCss];

    private _player: ChromelessPlayer | undefined;

    override connectedCallback() {
        super.connectedCallback();
        this._updateAriaLabel();
    }

    /**
     * The offset (in seconds) by which to seek forward (if positive) or backward (if negative).
     */
    @property({ reflect: true, type: Number, attribute: Attribute.SEEK_OFFSET })
    accessor seekOffset: number = DEFAULT_SEEK_OFFSET;

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

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (SeekButton.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            this._updateAriaLabel();
        }
    }

    private _updateAriaLabel(): void {
        const seekOffset = this.seekOffset;
        const label = seekOffset >= 0 ? `seek forward by ${seekOffset} seconds` : `seek backward by ${-seekOffset} seconds`;
        this.setAttribute(Attribute.ARIA_LABEL, label);
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

import * as shadyCss from '@webcomponents/shadycss';
import { Button, buttonTemplate } from './Button';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import seekButtonCss from './SeekButton.css';
import seekForwardIcon from '../icons/seek-forward.svg';
import { StateReceiverMixin } from './StateReceiverMixin';
import { Attribute } from '../util/Attribute';
import { setTextContent } from '../util/CommonUtils';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(
    `<span part="icon"><slot name="icon">${seekForwardIcon}</slot></span>` + `<span part="offset"></span>`,
    seekButtonCss
);
shadyCss.prepareTemplate(template, 'theoplayer-seek-button');

const DEFAULT_SEEK_OFFSET = 10;

/**
 * `<theoplayer-seek-button>` - A button that seeks forward or backward by a fixed offset.
 *
 * @attribute `seek-offset` - The offset (in seconds) by which to seek forward (if positive) or backward (if negative).
 * @group Components
 */
export class SeekButton extends StateReceiverMixin(Button, ['player']) {
    static get observedAttributes() {
        return [...Button.observedAttributes, Attribute.SEEK_OFFSET];
    }

    private _player: ChromelessPlayer | undefined;
    private _offsetEl: HTMLElement;

    constructor() {
        super({ template });
        this._offsetEl = this.shadowRoot!.querySelector('[part="offset"]')!;
        this._upgradeProperty('player');
        this._upgradeProperty('seekOffset');
    }

    override connectedCallback() {
        super.connectedCallback();
        this._updateAriaLabel();
    }

    /**
     * The offset (in seconds) by which to seek forward (if positive) or backward (if negative).
     */
    get seekOffset(): number {
        return Number(this.getAttribute(Attribute.SEEK_OFFSET) ?? DEFAULT_SEEK_OFFSET);
    }

    set seekOffset(value: number) {
        this.setAttribute(Attribute.SEEK_OFFSET, String(value));
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

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
        if (newValue === oldValue) {
            return;
        }
        if (attrName === Attribute.SEEK_OFFSET) {
            setTextContent(this._offsetEl, String(Math.abs(this.seekOffset)));
        }
        if (SeekButton.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
            this._updateAriaLabel();
        }
    }

    private _updateAriaLabel(): void {
        const seekOffset = this.seekOffset;
        const label = seekOffset >= 0 ? `seek forward by ${seekOffset} seconds` : `seek backward by ${-seekOffset} seconds`;
        this.setAttribute(Attribute.ARIA_LABEL, label);
    }
}

customElements.define('theoplayer-seek-button', SeekButton);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-seek-button': SeekButton;
    }
}

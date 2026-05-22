import { html, type HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Button } from './Button';
import { stateReceiver } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { getLocale } from '../i18n';
import { Attribute } from '../util/Attribute';

/**
 * A button that resets the text track style.
 */
@customElement('theoplayer-text-track-style-reset-button')
@stateReceiver(['player', 'lang'])
export class TextTrackStyleResetButton extends Button {
    @property({ reflect: true, type: String, attribute: Attribute.LANG })
    accessor lang: string = '';

    private _player: ChromelessPlayer | undefined;

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
        const { textTrackStyle } = this._player;
        textTrackStyle.fontFamily = undefined;
        textTrackStyle.fontColor = undefined;
        textTrackStyle.fontSize = undefined;
        textTrackStyle.backgroundColor = undefined;
        textTrackStyle.windowColor = undefined;
        textTrackStyle.edgeStyle = undefined;
    }

    protected override render(): HTMLTemplateResult {
        const locale = getLocale(this.lang);
        return html`<slot>${locale.textTrackStyleResetLabel}</slot>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-text-track-style-reset-button': TextTrackStyleResetButton;
    }
}

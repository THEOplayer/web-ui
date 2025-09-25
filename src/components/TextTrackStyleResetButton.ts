import { html, type HTMLTemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Button } from './Button';
import { stateReceiver } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer/chromeless';

/**
 * A button that resets the text track style.
 *
 * @group Components
 */
@customElement('theoplayer-text-track-style-reset-button')
@stateReceiver(['player'])
export class TextTrackStyleResetButton extends Button {
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
        return html`<slot>Reset</slot>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-text-track-style-reset-button': TextTrackStyleResetButton;
    }
}

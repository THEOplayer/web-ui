import * as shadyCss from '@webcomponents/shadycss';
import { Button, buttonTemplate } from './Button';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer/chromeless';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<slot>Reset</slot>`);
shadyCss.prepareTemplate(template, 'theoplayer-text-track-style-reset-button');

/**
 * `<theoplayer-text-track-style-reset-button>` - A button that resets the text track style.
 *
 * @group Components
 */
export class TextTrackStyleResetButton extends StateReceiverMixin(Button, ['player']) {
    static get observedAttributes() {
        return [...Button.observedAttributes];
    }

    private _player: ChromelessPlayer | undefined;

    constructor() {
        super({ template });
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
        const { textTrackStyle } = this._player;
        textTrackStyle.fontFamily = undefined;
        textTrackStyle.fontColor = undefined;
        textTrackStyle.fontSize = undefined;
        textTrackStyle.backgroundColor = undefined;
        textTrackStyle.windowColor = undefined;
        textTrackStyle.edgeStyle = undefined;
    }
}

customElements.define('theoplayer-text-track-style-reset-button', TextTrackStyleResetButton);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-text-track-style-reset-button': TextTrackStyleResetButton;
    }
}

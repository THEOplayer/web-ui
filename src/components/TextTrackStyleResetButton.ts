import { Button, buttonTemplate } from './Button';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import { createTemplate } from '../util/TemplateUtils';

const template = createTemplate('theoplayer-text-track-style-reset-button', buttonTemplate(`<slot>Reset</slot>`));

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
        super({ template: template() });
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

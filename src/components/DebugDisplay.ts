import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import debugDisplayCss from './DebugDisplay.css';
import { stateReceiver } from './StateReceiverMixin';
import type { ChromelessPlayer, CurrentSourceChangeEvent } from 'theoplayer/chromeless';

@customElement('theoplayer-debug-display')
@stateReceiver(['player'])
export class DebugDisplay extends LitElement {
    static override styles = [debugDisplayCss];

    private _player: ChromelessPlayer | undefined;

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._player.removeEventListener('currentsourcechange', this._onCurrentSourceChange);
        }
        this._player = player;
        if (this._player !== undefined) {
            this._player.addEventListener('currentsourcechange', this._onCurrentSourceChange);
        }
    }

    @state()
    accessor currentSrc: string = '';

    private readonly _onCurrentSourceChange = (event: CurrentSourceChangeEvent): void => {
        this.currentSrc = event.currentSource?.src ?? '';
    };

    protected override render(): unknown {
        return html`
            <div class="label">Selected source</div>
            <div class="value"><a href=${this.currentSrc}>${this.currentSrc}</a></div>
        `;
    }
}

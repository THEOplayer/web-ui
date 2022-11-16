import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('theoplayer-ui')
export class THEOplayerUI extends LitElement {
    constructor() {
        super();
    }

    static styles = css`
        :host {
            box-sizing: border-box;
            position: relative;
            width: 600px;
            height: 400px;
            display: inline-block;
            background-color: var(--media-background-color, #000);
        }

        [part~='layer']:not([part~='media-layer']) {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            display: flex;
            pointer-events: none;
            background: none;
        }

        [part~='layer'][part~='vertical-layer'] {
            flex-flow: column nowrap;
            align-items: flex-start;
        }

        [part~='layer'][part~='centered-layer'] {
            align-items: center;
            justify-content: center;
        }

        [part~='middle'] {
            display: inline;
            flex-grow: 1;
            pointer-events: none;
            background: none;
        }
    `;

    render() {
        return html`
            <div part="layer media-layer">
                <slot name="media"></slot>
            </div>
            <div part="layer poster-layer">
                <slot name="poster"></slot>
            </div>
            <div part="layer vertical-layer">
                <div part="top chrome">
                    <slot name="top-chrome"></slot>
                </div>
                <div part="middle chrome">
                    <slot name="middle-chrome"></slot>
                </div>
                <div part="layer centered-layer center centered chrome">
                    <slot name="centered-chrome"></slot>
                </div>
                <div part="bottom chrome">
                    <slot><!-- default, effectively "bottom-chrome" --></slot>
                </div>
            </div>
        `;
    }
}

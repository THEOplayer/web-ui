import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import elementCss from './THEOplayerUI.css';

@customElement('theoplayer-ui')
export class THEOplayerUI extends LitElement {
    constructor() {
        super();
    }

    static styles = elementCss;

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

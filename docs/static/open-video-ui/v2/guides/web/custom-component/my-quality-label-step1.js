import { css, html, LitElement } from 'lit';

// This style will be applied to every <my-quality-label>.
const myQualityLabelStyle = css`
    /* This rule targets the element itself, i.e. <my-quality-label> */
    :host {
        /* Use the same text and background color as the rest of the UI controls */
        color: var(--theoplayer-text-color, #fff);
        background: var(--theoplayer-control-background, transparent);

        /* Add some padding */
        padding: var(--theoplayer-control-padding, 10px);
    }
`;

// Define a new class for our custom element.
export class MyQualityLabel extends LitElement {
    static styles = [myQualityLabelStyle];

    render() {
        // Show something (for testing)
        return html`1080p`;
    }
}

// Define our class as the constructor for our custom element.
// This allows us to use <my-quality-label> anywhere in our HTML.
customElements.define('my-quality-label', MyQualityLabel);

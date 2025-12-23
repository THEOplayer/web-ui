// This <template> contains the content of our custom label.
// Its contents will be cloned into every <my-quality-label>.
const template = document.createElement('template');
template.innerHTML = `
<style>
/* This rule targets the element itself, i.e. <my-quality-label> */
:host {
    /* Use the same text and background color as the rest of the UI controls */
    color: var(--theoplayer-text-color, #fff);
    background: var(--theoplayer-control-background, transparent);
    
    /* Add some padding */
    padding: var(--theoplayer-control-padding, 10px);
}
</style>
<span></span>
`;

// Define a new class for our custom element.
export class MyQualityLabel extends HTMLElement {
    constructor() {
        super();

        // Create a shadow root, and clone our template into it
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        // Show something (for testing)
        this._labelSpan = shadowRoot.querySelector('span');
        this._labelSpan.textContent = '1080p';
    }
}

// Define our class as the constructor for our custom element.
// This allows us to use <my-quality-label> anywhere in our HTML.
customElements.define('my-quality-label', MyQualityLabel);

import { Button } from '@theoplayer/web-ui';
import { html } from 'lit';

// Define a new class for our custom element.
// We extend the `Button` class from Open Video UI for Web,
// so we can inherit some logic and styles.
export class MyPlayButton extends Button {
    // This method is called whenever the button is (re-)rendered.
    // See: https://lit.dev/docs/components/rendering/
    render() {
        return html`Play`;
    }

    // This method is called whenever the button gets clicked.
    handleClick() {
        alert('My play button was clicked!');
    }
}

// Define our class as the constructor for our custom element.
// This allows us to use <my-play-button> anywhere in our HTML.
// If you're using TypeScript, you can also use
// Lit's @customElement decorator on the MyPlayButton class.
// See: https://lit.dev/docs/components/defining/
customElements.define('my-play-button', MyPlayButton);

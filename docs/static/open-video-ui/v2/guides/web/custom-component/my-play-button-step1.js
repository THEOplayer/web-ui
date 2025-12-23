import { Button, buttonTemplate } from '@theoplayer/web-ui';

// This <template> contains the content of our custom button.
// Its contents will be cloned into every <my-play-button>.
const template = document.createElement('template');
template.innerHTML = buttonTemplate('Play');

// Define a new class for our custom element.
// We extend the `Button` class from Open Video UI for Web,
// so we can inherit some logic and styles.
export class MyPlayButton extends Button {
    constructor() {
        // Pass our custom template to the super constructor.
        super({ template });
    }

    // This method is called whenever the button gets clicked.
    handleClick() {
        alert('My play button was clicked!');
    }
}

// Define our class as the constructor for our custom element.
// This allows us to use <my-play-button> anywhere in our HTML.
customElements.define('my-play-button', MyPlayButton);

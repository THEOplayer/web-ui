import * as shadyCss from '@webcomponents/shadycss';
import { Button, buttonTemplate } from './Button';
import fullscreenButtonCss from './FullscreenButton.css';
import enterIcon from '../icons/fullscreen-enter.svg';
import exitIcon from '../icons/fullscreen-exit.svg';
import { StateReceiverMixin } from './StateReceiverMixin';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(
    `<span part="enter-icon"><slot name="enter-icon">${enterIcon}</slot></span>` +
        `<span part="exit-icon"><slot name="exit-icon">${exitIcon}</slot></span>`,
    fullscreenButtonCss
);
shadyCss.prepareTemplate(template, 'theoplayer-fullscreen-button');

const ATTR_FULLSCREEN = 'fullscreen';

export class FullscreenButton extends StateReceiverMixin(Button, ['fullscreen']) {
    static get observedAttributes() {
        return [...Button.observedAttributes, ATTR_FULLSCREEN];
    }

    constructor() {
        super({ template });
    }

    connectedCallback(): void {
        super.connectedCallback();
        this._upgradeProperty('fullscreen');
    }

    get fullscreen(): boolean {
        return this.hasAttribute(ATTR_FULLSCREEN);
    }

    set fullscreen(fullscreen: boolean) {
        if (fullscreen) {
            this.setAttribute(ATTR_FULLSCREEN, '');
        } else {
            this.removeAttribute(ATTR_FULLSCREEN);
        }
    }

    attachFullscreen(fullscreen: boolean): void {
        this.fullscreen = fullscreen;
    }

    protected override handleClick(): void {
        // TODO
        this.fullscreen = !this.fullscreen;
    }
}

customElements.define('theoplayer-fullscreen-button', FullscreenButton);

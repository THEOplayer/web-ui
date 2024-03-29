import * as shadyCss from '@webcomponents/shadycss';
import { Button, buttonTemplate } from './Button';
import fullscreenButtonCss from './FullscreenButton.css';
import enterIcon from '../icons/fullscreen-enter.svg';
import exitIcon from '../icons/fullscreen-exit.svg';
import { StateReceiverMixin } from './StateReceiverMixin';
import { createCustomEvent } from '../util/EventUtils';
import { ENTER_FULLSCREEN_EVENT, type EnterFullscreenEvent } from '../events/EnterFullscreenEvent';
import { EXIT_FULLSCREEN_EVENT, type ExitFullscreenEvent } from '../events/ExitFullscreenEvent';
import { Attribute } from '../util/Attribute';
import { toggleAttribute } from '../util/CommonUtils';
import { createTemplate } from '../util/TemplateUtils';

const template = createTemplate(
    'theoplayer-fullscreen-button',
    buttonTemplate(
        `<span part="enter-icon"><slot name="enter-icon">${enterIcon}</slot></span>` +
            `<span part="exit-icon"><slot name="exit-icon">${exitIcon}</slot></span>`,
        fullscreenButtonCss
    )
);

/**
 * `<theoplayer-fullscreen-button>` - A button that toggles fullscreen.
 *
 * @group Components
 */
export class FullscreenButton extends StateReceiverMixin(Button, ['fullscreen']) {
    static get observedAttributes() {
        return [...Button.observedAttributes, Attribute.FULLSCREEN];
    }

    constructor() {
        super({ template: template() });
        this._upgradeProperty('fullscreen');
    }

    override connectedCallback() {
        super.connectedCallback();
        this._updateAriaLabel();
    }

    get fullscreen(): boolean {
        return this.hasAttribute(Attribute.FULLSCREEN);
    }

    set fullscreen(fullscreen: boolean) {
        toggleAttribute(this, Attribute.FULLSCREEN, fullscreen);
    }

    protected override handleClick(): void {
        if (!this.fullscreen) {
            const event: EnterFullscreenEvent = createCustomEvent(ENTER_FULLSCREEN_EVENT, {
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        } else {
            const event: ExitFullscreenEvent = createCustomEvent(EXIT_FULLSCREEN_EVENT, {
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        }
    }

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (FullscreenButton.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
            this._updateAriaLabel();
        }
    }

    private _updateAriaLabel(): void {
        const label = this.fullscreen ? 'exit fullscreen' : 'enter fullscreen';
        this.setAttribute(Attribute.ARIA_LABEL, label);
    }
}

customElements.define('theoplayer-fullscreen-button', FullscreenButton);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-fullscreen-button': FullscreenButton;
    }
}

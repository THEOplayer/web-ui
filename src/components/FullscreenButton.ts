import { html, type HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { Button } from './Button';
import fullscreenButtonCss from './FullscreenButton.css';
import enterIcon from '../icons/fullscreen-enter.svg';
import exitIcon from '../icons/fullscreen-exit.svg';
import { stateReceiver } from './StateReceiverMixin';
import { createCustomEvent } from '../util/EventUtils';
import { ENTER_FULLSCREEN_EVENT, type EnterFullscreenEvent } from '../events/EnterFullscreenEvent';
import { EXIT_FULLSCREEN_EVENT, type ExitFullscreenEvent } from '../events/ExitFullscreenEvent';
import { Attribute } from '../util/Attribute';

/**
 * A button that toggles fullscreen.
 *
 * @group Components
 */
@customElement('theoplayer-fullscreen-button')
@stateReceiver(['fullscreen'])
export class FullscreenButton extends Button {
    static styles = [...Button.styles, fullscreenButtonCss];

    override connectedCallback() {
        super.connectedCallback();
        this._updateAriaLabel();
    }

    @property({ reflect: true, type: Boolean, attribute: Attribute.FULLSCREEN })
    accessor fullscreen: boolean = false;

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
            this._updateAriaLabel();
        }
    }

    private _updateAriaLabel(): void {
        const label = this.fullscreen ? 'exit fullscreen' : 'enter fullscreen';
        this.setAttribute(Attribute.ARIA_LABEL, label);
    }

    protected override render(): HTMLTemplateResult {
        return html`<span part="enter-icon"><slot name="enter-icon">${unsafeSVG(enterIcon)}</slot></span>
            <span part="exit-icon"><slot name="exit-icon">${unsafeSVG(exitIcon)}</slot></span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-fullscreen-button': FullscreenButton;
    }
}

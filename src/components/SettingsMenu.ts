import { Menu, menuTemplate } from './Menu';
import * as shadyCss from '@webcomponents/shadycss';
import settingsMenuHtml from './SettingsMenu.html';
import settingsMenuCss from './SettingsMenu.css';
import { Attribute } from '../util/Attribute';
import type { ActiveQualityMenuButton } from './ActiveQualityMenuButton';
import type { PlaybackRateMenuButton } from './PlaybackRateMenuButton';
import './ActiveQualityMenuButton';
import './PlaybackRateMenuButton';

const template = document.createElement('template');
template.innerHTML = menuTemplate(`<slot name="heading">Settings</slot>`, settingsMenuHtml, settingsMenuCss);
shadyCss.prepareTemplate(template, 'theoplayer-settings-menu');

export class SettingsMenu extends Menu {
    static get observedAttributes() {
        return [...Menu.observedAttributes, Attribute.QUALITY_MENU, Attribute.PLAYBACK_RATE_MENU];
    }

    private readonly _qualityMenuButton: ActiveQualityMenuButton;
    private readonly _playbackRateMenuButton: PlaybackRateMenuButton;

    constructor() {
        super({ template });
        this._qualityMenuButton = this.shadowRoot!.querySelector('theoplayer-active-quality-menu-button')!;
        this._playbackRateMenuButton = this.shadowRoot!.querySelector('theoplayer-playback-rate-menu-button')!;
    }

    attributeChangedCallback(attrName: string, oldValue: any, newValue: any): void {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (newValue === oldValue) {
            return;
        }
        if (attrName === Attribute.QUALITY_MENU) {
            this._qualityMenuButton.setAttribute(Attribute.MENU, newValue);
        } else if (attrName === Attribute.PLAYBACK_RATE_MENU) {
            this._playbackRateMenuButton.setAttribute(Attribute.MENU, newValue);
        }
        if (SettingsMenu.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }
}

customElements.define('theoplayer-settings-menu', SettingsMenu);

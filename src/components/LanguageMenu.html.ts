import { html } from 'lit-html';
import { msg } from '../util/Localization';

export default html`
    <theoplayer-menu>
        <span class="theoplayer-menu-heading" slot="heading"><slot name="heading">${msg('Language')}</slot></span>
        <theoplayer-settings-menu-button
            class="theoplayer-menu-heading-button"
            menu="subtitle-options-menu"
            slot="heading"
        ></theoplayer-settings-menu-button>
        <div part="content">
            <div part="audio">
                <h2>${msg('Audio')}</h2>
                <theoplayer-track-radio-group track-type="audio"></theoplayer-track-radio-group>
            </div>
            <div part="subtitles">
                <h2>${msg('Subtitles')}</h2>
                <theoplayer-track-radio-group track-type="subtitles" show-off></theoplayer-track-radio-group>
            </div>
        </div>
    </theoplayer-menu>
    <theoplayer-text-track-style-menu id="subtitle-options-menu"></theoplayer-text-track-style-menu>
`;

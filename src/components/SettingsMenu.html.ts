import { html } from 'lit-html';

export default html`
<theoplayer-menu>
    <span slot="heading"><slot name="heading">Settings</slot></span>
    <div class="theoplayer-menu-table">
        <span>Quality</span>
        <theoplayer-menu-button menu="quality-menu">
            <theoplayer-active-quality-display></theoplayer-active-quality-display>
        </theoplayer-menu-button>
        <span>Playback speed</span>
        <theoplayer-menu-button menu="playback-rate-menu">
            <theoplayer-playback-rate-display></theoplayer-playback-rate-display>
        </theoplayer-menu-button>
    </div>
</theoplayer-menu>
<theoplayer-menu id="quality-menu" menu-close-on-input hidden>
    <span slot="heading">Quality</span>
    <theoplayer-quality-radio-group></theoplayer-quality-radio-group>
</theoplayer-menu>
<theoplayer-playback-rate-menu id="playback-rate-menu" menu-close-on-input hidden>
    <span slot="heading">Playback speed</span>
</theoplayer-playback-rate-menu>
`;

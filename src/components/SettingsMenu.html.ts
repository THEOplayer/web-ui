import { html } from 'lit-html';

export default html`
<theoplayer-menu>
    <span slot="heading"><slot name="heading">Settings</slot></span>
    <table class="theoplayer-menu-table">
        <tr>
            <td><span>Quality</span></td>
            <td>
                <theoplayer-menu-button menu="quality-menu">
                    <theoplayer-active-quality-display></theoplayer-active-quality-display>
                </theoplayer-menu-button>
            </td>
        </tr>
        <tr>
            <td><span>Playback speed</span></td>
            <td>
                <theoplayer-menu-button menu="playback-rate-menu">
                    <theoplayer-playback-rate-display></theoplayer-playback-rate-display>
                </theoplayer-menu-button>
            </td>
        </tr>
    </table>
</theoplayer-menu>
<theoplayer-menu id="quality-menu" menu-close-on-input hidden>
    <span slot="heading">Quality</span>
    <theoplayer-quality-radio-group></theoplayer-quality-radio-group>
</theoplayer-menu>
<theoplayer-playback-rate-menu id="playback-rate-menu" menu-close-on-input hidden>
    <span slot="heading">Playback speed</span>
</theoplayer-playback-rate-menu>
`;

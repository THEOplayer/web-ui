import { html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MenuGroup } from './MenuGroup';
import * as shadyCss from '@webcomponents/shadycss';
import languageMenuCss from './LanguageMenu.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer, MediaTrack, MediaTrackList, TextTrack, TextTracksList } from 'theoplayer/chromeless';
import { isNonForcedSubtitleTrack } from '../util/TrackUtils';
import { Attribute } from '../util/Attribute';
import { toggleAttribute } from '../util/CommonUtils';

// Load components used in template
import './TrackRadioGroup';
import './TextTrackStyleMenu';

const TRACK_EVENTS = ['addtrack', 'removetrack'] as const;

/**
 * `<theoplayer-language-menu>` - A menu to change the spoken language and subtitles of the stream.
 *
 * @slot `heading` - A slot for the menu's heading.
 *
 * @group Components
 */
@customElement('theoplayer-language-menu')
export class LanguageMenu extends StateReceiverMixin(MenuGroup, ['player']) {
    private _player: ChromelessPlayer | undefined;
    private _audioTrackList: MediaTrackList | undefined;
    private _textTrackList: TextTracksList | undefined;

    static get observedAttributes() {
        return [...MenuGroup.observedAttributes, Attribute.HAS_AUDIO, Attribute.HAS_SUBTITLES];
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ state: true })
    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        this._audioTrackList?.removeEventListener(TRACK_EVENTS, this._updateAudioTracks);
        this._textTrackList?.removeEventListener(TRACK_EVENTS, this._updateTextTracks);
        this._player = player;
        this._audioTrackList = player?.audioTracks;
        this._textTrackList = player?.textTracks;
        this._updateAudioTracks();
        this._updateTextTracks();
        this._audioTrackList?.addEventListener(TRACK_EVENTS, this._updateAudioTracks);
        this._textTrackList?.addEventListener(TRACK_EVENTS, this._updateTextTracks);
    }

    private readonly _updateAudioTracks = (): void => {
        const newAudioTracks: readonly MediaTrack[] = this._player?.audioTracks ?? [];
        // Hide audio track selection if there's only one track.
        toggleAttribute(this, Attribute.HAS_AUDIO, newAudioTracks.length > 1);
    };

    private readonly _updateTextTracks = (): void => {
        const newSubtitleTracks: readonly TextTrack[] = this._player?.textTracks.filter(isNonForcedSubtitleTrack) ?? [];
        // Hide subtitle track selection if there are no tracks. If there's one, we still show an "off" option.
        toggleAttribute(this, Attribute.HAS_SUBTITLES, newSubtitleTracks.length > 0);
    };

    override attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
        super.attributeChangedCallback(attrName, oldValue, newValue);
        if (LanguageMenu.observedAttributes.indexOf(attrName as Attribute) >= 0) {
            shadyCss.styleSubtree(this);
        }
    }

    protected override render(): TemplateResult {
        return super.renderMenuGroup(
            html`
                <theoplayer-menu>
                    <span class="theoplayer-menu-heading" slot="heading"><slot name="heading">Language</slot></span>
                    <theoplayer-settings-menu-button
                        class="theoplayer-menu-heading-button"
                        menu="subtitle-options-menu"
                        slot="heading"
                    ></theoplayer-settings-menu-button>
                    <div part="content">
                        <div part="audio">
                            <h2>Audio</h2>
                            <theoplayer-track-radio-group track-type="audio"></theoplayer-track-radio-group>
                        </div>
                        <div part="subtitles">
                            <h2>Subtitles</h2>
                            <theoplayer-track-radio-group track-type="subtitles" show-off></theoplayer-track-radio-group>
                        </div>
                    </div>
                </theoplayer-menu>
                <theoplayer-text-track-style-menu id="subtitle-options-menu"></theoplayer-text-track-style-menu>
            `,
            languageMenuCss
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-language-menu': LanguageMenu;
    }
}

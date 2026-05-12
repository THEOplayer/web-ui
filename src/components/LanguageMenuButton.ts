import { html, type HTMLTemplateResult, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { MenuButton } from './MenuButton';
import languageIcon from '../icons/language.svg';
import { stateReceiver } from './StateReceiverMixin';
import type { ChromelessPlayer, MediaTrackList, TextTracksList } from 'theoplayer/chromeless';
import { isNonForcedSubtitleTrack } from '../util/TrackUtils';
import { Attribute } from '../util/Attribute';
import { toggleAttribute } from '../util/CommonUtils';
import { getLocale } from '../i18n';

const TRACK_EVENTS = ['addtrack', 'removetrack'] as const;

/**
 * A menu button that opens a {@link LanguageMenu}.
 *
 * When there are no alternative audio languages or subtitles, this button automatically hides itself.
 */
@customElement('theoplayer-language-menu-button')
@stateReceiver(['player'])
export class LanguageMenuButton extends MenuButton {
    private _player: ChromelessPlayer | undefined;
    private _audioTrackList: MediaTrackList | undefined;
    private _textTrackList: TextTracksList | undefined;

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        this._audioTrackList?.removeEventListener(TRACK_EVENTS, this._updateTracks);
        this._textTrackList?.removeEventListener(TRACK_EVENTS, this._updateTracks);
        this._player = player;
        this._audioTrackList = player?.audioTracks;
        this._textTrackList = player?.textTracks;
        this._updateTracks();
        this._audioTrackList?.addEventListener(TRACK_EVENTS, this._updateTracks);
        this._textTrackList?.addEventListener(TRACK_EVENTS, this._updateTracks);
    }

    private readonly _updateTracks = (): void => {
        const hasTracks =
            this._player !== undefined && (this._player.audioTracks.length >= 2 || this._player.textTracks.some(isNonForcedSubtitleTrack));
        toggleAttribute(this, Attribute.HIDDEN, !hasTracks);
    };

    override willUpdate(changedProperties: PropertyValues) {
        super.willUpdate(changedProperties);
        this._updateAriaLabel();
    }

    private _updateAriaLabel(): void {
        const locale = getLocale(this.lang);
        this.ariaLabel = locale.openLanguageMenuAria;
    }

    protected override render(): HTMLTemplateResult {
        return html`<span part="icon"><slot>${unsafeSVG(languageIcon)}</slot></span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-language-menu-button': LanguageMenuButton;
    }
}

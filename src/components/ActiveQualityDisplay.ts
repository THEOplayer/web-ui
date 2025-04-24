import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { stateReceiver } from './StateReceiverMixin';
import type { VideoQuality } from 'theoplayer/chromeless';
import { formatQualityLabel } from '../util/TrackUtils';

/**
 * `<theoplayer-active-quality-display>` - A control that displays the name of the active video quality.
 *
 * @group Components
 */
@customElement('theoplayer-active-quality-display')
@stateReceiver(['activeVideoQuality', 'targetVideoQualities'])
export class ActiveQualityDisplay extends LitElement {
    private _activeVideoQuality: VideoQuality | undefined = undefined;
    private _targetVideoQualities: VideoQuality[] | undefined = undefined;

    @property({ reflect: false, attribute: false })
    accessor activeVideoQuality: VideoQuality | undefined = undefined;

    @property({ reflect: false, attribute: false })
    accessor targetVideoQualities: VideoQuality[] | undefined = undefined;

    protected override render(): HTMLTemplateResult {
        // If no target quality is selected, or more than one target quality is selected,
        // treat as "automatic" quality selection.
        const hasSingleTargetQuality = this._targetVideoQualities !== undefined && this._targetVideoQualities.length === 1;
        const targetQuality = hasSingleTargetQuality ? this._targetVideoQualities![0] : undefined;
        // Always show the target quality immediately, even if it's not the active quality yet.
        const selectedQuality = targetQuality ?? this._activeVideoQuality;
        const qualityLabel = formatQualityLabel(selectedQuality);
        let label: string;
        if (hasSingleTargetQuality) {
            // Manual quality selection: "720p" or "Unknown"
            label = qualityLabel ?? `Unknown`;
        } else {
            // Automatic quality selection: "Automatic" or "Automatic (720p)"
            label = `Automatic${qualityLabel ? ` (${qualityLabel})` : ''}`;
        }
        return html`<span>${label}</span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-active-quality-display': ActiveQualityDisplay;
    }
}

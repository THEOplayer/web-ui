import { StateReceiverMixin } from './StateReceiverMixin';
import { setTextContent } from '../util/CommonUtils';
import type { VideoQuality } from 'theoplayer/chromeless';
import { formatQualityLabel } from '../util/TrackUtils';
import * as shadyCss from '@webcomponents/shadycss';

/**
 * `<theoplayer-active-quality-display>` - A control that displays the name of the active video quality.
 *
 * @group Components
 */
export class ActiveQualityDisplay extends StateReceiverMixin(HTMLElement, ['activeVideoQuality', 'targetVideoQualities']) {
    private readonly _spanEl: HTMLSpanElement;
    private _activeVideoQuality: VideoQuality | undefined = undefined;
    private _targetVideoQualities: VideoQuality[] | undefined = undefined;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        this._spanEl = document.createElement('span');
        shadowRoot.appendChild(this._spanEl);

        this._upgradeProperty('activeVideoQuality');
        this._upgradeProperty('targetVideoQualities');
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    get activeVideoQuality(): VideoQuality | undefined {
        return this._activeVideoQuality;
    }

    set activeVideoQuality(quality: VideoQuality | undefined) {
        this._activeVideoQuality = quality;
        this.update_();
    }

    get targetVideoQualities(): VideoQuality[] | undefined {
        return this._targetVideoQualities;
    }

    set targetVideoQualities(qualities: VideoQuality[] | undefined) {
        this._targetVideoQualities = qualities;
        this.update_();
    }

    private update_(): void {
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
        setTextContent(this._spanEl, label);
    }
}

customElements.define('theoplayer-active-quality-display', ActiveQualityDisplay);

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-active-quality-display': ActiveQualityDisplay;
    }
}

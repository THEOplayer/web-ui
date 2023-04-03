import * as shadyCss from '@webcomponents/shadycss';
import { buttonTemplate } from './Button';
import { MenuButton } from './MenuButton';
import { StateReceiverMixin } from './StateReceiverMixin';
import { setTextContent } from '../util/CommonUtils';
import type { VideoQuality } from 'theoplayer';
import { formatQualityLabel } from '../util/TrackUtils';

const template = document.createElement('template');
template.innerHTML = buttonTemplate(`<slot>Automatic</slot>`);
shadyCss.prepareTemplate(template, 'theoplayer-active-quality-menu-button');

/**
 * @group Components
 */
export class ActiveQualityMenuButton extends StateReceiverMixin(MenuButton, ['activeVideoQuality', 'targetVideoQualities']) {
    private readonly _slotEl: HTMLSlotElement;
    private _activeVideoQuality: VideoQuality | undefined = undefined;
    private _targetVideoQualities: VideoQuality[] | undefined = undefined;

    constructor() {
        super({ template });
        this._slotEl = this.shadowRoot!.querySelector('slot')!;
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
        setTextContent(this._slotEl, label);
    }
}

customElements.define('theoplayer-active-quality-menu-button', ActiveQualityMenuButton);

export const PREVIEW_ACTIVE_CHANGE_EVENT = 'theoplayerpreviewactivechange' as const;

export interface PreviewActiveChangeEvent extends CustomEvent<PreviewActiveChangeEventDetail> {
    type: typeof PREVIEW_ACTIVE_CHANGE_EVENT;
}

export interface PreviewActiveChangeEventDetail {
    previewActive: boolean;
}

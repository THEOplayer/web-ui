export const PREVIEW_TIME_CHANGE_EVENT = 'theoplayerpreviewtimechange' as const;

export interface PreviewTimeChangeEvent extends CustomEvent<PreviewTimeChangeEventDetail> {
    type: typeof PREVIEW_TIME_CHANGE_EVENT;
}

export interface PreviewTimeChangeEventDetail {
    previewTime: number;
}

import type { StreamType } from '../util/StreamType';

export const STREAM_TYPE_CHANGE_EVENT = 'theoplayerstreamtypechange' as const;

export interface StreamTypeChangeEvent extends CustomEvent<StreamTypeChangeEventDetail> {
    type: typeof STREAM_TYPE_CHANGE_EVENT;
}

export interface StreamTypeChangeEventDetail {
    streamType: StreamType;
}

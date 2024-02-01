export const READY_EVENT = 'theoplayerready' as const;

export interface ReadyEvent extends CustomEvent<undefined> {
    type: typeof READY_EVENT;
}

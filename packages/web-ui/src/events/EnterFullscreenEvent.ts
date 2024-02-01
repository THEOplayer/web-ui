export const ENTER_FULLSCREEN_EVENT = 'theoplayerfullscreenenter' as const;

export interface EnterFullscreenEvent extends CustomEvent {
    type: typeof ENTER_FULLSCREEN_EVENT;
}

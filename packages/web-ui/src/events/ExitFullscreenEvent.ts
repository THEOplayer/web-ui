export const EXIT_FULLSCREEN_EVENT = 'theoplayerfullscreenexit' as const;

export interface ExitFullscreenEvent extends CustomEvent {
    type: typeof EXIT_FULLSCREEN_EVENT;
}

export const USER_IDLE_CHANGE_EVENT = 'theoplayeruseridlechange' as const;

export interface UserIdleChangeEvent extends CustomEvent {
    type: typeof USER_IDLE_CHANGE_EVENT;
}

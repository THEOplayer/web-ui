export const MENU_CHANGE_EVENT = 'theoplayermenuchange' as const;

export interface MenuChangeEvent extends CustomEvent {
    type: typeof MENU_CHANGE_EVENT;
}

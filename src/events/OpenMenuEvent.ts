export const OPEN_MENU_EVENT = 'theoplayermenuopen' as const;

export interface OpenMenuEvent extends CustomEvent<OpenMenuEventDetail> {
    type: typeof OPEN_MENU_EVENT;
}

export interface OpenMenuEventDetail {
    menu: string;
}

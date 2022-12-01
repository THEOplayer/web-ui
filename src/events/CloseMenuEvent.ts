export const CLOSE_MENU_EVENT = 'theoplayermenuclose' as const;

export interface CloseMenuEvent extends CustomEvent<OpenMenuEventDetail> {
    type: typeof CLOSE_MENU_EVENT;
}

export interface OpenMenuEventDetail {
    menu: string;
}

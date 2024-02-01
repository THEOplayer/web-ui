export const TOGGLE_MENU_EVENT = 'theoplayermenutoggle' as const;

export interface ToggleMenuEvent extends CustomEvent<OpenMenuEventDetail> {
    type: typeof TOGGLE_MENU_EVENT;
}

export interface OpenMenuEventDetail {
    menu: string;
}

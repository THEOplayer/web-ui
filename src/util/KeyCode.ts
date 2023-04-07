export enum KeyCode {
    ENTER = 13,
    ESCAPE = 27,
    SPACE = 32,
    END = 35,
    HOME = 36,
    LEFT = 37,
    UP = 38,
    RIGHT = 39,
    DOWN = 40
}

export type ArrowKeyCode = KeyCode.LEFT | KeyCode.UP | KeyCode.RIGHT | KeyCode.DOWN;

export function isArrowKey(keyCode: number): keyCode is ArrowKeyCode {
    return KeyCode.LEFT <= keyCode && keyCode <= KeyCode.DOWN;
}

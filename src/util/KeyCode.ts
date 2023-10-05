export enum KeyCode {
    ENTER = 13,
    ESCAPE = 27,
    SPACE = 32,
    END = 35,
    HOME = 36,
    LEFT = 37,
    UP = 38,
    RIGHT = 39,
    DOWN = 40,
    BACK_TIZEN = 10009
}

export type ArrowKeyCode = KeyCode.LEFT | KeyCode.UP | KeyCode.RIGHT | KeyCode.DOWN;
export type BackKeyCode = KeyCode.BACK_TIZEN | KeyCode.ESCAPE;

export function isArrowKey(keyCode: number): keyCode is ArrowKeyCode {
    return KeyCode.LEFT <= keyCode && keyCode <= KeyCode.DOWN;
}

export function isBackKey(keyCode: number): keyCode is BackKeyCode {
    return keyCode === KeyCode.BACK_TIZEN || keyCode === KeyCode.ESCAPE;
}

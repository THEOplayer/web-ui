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
    // Multiple back key configurations depending on the platform
    // https://suite.st/docs/faq/tv-specific-keys-in-browser/
    BACK_SAMSUNG = 88,
    BACK_WEBOS = 461,
    BACK_TIZEN = 10009
}

export type ArrowKeyCode = KeyCode.LEFT | KeyCode.UP | KeyCode.RIGHT | KeyCode.DOWN;
export type BackKeyCode = KeyCode.BACK_TIZEN | KeyCode.ESCAPE | KeyCode.BACK_SAMSUNG | KeyCode.BACK_WEBOS;
export type ActivationKeyCode = KeyCode.ENTER | KeyCode.SPACE;

export function isArrowKey(keyCode: number): keyCode is ArrowKeyCode {
    return KeyCode.LEFT <= keyCode && keyCode <= KeyCode.DOWN;
}

export function isBackKey(keyCode: number): keyCode is BackKeyCode {
    return keyCode === KeyCode.BACK_TIZEN || keyCode === KeyCode.ESCAPE || keyCode === KeyCode.BACK_SAMSUNG || keyCode === KeyCode.BACK_WEBOS;
}

export function isActivationKey(keyCode: number): keyCode is ActivationKeyCode {
    return keyCode === KeyCode.ENTER || keyCode === KeyCode.SPACE;
}

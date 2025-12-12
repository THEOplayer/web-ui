/**
 * The delay before we should start handling clicks
 * after the user becomes active again (in milliseconds).
 *
 * When the user is idle and then touches the player, that first touch
 * should not trigger any accidental clicks on UI controls. Therefore,
 * we will keep all UI controls inactive for a little bit longer
 * after that first touch, until this delay has passed.
 */
export const ACCIDENTAL_CLICK_DELAY = 50;

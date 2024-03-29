import { createContext } from 'react';
import type { ChromelessPlayer } from 'theoplayer/chromeless';

/**
 * The {@link theoplayer!ChromelessPlayer | ChromelessPlayer} instance of the parent {@link DefaultUI} or {@link UIContainer}.
 *
 * This can be used to access the backing player's state and add event listeners from within a custom React component.
 * The component *must* be a child of {@link DefaultUI} or {@link UIContainer} in order to receive the context.
 * ```jsx
 * import { useCallback, useContext, useSyncExternalStore } from 'react';
 * import { PlayerContext } from '@theoplayer/react-ui';
 *
 * const MyCustomComponent = () => {
 *     // Retrieve the backing player from the context
 *     const player = useContext(PlayerContext);
 *
 *     // Track the paused state of the player
 *     const subscribe = useCallback(
 *         (callback) => {
 *             player?.addEventListener(['play', 'pause'], callback);
 *             return () => {
 *                 player?.removeEventListener(['play', 'pause'], callback);
 *             };
 *         },
 *         [player]
 *     );
 *     const paused = useSyncExternalStore(
 *         subscribe,
 *         () => player?.paused ?? true,
 *         () => true
 *     );
 *
 *     // Alternatively, you can use the built-in hook:
 *     // import { usePaused } from '@theoplayer/react-ui';
 *     // const paused = usePaused();
 *
 *     // Show the paused state in your UI
 *     return <p>Player is {paused ? "paused" : "playing"}</p>
 * };
 * ```
 */
export const PlayerContext = createContext<ChromelessPlayer | undefined>(undefined);

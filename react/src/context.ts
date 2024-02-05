import { createContext } from 'react';
import type { ChromelessPlayer } from 'theoplayer/chromeless';

/**
 * The {@link theoplayer!ChromelessPlayer | ChromelessPlayer} instance of the parent {@link DefaultUI} or {@link UIContainer}.
 */
export const PlayerContext = createContext<ChromelessPlayer | undefined>(undefined);

/**
 * World seed management
 * doc 05, section 2
 */

import type { WorldSeed } from '$lib/types/world.js';
import { createPrng } from '$lib/engine/prng.js';

export function createWorldSeed(raw: string): WorldSeed {
	return {
		raw,
		prng: createPrng(raw)
	};
}

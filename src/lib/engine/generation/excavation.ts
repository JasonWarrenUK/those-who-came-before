/**
 * Excavation composition + ambiguity management
 * doc 05, section 11
 *
 * Phase 7 implementation target.
 */

import type { ExcavationBatch } from '$lib/types/excavation.js';
import type { WorldState } from '$lib/types/world.js';

export function composeExcavation(
	_worldState: WorldState,
	_prng: () => number
): ExcavationBatch {
	throw new Error('Not implemented — Phase 7');
}

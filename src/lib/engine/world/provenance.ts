/**
 * Site/context generation
 * doc 05, section 3.5
 *
 * Phase 7 implementation target.
 */

import type { Provenance, Culture, CulturePhase } from '$lib/types/world.js';

export function generateProvenance(
	_culture: Culture,
	_phase: CulturePhase,
	_prng: () => number
): Provenance {
	throw new Error('Not implemented — Phase 7');
}

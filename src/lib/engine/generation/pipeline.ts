/**
 * Orchestrates the 9-stage generation pipeline
 * doc 05, section 1
 *
 * Phase 9 implementation target.
 */

import type { ClassifiedArtefact } from '$lib/types/artefact.js';
import type { WorldState } from '$lib/types/world.js';

export function runGenerationPipeline(
	_worldState: WorldState,
	_prng: () => number
): ClassifiedArtefact {
	throw new Error('Not implemented — Phase 9');
}

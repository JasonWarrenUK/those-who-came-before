/**
 * Contradiction detection: compares InterpretiveModel against occluded world properties
 * doc 06, section 4.3
 *
 * Phase 17 implementation target.
 */

import type { ClassifiedArtefact } from '$lib/types/artefact.js';
import type { InterpretiveModel } from '$lib/types/interpretation.js';
import type { WorldState } from '$lib/types/world.js';
import type { Contradiction } from '$lib/types/contradiction.js';

export function detectContradictions(
	_artefact: ClassifiedArtefact,
	_model: InterpretiveModel,
	_worldState: WorldState
): Contradiction[] {
	throw new Error('Not implemented — Phase 17');
}

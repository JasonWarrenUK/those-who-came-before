/**
 * Decorative grammar (post-material, layered)
 * doc 05, section 8
 *
 * Phase 6 implementation target.
 */

import type { NormalisedArtefact, MaterialAssignment } from '$lib/types/artefact.js';
import type { DecorativeLayer } from '$lib/types/decoration.js';
import type { CulturalProfile, PhaseCharacteristics } from '$lib/types/world.js';

export function applyDecoration(
	_artefact: NormalisedArtefact,
	_materials: MaterialAssignment[],
	_culture: CulturalProfile,
	_phase: PhaseCharacteristics,
	_prng: () => number
): DecorativeLayer[] {
	throw new Error('Not implemented — Phase 6');
}

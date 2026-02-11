/**
 * Material assignment with geological scarcity + culture bias
 * doc 05, section 7
 *
 * Phase 5 implementation target.
 */

import type { NormalisedComponent, MaterialDefinition, MaterialAssignment } from '$lib/types/artefact.js';
import type { CulturalProfile, PhaseCharacteristics, GeologicalContext, MaterialFlow } from '$lib/types/world.js';

export function assignMaterial(
	_component: NormalisedComponent,
	_culture: CulturalProfile,
	_phase: PhaseCharacteristics,
	_geology: GeologicalContext,
	_tradeRelationships: MaterialFlow[],
	_materials: MaterialDefinition[],
	_prng: () => number
): MaterialAssignment {
	throw new Error('Not implemented — Phase 5');
}

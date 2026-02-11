/**
 * Bottom-up component grammar (geometric primitives)
 * doc 05, section 5
 *
 * Phase 2 implementation target.
 */

import type { CulturalProfile, PhaseCharacteristics } from '$lib/types/world.js';
import type { NormalisedArtefact } from '$lib/types/artefact.js';
import type { GrammarRule } from '$lib/types/grammar.js';

export function expandGrammar(
	_rules: GrammarRule[],
	_culture: CulturalProfile,
	_phase: PhaseCharacteristics,
	_prng: () => number
): NormalisedArtefact {
	throw new Error('Not implemented — Phase 2');
}

/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { MANNER_VALUES } from '../../types/language.ts';
import { PHONES_BY_ID } from './phones.ts';
import {
	MAX_CONSONANT_RUN,
	MINIMAL_VOWEL_SYSTEM,
	ONSET_CLUSTER_MANNERS,
	PHONEME_PREREQUISITES,
	UNIVERSAL_CORE,
} from './coherence.ts';

Deno.test('prerequisites: every id named exists in the phone table', () => {
	const unknown: string[] = [];

	for (const [id, prerequisites] of PHONEME_PREREQUISITES) {
		if (!PHONES_BY_ID.has(id)) {
			unknown.push(`key ${id}`);
		}
		for (const prerequisite of prerequisites) {
			if (!PHONES_BY_ID.has(prerequisite)) {
				unknown.push(`${id} -> ${prerequisite}`);
			}
		}
	}

	assertEquals(unknown, []);
});

/**
 * `enforceCoherence` iterates to a fixed point, so a cycle would either fail to terminate or settle
 * on an inventory satisfying neither direction. Acyclicity is what makes the fixed point reachable,
 * and nothing at runtime would report its absence.
 */
Deno.test('prerequisites: the graph is acyclic', () => {
	const cyclic: string[] = [];

	function walk(id: string, seen: Set<string>): boolean {
		if (seen.has(id)) {
			return false;
		}
		const next = new Set(seen).add(id);
		return (PHONEME_PREREQUISITES.get(id) ?? []).every((prerequisite) => walk(prerequisite, next));
	}

	for (const id of PHONEME_PREREQUISITES.keys()) {
		if (!walk(id, new Set())) {
			cyclic.push(id);
		}
	}

	assertEquals(cyclic, []);
});

/**
 * The rules must never be able to make an inventory unsatisfiable — the failure 2GN.87 punished,
 * where a condition had no satisfying assignment. One-directionality is what guarantees it: a rule
 * only ever says what a phoneme needs, never what it forbids, so adding the prerequisite always
 * satisfies it.
 */
Deno.test('prerequisites: no phoneme is its own prerequisite', () => {
	for (const [id, prerequisites] of PHONEME_PREREQUISITES) {
		assert(!prerequisites.includes(id), `${id} requires itself`);
	}
});

Deno.test('core: every universal-core phoneme exists and is prerequisite-closed', () => {
	for (const id of UNIVERSAL_CORE) {
		assert(PHONES_BY_ID.has(id), `${id} is not a phoneme`);

		for (const prerequisite of PHONEME_PREREQUISITES.get(id) ?? []) {
			assert(
				UNIVERSAL_CORE.includes(prerequisite),
				`core member ${id} requires ${prerequisite}, which is not in the core`,
			);
		}
	}
});

/**
 * Pins the vowel-system floor. Before this constraint, 5.3% of generated languages had no high vowel
 * at all and the minimum vowel count was 1 — systems no attested language matches. The three-vowel
 * triangle is the genuine typological floor.
 */
Deno.test('core: guarantees the minimal three-vowel system', () => {
	for (const vowel of MINIMAL_VOWEL_SYSTEM) {
		assert(UNIVERSAL_CORE.includes(vowel), `${vowel} is missing from the universal core`);
	}
});

Deno.test('clusters: every manner named is a real manner', () => {
	const manners = new Set<string>(MANNER_VALUES);

	for (const [first, second] of ONSET_CLUSTER_MANNERS) {
		assert(manners.has(first), `unknown manner ${first}`);
		assert(manners.has(second), `unknown manner ${second}`);
	}
});

/**
 * The sonority sequencing principle: an onset cluster rises in sonority towards the vowel.
 * `MANNER_VALUES` is ordered by increasing sonority, so an admissible pair has increasing indices —
 * except the two well-attested `/s/`-initial violations, which this pins as the *only* exceptions so
 * a third cannot be added without a deliberate decision.
 *
 * This test earned its place during authoring: two cluster rules referenced a `'liquid'` manner that
 * no longer existed after the lateral split, leaving them silently dead.
 */
Deno.test('clusters: rise in sonority, bar the two attested /s/ exceptions', () => {
	const sonority = (manner: string) =>
		MANNER_VALUES.indexOf(manner as typeof MANNER_VALUES[number]);

	const violations = ONSET_CLUSTER_MANNERS
		.filter(([first, second]) => sonority(first) >= sonority(second))
		.map(([first, second]) => `${first}+${second}`);

	assertEquals(violations, ['fricative+stop']);
});

Deno.test('clusters: the phonotactic limits are the measured ones', () => {
	// Two, because that is what the onset rules already admit — a third consonant only ever arrives
	// by a syllable-juncture accident, which `smoothJuncture` repairs.
	assertEquals(MAX_CONSONANT_RUN, 2);
});

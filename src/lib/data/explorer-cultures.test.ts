/// <reference lib="deno.ns" />
/**
 * Authoring invariants for the four shipped Explorer presets (roadmap 2GN.128).
 *
 * ⚠️ The silence-rule test below is **redundant with the module-load check in
 * `explorer-cultures.ts`, by design**. That check throws on import, so this file could never reach
 * its assertion with a violating preset — importing `EXPLORER_CULTURES` would already have failed.
 *
 * It earns its place twice over anyway. It names the rule at the place a maintainer editing a preset
 * will actually look, and it turns a bare import-time stack trace into a readable failure listing
 * which materials in which preset went uncovered. `data/classification.ts`'s `RULES_BY_ID` guard has
 * no such companion test, and the cost is that its invariant is invisible from the test suite.
 */

import { assert, assertEquals } from '@std/assert';
import { EXPLORER_CULTURES } from './explorer-cultures.ts';
import { MATERIALS } from './materials.ts';
import { findAffinitySilenceViolations } from '../engine/generation/cultureValidation.ts';
import { isAvailable } from '../engine/generation/materials.ts';

Deno.test('explorer presets: every preset satisfies the 2GN.127 affinity-silence rule', () => {
	for (const culture of EXPLORER_CULTURES) {
		const violations = findAffinitySilenceViolations(
			culture.profile,
			culture.phase,
			culture.geology,
			culture.trade,
		);

		assertEquals(
			violations.map((violation) => violation.materialId),
			[],
			`${culture.id} is silent about ${violations.length} material(s) it can obtain — silence is ` +
				`legitimate only for an inaccessible material (doc 11 §2.15)`,
		);
	}
});

Deno.test('explorer presets: no preset authors a duplicate selector', () => {
	// `culturalAffinityWeight`'s JSDoc flags duplicate selectors as unruled and asks for "a validation
	// pass at authoring time rather than a tiebreak here" — its `find` takes first-match, so a second
	// entry with the same selector is silently inert.
	//
	// ⚠️ Measured during 2GN.128 and the reason this guard exists: giving thalassar a `{ tag: 'metal' }`
	// class entry would have made `materials.calibration.test.ts`'s preset-affinity guard append an
	// inert duplicate, collapsing its `classLifted` arm onto the neutral case. The guard's assertions
	// would still have passed while it measured nothing — doc 12 §2.48's failure mode exactly. Now
	// that presets carry 7–12 entries rather than 2–4, the odds of authoring one by accident are real.
	for (const culture of EXPLORER_CULTURES) {
		const keys = culture.profile.materialAffinities.map((entry) =>
			entry.selector.id !== undefined ? `id:${entry.selector.id}` : `tag:${entry.selector.tag}`
		);
		const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);

		assertEquals(duplicates, [], `${culture.id} authors a duplicate affinity selector`);
	}
});

Deno.test('explorer presets: an entry may cover a material the culture cannot obtain', () => {
	// 2GN.127 finding 6, pinned on real data so a later author does not "tidy" it away: the obligation
	// is one-directional, so tarpan's `{ tag: 'metal' }: 1.3` legitimately covers the gold and silver
	// its geology marks `absent`. The weight never applies — `isAvailable` excludes both before
	// `culturalAffinityWeight` is consulted — but the entry is well-formed, and the validator reports
	// only the missing direction.
	const tarpan = EXPLORER_CULTURES.find((preset) => preset.id === 'tarpan');
	if (tarpan === undefined) throw new Error("explorer preset 'tarpan' not found");

	const covered = (id: string) => {
		const material = MATERIALS.find((candidate) => candidate.id === id);
		if (material === undefined) throw new Error(`test expects a shipped material '${id}'`);
		return {
			material,
			isCovered: tarpan.profile.materialAffinities.some((entry) =>
				entry.selector.tag !== undefined && material.tags.includes(entry.selector.tag)
			),
		};
	};

	for (const id of ['gold', 'silver']) {
		const { material, isCovered } = covered(id);
		assert(isCovered, `tarpan's metal entry should still cover ${id}`);
		assertEquals(
			isAvailable(material, tarpan.geology, tarpan.trade),
			false,
			`${id} should remain inaccessible to tarpan — covering it implies nothing about access`,
		);
	}
});

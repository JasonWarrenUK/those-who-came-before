/// <reference lib="deno.ns" />
import { assert, assertEquals, assertThrows } from '@std/assert';
import {
	assertAffinitiesCoverAccessibleMaterials,
	findAffinitySilenceViolations,
} from './cultureValidation.ts';
import { isAvailable } from './materials.ts';
import { MATERIALS } from '../../data/materials.ts';
import {
	mockCulturalProfile,
	mockPhaseCharacteristics,
} from '../../../../tests/fixtures/culture.ts';
import { mockGeologicalContext, mockMaterialFlow } from '../../../../tests/fixtures/world.ts';
import type { MaterialName } from '../../types/tags.ts';
import type { AvailabilityLevel, GeologicalContext } from '../../types/world.ts';

/** Looks up a shipped material by id; throws if the fixture data ever drops it. */
function material(id: string) {
	const found = MATERIALS.find((m) => m.id === id);
	if (!found) throw new Error(`test fixture expects a shipped material '${id}'`);
	return found;
}

/** A single-region geology stating exactly the levels given, and nothing else. */
function geologyOf(levels: Partial<Record<MaterialName, AvailabilityLevel>>): GeologicalContext {
	return {
		materialAvailability: new Map(
			Object.entries(levels).map(([materialId, level]) => [
				materialId as MaterialName,
				{
					materialId: materialId as MaterialName,
					regions: new Map([['test-region', level as AvailabilityLevel]]),
				},
			]),
		),
	};
}

/** The violation ids for one profile/world pairing, for terse assertions. */
function violationIds(
	profile: Parameters<typeof findAffinitySilenceViolations>[0],
	geology: GeologicalContext,
	trade: Parameters<typeof findAffinitySilenceViolations>[3] = [],
	materials = MATERIALS,
): string[] {
	return findAffinitySilenceViolations(
		profile,
		mockPhaseCharacteristics(),
		geology,
		trade,
		materials,
	).map((violation) => violation.materialId);
}

// --- coverage: what discharges the obligation ----------------------------------------------------

Deno.test('affinity silence: a locally obtainable material with no entry is a violation', () => {
	const profile = mockCulturalProfile({ materialAffinities: [] });
	const geology = geologyOf({ granite: 'available' });

	assertEquals(violationIds(profile, geology, [], [material('granite')]), ['granite']);
});

Deno.test('affinity silence: a class entry discharges the obligation for its whole class', () => {
	// One `{ tag: 'stone' }` entry states this culture's position on all three stones — the terse
	// authoring the 2GN.127 ruling protects (khaltiris covers eight materials with two entries).
	const profile = mockCulturalProfile({
		materialAffinities: [{ selector: { tag: 'stone' }, weight: 1.4 }],
	});
	const geology = geologyOf({ granite: 'available', obsidian: 'abundant', jade: 'scarce' });
	const stones = [material('granite'), material('obsidian'), material('jade')];

	assertEquals(violationIds(profile, geology, [], stones), []);
});

Deno.test('affinity silence: a specific entry covers only its own material', () => {
	const profile = mockCulturalProfile({
		materialAffinities: [{ selector: { id: 'gold' }, weight: 1.2 }],
	});
	const geology = geologyOf({ gold: 'scarce', silver: 'scarce' });

	assertEquals(
		violationIds(profile, geology, [], [material('gold'), material('silver')]),
		['silver'],
	);
});

Deno.test('affinity silence: an entry authored at exactly 1.0 discharges the obligation', () => {
	// The case the whole 2GN.127 ruling turns on. `culturalAffinityWeight` resolves this entry and a
	// missing entry to the same `1`, so coverage must read the entry's *presence*, never its weight.
	const profile = mockCulturalProfile({
		materialAffinities: [{ selector: { tag: 'clay' }, weight: 1.0 }],
	});
	const geology = geologyOf({ 'fired-clay': 'abundant' });

	assertEquals(violationIds(profile, geology, [], [material('fired-clay')]), []);
});

// --- the three states of accessibility -----------------------------------------------------------

Deno.test('affinity silence: an unmodelled material is legitimate silence, not a violation', () => {
	// ⚠️ The load-bearing test (2GN.127 finding 5). `isAvailable` carries an MVP lenience returning
	// `true` for an unmodelled material, which read naively inverts the rule — an unmodelled material
	// is the *strongest* case for "never encountered". The second assertion pins that divergence
	// directly, so simplifying the validator to a bare `isAvailable` call fails here rather than
	// silently demanding an opinion about every material nobody modelled.
	const profile = mockCulturalProfile({ materialAffinities: [] });
	const empty = geologyOf({});
	const oak = material('oak');

	assertEquals(
		isAvailable(oak, empty, []),
		true,
		'the MVP lenience still reads unmodelled as available',
	);
	assertEquals(violationIds(profile, empty, [], [oak]), []);
});

Deno.test('affinity silence: an absent material with no flow is legitimate silence', () => {
	const profile = mockCulturalProfile({ materialAffinities: [] });
	const geology = geologyOf({ jade: 'absent' });

	assertEquals(violationIds(profile, geology, [], [material('jade')]), []);
});

Deno.test('affinity silence: a trade-only material reached by a flow must be covered', () => {
	const profile = mockCulturalProfile({ materialAffinities: [] });
	const geology = geologyOf({ gold: 'trade-only' });
	const trade = [mockMaterialFlow()]; // Bidirectional `{ tag: 'metal' }`, which reaches gold.

	const violations = findAffinitySilenceViolations(
		profile,
		mockPhaseCharacteristics(),
		geology,
		trade,
		[material('gold')],
	);

	assertEquals(violations.length, 1);
	assertEquals(violations[0].materialId, 'gold');
	assertEquals(violations[0].level, 'trade-only');
	assertEquals(violations[0].tradeRescued, true);
});

Deno.test('affinity silence: a trade-only material with no reaching flow is legitimate silence', () => {
	const profile = mockCulturalProfile({ materialAffinities: [] });
	const geology = geologyOf({ jade: 'trade-only' });
	const trade = [mockMaterialFlow()]; // Metal only — nothing here reaches jade.

	assertEquals(violationIds(profile, geology, trade, [material('jade')]), []);
});

Deno.test('affinity silence: an excludes-narrowed flow leaves the excluded material silent', () => {
	// 2GN.127 finding 6 notes `excludes` is legal but unexercised by any preset, and asks that the
	// validator be written against it rather than discovering it later.
	const profile = mockCulturalProfile({ materialAffinities: [] });
	const geology = geologyOf({ gold: 'trade-only', bronze: 'trade-only' });
	const trade = [mockMaterialFlow({ includes: [{ tag: 'metal' }], excludes: [{ id: 'gold' }] })];

	assertEquals(
		violationIds(profile, geology, trade, [material('gold'), material('bronze')]),
		['bronze'],
	);
});

// --- one-directionality --------------------------------------------------------------------------

Deno.test('affinity silence: covering an inaccessible material is legal and silent', () => {
	// 2GN.127 finding 6: accessible ⟹ must be covered; covered ⟹ nothing implied about access. A
	// culture may prize gold it has never held (tarpan's `metal: 1.3` covers its two absent metals),
	// so the validator only ever reports the missing direction.
	const profile = mockCulturalProfile({
		materialAffinities: [{ selector: { tag: 'metal' }, weight: 1.5 }],
	});
	const geology = geologyOf({ gold: 'absent', silver: 'absent' });

	assertEquals(violationIds(profile, geology, [], [material('gold'), material('silver')]), []);
});

// --- the throwing half ---------------------------------------------------------------------------

Deno.test('assertAffinitiesCoverAccessibleMaterials: a clean profile does not throw', () => {
	const profile = mockCulturalProfile({
		materialAffinities: [{ selector: { tag: 'stone' }, weight: 1.4 }],
	});

	assertAffinitiesCoverAccessibleMaterials(
		'clean',
		profile,
		mockPhaseCharacteristics(),
		geologyOf({ granite: 'available' }),
		[],
		[material('granite')],
	);
});

Deno.test('assertAffinitiesCoverAccessibleMaterials: throws naming the profile and every material', () => {
	const profile = mockCulturalProfile({ materialAffinities: [] });
	const geology = geologyOf({ granite: 'available', linen: 'abundant' });

	const error = assertThrows(
		() =>
			assertAffinitiesCoverAccessibleMaterials(
				'test-preset',
				profile,
				mockPhaseCharacteristics(),
				geology,
				[],
				[material('granite'), material('linen')],
			),
		Error,
		'test-preset',
	);

	// Both violations listed with their levels, not just a count — the author needs the list to act
	// on, and the level says whether the fix is an affinity entry or a geology correction.
	assert(error.message.includes('granite (available)'), error.message);
	assert(error.message.includes('linen (abundant)'), error.message);
	assert(error.message.includes('doc 11 §2.15'), error.message);
});

Deno.test('findAffinitySilenceViolations: reports rather than throwing', () => {
	// The find/assert split exists so the Explorer panels can list gaps without exploding.
	const profile = mockCulturalProfile({ materialAffinities: [] });
	const violations = findAffinitySilenceViolations(
		profile,
		mockPhaseCharacteristics(),
		geologyOf({ granite: 'available' }),
		[],
		[material('granite')],
	);

	assertEquals(violations.length, 1);
});

Deno.test('findAffinitySilenceViolations: defaults to the shipped catalogue', () => {
	// Exercises all three accessibility states at once against the shipped catalogue.
	// `mockGeologicalContext` models only bronze/iron/gold/flint of the sixteen, so the other twelve
	// take the *unmodelled* path; flint is `absent`; gold is `trade-only` with no flow passed here,
	// so nothing rescues it. All legitimate silence. Bronze and iron are the only accessible pair,
	// and the fixture's `{ tag: 'metal' }` entry covers both — so a clean run.
	const violations = findAffinitySilenceViolations(
		mockCulturalProfile(),
		mockPhaseCharacteristics(),
		mockGeologicalContext(),
		[],
	);

	assertEquals(violations, []);
});

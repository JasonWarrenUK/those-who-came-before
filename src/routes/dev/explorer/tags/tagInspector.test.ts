/// <reference lib="deno.ns" />
import { assertAlmostEquals, assertEquals } from '@std/assert';
import { inspectTags } from './tagInspector.ts';
import { CLASSIFICATION_RULES } from '../../../../lib/data/classification.ts';
import { classifyArtefact } from '../../../../lib/engine/generation/classification.ts';
import { CONTEXT_TAGS, FUNCTION_TAGS } from '../../../../lib/types/tags.ts';
import { EXPLORER_CULTURES } from '../../../../lib/data/explorer-cultures.ts';

const tarpan = EXPLORER_CULTURES.find((culture) => culture.id === 'tarpan')!;
const khaltiris = EXPLORER_CULTURES.find((culture) => culture.id === 'khaltiris')!;

Deno.test('inspectTags — is deterministic for the same seed and culture', () => {
	assertEquals(
		inspectTags('tag-determinism', khaltiris),
		inspectTags('tag-determinism', khaltiris),
	);
});

Deno.test("inspectTags — each tag's contributions sum exactly to its score", () => {
	for (const seed of ['tag-sum-0', 'tag-sum-1', 'tag-sum-2', 'tag-sum-3']) {
		const inspection = inspectTags(seed, khaltiris);
		for (const scored of [...inspection.functionTags, ...inspection.contextTags]) {
			const summed = scored.contributions.reduce((total, c) => total + c.weight, 0);
			assertAlmostEquals(summed, scored.score, 1e-9, `${seed} ${scored.tag}`);
		}
	}
});

Deno.test('inspectTags — scores match calling classifyArtefact directly on the same features', () => {
	const inspection = inspectTags('tag-cross-check', khaltiris);
	const direct = classifyArtefact(inspection.features, CLASSIFICATION_RULES);

	const seen = new Map(
		[...inspection.functionTags, ...inspection.contextTags].map((s) => [s.tag, s.score]),
	);
	assertEquals(seen.size, direct.size);
	for (const [tag, score] of direct) assertEquals(seen.get(tag), score);
});

Deno.test('inspectTags — scored and unscored tags together cover the whole vocabulary exactly once', () => {
	const inspection = inspectTags('tag-coverage', tarpan);
	const all = [
		...inspection.functionTags.map((s) => s.tag),
		...inspection.contextTags.map((s) => s.tag),
		...inspection.unscored,
	];
	assertEquals(new Set(all).size, all.length); // No tag appears twice.
	assertEquals(new Set(all), new Set([...FUNCTION_TAGS, ...CONTEXT_TAGS]));
});

Deno.test('inspectTags — each group is ordered strongest-first', () => {
	const inspection = inspectTags('tag-ordering', khaltiris);
	for (const group of [inspection.functionTags, inspection.contextTags]) {
		for (let i = 1; i < group.length; i++) {
			assertEquals(group[i - 1].score >= group[i].score, true);
		}
	}
});

Deno.test("inspectTags — share is score over the artefact's strongest tag, so the leader is 1", () => {
	const inspection = inspectTags('tag-share', khaltiris);
	const scored = [...inspection.functionTags, ...inspection.contextTags];
	if (scored.length === 0) return; // An unscored artefact has nothing to normalise.

	const max = Math.max(...scored.map((s) => s.score));
	for (const s of scored) assertAlmostEquals(s.share, s.score / max, 1e-9, s.tag);
	assertAlmostEquals(Math.max(...scored.map((s) => s.share)), 1, 1e-9);
});

Deno.test('inspectTags — every contribution comes from a rule reported as fired', () => {
	const inspection = inspectTags('tag-fired', khaltiris);
	const fired = new Set(inspection.firedRuleIndices);
	for (const scored of [...inspection.functionTags, ...inspection.contextTags]) {
		for (const contribution of scored.contributions) {
			assertEquals(fired.has(contribution.ruleIndex), true, contribution.rule);
		}
	}
});

Deno.test('inspectTags — fired rule indices are ascending and label as R{index + 1}', () => {
	const inspection = inspectTags('tag-labels', khaltiris);
	const indices = inspection.firedRuleIndices;
	for (let i = 1; i < indices.length; i++) assertEquals(indices[i - 1] < indices[i], true);

	for (const scored of [...inspection.functionTags, ...inspection.contextTags]) {
		for (const c of scored.contributions) assertEquals(c.rule, `R${c.ruleIndex + 1}`);
	}
});

Deno.test('inspectTags — ruleCount reports the shipped rule set size', () => {
	assertEquals(inspectTags('tag-count', tarpan).ruleCount, CLASSIFICATION_RULES.length);
});

Deno.test('inspectTags — feature readings cover every ExtractedFeatures field exactly once', () => {
	// Guards the hand-maintained FEATURE_GROUPS table against the contract growing: 2GN.27 and
	// 2GN.68 both add fields, and a missing entry would silently drop it from the panel.
	const inspection = inspectTags('tag-feature-coverage', khaltiris);
	const listed = inspection.featureReadings.map((reading) => reading.field);

	assertEquals(new Set(listed).size, listed.length);
	assertEquals(new Set(listed), new Set(Object.keys(inspection.features)));
});

Deno.test('inspectTags — a feature reading is inert exactly when its value carries no signal', () => {
	const inspection = inspectTags('tag-inert', khaltiris);
	const NEUTRAL_BANDS: Record<string, string> = {
		massBand: 'moderate',
		sizeBand: 'medium',
		primaryAxisLength: 'medium',
	};

	for (const reading of inspection.featureReadings) {
		const raw = inspection.features[reading.field as keyof typeof inspection.features];
		const expected = reading.field in NEUTRAL_BANDS
			? raw === NEUTRAL_BANDS[reading.field]
			: typeof raw === 'boolean'
			? !raw
			: typeof raw === 'number'
			? raw === 0
			: Array.isArray(raw)
			? raw.length === 0
			: raw === 'none';

		assertEquals(reading.inert, expected, reading.field);
	}
});

Deno.test('inspectTags — the three fields awaiting 2GN.33 are flagged dormant and read inert', () => {
	const inspection = inspectTags('tag-dormant', khaltiris);
	const dormant = inspection.featureReadings.filter((reading) => reading.dormant);

	assertEquals(
		new Set(dormant.map((reading) => reading.field)),
		new Set(['motifPresent', 'motifCulturalOrigins', 'preciousMaterialsInDecoration']),
	);
	// No producer populates them, so they can never carry signal today.
	for (const reading of dormant) assertEquals(reading.inert, true, reading.field);
});

Deno.test('inspectTags — the two mechanical fields no rule may read are grouped apart', () => {
	const inspection = inspectTags('tag-mechanical', khaltiris);
	const mechanical = inspection.featureReadings.filter((r) => r.group === 'mechanical');

	assertEquals(
		new Set(mechanical.map((r) => r.field)),
		new Set(['portability', 'inspectionDepth']),
	);
});

Deno.test('inspectTags — both cultures produce a well-formed inspection for the same seed', () => {
	// Not asserting the tag maps differ: the two cultures share a grammar and a seed may
	// coincidentally classify alike. Asserting the pipeline is wired for both instead.
	for (const culture of [tarpan, khaltiris]) {
		const inspection = inspectTags('tag-culture-variation', culture);
		assertEquals(inspection.artefact.components.length > 0, true);
		assertEquals(inspection.ruleCount > 0, true);
	}
});

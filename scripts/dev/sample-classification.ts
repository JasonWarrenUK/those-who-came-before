/**
 * Samples rule-based tag classification (roadmap 2GN.20): runs the full Milestone 2 chain —
 * expand → normalise → decorate → assign materials → grade → `extractFeatures` → `classifyArtefact`
 * — and renders the scored tag map as a grouped bar chart with per-rule contributions. The terminal
 * preview of the
 * Explorer's tag inspector (roadmap 2GN.59), and the fastest way to eyeball the plain-sum
 * accumulation contract (doc 12 §2.21) against real grammar rolls.
 *
 * The per-rule breakdown re-runs each rule's `condition` against the extracted features — the
 * documented consumer pattern, and honest to display additively because the fold is a plain sum.
 * Rule labels are 1-based (`R1` = `CLASSIFICATION_RULES[0]`), matching the pinned blocks in
 * `src/lib/data/classification.test.ts`.
 *
 * Bars scale to the artefact's own strongest tag: scores are unbounded evidence tallies, so there
 * is no absolute ceiling to draw against. Within each group, bars sort score-descending (ties
 * keep canonical vocabulary order); the underlying map still iterates canonically — that order is
 * a serialisation contract, not a display obligation.
 *
 * **Classifies against a real sampled baseline (roadmap 2GN.82).** Nine rules now read
 * `ClassificationContext` (`data/classification.ts`); a real `sampleBaselines` context is built
 * once from the chosen `--world` region at a flat 0.5 `decorativeEmphasis`, matching this script's
 * existing `sampleWorld` fixture convention, and shared across every sampled artefact in the run —
 * same reasoning as the Explorer's `tagInspector.ts` memo: the baseline is a property of the
 * culture being sampled, not of any one artefact. Each sampled artefact's own layers are assigned
 * materials and re-graded before `extractFeatures`, matching `sampleBaselines` itself and
 * `ruleCalibration.ts`'s `calibrateRules` — without that pass, `meanDecorativeGrade` (R44) here
 * would be the provisional technique-only grade, measured on a different scale than the baseline it
 * is being compared against (roadmap 2GN.103, doc 12 §2.36).
 *
 * Run via `deno task sample:classification` — see `scripts/dev/shared.ts` for the fixture-world
 * caveat.
 */

import { paint } from './gum.ts';
import { createPrng } from '../../src/lib/engine/prng.ts';
import {
	expandDecoration,
	gradeDecorativeLayers,
} from '../../src/lib/engine/generation/decoration.ts';
import { assignMaterials } from '../../src/lib/engine/generation/materials.ts';
import {
	classifyArtefact,
	extractFeatures,
} from '../../src/lib/engine/generation/classification.ts';
import { sampleBaselines } from '../../src/lib/engine/generation/baselines.ts';
import { CORE_GRAMMAR_RULES } from '../../src/lib/data/grammars/core.ts';
import { CLASSIFICATION_RULES } from '../../src/lib/data/classification.ts';
import { MATERIALS } from '../../src/lib/data/materials.ts';
import { DECORATIVE_TECHNIQUES } from '../../src/lib/data/decorations.ts';
import { ABSOLUTE_TAGS, RELATIVE_TAGS } from '../../src/lib/types/tags.ts';
import type { ArtefactTag } from '../../src/lib/types/tags.ts';
import {
	generateArtefact,
	jsonReplacer,
	parseSampleOptions,
	printAnatomy,
	printWorldHeader,
	sampleSeed,
	sampleWorld,
	sampleWorldRegion,
	WORLD_FLAG_USAGE,
} from './shared.ts';

const USAGE = `sample-classification — score sampled artefacts against the shipped rules

Usage: deno task sample:classification [--seed <string>] [--count <n>] [--bare] [--world <region>] [--json]

  --seed   Base PRNG seed (default: dev-sample). Sample n of a batch uses "<seed>-<n>".
  --count  Number of artefacts to sample (default: 1).
  --bare   Skip decorative expansion (classify the bare structure).
${WORLD_FLAG_USAGE}
  --json   Emit JSON (tag map, fired rules and contributions) instead of the chart.`;

const options = parseSampleOptions(USAGE, { '--bare': 'boolean' });
const bare = options.values.has('--bare');
const world = sampleWorld(sampleWorldRegion(options, USAGE));

// One real baseline for the whole run — see the module JSDoc for why this is shared rather than
// sampled per artefact.
const context = sampleBaselines(
	'sample-classification-baseline',
	{
		cultureId: world.region,
		phaseId: 'sample',
		profile: world.culture,
		phase: world.phase,
		geology: world.geology,
		trade: world.trade,
	},
	CORE_GRAMMAR_RULES,
	MATERIALS,
	DECORATIVE_TECHNIQUES,
);

/** One rule's additive contribution to one tag. */
interface Contribution {
	/** 1-based display label matching the data test blocks (`R1` = index 0). */
	rule: string;
	weight: number;
}

const samples = Array.from({ length: options.count }, (_, index) => {
	const seed = sampleSeed(options, index);
	const artefact = generateArtefact(seed, world);
	const provisionalLayers = bare ? [] : expandDecoration(
		artefact,
		world.culture,
		world.phase,
		world.geology,
		world.trade,
		createPrng(`${seed}-decoration`),
		MATERIALS,
		DECORATIVE_TECHNIQUES,
	);
	// Materials assigned and layers re-graded before `extractFeatures` — see the module JSDoc for
	// why this matters for `meanDecorativeGrade` specifically.
	const layers = bare ? [] : gradeDecorativeLayers(
		provisionalLayers,
		assignMaterials(
			artefact,
			world.culture,
			world.phase,
			world.geology,
			world.trade,
			createPrng(`${seed}-materials`),
			MATERIALS,
		),
		world.phase,
		MATERIALS,
	);
	const features = extractFeatures(artefact, layers);
	const tags = classifyArtefact(features, CLASSIFICATION_RULES, context);

	// Re-run each condition to decompose the sums — exact under plain-sum accumulation.
	const contributions = new Map<ArtefactTag, Contribution[]>();
	const fired: string[] = [];
	CLASSIFICATION_RULES.forEach((rule, ruleIndex) => {
		if (!rule.condition(features, context)) return;
		const label = `R${ruleIndex + 1}`;
		fired.push(label);
		for (const [tag, weight] of rule.tags) {
			const existing = contributions.get(tag) ?? [];
			existing.push({ rule: label, weight });
			contributions.set(tag, existing);
		}
	});

	return { seed, artefact, features, tags, fired, contributions };
});

// --- Chart rendering -----------------------------------------------------------------------------

const BAR_WIDTH = 24;
const LABEL_WIDTH = 13; // 'agricultural' plus a space.
const EIGHTHS = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉'];

/** A block bar for `score` scaled against `max`, space-padded to `BAR_WIDTH`. */
function bar(score: number, max: number): string {
	const cells = (score / max) * BAR_WIDTH;
	let full = Math.floor(cells);
	let eighth = Math.round((cells - full) * 8);
	if (eighth === 8) {
		full += 1;
		eighth = 0;
	}
	return ('█'.repeat(full) + EIGHTHS[eighth]).padEnd(BAR_WIDTH);
}

/** `← R1 0.3 + R10 0.5` — the additive decomposition of one tag's score. */
function breakdown(parts: Contribution[]): string {
	return `← ${parts.map(({ rule, weight }) => `${rule} ${weight}`).join(' + ')}`;
}

/** The group's scored tags, strongest first; ties keep canonical order (stable sort). */
function scoredGroup(
	vocabulary: readonly (ArtefactTag)[],
	tags: Map<ArtefactTag, number>,
): [ArtefactTag, number][] {
	return vocabulary
		.filter((tag) => tags.has(tag))
		.map((tag) => [tag, tags.get(tag) as number] as [ArtefactTag, number])
		.sort((a, b) => b[1] - a[1]);
}

function printChart(sample: (typeof samples)[number]): void {
	const { tags, contributions } = sample;

	if (tags.size === 0) {
		console.log(
			paint('  no rules fired — the classifier returns an empty map (honest silence)', 'warn'),
		);
		return;
	}

	const max = Math.max(...tags.values());
	const groups: [string, readonly (ArtefactTag)[]][] = [
		['absolute', ABSOLUTE_TAGS],
		['relative', RELATIVE_TAGS],
	];

	for (const [name, vocabulary] of groups) {
		const scored = scoredGroup(vocabulary, tags);
		if (scored.length === 0) continue;
		console.log(`  ${paint(name, 'heading')}`);
		scored.forEach(([tag, score], rank) => {
			// The group leader's bar carries the lead tone; the rest share the base bar colour.
			console.log(
				`    ${tag.padEnd(LABEL_WIDTH)} ${
					paint(bar(score, max), rank === 0 ? 'barLead' : 'bar')
				}  ${score.toFixed(2)}  ${paint(breakdown(contributions.get(tag) ?? []), 'dim')}`,
			);
		});
	}

	console.log();
	printReading(tags);
	printSilence(tags);
}

/** Leaders and margins — phrased as evidence, never as a resolved identity (doc 05 §9.2). */
function printReading(tags: Map<ArtefactTag, number>): void {
	const absolutes = scoredGroup(ABSOLUTE_TAGS, tags);
	const relatives = scoredGroup(RELATIVE_TAGS, tags);

	const leaders = [absolutes[0], relatives[0]]
		.filter((entry): entry is [ArtefactTag, number] => entry !== undefined)
		.map(([tag]) => tag);
	let sentence = `${leaders.join(' and ')} lead${leaders.length === 1 ? 's' : ''}`;

	if (absolutes.length >= 2) {
		const [[leader, top], [runnerUp, second]] = absolutes;
		const margin = top - second;
		sentence += `; ${leader}'s margin over ${runnerUp} is ${margin.toFixed(2)}`;
		sentence += margin < 0.25
			? ' — the evidence overlaps and the classifier leaves that unresolved'
			: ' — a clear lead, though the map stays unresolved by design';
	}
	console.log(`  ${paint('reading'.padEnd(LABEL_WIDTH), 'heading')}${sentence}`);
}

/** Tags with no evidence at all — absence provably means zero (doc 12 §2.21). */
function printSilence(tags: Map<ArtefactTag, number>): void {
	const silent = (vocabulary: readonly (ArtefactTag)[]) =>
		vocabulary.filter((tag) => !tags.has(tag)).join(', ');
	const parts = [silent(ABSOLUTE_TAGS), silent(RELATIVE_TAGS)].filter((part) => part !== '');
	if (parts.length > 0) {
		console.log(
			`  ${paint('no evidence'.padEnd(LABEL_WIDTH), 'heading')}${paint(parts.join(' · '), 'dim')}`,
		);
	}
}

// --- Main ------------------------------------------------------------------------------------------

if (options.json) {
	console.log(JSON.stringify(samples, jsonReplacer, '\t'));
} else {
	printWorldHeader(world);
	for (const sample of samples) {
		console.log();
		printAnatomy(sample.artefact, sample.seed);
		console.log();
		console.log(
			`${
				paint(sample.seed, 'seed')
			} scores with the ${CLASSIFICATION_RULES.length} shipped rules — ` +
				`${sample.fired.length} fired${bare ? paint(' (--bare: decoration skipped)', 'dim') : ''}:`,
		);
		console.log();
		printChart(sample);
	}
	console.log();
}

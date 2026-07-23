/**
 * Samples unified feature extraction (roadmap 2GN.17/2GN.19): runs the full Milestone 2 chain —
 * expand → normalise → decorate → `extractFeatures` — and renders the result as an annotated
 * reading: each collapsed value next to the component it came from, gated flags explained, absent
 * families collapsed to one line. The fastest way to eyeball the collapse policies and
 * interviewed presence flags against real grammar rolls.
 *
 * Source annotations re-derive "which component" by re-running the extractor's recorded collapse
 * policies (doc 12 §2.20) — the documented consumer contract. If the mirror ever drifts from the
 * extractor, the source renders as `?` rather than pointing at the wrong part.
 *
 * Run via `deno task sample:features` — see `scripts/dev/shared.ts` for the fixture-world caveat.
 */

import { glyphs, paint } from './gum.ts';
import { createPrng } from '../../src/lib/engine/prng.ts';
import { expandDecoration } from '../../src/lib/engine/generation/decoration.ts';
import { extractFeatures } from '../../src/lib/engine/generation/classification.ts';
import { MATERIALS } from '../../src/lib/data/materials.ts';
import { DECORATIVE_TECHNIQUES } from '../../src/lib/data/decorations.ts';
import type {
	ExtractedFeatures,
	NormalisedArtefact,
	NormalisedComponent,
} from '../../src/lib/types/artefact.ts';
import {
	generateArtefact,
	jsonReplacer,
	parseSampleOptions,
	printAnatomy,
	sampleSeed,
	sampleWorld,
	shortId,
} from './shared.ts';

const USAGE = `sample-features — extract classification features from sampled artefacts

Usage: deno task sample:features [--seed <string>] [--count <n>] [--bare] [--json]

  --seed   Base PRNG seed (default: dev-sample). Sample n of a batch uses "<seed>-<n>".
  --count  Number of artefacts to sample (default: 1).
  --bare   Skip decorative expansion (extract from the bare structure).
  --json   Emit JSON of the full ExtractedFeatures contract instead of the reading.`;

const options = parseSampleOptions(USAGE, { '--bare': 'boolean' });
const bare = options.values.has('--bare');
const world = sampleWorld();

const samples = Array.from({ length: options.count }, (_, index) => {
	const seed = sampleSeed(options, index);
	const artefact = generateArtefact(seed, world);
	const layers = bare ? [] : expandDecoration(
		artefact,
		world.culture,
		world.phase,
		world.geology,
		world.trade,
		MATERIALS,
		DECORATIVE_TECHNIQUES,
		createPrng(`${seed}-decoration`),
	);
	return { seed, artefact, layers, features: extractFeatures(artefact, layers) };
});

// --- Source re-derivation (mirrors the collapse policies recorded in doc 12 §2.20) ---------------

/** Reads a string property, `undefined` when absent. */
function propOf(component: NormalisedComponent, name: string): string | undefined {
	const value = component.properties.get(name);
	return typeof value === 'string' ? value : undefined;
}

/** Mirrors the extractor's degradation: unrecognised values read as the first-listed one. */
function degraded(component: NormalisedComponent, name: string, vocabulary: string[]): string {
	const value = propOf(component, name);
	return value !== undefined && vocabulary.includes(value) ? value : vocabulary[0];
}

/** Highest-ranked component by a banded property, earliest position on ties. */
function rankedBy(
	components: NormalisedComponent[],
	name: string,
	order: string[],
): NormalisedComponent | undefined {
	let best: NormalisedComponent | undefined;
	let bestRank = -1;
	for (const component of components) {
		const rank = order.indexOf(degraded(component, name, order));
		if (rank > bestRank) {
			best = component;
			bestRank = rank;
		}
	}
	return best;
}

/** The components carrying edges (the blade pool). */
function edgedOf(components: NormalisedComponent[]): NormalisedComponent[] {
	return components.filter((component) => {
		const edge = propOf(component, 'edge');
		return edge === 'single' || edge === 'double';
	});
}

/** First component of the given primitives whose property carries `value`. */
function carrierOf(
	components: NormalisedComponent[],
	primitives: string[],
	name: string,
	value: string,
): NormalisedComponent | undefined {
	return components.find((component) =>
		primitives.includes(component.primitiveType) && propOf(component, name) === value
	);
}

/** `← c4` annotation, or `← ?` when the mirror failed to find a source (policy drift). */
function from(component: NormalisedComponent | undefined): string {
	return `← ${component === undefined ? '?' : shortId(component)}`;
}

// --- Reading renderer ----------------------------------------------------------------------------

const LABEL_WIDTH = 12;
const VALUE_WIDTH = 30;

/** The tone an annotation deserves: policy drift screams, gate blocks warn, sources stay quiet. */
function annotationTone(annotation: string): 'bad' | 'warn' | 'dim' {
	if (annotation.includes('← ?')) return 'bad';
	return annotation.includes('gate blocks') ? 'warn' : 'dim';
}

/**
 * Prints one `label  value  ← source (note)` row; annotation wraps to its own line if long.
 * Layout is measured on the plain strings; tones apply only at print time so padding stays true.
 */
function row(label: string, value: string, annotation = ''): void {
	const lead = `  ${paint(label.padEnd(LABEL_WIDTH), 'heading')}`;
	if (annotation === '') {
		console.log(`${lead}${glyphs(value)}`);
		return;
	}
	const note = paint(annotation, annotationTone(annotation));
	const padded = value.padEnd(VALUE_WIDTH);
	const oneLine = `  ${label.padEnd(LABEL_WIDTH)}${padded} ${annotation}`;
	if (oneLine.length <= 100) {
		console.log(`${lead}${glyphs(padded)} ${note}`);
	} else {
		console.log(`${lead}${glyphs(value)}`);
		console.log(`  ${' '.repeat(LABEL_WIDTH)}${' '.repeat(VALUE_WIDTH)} ${note}`);
	}
}

/** The body-scale gate's failure reasons at this artefact's bands; empty when the gate passes. */
function gateBlocks(features: ExtractedFeatures): string[] {
	const reasons: string[] = [];
	if (features.sizeBand === 'large') reasons.push('size large');
	if (features.massBand !== 'negligible' && features.massBand !== 'light') {
		reasons.push(`mass ${features.massBand}`);
	}
	return reasons;
}

function printReading(artefact: NormalisedArtefact, features: ExtractedFeatures): void {
	const { components, attachments } = artefact;
	const byId = new Map(components.map((component) => [component.id, component]));
	const absent: string[] = [];

	// Blade — dominant edged component (longest, earliest position).
	const edged = edgedOf(components);
	if (features.hasEdge) {
		const blade = rankedBy(edged, 'length', ['short', 'medium', 'long']);
		const pool = edged.length === 1
			? 'the only edged part'
			: `dominant blade: longest of ${edged.length} edged`;
		row(
			'blade',
			`${features.bladeLengthBand}, ${features.bladeProfile} profile`,
			`${from(blade)} (${pool})`,
		);
	} else {
		absent.push('blade');
	}

	// Point — sharp outranks blunt across elongated components.
	if (features.hasPoint) {
		const point = carrierOf(components, ['elongated'], 'point', features.pointSharpness);
		row('point', features.pointSharpness, from(point));
	} else {
		absent.push('point');
	}

	// Container — largest hollow-enclosed, else longest cylindrical.
	if (features.hasContainer) {
		const hollows = components.filter((c) => c.primitiveType === 'hollow-enclosed');
		const tubes = components.filter((c) => c.primitiveType === 'cylindrical');
		const container = hollows.length > 0
			? rankedBy(hollows, 'size', ['small', 'medium', 'large'])
			: rankedBy(tubes, 'length', ['short', 'medium', 'long']);
		const pool = hollows.length + tubes.length === 1
			? 'the only container'
			: hollows.length > 0
			? `dominant: largest hollow-enclosed${
				tubes.length > 0
					? `, outranks ${tubes.length} tube${tubes.length === 1 ? '' : 's'}`
					: ` of ${hollows.length}`
			}`
			: `dominant: longest of ${tubes.length} tubes`;
		row(
			'container',
			`${features.openingType} opening (openness ${features.containerOpenness}), ${features.wallThickness} wall, ${features.baseType} base`,
			`${from(container)} (${pool})`,
		);
	} else {
		absent.push('container');
	}

	// Perforation / ring / sheet / curvature — loaded-value carriers.
	if (features.perforation !== 'none') {
		const carrier = carrierOf(
			components,
			['flat-broad', 'disc-form'],
			'perforation',
			features.perforation,
		);
		row('perforation', features.perforation, from(carrier));
	} else {
		absent.push('perforation');
	}
	if (features.ringGap !== 'none') {
		const carrier = carrierOf(components, ['ring-form'], 'gap', features.ringGap) ??
			components.find((c) => c.primitiveType === 'ring-form');
		row('ring', `${features.ringGap} gap`, from(carrier));
	} else {
		absent.push('ring');
	}
	if (features.sheetFlexibility !== 'none') {
		const carrier =
			carrierOf(components, ['sheet-form'], 'flexibility', features.sheetFlexibility) ??
				components.find((c) => c.primitiveType === 'sheet-form');
		row('sheet', features.sheetFlexibility, from(carrier));
	} else {
		absent.push('sheet');
	}
	if (features.curvature !== 'none') {
		const carrier = carrierOf(components, ['flat-broad'], 'curvature', features.curvature) ??
			components.find((c) => c.primitiveType === 'flat-broad');
		row('curvature', features.curvature, from(carrier));
	} else {
		absent.push('curvature');
	}

	console.log();
	row('scale', `${features.sizeBand} · ${features.massBand} · ${features.primaryAxisLength} axis`);
	row(
		'structure',
		`${features.partCount} parts · ${features.attachmentDiversity} join type${
			features.attachmentDiversity === 1 ? '' : 's'
		}`,
	);

	// Presence flags — anatomy plus (for fastening/wearable) the body-scale gate.
	const blocks = gateBlocks(features);
	const gateNote = (anatomy: string) =>
		blocks.length > 0 ? `${anatomy}, but gate blocks (${blocks.join(', ')})` : anatomy;

	const striker = components.find((c) =>
		(c.primitiveType === 'bar-form' && propOf(c, 'taper') === 'none') ||
		(c.primitiveType === 'disc-form' && propOf(c, 'thickness') === 'thick')
	);
	row(
		'flags',
		`impact ${features.hasImpactSurface ? '✓' : '✗'}`,
		striker === undefined
			? 'no untapered bar or thick disc'
			: `striking face on ${shortId(striker)}`,
	);

	const hinge = attachments.find((a) => a.type === 'hinged');
	const isPin = (c: NormalisedComponent | undefined) =>
		c !== undefined && c.primitiveType === 'elongated' && propOf(c, 'point') === 'sharp' &&
		propOf(c, 'edge') !== 'single' && propOf(c, 'edge') !== 'double';
	const pinJoin = attachments.find((a) => {
		const fromC = byId.get(a.fromComponentId);
		const toC = byId.get(a.toComponentId);
		return (fromC?.primitiveType === 'ring-form' && isPin(toC)) ||
			(toC?.primitiveType === 'ring-form' && isPin(fromC));
	});
	const fasteningAnatomy = hinge !== undefined
		? `hinge ${shortId(byId.get(hinge.fromComponentId)!)}→${
			shortId(byId.get(hinge.toComponentId)!)
		}`
		: pinJoin !== undefined
		? `pin-on-hoop ${shortId(byId.get(pinJoin.fromComponentId)!)}→${
			shortId(byId.get(pinJoin.toComponentId)!)
		}`
		: undefined;
	row(
		'',
		`fastening ${features.hasFasteningMechanism ? '✓' : '✗'}`,
		fasteningAnatomy === undefined
			? 'no pin-on-hoop or hinged join'
			: features.hasFasteningMechanism
			? fasteningAnatomy
			: gateNote(fasteningAnatomy),
	);

	const ring = components.find((c) => c.primitiveType === 'ring-form');
	const suspension = features.perforation === 'single' || features.perforation === 'off-centre';
	const wearAnatomy = ring !== undefined
		? `ring ${shortId(ring)}`
		: suspension
		? `suspension hole (${features.perforation})`
		: undefined;
	row(
		'',
		`wearable ${features.isWearable ? '✓' : '✗'}`,
		wearAnatomy === undefined
			? 'no ring or suspension hole'
			: features.isWearable
			? wearAnatomy
			: gateNote(wearAnatomy),
	);

	console.log();
	if (features.decorativeLayerCount === 0) {
		row('decoration', 'none');
	} else {
		const pieces = [
			`${features.decorativeLayerCount} layer${features.decorativeLayerCount === 1 ? '' : 's'}`,
			features.appliedElementPresent ? 'applied elements present' : 'surface treatments only',
			features.motifPresent ? 'motif present' : 'motifs dormant (2GN.33)',
		];
		row('decoration', pieces.join(' · '));
	}
	row(
		'complexity',
		`functional ${features.functionalComplexity} + decorative ${features.decorativeComplexity} = overall ${features.overallComplexity} (technique ${features.techniqueComplexity})`,
	);

	console.log();
	if (absent.length > 0) row('absent', absent.join(', '));
	row(
		'passthrough',
		`portability=${features.portability}, inspectionDepth=${features.inspectionDepth} (never classified on)`,
	);
}

// --- Main ------------------------------------------------------------------------------------------

if (options.json) {
	console.log(JSON.stringify(samples, jsonReplacer, '\t'));
} else {
	for (const { seed, artefact, layers, features } of samples) {
		console.log();
		printAnatomy(artefact, seed);
		console.log();
		console.log(
			`${paint(seed, 'seed')} reads to the classifier as${
				bare ? paint(' (--bare: decoration skipped)', 'dim') : ''
			}:`,
		);
		console.log();
		printReading(artefact, features);
		if (!bare) {
			// Sanity note rather than silence: layers fed the decorative fields above.
			if (layers.length !== features.decorativeLayerCount) {
				// Sublayers make the extracted count exceed the top-level count; both are real.
				console.log();
				console.log(
					paint(
						`  (${layers.length} top-level layers expand to ${features.decorativeLayerCount} including sublayers)`,
						'dim',
					),
				);
			}
		}
	}
	console.log();
}

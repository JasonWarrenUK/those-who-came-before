/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { INTERPRETIVE_TEMPLATES } from './index.ts';
import { PRIMITIVE_PARAMETERS, type PrimitiveType } from '../../grammars/primitives.ts';
import type { DecorativeTechnique } from '../../../types/decoration.ts';
import { SLOT_PATTERN } from '../../../engine/generation/prose.ts';
import { generateArtefact, sampleWorld } from '../../../../../scripts/dev/shared.ts';
import type { MockWorldRegion } from '../../../../../tests/fixtures/world.ts';

/** Keyed by `PrimitiveType` so the compiler flags a missing entry when the union gains a member. */
const ALL_PRIMITIVES_RECORD: Record<PrimitiveType, true> = {
	'elongated': true,
	'cylindrical': true,
	'flat-broad': true,
	'hollow-enclosed': true,
	'ring-form': true,
	'disc-form': true,
	'bar-form': true,
	'sheet-form': true,
};
const ALL_PRIMITIVES = Object.keys(ALL_PRIMITIVES_RECORD) as PrimitiveType[];

/** Keyed by `DecorativeTechnique` so the compiler flags a missing entry when the union gains a member. */
const ALL_TECHNIQUES_RECORD: Record<DecorativeTechnique, true> = {
	polish: true,
	patina: true,
	roughening: true,
	scoring: true,
	engraving: true,
	relief: true,
	painting: true,
	glaze: true,
	inlay: true,
	overlay: true,
	studs: true,
	'wire-wrapping': true,
	gilding: true,
	wrapping: true,
	tassels: true,
	beading: true,
};
const ALL_TECHNIQUES = Object.keys(ALL_TECHNIQUES_RECORD) as DecorativeTechnique[];

/** `property` ids extracted from `#slot#`/`#slot.a#` occurrences in a template string. */
function slotsIn(template: string): string[] {
	const matches = [...template.matchAll(SLOT_PATTERN)];
	return matches.map((m) => m[1]);
}

Deno.test('interpretive: every primitive parameter has at least one template', () => {
	for (const primitive of ALL_PRIMITIVES) {
		const parameters = Object.keys(PRIMITIVE_PARAMETERS[primitive]);
		for (const parameter of parameters) {
			const id = `${primitive}.${parameter}`;
			const found = INTERPRETIVE_TEMPLATES.some((t) => t.property === id);
			assert(found, `missing template for ${id}`);
		}
	}
});

Deno.test('interpretive: every decorative technique has at least one template', () => {
	for (const technique of ALL_TECHNIQUES) {
		const id = `decoration.${technique}`;
		const found = INTERPRETIVE_TEMPLATES.some((t) => t.property === id);
		assert(found, `missing template for ${id}`);
	}
});

Deno.test('interpretive: property ids resolve to a real primitive.parameter or decoration.technique', () => {
	for (const { property } of INTERPRETIVE_TEMPLATES) {
		if (property.startsWith('decoration.')) {
			const [, technique] = property.split('.');
			assert(
				(ALL_TECHNIQUES as readonly string[]).includes(technique),
				`${property}: '${technique}' is not a DecorativeTechnique`,
			);
			continue;
		}

		const [primitive, parameter] = property.split('.');
		assert(
			(ALL_PRIMITIVES as readonly string[]).includes(primitive),
			`${property}: '${primitive}' is not a PrimitiveType`,
		);
		const parameters = PRIMITIVE_PARAMETERS[primitive as PrimitiveType] as Record<
			string,
			readonly string[]
		>;
		assert(
			parameter in parameters,
			`${property}: '${parameter}' is not a parameter of '${primitive}'`,
		);
	}
});

Deno.test('interpretive: every slot referenced in a template resolves to a real parameter', () => {
	for (const { property, variants } of INTERPRETIVE_TEMPLATES) {
		const [primitive, parameter] = property.split('.');
		const isDecoration = primitive === 'decoration';

		for (const variant of variants) {
			for (const slot of slotsIn(variant.template)) {
				if (isDecoration) {
					assert(
						slot === 'motifRef' || slot === 'material',
						`${property}: unexpected slot '#${slot}#'`,
					);
					continue;
				}
				assertEquals(
					slot,
					parameter,
					`${property}: slot '#${slot}#' does not match its own parameter`,
				);
			}
		}
	}
});

Deno.test('interpretive: every variant is register "interpretive" with non-empty emphasis', () => {
	for (const { property, variants } of INTERPRETIVE_TEMPLATES) {
		for (const variant of variants) {
			assertEquals(variant.register, 'interpretive', property);
			assert(variant.emphasis.length > 0, `${property}: emphasis must be non-empty`);
		}
	}
});

Deno.test('interpretive: no duplicate property ids', () => {
	const seen = new Set<string>();
	for (const { property } of INTERPRETIVE_TEMPLATES) {
		assert(!seen.has(property), `duplicate property id: ${property}`);
		seen.add(property);
	}
});

Deno.test('interpretive: every template has at least one variant with non-empty text', () => {
	for (const { property, variants } of INTERPRETIVE_TEMPLATES) {
		assert(variants.length > 0, property);
		for (const variant of variants) {
			assert(variant.template.trim().length > 0, property);
		}
	}
});

Deno.test('interpretive: conditioned variants precede unconditioned ones within a template', () => {
	for (const { property, variants } of INTERPRETIVE_TEMPLATES) {
		let sawUnconditioned = false;
		for (const variant of variants) {
			if (variant.condition?.values === undefined) {
				sawUnconditioned = true;
				continue;
			}
			assert(
				!sawUnconditioned,
				`${property}: a conditioned variant follows an unconditioned one — first-match-wins selection would never reach it`,
			);
		}
	}
});

Deno.test('interpretive: every condition.values entry is a real value of its own parameter', () => {
	for (const { property, variants } of INTERPRETIVE_TEMPLATES) {
		if (property.startsWith('decoration.')) continue;

		const [primitive, parameter] = property.split('.');
		const parameters = PRIMITIVE_PARAMETERS[primitive as PrimitiveType] as Record<
			string,
			readonly string[]
		>;
		const allowedValues = parameters[parameter];

		for (const variant of variants) {
			for (const value of variant.condition?.values ?? []) {
				assert(
					allowedValues.includes(value),
					`${property}: condition value '${value}' is not a value of '${parameter}'`,
				);
			}
		}
	}
});

// --- firing-frequency guard (2GN.91's warning against the 2GN.87 failure mode) ------------------
//
// A conditioned variant that never matches a generated artefact's value is dead data: authored,
// type-checked, but silently unreachable. Sample a real corpus across every world region and
// confirm each value-conditioned variant fires on at least one component somewhere in it.

const SAMPLE_REGIONS: readonly MockWorldRegion[] = [
	'riverValley',
	'highlandMine',
	'coastalPort',
	'forestInterior',
	'desertMargin',
	'steppeMargin',
];
const SAMPLES_PER_REGION = 60;

function sampleComponentProperties(): Map<string, string | number>[] {
	const properties: Map<string, string | number>[] = [];
	for (const region of SAMPLE_REGIONS) {
		const world = sampleWorld(region);
		for (let i = 0; i < SAMPLES_PER_REGION; i++) {
			const artefact = generateArtefact(`interpretive-firing-${region}-${i}`, world);
			for (const component of artefact.components) {
				properties.push(component.properties);
			}
		}
	}
	return properties;
}

Deno.test('interpretive: every value-conditioned variant fires on at least one sampled component', () => {
	const corpus = sampleComponentProperties();

	for (const { property, variants } of INTERPRETIVE_TEMPLATES) {
		if (property.startsWith('decoration.')) continue; // decoration templates need a DecorativeLayer corpus, not components

		const [, parameter] = property.split('.');

		for (const variant of variants) {
			const values = variant.condition?.values;
			if (values === undefined) continue;

			const fired = corpus.some((props) => {
				const raw = props.get(parameter);
				return raw !== undefined && values.includes(String(raw));
			});
			assert(
				fired,
				`${property}: condition ${
					JSON.stringify(values)
				} never matched a sampled component across ${
					SAMPLE_REGIONS.length * SAMPLES_PER_REGION
				} artefacts`,
			);
		}
	}
});

/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { OBSERVATIONAL_TEMPLATES } from './index.ts';
import { PRIMITIVE_PARAMETERS, type PrimitiveType } from '../../grammars/primitives.ts';
import type { DecorativeTechnique } from '../../../types/decoration.ts';

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
	const matches = [...template.matchAll(/#([a-zA-Z][\w-]*?)(?:\.a)?#/g)];
	return matches.map((m) => m[1]);
}

Deno.test('observational: every primitive parameter has at least one template', () => {
	for (const primitive of ALL_PRIMITIVES) {
		const parameters = Object.keys(PRIMITIVE_PARAMETERS[primitive]);
		for (const parameter of parameters) {
			const id = `${primitive}.${parameter}`;
			const found = OBSERVATIONAL_TEMPLATES.some((t) => t.property === id);
			assert(found, `missing template for ${id}`);
		}
	}
});

Deno.test('observational: every decorative technique has at least one template', () => {
	for (const technique of ALL_TECHNIQUES) {
		const id = `decoration.${technique}`;
		const found = OBSERVATIONAL_TEMPLATES.some((t) => t.property === id);
		assert(found, `missing template for ${id}`);
	}
});

Deno.test('observational: property ids resolve to a real primitive.parameter or decoration.technique', () => {
	for (const { property } of OBSERVATIONAL_TEMPLATES) {
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

Deno.test('observational: every slot referenced in a template resolves to a real parameter', () => {
	for (const { property, variants } of OBSERVATIONAL_TEMPLATES) {
		const [primitive, parameter] = property.split('.');
		const isDecoration = primitive === 'decoration';

		for (const variant of variants) {
			for (const slot of slotsIn(variant.template)) {
				if (isDecoration) {
					// Decoration templates reference `motifRef`/`material`, DecorativeLayer's own
					// optional fields, not a primitive parameter.
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

Deno.test('observational: every variant is register "observational" with empty emphasis', () => {
	for (const { property, variants } of OBSERVATIONAL_TEMPLATES) {
		for (const variant of variants) {
			assertEquals(variant.register, 'observational', property);
			assertEquals(variant.emphasis, [], property);
		}
	}
});

Deno.test('observational: no duplicate property ids', () => {
	const seen = new Set<string>();
	for (const { property } of OBSERVATIONAL_TEMPLATES) {
		assert(!seen.has(property), `duplicate property id: ${property}`);
		seen.add(property);
	}
});

Deno.test('observational: every template has at least one variant with non-empty text', () => {
	for (const { property, variants } of OBSERVATIONAL_TEMPLATES) {
		assert(variants.length > 0, property);
		for (const variant of variants) {
			assert(variant.template.trim().length > 0, property);
		}
	}
});

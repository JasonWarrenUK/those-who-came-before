/// <reference lib="deno.ns" />
import { assert, assertAlmostEquals, assertEquals, assertThrows } from '@std/assert';
import { phaseInfluence } from './grammar.ts';
import { CORE_GRAMMAR_RULES } from '../../data/grammars/core.ts';
import type { GrammarOption } from '../../types/grammar.ts';
import type { MaterialTag } from '../../types/tags.ts';
import { mockPhaseCharacteristics } from '../../../../tests/fixtures/culture.ts';

/** Builds a minimal grammar option; tests craft their own weights rather than using core.ts. */
function option(overrides: Partial<GrammarOption> = {}): GrammarOption {
	return {
		expandsTo: 'elongated',
		baseWeight: 1,
		culturalModifiers: new Map<MaterialTag, number>(),
		...overrides,
	};
}

Deno.test('phaseInfluence: absent phaseModifiers is neutral', () => {
	assertEquals(phaseInfluence(option(), mockPhaseCharacteristics()), 1);
});

Deno.test('phaseInfluence: empty phaseModifiers is neutral', () => {
	const subject = option({ phaseModifiers: new Map() });

	assertEquals(phaseInfluence(subject, mockPhaseCharacteristics()), 1);
});

Deno.test('phaseInfluence: lerps from neutral at attribute 0 to the full multiplier at 1', () => {
	const subject = option({ phaseModifiers: new Map([['technology.metallurgy', 1.6]]) });

	const atZero = phaseInfluence(
		subject,
		mockPhaseCharacteristics({ technology: { metallurgy: 0 } }),
	);
	const atHalf = phaseInfluence(
		subject,
		mockPhaseCharacteristics({ technology: { metallurgy: 0.5 } }),
	);
	const atOne = phaseInfluence(
		subject,
		mockPhaseCharacteristics({ technology: { metallurgy: 1 } }),
	);

	assertAlmostEquals(atZero, 1);
	assertAlmostEquals(atHalf, 1.3);
	assertAlmostEquals(atOne, 1.6);
});

Deno.test('phaseInfluence: multiple entries combine by product', () => {
	const subject = option({
		phaseModifiers: new Map([
			['technology.metallurgy', 1.5],
			['society.militarisation', 2],
		]),
	});
	const phase = mockPhaseCharacteristics({
		technology: { metallurgy: 1 },
		society: { militarisation: 1 },
	});

	assertAlmostEquals(phaseInfluence(subject, phase), 3);
});

Deno.test('phaseInfluence: a multiplier below 1 suppresses in proportion to the attribute', () => {
	const subject = option({ phaseModifiers: new Map([['aesthetics.formConservatism', 0.5]]) });

	const atOne = phaseInfluence(
		subject,
		mockPhaseCharacteristics({ aesthetics: { formConservatism: 1 } }),
	);
	const atZero = phaseInfluence(
		subject,
		mockPhaseCharacteristics({ aesthetics: { formConservatism: 0 } }),
	);

	assertAlmostEquals(atOne, 0.5);
	assertAlmostEquals(atZero, 1);
});

Deno.test('phaseInfluence: unknown dotted path throws', () => {
	const phase = mockPhaseCharacteristics();

	assertThrows(
		() => phaseInfluence(option({ phaseModifiers: new Map([['technology.alchemy', 1.5]]) }), phase),
		Error,
		'technology.alchemy',
	);
	assertThrows(
		() => phaseInfluence(option({ phaseModifiers: new Map([['technology', 1.5]]) }), phase),
		Error,
		'does not resolve to a number',
	);
});

Deno.test('phaseInfluence: every shipped phase modifier evaluates finite and positive', () => {
	const phase = mockPhaseCharacteristics();

	for (const rule of CORE_GRAMMAR_RULES) {
		for (const shipped of rule.options) {
			const factor = phaseInfluence(shipped, phase);

			assert(
				Number.isFinite(factor) && factor > 0,
				`option '${shipped.expandsTo}' of rule '${rule.symbol}' produced factor ${factor}`,
			);
		}
	}
});

/// <reference lib="deno.ns" />
import { assert, assertAlmostEquals, assertEquals, assertThrows } from '@std/assert';
import { phaseInfluence, selectGrammarOption } from './grammar.ts';
import { createPrng } from '../prng.ts';
import { CORE_GRAMMAR_RULES } from '../../data/grammars/core.ts';
import type { GrammarOption, GrammarRule } from '../../types/grammar.ts';
import type { MaterialTag } from '../../types/tags.ts';
import {
	mockCulturalProfile,
	mockPhaseCharacteristics,
} from '../../../../tests/fixtures/culture.ts';

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

/** Builds a crafted rule; tests never assert against core.ts's provisional weights. */
function rule(options: GrammarOption[]): GrammarRule {
	return { symbol: 'test-rule', options };
}

/** Counts how often each expandsTo symbol is drawn over `draws` selections. */
function tallySelections(
	subject: GrammarRule,
	culture: ReturnType<typeof mockCulturalProfile>,
	phase: ReturnType<typeof mockPhaseCharacteristics>,
	seed: string,
	draws: number,
): Map<string, number> {
	const prng = createPrng(seed);
	const tally = new Map<string, number>();

	for (let i = 0; i < draws; i++) {
		const picked = selectGrammarOption(subject, culture, phase, prng).expandsTo;
		tally.set(picked, (tally.get(picked) ?? 0) + 1);
	}

	return tally;
}

Deno.test('selectGrammarOption: same seed produces the same pick sequence', () => {
	const subject = rule([
		option({ expandsTo: 'a', baseWeight: 1 }),
		option({ expandsTo: 'b', baseWeight: 1 }),
		option({ expandsTo: 'c', baseWeight: 1 }),
	]);
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();

	const draw = (seed: string): string[] => {
		const prng = createPrng(seed);
		return Array.from(
			{ length: 20 },
			() => selectGrammarOption(subject, culture, phase, prng).expandsTo,
		);
	};

	assertEquals(draw('determinism-seed'), draw('determinism-seed'));
});

Deno.test('selectGrammarOption: material affinity shifts selection toward modified options', () => {
	const subject = rule([
		option({ expandsTo: 'plain', baseWeight: 1 }),
		option({
			expandsTo: 'metal-leaning',
			baseWeight: 1,
			culturalModifiers: new Map<MaterialTag, number>([['metal', 2]]),
		}),
	]);
	const phase = mockPhaseCharacteristics();
	const indifferent = mockCulturalProfile({ materialAffinities: new Map() });
	const metalworkers = mockCulturalProfile({
		materialAffinities: new Map<MaterialTag, number>([['metal', 2]]),
	});

	const draws = 1000;
	const baseline = tallySelections(subject, indifferent, phase, 'culture-shift', draws);
	const shifted = tallySelections(subject, metalworkers, phase, 'culture-shift', draws);

	// Baseline is 50/50; with affinity 2 × modifier 2 the metal option's weight is 5 vs 1 (~83%).
	const baselineShare = (baseline.get('metal-leaning') ?? 0) / draws;
	const shiftedShare = (shifted.get('metal-leaning') ?? 0) / draws;

	assert(
		Math.abs(baselineShare - 0.5) < 0.05,
		`indifferent culture drew metal-leaning at ${baselineShare}, expected ~0.5`,
	);
	assert(
		shiftedShare > 0.75,
		`metal-affine culture drew metal-leaning at ${shiftedShare}, expected > 0.75`,
	);
});

Deno.test('selectGrammarOption: phase characteristics shift selection multiplicatively', () => {
	const subject = rule([
		option({ expandsTo: 'plain', baseWeight: 1 }),
		option({
			expandsTo: 'phase-boosted',
			baseWeight: 1,
			phaseModifiers: new Map([['technology.metallurgy', 3]]),
		}),
	]);
	const culture = mockCulturalProfile({ materialAffinities: new Map() });

	const draws = 1000;
	const lowTech = tallySelections(
		subject,
		culture,
		mockPhaseCharacteristics({ technology: { metallurgy: 0 } }),
		'phase-shift',
		draws,
	);
	const highTech = tallySelections(
		subject,
		culture,
		mockPhaseCharacteristics({ technology: { metallurgy: 1 } }),
		'phase-shift',
		draws,
	);

	// Metallurgy 0 is neutral (50/50); metallurgy 1 triples the boosted weight (3 vs 1, 75%).
	const lowShare = (lowTech.get('phase-boosted') ?? 0) / draws;
	const highShare = (highTech.get('phase-boosted') ?? 0) / draws;

	assert(
		Math.abs(lowShare - 0.5) < 0.05,
		`metallurgy-0 phase drew phase-boosted at ${lowShare}, expected ~0.5`,
	);
	assert(
		highShare > 0.68,
		`metallurgy-1 phase drew phase-boosted at ${highShare}, expected ~0.75`,
	);
});

Deno.test('selectGrammarOption: the 0.01 floor keeps a suppressed option reachable', () => {
	// The suppressed option's raw weight is 1 + 2 × (−1) = −1, floored to 0.01 against a rival
	// weight of 10 — ~10 expected picks in 10 000 draws; at least one must appear.
	const subject = rule([
		option({ expandsTo: 'dominant', baseWeight: 10 }),
		option({
			expandsTo: 'suppressed',
			baseWeight: 1,
			culturalModifiers: new Map<MaterialTag, number>([['metal', -1]]),
		}),
	]);
	const culture = mockCulturalProfile({
		materialAffinities: new Map<MaterialTag, number>([['metal', 2]]),
	});
	const tally = tallySelections(subject, culture, mockPhaseCharacteristics(), 'floor-seed', 10000);

	assert(
		(tally.get('suppressed') ?? 0) >= 1,
		'floored option was never selected in 10 000 draws',
	);
});

Deno.test('selectGrammarOption: modifiers for absent affinities read as zero', () => {
	const subject = rule([
		option({ expandsTo: 'a', baseWeight: 1 }),
		option({
			expandsTo: 'b',
			baseWeight: 1,
			culturalModifiers: new Map<MaterialTag, number>([['glass', 5]]),
		}),
	]);
	const culture = mockCulturalProfile({ materialAffinities: new Map() }); // no glass affinity
	const tally = tallySelections(subject, culture, mockPhaseCharacteristics(), 'absent-tag', 1000);

	// With the modifier inert both options weigh 1 — the split should stay near 50/50.
	const share = (tally.get('b') ?? 0) / 1000;
	assert(Math.abs(share - 0.5) < 0.05, `option with inert modifier drew ${share}, expected ~0.5`);
});

Deno.test('selectGrammarOption: consumes exactly one draw per call', () => {
	const subject = rule([option({ expandsTo: 'only' })]);
	const inner = createPrng('draw-count');
	let calls = 0;
	const counting = (): number => {
		calls++;
		return inner();
	};

	const picked = selectGrammarOption(
		subject,
		mockCulturalProfile(),
		mockPhaseCharacteristics(),
		counting,
	);

	assertEquals(picked.expandsTo, 'only');
	assertEquals(calls, 1);
});

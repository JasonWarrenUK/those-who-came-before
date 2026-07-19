/// <reference lib="deno.ns" />
import {
	assert,
	assertAlmostEquals,
	assertEquals,
	assertNotEquals,
	assertThrows,
} from '@std/assert';
import {
	checkAccumulation,
	deriveComplexityBudget,
	deriveInspectionDepth,
	expandGrammar,
	normaliseArtefact,
	phaseInfluence,
	resolveComplexityTier,
	selectGrammarOption,
} from './grammar.ts';
import { createPrng } from '../prng.ts';
import { CORE_GRAMMAR_RULES } from '../../data/grammars/core.ts';
import { isPrimitiveType, PRIMITIVE_PARAMETERS } from '../../data/grammars/primitives.ts';
import type {
	AccumulationConstraints,
	ComponentGroupNode,
	ComponentNode,
	ExpandedObject,
	GrammarOption,
	GrammarRule,
} from '../../types/grammar.ts';
import { isAttachmentType } from '../../types/grammar.ts';
import type { MaterialTag } from '../../types/tags.ts';
import type { ObjectDimensions } from '../../types/artefact.ts';
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

Deno.test('phaseInfluence: non-finite or out-of-range resolved attribute throws', () => {
	for (
		const invalid of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -0.01, 1.01]
	) {
		const phase = mockPhaseCharacteristics({ technology: { metallurgy: invalid } });
		assertThrows(
			() =>
				phaseInfluence(
					option({ phaseModifiers: new Map([['technology.metallurgy', 1.5]]) }),
					phase,
				),
			Error,
			'must be in [0, 1]',
		);
	}
});

Deno.test('phaseInfluence: non-finite or non-positive multiplier throws', () => {
	const phase = mockPhaseCharacteristics({ technology: { metallurgy: 0.5 } });

	for (const invalid of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 0, -1]) {
		assertThrows(
			() =>
				phaseInfluence(
					option({ phaseModifiers: new Map([['technology.metallurgy', invalid]]) }),
					phase,
				),
			Error,
			'must be finite and positive',
		);
	}
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

Deno.test('resolveComplexityTier: boundary values promote to the higher tier', () => {
	assertEquals(resolveComplexityTier(0), 'simple');
	assertEquals(resolveComplexityTier(0.29), 'simple');
	assertEquals(resolveComplexityTier(0.3), 'moderate');
	assertEquals(resolveComplexityTier(0.59), 'moderate');
	assertEquals(resolveComplexityTier(0.6), 'sophisticated');
	assertEquals(resolveComplexityTier(1), 'sophisticated');
});

Deno.test('resolveComplexityTier: non-finite or out-of-range input throws', () => {
	for (const invalid of [Number.NaN, -0.01, 1.01, Number.POSITIVE_INFINITY]) {
		assertThrows(() => resolveComplexityTier(invalid), Error, 'must be in [0, 1]');
	}
});

Deno.test('deriveComplexityBudget: group caps follow the doc 05 §5.5 tiers', () => {
	assertEquals(deriveComplexityBudget(0.1).maxDistinctGroups, 2);
	assertEquals(deriveComplexityBudget(0.5).maxDistinctGroups, 3);
	assertEquals(deriveComplexityBudget(0.9).maxDistinctGroups, 4);
});

Deno.test('deriveComplexityBudget: pattern availability widens by tier', () => {
	const patternTypes = (craftSpecialisation: number): string[] =>
		deriveComplexityBudget(craftSpecialisation).patterns.map((pattern) => pattern.type);

	assertEquals(patternTypes(0.1), ['symmetric', 'linear-array']);
	assertEquals(patternTypes(0.5), ['symmetric', 'linear-array', 'radial', 'stacked']);
	assertEquals(patternTypes(0.9), [
		'symmetric',
		'linear-array',
		'radial',
		'stacked',
		'nested',
		'branching',
	]);

	// Spot-check the doc-cited example counts on the symmetric pattern (doc 05 §5.5).
	assertEquals(deriveComplexityBudget(0.1).patterns[0], {
		type: 'symmetric',
		validCounts: [2, 4, 6],
	});
});

Deno.test('deriveComplexityBudget: provisional per-group limits are monotone across tiers', () => {
	const simple = deriveComplexityBudget(0.1);
	const moderate = deriveComplexityBudget(0.5);
	const sophisticated = deriveComplexityBudget(0.9);

	// Relative assertions only — the exact values are provisional tuning numbers.
	assert(simple.maxComponentsPerGroup <= moderate.maxComponentsPerGroup);
	assert(moderate.maxComponentsPerGroup <= sophisticated.maxComponentsPerGroup);
	assertEquals(simple.noTwoGroupsSameType, true);
	assertEquals(sophisticated.noTwoGroupsSameType, false);
});

Deno.test('deriveComplexityBudget: every call returns fresh mutable-safe objects', () => {
	const first = deriveComplexityBudget(0.9);
	first.patterns.pop();
	const firstSymmetric = first.patterns[0];
	assert(firstSymmetric.type === 'symmetric');
	firstSymmetric.validCounts.push(99);

	const second = deriveComplexityBudget(0.9);
	assertEquals(second.patterns.length, 6);
	const secondSymmetric = second.patterns[0];
	assert(secondSymmetric.type === 'symmetric');
	assertEquals(secondSymmetric.validCounts, [2, 4, 6]);
});

/** Walks a group tree, applying `visit` to every group and tracking recursion depth. */
function walkGroups(
	groups: ComponentGroupNode[],
	visit: (group: ComponentGroupNode, depth: number) => void,
	depth = 0,
): void {
	for (const group of groups) {
		visit(group, depth);
		walkGroups(group.attachments.map((branch) => branch.child), visit, depth + 1);
	}
}

Deno.test('expandGrammar: same seed produces the same tree', () => {
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();

	const expand = (): ReturnType<typeof expandGrammar> =>
		expandGrammar(CORE_GRAMMAR_RULES, culture, phase, createPrng('tree-determinism'));

	assertEquals(expand(), expand());
});

Deno.test('expandGrammar: different seeds diverge', () => {
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();

	const first = expandGrammar(CORE_GRAMMAR_RULES, culture, phase, createPrng('seed-alpha'));
	const second = expandGrammar(CORE_GRAMMAR_RULES, culture, phase, createPrng('seed-beta'));

	assertNotEquals(first, second);
});

Deno.test('expandGrammar: trees are structurally valid across seeds', () => {
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics();

	for (let i = 0; i < 200; i++) {
		const tree = expandGrammar(CORE_GRAMMAR_RULES, culture, phase, createPrng(`validity-${i}`));

		assert(tree.groups.length >= 1, 'object must expand to at least one component group');

		walkGroups(tree.groups, (group) => {
			const { primitiveType, properties } = group.primary;

			assert(isPrimitiveType(primitiveType), `unknown primitive '${primitiveType}'`);

			const parameters = PRIMITIVE_PARAMETERS[primitiveType as keyof typeof PRIMITIVE_PARAMETERS];
			assertEquals(
				[...properties.keys()],
				Object.keys(parameters),
				`property keys for '${primitiveType}' must match the registry's parameters in order`,
			);
			for (const [parameter, value] of properties) {
				const allowed = parameters[parameter as keyof typeof parameters] as readonly string[];
				assert(
					allowed.includes(value),
					`value '${value}' not in '${primitiveType}.${parameter}' value list`,
				);
			}

			for (const branch of group.attachments) {
				assert(isAttachmentType(branch.type), `unknown attachment type '${branch.type}'`);
			}
		});
	}
});

Deno.test('expandGrammar: complexity budget bounds group count per tier across seeds', () => {
	const culture = mockCulturalProfile();
	const tiers: [craftSpecialisation: number, minGroups: number, maxGroups: number][] = [
		[0.1, 1, 2],
		[0.5, 2, 3],
		[0.9, 3, 4],
	];

	for (const [craftSpecialisation, minGroups, maxGroups] of tiers) {
		const phase = mockPhaseCharacteristics({ society: { craftSpecialisation } });

		for (let i = 0; i < 500; i++) {
			const tree = expandGrammar(CORE_GRAMMAR_RULES, culture, phase, createPrng(`caps-${i}`));

			assert(
				tree.groups.length >= minGroups,
				`craftSpecialisation ${craftSpecialisation} grew ${tree.groups.length} groups, floor is ${minGroups}`,
			);
			assert(
				tree.groups.length <= maxGroups,
				`craftSpecialisation ${craftSpecialisation} grew ${tree.groups.length} groups, cap is ${maxGroups}`,
			);

			walkGroups(tree.groups, (group, depth) => {
				assert(depth <= 3, `attachment recursion reached depth ${depth}, cap is 3`);
				assert(
					group.attachments.length <= 2,
					`group carries ${group.attachments.length} attachments, cap is 2`,
				);
			});
		}
	}
});

Deno.test('expandGrammar: craftSpecialisation shifts the group-count distribution', () => {
	const culture = mockCulturalProfile();
	const runs = 1000;

	const tally = (craftSpecialisation: number) => {
		const phase = mockPhaseCharacteristics({ society: { craftSpecialisation } });
		let singleGroup = 0;
		let multiGroup = 0;
		let withAttachments = 0;

		for (let i = 0; i < runs; i++) {
			const tree = expandGrammar(CORE_GRAMMAR_RULES, culture, phase, createPrng(`dist-${i}`));

			if (tree.groups.length === 1) singleGroup++;
			else multiGroup++;

			let attachmentCount = 0;
			walkGroups(tree.groups, (group) => {
				attachmentCount += group.attachments.length;
			});
			if (attachmentCount > 0) withAttachments++;
		}

		return { singleGroup, multiGroup, withAttachments };
	};

	const simple = tally(0.1);
	const sophisticated = tally(0.9);

	// Ordering assertions only — the per-tier continuation probabilities are provisional tuning
	// values, so the test pins the mechanism (more specialisation → more groups), not the numbers.
	assert(
		simple.singleGroup > sophisticated.singleGroup,
		`single-group count should fall with craftSpecialisation: ` +
			`simple ${simple.singleGroup} vs sophisticated ${sophisticated.singleGroup}`,
	);
	assert(
		sophisticated.multiGroup > 0,
		'no multi-group tree in 1 000 sophisticated runs — group repetition never fired',
	);
	assert(
		simple.withAttachments > 0,
		'no attachments in 1 000 runs — the chain slot never filled',
	);
});

Deno.test('expandGrammar: missing object rule throws', () => {
	const withoutObject = CORE_GRAMMAR_RULES.filter((grammarRule) => grammarRule.symbol !== 'object');

	assertThrows(
		() =>
			expandGrammar(
				withoutObject,
				mockCulturalProfile(),
				mockPhaseCharacteristics(),
				createPrng('missing-object'),
			),
		Error,
		"no rule for symbol 'object'",
	);
});

Deno.test('expandGrammar: unknown expandsTo throws', () => {
	const malformed: GrammarRule[] = [
		{ symbol: 'object', options: [option({ expandsTo: 'component-group' })] },
		{ symbol: 'component-group', options: [option({ expandsTo: 'levitating-orb' })] },
	];

	assertThrows(
		() =>
			expandGrammar(
				malformed,
				mockCulturalProfile(),
				mockPhaseCharacteristics(),
				createPrng('unknown-symbol'),
			),
		Error,
		"unknown grammar symbol 'levitating-orb'",
	);
});

Deno.test('expandGrammar: rule cycles throw instead of overflowing the stack', () => {
	const cyclic: GrammarRule[] = [
		{ symbol: 'object', options: [option({ expandsTo: 'component-group' })] },
		{ symbol: 'component-group', options: [option({ expandsTo: 'loop-a' })] },
		{ symbol: 'loop-a', options: [option({ expandsTo: 'loop-b' })] },
		{ symbol: 'loop-b', options: [option({ expandsTo: 'loop-a' })] },
	];

	assertThrows(
		() =>
			expandGrammar(
				cyclic,
				mockCulturalProfile(),
				mockPhaseCharacteristics(),
				createPrng('rule-cycle'),
			),
		Error,
		'rule cycle detected',
	);
});

Deno.test('expandGrammar: non-attachment terminal in the attachment slot throws', () => {
	// An attachment rule whose option expands to a primitive id, not a join terminal. The
	// attachment slot fills probabilistically, so scan seeds until the draw path reaches it.
	const malformed: GrammarRule[] = [
		{ symbol: 'object', options: [option({ expandsTo: 'component-group' })] },
		{ symbol: 'component-group', options: [option({ expandsTo: 'elongated' })] },
		{ symbol: 'attachment', options: [option({ expandsTo: 'elongated' })] },
	];

	let threw = false;
	for (let i = 0; i < 50 && !threw; i++) {
		try {
			expandGrammar(
				malformed,
				mockCulturalProfile(),
				mockPhaseCharacteristics(),
				createPrng(`bad-attachment-${i}`),
			);
		} catch (error) {
			threw = true;
			assert(
				error instanceof Error &&
					error.message.includes('non-attachment terminal'),
				`unexpected error: ${error}`,
			);
		}
	}

	assert(threw, 'no seed in 50 reached the attachment slot — cannot verify the guard');
});

Deno.test('expandGrammar: material affinity biases primary selection end to end', () => {
	const phase = mockPhaseCharacteristics();
	const indifferent = mockCulturalProfile({ materialAffinities: new Map() });
	const metalworkers = mockCulturalProfile({
		materialAffinities: new Map<MaterialTag, number>([['metal', 3]]),
	});

	const runs = 1000;
	const countMetalLeaning = (culture: ReturnType<typeof mockCulturalProfile>): number => {
		let count = 0;
		for (let i = 0; i < runs; i++) {
			const tree = expandGrammar(CORE_GRAMMAR_RULES, culture, phase, createPrng(`bias-${i}`));
			walkGroups(tree.groups, (group) => {
				if (
					group.primary.primitiveType === 'elongated' ||
					group.primary.primitiveType === 'bar-form'
				) {
					count++;
				}
			});
		}
		return count;
	};

	const baseline = countMetalLeaning(indifferent);
	const shifted = countMetalLeaning(metalworkers);

	assert(
		shifted > baseline,
		`metal-affine culture produced ${shifted} metal-leaning primaries vs baseline ${baseline}`,
	);
});

/** Builds a bare component; accumulation checking reads only the primitive type. */
function component(primitiveType: string): ComponentNode {
	return { primitiveType, properties: new Map() };
}

/** Builds a top-level group: a primary with childless child groups attached directly to it. */
function group(primaryType: string, attachedTypes: string[] = []): ComponentGroupNode {
	return {
		primary: component(primaryType),
		attachments: attachedTypes.map((attachedType) => ({
			type: 'inline' as const,
			child: { primary: component(attachedType), attachments: [] },
		})),
	};
}

/** Builds crafted constraints; tests never assert against the provisional tier numbers. */
function accumulation(
	overrides: Partial<AccumulationConstraints> = {},
): AccumulationConstraints {
	return {
		maxDistinctGroups: 4,
		maxComponentsPerGroup: 12,
		noTwoGroupsSameType: false,
		patterns: [
			{ type: 'symmetric', validCounts: [2, 4, 6] },
			{ type: 'linear-array', countRange: [2, 8] },
		],
		...overrides,
	};
}

Deno.test('checkAccumulation: an object without repetition passes', () => {
	const subject = { groups: [group('elongated', ['disc-form']), group('hollow-enclosed')] };

	assertEquals(checkAccumulation(subject, accumulation()), { valid: true, failures: [] });
});

Deno.test('checkAccumulation: symmetric admits exact counts only', () => {
	const patterns = accumulation({
		patterns: [{ type: 'symmetric', validCounts: [2, 4, 6] }],
	});

	const admitted = { groups: [group('elongated', ['disc-form', 'disc-form'])] }; // 2 discs
	assertEquals(checkAccumulation(admitted, patterns).valid, true);

	const rejected = { groups: [group('elongated', ['disc-form', 'disc-form', 'disc-form'])] }; // 3
	const verdict = checkAccumulation(rejected, patterns);
	assertEquals(verdict.valid, false);
	assertEquals(verdict.failures.length, 1);
	assert(
		verdict.failures[0].includes("3 'disc-form'") &&
			verdict.failures[0].includes('fits no available pattern'),
		`unexpected failure message: ${verdict.failures[0]}`,
	);
});

Deno.test('checkAccumulation: range patterns are inclusive of both bounds', () => {
	const patterns = accumulation({
		patterns: [{ type: 'stacked', countRange: [2, 5] }],
	});
	const stacked = (count: number) => ({
		groups: [group('elongated', Array.from({ length: count }, () => 'ring-form'))],
	});

	assertEquals(checkAccumulation(stacked(2), patterns).valid, true);
	assertEquals(checkAccumulation(stacked(5), patterns).valid, true);
	assertEquals(checkAccumulation(stacked(6), patterns).valid, false);
});

Deno.test('checkAccumulation: an admissible repetition still fails when it exceeds maxComponentsPerGroup', () => {
	const subject = {
		groups: [group('elongated', ['disc-form', 'disc-form', 'disc-form', 'disc-form', 'disc-form'])],
	};
	const verdict = checkAccumulation(
		subject,
		accumulation({
			maxComponentsPerGroup: 4,
			patterns: [{ type: 'linear-array', countRange: [2, 8] }], // admits 5
		}),
	);

	assertEquals(verdict.valid, false);
	assertEquals(verdict.failures.length, 1);
	assert(
		verdict.failures[0].includes('maxComponentsPerGroup 4'),
		`unexpected failure message: ${verdict.failures[0]}`,
	);
});

Deno.test('checkAccumulation: arrangements never pool across top-level groups', () => {
	// Each group carries two disc-forms; pooling to four would violate the [2]-only allow-list.
	const subject = {
		groups: [
			group('elongated', ['disc-form', 'disc-form']),
			group('hollow-enclosed', ['disc-form', 'disc-form']),
		],
	};
	const verdict = checkAccumulation(
		subject,
		accumulation({ patterns: [{ type: 'symmetric', validCounts: [2] }] }),
	);

	assertEquals(verdict, { valid: true, failures: [] });
});

Deno.test('checkAccumulation: counting spans the primary and nested attachment descendants', () => {
	// Two disc-forms at different depths of one top-level group form one arrangement of 2.
	const nested: ComponentGroupNode = {
		primary: component('elongated'),
		attachments: [{
			type: 'socketed',
			child: {
				primary: component('disc-form'),
				attachments: [{
					type: 'inline',
					child: { primary: component('disc-form'), attachments: [] },
				}],
			},
		}],
	};

	const admitsPairs = accumulation({ patterns: [{ type: 'symmetric', validCounts: [2] }] });
	assertEquals(checkAccumulation({ groups: [nested] }, admitsPairs).valid, true);

	const admitsTriplesOnly = accumulation({ patterns: [{ type: 'symmetric', validCounts: [3] }] });
	assertEquals(checkAccumulation({ groups: [nested] }, admitsTriplesOnly).valid, false);
});

Deno.test('checkAccumulation: noTwoGroupsSameType rejects same-type arrangements in two groups', () => {
	const subject = {
		groups: [
			group('elongated', ['disc-form', 'disc-form']),
			group('hollow-enclosed', ['disc-form', 'disc-form']),
		],
	};

	assertEquals(checkAccumulation(subject, accumulation()).valid, true);

	const verdict = checkAccumulation(subject, accumulation({ noTwoGroupsSameType: true }));
	assertEquals(verdict.valid, false);
	assertEquals(verdict.failures.length, 1);
	assert(
		verdict.failures[0].includes('noTwoGroupsSameType') &&
			verdict.failures[0].includes("'disc-form'"),
		`unexpected failure message: ${verdict.failures[0]}`,
	);
});

Deno.test('checkAccumulation: same-type singles across groups never trigger noTwoGroupsSameType', () => {
	// Both groups contain one ring-form; a single component is not an arrangement.
	const subject = {
		groups: [group('elongated', ['ring-form']), group('hollow-enclosed', ['ring-form'])],
	};

	assertEquals(
		checkAccumulation(subject, accumulation({ noTwoGroupsSameType: true })),
		{ valid: true, failures: [] },
	);
});

Deno.test('checkAccumulation: too many top-level groups fails the defensive group-count check', () => {
	const subject = { groups: [group('elongated'), group('disc-form'), group('ring-form')] };
	const verdict = checkAccumulation(subject, accumulation({ maxDistinctGroups: 2 }));

	assertEquals(verdict.valid, false);
	assertEquals(verdict.failures.length, 1);
	assert(
		verdict.failures[0].includes('maxDistinctGroups 2'),
		`unexpected failure message: ${verdict.failures[0]}`,
	);
});

Deno.test('checkAccumulation: simultaneous violations are all reported', () => {
	// Two groups against a cap of one; five disc-forms exceed the per-group cap of four and fit
	// no pattern under a pairs-only allow-list — three distinct failures.
	const subject = {
		groups: [
			group('elongated', ['disc-form', 'disc-form', 'disc-form', 'disc-form', 'disc-form']),
			group('hollow-enclosed'),
		],
	};
	const verdict = checkAccumulation(
		subject,
		accumulation({
			maxDistinctGroups: 1,
			maxComponentsPerGroup: 4,
			patterns: [{ type: 'symmetric', validCounts: [2] }],
		}),
	);

	assertEquals(verdict.valid, false);
	assertEquals(verdict.failures.length, 3);
});

Deno.test('checkAccumulation: is pure — same verdict on repeat calls, inputs unmutated', () => {
	const subject = {
		groups: [
			group('elongated', ['disc-form', 'disc-form', 'disc-form']),
			group('hollow-enclosed'),
		],
	};
	const constraints = accumulation({ noTwoGroupsSameType: true });
	const subjectSnapshot = structuredClone(subject);
	const constraintsSnapshot = structuredClone(constraints);

	const first = checkAccumulation(subject, constraints);
	const second = checkAccumulation(subject, constraints);

	assertEquals(first, second);
	assertEquals(subject, subjectSnapshot);
	assertEquals(constraints, constraintsSnapshot);
});

Deno.test('checkAccumulation: expanded trees mostly satisfy their own derived budget', () => {
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics({ society: { craftSpecialisation: 0.5 } });
	const budget = deriveComplexityBudget(0.5);

	const runs = 500;
	let passes = 0;
	for (let i = 0; i < runs; i++) {
		const tree = expandGrammar(CORE_GRAMMAR_RULES, culture, phase, createPrng(`accumulation-${i}`));
		if (checkAccumulation(tree, budget).valid) passes++;
	}

	// Expansion can legitimately produce trees the checker rejects — that's what the re-expansion
	// loop (2GN.16) is for — but a majority must pass or generation would thrash. Loose bound; the
	// exact rate depends on provisional tuning numbers.
	assert(passes > runs / 2, `only ${passes}/${runs} moderate-tier trees passed their own budget`);
});

// --- normaliseArtefact / deriveInspectionDepth (roadmap 2GN.8) ---------------------------------

/** Builds a bare component with size properties set, for dimension-derivation tests. */
function sizedComponent(
	primitiveType: string,
	properties: Record<string, string> = {},
): ComponentNode {
	return { primitiveType, properties: new Map(Object.entries(properties)) };
}

/** Builds a top-level group whose primary and directly-attached children carry size properties. */
function sizedGroup(
	primary: ComponentNode,
	attachments: Array<{ type: string; child: ComponentNode }> = [],
): ComponentGroupNode {
	return {
		primary,
		attachments: attachments.map(({ type, child }) => ({
			type: type as ComponentGroupNode['attachments'][number]['type'],
			child: { primary: child, attachments: [] },
		})),
	};
}

/** Ordinal index for comparing provisional mass bands without asserting exact thresholds. */
function massRank(mass: ObjectDimensions['mass']): number {
	return ['negligible', 'light', 'moderate', 'heavy', 'very-heavy'].indexOf(mass);
}

/** Ordinal index for comparing provisional portability bands without asserting exact thresholds. */
function portabilityRank(portability: ReturnType<typeof normaliseArtefact>['portability']): number {
	return ['pocketable', 'one-hand', 'two-hand', 'team-lift', 'major-effort'].indexOf(portability);
}

function dimensionsOf(primaryExtent: number, secondaryExtent: number): ObjectDimensions {
	return { primaryExtent, secondaryExtent, mass: 'negligible' };
}

Deno.test('normaliseArtefact: same input produces the same output', () => {
	const object: ExpandedObject = {
		groups: [
			sizedGroup(component('elongated'), [{ type: 'inline', child: component('disc-form') }]),
		],
	};

	const first = normaliseArtefact(object, 'artefact-1');
	const second = normaliseArtefact(object, 'artefact-1');

	assertEquals(first, second);
});

Deno.test('normaliseArtefact: does not mutate the input tree', () => {
	const object: ExpandedObject = {
		groups: [
			sizedGroup(component('elongated'), [{ type: 'inline', child: component('disc-form') }]),
		],
	};
	const snapshot = structuredClone(object);

	normaliseArtefact(object, 'artefact-1');

	assertEquals(object, snapshot);
});

Deno.test('normaliseArtefact: flattens depth-first, primary before attachments', () => {
	const object: ExpandedObject = {
		groups: [
			sizedGroup(component('elongated'), [{ type: 'inline', child: component('disc-form') }]),
			sizedGroup(component('ring-form')),
		],
	};

	const result = normaliseArtefact(object, 'artefact-1');

	assertEquals(result.components.map((c) => c.primitiveType), [
		'elongated',
		'disc-form',
		'ring-form',
	]);
});

Deno.test('normaliseArtefact: position is a 0..n-1 sequence matching traversal order', () => {
	const object: ExpandedObject = {
		groups: [
			sizedGroup(component('elongated'), [{ type: 'inline', child: component('disc-form') }]),
		],
	};

	const result = normaliseArtefact(object, 'artefact-1');

	assertEquals(result.components.map((c) => c.position), [0, 1]);
});

Deno.test('normaliseArtefact: component ids are deterministic positional strings', () => {
	const object: ExpandedObject = {
		groups: [
			sizedGroup(component('elongated'), [{ type: 'inline', child: component('disc-form') }]),
		],
	};

	const result = normaliseArtefact(object, 'artefact-1');
	assertEquals(result.components.map((c) => c.id), ['artefact-1-c0', 'artefact-1-c1']);

	const renamed = normaliseArtefact(object, 'artefact-2');
	assertEquals(renamed.components.map((c) => c.id), ['artefact-2-c0', 'artefact-2-c1']);
});

Deno.test('normaliseArtefact: component count matches tree node count', () => {
	const object: ExpandedObject = {
		groups: [
			sizedGroup(component('elongated'), [{ type: 'inline', child: component('disc-form') }]),
			sizedGroup(component('ring-form'), [{ type: 'socketed', child: component('bar-form') }]),
		],
	};

	const result = normaliseArtefact(object, 'artefact-1');

	assertEquals(result.components.length, 4);
});

Deno.test('normaliseArtefact: each attachment links parent primary to child primary with the branch type', () => {
	const object: ExpandedObject = {
		groups: [
			sizedGroup(component('elongated'), [{ type: 'riveted', child: component('disc-form') }]),
		],
	};

	const result = normaliseArtefact(object, 'artefact-1');
	const [primary, child] = result.components;

	assertEquals(result.attachments, [
		{ fromComponentId: primary.id, toComponentId: child.id, type: 'riveted' },
	]);
});

Deno.test('normaliseArtefact: a deep attachment chain preserves each link', () => {
	// elongated -[inline]-> cylindrical -[socketed]-> disc-form
	const object: ExpandedObject = {
		groups: [{
			primary: component('elongated'),
			attachments: [{
				type: 'inline',
				child: {
					primary: component('cylindrical'),
					attachments: [{
						type: 'socketed',
						child: { primary: component('disc-form'), attachments: [] },
					}],
				},
			}],
		}],
	};

	const result = normaliseArtefact(object, 'artefact-1');
	const [elongated, cylindrical, disc] = result.components;

	assertEquals(result.attachments, [
		{ fromComponentId: cylindrical.id, toComponentId: disc.id, type: 'socketed' },
		{ fromComponentId: elongated.id, toComponentId: cylindrical.id, type: 'inline' },
	]);
});

Deno.test('normaliseArtefact: attachment count matches branch count', () => {
	const object: ExpandedObject = {
		groups: [
			sizedGroup(component('elongated'), [{ type: 'inline', child: component('disc-form') }]),
			sizedGroup(component('ring-form'), [{ type: 'socketed', child: component('bar-form') }]),
		],
	};

	const result = normaliseArtefact(object, 'artefact-1');

	assertEquals(result.attachments.length, 2);
});

Deno.test('normaliseArtefact: allowedMaterialTags is stubbed empty (roadmap 2GN.10)', () => {
	const object: ExpandedObject = {
		groups: [
			sizedGroup(component('elongated'), [{ type: 'inline', child: component('disc-form') }]),
		],
	};

	const result = normaliseArtefact(object, 'artefact-1');

	for (const c of result.components) {
		assertEquals(c.allowedMaterialTags, []);
	}
});

Deno.test('normaliseArtefact: arrangementGroup is omitted (roadmap 2GN.67)', () => {
	const object: ExpandedObject = {
		groups: [
			sizedGroup(component('elongated'), [{ type: 'inline', child: component('disc-form') }]),
		],
	};

	const result = normaliseArtefact(object, 'artefact-1');

	for (const c of result.components) {
		assertEquals(c.arrangementGroup, undefined);
	}
});

Deno.test('normaliseArtefact: properties are copied, not aliased', () => {
	const source = sizedComponent('elongated', { length: 'long' });
	const object: ExpandedObject = { groups: [{ primary: source, attachments: [] }] };

	const result = normaliseArtefact(object, 'artefact-1');
	source.properties.set('length', 'short');

	assertEquals(result.components[0].properties.get('length'), 'long');
});

Deno.test('normaliseArtefact: dimensions grow monotonically across size bands', () => {
	const extentFor = (length: string) =>
		normaliseArtefact({
			groups: [{ primary: sizedComponent('elongated', { length }), attachments: [] }],
		}, 'a')
			.dimensions.primaryExtent;

	const short = extentFor('short');
	const medium = extentFor('medium');
	const long = extentFor('long');

	assert(short < medium, `expected short (${short}) < medium (${medium})`);
	assert(medium < long, `expected medium (${medium}) < long (${long})`);
});

Deno.test('normaliseArtefact: mass band is monotone in size', () => {
	const massFor = (length: string) =>
		normaliseArtefact({
			groups: [{ primary: sizedComponent('elongated', { length }), attachments: [] }],
		}, 'a')
			.dimensions.mass;

	assert(massRank(massFor('short')) <= massRank(massFor('medium')));
	assert(massRank(massFor('medium')) <= massRank(massFor('long')));
});

Deno.test('deriveInspectionDepth: boundary cases match doc 05 §5.2 verbatim', () => {
	assertEquals(deriveInspectionDepth(dimensionsOf(30, 0)), 'full');
	assertEquals(deriveInspectionDepth(dimensionsOf(31, 0)), 'detailed');
	assertEquals(deriveInspectionDepth(dimensionsOf(150, 0)), 'detailed');
	assertEquals(deriveInspectionDepth(dimensionsOf(151, 0)), 'observational');
});

Deno.test('deriveInspectionDepth: uses the larger of the two extents', () => {
	assertEquals(deriveInspectionDepth(dimensionsOf(10, 200)), 'observational');
});

Deno.test('normaliseArtefact: portability never improves as size and mass grow', () => {
	const portabilityFor = (length: string) =>
		normaliseArtefact({
			groups: [{ primary: sizedComponent('elongated', { length }), attachments: [] }],
		}, 'a')
			.portability;

	const short = portabilityRank(portabilityFor('short'));
	const medium = portabilityRank(portabilityFor('medium'));
	const long = portabilityRank(portabilityFor('long'));

	assert(short <= medium, `expected short rank (${short}) <= medium rank (${medium})`);
	assert(medium <= long, `expected medium rank (${medium}) <= long rank (${long})`);
});

Deno.test('normaliseArtefact: a single-component object has no attachments', () => {
	const object: ExpandedObject = { groups: [{ primary: component('ring-form'), attachments: [] }] };

	const result = normaliseArtefact(object, 'artefact-1');

	assertEquals(result.components.length, 1);
	assertEquals(result.attachments, []);
	assert(result.dimensions.primaryExtent > 0);
});

Deno.test('normaliseArtefact: multiple top-level groups flatten in group order then within-group', () => {
	const object: ExpandedObject = {
		groups: [
			sizedGroup(component('elongated'), [{ type: 'inline', child: component('disc-form') }]),
			sizedGroup(component('ring-form'), [{ type: 'socketed', child: component('bar-form') }]),
		],
	};

	const result = normaliseArtefact(object, 'artefact-1');

	assertEquals(result.components.map((c) => c.primitiveType), [
		'elongated',
		'disc-form',
		'ring-form',
		'bar-form',
	]);
});

Deno.test('normaliseArtefact: an unrecognised primitive still yields finite dimensions', () => {
	const object: ExpandedObject = {
		groups: [{ primary: component('made-up-primitive'), attachments: [] }],
	};

	const result = normaliseArtefact(object, 'artefact-1');

	assert(Number.isFinite(result.dimensions.primaryExtent));
	assert(Number.isFinite(result.dimensions.secondaryExtent));
});

Deno.test('normaliseArtefact: accepts real expandGrammar output end to end', () => {
	const culture = mockCulturalProfile();
	const phase = mockPhaseCharacteristics({ society: { craftSpecialisation: 0.5 } });

	for (let i = 0; i < 20; i++) {
		const tree = expandGrammar(CORE_GRAMMAR_RULES, culture, phase, createPrng(`normalise-${i}`));
		const result = normaliseArtefact(tree, `artefact-${i}`);

		const ids = new Set(result.components.map((c) => c.id));
		assertEquals(ids.size, result.components.length, 'component ids must be unique');

		for (const attachment of result.attachments) {
			assert(
				ids.has(attachment.fromComponentId),
				'attachment.fromComponentId must reference a real component',
			);
			assert(
				ids.has(attachment.toComponentId),
				'attachment.toComponentId must reference a real component',
			);
		}
	}
});

/// <reference lib="deno.ns" />
import { assert, assertEquals } from '@std/assert';
import { CORE_GRAMMAR_RULES } from './core.ts';
import { isPrimitiveType, PRIMITIVE_TYPES } from './primitives.ts';
import type { AttachmentType } from '../../types/grammar.ts';
import type { MaterialTag } from '../../types/tags.ts';

/** The nine `<attachment>` terminals in union order — typed so the compiler catches drift. */
const ATTACHMENT_TYPES: AttachmentType[] = [
	'inline',
	'perpendicular',
	'socketed',
	'riveted',
	'wrapped',
	'lashed',
	'hinged',
	'threaded',
	'friction-fit',
];

/** The ten material tags — typed so the compiler catches drift against `MaterialTag`. */
const MATERIAL_TAGS: MaterialTag[] = [
	'bone',
	'wood',
	'stone',
	'metal',
	'clay',
	'glass',
	'fiber',
	'leather',
	'precious-stone',
	'precious-metal',
];

/** Dotted `PhaseCharacteristics` paths the data is permitted to key `phaseModifiers` on. */
const PHASE_PATHS = [
	'technology.metallurgy',
	'technology.ceramics',
	'technology.textiles',
	'technology.stoneWorking',
	'technology.glassWorking',
	'technology.woodWorking',
];

function ruleBySymbol(symbol: string) {
	const rule = CORE_GRAMMAR_RULES.find((r) => r.symbol === symbol);
	assert(rule, `no rule for symbol '${symbol}'`);
	return rule;
}

Deno.test('rules: contains exactly the four doc 05 §5.3 non-terminals in BNF order', () => {
	assertEquals(CORE_GRAMMAR_RULES.map((r) => r.symbol), [
		'object',
		'component-group',
		'primary-component',
		'attachment',
	]);
});

Deno.test('rules: every rule has at least one option', () => {
	for (const rule of CORE_GRAMMAR_RULES) {
		assert(rule.options.length > 0, rule.symbol);
	}
});

Deno.test('rules: every option has a positive finite baseWeight', () => {
	for (const rule of CORE_GRAMMAR_RULES) {
		for (const option of rule.options) {
			const label = `${rule.symbol} → ${option.expandsTo}`;
			assert(Number.isFinite(option.baseWeight), `${label} baseWeight is not finite`);
			assert(option.baseWeight > 0, `${label} baseWeight is not positive`);
		}
	}
});

Deno.test('primary-component: options cover the eight primitives exactly, in registry order', () => {
	const options = ruleBySymbol('primary-component').options;
	assertEquals(options.map((o) => o.expandsTo), [...PRIMITIVE_TYPES]);
});

Deno.test('attachment: options cover the nine attachment types exactly, in union order', () => {
	const options = ruleBySymbol('attachment').options;
	assertEquals(options.map((o) => o.expandsTo), ATTACHMENT_TYPES);
});

Deno.test('rules: every expandsTo resolves to a rule symbol, a primitive or an attachment terminal', () => {
	const symbols = new Set(CORE_GRAMMAR_RULES.map((r) => r.symbol));
	const terminals = new Set<string>(ATTACHMENT_TYPES);

	for (const rule of CORE_GRAMMAR_RULES) {
		for (const option of rule.options) {
			const target = option.expandsTo;
			assert(
				symbols.has(target) || isPrimitiveType(target) || terminals.has(target),
				`${rule.symbol} → ${target} resolves to nothing`,
			);
		}
	}
});

Deno.test('rules: culturalModifiers use only valid material tags with finite non-zero values', () => {
	for (const rule of CORE_GRAMMAR_RULES) {
		for (const option of rule.options) {
			for (const [tag, modifier] of option.culturalModifiers) {
				const label = `${rule.symbol} → ${option.expandsTo} [${tag}]`;
				assert(
					(MATERIAL_TAGS as readonly string[]).includes(tag),
					`${label} is not a material tag`,
				);
				assert(Number.isFinite(modifier), `${label} modifier is not finite`);
				assert(modifier !== 0, `${label} modifier is zero`);
			}
		}
	}
});

Deno.test('rules: phaseModifiers use known PhaseCharacteristics paths with positive values', () => {
	for (const rule of CORE_GRAMMAR_RULES) {
		for (const option of rule.options) {
			if (!option.phaseModifiers) continue;
			for (const [path, multiplier] of option.phaseModifiers) {
				const label = `${rule.symbol} → ${option.expandsTo} [${path}]`;
				assert(PHASE_PATHS.includes(path), `${label} is not a known phase path`);
				assert(multiplier > 0, `${label} multiplier is not positive`);
			}
		}
	}
});

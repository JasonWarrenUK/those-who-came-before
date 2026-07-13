/**
 * MVP component grammar rules (doc 05 §5.3–§5.4).
 *
 * The four production rules of the bottom-up structural grammar, transcribed from the BNF:
 * `<object>` → `<component-group>+`, `<component-group>` → `<primary-component>` with optional
 * attachment chains, `<primary-component>` → one of the eight geometric primitives
 * (`data/grammars/primitives.ts`), and `<attachment>` → one of the nine join terminals. The
 * grammar produces physical structures, never functional categories (doc 05 §5.1).
 *
 * This module is static data only, no behaviour. Two contract notes for the engine:
 *
 * - Repetition is engine-owned. The `+` on `<component-group>` and the `*` on the attachment
 *   chain are not encoded here — `expandGrammar` (roadmap 2GN.3) decides chain length, and
 *   accumulation constraints bound it (roadmap 2GN.6/2GN.7). This data supplies only the
 *   alternatives and their weights.
 * - The `attachment` rule's options expand to `AttachmentType` terminals, which are neither rule
 *   symbols nor primitives. `expandGrammar` (2GN.3) consumes the rule positionally when filling
 *   the `[<attachment> <component-group>]*` slot — its options are edge labels for weighted
 *   selection, never expanded as components.
 *
 * All weights are MVP-provisional: doc 05 specifies the modifier maths (`weight += affinity ×
 * modifier`, 0.01 floor — §5.4) but no numeric values, so every `baseWeight` and modifier here is
 * an authored archaeology-flavoured prior, expected to be tuned once generation is observable in
 * the Explorer. `phaseModifiers` appear on a few illustrative options as fixtures for
 * `phaseInfluence`; their multiplier semantics firm up at 2GN.5. Material compatibility per
 * primitive is engine logic (roadmap 2GN.10), not data here.
 */

import type { GrammarRule } from '../../types/grammar.ts';
import type { MaterialTag } from '../../types/tags.ts';

/**
 * The component grammar's production rules, in the order doc 05 §5.3 lists them. `expandGrammar`
 * (roadmap 2GN.3) receives this collection and looks rules up by `symbol`; no keyed index is kept
 * here because `symbol` is already the rule's identity.
 */
export const CORE_GRAMMAR_RULES: readonly GrammarRule[] = [
	/** `<object> ::= <component-group>+` — the spine; repetition count is engine-owned. */
	{
		symbol: 'object',
		options: [
			{
				expandsTo: 'component-group',
				baseWeight: 1,
				culturalModifiers: new Map<MaterialTag, number>(),
			},
		],
	},

	/**
	 * `<component-group> ::= <primary-component> [<attachment> <component-group>]*` — the optional
	 * attachment chain is engine-owned; this rule only names the primary expansion.
	 */
	{
		symbol: 'component-group',
		options: [
			{
				expandsTo: 'primary-component',
				baseWeight: 1,
				culturalModifiers: new Map<MaterialTag, number>(),
			},
		],
	},

	/**
	 * `<primary-component> ::= <elongated> | <cylindrical> | <flat-broad> | <hollow-enclosed> |
	 * <ring-form> | <disc-form> | <bar-form> | <sheet-form>` — one option per primitive, in
	 * registry order. Weights favour the forms that dominate real assemblages: elongated,
	 * flat-broad and hollow-enclosed (pins, blades, shafts; plaques, palettes; vessels) over
	 * ring/disc (ornament, whorls, weights), with bar and sheet rarest as primaries (ingots,
	 * facings).
	 */
	{
		symbol: 'primary-component',
		options: [
			{
				expandsTo: 'elongated',
				baseWeight: 1.5,
				culturalModifiers: new Map<MaterialTag, number>([
					['metal', 0.5],
					['bone', 0.3],
					['wood', 0.2],
				]),
			},
			{
				expandsTo: 'cylindrical',
				baseWeight: 1,
				culturalModifiers: new Map<MaterialTag, number>([
					['clay', 0.4],
					['metal', 0.2],
					['wood', 0.2],
				]),
			},
			{
				expandsTo: 'flat-broad',
				baseWeight: 1.3,
				culturalModifiers: new Map<MaterialTag, number>([
					['stone', 0.4],
					['metal', 0.3],
					['bone', 0.2],
				]),
			},
			{
				expandsTo: 'hollow-enclosed',
				baseWeight: 1.2,
				culturalModifiers: new Map<MaterialTag, number>([
					['clay', 0.6],
					['glass', 0.3],
					['metal', 0.2],
				]),
				phaseModifiers: new Map([['technology.ceramics', 1.5]]),
			},
			{
				expandsTo: 'ring-form',
				baseWeight: 0.8,
				culturalModifiers: new Map<MaterialTag, number>([
					['precious-metal', 0.5],
					['metal', 0.4],
					['bone', 0.2],
				]),
			},
			{
				expandsTo: 'disc-form',
				baseWeight: 0.8,
				culturalModifiers: new Map<MaterialTag, number>([
					['stone', 0.3],
					['clay', 0.2],
					['metal', 0.2],
				]),
			},
			{
				expandsTo: 'bar-form',
				baseWeight: 0.5,
				culturalModifiers: new Map<MaterialTag, number>([
					['metal', 0.6],
					['stone', 0.1],
				]),
				phaseModifiers: new Map([['technology.metallurgy', 1.5]]),
			},
			{
				expandsTo: 'sheet-form',
				baseWeight: 0.4,
				culturalModifiers: new Map<MaterialTag, number>([
					['metal', 0.4],
					['leather', 0.3],
					['precious-metal', 0.3],
				]),
			},
		],
	},

	/**
	 * `<attachment> ::= inline | perpendicular | socketed | riveted | wrapped | lashed | hinged |
	 * threaded | friction-fit` — one option per join terminal, in union order
	 * (`types/grammar.ts`). Weights favour the cheap joins (inline, friction-fit) available to any
	 * technology; hinged and threaded need fine metalwork, so they sit lowest with metallurgy
	 * phase boosts.
	 */
	{
		symbol: 'attachment',
		options: [
			{
				expandsTo: 'inline',
				baseWeight: 1.2,
				culturalModifiers: new Map<MaterialTag, number>(),
			},
			{
				expandsTo: 'perpendicular',
				baseWeight: 1,
				culturalModifiers: new Map<MaterialTag, number>([
					['wood', 0.2],
					['stone', 0.2],
				]),
			},
			{
				expandsTo: 'socketed',
				baseWeight: 0.8,
				culturalModifiers: new Map<MaterialTag, number>([['metal', 0.4]]),
				phaseModifiers: new Map([['technology.metallurgy', 1.4]]),
			},
			{
				expandsTo: 'riveted',
				baseWeight: 0.6,
				culturalModifiers: new Map<MaterialTag, number>([['metal', 0.6]]),
				phaseModifiers: new Map([['technology.metallurgy', 1.5]]),
			},
			{
				expandsTo: 'wrapped',
				baseWeight: 0.7,
				culturalModifiers: new Map<MaterialTag, number>([
					['fiber', 0.4],
					['leather', 0.4],
				]),
			},
			{
				expandsTo: 'lashed',
				baseWeight: 0.7,
				culturalModifiers: new Map<MaterialTag, number>([
					['fiber', 0.5],
					['leather', 0.3],
					['wood', 0.2],
				]),
			},
			{
				expandsTo: 'hinged',
				baseWeight: 0.3,
				culturalModifiers: new Map<MaterialTag, number>([['metal', 0.5]]),
			},
			{
				expandsTo: 'threaded',
				baseWeight: 0.2,
				culturalModifiers: new Map<MaterialTag, number>([['metal', 0.4]]),
				phaseModifiers: new Map([['technology.metallurgy', 1.6]]),
			},
			{
				expandsTo: 'friction-fit',
				baseWeight: 0.9,
				culturalModifiers: new Map<MaterialTag, number>([
					['wood', 0.3],
					['bone', 0.2],
				]),
			},
		],
	},
];

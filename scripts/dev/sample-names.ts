/// <reference lib="deno.ns" />
/**
 * Samples language generation (roadmap 2GN.66): each world's language families, the sound system
 * behind every language, and the names those languages actually produce.
 *
 * Run via `deno task sample:names`.
 *
 * Unlike the artefact samplers this takes no `--world` region: a language is generated from the seed
 * alone, with no geology, culture or trade input. It shares their `--seed`/`--json` conventions and
 * nothing else, which is why it parses its own arguments rather than borrowing `shared.ts`'s
 * artefact-shaped helpers.
 */

import { banner, paint } from './gum.ts';
import { createPrng } from '../../src/lib/engine/prng.ts';
import {
	areRelated,
	generateLanguageForest,
	MAXIMUM_NAME_SYLLABLES,
	MINIMUM_NAME_SYLLABLES,
} from '../../src/lib/engine/world/phonology.ts';
import {
	generateCultureName,
	generateScholarName,
	generateSiteName,
	renderName,
	renderNameSyllabified,
} from '../../src/lib/engine/world/naming.ts';
import { PHONES_BY_ID } from '../../src/lib/data/names/phones.ts';
import type { Language, LanguageFamily, Phonology } from '../../src/lib/types/language.ts';

const USAGE = `sample-names — generate a world's languages and the names they produce

Usage: deno task sample:names [--seed <string>] [--cultures <n>] [--names <n>] [--json]

  --seed      World PRNG seed (default: dev-sample). Same seed always gives the same world.
  --cultures  How many cultures the world holds (default: 4; MVP ships 2).
  --names     Site and scholar names sampled per language (default: 6).
  --json      Emit JSON instead of the report.`;

interface Options {
	seed: string;
	cultures: number;
	names: number;
	json: boolean;
}

function parseOptions(): Options {
	const options: Options = { seed: 'dev-sample', cultures: 4, names: 6, json: false };
	const args = [...Deno.args];

	while (args.length > 0) {
		const flag = args.shift() as string;

		if (flag === '--help' || flag === '-h') {
			console.log(USAGE);
			Deno.exit(0);
		}
		if (flag === '--json') {
			options.json = true;
			continue;
		}

		// Validate the flag *before* consuming its value, so a typo reports itself rather than
		// complaining that an unknown flag is missing an argument.
		if (flag !== '--seed' && flag !== '--cultures' && flag !== '--names') {
			console.error(`unrecognised argument: ${flag}\n\n${USAGE}`);
			Deno.exit(1);
		}

		const value = args.shift();
		if (value === undefined) {
			console.error(`${flag} needs a value\n\n${USAGE}`);
			Deno.exit(1);
		}

		if (flag === '--seed') {
			options.seed = value;
			continue;
		}

		const parsed = Number(value);
		if (!Number.isInteger(parsed) || parsed < 1) {
			console.error(`${flag} must be an integer >= 1\n\n${USAGE}`);
			Deno.exit(1);
		}

		options[flag === '--cultures' ? 'cultures' : 'names'] = parsed;
	}

	return options;
}

const options = parseOptions();

const forest = generateLanguageForest(options.cultures, createPrng(options.seed));

/** Every language paired with the culture name it supplies, in generation order. */
const entries = forest.families.flatMap((family) =>
	family.languageIds.map((languageId, memberIndex) => {
		const language = forest.languages.get(languageId) as Language;
		const prng = createPrng(`${options.seed}:${languageId}`);

		return {
			family,
			memberIndex,
			language,
			cultureName: generateCultureName(language.phonology, languageId, prng),
			sites: Array.from(
				{ length: options.names },
				() => generateSiteName(language.phonology, languageId, prng),
			),
			scholars: Array.from(
				{ length: options.names },
				() => generateScholarName(language.phonology, languageId, prng),
			),
		};
	})
);

if (options.json) {
	console.log(JSON.stringify(
		{
			seed: options.seed,
			families: forest.families.map((family) => ({
				id: family.id,
				languageIds: family.languageIds,
				phonology: family.protoPhonology,
			})),
			languages: entries.map((entry) => ({
				id: entry.language.id,
				familyId: entry.family.id,
				culture: renderName(entry.cultureName),
				sites: entry.sites.map(renderName),
				scholars: entry.scholars.map(renderName),
			})),
		},
		null,
		2,
	));
	Deno.exit(0);
}

/** Grapheme for a phoneme id, for inventory rows. */
const grapheme = (id: string) => PHONES_BY_ID.get(id)?.grapheme ?? id;

/**
 * Wraps a phoneme row so a wide inventory does not run off the terminal, indenting continuations to
 * line up under the first.
 */
function phonemeRow(ids: readonly string[], indent: string, perLine = 16): string[] {
	const lines: string[] = [];

	for (let start = 0; start < ids.length; start += perLine) {
		lines.push(indent + ids.slice(start, start + perLine).map(grapheme).join('  '));
	}

	return lines;
}

/**
 * Describes a language's length preference in words rather than weights — "mostly two syllables,
 * sometimes three". Reads the same weights `drawSyllableCount` draws against, so it cannot drift
 * from what the generator actually does.
 */
function lengthPreference(phonology: Phonology): string {
	const ranked = phonology.syllableWeights
		.map((weight, index) => ({ count: MINIMUM_NAME_SYLLABLES + index, weight }))
		.sort((first, second) => second.weight - first.weight);

	const word = (count: number) =>
		count === 1 ? 'one' : count === 2 ? 'two' : count === 3 ? 'three' : 'four';

	return `mostly ${word(ranked[0].count)}, sometimes ${word(ranked[1].count)}`;
}

/** Describes a syllable template in prose rather than as a formula. */
function templateProse(phonology: Phonology): string {
	const { template } = phonology;
	const parts = [
		template.onset === 'required' ? 'must open on a consonant' : 'may open on a vowel',
		template.coda === 'none' ? 'never closes on one' : 'may close on one',
	];

	if (template.clusters) {
		parts.push('admits two-consonant onsets');
	}

	return parts.join(', ');
}

/** One language block: its sound system, then its names with syllable breaks. */
function printLanguage(entry: typeof entries[number], isLast: boolean): void {
	const { language, cultureName, sites, scholars } = entry;
	const rule = isLast ? ' ' : '│';
	const { phonology } = language;

	console.log(
		`├─ ${paint(language.id, 'id')} ─ spoken by culture ` +
			`${paint(renderName(cultureName), 'seed')}`,
	);
	console.log(`${rule}  `);
	console.log(`${rule}  ${paint('SOUND SYSTEM', 'heading')}`);
	console.log(
		`${rule}    syllables   ${paint(phonology.template.label, 'primitive')}  ─ ` +
			paint(templateProse(phonology), 'dim'),
	);
	console.log(
		`${rule}    name length ${paint(lengthPreference(phonology), 'primitive')}  ` +
			paint(`(${MINIMUM_NAME_SYLLABLES}–${MAXIMUM_NAME_SYLLABLES} possible)`, 'dim'),
	);
	console.log(
		`${rule}    consonants  ${phonology.consonants.length}, ` +
			paint('commonest first:', 'dim'),
	);
	for (const line of phonemeRow(phonology.consonants, `${rule}                  `)) {
		console.log(paint(line, 'material'));
	}
	console.log(
		`${rule}    vowels      ${phonology.vowels.length}, ${paint('commonest first:', 'dim')}`,
	);
	for (const line of phonemeRow(phonology.vowels, `${rule}                  `)) {
		console.log(paint(line, 'material'));
	}

	console.log(`${rule}  `);
	console.log(`${rule}  ${paint('NAMES', 'heading')}  ${paint('(• marks syllables)', 'dim')}`);
	console.log(
		`${rule}    culture   ${paint(renderName(cultureName), 'seed')}  ` +
			paint(renderNameSyllabified(cultureName), 'dim'),
	);

	for (const [label, names] of [['sites', sites], ['scholars', scholars]] as const) {
		for (const [index, name] of names.entries()) {
			// The label sits on the first row only; the rest align under it.
			const gutter = index === 0 ? label.padEnd(9) : ' '.repeat(9);

			console.log(
				`${rule}    ${gutter} ${paint(renderName(name).padEnd(18), 'layer')}` +
					paint(renderNameSyllabified(name), 'dim'),
			);
		}
	}

	console.log(isLast ? '' : `${rule}`);
}

/** Family header: how many members, and the warning that they do not yet diverge. */
function printFamily(family: LanguageFamily): void {
	const size = family.languageIds.length;
	const heading = size === 1 ? 'isolate' : `${size} sister languages`;

	console.log(`${paint(family.id.toUpperCase().replace('-', ' '), 'heading')} ─ ${heading}`);

	if (size > 1) {
		console.log(paint('│  All members descend from one proto-phonology.', 'dim'));
		console.log(
			paint('│  ', 'dim') +
				paint(
					'⚠ They are currently IDENTICAL, not merely similar: sound change is',
					'warn',
				),
		);
		console.log(
			paint('│    ', 'dim') +
				paint('not built (spike 2GN.66, honesty ledger). Expect them to sound the', 'warn'),
		);
		console.log(paint('│    ', 'dim') + paint('same until it lands.', 'warn'));
	} else {
		console.log(paint('│  Shares no ancestor with any other language in this world.', 'dim'));
	}

	console.log(paint('│', 'dim'));
}

const familyCount = forest.families.length;
const siblingPairs = forest.families.filter((family) => family.languageIds.length > 1).length;
const summary = siblingPairs === 0
	? 'no related languages'
	: `${siblingPairs} famil${siblingPairs === 1 ? 'y' : 'ies'} with siblings`;

console.log(banner(
	`WORLD ${paint(`"${options.seed}"`, 'seed')}\n` +
		`${options.cultures} culture${options.cultures === 1 ? '' : 's'} across ` +
		`${familyCount} language famil${familyCount === 1 ? 'y' : 'ies'} — ${summary}`,
));
console.log();

for (const family of forest.families) {
	printFamily(family);

	const members = entries.filter((entry) => entry.family.id === family.id);
	for (const [index, entry] of members.entries()) {
		printLanguage(entry, index === members.length - 1);
	}
}

// Relatedness matrix, but only where there is something to show.
if (entries.length > 1) {
	console.log(paint('RELATEDNESS', 'heading'));

	for (const [index, entry] of entries.entries()) {
		const row = entries
			.map((other, otherIndex) => {
				if (otherIndex === index) {
					return paint('·', 'dim');
				}
				return areRelated(forest, entry.language.id, other.language.id)
					? paint('✓', 'good')
					: paint('✗', 'dim');
			})
			.join(' ');

		console.log(
			`  ${paint(renderName(entry.cultureName).padEnd(14), 'seed')}${row}  ` +
				paint(entry.language.id, 'dim'),
		);
	}

	console.log();
	console.log(paint('  ✓ same family (shared ancestor)   ✗ unrelated', 'dim'));
}

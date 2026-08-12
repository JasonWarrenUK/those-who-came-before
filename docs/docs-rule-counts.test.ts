/// <reference lib="deno.ns" />
import { assert } from '@std/assert';
import { CLASSIFICATION_RULES } from '../src/lib/data/classification.ts';
import { RELATIVE_TAGS } from '../src/lib/types/tags.ts';

/**
 * Fails when prose states a classification-rule count that no longer matches the shipped array.
 *
 * `classification.test.ts` already pins the two numbers against the code. This guard closes the
 * other half of the same problem: the prose that *quotes* those numbers, which nothing verified.
 * Deleting one rule at roadmap 2GN.87 turned four separate reference sweeps into four separate
 * follow-up commits, each scoped somewhere the last one didn't reach — `src/` missed `scripts/`,
 * the code sweeps missed `docs/artefacts/`. Every one of those was found by a human reading the
 * page. This is the check that should have found them.
 *
 * **Why it reads the filesystem.** Prose is the artefact being checked, so there is nothing to
 * import. This is the only test in the suite that touches disk, which is why `deno task test`
 * carries `--allow-read`.
 *
 * ## Historical claims
 *
 * Doc 12 is a dated chronological log: an entry describing a measurement taken under the 44-rule
 * set is *correct* and must not be rewritten to today's number. Those mentions carry a
 * `<!-- rule-count: historical -->` marker on the nearest non-blank line above, and this guard skips
 * them. Blank lines between marker and claim are tolerated because `deno fmt` inserts one.
 *
 * The marker exists rather than a file-level exclusion because doc 12's July entries currently read
 * "43" — accurate as history, and matching today's count only by coincidence, since the set went
 * 43 → 44 (2GN.98, the execution-quality rule) → 43 (2GN.87, the short-edge deletion). Excluding
 * the file would hide a genuine live claim added to it later; matching on the number alone would
 * pass today and fire falsely the next time the count moves. Marking says which reading is meant.
 *
 * **Worked example:** doc 12 §2.26's "audit of all 43 classification rules" carries the marker. That
 * audit ran on 2026-08-01, before 2GN.98 added the 44th rule, so its 43 describes the set it
 * actually measured and coincides with today's count for unrelated reasons. It is the shape every
 * future marker should copy: a dated measurement, left verbatim, exempted rather than edited.
 *
 * **When this fails, decide which kind of claim it is.** Live prose describing the shipped set gets
 * the new number. A dated record of what was true when it was written gets the marker, not an edit.
 *
 * ## Generated data islands
 *
 * One case the marker cannot serve: `<script type="application/json">` blocks, where the roadmap
 * artefacts embed `.claude/roadmaps.json` as a single minified line. `isEmbeddedData` skips those,
 * for the reasons given at its own definition.
 */

/** Docs whose prose is checked. Every `.md`/`.html` under `docs/`, walked rather than listed. */
const DOCS_ROOT = new URL('.', import.meta.url);

/** Skips a single count mention: the log entry it sits above was true when written. */
const HISTORICAL_MARKER = 'rule-count: historical';

const RULE_COUNT = CLASSIFICATION_RULES.length;
const RELATIVE_COUNT = CLASSIFICATION_RULES.filter((rule) => {
	const relative = new Set<string>(RELATIVE_TAGS);
	return [...rule.tags.keys()].some((tag) => relative.has(tag));
}).length;

/**
 * Prose patterns that assert a total, e.g. "43 scoring rules", "all 43 classification rules".
 *
 * Deliberately narrow: it matches a number *adjacent to a qualified phrase for the whole set*, not
 * every integer in the docs. A pattern loose enough to catch every phrasing would flag fire rates,
 * section numbers and task ids, and a guard that cries wolf gets an exclusion list bolted on until
 * it means nothing.
 *
 * **A bare "all N rules" is deliberately not matched.** It reads as a total but is just as often a
 * subset — `docs/roadmaps/mvp.md` uses "not all 34 rules the ruling's selector catches" for the
 * relative count, correctly. Nothing in the phrase distinguishes the two, so matching it produced
 * false positives on prose that was right. The qualified forms below are unambiguous.
 *
 * **The verb form is matched, though, and the bare noun phrase is the only exclusion.** "runs 43
 * rules" names the whole set by construction: something that *runs* or *evaluates* N rules is
 * describing the evaluated set, where a bare "all N rules" can be scoping a subset introduced
 * earlier in the sentence. The distinction is not cosmetic — `how-an-artefact-gets-made.html`'s
 * "`classifyArtefact` runs all 43 rules" read 44 for two commits, was caught by eye rather than by
 * this guard, and is exactly the sentence this file exists to catch (roadmap 2GN.113).
 */
const TOTAL_PATTERNS: readonly RegExp[] = [
	/\ball (\d+) (?:classification|scoring|shipped) rules\b/g,
	/\b(\d+) (?:classification|scoring) rules\b/g,
	/\b(?:runs|evaluates|applies|fires) (?:all )?(\d+) rules\b/g,
];

/** Prose asserting the relative/total split, e.g. "34 of the 43 rules". */
const SPLIT_PATTERN = /\b(\d+) of the (\d+) (?:shipped )?rules\b/g;

interface Mention {
	file: string;
	line: number;
	text: string;
	problem: string;
}

/** Every `.md`/`.html` file under `docs/`, so a new doc is covered without editing this list. */
async function docFiles(dir: URL): Promise<URL[]> {
	const found: URL[] = [];
	for await (const entry of Deno.readDir(dir)) {
		const child = new URL(entry.name + (entry.isDirectory ? '/' : ''), dir);
		if (entry.isDirectory) {
			found.push(...await docFiles(child));
		} else if (entry.name.endsWith('.md') || entry.name.endsWith('.html')) {
			found.push(child);
		}
	}
	return found;
}

/**
 * Whether this line, or the nearest non-blank line above it, marks the mention as historical.
 *
 * Blank lines are skipped rather than ending the search, because `deno fmt` inserts one between an
 * HTML comment and the paragraph below it. A strict one-line lookback would therefore hold only
 * until the next `deno fmt` run, which would silently void every marker in the tree rather than
 * failing visibly — the worst outcome available for an exemption mechanism.
 */
function isHistorical(lines: readonly string[], index: number): boolean {
	if (lines[index]?.includes(HISTORICAL_MARKER) ?? false) return true;

	for (let above = index - 1; above >= 0; above--) {
		const line = lines[above] ?? '';
		if (line.trim() === '') continue;
		return line.includes(HISTORICAL_MARKER);
	}

	return false;
}

/**
 * Whether this line is an embedded JSON data island rather than prose.
 *
 * `docs/artefacts/roadmap-*.html` carry the whole roadmap as one `<script type="application/json">`
 * line, projected from `.claude/roadmaps.json`. 2GN.83's note in there records an audit run on
 * 2026-08-01, before 2GN.98 added the 44th rule, so its "all 43 classification rules" is the same
 * dated claim doc 12 §2.26 carries — and the marker cannot reach it, because a line-level HTML
 * comment has nowhere to sit inside a 236KB single line. Without this skip the next count change
 * hits two files where editing falsifies a dated measurement and marking is impossible.
 *
 * Exempting the data island rather than the file is what keeps the rest of those pages honest, and
 * the `type` attribute is load-bearing: `how-an-artefact-gets-made.html` states "43 scoring rules"
 * inside a plain `<script>` block of page JS (line 557), which is a live claim and stays checked.
 * The source of truth for these strings is `.claude/roadmaps.json`, reviewed as prose in its own
 * right; what is skipped here is a projection of it, not an independent assertion.
 */
function isEmbeddedData(line: string): boolean {
	return /<script[^>]*\btype\s*=\s*["']application\/json["']/i.test(line);
}

function scan(path: string, source: string): Mention[] {
	const lines = source.split('\n');
	const mentions: Mention[] = [];

	lines.forEach((line, index) => {
		if (isHistorical(lines, index) || isEmbeddedData(line)) return;

		// "all 43 classification rules" matches both total patterns, at overlapping offsets. Report
		// the longest match at each position once: two lines naming the same claim twice reads as two
		// separate problems to fix.
		const reported = new Set<number>();
		for (const pattern of TOTAL_PATTERNS) {
			for (const match of line.matchAll(pattern)) {
				const stated = Number(match[1]);
				const end = match.index + match[0].length;
				if (stated === RULE_COUNT || reported.has(end)) continue;

				reported.add(end);
				mentions.push({
					file: path,
					line: index + 1,
					text: match[0],
					problem: `states ${stated} rules; the array ships ${RULE_COUNT}`,
				});
			}
		}

		for (const match of line.matchAll(SPLIT_PATTERN)) {
			const [statedRelative, statedTotal] = [Number(match[1]), Number(match[2])];
			if (statedTotal !== RULE_COUNT || statedRelative !== RELATIVE_COUNT) {
				mentions.push({
					file: path,
					line: index + 1,
					text: match[0],
					problem:
						`states ${statedRelative} of ${statedTotal}; the array ships ${RELATIVE_COUNT} of ${RULE_COUNT}`,
				});
			}
		}
	});

	return mentions;
}

/**
 * The data-island skip is scoped by `type`, and that boundary is the whole point of it.
 *
 * A skip written as "any `<script>`" would read as the same fix and silently drop
 * `how-an-artefact-gets-made.html`'s live "43 scoring rules" claim, which sits in a plain page-JS
 * block. This pins both sides so the narrowing cannot be lost to a later tidy-up.
 */
Deno.test('scan: skips embedded JSON data islands, still reads plain script blocks', () => {
	const stale = String(RULE_COUNT + 1);

	const embedded = scan(
		'artefacts/generated.html',
		`<script id="roadmap-data" type="application/json">{"notes": "audit of all ${stale} classification rules"}</script>`,
	);
	assert(embedded.length === 0, `data island should be skipped, got ${embedded.length} mention(s)`);

	const pageScript = scan('artefacts/page.html', `<script>\nconst d = '${stale} scoring rules';\n`);
	assert(
		pageScript.length === 1,
		`plain script block should stay checked, got ${pageScript.length} mention(s)`,
	);
});

Deno.test('docs: no prose states a stale classification-rule count (roadmap 2GN.87)', async () => {
	const files = await docFiles(DOCS_ROOT);
	assert(files.length > 0, `no docs found under ${DOCS_ROOT.pathname} — the walk is misconfigured`);

	const stale: Mention[] = [];
	for (const file of files) {
		const path = `docs/${decodeURIComponent(file.href.slice(DOCS_ROOT.href.length))}`;
		stale.push(...scan(path, await Deno.readTextFile(file)));
	}

	assert(
		stale.length === 0,
		`${stale.length} prose rule-count claim(s) no longer match the shipped array:\n` +
			stale.map((m) => `  ${m.file}:${m.line}  "${m.text}" — ${m.problem}`).join('\n') +
			`\n\nThe array ships ${RULE_COUNT} rules, ${RELATIVE_COUNT} awarding a RelativeTag. ` +
			`If a claim describes the set as it is now, update the number. If it is a dated record ` +
			`of what was true when it was written — doc 12's entries usually are — leave the text ` +
			`alone and put an HTML comment reading "${HISTORICAL_MARKER}" on the line above it.`,
	);
});

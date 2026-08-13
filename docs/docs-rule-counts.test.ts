/// <reference lib="deno.ns" />
import { assert } from '@std/assert';
import { CLASSIFICATION_RULES } from '../src/lib/data/classification.ts';
import { RELATIVE_TAGS } from '../src/lib/types/tags.ts';
import { MATERIALS } from '../src/lib/data/materials.ts';
import { DECORATIVE_TECHNIQUES } from '../src/lib/data/decorations.ts';
import { PRIMITIVE_TYPES } from '../src/lib/data/grammars/primitives.ts';
import { CORE_GRAMMAR_RULES } from '../src/lib/data/grammars/core.ts';

/**
 * Counts a type alias union's members by parsing its source text — there is no runtime array to
 * import for a `type X = A | B | …` the way there is for `const X = [...]`. Narrow on purpose:
 * counts `|`-separated arms between the `export type <name> =` line and the first line that isn't
 * a union arm (blank, or a line starting something new), so it can't accidentally walk into an
 * unrelated later declaration. Used for `Contradiction` (design/contradiction.html's "eight
 * members" claim), the only union-count claim currently live in `site/`.
 */
function countUnionMembers(source: string, typeName: string): number {
	const start = source.indexOf(`export type ${typeName} =`);
	if (start === -1) throw new Error(`type ${typeName} not found while counting union members`);
	const body = source.slice(start).split('\n').slice(1);
	let count = 0;
	for (const line of body) {
		const trimmed = line.trim();
		if (trimmed.startsWith('|')) {
			count++;
			continue;
		}
		if (trimmed === '') continue;
		break;
	}
	return count;
}

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
 * **Why the walk is repo-wide.** It was rooted at `docs/` until the pipeline explainer moved to
 * `index.html` for GitHub Pages. Re-rooting rather than adding a second root for the new location
 * is deliberate: a per-location list has to be remembered every time prose lands somewhere new, and
 * the failure mode when someone forgets is silent — the guard keeps passing while covering less,
 * the exact defect this file exists to close. This test file itself stays under `docs/` even though
 * it now walks the whole repo; only the walk root moved, not the file.
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

/** Docs whose prose is checked. Every `.md`/`.html` in the repo, walked rather than listed. */
const REPO_ROOT = new URL('../', import.meta.url);

/**
 * Directories the walk never enters.
 *
 * `node_modules` is third-party prose that is not ours to correct and would dominate the walk's
 * cost. `build`/`.output`/`.svelte-kit`/`.deno-deploy` are generated projections of files already
 * checked at their source. `_to_delete` is staged for removal, so its claims are not claims the
 * project is making. Deliberately **not** listed: `src/`, `scripts/`, `tests/`, `static/` — those
 * are exactly the sweeps 2GN.87 missed, and excluding source trees here would reopen that gap.
 */
const IGNORED_DIRS: ReadonlySet<string> = new Set([
	'node_modules',
	'.git',
	'.svelte-kit',
	'.deno-deploy',
	'build',
	'.output',
	'_to_delete',
]);

/** Files the walk must reach, or it has silently narrowed. See the test that asserts this. */
const REQUIRED_COVERAGE: readonly string[] = [
	'site/index.html',
	'site/mechanism/classification.html',
	'README.md',
	'docs/12-propagation-register.md',
];

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
 * earlier in the sentence. The distinction is not cosmetic — the pipeline explainer's (now
 * `site/mechanism/classification.html`) "`classifyArtefact` runs all 43 rules" read 44 for two
 * commits, was caught by eye rather than by this guard, and is exactly the sentence this file
 * exists to catch (roadmap 2GN.113).
 */
const TOTAL_PATTERNS: readonly RegExp[] = [
	/\ball (\d+) (?:classification|scoring|shipped) rules\b/g,
	/\b(\d+) (?:classification|scoring) rules\b/g,
	/\b(?:runs|evaluates|applies|fires) (?:all )?(\d+) rules\b/g,
];

/** Prose asserting the relative/total split, e.g. "34 of the 43 rules". */
const SPLIT_PATTERN = /\b(\d+) of the (\d+) (?:shipped )?rules\b/g;

/**
 * The site's prose almost never writes counts as digits. Doc 05's register and the pipeline
 * explainer's both spell them out — "Sixteen materials", not "16 materials" — so the classification
 * guard's `\d+`-only patterns are structurally blind to most of the claims on the page. This map is
 * what makes those claims matchable at all; keep it exactly as wide as English attestable numbers
 * for the quantities this repo actually uses (materials, primitives, techniques, rules, docs), not
 * a general-purpose number-word parser.
 */
const SPELLED: Readonly<Record<string, number>> = {
	one: 1,
	two: 2,
	three: 3,
	four: 4,
	five: 5,
	six: 6,
	seven: 7,
	eight: 8,
	nine: 9,
	ten: 10,
	eleven: 11,
	twelve: 12,
	thirteen: 13,
	fourteen: 14,
	fifteen: 15,
	sixteen: 16,
	seventeen: 17,
	eighteen: 18,
	nineteen: 19,
	twenty: 20,
	forty: 40,
	'forty-two': 42,
	'forty-three': 43,
	'forty-four': 44,
	'forty-five': 45,
	'forty-six': 46,
};
const NUMBER_WORD = Object.keys(SPELLED).sort((a, b) => b.length - a.length).join('|');

/**
 * A claim of shape "{spelled-or-digit number} {noun phrase}", checked against a value derived from
 * shipped source — never hand-typed here, so this table can't itself drift the way the prose it
 * guards did.
 *
 * Each pattern requires a whole-catalogue qualifier — "all", "the catalogue of", or the number
 * opening its own clause followed by ", each" / "cover the MVP" (the shape every live claim this
 * extension found actually uses: "Sixteen materials, each a definition…", "Four production rules
 * cover the MVP") — for the same reason `TOTAL_PATTERNS` above requires "all N rules" rather than a
 * bare "N rules": an unqualified match catches subset references like "the other five techniques"
 * or "the three form-substrate techniques", which this extension's first draft did, loudly, against
 * doc 12 and doc 01's historical prose (roadmap 2GN.115 audit). Add an entry here only for a claim
 * that has actually gone stale once, or that this extension's own audit found live in `site/` — not
 * speculatively for every number in the codebase.
 */
interface KeyedClaim {
	/** Matches a leading number word or digit run, captured as group 1, in a fixed noun phrase. */
	pattern: RegExp;
	expected: number;
	label: string;
}
/** One entry per matched shape, so each regex has exactly one capture group. */
const KEYED_CLAIMS: readonly KeyedClaim[] = [
	{
		pattern: new RegExp(`\\ball (${NUMBER_WORD}|\\d+) materials\\b`, 'gi'),
		expected: MATERIALS.length,
		label: 'materials.ts MATERIALS',
	},
	{
		pattern: new RegExp(`(?:^|>)(${NUMBER_WORD}|\\d+) materials, each\\b`, 'gim'),
		expected: MATERIALS.length,
		label: 'materials.ts MATERIALS',
	},
	{
		pattern: new RegExp(`\\b(?:all )?(${NUMBER_WORD}|\\d+) geometric primitives\\b`, 'gi'),
		expected: PRIMITIVE_TYPES.length,
		label: 'grammars/primitives.ts PRIMITIVE_TYPES',
	},
	{
		pattern: new RegExp(
			`\\b(${NUMBER_WORD}|\\d+) production rules (?:cover the MVP|exist)\\b`,
			'gi',
		),
		expected: CORE_GRAMMAR_RULES.length,
		label: 'grammars/core.ts CORE_GRAMMAR_RULES',
	},
	{
		pattern: new RegExp(`\\ball (${NUMBER_WORD}|\\d+) (?:decorative )?techniques\\b`, 'gi'),
		expected: DECORATIVE_TECHNIQUES.length,
		label: 'decorations.ts DECORATIVE_TECHNIQUES',
	},
	{
		pattern: new RegExp(`(?:^|>)(${NUMBER_WORD}|\\d+) techniques, three families\\b`, 'gim'),
		expected: DECORATIVE_TECHNIQUES.length,
		label: 'decorations.ts DECORATIVE_TECHNIQUES',
	},
];

/**
 * "Fourteen documents," / "fourteen documents from" — docs/NN-*.md, doc 00 through 13. Qualified to
 * those two shapes, not a bare "N documents" (which also matches the pipeline explainer's SVG label
 * "10 documents", short for "docs 04–10", a section range rather than a count). Built by
 * `docCountClaim()` rather than a literal here, so adding or retiring a numbered doc doesn't require
 * remembering to update a second count that lives in this file.
 */
function docCountClaim(count: number): KeyedClaim {
	return {
		pattern: new RegExp(`\\b(${NUMBER_WORD}|\\d+) documents(?:,| from)\\b`, 'gi'),
		expected: count,
		label: 'docs/NN-*.md count',
	};
}

interface Mention {
	file: string;
	line: number;
	text: string;
	problem: string;
}

/** Every `.md`/`.html` file in the repo, outside `IGNORED_DIRS`, so a new doc needs no list edit. */
async function docFiles(dir: URL): Promise<URL[]> {
	const found: URL[] = [];
	for await (const entry of Deno.readDir(dir)) {
		if (entry.isDirectory && IGNORED_DIRS.has(entry.name)) continue;

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
 * the `type` attribute is load-bearing: `site/index.html` states "43 scoring rules" as plain hub-card
 * markup, and `site/mechanism/classification.html` states it again in prose — both live claims that
 * stay checked. (Before the site split, this same string lived inside a `<script>` block of page JS
 * in the old root `index.html`; the split moved it into markup, but the exemption boundary being
 * documented here — data island vs. everything else — is unchanged.) The source of truth for the
 * roadmap-artefact strings is `.claude/roadmaps.json`, reviewed as prose in its own right; what is
 * skipped here is a projection of it, not an independent assertion.
 */
function isEmbeddedData(line: string): boolean {
	return /<script[^>]*\btype\s*=\s*["']application\/json["']/i.test(line);
}

/** Resolves a captured number-word-or-digit token to its integer value. */
function parseCount(token: string): number {
	const lower = token.toLowerCase();
	return lower in SPELLED ? SPELLED[lower] : Number(token);
}

function scan(
	path: string,
	source: string,
	keyedClaims: readonly KeyedClaim[] = KEYED_CLAIMS,
): Mention[] {
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

		for (const claim of keyedClaims) {
			for (const match of line.matchAll(claim.pattern)) {
				const stated = parseCount(match[1]);
				if (stated !== claim.expected) {
					mentions.push({
						file: path,
						line: index + 1,
						text: match[0],
						problem: `states ${stated}; ${claim.label} has ${claim.expected}`,
					});
				}
			}
		}
	});

	return mentions;
}

/**
 * The data-island skip is scoped by `type`, and that boundary is the whole point of it.
 *
 * A skip written as "any `<script>`" would read as the same fix and silently drop the live
 * "43 scoring rules"/"43 rules" claims in `site/index.html` and `site/mechanism/classification.html`.
 * Neither sits inside a `<script>` block today, but the boundary this test pins — data island vs.
 * everything else, scoped by `type` — is what stops a future `<script>`-wide skip from reopening
 * that gap if either claim ever moves back into page JS.
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
	const files = await docFiles(REPO_ROOT);
	assert(files.length > 0, `no docs found under ${REPO_ROOT.pathname} — the walk is misconfigured`);

	const reached = new Set(
		files.map((file) => decodeURIComponent(file.href.slice(REPO_ROOT.href.length))),
	);
	for (const required of REQUIRED_COVERAGE) {
		assert(
			reached.has(required),
			`${required} was not reached by the walk — coverage has regressed`,
		);
	}

	// Numbered design docs only (docs/00-*.md .. docs/13-*.md), not every .md the walk finds —
	// archive/, dev/, spikes/ and reports/ carry their own prose and aren't "the fourteen documents".
	const numberedDocCount = [...reached].filter((path) => /^docs\/\d{2}-.*\.md$/.test(path)).length;

	// "Contradiction is a discriminated union of eight members" — design/contradiction.html's own
	// live claim. Counted from source (see countUnionMembers) rather than imported, since a type
	// alias has no runtime array to import the way MATERIALS or DECORATIVE_TECHNIQUES does.
	const contradictionMemberCount = countUnionMembers(
		await Deno.readTextFile(new URL('../src/lib/types/contradiction.ts', import.meta.url)),
		'Contradiction',
	);
	const contradictionClaim: KeyedClaim = {
		pattern: new RegExp(`\\bdiscriminated union of (${NUMBER_WORD}|\\d+) members\\b`, 'gi'),
		expected: contradictionMemberCount,
		label: 'contradiction.ts Contradiction union',
	};

	const keyedClaims = [...KEYED_CLAIMS, docCountClaim(numberedDocCount), contradictionClaim];

	const stale: Mention[] = [];
	for (const path of reached) {
		const file = new URL(path, REPO_ROOT);
		stale.push(...scan(path, await Deno.readTextFile(file), keyedClaims));
	}

	assert(
		stale.length === 0,
		`${stale.length} prose claim(s) no longer match their shipped source:\n` +
			stale.map((m) => `  ${m.file}:${m.line}  "${m.text}" — ${m.problem}`).join('\n') +
			`\n\nThe classification array ships ${RULE_COUNT} rules, ${RELATIVE_COUNT} awarding a ` +
			`RelativeTag; ${numberedDocCount} numbered docs exist. If a claim describes the set as ` +
			`it is now, update the number. If it is a dated record of what was true when it was ` +
			`written — doc 12's entries usually are — leave the text alone and put an HTML comment ` +
			`reading "${HISTORICAL_MARKER}" on the line above it.`,
	);
});

Deno.test('roadmap: no prose states a stale task total (roadmap 2GN.114 audit)', async () => {
	const roadmap: {
		milestones: { id: string; tasks: { status: string }[] }[];
	}[] = JSON.parse(await Deno.readTextFile(new URL('../.claude/roadmaps.json', import.meta.url)));
	const phase = roadmap[0];
	const total = phase.milestones.reduce((n, m) => n + m.tasks.length, 0);
	const done = phase.milestones.reduce(
		(n, m) => n + m.tasks.filter((t) => t.status === 'done').length,
		0,
	);
	const m2 = phase.milestones.find((m) => m.id === 'M2');
	if (!m2) throw new Error('Milestone 2 not found in .claude/roadmaps.json — has the id changed?');
	const m2Total = m2.tasks.length;
	const m2Done = m2.tasks.filter((t) => t.status === 'done').length;

	// "…rebuilt against a 328-task MVP roadmap; 95 tasks were done…Milestone 2…at 55 of 110 tasks."
	const ROADMAP_TOTAL = /\b(\d+)-task MVP roadmap\b/;
	const ROADMAP_DONE = /\b(\d+) tasks were done\b/;
	const M2_SPLIT = /\bat (\d+) of (\d+) tasks\b/;
	// "Forty-two entries had completed…, two pending on unbuilt…" — the one sentence in site/ that
	// states the propagation register's own counts. Anchored to "entries had completed" / "pending
	// on" specifically: a bare "N pending" or "no pending" also matches unrelated checklists (doc 00's
	// "No pending items remain" describes a different, unrelated task list; doc 12's own change-log
	// quotes its *own past* "no pending items" claim as the thing §1 corrected) — neither is a claim
	// about the register's live entry count, so a looser pattern flagged both as stale (2GN.115 audit).
	const REGISTER_DONE = new RegExp(`\\b(${NUMBER_WORD}|\\d+) entries had completed\\b`, 'i');
	const REGISTER_PENDING = new RegExp(`\\b(${NUMBER_WORD}|no) pending on\\b`, 'i');

	const registerText = await Deno.readTextFile(
		new URL('../docs/12-propagation-register.md', import.meta.url),
	);
	const registerDone = [...registerText.matchAll(/^### 2\.\d+ /gm)].length;
	// Scoped to §1 only (between its heading and §2's) — a bare `/^- \*\*/gm` over the whole file
	// also counts bold-led bullets inside §2's completed-entry prose, over-reporting by an order of
	// magnitude (roadmap 2GN.115 audit: this bug shipped as 23 pending against a true count of 2).
	const pendingSection = registerText.match(
		/^## 1\. Pending Propagation\n([\s\S]*?)\n## 2\. Completed Propagation/m,
	);
	if (!pendingSection) {
		throw new Error(
			'§1 Pending Propagation heading not found in doc 12 — has it moved or been retitled?',
		);
	}
	const registerPending = [...pendingSection[1].matchAll(/^- \*\*/gm)].length;

	const files = await docFiles(REPO_ROOT);
	const stale: Mention[] = [];
	for (const file of files) {
		const path = decodeURIComponent(file.href.slice(REPO_ROOT.href.length));
		const lines = (await Deno.readTextFile(file)).split('\n');
		lines.forEach((line, index) => {
			if (isHistorical(lines, index)) return;
			const total_m = line.match(ROADMAP_TOTAL);
			if (total_m && Number(total_m[1]) !== total) {
				stale.push({
					file: path,
					line: index + 1,
					text: total_m[0],
					problem: `states ${total_m[1]}-task roadmap; roadmaps.json has ${total} tasks`,
				});
			}
			const done_m = line.match(ROADMAP_DONE);
			if (done_m && Number(done_m[1]) !== done) {
				stale.push({
					file: path,
					line: index + 1,
					text: done_m[0],
					problem: `states ${done_m[1]} done; roadmaps.json has ${done} done`,
				});
			}
			const split_m = line.match(M2_SPLIT);
			if (split_m && (Number(split_m[1]) !== m2Done || Number(split_m[2]) !== m2Total)) {
				stale.push({
					file: path,
					line: index + 1,
					text: split_m[0],
					problem: `states ${split_m[1]} of ${split_m[2]}; Milestone 2 has ${m2Done} of ${m2Total}`,
				});
			}
			const regDone_m = line.match(REGISTER_DONE);
			if (regDone_m && parseCount(regDone_m[1]) !== registerDone) {
				stale.push({
					file: path,
					line: index + 1,
					text: regDone_m[0],
					problem: `states ${regDone_m[1]} completed entries; doc 12 §2 has ${registerDone}`,
				});
			}
			const regPending_m = line.match(REGISTER_PENDING);
			if (regPending_m) {
				const stated = regPending_m[1].toLowerCase() === 'no' ? 0 : parseCount(regPending_m[1]);
				if (stated !== registerPending) {
					stale.push({
						file: path,
						line: index + 1,
						text: regPending_m[0],
						problem: `states ${stated} pending; doc 12 §1 has ${registerPending}`,
					});
				}
			}
		});
	}

	assert(
		stale.length === 0,
		`${stale.length} prose claim(s) about the roadmap or propagation register are stale:\n` +
			stale.map((m) => `  ${m.file}:${m.line}  "${m.text}" — ${m.problem}`).join('\n') +
			`\n\nCurrent state: ${total} roadmap tasks (${done} done), Milestone 2 at ${m2Done} of ` +
			`${m2Total}, propagation register at ${registerDone} completed / ${registerPending} pending.`,
	);
});

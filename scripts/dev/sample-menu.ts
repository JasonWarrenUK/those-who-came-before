/// <reference lib="deno.ns" />
/**
 * Umbrella picker for the Milestone 2 sampling scripts: `deno task sample` opens a `gum choose`
 * menu over the five samplers and runs whichever one you pick. Extra arguments pass straight
 * through, so `deno task sample --seed brooch-hunt --count 3` seeds the chosen sampler.
 *
 * Unlike the tone styling in `./gum.ts`, the menu can't degrade to plain text: without gum there
 * is no picker, so a missing binary prints the task list and exits loudly instead. The chosen
 * sampler runs via `deno task sample:<name>` so its permission grants stay defined in one place
 * (`deno.json`).
 */

/** One menu entry: the `sample:<key>` task suffix plus the blurb shown beside it. */
interface Sampler {
	key: string;
	blurb: string;
}

const SAMPLERS: Sampler[] = [
	{ key: 'artefact', blurb: 'anatomy tree + plausibility verdict' },
	{ key: 'materials', blurb: "each part's material pick (--draws for distribution)" },
	{ key: 'decoration', blurb: 'decorative layers nested per part' },
	{ key: 'features', blurb: 'annotated classifier reading' },
	{ key: 'classification', blurb: 'scored tag chart with per-rule contributions' },
];

const KEY_WIDTH = 15; // 'classification' plus a space.

const USAGE = `sample — pick a sampler from a gum menu and run it

Usage: deno task sample [sampler flags...]

Opens a gum choose menu over the samplers; every extra argument is forwarded to
whichever one you pick (e.g. --seed, --count, --json, or script-specific flags
like --draws — an invalid flag fails loudly in the chosen sampler, as always).

Samplers on the menu:
${SAMPLERS.map(({ key, blurb }) => `  sample:${key.padEnd(KEY_WIDTH)} ${blurb}`).join('\n')}`;

if (Deno.args.includes('--help') || Deno.args.includes('-h')) {
	console.log(USAGE);
	Deno.exit(0);
}

/** Bails out with the direct-task listing when the menu itself can't run. */
function bail(reason: string): never {
	console.error(`${reason}\n\n${USAGE}`);
	Deno.exit(1);
}

if (!Deno.stdin.isTerminal() || !Deno.stderr.isTerminal()) {
	bail('the menu needs an interactive terminal — run a deno task sample:<name> directly instead');
}

// gum draws the picker on the TTY and prints only the selection to stdout, so capturing stdout
// while inheriting stdin/stderr gives an interactive menu with a readable result.
const labels = SAMPLERS.map(({ key, blurb }) => `${key.padEnd(KEY_WIDTH)} ${blurb}`);
let picked: Deno.CommandOutput;
try {
	picked = new Deno.Command('gum', {
		args: ['choose', '--header', 'sample which pipeline stage?', ...labels],
		stdin: 'inherit',
		stdout: 'piped',
		stderr: 'inherit',
	}).outputSync();
} catch {
	bail(
		'gum is required for the menu (brew install gum) — or run a deno task sample:<name> directly',
	);
}

// A non-zero exit is the user backing out (esc / ctrl-c): leave quietly with gum's code.
if (!picked.success) Deno.exit(picked.code);

const choice = new TextDecoder().decode(picked.stdout).trim().split(/\s+/)[0];
const sampler = SAMPLERS.find(({ key }) => key === choice);
if (sampler === undefined) bail(`gum returned an unrecognised choice: "${choice}"`);

const run = new Deno.Command('deno', {
	args: ['task', '-q', `sample:${sampler.key}`, ...Deno.args],
	stdin: 'inherit',
	stdout: 'inherit',
	stderr: 'inherit',
}).outputSync();
Deno.exit(run.code);

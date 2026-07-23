/// <reference lib="deno.ns" />
/**
 * gum-backed styling for the sampling scripts (`scripts/dev/sample-*.ts`).
 *
 * Every colour here genuinely comes from `gum style`: each tone is resolved once by asking gum to
 * style a sentinel string, and the ANSI codes it emits are cached and reused. That keeps the
 * capability degradation gum's (it decides what the terminal supports) while costing one gum spawn
 * per distinct tone rather than one per line — the trees print far too many fragments to shell out
 * for each.
 *
 * Styling silently degrades to plain text whenever it can't or shouldn't happen: gum not
 * installed, the `--allow-run=gum` grant absent (so `deno run scripts/dev/sample-*.ts` still works
 * bare, without prompting), stdout not a terminal (piped report output stays clean), or `NO_COLOR`
 * set. `CLICOLOR_FORCE=1` forces styling when piping — gum itself honours the same variable, which
 * is also how the spawned gum is made to emit codes into our pipe.
 */

/** The named tones the samplers draw from — one purpose each, shared across every script. */
export type Tone =
	| 'seed' // sample headline seeds
	| 'dim' // stats, annotations, tree furniture
	| 'id' // component short ids (`c0`)
	| 'primitive' // primitive type names
	| 'joint' // attachment types on tree branches
	| 'material' // material picks
	| 'layer' // decorative layer lines
	| 'good' // passing verdicts, ✓
	| 'bad' // failures, ✗, policy drift
	| 'warn' // gate blocks, loose parts, empty results
	| 'heading' // section headers and row labels
	| 'bar' // chart bars
	| 'barLead'; // the strongest bar in a chart

const TONE_ARGS: Record<Tone, string[]> = {
	'seed': ['--bold', '--foreground', '214'],
	'dim': ['--foreground', '245'],
	'id': ['--foreground', '44'],
	'primitive': ['--foreground', '141'],
	'joint': ['--foreground', '109'],
	'material': ['--foreground', '179'],
	'layer': ['--foreground', '175'],
	'good': ['--foreground', '78'],
	'bad': ['--foreground', '203'],
	'warn': ['--foreground', '214'],
	'heading': ['--bold'],
	'bar': ['--foreground', '74'],
	'barLead': ['--bold', '--foreground', '214'],
};

// --- Capability detection ------------------------------------------------------------------------

/** Reads an env variable without ever triggering a permission prompt; `undefined` when unreadable. */
function quietEnv(name: string): string | undefined {
	const state = Deno.permissions.querySync({ name: 'env', variable: name }).state;
	return state === 'granted' ? Deno.env.get(name) : undefined;
}

let enabled: boolean | undefined;

/** Whether styling should happen at all — resolved once, before any gum spawn. */
function stylingEnabled(): boolean {
	if (enabled !== undefined) return enabled;
	const noColour = quietEnv('NO_COLOR');
	const forced = quietEnv('CLICOLOR_FORCE');
	enabled = (noColour === undefined || noColour === '') &&
		(Deno.stdout.isTerminal() || (forced !== undefined && forced !== '' && forced !== '0')) &&
		Deno.permissions.querySync({ name: 'run', command: 'gum' }).state === 'granted';
	return enabled;
}

// --- gum plumbing --------------------------------------------------------------------------------

/** Runs `gum <args>` and returns its stdout; throws on a missing binary or non-zero exit. */
function runGum(args: string[]): string {
	const output = new Deno.Command('gum', {
		args,
		env: { CLICOLOR_FORCE: '1' },
		stdout: 'piped',
		stderr: 'null',
	}).outputSync();
	if (!output.success) throw new Error(`gum exited ${output.code}`);
	return new TextDecoder().decode(output.stdout);
}

/** Marks a tone's ANSI codes: everything gum printed before and after the sentinel. */
interface ToneCodes {
	prefix: string;
	suffix: string;
}

const SENTINEL = '\u0001';
const PLAIN: ToneCodes = { prefix: '', suffix: '' };
const cache = new Map<Tone, ToneCodes>();

function codesOf(tone: Tone): ToneCodes {
	const cached = cache.get(tone);
	if (cached !== undefined) return cached;
	let codes = PLAIN;
	try {
		const styled = runGum(['style', ...TONE_ARGS[tone], SENTINEL]);
		const at = styled.indexOf(SENTINEL);
		if (at !== -1) {
			codes = { prefix: styled.slice(0, at), suffix: styled.slice(at + 1).trimEnd() };
		}
	} catch {
		enabled = false; // gum broke mid-run; stop trying for every later tone.
	}
	cache.set(tone, codes);
	return codes;
}

// --- Public surface ------------------------------------------------------------------------------

/** `text` wrapped in a tone's ANSI codes; the text itself, untouched, when styling is off. */
export function paint(text: string, tone: Tone): string {
	if (!stylingEnabled()) return text;
	const { prefix, suffix } = codesOf(tone);
	return `${prefix}${text}${suffix}`;
}

/**
 * Colours the verdict glyphs (`✓` good, `✗` bad, `✦` layer) in already-laid-out text. Safe to
 * apply after padding: each replacement keeps the glyph's display width.
 */
export function glyphs(text: string): string {
	if (!stylingEnabled()) return text;
	return text
		.replaceAll('✓', paint('✓', 'good'))
		.replaceAll('✗', paint('✗', 'bad'))
		.replaceAll('✦', paint('✦', 'layer'));
}

/**
 * `text` in a rounded gum border (the per-sample headline card). Embedded ANSI codes are fine —
 * gum measures display width, not byte length. Falls back to the bare text when styling is off.
 */
export function banner(text: string): string {
	if (!stylingEnabled()) return text;
	try {
		return runGum([
			'style',
			'--border',
			'rounded',
			'--border-foreground',
			'245',
			'--padding',
			'0 1',
			text,
		]).replace(/\n$/, '');
	} catch {
		enabled = false;
		return text;
	}
}

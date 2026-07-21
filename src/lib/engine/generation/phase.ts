/**
 * Shared `PhaseCharacteristics` helper (doc 05 §3.2), extracted from `grammar.ts` (roadmap 2GN.5)
 * when the decorative grammar (2GN.29) needed the same dotted-path resolution `phaseInfluence`
 * already relied on. Both `grammar.ts` and `engine/generation/decoration.ts` import this rather
 * than each maintaining their own copy.
 *
 * Pure TypeScript with no framework or browser dependencies (doc 08 §2.1, the engine boundary).
 */

import type { PhaseCharacteristics } from '../../types/world.ts';

/**
 * Resolves a dotted `PhaseCharacteristics` path (e.g. `'technology.metallurgy'`) to its numeric
 * attribute. Generic over the profile's shape so new attributes need no code change here.
 *
 * Throws on a path that doesn't resolve to a number: grammar and decoration data are authored
 * in-repo (guarded by their respective data-module tests), so a miss is always an authoring typo —
 * better a loud failure than a silently skewed distribution.
 */
export function resolvePhaseAttribute(phase: PhaseCharacteristics, path: string): number {
	let current: unknown = phase;

	for (const segment of path.split('.')) {
		if (current === null || typeof current !== 'object' || !(segment in current)) {
			throw new Error(`resolvePhaseAttribute: unknown phase characteristic path '${path}'`);
		}
		current = (current as Record<string, unknown>)[segment];
	}

	if (typeof current !== 'number') {
		throw new Error(
			`resolvePhaseAttribute: phase characteristic path '${path}' does not resolve to a number`,
		);
	}

	if (!Number.isFinite(current) || current < 0 || current > 1) {
		throw new Error(
			`resolvePhaseAttribute: phase characteristic path '${path}' must be in [0, 1], got ${current}`,
		);
	}

	return current;
}

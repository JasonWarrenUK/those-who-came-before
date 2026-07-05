/**
 * Seeded pseudo-random number generation.
 *
 * The engine's determinism guarantee rests entirely on this module: the same seed string must
 * produce the same sequence of numbers, forever, on every platform. Nothing here touches the
 * framework or the browser — pure arithmetic only (doc 08 §2.1, the engine boundary).
 */

/**
 * xmur3 string hash — turns an arbitrary seed string into a stream of well-mixed 32-bit integers.
 * Used only to seed the xoshiro128** state; it is not itself the generator.
 *
 * Reference: https://github.com/bryc/code/blob/master/jshash/PRNGs.md
 */
function xmur3(seed: string): () => number {
	let hash = 1779033703 ^ seed.length;
	for (let index = 0; index < seed.length; index++) {
		hash = Math.imul(hash ^ seed.charCodeAt(index), 3432918353);
		hash = (hash << 13) | (hash >>> 19);
	}

	return (): number => {
		hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
		hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
		hash ^= hash >>> 16;
		return hash >>> 0;
	};
}

/** 32-bit left rotation, kept in unsigned range. */
function rotl(value: number, bits: number): number {
	return ((value << bits) | (value >>> (32 - bits))) >>> 0;
}

/**
 * Creates a deterministic pseudo-random number generator from a seed string.
 *
 * Algorithm: xoshiro128** (Blackman & Vigna), seeded via xmur3. Same seed produces the same
 * infinite sequence of floats in `[0, 1)`, on every call, every run, every machine.
 *
 * @param seed - Any string. Distinct seeds diverge immediately; the same seed always replays
 *   the same sequence from the start.
 * @returns A generator function; each call advances the state and returns the next float.
 */
export function createPrng(seed: string): () => number {
	const nextSeedWord = xmur3(seed);

	// Four 32-bit state words. xoshiro128** is defined as degenerate on an all-zero state, which
	// xmur3 output makes vanishingly unlikely — but guard it anyway so a pathological seed can
	// never silently produce a constant sequence.
	let state0 = nextSeedWord();
	let state1 = nextSeedWord();
	let state2 = nextSeedWord();
	let state3 = nextSeedWord();

	if ((state0 | state1 | state2 | state3) === 0) {
		state0 = 1;
	}

	return function next(): number {
		const result = Math.imul(rotl(Math.imul(state1, 5), 7), 9) >>> 0;

		const t = (state1 << 9) >>> 0;

		state2 ^= state0;
		state3 ^= state1;
		state1 ^= state2;
		state0 ^= state3;

		state2 ^= t;
		state3 = rotl(state3, 11);

		return result / 4294967296; // 2**32 — normalises to [0, 1)
	};
}

/**
 * Selects one item from a weighted list using a seeded PRNG.
 *
 * Weight extraction is delegated to a callback rather than a fixed field name, since callers in
 * the generation pipeline use differently-shaped items (e.g. `{ effectiveWeight }` for grammar
 * options, `{ weight }` for materials — doc 05 §4, §6).
 *
 * @param items - Candidates to select from. Must be non-empty.
 * @param prng - A generator from `createPrng`, or any `() => number` in `[0, 1)`.
 * @param getWeight - Returns a non-negative weight for an item. Items with zero total weight
 *   fall back to a uniform draw, so a bad weighting table degrades gracefully rather than
 *   crashing or silently always picking the first item.
 * @returns The selected item.
 */
export function weightedSelect<T>(
	items: readonly T[],
	prng: () => number,
	getWeight: (item: T) => number,
): T {
	if (items.length === 0) {
		throw new Error('weightedSelect: items must not be empty');
	}

	const totalWeight = items.reduce((sum, item) => sum + Math.max(0, getWeight(item)), 0);

	if (totalWeight <= 0) {
		const index = Math.floor(prng() * items.length);
		return items[Math.min(index, items.length - 1)];
	}

	let remaining = prng() * totalWeight;
	for (const item of items) {
		remaining -= Math.max(0, getWeight(item));
		if (remaining <= 0) {
			return item;
		}
	}

	// Floating-point drift can leave a sliver of `remaining` unconsumed; the last item covers it.
	return items[items.length - 1];
}

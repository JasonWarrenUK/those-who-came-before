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

	const weights = items.map((item) => Math.max(0, getWeight(item)));
	const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

	if (totalWeight <= 0) {
		const index = Math.floor(prng() * items.length);
		return items[Math.min(index, items.length - 1)];
	}

	let remaining = prng() * totalWeight;
	for (let i = 0; i < items.length; i++) {
		remaining -= weights[i];
		if (remaining <= 0) {
			return items[i];
		}
	}

	// Floating-point drift can leave a sliver of `remaining` unconsumed; the last item covers it.
	return items[items.length - 1];
}

/**
 * How sharply `pickRanked` favours the front of its list. `0.3` is gen's (Zompist) "Medium"
 * setting, adopted via `the-tongue`'s `1eng-16` survey. Expected shares over a 10-member list:
 * `.300 .210 .147 .103 .072 .050 .035 .025 .017 .041` — the last absorbs the whole tail.
 */
export const RANKED_DROPOFF = 0.3;

/**
 * Selects from a **markedness-ordered** list with a geometric dropoff, so the front is drawn far
 * more often than the tail.
 *
 * Distinct from `weightedSelect`, which takes explicit per-item weights: here the weight *is* the
 * position, which suits vocabularies whose natural frequency follows their ordering — phoneme
 * inventories above all. Drawing phonemes uniformly is what makes generated words read as noise
 * rather than as a language; `the-tongue`'s survey of Zompist's tools named the uniform draw as the
 * one clear deficiency in an otherwise strong model.
 *
 * ⚠️ **The caller's ordering is load-bearing.** This function assumes `items` is sorted commonest
 * first and cannot detect otherwise; handing it an arbitrary order silently produces an arbitrary
 * frequency distribution rather than an error.
 *
 * Implemented by inverting the geometric CDF, which costs exactly **one** `prng()` call regardless
 * of list length. A rejection-sampling loop would consume a variable number of draws, so any change
 * in list length would shift every subsequent value in the stream and break determinism across
 * inventory sizes.
 *
 * @param items - Candidates, ordered commonest first. Must be non-empty.
 * @param prng - A generator from `createPrng`, or any `() => number` in `[0, 1)`.
 * @returns The selected item; indices past the end clamp to the last item.
 */
export function pickRanked<T>(items: readonly T[], prng: () => number): T {
	if (items.length === 0) {
		throw new Error('pickRanked: items must not be empty');
	}

	if (items.length === 1) {
		return items[0];
	}

	// Inverse geometric CDF. `Math.log(1 - u)` is negative and `Math.log(1 - DROPOFF)` likewise, so
	// the quotient is non-negative; `u === 0` yields index 0.
	const index = Math.floor(Math.log(1 - prng()) / Math.log(1 - RANKED_DROPOFF));
	return items[Math.min(index, items.length - 1)];
}

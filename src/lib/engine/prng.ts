/**
 * Seeded PRNG implementation using xoshiro128**
 *
 * Determinism guarantee: same seed = same sequence of values, always.
 * This is the foundation of reproducible world generation.
 *
 * References:
 *   - Blackman & Vigna, "Scrambled Linear Pseudorandom Number Generators"
 *   - doc 05, section 2 (WorldSeed)
 *   - doc 08, section 5.2 (Deterministic Testing)
 */

/**
 * Hash a string seed into a 128-bit state using a simple mixing function.
 * Uses MurmurHash3-style mixing to produce 4 independent 32-bit values.
 */
function hashSeed(seed: string): [number, number, number, number] {
	let h = 1779033703;
	for (let i = 0; i < seed.length; i++) {
		h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
		h = (h << 13) | (h >>> 19);
	}

	// Generate 4 state values by further mixing
	const s0 = splitmix32(h);
	const s1 = splitmix32(s0);
	const s2 = splitmix32(s1);
	const s3 = splitmix32(s2);

	return [s0, s1, s2, s3];
}

/**
 * SplitMix32 — used to expand a single hash into the 128-bit state.
 */
function splitmix32(state: number): number {
	state = (state + 0x9e3779b9) | 0;
	state = Math.imul(state ^ (state >>> 16), 0x85ebca6b);
	state = Math.imul(state ^ (state >>> 13), 0xc2b2ae35);
	return (state ^ (state >>> 16)) >>> 0;
}

/**
 * Create a seeded PRNG using xoshiro128**.
 *
 * Returns a function that produces uniform random numbers in [0, 1).
 * Calling with the same seed always produces the same sequence.
 *
 * @param seed - A string seed for deterministic generation
 * @returns A function () => number that returns values in [0, 1)
 */
export function createPrng(seed: string): () => number {
	let [s0, s1, s2, s3] = hashSeed(seed);

	// Ensure state is never all-zero (invalid for xoshiro)
	if ((s0 | s1 | s2 | s3) === 0) {
		s0 = 1;
	}

	return function next(): number {
		// xoshiro128** algorithm
		const result = Math.imul(rotl(Math.imul(s1, 5), 7), 9);

		const t = s1 << 9;
		s2 ^= s0;
		s3 ^= s1;
		s1 ^= s2;
		s0 ^= s3;
		s2 ^= t;
		s3 = rotl(s3, 11);

		return (result >>> 0) / 4294967296; // Convert to [0, 1)
	};
}

/**
 * 32-bit left rotation.
 */
function rotl(x: number, k: number): number {
	return ((x << k) | (x >>> (32 - k))) | 0;
}

/**
 * Select a weighted random element from an array.
 *
 * @param items - Array of { item, weight } objects
 * @param prng - Seeded PRNG function
 * @returns The selected item
 */
export function weightedSelect<T>(
	items: Array<{ item: T; weight: number }>,
	prng: () => number
): T {
	const totalWeight = items.reduce((sum, entry) => sum + entry.weight, 0);
	let roll = prng() * totalWeight;

	for (const entry of items) {
		roll -= entry.weight;
		if (roll <= 0) return entry.item;
	}

	// Fallback (shouldn't happen with valid weights)
	return items[items.length - 1].item;
}

/**
 * Generate a random integer in [min, max] inclusive.
 */
export function randomInt(min: number, max: number, prng: () => number): number {
	return min + Math.floor(prng() * (max - min + 1));
}

/**
 * Shuffle an array in place using Fisher-Yates.
 */
export function shuffle<T>(array: T[], prng: () => number): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(prng() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

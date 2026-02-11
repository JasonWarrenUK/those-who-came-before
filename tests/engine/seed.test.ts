import { describe, it, expect } from 'vitest';
import { createWorldSeed } from '$lib/engine/world/seed.js';

describe('createWorldSeed', () => {
	it('creates a WorldSeed with the raw string', () => {
		const seed = createWorldSeed('my-world');
		expect(seed.raw).toBe('my-world');
	});

	it('provides a deterministic PRNG function', () => {
		const seed1 = createWorldSeed('deterministic-world');
		const seed2 = createWorldSeed('deterministic-world');

		const values1 = Array.from({ length: 100 }, () => seed1.prng());
		const values2 = Array.from({ length: 100 }, () => seed2.prng());

		expect(values1).toEqual(values2);
	});

	it('different seeds produce different PRNG sequences', () => {
		const seed1 = createWorldSeed('world-alpha');
		const seed2 = createWorldSeed('world-beta');

		const values1 = Array.from({ length: 20 }, () => seed1.prng());
		const values2 = Array.from({ length: 20 }, () => seed2.prng());

		expect(values1).not.toEqual(values2);
	});
});

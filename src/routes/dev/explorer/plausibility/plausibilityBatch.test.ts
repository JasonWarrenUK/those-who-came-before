/// <reference lib="deno.ns" />
import { assertEquals } from '@std/assert';
import { runBatch } from './plausibilityBatch.ts';
import { checkPlausibility } from '../../../../lib/engine/generation/plausibility.ts';
import { EXPLORER_CULTURES } from '../../../../lib/data/explorer-cultures.ts';

const tarpan = EXPLORER_CULTURES.find((culture) => culture.id === 'tarpan')!;
const khaltiris = EXPLORER_CULTURES.find((culture) => culture.id === 'khaltiris')!;

Deno.test('runBatch — produces exactly `count` entries', () => {
	const batch = runBatch('batch-count', 7, tarpan);
	assertEquals(batch.entries.length, 7);
});

Deno.test('runBatch — a non-positive count yields an empty batch with zero rejection rate', () => {
	const batch = runBatch('batch-empty', 0, tarpan);
	assertEquals(batch.entries, []);
	assertEquals(batch.rejectionRate, 0);
});

Deno.test('runBatch — each entry gets a distinct, index-suffixed seed', () => {
	const batch = runBatch('batch-seeds', 5, tarpan);
	const seeds = batch.entries.map((entry) => entry.seed);
	assertEquals(seeds, [
		'batch-seeds-0',
		'batch-seeds-1',
		'batch-seeds-2',
		'batch-seeds-3',
		'batch-seeds-4',
	]);
	assertEquals(new Set(seeds).size, 5); // All distinct.
});

Deno.test('runBatch — is deterministic for the same seed, count and culture', () => {
	const batchA = runBatch('batch-determinism', 10, khaltiris);
	const batchB = runBatch('batch-determinism', 10, khaltiris);
	assertEquals(batchA, batchB);
});

Deno.test("runBatch — each entry's result matches calling checkPlausibility directly on its artefact", () => {
	const batch = runBatch('batch-cross-check', 10, khaltiris);
	for (const entry of batch.entries) {
		assertEquals(entry.result, checkPlausibility(entry.artefact));
	}
});

Deno.test('runBatch — rejectionRate is failed-count divided by total', () => {
	const batch = runBatch('batch-rate', 25, tarpan);
	const failed = batch.entries.filter((entry) => !entry.result.valid).length;
	assertEquals(batch.rejectionRate, failed / 25);
});

Deno.test('runBatch — valid entries carry no failure reasons, invalid entries carry at least one', () => {
	const batch = runBatch('batch-reasons', 30, khaltiris);
	for (const entry of batch.entries) {
		if (entry.result.valid) {
			assertEquals(entry.result.failures, []);
		} else {
			assertEquals(entry.result.failures.length > 0, true);
		}
	}
});

Deno.test('runBatch — different cultures can drive the same seed through different generation, producing a well-formed batch either way', () => {
	const seed = 'batch-culture-variation';
	const tarpanBatch = runBatch(seed, 15, tarpan);
	const khaltirisBatch = runBatch(seed, 15, khaltiris);

	// Not asserting the rejection rates differ (the 4-rule MVP set may coincidentally agree) —
	// asserting the pipeline is wired correctly for both cultures instead.
	assertEquals(tarpanBatch.entries.length, 15);
	assertEquals(khaltirisBatch.entries.length, 15);
	for (const batch of [tarpanBatch, khaltirisBatch]) {
		assertEquals(batch.rejectionRate >= 0 && batch.rejectionRate <= 1, true);
	}
});

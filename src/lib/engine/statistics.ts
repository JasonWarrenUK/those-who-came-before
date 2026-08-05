/**
 * Deterministic percentile arithmetic, used to sample culture-relative classification baselines
 * (roadmap 2GN.94/2GN.95, doc 11 §2.9, doc 12 §2.28). Pure and framework-free, sibling to
 * `prng.ts` (doc 08 §2.1, the engine boundary).
 */

/**
 * The fixed percentile rungs baselines are sampled at (doc 11 §2.9, doc 12 §2.28).
 *
 * A closed ladder rather than an arbitrary float, so a stored baseline is five numbers rather than
 * a raw 400-value sample, and so two rules asking "p75" always ask the same question. p50/p75/p90
 * are the three the shipped `classification.ts` thresholds were measured at; p25 and p95 are
 * included because `utilitarian`/`everyday` rules read the low end of the same distributions
 * `elite` reads the high end of, and a ladder that only reached upward would force those rules to
 * express "below ordinary" as "not above p50".
 */
export const PERCENTILE_LADDER = [0.25, 0.5, 0.75, 0.9, 0.95] as const;

function assertValidInput(values: readonly number[], percentile: number): void {
	if (values.length === 0) {
		throw new Error('percentileOf: values must not be empty');
	}
	if (!Number.isFinite(percentile) || percentile < 0 || percentile > 1) {
		throw new Error(`percentileOf: percentile must be in [0, 1], got ${percentile}`);
	}
	for (const value of values) {
		if (!Number.isFinite(value)) {
			throw new Error(`percentileOf: values must all be finite, got ${value}`);
		}
	}
}

/**
 * The `percentile` of `values`, by linear interpolation between the two bracketing order
 * statistics (the R-7 / "inclusive" convention — NumPy's default, spreadsheet `PERCENTILE.INC`).
 *
 * Interpolating rather than nearest-rank is a ruled requirement, not a taste call: doc 12 §2.28
 * measured `appliedElementCount` taking only 9–16 distinct integer values, so a nearest-rank p90
 * flips between adjacent integers at any sample size — granularity that lives in the generator and
 * no sampling budget fixes. A fractional threshold moves continuously with the culture.
 *
 * Deterministic and pure: same values in (any order — the input is copied and sorted with an
 * explicit numeric comparator, never the lexicographic default), same number out. Never mutates
 * `values`.
 *
 * @param values - The sample. Must be non-empty and finite throughout.
 * @param percentile - Fraction in `[0, 1]`.
 * @throws If `values` is empty, contains a non-finite number, or `percentile` is out of range —
 *   each of which would otherwise yield `NaN` or `undefined` and propagate silently into a
 *   threshold nobody could trace.
 */
export function percentileOf(values: readonly number[], percentile: number): number {
	assertValidInput(values, percentile);

	const sorted = [...values].sort((a, b) => a - b);
	if (sorted.length === 1) {
		return sorted[0];
	}

	// R-7: rank is a fractional index into the sorted sample, interpolated between its floor and
	// ceiling neighbours.
	const rank = percentile * (sorted.length - 1);
	const lowerIndex = Math.floor(rank);
	const upperIndex = Math.ceil(rank);
	const fraction = rank - lowerIndex;

	return sorted[lowerIndex] + fraction * (sorted[upperIndex] - sorted[lowerIndex]);
}

/**
 * Every `PERCENTILE_LADDER` rung of `values`, in one sort.
 *
 * @param values - The sample. Must be non-empty and finite throughout.
 * @throws Same conditions as {@link percentileOf}.
 */
export function percentileLadder(values: readonly number[]): Map<number, number> {
	assertValidInput(values, PERCENTILE_LADDER[0]);

	const sorted = [...values].sort((a, b) => a - b);
	const ladder = new Map<number, number>();

	for (const rung of PERCENTILE_LADDER) {
		if (sorted.length === 1) {
			ladder.set(rung, sorted[0]);
			continue;
		}

		const rank = rung * (sorted.length - 1);
		const lowerIndex = Math.floor(rank);
		const upperIndex = Math.ceil(rank);
		const fraction = rank - lowerIndex;

		ladder.set(rung, sorted[lowerIndex] + fraction * (sorted[upperIndex] - sorted[lowerIndex]));
	}

	return ladder;
}

/**
 * Column sorting for the Explorer's report tables (calibration panel first; any panel with a
 * sortable table reads from here).
 *
 * The sort is a pure function over an already-computed report: clicking a header never re-runs a
 * sample, it only reorders rows the panel already holds. Kept out of the Svelte file so the
 * comparison rules (numbers numeric, strings by locale, missing values last whichever way the
 * column points) are unit-testable per the `structureTree.ts` precedent.
 */

export type SortDirection = 'asc' | 'desc';

/** Which column a table is sorted on and which way. `key: null` is the report's own order. */
export interface SortState<K extends string> {
	key: K | null;
	direction: SortDirection;
}

/** A column's sortable value. `undefined` sorts last in either direction. */
export type SortValue = string | number | undefined;

/** How a sortable column reads its value from a row, and the direction a first click gives it. */
export interface SortColumn<T> {
	value: (row: T) => SortValue;

	/** Numeric columns usually want the biggest first on the first click; text columns A to Z. */
	defaultDirection: SortDirection;
}

/**
 * Compares two column values: numbers numerically, strings by locale, mixed types by string form.
 * `undefined` is always greater than a value so it sinks to the bottom under `asc`; `sortRows`
 * keeps it at the bottom under `desc` too rather than floating a blank row to the top.
 */
export function compareValues(a: SortValue, b: SortValue): number {
	if (a === undefined && b === undefined) return 0;
	if (a === undefined) return 1;
	if (b === undefined) return -1;
	if (typeof a === 'number' && typeof b === 'number') return a - b;
	return String(a).localeCompare(String(b));
}

/**
 * Returns `rows` sorted by `value`, missing values last regardless of direction. Stable, so rows
 * that tie keep the report's own order, and pure: `rows` is never mutated.
 */
export function sortRows<T>(
	rows: readonly T[],
	value: (row: T) => SortValue,
	direction: SortDirection,
): T[] {
	const sign = direction === 'asc' ? 1 : -1;
	return [...rows].sort((left, right) => {
		const a = value(left);
		const b = value(right);
		// Missing values sink whichever way the column points.
		if (a === undefined || b === undefined) return compareValues(a, b);
		return sign * compareValues(a, b);
	});
}

/**
 * The sort state after clicking `key`: a new column takes its default direction, the current
 * column flips.
 */
export function nextSort<K extends string>(
	current: SortState<K>,
	key: K,
	defaultDirection: SortDirection,
): SortState<K> {
	if (current.key !== key) return { key, direction: defaultDirection };
	return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
}

/** Applies a `SortState` to `rows` against a column map; `key: null` returns the rows as given. */
export function applySort<T, K extends string>(
	rows: readonly T[],
	columns: Record<K, SortColumn<T>>,
	state: SortState<K>,
): T[] {
	if (state.key === null) return [...rows];
	return sortRows(rows, columns[state.key].value, state.direction);
}

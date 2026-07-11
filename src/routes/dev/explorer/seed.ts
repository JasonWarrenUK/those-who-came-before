/**
 * Shared seed for the Project Explorer shell (1FD.37).
 *
 * The seed lives in the `?seed=` query param so it survives reloads and repro cases are
 * shareable via link. Panel nav links must carry `page.url.search` to preserve it.
 */
export const DEFAULT_SEED = 'those-who-came-before';

/** Reads the Explorer seed from a URL, falling back to the default when absent or empty. */
export function getSeed(url: URL): string {
	return url.searchParams.get('seed') || DEFAULT_SEED;
}

import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';

/** Dev-only subtree: every route under /dev is hidden in production builds. */
export function load(): void {
	if (!dev) error(404, 'Not found');
}

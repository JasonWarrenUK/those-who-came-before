import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

/** Dev-only subtree: every route under /dev is hidden in production builds. */
export const load: LayoutLoad = () => {
	if (!dev) error(404, 'Not found');
};

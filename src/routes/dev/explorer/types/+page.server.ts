/// <reference types="vite/client" />
import type { PageServerLoad } from './$types';
import { parseTypeModule } from './typeIndex';

/**
 * Raw sources of every registered type module, collected at build time. The glob keeps the panel
 * zero-maintenance: a new file in `src/lib/types/` appears in the index automatically.
 * `term.test.ts` lives in that directory, so test files are excluded explicitly.
 */
const sources = import.meta.glob(['/src/lib/types/*.ts', '!**/*.test.ts'], {
	query: '?raw',
	import: 'default',
	eager: true,
}) as Record<string, string>;

// Parsed once at module scope: the sources are fixed for the lifetime of the server, so there is
// nothing per-request about this work. Server-side only, keeping the multi-megabyte `typescript`
// parser out of the client bundle.
const modules = Object.entries(sources)
	.map(([path, source]) => parseTypeModule(path.split('/').pop() ?? path, source))
	.sort((a, b) => a.fileName.localeCompare(b.fileName));

export const load: PageServerLoad = () => {
	return { modules };
};

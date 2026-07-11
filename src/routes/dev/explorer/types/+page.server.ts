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
const parsed = Object.entries(sources)
	.map(([path, source]) => parseTypeModule(path.split('/').pop() ?? path, source))
	.sort((a, b) => a.fileName.localeCompare(b.fileName));

/**
 * Registered type name → home module. Names are globally unique across `src/lib/types/` (verified
 * at 1FD.39), so a flat map is safe. Drives reference filtering here and cross-reference links,
 * neighbourhood diagrams and reverse lookups client-side.
 */
const registry: Record<string, string> = {};
for (const module of parsed) {
	for (const declaration of module.declarations) {
		registry[declaration.name] = module.fileName;
	}
}

// The parser reports references raw (it cannot know the registry from one module); only names
// registered here are meaningful — the rest are built-ins like `Map` and `Record`.
const modules = parsed.map((module) => ({
	...module,
	declarations: module.declarations.map((declaration) => ({
		...declaration,
		references: declaration.references.filter((name) => name in registry),
	})),
}));

export const load: PageServerLoad = () => {
	return { modules, registry };
};

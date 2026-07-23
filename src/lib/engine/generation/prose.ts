/**
 * Prose rendering of a `NormalisedComponent`'s parameters (doc 05 §5.3), shared between the
 * `scripts/dev/sample-*.ts` CLI samplers and the Project Explorer's structure viewer (roadmap
 * 2GN.57) — both need the same "long, rectangular section, double edge" phrasing, so it lives
 * under `engine/` rather than duplicated or imported cross-boundary from `scripts/dev/` (which
 * Vite refuses to serve to the browser; it sits outside the project's served roots).
 *
 * Pure and framework-free per the engine boundary (doc 08 §2.1): no console output, no CLI
 * concerns — `printAnatomy` in `scripts/dev/shared.ts` owns those.
 */

import type { NormalisedComponent } from '../../types/artefact.ts';

/** Short display id for a component: its position along the primary axis (`c0`, `c1`…). */
export function shortId(component: NormalisedComponent): string {
	return `c${component.position}`;
}

/** Reads a component property as a display string; `undefined` when absent. */
function propOf(component: NormalisedComponent, name: string): string | undefined {
	const value = component.properties.get(name);
	return value === undefined ? undefined : String(value);
}

/** Applies a phrase mapper to a property when present. */
function fragment(
	component: NormalisedComponent,
	name: string,
	phrase: (value: string) => string | undefined,
): string | undefined {
	const value = propOf(component, name);
	return value === undefined ? undefined : phrase(value);
}

/**
 * Phrase builders per primitive, in display order. Each maps a raw parameter value to a prose
 * fragment, or `undefined` to omit it (e.g. `point=none` says nothing). Unknown values pass
 * through raw so new grammar vocabulary is still visible rather than hidden.
 */
const PROSE: Record<string, ((c: NormalisedComponent) => string | undefined)[]> = {
	'elongated': [
		(c) => propOf(c, 'length'),
		(c) => fragment(c, 'crossSection', (v) => `${v} section`),
		(c) => fragment(c, 'taper', (v) => v === 'none' ? undefined : `${v} taper`),
		(c) => fragment(c, 'edge', (v) => v === 'none' ? undefined : `${v} edge`),
		(c) => fragment(c, 'point', (v) => v === 'none' ? undefined : `${v} point`),
	],
	'cylindrical': [
		(c) => propOf(c, 'length'),
		(c) => fragment(c, 'diameter', (v) => `${v} bore`),
		(c) => fragment(c, 'wall', (v) => `${v} wall`),
		(c) => fragment(c, 'opening', (v) => v === 'open' ? 'open' : `${v} opening`),
		(c) => fragment(c, 'base', (v) => `${v} base`),
	],
	'hollow-enclosed': [
		(c) => propOf(c, 'shape'),
		(c) => propOf(c, 'size'),
		(c) => fragment(c, 'wall', (v) => `${v} wall`),
		(c) => fragment(c, 'opening', (v) => v === 'none' ? 'no opening' : `${v} opening`),
		(c) => fragment(c, 'base', (v) => `${v} base`),
	],
	'flat-broad': [
		(c) => propOf(c, 'shape'),
		(c) => propOf(c, 'size'),
		(c) => propOf(c, 'thickness'),
		(c) =>
			fragment(c, 'curvature', (v) => {
				if (v === 'flat') return 'flat';
				return v === 'deep' ? 'deeply curved' : `${v} curve`;
			}),
		(c) =>
			fragment(c, 'perforation', (v) => {
				if (v === 'none') return undefined;
				return v === 'multiple' ? 'multiple perforations' : `${v} perforation`;
			}),
	],
	'ring-form': [
		(c) => propOf(c, 'diameter'),
		(c) => fragment(c, 'crossSection', (v) => `${v} section`),
		(c) => fragment(c, 'gap', (v) => `${v} gap`),
	],
	'disc-form': [
		(c) => propOf(c, 'diameter'),
		(c) => propOf(c, 'thickness'),
		(c) => fragment(c, 'perforation', (v) => v === 'none' ? undefined : `${v} perforation`),
	],
	'bar-form': [
		(c) => propOf(c, 'length'),
		(c) => fragment(c, 'crossSection', (v) => `${v} section`),
		(c) =>
			fragment(c, 'taper', (v) => {
				if (v === 'none') return 'untapered';
				if (v === 'single-end') return 'tapered one end';
				return v === 'both-ends' ? 'tapered both ends' : `${v} taper`;
			}),
	],
	'sheet-form': [
		(c) => propOf(c, 'size'),
		(c) => propOf(c, 'shape'),
		(c) => propOf(c, 'flexibility'),
	],
};

/** Prose rendering of a component's parameters; raw `key=value` for unknown primitives. */
export function describeProse(component: NormalisedComponent): string {
	const builders = PROSE[component.primitiveType];
	if (builders === undefined) {
		return [...component.properties.entries()].map(([k, v]) => `${k}=${v}`).join(', ');
	}
	return builders
		.map((build) => build(component))
		.filter((piece): piece is string => piece !== undefined)
		.join(', ');
}

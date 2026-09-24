/**
 * Stage 9: description generation (doc 05 §13, doc 04 §3.4, roadmap 2GN.38). Assembles a
 * `ClassifiedArtefact` into the `ArtefactPresentation` an agent reads: register-selected,
 * condition-gated prose per structural component, plus a neutral provenance projection.
 *
 * **No lens yet (M6).** Register and variant selection is deliberately neutral: it reads only the
 * component's own properties, its assigned material and the caller-supplied register list — never
 * `ClassifiedArtefact.groundTruthTags`, which is occluded engine truth (doc 05 §9.3) and must never
 * leak through framing (Pillar 2, diegesis first). Register preference when no lens exists defaults
 * to observational (doc 04 §3.4: "observational register... default when no hypotheses exist"),
 * falling back through `REGISTER_PREFERENCE` when a caller's `registers` list excludes it. Every
 * observation is `salience: 1.0` and lands in `primaryObservations` — the salience channel doesn't
 * exist until the lens does (roadmap 6LS), so there is nothing to weight low enough for
 * `secondaryObservations`, and inventing a threshold constant here would be an unreviewed
 * calibration decision (the 2GN.88 failure mode). `suggestedTags` and `crossReferences` stay empty
 * for the same reason: both are lens-computed (roadmap 6LS.11) from occluded/derived data this
 * module has no business touching.
 *
 * **Scope.** Structural components only — decoration slots key off motif/material values rather
 * than `NormalisedComponent.properties`, so per-layer description is roadmap 2GN.41. One
 * observation per property, in the single foregrounded register — all three registers per
 * component is roadmap 2GN.40. `label` passes `physicalLabel` through unchanged (roadmap 2GN.42
 * owns composing it). Provenance is a data projection, never prose (roadmap 2GN.43).
 *
 * **Variant selection absorbs roadmap 2GN.93.** `matchesCondition` honours every `VariantCondition`
 * field — `values` (the template's own parameter) plus the material gate (`craftDomain`,
 * `materialId`, `materialTag`), joined via `ClassifiedArtefact.materials` against a material
 * catalogue. A material condition **fails closed** when the component's material can't be
 * resolved: an unconditioned reading about the object's form is safe to show without knowing what
 * it's made of, but a claim gated on material must never fire for material this module can't
 * verify. This was tracked as a separate task (2GN.93) until dependency review folded it in here —
 * see that task's own note on why one selection path, not two.
 *
 * **Provisional expansion.** `SLOT_PATTERN`/`withArticle`/`expand` are unchanged from `prose.ts`
 * (roadmap 2GN.35's minimal `#slot#` expander). Real template expansion — property slots beyond a
 * component's own raw values, decorative sublayer composition — is roadmap 2GN.39, which supersedes
 * this trio once it lands.
 *
 * Pure and framework-free per the engine boundary (doc 08 §2.1): no console output, no browser or
 * Svelte imports, PRNG-free (Stage 9 has nothing left to randomise).
 */

import type {
	ClassifiedArtefact,
	MaterialDefinition,
	NormalisedComponent,
} from '../../types/artefact.ts';
import type {
	ArtefactPresentation,
	DescriptionTemplate,
	DescriptionVariant,
	PresentedObservation,
	ProvenancePresentation,
	VariantCondition,
} from '../../types/description.ts';
import type { DescriptionRegister } from '../../types/lens.ts';
import type { Provenance } from '../../types/world.ts';
import { OBSERVATIONAL_TEMPLATES } from '../../data/descriptions/observational/index.ts';
import { INTERPRETIVE_TEMPLATES } from '../../data/descriptions/interpretive/index.ts';
import { TECHNICAL_TEMPLATES } from '../../data/descriptions/technical/index.ts';
import { MATERIALS } from '../../data/materials.ts';
import { renderName } from '../world/naming.ts';

/** Matches `#slot#` and `#slot.a#` placeholders; shared with `data/descriptions/*\/index.test.ts`'s slot-id extraction. */
export const SLOT_PATTERN = /#([a-zA-Z][\w-]*?)(\.a)?#/g;

const VOWEL_SOUND = /^[aeiou]/i;

/** Prefixes a value with "a"/"an" per its leading sound. */
function withArticle(value: string): string {
	return `${VOWEL_SOUND.test(value) ? 'an' : 'a'} ${value}`;
}

/**
 * Expands `#slot#` and `#slot.a#` placeholders against a component's raw property values.
 * `undefined` when any referenced slot is absent — the whole sentence is dropped rather than
 * rendered with a hole, matching doc 05 §5.3's per-primitive parameter scoping. A slot valued
 * `'none'` also drops the clause here — the right behaviour for parameters where `'none'` means
 * "nothing to observe" (e.g. `elongated.taper`). Parameters where `'none'` is itself an observable
 * fact (e.g. a sealed vessel's `opening`) instead get a sibling variant gated by
 * `condition: { values: ['none'] }` with no slots, selected by `selectVariant` before this function
 * runs.
 *
 * Provisional (roadmap 2GN.39 supersedes) — unchanged from `prose.ts`'s original. Exported for
 * `prose.ts`'s `describeProse`, its only caller outside this module.
 */
export function expand(
	template: string,
	properties: Map<string, string | number>,
): string | undefined {
	let sawNoneOrMissing = false;
	const expanded = template.replace(
		SLOT_PATTERN,
		(_match, slot: string, article) => {
			const value = properties.get(slot);
			if (value === undefined || value === 'none') {
				sawNoneOrMissing = true;
				return '';
			}
			return article ? withArticle(String(value)) : String(value);
		},
	);
	if (sawNoneOrMissing) return undefined;
	return expanded.charAt(0).toUpperCase() + expanded.slice(1);
}

/** Every authored register, keyed for lookup — the three-value MVP scope (doc 12 §2.10). */
export const TEMPLATES_BY_REGISTER: Readonly<
	Record<DescriptionRegister, readonly DescriptionTemplate[]>
> = {
	observational: OBSERVATIONAL_TEMPLATES,
	interpretive: INTERPRETIVE_TEMPLATES,
	technical: TECHNICAL_TEMPLATES,
};

/**
 * Neutral register preference (doc 04 §3.4: observational is "default when no hypotheses exist").
 * The foregrounded register is the first of these present in a caller's `registers` list — this is
 * not a lens decision, just a sane order to fall back through until one exists (roadmap 6LS).
 */
export const REGISTER_PREFERENCE: readonly DescriptionRegister[] = [
	'observational',
	'interpretive',
	'technical',
];

/**
 * First entry of `REGISTER_PREFERENCE` present in `registers`. Throws when `registers` is empty.
 * `REGISTER_PREFERENCE` is exhaustive over the three-value `DescriptionRegister` type (pinned by
 * `description.test.ts`), so a non-empty `registers` always contains at least one member of it —
 * there is no reachable case where every register in `registers` falls outside the preference list.
 */
function foregroundedRegister(registers: readonly DescriptionRegister[]): DescriptionRegister {
	if (registers.length === 0) {
		throw new Error('generateDescription: registers must not be empty');
	}
	const preferred = REGISTER_PREFERENCE.find((r) => registers.includes(r));
	if (preferred === undefined) {
		throw new Error('generateDescription: unreachable — REGISTER_PREFERENCE is exhaustive');
	}
	return preferred;
}

/**
 * Resolves the component's own value for the template's owning parameter (the suffix of its
 * `property` id) and whether the material gate's fields, if present, admit the component's
 * assigned material. Fields are optional and any-of within, AND across (per `VariantCondition`'s
 * own doc). Material fields fail closed — absent `material` never satisfies a `craftDomain`,
 * `materialId` or `materialTag` gate, since a claim conditioned on material must never fire for
 * material this function can't verify.
 */
function matchesCondition(
	condition: VariantCondition | undefined,
	value: string | undefined,
	material: MaterialDefinition | undefined,
): boolean {
	if (condition === undefined) return true;

	if (condition.values !== undefined) {
		if (value === undefined || !condition.values.includes(value)) return false;
	}

	const hasMaterialGate = condition.craftDomain !== undefined ||
		condition.materialId !== undefined ||
		condition.materialTag !== undefined;
	if (hasMaterialGate) {
		if (material === undefined) return false;
		if (
			condition.craftDomain !== undefined && !condition.craftDomain.includes(material.craftDomain)
		) {
			return false;
		}
		if (condition.materialId !== undefined && !condition.materialId.includes(material.id)) {
			return false;
		}
		if (
			condition.materialTag !== undefined &&
			!condition.materialTag.some((tag) => material.tags.includes(tag))
		) {
			return false;
		}
	}

	return true;
}

/**
 * First variant in the given register whose `condition` admits the component's value and assigned
 * material (roadmap 2GN.38, absorbing 2GN.93's material join). Selection order is
 * condition-then-emphasis per `DescriptionVariant`'s own doc; the emphasis step is a lens decision
 * (roadmap 6LS) and stays a no-op here — first condition-passing variant in authored order.
 */
export function selectVariant(
	template: DescriptionTemplate,
	register: DescriptionRegister,
	properties: Map<string, string | number>,
	material: MaterialDefinition | undefined,
): DescriptionVariant | undefined {
	const parameter = template.property.split('.').at(-1);
	const rawValue = parameter === undefined ? undefined : properties.get(parameter);
	const value = rawValue === undefined ? undefined : String(rawValue);
	return template.variants.find(
		(v) => v.register === register && matchesCondition(v.condition, value, material),
	);
}

/** The material assigned to `componentId`, resolved against `catalogue`. `undefined` when unassigned or unknown. */
function resolveComponentMaterial(
	artefact: ClassifiedArtefact,
	componentId: string,
	catalogue: readonly MaterialDefinition[],
): MaterialDefinition | undefined {
	const assignment = artefact.materials.find((m) => m.componentId === componentId);
	if (assignment === undefined) return undefined;
	return catalogue.find((m) => m.id === assignment.materialId);
}

/**
 * Renders one component's observations in a single register. `propertyId` is component-scoped
 * (`${component.id}:${template.property}`) so two components of the same primitive type never
 * collide. `rawData` carries the rendered parameter's raw value plus the resolved material id when
 * known — never `MaterialAssignment.standing` or its provenance, both occluded (doc 05 §9.3).
 * Templates with no condition-passing variant, or whose variant expands to `undefined` (an
 * unmeasured/`'none'` property), are dropped rather than rendered with a hole.
 */
function describeComponent(
	component: NormalisedComponent,
	register: DescriptionRegister,
	material: MaterialDefinition | undefined,
	templates: readonly DescriptionTemplate[],
): PresentedObservation[] {
	const observations: PresentedObservation[] = [];

	for (const template of templates) {
		if (!template.property.startsWith(`${component.primitiveType}.`)) continue;

		const variant = selectVariant(template, register, component.properties, material);
		if (variant === undefined) continue;

		const description = expand(variant.template, component.properties);
		if (description === undefined) continue;

		const parameter = template.property.split('.').at(-1) ?? template.property;
		const rawData = new Map<string, string | number>();
		const rawValue = component.properties.get(parameter);
		if (rawValue !== undefined) rawData.set(parameter, rawValue);
		if (material !== undefined) rawData.set('material', material.id);

		observations.push({
			propertyId: `${component.id}:${template.property}`,
			description,
			salience: 1.0,
			register,
			rawData,
		});
	}

	return observations;
}

/**
 * Player-visible projection of `Provenance` (doc 05 §13.2, roadmap 1FD.31). `siteName` renders the
 * stored phoneme segments (roadmap 2GN.66); `cultureId`, `phaseId` and `year` are deliberately
 * absent (occluded — absolute dating is not free information, doc 05 §4.7). `dating` stays absent
 * until an NPC `DatingFramework` covers the layer (roadmap M9); nothing produces one yet.
 */
function projectProvenance(provenance: Provenance): ProvenancePresentation {
	return {
		siteName: renderName(provenance.site.name),
		siteType: provenance.site.type,
		region: provenance.site.region,
		layer: provenance.context.layer,
		associatedFinds: provenance.context.associatedFinds,
		condition: provenance.context.condition,
		deposition: provenance.context.deposition,
	};
}

/**
 * Assembles an `ArtefactPresentation` (doc 05 §13.2) from a fully classified artefact: one
 * observation per structural component property, in the single register `registers` foregrounds,
 * plus the provenance projection. No lens exists yet (roadmap M6/6LS.11), so ordering, tag
 * suggestions and cross-references are all neutral — see this module's own doc for what each empty
 * or uniform field defers to and why.
 *
 * @param artefact - The classified artefact to present.
 * @param registers - Registers available to the current agent; must be non-empty. The foregrounded
 *   register is the first of `REGISTER_PREFERENCE` present in this list.
 * @param templates - Template source, keyed by register. Defaults to the full authored set.
 * @param materialCatalogue - Candidate catalogue a component's assigned material resolves against,
 *   matching `extractFeatures`'s own default-param convention (`classification.ts`).
 */
export function generateDescription(
	artefact: ClassifiedArtefact,
	registers: readonly DescriptionRegister[],
	templates: Readonly<Record<DescriptionRegister, readonly DescriptionTemplate[]>> =
		TEMPLATES_BY_REGISTER,
	materialCatalogue: readonly MaterialDefinition[] = MATERIALS,
): ArtefactPresentation {
	const register = foregroundedRegister(registers);
	const registerTemplates = templates[register];

	const orderedComponents = [...artefact.components].sort((a, b) => a.position - b.position);

	const primaryObservations = orderedComponents.flatMap((component) => {
		const material = resolveComponentMaterial(artefact, component.id, materialCatalogue);
		return describeComponent(component, register, material, registerTemplates);
	});

	return {
		artefactId: artefact.id,
		label: artefact.physicalLabel,
		provenance: projectProvenance(artefact.provenance),
		primaryObservations,
		secondaryObservations: [],
		suggestedTags: [],
		crossReferences: [],
	};
}

<script lang="ts">
	import { createPrng } from '$lib/engine/prng.js';

	let seedInput = $state('default-seed');
	let prngValues: number[] = $state([]);
	let generateCount = $state(20);

	function generateValues() {
		const prng = createPrng(seedInput);
		prngValues = Array.from({ length: generateCount }, () => prng());
	}

	function verifyDeterminism(): string {
		const prng1 = createPrng(seedInput);
		const prng2 = createPrng(seedInput);
		const v1 = Array.from({ length: 100 }, () => prng1());
		const v2 = Array.from({ length: 100 }, () => prng2());
		const match = v1.every((v, i) => v === v2[i]);
		return match ? 'PASS — identical sequences' : 'FAIL — sequences diverged';
	}

	let determinismResult = $state('');

	// Type registry — all interfaces defined in src/lib/types/
	const typeRegistry = [
		{
			file: 'tags.ts',
			types: ['FunctionTag', 'ContextTag', 'MaterialTag']
		},
		{
			file: 'visibility.ts',
			types: ['PropertyVisibility']
		},
		{
			file: 'grammar.ts',
			types: [
				'Portability',
				'InspectionDepth',
				'PrimitiveType',
				'AttachmentType',
				'ArrangementPattern',
				'AccumulationConstraints',
				'GrammarRule',
				'GrammarOption',
				'ClassificationRule',
				'ExtractedFeaturesShape',
				'MaterialCompatibility'
			]
		},
		{
			file: 'decoration.ts',
			types: ['DecorativeTechnique', 'DecorativeLayer']
		},
		{
			file: 'world.ts',
			types: [
				'WorldSeed',
				'WorldChronology',
				'CultureTimeline',
				'CulturePhase',
				'PhaseCharacteristics',
				'Culture',
				'CulturalProfile',
				'MotifSet',
				'CraftInvestmentProfile',
				'CultureRelationship',
				'RelationshipPhase',
				'RelationshipDynamics',
				'MaterialFlow',
				'Provenance',
				'SiteType',
				'PreservationState',
				'DepositionType',
				'GeologicalContext',
				'RegionalAvailability',
				'AvailabilityLevel',
				'WorldState',
				'ProfessionalCorpus',
				'FrequencyRecord',
				'ContextFrequency',
				'ConsensusStatement',
				'Debate',
				'DebatePosition',
				'DatingFramework',
				'LayerDating',
				'DatingMethod',
				'NPCScholarSeed',
				'SimulatedExcavation',
				'CoverageBudget',
				'ClaimMagnitude'
			]
		},
		{
			file: 'artefact.ts',
			types: [
				'NormalisedArtefact',
				'NormalisedComponent',
				'Attachment',
				'ObjectDimensions',
				'MaterialDefinition',
				'MaterialAssignment',
				'MaterialProvenance',
				'ExtractedFeatures',
				'ClassifiedArtefact',
				'PlausibilityRule'
			]
		},
		{
			file: 'lens.ts',
			types: [
				'DescriptionRegister',
				'ObservationRegister',
				'ObservationSalience',
				'ClassificationSuggestion',
				'CrossReference',
				'DescriptionFrame',
				'OmissionCheck',
				'LensStrength',
				'LensState',
				'RegisterAccess',
				'PublicationRegister',
				'DescriptionTemplate',
				'DescriptionVariant',
				'ArtefactPresentation',
				'ProvenancePresentation',
				'PresentedObservation',
				'TagSuggestion'
			]
		},
		{
			file: 'interpretation.ts',
			types: [
				'Confidence',
				'Observation',
				'Inference',
				'EvidenceLink',
				'InferenceScope',
				'Hypothesis',
				'Publication',
				'InterpretiveModel',
				'CulturalClaim',
				'ArtefactClaim',
				'ChronologicalClaim',
				'AgentAssessment',
				'MethodologicalProfile',
				'StrainScore',
				'ArtefactStudy',
				'MaterialGeneralisation',
				'PlayerCulturalProfile',
				'InferenceProof',
				'RevisionRecord',
				'PlayerInterpretiveState',
				'HypothesisStrain'
			]
		},
		{
			file: 'contradiction.ts',
			types: [
				'ContradictionSeverity',
				'MaterialContradiction',
				'TemporalContradiction',
				'CulturalContradiction',
				'StructuralContradiction',
				'ProvenanceContradiction',
				'CorpusContradiction',
				'RarityContradiction',
				'MaterialProvenanceContradiction',
				'Contradiction',
				'ContradictionQueue',
				'QueuedContradiction',
				'DiegeticSurface',
				'Resolution'
			]
		},
		{
			file: 'career.ts',
			types: [
				'AcademicRole',
				'Reputation',
				'ReputationModifier',
				'ReputationGate',
				'CareerState',
				'ActivityType',
				'CareerActivity',
				'ActivityOutcome',
				'RoleRequirement',
				'DisseminationTransition',
				'DisseminationCareerEffect',
				'PeerReviewCareerEvent',
				'ReviewerFeedback',
				'FormReclassificationEvent'
			]
		},
		{
			file: 'scholars.ts',
			types: ['MinimalScholar']
		},
		{
			file: 'venues.ts',
			types: [
				'ContainerModel',
				'EditorialProcess',
				'AudienceEncounter',
				'SubmissionWindow',
				'TemporalMode',
				'VenueScope',
				'VenueDefinition'
			]
		},
		{
			file: 'documents.ts',
			types: [
				'DisseminationState',
				'DocumentNode',
				'Commitment',
				'KnownLineageEdge',
				'LineageGraph'
			]
		},
		{
			file: 'term.ts',
			types: [
				'TermType',
				'AcademicYear',
				'TermState',
				'ActiveActivity',
				'BackgroundDrain',
				'CompletedAction'
			]
		},
		{
			file: 'excavation.ts',
			types: ['ExcavationBatch', 'AmbiguityDistribution', 'InterpretiveLoadState']
		}
	];

	const totalTypes = typeRegistry.reduce((sum, f) => sum + f.types.length, 0);
</script>

<div class="space-y-8">
	<div class="prose">
		<h1>Project Explorer</h1>
		<p>Developer workbench for verifying each system. Grows with every phase.</p>
	</div>

	<!-- Tabs -->
	<div role="tablist" class="tabs tabs-bordered">
		<input type="radio" name="explorer-tabs" role="tab" class="tab" aria-label="PRNG" checked />
		<div role="tabpanel" class="tab-content p-4">
			<div class="space-y-6">
				<div class="card bg-base-200">
					<div class="card-body">
						<h2 class="card-title">Seeded PRNG</h2>
						<p class="text-sm opacity-70">xoshiro128** — deterministic random number generation from string seeds</p>

						<div class="form-control">
							<label class="label" for="seed-input">
								<span class="label-text">Seed</span>
							</label>
							<input
								id="seed-input"
								type="text"
								bind:value={seedInput}
								class="input input-bordered w-full max-w-md"
								placeholder="Enter a seed string..."
							/>
						</div>

						<div class="form-control">
							<label class="label" for="count-input">
								<span class="label-text">Values to generate</span>
							</label>
							<input
								id="count-input"
								type="number"
								bind:value={generateCount}
								min="1"
								max="1000"
								class="input input-bordered w-32"
							/>
						</div>

						<div class="card-actions">
							<button class="btn btn-primary" onclick={generateValues}>
								Generate Values
							</button>
							<button
								class="btn btn-secondary"
								onclick={() => (determinismResult = verifyDeterminism())}
							>
								Verify Determinism
							</button>
						</div>

						{#if determinismResult}
							<div class="alert" class:alert-success={determinismResult.includes('PASS')} class:alert-error={determinismResult.includes('FAIL')}>
								<span>{determinismResult}</span>
							</div>
						{/if}
					</div>
				</div>

				{#if prngValues.length > 0}
					<div class="card bg-base-200">
						<div class="card-body">
							<h3 class="card-title text-sm">Output ({prngValues.length} values from seed "{seedInput}")</h3>
							<div class="overflow-x-auto">
								<table class="table table-xs table-zebra">
									<thead>
										<tr>
											<th>#</th>
											<th>Value</th>
											<th>Visual</th>
										</tr>
									</thead>
									<tbody>
										{#each prngValues as value, i}
											<tr>
												<td class="font-mono opacity-50">{i + 1}</td>
												<td class="font-mono">{value.toFixed(10)}</td>
												<td>
													<progress class="progress progress-primary w-48" value={value} max="1"></progress>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<input type="radio" name="explorer-tabs" role="tab" class="tab" aria-label="Type Index" />
		<div role="tabpanel" class="tab-content p-4">
			<div class="space-y-4">
				<div class="prose">
					<h2>Type Index</h2>
					<p>All registered interfaces from the design docs (04–08). <strong>{totalTypes}</strong> types across <strong>{typeRegistry.length}</strong> files.</p>
				</div>

				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each typeRegistry as fileEntry}
						<div class="card bg-base-200 compact">
							<div class="card-body">
								<h3 class="card-title text-sm font-mono">
									types/{fileEntry.file}
									<span class="badge badge-sm">{fileEntry.types.length}</span>
								</h3>
								<ul class="text-xs font-mono space-y-0.5">
									{#each fileEntry.types as typeName}
										<li class="opacity-80">{typeName}</li>
									{/each}
								</ul>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<input type="radio" name="explorer-tabs" role="tab" class="tab" aria-label="Engine" />
		<div role="tabpanel" class="tab-content p-4">
			<div class="prose">
				<h2>Engine Modules</h2>
				<p>Skeleton modules — type-correct stubs awaiting implementation in later phases.</p>
			</div>

			<div class="grid gap-4 md:grid-cols-2 mt-4">
				{#each [
					{ name: 'generation/', modules: ['grammar', 'plausibility', 'accumulation', 'materials', 'decoration', 'classification', 'description', 'excavation', 'corpus', 'pipeline'], phase: '2–10' },
					{ name: 'world/', modules: ['seed', 'chronology', 'culture', 'provenance', 'scholars'], phase: '1, 7–10' },
					{ name: 'lens/', modules: ['salience', 'classification', 'crossReference', 'framing', 'omission', 'strength'], phase: '15–16' },
					{ name: 'interpretation/', modules: ['claims', 'inference', 'methodology'], phase: '13–14' },
					{ name: 'documents/', modules: ['lineage', 'dissemination', 'commitments', 'form', 'venues'], phase: '16, 20' },
					{ name: 'contradiction/', modules: ['detection', 'strain', 'surfacing', 'resolution'], phase: '17–18' },
					{ name: 'career/', modules: ['reputation', 'progression', 'events', 'peerReview', 'npc'], phase: '20–22' }
				] as group}
					<div class="card bg-base-200 compact">
						<div class="card-body">
							<h3 class="card-title text-sm font-mono">
								engine/{group.name}
								<span class="badge badge-sm badge-outline">Phase {group.phase}</span>
							</h3>
							<ul class="text-xs font-mono space-y-0.5">
								{#each group.modules as mod}
									<li class="opacity-80">{mod}.ts</li>
								{/each}
							</ul>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<script lang="ts">
/**
 * Rule calibration panel (roadmap 2GN.81): samples a population of artefacts and reports how often
 * each classification rule fires, and what that does to the tag vocabulary.
 *
 * The Tag Inspector answers "why did this artefact score this way"; this answers "is the rule set
 * calibrated at all". A rule can look sensible on one artefact while firing on 85% of output, which
 * under `classifyArtefact`'s plain-sum fold (doc 12 §2.21) adds a near-constant to every score
 * rather than discriminating — the defect roadmap 2GN.79 found and doc 12 §2.24 found before it.
 */
import { page } from '$app/state';
import { getSeed } from '../seed';
import { EXPLORER_CULTURES } from '$lib/data/explorer-cultures';
import { calibrateRules, SATURATION_CEILING } from './ruleCalibration';
import type { CalibrationVerdict, RuleCalibration } from './ruleCalibration';

const baseSeed = $derived(getSeed(page.url));

let selectedCultureId = $state(EXPLORER_CULTURES[0].id);
const culture = $derived(
	EXPLORER_CULTURES.find((entry) => entry.id === selectedCultureId) ?? EXPLORER_CULTURES[0],
);

const SAMPLE_SIZES = [100, 250, 500, 1000];
let sampleSize = $state(250);

// Committed on request rather than re-derived on every control change: at 1000 artefacts
// `calibrateRules` runs the whole generation pipeline synchronously per sample and would block
// paint until it finished, with no feedback while it ran. Captures the resolved culture, not just
// its id, so changing the dropdown after a run can't silently swap the report's culture without a
// fresh run.
let request = $state<
	{ seed: string; culture: (typeof EXPLORER_CULTURES)[number]; size: number } | undefined
>(undefined);
let running = $state(false);
const report = $derived(
	request === undefined ? undefined : calibrateRules(request.seed, request.culture, request.size),
);

function runCalibration(): void {
	running = true;
	request = { seed: baseSeed, culture, size: sampleSize };
	// Yield a frame so the pending state paints before the synchronous sweep below blocks it.
	requestAnimationFrame(() => {
		running = false;
	});
}

const VERDICT_LABEL: Record<CalibrationVerdict, string> = {
	saturated: 'saturated',
	discriminating: 'discriminating',
	dormant: 'dormant',
};

const VERDICT_CLASS: Record<CalibrationVerdict, string> = {
	saturated: 'badge-warning',
	discriminating: 'badge-success',
	dormant: 'badge-ghost',
};

function contributionText(rule: RuleCalibration): string {
	return rule.contributions.map((c) => `${c.tag} ${c.weight.toFixed(2)}`).join(', ');
}
</script>

<div class="space-y-6">
	<header class="space-y-2">
		<h2 class="text-xl font-semibold">Rule Calibration</h2>
		<p class="text-base-content/70 max-w-3xl text-sm">
			How often each classification rule fires across a sampled population, and which rules drive
			each tag. Scores accumulate by plain unbounded sum, so a rule firing on nearly every artefact
			adds a near-constant to every score rather than telling one artefact from another. A rule
			whose comment claims selectivity should not read
			<span class="badge badge-warning badge-sm align-middle">saturated</span>.
		</p>
	</header>

	<div class="flex flex-wrap items-end gap-4">
		<label class="form-control">
			<span class="label-text text-xs">Culture</span>
			<select class="select select-bordered select-sm" bind:value={selectedCultureId}>
				{#each EXPLORER_CULTURES as preset (preset.id)}
					<option value={preset.id}>{preset.label}</option>
				{/each}
			</select>
		</label>

		<label class="form-control">
			<span class="label-text text-xs">Sample size</span>
			<select class="select select-bordered select-sm" bind:value={sampleSize}>
				{#each SAMPLE_SIZES as size (size)}
					<option value={size}>{size} artefacts</option>
				{/each}
			</select>
		</label>

		<button type="button" class="btn btn-primary btn-sm" onclick={runCalibration} disabled={running}>
			{running ? 'Running…' : 'Run calibration'}
		</button>

		<p class="text-base-content/60 pb-1 text-xs">
			seed <span class="font-mono">{baseSeed}</span> · {culture.description}
		</p>
	</div>

	{#if running}
		<p class="text-base-content/60 text-sm">
			Sampling {sampleSize} artefacts against every rule — this runs the full generation pipeline
			synchronously and may take a moment.
		</p>
	{:else if report === undefined}
		<p class="text-base-content/60 text-sm">
			Choose a culture and sample size, then run calibration to see fire rates.
		</p>
	{:else}
		{#if report.saturatedRules.length > 0}
			<div class="alert alert-warning">
				<div class="text-sm">
					<p class="font-semibold">
						{report.saturatedRules.length} rule{report.saturatedRules.length === 1 ? '' : 's'} above
						{SATURATION_CEILING}%
					</p>
					<p>
						{report.saturatedRules
							.map((rule) => `${rule.label} ${rule.firePercent.toFixed(1)}%`)
							.join(' · ')}
						— check each against its stated intent. One is expected: the any-decoration nudge is
						documented as deliberately universal (doc 12 §2.24).
					</p>
				</div>
			</div>
		{/if}

		<section>
			<h3 class="font-semibold">Tags</h3>
			<p class="text-base-content/60 mb-2 text-xs">
				Present = carries the tag at all. Leads = is that artefact's highest-scoring tag. A tag
				leading on most output is not discriminating, whatever its individual scores look like.
			</p>
			<div class="overflow-x-auto">
				<table class="table table-sm">
					<thead>
						<tr>
							<th>Tag</th>
							<th class="text-right">Present</th>
							<th class="text-right">Leads</th>
							<th class="text-right">Mean score</th>
							<th>Top contributor</th>
						</tr>
					</thead>
					<tbody>
						{#each report.tags as tag (tag.tag)}
							<tr>
								<td class="font-mono">{tag.tag}</td>
								<td class="text-right font-mono">{tag.presentPercent.toFixed(1)}%</td>
								<td class="text-right font-mono">{tag.leadPercent.toFixed(1)}%</td>
								<td class="text-right font-mono">{tag.meanScoreWhenPresent.toFixed(2)}</td>
								<td class="text-base-content/70 font-mono text-xs">
									{#if tag.topContributor}
										{tag.topContributor.label}
										<span class="text-base-content/50">
											(fires {tag.topContributor.firePercent.toFixed(1)}%)
										</span>
									{:else}
										—
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<section>
			<h3 class="font-semibold">Rules</h3>
			<p class="text-base-content/60 mb-2 text-xs">
				In `CLASSIFICATION_RULES` order, so labels match the Tag Inspector and the pinned test
				blocks. Dormant rules have no producer in the current pipeline yet.
			</p>
			<div class="overflow-x-auto">
				<table class="table table-sm">
					<thead>
						<tr>
							<th>Rule</th>
							<th class="text-right">Fires</th>
							<th>Verdict</th>
							<th>Contributes</th>
						</tr>
					</thead>
					<tbody>
						{#each report.rules as rule (rule.ruleIndex)}
							<tr>
								<td class="font-mono">{rule.label}</td>
								<td class="text-right font-mono">
									{rule.firePercent.toFixed(1)}%
									<span class="text-base-content/50 text-xs">({rule.fireCount})</span>
								</td>
								<td>
									<span class="badge badge-sm {VERDICT_CLASS[rule.verdict]}">
										{VERDICT_LABEL[rule.verdict]}
									</span>
								</td>
								<td class="text-base-content/70 font-mono text-xs">{contributionText(rule)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}
</div>

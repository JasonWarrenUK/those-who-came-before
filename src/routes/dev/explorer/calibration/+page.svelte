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
import type { CalibrationVerdict, RuleCalibration, TagCalibration } from './ruleCalibration';
import { applySort, nextSort } from '../shared/tableSort';
import type { SortColumn, SortState } from '../shared/tableSort';

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

// Sorting reorders the report the panel already holds; it never re-runs the sample. A fresh run
// keeps whichever column was chosen, so a developer comparing cultures sees the same ordering.
type TagSortKey = 'tag' | 'present' | 'leads' | 'meanScore' | 'topContributor';
type RuleSortKey = 'rule' | 'reads' | 'concludes' | 'fires' | 'verdict' | 'contributes';

// Verdicts rank by how much attention they want: saturated first under the default descending
// click, dormant last.
const VERDICT_RANK: Record<CalibrationVerdict, number> = {
	saturated: 2,
	discriminating: 1,
	dormant: 0,
};

const TAG_COLUMNS: Record<TagSortKey, SortColumn<TagCalibration>> = {
	tag: { value: (t) => t.tag, defaultDirection: 'asc' },
	present: { value: (t) => t.presentPercent, defaultDirection: 'desc' },
	leads: { value: (t) => t.leadPercent, defaultDirection: 'desc' },
	meanScore: { value: (t) => t.meanScoreWhenPresent, defaultDirection: 'desc' },
	// By the contributing rule's position, so it groups the way the Rules table lists them.
	topContributor: { value: (t) => t.topContributor?.ruleIndex, defaultDirection: 'asc' },
};

const RULE_COLUMNS: Record<RuleSortKey, SortColumn<RuleCalibration>> = {
	rule: { value: (r) => r.ruleIndex, defaultDirection: 'asc' },
	reads: { value: (r) => r.reads, defaultDirection: 'asc' },
	concludes: { value: (r) => r.concludes, defaultDirection: 'asc' },
	fires: { value: (r) => r.firePercent, defaultDirection: 'desc' },
	verdict: { value: (r) => VERDICT_RANK[r.verdict], defaultDirection: 'desc' },
	// Total weight the rule pushed into the sample, since rate alone hides a rare heavy rule.
	contributes: { value: (r) => r.totalWeightContributed, defaultDirection: 'desc' },
};

let tagSort = $state<SortState<TagSortKey>>({ key: null, direction: 'asc' });
let ruleSort = $state<SortState<RuleSortKey>>({ key: null, direction: 'asc' });

const sortedTags = $derived(
	report === undefined ? [] : applySort(report.tags, TAG_COLUMNS, tagSort),
);
const sortedRules = $derived(
	report === undefined ? [] : applySort(report.rules, RULE_COLUMNS, ruleSort),
);

function sortTags(key: TagSortKey): void {
	tagSort = nextSort(tagSort, key, TAG_COLUMNS[key].defaultDirection);
}

function sortRules(key: RuleSortKey): void {
	ruleSort = nextSort(ruleSort, key, RULE_COLUMNS[key].defaultDirection);
}

function ariaSort<K extends string>(
	state: SortState<K>,
	key: K,
): 'ascending' | 'descending' | 'none' {
	if (state.key !== key) return 'none';
	return state.direction === 'asc' ? 'ascending' : 'descending';
}
</script>

{#snippet sortHeader(
	label: string,
	active: boolean,
	direction: 'asc' | 'desc',
	onclick: () => void,
	align: 'left' | 'right' = 'left',
)}
	<button
	type="button"
	class="inline-flex w-full cursor-pointer items-center gap-1 {align === 'right'
			? 'justify-end'
			: ''} {active ? 'text-base-content' : 'hover:text-base-content'}"
	{onclick}
>
		{label}
		{#if active}
			<span class="text-base-content/50 text-[10px] uppercase" aria-hidden="true">
				{direction}
			</span>
		{/if}
	</button>
{/snippet}

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
				Click a heading to sort; click again to flip.
			</p>
			<div class="overflow-x-auto">
				<table class="table table-sm">
					<thead>
						<tr>
							<th aria-sort={ariaSort(tagSort, 'tag')}>
								{@render sortHeader('Tag', tagSort.key === 'tag', tagSort.direction, () => sortTags('tag'))}
							</th>
							<th aria-sort={ariaSort(tagSort, 'present')}>
								{@render sortHeader('Present', tagSort.key === 'present', tagSort.direction, () => sortTags('present'), 'right')}
							</th>
							<th aria-sort={ariaSort(tagSort, 'leads')}>
								{@render sortHeader('Leads', tagSort.key === 'leads', tagSort.direction, () => sortTags('leads'), 'right')}
							</th>
							<th aria-sort={ariaSort(tagSort, 'meanScore')}>
								{@render sortHeader('Mean score', tagSort.key === 'meanScore', tagSort.direction, () => sortTags('meanScore'), 'right')}
							</th>
							<th aria-sort={ariaSort(tagSort, 'topContributor')}>
								{@render sortHeader('Top contributor', tagSort.key === 'topContributor', tagSort.direction, () => sortTags('topContributor'))}
							</th>
						</tr>
					</thead>
					<tbody>
						{#each sortedTags as tag (tag.tag)}
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
				In `CLASSIFICATION_RULES` order until a heading is clicked, so labels match the Tag
				Inspector and the pinned test blocks. "Reads" is the condition in plain words and
				"Concludes" the reading its tags stand for, both authored on the rule. Sorting by
				"Contributes" ranks by total weight pushed into the sample. Dormant rules have no producer
				in the current pipeline yet.
			</p>
			<div class="overflow-x-auto">
				<table class="table table-sm">
					<thead>
						<tr>
							<th aria-sort={ariaSort(ruleSort, 'rule')}>
								{@render sortHeader('Rule', ruleSort.key === 'rule', ruleSort.direction, () => sortRules('rule'))}
							</th>
							<th aria-sort={ariaSort(ruleSort, 'reads')}>
								{@render sortHeader('Reads', ruleSort.key === 'reads', ruleSort.direction, () => sortRules('reads'))}
							</th>
							<th aria-sort={ariaSort(ruleSort, 'concludes')}>
								{@render sortHeader('Concludes', ruleSort.key === 'concludes', ruleSort.direction, () => sortRules('concludes'))}
							</th>
							<th aria-sort={ariaSort(ruleSort, 'fires')}>
								{@render sortHeader('Fires', ruleSort.key === 'fires', ruleSort.direction, () => sortRules('fires'), 'right')}
							</th>
							<th aria-sort={ariaSort(ruleSort, 'verdict')}>
								{@render sortHeader('Verdict', ruleSort.key === 'verdict', ruleSort.direction, () => sortRules('verdict'))}
							</th>
							<th aria-sort={ariaSort(ruleSort, 'contributes')}>
								{@render sortHeader('Contributes', ruleSort.key === 'contributes', ruleSort.direction, () => sortRules('contributes'))}
							</th>
						</tr>
					</thead>
					<tbody>
						{#each sortedRules as rule (rule.ruleIndex)}
							<tr>
								<td class="align-top font-mono">
									{rule.label}
									<div class="text-base-content/50 text-xs">{rule.ruleId}</div>
								</td>
								<td class="max-w-xs text-sm">{rule.reads}</td>
								<td class="max-w-xs text-sm">{rule.concludes}</td>
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

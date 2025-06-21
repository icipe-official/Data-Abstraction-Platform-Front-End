<script lang="ts">
	import { Domain, MetadataModel, Utils } from '$lib'

	const COMPONENT_NAME = 'view-query-panel'

	interface Props {
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		telemetry?: Domain.Interfaces.ITelemetry
		metadatamodel?: any
		data?: any[]
		queryconditions?: MetadataModel.QueryConditions[]
		filterexcludeindexes?: number[]
		updatefilterexcludeindexes?: (value: number[]) => void
		updatemetadatamodel?: (value: any) => void
		updatequeryconditions?: (value: MetadataModel.QueryConditions[]) => void
		hidequerypanel?: () => void
	}

	let {
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		telemetry = undefined,
		metadatamodel = {},
		data = [],
		queryconditions = [],
		filterexcludeindexes = [],
		updatefilterexcludeindexes = undefined,
		updatemetadatamodel = undefined,
		updatequeryconditions = undefined,
		hidequerypanel = undefined
	}: Props = $props()

	let viewMetadataModel: any = $derived(JSON.parse(JSON.stringify(metadatamodel)))

	let viewQueryConditions: MetadataModel.QueryConditions[] = $derived(JSON.parse(JSON.stringify(queryconditions)))

	let viewFilterExcludeIndexes: number[] = $derived(JSON.parse(JSON.stringify(filterexcludeindexes)))

	function onupdatemetadatamodel() {
		if (updatemetadatamodel) {
			updatemetadatamodel(JSON.parse(JSON.stringify(viewMetadataModel)))
		}
	}

	function onupdatequeryconditions() {
		if (updatequeryconditions) {
			updatequeryconditions(JSON.parse(JSON.stringify(viewQueryConditions)))
		}
	}

	function onupdatefilterexcludeindexes() {
		if (updatefilterexcludeindexes) {
			updatefilterexcludeindexes(JSON.parse(JSON.stringify(viewFilterExcludeIndexes)))
		}
	}

	let windowWidth: number = $state(0)
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex h-full w-full flex-col gap-y-2 overflow-hidden">
	{#await import("$lib/components/MetadataModel/Query/Component.svelte") then { default: MetadataModelQuery }}
		<section class="flex h-full w-full min-w-[300px] flex-1 overflow-hidden rounded-lg">
			<MetadataModelQuery
				metadatamodel={viewMetadataModel}
				{themecolor}
				{theme}
				queryconditions={viewQueryConditions}
				updatemetadatamodel={(value) => {
					viewMetadataModel = value
					onupdatemetadatamodel()
				}}
				updatequeryconditions={(value) => {
					viewQueryConditions = value
					onupdatequeryconditions()
				}}
			></MetadataModelQuery>
		</section>

		<section class="join w-full">
			<button
				class="join-item btn btn-md flex-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'btn-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'btn-secondary'
						: 'btn-accent'}"
				onclick={() => {
					viewFilterExcludeIndexes = []
					viewQueryConditions = []
					onupdatefilterexcludeindexes()
					onupdatequeryconditions()
				}}
				disabled={!Array.isArray(viewQueryConditions) || viewQueryConditions.length === 0 || !Array.isArray(data)}
			>
				{#if windowWidth > 768}
					reset
				{:else}
					<!--mdi:reload source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColorContent(themecolor)})"
							d="M2 12a9 9 0 0 0 9 9c2.39 0 4.68-.94 6.4-2.6l-1.5-1.5A6.7 6.7 0 0 1 11 19c-6.24 0-9.36-7.54-4.95-11.95S18 5.77 18 12h-3l4 4h.1l3.9-4h-3a9 9 0 0 0-18 0"
						/>
					</svg>
				{/if}
			</button>
			{#if Array.isArray(data) && data.length > 0}
				<button
					class="join-item btn btn-md flex-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'}"
					onclick={() => {
						if (Array.isArray(viewQueryConditions) && Array.isArray(data)) {
							viewFilterExcludeIndexes = MetadataModel.FilterData(viewQueryConditions, data)
							onupdatefilterexcludeindexes()
						}
					}}
					disabled={!Array.isArray(viewQueryConditions) || viewQueryConditions.length === 0 || !Array.isArray(data)}
				>
					{#if windowWidth > 768}
						filter local data
					{:else}
						<!--mdi:filter source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColorContent(themecolor)})"
								d="M14 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0l-2.01-2.01a.99.99 0 0 1-.29-.83V12h-.03L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L14.03 12z"
							/>
						</svg>
					{/if}
				</button>
			{/if}
			{#if hidequerypanel}
				<button
					class="join-item btn btn-md flex-[0.5] {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'}"
					onclick={hidequerypanel}
				>
					{#if windowWidth > 768}
						close
					{:else}
						<!--mdi:close-box source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColorContent(themecolor)})"
								d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-3.4 14L12 13.4L8.4 17L7 15.6l3.6-3.6L7 8.4L8.4 7l3.6 3.6L15.6 7L17 8.4L13.4 12l3.6 3.6z"
							/>
						</svg>
					{/if}
				</button>
			{/if}
		</section>
	{/await}
</div>

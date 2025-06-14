<script lang="ts">
	import { Domain, Interfaces, State, Utils } from '$lib'
	import { untrack } from 'svelte'

	const COMPONENT_NAME = 'view-data-search'

	interface Props {
		theme?: Domain.Entities.Theme.Theme
		themecolor?: Domain.Entities.Theme.Color
		telemetry?: Domain.Interfaces.ITelemetry
		dataqckey?: Utils.MetadataModel.FieldGroupQueryProperties
		viewdatasearch?: Domain.Interfaces.MetadataModels.ViewDataSearch
		updateviewdatasearch?: (value: Domain.Interfaces.MetadataModels.ViewDataSearch) => void
		authcontextdirectorygroupid?: string
	}

	let {
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		viewdatasearch = {},
		dataqckey = undefined,
		updateviewdatasearch = undefined,
		telemetry = undefined,
		authcontextdirectorygroupid = undefined
	}: Props = $props()

	let viewDataSearch: Domain.Interfaces.MetadataModels.ViewDataSearch = $state({})
	$effect(() => {
		if (viewdatasearch) {
			untrack(() => {
				viewDataSearch = JSON.parse(JSON.stringify(viewdatasearch))
			})
		}

		if (dataqckey) {
			untrack(() => {
				viewDataSearch.dataQCKey = JSON.parse(JSON.stringify(dataqckey))
				if (!Array.isArray(viewDataSearch.queryConditions)) {
					viewDataSearch.queryConditions = []
				}
			})
		}
	})

	function onupdateviewdatasearch() {
		if (updateviewdatasearch) {
			updateviewdatasearch(viewDataSearch)
		}
	}

	let metadataModelsSearch = $state(Interfaces.MetadataModels.NewViewSearch())
	$effect(() => {
		if (
			State.Session.session?.iam_credential &&
			Array.isArray(State.Session.session.iam_credential.id) &&
			State.Session.session.iam_credential.id.length > 0
		) {
			untrack(() => {
				metadataModelsSearch.authcontextdirectorygroupid = authcontextdirectorygroupid
				metadataModelsSearch.context = COMPONENT_NAME
				metadataModelsSearch.telemetry = telemetry
			})
		}
	})

	let selectMetadataModelDialogElement: HTMLDialogElement

	let windowWidth: number = $state(0)

	let selectQueryConditionDialogElement: HTMLDialogElement
	let selectedViewDataSearchQcIndex: number | undefined = $state(undefined)
	$effect(() => {
		if (typeof selectedViewDataSearchQcIndex === 'number') {
			selectQueryConditionDialogElement.showModal()
		} else {
			selectQueryConditionDialogElement.close()
		}
	})
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div
	class="flex justify-between gap-x-2 overflow-hidden rounded-md border p-1 {theme === Domain.Entities.Theme.Theme.DARK
		? 'border-gray-600'
		: 'border-gray-300'}"
>
	<span class="flex flex-[9.5] flex-wrap gap-2 overflow-auto">
		{#if Array.isArray(viewDataSearch.queryConditions) && viewDataSearch.queryConditions!.length > 0}
			{#each viewDataSearch.queryConditions as vdsqc, index}
				<span
					class="rounded-md p-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'bg-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'bg-secondary'
							: 'bg-accent'} flex justify-between gap-x-1 self-center p-0"
				>
					<button
						class="btn btn-sm btn-ghost flex flex-1 gap-x-1 self-center"
						onclick={() => {
							selectedViewDataSearchQcIndex = index
						}}
					>
						<span>{index + 1}</span>
						<span>-</span>
						<span>
							{#if Array.isArray(vdsqc.metadataModel?.name)}
								{vdsqc.metadataModel.name[0]}
							{:else}
								#unnamed
							{/if}
						</span>
					</button>

					{#if Array.isArray(vdsqc.queryCondition) && vdsqc.queryCondition.length > 0}
						<span class="self-center italic">({vdsqc.queryCondition.length})</span>
					{/if}

					<button
						class="btn btn-sm btn-ghost flex gap-x-1 self-center"
						onclick={() => {
							viewDataSearch.queryConditions = viewDataSearch.queryConditions?.filter((_, i) => i !== index)
							onupdateviewdatasearch()
						}}
					>
						<!--mdi:close-circle source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
							<path
								fill="var({Utils.Theme.GetColorContent(State.ThemeColor.value)})"
								d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"
							/>
						</svg>
					</button>
				</span>
			{/each}
		{:else}
			<span class="self-center italic">no data model query conditions set...</span>
		{/if}
	</span>

	<button
		class="btn btn-ghost btn-md tooltip tooltip-left {themecolor === Domain.Entities.Theme.Color.PRIMARY
			? 'tooltip-primary'
			: themecolor === Domain.Entities.Theme.Color.SECONDARY
				? 'tooltip-secondary'
				: 'tooltip-accent'}"
		data-tip="add new data model query condition"
		aria-label="add new data model query condition"
		onclick={() => {
			selectMetadataModelDialogElement.showModal()
		}}
	>
		<!--mdi:plus-circle source: https://icon-sets.iconify.design-->
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<path
				fill="var({Utils.Theme.GetColor(themecolor)})"
				d="M17 13h-4v4h-2v-4H7v-2h4V7h2v4h4m-5-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"
			/>
		</svg>
	</button>
</div>

<dialog bind:this={selectQueryConditionDialogElement} id="selected-metadata-model-dialog" class="modal">
	<div class="modal-box flex h-full max-h-[90%] w-full max-w-[90%] flex-col overflow-hidden rounded p-0">
		{#if typeof selectedViewDataSearchQcIndex === 'number'}
			{@const selectedQc = viewDataSearch.queryConditions![selectedViewDataSearchQcIndex]}

			<header class="sticky left-0 right-0 top-0 flex w-full items-center justify-between p-2">
				<div class="flex h-fit w-fit gap-x-1 text-lg text-white">
					{#if Array.isArray(selectedQc.metadataModel?.name)}
						{selectedQc.metadataModel.name[0]}
					{:else}
						#unnamed
					{/if}
				</div>
				<button
					class="btn btn-circle btn-ghost btn-lg"
					onclick={() => {
						selectedViewDataSearchQcIndex = undefined
					}}
				>
					<!--mdi:close-circle source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColor(State.ThemeColor.value)})"
							d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"
						/>
					</svg>
				</button>
			</header>

			{#if Array.isArray(selectedQc.metadataModel?.data)}
				<main class="flex flex-[9.5] flex-col gap-y-1 overflow-hidden p-2">
					{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
						<QueryPanel
							{themecolor}
							{theme}
							{telemetry}
							metadatamodel={selectedQc.metadataModel.data[0]}
							queryconditions={selectedQc.queryCondition}
							updatequeryconditions={(value) => {
								viewDataSearch.queryConditions![selectedViewDataSearchQcIndex!].queryCondition = value
								onupdateviewdatasearch()
							}}
						></QueryPanel>
					{/await}
				</main>
			{/if}
		{/if}
	</div>
</dialog>

<dialog bind:this={selectMetadataModelDialogElement} id="selected-metadata-model-dialog" class="modal">
	<div class="modal-box flex h-full max-h-[90%] w-full max-w-[90%] flex-col overflow-hidden rounded p-0">
		<header class="sticky left-0 right-0 top-0 flex w-full items-center justify-between p-2">
			<div class="flex h-fit w-fit gap-x-1 text-lg text-white">Pick data model</div>
			<button
				class="btn btn-circle btn-ghost btn-lg"
				onclick={() => {
					selectMetadataModelDialogElement.close()
				}}
			>
				<!--mdi:close-circle source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
					<path
						fill="var({Utils.Theme.GetColor(State.ThemeColor.value)})"
						d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"
					/>
				</svg>
			</button>
		</header>

		<main class="flex flex-[9.5] flex-col gap-y-1 overflow-hidden p-2">
			{#if metadataModelsSearch.getdisplaydata}
				{#await metadataModelsSearch.getdisplaydata()}
					{@render awaitloading()}
				{:then}
					<header class="z-[2] flex justify-center">
						{#await import('$lib/components/View/MetadataModels/SearchBar/Component.svelte') then { default: ViewMetadataModelsSearchBar }}
							<div class="w-full">
								<ViewMetadataModelsSearchBar
									metadatamodel={metadataModelsSearch.searchmetadatamodel}
									{themecolor}
									{theme}
									{telemetry}
									querycondition={metadataModelsSearch.quicksearchquerycondition}
									updatequerycondition={(value) => {
										metadataModelsSearch.quicksearchquerycondition = value
									}}
									showquerypanel={() => {
										metadataModelsSearch.showquerypanel = !metadataModelsSearch.showquerypanel
									}}
									search={() => {
										if (metadataModelsSearch.searchdata) {
											metadataModelsSearch.searchdata()
										}
									}}
								></ViewMetadataModelsSearchBar>
							</div>
						{/await}
					</header>

					<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
						{#if metadataModelsSearch.showquerypanel}
							<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
								{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
									<QueryPanel
										{themecolor}
										{theme}
										{telemetry}
										metadatamodel={metadataModelsSearch.searchmetadatamodel}
										data={metadataModelsSearch.searchresults}
										queryconditions={metadataModelsSearch.queryconditions}
										filterexcludeindexes={metadataModelsSearch.filterexcludeindexes}
										updatefilterexcludeindexes={(value) => {
											metadataModelsSearch.filterexcludeindexes = value
											State.Toast.Type = Domain.Entities.Toast.Type.INFO
											State.Toast.Message = `${metadataModelsSearch.filterexcludeindexes.length} local results filtered out`
										}}
										updatemetadatamodel={(value: any) => {
											if (metadataModelsSearch.updatemedataModel) {
												metadataModelsSearch.updatemedataModel(value)
											}
										}}
										updatequeryconditions={(value) => {
											metadataModelsSearch.queryconditions = value
										}}
										hidequerypanel={() => (metadataModelsSearch.showquerypanel = false)}
									></QueryPanel>
								{/await}
							</section>
						{/if}

						{#if !metadataModelsSearch.showquerypanel}
							<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
								<section class="z-[2] flex w-full">
									{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
										<div class="h-fit w-full flex-1 self-center">
											<ViewHeaderData
												title={'Pick Metadata Model...'}
												view={metadataModelsSearch.view}
												{themecolor}
												{theme}
												updateview={(value) => (metadataModelsSearch.view = value)}
											></ViewHeaderData>
										</div>
									{/await}
								</section>

								<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
									{#await import('$lib/components/View/MetadataModels/Data/Component.svelte') then { default: ViewMetadataModelsData }}
										<ViewMetadataModelsData
											metadatamodel={metadataModelsSearch.searchmetadatamodel}
											data={metadataModelsSearch.searchresults}
											{themecolor}
											{theme}
											{telemetry}
											view={metadataModelsSearch.view}
											updatemetadatamodel={(value: any) => {
												if (metadataModelsSearch.updatemedataModel) {
													metadataModelsSearch.updatemedataModel(value)
												}
											}}
											filterexcludeindexes={metadataModelsSearch.filterexcludeindexes}
											rowclick={(_, index) => {
												const metadataModels: Domain.Entities.MetadataModels.Interface = metadataModelsSearch.searchresults![index]
												if (Array.isArray(metadataModels.id) && metadataModels.id.length > 0) {
													viewDataSearch.queryConditions?.push({
														metadataModel: metadataModels,
														queryCondition: []
													})
													selectMetadataModelDialogElement.close()
												}
											}}
										></ViewMetadataModelsData>
									{/await}
								</section>
							</section>
						{/if}
					</main>
				{:catch e}
					{@render awaiterror(e)}
				{/await}
			{/if}
		</main>
	</div>
</dialog>

{#snippet awaiterror(e: any)}
	{#await import('$lib/components/Error/Component.svelte') then { default: Error }}
		<div class="flex h-full w-full flex-[9.5] justify-center">
			<span class="self-center"><Error status={e[0]} message={e[1]} shadow={'inner'}></Error></span>
		</div>
	{/await}
{/snippet}

{#snippet awaitloading()}
	<div class="flex h-full w-full flex-[9.5] justify-center">
		<span class="self-center">
			<span class="loading text-primary loading-ball loading-md"></span>
			<span class="loading text-secondary loading-ball loading-lg"></span>
			<span class="loading text-accent loading-ball loading-xl"></span>
		</span>
	</div>
{/snippet}

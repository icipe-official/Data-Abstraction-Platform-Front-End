<script lang="ts">
	import { Component, Domain, Interfaces, MetadataModel, State, Utils } from '$lib'
	import { onMount, untrack } from 'svelte'
	import { Tab } from './util'

	const COMPONENT_NAME = 'administration-directory-groups-datum'

	interface Props {
		metadatamodel?: any
		datum?: any
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		telemetry?: Domain.Interfaces.ITelemetry
		directorygroupid?: string
	}

	let {
		metadatamodel,
		datum: d,
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		telemetry = undefined,
		directorygroupid = undefined
	}: Props = $props()

	let authContextDirectoryGroupID = $derived(directorygroupid)

	onMount(() => {
		datum = Interfaces.AbstractionsDirectoryGroups.Datum({
			fetchedData: {
				metadata_model: JSON.parse(JSON.stringify(metadatamodel)),
				datum: JSON.parse(JSON.stringify(d))
			},
			verboseResponse: State.VerboseResponse.value,
			currentDirectoryGroupID: directorygroupid!,
			directoryGroupID: directorygroupid,
			context: COMPONENT_NAME
		})

		if (d) {
			datum.previousDatum = JSON.parse(JSON.stringify(d))
		}
	})

	//@ts-expect-error
	let datum: Domain.Interfaces.AbstractionsDirectoryGroups.Datum = $state({})

	let windowWidth: number = $state(0)

	function handleError(e: any, defaultError?: string) {
		State.Toast.Type = Domain.Entities.Toast.Type.ERROR
		State.Toast.Message = []
		if (defaultError) {
			State.Toast.Message.push(defaultError)
		}
		if (Array.isArray(e) && e.length === 2) {
			State.Toast.Message.push(`${e[0]}->${e[1].message}`)
		} else {
			State.Toast.Message.push(`${500}->${Utils.DEFAULT_FETCH_ERROR}`)
		}
	}

	let currentTab: Tab = $state(Tab.DATUM)

	let directoryGroupsSearch = $state(Interfaces.DirectoryGroups.NewViewSearch())
	$effect(() => {
		if (
			State.Session.session?.iam_credential &&
			Array.isArray(State.Session.session.iam_credential.id) &&
			State.Session.session.iam_credential.id.length > 0
		) {
			untrack(() => {
				directoryGroupsSearch.authcontextdirectorygroupid = authContextDirectoryGroupID
				directoryGroupsSearch.context = COMPONENT_NAME
				directoryGroupsSearch.telemetry = telemetry
			})
		}
	})

	let metadataModelsSearch = $state(Interfaces.MetadataModels.NewViewSearch())
	$effect(() => {
		if (
			State.Session.session?.iam_credential &&
			Array.isArray(State.Session.session.iam_credential.id) &&
			State.Session.session.iam_credential.id.length > 0
		) {
			untrack(() => {
				metadataModelsSearch.authcontextdirectorygroupid = authContextDirectoryGroupID
				metadataModelsSearch.context = COMPONENT_NAME
				metadataModelsSearch.telemetry = telemetry
			})
		}
	})
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex w-full flex-col gap-y-2 overflow-hidden">
	{#if currentTab === Tab.DATUM}
		<main class="flex flex-1 flex-col gap-y-4 overflow-auto">
			<span class="join border {theme === Domain.Entities.Theme.Theme.DARK ? 'border-gray-700' : 'border-gray-100'} rounded-sm">
				<span class="join-item label p-2">group id</span>
				<div class="join-item divider divider-horizontal ml-0 mr-0"></div>
				<button
					class="join-item btn btn-ghost btn-md w-full flex-1"
					onclick={() => {
						currentTab = Tab.PICK_DIRECTORY_GROUP
					}}
					disabled={datum.previousDatum && datum.directory_group_id}
				>
					{datum.directory_group_id ? datum.directory_group_id : 'pick group...'}
				</button>
			</span>

			<span class="join border {theme === Domain.Entities.Theme.Theme.DARK ? 'border-gray-700' : 'border-gray-100'} rounded-sm">
				<span class="join-item label p-2">model id</span>
				<div class="join-item divider divider-horizontal ml-0 mr-0"></div>
				<button
					class="join-item btn btn-ghost btn-md w-full flex-1"
					onclick={() => {
						currentTab = Tab.PICK_METADATA_MODEL
					}}
				>
					{datum.metadata_models_id ? datum.metadata_models_id : 'pick model...'}
				</button>
			</span>

			<fieldset
				class="fieldset {theme === Domain.Entities.Theme.Theme.DARK
					? 'border-gray-900 bg-gray-700'
					: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
			>
				<legend class="fieldset-legend flex gap-x-2">
					<div class="text-md h-fit self-center">Review Quorum <span class="font-bold italic">(Required)</span></div>
				</legend>

				<p>No of checks with positive feedback to consider an abstraction verified</p>

				<input
					class="input flex-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'input-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'input-secondary'
							: 'input-accent'} min-h-[48px] w-full"
					placeholder="Enter review quorum..."
					type="number"
					value={datum.abstractionReviewQuorum}
					oninput={(event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
						datum.updateAbstractionReviewQuorum(event.currentTarget.value)
					}}
				/>

				{#if Array.isArray(datum.abstractionReviewQuorumError) && datum.abstractionReviewQuorumError.length > 0}
					<ul class="text-md text-error list-inside list-disc">
						{#each datum.abstractionReviewQuorumError as e}
							<li>{e}</li>
						{/each}
					</ul>
				{/if}
			</fieldset>

			<fieldset
				class="fieldset {State.Theme.value === Domain.Entities.Theme.Theme.DARK
					? 'border-gray-900 bg-gray-700'
					: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
			>
				<legend class="fieldset-legend flex gap-x-2">
					<div class="text-md h-fit self-center">Description <span class="font-bold italic">(Required)</span></div>
				</legend>

				<p>Describe the purpose for abstracting data in group</p>

				<textarea
					class="textarea flex-1 {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
						? 'textarea-primary'
						: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
							? 'textarea-secondary'
							: 'textarea-accent'} w-full"
					placeholder="Enter description..."
					value={datum.description}
					oninput={(event: Event & { currentTarget: EventTarget & HTMLTextAreaElement }) => {
						datum.updateDescription(event.currentTarget.value)
					}}
				></textarea>

				{#if Array.isArray(datum.descriptionError) && datum.descriptionError.length > 0}
					<ul class="text-md text-error list-inside list-disc">
						{#each datum.descriptionError as e}
							<li>{e}</li>
						{/each}
					</ul>
				{/if}
			</fieldset>

			<fieldset
				class="fieldset {State.Theme.value === Domain.Entities.Theme.Theme.DARK
					? 'border-gray-900 bg-gray-700'
					: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
			>
				<legend class="fieldset-legend flex gap-x-2">
					<div class="text-md h-fit self-center">View Properties</div>
				</legend>

				<p class="text-sm">Determines whether other users can see this resource.</p>

				<fieldset
					class="fieldset {State.Theme.value === Domain.Entities.Theme.Theme.DARK
						? 'border-gray-600 bg-gray-600'
						: 'border-gray-300 bg-gray-200'} rounded-box w-full border p-4"
				>
					<legend class="fieldset-legend flex gap-x-2">
						<div class="text-md h-fit self-center">Public</div>
					</legend>

					<input
						class="checkbox {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
							? 'checkbox-primary'
							: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
								? 'checkbox-secondary'
								: 'checkbox-accent'}"
						type="checkbox"
						bind:checked={datum.viewUnauthorized}
					/>
				</fieldset>

				<fieldset
					class="fieldset {State.Theme.value === Domain.Entities.Theme.Theme.DARK
						? 'border-gray-600 bg-gray-600'
						: 'border-gray-300 bg-gray-200'} rounded-box w-full border p-4"
				>
					<legend class="fieldset-legend flex gap-x-2">
						<div class="text-md h-fit self-center">Authorized</div>
					</legend>

					<input
						class="checkbox {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
							? 'checkbox-primary'
							: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
								? 'checkbox-secondary'
								: 'checkbox-accent'}"
						type="checkbox"
						bind:checked={datum.viewAuthorized}
					/>
				</fieldset>
			</fieldset>
		</main>

		{#if State.Session.session && directorygroupid}
			<footer class="join w-full pb-2">
				{#if (datum.directory_group_id && datum.update) || datum.delete || datum.create}
					<button
						class="join-item btn flex-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary'
								: 'btn-accent'}"
						onclick={async () => {
							if (datum.previousDatum && datum.directory_group_id && datum.update) {
								State.Loading.value = `Updating ${Domain.Entities.AbstractionsDirectoryGroups.RepositoryName}`

								try {
									const toastData = await datum.update()

									State.Toast.Type = toastData.Type
									State.Toast.Message = toastData.Message
									State.Toast.MedataModelSearchResults = toastData.MedataModelSearchResults
								} catch (e) {
									if (Array.isArray(e)) {
										handleError(e[0], e[1])
									}
								} finally {
									State.Loading.value = undefined
								}
							} else {
								if (datum.create) {
									State.Loading.value = `Creating new ${Domain.Entities.AbstractionsDirectoryGroups.RepositoryName}`

									try {
										const toastData = await datum.create()

										State.Toast.Type = toastData.Type
										State.Toast.Message = toastData.Message
										State.Toast.MedataModelSearchResults = toastData.MedataModelSearchResults
									} catch (e) {
										if (Array.isArray(e)) {
											handleError(e[0], e[1])
										}
									} finally {
										State.Loading.value = undefined
									}
								}
							}
						}}
					>
						{#if datum.previousDatum && datum.directory_group_id && datum.update}
							<!--mdi:edit source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path
									fill="var({Utils.Theme.GetColorContent(themecolor)})"
									d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z"
								/>
							</svg>
							{#if windowWidth > 768}
								<span class="self-center">update</span>
							{/if}
						{:else if datum.create}
							<!--mdi:add-bold source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path fill="var({Utils.Theme.GetColorContent(themecolor)})" d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" />
							</svg>

							{#if windowWidth > 768}
								<span class="self-center">create</span>
							{/if}
						{/if}
					</button>

					{@render deletedatum()}
				{/if}
			</footer>
		{/if}
	{:else if currentTab === Tab.PICK_DIRECTORY_GROUP}
		{#if directoryGroupsSearch.getdisplaydata}
			{#await directoryGroupsSearch.getdisplaydata()}
				{@render awaitloading()}
			{:then}
				<header class="z-[2] flex justify-center">
					{#await import('$lib/components/View/DirectoryGroups/SearchBar/Component.svelte') then { default: ViewDirectoryGroupsSearchBar }}
						<div class="w-full">
							<ViewDirectoryGroupsSearchBar
								metadatamodel={directoryGroupsSearch.searchmetadatamodel}
								{themecolor}
								{theme}
								{telemetry}
								querycondition={directoryGroupsSearch.quicksearchquerycondition}
								updatequerycondition={(value) => {
									directoryGroupsSearch.quicksearchquerycondition = value
								}}
								showquerypanel={() => {
									directoryGroupsSearch.showquerypanel = !directoryGroupsSearch.showquerypanel
								}}
								search={() => {
									if (directoryGroupsSearch.searchdata) {
										directoryGroupsSearch.searchdata()
									}
								}}
							></ViewDirectoryGroupsSearchBar>
						</div>
					{/await}
				</header>

				<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
					{#if directoryGroupsSearch.showquerypanel}
						<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
							{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
								<QueryPanel
									{themecolor}
									{theme}
									{telemetry}
									metadatamodel={directoryGroupsSearch.searchmetadatamodel}
									data={directoryGroupsSearch.searchresults}
									queryconditions={directoryGroupsSearch.queryconditions}
									filterexcludeindexes={directoryGroupsSearch.filterexcludeindexes}
									updatefilterexcludeindexes={(value) => {
										directoryGroupsSearch.filterexcludeindexes = value
										State.Toast.Type = Domain.Entities.Toast.Type.INFO
										State.Toast.Message = `${directoryGroupsSearch.filterexcludeindexes.length} local results filtered out`
									}}
									updatemetadatamodel={(value: any) => {
										if (directoryGroupsSearch.updatemedataModel) {
											directoryGroupsSearch.updatemedataModel(value)
										}
									}}
									updatequeryconditions={(value) => {
										directoryGroupsSearch.queryconditions = value
									}}
									hidequerypanel={() => (directoryGroupsSearch.showquerypanel = false)}
								></QueryPanel>
							{/await}
						</section>
					{/if}

					{#if !directoryGroupsSearch.showquerypanel}
						<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
							<section class="z-[2] flex w-full">
								{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
									<div class="h-fit w-full flex-1 self-center">
										<ViewHeaderData
											title={'Pick Group...'}
											view={directoryGroupsSearch.view}
											{themecolor}
											{theme}
											updateview={(value) => (directoryGroupsSearch.view = value)}
										></ViewHeaderData>
									</div>
								{/await}
							</section>

							<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
								{#await import('$lib/components/View/DirectoryGroups/Data/Component.svelte') then { default: ViewDirectoryGroupsData }}
									<ViewDirectoryGroupsData
										metadatamodel={directoryGroupsSearch.searchmetadatamodel}
										data={directoryGroupsSearch.searchresults}
										{themecolor}
										{theme}
										{telemetry}
										view={directoryGroupsSearch.view}
										updatemetadatamodel={(value: any) => {
											if (directoryGroupsSearch.updatemedataModel) {
												directoryGroupsSearch.updatemedataModel(value)
											}
										}}
										filterexcludeindexes={directoryGroupsSearch.filterexcludeindexes}
										rowclick={(_, index) => {
											const directoryGroups: Domain.Entities.DirectoryGroups.Interface = directoryGroupsSearch.searchresults![index]
											if (Array.isArray(directoryGroups.id) && directoryGroups.id.length > 0) {
												datum.directory_group_id = directoryGroups.id[0]
											}
											currentTab = Tab.DATUM
										}}
									></ViewDirectoryGroupsData>
								{/await}
							</section>
						</section>
					{/if}
				</main>
			{:catch e}
				{@render awaiterror(e)}
			{/await}
		{/if}
	{:else if currentTab === Tab.PICK_METADATA_MODEL}
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
										<ViewHeaderData title={'Pick Metadata Model...'} view={metadataModelsSearch.view} {themecolor} {theme} updateview={(value) => (metadataModelsSearch.view = value)}
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
												datum.metadata_models_id = metadataModels.id[0]
											}
											currentTab = Tab.DATUM
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
	{/if}
</div>

{#snippet deletedatum()}
	{#if datum.previousDatum && datum.directory_group_id && typeof datum.delete === 'function'}
		<button
			class="join-item btn flex-1 {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
				? 'btn-primary'
				: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
					? 'btn-secondary'
					: 'btn-accent'}"
			onclick={async () => {
				State.Loading.value = `Deleting ${Domain.Entities.AbstractionsDirectoryGroups.RepositoryName}`
				try {
					const toastData = await datum.delete!()

					State.Toast.Type = toastData.Type
					State.Toast.Message = toastData.Message
					State.Toast.MedataModelSearchResults = toastData.MedataModelSearchResults

					if (toastData.Type === Domain.Entities.Toast.Type.SUCCESS) {
						if (datum.reset) {
							datum.reset()
						}
						delete datum.directory_group_id
						delete datum.previousDatum
					}
				} catch (e) {
					if (Array.isArray(e)) {
						handleError(e[0], e[1])
					}
				} finally {
					State.Loading.value = undefined
				}
			}}
		>
			<!--mdi:delete source: https://icon-sets.iconify.design-->
			<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<path
					fill="var({Utils.Theme.GetColorContent(State.ThemeColor.value)})"
					d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"
				/>
			</svg>

			{#if windowWidth > 768}
				<span class="self-center">delete</span>
			{/if}
		</button>
	{/if}
{/snippet}

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

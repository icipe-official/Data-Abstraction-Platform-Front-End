<script lang="ts">
	import { Component, Domain, Interfaces, MetadataModel, State, Utils } from '$lib'
	import { onMount } from 'svelte'
	import { Tab } from './util'

	const COMPONENT_NAME = 'administration-directory-datum'

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
	let verboseResponse = $derived(State.VerboseResponse.value)

	let authedFetch = new Interfaces.AuthenticatedFetch.Client()

	onMount(() => {
		datum = Interfaces.AbstractionsDirectoryGroups.Datum({
			metadata_model: JSON.parse(JSON.stringify(metadatamodel)),
			datum: JSON.parse(JSON.stringify(d))
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

	let dataView: Component.View.View = $state('list')

	let currentTab: Tab = $state(Tab.DATUM)

	let directoryGroupsSearch: Domain.Interfaces.MetadataModels.Search | undefined = $derived.by(() => {
		if (
			!State.Session.session?.iam_credential ||
			!Array.isArray(State.Session.session.iam_credential.id) ||
			State.Session.session.iam_credential.id.length === 0
		) {
			return undefined
		}

		return new Interfaces.MetadataModels.SearchData(
			`${Domain.Entities.Url.ApiUrlPaths.Directory.Groups}${Domain.Entities.Url.MetadataModelSearchGetMMPath}`,
			`${Domain.Entities.Url.ApiUrlPaths.Directory.Groups}${Domain.Entities.Url.MetadataModelSearchPath}`,
			new Interfaces.AuthenticatedFetch.Client(true)
		)
	})
	let directoryGroupsQueryConditions: MetadataModel.QueryConditions[] = $state([])
	let directoryGroupsQuickSearchQueryCondition: MetadataModel.QueryConditions = $state({})
	let directoryGroupsSearchMetadataModel: any = $state({})
	let directoryGroupsSearchResults: any[] = $state([])
	let directoryGroupsSearchFilterExcludeIndexes: number[] = $state([])
	let getDisplayDirectoryGroupsExec: boolean = false
	async function getDisplayDirectoryGroups() {
		if (getDisplayDirectoryGroupsExec) {
			return
		}

		if (!directoryGroupsSearch) {
			throw [401, 'Unauthorized']
		}

		if (Object.keys(directoryGroupsSearch.searchmetadatamodel).length === 0) {
			try {
				await directoryGroupsSearch.FetchMetadataModel(authContextDirectoryGroupID, undefined, undefined)
			} catch (e) {
				const DEFAULT_ERROR = `Get ${Domain.Entities.DirectoryGroups.RepositoryName} metadata-model failed`

				telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, DEFAULT_ERROR, 'error', e)

				if (Array.isArray(e) && e.length === 2) {
					throw e
				} else {
					throw [500, DEFAULT_ERROR]
				}
			}
		}

		directoryGroupsSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_LIMIT] = 20

		directoryGroupsSearch.searchmetadatamodel = MetadataModel.MapFieldGroups(directoryGroupsSearch.searchmetadatamodel, (property: any) => {
			if (
				property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] === 0 &&
				property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === Domain.Entities.DirectoryGroups.RepositoryName &&
				property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Domain.Entities.DirectoryGroups.FieldColumn.LastUpdatedOn
			) {
				property[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] = false
			}

			return property
		})

		directoryGroupsSearchMetadataModel = directoryGroupsSearch.searchmetadatamodel

		try {
			await searchDirectoryGroups()
			getDisplayDirectoryGroupsExec = true
		} catch (e) {
			throw e
		}
	}
	function updateDirectoryGroupsMetadataModel(value: any) {
		directoryGroupsSearchMetadataModel = value
		if (directoryGroupsSearch) {
			directoryGroupsSearch.searchmetadatamodel = directoryGroupsSearchMetadataModel
		}
	}
	async function searchDirectoryGroups() {
		if (!directoryGroupsSearch) {
			return
		}

		State.Loading.value = `Searching ${Domain.Entities.DirectoryGroups.RepositoryName}...`
		try {
			await directoryGroupsSearch.Search(
				Utils.MetadataModel.InsertNewQueryConditionToQueryConditions(directoryGroupsQueryConditions, [directoryGroupsQuickSearchQueryCondition]),
				authContextDirectoryGroupID || undefined,
				authContextDirectoryGroupID || undefined,
				undefined,
				false,
				false,
				undefined
			)

			directoryGroupsSearchFilterExcludeIndexes = []
			directoryGroupsSearchResults = directoryGroupsSearch.searchresults.data || []

			State.Toast.Type = Domain.Entities.Toast.Type.INFO
			State.Toast.Message = `${directoryGroupsSearchResults.length} results returned`
		} catch (e) {
			const ERROR = `Search ${Domain.Entities.DirectoryGroups.RepositoryName} failed`
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)

			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = [ERROR]
			if (Array.isArray(e) && e.length === 2) {
				State.Toast.Message.push(`${e[0]}->${e[1].message}`)
				throw e
			} else {
				State.Toast.Message.push(`${500}->${Utils.DEFAULT_FETCH_ERROR}`)
				throw [500, ERROR]
			}
		} finally {
			State.Loading.value = undefined
		}
	}
	let showDirectoryGroupsQueryPanel: boolean = $state(false)

	let metadataModelsSearch: Domain.Interfaces.MetadataModels.Search | undefined = $derived.by(() => {
		if (
			!State.Session.session?.iam_credential ||
			!Array.isArray(State.Session.session.iam_credential.id) ||
			State.Session.session.iam_credential.id.length === 0
		) {
			return undefined
		}

		return new Interfaces.MetadataModels.SearchData(
			`${Domain.Entities.Url.ApiUrlPaths.MetadataModels.Url}${Domain.Entities.Url.MetadataModelSearchGetMMPath}`,
			`${Domain.Entities.Url.ApiUrlPaths.MetadataModels.Url}${Domain.Entities.Url.MetadataModelSearchPath}`,
			new Interfaces.AuthenticatedFetch.Client(true)
		)
	})
	let metadataModelsQueryConditions: MetadataModel.QueryConditions[] = $state([])
	let metadataModelsQuickSearchQueryCondition: MetadataModel.QueryConditions = $state({})
	let metadataModelsSearchMetadataModel: any = $state({})
	let metadataModelsSearchResults: any[] = $state([])
	let metadataModelsSearchFilterExcludeIndexes: number[] = $state([])
	let getDisplayMetadataModelsExec: boolean = false
	async function getDisplayMetadataModels() {
		if (getDisplayMetadataModelsExec) {
			return
		}

		if (!metadataModelsSearch) {
			throw [401, 'Unauthorized']
		}

		if (Object.keys(metadataModelsSearch.searchmetadatamodel).length === 0) {
			try {
				await metadataModelsSearch.FetchMetadataModel(authContextDirectoryGroupID, undefined, undefined)
			} catch (e) {
				const DEFAULT_ERROR = `Get ${Domain.Entities.MetadataModels.RepositoryName} metadata-model failed`

				telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, DEFAULT_ERROR, 'error', e)

				if (Array.isArray(e) && e.length === 2) {
					throw e
				} else {
					throw [500, DEFAULT_ERROR]
				}
			}
		}

		metadataModelsSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_LIMIT] = 20

		metadataModelsSearch.searchmetadatamodel = MetadataModel.MapFieldGroups(metadataModelsSearch.searchmetadatamodel, (property: any) => {
			if (
				property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] === 0 &&
				property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === Domain.Entities.MetadataModels.RepositoryName &&
				property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Domain.Entities.MetadataModels.FieldColumn.LastUpdatedOn
			) {
				property[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] = false
			}

			return property
		})

		metadataModelsSearchMetadataModel = metadataModelsSearch.searchmetadatamodel

		try {
			await searchMetadataModels()
			getDisplayMetadataModelsExec = true
		} catch (e) {
			throw e
		}
	}
	function updateMetadataModelsMetadataModel(value: any) {
		metadataModelsSearchMetadataModel = value
		if (metadataModelsSearch) {
			metadataModelsSearch.searchmetadatamodel = metadataModelsSearchMetadataModel
		}
	}
	async function searchMetadataModels() {
		if (!metadataModelsSearch) {
			return
		}

		State.Loading.value = `Searching ${Domain.Entities.MetadataModels.RepositoryName}...`
		try {
			await metadataModelsSearch.Search(
				Utils.MetadataModel.InsertNewQueryConditionToQueryConditions(metadataModelsQueryConditions, [metadataModelsQuickSearchQueryCondition]),
				authContextDirectoryGroupID || undefined,
				authContextDirectoryGroupID || undefined,
				undefined,
				false,
				false,
				undefined
			)

			metadataModelsSearchFilterExcludeIndexes = []
			metadataModelsSearchResults = metadataModelsSearch.searchresults.data || []

			State.Toast.Type = Domain.Entities.Toast.Type.INFO
			State.Toast.Message = `${metadataModelsSearchResults.length} results returned`
		} catch (e) {
			const ERROR = `Search ${Domain.Entities.MetadataModels.RepositoryName} failed`
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)

			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = [ERROR]
			if (Array.isArray(e) && e.length === 2) {
				State.Toast.Message.push(`${e[0]}->${e[1].message}`)
				throw e
			} else {
				State.Toast.Message.push(`${500}->${Utils.DEFAULT_FETCH_ERROR}`)
				throw [500, ERROR]
			}
		} finally {
			State.Loading.value = undefined
		}
	}
	let showMetadataModelsQueryPanel: boolean = $state(false)
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

		{#if State.Session.session && State.Session.tokens && directorygroupid}
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
									const toastData = await datum.update(authedFetch, directorygroupid!, {
										componentName: COMPONENT_NAME,
										telemetry,
										authContextDirectoryGroupID,
										verboseResponse
									})

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
										const toastData = await datum.create(authedFetch, directorygroupid!, {
											componentName: COMPONENT_NAME,
											telemetry,
											authContextDirectoryGroupID,
											verboseResponse
										})

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
		{#await getDisplayDirectoryGroups()}
			{@render awaitloading()}
		{:then}
			<header class="z-[2] flex justify-center">
				{#await import('$lib/components/View/DirectoryGroups/SearchBar/Component.svelte') then { default: ViewDirectoryGroupsSearchBar }}
					<div class="w-full">
						<ViewDirectoryGroupsSearchBar
							metadatamodel={directoryGroupsSearchMetadataModel}
							{themecolor}
							{theme}
							{telemetry}
							querycondition={directoryGroupsQuickSearchQueryCondition}
							updatequerycondition={(value) => {
								directoryGroupsQuickSearchQueryCondition = value
							}}
							showquerypanel={() => {
								showDirectoryGroupsQueryPanel = !showDirectoryGroupsQueryPanel
							}}
							search={() => {
								searchDirectoryGroups()
							}}
						></ViewDirectoryGroupsSearchBar>
					</div>
				{/await}
			</header>

			<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
				{#if showDirectoryGroupsQueryPanel}
					<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
						{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
							<QueryPanel
								{themecolor}
								{theme}
								{telemetry}
								metadatamodel={directoryGroupsSearchMetadataModel}
								data={directoryGroupsSearchResults}
								queryconditions={directoryGroupsQueryConditions}
								filterexcludeindexes={directoryGroupsSearchFilterExcludeIndexes}
								updatefilterexcludeindexes={(value) => {
									directoryGroupsSearchFilterExcludeIndexes = value
									State.Toast.Type = Domain.Entities.Toast.Type.INFO
									State.Toast.Message = `${directoryGroupsSearchFilterExcludeIndexes.length} local results filtered out`
								}}
								updatemetadatamodel={updateDirectoryGroupsMetadataModel}
								updatequeryconditions={(value) => {
									directoryGroupsQueryConditions = value
								}}
								hidequerypanel={() => (showDirectoryGroupsQueryPanel = false)}
							></QueryPanel>
						{/await}
					</section>
				{/if}

				{#if !showDirectoryGroupsQueryPanel}
					<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
						<section class="z-[2] flex w-full">
							{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
								<div class="h-fit w-full flex-1 self-center">
									<ViewHeaderData title={'Pick Group...'} view={dataView} {themecolor} {theme} updateview={(value) => (dataView = value)}
									></ViewHeaderData>
								</div>
							{/await}
						</section>

						<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
							{#await import('$lib/components/View/DirectoryGroups/Data/Component.svelte') then { default: ViewDirectoryGroupsData }}
								<ViewDirectoryGroupsData
									metadatamodel={directoryGroupsSearchMetadataModel}
									data={directoryGroupsSearchResults}
									{themecolor}
									{theme}
									{telemetry}
									view={dataView}
									updatemetadatamodel={updateDirectoryGroupsMetadataModel}
									filterexcludeindexes={directoryGroupsSearchFilterExcludeIndexes}
									rowclick={(_, index) => {
										const directoryGroups: Domain.Entities.DirectoryGroups.Interface = directoryGroupsSearchResults[index]
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
	{:else if currentTab === Tab.PICK_METADATA_MODEL}
		{#await getDisplayMetadataModels()}
			{@render awaitloading()}
		{:then}
			<header class="z-[2] flex justify-center">
				{#await import('$lib/components/View/MetadataModels/SearchBar/Component.svelte') then { default: ViewMetadataModelsSearchBar }}
					<div class="w-full">
						<ViewMetadataModelsSearchBar
							metadatamodel={metadataModelsSearchMetadataModel}
							{themecolor}
							{theme}
							{telemetry}
							querycondition={metadataModelsQuickSearchQueryCondition}
							updatequerycondition={(value) => {
								metadataModelsQuickSearchQueryCondition = value
							}}
							showquerypanel={() => {
								showMetadataModelsQueryPanel = !showMetadataModelsQueryPanel
							}}
							search={() => {
								searchMetadataModels()
							}}
						></ViewMetadataModelsSearchBar>
					</div>
				{/await}
			</header>

			<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
				{#if showMetadataModelsQueryPanel}
					<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
						{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
							<QueryPanel
								{themecolor}
								{theme}
								{telemetry}
								metadatamodel={metadataModelsSearchMetadataModel}
								data={metadataModelsSearchResults}
								queryconditions={metadataModelsQueryConditions}
								filterexcludeindexes={metadataModelsSearchFilterExcludeIndexes}
								updatefilterexcludeindexes={(value) => {
									metadataModelsSearchFilterExcludeIndexes = value
									State.Toast.Type = Domain.Entities.Toast.Type.INFO
									State.Toast.Message = `${metadataModelsSearchFilterExcludeIndexes.length} local results filtered out`
								}}
								updatemetadatamodel={updateMetadataModelsMetadataModel}
								updatequeryconditions={(value) => {
									metadataModelsQueryConditions = value
								}}
								hidequerypanel={() => (showMetadataModelsQueryPanel = false)}
							></QueryPanel>
						{/await}
					</section>
				{/if}

				{#if !showMetadataModelsQueryPanel}
					<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
						<section class="z-[2] flex w-full">
							{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
								<div class="h-fit w-full flex-1 self-center">
									<ViewHeaderData title={'Pick Metadata Model...'} view={dataView} {themecolor} {theme} updateview={(value) => (dataView = value)}
									></ViewHeaderData>
								</div>
							{/await}
						</section>

						<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
							{#await import('$lib/components/View/MetadataModels/Data/Component.svelte') then { default: ViewMetadataModelsData }}
								<ViewMetadataModelsData
									metadatamodel={metadataModelsSearchMetadataModel}
									data={metadataModelsSearchResults}
									{themecolor}
									{theme}
									{telemetry}
									view={dataView}
									updatemetadatamodel={updateMetadataModelsMetadataModel}
									filterexcludeindexes={metadataModelsSearchFilterExcludeIndexes}
									rowclick={(_, index) => {
										const metadataModels: Domain.Entities.MetadataModels.Interface = metadataModelsSearchResults[index]
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
					const toastData = await datum.delete!(authedFetch, directorygroupid!, {
						componentName: COMPONENT_NAME,
						telemetry,
						authContextDirectoryGroupID,
						verboseResponse
					})

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

<script lang="ts">
	import { Component, Domain, Interfaces, MetadataModel, State, Utils } from '$lib'

	const COMPONENT_NAME = 'administration-abstractions-directory-groups'

	interface Props {
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		telemetry?: Domain.Interfaces.ITelemetry
		directorygroupid?: string
	}

	let {
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		telemetry = undefined,
		directorygroupid = undefined
	}: Props = $props()

	let authContextDirectoryGroupID = $derived(directorygroupid)

	let abstractionsDirectoryGroupsSearch: Domain.Interfaces.MetadataModels.Search | undefined = $derived.by(() => {
		if (
			!State.Session.session?.iam_credential ||
			!Array.isArray(State.Session.session.iam_credential.id) ||
			State.Session.session.iam_credential.id.length === 0
		) {
			return undefined
		}

		return new Interfaces.MetadataModels.SearchData(
			`${Domain.Entities.Url.ApiUrlPaths.Abstractions.DirectoryGroups}${Domain.Entities.Url.MetadataModelSearchGetMMPath}`,
			`${Domain.Entities.Url.ApiUrlPaths.Abstractions.DirectoryGroups}${Domain.Entities.Url.MetadataModelSearchPath}`,
			new Interfaces.AuthenticatedFetch.Client(true)
		)
	})

	let abstractionsDirectoryGroupsQueryConditions: MetadataModel.QueryConditions[] = $state([])
	let quickSearchQueryCondition: MetadataModel.QueryConditions = $state({})
	let abstractionsDirectoryGroupsSearchMetadataModel: any = $state({})
	let abstractionsDirectoryGroupsSearchResults: any[] = $state([])
	let abstractionsDirectoryGroupsSearchFilterExcludeIndexes: number[] = $state([])

	async function getDisplayAbstractionsDirectoryGroups() {
		if (!abstractionsDirectoryGroupsSearch) {
			throw [401, 'Unauthorized']
		}

		if (Object.keys(abstractionsDirectoryGroupsSearch.searchmetadatamodel).length === 0) {
			try {
				await abstractionsDirectoryGroupsSearch.FetchMetadataModel(authContextDirectoryGroupID, undefined, undefined)
			} catch (e) {
				const DEFAULT_ERROR = `Get ${Domain.Entities.AbstractionsDirectoryGroups.RepositoryName} metadata-model failed`

				telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, DEFAULT_ERROR, 'error', e)

				if (Array.isArray(e) && e.length === 2) {
					throw e
				} else {
					throw [500, DEFAULT_ERROR]
				}
			}
		}

		abstractionsDirectoryGroupsSearch.searchmetadatamodel = MetadataModel.MapFieldGroups(
			abstractionsDirectoryGroupsSearch.searchmetadatamodel,
			(property: any) => {
				if (
					property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] === 0 &&
					property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === Domain.Entities.AbstractionsDirectoryGroups.RepositoryName &&
					property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Domain.Entities.AbstractionsDirectoryGroups.FieldColumn.LastUpdatedOn
				) {
					property[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] = false
				}

				return property
			}
		)

		abstractionsDirectoryGroupsSearchMetadataModel = abstractionsDirectoryGroupsSearch.searchmetadatamodel
		try {
			await searchAbstractionsDirectoryGroups()
		} catch (e) {
			throw e
		}
	}

	function updateMetadataModel(value: any) {
		abstractionsDirectoryGroupsSearchMetadataModel = value
		if (abstractionsDirectoryGroupsSearch) {
			abstractionsDirectoryGroupsSearch.searchmetadatamodel = abstractionsDirectoryGroupsSearchMetadataModel
		}
	}

	async function searchAbstractionsDirectoryGroups() {
		if (!abstractionsDirectoryGroupsSearch) {
			return
		}

		State.Loading.value = `Searching ${Domain.Entities.AbstractionsDirectoryGroups.RepositoryName}...`
		try {
			await abstractionsDirectoryGroupsSearch.Search(
				Utils.MetadataModel.InsertNewQueryConditionToQueryConditions(abstractionsDirectoryGroupsQueryConditions, [quickSearchQueryCondition]),
				authContextDirectoryGroupID || undefined,
				authContextDirectoryGroupID || undefined,
				undefined,
				false,
				false,
				undefined
			)

			abstractionsDirectoryGroupsSearchFilterExcludeIndexes = []
			abstractionsDirectoryGroupsSearchResults = abstractionsDirectoryGroupsSearch.searchresults.data || []

			State.Toast.Type = Domain.Entities.Toast.Type.INFO
			State.Toast.Message = `${abstractionsDirectoryGroupsSearchResults.length} results returned`
		} catch (e) {
			const ERROR = `Search ${Domain.Entities.AbstractionsDirectoryGroups.RepositoryName} failed`
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

	let dataView: Component.View.View = $state('list')

	let showAbstractionsDirectoryGroupsQueryPanel: boolean = $state(false)

	let windowWidth: number = $state(0)

	let selectedAbstractionsDirectoryGroups: number[] = $state([])
	let showSelectedActions: boolean = $state(false)

	let authedFetch = new Interfaces.AuthenticatedFetch.Client()

	async function deleteDeactivateSelectedAbstractionsDirectoryGroups() {
		const data = selectedAbstractionsDirectoryGroups.map((dIndex) => abstractionsDirectoryGroupsSearchResults[dIndex])

		if (data.length === 0 || !directorygroupid) {
			return
		}

		State.Loading.value = `Deleting/Deactivating ${Domain.Entities.AbstractionsDirectoryGroups.RepositoryName}`
		try {
			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Abstractions.DirectoryGroups}/${Domain.Entities.Url.Action.DELETE}`)
			fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID, directorygroupid)
			if (authContextDirectoryGroupID) {
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, authContextDirectoryGroupID)
			}
			if (State.VerboseResponse.value) {
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.VERBOSE_RESPONSE, `${true}`)
			}

			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.DEBUG, State.Loading.value, 'fetchUrl', fetchUrl, 'data', data)

			const fetchResponse = await authedFetch.Fetch(fetchUrl, {
				method: 'POST',
				body: JSON.stringify(data)
			})

			const fetchData = await fetchResponse.json()
			if (fetchResponse.ok) {
				State.Toast.Type = !fetchData.failed
					? Domain.Entities.Toast.Type.SUCCESS
					: fetchData.successful && fetchData.successful > 0
						? Domain.Entities.Toast.Type.INFO
						: Domain.Entities.Toast.Type.ERROR
				const toastData = Domain.Entities.MetadataModel.GetToastFromJsonVerboseResponse(fetchData)
				State.Toast.Message = toastData.message
				State.Toast.MedataModelSearchResults = toastData.metadatamodel_search_results
				selectedAbstractionsDirectoryGroups = []
				showSelectedActions = false
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Delete/Deactivate ${Domain.Entities.Directory.RepositoryName} failed`
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
			handleError(e, ERROR)
		} finally {
			State.Loading.value = undefined
		}
	}

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

	let selectedAbstractionDirectoryGroup: number | undefined = $state(undefined)
	$effect(() => {
		if (typeof selectedAbstractionDirectoryGroup === 'number') {
			selectedAbstractionDirectoryGroupEntryDialogElement.showModal()
		}
	})

	let selectedAbstractionDirectoryGroupEntryDialogElement: HTMLDialogElement
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex flex-1 flex-col gap-y-2 overflow-hidden">
	{#await getDisplayAbstractionsDirectoryGroups()}
		<div class="flex h-full w-full flex-[9.5] justify-center">
			<span class="self-center">
				<span class="loading text-primary loading-ball loading-md"></span>
				<span class="loading text-secondary loading-ball loading-lg"></span>
				<span class="loading text-accent loading-ball loading-xl"></span>
			</span>
		</div>
	{:then}
		<header class="z-[2] flex justify-between gap-x-2">
			{#await import('$lib/components/View/AbstractionsDirectoryGroups/SearchBar/Component.svelte') then { default: ViewAbstractionsDirectoryGroupsSearchBar }}
				<div class="max-md:w-full md:w-[60%]">
					<ViewAbstractionsDirectoryGroupsSearchBar
						metadatamodel={abstractionsDirectoryGroupsSearchMetadataModel}
						{themecolor}
						{theme}
						{telemetry}
						querycondition={quickSearchQueryCondition}
						updatequerycondition={(value) => {
							quickSearchQueryCondition = value
						}}
						showquerypanel={() => {
							showAbstractionsDirectoryGroupsQueryPanel = !showAbstractionsDirectoryGroupsQueryPanel
						}}
						search={() => {
							searchAbstractionsDirectoryGroups()
						}}
					></ViewAbstractionsDirectoryGroupsSearchBar>
				</div>
			{/await}
			<button
				class="btn btn-md btn-circle tooltip tooltip-left self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'btn-primary tooltip-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'btn-secondary tooltip-secondary'
						: 'btn-accent tooltip-accent'}"
				aria-label="Setup abtraction for group"
				data-tip="Setup abstraction for group"
				onclick={() => {
					selectedAbstractionDirectoryGroup = -1
				}}
			>
				<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path fill="var({Utils.Theme.GetColorContent(themecolor)})" d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" />
				</svg>
			</button>
		</header>

		<div class="divider mb-0 mt-0"></div>

		<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
			{#if showAbstractionsDirectoryGroupsQueryPanel}
				<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
					{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
						<QueryPanel
							{themecolor}
							{theme}
							{telemetry}
							metadatamodel={abstractionsDirectoryGroupsSearchMetadataModel}
							data={abstractionsDirectoryGroupsSearchResults}
							queryconditions={abstractionsDirectoryGroupsQueryConditions}
							filterexcludeindexes={abstractionsDirectoryGroupsSearchFilterExcludeIndexes}
							updatefilterexcludeindexes={(value) => {
								abstractionsDirectoryGroupsSearchFilterExcludeIndexes = value
								State.Toast.Type = Domain.Entities.Toast.Type.INFO
								State.Toast.Message = `${abstractionsDirectoryGroupsSearchFilterExcludeIndexes.length} local results filtered out`
							}}
							updatemetadatamodel={updateMetadataModel}
							updatequeryconditions={(value) => {
								abstractionsDirectoryGroupsQueryConditions = value
							}}
							hidequerypanel={() => (showAbstractionsDirectoryGroupsQueryPanel = false)}
						></QueryPanel>
					{/await}
				</section>
			{/if}

			{#if !showAbstractionsDirectoryGroupsQueryPanel || windowWidth > 1000}
				{#if abstractionsDirectoryGroupsSearchResults.length > 0}
					<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
						{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
							<ViewHeaderData
								title={"Group' Abstractions' configurations"}
								view={dataView}
								{themecolor}
								{theme}
								updateview={(value) => (dataView = value)}
							></ViewHeaderData>
						{/await}
						{#await import('$lib/components/View/AbstractionsDirectoryGroups/Data/Component.svelte') then { default: ViewAbstractionsDirectoryGroupsData }}
							<ViewAbstractionsDirectoryGroupsData
								metadatamodel={abstractionsDirectoryGroupsSearchMetadataModel}
								data={abstractionsDirectoryGroupsSearchResults}
								{themecolor}
								{theme}
								{telemetry}
								addselectcolumn={true}
								view={dataView}
								updatemetadatamodel={updateMetadataModel}
								filterexcludeindexes={abstractionsDirectoryGroupsSearchFilterExcludeIndexes}
								selecteddataindexes={selectedAbstractionsDirectoryGroups}
								updateselecteddataindexes={(value) => (selectedAbstractionsDirectoryGroups = value)}
								rowclick={(_, index) => (selectedAbstractionDirectoryGroup = index)}
							></ViewAbstractionsDirectoryGroupsData>
						{/await}
					</section>
				{:else}
					<div class="flex flex-1 justify-center rounded-md p-2 {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-700' : 'bg-gray-200'}">
						<span class="flex self-center text-lg"> Setup and manage configuration for abstractions in groups. </span>
					</div>
				{/if}
			{/if}
		</main>
	{:catch e}
		{#await import('$lib/components/Error/Component.svelte') then { default: Error }}
			<div class="flex h-full w-full flex-[9.5] justify-center">
				<span class="self-center"><Error status={e[0]} message={e[1]} shadow={'inner'}></Error></span>
			</div>
		{/await}
	{/await}
</div>

<dialog bind:this={selectedAbstractionDirectoryGroupEntryDialogElement} id="selected-directory-group-dialog" class="modal">
	<div class="modal-box flex max-h-[90vh] w-fit flex-col overflow-hidden rounded p-0 max-md:min-w-[90%] md:min-w-[700px] md:max-w-[800px]">
		{#if typeof selectedAbstractionDirectoryGroup === 'number'}
			<header class="sticky left-0 right-0 top-0 mb-1 flex flex-[1] items-center justify-between p-2 shadow-sm shadow-gray-800">
				<div
					class="flex h-fit w-fit gap-x-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'text-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'text-secondary'
							: 'text-accent'}"
				>
					{selectedAbstractionDirectoryGroup < 0 ? 'Create New' : 'Edit'} Group Abstraction Setup
				</div>
				<button
					class="btn btn-circle btn-ghost"
					onclick={() => {
						selectedAbstractionDirectoryGroup = undefined
						selectedAbstractionDirectoryGroupEntryDialogElement.close()
						searchAbstractionsDirectoryGroups()
					}}
				>
					<!--mdi:close-circle source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColor(themecolor)})"
							d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"
						/>
					</svg>
				</button>
			</header>

			<main class="flex flex-1 overflow-hidden p-2">
				{#await import('./Datum.svelte') then { default: Datum }}
					<Datum
						metadatamodel={selectedAbstractionDirectoryGroup > -1 && abstractionsDirectoryGroupsSearchMetadataModel}
						datum={selectedAbstractionDirectoryGroup > -1 && abstractionsDirectoryGroupsSearchResults[selectedAbstractionDirectoryGroup]}
						{theme}
						{themecolor}
						{telemetry}
						{directorygroupid}
					></Datum>
				{/await}
			</main>
		{/if}
	</div>
</dialog>
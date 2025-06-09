<script lang="ts">
	import { Component, Domain, Interfaces, MetadataModel, State, Utils } from '$lib'

	const COMPONENT_NAME = 'administration-group-authorization-rules'

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

	let groupAuthorizationRulesSearch: Domain.Interfaces.MetadataModels.Search | undefined = $derived.by(() => {
		if (
			!State.Session.session?.iam_credential ||
			!Array.isArray(State.Session.session.iam_credential.id) ||
			State.Session.session.iam_credential.id.length === 0
		) {
			return undefined
		}

		return new Interfaces.MetadataModels.SearchData(
			`${Domain.Entities.Url.ApiUrlPaths.Group.AuthorizationRules}${Domain.Entities.Url.MetadataModelSearchGetMMPath}`,
			`${Domain.Entities.Url.ApiUrlPaths.Group.AuthorizationRules}${Domain.Entities.Url.MetadataModelSearchPath}`,
			new Interfaces.AuthenticatedFetch.Client(true)
		)
	})

	let groupAuthorizationRulesQueryConditions: MetadataModel.QueryConditions[] = $state([])
	let quickSearchQueryCondition: MetadataModel.QueryConditions = $state({})
	let groupAuthorizationRulesSearchMetadataModel: any = $state({})
	let groupAuthorizationRulesSearchResults: any[] = $state([])
	let groupAuthorizationRulesSearchFilterExcludeIndexes: number[] = $state([])

	async function getDisplayGroupAuthorizationRules() {
		if (!groupAuthorizationRulesSearch) {
			throw [401, 'Unauthorized']
		}

		if (Object.keys(groupAuthorizationRulesSearch.searchmetadatamodel).length === 0) {
			try {
				await groupAuthorizationRulesSearch.FetchMetadataModel(authContextDirectoryGroupID, undefined, undefined)
			} catch (e) {
				const DEFAULT_ERROR = `Get ${Domain.Entities.GroupAuthorizationRules.RepositoryName} metadata-model failed`

				telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, DEFAULT_ERROR, 'error', e)

				if (Array.isArray(e) && e.length === 2) {
					throw e
				} else {
					throw [500, DEFAULT_ERROR]
				}
			}
		}

		groupAuthorizationRulesSearch.searchmetadatamodel = MetadataModel.MapFieldGroups(
			groupAuthorizationRulesSearch.searchmetadatamodel,
			(property: any) => {
				if (
					property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] === 0 &&
					property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === Domain.Entities.GroupAuthorizationRules.RepositoryName &&
					property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Domain.Entities.GroupAuthorizationRules.FieldColumn.LastUpdatedOn
				) {
					property[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] = false
				}

				return property
			}
		)

		groupAuthorizationRulesSearchMetadataModel = groupAuthorizationRulesSearch.searchmetadatamodel
		try {
			await searchGroupAuthorizationRules()
		} catch (e) {
			throw e
		}
	}

	function updateMetadataModel(value: any) {
		groupAuthorizationRulesSearchMetadataModel = value
		if (groupAuthorizationRulesSearch) {
			groupAuthorizationRulesSearch.searchmetadatamodel = groupAuthorizationRulesSearchMetadataModel
		}
	}

	async function searchGroupAuthorizationRules() {
		if (!groupAuthorizationRulesSearch) {
			return
		}

		State.Loading.value = `Searching ${Domain.Entities.GroupAuthorizationRules.RepositoryName}...`
		try {
			await groupAuthorizationRulesSearch.Search(
				Utils.MetadataModel.InsertNewQueryConditionToQueryConditions(groupAuthorizationRulesQueryConditions, [quickSearchQueryCondition]),
				authContextDirectoryGroupID || undefined,
				authContextDirectoryGroupID || undefined,
				undefined,
				false,
				false,
				undefined
			)

			groupAuthorizationRulesSearchFilterExcludeIndexes = []
			groupAuthorizationRulesSearchResults = groupAuthorizationRulesSearch.searchresults.data || []

			State.Toast.Type = Domain.Entities.Toast.Type.INFO
			State.Toast.Message = `${groupAuthorizationRulesSearchResults.length} results returned`
		} catch (e) {
			const ERROR = `Search ${Domain.Entities.GroupAuthorizationRules.RepositoryName} failed`
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

	let showGroupAuthorizationRulesQueryPanel: boolean = $state(false)

	let windowWidth: number = $state(0)
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex flex-1 flex-col gap-y-2 overflow-hidden">
	{#await getDisplayGroupAuthorizationRules()}
		<div class="flex h-full w-full flex-[9.5] justify-center">
			<span class="self-center">
				<span class="loading text-primary loading-ball loading-md"></span>
				<span class="loading text-secondary loading-ball loading-lg"></span>
				<span class="loading text-accent loading-ball loading-xl"></span>
			</span>
		</div>
	{:then}
		<header class="z-[2] flex justify-center">
			{#await import('$lib/components/View/GroupAuthorizationRules/SearchBar/Component.svelte') then { default: ViewGroupAuthorizationRulesSearchBar }}
				<div class="max-md:w-full md:w-[60%]">
					<ViewGroupAuthorizationRulesSearchBar
						metadatamodel={groupAuthorizationRulesSearchMetadataModel}
						{themecolor}
						{theme}
						{telemetry}
						querycondition={quickSearchQueryCondition}
						updatequerycondition={(value) => {
							quickSearchQueryCondition = value
						}}
						showquerypanel={() => {
							showGroupAuthorizationRulesQueryPanel = !showGroupAuthorizationRulesQueryPanel
						}}
						search={() => {
							searchGroupAuthorizationRules()
						}}
					></ViewGroupAuthorizationRulesSearchBar>
				</div>
			{/await}
		</header>

		<div class="divider mb-0 mt-0"></div>

		<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
			{#if showGroupAuthorizationRulesQueryPanel}
				<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
					{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
						<QueryPanel
							{themecolor}
							{theme}
							{telemetry}
							metadatamodel={groupAuthorizationRulesSearchMetadataModel}
							data={groupAuthorizationRulesSearchResults}
							queryconditions={groupAuthorizationRulesQueryConditions}
							filterexcludeindexes={groupAuthorizationRulesSearchFilterExcludeIndexes}
							updatefilterexcludeindexes={(value) => {
								groupAuthorizationRulesSearchFilterExcludeIndexes = value
								State.Toast.Type = Domain.Entities.Toast.Type.INFO
								State.Toast.Message = `${groupAuthorizationRulesSearchFilterExcludeIndexes.length} local results filtered out`
							}}
							updatemetadatamodel={updateMetadataModel}
							updatequeryconditions={(value) => {
								groupAuthorizationRulesQueryConditions = value
							}}
							hidequerypanel={() => (showGroupAuthorizationRulesQueryPanel = false)}
						></QueryPanel>
					{/await}
				</section>
			{/if}

			{#if !showGroupAuthorizationRulesQueryPanel || windowWidth > 1000}
				{#if groupAuthorizationRulesSearchResults.length > 0}
					<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
						{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
							<ViewHeaderData title={'Group Authorization Rules'} view={dataView} {themecolor} {theme} updateview={(value) => (dataView = value)}
							></ViewHeaderData>
						{/await}
						{#await import('$lib/components/View/GroupAuthorizationRules/Data/Component.svelte') then { default: ViewGroupAuthorizationRulesData }}
							<ViewGroupAuthorizationRulesData
								metadatamodel={groupAuthorizationRulesSearchMetadataModel}
								data={groupAuthorizationRulesSearchResults}
								{themecolor}
								{theme}
								{telemetry}
								addclickcolumn={false}
								view={dataView}
								updatemetadatamodel={updateMetadataModel}
								filterexcludeindexes={groupAuthorizationRulesSearchFilterExcludeIndexes}
							></ViewGroupAuthorizationRulesData>
						{/await}
					</section>
				{:else}
					<div class="flex flex-1 justify-center rounded-md p-2 {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-700' : 'bg-gray-200'}">
						<span class="flex self-center text-lg">
							View and update the tags of various authorization rules from which group roles can be created from and assigned to users.
						</span>
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

<script lang="ts">
	import { Component, Domain, Interfaces, MetadataModel, State, Utils } from '$lib'
	import { getContext, onMount, untrack } from 'svelte'
	import type { PageProps } from './$types'
	import { Tab } from './util'

	const COMPONENT_NAME = 'directory-group-home-page'

	let { data }: PageProps = $props()

	let telemetry: Domain.Interfaces.ITelemetry | undefined = $derived.by(() => {
		return getContext(State.TelemetryContext.value)
	})

	let windowWidth: number = $state(0)

	onMount(() => {
		if (data.tokens?.access_token && data.tokens?.refresh_token) {
			State.Session.tokens = {
				access_token: data.tokens.access_token,
				refresh_token: data.tokens.refresh_token
			}
		} else {
			State.Session.tokens = undefined
		}

		if (data.authentication_headers) {
			State.AuthenticationHeaders.value = data.authentication_headers
		} else {
			State.AuthenticationHeaders.value = undefined
		}
	})

	let datumView: Component.View.View = $state('simple')

	let leftSectionTab: Tab = $state(Tab.INFO)
	let rightSectionTab: Tab = $state(Tab.ROLES)
	$effect(() => {
		if (windowWidth > 1000) {
			if (leftSectionTab !== Tab.INFO) {
				leftSectionTab = Tab.INFO
			}
		}
	})

	let authContextDirectoryGroupID = $derived(data.directory_group_id)

	let currentUserRolesSearch: Domain.Interfaces.MetadataModels.Search
	$effect(() => {
		if (
			!State.Session.session?.iam_credential ||
			!Array.isArray(State.Session.session.iam_credential.id) ||
			State.Session.session.iam_credential.id.length === 0
		) {
			return
		}

		if ((windowWidth > 1000 && rightSectionTab == Tab.ROLES) || leftSectionTab === Tab.ROLES) {
			untrack(() => initGetCurrentUserRoles())
		}
	})
	async function initGetCurrentUserRoles() {
		if (!currentUserRolesSearch || Object.keys(currentUserRolesSearch.searchmetadatamodel).length === 0) {
			return await getCurrentUserRoles()
		}

		return {
			metadata_model: currentUserRolesSearch.searchmetadatamodel,
			data: currentUserRolesSearch.searchresults.data
		} as Domain.Entities.MetadataModel.ISearchResults
	}
	async function getCurrentUserRoles() {
		if (
			!State.Session.session?.iam_credential ||
			!Array.isArray(State.Session.session.iam_credential.id) ||
			State.Session.session.iam_credential.id.length === 0
		) {
			throw [401, 'Unauthorized']
		}

		if (!currentUserRolesSearch || Object.keys(currentUserRolesSearch.searchmetadatamodel).length === 0) {
			try {
				currentUserRolesSearch = new Interfaces.MetadataModels.SearchData(
					`${Domain.Entities.Url.ApiUrlPaths.Iam.GroupAuthorizations}${Domain.Entities.Url.MetadataModelSearchGetMMPath}`,
					`${Domain.Entities.Url.ApiUrlPaths.Iam.GroupAuthorizations}${Domain.Entities.Url.MetadataModelSearchPath}`,
					new Interfaces.AuthenticatedFetch.Client(true)
				)

				await currentUserRolesSearch.FetchMetadataModel(authContextDirectoryGroupID, 2, undefined)

				currentUserRolesSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_LIMIT] = 100

				currentUserRolesSearch.searchmetadatamodel = MetadataModel.MapFieldGroups(currentUserRolesSearch.searchmetadatamodel, (property: any) => {
					if (
						property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] === 0 &&
						property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === Domain.Entities.IamGroupAuthorizations.RepositoryName &&
						property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Domain.Entities.IamGroupAuthorizations.FieldColumn.CreatedOn
					) {
						property[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] = false
					}

					return property
				})
			} catch (e) {
				const DEFAULT_ERROR = `Get ${Domain.Entities.IamGroupAuthorizations.RepositoryName} metadata-model failed`

				telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, DEFAULT_ERROR, 'error', e)

				if (Array.isArray(e) && e.length === 2) {
					throw e
				} else {
					throw [500, DEFAULT_ERROR]
				}
			}
		}

		const iamCredentialIDQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
			currentUserRolesSearch.searchmetadatamodel,
			Domain.Entities.IamGroupAuthorizations.FieldColumn.IamCredentialsID,
			currentUserRolesSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME],
			currentUserRolesSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH]
		)

		if (!iamCredentialIDQCKey) {
			throw [500, `iamCredentialIDQCKey not valid`]
		}

		let queryCondition: MetadataModel.QueryConditions[] = [
			{
				[iamCredentialIDQCKey.qcKey]: {
					[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]:
						iamCredentialIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
					[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]:
						iamCredentialIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME],
					[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
						[
							{
								[MetadataModel.FConditionProperties.NEGATE]: false,
								[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
								[MetadataModel.FConditionProperties.VALUE]: {
									[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.TEXT,
									[MetadataModel.FSelectProperties.VALUE]: State.Session.session.iam_credential.id[0]
								}
							}
						]
					]
				}
			}
		]

		const directoryGroupIDQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
			currentUserRolesSearch.searchmetadatamodel,
			Domain.Entities.GroupRuleAuthorizations.FieldColumn.DirectoryGroupsID,
			Domain.Entities.GroupRuleAuthorizations.RepositoryName,
			1
		)

		if (!directoryGroupIDQCKey) {
			throw [500, `directoryGroupIDQCKey not valid`]
		}

		queryCondition[0][directoryGroupIDQCKey.qcKey] = {
			[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]: directoryGroupIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
			[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: directoryGroupIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME],
			[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
				[
					{
						[MetadataModel.FConditionProperties.NEGATE]: false,
						[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
						[MetadataModel.FConditionProperties.VALUE]: {
							[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.TEXT,
							[MetadataModel.FSelectProperties.VALUE]: data.directory_group_id
						}
					}
				]
			]
		}

		try {
			await currentUserRolesSearch.Search(
				queryCondition,
				authContextDirectoryGroupID || undefined,
				authContextDirectoryGroupID || undefined,
				2,
				false,
				false,
				undefined
			)
		} catch (e) {
			const DEFAULT_ERROR = `Search ${Domain.Entities.IamGroupAuthorizations.RepositoryName} failed`

			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, DEFAULT_ERROR, 'error', e)

			if (Array.isArray(e) && e.length === 2) {
				throw e
			} else {
				throw [500, DEFAULT_ERROR]
			}
		}

		if (Array.isArray(currentUserRolesSearch.searchresults.data) && currentUserRolesSearch.searchresults.data.length > 0) {
			return {
				metadata_model: currentUserRolesSearch.searchmetadatamodel,
				data: currentUserRolesSearch.searchresults.data
			} as Domain.Entities.MetadataModel.ISearchResults
		} else {
			throw [404, 'Not Found']
		}
	}

	let groupParticipantsSearch: Domain.Interfaces.MetadataModels.Search
	$effect(() => {
		if (
			!State.Session.session?.iam_credential ||
			!Array.isArray(State.Session.session.iam_credential.id) ||
			State.Session.session.iam_credential.id.length === 0
		) {
			return
		}

		if ((windowWidth > 1000 && rightSectionTab == Tab.PARTICIPANTS) || leftSectionTab === Tab.PARTICIPANTS) {
			untrack(() => initGetCurrentUserRoles())
		}
	})
	async function initGetGroupParticipants() {
		if (!groupParticipantsSearch || Object.keys(groupParticipantsSearch.searchmetadatamodel).length === 0) {
			return await getGroupParticipants()
		}

		return {
			metadata_model: groupParticipantsSearch.searchmetadatamodel,
			data: groupParticipantsSearch.searchresults.data
		} as Domain.Entities.MetadataModel.ISearchResults
	}
	async function getGroupParticipants() {
		if (
			!State.Session.session?.iam_credential ||
			!Array.isArray(State.Session.session.iam_credential.id) ||
			State.Session.session.iam_credential.id.length === 0
		) {
			throw [401, 'Unauthorized']
		}

		if (!groupParticipantsSearch) {
			try {
				groupParticipantsSearch = new Interfaces.MetadataModels.SearchData(
					`${Domain.Entities.Url.ApiUrlPaths.Iam.GroupAuthorizations}${Domain.Entities.Url.MetadataModelSearchGetMMPath}`,
					`${Domain.Entities.Url.ApiUrlPaths.Iam.GroupAuthorizations}${Domain.Entities.Url.MetadataModelSearchPath}`,
					new Interfaces.AuthenticatedFetch.Client(true)
				)

				await groupParticipantsSearch.FetchMetadataModel(authContextDirectoryGroupID, 2, undefined)
			} catch (e) {
				const DEFAULT_ERROR = `Get ${Domain.Entities.IamGroupAuthorizations.RepositoryName} metadata-model failed`

				telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, DEFAULT_ERROR, 'error', e)

				if (Array.isArray(e) && e.length === 2) {
					throw e
				} else {
					throw [500, DEFAULT_ERROR]
				}
			}
		}

		groupParticipantsSearch.searchmetadatamodel = MetadataModel.MapFieldGroups(groupParticipantsSearch.searchmetadatamodel, (property: any) => {
			if (property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] === 0) {
				if (property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === Domain.Entities.IamGroupAuthorizations.RepositoryName) {
					if (
						property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Domain.Entities.IamGroupAuthorizations.FieldColumn.IamCredentialsID
					) {
						property[MetadataModel.FgProperties.DATABASE_DISTINCT] = true
					}
				}
			}

			return property
		})

		const directoryGroupIDQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
			groupParticipantsSearch.searchmetadatamodel,
			Domain.Entities.GroupRuleAuthorizations.FieldColumn.DirectoryGroupsID,
			Domain.Entities.GroupRuleAuthorizations.RepositoryName,
			1
		)

		if (!directoryGroupIDQCKey) {
			throw [500, `directoryGroupIDQCKey not valid`]
		}

		let queryCondition: MetadataModel.QueryConditions[] = [
			{
				[directoryGroupIDQCKey?.qcKey]: {
					[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]:
						directoryGroupIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
					[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]:
						directoryGroupIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME],
					[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
						[
							{
								[MetadataModel.FConditionProperties.NEGATE]: false,
								[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
								[MetadataModel.FConditionProperties.VALUE]: {
									[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.TEXT,
									[MetadataModel.FSelectProperties.VALUE]: data.directory_group_id
								}
							}
						]
					]
				}
			}
		]

		try {
			await groupParticipantsSearch.Search(
				queryCondition,
				authContextDirectoryGroupID || undefined,
				authContextDirectoryGroupID || undefined,
				2,
				false,
				false,
				undefined
			)
		} catch (e) {
			const DEFAULT_ERROR = `Search ${Domain.Entities.IamGroupAuthorizations.RepositoryName} failed`

			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, DEFAULT_ERROR, 'error', e)

			if (Array.isArray(e) && e.length === 2) {
				throw e
			} else {
				throw [500, DEFAULT_ERROR]
			}
		}

		if (Array.isArray(groupParticipantsSearch.searchresults.data) && groupParticipantsSearch.searchresults.data.length > 0) {
			return {
				metadata_model: groupParticipantsSearch.searchmetadatamodel,
				data: groupParticipantsSearch.searchresults.data
			} as Domain.Entities.MetadataModel.ISearchResults
		} else {
			throw [404, 'Not Found']
		}
	}

	let dataView: Component.View.View = $state('list')
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex h-full flex-1 gap-x-2 self-center overflow-hidden pb-1">
	<section
		id="left-section"
		class="flex flex-1 flex-col justify-between gap-y-1 overflow-hidden rounded-md p-4 shadow-md shadow-gray-800 {State.Theme.value ===
		Domain.Entities.Theme.Theme.DARK
			? 'bg-base-200'
			: 'bg-white'}"
	>
		{#if windowWidth <= 1000}
			<header class="flex justify-between">
				<section role="tablist" class="tabs tabs-lift flex-[9]">
					<button role="tab" class="flex-1 tab{leftSectionTab === Tab.INFO ? ' tab-active' : ''}" onclick={() => (leftSectionTab = Tab.INFO)}>
						Group Information
					</button>
					<button role="tab" class="flex-1 tab{leftSectionTab === Tab.ROLES ? ' tab-active' : ''}" onclick={() => (leftSectionTab = Tab.ROLES)}>
						Assigned Roles
					</button>
					<button
						role="tab"
						class="flex-1 tab{leftSectionTab === Tab.PARTICIPANTS ? ' tab-active' : ''}"
						onclick={() => (leftSectionTab = Tab.PARTICIPANTS)}
					>
						Participants
					</button>
				</section>
				{@render switchview()}
			</header>
		{/if}

		<main class="flex flex-[9.5] flex-col gap-y-2 overflow-hidden">
			{#if leftSectionTab === Tab.INFO}
				<div class="flex flex-1 flex-col justify-between overflow-hidden">
					<div class="flex flex-col gap-y-2 overflow-hidden">
						{#await import('$lib/components/View/Header/Datum/Component.svelte') then { default: ViewHeaderDatum }}
							<ViewHeaderDatum
								title="Current Group Info"
								view={datumView}
								updateview={(value) => (datumView = value)}
								theme={State.Theme.value}
								themecolor={State.ThemeColor.value}
							></ViewHeaderDatum>
						{/await}

						{#await import('$lib/components/View/DirectoryGroups/Datum/Component.svelte') then { default: ViewDirectoryGroupDatum }}
							<ViewDirectoryGroupDatum
								metadatamodel={data.current_directory_group?.metadata_model}
								data={data.current_directory_group?.datum}
								themecolor={State.ThemeColor.value}
								theme={State.Theme.value}
								{telemetry}
								view={datumView}
								rounded={false}
							></ViewDirectoryGroupDatum>
						{/await}
					</div>

					<Component.Intro.Footer></Component.Intro.Footer>
				</div>
			{:else if leftSectionTab === Tab.ROLES}
				{@render currentuserroles()}
			{:else if leftSectionTab === Tab.PARTICIPANTS}
				{@render Participants()}
			{/if}
		</main>
	</section>

	{#if windowWidth > 1000}
		<section
			id="right-section"
			class="flex flex-1 flex-col gap-y-1 overflow-hidden rounded-md p-1 shadow-md shadow-gray-800 {State.Theme.value ===
			Domain.Entities.Theme.Theme.DARK
				? 'bg-base-200'
				: 'bg-white'}"
		>
			<header class="flex justify-between">
				<section role="tablist" class="tabs tabs-lift flex-[9]">
					<button role="tab" class="flex-1 tab{rightSectionTab === Tab.ROLES ? ' tab-active' : ''}" onclick={() => (rightSectionTab = Tab.ROLES)}>
						Assigned Roles
					</button>
					<button
						role="tab"
						class="flex-1 tab{rightSectionTab === Tab.PARTICIPANTS ? ' tab-active' : ''}"
						onclick={() => (rightSectionTab = Tab.PARTICIPANTS)}
					>
						Participants
					</button>
				</section>
				{@render switchview()}
			</header>

			<main class="flex flex-[9.5] flex-col gap-y-2 overflow-hidden">
				{#if rightSectionTab === Tab.ROLES}
					{@render currentuserroles()}
				{:else if rightSectionTab === Tab.PARTICIPANTS}
					{@render Participants()}
				{/if}
			</main>
		</section>
	{/if}
</div>

{#snippet switchview()}
	{#await import('$lib/components/View/SwitchView/Data/Component.svelte') then { default: ViewSwitchViewData }}
		<ViewSwitchViewData view={dataView} theme={State.Theme.value} themecolor={State.ThemeColor.value} updateview={(value) => (dataView = value)}
		></ViewSwitchViewData>
	{/await}
{/snippet}

{#snippet currentuserroles()}
	{#await initGetCurrentUserRoles()}
		<div class="flex h-full w-full flex-[9.5] justify-center">
			<span class="self-center">
				<span class="loading text-primary loading-ball loading-md"></span>
				<span class="loading text-secondary loading-ball loading-lg"></span>
				<span class="loading text-accent loading-ball loading-xl"></span>
			</span>
		</div>
	{:then cur}
		{#await import('$lib/components/View/IamGroupAuthorizations/Data/Component.svelte') then { default: ViewIamGroupAuthorizationData }}
			<ViewIamGroupAuthorizationData
				metadatamodel={cur.metadata_model}
				data={cur.data}
				theme={State.Theme.value}
				themecolor={State.ThemeColor.value}
				{telemetry}
				addclickcolumn={false}
				view={dataView}
			></ViewIamGroupAuthorizationData>
		{/await}
	{:catch e}
		{#await import('$lib/components/Error/Component.svelte') then { default: Error }}
			<div class="flex h-full w-full flex-[9.5] justify-center">
				<span class="self-center"><Error status={e[0]} message={e[1]} shadow={'inner'}></Error></span>
			</div>
		{/await}
	{/await}
{/snippet}

{#snippet Participants()}
	{#await initGetGroupParticipants()}
		<div class="flex h-full w-full flex-[9.5] justify-center">
			<span class="self-center">
				<span class="loading text-primary loading-ball loading-md"></span>
				<span class="loading text-secondary loading-ball loading-lg"></span>
				<span class="loading text-accent loading-ball loading-xl"></span>
			</span>
		</div>
	{:then cur}
		{#await import('$lib/components/View/IamGroupAuthorizations/Data/Component.svelte') then { default: ViewIamGroupAuthorizationData }}
			<ViewIamGroupAuthorizationData
				metadatamodel={cur.metadata_model}
				data={cur.data}
				theme={State.Theme.value}
				themecolor={State.ThemeColor.value}
				{telemetry}
				addclickcolumn={false}
				view={dataView}
				viewContext={'iam-credentials'}
			></ViewIamGroupAuthorizationData>
		{/await}
	{:catch e}
		{#await import('$lib/components/Error/Component.svelte') then { default: Error }}
			<div class="flex h-full w-full flex-[9.5] justify-center">
				<span class="self-center"><Error status={e[0]} message={e[1]} shadow={'inner'}></Error></span>
			</div>
		{/await}
	{/await}
{/snippet}

<script lang="ts">
	import { Component, Domain, Interfaces, MetadataModel, State, Utils } from '$lib'

	const COMPONENT_NAME = 'administration-group-rule-authorizations'

	interface Props {
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		telemetry?: Domain.Interfaces.ITelemetry
		directoryGroupIDContext?: string
		directorygroupid?: string
	}

	let {
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		telemetry = undefined,
		directoryGroupIDContext = undefined,
		directorygroupid = undefined
	}: Props = $props()

	let authContextDirectoryGroupID = $derived(directorygroupid)

	let groupRuleAuthorizationsSearch: Domain.Interfaces.MetadataModels.Search | undefined = $derived.by(() => {
		if (
			!State.Session.session?.iam_credential ||
			!Array.isArray(State.Session.session.iam_credential.id) ||
			State.Session.session.iam_credential.id.length === 0
		) {
			return undefined
		}

		return new Interfaces.MetadataModels.SearchData(
			`${Domain.Entities.Url.ApiUrlPaths.Group.RuleAuthorizations}${Domain.Entities.Url.MetadataModelSearchGetMMPath}`,
			`${Domain.Entities.Url.ApiUrlPaths.Group.RuleAuthorizations}${Domain.Entities.Url.MetadataModelSearchPath}`,
			new Interfaces.AuthenticatedFetch.Client(true)
		)
	})
	let groupRuleAuthorizationsQueryConditions: MetadataModel.QueryConditions[] = $state([])
	let directoryGroupIDContextQueryCondition: MetadataModel.QueryConditions = $state({})
	let groupRuleAuthorizationsQuickSearchQueryCondition: MetadataModel.QueryConditions = $state({})
	let groupRuleAuthorizationsSearchMetadataModel: any = $state({})
	let groupRuleAuthorizationsSearchResults: any[] = $state([])
	let groupRuleAuthorizationsSearchFilterExcludeIndexes: number[] = $state([])
	let getDisplayGroupRuleAuthorizationsExec: boolean = false
	async function getDisplayGroupRuleAuthorizations() {
		if (!groupRuleAuthorizationsSearch) {
			throw [401, 'Unauthorized']
		}

		if (Object.keys(groupRuleAuthorizationsSearch.searchmetadatamodel).length === 0) {
			try {
				await groupRuleAuthorizationsSearch.FetchMetadataModel(authContextDirectoryGroupID, undefined, undefined)
			} catch (e) {
				const DEFAULT_ERROR = `Get ${Domain.Entities.GroupRuleAuthorizations.RepositoryName} metadata-model failed`

				telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, DEFAULT_ERROR, 'error', e)

				if (Array.isArray(e) && e.length === 2) {
					throw e
				} else {
					throw [500, DEFAULT_ERROR]
				}
			}
		}

		groupRuleAuthorizationsSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_LIMIT] = 50

		groupRuleAuthorizationsSearch.searchmetadatamodel = MetadataModel.MapFieldGroups(
			groupRuleAuthorizationsSearch.searchmetadatamodel,
			(property: any) => {
				if (
					property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] === 0 &&
					property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === Domain.Entities.GroupRuleAuthorizations.RepositoryName &&
					property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Domain.Entities.GroupRuleAuthorizations.FieldColumn.CreatedOn
				) {
					property[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] = false
				}

				return property
			}
		)

		groupRuleAuthorizationsSearchMetadataModel = groupRuleAuthorizationsSearch.searchmetadatamodel

		if (directoryGroupIDContext) {
			const directoryGroupIDQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
				groupRuleAuthorizationsSearchMetadataModel,
				Domain.Entities.GroupRuleAuthorizations.FieldColumn.DirectoryGroupsID,
				Domain.Entities.GroupRuleAuthorizations.RepositoryName,
				0
			)

			if (directoryGroupIDQCKey) {
				directoryGroupIDContextQueryCondition = {
					[directoryGroupIDQCKey.qcKey]: {
						[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]:
							directoryGroupIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
						[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: directoryGroupIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
						[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
							[
								{
									[MetadataModel.FConditionProperties.NEGATE]: false,
									[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
									[MetadataModel.FConditionProperties.VALUE]: {
										[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.TEXT,
										[MetadataModel.FSelectProperties.VALUE]: directoryGroupIDContext
									}
								}
							]
						]
					}
				}
			} else {
				throw [400, 'Failed to set Directory Group ID Context']
			}
		}
		try {
			await searchGroupRuleAuthorizations()
			getDisplayGroupRuleAuthorizationsExec = true
		} catch (e) {
			throw e
		}
	}
	function updateGroupRuleAuthorizationsMetadataModel(value: any) {
		groupRuleAuthorizationsSearchMetadataModel = value
		if (groupRuleAuthorizationsSearch) {
			groupRuleAuthorizationsSearch.searchmetadatamodel = groupRuleAuthorizationsSearchMetadataModel
		}
	}
	async function searchGroupRuleAuthorizations() {
		if (!groupRuleAuthorizationsSearch) {
			return
		}

		State.Loading.value = `Searching ${Domain.Entities.GroupRuleAuthorizations.RepositoryName}...`
		try {
			await groupRuleAuthorizationsSearch.Search(
				Utils.MetadataModel.InsertNewQueryConditionToQueryConditions(groupRuleAuthorizationsQueryConditions, [
					groupRuleAuthorizationsQuickSearchQueryCondition,
					directoryGroupIDContextQueryCondition
				]),
				authContextDirectoryGroupID || undefined,
				authContextDirectoryGroupID || undefined,
				undefined,
				false,
				false,
				undefined
			)

			groupRuleAuthorizationsSearchFilterExcludeIndexes = []
			groupRuleAuthorizationsSearchResults = groupRuleAuthorizationsSearch.searchresults.data || []

			State.Toast.Type = Domain.Entities.Toast.Type.INFO
			State.Toast.Message = `${groupRuleAuthorizationsSearchResults.length} results returned`
		} catch (e) {
			const ERROR = `Search ${Domain.Entities.GroupRuleAuthorizations.RepositoryName} failed`
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
	let showGroupRuleAuthorizationsQueryPanel: boolean = $state(false)
	let selectedGroupRuleAuthorizations: number[] = $state([])
	let showSelectedActions: boolean = $state(false)

	let dataView: Component.View.View = $state('list')

	let windowWidth: number = $state(0)

	let showCreateNewGroupRuleAuthorizations: boolean = $state(false)

	let authedFetch = new Interfaces.AuthenticatedFetch.Client()

	async function deleteDeactivatesSelectedGroupRuleAuthorizations() {
		const data = selectedGroupRuleAuthorizations.map((dIndex) => groupRuleAuthorizationsSearchResults[dIndex])

		if (data.length === 0 || !directorygroupid) {
			return
		}

		State.Loading.value = `Deleting/Deactivating ${Domain.Entities.GroupRuleAuthorizations.RepositoryName}`
		try {
			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Group.RuleAuthorizations}/${Domain.Entities.Url.Action.DELETE}`)
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
				selectedGroupRuleAuthorizations = []
				showSelectedActions = false
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Delete/Deactivate ${Domain.Entities.GroupRuleAuthorizations.RepositoryName} failed`
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

	let directoryGroupsSearch: Domain.Interfaces.MetadataModels.Search | undefined = $derived.by(() => {
		if (
			!State.Session.session?.iam_credential ||
			!Array.isArray(State.Session.session.iam_credential.id) ||
			State.Session.session.iam_credential.id.length === 0 ||
			directoryGroupIDContext
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
				Utils.MetadataModel.InsertNewQueryConditionToQueryConditions(directoryGroupsQueryConditions, [
					directoryGroupsQuickSearchQueryCondition,
					directoryGroupIDContextQueryCondition
				]),
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
	let selectedDirectoryGroups: number[] = $state([])

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
	let groupAuthorizationRulesQuickSearchQueryCondition: MetadataModel.QueryConditions = $state({})
	let groupAuthorizationRulesSearchMetadataModel: any = $state({})
	let groupAuthorizationRulesSearchResults: any[] = $state([])
	let groupAuthorizationRulesSearchFilterExcludeIndexes: number[] = $state([])
	let getDisplayGroupAuthorizationRulesExec: boolean = false
	async function getDisplayGroupAuthorizationRules() {
		if (getDisplayGroupAuthorizationRulesExec) {
			return
		}

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
			getDisplayGroupAuthorizationRulesExec = true
		} catch (e) {
			throw e
		}
	}
	function updateGroupAuthorizationRulesMetadataModel(value: any) {
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
				Utils.MetadataModel.InsertNewQueryConditionToQueryConditions(groupAuthorizationRulesQueryConditions, [
					groupAuthorizationRulesQuickSearchQueryCondition,
					directoryGroupIDContextQueryCondition
				]),
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
	let showGroupAuthorizationRulesQueryPanel: boolean = $state(false)
	let selectedGroupAuthorizationRules: number[] = $state([])

	let createGroupRuleAuthorizationsStep: number = $state(0)

	let createGroupRuleAuthorizationsDataValid: boolean = $derived(
		selectedGroupAuthorizationRules.length > 0 && (typeof directoryGroupIDContext === 'string' || selectedDirectoryGroups.length > 0)
	)
	async function handleCreateGroupRuleAuthorizations() {
		if (!createGroupRuleAuthorizationsDataValid || !directorygroupid) {
			return
		}

		let directoryGroups: Domain.Entities.DirectoryGroups.Interface[] = []
		if (directoryGroupIDContext) {
			directoryGroups.push({ id: [directoryGroupIDContext] })
		} else {
			for (const dIndex of selectedDirectoryGroups) {
				const d: Domain.Entities.DirectoryGroups.Interface = directoryGroupsSearchResults[dIndex]
				if (Array.isArray(d.id) && d.id.length > 0) {
					directoryGroups.push({
						id: d.id
					})
				}
			}
		}

		if (directoryGroups.length === 0) {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = `Chosen ${Domain.Entities.DirectoryGroups.RepositoryName} not valid`
			return
		}

		let newGroupRuleAuthorizations: Domain.Entities.GroupRuleAuthorizations.Interface[] = []
		for (const dg of directoryGroups) {
			for (const gdIndex of selectedGroupAuthorizationRules) {
				const gar: Domain.Entities.GroupAuthorizationRules.Interface = groupAuthorizationRulesSearchResults[gdIndex]
				if (Array.isArray(gar.group_authorization_rules_id) && gar.group_authorization_rules_id.length > 0) {
					const id = gar.group_authorization_rules_id[0].id
					const group = gar.group_authorization_rules_id[0].rule_group
					if (Array.isArray(id) && id.length > 0 && Array.isArray(group) && group.length > 0) {
						newGroupRuleAuthorizations.push({
							directory_groups_id: dg.id,
							group_authorization_rules_id: [
								{
									group_authorization_rules_id: id,
									group_authorization_rules_group: group
								}
							]
						})
					}
				}
			}
		}

		if (newGroupRuleAuthorizations.length === 0) {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = `New ${Domain.Entities.GroupRuleAuthorizations.RepositoryName} data not valid`
			return
		}

		State.Loading.value = `Creating ${Domain.Entities.GroupRuleAuthorizations.RepositoryName}`
		try {
			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Group.RuleAuthorizations}/${Domain.Entities.Url.Action.CREATE}`)
			fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID, directorygroupid)
			if (authContextDirectoryGroupID) {
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, authContextDirectoryGroupID)
			}
			if (State.VerboseResponse.value) {
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.VERBOSE_RESPONSE, `${true}`)
			}

			telemetry?.Log(
				COMPONENT_NAME,
				true,
				Domain.Entities.Telemetry.LogLevel.DEBUG,
				State.Loading.value,
				'fetchUrl',
				fetchUrl,
				'data',
				newGroupRuleAuthorizations
			)

			const fetchResponse = await authedFetch.Fetch(fetchUrl, {
				method: 'POST',
				body: JSON.stringify(newGroupRuleAuthorizations)
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
				selectedDirectoryGroups = []
				selectedGroupAuthorizationRules = []
				showSelectedActions = false
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Create ${Domain.Entities.GroupRuleAuthorizations.RepositoryName} failed`
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
			handleError(e, ERROR)
		} finally {
			State.Loading.value = undefined
		}
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex flex-1 flex-col gap-y-2 overflow-hidden">
	{#await getDisplayGroupRuleAuthorizations()}
		{@render awaitloading()}
	{:then}
		{#if showCreateNewGroupRuleAuthorizations}
			<header class="z-[3] flex flex-col gap-y-1">
				<section class="flex gap-x-1">
					<button
						class="btn btn-ghost btn-circle btn-md flex self-center"
						aria-label="Close Create Group Rule Authorizations"
						onclick={() => {
							showCreateNewGroupRuleAuthorizations = false
						}}
					>
						<!--mdi:arrow-back source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path fill="var({Utils.Theme.GetColor(themecolor)})" d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z" />
						</svg>
					</button>
					<span class="self-center"> Create New Group Roles </span>
				</section>
			</header>

			<nav class="flex w-full justify-center rounded-lg p-2 {State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'bg-base-100' : 'bg-gray-100'}">
				<div class="steps z-[2]">
					{#if !directoryGroupIDContext}
						<li
							class="step {createGroupRuleAuthorizationsStep >= 0
								? themecolor === Domain.Entities.Theme.Color.PRIMARY
									? 'step-primary'
									: themecolor === Domain.Entities.Theme.Color.SECONDARY
										? 'step-secondary'
										: 'step-accent'
								: ''} overflow-visible"
						>
							<button
								class="link link-hover"
								onclick={() => {
									createGroupRuleAuthorizationsStep = 0
								}}
							>
								Pick Group(s)
							</button>
						</li>
					{/if}
					<li
						class="step {createGroupRuleAuthorizationsStep >= 1
							? themecolor === Domain.Entities.Theme.Color.PRIMARY
								? 'step-primary'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? 'step-secondary'
									: 'step-accent'
							: ''} overflow-visible"
					>
						<button
							class="link link-hover"
							onclick={() => {
								createGroupRuleAuthorizationsStep = 1
							}}
						>
							Pick Authorization Rule(s)
						</button>
					</li>
					<li
						class="step {createGroupRuleAuthorizationsStep >= 2
							? themecolor === Domain.Entities.Theme.Color.PRIMARY
								? 'step-primary'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? 'step-secondary'
									: 'step-accent'
							: ''} overflow-visible"
					>
						<button
							class="link link-hover"
							onclick={() => {
								createGroupRuleAuthorizationsStep = 2
							}}
						>
							Create Group Role(s)
						</button>
					</li>
				</div>
			</nav>

			<main
				class="z-[1] flex flex-[9.5] flex-col gap-y-2 overflow-hidden {State.Theme.value === Domain.Entities.Theme.Theme.DARK
					? 'bg-base-100'
					: 'bg-gray-100'} rounded-lg p-2"
			>
				{#if createGroupRuleAuthorizationsStep === 0}
					{#await getDisplayDirectoryGroups()}
						{@render awaitloading()}
					{:then}
						<header class="z-[2] flex justify-center">
							{#await import('$lib/components/View/DirectoryGroups/SearchBar/Component.svelte') then { default: ViewDirectoryGroupsSearchBar }}
								<div class="max-md:w-full md:w-[60%]">
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

							{#if !showDirectoryGroupsQueryPanel || windowWidth > 1000}
								<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
									<section class="z-[2] flex w-full">
										{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
											<div class="h-fit w-full flex-1 self-center">
												<ViewHeaderData title={'Groups'} view={dataView} {themecolor} {theme} updateview={(value) => (dataView = value)}
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
												addclickcolumn={false}
												addselectcolumn={true}
												view={dataView}
												updatemetadatamodel={updateDirectoryGroupsMetadataModel}
												filterexcludeindexes={directoryGroupsSearchFilterExcludeIndexes}
												selecteddataindexes={selectedDirectoryGroups}
												updateselecteddataindexes={(value) => (selectedDirectoryGroups = value)}
											></ViewDirectoryGroupsData>
										{/await}
									</section>
								</section>
							{/if}
						</main>
					{:catch e}
						{@render awaiterror(e)}
					{/await}
				{:else if createGroupRuleAuthorizationsStep === 1}
					{#await getDisplayGroupAuthorizationRules()}
						{@render awaitloading()}
					{:then}
						<header class="z-[2] flex justify-center">
							{#await import('$lib/components/View/GroupAuthorizationRules/SearchBar/Component.svelte') then { default: ViewGroupAuthorizationRulesSearchBar }}
								<div class="max-md:w-full md:w-[60%]">
									<ViewGroupAuthorizationRulesSearchBar
										metadatamodel={groupAuthorizationRulesSearchMetadataModel}
										{themecolor}
										{theme}
										{telemetry}
										querycondition={groupAuthorizationRulesQuickSearchQueryCondition}
										updatequerycondition={(value) => {
											groupAuthorizationRulesQuickSearchQueryCondition = value
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
											updatemetadatamodel={updateGroupAuthorizationRulesMetadataModel}
											updatequeryconditions={(value) => {
												groupAuthorizationRulesQueryConditions = value
											}}
											hidequerypanel={() => (showGroupAuthorizationRulesQueryPanel = false)}
										></QueryPanel>
									{/await}
								</section>
							{/if}

							{#if !showGroupAuthorizationRulesQueryPanel || windowWidth > 1000}
								<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
									<section class="z-[2] flex w-full">
										{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
											<div class="h-fit w-full flex-1 self-center">
												<ViewHeaderData title={'Authorization Rules'} view={dataView} {themecolor} {theme} updateview={(value) => (dataView = value)}
												></ViewHeaderData>
											</div>
										{/await}
									</section>

									<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
										{#await import('$lib/components/View/GroupAuthorizationRules/Data/Component.svelte') then { default: ViewGroupAuthorizationRulesData }}
											<ViewGroupAuthorizationRulesData
												metadatamodel={groupAuthorizationRulesSearchMetadataModel}
												data={groupAuthorizationRulesSearchResults}
												{themecolor}
												{theme}
												{telemetry}
												addclickcolumn={false}
												addselectcolumn={true}
												view={dataView}
												updatemetadatamodel={updateGroupAuthorizationRulesMetadataModel}
												filterexcludeindexes={groupAuthorizationRulesSearchFilterExcludeIndexes}
												selecteddataindexes={selectedGroupAuthorizationRules}
												updateselecteddataindexes={(value) => (selectedGroupAuthorizationRules = value)}
											></ViewGroupAuthorizationRulesData>
										{/await}
									</section>
								</section>
							{/if}
						</main>
					{:catch e}
						{@render awaiterror(e)}
					{/await}
				{:else if createGroupRuleAuthorizationsStep === 2}
					<div class="flex flex-1 justify-center">
						<div class="flex h-fit w-fit flex-col gap-y-16 self-center justify-self-center md:max-w-[60%]">
							<div class="flex flex-col gap-y-2 text-center italic">
								<span> In order to assign roles to users in a group, authorization rule(s) need to be assigned to the target group(s). </span>
								<span>
									By assigning authorization rule(s) to a group, result being called <span class="font-bold">group role(s)</span>, any person can be
									assigned a group role provided the assignee has a role prefixed with <span class="font-bold">assign_</span>.
								</span>
							</div>
							<button
								class="btn btn-lg {themecolor === Domain.Entities.Theme.Color.PRIMARY
									? 'btn-primary'
									: themecolor === Domain.Entities.Theme.Color.SECONDARY
										? 'btn-secondary'
										: 'btn-accent'} md:max-w-[40%] self-center"
								aria-label="Create Group Rule Authorizations"
								onclick={handleCreateGroupRuleAuthorizations}
								disabled={!createGroupRuleAuthorizationsDataValid}
							>
								Create Group Role(s)
							</button>
						</div>
					</div>
				{/if}
			</main>
		{:else}
			<header class="z-[2] flex justify-between gap-x-2">
				{#await import('$lib/components/View/GroupRuleAuthorizations/SearchBar/Component.svelte') then { default: ViewGroupRuleAuthorizationsSearchBar }}
					<div class="max-md:w-full md:w-[60%]">
						<ViewGroupRuleAuthorizationsSearchBar
							metadatamodel={groupRuleAuthorizationsSearchMetadataModel}
							{themecolor}
							{theme}
							{telemetry}
							querycondition={groupRuleAuthorizationsQuickSearchQueryCondition}
							updatequerycondition={(value) => {
								groupRuleAuthorizationsQuickSearchQueryCondition = value
							}}
							showquerypanel={() => {
								showGroupRuleAuthorizationsQueryPanel = !showGroupRuleAuthorizationsQueryPanel
							}}
							search={() => {
								searchGroupRuleAuthorizations()
							}}
						></ViewGroupRuleAuthorizationsSearchBar>
					</div>
				{/await}

				<button
					class="btn btn-md btn-circle tooltip tooltip-left self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary tooltip-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary tooltip-secondary'
							: 'btn-accent tooltip-accent'}"
					aria-label="Create New Group Role(s)"
					data-tip="Create new group role(s)"
					onclick={() => {
						showCreateNewGroupRuleAuthorizations = true
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
				{#if showGroupRuleAuthorizationsQueryPanel}
					<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
						{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
							<QueryPanel
								{themecolor}
								{theme}
								{telemetry}
								metadatamodel={groupRuleAuthorizationsSearchMetadataModel}
								data={groupRuleAuthorizationsSearchResults}
								queryconditions={groupRuleAuthorizationsQueryConditions}
								filterexcludeindexes={groupRuleAuthorizationsSearchFilterExcludeIndexes}
								updatefilterexcludeindexes={(value) => {
									groupRuleAuthorizationsSearchFilterExcludeIndexes = value
									State.Toast.Type = Domain.Entities.Toast.Type.INFO
									State.Toast.Message = `${groupRuleAuthorizationsSearchFilterExcludeIndexes.length} local results filtered out`
								}}
								updatemetadatamodel={updateGroupRuleAuthorizationsMetadataModel}
								updatequeryconditions={(value) => {
									groupRuleAuthorizationsQueryConditions = value
								}}
								hidequerypanel={() => (showGroupRuleAuthorizationsQueryPanel = false)}
							></QueryPanel>
						{/await}
					</section>
				{/if}

				{#if !showGroupRuleAuthorizationsQueryPanel || windowWidth > 1000}
					{#if groupRuleAuthorizationsSearchResults.length > 0}
						<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
							<section class="z-[2] flex w-full">
								{#if selectedGroupRuleAuthorizations.length > 0}
									<div class="flex flex-col p-2">
										<button
											class="btn btn-md {themecolor === Domain.Entities.Theme.Color.PRIMARY
												? 'btn-primary'
												: themecolor === Domain.Entities.Theme.Color.SECONDARY
													? 'btn-secondary'
													: 'btn-accent'} justify-start gap-x-1"
											aria-label="Selected Rows Actions"
											onclick={() => (showSelectedActions = !showSelectedActions)}
										>
											<!--mdi:menu source: https://icon-sets.iconify.design-->
											<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
												<path fill="var({Utils.Theme.GetColorContent(themecolor)})" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
											</svg>
											<span class="self-center">{selectedGroupRuleAuthorizations.length} selected</span>
										</button>

										{#if showSelectedActions}
											<div class="relative w-full">
												<div
													class="absolute w-full {theme === Domain.Entities.Theme.Theme.DARK
														? 'bg-base-200'
														: 'bg-white'} flex min-w-[250px] flex-col gap-2 rounded-lg p-2 shadow-md shadow-gray-800"
												>
													<button
														class="btn btn-ghost btm-sm tooltip tooltip-right {themecolor === Domain.Entities.Theme.Color.PRIMARY
															? 'tooltip-primary'
															: themecolor === Domain.Entities.Theme.Color.SECONDARY
																? 'tooltip-secondary'
																: 'tooltip-accent'} justify-start"
														onclick={deleteDeactivatesSelectedGroupRuleAuthorizations}
														data-tip="Deactivating group role(s) prevents them from being assigned to new users unless a similar authorization rule is assigned to the group later on."
													>
														1 - Delete/Deactivate
													</button>
												</div>
											</div>
										{/if}
									</div>
								{/if}

								{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
									<div class="h-fit w-full flex-1 self-center">
										<ViewHeaderData title={'Group Roles'} view={dataView} {themecolor} {theme} updateview={(value) => (dataView = value)}
										></ViewHeaderData>
									</div>
								{/await}
							</section>

							<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
								{#await import('$lib/components/View/GroupRuleAuthorizations/Data/Component.svelte') then { default: ViewGroupRuleAuthorizationsData }}
									<ViewGroupRuleAuthorizationsData
										metadatamodel={groupRuleAuthorizationsSearchMetadataModel}
										data={groupRuleAuthorizationsSearchResults}
										{themecolor}
										{theme}
										{telemetry}
										addclickcolumn={false}
										addselectcolumn={true}
										view={dataView}
										updatemetadatamodel={updateGroupRuleAuthorizationsMetadataModel}
										filterexcludeindexes={groupRuleAuthorizationsSearchFilterExcludeIndexes}
										selecteddataindexes={selectedGroupRuleAuthorizations}
										updateselecteddataindexes={(value) => (selectedGroupRuleAuthorizations = value)}
									></ViewGroupRuleAuthorizationsData>
								{/await}
							</section>
						</section>
					{:else}
						<div class="flex flex-1 justify-center rounded-md p-2 {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-700' : 'bg-gray-200'}">
							<span class="flex self-center text-lg">
								Create and manage group roles that can be assigned to users with credentials within a group.
							</span>
						</div>
					{/if}
				{/if}
			</main>
		{/if}
	{:catch e}
		{@render awaiterror(e)}
	{/await}
</div>

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

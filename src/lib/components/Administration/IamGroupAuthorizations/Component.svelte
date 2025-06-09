<script lang="ts">
	import { Component, Domain, Interfaces, MetadataModel, State, Utils } from '$lib'

	const COMPONENT_NAME = 'administration-iam-group-authorizations'

	interface Props {
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		telemetry?: Domain.Interfaces.ITelemetry
		directoryIDContext?: string
		directoryGroupIDContext?: string
		iamCredentialIDContext?: string
		directorygroupid?: string
	}

	let {
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		telemetry = undefined,
		directoryIDContext = undefined,
		directoryGroupIDContext = undefined,
		iamCredentialIDContext = undefined,
		directorygroupid = undefined
	}: Props = $props()

	let authContextDirectoryGroupID = $derived(directorygroupid)

	let iamGroupAuthorizationsSearch: Domain.Interfaces.MetadataModels.Search | undefined = $derived.by(() => {
		if (
			!State.Session.session?.iam_credential ||
			!Array.isArray(State.Session.session.iam_credential.id) ||
			State.Session.session.iam_credential.id.length === 0
		) {
			return undefined
		}

		return new Interfaces.MetadataModels.SearchData(
			`${Domain.Entities.Url.ApiUrlPaths.Iam.GroupAuthorizations}${Domain.Entities.Url.MetadataModelSearchGetMMPath}`,
			`${Domain.Entities.Url.ApiUrlPaths.Iam.GroupAuthorizations}${Domain.Entities.Url.MetadataModelSearchPath}`,
			new Interfaces.AuthenticatedFetch.Client(true)
		)
	})
	let iamGroupAuthorizationsQueryConditions: MetadataModel.QueryConditions[] = $state([])
	let directoryIDContextQueryCondition: MetadataModel.QueryConditions = $state({})
	let directoryGroupIDContextQueryCondition: MetadataModel.QueryConditions = $state({})
	let iamGroupAuthorizationsQuickSearchQueryCondition: MetadataModel.QueryConditions = $state({})
	let iamGroupAuthorizationsSearchMetadataModel: any = $state({})
	let iamGroupAuthorizationsSearchResults: any[] = $state([])
	let iamGroupAuthorizationsSearchFilterExcludeIndexes: number[] = $state([])
	let getDisplayIamGroupAuthorizationsExec: boolean = false
	async function getDisplayIamGroupAuthorizations() {
		if (!iamGroupAuthorizationsSearch) {
			throw [401, 'Unauthorized']
		}

		if (Object.keys(iamGroupAuthorizationsSearch.searchmetadatamodel).length === 0) {
			try {
				await iamGroupAuthorizationsSearch.FetchMetadataModel(authContextDirectoryGroupID, 2, undefined)
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

		iamGroupAuthorizationsSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_LIMIT] = 50

		iamGroupAuthorizationsSearch.searchmetadatamodel = MetadataModel.MapFieldGroups(
			iamGroupAuthorizationsSearch.searchmetadatamodel,
			(property: any) => {
				if (
					property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] === 0 &&
					property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === Domain.Entities.IamGroupAuthorizations.RepositoryName &&
					property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Domain.Entities.IamGroupAuthorizations.FieldColumn.CreatedOn
				) {
					property[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] = false
				}

				return property
			}
		)

		iamGroupAuthorizationsSearchMetadataModel = iamGroupAuthorizationsSearch.searchmetadatamodel

		if (directoryIDContext) {
			const directoryIDQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
				iamGroupAuthorizationsSearchMetadataModel,
				Domain.Entities.Directory.FieldColumn.ID,
				Domain.Entities.Directory.RepositoryName,
				2
			)

			if (directoryIDQCKey) {
				directoryIDContextQueryCondition = {
					[directoryIDQCKey.qcKey]: {
						[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]:
							directoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
						[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: directoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
						[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
							[
								{
									[MetadataModel.FConditionProperties.NEGATE]: false,
									[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
									[MetadataModel.FConditionProperties.VALUE]: {
										[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.TEXT,
										[MetadataModel.FSelectProperties.VALUE]: directoryIDContext
									}
								}
							]
						]
					}
				}
			} else {
				throw [400, 'Failed to set Directory ID Context']
			}
		}

		if (directoryGroupIDContext) {
			const directoryGroupIDQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
				iamGroupAuthorizationsSearchMetadataModel,
				Domain.Entities.GroupRuleAuthorizations.FieldColumn.DirectoryGroupsID,
				Domain.Entities.GroupRuleAuthorizations.RepositoryName,
				1
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
			await searchIamGroupAuthorizations()
			getDisplayIamGroupAuthorizationsExec = true
		} catch (e) {
			throw e
		}
	}
	function updateIamGroupAuthorizationsMetadataModel(value: any) {
		iamGroupAuthorizationsSearchMetadataModel = value
		if (iamGroupAuthorizationsSearch) {
			iamGroupAuthorizationsSearch.searchmetadatamodel = iamGroupAuthorizationsSearchMetadataModel
		}
	}
	async function searchIamGroupAuthorizations() {
		if (!iamGroupAuthorizationsSearch) {
			return
		}

		State.Loading.value = `Searching ${Domain.Entities.IamGroupAuthorizations.RepositoryName}...`
		try {
			await iamGroupAuthorizationsSearch.Search(
				Utils.MetadataModel.InsertNewQueryConditionToQueryConditions(iamGroupAuthorizationsQueryConditions, [
					iamGroupAuthorizationsQuickSearchQueryCondition,
					directoryGroupIDContextQueryCondition,
					directoryIDContextQueryCondition
				]),
				authContextDirectoryGroupID || undefined,
				authContextDirectoryGroupID || undefined,
				2,
				false,
				false,
				undefined
			)

			iamGroupAuthorizationsSearchFilterExcludeIndexes = []
			iamGroupAuthorizationsSearchResults = iamGroupAuthorizationsSearch.searchresults.data || []

			State.Toast.Type = Domain.Entities.Toast.Type.INFO
			State.Toast.Message = `${iamGroupAuthorizationsSearchResults.length} results returned`
		} catch (e) {
			const ERROR = `Search ${Domain.Entities.IamGroupAuthorizations.RepositoryName} failed`
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
	let showIamGroupAuthorizationsQueryPanel: boolean = $state(false)
	let selectedIamGroupAuthorizations: number[] = $state([])
	let showSelectedActions: boolean = $state(false)

	let dataView: Component.View.View = $state('list')

	let windowWidth: number = $state(0)

	let showCreateNewIamGroupAuthorizations: boolean = $state(false)

	let authedFetch = new Interfaces.AuthenticatedFetch.Client()

	async function deleteDeactivatesSelectedIamGroupAuthorizations() {
		const data = selectedIamGroupAuthorizations.map((dIndex) => iamGroupAuthorizationsSearchResults[dIndex])

		if (data.length === 0 || !directorygroupid) {
			return
		}

		State.Loading.value = `Deleting/Deactivating ${Domain.Entities.IamGroupAuthorizations.RepositoryName}`
		try {
			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Iam.GroupAuthorizations}/${Domain.Entities.Url.Action.DELETE}`)
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
				selectedIamGroupAuthorizations = []
				showSelectedActions = false
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Delete/Deactivate ${Domain.Entities.IamGroupAuthorizations.RepositoryName} failed`
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

	let iamCredentialsSearch: Domain.Interfaces.MetadataModels.Search | undefined = $derived.by(() => {
		if (
			!State.Session.session?.iam_credential ||
			!Array.isArray(State.Session.session.iam_credential.id) ||
			State.Session.session.iam_credential.id.length === 0 ||
			directoryGroupIDContext
		) {
			return undefined
		}

		return new Interfaces.MetadataModels.SearchData(
			`${Domain.Entities.Url.ApiUrlPaths.Iam.Credentials}${Domain.Entities.Url.MetadataModelSearchGetMMPath}`,
			`${Domain.Entities.Url.ApiUrlPaths.Iam.Credentials}${Domain.Entities.Url.MetadataModelSearchPath}`,
			new Interfaces.AuthenticatedFetch.Client(true)
		)
	})
	let iamCredentialsQueryConditions: MetadataModel.QueryConditions[] = $state([])
	let iamCredentialsQuickSearchQueryCondition: MetadataModel.QueryConditions = $state({})
	let iamCredentialsSearchMetadataModel: any = $state({})
	let iamCredentialsSearchResults: any[] = $state([])
	let iamCredentialsSearchFilterExcludeIndexes: number[] = $state([])
	let getDisplayIamCredentialsExec: boolean = false
	async function getDisplayIamCredentials() {
		if (getDisplayIamCredentialsExec) {
			return
		}

		if (!iamCredentialsSearch) {
			throw [401, 'Unauthorized']
		}

		if (Object.keys(iamCredentialsSearch.searchmetadatamodel).length === 0) {
			try {
				await iamCredentialsSearch.FetchMetadataModel(authContextDirectoryGroupID, 2, undefined)
			} catch (e) {
				const DEFAULT_ERROR = `Get ${Domain.Entities.IamCredentials.RepositoryName} metadata-model failed`

				telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, DEFAULT_ERROR, 'error', e)

				if (Array.isArray(e) && e.length === 2) {
					throw e
				} else {
					throw [500, DEFAULT_ERROR]
				}
			}
		}

		iamCredentialsSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_LIMIT] = 20

		iamCredentialsSearch.searchmetadatamodel = MetadataModel.MapFieldGroups(iamCredentialsSearch.searchmetadatamodel, (property: any) => {
			if (
				property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] === 0 &&
				property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === Domain.Entities.IamCredentials.RepositoryName &&
				property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Domain.Entities.IamCredentials.FieldColumn.LastUpdatedOn
			) {
				property[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] = false
			}

			return property
		})

		iamCredentialsSearchMetadataModel = iamCredentialsSearch.searchmetadatamodel

		try {
			await searchIamCredentials()
			getDisplayIamCredentialsExec = true
		} catch (e) {
			throw e
		}
	}
	function updateIamCredentialsMetadataModel(value: any) {
		iamCredentialsSearchMetadataModel = value
		if (iamCredentialsSearch) {
			iamCredentialsSearch.searchmetadatamodel = iamCredentialsSearchMetadataModel
		}
	}
	async function searchIamCredentials() {
		if (!iamCredentialsSearch) {
			return
		}

		State.Loading.value = `Searching ${Domain.Entities.IamCredentials.RepositoryName}...`
		try {
			await iamCredentialsSearch.Search(
				Utils.MetadataModel.InsertNewQueryConditionToQueryConditions(iamCredentialsQueryConditions, [iamCredentialsQuickSearchQueryCondition]),
				authContextDirectoryGroupID || undefined,
				authContextDirectoryGroupID || undefined,
				2,
				false,
				false,
				undefined
			)

			iamCredentialsSearchFilterExcludeIndexes = []
			iamCredentialsSearchResults = iamCredentialsSearch.searchresults.data || []

			State.Toast.Type = Domain.Entities.Toast.Type.INFO
			State.Toast.Message = `${iamCredentialsSearchResults.length} results returned`
		} catch (e) {
			const ERROR = `Search ${Domain.Entities.IamCredentials.RepositoryName} failed`
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
	let showIamCredentialsQueryPanel: boolean = $state(false)
	let selectedIamCredentials: number[] = $state([])

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
	let groupRuleAuthorizationsQuickSearchQueryCondition: MetadataModel.QueryConditions = $state({})
	let groupRuleAuthorizationsSearchMetadataModel: any = $state({})
	let groupRuleAuthorizationsSearchResults: any[] = $state([])
	let groupRuleAuthorizationsSearchFilterExcludeIndexes: number[] = $state([])
	let getDisplayGroupRuleAuthorizationsExec: boolean = false
	async function getDisplayGroupRuleAuthorizations() {
		if (getDisplayGroupRuleAuthorizationsExec) {
			return
		}

		if (!groupRuleAuthorizationsSearch) {
			throw [401, 'Unauthorized']
		}

		if (Object.keys(groupRuleAuthorizationsSearch.searchmetadatamodel).length === 0) {
			try {
				await groupRuleAuthorizationsSearch.FetchMetadataModel(authContextDirectoryGroupID, 2, undefined)
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
				2,
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

	let createIamGroupAuthorizationsStep: number = $state(0)

	let createIamGroupAuthorizationsDataValid: boolean = $derived(
		selectedGroupRuleAuthorizations.length > 0 && (typeof directoryGroupIDContext === 'string' || selectedIamCredentials.length > 0)
	)
	async function handleCreateIamGroupAuthorizations() {
		if (!createIamGroupAuthorizationsDataValid || !directorygroupid) {
			return
		}

		let iamCredentials: Domain.Entities.IamCredentials.Interface[] = []
		if (iamCredentialIDContext) {
			iamCredentials.push({ id: [iamCredentialIDContext] })
		} else {
			for (const dIndex of selectedIamCredentials) {
				const d: Domain.Entities.IamCredentials.Interface = iamCredentialsSearchResults[dIndex]
				if (Array.isArray(d.id) && d.id.length > 0) {
					iamCredentials.push({
						id: d.id
					})
				}
			}
		}

		if (iamCredentials.length === 0) {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = `Chosen ${Domain.Entities.IamCredentials.RepositoryName} not valid`
			return
		}

		let newIamGroupAuthorizations: Domain.Entities.IamGroupAuthorizations.Interface[] = []
		for (const ic of iamCredentials) {
			for (const gdIndex of selectedGroupRuleAuthorizations) {
				const gar: Domain.Entities.GroupRuleAuthorizations.Interface = groupRuleAuthorizationsSearchResults[gdIndex]
				if (Array.isArray(gar.id) && gar.id.length > 0) {
					newIamGroupAuthorizations.push({
						iam_credentials_id: ic.id,
						group_rule_authorizations_id: gar.id
					})
				}
			}
		}

		if (newIamGroupAuthorizations.length === 0) {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = `New ${Domain.Entities.IamGroupAuthorizations.RepositoryName} data not valid`
			return
		}

		State.Loading.value = `Creating ${Domain.Entities.IamGroupAuthorizations.RepositoryName}`
		try {
			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Iam.GroupAuthorizations}/${Domain.Entities.Url.Action.CREATE}`)
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
				newIamGroupAuthorizations
			)

			const fetchResponse = await authedFetch.Fetch(fetchUrl, {
				method: 'POST',
				body: JSON.stringify(newIamGroupAuthorizations)
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
				selectedIamCredentials = []
				selectedGroupRuleAuthorizations = []
				showSelectedActions = false
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Create ${Domain.Entities.IamGroupAuthorizations.RepositoryName} failed`
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
			handleError(e, ERROR)
		} finally {
			State.Loading.value = undefined
		}
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex flex-1 flex-col gap-y-2 overflow-hidden">
	{#await getDisplayIamGroupAuthorizations()}
		{@render awaitloading()}
	{:then}
		{#if showCreateNewIamGroupAuthorizations}
			<header class="z-[3] flex flex-col gap-y-1">
				<section class="flex gap-x-1">
					<button
						class="btn btn-ghost btn-circle btn-md flex self-center"
						aria-label="Close Create Iam Group Authorizations"
						onclick={() => {
							showCreateNewIamGroupAuthorizations = false
						}}
					>
						<!--mdi:arrow-back source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path fill="var({Utils.Theme.GetColor(themecolor)})" d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z" />
						</svg>
					</button>
					<span class="self-center"> Create User Roles </span>
				</section>
			</header>

			<nav class="flex w-full justify-center rounded-lg p-2 {State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'bg-base-100' : 'bg-gray-100'}">
				<div class="steps z-[2]">
					{#if !directoryGroupIDContext}
						<li
							class="step {createIamGroupAuthorizationsStep >= 0
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
									createIamGroupAuthorizationsStep = 0
								}}
							>
								Pick User Credential(s)
							</button>
						</li>
					{/if}
					<li
						class="step {createIamGroupAuthorizationsStep >= 1
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
								createIamGroupAuthorizationsStep = 1
							}}
						>
							Pick Group Role(s)
						</button>
					</li>
					<li
						class="step {createIamGroupAuthorizationsStep >= 2
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
								createIamGroupAuthorizationsStep = 2
							}}
						>
							Create User Role(s)
						</button>
					</li>
				</div>
			</nav>

			<main
				class="z-[1] flex flex-[9.5] flex-col gap-y-2 overflow-hidden {State.Theme.value === Domain.Entities.Theme.Theme.DARK
					? 'bg-base-100'
					: 'bg-gray-100'} rounded-lg p-2"
			>
				{#if createIamGroupAuthorizationsStep === 0}
					{#await getDisplayIamCredentials()}
						{@render awaitloading()}
					{:then}
						<header class="z-[2] flex justify-center">
							{#await import('$lib/components/View/IamCredentials/SearchBar/Component.svelte') then { default: ViewIamCredentialsSearchBar }}
								<div class="max-md:w-full md:w-[60%]">
									<ViewIamCredentialsSearchBar
										metadatamodel={iamCredentialsSearchMetadataModel}
										{themecolor}
										{theme}
										{telemetry}
										querycondition={iamCredentialsQuickSearchQueryCondition}
										updatequerycondition={(value) => {
											iamCredentialsQuickSearchQueryCondition = value
										}}
										showquerypanel={() => {
											showIamCredentialsQueryPanel = !showIamCredentialsQueryPanel
										}}
										search={() => {
											searchIamCredentials()
										}}
									></ViewIamCredentialsSearchBar>
								</div>
							{/await}
						</header>

						<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
							{#if showIamCredentialsQueryPanel}
								<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
									{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
										<QueryPanel
											{themecolor}
											{theme}
											{telemetry}
											metadatamodel={iamCredentialsSearchMetadataModel}
											data={iamCredentialsSearchResults}
											queryconditions={iamCredentialsQueryConditions}
											filterexcludeindexes={iamCredentialsSearchFilterExcludeIndexes}
											updatefilterexcludeindexes={(value) => {
												iamCredentialsSearchFilterExcludeIndexes = value
												State.Toast.Type = Domain.Entities.Toast.Type.INFO
												State.Toast.Message = `${iamCredentialsSearchFilterExcludeIndexes.length} local results filtered out`
											}}
											updatemetadatamodel={updateIamCredentialsMetadataModel}
											updatequeryconditions={(value) => {
												iamCredentialsQueryConditions = value
											}}
											hidequerypanel={() => (showIamCredentialsQueryPanel = false)}
										></QueryPanel>
									{/await}
								</section>
							{/if}

							{#if !showIamCredentialsQueryPanel || windowWidth > 1000}
								<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
									<section class="z-[2] flex w-full">
										{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
											<div class="h-fit w-full flex-1 self-center">
												<ViewHeaderData title={'User Credentials'} view={dataView} {themecolor} {theme} updateview={(value) => (dataView = value)}
												></ViewHeaderData>
											</div>
										{/await}
									</section>

									<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
										{#await import('$lib/components/View/IamCredentials/Data/Component.svelte') then { default: ViewIamCredentialsData }}
											<ViewIamCredentialsData
												metadatamodel={iamCredentialsSearchMetadataModel}
												data={iamCredentialsSearchResults}
												{themecolor}
												{theme}
												{telemetry}
												addclickcolumn={false}
												addselectcolumn={true}
												view={dataView}
												updatemetadatamodel={updateIamCredentialsMetadataModel}
												filterexcludeindexes={iamCredentialsSearchFilterExcludeIndexes}
												selecteddataindexes={selectedIamCredentials}
												updateselecteddataindexes={(value) => (selectedIamCredentials = value)}
											></ViewIamCredentialsData>
										{/await}
									</section>
								</section>
							{/if}
						</main>
					{:catch e}
						{@render awaiterror(e)}
					{/await}
				{:else if createIamGroupAuthorizationsStep === 1}
					{#await getDisplayGroupRuleAuthorizations()}
						{@render awaitloading()}
					{:then}
						<header class="z-[2] flex justify-center">
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
						</header>

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
								<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
									<section class="z-[2] flex w-full">
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
							{/if}
						</main>
					{:catch e}
						{@render awaiterror(e)}
					{/await}
				{:else if createIamGroupAuthorizationsStep === 2}
					<div class="flex flex-1 justify-center">
						<div class="flex h-fit w-fit flex-col gap-y-16 self-center justify-self-center md:max-w-[60%]">
							<div class="flex flex-col gap-y-2 text-center italic">
								<span> Group Roles will only be assigned if they have not been deactivated. </span>
								<span>
									As the assignor, for the chosen group roles, ensure you are assigned the said group role whose rule action id is prefixed with <strong
										>assign_</strong
									>
									or is <strong>assign_all</strong> for the group role's section id.
								</span>
								<span>
									<strong>NB.</strong>For Administrators, the role actions: <strong>assign_all</strong>, <strong>create</strong>, and
									<strong>delete</strong>, in role sections: <strong>{Domain.Entities.IamGroupAuthorizations.RepositoryName}</strong> and
									<strong>{Domain.Entities.GroupRuleAuthorizations.RepositoryName}</strong> are considered as super user roles in that they grant a user
									abilities such as assigning themselves and groups any authorization rules regardless.
								</span>
							</div>
							<button
								class="btn btn-lg {themecolor === Domain.Entities.Theme.Color.PRIMARY
									? 'btn-primary'
									: themecolor === Domain.Entities.Theme.Color.SECONDARY
										? 'btn-secondary'
										: 'btn-accent'} md:max-w-[40%] self-center"
								aria-label="Create Group Rule Authorizations"
								onclick={handleCreateIamGroupAuthorizations}
								disabled={!createIamGroupAuthorizationsDataValid}
							>
								Create User Role(s)
							</button>
						</div>
					</div>
				{/if}
			</main>
		{:else}
			<header class="z-[2] flex justify-between gap-x-2">
				{#await import('$lib/components/View/IamGroupAuthorizations/SearchBar/Component.svelte') then { default: ViewIamGroupAuthorizationsSearchBar }}
					<div class="max-md:w-full md:w-[60%]">
						<ViewIamGroupAuthorizationsSearchBar
							metadatamodel={iamGroupAuthorizationsSearchMetadataModel}
							{themecolor}
							{theme}
							{telemetry}
							querycondition={iamGroupAuthorizationsQuickSearchQueryCondition}
							updatequerycondition={(value) => {
								iamGroupAuthorizationsQuickSearchQueryCondition = value
							}}
							showquerypanel={() => {
								showIamGroupAuthorizationsQueryPanel = !showIamGroupAuthorizationsQueryPanel
							}}
							search={() => {
								searchIamGroupAuthorizations()
							}}
						></ViewIamGroupAuthorizationsSearchBar>
					</div>
				{/await}

				<button
					class="btn btn-md btn-circle tooltip tooltip-left self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary tooltip-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary tooltip-secondary'
							: 'btn-accent tooltip-accent'}"
					aria-label="Create New User Role(s)"
					data-tip="Create new User role(s)"
					onclick={() => {
						showCreateNewIamGroupAuthorizations = true
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
				{#if showIamGroupAuthorizationsQueryPanel}
					<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
						{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
							<QueryPanel
								{themecolor}
								{theme}
								{telemetry}
								metadatamodel={iamGroupAuthorizationsSearchMetadataModel}
								data={iamGroupAuthorizationsSearchResults}
								queryconditions={iamGroupAuthorizationsQueryConditions}
								filterexcludeindexes={iamGroupAuthorizationsSearchFilterExcludeIndexes}
								updatefilterexcludeindexes={(value) => {
									iamGroupAuthorizationsSearchFilterExcludeIndexes = value
									State.Toast.Type = Domain.Entities.Toast.Type.INFO
									State.Toast.Message = `${iamGroupAuthorizationsSearchFilterExcludeIndexes.length} local results filtered out`
								}}
								updatemetadatamodel={updateIamGroupAuthorizationsMetadataModel}
								updatequeryconditions={(value) => {
									iamGroupAuthorizationsQueryConditions = value
								}}
								hidequerypanel={() => (showIamGroupAuthorizationsQueryPanel = false)}
							></QueryPanel>
						{/await}
					</section>
				{/if}

				{#if !showIamGroupAuthorizationsQueryPanel || windowWidth > 1000}
					{#if iamGroupAuthorizationsSearchResults.length > 0}
						<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
							<section class="z-[2] flex w-full">
								{#if selectedIamGroupAuthorizations.length > 0}
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
											<span class="self-center">{selectedIamGroupAuthorizations.length} selected</span>
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
														onclick={deleteDeactivatesSelectedIamGroupAuthorizations}
														data-tip="Deactivating users role(s) prevents them from further performing the role within the group unless a similar group role is assigned to the user later on."
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
										<ViewHeaderData title={'User Roles'} view={dataView} {themecolor} {theme} updateview={(value) => (dataView = value)}
										></ViewHeaderData>
									</div>
								{/await}
							</section>

							<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
								{#await import('$lib/components/View/IamGroupAuthorizations/Data/Component.svelte') then { default: ViewIamGroupAuthorizationsData }}
									<ViewIamGroupAuthorizationsData
										metadatamodel={iamGroupAuthorizationsSearchMetadataModel}
										data={iamGroupAuthorizationsSearchResults}
										{themecolor}
										{theme}
										{telemetry}
										addclickcolumn={false}
										addselectcolumn={true}
										view={dataView}
										updatemetadatamodel={updateIamGroupAuthorizationsMetadataModel}
										filterexcludeindexes={iamGroupAuthorizationsSearchFilterExcludeIndexes}
										selecteddataindexes={selectedIamGroupAuthorizations}
										updateselecteddataindexes={(value) => (selectedIamGroupAuthorizations = value)}
									></ViewIamGroupAuthorizationsData>
								{/await}
							</section>
						</section>
					{:else}
						<div class="flex flex-1 justify-center rounded-md p-2 {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-700' : 'bg-gray-200'}">
							<span class="flex self-center text-lg"> Create and manage user roles. User roles-&gt;GroupRoles-&gt;Authorization Rules. </span>
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

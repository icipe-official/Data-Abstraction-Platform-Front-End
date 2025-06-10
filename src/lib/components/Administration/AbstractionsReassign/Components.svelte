<script lang="ts">
	import { Component, Domain, Interfaces, MetadataModel, State, Utils } from '$lib'
	import { ReassignTab } from './util'

	const COMPONENT_NAME = 'administration-abstractions-reassign'

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

	let updateDirectoryIDStep: number = $state(0)

	let newAbstractorSearch: Domain.Interfaces.MetadataModels.Search | undefined = $derived.by(() => {
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
	let newAbstractorQueryConditions: MetadataModel.QueryConditions[] = $state([])
	let newAbstractorQuickSearchQueryCondition: MetadataModel.QueryConditions = $state({})
	let newAbstractorFilterAbstractorRoleQueryCondition: MetadataModel.QueryConditions = $state({})
	let newAbstractorSearchMetadataModel: any = $state({})
	let newAbstractorSearchResults: any[] = $state([])
	let newAbstractorSearchFilterExcludeIndexes: number[] = $state([])
	let getDisplayAbstractorExec: boolean = false
	let abstractorDirectoryIDQCKey: Utils.MetadataModel.FieldGroupQueryProperties | undefined
	async function getDisplayAbstractor() {
		if (getDisplayAbstractorExec) {
			return
		}

		if (!newAbstractorSearch) {
			throw [401, 'Unauthorized']
		}

		if (Object.keys(newAbstractorSearch.searchmetadatamodel).length === 0) {
			try {
				await newAbstractorSearch.FetchMetadataModel(authContextDirectoryGroupID, 2, undefined)
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

		newAbstractorSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_LIMIT] = 20

		newAbstractorSearch.searchmetadatamodel = MetadataModel.MapFieldGroups(newAbstractorSearch.searchmetadatamodel, (property: any) => {
			if (
				property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] === 0 &&
				property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === Domain.Entities.IamGroupAuthorizations.RepositoryName
			) {
				if (property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Domain.Entities.IamGroupAuthorizations.FieldColumn.IamCredentialsID) {
					property[MetadataModel.FgProperties.DATABASE_DISTINCT] = true
				}
			}

			return property
		})

		newAbstractorSearchMetadataModel = newAbstractorSearch.searchmetadatamodel

		let deactivatedOnQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
			newAbstractorSearch.searchmetadatamodel,
			Domain.Entities.IamGroupAuthorizations.FieldColumn.DeactivatedOn,
			Domain.Entities.IamGroupAuthorizations.RepositoryName,
			0
		)

		if (!deactivatedOnQCKey) {
			throw [500, `Search does not contain user role information`]
		}

		abstractorDirectoryIDQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
			newAbstractorSearch.searchmetadatamodel,
			Domain.Entities.IamCredentials.FieldColumn.DirectoryID,
			Domain.Entities.IamCredentials.RepositoryName,
			1
		)

		if (!abstractorDirectoryIDQCKey) {
			throw [500, `Search does not contain directory information`]
		}

		const groupAuthRuleIDQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
			newAbstractorSearch.searchmetadatamodel,
			Domain.Entities.GroupRuleAuthorizations.FieldColumn.GroupAuthorizationRuleID,
			Domain.Entities.GroupRuleAuthorizations.RepositoryName,
			1
		)

		const groupAuthRuleGroupQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
			newAbstractorSearch.searchmetadatamodel,
			Domain.Entities.GroupRuleAuthorizations.FieldColumn.GroupAuthorizationRuleGroup,
			Domain.Entities.GroupRuleAuthorizations.RepositoryName,
			1
		)

		if (!groupAuthRuleIDQCKey || !groupAuthRuleGroupQCKey) {
			throw [500, `Search does not contain group roles information`]
		}

		newAbstractorFilterAbstractorRoleQueryCondition = {
			[deactivatedOnQCKey.qcKey]: {
				[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]: deactivatedOnQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
				[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: deactivatedOnQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
				[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
					[
						{
							[MetadataModel.FConditionProperties.NEGATE]: false,
							[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.NO_OF_ENTRIES_LESS_THAN,
							[MetadataModel.FConditionProperties.VALUE]: 0
						}
					]
				]
			},
			[abstractorDirectoryIDQCKey.qcKey]: {
				[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]:
					abstractorDirectoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
				[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]:
					abstractorDirectoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
				[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
					[
						{
							[MetadataModel.FConditionProperties.NEGATE]: false,
							[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.NO_OF_ENTRIES_GREATER_THAN,
							[MetadataModel.FConditionProperties.VALUE]: 0
						}
					]
				]
			},
			[groupAuthRuleGroupQCKey.qcKey]: {
				[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]:
					groupAuthRuleGroupQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
				[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: groupAuthRuleGroupQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
				[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
					[
						{
							[MetadataModel.FConditionProperties.NEGATE]: false,
							[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
							[MetadataModel.FConditionProperties.VALUE]: {
								[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.TEXT,
								[MetadataModel.FSelectProperties.VALUE]: Domain.Entities.Iam.AuthRuleGroup.ABSTRACTIONS
							}
						}
					]
				]
			},
			[groupAuthRuleIDQCKey.qcKey]: {
				[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]:
					groupAuthRuleIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
				[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: groupAuthRuleIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
				[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
					[
						{
							[MetadataModel.FConditionProperties.NEGATE]: false,
							[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
							[MetadataModel.FConditionProperties.VALUE]: {
								[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.TEXT,
								[MetadataModel.FSelectProperties.VALUE]: Domain.Entities.Iam.AuthRule.UPDATE
							}
						},
						{
							[MetadataModel.FConditionProperties.NEGATE]: false,
							[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
							[MetadataModel.FConditionProperties.VALUE]: {
								[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.TEXT,
								[MetadataModel.FSelectProperties.VALUE]: Domain.Entities.Iam.AuthRule.UPDATE_OTHERS
							}
						}
					]
				]
			}
		}

		try {
			await searchAbstractor()
			getDisplayAbstractorExec = true
		} catch (e) {
			throw e
		}
	}
	function updateAbstractorMetadataModel(value: any) {
		newAbstractorSearchMetadataModel = value
		if (newAbstractorSearch) {
			newAbstractorSearch.searchmetadatamodel = newAbstractorSearchMetadataModel
		}
	}
	async function searchAbstractor() {
		if (!newAbstractorSearch) {
			return
		}

		State.Loading.value = `Searching ${Domain.Entities.IamGroupAuthorizations.RepositoryName}...`

		try {
			await newAbstractorSearch.Search(
				Utils.MetadataModel.InsertNewQueryConditionToQueryConditions(newAbstractorQueryConditions, [
					newAbstractorQuickSearchQueryCondition,
					newAbstractorFilterAbstractorRoleQueryCondition
				]),
				authContextDirectoryGroupID || undefined,
				authContextDirectoryGroupID || undefined,
				2,
				false,
				false,
				undefined
			)

			newAbstractorSearchFilterExcludeIndexes = []
			newAbstractorSearchResults = newAbstractorSearch.searchresults.data || []

			State.Toast.Type = Domain.Entities.Toast.Type.INFO
			State.Toast.Message = `${newAbstractorSearchResults.length} results returned`
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
	let showAbstractorQueryPanel: boolean = $state(false)
	let selectedAbstractor: number[] = $state([])

	let dataView: Component.View.View = $state('list')

	let windowWidth: number = $state(0)

	let reassignTab: ReassignTab = $state(ReassignTab.ABSTRACTIONS)

	let abstractionCompleted: boolean | undefined = $state(undefined)

	let abstractionReviewPass: boolean | undefined = $state(undefined)

	let storageFilesTextSearchQuery: string = $state('')

	let storageFilesNumberMin: number | undefined = $state(undefined)

	let storageFilesNumberMax: number | undefined = $state(undefined)

	let abstractionsSearch: Domain.Interfaces.MetadataModels.Search | undefined = $derived.by(() => {
		if (
			!State.Session.session?.iam_credential ||
			!Array.isArray(State.Session.session.iam_credential.id) ||
			State.Session.session.iam_credential.id.length === 0
		) {
			return undefined
		}

		return new Interfaces.MetadataModels.SearchData(
			`${Domain.Entities.Url.ApiUrlPaths.Abstractions.Url}${Domain.Entities.Url.MetadataModelSearchGetMMPath}`,
			`${Domain.Entities.Url.ApiUrlPaths.Abstractions.Url}${Domain.Entities.Url.MetadataModelSearchPath}`,
			new Interfaces.AuthenticatedFetch.Client(true)
		)
	})
	let abstractionsQueryConditions: MetadataModel.QueryConditions[] = $state([])
	let abstractionsQuickSearchQueryCondition: MetadataModel.QueryConditions = $state({})
	let abstractionsSearchMetadataModel: any = $state({})
	let abstractionsSearchResults: any[] = $state([])
	let abstractionsSearchFilterExcludeIndexes: number[] = $state([])
	let getDisplayAbstractionsExec: boolean = false
	async function getDisplayAbstractions() {
		if (getDisplayAbstractionsExec) {
			return
		}

		if (!abstractionsSearch) {
			throw [401, 'Unauthorized']
		}

		if (Object.keys(abstractionsSearch.searchmetadatamodel).length === 0) {
			try {
				await abstractionsSearch.FetchMetadataModel(authContextDirectoryGroupID, 2, undefined)
			} catch (e) {
				const DEFAULT_ERROR = `Get ${Domain.Entities.Abstractions.RepositoryName} metadata-model failed`

				telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, DEFAULT_ERROR, 'error', e)

				if (Array.isArray(e) && e.length === 2) {
					throw e
				} else {
					throw [500, DEFAULT_ERROR]
				}
			}
		}

		abstractionsSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_LIMIT] = 50

		abstractionsSearch.searchmetadatamodel = MetadataModel.MapFieldGroups(abstractionsSearch.searchmetadatamodel, (property: any) => {
			if (
				property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] === 0 &&
				property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === Domain.Entities.Abstractions.RepositoryName &&
				property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Domain.Entities.Abstractions.FieldColumn.LastUpdatedOn
			) {
				property[MetadataModel.FgProperties.DATABASE_SORT_BY_ASC] = false
			}

			return property
		})

		abstractionsSearchMetadataModel = abstractionsSearch.searchmetadatamodel

		try {
			await searchAbstractions()
			getDisplayAbstractionsExec = true
		} catch (e) {
			throw e
		}
	}
	function updateAbstractionsMetadataModel(value: any) {
		abstractionsSearchMetadataModel = value
		if (abstractionsSearch) {
			abstractionsSearch.searchmetadatamodel = abstractionsSearchMetadataModel
		}
	}
	async function searchAbstractions() {
		if (!abstractionsSearch) {
			return
		}

		State.Loading.value = `Searching ${Domain.Entities.Abstractions.RepositoryName}...`
		try {
			await abstractionsSearch.Search(
				Utils.MetadataModel.InsertNewQueryConditionToQueryConditions(abstractionsQueryConditions, [abstractionsQuickSearchQueryCondition]),
				authContextDirectoryGroupID || directorygroupid,
				authContextDirectoryGroupID || directorygroupid,
				2,
				false,
				false,
				undefined
			)

			abstractionsSearchFilterExcludeIndexes = []
			abstractionsSearchResults = abstractionsSearch.searchresults.data || []

			State.Toast.Type = Domain.Entities.Toast.Type.INFO
			State.Toast.Message = `${abstractionsSearchResults.length} results returned`
		} catch (e) {
			const ERROR = `Search ${Domain.Entities.Abstractions.RepositoryName} failed`
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
	let showAbstractionsQueryPanel: boolean = $state(false)
	let selectedAbstractions: number[] = $state([])

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
	let selectedDirectoryGroups: number[] = $state([])

	let iamGroupAuthorizationSearch: Domain.Interfaces.MetadataModels.Search | undefined = $derived.by(() => {
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
	let iamGroupAuthorizationQueryConditions: MetadataModel.QueryConditions[] = $state([])
	let iamGroupAuthorizationQuickSearchQueryCondition: MetadataModel.QueryConditions = $state({})
	let iamGroupAuthorizationFilterAbstractorRoleQueryCondition: MetadataModel.QueryConditions = $state({})
	let iamGroupAuthorizationSearchMetadataModel: any = $state({})
	let iamGroupAuthorizationSearchResults: any[] = $state([])
	let iamGroupAuthorizationSearchFilterExcludeIndexes: number[] = $state([])
	let getDisplayIamGroupAuthorizationsExec: boolean = false
	let directoryIDQCKey: Utils.MetadataModel.FieldGroupQueryProperties | undefined
	async function getDisplayIamGroupAuthorizations() {
		if (getDisplayIamGroupAuthorizationsExec) {
			return
		}

		if (!iamGroupAuthorizationSearch) {
			throw [401, 'Unauthorized']
		}

		if (Object.keys(iamGroupAuthorizationSearch.searchmetadatamodel).length === 0) {
			try {
				await iamGroupAuthorizationSearch.FetchMetadataModel(authContextDirectoryGroupID, 2, undefined)
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

		iamGroupAuthorizationSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_LIMIT] = 20

		iamGroupAuthorizationSearch.searchmetadatamodel = MetadataModel.MapFieldGroups(
			iamGroupAuthorizationSearch.searchmetadatamodel,
			(property: any) => {
				if (
					property[MetadataModel.FgProperties.DATABASE_JOIN_DEPTH] === 0 &&
					property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === Domain.Entities.IamGroupAuthorizations.RepositoryName
				) {
					if (
						property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Domain.Entities.IamGroupAuthorizations.FieldColumn.IamCredentialsID
					) {
						property[MetadataModel.FgProperties.DATABASE_DISTINCT] = true
					}
				}

				return property
			}
		)

		iamGroupAuthorizationSearchMetadataModel = iamGroupAuthorizationSearch.searchmetadatamodel

		let deactivatedOnQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
			iamGroupAuthorizationSearch.searchmetadatamodel,
			Domain.Entities.IamGroupAuthorizations.FieldColumn.DeactivatedOn,
			Domain.Entities.IamGroupAuthorizations.RepositoryName,
			0
		)

		if (!deactivatedOnQCKey) {
			throw [500, `Search does not contain user role information`]
		}

		directoryIDQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
			iamGroupAuthorizationSearch.searchmetadatamodel,
			Domain.Entities.IamCredentials.FieldColumn.DirectoryID,
			Domain.Entities.IamCredentials.RepositoryName,
			1
		)

		if (!directoryIDQCKey) {
			throw [500, `Search does not contain directory information`]
		}

		const groupAuthRuleIDQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
			iamGroupAuthorizationSearch.searchmetadatamodel,
			Domain.Entities.GroupRuleAuthorizations.FieldColumn.GroupAuthorizationRuleID,
			Domain.Entities.GroupRuleAuthorizations.RepositoryName,
			1
		)

		const groupAuthRuleGroupQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
			iamGroupAuthorizationSearch.searchmetadatamodel,
			Domain.Entities.GroupRuleAuthorizations.FieldColumn.GroupAuthorizationRuleGroup,
			Domain.Entities.GroupRuleAuthorizations.RepositoryName,
			1
		)

		if (!groupAuthRuleIDQCKey || !groupAuthRuleGroupQCKey) {
			throw [500, `Search does not contain group roles information`]
		}

		iamGroupAuthorizationFilterAbstractorRoleQueryCondition = {
			[deactivatedOnQCKey.qcKey]: {
				[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]: deactivatedOnQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
				[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: deactivatedOnQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
				[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
					[
						{
							[MetadataModel.FConditionProperties.NEGATE]: false,
							[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.NO_OF_ENTRIES_LESS_THAN,
							[MetadataModel.FConditionProperties.VALUE]: 0
						}
					]
				]
			},
			[directoryIDQCKey.qcKey]: {
				[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]: directoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
				[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: directoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
				[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
					[
						{
							[MetadataModel.FConditionProperties.NEGATE]: false,
							[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.NO_OF_ENTRIES_GREATER_THAN,
							[MetadataModel.FConditionProperties.VALUE]: 0
						}
					]
				]
			},
			[groupAuthRuleGroupQCKey.qcKey]: {
				[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]:
					groupAuthRuleGroupQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
				[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: groupAuthRuleGroupQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
				[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
					[
						{
							[MetadataModel.FConditionProperties.NEGATE]: false,
							[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
							[MetadataModel.FConditionProperties.VALUE]: {
								[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.TEXT,
								[MetadataModel.FSelectProperties.VALUE]: Domain.Entities.Iam.AuthRuleGroup.ABSTRACTIONS
							}
						}
					]
				]
			},
			[groupAuthRuleIDQCKey.qcKey]: {
				[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]:
					groupAuthRuleIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
				[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: groupAuthRuleIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
				[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
					[
						{
							[MetadataModel.FConditionProperties.NEGATE]: false,
							[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
							[MetadataModel.FConditionProperties.VALUE]: {
								[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.TEXT,
								[MetadataModel.FSelectProperties.VALUE]: Domain.Entities.Iam.AuthRule.UPDATE
							}
						},
						{
							[MetadataModel.FConditionProperties.NEGATE]: false,
							[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
							[MetadataModel.FConditionProperties.VALUE]: {
								[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FieldType.TEXT,
								[MetadataModel.FSelectProperties.VALUE]: Domain.Entities.Iam.AuthRule.UPDATE_OTHERS
							}
						}
					]
				]
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
		iamGroupAuthorizationSearchMetadataModel = value
		if (iamGroupAuthorizationSearch) {
			iamGroupAuthorizationSearch.searchmetadatamodel = iamGroupAuthorizationSearchMetadataModel
		}
	}
	async function searchIamGroupAuthorizations() {
		if (!iamGroupAuthorizationSearch) {
			return
		}

		State.Loading.value = `Searching ${Domain.Entities.IamGroupAuthorizations.RepositoryName}...`

		try {
			await iamGroupAuthorizationSearch.Search(
				Utils.MetadataModel.InsertNewQueryConditionToQueryConditions(iamGroupAuthorizationQueryConditions, [
					iamGroupAuthorizationQuickSearchQueryCondition,
					iamGroupAuthorizationFilterAbstractorRoleQueryCondition
				]),
				authContextDirectoryGroupID || undefined,
				authContextDirectoryGroupID || undefined,
				2,
				false,
				false,
				undefined
			)

			iamGroupAuthorizationSearchFilterExcludeIndexes = []
			iamGroupAuthorizationSearchResults = iamGroupAuthorizationSearch.searchresults.data || []

			State.Toast.Type = Domain.Entities.Toast.Type.INFO
			State.Toast.Message = `${iamGroupAuthorizationSearchResults.length} results returned`
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

	let updateAbstractionsDirectoryValid: boolean = $derived(
		selectedAbstractor.length > 0 &&
			(selectedIamGroupAuthorizations.length > 0 ||
				selectedDirectoryGroups.length > 0 ||
				selectedAbstractions.length > 0 ||
				storageFilesTextSearchQuery.length > 0 ||
				(typeof storageFilesNumberMin === 'number' && typeof storageFilesNumberMax === 'number'))
	)

	let authedFetch = new Interfaces.AuthenticatedFetch.Client()

	async function handleReassignAbstractions() {
		if (!updateAbstractionsDirectoryValid || !directorygroupid) {
			return
		}

		let updateAbstractionsDirectory: Domain.Entities.Abstractions.UpdateDirectory = {}

		if (selectedIamGroupAuthorizations.length > 0 && directoryIDQCKey) {
			for (const dIndex of selectedIamGroupAuthorizations) {
				const directoryID = MetadataModel.DatabaseGetColumnFieldValue(
					JSON.parse(JSON.stringify(iamGroupAuthorizationSearchMetadataModel)),
					directoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
					directoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
					iamGroupAuthorizationSearchResults[dIndex]
				)
				if (Array.isArray(directoryID) && directoryID.length > 0) {
					if (!Array.isArray(updateAbstractionsDirectory.directory_id)) {
						updateAbstractionsDirectory.directory_id = []
					}
					updateAbstractionsDirectory.directory_id.push(directoryID[0])
				}
			}
		}

		if (selectedDirectoryGroups.length > 0) {
			for (const dIndex of selectedDirectoryGroups) {
				const d: Domain.Entities.DirectoryGroups.Interface = directoryGroupsSearchResults[dIndex]
				if (Array.isArray(d.id) && d.id.length > 0) {
					if (!Array.isArray(updateAbstractionsDirectory.directory_group_id)) {
						updateAbstractionsDirectory.directory_group_id = []
					}
					updateAbstractionsDirectory.directory_group_id.push(d.id[0])
				}
			}
		}

		if (selectedAbstractions.length > 0) {
			for (const dIndex of selectedAbstractions) {
				const d: Domain.Entities.Abstractions.Interface = abstractionsSearchResults[dIndex]
				if (Array.isArray(d.id) && d.id.length > 0) {
					if (!Array.isArray(updateAbstractionsDirectory.abstractions_id)) {
						updateAbstractionsDirectory.abstractions_id = []
					}
					updateAbstractionsDirectory.abstractions_id.push(d.id[0])
				}
			}
		}

		if (storageFilesTextSearchQuery.length > 0) {
			updateAbstractionsDirectory.storage_files_full_text_search = [storageFilesTextSearchQuery]
		}

		if (
			typeof storageFilesNumberMin === 'number' &&
			typeof storageFilesNumberMax === 'number' &&
			storageFilesNumberMax - 1 > storageFilesNumberMin + 1
		) {
			if (!Array.isArray(updateAbstractionsDirectory.storage_files_full_text_search)) {
				updateAbstractionsDirectory.storage_files_full_text_search = []
			}

			for (let i = storageFilesNumberMin + 1; i < storageFilesNumberMax; i++) {
				updateAbstractionsDirectory.storage_files_full_text_search.push(`${i}`)
			}
		}

		if (Object.keys(updateAbstractionsDirectory).length === 0) {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = `Condition to pick abstractions to reassign not set`
			return
		}

		if (abstractorDirectoryIDQCKey && selectedAbstractor.length > 0) {
			const directoryID = MetadataModel.DatabaseGetColumnFieldValue(
				JSON.parse(JSON.stringify(newAbstractorSearchMetadataModel)),
				abstractorDirectoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
				abstractorDirectoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
				newAbstractorSearchResults[selectedAbstractor[0]]
			)
			if (Array.isArray(directoryID) && directoryID.length > 0) {
				updateAbstractionsDirectory.new_directory_id = directoryID[0]
			}
		}

		if (!updateAbstractionsDirectory.new_directory_id) {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = `Chosen new abstractor not valid`
			return
		}

		if (typeof abstractionCompleted === 'boolean') {
			updateAbstractionsDirectory.completed = abstractionCompleted
		}

		if (typeof abstractionReviewPass === 'boolean') {
			updateAbstractionsDirectory.review_pass = abstractionReviewPass
		}

		State.Loading.value = `Reassigning ${Domain.Entities.Abstractions.RepositoryName}`
		try {
			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Abstractions.Url}/${Domain.Entities.Url.Action.UPDATE_DIRECTORY}`)
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
				updateAbstractionsDirectory
			)

			const fetchResponse = await authedFetch.Fetch(fetchUrl, {
				method: 'POST',
				body: JSON.stringify(updateAbstractionsDirectory)
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
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Update ${Domain.Entities.Abstractions.RepositoryName} ${Domain.Entities.Abstractions.FieldColumn.DirectoryID} failed`
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
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex flex-1 flex-col gap-y-2 overflow-hidden">
	<nav class="flex w-full justify-center rounded-lg p-2 {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-base-100' : 'bg-gray-200'}">
		<div class="steps z-[2]">
			<li
				class="step {updateDirectoryIDStep >= 0
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
						updateDirectoryIDStep = 0
					}}
				>
					Pick New Abstractor
				</button>
			</li>

			<li
				class="step {updateDirectoryIDStep >= 1
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
						updateDirectoryIDStep = 1
					}}
				>
					Set Conditions for abstraction(s) to reassign
				</button>
			</li>
			<li
				class="step {updateDirectoryIDStep >= 2
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
						updateDirectoryIDStep = 2
					}}
				>
					Reassign Abstraction(s)
				</button>
			</li>
		</div>
	</nav>

	<main
		class="z-[1] flex flex-[9.5] flex-col gap-y-2 overflow-hidden {State.Theme.value === Domain.Entities.Theme.Theme.DARK
			? 'bg-base-100'
			: 'bg-gray-200'} rounded-lg p-2"
	>
		{#if updateDirectoryIDStep === 0}
			{#await getDisplayAbstractor()}
				{@render awaitloading()}
			{:then}
				<header class="z-[2] flex justify-center">
					{#await import('$lib/components/View/IamGroupAuthorizations/SearchBar/Component.svelte') then { default: ViewIamGroupAuthorizationsSearchBar }}
						<div class="max-md:w-full md:w-[60%]">
							<ViewIamGroupAuthorizationsSearchBar
								metadatamodel={newAbstractorSearchMetadataModel}
								{themecolor}
								theme={State.Theme.value}
								{telemetry}
								querycondition={newAbstractorQuickSearchQueryCondition}
								updatequerycondition={(value) => {
									newAbstractorQuickSearchQueryCondition = value
								}}
								showquerypanel={() => {
									showAbstractorQueryPanel = !showAbstractorQueryPanel
								}}
								search={() => {
									searchAbstractor()
								}}
							></ViewIamGroupAuthorizationsSearchBar>
						</div>
					{/await}
				</header>

				<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
					{#if showAbstractorQueryPanel}
						<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
							{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
								<QueryPanel
									{themecolor}
									theme={State.Theme.value}
									{telemetry}
									metadatamodel={newAbstractorSearchMetadataModel}
									data={newAbstractorSearchResults}
									queryconditions={newAbstractorQueryConditions}
									filterexcludeindexes={newAbstractorSearchFilterExcludeIndexes}
									updatefilterexcludeindexes={(value) => {
										newAbstractorSearchFilterExcludeIndexes = value
										State.Toast.Type = Domain.Entities.Toast.Type.INFO
										State.Toast.Message = `${newAbstractorSearchFilterExcludeIndexes.length} local results filtered out`
									}}
									updatemetadatamodel={updateAbstractorMetadataModel}
									updatequeryconditions={(value) => {
										newAbstractorQueryConditions = value
									}}
									hidequerypanel={() => (showAbstractorQueryPanel = false)}
								></QueryPanel>
							{/await}
						</section>
					{/if}

					{#if !showAbstractorQueryPanel || windowWidth > 1000}
						<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
							<section class="z-[2] flex w-full">
								{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
									<div class="h-fit w-full flex-1 self-center">
										<ViewHeaderData
											title={'Abstractors'}
											view={dataView}
											{themecolor}
											theme={State.Theme.value}
											updateview={(value) => (dataView = value)}
										></ViewHeaderData>
									</div>
								{/await}
							</section>

							<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
								{#await import('$lib/components/View/IamGroupAuthorizations/Data/Component.svelte') then { default: ViewIamGroupAuthorizationsData }}
									<ViewIamGroupAuthorizationsData
										metadatamodel={newAbstractorSearchMetadataModel}
										data={newAbstractorSearchResults}
										{themecolor}
										theme={State.Theme.value}
										{telemetry}
										addclickcolumn={false}
										addselectcolumn={true}
										multiselectcolumns={false}
										view={dataView}
										updatemetadatamodel={updateAbstractorMetadataModel}
										filterexcludeindexes={newAbstractorSearchFilterExcludeIndexes}
										selecteddataindexes={selectedAbstractor}
										updateselecteddataindexes={(value) => (selectedAbstractor = value)}
										viewContext={'iam-credentials'}
									></ViewIamGroupAuthorizationsData>
								{/await}
							</section>
						</section>
					{/if}
				</main>
			{:catch e}
				{@render awaiterror(e)}
			{/await}
		{:else if updateDirectoryIDStep === 1}
			<main class="flex flex-1 flex-col overflow-hidden">
				<button
					class="btn btn-square sticky top-0 z-[2] flex w-full justify-between rounded-none p-2 {State.Theme.value ===
					Domain.Entities.Theme.Theme.DARK
						? 'bg-gray-800'
						: 'bg-gray-100'}"
					onclick={() => (reassignTab = ReassignTab.DIRECTORY)}
				>
					Pick Abstractor(s)
				</button>
				{#if reassignTab === ReassignTab.DIRECTORY}
					<section class="flex flex-1 flex-col gap-y-2 overflow-hidden p-2">
						{#await getDisplayIamGroupAuthorizations()}
							{@render awaitloading()}
						{:then}
							<header class="z-[2] flex justify-center">
								{#await import('$lib/components/View/IamGroupAuthorizations/SearchBar/Component.svelte') then { default: ViewIamGroupAuthorizationsSearchBar }}
									<div class="max-md:w-full md:w-[60%]">
										<ViewIamGroupAuthorizationsSearchBar
											metadatamodel={iamGroupAuthorizationSearchMetadataModel}
											themecolor={State.ThemeColor.value}
											theme={State.Theme.value}
											{telemetry}
											querycondition={iamGroupAuthorizationQuickSearchQueryCondition}
											updatequerycondition={(value) => {
												iamGroupAuthorizationQuickSearchQueryCondition = value
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
							</header>

							<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
								{#if showIamGroupAuthorizationsQueryPanel}
									<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
										{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
											<QueryPanel
												themecolor={State.ThemeColor.value}
												theme={State.Theme.value}
												{telemetry}
												metadatamodel={iamGroupAuthorizationSearchMetadataModel}
												data={iamGroupAuthorizationSearchResults}
												queryconditions={iamGroupAuthorizationQueryConditions}
												filterexcludeindexes={iamGroupAuthorizationSearchFilterExcludeIndexes}
												updatefilterexcludeindexes={(value) => {
													iamGroupAuthorizationSearchFilterExcludeIndexes = value
													State.Toast.Type = Domain.Entities.Toast.Type.INFO
													State.Toast.Message = `${iamGroupAuthorizationSearchFilterExcludeIndexes.length} local results filtered out`
												}}
												updatemetadatamodel={updateIamGroupAuthorizationsMetadataModel}
												updatequeryconditions={(value) => {
													iamGroupAuthorizationQueryConditions = value
												}}
												hidequerypanel={() => (showIamGroupAuthorizationsQueryPanel = false)}
											></QueryPanel>
										{/await}
									</section>
								{/if}

								{#if !showIamGroupAuthorizationsQueryPanel || windowWidth > 1000}
									<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
										<section class="z-[2] flex w-full">
											{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
												<div class="h-fit w-full flex-1 self-center">
													<ViewHeaderData
														title={'Abstractors'}
														view={dataView}
														themecolor={State.ThemeColor.value}
														theme={State.Theme.value}
														updateview={(value) => (dataView = value)}
													></ViewHeaderData>
												</div>
											{/await}
										</section>

										<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
											{#await import('$lib/components/View/IamGroupAuthorizations/Data/Component.svelte') then { default: ViewIamGroupAuthorizationsData }}
												<ViewIamGroupAuthorizationsData
													metadatamodel={iamGroupAuthorizationSearchMetadataModel}
													data={iamGroupAuthorizationSearchResults}
													themecolor={State.ThemeColor.value}
													theme={State.Theme.value}
													{telemetry}
													addclickcolumn={false}
													addselectcolumn={true}
													view={dataView}
													updatemetadatamodel={updateIamGroupAuthorizationsMetadataModel}
													filterexcludeindexes={iamGroupAuthorizationSearchFilterExcludeIndexes}
													selecteddataindexes={selectedIamGroupAuthorizations}
													updateselecteddataindexes={(value) => (selectedIamGroupAuthorizations = value)}
													viewContext={'iam-credentials'}
												></ViewIamGroupAuthorizationsData>
											{/await}
										</section>
									</section>
								{/if}
							</main>
						{:catch e}
							{@render awaiterror(e)}
						{/await}
					</section>
				{/if}

				<button
					class="btn btn-square sticky top-0 z-[2] flex w-full justify-between rounded-none p-2 {State.Theme.value ===
					Domain.Entities.Theme.Theme.DARK
						? 'bg-gray-800'
						: 'bg-gray-100'}"
					onclick={() => (reassignTab = ReassignTab.DIRECTORY_GROUP)}
				>
					Pick Group(s)
				</button>
				{#if reassignTab === ReassignTab.DIRECTORY_GROUP}
					<section class="flex flex-1 flex-col gap-y-2 overflow-hidden p-2">
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
					</section>
				{/if}

				<button
					class="btn btn-square sticky top-0 z-[2] flex w-full justify-between rounded-none p-2 {State.Theme.value ===
					Domain.Entities.Theme.Theme.DARK
						? 'bg-gray-800'
						: 'bg-gray-100'}"
					onclick={() => (reassignTab = ReassignTab.ABSTRACTIONS)}
				>
					Pick Abstraction(s)
				</button>
				{#if reassignTab === ReassignTab.ABSTRACTIONS}
					<section class="flex flex-1 flex-col gap-y-2 overflow-hidden p-2">
						{#await getDisplayAbstractions()}
							{@render awaitloading()}
						{:then}
							<header class="z-[2] flex justify-between gap-x-2">
								{#await import('$lib/components/View/Abstractions/SearchBar/Component.svelte') then { default: ViewAbstractionsSearchBar }}
									<div class="max-md:w-full md:w-[60%]">
										<ViewAbstractionsSearchBar
											metadatamodel={abstractionsSearchMetadataModel}
											themecolor={State.ThemeColor.value}
											theme={State.Theme.value}
											{telemetry}
											querycondition={abstractionsQuickSearchQueryCondition}
											updatequerycondition={(value) => {
												abstractionsQuickSearchQueryCondition = value
											}}
											showquerypanel={() => {
												showAbstractionsQueryPanel = !showAbstractionsQueryPanel
											}}
											search={() => {
												searchAbstractions()
											}}
										></ViewAbstractionsSearchBar>
									</div>
								{/await}
							</header>

							<div class="divider mb-0 mt-0"></div>

							<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
								{#if showAbstractionsQueryPanel}
									<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
										{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
											<QueryPanel
												themecolor={State.ThemeColor.value}
												theme={State.Theme.value}
												{telemetry}
												metadatamodel={abstractionsSearchMetadataModel}
												data={abstractionsSearchResults}
												queryconditions={abstractionsQueryConditions}
												filterexcludeindexes={abstractionsSearchFilterExcludeIndexes}
												updatefilterexcludeindexes={(value) => {
													abstractionsSearchFilterExcludeIndexes = value
													State.Toast.Type = Domain.Entities.Toast.Type.INFO
													State.Toast.Message = `${abstractionsSearchFilterExcludeIndexes.length} local results filtered out`
												}}
												updatemetadatamodel={updateAbstractionsMetadataModel}
												updatequeryconditions={(value) => {
													abstractionsQueryConditions = value
												}}
												hidequerypanel={() => (showAbstractionsQueryPanel = false)}
											></QueryPanel>
										{/await}
									</section>
								{/if}

								{#if !showAbstractionsQueryPanel || windowWidth > 1000}
									<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
										{#if abstractionsSearchResults.length > 0}
											<section class="z-[2] flex w-full">
												{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
													<div class="h-fit w-full flex-1 self-center">
														<ViewHeaderData
															title={'Pick Abstraction(s)...'}
															view={dataView}
															themecolor={State.ThemeColor.value}
															theme={State.Theme.value}
															updateview={(value) => (dataView = value)}
														></ViewHeaderData>
													</div>
												{/await}
											</section>

											<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
												{#await import('$lib/components/View/Abstractions/Data/Component.svelte') then { default: ViewAbstractionsData }}
													<ViewAbstractionsData
														metadatamodel={abstractionsSearchMetadataModel}
														data={abstractionsSearchResults}
														themecolor={State.ThemeColor.value}
														theme={State.Theme.value}
														{telemetry}
														addselectcolumn={true}
														addclickcolumn={false}
														view={dataView}
														updatemetadatamodel={updateAbstractionsMetadataModel}
														filterexcludeindexes={abstractionsSearchFilterExcludeIndexes}
														selecteddataindexes={selectedAbstractions}
														updateselecteddataindexes={(value) => (selectedAbstractions = value)}
													></ViewAbstractionsData>
												{/await}
											</section>
										{:else}
											<div
												class="flex flex-1 justify-center rounded-md p-2 {State.Theme.value === Domain.Entities.Theme.Theme.DARK
													? 'bg-gray-700'
													: 'bg-gray-200'}"
											>
												<span class="flex self-center text-lg"> Create and manage data abstracted from published works. </span>
											</div>
										{/if}
									</section>
								{/if}
							</main>
						{:catch e}
							{@render awaiterror(e)}
						{/await}
					</section>
				{/if}

				<button
					class="btn btn-square sticky top-0 z-[2] flex w-full justify-between rounded-none p-2 {State.Theme.value ===
					Domain.Entities.Theme.Theme.DARK
						? 'bg-gray-800'
						: 'bg-gray-100'}"
					onclick={() => (reassignTab = ReassignTab.STORAGE_FILES)}
				>
					Set Storage File(s) Filter Query
				</button>
				{#if reassignTab === ReassignTab.STORAGE_FILES}
					<section class="flex flex-1 flex-col gap-y-4">
						<fieldset
							class="fieldset {State.Theme.value === Domain.Entities.Theme.Theme.DARK
								? 'border-gray-900 bg-gray-700'
								: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
						>
							<legend class="fieldset-legend flex gap-x-2">
								<div class="text-md h-fit self-center">File Text Search Query?</div>
							</legend>

							<input
								class="input {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
									? 'input-primary'
									: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
										? 'input-secondary'
										: 'input-accent'} w-full"
								type="search"
								bind:value={storageFilesTextSearchQuery}
								placeholder="Enter value..."
							/>
						</fieldset>

						<div class="divider">or</div>

						<fieldset
							class="fieldset {State.Theme.value === Domain.Entities.Theme.Theme.DARK
								? 'border-gray-900 bg-gray-700'
								: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
						>
							<legend class="fieldset-legend flex gap-x-2">
								<div class="text-md h-fit self-center">File Number Minimum and Maximum?</div>
							</legend>

							<p class="text-sm">If the files are numbered, enter the minimum and maximum value.</p>
							<p class="text-sm">Will auto-generate the text search query for searching the files within the numbered range.</p>

							<label
								class="input {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
									? 'input-primary'
									: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
										? 'input-secondary'
										: 'input-accent'} w-full"
							>
								<span class="label">Min</span>
								<input type="number" placeholder="Enter minimum..." bind:value={storageFilesNumberMin} />
							</label>

							<label
								class="input {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
									? 'input-primary'
									: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
										? 'input-secondary'
										: 'input-accent'} w-full"
							>
								<span class="label">Max</span>
								<input type="number" placeholder="Enter maximum..." bind:value={storageFilesNumberMax} />
							</label>
						</fieldset>
					</section>
				{/if}

				<button
					class="btn btn-square sticky top-0 z-[2] flex w-full justify-between rounded-none p-2 {State.Theme.value ===
					Domain.Entities.Theme.Theme.DARK
						? 'bg-gray-800'
						: 'bg-gray-100'}"
					onclick={() => (reassignTab = ReassignTab.COMPLETED_REVIEW)}
				>
					Set Completed/Review Status
				</button>
				{#if reassignTab === ReassignTab.COMPLETED_REVIEW}
					<section class="flex flex-1 flex-col gap-y-4">
						<fieldset
							class="fieldset {State.Theme.value === Domain.Entities.Theme.Theme.DARK
								? 'border-gray-900 bg-gray-700'
								: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
						>
							<legend class="fieldset-legend flex gap-x-2">
								<div class="text-md h-fit self-center">Completed?</div>
							</legend>

							<p class="text-sm">Has the abstraction been completed by the author?.</p>

							<input
								class="checkbox {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
									? 'checkbox-primary'
									: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
										? 'checkbox-secondary'
										: 'checkbox-accent'}"
								type="checkbox"
								bind:checked={abstractionCompleted}
							/>
						</fieldset>

						<fieldset
							class="fieldset {State.Theme.value === Domain.Entities.Theme.Theme.DARK
								? 'border-gray-900 bg-gray-700'
								: 'border-gray-300 bg-gray-100'} rounded-box w-full border p-4"
						>
							<legend class="fieldset-legend flex gap-x-2">
								<div class="text-md h-fit self-center">Checks Passed?</div>
							</legend>

							<p class="text-sm">Has the abstraction passed the checks?.</p>

							<input
								class="checkbox {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
									? 'checkbox-primary'
									: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
										? 'checkbox-secondary'
										: 'checkbox-accent'}"
								type="checkbox"
								bind:checked={abstractionReviewPass}
							/>
						</fieldset>
					</section>
				{/if}
			</main>
		{:else if updateDirectoryIDStep === 2}
			<div class="flex flex-1 justify-center">
				<div class="flex h-fit w-fit flex-col gap-y-16 self-center justify-self-center md:max-w-[60%]">
					<button
						class="btn btn-lg {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary'
								: 'btn-accent'} w-full self-center"
						aria-label="Reassign abstractions"
						onclick={handleReassignAbstractions}
						disabled={!updateAbstractionsDirectoryValid}
					>
						Reassign Abstraction(s)
					</button>
				</div>
			</div>
		{/if}
	</main>
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

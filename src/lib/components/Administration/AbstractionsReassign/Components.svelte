<script lang="ts">
	import { Domain, Interfaces, MetadataModel, State, Utils } from '$lib'
	import { untrack } from 'svelte'
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

	let newAbstractorSearch = $state(Interfaces.IamGroupAuthorizations.NewViewSearch())
	$effect(() => {
		if (
			State.Session.session?.iam_credential &&
			Array.isArray(State.Session.session.iam_credential.id) &&
			State.Session.session.iam_credential.id.length > 0
		) {
			untrack(() => {
				newAbstractorSearch.authcontextdirectorygroupid = authContextDirectoryGroupID
				newAbstractorSearch.context = COMPONENT_NAME
				newAbstractorSearch.telemetry = telemetry
				newAbstractorSearch.addadditionalqueryconditions = [
					(ctx) => {
						let deactivatedOnQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
							ctx.searchmetadatamodel,
							Domain.Entities.IamGroupAuthorizations.FieldColumn.DeactivatedOn,
							Domain.Entities.IamGroupAuthorizations.RepositoryName,
							0
						)

						if (!deactivatedOnQCKey) {
							throw [500, `Search does not contain user role information`]
						}

						abstractorDirectoryIDQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
							ctx.searchmetadatamodel,
							Domain.Entities.IamCredentials.FieldColumn.DirectoryID,
							Domain.Entities.IamCredentials.RepositoryName,
							1
						)

						if (!abstractorDirectoryIDQCKey) {
							throw [500, `Search does not contain directory information`]
						}

						const groupAuthRuleIDQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
							ctx.searchmetadatamodel,
							Domain.Entities.GroupRuleAuthorizations.FieldColumn.GroupAuthorizationRuleID,
							Domain.Entities.GroupRuleAuthorizations.RepositoryName,
							1
						)

						const groupAuthRuleGroupQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
							ctx.searchmetadatamodel,
							Domain.Entities.GroupRuleAuthorizations.FieldColumn.GroupAuthorizationRuleGroup,
							Domain.Entities.GroupRuleAuthorizations.RepositoryName,
							1
						)

						if (!groupAuthRuleIDQCKey || !groupAuthRuleGroupQCKey) {
							throw [500, `Search does not contain group roles information`]
						}

						const newAbstractorFilterAbstractorRoleQueryCondition: MetadataModel.QueryConditions = {
							[deactivatedOnQCKey.qcKey]: {
								[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]:
									deactivatedOnQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
								[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]:
									deactivatedOnQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
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
								[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]:
									groupAuthRuleGroupQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
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
								[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]:
									groupAuthRuleIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
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

						return newAbstractorFilterAbstractorRoleQueryCondition
					}
				]
			})
		}
	})

	let abstractorDirectoryIDQCKey: Utils.MetadataModel.FieldGroupQueryProperties | undefined

	let windowWidth: number = $state(0)

	let reassignTab: ReassignTab = $state(ReassignTab.ABSTRACTIONS)

	let abstractionCompleted: boolean | undefined = $state(undefined)

	let abstractionReviewPass: boolean | undefined = $state(undefined)

	let storageFilesTextSearchQuery: string = $state('')

	let storageFilesNumberMin: number | undefined = $state(undefined)

	let storageFilesNumberMax: number | undefined = $state(undefined)

	let abstractionsSearch = $state(Interfaces.Abstractions.NewViewSearch())
	$effect(() => {
		if (
			State.Session.session?.iam_credential &&
			Array.isArray(State.Session.session.iam_credential.id) &&
			State.Session.session.iam_credential.id.length > 0
		) {
			untrack(() => {
				abstractionsSearch.authcontextdirectorygroupid = authContextDirectoryGroupID
				abstractionsSearch.context = COMPONENT_NAME
				abstractionsSearch.telemetry = telemetry
			})
		}
	})

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

	let iamGroupAuthorizationSearch = $state(Interfaces.IamGroupAuthorizations.NewViewSearch())
	let directoryIDQCKey: Utils.MetadataModel.FieldGroupQueryProperties | undefined = $state(undefined)
	$effect(() => {
		if (
			State.Session.session?.iam_credential &&
			Array.isArray(State.Session.session.iam_credential.id) &&
			State.Session.session.iam_credential.id.length > 0
		) {
			untrack(() => {
				iamGroupAuthorizationSearch.authcontextdirectorygroupid = authContextDirectoryGroupID
				iamGroupAuthorizationSearch.context = COMPONENT_NAME
				iamGroupAuthorizationSearch.telemetry = telemetry
				iamGroupAuthorizationSearch.viewContextIamCredentials = true
				iamGroupAuthorizationSearch.addadditionalqueryconditions = [
					(ctx) => {
						let deactivatedOnQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
							ctx.searchmetadatamodel,
							Domain.Entities.IamGroupAuthorizations.FieldColumn.DeactivatedOn,
							Domain.Entities.IamGroupAuthorizations.RepositoryName,
							0
						)

						if (!deactivatedOnQCKey) {
							throw [500, `Search does not contain user role information`]
						}

						directoryIDQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
							ctx.searchmetadatamodel,
							Domain.Entities.IamCredentials.FieldColumn.DirectoryID,
							Domain.Entities.IamCredentials.RepositoryName,
							1
						)

						if (!directoryIDQCKey) {
							throw [500, `Search does not contain directory information`]
						}

						const groupAuthRuleIDQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
							ctx.searchmetadatamodel,
							Domain.Entities.GroupRuleAuthorizations.FieldColumn.GroupAuthorizationRuleID,
							Domain.Entities.GroupRuleAuthorizations.RepositoryName,
							1
						)

						const groupAuthRuleGroupQCKey = Utils.MetadataModel.GetFieldQueryPropertiesByDatabaseProperties(
							ctx.searchmetadatamodel,
							Domain.Entities.GroupRuleAuthorizations.FieldColumn.GroupAuthorizationRuleGroup,
							Domain.Entities.GroupRuleAuthorizations.RepositoryName,
							1
						)

						if (!groupAuthRuleIDQCKey || !groupAuthRuleGroupQCKey) {
							throw [500, `Search does not contain group roles information`]
						}

						const iamGroupAuthorizationFilterAbstractorRoleQueryCondition: MetadataModel.QueryConditions = {
							[deactivatedOnQCKey.qcKey]: {
								[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]:
									deactivatedOnQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
								[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]:
									deactivatedOnQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
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
								[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]:
									directoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
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
								[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]:
									groupAuthRuleGroupQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
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
								[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]:
									groupAuthRuleIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
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

						return iamGroupAuthorizationFilterAbstractorRoleQueryCondition
					}
				]
			})
		}
	})

	let updateAbstractionsDirectoryValid: boolean = $derived(
		newAbstractorSearch.selectedindexes!.length > 0 &&
			(iamGroupAuthorizationSearch.selectedindexes!.length > 0 ||
				directoryGroupsSearch.selectedindexes!.length > 0 ||
				abstractionsSearch.selectedindexes!.length > 0 ||
				storageFilesTextSearchQuery.length > 0 ||
				(typeof storageFilesNumberMin === 'number' && typeof storageFilesNumberMax === 'number'))
	)

	async function handleReassignAbstractions() {
		if (!updateAbstractionsDirectoryValid || !directorygroupid) {
			return
		}

		let updateAbstractionsDirectory: Domain.Entities.Abstractions.UpdateDirectory = {}

		if (iamGroupAuthorizationSearch.selectedindexes!.length > 0 && directoryIDQCKey) {
			for (const dIndex of iamGroupAuthorizationSearch.selectedindexes!) {
				const directoryID = MetadataModel.DatabaseGetColumnFieldValue(
					JSON.parse(JSON.stringify(iamGroupAuthorizationSearch.searchmetadatamodel)),
					directoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
					directoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
					iamGroupAuthorizationSearch.searchresults![dIndex]
				)
				if (Array.isArray(directoryID) && directoryID.length > 0) {
					if (!Array.isArray(updateAbstractionsDirectory.directory_id)) {
						updateAbstractionsDirectory.directory_id = []
					}
					updateAbstractionsDirectory.directory_id.push(directoryID[0])
				}
			}
		}

		if (directoryGroupsSearch.selectedindexes!.length > 0) {
			for (const dIndex of directoryGroupsSearch.selectedindexes!) {
				const d: Domain.Entities.DirectoryGroups.Interface = directoryGroupsSearch.searchresults![dIndex]
				if (Array.isArray(d.id) && d.id.length > 0) {
					if (!Array.isArray(updateAbstractionsDirectory.directory_group_id)) {
						updateAbstractionsDirectory.directory_group_id = []
					}
					updateAbstractionsDirectory.directory_group_id.push(d.id[0])
				}
			}
		}

		if (abstractionsSearch.selectedindexes!.length > 0) {
			for (const dIndex of abstractionsSearch.selectedindexes!) {
				const d: Domain.Entities.Abstractions.Interface = abstractionsSearch.searchresults![dIndex]
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

		if (abstractorDirectoryIDQCKey && newAbstractorSearch.selectedindexes!.length > 0) {
			const directoryID = MetadataModel.DatabaseGetColumnFieldValue(
				JSON.parse(JSON.stringify(newAbstractorSearch.searchmetadatamodel)),
				abstractorDirectoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
				abstractorDirectoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
				newAbstractorSearch.searchresults![newAbstractorSearch.selectedindexes![0]]
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

			const fetchResponse = await fetch(fetchUrl, {
				method: 'POST',
				credentials: 'include',
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
				iamGroupAuthorizationSearch.selectedindexes = []
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
			{#if newAbstractorSearch.getdisplaydata}
				{#await newAbstractorSearch.getdisplaydata()}
					{@render awaitloading()}
				{:then}
					<header class="z-[2] flex justify-center">
						{#await import('$lib/components/View/IamGroupAuthorizations/SearchBar/Component.svelte') then { default: ViewIamGroupAuthorizationsSearchBar }}
							<div class="max-md:w-full md:w-[60%]">
								<ViewIamGroupAuthorizationsSearchBar
									metadatamodel={newAbstractorSearch.searchmetadatamodel}
									{themecolor}
									theme={State.Theme.value}
									{telemetry}
									querycondition={newAbstractorSearch.quicksearchquerycondition}
									updatequerycondition={(value) => {
										newAbstractorSearch.quicksearchquerycondition = value
									}}
									showquerypanel={() => {
										newAbstractorSearch.showquerypanel = !newAbstractorSearch.showquerypanel
									}}
									search={() => {
										if (newAbstractorSearch.searchdata) {
											newAbstractorSearch.searchdata()
										}
									}}
								></ViewIamGroupAuthorizationsSearchBar>
							</div>
						{/await}
					</header>

					<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
						{#if newAbstractorSearch.showquerypanel}
							<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
								{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
									<QueryPanel
										{themecolor}
										theme={State.Theme.value}
										{telemetry}
										metadatamodel={newAbstractorSearch.searchmetadatamodel}
										data={newAbstractorSearch.searchresults}
										queryconditions={newAbstractorSearch.queryconditions}
										filterexcludeindexes={newAbstractorSearch.filterexcludeindexes}
										updatefilterexcludeindexes={(value) => {
											newAbstractorSearch.filterexcludeindexes = value
											State.Toast.Type = Domain.Entities.Toast.Type.INFO
											State.Toast.Message = `${newAbstractorSearch.filterexcludeindexes.length} local results filtered out`
										}}
										updatemetadatamodel={(value: any) => {
											if (newAbstractorSearch.updatemedataModel) {
												newAbstractorSearch.updatemedataModel(value)
											}
										}}
										updatequeryconditions={(value) => {
											newAbstractorSearch.queryconditions = value
										}}
										hidequerypanel={() => (newAbstractorSearch.showquerypanel = false)}
									></QueryPanel>
								{/await}
							</section>
						{/if}

						{#if !newAbstractorSearch.showquerypanel || windowWidth > 1000}
							<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
								<section class="z-[2] flex w-full">
									{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
										<div class="h-fit w-full flex-1 self-center">
											<ViewHeaderData
												title={'Abstractors'}
												view={newAbstractorSearch.view}
												{themecolor}
												theme={State.Theme.value}
												updateview={(value) => (newAbstractorSearch.view = value)}
											></ViewHeaderData>
										</div>
									{/await}
								</section>

								<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
									{#await import('$lib/components/View/IamGroupAuthorizations/Data/Component.svelte') then { default: ViewIamGroupAuthorizationsData }}
										<ViewIamGroupAuthorizationsData
											metadatamodel={newAbstractorSearch.searchmetadatamodel}
											data={newAbstractorSearch.searchresults}
											{themecolor}
											theme={State.Theme.value}
											{telemetry}
											addclickcolumn={false}
											addselectcolumn={true}
											multiselectcolumns={false}
											view={newAbstractorSearch.view}
											updatemetadatamodel={(value: any) => {
												if (newAbstractorSearch.updatemedataModel) {
													newAbstractorSearch.updatemedataModel(value)
												}
											}}
											filterexcludeindexes={newAbstractorSearch.filterexcludeindexes}
											selecteddataindexes={newAbstractorSearch.selectedindexes}
											updateselecteddataindexes={(value) => (newAbstractorSearch.selectedindexes = value)}
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
			{/if}
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
						{#if iamGroupAuthorizationSearch.getdisplaydata}
							{#await iamGroupAuthorizationSearch.getdisplaydata()}
								{@render awaitloading()}
							{:then}
								<header class="z-[2] flex justify-center">
									{#await import('$lib/components/View/IamGroupAuthorizations/SearchBar/Component.svelte') then { default: ViewIamGroupAuthorizationsSearchBar }}
										<div class="max-md:w-full md:w-[60%]">
											<ViewIamGroupAuthorizationsSearchBar
												metadatamodel={iamGroupAuthorizationSearch.searchmetadatamodel}
												themecolor={State.ThemeColor.value}
												theme={State.Theme.value}
												{telemetry}
												querycondition={iamGroupAuthorizationSearch.quicksearchquerycondition}
												updatequerycondition={(value) => {
													iamGroupAuthorizationSearch.quicksearchquerycondition = value
												}}
												showquerypanel={() => {
													iamGroupAuthorizationSearch.showquerypanel = !iamGroupAuthorizationSearch.showquerypanel
												}}
												search={() => {
													if (iamGroupAuthorizationSearch.searchdata) {
														iamGroupAuthorizationSearch.searchdata()
													}
												}}
											></ViewIamGroupAuthorizationsSearchBar>
										</div>
									{/await}
								</header>

								<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
									{#if iamGroupAuthorizationSearch.showquerypanel}
										<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
											{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
												<QueryPanel
													themecolor={State.ThemeColor.value}
													theme={State.Theme.value}
													{telemetry}
													metadatamodel={iamGroupAuthorizationSearch.searchmetadatamodel}
													data={iamGroupAuthorizationSearch.searchresults}
													queryconditions={iamGroupAuthorizationSearch.queryconditions}
													filterexcludeindexes={iamGroupAuthorizationSearch.filterexcludeindexes}
													updatefilterexcludeindexes={(value) => {
														iamGroupAuthorizationSearch.filterexcludeindexes = value
														State.Toast.Type = Domain.Entities.Toast.Type.INFO
														State.Toast.Message = `${iamGroupAuthorizationSearch.filterexcludeindexes.length} local results filtered out`
													}}
													updatemetadatamodel={(value: any) => {
														if (iamGroupAuthorizationSearch.updatemedataModel) {
															iamGroupAuthorizationSearch.updatemedataModel(value)
														}
													}}
													updatequeryconditions={(value) => {
														iamGroupAuthorizationSearch.queryconditions = value
													}}
													hidequerypanel={() => (iamGroupAuthorizationSearch.showquerypanel = false)}
												></QueryPanel>
											{/await}
										</section>
									{/if}

									{#if !iamGroupAuthorizationSearch.showquerypanel || windowWidth > 1000}
										<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
											<section class="z-[2] flex w-full">
												{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
													<div class="h-fit w-full flex-1 self-center">
														<ViewHeaderData
															title={'Abstractors'}
															view={iamGroupAuthorizationSearch.view}
															themecolor={State.ThemeColor.value}
															theme={State.Theme.value}
															updateview={(value) => (iamGroupAuthorizationSearch.view = value)}
														></ViewHeaderData>
													</div>
												{/await}
											</section>

											<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
												{#await import('$lib/components/View/IamGroupAuthorizations/Data/Component.svelte') then { default: ViewIamGroupAuthorizationsData }}
													<ViewIamGroupAuthorizationsData
														metadatamodel={iamGroupAuthorizationSearch.searchmetadatamodel}
														data={iamGroupAuthorizationSearch.searchresults}
														themecolor={State.ThemeColor.value}
														theme={State.Theme.value}
														{telemetry}
														addclickcolumn={false}
														addselectcolumn={true}
														view={iamGroupAuthorizationSearch.view}
														updatemetadatamodel={(value: any) => {
															if (iamGroupAuthorizationSearch.updatemedataModel) {
																iamGroupAuthorizationSearch.updatemedataModel(value)
															}
														}}
														filterexcludeindexes={iamGroupAuthorizationSearch.filterexcludeindexes}
														selecteddataindexes={iamGroupAuthorizationSearch.selectedindexes}
														updateselecteddataindexes={(value) => (iamGroupAuthorizationSearch.selectedindexes = value)}
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
						{/if}
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
						{#if directoryGroupsSearch.getdisplaydata}
							{#await directoryGroupsSearch.getdisplaydata()}
								{@render awaitloading()}
							{:then}
								<header class="z-[2] flex justify-center">
									{#await import('$lib/components/View/DirectoryGroups/SearchBar/Component.svelte') then { default: ViewDirectoryGroupsSearchBar }}
										<div class="max-md:w-full md:w-[60%]">
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

									{#if !directoryGroupsSearch.showquerypanel || windowWidth > 1000}
										<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
											<section class="z-[2] flex w-full">
												{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
													<div class="h-fit w-full flex-1 self-center">
														<ViewHeaderData
															title={'Groups'}
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
														addclickcolumn={false}
														addselectcolumn={true}
														view={directoryGroupsSearch.view}
														updatemetadatamodel={(value: any) => {
															if (directoryGroupsSearch.updatemedataModel) {
																directoryGroupsSearch.updatemedataModel(value)
															}
														}}
														filterexcludeindexes={directoryGroupsSearch.filterexcludeindexes}
														selecteddataindexes={directoryGroupsSearch.selectedindexes}
														updateselecteddataindexes={(value) => (directoryGroupsSearch.selectedindexes = value)}
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
						{#if abstractionsSearch.getdisplaydata}
							{#await abstractionsSearch.getdisplaydata()}
								{@render awaitloading()}
							{:then}
								<header class="z-[2] flex justify-between gap-x-2">
									{#await import('$lib/components/View/Abstractions/SearchBar/Component.svelte') then { default: ViewAbstractionsSearchBar }}
										<div class="max-md:w-full md:w-[60%]">
											<ViewAbstractionsSearchBar
												metadatamodel={abstractionsSearch.searchmetadatamodel}
												themecolor={State.ThemeColor.value}
												theme={State.Theme.value}
												{telemetry}
												querycondition={abstractionsSearch.quicksearchquerycondition}
												updatequerycondition={(value) => {
													abstractionsSearch.quicksearchquerycondition = value
												}}
												showquerypanel={() => {
													abstractionsSearch.showquerypanel = !abstractionsSearch.showquerypanel
												}}
												search={() => {
													if (abstractionsSearch.searchdata) {
														abstractionsSearch.searchdata()
													}
												}}
												viewdatasearch={abstractionsSearch.viewdatasearch}
												updateviewdatasearch={(value) => (abstractionsSearch.viewdatasearch = value)}
											></ViewAbstractionsSearchBar>
										</div>
									{/await}
								</header>

								<div class="divider mb-0 mt-0"></div>

								<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
									{#if abstractionsSearch.showquerypanel}
										<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
											{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
												<QueryPanel
													themecolor={State.ThemeColor.value}
													theme={State.Theme.value}
													{telemetry}
													metadatamodel={abstractionsSearch.searchmetadatamodel}
													data={abstractionsSearch.searchresults}
													queryconditions={abstractionsSearch.queryconditions}
													filterexcludeindexes={abstractionsSearch.filterexcludeindexes}
													updatefilterexcludeindexes={(value) => {
														abstractionsSearch.filterexcludeindexes = value
														State.Toast.Type = Domain.Entities.Toast.Type.INFO
														State.Toast.Message = `${abstractionsSearch.filterexcludeindexes.length} local results filtered out`
													}}
													updatemetadatamodel={(value: any) => {
														if (abstractionsSearch.updatemedataModel) {
															abstractionsSearch.updatemedataModel(value)
														}
													}}
													updatequeryconditions={(value) => {
														abstractionsSearch.queryconditions = value
													}}
													hidequerypanel={() => (abstractionsSearch.showquerypanel = false)}
												></QueryPanel>
											{/await}
										</section>
									{/if}

									{#if !abstractionsSearch.showquerypanel || windowWidth > 1000}
										<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
											{#if Array.isArray(abstractionsSearch.searchresults) && abstractionsSearch.searchresults.length > 0}
												<section class="z-[2] flex w-full">
													{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
														<div class="h-fit w-full flex-1 self-center">
															<ViewHeaderData
																title={'Pick Abstraction(s)...'}
																view={abstractionsSearch.view}
																themecolor={State.ThemeColor.value}
																theme={State.Theme.value}
																updateview={(value) => (abstractionsSearch.view = value)}
															></ViewHeaderData>
														</div>
													{/await}
												</section>

												<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
													{#await import('$lib/components/View/Abstractions/Data/Component.svelte') then { default: ViewAbstractionsData }}
														<ViewAbstractionsData
															metadatamodel={abstractionsSearch.searchmetadatamodel}
															data={abstractionsSearch.searchresults}
															themecolor={State.ThemeColor.value}
															theme={State.Theme.value}
															{telemetry}
															addselectcolumn={true}
															addclickcolumn={false}
															view={abstractionsSearch.view}
															updatemetadatamodel={(value: any) => {
																if (abstractionsSearch.updatemedataModel) {
																	abstractionsSearch.updatemedataModel(value)
																}
															}}
															filterexcludeindexes={abstractionsSearch.filterexcludeindexes}
															selecteddataindexes={abstractionsSearch.selectedindexes}
															updateselecteddataindexes={(value) => (abstractionsSearch.selectedindexes = value)}
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
						{/if}
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

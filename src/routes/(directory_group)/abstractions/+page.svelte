<script lang="ts">
	import { Domain, State, Component, Interfaces, MetadataModel, Utils } from '$lib'
	import { getContext, onMount, untrack } from 'svelte'
	import type { PageProps } from './$types'
	import { goto } from '$app/navigation'

	const COMPONENT_NAME = 'abstractions-page'

	let { data }: PageProps = $props()

	let telemetry: Domain.Interfaces.ITelemetry | undefined = $derived.by(() => {
		return getContext(State.TelemetryContext.value)
	})

	let windowWidth: number = $state(0)
	let authContextDirectoryGroupID = $derived(data.directory_group_id)

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

	let showSelectedActions: boolean = $state(false)

	async function deleteDeactivatesSelectedAbstractions() {
		if (!Array.isArray(abstractionsSearch.selectedindexes) || !Array.isArray(abstractionsSearch.searchresults)) {
			return
		}

		const sdata = abstractionsSearch.selectedindexes.map((dIndex) => abstractionsSearch.searchresults![dIndex])

		if (sdata.length === 0 || !data.directory_group_id) {
			return
		}

		State.Loading.value = `Deleting/Deactivating ${Domain.Entities.Abstractions.RepositoryName}`
		try {
			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Abstractions.Url}/${Domain.Entities.Url.Action.DELETE}`)
			fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID, data.directory_group_id)
			if (authContextDirectoryGroupID) {
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, authContextDirectoryGroupID)
			}
			if (State.VerboseResponse.value) {
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.VERBOSE_RESPONSE, `${true}`)
			}

			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.DEBUG, State.Loading.value, 'fetchUrl', fetchUrl, 'data', sdata)

			const fetchResponse = await fetch(fetchUrl, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify(sdata)
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
				abstractionsSearch.selectedindexes = []
				showSelectedActions = false
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Delete/Deactivate ${Domain.Entities.Abstractions.RepositoryName} failed`
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

	let showCreateNewAbstractions: boolean = $state(false)

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
							iamGroupAuthorizationSearch.searchmetadatamodel,
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

	let uploadFiles: boolean = $state(false)

	let uploadedFiles: Domain.Entities.StorageFiles.Interface[] = $state([])

	let storageFilesSearch = $state(Interfaces.StorageFiles.NewViewSearch())
	$effect(() => {
		if (
			State.Session.session?.iam_credential &&
			Array.isArray(State.Session.session.iam_credential.id) &&
			State.Session.session.iam_credential.id.length > 0
		) {
			untrack(() => {
				storageFilesSearch.authcontextdirectorygroupid = authContextDirectoryGroupID
				storageFilesSearch.context = COMPONENT_NAME
				storageFilesSearch.telemetry = telemetry
			})
		}
	})

	let createAbstractionsStep: number = $state(0)

	let createTags: string[] = $state([])
	let noOfTags: number = $derived(createTags.length)
	let tagsStart: number = $state(0)
	let tagsEnd: number = $state(0)
	function updateTags(index: number, value: string) {
		if (typeof value === 'string') {
			if (value.length > 0) {
				if (index > createTags.length - 1) {
					for (let i = createTags.length; i <= index; i++) {
						createTags.push('')
					}
				}
				createTags[index] = value
			} else {
				deleteTags(index)
			}
		} else {
			deleteTags(index)
		}
	}
	function deleteTags(index: number) {
		if (index < createTags.length) {
			createTags = createTags.filter((_, tIndex) => tIndex !== index)
		}
	}

	let createAbstractionsDataValid: boolean = $derived(
		iamGroupAuthorizationSearch.selectedindexes!.length > 0 && (uploadedFiles.length > 0 || storageFilesSearch.selectedindexes!.length > 0)
	)
	async function handleCreateAbstractions() {
		if (!createAbstractionsDataValid || !data.directory_group_id) {
			return
		}

		let directory: Domain.Entities.IamGroupAuthorizations.Interface[] = []
		if (directoryIDQCKey) {
			for (const dIndex of iamGroupAuthorizationSearch.selectedindexes!) {
				const directoryID = MetadataModel.DatabaseGetColumnFieldValue(
					JSON.parse(JSON.stringify(iamGroupAuthorizationSearch.searchmetadatamodel)),
					directoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME],
					directoryIDQCKey.fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
					iamGroupAuthorizationSearch.searchresults![dIndex]
				)
				if (Array.isArray(directoryID) && directoryID.length > 0) {
					directory.push({
						id: directoryID
					})
				}
			}
		}

		if (directory.length === 0) {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = `Chosen ${Domain.Entities.IamGroupAuthorizations.RepositoryName} not valid`
			return
		}

		let storageFiles: Domain.Entities.StorageFiles.Interface[] = []
		if (uploadedFiles.length > 0) {
			for (const uf of uploadedFiles) {
				if (Array.isArray(uf.id) && uf.id.length > 0) {
					storageFiles.push({
						id: uf.id
					})
				}
			}
			storageFiles = uploadedFiles
		}
		if (storageFilesSearch.selectedindexes!.length > 0) {
			for (const sfIndex of storageFilesSearch.selectedindexes!) {
				const sf: Domain.Entities.StorageFiles.Interface = storageFilesSearch.searchresults![sfIndex]
				if (Array.isArray(sf.id) && sf.id.length > 0) {
					storageFiles.push({
						id: sf.id
					})
				}
			}
		}

		if (storageFiles.length === 0) {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = `Chosen/Uploaded ${Domain.Entities.StorageFiles.RepositoryName} not valid`
			return
		}

		let newAbstractions: Domain.Entities.Abstractions.Interface[] = []
		for (const d of directory) {
			for (const sf of storageFiles) {
				let newAbstraction: Domain.Entities.Abstractions.Interface = {
					abstractions_directory_groups_id: [data.directory_group_id],
					directory_id: d.id,
					storage_files_id: sf.id
				}
				if (createTags.length > 0) {
					newAbstraction.tags = JSON.parse(JSON.stringify(createTags))
				}
				newAbstractions.push(newAbstraction)
			}
		}

		if (newAbstractions.length === 0) {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = `New ${Domain.Entities.Abstractions.RepositoryName} data not valid`
			return
		}

		State.Loading.value = `Creating ${Domain.Entities.Abstractions.RepositoryName}`
		try {
			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Abstractions.Url}/${Domain.Entities.Url.Action.CREATE}`)
			fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID, data.directory_group_id)
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
				newAbstractions
			)

			const fetchResponse = await fetch(fetchUrl, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify(newAbstractions)
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
				iamGroupAuthorizationSearch.selectedindexes! = []
				storageFilesSearch.selectedindexes! = []
				showSelectedActions = false
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Create ${Domain.Entities.Abstractions.RepositoryName} failed`
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
			handleError(e, ERROR)
		} finally {
			State.Loading.value = undefined
		}
	}

	let showUpdateDirectoryID: boolean = $state(false)
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div
	class="flex flex-1 flex-col gap-y-2 overflow-hidden rounded-lg p-2 shadow-md shadow-gray-800 {State.Theme.value === Domain.Entities.Theme.Theme.DARK
		? 'bg-base-300'
		: 'bg-white'} mb-1"
>
	{#if abstractionsSearch.getdisplaydata}
		{#await abstractionsSearch.getdisplaydata()}
			{@render awaitloading()}
		{:then}
			{#if showCreateNewAbstractions}
				<header class="z-[3] flex flex-col gap-y-1">
					<section class="flex gap-x-1">
						<button
							class="btn btn-ghost btn-circle btn-md flex self-center"
							aria-label="Close Create Abstractions"
							onclick={() => {
								showCreateNewAbstractions = false
							}}
						>
							<!--mdi:arrow-back source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path fill="var({Utils.Theme.GetColor(State.ThemeColor.value)})" d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z" />
							</svg>
						</button>
						<span class="self-center"> Create Abstraction(s) </span>
					</section>
				</header>

				<nav
					class="flex w-full justify-center rounded-lg p-2 {State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'bg-base-100' : 'bg-gray-100'}"
				>
					<div class="steps z-[2]">
						<li
							class="step {createAbstractionsStep >= 0
								? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
									? 'step-primary'
									: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
										? 'step-secondary'
										: 'step-accent'
								: ''} overflow-visible"
						>
							<button
								class="link link-hover"
								onclick={() => {
									createAbstractionsStep = 0
								}}
							>
								Pick Abstractor(s)
							</button>
						</li>

						<li
							class="step {createAbstractionsStep >= 1
								? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
									? 'step-primary'
									: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
										? 'step-secondary'
										: 'step-accent'
								: ''} overflow-visible"
						>
							<button
								class="link link-hover"
								onclick={() => {
									createAbstractionsStep = 1
								}}
							>
								Pick or Upload File(s)
							</button>
						</li>
						<li
							class="step {createAbstractionsStep >= 2
								? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
									? 'step-primary'
									: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
										? 'step-secondary'
										: 'step-accent'
								: ''} overflow-visible"
						>
							<button
								class="link link-hover"
								onclick={() => {
									createAbstractionsStep = 2
								}}
							>
								Create Abstractions(s)
							</button>
						</li>
					</div>
				</nav>

				<main
					class="z-[1] flex flex-[9.5] flex-col gap-y-2 overflow-hidden {State.Theme.value === Domain.Entities.Theme.Theme.DARK
						? 'bg-base-100'
						: 'bg-gray-100'} rounded-lg p-2"
				>
					{#if createAbstractionsStep === 0}
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
													data={iamGroupAuthorizationSearch.searchresults!}
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
														data={iamGroupAuthorizationSearch.searchresults!}
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
														selecteddataindexes={iamGroupAuthorizationSearch.selectedindexes!}
														updateselecteddataindexes={(value) => (iamGroupAuthorizationSearch.selectedindexes! = value)}
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
					{:else if createAbstractionsStep === 1}
						{#if storageFilesSearch.getdisplaydata}
							{#await storageFilesSearch.getdisplaydata()}
								{@render awaitloading()}
							{:then}
								<header role="tablist" class="tabs tabs-border w-full">
									<button role="tab" class="flex-1 tab{!uploadFiles ? ' tab-active' : ''}" onclick={() => (uploadFiles = false)}>
										<div class="indicator">
											{#if storageFilesSearch.selectedindexes!.length > 0}
												<span
													class="indicator-item badge {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
														? 'badge-primary'
														: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
															? 'badge-secondary'
															: 'badge-accent'}"
												>
													{storageFilesSearch.selectedindexes!.length}
												</span>
											{/if}
											<div class="pr-4">Pick File(s)</div>
										</div>
									</button>
									<button role="tab" class="flex-1 tab{uploadFiles ? ' tab-active' : ''}" onclick={() => (uploadFiles = true)}>
										<div class="indicator">
											{#if uploadedFiles.length > 0}
												<span
													class="indicator-item badge {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
														? 'badge-primary'
														: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
															? 'badge-secondary'
															: 'badge-accent'}"
												>
													{uploadedFiles.length}
												</span>
											{/if}
											<div class="pr-4">Upload File(s)</div>
										</div>
									</button>
								</header>

								{#if uploadFiles}
									<main class="flex w-full flex-1 self-center overflow-hidden p-2 md:max-w-[50%]">
										{#await import('$lib/components/CreateStorageFiles/Component.svelte') then { default: CreateStorageFiles }}
											<CreateStorageFiles
												theme={State.Theme.value}
												themecolor={State.ThemeColor.value}
												directorygroupid={data.directory_group_id}
												{telemetry}
												onuploadedfiles={(value) => {
													uploadedFiles = value
												}}
											></CreateStorageFiles>
										{/await}
									</main>
								{:else}
									<header class="z-[2] flex justify-center">
										{#await import('$lib/components/View/StorageFiles/SearchBar/Component.svelte') then { default: ViewStorageFilesSearchBar }}
											<div class="max-md:w-full md:w-[60%]">
												<ViewStorageFilesSearchBar
													metadatamodel={storageFilesSearch.searchmetadatamodel}
													themecolor={State.ThemeColor.value}
													theme={State.Theme.value}
													{telemetry}
													querycondition={storageFilesSearch.quicksearchquerycondition}
													updatequerycondition={(value) => {
														storageFilesSearch.quicksearchquerycondition = value
													}}
													showquerypanel={() => {
														storageFilesSearch.showquerypanel = !storageFilesSearch.showquerypanel
													}}
													search={() => {
														if (storageFilesSearch.searchdata) {
															storageFilesSearch.searchdata()
														}
													}}
												></ViewStorageFilesSearchBar>
											</div>
										{/await}
									</header>

									<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
										{#if storageFilesSearch.showquerypanel}
											<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
												{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
													<QueryPanel
														themecolor={State.ThemeColor.value}
														theme={State.Theme.value}
														{telemetry}
														metadatamodel={storageFilesSearch.searchmetadatamodel}
														data={storageFilesSearch.searchresults!}
														queryconditions={storageFilesSearch.queryconditions}
														filterexcludeindexes={storageFilesSearch.filterexcludeindexes}
														updatefilterexcludeindexes={(value) => {
															storageFilesSearch.filterexcludeindexes = value
															State.Toast.Type = Domain.Entities.Toast.Type.INFO
															State.Toast.Message = `${storageFilesSearch.filterexcludeindexes.length} local results filtered out`
														}}
														updatemetadatamodel={(value: any) => {
															if (storageFilesSearch.updatemedataModel) {
																storageFilesSearch.updatemedataModel(value)
															}
														}}
														updatequeryconditions={(value) => {
															storageFilesSearch.queryconditions = value
														}}
														hidequerypanel={() => (storageFilesSearch.showquerypanel = false)}
													></QueryPanel>
												{/await}
											</section>
										{/if}

										{#if !storageFilesSearch.showquerypanel || windowWidth > 1000}
											<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
												<section class="z-[2] flex w-full">
													{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
														<div class="h-fit w-full flex-1 self-center">
															<ViewHeaderData
																title={'Files'}
																view={storageFilesSearch.view}
																themecolor={State.ThemeColor.value}
																theme={State.Theme.value}
																updateview={(value) => (storageFilesSearch.view = value)}
															></ViewHeaderData>
														</div>
													{/await}
												</section>

												<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
													{#await import('$lib/components/View/StorageFiles/Data/Component.svelte') then { default: ViewStorageFilesData }}
														<ViewStorageFilesData
															metadatamodel={storageFilesSearch.searchmetadatamodel}
															data={storageFilesSearch.searchresults!}
															themecolor={State.ThemeColor.value}
															theme={State.Theme.value}
															{telemetry}
															addclickcolumn={false}
															addselectcolumn={true}
															view={storageFilesSearch.view}
															updatemetadatamodel={(value: any) => {
																if (storageFilesSearch.updatemedataModel) {
																	storageFilesSearch.updatemedataModel(value)
																}
															}}
															filterexcludeindexes={storageFilesSearch.filterexcludeindexes}
															selecteddataindexes={storageFilesSearch.selectedindexes!}
															updateselecteddataindexes={(value) => (storageFilesSearch.selectedindexes! = value)}
															showviewfile={true}
														></ViewStorageFilesData>
													{/await}
												</section>
											</section>
										{/if}
									</main>
								{/if}
							{:catch e}
								{@render awaiterror(e)}
							{/await}
						{/if}
					{:else if createAbstractionsStep === 2}
						<div class="flex flex-1 justify-center">
							<div class="flex h-fit w-fit flex-col gap-y-16 self-center justify-self-center md:max-w-[60%]">
								<section
									class="flex flex-col overflow-hidden rounded-md {State.Theme.value === Domain.Entities.Theme.Theme.DARK
										? 'border-gray-900 bg-gray-700'
										: 'border-gray-300 bg-gray-100'} max-md:min-w-[80vw] md:min-w-[50vw]"
								>
									<header
										class="sticky top-0 z-[3] p-2 {State.Theme.value === Domain.Entities.Theme.Theme.DARK
											? 'border-gray-900 bg-gray-700'
											: 'border-gray-300 bg-gray-100'} flex justify-between"
									>
										<span class="self-center">Tags</span>

										<span class="gap-x-2">
											<button
												class="btn btn-md btn-circle tooltip tooltip-left self-center {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
													? 'btn-primary tooltip-primary'
													: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
														? 'btn-secondary tooltip-secondary'
														: 'btn-accent tooltip-accent'}"
												aria-label="Reset Tags"
												data-tip="Reset tags"
												onclick={() => {
													createTags = []
												}}
											>
												<!--mdi:delete source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
													<path
														fill="var({Utils.Theme.GetColorContent(State.ThemeColor.value)})"
														d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"
													/>
												</svg>
											</button>

											<button
												class="btn btn-md btn-circle tooltip tooltip-left self-center {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
													? 'btn-primary tooltip-primary'
													: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
														? 'btn-secondary tooltip-secondary'
														: 'btn-accent tooltip-accent'}"
												aria-label="Add New Tag"
												data-tip="Add new tag"
												onclick={() => {
													noOfTags += 1
												}}
											>
												<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
													<path fill="var({Utils.Theme.GetColorContent(State.ThemeColor.value)})" d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" />
												</svg>
											</button>
										</span>
									</header>

									<main class="z-[1] flex flex-col gap-y-2 p-2">
										{#each Utils.Range(tagsStart, Utils.RangeArrayEnd(tagsEnd, noOfTags)) as tgsIndex (tgsIndex)}
											<label
												class="input w-full {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
													? 'input-primary'
													: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
														? 'input-secondary'
														: 'input-accent'}"
											>
												<span class="label">{tgsIndex + 1}</span>

												<input
													placeholder="Enter tag value..."
													type="text"
													value={createTags[tgsIndex]}
													oninput={(event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
														updateTags(tgsIndex, event.currentTarget.value)
													}}
												/>

												<span class="label">
													<button
														class="btn btn-md btn-ghost"
														aria-label="Delete tag {tgsIndex}"
														onclick={() => {
															deleteTags(tgsIndex)
															if (tgsIndex > createTags.length - 1) {
																noOfTags -= 1
															}
														}}
													>
														<!--mdi:delete source: https://icon-sets.iconify.design-->
														<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
															<path
																fill="var({Utils.Theme.GetColor(State.ThemeColor.value)})"
																d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"
															/>
														</svg>
													</button>
												</span>
											</label>
										{/each}
									</main>

									<footer
										class="sticky bottom-0 z-[2] flex w-full justify-center {State.Theme.value === Domain.Entities.Theme.Theme.DARK
											? 'border-gray-900 bg-gray-700'
											: 'border-gray-300 bg-gray-100'} p-2"
									>
										<Component.Pagination
											themecolor={State.ThemeColor.value}
											lengthofdata={noOfTags}
											start={tagsStart}
											end={tagsEnd}
											updatestart={(n: number) => (tagsStart = n)}
											updateend={(n: number) => (tagsEnd = n)}
											contentperpage={5}
											displayiflengthofdatagreaterthancontentperpage={true}
										></Component.Pagination>
									</footer>
								</section>

								<button
									class="btn btn-lg {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
										? 'btn-primary'
										: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
											? 'btn-secondary'
											: 'btn-accent'} self-center md:max-w-[40%]"
									aria-label="Create Group Rule Authorizations"
									onclick={handleCreateAbstractions}
									disabled={!createAbstractionsDataValid}
								>
									Create Abstraction(s)
								</button>
							</div>
						</div>
					{/if}
				</main>
			{:else if showUpdateDirectoryID}
				<header class="z-[3] flex flex-col gap-y-1">
					<section class="flex gap-x-1">
						<button
							class="btn btn-ghost btn-circle btn-md flex self-center"
							aria-label="Close Reassign Abstractions"
							onclick={() => {
								showUpdateDirectoryID = false
							}}
						>
							<!--mdi:arrow-back source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path fill="var({Utils.Theme.GetColor(State.ThemeColor.value)})" d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z" />
							</svg>
						</button>
						<span class="self-center"> Reassign Abstraction(s) </span>
					</section>
				</header>

				{#await import('$lib/components/Administration/AbstractionsReassign/Components.svelte') then { default: AdministrationAbstractionsReassign }}
					<AdministrationAbstractionsReassign
						theme={State.Theme.value}
						themecolor={State.ThemeColor.value}
						{telemetry}
						directorygroupid={data.directory_group_id}
					></AdministrationAbstractionsReassign>
				{/await}
			{:else}
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
								updateviewdatasearch={(value) =>  abstractionsSearch.viewdatasearch = value}
							></ViewAbstractionsSearchBar>
						</div>
					{/await}

					<section class="flex gap-x-6">
						<button
							class="btn btn-md btn-circle tooltip tooltip-left self-center {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
								? 'btn-primary tooltip-primary'
								: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
									? 'btn-secondary tooltip-secondary'
									: 'btn-accent tooltip-accent'}"
							aria-label="Reassign abstraction(s)"
							data-tip="Reassign abstraction(s)"
							onclick={() => (showUpdateDirectoryID = true)}
						>
							<!--mdi:assignment-ind source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path
									fill="var({Utils.Theme.GetColorContent(State.ThemeColor.value)})"
									d="M18 19H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1M12 7a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-4a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m7 0h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"
								/>
							</svg>
						</button>

						<button
							class="btn btn-md btn-circle tooltip tooltip-left self-center {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
								? 'btn-primary tooltip-primary'
								: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
									? 'btn-secondary tooltip-secondary'
									: 'btn-accent tooltip-accent'}"
							aria-label="Create New abstraction(s)"
							data-tip="Create new abstraction(s)"
							onclick={() => (showCreateNewAbstractions = true)}
						>
							<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path fill="var({Utils.Theme.GetColorContent(State.ThemeColor.value)})" d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" />
							</svg>
						</button>
					</section>
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
							{#if abstractionsSearch.searchresults!.length > 0}
								<section class="z-[2] flex w-full">
									{#if abstractionsSearch.selectedindexes!.length > 0}
										<div class="flex flex-col p-2">
											<button
												class="btn btn-md {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
													? 'btn-primary'
													: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
														? 'btn-secondary'
														: 'btn-accent'} justify-start gap-x-1"
												aria-label="Selected Rows Actions"
												onclick={() => (showSelectedActions = !showSelectedActions)}
											>
												<!--mdi:menu source: https://icon-sets.iconify.design-->
												<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
													<path fill="var({Utils.Theme.GetColorContent(State.ThemeColor.value)})" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
												</svg>
												<span class="self-center">{abstractionsSearch.selectedindexes!.length} selected</span>
											</button>

											{#if showSelectedActions}
												<div class="relative w-full">
													<div
														class="absolute w-full {State.Theme.value === Domain.Entities.Theme.Theme.DARK
															? 'bg-base-200'
															: 'bg-white'} flex min-w-[250px] flex-col gap-2 rounded-lg p-2 shadow-md shadow-gray-800"
													>
														<button
															class="btn btn-ghost btm-sm tooltip tooltip-right tooltip-primary justify-start"
															onclick={deleteDeactivatesSelectedAbstractions}
															data-tip="Deactivating abstraction(s) may prevent them from being used in other parts of the platform."
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
											<ViewHeaderData
												title={'Abstractions'}
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
											view={abstractionsSearch.view}
											updatemetadatamodel={(value: any) => {
												if (abstractionsSearch.updatemedataModel) {
													abstractionsSearch.updatemedataModel(value)
												}
											}}
											filterexcludeindexes={abstractionsSearch.filterexcludeindexes}
											selecteddataindexes={abstractionsSearch.selectedindexes}
											updateselecteddataindexes={(value) => (abstractionsSearch.selectedindexes = value)}
											rowclick={(value) => {
												const abstraction: Domain.Entities.Abstractions.Interface = value
												if (Array.isArray(abstraction.id) && abstraction.id.length > 0) {
													goto(
														State.GetGroupNavigationPath(
															`${Domain.Entities.Url.WebsitePaths.Abstractions}/${abstraction.id[0]}`,
															data.directory_group_id
														)
													)
												}
											}}
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
			{/if}
		{:catch e}
			{@render awaiterror(e)}
		{/await}
	{/if}
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

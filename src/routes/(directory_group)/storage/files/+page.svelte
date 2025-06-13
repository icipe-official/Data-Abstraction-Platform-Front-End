<script lang="ts">
	import { Domain, State, Component, Interfaces, MetadataModel, Utils } from '$lib'
	import { getContext, onMount, untrack } from 'svelte'
	import type { PageProps } from './$types'
	import { goto } from '$app/navigation'

	const COMPONENT_NAME = 'storage-files-page'

	let { data }: PageProps = $props()

	let telemetry: Domain.Interfaces.ITelemetry | undefined = $derived.by(() => {
		return getContext(State.TelemetryContext.value)
	})

	let windowWidth: number = $state(0)

	let authContextDirectoryGroupID = $derived(data.directory_group_id)

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

	let showSelectedActions: boolean = $state(false)

	async function deleteDeactivatesSelectedStorageFiles() {
		const sdata = storageFilesSearch.selectedindexes!.map((dIndex) => storageFilesSearch.searchresults![dIndex])

		if (sdata.length === 0 || !data.directory_group_id) {
			return
		}

		State.Loading.value = `Deleting/Deactivating ${Domain.Entities.StorageFiles.RepositoryName}`
		try {
			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Storage.Files}/${Domain.Entities.Url.Action.DELETE}`)
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
				storageFilesSearch.selectedindexes! = []
				showSelectedActions = false
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Delete/Deactivate ${Domain.Entities.StorageFiles.RepositoryName} failed`
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

	let showUploadFilesDialog: boolean = $state(false)
	let uploadFilesDialogElement: HTMLDialogElement
	$effect(() => {
		if (showUploadFilesDialog) {
			untrack(() => uploadFilesDialogElement.showModal())
		} else {
			untrack(() => uploadFilesDialogElement.close())
		}
	})
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div
	class="flex flex-1 flex-col gap-y-2 overflow-hidden rounded-lg p-2 shadow-md shadow-gray-800 {State.Theme.value === Domain.Entities.Theme.Theme.DARK
		? 'bg-base-300'
		: 'bg-white'} mb-1"
>
	{#if storageFilesSearch.getdisplaydata}
		{#await storageFilesSearch.getdisplaydata()}
			{@render awaitloading()}
		{:then}
			<header class="z-[2] flex justify-between gap-x-2">
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

				<button
					class="btn btn-md btn-circle tooltip tooltip-left self-center {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary tooltip-primary'
						: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary tooltip-secondary'
							: 'btn-accent tooltip-accent'}"
					aria-label="Upload New file(s)"
					data-tip="Upload new file(s)"
					onclick={() => {
						showUploadFilesDialog = true
					}}
				>
					<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path fill="var({Utils.Theme.GetColorContent(State.ThemeColor.value)})" d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" />
					</svg>
				</button>
			</header>

			<div class="divider mb-0 mt-0"></div>

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
						{#if storageFilesSearch.searchresults!.length > 0}
							<section class="z-[2] flex w-full">
								{#if storageFilesSearch.selectedindexes!.length > 0}
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
											<span class="self-center">{storageFilesSearch.selectedindexes!.length} selected</span>
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
														onclick={deleteDeactivatesSelectedStorageFiles}
														data-tip="Deactivating file(s) may prevent them from being used in other parts of the platform."
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
										rowclick={(value) => {
											const metadataModel: Domain.Entities.StorageFiles.Interface = value
											if (Array.isArray(metadataModel.id) && metadataModel.id.length > 0) {
												goto(
													State.GetGroupNavigationPath(
														`${Domain.Entities.Url.WebsitePaths.StorageFiles}/${metadataModel.id[0]}`,
														data.directory_group_id
													)
												)
											}
										}}
										showviewfile={true}
									></ViewStorageFilesData>
								{/await}
							</section>
						{:else}
							<div
								class="flex flex-1 justify-center rounded-md p-2 {State.Theme.value === Domain.Entities.Theme.Theme.DARK
									? 'bg-gray-700'
									: 'bg-gray-200'}"
							>
								<span class="flex self-center text-lg"> Upload, update, and delete files within the platform. </span>
							</div>
						{/if}
					</section>
				{/if}
			</main>
		{:catch e}
			{@render awaiterror(e)}
		{/await}
	{/if}
</div>

<dialog bind:this={uploadFilesDialogElement} id="upload-files-dialog" class="modal">
	<div class="modal-box flex max-h-[90vh] w-fit flex-col overflow-hidden rounded p-0 max-md:min-w-[90%] md:min-w-[700px] md:max-w-[800px]">
		<header class="sticky left-0 right-0 top-0 mb-1 flex flex-[1] items-center justify-between p-2 shadow-sm shadow-gray-800">
			<div
				class="flex h-fit w-fit gap-x-1 {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
					? 'text-primary'
					: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
						? 'text-secondary'
						: 'text-accent'}"
			>
				Upload File(s)
			</div>
			<button
				class="btn btn-circle btn-ghost"
				onclick={() => {
					showUploadFilesDialog = false
				}}
			>
				<!--mdi:close-circle source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path
						fill="var({Utils.Theme.GetColor(State.ThemeColor.value)})"
						d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"
					/>
				</svg>
			</button>
		</header>

		<main class="flex flex-1 overflow-hidden p-2">
			{#await import('$lib/components/CreateStorageFiles/Component.svelte') then { default: CreateStorageFiles }}
				<CreateStorageFiles
					theme={State.Theme.value}
					themecolor={State.ThemeColor.value}
					directorygroupid={data.directory_group_id}
					{telemetry}
					onuploadedfiles={(value) => {
						if (value.length > 0 && storageFilesSearch.searchdata) {
							storageFilesSearch.searchdata()
						}
					}}
				></CreateStorageFiles>
			{/await}
		</main>
	</div>
</dialog>

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

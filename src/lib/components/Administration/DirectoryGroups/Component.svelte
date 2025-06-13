<script lang="ts">
	import { Component, Domain, Interfaces, MetadataModel, State, Utils } from '$lib'
	import { untrack } from 'svelte'

	const COMPONENT_NAME = 'administration-directory-groups'

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

	let windowWidth: number = $state(0)

	let showSelectedActions: boolean = $state(false)

	async function deleteDeactivateSelectedDirectoryGroups() {
		if (!Array.isArray(directoryGroupsSearch.selectedindexes) || !Array.isArray(directoryGroupsSearch.searchresults)) {
			return
		}

		const data = directoryGroupsSearch.selectedindexes.map((dIndex) => directoryGroupsSearch.searchresults![dIndex])

		if (data.length === 0 || !directorygroupid) {
			return
		}

		State.Loading.value = `Deleting/Deactivating ${Domain.Entities.DirectoryGroups.RepositoryName}`
		try {
			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Directory.Groups}/${Domain.Entities.Url.Action.DELETE}`)
			fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID, directorygroupid)
			if (authContextDirectoryGroupID) {
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, authContextDirectoryGroupID)
			}
			if (State.VerboseResponse.value) {
				fetchUrl.searchParams.append(Domain.Entities.Url.SearchParams.VERBOSE_RESPONSE, `${true}`)
			}

			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.DEBUG, State.Loading.value, 'fetchUrl', fetchUrl, 'data', data)

			const fetchResponse = await fetch(fetchUrl, {
				method: 'POST',
				credentials: 'include',
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
				directoryGroupsSearch.selectedindexes = []
				showSelectedActions = false
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Delete/Deactivate ${Domain.Entities.DirectoryGroups.RepositoryName} failed`
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

	let selectedDirectoryGroup: number | undefined = $state(undefined)
	$effect(() => {
		if (typeof selectedDirectoryGroup === 'number') {
			selectedDirectoryGroupDialogElement.showModal()
		}
	})

	let selectedDirectoryGroupDialogElement: HTMLDialogElement
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex flex-1 flex-col gap-y-2 overflow-hidden">
	{#if directoryGroupsSearch.getdisplaydata}
		{#await directoryGroupsSearch.getdisplaydata()}
			<div class="flex h-full w-full flex-[9.5] justify-center">
				<span class="self-center">
					<span class="loading text-primary loading-ball loading-md"></span>
					<span class="loading text-secondary loading-ball loading-lg"></span>
					<span class="loading text-accent loading-ball loading-xl"></span>
				</span>
			</div>
		{:then}
			<header class="z-[2] flex justify-between gap-x-2">
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

				<button
					class="btn btn-md btn-circle tooltip tooltip-left self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary tooltip-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary tooltip-secondary'
							: 'btn-accent tooltip-accent'}"
					aria-label="Create New group"
					data-tip="Create new group"
					onclick={() => {
						selectedDirectoryGroup = -1
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
					{#if Array.isArray(directoryGroupsSearch.searchresults) && directoryGroupsSearch.searchresults.length > 0}
						<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
							<section class="z-[2] flex w-full">
								{#if directoryGroupsSearch.selectedindexes!.length > 0}
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
											<span class="self-center">{directoryGroupsSearch.selectedindexes!.length} selected</span>
										</button>

										{#if showSelectedActions}
											<div class="relative w-full">
												<div
													class="absolute w-full {theme === Domain.Entities.Theme.Theme.DARK
														? 'bg-base-200'
														: 'bg-white'} flex min-w-[250px] flex-col gap-2 rounded-lg p-2 shadow-md shadow-gray-800"
												>
													<button class="btn btn-ghost btm-sm justify-start" onclick={deleteDeactivateSelectedDirectoryGroups}>
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
											title={'Groups'}
											view={directoryGroupsSearch.view}
											{themecolor}
											{theme}
											updateview={(value) => (directoryGroupsSearch.view = value)}
										></ViewHeaderData>
									</div>
								{/await}
							</section>

							{#await import('$lib/components/View/DirectoryGroups/Data/Component.svelte') then { default: ViewDirectoryGroupsData }}
								<ViewDirectoryGroupsData
									metadatamodel={directoryGroupsSearch.searchmetadatamodel}
									data={directoryGroupsSearch.searchresults}
									{themecolor}
									{theme}
									{telemetry}
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
									rowclick={(_, index) => (selectedDirectoryGroup = index)}
									addlaunchgroup={true}
								></ViewDirectoryGroupsData>
							{/await}
						</section>
					{:else}
						<div class="flex flex-1 justify-center rounded-md p-2 {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-700' : 'bg-gray-200'}">
							<span class="flex self-center text-lg"> View and manage groups. </span>
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
	{/if}
</div>

<dialog bind:this={selectedDirectoryGroupDialogElement} id="selected-directory-group-dialog" class="modal">
	<div class="modal-box flex max-h-[90vh] w-fit flex-col overflow-hidden rounded p-0 max-md:min-w-[90%] md:min-w-[700px] md:max-w-[800px]">
		{#if typeof selectedDirectoryGroup === 'number'}
			<header class="sticky left-0 right-0 top-0 mb-1 flex flex-[1] items-center justify-between p-2 shadow-sm shadow-gray-800">
				<div
					class="flex h-fit w-fit gap-x-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'text-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'text-secondary'
							: 'text-accent'}"
				>
					{selectedDirectoryGroup < 0 ? 'Create New' : 'Edit'} Group
				</div>
				<button
					class="btn btn-circle btn-ghost"
					onclick={() => {
						selectedDirectoryGroup = undefined
						selectedDirectoryGroupDialogElement.close()
						if (directoryGroupsSearch.searchdata) {
							directoryGroupsSearch.searchdata()
						}
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
						metadatamodel={selectedDirectoryGroup > -1 && directoryGroupsSearch.searchmetadatamodel}
						datum={selectedDirectoryGroup > -1 && directoryGroupsSearch.searchresults![selectedDirectoryGroup]}
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

<script lang="ts">
	import { Domain, State, Component, Interfaces, MetadataModel, Utils } from '$lib'
	import { getContext, onMount, untrack } from 'svelte'
	import type { PageProps } from './$types'
	import { goto } from '$app/navigation'

	const COMPONENT_NAME = 'metadata-models-page'

	let { data }: PageProps = $props()

	let telemetry: Domain.Interfaces.ITelemetry | undefined = $derived.by(() => {
		return getContext(State.TelemetryContext.value)
	})

	let windowWidth: number = $state(0)

	let authContextDirectoryGroupID = $derived(data.directory_group_id)

	let metadataModelsSearch = $state(Interfaces.MetadataModels.NewViewSearch())
	$effect(() => {
		if (
			State.Session.session?.iam_credential &&
			Array.isArray(State.Session.session.iam_credential.id) &&
			State.Session.session.iam_credential.id.length > 0
		) {
			untrack(() => {
				metadataModelsSearch.authcontextdirectorygroupid = authContextDirectoryGroupID
				metadataModelsSearch.context = COMPONENT_NAME
				metadataModelsSearch.telemetry = telemetry
			})
		}
	})

	let showSelectedActions: boolean = $state(false)

	async function deleteDeactivatesSelectedMetadataModels() {
		const sdata = metadataModelsSearch.selectedindexes!.map((dIndex) => metadataModelsSearch.searchresults![dIndex])

		if (sdata.length === 0 || !data.directory_group_id) {
			return
		}

		State.Loading.value = `Deleting/Deactivating ${Domain.Entities.MetadataModels.RepositoryName}`
		try {
			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.MetadataModels.Url}/${Domain.Entities.Url.Action.DELETE}`)
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
				metadataModelsSearch.selectedindexes! = []
				showSelectedActions = false
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Delete/Deactivate ${Domain.Entities.MetadataModels.RepositoryName} failed`
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

<div
	class="flex flex-1 flex-col gap-y-2 overflow-hidden rounded-lg p-2 shadow-md shadow-gray-800 {State.Theme.value === Domain.Entities.Theme.Theme.DARK
		? 'bg-base-300'
		: 'bg-white'} mb-1"
>
	{#if metadataModelsSearch.getdisplaydata}
		{#await metadataModelsSearch.getdisplaydata()}
			{@render awaitloading()}
		{:then}
			<header class="z-[2] flex justify-between gap-x-2">
				{#await import('$lib/components/View/MetadataModels/SearchBar/Component.svelte') then { default: ViewMetadataModelsSearchBar }}
					<div class="max-md:w-full md:w-[60%]">
						<ViewMetadataModelsSearchBar
							metadatamodel={metadataModelsSearch.searchmetadatamodel}
							themecolor={State.ThemeColor.value}
							theme={State.Theme.value}
							{telemetry}
							querycondition={metadataModelsSearch.quicksearchquerycondition}
							updatequerycondition={(value) => {
								metadataModelsSearch.quicksearchquerycondition = value
							}}
							showquerypanel={() => {
								metadataModelsSearch.showquerypanel = !metadataModelsSearch.showquerypanel
							}}
							search={() => {
								if (metadataModelsSearch.searchdata) {
									metadataModelsSearch.searchdata()
								}
							}}
						></ViewMetadataModelsSearchBar>
					</div>
				{/await}

				<a
					class="btn btn-md btn-circle tooltip tooltip-left self-center {State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary tooltip-primary'
						: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary tooltip-secondary'
							: 'btn-accent tooltip-accent'}"
					aria-label="Create New metadata model"
					data-tip="Create new metadata model"
					href={State.GetGroupNavigationPath(`${Domain.Entities.Url.WebsitePaths.MetadataModels}/new`, data.directory_group_id)}
				>
					<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path fill="var({Utils.Theme.GetColorContent(State.ThemeColor.value)})" d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" />
					</svg>
				</a>
			</header>

			<div class="divider mb-0 mt-0"></div>

			<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
				{#if metadataModelsSearch.showquerypanel}
					<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
						{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
							<QueryPanel
								themecolor={State.ThemeColor.value}
								theme={State.Theme.value}
								{telemetry}
								metadatamodel={metadataModelsSearch.searchmetadatamodel}
								data={metadataModelsSearch.searchresults!}
								queryconditions={metadataModelsSearch.queryconditions}
								filterexcludeindexes={metadataModelsSearch.filterexcludeindexes}
								updatefilterexcludeindexes={(value) => {
									metadataModelsSearch.filterexcludeindexes = value
									State.Toast.Type = Domain.Entities.Toast.Type.INFO
									State.Toast.Message = `${metadataModelsSearch.filterexcludeindexes.length} local results filtered out`
								}}
								updatemetadatamodel={(value: any) => {
									if (metadataModelsSearch.updatemedataModel) {
										metadataModelsSearch.updatemedataModel(value)
									}
								}}
								updatequeryconditions={(value) => {
									metadataModelsSearch.queryconditions = value
								}}
								hidequerypanel={() => (metadataModelsSearch.showquerypanel = false)}
							></QueryPanel>
						{/await}
					</section>
				{/if}

				{#if !metadataModelsSearch.showquerypanel || windowWidth > 1000}
					<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
						{#if metadataModelsSearch.searchresults!.length > 0}
							<section class="z-[2] flex w-full">
								{#if metadataModelsSearch.selectedindexes!.length > 0}
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
											<span class="self-center">{metadataModelsSearch.selectedindexes!.length} selected</span>
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
														onclick={deleteDeactivatesSelectedMetadataModels}
														data-tip="Deactivating metadata model(s) may prevent them from being used in other parts of the platform."
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
											title={'Metadata Models'}
											view={metadataModelsSearch.view}
											themecolor={State.ThemeColor.value}
											theme={State.Theme.value}
											updateview={(value) => (metadataModelsSearch.view = value)}
										></ViewHeaderData>
									</div>
								{/await}
							</section>

							<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
								{#await import('$lib/components/View/MetadataModels/Data/Component.svelte') then { default: ViewMetadataModelsData }}
									<ViewMetadataModelsData
										metadatamodel={metadataModelsSearch.searchmetadatamodel}
										data={metadataModelsSearch.searchresults!}
										themecolor={State.ThemeColor.value}
										theme={State.Theme.value}
										{telemetry}
										addselectcolumn={true}
										view={metadataModelsSearch.view}
										updatemetadatamodel={(value: any) => {
											if (metadataModelsSearch.updatemedataModel) {
												metadataModelsSearch.updatemedataModel(value)
											}
										}}
										filterexcludeindexes={metadataModelsSearch.filterexcludeindexes}
										selecteddataindexes={metadataModelsSearch.selectedindexes!}
										updateselecteddataindexes={(value) => (metadataModelsSearch.selectedindexes! = value)}
										rowclick={(value) => {
											const metadataModel: Domain.Entities.MetadataModels.Interface = value
											if (Array.isArray(metadataModel.id) && metadataModel.id.length > 0) {
												goto(
													State.GetGroupNavigationPath(
														`${Domain.Entities.Url.WebsitePaths.MetadataModels}/${metadataModel.id[0]}`,
														data.directory_group_id
													)
												)
											}
										}}
									></ViewMetadataModelsData>
								{/await}
							</section>
						{:else}
							<div
								class="flex flex-1 justify-center rounded-md p-2 {State.Theme.value === Domain.Entities.Theme.Theme.DARK
									? 'bg-gray-700'
									: 'bg-gray-200'}"
							>
								<span class="flex self-center text-lg">
									Create, update, and delete information that forms the building blocks of incorporating unstructured data (JSON) within the platform.
								</span>
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

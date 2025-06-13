<script lang="ts">
	import { Component, Domain, Interfaces, MetadataModel, State, Utils } from '$lib'
	import { untrack } from 'svelte'

	const COMPONENT_NAME = 'administration-metadata-models-directory-groups'

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

	let metadataModelsDirectoryGroupsSearch = $state(Interfaces.MetadataModelsDirectoryGroups.NewViewSearch())
	$effect(() => {
		if (
			State.Session.session?.iam_credential &&
			Array.isArray(State.Session.session.iam_credential.id) &&
			State.Session.session.iam_credential.id.length > 0
		) {
			untrack(() => {
				metadataModelsDirectoryGroupsSearch.authcontextdirectorygroupid = authContextDirectoryGroupID
				metadataModelsDirectoryGroupsSearch.context = COMPONENT_NAME
				metadataModelsDirectoryGroupsSearch.telemetry = telemetry
			})
		}
	})

	let windowWidth: number = $state(0)

	let showSelectedActions: boolean = $state(false)

	async function deleteMetadataModelsDirectoryGroups() {
		const data = metadataModelsDirectoryGroupsSearch.selectedindexes!.map((dIndex) => metadataModelsDirectoryGroupsSearch.searchresults![dIndex])

		if (data.length === 0 || !directorygroupid) {
			return
		}

		State.Loading.value = `Deleting ${Domain.Entities.MetadataModelsDirectoryGroups.RepositoryName}`
		try {
			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.MetadataModels.Directory.Groups}/${Domain.Entities.Url.Action.DELETE}`)
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
				metadataModelsDirectoryGroupsSearch.selectedindexes! = []
				showSelectedActions = false
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Delete ${Domain.Entities.MetadataModelsDirectoryGroups.RepositoryName} failed`
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

	let showCreateMetadataModelsDirectoryGroups: boolean = $state(false)

	let showEditMetadataModelsDirectoryGroups: boolean = $state(false)

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

	let createMetadataModelsDirectoryGroupsStep: number = $state(0)

	let createMetadataModelsDirectoryGroupsDataValid: boolean = $derived(
		metadataModelsSearch.selectedindexes!.length > 0 && directoryGroupsSearch.selectedindexes!.length > 0
	)
	async function handleCreateMetadataModelsDirectoryGroups() {
		if (!createMetadataModelsDirectoryGroupsDataValid || !directorygroupid) {
			return
		}

		let metadataModel: Domain.Entities.MetadataModels.Interface
		if (metadataModelsSearch.selectedindexes!.length > 0) {
			metadataModel = metadataModelsSearch.searchresults![metadataModelsSearch.selectedindexes![0]]
		} else {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = `${Domain.Entities.MetadataModels.RepositoryName} not selected`
			return
		}

		let directoryGroups: Domain.Entities.DirectoryGroups.Interface[] = []
		for (const dIndex of directoryGroupsSearch.selectedindexes!) {
			const d: Domain.Entities.DirectoryGroups.Interface = directoryGroupsSearch.searchresults![dIndex]
			if (Array.isArray(d.id) && d.id.length > 0) {
				directoryGroups.push({
					id: d.id
				})
			}
		}

		if (directoryGroups.length === 0) {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = `Chosen ${Domain.Entities.DirectoryGroups.RepositoryName} not valid`
			return
		}

		let newMetadataModelsDirectoryGroups: Domain.Entities.MetadataModelsDirectoryGroups.Interface[] = []
		for (const dg of directoryGroups) {
			newMetadataModelsDirectoryGroups.push({
				metadata_models_id: metadataModel.id,
				directory_groups_id: dg.id
			})
		}

		if (newMetadataModelsDirectoryGroups.length === 0) {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = `New ${Domain.Entities.MetadataModelsDirectoryGroups.RepositoryName} data not valid`
			return
		}

		State.Loading.value = `Creating ${Domain.Entities.MetadataModelsDirectoryGroups.RepositoryName}`
		try {
			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.MetadataModels.Directory.Groups}/${Domain.Entities.Url.Action.CREATE}`)
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
				newMetadataModelsDirectoryGroups
			)

			const fetchResponse = await fetch(fetchUrl, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify(newMetadataModelsDirectoryGroups)
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
				directoryGroupsSearch.selectedindexes! = []
				metadataModelsSearch.selectedindexes! = []
				showSelectedActions = false
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Create ${Domain.Entities.MetadataModelsDirectoryGroups.RepositoryName} failed`
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
			handleError(e, ERROR)
		} finally {
			State.Loading.value = undefined
		}
	}

	let updateMetadataModelsDirectoryGroupsStep: number = $state(0)

	let updateMetadataModelsDirectoryGroupsDataValid: boolean = $derived(
		metadataModelsSearch.selectedindexes!.length > 0 && metadataModelsDirectoryGroupsSearch.selectedindexes!.length > 0
	)
	async function handleUpdateMetadataModelsDirectoryGroups() {
		if (!updateMetadataModelsDirectoryGroupsDataValid || !directorygroupid) {
			return
		}

		let metadataModel: Domain.Entities.MetadataModels.Interface
		if (metadataModelsSearch.selectedindexes!.length > 0) {
			metadataModel = metadataModelsSearch.searchresults![metadataModelsSearch.selectedindexes![0]]
		} else {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = `${Domain.Entities.MetadataModels.RepositoryName} not selected`
			return
		}

		let newMetadataModelsDirectoryGroups: Domain.Entities.MetadataModelsDirectoryGroups.Interface[] =
			metadataModelsDirectoryGroupsSearch.selectedindexes!.map((smmdIndex) => {
				let d: Domain.Entities.MetadataModelsDirectoryGroups.Interface = metadataModelsDirectoryGroupsSearch.searchresults![smmdIndex]

				d.metadata_models_id = metadataModel.id

				return d
			})

		if (newMetadataModelsDirectoryGroups.length === 0) {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = `New ${Domain.Entities.MetadataModelsDirectoryGroups.RepositoryName} data not valid`
			return
		}

		State.Loading.value = `Updating ${Domain.Entities.MetadataModelsDirectoryGroups.RepositoryName}`
		try {
			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.MetadataModels.Directory.Groups}/${Domain.Entities.Url.Action.UPDATE}`)
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
				newMetadataModelsDirectoryGroups
			)

			const fetchResponse = await fetch(fetchUrl, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify(newMetadataModelsDirectoryGroups)
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
				metadataModelsDirectoryGroupsSearch.selectedindexes! = []
				metadataModelsSearch.selectedindexes! = []
				showSelectedActions = false
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Updating ${Domain.Entities.MetadataModelsDirectoryGroups.RepositoryName} failed`
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
			handleError(e, ERROR)
		} finally {
			State.Loading.value = undefined
		}
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex flex-1 flex-col gap-y-2 overflow-hidden">
	{#if metadataModelsDirectoryGroupsSearch.getdisplaydata}
		{#await metadataModelsDirectoryGroupsSearch.getdisplaydata()}
			<div class="flex h-full w-full flex-[9.5] justify-center">
				<span class="self-center">
					<span class="loading text-primary loading-ball loading-md"></span>
					<span class="loading text-secondary loading-ball loading-lg"></span>
					<span class="loading text-accent loading-ball loading-xl"></span>
				</span>
			</div>
		{:then}
			{#if showCreateMetadataModelsDirectoryGroups}
				<header class="z-[3] flex flex-col gap-y-1">
					<section class="flex gap-x-1">
						<button
							class="btn btn-ghost btn-circle btn-md flex self-center"
							aria-label="Close Create Metadata Models Directory"
							onclick={() => {
								showCreateMetadataModelsDirectoryGroups = false
							}}
						>
							<!--mdi:arrow-back source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path fill="var({Utils.Theme.GetColor(themecolor)})" d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z" />
							</svg>
						</button>
						<span class="self-center"> Setup metadata-model for directory group 'data' information for group(s)</span>
					</section>
				</header>

				<nav
					class="flex w-full justify-center rounded-lg p-2 {State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'bg-base-100' : 'bg-gray-100'}"
				>
					<div class="steps z-[2]">
						<li
							class="step {createMetadataModelsDirectoryGroupsStep >= 0
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
									createMetadataModelsDirectoryGroupsStep = 0
								}}
							>
								Pick Group(s)
							</button>
						</li>
						<li
							class="step {createMetadataModelsDirectoryGroupsStep >= 1
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
									createMetadataModelsDirectoryGroupsStep = 1
								}}
							>
								Pick Metadata Model
							</button>
						</li>
						<li
							class="step {createMetadataModelsDirectoryGroupsStep >= 2
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
									createMetadataModelsDirectoryGroupsStep = 2
								}}
							>
								Complete Setup
							</button>
						</li>
					</div>
				</nav>

				<main
					class="z-[1] flex flex-[9.5] flex-col gap-y-2 overflow-hidden {State.Theme.value === Domain.Entities.Theme.Theme.DARK
						? 'bg-base-100'
						: 'bg-gray-100'} rounded-lg p-2"
				>
					{#if createMetadataModelsDirectoryGroupsStep === 0}
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
													data={directoryGroupsSearch.searchresults!}
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
														data={directoryGroupsSearch.searchresults!}
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
														selecteddataindexes={directoryGroupsSearch.selectedindexes!}
														updateselecteddataindexes={(value) => (directoryGroupsSearch.selectedindexes! = value)}
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
					{:else if createMetadataModelsDirectoryGroupsStep === 1}
						{#if metadataModelsSearch.getdisplaydata}
							{#await metadataModelsSearch.getdisplaydata()}
								{@render awaitloading()}
							{:then}
								<header class="z-[2] flex justify-center">
									{#await import('$lib/components/View/MetadataModels/SearchBar/Component.svelte') then { default: ViewMetadataModelsSearchBar }}
										<div class="max-md:w-full md:w-[60%]">
											<ViewMetadataModelsSearchBar
												metadatamodel={metadataModelsSearch.searchmetadatamodel}
												{themecolor}
												{theme}
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
								</header>

								<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
									{#if metadataModelsSearch.showquerypanel}
										<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
											{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
												<QueryPanel
													{themecolor}
													{theme}
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
											<section class="z-[2] flex w-full">
												{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
													<div class="h-fit w-full flex-1 self-center">
														<ViewHeaderData
															title={'Metadata Models'}
															view={metadataModelsSearch.view}
															{themecolor}
															{theme}
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
														{themecolor}
														{theme}
														{telemetry}
														addclickcolumn={false}
														addselectcolumn={true}
														multiselectcolumns={false}
														view={metadataModelsSearch.view}
														updatemetadatamodel={(value: any) => {
															if (metadataModelsSearch.updatemedataModel) {
																metadataModelsSearch.updatemedataModel(value)
															}
														}}
														filterexcludeindexes={metadataModelsSearch.filterexcludeindexes}
														selecteddataindexes={metadataModelsSearch.selectedindexes!}
														updateselecteddataindexes={(value) => (metadataModelsSearch.selectedindexes! = value)}
													></ViewMetadataModelsData>
												{/await}
											</section>
										</section>
									{/if}
								</main>
							{:catch e}
								{@render awaiterror(e)}
							{/await}
						{/if}
					{:else if createMetadataModelsDirectoryGroupsStep === 2}
						<div class="flex flex-1 justify-center">
							<div class="flex h-fit w-fit flex-col gap-y-16 self-center justify-self-center md:max-w-[60%]">
								<button
									class="btn btn-lg {themecolor === Domain.Entities.Theme.Color.PRIMARY
										? 'btn-primary'
										: themecolor === Domain.Entities.Theme.Color.SECONDARY
											? 'btn-secondary'
											: 'btn-accent'} self-center md:max-w-[70%]"
									aria-label="Create Group Rule Authorizations"
									onclick={handleCreateMetadataModelsDirectoryGroups}
									disabled={!createMetadataModelsDirectoryGroupsDataValid}
								>
									Complete Setup
								</button>
							</div>
						</div>
					{/if}
				</main>
			{:else if showEditMetadataModelsDirectoryGroups}
				<header class="z-[3] flex flex-col gap-y-1">
					<section class="flex gap-x-1">
						<button
							class="btn btn-ghost btn-circle btn-md flex self-center"
							aria-label="Close Update Metadata Models Directory"
							onclick={() => {
								showEditMetadataModelsDirectoryGroups = false
							}}
						>
							<!--mdi:arrow-back source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path fill="var({Utils.Theme.GetColor(themecolor)})" d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z" />
							</svg>
						</button>
						<span class="self-center"> Update metadata-model for directory group 'data' information for group(s)</span>
					</section>
				</header>

				<nav
					class="flex w-full justify-center rounded-lg p-2 {State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'bg-base-100' : 'bg-gray-100'}"
				>
					<div class="steps z-[2]">
						<li
							class="step {updateMetadataModelsDirectoryGroupsStep >= 0
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
									updateMetadataModelsDirectoryGroupsStep = 0
								}}
							>
								Pick Metadata Model
							</button>
						</li>
						<li
							class="step {updateMetadataModelsDirectoryGroupsStep >= 1
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
									updateMetadataModelsDirectoryGroupsStep = 1
								}}
							>
								Update Metadata Model for select group(s)
							</button>
						</li>
					</div>
				</nav>

				<main
					class="z-[1] flex flex-[9.5] flex-col gap-y-2 overflow-hidden {State.Theme.value === Domain.Entities.Theme.Theme.DARK
						? 'bg-base-100'
						: 'bg-gray-100'} rounded-lg p-2"
				>
					{#if updateMetadataModelsDirectoryGroupsStep === 0}
						{#if metadataModelsSearch.getdisplaydata}
							{#await metadataModelsSearch.getdisplaydata()}
								{@render awaitloading()}
							{:then}
								<header class="z-[2] flex justify-center">
									{#await import('$lib/components/View/MetadataModels/SearchBar/Component.svelte') then { default: ViewMetadataModelsSearchBar }}
										<div class="max-md:w-full md:w-[60%]">
											<ViewMetadataModelsSearchBar
												metadatamodel={metadataModelsSearch.searchmetadatamodel}
												{themecolor}
												{theme}
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
								</header>

								<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
									{#if metadataModelsSearch.showquerypanel}
										<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
											{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
												<QueryPanel
													{themecolor}
													{theme}
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
											<section class="z-[2] flex w-full">
												{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
													<div class="h-fit w-full flex-1 self-center">
														<ViewHeaderData
															title={'Metadata Models'}
															view={metadataModelsSearch.view}
															{themecolor}
															{theme}
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
														{themecolor}
														{theme}
														{telemetry}
														addclickcolumn={false}
														addselectcolumn={true}
														multiselectcolumns={false}
														view={metadataModelsSearch.view}
														updatemetadatamodel={(value: any) => {
															if (metadataModelsSearch.updatemedataModel) {
																metadataModelsSearch.updatemedataModel(value)
															}
														}}
														filterexcludeindexes={metadataModelsSearch.filterexcludeindexes}
														selecteddataindexes={metadataModelsSearch.selectedindexes!}
														updateselecteddataindexes={(value) => (metadataModelsSearch.selectedindexes! = value)}
													></ViewMetadataModelsData>
												{/await}
											</section>
										</section>
									{/if}
								</main>
							{:catch e}
								{@render awaiterror(e)}
							{/await}
						{/if}
					{:else if updateMetadataModelsDirectoryGroupsStep === 1}
						<div class="flex flex-1 justify-center">
							<div class="flex h-fit w-fit flex-col gap-y-16 self-center justify-self-center md:max-w-[60%]">
								<button
									class="btn btn-lg {themecolor === Domain.Entities.Theme.Color.PRIMARY
										? 'btn-primary'
										: themecolor === Domain.Entities.Theme.Color.SECONDARY
											? 'btn-secondary'
											: 'btn-accent'} self-center"
									aria-label="Create Group Rule Authorizations"
									onclick={handleUpdateMetadataModelsDirectoryGroups}
									disabled={!updateMetadataModelsDirectoryGroupsDataValid}
								>
									Update Metadata Models
								</button>
							</div>
						</div>
					{/if}
				</main>
			{:else}
				<header class="z-[2] flex justify-between gap-x-2">
					{#await import('$lib/components/View/MetadataModelsDirectoryGroups/SearchBar/Component.svelte') then { default: ViewMetadataModelsDirectoryGroupsSearchBar }}
						<div class="max-md:w-full md:w-[60%]">
							<ViewMetadataModelsDirectoryGroupsSearchBar
								metadatamodel={metadataModelsDirectoryGroupsSearch.searchmetadatamodel}
								{themecolor}
								{theme}
								{telemetry}
								querycondition={metadataModelsDirectoryGroupsSearch.quicksearchquerycondition}
								updatequerycondition={(value) => {
									metadataModelsDirectoryGroupsSearch.quicksearchquerycondition = value
								}}
								showquerypanel={() => {
									metadataModelsDirectoryGroupsSearch.showquerypanel = !metadataModelsDirectoryGroupsSearch.showquerypanel
								}}
								search={() => {
									if (metadataModelsDirectoryGroupsSearch.searchdata) {
										metadataModelsDirectoryGroupsSearch.searchdata()
									}
								}}
							></ViewMetadataModelsDirectoryGroupsSearchBar>
						</div>
					{/await}

					<button
						class="btn btn-md btn-circle tooltip tooltip-left self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary tooltip-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary tooltip-secondary'
								: 'btn-accent tooltip-accent'}"
						aria-label="Setup metadata-models for directory group data in group(s)"
						data-tip="Setup metadata-models for directory group data in group(s)"
						onclick={() => {
							showCreateMetadataModelsDirectoryGroups = true
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
					{#if metadataModelsDirectoryGroupsSearch.showquerypanel}
						<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
							{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
								<QueryPanel
									{themecolor}
									{theme}
									{telemetry}
									metadatamodel={metadataModelsDirectoryGroupsSearch.searchmetadatamodel}
									data={metadataModelsDirectoryGroupsSearch.searchresults!}
									queryconditions={metadataModelsDirectoryGroupsSearch.queryconditions}
									filterexcludeindexes={metadataModelsDirectoryGroupsSearch.filterexcludeindexes}
									updatefilterexcludeindexes={(value) => {
										metadataModelsDirectoryGroupsSearch.filterexcludeindexes = value
										State.Toast.Type = Domain.Entities.Toast.Type.INFO
										State.Toast.Message = `${metadataModelsDirectoryGroupsSearch.filterexcludeindexes.length} local results filtered out`
									}}
									updatemetadatamodel={(value: any) => {
										if (metadataModelsDirectoryGroupsSearch.updatemedataModel) {
											metadataModelsDirectoryGroupsSearch.updatemedataModel(value)
										}
									}}
									updatequeryconditions={(value) => {
										metadataModelsDirectoryGroupsSearch.queryconditions = value
									}}
									hidequerypanel={() => (metadataModelsDirectoryGroupsSearch.showquerypanel = false)}
								></QueryPanel>
							{/await}
						</section>
					{/if}

					{#if !metadataModelsDirectoryGroupsSearch.showquerypanel || windowWidth > 1000}
						{#if metadataModelsDirectoryGroupsSearch.searchresults!.length > 0}
							<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
								<section class="z-[2] flex w-full">
									{#if metadataModelsDirectoryGroupsSearch.selectedindexes!.length > 0}
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
												<span class="self-center">{metadataModelsDirectoryGroupsSearch.selectedindexes!.length} selected</span>
											</button>

											{#if showSelectedActions}
												<div class="relative w-full">
													<div
														class="absolute w-full {theme === Domain.Entities.Theme.Theme.DARK
															? 'bg-base-200'
															: 'bg-white'} flex min-w-[250px] flex-col gap-2 rounded-lg p-2 shadow-md shadow-gray-800"
													>
														<button class="btn btn-ghost btm-sm justify-start" onclick={deleteMetadataModelsDirectoryGroups}> 1 - Delete </button>
														<button
															class="btn btn-ghost btm-sm tooltip tooltip-right {themecolor === Domain.Entities.Theme.Color.PRIMARY
																? 'tooltip-primary'
																: themecolor === Domain.Entities.Theme.Color.SECONDARY
																	? 'tooltip-secondary'
																	: 'tooltip-accent'} justify-start"
															onclick={() => (showEditMetadataModelsDirectoryGroups = true)}
															data-tip="Update linked metadata-model."
														>
															1 - Update metadata-model
														</button>
													</div>
												</div>
											{/if}
										</div>
									{/if}

									{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
										<div class="h-fit w-full flex-1 self-center">
											<ViewHeaderData
												title={'Metadata Models for Directory Information'}
												view={metadataModelsDirectoryGroupsSearch.view}
												{themecolor}
												{theme}
												updateview={(value) => (metadataModelsDirectoryGroupsSearch.view = value)}
											></ViewHeaderData>
										</div>
									{/await}
								</section>

								<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
									{#await import('$lib/components/View/MetadataModelsDirectoryGroups/Data/Component.svelte') then { default: ViewMetadataModelsDirectoryGroupsData }}
										<ViewMetadataModelsDirectoryGroupsData
											metadatamodel={metadataModelsDirectoryGroupsSearch.searchmetadatamodel}
											data={metadataModelsDirectoryGroupsSearch.searchresults!}
											{themecolor}
											{theme}
											{telemetry}
											addclickcolumn={false}
											addselectcolumn={true}
											selecteddataindexes={metadataModelsDirectoryGroupsSearch.selectedindexes!}
											updateselecteddataindexes={(value) => (metadataModelsDirectoryGroupsSearch.selectedindexes! = value)}
											view={metadataModelsDirectoryGroupsSearch.view}
											updatemetadatamodel={(value: any) => {
												if (metadataModelsDirectoryGroupsSearch.updatemedataModel) {
													metadataModelsDirectoryGroupsSearch.updatemedataModel(value)
												}
											}}
											filterexcludeindexes={metadataModelsDirectoryGroupsSearch.filterexcludeindexes}
										></ViewMetadataModelsDirectoryGroupsData>
									{/await}
								</section>
							</section>
						{:else}
							<div class="flex flex-1 justify-center rounded-md p-2 {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-700' : 'bg-gray-200'}">
								<span class="flex self-center text-lg">
									Create and manage information used to set the metadata-model to be used to handle information in the 'data' column of the directory
									group.
								</span>
							</div>
						{/if}
					{/if}
				</main>
			{/if}
		{:catch e}
			{#await import('$lib/components/Error/Component.svelte') then { default: Error }}
				<div class="flex h-full w-full flex-[9.5] justify-center">
					<span class="self-center"><Error status={e[0]} message={e[1]} shadow={'inner'}></Error></span>
				</div>
			{/await}
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

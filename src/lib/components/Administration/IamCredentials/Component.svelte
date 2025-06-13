<script lang="ts">
	import { Component, Domain, Interfaces, State, Utils } from '$lib'
	import { untrack } from 'svelte'

	const COMPONENT_NAME = 'administration-iam-credentials'

	interface Props {
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		telemetry?: Domain.Interfaces.ITelemetry
		directoryIDContext?: string
		directoryGroupIDContext?: string
		directorygroupid?: string
	}

	let {
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		telemetry = undefined,
		directoryIDContext = undefined,
		directoryGroupIDContext = undefined,
		directorygroupid = undefined
	}: Props = $props()

	let authContextDirectoryGroupID = $derived(directorygroupid)

	let iamCredentialsSearch = $state(Interfaces.IamCredentials.NewViewSearch())
	$effect(() => {
		if (
			State.Session.session?.iam_credential &&
			Array.isArray(State.Session.session.iam_credential.id) &&
			State.Session.session.iam_credential.id.length > 0
		) {
			untrack(() => {
				iamCredentialsSearch.authcontextdirectorygroupid = authContextDirectoryGroupID
				iamCredentialsSearch.context = COMPONENT_NAME
				iamCredentialsSearch.telemetry = telemetry
				iamCredentialsSearch.directoryid = directoryIDContext
			})
		}
	})

	let showSelectedActions: boolean = $state(false)

	let windowWidth: number = $state(0)

	let showLinkDirectoryToIamCredentials: boolean = $state(false)

	async function deleteDeactivatesSelectedIamCredentials() {
		const data = iamCredentialsSearch.selectedindexes!.map((dIndex) => iamCredentialsSearch.searchresults![dIndex])

		if (data.length === 0 || !directorygroupid) {
			return
		}

		State.Loading.value = `Deleting/Deactivating ${Domain.Entities.IamCredentials.RepositoryName}`
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
				iamCredentialsSearch.selectedindexes! = []
				showSelectedActions = false
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Delete/Deactivate ${Domain.Entities.IamCredentials.RepositoryName} failed`
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

	let directorySearch = $state(Interfaces.Directory.NewViewSearch())
	$effect(() => {
		if (
			State.Session.session?.iam_credential &&
			Array.isArray(State.Session.session.iam_credential.id) &&
			State.Session.session.iam_credential.id.length > 0
		) {
			untrack(() => {
				directorySearch.authcontextdirectorygroupid = authContextDirectoryGroupID
				directorySearch.context = COMPONENT_NAME
				directorySearch.telemetry = telemetry
			})
		}
	})

	let createIamCredentialsStep: number = $state(0)

	let updateIamCredentialsDataValid: boolean = $derived(
		iamCredentialsSearch.selectedindexes!.length > 0 && (typeof directoryIDContext === 'string' || directorySearch.selectedindexes!.length > 0)
	)
	async function handleUpdateIamCredentialsDirectoryID() {
		if (!updateIamCredentialsDataValid || !directorygroupid) {
			return
		}

		let directory: Domain.Entities.Directory.Interface[] = []
		if (directoryGroupIDContext) {
			directory.push({ id: [directoryGroupIDContext] })
		} else {
			for (const dIndex of directorySearch.selectedindexes!) {
				const d: Domain.Entities.Directory.Interface = directorySearch.searchresults![dIndex]
				if (Array.isArray(d.id) && d.id.length > 0) {
					directory.push({
						id: d.id
					})
				}
			}
		}

		if (directory.length === 0) {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = `Chosen ${Domain.Entities.Directory.RepositoryName} not valid`
			return
		}

		let newIamCredentials: Domain.Entities.IamCredentials.Interface[] = []
		for (const d of directory) {
			for (const icIndex of iamCredentialsSearch.selectedindexes!) {
				const ic: Domain.Entities.IamCredentials.Interface = iamCredentialsSearch.searchresults![icIndex]
				if (Array.isArray(ic.id) && ic.id.length > 0) {
					newIamCredentials.push({
						directory_id: d.id,
						id: ic.id
					})
				}
			}
		}

		if (newIamCredentials.length === 0) {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = `New ${Domain.Entities.IamCredentials.RepositoryName} data not valid`
			return
		}

		State.Loading.value = `Linking ${Domain.Entities.Directory.RepositoryName} to ${Domain.Entities.IamCredentials.RepositoryName}`
		try {
			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Iam.Credentials}/${Domain.Entities.Url.Action.UPDATE}`)
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
				newIamCredentials
			)

			const fetchResponse = await fetch(fetchUrl, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify(newIamCredentials)
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
				directorySearch.selectedindexes! = []
				showSelectedActions = false
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Create ${Domain.Entities.IamCredentials.RepositoryName} failed`
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
			handleError(e, ERROR)
		} finally {
			State.Loading.value = undefined
		}
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex flex-1 flex-col gap-y-2 overflow-hidden">
	{#if iamCredentialsSearch.getdisplaydata}
		{#await iamCredentialsSearch.getdisplaydata()}
			{@render awaitloading()}
		{:then}
			{#if showLinkDirectoryToIamCredentials}
				<header class="z-[3] flex flex-col gap-y-1">
					<section class="flex gap-x-1">
						<button
							class="btn btn-ghost btn-circle btn-md flex self-center"
							aria-label="Close Link Iam Credentials to Directory"
							onclick={() => {
								showLinkDirectoryToIamCredentials = false
							}}
						>
							<!--mdi:arrow-back source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path fill="var({Utils.Theme.GetColor(themecolor)})" d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z" />
							</svg>
						</button>
						<span class="self-center"> Link Iam Credentials to Directory </span>
					</section>
				</header>

				<nav
					class="flex w-full justify-center rounded-lg p-2 {State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'bg-base-100' : 'bg-gray-100'}"
				>
					<div class="steps z-[2]">
						{#if !directoryIDContext}
							<li
								class="step {createIamCredentialsStep >= 0
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
										createIamCredentialsStep = 0
									}}
								>
									Pick Directory
								</button>
							</li>
						{/if}
						<li
							class="step {createIamCredentialsStep >= 1
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
									createIamCredentialsStep = 1
								}}
							>
								Update Iam Credentials(s)
							</button>
						</li>
					</div>
				</nav>

				<main
					class="z-[1] flex flex-[9.5] flex-col gap-y-2 overflow-hidden {State.Theme.value === Domain.Entities.Theme.Theme.DARK
						? 'bg-base-100'
						: 'bg-gray-100'} rounded-lg p-2"
				>
					{#if createIamCredentialsStep === 0}
						{#if directorySearch.getdisplaydata}
							{#await directorySearch.getdisplaydata()}
								{@render awaitloading()}
							{:then}
								<header class="z-[2] flex justify-center">
									{#await import('$lib/components/View/Directory/SearchBar/Component.svelte') then { default: ViewDirectorySearchBar }}
										<div class="max-md:w-full md:w-[60%]">
											<ViewDirectorySearchBar
												metadatamodel={directorySearch.searchmetadatamodel}
												{themecolor}
												{theme}
												{telemetry}
												querycondition={directorySearch.quicksearchquerycondition}
												updatequerycondition={(value) => {
													directorySearch.quicksearchquerycondition = value
												}}
												showquerypanel={() => {
													directorySearch.showquerypanel = !directorySearch.showquerypanel
												}}
												search={() => {
													if (directorySearch.searchdata) {
														directorySearch.searchdata()
													}
												}}
											></ViewDirectorySearchBar>
										</div>
									{/await}
								</header>

								<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
									{#if directorySearch.showquerypanel}
										<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
											{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
												<QueryPanel
													{themecolor}
													{theme}
													{telemetry}
													metadatamodel={directorySearch.searchmetadatamodel}
													data={directorySearch.searchresults!}
													queryconditions={directorySearch.queryconditions}
													filterexcludeindexes={directorySearch.filterexcludeindexes}
													updatefilterexcludeindexes={(value) => {
														directorySearch.filterexcludeindexes = value
														State.Toast.Type = Domain.Entities.Toast.Type.INFO
														State.Toast.Message = `${directorySearch.filterexcludeindexes.length} local results filtered out`
													}}
													updatemetadatamodel={(value: any) => {
														if (directorySearch.updatemedataModel) {
															directorySearch.updatemedataModel(value)
														}
													}}
													updatequeryconditions={(value) => {
														directorySearch.queryconditions = value
													}}
													hidequerypanel={() => (directorySearch.showquerypanel = false)}
												></QueryPanel>
											{/await}
										</section>
									{/if}

									{#if !directorySearch.showquerypanel || windowWidth > 1000}
										<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
											<section class="z-[2] flex w-full">
												{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
													<div class="h-fit w-full flex-1 self-center">
														<ViewHeaderData
															title={'Directory'}
															view={directorySearch.view}
															{themecolor}
															{theme}
															updateview={(value) => (directorySearch.view = value)}
														></ViewHeaderData>
													</div>
												{/await}
											</section>

											<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
												{#await import('$lib/components/View/Directory/Data/Component.svelte') then { default: ViewDirectoryData }}
													<ViewDirectoryData
														metadatamodel={directorySearch.searchmetadatamodel}
														data={directorySearch.searchresults!}
														{themecolor}
														{theme}
														{telemetry}
														addclickcolumn={false}
														addselectcolumn={true}
														view={directorySearch.view}
														updatemetadatamodel={(value: any) => {
															if (directorySearch.updatemedataModel) {
																directorySearch.updatemedataModel(value)
															}
														}}
														filterexcludeindexes={directorySearch.filterexcludeindexes}
														selecteddataindexes={directorySearch.selectedindexes!}
														updateselecteddataindexes={(value) => (directorySearch.selectedindexes! = value)}
													></ViewDirectoryData>
												{/await}
											</section>
										</section>
									{/if}
								</main>
							{:catch e}
								{@render awaiterror(e)}
							{/await}
						{/if}
					{:else if createIamCredentialsStep === 1}
						<div class="flex flex-1 justify-center">
							<div class="flex h-fit w-fit flex-col gap-y-16 self-center justify-self-center md:max-w-[60%]">
								<div class="flex flex-col gap-y-2 text-center italic">
									<span>
										Linking User Credentials to a Directory entry allows people to create and own resources within the platform, i.e. metadata-models
										and abstractions.
									</span>
									<span> This setup allows a user to have multiple credentials and still own the same set of resources. </span>
									<span>
										A single directory entry can be linked to multiple credentials but each credential can only be linked to a particular directory
										entry.
									</span>
								</div>
								<button
									class="btn btn-lg {themecolor === Domain.Entities.Theme.Color.PRIMARY
										? 'btn-primary'
										: themecolor === Domain.Entities.Theme.Color.SECONDARY
											? 'btn-secondary'
											: 'btn-accent'} self-center md:max-w-[40%]"
									aria-label="Create Group Rule Authorizations"
									onclick={handleUpdateIamCredentialsDirectoryID}
									disabled={!updateIamCredentialsDataValid}
								>
									Update Iam Credentials
								</button>
							</div>
						</div>
					{/if}
				</main>
			{:else}
				<header class="z-[2] flex justify-center gap-x-2">
					{#await import('$lib/components/View/IamCredentials/SearchBar/Component.svelte') then { default: ViewIamCredentialsSearchBar }}
						<div class="max-md:w-full md:w-[60%]">
							<ViewIamCredentialsSearchBar
								metadatamodel={iamCredentialsSearch.searchmetadatamodel}
								{themecolor}
								{theme}
								{telemetry}
								querycondition={iamCredentialsSearch.quicksearchquerycondition}
								updatequerycondition={(value) => {
									iamCredentialsSearch.quicksearchquerycondition = value
								}}
								showquerypanel={() => {
									iamCredentialsSearch.showquerypanel = !iamCredentialsSearch.showquerypanel
								}}
								search={() => {
									if (iamCredentialsSearch.searchdata) {
										iamCredentialsSearch.searchdata()
									}
								}}
							></ViewIamCredentialsSearchBar>
						</div>
					{/await}
				</header>

				<div class="divider mb-0 mt-0"></div>

				<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
					{#if iamCredentialsSearch.showquerypanel}
						<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
							{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
								<QueryPanel
									{themecolor}
									{theme}
									{telemetry}
									metadatamodel={iamCredentialsSearch.searchmetadatamodel}
									data={iamCredentialsSearch.searchresults!}
									queryconditions={iamCredentialsSearch.queryconditions}
									filterexcludeindexes={iamCredentialsSearch.filterexcludeindexes}
									updatefilterexcludeindexes={(value) => {
										iamCredentialsSearch.filterexcludeindexes = value
										State.Toast.Type = Domain.Entities.Toast.Type.INFO
										State.Toast.Message = `${iamCredentialsSearch.filterexcludeindexes.length} local results filtered out`
									}}
									updatemetadatamodel={(value: any) => {
										if (iamCredentialsSearch.updatemedataModel) {
											iamCredentialsSearch.updatemedataModel(value)
										}
									}}
									updatequeryconditions={(value) => {
										iamCredentialsSearch.queryconditions = value
									}}
									hidequerypanel={() => (iamCredentialsSearch.showquerypanel = false)}
								></QueryPanel>
							{/await}
						</section>
					{/if}

					{#if !iamCredentialsSearch.showquerypanel || windowWidth > 1000}
						{#if iamCredentialsSearch.searchresults!.length > 0}
							<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
								<section class="z-[2] flex w-full">
									{#if iamCredentialsSearch.selectedindexes!.length > 0}
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
												<span class="self-center">{iamCredentialsSearch.selectedindexes!.length} selected</span>
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
															onclick={() => (showLinkDirectoryToIamCredentials = true)}
															data-tip="Link credentials with directory entry"
														>
															1 - Link with Directory entry
														</button>
													</div>
												</div>
											{/if}
										</div>
									{/if}

									{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
										<div class="h-fit w-full flex-1 self-center">
											<ViewHeaderData
												title={'User Credentials'}
												view={iamCredentialsSearch.view}
												{themecolor}
												{theme}
												updateview={(value) => (iamCredentialsSearch.view = value)}
											></ViewHeaderData>
										</div>
									{/await}
								</section>

								<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
									{#await import('$lib/components/View/IamCredentials/Data/Component.svelte') then { default: ViewIamCredentialsData }}
										<ViewIamCredentialsData
											metadatamodel={iamCredentialsSearch.searchmetadatamodel}
											data={iamCredentialsSearch.searchresults!}
											{themecolor}
											{theme}
											{telemetry}
											addclickcolumn={false}
											addselectcolumn={true}
											view={iamCredentialsSearch.view}
											updatemetadatamodel={(value: any) => {
												if (iamCredentialsSearch.updatemedataModel) {
													iamCredentialsSearch.updatemedataModel(value)
												}
											}}
											filterexcludeindexes={iamCredentialsSearch.filterexcludeindexes}
											selecteddataindexes={iamCredentialsSearch.selectedindexes!}
											updateselecteddataindexes={(value) => (iamCredentialsSearch.selectedindexes! = value)}
										></ViewIamCredentialsData>
									{/await}
								</section>
							</section>
						{:else}
							<div class="flex flex-1 justify-center rounded-md p-2 {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-700' : 'bg-gray-200'}">
								<span class="flex self-center text-lg">
									View and manage credentials that can be used to grant users access to different resources within the system.
								</span>
							</div>
						{/if}
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

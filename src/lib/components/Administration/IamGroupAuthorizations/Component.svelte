<script lang="ts">
	import { Component, Domain, Interfaces, MetadataModel, State, Utils } from '$lib'
	import { untrack } from 'svelte'

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

	let iamGroupAuthorizationsSearch = $state(Interfaces.IamGroupAuthorizations.NewViewSearch())
	$effect(() => {
		if (
			State.Session.session?.iam_credential &&
			Array.isArray(State.Session.session.iam_credential.id) &&
			State.Session.session.iam_credential.id.length > 0
		) {
			untrack(() => {
				iamGroupAuthorizationsSearch.authcontextdirectorygroupid = authContextDirectoryGroupID
				iamGroupAuthorizationsSearch.context = COMPONENT_NAME
				iamGroupAuthorizationsSearch.telemetry = telemetry
				iamGroupAuthorizationsSearch.directoryid = directoryIDContext
			})
		}
	})

	let showSelectedActions: boolean = $state(false)

	let windowWidth: number = $state(0)

	let showCreateNewIamGroupAuthorizations: boolean = $state(false)

	async function deleteDeactivatesSelectedIamGroupAuthorizations() {
		const data = iamGroupAuthorizationsSearch.selectedindexes!.map((dIndex) => iamGroupAuthorizationsSearch.searchresults![dIndex])

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
				iamGroupAuthorizationsSearch.selectedindexes! = []
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

	let groupRuleAuthorizationsSearch = $state(Interfaces.GroupRuleAuthorizations.NewViewSearch())
	$effect(() => {
		if (
			State.Session.session?.iam_credential &&
			Array.isArray(State.Session.session.iam_credential.id) &&
			State.Session.session.iam_credential.id.length > 0
		) {
			untrack(() => {
				groupRuleAuthorizationsSearch.authcontextdirectorygroupid = authContextDirectoryGroupID
				groupRuleAuthorizationsSearch.context = COMPONENT_NAME
				groupRuleAuthorizationsSearch.telemetry = telemetry
			})
		}
	})

	let createIamGroupAuthorizationsStep: number = $state(0)

	let createIamGroupAuthorizationsDataValid: boolean = $derived(
		groupRuleAuthorizationsSearch.selectedindexes!.length > 0 &&
			(typeof directoryGroupIDContext === 'string' || iamCredentialsSearch.selectedindexes!.length > 0)
	)
	async function handleCreateIamGroupAuthorizations() {
		if (!createIamGroupAuthorizationsDataValid || !directorygroupid) {
			return
		}

		let iamCredentials: Domain.Entities.IamCredentials.Interface[] = []
		if (iamCredentialIDContext) {
			iamCredentials.push({ id: [iamCredentialIDContext] })
		} else {
			for (const dIndex of iamCredentialsSearch.selectedindexes!) {
				const d: Domain.Entities.IamCredentials.Interface = iamCredentialsSearch.searchresults![dIndex]
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
			for (const gdIndex of groupRuleAuthorizationsSearch.selectedindexes!) {
				const gar: Domain.Entities.GroupRuleAuthorizations.Interface = groupRuleAuthorizationsSearch.searchresults![gdIndex]
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

			const fetchResponse = await fetch(fetchUrl, {
				method: 'POST',
				credentials: 'include',
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
				iamCredentialsSearch.selectedindexes! = []
				groupRuleAuthorizationsSearch.selectedindexes! = []
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
	{#if iamGroupAuthorizationsSearch.getdisplaydata}
		{#await iamGroupAuthorizationsSearch.getdisplaydata()}
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

				<nav
					class="flex w-full justify-center rounded-lg p-2 {State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'bg-base-100' : 'bg-gray-100'}"
				>
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
						{#if iamCredentialsSearch.getdisplaydata}
							{#await iamCredentialsSearch.getdisplaydata()}
								{@render awaitloading()}
							{:then}
								<header class="z-[2] flex justify-center">
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
										<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
											<section class="z-[2] flex w-full">
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
									{/if}
								</main>
							{:catch e}
								{@render awaiterror(e)}
							{/await}
						{/if}
					{:else if createIamGroupAuthorizationsStep === 1}
						{#if groupRuleAuthorizationsSearch.getdisplaydata}
							{#await groupRuleAuthorizationsSearch.getdisplaydata()}
								{@render awaitloading()}
							{:then}
								<header class="z-[2] flex justify-center">
									{#await import('$lib/components/View/GroupRuleAuthorizations/SearchBar/Component.svelte') then { default: ViewGroupRuleAuthorizationsSearchBar }}
										<div class="max-md:w-full md:w-[60%]">
											<ViewGroupRuleAuthorizationsSearchBar
												metadatamodel={groupRuleAuthorizationsSearch.searchmetadatamodel}
												{themecolor}
												{theme}
												{telemetry}
												querycondition={groupRuleAuthorizationsSearch.quicksearchquerycondition}
												updatequerycondition={(value) => {
													groupRuleAuthorizationsSearch.quicksearchquerycondition = value
												}}
												showquerypanel={() => {
													groupRuleAuthorizationsSearch.showquerypanel = !groupRuleAuthorizationsSearch.showquerypanel
												}}
												search={() => {
													if (groupRuleAuthorizationsSearch.searchdata) {
														groupRuleAuthorizationsSearch.searchdata()
													}
												}}
											></ViewGroupRuleAuthorizationsSearchBar>
										</div>
									{/await}
								</header>

								<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
									{#if groupRuleAuthorizationsSearch.showquerypanel}
										<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
											{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
												<QueryPanel
													{themecolor}
													{theme}
													{telemetry}
													metadatamodel={groupRuleAuthorizationsSearch.searchmetadatamodel}
													data={groupRuleAuthorizationsSearch.searchresults!}
													queryconditions={groupRuleAuthorizationsSearch.queryconditions}
													filterexcludeindexes={groupRuleAuthorizationsSearch.filterexcludeindexes}
													updatefilterexcludeindexes={(value) => {
														groupRuleAuthorizationsSearch.filterexcludeindexes = value
														State.Toast.Type = Domain.Entities.Toast.Type.INFO
														State.Toast.Message = `${groupRuleAuthorizationsSearch.filterexcludeindexes.length} local results filtered out`
													}}
													updatemetadatamodel={(value: any) => {
														if (groupRuleAuthorizationsSearch.updatemedataModel) {
															groupRuleAuthorizationsSearch.updatemedataModel(value)
														}
													}}
													updatequeryconditions={(value) => {
														groupRuleAuthorizationsSearch.queryconditions = value
													}}
													hidequerypanel={() => (groupRuleAuthorizationsSearch.showquerypanel = false)}
												></QueryPanel>
											{/await}
										</section>
									{/if}

									{#if !groupRuleAuthorizationsSearch.showquerypanel || windowWidth > 1000}
										<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
											<section class="z-[2] flex w-full">
												{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
													<div class="h-fit w-full flex-1 self-center">
														<ViewHeaderData
															title={'Group Roles'}
															view={groupRuleAuthorizationsSearch.view}
															{themecolor}
															{theme}
															updateview={(value) => (groupRuleAuthorizationsSearch.view = value)}
														></ViewHeaderData>
													</div>
												{/await}
											</section>

											<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
												{#await import('$lib/components/View/GroupRuleAuthorizations/Data/Component.svelte') then { default: ViewGroupRuleAuthorizationsData }}
													<ViewGroupRuleAuthorizationsData
														metadatamodel={groupRuleAuthorizationsSearch.searchmetadatamodel}
														data={groupRuleAuthorizationsSearch.searchresults!}
														{themecolor}
														{theme}
														{telemetry}
														addclickcolumn={false}
														addselectcolumn={true}
														view={groupRuleAuthorizationsSearch.view}
														updatemetadatamodel={(value: any) => {
															if (groupRuleAuthorizationsSearch.updatemedataModel) {
																groupRuleAuthorizationsSearch.updatemedataModel(value)
															}
														}}
														filterexcludeindexes={groupRuleAuthorizationsSearch.filterexcludeindexes}
														selecteddataindexes={groupRuleAuthorizationsSearch.selectedindexes!}
														updateselecteddataindexes={(value) => (groupRuleAuthorizationsSearch.selectedindexes! = value)}
													></ViewGroupRuleAuthorizationsData>
												{/await}
											</section>
										</section>
									{/if}
								</main>
							{:catch e}
								{@render awaiterror(e)}
							{/await}
						{/if}
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
											: 'btn-accent'} self-center md:max-w-[40%]"
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
								metadatamodel={iamGroupAuthorizationsSearch.searchmetadatamodel}
								{themecolor}
								{theme}
								{telemetry}
								querycondition={iamGroupAuthorizationsSearch.quicksearchquerycondition}
								updatequerycondition={(value) => {
									iamGroupAuthorizationsSearch.quicksearchquerycondition = value
								}}
								showquerypanel={() => {
									iamGroupAuthorizationsSearch.showquerypanel = !iamGroupAuthorizationsSearch.showquerypanel
								}}
								search={() => {
									if (iamGroupAuthorizationsSearch.searchdata) {
										iamGroupAuthorizationsSearch.searchdata()
									}
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
					{#if iamGroupAuthorizationsSearch.showquerypanel}
						<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
							{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
								<QueryPanel
									{themecolor}
									{theme}
									{telemetry}
									metadatamodel={iamGroupAuthorizationsSearch.searchmetadatamodel}
									data={iamGroupAuthorizationsSearch.searchresults!}
									queryconditions={iamGroupAuthorizationsSearch.queryconditions}
									filterexcludeindexes={iamGroupAuthorizationsSearch.filterexcludeindexes}
									updatefilterexcludeindexes={(value) => {
										iamGroupAuthorizationsSearch.filterexcludeindexes = value
										State.Toast.Type = Domain.Entities.Toast.Type.INFO
										State.Toast.Message = `${iamGroupAuthorizationsSearch.filterexcludeindexes.length} local results filtered out`
									}}
									updatemetadatamodel={(value: any) => {
										if (iamGroupAuthorizationsSearch.updatemedataModel) {
											iamGroupAuthorizationsSearch.updatemedataModel(value)
										}
									}}
									updatequeryconditions={(value) => {
										iamGroupAuthorizationsSearch.queryconditions = value
									}}
									hidequerypanel={() => (iamGroupAuthorizationsSearch.showquerypanel = false)}
								></QueryPanel>
							{/await}
						</section>
					{/if}

					{#if !iamGroupAuthorizationsSearch.showquerypanel || windowWidth > 1000}
						{#if iamGroupAuthorizationsSearch.searchresults!.length > 0}
							<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
								<section class="z-[2] flex w-full">
									{#if iamGroupAuthorizationsSearch.selectedindexes!.length > 0}
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
												<span class="self-center">{iamGroupAuthorizationsSearch.selectedindexes!.length} selected</span>
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
											<ViewHeaderData title={'User Roles'} view={iamGroupAuthorizationsSearch.view} {themecolor} {theme} updateview={(value) => (iamGroupAuthorizationsSearch.view = value)}
											></ViewHeaderData>
										</div>
									{/await}
								</section>

								<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
									{#await import('$lib/components/View/IamGroupAuthorizations/Data/Component.svelte') then { default: ViewIamGroupAuthorizationsData }}
										<ViewIamGroupAuthorizationsData
											metadatamodel={iamGroupAuthorizationsSearch.searchmetadatamodel}
											data={iamGroupAuthorizationsSearch.searchresults!}
											{themecolor}
											{theme}
											{telemetry}
											addclickcolumn={false}
											addselectcolumn={true}
											view={iamGroupAuthorizationsSearch.view}
											updatemetadatamodel={(value: any) => {
												if (iamGroupAuthorizationsSearch.updatemedataModel) {
													iamGroupAuthorizationsSearch.updatemedataModel(value)
												}
											}}
											filterexcludeindexes={iamGroupAuthorizationsSearch.filterexcludeindexes}
											selecteddataindexes={iamGroupAuthorizationsSearch.selectedindexes!}
											updateselecteddataindexes={(value) => (iamGroupAuthorizationsSearch.selectedindexes! = value)}
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

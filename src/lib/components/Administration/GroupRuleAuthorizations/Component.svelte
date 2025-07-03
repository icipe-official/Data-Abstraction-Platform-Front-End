<script lang="ts">
	import { Component, Domain, Interfaces, State, Utils } from '$lib'
	import { untrack } from 'svelte'

	const COMPONENT_NAME = 'administration-group-rule-authorizations'

	interface Props {
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		telemetry?: Domain.Interfaces.ITelemetry
		directoryGroupIDContext?: string
		directorygroupid?: string
	}

	let {
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		telemetry = undefined,
		directoryGroupIDContext = undefined,
		directorygroupid = undefined
	}: Props = $props()

	let authContextDirectoryGroupID = $derived(directorygroupid)

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
				groupRuleAuthorizationsSearch.directorygroupsid = directorygroupid
			})
		}
	})

	let showSelectedActions: boolean = $state(false)

	let windowWidth: number = $state(0)

	let showCreateNewGroupRuleAuthorizations: boolean = $state(false)

	async function deleteDeactivatesSelectedGroupRuleAuthorizations() {
		const data = groupRuleAuthorizationsSearch.selectedindexes!.map((dIndex) => groupRuleAuthorizationsSearch.searchresults![dIndex])

		if (data.length === 0 || !directorygroupid) {
			return
		}

		State.Loading.value = `Deleting/Deactivating ${Domain.Entities.GroupRuleAuthorizations.RepositoryName}`
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
				groupRuleAuthorizationsSearch.selectedindexes = []
				showSelectedActions = false
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Delete/Deactivate ${Domain.Entities.GroupRuleAuthorizations.RepositoryName} failed`
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

	let groupAuthorizationRulesSearch = $state(Interfaces.GroupAuthorizationRules.NewViewSearch())
	$effect(() => {
		if (
			State.Session.session?.iam_credential &&
			Array.isArray(State.Session.session.iam_credential.id) &&
			State.Session.session.iam_credential.id.length > 0
		) {
			untrack(() => {
				groupAuthorizationRulesSearch.authcontextdirectorygroupid = authContextDirectoryGroupID
				groupAuthorizationRulesSearch.context = COMPONENT_NAME
				groupAuthorizationRulesSearch.telemetry = telemetry
			})
		}
	})

	let createGroupRuleAuthorizationsStep: number = $state(0)

	let createGroupRuleAuthorizationsDataValid: boolean = $derived(
		groupAuthorizationRulesSearch.selectedindexes!.length > 0 &&
			(typeof directoryGroupIDContext === 'string' || directoryGroupsSearch.selectedindexes!.length > 0)
	)
	async function handleCreateGroupRuleAuthorizations() {
		if (!createGroupRuleAuthorizationsDataValid || !directorygroupid) {
			return
		}

		let directoryGroups: Domain.Entities.DirectoryGroups.Interface[] = []
		if (directoryGroupIDContext) {
			directoryGroups.push({ id: [directoryGroupIDContext] })
		} else {
			for (const dIndex of directoryGroupsSearch.selectedindexes!) {
				const d: Domain.Entities.DirectoryGroups.Interface = directoryGroupsSearch.searchresults![dIndex]
				if (Array.isArray(d.id) && d.id.length > 0) {
					directoryGroups.push({
						id: d.id
					})
				}
			}
		}

		if (directoryGroups.length === 0) {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = `Chosen ${Domain.Entities.DirectoryGroups.RepositoryName} not valid`
			return
		}

		let newGroupRuleAuthorizations: Domain.Entities.GroupRuleAuthorizations.Interface[] = []
		for (const dg of directoryGroups) {
			for (const gdIndex of groupAuthorizationRulesSearch.selectedindexes!) {
				const gar: Domain.Entities.GroupAuthorizationRules.Interface = groupAuthorizationRulesSearch.searchresults![gdIndex]
				if (Array.isArray(gar.group_authorization_rules_id) && gar.group_authorization_rules_id.length > 0) {
					const id = gar.group_authorization_rules_id[0].id
					const group = gar.group_authorization_rules_id[0].rule_group
					if (Array.isArray(id) && id.length > 0 && Array.isArray(group) && group.length > 0) {
						newGroupRuleAuthorizations.push({
							directory_groups_id: dg.id,
							group_authorization_rules_id: [
								{
									group_authorization_rules_id: id,
									group_authorization_rules_group: group
								}
							]
						})
					}
				}
			}
		}

		if (newGroupRuleAuthorizations.length === 0) {
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = `New ${Domain.Entities.GroupRuleAuthorizations.RepositoryName} data not valid`
			return
		}

		State.Loading.value = `Creating ${Domain.Entities.GroupRuleAuthorizations.RepositoryName}`
		try {
			const fetchUrl = new URL(`${Domain.Entities.Url.ApiUrlPaths.Group.RuleAuthorizations}/${Domain.Entities.Url.Action.CREATE}`)
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
				newGroupRuleAuthorizations
			)

			const fetchResponse = await fetch(fetchUrl, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify(newGroupRuleAuthorizations)
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
				groupRuleAuthorizationsSearch.selectedindexes! = []
				showSelectedActions = false
			} else {
				handleError(fetchResponse.status, fetchData)
			}
		} catch (e) {
			const ERROR = `Create ${Domain.Entities.GroupRuleAuthorizations.RepositoryName} failed`
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, ERROR, 'error', e)
			handleError(e, ERROR)
		} finally {
			State.Loading.value = undefined
		}
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex flex-1 flex-col gap-y-2 overflow-hidden">
	{#if groupRuleAuthorizationsSearch.getdisplaydata}
		{#await groupRuleAuthorizationsSearch.getdisplaydata()}
			{@render awaitloading()}
		{:then}
			{#if showCreateNewGroupRuleAuthorizations}
				<header class="z-[3] flex flex-col gap-y-1">
					<section class="flex gap-x-1">
						<button
							class="btn btn-ghost btn-circle btn-md flex self-center"
							aria-label="Close Create Group Rule Authorizations"
							onclick={() => {
								showCreateNewGroupRuleAuthorizations = false
							}}
						>
							<!--mdi:arrow-back source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path fill="var({Utils.Theme.GetColor(themecolor)})" d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z" />
							</svg>
						</button>
						<span class="self-center"> Create New Group Roles </span>
					</section>
				</header>

				<nav
					class="flex w-full justify-center rounded-lg p-2 {State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'bg-base-100' : 'bg-gray-100'}"
				>
					<div class="steps z-[2]">
						{#if !directoryGroupIDContext}
							<li
								class="step {createGroupRuleAuthorizationsStep >= 0
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
										createGroupRuleAuthorizationsStep = 0
									}}
								>
									Pick Group(s)
								</button>
							</li>
						{/if}
						<li
							class="step {createGroupRuleAuthorizationsStep >= 1
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
									createGroupRuleAuthorizationsStep = 1
								}}
							>
								Pick Authorization Rule(s)
							</button>
						</li>
						<li
							class="step {createGroupRuleAuthorizationsStep >= 2
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
									createGroupRuleAuthorizationsStep = 2
								}}
							>
								Create Group Role(s)
							</button>
						</li>
					</div>
				</nav>

				<main
					class="z-[1] flex flex-[9.5] flex-col gap-y-2 overflow-hidden {State.Theme.value === Domain.Entities.Theme.Theme.DARK
						? 'bg-base-100'
						: 'bg-gray-100'} rounded-lg p-2"
				>
					{#if createGroupRuleAuthorizationsStep === 0}
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
					{:else if createGroupRuleAuthorizationsStep === 1}
						{#if groupAuthorizationRulesSearch.getdisplaydata}
							{#await groupAuthorizationRulesSearch.getdisplaydata()}
								{@render awaitloading()}
							{:then}
								<header class="z-[2] flex justify-center">
									{#await import('$lib/components/View/GroupAuthorizationRules/SearchBar/Component.svelte') then { default: ViewGroupAuthorizationRulesSearchBar }}
										<div class="max-md:w-full md:w-[60%]">
											<ViewGroupAuthorizationRulesSearchBar
												metadatamodel={groupAuthorizationRulesSearch.searchmetadatamodel}
												{themecolor}
												{theme}
												{telemetry}
												querycondition={groupAuthorizationRulesSearch.quicksearchquerycondition}
												updatequerycondition={(value) => {
													groupAuthorizationRulesSearch.quicksearchquerycondition = value
												}}
												showquerypanel={() => {
													groupAuthorizationRulesSearch.showquerypanel = !groupAuthorizationRulesSearch.showquerypanel
												}}
												search={() => {
													if (groupAuthorizationRulesSearch.searchdata) {
														groupAuthorizationRulesSearch.searchdata()
													}
												}}
											></ViewGroupAuthorizationRulesSearchBar>
										</div>
									{/await}
								</header>

								<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
									{#if groupAuthorizationRulesSearch.showquerypanel}
										<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
											{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
												<QueryPanel
													{themecolor}
													{theme}
													{telemetry}
													metadatamodel={groupAuthorizationRulesSearch.searchmetadatamodel}
													data={groupAuthorizationRulesSearch.searchresults!}
													queryconditions={groupAuthorizationRulesSearch.queryconditions}
													filterexcludeindexes={groupAuthorizationRulesSearch.filterexcludeindexes}
													updatefilterexcludeindexes={(value) => {
														groupAuthorizationRulesSearch.filterexcludeindexes = value
														State.Toast.Type = Domain.Entities.Toast.Type.INFO
														State.Toast.Message = `${groupAuthorizationRulesSearch.filterexcludeindexes.length} local results filtered out`
													}}
													updatemetadatamodel={(value: any) => {
														if (groupAuthorizationRulesSearch.updatemedataModel) {
															groupAuthorizationRulesSearch.updatemedataModel(value)
														}
													}}
													updatequeryconditions={(value) => {
														groupAuthorizationRulesSearch.queryconditions = value
													}}
													hidequerypanel={() => (groupAuthorizationRulesSearch.showquerypanel = false)}
												></QueryPanel>
											{/await}
										</section>
									{/if}

									{#if !groupAuthorizationRulesSearch.showquerypanel || windowWidth > 1000}
										<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
											<section class="z-[2] flex w-full">
												{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
													<div class="h-fit w-full flex-1 self-center">
														<ViewHeaderData
															title={'Authorization Rules'}
															view={groupAuthorizationRulesSearch.view}
															{themecolor}
															{theme}
															updateview={(value) => (groupAuthorizationRulesSearch.view = value)}
														></ViewHeaderData>
													</div>
												{/await}
											</section>

											<section class="z-[1] flex h-full w-full flex-1 flex-col overflow-hidden">
												{#await import('$lib/components/View/GroupAuthorizationRules/Data/Component.svelte') then { default: ViewGroupAuthorizationRulesData }}
													<ViewGroupAuthorizationRulesData
														metadatamodel={groupAuthorizationRulesSearch.searchmetadatamodel}
														data={groupAuthorizationRulesSearch.searchresults!}
														{themecolor}
														{theme}
														{telemetry}
														addclickcolumn={false}
														addselectcolumn={true}
														view={groupAuthorizationRulesSearch.view}
														updatemetadatamodel={(value: any) => {
															if (groupAuthorizationRulesSearch.updatemedataModel) {
																groupAuthorizationRulesSearch.updatemedataModel(value)
															}
														}}
														filterexcludeindexes={groupAuthorizationRulesSearch.filterexcludeindexes}
														selecteddataindexes={groupAuthorizationRulesSearch.selectedindexes!}
														updateselecteddataindexes={(value) => (groupAuthorizationRulesSearch.selectedindexes! = value)}
													></ViewGroupAuthorizationRulesData>
												{/await}
											</section>
										</section>
									{/if}
								</main>
							{:catch e}
								{@render awaiterror(e)}
							{/await}
						{/if}
					{:else if createGroupRuleAuthorizationsStep === 2}
						<div class="flex flex-1 justify-center">
							<div class="flex h-fit w-fit flex-col gap-y-16 self-center justify-self-center md:max-w-[60%]">
								<div class="flex flex-col gap-y-2 text-center italic">
									<span> In order to assign roles to users in a group, authorization rule(s) need to be assigned to the target group(s). </span>
									<span>
										By assigning authorization rule(s) to a group, result being called <span class="font-bold">group role(s)</span>, any person can be
										assigned a group role provided the assignee has a role prefixed with <span class="font-bold">assign_</span>.
									</span>
								</div>
								<button
									class="btn btn-lg {themecolor === Domain.Entities.Theme.Color.PRIMARY
										? 'btn-primary'
										: themecolor === Domain.Entities.Theme.Color.SECONDARY
											? 'btn-secondary'
											: 'btn-accent'} self-center md:max-w-[40%]"
									aria-label="Create Group Rule Authorizations"
									onclick={handleCreateGroupRuleAuthorizations}
									disabled={!createGroupRuleAuthorizationsDataValid}
								>
									Create Group Role(s)
								</button>
							</div>
						</div>
					{/if}
				</main>
			{:else}
				<header class="z-[2] flex justify-between gap-x-2">
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

					<button
						class="btn btn-md btn-circle tooltip tooltip-left self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'btn-primary tooltip-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'btn-secondary tooltip-secondary'
								: 'btn-accent tooltip-accent'}"
						aria-label="Create New Group Role(s)"
						data-tip="Create new group role(s)"
						onclick={() => {
							showCreateNewGroupRuleAuthorizations = true
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
						{#if groupRuleAuthorizationsSearch.searchresults!.length > 0}
							<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
								<section class="z-[2] flex w-full">
									{#if groupRuleAuthorizationsSearch.selectedindexes!.length > 0}
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
												<span class="self-center">{groupRuleAuthorizationsSearch.selectedindexes!.length} selected</span>
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
															onclick={deleteDeactivatesSelectedGroupRuleAuthorizations}
															data-tip="Deactivating group role(s) prevents them from being assigned to new users unless a similar authorization rule is assigned to the group later on."
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
											selecteddataindexes={groupRuleAuthorizationsSearch.selectedindexes}
											updateselecteddataindexes={(value) => (groupRuleAuthorizationsSearch.selectedindexes = value)}
										></ViewGroupRuleAuthorizationsData>
									{/await}
								</section>
							</section>
						{:else}
							<div class="flex flex-1 justify-center rounded-md p-2 {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-700' : 'bg-gray-200'}">
								<span class="flex self-center text-lg">
									Create and manage group roles that can be assigned to users with credentials within a group.
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

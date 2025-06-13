<script lang="ts">
	import { Component, Domain, Interfaces, MetadataModel, State, Utils } from '$lib'
	import { untrack } from 'svelte'

	const COMPONENT_NAME = 'administration-group-authorization-rules'

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

	let windowWidth: number = $state(0)
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex flex-1 flex-col gap-y-2 overflow-hidden">
	{#if groupAuthorizationRulesSearch.getdisplaydata}
		{#await groupAuthorizationRulesSearch.getdisplaydata()}
			<div class="flex h-full w-full flex-[9.5] justify-center">
				<span class="self-center">
					<span class="loading text-primary loading-ball loading-md"></span>
					<span class="loading text-secondary loading-ball loading-lg"></span>
					<span class="loading text-accent loading-ball loading-xl"></span>
				</span>
			</div>
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

			<div class="divider mb-0 mt-0"></div>

			<main class="z-[1] flex flex-[9.5] gap-x-2 overflow-hidden">
				{#if groupAuthorizationRulesSearch.showquerypanel}
					<section class="flex flex-[2] flex-col gap-y-2 overflow-hidden">
						{#await import("$lib/components/QueryPanel/Component.svelte") then { default: QueryPanel }}
							<QueryPanel
								{themecolor}
								{theme}
								{telemetry}
								metadatamodel={groupAuthorizationRulesSearch.searchmetadatamodel}
								data={groupAuthorizationRulesSearch.searchresults}
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
					{#if Array.isArray(groupAuthorizationRulesSearch.searchresults) && groupAuthorizationRulesSearch.searchresults.length > 0}
						<section class="flex {windowWidth > 1500 ? 'flex-[3]' : 'flex-2'} flex-col overflow-hidden rounded-lg">
							{#await import('$lib/components/View/Header/Data/Component.svelte') then { default: ViewHeaderData }}
								<ViewHeaderData title={'Group Authorization Rules'} view={groupAuthorizationRulesSearch.view} {themecolor} {theme} updateview={(value) => (groupAuthorizationRulesSearch.view = value)}
								></ViewHeaderData>
							{/await}
							{#await import('$lib/components/View/GroupAuthorizationRules/Data/Component.svelte') then { default: ViewGroupAuthorizationRulesData }}
								<ViewGroupAuthorizationRulesData
									metadatamodel={groupAuthorizationRulesSearch.searchmetadatamodel}
									data={groupAuthorizationRulesSearch.searchresults}
									{themecolor}
									{theme}
									{telemetry}
									addclickcolumn={false}
									view={groupAuthorizationRulesSearch.view}
									updatemetadatamodel={(value: any) => {
									if (groupAuthorizationRulesSearch.updatemedataModel) {
										groupAuthorizationRulesSearch.updatemedataModel(value)
									}
								}}
									filterexcludeindexes={groupAuthorizationRulesSearch.filterexcludeindexes}
								></ViewGroupAuthorizationRulesData>
							{/await}
						</section>
					{:else}
						<div class="flex flex-1 justify-center rounded-md p-2 {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-700' : 'bg-gray-200'}">
							<span class="flex self-center text-lg">
								View and update the tags of various authorization rules from which group roles can be created from and assigned to users.
							</span>
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

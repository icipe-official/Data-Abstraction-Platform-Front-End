<script lang="ts">
	import { Domain, State } from '$lib'
	import { getContext, onMount } from 'svelte'
	import type { PageProps } from './$types'
	import { Tab } from './util'

	const COMPONENT_NAME = 'administration-page'

	let { data }: PageProps = $props()

	let telemetry: Domain.Interfaces.ITelemetry | undefined = $derived.by(() => {
		return getContext(State.TelemetryContext.value)
	})

	let windowWidth: number = $state(0)

	

	let currentTab: Tab = $state(Tab.DIRECTORY_GROUPS)

	let showSectionID: string = $state('')

	let showNavigationMenu: boolean = $state(false)
	$effect(() => {
		if (windowWidth > 768) {
			showNavigationMenu = false
		}
	})
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex h-full w-full gap-y-2 overflow-hidden pb-1 max-md:flex-col-reverse md:flex-col">
	<nav
		class="z-[2] flex flex-[0.5] rounded-lg p-2 shadow-md shadow-gray-800 max-md:gap-x-1 md:gap-x-6 {State.Theme.value ===
		Domain.Entities.Theme.Theme.DARK
			? 'bg-base-300'
			: 'bg-white'}"
	>
		{#if windowWidth > 768}
			{@render navmenu()}
		{:else}
			<div class="flex flex-col-reverse">
				<button
					class="btn btn-lg btn-ghost max-md:self-center"
					aria-label="show navigation menu"
					onclick={() => (showNavigationMenu = !showNavigationMenu)}
				>
					<!--mdi:menu source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'} d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
					</svg>
				</button>

				{#if showNavigationMenu}
					<div class="relative h-0">
						<section
							class="absolute bottom-0 left-0 flex min-w-[250px] flex-col gap-y-4 rounded-md p-2 shadow-md shadow-gray-800 {State.Theme.value ===
							Domain.Entities.Theme.Theme.DARK
								? 'bg-base-300'
								: 'bg-white'}"
						>
							{@render navmenu()}
						</section>
					</div>
				{/if}
			</div>

			<span class="self-center">Administration</span>
		{/if}
	</nav>

	<main
		class="z-[1] flex flex-[9.5] flex-col overflow-hidden rounded-lg p-2 shadow-md shadow-gray-800 {State.Theme.value ===
		Domain.Entities.Theme.Theme.DARK
			? 'bg-base-300'
			: 'bg-white'}"
	>
		{#if currentTab === Tab.GROUP_AUTHORIZATION_RULES}
			{#await import('$lib/components/Administration/GroupAuthorizationRules/Component.svelte') then { default: AdministrationGroupAuthorizationRules }}
				<AdministrationGroupAuthorizationRules
					theme={State.Theme.value}
					themecolor={State.ThemeColor.value}
					{telemetry}
					directorygroupid={data.directory_group_id}
				></AdministrationGroupAuthorizationRules>
			{/await}
		{:else if currentTab === Tab.GROUP_RULE_AUTHORIZATIONS}
			{#await import('$lib/components/Administration/GroupRuleAuthorizations/Component.svelte') then { default: AdministrationGroupRuleAuthorizations }}
				<AdministrationGroupRuleAuthorizations
					theme={State.Theme.value}
					themecolor={State.ThemeColor.value}
					{telemetry}
					directorygroupid={data.directory_group_id}
				></AdministrationGroupRuleAuthorizations>
			{/await}
		{:else if currentTab === Tab.IAM_CREDENTIALS}
			{#await import('$lib/components/Administration/IamCredentials/Component.svelte') then { default: AdministrationIamCredentials }}
				<AdministrationIamCredentials
					theme={State.Theme.value}
					themecolor={State.ThemeColor.value}
					{telemetry}
					directorygroupid={data.directory_group_id}
				></AdministrationIamCredentials>
			{/await}
		{:else if currentTab === Tab.IAM_GROUP_AUTHORIZATIONS}
			{#await import('$lib/components/Administration/IamGroupAuthorizations/Component.svelte') then { default: AdministrationIamGroupAuthorizations }}
				<AdministrationIamGroupAuthorizations
					theme={State.Theme.value}
					themecolor={State.ThemeColor.value}
					{telemetry}
					directorygroupid={data.directory_group_id}
				></AdministrationIamGroupAuthorizations>
			{/await}
		{:else if currentTab === Tab.METADATA_MODELS_DIRECTORY}
			{#await import('$lib/components/Administration/MetadataModelsDirectory/Component.svelte') then { default: AdministrationMetadataModelsDirectory }}
				<AdministrationMetadataModelsDirectory
					theme={State.Theme.value}
					themecolor={State.ThemeColor.value}
					{telemetry}
					directorygroupid={data.directory_group_id}
				></AdministrationMetadataModelsDirectory>
			{/await}
		{:else if currentTab === Tab.METADATA_MODELS_DIRECTORY_GROUPS}
			{#await import('$lib/components/Administration/MetadataModelsDirectoryGroups/Component.svelte') then { default: AdministrationMetadataModelsDirectoryGroups }}
				<AdministrationMetadataModelsDirectoryGroups
					theme={State.Theme.value}
					themecolor={State.ThemeColor.value}
					{telemetry}
					directorygroupid={data.directory_group_id}
				></AdministrationMetadataModelsDirectoryGroups>
			{/await}
		{:else if currentTab === Tab.DIRECTORY_GROUPS}
			{#await import('$lib/components/Administration/DirectoryGroups/Component.svelte') then { default: AdministrationDirectoryGroups }}
				<AdministrationDirectoryGroups
					theme={State.Theme.value}
					themecolor={State.ThemeColor.value}
					{telemetry}
					directorygroupid={data.directory_group_id}
				></AdministrationDirectoryGroups>
			{/await}
		{:else if currentTab === Tab.DIRECTORY}
			{#await import('$lib/components/Administration/Directory/Component.svelte') then { default: AdministrationDirectory }}
				<AdministrationDirectory theme={State.Theme.value} themecolor={State.ThemeColor.value} {telemetry} directorygroupid={data.directory_group_id}
				></AdministrationDirectory>
			{/await}
		{:else if currentTab === Tab.ABSTRACTIONS_DIRECTORY_GROUPS}
			{#await import('$lib/components/Administration/AbstractionsDirectoryGroups/Component.svelte') then { default: AdministrationAbstractionsDirectoryGroups }}
				<AdministrationAbstractionsDirectoryGroups
					theme={State.Theme.value}
					themecolor={State.ThemeColor.value}
					{telemetry}
					directorygroupid={data.directory_group_id}
				></AdministrationAbstractionsDirectoryGroups>
			{/await}
		{/if}
	</main>
</div>

{#snippet navmenu()}
	{@render navitemdirectoryandgroups()}

	{@render navitemiam()}

	{@render navitemsmetadatamodels()}

	{@render navabstactionsdiretorygroups()}
{/snippet}

{#snippet navabstactionsdiretorygroups()}
	<button
		class="link link-hover {currentTab === Tab.ABSTRACTIONS_DIRECTORY_GROUPS
			? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
				? 'link-primary'
				: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
					? 'link-secondary'
					: 'link-accent'
			: ''} flex flex-1 justify-between text-lg"
		aria-label="Abstractions Directory Groups"
		onclick={() => {
			currentTab = Tab.ABSTRACTIONS_DIRECTORY_GROUPS
		}}
	>
		<span class="self-center">Group Abstractions configurations</span>
	</button>
{/snippet}

{#snippet navitemsmetadatamodels()}
	{@const subSections = [Tab.METADATA_MODELS_DIRECTORY, Tab.METADATA_MODELS_DIRECTORY_GROUPS]}
	{@const sectionID = 'metadata-models'}

	<section class="flex md:flex-col">
		<button
			class="link link-hover {subSections.includes(currentTab)
				? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
					? 'link-primary'
					: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
						? 'link-secondary'
						: 'link-accent'
				: ''} flex flex-1 justify-between text-lg"
			aria-label="Metadata Models Menu"
			onclick={() => {
				showSectionID = showSectionID === sectionID ? '' : sectionID
			}}
		>
			<span class="self-center">Metadata Models</span>
			{#if showSectionID === sectionID}
				{#if windowWidth > 768}
					<!--mdi:menu-up source: https://icon-sets.iconify.design-->
					<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'} d="m7 15l5-5l5 5z" />
					</svg>
				{:else}
					<!--mdi:menu-left source: https://icon-sets.iconify.design-->
					<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'} d="m14 7l-5 5l5 5z" />
					</svg>
				{/if}
			{:else if windowWidth > 768}
				<!--mdi:menu-down source: https://icon-sets.iconify.design-->
				<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'} d="m7 10l5 5l5-5z" />
				</svg>
			{:else}
				<!--mdi:menu-right source: https://icon-sets.iconify.design-->
				<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'} d="m10 17l5-5l-5-5z" />
				</svg>
			{/if}
		</button>

		{#if showSectionID === sectionID}
			<div class="relative h-0">
				<section
					class="absolute left-0 flex min-w-[200px] gap-y-4 rounded-md p-2 shadow-md shadow-gray-800 max-md:bottom-0 max-md:flex-col-reverse md:top-0 md:flex-col {State
						.Theme.value === Domain.Entities.Theme.Theme.DARK
						? 'bg-base-300'
						: 'bg-white'} overflow-hidden"
				>
					<button
						class="link link-hover {currentTab === Tab.METADATA_MODELS_DIRECTORY
							? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
								? 'link-primary'
								: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
									? 'link-secondary'
									: 'link-accent'
							: ''} text-lg"
						aria-label="Navigate to Directory"
						onclick={() => {
							currentTab = Tab.METADATA_MODELS_DIRECTORY
							showNavigationMenu = false
						}}
					>
						Directory
					</button>

					<button
						class="link link-hover {currentTab === Tab.METADATA_MODELS_DIRECTORY_GROUPS
							? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
								? 'link-primary'
								: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
									? 'link-secondary'
									: 'link-accent'
							: ''} text-lg"
						aria-label="Navigate to Directory Groups"
						onclick={() => {
							currentTab = Tab.METADATA_MODELS_DIRECTORY_GROUPS
							showNavigationMenu = false
						}}
					>
						Groups
					</button>
				</section>
			</div>
		{/if}
	</section>
{/snippet}

{#snippet navitemiam()}
	{@const subSections = [Tab.IAM_CREDENTIALS, Tab.GROUP_AUTHORIZATION_RULES, Tab.GROUP_RULE_AUTHORIZATIONS, Tab.IAM_GROUP_AUTHORIZATIONS]}
	{@const sectionID = 'iam'}

	<section class="flex md:flex-col">
		<button
			class="link link-hover {subSections.includes(currentTab)
				? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
					? 'link-primary'
					: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
						? 'link-secondary'
						: 'link-accent'
				: ''} flex flex-1 justify-between text-lg"
			aria-label="IAM Menu"
			onclick={() => {
				showSectionID = showSectionID === sectionID ? '' : sectionID
			}}
		>
			<span class="self-center">Identity & Access Management</span>
			{#if showSectionID === sectionID}
				{#if windowWidth > 768}
					<!--mdi:menu-up source: https://icon-sets.iconify.design-->
					<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'} d="m7 15l5-5l5 5z" />
					</svg>
				{:else}
					<!--mdi:menu-left source: https://icon-sets.iconify.design-->
					<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'} d="m14 7l-5 5l5 5z" />
					</svg>
				{/if}
			{:else if windowWidth > 768}
				<!--mdi:menu-down source: https://icon-sets.iconify.design-->
				<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'} d="m7 10l5 5l5-5z" />
				</svg>
			{:else}
				<!--mdi:menu-right source: https://icon-sets.iconify.design-->
				<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'} d="m10 17l5-5l-5-5z" />
				</svg>
			{/if}
		</button>

		{#if showSectionID === sectionID}
			<div class="relative h-0">
				<section
					class="absolute left-0 flex min-w-[200px] gap-y-4 rounded-md p-2 shadow-md shadow-gray-800 max-md:bottom-0 max-md:flex-col-reverse md:top-0 md:flex-col {State
						.Theme.value === Domain.Entities.Theme.Theme.DARK
						? 'bg-base-300'
						: 'bg-white'} overflow-hidden"
				>
					<button
						class="link link-hover {currentTab === Tab.IAM_CREDENTIALS
							? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
								? 'link-primary'
								: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
									? 'link-secondary'
									: 'link-accent'
							: ''} text-lg"
						aria-label="Navigate to User Credentials"
						onclick={() => {
							currentTab = Tab.IAM_CREDENTIALS
							showNavigationMenu = false
						}}
					>
						User Credentials
					</button>

					<button
						class="link link-hover {currentTab === Tab.IAM_GROUP_AUTHORIZATIONS
							? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
								? 'link-primary'
								: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
									? 'link-secondary'
									: 'link-accent'
							: ''} text-lg"
						aria-label="Navigate to User Roles"
						onclick={() => {
							currentTab = Tab.IAM_GROUP_AUTHORIZATIONS
							showNavigationMenu = false
						}}
					>
						User Roles
					</button>

					<button
						class="link link-hover {currentTab === Tab.GROUP_RULE_AUTHORIZATIONS
							? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
								? 'link-primary'
								: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
									? 'link-secondary'
									: 'link-accent'
							: ''} text-lg"
						aria-label="Navigate to Group Roles"
						onclick={() => {
							currentTab = Tab.GROUP_RULE_AUTHORIZATIONS
							showNavigationMenu = false
						}}
					>
						Group Roles
					</button>

					<button
						class="link link-hover {currentTab === Tab.GROUP_AUTHORIZATION_RULES
							? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
								? 'link-primary'
								: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
									? 'link-secondary'
									: 'link-accent'
							: ''} text-lg"
						aria-label="Navigate to Authorization Rules"
						onclick={() => {
							currentTab = Tab.GROUP_AUTHORIZATION_RULES
							showNavigationMenu = false
						}}
					>
						Authorization Rules
					</button>
				</section>
			</div>
		{/if}
	</section>
{/snippet}

{#snippet navitemdirectoryandgroups()}
	{@const subSections = [Tab.DIRECTORY, Tab.DIRECTORY_GROUPS]}
	{@const sectionID = 'directory-and-groups'}

	<section class="flex justify-center md:flex-col">
		<button
			class="link link-hover {subSections.includes(currentTab)
				? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
					? 'link-primary'
					: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
						? 'link-secondary'
						: 'link-accent'
				: ''} flex flex-1 justify-between text-lg"
			aria-label="Directory and Groups Menu"
			onclick={() => {
				showSectionID = showSectionID === sectionID ? '' : sectionID
			}}
		>
			<span class="self-center">Directory & Groups</span>
			{#if showSectionID === sectionID}
				{#if windowWidth > 768}
					<!--mdi:menu-up source: https://icon-sets.iconify.design-->
					<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'} d="m7 15l5-5l5 5z" />
					</svg>
				{:else}
					<!--mdi:menu-left source: https://icon-sets.iconify.design-->
					<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'} d="m14 7l-5 5l5 5z" />
					</svg>
				{/if}
			{:else if windowWidth > 768}
				<!--mdi:menu-down source: https://icon-sets.iconify.design-->
				<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'} d="m7 10l5 5l5-5z" />
				</svg>
			{:else}
				<!--mdi:menu-right source: https://icon-sets.iconify.design-->
				<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'} d="m10 17l5-5l-5-5z" />
				</svg>
			{/if}
		</button>

		{#if showSectionID === sectionID}
			<div class="relative h-0">
				<section
					class="absolute left-0 flex min-w-[200px] gap-y-4 rounded-md p-2 shadow-md shadow-gray-800 max-md:bottom-0 max-md:flex-col-reverse md:top-0 md:flex-col {State
						.Theme.value === Domain.Entities.Theme.Theme.DARK
						? 'bg-base-300'
						: 'bg-white'} overflow-hidden"
				>
					<button
						class="link link-hover {currentTab === Tab.DIRECTORY
							? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
								? 'link-primary'
								: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
									? 'link-secondary'
									: 'link-accent'
							: ''} text-lg"
						aria-label="Navigate to Directory"
						onclick={() => {
							currentTab = Tab.DIRECTORY
							showNavigationMenu = false
						}}
					>
						Directory
					</button>

					<button
						class="link link-hover {currentTab === Tab.DIRECTORY_GROUPS
							? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
								? 'link-primary'
								: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
									? 'link-secondary'
									: 'link-accent'
							: ''} text-lg"
						aria-label="Navigate to Directory Groups"
						onclick={() => {
							currentTab = Tab.DIRECTORY_GROUPS
							showNavigationMenu = false
						}}
					>
						Groups
					</button>
				</section>
			</div>
		{/if}
	</section>
{/snippet}

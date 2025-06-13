<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { Domain, Interfaces, State, Utils } from '$lib'
	import { getContext, onMount, untrack, type Snippet } from 'svelte'
	import type { LayoutProps } from './$types'

	const COMPONENT_NAME = 'directory-group-layout'

	let { data, children }: LayoutProps & { children: Snippet<[]> } = $props()

	let iamCredential: Domain.Entities.IamCredentials.Interface | undefined = $derived(State.Session?.session?.iam_credential)

	let accountManagementEndpoint: string | undefined = $derived(State.OpenidEndpoints?.value?.account_management_endpoint)

	let showSectionID: string = $state('')

	let windowWidth: number = $state(0)

	let telemetry: Domain.Interfaces.ITelemetry | undefined = $derived.by(() => {
		return getContext(State.TelemetryContext.value)
	})

	async function handleSignout() {
		State.Loading.value = 'Signing out'
		try {
			const fetchResponse = await fetch(Domain.Entities.Url.ApiUrlPaths.Iam.Signout, { credentials: 'include' })
			const fetchData = await fetchResponse.json()
			if (fetchResponse.ok) {
				State.Toast.Type = Domain.Entities.Toast.Type.SUCCESS
				State.Toast.Message = 'Sign out successful'
				State.ResetSession()
				await goto(Utils.Env.BasePath)
			} else {
				throw [fetchResponse.status, fetchData]
			}
		} catch (e) {
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'Sign out failed', 'error', e)
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = 'Sign out failed'
		} finally {
			State.Loading.value = undefined
		}
	}

	let currentLocationPath: string = $derived(page.url.pathname)

	$effect(() => {
		if (windowWidth >= 768 && showSectionID === 'navigation-menu') {
			untrack(() => (showSectionID = ''))
		}
	})
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex h-full w-full flex-1 overflow-hidden p-2 max-md:flex-col max-md:gap-y-2 md:gap-x-2">
	{#if iamCredential && data.directory_group_id}
		<nav
			class="z-[2] flex flex-[0.5] rounded-md p-1 shadow-md shadow-gray-800 max-md:justify-between max-md:gap-x-4 md:flex-col {State.Theme.value ===
			Domain.Entities.Theme.Theme.DARK
				? 'bg-base-300'
				: 'bg-white'}"
		>
			<section class="flex justify-center self-center max-md:h-fit max-md:gap-x-4 md:w-fit md:flex-col md:gap-y-4">
				<div class="flex justify-center">
					{#if windowWidth > 768}
						{@render roothomebutton()}
					{/if}

					{#if windowWidth <= 768}
						<div class="flex flex-col">
							<button
								class="btn btn-lg btn-ghost max-md:self-center"
								aria-label="show navigation menu"
								onclick={() => (showSectionID = showSectionID === 'navigation-menu' ? '' : 'navigation-menu')}
							>
								<!--mdi:menu source: https://icon-sets.iconify.design-->
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
									<path fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'} d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
								</svg>
							</button>

							{#if showSectionID === 'navigation-menu'}
								<div class="relative h-0">
									<section
										class="absolute left-0 flex min-w-[200px] flex-col gap-y-4 rounded-md p-2 shadow-md shadow-gray-800 max-md:top-0 md:bottom-0 {State
											.Theme.value === Domain.Entities.Theme.Theme.DARK
											? 'bg-base-300'
											: 'bg-white'} overflow-hidden"
									>
										{@render roothomebutton()}
										<div class="divider mt-0 mb-0"></div>
										{@render navmenu(false)}
									</section>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</section>

			<div class="divider"></div>

			{#if windowWidth > 768}
				<section class="flex flex-[9.5] overflow-hidden">
					<div class="flex overflow-auto max-md:w-fit max-md:gap-x-4 md:h-fit md:flex-col md:gap-y-4">
						{@render navmenu()}
					</div>
				</section>
			{/if}

			<div class="divider"></div>

			<section class="flex justify-center max-md:w-fit max-md:flex-col max-md:gap-y-2 md:h-fit md:gap-x-2">
				<div class="flex max-md:flex-col max-md:gap-y-2 md:gap-x-2">
					<button
						class="btn btn-lg btn-ghost max-md:self-center"
						aria-label="show account menu"
						onclick={() => (showSectionID = showSectionID === 'account-menu' ? '' : 'account-menu')}
					>
						{#if windowWidth > 500 && windowWidth < 768}
							<span>{Domain.Entities.IamCredentials.GetOpenidName(iamCredential)}</span>
						{/if}
						<!--mdi:account source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path
								fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'}
								d="M12 19.2c-2.5 0-4.71-1.28-6-3.2c.03-2 4-3.1 6-3.1s5.97 1.1 6 3.1a7.23 7.23 0 0 1-6 3.2M12 5a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-3A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10c0-5.53-4.5-10-10-10"
							/>
						</svg>
					</button>

					{#if showSectionID === 'account-menu'}
						<div class="relative">
							<section
								class="absolute flex min-w-[200px] flex-col rounded-md p-1 shadow-md shadow-gray-800 max-md:top-0 max-md:right-0 md:bottom-0 md:left-0 {State
									.Theme.value === Domain.Entities.Theme.Theme.DARK
									? 'bg-base-300'
									: 'bg-white'}"
							>
								{#if windowWidth > 768}
									<div class="text-md text-center font-bold italic">{Domain.Entities.IamCredentials.GetOpenidName(iamCredential)}</div>
									<div class="divider mt-0 mb-0"></div>
								{/if}
								{#if State.Session.session}
									<button class="btn btn-ghost btn-md" onclick={handleSignout} aria-label="Sign Out"> Sign Out </button>
								{/if}
								{#if accountManagementEndpoint}
									<a class="link link-hover text-md flex w-full justify-center" href={accountManagementEndpoint} target="_blank">
										<span class="h-fit self-center font-bold">manage account</span>
										<span class="h-fit w-fit self-center">
											<!--mdi:open-in-new source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
												<path
													fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'}
													d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z"
												/>
											</svg>
										</span>
									</a>
								{/if}
							</section>
						</div>
					{/if}
				</div>
			</section>
		</nav>
	{/if}

	<main class="z-[1] flex flex-[9.5] overflow-hidden">
		{@render children()}
	</main>
</div>

{#snippet roothomebutton()}
	<a class="btn btn-md" href={Utils.Env.BasePath} aria-label="Go to root">
		<!--mdi:book-edit source: https://icon-sets.iconify.design-->
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
			<path
				fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'}
				d="M19.39 10.74L11 19.13V22H6c-1.11 0-2-.89-2-2V4a2 2 0 0 1 2-2h1v7l2.5-1.5L12 9V2h6a2 2 0 0 1 2 2v6.3c-.22.12-.43.26-.61.44M13 19.96V22h2.04l6.13-6.12l-2.04-2.05zm9.85-6.49l-1.32-1.32c-.2-.2-.53-.2-.72 0l-.98.98l2.04 2.04l.98-.98c.2-.19.2-.52 0-.72"
			/>
		</svg>
	</a>
{/snippet}

{#snippet navmenu(flexDirectionColumn: boolean = true)}
	{@render navitemhome(flexDirectionColumn)}

	{@render navitemabstractions(flexDirectionColumn)}

	{@render navitemstoragefiles(flexDirectionColumn)}

	{@render navitemsmetadatamodels(flexDirectionColumn)}

	{@render navitemsadministration(flexDirectionColumn)}
{/snippet}

{#snippet navitemsadministration(flexDirectionColumn: boolean = true)}
	{@const path = Domain.Entities.Url.WebsitePaths.Administration}

	<a
		class="link link-hover {currentLocationPath.startsWith(Utils.Env.GetLocationPath(path))
			? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
				? 'link-primary'
				: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
					? 'link-secondary'
					: 'link-accent'
			: ''} flex {flexDirectionColumn ? 'flex-col justify-center' : 'w-full flex-row gap-x-2'} self-center"
		href={State.GetGroupNavigationPath(path, data.directory_group_id)}
	>
		<!--mdi:administrator source: https://icon-sets.iconify.design-->
		<svg class={flexDirectionColumn ? 'self-center' : 'self-end'} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<path
				fill={currentLocationPath.startsWith(Utils.Env.GetLocationPath(path))
					? `var(${Utils.Theme.GetColor(State.ThemeColor.value)})`
					: State.Theme.value === Domain.Entities.Theme.Theme.DARK
						? 'white'
						: 'dark'}
				d="M12 12h7c-.53 4.11-3.28 7.78-7 8.92zH5V6.3l7-3.11M12 1L3 5v6c0 5.55 3.84 10.73 9 12c5.16-1.27 9-6.45 9-12V5z"
			/>
		</svg>
		<div class={flexDirectionColumn ? 'self-center' : 'self-end'}>Administration</div>
	</a>
{/snippet}

{#snippet navitemsmetadatamodels(flexDirectionColumn: boolean = true)}
	{@const path = Domain.Entities.Url.WebsitePaths.MetadataModels}
	<a
		class="link link-hover {currentLocationPath.startsWith(Utils.Env.GetLocationPath(path))
			? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
				? 'link-primary'
				: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
					? 'link-secondary'
					: 'link-accent'
			: ''} flex {flexDirectionColumn ? 'flex-col justify-center' : 'w-full flex-row gap-x-2'} self-center"
		href={State.GetGroupNavigationPath(path, data.directory_group_id)}
	>
		<div class="flex gap-x-1 {flexDirectionColumn ? 'self-center' : 'self-end'}">
			<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
				<path
					fill={currentLocationPath.startsWith(Utils.Env.GetLocationPath(path))
						? `var(${Utils.Theme.GetColor(State.ThemeColor.value)})`
						: State.Theme.value === Domain.Entities.Theme.Theme.DARK
							? 'white'
							: 'dark'}
					d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z"
				/>
			</svg>
			<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
				<path
					fill={currentLocationPath.startsWith(Utils.Env.GetLocationPath(path))
						? `var(${Utils.Theme.GetColor(State.ThemeColor.value)})`
						: State.Theme.value === Domain.Entities.Theme.Theme.DARK
							? 'white'
							: 'dark'}
					d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
				/>
			</svg>
		</div>
		<div class="{flexDirectionColumn ? 'self-center' : 'self-end'} text-center">Metadata Models</div>
	</a>
{/snippet}

{#snippet navitemstoragefiles(flexDirectionColumn: boolean = true)}
	{@const path = Domain.Entities.Url.WebsitePaths.StorageFiles}
	<a
		class="link link-hover {currentLocationPath.startsWith(Utils.Env.GetLocationPath(path))
			? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
				? 'link-primary'
				: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
					? 'link-secondary'
					: 'link-accent'
			: ''} flex {flexDirectionColumn ? 'flex-col justify-center' : 'w-full flex-row gap-x-2'} self-center"
		href={State.GetGroupNavigationPath(path, data.directory_group_id)}
	>
		<!--mdi:files source: https://icon-sets.iconify.design-->
		<svg class={flexDirectionColumn ? 'self-center' : 'self-end'} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
			<path
				fill={currentLocationPath.startsWith(Utils.Env.GetLocationPath(path))
					? `var(${Utils.Theme.GetColor(State.ThemeColor.value)})`
					: State.Theme.value === Domain.Entities.Theme.Theme.DARK
						? 'white'
						: 'dark'}
				d="M15 7h5.5L15 1.5zM8 0h8l6 6v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2M4 4v18h16v2H4a2 2 0 0 1-2-2V4z"
			/>
		</svg>
		<div class={flexDirectionColumn ? 'self-center' : 'self-end'}>Files</div>
	</a>
{/snippet}

{#snippet navitemabstractions(flexDirectionColumn: boolean = true)}
	{@const path = Domain.Entities.Url.WebsitePaths.Abstractions}
	<a
		class="link link-hover {currentLocationPath.startsWith(Utils.Env.GetLocationPath(path))
			? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
				? 'link-primary'
				: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
					? 'link-secondary'
					: 'link-accent'
			: ''} flex {flexDirectionColumn ? 'flex-col justify-center' : 'w-full flex-row gap-x-2'} self-center"
		href={State.GetGroupNavigationPath(path, data.directory_group_id)}
	>
		<!--mdi:notebook-edit source: https://icon-sets.iconify.design-->
		<svg class={flexDirectionColumn ? 'self-center' : 'self-end'} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
			<path
				fill={currentLocationPath.startsWith(Utils.Env.GetLocationPath(path))
					? `var(${Utils.Theme.GetColor(State.ThemeColor.value)})`
					: State.Theme.value === Domain.Entities.Theme.Theme.DARK
						? 'white'
						: 'dark'}
				d="M21.04 13.13c.14 0 .27.06.38.17l1.28 1.28c.22.21.22.56 0 .77l-1 1l-2.05-2.05l1-1c.11-.11.25-.17.39-.17m-1.97 1.75l2.05 2.05L15.06 23H13v-2.06zM3 7V5h2V4a2 2 0 0 1 2-2h6v7l2.5-1.5L18 9V2h1c1.05 0 2 .95 2 2v6L11 20v2H7c-1.05 0-2-.95-2-2v-1H3v-2h2v-4H3v-2h2V7zm2 0h2V5H5zm0 4v2h2v-2zm0 6v2h2v-2z"
			/>
		</svg>
		<div class={flexDirectionColumn ? 'self-center' : 'self-end'}>Abstractions</div>
	</a>
{/snippet}

{#snippet navitemhome(flexDirectionColumn: boolean = true)}
	{@const path = Domain.Entities.Url.WebsitePaths.Home}
	<a
		class="link link-hover {currentLocationPath.startsWith(Utils.Env.GetLocationPath(path))
			? State.ThemeColor.value === Domain.Entities.Theme.Color.PRIMARY
				? 'link-primary'
				: State.ThemeColor.value === Domain.Entities.Theme.Color.SECONDARY
					? 'link-secondary'
					: 'link-accent'
			: ''} flex {flexDirectionColumn ? 'flex-col justify-center' : 'w-full flex-row gap-x-2'} self-center"
		href={State.GetGroupNavigationPath(path, data.directory_group_id)}
	>
		<!--mdi:home source: https://icon-sets.iconify.design-->
		<svg class={flexDirectionColumn ? 'self-center' : 'self-end'} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
			<path
				fill={currentLocationPath.startsWith(Utils.Env.GetLocationPath(path))
					? `var(${Utils.Theme.GetColor(State.ThemeColor.value)})`
					: State.Theme.value === Domain.Entities.Theme.Theme.DARK
						? 'white'
						: 'dark'}
				d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z"
			/>
		</svg>
		<div class={flexDirectionColumn ? 'self-center' : 'self-end'}>Home</div>
	</a>
{/snippet}

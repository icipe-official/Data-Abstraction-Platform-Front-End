<script lang="ts">
	import { Domain, Interfaces, State } from '$lib'
	import { getContext } from 'svelte'
	import { Tab } from './util'

	const COMPONENT_NAME = 'home-page'

	let windowWidth: number = $state(0)

	let detailedView: boolean = $state(false)

	let currentTab: Tab = $state(Tab.LOGIN)

	let telemetry: Domain.Interfaces.ITelemetry | undefined = $derived.by(() => {
		return getContext(State.TelemetryContext.value)
	})

	async function handleSignout() {
		try {
			const fetchResponse = await new Interfaces.AuthenticatedFetch.Client(false).Fetch(Domain.Entities.Url.ApiUrlPaths.Iam.Signout)
			const fetchData = await fetchResponse.json()
			if (fetchResponse.ok) {
				State.Toast.Type = Domain.Entities.Toast.Type.SUCCESS
				State.Toast.Message = 'Sign out successful'
				State.ResetSession()
				window.location.reload()
			} else {
				throw [fetchResponse.status, fetchData]
			}
		} catch (e) {
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'Sign out failed', 'error', e)
			State.Toast.Type = Domain.Entities.Toast.Type.ERROR
			State.Toast.Message = 'Sign out failed'
		}
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex h-full w-full flex-1 gap-x-2 self-center overflow-hidden p-4">
	<section class="flex flex-1 flex-col justify-center overflow-hidden rounded-lg p-1">
		<div
			class="flex h-fit w-full flex-col gap-y-1 self-center overflow-hidden rounded-lg {State.Theme.value === Domain.Entities.Theme.Theme.DARK
				? 'bg-gray-700'
				: 'bg-white'} p-1 shadow-md shadow-gray-800"
		>
			<header class="flex flex-[0.5] justify-between">
				<!--mdi:book-edit source: https://icon-sets.iconify.design-->
				<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24">
					<path
						fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'}
						d="M19.39 10.74L11 19.13V22H6c-1.11 0-2-.89-2-2V4a2 2 0 0 1 2-2h1v7l2.5-1.5L12 9V2h6a2 2 0 0 1 2 2v6.3c-.22.12-.43.26-.61.44M13 19.96V22h2.04l6.13-6.12l-2.04-2.05zm9.85-6.49l-1.32-1.32c-.2-.2-.53-.2-.72 0l-.98.98l2.04 2.04l.98-.98c.2-.19.2-.52 0-.72"
					/>
				</svg>
				<section class="flex flex-[9.5] justify-center">
					<div role="tablist" class="tabs tabs-box w-fit">
						<button
							role="tab"
							class="flex-1 tab{currentTab === Tab.LOGIN ? ' tab-active text-primary-content [--tab-bg:var(--color-primary)]' : ''}"
							onclick={() => (currentTab = Tab.LOGIN)}
						>
							Login/Register
						</button>

						<button
							role="tab"
							class="flex-1 tab{currentTab === Tab.ABOUT_US ? ' tab-active btn-primary text-primary-content [--tab-bg:var(--color-primary)]' : ''}"
							onclick={() => (currentTab = Tab.ABOUT_US)}
						>
							About us
						</button>
					</div>
				</section>
				{#if State.Session.session?.iam_credential}
					<button
						class="btn btn-circle btn-ghost btn-md tooltip tooltip-left tooltip-primary self-center"
						onclick={handleSignout}
						data-tip="Sign out"
					>
						<!--mdi:logout source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
							<path
								fill={State.Theme.value === Domain.Entities.Theme.Theme.DARK ? 'white' : 'dark'}
								d="m17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5M4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4z"
							/>
						</svg>
					</button>
				{/if}
			</header>

			<main class="flex flex-[9.5] flex-col gap-y-1 overflow-hidden rounded-lg p-2 shadow-inner shadow-gray-800">
				{#if currentTab === Tab.LOGIN}
					{#await import('$lib/components/SignInUp/Component.svelte') then { default: SignInUp }}
						<SignInUp
							theme={State.Theme.value}
							themecolor={State.ThemeColor.value}
							{telemetry}
							session={State.Session.session}
							openidendpoints={State.OpenidEndpoints.value}
						></SignInUp>
					{/await}
				{:else if currentTab === Tab.ABOUT_US}
					<div class="flex flex-col gap-y-1 overflow-auto">
						<div class="text-lg font-bold">Background</div>
						<div class="text-sm">
							Data abstraction constitutes a fundamental component of systematic reviews and scientific research, demanding meticulous attention to
							detail and precision. Nevertheless, conventional data abstraction methods frequently prove laborious, prone to errors, and inadequately
							equipped to facilitate source tracking and the integration of diverse data categories. In response to these persistent challenges, we
							introduce the Data Abstraction Tool (DAT), an intuitive software application poised to revolutionize the data abstraction process.
						</div>
						<div class="text-lg font-bold">Methods</div>
						<div class="text-sm">
							Historically, data abstraction has been reliant on manual procedures, involving the extraction of information from both published and
							unpublished sources. However, this manual approach is notorious for its time-intensive and resource-draining nature, impeding the
							realization of a comprehensive, all-encompassing data platform. To confront this challenge head-on, we present DAT—an innovative
							web-based data-abstraction platform harnessing the capabilities of semantic web technologies to automate data extraction from journal
							publications. Our methodology's effectiveness is empirically demonstrated through an evaluation of its performance in a use case focused
							on malaria vectors data abstraction, showcasing remarkable reductions in time expenditure and improvements in accuracy compared to
							manual techniques.
						</div>
						<div class="text-lg font-bold">Conclusions</div>
						<div class="text-sm">
							DAT represents a publicly accessible web tool tailored for the manual abstraction of data, fostering a unified and cohesive environment
							for data management. It stands as a valuable resource serving both researchers and policymakers alike, promising to expedite progress in
							the realm of data abstraction. This advancement is poised to facilitate the establishment of expansive databases encompassing diverse
							datasets, marking a significant stride towards data integration and synthesis in research endeavors.
						</div>
					</div>
				{/if}
			</main>
		</div>
	</section>

	{#if windowWidth > 1200 && !detailedView}
		<section
			class="flex flex-1 flex-col justify-center overflow-hidden rounded-lg p-1 shadow-md shadow-gray-800 {State.Theme.value ===
			Domain.Entities.Theme.Theme.DARK
				? 'bg-gray-700'
				: 'bg-white'}"
		>
			{#await import('$lib/components/Intro/Poster/Component.svelte') then { default: IntroPoster }}
				<IntroPoster></IntroPoster>
			{/await}
		</section>
	{/if}
</div>

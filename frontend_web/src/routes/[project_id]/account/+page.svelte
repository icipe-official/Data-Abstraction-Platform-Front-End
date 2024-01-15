<script lang="ts">
	import { goto } from '$app/navigation'
	import { Shared, FETCH_ERROR, OPTS_SPLIT } from '$lib/constants'
	import { CurrentProject, CurrentUser, Loading, LoadingMessage, ToastMessage, ToastType } from '$lib/stores'
	import { base } from '$app/paths'
	import { PUBLIC_API_URL, PUBLIC_VERSION } from '$env/static/public'
	import Icon from '$lib/components/Icon.svelte'

	async function handleLogout() {
		$Loading = true
		$LoadingMessage = 'Logging out...'
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/iam/logout`, {
				credentials: 'include'
			})
			const fetchData = await fetchResponse.json()
			if (fetchResponse.ok) {
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = fetchData.message
				$CurrentUser = null
				goto(`${base}/iam/login`)
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = fetchData.message
			}
		} catch {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$Loading = false
		$LoadingMessage = null
	}
</script>

{#if $CurrentProject != null}
	<div class="flex flex-col self-center md:w-[60vw] max-md:w-full w-full max-w-[95%] max-md:max-h-[95%] bg-white rounded-md shadow-sm shadow-gray-800 p-2 overflow-hidden space-y-2">
		<header class="flex-[0.5] flex">
			<span class="flex-[9.5] text-lg font-bold self-center">
				Account in <span class="text-secondary">{$CurrentProject.ProjectName.toLowerCase().includes('project') ? $CurrentProject.ProjectName.toLocaleUpperCase() : `${$CurrentProject?.ProjectName.toLocaleUpperCase()} project`}</span>
			</span>
			<span class="flex-[0.5] flex justify-end">
				<a class="btn btn-regular btn-ghost w-fit self-center tooltip tooltip-bottom flex content-center" href="{base}/" data-tip="Switch projects">
					<Icon type="mdi:city-switch" color={Shared.Colors.NEUTRAL} />
				</a>
				<button class="btn btn-regular btn-ghost w-fit self-center tooltip tooltip-bottom" on:click={handleLogout} data-tip="Logout">
					<Icon type="mdi:exit-to-app" color={Shared.Colors.NEUTRAL} />
				</button>
			</span>
		</header>
		<div class="divider" />
		{#if $CurrentUser}
			<main class="flex-[9] overflow-auto space-y-2 max-h-[70vh]">
				<section class="space-y-2">
					<div><span class="font-bold">Name</span>: {$CurrentUser.Name}</div>
					<div><span class="font-bold">Contacts</span></div>
					{#if $CurrentUser.Contacts}
						{#each $CurrentUser.Contacts as c, index}
							<div>{index + 1}: {c.split(OPTS_SPLIT)[0]} - {c.split(OPTS_SPLIT)[1]}</div>
						{/each}
					{/if}
				</section>
				{#if $CurrentProject}
					<section class="overflow-x-hidden overflow-y-auto">
						<div class="font-bold text-xl text-secondary">Roles assigned</div>
						<section class="flex flex-col space-y-1">
							{#each $CurrentProject.ProjectRoles as cpr, index}
								<div class="text-black flex">
									<span class="self-center">{index + 1}: {cpr.ProjectRoleID.replaceAll('_', ' ')}</span>
								</div>
							{/each}
						</section>
					</section>
				{/if}
			</main>
		{/if}
		<div class="divider" />
		<footer class="flex-[0.5] flex flex-col space-y-1">
			<footer class="flex-[0.5] flex justify-between">
				<img src="{base}/icipe_logo.png" alt="icipe logo" class="max-w-[10vw] max-h-[5vh] self-center" />
				<img src="{base}/university_of_oxford_logo.png" alt="university of oxford logo" class="max-w-[10vw] max-h-[5vh] self-center" />
				<img src="{base}/vector_atlas_logo.png" alt="vector atlas logo" class="max-w-[10vw] max-h-[10vh] self-center" />
				<img src="{base}/malaria_atlas_project_logo.png" alt="malaria atlas logo" class="max-w-[10vw] max-h-[5vh] self-center" />
				<img src="{base}/bill_and_melinda_gates_logo.png" alt="bill and melinda gates foundation logo" class="max-w-[10vw] max-h-[5vh] self-center" />
			</footer>
			<div class="font-bold text-xs text-center">{PUBLIC_VERSION}</div>
		</footer>
	</div>
{:else}
	<div class="text-center text-red-500 text-lg mt-4">Invalid Request</div>
{/if}

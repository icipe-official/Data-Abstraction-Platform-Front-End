<script lang="ts">
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { base } from '$app/paths'
	import { PUBLIC_API_URL, PUBLIC_VERSION } from '$env/static/public'
	import { FETCH_ERROR, Shared } from '$lib/constants'
	import Intro from '$lib/misc/Intro.svelte'
	import { Loading, LoadingMessage, ToastType, ToastMessage, CurrentUser } from '$lib/stores'
	import Icon from '$lib/components/Icon.svelte'
	import { LocalDateFromString, LocalTimeFromString } from '$lib/utils'

	async function handleLogout() {
		$Loading = true
		$LoadingMessage = 'logging out...'
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/iam/logout`, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = data.message
				$LoadingMessage = null
				$Loading = false
				$CurrentUser = null
				goto(`${base}/iam/login`)
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = data.message
			}
		} catch {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$LoadingMessage = null
		$Loading = false
	}
</script>

{#if browser}
	<div class="w-full h-full overflow-hidden flex flex-col">
		<div class="flex-[9.5] flex justify-center overflow-hidden">
			<section class="flex-[2] flex justify-center">
				{#if $CurrentUser !== null && Object.keys($CurrentUser).length > 0}
					<div class="max-w-[95%] max-h-[90%] w-full h-full self-center bg-white rounded-md shadow-sm shadow-gray-600 overflow-hidden p-2 flex flex-col">
						<header class="flex-1 flex space-x-1 justify-between">
							<div class="flex-[0.5] self-center w-fit h-fit">
								<img src="{base}/logo.png" alt="data admin logo" class="w-[100%] h-[100%]" />
							</div>
							<div class="flex-[9] text-center text-3xl font-bold h-fit self-center">
								<span class="text-neutral">CHOOSE A</span> <span class="text-primary">PROJECT</span>
							</div>
							<div class="flex-[0.5] flex justify-end">
								<button class="btn btn-regular btn-ghost w-fit self-center justify-self-end tooltip tooltip-bottom" on:click={handleLogout} data-tip="logout">
									<Icon type="mdi:exit-to-app" color={Shared.Colors.NEUTRAL} />
								</button>
							</div>
						</header>
						<span class="text-base text-neutral font-bold"><span class="text-primary">User</span>: {$CurrentUser.Name}</span>
						<main class="flex-[9] h-full w-full overflow-auto rounded-md">
							{#if Array.isArray($CurrentUser.ProjectsRoles) && $CurrentUser.ProjectsRoles.length > 0}
								<table class="table w-full shadow-inner shadow-gray-800 rounded-md">
									<thead class="shadow-sm shadow-gray-600 bg-secondary text-primary sticky top-0">
										<tr>
											<th>#</th>
											<th>Name</th>
											<th>Description</th>
											<th>Created On</th>
										</tr>
									</thead>
									<tbody>
										{#each $CurrentUser.ProjectsRoles as cup, index}
											<tr class="hover">
												<td>{index + 1}</td>
												<td class="font-bold"><a class="w-full text-left" href="{base}/{cup.ProjectID}">{cup.ProjectName}</a></td>
												<td><a class="w-full break-words text-left" href="{base}/{cup.ProjectID}">{cup.ProjectDescription}</a></td>
												<td><a class="w-full text-left" href="{base}/{cup.ProjectID}">{LocalDateFromString(cup.ProjectCreatedOn)} at {LocalTimeFromString(cup.ProjectCreatedOn)}</a></td>
											</tr>
										{/each}
									</tbody>
								</table>
							{:else}
								<div class="w-full h-full bg-gray-200 flex justify-center">
									<span class="text-2xl w-fit h-fit self-center flex">
										<span class="text-center">No projects found<br />You have not been assigned any projects</span>
										<Icon type="mdi:binoculars" iconSize="56" color={Shared.Colors.ACCENT} />
									</span>
								</div>
							{/if}
						</main>
					</div>
				{:else}
					<div class="max-w-[500px] w-full h-fit self-center bg-white rounded-md shadow-sm shadow-gray-600 overflow-hidden p-2 flex flex-col space-y-1">
						<header class="text-3xl text-center font-bold">
							<div>Welcome to the</div>
							<h1 class="">DATA ADMINIS<span class="text-primary-focus">TRATION PLATFORM</span></h1>
						</header>
						<main class="text-lg font-bold text-center">
							Kindly <a class="link-secondary link-hover" href="{base}/iam/login">Log in</a> to continue...
						</main>
					</div>
				{/if}
			</section>
			<section class="flex-[3] flex justify-center max-md:hidden">
				<Intro />
			</section>
		</div>
		<div class="text-sm self-center text-center text-accent p-2 bg-accent-text w-fit h-fit">Version: {PUBLIC_VERSION}</div>
	</div>
{:else}
	<div class="w-full h-full flex justify-center bg-gray-400 opacity-90">
		<div class="w-fit h-fit self-center flex flex-col">
			<div class="w-fit h-fit self-center">
				<span class="loading loading-ball loading-sm text-accent" />
				<span class="loading loading-ball loading-md text-secondary" />
				<span class="loading loading-ball loading-lg text-primary" />
			</div>
			<div class="text-lg text-white">Loading...</div>
		</div>
	</div>
{/if}

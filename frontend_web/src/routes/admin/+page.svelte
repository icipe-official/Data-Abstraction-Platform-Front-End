<script lang="ts">
	import { browser } from '$app/environment'
	import { CurrentUser } from '$lib/stores'
	import Directory from '$lib/admin/Directory.svelte'
	import Projects from '$lib/admin/Projects.svelte'
	import Storage from '$lib/admin/Storage.svelte'
	import { LOGO_URL, Shared } from '$lib/constants'
	import Icon from '$lib/components/Icon.svelte'

	enum Tab {
		DIRECTORY = 'DIRECTORY',
		PROJECTS = 'PROJECTS',
		STORAGE = 'STORAGE'
	}

	let currentTab: Tab = Tab.DIRECTORY
</script>

{#if browser && $CurrentUser !== null && $CurrentUser.SystemUserCreatedOn !== '0001-01-01T00:00:00Z'}
	<div class="flex flex-col self-center w-full h-full max-w-[98%] max-h-[98%] p-2 overflow-hidden bg-white rounded-md shadow-sm shadow-gray-800">
		<header class="flex-[0.5] flex justify-between">
			<section role="tablist" class="tabs tabs-boxed text-xl">
				<button role="tab" class="tab self-center" class:tab-active={currentTab === Tab.DIRECTORY} on:click={() => (currentTab = Tab.DIRECTORY)}>Directory</button>
				<button role="tab" class="tab self-center" class:tab-active={currentTab === Tab.PROJECTS} on:click={() => (currentTab = Tab.PROJECTS)}>Projects</button>
				<button role="tab" class="tab self-center" class:tab-active={currentTab === Tab.STORAGE} on:click={() => (currentTab = Tab.STORAGE)}>Storage</button>
			</section>
			<section class="flex">
				<a class="flex-[0.5] flex tooltip tooltip-left btn-ghost rounded-md p-1" data-tip="Need help? Watch a mini-tutorial" href="https://vimeo.com/886765717?share=copy#t=0" target="_blank">
					<img src={LOGO_URL} alt="data admin logo" class="max-w-[5vw] max-h-[5vh] self-center" />
					<div class="w-fit h-fit">
						<Icon type="mdi:help-circle" iconSize="23" color={Shared.Colors.PRIMARY} />
					</div>
				</a>
			</section>
		</header>
        <div class="divider"/>
		<main class="flex-[9.5] flex flex-col overflow-hidden">
			{#if currentTab === Tab.DIRECTORY}
				<Directory />
			{:else if currentTab === Tab.PROJECTS}
				<Projects />
			{:else if currentTab === Tab.STORAGE}
				<Storage />
			{/if}
		</main>
	</div>
{/if}

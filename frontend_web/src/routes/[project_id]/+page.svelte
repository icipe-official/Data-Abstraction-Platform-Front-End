<script lang="ts">
	import { base } from '$app/paths'
	import { CurrentProject } from '$lib/stores'
	import { LocalDateFromString, LocalTimeFromString } from '$lib/utils'
</script>

{#if $CurrentProject}
	<div class="flex flex-col self-center md:w-[60vw] max-md:w-[80%] min-h-[30vh] bg-white rounded-md shadow-sm shadow-gray-600 overflow-hidden p-2 space-y-2">
		<header class="flex-[0.5] flex">
			<h1 class="flex-[8] text-center text-2xl text-primary font-bold h-fit self-center">
				{$CurrentProject.ProjectName.toLowerCase().includes('project') ? $CurrentProject.ProjectName.toLocaleUpperCase() : `${$CurrentProject?.ProjectName.toLocaleUpperCase()} project`}
			</h1>
		</header>
		<div class="divider" />
		<main class="flex-[9] flex flex-col space-y-2 justify-between">
			<div class="text-lg text-secondary">{$CurrentProject?.ProjectDescription}</div>
			<div class="text-md text-neutral"><span class="font-bold">Created on</span>: {LocalDateFromString($CurrentProject.ProjectCreatedOn)} at {LocalTimeFromString($CurrentProject.ProjectCreatedOn)}</div>
		</main>
		<div class="divider" />
		<footer class="flex-[0.5] flex justify-between">
			<img src="{base}/icipe_logo.png" alt="icipe logo" class="max-w-[10vw] max-h-[5vh] self-center" />
			<img src="{base}/university_of_oxford_logo.png" alt="university of oxford logo" class="max-w-[10vw] max-h-[5vh] self-center" />
			<img src="{base}/vector_atlas_logo.png" alt="vector atlas logo" class="max-w-[10vw] max-h-[10vh] self-center" />
			<img src="{base}/malaria_atlas_project_logo.png" alt="malaria atlas logo" class="max-w-[10vw] max-h-[5vh] self-center" />
			<img src="{base}/bill_and_melinda_gates_logo.png" alt="bill and melinda gates foundation logo" class="max-w-[10vw] max-h-[5vh] self-center" />
		</footer>
	</div>
{/if}

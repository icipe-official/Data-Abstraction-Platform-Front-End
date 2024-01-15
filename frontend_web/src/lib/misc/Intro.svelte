<script lang="ts">
	import { base } from '$app/paths'
	import Icon from '$lib/components/Icon.svelte'
	import { Shared } from '$lib/constants'

	let slideNumber = 0
	setInterval(() => {
		slideNumber = slideNumber === 2 ? 0 : slideNumber + 1
	}, 4000)
</script>

<div class="self-center w-[80%] h-[80%] bg-white shadow-md shadow-gray-800 rounded-md p-2 flex flex-col space-x-2">
	<header class="flex-[0.5]">
		<h1 class="text-3xl text-center font-bold">DATA ADMINIS<span class="text-primary-focus">TRATION PLATFORM</span></h1>
	</header>
	<main class="flex-[9] flex justify-center">
		{#if slideNumber === 0}
			<div class="w-full h-fit self-center flex flex-col space-y-2 text-neutral">
				<div class="flex-1 flex-col h-full">
					<div class="flex-[9] flex justify-center"><Icon type="material-symbols:construction" color={Shared.Colors.NEUTRAL} iconSize="200" /></div>
					<div class="flex-1 text-3xl text-center">Prepare</div>
				</div>
				<div class="flex-[9]">
					<ul class="text-center text-xl">
						<li>Setup your team / determine your audience</li>
						<li>Upload documents to abstract</li>
						<li>Create predefined lists for reuse across templates when collecting data using a dropdown</li>
						<li>Design forms and templates</li>
					</ul>
				</div>
			</div>
		{:else if slideNumber === 1}
			<div class="w-full h-fit self-center flex flex-col space-y-2 text-secondary">
				<div class="flex-1 flex-col h-full">
					<div class="flex-[9] flex justify-center"><Icon type="game-icons:plant-watering" color={Shared.Colors.SECONDARY} iconSize="200" /></div>
					<div class="flex-1 text-3xl text-center h-full font-bold">Collect</div>
				</div>
				<div class="flex-[9]">
					<ul class="text-center text-xl">
						<li>Abstract data</li>
						<li>Conduct online surveys (coming soon)</li>
					</ul>
				</div>
			</div>
		{:else if slideNumber === 2}
			<div class="w-full h-fit self-center flex flex-col space-y-2 text-primary">
				<div class="flex-1 flex-col h-full">
					<div class="flex-[9] flex justify-center"><Icon type="material-symbols:travel-explore" color={Shared.Colors.PRIMARY} iconSize="200" /></div>
					<div class="flex-1 text-3xl text-center">Explore</div>
				</div>
				<div class="flex-[9]">
					<ul class="text-center text-xl">
						<li>View data as a table (advanced filtering coming soon)</li>
						<li>Generate excel workbooks</li>
						<li>Visualize data (coming soon)</li>
						<li>Let other systems consume the data via API endpoints</li>
					</ul>
				</div>
			</div>
		{/if}
	</main>
	<footer class="flex-[0.5] flex justify-between">
		<img src="{base}/icipe_logo.png" alt="icipe logo" class="max-w-[10vw] max-h-[5vh] self-center" />
		<img src="{base}/university_of_oxford_logo.png" alt="university of oxford logo" class="max-w-[10vw] max-h-[5vh] self-center" />
		<img src="{base}/vector_atlas_logo.png" alt="vector atlas logo" class="max-w-[10vw] max-h-[10vh] self-center" />
		<img src="{base}/malaria_atlas_project_logo.png" alt="malaria atlas logo" class="max-w-[10vw] max-h-[5vh] self-center" />
		<img src="{base}/bill_and_melinda_gates_logo.png" alt="bill and melinda gates foundation logo" class="max-w-[10vw] max-h-[5vh] self-center" />
	</footer>
</div>

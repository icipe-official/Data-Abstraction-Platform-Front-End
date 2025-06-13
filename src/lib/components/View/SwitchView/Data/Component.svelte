<script lang="ts">
	import { Domain } from '$lib'
	import type { View } from '../..'

	interface Props {
		theme?: Domain.Entities.Theme.Theme
		themecolor?: Domain.Entities.Theme.Color
		title?: string
		view?: View
		updateview?: (value: View) => void
	}

	let {
		view = 'list',
		updateview = undefined,
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT
	}: Props = $props()

	function onupdateview() {
		if (updateview) {
			updateview(view)
		}
	}
</script>

<button
	class="btn btn-md btn-ghost tooltip tooltip-left {themecolor === Domain.Entities.Theme.Color.PRIMARY
		? 'tooltip-primary'
		: themecolor === Domain.Entities.Theme.Color.SECONDARY
			? 'tooltip-secondary'
			: 'tooltip-accent'}"
	onclick={() => {
		if (view === 'list') {
			view = 'table'
		} else if (view === 'table') {
			view = 'detailed'
		} else if (view === 'detailed') {
			view = 'list'
		}

		onupdateview()
	}}
	aria-label="switch view"
	data-tip="Switch to {view === 'list' ? 'table' : view === 'table' ? 'detailed' : view === 'detailed' ? 'list' : 'NA'} view"
>
	{#if view === 'list'}
		<!--mdi:view-list source: https://icon-sets.iconify.design-->
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<path
				fill={theme == Domain.Entities.Theme.Theme.LIGHT ? 'black' : 'white'}
				d="M9 5v4h12V5M9 19h12v-4H9m0-1h12v-4H9M4 9h4V5H4m0 14h4v-4H4m0-1h4v-4H4z"
			/>
		</svg>
	{:else if view === 'table'}
		<!--mdi:table source: https://icon-sets.iconify.design-->
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<path
				fill={theme == Domain.Entities.Theme.Theme.LIGHT ? 'black' : 'white'}
				d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m0 4v4h6V8zm8 0v4h6V8zm-8 6v4h6v-4zm8 0v4h6v-4z"
			/>
		</svg>
	{:else if view === 'detailed'}
		<!--bxs:detail source: https://icon-sets.iconify.design-->
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<path
				fill={theme == Domain.Entities.Theme.Theme.LIGHT ? 'black' : 'white'}
				d="M20 3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-9 14H5v-2h6zm8-4H5v-2h14zm0-4H5V7h14z"
			/>
		</svg>
	{:else}
		<span class="text-error">{view}</span>
	{/if}
</button>

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
		if (view === 'simple') {
			view = 'detailed'
		} else if (view === 'detailed') {
			view = 'simple'
		}

		onupdateview()
	}}
	aria-label="switch view"
	data-tip="Switch to {view === 'simple' ? 'detailed' : view === 'detailed' ? 'simple' : 'NA'} view"
>
	{#if view === 'simple'}
		<!--mdi:view-compact source: https://icon-sets.iconify.design-->
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<path fill={theme == Domain.Entities.Theme.Theme.LIGHT ? 'black' : 'white'} d="M3 19h6v-7H3zm7 0h12v-7H10zM3 5v6h19V5z" />
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

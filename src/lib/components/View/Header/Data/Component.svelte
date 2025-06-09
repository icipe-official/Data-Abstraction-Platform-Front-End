<script lang="ts">
	import { Domain, Utils } from '$lib'
	import type { View } from '../..'
	import SwitchViewData from '../../SwitchView/Data/Component.svelte'

	const COMPONENT_NAME = 'view-directory-group-header'

	interface Props {
		theme?: Domain.Entities.Theme.Theme
		themecolor?: Domain.Entities.Theme.Color
		title?: string
		view?: View
		updateview?: (value: View) => void
	}

	let {
		title = 'View Data',
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

<section class="flex justify-between">
	<span class="h-fit self-center text-sm italic">{title}</span>

	<SwitchViewData
		{view}
		{theme}
		{themecolor}
		updateview={(value) => {
			view = value
			onupdateview()
		}}
	></SwitchViewData>
</section>

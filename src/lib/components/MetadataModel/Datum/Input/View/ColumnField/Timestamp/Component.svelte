<!--
@component

Props:
-
-->
<script lang="ts">
	import { Domain, MetadataModel } from '$lib'
	import DateTime from '$lib/components/DateTime/Component.svelte'

	const COMPONENT_NAME = 'metadata-model-datum-input-view-form-field-timestamp'

	interface Props {
		field: any
		arrayindexplaceholders?: number[]
		themecolor: Domain.Entities.Theme.Color
		theme: Domain.Entities.Theme.Theme
		getdata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => any
		updatedata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[], value: any) => void
		deletedata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
	}

	let { field, arrayindexplaceholders = [], themecolor, theme, getdata, updatedata, deletedata }: Props = $props()

	let fgKey: string = $derived(`${field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`)

	let value: string | number | undefined = $derived.by(() => {
		const d = getdata(fgKey, arrayindexplaceholders)

		if (typeof d === 'string' || typeof d === 'number') {
			return d
		}

		return undefined
	})
</script>

<DateTime
	{theme}
	{themecolor}
	datetimeinputformat={field[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT]}
	{value}
	updatedatetime={(value: string | undefined) => {
		if (typeof value === 'string') {
			updatedata(fgKey, arrayindexplaceholders, value)
		} else {
			deletedata(fgKey, arrayindexplaceholders)
		}
	}}
	disabled={field[MetadataModel.FgProperties.FIELD_GROUP_INPUT_DISABLE]}
></DateTime>

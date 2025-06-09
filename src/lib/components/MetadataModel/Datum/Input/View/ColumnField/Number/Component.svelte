<!--
@component

Props:
-
-->
<script lang="ts">
	import { Domain, MetadataModel } from '$lib'

	const COMPONENT_NAME = 'metadata-model-datum-input-view-form-field-number'

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

	let value: number | undefined = $derived.by(() => {
		const d = getdata(fgKey, arrayindexplaceholders)

		if (typeof d === 'number') {
			return d
		}

		return undefined
	})
</script>

<input
	class="input w-full min-w-[200px] flex-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
		? 'input-primary'
		: themecolor === Domain.Entities.Theme.Color.SECONDARY
			? 'input-secondary'
			: 'input-accent'}"
	type="number"
	placeholder={field[MetadataModel.FgProperties.FIELD_PLACEHOLDER] || `Enter ${MetadataModel.GetFieldGroupName(field)}...`}
	{value}
	oninput={(event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		const v = event.currentTarget.value
		if (v.length > 0) {
			updatedata(fgKey, arrayindexplaceholders, Number(v))
		} else {
			deletedata(fgKey, arrayindexplaceholders)
		}
	}}
	disabled={field[MetadataModel.FgProperties.FIELD_GROUP_INPUT_DISABLE]}
/>

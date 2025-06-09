<!--
@component

Props:
-
-->
<script lang="ts">
	import { Domain, MetadataModel } from '$lib'

	const COMPONENT_NAME = 'metadata-model-datum-input-view-form-field-text'

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

	let value: string = $derived.by(() => {
		const d = getdata(fgKey, arrayindexplaceholders)

		if (typeof d === 'string') {
			return d
		}

		if (typeof d === 'number' || typeof d === 'boolean') {
			return `${d}`
		}

		return ''
	})

	function handleTextInput(value: string) {
		if (value.length > 0) {
			updatedata(fgKey, arrayindexplaceholders, value)
		} else {
			deletedata(fgKey, arrayindexplaceholders)
		}
	}
</script>

{#if field[MetadataModel.FgProperties.FIELD_UI] === MetadataModel.FieldUi.TEXTAREA}
	<textarea
		class="join-item textarea w-full min-w-[250px] flex-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
			? 'textarea-primary'
			: themecolor === Domain.Entities.Theme.Color.SECONDARY
				? 'textarea-secondary'
				: 'textarea-accent'}"
		placeholder={field[MetadataModel.FgProperties.FIELD_PLACEHOLDER] || `Enter ${MetadataModel.GetFieldGroupName(field)}...`}
		{value}
		oninput={(event: Event & { currentTarget: EventTarget & HTMLTextAreaElement }) => {
			handleTextInput(event.currentTarget.value)
		}}
		disabled={field[MetadataModel.FgProperties.FIELD_GROUP_INPUT_DISABLE]}
	></textarea>
{:else}
	<input
		class="join-item input w-full min-w-[200px] flex-1 {themecolor === Domain.Entities.Theme.Color.PRIMARY
			? 'input-primary'
			: themecolor === Domain.Entities.Theme.Color.SECONDARY
				? 'input-secondary'
				: 'input-accent'}"
		type="text"
		placeholder={field[MetadataModel.FgProperties.FIELD_PLACEHOLDER] || `Enter ${MetadataModel.GetFieldGroupName(field)}...`}
		{value}
		oninput={(event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
			handleTextInput(event.currentTarget.value)
		}}
		disabled={field[MetadataModel.FgProperties.FIELD_GROUP_INPUT_DISABLE]}
	/>
{/if}

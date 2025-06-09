<!--
@component

Props:
-
-->
<script lang="ts">
	import { Domain, MetadataModel } from '$lib'
	import MultiSelect from '$lib/components/MultiSelect/Component.svelte'
	import type { SelectOption } from '$lib/components/MultiSelect/util'

	const COMPONENT_NAME = 'metadata-model-datum-input-view-form-field-select'

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

	let selectoptions: SelectOption[] = $derived.by(() => {
		if (Array.isArray(field[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS])) {
			return (field[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS] as MetadataModel.ISelectOption[]).map((fss) => {
				return {
					label: fss[MetadataModel.FSelectProperties.LABEL] as string,
					value: fss[MetadataModel.FSelectProperties.VALUE]
				}
			})
		}

		return []
	})

	let selectedoptions: SelectOption[] | SelectOption | undefined = $derived.by(() => {
		const fieldDatum = getdata(field[MetadataModel.FgProperties.FIELD_GROUP_KEY], arrayindexplaceholders)
		const selectOptions = (field[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS] as MetadataModel.ISelectOption[]).map((fss) => {
			return {
				label: fss[MetadataModel.FSelectProperties.LABEL] as string,
				value: fss[MetadataModel.FSelectProperties.VALUE]
			}
		})
		let selectedOptions: any[] = []
		for (const so of selectOptions) {
			if ((Array.isArray(fieldDatum) && fieldDatum.includes(so.value)) || so.value === fieldDatum) {
				selectedOptions = [...selectedOptions, so]
			}
		}

		return selectedOptions.length > 0 ? selectedOptions : undefined
	})
</script>

<MultiSelect
	{theme}
	{themecolor}
	placeholder={field[MetadataModel.FgProperties.FIELD_PLACEHOLDER] || `Select ${MetadataModel.GetFieldGroupName(field)}...`}
	{selectoptions}
	{selectedoptions}
	multiselect={field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] !== 1}
	maxselectedoptions={field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] || 0}
	updateselectedoptions={(value: SelectOption[] | SelectOption | undefined) => {
		if (typeof value === 'object' && value !== null) {
			if (Array.isArray(value)) {
				updatedata(
					field[MetadataModel.FgProperties.FIELD_GROUP_KEY],
					arrayindexplaceholders,
					value.map((so) => so.value)
				)
			} else {
				updatedata(field[MetadataModel.FgProperties.FIELD_GROUP_KEY], arrayindexplaceholders, [value.value])
			}
		} else {
			deletedata(field[MetadataModel.FgProperties.FIELD_GROUP_KEY], arrayindexplaceholders)
		}
	}}
	contentperpage={5}
	disabled={field[MetadataModel.FgProperties.FIELD_GROUP_INPUT_DISABLE]}
></MultiSelect>

<!--
@component

Edit field/group properties related to column position.

Props:
- fieldgroup -
- themecolor -
- theme - 
- updatefieldgroup -
-->
<script lang="ts">
	import { Component, Domain, Json, MetadataModel, Utils } from '$lib'
	import { untrack } from 'svelte'
	import { FooterSnippet } from '../Snippets/Footer.svelte'
	import { fade } from 'svelte/transition'

	const COMPONENT_NAME = 'metadata-model-edit-field-group-column-position'

	interface Props {
		fieldgroup: any
		metadatamodel: any
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		updatefieldgroup: (fieldgroup: any) => void
		telemetry?: Domain.Interfaces.ITelemetry
	}

	let {
		fieldgroup,
		metadatamodel,
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		updatefieldgroup,
		telemetry
	}: Props = $props()

	let metadataModel: string = $derived(JSON.stringify(metadatamodel) || '')

	let columnFields: any[] = $derived.by(() => {
		try {
			let cf = new MetadataModel.Extract2DFields(JSON.parse(metadataModel), false, false, false)

			cf.Extract()

			return cf.Fields
		} catch (e) {
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'error extracting 2D fields for columnFields.', 'error', e)
			return []
		}
	})

	let noOfColumnFields: number = $derived(columnFields.length)

	let columnFieldsStart: number = $state(0)

	let columnFieldsEnd: number = $state(0)

	let originalPosition: number = $derived.by(() => {
		for (let fIndex = 0; fIndex < columnFields.length; fIndex++) {
			if (columnFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_KEY] === fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]) {
				return fIndex
			}
		}

		return -1
	})

	let pathToField = $derived(
		(fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).replace(new RegExp(MetadataModel.ARRAY_PATH_REGEX_SEARCH, 'g'), '[0]')
	)

	let targetPositionFieldGroupKey: string | undefined = $derived.by(() => {
		if (fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION]) {
			if (
				typeof fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION][MetadataModel.Field2dPositionProperties.FIELD_GROUP_KEY] === 'string'
			) {
				return fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION][MetadataModel.Field2dPositionProperties.FIELD_GROUP_KEY]
			}
		}

		return undefined
	})
	$effect(() => {
		if (targetPositionFieldGroupKey) {
			untrack(() => {
				if (fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION]) {
					fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION][MetadataModel.Field2dPositionProperties.FIELD_GROUP_KEY] =
						targetPositionFieldGroupKey
				} else {
					fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION] = {
						[MetadataModel.Field2dPositionProperties.FIELD_GROUP_KEY]: targetPositionFieldGroupKey
					}
				}
			})
		} else {
			untrack(() => {
				if (fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION]) {
					delete fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION][MetadataModel.Field2dPositionProperties.FIELD_GROUP_KEY]
				}
			})
		}

		untrack(() => updateMetadataModelColumnPositionInfoChange())
	})

	let targetPositionFieldViewValuesInSeparateColumnsHeaderIndex: number | undefined = $derived.by(() => {
		if (fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION]) {
			if (
				typeof fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION][
					MetadataModel.Field2dPositionProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX
				] === 'number'
			) {
				return fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION][
					MetadataModel.Field2dPositionProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX
				]
			}
		}

		return undefined
	})
	$effect(() => {
		if (typeof targetPositionFieldViewValuesInSeparateColumnsHeaderIndex === 'number') {
			untrack(() => {
				if (fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION]) {
					fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION][
						MetadataModel.Field2dPositionProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX
					] = targetPositionFieldViewValuesInSeparateColumnsHeaderIndex
				} else {
					fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION] = {
						[MetadataModel.Field2dPositionProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX]:
							targetPositionFieldViewValuesInSeparateColumnsHeaderIndex
					}
				}
			})
		} else {
			untrack(() => {
				if (fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION]) {
					delete fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION][
						MetadataModel.Field2dPositionProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX
					]
				}
			})
		}
		untrack(() => updateMetadataModelColumnPositionInfoChange())
	})

	let targetPositionBefore: boolean | undefined = $derived.by(() => {
		if (fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION]) {
			if (
				typeof fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION][MetadataModel.Field2dPositionProperties.FIELD_POSITION_BEFORE] ===
				'boolean'
			) {
				return fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION][MetadataModel.Field2dPositionProperties.FIELD_POSITION_BEFORE]
			}
		}

		return undefined
	})
	$effect(() => {
		if (targetPositionBefore) {
			untrack(() => {
				if (fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION]) {
					fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION][MetadataModel.Field2dPositionProperties.FIELD_POSITION_BEFORE] =
						targetPositionBefore
				} else {
					fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION] = {
						[MetadataModel.Field2dPositionProperties.FIELD_POSITION_BEFORE]: targetPositionBefore
					}
				}
			})
		} else {
			untrack(() => {
				if (fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION]) {
					delete fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION][MetadataModel.Field2dPositionProperties.FIELD_POSITION_BEFORE]
				}
			})
		}

		untrack(() => updateMetadataModelColumnPositionInfoChange())
	})

	function updateMetadataModelColumnPositionInfoChange() {
		metadataModel = JSON.stringify(Json.SetValueInObject(JSON.parse(metadataModel), pathToField, fieldgroup))
	}

	let columnFieldsRepositioned: any[] = $derived.by(() => {
		try {
			let cf = new MetadataModel.Extract2DFields(JSON.parse(metadataModel), false, false, false)

			cf.Extract()

			telemetry?.Log(
				COMPONENT_NAME,
				false,
				Domain.Entities.Telemetry.LogLevel.DEBUG,
				'before repositioning',
				'length',
				cf.Fields.length,
				'elements',
				structuredClone(cf.Fields)
			)

			cf.Reposition()

			telemetry?.Log(
				COMPONENT_NAME,
				false,
				Domain.Entities.Telemetry.LogLevel.DEBUG,
				'after repositioning',
				'length',
				cf.Fields.length,
				'elements',
				structuredClone(cf.Fields)
			)

			return cf.Fields
		} catch (e) {
			telemetry?.Log(
				COMPONENT_NAME,
				true,
				Domain.Entities.Telemetry.LogLevel.ERROR,
				'error extracting 2D fields for columnFieldsRepositioned.',
				'error',
				e
			)
			return []
		}
	})

	let repositionedPosition: number = $derived.by(() => {
		for (let fIndex = 0; fIndex < columnFieldsRepositioned.length; fIndex++) {
			if (columnFieldsRepositioned[fIndex][MetadataModel.FgProperties.FIELD_GROUP_KEY] === fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]) {
				return fIndex
			}
		}

		return -1
	})
</script>

<div class="flex flex-col gap-y-2 p-2" transition:fade>
	<header
		class="flex w-fit self-center max-md:flex-col max-md:gap-y-1 md:gap-x-1 {theme === Domain.Entities.Theme.Theme.DARK
			? 'border-gray-900 bg-gray-700'
			: 'border-gray-300 bg-gray-100'} rounded-box w-fit border p-4"
	>
		<label
			class="input self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
				? 'input-primary'
				: themecolor === Domain.Entities.Theme.Color.SECONDARY
					? 'input-secondary'
					: 'input-accent'}"
		>
			<span class="label">Position before field?</span>
			<input
				class="checkbox {themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'checkbox-primary'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'checkbox-secondary'
						: 'checkbox-accent'}"
				type="checkbox"
				bind:checked={targetPositionBefore}
			/>
		</label>
		<button
			class="btn md:btn-md max-md:btn-sm self-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
				? 'btn-primary'
				: themecolor === Domain.Entities.Theme.Color.SECONDARY
					? 'btn-secondary'
					: 'btn-accent'}"
			onclick={() => {
				targetPositionFieldGroupKey = undefined
				targetPositionFieldViewValuesInSeparateColumnsHeaderIndex = undefined
				targetPositionBefore = undefined
			}}
		>
			reset
		</button>
	</header>

	<main
		class="rounded-md border {themecolor === Domain.Entities.Theme.Color.PRIMARY
			? 'border-primary'
			: themecolor === Domain.Entities.Theme.Color.SECONDARY
				? 'border-secondary'
				: 'border-accent'} {theme === Domain.Entities.Theme.Theme.DARK ? 'border-gray-900 bg-gray-700' : 'border-gray-300 bg-gray-100'}"
		style="display: grid; grid-template-columns: auto 2fr 2fr;"
	>
		<div class="h-full w-full p-1 text-center font-bold">#</div>
		<div class="h-full w-full p-1 text-center">original ({originalPosition + 1})</div>
		<div class="h-full w-full p-1 text-center">repositioned ({repositionedPosition + 1})</div>
		{#each Utils.Range(columnFieldsStart, Utils.RangeArrayEnd(columnFieldsEnd, noOfColumnFields)) as cfIndex (cfIndex)}
			<div class="h-full w-full p-1 text-center font-bold">{cfIndex + 1}</div>

			{@const originalField = columnFields[cfIndex]}

			{#if originalField}
				{#if originalField[MetadataModel.FgProperties.FIELD_GROUP_KEY] === fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]}
					<div
						class="h-full p-2 text-center {themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'bg-primary text-primary-content'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'bg-secondary text-secondary-content'
								: 'bg-accent text-accent-content'}"
					>
						{MetadataModel.GetFieldGroupName(originalField)}
					</div>
				{:else}
					<button
						class="btn btn-ghost"
						onclick={() => {
							targetPositionFieldGroupKey = originalField[MetadataModel.FgProperties.FIELD_GROUP_KEY]

							if (typeof originalField[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX] === 'number') {
								targetPositionFieldViewValuesInSeparateColumnsHeaderIndex =
									originalField[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX]
							}
						}}
					>
						{MetadataModel.GetFieldGroupName(originalField)}
					</button>
				{/if}
			{:else}
				<div class="text-error h-full w-full p-1">original field not found</div>
			{/if}

			{@const repositionedField = columnFieldsRepositioned[cfIndex]}

			{#if repositionedField}
				<div
					class="p-2 text-center {repositionedField[MetadataModel.FgProperties.FIELD_GROUP_KEY] ===
					fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]
						? themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'bg-primary text-primary-content'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'bg-secondary text-secondary-content'
								: 'bg-accent text-accent-content'
						: ''}"
				>
					{MetadataModel.GetFieldGroupName(repositionedField)}
				</div>
			{:else}
				<div class="text-error h-full w-full p-1">repositioned field not found</div>
			{/if}
		{/each}
	</main>
	<footer class="flex w-full justify-center">
		<Component.Pagination
			{themecolor}
			lengthofdata={noOfColumnFields}
			start={columnFieldsStart}
			end={columnFieldsEnd}
			updatestart={(n: number) => (columnFieldsStart = n)}
			updateend={(n: number) => (columnFieldsEnd = n)}
			contentperpage={10}
		></Component.Pagination>
	</footer>

	{@render FooterSnippet(themecolor, theme, updatefieldgroup, fieldgroup)}
</div>

<!--
@component

Create and update metadata-model.

Props:
- metadatamodel - current start index of data to display.
- themecolor - current end index of data to display.
- contentperpage - current total number of elements (fields/groups)
- updatemetadatamodel - function to update `metadatamodel` prop.
- telemetry - utility for collecting telemetry following the `Domain.Interfaces.ITelemetry`interface.
- theme - `dark` or `light`.
-->
<script lang="ts">
	import { Domain, Json, MetadataModel, Utils } from '$lib'
	import FieldGroupView from './FieldGroup/View/Component.svelte'

	const COMPONENT_NAME = 'metadata-model-build'

	interface Props {
		metadatamodel?: any
		themecolor?: Domain.Entities.Theme.Color
		contentperpage?: number
		updatemetadatamodel?: (value: any) => void
		telemetry?: Domain.Interfaces.ITelemetry
		theme?: Domain.Entities.Theme.Theme
		notification?: (type: Domain.Entities.Toast.Type, message: string | string[]) => void
	}

	let {
		metadatamodel = MetadataModel.EmptyMetadataModel(),
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		contentperpage = 20,
		updatemetadatamodel = undefined,
		telemetry = undefined,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		notification = undefined
	}: Props = $props()
	
	let viewMetadataModel: any = $derived(JSON.parse(JSON.stringify(metadatamodel)))

	/**
	 * store fieldGoup json data when it has been cut.
	 */
	let cutFieldGroup: any = $state.raw(undefined)
	/**
	 * store {@linkcode MetadataModel.FgProperties.FIELD_GROUP_KEY} for copied fieldGroup.
	 */
	let copiedFieldGroupKey: string = $state('')

	function onupdatemetadatamodel() {
		viewMetadataModel = JSON.parse(JSON.stringify(viewMetadataModel))

		telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.DEBUG, 'updateMetadataModel', 'viewMetadataModel', viewMetadataModel)

		if (updatemetadatamodel) {
			updatemetadatamodel(viewMetadataModel)
		}
	}

	/**
	 * update viewMetadataModel field/group.
	 *
	 * @param path - path to field/group
	 * @param value - new value
	 */
	function updateMetadataModel(path: string, value: any) {
		viewMetadataModel = Json.SetValueInObject(viewMetadataModel, path, value)

		onupdatemetadatamodel()
	}

	/**
	 * field group key of field group that has been clicked.
	 */
	let selectedFieldGroupKey: string = $state('')

	/**
	 * theme of selected field group key.
	 */
	let selectedFieldGroupColor: Domain.Entities.Theme.Color = $state(Domain.Entities.Theme.Color.PRIMARY)

	let editFieldGroupDialogElement: HTMLDialogElement

	function onnotification(type: Domain.Entities.Toast.Type, message: string | string[]) {
		if (notification) {
			notification(type, message)
		}
	}
</script>

<div class="h-fit w-full overflow-auto">
	<FieldGroupView
		{telemetry}
		{contentperpage}
		themecolor={themecolor}
		{theme}
		fieldgroup={viewMetadataModel}
		cutfieldgroup={typeof cutFieldGroup !== 'undefined'}
		showgroupfields={true}
		groupkey="$"
		copiedfieldgroupkey={copiedFieldGroupKey}
		deletefieldgroup={(fieldgroupkey: string, groupKey: string, indexingroupreadorderoffields: number) => {
			try {
				viewMetadataModel = Json.DeleteValueInObject(
					viewMetadataModel,
					fieldgroupkey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')
				)
				viewMetadataModel = Json.DeleteValueInObject(
					viewMetadataModel,
					`${groupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}[${indexingroupreadorderoffields}]`
				)

				onupdatemetadatamodel()
			} catch (e) {
				telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'error deleting field/group', e)
			}
		}}
		setcutfieldgroup={(fieldgroupkey: string, groupKey: string, indexingroupreadorderoffields: number) => {
			try {
				cutFieldGroup = structuredClone(
					Json.GetValueInObject(viewMetadataModel, fieldgroupkey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]'))
				)
				viewMetadataModel = Json.DeleteValueInObject(
					viewMetadataModel,
					fieldgroupkey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')
				)
				viewMetadataModel = Json.DeleteValueInObject(
					viewMetadataModel,
					`${groupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}[${indexingroupreadorderoffields}]`
				)

				viewMetadataModel = structuredClone(viewMetadataModel)

				copiedFieldGroupKey = ''
				telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.DEBUG, 'Set cut field/group path', 'cutFieldGroup', cutFieldGroup)
			} catch (e) {
				telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.DEBUG, 'error setting field/group', e)
			}
		}}
		setcopiedfieldgroupkey={(fieldgroupkey: string) => {
			copiedFieldGroupKey = fieldgroupkey
			cutFieldGroup = undefined
			telemetry?.Log(
				COMPONENT_NAME,
				false,
				Domain.Entities.Telemetry.LogLevel.DEBUG,
				'Set copied field/group path',
				'copiedFieldGroupKey',
				copiedFieldGroupKey
			)
		}}
		pastefieldgroup={(destinationGroupKey: string, objectIndexInGroupReadOrderOfFields: number) => {
			try {
				let pasteFieldGroup: any
				if (copiedFieldGroupKey.length > 0) {
					pasteFieldGroup = Json.GetValueInObject(
						viewMetadataModel,
						copiedFieldGroupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')
					)
				} else {
					pasteFieldGroup = structuredClone(cutFieldGroup)
				}
				if (typeof pasteFieldGroup === 'undefined') {
					telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.ERROR, 'pasteFieldGroup is undefined')
					return
				}

				let destinationGroupReadOrderOfFields = Json.GetValueInObject(
					viewMetadataModel,
					`${destinationGroupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}`
				)
				if (!Array.isArray(destinationGroupReadOrderOfFields)) {
					telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.ERROR, 'destinationGroupReadOrderOfFields is not an array')
					return
				}

				if (Array.isArray(pasteFieldGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
					pasteFieldGroup = MetadataModel.MapFieldGroups(pasteFieldGroup, (property) => {
						if (typeof property[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
							property[MetadataModel.FgProperties.FIELD_GROUP_KEY] = (property[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).replace(
								pasteFieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY],
								destinationGroupKey
							)
						}
						return property
					})

					if (
						!Array.isArray(pasteFieldGroup[MetadataModel.FgProperties.GROUP_FIELDS]) ||
						typeof pasteFieldGroup[MetadataModel.FgProperties.GROUP_FIELDS][0] !== 'object'
					) {
						telemetry?.Log(
							COMPONENT_NAME,
							false,
							Domain.Entities.Telemetry.LogLevel.ERROR,
							'pasteGroupFields is not an array or pasteGroupFields[0] is not an object'
						)

						return
					}

					if (!Array.isArray(pasteFieldGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
						telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.ERROR, 'pasteGroupReadOrderOfFields is not an array')

						return
					}

					const destinationGroupFields = Json.GetValueInObject(
						viewMetadataModel,
						`${destinationGroupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_FIELDS}`
					)
					if (!Array.isArray(destinationGroupFields) || typeof destinationGroupFields[0] !== 'object') {
						telemetry?.Log(
							COMPONENT_NAME,
							false,
							Domain.Entities.Telemetry.LogLevel.ERROR,
							'destinationGroupFields is not an array or destinationGroupFields[0] is not an object'
						)

						return
					}

					destinationGroupFields[0] = { ...pasteFieldGroup[MetadataModel.FgProperties.GROUP_FIELDS][0], ...destinationGroupFields[0] }

					let newDestinationGroupReadOrderOfFields: string[] = []
					for (const dgroof of destinationGroupReadOrderOfFields) {
						if (!(pasteFieldGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS] as any[]).includes(dgroof)) {
							newDestinationGroupReadOrderOfFields = [...newDestinationGroupReadOrderOfFields, dgroof]
						}
					}
					if (objectIndexInGroupReadOrderOfFields >= 0 && objectIndexInGroupReadOrderOfFields < newDestinationGroupReadOrderOfFields.length) {
						;(newDestinationGroupReadOrderOfFields as any[]).splice(
							objectIndexInGroupReadOrderOfFields,
							0,
							...pasteFieldGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]
						)
					} else {
						newDestinationGroupReadOrderOfFields = [
							...newDestinationGroupReadOrderOfFields,
							...pasteFieldGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]
						]
					}
					destinationGroupReadOrderOfFields = newDestinationGroupReadOrderOfFields

					updateMetadataModel(
						`${destinationGroupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}`,
						destinationGroupReadOrderOfFields
					)
					updateMetadataModel(
						`${destinationGroupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_FIELDS}`,
						destinationGroupFields
					)
				} else {
					pasteFieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] =
						`${destinationGroupKey}.${MetadataModel.FgProperties.GROUP_FIELDS}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}.${(pasteFieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').pop()}`
					if (
						!(destinationGroupReadOrderOfFields as string[]).includes(
							(pasteFieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').pop() as string
						)
					) {
						if (objectIndexInGroupReadOrderOfFields >= 0) {
							;(destinationGroupReadOrderOfFields as any[]).splice(
								objectIndexInGroupReadOrderOfFields,
								0,
								(pasteFieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').pop()
							)
						} else {
							destinationGroupReadOrderOfFields = [
								...destinationGroupReadOrderOfFields,
								(pasteFieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').pop()
							]
						}
						updateMetadataModel(
							`${destinationGroupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}`,
							destinationGroupReadOrderOfFields
						)
					}

					updateMetadataModel(
						(pasteFieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).replace(
							new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'),
							'[0]'
						),
						pasteFieldGroup
					)
				}
			} catch (e) {
				telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.ERROR, 'error pasting field/group', e)
			}
		}}
		createfieldgroup={(groupKey: string, fieldGroupName: string, isField: boolean, objectIndexInGroupReadOrderOfFields: number) => {
			const newFieldGroupKey = `${groupKey}.${MetadataModel.FgProperties.GROUP_FIELDS}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}.${fieldGroupName.toLocaleLowerCase().replace(new RegExp(MetadataModel.SPECIAL_CHARS_REGEX_SEARCH, 'g'), '_')}`
			let newFieldGroup: any = {
				[MetadataModel.FgProperties.FIELD_GROUP_KEY]: newFieldGroupKey,
				[MetadataModel.FgProperties.FIELD_GROUP_NAME]: fieldGroupName,
				[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES]: 1
			}
			if (isField) {
				newFieldGroup[MetadataModel.FgProperties.FIELD_DATATYPE] = ''
				newFieldGroup[MetadataModel.FgProperties.FIELD_UI] = ''
			} else {
				newFieldGroup[MetadataModel.FgProperties.GROUP_FIELDS] = [{}]
				newFieldGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS] = []
			}

			try {
				let groupReadOrderOfFields = Json.GetValueInObject(
					viewMetadataModel,
					`${groupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}`
				)
				if (!Array.isArray(groupReadOrderOfFields)) {
					throw 'groupReadOrderOfFields is not an array'
				}
				if (!(groupReadOrderOfFields as string[]).includes(newFieldGroupKey.split('.').pop() as string)) {
					if (objectIndexInGroupReadOrderOfFields >= 0) {
						;(groupReadOrderOfFields as any[]).splice(objectIndexInGroupReadOrderOfFields, 0, newFieldGroupKey.split('.').pop())
					} else {
						groupReadOrderOfFields = [...groupReadOrderOfFields, newFieldGroupKey.split('.').pop()]
					}

					updateMetadataModel(
						`${groupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}`,
						groupReadOrderOfFields
					)
				}

				updateMetadataModel(newFieldGroupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]'), newFieldGroup)
			} catch (e) {
				telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.ERROR, 'error creating field/group', e)
			}
		}}
		handleselectfieldgroup={(fieldgroupkey: string, color: Domain.Entities.Theme.Color = Domain.Entities.Theme.Color.PRIMARY) => {
			selectedFieldGroupKey = fieldgroupkey
			selectedFieldGroupColor = color
			editFieldGroupDialogElement.showModal()
		}}
		reorderfieldgroup={(groupKey: string, direction: number, fieldGroupIndexInReadOrderOfFields: number) => {
			try {
				let groupReadOrderOfFields = Json.GetValueInObject(
					viewMetadataModel,
					`${groupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}`
				)
				if (!Array.isArray(groupReadOrderOfFields)) {
					telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.ERROR, 'groupReadOrderOfFields is not an array')

					return
				}

				let newGroupReadOrderOfFields: string[] = []
				for (let g = 0; g < groupReadOrderOfFields.length; g++) {
					if (direction < 0 && fieldGroupIndexInReadOrderOfFields + direction === g) {
						newGroupReadOrderOfFields = [...newGroupReadOrderOfFields, groupReadOrderOfFields[fieldGroupIndexInReadOrderOfFields]]
					}
					if (g !== fieldGroupIndexInReadOrderOfFields) {
						newGroupReadOrderOfFields = [...newGroupReadOrderOfFields, groupReadOrderOfFields[g]]
					}
					if (direction > 0 && fieldGroupIndexInReadOrderOfFields + direction === g) {
						newGroupReadOrderOfFields = [...newGroupReadOrderOfFields, groupReadOrderOfFields[fieldGroupIndexInReadOrderOfFields]]
					}
				}

				updateMetadataModel(
					`${groupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}`,
					newGroupReadOrderOfFields
				)
			} catch (e) {
				telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.ERROR, 'reorderfieldgroup failed', e)
			}
		}}
	></FieldGroupView>
</div>

<dialog bind:this={editFieldGroupDialogElement} id="edit-field-group-dialog" class="modal">
	<div class="modal-box flex max-h-[90vh] w-fit flex-col overflow-hidden rounded p-0 max-md:min-w-[90%] md:min-w-[700px] md:max-w-[800px]">
		{#if selectedFieldGroupKey && selectedFieldGroupKey.length > 0}
			<header class="sticky left-0 right-0 top-0 flex flex-[1] items-center justify-between p-2 shadow-sm shadow-gray-800 mb-1">
				<div
					class="flex h-fit w-fit gap-x-1 {selectedFieldGroupColor === Domain.Entities.Theme.Color.PRIMARY
						? 'text-primary'
						: selectedFieldGroupColor === Domain.Entities.Theme.Color.SECONDARY
							? 'text-secondary'
							: 'text-accent'}"
				>
					Edit Field/Group
				</div>
				<button
					class="btn btn-circle btn-ghost"
					onclick={() => {
						selectedFieldGroupKey = ''
						editFieldGroupDialogElement.close()
					}}
				>
					<!--mdi:close-circle source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill="var({Utils.Theme.GetColor(selectedFieldGroupColor)})"
							d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"
						/>
					</svg>
				</button>
			</header>

			{@const fieldgroup = Json.GetValueInObject(
				viewMetadataModel,
				selectedFieldGroupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')
			)}

			{#if fieldgroup !== 'undefined'}
				{#await import('./FieldGroup/Edit/Component.svelte') then { default: FieldGroupEdit }}
					<FieldGroupEdit
						{fieldgroup}
						metadatamodel={viewMetadataModel}
						updatefieldgroup={(fieldgroup: any) => {
							if (typeof fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] !== 'string') {
								return
							}
							updateMetadataModel(
								(fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).replace(
									new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'),
									'[0]'
								),
								fieldgroup
							)
							onnotification(Domain.Entities.Toast.Type.INFO, 'Field/group updated')
						}}
						{theme}
						themecolor={selectedFieldGroupColor}
						{telemetry}
					></FieldGroupEdit>
				{/await}
			{:else}
				<div class="text-error">Field/Group is not valid.</div>
			{/if}
		{/if}
	</div>
</dialog>

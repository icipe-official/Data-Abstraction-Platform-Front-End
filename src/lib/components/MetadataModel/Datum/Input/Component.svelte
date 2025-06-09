<!--
@component

Component for data input.

Props:
- metadatamodel - current start index of data to display.
- datum -
- themecolor - current end index of data to display.
- contentperpage - current total number of elements (fields/groups)
- updatemetadatamodel - function to update `metadatamodel` prop.
- telemetry - utility for collecting telemetry following the `Domain.Interfaces.ITelemetry`interface.
- theme - `dark` or `light`.

-->
<script lang="ts">
	import { Domain, Json, MetadataModel } from '$lib'
	import View from './View/Component.svelte'

	const COMPONENT_NAME = 'metadata-model-datum-input'

	interface Props {
		metadatamodel?: any
		datum?: any
		themecolor?: Domain.Entities.Theme.Color
		formcolumncontentperpage?: number
		formentrycontentperpage?: number
		tablecolumncontentperpage?: number
		tablerowcontentperpage?: number
		columnfieldcontentperpage?: number
		updatemetadatamodel?: (value: any) => void
		deletedata?: (fieldGroupKey: string, arrayPlaceholderIndexes: number[], path: string) => void
		updatedata?: (value: any) => void
		telemetry?: Domain.Interfaces.ITelemetry
		theme?: Domain.Entities.Theme.Theme
		notification?: (type: Domain.Entities.Toast.Type, message: string | string[]) => void
	}

	let {
		metadatamodel = {},
		updatemetadatamodel = undefined,
		datum = {},
		deletedata = undefined,
		updatedata = undefined,
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		formcolumncontentperpage,
		formentrycontentperpage,
		tablecolumncontentperpage,
		tablerowcontentperpage,
		columnfieldcontentperpage,
		telemetry = undefined,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		notification = undefined
	}: Props = $props()
	
	let viewDatum: any = $derived(JSON.parse(JSON.stringify(datum)))

	function onupdatedata() {
		if (updatedata) {
			updatedata(viewDatum)
		}
	}

	function ondeletedata(fieldGroupKey: string, arrayPlaceholderIndexes: number[], path: string) {
		if (deletedata) {
			deletedata(fieldGroupKey, arrayPlaceholderIndexes, path)
		}
	}

	let copiedcutfieldgroupkey: string = $state('')
	let copiedFieldGroupArrayIndexPlaceholders: number[] = []
	let cutFieldGroupData: { fgkey: string; value: any } | null

	function onupdatefieldgroup(fieldGroup: any) {
		let fieldGroupPath = fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]
		if (typeof fieldGroupPath !== 'string') {
			return
		}
		fieldGroupPath = (fieldGroupPath as string).replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')

		metadatamodel = JSON.parse(JSON.stringify(Json.SetValueInObject(metadatamodel, fieldGroupPath, fieldGroup)))

		if (updatemetadatamodel) {
			updatemetadatamodel(metadatamodel)
		}
	}
</script>

<View
	group={metadatamodel}
	updatefieldgroup={onupdatefieldgroup}
	getdata={(fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => {
		try {
			return Json.GetValueInObject(viewDatum, MetadataModel.PreparePathToValueInObject(fieldGroupKey, arrayPlaceholderIndexes))
		} catch (e) {
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'error getting data', 'error', e)
		}
	}}
	updatedata={(fieldGroupKey: string, arrayPlaceholderIndexes: number[], value: any) => {
		try {
			viewDatum = JSON.parse(
				JSON.stringify(Json.SetValueInObject(viewDatum, MetadataModel.PreparePathToValueInObject(fieldGroupKey, arrayPlaceholderIndexes), value))
			)
			onupdatedata()
		} catch (e) {
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'error updating data', 'error', e)
		}
	}}
	deletedata={(fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => {
		try {
			const path = MetadataModel.PreparePathToValueInObject(fieldGroupKey, arrayPlaceholderIndexes)
			viewDatum = JSON.parse(JSON.stringify(Json.DeleteValueInObject(viewDatum, path)))
			ondeletedata(fieldGroupKey, arrayPlaceholderIndexes, path)
			onupdatedata()
		} catch (e) {
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'error deleting data', 'error', e)
		}
	}}
	{copiedcutfieldgroupkey}
	themecolor={themecolor}
	{theme}
	setcopiedfieldgroupkey={(fieldGroupKey: string, arrayIndexPlaceholders: number[]) => {
		const fieldGroupData = Json.GetValueInObject(viewDatum, MetadataModel.PreparePathToValueInObject(fieldGroupKey, arrayIndexPlaceholders))
		if (fieldGroupData && fieldGroupData !== null) {
			copiedcutfieldgroupkey = fieldGroupKey
			copiedFieldGroupArrayIndexPlaceholders = arrayIndexPlaceholders
			cutFieldGroupData = null
		}
	}}
	setcutfieldgroupdata={(fieldGroupKey: string, arrayIndexPlaceholders: number[]) => {
		const fieldGroupData = Json.GetValueInObject(viewDatum, MetadataModel.PreparePathToValueInObject(fieldGroupKey, arrayIndexPlaceholders))
		if (fieldGroupData && fieldGroupData !== null) {
			copiedcutfieldgroupkey = fieldGroupKey
			cutFieldGroupData = fieldGroupData
			copiedFieldGroupArrayIndexPlaceholders = []
			viewDatum = Json.DeleteValueInObject(viewDatum, MetadataModel.PreparePathToValueInObject(fieldGroupKey, arrayIndexPlaceholders))
		}
	}}
	pastefieldgroupdata={(destFieldGroupKey: string, destArrayIndexPlaceholders: number[]) => {
		try {
			let pastedata: any = undefined
			if (cutFieldGroupData !== null) {
				pastedata = JSON.parse(JSON.stringify(cutFieldGroupData))
			} else {
				pastedata = Json.GetValueInObject(
					viewDatum,
					MetadataModel.PreparePathToValueInObject(copiedcutfieldgroupkey, copiedFieldGroupArrayIndexPlaceholders)
				)
			}

			if (typeof pastedata === 'undefined') {
				return
			}

			viewDatum = JSON.parse(
				JSON.stringify(
					Json.SetValueInObject(viewDatum, MetadataModel.PreparePathToValueInObject(destFieldGroupKey, destArrayIndexPlaceholders), pastedata)
				)
			)
			onupdatedata()
		} catch (e) {
			telemetry?.Log(
				COMPONENT_NAME,
				true,
				Domain.Entities.Telemetry.LogLevel.ERROR,
				'error pasting data',
				'error',
				e,
				'destFieldGroupKey',
				destFieldGroupKey,
				'destArrayIndexPlaceholders',
				destArrayIndexPlaceholders
			)
		}
	}}
	{formcolumncontentperpage}
	{formentrycontentperpage}
	{tablecolumncontentperpage}
	{tablerowcontentperpage}
	{columnfieldcontentperpage}
	{telemetry}
></View>

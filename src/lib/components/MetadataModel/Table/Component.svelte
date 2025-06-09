<!--
@component

Props"
- 

-->
<script lang="ts">
	import { Domain, Json, MetadataModel } from '$lib'

	import Table from './Table/Component.svelte'

	const COMPONENT_NAME = 'metadata-model-table'

	interface Props {
		metadatamodel: any
		data?: any[]
		themecolor?: Domain.Entities.Theme.Color
		telemetry?: Domain.Interfaces.ITelemetry
		theme?: Domain.Entities.Theme.Theme
		addselectcolumn?: boolean
		addclickcolumn?: boolean
		multiselectcolumns?: boolean
		selecteddataindexes?: number[]
		filterexcludeindexes?: number[]
		selecteddataindexesactions?: { actionName: string; action: (selecteddataindexes: number[]) => void }[]
		tablecolumncontentperpage?: number
		tablerowcontentperpage?: number
		columnfieldcontentperpage?: number
		stickyheaderoffset?: number
		stickyleftoffset?: number
		stickyfooteroffset?: number
		stickythreshold?: number
		switchbackground?: boolean
		updatemetadatamodel?: (value: any) => void
		updateselecteddataindexes?: (value: number[]) => void
		rowclick?: (value: any, index: number) => void
		rootelement?: Element
		getdata?: (path: string, arrayindexes: number[]) => void
		metadatamodelget?: Domain.Interfaces.MetadataModels.Get
		fieldanygetmetadatamodel?: Domain.Interfaces.MetadataModels.IFieldAnyGetMetadataModel
	}

	let {
		metadatamodel,
		data = [],
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		telemetry = undefined,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		addselectcolumn = false,
		addclickcolumn = true,
		multiselectcolumns = true,
		selecteddataindexes = [],
		filterexcludeindexes = [],
		selecteddataindexesactions = [],
		tablecolumncontentperpage = 10,
		tablerowcontentperpage = 10,
		columnfieldcontentperpage = 5,
		stickyheaderoffset = 0,
		stickyleftoffset = 0,
		stickyfooteroffset = 0,
		stickythreshold = 0.2,
		switchbackground = false,
		updatemetadatamodel = undefined,
		updateselecteddataindexes = undefined,
		rowclick = undefined,
		rootelement = undefined,
		getdata = undefined,
		metadatamodelget = undefined,
		fieldanygetmetadatamodel = undefined
	}: Props = $props()

	let viewMetadataModel: any = $derived(JSON.parse(JSON.stringify(metadatamodel)))

	function onupdatefieldgroup(fieldGroup: any) {
		let fieldGroupPath = fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]
		if (typeof fieldGroupPath !== 'string') {
			return
		}
		fieldGroupPath = (fieldGroupPath as string).replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')

		viewMetadataModel = JSON.parse(JSON.stringify(Json.SetValueInObject(viewMetadataModel, fieldGroupPath, fieldGroup)))

		if (updatemetadatamodel) {
			updatemetadatamodel(viewMetadataModel)
		}
	}

	let getData = $derived.by(() => {
		if (typeof getdata === 'function') {
			return getdata
		}

		return onGetData
	})
	
	function onGetData(path: string, arrayindexes: number[]) {
		try {
			arrayindexes = [arrayindexes[0], ...arrayindexes]
			path = path.replace(/\$/, `$.${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`)
			path = MetadataModel.PreparePathToValueInObject(path, arrayindexes)
			return Json.GetValueInObject(data, path)
		} catch (e) {
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'Get Metadata Model Data failed', 'error', e)
			return undefined
		}
	}
</script>

<Table
	group={viewMetadataModel}
	{data}
	{themecolor}
	{theme}
	{telemetry}
	{addselectcolumn}
	{addclickcolumn}
	{multiselectcolumns}
	{selecteddataindexes}
	{filterexcludeindexes}
	{selecteddataindexesactions}
	{tablecolumncontentperpage}
	{tablerowcontentperpage}
	{columnfieldcontentperpage}
	{stickyheaderoffset}
	{stickyleftoffset}
	{stickyfooteroffset}
	{stickythreshold}
	{switchbackground}
	updatefieldgroup={onupdatefieldgroup}
	{updateselecteddataindexes}
	{rowclick}
	{rootelement}
	getdata={getData}
	{metadatamodelget}
	{fieldanygetmetadatamodel}
></Table>

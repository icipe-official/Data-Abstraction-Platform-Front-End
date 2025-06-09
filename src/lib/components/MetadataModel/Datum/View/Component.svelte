<!--
@component

Props:
-
-->
<script lang="ts">
	import { Domain, Json, MetadataModel } from '$lib'
	import Form from './Form/Component.svelte'

	const COMPONENT_NAME = 'metadata-model-datum-view'

	interface Props {
		metadatamodel: any
		data?: any
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		telemetry?: Domain.Interfaces.ITelemetry
		formcolumncontentperpage?: number
		formentrycontentperpage?: number
		tablecolumncontentperpage?: number
		tablerowcontentperpage?: number
		columnfieldcontentperpage?: number
		stickyheaderoffset?: number
		stickyleftoffset?: number
		stickyfooteroffset?: number
		stickythreshold?: number
		switchbackground?: boolean
		rootelement?: Element
		metadatamodelget?: Domain.Interfaces.MetadataModels.Get
		fieldanygetmetadatamodel?: Domain.Interfaces.MetadataModels.IFieldAnyGetMetadataModel
	}

	let {
		metadatamodel,
		data = undefined,
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		telemetry = undefined,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		formcolumncontentperpage = 5,
		formentrycontentperpage = 1,
		tablecolumncontentperpage,
		tablerowcontentperpage,
		columnfieldcontentperpage,
		stickyheaderoffset = 0,
		stickyleftoffset = 0,
		stickyfooteroffset = 0,
		stickythreshold = 0.3,
		switchbackground = false,
		rootelement = undefined,
		metadatamodelget = undefined,
		fieldanygetmetadatamodel = undefined
	}: Props = $props()

	function getdata(path: string, arrayindexes: number[]) {
		try {
			arrayindexes = [arrayindexes[0], ...arrayindexes]
			path = MetadataModel.PreparePathToValueInObject(path, arrayindexes)
			return Json.GetValueInObject(data, path)
		} catch (e) {
			telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.ERROR, 'Get Metadata Model Data failed', 'error', e)
			return undefined
		}
	}
</script>

<Form
	group={metadatamodel}
	{data}
	{theme}
	{themecolor}
	{telemetry}
	{formcolumncontentperpage}
	{formentrycontentperpage}
	{tablecolumncontentperpage}
	{tablerowcontentperpage}
	{columnfieldcontentperpage}
	{stickyheaderoffset}
	{stickyleftoffset}
	{stickyfooteroffset}
	{stickythreshold}
	{switchbackground}
	{rootelement}
	{getdata}
	{metadatamodelget}
	{fieldanygetmetadatamodel}
></Form>

<!--
@component


Props:
-
-->
<script lang="ts">
	import { Domain, MetadataModel } from '$lib'

	const COMPONENT_NAME = 'metadata-model-datum-input-view'

	interface Props {
		group: any
		arrayindexplaceholders?: number[]
		themecolor: Domain.Entities.Theme.Color
		theme: Domain.Entities.Theme.Theme
		updatefieldgroup: (fieldGroup: any) => void
		getdata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => any
		updatedata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[], value: any) => void
		deletedata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
		copiedcutfieldgroupkey?: string
		setcopiedfieldgroupkey: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
		setcutfieldgroupdata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
		pastefieldgroupdata: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
		telemetry?: Domain.Interfaces.ITelemetry
		formcolumncontentperpage?: number
		formentrycontentperpage?: number
		tablecolumncontentperpage?: number
		tablerowcontentperpage?: number
		columnfieldcontentperpage?: number
		stickyheaderoffset?: number
		stickyfooteroffset?: number
		stickythreshold?: number
		switchbackground?: boolean
		rootelement?: Element
	}

	let {
		group,
		arrayindexplaceholders = [],
		themecolor,
		theme,
		updatefieldgroup,
		getdata,
		updatedata,
		deletedata,
		copiedcutfieldgroupkey = '',
		setcopiedfieldgroupkey,
		setcutfieldgroupdata,
		pastefieldgroupdata,
		telemetry = undefined,
		formcolumncontentperpage,
		formentrycontentperpage,
		tablecolumncontentperpage,
		tablerowcontentperpage,
		columnfieldcontentperpage,
		stickyheaderoffset,
		stickyfooteroffset,
		stickythreshold,
		switchbackground = false,
		rootelement = undefined
	}: Props = $props()

	let datumInputView: MetadataModel.DView = $derived(group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] || MetadataModel.DView.FORM)
</script>

{#if datumInputView === MetadataModel.DView.FORM}
	{#await import('./Form/Component.svelte') then { default: Form }}
		<Form
			{group}
			{arrayindexplaceholders}
			{themecolor}
			{theme}
			{updatefieldgroup}
			{getdata}
			{updatedata}
			{deletedata}
			{copiedcutfieldgroupkey}
			{setcopiedfieldgroupkey}
			{setcutfieldgroupdata}
			{pastefieldgroupdata}
			{telemetry}
			{formcolumncontentperpage}
			{formentrycontentperpage}
			{tablecolumncontentperpage}
			{tablerowcontentperpage}
			{columnfieldcontentperpage}
			{stickyheaderoffset}
			{stickyfooteroffset}
			{stickythreshold}
			{switchbackground}
			{rootelement}
		></Form>
	{/await}
{:else if datumInputView === MetadataModel.DView.TABLE}
	{#await import('./Table/Component.svelte') then { default: Table }}
		<Table
			{group}
			{arrayindexplaceholders}
			{themecolor}
			{theme}
			{updatefieldgroup}
			{getdata}
			{updatedata}
			{deletedata}
			{copiedcutfieldgroupkey}
			{setcopiedfieldgroupkey}
			{setcutfieldgroupdata}
			{pastefieldgroupdata}
			{telemetry}
			{tablecolumncontentperpage}
			{tablerowcontentperpage}
			{columnfieldcontentperpage}
			{stickyheaderoffset}
			{stickyfooteroffset}
			{stickythreshold}
			{switchbackground}
			{rootelement}
		></Table>
	{/await}
{:else}
	<div class="text-error">view <span class="font-bold">{datumInputView}</span> not supported.</div>
{/if}

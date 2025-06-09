<!--
@component

Alternative select input with option for picking more than one option.

-->
<script lang="ts">
	import { Domain, Utils } from '$lib'
	import { Pagination } from '../Pagination'
	import type { SelectOption } from './util'

	const COMPONENT_NAME = 'multi-select'

	interface Props {
		placeholder?: string
		selectoptions?: SelectOption[]
		selectedoptions?: SelectOption[] | SelectOption | undefined
		multiselect?: boolean
		maxselectedoptions?: number
		disabled?: boolean
		addborder?: boolean
		borderrounded?: boolean
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		telemetry?: Domain.Interfaces.ITelemetry
		contentperpage?: number
		addselectedoptions?: (value: SelectOption[] | SelectOption | undefined) => void
		deleteselectedoptions?: (value: SelectOption[] | SelectOption | undefined) => void
		updateselectedoptions?: (value: SelectOption[] | SelectOption | undefined) => void
	}

	let {
		placeholder = 'search...',
		selectoptions = [],
		selectedoptions = undefined,
		multiselect = false,
		maxselectedoptions = 0,
		disabled = false,
		addborder = true,
		borderrounded = true,
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		telemetry = undefined,
		contentperpage = 10,
		addselectedoptions = undefined,
		deleteselectedoptions = undefined,
		updateselectedoptions = undefined
	}: Props = $props()

	let searchQuery: string = $state('')
	let searchQueryIndexMatches: number[] = $derived.by(() => {
		let matches: number[] = []

		if (searchQuery.length > 0) {
			selectoptions.forEach((so, index) => {
				if (so.label.toLowerCase().includes(searchQuery.toLowerCase())) {
					matches.push(index)
				}
			})
		}

		return matches
	})

	let viewSelectOptions: SelectOption[] = $derived.by(() => {
		if (searchQueryIndexMatches.length > 0 || searchQuery.length > 0) {
			return selectoptions.filter((_, index) => searchQueryIndexMatches.includes(index))
		}

		if (typeof selectedoptions !== 'undefined') {
			if (Array.isArray(selectedoptions)) {
				const selectedOptionsValue = selectedoptions.map((value) => value.value)
				return selectoptions.filter((value) => !selectedOptionsValue.includes(value.value))
			} else {
				return selectoptions.filter((value) => value.value !== (selectedoptions as SelectOption).value)
			}
		}

		return selectoptions
	})

	let noOfViewSelectOptions: number = $derived(viewSelectOptions.length)
	let viewStart: number = $state(0)
	let viewEnd: number = $state(0)

	function ondeleteselectoptions(so: SelectOption[] | SelectOption | undefined) {
		if (deleteselectedoptions) {
			deleteselectedoptions(so)
		}
	}

	function onaddselectoptions(so: SelectOption[] | SelectOption | undefined) {
		if (addselectedoptions) {
			addselectedoptions(so)
		}
	}

	function onupdateselectoptions() {
		if (updateselectedoptions) {
			updateselectedoptions(selectedoptions)
		}
	}

	let showSelectOptions: boolean = $state(false)
</script>

<div class="flex flex-col gap-y-2" onfocusin={() => (showSelectOptions = true)}>
	<header
		class="flex h-fit max-h-[200px] w-full min-w-[300px] flex-wrap gap-x-2 gap-y-2 overflow-y-auto overflow-x-hidden p-1 {addborder
			? `border ${borderrounded ? 'rounded-md' : ''} ${
					themecolor
						? themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'border-primary'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'border-secondary'
								: 'border-accent'
						: theme === Domain.Entities.Theme.Theme.DARK
							? 'border-white'
							: 'border-black'
				}`
			: ''} {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-base-100 text-white' : 'bg-white text-black'}"
	>
		{#if Array.isArray(selectedoptions) && (selectedoptions.length > 1 || multiselect)}
			{#each selectedoptions as so, sIndex (so.value)}
				<div
					class="flex h-fit w-fit min-w-[50px] justify-between gap-x-2 rounded-md p-[4px] {themecolor
						? themecolor === Domain.Entities.Theme.Color.PRIMARY
							? 'bg-primary text-primary-content'
							: themecolor === Domain.Entities.Theme.Color.SECONDARY
								? 'bg-secondary text-secondary-content'
								: 'bg-accent text-accent-content'
						: theme === Domain.Entities.Theme.Theme.DARK
							? 'bg-white text-black'
							: 'bg-black text-white'}"
				>
					<span class="text-md h-fit w-fit self-center">{so.label}</span>
					{#if !disabled}
						<button
							class="btn btn-circle btn-ghost btn-sm"
							onclick={() => {
								selectedoptions = (selectedoptions as SelectOption[]).filter((_, index) => index !== sIndex)
								ondeleteselectoptions(selectedoptions)
								onupdateselectoptions()
							}}
						>
							<!--mdi:close-thick source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path
									fill={themecolor
										? `var(${Utils.Theme.GetColorContent(themecolor)})`
										: theme === Domain.Entities.Theme.Theme.DARK
											? 'white'
											: 'black'}
									d="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12z"
								/>
							</svg>
						</button>
					{/if}
				</div>
			{/each}
		{/if}

		<div class="flex w-full min-w-[200px] flex-1 justify-between">
			<input
				class="input input-ghost w-full flex-[9] border-0 border-none outline-none p-1"
				type="search"
				bind:value={searchQuery}
				placeholder={!multiselect && typeof selectedoptions === 'object'
					? Array.isArray(selectedoptions)
						? selectedoptions[0].label
						: (selectedoptions as SelectOption).label
					: `${placeholder} ${multiselect && maxselectedoptions > 0 ? `(MAX ${maxselectedoptions})` : ''}`}
			/>

			<button
				class="btn btm-sm btn-circle btn-ghost self-center"
				onclick={() => {
					searchQueryIndexMatches = []
					if (multiselect) {
						searchQuery = ''
					} else {
						if (selectedoptions && selectedoptions !== null && !Array.isArray(selectedoptions)) {
							searchQuery = selectedoptions.label
						}
					}
				}}
			>
				<!--mdi:close source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24">
					<path
						fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
						d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
					/>
				</svg>
			</button>

			{#if !disabled}
				<button
					class="btn btm-sm btn-circle btn-ghost self-center"
					onclick={() => {
						selectedoptions = undefined
						ondeleteselectoptions(selectedoptions)
						onupdateselectoptions()
					}}
				>
					<!--mdi:delete source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24">
						<path
							fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
							d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"
						/>
					</svg>
				</button>
			{/if}
		</div>
	</header>

	<div
		class="flex h-full w-full flex-1 flex-col justify-center rounded-lg {theme === Domain.Entities.Theme.Theme.DARK
			? 'bg-black text-white'
			: 'bg-white text-black'} min-w-fit overflow-hidden shadow-md shadow-gray-800"
	>
		{#if showSelectOptions}
			<main class="flex h-full w-full min-w-[300px] flex-1 flex-col justify-center gap-y-2 rounded-md p-2">
				{#each Utils.Range(viewStart, Utils.RangeArrayEnd(viewEnd, noOfViewSelectOptions)) as soIndex (soIndex)}
					{@const so = viewSelectOptions[soIndex]}

					{#if so}
						<button
							class="btn btn-md btn-ghost"
							onclick={() => {
								if (multiselect) {
									if (Array.isArray(selectedoptions)) {
										for (let seo of selectedoptions) {
											if (seo.value === so.value && seo.label === so.label) {
												return
											}
										}
										selectedoptions = [...selectedoptions, so]
									} else {
										selectedoptions = [so]
									}
								} else {
									selectedoptions = so
								}
								onaddselectoptions(so)
								onupdateselectoptions()
							}}
							disabled={disabled || (maxselectedoptions > 1 && maxselectedoptions === (Array.isArray(selectedoptions) ? selectedoptions.length : 0))}
						>
							<div class="w-full text-left">{so.label}</div>
						</button>
					{/if}
				{/each}
			</main>

			{#if noOfViewSelectOptions > contentperpage}
				<div class="divider"></div>
			{/if}

			<section class="sticky bottom-0 flex h-fit w-full flex-col content-center justify-center gap-y-1 pl-1 pr-1">
				<div class="w-fit self-center">
					<Pagination
						lengthofdata={noOfViewSelectOptions}
						start={viewStart}
						end={viewEnd}
						{themecolor}
						{telemetry}
						{contentperpage}
						updatestart={(n: number) => (viewStart = n)}
						updateend={(n: number) => (viewEnd = n)}
						displayiflengthofdatagreaterthancontentperpage={true}
					></Pagination>
				</div>

				<button class="glass btn btn-sm w-full rounded-none rounded-b-lg" onclick={() => (showSelectOptions = false)}>
					<!--mdi:delete source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'} d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z" />
					</svg>
				</button>
			</section>
		{/if}
	</div>
</div>

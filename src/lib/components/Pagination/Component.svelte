<!--
@component

Paginating large amount of data.

Reactive if `lengthofdata` changes.

TODO:
- Add reactivity to changes in `contentperpage`.

Props:
- start - current start index of data to display.
- end - current end index of data to display.
- lengthofdata - total number of elements in data.
- contentperpage - current total number of elements
- theme - choose between `primary`, `secondary`, and `accent`.
- transparent - `true` if component buttons and content should not use theme color background.
- updatestart - function to update `start` index prop.
- updateend - function update `end` index prop.
- telemetry - utility for collecting telemetry following the `Domain.Interfaces.ITelemetry`interface.
- displayiflengthofdatagreaterthancontentperpage - show pagination component if `lengthofdata` greater than `contentperpage`.
-->
<script lang="ts">
	import { Domain, Utils } from '$lib'
	import { untrack } from 'svelte'

	const COMPONENT_NAME = 'pagination'

	interface Props {
		start?: number
		end?: number
		lengthofdata?: number
		contentperpage?: number
		themecolor?: Domain.Entities.Theme.Color
		transparent?: boolean
		updatestart?: (n: number) => void
		updateend?: (n: number) => void
		telemetry?: Domain.Interfaces.ITelemetry
		displayiflengthofdatagreaterthancontentperpage?: boolean
		size?: 'xs' | 'md'
		minified?: boolean
	}

	let {
		start = 0,
		end = 19,
		lengthofdata = 20,
		contentperpage = 20,
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		transparent = false,
		updatestart = undefined,
		updateend = undefined,
		telemetry = undefined,
		displayiflengthofdatagreaterthancontentperpage = false,
		size = 'md',
		minified = false
	}: Props = $props()

	let activeEndBoundary: number | undefined = undefined

	/**
	 * update {@linkcode start}, {@linkcode end}, and {@linkcode activeEndBoundary} if {@linkcode lengthofdata} changes.
	 */
	$effect(() => {
		if (untrack(() => end) > lengthofdata - 1) {
			untrack(() => {
				end = lengthofdata - 1
				onupdateend()

				if (start > end) {
					start = end - contentperpage < 0 ? 0 : end - contentperpage - 1
					onupdatestart()
				}
			})
		} else {
			untrack(() => {
				if (lengthofdata < contentperpage) {
					if (end !== lengthofdata - 1) {
						end = lengthofdata - 1
						onupdateend()
					}
				} else {
					if (end <= contentperpage - 1) {
						end = contentperpage - 1
						onupdateend()
					}
				}
			})
		}

		untrack(() => {
			if (
				end >= lengthofdata - contentperpage - 1 &&
				end < lengthofdata - 1 &&
				end > contentperpage &&
				(!activeEndBoundary || end < activeEndBoundary)
			) {
				activeEndBoundary = start + contentperpage - 1
				end = end + (lengthofdata - end - 1)
				onupdateend()
			}
		})
	})

	function onupdatestart() {
		if (updatestart) {
			updatestart(start)
		}
	}

	function onupdateend() {
		if (updateend) {
			updateend(end)
		}
	}

	function updateStartEnd() {
		if (activeEndBoundary) {
			activeEndBoundary = undefined
		}
		onupdatestart()
		onupdateend()
	}

	function pageNextDatumNavigation() {
		telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.DEBUG, 'Page Next Datum Navigation Before', 'start', start, 'end', end)

		start += 1
		end += 1

		telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.DEBUG, 'Page Next Datum Navigation After', 'start', start, 'end', end)

		if (autoRunPageNextDatumNavigation && end >= lengthofdata - 1) {
			autoRunPageNextDatumNavigation = false
		}

		updateStartEnd()
	}

	function pagePreviousDatumNavigation() {
		telemetry?.Log(
			COMPONENT_NAME,
			false,
			Domain.Entities.Telemetry.LogLevel.DEBUG,
			'Page Previous Datum Navigation Before',
			'start',
			start,
			'end',
			end
		)

		start -= 1
		end -= 1

		telemetry?.Log(
			COMPONENT_NAME,
			false,
			Domain.Entities.Telemetry.LogLevel.DEBUG,
			'Page Previous Datum Navigation After',
			'start',
			start,
			'end',
			end
		)

		if (autoRunPagePreviousDatumNavigation && start <= 0) {
			autoRunPagePreviousDatumNavigation = false
		}

		updateStartEnd()
	}

	let autoRunPagePreviousDatumNavigation: boolean = $state(false)

	/**
	 * Auto run {@linkcode pagePreviousDatumNavigation} on mouse down.
	 */
	$effect(() => {
		let interval: NodeJS.Timeout | undefined = undefined

		if (autoRunPagePreviousDatumNavigation) {
			interval = setInterval(pagePreviousDatumNavigation, 500)
		} else {
			clearInterval(interval)
		}

		return () => {
			clearInterval(interval)
		}
	})

	let autoRunPageNextDatumNavigation: boolean = $state(false)

	/***
	 * Auto run {@linkcode pageNextDatumNavigation} on mouse down.
	 */
	$effect(() => {
		let interval: NodeJS.Timeout | undefined = undefined

		if (autoRunPageNextDatumNavigation) {
			interval = setInterval(pageNextDatumNavigation, 500)
		} else {
			clearInterval(interval)
		}

		return () => {
			clearInterval(interval)
		}
	})

	let disableStart: boolean = $derived(start <= 0)

	let disableEnd: boolean = $derived(end >= lengthofdata - 1)
</script>

{#if !displayiflengthofdatagreaterthancontentperpage || lengthofdata > contentperpage}
	<div class="join">
		{#if !minified}
			<button
				id="page-first-navigation"
				class="join-item btn {size === 'xs' ? 'btn-xs' : 'btn-md'} {transparent
					? 'btn-ghost'
					: themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'}"
				aria-label="Page First Navigation"
				onclick={() => {
					telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.DEBUG, 'Page First Navigation Before', 'start', start, 'end', end)

					start = 0
					if (start + contentperpage > lengthofdata) {
						end = lengthofdata - 1
					} else {
						end = start + contentperpage - 1
					}

					telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.DEBUG, 'Page First Navigation After', 'start', start, 'end', end)

					updateStartEnd()
				}}
				disabled={disableStart}
			>
				<!--mdi:previous-title source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path
						fill="var({transparent
							? themecolor === Domain.Entities.Theme.Color.PRIMARY
								? '--color-primary'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? '--color-secondary'
									: '--color-accent'
							: themecolor === Domain.Entities.Theme.Color.PRIMARY
								? '--color-primary-content'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? '--color-secondary-content'
									: '--color-accent-content'})"
						d="M20 5v14l-7-7M6 5v14H4V5m9 0v14l-7-7"
					/>
				</svg>
			</button>
		{/if}

		{#if contentperpage > 1}
			<button
				id="page-previous-navigation"
				class="join-item btn {size === 'xs' ? 'btn-xs' : 'btn-md'} {transparent
					? 'btn-ghost'
					: themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'}"
				aria-label="Page Previous Navigation"
				onclick={() => {
					telemetry?.Log(
						COMPONENT_NAME,
						false,
						Domain.Entities.Telemetry.LogLevel.DEBUG,
						'Page Previous Navigation Before',
						'start',
						start,
						'end',
						end
					)

					end = start - 1

					if (start - contentperpage - 1 < 0 || end - (start - contentperpage - 1) < contentperpage - 1) {
						start = 0
					} else {
						start -= contentperpage + 1
					}

					if (start === 0 && start - end < contentperpage) {
						end = start + contentperpage - 1
					}

					telemetry?.Log(
						COMPONENT_NAME,
						false,
						Domain.Entities.Telemetry.LogLevel.DEBUG,
						'Page Previous Navigation After',
						'start',
						start,
						'end',
						end
					)

					updateStartEnd()
				}}
				disabled={disableStart}
			>
				<!--mdi:page-first source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path
						fill="var({transparent
							? themecolor === Domain.Entities.Theme.Color.PRIMARY
								? '--color-primary'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? '--color-secondary'
									: '--color-accent'
							: themecolor === Domain.Entities.Theme.Color.PRIMARY
								? '--color-primary-content'
								: themecolor === Domain.Entities.Theme.Color.SECONDARY
									? '--color-secondary-content'
									: '--color-accent-content'})"
						d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6l6 6zM6 6h2v12H6z"
					/>
				</svg>
			</button>
		{/if}

		{#if !minified}
			<button
				id="page-previous-datum-navigation"
				class="join-item btn {size === 'xs' ? 'btn-xs' : 'btn-md'} {transparent
					? 'btn-ghost'
					: themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'}"
				aria-label="Page Previous Datum Navigation"
				onclick={pagePreviousDatumNavigation}
				onmousedown={() => {
					autoRunPagePreviousDatumNavigation = true
				}}
				onmouseup={() => {
					autoRunPagePreviousDatumNavigation = false
				}}
				disabled={disableStart}
			>
				<!--mdi:navigate-before source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
					><path
						fill="var({transparent ? Utils.Theme.GetColor(themecolor) : Utils.Theme.GetColorContent(themecolor)})"
						d="M15.41 16.58L10.83 12l4.58-4.59L14 6l-6 6l6 6z"
					/>
				</svg>
			</button>
		{/if}

		<div
			id="page-info"
			class="join-item flex p-1 {transparent
				? 'bg-transparent'
				: themecolor === Domain.Entities.Theme.Color.PRIMARY
					? 'bg-primary text-primary-content'
					: themecolor === Domain.Entities.Theme.Color.SECONDARY
						? 'bg-secondary text-secondary-content'
						: 'bg-accent text-accent-content'}"
		>
			<div class="flex h-fit w-fit space-x-1 self-center {size === 'xs' ? 'text-xs' : 'text-md'} font-bold">
				<span>{start + 1}</span>
				{#if contentperpage > 1}
					<span>-</span>
					<span>{end + 1}</span>
				{/if}
				<span>/</span>
				<span>{lengthofdata}</span>
			</div>
		</div>

		{#if !minified}
			<button
				id="page-next-datum-navigation"
				class="join-item btn {size === 'xs' ? 'btn-xs' : 'btn-md'} {transparent
					? 'btn-ghost'
					: themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'}"
				aria-label="Page Next Datum Navigation"
				onclick={pageNextDatumNavigation}
				onmousedown={() => {
					autoRunPageNextDatumNavigation = true
				}}
				onmouseup={() => {
					autoRunPageNextDatumNavigation = false
				}}
				disabled={disableEnd}
			>
				<!--mdi:navigate-next source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
					><path
						fill="var({transparent ? Utils.Theme.GetColor(themecolor) : Utils.Theme.GetColorContent(themecolor)})"
						d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z"
					/>
				</svg>
			</button>
		{/if}

		{#if contentperpage > 1}
			<button
				id="page-next-navigation"
				class="join-item btn {size === 'xs' ? 'btn-xs' : 'btn-md'} {transparent
					? 'btn-ghost'
					: themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'}"
				aria-label="Page Next Navigation"
				onclick={() => {
					telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.DEBUG, 'Page Next Navigation Before', 'start', start, 'end', end)

					start = end + 1
					if (end + contentperpage > lengthofdata - 1) {
						end = lengthofdata - 1
					} else {
						end += contentperpage
					}

					telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.DEBUG, 'Page Next Navigation After', 'start', start, 'end', end)

					updateStartEnd()
				}}
				disabled={disableEnd}
			>
				<!--mdi:page-last source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
					><path
						fill="var({transparent ? Utils.Theme.GetColor(themecolor) : Utils.Theme.GetColorContent(themecolor)})"
						d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6l-6-6zM16 6h2v12h-2z"
					/>
				</svg>
			</button>
		{/if}

		{#if !minified}
			<button
				id="page-last-navigation"
				class="join-item btn {size === 'xs' ? 'btn-xs' : 'btn-md'} {transparent
					? 'btn-ghost'
					: themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'}"
				aria-label="Page Last Navigation"
				onclick={() => {
					telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.DEBUG, 'Page Last Navigation Before', 'start', start, 'end', end)

					end = lengthofdata - 1
					if (end - contentperpage < 0) {
						start = 0
					} else if (contentperpage === 1) {
						start = end
					} else {
						start = end - contentperpage
					}

					telemetry?.Log(COMPONENT_NAME, false, Domain.Entities.Telemetry.LogLevel.DEBUG, 'Page Last Navigation After', 'start', start, 'end', end)

					updateStartEnd()
				}}
				disabled={disableEnd}
			>
				<!--mdi:next-title source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
					><path
						fill="var({transparent ? Utils.Theme.GetColor(themecolor) : Utils.Theme.GetColorContent(themecolor)})"
						d="M4 5v14l7-7m7-7v14h2V5m-9 0v14l7-7"
					/>
				</svg>
			</button>
		{/if}
	</div>
{/if}

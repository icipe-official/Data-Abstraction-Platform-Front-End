<!--
@component

Alternative date-time input.

-->
<script lang="ts">
	import { Domain, Utils } from '$lib'
	import { untrack } from 'svelte'
	import { DateTimeFormat, Tab, type DateTime } from './util'

	const COMPONENT_NAME = 'date-time'

	interface Props {
		/** Preferably set as unix epox (new Date()) or ISOstring or UTC. Returns as ISOstring */
		value?: string | number | undefined
		/** Supported formats: yyyy-mm-dd hh:mm, yyyy-mm-dd, yyyy-mm, hh:mm, yyyy, mm */
		datetimeinputformat?: DateTimeFormat
		themecolor?: Domain.Entities.Theme.Color
		theme?: Domain.Entities.Theme.Theme
		telemetry?: Domain.Interfaces.ITelemetry
		updatedatetime?: (value: string | undefined) => void
		addborder?: boolean
		borderrounded?: boolean
		disabled?: boolean
	}

	let {
		value = undefined,
		datetimeinputformat = DateTimeFormat.YYYYMMDDHHMM,
		themecolor = Domain.Entities.Theme.Color.PRIMARY,
		theme = Domain.Entities.Theme.Theme.LIGHT,
		telemetry = undefined,
		updatedatetime = undefined,
		addborder = true,
		borderrounded = true,
		disabled = false
	}: Props = $props()

	let currentTab: Tab | undefined = $derived.by(() => {
		switch (datetimeinputformat) {
			case DateTimeFormat.YYYYMMDDHHMM:
			case DateTimeFormat.YYYYMMDD:
			case DateTimeFormat.YYYYMM:
			case DateTimeFormat.YYYY:
				return Tab.YEAR
			case DateTimeFormat.HHMM:
				return Tab.TIME
			case DateTimeFormat.MM:
				return Tab.MONTH
		}

		return undefined
	})

	let year: DateTime = $derived.by(() => {
		if (typeof value === 'string' || typeof value === 'number') {
			switch (datetimeinputformat) {
				case DateTimeFormat.YYYYMMDDHHMM:
				case DateTimeFormat.YYYYMMDD:
				case DateTimeFormat.YYYYMM:
				case DateTimeFormat.YYYY:
					const fullYear = new Date(value).getFullYear()

					untrack(() => {
						maxYearToDisplay = fullYear
						generateYearsToDisplay(true)
					})

					return fullYear
			}
		}

		untrack(() => {
			maxYearToDisplay = new Date().getFullYear()
			generateYearsToDisplay(true)
		})

		return undefined
	})
	let yearsToDisplay: number[] = $state([])
	let maxYearToDisplay: DateTime = $state(undefined)
	let yearInputFocused: boolean | null | undefined = $state(undefined)
	function generateYearsToDisplay(next: boolean) {
		if (typeof maxYearToDisplay !== 'number') return
		yearsToDisplay = []
		maxYearToDisplay = next
			? (() => (maxYearToDisplay + 24 < 9999 ? maxYearToDisplay + 24 : 9999))()
			: maxYearToDisplay - 24 > 1000
				? maxYearToDisplay - 24
				: 1024
		for (let i = maxYearToDisplay - 24; i < maxYearToDisplay; i++) {
			yearsToDisplay = [...yearsToDisplay, i < 1000 ? 0 : i]
		}

		// telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.DEBUG, 'Generated years to display', 'maxDmaxYearToDisplayays', maxYearToDisplay, 'yearsToDisplay', yearsToDisplay)
	}
	$effect(() => {
		if (yearInputFocused) {
			untrack(() => {
				currentTab = Tab.YEAR
				showDateTimeDropdown = true
			})
		}
	})

	let month: DateTime = $derived.by(() => {
		if (typeof value === 'string' || typeof value === 'number') {
			switch (datetimeinputformat) {
				case DateTimeFormat.YYYYMMDDHHMM:
				case DateTimeFormat.YYYYMMDD:
				case DateTimeFormat.YYYYMM:
				case DateTimeFormat.MM:
					return new Date(value).getMonth() + 1
			}
		}

		return undefined
	})
	let monthInputFocused: boolean | null | undefined = $state(undefined)
	$effect(() => {
		if (monthInputFocused) {
			untrack(() => {
				currentTab = Tab.MONTH
				showDateTimeDropdown = true
			})
		}
	})

	let day: DateTime = $derived.by(() => {
		if (typeof value === 'string' || typeof value === 'number') {
			switch (datetimeinputformat) {
				case DateTimeFormat.YYYYMMDDHHMM:
				case DateTimeFormat.YYYYMMDD:
					return new Date(value).getDay()
			}
		}

		return undefined
	})
	let maxDays: number = $state(0)
	let daysToDisplay: number[] = $state([])
	let dayInputFocused: boolean | null | undefined = $state(undefined)
	$effect(() => {
		if (
			typeof year === 'number' &&
			typeof month === 'number' &&
			(datetimeinputformat === DateTimeFormat.YYYYMMDDHHMM || datetimeinputformat === DateTimeFormat.YYYYMMDD)
		) {
			untrack(() => {
				daysToDisplay = []

				maxDays =
					month === 2 ? (() => (year! % 400 === 0 || (year! % 4 === 0 && year! % 100 !== 0) ? 29 : 28))() : [4, 6, 9, 11].includes(month!) ? 30 : 31
				if (typeof day === 'number' && day > maxDays) {
					day = maxDays
				}
				const startWeekDay = new Date(`${year}-${month}-01`).getDay()
				let dayCounter = 0
				for (let i = 0; i < 49; i++) {
					daysToDisplay = [
						...daysToDisplay,
						dayCounter < maxDays && i >= startWeekDay
							? (() => {
									dayCounter += 1
									return dayCounter
								})()
							: 0
					]
				}

				// telemetry?.Log(COMPONENT_NAME, true, Domain.Entities.Telemetry.LogLevel.DEBUG, 'Generated days to display', 'maxDays', maxDays, 'daysToDisplay', daysToDisplay)
			})
		} else {
			untrack(() => {
				maxDays = 0
				daysToDisplay = []
			})
		}
	})
	$effect(() => {
		if (dayInputFocused) {
			untrack(() => {
				currentTab = Tab.DAY
				showDateTimeDropdown = true
			})
		}
	})

	let hour: DateTime = $derived.by(() => {
		if (typeof value === 'string' || typeof value === 'number') {
			switch (datetimeinputformat) {
				case DateTimeFormat.YYYYMMDDHHMM:
				case DateTimeFormat.HHMM:
					return new Date(value).getHours() + 1
			}
		}

		return undefined
	})
	let hourInputFocused: boolean | null | undefined = $state(undefined)
	let minute: DateTime = $derived.by(() => {
		if (typeof value === 'string' || typeof value === 'number') {
			switch (datetimeinputformat) {
				case DateTimeFormat.YYYYMMDDHHMM:
				case DateTimeFormat.HHMM:
					return new Date(value).getMinutes() + 1
			}
		}

		return undefined
	})
	let minuteInputFocused: boolean | null | undefined = $state(undefined)

	$effect(() => {
		if (hourInputFocused || minuteInputFocused) {
			untrack(() => {
				currentTab = Tab.TIME
				showDateTimeDropdown = true
			})
		}
	})

	function getDateTimeUnitsString(value: DateTime) {
		if (typeof value === 'number') {
			if (value < 10) {
				return `0${value}`
			}

			return `${value}`
		}

		return '00'
	}

	function onupdatedatetime() {
		if (updatedatetime) {
			const date = new Date()

			switch (datetimeinputformat) {
				case DateTimeFormat.YYYYMMDDHHMM:
					if (typeof year === 'number') {
						date.setFullYear(year)
					}
					if (typeof month === 'number') {
						date.setMonth(month - 1)
					}
					if (typeof day === 'number') {
						date.setDate(day)
					}
					if (typeof hour === 'number') {
						date.setHours(hour)
					}
					if (typeof minute === 'number') {
						date.setMinutes(minute)
					}
					break
				case DateTimeFormat.YYYYMMDD:
					if (typeof year === 'number') {
						date.setFullYear(year)
					}
					if (typeof month === 'number') {
						date.setMonth(month - 1)
					}
					if (typeof day === 'number') {
						date.setDate(day)
					}
					break
				case DateTimeFormat.YYYYMM:
					if (typeof year === 'number') {
						date.setFullYear(year)
					}
					if (typeof month === 'number') {
						date.setMonth(month - 1)
					}
					break
				case DateTimeFormat.HHMM:
					if (typeof hour === 'number') {
						date.setHours(hour)
					}
					if (typeof minute === 'number') {
						date.setMinutes(minute)
					}
					break
				case DateTimeFormat.YYYY:
					if (typeof year === 'number') {
						date.setFullYear(year)
					}
					break
				case DateTimeFormat.MM:
					if (typeof month === 'number') {
						date.setMonth(month - 1)
					}
					break
			}

			updatedatetime(date.toISOString())
		}
	}

	let showDateTimeDropdown: boolean = $state(false)

	function reset() {
		year = undefined
		month = undefined
		day = undefined
		hour = undefined
		minute = undefined

		if (updatedatetime) {
			updatedatetime(undefined)
		}
	}
</script>

<div class="flex flex-1 flex-col gap-y-2">
	<header
		class="flex justify-between p-2 {addborder
			? `border ${borderrounded ? 'rounded-md' : ''} ${themecolor === Domain.Entities.Theme.Color.PRIMARY ? 'border-primary' : themecolor === Domain.Entities.Theme.Color.SECONDARY ? 'border-secondary' : themecolor === Domain.Entities.Theme.Color.ACCENT ? 'border-accent' : 'border-black'}`
			: ''} {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-base-100 text-white' : 'bg-white text-black'}"
	>
		<div class="flex h-fit gap-x-1 self-center">
			{#if datetimeinputformat === DateTimeFormat.YYYYMMDDHHMM}
				{@render yyyymmddInput()}

				<div class="p-1 text-xl">@</div>

				{@render hhmmInput()}
			{:else if datetimeinputformat === DateTimeFormat.YYYYMMDD}
				{@render yyyymmddInput()}
			{:else if datetimeinputformat === DateTimeFormat.YYYYMM}
				{@render yearInput()}

				<div class="self-center text-xl">/</div>

				{@render monthInput()}
			{:else if datetimeinputformat === DateTimeFormat.YYYY}
				{@render yearInput()}
			{:else if datetimeinputformat === DateTimeFormat.MM}
				{@render monthInput()}
			{:else if datetimeinputformat === DateTimeFormat.HHMM}
				{@render hhmmInput()}
			{/if}
		</div>

		<div class="p-1"></div>

		<div class="join h-fit self-center">
			<button class="join-item btn btn-md btn-ghost" aria-label="Reset value" {disabled} onclick={reset}>
				<!--mdi:delete source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path
						fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
						d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"
					/>
				</svg>
			</button>
			<button
				class="join-item btn btn-md btn-ghost"
				aria-label="Show date/time dropdown"
				onclick={() => (showDateTimeDropdown = !showDateTimeDropdown)}
			>
				<!--mdi:calendar-time source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path
						fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
						d="M15 13h1.5v2.82l2.44 1.41l-.75 1.3L15 16.69zm4-5H5v11h4.67c-.43-.91-.67-1.93-.67-3a7 7 0 0 1 7-7c1.07 0 2.09.24 3 .67zM5 21a2 2 0 0 1-2-2V5c0-1.11.89-2 2-2h1V1h2v2h8V1h2v2h1a2 2 0 0 1 2 2v6.1c1.24 1.26 2 2.99 2 4.9a7 7 0 0 1-7 7c-1.91 0-3.64-.76-4.9-2zm11-9.85A4.85 4.85 0 0 0 11.15 16c0 2.68 2.17 4.85 4.85 4.85A4.85 4.85 0 0 0 20.85 16c0-2.68-2.17-4.85-4.85-4.85"
					/>
				</svg>

				{#if showDateTimeDropdown}
					<div class="flex">
						<!--mdi:close-circle source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
							<path
								fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'}
								d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z"
							/>
						</svg>
					</div>
				{/if}
			</button>
		</div>
	</header>

	{#if showDateTimeDropdown}
		<main
			class="flex h-full w-full flex-1 flex-col gap-y-2 overflow-hidden rounded-lg p-1 shadow-md shadow-gray-800 {theme ===
			Domain.Entities.Theme.Theme.DARK
				? 'bg-black text-white'
				: 'bg-white text-black'}"
		>
			{#if currentTab === Tab.YEAR}
				<section class="join">
					<button
						class="join-item btn btn-ghost glass btn-xl self-center p-2"
						aria-label="Show previous years"
						onclick={() => {
							generateYearsToDisplay(false)
						}}
					>
						<!--mdi:chevron-left source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'} d="M15.41 16.58L10.83 12l4.58-4.59L14 6l-6 6l6 6z" />
						</svg>
					</button>
					<div class="join-item grid h-full w-full flex-1 grid-cols-6 justify-items-center">
						{#each yearsToDisplay as ytd}
							{#if disabled}
								<div
									class="p-1 text-center {ytd === year
										? themecolor
											? themecolor === Domain.Entities.Theme.Color.PRIMARY
												? 'bg-primary text-primary-content'
												: themecolor === Domain.Entities.Theme.Color.SECONDARY
													? 'bg-secondary text-secondary-content'
													: 'bg-accent text-accent-content'
											: theme === Domain.Entities.Theme.Theme.DARK
												? 'bg-white text-black'
												: 'bg-black text-white'
										: ''}"
								>
									{ytd}
								</div>
							{:else}
								<button
									class="btn btn-md btn-square {ytd === year
										? themecolor
											? themecolor === Domain.Entities.Theme.Color.PRIMARY
												? 'btn-primary'
												: themecolor === Domain.Entities.Theme.Color.SECONDARY
													? 'btn-secondary'
													: 'btn-accent'
											: theme === Domain.Entities.Theme.Theme.DARK
												? 'bg-white text-black'
												: 'bg-black text-white'
										: 'btn-ghost'}"
									aria-label="pick year {ytd}"
									onclick={() => {
										year = ytd
										onupdatedatetime()
									}}
								>
									{ytd}
								</button>
							{/if}
						{/each}
					</div>
					<button
						class="join-item btn btn-ghost glass btn-xl self-center p-2"
						aria-label="Show next years"
						onclick={() => {
							generateYearsToDisplay(true)
						}}
					>
						<!--mdi:chevron-right source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'} d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z" />
						</svg>
					</button>
				</section>
			{:else if currentTab === Tab.MONTH}
				<section class="grid w-full grid-cols-3 justify-items-center">
					{@render monthDropdownOption(1, 'January')}
					{@render monthDropdownOption(2, 'February')}
					{@render monthDropdownOption(3, 'March')}

					{@render monthDropdownOption(4, 'April')}
					{@render monthDropdownOption(5, 'May')}
					{@render monthDropdownOption(6, 'June')}

					{@render monthDropdownOption(7, 'July')}
					{@render monthDropdownOption(8, 'August')}
					{@render monthDropdownOption(9, 'September')}

					{@render monthDropdownOption(10, 'October')}
					{@render monthDropdownOption(11, 'November')}
					{@render monthDropdownOption(12, 'December')}
				</section>
			{:else if currentTab === Tab.DAY}
				<section style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr));" class="w-full justify-items-center">
					{@render dayDisplay('Sun')}
					{@render dayDisplay('Mon')}
					{@render dayDisplay('Tue')}
					{@render dayDisplay('Wed')}
					{@render dayDisplay('Thu')}
					{@render dayDisplay('Fri')}
					{@render dayDisplay('Sat')}

					{#each daysToDisplay as dtd}
						{#if dtd > 0}
							{#if disabled}
								<div
									class="p-1 text-center {dtd === day
										? themecolor
											? themecolor === Domain.Entities.Theme.Color.PRIMARY
												? 'bg-primary text-primary-content'
												: themecolor === Domain.Entities.Theme.Color.SECONDARY
													? 'bg-secondary text-secondary-content'
													: 'bg-accent text-accent-content'
											: theme === Domain.Entities.Theme.Theme.DARK
												? 'bg-white text-black'
												: 'bg-black text-white'
										: ''}"
								>
									{dtd}
								</div>
							{:else}
								<button
									class="btn btn-md btn-square
									{dtd === day
										? themecolor
											? themecolor === Domain.Entities.Theme.Color.PRIMARY
												? 'btn-primary'
												: themecolor === Domain.Entities.Theme.Color.SECONDARY
													? 'btn-secondary'
													: 'btn-accent'
											: theme === Domain.Entities.Theme.Theme.DARK
												? 'bg-white text-black'
												: 'bg-black text-white'
										: 'btn-ghost'}
									"
									aria-label="pick day {dtd}"
									onclick={() => {
										day = dtd
										onupdatedatetime()
									}}
								>
									{dtd}
								</button>
							{/if}
						{:else}
							<div class="min-h-full min-w-full"></div>
						{/if}
					{/each}
				</section>
			{:else if currentTab === Tab.TIME}
				<section class="flex h-fit w-fit self-center">
					<div class="flex flex-1 flex-col">
						<button
							class="btn btn-md btn-ghost"
							onclick={() => {
								if (typeof hour == 'number') {
									hour += hour + 1 <= 23 ? 1 : 0
								} else {
									hour = 0
								}
								onupdatedatetime()
							}}
							disabled={disabled || hour === 23}
						>
							<!--mdi:chevron-up source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'} d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z" />
							</svg>
						</button>
						<div class="w-full border p-1 text-center text-2xl">{typeof hour === 'number' ? getDateTimeUnitsString(hour) : 'hh'}</div>
						<button
							class="btn btn-md btn-ghost"
							onclick={() => {
								if (typeof hour == 'number') {
									hour -= hour - 1 >= 0 ? 1 : 0
								} else {
									hour = 0
								}
								onupdatedatetime()
							}}
							disabled={disabled || hour === 0}
						>
							<!--mdi:chevron-down source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'} d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z" />
							</svg>
						</button>
					</div>
					<div class="flex flex-1 flex-col">
						<button
							class="btn btn-md btn-ghost"
							onclick={() => {
								if (typeof minute == 'number') {
									minute += minute + 1 <= 59 ? 1 : 0
								} else {
									minute = 0
								}
								onupdatedatetime()
							}}
							disabled={disabled || minute === 59 || typeof hour !== 'number'}
						>
							<!--mdi:chevron-up source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'} d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z" />
							</svg>
						</button>
						<div class="w-full border p-1 text-center text-2xl">{typeof minute === 'number' ? getDateTimeUnitsString(minute) : 'mm'}</div>
						<button
							class="btn btn-md btn-ghost"
							onclick={() => {
								if (typeof minute == 'number') {
									minute -= minute - 1 >= 0 ? 1 : 0
								} else {
									minute = 0
								}
								onupdatedatetime()
							}}
							disabled={disabled || minute === 0 || typeof hour !== 'number'}
						>
							<!--mdi:chevron-down source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path fill={theme === Domain.Entities.Theme.Theme.DARK ? 'white' : 'black'} d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z" />
							</svg>
						</button>
					</div>
				</section>
			{/if}
		</main>
	{/if}
</div>

{#snippet monthDropdownOption(index: number, label: string)}
	{#if disabled}
		<div
			class="p-1 text-center {index === month
				? themecolor
					? themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'bg-primary text-primary-content'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'bg-secondary text-secondary-content'
							: 'bg-accent text-accent-content'
					: theme === Domain.Entities.Theme.Theme.DARK
						? 'bg-white text-black'
						: 'bg-black text-white'
				: ''}"
		>
			{label || index}
		</div>
	{:else}
		<button
			class="btn btn-lg btn-square min-w-full {index === month
				? themecolor
					? themecolor === Domain.Entities.Theme.Color.PRIMARY
						? 'btn-primary'
						: themecolor === Domain.Entities.Theme.Color.SECONDARY
							? 'btn-secondary'
							: 'btn-accent'
					: theme === Domain.Entities.Theme.Theme.DARK
						? 'bg-white text-black'
						: 'bg-black text-white'
				: 'btn-ghost'}"
			aria-label="pick month {index}"
			onclick={() => {
				month = index
				onupdatedatetime()
			}}
		>
			{label || index}
		</button>
	{/if}
{/snippet}

{#snippet dayDisplay(label: string)}
	<div
		class="btn btn-ghost btn-square btn-md {themecolor
			? themecolor === Domain.Entities.Theme.Color.PRIMARY
				? 'text-primary'
				: themecolor === Domain.Entities.Theme.Color.SECONDARY
					? 'text-secondary'
					: 'text-accent'
			: theme === Domain.Entities.Theme.Theme.DARK
				? 'text-white'
				: 'text-black'}"
	>
		{label}
	</div>
{/snippet}

{#snippet hhmmInput()}
	{@render hourInput()}

	<div class="self-center text-xl">:</div>

	{@render minuteInput()}
{/snippet}

{#snippet yyyymmddInput()}
	{@render yearInput()}

	<div class="self-center text-xl">/</div>

	{@render monthInput()}

	<div class="self-center text-xl">/</div>

	{@render dayInput()}
{/snippet}

{#snippet yearInput()}
	<input
		class="input input-ghost input-md w-[60px] self-center border-0 border-none text-center"
		style="outline:none;"
		type="number"
		min="1000"
		max="9999"
		value={year}
		oninput={(event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
			const v = event.currentTarget.value

			if (v.length > 0) {
				year = Math.round(Number(v))
			} else {
				year = undefined
			}

			onupdatedatetime()
		}}
		{disabled}
		placeholder="year"
		bind:focused={yearInputFocused}
	/>
{/snippet}

{#snippet monthInput()}
	<input
		class="input input-ghost input-md w-[70px] self-center border-0 border-none text-center"
		style="outline:none;"
		type="number"
		min="1"
		max="12"
		value={typeof month === 'number' ? getDateTimeUnitsString(month) : ''}
		oninput={(event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
			const v = event.currentTarget.value

			if (v.length > 0) {
				month = Math.round(Number(v))
			} else {
				month = undefined
			}

			onupdatedatetime()
		}}
		{disabled}
		placeholder="month"
		bind:focused={monthInputFocused}
	/>
{/snippet}

{#snippet dayInput()}
	<input
		class="input input-ghost input-md w-[70px] self-center border-0 border-none text-center"
		style="outline:none;"
		type="number"
		min="1"
		max={maxYearToDisplay}
		value={typeof day === 'number' ? getDateTimeUnitsString(day) : ''}
		oninput={(event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
			const v = event.currentTarget.value

			if (v.length > 0) {
				day = Math.round(Number(v))
			} else {
				day = undefined
			}

			onupdatedatetime()
		}}
		disabled={disabled || typeof year !== 'number' || typeof month !== 'number'}
		placeholder="day"
		bind:focused={dayInputFocused}
	/>
{/snippet}

{#snippet hourInput()}
	<input
		class="input input-ghost input-md w-[70px] self-center border-0 border-none text-center"
		style="outline:none;"
		type="number"
		min="0"
		max="23"
		value={typeof hour === 'number' ? getDateTimeUnitsString(hour) : ''}
		oninput={(event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
			const v = event.currentTarget.value

			if (v.length > 0) {
				hour = Math.round(Number(v))
			} else {
				hour = undefined
			}

			onupdatedatetime()
		}}
		{disabled}
		placeholder="hour"
		bind:focused={hourInputFocused}
	/>
{/snippet}

{#snippet minuteInput()}
	<input
		class="input input-ghost input-md w-[80px] self-center border-0 border-none text-center"
		style="outline:none;"
		type="number"
		min="0"
		max="59"
		value={typeof minute === 'number' ? getDateTimeUnitsString(minute) : ''}
		oninput={(event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
			const v = event.currentTarget.value
			if (v.length > 0) {
				minute = Math.round(Number(v))
			} else {
				minute = undefined
			}

			onupdatedatetime()
		}}
		disabled={disabled || typeof hour !== 'number'}
		placeholder="minute"
		bind:focused={minuteInputFocused}
	/>
{/snippet}

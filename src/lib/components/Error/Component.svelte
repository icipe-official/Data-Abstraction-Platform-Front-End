<script lang="ts">
	import { Domain, State } from '$lib'

	interface Props {
		status: number
		message: any
		shadow?: 'outer' | 'inner'
	}

	let { status, message, shadow = 'outer' }: Props = $props()

	let errorMessage = $derived.by(() => {
		if (typeof message === 'string') {
			return message
		}

		if (typeof message === 'object') {
			if (Array.isArray(message)) {
				return message.join('|| ')
			}

			return Object.keys(message)
				.map((key) => `${key} -> ${message[key]}`)
				.join(' || ')
		}

		return `${message}`
	})
</script>

<span
	class="flex h-fit w-fit rounded-lg p-2 {shadow === 'outer' ? 'shadow-md' : 'shadow-inner'} shadow-gray-800 {State.Theme.value ===
	Domain.Entities.Theme.Theme.DARK
		? 'bg-base-200'
		: 'bg-white'}"
>
	<section class="flex flex-col justify-end gap-y-2 pt-6 pb-6 text-3xl">
		<span class="text-error self-end">{status}</span>
	</section>

	<div class="divider divider-horizontal"></div>

	<section class="flex">
		<span class="self-center text-sm text-wrap break-words">{errorMessage}</span>
	</section>
</span>

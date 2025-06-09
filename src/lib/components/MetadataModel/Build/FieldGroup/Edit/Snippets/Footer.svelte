<script module lang="ts">
	import { Domain } from '$lib'

	export { footer as FooterSnippet }
</script>

{#snippet footer(
	themecolor: Domain.Entities.Theme.Color,
	theme: Domain.Entities.Theme.Theme,
	updatefieldgroup: (value: any) => void,
	fieldgroup: any
)}
	<footer class="sticky bottom-0 z-[2] flex justify-center gap-y-2 p-2 {theme === Domain.Entities.Theme.Theme.DARK ? 'bg-gray-800' : 'bg-gray-100'}">
		<button
			class="btn btn-md {themecolor === Domain.Entities.Theme.Color.PRIMARY
				? 'btn-primary'
				: themecolor === Domain.Entities.Theme.Color.SECONDARY
					? 'btn-secondary'
					: 'btn-accent'}"
			onclick={() => updatefieldgroup(fieldgroup)}
		>
			update
		</button>
	</footer>
{/snippet}

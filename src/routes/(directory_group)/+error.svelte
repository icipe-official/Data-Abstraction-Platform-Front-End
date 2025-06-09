<script lang="ts">
	import { page } from '$app/state'
	import { Component } from '$lib'
</script>

<div class="flex h-full w-full justify-center">
	<span class="self-center"><Component.Error status={page.status} message={page.error?.message || 'Error'}></Component.Error></span>
</div>

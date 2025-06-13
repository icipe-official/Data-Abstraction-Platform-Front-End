// See https://svelte.dev/docs/kit/types#app.d.ts

import type { Domain } from '$lib'

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			Theme?: Domain.Entities.Theme.Theme
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}

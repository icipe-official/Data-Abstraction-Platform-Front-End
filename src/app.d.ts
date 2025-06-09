// See https://svelte.dev/docs/kit/types#app.d.ts

import type { Domain } from '$lib'

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			Theme?: Domain.Entities.Theme.Theme
			AuthenticationHeaders?: Domain.Entities.Iam.AuthenticationHeaders
			AuthenticationTokens?: Domain.Entities.Iam.AccessRefreshToken
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}

import { State, Utils, type Domain } from '$lib'

export class Client implements Domain.Interfaces.AuthenticatedFetch {
	private refreshToken: boolean = true
	private fetch: {
		(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
		(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>
	}

	constructor(
		refreshToken: boolean = true,
		customFetch?: {
			(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
			(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>
		}
	) {
		refreshToken = refreshToken
		this.fetch = customFetch ? customFetch : fetch
	}

	async Fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
		if (
			State.AuthenticationHeaders.value &&
			State.AuthenticationHeaders.value.refresh_token_header &&
			State.AuthenticationHeaders.value.access_token_header &&
			State.Session.tokens &&
			State.Session.tokens.access_token &&
			State.Session.tokens.refresh_token
		) {
			if (!init) {
				init = {}
			}

			if (!init.headers) {
				init.headers = {}
			}

			let authHeaders: { [Key: string]: string } = {}
			authHeaders[State.AuthenticationHeaders.value.access_token_header] = State.Session.tokens.access_token
			authHeaders[State.AuthenticationHeaders.value.refresh_token_header] = State.Session.tokens.refresh_token

			let fetchResponse = await fetch(input, {
				...init,
				headers: {
					...init.headers,
					...authHeaders
				}
			})

			if (fetchResponse.status === 401 && this.refreshToken) {
				const tokens = await Utils.Iam.RefreshToken(State.Session.tokens, State.AuthenticationHeaders.value, this.fetch)
				if (tokens.access_token && tokens.refresh_token) {
					State.UpdateSessionTokens(tokens)
					authHeaders[State.AuthenticationHeaders.value.access_token_header] = State.Session.tokens.access_token
					authHeaders[State.AuthenticationHeaders.value.refresh_token_header] = State.Session.tokens.refresh_token

					fetchResponse = await this.fetch(input, {
						...init,
						headers: {
							...init.headers,
							...authHeaders
						}
					})
				} else {
					State.Session.tokens = {}
				}
			}

			return fetchResponse
		} else {
			return await this.fetch(input, init)
		}
	}
}

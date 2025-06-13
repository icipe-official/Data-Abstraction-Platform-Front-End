import { Domain } from '$lib'

export async function RefreshToken(
	token: Domain.Entities.Iam.AccessRefreshToken,
	authenticationHeaders: Domain.Entities.Iam.AuthenticationHeaders,
	customFetch?: {
		(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
		(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>
	}
): Promise<Domain.Entities.Iam.AccessRefreshToken> {
	let goFetch = customFetch ? customFetch : fetch

	let headers: { [key: string]: string } = {}
	if (token.access_token) {
		headers[`${authenticationHeaders.access_token_header}`] = token.access_token
	}
	if (token.refresh_token) {
		headers[`${authenticationHeaders.refresh_token_header}`] = token.refresh_token
	}

	try {
		const fetchResponse = await goFetch(Domain.Entities.Url.ApiUrlPaths.Iam.RefreshTokens, {
			headers
		})

		const fetchData = await fetchResponse.json()
		if (fetchResponse.ok) {
			return fetchData
		} else {
			throw ['status', fetchResponse.status, 'message', fetchData.message]
		}
	} catch (e) {
		throw e
	}
}

export async function GetAuthenticationHeaders(customFetch?: {
	(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
	(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>
}): Promise<Domain.Entities.Iam.AuthenticationHeaders> {
	let goFetch = customFetch ? customFetch : fetch

	try {
		const fetchResponse = await goFetch(Domain.Entities.Url.ApiUrlPaths.Iam.AuthenticationHeaders, {
			credentials: 'include'
		})

		const fetchData = await fetchResponse.json()
		if (fetchResponse.ok) {
			return fetchData
		} else {
			throw ['status', fetchResponse.status, 'message', fetchData.message]
		}
	} catch (e) {
		throw e
	}
}

export async function GetSession(customFetch?: {
	(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
	(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>
}): Promise<Domain.Entities.Iam.Session> {
	let goFetch = customFetch ? customFetch : fetch

	try {
		const fetchResponse = await goFetch(Domain.Entities.Url.ApiUrlPaths.Iam.Session, {
			credentials: 'include'
		})

		const fetchData = await fetchResponse.json()
		if (fetchResponse.ok) {
			return fetchData
		} else {
			throw ['status', fetchResponse.status, 'message', fetchData.message]
		}
	} catch (e) {
		throw e
	}
}

export async function GetOpenidEndpoints(customFetch?: {
	(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
	(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>
}): Promise<Domain.Entities.Iam.OpenIDEndpoints> {
	let goFetch = customFetch ? customFetch : fetch

	try {
		const fetchResponse = await goFetch(Domain.Entities.Url.ApiUrlPaths.Iam.OpenIDEndpoints)

		const fetchData = await fetchResponse.json()
		if (fetchResponse.ok) {
			return fetchData
		} else {
			throw ['status', fetchResponse.status, 'message', fetchData.message]
		}
	} catch (e) {
		throw e
	}
}

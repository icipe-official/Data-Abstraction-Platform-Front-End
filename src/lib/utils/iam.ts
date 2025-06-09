import { Domain } from '$lib'

export async function RefreshToken(
	token: Domain.Entities.Iam.AccessRefreshToken,
	authenticationHeaders: Domain.Entities.Iam.AuthenticationHeaders,
	customFetch?: {
		(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
		(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>
	}
): Promise<Domain.Entities.Iam.AccessRefreshToken> {
	let goFetch = fetch
	if (customFetch) {
		goFetch = customFetch
	}

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
	let goFetch = fetch
	if (customFetch) {
		goFetch = customFetch
	}
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

export async function GetSession(
	authenticationHeaders: Domain.Entities.Iam.AuthenticationHeaders,
	authenticationTokens: Domain.Entities.Iam.AccessRefreshToken,
	customFetch?: {
		(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
		(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>
	}
): Promise<Domain.Entities.Iam.Session> {
	let goFetch = fetch
	if (customFetch) {
		goFetch = customFetch
	}

	if (
		!authenticationTokens.refresh_token ||
		!authenticationTokens.access_token ||
		!authenticationHeaders.access_token_header ||
		!authenticationHeaders.refresh_token_header
	) {
		throw [
			'authenticationTokens or authenticationHeaders not valid',
			'authenticationTokens',
			authenticationTokens,
			'authenticationHeaders',
			authenticationHeaders
		]
	}

	const headers: { [Key: string]: string } = {}
	headers[`${authenticationHeaders.access_token_header}`] = authenticationTokens.access_token
	headers[`${authenticationHeaders.refresh_token_header}`] = authenticationTokens.refresh_token
	try {
		const fetchResponse = await goFetch(Domain.Entities.Url.ApiUrlPaths.Iam.Session, {
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

export async function GetOpenidEndpoints(customFetch?: {
	(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
	(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>
}): Promise<Domain.Entities.Iam.OpenIDEndpoints> {
	let goFetch = fetch
	if (customFetch) {
		goFetch = customFetch
	}
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

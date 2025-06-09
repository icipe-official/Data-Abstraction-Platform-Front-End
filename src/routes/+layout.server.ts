import { Domain, Utils } from '$lib'
import type { LayoutServerLoad } from './$types'

interface data {
	theme?: Domain.Entities.Theme.Theme
	openid_endpoints?: Domain.Entities.Iam.OpenIDEndpoints
	session?: Domain.Entities.Iam.Session
	tokens?: Domain.Entities.Iam.AccessRefreshToken
	authentication_headers?: Domain.Entities.Iam.AuthenticationHeaders
}

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
	let data: data = {}

	if (locals.Theme) {
		data.theme = locals.Theme
	}

	data.openid_endpoints = await Utils.Iam.GetOpenidEndpoints(fetch)

	if (locals.AuthenticationHeaders) {
		data.authentication_headers = locals.AuthenticationHeaders
	}

	if (locals.AuthenticationTokens) {
		data.tokens = locals.AuthenticationTokens
	}
	
	if (locals.AuthenticationHeaders && locals.AuthenticationTokens) {
		data.session = await Utils.Iam.GetSession(locals.AuthenticationHeaders, locals.AuthenticationTokens, fetch)
	}

	return data
}

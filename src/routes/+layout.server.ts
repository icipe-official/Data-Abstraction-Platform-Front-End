import { Domain, Utils } from '$lib'
import type { LayoutServerLoad } from './$types'

interface data {
	theme?: Domain.Entities.Theme.Theme
	openid_endpoints?: Domain.Entities.Iam.OpenIDEndpoints
	session?: Domain.Entities.Iam.Session
}

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
	let data: data = {}

	if (locals.Theme) {
		data.theme = locals.Theme
	}

	data.openid_endpoints = await Utils.Iam.GetOpenidEndpoints(fetch)

	try {
		data.session = await Utils.Iam.GetSession(fetch)
	} catch (e) {
		console.error(e)
	}

	return data
}

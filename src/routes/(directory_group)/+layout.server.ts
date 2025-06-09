import { Domain } from '$lib'
import { error } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

interface data {
	directory_group_id?: string
	theme?: Domain.Entities.Theme.Theme
	tokens?: Domain.Entities.Iam.AccessRefreshToken
	authentication_headers?: Domain.Entities.Iam.AuthenticationHeaders
}

export const load: LayoutServerLoad = async ({ url, locals }) => {
	let data: data = {}

	if (locals.Theme) {
		data.theme = locals.Theme
	}

	if (locals.AuthenticationHeaders) {
		data.authentication_headers = locals.AuthenticationHeaders
	}

	if (locals.AuthenticationTokens) {
		data.tokens = locals.AuthenticationTokens
	}

	if (url.searchParams.get(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID)) {
		data.directory_group_id = url.searchParams.get(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID)!
	}

	return data
}

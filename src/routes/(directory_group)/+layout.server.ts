import { Domain } from '$lib'
import { error } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

interface data {
	directory_group_id?: string
	theme?: Domain.Entities.Theme.Theme
}

export const load: LayoutServerLoad = async ({ url, locals }) => {
	let data: data = {}

	if (locals.Theme) {
		data.theme = locals.Theme
	}

	if (url.searchParams.get(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID)) {
		data.directory_group_id = url.searchParams.get(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID)!
	}

	return data
}

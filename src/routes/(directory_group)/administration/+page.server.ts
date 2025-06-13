import { Domain } from '$lib'
import type { PageServerLoad } from './$types'

interface data {
	directory_group_id?: string
	theme?: Domain.Entities.Theme.Theme
	
}

export const load: PageServerLoad = async ({ locals, url }) => {
	let data: data = {}

	if (locals.Theme) {
		data.theme = locals.Theme
	}

	if (url.searchParams.get(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID)) {
		data.directory_group_id = url.searchParams.get(Domain.Entities.Url.SearchParams.DIRECTORY_GROUP_ID)!
	}
}

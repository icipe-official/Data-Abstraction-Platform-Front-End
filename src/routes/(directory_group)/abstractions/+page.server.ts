import { Domain } from '$lib'
import type { PageServerLoad } from './$types'

interface data {
    directory_group_id?: string
    current_directory_group?: Domain.Entities.MetadataModel.IDatum
    theme?: Domain.Entities.Theme.Theme
    tokens?: Domain.Entities.Iam.AccessRefreshToken
    authentication_headers?: Domain.Entities.Iam.AuthenticationHeaders
}

export const load: PageServerLoad = async ({ url, locals }) => {
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

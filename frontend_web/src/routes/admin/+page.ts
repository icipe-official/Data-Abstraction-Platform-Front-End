import { browser } from '$app/environment'
import { PUBLIC_API_URL } from '$env/static/public'
import { Shared, FETCH_ERROR } from '$lib/constants'
import { CurrentUser } from '$lib/stores'
import { Log } from '$lib/utils'
import { error } from '@sveltejs/kit'
import { get } from 'svelte/store'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch }) => {
	if (!browser) return
	if (get(CurrentUser) === null) {
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/iam/session`, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				CurrentUser.set(data)
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, 'IAM', e, 'Get session failed')
			throw error(500, { message: FETCH_ERROR })
		}
	}
    if (get(CurrentUser)?.SystemUserCreatedOn === "0001-01-01T00:00:00Z") {
        throw error(403, { message: 'Forbidden' })
    }
}

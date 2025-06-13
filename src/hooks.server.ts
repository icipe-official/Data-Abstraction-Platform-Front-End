import type { Handle } from '@sveltejs/kit'
import { Domain, Utils } from '$lib'
import { sequence } from '@sveltejs/kit/hooks'

const AUTHENTICATION_TOKEN_HEADERS_COOKIE_KEY = 'ath'

export const handleRefreshTokens: Handle = async ({ event, resolve }) => {
	const athCookie = event.cookies.get(AUTHENTICATION_TOKEN_HEADERS_COOKIE_KEY)

	let iamAuthenticationHeaders: Domain.Entities.Iam.AuthenticationHeaders | undefined
	if (typeof athCookie === 'string') {
		iamAuthenticationHeaders = JSON.parse(athCookie)
	} else {
		iamAuthenticationHeaders = await Utils.Iam.GetAuthenticationHeaders(fetch)
		event.cookies.set(AUTHENTICATION_TOKEN_HEADERS_COOKIE_KEY, JSON.stringify(iamAuthenticationHeaders), {
			httpOnly: true,
			sameSite: true,
			secure: iamAuthenticationHeaders.cookie_secure,
			domain: iamAuthenticationHeaders.cookie_domain,
			path: Utils.Env.BasePath
		})
	}

	if (iamAuthenticationHeaders && iamAuthenticationHeaders.access_token_header && iamAuthenticationHeaders.refresh_token_header) {
		if (event.cookies.get(iamAuthenticationHeaders.refresh_token_header)) {
			if (!event.cookies.get(iamAuthenticationHeaders.access_token_header)) {
				try {
					const newToken = await Utils.Iam.RefreshToken(
						{ refresh_token: event.cookies.get(iamAuthenticationHeaders.refresh_token_header) },
						iamAuthenticationHeaders,
						fetch
					)

					if (newToken && newToken.access_token && newToken.access_token_expires_in && newToken.refresh_token && newToken.refresh_token_expires_in) {
						event.cookies.set(iamAuthenticationHeaders.access_token_header, newToken.access_token, {
							httpOnly: iamAuthenticationHeaders.cookie_http_only,
							sameSite: true,
							secure: iamAuthenticationHeaders.cookie_secure,
							domain: iamAuthenticationHeaders.cookie_domain,
							maxAge: newToken.access_token_expires_in,
							path: Utils.Env.BasePath,
							encode(value) {
								return value
							}
						})

						event.cookies.set(iamAuthenticationHeaders.refresh_token_header, newToken.refresh_token, {
							httpOnly: iamAuthenticationHeaders.cookie_http_only,
							sameSite: true,
							secure: iamAuthenticationHeaders.cookie_secure,
							domain: iamAuthenticationHeaders.cookie_domain,
							maxAge: newToken.refresh_token_expires_in,
							path: Utils.Env.BasePath,
							encode(value) {
								return value
							}
						})
					}
				} catch {}
			}
		}
	}

	return resolve(event)
}

/**
 * Handler sets the theme for the website.
 *
 * Reference [here](https://scottspence.com/posts/theme-switching-in-sveltekit-updated-for-daisyui-v5-and-tailwind-v4).
 * @param param0
 */
const handleSetTheme: Handle = async ({ event, resolve }) => {
	const theme = event.cookies.get('theme')

	if (!theme || !Utils.Theme.IsThemeSupported(theme)) {
		return await resolve(event)
	}

	event.locals.Theme = theme as Domain.Entities.Theme.Theme

	return await resolve(event, {
		transformPageChunk: ({ html }) => {
			return html.replace('data-theme=""', `data-theme="${theme}"`)
		}
	})
}

export const handle: Handle = sequence(handleSetTheme, handleRefreshTokens)

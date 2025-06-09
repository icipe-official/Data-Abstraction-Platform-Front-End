import type { Domain } from "$lib"

export class Server implements Domain.Interfaces.AuthenticatedFetch {
    private tokens: Domain.Entities.Iam.AccessRefreshToken
    private authentication_headers: Domain.Entities.Iam.AuthenticationHeaders
    private fetch: {
        (input: RequestInfo | URL, init?: RequestInit): Promise<Response>
        (input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>
    }

    constructor(
        tokens: Domain.Entities.Iam.AccessRefreshToken,
        authentication_headers: Domain.Entities.Iam.AuthenticationHeaders,
        customFetch?: {
            (input: RequestInfo | URL, init?: RequestInit): Promise<Response>
            (input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>
        }
    ) {
        this.tokens = tokens
        this.authentication_headers = authentication_headers
        this.fetch = customFetch ? customFetch : fetch
    }

    async Fetch(input: RequestInfo | URL, init?: RequestInit) {
        if (this.tokens.access_token && this.tokens.refresh_token && this.authentication_headers.access_token_header && this.authentication_headers.refresh_token_header) {
            if (!init) {
                init = {}
            }

            if (!init.headers) {
                init.headers = {}
            }

            let authHeaders: { [Key: string]: string } = {}
            authHeaders[this.authentication_headers.access_token_header] = this.tokens.access_token
            authHeaders[this.authentication_headers.refresh_token_header] = this.tokens.refresh_token

            let fetchResponse = await this.fetch(input, {
                ...init,
                headers: {
                    ...init.headers,
                    ...authHeaders
                }
            })

            return fetchResponse
        } else {
            throw [401, 'Unauthorized']
        }
    }
}

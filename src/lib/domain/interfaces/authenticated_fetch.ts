export interface AuthenticatedFetch {
	Fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
}

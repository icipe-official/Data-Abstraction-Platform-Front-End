import type { Domain } from '$lib'

/**
 * Defines the interface for creating, updating, and deleting one metadata-model.
 */
export interface Datum {
	previousDatum?: any

	fetch: Domain.Interfaces.Fetch

	context: string

	authcontextdirectorygroupid?: string

	verboseresponse?: boolean

	currentdirectorygroupid: string

	id?: string

	tags: string[]
	updateTags: (index: number, value: any) => void
	deleteTags: (index: number) => void

	viewAuthorized: boolean
	viewUnauthorized: boolean
	editAuthorized: boolean
	editUnauthorized: boolean
	reset?: () => void

	update?: () => Promise<Domain.Entities.State.Toast>
	delete?: () => Promise<Domain.Entities.State.Toast>

	telemetry?: Domain.Interfaces.ITelemetry
}

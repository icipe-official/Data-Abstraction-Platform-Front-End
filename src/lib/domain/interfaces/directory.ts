import type { Domain } from '$lib'

/**
 * Defines the interface for creating, updating, and deleting one directory-group.
 */
export interface Datum {
	previousDatum?: any

	fetch: Domain.Interfaces.Fetch

	context: string

	authcontextdirectorygroupid?: string

	verboseresponse?: boolean

	currentdirectorygroupid: string

	id?: string

	displayName: string
	displayNameValid?: () => boolean
	displayNameError?: string[]
	updateName: (value: any) => void

	data: any
	dataMetadataModel?: any

	reset?: () => void

	create?: () => Promise<Domain.Entities.State.Toast>
	update?: () => Promise<Domain.Entities.State.Toast>
	delete?: () => Promise<Domain.Entities.State.Toast>

	telemetry?: Domain.Interfaces.ITelemetry
}

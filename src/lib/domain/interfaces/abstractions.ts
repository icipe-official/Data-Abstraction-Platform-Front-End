import type { Domain } from '$lib'

/**
 * Defines the interface for creating, updating, and deleting one abstraction.
 */
export interface Datum {
	previousDatum?: any

	fetch: Domain.Interfaces.Fetch

	telemetry?: Domain.Interfaces.ITelemetry

	context: string

	authcontextdirectorygroupid?: string

	verboseresponse?: boolean

	currentdirectorygroupid: string

	id?: string

	storage_file?: Domain.Entities.StorageFiles.Interface

	completed: boolean

	tags: string[]
	updateTags: (index: number, value: any) => void
	deleteTags: (index: number) => void

	data: any
	dataMetadataModel?: any

	reset?: () => void

	update?: () => Promise<Domain.Entities.State.Toast>
	delete?: () => Promise<Domain.Entities.State.Toast>
}

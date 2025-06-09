import type { Domain } from '$lib'

/**
 * Defines the interface for creating, updating, and deleting one abstraction.
 */
export interface Datum {
	previousDatum?: any

	id?: string

    storage_file?: Domain.Entities.StorageFiles.Interface

	completed: boolean

	tags: string[]
	updateTags: (index: number, value: any) => void
	deleteTags: (index: number) => void

	data: any
	dataMetadataModel?: any

	reset?: () => void

	update?: (
		authFetch: Domain.Interfaces.AuthenticatedFetch,
		directoryGroupID: string,
		opts?: {
			componentName?: string
			telemetry?: Domain.Interfaces.ITelemetry
			authContextDirectoryGroupID?: string
			verboseResponse?: boolean
		}
	) => Promise<Domain.Entities.State.Toast>
	delete?: (
		authFetch: Domain.Interfaces.AuthenticatedFetch,
		directoryGroupID: string,
		opts?: {
			componentName?: string
			telemetry?: Domain.Interfaces.ITelemetry
			authContextDirectoryGroupID?: string
			verboseResponse?: boolean
		}
	) => Promise<Domain.Entities.State.Toast>

	telemetry?: Domain.Interfaces.ITelemetry
}

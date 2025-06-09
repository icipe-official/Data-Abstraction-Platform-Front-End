import { Domain, MetadataModel } from '$lib'

/**
 * Defines the interface for creating, updating, and deleting one metadata-model.
 */
export interface Datum {
	previousDatum?: any

	directory_group_id?: string

	metadata_models_id?: string

	abstractionReviewQuorum: number
	abstractionReviewQuorumValid?: () => boolean
	abstractionReviewQuorumError?: string[]
	updateAbstractionReviewQuorum: (value: any) => void

	description: string
	descriptionValid?: () => boolean
	descriptionError?: string[]
	updateDescription: (value: any) => void

	viewAuthorized: boolean
	viewUnauthorized: boolean

	reset?: () => void

	create?: (
		authFetch: Domain.Interfaces.AuthenticatedFetch,
		directoryGroupID: string,
		opts?: {
			componentName?: string
			telemetry?: Domain.Interfaces.ITelemetry
			authContextDirectoryGroupID?: string
			verboseResponse?: boolean
		}
	) => Promise<Domain.Entities.State.Toast>
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

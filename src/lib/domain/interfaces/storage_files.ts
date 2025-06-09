import type { Domain } from "$lib"

/**
 * Defines the interface for creating, updating, and deleting one metadata-model.
 */
export interface Datum {
    previousDatum?: any

    id?: string

    tags: string[]
    updateTags: (index: number, value: any) => void
    deleteTags: (index: number) => void

    viewAuthorized: boolean
    viewUnauthorized: boolean
    editAuthorized: boolean
    editUnauthorized: boolean
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
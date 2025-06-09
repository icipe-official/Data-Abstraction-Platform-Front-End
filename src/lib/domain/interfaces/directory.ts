import type { Domain } from "$lib"

/**
 * Defines the interface for creating, updating, and deleting one directory-group.
 */
export interface Datum {
    previousDatum?: any

    id?: string

    displayName: string
    displayNameValid?: () => boolean
    displayNameError?: string[]
    updateName: (value: any) => void

    data: any
    dataMetadataModel?: any

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
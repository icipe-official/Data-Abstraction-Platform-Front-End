import type { Entities } from '..'

/**
 * Provides an interface for managing the following telemetry information within the application.
 * - Logs -
 * - Metrics -
 * - Traces -
 */
export interface ITelemetry {
	/**
	 * Function for logging information.
	 *
	 * @param context - Could be section within the application.
	 * @param logTrace - Include trace in log.
	 * @param level - Level of log.
	 * @param msg - message to log.
	 * @param args - additional data to log in key-value form e.g. `"key":[value]`.
	 * @returns
	 */
	Log: (context: string, logTrace: boolean, level: Entities.Telemetry.LogLevel | number, msg: string, ...args: any) => void
}

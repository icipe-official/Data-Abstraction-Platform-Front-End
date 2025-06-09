/**
 * Defines the fixed range for different log levels.
 *
 * Use additions and subtractions to manipulate the log level within a range.
 *
 * Example:
 * * `LogLevel.DEBUG+2`.
 *
 * Log ranges as follows:
 * - DEBUG: -4 to -1
 * - INFO: 0 to 3
 * - WARNING: 4 to 7
 * - ERROR: 8
 */
export enum LogLevel {
	DEBUG = -4,
	INFO = 0,
	WARNING = 4,
	ERROR = 8
}

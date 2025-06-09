import { Domain } from '$lib'

export class Telemetry implements Domain.Interfaces.ITelemetry {
	private logLevel: number = 0

	constructor(logLevel?: number) {
		if (logLevel) {
			this.logLevel = logLevel
		}
	}

	Log(context: string, trace: boolean, level: Domain.Entities.Telemetry.LogLevel | number, msg: string, ...args: any) {
		if (level < this.logLevel) {
			return
		}

		switch (true) {
			case level >= Domain.Entities.Telemetry.LogLevel.DEBUG && level < Domain.Entities.Telemetry.LogLevel.INFO:
				console.debug('DEBUG', '|', context, '|', msg, '|', ...args)
				if (trace) {
					console.trace('DEBUG', context)
				}
				break
			case level >= Domain.Entities.Telemetry.LogLevel.INFO && level < Domain.Entities.Telemetry.LogLevel.WARNING:
				console.info('INFO', '|', context, '|', msg, '|', ...args)
				if (trace) {
					console.trace('INFO', context)
				}
				break
			case level >= Domain.Entities.Telemetry.LogLevel.WARNING && level < Domain.Entities.Telemetry.LogLevel.ERROR:
				console.warn('WARNING', '|', context, '|', msg, '|', ...args)
				if (trace) {
					console.trace('WARNING', context)
				}
				break
			case level === Domain.Entities.Telemetry.LogLevel.ERROR:
				console.error('ERROR', '|', context, '|', msg, '|', ...args)
				if (trace) {
					console.trace('ERROR', context)
				}
				break
		}
	}
}
import { env } from '$env/dynamic/public'

export const BasePath = (() => {
	let basePath = env.PUBLIC_BASE_PATH
	if (basePath) {
		if (!basePath.endsWith('/')) {
			basePath += '/'
		}

		return basePath
	}

	return '/'
})()

export function GetLogLevel() {
	if (Number.isNaN(env.PUBLIC_TELEMETRY_LOG_LEVEL)) {
		return 0
	}

	return Number(env.PUBLIC_TELEMETRY_LOG_LEVEL)
}

export function GetLocationPath(path: string) {
	return `${BasePath}${path}`
}

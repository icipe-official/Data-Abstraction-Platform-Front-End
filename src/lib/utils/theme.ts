import { Theme } from '$lib/domain/entities'

export const Themes = Object.values(Theme)

/**
 *
 * @param value Theme Value to check.
 * @returns true if the {@linkcode value} is a theme supported by the application.
 */
export const IsThemeSupported = (value: any) => Themes.includes(value)

/**
 *
 * @param currentColor
 * @returns next color in the color pallete using {@linkcode Theme.Color.PRIMARY}->{@linkcode Theme.Color.SECONDARY}->{@linkcode Theme.Color.ACCENT} sequence.
 */
export function GetNextColorA(currentColor: Theme.Color) {
	switch (currentColor) {
		case Theme.Color.PRIMARY:
			return Theme.Color.SECONDARY
		case Theme.Color.SECONDARY:
			return Theme.Color.ACCENT
		case Theme.Color.ACCENT:
			return Theme.Color.PRIMARY
		default:
			return Theme.Color.PRIMARY
	}
}

/**
 *
 * @param currentColor
 * @returns next color in the color pallete using {@linkcode Theme.Color.PRIMARY}->{@linkcode Theme.Color.SECONDARY}->{@linkcode Theme.Color.NEUTRAL} sequence.
 */
export function GetNextColorN(currentColor: Theme.Color) {
	switch (currentColor) {
		case Theme.Color.PRIMARY:
			return Theme.Color.SECONDARY
		case Theme.Color.SECONDARY:
			return Theme.Color.NEUTRAL
		case Theme.Color.NEUTRAL:
			return Theme.Color.PRIMARY
		default:
			return Theme.Color.PRIMARY
	}
}

export function GetColor(currentColor: Theme.Color) {
	switch (currentColor) {
		case Theme.Color.PRIMARY:
			return '--color-primary'
		case Theme.Color.SECONDARY:
			return '--color-secondary'
		case Theme.Color.ACCENT:
			return '--color-accent'
		case Theme.Color.NEUTRAL:
			return '--color-primary'
		case Theme.Color.ERROR:
			return '--color-error'
		case Theme.Color.SUCCESS:
			return '--color-success'
		case Theme.Color.INFO:
			return '--color-info'
		case Theme.Color.WARNING:
			return '--color-warning'
		default:
			return '--color-primary'
	}
}

export function GetColorContent(currentColor: Theme.Color) {
	switch (currentColor) {
		case Theme.Color.PRIMARY:
			return '--color-primary-content'
		case Theme.Color.SECONDARY:
			return '--color-secondary-content'
		case Theme.Color.ACCENT:
			return '--color-accent-content'
		case Theme.Color.NEUTRAL:
			return '--color-primary-content'
		case Theme.Color.ERROR:
			return '--color-error-content'
		case Theme.Color.SUCCESS:
			return '--color-success-content'
		case Theme.Color.INFO:
			return '--color-info-content'
		case Theme.Color.WARNING:
			return '--color-warning-content'
		default:
			return '--color-primary-content'
	}
}

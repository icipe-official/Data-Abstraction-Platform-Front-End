export type DateTime = number | undefined

export enum Tab {
	YEAR = 'YEAR',
	MONTH = 'MONTH',
	DAY = 'DAY',
	TIME = 'TIME'
}

export enum DateTimeFormat {
	YYYYMMDDHHMM = 'yyyy-mm-dd hh:mm',
	YYYYMMDD = 'yyyy-mm-dd',
	YYYYMM = 'yyyy-mm',
	HHMM = 'hh:mm',
	YYYY = 'yyyy',
	MM = 'mm'
}

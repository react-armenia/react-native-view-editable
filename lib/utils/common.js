// @flow

export function generateArray(range: number): Array<number> {
	return Array(range)
		.join(',')
		.split(',')
		.map((d, i) => i);
}

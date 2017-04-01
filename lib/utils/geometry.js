// @flow

import type { Touch } from '../TypeDefinitions';

type CenterCoords = {
	x: number,
	y: number
};

export function pow2abs(a: number, b: number): number {
	return Math.pow(Math.abs(a - b), 2);
}

export function centerTouches(touches: Array<Touch>): CenterCoords {
	const a = touches[0];
	const b = touches[1];
	return {
		x: (a.pageX + b.pageX) / 2,
		y: (a.pageY + b.pageY) / 2,
	};
}

export function numberToDegree(ang: number): string {
	return `${ang}deg`;
}

export function degreeToNumber(degree: string): number {
	return +degree.replace(/deg/ig, '');
}

export function distanceBetweenTouches(touches: Array<Touch>): number {
	const a = touches[0];
	const b = touches[1];

	return Math.sqrt(
    pow2abs(a.pageX, b.pageX) +
    pow2abs(a.pageY, b.pageY),
  2);
}

export function toDeg(rad: number): number {
	return rad * 180 / Math.PI;
}

export function angle(touches: Array<Touch>): number {
	const a = touches[0];
	const b = touches[1];
	let deg = toDeg(Math.atan2(b.pageY - a.pageY, b.pageX - a.pageX));
	if (deg < 0) {
		deg += 360;
	}
	return deg;
}

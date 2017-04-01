// @flow

import React from 'react';
import {
	pow2abs,
	numberToDegree,
	degreeToNumber,
	distanceBetweenTouches,
	centerTouches,
	toDeg,
	angle
} from '../lib/utils';
describe('Geometry calculations', () => {
	const touches = [
		{ pageX: 10, pageY: 5, locationX: 0, locationY: 0 },
		{ pageX: 4, pageY: 5, locationX: 0, locationY: 0 }
	];

	it('should pow absolute values of two numbers', () => {
		const a = -2;
		const b = 5;
		expect(pow2abs(2, 5)).toBe(9);
	});
	it('Return center of two coordinates', () => {
		const result = {
			x: 7,
			y: 5
		};
		expect(centerTouches(touches)).toEqual(result)
	});
	it('should convert number to degree string', () => {
		const number = 10;
		const result = `${number}deg`;
		expect(numberToDegree(number)).toBe(result);
	});
	it('should convert degree string to number', () => {
		const degree = '10deg';
		const result = 10;
		expect(degreeToNumber(degree)).toBe(result);
	});
	it('should return distance of two points(touches)', () => {
		const result = 6;
		expect(distanceBetweenTouches(touches)).toBe(result);
	});
	it('should convert number to degree', () => {
		const angle = 90;
		const result = angle * 180 / Math.PI
		expect(toDeg(angle)).toBe(result);
	});
	it('should return positive angle of two points', () => {
		const result = 180;
		expect(angle(touches)).toBe(result);
	});
});

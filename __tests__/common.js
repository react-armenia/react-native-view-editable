import React from 'react';
import { generateArray } from '../lib/utils';

describe('Common utils', () => {
	it('should generate array for given range', () => {
		const arr = generateArray(360);
		expect(arr.length).toBe(360);
		expect(arr).toMatchSnapshot();
	});
});

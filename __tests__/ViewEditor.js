// @flow
import 'react-native';
import React from 'react';
import { View, Text } from 'react-native';
import renderer from 'react-test-renderer';
import { ViewEditor } from '../lib';
import util from 'util';

function getValueForKey(arr, key) {
	return (arr.find((transform) => transform.hasOwnProperty(key)) || {})[key];
}

describe('ViewEditor Component', () => {
	let component = null;
	const onMoveCallback = jest.fn();

	beforeEach(() => {
		component = renderer.create(
			<ViewEditor
				minScale={1}
				maxScale={20}
				onMove={onMoveCallback}
			>
				<View>
					<Text>Hello World</Text>
				</View>
			</ViewEditor>
		);
	});
	it('should render tree', () => {
		// $FlowFixMe
		const componentJSON = component.toJSON();
		expect(componentJSON).toMatchSnapshot();
	});
	it('should contain transform prop', () => {
		// $FlowFixMe
		const componentJSON = component.toJSON();
		expect(componentJSON.props.style.transform).toBeInstanceOf(Array);
	});
	it('should add translateX and translateY props correctly', () => {
		// $FlowFixMe
		const componentJSON = component.toJSON();
		const translateX = getValueForKey(componentJSON.props.style.transform, 'translateX');
		const translateY = getValueForKey(componentJSON.props.style.transform, 'translateY');

		expect(translateX).toBeDefined();
		expect(translateY).toBeDefined();

		expect(translateX).toBe(0);
		expect(translateY).toBe(0);
	});
	it('should add scale and rotate angle correctly', () => {
		// $FlowFixMe
		const componentJSON = component.toJSON();
		const rotate = getValueForKey(componentJSON.props.style.transform, 'rotate');
		const scale = getValueForKey(componentJSON.props.style.transform, 'scale');

		expect(rotate).toBeDefined();
		expect(scale).toBeDefined();

		// expect(rotate).toBe('0deg');
		expect(scale).toBe(1);
	});
	it('should call _getTransforms function and return transform values', () => {
		// $FlowFixMe
		const instance = component.getInstance();
		expect(instance._getTransforms()).toBeInstanceOf(Object);
		expect(instance._getTransforms().transform.length).toBe(4);
	});
	it('should call onMove prop on panning', () => {
		// $FlowFixMe
		const instance = component.getInstance();
		const fakeEvent = {
			nativeEvent: {
				changedTouches: 0,
				identifier: 0,
				locationX: 0,
				locationY: 0,
				pageX: 0,
				pageY: 0,
				target: 0,
				timestamp: 0,
				touches: {
					pageX: 1,
					pageY: 1,
					locationX: 1,
					locationY: 1
				}
			}
		};
		const fakeGestureState = {
			numberActiveTouches: 1,
			stateID: 1,
			moveX: 1,
			moveY: 1,
			x0: 1,
			y0: 1,
			dx: 1,
			dy: 1,
			vx: 1,
			vy: 1
		};
		instance._handlePanResponderMove(fakeEvent, fakeGestureState);
		expect(onMoveCallback).toHaveBeenCalled();
	});
});

// @flow

export type AnimatedWatchValue<T> = {
	value: T
};

export type LayoutEvent = {
	nativeEvent: {
		target: number,
		layout: {
			width: number,
			height: number,
			x: number,
			y: number
		}
	}
};

export type Touch = {
	pageX: number,
	pageY: number,
	locationX: number,
	locationY: number
};

export type TransformTranslateLayout = [
	{ translateX: AnimatedValue<number> },
	{ translateY: AnimatedValue<number> }
];

export type Event = {
	nativeEvent: {
		changedTouches: number,
		identifier: number,
		locationX: number,
		locationY: number,
		pageX: number,
		pageY: number,
		target: number,
		timestamp: number,
		touches: Array<Touch>
	}
};
export type GestureState = {
	numberActiveTouches: number,
	stateID: number,
	moveX: number,
	moveY: number,
	x0: number,
	y0: number,
	dx: number,
	dy: number,
	vx: number,
	vy: number
};

export type PanResponderDef = {
	panHandlers: {
		onStartShouldSetPanResponder: ?(e: Event, g: GestureState) => boolean,
		onMoveShouldSetPanResponder: ?(e: Event, g: GestureState) => boolean,
		onPanResponderGrant: (e: Event, g: GestureState) => void,
		onPanResponderMove: (e: Event, g: GestureState) => void,
		onPanResponderRelease: (e: Event, g: GestureState) => void,
		onPanResponderTerminate: (e: Event, g: GestureState) => void,
	}
};

type InterpolateOptions<I, O> = {
	inputRange: Array<I>,
	outputRange: Array<O>,
	extrapolate?: string
};

export type AnimatedValue<T> = {
	__value: number,
	setValue: (value: T) => void,
	setOffset: (value: T) => void,
	flattenOffset: () => void,
	addListener: (cb: (value: AnimatedWatchValue<T>) => void) => number,
	removeListener: (id: number) => void,
	removeAllListeners: () => void,
	interpolate: (obj: InterpolateOptions<T, any>) => AnimatedValue<any>
};
export type AnimatedValueXY = {
	x: AnimatedValue<number>,
	y: AnimatedValue<number>,
	setValue: (values: { x: number, y: number }) => void,
	getLayout: () => { top: number, left: number },
	setOffset: (values: { x: number, y: number }) => void,
	flattenOffset: () => void,
	removeAllListeners: () => void,
	getTranslateTransform: () => TransformTranslateLayout
};

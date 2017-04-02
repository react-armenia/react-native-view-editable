// @flow

import React, { PureComponent, PropTypes, Children } from 'react';
// $FlowFixMe
import { View, PanResponder, Animated, Easing } from 'react-native';

import type {
	Event,
	LayoutEvent,
	GestureState,
	AnimatedValue,
	AnimatedValueXY,
	PanResponderDef,
	AnimatedWatchValue
} from '../TypeDefinitions';

import {
	centerTouches,
	angle,
	generateArray,
	distanceBetweenTouches
} from '../utils';

type Container = {
	width: ?number,
	height: ?number,
};
type Props = {
	children: React.Element<*>,
	panning: boolean,
	scaleBounds: {
		min: number,
		max: number,
	},
	allowScale: boolean,
	allowRotate: boolean,
	onMove: ?(e: Event, g: GestureState) => void,
	onMoveEnd: ?(e: Event, g: GestureState) => void
};
type State = {
	pan: AnimatedValueXY,
	animating: boolean,
	scale: AnimatedValue<number>,
	rotate: AnimatedValue<number>
};
type TransformValues = {
	x: number,
	y: number,
	scale: number,
	rotate: number
}

type SavedTransformValues = {
	scale: number,
	rotate: number,
	center: ?{
		x: number,
		y: number
	},
	distance: number
};

type Transforms = {
	transform: Array<Object>
};

type AnimatedProperties = {
	pan: AnimatedValueXY,
	scale: AnimatedValue<number>,
	rotate: AnimatedValue<number>
};

class ViewEditor extends PureComponent {
	static propTypes = {
		children: PropTypes.element.isRequired,
		panning: PropTypes.bool,
		onMove: PropTypes.func,
		onMoveEnd: PropTypes.func,
		allowScale: PropTypes.bool,
		allowRotate: PropTypes.bool,
		scaleBounds: PropTypes.shape({
			min: PropTypes.number.isRequired,
			max: PropTypes.number.isRequired
		}),
	};
	static defaultProps = {
		panning: true,
		minScale: 1,
		maxScale: 10,
		allowRotate: true,
		allowScale: true,
		scaleBounds: {
			min: 1,
			max: 10
		},
	};

	// Types
	props: Props;
	state: State;
	transformValues: TransformValues;
	savedValuesBeforeMove: SavedTransformValues;
	panResponder: PanResponderDef;
	_multiTouch: boolean;
	_container: Container;

	constructor(props: Props, context: any) {
		super(props, context);

		this.state = {
			animating: false,
			pan: new Animated.ValueXY(),
			scale: new Animated.Value(1),
			rotate: new Animated.Value(0)
		};
		this.transformValues = {
			x: 0,
			y: 0,
			rotate: 0,
			scale: 1
		};
		this.savedValuesBeforeMove = {
			rotate: 0,
			scale: 1,
			center: null,
			distance: 0
		};
		// Used for multitouch
		this._multiTouch = false;
		this._container = {
			width: null,
			height: null
		};

		this.panResponder = PanResponder.create({
			onStartShouldSetPanResponder: () => !this.state.animating && this.props.panning,
			onMoveShouldSetPanResponder: () => !this.state.animating && this.props.panning,
			onPanResponderGrant: this._handlePanResponderGrant,
			onPanResponderMove: this._handlePanResponderMove,
			onPanResponderRelease: this._handlePanResponderEnd,
			onPanResponderTerminate: this._handlePanResponderEnd,
		});
	}

	componentWillMount() {
		this.state.pan.x.addListener((res: AnimatedWatchValue<number>) => {
			this.transformValues.x = res.value;
		});
		this.state.pan.y.addListener((res: AnimatedWatchValue<number>) => {
			this.transformValues.y = res.value;
		});
		this.state.rotate.addListener((res: AnimatedWatchValue<number>) => {
			this.transformValues.rotate = res.value;
		});
		this.state.scale.addListener((res: AnimatedWatchValue<number>) => {
			this.transformValues.scale = res.value;
		});
	}

	componentWillUnmount() {
		this.state.pan.removeAllListeners();
		this.state.scale.removeAllListeners();
		this.state.rotate.removeAllListeners();
	}

	_saveValuesIfNeeded = (event: Event): void => {
		this.savedValuesBeforeMove.distance = this.savedValuesBeforeMove.distance === 0
			? distanceBetweenTouches(event.nativeEvent.touches)
			: this.savedValuesBeforeMove.distance;

		this.savedValuesBeforeMove.center = this.savedValuesBeforeMove.center === null
			? centerTouches(event.nativeEvent.touches)
			: this.savedValuesBeforeMove.center;

		this.savedValuesBeforeMove.rotate = this.savedValuesBeforeMove.rotate === 0
			? angle(event.nativeEvent.touches)
			: this.savedValuesBeforeMove.rotate;
	}

	_reset = (timing: number, cb?: () => void): void => {
		Animated.parallel([
			Animated.timing(this.state.pan, {
				toValue: { x: 0, y: 0 },
				easing: Easing.linear,
				duration: timing
			}),
			Animated.timing(this.state.scale, {
				toValue: 1,
				easing: Easing.linear,
				duration: timing
			}),
			Animated.timing(this.state.rotate, {
				toValue: 0,
				easing: Easing.linear,
				duration: timing
			}),
		]).start(() => {
			this.transformValues = {
				x: 0,
				y: 0,
				rotate: 0,
				scale: 1
			};
			this.state.scale.flattenOffset();
			this.state.rotate.flattenOffset();
			this.state.pan.flattenOffset();
			this.savedValuesBeforeMove = {
				rotate: 0,
				scale: 1,
				center: null,
				distance: 0
			};
			if (typeof cb === 'function') {
				cb();
			}
		});
	}

	reset(timing?: number = 200) {
		this._reset(timing / 2, () => this._reset(timing / 2));
	}

	_onLayout(e: LayoutEvent): void {
		this._container = {
			width: e.nativeEvent.layout.width,
			height: e.nativeEvent.layout.height
		};
	}

	_getAnimatedProperties = (): AnimatedProperties => {
		const { scale, rotate, pan } = this.state;
		return { pan, scale, rotate };
	}

	_handlePanResponderGrant = (): void => {
		// TODO: highlight view
	}

	_updateTransformValues = (): void => {
		this.state.pan.flattenOffset();
		// this.state.pan.setValue({ x: 0, y: 0 });
		this.state.scale.flattenOffset();
		this.state.scale.flattenOffset();
	}

	_isScaleCompatable = (scale: number): boolean => {
		const { scaleBounds } = this.props;
		return (scale >= scaleBounds.min && scale <= scaleBounds.max);
		// return (scale < scaleBounds.min || scale > scaleBounds.max);
	}

	_handlePanResponderMove = (event: Event, gestureState: GestureState): void => {
		if (typeof this.props.onMove === 'function') {
			this.props.onMove(event, gestureState);
		}
		const {
			allowScale,
			allowRotate,
		} = this.props;
		const { numberActiveTouches } = gestureState;
		if (numberActiveTouches > 1) {
			this._multiTouch = true;
		}
		if (numberActiveTouches === 1) {
			Animated.event([
				null,
				{ dx: this.state.pan.x, dy: this.state.pan.y }
			])(event, gestureState);
			return;
		}
		this._saveValuesIfNeeded(event);

		const {
			rotate: prevAngle,
			distance: prevDistance
		} = this.savedValuesBeforeMove;

		if (allowRotate) {
			const angleToRotate = angle(event.nativeEvent.touches) - prevAngle;

			const slowDownRotation = 1;
			const destAngle = (parseFloat(angleToRotate) - prevAngle) / slowDownRotation;
			// Set rotation angle
			this.state.rotate.setValue(destAngle);
		}

		if (allowScale) {
			// Zoom calculation
			const currentDistance = distanceBetweenTouches(event.nativeEvent.touches);
			const newScale = ((currentDistance - prevDistance)) / 10;

			const scaleCalc = this.transformValues.scale + newScale;
			if (!this._isScaleCompatable(scaleCalc)) {
				return;
			}
			this.state.scale.setValue(scaleCalc);
		}
	}


	_handlePanResponderEnd = (event: Event, gestureState: GestureState): void => {
		this._updateTransformValues();
		if (typeof this.props.onMoveEnd === 'function') {
			this.props.onMoveEnd(event, gestureState);
		}

		if (!this._multiTouch) {
			return;
		}
		this.savedValuesBeforeMove.scale = this.transformValues.scale;
		this.savedValuesBeforeMove.rotate = this.transformValues.rotate;
		this.savedValuesBeforeMove.distance = 0;
		this._multiTouch = false;
	}

	_getTransforms = (): Transforms => {
		const { scale, rotate, pan } = this.state;
		const translates = pan.getTranslateTransform();
		const generateInptuts = generateArray(360);

		const generateOutput = generateInptuts.map((v) => `${v}deg`);
		const rotateInterpolated = rotate.interpolate({
			inputRange: [...generateInptuts],
			outputRange: [...generateOutput]
		});
		const animatedStyles = {
			transform: [
				...translates,
				{ scale },
				{ rotate: rotateInterpolated }
			]
		};

		return animatedStyles;
	}

	render(): React.Element<*> {
		const { children } = this.props;
		const rootStyles = {
			...this._getTransforms()
		};
		return (
			<Animated.View
				style={rootStyles}
				onLayout={this._onLayout}
				{...this.panResponder.panHandlers}
			>
				{Children.only(children)}
			</Animated.View>
		);
	}
}

export default ViewEditor;

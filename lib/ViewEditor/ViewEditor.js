// @flow

import React, { PureComponent, PropTypes, Children } from 'react';
// $FlowFixMe
import { View, PanResponder, Animated } from 'react-native';

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
	degreeToNumber,
	distanceBetweenTouches
} from '../utils';

type Container = {
	width: ?number,
	height: ?number,
};
type Props = {
	children: React.Element<*>,
	panning: boolean,
	minScale: number,
	maxScale: number,
	onMove: ?(e: Event, g: GestureState) => any
};
type State = {
	pan: AnimatedValueXY,
	animating: boolean,
	scale: AnimatedValue<number>,
	rotate: AnimatedValue<string>
};
type TransformValues = {
	x: number,
	y: number,
	scale: number,
	rotate: string
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
	rotate: AnimatedValue<string>
};

class ViewEditor extends PureComponent {
	static propTypes = {
		children: PropTypes.element.isRequired,
		panning: PropTypes.bool,
		minScale: PropTypes.number,
		onMove: PropTypes.func,
		maxScale: PropTypes.number,
	};
	static defaultProps = {
		panning: true,
		minScale: 1,
		maxScale: 10,
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
			rotate: new Animated.Value('0deg')
		};
		this.transformValues = {
			x: 0,
			y: 0,
			rotate: '0deg',
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
		this.state.rotate.addListener((res: AnimatedWatchValue<string>) => {
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

	_updateTransformValues = (transformValues: TransformValues): void => {
		const { x, y } = transformValues;
		this.state.pan.setOffset({ x, y });
		this.state.pan.setValue({ x: 0, y: 0 });
		this.state.scale.setOffset(transformValues.scale);
		this.state.scale.setValue(0);
	}

	_handlePanResponderMove = (event: Event, gestureState: GestureState): void => {
		if (typeof this.props.onMove === 'function') {
			this.props.onMove(event, gestureState);
		}
		const { minScale, maxScale } = this.props;
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
		const angleToRotate = angle(event.nativeEvent.touches) - prevAngle;

		const slowDownRotation = 10; // 10x
		// Set rotation angle
		this.state.rotate.setValue(
			`${(parseFloat(angleToRotate) - prevAngle) / slowDownRotation}deg`
		);

		// Zoom calculation
		const currentDistance = distanceBetweenTouches(event.nativeEvent.touches);
		const newScale = ((currentDistance - prevDistance)) / 10;

		const scaleCalc = this.transformValues.scale + newScale;
		if (scaleCalc < minScale || scaleCalc > maxScale) {
			return;
		}

		this.state.scale.setValue(newScale);
	}


	_handlePanResponderEnd = (): void => {
		this._updateTransformValues(this.transformValues);

		if (!this._multiTouch) {
			return;
		}
		this.savedValuesBeforeMove.scale = this.transformValues.scale;
		this.savedValuesBeforeMove.rotate = degreeToNumber(this.transformValues.rotate);
		this.savedValuesBeforeMove.distance = 0;
		this._multiTouch = false;
	}

	_getTransforms = (): Transforms => {
		const { scale, rotate, pan } = this.state;
		const translates = pan.getTranslateTransform();
		const animatedStyles = {
			transform: [
				...translates,
				{ scale },
				{ rotate }
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

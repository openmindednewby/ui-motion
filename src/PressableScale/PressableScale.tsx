/**
 * PressableScale — a `Pressable` that scales down on press-in and springs back on
 * press-out, giving tactile feedback without the flat opacity dip of a bare
 * `activeOpacity`. Built to replace `activeOpacity` usage in `@dloizides/ui-buttons`.
 *
 * It forwards EVERY `Pressable` prop (onPress, accessibility*, disabled, hitSlop,
 * …) so it is a drop-in wrapper; the scale is applied to an inner `Animated.View`
 * so the outer `Pressable` keeps its full press/a11y behaviour. Under reduced-motion
 * the scale is suppressed entirely (the element stays at scale 1).
 */
import React, { useCallback, useRef } from 'react';

import {
  Animated,
  type GestureResponderEvent,
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useReducedMotion } from '@dloizides/rn-web-hooks';

import { motionDurations, motionEasings } from '../motionTokens';
import { shouldUseNativeDriver } from '../motionUtils';
import { DEFAULT_PRESSED_SCALE, MOTION_TEST_IDS } from '../constants';

export interface PressableScaleProps extends PressableProps {
  /** Scale to shrink to on press-in. Default 0.96. */
  pressedScale?: number;
  /** Style applied to the inner animated wrapper that carries the scale transform. */
  innerStyle?: StyleProp<ViewStyle>;
}

export const PressableScale = ({
  pressedScale = DEFAULT_PRESSED_SCALE,
  innerStyle,
  onPressIn,
  onPressOut,
  children,
  testID = MOTION_TEST_IDS.pressableScale,
  ...rest
}: PressableScaleProps): React.ReactElement => {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = useCallback(
    (toValue: number): void => {
      if (reduced) {
        scale.setValue(1);
        return;
      }
      Animated.timing(scale, {
        toValue,
        duration: motionDurations.fast,
        easing: motionEasings.standard,
        useNativeDriver: shouldUseNativeDriver(),
      }).start();
    },
    [reduced, scale],
  );

  const handlePressIn = useCallback(
    (event: GestureResponderEvent): void => {
      animateTo(pressedScale);
      onPressIn?.(event);
    },
    [animateTo, pressedScale, onPressIn],
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent): void => {
      animateTo(1);
      onPressOut?.(event);
    },
    [animateTo, onPressOut],
  );

  const renderInner = (state: PressableStateCallbackType): React.ReactNode => (
    <Animated.View style={[{ transform: [{ scale }] }, innerStyle]}>
      {typeof children === 'function' ? children(state) : children}
    </Animated.View>
  );

  return (
    <Pressable {...rest} testID={testID} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      {renderInner}
    </Pressable>
  );
};

export default PressableScale;

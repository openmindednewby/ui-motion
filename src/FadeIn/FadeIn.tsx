/**
 * FadeIn — fades its children in (with a small upward translate) once, on mount.
 * The lightweight, mount-only sibling of {@link useEnterExit} (which handles the
 * full enter/exit lifecycle). Under reduced-motion it renders its children at rest
 * immediately — no fade, no translate.
 */
import React, { useEffect, useMemo, useRef } from 'react';

import { Animated, type StyleProp, type ViewStyle } from 'react-native';

import { useReducedMotion } from '@dloizides/rn-web-hooks';

import { motionDurations, motionEasings } from '../motionTokens';
import { shouldUseNativeDriver } from '../motionUtils';
import { DEFAULT_FADE_TRANSLATE_Y, MOTION_TEST_IDS } from '../constants';

export interface FadeInProps {
  children: React.ReactNode;
  /** Fade duration in ms. Defaults to the `base` motion duration (200). */
  duration?: number;
  /** Delay before the fade starts, in ms. Default 0. */
  delay?: number;
  /** Enter translate-Y offset (px). `0` disables the translate. Default 8. */
  translateY?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const FadeIn = ({
  children,
  duration = motionDurations.base,
  delay = 0,
  translateY = DEFAULT_FADE_TRANSLATE_Y,
  style,
  testID = MOTION_TEST_IDS.fadeIn,
}: FadeInProps): React.ReactElement => {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) {
      progress.setValue(1);
      return undefined;
    }
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: motionEasings.decelerate,
      useNativeDriver: shouldUseNativeDriver(),
    });
    anim.start();
    return () => anim.stop();
  }, [reduced, duration, delay, progress]);

  const animatedStyle = useMemo((): Animated.WithAnimatedObject<ViewStyle> => {
    if (translateY === 0) {
      return { opacity: progress };
    }
    return {
      opacity: progress,
      transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [translateY, 0] }) }],
    };
  }, [progress, translateY]);

  return (
    <Animated.View style={[animatedStyle, style]} testID={testID}>
      {children}
    </Animated.View>
  );
};

export default FadeIn;

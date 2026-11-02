import React, { useLayoutEffect, useRef } from 'react';

import { Animated, StyleSheet, useWindowDimensions, View, type EasingFunction } from 'react-native';

import { useReducedMotion } from '@dloizides/rn-web-hooks';

import { MOTION_TEST_IDS } from '../constants';
import { motionDurations, motionEasings } from '../motionTokens';
import { shouldUseNativeDriver } from '../motionUtils';

export interface ScreenTransitionProps {
  children: React.ReactNode;
  /** A new value slides the content in from the right; the first render does not animate. */
  transitionKey: string;
  /** Slide duration in ms. Defaults to the `slow` motion duration. */
  duration?: number;
  /** Slide easing. Defaults to the `decelerate` motion curve. */
  easing?: EasingFunction;
  testID?: string;
}

const styles = StyleSheet.create({
  clip: { flex: 1, overflow: 'hidden' },
  fill: { flex: 1 },
});

/** Slides content in by one window width when `transitionKey` changes; reduced motion cuts straight to it. */
export const ScreenTransition = ({
  children,
  transitionKey,
  duration = motionDurations.slow,
  easing = motionEasings.decelerate,
  testID = MOTION_TEST_IDS.screenTransition,
}: ScreenTransitionProps): React.ReactElement => {
  const reduced = useReducedMotion();
  const { width } = useWindowDimensions();
  const offset = useRef(new Animated.Value(0)).current;
  const lastKey = useRef(transitionKey);
  const slide = useRef({ duration, easing, width });
  slide.current = { duration, easing, width };

  useLayoutEffect(() => {
    if (lastKey.current === transitionKey) return undefined;
    lastKey.current = transitionKey;
    if (reduced) return undefined;
    offset.setValue(slide.current.width);
    const run = Animated.timing(offset, {
      toValue: 0,
      duration: slide.current.duration,
      easing: slide.current.easing,
      useNativeDriver: shouldUseNativeDriver(),
    });
    run.start();
    return () => {
      run.stop();
      offset.setValue(0);
    };
  }, [offset, reduced, transitionKey]);

  return (
    <View style={styles.clip}>
      <Animated.View style={[styles.fill, { transform: [{ translateX: offset }] }]} testID={testID}>
        {children}
      </Animated.View>
    </View>
  );
};

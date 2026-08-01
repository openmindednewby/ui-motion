/**
 * Skeleton — a rounded placeholder block with a highlight band that sweeps across
 * it, upgrading the opacity-pulse skeleton in `@dloizides/ui-feedback` to a moving
 * shimmer (a stronger "content is loading" signal).
 *
 * The block measures its own pixel width via `onLayout`, then loops a highlight
 * `Animated.View` from just off the left edge to just off the right edge (transform
 * translateX — native-drivable on native, JS driver on web). Under reduced-motion
 * the sweep is suppressed and a static block is shown, so it never animates against
 * the user's OS preference.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Animated,
  Easing,
  type LayoutChangeEvent,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';

import { useReducedMotion } from '@dloizides/rn-web-hooks';

import { shouldUseNativeDriver, shimmerRange } from '../motionUtils';
import { DEFAULT_SKELETON_DURATION_MS, MOTION_TEST_IDS } from '../constants';

const DEFAULT_HEIGHT = 16;
const DEFAULT_BORDER_RADIUS = 4;
const DEFAULT_BG = 'rgba(0, 0, 0, 0.08)';
const DEFAULT_HIGHLIGHT = 'rgba(255, 255, 255, 0.35)';
const HIGHLIGHT_WIDTH_RATIO = 0.4;

const styles = StyleSheet.create({
  block: {
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
});

export interface SkeletonProps {
  /** Block width. Number (px) or percentage string. Default '100%'. */
  width?: number | string;
  /** Block height in px. Default 16. */
  height?: number;
  /** Corner radius in px. Default 4. */
  borderRadius?: number;
  /** Shimmer sweep duration in ms. Default 1200. */
  duration?: number;
  /** Base block colour. */
  backgroundColor?: string;
  /** Sweeping highlight colour. */
  highlightColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const Skeleton = ({
  width = '100%',
  height = DEFAULT_HEIGHT,
  borderRadius = DEFAULT_BORDER_RADIUS,
  duration = DEFAULT_SKELETON_DURATION_MS,
  backgroundColor = DEFAULT_BG,
  highlightColor = DEFAULT_HIGHLIGHT,
  style,
  testID = MOTION_TEST_IDS.skeleton,
}: SkeletonProps): React.ReactElement => {
  const reduced = useReducedMotion();
  const shimmer = useRef(new Animated.Value(0)).current;
  const [measuredWidth, setMeasuredWidth] = useState(0);

  const onLayout = useCallback((event: LayoutChangeEvent): void => {
    const nextWidth = event.nativeEvent.layout.width;
    setMeasuredWidth((previous) => (previous === nextWidth ? previous : nextWidth));
  }, []);

  useEffect(() => {
    if (reduced || measuredWidth === 0) return undefined;
    shimmer.setValue(0);
    const anim = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: shouldUseNativeDriver(),
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [reduced, measuredWidth, duration, shimmer]);

  const [from, to] = shimmerRange(measuredWidth);
  const translateX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [from, to] });
  const highlightWidth = measuredWidth * HIGHLIGHT_WIDTH_RATIO;

  return (
    <View
      accessibilityState={{ busy: true }}
      onLayout={onLayout}
      style={[styles.block, { width: width as ViewStyle['width'], height, borderRadius, backgroundColor }, style]}
      testID={testID}
    >
      {reduced || measuredWidth === 0 ? null : (
        <Animated.View
          style={[styles.highlight, { width: highlightWidth, backgroundColor: highlightColor, transform: [{ translateX }] }]}
        />
      )}
    </View>
  );
};

export default Skeleton;

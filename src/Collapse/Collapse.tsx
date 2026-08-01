/**
 * Collapse — an animated height expand/collapse that WORKS ON WEB.
 *
 * WHY NOT LayoutAnimation: RN's `LayoutAnimation` (what ui-layout's Accordion uses)
 * is a NATIVE-only no-op under react-native-web, so an app that relied on it got no
 * animation on the web build. Collapse instead measures the content's natural height
 * via `onLayout` and animates a real `Animated.Value` height — the same code path on
 * web and native. Height is a layout prop, so the native driver can never be used
 * here (`useNativeDriver: false`).
 *
 * The children stay MOUNTED at all times (only clipped by `overflow: hidden`), so
 * their state is preserved across open/close and screen readers still reach them.
 * Reduced-motion snaps to the target height with no animation.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Animated,
  type LayoutChangeEvent,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';

import { useReducedMotion } from '@dloizides/rn-web-hooks';

import { motionDurations, motionEasings } from '../motionTokens';
import { collapseTargetHeight, resolveDuration } from '../motionUtils';
import { MOTION_TEST_IDS } from '../constants';

const styles = StyleSheet.create({
  outer: {
    overflow: 'hidden',
  },
});

export interface CollapseProps {
  /** Whether the content is expanded. */
  open: boolean;
  children: React.ReactNode;
  /** Expand/collapse duration in ms. Defaults to the `base` motion duration (200). */
  duration?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const Collapse = ({
  open,
  children,
  duration = motionDurations.base,
  style,
  testID = MOTION_TEST_IDS.collapse,
}: CollapseProps): React.ReactElement => {
  const reduced = useReducedMotion();
  const [measured, setMeasured] = useState<number | null>(null);
  const heightAnim = useRef(new Animated.Value(0)).current;
  // Skip the FIRST animation: on mount we snap to the initial state, then animate
  // only subsequent open/close changes.
  const initialized = useRef(false);

  const onContentLayout = useCallback((event: LayoutChangeEvent): void => {
    const nextHeight = event.nativeEvent.layout.height;
    setMeasured((previous) => (previous === nextHeight ? previous : nextHeight));
  }, []);

  useEffect(() => {
    const target = collapseTargetHeight(open, measured);
    if (target === undefined) return undefined;

    if (!initialized.current) {
      heightAnim.setValue(target);
      initialized.current = true;
      return undefined;
    }

    const effectiveDuration = resolveDuration(duration, reduced);
    if (effectiveDuration === 0) {
      heightAnim.setValue(target);
      return undefined;
    }

    const anim = Animated.timing(heightAnim, {
      toValue: target,
      duration: effectiveDuration,
      easing: motionEasings.standard,
      // Height is a layout prop — the native driver cannot animate it.
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [open, measured, duration, reduced, heightAnim]);

  // Until measured, leave height `auto` (undefined) so the content reports its
  // natural size; after that, drive the animated height.
  const outerHeight = measured === null ? undefined : heightAnim;

  return (
    <Animated.View style={[styles.outer, { height: outerHeight }, style]} testID={testID}>
      <View onLayout={onContentLayout}>{children}</View>
    </Animated.View>
  );
};

export default Collapse;

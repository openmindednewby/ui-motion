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
 * The children stay MOUNTED at all times, so their state survives open/close and a
 * consumer's `aria-controls` always resolves to a real node. MOUNTED IS NOT EXPOSED,
 * though: once the collapse has settled shut the content is hidden from the
 * accessibility tree, the tab order and hit-testing.
 *
 * THAT DISTINCTION IS A BUG FIX, and this comment used to assert the bug ("screen
 * readers still reach them"). `overflow: hidden` + `height: 0` CLIPS; it does not hide.
 * The clipped child keeps its own non-empty box, so it stayed focusable by Tab,
 * announced by screen readers, and reported VISIBLE by Playwright — while the owning
 * header said `aria-expanded="false"`. Found via an aml-v2 E2E test that could see a
 * collapsed settings panel.
 *
 * Reduced-motion snaps to the target height with no animation.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Animated,
  type LayoutChangeEvent,
  Platform,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';

import { useReducedMotion } from '@dloizides/rn-web-hooks';

import { motionDurations, motionEasings } from '../motionTokens';
import { collapseSettlesClosed, collapseTargetHeight, resolveDuration } from '../motionUtils';
import { MOTION_TEST_IDS } from '../constants';

const IS_WEB = Platform.OS === 'web';

const styles = StyleSheet.create({
  outer: {
    overflow: 'hidden',
  },
});

/**
 * WEB ONLY, and the whole point of the fix: `visibility: hidden` is what actually makes a collapsed
 * region CLOSED — it takes the content out of the accessibility tree AND the tab order, and both
 * browsers and Playwright then report it hidden. `overflow: hidden` + `height: 0` does none of that.
 *
 * Deliberately NOT `display: none`, which would achieve the same hiding and then zero the `onLayout`
 * measurement this component animates back to — so reopening would animate 0 → 0. `visibility`
 * keeps the layout box, and therefore the measurement, intact.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- `visibility` is a react-native-web style; RN's own ViewStyle does not declare it.
const HIDDEN_WHEN_SETTLED_CLOSED = { visibility: 'hidden' } as unknown as ViewStyle;

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
  // "Closed AND finished closing". Distinct from `!open`, which is true from the first frame of the
  // collapse animation — hiding then would make the content vanish instead of collapse.
  const [settledClosed, setSettledClosed] = useState(!open);
  const heightAnim = useRef(new Animated.Value(0)).current;
  // Skip the FIRST animation: on mount we snap to the initial state, then animate
  // only subsequent open/close changes.
  const initialized = useRef(false);

  const onContentLayout = useCallback((event: LayoutChangeEvent): void => {
    const nextHeight = event.nativeEvent.layout.height;
    setMeasured((previous) => (previous === nextHeight ? previous : nextHeight));
  }, []);

  useEffect(() => {
    // Opening is immediate — the content has to be reachable for the whole expand, not just after it.
    if (open) setSettledClosed(false);

    const target = collapseTargetHeight(open, measured);
    if (target === undefined) {
      // Nothing has been measured yet, so there is no height to animate and the close is
      // INSTANT — settled the moment it is asked for. Returning early without settling (as this
      // did first) left a closed region exposed for the whole pre-layout window, which is exactly
      // the defect this state exists to fix: hiding is a property of `open`, not of measurement.
      if (!open) setSettledClosed(true);
      return undefined;
    }

    // Two more instant paths: the FIRST effect snaps to the initial state rather than animating
    // it, and reduced motion resolves every duration to 0.
    const effectiveDuration = resolveDuration(duration, reduced);
    if (!initialized.current || effectiveDuration === 0) {
      heightAnim.setValue(target);
      initialized.current = true;
      if (!open) setSettledClosed(true);
      return undefined;
    }

    const anim = Animated.timing(heightAnim, {
      toValue: target,
      duration: effectiveDuration,
      easing: motionEasings.standard,
      // Height is a layout prop — the native driver cannot animate it.
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (collapseSettlesClosed(open, finished)) setSettledClosed(true);
    });
    return () => anim.stop();
  }, [open, measured, duration, reduced, heightAnim]);

  // Until measured, leave height `auto` (undefined) so the content reports its
  // natural size; after that, drive the animated height.
  const outerHeight = measured === null ? undefined : heightAnim;

  return (
    <Animated.View
      accessibilityElementsHidden={settledClosed}
      aria-hidden={settledClosed ? true : undefined}
      importantForAccessibility={settledClosed ? 'no-hide-descendants' : 'auto'}
      pointerEvents={settledClosed ? 'none' : 'auto'}
      // The hide comes AFTER the caller's `style`: whether a closed region is exposed is a
      // correctness property of Collapse, not something a consumer should override by accident.
      style={[
        styles.outer,
        { height: outerHeight },
        style,
        settledClosed && IS_WEB ? HIDDEN_WHEN_SETTLED_CLOSED : null,
      ]}
      testID={testID}
    >
      <View onLayout={onContentLayout}>{children}</View>
    </Animated.View>
  );
};

export default Collapse;

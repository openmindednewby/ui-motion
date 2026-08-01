/**
 * useEnterExit — the reusable enter/exit animation promoted from the ToastHost
 * pattern in `@dloizides/ui-feedback` (fade + optional translate/scale via
 * `Animated`, native driver off on web).
 *
 * The problem it solves: an exiting element must stay MOUNTED until its fade-out
 * finishes, otherwise it vanishes instantly. Callers can't easily track that, so
 * the hook owns a `mounted` flag alongside the animated `style` — keep the node in
 * the tree while `mounted` is true, and it will unmount itself once the exit
 * completes.
 *
 * Reduced-motion (via `@dloizides/rn-web-hooks`) collapses the duration to 0, so
 * both enter and exit are instant and `mounted` flips synchronously.
 */
import { useEffect, useMemo, useRef, useState } from 'react';

import { Animated } from 'react-native';

import { useReducedMotion } from '@dloizides/rn-web-hooks';

import { motionDurations, motionEasings } from '../motionTokens';
import { resolveDuration, shouldUseNativeDriver } from '../motionUtils';

export interface UseEnterExitOptions {
  /** Whether the element should be visible (entered). */
  visible: boolean;
  /** Enter/exit duration in ms. Defaults to the `base` motion duration (200). */
  duration?: number;
  /**
   * Initial translate-Y offset (px) the element enters from / exits to. `0`
   * (default) disables the translate, leaving a pure fade.
   */
  translateY?: number;
  /**
   * Initial scale the element enters from / exits to. `1` (default) disables the
   * scale, leaving a pure fade.
   */
  fromScale?: number;
}

export interface UseEnterExitResult {
  /** Animated style to spread onto an `Animated.View`. */
  style: {
    opacity: Animated.Value;
    transform: Animated.WithAnimatedArray<{ translateY: Animated.AnimatedInterpolation<number> } | { scale: Animated.AnimatedInterpolation<number> }>;
  };
  /** True while the element must remain in the tree (entered OR exiting). */
  mounted: boolean;
}

export function useEnterExit(options: UseEnterExitOptions): UseEnterExitResult {
  const { visible, duration = motionDurations.base, translateY = 0, fromScale = 1 } = options;

  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    const effectiveDuration = resolveDuration(duration, reduced);

    if (visible) {
      // Enter: mount immediately, then animate in.
      setMounted(true);
      if (effectiveDuration === 0) {
        progress.setValue(1);
        return undefined;
      }
      const anim = Animated.timing(progress, {
        toValue: 1,
        duration: effectiveDuration,
        easing: motionEasings.decelerate,
        useNativeDriver: shouldUseNativeDriver(),
      });
      anim.start();
      return () => anim.stop();
    }

    // Exit: animate out, then unmount once finished.
    if (effectiveDuration === 0) {
      progress.setValue(0);
      setMounted(false);
      return undefined;
    }
    const anim = Animated.timing(progress, {
      toValue: 0,
      duration: effectiveDuration,
      easing: motionEasings.accelerate,
      useNativeDriver: shouldUseNativeDriver(),
    });
    anim.start(({ finished }) => {
      if (finished) setMounted(false);
    });
    return () => anim.stop();
  }, [visible, duration, reduced, progress]);

  const style = useMemo(() => {
    const transform: Array<
      | { translateY: Animated.AnimatedInterpolation<number> }
      | { scale: Animated.AnimatedInterpolation<number> }
    > = [];
    if (translateY !== 0) {
      transform.push({
        translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [translateY, 0] }),
      });
    }
    if (fromScale !== 1) {
      transform.push({
        scale: progress.interpolate({ inputRange: [0, 1], outputRange: [fromScale, 1] }),
      });
    }
    return { opacity: progress, transform };
  }, [progress, translateY, fromScale]);

  return { style, mounted };
}

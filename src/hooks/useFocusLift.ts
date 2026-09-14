/**
 * useFocusLift — a focused tile lifts and grows slightly on a spring; losing focus
 * springs it back. Focus changes mid-flight RETARGET the running spring (the new
 * `Animated.spring` inherits the previous spring's velocity), so rapid focus moves
 * across a grid stay continuous instead of restarting from rest.
 *
 * Under reduced motion the tile does not move at all — the caller signals focus
 * with a ring/shadow swap instead. Transform only, so it is native-drivable.
 */
import { useEffect, useMemo, useRef } from 'react';

import { Animated, type ViewStyle } from 'react-native';

import { useReducedMotion } from '@dloizides/rn-web-hooks';

import { DEFAULT_FOCUS_LIFT_PX, DEFAULT_FOCUS_SCALE } from '../constants';
import { shouldUseNativeDriver } from '../motionUtils';

export interface FocusLiftSpring {
  stiffness: number;
  damping: number;
}

export interface FocusLiftOptions {
  /** Scale while focused. Default 1.06. */
  scale?: number;
  /** Upward lift (px) while focused. Default 8. */
  lift?: number;
}

export interface FocusLiftTarget {
  scale: number;
  translateY: number;
}

export interface UseFocusLiftResult {
  /** Animated style to spread onto an `Animated.View`. */
  style: Animated.WithAnimatedObject<ViewStyle>;
}

const REST: FocusLiftTarget = { scale: 1, translateY: 0 };

/** The transform a tile should settle at. Pure — the hook only springs toward it. */
export function focusLiftTarget(focused: boolean, reduced: boolean, opts: FocusLiftOptions): FocusLiftTarget {
  if (reduced || !focused) return REST;
  return { scale: opts.scale ?? DEFAULT_FOCUS_SCALE, translateY: -(opts.lift ?? DEFAULT_FOCUS_LIFT_PX) };
}

export function useFocusLift(
  focused: boolean,
  spring: FocusLiftSpring,
  opts: FocusLiftOptions = {},
): UseFocusLiftResult {
  const reduced = useReducedMotion();
  const target = focusLiftTarget(focused, reduced, opts);
  const scale = useRef(new Animated.Value(target.scale)).current;
  const translateY = useRef(new Animated.Value(target.translateY)).current;
  const { stiffness, damping } = spring;

  useEffect(() => {
    if (reduced) {
      scale.stopAnimation();
      translateY.stopAnimation();
      scale.setValue(target.scale);
      translateY.setValue(target.translateY);
      return;
    }
    // No stop() in a cleanup: stopping clears the running animation and with it the
    // velocity a retargeted spring would inherit.
    const config = { stiffness, damping, mass: 1, useNativeDriver: shouldUseNativeDriver() };
    Animated.spring(scale, { ...config, toValue: target.scale }).start();
    Animated.spring(translateY, { ...config, toValue: target.translateY }).start();
  }, [reduced, target.scale, target.translateY, stiffness, damping, scale, translateY]);

  useEffect(
    () => () => {
      scale.stopAnimation();
      translateY.stopAnimation();
    },
    [scale, translateY],
  );

  const style = useMemo(() => ({ transform: [{ translateY }, { scale }] }), [scale, translateY]);
  return { style };
}

/**
 * motionUtils — the pure decision logic behind the primitives, extracted so it can
 * be unit-tested WITHOUT driving RN `Animated` (which needs a running animation
 * frame loop). Each primitive imports these and only wires the result into an
 * `Animated.Value`; the interesting branching lives here where a plain assertion
 * can pin it.
 */
import { Platform } from 'react-native';

import { motionDurations } from './motionTokens';

/**
 * The animation duration a primitive should actually use. Collapses to
 * `instant` (0) under reduced-motion — the single source of the "every animation
 * collapses to instant" rule the whole package promises. `0` means "jump to the
 * end state on the next frame", i.e. no visible motion.
 */
export function resolveDuration(duration: number, reduced: boolean): number {
  return reduced ? motionDurations.instant : duration;
}

/**
 * Whether RN `Animated` should use the native driver. Layout props (height) can
 * NEVER be native-driven, so callers animating height must pass `false` regardless
 * — this helper is for opacity/transform animations, which are native-drivable on
 * native and must fall back to the JS driver on web.
 */
export function shouldUseNativeDriver(): boolean {
  return Platform.OS !== 'web';
}

/**
 * The target height for a {@link Collapse}: the measured content height when open,
 * `0` when closed. `undefined` while the content has not been measured yet — the
 * caller leaves height `auto` for that first layout pass so the content can report
 * its natural size.
 */
export function collapseTargetHeight(open: boolean, measured: number | null): number | undefined {
  if (measured === null) return undefined;
  return open ? measured : 0;
}

/**
 * The scale a {@link PressableScale} should animate to. `1` (no scale) whenever
 * reduced-motion is on OR the control is not pressed; the pressed scale otherwise.
 */
export function resolveScale(pressed: boolean, reduced: boolean, pressedScale: number): number {
  if (reduced) return 1;
  return pressed ? pressedScale : 1;
}

/**
 * The `[from, to]` translateX range for a {@link Skeleton} shimmer sweep across a
 * block of the given pixel width — the highlight travels from just off the left
 * edge to just off the right edge.
 */
export function shimmerRange(width: number): readonly [number, number] {
  return [-width, width];
}

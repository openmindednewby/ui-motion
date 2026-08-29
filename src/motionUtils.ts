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
 * Whether a finished collapse animation leaves the region SETTLED CLOSED — the state in which the
 * content is taken out of the accessibility tree, the tab order and hit-testing.
 *
 * Both halves matter. `!open` alone is true from the animation's FIRST frame, so hiding on it would
 * make the content vanish instead of collapse. `finished` alone is true for a completed EXPAND. And
 * `finished` is false when a reopen interrupted the collapse, where hiding would hide an element
 * that is already on its way back open.
 *
 * This lives here, and not inline in the animation callback, because that callback is unreachable
 * from a jsdom test: `onLayout` needs a `ResizeObserver`, so `Collapse` never measures and never
 * animates there. A test asserting the rule through the DOM would be asserting nothing.
 */
export function collapseSettlesClosed(open: boolean, finished: boolean): boolean {
  return finished && !open;
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

/**
 * `@dloizides/ui-motion` — themable, brand-agnostic RN (RN-web) motion primitives.
 *
 * All animations run on RN `Animated` (no reanimated/moti/framer), use the native
 * driver on native and the JS driver on web, and collapse to instant when
 * `useReducedMotion()` is true. Motion values come from `@dloizides/design-tokens`.
 */

// Reduced-motion gate — re-exported from `@dloizides/rn-web-hooks` (the canonical
// implementation). NOT forked: import it from here so motion consumers get the gate
// and the primitives from one package.
export { useReducedMotion, prefersReducedMotion } from '@dloizides/rn-web-hooks';

// Motion tokens (durations + RN Easing map derived from design-tokens).
export {
  DEFAULT_MOTION,
  motionDurations,
  motionEasings,
  motionEasingTokens,
} from './motionTokens';
export type { Motion, MotionDurations, MotionEasings, MotionEasingName } from './motionTokens';

// Pure decision logic (reduced-motion collapse, scale/height/shimmer resolution).
export {
  resolveDuration,
  shouldUseNativeDriver,
  collapseTargetHeight,
  resolveScale,
  shimmerRange,
} from './motionUtils';

// Constants / testIDs.
export {
  MOTION_TEST_IDS,
  DEFAULT_PRESSED_SCALE,
  DEFAULT_FADE_TRANSLATE_Y,
  DEFAULT_SKELETON_DURATION_MS,
} from './constants';

// Hooks.
export { useEnterExit } from './hooks/useEnterExit';
export type { UseEnterExitOptions, UseEnterExitResult } from './hooks/useEnterExit';

// Components.
export { FadeIn } from './FadeIn/FadeIn';
export type { FadeInProps } from './FadeIn/FadeIn';

export { Collapse } from './Collapse/Collapse';
export type { CollapseProps } from './Collapse/Collapse';

export { PressableScale } from './PressableScale/PressableScale';
export type { PressableScaleProps } from './PressableScale/PressableScale';

export { Skeleton } from './Skeleton/Skeleton';
export type { SkeletonProps } from './Skeleton/Skeleton';

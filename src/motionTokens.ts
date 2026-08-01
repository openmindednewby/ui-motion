/**
 * motionTokens — the RN-ready motion scale, DERIVED from `@dloizides/design-tokens`.
 *
 * design-tokens ships framework-agnostic VALUES (durations in ms + easings as a
 * `css` string plus `[x1,y1,x2,y2]` bezier control points). This module turns the
 * bezier tuples into RN `Easing.bezier(...)` functions ONCE, so every primitive in
 * this package animates on the same curves the web/CSS side uses — one source, two
 * runtimes. Nothing here is app-specific; motion is uniform across portals.
 */
import { Easing, type EasingFunction } from 'react-native';

import {
  DEFAULT_MOTION,
  type Motion,
  type MotionDurations,
  type MotionEasings,
} from '@dloizides/design-tokens';

/** Re-export the raw token group so consumers can read durations/css strings directly. */
export { DEFAULT_MOTION };
export type { Motion, MotionDurations, MotionEasings };

/** Durations in ms (numbers). `instant` (0) is the reduced-motion collapse target. */
export const motionDurations: MotionDurations = DEFAULT_MOTION.durations;

/** The easing token group in its raw (`css` + `bezier`) form. */
export const motionEasingTokens: MotionEasings = DEFAULT_MOTION.easings;

/** The named RN easing curves, one per {@link MotionEasings} key. */
export type MotionEasingName = keyof MotionEasings;

/**
 * RN `EasingFunction`s built from the design-token bezier tuples. Built once at
 * module load; the same three functions are reused by every primitive.
 */
export const motionEasings: Record<MotionEasingName, EasingFunction> = {
  standard: Easing.bezier(...motionEasingTokens.standard.bezier),
  decelerate: Easing.bezier(...motionEasingTokens.decelerate.bezier),
  accelerate: Easing.bezier(...motionEasingTokens.accelerate.bezier),
};

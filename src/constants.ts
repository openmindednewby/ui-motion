/**
 * Default testID strings for the motion primitives. Consumers can override each
 * via the component's `testID` prop; these are the fallbacks so Playwright/RTL
 * selectors have a stable default.
 */
export const MOTION_TEST_IDS = {
  fadeIn: 'fade-in',
  collapse: 'collapse',
  pressableScale: 'pressable-scale',
  skeleton: 'skeleton',
  reorder: 'reorder',
} as const;

/** Default press-in scale for {@link PressableScale}. */
export const DEFAULT_PRESSED_SCALE = 0.96;

/** Default enter translate-Y (px) for {@link FadeIn}. */
export const DEFAULT_FADE_TRANSLATE_Y = 8;

/** Default shimmer sweep duration (ms) for {@link Skeleton}. */
export const DEFAULT_SKELETON_DURATION_MS = 1200;

/** Default focused scale for {@link useFocusLift}. */
export const DEFAULT_FOCUS_SCALE = 1.06;

/** Default focused lift (px, upward) for {@link useFocusLift}. */
export const DEFAULT_FOCUS_LIFT_PX = 8;

/** Default per-item stagger (ms) for {@link Reorder}. */
export const DEFAULT_FLIP_STAGGER_MS = 18;

/** Default maximum number of items {@link Reorder} animates; the rest snap. */
export const DEFAULT_FLIP_CAP = 8;

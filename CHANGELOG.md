# Changelog

## 1.1.0

### Added

- **`computeFlipDeltas(prev, next, { staggerMs, cap })`** — the pure FLIP invert step: for each
  item that moved, the offset it must start from, staggered in new reading order (y, then x).
  New and unmoved items are omitted; past `cap` the rest snap.
- **`<Reorder itemKeys spring staggerMs? cap? testID?>{(key) => node}</Reorder>`** — plays that
  step on a keyed list when its order changes (`onLayout` slots, `Animated.ValueXY` spring to 0,
  mid-flight items start from where they visually are). No animation under reduced motion.
- **`useFocusLift(focused, spring, { scale?, lift? })`** + pure **`focusLiftTarget`** — a focused
  tile lifts 8px and scales 1.06 on a retargetable spring; stays put under reduced motion.

## 1.0.2

### Fixed

- **`Collapse` — a closed region is now HIDDEN, not merely clipped.** `overflow: hidden` +
  `height: 0` clips, but the clipped child keeps its own non-empty box: it stayed in the tab
  order, was still announced by screen readers, and was still reported VISIBLE by Playwright —
  while the owning header said `aria-expanded="false"`. Found by an aml-v2 E2E test that could
  see a collapsed settings panel. A settled-closed region now sets `visibility: hidden` (web),
  `aria-hidden`, `accessibilityElementsHidden`, `importantForAccessibility="no-hide-descendants"`
  and `pointerEvents="none"`.

  `visibility: hidden` rather than `display: none` deliberately: `display: none` would zero the
  `onLayout` measurement the component animates back to, so reopening would animate 0 -> 0.

  "Settled closed" is a state distinct from `!open` — it is set only once the collapse has
  actually finished, so the content collapses instead of vanishing, and an interrupted collapse
  (a reopen mid-animation, `finished: false`) never hides. It is also set immediately whenever
  there is nothing to animate: before the first `onLayout` and under reduced motion.

- **`collapseSettlesClosed(open, finished)`** exported from `motionUtils` — the settle rule as a
  pure function, because the animation callback it guards is unreachable from a jsdom test
  (`onLayout` needs a `ResizeObserver`).


## 1.0.1

Initial release — the shared motion layer of the dloizides.com RN-web UI kit.

The kit was almost entirely static: only `ui-feedback` (ToastHost fade/slide, PageSkeleton
opacity pulse) and `ui-layout` (Accordion chevron) animated, each re-declaring durations and
curves inline. This package centralises reusable motion primitives, all built on RN `Animated`
(no reanimated/moti/framer), all driven by `@dloizides/design-tokens` motion tokens, and all
gated on `@dloizides/rn-web-hooks` `useReducedMotion` so every animation collapses to instant
under the user's reduced-motion preference.

### New

- **Tokens** — `motionDurations`, `motionEasings` (RN `EasingFunction`s built from the
  design-token cubic-bezier tuples), `motionEasingTokens`, and a re-export of `DEFAULT_MOTION`.
  Web and native animate on the same curves.
- **`useReducedMotion` / `prefersReducedMotion`** — re-exported from `@dloizides/rn-web-hooks`
  (canonical gate, not forked) so motion consumers get the gate and the primitives from one place.
- **`useEnterExit({ visible, duration?, translateY?, fromScale? })`** — the reusable enter/exit
  pattern promoted from ToastHost. Returns an animated `style` + a `mounted` flag so callers keep
  the node in the tree through its exit animation.
- **`<FadeIn>`** — fade (+ small translateY) on mount.
- **`<Collapse open>`** — animated height expand/collapse that WORKS ON WEB (measures content
  height, animates a real `Animated.Value` height; not `LayoutAnimation`, a native-only no-op on
  RN-web). Children stay mounted, overflow clipped.
- **`<PressableScale>`** — a `Pressable` that scales down on press-in and back on press-out;
  forwards all Pressable props + accessibility. Replaces bare `activeOpacity` in ui-buttons.
- **`<Skeleton>`** — a moving-shimmer placeholder block (upgrades the opacity-pulse approach);
  `width` / `height` / `borderRadius` props.
- Pure helpers `resolveDuration`, `shouldUseNativeDriver`, `collapseTargetHeight`, `resolveScale`,
  `shimmerRange`, and `MOTION_TEST_IDS`.

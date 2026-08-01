# Changelog

## 1.0.0

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

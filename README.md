# @dloizides/ui-motion

Themable, brand-agnostic **React Native (RN-web)** motion primitives — the shared
animation layer of the dloizides.com UI kit.

- Built on RN `Animated` only. **No** reanimated / moti / framer.
- Native driver on native, JS driver on web (`useNativeDriver: Platform.OS !== 'web'`).
- **Every animation collapses to instant when the user prefers reduced motion**
  (`useReducedMotion()`, re-exported from `@dloizides/rn-web-hooks`).
- Motion values (durations + easings) come from `@dloizides/design-tokens`, so web
  (CSS `cubic-bezier`) and native (`Easing.bezier`) animate on the **same curves**.

## Install

```bash
npm install @dloizides/ui-motion
```

Peer deps: `react >=18`, `react-native >=0.74`. Runtime deps `@dloizides/design-tokens`
and `@dloizides/rn-web-hooks` are installed automatically.

## Tokens

```ts
import { motionDurations, motionEasings, DEFAULT_MOTION } from '@dloizides/ui-motion';

motionDurations; // { instant: 0, fast: 140, base: 200, slow: 300 } (ms)
motionEasings.standard;   // RN EasingFunction built from cubic-bezier(0.2,0,0,1)
motionEasings.decelerate; // entering elements
motionEasings.accelerate; // leaving elements
DEFAULT_MOTION.easings.standard.css; // 'cubic-bezier(0.2,0,0,1)' for web/CSS consumers
```

## Hooks

### `useReducedMotion()` / `prefersReducedMotion()`

Re-exported from `@dloizides/rn-web-hooks` (the canonical gate — not forked). Web reads
`matchMedia('(prefers-reduced-motion: reduce)')`; native returns `false`.

### `useEnterExit({ visible, duration?, translateY?, fromScale? })`

The reusable enter/exit pattern (fade + optional translate/scale) promoted from
`ui-feedback`'s ToastHost. Returns an animated `style` **and** a `mounted` flag so the
node stays in the tree until its exit animation finishes.

```tsx
const { style, mounted } = useEnterExit({ visible: open, translateY: -6 });
if (!mounted) return null;
return <Animated.View style={style}>{children}</Animated.View>;
```

## Components

### `<FadeIn duration? delay? translateY? style? testID>`

Fades (and slightly lifts) its children in once, on mount.

```tsx
<FadeIn><Card /></FadeIn>
```

### `<Collapse open duration? style? testID>`

Animated height expand/collapse that **works on web** — it measures the content's
natural height and animates a real `Animated.Value` height (unlike `LayoutAnimation`,
a native-only no-op on RN-web). Children stay mounted; overflow is clipped.

```tsx
<Collapse open={expanded}><Details /></Collapse>
```

### `<PressableScale pressedScale? innerStyle? ...PressableProps>`

A `Pressable` that scales down (default `0.96`) on press-in and springs back on
press-out. Forwards **all** Pressable props and accessibility. Designed to replace bare
`activeOpacity` in `@dloizides/ui-buttons`.

```tsx
<PressableScale accessibilityLabel="Save" accessibilityHint="Saves the form" onPress={save}>
  <Text>Save</Text>
</PressableScale>
```

### `<Skeleton width? height? borderRadius? duration? backgroundColor? highlightColor? style? testID>`

A rounded placeholder block with a highlight band that sweeps across it — a stronger
loading signal than the opacity pulse in `ui-feedback`'s PageSkeleton.

```tsx
<Skeleton width="60%" height={20} borderRadius={6} />
```

## Reduced motion

Every primitive honours the OS "reduce motion" setting: `FadeIn` shows content at rest,
`Collapse` snaps to the target height, `PressableScale` keeps scale `1`, `Skeleton`
shows a static block, and `useEnterExit` collapses its duration to `0`.

## Testing philosophy

Unit tests cover **logic** (reduced-motion collapse, mount/exit lifecycle, token
derivation, prop forwarding), not animation frames — the frame-driven paths are
verified in the app E2E suites.

## License

MIT © dloizides

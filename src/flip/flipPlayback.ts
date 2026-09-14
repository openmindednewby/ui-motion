/**
 * flipPlayback — the "play" half of FLIP, shared by both measurement paths of
 * {@link Reorder} (web: synchronous DOM read; native: `onLayout`).
 */
import { Animated } from 'react-native';

import { shouldUseNativeDriver } from '../motionUtils';
import { computeFlipDeltas, type FlipOptions, type LayoutBox } from './computeFlipDeltas';

export interface FlipPlayOptions extends FlipOptions {
  spring: { stiffness: number; damping: number };
}

const ORIGIN = { x: 0, y: 0 };

/**
 * Slot of every registered host node, read from `offsetLeft`/`offsetTop`. Those are
 * layout positions: they ignore transforms, so an item caught mid-flight still
 * reports its slot, not where it is drawn. Nodes without offsets (native) are skipped.
 */
export function measureSlots(nodes: ReadonlyMap<string, unknown>): Map<string, LayoutBox> {
  const slots = new Map<string, LayoutBox>();
  for (const [key, node] of nodes) {
    const el = node as { offsetLeft?: unknown; offsetTop?: unknown } | null;
    if (typeof el?.offsetLeft === 'number' && typeof el.offsetTop === 'number') {
      slots.set(key, { x: el.offsetLeft, y: el.offsetTop });
    }
  }
  return slots;
}

/**
 * Jump every moved item to its inverted offset, then spring it to 0. The invert adds
 * the item's current offset, so an item already in flight continues from where it is
 * drawn. Moved items past `cap` snap to 0 — including any stale in-flight offset.
 * `setValue` runs synchronously (JS driver), so called from a layout effect the invert
 * is applied before the browser paints the new slots.
 */
export function playFlip(
  offsets: ReadonlyMap<string, Animated.ValueXY>,
  prev: ReadonlyMap<string, LayoutBox>,
  next: ReadonlyMap<string, LayoutBox>,
  opts: FlipPlayOptions,
): void {
  const moved = computeFlipDeltas(prev, next, { staggerMs: opts.staggerMs, cap: Number.POSITIVE_INFINITY });
  moved.forEach(({ key, dx, dy, delayMs }, index) => {
    const xy = offsets.get(key);
    if (xy === undefined) return;
    xy.stopAnimation((current) => {
      if (index >= opts.cap) {
        xy.setValue(ORIGIN);
        return;
      }
      xy.setValue({ x: current.x + dx, y: current.y + dy });
      Animated.spring(xy, {
        toValue: ORIGIN,
        stiffness: opts.spring.stiffness,
        damping: opts.spring.damping,
        mass: 1,
        delay: delayMs,
        useNativeDriver: shouldUseNativeDriver(),
      }).start();
    });
  });
}

/**
 * Reorder — a keyed list whose moved items spring from their old slot to the new one
 * when `itemKeys` changes order (FLIP; maths in computeFlipDeltas, play in playFlip).
 * - web: RN-web `onLayout` (ResizeObserver) misses position-only moves, so OLD slots are
 *   read from the DOM during the render that changes the order (DOM still holds the last
 *   commit) and NEW slots in `useLayoutEffect` — after the DOM mutation, before paint.
 * - native: `onLayout` reports moves; the flip plays one frame after they arrive.
 * Reduced motion: nothing animates (the caller crossfades). Transform only.
 */
import React, { useEffect, useLayoutEffect, useRef } from 'react';

import { Animated, type LayoutChangeEvent, Platform, View } from 'react-native';

import { useReducedMotion } from '@dloizides/rn-web-hooks';

import { DEFAULT_FLIP_CAP, DEFAULT_FLIP_STAGGER_MS, MOTION_TEST_IDS } from '../constants';
import type { LayoutBox } from './computeFlipDeltas';
import { measureSlots, playFlip } from './flipPlayback';

export interface ReorderProps {
  /** Stable item keys, in display order. */
  itemKeys: readonly string[];
  /** Renders the content for one key. */
  children: (key: string) => React.ReactNode;
  spring: { stiffness: number; damping: number };
  /** Per-item stagger (ms). Default 18. */
  staggerMs?: number;
  /** Maximum animated items; the rest snap. Default 8. */
  cap?: number;
  /** Container testID; each item gets `${testID}-item-${key}`. */
  testID?: string;
}

export function Reorder({
  itemKeys, children, spring, staggerMs = DEFAULT_FLIP_STAGGER_MS, cap = DEFAULT_FLIP_CAP,
  testID = MOTION_TEST_IDS.reorder,
}: ReorderProps): React.ReactElement {
  const reduced = useReducedMotion();
  const web = Platform.OS === 'web';
  const layouts = useRef(new Map<string, LayoutBox>()).current;
  const nodes = useRef(new Map<string, unknown>()).current;
  const offsets = useRef(new Map<string, Animated.ValueXY>()).current;
  const snapshot = useRef<Map<string, LayoutBox> | null>(null);
  const measuredOrder = useRef<string | null>(null);
  const frame = useRef<number | null>(null);
  const order = JSON.stringify(itemKeys);
  const opts = { staggerMs, cap, spring };

  if (web && measuredOrder.current !== order) {
    measuredOrder.current = order;
    snapshot.current = measureSlots(nodes);
  }

  const offsetFor = (key: string): Animated.ValueXY => {
    if (!offsets.has(key)) offsets.set(key, new Animated.ValueXY({ x: 0, y: 0 }));
    return offsets.get(key) as Animated.ValueXY;
  };

  const takeSnapshot = (): Map<string, LayoutBox> | null => {
    const prev = snapshot.current; snapshot.current = null; return prev;
  };

  useLayoutEffect(() => {
    const live = new Set(itemKeys);
    for (const key of [...offsets.keys()]) {
      if (live.has(key)) continue;
      layouts.delete(key);
      offsets.delete(key);
    }
    if (!web) {
      snapshot.current = reduced ? null : new Map(layouts);
      return;
    }
    const prev = takeSnapshot();
    if (prev !== null && !reduced) playFlip(offsets, prev, measureSlots(nodes), opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the ORDER, not the array identity
  }, [order, reduced]);

  useEffect(() => {
    if (!reduced) return;
    for (const xy of offsets.values()) {
      xy.stopAnimation();
      xy.setValue({ x: 0, y: 0 });
    }
  }, [reduced, offsets]);

  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);

  const playNative = (): void => {
    frame.current = null;
    const prev = takeSnapshot();
    if (prev !== null) playFlip(offsets, prev, layouts, opts);
  };

  const onItemLayout = (key: string) => (event: LayoutChangeEvent): void => {
    const { x, y } = event.nativeEvent.layout;
    layouts.set(key, { x, y });
    if (snapshot.current !== null && frame.current === null) frame.current = requestAnimationFrame(playNative);
  };

  const registerNode = (key: string) => (node: unknown): void => {
    if (node === null) nodes.delete(key); else nodes.set(key, node);
  };

  return (
    <View testID={testID}>
      {itemKeys.map((key) => (
        <Animated.View
          key={key}
          ref={registerNode(key)}
          testID={`${testID}-item-${key}`}
          onLayout={web ? undefined : onItemLayout(key)}
          style={{ transform: offsetFor(key).getTranslateTransform() }}
        >
          {children(key)}
        </Animated.View>
      ))}
    </View>
  );
}

/**
 * Reorder — renders a keyed list and, when `itemKeys` changes order, animates each
 * moved item from its old slot to its new one (FLIP). Layout is read from each
 * item's `onLayout`; the invert maths lives in {@link computeFlipDeltas}.
 *
 * Sequence: the key order changes → the pre-change slots are snapshotted → the moved
 * items report their new slots → one frame later every moved item's offset is set to
 * its old position and springs to 0, staggered. An item caught mid-flight starts from
 * where it visually is, not from its last slot. Under reduced motion nothing animates
 * (the caller crossfades instead). Transform only.
 */
import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import { Animated, type LayoutChangeEvent, View } from 'react-native';

import { useReducedMotion } from '@dloizides/rn-web-hooks';

import { DEFAULT_FLIP_CAP, DEFAULT_FLIP_STAGGER_MS, MOTION_TEST_IDS } from '../constants';
import { shouldUseNativeDriver } from '../motionUtils';
import { computeFlipDeltas, type LayoutBox } from './computeFlipDeltas';

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
  testID?: string;
}

export function Reorder({
  itemKeys,
  children,
  spring,
  staggerMs = DEFAULT_FLIP_STAGGER_MS,
  cap = DEFAULT_FLIP_CAP,
  testID = MOTION_TEST_IDS.reorder,
}: ReorderProps): React.ReactElement {
  const reduced = useReducedMotion();
  const layouts = useRef(new Map<string, LayoutBox>()).current;
  const offsets = useRef(new Map<string, Animated.ValueXY>()).current;
  const snapshot = useRef<Map<string, LayoutBox> | null>(null);
  const frame = useRef<number | null>(null);
  const order = JSON.stringify(itemKeys);

  const offsetFor = (key: string): Animated.ValueXY => {
    let xy = offsets.get(key);
    if (xy === undefined) {
      xy = new Animated.ValueXY({ x: 0, y: 0 });
      offsets.set(key, xy);
    }
    return xy;
  };

  const play = useCallback((): void => {
    frame.current = null;
    const prev = snapshot.current;
    snapshot.current = null;
    if (prev === null) return;
    for (const { key, dx, dy, delayMs } of computeFlipDeltas(prev, layouts, { staggerMs, cap })) {
      const xy = offsets.get(key);
      if (xy === undefined) continue;
      xy.stopAnimation((current) => {
        xy.setValue({ x: current.x + dx, y: current.y + dy });
        Animated.spring(xy, {
          toValue: { x: 0, y: 0 },
          stiffness: spring.stiffness,
          damping: spring.damping,
          mass: 1,
          delay: delayMs,
          useNativeDriver: shouldUseNativeDriver(),
        }).start();
      });
    }
  }, [layouts, offsets, staggerMs, cap, spring.stiffness, spring.damping]);

  useLayoutEffect(() => {
    // Runs before the reordered items report their new slots.
    snapshot.current = reduced ? null : new Map(layouts);
    const live = new Set(itemKeys);
    for (const key of [...offsets.keys()]) {
      if (live.has(key)) continue;
      layouts.delete(key);
      offsets.delete(key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the ORDER, not the array identity
  }, [order, reduced]);

  useEffect(() => {
    if (!reduced) return;
    for (const xy of offsets.values()) {
      xy.stopAnimation();
      xy.setValue({ x: 0, y: 0 });
    }
  }, [reduced, offsets]);

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);

  const onItemLayout = (key: string) => (event: LayoutChangeEvent): void => {
    const { x, y } = event.nativeEvent.layout;
    layouts.set(key, { x, y });
    if (snapshot.current !== null && frame.current === null) frame.current = requestAnimationFrame(play);
  };

  return (
    <View testID={testID}>
      {itemKeys.map((key) => (
        <Animated.View key={key} onLayout={onItemLayout(key)} style={{ transform: offsetFor(key).getTranslateTransform() }}>
          {children(key)}
        </Animated.View>
      ))}
    </View>
  );
}

import { useCallback, useEffect, useRef } from 'react';

import { Animated, Easing } from 'react-native';

import { useReducedMotion } from '@dloizides/rn-web-hooks';

import { DEFAULT_SEQUENCE_ITEM_FRACTION } from './constants';
import { motionEasings } from './motionTokens';
import { shouldUseNativeDriver } from './motionUtils';

const START = 0;
const FINAL = 1;
const MIN_ITEM_MS = 1;
const NOT_PLAYED = Symbol('sequence-not-played');

export interface SequenceItemRange {
  startMs: number;
  endMs: number;
}

export interface UseSequenceOptions {
  /** Fixed length of the whole sequence, whatever the list length. */
  totalMs: number;
  /** Time each item spends animating. Default: a quarter of `totalMs`. */
  itemMs?: number;
  /** A new value replays the sequence from the first item. */
  playKey?: unknown;
  /** When false the items start final and wait for a new `playKey`. Default true. */
  playOnMount?: boolean;
}

export interface UseSequenceResult {
  /** Whole-sequence progress, 0 to 1 and linear in time. */
  progress: Animated.Value;
  /** The 0-1 animated value of one item. */
  progressAt: (index: number) => Animated.AnimatedInterpolation<number>;
}

/** When one item of the list animates, so that the last item ends exactly at `totalMs`. */
export function sequenceItemRange(index: number, count: number, totalMs: number, itemMs: number): SequenceItemRange {
  if (totalMs <= 0) return { startMs: 0, endMs: 0 };
  if (count <= 1) return { startMs: 0, endMs: totalMs };
  const span = Math.min(Math.max(itemMs, MIN_ITEM_MS), totalMs);
  const position = Math.min(Math.max(index, 0), count - 1);
  const startMs = (position * (totalMs - span)) / (count - 1);
  return { startMs, endMs: startMs + span };
}

/** Staggers along any ordered list inside a fixed total; reduced motion shows the final state. */
export function useSequence(items: readonly unknown[], options: UseSequenceOptions): UseSequenceResult {
  const { totalMs, itemMs = totalMs * DEFAULT_SEQUENCE_ITEM_FRACTION, playKey, playOnMount = true } = options;
  const reduced = useReducedMotion();
  const startsFinal = reduced || !playOnMount;
  const progress = useRef(new Animated.Value(startsFinal ? FINAL : START)).current;
  const settledKey = useRef<unknown>(playOnMount ? NOT_PLAYED : playKey);
  const count = items.length;

  useEffect(() => {
    if (reduced || totalMs <= 0 || settledKey.current === playKey) {
      settledKey.current = playKey;
      progress.stopAnimation();
      progress.setValue(FINAL);
      return undefined;
    }
    progress.setValue(START);
    const run = Animated.timing(progress, {
      toValue: FINAL,
      duration: totalMs,
      easing: Easing.linear,
      isInteraction: false,
      useNativeDriver: shouldUseNativeDriver(),
    });
    run.start(({ finished }) => {
      if (finished) settledKey.current = playKey;
    });
    return () => run.stop();
  }, [playKey, progress, reduced, totalMs]);

  const progressAt = useCallback(
    (index: number) => {
      const { startMs, endMs } = sequenceItemRange(index, count, totalMs, itemMs);
      const divisor = totalMs > 0 ? totalMs : FINAL;
      return progress.interpolate({
        inputRange: [startMs / divisor, endMs / divisor],
        outputRange: [START, FINAL],
        easing: motionEasings.standard,
        extrapolate: 'clamp',
      });
    },
    [count, itemMs, progress, totalMs],
  );

  return { progress, progressAt };
}

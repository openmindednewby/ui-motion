import { act, renderHook } from '@testing-library/react';

import { Animated } from 'react-native';

import { sequenceItemRange, useSequence } from './useSequence';

let mockReduced = false;
jest.mock('@dloizides/rn-web-hooks', () => ({
  useReducedMotion: (): boolean => mockReduced,
}));

const realTiming = jest.requireActual<{ timing: typeof Animated.timing }>(
  'react-native-web/dist/cjs/vendor/react-native/Animated/AnimatedImplementation',
).timing;

const valueOf = (node: unknown): number => (node as { __getValue: () => number }).__getValue();

const advance = (ms: number): void => {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
};

describe('sequenceItemRange', () => {
  it('with 5 items over 880 ms, the first starts at 0 and the last ends at 880', () => {
    const first = sequenceItemRange(0, 5, 880, 220);

    const last = sequenceItemRange(4, 5, 880, 220);

    expect(first).toEqual({ startMs: 0, endMs: 220 });
    expect(last).toEqual({ startMs: 660, endMs: 880 });
  });

  it('with 3 items, the middle item starts halfway along the free time', () => {
    const middle = sequenceItemRange(1, 3, 880, 220);

    expect(middle).toEqual({ startMs: 330, endMs: 550 });
  });

  it('with 1000 items, the last item still ends at the total', () => {
    const last = sequenceItemRange(999, 1000, 880, 220);

    expect(last.endMs).toBe(880);
  });

  it('with one item, the item spans the whole total', () => {
    const only = sequenceItemRange(0, 1, 880, 220);

    expect(only).toEqual({ startMs: 0, endMs: 880 });
  });

  it('with itemMs above the total, every item spans the whole total', () => {
    const item = sequenceItemRange(2, 3, 880, 5000);

    expect(item).toEqual({ startMs: 0, endMs: 880 });
  });

  it('with itemMs 0, the item keeps a 1 ms span so its final value stays reachable', () => {
    const last = sequenceItemRange(1, 2, 880, 0);

    expect(last).toEqual({ startMs: 879, endMs: 880 });
  });

  it('with an index past the end, clamps to the last item', () => {
    const item = sequenceItemRange(9, 2, 880, 220);

    expect(item).toEqual({ startMs: 660, endMs: 880 });
  });

  it('with a zero total, the range is empty', () => {
    const item = sequenceItemRange(1, 3, 0, 220);

    expect(item).toEqual({ startMs: 0, endMs: 0 });
  });
});

describe('useSequence', () => {
  const items = ['a', 'b', 'c'];
  let timing: jest.SpyInstance;

  beforeEach(() => {
    mockReduced = false;
    jest.useFakeTimers();
    timing = jest.spyOn(Animated, 'timing').mockImplementation(realTiming);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('with motion on, items finish in list order and all are final at 880 ms', () => {
    const { result } = renderHook(() => useSequence(items, { totalMs: 880, itemMs: 220 }));
    const first = result.current.progressAt(0);
    const last = result.current.progressAt(2);

    advance(440);
    const firstMidway = valueOf(first);
    const lastMidway = valueOf(last);
    advance(460);

    expect(firstMidway).toBe(1);
    expect(lastMidway).toBe(0);
    expect(valueOf(last)).toBe(1);
  });

  it('with 1000 items, the last is unfinished at 800 ms and final at 880 ms', () => {
    const many = Array.from({ length: 1000 }, (_, index) => index);
    const { result } = renderHook(() => useSequence(many, { totalMs: 880, itemMs: 220 }));
    const last = result.current.progressAt(999);

    advance(800);
    const before = valueOf(last);
    advance(100);

    expect(before).toBeLessThan(1);
    expect(valueOf(last)).toBe(1);
  });

  it('with reduced motion, every item is final with no time passing', () => {
    mockReduced = true;

    const { result } = renderHook(() => useSequence(items, { totalMs: 880, itemMs: 220 }));

    expect(valueOf(result.current.progressAt(0))).toBe(1);
    expect(valueOf(result.current.progressAt(2))).toBe(1);
  });

  it('with reduced motion and a new playKey, stays final and starts no animation', () => {
    mockReduced = true;
    const { result, rerender } = renderHook(
      ({ playKey }) => useSequence(items, { totalMs: 880, playKey }),
      { initialProps: { playKey: 'gold' } },
    );

    rerender({ playKey: 'teal' });

    expect(timing).not.toHaveBeenCalled();
    expect(valueOf(result.current.progressAt(2))).toBe(1);
  });

  it('with a new playKey mid-flight, restarts from the first item', () => {
    const { result, rerender } = renderHook(
      ({ playKey }) => useSequence(items, { totalMs: 880, itemMs: 220, playKey }),
      { initialProps: { playKey: 'gold' } },
    );
    advance(440);
    const first = result.current.progressAt(0);
    const firstBefore = valueOf(first);

    rerender({ playKey: 'teal' });

    expect(firstBefore).toBe(1);
    expect(valueOf(first)).toBe(0);
  });

  it('with playOnMount false, starts final and plays only when playKey changes', () => {
    const { result, rerender } = renderHook(
      ({ playKey }) => useSequence(items, { totalMs: 880, itemMs: 220, playKey, playOnMount: false }),
      { initialProps: { playKey: 'gold' } },
    );
    const last = result.current.progressAt(2);
    const onMount = valueOf(last);

    rerender({ playKey: 'teal' });
    const onChange = valueOf(last);
    advance(900);

    expect(onMount).toBe(1);
    expect(onChange).toBe(0);
    expect(valueOf(last)).toBe(1);
  });

  it('with a rerender that keeps the playKey after finishing, does not replay', () => {
    const { rerender } = renderHook(
      ({ totalMs }) => useSequence(items, { totalMs, playKey: 'gold' }),
      { initialProps: { totalMs: 880 } },
    );
    advance(900);

    rerender({ totalMs: 440 });

    expect(timing).toHaveBeenCalledTimes(1);
  });

  it('with motion on, the animation does not register as a blocking interaction', () => {
    renderHook(() => useSequence(items, { totalMs: 880 }));

    expect(timing.mock.calls[0]?.[1]).toMatchObject({ duration: 880, isInteraction: false });
  });

  it('with an unmount mid-flight, stops the animation', () => {
    const { result, unmount } = renderHook(() => useSequence(items, { totalMs: 880, itemMs: 220 }));
    const progress = result.current.progress;
    advance(440);
    const atUnmount = valueOf(progress);

    unmount();
    advance(900);

    expect(valueOf(progress)).toBe(atUnmount);
  });
});

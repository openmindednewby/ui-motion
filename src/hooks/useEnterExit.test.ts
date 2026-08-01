import { renderHook, waitFor } from '@testing-library/react';

import { useEnterExit } from './useEnterExit';

// Drive reduced-motion from the test instead of jsdom's (absent) matchMedia.
let mockReduced = false;
jest.mock('@dloizides/rn-web-hooks', () => ({
  useReducedMotion: (): boolean => mockReduced,
}));

describe('useEnterExit', () => {
  beforeEach(() => {
    mockReduced = false;
  });

  it('initial mounted mirrors the initial visible', () => {
    const visibleHook = renderHook(() => useEnterExit({ visible: true }));
    expect(visibleHook.result.current.mounted).toBe(true);

    const hiddenHook = renderHook(() => useEnterExit({ visible: false }));
    expect(hiddenHook.result.current.mounted).toBe(false);
  });

  it('mounts immediately on enter (false -> true)', () => {
    const { result, rerender } = renderHook(({ visible }) => useEnterExit({ visible }), {
      initialProps: { visible: false },
    });
    expect(result.current.mounted).toBe(false);
    rerender({ visible: true });
    expect(result.current.mounted).toBe(true);
  });

  it('unmounts after a non-reduced exit animation finishes (mount-through-exit)', async () => {
    const { result, rerender } = renderHook(({ visible }) => useEnterExit({ visible }), {
      initialProps: { visible: true },
    });
    expect(result.current.mounted).toBe(true);
    rerender({ visible: false });
    // The node stays mounted until the fade-out completes, then unmounts itself.
    await waitFor(() => expect(result.current.mounted).toBe(false));
  });

  it('unmounts synchronously on exit under reduced-motion (collapses to instant)', () => {
    mockReduced = true;
    const { result, rerender } = renderHook(({ visible }) => useEnterExit({ visible }), {
      initialProps: { visible: true },
    });
    expect(result.current.mounted).toBe(true);
    rerender({ visible: false });
    expect(result.current.mounted).toBe(false);
  });

  it('exposes an opacity Animated.Value and no transform for a pure fade', () => {
    const { result } = renderHook(() => useEnterExit({ visible: true }));
    expect(result.current.style.opacity).toBeDefined();
    expect(result.current.style.transform).toEqual([]);
  });

  it('adds a translateY transform when translateY is non-zero', () => {
    const { result } = renderHook(() => useEnterExit({ visible: true, translateY: 12 }));
    expect(result.current.style.transform).toHaveLength(1);
  });

  it('adds a scale transform when fromScale is not 1', () => {
    const { result } = renderHook(() => useEnterExit({ visible: true, fromScale: 0.9 }));
    expect(result.current.style.transform).toHaveLength(1);
  });

  it('adds both transforms when translateY and fromScale are set', () => {
    const { result } = renderHook(() =>
      useEnterExit({ visible: true, translateY: 8, fromScale: 0.95 }),
    );
    expect(result.current.style.transform).toHaveLength(2);
  });
});

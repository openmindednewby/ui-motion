import {
  resolveDuration,
  shouldUseNativeDriver,
  collapseTargetHeight,
  resolveScale,
  shimmerRange,
} from './motionUtils';
import { motionDurations } from './motionTokens';

describe('resolveDuration', () => {
  it('returns the given duration when NOT reduced', () => {
    expect(resolveDuration(200, false)).toBe(200);
    expect(resolveDuration(140, false)).toBe(140);
  });

  it('collapses to instant (0) when reduced', () => {
    expect(resolveDuration(200, true)).toBe(0);
    expect(resolveDuration(300, true)).toBe(motionDurations.instant);
  });

  it('the reduced value is always the instant token', () => {
    for (const duration of [0, 1, 140, 200, 300, 9999]) {
      expect(resolveDuration(duration, true)).toBe(0);
    }
  });
});

describe('shouldUseNativeDriver', () => {
  it('is false on web (jsdom maps react-native to react-native-web => Platform.OS "web")', () => {
    // In this test env react-native resolves to react-native-web, so Platform.OS
    // is 'web' and the JS driver must be used.
    expect(shouldUseNativeDriver()).toBe(false);
  });
});

describe('collapseTargetHeight', () => {
  it('is undefined while unmeasured (leave height auto for the first layout)', () => {
    expect(collapseTargetHeight(true, null)).toBeUndefined();
    expect(collapseTargetHeight(false, null)).toBeUndefined();
  });

  it('is the measured height when open', () => {
    expect(collapseTargetHeight(true, 120)).toBe(120);
  });

  it('is 0 when closed', () => {
    expect(collapseTargetHeight(false, 120)).toBe(0);
  });
});

describe('resolveScale', () => {
  it('is the pressed scale when pressed and NOT reduced', () => {
    expect(resolveScale(true, false, 0.96)).toBe(0.96);
    expect(resolveScale(true, false, 0.9)).toBe(0.9);
  });

  it('is 1 when not pressed', () => {
    expect(resolveScale(false, false, 0.96)).toBe(1);
  });

  it('is always 1 under reduced-motion, even when pressed', () => {
    expect(resolveScale(true, true, 0.96)).toBe(1);
    expect(resolveScale(false, true, 0.96)).toBe(1);
  });
});

describe('shimmerRange', () => {
  it('sweeps from just off the left to just off the right', () => {
    expect(shimmerRange(200)).toEqual([-200, 200]);
    expect(shimmerRange(0)).toEqual([-0, 0]);
  });
});

import { DEFAULT_MOTION } from '@dloizides/design-tokens';

import {
  motionDurations,
  motionEasings,
  motionEasingTokens,
} from './motionTokens';

describe('motionDurations', () => {
  it('is derived verbatim from the design-token durations', () => {
    expect(motionDurations).toBe(DEFAULT_MOTION.durations);
    expect(motionDurations.instant).toBe(0);
    expect(motionDurations.fast).toBe(140);
    expect(motionDurations.base).toBe(200);
    expect(motionDurations.slow).toBe(300);
  });
});

describe('motionEasingTokens', () => {
  it('is the raw design-token easing group (css + bezier)', () => {
    expect(motionEasingTokens).toBe(DEFAULT_MOTION.easings);
  });
});

describe('motionEasings (RN Easing functions built from the bezier tuples)', () => {
  it('exposes exactly the three named curves', () => {
    expect(Object.keys(motionEasings).sort()).toEqual(['accelerate', 'decelerate', 'standard']);
  });

  it('every curve is a callable easing function', () => {
    for (const easing of Object.values(motionEasings)) {
      expect(typeof easing).toBe('function');
    }
  });

  it('every curve maps the unit interval endpoints to 0 and 1', () => {
    for (const easing of Object.values(motionEasings)) {
      expect(easing(0)).toBeCloseTo(0, 5);
      expect(easing(1)).toBeCloseTo(1, 5);
    }
  });

  it('a mid-point stays within the unit interval', () => {
    for (const easing of Object.values(motionEasings)) {
      const mid = easing(0.5);
      expect(mid).toBeGreaterThanOrEqual(0);
      expect(mid).toBeLessThanOrEqual(1);
    }
  });
});

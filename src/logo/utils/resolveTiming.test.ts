import { DEFAULT_MOTION } from '@dloizides/design-tokens';

import { resolveDuration, resolveEasing } from './resolveTiming';

describe('resolveDuration', () => {
  it('with a token name, returns the design-token duration', () => {
    const token = 'slow';

    const result = resolveDuration(token);

    expect(result).toBe(DEFAULT_MOTION.durations.slow);
  });

  it('with a number of ms, returns it unchanged', () => {
    const ms = 760;

    const result = resolveDuration(ms);

    expect(result).toBe(760);
  });

  it('with an unknown token name, throws naming it', () => {
    const token = 'glacial' as never;

    const act = (): number => resolveDuration(token);

    expect(act).toThrow('glacial');
  });
});

describe('resolveEasing', () => {
  it('with a token name, returns its css timing function', () => {
    const token = 'decelerate';

    const result = resolveEasing(token);

    expect(result).toBe(DEFAULT_MOTION.easings.decelerate.css);
  });

  it('with no token, returns the standard curve', () => {
    const token = undefined;

    const result = resolveEasing(token);

    expect(result).toBe(DEFAULT_MOTION.easings.standard.css);
  });

  it('with an unknown token name, throws naming it', () => {
    const token = 'bouncy' as never;

    const act = (): string => resolveEasing(token);

    expect(act).toThrow('bouncy');
  });
});

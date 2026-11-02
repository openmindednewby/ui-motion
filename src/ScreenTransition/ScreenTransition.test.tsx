import { render } from '@testing-library/react';
import { Animated, Dimensions, Easing, Text } from 'react-native';

import { motionDurations, motionEasings } from '../motionTokens';
import { ScreenTransition } from './ScreenTransition';

let mockReduced = false;
jest.mock('@dloizides/rn-web-hooks', () => ({
  useReducedMotion: (): boolean => mockReduced,
}));

const WINDOW = { width: 390, height: 844, scale: 1, fontScale: 1 };

const valueOf = (node: unknown): number => (node as { __getValue: () => number }).__getValue();

const screen = (transitionKey: string, easing?: (value: number) => number, duration?: number): React.ReactElement => (
  <ScreenTransition duration={duration} easing={easing} transitionKey={transitionKey}>
    <Text>Screen</Text>
  </ScreenTransition>
);

describe('ScreenTransition', () => {
  let timing: jest.SpyInstance;
  let stop: jest.Mock;
  let start: jest.Mock;

  beforeEach(() => {
    mockReduced = false;
    stop = jest.fn();
    start = jest.fn();
    jest.spyOn(Dimensions, 'get').mockReturnValue(WINDOW);
    timing = jest.spyOn(Animated, 'timing').mockReturnValue({ start, stop, reset: jest.fn() });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('with the first render, does not slide', () => {
    render(screen('/a'));

    expect(timing).not.toHaveBeenCalled();
  });

  it('with a new key, slides from one window width to rest', () => {
    const { rerender } = render(screen('/a'));

    rerender(screen('/b'));

    const [value, config] = timing.mock.calls[0] as [unknown, { toValue: number }];
    expect(valueOf(value)).toBe(WINDOW.width);
    expect(config.toValue).toBe(0);
    expect(start).toHaveBeenCalledTimes(1);
  });

  it('with no options, uses the slow duration and the decelerate curve', () => {
    const { rerender } = render(screen('/a'));

    rerender(screen('/b'));

    expect(timing.mock.calls[0][1]).toMatchObject({ duration: motionDurations.slow, easing: motionEasings.decelerate });
  });

  it('with a duration and an easing, passes both to the slide', () => {
    const duration = 400;
    const easing = Easing.linear;
    const { rerender } = render(screen('/a', easing, duration));

    rerender(screen('/b', easing, duration));

    expect(timing.mock.calls[0][1]).toMatchObject({ duration, easing });
  });

  it('with reduced motion, a new key cuts straight to the content', () => {
    mockReduced = true;
    const { rerender } = render(screen('/a'));

    rerender(screen('/b'));

    expect(timing).not.toHaveBeenCalled();
  });

  it('with reduced motion turned on mid-slide, stops the slide and rests the content', () => {
    const { rerender } = render(screen('/a'));
    rerender(screen('/b'));
    const value = timing.mock.calls[0][0] as unknown;
    mockReduced = true;

    rerender(screen('/b'));

    expect(stop).toHaveBeenCalledTimes(1);
    expect(valueOf(value)).toBe(0);
  });

  it('with a new inline easing mid-slide, keeps the slide running', () => {
    const { rerender } = render(screen('/a', (value) => value));
    rerender(screen('/b', (value) => value));

    rerender(screen('/b', (value) => value));

    expect(stop).not.toHaveBeenCalled();
    expect(timing).toHaveBeenCalledTimes(1);
  });

  it('with a second key mid-slide, stops the first slide and starts again', () => {
    const { rerender } = render(screen('/a'));
    rerender(screen('/b'));

    rerender(screen('/c'));

    expect(stop).toHaveBeenCalledTimes(1);
    expect(timing).toHaveBeenCalledTimes(2);
  });
});

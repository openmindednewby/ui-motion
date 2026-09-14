import { act, render } from '@testing-library/react';
import { Text } from 'react-native';

import { Reorder } from './Reorder';

type LayoutHandler = (event: { nativeEvent: { layout: { x: number; y: number; width: number; height: number } } }) => void;
interface Start { from: { x: number; y: number }; to: unknown; delay: number }

const mockLayoutHandlers = new Map<string, LayoutHandler>();
const mockStarts: Start[] = [];

// Force the native path, capture each item's onLayout prop and every spring started.
jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  const mockReact = jest.requireActual('react');
  const View = mockReact.forwardRef((props: { testID?: string; onLayout?: LayoutHandler }, ref: unknown) => {
    if (props.testID !== undefined && props.onLayout !== undefined) mockLayoutHandlers.set(props.testID, props.onLayout);
    return mockReact.createElement(actual.Animated.View, { ...props, ref });
  });
  const spring = (
    value: { stopAnimation: (cb: (v: { x: number; y: number }) => void) => void },
    config: { toValue: unknown; delay?: number },
  ) => {
    value.stopAnimation((from) => mockStarts.push({ from, to: config.toValue, delay: config.delay ?? 0 }));
    return { start: () => undefined, stop: () => undefined, reset: () => undefined };
  };
  return { ...actual, Platform: { ...actual.Platform, OS: 'ios' }, Animated: { ...actual.Animated, View, spring } };
});

const frames: FrameRequestCallback[] = [];
beforeEach(() => {
  frames.length = 0;
  mockStarts.length = 0;
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    frames.push(cb);
    return frames.length;
  });
});
afterEach(() => jest.restoreAllMocks());

const list = (keys: readonly string[]) => (
  <Reorder itemKeys={keys} spring={{ stiffness: 300, damping: 30 }}>
    {(key) => <Text>{key}</Text>}
  </Reorder>
);
const layout = (key: string, y: number) =>
  act(() => mockLayoutHandlers.get(`reorder-item-${key}`)?.({ nativeEvent: { layout: { x: 0, y, width: 10, height: 10 } } }));
const flushFrames = () => act(() => frames.splice(0).forEach((cb) => cb(0)));

const mountAndReorder = (rerenderTo: readonly string[]) => {
  const { rerender } = render(list(['a', 'b']));
  layout('a', 0);
  layout('b', 100);
  flushFrames();
  expect(mockStarts).toEqual([]);
  rerender(list(rerenderTo));
  layout('b', 0);
  layout('a', 100);
  expect(frames).toHaveLength(1);
  flushFrames();
};

describe('Reorder (native path: onLayout + one frame)', () => {
  it('springs each moved item to 0 from its computed invert once the new slots are reported', () => {
    mountAndReorder(['b', 'a']);
    expect(mockStarts).toEqual([
      { from: { x: 0, y: 100 }, to: { x: 0, y: 0 }, delay: 0 },
      { from: { x: 0, y: -100 }, to: { x: 0, y: 0 }, delay: 18 },
    ]);
  });

  it('clears the snapshot after playing, so a later layout event does not replay', () => {
    mountAndReorder(['b', 'a']);
    mockStarts.length = 0;
    layout('a', 150);
    expect(frames).toHaveLength(0);
    expect(mockStarts).toEqual([]);
  });
});

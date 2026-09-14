import { act, render } from '@testing-library/react';
import { Animated, Text } from 'react-native';

import { Reorder } from './Reorder';

const SPRING = { stiffness: 300, damping: 30 };
const ROW_PX = 100;

interface Start { dy: number; delay: number }

// jsdom has no layout: give each item a slot from its DOM index, as a real list would.
const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetTop');
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
    configurable: true,
    get(this: HTMLElement) {
      return this.parentElement === null ? 0 : [...this.parentElement.children].indexOf(this) * ROW_PX;
    },
  });
});
afterAll(() => {
  if (original !== undefined) Object.defineProperty(HTMLElement.prototype, 'offsetTop', original);
});

// Record the offset each spring starts from (read synchronously at start = before paint).
let starts: Start[] = [];
beforeEach(() => {
  starts = [];
  jest.spyOn(Animated, 'spring').mockImplementation((value, config) => {
    (value as Animated.ValueXY).stopAnimation((from: { x: number; y: number }) => starts.push({ dy: from.y, delay: config.delay ?? 0 }));
    return { start: jest.fn(), stop: jest.fn(), reset: jest.fn() };
  });
});
afterEach(() => jest.restoreAllMocks());

const list = (keys: readonly string[], cap?: number) => (
  <Reorder itemKeys={keys} spring={SPRING} cap={cap}>
    {(key) => <Text testID={`label-${key}`}>{key}</Text>}
  </Reorder>
);

describe('Reorder (web path: synchronous DOM measurement)', () => {
  it('follows a re-ranked key order and drops removed keys', () => {
    const { rerender, queryByTestId, container } = render(list(['a', 'b', 'c']));
    rerender(list(['c', 'a']));
    const ids = [...container.querySelectorAll('[data-testid^="reorder-item-"]')].map((n) => n.getAttribute('data-testid'));
    expect(ids).toEqual(['reorder-item-c', 'reorder-item-a']);
    expect(queryByTestId('label-b')).toBeNull();
  });

  it('inverts a same-size re-rank inside the commit and springs it to 0, staggered in new order', () => {
    const { rerender } = render(list(['a', 'b', 'c']));
    expect(starts).toEqual([]);
    act(() => rerender(list(['c', 'a', 'b'])));
    expect(starts).toEqual([
      { dy: 200, delay: 0 },
      { dy: -100, delay: 18 },
      { dy: -100, delay: 36 },
    ]);
  });

  it('snaps moved items past the cap instead of springing them', () => {
    const { rerender } = render(list(['a', 'b', 'c'], 1));
    act(() => rerender(list(['c', 'a', 'b'], 1)));
    expect(starts).toEqual([{ dy: 200, delay: 0 }]);
  });
});

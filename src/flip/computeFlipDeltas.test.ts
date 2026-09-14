import { computeFlipDeltas } from './computeFlipDeltas';

const map = (e: Array<[string, number, number]>) => new Map(e.map(([k, x, y]) => [k, { x, y }]));

describe('computeFlipDeltas', () => {
  it('returns the inverse offset for every moved item, stagger in new order', () => {
    const prev = map([['a', 0, 0], ['b', 0, 100], ['c', 0, 200]]);
    const next = map([['b', 0, 0], ['a', 0, 100], ['c', 0, 200]]);
    expect(computeFlipDeltas(prev, next, { staggerMs: 18, cap: 8 })).toEqual([
      { key: 'b', dx: 0, dy: 100, delayMs: 0 },
      { key: 'a', dx: 0, dy: -100, delayMs: 18 },
    ]);
  });

  it('ignores items that did not move or are new', () => {
    const prev = map([['a', 0, 0]]);
    const next = map([['a', 0, 0], ['z', 0, 100]]);
    expect(computeFlipDeltas(prev, next, { staggerMs: 18, cap: 8 })).toEqual([]);
  });

  it('caps animated items; the rest snap (delta omitted)', () => {
    const prev = map(Array.from({ length: 12 }, (_, i) => [`k${i}`, 0, i * 10] as [string, number, number]));
    const next = map(Array.from({ length: 12 }, (_, i) => [`k${i}`, 0, (11 - i) * 10] as [string, number, number]));
    expect(computeFlipDeltas(prev, next, { staggerMs: 18, cap: 8 })).toHaveLength(8);
  });

  it('orders a grid row-first (y, then x) and carries horizontal offsets', () => {
    const prev = map([['a', 0, 0], ['b', 100, 0]]);
    const next = map([['b', 0, 0], ['a', 100, 0]]);
    expect(computeFlipDeltas(prev, next, { staggerMs: 10, cap: 8 })).toEqual([
      { key: 'b', dx: 100, dy: 0, delayMs: 0 },
      { key: 'a', dx: -100, dy: 0, delayMs: 10 },
    ]);
  });
});

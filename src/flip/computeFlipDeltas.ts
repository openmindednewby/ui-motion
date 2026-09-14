/**
 * computeFlipDeltas — the FLIP "invert" step, kept pure so it can be unit-tested
 * without driving RN `Animated` or a layout pass.
 *
 * Given every item's slot BEFORE and AFTER a reorder, it returns, for each item that
 * moved, the offset it must start from so it visually sits in its old slot — the
 * caller then springs that offset to 0 ("play"). Items are staggered in their NEW
 * reading order (row-first: y, then x). New items (no previous slot) and items that
 * did not move are omitted. Past `cap` animated items the rest are omitted too, so
 * they snap straight to their new slot — a long list does not play a long wave.
 */
export interface LayoutBox {
  x: number;
  y: number;
}

export interface FlipDelta {
  key: string;
  dx: number;
  dy: number;
  delayMs: number;
}

export interface FlipOptions {
  /** Delay (ms) added per animated item, in new reading order. */
  staggerMs: number;
  /** Maximum number of items that animate; the rest snap. */
  cap: number;
}

export function computeFlipDeltas(
  prev: ReadonlyMap<string, LayoutBox>,
  next: ReadonlyMap<string, LayoutBox>,
  opts: FlipOptions,
): FlipDelta[] {
  const ordered = [...next.entries()].sort(([, a], [, b]) => a.y - b.y || a.x - b.x);
  const moved: FlipDelta[] = [];
  for (const [key, box] of ordered) {
    if (moved.length >= opts.cap) break;
    const before = prev.get(key);
    if (before === undefined) continue;
    const dx = before.x - box.x;
    const dy = before.y - box.y;
    if (dx === 0 && dy === 0) continue;
    moved.push({ key, dx, dy, delayMs: moved.length * opts.staggerMs });
  }
  return moved;
}

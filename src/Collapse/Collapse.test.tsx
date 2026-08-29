import { render, screen } from '@testing-library/react';
import { Text } from 'react-native';

import { Collapse } from './Collapse';

let mockReduced = false;
jest.mock('@dloizides/rn-web-hooks', () => ({
  useReducedMotion: (): boolean => mockReduced,
}));

describe('Collapse', () => {
  beforeEach(() => {
    mockReduced = false;
  });

  it('keeps children mounted when open', () => {
    render(
      <Collapse open testID="collapse">
        <Text>Body</Text>
      </Collapse>,
    );
    expect(screen.getByText('Body')).toBeTruthy();
  });

  it('keeps children mounted when CLOSED (content is only clipped, not removed)', () => {
    render(
      <Collapse open={false} testID="collapse">
        <Text>Body</Text>
      </Collapse>,
    );
    // Children remain in the tree so their state survives open/close and a consumer's
    // `aria-controls` still resolves. MOUNTED IS NOT EXPOSED — see the hidden-when-closed
    // describe block below for what a closed region must NOT do.
    expect(screen.getByText('Body')).toBeTruthy();
  });

  it('exposes its testID', () => {
    render(
      <Collapse open testID="my-collapse">
        <Text>Body</Text>
      </Collapse>,
    );
    expect(screen.getByTestId('my-collapse')).toBeTruthy();
  });

  it('falls back to the default testID', () => {
    render(
      <Collapse open>
        <Text>Body</Text>
      </Collapse>,
    );
    expect(screen.getByTestId('collapse')).toBeTruthy();
  });

  it('renders under reduced-motion without error', () => {
    mockReduced = true;
    render(
      <Collapse open testID="collapse">
        <Text>Body</Text>
      </Collapse>,
    );
    expect(screen.getByText('Body')).toBeTruthy();
  });
});

/**
 * A collapsed region must be CLOSED, not merely clipped. `overflow: hidden` + `height: 0` leaves the
 * child with its own non-empty box, so it stayed focusable by Tab, announced by screen readers, and
 * reported VISIBLE by Playwright while the owning header said `aria-expanded="false"`.
 */
describe('Collapse — a settled-closed region is hidden, not just clipped', () => {
  const hiddenAttrs = (testID: string): Record<string, string | null> => {
    const node = screen.getByTestId(testID);
    return {
      ariaHidden: node.getAttribute('aria-hidden'),
      visibility: window.getComputedStyle(node).visibility,
    };
  };

  it('hides a region that mounts closed', () => {
    render(
      <Collapse open={false} testID="collapse">
        <Text>Body</Text>
      </Collapse>,
    );

    // No animation is involved here: closed-at-mount is settled from the first frame.
    expect(hiddenAttrs('collapse')).toEqual({ ariaHidden: 'true', visibility: 'hidden' });
  });

  it('leaves an open region exposed', () => {
    render(
      <Collapse open testID="collapse">
        <Text>Body</Text>
      </Collapse>,
    );

    expect(screen.getByTestId('collapse').getAttribute('aria-hidden')).toBeNull();
    expect(window.getComputedStyle(screen.getByTestId('collapse')).visibility).not.toBe('hidden');
  });

  it('hides a region that CLOSES before it has ever been measured', () => {
    // jsdom has no `ResizeObserver`, so `onLayout` never fires and `measured` stays null — the
    // same pre-layout window a browser has before first paint. With no height to animate from the
    // close is instant, so it must hide immediately. The first version of the fix got exactly this
    // wrong: the settle sat behind an early return keyed on the MEASUREMENT, so a region that
    // closed here stayed exposed forever. The animated path's own rule is unreachable from the DOM
    // for the same reason, and is proved directly as `collapseSettlesClosed` in motionUtils.test.
    const { rerender } = render(
      <Collapse open testID="collapse">
        <Text>Body</Text>
      </Collapse>,
    );
    expect(screen.getByTestId('collapse').getAttribute('aria-hidden')).toBeNull();

    rerender(
      <Collapse open={false} testID="collapse">
        <Text>Body</Text>
      </Collapse>,
    );

    expect(hiddenAttrs('collapse')).toEqual({ ariaHidden: 'true', visibility: 'hidden' });
  });

  it('re-exposes the content the instant it starts opening, not when the expand finishes', () => {
    const { rerender } = render(
      <Collapse open={false} testID="collapse">
        <Text>Body</Text>
      </Collapse>,
    );
    expect(screen.getByTestId('collapse').getAttribute('aria-hidden')).toBe('true');

    rerender(
      <Collapse open testID="collapse">
        <Text>Body</Text>
      </Collapse>,
    );

    // Waiting for the expand animation would leave the content unreachable for its whole duration.
    expect(screen.getByTestId('collapse').getAttribute('aria-hidden')).toBeNull();
  });
});

import { render, screen } from '@testing-library/react';

import { Skeleton } from './Skeleton';

let mockReduced = false;
jest.mock('@dloizides/rn-web-hooks', () => ({
  useReducedMotion: (): boolean => mockReduced,
}));

describe('Skeleton', () => {
  beforeEach(() => {
    mockReduced = false;
  });

  it('renders the block with its testID', () => {
    render(<Skeleton testID="sk" />);
    expect(screen.getByTestId('sk')).toBeTruthy();
  });

  it('falls back to the default testID', () => {
    render(<Skeleton />);
    expect(screen.getByTestId('skeleton')).toBeTruthy();
  });

  it('renders with explicit dimensions without error', () => {
    render(<Skeleton height={40} testID="sk" width={200} />);
    expect(screen.getByTestId('sk')).toBeTruthy();
  });

  it('renders under reduced-motion (static block, no shimmer loop)', () => {
    mockReduced = true;
    render(<Skeleton testID="sk" />);
    expect(screen.getByTestId('sk')).toBeTruthy();
  });
});

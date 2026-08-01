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
    // Children remain in the tree so their state is preserved and a11y still reaches them.
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

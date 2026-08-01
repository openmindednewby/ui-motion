import { render, screen } from '@testing-library/react';
import { Text } from 'react-native';

import { FadeIn } from './FadeIn';

let mockReduced = false;
jest.mock('@dloizides/rn-web-hooks', () => ({
  useReducedMotion: (): boolean => mockReduced,
}));

describe('FadeIn', () => {
  beforeEach(() => {
    mockReduced = false;
  });

  it('renders its children', () => {
    render(
      <FadeIn testID="fade">
        <Text>Content</Text>
      </FadeIn>,
    );
    expect(screen.getByText('Content')).toBeTruthy();
  });

  it('exposes its testID (and the default)', () => {
    render(
      <FadeIn>
        <Text>Content</Text>
      </FadeIn>,
    );
    expect(screen.getByTestId('fade-in')).toBeTruthy();
  });

  it('renders children immediately under reduced-motion (no fade)', () => {
    mockReduced = true;
    render(
      <FadeIn testID="fade">
        <Text>Content</Text>
      </FadeIn>,
    );
    expect(screen.getByText('Content')).toBeTruthy();
  });

  it('renders with translateY disabled (pure fade)', () => {
    render(
      <FadeIn testID="fade" translateY={0}>
        <Text>Content</Text>
      </FadeIn>,
    );
    expect(screen.getByTestId('fade')).toBeTruthy();
  });
});

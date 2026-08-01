import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import { Text } from 'react-native';

import { PressableScale } from './PressableScale';

let mockReduced = false;
jest.mock('@dloizides/rn-web-hooks', () => ({
  useReducedMotion: (): boolean => mockReduced,
}));

const a11y = {
  accessibilityLabel: 'Save',
  accessibilityHint: 'Saves the form',
};

describe('PressableScale', () => {
  beforeEach(() => {
    mockReduced = false;
  });

  it('fires onPress on click', () => {
    const onPress = jest.fn();
    render(
      <PressableScale testID="scale-btn" onPress={onPress} {...a11y}>
        <Text>Save</Text>
      </PressableScale>,
    );
    fireEvent.click(screen.getByTestId('scale-btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('forwards its own testID (falls back to the default when omitted)', () => {
    render(
      <PressableScale onPress={jest.fn()} {...a11y}>
        <Text>Save</Text>
      </PressableScale>,
    );
    expect(screen.getByTestId('pressable-scale')).toBeTruthy();
  });

  it('renders children content passed as a node', () => {
    render(
      <PressableScale testID="scale-btn" onPress={jest.fn()} {...a11y}>
        <Text>Hello</Text>
      </PressableScale>,
    );
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('supports children as a render function (Pressable state)', () => {
    render(
      <PressableScale testID="scale-btn" onPress={jest.fn()} {...a11y}>
        {(state): React.ReactNode => <Text>{state.pressed ? 'down' : 'up'}</Text>}
      </PressableScale>,
    );
    expect(screen.getByText('up')).toBeTruthy();
  });

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    render(
      <PressableScale disabled testID="scale-btn" onPress={onPress} {...a11y}>
        <Text>Save</Text>
      </PressableScale>,
    );
    fireEvent.click(screen.getByTestId('scale-btn'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('forwards accessibility props to the underlying Pressable', () => {
    render(
      <PressableScale testID="scale-btn" onPress={jest.fn()} {...a11y}>
        <Text>Save</Text>
      </PressableScale>,
    );
    const btn = screen.getByTestId('scale-btn');
    expect(btn.getAttribute('aria-label')).toBe('Save');
  });

  it('still fires onPress under reduced-motion (no scale, same behaviour)', () => {
    mockReduced = true;
    const onPress = jest.fn();
    render(
      <PressableScale testID="scale-btn" onPress={onPress} {...a11y}>
        <Text>Save</Text>
      </PressableScale>,
    );
    fireEvent.click(screen.getByTestId('scale-btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

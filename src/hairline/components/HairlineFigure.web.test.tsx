import { render } from '@testing-library/react';

import { EREVNA_TOKENS } from '@dloizides/design-tokens';

import { HairlineFigureName } from '../HairlineFigureName';
import { HAIRLINE_TEST_ID } from '../constants';
import { HairlineFigure } from './HairlineFigure.web';

const mockDestroy = jest.fn();
const mockUpdate = jest.fn();
const mockMountVault = jest.fn((_el: HTMLElement, _options: unknown) => ({ destroy: mockDestroy, update: mockUpdate }));
const mockMountTerrain = jest.fn((_el: HTMLElement, _options: unknown) => ({ destroy: mockDestroy, update: mockUpdate }));

jest.mock('@lucasmarkes/hairline', () => ({
  vault: (el: HTMLElement, options: unknown) => mockMountVault(el, options),
  terrain: (el: HTMLElement, options: unknown) => mockMountTerrain(el, options),
}));

const colors = EREVNA_TOKENS.dark;

beforeEach(() => jest.clearAllMocks());

describe('HairlineFigure (web)', () => {
  it('on mount, hands the host DOM node and the options to the named figure', () => {
    const props = { figure: HairlineFigureName.Vault, colors, intensity: 0.7, label: 'Vault' };

    const { getByTestId } = render(<HairlineFigure {...props} />);

    expect(mockMountVault).toHaveBeenCalledWith(getByTestId(HAIRLINE_TEST_ID), { intensity: 0.7, label: 'Vault' });
  });

  it('on mount, sets the token-mapped plate var on the host node', () => {
    const props = { figure: HairlineFigureName.Vault, colors };

    const { getByTestId } = render(<HairlineFigure {...props} />);

    expect(getByTestId(HAIRLINE_TEST_ID).style.getPropertyValue('--hairline-plate')).toBe(colors.background);
  });

  it('on unmount, destroys the figure', () => {
    const { unmount } = render(<HairlineFigure figure={HairlineFigureName.Vault} colors={colors} />);

    unmount();

    expect(mockDestroy).toHaveBeenCalledTimes(1);
  });

  it('with a new intensity, updates the running figure instead of remounting it', () => {
    const { rerender } = render(<HairlineFigure figure={HairlineFigureName.Vault} colors={colors} intensity={0.2} />);

    rerender(<HairlineFigure figure={HairlineFigureName.Vault} colors={colors} intensity={0.9} />);

    expect(mockMountVault).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenLastCalledWith({ intensity: 0.9, label: undefined });
  });

  it('with a new figure, destroys the old one and mounts the new one', () => {
    const { rerender } = render(<HairlineFigure figure={HairlineFigureName.Vault} colors={colors} />);

    rerender(<HairlineFigure figure={HairlineFigureName.Terrain} colors={colors} />);

    expect(mockDestroy).toHaveBeenCalledTimes(1);
    expect(mockMountTerrain).toHaveBeenCalledTimes(1);
  });
});

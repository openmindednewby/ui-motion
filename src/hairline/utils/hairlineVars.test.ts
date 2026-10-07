import type { ModeColors } from '@dloizides/design-tokens';
import { EREVNA_TOKENS } from '@dloizides/design-tokens';

import { hairlineVars } from './hairlineVars';

const base: ModeColors = EREVNA_TOKENS.dark;

describe('hairlineVars', () => {
  it('with a full mode palette, maps plate to the background so plates hide what is behind them', () => {
    const colors: ModeColors = { ...base, textTertiary: base.textSecondary };

    const vars = hairlineVars(colors);

    expect(vars).toEqual({
      '--hairline-plate': colors.background,
      '--hairline-hi': colors.text,
      '--hairline-edge': colors.textSecondary,
      '--hairline-mid': colors.textSecondary,
      '--hairline-lo': colors.divider,
    });
  });

  it('without a tertiary text token, falls back to the border token for mid strokes', () => {
    const colors: ModeColors = { ...base, textTertiary: undefined };

    const vars = hairlineVars(colors);

    expect(vars['--hairline-mid']).toBe(colors.border);
  });

  it('with any preset, emits exactly the five colour vars and never the stroke width', () => {
    const colors = EREVNA_TOKENS.light;

    const names = Object.keys(hairlineVars(colors));

    expect(names).toEqual(['--hairline-plate', '--hairline-hi', '--hairline-edge', '--hairline-mid', '--hairline-lo']);
  });
});

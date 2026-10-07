import type { ModeColors } from '@dloizides/design-tokens';

import type { HairlineVars } from '../types';

/** Maps one theme mode's colour tokens onto the hairline palette vars (stroke width stays upstream). */
export const hairlineVars = (colors: ModeColors): HairlineVars => ({
  '--hairline-plate': colors.background,
  '--hairline-hi': colors.text,
  '--hairline-edge': colors.textSecondary,
  '--hairline-mid': colors.textTertiary !== undefined ? colors.textTertiary : colors.border,
  '--hairline-lo': colors.divider,
});

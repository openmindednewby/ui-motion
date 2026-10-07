import type { ModeColors } from '@dloizides/design-tokens';

import { HairlineVarName } from '../HairlineVarName';
import type { HairlineVars } from '../types';

/** Maps one theme mode's colour tokens onto the hairline palette vars (stroke width stays upstream). */
export const hairlineVars = (colors: ModeColors): HairlineVars => ({
  [HairlineVarName.Plate]: colors.background,
  [HairlineVarName.Hi]: colors.text,
  [HairlineVarName.Edge]: colors.textSecondary,
  [HairlineVarName.Mid]: colors.textTertiary !== undefined ? colors.textTertiary : colors.border,
  [HairlineVarName.Lo]: colors.divider,
});

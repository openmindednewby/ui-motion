import type { ModeColors } from '@dloizides/design-tokens';

import type { HairlineFigureName } from './HairlineFigureName';
import type { HairlineVarName } from './HairlineVarName';

export interface HairlineFigureProps {
  /** Which upstream figure to draw. */
  figure: HairlineFigureName;
  /** Mode colours of the current theme; mapped onto the `--hairline-*` vars. */
  colors: ModeColors;
  /** Pointer response strength, 0 (subtle) to 1 (strong). */
  intensity?: number;
  /** Accessible name of the figure (pass a translated string). */
  label?: string;
  testID?: string;
}

export type HairlineVars = Record<HairlineVarName, string>;

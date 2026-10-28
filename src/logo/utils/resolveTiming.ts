import { DEFAULT_MOTION } from '@dloizides/design-tokens';

import { DEFAULT_LOGO_EASING } from '../constants';
import type { LogoDurationToken, LogoEasingToken } from '../types';

/** A duration token (`fast`, `base`, `slow`, `instant`) to ms; a number passes through. */
export function resolveDuration(duration: LogoDurationToken | number): number {
  if (typeof duration === 'number') return duration;
  const ms = DEFAULT_MOTION.durations[duration] as number | undefined;
  if (ms === undefined) throw new Error(`Unknown motion duration token: ${String(duration)}`);
  return ms;
}

/** An easing token to its css timing function; no token means `standard`. */
export function resolveEasing(easing: LogoEasingToken | undefined): string {
  const name = easing ?? DEFAULT_LOGO_EASING;
  const token = DEFAULT_MOTION.easings[name] as { css: string } | undefined;
  if (token === undefined) throw new Error(`Unknown motion easing token: ${String(name)}`);
  return token.css;
}

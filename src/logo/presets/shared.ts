import { LogoLayer } from '../LogoLayer';
import type { LogoBeat } from '../types';

export const PART_LAYERS: readonly LogoLayer[] = [LogoLayer.Part1, LogoLayer.Part2, LogoLayer.Part3];

export const ACCENT_COLOUR = 'var(--logo-accent, currentColor)';

const PULSE_PEAK_OFFSET = 0.5;

/** A beat that leaves the still, reaches `peak` halfway, and returns to the still. */
export function pulseBeat(layer: LogoLayer, peak: Keyframe, timing: Pick<LogoBeat, 'duration' | 'delay' | 'required'>): LogoBeat {
  return { ...timing, layer, keyframes: [{ offset: 0 }, { ...peak, offset: PULSE_PEAK_OFFSET }, { offset: 1 }] };
}

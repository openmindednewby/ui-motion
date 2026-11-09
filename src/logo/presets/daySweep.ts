import { LogoLayer } from '../LogoLayer';
import type { LogoBeat, LogoPresetCuts } from '../types';
import { ACCENT_COLOUR, PART_LAYERS, pulseBeat } from './shared';

const GHOST_OPACITY = 0.3;
const GHOST_IN_MS = 140;
const GHOST_OUT_MS = 880;
const SWEEP_START_MS = 100;
const SWEEP_MS = 840;
const SWEEP_END_MS = SWEEP_START_MS + SWEEP_MS;

const PART_REACH_MS = [360, 480, 600];
const CATCH_MS = 260;
const CATCH_LIT_OFFSET = 0.35;

const MICRO_EMBLEM_MS = 220;
const MICRO_EMBLEM_FILL_OPACITY = 0.6;
const MICRO_PART_MS = 180;
const MICRO_PART_STAGGER_MS = 40;

const ghost: LogoBeat = {
  layer: LogoLayer.Ghost,
  keyframes: [
    { opacity: 0, offset: 0 },
    { opacity: GHOST_OPACITY, offset: GHOST_IN_MS / SWEEP_END_MS },
    { opacity: GHOST_OPACITY, offset: GHOST_OUT_MS / SWEEP_END_MS },
    { opacity: 0, offset: 1 },
  ],
  duration: SWEEP_END_MS,
};

const sweep: LogoBeat = {
  layer: LogoLayer.Emblem,
  keyframes: [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }],
  duration: SWEEP_MS,
  delay: SWEEP_START_MS,
  required: true,
};

const catchLight = (layer: LogoLayer, index: number): LogoBeat => ({
  layer,
  keyframes: [
    { fill: ACCENT_COLOUR, opacity: 0, offset: 0 },
    { fill: ACCENT_COLOUR, opacity: 1, offset: CATCH_LIT_OFFSET },
    { offset: 1 },
  ],
  duration: CATCH_MS,
  delay: PART_REACH_MS[index] ?? 0,
});

const microCatch = (layer: LogoLayer, index: number): LogoBeat =>
  pulseBeat(layer, { fill: ACCENT_COLOUR }, { duration: MICRO_PART_MS, delay: (index + 1) * MICRO_PART_STAGGER_MS });

export const daySweep: LogoPresetCuts = {
  intro: [sweep, ghost, ...PART_LAYERS.map(catchLight)],
  micro: [
    pulseBeat(LogoLayer.Emblem, { fillOpacity: MICRO_EMBLEM_FILL_OPACITY }, { duration: MICRO_EMBLEM_MS, required: true }),
    ...PART_LAYERS.map(microCatch),
  ],
};

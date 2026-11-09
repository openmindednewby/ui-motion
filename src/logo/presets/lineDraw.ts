import { LogoLayer } from '../LogoLayer';
import type { LogoBeat, LogoPresetCuts } from '../types';
import { PART_LAYERS, pulseBeat } from './shared';

const LINE_COLOUR = 'var(--logo-line, currentColor)';
const LINE_WIDTH = 'var(--logo-line-width, 1.5px)';
const NO_LINE_WIDTH = '0px';
const FULL_DASH = '1';

const TRACE_MS = 360;
const TRACE_STAGGER_MS = 120;
const FLOOD_START_MS = 560;
const FLOOD_MS = 320;
const FLOOD_STAGGER_MS = 80;
const MICRO_MS = 180;
const MICRO_STAGGER_MS = 40;
const MICRO_FILL_OPACITY = 0.72;

const LAYERS: readonly LogoLayer[] = [LogoLayer.Emblem, ...PART_LAYERS];

const isNeeded = (layer: LogoLayer): boolean => layer === LogoLayer.Emblem;

const trace = (layer: LogoLayer, index: number): LogoBeat => ({
  layer,
  keyframes: [
    { stroke: LINE_COLOUR, strokeDasharray: FULL_DASH, strokeDashoffset: 1 },
    { stroke: LINE_COLOUR, strokeDasharray: FULL_DASH, strokeDashoffset: 0 },
  ],
  duration: TRACE_MS,
  easing: isNeeded(layer) ? 'decelerate' : 'standard',
  delay: index * TRACE_STAGGER_MS,
  required: isNeeded(layer),
});

const flood = (layer: LogoLayer, index: number): LogoBeat => ({
  layer,
  keyframes: [
    { fillOpacity: 0, strokeWidth: LINE_WIDTH },
    { fillOpacity: 1, strokeWidth: NO_LINE_WIDTH },
  ],
  duration: FLOOD_MS,
  easing: 'standard',
  delay: FLOOD_START_MS + index * FLOOD_STAGGER_MS,
  required: isNeeded(layer),
});

const inkDip = (layer: LogoLayer, index: number): LogoBeat =>
  pulseBeat(layer, { fillOpacity: MICRO_FILL_OPACITY }, {
    duration: MICRO_MS,
    delay: index * MICRO_STAGGER_MS,
    required: isNeeded(layer),
  });

export const lineDraw: LogoPresetCuts = {
  intro: [...LAYERS.map(trace), ...LAYERS.map(flood)],
  micro: LAYERS.map(inkDip),
};

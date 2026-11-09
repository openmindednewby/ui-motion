import { LogoCut } from '../LogoCut';
import { LogoPresetName } from '../LogoPresetName';
import { daySweep } from '../presets/daySweep';
import { fold } from '../presets/fold';
import { lineDraw } from '../presets/lineDraw';
import { orbitLock } from '../presets/orbitLock';
import type { LogoPresetCuts, LogoPresetOptions, LogoTimeline } from '../types';
import { stingCut } from './stingCut';

const PRESETS = new Map<string, LogoPresetCuts>([
  [LogoPresetName.LineDraw, lineDraw],
  [LogoPresetName.DaySweep, daySweep],
  [LogoPresetName.OrbitLock, orbitLock],
  [LogoPresetName.Fold, fold],
]);

/** Every preset name, default first. */
export const LOGO_PRESET_NAMES: readonly LogoPresetName[] = [
  LogoPresetName.LineDraw,
  LogoPresetName.DaySweep,
  LogoPresetName.OrbitLock,
  LogoPresetName.Fold,
];

/** Builds a named logo timeline for `playLogo`; an unknown name returns the line-draw default. */
export function logoPreset(name?: string, options: LogoPresetOptions = {}): LogoTimeline {
  const preset = PRESETS.get(name ?? '') ?? lineDraw;
  if (options.cut === LogoCut.Micro) return preset.micro;
  if (options.cut === LogoCut.Sting) return stingCut(preset.intro);
  return preset.intro;
}

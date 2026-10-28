import { MicroTrigger } from '../MicroTrigger';
import type { BindMicroOptions, LogoPlayback, LogoTimeline } from '../types';
import { prefersReducedMotion } from './layers';
import { playLogo } from './playLogo';

const START_EVENT: Record<string, string | undefined> = {
  [MicroTrigger.Hover]: 'pointerenter',
  [MicroTrigger.Focus]: 'focusin',
};

const STOP_EVENT: Record<string, string | undefined> = {
  [MicroTrigger.Hover]: 'pointerleave',
  [MicroTrigger.Focus]: 'focusout',
};

const noop = (): void => undefined;

/** Binds a micro-animation to hover, focus or loading; returns the unbind function. */
export function bindMicro(
  svg: Element,
  timeline: LogoTimeline,
  trigger: MicroTrigger | `${MicroTrigger}`,
  options: BindMicroOptions = {},
): () => void {
  if (options.reducedMotion ?? prefersReducedMotion()) return noop;
  let playback: LogoPlayback | undefined;
  const stop = (): void => {
    playback?.cancel();
    playback = undefined;
  };
  if (trigger === MicroTrigger.Loading) {
    playback = playLogo(svg, timeline, { reducedMotion: false, iterations: Infinity });
    return stop;
  }
  const start = (): void => {
    stop();
    playback = playLogo(svg, timeline, { reducedMotion: false });
  };
  const startEvent = START_EVENT[trigger] ?? '';
  const stopEvent = STOP_EVENT[trigger] ?? '';
  svg.addEventListener(startEvent, start);
  svg.addEventListener(stopEvent, stop);
  return () => {
    svg.removeEventListener(startEvent, start);
    svg.removeEventListener(stopEvent, stop);
    stop();
  };
}

import type { LogoPlayback, LogoTimeline, PlayLogoOptions } from '../types';
import { applyFinalFrame, findLayers, prefersReducedMotion, supportsWebAnimations } from './layers';
import { resolveDuration, resolveEasing } from './resolveTiming';

const ignoreCancel = (): undefined => undefined;

/** Plays a logo timeline on the mark's `data-motion-layer` nodes via the Web Animations API. */
export function playLogo(svg: Element, timeline: LogoTimeline, options: PlayLogoOptions = {}): LogoPlayback {
  const still = options.reducedMotion ?? prefersReducedMotion();
  const animations: Animation[] = [];
  timeline.forEach((beat) => {
    findLayers(svg, beat.layer).forEach((element) => {
      if (still || !supportsWebAnimations(element)) {
        applyFinalFrame(element, beat.keyframes);
        return;
      }
      animations.push(
        element.animate(beat.keyframes, {
          duration: resolveDuration(beat.duration),
          easing: resolveEasing(beat.easing),
          delay: beat.delay ?? 0,
          fill: 'both',
          iterations: options.iterations ?? 1,
        }),
      );
    });
  });
  const finished = Promise.all(animations.map((animation) => animation.finished.catch(ignoreCancel))).then(ignoreCancel);
  return { finished, cancel: () => animations.forEach((animation) => animation.cancel()) };
}

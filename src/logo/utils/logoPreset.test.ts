import type { LogoBeat, LogoTimeline } from '../types';
import { logoPreset } from './logoPreset';
import { playLogo } from './playLogo';
import { resolveDuration } from './resolveTiming';
import { installFakeAnimate, makeSvg, removeFakeAnimate } from './testSvg';

const PRESETS = ['line-draw', 'day-sweep', 'orbit-lock', 'fold'] as const;
const CUTS = ['intro', 'sting', 'micro'] as const;
const DOCUMENTED_LAYERS = ['emblem', 'part-1', 'part-2', 'part-3', 'ghost'];
const FRAME_META_KEYS = ['offset', 'easing', 'composite'];

const markWith = (layers: string[]): string => layers.map((layer) => `<path data-motion-layer="${layer}"/>`).join('');
const endOf = (timeline: LogoTimeline): number =>
  Math.max(...timeline.map((beat) => (beat.delay ?? 0) + resolveDuration(beat.duration)));
const propertiesOf = (beat: LogoBeat): string[] => [
  ...new Set(beat.keyframes.flatMap((frame) => Object.keys(frame)).filter((key) => !FRAME_META_KEYS.includes(key))),
];
const everyCut = PRESETS.flatMap((name) => CUTS.map((cut) => [name, cut] as const));

describe('logoPreset', () => {
  afterEach(removeFakeAnimate);

  it('AC-01 with no name, returns the line-draw intro', () => {
    const name = undefined;

    const timeline = logoPreset(name);

    expect(timeline.length).toBeGreaterThan(0);
    expect(timeline).toEqual(logoPreset('line-draw', { cut: 'intro' }));
  });

  it.each(PRESETS)('AC-02 with %s, uses only documented layer names', (name) => {
    const documented = DOCUMENTED_LAYERS;

    const timeline = logoPreset(name);

    expect(timeline.length).toBeGreaterThan(0);
    expect(timeline.map((beat) => beat.layer).filter((layer) => !documented.includes(layer))).toEqual([]);
  });

  it.each(PRESETS.slice(1))('AC-02 with %s, differs from the default', (name) => {
    const fallback = logoPreset('line-draw');

    const timeline = logoPreset(name);

    expect(timeline.length).toBeGreaterThan(0);
    expect(timeline).not.toEqual(fallback);
  });

  it.each(['unknown', 'constructor', '__proto__', ''])('AC-03 with the unknown name "%s", returns the default', (name) => {
    const fallback = logoPreset('line-draw');

    const timeline = logoPreset(name);

    expect(timeline.length).toBeGreaterThan(0);
    expect(timeline).toEqual(fallback);
  });

  it('AC-03 with an unknown cut, returns the intro', () => {
    const cut = 'trailer' as never;

    const timeline = logoPreset('fold', { cut });

    expect(timeline.length).toBeGreaterThan(0);
    expect(timeline).toEqual(logoPreset('fold', { cut: 'intro' }));
  });

  it.each(PRESETS)('AC-04 with %s and the intro cut, ends within 1.2 s', (name) => {
    const cut = 'intro';

    const end = endOf(logoPreset(name, { cut }));

    expect(end).toBeGreaterThan(0);
    expect(end).toBeLessThanOrEqual(1200);
  });

  it.each(PRESETS)('AC-04 with %s and the sting cut, ends at 3.6 s, within the 4 s limit', (name) => {
    const cut = 'sting';

    const end = endOf(logoPreset(name, { cut }));

    expect(end).toBe(3600);
    expect(end).toBeLessThanOrEqual(4000);
  });

  it.each(PRESETS)('AC-04 with %s and the sting cut, opens with a 300 ms hold', (name) => {
    const cut = 'sting';

    const timeline = logoPreset(name, { cut });

    const moving = timeline.filter((beat) => propertiesOf(beat).length > 0);
    expect(Math.min(...moving.map((beat) => beat.delay ?? 0))).toBeGreaterThanOrEqual(300);
  });

  it.each(PRESETS)('AC-04 with %s and the micro cut, ends within 300 ms', (name) => {
    const cut = 'micro';

    const end = endOf(logoPreset(name, { cut }));

    expect(end).toBeGreaterThan(0);
    expect(end).toBeLessThanOrEqual(300);
  });

  it.each(everyCut)('AC-05 with %s %s and reduced motion, applies the final frame and starts 0 animations', (name, cut) => {
    const { animate } = installFakeAnimate();
    const svg = makeSvg(markWith(DOCUMENTED_LAYERS));
    const timeline = logoPreset(name, { cut });

    playLogo(svg, timeline, { reducedMotion: true });

    expect(timeline.length).toBeGreaterThan(0);
    expect(animate).not.toHaveBeenCalled();
    timeline.forEach((beat) => {
      const last = beat.keyframes[beat.keyframes.length - 1] ?? {};
      const node = svg.querySelector(`[data-motion-layer="${beat.layer}"]`) as SVGElement;
      const style = node.style as unknown as Record<string, string>;
      propertiesOf({ ...beat, keyframes: [last] }).forEach((key) => expect(style[key]).toBe(String(last[key])));
    });
  });

  it.each([
    ['line-draw', 'emblem'],
    ['day-sweep', 'emblem'],
    ['orbit-lock', 'emblem'],
    ['fold', 'part-1'],
    ['fold', 'part-2'],
    ['fold', 'part-3'],
  ])('AC-06 with %s and the mark missing %s, starts 0 animations and does not throw', (name, missing) => {
    const { animate } = installFakeAnimate();
    const svg = makeSvg(markWith(DOCUMENTED_LAYERS.filter((layer) => layer !== missing)));
    const timeline = logoPreset(name);

    const act = (): unknown => playLogo(svg, timeline, { reducedMotion: false });

    expect(act).not.toThrow();
    expect(timeline.some((beat) => beat.layer === missing && beat.required === true)).toBe(true);
    expect(animate).not.toHaveBeenCalled();
  });

  it.each([
    ['line-draw', ['emblem']],
    ['day-sweep', ['emblem']],
    ['orbit-lock', ['emblem']],
    ['fold', ['part-1', 'part-2', 'part-3']],
  ])('AC-06 with %s and only its needed layers, still plays', (name, needed) => {
    const { animate } = installFakeAnimate();
    const svg = makeSvg(markWith(needed as string[]));

    playLogo(svg, logoPreset(name as string), { reducedMotion: false });

    expect(animate).toHaveBeenCalled();
  });

  it('AC-09 with the default preset, animates outlines and fills', () => {
    const name = undefined;

    const properties = logoPreset(name).flatMap(propertiesOf);

    expect(properties).toEqual(expect.arrayContaining(['strokeDashoffset', 'strokeWidth', 'fillOpacity']));
  });

  it.each(everyCut)('AC-09 with %s %s, never animates the CSS d property', (name, cut) => {
    const timeline = logoPreset(name, { cut });

    const properties = timeline.flatMap(propertiesOf);

    expect(timeline.length).toBeGreaterThan(0);
    expect(properties).not.toContain('d');
  });

  it.each(everyCut)('with %s %s, no two beats on a layer animate one property', (name, cut) => {
    const timeline = logoPreset(name, { cut });

    const claims = timeline.flatMap((beat) => propertiesOf(beat).map((key) => `${beat.layer}:${key}`));

    expect(claims.length).toBeGreaterThan(0);
    expect(claims.length).toBe(new Set(claims).size);
  });

  it.each(everyCut)('with %s %s, keyframe offsets are in range and ascending', (name, cut) => {
    const timeline = logoPreset(name, { cut });

    const offsets = timeline.map((beat) => beat.keyframes.flatMap((frame) => (typeof frame.offset === 'number' ? [frame.offset] : [])));

    expect(timeline.length).toBeGreaterThan(0);
    offsets.forEach((list) => {
      expect(list).toEqual([...list].sort((a, b) => a - b));
      expect(list.every((offset) => offset >= 0 && offset <= 1)).toBe(true);
    });
  });
});

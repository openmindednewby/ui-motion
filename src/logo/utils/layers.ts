import { MOTION_LAYER_ATTRIBUTE, REDUCED_MOTION_QUERY } from '../constants';

const FRAME_META_KEYS = new Set(['offset', 'easing', 'composite']);

type StyledElement = Element & ElementCSSInlineStyle;

export function findLayers(root: Element, layer: string): StyledElement[] {
  const selector = `[${MOTION_LAYER_ATTRIBUTE}=${JSON.stringify(layer)}]`;
  const nodes = Array.from(root.querySelectorAll(selector));
  if (root.matches(selector)) nodes.unshift(root);
  return nodes.filter((node): node is StyledElement => 'style' in node);
}

export function applyFinalFrame(element: StyledElement, keyframes: Keyframe[]): void {
  const last = keyframes[keyframes.length - 1];
  if (last === undefined) return;
  const style = element.style as unknown as Record<string, string>;
  Object.entries(last)
    .filter(([key, value]) => !FRAME_META_KEYS.has(key) && value !== null && value !== undefined)
    .forEach(([key, value]) => {
      style[key] = String(value);
    });
}

export function supportsWebAnimations(element: Element): boolean {
  return typeof element.animate === 'function';
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

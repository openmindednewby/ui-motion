import { HAIRLINE_HANDLE_GLOBAL } from '../constants';
import type { HairlineVars } from '../types';

export interface HairlineOptionsInput {
  intensity: number;
  label?: string;
}

export interface HairlineHtmlInput extends HairlineOptionsInput {
  bundle: string;
  figure: string;
  vars: HairlineVars;
}

const UNSAFE_CSS_CHARS = /[;{}<>\\]/g;
const HANDLE = `window[${JSON.stringify(HAIRLINE_HANDLE_GLOBAL)}]`;

const toScriptJson = (value: unknown): string => JSON.stringify(value).replace(/</g, '\\u003c');

const toOptionsJson = ({ intensity, label }: HairlineOptionsInput): string =>
  toScriptJson(label !== undefined ? { intensity, label } : { intensity });

const toCssDeclarations = (vars: HairlineVars): string =>
  Object.entries(vars)
    .map(([name, value]) => `${name}:${value.replace(UNSAFE_CSS_CHARS, '')};`)
    .join('');

/** Builds the self-contained WebView document that mounts one hairline figure. */
export const buildHairlineHtml = ({ bundle, figure, vars, intensity, label }: HairlineHtmlInput): string =>
  [
    '<!doctype html><html><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">',
    `<style>:root{${toCssDeclarations(vars)}}html,body{margin:0;height:100%;overflow:hidden;background:var(--hairline-plate)}#hairline{width:100%;height:100%}</style>`,
    '</head><body><div id="hairline"></div><script>(function(){',
    bundle,
    `var mount=HAIRLINE_FIGURES[${toScriptJson(figure)}];`,
    `if(typeof mount==='function'){${HANDLE}=mount(document.getElementById('hairline'),${toOptionsJson({ intensity, label })});}`,
    '})();</script></body></html>',
  ].join('');

/** Builds the script that pushes new options into the already mounted figure without reloading. */
export const buildHairlineUpdateScript = (options: HairlineOptionsInput): string =>
  `(function(){var h=${HANDLE};if(h&&typeof h.update==='function'){h.update(${toOptionsJson(options)});}})();true;`;

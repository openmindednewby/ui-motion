import type { HairlineVars } from '../types';

export interface HairlineHtmlInput {
  bundle: string;
  figure: string;
  vars: HairlineVars;
  intensity: number;
  label?: string;
}

const UNSAFE_CSS_CHARS = /[;{}<>\\]/g;

const toScriptJson = (value: unknown): string => JSON.stringify(value).replace(/</g, '\\u003c');

const toCssDeclarations = (vars: HairlineVars): string =>
  Object.entries(vars)
    .map(([name, value]) => `${name}:${value.replace(UNSAFE_CSS_CHARS, '')};`)
    .join('');

/** Builds the self-contained WebView document that mounts one hairline figure. */
export const buildHairlineHtml = ({ bundle, figure, vars, intensity, label }: HairlineHtmlInput): string => {
  const options = toScriptJson(label !== undefined ? { intensity, label } : { intensity });
  return [
    '<!doctype html><html><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">',
    `<style>:root{${toCssDeclarations(vars)}}html,body{margin:0;height:100%;overflow:hidden;background:var(--hairline-plate)}#hairline{width:100%;height:100%}</style>`,
    '</head><body><div id="hairline"></div><script>(function(){',
    bundle,
    `var mount=HAIRLINE_FIGURES[${toScriptJson(figure)}];`,
    `if(typeof mount==='function'){mount(document.getElementById('hairline'),${options});}`,
    '})();</script></body></html>',
  ].join('');
};

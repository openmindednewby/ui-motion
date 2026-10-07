import { EREVNA_TOKENS } from '@dloizides/design-tokens';

import { HAIRLINE_HANDLE_GLOBAL } from '../constants';
import { HAIRLINE_BUNDLE } from '../data/hairlineBundle';

import { buildHairlineHtml, buildHairlineUpdateScript } from './buildHairlineHtml';
import { hairlineVars } from './hairlineVars';

const vars = hairlineVars(EREVNA_TOKENS.dark);
const BUNDLE = 'var HAIRLINE_FIGURES = {};';

describe('buildHairlineHtml', () => {
  it('with theme vars, declares every var on the document root', () => {
    const input = { bundle: BUNDLE, figure: 'vault', vars, intensity: 0.5 };

    const html = buildHairlineHtml(input);

    expect(html).toContain(`--hairline-plate:${vars['--hairline-plate']};`);
    expect(html).toContain(`--hairline-lo:${vars['--hairline-lo']};`);
  });

  it('with a label, passes intensity and label to the mount call', () => {
    const input = { bundle: BUNDLE, figure: 'vault', vars, intensity: 0.8, label: 'A vault door' };

    const html = buildHairlineHtml(input);

    expect(html).toContain('HAIRLINE_FIGURES["vault"]');
    expect(html).toContain('{"intensity":0.8,"label":"A vault door"}');
  });

  it('with a label containing a closing script tag, escapes it so the document cannot be broken out of', () => {
    const input = { bundle: BUNDLE, figure: 'vault', vars, intensity: 0.5, label: '</script><b>' };

    const html = buildHairlineHtml(input);

    expect(html.match(/<\/script>/g)).toHaveLength(1);
  });

  it('with a colour value carrying CSS punctuation, strips it so no extra rule can be injected', () => {
    const input = { bundle: BUNDLE, figure: 'vault', vars: { ...vars, '--hairline-hi': 'red;}body{x' }, intensity: 0.5 };

    const html = buildHairlineHtml(input);

    expect(html).toContain('--hairline-hi:redbodyx;');
  });

  it('with the generated upstream bundle, contains exactly one script close and no comment opener', () => {
    const input = { bundle: HAIRLINE_BUNDLE, figure: 'vault', vars, intensity: 0.5 };

    const html = buildHairlineHtml(input);

    expect([html.match(/<\/script/gi)?.length, html.includes('<!--')]).toEqual([1, false]);
  });

  it('with a mounted figure, keeps its handle on the window so later updates can reach it', () => {
    const input = { bundle: BUNDLE, figure: 'vault', vars, intensity: 0.5 };

    const html = buildHairlineHtml(input);

    expect(html).toContain(`window["${HAIRLINE_HANDLE_GLOBAL}"]=mount(`);
  });
});

describe('buildHairlineUpdateScript', () => {
  it('with a new intensity and label, calls update on the stored handle with both', () => {
    const options = { intensity: 0.9, label: 'A vault door' };

    const script = buildHairlineUpdateScript(options);

    expect(script).toContain('h.update({"intensity":0.9,"label":"A vault door"})');
  });

  it('with a label containing a closing script tag, escapes the angle bracket', () => {
    const options = { intensity: 0.5, label: '</script>' };

    const script = buildHairlineUpdateScript(options);

    expect(script).not.toContain('</script>');
  });
});

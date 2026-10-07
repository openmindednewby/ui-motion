import { EREVNA_TOKENS } from '@dloizides/design-tokens';

import { buildHairlineHtml } from './buildHairlineHtml';
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
});

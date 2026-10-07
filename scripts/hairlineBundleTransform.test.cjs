const { toClassicBundle } = require('./hairlineBundleTransform.cjs');

describe('toClassicBundle', () => {
  it('with a trailing export list, turns it into the HAIRLINE_FIGURES map', () => {
    const source = 'function a(){}\nexport { a as vault };';

    const classic = toClassicBundle(source);

    expect(classic).toContain('var HAIRLINE_FIGURES = { a as vault };');
  });

  it('with a closing tag inside a string, escapes it so the inline script cannot be closed early', () => {
    const source = 'var s = "</script>";\nexport { s };';

    const classic = toClassicBundle(source);

    expect(classic).toContain('var s = "<\\/script>";');
  });

  it('with an HTML comment opener, throws instead of emitting a bundle that changes script parsing', () => {
    const source = 'var s = "<!--";\nexport { s };';

    const transform = () => toClassicBundle(source);

    expect(transform).toThrow('<!--');
  });

  it('without a trailing export list, throws', () => {
    const source = 'var s = 1;';

    const transform = () => toClassicBundle(source);

    expect(transform).toThrow('no trailing export list');
  });
});

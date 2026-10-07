const EXPORT_PATTERN = /export\s*\{([^}]*)\};?/;
const FORBIDDEN_SEQUENCES = ['</', '<!--'];

const toClassicBundle = (source) => {
  if (!EXPORT_PATTERN.test(source)) throw new Error('hairline bundle has no trailing export list');
  const classic = source
    .replace(EXPORT_PATTERN, 'var HAIRLINE_FIGURES = {$1};')
    .replace(/\/\/# sourceMappingURL=.*$/m, '')
    .replace(/<\//g, '<\\/');
  const found = FORBIDDEN_SEQUENCES.filter((sequence) => classic.includes(sequence));
  if (found.length > 0) {
    throw new Error(`hairline bundle still contains ${found.join(', ')} and would break out of the inline <script>`);
  }
  return classic;
};

module.exports = { toClassicBundle };

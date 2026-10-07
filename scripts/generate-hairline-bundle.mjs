import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const EXPECTED_VERSION = '0.3.0';
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const pkgJsonPath = require.resolve('@lucasmarkes/hairline/package.json');
const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
if (pkg.version !== EXPECTED_VERSION) {
  throw new Error(`@lucasmarkes/hairline is ${pkg.version}, the wrapper is pinned to ${EXPECTED_VERSION}`);
}
const source = readFileSync(join(dirname(pkgJsonPath), 'dist', 'index.js'), 'utf8');
const exportPattern = /export\s*\{([^}]*)\};?/;
if (!exportPattern.test(source)) throw new Error('hairline bundle has no trailing export list');
const classic = source
  .replace(exportPattern, 'var HAIRLINE_FIGURES = {$1};')
  .replace(/\/\/# sourceMappingURL=.*$/m, '')
  .replace(/<\//g, '<\/');
const out = join(here, '..', 'src', 'hairline', 'data', 'hairlineBundle.ts');
writeFileSync(out, `export const HAIRLINE_VERSION = '${EXPECTED_VERSION}';\nexport const HAIRLINE_BUNDLE = ${JSON.stringify(classic)};\n`);

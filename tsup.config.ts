import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: false,
  treeshake: true,
  minify: false,
  target: 'es2020',
  outDir: 'dist',
  // Keep peers + shared @dloizides deps external so consumers install them once.
  external: ['react', 'react-dom', 'react-native', '@dloizides/design-tokens', '@dloizides/rn-web-hooks'],
});

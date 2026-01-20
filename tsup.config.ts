import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'es2022',

  dts: true,
  sourcemap: true,
  clean: true,

  // Do not bundle dependencies — keep them external
  external: [
    'vite',
    '@realfavicongenerator/generate-favicon',
    '@realfavicongenerator/image-adapter-node',
  ],
})

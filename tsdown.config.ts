import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./plugins/index.ts'],
  format: 'esm',
  outDir: 'dist',
  dts: true,
  clean: true,
})

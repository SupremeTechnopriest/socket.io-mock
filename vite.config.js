/* eslint-env node */
/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { join } from 'path';
import { builtinModules } from 'module';
import dts from 'vite-plugin-dts';
import checker from 'vite-plugin-checker';

const PACKAGE_ROOT = __dirname;

export default defineConfig(() => ({
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
      },
    }),
  ],
  base: '',
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      external: [...builtinModules.flatMap((p) => [p, `node:${p}`])],
    },
    emptyOutDir: true,
    brotliSize: false,
    lib: {
      entry: join(PACKAGE_ROOT, 'src/index.ts'),
      formats: ['es', 'umd'],
      name: 'socket.io-mock',
      fileName: (format) => `index.${format}.js`,
    },
  },
}));

import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
  input: 'lol-counter-scrapper/index.ts',
  output: {
    sourcemap: true,
    dir: 'dist/lol-counter-scrapper',
    format: 'cjs',
  },
  plugins: [
    json(),
    commonjs(),
    nodeResolve({ preferBuiltins: true }),
    typescript(),
  ],
};

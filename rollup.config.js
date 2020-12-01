import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import OMT from "@surma/rollup-plugin-off-main-thread";
import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/web/index.tsx',
  output: {
    dir: 'dist',
    format: 'esm'
  },
  plugins: [
    OMT(),
    resolve({ browser: true }),
    typescript(),
    terser()
  ],
};

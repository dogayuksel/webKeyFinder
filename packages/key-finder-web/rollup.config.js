import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import OMT from '@surma/rollup-plugin-off-main-thread';
import css from 'rollup-plugin-css-only';

export default {
  input: 'src/index.tsx',
  output: {
    dir: 'dist',
    format: 'esm',
  },
  plugins: [
    OMT(),
    resolve({ browser: true }),
    typescript(),
    css({ output: 'index.css' }),
  ],
};

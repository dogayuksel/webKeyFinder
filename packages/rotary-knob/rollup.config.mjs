import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.tsx',
  output: {
    dir: 'dist',
    format: 'esm',
  },
  plugins: [typescript()],
};

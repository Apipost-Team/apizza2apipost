import typescript from 'rollup-plugin-typescript';
import commonjs from 'rollup-plugin-commonjs'
import dts from "rollup-plugin-dts";

export default [{
  name: 'apizza2apipost',
  input: 'src/index.ts',
  output: {
    name: 'apizza2apipost',
    file: 'dist/index.js',
    format: 'cjs'
  },
  plugins: [
    typescript(),
    commonjs(),
  ]
},
{
  input: "src/index.ts",
  output: [{ file: "dist/index.d.ts", format: "es" }],
  plugins: [dts()],
}]


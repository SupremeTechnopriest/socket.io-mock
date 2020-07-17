import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import bundleSize from 'rollup-plugin-bundle-size'
import { terser } from 'rollup-plugin-terser'

const isProd = process.env.NODE_ENV === 'production'
const input = 'src/index.js'
const name = 'SocketMock'
const file = 'index'

const plugins = [
  resolve({
    preferBuiltins: true
  }),
  commonjs({
    ignoreGlobal: true,
    include: 'node_modules/**'
  }),
  bundleSize()
]

export default [{
  input,
  plugins,
  output: {
    name,
    file: `dist/${file}.es.js`,
    format: 'es'
  }
}, {
  input,
  plugins: plugins.concat([
    isProd && terser()
  ]),
  output: {
    name,
    file: `dist/${file}.js`,
    format: 'cjs'
  }
}]

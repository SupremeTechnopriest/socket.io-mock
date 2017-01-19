import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import bundleSize from 'rollup-plugin-bundle-size';
import progress from 'rollup-plugin-progress';

const isProd = process.env.NODE_ENV === 'production';
const file = 'index';

const prodTargets = [
    { dest: 'dist/' + file + '.min.js', format: 'cjs' }
];
const devTargets = [
    { dest: 'dist/' + file + '.js', format: 'es' }
];

export default {
	entry: 'src/index.js',
	moduleName: 'SocketMock',
	external: [ 'debug' ],
	plugins: [
		resolve({
			main: true,
			module: true,
			jsnext: true,
			browser: true,
			preferBuiltins: true
		}),
		commonjs({
			ignoreGlobal: true,
			include: 'node_modules/**'
		}),
		babel({
			babelrc: false,
			presets: [ 'es2015-rollup' ],
			plugins: [
				'transform-object-rest-spread',
				'transform-class-properties',
				'transform-export-extensions'
			]
		}),
        (isProd && uglify()),
		progress(),
		bundleSize()
	],
	targets: isProd ? prodTargets : devTargets
};

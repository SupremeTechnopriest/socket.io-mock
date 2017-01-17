const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

module.exports = function (config) {
	const opts = {

		// Base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',

		// Frameworks to use
		// npmjs.org/browse/keyword/karma-adapter
		frameworks: [ 'mocha', 'chai' ],

		// List of files / patterns to load in the browser
		files: [
			'src/index.js',
			'test/index.js'
		],

		// List of files to exclude
		exclude: [
			'/node_modules/'
		],

		// Preprocess matching files before serving them to the browser
		// npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'src/index.js': [ 'rollup' ],
			'test/index.js': [ 'rollup' ]
		},

		// Rollup
		rollupPreprocessor: {
			plugins: [
				resolve({
					jsnext: true,
					module: true,
					main: true,
					preferBuiltins: true,
					browser: true
				}),
				commonjs({
					include: 'node_modules/**'
				}),
				babel({
					babelrc: false,
					presets: [ 'es2015-rollup' ],
					plugins: [
						'transform-object-rest-spread',
						'transform-class-properties',
						'transform-export-extensions',
						[ '__coverage__', { ignore: [ 'test', 'node_modules' ] } ]
					]
				})
			],
			format: 'iife',
			moduleName: 'utils',
			sourceMap: 'inline'
		},

		// Coverage
		coverageReporter: {
			dir: 'coverage',
			reporters: [
				{ type: 'lcovonly', subdir: '.', file: 'lcov.info' }
			]
		},

		// Test results reporter to use
		// possible values: 'dots', 'progress'
		// npmjs.org/browse/keyword/karma-reporter
		reporters: [ 'mocha', 'coverage' ],

		// Web server port
		port: 9876,

		// Enable / disable colors in the output (reporters and logs)
		colors: true,

		// Level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// Enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,

		// Start these browsers
		// npmjs.org/browse/keyword/karma-launcher
		browsers: [ 'Chrome', 'ChromeCanary' ],

		// Custom launchers
		// for travis ci
		customLaunchers: {
			ChromeTravisCi: {
				base: 'Chrome',
				flags: [ '--no-sandbox' ]
			}
		},

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity

	};

	// Detect Travis
	if (process.env.TRAVIS) {
		opts.browsers = [ 'ChromeTravisCi' ];
	}

	// Set options
	config.set(opts);
};

import typescript from '@rollup/plugin-typescript';
import {terser} from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import prettier from 'rollup-plugin-prettier';

const PREAMBLE=`/**
* mailext-options-sync.js":
* https://gitlab.com/jfx2006/mailext-options-sync
*/
`

const config = {
	input: 'index.ts',
	output: {
		file: 'mailext-options-sync.js',
		format: 'esm'
	},
	plugins: [
		resolve(),
		commonjs(),
		typescript({
			outDir: ".",
			include: ["mail-ext-types.d.ts",
			"globals.d.ts",
			"index.ts"]
		}),
		terser({
			toplevel: true,
			output: {
				comments: true,
				semicolons: false,
				preamble: PREAMBLE
			},
			mangle: false,
			compress: {
				join_vars: false, // eslint-disable-line camelcase
				booleans: false,
				expression: false,
				sequences: false,
				reduce_vars: false,
			}
		}),
		prettier({
			tabwidth: 2,
			singleQuote: false,
			semi: false,
			parser: "babel"
		})
	]
};

export default config;

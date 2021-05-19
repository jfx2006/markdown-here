import typescript from '@rollup/plugin-typescript';
import {terser} from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

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
				beautify: true
			},
			mangle: false,
			compress: {
				join_vars: false, // eslint-disable-line camelcase
				booleans: false,
				expression: false,
				sequences: false
			}
		})
	]
};

export default config;

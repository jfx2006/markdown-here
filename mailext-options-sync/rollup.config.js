import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import prettier from 'rollup-plugin-prettier';
import * as path from "path"

const pwd = process.cwd()
const relpath = path.relative(pwd, import.meta.dirname)

const PREAMBLE = `/**
* mailext-options-sync.js":
* https://gitlab.com/jfx2006/mailext-options-sync
*/
`;

const config = {
	input: path.join(".", relpath, "index.ts"),
	output: {
		file: path.join(".", relpath, "index.js"),
		format: "esm",
	},
	plugins: [
		resolve(),
		commonjs(),
		typescript(),
		terser({
			toplevel: true,
			output: {
				comments: true,
				semicolons: false,
				preamble: PREAMBLE,
			},
			mangle: false,
			compress: {
				join_vars: false, // eslint-disable-line camelcase
				booleans: false,
				expression: false,
				sequences: false,
				reduce_vars: false, // eslint-disable-line camelcase
			},
		}),
		prettier({
			tabwidth: 2,
			singleQuote: false,
			semi: false,
			parser: "babel",
		}),
	],
}

export default config;

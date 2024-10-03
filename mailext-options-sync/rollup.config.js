import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import prettier from 'rollup-plugin-prettier';

const PREAMBLE = `/**
* mailext-options-sync.js":
* https://gitlab.com/jfx2006/mailext-options-sync
*/
`;

const config = {
	input: 'index.ts',
	output: {
		file: 'index.js',
		format: 'esm',
	},
	plugins: [
		resolve(),
		commonjs(),
		typescript({
			outDir: '.',
			include: ['mail-ext-types.d.ts',
				'globals.d.ts',
				'index.ts'],
		}),
		prettier({
			tabwidth: 2,
			singleQuote: false,
			semi: false,
			parser: 'babel',
		}),
	],
};

export default config;

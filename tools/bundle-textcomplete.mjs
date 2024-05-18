import * as esbuild from "esbuild"

let result = await esbuild.build({
  alias: {
    "@textcomplete/core": "./node_modules/@textcomplete/core/src",
    "@textcomplete/contenteditable": "./node_modules/@textcomplete/contenteditable/src",
    "@textcomplete/utils": "./node_modules/@textcomplete/utils/src",
  },
  stdin: {
    contents: `export { Textcomplete } from "@textcomplete/core/index.ts";
export {ContenteditableEditor} from "@textcomplete/contenteditable/index.ts";
`,
    sourcefile: "textcomplete-bundle.js",
    loader: "ts",
    resolveDir: ".",
  },
  tsconfigRaw: `{
    "compilerOptions": {
        "target": "ES2022",
        "isolatedModules": "true",
    },
    "esModuleInterop": "true"}`,
  format: "esm",
  outfile: "textcomplete-bundle.mjs",
  bundle: true,
  target: "es2022",
})

import * as esbuild from "esbuild"

let result = await esbuild.build({
  entryPoints: ["node_modules/marked-directive/src/index.ts"],
  tsconfigRaw: `{
    "compilerOptions": {
        "target": "ES2022",
        "isolatedModules": "true",
    },
    "esModuleInterop": "true"}`,
  format: "esm",
  outfile: "extension/vendor/marked-directive.esm.js",
  bundle: true,
  target: "es2022",
})

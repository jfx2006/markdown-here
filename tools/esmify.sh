#!/bin/bash -xv

OUTBASE="$1"
shift

./node_modules/.bin/esbuild \
  --bundle "$@" \
  --entry-names="[dir]/$OUTBASE" \
  --format=esm \
  --outdir="src/vendor/" \
  --platform="browser" \
  --target="es2022" \
  --out-extension:".js=.esm.js" \
  --log-level="debug"





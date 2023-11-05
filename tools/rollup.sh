#!/bin/bash -xv

OUTBASE="$1"
shift

./node_modules/.bin/rollup \
    --format es \
    --file "extension/vendor/${OUTBASE}.esm.js" \
    -p @rollup/plugin-node-resolve \
    -p @rollup/plugin-commonjs \
    "$1"

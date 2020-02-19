#!/bin/bash
rimraf dist/
mkdir dist/
# Lint with fix enabled
npm run lint -- --fix
# Test
npm run test || { echo 'test failed' ; exit 1; }
rollup -c

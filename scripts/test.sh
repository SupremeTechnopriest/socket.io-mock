#!/bin/bash
npm run lint
NODE_ENV=test mocha test/runner-node.js
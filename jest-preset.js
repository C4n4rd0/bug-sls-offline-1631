/* eslint-disable @typescript-eslint/no-var-requires */
const { resolve } = require('path');
const tsJest = require('ts-jest/jest-preset');

module.exports = {
  ...tsJest,
  globalSetup: resolve(__dirname, './jest-globalSetup-mix.js'),
  globalTeardown: resolve(__dirname, './jest-globalTeardown-mix.js'),
};

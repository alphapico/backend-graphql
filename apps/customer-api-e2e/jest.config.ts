/* eslint-disable */
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  displayName: 'customer-api-e2e',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  globalSetup: '<rootDir>/src/support/global-setup.ts',
  globalTeardown: '<rootDir>/src/support/global-teardown.ts',
  setupFiles: ['<rootDir>/src/support/test-setup.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '<rootDir>/../../coverage/customer-api-e2e',
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'E2E Test Report',
        outputPath: '<rootDir>/../../coverage/customer-api-e2e/e2e-report.html',
      },
    ],
  ],
};

export default config;

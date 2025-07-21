import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // transform: {
  //   // '^.+\\.m?[tj]s?$': ['ts-jest', { useESM: true }],
  //   '^.+\\.(t|j)s$': 'ts-jest',
  // },
  // moduleNameMapper: {
  //   '^(\\.{1,2}/.*)\\.(m)?js$': '$1',
  // },
  // testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(m)?ts$',
  // coverageDirectory: 'coverage',
  // collectCoverageFrom: ['src/**/*.ts', 'src/**/*.mts', '!src/**/*.d.ts', '!src/**/*.d.mts'],

  testMatch: ['<rootDir>/src/**/*.test.ts'],
};

export default config;

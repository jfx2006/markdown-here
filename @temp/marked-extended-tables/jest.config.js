export default {
  restoreMocks: true,
  clearMocks: true,
  // collectCoverage: true,
  collectCoverageFrom: [
    'src/index.js'
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  testRegex: /\.test\.js$/.source,
  transform: {
    '\\.[jt]sx?$': 'babel-jest'
  }
};

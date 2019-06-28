module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  testRegex: ['/test/functional/.*\\.(js|ts)', '/test/unit/.*\\.(js|ts)'],
  testPathIgnorePatterns: ['test/functional/support', '/test/unit/testUtils'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    // these are just index files
    '!src/core.ts', 
    '!src/index.ts'
  ],
  coverageReporters: ['lcov', 'text', 'text-summary', 'html'],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 100,
      lines: 95,
      statements: 95,
    },
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!intl-messageformat/.*)"
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  globals: {
    'ts-jest': {
      tsConfig: {
        module: 'commonjs',
        allowJs: true,
        sourceMap: true,
        outDir: './tmp',
      },
      diagnostics: false,
    },
  },
};

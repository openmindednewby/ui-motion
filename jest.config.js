/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/scripts'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx', '**/*.test.cjs'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    'src/**/*.tsx',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/**/index.ts',
    '!src/**/index.*.ts',
    '!src/hairline/data/hairlineBundle.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'cjs', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
};

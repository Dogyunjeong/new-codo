module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.test.js' }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo|@expo|@unimodules|react-redux|@reduxjs/toolkit)'
  ],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/jest.mocks.js',
    '^@base/shared-controllers$': '<rootDir>/../../packages/shared-controllers/src/index.mts',
    '^@base/shared-types$': '<rootDir>/../../packages/shared-types/src/index.mts',
    '^@base/shared-utils$': '<rootDir>/../../packages/shared-utils/index.mts',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx)',
    '**/*.(test|spec).(ts|tsx)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/*.js$'
  ],
  globals: {
    __DEV__: true,
  },
};
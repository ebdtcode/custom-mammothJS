module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/test'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    verbose: true,
    testPathIgnorePatterns: ['/node_modules/'],
    setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
    moduleDirectories: ['node_modules'],
    bail: false,
    clearMocks: true,
    testTimeout: 10000
};
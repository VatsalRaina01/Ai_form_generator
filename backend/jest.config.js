module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    coveragePathIgnorePatterns: ['/node_modules/'],
    collectCoverageFrom: [
        'routes/**/*.js',
        'services/**/*.js',
        'models/**/*.js',
        'middleware/**/*.js'
    ]
};


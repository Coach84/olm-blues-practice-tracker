// Main test runner — executes all test suites
const { summary } = require('./test-framework');
require('./tests-part1');
require('./tests-part2');
summary();

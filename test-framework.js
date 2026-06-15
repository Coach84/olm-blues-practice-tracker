// Test runner framework
let passed = 0, failed = 0, total = 0, currentSuite = '';
function suite(name) { currentSuite = name; console.log(`\n${'═'.repeat(60)}\n📋 ${name}\n${'═'.repeat(60)}`); }
function test(name, fn) {
  total++;
  try { fn(); passed++; console.log(`  ✅ ${name}`); }
  catch (e) { failed++; console.log(`  ❌ ${name}\n     → ${e.message}`); }
}
function assert(cond, msg = 'Assertion failed') { if (!cond) throw new Error(msg); }
function eq(a, b, msg) { assert(a === b, msg || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
function summary() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🏁 RESULTS: ${passed}/${total} passed, ${failed} failed`);
  console.log(`${'═'.repeat(60)}\n`);
  process.exit(failed > 0 ? 1 : 0);
}
module.exports = { suite, test, assert, eq, summary };

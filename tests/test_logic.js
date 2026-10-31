/**
 * Automated Verification Suite for SiliconLogic Gate Engine, Truth Table Verifier & 4-Bit ALU
 */
const assert = require('assert');
const { SiliconLogicEngine, DIGITAL_CHALLENGES } = require('../js/engine/logic.js');

console.log('--- RUNNING SILICONLOGIC DIGITAL IC & ALU TESTS ---');

const eng = new SiliconLogicEngine();

// 1. Test all 3 Digital IC Challenges (Puzzle fails initially, Solution passes 100% truth table)
DIGITAL_CHALLENGES.forEach((ch, idx) => {
  eng.loadChallenge(idx);
  const initRes = eng.verifyTruthTable();
  assert.strictEqual(initRes.passed, false, `Challenge ${ch.number} initial puzzle state should require user gate selection`);

  eng.applySolution();
  const solRes = eng.verifyTruthTable();
  assert.strictEqual(solRes.passed, true, `Challenge ${ch.number} solution gates must pass all ${solRes.rows.length} truth table rows`);
  console.log(`✓ Challenge ${ch.number} (${ch.title}): Verified across all ${solRes.rows.length} truth-table states.`);
});

// 2. Test 4-Bit ALU Operations & 7-Segment Hex Output
eng.aluA = 9;
eng.aluB = 5;
eng.aluOp = 'ADD';
const aluAdd = eng.evaluateAlu();
assert.strictEqual(aluAdd.result4Bit, 14);
assert.strictEqual(aluAdd.hexChar, 'E');
assert.strictEqual(aluAdd.carry, 0);

eng.aluA = 12;
eng.aluB = 7;
const aluCarry = eng.evaluateAlu();
assert.strictEqual(aluCarry.result4Bit, 3);
assert.strictEqual(aluCarry.carry, 1);
console.log(`✓ 4-Bit ALU & 7-Segment Hex Decoder Verified (9+5=0xE, 12+7=0x3 with CARRY=1).`);

console.log('--- ALL SILICONLOGIC TESTS PASSED! ---');

/**
 * SiliconLogic — Gate-Level Digital IC Evaluator, Truth Table Verifier & 4-Bit ALU Engine
 */

const GATE_TYPES = ['AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR'];

function evalGate(type, a, b) {
  const ba = Boolean(a);
  const bb = Boolean(b);
  switch (type) {
    case 'AND':  return ba && bb;
    case 'OR':   return ba || bb;
    case 'XOR':  return ba !== bb;
    case 'NAND': return !(ba && bb);
    case 'NOR':  return !(ba || bb);
    case 'XNOR': return ba === bb;
    default:     return false;
  }
}

const DIGITAL_CHALLENGES = [
  {
    id: 'half_adder',
    number: '01',
    title: '1-Bit Binary Half-Adder (SUM & CARRY)',
    subtitle: 'Combinational Arithmetic Gate Synthesis (2 Inputs, 2 Outputs)',
    description:
      'Configure Gate G1 and Gate G2 to construct a 1-Bit Half-Adder. ' +
      'Output SUM must be 1 when exactly one input is HIGH (A ⊕ B), and CARRY must be 1 only when both A and B are HIGH (A · B).',
    inputs: ['A', 'B'],
    outputs: ['SUM', 'CARRY'],
    initialGates: {
      G1: 'OR',  // Puzzle: user changes to XOR
      G2: 'NAND' // Puzzle: user changes to AND
    },
    solutionGates: {
      G1: 'XOR',
      G2: 'AND'
    },
    evaluate(inputs, gates) {
      const A = Number(Boolean(inputs.A));
      const B = Number(Boolean(inputs.B));
      const sum = evalGate(gates.G1, A, B) ? 1 : 0;
      const carry = evalGate(gates.G2, A, B) ? 1 : 0;
      return {
        wires: { A, B, G1_OUT: sum, G2_OUT: carry },
        outputs: { SUM: sum, CARRY: carry }
      };
    },
    expectedOutputs(inputs) {
      const A = Number(Boolean(inputs.A));
      const B = Number(Boolean(inputs.B));
      return {
        SUM: A ^ B,
        CARRY: A & B
      };
    }
  },

  {
    id: 'full_adder',
    number: '02',
    title: '1-Bit Full-Adder with Carry-In (A + B + Cin)',
    subtitle: 'Cascaded Two-Stage Adder & Carry-Lookahead Propagation',
    description:
      'Construct a complete 1-Bit Full-Adder capable of adding three bits (A, B, Cin). ' +
      'G1 computes partial sum (A ⊕ B), G2 computes final SUM (P ⊕ Cin), G3 & G4 compute carry terms, and G5 merges them into Cout.',
    inputs: ['A', 'B', 'Cin'],
    outputs: ['SUM', 'Cout'],
    initialGates: {
      G1: 'XOR',
      G2: 'OR',  // Puzzle: should be XOR
      G3: 'AND',
      G4: 'AND',
      G5: 'AND'  // Puzzle: should be OR
    },
    solutionGates: {
      G1: 'XOR',
      G2: 'XOR',
      G3: 'AND',
      G4: 'AND',
      G5: 'OR'
    },
    evaluate(inputs, gates) {
      const A = Number(Boolean(inputs.A));
      const B = Number(Boolean(inputs.B));
      const Cin = Number(Boolean(inputs.Cin));

      const p = evalGate(gates.G1, A, B) ? 1 : 0;
      const sum = evalGate(gates.G2, p, Cin) ? 1 : 0;
      const c1 = evalGate(gates.G3, p, Cin) ? 1 : 0;
      const c2 = evalGate(gates.G4, A, B) ? 1 : 0;
      const cout = evalGate(gates.G5, c1, c2) ? 1 : 0;

      return {
        wires: { A, B, Cin, P: p, C1: c1, C2: c2, SUM: sum, Cout: cout },
        outputs: { SUM: sum, Cout: cout }
      };
    },
    expectedOutputs(inputs) {
      const A = Number(Boolean(inputs.A));
      const B = Number(Boolean(inputs.B));
      const Cin = Number(Boolean(inputs.Cin));
      const total = A + B + Cin;
      return {
        SUM: total & 1,
        Cout: (total >> 1) & 1
      };
    }
  },

  {
    id: 'mux_2to1',
    number: '03',
    title: '2-to-1 Digital Multiplexer (Data Selector)',
    subtitle: 'Channel Routing Logic: Y = (¬SEL · D0) + (SEL · D1)',
    description:
      'A 2-to-1 Multiplexer routes input D0 to output Y when Select (SEL) is 0, and routes input D1 to output Y when SEL is 1. ' +
      'Configure G1 (D0 path gate), G2 (D1 path gate), and G3 (output combiner gate).',
    inputs: ['D0', 'D1', 'SEL'],
    outputs: ['Y'],
    initialGates: {
      G1: 'AND',
      G2: 'OR',  // Puzzle: should be AND
      G3: 'XOR'  // Puzzle: should be OR
    },
    solutionGates: {
      G1: 'AND',
      G2: 'AND',
      G3: 'OR'
    },
    evaluate(inputs, gates) {
      const D0 = Number(Boolean(inputs.D0));
      const D1 = Number(Boolean(inputs.D1));
      const SEL = Number(Boolean(inputs.SEL));
      const notSel = SEL ? 0 : 1;

      const w0 = evalGate(gates.G1, D0, notSel) ? 1 : 0;
      const w1 = evalGate(gates.G2, D1, SEL) ? 1 : 0;
      const y = evalGate(gates.G3, w0, w1) ? 1 : 0;

      return {
        wires: { D0, D1, SEL, NOT_SEL: notSel, W0: w0, W1: w1, Y: y },
        outputs: { Y: y }
      };
    },
    expectedOutputs(inputs) {
      const D0 = Number(Boolean(inputs.D0));
      const D1 = Number(Boolean(inputs.D1));
      const SEL = Number(Boolean(inputs.SEL));
      return {
        Y: SEL === 0 ? D0 : D1
      };
    }
  }
];

// 7-Segment Hexadecimal Encoding (a, b, c, d, e, f, g) for 0..F
const SEVEN_SEG_MAP = [
  [1,1,1,1,1,1,0], // 0
  [0,1,1,0,0,0,0], // 1
  [1,1,0,1,1,0,1], // 2
  [1,1,1,1,0,0,1], // 3
  [0,1,1,0,0,1,1], // 4
  [1,0,1,1,0,1,1], // 5
  [1,0,1,1,1,1,1], // 6
  [1,1,1,0,0,0,0], // 7
  [1,1,1,1,1,1,1], // 8
  [1,1,1,1,0,1,1], // 9
  [1,1,1,0,1,1,1], // A
  [0,0,1,1,1,1,1], // b
  [1,0,0,1,1,1,0], // C
  [0,1,1,1,1,0,1], // d
  [1,0,0,1,1,1,1], // E
  [1,0,0,0,1,1,1]  // F
];

class SiliconLogicEngine {
  constructor() {
    this.challengeIdx = 0;
    this.inputs = { A: 1, B: 1, Cin: 0, D0: 1, D1: 0, SEL: 0 };
    this.gates = {};

    // 4-Bit ALU State
    this.aluA = 9;      // 4-bit (0..15)
    this.aluB = 5;      // 4-bit (0..15)
    this.aluOp = 'ADD'; // 'ADD' | 'SUB' | 'AND' | 'OR' | 'XOR'

    this.loadChallenge(0);
  }

  loadChallenge(idx) {
    this.challengeIdx = idx;
    const ch = DIGITAL_CHALLENGES[idx];
    this.gates = { ...ch.initialGates };
  }

  applySolution() {
    const ch = DIGITAL_CHALLENGES[this.challengeIdx];
    this.gates = { ...ch.solutionGates };
  }

  cycleGate(gateId) {
    const curr = this.gates[gateId] || 'AND';
    const nextIdx = (GATE_TYPES.indexOf(curr) + 1) % GATE_TYPES.length;
    this.gates[gateId] = GATE_TYPES[nextIdx];
    return this.gates[gateId];
  }

  evaluateCurrent() {
    const ch = DIGITAL_CHALLENGES[this.challengeIdx];
    return ch.evaluate(this.inputs, this.gates);
  }

  /**
   * Run exhaustive truth table verification across all 2^N input rows
   */
  verifyTruthTable() {
    const ch = DIGITAL_CHALLENGES[this.challengeIdx];
    const inNames = ch.inputs;
    const numRows = 1 << inNames.length;
    const rows = [];

    for (let r = 0; r < numRows; r++) {
      const rowIn = {};
      for (let b = 0; b < inNames.length; b++) {
        rowIn[inNames[b]] = (r >> (inNames.length - 1 - b)) & 1;
      }
      const actual = ch.evaluate(rowIn, this.gates).outputs;
      const expected = ch.expectedOutputs(rowIn);
      const pass = ch.outputs.every(outKey => actual[outKey] === expected[outKey]);
      rows.push({ inputs: rowIn, actual, expected, pass });
    }

    return {
      passed: rows.every(r => r.pass),
      rows
    };
  }

  /**
   * Compute 4-Bit ALU result, flags, and 7-segment display bitmasks
   */
  evaluateAlu() {
    const a = this.aluA & 0x0F;
    const b = this.aluB & 0x0F;
    let raw = 0;
    let carry = 0;

    if (this.aluOp === 'ADD') {
      raw = a + b;
      carry = raw > 15 ? 1 : 0;
    } else if (this.aluOp === 'SUB') {
      raw = (a - b) & 0x1F;
      carry = a < b ? 1 : 0; // Borrow flag
    } else if (this.aluOp === 'AND') {
      raw = a & b;
    } else if (this.aluOp === 'OR') {
      raw = a | b;
    } else if (this.aluOp === 'XOR') {
      raw = a ^ b;
    }

    const result4Bit = raw & 0x0F;
    const zero = result4Bit === 0 ? 1 : 0;
    const hexChar = result4Bit.toString(16).toUpperCase();

    return {
      a,
      b,
      op: this.aluOp,
      result4Bit,
      carry,
      zero,
      hexChar,
      segments: SEVEN_SEG_MAP[result4Bit]
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SiliconLogicEngine, DIGITAL_CHALLENGES, GATE_TYPES, SEVEN_SEG_MAP };
}

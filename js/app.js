/**
 * SiliconLogic — Interactive Gate Schematic, Truth Table Verifier & 4-Bit ALU Controller
 */

class SiliconLogicApp {
  constructor() {
    this.engine = new SiliconLogicEngine();
    this.initDOM();
    this.attachEvents();
    this.loadLab(0);
    this.engine.applySolution();
    this.engine.inputs = { A: 1, B: 1 };
    this.refreshLabUI();
    this.renderAluSection();
  }

  initDOM() {
    this.labSelect = document.getElementById('lab-select');
    this.labTitle = document.getElementById('lab-title');
    this.labDesc = document.getElementById('lab-desc');
    this.verdictBadge = document.getElementById('verdict-badge');
    this.schematicSvg = document.getElementById('schematic-svg');
    this.truthTableContainer = document.getElementById('truth-table-container');

    this.aluControlsEl = document.getElementById('alu-controls');
    this.sevenSegSvg = document.getElementById('seven-seg-svg');
    this.aluFlagsTxt = document.getElementById('alu-flags-txt');
  }

  attachEvents() {
    this.labSelect.addEventListener('change', (e) => {
      this.loadLab(Number(e.target.value));
    });

    document.getElementById('btn-autosolve').addEventListener('click', () => {
      this.engine.applySolution();
      this.refreshLabUI();
    });

    document.getElementById('btn-reset-lab').addEventListener('click', () => {
      this.engine.loadChallenge(this.engine.challengeIdx);
      this.refreshLabUI();
    });

    // Event delegation on Schematic SVG for input toggles and gate clicks
    this.schematicSvg.addEventListener('pointerdown', (e) => {
      const inNode = e.target.closest('[data-input-pin]');
      if (inNode) {
        const pin = inNode.dataset.inputPin;
        this.engine.inputs[pin] = this.engine.inputs[pin] ? 0 : 1;
        this.refreshLabUI();
        return;
      }

      const gateNode = e.target.closest('[data-gate-id]');
      if (gateNode) {
        const gId = gateNode.dataset.gateId;
        this.engine.cycleGate(gId);
        this.refreshLabUI();
      }
    });
  }

  loadLab(idx) {
    this.engine.loadChallenge(idx);
    this.labSelect.value = idx;
    const ch = DIGITAL_CHALLENGES[idx];
    this.labTitle.textContent = `IC Lab ${ch.number}: ${ch.title}`;
    this.labDesc.textContent = ch.description;
    this.refreshLabUI();
  }

  refreshLabUI() {
    this.renderSchematic();
    this.renderTruthTable();
  }

  wireColor(bit) {
    return bit ? '#059669' : '#d6d3d1';
  }

  drawPinBox(x, y, name, val) {
    const bg = val ? '#1c1917' : '#ffffff';
    const stroke = val ? '#1c1917' : '#d6d3d1';
    const txt = val ? '#ffffff' : '#1c1917';
    return `
      <g data-input-pin="${name}" transform="translate(${x}, ${y})" style="cursor: pointer;">
        <rect x="0" y="0" width="76" height="36" rx="6" fill="${bg}" stroke="${stroke}" stroke-width="1.5" />
        <text x="38" y="23" text-anchor="middle" fill="${txt}" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">${name} = ${val}</text>
      </g>
    `;
  }

  drawOutBox(x, y, name, val) {
    const bg = val ? '#ecfdf5' : '#ffffff';
    const stroke = val ? '#059669' : '#d6d3d1';
    const txt = val ? '#059669' : '#57534e';
    return `
      <g transform="translate(${x}, ${y})">
        <rect x="0" y="0" width="96" height="38" rx="6" fill="${bg}" stroke="${stroke}" stroke-width="1.5" />
        <text x="48" y="24" text-anchor="middle" fill="${txt}" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">${name}: ${val}</text>
      </g>
    `;
  }

  drawGateBox(x, y, gateId, gateType, outBit) {
    const stroke = outBit ? '#059669' : '#a8a29e';
    return `
      <g data-gate-id="${gateId}" transform="translate(${x}, ${y})" style="cursor: pointer;">
        <rect x="0" y="0" width="110" height="48" rx="8" fill="#ffffff" stroke="${stroke}" stroke-width="1.8" />
        <text x="55" y="18" text-anchor="middle" fill="#78716c" font-family="Inter, sans-serif" font-size="9.5" font-weight="600">${gateId} · Click to Cycle</text>
        <text x="55" y="37" text-anchor="middle" fill="#1c1917" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700">${gateType}</text>
      </g>
    `;
  }

  renderSchematic() {
    const ch = DIGITAL_CHALLENGES[this.engine.challengeIdx];
    const evalState = this.engine.evaluateCurrent();
    const w = evalState.wires;
    const o = evalState.outputs;
    const g = this.engine.gates;

    this.schematicSvg.setAttribute('viewBox', '0 0 680 265');

    if (ch.id === 'half_adder') {
      this.schematicSvg.innerHTML = `
        <!-- Wires -->
        <path d="M 106 78 L 250 78" stroke="${this.wireColor(w.A)}" stroke-width="3" fill="none" />
        <path d="M 180 78 L 180 175 L 250 175" stroke="${this.wireColor(w.A)}" stroke-width="3" fill="none" />
        <path d="M 106 198 L 210 198 L 210 102 L 250 102" stroke="${this.wireColor(w.B)}" stroke-width="3" fill="none" />
        <path d="M 210 198 L 250 198" stroke="${this.wireColor(w.B)}" stroke-width="3" fill="none" />

        <path d="M 360 90 L 530 90" stroke="${this.wireColor(o.SUM)}" stroke-width="3.5" fill="none" />
        <path d="M 360 188 L 530 188" stroke="${this.wireColor(o.CARRY)}" stroke-width="3.5" fill="none" />

        ${this.drawPinBox(30, 60, 'A', w.A)}
        ${this.drawPinBox(30, 180, 'B', w.B)}

        ${this.drawGateBox(250, 66, 'G1', g.G1, o.SUM)}
        ${this.drawGateBox(250, 164, 'G2', g.G2, o.CARRY)}

        ${this.drawOutBox(530, 71, 'SUM', o.SUM)}
        ${this.drawOutBox(530, 169, 'CARRY', o.CARRY)}
      `;
    } else if (ch.id === 'full_adder') {
      this.schematicSvg.innerHTML = `
        <!-- Wires -->
        <path d="M 100 50 L 170 50" stroke="${this.wireColor(w.A)}" stroke-width="2.5" fill="none" />
        <path d="M 100 120 L 170 120" stroke="${this.wireColor(w.B)}" stroke-width="2.5" fill="none" />
        <path d="M 100 205 L 330 205 L 330 85" stroke="${this.wireColor(w.Cin)}" stroke-width="2.5" fill="none" />

        <path d="M 280 60 L 350 60" stroke="${this.wireColor(w.P)}" stroke-width="2.5" fill="none" />
        <path d="M 310 60 L 310 140 L 350 140" stroke="${this.wireColor(w.P)}" stroke-width="2.5" fill="none" />
        <path d="M 140 50 L 140 215 L 170 215" stroke="${this.wireColor(w.A)}" stroke-width="2.5" fill="none" />
        <path d="M 155 120 L 155 235 L 170 235" stroke="${this.wireColor(w.B)}" stroke-width="2.5" fill="none" />

        <path d="M 460 66 L 560 66" stroke="${this.wireColor(o.SUM)}" stroke-width="3" fill="none" />
        <path d="M 460 150 L 480 150 L 480 185" stroke="${this.wireColor(w.C1)}" stroke-width="2.5" fill="none" />
        <path d="M 280 225 L 480 225 L 480 205" stroke="${this.wireColor(w.C2)}" stroke-width="2.5" fill="none" />
        <path d="M 555 195 L 560 195" stroke="${this.wireColor(o.Cout)}" stroke-width="3" fill="none" />

        ${this.drawPinBox(22, 32, 'A', w.A)}
        ${this.drawPinBox(22, 102, 'B', w.B)}
        ${this.drawPinBox(22, 187, 'Cin', w.Cin)}

        ${this.drawGateBox(170, 36, 'G1', g.G1, w.P)}
        ${this.drawGateBox(350, 42, 'G2', g.G2, o.SUM)}
        ${this.drawGateBox(350, 126, 'G3', g.G3, w.C1)}
        ${this.drawGateBox(170, 200, 'G4', g.G4, w.C2)}
        ${this.drawGateBox(445, 192, 'G5', g.G5, o.Cout)}

        ${this.drawOutBox(565, 47, 'SUM', o.SUM)}
        ${this.drawOutBox(565, 195, 'Cout', o.Cout)}
      `;
    } else {
      // 2-to-1 MUX
      this.schematicSvg.innerHTML = `
        <path d="M 100 55 L 210 55" stroke="${this.wireColor(w.D0)}" stroke-width="2.8" fill="none" />
        <path d="M 100 130 L 210 130" stroke="${this.wireColor(w.D1)}" stroke-width="2.8" fill="none" />
        <path d="M 100 205 L 165 205 L 165 75 L 210 75" stroke="${this.wireColor(w.NOT_SEL)}" stroke-width="2.5" stroke-dasharray="4 3" fill="none" />
        <path d="M 165 205 L 165 150 L 210 150" stroke="${this.wireColor(w.SEL)}" stroke-width="2.8" fill="none" />

        <path d="M 320 66 L 380 66 L 380 105 L 400 105" stroke="${this.wireColor(w.W0)}" stroke-width="2.8" fill="none" />
        <path d="M 320 144 L 380 144 L 380 125 L 400 125" stroke="${this.wireColor(w.W1)}" stroke-width="2.8" fill="none" />
        <path d="M 510 115 L 555 115" stroke="${this.wireColor(o.Y)}" stroke-width="3.2" fill="none" />

        ${this.drawPinBox(22, 37, 'D0', w.D0)}
        ${this.drawPinBox(22, 112, 'D1', w.D1)}
        ${this.drawPinBox(22, 187, 'SEL', w.SEL)}

        ${this.drawGateBox(210, 42, 'G1', g.G1, w.W0)}
        ${this.drawGateBox(210, 120, 'G2', g.G2, w.W1)}
        ${this.drawGateBox(400, 91, 'G3', g.G3, o.Y)}

        ${this.drawOutBox(555, 96, 'OUT Y', o.Y)}
      `;
    }
  }

  renderTruthTable() {
    const ch = DIGITAL_CHALLENGES[this.engine.challengeIdx];
    const ver = this.engine.verifyTruthTable();

    this.verdictBadge.style.color = ver.passed ? '#10b981' : '#f43f5e';
    this.verdictBadge.textContent = ver.passed
      ? '✓ ALL TRUTH TABLE STATES VERIFIED (100% PASS)'
      : '✕ TRUTH TABLE MISMATCH — CLICK GATES OR AUTO-SOLVE';

    const inCols = ch.inputs.map(k => `<th>${k}</th>`).join('');
    const outCols = ch.outputs.map(k => `<th>Actual ${k} (Exp)</th>`).join('');

    const rowsHtml = ver.rows.map(r => {
      const inCells = ch.inputs.map(k => `<td>${r.inputs[k]}</td>`).join('');
      const outCells = ch.outputs.map(k => `<td><strong>${r.actual[k]}</strong> <span style="opacity:0.65">(${r.expected[k]})</span></td>`).join('');
      return `
        <tr class="${r.pass ? 'row-pass' : 'row-fail'}">
          ${inCells}
          ${outCells}
          <td style="color:${r.pass ? '#10b981' : '#f43f5e'};font-weight:700;">${r.pass ? '✓ PASS' : '✕ FAIL'}</td>
        </tr>
      `;
    }).join('');

    this.truthTableContainer.innerHTML = `
      <table class="truth-table">
        <thead>
          <tr>${inCols}${outCols}<th>Status</th></tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;
  }

  renderAluSection() {
    const alu = this.engine.evaluateAlu();
    const makeBitBtns = (val, isA) => {
      let html = '';
      for (let b = 3; b >= 0; b--) {
        const bit = (val >> b) & 1;
        html += `<button class="bit-btn ${bit ? 'high' : ''}" data-reg="${isA ? 'A' : 'B'}" data-bit="${b}">${bit}</button>`;
      }
      return html;
    };

    const ops = ['ADD', 'SUB', 'AND', 'OR', 'XOR'];
    const opBtns = ops.map(op => `<button class="op-btn ${this.engine.aluOp === op ? 'active' : ''}" data-op="${op}">${op}</button>`).join('');

    this.aluControlsEl.innerHTML = `
      <div class="bit-row">
        <span style="font-size:0.78rem;font-weight:700;">Operand A[3:0] (${alu.a})</span>
        <div class="bit-btns">${makeBitBtns(alu.a, true)}</div>
      </div>
      <div class="bit-row">
        <span style="font-size:0.78rem;font-weight:700;">Operand B[3:0] (${alu.b})</span>
        <div class="bit-btns">${makeBitBtns(alu.b, false)}</div>
      </div>
      <div class="op-row">${opBtns}</div>
    `;

    this.aluControlsEl.querySelectorAll('.bit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const bit = Number(btn.dataset.bit);
        if (btn.dataset.reg === 'A') this.engine.aluA ^= (1 << bit);
        else this.engine.aluB ^= (1 << bit);
        this.renderAluSection();
      });
    });

    this.aluControlsEl.querySelectorAll('.op-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.engine.aluOp = btn.dataset.op;
        this.renderAluSection();
      });
    });

    // Render 7-Segment SVG in Minimalist Charcoal/Emerald
    const s = alu.segments;
    const segCol = (on) => (on ? '#1c1917' : '#e7e5e4');
    this.sevenSegSvg.setAttribute('viewBox', '0 0 100 140');
    this.sevenSegSvg.innerHTML = `
      <!-- a --> <rect x="24" y="12" width="52" height="10" rx="5" fill="${segCol(s[0])}" />
      <!-- b --> <rect x="76" y="22" width="10" height="44" rx="5" fill="${segCol(s[1])}" />
      <!-- c --> <rect x="76" y="74" width="10" height="44" rx="5" fill="${segCol(s[2])}" />
      <!-- d --> <rect x="24" y="118" width="52" height="10" rx="5" fill="${segCol(s[3])}" />
      <!-- e --> <rect x="14" y="74" width="10" height="44" rx="5" fill="${segCol(s[4])}" />
      <!-- f --> <rect x="14" y="22" width="10" height="44" rx="5" fill="${segCol(s[5])}" />
      <!-- g --> <rect x="24" y="65" width="52" height="10" rx="5" fill="${segCol(s[6])}" />
    `;

    this.aluFlagsTxt.textContent = `Result = ${alu.result4Bit} (0x${alu.hexChar}) | CARRY=${alu.carry} | ZERO=${alu.zero}`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.siliconApp = new SiliconLogicApp();
});

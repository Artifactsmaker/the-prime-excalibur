/**
 * ψ₈ — Inter-Life Sense Operator (Giác quan Liên Sinh)
 * Operatorology / Operator Intelligence artifact
 *
 * Dataset conventions:
 * - No LaTeX / KaTeX.
 * - Unicode math strings (Math_Unicode) for display + token stability.
 * - Optional semantics AST for chip-grade compilation / analysis.
 */

export type Scalar = number;

export interface StateVector {
  /** Generic vector or phase-state representation */
  v: number[];
}

/** Participant i: (ψₛ(i), Φᵢ) */
export interface InterLifeParticipant {
  /** ψₛ(i): Seventh-Sense channel/state of being i */
  psi7: StateVector;
  /** Φᵢ: emotional–vital phase field of being i */
  phi: StateVector;
  /** Optional weight ωᵢ (participation strength) */
  w?: Scalar;
}

/** Parameters for ψ₈ coupling */
export interface Psi8Params {
  /** Coupling strength σ > 0 (phase coupling softness) */
  sigma: Scalar;
  /** Alignment gain α ≥ 0 (how strongly alignment boosts coupling) */
  alpha?: Scalar;
}

/**
 * Canonical metadata for ψ₈
 */
export const Psi8 = {
  id: "psi_8",
  symbol: "ψ₈",
  name: "Inter-Life Sense Operator",
  vi_name: "Giác quan Liên Sinh",
  author: "Trung Bờm × GPT",
  nature: "Multi-being consciousness synchronization operator on shared phase field ψₑ.",
  math_unicode: {
    core: "ψ₈ = Σᵢ ( ψₛ(i) ⊗ Φᵢ )",
    alignment_hint: "|ΔΦᵢ| → 0  ⇒  ψ₈ ↑",
    summary: "Bridge personal perception → collective perception"
  },
  semantics_ast: {
    op: "eq",
    lhs: { sym: "ψ₈" },
    rhs: {
      op: "sum",
      index: { sym: "i" },
      body: {
        op: "otimes",
        args: [{ call: "ψₛ", args: [{ sym: "i" }] }, { sym: "Φᵢ" }]
      }
    }
  }
} as const;

/** Euclidean norm */
function norm(a: number[]): number {
  let s = 0;
  for (const x of a) s += x * x;
  return Math.sqrt(s);
}

/** Elementwise add */
function add(a: number[], b: number[]): number[] {
  const n = Math.min(a.length, b.length);
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = a[i] + b[i];
  return out;
}

/** Elementwise multiply */
function mul(a: number[], b: number[]): number[] {
  const n = Math.min(a.length, b.length);
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = a[i] * b[i];
  return out;
}

/** Scalar multiply */
function smul(a: number[], k: number): number[] {
  return a.map(x => x * k);
}

/**
 * A simple ⊗ proxy: parallel coupling via elementwise product.
 * (In a real O.i stack, ⊗ is a typed coupling primitive.)
 */
export function otimes(a: StateVector, b: StateVector): StateVector {
  return { v: mul(a.v, b.v) };
}

/**
 * Phase deviation proxy: |ΔΦᵢ| between participant φ and population mean φ̄.
 */
export function phaseDeviation(phi: StateVector, phiMean: StateVector): Scalar {
  const diff = add(phi.v, smul(phiMean.v, -1));
  return norm(diff);
}

/**
 * Compute φ̄ (mean Φ) across participants (weighted if w provided).
 */
export function meanPhi(participants: InterLifeParticipant[]): StateVector {
  if (participants.length === 0) return { v: [] };
  const dim = Math.min(...participants.map(p => p.phi.v.length));
  const acc = new Array<number>(dim).fill(0);
  let wsum = 0;

  for (const p of participants) {
    const w = p.w ?? 1;
    wsum += w;
    for (let i = 0; i < dim; i++) acc[i] += w * p.phi.v[i];
  }
  const inv = wsum > 0 ? 1 / wsum : 0;
  for (let i = 0; i < dim; i++) acc[i] *= inv;
  return { v: acc };
}

/**
 * ψ₈ aggregation: ψ₈ = Σᵢ ( ψₛ(i) ⊗ Φᵢ ), with optional alignment boost.
 *
 * - sigma controls softness of coupling (smaller sigma → stricter alignment).
 * - alpha controls how strongly alignment increases contribution.
 */
export function psi8(
  participants: InterLifeParticipant[],
  params: Psi8Params
): StateVector {
  if (participants.length === 0) return { v: [] };
  const sigma = params.sigma <= 0 ? 1e-6 : params.sigma;
  const alpha = params.alpha ?? 1;

  const phiMean = meanPhi(participants);

  // Accumulate in the minimum common dimensionality
  const dim = Math.min(
    ...participants.map(p => Math.min(p.psi7.v.length, p.phi.v.length))
  );
  const acc = new Array<number>(dim).fill(0);

  for (const p of participants) {
    const w = p.w ?? 1;
    const dev = phaseDeviation(p.phi, phiMean);

    // Alignment factor: exp( - (ΔΦᵢ²) / σ² )
    const align = Math.exp(-(dev * dev) / (sigma * sigma));

    // Contribution: ωᵢ · (1 + α·align) · (ψₛ(i) ⊗ Φᵢ)
    const coupled = otimes(
      { v: p.psi7.v.slice(0, dim) },
      { v: p.phi.v.slice(0, dim) }
    ).v;
    const gain = w * (1 + alpha * align);
    for (let i = 0; i < dim; i++) acc[i] += gain * coupled[i];
  }

  return { v: acc };
}

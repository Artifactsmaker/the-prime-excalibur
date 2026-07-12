/**
 * ψ₈ — Phase-History Operator (Toán tử Lịch Sử Phase)
 * Operatorology / Operator Intelligence artifact
 *
 * Dataset conventions:
 * - No LaTeX / KaTeX.
 * - Unicode math strings (Math_Unicode) for display + token stability.
 * - Optional semantics AST for chip-grade compilation / analysis.
 *
 * Core (Math_Unicode):
 *   ψ₈(y) = Σₜ=1..T K(T−t) · ψₛ(sₜ) ⊗ ΔΣₜ
 *   ΔΣₜ = Σₜ − Σₜ₋₁
 *   K(k) = exp(−β·k)
 */

export type Scalar = number;

export interface StateVector {
  v: number[];
}

export interface PhaseHistoryLog {
  /** Internal states s₀..s_T */
  states: StateVector[];
  /** Identity/policy states Σ₀..Σ_T (same length as states) */
  identity: StateVector[];
}

export interface Psi8Params {
  /** β ≥ 0 decay rate for kernel K(k) = exp(−β·k) */
  beta: Scalar;
  /** Optional convergence epsilon for denominators */
  eps?: Scalar;
  /** Threshold τ_Σ for belief shock */
  tauSigma?: Scalar;
  /** Threshold τ_c for coherence drop in belief shock */
  tauCos?: Scalar;
}

export const Psi8 = {
  id: "psi_8_phase_history",
  symbol: "ψ₈",
  name: "Phase-History Operator",
  vi_name: "Toán tử Lịch Sử Phase",
  author: "Trung Bờm × GPT",
  nature: "Retrospective audit operator that reconstructs phase trajectory signatures and produces operational audit scores.",
  math_unicode: {
    core: "ψ₈(y) = Σₜ=1..T K(T−t) · ψₛ(sₜ) ⊗ ΔΣₜ",
    delta: "ΔΣₜ = Σₜ − Σₜ₋₁",
    kernel: "K(k) = exp(−β·k)",
    scores: [
      "S_id = 1 − ( Σₜ ||ΔΣₜ|| ) / ( Σₜ ||Σₜ|| + ε )",
      "S_coh = (1/(T−1)) · Σₜ=2..T cos(rₜ, rₜ₋₁),  rₜ = ψₛ(sₜ)"
    ]
  },
  semantics_ast: {
    op: "eq",
    lhs: { sym: "ψ₈(y)" },
    rhs: {
      op: "sum",
      index: { sym: "t", from: 1, to: "T" },
      body: {
        op: "mul",
        args: [
          { call: "K", args: [{ op: "sub", args: [{ sym: "T" }, { sym: "t" }] }] },
          { call: "ψₛ", args: [{ sym: "sₜ" }] },
          { op: "otimes", args: [{ sym: "ΔΣₜ" }] }
        ]
      }
    }
  }
} as const;

/** Dot product */
function dot(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

/** Euclidean norm */
function norm(a: number[]): number {
  return Math.sqrt(dot(a, a));
}

/** Elementwise add */
function add(a: number[], b: number[]): number[] {
  const n = Math.min(a.length, b.length);
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = a[i] + b[i];
  return out;
}

/** Scalar multiply */
function smul(a: number[], k: number): number[] {
  return a.map(x => x * k);
}

/** Cosine similarity */
function cosSim(a: number[], b: number[], eps = 1e-12): number {
  const na = norm(a);
  const nb = norm(b);
  if (na < eps || nb < eps) return 0;
  return dot(a, b) / (na * nb);
}

/**
 * Proxy for ψₛ (reflection readout):
 * maps a state vector sₜ to an audit embedding rₜ.
 * Default: identity mapping.
 */
export function psiSReadout(s: StateVector): StateVector {
  return { v: s.v.slice() };
}

/**
 * Proxy for ⊗ coupling:
 * Default: elementwise product between rₜ and ΔΣₜ.
 */
export function otimes(a: StateVector, b: StateVector): StateVector {
  const n = Math.min(a.v.length, b.v.length);
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = a.v[i] * b.v[i];
  return { v: out };
}

/** Kernel K(k) = exp(−β·k) */
export function K(k: number, beta: number): number {
  return Math.exp(-beta * k);
}

/** Compute ΔΣₜ = Σₜ − Σₜ₋₁ */
export function deltaSigma(sigmas: StateVector[], t: number): StateVector {
  const a = sigmas[t]?.v ?? [];
  const b = sigmas[t - 1]?.v ?? [];
  return { v: add(a, smul(b, -1)) };
}

/**
 * ψ₈ signature computation for a trajectory log.
 *
 * Returns:
 * - signature: phase-history signature vector
 * - S_id: identity stability score
 * - S_coh: reasoning coherence score
 * - beliefShockSteps: list of t indices triggering belief shock
 */
export function psi8(
  log: PhaseHistoryLog,
  params: Psi8Params
): {
  signature: StateVector;
  S_id: number;
  S_coh: number;
  beliefShockSteps: number[];
} {
  const beta = Math.max(0, params.beta);
  const eps = params.eps ?? 1e-12;
  const tauSigma = params.tauSigma ?? 0.0;
  const tauCos = params.tauCos ?? 0.0;

  const T = Math.min(log.states.length, log.identity.length) - 1;
  if (T < 1) {
    return {
      signature: { v: [] },
      S_id: 0,
      S_coh: 0,
      beliefShockSteps: []
    };
  }

  // Common dimensionality for signature accumulation
  const dim = Math.min(
    ...log.states.slice(0, T + 1).map(s => s.v.length),
    ...log.identity.slice(0, T + 1).map(s => s.v.length)
  );
  const acc = new Array<number>(dim).fill(0);

  // Compute rₜ and ΔΣₜ, accumulate signature
  const r: StateVector[] = [];
  const dSigma: StateVector[] = [];
  for (let t = 0; t <= T; t++) {
    r.push({ v: psiSReadout(log.states[t]).v.slice(0, dim) });
    dSigma.push({ v: deltaSigma(log.identity, t).v.slice(0, dim) });
  }

  for (let t = 1; t <= T; t++) {
    const weight = K(T - t, beta);
    const coupled = otimes(r[t], dSigma[t]).v;
    for (let i = 0; i < dim; i++) acc[i] += weight * coupled[i];
  }

  // Identity stability S_id
  let sumDelta = 0;
  let sumSigma = 0;
  for (let t = 1; t <= T; t++) sumDelta += norm(dSigma[t].v);
  for (let t = 0; t <= T; t++) sumSigma += norm(log.identity[t].v.slice(0, dim));
  const S_id = 1 - (sumDelta / (sumSigma + eps));

  // Coherence S_coh
  let coh = 0;
  for (let t = 2; t <= T; t++) coh += cosSim(r[t].v, r[t - 1].v, eps);
  const S_coh = coh / Math.max(1, T - 1);

  // Belief shock detection
  const beliefShockSteps: number[] = [];
  for (let t = 2; t <= T; t++) {
    const d = norm(dSigma[t].v);
    const c = cosSim(r[t].v, r[t - 1].v, eps);
    if (d >= tauSigma && c <= tauCos) beliefShockSteps.push(t);
  }

  return {
    signature: { v: acc },
    S_id,
    S_coh,
    beliefShockSteps
  };
}

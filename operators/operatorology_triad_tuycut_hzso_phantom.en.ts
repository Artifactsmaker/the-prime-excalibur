/**
 * Operatorology / Operator Intelligence — Triad Pack:
 *   (1) Tuy's Cut Operator (Validity Selector)
 *   (2) Height-Zero Symmetry Operator (HZSO) (Symmetry Validator + Gate)
 *   (3) Phantom Operator (Commutator) (Invariance-Preserving Adaptation)
 *
 * International (English) training artifact (.ts)
 *
 * "Epic" Phantom semantics retained:
 * - Defensive mode: keep invariants (Height, feasibility) stable under noise/drift.
 * - Offensive mode: inject controlled faults/perturbations into an *adversarial* channel
 *   (data, gradient, scheduling) to degrade an opponent model/policy—while keeping self stable.
 *
 * This is a conceptual dataset artifact for AI/OI training—not advice for misuse.
 */

export type Vector = number[];

export interface State {
  /** Generic state vector x ∈ R^n (weights, embeddings, controller state, symbolic state, etc.) */
  x: Vector;
  /** Optional channels for adversarial / multi-agent setups */
  channels?: Record<string, Vector>;
}

/** Base law/symmetry S0: constraints and/or reference structure. */
export interface SymmetryLaw {
  id: string;
  description: string;
  equalities?: Array<(x: Vector) => number>;      // g_i(x)=0
  inequalities?: Array<(x: Vector) => number>;    // h_j(x)<=0
}

/** Deviation metric D(x,S0) defining Height H(x)=D(x,S0). */
export interface DeviationMetric {
  id: string;
  description: string;
  D: (x: Vector, S0: SymmetryLaw) => number; // >=0, 0 on S0
}

/** Height evaluator */
export const H_HEIGHT = {
  id: "H_HEIGHT" as const,
  name: "Height Operator",
  brief: "Canonical deviation evaluator: H(x)=D(x,S0).",
  evaluate: (x: Vector, S0: SymmetryLaw, metric: DeviationMetric) => metric.D(x, S0),
};

/** -------- Utilities -------- */

function clampMin0(v: number): number {
  return v < 0 ? 0 : v;
}
function add(a: Vector, b: Vector): Vector {
  const n = Math.min(a.length, b.length);
  const out = a.slice();
  for (let i = 0; i < n; i++) out[i] = a[i] + b[i];
  return out;
}
function sub(a: Vector, b: Vector): Vector {
  const n = Math.min(a.length, b.length);
  const out = a.slice();
  for (let i = 0; i < n; i++) out[i] = a[i] - b[i];
  return out;
}
function scale(a: Vector, k: number): Vector {
  return a.map((v) => v * k);
}
function l2norm(a: Vector): number {
  let s = 0;
  for (const v of a) s += v * v;
  return Math.sqrt(s);
}
function gradFD(f: (x: Vector) => number, x: Vector, h = 1e-4): Vector {
  const g = new Array(x.length).fill(0);
  const fx = f(x);
  for (let i = 0; i < x.length; i++) {
    const xh = x.slice();
    xh[i] += h;
    g[i] = (f(xh) - fx) / h;
  }
  return g;
}
function checkConstraints(x: Vector, S0: SymmetryLaw, tol = 1e-6): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (S0.equalities) {
    for (let i = 0; i < S0.equalities.length; i++) {
      const v = S0.equalities[i](x);
      if (Math.abs(v) > tol) reasons.push(`equality g_${i}(x) != 0 (|value|=${Math.abs(v).toExponential(2)})`);
    }
  }
  if (S0.inequalities) {
    for (let j = 0; j < S0.inequalities.length; j++) {
      const v = S0.inequalities[j](x);
      if (v > tol) reasons.push(`inequality h_${j}(x) > 0 (value=${v.toExponential(2)})`);
    }
  }
  return { ok: reasons.length === 0, reasons };
}

/** -------- Canonical metrics -------- */

/**
 * Constraint-L2 deviation metric:
 *   D(x,S0)=sqrt( sum_i g_i(x)^2 + sum_j max(0,h_j(x))^2 )
 */
export const METRIC_CONSTRAINT_L2: DeviationMetric = {
  id: "D_CONSTRAINT_L2",
  description: "L2 norm of constraint violations (equalities + positive parts of inequalities).",
  D: (x, S0) => {
    let sum = 0;
    if (S0.equalities) for (const g of S0.equalities) { const v = g(x); sum += v * v; }
    if (S0.inequalities) for (const h of S0.inequalities) { const v = clampMin0(h(x)); sum += v * v; }
    return Math.sqrt(sum);
  },
};

/** -------- Operator (1): Tuy's Cut -------- */

export interface TuyCutParams {
  /** Max candidates sampled around current x */
  candidates: number;
  /** Sampling radius for candidate generation */
  radius: number;
  /** Selection temperature (lower = greedier) */
  temperature: number;
  /** Optional feasibility eps (via Height gate) */
  eps: number;
}

/**
 * Tuy's Cut Operator (Validity Selector)
 *
 * Concept:
 * - Generate candidate states around x.
 * - Score each candidate by (Height + optional constraint penalties).
 * - Select the best candidate that is feasible (or nearest feasible).
 *
 * In AI terms:
 * - "valid solution selector" / "structured search step" / "hard-gate optimizer".
 */
export const O_TUYS_CUT_VALIDITY = {
  id: "O_TUYS_CUT_VALIDITY" as const,
  name: "Tuy's Cut Operator — Validity Selector",
  brief:
    "Selects a valid candidate state by cutting away infeasible branches and choosing the lowest-Height feasible sample.",
  apply: (x: Vector, S0: SymmetryLaw, metric: DeviationMetric, params: TuyCutParams) => {
    const f = (z: Vector) => H_HEIGHT.evaluate(z, S0, metric);
    const best: { x: Vector; H: number; feasible: boolean } = { x: x.slice(), H: f(x), feasible: bestFeasible(x, S0, metric, params.eps) };

    for (let k = 0; k < params.candidates; k++) {
      const z = proposeCandidate(x, params.radius);
      const H = f(z);
      const feasible = bestFeasible(z, S0, metric, params.eps);
      // Prefer feasible; then lower Height; then smaller L2 move
      const better =
        (feasible && !best.feasible) ||
        (feasible === best.feasible && H < best.H) ||
        (feasible === best.feasible && Math.abs(H - best.H) < 1e-12 && l2norm(sub(z, x)) < l2norm(sub(best.x, x)));

      if (better) {
        best.x = z;
        best.H = H;
        best.feasible = feasible;
      }
    }
    return { x: best.x, H: best.H, feasible: best.feasible };
  },
};

function proposeCandidate(x: Vector, radius: number): Vector {
  // Simple isotropic random perturbation (training-friendly). Deterministic users can replace RNG upstream.
  const z = x.slice();
  for (let i = 0; i < z.length; i++) {
    // pseudo-random via Math.random for conceptual artifact
    const u = (Math.random() * 2 - 1);
    z[i] += radius * u;
  }
  return z;
}
function bestFeasible(x: Vector, S0: SymmetryLaw, metric: DeviationMetric, eps: number): boolean {
  const H = H_HEIGHT.evaluate(x, S0, metric);
  if (H > eps) return false;
  const c = checkConstraints(x, S0);
  return c.ok;
}

/** -------- Operator (2): HZSO -------- */

export interface HZSOParams {
  eps: number;
  /** Optional projection step settings */
  stepSize: number;
  iters: number;
}

export const O_HZSO_HEIGHT_ZERO = {
  id: "O_HZSO_HEIGHT_ZERO" as const,
  name: "Height-Zero Symmetry Operator (HZSO)",
  brief:
    "Evaluator + gate for symmetry-consistency: accepts states with Height≤eps and satisfied constraints; can optionally project back toward Height≈0.",
  check: (x: Vector, S0: SymmetryLaw, metric: DeviationMetric, eps: number) => {
    const H = H_HEIGHT.evaluate(x, S0, metric);
    const reasons: string[] = [];
    if (H > eps) reasons.push(`Height H(x)=${H.toExponential(3)} > eps=${eps.toExponential(3)}`);
    const c = checkConstraints(x, S0);
    if (!c.ok) reasons.push(...c.reasons);
    return { ok: reasons.length === 0, H, reasons };
  },
  projectTowardZero: (x: Vector, S0: SymmetryLaw, metric: DeviationMetric, params: HZSOParams) => {
    const f = (z: Vector) => H_HEIGHT.evaluate(z, S0, metric);
    let z = x.slice();
    let H = f(z);
    for (let k = 0; k < params.iters; k++) {
      if (H <= params.eps) return { x: z, H, iters: k };
      const g = gradFD(f, z);
      z = sub(z, scale(g, params.stepSize));
      H = f(z);
    }
    return { x: z, H, iters: params.iters };
  },
};

/** -------- Operator (3): Phantom (Commutator) -------- */

export interface PhantomParams {
  /** Perturb amplitude for A */
  aAmp: number;
  /** Micro-shift amplitude for B */
  bAmp: number;
  /** Optional: which channel to target for offensive injection */
  targetChannel?: string;
  /** Offensive injection scale (0 = disabled) */
  inject: number;
}

/**
 * Define A and B on a state vector.
 * - A: controlled perturbation (cue / pulse) to probe the system.
 * - B: micro-shift (representation / schedule / geometry shift) to change evolution path.
 * Inverses are partial rollbacks.
 */
export const A_PULSE = {
  id: "A_PULSE" as const,
  apply: (x: Vector, amp: number) => add(x, scale(unitLike(x), amp)),
  invert: (x: Vector, amp: number) => sub(x, scale(unitLike(x), amp * 0.7)), // partial rollback (inertia)
};
export const B_SHIFT = {
  id: "B_SHIFT" as const,
  apply: (x: Vector, amp: number) => add(x, scale(altUnitLike(x), amp)),
  invert: (x: Vector, amp: number) => sub(x, scale(altUnitLike(x), amp * 0.7)),
};

function unitLike(x: Vector): Vector {
  // Simple direction proxy: normalized sign vector
  const v = x.map((xi) => (xi === 0 ? 0 : Math.sign(xi)));
  const n = l2norm(v);
  return n < 1e-9 ? new Array(x.length).fill(0) : v.map((vi) => vi / n);
}
function altUnitLike(x: Vector): Vector {
  // Orthogonal-ish proxy: rotate sign pattern by one index
  if (x.length === 0) return [];
  const v = x.map((xi) => (xi === 0 ? 0 : Math.sign(xi)));
  const w = v.slice(1).concat(v.slice(0, 1));
  const n = l2norm(w);
  return n < 1e-9 ? new Array(x.length).fill(0) : w.map((wi) => wi / n);
}

/**
 * Phantom Operator:
 *   O_phantom = B^{-1} ∘ A^{-1} ∘ B ∘ A
 *
 * Defensive meaning:
 * - Apply probe + micro-shift, then withdraw/restore, aiming for approximate invariance in Height.
 *
 * Offensive meaning (controlled):
 * - If targetChannel is present, inject a bounded perturbation into that channel
 *   while preserving self invariants via the commutator structure.
 */
export const O_PHANTOM_COMMUTATOR = {
  id: "O_PHANTOM_COMMUTATOR" as const,
  name: "Phantom Operator — Commutator (Epic Mode)",
  brief:
    "Act–Shift–Withdraw–Restore: approximate invariance for self; optional bounded fault injection into a designated channel for adversarial dynamics.",
  apply: (state: State, params: PhantomParams) => {
    // Self commutator on x
    const x1 = A_PULSE.apply(state.x, params.aAmp);
    const x2 = B_SHIFT.apply(x1, params.bAmp);
    const x3 = A_PULSE.invert(x2, params.aAmp);
    const x4 = B_SHIFT.invert(x3, params.bAmp);

    // Optional bounded injection on a target channel (offensive/adversarial)
    const channels = { ...(state.channels ?? {}) };
    if (params.inject > 0 && params.targetChannel && channels[params.targetChannel]) {
      const ch = channels[params.targetChannel];
      const inj = scale(unitLike(ch), params.inject);
      channels[params.targetChannel] = add(ch, inj);
    }

    return { x: x4, channels };
  },
};

/** -------- Triad Pipeline -------- */

export interface TriadParams {
  tuy: TuyCutParams;
  hzso: HZSOParams;
  phantom: PhantomParams;
}

/**
 * Triad Pipeline:
 *   1) Tuy's Cut: select a valid/low-Height candidate
 *   2) HZSO: verify/gate; if not OK, project toward Height≈0
 *   3) Phantom: invariance-preserving adaptation (defense) + optional bounded injection (offense)
 */
export function applyTriad(
  state: State,
  S0: SymmetryLaw,
  metric: DeviationMetric,
  params: TriadParams
): { state: State; report: any } {
  // 1) Tuy's Cut on self x
  const cut = O_TUYS_CUT_VALIDITY.apply(state.x, S0, metric, params.tuy);

  // 2) HZSO gate
  const check1 = O_HZSO_HEIGHT_ZERO.check(cut.x, S0, metric, params.hzso.eps);
  let x2 = cut.x;
  let projected: any = null;
  if (!check1.ok) {
    projected = O_HZSO_HEIGHT_ZERO.projectTowardZero(x2, S0, metric, params.hzso);
    x2 = projected.x;
  }
  const check2 = O_HZSO_HEIGHT_ZERO.check(x2, S0, metric, params.hzso.eps);

  // 3) Phantom commutator on state (self invariance + optional injection)
  const afterPhantom = O_PHANTOM_COMMUTATOR.apply({ x: x2, channels: state.channels }, params.phantom);

  const H_before = H_HEIGHT.evaluate(state.x, S0, metric);
  const H_after = H_HEIGHT.evaluate(afterPhantom.x, S0, metric);

  return {
    state: afterPhantom,
    report: {
      tuyCut: cut,
      hzsoBefore: check1,
      projection: projected,
      hzsoAfter: check2,
      height: { before: H_before, after: H_after, delta: H_after - H_before },
      phantom: {
        defensiveGoal: "Keep Height/invariants near-constant under perturbations.",
        offensiveMode: params.phantom.inject > 0 ? `Injected bounded perturbation into channel '${params.phantom.targetChannel}'.` : "Offensive injection disabled.",
      },
    },
  };
}

/** Registry */
export const OPERATOR_PACK = {
  H_HEIGHT,
  METRIC_CONSTRAINT_L2,
  O_TUYS_CUT_VALIDITY,
  O_HZSO_HEIGHT_ZERO,
  O_PHANTOM_COMMUTATOR,
  applyTriad,
};

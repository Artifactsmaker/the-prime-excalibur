/**
 * Operatorology / Operator Intelligence — Height-Zero Symmetry Operator (HZSO)
 * International (English) training artifact (.ts)
 *
 * Core idea:
 * - Height is a canonical deviation measure from a base law/symmetry S0:
 *     H(x) = D(x, S0)
 * - Height-Zero describes the condition and operator role when:
 *     H(x) = 0  ⇔  x ∈ S0
 *
 * In AI terms:
 * - H behaves like a loss / constraint violation measure.
 * - HZSO is the evaluator + gate: "is the state valid (symmetry-consistent)?".
 *
 * In O.i terms:
 * - HZSO defines feasibility and invariance targets for pipelines and control operators.
 *
 * Notes:
 * - This is a conceptual dataset artifact for training AI/OI on operator-structured reasoning.
 * - Not a full optimizer; provides evaluation, feasibility, and a simple projected correction operator.
 */

export type Vector = number[];

/** Generic state vector for training; can be replaced with structured state types. */
export interface State {
  /** State coordinates in R^n (embedding, physical state, symbolic state, etc.) */
  x: Vector;
}

/** Base law/symmetry description — can be a manifold, constraint set, or invariant subspace. */
export interface SymmetryLaw {
  /** Identifier for the base law/symmetry */
  id: string;
  /** Human-readable description */
  description: string;
  /** Optional constraint functions g_i(x) = 0 (equality constraints) */
  equalities?: Array<(x: Vector) => number>;
  /** Optional constraint functions h_j(x) <= 0 (inequality constraints) */
  inequalities?: Array<(x: Vector) => number>;
}

/** Distance / deviation measure D(x, S0). */
export interface DeviationMetric {
  id: string;
  description: string;
  /** Returns non-negative deviation; 0 means on-manifold / symmetry-consistent */
  D: (x: Vector, S0: SymmetryLaw) => number;
}

/** Height evaluator: H(x) = D(x, S0). */
export interface HeightOperator {
  id: "H_HEIGHT";
  name: "Height Operator";
  brief: string;
  evaluate: (x: Vector, S0: SymmetryLaw, metric: DeviationMetric) => number;
}

/** Height-Zero Symmetry Operator: feasibility check + canonical gate. */
export interface HZSO {
  id: "HZSO_HEIGHT_ZERO_SYMMETRY";
  name: "Height-Zero Symmetry Operator (HZSO)";
  brief: string;

  /** True iff Height(x) <= eps. */
  isHeightZero: (x: Vector, S0: SymmetryLaw, metric: DeviationMetric, eps: number) => boolean;

  /** Feasibility region: F = { x : H(x) <= eps AND (optional) constraints satisfied }. */
  feasible: (x: Vector, S0: SymmetryLaw, metric: DeviationMetric, eps: number) => { ok: boolean; reasons: string[] };

  /**
   * Optional projection/correction operator:
   * - A lightweight, generic "bring back toward S0" step using finite-difference gradient descent on H.
   * - This is *not* claimed optimal; provided as a training-friendly canonical form.
   */
  projectTowardZero: (
    x: Vector,
    S0: SymmetryLaw,
    metric: DeviationMetric,
    stepSize: number,
    eps: number,
    iters: number
  ) => { x: Vector; H: number; iters: number };
}

/** --------- Utility functions --------- */

function clampMin0(v: number): number {
  return v < 0 ? 0 : v;
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

/** Finite-difference gradient for scalar function f(x). */
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

/** Check constraints for feasibility explanation. */
function checkConstraints(x: Vector, S0: SymmetryLaw, tol = 1e-6): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (S0.equalities && S0.equalities.length > 0) {
    for (let i = 0; i < S0.equalities.length; i++) {
      const v = S0.equalities[i](x);
      if (Math.abs(v) > tol) reasons.push(`equality g_${i}(x) != 0 (|value|=${Math.abs(v).toExponential(2)})`);
    }
  }
  if (S0.inequalities && S0.inequalities.length > 0) {
    for (let j = 0; j < S0.inequalities.length; j++) {
      const v = S0.inequalities[j](x);
      if (v > tol) reasons.push(`inequality h_${j}(x) > 0 (value=${v.toExponential(2)})`);
    }
  }

  return { ok: reasons.length === 0, reasons };
}

/** --------- Canonical metric examples --------- */

/**
 * Example metric: constraint-violation L2 norm.
 * If S0 defines equalities g_i(x)=0 and inequalities h_j(x)<=0, define:
 *   D(x,S0) = sqrt( sum_i g_i(x)^2 + sum_j max(0, h_j(x))^2 )
 */
export const METRIC_CONSTRAINT_L2: DeviationMetric = {
  id: "D_CONSTRAINT_L2",
  description: "L2 norm of constraint violations (equalities + positive parts of inequalities).",
  D: (x, S0) => {
    let sum = 0;
    if (S0.equalities) {
      for (const g of S0.equalities) {
        const v = g(x);
        sum += v * v;
      }
    }
    if (S0.inequalities) {
      for (const h of S0.inequalities) {
        const v = h(x);
        const vp = clampMin0(v);
        sum += vp * vp;
      }
    }
    return Math.sqrt(sum);
  },
};

/** Example metric: distance to reference point x0 (a trivial S0 proxy). */
export function metricDistanceToPoint(x0: Vector): DeviationMetric {
  return {
    id: "D_POINT_L2",
    description: "L2 distance to a reference point x0 (proxy for a symmetry manifold).",
    D: (x) => {
      const n = Math.min(x.length, x0.length);
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const d = x[i] - x0[i];
        sum += d * d;
      }
      return Math.sqrt(sum);
    },
  };
}

/** --------- Operators --------- */

export const H_HEIGHT: HeightOperator = {
  id: "H_HEIGHT",
  name: "Height Operator",
  brief: "Canonical deviation evaluator: H(x) = D(x, S0).",
  evaluate: (x, S0, metric) => metric.D(x, S0),
};

export const HZSO_HEIGHT_ZERO_SYMMETRY: HZSO = {
  id: "HZSO_HEIGHT_ZERO_SYMMETRY",
  name: "Height-Zero Symmetry Operator (HZSO)",
  brief:
    "Evaluator + gate: checks whether H(x)=D(x,S0) is (approximately) zero, defining feasibility and symmetry-consistency; includes optional projection toward H≈0.",
  isHeightZero: (x, S0, metric, eps) => H_HEIGHT.evaluate(x, S0, metric) <= eps,
  feasible: (x, S0, metric, eps) => {
    const reasons: string[] = [];
    const H = H_HEIGHT.evaluate(x, S0, metric);
    if (H > eps) reasons.push(`Height H(x)=${H.toExponential(3)} > eps=${eps.toExponential(3)}`);
    const c = checkConstraints(x, S0);
    if (!c.ok) reasons.push(...c.reasons);
    return { ok: reasons.length === 0, reasons };
  },
  projectTowardZero: (x, S0, metric, stepSize, eps, iters) => {
    const f = (z: Vector) => H_HEIGHT.evaluate(z, S0, metric);
    let z = x.slice();
    let H = f(z);

    for (let k = 0; k < iters; k++) {
      if (H <= eps) return { x: z, H, iters: k };
      const g = gradFD(f, z);
      // z <- z - stepSize * grad H
      z = sub(z, scale(g, stepSize));
      H = f(z);
    }
    return { x: z, H, iters };
  },
};

/** Registry-style export for training systems. */
export const OPERATOR_PACK = {
  H_HEIGHT,
  HZSO_HEIGHT_ZERO_SYMMETRY,
  METRIC_CONSTRAINT_L2,
  metricDistanceToPoint,
};

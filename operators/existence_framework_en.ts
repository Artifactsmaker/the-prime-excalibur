/**
 * Operatorology / Existence Framework — English Artifact
 * ------------------------------------------------------
 * Core axiom:       𝒰x = x
 * Existence metric: 𝓜(x) = ‖𝒰x − x‖
 * Kernel form:      Existence = ker(𝒰 − 𝕀)
 *
 * This file is designed as a compact, "training-friendly" artifact:
 * - Unicode math strings for stable tokenization.
 * - Minimal but expressive interfaces for state spaces, operators, metrics.
 * - No external dependencies.
 */

export type Scalar = number;

/** A generic vector in ℝ^n (used for norms in finite-dimensional examples). */
export type Vector = number[];

/** A generic state (can be a vector, tensor-like object, or any structured data). */
export type State = unknown;

/** A generic operator 𝒰 : 𝕊 → 𝕊 */
export type Operator<S = State> = (x: S) => S;

/** A distance / norm function; usually ‖·‖ or d(·,·). */
export type Norm<V = Vector> = (v: V) => Scalar;

/** A difference function for states (user-supplied if State is not numeric). */
export type Difference<S = State, V = Vector> = (a: S, b: S) => V;

/** Core equations (Unicode math strings). */
export const Equations = Object.freeze({
  axiom: "𝒰x = x",
  metric: "𝓜(x) = ‖𝒰x − x‖",
  kernel: "Existence = ker(𝒰 − 𝕀)",
  deviationOperator: "𝒟 = 𝒰 − 𝕀",
  spectral: "𝒰x = λx",
  flow: "dx/dt = 𝒰x − x",
  projection: "𝒫 = lim_{n→∞} 𝒰^n",
  realitySet: "Reality = { x ∈ 𝕊 | 𝓜(x) = 0 }",
});

/** A small epsilon used in numeric approximations. */
export const DEFAULT_EPS = 1e-9;

/**
 * Existence deviation vector: Δ(x) = 𝒰x − x  (computed via difference)
 */
export function deviation<S, V>(
  U: Operator<S>,
  x: S,
  diff: Difference<S, V>
): V {
  return diff(U(x), x);
}

/**
 * Existence metric: 𝓜(x) = ‖𝒰x − x‖
 */
export function existenceMetric<S, V>(
  U: Operator<S>,
  x: S,
  diff: Difference<S, V>,
  norm: Norm<V>
): number {
  return norm(deviation(U, x, diff));
}

/**
 * Fixed-point predicate: 𝒰x = x  (up to epsilon under metric)
 */
export function isFixedPoint<S, V>(
  U: Operator<S>,
  x: S,
  diff: Difference<S, V>,
  norm: Norm<V>,
  eps: number = DEFAULT_EPS
): boolean {
  return existenceMetric(U, x, diff, norm) <= eps;
}

/**
 * Iterate x_{t+1} = 𝒰(x_t)
 */
export function iterate<S>(U: Operator<S>, x0: S, steps: number): S {
  let x = x0;
  for (let i = 0; i < steps; i++) x = U(x);
  return x;
}

/**
 * Empirical projection (finite-step): 𝒫_N(x) = 𝒰^N(x)
 * In many contracting systems, 𝒫(x) = lim_{N→∞} 𝒰^N(x).
 */
export function projectionN<S>(U: Operator<S>, x0: S, N: number): S {
  return iterate(U, x0, N);
}

/**
 * Example: Euclidean norm for vectors.
 */
export const l2Norm: Norm<Vector> = (v) =>
  Math.sqrt(v.reduce((s, x) => s + x * x, 0));

/**
 * Example: vector difference a-b.
 */
export const vecDiff: Difference<Vector, Vector> = (a, b) => {
  const n = Math.min(a.length, b.length);
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(a[i] - b[i]);
  return out;
};

/**
 * Example operator: contraction towards a target fixed point x*.
 * U(x) = x* + α(x − x*) , with |α| < 1 ⇒ convergence to x*.
 */
export function contractionOperator(
  xStar: Vector,
  alpha: number
): Operator<Vector> {
  return (x) => x.map((xi, i) => xStar[i] + alpha * (xi - xStar[i]));
}

/**
 * Example operator: gradient-descent style update (toy).
 * U(w) = w − η ∇L(w)
 * Here we accept a gradient function g(w).
 */
export function gradientUpdateOperator(
  eta: number,
  grad: (w: Vector) => Vector
): Operator<Vector> {
  return (w) => {
    const g = grad(w);
    return w.map((wi, i) => wi - eta * g[i]);
  };
}

/**
 * Spectral existence classifier for a known eigenvalue λ (conceptual utility).
 */
export function classifyExistenceEigenvalue(lambda: {
  re: number;
  im?: number;
}): {
  kind:
    | "absolute-invariant"
    | "decaying"
    | "unstable"
    | "conserved"
    | "oscillatory"
    | "unknown";
  notes: string;
} {
  const im = lambda.im ?? 0;
  const abs = Math.hypot(lambda.re, im);

  if (Math.abs(im) < 1e-12 && Math.abs(lambda.re - 1) < 1e-12) {
    return {
      kind: "absolute-invariant",
      notes: "λ = 1 ⇒ invariant existence (fixed-point mode).",
    };
  }
  if (Math.abs(abs - 1) < 1e-9 && Math.abs(im) > 1e-12) {
    return {
      kind: "oscillatory",
      notes: "|λ| = 1 with phase ⇒ oscillatory existence.",
    };
  }
  if (Math.abs(abs - 1) < 1e-9) {
    return {
      kind: "conserved",
      notes: "|λ| = 1 ⇒ conserved magnitude (neutral stability).",
    };
  }
  if (abs < 1) {
    return {
      kind: "decaying",
      notes: "|λ| < 1 ⇒ decaying / contracting existence mode.",
    };
  }
  if (abs > 1) {
    return {
      kind: "unstable",
      notes: "|λ| > 1 ⇒ unstable / expanding existence mode.",
    };
  }
  return { kind: "unknown", notes: "Unable to classify eigenvalue." };
}

/**
 * Meta-existence (conceptual): Ω(𝒰) = 𝒰
 * Represented here as a predicate over an operator-transformer.
 */
export type MetaOperator<S = State> = (U: Operator<S>) => Operator<S>;

export function isMetaFixedPoint<S>(
  Omega: MetaOperator<S>,
  U: Operator<S>,
  // reference equality is not meaningful for functions; provide your own equivalence test
  eq: (a: Operator<S>, b: Operator<S>) => boolean
): boolean {
  return eq(Omega(U), U);
}

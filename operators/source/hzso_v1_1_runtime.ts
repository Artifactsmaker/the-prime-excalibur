/**
 * HZSO v1.1 Runtime — Height–Zero Symmetry Operator
 * Operatorology / Operator Intelligence artifact
 *
 * Purpose
 * -------
 * Upgrades HZSO from a training/spec record into an executable operator runtime.
 * HZSO moves a valid state S toward the ground-symmetry manifold 𝓜_Σ by reducing
 * height h_Σ(S) until a height-zero / near-height-zero state is reached.
 *
 * Core runtime form
 * -----------------
 *   𝓗_Σ(S) = argmin_{S′∈ℬ} [ h_Σ(S′) + λ·Δ_Σ(S′,S) ]
 *
 * In this concrete vector runtime, if height is induced by distance to a symmetry
 * projection Π_Σ(S), the one-step candidate is approximated by elastic projection:
 *   S_candidate = (Π_Σ(S) + λ·S) / (1 + λ)
 * then optionally blended with the previous state using η.
 *
 * No LaTeX is required at runtime; Unicode strings are preserved for O.i training.
 */

export type NonNegativeReal = number;
export type PositiveReal = number;

export interface StateVector {
  /** Vector representation of a valid block state S ∈ ℬ. */
  v: number[];
}

export type Projector = (state: StateVector) => StateVector;
export type HeightFunction = (state: StateVector) => number;
export type DeviationFunction = (candidate: StateVector, previous: StateVector) => number;
export type ValidBlockProjector = (state: StateVector) => StateVector;

export interface HZSORuntimeConfig {
  /** λ > 0: stabilizes the update so the state does not jump too far from the valid block. */
  lambda: PositiveReal;
  /** η ∈ (0,1]: update blending factor. Default 1. */
  eta?: PositiveReal;
  /** Stop when h_Σ(S) <= tolerance. Default 1e-6. */
  tolerance?: NonNegativeReal;
  /** Maximum number of iterations. Default 256. */
  maxIterations?: number;
  /** If true, backtracking prevents height increase. Default true. */
  monotonicGuard?: boolean;
  /** Projection onto the ground-symmetry manifold 𝓜_Σ. */
  symmetryProjector: Projector;
  /** Optional valid-block projector P_ℬ. Use this to clamp or repair invalid states. */
  validBlockProjector?: ValidBlockProjector;
  /** Height h_Σ. Default: Euclidean distance to symmetryProjector(state). */
  height?: HeightFunction;
  /** Deviation Δ_Σ(S′,S). Default: Euclidean distance. */
  deviation?: DeviationFunction;
}

export interface HZSOStepResult {
  previous: StateVector;
  projected: StateVector;
  candidate: StateVector;
  next: StateVector;
  heightBefore: number;
  heightAfter: number;
  deviation: number;
  objective: number;
  etaUsed: number;
  monotone: boolean;
}

export interface HZSOTrace {
  initial: StateVector;
  final: StateVector;
  heights: number[];
  objectives: number[];
  deviations: number[];
  steps: HZSOStepResult[];
  iterations: number;
  converged: boolean;
  monotonic: boolean;
  reason: "height_zero" | "max_iterations" | "invalid_config";
}

export interface HZSOAxiomCheck {
  monotoneHeightDescent: boolean;
  fixedPointAtHeightZero: boolean;
  convergenceObserved: boolean;
  finalHeight: number;
  maxHeightIncrease: number;
  notes: string[];
}

export const HZSO_RUNTIME_META = {
  id: "operator.hzso.en.v1.1-runtime",
  previous_id: "operator.hzso.en.v1",
  name: "Height–Zero Symmetry Operator",
  symbol: "𝓗_Σ",
  version: "1.1.0",
  status: "Executable runtime scaffold",
  category: "universal_convergence_operator",
  purpose:
    "Reduce obstruction height and project valid states toward a ground-symmetry manifold without generating unrelated solutions.",
  runtime_signature: "runHZSO(S₀, cfg) → { final, trace, convergence diagnostics }",
  core_math_unicode: {
    operator: "𝓗_Σ : ℬ → ℬ",
    descent: "h_Σ(𝓗_Σ(S)) ≤ h_Σ(S)",
    fixed_point: "h_Σ(S)=0 ⇒ 𝓗_Σ(S)=S",
    projection: "Π_Σ(S) := limₜ→∞ 𝓗_Σ^t(S)",
    operational_form: "𝓗_Σ(S)=argmin_{S′∈ℬ}[h_Σ(S′)+λ·Δ_Σ(S′,S)]",
    vector_runtime: "S_next = blend(S, (Π_Σ(S)+λS)/(1+λ), η)",
  },
  upgrades_from_v1: [
    "Adds executable vector runtime.",
    "Adds symmetry projector Π_Σ as a required runtime primitive.",
    "Adds height, deviation, objective, and monotonic trace.",
    "Adds backtracking monotonic guard.",
    "Adds axiom checks and demo convergence test.",
    "Adds valid-block projection hook for domain-specific constraints.",
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* Vector utilities                                                            */
/* -------------------------------------------------------------------------- */

function assertFiniteVector(x: StateVector, label = "state"): void {
  if (!x || !Array.isArray(x.v)) throw new Error(`${label}: expected { v: number[] }`);
  if (x.v.length === 0) throw new Error(`${label}: vector must be non-empty`);
  for (const value of x.v) {
    if (!Number.isFinite(value)) throw new Error(`${label}: vector contains non-finite value`);
  }
}

function clampPositive(x: number, fallback: number): number {
  return Number.isFinite(x) && x > 0 ? x : fallback;
}

function clampEta(x: number | undefined): number {
  if (x === undefined) return 1;
  if (!Number.isFinite(x)) return 1;
  return Math.max(1e-12, Math.min(1, x));
}

export function cloneState(x: StateVector): StateVector {
  return { v: x.v.slice() };
}

export function dot(a: StateVector, b: StateVector): number {
  const n = Math.min(a.v.length, b.v.length);
  let s = 0;
  for (let i = 0; i < n; i++) s += a.v[i] * b.v[i];
  return s;
}

export function sub(a: StateVector, b: StateVector): StateVector {
  const n = Math.min(a.v.length, b.v.length);
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = a.v[i] - b.v[i];
  return { v: out };
}

export function add(a: StateVector, b: StateVector): StateVector {
  const n = Math.min(a.v.length, b.v.length);
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = a.v[i] + b.v[i];
  return { v: out };
}

export function smul(x: StateVector, k: number): StateVector {
  return { v: x.v.map((value) => value * k) };
}

export function l2(x: StateVector): number {
  return Math.sqrt(dot(x, x));
}

export function euclideanDistance(a: StateVector, b: StateVector): number {
  return l2(sub(a, b));
}

export function squaredDistance(a: StateVector, b: StateVector): number {
  const d = sub(a, b);
  return dot(d, d);
}

export function blend(a: StateVector, b: StateVector, eta: number): StateVector {
  const n = Math.min(a.v.length, b.v.length);
  const e = clampEta(eta);
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = a.v[i] + e * (b.v[i] - a.v[i]);
  return { v: out };
}

/* -------------------------------------------------------------------------- */
/* Runtime defaults                                                            */
/* -------------------------------------------------------------------------- */

export function makeTargetProjector(target: StateVector): Projector {
  assertFiniteVector(target, "target");
  return (_state: StateVector) => cloneState(target);
}

export function makeSubspaceMaskProjector(mask: number[]): Projector {
  if (mask.length === 0) throw new Error("mask must be non-empty");
  return (state: StateVector) => {
    assertFiniteVector(state);
    const n = Math.min(state.v.length, mask.length);
    const out = new Array<number>(n);
    for (let i = 0; i < n; i++) out[i] = mask[i] ? state.v[i] : 0;
    return { v: out };
  };
}

export function defaultHeight(projector: Projector): HeightFunction {
  return (state: StateVector) => euclideanDistance(state, projector(state));
}

export const defaultDeviation: DeviationFunction = (candidate, previous) =>
  euclideanDistance(candidate, previous);

/**
 * Elastic approximation of argmin[h(S′)+λΔ(S′,S)] when height is distance to projection.
 * candidate = (Π_Σ(S) + λ·S)/(1+λ)
 */
export function elasticProjectionCandidate(
  state: StateVector,
  projected: StateVector,
  lambda: number
): StateVector {
  const lam = clampPositive(lambda, 1);
  const n = Math.min(state.v.length, projected.v.length);
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = (projected.v[i] + lam * state.v[i]) / (1 + lam);
  return { v: out };
}

function objectiveValue(
  state: StateVector,
  previous: StateVector,
  height: HeightFunction,
  deviation: DeviationFunction,
  lambda: number
): number {
  return height(state) + lambda * deviation(state, previous);
}

/* -------------------------------------------------------------------------- */
/* HZSO step / iteration                                                       */
/* -------------------------------------------------------------------------- */

export function hzsoStep(state: StateVector, cfg: HZSORuntimeConfig): HZSOStepResult {
  assertFiniteVector(state);
  if (!cfg || typeof cfg.symmetryProjector !== "function") {
    throw new Error("HZSO config requires a symmetryProjector Π_Σ");
  }

  const lambda = clampPositive(cfg.lambda, 1);
  const eta = clampEta(cfg.eta);
  const height = cfg.height ?? defaultHeight(cfg.symmetryProjector);
  const deviation = cfg.deviation ?? defaultDeviation;
  const validProject = cfg.validBlockProjector ?? ((x: StateVector) => x);
  const monotonicGuard = cfg.monotonicGuard ?? true;

  const previous = cloneState(state);
  const heightBefore = height(previous);
  const projected = validProject(cfg.symmetryProjector(previous));
  const candidateRaw = elasticProjectionCandidate(previous, projected, lambda);
  const candidate = validProject(candidateRaw);

  let etaUsed = eta;
  let next = validProject(blend(previous, candidate, etaUsed));
  let heightAfter = height(next);

  if (monotonicGuard && heightAfter > heightBefore) {
    let found = false;
    for (let i = 0; i < 32; i++) {
      etaUsed *= 0.5;
      next = validProject(blend(previous, candidate, etaUsed));
      heightAfter = height(next);
      if (heightAfter <= heightBefore + 1e-12) {
        found = true;
        break;
      }
    }
    if (!found) {
      // Last-resort safe fallback: stay in place rather than increasing height.
      next = previous;
      heightAfter = heightBefore;
      etaUsed = 0;
    }
  }

  const dev = deviation(next, previous);
  const objective = objectiveValue(next, previous, height, deviation, lambda);

  return {
    previous,
    projected,
    candidate,
    next,
    heightBefore,
    heightAfter,
    deviation: dev,
    objective,
    etaUsed,
    monotone: heightAfter <= heightBefore + 1e-12,
  };
}

export function runHZSO(initial: StateVector, cfg: HZSORuntimeConfig): HZSOTrace {
  try {
    assertFiniteVector(initial, "initial");
    const maxIterations = Math.max(1, Math.floor(cfg.maxIterations ?? 256));
    const tolerance = Math.max(0, cfg.tolerance ?? 1e-6);
    const height = cfg.height ?? defaultHeight(cfg.symmetryProjector);

    let current = cloneState(initial);
    const heights: number[] = [height(current)];
    const objectives: number[] = [];
    const deviations: number[] = [];
    const steps: HZSOStepResult[] = [];
    let monotonic = true;

    if (heights[0] <= tolerance) {
      return {
        initial: cloneState(initial),
        final: current,
        heights,
        objectives,
        deviations,
        steps,
        iterations: 0,
        converged: true,
        monotonic: true,
        reason: "height_zero",
      };
    }

    for (let k = 0; k < maxIterations; k++) {
      const step = hzsoStep(current, cfg);
      steps.push(step);
      objectives.push(step.objective);
      deviations.push(step.deviation);
      monotonic = monotonic && step.monotone;
      current = step.next;
      heights.push(step.heightAfter);

      if (step.heightAfter <= tolerance) {
        return {
          initial: cloneState(initial),
          final: current,
          heights,
          objectives,
          deviations,
          steps,
          iterations: k + 1,
          converged: true,
          monotonic,
          reason: "height_zero",
        };
      }
    }

    return {
      initial: cloneState(initial),
      final: current,
      heights,
      objectives,
      deviations,
      steps,
      iterations: maxIterations,
      converged: false,
      monotonic,
      reason: "max_iterations",
    };
  } catch (_err) {
    return {
      initial: cloneState(initial),
      final: cloneState(initial),
      heights: [],
      objectives: [],
      deviations: [],
      steps: [],
      iterations: 0,
      converged: false,
      monotonic: false,
      reason: "invalid_config",
    };
  }
}

export function projectToSymmetryManifold(initial: StateVector, cfg: HZSORuntimeConfig): StateVector {
  return runHZSO(initial, cfg).final;
}

export function isHeightZero(state: StateVector, cfg: HZSORuntimeConfig, tolerance?: number): boolean {
  const h = cfg.height ?? defaultHeight(cfg.symmetryProjector);
  return h(state) <= Math.max(0, tolerance ?? cfg.tolerance ?? 1e-6);
}

export function checkHZSOAxioms(trace: HZSOTrace, tolerance = 1e-6): HZSOAxiomCheck {
  const notes: string[] = [];
  let maxHeightIncrease = 0;

  for (let i = 1; i < trace.heights.length; i++) {
    const increase = trace.heights[i] - trace.heights[i - 1];
    if (increase > maxHeightIncrease) maxHeightIncrease = increase;
  }

  const monotoneHeightDescent = maxHeightIncrease <= tolerance;
  if (!monotoneHeightDescent) {
    notes.push(`Height increased by ${maxHeightIncrease}; monotone descent failed.`);
  }

  const finalHeight = trace.heights.length > 0 ? trace.heights[trace.heights.length - 1] : Number.POSITIVE_INFINITY;
  const convergenceObserved = trace.converged && finalHeight <= tolerance;
  if (!convergenceObserved) notes.push("Height-zero convergence was not reached within tolerance.");

  const fixedPointAtHeightZero = !trace.converged || trace.deviations.length === 0
    ? convergenceObserved
    : trace.deviations[trace.deviations.length - 1] <= Math.max(tolerance, 1e-12) || finalHeight <= tolerance;

  if (!fixedPointAtHeightZero) notes.push("Final state is not yet fixed-point-like.");
  if (notes.length === 0) notes.push("HZSO runtime satisfies the checked descent/convergence conditions for this trace.");

  return {
    monotoneHeightDescent,
    fixedPointAtHeightZero,
    convergenceObserved,
    finalHeight,
    maxHeightIncrease,
    notes,
  };
}

/* -------------------------------------------------------------------------- */
/* Demo / self-test                                                            */
/* -------------------------------------------------------------------------- */

export function demoHZSO(): {
  initialHeight: number;
  finalHeight: number;
  iterations: number;
  converged: boolean;
  monotonic: boolean;
  final: number[];
  axiomCheck: HZSOAxiomCheck;
} {
  const initial: StateVector = { v: [4, -3, 2, 10] };
  const target: StateVector = { v: [0, 0, 0, 0] };

  const cfg: HZSORuntimeConfig = {
    lambda: 0.15,
    eta: 1,
    tolerance: 1e-8,
    maxIterations: 128,
    monotonicGuard: true,
    symmetryProjector: makeTargetProjector(target),
  };

  const trace = runHZSO(initial, cfg);
  const axiomCheck = checkHZSOAxioms(trace, 1e-8);

  return {
    initialHeight: trace.heights[0],
    finalHeight: trace.heights[trace.heights.length - 1],
    iterations: trace.iterations,
    converged: trace.converged,
    monotonic: trace.monotonic,
    final: trace.final.v,
    axiomCheck,
  };
}

export default {
  HZSO_RUNTIME_META,
  hzsoStep,
  runHZSO,
  projectToSymmetryManifold,
  isHeightZero,
  checkHZSOAxioms,
  makeTargetProjector,
  makeSubspaceMaskProjector,
  defaultHeight,
  defaultDeviation,
  demoHZSO,
};

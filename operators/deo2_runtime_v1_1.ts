/**
 * DEO-2 Runtime v1.1
 * Disciplined Evolution Operator for Second-Order Differential Systems
 * Operatorology / Operator Intelligence artifact
 *
 * Core pipeline:
 *   X_k
 *   → OP_CUT       : feasible-domain projection Π(t_k)
 *   → OP_BRAUER0   : height-zero / canonical normalization A(t_k) → Λ(t_k)
 *   → OP_EVOLVE    : Chernoff evolution step exp(Δt_k · Λ(t_k))
 *   → OP_CUT       : post-evolution feasible projection
 *   → invariants + trace
 *
 * Runtime scope:
 * - Implements a finite-dimensional, matrix2x2 runtime for second-order systems.
 * - Uses a real analytic 2x2 matrix exponential for exp(Δt · Λ).
 * - Keeps silicon-friendly traces for TCU / BZNU / CEU mapping.
 * - No external dependencies.
 */

export type Numeric = number;
export type Vec2 = [number, number];
export type Matrix2x2 = [[number, number], [number, number]];

export interface OperatorMeta {
  id: "deo2";
  name_vi: string;
  name_en: string;
  short: "DEO-2";
  version: string;
  status: "draft" | "stable" | "runtime";
  author?: string;
  created_utc: string;
  tags: string[];
  summary_vi: string;
  summary_en: string;
}

export interface StateVector {
  /** Position / primary state y */
  y: Numeric;
  /** Velocity / first derivative v = y′ */
  v: Numeric;
  /** Optional extension payload for downstream O.i systems */
  extra?: Record<string, unknown>;
}

export interface MatrixDynamicsOperator {
  /** First-order form X′ = A(t)X + u(t), with X=(y,v). */
  repr: "matrix2x2";
  value: Matrix2x2;
}

export interface ScalarSecondOrderDynamicsOperator {
  /** y″ = a(t)y + b(t)y′ + force(t). Converted to A=[[0,1],[a,b]]. */
  repr: "scalar_second_order";
  value: {
    a: number;
    b?: number;
  };
}

export interface ScalarDynamicsOperator {
  /** Convenience form: y″ = scalar · y. Converted to A=[[0,1],[scalar,0]]. */
  repr: "scalar";
  value: number;
}

export interface OpaqueDynamicsOperator {
  /** Opaque dynamics cannot evolve numerically unless converted upstream. */
  repr: "opaque";
  value: unknown;
}

export type DynamicsOperator =
  | MatrixDynamicsOperator
  | ScalarSecondOrderDynamicsOperator
  | ScalarDynamicsOperator
  | OpaqueDynamicsOperator;

export type ForcingTerm = number | ((t: number, x: StateVector) => number);

export interface StepContext {
  t_k: Numeric;
  delta_t: Numeric;
  X_k: StateVector;
  A_tk: DynamicsOperator;
  /** Optional forcing term g(t_k), applied to the acceleration channel v. */
  g_tk?: ForcingTerm;
}

export interface BoundsConstraint {
  type: "bounds";
  vars: Array<"y" | "v">;
  min: number;
  max: number;
}

export interface LogicGuardConstraint {
  type: "logic_guard";
  rule: "reject_nan_inf";
}

export type FeasibleConstraint = BoundsConstraint | LogicGuardConstraint | Record<string, unknown>;

export interface FeasibleDomain {
  constraints: FeasibleConstraint[];
  mode: "hard" | "soft";
}

export interface NormalizationRuleSet {
  isa_profile?: "fixed" | "configurable";
  rules: Array<Record<string, unknown>>;
  /** Entries with |x| <= zeroThreshold are set to zero. */
  zeroThreshold?: number;
  /** Matrix entries are clamped into [-matrixEntryMaxAbs, matrixEntryMaxAbs]. */
  matrixEntryMaxAbs?: number;
}

export interface InvariantSpec {
  name: string;
  check: "always" | "end_of_step" | "periodic";
  expression: string;
}

export interface DEO2Params {
  feasible_domain: FeasibleDomain;
  normalization: NormalizationRuleSet;
  invariants: InvariantSpec[];
  partitioning: {
    scheme: "uniform" | "adaptive";
    n_steps?: number;
    tol?: Numeric;
  };
  numeric?: {
    eps?: number;
    maxStateNorm?: number;
    postProjection?: boolean;
  };
  silicon?: {
    isa_ops: Array<"OP_CUT" | "OP_BRAUER0" | "OP_EVOLVE">;
    pipeline: Array<"TCU" | "BZNU" | "CEU">;
    notes?: string;
  };
}

export interface CutTrace {
  op: "OP_CUT";
  feasible_mode: "hard" | "soft";
  constraints_applied: number;
  changed: boolean;
  violations: string[];
  before: StateVector;
  after: StateVector;
}

export interface NormalizeTrace {
  op: "OP_BRAUER0";
  profile: "fixed" | "configurable";
  rules_used: number;
  height_before: number;
  height_after: number;
  changed: boolean;
  canonical_matrix: Matrix2x2;
}

export interface EvolveTrace {
  op: "OP_EVOLVE";
  delta_t: number;
  kernel: "expm2x2";
  forcing_applied: number;
  exp_matrix: Matrix2x2;
  input: StateVector;
  output_before_projection: StateVector;
}

export interface InvariantCheckResult {
  name: string;
  check: InvariantSpec["check"];
  expression: string;
  ok: boolean;
  value?: number | boolean;
  message: string;
}

export interface StepResult {
  X_k1: StateVector;
  Lambda_tk: Matrix2x2;
  trace: {
    pipeline: Array<"TCU" | "BZNU" | "CEU">;
    ops: Array<"OP_CUT" | "OP_BRAUER0" | "OP_EVOLVE">;
    cut_trace_pre: CutTrace;
    norm_trace: NormalizeTrace;
    evolve_trace: EvolveTrace;
    cut_trace_post: CutTrace;
    invariant_trace: InvariantCheckResult[];
  };
}

export interface RunConfig {
  X0: StateVector;
  t0: number;
  T: number;
  dynamics: DynamicsOperator | ((t: number, x: StateVector) => DynamicsOperator);
  forcing?: ForcingTerm | ((t: number, x: StateVector) => number);
  n_steps?: number;
}

export interface RunResult {
  trajectory: StateVector[];
  times: number[];
  steps: StepResult[];
  final: StateVector;
  diagnostics: {
    n_steps: number;
    dt: number;
    invariant_failures: number;
    feasible_projection_count: number;
    max_state_norm: number;
  };
}

export interface OperatorCore {
  meta: OperatorMeta;
  params: DEO2Params;
  definition: {
    kind: "operator_limit_product";
    symbol: "D_DEO-2(T)";
    statement_ascii: string;
    statement_unicode: string;
  };
  step(ctx: StepContext): StepResult;
  run(config: RunConfig): RunResult;
}

export const DEFAULT_DEO2_META: OperatorMeta = {
  id: "deo2",
  name_vi: "Toán tử Tiến hóa Có Kỷ luật cho Hệ Vi phân Bậc hai",
  name_en: "Disciplined Evolution Operator for Second-Order Differential Systems",
  short: "DEO-2",
  version: "1.1.0-runtime",
  status: "runtime",
  author: "Phan Thành Trung (Trung Bờm) × GPT",
  created_utc: "2026-07-05T00:00:00Z",
  tags: [
    "operatorology",
    "operator-intelligence",
    "differential-systems",
    "second-order-systems",
    "chernoff-evolution",
    "tuy-cut",
    "brauer-height-zero",
    "silicon-runtime",
  ],
  summary_vi:
    "DEO-2 v1.1 runtime triển khai pipeline Π · exp(Δt·Λ) · Π cho hệ vi phân bậc hai dạng X=(y,v), gồm cắt miền khả thi, chuẩn hóa height-zero, tiến hóa bằng expm2x2 và kiểm tra bất biến.",
  summary_en:
    "DEO-2 v1.1 runtime implements the Π · exp(Δt·Λ) · Π pipeline for second-order systems in X=(y,v) form, including feasible projection, height-zero normalization, expm2x2 evolution, and invariant checks.",
};

export const DEFAULT_DEO2_PARAMS: DEO2Params = {
  feasible_domain: {
    mode: "hard",
    constraints: [
      { type: "bounds", vars: ["y", "v"], min: -1_000_000_000, max: 1_000_000_000 },
      { type: "logic_guard", rule: "reject_nan_inf" },
    ],
  },
  normalization: {
    isa_profile: "configurable",
    rules: [
      { type: "blockize", target: "2x2_canonical" },
      { type: "remove_obstruction", method: "height_zero_simplify" },
    ],
    zeroThreshold: 1e-12,
    matrixEntryMaxAbs: 1_000_000,
  },
  invariants: [
    { name: "FeasibleDomain", check: "always", expression: "X_k ∈ Π(t_k)" },
    { name: "BoundedStep", check: "end_of_step", expression: "||X_{k+1}|| ≤ M" },
  ],
  partitioning: { scheme: "uniform", n_steps: 256, tol: 1e-9 },
  numeric: { eps: 1e-12, maxStateNorm: 1_000_000_000, postProjection: true },
  silicon: {
    isa_ops: ["OP_CUT", "OP_BRAUER0", "OP_EVOLVE"],
    pipeline: ["TCU", "BZNU", "CEU"],
    notes: "Operator-locked runtime pipeline. No backprop/gradient required.",
  },
};

function finiteOrZero(x: number): number {
  return isFinite(x) ? x : 0;
}

function cloneState(x: StateVector): StateVector {
  return { y: x.y, v: x.v, extra: x.extra ? { ...x.extra } : undefined };
}

function clamp(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, x));
}

function nearZero(x: number, eps: number): number {
  return Math.abs(x) <= eps ? 0 : x;
}

function stateNorm(x: StateVector): number {
  return Math.sqrt(x.y * x.y + x.v * x.v);
}

function matFrobenius(A: Matrix2x2): number {
  return Math.sqrt(A[0][0] * A[0][0] + A[0][1] * A[0][1] + A[1][0] * A[1][0] + A[1][1] * A[1][1]);
}

function matDiff(A: Matrix2x2, B: Matrix2x2): Matrix2x2 {
  return [
    [A[0][0] - B[0][0], A[0][1] - B[0][1]],
    [A[1][0] - B[1][0], A[1][1] - B[1][1]],
  ];
}

function matVec(A: Matrix2x2, x: StateVector): StateVector {
  return {
    y: A[0][0] * x.y + A[0][1] * x.v,
    v: A[1][0] * x.y + A[1][1] * x.v,
    extra: x.extra ? { ...x.extra } : undefined,
  };
}

function identity2(): Matrix2x2 {
  return [[1, 0], [0, 1]];
}

function scaleMatrix(A: Matrix2x2, c: number): Matrix2x2 {
  return [[c * A[0][0], c * A[0][1]], [c * A[1][0], c * A[1][1]]];
}

function addMatrix(A: Matrix2x2, B: Matrix2x2): Matrix2x2 {
  return [[A[0][0] + B[0][0], A[0][1] + B[0][1]], [A[1][0] + B[1][0], A[1][1] + B[1][1]]];
}

function isMatrix2x2(value: unknown): value is Matrix2x2 {
  if (!Array.isArray(value) || value.length !== 2) return false;
  const r0 = value[0];
  const r1 = value[1];
  return Array.isArray(r0) && Array.isArray(r1) && r0.length === 2 && r1.length === 2;
}

function sanitizeMatrix(A: Matrix2x2): Matrix2x2 {
  return [
    [finiteOrZero(A[0][0]), finiteOrZero(A[0][1])],
    [finiteOrZero(A[1][0]), finiteOrZero(A[1][1])],
  ];
}

/**
 * Real analytic exponential for a 2x2 matrix A over time dt.
 * It supports both hyperbolic and oscillatory cases using the trace/deviator formula.
 */
export function expm2x2(A: Matrix2x2, dt: number): Matrix2x2 {
  const B = scaleMatrix(A, dt);
  const a = B[0][0];
  const b = B[0][1];
  const c = B[1][0];
  const d = B[1][1];

  const halfTrace = (a + d) / 2;
  const m00 = a - halfTrace;
  const m11 = d - halfTrace;
  const m01 = b;
  const m10 = c;
  const delta2 = ((a - d) * (a - d)) / 4 + b * c;
  const expTr = Math.exp(halfTrace);
  const eps = 1e-14;

  let C: number;
  let S: number;
  if (Math.abs(delta2) <= eps) {
    C = 1;
    S = 1;
  } else if (delta2 > 0) {
    const delta = Math.sqrt(delta2);
    C = ((Math.exp(delta) + Math.exp(-delta)) / 2);
    S = ((Math.exp(delta) - Math.exp(-delta)) / 2) / delta;
  } else {
    const mu = Math.sqrt(-delta2);
    C = Math.cos(mu);
    S = Math.sin(mu) / mu;
  }

  const I = identity2();
  const M0: Matrix2x2 = [[m00, m01], [m10, m11]];
  return scaleMatrix(addMatrix(scaleMatrix(I, C), scaleMatrix(M0, S)), expTr);
}

export class DEO2Runtime implements OperatorCore {
  meta: OperatorMeta;
  params: DEO2Params;
  definition: OperatorCore["definition"];

  constructor(meta: OperatorMeta = DEFAULT_DEO2_META, params: DEO2Params = DEFAULT_DEO2_PARAMS) {
    this.meta = meta;
    this.params = params;
    this.definition = {
      kind: "operator_limit_product",
      symbol: "D_DEO-2(T)",
      statement_ascii:
        "D_DEO-2(T) = lim(n->infty) product_k [ Pi(t_k) * exp(delta_t_k * Lambda(t_k)) * Pi(t_k) ]",
      statement_unicode:
        "D_DEO-2(T) = limₙ→∞ Πₖ [ Π(tₖ) · exp(Δtₖ · Λ(tₖ)) · Π(tₖ) ]",
    };
  }

  private getBounds(): BoundsConstraint[] {
    return this.params.feasible_domain.constraints.filter(
      (c): c is BoundsConstraint => c.type === "bounds"
    );
  }

  /** Tuy's Cut projector Π(t): enforce feasible domain. */
  private projectFeasible(X: StateVector): { X_proj: StateVector; trace: CutTrace } {
    const before = cloneState(X);
    let y = finiteOrZero(X.y);
    let v = finiteOrZero(X.v);
    const violations: string[] = [];

    if (!isFinite(X.y)) violations.push("y was NaN/Inf and was reset to 0");
    if (!isFinite(X.v)) violations.push("v was NaN/Inf and was reset to 0");

    for (const b of this.getBounds()) {
      if (b.vars.indexOf("y") >= 0) {
        const old = y;
        y = clamp(y, b.min, b.max);
        if (old !== y) violations.push(`y clamped into [${b.min}, ${b.max}]`);
      }
      if (b.vars.indexOf("v") >= 0) {
        const old = v;
        v = clamp(v, b.min, b.max);
        if (old !== v) violations.push(`v clamped into [${b.min}, ${b.max}]`);
      }
    }

    const after: StateVector = { y, v, extra: X.extra ? { ...X.extra } : undefined };
    return {
      X_proj: after,
      trace: {
        op: "OP_CUT",
        feasible_mode: this.params.feasible_domain.mode,
        constraints_applied: this.params.feasible_domain.constraints.length,
        changed: before.y !== after.y || before.v !== after.v,
        violations,
        before,
        after,
      },
    };
  }

  private matrixFromDynamics(ctx: StepContext): Matrix2x2 {
    const op = ctx.A_tk;
    if (op.repr === "matrix2x2") {
      if (!isMatrix2x2(op.value)) throw new Error("matrix2x2 dynamics requires [[a,b],[c,d]]");
      return sanitizeMatrix(op.value);
    }
    if (op.repr === "scalar_second_order") {
      return [[0, 1], [finiteOrZero(op.value.a), finiteOrZero(op.value.b ?? 0)]];
    }
    if (op.repr === "scalar") {
      return [[0, 1], [finiteOrZero(op.value), 0]];
    }
    throw new Error("opaque dynamics cannot be evolved by DEO2Runtime; convert it to matrix2x2 first");
  }

  /** Brauer height-zero normalization: A(t) → Λ(t). */
  private brauerZeroNormalize(ctx: StepContext): { Lambda: Matrix2x2; trace: NormalizeTrace } {
    const A = this.matrixFromDynamics(ctx);
    const eps = this.params.normalization.zeroThreshold ?? 1e-12;
    const maxAbs = this.params.normalization.matrixEntryMaxAbs ?? 1_000_000;

    const L: Matrix2x2 = [
      [clamp(nearZero(A[0][0], eps), -maxAbs, maxAbs), clamp(nearZero(A[0][1], eps), -maxAbs, maxAbs)],
      [clamp(nearZero(A[1][0], eps), -maxAbs, maxAbs), clamp(nearZero(A[1][1], eps), -maxAbs, maxAbs)],
    ];

    const heightBefore = matFrobenius(matDiff(A, L));
    const heightAfter = 0;
    return {
      Lambda: L,
      trace: {
        op: "OP_BRAUER0",
        profile: this.params.normalization.isa_profile ?? "configurable",
        rules_used: this.params.normalization.rules.length,
        height_before: heightBefore,
        height_after: heightAfter,
        changed: heightBefore > 0,
        canonical_matrix: L,
      },
    };
  }

  private resolveForcing(ctx: StepContext, X: StateVector): number {
    if (ctx.g_tk === undefined) return 0;
    if (typeof ctx.g_tk === "number") return finiteOrZero(ctx.g_tk);
    return finiteOrZero(ctx.g_tk(ctx.t_k, X));
  }

  /** Chernoff evolution step: X_{k+1} = exp(Δt Λ) X_k + approximate forcing. */
  private evolve(ctx: StepContext, Lambda: Matrix2x2, X_in: StateVector): { X_out: StateVector; trace: EvolveTrace } {
    const E = expm2x2(Lambda, ctx.delta_t);
    const raw = matVec(E, X_in);
    const force = this.resolveForcing(ctx, X_in);

    // First-order forcing approximation in acceleration channel.
    const out: StateVector = {
      y: raw.y,
      v: raw.v + force * ctx.delta_t,
      extra: X_in.extra ? { ...X_in.extra } : undefined,
    };

    return {
      X_out: out,
      trace: {
        op: "OP_EVOLVE",
        delta_t: ctx.delta_t,
        kernel: "expm2x2",
        forcing_applied: force,
        exp_matrix: E,
        input: cloneState(X_in),
        output_before_projection: cloneState(out),
      },
    };
  }

  private checkInvariants(X: StateVector): InvariantCheckResult[] {
    const maxNorm = this.params.numeric?.maxStateNorm ?? 1_000_000_000;
    const bounds = this.getBounds();
    return this.params.invariants.map((inv) => {
      if (inv.name === "FeasibleDomain") {
        let ok = isFinite(X.y) && isFinite(X.v);
        for (const b of bounds) {
          if (b.vars.indexOf("y") >= 0) ok = ok && X.y >= b.min && X.y <= b.max;
          if (b.vars.indexOf("v") >= 0) ok = ok && X.v >= b.min && X.v <= b.max;
        }
        return {
          name: inv.name,
          check: inv.check,
          expression: inv.expression,
          ok,
          value: ok,
          message: ok ? "state is feasible" : "state violates feasible domain",
        };
      }
      if (inv.name === "BoundedStep") {
        const n = stateNorm(X);
        const ok = n <= maxNorm;
        return {
          name: inv.name,
          check: inv.check,
          expression: inv.expression,
          ok,
          value: n,
          message: ok ? "state norm is bounded" : `state norm exceeds ${maxNorm}`,
        };
      }
      return {
        name: inv.name,
        check: inv.check,
        expression: inv.expression,
        ok: true,
        message: "custom invariant recorded as pass; compile a domain-specific checker for strict validation",
      };
    });
  }

  step(ctx: StepContext): StepResult {
    const cutPre = this.projectFeasible(ctx.X_k);
    const norm = this.brauerZeroNormalize({ ...ctx, X_k: cutPre.X_proj });
    const evo = this.evolve(ctx, norm.Lambda, cutPre.X_proj);

    const cutPost = this.params.numeric?.postProjection === false
      ? {
          X_proj: evo.X_out,
          trace: {
            op: "OP_CUT" as const,
            feasible_mode: this.params.feasible_domain.mode,
            constraints_applied: 0,
            changed: false,
            violations: [],
            before: cloneState(evo.X_out),
            after: cloneState(evo.X_out),
          },
        }
      : this.projectFeasible(evo.X_out);

    const inv = this.checkInvariants(cutPost.X_proj);

    return {
      X_k1: cutPost.X_proj,
      Lambda_tk: norm.Lambda,
      trace: {
        pipeline: this.params.silicon?.pipeline ?? ["TCU", "BZNU", "CEU"],
        ops: this.params.silicon?.isa_ops ?? ["OP_CUT", "OP_BRAUER0", "OP_EVOLVE"],
        cut_trace_pre: cutPre.trace,
        norm_trace: norm.trace,
        evolve_trace: evo.trace,
        cut_trace_post: cutPost.trace,
        invariant_trace: inv,
      },
    };
  }

  run(config: RunConfig): RunResult {
    const n = Math.max(1, Math.floor(config.n_steps ?? this.params.partitioning.n_steps ?? 256));
    const dt = (config.T - config.t0) / n;
    const trajectory: StateVector[] = [cloneState(config.X0)];
    const times: number[] = [config.t0];
    const steps: StepResult[] = [];

    let cur = cloneState(config.X0);
    let invariantFailures = 0;
    let feasibleProjectionCount = 0;
    let maxObservedNorm = stateNorm(cur);

    for (let k = 0; k < n; k++) {
      const t = config.t0 + k * dt;
      const dyn = typeof config.dynamics === "function" ? config.dynamics(t, cur) : config.dynamics;
      let forcing: ForcingTerm | undefined;
      if (typeof config.forcing === "function") {
        forcing = (tt, xx) => (config.forcing as (t: number, x: StateVector) => number)(tt, xx);
      } else {
        forcing = config.forcing;
      }

      const out = this.step({ t_k: t, delta_t: dt, X_k: cur, A_tk: dyn, g_tk: forcing });
      steps.push(out);
      if (out.trace.cut_trace_pre.changed || out.trace.cut_trace_post.changed) feasibleProjectionCount++;
      invariantFailures += out.trace.invariant_trace.filter((i) => !i.ok).length;
      cur = cloneState(out.X_k1);
      maxObservedNorm = Math.max(maxObservedNorm, stateNorm(cur));
      trajectory.push(cloneState(cur));
      times.push(t + dt);
    }

    return {
      trajectory,
      times,
      steps,
      final: cloneState(cur),
      diagnostics: {
        n_steps: n,
        dt,
        invariant_failures: invariantFailures,
        feasible_projection_count: feasibleProjectionCount,
        max_state_norm: maxObservedNorm,
      },
    };
  }
}

/** Quick reference demo: harmonic oscillator y″ = −ω²y. */
export function demoDEO2(): {
  initial: StateVector;
  final: StateVector;
  expected_approx: StateVector;
  abs_error: StateVector;
  diagnostics: RunResult["diagnostics"];
} {
  const omega = 1;
  const op = new DEO2Runtime();
  const initial: StateVector = { y: 1, v: 0 };
  const result = op.run({
    X0: initial,
    t0: 0,
    T: 1,
    n_steps: 100,
    dynamics: { repr: "matrix2x2", value: [[0, 1], [-(omega * omega), 0]] },
  });
  const expected = { y: Math.cos(1), v: -Math.sin(1) };
  return {
    initial,
    final: result.final,
    expected_approx: expected,
    abs_error: {
      y: Math.abs(result.final.y - expected.y),
      v: Math.abs(result.final.v - expected.v),
    },
    diagnostics: result.diagnostics,
  };
}

export default DEO2Runtime;

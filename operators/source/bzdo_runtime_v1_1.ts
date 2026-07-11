/**
 * BZDO v1.1 — Brauer-Zero Dissolution Operator Runtime
 * Operatorology / Operator Intelligence artifact
 *
 * Purpose
 * -------
 * BZDO models conditional dissolution of a constraint-locked character state.
 * When a state no longer has a valid constraint block, or when its height / obstruction
 * reaches the irreducible base layer h ≈ 0, BZDO returns the state to the ground
 * symmetry / invariance projection Π_G(x).
 *
 * Core rule
 * ---------
 * invalid block  ⇒  x ↦ Π_G(x)
 * h(x,C) ≈ 0     ⇒  x ↦ Π_G(x)
 * h(x,C) > 0     ⇒  retain character in block B_C   [strict mode]
 *
 * Optional continuous mode
 * ------------------------
 * R(x;C) = (1 − α(h))x + α(h)Π_G(x), with α(0)=1 and α(h)→0 as h→∞.
 * This is disabled by default to preserve the strict BZDO safety policy.
 *
 * No external dependencies. Unicode symbols are preserved in metadata strings.
 */

export type BZDOMode = "retain" | "dissolve" | "force_symmetry" | "partial_release" | "invalid_retain";
export type BZDOReleasePolicy = "strict" | "continuous";
export type BZDOInvalidBlockPolicy = "force_symmetry" | "retain";

export interface BZDOConfig {
  /** Height tolerance treated as height-zero. Default: 1e-9. */
  epsilonHeight?: number;
  /** Alpha decay coefficient α(h)=exp(-k·h). Default: 1. */
  alphaK?: number;
  /** Strict: dissolve only at h≈0. Continuous: apply release interpolation for h>0. Default: strict. */
  releasePolicy?: BZDOReleasePolicy;
  /** What to do if block/constraint is invalid. Default: force_symmetry. */
  invalidBlockPolicy?: BZDOInvalidBlockPolicy;
  /** Minimum α required for partial release in continuous mode. Default: 1e-6. */
  minPartialAlpha?: number;
  /** Safety clamp for α in [0,1]. Default: true. */
  clampAlpha?: boolean;
  /** Optional label for tracing. */
  traceLabel?: string;
}

export interface BZDOHooks<TState, TProjection = TState> {
  /** Π_G(x): projection to ground symmetry / invariance representative. */
  projectPiG: (x: TState) => TProjection;
  /** h(x,C): non-negative height / obstruction under the active constraint block. */
  height: (x: TState, C: unknown) => number;
  /** Whether the constraint block is valid. Missing means true. */
  hasValidBlock?: (x: TState, C: unknown) => boolean;
  /** Optional character score χ(x) for diagnostics. */
  character?: (x: TState) => number;
  /** Optional release interpolation R(x;C) = blend(x, Π_G(x), α). */
  blendRelease?: (x: TState, projection: TProjection, alpha: number) => TState | TProjection;
  /** Optional state validator. */
  validateState?: (x: TState) => boolean;
  /** Optional distance for axiom checks. */
  distance?: (a: TState | TProjection, b: TState | TProjection) => number;
}

export interface BZDOInput<TState> {
  x: TState;
  C: unknown;
  G?: unknown;
  config?: BZDOConfig;
}

export interface BZDOTraceEntry {
  stage: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface BZDOResult<TState, TProjection = TState> {
  valid: boolean;
  mode: BZDOMode;
  input: TState;
  projection?: TProjection;
  output: TState | TProjection;
  height: number;
  alpha: number;
  reasons: string[];
  trace: BZDOTraceEntry[];
  diagnostics: {
    hadValidBlock: boolean;
    heightIsZero: boolean;
    releasePolicy: BZDOReleasePolicy;
    characterBefore?: number;
    characterAfter?: number;
    stateValidBefore?: boolean;
    stateValidAfter?: boolean;
  };
}

export interface BZDOBatchResult<TState, TProjection = TState> {
  results: Array<BZDOResult<TState, TProjection>>;
  summary: {
    total: number;
    retain: number;
    dissolve: number;
    force_symmetry: number;
    partial_release: number;
    invalid_retain: number;
  };
}

export interface BZDOAxiomReport {
  alphaAtZero: boolean;
  alphaDecreases: boolean;
  strictZeroDissolves: boolean;
  invalidBlockForcesSymmetry: boolean;
  passed: boolean;
  notes: string[];
}

export const BZDO_METADATA = Object.freeze({
  id: "BZDO",
  version: "1.1.0-runtime",
  title: "Brauer-Zero Dissolution Operator",
  title_vi: "Toán tử Hòa Tan Brauer-Zero",
  class: "Valid-Cut / Dissolution / Symmetry-Return",
  core_rule: "Release(C) ∧ h≈0 ⇒ x ↦ Π_G(x)",
  release_form: "R(x;C) = (1−α(h))x + α(h)Π_G(x), α(0)=1, α(h)→0 as h→∞",
  safety_rule: "BZDO does not dissolve unconditionally; it activates on height-zero or invalid constraint block.",
} as const);

function push(trace: BZDOTraceEntry[], stage: string, message: string, data?: Record<string, unknown>) {
  trace.push({ stage, message, ...(data ? { data } : {}) });
}

export function defaultBZDOConfig(config?: BZDOConfig): Required<Omit<BZDOConfig, "traceLabel">> & { traceLabel?: string } {
  return {
    epsilonHeight: config?.epsilonHeight ?? 1e-9,
    alphaK: config?.alphaK ?? 1,
    releasePolicy: config?.releasePolicy ?? "strict",
    invalidBlockPolicy: config?.invalidBlockPolicy ?? "force_symmetry",
    minPartialAlpha: config?.minPartialAlpha ?? 1e-6,
    clampAlpha: config?.clampAlpha ?? true,
    ...(config?.traceLabel ? { traceLabel: config.traceLabel } : {}),
  };
}

/** α(h)=exp(-k·h), with α(0)=1 and α(h)→0 as h→∞. */
export function alphaFromHeight(h: number, k = 1, clamp = true): number {
  if (!Number.isFinite(h) || h < 0) return 0;
  const a = Math.exp(-Math.max(0, k) * h);
  if (!clamp) return a;
  return Math.max(0, Math.min(1, a));
}

export function isHeightZero(h: number, epsilonHeight = 1e-9): boolean {
  return Number.isFinite(h) && h >= 0 && h <= Math.max(0, epsilonHeight);
}

export function runBZDO<TState, TProjection = TState>(
  input: BZDOInput<TState>,
  hooks: BZDOHooks<TState, TProjection>
): BZDOResult<TState, TProjection> {
  const cfg = defaultBZDOConfig(input.config);
  const trace: BZDOTraceEntry[] = [];
  const reasons: string[] = [];

  push(trace, "start", "BZDO runtime started.", { label: cfg.traceLabel ?? "BZDO", policy: cfg.releasePolicy });

  const stateValidBefore = hooks.validateState ? hooks.validateState(input.x) : true;
  const hadValidBlock = hooks.hasValidBlock ? hooks.hasValidBlock(input.x, input.C) : true;
  const characterBefore = hooks.character ? hooks.character(input.x) : undefined;

  push(trace, "validate", "Input state and constraint block checked.", {
    stateValidBefore,
    hadValidBlock,
    characterBefore,
  });

  if (!stateValidBefore) {
    reasons.push("Input state failed validateState(); BZDO retains state as invalid_retain for safety.");
    push(trace, "safety", "Invalid input state retained; no projection applied.");
    return {
      valid: false,
      mode: "invalid_retain",
      input: input.x,
      output: input.x,
      height: -1,
      alpha: 0,
      reasons,
      trace,
      diagnostics: {
        hadValidBlock,
        heightIsZero: false,
        releasePolicy: cfg.releasePolicy,
        characterBefore,
        stateValidBefore,
        stateValidAfter: stateValidBefore,
      },
    };
  }

  if (!hadValidBlock) {
    if (cfg.invalidBlockPolicy === "retain") {
      reasons.push("Constraint block is invalid, but invalidBlockPolicy=retain; state retained for safety.");
      push(trace, "invalid_block", "Invalid block retained by policy.");
      return {
        valid: true,
        mode: "invalid_retain",
        input: input.x,
        output: input.x,
        height: -1,
        alpha: 0,
        reasons,
        trace,
        diagnostics: {
          hadValidBlock,
          heightIsZero: false,
          releasePolicy: cfg.releasePolicy,
          characterBefore,
          stateValidBefore,
          stateValidAfter: true,
        },
      };
    }

    const projection = hooks.projectPiG(input.x);
    const characterAfter = hooks.character ? safeCharacter(hooks.character, projection as unknown as TState) : undefined;
    const stateValidAfter = hooks.validateState ? safeValidate(hooks.validateState, projection as unknown as TState) : true;
    reasons.push("Constraint block is invalid ⇒ force symmetry projection Π_G(x).");
    reasons.push("Invalid block is treated as hallucination / unsupported character; BZDO returns to invariance baseline.");
    push(trace, "force_symmetry", "Block invalid; projected to Π_G(x).", { alpha: 1 });

    return {
      valid: true,
      mode: "force_symmetry",
      input: input.x,
      projection,
      output: projection,
      height: 0,
      alpha: 1,
      reasons,
      trace,
      diagnostics: {
        hadValidBlock,
        heightIsZero: true,
        releasePolicy: cfg.releasePolicy,
        characterBefore,
        characterAfter,
        stateValidBefore,
        stateValidAfter,
      },
    };
  }

  const h = hooks.height(input.x, input.C);
  if (!Number.isFinite(h) || h < 0) {
    reasons.push("Height h(x,C) is invalid or negative ⇒ retain state for safety.");
    push(trace, "height", "Invalid height; state retained.", { height: h });
    return {
      valid: false,
      mode: "invalid_retain",
      input: input.x,
      output: input.x,
      height: Number.isFinite(h) ? h : -1,
      alpha: 0,
      reasons,
      trace,
      diagnostics: {
        hadValidBlock,
        heightIsZero: false,
        releasePolicy: cfg.releasePolicy,
        characterBefore,
        stateValidBefore,
        stateValidAfter: true,
      },
    };
  }

  const heightIsZero = isHeightZero(h, cfg.epsilonHeight);
  const alpha = alphaFromHeight(h, cfg.alphaK, cfg.clampAlpha);
  push(trace, "height", "Height evaluated.", { height: h, epsilonHeight: cfg.epsilonHeight, heightIsZero, alpha });

  const projection = hooks.projectPiG(input.x);

  if (heightIsZero) {
    const characterAfter = hooks.character ? safeCharacter(hooks.character, projection as unknown as TState) : undefined;
    const stateValidAfter = hooks.validateState ? safeValidate(hooks.validateState, projection as unknown as TState) : true;
    reasons.push("h≈0 ⇒ BZDO dissolves character into symmetry projection Π_G(x).");
    reasons.push("At the irreducible base layer, character is no longer protected by obstruction.");
    push(trace, "dissolve", "Height-zero reached; projected to Π_G(x).", { alpha: 1 });
    return {
      valid: true,
      mode: "dissolve",
      input: input.x,
      projection,
      output: projection,
      height: h,
      alpha: 1,
      reasons,
      trace,
      diagnostics: {
        hadValidBlock,
        heightIsZero,
        releasePolicy: cfg.releasePolicy,
        characterBefore,
        characterAfter,
        stateValidBefore,
        stateValidAfter,
      },
    };
  }

  if (cfg.releasePolicy === "continuous" && alpha >= cfg.minPartialAlpha) {
    const released = hooks.blendRelease ? hooks.blendRelease(input.x, projection, alpha) : projection;
    const characterAfter = hooks.character ? safeCharacter(hooks.character, released as unknown as TState) : undefined;
    const stateValidAfter = hooks.validateState ? safeValidate(hooks.validateState, released as unknown as TState) : true;
    reasons.push("h>0 but releasePolicy=continuous ⇒ partial release R(x;C) applied.");
    reasons.push("Strict BZDO mode would retain; continuous mode is optional for smooth simulations.");
    push(trace, "partial_release", "Continuous release interpolation applied.", { alpha });
    return {
      valid: true,
      mode: "partial_release",
      input: input.x,
      projection,
      output: released,
      height: h,
      alpha,
      reasons,
      trace,
      diagnostics: {
        hadValidBlock,
        heightIsZero,
        releasePolicy: cfg.releasePolicy,
        characterBefore,
        characterAfter,
        stateValidBefore,
        stateValidAfter,
      },
    };
  }

  reasons.push("h>0 ⇒ obstruction remains; character is retained inside its constraint block B_C.");
  reasons.push("Strict BZDO does not dissolve before height-zero.");
  push(trace, "retain", "Height is positive; state retained.", { alpha });

  return {
    valid: true,
    mode: "retain",
    input: input.x,
    projection,
    output: input.x,
    height: h,
    alpha,
    reasons,
    trace,
    diagnostics: {
      hadValidBlock,
      heightIsZero,
      releasePolicy: cfg.releasePolicy,
      characterBefore,
      stateValidBefore,
      stateValidAfter: true,
    },
  };
}

function safeCharacter<TState>(fn: (x: TState) => number, x: TState): number | undefined {
  try {
    const y = fn(x);
    return Number.isFinite(y) ? y : undefined;
  } catch {
    return undefined;
  }
}

function safeValidate<TState>(fn: (x: TState) => boolean, x: TState): boolean {
  try {
    return !!fn(x);
  } catch {
    return false;
  }
}

export function runBZDOBatch<TState, TProjection = TState>(
  inputs: Array<BZDOInput<TState>>,
  hooks: BZDOHooks<TState, TProjection>
): BZDOBatchResult<TState, TProjection> {
  const results = inputs.map((input) => runBZDO(input, hooks));
  const summary = {
    total: results.length,
    retain: 0,
    dissolve: 0,
    force_symmetry: 0,
    partial_release: 0,
    invalid_retain: 0,
  };
  for (const r of results) summary[r.mode] += 1;
  return { results, summary };
}

/* ------------------------- Numeric vector helpers ------------------------- */

export type Vector = number[];

export interface VectorConstraintBlock {
  /** Optional coordinate-wise min bound. */
  min?: number;
  /** Optional coordinate-wise max bound. */
  max?: number;
  /** If false, hasValidBlock returns false. */
  valid?: boolean;
  /** Optional height override; useful to simulate h≈0. */
  heightOverride?: number;
}

export interface VectorBZDOOptions {
  /** Ground symmetry representative. Default: zero vector of input dimension. */
  symmetryPoint?: Vector;
  /** Optional custom projector. */
  projector?: (x: Vector) => Vector;
  /** Height as distance to projection by default. */
  heightMode?: "distance_to_projection" | "constraint_override_or_distance";
}

export function l2Distance(a: Vector, b: Vector): number {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  if (a.length !== b.length) s += Math.abs(a.length - b.length);
  return Math.sqrt(s);
}

export function isFiniteVector(x: Vector): boolean {
  return Array.isArray(x) && x.length > 0 && x.every(Number.isFinite);
}

export function blendVector(x: Vector, projection: Vector, alpha: number): Vector {
  const n = Math.min(x.length, projection.length);
  const a = Math.max(0, Math.min(1, alpha));
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push((1 - a) * x[i] + a * projection[i]);
  return out;
}

export function createVectorBZDOHooks(options: VectorBZDOOptions = {}): BZDOHooks<Vector, Vector> {
  const projectPiG = (x: Vector): Vector => {
    if (options.projector) return options.projector(x).slice();
    const point = options.symmetryPoint ?? new Array(x.length).fill(0);
    if (point.length !== x.length) throw new Error("symmetryPoint dimension mismatch");
    return point.slice();
  };

  return {
    projectPiG,
    height: (x: Vector, C: unknown): number => {
      const block = C as VectorConstraintBlock | undefined;
      if (options.heightMode === "constraint_override_or_distance" && block?.heightOverride !== undefined) {
        return block.heightOverride;
      }
      return l2Distance(x, projectPiG(x));
    },
    hasValidBlock: (x: Vector, C: unknown): boolean => {
      const block = C as VectorConstraintBlock | undefined;
      if (block?.valid === false) return false;
      if (!isFiniteVector(x)) return false;
      if (block?.min !== undefined && x.some((v) => v < block.min!)) return false;
      if (block?.max !== undefined && x.some((v) => v > block.max!)) return false;
      return true;
    },
    character: (x: Vector): number => l2Distance(x, projectPiG(x)),
    blendRelease: blendVector,
    validateState: isFiniteVector,
    distance: (a, b) => l2Distance(a as Vector, b as Vector),
  };
}

/* ------------------------ O.i intermediate representation ------------------------ */

export interface OiEntity { name: string; symbol: string; }
export interface OiConstraint { id: string; priority: string; description_vi: string; }

export interface BzdoSpecLike {
  id: string;
  version: string;
  title: string;
  title_vi: string;
  meaning_vi?: string;
  definition?: {
    boxed_latex?: string;
    release_operator?: {
      latex?: string;
      alpha_map?: { latex?: string; constraints?: Array<{ rule: string; meaning_vi: string }> };
      special_case?: { boxed_latex?: string; meaning_vi?: string };
    };
  };
  proposition_lock?: { latex: string; meaning_vi: string };
  compact_rule?: { boxed_latex: string; meaning_vi: string };
  ui_hints?: { objective_display?: string; entities?: OiEntity[]; constraints?: OiConstraint[] };
  activation_policy?: { hard_trigger?: string[]; safety_vi?: string };
}

export interface OiIntermediateBlock {
  translation_id: string;
  title_vi: string;
  objective: string;
  entities: OiEntity[];
  constraints: Array<{ id: string; priority: string; text_vi: string }>;
  formulas: {
    definition: string;
    release: string;
    alpha: string;
    special_case: string;
    proposition?: string;
    compact_rule?: string;
  };
  diagram: { mermaid: string };
  notes: string[];
}

export function makeTranslationId(prefix = "BZDO"): string {
  const rand = Math.random().toString(16).slice(2, 10).toUpperCase();
  const time = Date.now().toString(16).slice(-6).toUpperCase();
  return `${prefix}-${rand}${time}`;
}

export function buildMermaidBZDO(): string {
  return `
flowchart TD
  A[Input state x] --> V{State valid?}
  V -->|No| IR[Invalid retain]
  V -->|Yes| B{Constraint block valid?}
  B -->|No| P[Force symmetry: x ↦ Π_G(x)]
  B -->|Yes| H{Height h(x,C) ≤ ε?}
  H -->|Yes| D[Dissolve: x ↦ Π_G(x)]
  H -->|No strict mode| R[Retain character in block B_C]
  H -->|No continuous mode| PR[Partial release: R(x;C)]
  IR --> O[Output]
  P --> O
  D --> O
  R --> O
  PR --> O
`.trim();
}

export function toOiIntermediate(spec: BzdoSpecLike): OiIntermediateBlock {
  const entities = spec.ui_hints?.entities ?? [
    { name: "State", symbol: "x" },
    { name: "Constraints", symbol: "C" },
    { name: "Symmetry_Group", symbol: "G" },
    { name: "Projection", symbol: "Π_G" },
    { name: "Character", symbol: "χ" },
    { name: "Height", symbol: "h" },
    { name: "Alpha", symbol: "α(h)" },
  ];

  const notes: string[] = [];
  if (spec.meaning_vi) notes.push(spec.meaning_vi);
  if (spec.activation_policy?.safety_vi) notes.push(spec.activation_policy.safety_vi);
  notes.push(BZDO_METADATA.safety_rule);

  return {
    translation_id: makeTranslationId(),
    title_vi: spec.title_vi,
    objective: spec.ui_hints?.objective_display ?? "VALIDATE → Character_Stability_And_Dissolution",
    entities,
    constraints: (spec.ui_hints?.constraints ?? []).map((c) => ({ id: c.id, priority: c.priority, text_vi: c.description_vi })),
    formulas: {
      definition: spec.definition?.boxed_latex ?? "D_BZ(x;C,G) := Π_G(R(x;C))",
      release: spec.definition?.release_operator?.latex ?? "R(x;C) = (1−α)x + αΠ_G(x)",
      alpha: spec.definition?.release_operator?.alpha_map?.latex ?? "α: ℝ_{≥0} → [0,1]",
      special_case: spec.definition?.release_operator?.special_case?.boxed_latex ?? "h(x,C)=0 ⇒ D_BZ(x;C,G)=Π_G(x)",
      proposition: spec.proposition_lock?.latex,
      compact_rule: spec.compact_rule?.boxed_latex,
    },
    diagram: { mermaid: buildMermaidBZDO() },
    notes,
  };
}

/* ------------------------------- Self-tests ------------------------------- */

export function checkBZDOAxioms(): BZDOAxiomReport {
  const notes: string[] = [];
  const hooks = createVectorBZDOHooks({ symmetryPoint: [0, 0], heightMode: "constraint_override_or_distance" });

  const alphaAtZero = alphaFromHeight(0) === 1;
  if (!alphaAtZero) notes.push("α(0) must equal 1.");

  const alphaDecreases = alphaFromHeight(0.5) > alphaFromHeight(2.0);
  if (!alphaDecreases) notes.push("α(h) should decrease as h increases.");

  const strictZero = runBZDO(
    { x: [3, 4], C: { valid: true, heightOverride: 0 }, config: { releasePolicy: "strict" } },
    hooks
  );
  const strictZeroDissolves = strictZero.mode === "dissolve" && l2Distance(strictZero.output as Vector, [0, 0]) <= 1e-12;
  if (!strictZeroDissolves) notes.push("Strict height-zero case should dissolve to Π_G(x).");

  const invalid = runBZDO(
    { x: [3, 4], C: { valid: false }, config: { releasePolicy: "strict" } },
    hooks
  );
  const invalidBlockForcesSymmetry = invalid.mode === "force_symmetry" && l2Distance(invalid.output as Vector, [0, 0]) <= 1e-12;
  if (!invalidBlockForcesSymmetry) notes.push("Invalid block should force symmetry projection by default.");

  const passed = alphaAtZero && alphaDecreases && strictZeroDissolves && invalidBlockForcesSymmetry;
  if (passed) notes.push("All BZDO runtime axioms passed.");

  return { alphaAtZero, alphaDecreases, strictZeroDissolves, invalidBlockForcesSymmetry, passed, notes };
}

export function demoBZDO() {
  const hooks = createVectorBZDOHooks({ symmetryPoint: [0, 0], heightMode: "constraint_override_or_distance" });
  const retained = runBZDO(
    { x: [3, 4], C: { valid: true, heightOverride: 5 }, config: { releasePolicy: "strict", traceLabel: "retain-demo" } },
    hooks
  );
  const dissolved = runBZDO(
    { x: [3, 4], C: { valid: true, heightOverride: 0 }, config: { releasePolicy: "strict", traceLabel: "dissolve-demo" } },
    hooks
  );
  const forced = runBZDO(
    { x: [3, 4], C: { valid: false }, config: { releasePolicy: "strict", traceLabel: "force-demo" } },
    hooks
  );
  const partial = runBZDO(
    { x: [3, 4], C: { valid: true, heightOverride: 0.5 }, config: { releasePolicy: "continuous", alphaK: 1, traceLabel: "partial-demo" } },
    hooks
  );
  return {
    metadata: BZDO_METADATA,
    retained: { mode: retained.mode, output: retained.output, height: retained.height, alpha: retained.alpha },
    dissolved: { mode: dissolved.mode, output: dissolved.output, height: dissolved.height, alpha: dissolved.alpha },
    forced: { mode: forced.mode, output: forced.output, height: forced.height, alpha: forced.alpha },
    partial: { mode: partial.mode, output: partial.output, height: partial.height, alpha: partial.alpha },
    axiomReport: checkBZDOAxioms(),
  };
}

export default {
  BZDO_METADATA,
  alphaFromHeight,
  isHeightZero,
  runBZDO,
  runBZDOBatch,
  createVectorBZDOHooks,
  toOiIntermediate,
  checkBZDOAxioms,
  demoBZDO,
};

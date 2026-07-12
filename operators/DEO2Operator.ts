export type Scalar = number;
export type Comparator = "le" | "lt" | "ge" | "gt";

export interface SecondOrderState {
  id?: string;
  q: number[];
  v: number[];
  meta?: Record<string, unknown>;
}

export interface ProjectionParams {
  a: number[];
  b: number;
  comparator?: Comparator;
  epsilon?: number;
}

export interface GeneratorParams {
  matrix: number[][];
  normalized?: boolean;
  label?: string;
}

export interface OperatorSpec {
  operator_id: string;
  name: string;
  symbol: string;
  version: string;
  schema_version: string;
  family: string;
  title: string;
  description_vi: string;
  objective: {
    mode: string;
    metric: string;
  };
  kernel: {
    type: string;
    pipeline_steps: Array<{
      id: string;
      name: string;
      role: string;
      description_vi: string;
    }>;
    hyperparameters?: Record<string, unknown>;
  };
  cut_rules?: Array<{
    id: string;
    condition: string;
    action: string;
    priority: number;
    description_vi?: string;
  }>;
  logging?: {
    log_level?: "off" | "basic" | "full";
  };
}

export interface OperatorInput {
  states: SecondOrderState[];
  projection: ProjectionParams;
  generator: GeneratorParams;
  dt: number;
  steps?: number;
  context?: Record<string, unknown>;
  annotations?: Array<Record<string, unknown>>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface StepEvent {
  step_id: string;
  step_name: string;
  role: string;
  before_summary?: string;
  after_summary?: string;
  metrics?: Record<string, number>;
  action?: string;
  notes?: string;
}

export interface DecisionEvent {
  type: string;
  detail: string;
}

export interface DecisionLog {
  run_id: string;
  operator_id: string;
  version: string;
  input_summary: string;
  step_trace: StepEvent[];
  metric_trace: Record<string, number>;
  events: DecisionEvent[];
  final_summary: string;
}

export interface ContextPack {
  instructions?: string[];
  evidence?: string[];
  constraints?: string[];
  budget?: string;
}

export interface ToolPlan {
  should_call_tool: boolean;
  tool_calls: Array<{ tool: string; rationale: string; query?: string }>;
  fallback?: string;
  questions_for_user?: string[];
}

export interface ProjectionTraceItem {
  state: SecondOrderState;
  score: number;
}

export interface DEO2StepTrace {
  step_index: number;
  pre_kept_count: number;
  pre_removed_count: number;
  post_kept_count: number;
  post_removed_count: number;
  drift_energy: number;
}

export interface DEO2Result {
  committed: SecondOrderState[];
  preRemoved: ProjectionTraceItem[];
  postRemoved: ProjectionTraceItem[];
  stepTraces: DEO2StepTrace[];
  metrics: {
    total_input_count: number;
    committed_count: number;
    pre_cut_removed_count: number;
    post_cut_removed_count: number;
    discipline_ratio: number;
    drift_energy: number;
    generator_norm: number;
  };
}

export interface OutputBundle {
  result: DEO2Result | null;
  contextPack: ContextPack;
  toolPlan: ToolPlan;
  decisionLog: DecisionLog;
}

function stableId(): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `run_${t}_${r}`;
}

function round6(n: number): number {
  return Number(n.toFixed(6));
}

function summarizeInput(input: OperatorInput): string {
  const qDim = input.states[0]?.q?.length ?? 0;
  const vDim = input.states[0]?.v?.length ?? 0;
  return `states=${input.states.length}, q_dim=${qDim}, v_dim=${vDim}, dt=${input.dt}, steps=${input.steps ?? 1}`;
}

function dot(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
  }
  let s = 0;
  for (let i = 0; i < a.length; i += 1) s += a[i] * b[i];
  return s;
}

function add(a: number[], b: number[]): number[] {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
  }
  return a.map((x, i) => round6(x + b[i]));
}

function scale(a: number[], c: number): number[] {
  return a.map(x => round6(x * c));
}

function matVecMul(m: number[][], x: number[]): number[] {
  return m.map(row => round6(dot(row, x)));
}

function flattenState(state: SecondOrderState): number[] {
  return [...state.q, ...state.v];
}

function projectionScore(state: SecondOrderState, projection: ProjectionParams): number {
  return round6(dot(projection.a, flattenState(state)) - projection.b);
}

function isKept(score: number, comparator: Comparator, epsilon: number): boolean {
  switch (comparator) {
    case "le":
      return score <= epsilon;
    case "lt":
      return score < epsilon;
    case "ge":
      return score >= -epsilon;
    case "gt":
      return score > -epsilon;
    default:
      return score <= epsilon;
  }
}

function projectStates(states: SecondOrderState[], projection: ProjectionParams): {
  kept: SecondOrderState[];
  removed: ProjectionTraceItem[];
} {
  const comparator = projection.comparator ?? "le";
  const epsilon = projection.epsilon ?? 0;
  const kept: SecondOrderState[] = [];
  const removed: ProjectionTraceItem[] = [];

  for (const state of states) {
    const score = projectionScore(state, projection);
    if (isKept(score, comparator, epsilon)) {
      kept.push(state);
    } else {
      removed.push({ state, score });
    }
  }

  return { kept, removed };
}

function evolveState(state: SecondOrderState, generator: GeneratorParams, dt: number): {
  next: SecondOrderState;
  drift: number;
} {
  const q = state.q;
  const v = state.v;
  const flat = flattenState(state);
  const delta = scale(matVecMul(generator.matrix, flat), dt);
  const qDelta = delta.slice(0, q.length);
  const vDelta = delta.slice(q.length);
  const nextQ = add(q, add(scale(v, dt), qDelta));
  const nextV = add(v, vDelta);
  const drift = round6(Math.sqrt(dot(delta, delta)));

  return {
    next: {
      ...state,
      q: nextQ,
      v: nextV
    },
    drift
  };
}

function frobeniusNorm(m: number[][]): number {
  let s = 0;
  for (const row of m) {
    for (const x of row) s += x * x;
  }
  return round6(Math.sqrt(s));
}

export function validateSpec(spec: OperatorSpec): ValidationResult {
  const errors: string[] = [];
  if (!spec.operator_id) errors.push("Missing operator_id");
  if (!spec.name) errors.push("Missing name");
  if (!spec.version) errors.push("Missing version");
  if (!spec.kernel?.type) errors.push("Missing kernel.type");
  if (!spec.kernel?.pipeline_steps?.length) errors.push("Missing kernel.pipeline_steps");
  return { valid: errors.length === 0, errors };
}

export function validateInput(input: OperatorInput): ValidationResult {
  const errors: string[] = [];
  if (!Array.isArray(input.states)) errors.push("states must be an array");
  if (!input.projection) errors.push("projection is required");
  if (!input.generator) errors.push("generator is required");
  if (typeof input.dt !== "number" || !Number.isFinite(input.dt)) errors.push("dt must be a finite number");
  if (input.steps !== undefined && (!Number.isInteger(input.steps) || input.steps < 1)) errors.push("steps must be an integer >= 1");

  const stateDim = input.states.length > 0 ? input.states[0].q.length + input.states[0].v.length : 0;
  if (input.projection?.a && input.projection.a.length !== stateDim && input.states.length > 0) {
    errors.push(`projection.a length mismatch: expected ${stateDim}, got ${input.projection.a.length}`);
  }
  if (input.generator?.matrix && input.states.length > 0) {
    const rows = input.generator.matrix.length;
    const cols = input.generator.matrix[0]?.length ?? 0;
    if (rows !== stateDim || cols !== stateDim) {
      errors.push(`generator.matrix shape mismatch: expected ${stateDim}x${stateDim}, got ${rows}x${cols}`);
    }
  }

  for (const [i, s] of input.states.entries()) {
    if (!Array.isArray(s.q)) errors.push(`states[${i}].q must be an array`);
    if (!Array.isArray(s.v)) errors.push(`states[${i}].v must be an array`);
    if (i > 0) {
      if (s.q.length !== input.states[0].q.length) errors.push(`states[${i}].q length mismatch`);
      if (s.v.length !== input.states[0].v.length) errors.push(`states[${i}].v length mismatch`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function computeDEO2(input: OperatorInput): DEO2Result {
  const totalInputCount = input.states.length;
  const steps = input.steps ?? 1;
  let current = [...input.states];
  const preRemovedAll: ProjectionTraceItem[] = [];
  const postRemovedAll: ProjectionTraceItem[] = [];
  const stepTraces: DEO2StepTrace[] = [];
  let accumulatedDrift = 0;

  for (let i = 0; i < steps; i += 1) {
    const pre = projectStates(current, input.projection);
    preRemovedAll.push(...pre.removed);

    const evolved = pre.kept.map(state => evolveState(state, input.generator, input.dt));
    const evolvedStates = evolved.map(x => x.next);
    const drift = round6(evolved.reduce((s, x) => s + x.drift, 0));
    accumulatedDrift = round6(accumulatedDrift + drift);

    const post = projectStates(evolvedStates, input.projection);
    postRemovedAll.push(...post.removed);

    stepTraces.push({
      step_index: i + 1,
      pre_kept_count: pre.kept.length,
      pre_removed_count: pre.removed.length,
      post_kept_count: post.kept.length,
      post_removed_count: post.removed.length,
      drift_energy: drift
    });

    current = post.kept;
  }

  const committedCount = current.length;
  return {
    committed: current,
    preRemoved: preRemovedAll,
    postRemoved: postRemovedAll,
    stepTraces,
    metrics: {
      total_input_count: totalInputCount,
      committed_count: committedCount,
      pre_cut_removed_count: preRemovedAll.length,
      post_cut_removed_count: postRemovedAll.length,
      discipline_ratio: totalInputCount === 0 ? 0 : round6(committedCount / totalInputCount),
      drift_energy: accumulatedDrift,
      generator_norm: frobeniusNorm(input.generator.matrix)
    }
  };
}

function buildOutput(result: DEO2Result | null, decisionLog: DecisionLog): OutputBundle {
  return {
    result,
    contextPack: {
      instructions: ["Apply DEO-2 as project -> evolve -> project."],
      evidence: [],
      constraints: ["Preserve only states surviving both projection gates."],
      budget: "default"
    },
    toolPlan: {
      should_call_tool: false,
      tool_calls: [],
      fallback: "No tool call needed for pure operator execution."
    },
    decisionLog
  };
}

export function explain(log: DecisionLog): string {
  return [
    `Operator: ${log.operator_id}@${log.version}`,
    `Run: ${log.run_id}`,
    `Input: ${log.input_summary}`,
    `Summary: ${log.final_summary}`
  ].join("\n");
}

export function run(input: OperatorInput, spec: OperatorSpec): OutputBundle {
  const run_id = stableId();
  const step_trace: StepEvent[] = [];
  const events: DecisionEvent[] = [];
  const metric_trace: Record<string, number> = {};

  const specCheck = validateSpec(spec);
  const inputCheck = validateInput(input);

  if (!specCheck.valid || !inputCheck.valid) {
    const allErrors = [...specCheck.errors, ...inputCheck.errors];
    const log: DecisionLog = {
      run_id,
      operator_id: spec.operator_id || "unknown",
      version: spec.version || "unknown",
      input_summary: summarizeInput(input),
      step_trace: [],
      metric_trace: {},
      events: allErrors.map(err => ({ type: "validation_error", detail: err })),
      final_summary: "Execution aborted because validation failed."
    };
    return buildOutput(null, log);
  }

  step_trace.push({
    step_id: "collect_states",
    step_name: "Collect States",
    role: "collect",
    before_summary: "N/A",
    after_summary: "State set, projection, generator, and dt collected"
  });

  const result = computeDEO2(input);
  Object.assign(metric_trace, result.metrics);

  step_trace.push({
    step_id: "validity_gate",
    step_name: "Validity Gate",
    role: "gate",
    before_summary: `Input states: ${result.metrics.total_input_count}`,
    after_summary: `Pre-cut removed: ${result.metrics.pre_cut_removed_count}`,
    metrics: {
      pre_cut_removed_count: result.metrics.pre_cut_removed_count,
      generator_norm: result.metrics.generator_norm
    },
    notes: "Applied Tuy-style projection before evolution."
  });

  step_trace.push({
    step_id: "local_evolution",
    step_name: "Local Evolution",
    role: "evolve",
    before_summary: "Pre-projected states ready",
    after_summary: `Accumulated drift energy: ${result.metrics.drift_energy}`,
    metrics: {
      drift_energy: result.metrics.drift_energy,
      generator_norm: result.metrics.generator_norm
    },
    notes: "Applied local evolution under normalized generator."
  });

  step_trace.push({
    step_id: "post_correction",
    step_name: "Post-Evolution Correction",
    role: "gate",
    before_summary: "Locally evolved states ready",
    after_summary: `Post-cut removed: ${result.metrics.post_cut_removed_count}`,
    metrics: {
      post_cut_removed_count: result.metrics.post_cut_removed_count,
      discipline_ratio: result.metrics.discipline_ratio
    },
    notes: "Applied post-evolution correction to remove drifted states."
  });

  step_trace.push({
    step_id: "build_commit_state",
    step_name: "Build Commit State",
    role: "commit",
    before_summary: "Corrected states ready",
    after_summary: `Committed states: ${result.metrics.committed_count}`,
    metrics: {
      committed_count: result.metrics.committed_count,
      discipline_ratio: result.metrics.discipline_ratio
    },
    notes: "Committed surviving states as DEO-2 output."
  });

  for (const step of result.stepTraces) {
    events.push({
      type: "deo2_step_trace",
      detail: `step=${step.step_index}, pre_removed=${step.pre_removed_count}, post_removed=${step.post_removed_count}, drift=${step.drift_energy}`
    });
  }

  events.push({
    type: "summary",
    detail: `DEO-2 committed ${result.metrics.committed_count}/${result.metrics.total_input_count} states.`
  });

  const log: DecisionLog = {
    run_id,
    operator_id: spec.operator_id,
    version: spec.version,
    input_summary: summarizeInput(input),
    step_trace,
    metric_trace,
    events,
    final_summary: `${spec.name} executed as project -> evolve -> project and committed ${result.metrics.committed_count} states with discipline_ratio=${result.metrics.discipline_ratio}.`
  };

  return buildOutput(result, log);
}

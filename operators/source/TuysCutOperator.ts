export type Scalar = number;
export type Comparator = "le" | "lt" | "ge" | "gt";

export interface VectorState {
  id?: string;
  v: number[];
  meta?: Record<string, unknown>;
}

export interface CutParams {
  a: number[];
  b: number;
  comparator?: Comparator;
  epsilon?: number;
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
  states: VectorState[];
  cut_params: CutParams;
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

export interface TuysCutResult {
  kept: VectorState[];
  removed: Array<VectorState & { cut_score: number }>;
  metrics: {
    total_count: number;
    kept_count: number;
    removed_count: number;
    feasibility_ratio: number;
    max_margin_violation: number;
  };
}

export interface OutputBundle {
  result: TuysCutResult | null;
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
  const dim = input.states[0]?.v?.length ?? 0;
  return `states=${input.states.length}, dim=${dim}, comparator=${input.cut_params.comparator ?? "le"}`;
}

function dot(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
  }
  let s = 0;
  for (let i = 0; i < a.length; i += 1) s += a[i] * b[i];
  return s;
}

function hyperplaneScore(state: VectorState, params: CutParams): number {
  return dot(params.a, state.v) - params.b;
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
  if (!input.cut_params) errors.push("cut_params is required");
  if (input.cut_params && !Array.isArray(input.cut_params.a)) errors.push("cut_params.a must be an array");
  if (input.cut_params && typeof input.cut_params.b !== "number") errors.push("cut_params.b must be a number");

  const expectedDim = input.cut_params?.a?.length ?? 0;
  for (const [i, s] of input.states.entries()) {
    if (!Array.isArray(s.v)) errors.push(`states[${i}].v must be an array`);
    if (expectedDim && s.v.length !== expectedDim) {
      errors.push(`states[${i}].v length mismatch: expected ${expectedDim}, got ${s.v.length}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function computeCut(input: OperatorInput): TuysCutResult {
  const comparator = input.cut_params.comparator ?? "le";
  const epsilon = input.cut_params.epsilon ?? 0;

  const kept: VectorState[] = [];
  const removed: Array<VectorState & { cut_score: number }> = [];
  let maxMarginViolation = 0;

  for (const state of input.states) {
    const score = round6(hyperplaneScore(state, input.cut_params));
    if (isKept(score, comparator, epsilon)) {
      kept.push(state);
    } else {
      removed.push({ ...state, cut_score: score });
      maxMarginViolation = Math.max(maxMarginViolation, Math.abs(score));
    }
  }

  const total = input.states.length;
  return {
    kept,
    removed,
    metrics: {
      total_count: total,
      kept_count: kept.length,
      removed_count: removed.length,
      feasibility_ratio: total === 0 ? 0 : round6(kept.length / total),
      max_margin_violation: round6(maxMarginViolation)
    }
  };
}

function buildOutput(result: TuysCutResult | null, decisionLog: DecisionLog): OutputBundle {
  return {
    result,
    contextPack: {
      instructions: ["Apply feasibility cut over current state set."],
      evidence: [],
      constraints: ["Preserve states satisfying the cut comparator."],
      budget: "default"
    },
    toolPlan: {
      should_call_tool: false,
      tool_calls: [],
      fallback: "No tool call needed for pure state filtering."
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
  if (!specCheck.valid) {
    const log: DecisionLog = {
      run_id,
      operator_id: spec.operator_id || "unknown",
      version: spec.version || "unknown",
      input_summary: summarizeInput(input),
      step_trace: [],
      metric_trace: {},
      events: specCheck.errors.map((detail) => ({ type: "validation_error", detail })),
      final_summary: "Execution aborted because spec validation failed."
    };
    return buildOutput(null, log);
  }

  const inputCheck = validateInput(input);
  if (!inputCheck.valid) {
    const log: DecisionLog = {
      run_id,
      operator_id: spec.operator_id,
      version: spec.version,
      input_summary: summarizeInput(input),
      step_trace: [],
      metric_trace: {},
      events: inputCheck.errors.map((detail) => ({ type: "input_error", detail })),
      final_summary: "Execution aborted because input validation failed."
    };
    return buildOutput(null, log);
  }

  step_trace.push({
    step_id: "collect_states",
    step_name: "Collect States",
    role: "collect",
    before_summary: "N/A",
    after_summary: `Collected ${input.states.length} states`
  });

  const result = computeCut(input);
  Object.assign(metric_trace, result.metrics);

  step_trace.push({
    step_id: "evaluate_hyperplane",
    step_name: "Evaluate Hyperplane",
    role: "score",
    before_summary: `States ready: ${input.states.length}`,
    after_summary: "Computed cut scores for all states",
    metrics: {
      feasibility_ratio: result.metrics.feasibility_ratio,
      max_margin_violation: result.metrics.max_margin_violation
    }
  });

  step_trace.push({
    step_id: "validity_gate",
    step_name: "Validity Gate",
    role: "gate",
    before_summary: `Before gate: ${result.metrics.total_count}`,
    after_summary: `Kept ${result.metrics.kept_count}, removed ${result.metrics.removed_count}`,
    action: "keep_else_drop"
  });

  events.push({
    type: "cut_event",
    detail: `Removed ${result.metrics.removed_count} states using comparator ${input.cut_params.comparator ?? "le"}`
  });

  const log: DecisionLog = {
    run_id,
    operator_id: spec.operator_id,
    version: spec.version,
    input_summary: summarizeInput(input),
    step_trace,
    metric_trace,
    events,
    final_summary: `${spec.name} kept ${result.metrics.kept_count}/${result.metrics.total_count} states and removed ${result.metrics.removed_count}.`
  };

  return buildOutput(result, log);
}

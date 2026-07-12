/**
 * O.i Hardware Specification (O.i-HS) v1.1
 * "Võ học của Silicon" — Structure-First Computing Architecture
 *
 * Author: Phan Thành Trung
 * Artifact role: machine-consumable specification + minimal runtime scaffold
 * for Operator Intelligence / Structure-First hardware control.
 *
 * Upgrade notes from v1.0:
 * - Fixed TypeScript boolean literal: True -> true.
 * - Added optional jitter channel j to StateSigma for phase-noise aware stability.
 * - Added numeric transition model for the seven canonical hardware operators.
 * - Added telemetry aggregation, stability computation, safety checks, heuristic policy,
 *   command synthesis, reward estimation, and episode simulation helpers.
 * - Kept all formulas in Unicode strings; no LaTeX/KaTeX dependency.
 */

export type Normalized01 = number;
export type TopologyID = number;
export type TileMask = string;
export type SafetyTag = number;
export type Opcode = number;

export type Trend = "up" | "down" | "stable" | "change";
export type OperatorType = "Control" | "Timing" | "Topology" | "Thermal" | "Stabilize";

/** Runtime control state Σ. All numeric channels except kappa are normalized into [0,1]. */
export interface StateSigma {
  /** P: normalized power usage */
  P: Normalized01;
  /** T: normalized thermal state */
  T: Normalized01;
  /** f: normalized DVFS frequency level */
  f: Normalized01;
  /** a: normalized switching/activity */
  a: Normalized01;
  /** κ: topology / routing profile identifier */
  kappa: TopologyID;
  /** q: normalized NoC congestion / queue depth */
  q: Normalized01;
  /** j: optional normalized jitter / phase noise metric */
  j?: Normalized01;
  /** s: stability index; hard guard target is s ≥ s_critical */
  s: Normalized01;
}

/** Constraint limits used by the safety supervisor and stability calculator. */
export interface StateLimits {
  P_max: Normalized01;
  T_max: Normalized01;
  q_max: Normalized01;
  j_max: Normalized01;
  s_critical: Normalized01;
}

export const DEFAULT_LIMITS: StateLimits = {
  P_max: 0.92,
  T_max: 0.88,
  q_max: 0.90,
  j_max: 0.85,
  s_critical: 0.35,
};

/** Telemetry packet aggregated from zones/tiles. */
export interface TelemetryPacket {
  power_zone: Normalized01[];
  thermal_zone: Normalized01[];
  freq_zone: Normalized01[];
  activity_counter: Normalized01[];
  noc_congestion: Normalized01[];
  jitter_metric: Normalized01;
  timestamp: number;
}

export interface OperatorParams {
  /** Optional DVFS level / target frequency in [0,1]. */
  dvfs_level?: Normalized01;
  /** Optional routing/topology profile to select. */
  topology_profile?: TopologyID;
  /** Optional bandwidth allocation profile id. */
  bandwidth_profile?: number;
  /** Gain or attenuation factor; default is operator-specific. */
  gain?: number;
  /** Optional mapping id for data placement/scheduling. */
  mapping_id?: number;
  /** Free-form extension payload for vendor-specific control. */
  ext?: Record<string, unknown>;
}

/** Operator ISA command. */
export interface OperatorCommand {
  opcode: Opcode;
  tile_mask: TileMask;
  param: OperatorParams;
  duration: number;
  safety_tag: SafetyTag;
}

export const OperatorName = {
  O_dampen: "O_dampen",
  O_boost: "O_boost",
  O_shift_phase: "O_shift_phase",
  O_rewire_local: "O_rewire_local",
  O_rewire_global: "O_rewire_global",
  O_cooldown: "O_cooldown",
  O_commit: "O_commit",
} as const;

export type OperatorName = (typeof OperatorName)[keyof typeof OperatorName];

export interface OperatorEffectModel {
  /** Short numeric transition model description. */
  model: string;
  /** Default gain used by applyOperatorModel when params.gain is absent. */
  default_gain: number;
  /** Fields mainly affected by this operator. */
  primary_channels: Array<keyof StateSigma>;
  /** Failure or trade-off notes useful for training/simulation. */
  risk_notes: string[];
}

export interface OperatorDefinition {
  name: OperatorName;
  opcode: Opcode;
  type: OperatorType;
  effect_summary: string;
  expected_effect: Partial<Record<keyof StateSigma, Trend>>;
  hard_constraints: string[];
  effect_model: OperatorEffectModel;
  notes?: string;
}

export interface SafetySupervisorSpec {
  hard_constraints: string[];
  override_policy: {
    force_ops: OperatorName[];
    power_gate_allowed: boolean;
  };
  hysteresis: {
    dvfs_delta_threshold: number;
    min_dwell_topology: number;
    min_dwell_commit: number;
  };
}

export interface ObjectiveFunctionSpec {
  form: string;
  weights: {
    alpha_energy: number;
    beta_latency: number;
    gamma_risk: number;
    mu_complexity: number;
    fail_penalty_M: number;
  };
  risk_terms: string[];
}

export const DEFAULT_OBJECTIVE_WEIGHTS: ObjectiveFunctionSpec["weights"] = {
  alpha_energy: 1.0,
  beta_latency: 0.8,
  gamma_risk: 2.0,
  mu_complexity: 0.2,
  fail_penalty_M: 500.0,
};

export interface DatasetSchemaSpec {
  state_action_transition: {
    state: "StateSigma";
    action: "Opcode";
    next_state: "StateSigma";
    reward: "number";
    safety_violation: "boolean";
  };
  episode_sequence: {
    episode_id: "number";
    initial_state: "StateSigma";
    operator_sequence: "Opcode[]";
    final_cost_J: "number";
    stability_margin: "number";
  };
}

export interface HardwareBlocksSpec {
  required_blocks: string[];
  data_flow: string;
  overhead_estimates: {
    area_overhead_percent_range: [number, number];
    control_power_overhead_percent_max: number;
    expected_energy_savings_percent_range: [number, number];
  };
}

export interface TransitionResult {
  previous: StateSigma;
  command: OperatorCommand;
  next: StateSigma;
  safety_violations: string[];
  reward: number;
  notes: string[];
}

export interface PolicyDecision {
  operator: OperatorName;
  reason: string;
  safety_override: boolean;
  command: OperatorCommand;
}

export interface OiHardwareSpecV11 {
  spec_id: "O.i-HS-1.1";
  title: string;
  status: "Research Prototype Architecture";
  compatibility: string[];
  core_equation: string;
  design_principles: string[];
  state_vector: {
    schema: "StateSigma";
    fields: Array<{ key: keyof StateSigma; meaning: string; range: string }>;
    stability_definition: string;
    constraints: string[];
  };
  operators: OperatorDefinition[];
  operator_isa: {
    command_schema: "OperatorCommand";
    format: string;
    fields: Array<{ key: keyof OperatorCommand; meaning: string }>;
  };
  telemetry: {
    packet_schema: "TelemetryPacket";
    sampling_rate_hz_range: [number, number];
    notes: string;
  };
  policy: {
    function_form: string;
    options: string[];
    objective: ObjectiveFunctionSpec;
    built_in_policy: string;
  };
  safety: SafetySupervisorSpec;
  dataset: DatasetSchemaSpec;
  hardware: HardwareBlocksSpec;
  runtime_exports: string[];
  versioning: {
    created_at_iso: string;
    upgraded_at_iso: string;
    author: string;
    upgrade_summary: string[];
  };
}

export const OPERATOR_DEFINITIONS: OperatorDefinition[] = [
  {
    name: OperatorName.O_dampen,
    opcode: 1,
    type: "Control",
    effect_summary: "Reduce switching activity and power to increase stability; trades throughput for safety margin.",
    expected_effect: { a: "down", P: "down", f: "down", q: "down", s: "up" },
    hard_constraints: ["P ≤ P_max", "T ≤ T_max", "s ≥ s_critical (target)"],
    effect_model: {
      model: "a,P,f,q,j decrease by gain-scaled attenuation; s recomputed from risk channels.",
      default_gain: 0.35,
      primary_channels: ["a", "P", "f", "q", "j", "s"],
      risk_notes: ["May increase latency if overused.", "Primary safety fallback."],
    },
    notes: "Use as the first override when stability collapses without thermal emergency.",
  },
  {
    name: OperatorName.O_boost,
    opcode: 2,
    type: "Control",
    effect_summary: "Increase DVFS/activity to reduce latency while consuming stability margin.",
    expected_effect: { a: "up", f: "up", P: "up", T: "up", s: "down" },
    hard_constraints: ["P ≤ P_max", "T ≤ T_max", "s ≥ s_critical"],
    effect_model: {
      model: "f,a,P,T increase by gain; q may decrease under compute-bound load; s recomputed.",
      default_gain: 0.20,
      primary_channels: ["f", "a", "P", "T", "q", "s"],
      risk_notes: ["Unsafe near thermal or power limits.", "Must be blocked by Safety Supervisor under low s."],
    },
  },
  {
    name: OperatorName.O_shift_phase,
    opcode: 3,
    type: "Timing",
    effect_summary: "Adjust scheduling phase to reduce contention, jitter, and effective NoC queueing.",
    expected_effect: { q: "down", j: "down", s: "up" },
    hard_constraints: ["P ≤ P_max", "T ≤ T_max"],
    effect_model: {
      model: "q and j decrease; small activity overhead may be introduced.",
      default_gain: 0.30,
      primary_channels: ["q", "j", "a", "s"],
      risk_notes: ["Can introduce scheduling overhead if called too frequently."],
    },
  },
  {
    name: OperatorName.O_rewire_local,
    opcode: 4,
    type: "Topology",
    effect_summary: "Switch local NoC/topology profile around hot spots to improve locality and reduce link energy.",
    expected_effect: { kappa: "change", q: "down", P: "down", s: "up" },
    hard_constraints: ["P ≤ P_max", "T ≤ T_max"],
    effect_model: {
      model: "kappa changes; q and P decrease; transient jitter may slightly increase.",
      default_gain: 0.25,
      primary_channels: ["kappa", "q", "P", "j", "s"],
      risk_notes: ["Respect min_dwell_topology to avoid routing thrash."],
    },
    notes: "Coarse-grain NoC profile switch around clusters/hot spots.",
  },
  {
    name: OperatorName.O_rewire_global,
    opcode: 5,
    type: "Topology",
    effect_summary: "Switch global routing/bandwidth profile to relieve widespread congestion; costs power.",
    expected_effect: { kappa: "change", q: "down", P: "up", s: "stable" },
    hard_constraints: ["P ≤ P_max", "T ≤ T_max", "s ≥ s_critical"],
    effect_model: {
      model: "q decreases strongly; P and T rise mildly; kappa changes.",
      default_gain: 0.20,
      primary_channels: ["kappa", "q", "P", "T", "s"],
      risk_notes: ["Avoid under thermal stress.", "Use only when local rewire is insufficient."],
    },
  },
  {
    name: OperatorName.O_cooldown,
    opcode: 6,
    type: "Thermal",
    effect_summary: "Enter thermal recovery mode; reduce power/activity/frequency to regain stability margin.",
    expected_effect: { P: "down", T: "down", a: "down", f: "down", s: "up" },
    hard_constraints: ["T ≤ T_max", "s ≥ s_critical (target)"],
    effect_model: {
      model: "T,P,a,f decrease; q may rise if work is throttled; s recomputed.",
      default_gain: 0.45,
      primary_channels: ["T", "P", "a", "f", "q", "s"],
      risk_notes: ["Strong throughput penalty.", "Thermal emergency fallback."],
    },
  },
  {
    name: OperatorName.O_commit,
    opcode: 7,
    type: "Stabilize",
    effect_summary: "Lock a stable configuration to reduce oscillations, hunting, and control-loop chatter.",
    expected_effect: { s: "up", kappa: "stable", f: "stable", j: "down" },
    hard_constraints: ["P ≤ P_max", "T ≤ T_max", "s ≥ s_critical"],
    effect_model: {
      model: "j,q decrease slightly; s increases if state is already safe.",
      default_gain: 0.15,
      primary_channels: ["j", "q", "s"],
      risk_notes: ["Do not commit an unsafe state.", "Use hysteresis/rate limiting to prevent deadlock."],
    },
    notes: "Useful after rewire/phase-shift settles.",
  },
];

const OPCODE_TO_NAME: Record<Opcode, OperatorName> = OPERATOR_DEFINITIONS.reduce(
  (acc, op) => ({ ...acc, [op.opcode]: op.name }),
  {} as Record<Opcode, OperatorName>
);

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function riskRatio(value: number, limit: number): number {
  if (limit <= 0) return 1;
  return clamp01(value / limit);
}

/** Compute stability from normalized risk channels. Higher is better. */
export function computeStability(sigma: Omit<StateSigma, "s"> | StateSigma, limits: StateLimits = DEFAULT_LIMITS): Normalized01 {
  const p = riskRatio(sigma.P, limits.P_max);
  const t = riskRatio(sigma.T, limits.T_max);
  const q = riskRatio(sigma.q, limits.q_max);
  const j = riskRatio((sigma as StateSigma).j ?? 0, limits.j_max);
  const riskRms = Math.sqrt((p * p + t * t + q * q + j * j) / 4);
  return clamp01(1 - riskRms);
}

export function withComputedStability(sigma: Omit<StateSigma, "s"> | StateSigma, limits: StateLimits = DEFAULT_LIMITS): StateSigma {
  const base = sigma as StateSigma;
  return {
    P: clamp01(base.P),
    T: clamp01(base.T),
    f: clamp01(base.f),
    a: clamp01(base.a),
    kappa: Number.isFinite(base.kappa) ? Math.trunc(base.kappa) : 0,
    q: clamp01(base.q),
    j: clamp01(base.j ?? 0),
    s: computeStability(base, limits),
  };
}

/** Convert zone telemetry into a compact Σ state. */
export function sigmaFromTelemetry(packet: TelemetryPacket, kappa: TopologyID = 0, limits: StateLimits = DEFAULT_LIMITS): StateSigma {
  const sigma = {
    P: clamp01(mean(packet.power_zone)),
    T: clamp01(mean(packet.thermal_zone)),
    f: clamp01(mean(packet.freq_zone)),
    a: clamp01(mean(packet.activity_counter)),
    kappa,
    q: clamp01(mean(packet.noc_congestion)),
    j: clamp01(packet.jitter_metric),
    s: 0,
  } satisfies StateSigma;
  return withComputedStability(sigma, limits);
}

export function validateStateSigma(sigma: StateSigma, limits: StateLimits = DEFAULT_LIMITS): string[] {
  const violations: string[] = [];
  if (sigma.P > limits.P_max) violations.push(`P>${limits.P_max}`);
  if (sigma.T > limits.T_max) violations.push(`T>${limits.T_max}`);
  if (sigma.q > limits.q_max) violations.push(`q>${limits.q_max}`);
  if ((sigma.j ?? 0) > limits.j_max) violations.push(`j>${limits.j_max}`);
  if (sigma.s < limits.s_critical) violations.push(`s<${limits.s_critical}`);
  return violations;
}

export function isSafeState(sigma: StateSigma, limits: StateLimits = DEFAULT_LIMITS): boolean {
  return validateStateSigma(sigma, limits).length === 0;
}

export function getOperatorByName(name: OperatorName): OperatorDefinition {
  const op = OPERATOR_DEFINITIONS.find(o => o.name === name);
  if (!op) throw new Error(`Unknown operator name: ${name}`);
  return op;
}

export function getOperatorByOpcode(opcode: Opcode): OperatorDefinition {
  const name = OPCODE_TO_NAME[opcode];
  if (!name) throw new Error(`Unknown opcode: ${opcode}`);
  return getOperatorByName(name);
}

export function makeCommand(
  operator: OperatorName,
  options: { tile_mask?: TileMask; param?: OperatorParams; duration?: number; safety_tag?: SafetyTag } = {}
): OperatorCommand {
  const op = getOperatorByName(operator);
  return {
    opcode: op.opcode,
    tile_mask: options.tile_mask ?? "0xFFFFFFFF",
    param: options.param ?? {},
    duration: Math.max(1, Math.floor(options.duration ?? 1)),
    safety_tag: Math.max(0, Math.floor(options.safety_tag ?? 0)),
  };
}

/** Estimate reward after an operator transition. Higher reward is better. */
export function estimateReward(
  prev: StateSigma,
  next: StateSigma,
  weights: ObjectiveFunctionSpec["weights"] = DEFAULT_OBJECTIVE_WEIGHTS,
  limits: StateLimits = DEFAULT_LIMITS
): number {
  const latencyProxy = 1 - next.f + 0.5 * next.q;
  const energy = next.P;
  const risk =
    Math.max(0, next.s < limits.s_critical ? limits.s_critical - next.s : 0) +
    Math.max(0, next.P - limits.P_max) +
    Math.max(0, next.T - limits.T_max) +
    Math.max(0, next.q - limits.q_max) +
    Math.max(0, (next.j ?? 0) - limits.j_max);
  const actionComplexity = Math.abs(next.kappa - prev.kappa) > 0 ? 1 : 0.25;
  const fail = validateStateSigma(next, limits).length > 0 ? 1 : 0;
  const cost =
    weights.alpha_energy * energy +
    weights.beta_latency * latencyProxy +
    weights.gamma_risk * risk +
    weights.mu_complexity * actionComplexity +
    fail * weights.fail_penalty_M;
  return -cost;
}

/** Minimal deterministic transition model for the canonical hardware operators. */
export function applyOperatorModel(
  sigma: StateSigma,
  commandOrName: OperatorCommand | OperatorName,
  limits: StateLimits = DEFAULT_LIMITS
): TransitionResult {
  const command = typeof commandOrName === "string" ? makeCommand(commandOrName) : commandOrName;
  const op = getOperatorByOpcode(command.opcode);
  const gain = Math.max(0, Number(command.param.gain ?? op.effect_model.default_gain));
  const n = { ...withComputedStability(sigma, limits) };
  const notes: string[] = [];

  switch (op.name) {
    case OperatorName.O_dampen:
      n.a = clamp01(n.a * (1 - 0.55 * gain));
      n.P = clamp01(n.P * (1 - 0.45 * gain));
      n.f = clamp01(n.f * (1 - 0.25 * gain));
      n.q = clamp01(n.q * (1 - 0.20 * gain));
      n.j = clamp01((n.j ?? 0) * (1 - 0.25 * gain));
      notes.push("Dampened activity/power; throughput may drop.");
      break;

    case OperatorName.O_boost:
      n.f = clamp01(command.param.dvfs_level ?? (n.f + 0.45 * gain));
      n.a = clamp01(n.a + 0.35 * gain);
      n.P = clamp01(n.P + 0.30 * gain);
      n.T = clamp01(n.T + 0.22 * gain);
      n.q = clamp01(n.q * (1 - 0.12 * gain));
      n.j = clamp01((n.j ?? 0) + 0.05 * gain);
      notes.push("Boosted frequency/activity; safety margin consumed.");
      break;

    case OperatorName.O_shift_phase:
      n.q = clamp01(n.q * (1 - 0.50 * gain));
      n.j = clamp01((n.j ?? 0) * (1 - 0.55 * gain));
      n.a = clamp01(n.a + 0.03 * gain);
      notes.push("Shifted scheduling phase to reduce queueing/jitter.");
      break;

    case OperatorName.O_rewire_local:
      n.kappa = command.param.topology_profile ?? (n.kappa + 1);
      n.q = clamp01(n.q * (1 - 0.45 * gain));
      n.P = clamp01(n.P * (1 - 0.18 * gain));
      n.j = clamp01((n.j ?? 0) + 0.08 * gain);
      notes.push("Applied local NoC/topology profile; transient jitter possible.");
      break;

    case OperatorName.O_rewire_global:
      n.kappa = command.param.topology_profile ?? (n.kappa + 10);
      n.q = clamp01(n.q * (1 - 0.65 * gain));
      n.P = clamp01(n.P + 0.18 * gain);
      n.T = clamp01(n.T + 0.10 * gain);
      n.j = clamp01((n.j ?? 0) + 0.12 * gain);
      notes.push("Applied global bandwidth/routing change; power cost increased.");
      break;

    case OperatorName.O_cooldown:
      n.f = clamp01(n.f * (1 - 0.50 * gain));
      n.a = clamp01(n.a * (1 - 0.55 * gain));
      n.P = clamp01(n.P * (1 - 0.60 * gain));
      n.T = clamp01(n.T * (1 - 0.50 * gain));
      n.q = clamp01(n.q + 0.08 * gain);
      n.j = clamp01((n.j ?? 0) * (1 - 0.15 * gain));
      notes.push("Cooldown mode; thermal recovery prioritized over throughput.");
      break;

    case OperatorName.O_commit:
      if (!isSafeState(n, limits)) {
        notes.push("Commit requested on unsafe state; command degraded to dampen semantics.");
        n.a = clamp01(n.a * 0.9);
        n.P = clamp01(n.P * 0.9);
      } else {
        n.q = clamp01(n.q * (1 - 0.18 * gain));
        n.j = clamp01((n.j ?? 0) * (1 - 0.35 * gain));
        notes.push("Committed stable configuration; control chatter reduced.");
      }
      break;
  }

  const next = withComputedStability(n, limits);
  const safety_violations = validateStateSigma(next, limits);
  const reward = estimateReward(sigma, next, DEFAULT_OBJECTIVE_WEIGHTS, limits);
  return { previous: sigma, command, next, safety_violations, reward, notes };
}

/** Safety override policy. Returns null when no override is needed. */
export function safetyOverride(sigma: StateSigma, limits: StateLimits = DEFAULT_LIMITS): PolicyDecision | null {
  const stable = withComputedStability(sigma, limits);
  if (stable.T > limits.T_max) {
    return {
      operator: OperatorName.O_cooldown,
      reason: "Thermal limit exceeded; forcing O_cooldown.",
      safety_override: true,
      command: makeCommand(OperatorName.O_cooldown, { safety_tag: 100, param: { gain: 0.65 } }),
    };
  }
  if (stable.P > limits.P_max || stable.s < limits.s_critical) {
    return {
      operator: OperatorName.O_dampen,
      reason: "Power/stability violation; forcing O_dampen.",
      safety_override: true,
      command: makeCommand(OperatorName.O_dampen, { safety_tag: 90, param: { gain: 0.55 } }),
    };
  }
  return null;
}

/** A transparent built-in heuristic policy π:Σ→operator for simulation and dataset generation. */
export function chooseHeuristicOperator(
  sigma: StateSigma,
  limits: StateLimits = DEFAULT_LIMITS,
  context: { latency_pressure?: Normalized01; congestion_pressure?: Normalized01 } = {}
): PolicyDecision {
  const override = safetyOverride(sigma, limits);
  if (override) return override;

  const latencyPressure = clamp01(context.latency_pressure ?? 0);
  const congestionPressure = clamp01(context.congestion_pressure ?? sigma.q);

  if (sigma.T > 0.78) {
    return {
      operator: OperatorName.O_cooldown,
      reason: "Thermal headroom low; preemptive cooldown.",
      safety_override: false,
      command: makeCommand(OperatorName.O_cooldown, { param: { gain: 0.35 }, safety_tag: 40 }),
    };
  }
  if ((sigma.j ?? 0) > 0.55 || congestionPressure > 0.70) {
    return {
      operator: OperatorName.O_shift_phase,
      reason: "Jitter/congestion high; shifting phase before topology change.",
      safety_override: false,
      command: makeCommand(OperatorName.O_shift_phase, { param: { gain: 0.35 }, safety_tag: 25 }),
    };
  }
  if (sigma.q > 0.62) {
    return {
      operator: OperatorName.O_rewire_local,
      reason: "Persistent local congestion; applying local rewire.",
      safety_override: false,
      command: makeCommand(OperatorName.O_rewire_local, { param: { gain: 0.28 }, safety_tag: 20 }),
    };
  }
  if (latencyPressure > 0.65 && sigma.P < 0.72 && sigma.T < 0.70 && sigma.s > limits.s_critical + 0.20) {
    return {
      operator: OperatorName.O_boost,
      reason: "Latency pressure high and safety headroom available; applying boost.",
      safety_override: false,
      command: makeCommand(OperatorName.O_boost, { param: { gain: 0.20 }, safety_tag: 10 }),
    };
  }
  return {
    operator: OperatorName.O_commit,
    reason: "State is safe and no pressure dominates; committing stable profile.",
    safety_override: false,
    command: makeCommand(OperatorName.O_commit, { param: { gain: 0.15 }, safety_tag: 5 }),
  };
}

/** One control-loop step: observe Σ, choose operator, apply model. */
export function controlStep(
  sigma: StateSigma,
  limits: StateLimits = DEFAULT_LIMITS,
  context: { latency_pressure?: Normalized01; congestion_pressure?: Normalized01 } = {}
): TransitionResult {
  const decision = chooseHeuristicOperator(sigma, limits, context);
  const result = applyOperatorModel(sigma, decision.command, limits);
  result.notes.unshift(`Policy: ${decision.reason}`);
  return result;
}

/** Generate a short synthetic episode for testing the operator ISA and policy. */
export function simulateEpisode(args: {
  initial: StateSigma;
  steps: number;
  limits?: StateLimits;
  context?: { latency_pressure?: Normalized01; congestion_pressure?: Normalized01 };
}): { transitions: TransitionResult[]; final_state: StateSigma; final_cost_J: number; stability_margin: number } {
  const limits = args.limits ?? DEFAULT_LIMITS;
  let cur = withComputedStability(args.initial, limits);
  const transitions: TransitionResult[] = [];
  let finalCost = 0;

  for (let i = 0; i < Math.max(0, Math.floor(args.steps)); i++) {
    const tr = controlStep(cur, limits, args.context ?? {});
    transitions.push(tr);
    finalCost += -tr.reward;
    cur = tr.next;
  }

  return {
    transitions,
    final_state: cur,
    final_cost_J: finalCost,
    stability_margin: cur.s - limits.s_critical,
  };
}

export const OI_HS_V1_1_SPEC: OiHardwareSpecV11 = {
  spec_id: "O.i-HS-1.1",
  title: "Operator Intelligence Hardware Specification v1.1 (Structure-First Computing)",
  status: "Research Prototype Architecture",
  compatibility: [
    "CMOS-based multi-tile SoC",
    "Tile Array + NoC + DVFS",
    "Coarse-grain reconfiguration",
    "Telemetry-driven operator ISA",
    "Safe online tuning / offline policy training",
  ],
  core_equation:
    "Σ(t+Δt) = 𝒪*(Σ(t)), where 𝒪* = argmin_{𝒪_seq} ∫(α·Energy + β·Latency + γ·Risk + μ·Complexity)dt, subject to s ≥ s_critical and hard safety bounds.",
  design_principles: [
    "Structure-first control: tune hardware configuration as an operator state, not only as scalar frequency.",
    "Safety before speed: O_dampen and O_cooldown override any performance policy.",
    "Coarse-grain reconfiguration: avoid fine-grain thrashing by using hysteresis and dwell windows.",
    "Telemetry-to-operator loop: every command must be traceable to measured Σ channels.",
    "Dataset-native architecture: state-action-transition logs are first-class training artifacts.",
  ],
  state_vector: {
    schema: "StateSigma",
    fields: [
      { key: "P", meaning: "Normalized power usage", range: "[0,1]" },
      { key: "T", meaning: "Normalized thermal state", range: "[0,1]" },
      { key: "f", meaning: "Normalized DVFS frequency level", range: "[0,1]" },
      { key: "a", meaning: "Normalized switching/activity", range: "[0,1]" },
      { key: "kappa", meaning: "Topology/routing profile identifier (κ)", range: "discrete int" },
      { key: "q", meaning: "Normalized congestion/queue depth", range: "[0,1]" },
      { key: "j", meaning: "Optional normalized jitter / phase noise metric", range: "[0,1]" },
      { key: "s", meaning: "Stability index", range: "[0,1]" },
    ],
    stability_definition: "s = 1 − RMS([P/P_max, T/T_max, q/q_max, j/j_max]); clamp to [0,1].",
    constraints: ["s ≥ s_critical", "P ≤ P_max", "T ≤ T_max", "q ≤ q_max", "j ≤ j_max"],
  },
  operators: OPERATOR_DEFINITIONS,
  operator_isa: {
    command_schema: "OperatorCommand",
    format: "CMD = (opcode | tile_mask | param | duration | safety_tag)",
    fields: [
      { key: "opcode", meaning: "Operator ID / hardware profile selector" },
      { key: "tile_mask", meaning: "Region selection bitmask" },
      { key: "param", meaning: "DVFS, topology profile, bandwidth profile, gain, mapping, vendor extension" },
      { key: "duration", meaning: "Apply duration in cycles/control ticks" },
      { key: "safety_tag", meaning: "Override priority tag for supervisor arbitration" },
    ],
  },
  telemetry: {
    packet_schema: "TelemetryPacket",
    sampling_rate_hz_range: [10_000, 1_000_000],
    notes: "Zone-aggregated telemetry is converted to Σ by sigmaFromTelemetry(); control should run coarsely enough to avoid reconfiguration overhead.",
  },
  policy: {
    function_form: "π: Σ → OperatorCommand, optionally conditioned on workload context and safety override.",
    options: ["Lookup table", "Decision tree", "Tiny MLP", "Bandit (safe online tuning)", "RL policy (offline-trained)", "Built-in transparent heuristic"],
    objective: {
      form: "J = ∫(α·Energy + β·Latency + γ·Risk + μ·Complexity)dt + 𝟙_fail·M",
      weights: DEFAULT_OBJECTIVE_WEIGHTS,
      risk_terms: ["max(0, s_critical − s)", "max(0, P − P_max)", "max(0, T − T_max)", "max(0, q − q_max)", "max(0, j − j_max)"],
    },
    built_in_policy: "chooseHeuristicOperator(): thermal override → power/stability override → phase shift → local rewire → boost → commit.",
  },
  safety: {
    hard_constraints: ["P ≤ P_max", "T ≤ T_max", "q ≤ q_max", "j ≤ j_max", "s ≥ s_critical"],
    override_policy: {
      force_ops: [OperatorName.O_dampen, OperatorName.O_cooldown],
      power_gate_allowed: true,
    },
    hysteresis: {
      dvfs_delta_threshold: 0.05,
      min_dwell_topology: 10,
      min_dwell_commit: 4,
    },
  },
  dataset: {
    state_action_transition: {
      state: "StateSigma",
      action: "Opcode",
      next_state: "StateSigma",
      reward: "number",
      safety_violation: "boolean",
    },
    episode_sequence: {
      episode_id: "number",
      initial_state: "StateSigma",
      operator_sequence: "Opcode[]",
      final_cost_J: "number",
      stability_margin: "number",
    },
  },
  hardware: {
    required_blocks: [
      "Tile Array (compute tiles with local SRAM)",
      "NoC with profile switching (routing/bandwidth configs)",
      "DVFS Controller (per-zone)",
      "Telemetry Aggregator (counters + sensors)",
      "Operator Scheduler (tiny core / microcontroller)",
      "Safety Supervisor (hard override logic)",
      "Trace Buffer for state-action-transition logging",
    ],
    data_flow: "Telemetry → sigmaFromTelemetry → Scheduler/Policy → OperatorCommand → DVFS/NoC/Mapping config → Updated Σ → Trace Buffer → Telemetry",
    overhead_estimates: {
      area_overhead_percent_range: [5, 10],
      control_power_overhead_percent_max: 3,
      expected_energy_savings_percent_range: [15, 30],
    },
  },
  runtime_exports: [
    "computeStability",
    "sigmaFromTelemetry",
    "validateStateSigma",
    "makeCommand",
    "applyOperatorModel",
    "safetyOverride",
    "chooseHeuristicOperator",
    "controlStep",
    "simulateEpisode",
  ],
  versioning: {
    created_at_iso: "2026-02-25T00:00:00+07:00",
    upgraded_at_iso: "2026-07-05T00:00:00+07:00",
    author: "Phan Thành Trung",
    upgrade_summary: [
      "Patched TypeScript boolean literal.",
      "Added jitter-aware stability and safety constraints.",
      "Added deterministic transition model and transparent heuristic policy.",
      "Added runtime exports for simulation and dataset generation.",
    ],
  },
};

export default OI_HS_V1_1_SPEC;

/**
 * ECO v1.1 — Entropy Collapse Operator Runtime
 * Operator Intelligence / Adaptive Intelligence
 *
 * Purpose:
 *   Convert ECO from a research specification into a small executable runtime.
 *   ECO governs whether a possibility space remains OPEN, becomes BOUND,
 *   is COLLAPSED, or self-tunes through ADAPT.
 *
 * Core reading:
 *   Operational entropy = distance from structural / fixed-point stability,
 *   not merely Shannon randomness. A state remains admissible when it is
 *   sufficiently close to the basin of the governing fixed-point law U(x)=x.
 */

export type CollapseMode = "OPEN" | "BOUND" | "COLLAPSE" | "ADAPT";
export type SpaceType = "symbolic" | "numeric" | "graph" | "token" | "latent" | "hybrid";
export type SafetySeverity = "info" | "warn" | "critical";

export interface ECOCandidate<TPayload = unknown> {
  /** Stable identifier for trace and active masks. */
  id: string;
  /** Optional external payload: token path, proof node, graph node, vector, etc. */
  payload?: TPayload;
  /** Optional user/domain viability estimate in [0,1]. */
  viability?: number;
  /** Optional support/evidence score in [0,1]. */
  support?: number;
  /** Optional confidence score in [0,1]. */
  confidence?: number;
  /** Optional raw metrics; missing values are estimated by hooks or defaults. */
  metrics?: Partial<ECOMetrics>;
  /** Optional metadata tags used by downstream governance layers. */
  tags?: string[];
}

export interface ECOMetrics {
  /** Aggregate structural complexity; lower is better. */
  structuralComplexity: number;
  /** Distance to fixed-point consistency Fix(U); lower is better. */
  fixedPointError: number;
  /** Semantic / latent dispersion; lower is better. */
  semanticDispersion: number;
  /** Average branch fan-out associated with this candidate; lower is better. */
  branchingFactor: number;
  /** Curvature / instability proxy; lower is better. */
  curvature: number;
  /** Dynamical or logical instability proxy; lower is better. */
  instability: number;
  /** Constraint inconsistency proxy; lower is better. */
  inconsistency: number;
}

export interface ECOThresholds {
  /** Structural complexity threshold. */
  structuralThreshold: number;
  /** Normalized operational entropy threshold in [0,1]. */
  entropyThreshold: number;
  /** Fixed-point tolerance: epsilon for ||U(x)-x|| or a domain estimator. */
  fixedPointTolerance: number;
  /** Semantic dispersion threshold. */
  semanticDispersionThreshold: number;
  /** Maximum branch fan-out tolerated before binding/collapse pressure rises. */
  maxBranchingFactor: number;
  /** Minimum average confidence before hard collapse is allowed. */
  minCollapseConfidence: number;
  /** Minimum number of candidates that must remain after collapse when available. */
  minViableCardinality: number;
  /** Minimum admissibility score for BOUND mode. */
  boundScoreFloor: number;
  /** Minimum admissibility score for COLLAPSE mode. */
  collapseScoreFloor: number;
  /** Fraction retained in BOUND mode if thresholding is too weak. */
  boundKeepRatio: number;
  /** Fraction retained in COLLAPSE mode if thresholding is too weak. */
  collapseKeepRatio: number;
  /** Adaptation learning rate for threshold updates. */
  adaptRate: number;
}

export interface ECOWeights {
  structural: number;
  fixedPoint: number;
  dispersion: number;
  branching: number;
  curvature: number;
  instability: number;
  inconsistency: number;
  viability: number;
  support: number;
  confidence: number;
}

export interface ECOConfig {
  spaceType: SpaceType;
  thresholds?: Partial<ECOThresholds>;
  weights?: Partial<ECOWeights>;
  /** Optional override. If omitted, ECO selects the mode from metrics. */
  forceMode?: CollapseMode;
  /** Enable threshold adaptation from feedback/history. */
  adaptive?: boolean;
  /** Domain compatibility flag. If false, ECO falls back to OPEN. */
  domainCompatible?: boolean;
  /** Keep rejected candidates in recovery buffer. */
  keepRecoveryBuffer?: boolean;
  /** Optional human-readable task/domain label. */
  domainLabel?: string;
}

export interface ECOHooks<TPayload = unknown> {
  structuralComplexity?: (candidate: ECOCandidate<TPayload>) => number;
  fixedPointError?: (candidate: ECOCandidate<TPayload>) => number;
  semanticDispersion?: (candidate: ECOCandidate<TPayload>) => number;
  branchingFactor?: (candidate: ECOCandidate<TPayload>) => number;
  curvature?: (candidate: ECOCandidate<TPayload>) => number;
  instability?: (candidate: ECOCandidate<TPayload>) => number;
  inconsistency?: (candidate: ECOCandidate<TPayload>) => number;
  viability?: (candidate: ECOCandidate<TPayload>) => number;
  support?: (candidate: ECOCandidate<TPayload>) => number;
  confidence?: (candidate: ECOCandidate<TPayload>) => number;
}

export interface CandidateProfile<TPayload = unknown> {
  candidate: ECOCandidate<TPayload>;
  metrics: ECOMetrics;
  viability: number;
  support: number;
  confidence: number;
  risk: number;
  admissibilityScore: number;
  insideFixedPointTolerance: boolean;
  reasons: string[];
}

export interface ECOSpaceProfile {
  count: number;
  meanRisk: number;
  meanAdmissibility: number;
  meanStructuralComplexity: number;
  meanFixedPointError: number;
  meanSemanticDispersion: number;
  meanBranchingFactor: number;
  meanConfidence: number;
  operationalEntropy: number;
}

export interface ECOFeedback {
  /** Observed validation error after downstream U/TuyCut/etc. Lower is better. */
  validationError?: number;
  /** Whether downstream pipeline recovered useful states after ECO. */
  recoveryRate?: number;
  /** Whether accepted states were later rejected systematically. */
  downstreamRejectionRate?: number;
  /** Optional observed convergence improvement in [0,1]. */
  convergenceGain?: number;
}

export interface SafetyEvent {
  id: string;
  severity: SafetySeverity;
  message: string;
  action: string;
}

export interface ECOTraceStep {
  step: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface ECOResult<TPayload = unknown> {
  mode: CollapseMode;
  requestedMode: CollapseMode;
  thresholds: ECOThresholds;
  profileBefore: ECOSpaceProfile;
  profileAfter: ECOSpaceProfile;
  deltaEntropy: number;
  branchReduction: number;
  kept: CandidateProfile<TPayload>[];
  rejected: CandidateProfile<TPayload>[];
  recoveryBuffer: CandidateProfile<TPayload>[];
  activeMask: Record<string, boolean>;
  safetyEvents: SafetyEvent[];
  trace: ECOTraceStep[];
}

export const ECO_DEFAULT_THRESHOLDS: ECOThresholds = Object.freeze({
  structuralThreshold: 1.0,
  entropyThreshold: 0.55,
  fixedPointTolerance: 0.25,
  semanticDispersionThreshold: 0.6,
  maxBranchingFactor: 8,
  minCollapseConfidence: 0.55,
  minViableCardinality: 2,
  boundScoreFloor: 0.42,
  collapseScoreFloor: 0.62,
  boundKeepRatio: 0.65,
  collapseKeepRatio: 0.35,
  adaptRate: 0.12,
});

export const ECO_DEFAULT_WEIGHTS: ECOWeights = Object.freeze({
  structural: 1.0,
  fixedPoint: 1.6,
  dispersion: 1.0,
  branching: 0.7,
  curvature: 0.5,
  instability: 0.9,
  inconsistency: 1.1,
  viability: 1.2,
  support: 0.8,
  confidence: 0.8,
});

export function clamp(x: number, lo: number, hi: number): number {
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}

export function clamp01(x: number): number {
  return clamp(x, 0, 1);
}

export function safeNumber(x: unknown, fallback: number): number {
  return typeof x === "number" && Number.isFinite(x) ? x : fallback;
}

export function mergeThresholds(partial?: Partial<ECOThresholds>): ECOThresholds {
  return { ...ECO_DEFAULT_THRESHOLDS, ...(partial ?? {}) };
}

export function mergeWeights(partial?: Partial<ECOWeights>): ECOWeights {
  return { ...ECO_DEFAULT_WEIGHTS, ...(partial ?? {}) };
}

function lowerIsBetterScore(value: number, threshold: number): number {
  if (threshold <= 0) return value <= 0 ? 1 : 0;
  return clamp01(1 - value / threshold);
}

function lowerIsBetterRisk(value: number, threshold: number): number {
  if (threshold <= 0) return value > 0 ? 1 : 0;
  return clamp01(value / threshold);
}

function average(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/**
 * Normalized Shannon entropy over candidate risk mass.
 * If all risk is zero, operational entropy is zero.
 */
export function normalizedOperationalEntropy(risks: number[]): number {
  const n = risks.length;
  if (n <= 1) return 0;
  const mass = risks.map((r) => Math.max(0, r));
  const total = mass.reduce((a, b) => a + b, 0);
  if (total <= 1e-12) return 0;
  let H = 0;
  for (const r of mass) {
    const p = r / total;
    if (p > 0) H -= p * Math.log(p);
  }
  return H / Math.log(n);
}

export function profileCandidate<TPayload>(
  candidate: ECOCandidate<TPayload>,
  cfg: ECOConfig,
  hooks: ECOHooks<TPayload> = {},
): CandidateProfile<TPayload> {
  const thresholds = mergeThresholds(cfg.thresholds);
  const weights = mergeWeights(cfg.weights);
  const m = candidate.metrics ?? {};

  const metrics: ECOMetrics = {
    structuralComplexity: safeNumber(m.structuralComplexity, safeNumber(hooks.structuralComplexity?.(candidate), 0)),
    fixedPointError: safeNumber(m.fixedPointError, safeNumber(hooks.fixedPointError?.(candidate), 0)),
    semanticDispersion: safeNumber(m.semanticDispersion, safeNumber(hooks.semanticDispersion?.(candidate), 0)),
    branchingFactor: safeNumber(m.branchingFactor, safeNumber(hooks.branchingFactor?.(candidate), 1)),
    curvature: safeNumber(m.curvature, safeNumber(hooks.curvature?.(candidate), 0)),
    instability: safeNumber(m.instability, safeNumber(hooks.instability?.(candidate), 0)),
    inconsistency: safeNumber(m.inconsistency, safeNumber(hooks.inconsistency?.(candidate), 0)),
  };

  const viability = clamp01(safeNumber(candidate.viability, safeNumber(hooks.viability?.(candidate), 0.5)));
  const support = clamp01(safeNumber(candidate.support, safeNumber(hooks.support?.(candidate), 0.5)));
  const confidence = clamp01(safeNumber(candidate.confidence, safeNumber(hooks.confidence?.(candidate), 0.5)));

  const scores = {
    structural: lowerIsBetterScore(metrics.structuralComplexity, thresholds.structuralThreshold),
    fixedPoint: lowerIsBetterScore(metrics.fixedPointError, thresholds.fixedPointTolerance),
    dispersion: lowerIsBetterScore(metrics.semanticDispersion, thresholds.semanticDispersionThreshold),
    branching: lowerIsBetterScore(metrics.branchingFactor, thresholds.maxBranchingFactor),
    curvature: lowerIsBetterScore(metrics.curvature, thresholds.structuralThreshold),
    instability: lowerIsBetterScore(metrics.instability, thresholds.structuralThreshold),
    inconsistency: lowerIsBetterScore(metrics.inconsistency, thresholds.structuralThreshold),
    viability,
    support,
    confidence,
  };

  const weightedSum =
    weights.structural * scores.structural +
    weights.fixedPoint * scores.fixedPoint +
    weights.dispersion * scores.dispersion +
    weights.branching * scores.branching +
    weights.curvature * scores.curvature +
    weights.instability * scores.instability +
    weights.inconsistency * scores.inconsistency +
    weights.viability * scores.viability +
    weights.support * scores.support +
    weights.confidence * scores.confidence;

  const totalWeight =
    weights.structural + weights.fixedPoint + weights.dispersion + weights.branching +
    weights.curvature + weights.instability + weights.inconsistency +
    weights.viability + weights.support + weights.confidence;

  const admissibilityScore = clamp01(weightedSum / totalWeight);

  const riskTerms = [
    lowerIsBetterRisk(metrics.structuralComplexity, thresholds.structuralThreshold),
    lowerIsBetterRisk(metrics.fixedPointError, thresholds.fixedPointTolerance),
    lowerIsBetterRisk(metrics.semanticDispersion, thresholds.semanticDispersionThreshold),
    lowerIsBetterRisk(metrics.branchingFactor, thresholds.maxBranchingFactor),
    lowerIsBetterRisk(metrics.curvature, thresholds.structuralThreshold),
    lowerIsBetterRisk(metrics.instability, thresholds.structuralThreshold),
    lowerIsBetterRisk(metrics.inconsistency, thresholds.structuralThreshold),
    1 - viability,
    1 - support,
    1 - confidence,
  ];
  const risk = clamp01(average(riskTerms));

  const reasons: string[] = [];
  if (metrics.fixedPointError > thresholds.fixedPointTolerance) reasons.push("outside fixed-point tolerance");
  if (metrics.structuralComplexity > thresholds.structuralThreshold) reasons.push("high structural complexity");
  if (metrics.semanticDispersion > thresholds.semanticDispersionThreshold) reasons.push("high semantic dispersion");
  if (metrics.branchingFactor > thresholds.maxBranchingFactor) reasons.push("branching exceeds limit");
  if (confidence < thresholds.minCollapseConfidence) reasons.push("low confidence");
  if (reasons.length === 0) reasons.push("inside admissible basin approximation");

  return {
    candidate,
    metrics,
    viability,
    support,
    confidence,
    risk,
    admissibilityScore,
    insideFixedPointTolerance: metrics.fixedPointError <= thresholds.fixedPointTolerance,
    reasons,
  };
}

export function profileSpace<TPayload>(profiles: CandidateProfile<TPayload>[]): ECOSpaceProfile {
  const count = profiles.length;
  const risks = profiles.map((p) => p.risk);
  return {
    count,
    meanRisk: average(risks),
    meanAdmissibility: average(profiles.map((p) => p.admissibilityScore)),
    meanStructuralComplexity: average(profiles.map((p) => p.metrics.structuralComplexity)),
    meanFixedPointError: average(profiles.map((p) => p.metrics.fixedPointError)),
    meanSemanticDispersion: average(profiles.map((p) => p.metrics.semanticDispersion)),
    meanBranchingFactor: average(profiles.map((p) => p.metrics.branchingFactor)),
    meanConfidence: average(profiles.map((p) => p.confidence)),
    operationalEntropy: normalizedOperationalEntropy(risks),
  };
}

export function adaptThresholds(thresholds: ECOThresholds, feedback: ECOFeedback = {}): ECOThresholds {
  const eta = thresholds.adaptRate;
  const validationError = clamp01(feedback.validationError ?? 0);
  const recoveryRate = clamp01(feedback.recoveryRate ?? 0);
  const downstreamRejectionRate = clamp01(feedback.downstreamRejectionRate ?? 0);
  const convergenceGain = clamp01(feedback.convergenceGain ?? 0);

  // High validation/downstream rejection => stricter collapse.
  // High recovery rate after overcollapse => relax slightly.
  const strictness = clamp(validationError + downstreamRejectionRate - 0.5 * recoveryRate - 0.3 * convergenceGain, -1, 1);
  const factor = 1 - eta * strictness;
  const entropyFactor = 1 - eta * strictness * 0.5;

  return {
    ...thresholds,
    structuralThreshold: Math.max(1e-9, thresholds.structuralThreshold * factor),
    fixedPointTolerance: Math.max(1e-9, thresholds.fixedPointTolerance * factor),
    semanticDispersionThreshold: Math.max(1e-9, thresholds.semanticDispersionThreshold * factor),
    entropyThreshold: clamp(thresholds.entropyThreshold * entropyFactor, 0.05, 0.95),
  };
}

export function selectCollapseMode(profile: ECOSpaceProfile, cfg: ECOConfig): CollapseMode {
  if (cfg.forceMode) return cfg.forceMode;
  if (cfg.domainCompatible === false) return "OPEN";
  const th = mergeThresholds(cfg.thresholds);
  if (profile.count === 0) return "OPEN";
  if (cfg.adaptive) return "ADAPT";

  const highEntropy = profile.operationalEntropy >= th.entropyThreshold;
  const highFixedPointError = profile.meanFixedPointError >= th.fixedPointTolerance;
  const highStructural = profile.meanStructuralComplexity >= th.structuralThreshold;
  const highDispersion = profile.meanSemanticDispersion >= th.semanticDispersionThreshold;
  const highBranching = profile.meanBranchingFactor >= th.maxBranchingFactor;

  if (highEntropy && (highFixedPointError || highStructural || highDispersion)) return "COLLAPSE";
  if (highEntropy || highFixedPointError || highStructural || highDispersion || highBranching) return "BOUND";
  return "OPEN";
}

function sortByAdmissibilityDesc<TPayload>(profiles: CandidateProfile<TPayload>[]): CandidateProfile<TPayload>[] {
  return [...profiles].sort((a, b) => b.admissibilityScore - a.admissibilityScore);
}

function topN<TPayload>(profiles: CandidateProfile<TPayload>[], n: number): CandidateProfile<TPayload>[] {
  return profiles.slice(0, Math.max(0, Math.min(profiles.length, n)));
}

function uniqueProfiles<TPayload>(profiles: CandidateProfile<TPayload>[]): CandidateProfile<TPayload>[] {
  const seen = new Set<string>();
  const out: CandidateProfile<TPayload>[] = [];
  for (const p of profiles) {
    if (!seen.has(p.candidate.id)) {
      seen.add(p.candidate.id);
      out.push(p);
    }
  }
  return out;
}

export function applyCollapse<TPayload>(
  profiles: CandidateProfile<TPayload>[],
  mode: CollapseMode,
  thresholds: ECOThresholds,
): { kept: CandidateProfile<TPayload>[]; rejected: CandidateProfile<TPayload>[] } {
  const sorted = sortByAdmissibilityDesc(profiles);
  if (mode === "OPEN") return { kept: sorted, rejected: [] };

  if (mode === "BOUND") {
    const byFloor = sorted.filter((p) => p.admissibilityScore >= thresholds.boundScoreFloor);
    const byRatio = topN(sorted, Math.ceil(sorted.length * thresholds.boundKeepRatio));
    const kept = uniqueProfiles([...byFloor, ...byRatio]);
    const keptIds = new Set(kept.map((p) => p.candidate.id));
    return { kept, rejected: sorted.filter((p) => !keptIds.has(p.candidate.id)) };
  }

  // COLLAPSE and ADAPT both use hard admissibility after any adaptation.
  const byFloor = sorted.filter(
    (p) =>
      p.admissibilityScore >= thresholds.collapseScoreFloor &&
      p.metrics.fixedPointError <= thresholds.fixedPointTolerance * 1.75,
  );
  const byRatio = topN(sorted, Math.ceil(sorted.length * thresholds.collapseKeepRatio));
  const kept = uniqueProfiles([...byFloor, ...byRatio]);
  const keptIds = new Set(kept.map((p) => p.candidate.id));
  return { kept, rejected: sorted.filter((p) => !keptIds.has(p.candidate.id)) };
}

function makeActiveMask<TPayload>(profiles: CandidateProfile<TPayload>[]): Record<string, boolean> {
  const mask: Record<string, boolean> = {};
  for (const p of profiles) mask[p.candidate.id] = true;
  return mask;
}

function computeBranchReduction(before: ECOSpaceProfile, after: ECOSpaceProfile): number {
  if (before.count === 0) return 0;
  return clamp01(1 - after.count / before.count);
}

function meanScore(profiles: CandidateProfile<unknown>[]): number {
  return average(profiles.map((p) => p.admissibilityScore));
}

export function runECO<TPayload>(
  candidates: ECOCandidate<TPayload>[],
  cfg: ECOConfig,
  hooks: ECOHooks<TPayload> = {},
  feedback: ECOFeedback = {},
): ECOResult<TPayload> {
  const trace: ECOTraceStep[] = [];
  const safetyEvents: SafetyEvent[] = [];
  let thresholds = mergeThresholds(cfg.thresholds);

  trace.push({ step: "measure_structure", message: "Profiling candidates against structural and fixed-point metrics." });
  const profiles = candidates.map((c) => profileCandidate(c, { ...cfg, thresholds }, hooks));
  const profileBefore = profileSpace(profiles);

  let requestedMode = selectCollapseMode(profileBefore, { ...cfg, thresholds });
  trace.push({ step: "select_mode", message: `Selected requested mode: ${requestedMode}.`, data: { profileBefore } });

  if (cfg.domainCompatible === false) {
    safetyEvents.push({
      id: "guard.domain_mismatch",
      severity: "warn",
      message: "Metric estimator is marked incompatible with active domain.",
      action: "fallback_to_OPEN",
    });
    requestedMode = "OPEN";
  }

  if (requestedMode === "ADAPT") {
    thresholds = adaptThresholds(thresholds, feedback);
    trace.push({ step: "adapt_thresholds", message: "Updated thresholds from feedback/history.", data: { thresholds } });
  }

  let appliedMode: CollapseMode = requestedMode === "ADAPT" ? selectCollapseMode(profileBefore, { ...cfg, adaptive: false, thresholds }) : requestedMode;
  if (requestedMode === "ADAPT" && appliedMode === "OPEN" && profileBefore.operationalEntropy > thresholds.entropyThreshold) {
    appliedMode = "BOUND";
  }

  const collapseConfidence = profileBefore.meanConfidence * (1 - Math.min(0.9, profileBefore.operationalEntropy * 0.5));
  if (appliedMode === "COLLAPSE" && collapseConfidence < thresholds.minCollapseConfidence) {
    safetyEvents.push({
      id: "guard.no_premature_collapse",
      severity: "warn",
      message: `Collapse confidence ${collapseConfidence.toFixed(3)} is below floor ${thresholds.minCollapseConfidence}.`,
      action: "fallback_to_BOUND",
    });
    appliedMode = "BOUND";
  }

  trace.push({ step: "apply_collapse", message: `Applying mode: ${appliedMode}.` });
  let { kept, rejected } = applyCollapse(profiles, appliedMode, thresholds);

  if (kept.length < thresholds.minViableCardinality && profiles.length >= thresholds.minViableCardinality) {
    const sorted = sortByAdmissibilityDesc(profiles);
    kept = topN(sorted, thresholds.minViableCardinality);
    const keptIds = new Set(kept.map((p) => p.candidate.id));
    rejected = sorted.filter((p) => !keptIds.has(p.candidate.id));
    safetyEvents.push({
      id: "guard.overcompression",
      severity: "warn",
      message: "Active space shrank below minimum viable cardinality.",
      action: "re_expand_from_bounded_buffer",
    });
  }

  const profileAfter = profileSpace(kept);
  const deltaEntropy = profileBefore.operationalEntropy - profileAfter.operationalEntropy;
  const branchReduction = computeBranchReduction(profileBefore, profileAfter);

  const keptUnknown = kept as CandidateProfile<unknown>[];
  const rejectedUnknown = rejected as CandidateProfile<unknown>[];
  const scoreGap = meanScore(keptUnknown) - meanScore(rejectedUnknown);
  trace.push({
    step: "emit_trace",
    message: "ECO runtime completed.",
    data: {
      kept: kept.length,
      rejected: rejected.length,
      deltaEntropy,
      branchReduction,
      scoreGap,
    },
  });

  return {
    mode: appliedMode,
    requestedMode,
    thresholds,
    profileBefore,
    profileAfter,
    deltaEntropy,
    branchReduction,
    kept,
    rejected,
    recoveryBuffer: cfg.keepRecoveryBuffer === false ? [] : rejected,
    activeMask: makeActiveMask(kept),
    safetyEvents,
    trace,
  };
}

export function runECOBatch<TPayload>(
  spaces: Array<{ id: string; candidates: ECOCandidate<TPayload>[] }>,
  cfg: ECOConfig,
  hooks: ECOHooks<TPayload> = {},
): Array<{ id: string; result: ECOResult<TPayload> }> {
  return spaces.map((space) => ({ id: space.id, result: runECO(space.candidates, cfg, hooks) }));
}

export function makeNumericCandidate(
  id: string,
  structuralComplexity: number,
  fixedPointError: number,
  semanticDispersion: number,
  confidence = 0.8,
): ECOCandidate<{ note: string }> {
  return {
    id,
    payload: { note: `candidate:${id}` },
    confidence,
    support: confidence,
    viability: 1 - clamp01((fixedPointError + semanticDispersion) / 2),
    metrics: {
      structuralComplexity,
      fixedPointError,
      semanticDispersion,
      branchingFactor: 1 + 10 * semanticDispersion,
      curvature: structuralComplexity * 0.5,
      instability: fixedPointError,
      inconsistency: semanticDispersion * 0.6,
    },
  };
}

export function demoECO(): ECOResult<{ note: string }> {
  const candidates = [
    makeNumericCandidate("stable-core", 0.18, 0.04, 0.10, 0.94),
    makeNumericCandidate("near-basin", 0.38, 0.18, 0.30, 0.83),
    makeNumericCandidate("noisy-branch", 0.92, 0.62, 0.76, 0.58),
    makeNumericCandidate("unstable-hypothesis", 1.45, 0.98, 0.88, 0.42),
    makeNumericCandidate("unsupported-tail", 1.20, 0.80, 0.95, 0.30),
    makeNumericCandidate("weak-but-recoverable", 0.75, 0.40, 0.55, 0.62),
  ];

  return runECO(candidates, {
    spaceType: "latent",
    domainCompatible: true,
    keepRecoveryBuffer: true,
    thresholds: {
      structuralThreshold: 0.8,
      entropyThreshold: 0.55,
      fixedPointTolerance: 0.25,
      semanticDispersionThreshold: 0.55,
      minViableCardinality: 2,
      collapseScoreFloor: 0.62,
    },
  });
}

export function runSelfTests(): { passed: boolean; checks: Record<string, boolean>; demo: Pick<ECOResult, "mode" | "deltaEntropy" | "branchReduction"> } {
  const demo = demoECO();
  const checks: Record<string, boolean> = {
    collapsesOrBounds: demo.mode === "COLLAPSE" || demo.mode === "BOUND",
    keepsStableCore: Boolean(demo.activeMask["stable-core"]),
    rejectsUnstable: demo.rejected.some((p) => p.candidate.id === "unstable-hypothesis"),
    preservesMinimumViable: demo.kept.length >= demo.thresholds.minViableCardinality,
    emitsTrace: demo.trace.length >= 4,
  };
  return {
    passed: Object.values(checks).every(Boolean),
    checks,
    demo: {
      mode: demo.mode,
      deltaEntropy: demo.deltaEntropy,
      branchReduction: demo.branchReduction,
    },
  };
}

export const ECO_RUNTIME_SPEC = Object.freeze({
  identity: {
    id: "oi.operator.entropy_collapse.runtime.v1_1",
    shortName: "ECO",
    fullName: "Entropy Collapse Operator Runtime",
    version: "1.1.0",
    status: "runtime-stable",
  },
  runtimeExports: [
    "runECO",
    "runECOBatch",
    "profileCandidate",
    "profileSpace",
    "selectCollapseMode",
    "applyCollapse",
    "adaptThresholds",
    "normalizedOperationalEntropy",
    "demoECO",
    "runSelfTests",
  ],
  modes: ["OPEN", "BOUND", "COLLAPSE", "ADAPT"],
  safetyGuards: ["domain_mismatch", "no_premature_collapse", "overcompression"],
});

export default {
  runECO,
  runECOBatch,
  profileCandidate,
  profileSpace,
  selectCollapseMode,
  applyCollapse,
  adaptThresholds,
  normalizedOperationalEntropy,
  demoECO,
  runSelfTests,
  ECO_RUNTIME_SPEC,
};

/**
 * Adheral Operator (⧉) v1.1 — Runtime Relation-Coupling Operator
 * -----------------------------------------------------------------
 * Operatorology / Operator Intelligence artifact.
 *
 * Purpose:
 *   Evaluate whether two entities A and B form an adheral pair:
 *   a stable, symmetric, reconstructable, elastic, identity-preserving coupling.
 *
 * Upgrade over v0.1:
 *   - Numeric axiom scores, not only booleans.
 *   - Bidirectional reconstruction error using embeddings or supplied hooks.
 *   - Elasticity stress-test across distance / relation samples.
 *   - Invariance test through signatures or transformed embeddings.
 *   - Weighted total adheral score.
 *   - Ranked pair scanning over a set of entities.
 *   - Trace and self-tests for runtime validation.
 *
 * No external dependencies. Unicode symbols are kept in comments/strings.
 */

export type Scalar = number;
export type Vec = number[];
export type RelationMode = "adheral" | "partial" | "reject";

export interface AdheralEntity {
  id: string;
  label?: string;

  /** Optional embedding / state vector for numeric checks. */
  embedding?: Vec;

  /** τ(A): transformed embedding for invariance checks. */
  transformedEmbedding?: Vec;

  /** Symbolic signature before transform. */
  stateSignature?: string;

  /** Symbolic signature after τ(·). */
  transformedSignature?: string;

  /** Observed co-existence probability estimate P(A∧B). */
  coExistence?: Record<string, number>;

  /** Directional relation strength estimate rel(A→B), rel(B→A). */
  relationStrength?: Record<string, number>;

  /** Legacy boolean evidence: whether Φ_{A→B} exists. */
  reconstructs?: Record<string, boolean>;

  /** Optional vector prediction: A's reconstruction of the other entity. */
  reconstructedEmbedding?: Record<string, Vec>;

  /** Distance samples across context/time. */
  distanceSamples?: Record<string, number[]>;

  /** Relation-holding samples across contexts/distances. */
  relationSamples?: Record<string, number[]>;

  /** Optional binary co-observation samples. true means A and B co-occurred in that observation. */
  coObservationSamples?: Record<string, boolean[]>;

  /** Free-form payload for external systems. */
  meta?: Record<string, unknown>;
}

export interface ReconstructionHooks {
  /** Optional learned map Φ_{A→B}. */
  reconstructBFromA?: (A: AdheralEntity, B: AdheralEntity) => Vec | undefined;
  /** Optional learned map Φ_{B→A}. */
  reconstructAFromB?: (B: AdheralEntity, A: AdheralEntity) => Vec | undefined;
}

export interface AdheralThresholds {
  /** A1: minimum P(A∧B). */
  coExistence: number;
  /** A2: relation-strength directional tolerance. */
  symmetryTolerance: number;
  /** A2: minimum directional relation strength. */
  relationStrength: number;
  /** A3: maximum acceptable normalized reconstruction error. */
  reconstructionError: number;
  /** A4: minimum number of distance / relation samples. */
  elasticitySamples: number;
  /** A4: minimum distance range considered a nontrivial elasticity stress. */
  elasticityDistanceRange: number;
  /** A4: minimum relation score across stress samples. */
  elasticityRelationFloor: number;
  /** A5: maximum transformed-embedding drift. */
  invarianceDrift: number;
  /** Total weighted score required for adheral mode. */
  totalScore: number;
  /** Total weighted score required for partial mode. */
  partialScore: number;
}

export interface AdheralWeights {
  coExistence: number;
  symmetry: number;
  reconstructability: number;
  elasticity: number;
  invariance: number;
}

export interface AdheralConfig {
  thresholds?: Partial<AdheralThresholds>;
  weights?: Partial<AdheralWeights>;
  /** If true, an axiom below threshold rejects even if total score is high. */
  requireAllAxioms?: boolean;
  /** If false, missing invariance evidence is treated as neutral pass. */
  requireInvariance?: boolean;
  /** If true, missing reconstruction evidence rejects A3; if false, it yields score 0.5. */
  requireReconstruction?: boolean;
  /** Small epsilon for numeric safety. */
  eps?: number;
}

export interface AxiomScore {
  passed: boolean;
  score: number;
  value: number;
  threshold: number;
  note: string;
}

export interface ReconstructionDiagnostics {
  phi_AtoB: boolean;
  phi_BtoA: boolean;
  error_AtoB?: number;
  error_BtoA?: number;
  score_AtoB: number;
  score_BtoA: number;
}

export interface ElasticityDiagnostics {
  distanceSampleCount: number;
  relationSampleCount: number;
  distanceRange: number;
  relationMin: number;
  relationMean: number;
  distanceVariance: number;
  relationVariance: number;
}

export interface AdheralTraceEntry {
  stage: string;
  ok: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface AdheralResult {
  pair: { A: string; B: string };
  adheral: boolean;
  mode: RelationMode;
  totalScore: number;
  axioms: {
    coExistence: AxiomScore;
    symmetry: AxiomScore;
    reconstructability: AxiomScore;
    elasticity: AxiomScore;
    invariance: AxiomScore;
  };
  diagnostics: {
    P_AB: number;
    rel_AB: number;
    rel_BA: number;
    symmetryDelta: number;
    reconstruction: ReconstructionDiagnostics;
    elasticity: ElasticityDiagnostics;
    invarianceDrift?: number;
  };
  trace: AdheralTraceEntry[];
  notes: string[];
}

export const ADHERAL_V1_1_METADATA = Object.freeze({
  id: "operator.adheral.runtime.v1_1",
  name: "Adheral Operator",
  symbol: "⧉",
  version: "1.1.0",
  family: "relation-coupling",
  objective: "BIND → Stable_Symmetric_Adhesion",
  summary:
    "Runtime operator for detecting stable, symmetric, reconstructable, elastic, identity-preserving entity pairs.",
});

export const DEFAULT_THRESHOLDS: AdheralThresholds = Object.freeze({
  coExistence: 0.9,
  symmetryTolerance: 0.15,
  relationStrength: 0.6,
  reconstructionError: 0.25,
  elasticitySamples: 2,
  elasticityDistanceRange: 0.5,
  elasticityRelationFloor: 0.6,
  invarianceDrift: 0.15,
  totalScore: 0.8,
  partialScore: 0.55,
});

export const DEFAULT_WEIGHTS: AdheralWeights = Object.freeze({
  coExistence: 1,
  symmetry: 1,
  reconstructability: 1.25,
  elasticity: 1,
  invariance: 1,
});

function cfgThresholds(cfg: AdheralConfig = {}): AdheralThresholds {
  return { ...DEFAULT_THRESHOLDS, ...(cfg.thresholds ?? {}) };
}

function cfgWeights(cfg: AdheralConfig = {}): AdheralWeights {
  return { ...DEFAULT_WEIGHTS, ...(cfg.weights ?? {}) };
}

export function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

export function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

export function variance(xs: number[]): number {
  if (xs.length === 0) return 0;
  const m = mean(xs);
  return xs.reduce((s, x) => s + (x - m) * (x - m), 0) / xs.length;
}

export function range(xs: number[]): number {
  if (xs.length === 0) return 0;
  let mn = Infinity;
  let mx = -Infinity;
  for (const x of xs) {
    if (Number.isFinite(x)) {
      if (x < mn) mn = x;
      if (x > mx) mx = x;
    }
  }
  return Number.isFinite(mn) && Number.isFinite(mx) ? mx - mn : 0;
}

export function l2(a: Vec): number {
  return Math.sqrt(a.reduce((s, x) => s + x * x, 0));
}

export function euclidean(a: Vec, b: Vec): number {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return Math.sqrt(s);
}

export function normalizedVectorError(pred: Vec, target: Vec, eps = 1e-9): number {
  const denom = Math.max(l2(target), eps);
  return euclidean(pred, target) / denom;
}

function recordNumber(rec: Record<string, number> | undefined, key: string, fallback = 0): number {
  if (!rec) return fallback;
  const v = rec[key];
  return Number.isFinite(v) ? clamp01(v) : fallback;
}

function recordBool(rec: Record<string, boolean> | undefined, key: string, fallback = false): boolean {
  if (!rec) return fallback;
  const v = rec[key];
  return typeof v === "boolean" ? v : fallback;
}

function recordVec(rec: Record<string, Vec> | undefined, key: string): Vec | undefined {
  if (!rec) return undefined;
  const v = rec[key];
  return Array.isArray(v) && v.every(Number.isFinite) ? v : undefined;
}

function concatRecordSamples(A: AdheralEntity, B: AdheralEntity, field: "distanceSamples" | "relationSamples"): number[] {
  const xs = (A[field]?.[B.id] ?? []).concat(B[field]?.[A.id] ?? []);
  return xs.filter(Number.isFinite);
}

function coObservationMean(A: AdheralEntity, B: AdheralEntity): number | undefined {
  const xs = (A.coObservationSamples?.[B.id] ?? []).concat(B.coObservationSamples?.[A.id] ?? []);
  if (xs.length === 0) return undefined;
  return xs.filter(Boolean).length / xs.length;
}

function makeAxiomScore(score: number, value: number, threshold: number, passed: boolean, note: string): AxiomScore {
  return { score: clamp01(score), value, threshold, passed, note };
}

/** A1 — Estimate P(A∧B). */
export function estimateCoExistence(A: AdheralEntity, B: AdheralEntity): number {
  const obs = coObservationMean(A, B);
  if (obs !== undefined) return clamp01(obs);
  const ab = recordNumber(A.coExistence, B.id, NaN);
  const ba = recordNumber(B.coExistence, A.id, NaN);
  if (Number.isFinite(ab) && Number.isFinite(ba)) return clamp01((ab + ba) / 2);
  if (Number.isFinite(ab)) return clamp01(ab);
  if (Number.isFinite(ba)) return clamp01(ba);
  return 0;
}

/** A2 — Symmetry score of directional relation strengths. */
export function scoreSymmetry(A: AdheralEntity, B: AdheralEntity, t: AdheralThresholds): {
  axiom: AxiomScore;
  rel_AB: number;
  rel_BA: number;
  delta: number;
} {
  const rel_AB = recordNumber(A.relationStrength, B.id, 0);
  const rel_BA = recordNumber(B.relationStrength, A.id, 0);
  const delta = Math.abs(rel_AB - rel_BA);
  const strengthScore = Math.min(rel_AB, rel_BA);
  const deltaScore = clamp01(1 - delta / Math.max(t.symmetryTolerance, 1e-9));
  const score = 0.55 * strengthScore + 0.45 * deltaScore;
  const passed = rel_AB >= t.relationStrength && rel_BA >= t.relationStrength && delta <= t.symmetryTolerance;
  return {
    axiom: makeAxiomScore(
      score,
      delta,
      t.symmetryTolerance,
      passed,
      passed
        ? "A2 passed: relation is directionally strong and symmetric."
        : "A2 failed: relation is too weak or directionally asymmetric."
    ),
    rel_AB,
    rel_BA,
    delta,
  };
}

/** A3 — Bidirectional reconstructability from booleans, vectors, or hooks. */
export function scoreReconstructability(
  A: AdheralEntity,
  B: AdheralEntity,
  t: AdheralThresholds,
  cfg: AdheralConfig = {},
  hooks: ReconstructionHooks = {}
): { axiom: AxiomScore; diagnostics: ReconstructionDiagnostics } {
  const eps = cfg.eps ?? 1e-9;

  const predB = hooks.reconstructBFromA?.(A, B) ?? recordVec(A.reconstructedEmbedding, B.id);
  const predA = hooks.reconstructAFromB?.(B, A) ?? recordVec(B.reconstructedEmbedding, A.id);

  const boolAtoB = recordBool(A.reconstructs, B.id, false);
  const boolBtoA = recordBool(B.reconstructs, A.id, false);

  let scoreAtoB = boolAtoB ? 1 : 0;
  let scoreBtoA = boolBtoA ? 1 : 0;
  let errAtoB: number | undefined;
  let errBtoA: number | undefined;

  if (predB && B.embedding) {
    errAtoB = normalizedVectorError(predB, B.embedding, eps);
    scoreAtoB = clamp01(1 - errAtoB / Math.max(t.reconstructionError, eps));
  }
  if (predA && A.embedding) {
    errBtoA = normalizedVectorError(predA, A.embedding, eps);
    scoreBtoA = clamp01(1 - errBtoA / Math.max(t.reconstructionError, eps));
  }

  const hasEvidenceAtoB = boolAtoB || !!(predB && B.embedding);
  const hasEvidenceBtoA = boolBtoA || !!(predA && A.embedding);

  if (!cfg.requireReconstruction) {
    if (!hasEvidenceAtoB) scoreAtoB = 0.5;
    if (!hasEvidenceBtoA) scoreBtoA = 0.5;
  }

  const phi_AtoB = scoreAtoB >= 0.5 && hasEvidenceAtoB;
  const phi_BtoA = scoreBtoA >= 0.5 && hasEvidenceBtoA;
  const score = (scoreAtoB + scoreBtoA) / 2;
  const passed = phi_AtoB && phi_BtoA && score >= 0.5;

  return {
    axiom: makeAxiomScore(
      score,
      score,
      0.5,
      passed,
      passed
        ? "A3 passed: bidirectional reconstructability is present."
        : "A3 failed: reconstruction evidence is missing or too inaccurate."
    ),
    diagnostics: {
      phi_AtoB,
      phi_BtoA,
      error_AtoB: errAtoB,
      error_BtoA: errBtoA,
      score_AtoB: scoreAtoB,
      score_BtoA: scoreBtoA,
    },
  };
}

/** A4 — Elasticity: relation remains stable under distance variation. */
export function scoreElasticity(A: AdheralEntity, B: AdheralEntity, t: AdheralThresholds): {
  axiom: AxiomScore;
  diagnostics: ElasticityDiagnostics;
} {
  const dSamples = concatRecordSamples(A, B, "distanceSamples");
  const rSamplesRaw = concatRecordSamples(A, B, "relationSamples");

  const rel_AB = recordNumber(A.relationStrength, B.id, 0);
  const rel_BA = recordNumber(B.relationStrength, A.id, 0);
  const fallbackRelation = Math.min(rel_AB, rel_BA);
  const rSamples = rSamplesRaw.length > 0 ? rSamplesRaw.map(clamp01) : [fallbackRelation];

  const distanceSampleCount = dSamples.length;
  const relationSampleCount = rSamples.length;
  const distanceRange = range(dSamples);
  const relationMin = Math.min(...rSamples);
  const relationMean = mean(rSamples);
  const distanceVariance = variance(dSamples);
  const relationVariance = variance(rSamples);

  const sampleScore = clamp01(distanceSampleCount / Math.max(t.elasticitySamples, 1));
  const rangeScore = t.elasticityDistanceRange <= 0 ? 1 : clamp01(distanceRange / t.elasticityDistanceRange);
  const relationFloorScore = clamp01(relationMin / Math.max(t.elasticityRelationFloor, 1e-9));
  const relationStabilityScore = clamp01(1 - relationVariance);

  const score = 0.25 * sampleScore + 0.25 * rangeScore + 0.3 * relationFloorScore + 0.2 * relationStabilityScore;
  const passed =
    distanceSampleCount >= t.elasticitySamples &&
    distanceRange >= t.elasticityDistanceRange &&
    relationMin >= t.elasticityRelationFloor;

  return {
    axiom: makeAxiomScore(
      score,
      relationMin,
      t.elasticityRelationFloor,
      passed,
      passed
        ? "A4 passed: relation survives nontrivial distance variation."
        : "A4 failed: insufficient stress samples, range, or relation floor."
    ),
    diagnostics: {
      distanceSampleCount,
      relationSampleCount,
      distanceRange,
      relationMin,
      relationMean,
      distanceVariance,
      relationVariance,
    },
  };
}

/** A5 — Invariance under τ(·), using symbolic signatures or transformed embeddings. */
export function scoreInvariance(A: AdheralEntity, B: AdheralEntity, t: AdheralThresholds, cfg: AdheralConfig = {}): {
  axiom: AxiomScore;
  drift?: number;
} {
  const require = cfg.requireInvariance ?? true;
  if (!require) {
    return {
      axiom: makeAxiomScore(1, 0, t.invarianceDrift, true, "A5 neutral: invariance not required by config."),
      drift: 0,
    };
  }

  let score = 1;
  let drift: number | undefined = 0;
  let evidence = false;

  const sigEvidenceA = !!A.transformedSignature && !!A.stateSignature;
  const sigEvidenceB = !!B.transformedSignature && !!B.stateSignature;
  if (sigEvidenceA || sigEvidenceB) {
    evidence = true;
    const okA = sigEvidenceA ? A.transformedSignature === A.stateSignature : true;
    const okB = sigEvidenceB ? B.transformedSignature === B.stateSignature : true;
    score = okA && okB ? 1 : 0;
    drift = score === 1 ? 0 : 1;
  }

  if (A.embedding && A.transformedEmbedding && B.embedding && B.transformedEmbedding) {
    evidence = true;
    const da = normalizedVectorError(A.transformedEmbedding, A.embedding);
    const db = normalizedVectorError(B.transformedEmbedding, B.embedding);
    drift = (da + db) / 2;
    score = clamp01(1 - drift / Math.max(t.invarianceDrift, 1e-9));
  }

  if (!evidence) {
    // Do not silently assert invariance; return a cautious partial score.
    score = 0.5;
    drift = undefined;
  }

  const passed = score >= 0.5 && (drift === undefined || drift <= t.invarianceDrift);
  return {
    axiom: makeAxiomScore(
      score,
      drift ?? 0.5,
      t.invarianceDrift,
      passed,
      passed
        ? "A5 passed: relation identity is stable under τ(·), or evidence is neutral."
        : "A5 failed: transformed state breaks relation identity."
    ),
    drift,
  };
}

function weightedTotal(axioms: AdheralResult["axioms"], weights: AdheralWeights): number {
  const totalW = weights.coExistence + weights.symmetry + weights.reconstructability + weights.elasticity + weights.invariance;
  return (
    axioms.coExistence.score * weights.coExistence +
    axioms.symmetry.score * weights.symmetry +
    axioms.reconstructability.score * weights.reconstructability +
    axioms.elasticity.score * weights.elasticity +
    axioms.invariance.score * weights.invariance
  ) / totalW;
}

function relationMode(totalScore: number, allAxiomsPassed: boolean, t: AdheralThresholds, requireAll: boolean): RelationMode {
  if (totalScore >= t.totalScore && (!requireAll || allAxiomsPassed)) return "adheral";
  if (totalScore >= t.partialScore) return "partial";
  return "reject";
}

/**
 * Main runtime evaluator for A ⧉ B.
 */
export function runAdheralV11(
  A: AdheralEntity,
  B: AdheralEntity,
  cfg: AdheralConfig = {},
  hooks: ReconstructionHooks = {}
): AdheralResult {
  const t = cfgThresholds(cfg);
  const weights = cfgWeights(cfg);
  const requireAll = cfg.requireAllAxioms ?? true;
  const trace: AdheralTraceEntry[] = [];

  // A1
  const P_AB = estimateCoExistence(A, B);
  const coExistencePassed = P_AB >= t.coExistence;
  const coExistence = makeAxiomScore(
    P_AB,
    P_AB,
    t.coExistence,
    coExistencePassed,
    coExistencePassed
      ? "A1 passed: P(A∧B) is high enough."
      : "A1 failed: co-existence is below threshold."
  );
  trace.push({ stage: "A1_CoExistence", ok: coExistence.passed, message: coExistence.note, data: { P_AB } });

  // A2
  const sym = scoreSymmetry(A, B, t);
  trace.push({
    stage: "A2_Symmetry",
    ok: sym.axiom.passed,
    message: sym.axiom.note,
    data: { rel_AB: sym.rel_AB, rel_BA: sym.rel_BA, delta: sym.delta },
  });

  // A3
  const rec = scoreReconstructability(A, B, t, cfg, hooks);
  trace.push({
    stage: "A3_Reconstructability",
    ok: rec.axiom.passed,
    message: rec.axiom.note,
    data: { ...rec.diagnostics },
  });

  // A4
  const ela = scoreElasticity(A, B, t);
  trace.push({
    stage: "A4_Elasticity",
    ok: ela.axiom.passed,
    message: ela.axiom.note,
    data: { ...ela.diagnostics },
  });

  // A5
  const inv = scoreInvariance(A, B, t, cfg);
  trace.push({
    stage: "A5_Invariance",
    ok: inv.axiom.passed,
    message: inv.axiom.note,
    data: { drift: inv.drift },
  });

  const axioms = {
    coExistence,
    symmetry: sym.axiom,
    reconstructability: rec.axiom,
    elasticity: ela.axiom,
    invariance: inv.axiom,
  };

  const totalScore = weightedTotal(axioms, weights);
  const allAxiomsPassed = Object.values(axioms).every((x) => x.passed);
  const mode = relationMode(totalScore, allAxiomsPassed, t, requireAll);
  const adheral = mode === "adheral";

  trace.push({
    stage: "Decision",
    ok: adheral,
    message: adheral
      ? "A⧉B confirmed: stable symmetric adhesion holds."
      : mode === "partial"
        ? "A⧉B partial: relation has meaningful coupling but fails at least one strict condition."
        : "A⧉B rejected: coupling evidence is insufficient.",
    data: { totalScore, mode, allAxiomsPassed, requireAll },
  });

  const notes = trace.filter((x) => !x.ok || x.stage === "Decision").map((x) => `${x.stage}: ${x.message}`);

  return {
    pair: { A: A.id, B: B.id },
    adheral,
    mode,
    totalScore,
    axioms,
    diagnostics: {
      P_AB,
      rel_AB: sym.rel_AB,
      rel_BA: sym.rel_BA,
      symmetryDelta: sym.delta,
      reconstruction: rec.diagnostics,
      elasticity: ela.diagnostics,
      invarianceDrift: inv.drift,
    },
    trace,
    notes,
  };
}

/** Filter and rank adheral candidate pairs in a set S. */
export function adheralPairsRanked(
  entities: AdheralEntity[],
  cfg: AdheralConfig = {},
  hooks: ReconstructionHooks = {}
): AdheralResult[] {
  const out: AdheralResult[] = [];
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      out.push(runAdheralV11(entities[i], entities[j], cfg, hooks));
    }
  }
  return out.sort((a, b) => b.totalScore - a.totalScore);
}

/** Export a compact O.i intermediate block suitable for UI or training corpus. */
export function toOiAdheralRecord(result: AdheralResult) {
  return {
    operator: "Adheral Operator",
    symbol: "⧉",
    objective: "BIND → Stable_Symmetric_Adhesion",
    pair: result.pair,
    mode: result.mode,
    adheral: result.adheral,
    totalScore: result.totalScore,
    axiomScores: {
      coExistence: result.axioms.coExistence.score,
      symmetry: result.axioms.symmetry.score,
      reconstructability: result.axioms.reconstructability.score,
      elasticity: result.axioms.elasticity.score,
      invariance: result.axioms.invariance.score,
    },
    decisionRule:
      "A⧉B holds when co-existence, symmetry, bidirectional reconstructability, elasticity, and invariance jointly exceed configured thresholds.",
    notes: result.notes,
  };
}

/** Demo pair that should satisfy Adheral. */
export function demoAdheralV11(): AdheralResult {
  const A: AdheralEntity = {
    id: "A",
    label: "Entity A",
    embedding: [1, 0, 0.2],
    transformedEmbedding: [1.01, 0.01, 0.2],
    coExistence: { B: 0.96 },
    relationStrength: { B: 0.91 },
    reconstructedEmbedding: { B: [0.02, 1.0, 0.18] },
    distanceSamples: { B: [1, 2, 5, 8] },
    relationSamples: { B: [0.91, 0.89, 0.88, 0.9] },
  };

  const B: AdheralEntity = {
    id: "B",
    label: "Entity B",
    embedding: [0, 1, 0.2],
    transformedEmbedding: [0.01, 1.0, 0.21],
    coExistence: { A: 0.95 },
    relationStrength: { A: 0.88 },
    reconstructedEmbedding: { A: [1.0, 0.01, 0.19] },
    distanceSamples: { A: [1, 3, 6, 9] },
    relationSamples: { A: [0.9, 0.88, 0.87, 0.89] },
  };

  return runAdheralV11(A, B);
}

export function runSelfTests(): { passed: boolean; checks: Record<string, boolean>; demo: ReturnType<typeof toOiAdheralRecord> } {
  const demo = demoAdheralV11();

  const C: AdheralEntity = {
    id: "C",
    embedding: [1, 1, 1],
    coExistence: { D: 0.97 },
    relationStrength: { D: 0.9 },
    reconstructs: { D: false },
    distanceSamples: { D: [1, 2, 3] },
    relationSamples: { D: [0.9, 0.9, 0.89] },
    stateSignature: "c",
    transformedSignature: "c",
  };
  const D: AdheralEntity = {
    id: "D",
    embedding: [2, 2, 2],
    coExistence: { C: 0.97 },
    relationStrength: { C: 0.9 },
    reconstructs: { C: false },
    distanceSamples: { C: [1, 2, 3] },
    relationSamples: { C: [0.9, 0.9, 0.89] },
    stateSignature: "d",
    transformedSignature: "d",
  };

  const reconstructionFail = runAdheralV11(C, D);

  const E: AdheralEntity = {
    id: "E",
    embedding: [1, 0],
    transformedEmbedding: [0, 1],
    coExistence: { F: 0.99 },
    relationStrength: { F: 0.9 },
    reconstructs: { F: true },
    distanceSamples: { F: [1, 3, 9] },
    relationSamples: { F: [0.9, 0.88, 0.87] },
  };
  const F: AdheralEntity = {
    id: "F",
    embedding: [0, 1],
    transformedEmbedding: [1, 0],
    coExistence: { E: 0.99 },
    relationStrength: { E: 0.9 },
    reconstructs: { E: true },
    distanceSamples: { E: [1, 4, 10] },
    relationSamples: { E: [0.9, 0.88, 0.87] },
  };
  const invarianceFail = runAdheralV11(E, F);

  const ranked = adheralPairsRanked([
    { id: "X", coExistence: { Y: 1 }, relationStrength: { Y: 1 }, reconstructs: { Y: true }, distanceSamples: { Y: [1, 2, 4] }, relationSamples: { Y: [1, 1, 1] }, stateSignature: "x", transformedSignature: "x" },
    { id: "Y", coExistence: { X: 1 }, relationStrength: { X: 1 }, reconstructs: { X: true }, distanceSamples: { X: [1, 3, 5] }, relationSamples: { X: [1, 1, 1] }, stateSignature: "y", transformedSignature: "y" },
    { id: "Z" },
  ]);

  const checks = {
    demoIsAdheral: demo.adheral,
    reconstructionFailureRejects: reconstructionFail.mode !== "adheral",
    invarianceFailureRejects: invarianceFail.mode !== "adheral",
    rankedFindsXY: ranked[0]?.pair.A === "X" && ranked[0]?.pair.B === "Y" && ranked[0]?.adheral === true,
  };

  return { passed: Object.values(checks).every(Boolean), checks, demo: toOiAdheralRecord(demo) };
}

export default {
  metadata: ADHERAL_V1_1_METADATA,
  runAdheralV11,
  adheralPairsRanked,
  toOiAdheralRecord,
  demoAdheralV11,
  runSelfTests,
};

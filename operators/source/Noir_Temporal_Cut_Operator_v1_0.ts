/**
 * D11 Noir Temporal Cut Operator v1.0
 * ------------------------------------------------------------
 * Operatorology artifact for the Noir Temporal Cut.
 *
 * Name: Noir Temporal Cut
 * Vietnamese name: Toán Tử Tái Khóa Thời Gian / Noir Thời Cắt
 * Symbol: Ω_NTC
 * Core equation:
 *   Ω_NTC(Kₙ, Qₙ, Nₙ, P_jn) → Kₙ₊₁ + Tₙ + Nₙ₊₁
 *
 * Core interpretation:
 *   The operator receives the current reality-lock, a possibility field,
 *   Noir residue, and a sustaining flow. It produces a new reality-lock,
 *   a past trace, and updated residue.
 *
 * Scientific boundary:
 *   This is a conceptual / interpretive operator. It does not deny physical
 *   thermodynamic entropy, conservation laws, relativity, causality, or
 *   experimentally tested time models. It reframes time-like change as
 *   a sequence of reality-lock replacements for AI / XAI reasoning.
 */

export type ConfidenceLevel = "low" | "medium" | "high";
export type TransitionMode =
  | "no_replacement"
  | "weak_candidate"
  | "partial_relock"
  | "full_relock"
  | "unstable_relock";

export interface RealityLock {
  /** Human-readable identifier for the current locked configuration. */
  id: string;
  /** Compact name of the current reality-lock. */
  name: string;
  /** Core structure currently being preserved. */
  core: string;
  /** Boundary conditions that keep the current lock coherent. */
  boundary: string[];
  /** Current active constraints, laws, rules, or commitments. */
  constraints: string[];
  /** Optional stability score in [0, 1]. */
  stability?: number;
  /** Optional controllability score in [0, 1]. */
  controllability?: number;
}

export interface PossibilityCandidate {
  /** Candidate identifier. */
  id: string;
  /** Candidate name. */
  name: string;
  /** What this candidate is trying to become. */
  proposedLock: string;
  /** How strongly the candidate can challenge the current lock, in [0, 1]. */
  pressure: number;
  /** Compatibility with the current core, in [0, 1]. */
  coreCompatibility: number;
  /** Compatibility with current or future boundary conditions, in [0, 1]. */
  boundaryCompatibility: number;
  /** Interpretive notes. */
  notes?: string;
}

export interface NoirResidue {
  /** Residue identifier. */
  id: string;
  /** Residual components that were not fully locked by the current reality. */
  unresolvedComponents: string[];
  /** Residual pressure in [0, 1]. */
  pressure: number;
  /** Whether residue is treated as waste, possibility, trace, or sustaining flow. */
  role: "waste_like" | "possibility" | "trace" | "sustaining_flow" | "mixed";
  /** Optional entropy-like dispersal score in [0, 1]. */
  dispersal?: number;
}

export interface SustainingFlow {
  /** Name of the sustaining flow, e.g. P_jn. */
  symbol: string;
  /** Part that maintains the current lock. */
  P_lock: number;
  /** Part that exits as visible output, action, signal, or product. */
  P_out: number;
  /** Residual part not currently controlled by the main lock. */
  P_res: number;
  /** Optional total input. If absent, computed as P_lock + P_out + P_res. */
  P_in?: number;
}

export interface NoirTemporalCutInput {
  currentLock: RealityLock;
  possibilityField: PossibilityCandidate[];
  noirResidue: NoirResidue;
  sustainingFlow: SustainingFlow;
  /** Minimum score required for a candidate to replace the current lock. */
  relockThreshold?: number;
  /** Optional label for this temporal pulse. */
  pulseId?: string;
}

export interface PastTrace {
  /** Previous lock that lost current authority. */
  previousLockId: string;
  /** What remains of the previous lock after replacement. */
  traceSummary: string;
  /** Residual influence on the new lock, in [0, 1]. */
  residualInfluence: number;
  /** Whether the old lock remains useful as memory, constraint, warning, or material. */
  traceRole: "memory" | "constraint" | "warning" | "material" | "mixed";
}

export interface RelockCandidateScore {
  candidateId: string;
  name: string;
  replacementScore: number;
  pressure: number;
  coreCompatibility: number;
  boundaryCompatibility: number;
  residueCoupling: number;
  decision: "reject" | "hold" | "relock";
}

export interface NoirTemporalCutOutput {
  operatorId: "omega_noir_temporal_cut";
  symbol: "Ω_NTC";
  pulseId: string;
  transitionMode: TransitionMode;
  selectedCandidate?: PossibilityCandidate;
  nextLock: RealityLock;
  pastTrace: PastTrace;
  updatedResidue: NoirResidue;
  entropyReading: {
    /** Entropy is interpreted here as residual dispersal / lost controllability. */
    interpretation: string;
    dispersalScore: number;
    controllabilityLoss: number;
    caution: string;
  };
  candidateScores: RelockCandidateScore[];
  reasoningTrace: string[];
  confidence: ConfidenceLevel;
}

export const NOIR_TEMPORAL_CUT_OPERATOR = {
  id: "omega_noir_temporal_cut",
  name: "Noir Temporal Cut",
  vietnameseName: "Toán Tử Tái Khóa Thời Gian / Noir Thời Cắt",
  symbol: "Ω_NTC",
  version: "1.0.0",
  family: "Operatorology / Prime Elementology / Noir Torsorology",
  equation: "Ω_NTC(Kₙ, Qₙ, Nₙ, P_jn) → Kₙ₊₁ + Tₙ + Nₙ₊₁",
  definition:
    "A conceptual operator that cuts time as a sequence of reality-lock replacements driven by unresolved possibility, Noir residue, and sustaining configuration flow.",
  boundary:
    "Interpretive and computational reasoning artifact; not a replacement for physical thermodynamics, relativity, or empirical time models.",
} as const;

function clamp01(value: number | undefined, fallback = 0): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

function inferConfidence(candidateScores: RelockCandidateScore[], selected?: RelockCandidateScore): ConfidenceLevel {
  if (!selected) return "medium";
  const sorted = [...candidateScores].sort((a, b) => b.replacementScore - a.replacementScore);
  const runnerUp = sorted[1]?.replacementScore ?? 0;
  const margin = selected.replacementScore - runnerUp;
  if (selected.replacementScore >= 0.78 && margin >= 0.15) return "high";
  if (selected.replacementScore >= 0.55) return "medium";
  return "low";
}

/**
 * Applies Ω_NTC to a current lock, possibility field, Noir residue, and sustaining flow.
 *
 * The scoring rule is intentionally simple and transparent:
 *   replacementScore = 0.40 * pressure
 *                    + 0.25 * coreCompatibility
 *                    + 0.20 * boundaryCompatibility
 *                    + 0.15 * residueCoupling
 *
 * Residue coupling increases when Noir residue pressure and candidate pressure align.
 */
export function applyNoirTemporalCut(input: NoirTemporalCutInput): NoirTemporalCutOutput {
  const threshold = clamp01(input.relockThreshold, 0.62);
  const pulseId = input.pulseId ?? `ntc-pulse-${Date.now()}`;
  const residuePressure = clamp01(input.noirResidue.pressure);
  const dispersal = clamp01(input.noirResidue.dispersal, residuePressure);

  const candidateScores: RelockCandidateScore[] = input.possibilityField.map((candidate) => {
    const pressure = clamp01(candidate.pressure);
    const coreCompatibility = clamp01(candidate.coreCompatibility);
    const boundaryCompatibility = clamp01(candidate.boundaryCompatibility);
    const residueCoupling = clamp01((pressure + residuePressure) / 2);
    const replacementScore =
      0.4 * pressure +
      0.25 * coreCompatibility +
      0.2 * boundaryCompatibility +
      0.15 * residueCoupling;

    return {
      candidateId: candidate.id,
      name: candidate.name,
      replacementScore: Number(replacementScore.toFixed(4)),
      pressure,
      coreCompatibility,
      boundaryCompatibility,
      residueCoupling,
      decision:
        replacementScore >= threshold
          ? "relock"
          : replacementScore >= threshold * 0.82
            ? "hold"
            : "reject",
    };
  });

  const selectedScore = [...candidateScores]
    .filter((score) => score.decision === "relock")
    .sort((a, b) => b.replacementScore - a.replacementScore)[0];

  const selectedCandidate = selectedScore
    ? input.possibilityField.find((candidate) => candidate.id === selectedScore.candidateId)
    : undefined;

  const current = input.currentLock;
  const transitionMode: TransitionMode = selectedCandidate
    ? selectedScore!.replacementScore >= threshold + 0.12
      ? "full_relock"
      : "partial_relock"
    : candidateScores.some((score) => score.decision === "hold")
      ? "weak_candidate"
      : "no_replacement";

  const nextLock: RealityLock = selectedCandidate
    ? {
        id: `${current.id}->${selectedCandidate.id}`,
        name: selectedCandidate.proposedLock,
        core: selectedCandidate.coreCompatibility >= 0.5
          ? `Preserved / refactored core from ${current.name}`
          : `New core candidate from ${selectedCandidate.name}`,
        boundary: [
          `Relocked boundary from candidate: ${selectedCandidate.name}`,
          ...current.boundary.slice(0, 2).map((boundary) => `Trace-adapted: ${boundary}`),
        ],
        constraints: current.constraints,
        stability: clamp01((selectedCandidate.coreCompatibility + selectedCandidate.boundaryCompatibility) / 2),
        controllability: clamp01(1 - dispersal * 0.5),
      }
    : {
        ...current,
        id: `${current.id}->held`,
        name: `${current.name} (held lock)`,
        stability: clamp01((current.stability ?? 0.5) - residuePressure * 0.1),
        controllability: clamp01((current.controllability ?? 0.5) - dispersal * 0.1),
      };

  const pastTrace: PastTrace = {
    previousLockId: current.id,
    traceSummary: selectedCandidate
      ? `${current.name} lost current authority and became a trace inside ${nextLock.name}.`
      : `${current.name} remains current, but accumulated pressure has been recorded as temporal trace.`,
    residualInfluence: selectedCandidate ? clamp01(0.35 + residuePressure * 0.4) : clamp01(residuePressure * 0.5),
    traceRole: selectedCandidate ? "mixed" : "warning",
  };

  const updatedResidue: NoirResidue = {
    id: `${input.noirResidue.id}->updated`,
    unresolvedComponents: selectedCandidate
      ? [
          ...input.noirResidue.unresolvedComponents,
          `Unabsorbed remainder after relock by ${selectedCandidate.name}`,
        ]
      : [
          ...input.noirResidue.unresolvedComponents,
          "Unresolved candidate pressure remains below relock threshold",
        ],
    pressure: selectedCandidate
      ? clamp01(residuePressure * 0.55 + (1 - selectedScore!.replacementScore) * 0.25)
      : clamp01(residuePressure + 0.08),
    role: selectedCandidate ? "mixed" : input.noirResidue.role,
    dispersal: selectedCandidate ? clamp01(dispersal * 0.75) : clamp01(dispersal + 0.05),
  };

  const P_in = input.sustainingFlow.P_in ??
    input.sustainingFlow.P_lock + input.sustainingFlow.P_out + input.sustainingFlow.P_res;
  const P_resRatio = P_in > 0 ? clamp01(input.sustainingFlow.P_res / P_in) : 0;
  const controllabilityLoss = clamp01((dispersal + P_resRatio) / 2);

  const reasoningTrace = [
    `Received current lock Kₙ: ${current.name}.`,
    `Scanned Qₙ with ${input.possibilityField.length} candidate(s).`,
    `Measured Noir residue pressure Nₙ ≈ ${residuePressure.toFixed(2)} and dispersal ≈ ${dispersal.toFixed(2)}.`,
    `Read sustaining flow ${input.sustainingFlow.symbol}: P_lock=${input.sustainingFlow.P_lock}, P_out=${input.sustainingFlow.P_out}, P_res=${input.sustainingFlow.P_res}.`,
    selectedCandidate
      ? `Candidate ${selectedCandidate.name} crossed the relock threshold and became Kₙ₊₁.`
      : "No candidate crossed the relock threshold; the current lock remains active.",
    selectedCandidate
      ? `Previous lock ${current.name} was displaced into Tₙ as past trace.`
      : `Temporal pressure was stored as trace without full replacement.`,
    `Updated Noir residue Nₙ₊₁ retains unresolved components for future pulses.`,
  ];

  return {
    operatorId: "omega_noir_temporal_cut",
    symbol: "Ω_NTC",
    pulseId,
    transitionMode,
    selectedCandidate,
    nextLock,
    pastTrace,
    updatedResidue,
    entropyReading: {
      interpretation:
        "Entropy is read as residual dispersal and lost controllability, not as literal cosmic waste.",
      dispersalScore: dispersal,
      controllabilityLoss,
      caution:
        "This interpretation does not deny thermodynamic entropy; it reframes entropy for Prime-TB / Noir-style reasoning.",
    },
    candidateScores,
    reasoningTrace,
    confidence: inferConfidence(candidateScores, selectedScore),
  };
}

export const noirTemporalCutExample: NoirTemporalCutInput = {
  pulseId: "example-idea-relock",
  currentLock: {
    id: "K0",
    name: "Current Research Plan",
    core: "Explain time as a measurable sequence of state changes.",
    boundary: ["classical past-present-future language", "entropy as loss", "linear project timeline"],
    constraints: ["avoid denying established physics", "preserve interpretability", "support AI/XAI reasoning"],
    stability: 0.62,
    controllability: 0.58,
  },
  possibilityField: [
    {
      id: "Q1",
      name: "Noir Temporal Cut",
      proposedLock: "Time as Reality-Lock Replacement",
      pressure: 0.86,
      coreCompatibility: 0.82,
      boundaryCompatibility: 0.74,
      notes: "Reframes future as unresolved candidate and past as displaced lock trace.",
    },
    {
      id: "Q2",
      name: "Linear Time Extension",
      proposedLock: "Extended Linear Timeline",
      pressure: 0.41,
      coreCompatibility: 0.55,
      boundaryCompatibility: 0.63,
    },
  ],
  noirResidue: {
    id: "N0",
    unresolvedComponents: ["future does not exist as fixed object", "entropy resembles residue", "possibility climbs over reality"],
    pressure: 0.78,
    role: "mixed",
    dispersal: 0.66,
  },
  sustainingFlow: {
    symbol: "P_jn",
    P_lock: 0.44,
    P_out: 0.31,
    P_res: 0.25,
  },
  relockThreshold: 0.62,
};

// Example usage:
// const output = applyNoirTemporalCut(noirTemporalCutExample);
// console.log(output);

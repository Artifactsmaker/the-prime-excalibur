/**
 * D12 Core-Keeper Operator v1.0
 * ------------------------------------------------------------
 * Operatorology / Prime Elementology artifact
 *
 * Name: Core-Keeper Operator
 * Vietnamese name: Toan Tu Giu Loi / Toan Tu Tai Cau Hinh Bao Toan Ban Sac
 * Symbol: Omega_CK
 * Role: identity-preserving reconfiguration
 *
 * Conceptual form:
 *   Omega_CK(S_n, C_n, B_n, R_n, G) -> S_{n+1} + Trace + R_cut
 *
 * Meaning:
 *   The operator receives a system that must change, identifies the structural
 *   core that must be preserved, adapts the boundary, cuts obstructive residue,
 *   re-closes the system into a new configuration, and emits an explanation trace.
 *
 * Scientific/interpretive boundary:
 *   This is an operational knowledge artifact for AI/XAI workflows. It is not a
 *   physical law, not a proof of consciousness, and not a claim that identity is
 *   metaphysically fixed. It provides a structured method for preserving the
 *   intended core of a system during transformation.
 */

export type Scalar01 = number;

export type BoundaryAction = "keep" | "adapt" | "replace" | "remove";
export type ResidueAction = "cut" | "isolate" | "reuse" | "monitor";
export type CoreStatus = "preserved" | "weakened" | "lost" | "ambiguous";

export interface CoreElement {
  id: string;
  label: string;
  description: string;
  required: boolean;
  preservationScore: Scalar01;
  evidence?: string[];
}

export interface BoundaryElement {
  id: string;
  label: string;
  description: string;
  currentFunction: string;
  action: BoundaryAction;
  reason: string;
}

export interface ResidueElement {
  id: string;
  label: string;
  description: string;
  obstructionScore: Scalar01;
  reusable: boolean;
  action: ResidueAction;
  reason: string;
}

export interface SystemState {
  id: string;
  label: string;
  description: string;
  core: CoreElement[];
  boundary: BoundaryElement[];
  residue: ResidueElement[];
  context?: Record<string, unknown>;
}

export interface ReconfigurationGoal {
  id: string;
  label: string;
  description: string;
  targetContext: string;
  requiredOutputForm: string;
  preserveStyle?: boolean;
  preserveScientificBoundary?: boolean;
}

export interface CoreKeeperInput {
  currentState: SystemState;
  goal: ReconfigurationGoal;
  thresholds?: {
    minimumCoreFidelity?: Scalar01;
    residueCutThreshold?: Scalar01;
    driftRiskThreshold?: Scalar01;
  };
}

export interface ExplanationTrace {
  preservedCore: string[];
  weakenedCore: string[];
  boundaryKept: string[];
  boundaryAdapted: string[];
  boundaryReplaced: string[];
  residueCut: string[];
  residueIsolated: string[];
  residueReused: string[];
  reclosureRationale: string;
  remainingRisks: string[];
}

export interface CoreKeeperMetrics {
  coreFidelity: Scalar01;
  boundaryAdaptability: Scalar01;
  residueClearance: Scalar01;
  reclosureSuccess: Scalar01;
  driftResistance: Scalar01;
  traceClarity: Scalar01;
  identityPreservation: Scalar01;
  coreKeeperScore: Scalar01;
}

export interface CoreKeeperOutput {
  operatorId: "Omega_CK";
  operatorName: "Core-Keeper Operator";
  nextState: SystemState;
  coreStatus: CoreStatus;
  trace: ExplanationTrace;
  metrics: CoreKeeperMetrics;
  warnings: string[];
}

export const CORE_KEEPER_OPERATOR = {
  id: "Omega_CK",
  name: "Core-Keeper Operator",
  vietnameseName: "Toan Tu Giu Loi",
  strongerVietnameseName: "Toan Tu Tai Cau Hinh Bao Toan Ban Sac",
  symbol: "Omega_CK",
  version: "1.0.0",
  family: "Operatorology / Prime Elementology",
  type: "identity-preserving reconfiguration operator",
  conceptualFormula: "Omega_CK(S_n, C_n, B_n, R_n, G) -> S_{n+1} + Trace + R_cut",
  pipeline: [
    "core_extraction",
    "boundary_test",
    "residue_cut",
    "target_reconfiguration",
    "core_fidelity_check",
    "reclosure",
    "explanation_trace"
  ],
  xaiTraceTemplate: [
    "what_was_preserved",
    "what_was_changed",
    "what_was_cut",
    "what_was_reused",
    "why_reclosure_is_valid",
    "remaining_risks"
  ]
} as const;

function clamp01(value: number): Scalar01 {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function average(values: number[]): Scalar01 {
  if (values.length === 0) return 0;
  return clamp01(values.reduce((sum, value) => sum + clamp01(value), 0) / values.length);
}

function scoreBoundaryAdaptability(boundary: BoundaryElement[]): Scalar01 {
  if (boundary.length === 0) return 1;
  const actionScore: Record<BoundaryAction, number> = {
    keep: 0.85,
    adapt: 1.0,
    replace: 0.75,
    remove: 0.65
  };
  return average(boundary.map((item) => actionScore[item.action]));
}

function scoreResidueClearance(residue: ResidueElement[]): Scalar01 {
  if (residue.length === 0) return 1;
  const handled = residue.filter((item) => item.action === "cut" || item.action === "isolate" || item.action === "reuse");
  const handledWeight = handled.reduce((sum, item) => sum + clamp01(item.obstructionScore), 0);
  const totalWeight = residue.reduce((sum, item) => sum + clamp01(item.obstructionScore), 0);
  return totalWeight === 0 ? 1 : clamp01(handledWeight / totalWeight);
}

function inferCoreStatus(coreFidelity: Scalar01): CoreStatus {
  if (coreFidelity >= 0.8) return "preserved";
  if (coreFidelity >= 0.55) return "weakened";
  if (coreFidelity >= 0.35) return "ambiguous";
  return "lost";
}

export function applyCoreKeeperOperator(input: CoreKeeperInput): CoreKeeperOutput {
  const minimumCoreFidelity = input.thresholds?.minimumCoreFidelity ?? 0.75;
  const residueCutThreshold = input.thresholds?.residueCutThreshold ?? 0.6;
  const driftRiskThreshold = input.thresholds?.driftRiskThreshold ?? 0.35;

  const current = input.currentState;

  const preservedCore = current.core.filter((item) => item.required || item.preservationScore >= minimumCoreFidelity);
  const weakenedCore = current.core.filter((item) => !preservedCore.includes(item));

  const boundaryKept = current.boundary.filter((item) => item.action === "keep");
  const boundaryAdapted = current.boundary.filter((item) => item.action === "adapt");
  const boundaryReplaced = current.boundary.filter((item) => item.action === "replace");
  const boundaryRemoved = current.boundary.filter((item) => item.action === "remove");

  const residueCut = current.residue.filter((item) => item.action === "cut" || item.obstructionScore >= residueCutThreshold);
  const residueIsolated = current.residue.filter((item) => item.action === "isolate" && !residueCut.includes(item));
  const residueReused = current.residue.filter((item) => item.reusable && item.action === "reuse" && !residueCut.includes(item));
  const residueMonitored = current.residue.filter((item) => item.action === "monitor" && !residueCut.includes(item));

  const nextBoundary: BoundaryElement[] = [
    ...boundaryKept,
    ...boundaryAdapted,
    ...boundaryReplaced
  ];

  const nextResidue: ResidueElement[] = [
    ...residueIsolated,
    ...residueReused,
    ...residueMonitored
  ];

  const coreFidelity = average(current.core.map((item) => item.preservationScore));
  const boundaryAdaptability = scoreBoundaryAdaptability(current.boundary);
  const residueClearance = scoreResidueClearance(current.residue);
  const driftResistance = clamp01((coreFidelity + residueClearance) / 2);
  const reclosureSuccess = average([coreFidelity, boundaryAdaptability, residueClearance, driftResistance]);
  const traceClarity = current.core.length + current.boundary.length + current.residue.length > 0 ? 0.9 : 0.4;
  const identityPreservation = average([coreFidelity, driftResistance, reclosureSuccess]);
  const residualNoise = average(current.residue.map((item) => item.action === "monitor" ? item.obstructionScore : 0));
  const coreKeeperScore = clamp01(
    (coreFidelity + reclosureSuccess + driftResistance + traceClarity - residualNoise) / 4
  );

  const warnings: string[] = [];
  if (coreFidelity < minimumCoreFidelity) {
    warnings.push("Core fidelity is below the recommended threshold. Reconfiguration may have weakened the identity of the system.");
  }
  if (1 - driftResistance > driftRiskThreshold) {
    warnings.push("Drift risk is high. The new configuration may deviate from the original goal or identity.");
  }
  if (boundaryRemoved.length > boundaryKept.length + boundaryAdapted.length + boundaryReplaced.length) {
    warnings.push("More boundary elements were removed than preserved or adapted. The output may require a stronger reclosure step.");
  }

  const nextState: SystemState = {
    id: `${current.id}::core-kept`,
    label: `${current.label} -> ${input.goal.requiredOutputForm}`,
    description: `Reclosed state for goal '${input.goal.label}' while preserving the structural core of '${current.label}'.`,
    core: preservedCore,
    boundary: nextBoundary,
    residue: nextResidue,
    context: {
      ...current.context,
      operator: CORE_KEEPER_OPERATOR.id,
      goal: input.goal,
      removedBoundaryIds: boundaryRemoved.map((item) => item.id),
      cutResidueIds: residueCut.map((item) => item.id)
    }
  };

  return {
    operatorId: "Omega_CK",
    operatorName: "Core-Keeper Operator",
    nextState,
    coreStatus: inferCoreStatus(coreFidelity),
    trace: {
      preservedCore: preservedCore.map((item) => item.label),
      weakenedCore: weakenedCore.map((item) => item.label),
      boundaryKept: boundaryKept.map((item) => item.label),
      boundaryAdapted: boundaryAdapted.map((item) => item.label),
      boundaryReplaced: boundaryReplaced.map((item) => item.label),
      residueCut: residueCut.map((item) => item.label),
      residueIsolated: residueIsolated.map((item) => item.label),
      residueReused: residueReused.map((item) => item.label),
      reclosureRationale: "The next state is accepted only if the required core elements remain active, the boundary has been adapted to the target context, and obstructive residue has been cut, isolated, or converted into reusable material.",
      remainingRisks: warnings
    },
    metrics: {
      coreFidelity,
      boundaryAdaptability,
      residueClearance,
      reclosureSuccess,
      driftResistance,
      traceClarity,
      identityPreservation,
      coreKeeperScore
    },
    warnings
  };
}

export const CORE_KEEPER_EXAMPLE_INPUT: CoreKeeperInput = {
  currentState: {
    id: "paper-draft-001",
    label: "Speculative research draft",
    description: "A dense conceptual manuscript that must be converted into a clearer scientific artifact without losing its original contribution.",
    core: [
      {
        id: "core-001",
        label: "Identity-preserving reconfiguration",
        description: "The main contribution is the transformation of a system while preserving its structural core.",
        required: true,
        preservationScore: 0.92,
        evidence: ["Repeated in title", "Used in pipeline", "Defines the operator role"]
      },
      {
        id: "core-002",
        label: "Core-boundary-residue separation",
        description: "The system must be decomposed into core, boundary, and residue before transformation.",
        required: true,
        preservationScore: 0.88
      }
    ],
    boundary: [
      {
        id: "boundary-001",
        label: "Mythic framing",
        description: "The fantasy identity of The Core Keeper.",
        currentFunction: "Creates narrative force and symbolic meaning.",
        action: "adapt",
        reason: "Preserve as metaphor, but translate into operational language for AI/XAI."
      },
      {
        id: "boundary-002",
        label: "Dense prose",
        description: "Long-form poetic explanation.",
        currentFunction: "Carries voice and intensity.",
        action: "replace",
        reason: "Replace with structured operator schema for implementation."
      }
    ],
    residue: [
      {
        id: "residue-001",
        label: "Overclaiming",
        description: "Phrases that imply physical proof or total agency.",
        obstructionScore: 0.83,
        reusable: false,
        action: "cut",
        reason: "It can mislead readers and reduce scientific credibility."
      },
      {
        id: "residue-002",
        label: "Narrative residue",
        description: "Mythic details that are not needed in the operator runtime.",
        obstructionScore: 0.35,
        reusable: true,
        action: "reuse",
        reason: "Can be reused in examples, prompts, or educational framing."
      }
    ]
  },
  goal: {
    id: "goal-001",
    label: "Convert concept into operator artifact",
    description: "Produce a reusable AI/XAI operator while preserving the core idea.",
    targetContext: "Operatorology runtime",
    requiredOutputForm: "TypeScript and JSON operator definition",
    preserveStyle: false,
    preserveScientificBoundary: true
  }
};

export const CORE_KEEPER_EXAMPLE_OUTPUT = applyCoreKeeperOperator(CORE_KEEPER_EXAMPLE_INPUT);

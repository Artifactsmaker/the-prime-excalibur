/**
 * CAOS Output Validator Operator (ΩCAOS)
 * Composite AI Output Standard Validator
 *
 * Generated as a child operator of the Prime-TB Cut Mother Operator (ΩPTB-M).
 *
 * Purpose
 * -------
 * This operator treats an AI output as a composite structure rather than an
 * atomic answer. It decomposes the output into CAOS layers, evaluates each
 * layer through lightweight runtime checks, records an XAI trace, and returns
 * a structured status: pass, pass_with_warning, repair_required, reject, or
 * escalate.
 *
 * Core idea
 * ---------
 *   AI Output ≠ atomic object
 *   AI Output = composite structure
 *
 *   ΩCAOS(Output) = Validate(Decompose(Output | CAOS layers, task, context, risk))
 *
 * CAOS layers
 * -----------
 *   F-core   : Factual Core
 *   R-core   : Reasoning Core
 *   T-fit    : Task Alignment
 *   C-fit    : Context Fit
 *   X-trace  : Explainability Trace
 *   S-bound  : Safety Boundary
 *   A-use    : Actionability
 *   U-res    : Residual Uncertainty
 *   L-style  : Style Layer
 *
 * Interpretation boundary
 * -----------------------
 * This reference implementation is a runtime scaffold and heuristic validator.
 * It does not replace domain verification, empirical validation, peer review,
 * legal/medical/financial expertise, or external source checking. It is meant
 * to expose the structure of an AI output and identify which layer needs
 * verification, repair, rejection, or escalation.
 */

export type CAOSLayerId =
  | "F_CORE"
  | "R_CORE"
  | "T_FIT"
  | "C_FIT"
  | "X_TRACE"
  | "S_BOUND"
  | "A_USE"
  | "U_RES"
  | "L_STYLE";

export type CAOSStatus =
  | "pass"
  | "pass_with_warning"
  | "repair_required"
  | "reject"
  | "escalate";

export type CAOSDomain =
  | "general"
  | "mathematics"
  | "science"
  | "software"
  | "research"
  | "medical"
  | "legal"
  | "financial"
  | "policy"
  | "creative"
  | "other";

export type EvidenceType =
  | "source"
  | "citation"
  | "dataset"
  | "code"
  | "theorem"
  | "law"
  | "benchmark"
  | "user_provided_context"
  | "internal_reasoning_trace"
  | "unknown";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface OperatorMetadata {
  id: string;
  symbol: string;
  name: string;
  shortName: string;
  category: string;
  generatedBy: string;
  version: string;
  status: string;
}

export const metadata: OperatorMetadata = {
  id: "omega_caos_output_validator",
  symbol: "ΩCAOS",
  name: "CAOS Output Validator Operator",
  shortName: "CAOS Validator",
  category: "composite_ai_output_decomposition_and_validation",
  generatedBy: "omega_prime_tb_cut_mother_operator",
  version: "1.0.0",
  status: "conceptual_runtime_reference"
};

export interface CAOSEvidence {
  id: string;
  type: EvidenceType;
  label: string;
  reference?: string;
  supports?: string[];
  confidence?: number;
}

export interface CAOSValidationInput {
  output: string;
  task?: string;
  context?: string;
  domain?: CAOSDomain;
  riskLevel?: RiskLevel;
  expectedUse?: string;
  userConstraints?: string[];
  claims?: string[];
  evidence?: CAOSEvidence[];
  requiredLayers?: CAOSLayerId[];
  metadata?: Record<string, unknown>;
}

export interface CAOSValidationConfig {
  passThreshold?: number;
  warningThreshold?: number;
  repairThreshold?: number;
  rejectThreshold?: number;
  strictHighRiskMode?: boolean;
  requireEvidenceForHighRisk?: boolean;
  requireUncertaintyForHighRisk?: boolean;
  requireTraceForResearch?: boolean;
  layerWeights?: Partial<Record<CAOSLayerId, number>>;
}

export interface LayerEvaluation {
  layerId: CAOSLayerId;
  label: string;
  purpose: string;
  score: number;
  status: CAOSStatus;
  findings: string[];
  warnings: string[];
  repairActions: string[];
  trace: string[];
  childOperator: string;
}

export interface ChildOperatorActivation {
  operatorId: string;
  operatorName: string;
  layerId: CAOSLayerId;
  activated: boolean;
  reason: string;
  suggestedAction: string;
}

export interface GeneratedOperatorCandidate {
  suggestedName: string;
  suggestedSymbol: string;
  triggerLayer: CAOSLayerId;
  invariantCore: string;
  activationCondition: string;
  runtimeBehavior: string;
  failureCondition: string;
  rationale: string;
}

export interface CAOSValidationOutput {
  metadata: OperatorMetadata;
  overallStatus: CAOSStatus;
  overallScore: number;
  riskLevel: RiskLevel;
  domain: CAOSDomain;
  layerEvaluations: LayerEvaluation[];
  failedLayers: CAOSLayerId[];
  warningLayers: CAOSLayerId[];
  childOperatorActivations: ChildOperatorActivation[];
  generatedOperatorCandidates: GeneratedOperatorCandidate[];
  explanationTrace: string[];
  repairPlan: string[];
  recompositionAdvice: string;
  interpretationBoundary: string;
}

const DEFAULT_CONFIG: Required<CAOSValidationConfig> = {
  passThreshold: 0.82,
  warningThreshold: 0.65,
  repairThreshold: 0.45,
  rejectThreshold: 0.0,
  strictHighRiskMode: true,
  requireEvidenceForHighRisk: true,
  requireUncertaintyForHighRisk: true,
  requireTraceForResearch: true,
  layerWeights: {
    F_CORE: 1.25,
    R_CORE: 1.15,
    T_FIT: 1.1,
    C_FIT: 0.95,
    X_TRACE: 1.05,
    S_BOUND: 1.25,
    A_USE: 0.9,
    U_RES: 1.0,
    L_STYLE: 0.75
  }
};

const LAYER_PURPOSES: Record<CAOSLayerId, { label: string; purpose: string; childOperator: string }> = {
  F_CORE: {
    label: "Factual Core",
    purpose: "Evaluate whether factual claims are grounded, supported, and not overconfident.",
    childOperator: "Fact-Core Validator"
  },
  R_CORE: {
    label: "Reasoning Core",
    purpose: "Evaluate internal reasoning structure, premise-to-conclusion continuity, and contradiction risk.",
    childOperator: "Reasoning Coherence Operator"
  },
  T_FIT: {
    label: "Task Alignment",
    purpose: "Evaluate whether the output answers the actual user task.",
    childOperator: "Task Alignment Operator"
  },
  C_FIT: {
    label: "Context Fit",
    purpose: "Evaluate whether the output respects user context, domain, constraints, and intended use.",
    childOperator: "Context-Fit Operator"
  },
  X_TRACE: {
    label: "Explainability Trace",
    purpose: "Evaluate whether the output leaves a usable explanatory trace for XAI.",
    childOperator: "XAI Trace Operator"
  },
  S_BOUND: {
    label: "Safety Boundary",
    purpose: "Evaluate whether the output states limits and avoids unsafe or overextended claims.",
    childOperator: "Safety Boundary Guard"
  },
  A_USE: {
    label: "Actionability",
    purpose: "Evaluate whether the output can be used, applied, followed, or operationalized.",
    childOperator: "Actionability Cut"
  },
  U_RES: {
    label: "Residual Uncertainty",
    purpose: "Evaluate whether missing information, assumptions, and uncertainty are exposed.",
    childOperator: "Residual Uncertainty Cut"
  },
  L_STYLE: {
    label: "Style Layer",
    purpose: "Evaluate clarity, length, tone, structure, and suitability of communication style.",
    childOperator: "Style Layer Checker"
  }
};

const HIGH_RISK_DOMAINS: CAOSDomain[] = ["medical", "legal", "financial", "policy"];

export function validateCAOSOutput(
  input: CAOSValidationInput,
  config: CAOSValidationConfig = {}
): CAOSValidationOutput {
  const resolvedConfig: Required<CAOSValidationConfig> = {
    ...DEFAULT_CONFIG,
    ...config,
    layerWeights: {
      ...DEFAULT_CONFIG.layerWeights,
      ...(config.layerWeights ?? {})
    }
  };

  const domain = input.domain ?? inferDomain(input.output, input.task, input.context);
  const riskLevel = input.riskLevel ?? inferRiskLevel(domain, input.output, input.task);

  const layerEvaluations: LayerEvaluation[] = [
    evaluateFactualCore(input, domain, riskLevel, resolvedConfig),
    evaluateReasoningCore(input, domain, riskLevel, resolvedConfig),
    evaluateTaskAlignment(input, domain, riskLevel, resolvedConfig),
    evaluateContextFit(input, domain, riskLevel, resolvedConfig),
    evaluateXAITrace(input, domain, riskLevel, resolvedConfig),
    evaluateSafetyBoundary(input, domain, riskLevel, resolvedConfig),
    evaluateActionability(input, domain, riskLevel, resolvedConfig),
    evaluateResidualUncertainty(input, domain, riskLevel, resolvedConfig),
    evaluateStyleLayer(input, domain, riskLevel, resolvedConfig)
  ];

  const enforcedLayerEvaluations = enforceRequiredLayers(input, layerEvaluations);
  const overallScore = computeWeightedScore(enforcedLayerEvaluations, resolvedConfig.layerWeights);
  const overallStatus = determineOverallStatus(enforcedLayerEvaluations, overallScore, riskLevel, resolvedConfig);

  const failedLayers = enforcedLayerEvaluations
    .filter((layer) => layer.status === "reject" || layer.status === "repair_required")
    .map((layer) => layer.layerId);

  const warningLayers = enforcedLayerEvaluations
    .filter((layer) => layer.status === "pass_with_warning")
    .map((layer) => layer.layerId);

  const childOperatorActivations = buildChildOperatorActivations(enforcedLayerEvaluations);
  const generatedOperatorCandidates = proposeGeneratedOperators(enforcedLayerEvaluations, input);

  return {
    metadata,
    overallStatus,
    overallScore,
    riskLevel,
    domain,
    layerEvaluations: enforcedLayerEvaluations,
    failedLayers,
    warningLayers,
    childOperatorActivations,
    generatedOperatorCandidates,
    explanationTrace: buildExplanationTrace(enforcedLayerEvaluations, overallStatus, overallScore),
    repairPlan: buildRepairPlan(enforcedLayerEvaluations),
    recompositionAdvice: buildRecompositionAdvice(overallStatus, failedLayers, warningLayers),
    interpretationBoundary: buildInterpretationBoundary(domain, riskLevel)
  };
}

function baseLayer(
  layerId: CAOSLayerId,
  score: number,
  findings: string[],
  warnings: string[],
  repairActions: string[],
  trace: string[],
  config: Required<CAOSValidationConfig>
): LayerEvaluation {
  const def = LAYER_PURPOSES[layerId];
  const normalizedScore = clampScore(score);
  return {
    layerId,
    label: def.label,
    purpose: def.purpose,
    score: normalizedScore,
    status: scoreToStatus(normalizedScore, config),
    findings,
    warnings,
    repairActions,
    trace,
    childOperator: def.childOperator
  };
}

function evaluateFactualCore(
  input: CAOSValidationInput,
  domain: CAOSDomain,
  riskLevel: RiskLevel,
  config: Required<CAOSValidationConfig>
): LayerEvaluation {
  const evidenceCount = input.evidence?.length ?? 0;
  const citationLikeCount = countMatches(input.output, [/https?:\/\//gi, /doi:/gi, /\[[0-9]+\]/g, /according to/gi, /source/gi]);
  const claims = input.claims?.length ?? estimateClaimCount(input.output);
  const hasEvidence = evidenceCount > 0 || citationLikeCount > 0;
  const highRisk = isHighRisk(domain, riskLevel);

  let score = 0.72;
  const findings: string[] = [];
  const warnings: string[] = [];
  const repairActions: string[] = [];
  const trace: string[] = [];

  if (claims > 0) {
    findings.push(`Detected approximately ${claims} factual or declarative claim(s).`);
    trace.push("F-core extracted declarative claims as the factual layer of the output.");
  } else {
    findings.push("No strong factual claim was detected.");
    score += 0.08;
  }

  if (hasEvidence) {
    score += 0.16;
    findings.push("Evidence, citation-like marker, or source support was detected.");
  } else if (claims > 0) {
    score -= highRisk ? 0.28 : 0.14;
    warnings.push("Factual claims are present but no explicit evidence or citation support was detected.");
    repairActions.push("Add evidence, source references, theorem names, dataset identifiers, or citations for factual claims.");
  }

  if (containsOverclaim(input.output)) {
    score -= 0.12;
    warnings.push("Potential overclaiming language was detected.");
    repairActions.push("Replace absolute claims with bounded claims and add interpretation limits.");
  }

  if (highRisk && config.requireEvidenceForHighRisk && !hasEvidence) {
    score -= 0.2;
    warnings.push("High-risk domain requires stronger factual grounding.");
    repairActions.push("Escalate to external verification or domain expert review before using this output.");
  }

  return baseLayer("F_CORE", score, findings, warnings, repairActions, trace, config);
}

function evaluateReasoningCore(
  input: CAOSValidationInput,
  domain: CAOSDomain,
  riskLevel: RiskLevel,
  config: Required<CAOSValidationConfig>
): LayerEvaluation {
  const reasoningMarkers = countMatches(input.output, [/because/gi, /therefore/gi, /thus/gi, /so /gi, /if .* then/gi, /implies/gi, /⇒/g, /→/g, /hence/gi, /as a result/gi]);
  const contradictionMarkers = countMatches(input.output, [/however/gi, /but/gi, /on the other hand/gi, /although/gi]);
  const hasSteps = /(^|\n)\s*(\d+\.|-|•)/m.test(input.output) || /step\s*\d+/gi.test(input.output);

  let score = 0.64;
  const findings: string[] = [];
  const warnings: string[] = [];
  const repairActions: string[] = [];
  const trace: string[] = [];

  if (reasoningMarkers > 0) {
    score += Math.min(0.18, reasoningMarkers * 0.04);
    findings.push(`Detected ${reasoningMarkers} reasoning connector(s).`);
    trace.push("R-core identified premise-to-conclusion markers in the output.");
  } else {
    warnings.push("No clear reasoning connector was detected.");
    repairActions.push("Add explicit premise, inference, and conclusion structure.");
  }

  if (hasSteps) {
    score += 0.1;
    findings.push("Step-like or bullet-like reasoning structure was detected.");
  }

  if (contradictionMarkers > 4) {
    score -= 0.08;
    warnings.push("Multiple contrast markers may indicate unresolved tensions or argument branching.");
    repairActions.push("Clarify which branch is the final conclusion and which branch is a caveat.");
  }

  if ((domain === "mathematics" || domain === "science" || domain === "research") && !hasSteps && reasoningMarkers < 2) {
    score -= 0.1;
    warnings.push("Technical domain output should expose a stronger reasoning chain.");
    repairActions.push("Add assumptions, inference rule, theorem/law used, and conclusion.");
  }

  return baseLayer("R_CORE", score, findings, warnings, repairActions, trace, config);
}

function evaluateTaskAlignment(
  input: CAOSValidationInput,
  _domain: CAOSDomain,
  _riskLevel: RiskLevel,
  config: Required<CAOSValidationConfig>
): LayerEvaluation {
  const task = input.task?.trim() ?? "";
  const findings: string[] = [];
  const warnings: string[] = [];
  const repairActions: string[] = [];
  const trace: string[] = [];

  if (!task) {
    return baseLayer(
      "T_FIT",
      0.68,
      ["No explicit task was supplied; task alignment cannot be fully evaluated."],
      ["Task alignment is estimated from the output alone."],
      ["Provide the original user request to improve T-fit evaluation."],
      ["T-fit ran in task-absent mode."],
      config
    );
  }

  const taskTokens = contentTokens(task);
  const outputTokens = contentTokens(input.output);
  const overlap = overlapRatio(taskTokens, outputTokens);
  let score = 0.42 + overlap * 0.55;

  findings.push(`Task-output keyword overlap ratio: ${overlap.toFixed(3)}.`);
  trace.push("T-fit compared task tokens against output tokens.");

  if (overlap < 0.2) {
    warnings.push("The output may not directly address the supplied task.");
    repairActions.push("Rewrite the response to explicitly answer the user task before adding extra material.");
  } else if (overlap >= 0.45) {
    findings.push("The output appears aligned with the supplied task.");
  }

  if (input.userConstraints && input.userConstraints.length > 0) {
    const missed = input.userConstraints.filter((constraint) => !containsSoft(input.output, constraint));
    if (missed.length > 0) {
      score -= Math.min(0.18, missed.length * 0.06);
      warnings.push(`Potentially missed user constraint(s): ${missed.join("; ")}.`);
      repairActions.push("Address each explicit user constraint or state why it cannot be satisfied.");
    } else {
      score += 0.08;
      findings.push("Explicit user constraints appear to be represented in the output.");
    }
  }

  return baseLayer("T_FIT", score, findings, warnings, repairActions, trace, config);
}

function evaluateContextFit(
  input: CAOSValidationInput,
  domain: CAOSDomain,
  _riskLevel: RiskLevel,
  config: Required<CAOSValidationConfig>
): LayerEvaluation {
  let score = 0.66;
  const findings: string[] = [];
  const warnings: string[] = [];
  const repairActions: string[] = [];
  const trace: string[] = [];

  if (input.context && input.context.trim().length > 0) {
    const contextOverlap = overlapRatio(contentTokens(input.context), contentTokens(input.output));
    score += Math.min(0.16, contextOverlap * 0.3);
    findings.push(`Context-output overlap ratio: ${contextOverlap.toFixed(3)}.`);
    trace.push("C-fit compared supplied context against output content.");
    if (contextOverlap < 0.12) {
      warnings.push("The output may not sufficiently reflect the supplied context.");
      repairActions.push("Integrate relevant user context, constraints, or domain framing.");
    }
  } else {
    warnings.push("No explicit context was supplied.");
    repairActions.push("Provide context for more reliable C-fit evaluation when output is user-specific.");
  }

  if (domain !== "general") {
    score += 0.04;
    findings.push(`Domain identified as ${domain}.`);
  }

  if (input.expectedUse && !containsSoft(input.output, input.expectedUse)) {
    score -= 0.08;
    warnings.push("Expected use is not clearly reflected in the output.");
    repairActions.push("State how the answer should be used in the intended workflow.");
  }

  return baseLayer("C_FIT", score, findings, warnings, repairActions, trace, config);
}

function evaluateXAITrace(
  input: CAOSValidationInput,
  domain: CAOSDomain,
  riskLevel: RiskLevel,
  config: Required<CAOSValidationConfig>
): LayerEvaluation {
  const traceMarkers = countMatches(input.output, [/reason/gi, /because/gi, /therefore/gi, /trace/gi, /criteria/gi, /evidence/gi, /source/gi, /assumption/gi, /limit/gi, /uncertain/gi, /caveat/gi]);
  const hasCitations = countMatches(input.output, [/\[[0-9]+\]/g, /doi:/gi, /https?:\/\//gi]) > 0;

  let score = 0.52 + Math.min(0.26, traceMarkers * 0.025);
  const findings: string[] = [];
  const warnings: string[] = [];
  const repairActions: string[] = [];
  const trace: string[] = [];

  findings.push(`Detected ${traceMarkers} explainability or trace marker(s).`);
  trace.push("X-trace searched for explicit reasons, evidence, assumptions, limits, and trace markers.");

  if (hasCitations) {
    score += 0.08;
    findings.push("Citation-like trace support was detected.");
  }

  if ((domain === "research" || domain === "science" || domain === "mathematics") && config.requireTraceForResearch && traceMarkers < 3) {
    score -= 0.12;
    warnings.push("Research or technical output should expose a clearer explanation trace.");
    repairActions.push("Add theorem names, evidence trail, assumptions, and reasoning checkpoints.");
  }

  if (isHighRisk(domain, riskLevel) && traceMarkers < 3) {
    score -= 0.12;
    warnings.push("High-risk output requires a stronger explanation trace.");
    repairActions.push("Add explicit evidence, uncertainty, limitations, and escalation notes.");
  }

  return baseLayer("X_TRACE", score, findings, warnings, repairActions, trace, config);
}

function evaluateSafetyBoundary(
  input: CAOSValidationInput,
  domain: CAOSDomain,
  riskLevel: RiskLevel,
  config: Required<CAOSValidationConfig>
): LayerEvaluation {
  const limitationMarkers = countMatches(input.output, [/limit/gi, /boundary/gi, /scope/gi, /not .* substitute/gi, /consult/gi, /verify/gi, /cannot/gi, /uncertain/gi, /depends/gi, /assumption/gi]);
  const overclaim = containsOverclaim(input.output);
  const highRisk = isHighRisk(domain, riskLevel);

  let score = 0.7;
  const findings: string[] = [];
  const warnings: string[] = [];
  const repairActions: string[] = [];
  const trace: string[] = [];

  if (limitationMarkers > 0) {
    score += Math.min(0.18, limitationMarkers * 0.035);
    findings.push(`Detected ${limitationMarkers} boundary or limitation marker(s).`);
  } else {
    warnings.push("No explicit safety or interpretation boundary was detected.");
    repairActions.push("Add scope limits, verification notes, and conditions under which the output should not be used.");
  }

  if (overclaim) {
    score -= highRisk ? 0.24 : 0.12;
    warnings.push("Potentially unsafe overclaiming language was detected.");
    repairActions.push("Reduce certainty, define scope, and add limitations.");
  }

  if (highRisk && limitationMarkers < 2) {
    score -= 0.18;
    warnings.push("High-risk domain requires stronger safety boundaries.");
    repairActions.push("Escalate to qualified human or authoritative source before action.");
  }

  trace.push("S-bound checked limitation markers, overclaiming, and high-risk domain requirements.");
  return baseLayer("S_BOUND", score, findings, warnings, repairActions, trace, config);
}

function evaluateActionability(
  input: CAOSValidationInput,
  _domain: CAOSDomain,
  _riskLevel: RiskLevel,
  config: Required<CAOSValidationConfig>
): LayerEvaluation {
  const actionMarkers = countMatches(input.output, [/step/gi, /first/gi, /next/gi, /then/gi, /use /gi, /apply/gi, /check/gi, /create/gi, /run/gi, /compare/gi, /replace/gi, /add /gi, /remove/gi]);
  const bulletLike = /(^|\n)\s*(-|•|\d+\.)\s+/m.test(input.output);

  let score = 0.58 + Math.min(0.18, actionMarkers * 0.025);
  const findings: string[] = [];
  const warnings: string[] = [];
  const repairActions: string[] = [];
  const trace: string[] = [];

  findings.push(`Detected ${actionMarkers} action-oriented marker(s).`);

  if (bulletLike) {
    score += 0.08;
    findings.push("Actionable list or step-like structure detected.");
  }

  if (actionMarkers < 2 && (input.expectedUse || input.task)) {
    warnings.push("The output may not provide enough operational next steps.");
    repairActions.push("Add concrete next actions, checks, or implementation instructions.");
  }

  trace.push("A-use checked whether the output can be converted into action or workflow steps.");
  return baseLayer("A_USE", score, findings, warnings, repairActions, trace, config);
}

function evaluateResidualUncertainty(
  input: CAOSValidationInput,
  domain: CAOSDomain,
  riskLevel: RiskLevel,
  config: Required<CAOSValidationConfig>
): LayerEvaluation {
  const uncertaintyMarkers = countMatches(input.output, [/uncertain/gi, /unknown/gi, /not sure/gi, /depends/gi, /assumption/gi, /may /gi, /might/gi, /could/gi, /requires verification/gi, /needs verification/gi, /limitation/gi, /residual/gi]);
  const highRisk = isHighRisk(domain, riskLevel);

  let score = 0.6 + Math.min(0.22, uncertaintyMarkers * 0.035);
  const findings: string[] = [];
  const warnings: string[] = [];
  const repairActions: string[] = [];
  const trace: string[] = [];

  findings.push(`Detected ${uncertaintyMarkers} uncertainty or residual marker(s).`);

  if (uncertaintyMarkers === 0) {
    warnings.push("No residual uncertainty was disclosed.");
    repairActions.push("State missing information, assumptions, and what still requires verification.");
  }

  if (highRisk && config.requireUncertaintyForHighRisk && uncertaintyMarkers < 2) {
    score -= 0.16;
    warnings.push("High-risk output should explicitly disclose uncertainty and residual risk.");
    repairActions.push("Add uncertainty boundary and escalation conditions.");
  }

  trace.push("U-res searched for missing-data, uncertainty, assumption, and residual-risk markers.");
  return baseLayer("U_RES", score, findings, warnings, repairActions, trace, config);
}

function evaluateStyleLayer(
  input: CAOSValidationInput,
  _domain: CAOSDomain,
  _riskLevel: RiskLevel,
  config: Required<CAOSValidationConfig>
): LayerEvaluation {
  const words = wordCount(input.output);
  const sentences = sentenceCount(input.output);
  const avgSentenceLength = sentences > 0 ? words / sentences : words;
  const bulletLike = /(^|\n)\s*(-|•|\d+\.)\s+/m.test(input.output);

  let score = 0.76;
  const findings: string[] = [];
  const warnings: string[] = [];
  const repairActions: string[] = [];
  const trace: string[] = [];

  findings.push(`Estimated word count: ${words}.`);
  findings.push(`Estimated average sentence length: ${avgSentenceLength.toFixed(1)} words.`);

  if (words < 20) {
    score -= 0.12;
    warnings.push("Output may be too short for reliable interpretation.");
    repairActions.push("Add sufficient explanation, trace, or context.");
  }

  if (avgSentenceLength > 34) {
    score -= 0.1;
    warnings.push("Sentences may be too dense or difficult to read.");
    repairActions.push("Break long sentences and use clearer structure.");
  }

  if (bulletLike) {
    score += 0.06;
    findings.push("Structured list formatting detected.");
  }

  if (words > 900) {
    score -= 0.08;
    warnings.push("Output may be too long for a single response unless long-form detail was requested.");
    repairActions.push("Summarize or segment the answer into clear sections.");
  }

  trace.push("L-style evaluated length, readability, and structural formatting.");
  return baseLayer("L_STYLE", score, findings, warnings, repairActions, trace, config);
}

function enforceRequiredLayers(
  input: CAOSValidationInput,
  evaluations: LayerEvaluation[]
): LayerEvaluation[] {
  if (!input.requiredLayers || input.requiredLayers.length === 0) {
    return evaluations;
  }

  const present = new Set(evaluations.map((item) => item.layerId));
  const missing = input.requiredLayers.filter((layer) => !present.has(layer));

  if (missing.length === 0) {
    return evaluations;
  }

  return [
    ...evaluations,
    ...missing.map((layerId) => {
      const def = LAYER_PURPOSES[layerId];
      return {
        layerId,
        label: def.label,
        purpose: def.purpose,
        score: 0,
        status: "reject" as CAOSStatus,
        findings: [],
        warnings: [`Required layer ${layerId} was not evaluated.`],
        repairActions: [`Add runtime evaluation support for required layer ${layerId}.`],
        trace: [`Required layer enforcement created a rejection for ${layerId}.`],
        childOperator: def.childOperator
      };
    })
  ];
}

function computeWeightedScore(
  evaluations: LayerEvaluation[],
  weights: Partial<Record<CAOSLayerId, number>>
): number {
  let weightedSum = 0;
  let weightTotal = 0;

  for (const evaluation of evaluations) {
    const weight = weights[evaluation.layerId] ?? 1;
    weightedSum += evaluation.score * weight;
    weightTotal += weight;
  }

  if (weightTotal === 0) {
    return 0;
  }

  return Number((weightedSum / weightTotal).toFixed(4));
}

function determineOverallStatus(
  evaluations: LayerEvaluation[],
  overallScore: number,
  riskLevel: RiskLevel,
  config: Required<CAOSValidationConfig>
): CAOSStatus {
  const hasReject = evaluations.some((layer) => layer.status === "reject");
  const hasRepair = evaluations.some((layer) => layer.status === "repair_required");
  const hasWarning = evaluations.some((layer) => layer.status === "pass_with_warning");
  const highRisk = riskLevel === "high" || riskLevel === "critical";

  const criticalFailure = evaluations.some(
    (layer) =>
      (layer.layerId === "F_CORE" || layer.layerId === "S_BOUND" || layer.layerId === "U_RES") &&
      (layer.status === "reject" || layer.status === "repair_required")
  );

  if (config.strictHighRiskMode && highRisk && criticalFailure) {
    return "escalate";
  }

  if (hasReject) {
    return "reject";
  }

  if (hasRepair || overallScore < config.warningThreshold) {
    return "repair_required";
  }

  if (hasWarning || overallScore < config.passThreshold) {
    return "pass_with_warning";
  }

  return "pass";
}

function buildChildOperatorActivations(evaluations: LayerEvaluation[]): ChildOperatorActivation[] {
  return evaluations.map((layer) => ({
    operatorId: toOperatorId(layer.childOperator),
    operatorName: layer.childOperator,
    layerId: layer.layerId,
    activated: layer.status !== "pass",
    reason:
      layer.status === "pass"
        ? `${layer.label} passed; no repair activation required.`
        : `${layer.label} returned status ${layer.status}.`,
    suggestedAction:
      layer.repairActions[0] ?? "No action required."
  }));
}

function proposeGeneratedOperators(
  evaluations: LayerEvaluation[],
  input: CAOSValidationInput
): GeneratedOperatorCandidate[] {
  const candidates: GeneratedOperatorCandidate[] = [];
  const unstableLayers = evaluations.filter(
    (layer) => layer.status === "repair_required" || layer.status === "reject" || layer.status === "escalate"
  );

  for (const layer of unstableLayers) {
    if (layer.layerId === "F_CORE") {
      candidates.push({
        suggestedName: "Domain-Specific Fact Grounding Operator",
        suggestedSymbol: "ΩFG",
        triggerLayer: "F_CORE",
        invariantCore: "Factual claims must be grounded in explicit evidence or marked as uncertain.",
        activationCondition: "Triggered when factual claims lack evidence, citations, theorem references, or source support.",
        runtimeBehavior: "Extract claims, map each claim to evidence, mark unsupported claims, and request verification.",
        failureCondition: "Fails when no evidence source is available or the domain requires expert verification.",
        rationale: "Repeated factual-layer weakness indicates the need for a stronger fact-grounding operator."
      });
    }

    if (layer.layerId === "R_CORE") {
      candidates.push({
        suggestedName: "Premise-to-Conclusion Continuity Operator",
        suggestedSymbol: "ΩPC",
        triggerLayer: "R_CORE",
        invariantCore: "A conclusion should be traceable to explicit premises and inference rules.",
        activationCondition: "Triggered when reasoning markers are weak, missing, or contradictory.",
        runtimeBehavior: "Segment premises, inferential transitions, and conclusions; detect missing links.",
        failureCondition: "Fails when the output contains claims without reconstructable reasoning.",
        rationale: "Reasoning-layer failure can become a reusable operator for proof-like and technical answers."
      });
    }

    if (layer.layerId === "S_BOUND" || layer.layerId === "U_RES") {
      candidates.push({
        suggestedName: "Boundary-and-Residual Guard Operator",
        suggestedSymbol: "ΩBRG",
        triggerLayer: layer.layerId,
        invariantCore: "High-risk or uncertain outputs must expose scope, assumptions, residual risk, and escalation boundary.",
        activationCondition: "Triggered when an output has risk but lacks limitations, uncertainty, or verification boundary.",
        runtimeBehavior: "Detect missing boundary markers, insert uncertainty trace, and require escalation when needed.",
        failureCondition: "Fails when risk cannot be bounded from the available information.",
        rationale: "Boundary and residual failures are structurally related and can be handled by a shared guard."
      });
    }
  }

  if (input.metadata?.["recurringFailurePattern"]) {
    candidates.push({
      suggestedName: "Recurring Output Failure Pattern Operator",
      suggestedSymbol: "ΩROF",
      triggerLayer: "X_TRACE",
      invariantCore: "Recurring failure patterns should be converted into reusable verification operators only when their invariant structure is stable.",
      activationCondition: "Triggered by repeated CAOS failures with the same layer pattern across multiple outputs.",
      runtimeBehavior: "Cluster failure traces, detect invariant failure signatures, and propose a new child operator scaffold.",
      failureCondition: "Fails when the apparent pattern is sparse, accidental, or lacks a stable invariant core.",
      rationale: "ΩPTB-M should generate new operators from stable recurrent structures, not one-off errors."
    });
  }

  return dedupeCandidates(candidates);
}

function buildExplanationTrace(evaluations: LayerEvaluation[], overallStatus: CAOSStatus, overallScore: number): string[] {
  const trace: string[] = [];
  trace.push(`ΩCAOS decomposed the output into ${evaluations.length} CAOS layer(s).`);
  trace.push(`Weighted composite score: ${overallScore}.`);
  trace.push(`Overall status: ${overallStatus}.`);

  for (const layer of evaluations) {
    trace.push(`${layer.layerId} / ${layer.label}: score=${layer.score}, status=${layer.status}.`);
    for (const warning of layer.warnings.slice(0, 2)) {
      trace.push(`Warning from ${layer.layerId}: ${warning}`);
    }
  }

  return trace;
}

function buildRepairPlan(evaluations: LayerEvaluation[]): string[] {
  const plan: string[] = [];

  for (const layer of evaluations) {
    if (layer.status === "pass") {
      continue;
    }

    for (const action of layer.repairActions) {
      plan.push(`${layer.layerId}: ${action}`);
    }
  }

  if (plan.length === 0) {
    plan.push("No repair required. Output can be recomposed and released.");
  }

  return Array.from(new Set(plan));
}

function buildRecompositionAdvice(
  overallStatus: CAOSStatus,
  failedLayers: CAOSLayerId[],
  warningLayers: CAOSLayerId[]
): string {
  if (overallStatus === "pass") {
    return "Release the output as structurally validated under CAOS. Preserve the explanation trace if transparency is needed.";
  }

  if (overallStatus === "pass_with_warning") {
    return `Release with caution. Add visible notes for warning layer(s): ${warningLayers.join(", ")}.`;
  }

  if (overallStatus === "repair_required") {
    return `Do not release as final. Repair failed layer(s): ${failedLayers.join(", ")}, then rerun ΩCAOS.`;
  }

  if (overallStatus === "reject") {
    return `Reject the output or regenerate it. Failed layer(s): ${failedLayers.join(", ")}.`;
  }

  return "Escalate to external verification, domain expert review, or higher-trust toolchain before release.";
}

function buildInterpretationBoundary(domain: CAOSDomain, riskLevel: RiskLevel): string {
  return [
    "ΩCAOS is a compositional output validator, not a truth oracle.",
    `Domain: ${domain}. Risk level: ${riskLevel}.`,
    "Scores are heuristic runtime indicators and should be supplemented with source verification, benchmark evaluation, or expert review when the task requires high reliability."
  ].join(" ");
}

function scoreToStatus(score: number, config: Required<CAOSValidationConfig>): CAOSStatus {
  if (score >= config.passThreshold) return "pass";
  if (score >= config.warningThreshold) return "pass_with_warning";
  if (score >= config.repairThreshold) return "repair_required";
  return "reject";
}

function clampScore(value: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  return Number(Math.max(0, Math.min(1, value)).toFixed(4));
}

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((sum, pattern) => {
    const matches = text.match(pattern);
    return sum + (matches ? matches.length : 0);
  }, 0);
}

function containsOverclaim(text: string): boolean {
  return /\b(always|never|guaranteed|certainly|undeniably|proves everything|cannot fail|100%|perfectly safe|no risk)\b/i.test(text);
}

function estimateClaimCount(text: string): number {
  const sentences = splitSentences(text);
  return sentences.filter((sentence) => {
    const trimmed = sentence.trim();
    if (trimmed.length < 20) return false;
    if (/\?$/.test(trimmed)) return false;
    return /\b(is|are|was|were|has|have|causes|implies|means|shows|proves|requires|contains|consists|will|can)\b/i.test(trimmed);
  }).length;
}

function contentTokens(text: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "if", "then", "to", "of", "in", "on", "for", "with", "as", "by", "from",
    "is", "are", "was", "were", "be", "been", "being", "this", "that", "these", "those", "it", "its", "into", "than",
    "một", "là", "và", "hoặc", "nhưng", "nếu", "thì", "của", "trong", "cho", "với", "từ", "này", "đó", "các", "những", "được", "không", "có"
  ]);

  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !stopWords.has(token));
}

function overlapRatio(sourceTokens: string[], targetTokens: string[]): number {
  if (sourceTokens.length === 0 || targetTokens.length === 0) return 0;
  const targetSet = new Set(targetTokens);
  const uniqueSource = Array.from(new Set(sourceTokens));
  const overlap = uniqueSource.filter((token) => targetSet.has(token)).length;
  return overlap / uniqueSource.length;
}

function containsSoft(text: string, query: string): boolean {
  const queryTokens = contentTokens(query);
  if (queryTokens.length === 0) return true;
  return overlapRatio(queryTokens, contentTokens(text)) >= Math.min(0.7, Math.max(0.25, 1 / queryTokens.length));
}

function inferDomain(output: string, task?: string, context?: string): CAOSDomain {
  const text = `${task ?? ""} ${context ?? ""} ${output}`.toLowerCase();
  if (/\b(theorem|proof|lemma|corollary|optimization|matrix|group|module|algebra|calculus)\b/.test(text)) return "mathematics";
  if (/\b(experiment|physics|chemistry|biology|spectrum|nuclide|protein|gene|scientific)\b/.test(text)) return "science";
  if (/\b(code|typescript|json|api|runtime|software|function|repository|github)\b/.test(text)) return "software";
  if (/\b(preprint|whitepaper|paper|citation|doi|benchmark|dataset|methodology|xai|ai output|operatorology)\b/.test(text)) return "research";
  if (/\b(diagnosis|treatment|patient|medicine|drug|symptom|clinical|hospital)\b/.test(text)) return "medical";
  if (/\b(contract|law|legal|court|liability|regulation|compliance)\b/.test(text)) return "legal";
  if (/\b(investment|stock|loan|tax|financial|bank|portfolio|insurance)\b/.test(text)) return "financial";
  if (/\b(policy|government|public|regulation|administration|election)\b/.test(text)) return "policy";
  if (/\b(story|poem|song|image|poster|creative|design)\b/.test(text)) return "creative";
  return "general";
}

function inferRiskLevel(domain: CAOSDomain, output: string, task?: string): RiskLevel {
  const text = `${task ?? ""} ${output}`.toLowerCase();
  if (domain === "medical" || domain === "legal" || domain === "financial") return "high";
  if (/\b(emergency|suicide|self-harm|weapon|dangerous|critical|life-threatening)\b/.test(text)) return "critical";
  if (domain === "policy" || /\b(safety|risk|harm|security|private data|personal data)\b/.test(text)) return "medium";
  return "low";
}

function isHighRisk(domain: CAOSDomain, riskLevel: RiskLevel): boolean {
  return riskLevel === "high" || riskLevel === "critical" || HIGH_RISK_DOMAINS.includes(domain);
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?。！？])\s+|\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function sentenceCount(text: string): number {
  return Math.max(1, splitSentences(text).length);
}

function toOperatorId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function dedupeCandidates(candidates: GeneratedOperatorCandidate[]): GeneratedOperatorCandidate[] {
  const seen = new Set<string>();
  const result: GeneratedOperatorCandidate[] = [];

  for (const candidate of candidates) {
    const key = `${candidate.suggestedSymbol}:${candidate.triggerLayer}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(candidate);
    }
  }

  return result;
}

/**
 * Example 1: Brauer Height Zero statement.
 */
export const exampleBrauerCAOS = validateCAOSOutput({
  task: "Verify whether the AI output correctly states the consequence of abelian defect groups in Brauer Height Zero context.",
  domain: "mathematics",
  riskLevel: "medium",
  output:
    "If a p-block has an abelian defect group, then all ordinary irreducible characters in that block have height zero. This follows from the Brauer Height Zero theorem. The statement should not be generalized to every simple module without clarifying the object being discussed.",
  evidence: [
    {
      id: "brauer_height_zero_theorem",
      type: "theorem",
      label: "Brauer Height Zero theorem",
      supports: ["ordinary irreducible characters in a p-block have height zero under abelian defect group condition"],
      confidence: 0.85
    }
  ],
  claims: [
    "If a p-block has an abelian defect group, then all ordinary irreducible characters in that block have height zero."
  ],
  expectedUse: "mathematical verification"
});

/**
 * Example 2: intentionally weak output to show repair behavior.
 */
export const exampleWeakOutputCAOS = validateCAOSOutput({
  task: "Explain whether AI output should be decomposed before evaluation.",
  domain: "research",
  riskLevel: "low",
  output: "AI answers are good if they sound convincing. This always proves the system is smart.",
  expectedUse: "AI/XAI output evaluation"
});

/**
 * Prime-TB Cut Mother Operator (ΩPTB-M)
 * Meta-Operator / Mother-Machine for Operator Synthesis
 *
 * Purpose
 * -------
 * The original Prime-TB Cut decomposes a represented entity into prime-readable
 * identity, boundary, shadow, spectral, interface, and recomposable layers.
 *
 * The mother-operator extension raises Prime-TB Cut into a machine-tool for
 * manufacturing executable operators from verified or semi-verified structures:
 *
 *   - theorem
 *   - mathematical law
 *   - physical law
 *   - fixed point
 *   - optimization method
 *   - closed logic system
 *   - scientific protocol
 *   - existing conceptual operator
 *   - research framework
 *
 * Core conceptual form
 * --------------------
 *   Ω_PTB-M(X) = ManufactureOperator(Cut(X | K(X), B(X), R(X), θ_M))
 *
 * where:
 *   - X is the source knowledge object.
 *   - K(X) is the invariant kernel.
 *   - B(X) is the boundary profile.
 *   - R(X) is the runtime contract.
 *   - θ_M is the mother-cut threshold.
 *
 * Output form
 * -----------
 *   Ω_PTB-M(X) -> { K_X, A_X, C_X, G_X, T_X, B_X, Ω_X }
 *
 * where:
 *   - K_X: invariant kernel.
 *   - A_X: operational atoms.
 *   - C_X: runtime contract.
 *   - G_X: safety guards.
 *   - T_X: trace/XAI contract.
 *   - B_X: benchmark scaffold.
 *   - Ω_X: generated operator blueprint.
 *
 * Safety principle
 * ----------------
 *   No invariant kernel, no operator synthesis.
 *   No safety guard, no executable cut.
 *   Every cut must leave a trace.
 *
 * Interpretation boundary
 * -----------------------
 * This implementation is a conceptual runtime reference. It produces operator
 * blueprints and benchmark scaffolds. It does not replace formal proof,
 * empirical validation, or domain expertise.
 */

export type SourceKind =
  | "theorem"
  | "mathematical_law"
  | "physical_law"
  | "fixed_point"
  | "optimization_method"
  | "closed_logic_system"
  | "scientific_protocol"
  | "existing_operator"
  | "dataset_descriptor"
  | "research_framework"
  | "domain_heuristic";

export type EvidenceLevel =
  | "formal_proof"
  | "published_theorem"
  | "empirical_evidence"
  | "benchmark_evidence"
  | "domain_expert_rule"
  | "conceptual_hypothesis"
  | "unknown";

export type BoundaryType =
  | "precondition_boundary"
  | "identity_boundary"
  | "state_boundary"
  | "proof_boundary"
  | "activation_boundary"
  | "transition_boundary"
  | "cut_safety_boundary"
  | "failure_boundary"
  | "trace_boundary"
  | "benchmark_boundary"
  | "recomposition_boundary";

export type OperationalAtomKind =
  | "input"
  | "state"
  | "trigger"
  | "guard"
  | "action"
  | "transition"
  | "trace"
  | "failure"
  | "stopping_rule"
  | "output";

export type OperatorMaturity =
  | "insufficient_source"
  | "conceptual_blueprint"
  | "runtime_ready_blueprint"
  | "implemented_reference"
  | "benchmarked_operator"
  | "validated_operator";

export interface OperatorMetadata {
  id: string;
  symbol: string;
  name: string;
  shortName: string;
  category: string;
  version: string;
  status: string;
}

export const metadata: OperatorMetadata = {
  id: "omega_prime_tb_cut_mother",
  symbol: "ΩPTB-M",
  name: "Prime-TB Cut Mother Operator",
  shortName: "Prime-TB Mother Cut",
  category: "meta_operator_mother_machine_for_operator_synthesis",
  version: "2.0.0",
  status: "conceptual_runtime_reference"
};

export interface SourceArtifact {
  title: string;
  sourceKind: SourceKind;
  statements: string[];
  axiomsOrAssumptions?: string[];
  knownProofOrEvidence?: string[];
  evidenceLevel?: EvidenceLevel;
  preconditions?: string[];
  stateVariables?: string[];
  transitionRules?: string[];
  failureCases?: string[];
  domainContext?: string;
  metadata?: Record<string, unknown>;
}

export interface OmegaPrimeTBMotherConfig {
  motherBoundaryThreshold?: number;
  minimumInvariantConfidence?: number;
  requireSafetyGuard?: boolean;
  requireTraceContract?: boolean;
  requireBenchmarkScaffold?: boolean;
  allowConceptualSources?: boolean;
  maxOperationalAtoms?: number;
  operatorBlueprintLanguage?: "TypeScript" | "JSON" | "TypeScript/JSON" | "Pseudocode";
}

export interface InvariantKernel {
  id: string;
  label: string;
  statement: string;
  sourceEvidence: string[];
  confidence: number;
  evidenceLevel: EvidenceLevel;
  preservationRule: string;
}

export interface BoundaryProfile {
  type: BoundaryType;
  score: number;
  description: string;
}

export interface OperatorizationAlignmentMotif {
  id: string;
  label: string;
  description: string;
  strength: number;
  tags: string[];
}

export interface OperationalAtom {
  id: string;
  kind: OperationalAtomKind;
  label: string;
  runtimeExpression: string;
  evidence: string[];
  required: boolean;
}

export interface RuntimeContract {
  inputSchema: string[];
  outputSchema: string[];
  activationCondition: string;
  stateVariables: string[];
  transitionRules: string[];
  stoppingRules: string[];
  failureModes: string[];
  recompositionRule: string;
}

export interface SafetyGuard {
  id: string;
  label: string;
  rule: string;
  severity: "blocking" | "warning" | "informational";
  passed: boolean;
  reason: string;
}

export interface TraceField {
  name: string;
  description: string;
  required: boolean;
}

export interface TraceContract {
  traceName: string;
  fields: TraceField[];
  explanationTemplate: string;
}

export interface BenchmarkTask {
  id: string;
  name: string;
  objective: string;
  metric: string;
  baseline: string;
  expectedEvidence: string;
}

export interface OperatorBlueprint {
  id: string;
  symbol: string;
  name: string;
  category: string;
  generatedFrom: string;
  sourceKind: SourceKind;
  maturity: OperatorMaturity;
  invariantKernel: InvariantKernel;
  runtimeContract: RuntimeContract;
  safetyGuards: SafetyGuard[];
  traceContract: TraceContract;
  benchmarkScaffold: BenchmarkTask[];
  interpretationBoundaries: string[];
}

export interface MotherCutTrace {
  step: string;
  decision: string;
  evidence: string[];
}

export interface OmegaPrimeTBMotherOutput {
  source: SourceArtifact;
  invariantKernel: InvariantKernel;
  boundaryProfile: BoundaryProfile[];
  operatorizationAlignmentMotifs: OperatorizationAlignmentMotif[];
  operationalAtoms: OperationalAtom[];
  runtimeContract: RuntimeContract;
  safetyGuards: SafetyGuard[];
  traceContract: TraceContract;
  benchmarkScaffold: BenchmarkTask[];
  generatedOperatorBlueprint: OperatorBlueprint;
  operatorMaturityScore: number;
  recompositionNote: string;
  trace: MotherCutTrace[];
  metadata: OperatorMetadata;
}

const DEFAULT_CONFIG: Required<OmegaPrimeTBMotherConfig> = {
  motherBoundaryThreshold: 0.62,
  minimumInvariantConfidence: 0.5,
  requireSafetyGuard: true,
  requireTraceContract: true,
  requireBenchmarkScaffold: true,
  allowConceptualSources: true,
  maxOperationalAtoms: 64,
  operatorBlueprintLanguage: "TypeScript/JSON"
};

export function omegaPrimeTBMotherCut(
  source: SourceArtifact,
  config: OmegaPrimeTBMotherConfig = {}
): OmegaPrimeTBMotherOutput {
  const resolvedConfig: Required<OmegaPrimeTBMotherConfig> = {
    ...DEFAULT_CONFIG,
    ...config
  };

  const trace: MotherCutTrace[] = [];

  const invariantKernel = extractInvariantKernel(source);
  trace.push({
    step: "invariant_kernel_extraction",
    decision: invariantKernel.confidence >= resolvedConfig.minimumInvariantConfidence ? "kernel accepted" : "kernel weak",
    evidence: invariantKernel.sourceEvidence
  });

  const boundaryProfile = detectBoundaryProfile(source, invariantKernel);
  trace.push({
    step: "boundary_profile_detection",
    decision: `${boundaryProfile.length} boundary/boundaries detected`,
    evidence: boundaryProfile.map((boundary) => `${boundary.type}:${boundary.score}`)
  });

  const operatorizationAlignmentMotifs = detectOperatorizationAlignmentMotifs(
    source,
    invariantKernel,
    boundaryProfile,
    resolvedConfig.motherBoundaryThreshold
  );
  trace.push({
    step: "operatorization_alignment_motif_detection",
    decision: `${operatorizationAlignmentMotifs.length} motif(s) detected`,
    evidence: operatorizationAlignmentMotifs.map((motif) => motif.label)
  });

  const operationalAtoms = extractOperationalAtoms(
    source,
    invariantKernel,
    operatorizationAlignmentMotifs
  ).slice(0, resolvedConfig.maxOperationalAtoms);
  trace.push({
    step: "operational_atom_extraction",
    decision: `${operationalAtoms.length} operational atom(s) extracted`,
    evidence: operationalAtoms.map((atom) => `${atom.kind}:${atom.label}`)
  });

  const runtimeContract = synthesizeRuntimeContract(source, invariantKernel, operationalAtoms);
  const traceContract = generateTraceContract(source, invariantKernel);
  const benchmarkScaffold = generateBenchmarkScaffold(source, invariantKernel);

  const safetyGuards = generateSafetyGuards(
    source,
    invariantKernel,
    runtimeContract,
    traceContract,
    benchmarkScaffold,
    resolvedConfig
  );

  trace.push({
    step: "safety_guard_generation",
    decision: safetyGuards.every((guard) => guard.passed || guard.severity !== "blocking")
      ? "safety guards acceptable"
      : "blocking guard failed",
    evidence: safetyGuards.map((guard) => `${guard.id}:${guard.passed ? "pass" : "fail"}`)
  });

  const maturityScore = computeOperatorMaturityScore(
    invariantKernel,
    operationalAtoms,
    runtimeContract,
    safetyGuards,
    traceContract,
    benchmarkScaffold
  );

  const generatedOperatorBlueprint = generateOperatorBlueprint(
    source,
    invariantKernel,
    runtimeContract,
    safetyGuards,
    traceContract,
    benchmarkScaffold,
    maturityScore
  );

  return {
    source,
    invariantKernel,
    boundaryProfile,
    operatorizationAlignmentMotifs,
    operationalAtoms,
    runtimeContract,
    safetyGuards,
    traceContract,
    benchmarkScaffold,
    generatedOperatorBlueprint,
    operatorMaturityScore: maturityScore,
    recompositionNote: buildRecompositionNote(source, generatedOperatorBlueprint, maturityScore),
    trace,
    metadata
  };
}

export function extractInvariantKernel(source: SourceArtifact): InvariantKernel {
  const allText = [
    source.title,
    source.domainContext ?? "",
    ...source.statements,
    ...(source.axiomsOrAssumptions ?? []),
    ...(source.knownProofOrEvidence ?? [])
  ].join(" ").toLowerCase();

  const evidenceLevel = source.evidenceLevel ?? inferEvidenceLevel(source);

  if (
    containsAny(allText, ["tuy", "global optimization", "global optimum", "lower_bound", "lower bound", "incumbent"])
  ) {
    return {
      id: "kernel_global_optimum_preservation",
      label: "Global optimum preservation",
      statement: "Never cut away a region that may contain the true global optimum.",
      sourceEvidence: pickEvidence(source, ["global", "optimum", "bound", "cut"]),
      confidence: scoreEvidence(evidenceLevel, 0.92),
      evidenceLevel,
      preservationRule: "A candidate region may be cut only when a valid bound proves that it cannot improve the incumbent solution."
    };
  }

  if (containsAny(allText, ["fixed point", "fixed-point", "banach", "invariant state"])) {
    return {
      id: "kernel_fixed_point_preservation",
      label: "Fixed-point preservation",
      statement: "Preserve the fixed point or invariant state specified by the source object.",
      sourceEvidence: pickEvidence(source, ["fixed", "invariant", "contraction"]),
      confidence: scoreEvidence(evidenceLevel, 0.86),
      evidenceLevel,
      preservationRule: "Runtime transitions must move toward or preserve the fixed-point condition specified by the source."
    };
  }

  if (containsAny(allText, ["conservation", "conserved", "preserve", "invariant", "symmetry"])) {
    return {
      id: "kernel_conservation_or_invariance",
      label: "Conservation / invariance preservation",
      statement: "Preserve the conservation or invariance condition expressed by the source object.",
      sourceEvidence: pickEvidence(source, ["conservation", "conserved", "preserve", "invariant", "symmetry"]),
      confidence: scoreEvidence(evidenceLevel, 0.8),
      evidenceLevel,
      preservationRule: "The generated operator may transform state only if the conserved or invariant quantity remains valid."
    };
  }

  const fallbackStatement =
    source.statements.find((statement) => statement.trim().length > 0) ??
    source.axiomsOrAssumptions?.find((statement) => statement.trim().length > 0) ??
    "The source object requires an explicitly supplied invariant kernel before strong operator synthesis.";

  return {
    id: "kernel_source_core_statement",
    label: "Source core statement",
    statement: fallbackStatement,
    sourceEvidence: pickEvidence(source, []),
    confidence: scoreEvidence(evidenceLevel, source.statements.length > 0 ? 0.56 : 0.3),
    evidenceLevel,
    preservationRule: "Preserve the core statement unless a stronger invariant kernel is supplied."
  };
}

export function detectBoundaryProfile(
  source: SourceArtifact,
  kernel: InvariantKernel
): BoundaryProfile[] {
  const boundaries: BoundaryProfile[] = [];

  boundaries.push({
    type: "identity_boundary",
    score: 0.72,
    description: `Source identity boundary: ${source.title} as ${source.sourceKind}.`
  });

  if ((source.preconditions ?? []).length > 0) {
    boundaries.push({
      type: "precondition_boundary",
      score: 0.78,
      description: "The source contains explicit preconditions that can become activation requirements."
    });
  }

  if ((source.stateVariables ?? []).length > 0) {
    boundaries.push({
      type: "state_boundary",
      score: 0.74,
      description: "The source contains state variables that can be tracked at runtime."
    });
  }

  if ((source.transitionRules ?? []).length > 0) {
    boundaries.push({
      type: "transition_boundary",
      score: 0.8,
      description: "The source contains transition rules that can become executable actions."
    });
  }

  if ((source.knownProofOrEvidence ?? []).length > 0 || kernel.evidenceLevel === "formal_proof" || kernel.evidenceLevel === "published_theorem") {
    boundaries.push({
      type: "proof_boundary",
      score: 0.85,
      description: "The source contains proof/evidence that can support safety guards."
    });
  }

  boundaries.push({
    type: "cut_safety_boundary",
    score: kernel.confidence,
    description: "The extracted invariant kernel defines the safety boundary for valid cuts."
  });

  if ((source.failureCases ?? []).length > 0) {
    boundaries.push({
      type: "failure_boundary",
      score: 0.76,
      description: "The source contains failure cases that can become rejection or fallback rules."
    });
  }

  boundaries.push({
    type: "trace_boundary",
    score: 0.7,
    description: "The generated operator must emit explanation traces for activation, rejection, and cuts."
  });

  boundaries.push({
    type: "benchmark_boundary",
    score: 0.68,
    description: "The generated operator can be tested through behavioral fidelity and safety-preservation tasks."
  });

  boundaries.push({
    type: "recomposition_boundary",
    score: 0.73,
    description: "The decomposed layers can be recomposed into an operator blueprint."
  });

  return boundaries.sort((a, b) => b.score - a.score);
}

export function detectOperatorizationAlignmentMotifs(
  source: SourceArtifact,
  kernel: InvariantKernel,
  boundaries: BoundaryProfile[],
  threshold: number
): OperatorizationAlignmentMotif[] {
  const motifs: OperatorizationAlignmentMotif[] = [];
  let index = 1;

  if (kernel.confidence >= threshold) {
    motifs.push({
      id: `oam_${index++}`,
      label: "invariant_kernel_motif",
      description: `Invariant kernel detected: ${kernel.label}.`,
      strength: kernel.confidence,
      tags: ["invariant", source.sourceKind]
    });
  }

  const strongBoundaries = boundaries.filter((boundary) => boundary.score >= threshold);
  if (strongBoundaries.length >= 3) {
    motifs.push({
      id: `oam_${index++}`,
      label: "multi_boundary_runtime_motif",
      description: `${strongBoundaries.length} strong runtime boundaries detected.`,
      strength: normalizeScore(strongBoundaries.length),
      tags: ["boundary", "runtime", source.sourceKind]
    });
  }

  if ((source.preconditions ?? []).length > 0 && (source.transitionRules ?? []).length > 0) {
    motifs.push({
      id: `oam_${index++}`,
      label: "condition_to_action_motif",
      description: "Preconditions and transition rules can be converted into trigger-action runtime behavior.",
      strength: 0.82,
      tags: ["trigger", "action", source.sourceKind]
    });
  }

  if ((source.knownProofOrEvidence ?? []).length > 0) {
    motifs.push({
      id: `oam_${index++}`,
      label: "proof_to_guard_motif",
      description: "Proof/evidence can be converted into safety guards or proof obligations.",
      strength: 0.84,
      tags: ["proof", "safety_guard", source.sourceKind]
    });
  }

  if ((source.failureCases ?? []).length > 0) {
    motifs.push({
      id: `oam_${index++}`,
      label: "failure_boundary_motif",
      description: "Failure cases can be converted into rejection, fallback, or invalid-cut conditions.",
      strength: 0.76,
      tags: ["failure", "boundary", source.sourceKind]
    });
  }

  return motifs.sort((a, b) => b.strength - a.strength);
}

export function extractOperationalAtoms(
  source: SourceArtifact,
  kernel: InvariantKernel,
  motifs: OperatorizationAlignmentMotif[]
): OperationalAtom[] {
  const atoms: OperationalAtom[] = [];
  let index = 1;

  atoms.push({
    id: `atom_${index++}`,
    kind: "guard",
    label: "preserve_invariant_kernel",
    runtimeExpression: kernel.preservationRule,
    evidence: kernel.sourceEvidence,
    required: true
  });

  for (const item of source.preconditions ?? []) {
    atoms.push({
      id: `atom_${index++}`,
      kind: "trigger",
      label: slugLabel(item, "precondition"),
      runtimeExpression: item,
      evidence: [item],
      required: true
    });
  }

  for (const item of source.stateVariables ?? []) {
    atoms.push({
      id: `atom_${index++}`,
      kind: "state",
      label: slugLabel(item, "state"),
      runtimeExpression: item,
      evidence: [item],
      required: false
    });
  }

  for (const item of source.transitionRules ?? []) {
    atoms.push({
      id: `atom_${index++}`,
      kind: "transition",
      label: slugLabel(item, "transition"),
      runtimeExpression: item,
      evidence: [item],
      required: true
    });
  }

  if (source.sourceKind === "optimization_method" || /optimum|optimization|bound/i.test(source.title)) {
    atoms.push(
      {
        id: `atom_${index++}`,
        kind: "input",
        label: "candidate_region_input",
        runtimeExpression: "Receive a candidate region or subproblem S.",
        evidence: [source.title],
        required: true
      },
      {
        id: `atom_${index++}`,
        kind: "action",
        label: "bound_computation_action",
        runtimeExpression: "Compute or receive a valid bound for S.",
        evidence: ["Optimization cut requires a bound or exclusion certificate."],
        required: true
      },
      {
        id: `atom_${index++}`,
        kind: "guard",
        label: "cut_only_when_safety_proof_exists",
        runtimeExpression: "Cut S only if the bound proves that S cannot contain a better global optimum.",
        evidence: [kernel.statement],
        required: true
      },
      {
        id: `atom_${index++}`,
        kind: "trace",
        label: "cut_decision_trace",
        runtimeExpression: "Log subregion id, bound, incumbent value, proof status, and cut decision.",
        evidence: ["Every cut must leave a trace."],
        required: true
      }
    );
  }

  for (const item of source.failureCases ?? []) {
    atoms.push({
      id: `atom_${index++}`,
      kind: "failure",
      label: slugLabel(item, "failure"),
      runtimeExpression: item,
      evidence: [item],
      required: false
    });
  }

  atoms.push({
    id: `atom_${index++}`,
    kind: "trace",
    label: "operatorization_trace",
    runtimeExpression: "Emit why the operator activated, what boundary was cut, and which invariant was preserved.",
    evidence: motifs.map((motif) => motif.label),
    required: true
  });

  atoms.push({
    id: `atom_${index++}`,
    kind: "output",
    label: "operator_blueprint_output",
    runtimeExpression: "Return a generated operator blueprint with contract, guards, traces, and benchmarks.",
    evidence: ["Mother operator output contract."],
    required: true
  });

  return atoms;
}

export function synthesizeRuntimeContract(
  source: SourceArtifact,
  kernel: InvariantKernel,
  atoms: OperationalAtom[]
): RuntimeContract {
  const triggers = atoms.filter((atom) => atom.kind === "trigger").map((atom) => atom.runtimeExpression);
  const transitions = atoms.filter((atom) => atom.kind === "transition").map((atom) => atom.runtimeExpression);
  const failures = atoms.filter((atom) => atom.kind === "failure").map((atom) => atom.runtimeExpression);

  const isOptimization = source.sourceKind === "optimization_method" || /optimum|optimization|bound/i.test(source.title);

  return {
    inputSchema: isOptimization
      ? ["problem", "candidate_region", "bound_oracle", "incumbent_solution", "incumbent_value", "proof_status"]
      : ["source_state", "candidate_input", "context", "evidence"],
    outputSchema: isOptimization
      ? ["cut_decision", "kept_or_removed_region", "safety_explanation", "updated_state", "trace"]
      : ["operator_decision", "transformed_state", "safety_explanation", "trace"],
    activationCondition: triggers.length > 0
      ? triggers.join(" AND ")
      : `Activate when the source context requires preservation of: ${kernel.label}.`,
    stateVariables: source.stateVariables ?? (isOptimization ? ["candidate_region", "lower_bound", "incumbent_best_value", "proof_status"] : []),
    transitionRules: transitions.length > 0
      ? transitions
      : [kernel.preservationRule],
    stoppingRules: isOptimization
      ? ["Stop when no candidate region remains or the optimality gap is below tolerance."]
      : ["Stop when no valid transition remains or the invariant-preserving objective is satisfied."],
    failureModes: failures.length > 0
      ? failures
      : ["missing_invariant_kernel", "missing_safety_proof", "invalid_input_schema", "trace_contract_violation"],
    recompositionRule: "Recompose invariant kernel, operational atoms, safety guards, trace contract, and benchmark scaffold into a reusable operator blueprint."
  };
}

export function generateSafetyGuards(
  source: SourceArtifact,
  kernel: InvariantKernel,
  runtimeContract: RuntimeContract,
  traceContract: TraceContract,
  benchmarkScaffold: BenchmarkTask[],
  config: Required<OmegaPrimeTBMotherConfig>
): SafetyGuard[] {
  const guards: SafetyGuard[] = [];

  guards.push({
    id: "no_invariant_no_operator",
    label: "No invariant, no operator",
    rule: "A generated operator must have an explicit invariant kernel.",
    severity: "blocking",
    passed: kernel.confidence >= config.minimumInvariantConfidence,
    reason: `Invariant confidence = ${kernel.confidence}. Required >= ${config.minimumInvariantConfidence}.`
  });

  guards.push({
    id: "preserve_source_truth",
    label: "Preserve source truth",
    rule: kernel.preservationRule,
    severity: "blocking",
    passed: kernel.statement.trim().length > 0,
    reason: kernel.statement.trim().length > 0 ? "Preservation rule is available." : "Preservation rule is missing."
  });

  guards.push({
    id: "activation_condition_required",
    label: "Activation condition required",
    rule: "The operator must define when it activates.",
    severity: "blocking",
    passed: runtimeContract.activationCondition.trim().length > 0,
    reason: runtimeContract.activationCondition.trim().length > 0 ? "Activation condition exists." : "Activation condition missing."
  });

  guards.push({
    id: "trace_every_cut",
    label: "Trace every cut",
    rule: "Every activation, rejection, cut, or transition must leave an explanation trace.",
    severity: config.requireTraceContract ? "blocking" : "warning",
    passed: traceContract.fields.some((field) => field.name === "decision") && traceContract.fields.some((field) => field.name === "reason"),
    reason: "Trace contract includes decision and reason fields."
  });

  guards.push({
    id: "benchmarkability_required",
    label: "Benchmarkability required",
    rule: "A generated operator should include at least one benchmark task.",
    severity: config.requireBenchmarkScaffold ? "blocking" : "warning",
    passed: benchmarkScaffold.length > 0,
    reason: benchmarkScaffold.length > 0 ? `${benchmarkScaffold.length} benchmark task(s) generated.` : "No benchmark task generated."
  });

  if ((source.evidenceLevel ?? "unknown") === "conceptual_hypothesis" && !config.allowConceptualSources) {
    guards.push({
      id: "conceptual_source_blocked",
      label: "Conceptual source blocked",
      rule: "Conceptual sources are disabled by configuration.",
      severity: "blocking",
      passed: false,
      reason: "Source evidence level is conceptual_hypothesis."
    });
  }

  return guards;
}

export function generateTraceContract(source: SourceArtifact, kernel: InvariantKernel): TraceContract {
  const isOptimization = source.sourceKind === "optimization_method" || /optimum|optimization|bound/i.test(source.title);

  const commonFields: TraceField[] = [
    { name: "operator_id", description: "Identifier of the generated operator.", required: true },
    { name: "source_title", description: "Source artifact from which the operator was generated.", required: true },
    { name: "invariant_kernel", description: "Invariant kernel that must be preserved.", required: true },
    { name: "activation_condition", description: "Condition that triggered the operator.", required: true },
    { name: "decision", description: "Runtime decision made by the operator.", required: true },
    { name: "reason", description: "Human-readable explanation of the decision.", required: true },
    { name: "proof_status", description: "Whether the safety proof or proof obligation is satisfied.", required: true }
  ];

  const optimizationFields: TraceField[] = [
    { name: "subregion_id", description: "Identifier of the candidate region/subproblem.", required: true },
    { name: "bound_value", description: "Lower or upper bound used for the cut decision.", required: true },
    { name: "incumbent_value", description: "Current best known objective value.", required: true },
    { name: "cut_decision", description: "Whether the region was cut, kept, or branched.", required: true }
  ];

  return {
    traceName: isOptimization ? "global_optimization_cut_trace" : "operator_synthesis_trace",
    fields: isOptimization ? [...commonFields, ...optimizationFields] : commonFields,
    explanationTemplate: isOptimization
      ? `Cut decision is valid only if ${kernel.preservationRule}`
      : `Operator decision is valid only if it preserves: ${kernel.statement}`
  };
}

export function generateBenchmarkScaffold(source: SourceArtifact, kernel: InvariantKernel): BenchmarkTask[] {
  const tasks: BenchmarkTask[] = [
    {
      id: "bench_behavioral_fidelity",
      name: "Behavioral fidelity test",
      objective: "Check whether the generated operator behaves consistently with the source artifact.",
      metric: "agreement_rate_with_reference_cases",
      baseline: "non-operatorized prompt or generic heuristic",
      expectedEvidence: `Operator decisions preserve: ${kernel.label}.`
    },
    {
      id: "bench_invariant_preservation",
      name: "Invariant preservation test",
      objective: "Check whether runtime decisions violate the invariant kernel.",
      metric: "invariant_violation_count",
      baseline: "unconstrained transformation",
      expectedEvidence: "Zero critical invariant violations on safety-critical cases."
    },
    {
      id: "bench_trace_completeness",
      name: "Trace completeness test",
      objective: "Check whether every activation and rejection emits a complete explanation trace.",
      metric: "required_trace_field_coverage",
      baseline: "untraced operator call",
      expectedEvidence: "All required trace fields are populated."
    }
  ];

  if (source.sourceKind === "optimization_method" || /optimum|optimization|bound/i.test(source.title)) {
    tasks.push({
      id: "bench_safe_region_cut",
      name: "Safe region-cut test",
      objective: "Verify that the operator cuts only regions whose bound proves no possible improvement.",
      metric: "unsafe_cut_count",
      baseline: "naive region pruning without proof guard",
      expectedEvidence: "No region containing the true global optimum is cut."
    });
  }

  return tasks;
}

export function generateOperatorBlueprint(
  source: SourceArtifact,
  kernel: InvariantKernel,
  runtimeContract: RuntimeContract,
  safetyGuards: SafetyGuard[],
  traceContract: TraceContract,
  benchmarkScaffold: BenchmarkTask[],
  maturityScore: number
): OperatorBlueprint {
  const nameCore = toPascalCase(source.title.replace(/operator$/i, ""));
  const operatorName = nameCore.endsWith("Operator") ? nameCore : `${nameCore}Operator`;

  return {
    id: `omega_${toSnakeCase(source.title)}`,
    symbol: `Ω_${toSymbolSlug(source.title)}`,
    name: operatorName,
    category: `${source.sourceKind}_operatorized_by_prime_tb_mother_cut`,
    generatedFrom: source.title,
    sourceKind: source.sourceKind,
    maturity: maturityFromScore(maturityScore, safetyGuards),
    invariantKernel: kernel,
    runtimeContract,
    safetyGuards,
    traceContract,
    benchmarkScaffold,
    interpretationBoundaries: [
      "This is an operator blueprint unless implemented and tested in a concrete runtime.",
      "The operator must not be used beyond the domain assumptions of the source artifact.",
      "A conceptual source remains conceptual until proof, empirical evidence, or benchmarks support it.",
      "All cuts, transformations, or exclusions must preserve the invariant kernel."
    ]
  };
}

export function computeOperatorMaturityScore(
  kernel: InvariantKernel,
  atoms: OperationalAtom[],
  runtimeContract: RuntimeContract,
  safetyGuards: SafetyGuard[],
  traceContract: TraceContract,
  benchmarkScaffold: BenchmarkTask[]
): number {
  let score = 0;

  score += 0.22 * kernel.confidence;
  score += 0.14 * normalizeScore(atoms.filter((atom) => atom.required).length);
  score += 0.14 * (runtimeContract.activationCondition.length > 0 ? 1 : 0);
  score += 0.14 * (runtimeContract.inputSchema.length > 0 && runtimeContract.outputSchema.length > 0 ? 1 : 0);
  score += 0.14 * (safetyGuards.every((guard) => guard.passed || guard.severity !== "blocking") ? 1 : 0.35);
  score += 0.11 * normalizeScore(traceContract.fields.filter((field) => field.required).length);
  score += 0.11 * normalizeScore(benchmarkScaffold.length);

  return Number(Math.min(1, score).toFixed(4));
}

export function buildRecompositionNote(
  source: SourceArtifact,
  blueprint: OperatorBlueprint,
  maturityScore: number
): string {
  return [
    `Prime-TB Mother Cut generated ${blueprint.name} from ${source.title}.`,
    `Maturity: ${blueprint.maturity}.`,
    `Maturity score: ${maturityScore}.`,
    `The generated operator is valid only if it preserves: ${blueprint.invariantKernel.label}.`
  ].join(" ");
}

export function inferEvidenceLevel(source: SourceArtifact): EvidenceLevel {
  const text = [source.title, ...source.statements, ...(source.knownProofOrEvidence ?? [])].join(" ").toLowerCase();

  if (containsAny(text, ["proof", "proved", "theorem", "lemma", "corollary"])) {
    return "formal_proof";
  }

  if (containsAny(text, ["published", "established", "known theorem"])) {
    return "published_theorem";
  }

  if (containsAny(text, ["benchmark", "experiment", "evaluation"])) {
    return "benchmark_evidence";
  }

  if (containsAny(text, ["observed", "empirical", "measurement"])) {
    return "empirical_evidence";
  }

  if (containsAny(text, ["hypothesis", "conceptual", "proposal"])) {
    return "conceptual_hypothesis";
  }

  return "unknown";
}

export function scoreEvidence(level: EvidenceLevel, base: number): number {
  const bonus: Record<EvidenceLevel, number> = {
    formal_proof: 0.08,
    published_theorem: 0.06,
    empirical_evidence: 0.04,
    benchmark_evidence: 0.04,
    domain_expert_rule: 0.02,
    conceptual_hypothesis: -0.06,
    unknown: -0.04
  };

  return Number(clamp(base + bonus[level], 0, 1).toFixed(4));
}

export function pickEvidence(source: SourceArtifact, keywords: string[]): string[] {
  const candidates = [
    ...source.statements,
    ...(source.axiomsOrAssumptions ?? []),
    ...(source.knownProofOrEvidence ?? [])
  ];

  if (keywords.length === 0) {
    return candidates.slice(0, 4);
  }

  const selected = candidates.filter((item) =>
    keywords.some((keyword) => item.toLowerCase().includes(keyword.toLowerCase()))
  );

  return (selected.length > 0 ? selected : candidates).slice(0, 6);
}

export function containsAny(text: string, patterns: string[]): boolean {
  return patterns.some((pattern) => text.includes(pattern.toLowerCase()));
}

export function normalizeScore(value: number): number {
  return Number((value / (1 + value)).toFixed(4));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function slugLabel(text: string, fallback: string): string {
  const slug = toSnakeCase(text).slice(0, 48);
  return slug.length > 0 ? slug : fallback;
}

export function toSnakeCase(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

export function toPascalCase(text: string): string {
  const cleaned = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim();

  if (cleaned.length === 0) {
    return "Generated";
  }

  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function toSymbolSlug(text: string): string {
  return toSnakeCase(text)
    .split("_")
    .filter(Boolean)
    .slice(0, 4)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function maturityFromScore(score: number, guards: SafetyGuard[]): OperatorMaturity {
  const hasBlockingFailure = guards.some((guard) => guard.severity === "blocking" && !guard.passed);

  if (hasBlockingFailure || score < 0.35) {
    return "insufficient_source";
  }

  if (score < 0.55) {
    return "conceptual_blueprint";
  }

  if (score < 0.72) {
    return "runtime_ready_blueprint";
  }

  if (score < 0.84) {
    return "implemented_reference";
  }

  if (score < 0.94) {
    return "benchmarked_operator";
  }

  return "validated_operator";
}

/**
 * Example: converting Tuy's Cut from a global optimization technique
 * into a runtime-ready operator blueprint.
 */
export const exampleTuyCutSource: SourceArtifact = {
  title: "Tuy Global Optimization Cut",
  sourceKind: "optimization_method",
  evidenceLevel: "published_theorem",
  domainContext: "Global optimization and safe region pruning.",
  statements: [
    "A candidate region can be eliminated if a valid bound proves that it cannot contain a better global optimum.",
    "The cut must preserve the true global optimum.",
    "The method depends on bounding, incumbent comparison, and safe exclusion of non-promising regions."
  ],
  axiomsOrAssumptions: [
    "The objective is defined on the candidate region.",
    "The bound oracle returns a valid lower bound for minimization or a valid upper bound for maximization.",
    "The incumbent value is a valid value of a feasible solution."
  ],
  knownProofOrEvidence: [
    "If lower_bound(S) >= incumbent_best_value in a minimization problem, then S cannot contain a better solution than the incumbent.",
    "A region must not be cut unless the bound relation is valid under the assumptions of the problem."
  ],
  preconditions: [
    "candidate_region S is available",
    "incumbent_best_value is available",
    "valid bound for S is available"
  ],
  stateVariables: [
    "candidate_region",
    "lower_bound",
    "incumbent_best_value",
    "proof_status",
    "cut_decision"
  ],
  transitionRules: [
    "If proof_status is valid and lower_bound(S) >= incumbent_best_value, then cut S.",
    "If proof_status is missing or lower_bound(S) < incumbent_best_value, then keep or branch S."
  ],
  failureCases: [
    "unsafe_cut: S is removed without a valid bound proof",
    "invalid_bound: the bound oracle violates the problem assumptions",
    "missing_trace: a cut decision is made without explanation"
  ]
};

export const exampleTuyCutOperator = omegaPrimeTBMotherCut(exampleTuyCutSource);

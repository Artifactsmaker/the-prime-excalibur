
/**
 * ECO — Entropy Collapse Operator
 * Full O.i / A.i Stack Specification
 * Version: 1.0.0
 */

export type SpaceType = "symbolic" | "numeric" | "graph" | "token" | "latent" | "hybrid";
export type OperatorClass = "meta_operator" | "constraint_operator" | "collapse_operator" | "routing_operator";
export type CollapseMode = "OPEN" | "BOUND" | "COLLAPSE" | "ADAPT";
export type MetricKind =
  | "genus"
  | "branching_factor"
  | "curvature"
  | "entropy"
  | "distance_to_fixed_point"
  | "semantic_dispersion"
  | "custom";
export type RuntimeTarget =
  | "llm_inference"
  | "planner"
  | "symbolic_solver"
  | "retrieval"
  | "agent"
  | "operator_runtime"
  | "isa_chip";

export interface Identity {
  id: string;
  shortName: string;
  fullName: string;
  family: string;
  version: string;
  status: "draft" | "experimental" | "stable";
  authorship: string[];
  license: string;
}

export interface Intent {
  objective: string;
  problemStatement: string;
  designRationale: string;
  publicSummary: string;
}

export interface Classification {
  operatorClass: OperatorClass;
  isMetaOperator: boolean;
  isDerivedFromFixedPointLaw: boolean;
  parentLaw: string;
}

export interface Mathematics {
  coreSymbol: string;
  coreDefinition: string;
  entropyDefinition: {
    id: string;
    description: string;
    formula: string;
    estimator: string;
    boundedByStructure: boolean;
  };
  fixedPointLaw: {
    symbol: string;
    statement: string;
    fixedPointSet: string;
    basinDefinition: string;
    operationalMeaning: string;
  };
  structuralMetrics: Array<{
    id: string;
    kind: MetricKind;
    description: string;
    formula?: string;
    lowerIsBetter: boolean;
    thresholdRef: string;
  }>;
  thresholds: {
    structuralThreshold: string;
    entropyThreshold: string;
    fixedPointTolerance: string;
    adaptive: boolean;
    updatePolicy: string;
  };
}

export interface Semantics {
  axioms: string[];
  propositions: string[];
  theoremSketches: string[];
  convergenceStatement: string;
}

export interface PipelineStep {
  step: number;
  id: string;
  name: string;
  description: string;
  inputRef: string;
  outputRef: string;
}

export interface MappingRow {
  layer?: string;
  role: string;
  relationToOperator?: string;
  runtimeTargets?: RuntimeTarget[];
  aiRole?: string;
  effectOnHypotheses?: string;
  effectOnSearch?: string;
  effectOnHallucination?: string;
  effectOnLatency?: string;
}

export interface ISAInstruction {
  mnemonic: string;
  syntax: string;
  modes: string[];
  sourceRegisters: string[];
  destinationRegisters: string[];
  sideEffects: string[];
}

export interface BenchmarkProfile {
  scenario: string;
  baselineSystems: string[];
  metrics: Array<{
    name: string;
    symbol: string;
    meaning: string;
    targetDirection: "lower" | "higher";
  }>;
  expectedEffects: string[];
}

export interface SafetyGuard {
  id: string;
  condition: string;
  action: string;
  reason: string;
}

export interface DeploymentNotes {
  compilerView: string;
  runtimeView: string;
  chipView: string;
  observability: string[];
}

export interface OperatorSpec {
  identity: Identity;
  intent: Intent;
  classification: Classification;
  mathematics: Mathematics;
  semantics: Semantics;
  pipeline: PipelineStep[];
  oiMapping: MappingRow[];
  aiMapping: MappingRow;
  isaMapping: ISAInstruction;
  benchmarkProfile: BenchmarkProfile;
  safetyGuards: SafetyGuard[];
  deploymentNotes: DeploymentNotes;
  metadata: Record<string, string | number | boolean>;
}

export const ECO: OperatorSpec = {
  identity: {
    id: "oi.operator.eco.v1",
    shortName: "ECO",
    fullName: "Entropy Collapse Operator",
    family: "Operator Intelligence / Adaptive Intelligence",
    version: "1.0.0",
    status: "stable",
    authorship: ["Trung Bom", "GPT"],
    license: "Proprietary-ready / research specification"
  },
  intent: {
    objective:
      "Reduce entropy of the active possibility space before expensive reasoning, search, or decoding.",
    problemStatement:
      "Unbounded search spaces create combinatorial explosion, weak hypotheses, and unstable execution.",
    designRationale:
      "Collapse admissible space toward the attraction basin of the governing fixed-point law.",
    publicSummary:
      "ECO filters the space of possibilities so only states compatible with convergence remain active."
  },
  classification: {
    operatorClass: "meta_operator",
    isMetaOperator: true,
    isDerivedFromFixedPointLaw: true,
    parentLaw: "U(x) = x"
  },
  mathematics: {
    coreSymbol: "ECO = Projection onto B(U)",
    coreDefinition:
      "E_U(X) = { x in X | x belongs to the attraction basin of Fix(U), or approximately satisfies d(x, Fix(U)) < epsilon }",
    entropyDefinition: {
      id: "entropy.distance_to_stability",
      description: "Operational entropy is modeled as distance from structural stability.",
      formula: "H_U(x) = d(x, Fix(U))",
      estimator: "Domain-specific metric over symbolic, graph, token, or latent states",
      boundedByStructure: true
    },
    fixedPointLaw: {
      symbol: "U(x) = x",
      statement: "A state is stable when repeated application of the governing law leaves it invariant.",
      fixedPointSet: "Fix(U) = { x | U(x) = x }",
      basinDefinition: "B(U) = { x | lim_{k->infinity} U^k(x) in Fix(U) }",
      operationalMeaning: "Only states inside or near the basin of Fix(U) remain admissible."
    },
    structuralMetrics: [
      {
        id: "metric.structural_complexity",
        kind: "custom",
        description: "Aggregate complexity over the active search space.",
        formula: "mu(X) = weighted_sum(branching_factor, dispersion, instability, inconsistency)",
        lowerIsBetter: true,
        thresholdRef: "thresholds.structuralThreshold"
      },
      {
        id: "metric.distance_to_fixed_point",
        kind: "distance_to_fixed_point",
        description: "Distance from current state or region to fixed-point stability.",
        formula: "d(x, Fix(U))",
        lowerIsBetter: true,
        thresholdRef: "thresholds.fixedPointTolerance"
      },
      {
        id: "metric.semantic_dispersion",
        kind: "semantic_dispersion",
        description: "Spread among active candidate hypotheses.",
        lowerIsBetter: true,
        thresholdRef: "thresholds.entropyThreshold"
      }
    ],
    thresholds: {
      structuralThreshold: "domain_configurable",
      entropyThreshold: "domain_configurable",
      fixedPointTolerance: "domain_configurable",
      adaptive: true,
      updatePolicy: "Update thresholds from runtime traces, convergence error, and validation history."
    }
  },
  semantics: {
    axioms: [
      "Not every reachable state is equally admissible.",
      "Structural complexity constrains persistence of possibility.",
      "Fixed-point laws define stable existence.",
      "Finite-resource systems require admissibility filtering."
    ],
    propositions: [
      "If E(X) is a subset of X, entropy cannot increase under subset collapse.",
      "If E(X) subseteq B(U), convergence becomes more tractable than unrestricted exploration."
    ],
    theoremSketches: [
      "Necessity of ECO: finite-resource convergence toward Fix(U) implies existence of a filtering operator E(X) subseteq B(U).",
      "Entropy reduction: H(E(X)) <= H(X) for monotonic subset collapse."
    ],
    convergenceStatement:
      "ECO improves convergence conditions by shrinking the active space toward admissible basins."
  },
  pipeline: [
    { step: 1, id: "measure_structure", name: "Measure Structure", description: "Estimate structural complexity and dispersion.", inputRef: "raw_space", outputRef: "measured_space" },
    { step: 2, id: "estimate_entropy", name: "Estimate Entropy", description: "Approximate entropy relative to Fix(U).", inputRef: "measured_space", outputRef: "entropy_profile" },
    { step: 3, id: "select_mode", name: "Select Mode", description: "Choose OPEN, BOUND, COLLAPSE, or ADAPT.", inputRef: "entropy_profile", outputRef: "control_policy" },
    { step: 4, id: "apply_collapse", name: "Apply Collapse", description: "Prune weak or structurally inadmissible states.", inputRef: "control_policy", outputRef: "collapsed_space" }
  ],
  oiMapping: [
    { layer: "law", role: "U defines stable existence.", relationToOperator: "ECO is derived from the fixed-point law." },
    { layer: "meta_operator", role: "Controls admissibility of possibility space.", relationToOperator: "ECO occupies this layer directly." },
    { layer: "operator", role: "Task-specific operators execute after collapse.", relationToOperator: "Operators run on the reduced space." },
    { layer: "state", role: "Concrete states, nodes, tokens, or vectors.", relationToOperator: "States are filtered by ECO." }
  ],
  aiMapping: {
    runtimeTargets: ["llm_inference", "planner", "symbolic_solver", "retrieval", "agent", "operator_runtime", "isa_chip"],
    role: "Pre-inference admissibility controller.",
    aiRole: "Filters weak hypotheses before expensive reasoning or decoding.",
    effectOnHypotheses: "Removes semantically inconsistent or structurally unstable candidates.",
    effectOnSearch: "Reduces branching and active search width.",
    effectOnHallucination: "Suppresses unsupported continuations distant from fixed-point consistency.",
    effectOnLatency: "Can reduce end-to-end cost when thresholds are well tuned."
  },
  isaMapping: {
    mnemonic: "ECO",
    syntax: "ECO src, metric, threshold, dst -> mode",
    modes: ["OPEN", "BOUND", "COLLAPSE", "ADAPT"],
    sourceRegisters: ["Rsrc", "Rmetric", "Rtheta"],
    destinationRegisters: ["Rdst", "Rmode", "RdeltaH"],
    sideEffects: [
      "update active search mask",
      "reduce branch fan-out",
      "evict weak hypotheses from fast memory",
      "emit adaptive trace"
    ]
  },
  benchmarkProfile: {
    scenario: "Compare brute-force search, heuristic pruning, and ECO-guided execution.",
    baselineSystems: ["brute_force_search", "heuristic_pruning", "beam_search"],
    metrics: [
      { name: "Branching Factor", symbol: "N", meaning: "Average active branches per step.", targetDirection: "lower" },
      { name: "Operational Entropy", symbol: "H", meaning: "Entropy of active possibility space.", targetDirection: "lower" },
      { name: "Convergence Time", symbol: "T", meaning: "Time or steps until stable termination.", targetDirection: "lower" },
      { name: "Task Validity", symbol: "V", meaning: "Fraction of outputs satisfying constraints.", targetDirection: "higher" }
    ],
    expectedEffects: [
      "Lower branching than brute-force baselines.",
      "Lower mid-stage entropy.",
      "Faster convergence on constrained workloads."
    ]
  },
  safetyGuards: [
    {
      id: "guard.no_premature_collapse",
      condition: "collapse confidence below minimum floor",
      action: "fallback to BOUND or OPEN",
      reason: "Avoid deleting rare but valid paths."
    },
    {
      id: "guard.overcompression",
      condition: "active space below minimum viable size",
      action: "re-expand from bounded buffer",
      reason: "Maintain recoverability."
    }
  ],
  deploymentNotes: {
    compilerView: "Schedule ECO before expensive operator blocks or decoding stages.",
    runtimeView: "Instrument entropy, branch count, and collapse confidence.",
    chipView: "Implement as front-end admissibility controller with branch masking.",
    observability: ["delta_entropy", "active_branch_count", "collapse_mode_frequency", "recovery_events"]
  },
  metadata: {
    language: "English",
    domain: "O.i / A.i",
    operatorRole: "meta_operator",
    visibility: "public-spec / private-implementation"
  }
};

export default ECO;
